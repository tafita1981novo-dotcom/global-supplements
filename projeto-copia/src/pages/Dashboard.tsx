import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  ShoppingCart,
  TrendingUp,
  Package,
  Heart,
  Pill,
  Smartphone,
  Leaf,
  Atom,
  Megaphone,
  FileText,
  Users,
  ExternalLink,
  Sparkles,
  BarChart3,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const quickLinks = [
    { label: "Site Público", icon: Globe, path: "/", color: "bg-blue-500" },
    { label: "Amazon Affiliate", icon: ShoppingCart, path: "/amazon", color: "bg-orange-500" },
    { label: "Produtos", icon: Package, path: "/products", color: "bg-green-500" },
    { label: "Bundles", icon: Sparkles, path: "/bundles", color: "bg-purple-500" },
    { label: "Marketing", icon: Megaphone, path: "/marketing-dashboard", color: "bg-pink-500" },
    { label: "AI Content", icon: FileText, path: "/ai-content-generator", color: "bg-indigo-500" },
    { label: "Google Ads", icon: BarChart3, path: "/google-ads-campaigns", color: "bg-yellow-600" },
    { label: "Fornecedores", icon: Users, path: "/suppliers", color: "bg-teal-500" },
  ];

  const categories = [
    { label: "Beauty Supplements", icon: Heart, path: "/beauty-supplements", color: "text-pink-500" },
    { label: "Quantum Materials", icon: Atom, path: "/quantum-materials", color: "text-purple-500" },
    { label: "Medical Grade", icon: Pill, path: "/medical-grade", color: "text-blue-500" },
    { label: "Smart Gadgets", icon: Smartphone, path: "/smart-gadgets", color: "text-gray-600" },
    { label: "Traditional Wellness", icon: Leaf, path: "/traditional-wellness", color: "text-green-500" },
  ];

  const siteLinks = [
    { label: "Parcerias Globais", path: "/global-partnerships" },
    { label: "Catálogo Premium", path: "/premium-portfolio" },
    { label: "Enterprise Solutions", path: "/enterprise-solutions" },
    { label: "B2B Distribution", path: "/b2b" },
    { label: "B2B Solutions", path: "/b2b-solutions" },
    { label: "Market Intelligence", path: "/market-intelligence" },
    { label: "Contratos Governamentais", path: "/government-contracts" },
    { label: "Manufacturing", path: "/manufacturing" },
    { label: "Research & Development", path: "/research-development" },
    { label: "Compliance", path: "/compliance" },
    { label: "Logística", path: "/logistics" },
    { label: "Pre-Order Policy", path: "/pre-order-policy" },
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-gray-900">Global </span>
            <span className="text-yellow-500">Supplements</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Beauty · Quantum · Medical · Gadgets · Wellness
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/amazon")}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Amazon Affiliate
          </Button>
          <Button onClick={() => navigate("/")} className="bg-yellow-500 hover:bg-yellow-600 text-black">
            <Globe className="h-4 w-4 mr-2" />
            Ver Site
          </Button>
        </div>
      </div>

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Acesso Rápido
          </CardTitle>
          <CardDescription>Principais seções do projeto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:shadow-md transition-all hover:scale-105 bg-card"
              >
                <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center`}>
                  <link.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium text-center">{link.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-500" />
            Categorias de Produtos
          </CardTitle>
          <CardDescription>Linhas de produtos disponíveis no catálogo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.path}
                onClick={() => navigate(cat.path)}
                className="flex items-center gap-3 p-4 rounded-xl border hover:shadow-md transition-all hover:bg-muted text-left"
              >
                <cat.icon className={`h-6 w-6 flex-shrink-0 ${cat.color}`} />
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Site Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-500" />
            Todas as Páginas do Site
          </CardTitle>
          <CardDescription>Navegação completa do globalsupplements.site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {siteLinks.map((link) => (
              <Badge
                key={link.path}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5 text-sm"
                onClick={() => navigate(link.path)}
              >
                <ExternalLink className="h-3 w-3 mr-1.5" />
                {link.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Marketing & Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-pink-200 bg-pink-50 dark:bg-pink-950/20"
          onClick={() => navigate("/marketing-dashboard")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">Email & Social</p>
                <p className="text-sm text-muted-foreground">SendGrid + Buffer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20"
          onClick={() => navigate("/ai-content-generator")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">AI Content</p>
                <p className="text-sm text-muted-foreground">GPT-4 · 14 idiomas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
          onClick={() => navigate("/google-ads-campaigns")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">Google Ads</p>
                <p className="text-sm text-muted-foreground">13 marketplaces</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Credenciais", path: "/credentials-manager" },
              { label: "Setup de APIs", path: "/api-setup" },
              { label: "Settings", path: "/settings" },
              { label: "Documentos", path: "/company-documents" },
              { label: "Registros", path: "/registration-details" },
            ].map((item) => (
              <Button key={item.path} variant="outline" size="sm" onClick={() => navigate(item.path)}>
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
