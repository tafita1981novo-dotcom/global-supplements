/**
 * Gmail OAuth Service
 * Handles email sending via Gmail API using OAuth 2.0
 */

import credentialsService from './credentialsService';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

interface GmailOAuthConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

class GmailOAuthService {
  private config: GmailOAuthConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    const clientId = credentialsService.getGmailClientID();
    const clientSecret = credentialsService.getGmailClientSecret();
    const refreshToken = credentialsService.getGmailRefreshToken();

    if (clientId && clientSecret && refreshToken) {
      this.config = { clientId, clientSecret, refreshToken };
    }
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  getConfigStatus() {
    return {
      hasClientId: !!credentialsService.getGmailClientID(),
      hasClientSecret: !!credentialsService.getGmailClientSecret(),
      hasRefreshToken: !!credentialsService.getGmailRefreshToken(),
      isReady: this.isConfigured()
    };
  }

  /**
   * Get access token from refresh token
   */
  private async getAccessToken(): Promise<string> {
    if (!this.config) {
      throw new Error('Gmail OAuth not configured. Please set up credentials in /credentials-manager');
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Create email in RFC 2822 format
   */
  private createEmailMessage(options: EmailOptions): string {
    const { to, subject, body, isHtml } = options;

    const contentType = isHtml ? 'text/html' : 'text/plain';
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: ${contentType}; charset=utf-8`,
      '',
      body
    ].join('\n');

    // Encode to base64url
    return btoa(message)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Send email via Gmail API
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Gmail OAuth not configured. Please complete setup in /credentials-manager'
        };
      }

      const accessToken = await this.getAccessToken();
      const encodedMessage = this.createEmailMessage(options);

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: encodedMessage
        })
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Gmail API error: ${error}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.id
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
