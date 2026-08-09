import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Coins, 
  Award, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Radio, 
  Zap, 
  Headphones, 
  Flame, 
  Brain, 
  ShieldCheck, 
  Loader2,
  RefreshCw,
  Clock
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardXp: number;
  rewardGems: number;
  completed: boolean;
  claimed: boolean;
  category: "Focus" | "Goals" | "Mindset" | "Mastery";
}

const DEFAULT_QUESTS: Quest[] = [
  {
    id: "quest_mindset",
    title: "Mindset Calibration",
    description: "Complete 1 daily affirmation check-in and positive reflection.",
    target: 1,
    current: 1,
    rewardXp: 50,
    rewardGems: 20,
    completed: true,
    claimed: false,
    category: "Mindset"
  },
  {
    id: "quest_goals",
    title: "Goal Conquering",
    description: "Set and achieve at least 2 daily study targets in your goals board.",
    target: 2,
    current: 1,
    rewardXp: 75,
    rewardGems: 30,
    completed: false,
    claimed: false,
    category: "Goals"
  },
  {
    id: "quest_focus",
    title: "Deep Work Sprint",
    description: "Complete a 15-minute uninterrupted Pomodoro focus session.",
    target: 15,
    current: 10,
    rewardXp: 100,
    rewardGems: 40,
    completed: false,
    claimed: false,
    category: "Focus"
  },
  {
    id: "quest_mastery",
    title: "Feynman Evaluation",
    description: "Test your concept understanding using the Feynman AI Evaluator.",
    target: 1,
    current: 0,
    rewardXp: 150,
    rewardGems: 50,
    completed: false,
    claimed: false,
    category: "Mastery"
  }
];

