import React from "react";
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle, 
  Link as LinkIcon,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  variant?: "minimal" | "full" | "floating";
}

export default function SocialShare({ 
  url = window.location.origin, 
  title = "Pocket School Pro - The 4K AI Tutor for Africa",
  description = "Join thousands of learners mastering STEM with Grade Master Africa's AI tutor. Get started free!",
  variant = "full"
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareData = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const IconWrapper = ({ children, onClick, color, label }: any) => (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-all group relative flex items-center justify-center`}
      title={label}
    >
      <div className={`${color} group-hover:scale-110 transition-transform`}>
        {children}
      </div>
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {label}
      </span>
    </button>
  );

  if (variant === "floating") {
    return (
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 mx-auto mb-2"
            >
              <CheckCircle2 className="w-3 h-3" /> COPIED!
            </motion.div>
          )}
        </AnimatePresence>
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-2 rounded-2xl shadow-2xl flex flex-col gap-2">
          <IconWrapper onClick={() => window.open(shareData.whatsapp)} color="text-emerald-400" label="WhatsApp">
            <MessageCircle className="w-5 h-5" />
          </IconWrapper>
          <IconWrapper onClick={() => window.open(shareData.twitter)} color="text-sky-400" label="Twitter / X">
            <Twitter className="w-5 h-5" />
          </IconWrapper>
          <IconWrapper onClick={copyToClipboard} color="text-amber-400" label="Copy Link">
            <LinkIcon className="w-5 h-5" />
          </IconWrapper>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${variant === "minimal" ? "w-fit" : "w-full"}`}>
      {variant === "full" && (
        <div className="text-center space-y-1">
          <h4 className="text-sm font-black text-white uppercase tracking-tight">Share Pocket School Pro</h4>
          <p className="text-xs text-slate-400 font-medium italic">Help us reach more learners across the globe.</p>
        </div>
      )}
      
      <div className={`flex flex-wrap items-center justify-center gap-3`}>
        <IconWrapper onClick={() => window.open(shareData.whatsapp)} color="text-emerald-400" label="WhatsApp">
          <MessageCircle className="w-5 h-5" />
        </IconWrapper>
        <IconWrapper onClick={() => window.open(shareData.twitter)} color="text-sky-400" label="Twitter / X">
          <Twitter className="w-5 h-5" />
        </IconWrapper>
        <IconWrapper onClick={() => window.open(shareData.facebook)} color="text-blue-500" label="Facebook">
          <Facebook className="w-5 h-5" />
        </IconWrapper>
        <IconWrapper onClick={() => window.open(shareData.linkedin)} color="text-blue-400" label="LinkedIn">
          <Linkedin className="w-5 h-5" />
        </IconWrapper>
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-all flex items-center gap-2 text-xs font-bold ${copied ? "text-emerald-400" : "text-slate-300"}`}
        >
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
          {copied ? "Link Copied!" : "Copy App Link"}
        </button>
      </div>
    </div>
  );
}
