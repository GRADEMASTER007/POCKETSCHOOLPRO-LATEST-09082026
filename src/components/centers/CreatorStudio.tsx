import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Music, Image as ImageIcon, Video, Mic, Loader2, Sparkles, AlertCircle, Play, Square, CheckCircle
} from "lucide-react";
import { useAuth } from "@/src/components/auth/AuthContext";

export default function CreatorStudio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"image" | "video" | "music" | "live">("image");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ type: string; url: string; data?: any } | null>(null);
  const [error, setError] = useState("");
  
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageSize, setImageSize] = useState("1K");

  // Audio/Live States
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const liveWsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError("");
    setResult(null);

    try {
      let endpoint = "";
      let payload: any = { prompt };

      if (activeTab === "image") {
        endpoint = "/api/creator/image";
        payload.aspectRatio = aspectRatio;
        payload.size = imageSize;
      } else if (activeTab === "video") {
        endpoint = "/api/creator/video";
        payload.aspectRatio = aspectRatio === "16:9" || aspectRatio === "9:16" ? aspectRatio : "16:9";
      } else if (activeTab === "music") {
        endpoint = "/api/creator/music";
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      if (activeTab === "music") {
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType });
        setResult({ type: "audio", url: URL.createObjectURL(blob), data: data.lyrics });
      } else if (activeTab === "image" || activeTab === "video") {
        setResult({ 
          type: activeTab, 
          url: `data:${data.mimeType};base64,${data.data}`
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleLiveAPI = async () => {
    if (isLiveConnected) {
      liveWsRef.current?.close();
      setIsLiveConnected(false);
      return;
    }

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;

      const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = inputAudioCtx;
      const outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputAudioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputAudioCtx.createMediaStreamSource(stream);
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert PCM to Base64
          const buffer = new ArrayBuffer(inputData.length * 2);
          const view = new DataView(buffer);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
          }
          
          let binary = '';
          const bytes = new Uint8Array(buffer);
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);
          ws.send(JSON.stringify({ audio: base64 }));
        }
      };

      ws.onopen = () => setIsLiveConnected(true);
      
      let nextStartTime = outputAudioCtx.currentTime;

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.audio) {
          // Decode Base64 to ArrayBuffer
          const binaryString = atob(msg.audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const pcmData = new Int16Array(bytes.buffer);
          const audioBuffer = outputAudioCtx.createBuffer(1, pcmData.length, 24000);
          const channelData = audioBuffer.getChannelData(0);
          for (let i = 0; i < pcmData.length; i++) {
            channelData[i] = pcmData[i] / 32768.0;
          }

          const sourceNode = outputAudioCtx.createBufferSource();
          sourceNode.buffer = audioBuffer;
          sourceNode.connect(outputAudioCtx.destination);
          
          const currentTime = outputAudioCtx.currentTime;
          if (nextStartTime < currentTime) {
             nextStartTime = currentTime;
          }
          sourceNode.start(nextStartTime);
          nextStartTime += audioBuffer.duration;
        }
        if (msg.interrupted) {
           // Handle interruption 
           nextStartTime = outputAudioCtx.currentTime;
        }
      };

      ws.onclose = () => {
        setIsLiveConnected(false);
        stream.getTracks().forEach(track => track.stop());
        processor.disconnect();
        source.disconnect();
      };
    } catch (err: any) {
      setError("Failed to connect to Live API: " + err.message);
    }
  };

  useEffect(() => {
    return () => {
      liveWsRef.current?.close();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            Creator Studio
          </h1>
          <p className="text-gray-500">Professional AI Media Generation</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { id: "image", icon: ImageIcon, label: "Image Studio" },
            { id: "video", icon: Video, label: "Video Studio" },
            { id: "music", icon: Music, label: "Music Studio" },
            { id: "live", icon: Mic, label: "Live Voice Assistant" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setResult(null); setError(""); setPrompt(""); }}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-indigo-50/50 text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "live" ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isLiveConnected ? "bg-indigo-100 shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)]" : "bg-gray-100"}`}>
                <Mic className={`w-12 h-12 ${isLiveConnected ? "text-indigo-600 animate-pulse" : "text-gray-400"}`} />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {isLiveConnected ? "Listening & Speaking..." : "Live Audio Conversation"}
                </h3>
                <p className="text-sm text-gray-500 max-w-md mt-2">
                  Connect to Gemini Live for a sub-second latency real-time voice conversation. Ask questions or brainstorm ideas aloud.
                </p>
              </div>
              <button
                onClick={toggleLiveAPI}
                className={`px-8 py-3 rounded-full font-medium flex items-center gap-2 transition-all ${
                  isLiveConnected 
                    ? "bg-red-50 text-red-600 hover:bg-red-100" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                }`}
              >
                {isLiveConnected ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                {isLiveConnected ? "Disconnect" : "Start Conversation"}
              </button>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-md">{error}</div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Describe the ${activeTab} you want to generate...`}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                {activeTab === "image" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                      <select 
                        value={aspectRatio} 
                        onChange={e => setAspectRatio(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200"
                      >
                        <option value="1:1">1:1 Square</option>
                        <option value="16:9">16:9 Widescreen</option>
                        <option value="9:16">9:16 Portrait</option>
                        <option value="4:3">4:3 Standard</option>
                        <option value="3:2">3:2 Classic</option>
                        <option value="21:9">21:9 Cinematic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Quality</label>
                      <select 
                        value={imageSize} 
                        onChange={e => setImageSize(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200"
                      >
                        <option value="1K">1K Standard</option>
                        <option value="2K">2K High Quality</option>
                        <option value="4K">4K Ultra HD</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === "video" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                      <select 
                        value={aspectRatio} 
                        onChange={e => setAspectRatio(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200"
                      >
                        <option value="16:9">16:9 Landscape</option>
                        <option value="9:16">9:16 Portrait</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                {isGenerating ? (
                  <div className="flex flex-col items-center text-gray-500">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                    <p className="font-medium animate-pulse">
                      {activeTab === "video" ? "Rendering video (may take up to 2 mins)..." : "Generating media..."}
                    </p>
                  </div>
                ) : result ? (
                  <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                    {result.type === "image" && (
                      <img src={result.url} alt="Generated" referrerPolicy="no-referrer" className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm" />
                    )}
                    {result.type === "video" && (
                      <video src={result.url} controls autoPlay loop className="max-w-full max-h-[500px] rounded-lg shadow-sm" />
                    )}
                    {result.type === "audio" && (
                      <div className="w-full max-w-md space-y-6">
                        <audio src={result.url} controls className="w-full" autoPlay />
                        {result.data && (
                          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm max-h-60 overflow-y-auto">
                            <h4 className="text-xs font-semibold uppercase text-gray-400 mb-2">Lyrics</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result.data}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    {activeTab === "image" && <ImageIcon className="w-12 h-12 mb-2 opacity-50" />}
                    {activeTab === "video" && <Video className="w-12 h-12 mb-2 opacity-50" />}
                    {activeTab === "music" && <Music className="w-12 h-12 mb-2 opacity-50" />}
                    <p>Your creation will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
