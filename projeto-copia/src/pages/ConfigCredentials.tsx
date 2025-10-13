import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, CheckCircle, ExternalLink, Zap, Globe, Save, ChevronDown, ChevronUp, Clock, BookOpen } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  setup_steps?: string[];
  api_docs_url?: string;
  estimated_time_minutes?: number;
  signup_url?: string;
  revenue_priority?: number;
  monthly_revenue_potential?: string;
  ease_of_entry?: string;
}

export default function ConfigCredentials() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<number, string>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('rfq_api_credentials')
        .select('*')
        .order('revenue_priority', { ascending: true });

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

  // Agrupar por TIER de REVENUE
  const groupedByTier = credentials.reduce((acc, cred) => {
    const priority = cred.revenue_priority || 100;
    let tier = 'Tier 5: Nicho/Especializado';
    
    if (priority <= 10) tier = '💎 Tier 1: MAIOR ROI + Fácil Entrada';
    else if (priority <= 30) tier = '🥇 Tier 2: Bom ROI + Setup Médio';
    else if (priority <= 40) tier = '🏆 Tier 3: Enterprise/High Ticket';
    else if (priority <= 50) tier = '🏛️ Tier 4: Government High Value';
    
    if (!acc[tier]) {
      acc[tier] = [];
    }
    acc[tier].push(cred);
    return acc;
  }, {} as Record<string, Credential[]>);

  // Ordem dos tiers (já ordenado por revenue_priority)
  const tierOrder = [
    '💎 Tier 1: MAIOR ROI + Fácil Entrada',
    '🥇 Tier 2: Bom ROI + Setup Médio', 
    '🏆 Tier 3: Enterprise/High Ticket',
    '🏛️ Tier 4: Government High Value',
    'Tier 5: Nicho/Especializado'
  ];
  const sortedTiers = Object.keys(groupedByTier).sort((a, b) => {
    return tierOrder.indexOf(a) - tierOrder.indexOf(b);
  });

  // Ícones de facilidade
  const easeIcons: Record<string, string> = {
    'Free': '🆓',
    'Easy': '✅',
    'Medium': '⚙️',
    'Hard': '🔒'
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
        {sortedTiers.map((tier) => {
          const tierCreds = groupedByTier[tier];
          const tierConfigured = tierCreds.filter(c => c.is_configured).length;
          const tierTotal = tierCreds.length;
          const tierRFQs = tierCreds.filter(c => c.is_configured).reduce((sum, c) => sum + c.estimated_rfqs_unlocked, 0);
          const tierRevenue = tierCreds.filter(c => c.is_configured).reduce((sum, c) => {
            const rev = c.monthly_revenue_potential?.match(/\$([\d.]+)([KM])/);
            if (rev) {
              const val = parseFloat(rev[1]);
              const mult = rev[2] === 'M' ? 1000 : 1;
              return sum + (val * mult);
            }
            return sum;
          }, 0);
          
          return (
            <div key={tier} className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{tier}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tierConfigured}/{tierTotal} configuradas • {tierRFQs.toLocaleString()} RFQs/dia
                    {tierRevenue > 0 && <> • <span className="font-bold text-green-600">${tierRevenue.toFixed(0)}K/mês desbloqueados</span></>}
                  </p>
                </div>
              </div>
              
              {tierCreds.map((credential) => {
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
                            {credential.monthly_revenue_potential && (
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-bold text-green-600">
                                  💰 {credential.monthly_revenue_potential}
                                </span>
                              </div>
                            )}
                            {credential.ease_of_entry && (
                              <Badge variant={credential.ease_of_entry === 'Free' ? 'default' : 'secondary'} className={
                                credential.ease_of_entry === 'Free' ? 'bg-green-600' :
                                credential.ease_of_entry === 'Easy' ? 'bg-blue-600' :
                                credential.ease_of_entry === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
                              }>
                                {easeIcons[credential.ease_of_entry]} {credential.ease_of_entry}
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              +{credential.estimated_rfqs_unlocked.toLocaleString()} RFQs/dia
                            </span>
                            {credential.countries && credential.countries.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                <span className="text-xs font-medium text-blue-600">
                                  {credential.countries.slice(0, 3).join(', ')}{credential.countries.length > 3 ? '...' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <a
                          href={credential.signup_url || credential.setup_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          🚀 Criar Conta Aqui <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Passo a Passo */}
                      {credential.setup_steps && credential.setup_steps.length > 0 && (
                        <Collapsible 
                          open={expandedSteps[credential.id]} 
                          onOpenChange={(open) => setExpandedSteps(prev => ({ ...prev, [credential.id]: open }))}
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-900 dark:text-blue-100">
                                📋 Como Obter esta API Key
                              </span>
                              {credential.estimated_time_minutes && (
                                <Badge variant="outline" className="ml-2">
                                  <Clock className="h-3 w-3 mr-1" />
                                  ~{credential.estimated_time_minutes} min
                                </Badge>
                              )}
                            </div>
                            {expandedSteps[credential.id] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <div className="bg-muted p-4 rounded-lg space-y-2">
                              {credential.setup_steps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <span className="text-sm font-mono text-muted-foreground min-w-fit">{step.split('.')[0]}.</span>
                                  <p className="text-sm">{step.substring(step.indexOf('.') + 1).trim()}</p>
                                </div>
                              ))}
                              <div className="mt-3 pt-3 border-t">
                                <a
                                  href={credential.signup_url || credential.setup_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium w-full justify-center"
                                >
                                  ✅ Criar Conta Agora <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                      
                      {/* Campo de Input e Botão Salvar */}
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
                      
                      {/* Fontes Desbloqueadas */}
                      {credential.required_for_sources.length > 0 && (
                        <div className="flex flex-wrap gap-1">
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
