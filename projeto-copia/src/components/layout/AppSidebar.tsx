import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  Brain, 
  Cpu,
  Building2, 
  Globe, 
  Package, 
  Settings, 
  TrendingUp, 
  Users,
  Key,
  Activity,
  Shield,
  Rocket,
  Zap,
  FileText,
  Database,
  ExternalLink,
  Crown,
  Handshake,
  Gavel,
  BookOpen,
  DollarSign,
  Megaphone,
  CheckCircle2,
  ShoppingCart,
  Truck,
  Sparkles,
  Target,
  Network,
  Layers,
  Heart,
  Atom,
  Pill,
  Smartphone,
  Leaf,
  Factory,
  FlaskConical,
  ShoppingBag,
  Award,
  Briefcase,
  ClipboardList,
  Mail,
  Code
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItems = [
    // ==========================================
    // 📊 DASHBOARDS & ANALYTICS (6)
    // ==========================================
    {
      title: "━━━━ 📊 DASHBOARDS ━━━━",
      icon: BarChart3,
      url: "#dashboards",
    },
    {
      title: "📊 Dashboard Principal",
      icon: BarChart3,
      url: "/dashboard",
    },
    {
      title: "💰 Live Profit Dashboard",
      icon: DollarSign,
      url: "/live-profit",
    },
    {
      title: "🤝 Broker Dashboard",
      icon: Users,
      url: "/broker-dashboard",
    },
    {
      title: "📢 Marketing Dashboard",
      icon: Megaphone,
      url: "/marketing-dashboard",
    },
    {
      title: "✅ Validation Monitor",
      icon: CheckCircle2,
      url: "/validation-monitor",
    },
    {
      title: "📈 Advanced Market Intelligence",
      icon: TrendingUp,
      url: "/advanced-market-intelligence",
    },

    // ==========================================
    // 🤝 B2B OPERATIONS (7)
    // ==========================================
    {
      title: "━━━━ 🤝 B2B OPERATIONS ━━━━",
      icon: Handshake,
      url: "#b2b",
    },
    {
      title: "🎯 Opportunities",
      icon: Target,
      url: "/opportunities",
    },
    {
      title: "🤝 Centro de Compradores B2B",
      icon: Handshake,
      url: "/b2b-buyers-info",
    },
    {
      title: "📖 Guia Completo de Compradores B2B",
      icon: BookOpen,
      url: "/b2b-buyer-guide",
    },
    {
      title: "🏢 Suppliers",
      icon: Building2,
      url: "/suppliers",
    },
    {
      title: "💼 B2B Solutions",
      icon: Briefcase,
      url: "/b2b-solutions",
    },
    {
      title: "🚚 B2B Distribution",
      icon: Truck,
      url: "/b2b",
    },
    {
      title: "🔬 Mycogenesis Products",
      icon: FlaskConical,
      url: "/mycogenesis",
    },

    // ==========================================
    // 🤖 AUTOMATED SYSTEMS (12)
    // ==========================================
    {
      title: "━━━━ 🤖 AUTOMATION ━━━━",
      icon: Rocket,
      url: "#automation",
    },
    {
      title: "🚀 Execução Automática",
      icon: Rocket,
      url: "/auto-execution",
    },
    {
      title: "⚡ Sistema Quântico Completo",
      icon: Zap,
      url: "/quantum-system-complete",
    },
    {
      title: "🎯 Quantum Opportunities",
      icon: Target,
      url: "/quantum-opportunities",
    },
    {
      title: "⚡ Motor Arbitragem Quântica",
      icon: Zap,
      url: "/quantum-arbitrage-engine",
    },
    {
      title: "🔥 Executor Tempo Real Quântico",
      icon: Activity,
      url: "/quantum-real-time-executor",
    },
    {
      title: "🤖 AI Quantum Engine",
      icon: Brain,
      url: "/ai-system",
    },
    {
      title: "⚡ Arbitragem Tempo Real",
      icon: Activity,
      url: "/realtime-arbitrage",
    },
    {
      title: "💰 Zero Investment Engine",
      icon: DollarSign,
      url: "/zero-investment",
    },
    {
      title: "✅ Implementação Prática",
      icon: CheckCircle2,
      url: "/practical-implementation",
    },
    {
      title: "📈 Progressive Strategy",
      icon: TrendingUp,
      url: "/progressive-strategy",
    },
    {
      title: "👑 Quantum Distributorship",
      icon: Crown,
      url: "/quantum-distributorship",
    },
    {
      title: "🚀 Sistema Automatizado",
      icon: Zap,
      url: "/automated-distributor",
    },

    // ==========================================
    // 🌍 MARKET INTELLIGENCE (6)
    // ==========================================
    {
      title: "━━━━ 🌍 MARKET INTEL ━━━━",
      icon: Globe,
      url: "#market",
    },
    {
      title: "📊 Market Intelligence",
      icon: TrendingUp,
      url: "/market-intelligence",
    },
    {
      title: "📈 Market Intelligence Category",
      icon: BarChart3,
      url: "/market-intelligence-category",
    },
    {
      title: "🛒 Amazon Products",
      icon: ShoppingCart,
      url: "/amazon",
    },
    {
      title: "🏪 Canton Fair Tracker",
      icon: Globe,
      url: "/canton-fair",
    },
    {
      title: "🏢 Base de Fornecedores Globais",
      icon: Network,
      url: "/major-suppliers",
    },
    {
      title: "💼 Contratos Distribuição Global",
      icon: Handshake,
      url: "/global-distribution-contracts",
    },

    // ==========================================
    // 📦 PRODUCT CATEGORIES (7)
    // ==========================================
    {
      title: "━━━━ 📦 PRODUCTS ━━━━",
      icon: Package,
      url: "#products",
    },
    {
      title: "💄 Beauty Supplements",
      icon: Heart,
      url: "/beauty-supplements",
    },
    {
      title: "⚛️ Quantum Materials",
      icon: Atom,
      url: "/quantum-materials",
    },
    {
      title: "💊 Medical Grade",
      icon: Pill,
      url: "/medical-grade",
    },
    {
      title: "📱 Smart Gadgets",
      icon: Smartphone,
      url: "/smart-gadgets",
    },
    {
      title: "🌿 Traditional Wellness",
      icon: Leaf,
      url: "/traditional-wellness",
    },
    {
      title: "🏭 Manufacturing",
      icon: Factory,
      url: "/manufacturing",
    },
    {
      title: "🔬 Research & Development",
      icon: FlaskConical,
      url: "/research-development",
    },

    // ==========================================
    // ✅ COMPLIANCE & LOGISTICS (3)
    // ==========================================
    {
      title: "━━━━ ✅ COMPLIANCE ━━━━",
      icon: Shield,
      url: "#compliance",
    },
    {
      title: "🛡️ Compliance",
      icon: Shield,
      url: "/compliance",
    },
    {
      title: "🚚 Logistics",
      icon: Truck,
      url: "/logistics",
    },
    {
      title: "🏛️ Government Contracts",
      icon: Building2,
      url: "/government-contracts",
    },

    // ==========================================
    // 📢 MARKETING AUTOMATION (3)
    // ==========================================
    {
      title: "━━━━ 📢 MARKETING ━━━━",
      icon: Megaphone,
      url: "#marketing",
    },
    {
      title: "✨ AI Content Generator",
      icon: Sparkles,
      url: "/ai-content-generator",
    },
    {
      title: "📢 Google Ads Campaigns",
      icon: Megaphone,
      url: "/google-ads-campaigns",
    },
    {
      title: "📧 Email Marketing",
      icon: Mail,
      url: "/marketing-dashboard",
    },

    // ==========================================
    // 🌐 PUBLIC & MARKETING PAGES (10)
    // ==========================================
    {
      title: "━━━━ 🌐 PUBLIC SITE ━━━━",
      icon: Globe,
      url: "#public",
    },
    {
      title: "🏠 Public Site Home",
      icon: Globe,
      url: "/",
    },
    {
      title: "🌍 Site Público",
      icon: ExternalLink,
      url: "/public-site",
    },
    {
      title: "🤝 Global Partnerships",
      icon: Handshake,
      url: "/global-partnerships",
    },
    {
      title: "⚡ Access Catalog",
      icon: Zap,
      url: "/premium-portfolio",
    },
    {
      title: "📋 Patent & Private Label Guide",
      icon: Gavel,
      url: "/product-patent-guide",
    },
    {
      title: "💼 Enterprise Solutions",
      icon: Briefcase,
      url: "/enterprise-solutions",
    },
    {
      title: "⚡ Real-Time Execution",
      icon: Activity,
      url: "/real-time-execution",
    },
    {
      title: "🛍️ Bundles",
      icon: ShoppingBag,
      url: "/bundles",
    },
    {
      title: "📦 Products",
      icon: Package,
      url: "/products",
    },
    {
      title: "📋 Pre-Order Policy",
      icon: ClipboardList,
      url: "/pre-order-policy",
    },

    // ==========================================
    // ⚙️ SETTINGS & CONFIGURATION (4)
    // ==========================================
    {
      title: "━━━━ ⚙️ SETTINGS ━━━━",
      icon: Settings,
      url: "#settings",
    },
    {
      title: "🔑 Credentials Manager",
      icon: Key,
      url: "/credentials-manager",
    },
    {
      title: "📧 Gmail OAuth Test",
      icon: Mail,
      url: "/gmail-oauth-test",
    },
    {
      title: "🔑 Setup de APIs",
      icon: Key,
      url: "/api-setup",
    },
    {
      title: "⚙️ Settings",
      icon: Settings,
      url: "/settings",
    },
    {
      title: "📄 Documentos da Empresa",
      icon: FileText,
      url: "/company-documents",
    },
    {
      title: "📊 Detalhes dos Registros",
      icon: Database,
      url: "/registration-details",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2">
          <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-gray-900">Global </span>
            <span className="text-yellow-500">Supplements</span>
          </h1>
          <p className="text-sm text-muted-foreground">{t("site.tagline", "Premium Global Network")}</p>
        </div>
      </SidebarHeader>
      <SidebarContent className="pb-20">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => {
                const isHeader = item.url.startsWith('#');
                return (
                  <SidebarMenuItem key={`${item.title}-${index}`}>
                    {isHeader ? (
                      <div className="px-3 py-2 mt-3 mb-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                      </div>
                    ) : (
                      <SidebarMenuButton
                        isActive={location.pathname === item.url}
                        onClick={() => navigate(item.url)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-xs">{item.title}</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-20">
        <div className="text-xs text-muted-foreground px-4 py-2">
          © 2024 Global Supplements - 55+ Pages
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
