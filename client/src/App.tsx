import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";

const LandingPage = lazy(() => import("@/pages/home"));

const pageImports = {
  login: () => import("@/pages/login"),
  register: () => import("@/pages/register"),
  dashboard: () => import("@/pages/dashboard"),
  cargoList: () => import("@/pages/cargo-list"),
  truckList: () => import("@/pages/truck-list"),
  cargoDetail: () => import("@/pages/cargo-detail"),
  truckDetail: () => import("@/pages/truck-detail"),
  cargoForm: () => import("@/pages/cargo-form"),
  myCargo: () => import("@/pages/my-cargo"),
  completedCargo: () => import("@/pages/completed-cargo"),
  cancelledCargo: () => import("@/pages/cancelled-cargo"),
  companies: () => import("@/pages/companies"),
  partners: () => import("@/pages/partners"),
  transportLedger: () => import("@/pages/transport-ledger"),
  payment: () => import("@/pages/payment"),
  services: () => import("@/pages/services"),
  userSettings: () => import("@/pages/user-settings"),
  adminDashboard: () => import("@/pages/admin-dashboard"),
  adminApplications: () => import("@/pages/admin-applications"),
  adminUsers: () => import("@/pages/admin-users"),
  adminRevenue: () => import("@/pages/admin-revenue"),
  adminNotifications: () => import("@/pages/admin-notifications"),
  adminSeo: () => import("@/pages/admin-seo"),
  adminSettings: () => import("@/pages/admin-settings"),
  adminAnnouncements: () => import("@/pages/admin-announcements"),
  adminListings: () => import("@/pages/admin-listings"),
  adminAuditLogs: () => import("@/pages/admin-audit-logs"),
  adminContactInquiries: () => import("@/pages/admin-contact-inquiries"),
  adminInvoices: () => import("@/pages/admin-invoices"),
  adminAgents: () => import("@/pages/admin-agents"),
  adminAiTraining: () => import("@/pages/admin-ai-training"),
  guide: () => import("@/pages/guide"),
  faq: () => import("@/pages/faq"),
  contact: () => import("@/pages/contact"),
  companyInfo: () => import("@/pages/company-info"),
  terms: () => import("@/pages/terms"),
  privacy: () => import("@/pages/privacy"),
  columns: () => import("@/pages/columns"),
  columnDetail: () => import("@/pages/column-detail"),
  columnCategory: () => import("@/pages/column-category"),
  guideKyukakyusha: () => import("@/pages/guide-kyukakyusha"),
  compareSites: () => import("@/pages/compare-sites"),
  alternativeTrabox: () => import("@/pages/alternative-trabox"),
  forgotPassword: () => import("@/pages/forgot-password"),
  resetPassword: () => import("@/pages/reset-password"),
  truckForm: () => import("@/pages/truck-form"),
  myTrucks: () => import("@/pages/my-trucks"),
  notFound: () => import("@/pages/not-found"),
};

const Login = lazy(pageImports.login);
const Register = lazy(pageImports.register);
const Dashboard = lazy(pageImports.dashboard);
const CargoList = lazy(pageImports.cargoList);
const TruckList = lazy(pageImports.truckList);
const CargoDetail = lazy(pageImports.cargoDetail);
const TruckDetail = lazy(pageImports.truckDetail);
const CargoForm = lazy(pageImports.cargoForm);
const MyCargo = lazy(pageImports.myCargo);
const CompletedCargo = lazy(pageImports.completedCargo);
const CancelledCargo = lazy(pageImports.cancelledCargo);
const Companies = lazy(pageImports.companies);
const Partners = lazy(pageImports.partners);
const TransportLedger = lazy(pageImports.transportLedger);
const Payment = lazy(pageImports.payment);
const Services = lazy(pageImports.services);
const UserSettings = lazy(pageImports.userSettings);
const AdminDashboard = lazy(pageImports.adminDashboard);
const AdminApplications = lazy(pageImports.adminApplications);
const AdminUsers = lazy(pageImports.adminUsers);
const AdminRevenue = lazy(pageImports.adminRevenue);
const AdminNotifications = lazy(pageImports.adminNotifications);
const AdminSeo = lazy(pageImports.adminSeo);
const AdminSettings = lazy(pageImports.adminSettings);
const AdminAnnouncements = lazy(pageImports.adminAnnouncements);
const AdminListings = lazy(pageImports.adminListings);
const AdminAuditLogs = lazy(pageImports.adminAuditLogs);
const AdminContactInquiries = lazy(pageImports.adminContactInquiries);
const AdminInvoices = lazy(pageImports.adminInvoices);
const AdminAgents = lazy(pageImports.adminAgents);
const AdminAiTraining = lazy(pageImports.adminAiTraining);
const Guide = lazy(pageImports.guide);
const Faq = lazy(pageImports.faq);
const Contact = lazy(pageImports.contact);
const CompanyInfoPage = lazy(pageImports.companyInfo);
const Terms = lazy(pageImports.terms);
const Privacy = lazy(pageImports.privacy);
const Columns = lazy(pageImports.columns);
const ColumnDetail = lazy(pageImports.columnDetail);
const ColumnCategory = lazy(pageImports.columnCategory);
const GuideKyukakyusha = lazy(pageImports.guideKyukakyusha);
const CompareSites = lazy(pageImports.compareSites);
const AlternativeTrabox = lazy(pageImports.alternativeTrabox);
const ForgotPassword = lazy(pageImports.forgotPassword);
const ResetPassword = lazy(pageImports.resetPassword);
const TruckForm = lazy(pageImports.truckForm);
const MyTrucks = lazy(pageImports.myTrucks);
const NotFound = lazy(pageImports.notFound);

