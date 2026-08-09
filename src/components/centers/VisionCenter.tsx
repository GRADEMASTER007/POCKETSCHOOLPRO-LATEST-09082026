import { appCheck } from "@/src/lib/firebase";
import { getToken } from "firebase/app-check";
import { auth } from "@/src/lib/firebase";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  Scan, 
  Type, 
  Calculator, 
  HelpCircle, 
  Sparkles,
  Zap,
  RotateCw,
  Image as ImageIcon,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Brain,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/src/components/auth/AuthContext";
import { useBatterySaver } from "@/src/hooks/useBatterySaver";

export default function VisionCenter() {
  const { user } = useAuth();
  const { shouldConserveBattery } = useBatterySaver();
  const [activeMode, setActiveMode] = useState<"ocr" | "math" | "object">("ocr");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera feed when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (shouldConserveBattery && isCameraActive) {
      stopCamera();
      setError("Live camera preview was disabled to conserve battery.");
    }
  }, [shouldConserveBattery, isCameraActive]);

  const startCamera = async () => {
    if (shouldConserveBattery) {
      setError("Live camera preview is disabled to conserve battery. Please upload an image instead.");
      return;
    }
    try {
      setError(null);
      setImagePreview(null);
      setAnalysisResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError("Unable to access the camera. Please upload an image instead.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && isCameraActive) {
      setIsScanning(true);
      setLoadingStep("Capturing high-resolution viewport...");
      
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg");
        setImagePreview(base64);
        stopCamera();
        
        // Process captured image
        const rawBase64 = base64.split(",")[1];
        processImage(rawBase64, "image/jpeg");
      }
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Invalid file type. Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds the 5MB size limit. Please upload a smaller image.");
      return;
    }

    setError(null);
    setAnalysisResult(null);
    setIsScanning(true);
    setLoadingStep("Uploading image file (Max 5MB)...");

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      const rawBase64 = base64.split(",")[1];
      processImage(rawBase64, file.type);
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64Data: string, mimeType: string) => {
    try {
      setLoadingStep("Analyzing pixel matrix...");
      // Simulate academic checkpoints for gorgeous visual feedback
      const steps = [
        "Analyzing pixel matrix...",
        "Applying OCR text layout algorithms...",
        "Detecting document language...",
        "Formulating step-by-step LaTeX instructions..."
      ];
      
      let stepIdx = 0;
      const interval = setInterval(() => {
        stepIdx++;
        if (stepIdx < steps.length) {
          setLoadingStep(steps[stepIdx]);
        } else {
          clearInterval(interval);
        }
      }, 1500);

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`},
        body: JSON.stringify({
          image: base64Data,
          mimeType: mimeType,
          activeMode: activeMode,
          userId: user?.uid
        })
      });

      clearInterval(interval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Server failed to process homework.");
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Academic processing failed. Check your network or API Key settings.");
    } finally {
      setIsScanning(false);
      setLoadingStep("");
    }
  };

  const resetVisionCenter = () => {
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
    setIsScanning(false);
    stopCamera();
  };

  const modes = [
    { id: "ocr", icon: Type, label: "Text Scan", desc: "Read textbook chapters, identify languages, and summarize pages." },
    { id: "math", icon: Calculator, label: "Solve Math", desc: "Balance chemistry equations, solve integrations, and evaluate physics formulas." },
    { id: "object", icon: Scan, label: "Identify", desc: "Label biology organs, identify hardware chips, or analyze map topologies." },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12" id="vision-center-container">
      
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Grade Master <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-black uppercase">Universal Homework Help</span>
          </h1>
          <p className="text-gray-500 text-xs">Snap a photo of any textbook, math question, or biological chart to receive instant, step-by-step guidance.</p>
        </div>
        
        {/* Reset/New Scan Button */}
        {(imagePreview || analysisResult || error) && (
          <button
            onClick={resetVisionCenter}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
            id="btn-reset-vision"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Start New Scan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: Interactive Capture/Upload Zone (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Mode Selector */}
          <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Analysis Intent</span>
            <div className="flex flex-col gap-2">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setActiveMode(mode.id as any);
                    if (!imagePreview && !isCameraActive) setError(null);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer",
                    activeMode === mode.id 
                      ? "bg-brand-primary/5 border-brand-primary text-brand-primary shadow-sm" 
                      : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                  )}
                  id={`btn-mode-${mode.id}`}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                    activeMode === mode.id ? "bg-brand-primary text-white" : "bg-gray-50 text-gray-500"
                  )}>
                    <mode.icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black uppercase tracking-wide">{mode.label}</h3>
                    <p className="text-[10px] text-gray-400 leading-normal">{mode.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Capture Stage Container */}
          <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            
            {/* 1. Camera Live feed */}
            {isCameraActive && !imagePreview && (
              <div className="w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden relative shadow-inner border border-gray-200">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                
                {/* Visual scan sweep animation */}
                <div className="absolute inset-x-0 h-1.5 bg-brand-primary/80 shadow-[0_0_12px_#1a56df] animate-bounce top-1/2" />

                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3 px-4">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 py-3 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 pointer-events-auto cursor-pointer shadow-lg"
                    id="btn-capture-snapshot"
                  >
                    <Camera className="w-4 h-4 text-brand-primary" /> Capture Snapshot
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-3 bg-black/60 backdrop-blur-md text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black/80 transition-all cursor-pointer border border-white/10"
                    id="btn-cancel-camera"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* 2. Drag-and-drop / select interface */}
            {!isCameraActive && !imagePreview && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer",
                  isDragging 
                    ? "border-brand-primary bg-brand-primary/5" 
                    : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300"
                )}
                id="drag-drop-upload-zone"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">Drag textbook image here</h4>
                <p className="text-[10px] text-gray-400 mt-1 max-w-[15rem] leading-normal">
                  Supports JPEG, PNG up to 5MB. Or click to select standard device photo.
                </p>

                <div className="flex items-center gap-2 mt-4">
                  <div className="h-px w-8 bg-gray-200" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">OR</span>
                  <div className="h-px w-8 bg-gray-200" />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startCamera();
                  }}
                  className="mt-4 px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer"
                  id="btn-trigger-camera"
                >
                  <Camera className="w-3.5 h-3.5" /> Start Live Camera
                </button>
              </div>
            )}

            {/* 3. Image preview state */}
            {imagePreview && (
              <div className="w-full aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100 flex items-center justify-center">
                <img 
                  src={imagePreview} 
                  alt="Homework preview" 
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20" />
                
                {/* scanning state overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full mb-3"
                    />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">
                      {loadingStep}
                    </span>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COMPONENT: Output Solved Arena / Guidance (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          
          {/* Main output box */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex-1 flex flex-col justify-between min-h-[30rem]">
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">AI Solved Response</h3>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Aristotle Core V3</span>
                </div>
              </div>

              {/* Error messages */}
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800" id="vision-error-box">
                  <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">Academic Processing Error</h4>
                    <p className="text-[11px] mt-1 leading-normal">{error}</p>
                  </div>
                </div>
              )}

              {/* Content output render */}
              {analysisResult ? (
                <div className="prose prose-sm max-w-none text-xs text-gray-700 leading-relaxed space-y-4" id="vision-analysis-result">
                  <div className="markdown-body p-4 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-inner select-all">
                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                  </div>
                </div>
              ) : !isScanning && !error ? (
                <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center h-full">
                  <HelpCircle className="w-12 h-12 text-gray-300 mb-3" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-600">No Image Scanned Yet</h4>
                  <p className="text-[10px] text-gray-400 mt-1.5 max-w-[20rem] leading-normal mx-auto">
                    Choose an analysis pathway, turn on your device camera or upload a textbook photo, and let Grade Master do the math!
                  </p>
                </div>
              ) : isScanning ? (
                <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center h-full space-y-4 animate-pulse">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <Sparkles className="w-6 h-6 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800">Processing Workspace</h4>
                    <p className="text-[10px] text-gray-400 mt-1 max-w-[20rem] leading-normal mx-auto">
                      Gemini is generating step-by-step LaTeX formulas and multi-language academic annotations. This takes about 5 seconds...
                    </p>
                  </div>
                </div>
              ) : null}

            </div>

            {/* Footer guarantee bar */}
            <div className="border-t border-gray-50 pt-4 mt-6 flex justify-between items-center text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">
              <span>📚 Covers caps, cambridge & IEB pathways</span>
              <span>Aristotle Edu Verified • 100% Free</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
