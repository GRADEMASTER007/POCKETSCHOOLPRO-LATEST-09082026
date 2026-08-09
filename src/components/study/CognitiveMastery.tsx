import React, { useState, useEffect, useRef } from "react";
import { auth, getAccessToken } from "@/src/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import {
  Brain,
  Sparkles,
  BookOpen,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Zap,
  Flame,
  Layers,
  MapPin,
  Building2,
  ArrowRight,
  Lightbulb,
  Check,
  Activity,
  MessageSquare,
  Feather,
  ShieldCheck,
  Bookmark,
  FileText,
  Calculator,
  PenTool,
  Target,
  RefreshCw,
  Hash,
  Compass,
  GraduationCap,
  PlusCircle,
  Trash2
} from "lucide-react";
import { cn } from "@/src/lib/utils";

// --- RESEARCH CITATION DATASET ---
const RESEARCH_STUDIES = [
  {
    author: "Dunlosky et al. (2013)",
    journal: "Psychological Science in the Public Interest",
    finding: "Ranked Practice Testing and Distributed (Spaced) Practice as the highest utility learning techniques across all domains.",
    impact: "+2.5x Long-Term Retention"
  },
  {
    author: "Ebbinghaus (1885) & Wozniak (1990)",
    journal: "Memory & SuperMemo SM-2",
    finding: "Without spaced intervals, 75% of new information is lost within 48 hours. 4 spaced reviews flatten the decay curve permanently.",
    impact: "95% Permanent Recall"
  },
  {
    author: "Maguire et al. (2003)",
    journal: "Nature Neuroscience",
    finding: "World Memory Champions exclusively activate spatial navigation networks (hippocampus) using the Method of Loci.",
    impact: "300% Speed Retrieval"
  },
  {
    author: "Roediger & Karpicke (2006)",
    journal: "Psychological Science",
    finding: "Active retrieval practice produces dramatically higher test performance (80%) compared to repeated passive re-reading (35%).",
    impact: "+45% Higher Scores"
  },
  {
    author: "Mayer & Wittrock (2006)",
    journal: "Handbook of Educational Psychology",
    finding: "Formula visualization using story anchors and dimensional unit analysis reduces working memory cognitive load by 60%.",
    impact: "60% Less Cognitive Load"
  }
];

// --- EBBINGHAUS FORGETTING CURVE DATA ---
const EBBINGHAUS_DATA = [
  { time: "Immediate", noReview: 100, review1: 100, review2: 100, review3: 100 },
  { time: "20 Mins", noReview: 58, review1: 98, review2: 100, review3: 100 },
  { time: "1 Hour", noReview: 44, review1: 95, review2: 99, review3: 100 },
  { time: "9 Hours", noReview: 36, review1: 90, review2: 98, review3: 100 },
  { time: "24 Hours (1 Day)", noReview: 33, review1: 88, review2: 97, review3: 99 },
  { time: "2 Days", noReview: 28, review1: 75, review2: 95, review3: 98 },
  { time: "6 Days", noReview: 23, review1: 65, review2: 92, review3: 97 },
  { time: "31 Days (1 Mo)", noReview: 21, review1: 52, review2: 88, review3: 95 }
];

// --- MEMORY PALACE LOCI ROOMS ---
interface LociRoom {
  id: string;
  name: string;
  icon: any;
  bgGradient: string;
  description: string;
}

const PALACE_ROOMS: LociRoom[] = [
  { id: "foyer", name: "Grand Entrance Foyer", icon: Building2, bgGradient: "from-amber-500/20 to-orange-500/20", description: "First sensory anchor. High ceilings, marble fountain, gold chandelier." },
  { id: "library", name: "Ancient Royal Library", icon: BookOpen, bgGradient: "from-indigo-500/20 to-purple-500/20", description: "Wood-scented shelves, velvet armchairs, glowing stained glass." },
  { id: "lab", name: "Alchemy & Quantum Lab", icon: Zap, bgGradient: "from-cyan-500/20 to-blue-500/20", description: "Bubbling neon flasks, brass telescopes, humming energy cores." },
  { id: "garden", name: "Botanical Zen Conservatory", icon: Layers, bgGradient: "from-emerald-500/20 to-teal-500/20", description: "Cascading waterfall, aromatic orchids, stone footpaths." }
];

// Sample Memory Palace Preset Topics
const MEMORY_PRESETS = [
  {
    topic: "The 10 Amendments (Bill of Rights)",
    items: ["1. Free Speech & Religion", "2. Bear Arms", "3. No Quartering Soldiers", "4. Search & Seizure", "5. Due Process", "6. Speedy Trial", "7. Jury Trial in Civil Cases", "8. No Cruel Punishment", "9. Unenumerated Rights", "10. States' Rights"]
  },
  {
    topic: "10 Chemical Elements (Periodic Table 1-10)",
    items: ["1. Hydrogen (Sunburst)", "2. Helium (Floating Balloon)", "3. Lithium (Electric Battery)", "4. Beryllium (Emerald Gem)", "5. Boron (Boring Machine)", "6. Carbon (Diamond Shield)", "7. Nitrogen (Liquid Freeze)", "8. Oxygen (Scuba Mask)", "9. Fluorine (Toothpaste Tube)", "10. Neon (Glow Sign)"]
  },
  {
    topic: "10 Cranial Nerves",
    items: ["I. Olfactory (Smell)", "II. Optic (Sight)", "III. Oculomotor (Eye Motion)", "IV. Trochlear (Pulley)", "V. Trigeminal (Face Sensation)", "VI. Abducens (Lateral Eye)", "VII. Facial (Expressions)", "VIII. Vestibulocochlear (Hearing)", "IX. Glossopharyngeal (Taste)", "X. Vagus (Heart & Gut)"]
  }
];

