import React from "react";
import { motion } from "motion/react";
import { 
  Globe, 
  BookOpen, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck,
  Heart,
  Zap,
  Map
} from "lucide-react";
import { languagesList, academicCategories } from "@/src/data/subjects";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-20 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-10 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-primary/20"
        >
          <Globe className="w-3.5 h-3.5" />
          The Pan-African Classroom
        </motion.div>
        <h1 className="text-6xl md:text-8xl font-display font-black text-brand-primary tracking-tighter leading-none">
          FOR AFRICA,<br />BY AFRICA.
        </h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed">
          Pocket School Pro is more than an app—it's a movement to democratize premium education 
          across the continent. We bridge the gap between curriculum and comprehension using 
          cutting-edge AI that speaks your language.
        </p>
      </section>

      {/* Stats/Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
        {[
          { icon: Map, label: "Coverage", value: "All Africa" },
          { icon: BookOpen, label: "Curriculums", value: "CAPS & More" },
          { icon: Globe, label: "Languages", value: "40+" },
          { icon: GraduationCap, label: "Levels", value: "K-Uni" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
            <stat.icon className="w-8 h-8 text-brand-secondary mx-auto mb-4" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-display font-black text-brand-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* The Subject List - Full Coverage */}
      <section className="bg-brand-primary rounded-[4rem] p-12 md:p-20 text-white space-y-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
          <Map className="w-[600px] h-[600px]" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xl text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              Comprehensive Catalog
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter">
              BEYOND THE<br />CLASSROOM.
            </h2>
            <p className="text-white/60 font-medium max-w-xl">
              From foundational literacy in indigenous languages to high-level engineering and 
              medical sciences, our AI is trained on Africa's specific academic requirements.
            </p>
          </div>
          <Sparkles className="w-32 h-32 text-brand-secondary/20 hidden md:block" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
          {/* Academic Disciplines */}
          <div className="space-y-12">
            {academicCategories.map((cat, i) => (
              <div key={i} className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary border-b border-white/10 pb-4">
                  {cat.category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {cat.subcategories.map((sub, j) => (
                    <div key={j} className="space-y-3">
                      <p className="text-xs font-black text-white/40 uppercase tracking-widest">{sub.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {sub.subjects.map((item, k) => (
                          <span key={k} className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-bold border border-white/5 text-white/80">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Languages Section */}
          <div className="space-y-12">
            <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary mb-10 border-b border-white/10 pb-4">
                AFRICAN LANGUAGES HUB
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4">
                {languagesList.map((lang, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary/40 group-hover:bg-brand-secondary transition-all" />
                    <span className="text-[11px] font-bold text-white/70 group-hover:text-white transition-colors">{lang}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12 p-8 bg-brand-secondary/20 rounded-[2rem] border border-brand-secondary/20">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-brand-secondary" />
                  <p className="text-xs font-black text-brand-secondary uppercase tracking-widest">Multi-Tiered Support</p>
                </div>
                <p className="text-[10px] text-white/60 leading-relaxed font-bold uppercase tracking-widest">
                  Home Language • First Additional • Second Additional • Language for Academic Purposes • Braille & Sign Language
                </p>
              </div>
            </div>

            <div className="p-10 bg-brand-secondary text-brand-primary rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-display font-black mb-4">Missing a Subject?</h3>
                <p className="text-sm font-bold opacity-70 mb-8 leading-relaxed">
                  Our AI engine is constantly learning. If your specific university degree or regional subject isn't listed, Aristotle AI can still assist by analyzing your personal lecture notes and textbooks.
                </p>
                <button className="px-8 py-3 bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                  Request Integration
                </button>
              </div>
              <Map className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="text-center py-20 px-4">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <Heart className="w-10 h-10 text-rose-500 animate-pulse" />
        </div>
        <h2 className="text-4xl font-display font-black text-gray-900 mb-6">READY TO EXCEL?</h2>
        <p className="text-gray-500 max-w-2xl mx-auto font-medium mb-12 text-lg">
          Join the community of scholars rewriting the narrative of African education. 
          Your pocket-sized campus awaits.
        </p>
        <button className="px-10 py-5 bg-brand-primary text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-brand-primary/20">
          Get Started Now
        </button>
      </section>
    </div>
  );
}
