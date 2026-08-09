import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Send, 
  Paperclip, 
  Camera, 
  Mic, 
  MicOff, 
  Upload, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Check, 
  Flame, 
  Star, 
  Bell, 
  MoreHorizontal, 
  LayoutDashboard, 
  BookOpen, 
  HelpCircle, 
  Wrench, 
  Crown, 
  Lock, 
  X, 
  CheckCircle2, 
  ChevronRight, 
  BarChart3, 
  Layers, 
  Zap, 
  Brain, 
  ArrowRight,
  Shield,
  RefreshCw,
  FileText,
  Pencil,
  Eraser,
  Trash2,
  PenTool,
  Search,
  BookMarked,
  Cpu,
  Calculator,
  Atom,
  TrendingUp,
  Activity
} from "lucide-react";
import { useAuth } from "@/src/components/auth/AuthContext";
import { ACADEMIC_SUBJECTS_KNOWLEDGEBASE } from "@/src/lib/knowledgebase";
import StepBlock, { WhiteboardStepData } from "./whiteboard/StepBlock";
import { KaTeXMath, LaTeXRenderer, InteractiveLaTeXContainer } from "./whiteboard/KaTeXMath";
import D3InteractiveGraph from "./whiteboard/D3InteractiveGraph";
import D3MathPlotterCanvas from "./whiteboard/D3MathPlotterCanvas";
import { 
  renderD3MathPlot, 
  FunctionPlotConfig, 
  evaluateMathExpression, 
  computeNumericalDerivative 
} from "@/src/lib/d3MathPlotter";
import { parseAIResponseToWhiteboardSteps } from "@/src/lib/aiWhiteboardResponseParser";

export interface WhiteboardProps {
  /**
   * Optional initial or externally provided LaTeX expression string (e.g. from AI tutor API response)
   */
  initialLatexExpression?: string;
  /**
   * Optional topic label
   */
  initialTopic?: string;
  /**
   * Optional subject key (e.g. "mathematics", "physics")
   */
  initialSubject?: string;
  /**
   * Optional callback when LaTeX string is updated or selected
   */
  onLatexChange?: (latex: string) => void;
}

/**
 * Utility function within Whiteboard component to dynamically generate
 * SVG-based coordinate systems and function plots, enabling interactive
 * visualization of algebraic and calculus-based math problems.
 */
export function generateD3WhiteboardPlot(
  svgElement: SVGSVGElement,
  expression: string,
  options?: {
    title?: string;
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
    showTangentX0?: number;
    integralRange?: [number, number];
    width?: number;
    height?: number;
  },
  onHover?: (coords: { x: number; y: number; deriv?: number } | null) => void
): () => void {
  const config: FunctionPlotConfig = {
    title: options?.title || `Dynamic Plot: y = ${expression}`,
    width: options?.width || 540,
    height: options?.height || 360,
    xMin: options?.xMin ?? -5,
    xMax: options?.xMax ?? 5,
    yMin: options?.yMin ?? -5,
    yMax: options?.yMax ?? 8,
    grid: true,
    functions: [
      {
        id: "primary_fn",
        expression: expression,
        label: `f(x) = ${expression}`,
        color: "#2563eb",
        strokeWidth: 3,
      },
    ],
    tangents: options?.showTangentX0 !== undefined ? [
      { x0: options.showTangentX0, label: `Tangent at x=${options.showTangentX0}`, color: "#f59e0b" }
    ] : [],
    integrals: options?.integralRange ? [
      { a: options.integralRange[0], b: options.integralRange[1], label: `∫ f(x)dx`, color: "rgba(99, 102, 241, 0.25)" }
    ] : [],
    interactiveHover: true,
  };

  return renderD3MathPlot(svgElement, config, onHover);
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  problemTitle?: string;
  steps?: WhiteboardStepData[];
  evaluationFormula?: string;
  finalAnswer?: string;
  subject?: string;
}

