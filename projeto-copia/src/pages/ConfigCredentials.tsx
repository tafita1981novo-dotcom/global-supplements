import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, CheckCircle, ExternalLink, Zap, Globe } from 'lucide-react';

interface Credential {
  id: number;
  key_name: string;
  key_value: string | null;
  description: string;
  is_configured: boolean;
  required_for_sources: string[];
  estimated_rfqs_unlocked: number;
  setup_url: string;
}

export default function ConfigCredentials() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('rfq_api_credentials')
        .select('*')
        .order('estimated_rfqs_unlocked', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      console.error('Erro ao buscar credenciais:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as credenciais',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (credential: Credential, value: string) => {
    setSaving(credential.key_name);
    try {
      // Salvar no Supabase
      const { error: dbError } = await supabase
        .from('rfq_api_credentials')
        .update({
          key_value: value,
          is_configured: value.length > 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', credential.id);

      if (dbError) throw dbError;

      // Também salvar no secrets do Replit via API
      const response = await fetch('/api/update-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: credential.key_name,
          value: value,
        }),
      });

      if (!response.ok) {
        console.warn('Aviso: Não foi possível salvar no Replit Secrets, mas foi salvo no banco');
      }

      toast({
        title: 'Sucesso!',
        description: `${credential.key_name} configurado com sucesso! ${credential.estimated_rfqs_unlocked.toLocaleString()} RFQs/dia desbloqueados.`,
      });

      // Atualizar estado local
      setCredentials(
        credentials.map((c) =>
          c.id === credential.id ? { ...c, key_value: value, is_configured: value.length > 0 } : c
        )
      );
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a credencial',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  const totalRFQsUnlocked = credentials
    .filter((c) => c.is_configured)
    .reduce((sum, c) => sum + c.estimated_rfqs_unlocked, 0);

  const totalPotentialRFQs = credentials.reduce((sum, c) => sum + c.estimated_rfqs_unlocked, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">⚙️ Configuração de Credenciais</h1>
        <p className="text-muted-foreground">
          Configure as APIs para desbloquear 287,600+ RFQs/dia de 100 fontes globais
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">RFQs Desbloqueados</p>
                <p className="text-2xl font-bold">{totalRFQsUnlocked.toLocaleString()}/dia</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">APIs Configuradas</p>
                <p className="text-2xl font-bold">
                  {credentials.filter((c) => c.is_configured).length}/{credentials.length}
                </p>
              </div>
              <Key className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Potencial Total</p>
                <p className="text-2xl font-bold">{totalPotentialRFQs.toLocaleString()}/dia</p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credentials List */}
      <div className="space-y-4">
        {credentials.map((credential) => (
          <Card key={credential.id} className={credential.is_configured ? 'border-green-500' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {credential.is_configured && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {credential.key_name}
                  </CardTitle>
                  <CardDescription className="mt-2">{credential.description}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    +{credential.estimated_rfqs_unlocked.toLocaleString()} RFQs/dia
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {credential.required_for_sources.length} fonte(s)
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor={credential.key_name}>Valor da API Key</Label>
                    <Input
                      id={credential.key_name}
                      type="password"
                      placeholder={
                        credential.key_name.includes('MOBILE')
                          ? '+91-XXXXXXXXXX'
                          : 'Cole sua API key aqui...'
                      }
                      defaultValue={credential.key_value || ''}
                      onBlur={(e) => {
                        if (e.target.value !== credential.key_value) {
                          handleSave(credential, e.target.value);
                        }
                      }}
                      disabled={saving === credential.key_name}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(credential.setup_url, '_blank')}
                      title="Abrir página de setup"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Fontes que usam essa credencial */}
                <div className="flex flex-wrap gap-2">
                  {credential.required_for_sources.map((source) => (
                    <span
                      key={source}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card className="mt-8 border-blue-500">
        <CardHeader>
          <CardTitle>💡 Como Obter as Credenciais?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">🇮🇳 IndiaMART (10,000 RFQs/dia):</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Acesse indiamart.com e crie conta como Supplier</li>
              <li>Vá em "Dashboard" → "API Integration"</li>
              <li>Copie seu Mobile Number e API Key</li>
              <li>Cole aqui acima ✅</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">🇨🇳 Apify (78,000 RFQs/dia - Alibaba, 1688, etc):</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Acesse apify.com e crie conta (plano $49/mês)</li>
              <li>Vá em "Settings" → "Integrations"</li>
              <li>Copie sua API Key (começa com apify_api_...)</li>
              <li>Cole aqui acima ✅</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">🆓 SAM.gov (1,000 RFQs/dia - GRÁTIS!):</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Acesse sam.gov/api e clique em "Get API Key"</li>
              <li>Cadastro instantâneo, sem custo</li>
              <li>Copie a API Key enviada por email</li>
              <li>Cole aqui acima ✅</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
