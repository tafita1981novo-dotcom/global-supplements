import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Opportunities from "./pages/Opportunities";
import Suppliers from "./pages/Suppliers";
import Mycogenesis from "./pages/Mycogenesis";
import Logistics from "./pages/Logistics";
import Compliance from "./pages/Compliance";
import Settings from "./pages/Settings";
import APISetup from "./pages/APISetup";
import { AppLayout } from "./components/layout/AppLayout";
import { PublicSiteLayout } from "./components/layout/PublicSiteLayout";
import PublicSite from "./pages/PublicSite";
import GlobalPartnerships from "./pages/GlobalPartnerships";
import PremiumPortfolio from "./pages/PremiumPortfolio";
import ProductPatentGuide from "./pages/ProductPatentGuide";
import EnterpriseSolutions from "./pages/EnterpriseSolutions";
import RealTimeExecution from "./pages/RealTimeExecution";
import MarketIntelligence from "./pages/MarketIntelligence";
import { I18nProvider } from "./components/ui/I18nProvider";
import BeautySupplements from "./pages/BeautySupplements";
import QuantumMaterials from "./pages/QuantumMaterials";
import MedicalGrade from "./pages/MedicalGrade";
import SmartGadgets from "./pages/SmartGadgets";
import TraditionalWellness from "./pages/TraditionalWellness";
import B2BSolutions from "./pages/B2BSolutions";
import GovernmentContracts from "./pages/GovernmentContracts";
import Manufacturing from "./pages/Manufacturing";
import ResearchDevelopment from "./pages/ResearchDevelopment";
import MarketIntelligenceCategory from "./pages/MarketIntelligenceCategory";
import Bundles from "./pages/Bundles";
import BundleDetail from "./pages/BundleDetail";
import B2BDistribution from "./pages/B2BDistribution";
import Products from "./pages/Products";
import PreOrderPolicy from "./pages/PreOrderPolicy";
import Amazon from "./pages/Amazon";
import AIContentGenerator from "./pages/AIContentGenerator";
import GoogleAdsCampaignsPage from "./pages/GoogleAdsCampaigns";
import MarketingDashboard from "./pages/MarketingDashboard";
import CredentialsManager from "./pages/CredentialsManager";
import RegistrationDetails from "./pages/RegistrationDetails";
import CompanyDocuments from "./pages/CompanyDocuments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ── PUBLIC SITE ── */}
            <Route path="/" element={<PublicSite />} />
            <Route path="/public-site" element={<PublicSite />} />
            <Route path="/global-partnerships" element={<PublicSiteLayout><GlobalPartnerships /></PublicSiteLayout>} />
            <Route path="/premium-portfolio" element={<PublicSiteLayout><PremiumPortfolio /></PublicSiteLayout>} />
            <Route path="/product-patent-guide" element={<PublicSiteLayout><ProductPatentGuide /></PublicSiteLayout>} />
            <Route path="/enterprise-solutions" element={<PublicSiteLayout><EnterpriseSolutions /></PublicSiteLayout>} />
            <Route path="/real-time-execution" element={<PublicSiteLayout><RealTimeExecution /></PublicSiteLayout>} />
            <Route path="/market-intelligence" element={<PublicSiteLayout><MarketIntelligence /></PublicSiteLayout>} />

            {/* ── PRODUCT CATEGORIES (public) ── */}
            <Route path="/beauty-supplements" element={<BeautySupplements />} />
            <Route path="/quantum-materials" element={<QuantumMaterials />} />
            <Route path="/medical-grade" element={<MedicalGrade />} />
            <Route path="/smart-gadgets" element={<SmartGadgets />} />
            <Route path="/traditional-wellness" element={<TraditionalWellness />} />
            <Route path="/b2b-solutions" element={<B2BSolutions />} />
            <Route path="/government-contracts" element={<GovernmentContracts />} />
            <Route path="/manufacturing" element={<Manufacturing />} />
            <Route path="/research-development" element={<ResearchDevelopment />} />
            <Route path="/market-intelligence-category" element={<MarketIntelligenceCategory />} />
            <Route path="/bundles" element={<PublicSiteLayout><Bundles /></PublicSiteLayout>} />
            <Route path="/bundles/:bundleId" element={<PublicSiteLayout><BundleDetail /></PublicSiteLayout>} />
            <Route path="/b2b" element={<PublicSiteLayout><B2BDistribution /></PublicSiteLayout>} />
            <Route path="/products" element={<PublicSiteLayout><Products /></PublicSiteLayout>} />
            <Route path="/pre-order-policy" element={<PublicSiteLayout><PreOrderPolicy /></PublicSiteLayout>} />
            <Route path="/amazon" element={<Amazon />} />

            {/* ── INTERNAL DASHBOARD ── */}
            <Route path="/dashboard" element={<Index />} />
            <Route path="/home" element={<AppLayout><Home /></AppLayout>} />
            <Route path="/opportunities" element={<AppLayout><Opportunities /></AppLayout>} />
            <Route path="/suppliers" element={<AppLayout><Suppliers /></AppLayout>} />
            <Route path="/mycogenesis" element={<AppLayout><Mycogenesis /></AppLayout>} />
            <Route path="/logistics" element={<AppLayout><Logistics /></AppLayout>} />
            <Route path="/compliance" element={<AppLayout><Compliance /></AppLayout>} />

            {/* ── MARKETING ── */}
            <Route path="/ai-content-generator" element={<AppLayout><AIContentGenerator /></AppLayout>} />
            <Route path="/google-ads-campaigns" element={<AppLayout><GoogleAdsCampaignsPage /></AppLayout>} />
            <Route path="/marketing-dashboard" element={<AppLayout><MarketingDashboard /></AppLayout>} />

            {/* ── SETTINGS & CONFIG ── */}
            <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
            <Route path="/api-setup" element={<AppLayout><APISetup /></AppLayout>} />
            <Route path="/credentials-manager" element={<AppLayout><CredentialsManager /></AppLayout>} />
            <Route path="/registration-details" element={<AppLayout><RegistrationDetails /></AppLayout>} />
            <Route path="/company-documents" element={<AppLayout><CompanyDocuments /></AppLayout>} />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
