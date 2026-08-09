import React from "react";
import { motion } from "motion/react";
import { 
  Bot, BookOpen, Brain, Clock, ShieldCheck, 
  Cpu, FileText, ImageIcon, Settings, Heart, Users,
  Globe, PlayCircle, Video, CheckCircle2, TrendingUp, Sparkles, LayoutGrid, Award, Lock, Headphones, GraduationCap, Building2, Guitar, Trophy, Wrench, Utensils, Palette, HeartHandshake, Tent
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const CORE_FEATURES = [
  {
    icon: ImageIcon,
    title: "STEM-Tuned Scanning",
    description: "Optimized for middle & high school algebra, geometry, physics, chemistry, and biology — where scanning actually shines.",
    color: "text-amber-600 bg-amber-50"
  },
  {
    icon: CheckCircle2,
    title: "Step-by-Step, Not Answer-Only",
    description: "Every solution is broken into teachable steps with the reasoning exposed, so students learn the method — not shortcuts.",
    color: "text-indigo-600 bg-indigo-50"
  },
  {
    icon: Brain,
    title: "Meta-Learning Coach",
    description: "Spaced recall, self-explanation prompts, and error analysis build the study skills that raise grades all year.",
    color: "text-purple-600 bg-purple-50"
  },
  {
    icon: Award,
    title: "One Grade Band, Done Right",
    description: "We focus only on middle & high school STEM. Narrow scope means sharper explanations and fewer wrong turns.",
    color: "text-rose-600 bg-rose-50"
  },
  {
    icon: TrendingUp,
    title: "Progress & Streaks",
    description: "Track mastery by topic, keep a study streak, and see exactly where understanding breaks down.",
    color: "text-emerald-600 bg-emerald-50"
  },
  {
    icon: Users,
    title: "Parent Companion View",
    description: "Parents follow progress and study habits — supportive visibility without hovering over every problem.",
    color: "text-blue-600 bg-blue-50"
  }
];

const SECONDARY_FEATURES = [
  "Advanced Scientific Calculator",
  "Universal Unit Converter",
  "Pomodoro Productivity Timer",
  "Daily Academic Goal Tracking",
  "Streak & Habit Trackers",
  "Gamification & Achievement Badges",
  "Virtual Study Rooms",
  "Real-time Collaboration",
  "Automated Performance Analytics",
  "Subject Roadmaps & Planners",
  "AI Audio Generation",
  "AI Image Generation"
];

const COVERED_SUBJECTS = [
  "Mathematics & Literacy",
  "Physical Sciences (Physics & Chemistry)",
  "Life Sciences (Biology)",
  "Information Technology",
  "Accounting & Economics",
  "Languages & Literature",
  "History & Geography",
  "Agricultural Sciences",
  "Engineering Graphics & Design",
  "Consumer Studies & Hospitality",
  "Visual & Dramatic Arts",
  "Music Theory & Practice",
];

const SUPPORTED_SCHOOLS = [
  { name: "Public Schools", icon: Building2, description: "Fully aligned with CAPS and national curriculum." },
  { name: "Private Schools", icon: GraduationCap, description: "Advanced support for IEB, Cambridge, and independent syllabi." },
  { name: "Technical Schools", icon: Wrench, description: "Specialized environments for IT, engineering, and practical sciences." },
  { name: "Remedial Schools", icon: HeartHandshake, description: "Deep accessibility tools: TTS, sign language, and customized pacing." },
  { name: "Hotel Schools", icon: Utensils, description: "Modules tailored for hospitality, consumer studies, and catering." },
  { name: "Sport Schools", icon: Trophy, description: "Mobile-first, asynchronous learning for athletes always on the move." },
  { name: "Music Schools", icon: Guitar, description: "Tools for audio analysis, theory practice, and rhythm tracking." },
  { name: "Art Schools", icon: Palette, description: "Visual recognition, OCR, and creative research hubs." }
];

export default function FeaturesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20">
      {/* Header */}
      <section className="text-center space-y-6 pt-10 px-4 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-primary/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          The Ultimate Toolkit
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-display font-black text-gray-900 tracking-tighter leading-tight">
          Everything you need to <span className="text-brand-primary">master</span> any subject.
        </h1>
        <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed">
          We've combined state-of-the-art generative AI with proven pedagogical frameworks to create the most comprehensive digital learning environment ever built for African students.
        </p>
      </section>

      {/* Core Features Grid */}
      <section className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", feature.color)}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Secondary Features Checklist */}
      <section className="bg-gray-900 text-white rounded-[4rem] p-12 md:p-20 relative overflow-hidden mx-4">
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
          <Cpu className="w-96 h-96" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight">
            And a massive suite of built-in productivity tools.
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6 text-left">
            {SECONDARY_FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                </div>
                <span className="text-sm font-bold text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Covered Subjects */}
      <section className="px-4">
        <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm p-10 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
            <BookOpen className="w-96 h-96" />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-gray-900">
                Comprehensive Subject Coverage
              </h2>
              <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                Built to support every major discipline across primary and secondary educational phases.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
              {COVERED_SUBJECTS.map((subject, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-amber-50 hover:border-amber-100 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:text-amber-500">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{subject}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Supported Schools */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-gray-900">
              For Every Type of Institution
            </h2>
            <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
              Our architecture adapts to the unique needs of diverse educational environments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUPPORTED_SCHOOLS.map((school, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                  <school.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{school.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  {school.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure & Security */}
      <section className="px-4">
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 md:p-16 flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              Enterprise Grade
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black text-gray-900 leading-tight">
              Secure, fast, and relentlessly reliable.
            </h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Powered by enterprise-grade cloud infrastructure, our application uses military-grade AES-256 encryption for your data and edge-cached CDN delivery for lightning-fast speeds even on low-bandwidth networks.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-widest">
                <Lock className="w-4 h-4 text-gray-400" /> End-to-end encrypted
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-widest">
                <Globe className="w-4 h-4 text-gray-400" /> 99.9% Uptime
              </div>
            </div>
          </div>
          <div className="md:w-1/2 relative">
             <div className="aspect-square bg-gray-50 rounded-[3rem] border border-gray-100 flex items-center justify-center p-10">
                <div className="relative w-full h-full border border-gray-200 bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                  {/* Mock UI Header */}
                  <div className="h-12 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 p-6 space-y-4">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-32 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center">
                       <Bot className="w-8 h-8 text-indigo-300" />
                    </div>
                    <div className="space-y-2 pt-4">
                      <div className="h-2 bg-gray-100 rounded w-full" />
                      <div className="h-2 bg-gray-100 rounded w-5/6" />
                      <div className="h-2 bg-gray-100 rounded w-4/6" />
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
