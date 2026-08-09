import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calculator, 
  Atom, 
  Microscope, 
  Globe, 
  History, 
  BookOpen, 
  Palette, 
  Music, 
  Zap, 
  Sprout,
  Users,
  Briefcase,
  Monitor,
  Heart,
  Search,
  ChevronRight,
  Sparkles,
  Trophy,
  Layers,
  Cpu,
  GraduationCap,
  User,
  Building2
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { subjects } from "@/src/data/subjects";
import MathEngine from "./MathEngine";
import ScienceEngine from "./ScienceEngine";
import BiologyEngine from "./BiologyEngine";
import GeographyEngine from "./GeographyEngine";
import AgriEngine from "./AgriEngine";
import QuizEngine from "./QuizEngine";
import FlashcardEngine from "./FlashcardEngine";
import SubjectInteractiveLab from "./SubjectInteractiveLab";
import SchoolTypesDirectory from "./SchoolTypesDirectory";
import GlobalCurriculumSelector from "./GlobalCurriculumSelector";

const SubjectPerformance = () => (
  <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl text-center">
    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
      <GraduationCap className="w-10 h-10 text-blue-600" />
    </div>
    <h3 className="text-3xl font-display font-black text-gray-900 mb-4">Performance Insights</h3>
    <p className="text-gray-500 max-w-sm mx-auto mb-12">Detailed tracking of your subject mastery and exam readiness.</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { label: "Completion", value: "78%", color: "bg-emerald-500" },
        { label: "Accuracy", value: "92%", color: "bg-blue-500" },
        { label: "Time Spent", value: "142h", color: "bg-purple-500" },
      ].map((stat, i) => (
        <div key={i} className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
          <p className="text-4xl font-display font-black text-gray-900">{stat.value}</p>
          <div className="h-1.5 w-full bg-gray-200 rounded-full mt-4 overflow-hidden">
            <div className={cn("h-full", stat.color)} style={{ width: stat.value }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// const subjects = [ ... ] removed because it's imported now

export default function CurriculumHub() {
  const [activeTab, setActiveTab] = useState<"global" | "syllabus" | "schools" | "interactive" | "performance" | "quiz" | "flashcards">("global");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const tabs = [
    { id: "global", label: "Global Systems", icon: Globe },
    { id: "syllabus", label: "Syllabus Explorer", icon: BookOpen },
    { id: "schools", label: "School Types & Directory", icon: Building2 },
    { id: "interactive", label: "Interactive Labs", icon: Cpu },
    { id: "performance", label: "Performance", icon: GraduationCap },
    { id: "quiz", label: "Quiz Mode", icon: Trophy },
    { id: "flashcards", label: "Flashcards", icon: Layers },
  ];

  const handleSubjectSelect = (id: string) => {
    setSelectedSubject(id);
    setActiveTab("interactive");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-brand-secondary/10 text-brand-secondary rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-secondary/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Curriculum Hub
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-brand-primary tracking-tighter leading-none">
            LEARNING<br />JOURNEY
          </h1>
        </div>
        
        <div className="flex bg-gray-50 p-1.5 rounded-[2rem] border border-gray-100/50 shadow-inner overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === "syllabus") setSelectedSubject(null);
              }}
              className={cn(
                "px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0",
                activeTab === tab.id 
                  ? "bg-white text-brand-primary shadow-lg shadow-black/5" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="wait">
          {activeTab === "global" && (
            <motion.div
              key="global-selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlobalCurriculumSelector />
            </motion.div>
          )}

          {activeTab === "syllabus" && !selectedSubject && (
            <motion.div
              key="subjects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {subjects.map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleSubjectSelect(sub.id)}
                  className="group cursor-pointer bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:border-brand-primary/20 transition-all hover:shadow-2xl hover:shadow-brand-primary/5 relative overflow-hidden"
                >
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/5 transition-transform group-hover:scale-110", sub.lightColor)}>
                    <sub.icon className={cn("w-8 h-8", sub.textColor)} />
                  </div>
                  <h3 className="text-2xl font-display font-black text-brand-primary mb-2">{sub.name}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed mb-6">{sub.description}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-black overflow-hidden">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.id + i}`} alt="Learner" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-brand-secondary uppercase tracking-widest">
                        <span>Syllabus</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "interactive" && (
            <motion.div
              key="interactive"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-8"
            >
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
                {subjects.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={cn(
                      "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border shrink-0",
                      selectedSubject === sub.id ? "bg-brand-primary text-white border-transparent shadow-xl shadow-brand-primary/20" : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                    )}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>

              {!selectedSubject ? (
                <div className="bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 p-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <Cpu className="w-10 h-10 text-brand-secondary" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-gray-900">Select a subject to launch Lab</h3>
                  <p className="text-gray-500 max-w-sm mx-auto font-medium">Experience immersive simulations and interactive solving engines built for CAPS.</p>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in duration-500">
                  {selectedSubject === "math" && <MathEngine />}
                  {selectedSubject === "physics" && <ScienceEngine />}
                  {selectedSubject === "agri" && <AgriEngine />}
                  {selectedSubject === "life-sci" && <BiologyEngine />}
                  {selectedSubject === "geo" && <GeographyEngine />}
                  {!["math", "physics", "agri", "life-sci", "geo"].includes(selectedSubject) && (
                  <SubjectInteractiveLab subjectId={selectedSubject} />
                )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <QuizEngine />
            </motion.div>
          )}

          {activeTab === "flashcards" && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FlashcardEngine />
            </motion.div>
          )}

          {activeTab === "schools" && (
            <motion.div
              key="schools"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SchoolTypesDirectory />
            </motion.div>
          )}

          {activeTab === "performance" && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SubjectPerformance />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
