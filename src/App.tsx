import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import BrandedSplashScreen from "@/src/components/layout/BrandedSplashScreen";
import { AuthProvider, useAuth } from "@/src/components/auth/AuthContext";
import Sidebar from "@/src/components/layout/Sidebar";
import Dashboard from "@/src/components/centers/Dashboard";
import Tutor from "@/src/components/centers/Tutor";
import DocumentCenter from "@/src/components/centers/DocumentCenter";
import SmartNotebook from "@/src/components/centers/SmartNotebook";
import VisionCenter from "@/src/components/centers/VisionCenter";
import ResearchHub from "@/src/components/centers/ResearchHub";
import Productivity from "@/src/components/centers/Productivity";
import STEMHub from "@/src/components/centers/STEMHub";
import SignLanguageCenter from "@/src/components/centers/SignLanguageCenter";
import CreatorStudio from "@/src/components/centers/CreatorStudio";
import TeacherDashboard from "@/src/components/dashboards/TeacherDashboard";
import ParentDashboard from "@/src/components/dashboards/ParentDashboard";
import AdminDashboard from "@/src/components/dashboards/AdminDashboard";
import Subscription from "@/src/components/settings/Subscription";
import Profile from "@/src/components/settings/Profile";
import Emergency from "@/src/components/safety/Emergency";
import { ErrorBoundary } from "@/src/components/safety/ErrorBoundary";
import ConnectivityToast from "@/src/components/safety/ConnectivityToast";
import InstallApp from "@/src/components/safety/InstallApp";
import LandingPage from "@/src/components/landing/LandingPage";
import { motion, AnimatePresence } from "motion/react";
import FeaturesPage from "@/src/components/info/FeaturesPage";
import QAPage from "@/src/components/info/QAPage";
import { 
  PrivacyPolicyPage, TermsOfServicePage, AccountDeletionPage, 
  CookiePolicyPage, BillingPolicyPage, AcceptableUsePage, 
  AIPolicyPage, SecurityPolicyPage, POPIAPage, 
  CopyrightPage, DisclaimerPage, AccessibilityPage, ContactPage 
} from "@/src/components/info/LegalPages";
import GuidePage from "@/src/components/info/GuidePage";
import SponsorsPage from "@/src/components/info/SponsorsPage";
import AboutPage from "@/src/components/info/AboutPage";
import LanguageHub from "@/src/components/study/LanguageHub";
import AccessibilitySettings from "@/src/components/info/AccessibilitySettings";
import WritingCenter from "@/src/components/study/WritingCenter";
import CVBuilder from "@/src/components/study/CVBuilder";
import AINotes from "@/src/components/study/AINotes";
import StudyRoom from "@/src/components/study/StudyRoom";
import { CourseList } from "@/src/components/classroom/CourseList";
import { KeepNotes } from "@/src/components/keep/KeepNotes";
import { useDocumentMetadata } from "@/src/hooks/useDocumentMetadata";
import { usePwaAudit } from "@/src/hooks/usePwaAudit";
import { usePwaSplashScreen } from "@/src/hooks/usePwaSplashScreen";
import CurriculumHub from "@/src/components/study/CurriculumHub";
import { ThemeProvider } from "@/src/components/layout/ThemeContext";
import Whiteboard from "@/src/components/study/Whiteboard";
import GemsWallet from "@/src/components/wallet/GemsWallet";
import CognitiveMastery from "@/src/components/study/CognitiveMastery";
import CognitiveMemoryLab from "@/src/components/study/CognitiveMemoryLab";
import PwaVoiceOnboarding from "@/src/components/pwa/PwaVoiceOnboarding";
import SeoIntelligenceRadar from "@/src/components/seo/SeoIntelligenceRadar";
import SponsorAndDonate from "@/src/components/billing/SponsorAndDonate";
import FutureDevelopment from "@/src/components/info/FutureDevelopment";

import { useKeyboardShortcuts } from "@/src/hooks/useKeyboardShortcuts";

