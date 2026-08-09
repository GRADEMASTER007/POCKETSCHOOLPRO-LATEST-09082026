import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Microscope, 
  Dna, 
  Info, 
  Zap, 
  Activity, 
  Search,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const cellParts = [
  { id: "nucleus", name: "Nucleus", info: "The 'brain' of the cell. Contains genetic material (DNA) and coordinates cell activities.", color: "bg-indigo-500", pos: { top: "40%", left: "45%" } },
  { id: "mitochondria", name: "Mitochondria", info: "The powerhouse of the cell. Converts nutrients into energy (ATP).", color: "bg-red-500", pos: { top: "20%", left: "65%" } },
  { id: "ribosome", name: "Ribosomes", info: "Protein factories. They read RNA to build essential proteins.", color: "bg-amber-500", pos: { top: "70%", left: "30%" } },
  { id: "vacuole", name: "Vacuole", info: "Storage sac for water, nutrients, and waste products.", color: "bg-blue-400", pos: { top: "60%", left: "70%" } },
];

export default function BiologyEngine() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [view, setView] = useState<"cell" | "dna">("cell");

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-emerald-50/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
            <Microscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-gray-900">Bio-Explorer Lab</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interactive Cytology</p>
          </div>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-100">
          <button 
            onClick={() => setView("cell")}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              view === "cell" ? "bg-emerald-500 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Cell Structure
          </button>
          <button 
            onClick={() => setView("dna")}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              view === "dna" ? "bg-indigo-500 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
            )}
          >
            DNA Helix
          </button>
        </div>
      </div>

      <div className="p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual Area */}
          <div className="relative h-[400px] bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {view === "cell" ? (
                <motion.div
                  key="cell"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {/* Cell Membrane */}
                  <motion.div 
                    animate={{ 
                      borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 60%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="w-80 h-80 bg-emerald-100/50 border-4 border-emerald-300 relative"
                  >
                    {cellParts.map(part => (
                      <motion.button
                        key={part.id}
                        onClick={() => setSelectedPart(part.id)}
                        whileHover={{ scale: 1.2 }}
                        className={cn(
                          "absolute w-12 h-12 rounded-full shadow-lg border-2 border-white cursor-pointer z-10",
                          part.color,
                          selectedPart === part.id && "ring-4 ring-white"
                        )}
                        style={part.pos}
                      >
                        <Search className="w-4 h-4 text-white m-auto" />
                      </motion.button>
                    ))}
                    
                    {/* Cytoplasm Content (Decorative) */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        {[...Array(20)].map((_, i) => (
                            <motion.div 
                                key={i}
                                animate={{ x: [0, 10, 0], y: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: Math.random() * 5 + 2 }}
                                className="absolute w-2 h-2 bg-emerald-400 rounded-full"
                                style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                            />
                        ))}
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="dna"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center gap-2"
                >
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        width: [40, 120, 40],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                      className="h-4 flex items-center justify-between gap-4"
                    >
                      <div className="w-4 h-4 bg-indigo-500 rounded-full shadow-lg" />
                      <div className="flex-1 h-[2px] bg-indigo-200" />
                      <div className="w-4 h-4 bg-purple-500 rounded-full shadow-lg" />
                    </motion.div>
                  ))}
                  <div className="mt-8 text-center">
                    <Dna className="w-12 h-12 text-indigo-500 mx-auto animate-bounce" />
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">Genetic Blueprint</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info Panel */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {selectedPart ? (
                <motion.div
                  key={selectedPart}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <Info className="w-3 h-3" />
                    Component Analysis
                  </div>
                  <h4 className="text-4xl font-display font-black text-gray-900 leading-tight">
                    {cellParts.find(p => p.id === selectedPart)?.name}
                  </h4>
                  <p className="text-lg text-gray-500 font-medium leading-relaxed italic">
                    "{cellParts.find(p => p.id === selectedPart)?.info}"
                  </p>
                  
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Metabolic Activity</span>
                        <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "85%" }}
                            className="h-full bg-emerald-500"
                        />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-100 rounded-[3rem]">
                  <Activity className="w-16 h-16 text-gray-100 mb-4 animate-pulse" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Select a cell organelle to start dissection</p>
                </div>
              )}
            </AnimatePresence>

            <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-brand-secondary" />
                    <h5 className="font-bold text-xl">Quick Fact</h5>
                </div>
                <p className="text-white/60 text-sm leading-relaxed font-medium">
                  The human body contains approximately 37.2 trillion cells. Aristotle AI can simulate the function of every single one.
                </p>
              </div>
              <ChevronRight className="absolute bottom-4 right-4 w-12 h-12 text-white opacity-[0.05] group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
