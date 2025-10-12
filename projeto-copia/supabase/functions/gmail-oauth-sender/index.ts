import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

/**
 * Gmail OAuth Sender - Server-Side Edge Function
 * Securely handles Gmail OAuth and sends emails without exposing credentials to frontend
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get OAuth credentials from server environment (NOT VITE_ vars!)
    const clientId = Deno.env.get('GMAIL_CLIENT_ID');
    const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');
    const refreshToken = Deno.env.get('GMAIL_REFRESH_TOKEN');

    if (!clientId || !clientSecret || !refreshToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Gmail OAuth not configured. Please set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN in Supabase Edge Function secrets.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    const { to, subject, body, isHtml = false } = await req.json() as EmailRequest;

    // Step 1: Exchange refresh token for access token
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Failed to get access token:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: `OAuth token exchange failed: ${error}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 2: Create email message in RFC 2822 format
    const contentType = isHtml ? 'text/html' : 'text/plain';
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: ${contentType}; charset=utf-8`,
      '',
      body
    ].join('\n');

    // Encode to base64url (URL-safe base64)
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const base64 = btoa(String.fromCharCode(...data))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Step 3: Send email via Gmail API
    const gmailUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
    const gmailResponse = await fetch(gmailUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64
      })
    });

    if (!gmailResponse.ok) {
      const error = await gmailResponse.text();
      console.error('Gmail API error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Gmail API error: ${error}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    const gmailData = await gmailResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        messageId: gmailData.id,
        to,
        subject
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in gmail-oauth-sender:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