function AppRoutes() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  
  // Register Global Keyboard Shortcuts for Accessibility
  useKeyboardShortcuts();
  
  // Monitor real-time PWA state & log performance metrics
  usePwaAudit();

  // Apply accessibility settings on load
  React.useEffect(() => {
    const saved = localStorage.getItem("accessibility");
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        const root = document.documentElement;
        root.classList.toggle("high-contrast", settings.contrast === "high");
        root.classList.toggle("large-font", settings.fontSize === "large");
        root.classList.toggle("dyslexic-font", settings.dyslexicFont);
        root.classList.toggle("reduced-motion", settings.reducedMotion);
      } catch (e) {
        console.error("Failed to parse accessibility settings", e);
      }
    }
  }, []);

  // Dynamically generate and inject high-DPI startup splash images for standalone PWA launch
  usePwaSplashScreen();
  
  // Dynamically manage page titles & open graph social tags based on active path
  useDocumentMetadata();

  if (loading) {
    return <BrandedSplashScreen message="Loading Grade Master Africa..." />;
  }

  if (!user) {
    const publicPaths = ['/features', '/qa', '/privacy', '/terms', '/account-deletion', '/cookie-policy', '/billing-policy', '/acceptable-use', '/ai-policy', '/security', '/popia', '/copyright', '/disclaimer', '/accessibility-statement', '/contact', '/guide', '/about', '/sponsors', '/sponsor', '/donate', '/future-dev'];
    
    if (publicPaths.includes(location.pathname)) {
      return (
        <div className="bg-white min-h-screen">
          <header className="p-4 border-b border-gray-100 flex items-center justify-between max-w-7xl mx-auto">
            <a href="/" className="text-gray-600 font-bold hover:text-brand-primary transition-colors flex items-center gap-2">
              <span className="text-xl">←</span> Back to Home
            </a>
          </header>
          <Routes>
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/qa" element={<QAPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/account-deletion" element={<AccountDeletionPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/billing-policy" element={<BillingPolicyPage />} />
            <Route path="/acceptable-use" element={<AcceptableUsePage />} />
            <Route path="/ai-policy" element={<AIPolicyPage />} />
            <Route path="/security" element={<SecurityPolicyPage />} />
            <Route path="/popia" element={<POPIAPage />} />
            <Route path="/copyright" element={<CopyrightPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/accessibility-statement" element={<AccessibilityPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sponsors" element={<SponsorsPage />} />
            <Route path="/sponsor" element={<SponsorAndDonate />} />
            <Route path="/donate" element={<SponsorAndDonate />} />
            <Route path="/future-dev" element={<FutureDevelopment />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      );
    }
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex bg-[#030712] text-white min-h-screen relative overflow-x-hidden selection:bg-amber-400/30 selection:text-amber-200">
      {/* Universal 4K Space Science Ambient Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-indigo-900/20 via-amber-600/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-amber-500/15 via-blue-900/20 to-transparent blur-[140px] rounded-full" />
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 min-h-screen pb-28 lg:pb-8 relative z-10">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tutor" element={<Tutor />} />
            <Route path="/curriculum" element={<CurriculumHub />} />
            <Route path="/whiteboard" element={<Whiteboard />} />
            <Route path="/cognitive-lab" element={<CognitiveMastery />} />
            <Route path="/cognitive-memory-lab" element={<CognitiveMemoryLab />} />
            <Route path="/study-lab" element={<CognitiveMastery />} />
            <Route path="/documents" element={<DocumentCenter />} />
            <Route path="/notebook" element={<SmartNotebook />} />
            <Route path="/vision" element={<VisionCenter />} />
            <Route path="/research" element={<ResearchHub />} />
            <Route path="/productivity" element={<Productivity />} />
            <Route path="/stem" element={<STEMHub />} />
            <Route path="/sign-language" element={<SignLanguageCenter />} />
            <Route path="/teacher" element={profile?.role === 'teacher' || profile?.role === 'admin' ? <TeacherDashboard /> : <Navigate to="/" replace />} />
            <Route path="/parent" element={profile?.role === 'parent' || profile?.role === 'admin' ? <ParentDashboard /> : <Navigate to="/" replace />} />
            <Route path="/admin" element={profile?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/wallet" element={<GemsWallet />} />
            <Route path="/referrals" element={<GemsWallet />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/safety" element={<Emergency />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/sponsors" element={<SponsorsPage />} />
            <Route path="/qa" element={<QAPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/account-deletion" element={<AccountDeletionPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/billing-policy" element={<BillingPolicyPage />} />
            <Route path="/acceptable-use" element={<AcceptableUsePage />} />
            <Route path="/ai-policy" element={<AIPolicyPage />} />
            <Route path="/security" element={<SecurityPolicyPage />} />
            <Route path="/popia" element={<POPIAPage />} />
            <Route path="/copyright" element={<CopyrightPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/accessibility-statement" element={<AccessibilityPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/language" element={<LanguageHub />} />
            <Route path="/accessibility" element={<AccessibilitySettings />} />
            <Route path="/writing" element={<WritingCenter />} />
            <Route path="/cv-builder" element={<CVBuilder />} />
            <Route path="/ai-notes" element={<AINotes />} />
            <Route path="/install" element={<PwaVoiceOnboarding />} />
            <Route path="/pwa-install" element={<PwaVoiceOnboarding />} />
            <Route path="/seo" element={<SeoIntelligenceRadar />} />
            <Route path="/sponsor" element={<SponsorAndDonate />} />
            <Route path="/donate" element={<SponsorAndDonate />} />
            <Route path="/study-room" element={<StudyRoom />} />
            <Route path="/classroom" element={<CourseList />} />
            <Route path="/keep" element={<KeepNotes />} />
            <Route path="/creator" element={<CreatorStudio />} />
            <Route path="/future-dev" element={<FutureDevelopment />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      {/* Static UI Assets Reference */}
      <div className="hidden" aria-hidden="true" id="static-assets-preloader">
        <img src="/icon-512.png" alt="Pocket School Logo" referrerPolicy="no-referrer" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
            <ConnectivityToast />
            <InstallApp />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
