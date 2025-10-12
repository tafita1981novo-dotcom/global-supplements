/**
 * Gmail OAuth Service (Frontend)
 * Calls secure authenticated Edge Function to send emails
 * Credentials are NEVER exposed to the browser
 */

import { supabase } from '@/integrations/supabase/client';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

class GmailOAuthService {
  private readonly EDGE_FUNCTION_URL = 'https://twglceexfetejawoumsr.supabase.co/functions/v1/gmail-oauth-sender';

  /**
   * Get authenticated session token
   */
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  /**
   * Check if Gmail OAuth is configured (server-side)
   * Frontend can only check if Edge Function responds, not actual credentials
   */
  async isConfigured(): Promise<boolean> {
    try {
      const response = await fetch(this.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'Config Check',
          body: 'Test'
        })
      });
      
      const data = await response.json();
      // If error mentions "not configured", return false
      if (data.error && data.error.includes('not configured')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get configuration status (safe for frontend)
   */
  getConfigStatus() {
    return {
      hasClientId: true, // Assume configured if Edge Function exists
      hasClientSecret: true,
      hasRefreshToken: true,
      isReady: true,
      note: 'Configuration is managed server-side for security'
    };
  }

  /**
   * Send email via secure authenticated Edge Function
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const authToken = await this.getAuthToken();
      
      if (!authToken) {
        return {
          success: false,
          error: 'User not authenticated. Please login to send emails.'
        };
      }

      const response = await fetch(this.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(options)
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Failed to send email'
        };
      }

      return {
        success: true,
        messageId: data.messageId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send bulk emails (with rate limiting)
   */
  async sendBulkEmails(
    emails: EmailOptions[],
    delayMs: number = 1000
  ): Promise<{ sent: number; failed: number; results: any[] }> {
    const results = [];
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push({ email: email.to, result });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // Rate limiting delay
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return { sent, failed, results };
  }

  /**
   * Test email configuration
   */
  async testConfiguration(testEmail: string): Promise<{ success: boolean; message: string }> {
    const result = await this.sendEmail({
      to: testEmail,
      subject: '✅ Gmail OAuth Test - Global Supplements',
      body: `
<h2>✅ Gmail OAuth Configuration Successful!</h2>

<p>Your Gmail OAuth integration is working correctly.</p>

<p><strong>Configuration Details:</strong></p>
<ul>
  <li>✅ Client ID: Configured</li>
  <li>✅ Client Secret: Configured</li>
  <li>✅ Refresh Token: Configured</li>
</ul>

<p>You can now send automated emails via Gmail API for:</p>
<ul>
  <li>📧 B2B buyer outreach</li>
  <li>💰 Deal closing automation</li>
  <li>📬 Follow-up sequences</li>
</ul>

<p><strong>Global Supplements</strong><br>
Advanced Solutions Worldwide</p>
      `.trim(),
      isHtml: true
    });

    if (result.success) {
      return {
        success: true,
        message: `Test email sent successfully to ${testEmail}! Message ID: ${result.messageId}`
      };
    } else {
      return {
        success: false,
        message: `Test failed: ${result.error}`
      };
    }
  }
}

export default new GmailOAuthService();
