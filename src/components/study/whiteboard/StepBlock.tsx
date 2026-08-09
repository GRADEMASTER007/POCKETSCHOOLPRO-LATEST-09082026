import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Sparkles, 
  Calculator, 
  HelpCircle, 
  Activity,
  ArrowRight
} from "lucide-react";
import { LaTeXRenderer } from "./KaTeXMath";
import D3InteractiveGraph, { GraphType } from "./D3InteractiveGraph";

export interface WhiteboardStepData {
  stepNumber: number;
  title: string;
  explanation: string;
  latexFormula?: string;
  graphType?: GraphType;
  graphLabel?: string;
  graphParams?: Record<string, number>;
  functionExpr?: string;
  keyConcept?: string;
}

interface StepBlockProps {
  step: WhiteboardStepData;
  totalSteps: number;
  onAskDetail?: (stepTitle: string) => void;
  onPracticeSimilar?: (stepTitle: string) => void;
}

export default function StepBlock({ step, totalSteps, onAskDetail, onPracticeSimilar }: StepBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Quick Step Calculator State
  const [calcInput, setCalcInput] = useState<string>("4");
  const [calcResult, setCalcResult] = useState<string | null>(null);

  const handleCopyFormula = () => {
    if (step.latexFormula) {
      navigator.clipboard.writeText(step.latexFormula);
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2000);
    }
  };

  const handleRunStepCalc = () => {
    try {
      const val = parseFloat(calcInput);
      if (isNaN(val)) return;
      // Evaluate based on common step formula (e.g., volume 8*pi*x or quadratic)
      const res = (Math.PI * Math.pow(val, 2) / 2).toFixed(3);
      setCalcResult(`Evaluated V(y=${val}) = ${res}π units³`);
    } catch (e) {
      setCalcResult("Invalid input value");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: step.stepNumber * 0.1 }}
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm ${
        isCompleted
          ? "bg-slate-50/90 border-emerald-200/80"
          : "bg-white border-slate-200/90 hover:border-blue-300"
      }`}
    >
      {/* STEP HEADER BAR */}
      <div className="p-4 lg:p-5 flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          {/* Step Number Badge */}
          <button
            onClick={() => setIsCompleted(!isCompleted)}
            className={`w-8 h-8 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${
              isCompleted
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-blue-600 text-white shadow-md shadow-blue-600/20"
            }`}
            title="Mark step complete"
          >
            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.stepNumber}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Step {step.stepNumber} of {totalSteps}
              </span>
              {step.keyConcept && (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  <LaTeXRenderer text={step.keyConcept} />
                </span>
              )}
            </div>

            <h3 className="text-sm lg:text-base font-extrabold text-slate-900 mt-1">
              <LaTeXRenderer text={step.title} />
            </h3>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* STEP CONTENT BODY */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-5 lg:p-6 space-y-6"
          >
            {/* Explanation & LaTeX Formula */}
            <div className="space-y-3 text-xs lg:text-sm text-slate-700 leading-relaxed font-medium">
              <LaTeXRenderer text={step.explanation} />

              {step.latexFormula && (
                <div className="p-4 bg-slate-900 text-blue-300 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 overflow-x-auto shadow-inner">
                  <LaTeXRenderer text={`$$${step.latexFormula}$$`} className="text-sm font-mono text-center flex-1" />

                  <button
                    onClick={handleCopyFormula}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors shrink-0"
                    title="Copy LaTeX Formula"
                  >
                    {copiedFormula ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Embedded D3 Interactive Graph (if specified) */}
            {step.graphType && (
              <div className="pt-2">
                <D3InteractiveGraph
                  type={step.graphType}
                  label={step.graphLabel || `${step.title} Diagram`}
                  initialParams={step.graphParams}
                  functionExpr={step.functionExpr}
                />
              </div>
            )}

            {/* Interactive Step Tools Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl font-bold transition-all flex items-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5 text-blue-600" />
                  <span>Verify Numbers</span>
                </button>

                {onAskDetail && (
                  <button
                    onClick={() => onAskDetail(step.title)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-xl font-bold transition-all flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                    <span>Deep Explanation</span>
                  </button>
                )}
              </div>

              {onPracticeSimilar && (
                <button
                  onClick={() => onPracticeSimilar(step.title)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-all flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Practice Similar Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Interactive Step Calculator Dropdown */}
            {showCalculator && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-3">
                <span className="text-[11px] font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                  Step Formula Evaluator
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={calcInput}
                    onChange={(e) => setCalcInput(e.target.value)}
                    placeholder="Enter limit y value..."
                    className="px-3 py-2 bg-white rounded-xl border border-indigo-200 text-xs text-indigo-950 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36"
                  />
                  <button
                    onClick={handleRunStepCalc}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Calculate
                  </button>
                </div>

                {calcResult && (
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-200 font-mono text-xs font-bold text-indigo-900">
                    {calcResult}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
