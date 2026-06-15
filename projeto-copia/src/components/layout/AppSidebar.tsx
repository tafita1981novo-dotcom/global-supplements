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
  Globe,
  Package,
  Settings,
  TrendingUp,
  Users,
  Key,
  Shield,
  FileText,
  ExternalLink,
  Handshake,
  BookOpen,
  Megaphone,
  ShoppingCart,
  Truck,
  Sparkles,
  Target,
  Heart,
  Atom,
  Pill,
  Smartphone,
  Leaf,
  Factory,
  FlaskConical,
  ShoppingBag,
  Briefcase,
  ClipboardList,
  Mail,
  Building2,
  Award,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItems = [
    // ==========================================
    // 🌐 SITE PÚBLICO
    // ==========================================
    {
      title: "━━━━ 🌐 SITE PÚBLICO ━━━━",
      icon: Globe,
      url: "#public",
    },
    {
      title: "🏠 Home",
      icon: Globe,
      url: "/",
    },
    {
      title: "🤝 Parcerias Globais",
      icon: Handshake,
      url: "/global-partnerships",
    },
    {
      title: "⭐ Catálogo Premium",
      icon: Award,
      url: "/premium-portfolio",
    },
    {
      title: "💼 Soluções Enterprise",
      icon: Briefcase,
      url: "/enterprise-solutions",
    },
    {
      title: "📦 Produtos",
      icon: Package,
      url: "/products",
    },
    {
      title: "🎁 Bundles",
      icon: ShoppingBag,
      url: "/bundles",
    },
    {
      title: "📋 Política de Pré-Venda",
      icon: ClipboardList,
      url: "/pre-order-policy",
    },
    {
      title: "🏭 B2B Distribution",
      icon: Truck,
      url: "/b2b",
    },
    {
      title: "📊 Market Intelligence",
      icon: TrendingUp,
      url: "/market-intelligence",
    },

    // ==========================================
    // 📦 CATEGORIAS DE PRODUTOS
    // ==========================================
    {
      title: "━━━━ 📦 PRODUTOS ━━━━",
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
      title: "🔬 Mycogenesis",
      icon: FlaskConical,
      url: "/mycogenesis",
    },

    // ==========================================
    // 🛒 AMAZON AFFILIATE
    // ==========================================
    {
      title: "━━━━ 🛒 AMAZON ━━━━",
      icon: ShoppingCart,
      url: "#amazon",
    },
    {
      title: "🛒 Amazon Products",
      icon: ShoppingCart,
      url: "/amazon",
    },

    // ==========================================
    // 💼 B2B & NEGÓCIOS
    // ==========================================
    {
      title: "━━━━ 💼 B2B ━━━━",
      icon: Handshake,
      url: "#b2b",
    },
    {
      title: "🎯 Oportunidades",
      icon: Target,
      url: "/opportunities",
    },
    {
      title: "🏢 Fornecedores",
      icon: Building2,
      url: "/suppliers",
    },
    {
      title: "💼 B2B Solutions",
      icon: Briefcase,
      url: "/b2b-solutions",
    },
    {
      title: "🏛️ Contratos Governamentais",
      icon: Building2,
      url: "/government-contracts",
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
    // ✅ COMPLIANCE & LOGÍSTICA
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
      title: "🚚 Logística",
      icon: Truck,
      url: "/logistics",
    },
    {
      title: "📋 Guia Patent & Private Label",
      icon: BookOpen,
      url: "/product-patent-guide",
    },

    // ==========================================
    // 📢 MARKETING
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
      title: "📧 Email & Social Media",
      icon: Mail,
      url: "/marketing-dashboard",
    },

    // ==========================================
    // ⚙️ CONFIGURAÇÕES
    // ==========================================
    {
      title: "━━━━ ⚙️ CONFIG ━━━━",
      icon: Settings,
      url: "#settings",
    },
    {
      title: "📊 Dashboard",
      icon: BarChart3,
      url: "/dashboard",
    },
    {
      title: "🔑 Credenciais",
      icon: Key,
      url: "/credentials-manager",
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
      icon: ExternalLink,
      url: "/registration-details",
    },
    {
      title: "👥 Usuários",
      icon: Users,
      url: "/home",
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
          <p className="text-sm text-muted-foreground">Premium Global Network</p>
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
          © 2024 Global Supplements — Premium Worldwide Network
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
