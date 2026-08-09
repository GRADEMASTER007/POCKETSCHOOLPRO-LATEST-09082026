import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface Metadata {
  title: string;
  description: string;
  keywords?: string;
}

const METADATA_MAP: Record<string, Metadata> = {
  "/": {
    title: "Student Dashboard | Grade Master Africa",
    description: "Access your personalized student dashboard. Track your academic progress, view assignments, manage study tasks, and explore smart educational tools.",
    keywords: "student dashboard, academic progress, study tasks, educational tools, AI dashboard"
  },
  "/tutor": {
    title: "Aristotle AI Tutor | Grade Master Africa",
    description: "Get 1-on-1 personalized academic tutoring and detailed homework help. Aristotle AI is your tireless, round-the-clock academic mentor.",
    keywords: "AI tutor, Aristotle AI, personalized tutoring, homework help, academic mentor, Grade Master Africa"
  },
  "/documents": {
    title: "Document Center | Grade Master Africa",
    description: "Upload, analyze, and summarize your academic papers, text documents, and Documents. Extract bullet points and study material instantly using Gemini AI.",
    keywords: "document center, summarize academic papers, Gemini AI, study material extractor, text document analysis"
  },
  "/notebook": {
    title: "Smart Notebook & Voice Dictation | Grade Master Africa",
    description: "Dictate study notes hands-free, organize academic tasks, and generate flashcards with spaced repetition in our interactive Smart Notebook.",
    keywords: "smart notebook, voice dictation, hands-free notes, spaced repetition, flashcards"
  },
  "/vision": {
    title: "Vision Center AI | Grade Master Africa",
    description: "Analyze academic diagrams, textbook graphs, handwriting, and visual homework assignments with instant computer vision AI explanation.",
    keywords: "vision center AI, computer vision, diagram analysis, textbook graphs, handwriting recognition"
  },
  "/research": {
    title: "Research Hub & Literature Review | Grade Master Africa",
    description: "Explore global academic research papers, check peer-reviewed citations, and utilize AI summarizers to digest complex literature reviews.",
    keywords: "research hub, literature review, academic papers, peer-reviewed citations, AI summarizers"
  },
  "/productivity": {
    title: "Productivity Suite | Grade Master Africa",
    description: "Boost your academic output with standard Pomodoro focus timers, active recall flashcard systems, and exam countdown schedules.",
    keywords: "productivity suite, pomodoro timer, active recall, flashcards, exam countdown, student productivity"
  },
  "/stem": {
    title: "STEM Solver & Hub | Grade Master Africa",
    description: "Break down complex math, physics, chemistry, and engineering questions with detailed, step-by-step interactive AI-guided solvers.",
    keywords: "STEM solver, math solver, physics, chemistry, engineering, AI-guided solutions"
  },
  "/language": {
    title: "Language Learning Hub | Grade Master Africa",
    description: "Learn new languages, practice vocabulary, practice translation, and build multilingual proficiency with real-time feedback.",
    keywords: "language learning, practice vocabulary, translation, multilingual proficiency, learn languages"
  },
  "/study-room": {
    title: "Collaborative Study Rooms | Grade Master Africa",
    description: "Join shared, real-time study rooms to collaborate with peers, chat synchronously, share notes, and boost collaborative focus.",
    keywords: "collaborative study rooms, real-time study, shared notes, student chat, collaborative focus"
  },
  "/teacher": {
    title: "Teacher Dashboard | Grade Master Africa",
    description: "Monitor classroom insights, track group academic metrics, and configure curriculum targets for your student cohorts.",
    keywords: "teacher dashboard, classroom insights, academic metrics, curriculum targets, teacher tools"
  },
  "/parent": {
    title: "Parent Portal | Grade Master Africa",
    description: "Stay connected with your child's learning journey, review progress analytics, and support their academic goals.",
    keywords: "parent portal, student progress analytics, academic support, parent dashboard"
  },
  "/admin": {
    title: "System Administration | Grade Master Africa",
    description: "Manage global user settings, security parameters, system telemetry, and application configurations.",
    keywords: "system administration, global user settings, security, system telemetry"
  },
  "/subscription": {
    title: "Premium Subscription Plan | Grade Master Africa",
    description: "Unlock unlimited access to high-tier AI tutoring, advanced Vision analysis, and unlimited Document cloud storage.",
    keywords: "premium subscription, unlimited access, high-tier AI tutoring, document cloud storage"
  },
  "/profile": {
    title: "My Student Profile | Grade Master Africa",
    description: "Configure your academic grade preferences, choose curriculum standards, and adjust personal user preferences.",
    keywords: "student profile, academic preferences, curriculum standards, personal settings"
  },
  "/safety": {
    title: "Emergency Support & Safety | Grade Master Africa",
    description: "Access instant student support resources, mental health hotlines, and digital well-being guidance.",
    keywords: "emergency support, safety, student support, mental health hotlines, well-being guidance"
  },
  "/features": {
    title: "Ecosystem Features | Grade Master Africa",
    description: "Discover all the smart educational tools, AI features, and collaborative capabilities in Grade Master Africa.",
    keywords: "educational tools, AI features, collaborative capabilities, Grade Master Africa features"
  },
  "/qa": {
    title: "Frequently Asked Questions | Grade Master Africa",
    description: "Find clear answers about Aristotle AI, Advanced Integration, offline capabilities, and study tools.",
    keywords: "FAQ, frequently asked questions, Aristotle AI, offline capabilities, study tools"
  },
  "/privacy": {
    title: "Privacy Policy | Grade Master Africa",
    description: "Learn how we protect student privacy, secure educational data, and handle system credentials responsibly.",
    keywords: "privacy policy, student privacy, secure educational data, data protection"
  },
  "/terms": {
    title: "Terms of Service | Grade Master Africa",
    description: "Review our student guidelines, code of conduct, and academic integrity terms.",
    keywords: "terms of service, student guidelines, code of conduct, academic integrity"
  },
  "/guide": {
    title: "Student User Guide | Grade Master Africa",
    description: "Get step-by-step guidance on how to make the most of AI tutoring, smart note-taking, and active recall study strategies.",
    keywords: "student user guide, AI tutoring guide, note-taking guide, study strategies"
  },
  "/accessibility": {
    title: "Accessibility Adjustments | Grade Master Africa",
    description: "Configure custom dyslexia-friendly fonts, reading assists, high contrast visual options, and auditory controls.",
    keywords: "accessibility adjustments, dyslexia-friendly fonts, high contrast, auditory controls, reading assists"
  },
  "/seo": {
    title: "SEO & SERP Intelligence Radar | Grade Master Africa",
    description: "Monitor real-time search volume, long-tail educational keywords, AI search crawler status, and viral social hashtags across SADC & African regions.",
    keywords: "SEO intelligence, SERP radar, educational search volume, SADC keywords, AI crawlers, viral hashtags, Grade Master Africa"
  },
  "/sponsor": {
    title: "Sponsor a Child & Learner | Grade Master Africa",
    description: "Empower underprivileged African students with 4K AI academic tutoring. Sponsor Basic, Plus, Standard, or Gold VIP passes for learners across South Africa & SADC.",
    keywords: "sponsor a child, sponsor learner education, African education charity, AI tutor sponsorship, South Africa student pass, Grade Master Africa"
  },
  "/donate": {
    title: "Donate to App Development | Grade Master Africa",
    description: "Fund open AI educational infrastructure, Gemini 1.5 model tokens, voice synthesizers, and accessibility expansion for Grade Master Africa.",
    keywords: "donate app development, AI education fund, support African learners, South Africa education donation, Pocket School Pro"
  },
};

