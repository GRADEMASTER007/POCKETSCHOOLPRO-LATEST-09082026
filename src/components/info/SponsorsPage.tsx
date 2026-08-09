import React from "react";
import { motion } from "motion/react";
import { 
  Heart, 
  Award, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  Mail, 
  Phone, 
  TrendingUp, 
  BookOpen, 
  Users, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface Sponsor {
  name: string;
  description: string;
  website?: string;
  category: "Foundational Partner" | "Sponsor" | "Contributor";
  color: string;
  textColor: string;
  borderColor: string;
  bgLight: string;
  initials: string;
}

const CURRENT_SPONSORS: Sponsor[] = [
  {
    name: "DFSA (Dragon Fruit South Africa)",
    description: "Empowering agricultural innovation, community development, and educational enrichment programs for children and youth across South Africa.",
    website: "https://purelyhealthnutra.com/", // Add website address as requested
    category: "Foundational Partner",
    color: "bg-rose-500",
    textColor: "text-rose-600",
    borderColor: "border-rose-100",
    bgLight: "bg-rose-50/50",
    initials: "DF"
  },
  {
    name: "Wonderful Dragon Fruit",
    description: "Pioneering sustainable and premium dragon fruit cultivation while actively championing organic nutrition and localized youth education initiatives.",
    website: "https://wonderfuldragonfruit.com/",
    category: "Foundational Partner",
    color: "bg-indigo-500",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-100",
    bgLight: "bg-indigo-50/50",
    initials: "WD"
  },
  {
    name: "Healthy Fields",
    description: "Nurturing healthy crops, food security, and investing deeply in the digital literacy and school resources of South African children.",
    category: "Sponsor",
    color: "bg-emerald-500",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-100",
    bgLight: "bg-emerald-50/50",
    initials: "HF"
  },
  {
    name: "ProAgriSA",
    description: "The leading agricultural media platform, bridging farming knowledge with secondary education and sustainable community upliftment.",
    category: "Sponsor",
    color: "bg-amber-500",
    textColor: "text-amber-600",
    borderColor: "border-amber-100",
    bgLight: "bg-amber-50/50",
    initials: "PA"
  },
  {
    name: "Purely Health Nutra",
    description: "Formulating pure wellness and nutritional supplements, dedicated to improving the physical well-being, focus, and energy of hard-working students.",
    website: "https://purelyhealthnutra.com/",
    category: "Foundational Partner",
    color: "bg-sky-500",
    textColor: "text-sky-600",
    borderColor: "border-sky-100",
    bgLight: "bg-sky-50/50",
    initials: "PH"
  }
];

export default function SponsorsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto px-4 pb-24 space-y-16"
      id="sponsors-page-container"
    >
      {/* 1. HEADER & HERO TEXT */}
      <header className="text-center max-w-3xl mx-auto space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-xs font-bold uppercase tracking-widest">
          <Heart className="w-3.5 h-3.5 fill-current" />
          Our Sponsors & Partners
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Thank you for powering the <span className="text-brand-primary">Next Generation</span>
        </h1>
        <p className="text-gray-500 text-sm md:text-base leading-relaxed">
          At <strong className="text-gray-900 font-semibold">Grade Master</strong>, we believe every little bit helps to keep educational information in the hands of students who need it most. Our mission is made possible through the generous backing of visionary brands and individuals who believe in the power of accessible digital education.
        </p>
      </header>

      {/* 2. CURRENT SPONSORS (THE HONOUR ROLL) */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            The Honour Roll
          </h2>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Our Foundational Supporters & Patrons
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CURRENT_SPONSORS.map((sponsor, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={sponsor.name}
              className={`bg-white p-6 rounded-[2.5rem] border ${sponsor.borderColor} shadow-sm hover:shadow-md transition-all flex flex-col justify-between group`}
            >
              <div className="space-y-4">
                {/* Sponsor Identity */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${sponsor.color} text-white font-bold rounded-2xl flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform`}>
                    {sponsor.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-brand-primary transition-colors">
                      {sponsor.name}
                    </h3>
                    <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${sponsor.bgLight} ${sponsor.textColor}`}>
                      {sponsor.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed">
                  {sponsor.description}
                </p>
              </div>

              {/* Website link */}
              {sponsor.website ? (
                <div className="mt-6 pt-4 border-t border-gray-50">
                  <a
                    href={sponsor.website}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
                  >
                    Visit Website
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="mt-6 pt-4 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400 font-medium italic">
                    Foundational Sponsor
                  </span>
                </div>
              )}
            </motion.div>
          ))}

          {/* Interactive placeholder slot for next sponsor */}
          <div className="bg-dashed border-2 border-dashed border-gray-200 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center space-y-4 bg-gray-50/20 hover:bg-gray-50/50 transition-colors">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Your Logo Here</h3>
              <p className="text-[11px] text-gray-400 max-w-[200px] mt-1">
                We have room for many more visionary sponsors and donators!
              </p>
            </div>
            <Link
              to="/subscription"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary bg-brand-primary/5 px-3 py-1.5 rounded-full hover:bg-brand-primary/10 transition-colors"
            >
              Claim Slot
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. THE VISION & WHY WE NEED YOU (THE PITCH) */}
      <section className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <TrendingUp className="w-64 h-64" />
        </div>
        
        <div className="max-w-3xl space-y-8 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            The Vision & Our Journey
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
              We are just at the beginning.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Grade Master is on a relentless quest to democratize education. We have an extensive pipeline of groundbreaking features and major developments planned—including advanced localized curriculum modules, localized audio-guided learning, and deep offline synchronization—to expand quality educational resources to students of all ages across underserved communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-primary">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-100">Massive Social Impact</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowering corporate, private, or organizational sponsorship directly uplifts youth education, generating a powerful, long-term positive shift in our regional economies.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-primary">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-100">Uplifting Classrooms</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                By donating, you put instant AI tutoring, real-time feedback, and adaptive study notebooks into the hands of children who otherwise lack access to tutoring.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-primary">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-100">Absolute Integrity</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We strictly commit to operational efficiency, ensuring all premium and sponsorship revenue goes directly into supporting localized infrastructure, teacher resources, and school programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BECOME A SPONSOR / CALL TO ACTION (CTA) */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-10 shadow-sm text-center space-y-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Join Our Mission as a Sponsor
          </h2>
          <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
            Whether you are a private individual wishing to fund a classroom, a local business investing in your community, or an international organization—your sponsorship has an immediate, verifiable impact. 
          </p>
          <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
            To show our immense appreciation, <strong className="text-gray-900">we feature our sponsors' names and company logos</strong> in our official social media posts, community newsletters, and primary app marketing campaigns.
          </p>
        </div>

        {/* Contact Info Placeholders */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
          <a
            href="mailto:sponsors@grademaster.africa"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-150 text-gray-700 font-bold rounded-2xl text-xs transition-all"
          >
            <Mail className="w-4 h-4 text-gray-400" />
            sponsors@grademaster.africa
          </a>
          <a
            href="https://wa.me/27821234567"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 text-emerald-800 font-bold rounded-2xl text-xs transition-all"
          >
            <Phone className="w-4 h-4 text-emerald-500" />
            +27 (0) 82 123 4567
          </a>
        </div>

        {/* Primary CTA link redirecting to the Subscription/Sponsorship checkout */}
        <div className="pt-4 border-t border-gray-50 max-w-sm mx-auto">
          <Link
            to="/subscription"
            className="w-full py-4 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md text-xs uppercase tracking-wider"
          >
            Sponsor a Student / Donate Today
            <ArrowRight className="w-4 h-4 text-brand-primary" />
          </Link>
          <span className="block text-[10px] text-gray-400 mt-2 font-medium">
            Immediate secure credit card checkout & transparent reporting.
          </span>
        </div>
      </section>
    </motion.div>
  );
}