function usePreloadAllPages() {
  useEffect(() => {
    const timer = setTimeout(() => {
      Object.values(pageImports).forEach((importFn) => {
        importFn().catch(() => {});
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!isAdmin) return <Redirect to="/home" />;
  return <Component />;
}

const DASHBOARD_PATHS = [
  "/home", "/cargo", "/cargo/new", "/trucks", "/trucks/new", "/my-trucks",
  "/my-cargo", "/completed-cargo", "/cancelled-cargo", "/companies", "/partners",
  "/transport-ledger", "/payment", "/services", "/settings",
  "/admin", "/admin/applications", "/admin/users", "/admin/revenue", "/admin/invoices",
  "/admin/notifications", "/admin/announcements", "/admin/listings", "/admin/seo", "/admin/settings", "/admin/contact-inquiries", "/admin/audit-logs", "/admin/agents", "/admin/ai-training",
];

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/home">{() => <ProtectedRoute component={Dashboard} />}</Route>
        <Route path="/my-cargo">{() => <ProtectedRoute component={MyCargo} />}</Route>
        <Route path="/completed-cargo">{() => <ProtectedRoute component={CompletedCargo} />}</Route>
        <Route path="/cancelled-cargo">{() => <ProtectedRoute component={CancelledCargo} />}</Route>
        <Route path="/companies">{() => <ProtectedRoute component={Companies} />}</Route>
        <Route path="/partners">{() => <ProtectedRoute component={Partners} />}</Route>
        <Route path="/transport-ledger">{() => <ProtectedRoute component={TransportLedger} />}</Route>
        <Route path="/payment">{() => <ProtectedRoute component={Payment} />}</Route>
        <Route path="/services">{() => <ProtectedRoute component={Services} />}</Route>
        <Route path="/settings">{() => <ProtectedRoute component={UserSettings} />}</Route>
        <Route path="/cargo/new">{() => <ProtectedRoute component={CargoForm} />}</Route>
        <Route path="/cargo/edit/:id">{() => <ProtectedRoute component={CargoForm} />}</Route>
        <Route path="/cargo/:id">{() => <ProtectedRoute component={CargoDetail} />}</Route>
        <Route path="/cargo">{() => <ProtectedRoute component={CargoList} />}</Route>
        <Route path="/my-trucks">{() => <ProtectedRoute component={MyTrucks} />}</Route>
        <Route path="/trucks/new">{() => <ProtectedRoute component={TruckList} />}</Route>
        <Route path="/trucks/edit/:id">{() => <ProtectedRoute component={TruckForm} />}</Route>
        <Route path="/trucks/:id">{() => <ProtectedRoute component={TruckDetail} />}</Route>
        <Route path="/trucks">{() => <ProtectedRoute component={TruckList} />}</Route>
        <Route path="/admin/applications">{() => <AdminRoute component={AdminApplications} />}</Route>
        <Route path="/admin/users">{() => <AdminRoute component={AdminUsers} />}</Route>
        <Route path="/admin/revenue">{() => <AdminRoute component={AdminRevenue} />}</Route>
        <Route path="/admin/invoices">{() => <AdminRoute component={AdminInvoices} />}</Route>
        <Route path="/admin/notifications">{() => <AdminRoute component={AdminNotifications} />}</Route>
        <Route path="/admin/announcements">{() => <AdminRoute component={AdminAnnouncements} />}</Route>
        <Route path="/admin/listings">{() => <AdminRoute component={AdminListings} />}</Route>
        <Route path="/admin/seo">{() => <AdminRoute component={AdminSeo} />}</Route>
        <Route path="/admin/settings">{() => <AdminRoute component={AdminSettings} />}</Route>
        <Route path="/admin/contact-inquiries">{() => <AdminRoute component={AdminContactInquiries} />}</Route>
        <Route path="/admin/audit-logs">{() => <AdminRoute component={AdminAuditLogs} />}</Route>
        <Route path="/admin/agents">{() => <AdminRoute component={AdminAgents} />}</Route>
        <Route path="/admin/ai-training">{() => <AdminRoute component={AdminAiTraining} />}</Route>
        <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>
        <Route path="/guide" component={Guide} />
        <Route path="/faq" component={Faq} />
        <Route path="/contact" component={Contact} />
        <Route path="/company-info" component={CompanyInfoPage} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/column/kyukakyusha" component={ColumnCategory} />
        <Route path="/column/truck-order" component={ColumnCategory} />
        <Route path="/column/carrier-sales" component={ColumnCategory} />
        <Route path="/column/:slug" component={ColumnDetail} />
        <Route path="/column" component={Columns} />
        <Route path="/columns/:slug">{({ params }: any) => <Redirect to={`/column/${params.slug}`} />}</Route>
        <Route path="/columns">{() => <Redirect to="/column" />}</Route>
        <Route path="/guide/kyukakyusha-complete" component={GuideKyukakyusha} />
        <Route path="/compare/kyukakyusha-sites" component={CompareSites} />
        <Route path="/alternative/trabox" component={AlternativeTrabox} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppLayout() {
  const [loc] = useLocation();
  const { isAuthenticated } = useAuth();
  const isDashboardPage = isAuthenticated && DASHBOARD_PATHS.some((p) => loc === p || loc.startsWith(p + "/"));

  usePreloadAllPages();

  useEffect(() => {
    if (typeof (window as any).__dismissSplash === "function") {
      (window as any).__dismissSplash();
    }
  }, []);

  if (isDashboardPage) {
    return (
      <div className="fixed inset-0 flex flex-col">
        <Header />
        <div className="flex-1 min-h-0 overflow-hidden">
          <Router />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Router />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppLayout />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
