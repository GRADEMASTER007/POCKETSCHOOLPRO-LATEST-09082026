import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Award, 
  Zap, 
  Flame, 
  Check, 
  X, 
  RefreshCw, 
  Sparkles,
  ArrowRight,
  Languages,
  SpellCheck,
  GraduationCap,
  BrainCircuit,
  Send,
  Loader2,
  Trash2
} from "lucide-react";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import SignLanguageCenter from "@/src/components/centers/SignLanguageCenter";
import { languagesList } from "@/src/data/subjects";
import { cn } from "@/src/lib/utils";
import QuizEngine from "@/src/components/study/QuizEngine";
import FlashcardEngine from "@/src/components/study/FlashcardEngine";

// Flashcards data Swahili example
const flashcardsData = {
  present: [
    { id: "pr1", english: "The sun shines over Mount Kilimanjaro.", swahili: "Jua linawaka juu ya Mlima Kilimanjaro.", tense: "Present Simple" },
    { id: "pr2", english: "We build virtual circuits in the STEM hub.", swahili: "Tunajenga saketi za mtandaoni katika kitovu cha STEM.", tense: "Present Simple" },
    { id: "pr3", english: "She speaks Zulu with her grandmother.", swahili: "Anazungumza Kixhosa na nyanya yake.", tense: "Present Simple" },
    { id: "pr4", english: "They study soil fertility at Makerere.", swahili: "Wanasoma rutuba ya udongo kule Makerere.", tense: "Present Continuous" },
    { id: "pr5", english: "He writes poetry in Amharic.", swahili: "Anaandika mashairi kwa Kiamhari.", tense: "Present Simple" },
  ],
  past: [
    { id: "pa1", english: "The sun shone over Mount Kilimanjaro yesterday.", swahili: "Jua liliwaka juu ya Mlima Kilimanjaro jana.", tense: "Past Simple" },
    { id: "pa2", english: "We built virtual circuits in the STEM hub last week.", swahili: "Tulijenga saketi za mtandaoni katika kitovu cha STEM wiki iliyopita.", tense: "Past Simple" },
    { id: "pa3", english: "She spoke Zulu with her grandmother this morning.", swahili: "Alizungumza Kixhosa na nyanya yake asubuhi ya leo.", tense: "Past Simple" },
    { id: "pa4", english: "They studied soil fertility at Makerere last year.", swahili: "Walisoma rutuba ya udongo kule Makerere mwaka jana.", tense: "Past Simple" },
    { id: "pa5", english: "He wrote poetry in Amharic during school.", swahili: "Aliandika mashairi kwa Kiamhari wakati wa shule.", tense: "Past Simple" },
  ],
  irregular: [
    { id: "ir1", english: "Go -> Went (We went to Nairobi last Sunday)", swahili: "Kwenda -> Tulienda Nairobi Jumapili iliyopita", tense: "Irregular Past" },
    { id: "ir2", english: "Bring -> Brought (He brought his textbooks to class)", swahili: "Kuleta -> Alileta vitabu vyake darasani", tense: "Irregular Past" },
    { id: "ir3", english: "Teach -> Taught (The tutor taught us past tense rules)", swahili: "Kufundisha -> Mwalimu alitufundisha sheria za wakati uliopita", tense: "Irregular Past" },
    { id: "ir4", english: "Understand -> Understood (I understood the science lecture)", swahili: "Kuelewa -> Nilielewa mhadhara wa sayansi", tense: "Irregular Past" },
    { id: "ir5", english: "Take -> Took (She took her laptop to the study room)", swahili: "Kuchukua -> Alichukua kompyuta yake mpakato kwenye chumba cha masomo", tense: "Irregular Past" },
  ]
};

