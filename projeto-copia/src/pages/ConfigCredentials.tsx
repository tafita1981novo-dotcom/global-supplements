import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, CheckCircle, ExternalLink, Zap, Globe, Save } from 'lucide-react';

interface Credential {
  id: number;
  key_name: string;
  key_value: string | null;
  description: string;
  is_configured: boolean;
  required_for_sources: string[];
  estimated_rfqs_unlocked: number;
  setup_url: string;
  countries: string[];
  continent: string;
  region_priority: number;
}

export default function ConfigCredentials() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<number, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('rfq_api_credentials')
        .select('*')
        .order('region_priority', { ascending: true });

      if (error) throw error;
      
      const creds = (data || []) as Credential[];
      setCredentials(creds);
      
      const initialValues: Record<number, string> = {};
      creds.forEach(cred => {
        initialValues[cred.id] = cred.key_value || '';
      });
      setLocalValues(initialValues);
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

  const handleInputChange = (credId: number, value: string) => {
    setLocalValues(prev => ({
      ...prev,
      [credId]: value
    }));
  };

  const handleSave = async (credential: Credential) => {
    const value = localValues[credential.id] || '';
    setSaving(credential.key_name);
    
    try {
      // 1. Salvar no banco de dados
      const { error: dbError } = await (supabase as any)
        .from('rfq_api_credentials')
        .update({
          key_value: value,
          is_configured: value.length > 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', credential.id.toString());

      if (dbError) throw dbError;

      // 2. Registrar no sistema (criar registro de ativação)
      if (value.length > 0) {
        await (supabase as any)
          .from('automation_logs')
          .insert({
            action: 'API_ACTIVATED',
            status: 'success',
            details: {
              api_key: credential.key_name,
              sources_unlocked: credential.required_for_sources,
              rfqs_per_day: credential.estimated_rfqs_unlocked,
              activated_at: new Date().toISOString()
            }
          });
      }

      // 3. Atualizar estado local
      setCredentials(
        credentials.map((c) =>
          c.id === credential.id ? { ...c, key_value: value, is_configured: value.length > 0 } : c
        )
      );

      // 4. Notificar sucesso
      toast({
        title: '✅ API Configurada!',
        description: value.length > 0 
          ? `${credential.key_name} ativada! Sistema iniciará busca em ${credential.required_for_sources.length} fonte(s). +${credential.estimated_rfqs_unlocked.toLocaleString()} RFQs/dia desbloqueados.`
          : `${credential.key_name} removida do sistema.`,
      });

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

  const configuredCount = credentials.filter(c => c.is_configured).length;
  const totalCount = credentials.length;

  // Agrupar por continente
  const groupedByContinent = credentials.reduce((acc, cred) => {
    const continent = cred.continent || 'Global';
    if (!acc[continent]) {
      acc[continent] = [];
    }
    acc[continent].push(cred);
    return acc;
  }, {} as Record<string, Credential[]>);

  // Ordem dos continentes
  const continentOrder = ['Americas', 'Asia', 'Europe', 'Middle East', 'Africa', 'Global'];
  const sortedContinents = Object.keys(groupedByContinent).sort((a, b) => {
    const indexA = continentOrder.indexOf(a);
    const indexB = continentOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  // Ícones de continentes
  const continentIcons: Record<string, string> = {
    'Americas': '🌎',
    'Asia': '🌏',
    'Europe': '🌍',
    'Middle East': '🕌',
    'Africa': '🦁',
    'Global': '🌐'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando todas as credenciais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">⚙️ Configuração de Credenciais - 100 Fontes Globais</h1>
        <p className="text-muted-foreground">
          Configure TODAS as APIs para desbloquear 287,600+ RFQs/dia de 100 fontes globais
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">RFQs Desbloqueados</p>
                <p className="text-2xl font-bold text-green-600">{totalRFQsUnlocked.toLocaleString()}/dia</p>
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
                <p className="text-2xl font-bold text-blue-600">
                  {configuredCount}/{totalCount}
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
                <p className="text-2xl font-bold text-purple-600">{totalPotentialRFQs.toLocaleString()}/dia</p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {sortedContinents.map((continent) => {
          const continentCreds = groupedByContinent[continent];
          const continentConfigured = continentCreds.filter(c => c.is_configured).length;
          const continentTotal = continentCreds.length;
          const continentRFQs = continentCreds.filter(c => c.is_configured).reduce((sum, c) => sum + c.estimated_rfqs_unlocked, 0);
          
          return (
            <div key={continent} className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{continentIcons[continent] || '🌐'}</span>
                  <div>
                    <h2 className="text-xl font-bold">{continent}</h2>
                    <p className="text-sm text-muted-foreground">
                      {continentConfigured}/{continentTotal} configuradas • {continentRFQs.toLocaleString()} RFQs/dia
                    </p>
                  </div>
                </div>
              </div>
              
              {continentCreds.map((credential) => {
                const isConfigured = credential.is_configured;
                const currentValue = localValues[credential.id] || '';
                const hasChanges = currentValue !== (credential.key_value || '');
                
                return (
                  <Card 
                    key={credential.id} 
                    className={`transition-all ${isConfigured ? 'border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-l-4 border-l-gray-300'}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{credential.key_name}</CardTitle>
                            {isConfigured && (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Configurado
                              </Badge>
                            )}
                            {!isConfigured && (
                              <Badge variant="secondary">
                                Pendente
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-sm">{credential.description}</CardDescription>
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <span className="text-sm text-muted-foreground">
                              +{credential.estimated_rfqs_unlocked.toLocaleString()} RFQs/dia
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {credential.required_for_sources.length} fonte(s)
                            </span>
                            {credential.countries && credential.countries.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                <span className="text-sm font-medium text-blue-600">
                                  {credential.countries.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <a
                          href={credential.setup_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                        >
                          Documentação <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={(e) => { e.preventDefault(); handleSave(credential); }} className="flex gap-2">
                        <Input
                          type="password"
                          placeholder={`Cole sua ${credential.key_name} aqui...`}
                          value={currentValue}
                          onChange={(e) => handleInputChange(credential.id, e.target.value)}
                          className="flex-1"
                          autoComplete="off"
                        />
                        <Button
                          type="submit"
                          disabled={saving === credential.key_name || !hasChanges}
                          variant={hasChanges ? "default" : "secondary"}
                        >
                          {saving === credential.key_name ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {hasChanges ? 'Salvar & Ativar' : 'Salvar'}
                            </>
                          )}
                        </Button>
                      </form>
                      {credential.required_for_sources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {credential.required_for_sources.map((source, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          );
        })}
      </div>

      {totalCount === 0 && (
        <Card className="mt-6">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Nenhuma credencial encontrada. Execute as migrations do banco de dados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