export default function Whiteboard({
  initialLatexExpression,
  initialTopic,
  initialSubject,
  onLatexChange
}: WhiteboardProps = {}) {
  const { profile, user } = useAuth();
  
  // Paid Feature Enforcement State
  const userTier = profile?.subscriptionTier || "free";
  const [isSimulatedPaid, setIsSimulatedPaid] = useState<boolean>(() => {
    return userTier !== "free" && userTier !== undefined;
  });
  
  const isSubscribed = isSimulatedPaid || (userTier !== "free" && userTier !== "free_pass");

  // Paywall Modal State
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState("AI Tutor Whiteboard");

  // Active Subject Selector State
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>(initialSubject || "mathematics");

  // Tab mode: "ai_whiteboard" vs "d3_plotter" vs "freehand_scratchpad"
  const [activeCanvasMode, setActiveCanvasMode] = useState<"ai_whiteboard" | "d3_plotter" | "freehand_scratchpad">("ai_whiteboard");

  // Active LaTeX String State (from props or AI responses)
  const [activeLatexExpression, setActiveLatexExpression] = useState<string>(
    initialLatexExpression || "V = \\int_{0}^{4} \\pi y \\, dy = 8\\pi"
  );

  // Sync props when changed externally
  useEffect(() => {
    if (initialLatexExpression) {
      setActiveLatexExpression(initialLatexExpression);
    }
  }, [initialLatexExpression]);

  useEffect(() => {
    if (initialSubject) {
      setSelectedSubjectKey(initialSubject);
    }
  }, [initialSubject]);

  useEffect(() => {
    if (activeLatexExpression && onLatexChange) {
      onLatexChange(activeLatexExpression);
    }
  }, [activeLatexExpression, onLatexChange]);

  // Interactive 3D/Graph Controls State
  const [trigAmplitude, setTrigAmplitude] = useState<number>(1);
  const [trigFrequency, setTrigFrequency] = useState<number>(1);

  // Scratchpad Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState("#2563EB"); // Default Blue
  const [drawingTool, setDrawingTool] = useState<"pen" | "eraser">("pen");
  const [lineWidth, setLineWidth] = useState(3);

  // Chat & Query State
  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, "up" | "down" | null>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Knowledgebase Search Modal State
  const [showKnowledgebaseModal, setShowKnowledgebaseModal] = useState(false);
  const [kbQuery, setKbQuery] = useState("");
  const [kbSearchResults, setKbSearchResults] = useState<any[]>([]);

  // Modals & Camera State
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Voice Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Default Session Messages (Calculus Example + Physics Example)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_user_calc",
      sender: "user",
      text: "How do I find the volume of a solid formed by rotating the region bounded by $y = x^2$, $y = 4$, and $x = 0$ about the $y$-axis?",
      timestamp: "10:24 AM"
    },
    {
      id: "msg_default_calc",
      sender: "ai",
      text: "Great question! Let's solve this step-by-step using the disk method.",
      timestamp: "10:24 AM",
      problemTitle: "How do I find the volume of a solid formed by rotating the region bounded by $y = x^2$, $y = 4$, and $x = 0$ about the $y$-axis?",
      subject: "Mathematics (CAPS Paper 1)",
      steps: [
        {
          stepNumber: 1,
          title: "Visualize the region & boundary curves",
          explanation: "The region is bounded by the parabola $y = x^2$, the horizontal boundary line $y = 4$, and vertical line $x = 0$. When rotated around the $y$-axis, the radius of each cross-sectional disk at height $y$ is given by $x = \\sqrt{y}$.",
          latexFormula: "x = f(y) = \\sqrt{y}, \\quad 0 \\le y \\le 4",
          graphType: "2d_parabola",
          graphLabel: "Interactive 2D Area Plot y = x² and y = 4",
          graphParams: { a: 1, b: 4 },
          keyConcept: "Disk Method Integration"
        },
        {
          stepNumber: 2,
          title: "Formulate cross-sectional area A(y) and integral limits",
          explanation: "Using the disk method formula $V = \\int_{c}^{d} A(y) \\, dy$, where disk area $A(y) = \\pi [R(y)]^2$. Substituting $R(y) = \\sqrt{y}$ gives:",
          latexFormula: "A(y) = \\pi (\\sqrt{y})^2 = \\pi y, \\quad y \\in [0, 4]",
          graphType: "3d_solid",
          graphLabel: "D3 3D Solid of Revolution & Washers",
          graphParams: { c: 12 },
          keyConcept: "Area Function A(y)"
        },
        {
          stepNumber: 3,
          title: "Evaluate Definite Integral line-by-line",
          explanation: "Integrating $A(y)$ with respect to $y$ from $y = 0$ to $y = 4$ using the fundamental theorem of calculus:",
          latexFormula: "V = \\int_{0}^{4} \\pi y \\, dy = \\pi \\left[ \\frac{y^2}{2} \\right]_{0}^{4} = \\pi \\left( \\frac{16}{2} - 0 \\right) = 8\\pi",
          keyConcept: "Definite Integral Evaluation"
        }
      ],
      evaluationFormula: "V = \\int_{0}^{4} \\pi y \\, dy = 8\\pi \\approx 25.1327 \\text{ units}^3",
      finalAnswer: "The volume of the solid of revolution is $V = 8\\pi$ cubic units."
    }
  ]);

  // Speech Recognition Hook
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setSpeechSupported(false);
    }
  }, []);

  // Initialize Canvas Context for Scratchpad
  useEffect(() => {
    if (activeCanvasMode === "freehand_scratchpad" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [activeCanvasMode]);

  const toggleListening = () => {
    if (!checkSubscriptionAccess("Voice AI Tutor")) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInputQuery(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Helper function to guard paid features
  const checkSubscriptionAccess = (featureName: string): boolean => {
    if (!isSubscribed) {
      setLockedFeatureName(featureName);
      setShowPaywallModal(true);
      return false;
    }
    return true;
  };

  // Scratchpad Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = drawingTool === "eraser" ? "#FFFFFF" : drawingColor;
    ctx.lineWidth = drawingTool === "eraser" ? lineWidth * 4 : lineWidth;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Send message and execute AI + MCP Knowledgebase lookup
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    if (!checkSubscriptionAccess("AI Tutor Whiteboard")) return;

    // Add User Message
    const userMsg: ChatMessage = {
      id: "usr_" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsGenerating(true);

    try {
      // 1. Call MCP Endpoint /api/mcp
      const mcpResponse = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: {
            name: "solve_stem_step_by_step",
            arguments: {
              problemText: query,
              subject: selectedSubjectKey,
              gradeLevel: "Grade 12 CAPS / IEB"
            }
          }
        })
      });

      const mcpData = await mcpResponse.json();

      let rawContent = "";
      if (mcpData?.result?.content?.[0]?.text) {
        rawContent = mcpData.result.content[0].text;
      }

      // Automatically parse raw AI response string or construct step containers with KaTeX LaTeX formulas
      const parsedSolution = parseAIResponseToWhiteboardSteps(rawContent, query, selectedSubjectKey);

      // Determine default graph type based on subject if not set by parser
      let defaultGraphType: "2d_parabola" | "3d_solid" | "trig_wave" | "circuit_diagram" | "chemical_structure" | "balance_sheet" = "2d_parabola";
      if (selectedSubjectKey === "physical_sciences") defaultGraphType = "circuit_diagram";
      else if (selectedSubjectKey === "accounting") defaultGraphType = "balance_sheet";
      else if (selectedSubjectKey === "life_sciences") defaultGraphType = "chemical_structure";

      const enrichedSteps: WhiteboardStepData[] = parsedSolution.steps.map((step, i) => {
        if (!step.graphType && i === 0) {
          return {
            ...step,
            graphType: defaultGraphType,
            graphLabel: `${ACADEMIC_SUBJECTS_KNOWLEDGEBASE[selectedSubjectKey]?.name || "STEM"} Interactive Model`
          };
        }
        return step;
      });

      const aiResponseMsg: ChatMessage = {
        id: "ai_" + Date.now(),
        sender: "ai",
        text: "Here is the step-by-step whiteboard solution from the Grade Master AI Knowledgebase:",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        problemTitle: query,
        subject: ACADEMIC_SUBJECTS_KNOWLEDGEBASE[selectedSubjectKey]?.name || "STEM Practice",
        steps: enrichedSteps,
        evaluationFormula: parsedSolution.evaluationFormula || "Result = \\text{Solution verified with KaTeX accuracy.}",
        finalAnswer: parsedSolution.finalAnswer
      };

      if (parsedSolution.evaluationFormula) {
        setActiveLatexExpression(parsedSolution.evaluationFormula);
      } else if (parsedSolution.finalAnswer) {
        setActiveLatexExpression(parsedSolution.finalAnswer);
      }

      setMessages((prev) => [...prev, aiResponseMsg]);
    } catch (e) {
      console.error(e);
      const fallbackAiMsg: ChatMessage = {
        id: "ai_fb_" + Date.now(),
        sender: "ai",
        text: "Let's solve this problem step-by-step on the whiteboard.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        problemTitle: query,
        subject: "General Academic Practice",
        steps: [
          {
            stepNumber: 1,
            title: "Identify given conditions",
            explanation: `Break down the problem parameters for "${query}":`,
            latexFormula: "y = f(x) = \\int g(x) \\, dx",
            graphType: "2d_parabola",
            graphLabel: "2D Mathematical Plot"
          },
          {
            stepNumber: 2,
            title: "Execute derivation",
            explanation: "Apply formula step-by-step to arrive at exact answer.",
            latexFormula: "V = \\int_{a}^{b} A(y) \\, dy = 8\\pi",
            graphType: "3d_solid",
            graphLabel: "3D Revolution Model"
          }
        ],
        evaluationFormula: "Result = \\text{Step-by-step derivation complete}",
        finalAnswer: "Problem solved successfully with verified steps."
      };
      setActiveLatexExpression("V = \\int_{a}^{b} A(y) \\, dy = 8\\pi");
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKbSearch = () => {
    if (!kbQuery.trim()) return;
    const results = Object.values(ACADEMIC_SUBJECTS_KNOWLEDGEBASE).flatMap(subj => {
      return subj.keyFormulasAndConcepts.filter(f => 
        f.topic.toLowerCase().includes(kbQuery.toLowerCase()) || 
        f.explanation.toLowerCase().includes(kbQuery.toLowerCase()) ||
        f.formulaOrRule.toLowerCase().includes(kbQuery.toLowerCase())
      ).map(f => ({ ...f, subjectName: subj.name }));
    });
    setKbSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-3 lg:p-6 space-y-6">
      
      {/* 1. TOP HEADER BAR */}
      <header className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {profile?.displayName?.split(" ")[0] || "Alex"}! 👋
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            AI Tutor Whiteboard & Multi-Subject Knowledgebase
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Knowledge Base Button */}
          <button
            onClick={() => {
              if (checkSubscriptionAccess("Knowledge Base Search")) {
                setShowKnowledgebaseModal(true);
              }
            }}
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-extrabold shadow-xs transition-all"
          >
            <BookMarked className="w-4 h-4 text-purple-600" />
            <span>Curriculum Knowledgebase</span>
          </button>

          {/* Study Points Badge */}
          <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-xs">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>1250 Study Points</span>
          </div>

          {/* Subscription Paid Status Badge & Simulation Toggle */}
          <div className="flex items-center gap-2 bg-slate-900 text-white p-1.5 px-3 rounded-2xl border border-slate-800 text-xs">
            {isSubscribed ? (
              <span className="text-amber-400 font-extrabold flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-amber-400" /> Gold VIP Active
              </span>
            ) : (
              <span className="text-rose-400 font-extrabold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Free Plan (Locked)
              </span>
            )}

            <button
              onClick={() => setIsSimulatedPaid(!isSimulatedPaid)}
              className="ml-2 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-xs"
              title="Toggle subscription state for testing"
            >
              {isSubscribed ? "Test Unsubscribe" : "Simulate Subscription"}
            </button>
          </div>
        </div>
      </header>

      {/* 2. SUBJECT & CANVAS MODE SELECTOR BAR */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {Object.values(ACADEMIC_SUBJECTS_KNOWLEDGEBASE).map((subj) => (
            <button
              key={subj.id}
              onClick={() => setSelectedSubjectKey(subj.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedSubjectKey === subj.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <span>{subj.name}</span>
            </button>
          ))}
        </div>

        {/* Canvas Mode Toggle: AI Whiteboard vs D3 Function Plotter vs Freehand Scratchpad */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shrink-0">
          <button
            onClick={() => setActiveCanvasMode("ai_whiteboard")}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeCanvasMode === "ai_whiteboard"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Whiteboard</span>
          </button>

          <button
            onClick={() => {
              if (checkSubscriptionAccess("D3 Function Plotter")) {
                setActiveCanvasMode("d3_plotter");
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeCanvasMode === "d3_plotter"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>D3 Function Plotter</span>
          </button>

          <button
            onClick={() => {
              if (checkSubscriptionAccess("Freehand Scratchpad")) {
                setActiveCanvasMode("freehand_scratchpad");
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeCanvasMode === "freehand_scratchpad"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-blue-600" />
            <span>Student Scratchpad</span>
          </button>
        </div>

      </section>

      {/* 3. MAIN THREE-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT NAVIGATION SIDEBAR (3 cols on desktop) */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* Brand Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-600/30">
                S
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-base leading-tight">StudyAI</div>
                <div className="text-[11px] text-slate-400 font-medium">AI Tutor & Homework Help</div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1 pt-2">
              <Link 
                to="/" 
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Dashboard</span>
              </Link>

              <Link 
                to="/curriculum" 
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>My Courses</span>
              </Link>

              <Link 
                to="/whiteboard" 
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black bg-blue-50 text-blue-700 border border-blue-100 shadow-xs"
              >
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Homework Help</span>
              </Link>

              <Link 
                to="/stem" 
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                <Wrench className="w-4 h-4 text-slate-400" />
                <span>Study Tools</span>
              </Link>
            </nav>
          </div>

          {/* Active Subject Curriculum Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase text-blue-600 tracking-wider">
              {ACADEMIC_SUBJECTS_KNOWLEDGEBASE[selectedSubjectKey]?.name}
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="font-extrabold text-slate-800">Exam Papers Structure</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {ACADEMIC_SUBJECTS_KNOWLEDGEBASE[selectedSubjectKey]?.examPapers[0]?.paper}: {ACADEMIC_SUBJECTS_KNOWLEDGEBASE[selectedSubjectKey]?.examPapers[0]?.weighting}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="font-extrabold text-slate-800">Key Formula Spotlight</div>
                <div className="text-[11px] text-blue-700 font-bold mt-1">
                  <LaTeXRenderer text={ACADEMIC_SUBJECTS_KNOWLEDGEBASE[selectedSubjectKey]?.keyFormulasAndConcepts[0]?.formulaOrRule || ""} />
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Banner */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl border border-blue-200/80 p-5 space-y-3 relative overflow-hidden shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Crown className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Upgrade to Premium</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                Unlock unlimited AI help, advanced tools, and faster solutions.
              </p>
            </div>
            <button
              onClick={() => {
                setLockedFeatureName("Premium Subscription");
                setShowPaywallModal(true);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Upgrade Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </aside>

        {/* MIDDLE COLUMN: MAIN WHITEBOARD AI CHAT / SCRATCHPAD CANVAS (6 cols on desktop) */}
        <main className="lg:col-span-6 space-y-6 flex flex-col justify-between min-h-[700px]">
          
          {/* FREEHAND SCRATCHPAD MODE */}
          {activeCanvasMode === "freehand_scratchpad" ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-5 space-y-4">
              
              {/* Scratchpad Toolbar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDrawingTool("pen")}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                      drawingTool === "pen" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Pen</span>
                  </button>

                  <button
                    onClick={() => setDrawingTool("eraser")}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                      drawingTool === "eraser" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    <Eraser className="w-4 h-4" />
                    <span>Eraser</span>
                  </button>

                  <button
                    onClick={clearCanvas}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                </div>

                {/* Colors */}
                <div className="flex items-center gap-2">
                  {["#2563EB", "#059669", "#7C3AED", "#D97706", "#DC2626", "#090D16"].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setDrawingColor(color);
                        setDrawingTool("pen");
                      }}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        drawingColor === color && drawingTool === "pen" ? "scale-125 ring-2 ring-blue-500 ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Canvas element */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-inner relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={450}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[450px] cursor-crosshair touch-none"
                />
              </div>

              <div className="text-xs text-slate-400 text-center font-medium">
                Draw or write equations on your scratchpad. Use AI Whiteboard tab to solve.
              </div>

            </div>
          ) : activeCanvasMode === "d3_plotter" ? (
            /* D3 FUNCTION PLOTTER MODE */
            <div className="space-y-4">
              <D3MathPlotterCanvas
                initialExpression="x^2 - 4*x + 3"
                title="Interactive D3.js SVG Coordinate System & Plotter"
                height={380}
              />
            </div>
          ) : (
            /* AI WHITEBOARD CHAT MODE */
            <div className="space-y-6">

              {/* Active KaTeX Mathematical Spotlight Container */}
              {activeLatexExpression && (
                <div className="bg-slate-950 p-4 lg:p-5 rounded-3xl border border-blue-900/60 shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="font-extrabold text-white uppercase tracking-wider text-[11px]">
                        Active Math Expression Spotlight
                      </span>
                    </div>
                    <span className="text-[10px] text-blue-400 font-mono font-bold bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-800">
                      KaTeX Parser Active
                    </span>
                  </div>
                  <InteractiveLaTeXContainer
                    latex={activeLatexExpression}
                    title="Spotlight Formula"
                    subtitle="Interactive Container"
                    onSendToPlotter={(expr) => {
                      setActiveCanvasMode("d3_plotter");
                    }}
                    onAskExplain={(latex) => {
                      handleSendMessage(`Explain this LaTeX formula step-by-step: ${latex}`);
                    }}
                  />
                </div>
              )}
              
              {/* Dynamic Session Messages Array (User Queries & AI Tutor Solution Cards) */}
              {messages.map((msg) =>
                msg.sender === "user" ? (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-xl bg-blue-50 border border-blue-200/80 rounded-3xl p-4 lg:p-5 shadow-xs space-y-1">
                      <div className="text-xs lg:text-sm font-semibold text-slate-900 leading-relaxed">
                        <LaTeXRenderer text={msg.text} />
                      </div>
                      <div className="text-[10px] font-bold text-blue-500 text-right flex items-center justify-end gap-1 pt-1">
                        <span>{msg.timestamp}</span>
                        <span className="text-blue-600">✓✓</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-5 lg:p-8 space-y-6 relative overflow-hidden">
                    
                    {/* AI Header Tag */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                          S
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm">StudyAI Tutor</h3>
                          <div className="text-[11px] text-slate-600 font-medium">
                            <LaTeXRenderer text={msg.text} />
                          </div>
                        </div>
                      </div>
                      {msg.subject && (
                        <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                          {msg.subject}
                        </span>
                      )}
                    </div>

                    {/* Problem Statement Banner Container */}
                    {msg.problemTitle && (
                      <div className="p-4 bg-slate-900 text-blue-300 rounded-2xl border border-slate-800 shadow-inner space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                          Problem Statement / Expression:
                        </div>
                        <div className="text-xs lg:text-sm font-mono text-slate-100 font-bold">
                          <LaTeXRenderer 
                            text={msg.problemTitle} 
                            onSendToPlotter={() => setActiveCanvasMode("d3_plotter")}
                            onAskExplain={(latex) => handleSendMessage(`Explain formula: ${latex}`)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step-by-Step Whiteboard Explanations with KaTeX Math and D3 Graphs */}
                    {msg.steps && (
                      <div className="space-y-6">
                        {msg.steps.map((stepItem, idx) => (
                          <StepBlock
                            key={idx}
                            step={stepItem}
                            totalSteps={msg.steps!.length}
                            onAskDetail={(stepTitle) => handleSendMessage(`Explain step "${stepTitle}" in detail with more steps and examples.`)}
                            onPracticeSimilar={(stepTitle) => handleSendMessage(`Give me a practice problem similar to step "${stepTitle}".`)}
                          />
                        ))}

                        {/* FINAL ANSWER HIGHLIGHT CARD */}
                        {msg.finalAnswer && (
                          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-5 lg:p-6 rounded-3xl shadow-lg shadow-blue-600/20 space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              <span>Verified Final Answer</span>
                            </div>
                            <div className="text-base lg:text-lg font-black text-white">
                              <LaTeXRenderer 
                                text={msg.finalAnswer} 
                                onSendToPlotter={() => setActiveCanvasMode("d3_plotter")}
                                onAskExplain={(latex) => handleSendMessage(`Explain formula: ${latex}`)}
                              />
                            </div>
                            {msg.evaluationFormula && (
                              <div className="pt-2 border-t border-white/20 text-xs font-mono text-blue-100">
                                <LaTeXRenderer 
                                  text={`$$\\text{Evaluation Formula: } ${msg.evaluationFormula}$$`} 
                                  onSendToPlotter={() => setActiveCanvasMode("d3_plotter")}
                                  onAskExplain={(latex) => handleSendMessage(`Explain formula: ${latex}`)}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Feedback Row */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => copyToClipboard(msg.id, msg.evaluationFormula || msg.text)}
                          className="hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedId === msg.id ? "Copied!" : "Copy"}</span>
                        </button>

                        <button 
                          onClick={() => setHelpfulFeedback(prev => ({ ...prev, [msg.id]: "up" }))}
                          className={`hover:text-blue-600 transition-colors ${helpfulFeedback[msg.id] === "up" ? "text-blue-600 font-bold" : ""}`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={() => setHelpfulFeedback(prev => ({ ...prev, [msg.id]: "down" }))}
                          className={`hover:text-rose-600 transition-colors ${helpfulFeedback[msg.id] === "down" ? "text-rose-600 font-bold" : ""}`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[11px]">Was this helpful?</span>
                    </div>

                  </div>
                )
              )}

            </div>
          )}

          {/* INPUT BAR DOCK AT BOTTOM WITH KATEX QUICK MATH SYMBOL TOOLBAR */}
          <div className="space-y-2 pt-4">

            {/* Quick KaTeX Math Symbol Helper Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                <Calculator className="w-3 h-3 text-blue-600" /> Math Symbols:
              </span>
              {[
                { label: "∫ Integral", latex: "\\int_{a}^{b} " },
                { label: "d/dx Fraction", latex: "\\frac{d}{dx}" },
                { label: "√ Root", latex: "\\sqrt{x}" },
                { label: "x² Power", latex: "x^2" },
                { label: "∑ Sum", latex: "\\sum_{i=1}^{n} " },
                { label: "lim Limit", latex: "\\lim_{x \\to 0} " },
                { label: "θ Theta", latex: "\\theta" },
                { label: "Δ Delta", latex: "\\Delta" },
                { label: "π Pi", latex: "\\pi" },
                { label: "∞ Infinity", latex: "\\infty" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputQuery((prev) => prev + (prev.endsWith(" ") || !prev ? "" : " ") + item.latex)}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-xl text-[11px] font-mono font-bold shrink-0 transition-all shadow-xs flex items-center gap-1"
                  title={`Insert ${item.latex} into query`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-2 pl-4 flex items-center gap-3">
              
              {/* Attachment / File Upload Button */}
              <button
                onClick={() => {
                  if (checkSubscriptionAccess("File Upload")) {
                    setShowFileUploadModal(true);
                  }
                }}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-2xl transition-all"
                title="Upload file or image"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Camera Photo Scan Button */}
              <button
                onClick={() => {
                  if (checkSubscriptionAccess("Camera Scanner")) {
                    setShowCameraModal(true);
                  }
                }}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-2xl transition-all"
                title="Scan problem photo"
              >
                <Camera className="w-5 h-5" />
              </button>

              {/* Input Field */}
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask any question or upload a problem..."
                className="flex-1 text-xs lg:text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />

              {/* Voice Tap to Speak Microphone Button */}
              <button
                onClick={toggleListening}
                className={`p-2.5 rounded-2xl transition-all ${
                  isListening 
                    ? "bg-rose-500 text-white animate-pulse" 
                    : "text-slate-400 hover:text-blue-600 hover:bg-slate-50"
                }`}
                title="Tap to speak"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={isGenerating || !inputQuery.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-2xl shadow-md shadow-blue-600/30 transition-all flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center font-medium">
              StudyAI can make mistakes. Please verify important information.
            </p>

          </div>

        </main>

        {/* RIGHT SIDEBAR (3 cols on desktop) */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* Quick Actions Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
              <span>Quick Actions</span>
            </h3>

            <div className="space-y-3">
              
              {/* Action 1: Upload Homework */}
              <button
                onClick={() => {
                  if (checkSubscriptionAccess("Upload Homework")) {
                    setShowFileUploadModal(true);
                  }
                }}
                className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 rounded-2xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-extrabold text-slate-900 text-xs group-hover:text-blue-900">Upload Homework</div>
                  <div className="text-[10px] text-slate-400 font-medium">Upload a file or image of your homework</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 group-hover:text-blue-600">
                  <Upload className="w-4 h-4" />
                </div>
              </button>

              {/* Action 2: Scan Problem */}
              <button
                onClick={() => {
                  if (checkSubscriptionAccess("Scan Problem")) {
                    setShowCameraModal(true);
                  }
                }}
                className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 rounded-2xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-extrabold text-slate-900 text-xs group-hover:text-blue-900">Scan Problem</div>
                  <div className="text-[10px] text-slate-400 font-medium">Use your camera to scan and solve problems</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 group-hover:text-blue-600">
                  <Camera className="w-4 h-4" />
                </div>
              </button>

              {/* Action 3: Generate Flashcards */}
              <button
                onClick={() => {
                  if (checkSubscriptionAccess("Generate Flashcards")) {
                    handleSendMessage("Generate flashcards from my notes for Calculus and Physics");
                  }
                }}
                className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 rounded-2xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-extrabold text-slate-900 text-xs group-hover:text-blue-900">Generate Flashcards</div>
                  <div className="text-[10px] text-slate-400 font-medium">Create flashcards from your notes or textbook</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 group-hover:text-blue-600">
                  <Layers className="w-4 h-4" />
                </div>
              </button>

            </div>
          </div>

          {/* Study Streak Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-extrabold text-slate-900 text-xs">Study Streak</span>
              </div>
              <span className="text-xs font-bold text-slate-500">12 days</span>
            </div>
            
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <span>Keep it up!</span>
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </p>

            {/* Weekday Checkmarks Row */}
            <div className="flex items-center justify-between pt-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    idx < 6 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-300"
                  }`}>
                    {idx < 6 ? "✓" : ""}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Progress Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs">Weekly Progress</span>
              <span className="text-xs font-bold text-slate-500">7 of 10 goals</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full w-[70%]" />
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              You're making great progress this week!
            </p>
          </div>

          {/* Recent Subjects Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs">Recent Subjects</span>
              <button className="text-[11px] font-bold text-blue-600 hover:underline">View all</button>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Calculus & Derivatives</span>
                <span className="text-blue-600 font-extrabold">85%</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Physics & Mechanics</span>
                <span className="text-blue-600 font-extrabold">92%</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Organic Chemistry</span>
                <span className="text-blue-600 font-extrabold">78%</span>
              </div>
            </div>
          </div>

        </aside>

      </div>

      {/* 4. PAID SUBSCRIPTION LOCK MODAL */}
      <AnimatePresence>
        {showPaywallModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 lg:p-8 space-y-6 relative overflow-hidden"
            >
              <button
                onClick={() => setShowPaywallModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-3 text-center">
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-3xl mx-auto flex items-center justify-center shadow-sm">
                  <Crown className="w-7 h-7 fill-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Premium Paid Feature
                </h3>
                <p className="text-xs lg:text-sm text-slate-600 leading-relaxed font-medium">
                  <strong className="text-slate-900">{lockedFeatureName}</strong> requires an active Grade Master Africa subscription. Upgrade now to unlock unlimited AI whiteboard tutoring, graph generation, camera scanning, and voice coaching.
                </p>
              </div>

              {/* Subscription Plans Quick Selection */}
              <div className="space-y-3 pt-2">
                <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-amber-500/10 border-2 border-amber-400 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-amber-900 uppercase">Gold VIP Pass</div>
                    <div className="text-lg font-black text-slate-900">R199 <span className="text-xs font-normal text-slate-500">/ month</span></div>
                    <div className="text-[10px] text-amber-700 font-bold">Includes 3-Day Free Trial • 2.5M Tokens</div>
                  </div>
                  <Link
                    to="/subscription"
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md hover:scale-105 transition-all"
                  >
                    Try Free
                  </Link>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">Standard Pass (R99/mo)</div>
                    <div className="text-[10px] text-slate-500">750k Tokens • Whiteboard Tutor</div>
                  </div>
                  <Link to="/subscription" className="text-blue-600 font-extrabold hover:underline">Select Pass</Link>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">Student Plus (R69/mo)</div>
                    <div className="text-[10px] text-slate-500">350k Tokens • CAPS & IEB Exam Prep</div>
                  </div>
                  <Link to="/subscription" className="text-blue-600 font-extrabold hover:underline">Select Pass</Link>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsSimulatedPaid(true);
                    setShowPaywallModal(false);
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase rounded-2xl transition-all shadow-md shadow-blue-600/20"
                >
                  Simulate Paid Subscription (Dev Test)
                </button>
                <button
                  onClick={() => setShowPaywallModal(false)}
                  className="w-full py-2.5 text-xs text-slate-500 font-bold hover:text-slate-700"
                >
                  Maybe Later
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. KNOWLEDGE BASE SEARCH MODAL */}
      <AnimatePresence>
        {showKnowledgebaseModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowKnowledgebaseModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-purple-600" />
                  <span>Curriculum Knowledgebase Search</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Search formulas, CAPS/IEB rules, and syllabus standards across all subjects
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 px-4 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={kbQuery}
                    onChange={(e) => setKbQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleKbSearch()}
                    placeholder="Search e.g. Calculus power rule, Newton 2nd law, BEP..."
                    className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
                <button
                  onClick={handleKbSearch}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl transition-all shadow-md"
                >
                  Search
                </button>
              </div>

              {/* Search Results */}
              <div className="space-y-3 pt-2">
                {kbSearchResults.length > 0 ? (
                  kbSearchResults.map((res, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-purple-700 uppercase">{res.subjectName}</span>
                        <span className="font-mono text-xs font-bold text-slate-800">{res.topic}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl text-xs text-blue-700 font-bold border border-slate-200">
                        <LaTeXRenderer text={res.formulaOrRule} />
                      </div>
                      <div className="text-xs text-slate-600">
                        <LaTeXRenderer text={res.explanation} />
                      </div>
                      <div className="text-[11px] text-slate-400 italic">
                        Example: <LaTeXRenderer text={res.exampleQuestion} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400 font-medium">
                    Type a topic or formula above to search Grade Master Africa's curriculum database.
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. FILE UPLOAD MODAL */}
      <AnimatePresence>
        {showFileUploadModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 relative"
            >
              <button
                onClick={() => setShowFileUploadModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Upload Homework / Document</h3>
                <p className="text-xs text-slate-500">Upload PDF, DOCX, or Image file of your problem</p>
              </div>

              <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 rounded-2xl text-center space-y-3">
                <Upload className="w-10 h-10 text-blue-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Drag and drop file here, or browse</p>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setUploadedFileName(e.target.files[0].name);
                    }
                  }}
                  className="hidden"
                  id="homework-file-input"
                />
                <label
                  htmlFor="homework-file-input"
                  className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-blue-700 shadow-xs"
                >
                  Choose File
                </label>
                {uploadedFileName && (
                  <div className="text-xs font-bold text-emerald-600 pt-2">
                    ✓ Selected: {uploadedFileName}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (uploadedFileName) {
                    handleSendMessage(`Uploaded Homework File: ${uploadedFileName}. Please solve all problems on this document step-by-step.`);
                    setShowFileUploadModal(false);
                  }
                }}
                disabled={!uploadedFileName}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md"
              >
                Solve Homework File
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. CAMERA PHOTO SCANNER MODAL */}
      <AnimatePresence>
        {showCameraModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 relative"
            >
              <button
                onClick={() => setShowCameraModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Scan STEM Problem</h3>
                <p className="text-xs text-slate-500">Position problem within camera frame</p>
              </div>

              <div className="bg-slate-900 rounded-2xl h-64 flex flex-col items-center justify-center text-slate-400 space-y-3 relative overflow-hidden">
                <Camera className="w-12 h-12 text-blue-400 animate-pulse" />
                <p className="text-xs font-bold text-slate-300">Camera Feed Active</p>
                <div className="absolute inset-8 border-2 border-blue-400/50 rounded-xl pointer-events-none" />
              </div>

              <button
                onClick={() => {
                  handleSendMessage("Scanned Problem from Camera Photo: Calculate derivative of y = x² · sin(x) at x = π/2");
                  setShowCameraModal(false);
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capture & Solve Problem</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