// Preset Formulas for Math & Science Practice
const PRESET_FORMULAS = [
  { name: "Newton's Second Law", formula: "F = m * a", subject: "Physics", description: "Force equals mass times acceleration." },
  { name: "Quadratic Formula", formula: "x = (-b ± √(b² - 4ac)) / (2a)", subject: "Mathematics", description: "Finds roots of a quadratic equation ax² + bx + c = 0." },
  { name: "Einstein Mass-Energy", formula: "E = m * c²", subject: "Physics", description: "Energy equals mass times the speed of light squared." },
  { name: "Ohm's Law", formula: "V = I * R", subject: "Physics/Tech", description: "Voltage equals current times resistance." },
  { name: "Compound Interest", formula: "A = P * (1 + r/n)^(n*t)", subject: "Mathematics/Finance", description: "Accrued value from principal and compounding rate." },
  { name: "Kinematic Equation (Velocity)", formula: "v = u + a * t", subject: "Physics", description: "Final velocity equals initial velocity plus acceleration times time." }
];

export default function CognitiveMastery({ defaultTab }: { defaultTab?: "study" | "memory" | "summarization" | "formulas" | "speech" } = {}) {
  const [activeTab, setActiveTab] = useState<"study" | "memory" | "summarization" | "formulas" | "speech">(defaultTab || "study");

  // --- TAB 1: STUDY SCIENCE STATE ---
  const [feynmanTopic, setFeynmanTopic] = useState("Photosynthesis");
  const [feynmanExplanation, setFeynmanExplanation] = useState("");
  const [feynmanResult, setFeynmanResult] = useState<any>(null);
  const [isFeynmanEvaluating, setIsFeynmanEvaluating] = useState(false);

  // Leitner Box State
  const [leitnerBox, setLeitnerBox] = useState<number>(1);
  const [leitnerCardIdx, setLeitnerCardIdx] = useState(0);
  const [leitnerRevealed, setLeitnerRevealed] = useState(false);
  const [leitnerFlashcards, setLeitnerFlashcards] = useState([
    { id: 1, front: "What is Active Recall?", back: "Testing memory by retrieving answers from your brain rather than passively re-reading.", box: 1 },
    { id: 2, front: "What is the Spacing Effect?", back: "Spacing study sessions over time creates stronger long-term neural connections.", box: 1 },
    { id: 3, front: "What is Dunlosky's top technique?", back: "Practice Testing & Distributed Practice (Dunlosky et al., 2013).", box: 2 },
    { id: 4, front: "What is the SQ3R Method?", back: "Survey, Question, Read, Recite, Review reading strategy.", box: 1 },
    { id: 5, front: "What is Interleaving?", back: "Mixing related topics or subjects during a study session to improve discrimination skills.", box: 3 }
  ]);

  // --- TAB 2: MEMORY PALACE & PEG SYSTEM STATE ---
  const [selectedPreset, setSelectedPreset] = useState(MEMORY_PRESETS[0]);
  const [customMemoryTopic, setCustomMemoryTopic] = useState("");
  const [palaceResult, setPalaceResult] = useState<any>(null);
  const [isBuildingPalace, setIsBuildingPalace] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [testScore, setTestScore] = useState<number | null>(null);

  // Custom Interactive Room & Item Placement Architect State
  const [customPalaceRooms, setCustomPalaceRooms] = useState<{ room: string; item: string }[]>([
    { room: "Front Porch Swing", item: "Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a)" },
    { room: "Kitchen Refrigerator Door", item: "Newton's Second Law: F = m * a" },
    { room: "Bedroom Bookshelf Top Shelf", item: "Chain Rule: d/dx[f(g(x))] = f'(g(x)) * g'(x)" },
    { room: "Bathroom Vanity Mirror", item: "Ohm's Law: V = I * R" }
  ]);
  const [customRoomInput, setCustomRoomInput] = useState("");
  const [customItemInput, setCustomItemInput] = useState("");

  // --- TAB 3: SUMMARIZATION SCIENCE STATE ---
  const [summaryTopic, setSummaryTopic] = useState("The South African Constitution & Bill of Rights");
  const [originalText, setOriginalText] = useState("The Constitution of South Africa is the supreme law of the Republic. It provides the legal foundation for the existence of the Republic, sets out the rights and duties of its citizens, and defines the structure of the Government. The current constitution, the country's fifth, was drawn up by the Parliament elected in 1994 in the South African general election, 1994. It was promulgated by President Nelson Mandela on 18 December 1996 and came into effect on 4 February 1997, replacing the Interim Constitution of 1993.");
  const [studentSummary, setStudentSummary] = useState("");
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [isEvaluatingSummary, setIsEvaluatingSummary] = useState(false);

  // --- TAB 4: MATHEMATICS & FORMULAS MASTER LAB ---
  const [selectedFormula, setSelectedFormula] = useState(PRESET_FORMULAS[0]);
  const [customFormulaName, setCustomFormulaName] = useState("");
  const [customFormulaText, setCustomFormulaText] = useState("");
  const [formulaKit, setFormulaKit] = useState<any>(null);
  const [isGeneratingFormulaKit, setIsGeneratingFormulaKit] = useState(false);
  const [formulaDrills, setFormulaDrills] = useState<any>(null);
  const [isGeneratingDrills, setIsGeneratingDrills] = useState(false);
  const [userFormulaInputs, setUserFormulaInputs] = useState<{ [key: number]: string }>({});

  // --- TAB 5: SPEECH & VOCAL LAB STATE ---
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathTimer, setBreathTimer] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [speechPrompt, setSpeechPrompt] = useState("Why is critical thinking essential in modern education?");
  const [speechResponse, setSpeechResponse] = useState("");
  const [speechResult, setSpeechResult] = useState<any>(null);
  const [isEvaluatingSpeech, setIsEvaluatingSpeech] = useState(false);

  // Diaphragmatic Breath Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            if (breathPhase === "Inhale") {
              setBreathPhase("Hold");
              return 7;
            } else if (breathPhase === "Hold") {
              setBreathPhase("Exhale");
              return 8;
            } else {
              setBreathPhase("Inhale");
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathTimer(4);
      setBreathPhase("Inhale");
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase]);

  // Handle Feynman Technique Evaluation
  const handleEvaluateFeynman = async () => {
    if (!feynmanExplanation.trim()) return;
    setIsFeynmanEvaluating(true);
    setFeynmanResult(null);

    try {
      const token = await getAccessToken();
      const res = await fetch("/api/evaluate-technique", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          type: "feynman",
          payload: {
            topic: feynmanTopic,
            explanation: feynmanExplanation
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setFeynmanResult(data);
      } else {
        alert(data.error || "Evaluation failed");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error evaluating Feynman technique");
    } finally {
      setIsFeynmanEvaluating(false);
    }
  };

  // Handle Memory Palace Creation
  const handleGeneratePalace = async (topicToUse?: string, itemsToUse?: string[]) => {
    setIsBuildingPalace(true);
    setPalaceResult(null);
    setTestMode(false);
    setTestScore(null);

    const topic = topicToUse || customMemoryTopic || selectedPreset.topic;
    const items = itemsToUse || selectedPreset.items;

    try {
      const token = await getAccessToken();
      const res = await fetch("/api/evaluate-technique", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          type: "mnemonic",
          payload: {
            topic,
            items
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPalaceResult(data);
      } else {
        alert(data.error || "Failed to generate memory palace");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error generating memory palace");
    } finally {
      setIsBuildingPalace(false);
    }
  };

  // Custom Defined Loci Room Handlers
  const handleAddCustomLociRoom = () => {
    if (!customRoomInput.trim() || !customItemInput.trim()) return;
    setCustomPalaceRooms([
      ...customPalaceRooms,
      { room: customRoomInput.trim(), item: customItemInput.trim() }
    ]);
    setCustomRoomInput("");
    setCustomItemInput("");
  };

  const handleRemoveCustomLociRoom = (index: number) => {
    setCustomPalaceRooms(customPalaceRooms.filter((_, i) => i !== index));
  };

  const handleBuildCustomRoomPalace = async () => {
    if (customPalaceRooms.length === 0) return;
    setIsBuildingPalace(true);
    setPalaceResult(null);
    setTestMode(false);
    setTestScore(null);

    const formattedItems = customPalaceRooms.map((r) => `In room "${r.room}": place item/formula "${r.item}"`);

    try {
      const token = await getAccessToken();
      const res = await fetch("/api/evaluate-technique", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: "mnemonic",
          payload: {
            topic: "Student Custom Defined Memory Palace",
            items: formattedItems
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.locations) {
        setPalaceResult({
          palaceName: "Custom Personal Memory Palace",
          locations: data.locations.map((loc: any, i: number) => ({
            room: customPalaceRooms[i]?.room || loc.room || `Loci Room #${i + 1}`,
            item: customPalaceRooms[i]?.item || loc.item,
            sensoryMnemonic: loc.sensoryMnemonic || `Envision stepping into ${customPalaceRooms[i]?.room}. Embedded vividly on the center surface is ${customPalaceRooms[i]?.item}, radiating glowing neon energy.`,
            visualDescription: loc.visualDescription || `A 4K holographic display of ${customPalaceRooms[i]?.item} anchored inside ${customPalaceRooms[i]?.room}.`
          }))
        });
      } else {
        setPalaceResult({
          palaceName: "Custom Personal Memory Palace",
          locations: customPalaceRooms.map((r) => ({
            room: r.room,
            item: r.item,
            sensoryMnemonic: `Envision stepping into ${r.room}. Embedded vividly on the center surface is ${r.item}, radiating glowing neon energy and sound triggers.`,
            visualDescription: `A glowing 4K holographic display of ${r.item} anchored inside ${r.room}.`
          }))
        });
      }
    } catch (e) {
      console.error(e);
      setPalaceResult({
        palaceName: "Custom Personal Memory Palace",
        locations: customPalaceRooms.map((r) => ({
          room: r.room,
          item: r.item,
          sensoryMnemonic: `Envision stepping into ${r.room}. Embedded vividly on the center surface is ${r.item}, radiating glowing neon energy and sound triggers.`,
          visualDescription: `A glowing 4K holographic display of ${r.item} anchored inside ${r.room}.`
        }))
      });
    } finally {
      setIsBuildingPalace(false);
    }
  };

  // Evaluate Memory Palace Quiz
  const handleCheckMemoryQuiz = () => {
    if (!palaceResult || !palaceResult.locations) return;
    let correct = 0;
    palaceResult.locations.forEach((loc: any, idx: number) => {
      const ans = userAnswers[idx] || "";
      if (ans.toLowerCase().includes(loc.item.toLowerCase().split(" ")[0])) {
        correct++;
      }
    });
    setTestScore(Math.round((correct / palaceResult.locations.length) * 100));
  };

  // Handle Summarization Evaluation
  const handleEvaluateSummary = async () => {
    if (!studentSummary.trim()) return;
    setIsEvaluatingSummary(true);
    setSummaryResult(null);

    try {
      const token = await getAccessToken();
      const res = await fetch("/api/evaluate-technique", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          type: "summarization",
          payload: {
            topic: summaryTopic,
            originalText,
            studentSummary
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSummaryResult(data);
      } else {
        alert(data.error || "Failed to evaluate summary");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error evaluating summary");
    } finally {
      setIsEvaluatingSummary(false);
    }
  };

  // Handle Formula Memory Kit & Practice Drills Generation
  const handleGenerateFormulaKit = async (formObj?: typeof PRESET_FORMULAS[0]) => {
    setIsGeneratingFormulaKit(true);
    setFormulaKit(null);
    setFormulaDrills(null);

    const fName = formObj?.name || customFormulaName || selectedFormula.name;
    const fText = formObj?.formula || customFormulaText || selectedFormula.formula;
    const fSub = formObj?.subject || selectedFormula.subject;

    try {
      const token = await getAccessToken();
      
      // Fetch Formula Memory Kit
      const resKit = await fetch("/api/evaluate-technique", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          type: "formula_mnemonic",
          payload: { formulaName: fName, formulaText: fText, subject: fSub }
        })
      });

      const dataKit = await resKit.json();
      if (resKit.ok) {
        setFormulaKit(dataKit);
      }

      // Fetch Interactive Drills
      const resDrills = await fetch("/api/evaluate-technique", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          type: "formula_practice",
          payload: { formulaName: fName, formulaText: fText, subject: fSub }
        })
      });

      const dataDrills = await resDrills.json();
      if (resDrills.ok) {
        setFormulaDrills(dataDrills);
      }
    } catch (e: any) {
      console.error(e);
      alert("Error generating formula kit");
    } finally {
      setIsGeneratingFormulaKit(false);
    }
  };

  // Handle Speech Evaluation
  const handleEvaluateSpeech = async () => {
    if (!speechResponse.trim()) return;
    setIsEvaluatingSpeech(true);
    setSpeechResult(null);

    try {
      const token = await getAccessToken();
      const res = await fetch("/api/evaluate-technique", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          type: "speech",
          payload: {
            prompt: speechPrompt,
            response: speechResponse
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSpeechResult(data);
      } else {
        alert(data.error || "Failed to evaluate speech");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error evaluating speech");
    } finally {
      setIsEvaluatingSpeech(false);
    }
  };

  // Leitner Card Step
  const handleLeitnerAnswer = (known: boolean) => {
    setLeitnerFlashcards((prev) => {
      const updated = [...prev];
      const current = { ...updated[leitnerCardIdx] };
      if (known) {
        current.box = Math.min(current.box + 1, 5);
      } else {
        current.box = 1; // Reset to Box 1 on error
      }
      updated[leitnerCardIdx] = current;
      return updated;
    });

    setLeitnerRevealed(false);
    setLeitnerCardIdx((prev) => (prev + 1) % leitnerFlashcards.length);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-200/80 pb-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Brain className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            Cognitive Science & Neuroscience Laboratory
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-gray-900 tracking-tight leading-none">
            RESEARCH-BACKED <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">MASTERY LAB</span>
          </h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium max-w-3xl">
            Learn faster, remember longer, summarize like a pro, and master math formulas with peer-reviewed study science, 4K Memory Palace spatial mnemonics, and interactive AI practice drills.
          </p>
        </div>

        {/* Peer-Reviewed Badges */}
        <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl border border-slate-800 shadow-xl">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Validated Methodology</div>
            <div className="text-xs font-bold text-slate-200">100% Peer-Reviewed Cognitive Research</div>
          </div>
        </div>
      </div>

      {/* Peer-Reviewed Science Carousel Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-[2.5rem] p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">
          <Bookmark className="w-4 h-4 text-indigo-400" /> Key Research Foundations & Meta-Analyses
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {RESEARCH_STUDIES.map((study, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-xs font-black text-amber-300">{study.author}</div>
                <div className="text-[9px] text-indigo-200/80 font-mono mt-0.5">{study.journal}</div>
                <p className="text-[11px] text-slate-300 font-medium mt-2 leading-snug">
                  {study.finding}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[9px] uppercase font-black text-slate-400">Impact</span>
                <span className="text-xs font-black text-emerald-400">{study.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap bg-gray-100 p-1.5 rounded-2xl max-w-4xl mx-auto shadow-inner border border-gray-200 gap-1">
        <button
          onClick={() => setActiveTab("study")}
          className={cn(
            "flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-w-[130px]",
            activeTab === "study"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <BookOpen className="w-4 h-4" /> 1. Study Methods
        </button>
        <button
          onClick={() => setActiveTab("memory")}
          className={cn(
            "flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-w-[130px]",
            activeTab === "memory"
              ? "bg-purple-600 text-white shadow-md"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Building2 className="w-4 h-4" /> 2. Memory Palace
        </button>
        <button
          onClick={() => setActiveTab("summarization")}
          className={cn(
            "flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-w-[130px]",
            activeTab === "summarization"
              ? "bg-amber-600 text-white shadow-md"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <FileText className="w-4 h-4" /> 3. Summarization Science
        </button>
        <button
          onClick={() => setActiveTab("formulas")}
          className={cn(
            "flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-w-[130px]",
            activeTab === "formulas"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Calculator className="w-4 h-4" /> 4. Math & Formulas
        </button>
        <button
          onClick={() => setActiveTab("speech")}
          className={cn(
            "flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-w-[130px]",
            activeTab === "speech"
              ? "bg-rose-600 text-white shadow-md"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Mic className="w-4 h-4" /> 5. Speech Lab
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EVIDENCE-BASED STUDY TECHNIQUES */}
      {/* ========================================================================= */}
      {activeTab === "study" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          {/* Section 1: The Feynman Technique Studio */}
          <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Feather className="w-3.5 h-3.5 text-amber-600" /> Nobel Laureate Learning Method
                </div>
                <h2 className="text-3xl font-display font-black text-gray-900">The Feynman Technique Gym</h2>
                <p className="text-gray-500 text-xs font-medium">
                  "If you can't explain it simply, you don't understand it well enough." — Richard Feynman.
                </p>
              </div>

              {/* Topic Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-400 uppercase">Topic:</span>
                <select
                  value={feynmanTopic}
                  onChange={(e) => setFeynmanTopic(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
                >
                  <option value="Photosynthesis">Photosynthesis (Biology)</option>
                  <option value="Newton's Third Law">Newton's 3rd Law (Physics)</option>
                  <option value="Compound Interest">Compound Interest (Finance)</option>
                  <option value="Neural Networks">Neural Networks (Computer Science)</option>
                  <option value="DNA Replication">DNA Replication (Genetics)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: User Input */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 block">
                  Explain <span className="text-indigo-600">{feynmanTopic}</span> as if teaching a 10-Year-Old (No jargon!):
                </label>
                <textarea
                  rows={7}
                  value={feynmanExplanation}
                  onChange={(e) => setFeynmanExplanation(e.target.value)}
                  placeholder={`Example for ${feynmanTopic}: Think of a plant leaf like a miniature solar-powered kitchen. It catches sunlight, sips water from its roots, and cooks sugar to eat...`}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all leading-relaxed"
                />

                <button
                  onClick={handleEvaluateFeynman}
                  disabled={isFeynmanEvaluating || !feynmanExplanation.trim()}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isFeynmanEvaluating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-300" /> Analyzing Jargon & Simplicity...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" /> Evaluate with Feynman AI Coach
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: AI Feedback Analysis */}
              <div>
                {feynmanResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">Simplicity Score</span>
                        <div className="text-3xl font-black text-amber-400">{feynmanResult.score}/100</div>
                      </div>
                      <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-black uppercase">
                        {feynmanResult.simplicityLevel}
                      </span>
                    </div>

                    {/* Jargon detected */}
                    {feynmanResult.jargonDetected?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">Unexplained Jargon Terms:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {feynmanResult.jargonDetected.map((j: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-lg text-[10px] font-bold">
                              ⚠️ {j}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key concepts */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">Key Principles Covered:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {feynmanResult.keyConceptsCovered?.map((c: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-[10px] font-bold">
                            ✓ {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Exemplar Simplified Version */}
                    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Aristotle Perfected Explanation:</span>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed italic">
                        "{feynmanResult.simplifiedVersion}"
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 font-medium leading-relaxed pt-1">
                      {feynmanResult.feedback}
                    </p>
                  </motion.div>
                ) : (
                  <div className="h-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
                      <Brain className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900">Feynman Real-Time Jargon Meter</h3>
                    <p className="text-gray-500 text-xs font-medium max-w-xs">
                      Type your breakdown on the left and submit. Aristotle AI will scan your answer for high-level jargon, missing analogies, and clarity.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Leitner Box 5-Stage Spaced Repetition Flashcards */}
          <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" /> Sebastian Leitner (1972) System
                </div>
                <h2 className="text-3xl font-display font-black text-gray-900">Leitner 5-Box Spaced Repetition Drill</h2>
                <p className="text-gray-500 text-xs font-medium">
                  Cards move up a box when answered correctly (Box 1 = Daily, Box 2 = Every 3 Days, Box 5 = Every Month). An error drops the card back to Box 1!
                </p>
              </div>
            </div>

            {/* 5 Visual Leitner Boxes */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((boxNum) => {
                const count = leitnerFlashcards.filter((c) => c.box === boxNum).length;
                const intervals = ["Review: Daily", "Review: Every 3 Days", "Review: Every Week", "Review: Every 2 Weeks", "Review: Monthly"];
                return (
                  <div
                    key={boxNum}
                    className={cn(
                      "p-4 rounded-2xl border transition-all text-center space-y-1",
                      leitnerBox === boxNum ? "bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105" : "bg-gray-50 text-gray-800 border-gray-200"
                    )}
                  >
                    <div className="text-[10px] font-black uppercase tracking-wider opacity-80">Box {boxNum}</div>
                    <div className="text-2xl font-black">{count} Cards</div>
                    <div className="text-[9px] font-semibold opacity-70">{intervals[boxNum - 1]}</div>
                  </div>
                );
              })}
            </div>

            {/* Active Flashcard Canvas */}
            <div className="max-w-xl mx-auto space-y-4">
              <div
                onClick={() => setLeitnerRevealed(!leitnerRevealed)}
                className="bg-slate-900 text-white min-h-[200px] p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 transition-all relative overflow-hidden"
              >
                <span className="absolute top-4 left-4 px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-mono text-indigo-300 uppercase">
                  Box {leitnerFlashcards[leitnerCardIdx].box} Flashcard
                </span>
                <span className="absolute top-4 right-4 text-[10px] text-slate-400 font-bold">
                  Click to Flip 🔄
                </span>

                <AnimatePresence mode="wait">
                  {!leitnerRevealed ? (
                    <motion.div key="front" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                      <div className="text-xs uppercase font-black tracking-widest text-indigo-400">Question</div>
                      <h3 className="text-xl font-bold">{leitnerFlashcards[leitnerCardIdx].front}</h3>
                    </motion.div>
                  ) : (
                    <motion.div key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                      <div className="text-xs uppercase font-black tracking-widest text-emerald-400">Answer</div>
                      <p className="text-base font-medium text-slate-200">{leitnerFlashcards[leitnerCardIdx].back}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Response Controls */}
              {leitnerRevealed && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleLeitnerAnswer(false)}
                    className="py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Got it wrong (Reset to Box 1)
                  </button>
                  <button
                    onClick={() => handleLeitnerAnswer(true)}
                    className="py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mastered! (Promote Box)
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MEMORY PALACE (METHOD OF LOCI) & SPACING CURVE */}
      {/* ========================================================================= */}
      {activeTab === "memory" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          {/* Section 1: Ebbinghaus Forgetting Curve Interactive Chart */}
          <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Activity className="w-3.5 h-3.5 text-purple-600" /> Memory Retention Physics
                </div>
                <h2 className="text-3xl font-display font-black text-gray-900">Ebbinghaus Forgetting Curve Decay Graph</h2>
                <p className="text-gray-500 text-xs font-medium">
                  Notice how passive learning drops retention to 21% after 30 days, whereas 3 spaced interval reviews keep retention at 95%!
                </p>
              </div>
            </div>

            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={EBBINGHAUS_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="time" stroke="#64748B" fontSize={11} fontWeight={600} />
                  <YAxis stroke="#64748B" fontSize={11} fontWeight={600} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", borderRadius: "16px", color: "#FFF", border: "none" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "11px", fontWeight: "700" }} />
                  <Line type="monotone" dataKey="noReview" name="No Review (Decay to 21%)" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="review1" name="1st Review (Day 1)" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="review2" name="2nd Review (Day 7)" stroke="#38BDF8" strokeWidth={2} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="review3" name="3rd Review (Day 30 - 95% Recall)" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 2: Method of Loci / Memory Palace Simulator */}
          <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" /> Ancient Greek & Memory Grandmaster Technique
                </div>
                <h2 className="text-3xl font-display font-black text-gray-900">4K Sensory Memory Palace Journey</h2>
                <p className="text-gray-500 text-xs font-medium">
                  Select a topic to generate vivid 3D room-by-room sensory loci mnemonics.
                </p>
              </div>

              {/* Preset Selectors */}
              <div className="flex flex-wrap gap-2">
                {MEMORY_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedPreset(preset);
                      handleGeneratePalace(preset.topic, preset.items);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      selectedPreset.topic === preset.topic
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {preset.topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Memory Item Input */}
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={customMemoryTopic}
                onChange={(e) => setCustomMemoryTopic(e.target.value)}
                placeholder="Or enter custom topic (e.g. 10 French Vocabulary Words, Physics Formulas)"
                className="flex-1 p-3 bg-white border border-purple-200 rounded-xl text-xs font-medium focus:outline-none"
              />
              <button
                onClick={() => handleGeneratePalace()}
                disabled={isBuildingPalace}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
              >
                {isBuildingPalace ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" /> Constructing Loci...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> Build Memory Palace
                  </>
                )}
              </button>
            </div>

            {/* Custom Room & Formula Placement Architect */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-400">Interactive Room & Formula Placement Studio</h3>
                    <p className="text-[11px] text-slate-300">Define custom rooms in your home and place specific formulas or concepts directly into each location.</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
                  {customPalaceRooms.length} Custom Loci Rooms Defined
                </span>
              </div>

              {/* Input Form for Room + Item */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                <input
                  type="text"
                  value={customRoomInput}
                  onChange={(e) => setCustomRoomInput(e.target.value)}
                  placeholder="Room / Loci (e.g. My Bedroom Desk, Kitchen Island)"
                  className="sm:col-span-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 font-bold placeholder-slate-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={customItemInput}
                  onChange={(e) => setCustomItemInput(e.target.value)}
                  placeholder="Formula / Concept (e.g. Quadratic: x=(-b±√(b²-4ac))/2a)"
                  className="sm:col-span-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-300 font-mono placeholder-slate-500 focus:outline-none"
                />
                <button
                  onClick={handleAddCustomLociRoom}
                  className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" /> Add Room
                </button>
              </div>

              {/* List of Custom Loci Rooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                {customPalaceRooms.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-black text-purple-400 block">Loci #{i + 1}: {r.room}</span>
                      <span className="text-xs font-mono font-bold text-slate-200">{r.item}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveCustomLociRoom(i)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-all rounded-lg hover:bg-rose-500/10"
                      title="Remove Room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Build Custom Palace Button */}
              <button
                onClick={handleBuildCustomRoomPalace}
                disabled={isBuildingPalace || customPalaceRooms.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isBuildingPalace ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-slate-950" /> Generating 4K Visual Mnemonics for Custom Rooms...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" /> Generate Visual Mnemonics for Custom Rooms
                  </>
                )}
              </button>
            </div>

            {/* Render Memory Palace Loci Cards */}
            {palaceResult ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-black text-gray-900">
                    🏰 {palaceResult.palaceName}
                  </h3>
                  <button
                    onClick={() => setTestMode(!testMode)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all"
                  >
                    {testMode ? "Exit Spatial Recall Test" : "Start Spatial Recall Test Mode 🧠"}
                  </button>
                </div>

                {!testMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {palaceResult.locations?.map((loc: any, idx: number) => {
                      const roomObj = PALACE_ROOMS[idx % PALACE_ROOMS.length];
                      const IconComp = roomObj.icon;
                      return (
                        <div
                          key={idx}
                          className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3 relative overflow-hidden group"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center font-bold">
                                <IconComp className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-black uppercase text-purple-300">
                                Loci #{idx + 1}: {loc.room}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-amber-400 px-2.5 py-1 bg-amber-400/10 rounded-lg">
                              {loc.item}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Sensory Visual Mnemonic</span>
                            <p className="text-xs font-medium text-slate-200 leading-relaxed">
                              {loc.sensoryMnemonic}
                            </p>
                          </div>

                          <p className="text-[11px] text-slate-400 font-mono italic">
                            "{loc.visualDescription}"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Spatial Recall Test Mode */
                  <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6">
                    <div className="border-b border-slate-800 pb-4">
                      <h4 className="text-lg font-black text-amber-400">Spatial Retrieval Test</h4>
                      <p className="text-xs text-slate-300">
                        Walk through your memory palace room by room and enter what item/concept was placed in each location!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {palaceResult.locations?.map((loc: any, idx: number) => (
                        <div key={idx} className="bg-slate-800 p-4 rounded-2xl space-y-2 border border-slate-700">
                          <label className="text-xs font-black text-purple-300 uppercase block">
                            Room #{idx + 1}: {loc.room}
                          </label>
                          <input
                            type="text"
                            value={userAnswers[idx] || ""}
                            onChange={(e) => setUserAnswers({ ...userAnswers, [idx]: e.target.value })}
                            placeholder="What was stored here?"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <button
                        onClick={handleCheckMemoryQuiz}
                        className="py-3 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all"
                      >
                        Grade Spatial Memory
                      </button>

                      {testScore !== null && (
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase text-slate-400 block">Retrieval Score</span>
                          <span className="text-2xl font-black text-amber-400">{testScore}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center space-y-3">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Construct Your 4K Memory Palace</h3>
                <p className="text-gray-500 text-xs font-medium max-w-md mx-auto">
                  Click any preset topic above or type a custom topic to generate a spatial Loci journey with vivid sensory triggers.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SUMMARIZATION SCIENCE & CORNELL 5-3-1 WORKOUTS */}
      {/* ========================================================================= */}
      {activeTab === "summarization" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <FileText className="w-3.5 h-3.5 text-amber-600" /> Cornell Method & 5-3-1 Condensation
                </div>
                <h2 className="text-3xl font-display font-black text-gray-900">Summarization Science & Fluff-Stripper Gym</h2>
                <p className="text-gray-500 text-xs font-medium">
                  Master the art of extracting core concepts and stripping fluff without losing critical exam details.
                </p>
              </div>
            </div>

            {/* Guided Explanation Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">Step 1: 5 Bullets</span>
                <p className="text-xs text-slate-300 font-medium">Extract the 5 primary facts or events from the source text.</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">Step 2: 3 Takeaways</span>
                <p className="text-xs text-slate-300 font-medium">Compress those 5 bullets into 3 overarching core principles.</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">Step 3: 1 Golden Sentence</span>
                <p className="text-xs text-slate-300 font-medium">Synthesize everything into a single high-impact 1-line exam formula.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Source Text & User Summary */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-gray-700 block mb-1">Topic / Title:</label>
                  <input
                    type="text"
                    value={summaryTopic}
                    onChange={(e) => setSummaryTopic(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-700 block mb-1">Original Source Passage:</label>
                  <textarea
                    rows={4}
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-amber-700 block mb-1">Your 5-3-1 Condensed Summary:</label>
                  <textarea
                    rows={5}
                    value={studentSummary}
                    onChange={(e) => setStudentSummary(e.target.value)}
                    placeholder="Write your condensed summary here... e.g. 1) Enacted in 1996 by Nelson Mandela. 2) Replaced the 1993 interim constitution as the supreme law defining government structure..."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-800 focus:outline-none leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleEvaluateSummary}
                  disabled={isEvaluatingSummary || !studentSummary.trim()}
                  className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isEvaluatingSummary ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-300" /> Analyzing Fluff & Compression...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" /> Evaluate Summary Density
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: AI Summary Analysis */}
              <div>
                {summaryResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-400 block">Density Score</span>
                        <div className="text-3xl font-black text-amber-400">{summaryResult.score}/100</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">Compression Ratio</span>
                        <span className="text-xs font-bold text-emerald-400">{summaryResult.compressionRatio}</span>
                      </div>
                    </div>

                    {/* Key ideas captured */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">Core Ideas Preserved:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {summaryResult.keyIdeasCaptured?.map((idea: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-[10px] font-bold">
                            ✓ {idea}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Fluff or Redundancy */}
                    {summaryResult.fluffOrRedundancy?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">Unnecessary Fluff Stripped:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {summaryResult.fluffOrRedundancy.map((f: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-lg text-[10px] font-bold">
                              ✂️ {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Golden Sentence Synthesis */}
                    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Aristotle Golden Sentence Synthesis:</span>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed italic">
                        "{summaryResult.goldenSentence}"
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 font-medium leading-relaxed pt-1">
                      {summaryResult.feedback}
                    </p>
                  </motion.div>
                ) : (
                  <div className="h-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900">Summarization AI Evaluator</h3>
                    <p className="text-gray-500 text-xs font-medium max-w-xs">
                      Type your 5-3-1 summary on the left to receive instant feedback on fluff removal and idea preservation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MATHEMATICS & FORMULAS MASTER LAB */}
      {/* ========================================================================= */}
      {activeTab === "formulas" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          {/* Section 1: How to Remember Formulas & Formula Memory Kit */}
          <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Calculator className="w-3.5 h-3.5 text-emerald-600" /> Cognitive Formula Retention Science
                </div>
                <h2 className="text-3xl font-display font-black text-gray-900">Formula Memory Kit & Practice Drills</h2>
                <p className="text-gray-500 text-xs font-medium">
                  Never forget a math or physics formula again. Turn abstract variables into vivid stories, unit tricks, and interactive drills.
                </p>
              </div>

              {/* Preset Formulas */}
              <div className="flex flex-wrap gap-2">
                {PRESET_FORMULAS.map((f, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedFormula(f);
                      handleGenerateFormulaKit(f);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      selectedFormula.name === f.name
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {f.name} ({f.formula})
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Formula Input */}
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={customFormulaName}
                onChange={(e) => setCustomFormulaName(e.target.value)}
                placeholder="Formula Name (e.g. Sine Rule, Quadratic Formula)"
                className="flex-1 p-3 bg-white border border-emerald-200 rounded-xl text-xs font-medium focus:outline-none"
              />
              <input
                type="text"
                value={customFormulaText}
                onChange={(e) => setCustomFormulaText(e.target.value)}
                placeholder="Equation (e.g. a / sin(A) = b / sin(B))"
                className="flex-1 p-3 bg-white border border-emerald-200 rounded-xl text-xs font-medium focus:outline-none"
              />
              <button
                onClick={() => handleGenerateFormulaKit()}
                disabled={isGeneratingFormulaKit}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
              >
                {isGeneratingFormulaKit ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" /> Building Kit...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> Generate Memory Kit & Drills
                  </>
                )}
              </button>
            </div>

            {/* Render Formula Memory Kit */}
            {formulaKit ? (
              <div className="space-y-6">
                <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">Active Formula</span>
                      <h3 className="text-2xl font-black text-amber-400">{formulaKit.formulaName}</h3>
                      <div className="text-xl font-mono text-slate-200 mt-1">{formulaKit.formulaText}</div>
                    </div>
                    <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-black uppercase border border-emerald-500/30">
                      100% Memory Retention Anchor
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Story Mnemonic */}
                    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
                      <span className="text-[10px] font-black uppercase text-amber-400 block">📖 Story Mnemonic</span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">{formulaKit.storyMnemonic}</p>
                    </div>

                    {/* Visual Anchor */}
                    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
                      <span className="text-[10px] font-black uppercase text-indigo-400 block">👁️ Visual Anchor</span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">{formulaKit.visualAnchor}</p>
                    </div>

                    {/* Dimensional Analysis Trick */}
                    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
                      <span className="text-[10px] font-black uppercase text-emerald-400 block">📐 Dimensional Unit Trick</span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">{formulaKit.unitDimensionalTrick}</p>
                    </div>
                  </div>

                  {/* Variables Breakdown */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Variable Anatomy Breakdown:</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formulaKit.variables?.map((v: any, idx: number) => (
                        <div key={idx} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
                          <span className="font-mono font-black text-amber-300">{v.symbol}</span> = {v.name} ({v.unit})
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pitfalls to avoid */}
                  <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-200 rounded-2xl text-xs font-medium">
                    ⚠️ <strong>Common Exam Pitfall:</strong> {formulaKit.commonPitfallToAvoid}
                  </div>
                </div>

                {/* Formula Practice Drills */}
                {formulaDrills?.exercises && (
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 space-y-6">
                    <div className="border-b border-gray-100 pb-4">
                      <h3 className="text-xl font-display font-black text-gray-900">Interactive Formula Practice Exercises</h3>
                      <p className="text-xs text-gray-500">Apply the formula to real scenarios step-by-step.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {formulaDrills.exercises.map((ex: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-emerald-600">Exercise #{idx + 1}: {ex.title}</span>
                            <span className="text-xs font-bold text-gray-500">Target: Solve for <strong className="text-gray-900 font-mono">{ex.targetVariable}</strong></span>
                          </div>

                          <p className="text-xs text-gray-800 font-medium leading-relaxed">{ex.scenario}</p>

                          <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs font-mono text-gray-700 flex flex-wrap gap-4">
                            <span>Given:</span>
                            {Object.entries(ex.givenValues || {}).map(([k, v]: any, i) => (
                              <span key={i} className="font-bold text-indigo-600">{k} = {v}</span>
                            ))}
                          </div>

                          <div className="space-y-2 pt-2 border-t border-gray-200">
                            <span className="text-[10px] font-black uppercase text-gray-400 block">Step-by-Step AI Solution:</span>
                            {ex.stepByStepSolution?.map((step: any, sIdx: number) => (
                              <div key={sIdx} className="text-xs text-gray-700 font-medium flex items-center gap-2">
                                <span className="w-5 h-5 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-[10px] font-bold">{step.step}</span>
                                <span>{step.action}: <strong className="font-mono text-gray-900">{step.result}</strong></span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-black text-emerald-700">Final Answer: {ex.finalAnswer} {ex.unit}</span>
                            <span className="text-[10px] text-amber-700 italic">💡 Hint: {ex.hint}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold mx-auto">
                  <Calculator className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Formula Mastery Engine</h3>
                <p className="text-gray-500 text-xs font-medium max-w-md mx-auto">
                  Click any preset formula above or enter a custom equation to generate a complete story memory kit and interactive drills.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SPEECH, VOCAL CADENCE & ORAL EXAM LAB */}
      {/* ========================================================================= */}
      {activeTab === "speech" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          {/* Section 1: Diaphragmatic Breathing & Speech Pace Meter */}
          <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Mic className="w-3.5 h-3.5 text-rose-600" /> Jerath et al. (2006) Diaphragmatic Control
                </div>
                <h2 className="text-3xl font-display font-black text-gray-900">4-7-8 Vocal Breathing & Cadence Trainer</h2>
                <p className="text-gray-500 text-xs font-medium">
                  Lower stage fright cortisol levels before public speaking or oral exams with synchronized breath cycles.
                </p>
              </div>

              <button
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className={cn(
                  "px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2",
                  isBreathingActive ? "bg-rose-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800"
                )}
              >
                {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isBreathingActive ? "Stop Breathing Cycle" : "Start 4-7-8 Breathing Cycle"}
              </button>
            </div>

            {/* Animated Expanding Breathing Circle */}
            <div className="bg-slate-900 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden min-h-[300px]">
              <motion.div
                animate={{
                  scale: breathPhase === "Inhale" ? 1.5 : breathPhase === "Hold" ? 1.5 : 0.9,
                  opacity: breathPhase === "Inhale" ? 0.9 : breathPhase === "Hold" ? 1.0 : 0.6
                }}
                transition={{ duration: breathPhase === "Inhale" ? 4 : breathPhase === "Hold" ? 0 : 8, ease: "easeInOut" }}
                className="w-40 h-40 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl shadow-rose-500/50"
              >
                <div className="text-center text-white">
                  <div className="text-2xl font-black">{breathPhase}</div>
                  <div className="text-3xl font-black font-mono">{breathTimer}s</div>
                </div>
              </motion.div>

              <div className="text-xs text-slate-400 font-medium max-w-sm">
                Target Speaking Cadence: <span className="text-amber-400 font-bold">130 - 150 Words Per Minute</span> for maximum clarity and cognitive impact.
              </div>
            </div>
          </div>

          {/* Section 2: Aristotle Viva-Voce Oral Simulator */}
          <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <MessageSquare className="w-3.5 h-3.5 text-rose-600" /> Aristotle Rhetorical Triad (Ethos, Pathos, Logos)
                </div>
                <h2 className="text-3xl font-display font-black text-gray-900">Aristotle Oral Defense & Speech Evaluator</h2>
                <p className="text-gray-500 text-xs font-medium">
                  Type or speak your oral defense answer. Aristotle AI will grade your Credibility (Ethos), Emotion (Pathos), and Logic (Logos).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Input Prompt & Response */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-gray-700 block mb-1">Oral Exam Question / Speech Prompt:</label>
                  <input
                    type="text"
                    value={speechPrompt}
                    onChange={(e) => setSpeechPrompt(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-700 block mb-1">Your Spoken / Written Defense Answer:</label>
                  <textarea
                    rows={6}
                    value={speechResponse}
                    onChange={(e) => setSpeechResponse(e.target.value)}
                    placeholder="Enter your oral response here... e.g. Critical thinking is vital because it enables students to analyze raw information rather than accepting dogma blindly. For instance..."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-800 focus:outline-none leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleEvaluateSpeech}
                  disabled={isEvaluatingSpeech || !speechResponse.trim()}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isEvaluatingSpeech ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-300" /> Evaluating Rhetoric Triad...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-amber-300" /> Evaluate Speech & Rhetoric
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: AI Rhetoric Breakdown */}
              <div>
                {speechResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-rose-400 block">Overall Speech Mastery</span>
                        <div className="text-3xl font-black text-amber-400">{speechResult.score}/100</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">Clarity & Pace</span>
                        <span className="text-xs font-bold text-emerald-400">{speechResult.clarityAndPace}</span>
                      </div>
                    </div>

                    {/* Rhetorical Triad Progress Bars */}
                    <div className="space-y-2 bg-slate-800 p-4 rounded-2xl border border-slate-700">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Aristotle's Rhetorical Triad Breakdown:</span>

                      {/* Ethos */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-cyan-400">ETHOS (Credibility & Authority)</span>
                          <span>{speechResult.ethosScore}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400" style={{ width: `${speechResult.ethosScore}%` }} />
                        </div>
                      </div>

                      {/* Pathos */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-rose-400">PATHOS (Audience Connection & Emotion)</span>
                          <span>{speechResult.pathosScore}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-400" style={{ width: `${speechResult.pathosScore}%` }} />
                        </div>
                      </div>

                      {/* Logos */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-emerald-400">LOGOS (Logic & Evidence)</span>
                          <span>{speechResult.logosScore}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400" style={{ width: `${speechResult.logosScore}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Exemplar Answer Script */}
                    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Aristotle Gold-Standard Oral Script:</span>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed italic">
                        "{speechResult.exemplarAnswer}"
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 font-medium leading-relaxed pt-1">
                      {speechResult.feedback}
                    </p>
                  </motion.div>
                ) : (
                  <div className="h-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-bold">
                      <Mic className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900">Aristotle Rhetoric Evaluator</h3>
                    <p className="text-gray-500 text-xs font-medium max-w-xs">
                      Type your oral defense or debate speech on the left to receive live feedback on Ethos, Pathos, and Logos.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
