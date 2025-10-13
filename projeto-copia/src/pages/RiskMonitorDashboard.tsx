import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle2, XCircle, Clock, TrendingUp, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManualIntervention {
  id: string;
  alert_title: string;
  alert_message: string;
  alert_severity: string;
  available_actions: any[];
  status: string;
  created_at: string;
  rfq_inbox: {
    product_description: string;
    buyer_name: string;
  };
}

interface ParallelNegotiation {
  id: string;
  buyer_status: string;
  active_suppliers: number;
  selected_supplier_id: string | null;
  selection_reason: string | null;
  rfq_inbox: {
    product_description: string;
    buyer_name: string;
    buyer_country: string;
  };
}

interface RiskAssessment {
  id: string;
  risk_type: string;
  risk_level: string;
  risk_score: number;
  risk_description: string;
  auto_resolution_success: boolean;
  requires_manual_intervention: boolean;
  final_decision: string;
  detected_at: string;
}

export default function RiskMonitorDashboard() {
  const [alerts, setAlerts] = useState<ManualIntervention[]>([]);
  const [parallelNegs, setParallelNegs] = useState<ParallelNegotiation[]>([]);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [stats, setStats] = useState({
    total_risks: 0,
    auto_resolved: 0,
    pending_alerts: 0,
    active_negotiations: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    // Fetch manual interventions (alerts)
    const { data: alertsData } = await supabase
      .from('manual_interventions')
      .select('*, rfq_inbox(product_description, buyer_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (alertsData) setAlerts(alertsData);

    // Fetch parallel negotiations
    const { data: negsData } = await supabase
      .from('parallel_negotiations')
      .select('*, rfq_inbox(product_description, buyer_name, buyer_country)')
      .in('buyer_status', ['negotiating', 'waiting_response'])
      .order('started_at', { ascending: false })
      .limit(20);

    if (negsData) setParallelNegs(negsData);

    // Fetch risks
    const { data: risksData } = await supabase
      .from('risk_assessments')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(50);

    if (risksData) {
      setRisks(risksData);
      
      setStats({
        total_risks: risksData.length,
        auto_resolved: risksData.filter(r => r.auto_resolution_success).length,
        pending_alerts: alertsData?.length || 0,
        active_negotiations: negsData?.length || 0
      });
    }
  };

  const handleUserAction = async (interventionId: string, action: string) => {
    const { error } = await supabase
      .from('manual_interventions')
      .update({
        user_action: action,
        user_response_at: new Date().toISOString(),
        status: 'user_responded'
      })
      .eq('id', interventionId);

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao registrar ação",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Ação Registrada",
        description: `Ação "${action}" executada com sucesso`,
      });
      fetchDashboardData();
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return severity === 'critical' ? <XCircle className="w-5 h-5 text-red-500" /> : <AlertTriangle className="w-5 h-5 text-orange-500" />;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🛡️ Monitoramento de Riscos em Tempo Real</h1>
        <p className="text-muted-foreground">GPT-4 analisando riscos, auto-resolvendo ou criando alertas para você</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Riscos Detectados</p>
                <p className="text-2xl font-bold">{stats.total_risks}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auto-Resolvidos</p>
                <p className="text-2xl font-bold text-green-600">{stats.auto_resolved}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending_alerts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Negociações Ativas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active_negotiations}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Interventions (Alerts with Action Buttons) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertas Críticos - Ação Manual Necessária
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>Nenhum alerta pendente! Todos os riscos foram auto-resolvidos ✅</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.alert_severity)}
                      <div>
                        <h3 className="font-semibold">{alert.alert_title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.rfq_inbox?.product_description} - {alert.rfq_inbox?.buyer_name}
                        </p>
                      </div>
                    </div>
                    <Badge variant={alert.alert_severity === 'critical' ? 'destructive' : 'outline'}>
                      {alert.alert_severity.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-sm mb-4 whitespace-pre-line">{alert.alert_message}</p>

                  <div className="flex flex-wrap gap-2">
                    {alert.available_actions?.map((action: any, idx: number) => (
                      <Button
                        key={idx}
                        variant={action.action === 'abort' ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => handleUserAction(alert.id, action.action)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Auto-abandono em 2 horas se não responder
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parallel Negotiations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>🤝 Negociações Paralelas em Andamento</CardTitle>
        </CardHeader>
        <CardContent>
          {parallelNegs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhuma negociação ativa no momento</p>
          ) : (
            <div className="space-y-4">
              {parallelNegs.map((neg) => (
                <div key={neg.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{neg.rfq_inbox?.product_description}</h3>
                      <p className="text-sm text-muted-foreground">
                        {neg.rfq_inbox?.buyer_name} ({neg.rfq_inbox?.buyer_country})
                      </p>
                    </div>
                    <Badge>{neg.buyer_status}</Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Fornecedores Ativos:</span>
                      <span>{neg.active_suppliers}</span>
                    </div>
                    
                    {neg.selected_supplier_id && (
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-md">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                          ✅ Melhor Fornecedor Selecionado
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">{neg.selection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Risks */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Histórico de Riscos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {risks.slice(0, 15).map((risk) => (
              <div key={risk.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${getRiskLevelColor(risk.risk_level)}`} />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{risk.risk_type.replace(/_/g, ' ').toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground mt-1">{risk.risk_description}</p>
                    </div>
                    <Badge variant={risk.auto_resolution_success ? 'default' : 'outline'}>
                      {risk.auto_resolution_success ? 'Auto-Resolvido' : risk.final_decision}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Score: {risk.risk_score}/100</span>
                    <span>{new Date(risk.detected_at).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
