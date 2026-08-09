import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calculator, Play, RotateCcw, ChevronRight, CheckCircle2, Search, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { auth } from "@/src/lib/firebase";
import { appCheck } from "@/src/lib/firebase";
import { getToken } from "firebase/app-check";

interface Step {
  expression: string;
  explanation: string;
  action?: string;
}

export default function MathEngine({ initialProblem = "" }: { initialProblem?: string }) {
  const [problem, setProblem] = useState(initialProblem);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSolve = async () => {
    if (!problem.trim()) return;
    setIsLoading(true);
    setError("");
    setSteps([]);
    setCurrentStep(0);
    try {
      const response = await fetch("/api/solve-math", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`},
        body: JSON.stringify({ problem }),
      });
      const data = await response.json();
      if (response.ok && data.steps && data.steps.length > 0) {
        setSteps(data.steps);
      } else {
        setError(data.error || "Failed to solve problem.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setSteps([]);
    setProblem("");
    setError("");
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between bg-gray-50/50 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-gray-900">AI Math Solver</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step-by-Step Animation</p>
          </div>
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
           <div className="relative flex-1 md:w-64">
             <input 
               type="text" 
               value={problem}
               onChange={(e) => setProblem(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && handleSolve()}
               placeholder="e.g. 2x + 5 = 15 or derive x^2"
               className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
             />
           </div>
           <button 
             onClick={handleSolve}
             disabled={isLoading || !problem.trim()}
             className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
           >
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Solve"}
           </button>
           <button 
            onClick={reset}
            className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-transparent"
           >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-8 lg:p-12 min-h-[400px]">
        {error ? (
           <div className="text-center text-red-500 font-medium py-12">{error}</div>
        ) : steps.length === 0 && !isLoading ? (
           <div className="flex flex-col items-center justify-center text-gray-400 py-16">
             <Search className="w-12 h-12 mb-4 opacity-50" />
             <p className="font-medium">Enter a math problem to see step-by-step solutions.</p>
           </div>
        ) : steps.length > 0 ? (
        <div className="max-w-2xl mx-auto space-y-12">
          {/* Main Equation Display */}
          <div className="relative min-h-[120px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-3xl md:text-5xl font-display font-black tracking-tighter text-brand-primary text-center"
              >
                {steps[currentStep].expression}
              </motion.div>
            </AnimatePresence>

            {/* Action Badge */}
            {steps[currentStep].action && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute -right-4 md:-right-12 top-0 bg-brand-secondary text-white px-4 py-1 rounded-full text-xs font-black shadow-lg shadow-brand-secondary/30 whitespace-nowrap"
              >
                {steps[currentStep].action}
              </motion.div>
            )}
          </div>

          {/* Explanation Card */}
          <motion.div 
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 relative group"
          >
            <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black text-brand-secondary uppercase tracking-widest shadow-sm">
              AI Explanation
            </div>
            <p className="text-lg text-gray-700 font-medium leading-relaxed">
              {steps[currentStep].explanation}
            </p>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className={cn(
                "group relative flex items-center gap-3 py-4 px-10 rounded-2xl font-black text-lg transition-all overflow-hidden",
                currentStep === steps.length - 1
                  ? "bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg"
                  : "bg-brand-primary text-white hover:scale-105 active:scale-95 shadow-brand-primary/20 shadow-lg"
              )}
            >
              {currentStep === steps.length - 1 ? (
                <>Solved! <CheckCircle2 className="w-6 h-6" /></>
              ) : (
                <>Next Step <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-3 flex-wrap">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "h-1.5 transition-all duration-500 rounded-full",
                  i === currentStep ? "w-8 bg-brand-secondary" : i < currentStep ? "w-3 bg-brand-primary/20" : "w-3 bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>
        ) : null}
      </div>
    </div>
  );
}
