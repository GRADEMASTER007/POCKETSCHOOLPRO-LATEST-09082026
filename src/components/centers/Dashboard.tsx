import React from "react";
import { motion } from "motion/react";
import { 
  GraduationCap, 
  FileText, 
  NotebookPen, 
  Eye, 
  Search, 
  Sparkles,
  PenTool,
  FileEdit,
  StickyNote,
  TrendingUp,
  Clock,
  ArrowRight,
  Play,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/components/auth/AuthContext";
import { cn } from "@/src/lib/utils";
import dashboardBanner from "@/src/assets/images/dashboard_header_banner_1783943406822.jpg";
import Gamification from "@/src/components/study/Gamification";
import MotivationalDaily from "@/src/components/study/MotivationalDaily";
import GradeTracker from "@/src/components/study/GradeTracker";
import StreakTracker from "@/src/components/study/StreakTracker";
import Badges from "@/src/components/study/Badges";
import DailyGoals from "@/src/components/study/DailyGoals";
import SubjectPerformance from "@/src/components/study/SubjectPerformance";
import FocusTimer from "@/src/components/study/FocusTimer";
import ExamCountdown from "@/src/components/study/ExamCountdown";
import StudyBuddies from "@/src/components/study/StudyBuddies";
import DataSeeder from "@/src/components/study/DataSeeder";
import StudyRoadmap from "@/src/components/study/StudyRoadmap";
import StudyQuests from "@/src/components/study/StudyQuests";

const StatCard = ({ icon: Icon, label, value, color, progress = 0 }: any) => (
  <motion.div 
    whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
    className="bg-slate-900/90 backdrop-blur-2xl p-5 rounded-3xl border border-slate-800 shadow-xl flex items-center gap-4 relative overflow-hidden group text-white hover:border-amber-400/40 transition-all"
    role="status"
    aria-label={`${label}: ${value}`}
  >
    <div className={cn("w-12 h-12 rounded-[1rem] flex items-center justify-center relative z-10 shrink-0", color)} aria-hidden="true">
      <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
    </div>
    <div className="relative z-10 min-w-0">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5 truncate">{label}</p>
      <p className="text-xl font-display font-black text-white leading-none tracking-tight">{value}</p>
    </div>
    {progress > 0 && (
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500"
        />
      </div>
    )}
  </motion.div>
);

import StudyPlanner from "@/src/components/study/StudyPlanner";
import UsageStats from "@/src/components/dashboard/UsageStats";

const HubCard = ({ icon: Icon, title, description, href, color, featured }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -8 }}
    className="h-full"
  >
    <Link 
      to={href} 
      aria-label={`Open ${title} hub: ${description}`}
      className={cn(
        "group relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 h-full block backdrop-blur-2xl",
        featured 
          ? "bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 text-white border-amber-400/50 shadow-2xl shadow-amber-500/10 hover:border-amber-400" 
          : "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl"
      )}
    >
      {featured && (
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
          <Sparkles className="w-64 h-64 text-amber-400" />
        </div>
      )}
      <div className="p-8 md:p-10 h-full flex flex-col relative z-10">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
          featured ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30" : color + " shadow-sm"
        )}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-2xl font-display font-black mb-3 tracking-tight text-white">{title}</h3>
        <p className="text-xs md:text-sm leading-relaxed mb-8 flex-1 font-medium text-slate-300">{description}</p>
        <div className={cn(
          "flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]",
          featured ? "text-amber-400" : "text-sky-400"
        )}>
          <span>Open Hub</span>
          <div className="w-8 h-[2px] bg-current transition-all group-hover:w-12" />
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  </motion.div>
);

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Premium Hero Section */}
      <header>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-[4rem] overflow-hidden bg-brand-primary shadow-2xl shadow-brand-primary/20 min-h-[450px] flex items-center"
        >
          <div className="absolute inset-0">
            <img 
              src={dashboardBanner} 
              alt="Pocket School Pro Dashboard Banner" 
              className="w-full h-full object-cover opacity-50 mix-blend-overlay scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-primary/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-primary/40 to-transparent" />
          </div>
          
          <div className="relative z-10 p-12 md:p-16 lg:p-24 flex flex-col md:flex-row items-center md:items-end justify-between gap-12 w-full">
            <div className="max-w-2xl text-center md:text-left">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 backdrop-blur-xl text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-white/20"
              >
                <Sparkles className="w-4 h-4 text-brand-secondary" />
                POCKET SCHOOL PRO
              </motion.div>
              <div className="text-[10px] text-white/50 font-black uppercase tracking-[0.4em] mb-8 ml-2">by Grade Master Africa</div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-6xl md:text-7xl lg:text-8xl font-display font-black mb-8 text-white tracking-tighter leading-[0.85]"
              >
                READY TO CONQUER,<br />
                {profile?.displayName?.split(' ')[0] || 'Scholar'}!
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-white/70 leading-relaxed max-w-lg font-medium"
              >
                Your personalized AI learning path is waiting. You've completed 65% of this week's goals.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex-shrink-0 flex flex-col items-center gap-4"
            >
              <Link to="/tutor" className="group w-28 h-28 bg-white rounded-full flex items-center justify-center text-brand-primary shadow-2xl shadow-black/20 hover:scale-110 transition-all duration-500">
                <Play className="w-12 h-12 fill-brand-primary ml-2 group-hover:scale-110 transition-transform" />
              </Link>
              <div className="text-center">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">RESUME STUDY</p>
                <p className="text-sm font-black text-white">Biology: DNA Structure</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </header>

      {/* Seeder Widget */}
      <DataSeeder />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <StatCard 
              icon={TrendingUp} 
              label="Learning Streak" 
              value="12 Days" 
              color="bg-orange-50 text-orange-500"
              progress={75}
            />
            <StatCard 
              icon={Clock} 
              label="Study Time" 
              value="42.5 hrs" 
              color="bg-blue-50 text-blue-500"
              progress={45}
            />
            <div className="col-span-2 md:col-span-1">
              <StatCard 
                icon={GraduationCap} 
                label="Modules" 
                value="8 Completed" 
                color="bg-purple-50 text-purple-500"
                progress={90}
              />
            </div>
          </div>

          <section className="space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-display font-black text-brand-primary tracking-tight">Active Hubs</h2>
              <button className="text-[10px] font-black uppercase tracking-widest text-brand-secondary hover:underline">View All Centers</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <HubCard 
                featured={true}
                icon={GraduationCap}
                title="Aristotle AI Tutor"
                description="Real-time tutoring with natural emotion. Your personal CAPS curriculum specialist."
                href="/tutor"
              />
              <div className="grid grid-cols-1 gap-8">
                <HubCard 
                  icon={FileText}
                  title="Curriculum Hub"
                  description="Complete access to all CAPS subjects and interactive labs."
                  href="/curriculum"
                  color="bg-emerald-50 text-emerald-600"
                />
                <HubCard 
                  icon={NotebookPen}
                  title="Smart Notebook"
                  description="AI-enhanced note taking with cloud sync."
                  href="/notebook"
                  color="bg-amber-50 text-amber-600"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <HubCard 
                  icon={PenTool}
                  title="Writing Assistant"
                  description="Essay ideas, drafting help, and assignment structures."
                  href="/writing"
                  color="bg-indigo-50 text-indigo-600"
                />
                <HubCard 
                  icon={FileEdit}
                  title="CV Builder"
                  description="Create professional Curriculum Vitae with AI guidance."
                  href="/cv-builder"
                  color="bg-slate-50 text-slate-600"
                />
                <HubCard 
                  icon={StickyNote}
                  title="AI Notes Master"
                  description="Snap homework photos or speak to create perfect notes."
                  href="/ai-notes"
                  color="bg-amber-50 text-amber-600"
                />
            </div>
          </section>

          <StudyQuests />

          <StudyRoadmap />
        </div>

        <div className="space-y-10">
          <UsageStats />
          <Gamification />
          <StudyPlanner />
          <FocusTimer />
          <ExamCountdown />
        </div>
      </div>
    </div>
  );
}
