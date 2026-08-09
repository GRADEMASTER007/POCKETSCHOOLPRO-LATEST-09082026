import React, { useState } from "react";
import { ChevronDown, MessageCircle, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const faqs = [
  {
    category: "General",
    questions: [
      { q: "What is Grade Master Africa?", a: "Grade Master Africa is an AI-powered educational ecosystem designed specifically for African students. It features Aristotle, a CAPS-aligned AI tutor, along with STEM labs, document analysis, and collaborative study rooms." },
      { q: "Is Grade Master Africa free to use?", a: "We offer a Free Tier which includes basic access to the Aristotle AI tutor, standard flashcards, and the Curriculum Hub. For advanced features like Voice Mode, unlimited document analysis, and Premium STEM simulations, you can upgrade to Pocket School Pro." },
      { q: "Do I need internet access to use the app?", a: "While an active internet connection is required to communicate with the live AI tutor, Grade Master Africa is built as a Progressive Web App (PWA). Once installed on your device, certain cached tools (like your offline notes and saved flashcards) can be accessed without internet." }
    ]
  },
  {
    category: "Aristotle AI Tutor",
    questions: [
      { q: "How accurate is the AI tutor?", a: "Aristotle is powered by Advanced AI and has been specifically prompted to align with the South African CAPS curriculum. While highly accurate for educational purposes, AI can occasionally make mistakes. We always encourage verifying important facts." },
      { q: "Can Aristotle write my essays for me?", a: "No. Aristotle is designed as a Socratic tutor. It will guide you, provide structure, explain concepts, and give feedback on your writing, but it is programmed to refuse requests to do your assignments for you." },
      { q: "What subjects does Aristotle cover?", a: "Aristotle can assist with Mathematics, Physical Sciences, Life Sciences, History, Geography, Languages, Accounting, and more, ranging from Grade 1 up to University level." }
    ]
  },
  {
    category: "Account & Billing",
    questions: [
      { q: "How do I upgrade to Premium?", a: "You can upgrade by visiting the 'Premium' section in the sidebar. We support payments via Yoco (for local South African cards) and Stripe." },
      { q: "Can I sponsor a student?", a: "Yes! Through our 'Sponsor a Student' program in the Premium section, you can pay for a subscription that will be granted to a learner from an under-resourced school." },
      { q: "How do I delete my account?", a: "You can delete your account by going to Settings > Profile and clicking 'Delete Account'. All your personal data will be permanently removed from our servers." }
    ]
  }
];

export default function QAPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-brand-primary/10 text-brand-primary mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-500">Everything you need to know about Grade Master Africa.</p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, catIdx) => (
            <div key={catIdx} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">{category.category}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {category.questions.map((faq, qIdx) => {
                  const id = `${catIdx}-${qIdx}`;
                  const isOpen = openIndex === id;
                  return (
                    <div key={qIdx} className="p-8">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : id)}
                        className="flex w-full items-start justify-between text-left focus:outline-none group"
                      >
                        <span className="text-lg font-bold text-gray-900 group-hover:text-brand-primary transition-colors pr-6">
                          {faq.q}
                        </span>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border transition-all shrink-0",
                          isOpen ? "bg-brand-primary border-brand-primary text-white" : "border-gray-200 text-gray-400 group-hover:border-brand-primary"
                        )}>
                          <ChevronDown className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")} />
                        </div>
                      </button>
                      {isOpen && (
                        <div className="mt-4 text-gray-600 leading-relaxed pr-12 animate-in slide-in-from-top-2 fade-in duration-200">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-brand-primary text-white rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <MessageCircle className="w-32 h-32" />
          </div>
          <h2 className="text-2xl font-bold mb-4 relative z-10">Still have questions?</h2>
          <p className="text-brand-primary-light mb-8 relative z-10">Our support team is ready to help you with any issues.</p>
          <Link 
            to="/contact" 
            className="inline-block px-8 py-4 bg-white text-brand-primary font-bold rounded-2xl hover:bg-gray-50 transition-colors shadow-lg relative z-10"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
