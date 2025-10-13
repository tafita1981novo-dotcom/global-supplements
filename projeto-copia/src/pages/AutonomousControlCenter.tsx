import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Clock, DollarSign, TrendingUp, Activity, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AutonomousControlCenter() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [gptDecisions, setGptDecisions] = useState<any[]>([]);
  const [learningEvents, setLearningEvents] = useState<any[]>([]);
  const [payoneerBalance, setPayoneerBalance] = useState(0);
  const [activeNegotiations, setActiveNegotiations] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh a cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    // Métricas diárias
    const today = new Date().toISOString().split('T')[0];
    const { data: metricsData } = await supabase
      .from('evolution_metrics')
      .select('*')
      .eq('metric_date', today)
      .single();
    setMetrics(metricsData);

    // Decisões GPT-4 recentes
    const { data: decisionsData } = await supabase
      .from('ai_decision_state')
      .select('*, rfq_inbox(*)')
      .order('created_at', { ascending: false })
      .limit(5);
    setGptDecisions(decisionsData || []);

    // Eventos de aprendizado
    const { data: learningData } = await supabase
      .from('learning_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    setLearningEvents(learningData || []);

    // Balanço Payoneer
    const { data: balanceData } = await supabase
      .from('payoneer_transactions')
      .select('balance_after')
      .order('synced_at', { ascending: false })
      .limit(1)
      .single();
    setPayoneerBalance(balanceData?.balance_after || 0);

    // Negociações ativas
    const { data: negotiationsData } = await supabase
      .from('rfq_inbox')
      .select('*')
      .eq('status', 'negotiating')
      .order('created_at', { ascending: false })
      .limit(10);
    setActiveNegotiations(negotiationsData || []);
  };

  const runAutomation = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('automation-scheduler', {
        body: { action: 'run_full_pipeline' }
      });

      if (error) throw error;

      toast({
        title: 'Automação Executada!',
        description: `Pipeline completo executado com sucesso. ${data?.results?.total_rfqs_fetched || 0} RFQs processados.`,
      });

      await loadDashboardData();
    } catch (error: any) {
      toast({
        title: 'Erro na Automação',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getDecisionIcon = (type: string) => {
    switch (type) {
      case 'start_negotiation': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'match_supplier': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'wait': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            Centro de Controle Autônomo
          </h1>
          <p className="text-muted-foreground">GPT-4 controlando toda a operação 24/7</p>
        </div>
        <Button onClick={runAutomation} disabled={isRunning} size="lg" className="gap-2">
          {isRunning ? (
            <>
              <Activity className="h-5 w-5 animate-spin" />
              Executando...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Rodar Automação Completa
            </>
          )}
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RFQs Processados Hoje</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_rfqs_processed || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.successful_negotiations || 0} negociações bem-sucedidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balanço Payoneer</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${payoneerBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ID: 99133638</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão GPT-4</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.gpt4_accuracy_score || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.learning_events_count || 0} eventos de aprendizado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(metrics?.total_revenue_usd || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Ticket médio: ${(metrics?.avg_deal_value_usd || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Decisões GPT-4 Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Decisões GPT-4 Recentes
            </CardTitle>
            <CardDescription>Últimas decisões autônomas tomadas pela IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {gptDecisions.map((decision) => (
              <div key={decision.id} className="flex items-start gap-3 p-3 border rounded-lg">
                {getDecisionIcon(decision.decision_type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{decision.decision_type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(decision.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{decision.decision_rationale}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">Confiança: {decision.confidence_score}%</Badge>
                    {decision.rfq_inbox && (
                      <span className="text-xs text-muted-foreground">
                        {decision.rfq_inbox.product_description?.substring(0, 30)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {gptDecisions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma decisão ainda. Execute a automação para começar.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sistema de Aprendizado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sistema de Aprendizado
            </CardTitle>
            <CardDescription>GPT-4 aprendendo e evoluindo continuamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {learningEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                {event.event_type.includes('success') ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={event.event_type.includes('success') ? 'default' : 'destructive'}>
                      {event.event_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Impacto: {event.impact_score}/100
                    </span>
                  </div>
                  <p className="text-sm mt-1 font-medium">{event.lessons_learned}</p>
                  {event.strategy_adjustment && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Ajustes: {JSON.stringify(event.strategy_adjustment).substring(0, 60)}...
                    </div>
                  )}
                </div>
              </div>
            ))}
            {learningEvents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Sistema ainda não aprendeu nada. Aguardando primeira negociação.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Negociações Ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Negociações em Andamento ({activeNegotiations.length})
          </CardTitle>
          <CardDescription>Negociações autônomas sendo conduzidas pelo GPT-4</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeNegotiations.map((rfq) => (
              <div key={rfq.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{rfq.buyer_name}</h4>
                    <Badge>{rfq.buyer_country}</Badge>
                    {rfq.contact_method === 'api' && (
                      <Badge variant="outline" className="bg-green-50">
                        🔌 API Direct
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rfq.product_description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Qtd: {rfq.quantity?.toLocaleString()}</span>
                    <span>Budget: ${rfq.budget_usd?.toLocaleString()}</span>
                    <span>Prioridade: {rfq.priority_score}/100</span>
                  </div>
                </div>
                <Badge variant="secondary" className="ml-4">
                  {rfq.status}
                </Badge>
              </div>
            ))}
            {activeNegotiations.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma negociação ativa no momento.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
