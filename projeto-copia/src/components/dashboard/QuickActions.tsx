import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Globe, 
  Shield, 
  Settings, 
  BarChart3,
  Users,
  Rocket,
  AlertCircle,
  ShoppingCart,
  Package,
  Truck,
  FileText,
  Bot,
  Sparkles,
  Mail,
  Megaphone,
  Database,
  Code,
  Building2,
  Network,
  DollarSign,
  Brain,
  Layers,
  Activity,
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function QuickActions() {
  const navigate = useNavigate();

  const dashboardPages = [
    { id: "dashboard", title: "Dashboard Principal", icon: BarChart3, path: "/dashboard", color: "bg-blue-500" },
    { id: "live-profit", title: "Live Profit", icon: DollarSign, path: "/live-profit", color: "bg-green-500" },
    { id: "marketing-dashboard", title: "Marketing Dashboard", icon: Megaphone, path: "/marketing-dashboard", color: "bg-purple-500" },
    { id: "broker-dashboard", title: "Broker Dashboard", icon: Users, path: "/broker-dashboard", color: "bg-indigo-500" },
    { id: "validation-monitor", title: "Validation Monitor", icon: CheckCircle2, path: "/validation-monitor", color: "bg-teal-500" },
  ];

  const b2bPages = [
    { id: "opportunities", title: "Opportunities", icon: Target, path: "/opportunities", color: "bg-orange-500" },
    { id: "b2b-buyers", title: "B2B Buyers", icon: Users, path: "/b2b-buyers-info", color: "bg-blue-500" },
    { id: "suppliers", title: "Suppliers", icon: Package, path: "/suppliers", color: "bg-green-500" },
    { id: "b2b-solutions", title: "B2B Solutions", icon: Building2, path: "/b2b-solutions", color: "bg-purple-500" },
  ];

  const automationPages = [
    { id: "auto-execution", title: "Auto Execution", icon: Rocket, path: "/auto-execution", color: "bg-red-500" },
    { id: "quantum-system", title: "Quantum System", icon: Layers, path: "/quantum-system-complete", color: "bg-violet-500" },
    { id: "ai-system", title: "AI System", icon: Brain, path: "/ai-system", color: "bg-pink-500" },
    { id: "realtime-execution", title: "Real-time Execution", icon: Activity, path: "/real-time-execution", color: "bg-cyan-500" },
    { id: "quantum-arbitrage", title: "Quantum Arbitrage", icon: Zap, path: "/quantum-arbitrage-engine", color: "bg-amber-500" },
  ];

  const marketPages = [
    { id: "market-intelligence", title: "Market Intelligence", icon: TrendingUp, path: "/market-intelligence", color: "bg-blue-600" },
    { id: "amazon", title: "Amazon Products", icon: ShoppingCart, path: "/amazon", color: "bg-orange-600" },
    { id: "canton-fair", title: "Canton Fair", icon: Globe, path: "/canton-fair", color: "bg-red-600" },
    { id: "major-suppliers", title: "Major Suppliers", icon: Network, path: "/major-suppliers", color: "bg-green-600" },
    { id: "global-distribution", title: "Global Distribution", icon: Truck, path: "/global-distribution-contracts", color: "bg-indigo-600" },
  ];

  const compliancePages = [
    { id: "compliance", title: "Compliance", icon: Shield, path: "/compliance", color: "bg-orange-500" },
    { id: "logistics", title: "Logistics", icon: Truck, path: "/logistics", color: "bg-purple-500" },
    { id: "government", title: "Government Contracts", icon: Building2, path: "/government-contracts", color: "bg-blue-500" },
  ];

  const marketingPages = [
    { id: "ai-content", title: "AI Content Generator", icon: Sparkles, path: "/ai-content-generator", color: "bg-purple-600" },
    { id: "google-ads", title: "Google Ads", icon: Megaphone, path: "/google-ads-campaigns", color: "bg-red-600" },
    { id: "email-marketing", title: "Email Marketing", icon: Mail, path: "/marketing-dashboard", color: "bg-blue-600" },
  ];

  const settingsPages = [
    { id: "api-setup", title: "API Setup", icon: Code, path: "/api-setup", color: "bg-gray-600" },
    { id: "settings", title: "Settings", icon: Settings, path: "/settings", color: "bg-slate-600" },
    { id: "documents", title: "Company Documents", icon: FileText, path: "/company-documents", color: "bg-zinc-600" },
  ];

  const renderPageGrid = (pages: typeof dashboardPages) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {pages.map((page) => (
        <Button
          key={page.id}
          variant="outline"
          className="h-auto p-4 flex items-center gap-3 hover:shadow-lg transition-all duration-200 justify-start"
          onClick={() => navigate(page.path)}
        >
          <div className={`${page.color} p-2 rounded-lg flex-shrink-0`}>
            <page.icon className="h-4 w-4 text-white" />
          </div>
          <span className="font-medium text-sm">{page.title}</span>
        </Button>
      ))}
    </div>
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Navegação Rápida</h3>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">📊 Dashboards</TabsTrigger>
          <TabsTrigger value="b2b">🤝 B2B</TabsTrigger>
          <TabsTrigger value="automation">🤖 Automação</TabsTrigger>
          <TabsTrigger value="market">🌍 Mercado</TabsTrigger>
          <TabsTrigger value="compliance">✅ Compliance</TabsTrigger>
          <TabsTrigger value="marketing">📢 Marketing</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Config</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          {renderPageGrid(dashboardPages)}
        </TabsContent>

        <TabsContent value="b2b" className="mt-4">
          {renderPageGrid(b2bPages)}
        </TabsContent>

        <TabsContent value="automation" className="mt-4">
          {renderPageGrid(automationPages)}
        </TabsContent>

        <TabsContent value="market" className="mt-4">
          {renderPageGrid(marketPages)}
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          {renderPageGrid(compliancePages)}
        </TabsContent>

        <TabsContent value="marketing" className="mt-4">
          {renderPageGrid(marketingPages)}
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          {renderPageGrid(settingsPages)}
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">💡 Dica Pro</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Use as abas para acessar rapidamente qualquer parte do sistema. 
          O sistema está 100% operacional com automação 24/7 ativa!
        </p>
      </div>
    </div>
  );
}
