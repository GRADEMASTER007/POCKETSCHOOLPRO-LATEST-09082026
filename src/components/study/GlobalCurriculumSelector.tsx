import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, 
  BookOpen, 
  GraduationCap, 
  Award, 
  Languages, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  Cpu, 
  ArrowRight,
  School,
  Building,
  Target,
  Briefcase
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { 
  GLOBAL_COUNTRIES, 
  GLOBAL_CURRICULA, 
  SUPPORTED_LANGUAGES, 
  getCurriculumById,
  CurriculumDefinition
} from "@/src/lib/globalCurriculum";
import { useAuth } from "@/src/components/auth/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export default function GlobalCurriculumSelector({ onSaved }: { onSaved?: () => void }) {
  const { user, profile } = useAuth();

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(profile?.country || "ZA");
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>(profile?.curriculum || "caps_sa");
  const [selectedGradeYear, setSelectedGradeYear] = useState<string>(profile?.gradeYear || profile?.grade || "Grade 11");
  const [selectedEducationStage, setSelectedEducationStage] = useState<string>(profile?.educationStage || "High School / Upper Secondary");
  const [selectedExamBoard, setSelectedExamBoard] = useState<string>(profile?.examBoard || "DBE NSC");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(profile?.preferredLanguage || "English");
  const [learningStyle, setLearningStyle] = useState<string>(profile?.learningStyle || "Visual & Step-by-Step");
  const [universityAspirations, setUniversityAspirations] = useState<string>(profile?.universityAspirations || "");
  const [careerInterests, setCareerInterests] = useState<string>(profile?.careerInterests || "");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      if (profile.country) setSelectedCountryCode(profile.country);
      if (profile.curriculum) setSelectedCurriculumId(profile.curriculum);
      if (profile.gradeYear || profile.grade) setSelectedGradeYear(profile.gradeYear || profile.grade || "Grade 11");
      if (profile.educationStage) setSelectedEducationStage(profile.educationStage);
      if (profile.examBoard) setSelectedExamBoard(profile.examBoard);
      if (profile.preferredLanguage) setSelectedLanguage(profile.preferredLanguage);
      if (profile.learningStyle) setLearningStyle(profile.learningStyle);
      if (profile.universityAspirations) setUniversityAspirations(profile.universityAspirations);
      if (profile.careerInterests) setCareerInterests(profile.careerInterests);
    }
  }, [profile]);

  const currentCountry = GLOBAL_COUNTRIES.find(c => c.code === selectedCountryCode) || GLOBAL_COUNTRIES[0];
  const activeCurriculum: CurriculumDefinition = getCurriculumById(selectedCurriculumId);

  // When country changes, default to its primary curriculum
  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const countryObj = GLOBAL_COUNTRIES.find(c => c.code === code);
    if (countryObj && countryObj.defaultCurriculumId) {
      setSelectedCurriculumId(countryObj.defaultCurriculumId);
      const newCurr = getCurriculumById(countryObj.defaultCurriculumId);
      if (newCurr.examBoards && newCurr.examBoards.length > 0) {
        setSelectedExamBoard(newCurr.examBoards[0]);
      }
      if (newCurr.educationStages && newCurr.educationStages.length > 0) {
        setSelectedEducationStage(newCurr.educationStages[newCurr.educationStages.length - 1]);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updateData = {
        country: currentCountry.name,
        countryCode: selectedCountryCode,
        curriculum: selectedCurriculumId,
        curriculumName: activeCurriculum.name,
        gradeYear: selectedGradeYear,
        grade: selectedGradeYear,
        educationStage: selectedEducationStage,
        examBoard: selectedExamBoard,
        preferredLanguage: selectedLanguage,
        learningStyle: learningStyle,
        universityAspirations: universityAspirations,
        careerInterests: careerInterests
      };

      await updateDoc(doc(db, "users", user.uid), updateData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      if (onSaved) onSaved();
    } catch (e) {
      console.error("Failed to save global curriculum profile:", e);
      alert("Error saving curriculum profile to cloud database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden p-6 md:p-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-primary/20">
            <Globe className="w-3.5 h-3.5" />
            <span>Phase 17 – Global Education System Routing</span>
          </div>
          <h2 className="text-3xl font-display font-black text-gray-900 tracking-tight">
            International Curriculum & Profile Routing
          </h2>
          <p className="text-sm text-gray-500 font-medium max-w-2xl">
            Configure your country, education framework, examination board, and language. The AI Tutor dynamically adapts its teaching style, mark schemes, and terminology.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className={cn(
            "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shrink-0 shadow-lg",
            saveSuccess 
              ? "bg-emerald-600 text-white shadow-emerald-500/20" 
              : "bg-brand-primary text-white hover:bg-brand-primary/90 shadow-brand-primary/20 hover:scale-[1.02]"
          )}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>Routing Saved!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Save Global Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Country & Region Selection */}
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-gray-700 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-primary" />
            <span>1. Select Country & Educational System</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {GLOBAL_COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => handleCountryChange(c.code)}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all flex items-center gap-3",
                  selectedCountryCode === c.code 
                    ? "bg-brand-primary/5 border-brand-primary text-brand-primary font-bold shadow-sm" 
                    : "bg-gray-50/70 border-gray-100 text-gray-600 hover:bg-gray-100"
                )}
              >
                <span className="text-2xl">{c.flag}</span>
                <div className="truncate">
                  <div className="text-xs font-bold truncate">{c.name}</div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wider">{c.region}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Curriculum Framework Selection */}
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-gray-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-primary" />
            <span>2. Select Curriculum Framework</span>
          </label>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {Object.values(GLOBAL_CURRICULA).map((curr) => (
              <button
                key={curr.id}
                onClick={() => {
                  setSelectedCurriculumId(curr.id);
                  if (curr.examBoards && curr.examBoards.length > 0) {
                    setSelectedExamBoard(curr.examBoards[0]);
                  }
                }}
                className={cn(
                  "w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-4",
                  selectedCurriculumId === curr.id
                    ? "bg-brand-primary/5 border-brand-primary shadow-sm"
                    : "bg-gray-50/70 border-gray-100 hover:bg-gray-100"
                )}
              >
                <span className="text-2xl mt-0.5">{curr.flag}</span>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{curr.name}</h4>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0">
                      {curr.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium line-clamp-2 leading-relaxed">
                    {curr.teachingStyleDescription}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Dynamic Curriculum Specifics (Exam Board, Stage, Grade, Language) */}
      <div className="pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Education Stage */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-700 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-brand-primary" />
            <span>Education Stage</span>
          </label>
          <select
            value={selectedEducationStage}
            onChange={(e) => setSelectedEducationStage(e.target.value)}
            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {activeCurriculum.educationStages.map((stage, idx) => (
              <option key={idx} value={stage}>{stage}</option>
            ))}
          </select>
        </div>

        {/* Examination Board */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-700 flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-primary" />
            <span>Exam Board</span>
          </label>
          <select
            value={selectedExamBoard}
            onChange={(e) => setSelectedExamBoard(e.target.value)}
            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {activeCurriculum.examBoards.map((board, idx) => (
              <option key={idx} value={board}>{board}</option>
            ))}
          </select>
        </div>

        {/* Grade / Year Input */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-700 flex items-center gap-2">
            <Compass className="w-4 h-4 text-brand-primary" />
            <span>Grade / Year Level</span>
          </label>
          <input
            type="text"
            value={selectedGradeYear}
            onChange={(e) => setSelectedGradeYear(e.target.value)}
            placeholder="e.g. Grade R, Grade 4, Grade 7, Grade 11, Year 6, Primary Stage 3"
            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-700 flex items-center gap-2">
            <Languages className="w-4 h-4 text-brand-primary" />
            <span>Learning Language</span>
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Future Aspirations & Goals */}
      <div className="pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-700 flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-primary" />
            <span>University / Academic Aspirations</span>
          </label>
          <input
            type="text"
            value={universityAspirations}
            onChange={(e) => setUniversityAspirations(e.target.value)}
            placeholder="e.g. UCT, Oxford, MIT, University of Nairobi, IIT, Imperial College"
            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-700 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-primary" />
            <span>Career & Industry Focus</span>
          </label>
          <input
            type="text"
            value={careerInterests}
            onChange={(e) => setCareerInterests(e.target.value)}
            placeholder="e.g. Medicine, AI Engineering, Agribusiness, Astrophysics, Law, Finance"
            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Active AI Adaptation Active Badge */}
      <div className="bg-gradient-to-r from-brand-primary/10 via-indigo-50 to-blue-50 border border-brand-primary/20 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-brand-primary">
              AI Tutor Active Curriculum Configuration
            </div>
            <div className="text-xs text-gray-700 font-bold mt-0.5">
              {currentCountry.flag} {currentCountry.name} • {activeCurriculum.name} ({selectedExamBoard}) • {selectedGradeYear}
            </div>
          </div>
        </div>

        <div className="px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 border border-gray-200">
          Style: {activeCurriculum.teachingStyle}
        </div>
      </div>
    </div>
  );
}
