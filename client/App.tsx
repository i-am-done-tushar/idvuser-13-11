import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { VerificationProgressPage } from "./components/VerificationProgressPage";
import { VerificationSuccessPage } from "./components/VerificationSuccessPage";
import { AuthLoginPage } from "./components/AuthLoginPage";
import { AuthOtpPage } from "./components/AuthOtpPage";
import { Dashboard } from "./components/Dashboard";
import Profile from "./pages/Profile";
import { PasswordSetupPage } from "./components/PasswordSetupPage";
import { OngoingVerificationPage } from "./components/OngoingVerificationPage";
import { ExpiredVerificationPage } from "./components/ExpiredVerificationPage";
import { VerifiedCredentialsPage } from "./components/VerifiedCredentialsPage";

//1st change

import { createBrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/form" element={<Index />} />
          <Route
            path="/verification-progress"
            element={<VerificationProgressPage />}
          />
          <Route
            path="/verification-success"
            element={<VerificationSuccessPage />}
          />
          <Route path="/password-setup" element={<PasswordSetupPage />} />
          <Route path="/auth/login" element={<AuthLoginPage />} />
          <Route path="/auth/otp" element={<AuthOtpPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/ongoing-verification"
            element={<OngoingVerificationPage />}
          />
          <Route
            path="/expired-verification"
            element={<ExpiredVerificationPage />}
          />
          <Route
            path="/verified-credentials"
            element={<VerifiedCredentialsPage />}
          />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
