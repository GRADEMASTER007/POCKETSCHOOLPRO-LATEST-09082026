import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Play, 
  Pause, 
  Award, 
  Check, 
  X, 
  Zap, 
  Volume2,
  Heart,
  User,
  Bot,
  Keyboard,
  Compass,
  CheckCircle2,
  ListFilter,
  CheckSquare,
  BookmarkCheck,
  ChevronRightCircle
} from "lucide-react";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { cn } from "@/src/lib/utils";

// Reusable SVG icons representing each hand sign in high fidelity
export const SignSvg: React.FC<{ signId: string; className?: string }> = ({ signId, className = "w-28 h-28" }) => {
  switch (signId) {
    case "A":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <rect x="35" y="40" width="30" height="30" rx="6" />
          <path d="M65 52 L78 52 L78 64 L65 64" />
          <path d="M35 40 L35 48 M43 40 L43 48 M51 40 L51 48 M59 40 L59 48" />
        </svg>
      );
    case "B":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <path d="M35 70 L35 25 C35 21, 41 21, 41 25 L41 70 M41 70 L41 20 C41 16, 47 16, 47 20 L47 70 M47 70 L47 22 C47 18, 53 18, 53 22 L53 70 M53 70 L53 27 C53 23, 59 23, 59 27 L59 70" />
          <path d="M35 70 C30 70, 30 30, 35 25 M59 27 C64 27, 65 55, 65 70" />
          <path d="M35 55 L50 55 L50 63" />
        </svg>
      );
    case "C":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 72 L65 72 L65 85" />
          <path d="M60 25 C35 25, 25 40, 25 55 C25 70, 40 75, 60 75" />
          <path d="M52 35 C38 35, 35 45, 35 55 C35 65, 40 65, 52 65" />
        </svg>
      );
    case "D":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <path d="M42 70 L42 20 C42 16, 48 16, 48 20 L48 50" />
          <circle cx="56" cy="58" r="12" />
          <path d="M35 55 C35 48, 42 48, 48 50" />
        </svg>
      );
    case "E":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <rect x="35" y="45" width="30" height="25" rx="5" />
          <path d="M35 45 C35 38, 45 38, 45 45 M45 45 C45 38, 55 38, 55 45 M55 45 C55 38, 65 38, 65 45" />
          <path d="M35 60 L65 60" />
        </svg>
      );
    case "F":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <circle cx="38" cy="48" r="8" />
          <path d="M46 70 L46 22 C46 18, 52 18, 52 22 L52 70 M52 70 L52 24 C52 20, 58 20, 58 24 L58 70 M58 70 L58 28 C58 24, 64 24, 64 28 L64 70" />
        </svg>
      );
    case "G":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <path d="M35 55 L55 55 C59 55, 59 47, 55 47 L35 47" />
          <path d="M35 40 L60 40 C64 40, 64 32, 60 32 L35 32" />
        </svg>
      );
    case "H":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <path d="M35 50 L75 50 C79 50, 79 42, 75 42 L35 42" />
          <path d="M35 34 L70 34 C74 34, 74 26, 70 26 L35 26" />
        </svg>
      );
    case "I":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <rect x="35" y="45" width="24" height="25" rx="4" />
          <path d="M59 45 L59 20 C59 16, 65 16, 65 20 L65 70" />
          <path d="M35 55 L48 55 L48 62" />
        </svg>
      );
  case "K":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <path d="M40 70 L40 20 C40 16, 46 16, 46 20 L46 50" />
          <path d="M46 50 L58 25 C60 21, 66 23, 64 27 L50 55" />
          <path d="M46 45 L55 45 C58 45, 58 52, 55 52 L46 52" />
        </svg>
      );
    case "M":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <rect x="35" y="40" width="30" height="30" rx="6" />
          <path d="M40 40 L40 70 M50 40 L50 70 M60 40 L60 70" />
          <path d="M30 60 L45 60" />
        </svg>
      );
    case "N":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <rect x="35" y="40" width="30" height="30" rx="6" />
          <path d="M42 40 L42 70 M58 40 L58 70" />
          <path d="M30 60 L45 60" />
        </svg>
      );
    case "O":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="25" />
          <circle cx="50" cy="50" r="12" className="fill-white" />
        </svg>
      );
    case "sorry":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <circle cx="50" cy="45" r="15" />
          <path d="M40 20 A10 10 0 0 1 60 20" strokeDasharray="2,2" />
          <path d="M50 30 L50 35" />
        </svg>
      );
    case "yes":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <rect x="35" y="40" width="30" height="30" rx="8" />
          <path d="M50 20 L50 35 M45 25 L50 20 L55 25" strokeWidth={2} />
        </svg>
      );
    case "no":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <path d="M40 70 L40 40 C40 35, 48 35, 48 40 L48 70" />
          <path d="M50 70 L50 40 C50 35, 58 35, 58 40 L58 70" />
          <path d="M35 55 L55 55" strokeWidth={3} />
        </svg>
      );
    case "L":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <path d="M35 70 L35 20 C35 16, 41 16, 41 20 L41 55" />
          <path d="M41 55 L65 55 C69 55, 69 61, 65 61 L41 61" />
          <rect x="41" y="61" width="18" height="10" rx="2" />
        </svg>
      );
    case "Y":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <path d="M35 55 L15 45 C11 43, 13 37, 17 39 L35 48" />
          <path d="M65 55 L85 45 C89 43, 91 49, 87 51 L65 62" />
          <rect x="35" y="48" width="30" height="22" rx="4" />
        </svg>
      );
    case "hello":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M30 40 L65 20 L75 30 L45 50 Z" />
          <circle cx="20" cy="55" r="12" className="fill-indigo-100" />
          <path d="M65 10 C75 12, 80 20, 82 30" strokeDasharray="3,3" />
        </svg>
      );
    case "thankyou":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M25 60 C35 50, 45 45, 65 45 C70 45, 72 52, 65 55 L35 70" />
          <path d="M55 30 L70 30 M70 30 L65 25 M70 30 L65 35" strokeWidth={2} />
        </svg>
      );
    case "iloveyou":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 70 L65 70 L65 85" />
          <path d="M35 55 L15 45 C11 43, 13 37, 17 39 L35 48" />
          <path d="M35 70 L35 20 C35 16, 41 16, 41 20 L41 55" />
          <path d="M65 55 L85 45 C89 43, 91 49, 87 51 L65 62" />
          <rect x="41" y="48" width="24" height="22" rx="4" />
          <circle cx="53" cy="58" r="4" className="fill-indigo-600" />
        </svg>
      );
    case "please":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="38" strokeDasharray="4 4" className="fill-none stroke-indigo-300" />
          <path d="M35 45 L65 40 L65 48 L35 53 Z" />
          <path d="M50 20 A20 20 0 0 1 70 40" strokeDasharray="2 2" />
        </svg>
      );
    case "help":
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-600 stroke-[2.5] fill-indigo-50/50`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 70 L80 70 L75 80 L25 80 Z" />
          <rect x="40" y="35" width="20" height="35" rx="4" />
          <path d="M40 35 L50 15 C52 11, 58 11, 60 15 L50 35" />
          <circle cx="50" cy="28" r="3" className="fill-indigo-600" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 100" className={`${className} stroke-indigo-500 stroke-[2] fill-indigo-50/30`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 65 C35 50, 45 45, 50 45 C55 45, 65 50, 65 65 L65 85 Z" />
          <circle cx="50" cy="30" r="10" className="fill-indigo-100/60" />
          <path d="M42 30 L58 30 M50 22 L50 38" />
        </svg>
      );
  }
};

const signFlashcards = [
  { id: "A", type: "letter", label: "Letter A", description: "Form a tight fist with the thumb pressed straight up along the side of the index finger.", swahili: "Fanya ngumi iliyobana huku kidole gumba kikielekezwa juu kando ya kidole cha shahada." },
  { id: "B", type: "letter", label: "Letter B", description: "Extend all four fingers flat and touch them together, with your thumb crossed in front of your palm.", swahili: "Nyoosha vidole vyote vinne vikiwa vimebana pamoja, gumba likiwa limepishana mbele ya kiganja." },
  { id: "C", type: "letter", label: "Letter C", description: "Curve your fingers and thumb to form a perfect 'C' shape, keeping palm facing sideways.", swahili: "Kunja vidole vyako vyote pamoja na gumba kutengeneza umbo sahihi la herufi 'C'." },
  { id: "D", type: "letter", label: "Letter D", description: "Point your index finger straight up. Press other three fingers' tips against your thumb to form a circle.", swahili: "Elekeza kidole chako cha shahada juu moja kwa moja. Bana vidole vingine vitatu pamoja na gumba." },
  { id: "E", type: "letter", label: "Letter E", description: "Curl all fingers tightly down onto your thumb, resembling a claw or double fold.", swahili: "Kunja vidole vyote chini kwa nguvu vikiwa vimegusa kidole gumba." },
  { id: "F", type: "letter", label: "Letter F", description: "Touch your index finger and thumb to form a circle. Extend the remaining three fingers straight up.", swahili: "Gusisha kidole chako cha shahada na gumba kuunda duara. Nyoosha vile vingine vitatu juu." },
  { id: "G", type: "letter", label: "Letter G", description: "Point your index finger and thumb horizontally to the side, spaced slightly apart like a pinch.", swahili: "Nyoosha kidole cha shahada na gumba kuelekea upande wa kulia kwa nafasi ndogo kama unavyobana kitu." },
  { id: "H", type: "letter", label: "Letter H", description: "Extend index and middle fingers together horizontally to the side. Tuck other fingers and thumb in.", swahili: "Nyoosha vidole vya shahada na vya kati pamoja kwa usawa kuelekea upande mmoja." },
  { id: "I", type: "letter", label: "Letter I", description: "Extend only your pinky finger straight up, keeping all other fingers folded down in a fist with thumb across.", swahili: "Nyoosha kidole cha mwisho (cha kando) pekee juu moja kwa moja, vingine vikiwa vimekunjwa." },
  { id: "L", type: "letter", label: "Letter L", description: "Extend index finger straight up and thumb straight out horizontally to make an 'L' shape.", swahili: "Nyoosha kidole cha shahada juu na gumba pembeni kutengeneza umbo la herufi 'L'." },
  { id: "K", type: "letter", label: "Letter K", description: "Extend index and middle fingers up in a 'V'. Place thumb between them at the base.", swahili: "Nyoosha vidole vya shahada na vya kati juu. Weka kidole gumba katikati yao kwenye shina." },
  { id: "M", type: "letter", label: "Letter M", description: "Fold three fingers over your thumb, which is tucked between the ring and pinky fingers.", swahili: "Kunja vidole vitatu juu ya gumba lako, ambalo liko kati ya kidole cha pete na cha mwisho." },
  { id: "N", type: "letter", label: "Letter N", description: "Fold two fingers (index and middle) over your thumb, which is tucked between middle and ring fingers.", swahili: "Kunja vidole viwili juu ya gumba lako, ambalo liko kati ya kidole cha kati na cha pete." },
  { id: "O", type: "letter", label: "Letter O", description: "Curve all your fingers and thumb to touch, forming an 'O' shape like a circle.", swahili: "Kunja vidole vyako vyote na gumba ili vigusane, ukitengeneza umbo la herufi 'O'." },
  { id: "Y", type: "letter", label: "Letter Y", description: "Extend only your thumb and pinky finger fully out. Keep the three middle fingers curled down flat.", swahili: "Nyoosha tu gumba na kidole cha mwisho nje kikamilifu. Vidole vitatu vya katikati vikunjwe." },
  { id: "hello", type: "phrase", label: "Hello / Jambo", description: "Place hand at forehead in a polite salute gesture, then sweep gently outward toward the recipient.", swahili: "Weka mkono wako kwenye paji la uso katika ishara ya saluti, kisha nyoosha nje kwa upole." },
  { id: "thankyou", type: "phrase", label: "Thank You / Asante", description: "Touch flat hand fingers to your lips, then move the hand downward and forward in a grateful bowing motion.", swahili: "Gusa midomo yako kwa vidole vya mkono ulionyooka, kisha ushushe mkono wako mbele kwa shukrani." },
  { id: "iloveyou", type: "phrase", label: "I Love You", description: "Combine letters I, L, and Y: Extend pinky, index, and thumb wide. Keep middle and ring fingers flat.", swahili: "Unganisha ishara za I, L, na Y: Nyoosha kidole kidogo, kidole cha shahada, na gumba." },
  { id: "please", type: "phrase", label: "Please / Tafadhali", description: "Place your flat hand open on your chest and move it in polite, soothing clockwise circular loops.", swahili: "Weka kiganja chako cha mkono wazi juu ya kifua chako na ukizungushe kwa duara kuelekea kulia." },
  { id: "help", type: "phrase", label: "Help / Saidia", description: "Form a thumbs-up fist with active hand. Place it on top of your flat open secondary hand, lifting slightly.", swahili: "Tengeneza ishara ya gumba-juu kisha uiweke juu ya mkono wako mwingine uliorambazwa wazi." },
  { id: "sorry", type: "phrase", label: "Sorry / Pole", description: "Make a fist and rub it in a circular motion over your heart.", swahili: "Fanya ngumi na uisugue kwa mwendo wa duara juu ya moyo wako." },
  { id: "yes", type: "phrase", label: "Yes / Ndiyo", description: "Form a fist and tilt it up and down like a nodding head.", swahili: "Fanya ngumi na uinamishe juu na chini kama kichwa kinachotingisha." },
  { id: "no", type: "phrase", label: "No / Hapana", description: "Snap your index and middle fingers down to touch your thumb twice.", swahili: "Bofya vidole vyako vya shahada na vya kati chini ili kugusa gumba mara mbili." }
];

const signQuizzes = [
  {
    handSequence: ["I", "L", "Y"],
    question: "The virtual tutor is signing this sequence. Which phrase does this represent?",
    options: ["I Love You (ILY)", "Ask For Help (AFH)", "Bring More Books (BMB)", "Go to Class (GTC)"],
    answer: 0,
    explanation: "Excellent! The letters I, L, and Y combine to form the universal sign 'I Love You'."
  },
  {
    handSequence: ["B", "A", "D"],
    question: "Spell check: Decode this spelled sequence into an English word:",
    options: ["CAT", "DAY", "BAD", "LID"],
    answer: 2,
    explanation: "Correct! The hand shapes spell out B - A - D."
  },
  {
    handSequence: ["L", "I", "D"],
    question: "Which word is the virtual tutor spelling here?",
    options: ["LED", "LIP", "LID", "HAD"],
    answer: 2,
    explanation: "Superb! The fingers spell L - I - D."
  },
  {
    handSequence: ["C", "A", "B"],
    question: "Translate this visual sequence into English:",
    options: ["CAB", "BAD", "FLY", "BAG"],
    answer: 0,
    explanation: "Spot on! The hand signs represent C - A - B, representing a cab or vehicle."
  }
];

export default function SignLanguageCenter({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<"library" | "flashcards" | "speller" | "quiz">("library");
  const [filterType, setFilterType] = useState<"all" | "letter" | "phrase">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<string[]>([]);
  
  // Custom word speller states
  const [spellerInput, setSpellerInput] = useState("");
  const [isSpelling, setIsSpelling] = useState(false);
  const [currentSpellingChar, setCurrentSpellingChar] = useState<string | null>(null);
  const [spellingIndex, setSpellingIndex] = useState(0);
  const [spellerSpeed, setSpellerSpeed] = useState<number>(1000); // ms per letter
  
  // Quiz states
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [points, setPoints] = useState(0);

  // Load mastered state and user points from local storage or Firestore on mount
  useEffect(() => {
    const savedMastered = localStorage.getItem("grademaster_mastered_signs");
    if (savedMastered) {
      try {
        setMasteredCards(JSON.parse(savedMastered));
      } catch (e) {
        console.error(e);
      }
    }
    
    // Sync points
    const syncUserPoints = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setPoints(userDoc.data().points || 0);
        }
      }
    };
    syncUserPoints();
  }, []);

  const saveMasteredCards = (updated: string[]) => {
    setMasteredCards(updated);
    localStorage.setItem("grademaster_mastered_signs", JSON.stringify(updated));
  };

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (masteredCards.includes(id)) {
      updated = masteredCards.filter((item) => item !== id);
    } else {
      updated = [...masteredCards, id];
      // Play a quick subtle correct tone for marking mastered
      playAudioTone("correct");
    }
    saveMasteredCards(updated);
  };

  // Play audio tones using standard Web Audio API
  const playAudioTone = (type: "correct" | "incorrect") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === "correct") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else {
        osc.frequency.setValueAtTime(220.00, ctx.currentTime); // A3
        osc.frequency.setValueAtTime(196.00, ctx.currentTime + 0.15); // G3
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.log("Audio contexts blocked or not supported:", e);
    }
  };

  const speakPhrase = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Filter cards
  const filteredCards = signFlashcards.filter((card) => {
    if (filterType === "all") return true;
    return card.type === filterType;
  });

  const activeCard = filteredCards[cardIndex] || filteredCards[0] || signFlashcards[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev + 1) % filteredCards.length);
    }, 150);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }, 150);
  };

  // Speller loop animation
  useEffect(() => {
    let timer: any;
    if (isSpelling && spellerInput.length > 0) {
      const cleanInput = spellerInput.toUpperCase().replace(/[^A-I LY]/g, "");
      if (spellingIndex < cleanInput.length) {
        const char = cleanInput[spellingIndex];
        if (char === " ") {
          setCurrentSpellingChar("SPACE");
        } else {
          setCurrentSpellingChar(char);
        }
        timer = setTimeout(() => {
          setSpellingIndex((prev) => prev + 1);
        }, spellerSpeed);
      } else {
        setIsSpelling(false);
        setCurrentSpellingChar(null);
        setSpellingIndex(0);
      }
    }
    return () => clearTimeout(timer);
  }, [isSpelling, spellingIndex, spellerInput, spellerSpeed]);

  const startSpelling = () => {
    if (!spellerInput.trim()) return;
    setIsSpelling(true);
    setSpellingIndex(0);
    setCurrentSpellingChar(null);
  };

  // Quiz submission handler
  const handleQuizSubmit = async (optionIdx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optionIdx);
    setIsAnswerSubmitted(true);

    const isCorrect = optionIdx === signQuizzes[quizIndex].answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      playAudioTone("correct");
      
      // Update Firebase Firestore points if auth user is logged in
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            points: increment(15),
          });
          setPoints((prev) => prev + 15);
        } catch (e) {
          console.error("Failed to sync points:", e);
        }
      }
    } else {
      playAudioTone("incorrect");
    }
  };

  const nextQuizQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    if (quizIndex + 1 < signQuizzes.length) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setShowResult(false);
  };

  // Quiz auto-animation loops
  const [activeQuizLetter, setActiveQuizLetter] = useState<string>("");
  const [quizLetterIdx, setQuizLetterIdx] = useState(0);

  useEffect(() => {
    if (activeTab === "quiz" && !showResult && !isAnswerSubmitted) {
      const currentSequence = signQuizzes[quizIndex]?.handSequence || [];
      const interval = setInterval(() => {
        if (currentSequence.length > 0) {
          setActiveQuizLetter(currentSequence[quizLetterIdx]);
          setQuizLetterIdx((prev) => (prev + 1) % currentSequence.length);
        }
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [activeTab, quizIndex, quizLetterIdx, showResult, isAnswerSubmitted]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12" id="sign-language-center-container">
      
      {/* High-Fidelity Header */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-2xl transition-all cursor-pointer flex items-center justify-center"
              title="Return to Menu"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Grade Master <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-black uppercase">Sign Language Studio</span>
            </h1>
            <p className="text-gray-500 text-xs">Learn standard hand signs, spell custom phrases with animated feedback, and test your skills in the decoder quiz arena.</p>
          </div>
        </div>

        {/* Dynamic XP counter */}
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 rounded-2xl border border-indigo-100/40">
          <Zap className="w-4.5 h-4.5 text-indigo-600 fill-indigo-600/10" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Aristotle points</span>
            <span className="text-xs font-black text-indigo-950">{points} XP</span>
          </div>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 max-w-lg shadow-sm">
        <button
          onClick={() => { setActiveTab("library"); setIsFlipped(false); }}
          className={cn(
            "flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5",
            activeTab === "library" ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:text-gray-800"
          )}
        >
          <Compass className="w-4 h-4" /> Learn
        </button>
        <button
          onClick={() => { setActiveTab("flashcards"); setIsFlipped(false); }}
          className={cn(
            "flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5",
            activeTab === "flashcards" ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:text-gray-800"
          )}
        >
          <BookOpen className="w-4 h-4" /> Cards
        </button>
        <button
          onClick={() => { setActiveTab("speller"); setIsSpelling(false); setCurrentSpellingChar(null); }}
          className={cn(
            "flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5",
            activeTab === "speller" ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:text-gray-800"
          )}
        >
          <Keyboard className="w-4 h-4" /> Speller
        </button>
        <button
          onClick={() => { setActiveTab("quiz"); restartQuiz(); }}
          className={cn(
            "flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5",
            activeTab === "quiz" ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:text-gray-800"
          )}
        >
          <Award className="w-4 h-4" /> Quiz
        </button>
      </div>

      {/* Main View Area */}
      <AnimatePresence mode="wait">
        
        {/* VIEW 0: SIGN LIBRARY GRID */}
        {activeTab === "library" && (
          <motion.div
            key="library-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
               <div className="relative w-full md:max-w-xs">
                 <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                  type="text" 
                  placeholder="Search signs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                 />
               </div>
               <div className="flex gap-2">
                 {["all", "letter", "phrase"].map((type) => (
                   <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      filterType === type ? "bg-indigo-600 text-white border-transparent" : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                    )}
                   >
                     {type}
                   </button>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {signFlashcards
                .filter(card => (filterType === "all" || card.type === filterType) && (card.label.toLowerCase().includes(searchQuery.toLowerCase()) || card.description.toLowerCase().includes(searchQuery.toLowerCase())))
                .map((card) => (
                  <motion.div
                    key={card.id}
                    layout
                    className="bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col items-center gap-4 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                  >
                    <div className="w-full aspect-square bg-indigo-50/30 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all">
                      <SignSvg signId={card.id} className="w-32 h-32 text-indigo-600 drop-shadow-sm" />
                    </div>
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="text-xl font-black text-gray-900">{card.label}</h3>
                        <button onClick={() => speakPhrase(card.description)} className="p-1.5 hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded-lg transition-all"><Volume2 className="w-4 h-4" /></button>
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                        {card.description}
                      </p>
                      <div className="pt-2 border-t border-gray-50">
                        <p className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">{card.type}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* VIEW 1: FLASHCARDS SYSTEM */}
        {activeTab === "flashcards" && (
          <motion.div
            key="flashcards-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Left side: Navigation / Filters */}
            <div className="md:col-span-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">Filter Hand Signs</h3>
              </div>

              <div className="flex flex-col gap-1.5">
                {[
                  { id: "all", label: "All signs", count: signFlashcards.length },
                  { id: "letter", label: "Alphabet", count: signFlashcards.filter(c => c.type === "letter").length },
                  { id: "phrase", label: "Common phrases", count: signFlashcards.filter(c => c.type === "phrase").length }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setFilterType(type.id as any);
                      setCardIndex(0);
                      setIsFlipped(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border text-left text-xs font-bold uppercase tracking-wider flex justify-between items-center transition-all cursor-pointer",
                      filterType === type.id
                        ? "bg-indigo-50 border-indigo-150 text-indigo-800 shadow-sm"
                        : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    )}
                  >
                    <span>{type.label}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full font-black">
                      {type.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Mastered Progress Indicator */}
              <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/40 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-indigo-900">
                  <span>Deck Progress</span>
                  <span>{masteredCards.length} / {signFlashcards.length} Mastered</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-500" 
                    style={{ width: `${(masteredCards.length / signFlashcards.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right side: Dynamic Interactive Flashcard */}
            <div className="md:col-span-8 flex flex-col space-y-4">
              
              {/* The interactive flippable card card */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-80 bg-white rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between p-6 cursor-pointer group hover:border-indigo-200 transition-all"
                id="interactive-flashcard-box"
              >
                {/* Header indicators */}
                <div className="flex justify-between items-center z-10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {activeCard.type}
                  </span>
                  
                  {/* Mark as mastered toggle */}
                  <button
                    onClick={(e) => toggleMastered(activeCard.id, e)}
                    className={cn(
                      "p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center",
                      masteredCards.includes(activeCard.id)
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                        : "bg-gray-50 border-gray-150 text-gray-400 hover:text-gray-700"
                    )}
                    title="Mark this sign as mastered"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Content with Flipping effect */}
                <div className="flex-1 flex flex-col items-center justify-center text-center relative py-4">
                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      <motion.div
                        key="card-front"
                        initial={{ opacity: 0, rotateY: -90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: 90 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center space-y-4"
                      >
                        <SignSvg signId={activeCard.id} className="w-32 h-32 text-indigo-600 drop-shadow-sm" />
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{activeCard.label}</h2>
                        <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                          <RotateCw className="w-3 h-3 text-indigo-500" /> Tap anywhere to flip card
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="card-back"
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: -90 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center space-y-4 px-4"
                      >
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">English Formation</span>
                            <p className="text-xs text-gray-700 leading-relaxed font-bold">{activeCard.description}</p>
                          </div>
                          
                          <div className="space-y-1 pt-1.5 border-t border-gray-50">
                            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Swahili / Kiswahili</span>
                            <p className="text-xs text-gray-500 leading-relaxed italic">{activeCard.swahili}</p>
                          </div>
                        </div>

                        {/* Speech trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakPhrase(activeCard.description);
                          }}
                          className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-150 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all mt-2 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-indigo-600" /> Listen Voice Guide
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Progress dot list */}
                <div className="flex justify-center items-center gap-1 z-10">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mr-2">
                    {cardIndex + 1} of {filteredCards.length}
                  </span>
                </div>
              </div>

              {/* Prev / Next controls */}
              <div className="flex gap-4">
                <button
                  onClick={handlePrevCard}
                  className="flex-1 py-3.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev Sign
                </button>
                <button
                  onClick={handleNextCard}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 cursor-pointer"
                >
                  Next Sign <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* VIEW 2: KEYBOARD ANIMATED SPELLER */}
        {activeTab === "speller" && (
          <motion.div
            key="speller-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Left selector */}
            <div className="md:col-span-5 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-gray-900">Sign Sequence Player</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Custom Text Speller</label>
                <input
                  type="text"
                  placeholder="Type e.g. CAB, LADY, BAD, FAIL"
                  value={spellerInput}
                  onChange={(e) => setSpellerInput(e.target.value)}
                  disabled={isSpelling}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold uppercase placeholder:normal-case focus:outline-none focus:border-indigo-500"
                  maxLength={16}
                />
                <p className="text-[10px] text-gray-400">
                  Supported spelling characters: <span className="font-bold text-indigo-600">A, B, C, D, E, F, G, H, I, L, Y</span>
                </p>
              </div>

              {/* Speed dial bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <span>Playback delay</span>
                  <span>{spellerSpeed / 1000}s per sign</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="2000"
                  step="200"
                  value={spellerSpeed}
                  onChange={(e) => setSpellerSpeed(Number(e.target.value))}
                  disabled={isSpelling}
                  className="w-full accent-indigo-600 bg-gray-100 rounded-lg cursor-pointer h-2"
                />
              </div>

              <button
                onClick={startSpelling}
                disabled={isSpelling || !spellerInput.trim()}
                className={cn(
                  "w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer",
                  isSpelling 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
                )}
              >
                {isSpelling ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" /> Spelling sequence...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Play sequence
                  </>
                )}
              </button>
            </div>

            {/* Right Display Board */}
            <div className="md:col-span-7 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between min-h-[22rem]">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Animated Hand Tutor
                  </span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    ASL System Standard
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center py-6">
                  {currentSpellingChar ? (
                    <motion.div
                      key={currentSpellingChar}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center space-y-4"
                    >
                      <div className="p-8 bg-indigo-50/25 border border-indigo-100/40 rounded-[2.5rem] shadow-inner">
                        {currentSpellingChar === "SPACE" ? (
                          <div className="w-32 h-32 flex items-center justify-center font-extrabold text-sm text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                            SPACEBAR
                          </div>
                        ) : (
                          <SignSvg signId={currentSpellingChar} className="w-32 h-32 text-indigo-600 animate-pulse" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Active char:</span>
                        <span className="text-3xl font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-2xl">
                          {currentSpellingChar}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
                      <Compass className="w-12 h-12 text-gray-200" />
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">Visual sequence screen</h4>
                      <p className="text-[10px] text-gray-400 max-w-[16rem]">Enter characters on the left panel (e.g. "BAD" or "LID") and tap Play sequence to begin tutoring.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress string render */}
              {isSpelling && (
                <div className="flex justify-center gap-1 bg-gray-50 border border-gray-150 p-3 rounded-2xl overflow-x-auto">
                  {spellerInput.toUpperCase().split("").map((c, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "w-6 h-6 flex items-center justify-center font-black text-[10px] rounded-md border transition-all",
                        idx === spellingIndex
                          ? "bg-indigo-600 border-indigo-600 text-white scale-110"
                          : idx < spellingIndex
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                          : "bg-white border-gray-150 text-gray-400"
                      )}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-50 pt-4 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest text-center mt-4">
                🖐️ Playback delays can be adjusted dynamically during active tutoring loops
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: PRACTICE DECODER QUIZ */}
        {activeTab === "quiz" && (
          <motion.div
            key="quiz-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-3xl mx-auto"
          >
            {!showResult ? (
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                
                {/* Score / Question header indicator */}
                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Question {quizIndex + 1} of {signQuizzes.length}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-black uppercase">Current Score:</span>
                    <span className="text-xs font-black text-emerald-600">{score} Correct</span>
                  </div>
                </div>

                {/* Simulated Signing Loop Screen */}
                <div className="p-8 bg-gray-50 border border-gray-150 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active tutoring spell board</span>
                  
                  <div className="p-4 bg-white border border-gray-200/60 rounded-[2rem] shadow-sm">
                    {activeQuizLetter ? (
                      <SignSvg signId={activeQuizLetter} className="w-36 h-36 text-indigo-600" />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center font-black text-xs text-gray-300">
                        LOADING...
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-indigo-600 font-black uppercase tracking-wider animate-pulse flex items-center gap-1 justify-center">
                      <RotateCw className="w-3 h-3 text-indigo-500 animate-spin" /> Spelling looping sequence
                    </span>
                    <p className="text-[10px] text-gray-400 max-w-sm">Watch the tutor loop through each sign sequence above to decode the full word.</p>
                  </div>
                </div>

                {/* Question */}
                <h3 className="text-base font-black text-slate-900 leading-relaxed">
                  {signQuizzes[quizIndex].question}
                </h3>

                {/* Options list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {signQuizzes[quizIndex].options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectAnswer = idx === signQuizzes[quizIndex].answer;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuizSubmit(idx)}
                        disabled={isAnswerSubmitted}
                        className={cn(
                          "w-full p-4 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer flex justify-between items-center",
                          !isAnswerSubmitted 
                            ? "bg-gray-50 hover:bg-indigo-50/20 border-gray-100 text-gray-700 hover:border-indigo-100/60" 
                            : isSelected && isCorrectAnswer 
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
                            : isSelected && !isCorrectAnswer 
                            ? "bg-rose-50 border-rose-300 text-rose-800" 
                            : isCorrectAnswer 
                            ? "bg-emerald-50/50 border-emerald-200 text-emerald-700" 
                            : "bg-gray-50 border-gray-100 text-gray-400 opacity-60"
                        )}
                      >
                        <span>{option}</span>
                        {isAnswerSubmitted && isCorrectAnswer && (
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrectAnswer && (
                          <X className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation text */}
                {isAnswerSubmitted && (
                  <div className="p-4 bg-indigo-50/45 border border-indigo-100/40 rounded-2xl space-y-1.5 animate-fadeIn">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-900">Explanation</h4>
                    <p className="text-xs text-indigo-950 leading-relaxed">{signQuizzes[quizIndex].explanation}</p>
                    
                    <button
                      onClick={nextQuizQuestion}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-50 flex items-center justify-center gap-1 cursor-pointer mt-3"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl">
                  🏆
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">Quiz Completed!</h2>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed mx-auto">
                    You scored <span className="font-extrabold text-emerald-600">{score} out of {signQuizzes.length}</span> correct answers! You've earned additional points for your hard work.
                  </p>
                </div>

                {/* Score stats block */}
                <div className="bg-slate-50/80 border border-slate-150/40 rounded-2xl p-4 w-full max-w-sm grid grid-cols-2 gap-4">
                  <div className="text-center p-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Correct Rate</span>
                    <span className="text-lg font-black text-slate-900">
                      {Math.round((score / signQuizzes.length) * 100)}%
                    </span>
                  </div>
                  <div className="text-center p-2 border-l border-slate-150/40">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">XP Gained</span>
                    <span className="text-lg font-black text-emerald-600">+{score * 15} XP</span>
                  </div>
                </div>

                <div className="flex gap-4 w-full max-w-sm">
                  <button
                    onClick={restartQuiz}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setActiveTab("flashcards")}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Finish Session
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