/**
 * Helper to dynamically inject or update a meta tag in the document head
 */
export function updateMetaTag(attributeName: string, attributeValue: string, content: string) {
  if (typeof document === "undefined") return;

  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/**
 * Reusable central hook that automatically updates page title, meta description, and Open Graph tags.
 * Updates are triggered on route transition and can be imperatively updated for dynamic content.
 */
export function useDocumentMetadata() {
  const location = useLocation();

  const setMetadata = (title: string, description: string, keywords?: string) => {
    if (typeof document === "undefined") return;

    // 1. Update document title
    document.title = title;

    // 2. Update standard meta description
    updateMetaTag("name", "description", description);

    // 3. Update keywords if provided
    if (keywords) {
      updateMetaTag("name", "keywords", keywords);
    }

    // 4. Update Open Graph tags for social sharing
    updateMetaTag("property", "og:title", title);
    updateMetaTag("property", "og:description", description);
    updateMetaTag("property", "og:url", window.location.href);
  };

  useEffect(() => {
    const path = location.pathname;
    const meta = METADATA_MAP[path];

    if (meta) {
      setMetadata(meta.title, meta.description, meta.keywords);
    } else {
      // Fallback default meta
      setMetadata(
        "Grade Master Africa | AI-Powered Educational Ecosystem",
        "Empower your studies with Aristotle AI tutor, document summarizers, smart notebooks, collaborative study rooms, and personalized interactive pathways.",
        "Grade Master Africa, AI tutor, educational app, Africa education, study planner, homework help, Advanced AI, personalized learning, online tutoring"
      );
    }
  }, [location.pathname]);

  return {
    setDynamicMetadata: (customTitle: string, customDescription: string, customKeywords?: string) => {
      setMetadata(customTitle, customDescription, customKeywords);
    },
  };
}