// Quizzes data
const quizzesData = [
  {
    category: "Present Tense",
    title: "Present Tense Arena",
    description: "Master daily habits, general facts, and ongoing educational tasks.",
    questions: [
      {
        question: "They _______ university in Nairobi every year to study engineering.",
        options: ["attend", "attends", "attended", "attending"],
        answer: 0,
        explanation: "Use 'attend' (base form) with plural subjects like 'They' in the present tense."
      },
      {
        question: "She _______ soil science and agriculture at Makerere University.",
        options: ["studies", "studying", "study", "studied"],
        answer: 0,
        explanation: "For singular third-person subjects ('She'), change 'y' to 'ies' for the verb 'study'."
      },
      {
        question: "Water _______ at 100 degrees Celsius under standard pressure.",
        options: ["boils", "boil", "boiled", "boiling"],
        answer: 0,
        explanation: "Scientific facts use Present Simple singular: 'boils'."
      },
      {
        question: "We _______ virtual circuits during our weekly STEM playground sessions.",
        options: ["creates", "create", "created", "creating"],
        answer: 1,
        explanation: "Plural subject 'We' takes the base verb 'create' in present tense."
      },
      {
        question: "He _______ Amharic and Swahili fluently to communicate with peers.",
        options: ["speak", "speaks", "spoke", "speaking"],
        answer: 1,
        explanation: "Singular third-person 'He' requires adding 's' to the verb: 'speaks'."
      }
    ]
  },
  {
    category: "Past Tense",
    title: "Past Tense Academy",
    description: "Learn to describe historical events, finished studies, and yesterday's routines.",
    questions: [
      {
        question: "Yesterday, the STEM group _______ a virtual chemistry experiment.",
        options: ["conduct", "conducted", "conducts", "conducting"],
        answer: 1,
        explanation: "The marker 'Yesterday' requires the regular past tense verb ending in '-ed' ('conducted')."
      },
      {
        question: "Nelson Mandela _______ the president of South Africa in 1994.",
        options: ["become", "became", "becomes", "becoming"],
        answer: 1,
        explanation: "'Became' is the irregular past tense of the verb 'become'."
      },
      {
        question: "In high school, they _______ a research thesis on solar power generation.",
        options: ["wrote", "write", "writed", "writing"],
        answer: 0,
        explanation: "The past tense of the irregular verb 'write' is 'wrote'."
      },
      {
        question: "Last night, I _______ about Wangari Maathai's Green Belt Movement.",
        options: ["readed", "reads", "read", "road"],
        answer: 2,
        explanation: "The past tense of 'read' is spelled exactly the same ('read') but pronounced differently."
      },
      {
        question: "The historical kingdom of Benin _______ beautiful bronze sculptures.",
        options: ["produces", "produced", "produce", "producing"],
        answer: 1,
        explanation: "Benin is an ancient historical kingdom, so we use the past tense 'produced'."
      }
    ]
  }
];

