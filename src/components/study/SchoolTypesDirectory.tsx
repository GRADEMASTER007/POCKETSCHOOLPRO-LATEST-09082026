import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Search, 
  GraduationCap, 
  Wrench, 
  HeartHandshake, 
  Trophy, 
  Compass, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Users, 
  ChevronRight,
  Info,
  X,
  Bot
} from "lucide-react";
import { SCHOOL_TYPES_KNOWLEDGEBASE, SchoolTypeDefinition } from "@/src/lib/knowledgebase";
import { cn } from "@/src/lib/utils";

const CATEGORY_META = [
  { id: "all", name: "All School Types", icon: Building2, color: "bg-blue-500 text-white" },
  { id: "general_standard", name: "General & Standard", icon: GraduationCap, color: "bg-indigo-500 text-white" },
  { id: "specialized_vocational", name: "Specialized & Vocational", icon: Wrench, color: "bg-amber-500 text-white" },
  { id: "special_needs_support", name: "Special Needs & Support", icon: HeartHandshake, color: "bg-emerald-500 text-white" },
  { id: "arts_culture_sports", name: "Arts, Culture & Sports", icon: Trophy, color: "bg-rose-500 text-white" },
  { id: "alternative_faith", name: "Alternative & Faith-Based", icon: Compass, color: "bg-purple-500 text-white" },
];

export default function SchoolTypesDirectory() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalSchool, setActiveModalSchool] = useState<SchoolTypeDefinition | null>(null);

  // Flatten all schools
  const allSchools = useMemo(() => {
    const list: SchoolTypeDefinition[] = [];
    Object.values(SCHOOL_TYPES_KNOWLEDGEBASE).forEach(cat => {
      cat.schools.forEach(school => list.push(school));
    });
    return list;
  }, []);

  // Filtered list
  const filteredSchools = useMemo(() => {
    let result = allSchools;

    if (selectedCategory !== "all") {
      const categoryData = SCHOOL_TYPES_KNOWLEDGEBASE[selectedCategory];
      result = categoryData ? categoryData.schools : [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(school => 
        school.name.toLowerCase().includes(query) ||
        school.subtitle.toLowerCase().includes(query) ||
        school.description.toLowerCase().includes(query) ||
        school.category.toLowerCase().includes(query) ||
        school.keyFeatures.some(f => f.toLowerCase().includes(query)) ||
        school.curriculumFocus.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allSchools, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Category Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-widest text-indigo-200 border border-white/10">
            <Sparkles className="w-4 h-4 text-amber-300" />
            National Academic Institutions Directory
          </div>

          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-tight">
            Institutional School Taxonomy & Features
          </h2>

          <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed">
            Explore South Africa and Africa's 18 core school classifications — from mainstream public & private academies to specialized TVET trade colleges, remedial support centers, sports/arts academies, and alternative co-operatives.
          </p>
        </div>

        {/* Search & Stats Bar */}
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schools (e.g., Boarding, TVET, Remedial, Sport)..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 text-white placeholder-slate-400 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>18 School Types</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>5 Core Categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_META.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 border",
                isActive
                  ? "bg-brand-primary text-white border-transparent shadow-lg shadow-brand-primary/20 scale-[1.02]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              )}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Category Context Banner if single category chosen */}
      {selectedCategory !== "all" && SCHOOL_TYPES_KNOWLEDGEBASE[selectedCategory] && (
        <div className="p-6 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-900 text-sm flex items-start gap-4">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-indigo-950 mb-1">
              {SCHOOL_TYPES_KNOWLEDGEBASE[selectedCategory].categoryName}
            </span>
            <p className="text-indigo-800 text-xs leading-relaxed">
              {SCHOOL_TYPES_KNOWLEDGEBASE[selectedCategory].categoryDescription}
            </p>
          </div>
        </div>
      )}

      {/* Grid of School Type Cards */}
      {filteredSchools.length === 0 ? (
        <div className="p-16 rounded-[2.5rem] bg-white border border-slate-100 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No School Types Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            No institutional classifications matched your search query "{searchQuery}". Try searching for trade, board, or special needs.
          </p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => (
            <motion.div
              key={school.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-200/80 p-7 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
            >
              <div className="space-y-4">
                {/* Category Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {school.category}
                  </span>
                  <button
                    onClick={() => setActiveModalSchool(school)}
                    className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                    title="View details"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-xl font-display font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {school.name}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-600 mt-1">
                    {school.subtitle}
                  </p>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {school.description}
                </p>

                {/* Core Features Preview */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Key Features
                  </span>
                  <ul className="space-y-1.5">
                    {school.keyFeatures.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                  <Bot className="w-4 h-4 text-indigo-500" />
                  <span>AI Tutor Mode Ready</span>
                </div>

                <button
                  onClick={() => setActiveModalSchool(school)}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>Explore Features</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal for detailed breakdown */}
      <AnimatePresence>
        {activeModalSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-slate-100 space-y-6 relative"
            >
              <button
                onClick={() => setActiveModalSchool(null)}
                className="absolute right-6 top-6 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 inline-block">
                  {activeModalSchool.category}
                </span>
                <h2 className="text-3xl font-display font-black text-slate-900">
                  {activeModalSchool.name}
                </h2>
                <p className="text-sm font-semibold text-indigo-600">
                  {activeModalSchool.subtitle}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                {activeModalSchool.description}
              </div>

              {/* Key Features List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Institutional Features & Setup
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {activeModalSchool.keyFeatures.map((feature, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white border border-slate-200/60 flex items-start gap-2.5 text-xs text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Students & Curriculum Focus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Target Learner Profile
                  </span>
                  <p className="text-xs text-indigo-950 font-medium">
                    {activeModalSchool.targetStudents}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    Curriculum & Exam Focus
                  </span>
                  <p className="text-xs text-amber-950 font-medium">
                    {activeModalSchool.curriculumFocus}
                  </p>
                </div>
              </div>

              {/* AI Tutor Adaptation Strategy */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  Grade Master Africa AI Tutor Strategy
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {activeModalSchool.aiTutorAdaptation}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveModalSchool(null)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
                >
                  Close Specification
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
