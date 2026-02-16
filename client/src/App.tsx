import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Home from "@/pages/home";
import CargoList from "@/pages/cargo-list";
import TruckList from "@/pages/truck-list";
import CargoDetail from "@/pages/cargo-detail";
import TruckDetail from "@/pages/truck-detail";
import CargoForm from "@/pages/cargo-form";
import TruckForm from "@/pages/truck-form";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cargo" component={CargoList} />
      <Route path="/cargo/new" component={CargoForm} />
      <Route path="/cargo/:id" component={CargoDetail} />
      <Route path="/trucks" component={TruckList} />
      <Route path="/trucks/new" component={TruckForm} />
      <Route path="/trucks/:id" component={TruckDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