export default function LanguageHub() {
  const [mode, setMode] = useState<"menu" | "flashcard" | "quiz" | "sign" | "selector" | "translator" | "grammar" | "lessons" | "topic_master">("menu");
  const [selectedLanguage, setSelectedLanguage] = useState("Swahili (Kiswahili)");
  const [selectedCategory, setSelectedCategory] = useState<"present" | "past" | "irregular">("present");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Translator state
  const [translateText, setTranslateText] = useState("");
  const [translationResult, setTranslationResult] = useState<{ translation: string, phonetic: string, context: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Grammar state
  const [grammarText, setGrammarText] = useState("");
  const [grammarResult, setGrammarResult] = useState<{ correctedText: string, explanations: string[], score: number } | null>(null);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);

  // Lessons state
  const [lessonLevel, setLessonLevel] = useState("Beginner");
  const [lessonResult, setLessonResult] = useState<any>(null);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);

  // Topic Master state
  const [searchTopic, setSearchTopic] = useState("");
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<any>(null);
  const [isGeneratingStudy, setIsGeneratingStudy] = useState(false);
  const [topicMode, setTopicMode] = useState<"quiz" | "flashcard">("quiz");
  
  // Quiz state
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  
  // Gamification stats from DB
  const [userXp, setUserXp] = useState(0);
  const [userStreak, setUserStreak] = useState(0);

  // Load User Stats on load
  useEffect(() => {
    const fetchStats = async () => {
      if (!auth.currentUser) return;
      try {
        const statsRef = doc(db, "user_stats", auth.currentUser.uid);
        const snap = await getDoc(statsRef);
        if (snap.exists()) {
          const data = snap.data();
          setUserXp(data.xp || 0);
          setUserStreak(data.streak || 0);
        }
      } catch (err) {
        console.warn("Failed to fetch stats (might be offline):", err);
      }
    };
    fetchStats();
  }, []);

  const playTone = (type: "correct" | "incorrect") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === "correct") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(147, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch (e) { console.log("Audio API blocked or not supported:", e); }
  };

  const handleSpeech = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    try {
      const saved = localStorage.getItem("accessibility");
      if (saved) {
        const { ttsSpeed } = JSON.parse(saved);
        utterance.rate = ttsSpeed || 1.0;
      }
    } catch (e) { utterance.rate = 1.0; }
    window.speechSynthesis.speak(utterance);
  };

  const handleNextFlashcard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setFlashcardIndex((prev) => (prev + 1) % flashcardsData[selectedCategory].length);
    }, 200);
  };

  const handlePrevFlashcard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setFlashcardIndex((prev) => (prev - 1 + flashcardsData[selectedCategory].length) % flashcardsData[selectedCategory].length);
    }, 200);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === quizzesData[activeQuizIndex].questions[currentQuestionIndex].answer;
    if (isCorrect) { setScore((prev) => prev + 1); playTone("correct"); } else { playTone("incorrect"); }
  };

  const handleNextQuestion = () => {
    const quiz = quizzesData[activeQuizIndex];
    if (currentQuestionIndex + 1 < quiz.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else { handleQuizCompletion(); }
  };

  const handleQuizCompletion = async () => {
    setShowQuizResult(true);
    if (!auth.currentUser) return;
    try {
      const statsRef = doc(db, "user_stats", auth.currentUser.uid);
      const snap = await getDoc(statsRef);
      const xpToEarn = score * 10 + 20;
      if (snap.exists()) {
        await updateDoc(statsRef, { xp: increment(xpToEarn), streak: increment(1) });
        setUserXp((prev) => prev + xpToEarn);
        setUserStreak((prev) => prev + 1);
      } else {
        await setDoc(statsRef, { userId: auth.currentUser.uid, xp: xpToEarn, streak: 1, badges: ["Language Pioneer"] });
        setUserXp(xpToEarn);
        setUserStreak(1);
      }
    } catch (e) { console.warn("Failed to update user stats:", e); }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setShowQuizResult(false);
  };

  const handleTranslate = async () => {
    if (!translateText.trim()) return;
    setIsTranslating(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/language/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ text: translateText, targetLanguage: selectedLanguage })
      });
      const data = await res.json();
      setTranslationResult(data);
    } catch (err) { console.error(err); } finally { setIsTranslating(false); }
  };

  const handleCheckGrammar = async () => {
    if (!grammarText.trim()) return;
    setIsCheckingGrammar(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/language/check-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ text: grammarText })
      });
      const data = await res.json();
      setGrammarResult(data);
    } catch (err) { console.error(err); } finally { setIsCheckingGrammar(false); }
  };

  const handleGenerateLesson = async () => {
    setIsGeneratingLesson(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/language/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ language: selectedLanguage, level: lessonLevel })
      });
      const data = await res.json();
      setLessonResult(data);
    } catch (err) { console.error(err); } finally { setIsGeneratingLesson(false); }
  };

  const handleGenerateStudy = async () => {
    if (!searchTopic.trim()) return;
    setIsGeneratingStudy(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const endpoint = topicMode === "quiz" ? "/api/study/generate-quiz" : "/api/study/generate-flashcards";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ topic: searchTopic })
      });
      const data = await res.json();
      if (topicMode === "quiz") {
        setGeneratedQuiz(data.questions);
      } else {
        setGeneratedFlashcards(data.flashcards.map((f: any, i: number) => ({ id: i, front: f.front, back: f.back })));
      }
    } catch (err) { console.error(err); } finally { setIsGeneratingStudy(false); }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Language Master <span className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold uppercase tracking-wider">Africa Edition</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered translation, grammar, and interactive lessons.</p>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-1.5" title="XP Points">
            <Zap className="w-5 h-5 text-yellow-500 fill-current" />
            <span className="font-bold text-sm text-gray-700">{userXp} XP</span>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-1.5" title="Daily Streak">
            <Flame className="w-5 h-5 text-orange-500 fill-current" />
            <span className="font-bold text-sm text-gray-700">{userStreak} Days</span>
          </div>
        </div>
      </div>

      {mode === "menu" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 bg-gradient-to-r from-emerald-500 to-green-600 p-8 rounded-[2.5rem] text-white shadow-lg flex items-center gap-8 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-4">
              <Sparkles className="w-48 h-48 rotate-12" />
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white flex-shrink-0 text-3xl font-bold">🦉</div>
            <div className="flex-1 space-y-2">
              <h3 className="font-display font-black text-2xl">Karibu! I am Aristotle Owl.</h3>
              <p className="text-sm opacity-90 leading-relaxed max-w-2xl font-medium">Master any of the 40+ languages across the African continent. Currently studying: <span className="font-black bg-white/20 px-3 py-1 rounded-full">{selectedLanguage}</span></p>
              <button onClick={() => setMode("selector")} className="mt-4 px-6 py-2.5 bg-white text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10">Change Language</button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all"><Languages className="w-6 h-6" /></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Smart Translator</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">Translate any text into your selected African language with phonetic guidance and cultural context.</p>
            </div>
            <button onClick={() => setMode("translator")} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition-all text-xs uppercase">Open Translator <ArrowRight className="w-4 h-4" /></button>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-all">
            <div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all"><SpellCheck className="w-6 h-6" /></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Grammar & Spelling</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">Refine your writing with AI-powered corrections, detailed explanations, and readability scoring.</p>
            </div>
            <button onClick={() => setMode("grammar")} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 transition-all text-xs uppercase">Check Grammar <ArrowRight className="w-4 h-4" /></button>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-purple-200 transition-all">
            <div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all"><GraduationCap className="w-6 h-6" /></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">AI Taught Lessons</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">Generate custom language lessons, vocabulary drills, and grammar exercises on demand.</p>
            </div>
            <button onClick={() => setMode("lessons")} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-purple-700 transition-all text-xs uppercase">Start Lesson <ArrowRight className="w-4 h-4" /></button>
          </div>

          <div className="md:col-span-3 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col md:flex-row items-center gap-8 group hover:bg-slate-800 transition-all">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white flex-shrink-0 text-3xl font-bold group-hover:rotate-12 transition-all"><BrainCircuit className="w-8 h-8 text-amber-400" /></div>
            <div className="flex-1 space-y-2">
              <h3 className="font-display font-black text-2xl">Topic Master AI</h3>
              <p className="text-sm opacity-90 leading-relaxed max-w-2xl font-medium">Generate flashcards or quizzes for <strong>any academic topic</strong> instantly. Just type your topic and let the AI build your study deck.</p>
            </div>
            <button onClick={() => setMode("topic_master")} className="px-8 py-4 bg-amber-500 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-amber-500/20">Generate Study Deck</button>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all"><BookOpen className="w-6 h-6" /></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Legacy Flashcards</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">Flip cards to compare present and past tense sentences. Touch voice to hear pronunciation.</p>
            </div>
            <button onClick={() => setMode("flashcard")} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition-all text-xs uppercase">Start Deck <ArrowRight className="w-4 h-4" /></button>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-all">
            <div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">🖐️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Sign Language</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">Learn letters, greetings, and common words in American & South African Sign Language.</p>
            </div>
            <button onClick={() => setMode("sign")} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-indigo-700 transition-all text-xs uppercase">Open Studio <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {mode === "translator" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <button onClick={() => setMode("menu")} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900"><ChevronLeft className="w-4 h-4" /> Back</button>
            <div className="text-xs font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">Smart Translator</div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <textarea value={translateText} onChange={(e) => setTranslateText(e.target.value)} placeholder="Type text to translate..." className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none" />
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">EN</div><ArrowRight className="w-4 h-4 text-blue-400" /><div className="w-8 h-8 bg-white text-blue-600 border border-blue-200 rounded-lg flex items-center justify-center font-bold text-[10px] text-center px-1 leading-tight">{selectedLanguage.substring(0, 3).toUpperCase()}</div></div>
              <button onClick={handleTranslate} disabled={isTranslating || !translateText.trim()} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2">
                {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />} Translate
              </button>
            </div>
            {translationResult && (
              <div className="p-6 bg-slate-900 text-white rounded-[2rem] space-y-4 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center border-b border-white/10 pb-4"><span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Translation to {selectedLanguage}</span><button onClick={() => handleSpeech(translationResult.translation)} className="p-2 hover:bg-white/10 rounded-lg transition-all text-blue-300"><Volume2 className="w-4 h-4" /></button></div>
                <p className="text-2xl font-bold">{translationResult.translation}</p>
                {translationResult.phonetic && <p className="text-sm text-slate-400 font-medium italic">Pronunciation: {translationResult.phonetic}</p>}
                {translationResult.context && <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed"><Sparkles className="w-4 h-4 text-amber-400 inline mr-2" />{translationResult.context}</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {mode === "grammar" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <button onClick={() => setMode("menu")} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900"><ChevronLeft className="w-4 h-4" /> Back</button>
            <div className="text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">Grammar Master</div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <textarea value={grammarText} onChange={(e) => setGrammarText(e.target.value)} placeholder="Paste text here..." className="w-full h-48 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none" />
            <button onClick={handleCheckGrammar} disabled={isCheckingGrammar || !grammarText.trim()} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">{isCheckingGrammar ? <Loader2 className="w-5 h-5 animate-spin" /> : <SpellCheck className="w-5 h-5" />} Analyze Writing</button>
            {grammarResult && (
              <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-50 p-6 rounded-2xl border border-gray-100"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Corrected Text</p><p className="text-sm font-semibold text-gray-800 leading-relaxed">{grammarResult.correctedText}</p></div>
                  <div className="w-20 h-20 bg-emerald-50 rounded-full border-2 border-emerald-100 flex flex-col items-center justify-center text-emerald-700 shrink-0"><span className="text-xl font-black">{grammarResult.score}</span><span className="text-[8px] font-black uppercase">Score</span></div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {grammarResult.explanations.map((exp, i) => (
                    <div key={i} className="p-3 bg-white border border-emerald-50 rounded-xl text-xs text-gray-600 flex gap-3"><Check className="w-4 h-4 text-emerald-500 shrink-0" />{exp}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === "lessons" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <button onClick={() => setMode("menu")} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900"><ChevronLeft className="w-4 h-4" /> Back</button>
            <div className="text-xs font-black uppercase tracking-widest bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">{selectedLanguage} Lesson</div>
          </div>
          {!lessonResult ? (
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center space-y-6">
              <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto"><GraduationCap className="w-10 h-10" /></div>
              <h3 className="text-2xl font-black text-gray-900">Custom Lesson Plan</h3>
              <div className="flex justify-center gap-4">{["Beginner", "Intermediate", "Advanced"].map(lvl => (<button key={lvl} onClick={() => setLessonLevel(lvl)} className={cn("px-6 py-2.5 rounded-xl text-xs font-bold transition-all border", lessonLevel === lvl ? "bg-purple-600 text-white border-transparent" : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50")}>{lvl}</button>))}</div>
              <button onClick={handleGenerateLesson} disabled={isGeneratingLesson} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">{isGeneratingLesson ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} Generate Lesson</button>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
              <h2 className="text-3xl font-black text-gray-900 text-center">{lessonResult.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-500" /> Vocabulary</h4>
                  <div className="space-y-2">{lessonResult.vocabulary.map((v: any, i: number) => (<div key={i} className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex justify-between items-center"><span className="font-bold text-purple-900">{v.word}</span><span className="text-xs text-purple-600">{v.translation}</span></div>))}</div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2"><Zap className="w-4 h-4 text-purple-500" /> Grammar</h4>
                  <div className="p-5 bg-slate-900 text-slate-100 rounded-2xl text-sm leading-relaxed">{lessonResult.grammar}</div>
                </div>
              </div>
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] flex gap-4"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">🦉</div><div><p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Fun Fact</p><p className="text-xs text-amber-900 font-medium">{lessonResult.funFact}</p></div></div>
              <button onClick={() => { setGeneratedQuiz(lessonResult.exercises); setMode("quiz"); }} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-purple-700 transition-all flex items-center justify-center gap-2">Take Lesson Quiz <ArrowRight className="w-5 h-4" /></button>
              <button onClick={() => setLessonResult(null)} className="w-full py-3 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900">New Lesson</button>
            </div>
          )}
        </div>
      )}

      {mode === "topic_master" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <button onClick={() => setMode("menu")} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900"><ChevronLeft className="w-4 h-4" /> Back</button>
            <div className="text-xs font-black uppercase tracking-widest bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100">Topic Master AI</div>
          </div>
          {!generatedQuiz && !generatedFlashcards ? (
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><BrainCircuit className="w-48 h-48" /></div>
              <h2 className="text-4xl font-black tracking-tight relative">Master Any Topic</h2>
              <div className="max-w-md mx-auto space-y-6 relative">
                <div className="flex p-1 bg-white/10 rounded-2xl border border-white/10">
                  <button onClick={() => setTopicMode("quiz")} className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", topicMode === "quiz" ? "bg-amber-500 text-slate-900" : "text-white/60 hover:text-white")}>Quiz Arena</button>
                  <button onClick={() => setTopicMode("flashcard")} className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", topicMode === "flashcard" ? "bg-amber-500 text-slate-900" : "text-white/60 hover:text-white")}>Flashcards</button>
                </div>
                <input type="text" value={searchTopic} onChange={(e) => setSearchTopic(e.target.value)} placeholder="Enter any topic..." className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-[2rem] text-lg font-bold text-center focus:outline-none focus:ring-4 focus:ring-amber-500/20" />
                <button onClick={handleGenerateStudy} disabled={isGeneratingStudy || !searchTopic.trim()} className="w-full py-5 bg-amber-500 text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-amber-500/30">{isGeneratingStudy ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />} Generate Study Deck</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
               <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center font-black">AI</div><div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Studying Topic</p><h4 className="font-bold text-gray-900">{searchTopic}</h4></div></div>
                  <button onClick={() => { setGeneratedQuiz(null); setGeneratedFlashcards(null); }} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"><Trash2 className="w-5 h-5" /></button>
               </div>
               {topicMode === "quiz" ? <QuizEngine questions={generatedQuiz} /> : <FlashcardEngine cards={generatedFlashcards} />}
            </div>
          )}
        </div>
      )}

      {mode === "flashcard" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center"><button onClick={() => setMode("menu")} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900"><ChevronLeft className="w-4 h-4" /> Back</button><span className="text-xs font-bold uppercase tracking-widest text-gray-400">Card {flashcardIndex + 1} of {flashcardsData[selectedCategory].length}</span></div>
          <div onClick={() => setIsFlipped(!isFlipped)} className="w-full h-80 bg-white rounded-[2.5rem] border border-gray-100 shadow-lg cursor-pointer flex flex-col items-center justify-center p-8 transition-all transform relative select-none hover:shadow-xl">
            <span className="absolute top-6 left-6 text-[10px] bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">{flashcardsData[selectedCategory][flashcardIndex].tense}</span>
            <button onClick={(e) => { e.stopPropagation(); handleSpeech(isFlipped ? flashcardsData[selectedCategory][flashcardIndex].swahili : flashcardsData[selectedCategory][flashcardIndex].english); }} className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl border border-gray-100 transition-all"><Volume2 className="w-4 h-4" /></button>
            {!isFlipped ? (<div className="text-center space-y-4"><span className="text-sm font-bold text-gray-400 uppercase tracking-widest">English</span><p className="text-2xl font-extrabold text-gray-900 px-4">"{flashcardsData[selectedCategory][flashcardIndex].english}"</p></div>) : (<div className="text-center space-y-4"><span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Swahili</span><p className="text-2xl font-extrabold text-emerald-600 px-4">"{flashcardsData[selectedCategory][flashcardIndex].swahili}"</p></div>)}
          </div>
          <div className="flex gap-4"><button onClick={handlePrevFlashcard} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-2">Prev</button><button onClick={handleNextFlashcard} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2">Next</button></div>
        </div>
      )}

      {mode === "quiz" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center"><button onClick={() => setMode("menu")} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900"><ChevronLeft className="w-4 h-4" /> Quit</button></div>
          {!showQuizResult ? (
            <div className="space-y-6">
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all" style={{ width: `${((currentQuestionIndex) / quizzesData[activeQuizIndex].questions.length) * 100}%` }} /></div>
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                <p className="text-xl font-bold text-gray-900">{quizzesData[activeQuizIndex].questions[currentQuestionIndex].question}</p>
                <div className="grid grid-cols-1 gap-3">
                  {quizzesData[activeQuizIndex].questions[currentQuestionIndex].options.map((opt, idx) => (<button key={idx} disabled={isAnswerSubmitted} onClick={() => setSelectedOption(idx)} className={cn("w-full p-4 text-left border rounded-2xl font-semibold transition-all", isAnswerSubmitted ? (idx === quizzesData[activeQuizIndex].questions[currentQuestionIndex].answer ? "bg-green-50 border-green-300" : (selectedOption === idx ? "bg-rose-50 border-rose-200" : "opacity-50")) : (selectedOption === idx ? "border-green-500 bg-green-50" : "border-gray-100"))}>{opt}</button>))}
                </div>
                {isAnswerSubmitted && <div className="p-4 bg-blue-50 text-blue-900 rounded-xl text-xs font-medium">{quizzesData[activeQuizIndex].questions[currentQuestionIndex].explanation}</div>}
              </div>
              <div className="flex gap-4">{!isAnswerSubmitted ? (<button disabled={selectedOption === null} onClick={handleSubmitAnswer} className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl disabled:opacity-50">Check</button>) : (<button onClick={handleNextQuestion} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2">Next <ArrowRight className="w-4 h-4" /></button>)}</div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-md text-center space-y-6">
              <Award className="w-20 h-20 text-green-500 mx-auto" />
              <h2 className="text-3xl font-extrabold text-gray-900">Done!</h2>
              <p className="text-2xl font-bold text-gray-800">Score: {score} / {quizzesData[activeQuizIndex].questions.length}</p>
              <button onClick={() => setMode("menu")} className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold">Return Menu</button>
            </div>
          )}
        </div>
      )}

      {mode === "sign" && <SignLanguageCenter onBack={() => setMode("menu")} />}
      {mode === "selector" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between"><h2 className="text-3xl font-display font-black text-gray-900">Select Language</h2><button onClick={() => setMode("menu")} className="text-xs font-black uppercase text-gray-400">Cancel</button></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {languagesList.map(lang => (<button key={lang} onClick={() => { setSelectedLanguage(lang); setMode("menu"); }} className={cn("p-6 rounded-2xl border text-left transition-all", selectedLanguage === lang ? "bg-emerald-600 text-white" : "bg-white border-gray-100 text-gray-600 hover:bg-emerald-50")}>{lang}</button>))}
          </div>
        </div>
      )}
    </div>
  );
}
