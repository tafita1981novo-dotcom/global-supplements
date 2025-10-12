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
  CheckCircle2,
  Microscope,
  Atom,
  Heart,
  Pill,
  Smartphone,
  Leaf,
  Factory,
  FlaskConical,
  Handshake,
  Award,
  Book,
  Briefcase,
  ShoppingBag,
  Calendar,
  ClipboardList,
  Hash,
  Layout
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const dashboardPages = [
    { id: "dashboard", title: "Dashboard Principal", icon: BarChart3, path: "/dashboard", color: "bg-blue-500" },
    { id: "live-profit", title: "Live Profit", icon: DollarSign, path: "/live-profit", color: "bg-green-500" },
    { id: "marketing-dashboard", title: "Marketing Dashboard", icon: Megaphone, path: "/marketing-dashboard", color: "bg-purple-500" },
    { id: "broker-dashboard", title: "Broker Dashboard", icon: Users, path: "/broker-dashboard", color: "bg-indigo-500" },
    { id: "validation-monitor", title: "Validation Monitor", icon: CheckCircle2, path: "/validation-monitor", color: "bg-teal-500" },
    { id: "advanced-market", title: "Advanced Market Intelligence", icon: TrendingUp, path: "/advanced-market-intelligence", color: "bg-cyan-600" },
  ];

  const b2bPages = [
    { id: "opportunities", title: "Opportunities", icon: Target, path: "/opportunities", color: "bg-orange-500" },
    { id: "b2b-buyers", title: "B2B Buyers", icon: Users, path: "/b2b-buyers-info", color: "bg-blue-500" },
    { id: "b2b-buyer-guide", title: "B2B Buyer Guide", icon: Book, path: "/b2b-buyer-guide", color: "bg-sky-500" },
    { id: "suppliers", title: "Suppliers", icon: Package, path: "/suppliers", color: "bg-green-500" },
    { id: "b2b-solutions", title: "B2B Solutions", icon: Building2, path: "/b2b-solutions", color: "bg-purple-500" },
    { id: "b2b-distribution", title: "B2B Distribution", icon: Truck, path: "/b2b", color: "bg-indigo-600" },
    { id: "mycogenesis", title: "Mycogenesis Products", icon: Microscope, path: "/mycogenesis", color: "bg-emerald-600" },
  ];

  const automationPages = [
    { id: "auto-execution", title: "Auto Execution", icon: Rocket, path: "/auto-execution", color: "bg-red-500" },
    { id: "quantum-system", title: "Quantum System Complete", icon: Layers, path: "/quantum-system-complete", color: "bg-violet-500" },
    { id: "quantum-opportunities", title: "Quantum Opportunities", icon: Target, path: "/quantum-opportunities", color: "bg-orange-600" },
    { id: "quantum-arbitrage", title: "Quantum Arbitrage", icon: Zap, path: "/quantum-arbitrage-engine", color: "bg-amber-500" },
    { id: "quantum-realtime", title: "Quantum Real-Time Executor", icon: Activity, path: "/quantum-real-time-executor", color: "bg-cyan-600" },
    { id: "ai-system", title: "AI System", icon: Brain, path: "/ai-system", color: "bg-pink-500" },
    { id: "realtime-arbitrage", title: "Real-Time Arbitrage", icon: Zap, path: "/realtime-arbitrage", color: "bg-yellow-600" },
    { id: "zero-investment", title: "Zero Investment Engine", icon: DollarSign, path: "/zero-investment", color: "bg-green-600" },
    { id: "practical-implementation", title: "Practical Implementation", icon: CheckCircle2, path: "/practical-implementation", color: "bg-teal-600" },
    { id: "progressive-strategy", title: "Progressive Strategy", icon: TrendingUp, path: "/progressive-strategy", color: "bg-blue-700" },
    { id: "quantum-distributorship", title: "Quantum Distributorship", icon: Network, path: "/quantum-distributorship", color: "bg-violet-600" },
    { id: "automated-distributor", title: "Automated Distributor", icon: Bot, path: "/automated-distributor", color: "bg-purple-700" },
  ];

  const marketPages = [
    { id: "market-intelligence", title: "Market Intelligence", icon: TrendingUp, path: "/market-intelligence", color: "bg-blue-600" },
    { id: "market-intelligence-category", title: "Market Intelligence Category", icon: BarChart3, path: "/market-intelligence-category", color: "bg-indigo-700" },
    { id: "amazon", title: "Amazon Products", icon: ShoppingCart, path: "/amazon", color: "bg-orange-600" },
    { id: "canton-fair", title: "Canton Fair", icon: Globe, path: "/canton-fair", color: "bg-red-600" },
    { id: "major-suppliers", title: "Major Suppliers", icon: Network, path: "/major-suppliers", color: "bg-green-600" },
    { id: "global-distribution", title: "Global Distribution", icon: Truck, path: "/global-distribution-contracts", color: "bg-indigo-600" },
  ];

  const productCategoryPages = [
    { id: "beauty-supplements", title: "Beauty Supplements", icon: Heart, path: "/beauty-supplements", color: "bg-pink-600" },
    { id: "quantum-materials", title: "Quantum Materials", icon: Atom, path: "/quantum-materials", color: "bg-purple-600" },
    { id: "medical-grade", title: "Medical Grade", icon: Pill, path: "/medical-grade", color: "bg-red-600" },
    { id: "smart-gadgets", title: "Smart Gadgets", icon: Smartphone, path: "/smart-gadgets", color: "bg-blue-600" },
    { id: "traditional-wellness", title: "Traditional Wellness", icon: Leaf, path: "/traditional-wellness", color: "bg-green-600" },
    { id: "manufacturing", title: "Manufacturing", icon: Factory, path: "/manufacturing", color: "bg-gray-600" },
    { id: "research-development", title: "Research & Development", icon: FlaskConical, path: "/research-development", color: "bg-cyan-600" },
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

  const publicPages = [
    { id: "global-partnerships", title: "Global Partnerships", icon: Handshake, path: "/global-partnerships", color: "bg-blue-700" },
    { id: "premium-portfolio", title: "Premium Portfolio", icon: Award, path: "/premium-portfolio", color: "bg-amber-600" },
    { id: "product-patent-guide", title: "Product Patent Guide", icon: Book, path: "/product-patent-guide", color: "bg-indigo-600" },
    { id: "enterprise-solutions", title: "Enterprise Solutions", icon: Briefcase, path: "/enterprise-solutions", color: "bg-slate-700" },
    { id: "bundles", title: "Bundles", icon: ShoppingBag, path: "/bundles", color: "bg-pink-700" },
    { id: "products", title: "Products", icon: Package, path: "/products", color: "bg-green-700" },
    { id: "pre-order-policy", title: "Pre-Order Policy", icon: ClipboardList, path: "/pre-order-policy", color: "bg-gray-700" },
  ];

  const settingsPages = [
    { id: "api-setup", title: "API Setup", icon: Code, path: "/api-setup", color: "bg-gray-600" },
    { id: "settings", title: "Settings", icon: Settings, path: "/settings", color: "bg-slate-600" },
    { id: "documents", title: "Company Documents", icon: FileText, path: "/company-documents", color: "bg-zinc-600" },
    { id: "registration-details", title: "Registration Details", icon: ClipboardList, path: "/registration-details", color: "bg-stone-600" },
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
        <h3 className="text-lg font-semibold">Navegação Rápida - Todas as Páginas</h3>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-9 h-auto">
          <TabsTrigger value="dashboard" className="text-xs">📊 Dashboards</TabsTrigger>
          <TabsTrigger value="b2b" className="text-xs">🤝 B2B</TabsTrigger>
          <TabsTrigger value="automation" className="text-xs">🤖 Automação</TabsTrigger>
          <TabsTrigger value="market" className="text-xs">🌍 Mercado</TabsTrigger>
          <TabsTrigger value="products" className="text-xs">📦 Produtos</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs">✅ Compliance</TabsTrigger>
          <TabsTrigger value="marketing" className="text-xs">📢 Marketing</TabsTrigger>
          <TabsTrigger value="public" className="text-xs">🌐 Público</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">⚙️ Config</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-muted-foreground">📊 Dashboards & Analytics ({dashboardPages.length} páginas)</h4>
          </div>
          {renderPageGrid(dashboardPages)}
        </TabsContent>

        <TabsContent value="b2b" className="mt-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-muted-foreground">🤝 B2B Operations ({b2bPages.length} páginas)</h4>
          </div>
          {renderPageGrid(b2bPages)}
        </TabsContent>

        <TabsContent value="automation" className="mt-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-muted-foreground">🤖 Automated Systems ({automationPages.length} páginas)</h4>
          </div>
          {renderPageGrid(automationPages)}
        </TabsContent>

        <TabsContent value="market" className="mt-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-muted-foreground">🌍 Market Intelligence ({marketPages.length} páginas)</h4>
          </div>
          {renderPageGrid(marketPages)}
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-muted-foreground">📦 Product Categories ({productCategoryPages.length} páginas)</h4>
          </div>
          {renderPageGrid(productCategoryPages)}
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-muted-foreground">✅ Compliance & Logistics ({compliancePages.length} páginas)</h4>
          </div>
          {renderPageGrid(compliancePages)}
        </TabsContent>

        <TabsContent value="marketing" className="mt-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-muted-foreground">📢 Marketing Automation ({marketingPages.length} páginas)</h4>
          </div>
          {renderPageGrid(marketingPages)}
        </TabsContent>

        <TabsContent value="public" className="mt-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-muted-foreground">🌐 Public & Marketing Pages ({publicPages.length} páginas)</h4>
          </div>
          {renderPageGrid(publicPages)}
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-muted-foreground">⚙️ Settings & Configuration ({settingsPages.length} páginas)</h4>
          </div>
          {renderPageGrid(settingsPages)}
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">✅ Sistema Completo - {dashboardPages.length + b2bPages.length + automationPages.length + marketPages.length + productCategoryPages.length + compliancePages.length + marketingPages.length + publicPages.length + settingsPages.length} Páginas Disponíveis</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Todos os módulos do sistema estão acessíveis através das 9 categorias acima. 
          Automação 24/7 ativa com pipeline completo (Amazon → Buyers → Matching → Negotiations)!
        </p>
      </div>
    </div>
  );
}
