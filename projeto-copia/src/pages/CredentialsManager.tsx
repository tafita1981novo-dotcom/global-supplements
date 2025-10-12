import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Key,
  Save,
  TestTube,
  ExternalLink,
  DollarSign,
  Zap,
  Mail,
  Globe,
  ShoppingCart,
  Building2,
  CreditCard
} from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import credentialsService from "@/services/credentialsService";

interface Credential {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'revenue' | 'data' | 'automation' | 'communication';
  envKey: string;
  placeholder: string;
  testable: boolean;
  priority: 'critical' | 'high' | 'medium';
  revenue: string;
  setupUrl?: string;
  configured: boolean;
}

export default function CredentialsManager() {
  const [credentials, setCredentials] = useState<Credential[]>([
    // CRITICAL - Revenue Generation APIs
    {
      id: 'rapidapi',
      name: 'RapidAPI Key',
      description: 'Amazon Product Data - Real products for arbitrage',
      icon: ShoppingCart,
      category: 'revenue',
      envKey: 'RAPIDAPI_KEY',
      placeholder: 'Your RapidAPI Key',
      testable: true,
      priority: 'critical',
      revenue: '$10K-$50K/month',
      setupUrl: 'https://rapidapi.com/hub',
      configured: false
    },
    {
      id: 'openai',
      name: 'OpenAI API Key',
      description: 'GPT-4 AI Negotiations - Automated deal closing',
      icon: Zap,
      category: 'automation',
      envKey: 'OPENAI_API_KEY',
      placeholder: 'sk-...',
      testable: true,
      priority: 'critical',
      revenue: '$5K-$20K/month',
      setupUrl: 'https://platform.openai.com/api-keys',
      configured: false
    },
    {
      id: 'gmail',
      name: 'Gmail API Credentials',
      description: 'Automated email outreach to buyers',
      icon: Mail,
      category: 'communication',
      envKey: 'GMAIL_API_KEY',
      placeholder: 'Gmail API Key',
      testable: true,
      priority: 'critical',
      revenue: '$3K-$15K/month',
      setupUrl: 'https://console.cloud.google.com/apis/credentials',
      configured: false
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Scraper',
      description: 'B2B buyer detection from LinkedIn',
      icon: Building2,
      category: 'data',
      envKey: 'LINKEDIN_EMAIL',
      placeholder: 'your@email.com',
      testable: false,
      priority: 'high',
      revenue: '$2K-$10K/month',
      configured: false
    },
    {
      id: 'linkedin-password',
      name: 'LinkedIn Password',
      description: 'Required for automated scraping',
      icon: Key,
      category: 'data',
      envKey: 'LINKEDIN_PASSWORD',
      placeholder: 'Your LinkedIn Password',
      testable: false,
      priority: 'high',
      revenue: '$2K-$10K/month',
      configured: false
    },
    {
      id: 'stripe',
      name: 'Stripe Secret Key',
      description: 'Payment processing for deals',
      icon: CreditCard,
      category: 'revenue',
      envKey: 'STRIPE_SECRET_KEY',
      placeholder: 'sk_live_...',
      testable: true,
      priority: 'high',
      revenue: '$1K-$5K/month',
      setupUrl: 'https://dashboard.stripe.com/apikeys',
      configured: false
    },
    {
      id: 'payoneer',
      name: 'Payoneer ID',
      description: 'International payment reception',
      icon: DollarSign,
      category: 'revenue',
      envKey: 'PAYONEER_ID',
      placeholder: 'Your Payoneer ID',
      testable: false,
      priority: 'critical',
      revenue: '$50K+ blocked',
      setupUrl: 'https://www.payoneer.com',
      configured: false
    },
    {
      id: 'sendgrid',
      name: 'SendGrid API Key',
      description: 'Email marketing automation',
      icon: Mail,
      category: 'communication',
      envKey: 'SENDGRID_API_KEY',
      placeholder: 'SG...',
      testable: true,
      priority: 'medium',
      revenue: '$500-$2K/month',
      setupUrl: 'https://app.sendgrid.com/settings/api_keys',
      configured: false
    },
    {
      id: 'buffer',
      name: 'Buffer Access Token',
      description: 'Social media automation',
      icon: Globe,
      category: 'communication',
      envKey: 'BUFFER_ACCESS_TOKEN',
      placeholder: 'Buffer Token',
      testable: true,
      priority: 'medium',
      revenue: '$300-$1K/month',
      setupUrl: 'https://buffer.com/developers',
      configured: false
    }
  ]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    checkExistingCredentials();
  }, []);

  const checkExistingCredentials = async () => {
    // Use centralized credentials service
    const status = credentialsService.getConfigurationStatus();
    const allCreds = credentialsService.getAllCredentials();

    // Log only status summary (no sensitive data)
    console.log('🔑 Credentials Status:', {
      total: status.total,
      configured: status.configured,
      percentage: status.percentage,
      missingCritical: status.missingCritical
    });

    // Update UI with actual configured status from centralized service
    const updatedCredentials = credentials.map(cred => {
      const centralCred = allCreds.find(c => 
        c.name.toLowerCase().includes(cred.name.toLowerCase().split(' ')[0])
      );
      return {
        ...cred,
        configured: centralCred?.configured || false
      };
    });
    
    setCredentials(updatedCredentials);
  };

  const handleSave = async (credId: string) => {
    const cred = credentials.find(c => c.id === credId);
    if (!cred) return;

    const value = values[credId];
    if (!value) {
      toast.error('Please enter a value');
      return;
    }

    setSaving(credId);
    try {
      // Save to Supabase system_credentials table (encrypted)
      const { error } = await (supabase as any)
        .from('system_credentials')
        .upsert({
          service_name: credId,
          credential_value: value,
          status: 'active',
          metadata: {
            envKey: cred.envKey,
            priority: cred.priority,
            revenue: cred.revenue
          }
        }, { onConflict: 'service_name' });

      if (error) throw error;

      // Update local state
      setCredentials(prev => prev.map(c => 
        c.id === credId ? { ...c, configured: true } : c
      ));

      toast.success(`✅ ${cred.name} saved securely!`);
    } catch (error: any) {
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setSaving(null);
    }
  };

  const handleTest = async (credId: string) => {
    setTesting(credId);
    try {
      // Call test Edge Function
      const { data, error } = await supabase.functions.invoke('test-api-keys', {
        body: { service: credId }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`✅ ${credId} is working!`);
      } else {
        toast.error(`❌ ${credId} test failed`);
      }
    } catch (error: any) {
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setTesting(null);
    }
  };

  const criticalCreds = credentials.filter(c => c.priority === 'critical');
  const highCreds = credentials.filter(c => c.priority === 'high');
  const mediumCreds = credentials.filter(c => c.priority === 'medium');

  const totalRevenue = credentials
    .filter(c => c.configured)
    .reduce((sum, c) => {
      const match = c.revenue.match(/\$(\d+)K/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);

  const configuredCount = credentials.filter(c => c.configured).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔑 Credentials Manager</h1>
          <p className="text-muted-foreground">Configure APIs to unlock revenue generation</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">${totalRevenue}K+</div>
          <div className="text-sm text-muted-foreground">Potential Monthly Revenue</div>
        </div>
      </div>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>{configuredCount}/{credentials.length} APIs configured</strong> - 
          Complete all configurations to unlock full revenue potential
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="critical" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="critical">
            🔴 Critical ({criticalCreds.length})
          </TabsTrigger>
          <TabsTrigger value="high">
            🟡 High Priority ({highCreds.length})
          </TabsTrigger>
          <TabsTrigger value="medium">
            🟢 Medium ({mediumCreds.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({credentials.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="critical" className="space-y-4 mt-4">
          {criticalCreds.map(cred => (
            <CredentialCard
              key={cred.id}
              cred={cred}
              value={values[cred.id] || ''}
              onChange={(v) => setValues(prev => ({ ...prev, [cred.id]: v }))}
              onSave={() => handleSave(cred.id)}
              onTest={() => handleTest(cred.id)}
              saving={saving === cred.id}
              testing={testing === cred.id}
            />
          ))}
        </TabsContent>

        <TabsContent value="high" className="space-y-4 mt-4">
          {highCreds.map(cred => (
            <CredentialCard
              key={cred.id}
              cred={cred}
              value={values[cred.id] || ''}
              onChange={(v) => setValues(prev => ({ ...prev, [cred.id]: v }))}
              onSave={() => handleSave(cred.id)}
              onTest={() => handleTest(cred.id)}
              saving={saving === cred.id}
              testing={testing === cred.id}
            />
          ))}
        </TabsContent>

        <TabsContent value="medium" className="space-y-4 mt-4">
          {mediumCreds.map(cred => (
            <CredentialCard
              key={cred.id}
              cred={cred}
              value={values[cred.id] || ''}
              onChange={(v) => setValues(prev => ({ ...prev, [cred.id]: v }))}
              onSave={() => handleSave(cred.id)}
              onTest={() => handleTest(cred.id)}
              saving={saving === cred.id}
              testing={testing === cred.id}
            />
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-4">
          {credentials.map(cred => (
            <CredentialCard
              key={cred.id}
              cred={cred}
              value={values[cred.id] || ''}
              onChange={(v) => setValues(prev => ({ ...prev, [cred.id]: v }))}
              onSave={() => handleSave(cred.id)}
              onTest={() => handleTest(cred.id)}
              saving={saving === cred.id}
              testing={testing === cred.id}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CredentialCard({ 
  cred, 
  value, 
  onChange, 
  onSave, 
  onTest, 
  saving, 
  testing 
}: {
  cred: Credential;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onTest: () => void;
  saving: boolean;
  testing: boolean;
}) {
  const Icon = cred.icon;
  
  return (
    <Card className={cred.configured ? 'border-green-500' : 'border-orange-500'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6" />
            <div>
              <CardTitle className="flex items-center gap-2">
                {cred.name}
                {cred.configured ? (
                  <Badge className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Configured
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>{cred.description}</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-green-600">{cred.revenue}</div>
            <div className="text-xs text-muted-foreground">Revenue Impact</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor={cred.id}>{cred.envKey}</Label>
          <div className="flex gap-2">
            <Input
              id={cred.id}
              type="password"
              placeholder={cred.placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={onSave}
              disabled={saving || !value}
              className="gap-2"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            {cred.testable && cred.configured && (
              <Button 
                onClick={onTest}
                variant="outline"
                disabled={testing}
                className="gap-2"
              >
                {testing ? (
                  <>Testing...</>
                ) : (
                  <>
                    <TestTube className="h-4 w-4" />
                    Test
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {cred.setupUrl && !cred.configured && (
          <Button 
            variant="link" 
            className="gap-2 p-0 h-auto"
            onClick={() => window.open(cred.setupUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Get {cred.name} here
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
