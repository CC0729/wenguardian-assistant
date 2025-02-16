
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LearningProvider } from "@/contexts/LearningContext";
import Index from "./pages/Index";
import ActualWords from "./pages/ActualWords";
import FunctionWords from "./pages/FunctionWords";
import Translation from "./pages/Translation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LearningProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/actual-words" element={<ActualWords />} />
            <Route path="/function-words" element={<FunctionWords />} />
            <Route path="/translation" element={<Translation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LearningProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
