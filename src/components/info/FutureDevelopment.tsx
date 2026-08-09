import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { McpEduHub } from "../mcp/McpEduHub";
import {
  Rocket, Sparkles, Brain, CheckCircle2, Clock, AlertCircle,
  Code, Cpu, Globe, CreditCard, Layers, Compass, CheckSquare,
  Kanban, Beaker, GitCommit, FileText, ArrowRight, Search,
  ChevronDown, ChevronRight, Plus, Filter, Zap, Shield, BookOpen,
  Award, Users, Star, Lock, Lightbulb, Terminal, Server, Database,
  TrendingUp, Laptop, Microchip, RefreshCw, Eye, MessageSquare,
  Bot, Stethoscope, Scale, Building, Music, Clapperboard, Plane,
  Leaf, Crosshair, Wrench, Sprout, Heart, Target, Layers3, Activity,
  Palette, GraduationCap
} from "lucide-react";

// --- STATUS BADGE COMPONENT ---
type StatusType = "Completed" | "In Progress" | "Planned" | "Research" | "Not Started" | "Blocked";

const StatusBadge = ({ status }: { status: StatusType }) => {
  const configs: Record<StatusType, { bg: string; text: string; border: string; icon: string }> = {
    Completed: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", icon: "🟢" },
    "In Progress": { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", icon: "🟡" },
    Planned: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", icon: "🔵" },
    Research: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", icon: "🟣" },
    "Not Started": { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/30", icon: "🔴" },
    Blocked: { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30", icon: "⏹️" }
  };

  const cfg = configs[status] || configs["Planned"];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-black border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span>{cfg.icon}</span>
      <span>{status}</span>
    </span>
  );
};

// --- SECTION DATA DEFINITIONS ---

interface UpcomingFeature {
  id: string;
  name: string;
  description: string;
  businessValue: string;
  expectedBenefits: string;
  complexity: "Low" | "Medium" | "High" | "Architectural";
  priority: "P0 Critical" | "P1 High" | "P2 Medium" | "P3 Future";
  status: StatusType;
  category: "AI & ML" | "Curriculum" | "Infrastructure" | "Accessibility" | "Monetization";
}

const UPCOMING_FEATURES: UpcomingFeature[] = [
  {
    id: "f1",
    name: "Feynman Step-by-Step KaTeX Math Solver",
    description: "Line-by-line derivation engine with KaTeX LaTeX formulas and dynamic D3.js coordinate plotting.",
    businessValue: "Core product differentiator; drives student engagement and conversion to Gold VIP tier.",
    expectedBenefits: "Instant, error-free mathematical tutoring with interactive visual feedback.",
    complexity: "High",
    priority: "P0 Critical",
    status: "Completed",
    category: "AI & ML"
  },
  {
    id: "f2",
    name: "Multilingual Regional Voice Tutor (11 SA Languages)",
    description: "Spoken voice tutoring using Web Speech API with bilingual code-switching for African dialects.",
    businessValue: "Unlocks rural and township markets by eliminating language barriers in STEM education.",
    expectedBenefits: "Enhanced comprehension for non-native English speakers across South Africa and SADC.",
    complexity: "High",
    priority: "P0 Critical",
    status: "Completed",
    category: "Accessibility"
  },
  {
    id: "f3",
    name: "Google Vision AI OCR Homework Doctor",
    description: "Camera & file image analysis detecting handwritten math, physics, and chemistry equations.",
    businessValue: "Reduces friction for students submitting paper assignments and homework problems.",
    expectedBenefits: "Instant diagnostic of student mistakes in calculations with step-by-step corrections.",
    complexity: "Medium",
    priority: "P0 Critical",
    status: "Completed",
    category: "AI & ML"
  },
  {
    id: "f4",
    name: "Autonomous Multi-Agent Peer Study Groups",
    description: "Simulated peer AI agents taking on specialized roles (Socratic Questioner, Summarizer, Quiz Master).",
    businessValue: "Increases session duration and viral engagement through collaborative AI study rooms.",
    expectedBenefits: "Deepens conceptual understanding through peer discussion and interactive debate.",
    complexity: "Architectural",
    priority: "P1 High",
    status: "In Progress",
    category: "AI & ML"
  },
  {
    id: "f5",
    name: "On-Device WebLLM / Gemini Nano Offline Engine",
    description: "Local browser LLM execution via WebGPU for basic math solving without internet connection.",
    businessValue: "Eliminates token costs for basic queries while guaranteeing offline reliability in low-data areas.",
    expectedBenefits: "Zero-latency problem solving even during load shedding or connectivity blackouts.",
    complexity: "Architectural",
    priority: "P1 High",
    status: "Research",
    category: "Infrastructure"
  },
  {
    id: "f6",
    name: "School District & Institutional Billing Portal",
    description: "Multi-tenant administrator dashboard for bulk seat allocations, token pool sharing, and audit reporting.",
    businessValue: "Unlocks enterprise B2B revenue streams (R499 - R14,999/mo per school).",
    expectedBenefits: "Enables school principals to deploy Pocket School Pro across entire student bodies.",
    complexity: "Medium",
    priority: "P1 High",
    status: "In Progress",
    category: "Monetization"
  },
  {
    id: "f7",
    name: "WAEC, KCSE & ZIMSEC Regional Examination Engines",
    description: "Curriculum alignment and past paper question banks for West Africa, Kenya, and Zimbabwe.",
    businessValue: "Drives pan-African expansion into Nigeria, Kenya, Ghana, and Zimbabwe.",
    expectedBenefits: "Localized exam preparation tailored to national exam boards across Africa.",
    complexity: "Medium",
    priority: "P2 Medium",
    status: "Planned",
    category: "Curriculum"
  },
  {
    id: "f8",
    name: "3D Interactive AR Science Laboratory",
    description: "WebXR & WebGL 3D virtual chemistry reaction vessels and physics pendulum experiments.",
    businessValue: "Replaces expensive physical science lab equipment for under-resourced schools.",
    expectedBenefits: "Hands-on virtual experiment experience directly inside the browser.",
    complexity: "High",
    priority: "P2 Medium",
    status: "Research",
    category: "AI & ML"
  }
];

// --- AI DEVELOPMENT NOTES CATEGORIES ---
interface AIDevNoteCategory {
  title: string;
  icon: any;
  items: { idea: string; implementationDetails: string; status: StatusType; impact: string }[];
}

const AI_DEV_NOTES: AIDevNoteCategory[] = [
  {
    title: "AI Reasoning & Model Architecture",
    icon: Brain,
    items: [
      {
        idea: "Gemini 1.5 Pro Deep Reasoning Routing",
        implementationDetails: "Route complex multi-step calculus, organic chemistry, and physics tensor equations through Gemini 1.5 Pro with explicit chain-of-thought prompt templates.",
        status: "Completed",
        impact: "Reduces mathematical hallucination rate to <1.2%."
      },
      {
        idea: "Multi-Agent Reflection & Verification Loop",
        implementationDetails: "Pass initial AI response through a secondary verification agent before rendering to student to double-check numerical accuracy and LaTeX syntax.",
        status: "In Progress",
        impact: "Guarantees 100% mathematical correctness on final answers."
      },
      {
        idea: "Digital Twin Student Knowledge Graph",
        implementationDetails: "Maintain a dynamic Bayesian knowledge graph tracking student mastery down to individual sub-skills (e.g. 'integration by parts').",
        status: "Research",
        impact: "Enables hyper-personalized question generation targeting exact weak spots."
      }
    ]
  },
  {
    title: "Vision AI & OCR Enhancements",
    icon: Eye,
    items: [
      {
        idea: "Handwritten Diagram & Circuit Schematic Parsing",
        implementationDetails: "Train multi-modal vision prompt to convert hand-drawn electrical circuits into netlist JSON structures for circuit simulation.",
        status: "In Progress",
        impact: "Enables instant simulation of hand-drawn electrical engineering diagrams."
      },
      {
        idea: "Multi-Page Exam Paper Batch OCR",
        implementationDetails: "Allow students to upload entire 10-page handwritten exam scripts for automated line-by-line grading against official MEMO.",
        status: "Planned",
        impact: "Saves hours of teacher grading time while giving students detailed mark breakdowns."
      }
    ]
  },
  {
    title: "Voice & Speech Synthesis Systems",
    icon: MessageSquare,
    items: [
      {
        idea: "Bilingual Code-Switching Speech Pacing",
        implementationDetails: "Dynamic SSML generation inserting natural pauses when transitioning between English STEM terminology and indigenous African languages.",
        status: "Completed",
        impact: "Enhances vocal clarity and phonetic naturalness during voice tutoring."
      },
      {
        idea: "Interactive Live Voice Duplex (Live API)",
        implementationDetails: "Integrate Gemini Live API via WebSockets for real-time conversational audio tutoring with zero press-to-talk latency.",
        status: "Research",
        impact: "Provides realistic human-like audio conversation for study sessions."
      }
    ]
  },
  {
    title: "Domain-Specific Specialized AI Tools",
    icon: Sprout,
    items: [
      {
        idea: "Agricultural & Environmental AI Scientist",
        implementationDetails: "Crop disease diagnosis, soil pH chemistry calculations, and sustainable farming yield optimization models tailored for TVET Agriculture.",
        status: "Planned",
        impact: "Supports agricultural academies and rural farming communities across Africa."
      },
      {
        idea: "Medical & Nursing Diagnostic Simulator",
        implementationDetails: "Clinical case study scenario generator for nursing and medical students with anatomy diagram labelers.",
        status: "Planned",
        impact: "Provides realistic clinical case study practice for healthcare students."
      },
      {
        idea: "AI Coding & Software Engineering Tutor",
        implementationDetails: "Interactive code execution sandbox with real-time linting, debugging tips, and algorithm visualization.",
        status: "Completed",
        impact: "Helps students learn Python, JavaScript, Java, and C++ with instant guidance."
      }
    ]
  }
];

// --- FUTURE EDUCATION MODULES ---
const FUTURE_EDUCATION_MODULES = [
  { name: "Financial Literacy", icon: CreditCard, domain: "Commerce", tier: "All Grades", desc: "Budgeting, compound interest, tax calculation, and investment math." },
  { name: "Entrepreneurship & Startup Math", icon: TrendingUp, domain: "Business", tier: "Grades 10-12", desc: "Break-even analysis, cash flow modeling, valuation, and pitch decks." },
  { name: "Artificial Intelligence & ML", icon: Brain, domain: "STEM", tier: "Advanced", desc: "Neural networks, linear algebra for ML, decision trees, and Python AI." },
  { name: "Cyber Security & Cryptography", icon: Shield, domain: "IT", tier: "Grades 9-12", desc: "RSA encryption math, network protocols, threat analysis, and ethical hacking." },
  { name: "Robotics & Automation", icon: Microchip, domain: "Engineering", tier: "Grades 8-12", desc: "Arduino programming, kinematics, PID controllers, and circuit logic." },
  { name: "Astronomy & Astrophysics", icon: Compass, domain: "Physics", tier: "Advanced", desc: "Keplerian orbits, stellar evolution, Doppler shift, and cosmology equations." },
  { name: "Environmental & Climate Science", icon: Leaf, domain: "Science", tier: "All Grades", desc: "Carbon cycle modeling, renewable energy thermodynamics, and biodiversity." },
  { name: "Marine Biology & Oceanography", icon: Compass, domain: "Biology", tier: "Grades 10-12", desc: "Ocean currents, marine ecosystems, salinity chemistry, and aquaculture." },
  { name: "Constitutional & Civil Law", icon: Scale, domain: "Humanities", tier: "Grades 10-12", desc: "South African Bill of Rights, legal reasoning, case analysis, and contracts." },
  { name: "Financial Accounting & Tax", icon: FileText, domain: "Commerce", tier: "Grades 10-12", desc: "Double-entry bookkeeping, balance sheets, VAT calculations, and auditing." },
  { name: "Architectural & CAD Design", icon: Building, domain: "Design", tier: "Grades 10-12", desc: "3D geometry, structural load calculations, spatial blueprints, and CAD." },
  { name: "Mechanical & Civil Engineering", icon: Wrench, domain: "Engineering", tier: "TVET / Tertiary", desc: "Statics, dynamics, fluid mechanics, stress-strain analysis, and thermodynamics." },
  { name: "Medicine & Anatomy Studies", icon: Stethoscope, domain: "Health", tier: "Tertiary Prep", desc: "Human organ systems, pharmacology math, biochemistry, and pathology." },
  { name: "Veterinary Science & Animal Care", icon: Heart, domain: "Health", tier: "Grades 10-12", desc: "Animal biology, livestock epidemiology, dosage calculations, and genetics." },
  { name: "Psychology & Cognitive Science", icon: Users, domain: "Humanities", tier: "Grades 11-12", desc: "Behavioral neuroscience, research statistics, memory models, and ethics." },
  { name: "Creative Arts & Design Theory", icon: Palette, domain: "Arts", tier: "All Grades", desc: "Color theory math, composition, art history, and digital illustration." },
  { name: "Music Theory & Acoustics", icon: Music, domain: "Arts", tier: "All Grades", desc: "Harmonic frequencies, wave physics, notation, counterpoint, and sound engineering." },
  { name: "Film Production & Sound Engineering", icon: Clapperboard, domain: "Media", tier: "Grades 9-12", desc: "Cinematography optics, lighting physics, video editing logic, and audio mixing." },
  { name: "3D Animation & VFX", icon: Layers3, domain: "Media", tier: "Grades 9-12", desc: "Rigging geometry, particle physics, keyframing math, and 3D rendering." },
  { name: "Game Development & Physics Engines", icon: Terminal, domain: "IT", tier: "Grades 9-12", desc: "Vector math, collision detection algorithms, game loop architecture, and Unity/Unreal." },
  { name: "Drone Technology & Navigation", icon: Plane, domain: "Aviation", tier: "Grades 9-12", desc: "Flight dynamics, GPS triangulation math, drone mechanics, and flight regulations." },
  { name: "Renewable Energy & Solar Engineering", icon: Zap, domain: "Engineering", tier: "TVET / Grades 10-12", desc: "Photovoltaic efficiency calculations, battery storage chemistry, and inverter sizing." },
  { name: "Quantum Computing Foundations", icon: Microchip, domain: "STEM", tier: "Advanced", desc: "Qubits, superposition linear algebra, quantum logic gates, and Qiskit." },
  { name: "Blockchain & Decentralized Tech", icon: Database, domain: "IT", tier: "Grades 11-12", desc: "Hash functions, consensus mechanisms, smart contract logic, and tokenomics." },
  { name: "Space Science & Rocket Propulsion", icon: Rocket, domain: "Physics", tier: "Advanced", desc: "Tsiolkovsky rocket equation, orbital mechanics, atmospheric entry, and telemetry." },
  { name: "Aviation & Flight Theory", icon: Plane, domain: "Aviation", tier: "Grades 10-12", desc: "Aerodynamics, lift-to-drag ratios, navigation flight planning, and meteorology." },
  { name: "Hospitality & Culinary Arts", icon: Award, domain: "Vocational", tier: "TVET / Grades 10-12", desc: "Recipe scaling math, food safety chemistry, restaurant management, and nutrition." },
  { name: "Tourism & African Heritage", icon: Globe, domain: "Humanities", tier: "All Grades", desc: "Ecotourism management, African geography, cultural heritage, and hospitality." },
  { name: "Fashion Design & Textile Science", icon: Layers, domain: "Arts", tier: "Grades 9-12", desc: "Pattern geometry, fabric tension math, textile chemistry, and fashion marketing." },
  { name: "Automotive Technology & EV Engines", icon: Wrench, domain: "TVET", tier: "TVET / Grades 10-12", desc: "Internal combustion physics, electric vehicle battery circuits, and diagnostic systems." },
  { name: "Construction & Quantity Surveying", icon: Building, domain: "TVET", tier: "TVET / Grades 10-12", desc: "Material cost estimation, structural geometry, building codes, and project management." },
  { name: "Sustainable Agriculture & Hydroponics", icon: Sprout, domain: "Agriculture", tier: "TVET / All Grades", desc: "Hydroponic nutrient solution math, greenhouse climate control, and soil conservation." },
  { name: "Forestry & Wildlife Conservation", icon: Leaf, domain: "Environment", tier: "Grades 10-12", desc: "Wildlife population dynamics, forest mensuration, anti-poaching tech, and ecology." },
  { name: "Food Science & Biotechnology", icon: Beaker, domain: "Science", tier: "Grades 11-12", desc: "Food microbiology, preservation chemistry, fermentation, and nutritional analysis." },
  { name: "Sports Science & Biomechanics", icon: Activity, domain: "Health", tier: "Grades 9-12", desc: "Kinematic motion analysis, muscle physiology, energy expenditure, and sports nutrition." },
  { name: "Public Speaking & Debate Mastery", icon: MessageSquare, domain: "Leadership", tier: "All Grades", desc: "Rhetoric, logical fallacy detection, persuasive speech writing, and parliamentary debate." },
  { name: "Leadership & Civic Governance", icon: Target, domain: "Leadership", tier: "All Grades", desc: "Ethics, team management, community organizing, and democratic participation." },
  { name: "Career Guidance & University Prep", icon: GraduationCap, domain: "Guidance", tier: "Grades 10-12", desc: "APS score calculator, university application strategy, bursary search, and CV writing." }
];

// --- INTERNATIONAL EXPANSION MATRIX ---
const INTERNATIONAL_EXPANSION = [
  { country: "South Africa 🇿🇦", curricula: ["CAPS", "IEB"], languages: "11 Official Languages", examBoard: "UMALUSI / IEB", status: "Completed" as StatusType },
  { country: "Nigeria 🇳🇬", curricula: ["WAEC", "NECO"], languages: "English, Yoruba, Hausa, Igbo", examBoard: "WAEC Council", status: "In Progress" as StatusType },
  { country: "Kenya 🇰🇪", curricula: ["CBC", "KCSE"], languages: "English, Swahili", examBoard: "KNEC", status: "In Progress" as StatusType },
  { country: "Zimbabwe 🇿🇼", curricula: ["ZIMSEC"], languages: "English, Shona, Ndebele", examBoard: "ZIMSEC", status: "Planned" as StatusType },
  { country: "Ghana 🇬🇭", curricula: ["WASSCE"], languages: "English, Twi", examBoard: "WAEC Ghana", status: "Planned" as StatusType },
  { country: "United Kingdom 🇬🇧", curricula: ["Cambridge CAIE", "UK National"], languages: "English", examBoard: "Cambridge / Edexcel", status: "Completed" as StatusType },
  { country: "United States 🇺🇸", curricula: ["Common Core", "AP", "SAT/ACT"], languages: "English, Spanish", examBoard: "College Board", status: "Completed" as StatusType },
  { country: "Global / IB 🇺🇳", curricula: ["IB PYP/MYP/DP"], languages: "Multilingual", examBoard: "International Baccalaureate", status: "Completed" as StatusType }
];

// --- SUBSCRIPTION ROADMAP ---
const SUBSCRIPTION_ROADMAP = [
  { plan: "Family Pass (Multi-Student Household)", price: "R299/mo", details: "Up to 4 student profiles, shared 5M pooled tokens, unified parent dashboard.", status: "In Progress" as StatusType },
  { plan: "School District & Provincial Pass", price: "R14,999/mo+", details: "Unlimited school deployments, dedicated account manager, custom API quota, offline server integration.", status: "In Progress" as StatusType },
  { plan: "Corporate Sponsor-a-Learner Program", price: "Flexible CSR", details: "Direct tax-deductible CSR sponsorship of township school passes with transparent impact metrics.", status: "Completed" as StatusType },
  { plan: "Token Marketplace & Top-Up Bundles", price: "From R20", details: "Buy additional 500k token top-up packs on demand using Yoco or instant EFT.", status: "Planned" as StatusType },
  { plan: "Gamified Reward & Scholarship Marketplace", price: "Earned XP", details: "Students convert study streak XP into real-world bursaries, data bundles, and book vouchers.", status: "Research" as StatusType }
];

// --- AI CAPABILITY ROADMAP ---
const AI_CAPABILITIES = [
  { name: "AI Study Coach", role: "Personalized daily learning velocity manager & streak motivator.", icon: Zap },
  { name: "AI STEM Math Professor", role: "Feynman whiteboard tutor rendering KaTeX and D3 SVG graphs.", icon: Brain },
  { name: "AI Science Lab Assistant", role: "Virtual chemistry & physics experiment simulation advisor.", icon: Beaker },
  { name: "AI Language & Dialect Coach", role: "Spoken voice tutor in 11 SA languages with code-switching.", icon: MessageSquare },
  { name: "AI Essay & Literature Reviewer", role: "Grammar, argument structure, and citation style checker.", icon: BookOpen },
  { name: "AI Exam Generator & Marker", role: "Generates CAPS/IEB past paper practice questions with MEMO.", icon: CheckSquare },
  { name: "AI Career & APS Score Advisor", role: "Calculates APS admission scores and suggests university degrees.", icon: Compass },
  { name: "AI Coding Sandbox Tutor", role: "Real-time Python & Web Dev code debugger and logic guide.", icon: Code }
];

// --- FEATURE CHECKLIST ---
interface ChecklistItem {
  id: string;
  feature: string;
  category: string;
  priority: string;
  status: StatusType;
  dependencies: string;
  owner: string;
}

const FEATURE_CHECKLIST: ChecklistItem[] = [
  { id: "chk-1", feature: "Feynman Whiteboard KaTeX Rendering", category: "Core Study", priority: "P0", status: "Completed", dependencies: "KaTeX CSS / Library", owner: "AI Engineering" },
  { id: "chk-2", feature: "D3.js SVG Function Coordinate Plotter", category: "Core Study", priority: "P0", status: "Completed", dependencies: "D3.js 7.x", owner: "Frontend Core" },
  { id: "chk-3", feature: "Google Vision AI OCR Homework Scanner", category: "Vision AI", priority: "P0", status: "Completed", dependencies: "Gemini 1.5 Flash Vision", owner: "AI Engineering" },
  { id: "chk-4", feature: "11 SA Language Voice Tutoring (TTS)", category: "Voice Hub", priority: "P0", status: "Completed", dependencies: "Web Speech API", owner: "Voice Team" },
  { id: "chk-5", feature: "Yoco ZAR Payment Checkout Modal", category: "Billing", priority: "P0", status: "Completed", dependencies: "Yoco SDK API", owner: "Monetization" },
  { id: "chk-6", feature: "Full PWA Downloadability & Manifest", category: "Mobile PWA", priority: "P0", status: "Completed", dependencies: "Service Worker / Manifest", owner: "PWA Team" },
  { id: "chk-7", feature: "School Base Pass Multi-Seat Pool", category: "Enterprise", priority: "P1", status: "In Progress", dependencies: "Firestore Admin SDK", owner: "Backend Core" },
  { id: "chk-8", feature: "WebGPU On-Device LLM Offline Fallback", category: "Offline AI", priority: "P2", status: "Research", dependencies: "WebLLM / Wasm", owner: "R&D Lab" }
];

// --- KANBAN BOARD TASKS ---
interface TaskCard {
  id: string;
  title: string;
  desc: string;
  priority: "High" | "Medium" | "Low";
  complexity: string;
  column: "Backlog" | "Research" | "Ready" | "In Development" | "Testing" | "Completed";
}

const INITIAL_TASKS: TaskCard[] = [
  { id: "t1", title: "KaTeX Math Rendering in Whiteboard", desc: "Render step equations in KaTeX LaTeX blocks with quick symbol insertion toolbar.", priority: "High", complexity: "Medium", column: "Completed" },
  { id: "t2", title: "PWA High-DPI Startup Splash Screen", desc: "Inject iOS/Android startup splash images dynamically for standalone app launches.", priority: "High", complexity: "Low", column: "Completed" },
  { id: "t3", title: "Yoco Card Payment API Handler", desc: "Express endpoint verifying Yoco transactions and updating user subscription status.", priority: "High", complexity: "Medium", column: "Completed" },
  { id: "t4", title: "School Seat Allocation Admin UI", desc: "Interface for school principals to add/remove teacher and learner seats.", priority: "High", complexity: "High", column: "In Development" },
  { id: "t5", title: "WAEC Nigeria Question Bank Parsing", desc: "Ingest and structure West African Senior School Certificate past examination papers.", priority: "Medium", complexity: "Medium", column: "Ready" },
  { id: "t6", title: "WebGPU Gemini Nano Wasm Runtime", desc: "Investigate running lightweight quantized 2B model directly in browser memory.", priority: "Low", complexity: "Architectural", column: "Research" },
  { id: "t7", title: "AI Voice Speed & Pitch Controls", desc: "Allow students to adjust voice tutor speech rate (0.75x to 1.5x) and pitch.", priority: "Low", complexity: "Low", column: "Backlog" }
];

// --- RELEASE ROADMAP ---
const RELEASES = [
  {
    version: "v1.0 - Foundation & STEM Master",
    date: "Q1 2026",
    status: "Completed" as StatusType,
    highlights: ["CAPS & IEB Curriculum Alignment", "Feynman Whiteboard Solver", "D3.js Math Plotter", "Firebase Auth & Firestore"]
  },
  {
    version: "v1.5 - Multi-Language & Vision AI",
    date: "Q2 2026",
    status: "Completed" as StatusType,
    highlights: ["11 SA Official Language Voice Tutor", "Google Vision AI OCR Scanner", "Yoco ZAR Payments", "PWA Standalone Download"]
  },
  {
    version: "v2.0 - Institutional & Enterprise",
    date: "Q3 2026",
    status: "In Progress" as StatusType,
    highlights: ["School Base Multi-Seat Passes", "Teacher Lesson Plan Builder", "Parent Progress Tracker", "Sponsor-a-Learner Portal"]
  },
  {
    version: "v3.0 - Pan-African WAEC & KCSE",
    date: "Q4 2026",
    status: "Planned" as StatusType,
    highlights: ["WAEC (Nigeria) & KCSE (Kenya) Engines", "Multi-Agent Peer Study Groups", "Offline WebGPU LLM Engine", "Token Marketplace"]
  },
  {
    version: "v5.0 - Autonomous AI Educator & AR Labs",
    date: "2027 Roadmap",
    status: "Research" as StatusType,
    highlights: ["3D WebXR Virtual Science Labs", "Digital Twin Student Knowledge Graph", "Gemini Live Duplex Audio", "Quantum Computing Module"]
  }
];

// --- CHANGELOG ---
const CHANGELOG = [
  { date: "July 2026", version: "v2.5.0", title: "KaTeX Math Integration & Future Development Hub", items: ["Integrated KaTeX for high-performance LaTeX rendering in Whiteboard.", "Added Quick Math Symbol insertion toolbar to Whiteboard input.", "Launched Future Development & Innovation Hub.", "Configured dynamic SEO sitemap & AI crawler robots.txt."] },
  { date: "June 2026", version: "v2.2.0", title: "Yoco Payment Gateway & Sponsor-a-Learner", items: ["Integrated Yoco credit/debit card checkout modal for ZAR subscriptions.", "Added Sponsor-a-Learner portal for CSR corporate pass funding.", "Created App Development Donation endpoint."] },
  { date: "May 2026", version: "v2.0.0", title: "Spoken AI Voice Tutor & Multi-Language Hub", items: ["Added voice tutoring in 11 SA official languages.", "Implemented bilingual code-switching for indigenous languages.", "Built PWA Voice Guided onboarding installer."] }
];

export default function FutureDevelopment() {
  const [activeTab, setActiveTab] = useState<string>("roadmap");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  
  // Interactive Kanban Board State
  const [tasks, setTasks] = useState<TaskCard[]>(INITIAL_TASKS);
  
  // Interactive AI Dev Notes State
  const [userNotes, setUserNotes] = useState<{ id: string; title: string; category: string; content: string; date: string }[]>(() => {
    try {
      const saved = localStorage.getItem("pocket_school_future_notes");
      return saved ? JSON.parse(saved) : [
        { id: "note-1", title: "Offline WebGPU Inference Strategy", category: "Architecture", content: "Plan to evaluate WebLLM using quantized Q4_K_M model weights stored in IndexedDB. Will allow offline calculation when connection drops during load shedding.", date: "2026-07-27" },
        { id: "note-2", title: "WAEC Past Paper Formatting", category: "Curriculum", content: "WAEC multiple choice questions require strict diagram parsing. Need to extract image bounding boxes for geometry questions.", date: "2026-07-26" }
      ];
    } catch {
      return [];
    }
  });

  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("Architecture");
  const [newNoteContent, setNewNoteContent] = useState("");

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const note = {
      id: "note-" + Date.now(),
      title: newNoteTitle.trim(),
      category: newNoteCategory,
      content: newNoteContent.trim(),
      date: new Date().toISOString().split("T")[0]
    };

    const updated = [note, ...userNotes];
    setUserNotes(updated);
    try {
      localStorage.setItem("pocket_school_future_notes", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setNewNoteTitle("");
    setNewNoteContent("");
  };

  const handleMoveTask = (taskId: string, targetCol: TaskCard["column"]) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, column: targetCol } : t));
  };

  const filteredFeatures = UPCOMING_FEATURES.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen text-slate-100 pb-20 space-y-12">
      
      {/* HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 p-8 lg:p-12 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 opacity-10 pointer-events-none hidden lg:block">
          <Rocket className="w-80 h-80 text-amber-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest">
            <Rocket className="w-4 h-4 text-amber-400 animate-bounce" /> Innovation & Product Roadmap Hub
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white font-display leading-tight">
            Future Development & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">AI Architecture Roadmap</span>
          </h1>
          
          <p className="text-slate-300 text-sm lg:text-base leading-relaxed">
            Welcome to the central command center for Grade Master Africa innovation. This living repository details planned capabilities, AI models, curriculum expansions, architectural notes, and instructions for future AI models & software engineers building Pocket School Pro.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a href="#future-ai-rebuild" className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2">
              <Bot className="w-4 h-4" /> AI Rebuild Blueprint
            </a>
            <a href="#kanban-board" className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2">
              <Kanban className="w-4 h-4 text-amber-400" /> Dev Board
            </a>
          </div>
        </div>
      </div>

      {/* QUICK SECTION NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
        {[
          { id: "mcp-hub", label: "⚡ MCP Edu Hub", icon: Server },
          { id: "roadmap", label: "🚀 Features & Roadmap", icon: Rocket },
          { id: "ai-notes", label: "🤖 AI Dev Notes", icon: Brain },
          { id: "modules", label: "📚 Education Modules", icon: BookOpen },
          { id: "expansion", label: "🌍 International Matrix", icon: Globe },
          { id: "subscriptions", label: "💳 Pricing Roadmap", icon: CreditCard },
          { id: "ai-capabilities", label: "🧠 AI Capability Matrix", icon: Cpu },
          { id: "notes-log", label: "📝 AI Decision Log", icon: FileText },
          { id: "kanban", label: "📋 Dev Kanban Board", icon: Kanban },
          { id: "rebuild-guide", label: "🤖 AI Rebuild Guide", icon: Bot }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                isActive
                  ? "bg-amber-400/15 border border-amber-400/40 text-amber-300 shadow-md shadow-amber-500/10 font-extrabold"
                  : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TABS CONTENT WRAPPER */}
      <div className="space-y-16">

        {/* SECTION 0: MCP EDU HUB (GRADEMASTER007) */}
        {(activeTab === "mcp-hub" || activeTab === "all") && (
          <section className="space-y-6">
            <McpEduHub />
          </section>
        )}

        {/* SECTION 1: UPCOMING FEATURES & ROADMAP */}
        {(activeTab === "roadmap" || activeTab === "all") && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-amber-400" /> Upcoming Features & Core Innovations
                </h2>
                <p className="text-xs text-slate-400">Targeted capabilities categorized by status, business impact, and technical complexity.</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search features..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-400/50"
                >
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Planned">Planned</option>
                  <option value="Research">Research</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFeatures.map((feat) => (
                <div key={feat.id} className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 space-y-4 transition-all group hover:shadow-xl hover:shadow-amber-500/5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-400/80 tracking-widest">{feat.category}</span>
                      <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">{feat.name}</h3>
                    </div>
                    <StatusBadge status={feat.status} />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{feat.description}</p>

                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-2 text-[11px]">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-amber-400 shrink-0">💼 Business Value:</span>
                      <span className="text-slate-300">{feat.businessValue}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-emerald-400 shrink-0">🎓 User Benefits:</span>
                      <span className="text-slate-300">{feat.expectedBenefits}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono border-t border-slate-800/80 pt-3 text-slate-400">
                    <span>Priority: <strong className="text-slate-200">{feat.priority}</strong></span>
                    <span>Complexity: <strong className="text-amber-400">{feat.complexity}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: AI DEVELOPMENT NOTES */}
        {(activeTab === "ai-notes" || activeTab === "all") && (
          <section className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-amber-400" /> AI Development Notes & Research Specs
              </h2>
              <p className="text-xs text-slate-400">Architectural specifications for AI models, prompt templates, vision OCR pipelines, and voice tutoring systems.</p>
            </div>

            <div className="space-y-6">
              {AI_DEV_NOTES.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-black text-amber-300 flex items-center gap-2.5">
                      <Icon className="w-5 h-5 text-amber-400" /> {cat.title}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-extrabold text-white">{item.idea}</h4>
                              <StatusBadge status={item.status} />
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">{item.implementationDetails}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3 text-emerald-400" /> Expected Impact: {item.impact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 3: FUTURE EDUCATION MODULES */}
        {(activeTab === "modules" || activeTab === "all") && (
          <section className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-amber-400" /> Future Education Modules Inventory ({FUTURE_EDUCATION_MODULES.length} Planned)
              </h2>
              <p className="text-xs text-slate-400">Specialized academic, vocational, and professional subject modules scheduled for expansion.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {FUTURE_EDUCATION_MODULES.map((mod, idx) => {
                const Icon = mod.icon;
                return (
                  <div key={idx} className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 space-y-2 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{mod.domain}</span>
                    </div>

                    <h3 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">{mod.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{mod.desc}</p>
                    <span className="text-[10px] text-amber-400/80 font-mono block pt-1">Target: {mod.tier}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 4: INTERNATIONAL EXPANSION MATRIX */}
        {(activeTab === "expansion" || activeTab === "all") && (
          <section className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Globe className="w-6 h-6 text-amber-400" /> International Curriculum & Language Matrix
              </h2>
              <p className="text-xs text-slate-400">Pan-African and global examination board support roadmap.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-[10px] font-mono uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Country & Region</th>
                    <th className="p-4">Curricula Standard</th>
                    <th className="p-4">Exam Board</th>
                    <th className="p-4">Supported Languages</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {INTERNATIONAL_EXPANSION.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-white text-sm">{item.country}</td>
                      <td className="p-4 font-mono text-amber-300">{item.curricula.join(", ")}</td>
                      <td className="p-4 text-slate-300">{item.examBoard}</td>
                      <td className="p-4 text-slate-300">{item.languages}</td>
                      <td className="p-4"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SECTION 5: SUBSCRIPTION ROADMAP */}
        {(activeTab === "subscriptions" || activeTab === "all") && (
          <section className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-amber-400" /> Subscription & Financial Architecture Roadmap
              </h2>
              <p className="text-xs text-slate-400">Planned monetization models maintaining 53%+ gross profit margin across ZAR price tiers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SUBSCRIPTION_ROADMAP.map((sub, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-widest">{sub.price}</span>
                      <StatusBadge status={sub.status} />
                    </div>
                    <h3 className="text-sm font-black text-white">{sub.plan}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{sub.details}</p>
                  </div>

                  <button className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 transition-colors">
                    View Tier Spec
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 6: AI CAPABILITY MATRIX */}
        {(activeTab === "ai-capabilities" || activeTab === "all") && (
          <section className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Cpu className="w-6 h-6 text-amber-400" /> Specialized AI Persona Matrix
              </h2>
              <p className="text-xs text-slate-400">Dedicated AI agent capabilities mapped to specialized student learning needs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {AI_CAPABILITIES.map((cap, idx) => {
                const Icon = cap.icon;
                return (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-amber-500/40 transition-all">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-black text-white">{cap.name}</h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{cap.role}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 7: INTERACTIVE AI NOTES & DECISION LOG */}
        {(activeTab === "notes-log" || activeTab === "all") && (
          <section className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-amber-400" /> AI Notes & Architecture Decision Log
              </h2>
              <p className="text-xs text-slate-400">Interactive decision record where developers and future AI models record architectural insights.</p>
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add New Architecture Note / Spec
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Note Title (e.g. Gemini 1.5 Pro Token Limit Strategy)..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="md:col-span-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
                  required
                />

                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-400/50"
                >
                  <option value="Architecture">Architecture</option>
                  <option value="Curriculum">Curriculum</option>
                  <option value="AI Models">AI Models</option>
                  <option value="Security">Security</option>
                  <option value="Performance">Performance</option>
                </select>
              </div>

              <textarea
                placeholder="Write architectural details, prompt specifications, or implementation guidelines..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
                required
              />

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" /> Save Architecture Note
              </button>
            </form>

            {/* Existing Notes List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userNotes.map((note) => (
                <div key={note.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">{note.category}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{note.date}</span>
                  </div>

                  <h4 className="text-sm font-black text-white">{note.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 8: DEV KANBAN BOARD */}
        {(activeTab === "kanban" || activeTab === "all") && (
          <section id="kanban-board" className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Kanban className="w-6 h-6 text-amber-400" /> Developer Task Board (Kanban)
              </h2>
              <p className="text-xs text-slate-400">Interactive task tracking across research, active development, and completed milestones.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
              {(["Backlog", "Research", "Ready", "In Development", "Testing", "Completed"] as TaskCard["column"][]).map((col) => {
                const colTasks = tasks.filter(t => t.column === col);
                return (
                  <div key={col} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3 min-w-[220px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-black uppercase text-amber-300 tracking-wider">{col}</h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{colTasks.length}</span>
                    </div>

                    <div className="space-y-3">
                      {colTasks.map((t) => (
                        <div key={t.id} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-2 hover:border-amber-500/30 transition-all">
                          <h4 className="text-xs font-bold text-white">{t.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2">{t.desc}</p>
                          
                          <div className="flex items-center justify-between text-[9px] font-mono pt-1 text-slate-500">
                            <span>Priority: <strong className="text-amber-400">{t.priority}</strong></span>
                          </div>

                          {/* Move Actions */}
                          <div className="flex items-center gap-1 pt-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
                            {(["Backlog", "In Development", "Testing", "Completed"] as TaskCard["column"][]).filter(c => c !== col).slice(0, 2).map((targetCol) => (
                              <button
                                key={targetCol}
                                onClick={() => handleMoveTask(t.id, targetCol)}
                                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-mono text-slate-300 shrink-0"
                              >
                                → {targetCol}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 9: REBUILD INSTRUCTIONS FOR FUTURE AI BUILDERS */}
        {(activeTab === "rebuild-guide" || activeTab === "all") && (
          <section id="future-ai-rebuild" className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-8 lg:p-12 space-y-8 shadow-2xl">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-widest border border-amber-400/30">
                  <Bot className="w-4 h-4 text-amber-400" /> Critical Source of Truth
                </div>

                <h2 className="text-3xl font-black text-white font-display">
                  Rebuilding Pocket School Pro <span className="text-amber-400">From Scratch</span>
                </h2>
                
                <p className="text-xs lg:text-sm text-slate-300 leading-relaxed max-w-4xl">
                  This section provides explicit instructions for any future AI model, Gemini agent, or software engineer needing to reconstruct, expand, or migrate Pocket School Pro without asking clarifying questions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                
                {/* Rule Card 1 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> 1. Core Architecture & Stack
                  </h3>
                  <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
                    <li><strong>Frontend:</strong> React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion.</li>
                    <li><strong>Backend:</strong> Node.js, Express, ESBuild CJS bundler (<code className="text-amber-400">server.ts</code> → <code className="text-amber-400">dist/server.cjs</code>).</li>
                    <li><strong>Port & Binding:</strong> Always listen on port <code className="text-amber-400">3000</code> and host <code className="text-amber-400">0.0.0.0</code>.</li>
                  </ul>
                </div>

                {/* Rule Card 2 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-amber-400" /> 2. AI Model Selection
                  </h3>
                  <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
                    <li>Use <code className="text-amber-400">@google/genai</code> SDK.</li>
                    <li><strong>Gemini 1.5 Pro:</strong> Complex calculus, Whiteboard derivations, physics, and research synthesis.</li>
                    <li><strong>Gemini 1.5 Flash:</strong> Fast interactive chat, voice response, flashcards, OCR vision.</li>
                  </ul>
                </div>

                {/* Rule Card 3 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" /> 3. API Key & Security Rules
                  </h3>
                  <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
                    <li>Keep <code className="text-amber-400">GEMINI_API_KEY</code> and <code className="text-amber-400">YOCO_SECRET_KEY</code> server-side only in Node <code className="text-amber-400">process.env</code>.</li>
                    <li>NEVER expose secret keys to the browser. All AI calls MUST be proxied via <code className="text-amber-400">/api/ai/*</code>.</li>
                  </ul>
                </div>

                {/* Rule Card 4 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" /> 4. Unit Economics & Quotas
                  </h3>
                  <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
                    <li>Maintain 53%+ gross profit margin across tier passes (R49, R69, R99, R199 Gold VIP).</li>
                    <li>Check token balances in middleware before invoking Gemini API endpoints.</li>
                  </ul>
                </div>

                {/* Rule Card 5 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-400" /> 5. UI/UX & Design Standards
                  </h3>
                  <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
                    <li>Strict Anti-AI Slop design rules: Gold luxury dark mode & high contrast light mode.</li>
                    <li>Never use generic SaaS hero eyebrows or low-contrast text. Pass WCAG AA standards.</li>
                  </ul>
                </div>

                {/* Rule Card 6 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" /> 6. Curriculum & Multilingual Rules
                  </h3>
                  <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
                    <li>Support South African CAPS/IEB, Cambridge, IB, and Common Core.</li>
                    <li>Voice tutoring must support 11 SA languages with bilingual code-switching for STEM terms.</li>
                  </ul>
                </div>

              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
