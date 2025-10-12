import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Activity, DollarSign, TrendingUp, Users, Globe, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import B2BBuyerCenter from '@/components/dashboard/B2BBuyerCenter';

interface AutomationResult {
  timestamp: string;
  steps: Array<{
    step: number;
    name: string;
    status: string;
    data?: any;
    error?: string;
  }>;
}

export default function AutomationDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<AutomationResult | null>(null);
  const { toast } = useToast();
  const [stats, setStats] = useState({
    total_buyers: 0,
    active_negotiations: 0,
    total_commission: 0,
    success_rate: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: buyers } = await supabase
        .from('b2b_buyers')
        .select('*', { count: 'exact' });
      
      const { data: negotiations } = await supabase
        .from('negotiations')
        .select('*')
        .eq('status', 'active');

      setStats({
        total_buyers: buyers?.length || 0,
        active_negotiations: negotiations?.length || 0,
        total_commission: 0,
        success_rate: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const runFullAutomation = async () => {
    setIsRunning(true);
    try {
      toast({
        title: "🚀 Iniciando Automação 24/7",
        description: "Pipeline completo: Busca buyers → Matching → Negociação GPT-4",
      });

      const { data, error } = await supabase.functions.invoke('automation-scheduler', {
        body: { action: 'run_full_pipeline' }
      });

      if (error) throw error;

      const result = {
        timestamp: data.results?.timestamp || new Date().toISOString(),
        steps: data.results?.steps || []
      };

      setLastResult(result);
      await loadStats();

      toast({
        title: "✅ Automação Completa!",
        description: `${result.steps.length} etapas executadas com sucesso`,
      });
    } catch (error: any) {
      toast({
        title: "Erro na Automação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            Automação 24/7 - Broker Inteligente
          </h1>
          <p className="text-muted-foreground mt-2">
            Sistema completo: Busca buyers globais → Matching IA → Negociação GPT-4 Multi-idioma
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadStats}
            variant="outline"
            disabled={isRunning}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button
            onClick={runFullAutomation}
            size="lg"
            disabled={isRunning}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Rodar Automação Completa
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_buyers}</div>
            <p className="text-xs text-muted-foreground">
              Detectados globalmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negociações Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_negotiations}</div>
            <p className="text-xs text-muted-foreground">
              Em andamento com IA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissão Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.total_commission.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue acumulado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.success_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Deals completados
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="buyers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buyers">
            <Users className="mr-2 h-4 w-4" />
            B2B Buyers
          </TabsTrigger>
          <TabsTrigger value="pipeline">
            <Activity className="mr-2 h-4 w-4" />
            Pipeline Status
          </TabsTrigger>
          <TabsTrigger value="results">
            <TrendingUp className="mr-2 h-4 w-4" />
            Últimos Resultados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buyers" className="mt-6">
          <B2BBuyerCenter />
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline de Automação</CardTitle>
              <CardDescription>
                Fluxo completo: Amazon Data → B2B Detection → Matching → Negociação GPT-4
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lastResult ? (
                <div className="space-y-4">
                  {lastResult.steps.map((step) => (
                    <div key={step.step} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'success' ? 'bg-green-100 text-green-600' :
                          step.status === 'error' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {step.step}
                        </div>
                        <div>
                          <p className="font-semibold">{step.name}</p>
                          {step.error && <p className="text-sm text-red-600">{step.error}</p>}
                        </div>
                      </div>
                      <Badge className={
                        step.status === 'success' ? 'bg-green-500' :
                        step.status === 'error' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }>
                        {step.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Clique em "Rodar Automação Completa" para iniciar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Últimos Resultados</CardTitle>
              <CardDescription>
                Timestamp: {lastResult?.timestamp || 'Nenhuma execução ainda'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lastResult ? (
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(lastResult, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Globe className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Aguardando primeira execução...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