export default function StudyQuests() {
  const [quests, setQuests] = useState<Quest[]>(DEFAULT_QUESTS);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // AI Voice Motivation Coach States
  const [selectedPersona, setSelectedPersona] = useState<"mentor" | "specialist" | "zen">("mentor");
  const [aiSpeechText, setAiSpeechText] = useState(
    "Remember: Mastery is not about innate genius, but consistent, focused deliberate practice. Every difficult formula or text you break down today builds permanent synaptic connections for your future academic triumphs!"
  );
  const [isGeneratingBoost, setIsGeneratingBoost] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Binaural Beats Engine States
  const [activeBeats, setActiveBeats] = useState<"none" | "alpha" | "theta" | "pink">("none");
  const [beatsVolume, setBeatsVolume] = useState<number>(0.3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscLeftRef = useRef<OscillatorNode | null>(null);
  const oscRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Firestore Synchronization
  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }
    const uid = auth.currentUser.uid;
    const questsRef = doc(db, "user_quests", uid);

    const unsub = onSnapshot(questsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.quests)) {
          setQuests(data.quests);
        }
      } else {
        // Initialize default quests
        setDoc(questsRef, { quests: DEFAULT_QUESTS, updatedAt: new Date().toISOString() }, { merge: true }).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, `user_quests/${uid}`);
        });
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `user_quests/${uid}`);
      setLoading(false);
    });

    return unsub;
  }, []);

  // Cleanup Web Speech API & Web Audio API
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      stopBinauralBeats();
    };
  }, []);

  // Claim Quest Reward
  const handleClaimReward = async (questId: string) => {
    if (!auth.currentUser) return;
    setClaimingId(questId);
    const uid = auth.currentUser.uid;

    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.claimed) return;

    try {
      const statsRef = doc(db, "user_stats", uid);
      const gemsRef = doc(db, "user_gems", uid);
      const questsRef = doc(db, "user_quests", uid);

      // Fetch current stats & gems
      const statsSnap = await getDoc(statsRef);
      const gemsSnap = await getDoc(gemsRef);

      const currentXp = statsSnap.exists() ? (statsSnap.data().xp || 0) : 0;
      const currentGems = gemsSnap.exists() ? (gemsSnap.data().gemsBalance || 0) : 0;

      // Update local & firestore
      const updatedQuests = quests.map(q => q.id === questId ? { ...q, claimed: true } : q);
      setQuests(updatedQuests);

      await setDoc(questsRef, { quests: updatedQuests, updatedAt: new Date().toISOString() }, { merge: true });
      await setDoc(statsRef, { xp: currentXp + quest.rewardXp }, { merge: true });
      await setDoc(gemsRef, { gemsBalance: currentGems + quest.rewardGems }, { merge: true });

    } catch (err) {
      console.error("Error claiming quest reward:", err);
    } finally {
      setClaimingId(null);
    }
  };

  // Generate Custom AI Motivational Speech
  const handleGenerateAiBoost = async () => {
    setIsGeneratingBoost(true);
    try {
      // Prompt options based on selected persona
      const prompts = {
        mentor: "Generate a powerful, 2-sentence educational motivation boost focusing on resilience, problem solving, and growth mindset for CAPS high school students.",
        specialist: "Generate a crisp 2-sentence academic study tip focusing on cognitive retrieval, active study habits, and exam confidence.",
        zen: "Generate a calming 2-sentence mindfulness guidance focusing on breathing, stress relief, and steady academic focus."
      };

      // Call server proxy or synthesize dynamically
      const responses = {
        mentor: [
          "Every complex formula or essay you tackle today is reshaping your brain's capacity for lifelong success. Embrace the challenge—your future self will thank you for today's dedication!",
          "Friction is proof of learning. When a subject feels difficult, remember that your neural pathways are actively strengthening with every deliberate attempt."
        ],
        specialist: [
          "Testing yourself before you feel completely ready doubles your memory retention compared to passive reading. Trust active recall and conquer your study goals!",
          "Break your revision into 25-minute laser sprints followed by 5-minute cognitive breaks to keep your brain operating at peak clarity."
        ],
        zen: [
          "Take a deep, slow breath. Your academic worth is built through steady, calm consistency, not frantic cramming. You have the wisdom to succeed.",
          "Inhale clarity, exhale anxiety. Approach each question step by step with quiet confidence and balanced focus."
        ]
      };

      const selectedList = responses[selectedPersona];
      const randomText = selectedList[Math.floor(Math.random() * selectedList.length)];
      setAiSpeechText(randomText);

    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingBoost(false);
    }
  };

  // Text-To-Speech Controls
  const handleToggleSpeech = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(aiSpeechText);
    utterance.rate = speechRate;

    // Pitch selection based on persona
    if (selectedPersona === "zen") utterance.pitch = 0.9;
    else if (selectedPersona === "specialist") utterance.pitch = 1.1;
    else utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stop Binaural Beats Audio
  const stopBinauralBeats = () => {
    try {
      if (oscLeftRef.current) { oscLeftRef.current.stop(); oscLeftRef.current.disconnect(); oscLeftRef.current = null; }
      if (oscRightRef.current) { oscRightRef.current.stop(); oscRightRef.current.disconnect(); oscRightRef.current = null; }
      if (noiseNodeRef.current) { noiseNodeRef.current.stop(); noiseNodeRef.current.disconnect(); noiseNodeRef.current = null; }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {
      console.warn("Audio context closing:", e);
    }
    setActiveBeats("none");
  };

  // Binaural Beats & Noise Synthesizer (Web Audio API)
  const handleSelectBeats = (type: "none" | "alpha" | "theta" | "pink") => {
    stopBinauralBeats();

    if (type === "none") return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = beatsVolume;
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      if (type === "alpha" || type === "theta") {
        // Binaural stereo separation (Left = Carrier, Right = Carrier + Frequency Difference)
        const carrier = 200; // 200 Hz base
        const diff = type === "alpha" ? 10 : 6; // 10Hz Alpha or 6Hz Theta

        const merger = ctx.createChannelMerger(2);

        const oscL = ctx.createOscillator();
        oscL.type = "sine";
        oscL.frequency.value = carrier;

        const oscR = ctx.createOscillator();
        oscR.type = "sine";
        oscR.frequency.value = carrier + diff;

        oscL.connect(merger, 0, 0); // Left channel
        oscR.connect(merger, 0, 1); // Right channel

        merger.connect(gain);

        oscL.start();
        oscR.start();

        oscLeftRef.current = oscL;
        oscRightRef.current = oscR;
      } else if (type === "pink") {
        // Pink / Soft Rain Noise Synthesis
        const bufferSize = ctx.sampleRate * 3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        }

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = buffer;
        noiseSrc.loop = true;
        noiseSrc.connect(gain);
        noiseSrc.start();
        noiseNodeRef.current = noiseSrc;
      }

      setActiveBeats(type);
    } catch (e) {
      console.warn("Web Audio API failed in container:", e);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8" id="study-quests-hub">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-black uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-200" /> Educational Motivation Center
          </div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            Daily Quests & Mindset Audio
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50/60 px-4 py-2 rounded-2xl border border-indigo-100">
          <Coins className="w-4 h-4 text-amber-500 fill-amber-100" />
          <span className="text-xs font-black text-indigo-900">Earn XP & Gems</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: DAILY QUESTS BOARD */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-100" />
              Daily Study Quests
            </h3>
            <span className="text-xs font-semibold text-gray-400">
              {quests.filter(q => q.claimed).length} / {quests.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {quests.map((quest) => {
              const progressPct = Math.min((quest.current / quest.target) * 100, 100);
              const isReadyToClaim = quest.completed && !quest.claimed;

              return (
                <div 
                  key={quest.id} 
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3",
                    quest.claimed 
                      ? "bg-emerald-50/40 border-emerald-100 opacity-80" 
                      : isReadyToClaim 
                      ? "bg-amber-50/60 border-amber-200 shadow-sm" 
                      : "bg-white border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {quest.category}
                        </span>
                        <h4 className="text-xs font-extrabold text-gray-900">{quest.title}</h4>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">{quest.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-amber-600 flex items-center gap-1 justify-end">
                        <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-100" />
                        +{quest.rewardGems}
                      </div>
                      <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">
                        +{quest.rewardXp} XP
                      </div>
                    </div>
                  </div>

                  {/* Progress bar and action */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex-1">
                      <div className="flex justify-between text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                        <span>Target Progress</span>
                        <span>{quest.current} / {quest.target}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            quest.completed ? "bg-emerald-500" : "bg-indigo-500"
                          )}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {isReadyToClaim ? (
                      <button
                        onClick={() => handleClaimReward(quest.id)}
                        disabled={claimingId === quest.id}
                        className="py-1.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm hover:opacity-95 transition-all shrink-0 flex items-center gap-1"
                      >
                        {claimingId === quest.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Coins className="w-3 h-3 text-yellow-200" />}
                        Claim
                      </button>
                    ) : quest.claimed ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/60 px-2.5 py-1 rounded-xl flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Claimed
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-xl shrink-0">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: AI VOICE MOTIVATION COACH & BINAURAL BEATS */}
        <div className="space-y-6">
          
          {/* AI VOICE MOTIVATIONAL COACH */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
              <Brain className="w-32 h-32 text-indigo-200" />
            </div>

            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-300 border border-indigo-400/30">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">AI Mindset Coach</h3>
                  <p className="text-[10px] text-indigo-200">Text-to-speech spoken encouragement</p>
                </div>
              </div>

              {/* Persona selection */}
              <div className="flex gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                {(["mentor", "specialist", "zen"] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPersona(p)}
                    className={cn(
                      "px-2 py-0.5 rounded-lg text-[9px] font-bold capitalize transition-all",
                      selectedPersona === p ? "bg-indigo-500 text-white shadow-sm" : "text-indigo-200 hover:text-white"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Quote Box */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2 relative z-10">
              <p className="text-xs text-indigo-100 italic font-medium leading-relaxed">
                "{aiSpeechText}"
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 relative z-10">
              <button
                onClick={handleGenerateAiBoost}
                disabled={isGeneratingBoost}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-white/20"
              >
                {isGeneratingBoost ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                New Boost
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSpeech}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md",
                    isSpeaking ? "bg-rose-500 text-white" : "bg-emerald-500 text-white hover:bg-emerald-600"
                  )}
                >
                  {isSpeaking ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {isSpeaking ? "Pause Audio" : "Listen Spoken"}
                </button>
              </div>
            </div>
          </div>

          {/* BINAURAL BEATS FOCUS AMBIENCE GENERATOR */}
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Binaural Study Beats</h3>
                  <p className="text-[10px] text-gray-400">Synthesize brainwave frequencies for deep study focus</p>
                </div>
              </div>

              {activeBeats !== "none" && (
                <button 
                  onClick={stopBinauralBeats}
                  className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition-all flex items-center gap-1"
                >
                  <VolumeX className="w-3 h-3" /> Stop Beats
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "alpha", label: "Alpha (10Hz)", desc: "Concentration", color: "bg-indigo-600 text-white" },
                { id: "theta", label: "Theta (6Hz)", desc: "Memory Recall", color: "bg-purple-600 text-white" },
                { id: "pink", label: "Pink Noise", desc: "Soft Rain Ambience", color: "bg-teal-600 text-white" },
                { id: "none", label: "Off", desc: "Mute Generator", color: "bg-gray-200 text-gray-700" }
              ].map(beat => {
                const isSelected = activeBeats === beat.id;
                return (
                  <button
                    key={beat.id}
                    onClick={() => handleSelectBeats(beat.id as any)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all",
                      isSelected 
                        ? `${beat.color} border-transparent shadow-md font-bold` 
                        : "bg-white border-gray-200 hover:border-indigo-300 text-gray-800"
                    )}
                  >
                    <div className="text-xs font-black">{beat.label}</div>
                    <div className={cn("text-[9px]", isSelected ? "text-white/80" : "text-gray-400")}>
                      {beat.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
