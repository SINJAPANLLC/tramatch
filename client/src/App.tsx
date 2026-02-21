import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { lazy, Suspense } from "react";

const LandingPage = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const CargoList = lazy(() => import("@/pages/cargo-list"));
const TruckList = lazy(() => import("@/pages/truck-list"));
const CargoDetail = lazy(() => import("@/pages/cargo-detail"));
const TruckDetail = lazy(() => import("@/pages/truck-detail"));
const CargoForm = lazy(() => import("@/pages/cargo-form"));
const MyCargo = lazy(() => import("@/pages/my-cargo"));
const CompletedCargo = lazy(() => import("@/pages/completed-cargo"));
const CancelledCargo = lazy(() => import("@/pages/cancelled-cargo"));
const Companies = lazy(() => import("@/pages/companies"));
const Partners = lazy(() => import("@/pages/partners"));
const TransportLedger = lazy(() => import("@/pages/transport-ledger"));
const Payment = lazy(() => import("@/pages/payment"));
const Services = lazy(() => import("@/pages/services"));
const UserSettings = lazy(() => import("@/pages/user-settings"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const AdminApplications = lazy(() => import("@/pages/admin-applications"));
const AdminUsers = lazy(() => import("@/pages/admin-users"));
const AdminRevenue = lazy(() => import("@/pages/admin-revenue"));
const AdminNotifications = lazy(() => import("@/pages/admin-notifications"));
const AdminSeo = lazy(() => import("@/pages/admin-seo"));
const AdminSettings = lazy(() => import("@/pages/admin-settings"));
const AdminAnnouncements = lazy(() => import("@/pages/admin-announcements"));
const AdminListings = lazy(() => import("@/pages/admin-listings"));
const AdminAuditLogs = lazy(() => import("@/pages/admin-audit-logs"));
const AdminContactInquiries = lazy(() => import("@/pages/admin-contact-inquiries"));
const AdminInvoices = lazy(() => import("@/pages/admin-invoices"));
const AdminAgents = lazy(() => import("@/pages/admin-agents"));
const Guide = lazy(() => import("@/pages/guide"));
const Faq = lazy(() => import("@/pages/faq"));
const Contact = lazy(() => import("@/pages/contact"));
const CompanyInfoPage = lazy(() => import("@/pages/company-info"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Columns = lazy(() => import("@/pages/columns"));
const ColumnDetail = lazy(() => import("@/pages/column-detail"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const TruckForm = lazy(() => import("@/pages/truck-form"));
const MyTrucks = lazy(() => import("@/pages/my-trucks"));
const NotFound = lazy(() => import("@/pages/not-found"));

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
  "/admin/notifications", "/admin/announcements", "/admin/listings", "/admin/seo", "/admin/settings", "/admin/contact-inquiries", "/admin/audit-logs", "/admin/agents",
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
        <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>
        <Route path="/guide" component={Guide} />
        <Route path="/faq" component={Faq} />
        <Route path="/contact" component={Contact} />
        <Route path="/company-info" component={CompanyInfoPage} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/columns/:slug" component={ColumnDetail} />
        <Route path="/columns" component={Columns} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppLayout() {
  const [loc] = useLocation();
  const { isAuthenticated } = useAuth();
  const isDashboardPage = isAuthenticated && DASHBOARD_PATHS.some((p) => loc === p || loc.startsWith(p + "/"));

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
