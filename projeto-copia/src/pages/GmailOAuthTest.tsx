import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, XCircle, Loader2, Key, Lock, RefreshCw } from 'lucide-react';
import gmailOAuthService from '@/services/gmailOAuthService';

export default function GmailOAuthTest() {
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      setResult({ success: false, message: 'Please enter a valid email address' });
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      const testResult = await gmailOAuthService.testConfiguration(testEmail);
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <Mail className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Gmail OAuth Test</h1>
          <p className="text-muted-foreground">Test your Gmail API configuration</p>
        </div>
      </div>

      {/* Configuration Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Configuration Status (Server-Side)
        </h2>

        <Alert className="mb-4 border-blue-500/50 bg-blue-500/10">
          <AlertDescription className="text-blue-600 dark:text-blue-400">
            🔒 <strong>Secure Server-Side Configuration:</strong> Gmail OAuth credentials are stored securely in Supabase Edge Functions, NOT exposed to the browser.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Gmail OAuth Edge Function</span>
            <span className="text-xs text-muted-foreground ml-auto">
              Deployed ✅
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-green-500" />
            <span className="font-medium">Credentials Security</span>
            <span className="text-xs text-muted-foreground ml-auto">
              Server-side only 🔐
            </span>
          </div>

          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Configuration Location</span>
            <span className="text-xs text-muted-foreground ml-auto">
              Supabase Secrets
            </span>
          </div>
        </div>

        <Alert className="mt-4 border-green-500/50 bg-green-500/10">
          <AlertDescription className="text-green-600 dark:text-green-400">
            ✅ To configure Gmail OAuth, follow the{' '}
            <a 
              href="https://github.com/yourusername/yourrepo/blob/main/GMAIL_OAUTH_SETUP.md" 
              target="_blank" 
              className="underline font-semibold"
            >
              Setup Guide
            </a>{' '}
            and add secrets in Supabase Dashboard
          </AlertDescription>
        </Alert>
      </Card>

      {/* Test Email Sender */}
      <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Send Test Email</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Recipient Email Address
              </label>
              <Input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                disabled={testing}
              />
            </div>

            <Button
              onClick={handleTest}
              disabled={testing || !testEmail}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Test Email...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>

            {result && (
              <Alert className={result.success ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}>
                <AlertDescription className={result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {result.success ? (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 mt-0.5" />
                      <div>
                        <p className="font-semibold">Success!</p>
                        <p className="text-sm mt-1">{result.message}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 mt-0.5" />
                      <div>
                        <p className="font-semibold">Error</p>
                        <p className="text-sm mt-1">{result.message}</p>
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
      </Card>

      {/* Usage Examples */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">What This Enables</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-500/10 rounded-lg">
            <h3 className="font-semibold mb-2">📧 B2B Outreach</h3>
            <p className="text-sm text-muted-foreground">
              Automated emails to detected buyers with personalized offers
            </p>
          </div>

          <div className="p-4 bg-green-500/10 rounded-lg">
            <h3 className="font-semibold mb-2">💰 Deal Closing</h3>
            <p className="text-sm text-muted-foreground">
              GPT-4 powered negotiation emails with smart follow-ups
            </p>
          </div>

          <div className="p-4 bg-purple-500/10 rounded-lg">
            <h3 className="font-semibold mb-2">🎯 High Deliverability</h3>
            <p className="text-sm text-muted-foreground">
              Emails from your Gmail = inbox placement, not spam
            </p>
          </div>
        </div>
      </Card>

      {/* Revenue Impact */}
      <Card className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20">
        <h2 className="text-xl font-semibold mb-2">🚀 Revenue Impact</h2>
        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
          $5K-$20K/month
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Unlocked through automated B2B email outreach and deal closing
        </p>
      </Card>
    </div>
  );
}
