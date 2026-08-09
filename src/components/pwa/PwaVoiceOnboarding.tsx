import React, { useState, useEffect, useRef } from "react";
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  Apple, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Share, 
  MoreVertical, 
  PlusSquare, 
  Bell, 
  WifiOff, 
  Eye, 
  Contrast, 
  Type, 
  HelpCircle,
  Radio,
  Zap,
  Check
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

type PlatformType = "android" | "ios" | "desktop" | "other";

interface Step {
  id: number;
  title: string;
  subtitle: string;
  speechText: string;
  instructions: string[];
  icon: any;
}

export default function PwaVoiceOnboarding() {
  // Platform and Installation States
  const [platform, setPlatform] = useState<PlatformType>("desktop");
  const [browserName, setBrowserName] = useState<string>("Browser");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Accessibility & Speech States
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoRead, setAutoRead] = useState<boolean>(true);
  const [speechRate, setSpeechRate] = useState<number>(0.95); // Slightly slower for clarity
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Visual Accessibility States
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("large");

  // Audio Context Ref for Sound Chimes
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Auto-detect Device & Listen for Native PWA Install Prompt
  useEffect(() => {
    // Detect OS & Browser
    const userAgent = navigator.userAgent.toLowerCase();
    let detectedPlatform: PlatformType = "desktop";
    let bName = "Browser";

    if (/iphone|ipad|ipod/.test(userAgent)) {
      detectedPlatform = "ios";
      bName = "Safari iOS";
    } else if (/android/.test(userAgent)) {
      detectedPlatform = "android";
      bName = "Chrome Android";
    } else if (/macintosh|mac os x/.test(userAgent)) {
      detectedPlatform = "desktop";
      bName = "macOS Browser";
    } else if (/windows/.test(userAgent)) {
      detectedPlatform = "desktop";
      bName = "Windows Browser";
    }
    setPlatform(detectedPlatform);
    setBrowserName(bName);

    // Check if already running in standalone PWA mode
    if (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      playChime("success");
      speakText("Congratulations! Grade Master has been successfully installed on your device for offline study.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Load Speech Synthesis Voices
    const updateVoices = () => {
      if ("speechSynthesis" in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        // Default to an English voice
        const englishIndex = voices.findIndex(v => v.lang.startsWith("en"));
        if (englishIndex !== -1) setSelectedVoiceIndex(englishIndex);
      }
    };

    updateVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Audio Chime Generator
  const playChime = (type: "step" | "success" | "click") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "step") {
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {
      console.warn("Web Audio chime failed:", e);
    }
  };

  // Speak Text Function using Web Speech API
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    if (availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Stop Speech
  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Step Instructions Definitions
  const getSteps = (): Step[] => [
    {
      id: 1,
      title: "Welcome to Grade Master Voice Setup",
      subtitle: "Accessibility & Offline Learning Overview",
      speechText: "Welcome to Grade Master Pocket School voice-guided setup! A Progressive Web App allows you to install this study portal directly to your phone or laptop home screen. You get full offline access to past exam papers, audio flashcards, and AI tools without needing an app store download. Let us get your device configured step by step.",
      instructions: [
        "Grade Master works offline once installed — no internet needed for saved study materials.",
        "Works on Android, iOS iPhones, iPads, Windows, and Mac computers.",
        "Includes voice narration, screen-reader compatibility, and high-contrast visuals.",
        "Click or press Next Step to hear voice instructions for your specific device."
      ],
      icon: Sparkles
    },
    {
      id: 2,
      title: `Step 2: Installing on ${platform === "ios" ? "Apple iOS (Safari)" : platform === "android" ? "Android (Chrome)" : "Desktop Computer"}`,
      subtitle: `Voice instructions customized for ${browserName}`,
      speechText: platform === "ios"
        ? "To install on iPhone or iPad: First, locate the Share button at the bottom of your Safari browser screen. It looks like a square with an arrow pointing up. Tap the Share button. Second, scroll down the menu and tap 'Add to Home Screen'. Third, tap 'Add' in the top right corner. Grade Master will now appear on your home screen!"
        : platform === "android"
        ? "To install on Android: First, tap the 3 dots menu icon in the top right corner of Chrome. Second, tap 'Add to Home screen' or 'Install app'. Third, tap 'Install' when prompted. You can also press the 'Install App Now' button on this screen!"
        : "To install on your Desktop Computer: First, look at the address bar at the top right of your browser for an install button, or click the 3 dots menu. Second, click 'Install Grade Master'. Alternatively, click the 'Install App Now' button directly on this screen!",
      instructions: platform === "ios" ? [
        "1. Tap the 'Share' icon (square with upward arrow) in the Safari toolbar at the bottom of the screen.",
        "2. Scroll down the option list and tap 'Add to Home Screen' (plus icon inside a square).",
        "3. Tap 'Add' in the top right corner to save Grade Master to your device home screen."
      ] : platform === "android" ? [
        "1. Tap the 3 vertical dots menu button in the top right corner of Chrome.",
        "2. Tap 'Add to Home screen' or 'Install app' from the drop-down menu.",
        "3. Confirm by tapping 'Install'. Alternatively, click the blue button below!"
      ] : [
        "1. Look at the address bar at the top right for the Install icon (a monitor with a down arrow).",
        "2. Click 'Install Grade Master' or open the 3-dot browser menu -> 'Install app'.",
        "3. Click 'Install' to place Grade Master in your desktop applications list."
      ],
      icon: Download
    },
    {
      id: 3,
      title: "Step 3: Study Reminders & Offline Data Cache",
      subtitle: "Notifications & Voice Study Preferences",
      speechText: "Step 3: Setting up your daily study reminders and offline storage. Granting notification permissions allows Grade Master to send gentle audio and screen reminders for your daily study streak and exam countdowns. Click the button below to enable notifications.",
      instructions: [
        "Daily study reminders keep your learning streak active for bonus XP and Gems.",
        "Offline caching automatically preserves your flashcards, notes, and study plans.",
        "All data stays safely stored in your browser's encrypted local database.",
        "Click 'Enable Reminders' below to grant browser notification permission."
      ],
      icon: Bell
    },
    {
      id: 4,
      title: "Step 4: Installation Complete & Readiness Audit",
      subtitle: "Your Voice-Guided Study Portal is Ready!",
      speechText: "Step 4: Setup completed! Grade Master is now fully optimized for your learning experience. You can switch to High Contrast Mode, adjust font sizes, or start studying right away. Press 'Enter Study Hub' to begin your academic journey!",
      instructions: [
        "✓ Voice-guided speech engine active.",
        "✓ High-contrast and screen reader accessibility checked.",
        "✓ Offline CAPS & IEB curriculum engines synced.",
        "You are all set! Launch Grade Master now."
      ],
      icon: ShieldCheck
    }
  ];

  const steps = getSteps();
  const currentStepData = steps[currentStep - 1];

  // Trigger Speech on Step Change if autoRead is true
  useEffect(() => {
    if (autoRead) {
      speakText(currentStepData.speechText);
    }
  }, [currentStep, platform, autoRead]);

  // Handle Step Navigation
  const handleNextStep = () => {
    playChime("step");
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    playChime("step");
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Trigger Native Browser PWA Prompt
  const handleTriggerNativeInstall = async () => {
    if (!deferredPrompt) {
      speakText("Native install prompt is not available directly from this browser context. Please follow the step by step menu instructions shown on screen.");
      alert("Native install prompt unavailable. Follow the 3-step menu instructions on screen to install!");
      return;
    }

    playChime("click");
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setInstallSuccess(true);
      playChime("success");
      speakText("Thank you for installing Grade Master!");
    }
    setDeferredPrompt(null);
  };

  // Request Notification Permissions
  const handleRequestNotifications = async () => {
    if (typeof Notification === "undefined") {
      alert("Notifications are not supported in this browser.");
      return;
    }

    playChime("click");
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    if (permission === "granted") {
      playChime("success");
      speakText("Notifications enabled! You will now receive daily study reminders and streak updates.");
    } else {
      speakText("Notification permissions were not granted. You can still use all Grade Master features manually.");
    }
  };

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing inside input fields
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (isSpeaking) stopSpeech();
        else speakText(currentStepData.speechText);
      } else if (e.key === "ArrowRight" || e.key === "n" || e.key === "N") {
        e.preventDefault();
        if (currentStep < steps.length) handleNextStep();
      } else if (e.key === "ArrowLeft" || e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (currentStep > 1) handlePrevStep();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        if (isSpeaking) stopSpeech();
        setAutoRead(prev => !prev);
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        handleTriggerNativeInstall();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, isSpeaking, currentStepData, deferredPrompt]);

  return (
    <div 
      className={cn(
        "min-h-screen p-4 md:p-8 transition-colors duration-300 font-sans",
        highContrast ? "bg-black text-yellow-300" : "bg-slate-900 text-slate-100"
      )}
      id="pwa-voice-onboarding-container"
      role="region"
      aria-label="PWA Voice Guided Installation Onboarding"
    >
      {/* Hidden Live Region for Screen Reader Announcements */}
      <div 
        aria-live="assertive" 
        className="sr-only" 
        id="screen-reader-announcer"
      >
        {`Step ${currentStep} of ${steps.length}: ${currentStepData.title}. ${currentStepData.speechText}`}
      </div>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* ACCESSIBILITY & AUDIO TOOLBAR */}
        <div className={cn(
          "p-4 rounded-3xl border flex flex-wrap items-center justify-between gap-4 shadow-xl",
          highContrast ? "bg-zinc-900 border-yellow-400" : "bg-slate-800/90 border-slate-700/80 backdrop-blur-md"
        )}>
          {/* Title & Status */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center font-black",
              highContrast ? "bg-yellow-400 text-black" : "bg-indigo-600 text-white"
            )}>
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className={cn("text-base font-extrabold tracking-tight", highContrast ? "text-yellow-300" : "text-white")}>
                PWA Voice Installation Assistant
              </h1>
              <p className={cn("text-xs font-medium", highContrast ? "text-yellow-200" : "text-slate-400")}>
                Audio-Guided Setup for Visually Impaired Students
              </p>
            </div>
          </div>

          {/* Quick Settings Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Auto-read Toggle */}
            <button
              onClick={() => {
                setAutoRead(!autoRead);
                playChime("click");
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all min-h-[44px]",
                autoRead
                  ? highContrast ? "bg-yellow-400 text-black border-yellow-300" : "bg-emerald-500 text-white border-emerald-400"
                  : highContrast ? "bg-zinc-800 text-yellow-300 border-yellow-400" : "bg-slate-700 text-slate-300 border-slate-600"
              )}
              aria-label={`Toggle auto-read steps aloud. Currently ${autoRead ? 'enabled' : 'disabled'}`}
            >
              {autoRead ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Auto-Read Steps: {autoRead ? "ON" : "OFF"}
            </button>

            {/* High Contrast Toggle */}
            <button
              onClick={() => {
                setHighContrast(!highContrast);
                playChime("click");
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all min-h-[44px]",
                highContrast ? "bg-yellow-300 text-black border-white" : "bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
              )}
              aria-label="Toggle high contrast black and yellow visual mode"
            >
              <Contrast className="w-4 h-4" />
              Contrast: {highContrast ? "High (AAA)" : "Standard"}
            </button>

            {/* Font Size Toggle */}
            <button
              onClick={() => {
                setFontSize(prev => prev === "normal" ? "large" : prev === "large" ? "xlarge" : "normal");
                playChime("click");
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all min-h-[44px]",
                highContrast ? "bg-zinc-800 text-yellow-300 border-yellow-400" : "bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
              )}
              aria-label="Change text size"
            >
              <Type className="w-4 h-4" />
              Text: {fontSize.toUpperCase()}
            </button>
          </div>
        </div>

        {/* VOICE CONTROL PANEL */}
        <div className={cn(
          "p-6 rounded-3xl border space-y-4 shadow-xl relative overflow-hidden",
          highContrast ? "bg-zinc-900 border-yellow-400" : "bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border-indigo-500/30 text-white"
        )}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeech();
                  else speakText(currentStepData.speechText);
                }}
                className={cn(
                  "p-4 rounded-2xl flex items-center justify-center font-black transition-all shadow-lg min-w-[56px] min-h-[56px]",
                  isSpeaking
                    ? "bg-rose-600 text-white animate-pulse"
                    : highContrast ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-emerald-500 text-white hover:bg-emerald-600"
                )}
                aria-label={isSpeaking ? "Pause current voice narration" : "Play step voice narration"}
              >
                {isSpeaking ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full",
                    isSpeaking ? "bg-rose-500/30 text-rose-300 border border-rose-500/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  )}>
                    {isSpeaking ? "🎙️ Speaking Narration..." : "READY TO READ"}
                  </span>
                </div>
                <h2 className={cn("text-lg font-black mt-1", highContrast ? "text-yellow-300" : "text-white")}>
                  Voice Player & Keyboard Navigation
                </h2>
              </div>
            </div>

            {/* Speech Rate & Replay Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => speakText(currentStepData.speechText)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border min-h-[44px]",
                  highContrast ? "bg-zinc-800 text-yellow-300 border-yellow-400" : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                )}
                aria-label="Replay current step voice narration"
              >
                <RotateCcw className="w-4 h-4" /> Replay Voice
              </button>

              {/* Speech Speed Selector */}
              <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-300 px-2">Speed:</span>
                {[0.75, 1.0, 1.25].map(rate => (
                  <button
                    key={rate}
                    onClick={() => {
                      setSpeechRate(rate);
                      playChime("click");
                    }}
                    className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold transition-all min-h-[36px]",
                      speechRate === rate
                        ? highContrast ? "bg-yellow-400 text-black font-black" : "bg-indigo-500 text-white font-black"
                        : "text-slate-300 hover:text-white"
                    )}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current Spoken Text Subtitles / Caption Box */}
          <div className={cn(
            "p-4 rounded-2xl border text-sm font-medium leading-relaxed italic",
            highContrast ? "bg-black border-yellow-400 text-yellow-200" : "bg-black/40 border-white/10 text-indigo-100"
          )}>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 not-italic mb-1 flex items-center gap-1">
              <Radio className="w-3 h-3 text-indigo-400 animate-pulse" /> Spoken Narration Transcript:
            </div>
            "{currentStepData.speechText}"
          </div>
        </div>

        {/* DEVICE SELECTOR BAR */}
        <div className={cn(
          "p-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4",
          highContrast ? "bg-zinc-900 border-yellow-400" : "bg-slate-800/60 border-slate-700/60"
        )}>
          <div className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400" /> Target Operating System:
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {[
              { id: "android", label: "Android", icon: Smartphone },
              { id: "ios", label: "iOS (iPhone/iPad)", icon: Apple },
              { id: "desktop", label: "Desktop (PC/Mac)", icon: Monitor }
            ].map(item => {
              const Icon = item.icon;
              const isSelected = platform === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setPlatform(item.id as PlatformType);
                    playChime("click");
                  }}
                  className={cn(
                    "flex-1 sm:flex-initial px-4 py-2 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all min-h-[44px] border",
                    isSelected
                      ? highContrast ? "bg-yellow-400 text-black border-yellow-300" : "bg-indigo-600 text-white border-indigo-400 shadow-md"
                      : highContrast ? "bg-zinc-800 text-yellow-300 border-yellow-400/50" : "bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700"
                  )}
                  aria-label={`Select ${item.label} instructions`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP CAROUSEL CONTENT CARD */}
        <div className={cn(
          "p-6 md:p-10 rounded-[2.5rem] border shadow-2xl space-y-8 relative overflow-hidden transition-all",
          highContrast ? "bg-zinc-950 border-yellow-400" : "bg-slate-800/90 border-slate-700 text-slate-100",
          fontSize === "large" ? "text-lg" : fontSize === "xlarge" ? "text-xl" : "text-base"
        )}>

          {/* Progress Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-lg",
                highContrast ? "bg-yellow-400 text-black" : "bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white"
              )}>
                {currentStep}
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-0.5">
                  Step {currentStep} of {steps.length}
                </div>
                <h2 className={cn(
                  "font-black tracking-tight",
                  fontSize === "xlarge" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl",
                  highContrast ? "text-yellow-300" : "text-white"
                )}>
                  {currentStepData.title}
                </h2>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-2">
              {steps.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentStep(s.id);
                    playChime("step");
                  }}
                  className={cn(
                    "h-3 rounded-full transition-all min-w-[28px]",
                    currentStep === s.id
                      ? highContrast ? "bg-yellow-400 w-10" : "bg-indigo-500 w-10"
                      : highContrast ? "bg-zinc-800 w-3" : "bg-slate-700 w-3 hover:bg-slate-600"
                  )}
                  aria-label={`Go to step ${s.id}: ${s.title}`}
                />
              ))}
            </div>
          </div>

          {/* STEP SPECIFIC ACTION OR INSTRUCTIONS */}
          <div className="space-y-6">
            <p className={cn("font-medium leading-relaxed", highContrast ? "text-yellow-100" : "text-slate-300")}>
              {currentStepData.subtitle}
            </p>

            {/* Detailed Instructions List */}
            <div className="space-y-3">
              {currentStepData.instructions.map((ins, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "p-4 rounded-2xl border flex items-start gap-4 transition-all",
                    highContrast ? "bg-zinc-900 border-yellow-400/60" : "bg-slate-900/60 border-slate-700/80"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5",
                    highContrast ? "bg-yellow-400 text-black" : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  )}>
                    {idx + 1}
                  </div>
                  <div className={cn("font-semibold leading-relaxed", highContrast ? "text-yellow-200" : "text-slate-200")}>
                    {ins}
                  </div>
                </div>
              ))}
            </div>

            {/* NATIVE INSTALL PROMPT BUTTON (Shown in Step 2 if available or triggerable) */}
            {currentStep === 2 && (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handleTriggerNativeInstall}
                  className={cn(
                    "w-full sm:w-auto px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all shadow-xl min-h-[52px]",
                    highContrast
                      ? "bg-yellow-400 text-black hover:bg-yellow-300"
                      : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                  )}
                >
                  <Download className="w-5 h-5" />
                  {deferredPrompt ? "Install App Now (1-Click)" : "Attempt Native Installation"}
                </button>

                {isInstalled && (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-950/60 border border-emerald-500/40 px-4 py-3 rounded-2xl">
                    <CheckCircle2 className="w-5 h-5" /> App Already Installed on Device!
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATION PERMISSIONS BUTTON (Step 3) */}
            {currentStep === 3 && (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handleRequestNotifications}
                  disabled={notificationStatus === "granted"}
                  className={cn(
                    "w-full sm:w-auto px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all shadow-xl min-h-[52px]",
                    notificationStatus === "granted"
                      ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                      : highContrast ? "bg-yellow-400 text-black" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  )}
                >
                  <Bell className="w-5 h-5" />
                  {notificationStatus === "granted" ? "✓ Reminders Enabled!" : "Enable Daily Study Reminders"}
                </button>
              </div>
            )}

            {/* COMPLETION STEP ACTIONS (Step 4) */}
            {currentStep === 4 && (
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <a
                  href="/"
                  className={cn(
                    "w-full sm:w-auto px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all shadow-xl min-h-[52px]",
                    highContrast ? "bg-yellow-400 text-black" : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-95"
                  )}
                >
                  <Zap className="w-5 h-5" /> Enter Study Hub
                </a>
                <a
                  href="/accessibility"
                  className={cn(
                    "w-full sm:w-auto px-6 py-4 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all border min-h-[52px]",
                    highContrast ? "bg-zinc-900 text-yellow-300 border-yellow-400" : "bg-slate-700/80 text-white border-slate-600 hover:bg-slate-700"
                  )}
                >
                  <Eye className="w-5 h-5" /> Accessibility Settings
                </a>
              </div>
            )}
          </div>

          {/* FOOTER WIZARD NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/10">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={cn(
                "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 border transition-all min-h-[48px]",
                currentStep === 1
                  ? "opacity-30 cursor-not-allowed border-transparent text-slate-500"
                  : highContrast ? "bg-zinc-800 text-yellow-300 border-yellow-400" : "bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
              )}
              aria-label="Previous step"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStep === steps.length}
              className={cn(
                "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all min-h-[48px]",
                currentStep === steps.length
                  ? "opacity-30 cursor-not-allowed text-slate-500"
                  : highContrast ? "bg-yellow-400 text-black" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
              )}
              aria-label="Next step"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* KEYBOARD SHORTCUTS HELP BOX */}
        <div className={cn(
          "p-4 rounded-2xl border text-xs flex flex-wrap items-center justify-between gap-3",
          highContrast ? "bg-zinc-900 border-yellow-400/50 text-yellow-300" : "bg-slate-800/40 border-slate-700/40 text-slate-400"
        )}>
          <div className="flex items-center gap-2 font-bold">
            <HelpCircle className="w-4 h-4 text-indigo-400" /> Keyboard Shortcuts:
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
            <span><strong className="text-white">Space</strong>: Read / Pause</span>
            <span><strong className="text-white">→ / N</strong>: Next</span>
            <span><strong className="text-white">← / P</strong>: Previous</span>
            <span><strong className="text-white">M</strong>: Mute Voice</span>
            <span><strong className="text-white">I</strong>: Install</span>
          </div>
        </div>

      </div>
    </div>
  );
}
