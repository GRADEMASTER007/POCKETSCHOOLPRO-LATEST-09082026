import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  Notebook,
  FileText, 
  NotebookPen, 
  Eye, 
  Search, 
  Settings, 
  LogOut,
  GraduationCap,
  Sparkles,
  Calendar,
  Layers,
  Users,
  ShieldAlert,
  CreditCard,
  User,
  HelpCircle,
  Info,
  Shield,
  Languages,
  Accessibility,
  Hand,
  Heart,
  HeartHandshake,
  Palette,
  PenTool,
  FileEdit,
  StickyNote,
  Gift,
  Coins,
  Brain,
  Volume2,
  Rocket,
  AlertTriangle,
  Trash2
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/components/auth/AuthContext";
import { motion } from "motion/react";
import logoImage from "@/src/assets/images/pocket_school_logo_1783943073120.jpg";
import SocialShare from "@/src/components/layout/SocialShare";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: GraduationCap, label: "AI Tutor", href: "/tutor" },
  { icon: Layers, label: "Curriculum Hub", href: "/curriculum" },
  { icon: Palette, label: "Whiteboard", href: "/whiteboard" },
  { icon: Brain, label: "Cognitive Lab", href: "/cognitive-lab" },
  { icon: Gift, label: "Gems & Referrals", href: "/wallet" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: PenTool, label: "Writing Assistant", href: "/writing" },
  { icon: FileEdit, label: "CV Builder", href: "/cv-builder" },
  { icon: StickyNote, label: "AI Notes Master", href: "/ai-notes" },
  { icon: NotebookPen, label: "Notebook", href: "/notebook" },
  { icon: Palette, label: "Creator Studio", href: "/creator" },
  { icon: Eye, label: "Vision", href: "/vision" },
  { icon: Search, label: "Research", href: "/research" },
  { icon: Calendar, label: "Productivity", href: "/productivity" },
  { icon: Layers, label: "STEM Hub", href: "/stem" },
  { icon: Hand, label: "Sign Language", href: "/sign-language" },
  { icon: GraduationCap, label: "Classroom", href: "/classroom" },
  { icon: Notebook, label: "Keep", href: "/keep" },
  { icon: Users, label: "Study Room", href: "/study-room" },
  { icon: Rocket, label: "🚀 Future Development", href: "/future-dev" },
];

const dashboardItems = [
  { icon: Users, label: "Teacher Dashboard", href: "/teacher", roles: ["teacher", "admin"] },
  { icon: GraduationCap, label: "Parent Dashboard", href: "/parent", roles: ["parent", "admin"] },
  { icon: ShieldAlert, label: "Admin Dashboard", href: "/admin", roles: ["admin"] },
];

const settingsItems = [
  { icon: Gift, label: "Gems Wallet", href: "/wallet" },
  { icon: CreditCard, label: "Subscription", href: "/subscription" },
  { icon: HeartHandshake, label: "Sponsor & Donate", href: "/sponsor" },
  { icon: ShieldAlert, label: "Safety & SOS", href: "/safety" },
  { icon: Accessibility, label: "Accessibility Center", href: "/accessibility" },
  { icon: User, label: "Profile", href: "/profile" },
];

const resourcesItems = [
  { icon: Volume2, label: "PWA Voice Install", href: "/pwa-install" },
  { icon: Rocket, label: "🚀 Future Development", href: "/future-dev" },
  { icon: Search, label: "SEO Intelligence", href: "/seo" },
  { icon: Info, label: "About Pocket School", href: "/about" },
  { icon: Languages, label: "Language Hub", href: "/language" },
  { icon: Info, label: "Features", href: "/features" },
  { icon: Heart, label: "Sponsors & Partners", href: "/sponsors" },
  { icon: HelpCircle, label: "Q&A", href: "/qa" },
  { icon: Shield, label: "Privacy Policy", href: "/privacy" },
  { icon: FileText, label: "Terms", href: "/terms" },
  { icon: AlertTriangle, label: "Disclaimer", href: "/disclaimer" },
  { icon: Trash2, label: "Data Deletion", href: "/account-deletion" },
  { icon: BookOpen, label: "Guide", href: "/guide" },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout, profile } = useAuth();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 h-screen bg-slate-950/95 border-r border-slate-800 flex-col fixed left-0 top-0 z-50 shadow-2xl backdrop-blur-3xl">
        <div className="p-6 flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="relative">
            <img 
              src={logoImage} 
              alt="Pocket School Pro Logo" 
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover shadow-lg border border-amber-400/50"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-sm leading-tight text-white tracking-tight uppercase tracking-[0.05em]">Pocket School</span>
            <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest flex items-center gap-1">
              PRO GOLD EDITION
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar pb-24">
          <nav className="space-y-1">
            <span className="text-[10px] font-black text-amber-400/80 uppercase tracking-widest px-4 mb-2 block">Learning Hubs</span>
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold text-xs",
                    isActive 
                      ? "bg-amber-400/15 text-amber-300 font-extrabold shadow-lg shadow-amber-500/10 border border-amber-400/30" 
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {dashboardItems.filter(item => item.roles.includes(profile?.role || "student")).length > 0 && (
            <nav className="space-y-1">
              <span className="text-[10px] font-black text-amber-400/80 uppercase tracking-widest px-4 mb-2 block">Management</span>
              {dashboardItems.filter(item => item.roles.includes(profile?.role || "student")).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group font-bold text-xs",
                      isActive 
                        ? "bg-amber-400/15 text-amber-300 border border-amber-400/30" 
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
                    )} />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          <nav className="space-y-1">
            <span className="text-[10px] font-black text-amber-400/80 uppercase tracking-widest px-4 mb-2 block">Account & Wallet</span>
            {settingsItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group font-bold text-xs",
                    isActive 
                      ? "bg-amber-400/15 text-amber-300 border border-amber-400/30" 
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <nav className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 block">Resources</span>
            {resourcesItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-brand-primary/15 text-brand-primary font-medium border border-brand-primary/20" 
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-brand-primary" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-xl space-y-4">
          <div className="px-2">
            <SocialShare variant="minimal" />
          </div>
          
          <div className="flex items-center gap-3 px-2">
            <img 
              src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName || 'User'}&background=random`} 
              alt="Profile" 
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border-2 border-brand-primary/30"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate">{profile?.displayName || 'Guest'}</span>
              <span className="text-[10px] text-slate-400 truncate uppercase tracking-widest font-medium">
                {profile?.role || 'STUDENT'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 bg-white/5 hover:text-white hover:bg-rose-500/80 hover:shadow-lg hover:shadow-rose-500/20 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 z-50 px-6 py-3 flex items-center justify-between pb-safe-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {[
          { icon: LayoutDashboard, href: "/" },
          { icon: GraduationCap, href: "/tutor" },
          { icon: Search, href: "/research" },
          { icon: Calendar, href: "/productivity" },
          { icon: User, href: "/profile" },
        ].map((item, index) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={index}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300",
                isActive ? "text-amber-400 bg-amber-400/15 shadow-lg shadow-amber-500/10 border border-amber-400/30 scale-110" : "text-slate-400 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-2")} />
            </Link>
          );
        })}
      </div>
    </>
  );
}
