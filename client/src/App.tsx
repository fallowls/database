import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Prospects from "@/pages/prospects";
import Companies from "@/pages/companies";
import UserManagement from "@/pages/user-management";
import NotFound from "@/pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0f]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}

function AuthenticatedRoutes() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/prospects" component={Prospects} />
        <Route path="/companies" component={Companies} />
        <Route path="/users" component={UserManagement} />
        <Route path="/contacts" component={() => <Redirect to="/prospects" />} />
        <Route path="/dashboard" component={() => <Redirect to="/" />} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const hasToken = !!localStorage.getItem("authToken");

  if (hasToken && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/20 text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={(_u, token) => {
          localStorage.setItem("authToken", token);
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          window.location.href = "/";
        }}
      />
    );
  }

  return <AuthenticatedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
