import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Send, Bot, User, Code, RotateCcw, BookOpen } from "lucide-react";
import { cn } from "@/src/lib/utils";
import Markdown from "react-markdown";
import { auth, appCheck } from "@/src/lib/firebase";
import { getToken } from "firebase/app-check";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function SubjectInteractiveLab({ 
  subjectId
}: { 
  subjectId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: `Welcome to the interactive lab for ${subjectId.toUpperCase()}! I am your AI tutor. Ask me any questions, or let me guide you through an interactive learning scenario.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`},
        body: JSON.stringify({
          message: userMessage,
          subject: subjectId,
          mode: "tutor",
          history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: "model", text: data.reply || "I didn't get that." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "model", text: "Sorry, I encountered an error connecting to the learning engine. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[700px] w-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-gray-900">{subjectId.toUpperCase()} Tutor</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interactive AI Session</p>
          </div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
              msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
            )}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "max-w-[80%] rounded-2xl p-4",
              msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-800 border border-gray-100"
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
            placeholder="Type your question or learning topic here..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
