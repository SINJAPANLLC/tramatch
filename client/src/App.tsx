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
import Admin from "@/pages/admin";
import CargoList from "@/pages/cargo-list";
import TruckList from "@/pages/truck-list";
import CargoDetail from "@/pages/cargo-detail";
import TruckDetail from "@/pages/truck-detail";
import CargoForm from "@/pages/cargo-form";
import TruckForm from "@/pages/truck-form";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/home">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/admin">{() => <AdminRoute component={Admin} />}</Route>
      <Route path="/cargo" component={CargoList} />
      <Route path="/cargo/new">{() => <ProtectedRoute component={CargoForm} />}</Route>
      <Route path="/cargo/:id" component={CargoDetail} />
      <Route path="/trucks" component={TruckList} />
      <Route path="/trucks/new">{() => <ProtectedRoute component={TruckForm} />}</Route>
      <Route path="/trucks/:id" component={TruckDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [loc] = useLocation();
  const isDashboard = loc === "/home";

  if (isDashboard) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">
          <Router />
        </main>
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
