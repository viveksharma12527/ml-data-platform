import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import AnnotatorDashboard from "@/pages/AnnotatorDashboard";
import AnnotationInterface from "@/pages/AnnotationInterface";
import SpecialistDashboard from "@/pages/SpecialistDashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/login" />} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/annotator/dashboard" component={AnnotatorDashboard} />
      <Route path="/annotator/annotate/:id" component={AnnotationInterface} />
      <Route path="/specialist/dashboard" component={SpecialistDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
