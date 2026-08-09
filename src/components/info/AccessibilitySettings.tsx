import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Volume2, 
  Type, 
  Contrast, 
  Sparkles, 
  Zap, 
  Eye, 
  Move, 
  Gamepad, 
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

export default function AccessibilitySettings() {
  const [settings, setSettings] = useState({
    ttsSpeed: 1,
    contrast: "normal",
    fontSize: "normal",
    dyslexicFont: false,
    reducedMotion: false,
    screenReaderOptimized: false,
    highLighting: true
  });

  useEffect(() => {
    const saved = localStorage.getItem("accessibility");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("accessibility", JSON.stringify(settings));
    
    // Apply classes to document element for global scoping
    const root = document.documentElement;
    root.classList.toggle("high-contrast", settings.contrast === "high");
    root.classList.toggle("large-font", settings.fontSize === "large");
    root.classList.toggle("dyslexic-font", settings.dyslexicFont);
    root.classList.toggle("reduced-motion", settings.reducedMotion);
    
    // Also apply to body for fallback
    document.body.className = cn(
      settings.contrast === "high" && "high-contrast",
      settings.fontSize === "large" && "large-font",
      settings.dyslexicFont && "dyslexic-font",
      settings.reducedMotion && "reduced-motion"
    );
  }, [settings]);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateNumericSetting = (key: keyof typeof settings, value: number | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Settings className="w-10 h-10 text-indigo-600" /> 
            Accessibility Center
          </h1>
          <p className="text-gray-500 font-medium max-w-xl">
            Personalize Grade Master to your unique learning needs. Our mission is to ensure no student is left behind, regardless of physical or cognitive differences.
          </p>
        </div>

        <Link
          to="/pwa-install"
          className="group relative px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-slate-800 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Volume2 className="w-5 h-5 text-amber-400 animate-pulse" /> 
          PWA Voice Assistant
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Toggles & Sliders */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Visual Assist Section */}
          <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Visual Assistance</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                <label className="text-sm font-black text-gray-700 uppercase tracking-wider block">Contrast Mode</label>
                <div className="flex gap-2">
                  {["normal", "high"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateNumericSetting("contrast", mode)}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        settings.contrast === mode ? "bg-indigo-600 text-white border-transparent shadow-lg" : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                <label className="text-sm font-black text-gray-700 uppercase tracking-wider block">Text Size</label>
                <div className="flex gap-2">
                  {["normal", "large"].map((size) => (
                    <button
                      key={size}
                      onClick={() => updateNumericSetting("fontSize", size)}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        settings.fontSize === size ? "bg-indigo-600 text-white border-transparent shadow-lg" : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 font-black">Aa</div>
                <div>
                  <h4 className="font-bold text-indigo-900">Dyslexia Friendly Font</h4>
                  <p className="text-[10px] text-indigo-700/70 font-medium">Uses Lexend, a font designed specifically for readability.</p>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting("dyslexicFont")}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
                  settings.dyslexicFont ? "bg-indigo-600" : "bg-gray-300"
                )}
              >
                <div className={cn("w-4 h-4 bg-white rounded-full transition-all shadow-sm", settings.dyslexicFont ? "translate-x-6" : "translate-x-0")} />
              </button>
            </div>
          </section>

          {/* Cognitive & Audio Section */}
          <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Volume2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Audio & Cognitive</h2>
            </div>

            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Voice Speed (TTS)</label>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">{settings.ttsSpeed}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2.5" 
                step="0.1" 
                value={settings.ttsSpeed} 
                onChange={(e) => updateNumericSetting("ttsSpeed", Number(e.target.value))} 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-amber-200 transition-all">
                <div className="flex items-center gap-3">
                  <Move className="w-5 h-5 text-amber-500" />
                  <div>
                    <h4 className="text-xs font-black text-gray-800 uppercase">Reduced Motion</h4>
                    <p className="text-[9px] text-gray-500">Stops most animations</p>
                  </div>
                </div>
                <button onClick={() => toggleSetting("reducedMotion")} className={cn("w-10 h-5 rounded-full transition-all relative flex items-center px-1", settings.reducedMotion ? "bg-amber-500" : "bg-gray-200")}>
                  <div className={cn("w-3 h-3 bg-white rounded-full transition-all", settings.reducedMotion ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>

              <div className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-amber-200 transition-all">
                <div className="flex items-center gap-3">
                  <Gamepad className="w-5 h-5 text-amber-500" />
                  <div>
                    <h4 className="text-xs font-black text-gray-800 uppercase">Screen Reader</h4>
                    <p className="text-[9px] text-gray-500">Enhanced ARIA labels</p>
                  </div>
                </div>
                <button onClick={() => toggleSetting("screenReaderOptimized")} className={cn("w-10 h-5 rounded-full transition-all relative flex items-center px-1", settings.screenReaderOptimized ? "bg-amber-500" : "bg-gray-200")}>
                  <div className={cn("w-3 h-3 bg-white rounded-full transition-all", settings.screenReaderOptimized ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Recommendations & Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Info className="w-40 h-40" />
            </div>
            <h3 className="text-2xl font-black mb-6 relative">Why Accessibility Matters?</h3>
            <div className="space-y-6 relative">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Visual Clarity</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">High contrast helps students with low vision or color blindness navigate comfortably.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Dyslexia Support</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Specific typography reduces visual stress and helps "unlock" reading for millions.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Cognitive Relief</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Reduced motion and clean layouts help students with ADHD or sensory processing needs focus.</p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Pro Tip</span>
              </div>
              <p className="text-xs text-slate-300 font-medium italic">"Use the PWA Voice Assistant if you have difficulty navigating menus manually. It provides a hands-free setup experience."</p>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col items-center text-center space-y-4">
             <Zap className="w-12 h-12 text-amber-300" />
             <h4 className="text-xl font-black">Accessibility Feedback?</h4>
             <p className="text-xs opacity-80 leading-relaxed">Is there a specific assistive feature you need that we don't have? Let us know!</p>
             <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Submit Feedback</button>
          </div>
        </div>
      </div>
    </div>
  );
}


