import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Globe, BookOpen, Rocket, ArrowRight, 
  Brain, Calculator, Atom, CheckCircle2, 
  Scan, Camera, Zap, ShieldCheck, Play, Pause, Volume2, 
  Star, Check, HelpCircle, Layers, ChevronRight, 
  Cpu, FileText, Flame, Coins, Radio, Users, Award,
  Clock, TrendingUp, Heart, Shield, Eye, BarChart3, Lock, Target,
  Mail, Share2, Twitter, Facebook, Linkedin, Instagram, MessageCircle, MapPin
} from "lucide-react";
import { useAuth } from "@/src/components/auth/AuthContext";
import SocialShare from "@/src/components/layout/SocialShare";

// Space / Cosmic Background
const MovingCosmicSpaceBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#030712]">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-transparent blur-[140px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-amber-600/20 via-blue-900/20 to-transparent blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full border border-amber-500/10 animate-[spin_60s_linear_infinite]">
        <div className="w-4 h-4 bg-amber-400 rounded-full shadow-[0_0_20px_#f59e0b] absolute -top-2 left-1/2 -translate-x-1/2" />
      </div>
      <div className="absolute top-1/3 right-12 w-96 h-96 rounded-full border border-blue-500/10 animate-[spin_90s_linear_infinite_reverse]">
        <div className="w-6 h-6 bg-cyan-400 rounded-full shadow-[0_0_25px_#22d3ee] absolute -bottom-3 left-1/2 -translate-x-1/2" />
      </div>
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
};

