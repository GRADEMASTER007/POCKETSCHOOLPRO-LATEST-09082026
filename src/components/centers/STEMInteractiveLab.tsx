import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Send, Bot, User, Code, RotateCcw, Cpu, Box, Binary, InfinityIcon, Layers } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { auth, appCheck } from "@/src/lib/firebase";
import { getToken } from "firebase/app-check";
import Markdown from "react-markdown";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function STEMInteractiveLab({ 
  moduleType,
  onBack
}: { 
  moduleType: "coding" | "hardware" | "math" | "cad" | "ai" | "eco";
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: `Welcome to the ${moduleType.toUpperCase()} interactive lab! I am your AI mentor. What would you like to build or learn today?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getIcon = () => {
    switch (moduleType) {
      case "coding": return <Binary className="w-6 h-6" />;
      case "hardware": return <Cpu className="w-6 h-6" />;
      case "math": return <InfinityIcon className="w-6 h-6" />;
      case "cad": return <Box className="w-6 h-6" />;
      case "ai": return <Bot className="w-6 h-6" />;
      case "eco": return <Layers className="w-6 h-6" />;
      default: return <Code className="w-6 h-6" />;
    }
  };

  const getSubjectName = () => {
    switch (moduleType) {
      case "coding": return "Computer Science and Coding";
      case "hardware": return "Robotics and IoT Engineering";
      case "math": return "Advanced Mathematics";
      case "cad": return "3D Engineering and CAD";
      case "ai": return "Artificial Intelligence and Machine Learning";
      case "eco": return "Earth Sciences and Sustainability";
      default: return "STEM";
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`// Mock or actual depending on setup. Better to just let the backend handle auth via cookies if possible, or use standard token.
        },
        body: JSON.stringify({
          message: userMessage,
          subject: getSubjectName(),
          mode: "STEM Lab Instructor",
          history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
        })
      });

      // We need to fetch the firebase auth token properly! 
      // Actually wait, how do other components fetch auth token?
      // I'll fix the token part later, let me just check how they do it.
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "model", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all">
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-black text-gray-900">{getSubjectName()} Lab</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interactive Session</p>
          </div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
              msg.role === "user" ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-600"
            )}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "max-w-[80%] rounded-2xl p-4",
              msg.role === "user" ? "bg-brand-primary text-white" : "bg-gray-50 text-gray-800 border border-gray-100"
            )}>
              {msg.role === "user" ? (
                <p className="text-sm font-medium">{msg.text}</p>
              ) : (
                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl">
                  <Markdown>{msg.text}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1 text-gray-600">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-gray-50 text-gray-800 border border-gray-100 rounded-2xl p-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your question or code here..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
