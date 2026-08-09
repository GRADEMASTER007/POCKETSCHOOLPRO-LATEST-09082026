import React, { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  BookOpen, Bot, FileText, Cpu, Calculator, NotebookPen, 
  Image as ImageIcon, Search, CheckCircle2, Languages, Clock, ArrowRight, Video
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const GUIDE_SECTIONS = [
  {
    id: "tutor",
    title: "AI Tutor (Aristotle)",
    icon: Bot,
    color: "bg-indigo-50 text-indigo-600",
    content: "Aristotle is your personal, 24/7 AI tutor. Engage in conversational learning across any subject. Use the tutor to ask complex questions, request explanations, or solve problems step-by-step using the Socratic method. You can customize Aristotle's teaching style in your Profile Settings."
  },
  {
    id: "stem",
    title: "STEM Hub",
    icon: Cpu,
    color: "bg-emerald-50 text-emerald-600",
    content: "A comprehensive toolkit for science, technology, engineering, and mathematics. Access the Advanced Calculator for complex equations, the Universal Converter for unit conversions, and interactive labs covering Coding, Hardware, Math, CAD, AI, and Earth Science."
  },
  {
    id: "curriculum",
    title: "Curriculum Hub",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600",
    content: "Explore structured learning paths. Select your subject to view the syllabus, interact with subject-specific AI labs, and track your performance. The hub aligns with educational standards to keep your studies on track."
  },
  {
    id: "notebook",
    title: "Smart Notebook",
    icon: NotebookPen,
    color: "bg-purple-50 text-purple-600",
    content: "Take rich, formatted notes and let AI enhance them. You can instantly generate summaries, flashcards, and practice quizzes directly from your notes. Organize your notes with tags and search through them effortlessly."
  },
  {
    id: "documents",
    title: "Document Center",
    icon: FileText,
    color: "bg-rose-50 text-rose-600",
    content: "Upload your PDFs, study guides, and research papers. The AI can summarize long documents and answer specific questions about the content, making it easier to digest large amounts of information quickly."
  },
  {
    id: "vision",
    title: "Vision Center",
    icon: ImageIcon,
    color: "bg-orange-50 text-orange-600",
    content: "Upload images of handwritten notes, diagrams, or textbook pages. The AI will analyze the image, extract the text, and explain the concepts visually represented in your uploads."
  },
  {
    id: "research",
    title: "Research Hub",
    icon: Search,
    color: "bg-cyan-50 text-cyan-600",
    content: "Conduct academic research with AI assistance. Search across Scholar, PubMed, arXiv, and other databases. The AI helps synthesize findings and formats citations for your papers."
  },
  {
    id: "productivity",
    title: "Productivity & Focus",
    icon: Clock,
    color: "bg-amber-50 text-amber-600",
    content: "Stay on top of your tasks with the built-in Pomodoro timer and task manager. Track your study sessions, maintain focus, and manage your daily goals effectively."
  },
  {
    id: "languages",
    title: "Sign Language Center",
    icon: Languages,
    color: "bg-teal-50 text-teal-600",
    content: "Learn South African Sign Language (SASL) through interactive flashcards and quizzes. Master the alphabet, basic phrases, and improve your accessibility skills."
  },
  {
    id: "creator",
    title: "Creator Studio",
    icon: Video,
    color: "bg-pink-50 text-pink-600",
    content: "Unleash your creativity. Generate educational videos, compose music, create images, and transcribe audio using powerful generative AI tools."
  }
];

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState(GUIDE_SECTIONS[0].id);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 mb-4">
            Platform Guide
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Learn how to maximize your learning experience with Grade Master Africa's suite of AI-powered educational tools.
          </p>
        </div>
        
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-brand-primary/5 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {GUIDE_SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all",
                  isActive 
                    ? "bg-white border border-gray-200 shadow-sm text-gray-900" 
                    : "hover:bg-gray-50 text-gray-500 hover:text-gray-900"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  isActive ? section.color : "bg-gray-100 text-gray-400"
                )}>
                  <section.icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm">{section.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12 min-h-[500px]">
            {GUIDE_SECTIONS.map((section) => section.id === activeSection && (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-6 pb-8 border-b border-gray-50">
                  <div className={cn("w-20 h-20 rounded-[1.5rem] flex items-center justify-center", section.color)}>
                    <section.icon className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-black text-gray-900">{section.title}</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Feature Overview</p>
                  </div>
                </div>

                <div className="prose prose-lg prose-indigo max-w-none text-gray-600 leading-relaxed">
                  <p>{section.content}</p>
                </div>

                <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                  <Link 
                    to={section.id === 'tutor' ? '/tutor' : `/${section.id}`}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-all"
                  >
                    Open {section.title}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