export default function LandingPage() {
  const { login } = useAuth();
  
  // Interactive Whiteboard Recall Quiz State
  const [selectedRecallMethod, setSelectedRecallMethod] = useState<string | null>(null);
  const [recallFeedback, setRecallFeedback] = useState<string | null>(null);

  const handleSelectRecall = (method: string) => {
    setSelectedRecallMethod(method);
    if (method === "shells") {
      setRecallFeedback("🎉 Correct! The cylindrical shells method V = 2π ∫₀² x(4 - x²) dx avoids splitting integration limits along the y-axis. +18% Mastery XP earned!");
    } else {
      setRecallFeedback("💡 Good try! Disks method would require splitting the region along y = x² and subtracting areas. Cylindrical shells is much cleaner here!");
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-amber-400 selection:text-black overflow-x-hidden">
      <SocialShare variant="floating" />
      
      {/* 1. TOP HEADER & NAVBAR */}
      <header className="relative z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 flex items-center justify-center font-black text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            P
          </div>
          <div>
            <div className="font-black text-white text-lg tracking-tight flex items-center gap-2">
              Pocket School Pro
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 uppercase">
                Gold Edition
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
              Grade Master Africa
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-300">
            <a href="#whiteboard-section" className="hover:text-amber-300 transition-colors">The Whiteboard</a>
            <a href="#how-it-works" className="hover:text-amber-300 transition-colors">How It Works</a>
            <a href="#features-grid" className="hover:text-amber-300 transition-colors">Features</a>
            <a href="#pricing-tiers" className="hover:text-amber-300 transition-colors">Subscriptions</a>
            <Link to="/future-dev" className="text-amber-400 font-extrabold hover:text-amber-300 transition-colors flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              🚀 Future Development
            </Link>
          </div>

          <button
            onClick={login}
            className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transition-all flex items-center gap-1.5"
          >
            <span>Get Started Free</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-24 px-6 text-center overflow-hidden">
        <MovingCosmicSpaceBackground />

        <div className="max-w-5xl mx-auto relative z-10 space-y-8">
          
          {/* Trust & Category Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-[0_0_20px_rgba(245,158,11,0.15)] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Primary School (Grades R–7) & High School (Grades 8–12)
            </span>
            <span className="px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" /> Loved by learners, parents & teachers
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] text-white uppercase">
              Scan it. Understand it. <br />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent italic">
                Master it.
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-medium">
              Pocket School Pro turns any primary, middle, or high school problem into a clear, step-by-step explanation — from <strong className="text-amber-300">Grade R phonics & basic math</strong> to <strong className="text-amber-300">Grade 12 matric calculus & physical sciences</strong>. <strong className="text-amber-300">Learning that ends your dependency on answers.</strong>
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={login}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-lg uppercase tracking-wider shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              <Zap className="w-6 h-6 fill-black" />
              Get Started Free
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-amber-400 text-slate-200 font-bold text-base flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-5 h-5 text-amber-400 fill-amber-400" /> See How It Works
            </a>
          </div>

          {/* Calculus Hero Showcase Graphic Card */}
          <div className="pt-8 max-w-4xl mx-auto text-left">
            <div className="p-1 rounded-[2.5rem] bg-gradient-to-b from-amber-500/40 via-slate-800 to-slate-900 border border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.2)] overflow-hidden">
              <div className="bg-slate-950 p-6 md:p-8 rounded-[2.3rem] space-y-6">
                
                {/* Header line */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      Pocket School Pro • Calculus Demo
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-bold">
                      Solved in 2.1 seconds
                    </span>
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-bold">
                      Mastery +18% this week
                    </span>
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="space-y-2">
                  <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Scanned STEM Problem</div>
                  <div className="text-xl md:text-2xl font-bold text-white font-mono bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                    "Find the volume of the solid formed by rotating y = x², y = 4 about the y-axis."
                  </div>
                </div>

                {/* Step 1 Preview with rendered Diagram */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                  <div className="space-y-3">
                    <div className="inline-block px-3 py-1 bg-amber-400 text-black text-xs font-black uppercase rounded-lg">
                      Step 1: Visualize the region
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      The region is bounded by the parabola <code className="text-amber-300">y = x²</code>, line <code className="text-cyan-300">y = 4</code>, and <code className="text-emerald-300">x = 0</code>. Rotating around the y-axis sweeps out a bowl solid.
                    </p>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-amber-300 font-mono text-sm font-bold">
                      Final answer: volume = 8π cubic units
                    </div>
                  </div>

                  {/* SVG Parabola Rotation Diagram */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-center items-center">
                    <svg viewBox="0 0 200 160" className="w-full max-w-[200px] h-auto">
                      {/* Grid / Axes */}
                      <line x1="20" y1="130" x2="180" y2="130" stroke="#475569" strokeWidth="1.5" />
                      <line x1="100" y1="10" x2="100" y2="150" stroke="#475569" strokeWidth="1.5" />
                      <text x="185" y="134" fill="#94A3B8" fontSize="10" fontWeight="bold">x</text>
                      <text x="96" y="8" fill="#94A3B8" fontSize="10" fontWeight="bold">y</text>
                      
                      {/* y = 4 Line */}
                      <line x1="40" y1="30" x2="160" y2="30" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4 2" />
                      <text x="165" y="34" fill="#38BDF8" fontSize="10" fontWeight="bold">y = 4</text>

                      {/* Parabola y = x^2 */}
                      <path d="M 40 30 Q 100 130 160 30" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="3" />
                      <text x="120" y="80" fill="#F59E0B" fontSize="10" fontWeight="bold">y = x²</text>

                      {/* Rotation Arrow */}
                      <path d="M 90 20 A 15 10 0 0 1 110 20" fill="none" stroke="#22D3EE" strokeWidth="2" markerEnd="url(#arrow)" />
                      <text x="100" y="138" fill="#94A3B8" fontSize="9">0</text>
                    </svg>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Social Proof Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-center space-y-1">
              <div className="text-3xl font-black text-amber-400">2M+</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Problems Explained</div>
            </div>
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-center space-y-1">
              <div className="text-3xl font-black text-cyan-400">6</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">STEM Subjects Covered</div>
            </div>
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-center space-y-1">
              <div className="text-3xl font-black text-emerald-400">94%</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Would Recommend</div>
            </div>
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-center space-y-1">
              <div className="text-3xl font-black text-yellow-400">4.9★</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Average Rating</div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. THE WHITEBOARD SECTION */}
      <section id="whiteboard-section" className="py-24 px-6 bg-slate-950 relative border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-400" /> The Whiteboard
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Every answer, explained like a tutor at the whiteboard
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              No dark chat wall of text. Just a clean canvas with structured step blocks and diagrams rendered right where they belong — so the thinking is the hero.
            </p>
          </div>

          {/* Interactive Whiteboard Session Simulator Card */}
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl p-6 md:p-10 space-y-8">
            
            {/* Whiteboard Session Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                  Pocket School Pro • AI tutor · whiteboard session • Calculus
                </span>
              </div>
              <span className="px-3 py-1 bg-amber-400/10 text-amber-300 rounded-full text-xs font-bold border border-amber-400/20">
                Interactive Canvas Active
              </span>
            </div>

            {/* Scanned Problem Box */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Scanned Problem</div>
              <p className="text-lg font-bold text-white">
                How do I find the volume of the solid formed by rotating the region bounded by y = x², y = 4, and x = 0 about the y-axis?
              </p>
            </div>

            <p className="text-slate-300 text-sm font-semibold italic">
              Let's solve this step by step using the disk method.
            </p>

            {/* 4 Whiteboard Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Step 1 */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-black text-xs font-black flex items-center justify-center">1</span>
                  <h4 className="text-base font-bold text-white">Step 1: Visualize the region</h4>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  The region is bounded by the parabola y = x², the horizontal line y = 4, and the vertical line x = 0. Rotating it about the y-axis sweeps out a smooth bowl-shaped solid.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-black text-xs font-black flex items-center justify-center">2</span>
                  <h4 className="text-base font-bold text-white">Step 2: Set up the integral</h4>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Using the disk method, the radius of each disk is R(y) = √y (since x = √y comes from y = x²). The area of one disk is A(y) = πR(y)² = πy. Limits for y run from 0 to 4.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-black text-xs font-black flex items-center justify-center">3</span>
                  <h4 className="text-base font-bold text-white">Step 3: Evaluate the integral</h4>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl font-mono text-xs text-amber-300 space-y-1">
                  <div>V = ∫₀⁴ A(y) dy = ∫₀⁴ πy dy</div>
                  <div>= π [y² / 2]₀⁴ = π (16 / 2) = 8π</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-black text-xs font-black flex items-center justify-center">4</span>
                  <h4 className="text-base font-bold text-white">Step 4: Final answer</h4>
                </div>
                <p className="text-emerald-400 font-extrabold text-sm">
                  The volume of the solid is 8π cubic units.
                </p>
              </div>

            </div>

            {/* Meta-Learning Practice Recall Box */}
            <div className="bg-gradient-to-r from-amber-500/20 via-slate-950 to-indigo-950 p-6 rounded-2xl border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-300">
                <Brain className="w-4 h-4 text-amber-400" /> Meta-Learning Recall Practice
              </div>
              <p className="text-sm font-bold text-white">
                Now you try: find the volume when the same region is rotated about the x-axis. Which method fits best — disks or shells?
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => handleSelectRecall("disks")}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedRecallMethod === "disks" 
                      ? "bg-slate-800 border-amber-400 text-amber-300" 
                      : "bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-200"
                  }`}
                >
                  Disks Method
                </button>
                <button
                  onClick={() => handleSelectRecall("shells")}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedRecallMethod === "shells" 
                      ? "bg-amber-400 text-black border-amber-300" 
                      : "bg-slate-900 border-slate-700 hover:border-amber-400 text-slate-200"
                  }`}
                >
                  Cylindrical Shells Method
                </button>
              </div>

              {recallFeedback && (
                <div className="p-4 bg-slate-900/90 rounded-xl border border-amber-400/40 text-xs font-bold text-amber-200 animate-fadeIn">
                  {recallFeedback}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="text-center pt-2">
              <button
                onClick={login}
                className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-sm uppercase rounded-2xl tracking-wider shadow-lg transition-all"
              >
                Try a Whiteboard Session
              </button>
              <p className="text-xs text-slate-400 font-bold mt-2">
                Works for algebra, geometry, physics, chemistry & more.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 2.5 FEATURED TESTIMONIALS */}
      <section className="py-24 px-6 bg-[#030712] relative">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
              Trusted by <span className="text-amber-400 italic">Thousands</span> of Success Stories
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Real results from students, parents, and educators who transformed their academic journey with Pocket School Pro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 space-y-6 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full group-hover:bg-amber-500/10 transition-all" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-slate-200 text-lg italic leading-relaxed">
                "Pocket School Pro changed everything for my son in Grade 11. He went from struggling with Physics to scoring 85% in his finals. The step-by-step explanations are truly magic."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-bold text-black">LM</div>
                <div>
                  <div className="font-bold text-white">Lerato M.</div>
                  <div className="text-xs text-slate-500">Parent • Johannesburg, ZA</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-amber-500/20 space-y-6 relative overflow-hidden group shadow-[0_0_40px_rgba(245,158,11,0.05)]">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full group-hover:bg-cyan-500/10 transition-all" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-slate-200 text-lg italic leading-relaxed">
                "As a teacher, I recommend this to all my students. It doesn't just give answers; it teaches the methodology. The inclusion of Sign Language and accessibility is a game-changer."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-black">Dr. K</div>
                <div>
                  <div className="font-bold text-white">Dr. Kofi A.</div>
                  <div className="text-xs text-slate-500">Educator • Accra, Ghana</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 space-y-6 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full group-hover:bg-purple-500/10 transition-all" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-slate-200 text-lg italic leading-relaxed">
                "Grade 12 Calculus used to keep me up at night. Now, I scan a problem, and Pocket School Pro walks me through it like a private tutor. My confidence has skyrocketed!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-400 to-pink-600 flex items-center justify-center font-bold text-black">TJ</div>
                <div>
                  <div className="font-bold text-white">Thabo J.</div>
                  <div className="text-xs text-slate-500">Student • Cape Town, ZA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.75 GLOBAL IMPACT SECTION */}
      <section className="py-24 px-6 bg-slate-950 relative border-t border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
          <Globe className="w-full h-full text-amber-500 animate-pulse" />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10 space-y-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-widest">
              <Globe className="w-4 h-4" /> Global Reach
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
              An Academic Ecosystem <br />
              <span className="text-amber-400">Without Borders</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From the classrooms of Johannesburg to study hubs in Accra and beyond, Pocket School Pro is localizing world-class AI for every learner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
              <div className="text-4xl font-black text-white">40+</div>
              <div className="text-xs font-black uppercase text-amber-400 tracking-widest">Countries</div>
              <p className="text-slate-400 text-sm">Active subscribers across Africa and the global diaspora.</p>
            </div>
            <div className="space-y-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
              <div className="text-4xl font-black text-white">11+</div>
              <div className="text-xs font-black uppercase text-cyan-400 tracking-widest">SA Languages</div>
              <p className="text-slate-400 text-sm">Full voice support for all official South African languages.</p>
            </div>
            <div className="space-y-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
              <div className="text-4xl font-black text-white">250M+</div>
              <div className="text-xs font-black uppercase text-purple-400 tracking-widest">Tokens / mo</div>
              <p className="text-slate-400 text-sm">Massive computing power for institutional school passes.</p>
            </div>
            <div className="space-y-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
              <div className="text-4xl font-black text-white">99.9%</div>
              <div className="text-xs font-black uppercase text-emerald-400 tracking-widest">Uptime</div>
              <p className="text-slate-400 text-sm">Enterprise-grade reliability for consistent study sessions.</p>
            </div>
          </div>

          {/* Social Sharing Component Integrated */}
          <div className="pt-12 border-t border-slate-800 flex flex-col items-center gap-8">
            <SocialShare variant="full" />
            <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-sm font-bold">
              <Award className="w-5 h-5 text-amber-400" /> Refer a Learner and get 15% off your next renewal!
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (3 STEPS) */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900/60 relative border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-extrabold uppercase tracking-widest">
              <Play className="w-4 h-4 text-cyan-400" /> How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              From stuck to solved — and actually understood
            </h2>
            <p className="text-slate-400 text-base md:text-lg">
              Three steps that turn a confusing problem into a skill you keep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 01 */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-4 relative group hover:border-amber-400/50 transition-all">
              <div className="text-5xl font-black text-amber-400/30 group-hover:text-amber-400 transition-colors">01</div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Scan className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Scan the problem</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Point your camera at any handwritten or printed STEM question. Our vision engine reads equations, diagrams, and word problems — no retyping.
              </p>
            </div>

            {/* Step 02 */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-4 relative group hover:border-cyan-400/50 transition-all">
              <div className="text-5xl font-black text-cyan-400/30 group-hover:text-cyan-400 transition-colors">02</div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Understand every step</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Get a clear, step-by-step explanation in plain language — the why behind each move, not just a final answer to copy.
              </p>
            </div>

            {/* Step 03 */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-4 relative group hover:border-emerald-400/50 transition-all">
              <div className="text-5xl font-black text-emerald-400/30 group-hover:text-emerald-400 transition-colors">03</div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Master the skill</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A meta-learning coach turns the concept into recall practice, so it sticks. Next time, you solve it on your own.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. FEATURES GRID */}
      <section id="features-grid" className="py-24 px-6 bg-slate-950 relative border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-extrabold uppercase tracking-widest">
              <Layers className="w-4 h-4 text-purple-400" /> Features
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Everything a STEM student needs to become independent
            </h2>
            <p className="text-slate-400 text-base md:text-lg">
              Not a homework shortcut — a study partner built to make itself unnecessary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold">
                <Scan className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">STEM-tuned scanning</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Optimized for middle & high school algebra, geometry, physics, chemistry, and biology — where scanning actually shines.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Step-by-step, not answer-only</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Every solution is broken into teachable steps with the reasoning exposed, so students learn the method — not shortcuts.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-400/10 text-purple-400 flex items-center justify-center font-bold">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Meta-learning coach</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Spaced recall, self-explanation prompts, and error analysis build the study skills that raise grades all year.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-400/10 text-rose-400 flex items-center justify-center font-bold">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">One grade band, done right</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                We focus only on middle & high school STEM. Narrow scope means sharper explanations and fewer wrong turns.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center font-bold">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Progress & streaks</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Track mastery by topic, keep a study streak, and see exactly where understanding breaks down.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-400/10 text-blue-400 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Parent companion view</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Parents follow progress and study habits — supportive visibility without hovering over every problem.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. WHY POCKET SCHOOL PRO / COMPARISON MATRIX */}
      <section id="why-pocket-school" className="py-24 px-6 bg-slate-900/80 relative border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
              <Award className="w-4 h-4 text-amber-400" /> Why Pocket School Pro
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Answer apps make you dependent. We make you capable.
            </h2>
            <p className="text-slate-400 text-base md:text-lg">
              Photomath, Gauth, and Chegg optimize for a fast answer. We optimize for the day you don't need us — deep explanations and real study skills for middle & high school STEM.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="py-5 px-6">Capability</th>
                    <th className="py-5 px-6 text-amber-300 bg-amber-500/10">Pocket School Pro (Us)</th>
                    <th className="py-5 px-6 text-slate-500">Answer Apps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm font-bold">
                  <tr>
                    <td className="py-4 px-6 text-white">Step-by-step explanations</td>
                    <td className="py-4 px-6 text-amber-300 bg-amber-500/5 flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400" /> Deep reasoning exposed
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-normal">Answer-first shortcuts</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white">Teaches you to study on your own</td>
                    <td className="py-4 px-6 text-amber-300 bg-amber-500/5 flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400" /> Meta-learning skill coaching
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-normal">None / Generic text</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white">Built for middle & high school STEM</td>
                    <td className="py-4 px-6 text-amber-300 bg-amber-500/5 flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400" /> Focused Grades 6–12 scope
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-normal">Generic spread thin</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white">Parent progress view</td>
                    <td className="py-4 px-6 text-amber-300 bg-amber-500/5 flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400" /> Parent progress companion
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-normal">No parent visibility</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white">Designed for learning integrity</td>
                    <td className="py-4 px-6 text-amber-300 bg-amber-500/5 flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400" /> Explains, never gives shortcuts
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-normal">Copy-paste answers</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4 Focus Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
              <div className="text-xs font-black uppercase tracking-widest text-amber-400">Focused Scope</div>
              <h4 className="text-base font-extrabold text-white">Grades 6–12 STEM only</h4>
              <p className="text-slate-400 text-xs">Equations, diagrams, and lab problems where scans make the biggest difference.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
              <div className="text-xs font-black uppercase tracking-widest text-cyan-400">Skill-first</div>
              <h4 className="text-base font-extrabold text-white">Recall & self-explanation</h4>
              <p className="text-slate-400 text-xs">Meta-learning prompts built directly into every session so concepts stick.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
              <div className="text-xs font-black uppercase tracking-widest text-purple-400">Integrity by design</div>
              <h4 className="text-base font-extrabold text-white">Explains, never just answers</h4>
              <p className="text-slate-400 text-xs">Guiding students through the method so they build real confidence.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
              <div className="text-xs font-black uppercase tracking-widest text-emerald-400">Family friendly</div>
              <h4 className="text-base font-extrabold text-white">Parent companion</h4>
              <p className="text-slate-400 text-xs">Parents monitor study streaks and mastery without hovering over every problem.</p>
            </div>

          </div>

        </div>
      </section>

      {/* 7. SUBSCRIPTIONS & TOKEN MANAGED PRICING */}
      <section id="pricing-tiers" className="py-24 px-6 bg-slate-950 relative border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
              <Coins className="w-4 h-4 text-amber-400" /> Token Managed Subscriptions
            </div>
            <h2 className="text-4xl font-black text-white">Invest in Your Academic Future</h2>
            <p className="text-slate-400 text-sm">
              All subscription tiers feature token-managed monthly quotas with zero surprise costs and predictable high-performance access.
            </p>
          </div>

          {/* Student Passes */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-amber-300 uppercase tracking-widest text-center">
              Individual Student Passes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Basic Starter</div>
                  <div className="text-3xl font-black text-white">R49 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                  <p className="text-xs text-slate-400">Daily practice & homework helper.</p>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 150,000 Tokens / mo</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 30 AI Queries / day</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 10 Homework Scans / day</li>
                  </ul>
                </div>
                <button onClick={login} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all">Get R49 Starter</button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Plus</div>
                  <div className="text-3xl font-black text-white">R69 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                  <p className="text-xs text-slate-400">Expanded AI tutor query allowance.</p>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 350,000 Tokens / mo</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 75 AI Queries / day</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> CAPS & IEB Exam Prep</li>
                  </ul>
                </div>
                <button onClick={login} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all">Get R69 Plus</button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Standard Pass</div>
                  <div className="text-3xl font-black text-white">R99 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                  <p className="text-xs text-slate-400">Power student preparation toolkit.</p>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 750,000 Tokens / mo</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 150 AI Queries / day</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Whiteboard Solver Lab</li>
                  </ul>
                </div>
                <button onClick={login} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all">Get R99 Standard</button>
              </div>

              <div className="bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-400 p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-[0_0_40px_rgba(245,158,11,0.2)] relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-300 to-yellow-500 text-black text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full">3-DAY TRIAL</div>
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1"><Sparkles className="w-3 h-3" /> Gold VIP Pass</div>
                  <div className="text-3xl font-black text-white">R199 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                  <p className="text-xs text-amber-200">Max AI power & speech synthesis.</p>
                  <ul className="space-y-2 text-xs text-slate-200 pt-2">
                    <li className="flex items-center gap-2 font-bold text-white"><Check className="w-3.5 h-3.5 text-amber-400" /> 2,500,000 Tokens / mo</li>
                    <li className="flex items-center gap-2 font-bold text-white"><Check className="w-3.5 h-3.5 text-amber-400" /> 300 AI Queries / day</li>
                    <li className="flex items-center gap-2 font-bold text-white"><Check className="w-3.5 h-3.5 text-amber-400" /> Spoken Voice AI Tutor</li>
                  </ul>
                </div>
                <button onClick={login} className="w-full py-3.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-[1.02] transition-all">Start 3-Day Free Trial</button>
              </div>

            </div>
          </div>

          {/* School Base Passes */}
          <div className="space-y-4 pt-6 border-t border-slate-900">
            <h3 className="text-lg font-black text-white uppercase tracking-widest text-center">
              School & Institutional Base Passes <span className="text-amber-400">(Multi-Learner Seats)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-3">
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">School Base 25</div>
                <div className="text-3xl font-black text-white">R499 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                <p className="text-xs text-slate-300">Up to 25 Registered Student Emails.</p>
                <div className="text-[11px] font-bold text-emerald-400">10M Pooled Tokens (~R19.96/learner)</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-3">
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">School Base 100</div>
                <div className="text-3xl font-black text-white">R1,899 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                <p className="text-xs text-slate-300">Up to 100 Registered Student Emails.</p>
                <div className="text-[11px] font-bold text-emerald-400">35M Pooled Tokens (~R18.99/learner)</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-3">
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">School Base 300</div>
                <div className="text-3xl font-black text-white">R4,999 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                <p className="text-xs text-slate-300">Up to 300 Registered Student Emails.</p>
                <div className="text-[11px] font-bold text-emerald-400">90M Pooled Tokens (~R16.66/learner)</div>
              </div>

              <div className="bg-gradient-to-b from-slate-900 to-amber-950/40 border border-amber-500/40 p-6 rounded-3xl space-y-3">
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">School Base 1000</div>
                <div className="text-3xl font-black text-white">R14,999 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                <p className="text-xs text-slate-300">Up to 1,000 Registered Student Emails.</p>
                <div className="text-[11px] font-bold text-amber-300">250M Pooled Tokens (~R14.99/learner)</div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 7. SHARE & COMMUNITY */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-950 to-[#030712] relative overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.03)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
              <Share2 className="w-4 h-4" /> Spread the Knowledge
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
              Invite your <span className="text-amber-400 italic">Study Squad</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Share Pocket School Pro with friends and classmates to help them master their subjects too. Education is better together.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("Master your subjects with Pocket School Pro! The #1 AI tutor for students in Africa. 🚀 #PocketSchoolPro #EducationAI")}&url=${encodeURIComponent("https://pocketschoolpro.com")}`, "_blank")}
              className="px-8 py-4 rounded-2xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 text-[#1DA1F2] font-black text-sm uppercase tracking-wider flex items-center gap-3 hover:bg-[#1DA1F2] hover:text-white transition-all shadow-lg"
            >
              <Twitter className="w-5 h-5 fill-current" /> Share on X
            </button>
            <button 
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://pocketschoolpro.com")}`, "_blank")}
              className="px-8 py-4 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/20 text-[#1877F2] font-black text-sm uppercase tracking-wider flex items-center gap-3 hover:bg-[#1877F2] hover:text-white transition-all shadow-lg"
            >
              <Facebook className="w-5 h-5 fill-current" /> Share on Facebook
            </button>
            <button 
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://pocketschoolpro.com")}`, "_blank")}
              className="px-8 py-4 rounded-2xl bg-[#0A66C2]/10 border border-[#0A66C2]/20 text-[#0A66C2] font-black text-sm uppercase tracking-wider flex items-center gap-3 hover:bg-[#0A66C2] hover:text-white transition-all shadow-lg"
            >
              <Linkedin className="w-5 h-5 fill-current" /> Share on LinkedIn
            </button>
            <button 
              onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out Pocket School Pro - it's an amazing AI tutor for students! 📚 https://pocketschoolpro.com")}`, "_blank")}
              className="px-8 py-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] font-black text-sm uppercase tracking-wider flex items-center gap-3 hover:bg-[#25D366] hover:text-white transition-all shadow-lg"
            >
              <MessageCircle className="w-5 h-5 fill-current" /> Share on WhatsApp
            </button>
          </div>

          <div className="pt-8">
            <div className="bg-slate-900/60 p-1.5 rounded-3xl border border-slate-800 flex items-center gap-2 max-w-md mx-auto">
              <div className="flex-1 px-4 text-slate-400 text-xs font-mono truncate">https://pocketschoolpro.com</div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("https://pocketschoolpro.com");
                  alert("Link copied to clipboard!");
                }}
                className="px-6 py-3 rounded-2xl bg-amber-400 text-black font-black text-[10px] uppercase tracking-widest hover:bg-amber-300 transition-all"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Branding Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center font-black text-black shadow-lg">
                  P
                </div>
                <div>
                  <div className="font-black text-white text-lg tracking-tight uppercase">Pocket School Pro</div>
                  <div className="text-[10px] text-amber-500/80 uppercase font-bold tracking-[0.2em] mt-0.5">by Grade Master Africa</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Enterprise 4K AI-Powered Academic & Accessibility Ecosystem for South Africa & Africa. Master STEM with clarity.
              </p>
              <div className="flex items-center gap-4 text-slate-500">
                <a href="#" className="hover:text-amber-400 transition-colors"><Globe className="w-5 h-5" /></a>
                <a href="#" className="hover:text-amber-400 transition-colors"><Radio className="w-5 h-5" /></a>
                <a href="#" className="hover:text-amber-400 transition-colors"><Shield className="w-5 h-5" /></a>
              </div>
            </div>

            {/* Platform Column */}
            <div className="space-y-6">
              <h4 className="text-white font-black text-xs uppercase tracking-widest">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><Link to="/features" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-amber-500" /> Features & Tools</Link></li>
                <li><Link to="/qa" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-amber-500" /> Help & FAQ</Link></li>
                <li><Link to="/guide" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-amber-500" /> User Guide</Link></li>
                <li><Link to="/about" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-amber-500" /> Our Mission</Link></li>
                <li><Link to="/future-dev" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-amber-500" /> Roadmap</Link></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-6">
              <h4 className="text-white font-black text-xs uppercase tracking-widest">Compliance & Legal</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><Link to="/privacy" className="hover:text-amber-400 transition-colors flex items-center gap-2 text-rose-300/80 hover:text-rose-300">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-amber-400 transition-colors flex items-center gap-2">Terms of Service</Link></li>
                <li><Link to="/disclaimer" className="hover:text-amber-400 transition-colors flex items-center gap-2">General Disclaimer</Link></li>
                <li><Link to="/account-deletion" className="hover:text-amber-400 transition-colors flex items-center gap-2 text-rose-400/80">Data Deletion Request</Link></li>
                <li><Link to="/ai-policy" className="hover:text-amber-400 transition-colors flex items-center gap-2">AI Usage Policy</Link></li>
                <li><Link to="/popia" className="hover:text-amber-400 transition-colors flex items-center gap-2 text-emerald-400/80">POPIA Compliance</Link></li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="space-y-6">
              <h4 className="text-white font-black text-xs uppercase tracking-widest">Support</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><Link to="/contact" className="hover:text-amber-400 transition-colors flex items-center gap-2 font-bold"><Mail className="w-4 h-4" /> Contact Support</Link></li>
                <li><Link to="/accessibility-statement" className="hover:text-amber-400 transition-colors flex items-center gap-2">Accessibility Statement</Link></li>
                <li><Link to="/cookie-policy" className="hover:text-amber-400 transition-colors flex items-center gap-2">Cookie Policy</Link></li>
                <li><Link to="/billing-policy" className="hover:text-amber-400 transition-colors flex items-center gap-2">Billing & Refund Policy</Link></li>
                <li><Link to="/security" className="hover:text-amber-400 transition-colors flex items-center gap-2">Security Policy</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              © 2026 Pocket School Pro by Grade Master Africa. All Rights Reserved. Enterprise AI Infrastructure.
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3" /> System Status: Online
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-400 uppercase tracking-widest">
                <Globe className="w-3 h-3" /> Regional: South Africa (ZAF)
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
