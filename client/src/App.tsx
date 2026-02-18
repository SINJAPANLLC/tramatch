import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import Footer from "@/components/footer";
import LandingPage from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import CargoList from "@/pages/cargo-list";
import TruckList from "@/pages/truck-list";
import CargoDetail from "@/pages/cargo-detail";
import TruckDetail from "@/pages/truck-detail";
import CargoForm from "@/pages/cargo-form";
import MyCargo from "@/pages/my-cargo";
import CompletedCargo from "@/pages/completed-cargo";
import CancelledCargo from "@/pages/cancelled-cargo";
import Companies from "@/pages/companies";
import Partners from "@/pages/partners";
import TransportLedger from "@/pages/transport-ledger";
import Payment from "@/pages/payment";
import Services from "@/pages/services";
import UserSettings from "@/pages/user-settings";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminApplications from "@/pages/admin-applications";
import AdminUsers from "@/pages/admin-users";
import AdminRevenue from "@/pages/admin-revenue";
import AdminNotifications from "@/pages/admin-notifications";
import AdminSeo from "@/pages/admin-seo";
import AdminSettings from "@/pages/admin-settings";
import AdminAnnouncements from "@/pages/admin-announcements";
import Guide from "@/pages/guide";
import Faq from "@/pages/faq";
import Contact from "@/pages/contact";
import CompanyInfoPage from "@/pages/company-info";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Columns from "@/pages/columns";
import ColumnDetail from "@/pages/column-detail";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

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
  "/home", "/cargo", "/cargo/new", "/trucks", "/trucks/new",
  "/my-cargo", "/completed-cargo", "/cancelled-cargo", "/companies", "/partners",
  "/transport-ledger", "/payment", "/services", "/settings",
  "/admin", "/admin/applications", "/admin/users", "/admin/revenue",
  "/admin/notifications", "/admin/announcements", "/admin/seo", "/admin/settings",
];

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
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
      <Route path="/cargo/:id" component={CargoDetail} />
      <Route path="/cargo" component={CargoList} />
      <Route path="/trucks/:id" component={TruckDetail} />
      <Route path="/trucks" component={TruckList} />
      <Route path="/admin/applications">{() => <AdminRoute component={AdminApplications} />}</Route>
      <Route path="/admin/users">{() => <AdminRoute component={AdminUsers} />}</Route>
      <Route path="/admin/revenue">{() => <AdminRoute component={AdminRevenue} />}</Route>
      <Route path="/admin/notifications">{() => <AdminRoute component={AdminNotifications} />}</Route>
      <Route path="/admin/announcements">{() => <AdminRoute component={AdminAnnouncements} />}</Route>
      <Route path="/admin/seo">{() => <AdminRoute component={AdminSeo} />}</Route>
      <Route path="/admin/settings">{() => <AdminRoute component={AdminSettings} />}</Route>
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
