import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth-provider";
import { UploadContextProvider } from "@/contexts/upload-context";
import { OutputProvider } from "./contexts/outputMapContext";
import HomePage from "@/pages/home-page";
import UploadPage from "@/pages/upload-page";
import AuthPage from "@/pages/auth-page";
import AdminPage from "@/pages/admin-page";
import DataBrowserPage from "@/pages/data-browser-page";
import StatisticsPage from "@/pages/statistics-page";
import VisualizationsPage from "@/pages/visualizations-page";
import InsightsPage from "@/pages/insights-page";
import ResultsPage from "@/pages/results-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/upload" component={UploadPage} />
      <ProtectedRoute path="/data" component={DataBrowserPage} />
      <ProtectedRoute path="/statistics" component={StatisticsPage} />
      <ProtectedRoute path="/insights" component={InsightsPage} />
      <ProtectedRoute path="/results" component={ResultsPage} />
      <ProtectedRoute path="/visualizations" component={VisualizationsPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <OutputProvider>
            <UploadContextProvider>
              <Router />
              <Toaster />
            </UploadContextProvider>
          </OutputProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
