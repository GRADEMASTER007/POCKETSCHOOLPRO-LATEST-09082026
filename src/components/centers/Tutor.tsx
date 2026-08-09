import { appCheck } from "@/src/lib/firebase";
import { getToken } from "firebase/app-check";
import { auth } from "@/src/lib/firebase";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Loader2, 
  BrainCircuit,
  Globe,
  Mic,
  Paperclip,
  MoreVertical,
  ChevronLeft,
  Volume2,
  BookOpen,
  Zap,
  FileText,
  MapPin,
  Radio,
  X
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/components/auth/AuthContext";
import { speak, stopSpeaking } from "@/src/lib/tts";
import StudyTools from "@/src/components/study/StudyTools";
import { TutorAvatar } from "@/src/components/layout/TutorAvatar";
import { saveChatMessage, subscribeToChatHistory, clearChatHistory } from "@/src/lib/chat-storage";
import tutorAvatar from "@/src/assets/images/aristotle_ai_avatar_1783943391045.jpg";

interface Message {
  role: "user" | "model";
  text: string;
  trigger?: string | null;
  parts?: any[];
  imageUrl?: string;
  fileName?: string;
}

export default function Tutor() {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hello! I'm your AI Tutor. What would you like to learn today? I can help with homework, explain complex topics, or create a study plan for you." }
  ]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [grounding, setGrounding] = useState<"none" | "search" | "maps">("none");
  const [mode, setMode] = useState<"tutor" | "planner" | "cv_gen" | "interview">("tutor");
  const [subject, setSubject] = useState("General");
  const [view, setView] = useState<"chat" | "tools">("chat");
  const [isRecording, setIsRecording] = useState(false);
  const [masteryLevel, setMasteryLevel] = useState(0);
  const [knowledgeGaps, setKnowledgeGaps] = useState<string[]>([]);
  const [isSocratic, setIsSocratic] = useState(false);
  const [showMasteryCelebration, setShowMasteryCelebration] = useState(false);
  
  const [activeToolTrigger, setActiveToolTrigger] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (masteryLevel > 0) {
      setShowMasteryCelebration(true);
      const timer = setTimeout(() => setShowMasteryCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [masteryLevel]);
  const recognitionRef = useRef<any>(null);
  
  // Live Voice Session states (gemini-3.1-flash-live-preview WebSocket mode)
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [isLiveVoiceConnecting, setIsLiveVoiceConnecting] = useState(false);
  const [isLiveVoiceConnected, setIsLiveVoiceConnected] = useState(false);
  const [liveSpeakerActive, setLiveSpeakerActive] = useState(false);
  const [liveWs, setLiveWs] = useState<WebSocket | null>(null);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const [liveProcessor, setLiveProcessor] = useState<ScriptProcessorNode | null>(null);
  const [liveAudioContextInput, setLiveAudioContextInput] = useState<AudioContext | null>(null);
  const [liveAudioContextOutput, setLiveAudioContextOutput] = useState<AudioContext | null>(null);

  const startLiveVoiceSession = async () => {
    setIsLiveVoiceConnecting(true);
    setIsLiveVoiceOpen(true);
    try {
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLiveStream(stream);

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      setLiveAudioContextInput(inputCtx);
      setLiveAudioContextOutput(outputCtx);

      let nextStartTime = 0;

      ws.onopen = () => {
        setIsLiveVoiceConnecting(false);
        setIsLiveVoiceConnected(true);
        
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(2048, 1, 1);
        
        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          
          const buffer = new ArrayBuffer(inputData.length * 2);
          const view = new DataView(buffer);
          let offset = 0;
          for (let i = 0; i < inputData.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, inputData[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
          }
          
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);
          
          ws.send(JSON.stringify({ audio: base64 }));
        };
        
        source.connect(processor);
        processor.connect(inputCtx.destination);
        setLiveProcessor(processor);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.interrupted) {
            nextStartTime = 0;
            return;
          }
          if (data.audio) {
            setLiveSpeakerActive(true);
            const binary = atob(data.audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            const int16Array = new Int16Array(bytes.buffer);
            const float32Array = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
              float32Array[i] = int16Array[i] / 32768.0;
            }
            
            const audioBuffer = outputCtx.createBuffer(1, float32Array.length, 24000);
            audioBuffer.copyToChannel(float32Array, 0);
            
            const sourceNode = outputCtx.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(outputCtx.destination);
            
            const currentTime = outputCtx.currentTime;
            if (nextStartTime < currentTime) {
              nextStartTime = currentTime + 0.05;
            }
            sourceNode.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
            
            setTimeout(() => {
              if (outputCtx.currentTime >= nextStartTime - 0.1) {
                setLiveSpeakerActive(false);
              }
            }, audioBuffer.duration * 1000);
          }
        } catch (err) {
          console.error("Error parsing voice data:", err);
        }
      };

      ws.onclose = () => {
        stopLiveVoiceSession();
      };
      ws.onerror = () => {
        stopLiveVoiceSession();
      };

      setLiveWs(ws);
    } catch (err) {
      console.error("Failed to initialize live voice:", err);
      stopLiveVoiceSession();
    }
  };

  const stopLiveVoiceSession = () => {
    setIsLiveVoiceConnected(false);
    setIsLiveVoiceConnecting(false);
    setLiveSpeakerActive(false);
    setIsLiveVoiceOpen(false);

    if (liveWs) {
      if (liveWs.readyState === WebSocket.OPEN) {
        liveWs.close();
      }
      setLiveWs(null);
    }
    if (liveProcessor) {
      try { liveProcessor.disconnect(); } catch (e) {}
      setLiveProcessor(null);
    }
    if (liveStream) {
      try { liveStream.getTracks().forEach(t => t.stop()); } catch (e) {}
      setLiveStream(null);
    }
    if (liveAudioContextInput) {
      try { liveAudioContextInput.close(); } catch (e) {}
      setLiveAudioContextInput(null);
    }
    if (liveAudioContextOutput) {
      try { liveAudioContextOutput.close(); } catch (e) {}
      setLiveAudioContextOutput(null);
    }
  };

  useEffect(() => {
    return () => {
      stopLiveVoiceSession();
    };
  }, []);
  
  // Define subjects
  const subjects = {
    Academic: ["Mathematics", "English", "History", "Geography"],
    Science: ["Physics", "Chemistry", "Biology"],
    Agricultural: ["Crop Science", "Animal Husbandry", "Farm Management"],
    Practical: ["Information Technology", "Technical Drawing", "Woodwork"]
  };
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToChatHistory(
      (firestoreMessages) => {
        if (firestoreMessages.length > 0) {
          const mapped = firestoreMessages.map(m => ({
            role: m.role === 'user' ? 'user' as const : 'model' as const,
            text: m.content,
            id: m.id
          }));
          setMessages(mapped);
        } else {
          setMessages([
            { role: "model", text: "Hello! I'm your AI Tutor. What would you like to learn today? I can help with homework, explain complex topics, or create a study plan for you." }
          ]);
        }
      },
      (error) => {
        console.error("Error subscribing to chat history:", error);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + " " + transcript);
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be under 10MB to be processed.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const persistMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!user) return;
    try {
      const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
      await saveChatMessage({
        id,
        role,
        content
      });
    } catch (e) {
      console.error("Firestore persistence error:", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    const currentFile = selectedFile;
    const currentPreview = filePreview;
    
    setInput("");
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    const newUserMessage: Message = { 
      role: "user", 
      text: userMessage, 
      imageUrl: currentFile && currentFile.type.startsWith("image/") ? currentPreview || undefined : undefined,
      fileName: currentFile && !currentFile.type.startsWith("image/") ? currentFile.name : undefined
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    
    if (user) {
      persistMessage('user', userMessage);
    }
    
    let parts: any[] = [{ text: userMessage }];
    if (currentFile && currentPreview) {
       const base64Data = currentPreview.split(',')[1];
       parts.unshift({
         inlineData: {
           data: base64Data,
           mimeType: currentFile.type || "application/octet-stream"
         }
       });
       newUserMessage.parts = parts;
    }

    try {
       const response = await fetch("/api/chat", {
         method: "POST",
         headers: { "Content-Type": "application/json", "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`},
         body: JSON.stringify({
           message: userMessage,
           parts: parts,
           history: messages.map(m => ({ role: m.role, parts: m.parts || [{ text: m.text }] })),
           thinking,
           grounding,
           model: thinking ? "gemini-3.1-pro-preview" : "gemini-3.5-flash",
           mode,
           subject,
           userId: user?.uid,
           personality,
           isSocratic
         }),
       });

      const data = await response.json();
      if (response.ok) {
        let cleanText = data.text;
        
        // Parse Mastery Tags
        if (cleanText.includes("[MASTERY_UP]")) {
          setMasteryLevel(prev => Math.min(prev + 1, 5));
          cleanText = cleanText.replace("[MASTERY_UP]", "");
        }
        
        // Parse Knowledge Gaps
        const gapMatch = cleanText.match(/\[GAP: (.*?)\]/);
        if (gapMatch) {
          setKnowledgeGaps(prev => [...new Set([...prev, gapMatch[1]])]);
          cleanText = cleanText.replace(/\[GAP: (.*?)\]/g, "");
        }

        // Parse Tool Triggers
        const triggerMatch = cleanText.match(/\[TRIGGER: (.*?)\]/);
        let activeTrigger = null;
        if (triggerMatch) {
           activeTrigger = triggerMatch[1];
           cleanText = cleanText.replace(/\[TRIGGER: (.*?)\]/g, "");
        }

        setMessages(prev => [...prev, { role: "model", text: cleanText.trim(), trigger: activeTrigger }]);
        if (user) {
          persistMessage('assistant', cleanText.trim());
        }
      } else if (response.status === 429) {
        setMessages(prev => [...prev, { role: "model", text: "It seems like you've reached your daily limit for AI-powered tutor interactions. Don't worry, your progress is saved! Please check back tomorrow to continue learning, or upgrade your subscription plan to unlock higher limits." }]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Tutor Error:", error);
      setMessages(prev => [...prev, { role: "model", text: "I'm experiencing a minor technical hiccup right now. Could you please try asking that again in a moment?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const [personality, setPersonality] = useState<"professional" | "energetic" | "calm" | "mentor">("professional");
  
  // Personality configurations
  const personalities = [
    { id: "professional", label: "Professional", icon: User },
    { id: "energetic", label: "Energetic", icon: Sparkles },
    { id: "calm", label: "Calm", icon: Volume2 },
    { id: "mentor", label: "Mentor", icon: BrainCircuit },
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col bg-white md:bg-transparent md:rounded-[3rem] overflow-hidden md:border md:border-gray-100 shadow-sm md:shadow-2xl">
      {/* Premium Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-900">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <TutorAvatar 
            status={isLoading ? "thinking" : showMasteryCelebration ? "celebrating" : "idle"} 
            size="md" 
            personality={personality}
          />
          <div>
            <h1 className="text-lg font-display font-black leading-tight text-brand-primary">Aristotle AI</h1>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-2 h-2 rounded-full border border-white transition-all duration-700",
                      i <= masteryLevel ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-200"
                    )} 
                  />
                ))}
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mastery Level {masteryLevel}/5</p>
            </div>
          </div>
        </div>
        
        {/* Mastery Celebration Overlay */}
        <AnimatePresence>
          {showMasteryCelebration && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className="absolute left-1/2 -translate-x-1/2 top-20 px-4 py-2 bg-emerald-500 text-white rounded-full shadow-xl flex items-center gap-2 z-50 border-2 border-white"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span className="text-xs font-black uppercase tracking-widest">Concept Mastered!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          {knowledgeGaps.length > 0 && (
            <div className="hidden xl:flex flex-col items-end pr-4 border-r border-gray-100">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500 mb-1">Knowledge Gaps</span>
              <div className="flex gap-1">
                {knowledgeGaps.slice(-3).map((gap, i) => (
                  <div key={i} className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[8px] font-bold border border-amber-100">
                    {gap}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="hidden lg:flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-100">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-2">Socratic Mode</span>
            <button
              onClick={() => setIsSocratic(!isSocratic)}
              className={cn(
                "relative w-8 h-4 rounded-full transition-all duration-300",
                isSocratic ? "bg-emerald-500" : "bg-gray-200"
              )}
            >
              <motion.div 
                animate={{ x: isSocratic ? 16 : 2 }}
                className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" 
              />
            </button>
          </div>
          <div className="hidden lg:flex bg-gray-50 p-1 rounded-full border border-gray-100">
            {personalities.map((p) => (
              <button
                key={p.id}
                onClick={() => setPersonality(p.id as any)}
                className={cn(
                  "p-2 rounded-full transition-all",
                  personality === p.id ? "bg-white text-brand-secondary shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
                title={p.label}
              >
                <p.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-gray-100 hidden lg:block" />
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value as any)}
            className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-full px-4 py-2 border-none focus:ring-0 cursor-pointer hover:bg-gray-100"
          >
            <option value="tutor">Tutor</option>
            <option value="planner">Planner</option>
            <option value="cv_gen">CV Gen</option>
            <option value="interview">Interview</option>
          </select>
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-full px-4 py-2 border-none focus:ring-0 cursor-pointer hover:bg-gray-100"
          >
            <option value="General">General</option>
            {Object.entries(subjects).map(([category, subs]) => (
              <optgroup key={category} label={category}>
                {subs.map(s => <option key={s} value={s}>{s}</option>)}
              </optgroup>
            ))}
          </select>
          <button 
            onClick={() => setView(view === "chat" ? "tools" : "chat")}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm",
              view === "tools" ? "bg-brand-primary text-white" : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50"
            )}
          >
            <BookOpen className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      {view === "chat" ? (
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#F8F9FA] relative"
        >
          {/* Real-time Live Voice Chat Overlay */}
          <AnimatePresence>
            {isLiveVoiceOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-gradient-to-b from-indigo-50/95 to-white/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="max-w-md w-full space-y-8 flex flex-col items-center">
                  <div>
                    <h2 className="text-2xl font-display font-black text-indigo-950 mb-2">Live Voice Feed</h2>
                    <p className="text-sm text-indigo-600 font-medium">Advanced AI Audio Session</p>
                  </div>

                  {/* High fidelity animated visualizer avatar */}
                  <div className="relative my-8">
                    {/* Ripple Rings */}
                    <AnimatePresence>
                      {isLiveVoiceConnected && (
                        <motion.div
                          animate={{ 
                            scale: liveSpeakerActive ? [1, 2.2, 1] : [1, 1.3, 1],
                            opacity: liveSpeakerActive ? [0.15, 0.4, 0.15] : [0.05, 0.15, 0.05]
                          }}
                          transition={{ repeat: Infinity, duration: liveSpeakerActive ? 1.2 : 3, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full bg-indigo-500 blur-2xl -m-8"
                        />
                      )}
                    </AnimatePresence>

                    <TutorAvatar 
                      status={isLiveVoiceConnecting ? "thinking" : liveSpeakerActive ? "speaking" : "idle"} 
                      size="xl" 
                      personality="mentor"
                    />
                  </div>

                  {/* Status Indicator text */}
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-gray-800">
                      {isLiveVoiceConnecting && "Tuning to Aristotle's live frequency..."}
                      {isLiveVoiceConnected && !liveSpeakerActive && "Listening... speak whenever you're ready"}
                      {isLiveVoiceConnected && liveSpeakerActive && "Aristotle is speaking..."}
                    </p>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto">
                      {isLiveVoiceConnecting && "Setting up bidirectional audio stream, please allow microphone access if prompted."}
                      {isLiveVoiceConnected && !liveSpeakerActive && "Ask questions, practice pronunciation, or have a general caps discussion."}
                      {isLiveVoiceConnected && liveSpeakerActive && "Listen carefully, or speak at any point to interrupt and pivot the lesson."}
                    </p>
                  </div>

                  {/* Wave Visualizer lines */}
                  {isLiveVoiceConnected && (
                    <div className="flex items-center justify-center gap-1.5 h-8">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                        <motion.div
                          key={bar}
                          animate={{ 
                            height: liveSpeakerActive 
                              ? [4, Math.random() * 32 + 8, 4] 
                              : [4, Math.random() * 8 + 4, 4] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 0.5 + Math.random() * 0.4,
                            delay: bar * 0.05 
                          }}
                          className="w-1 bg-indigo-500 rounded-full"
                        />
                      ))}
                    </div>
                  )}

                  {/* Action/Disconnect button */}
                  <button
                    onClick={stopLiveVoiceSession}
                    className="mt-4 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full shadow-lg hover:shadow-red-500/20 flex items-center gap-2 transition-all transform hover:scale-[1.03] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Disconnect Voice Feed</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={i}
                className={cn(
                  "flex max-w-[85%]",
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "rounded-[1.5rem] p-5 text-[15px] leading-relaxed shadow-sm",
                  m.role === "user" 
                    ? "bg-brand-primary text-white rounded-tr-sm" 
                    : "bg-white border border-gray-100/50 text-gray-800 rounded-tl-sm"
                )}>
                  {m.imageUrl && (
                    <div className="mb-3 max-w-sm overflow-hidden rounded-lg border border-white/20">
                      <img src={m.imageUrl} alt="Attached Homework" className="w-full h-auto max-h-60 object-contain" />
                    </div>
                  )}

                  {m.fileName && (
                    <div className="mb-3 p-3 bg-white/10 rounded-xl flex items-center gap-3 border border-white/20 max-w-sm">
                      <FileText className="w-6 h-6 text-white" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{m.fileName}</p>
                        <p className="text-[9px] text-white/70 uppercase tracking-widest font-bold">Attached Document</p>
                      </div>
                    </div>
                  )}

                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-white">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                  
                  {m.trigger && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                          <Zap className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Interactive Lab</p>
                          <p className="text-xs font-bold text-gray-700">{m.trigger}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveToolTrigger(m.trigger || "");
                          setView("tools");
                        }}
                        className="px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm hover:scale-105 transition-transform"
                      >
                        Launch
                      </button>
                    </motion.div>
                  )}

                  {m.role === "model" && (
                    <button 
                      onClick={() => speak(m.text)}
                      className="mt-3 flex items-center gap-1 text-[10px] text-brand-primary font-bold uppercase tracking-widest hover:opacity-80"
                    >
                      <Volume2 className="w-3 h-3" />
                      Listen to Lesson
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex max-w-[85%] mr-auto w-full md:w-2/3">
              <div className="bg-white border border-gray-100/50 rounded-[1.5rem] rounded-tl-sm p-6 shadow-sm w-full space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-brand-primary rounded-full animate-ping shrink-0" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Aristotle is formulating response...</span>
                </div>
                <div className="space-y-3 animate-pulse">
                  <div className="h-3 bg-gray-200/80 rounded-md w-[90%]" />
                  <div className="h-3 bg-gray-200/80 rounded-md w-[75%]" />
                  <div className="h-3 bg-gray-200/80 rounded-md w-[45%]" />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <StudyTools subject={subject} initialTopic={activeToolTrigger} />
      )}

      {/* Input Area */}
      {view === "chat" && (
        <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-2">
          {/* Premium AI Controls Dock */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100/60 mb-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Thinking Mode */}
              <button
                type="button"
                onClick={() => setThinking(!thinking)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer",
                  thinking 
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                    : "bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
                title="Enable deep thinking (gemini-3.1-pro with HIGH thinking level)"
              >
                <BrainCircuit className={cn("w-3.5 h-3.5", thinking ? "text-indigo-600 animate-pulse" : "text-gray-400")} />
                <span>Deep Think</span>
                {thinking && (
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping" />
                )}
              </button>

              {/* Search Grounding */}
              <button
                type="button"
                onClick={() => setGrounding(grounding === "search" ? "none" : "search")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer",
                  grounding === "search"
                    ? "bg-sky-50 border-sky-200 text-sky-700 shadow-sm" 
                    : "bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
                title="Enable Search grounding to retrieve real-time data"
              >
                <Globe className={cn("w-3.5 h-3.5", grounding === "search" ? "text-sky-600 animate-pulse" : "text-gray-400")} />
                <span>Web Search</span>
              </button>

              {/* Maps Grounding */}
              <button
                type="button"
                onClick={() => setGrounding(grounding === "maps" ? "none" : "maps")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer",
                  grounding === "maps"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" 
                    : "bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
                title="Enable Maps grounding for location-aware routing and maps details"
              >
                <MapPin className={cn("w-3.5 h-3.5", grounding === "maps" ? "text-emerald-600 animate-pulse" : "text-gray-400")} />
                <span>Maps</span>
              </button>
            </div>

            {/* Live Voice Activation */}
            <button
              type="button"
              onClick={startLiveVoiceSession}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-700 hover:to-violet-700 transition-all transform hover:scale-[1.02] cursor-pointer"
              title="Launch instant bidirectional real-time conversation (gemini-3.1-flash-live-preview)"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE VOICE</span>
            </button>
          </div>

          {filePreview && selectedFile && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 ml-2 max-w-xs relative group">
              {selectedFile.type.startsWith("image/") ? (
                <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
              ) : selectedFile.type.startsWith("audio/") ? (
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                  <Mic className="w-6 h-6 animate-pulse" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-gray-700 truncate">{selectedFile.name}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type.startsWith("image/") ? "Image" : selectedFile.type.startsWith("audio/") ? "Audio" : "Document"}
                </p>
              </div>
              <button 
                onClick={() => { setSelectedFile(null); setFilePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm transition-all absolute -top-2 -right-2"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex items-end gap-2 bg-[#F8F9FA] rounded-[2rem] p-2 border border-gray-200/60 focus-within:border-brand-primary/30 focus-within:ring-4 focus-within:ring-brand-primary/5 transition-all">
            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-brand-primary transition-colors flex-shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,application/pdf,text/plain,audio/*" className="hidden" />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Aristotle..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 text-[15px]"
              rows={1}
            />
            <button 
              onClick={isRecording ? stopListening : startListening}
              className={cn(
                "p-3 transition-colors flex-shrink-0",
                isRecording ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-brand-primary"
              )}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-brand-primary text-white rounded-full hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:scale-95 shadow-md shadow-brand-primary/20 flex-shrink-0 m-1"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-3 font-medium">Aristotle AI can make mistakes. Verify important information.</p>
        </div>
      )}
    </div>
  );
}
