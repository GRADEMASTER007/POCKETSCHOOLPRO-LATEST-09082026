import React, { useState } from "react";
import { 
  Briefcase, 
  User, 
  GraduationCap, 
  Award, 
  Users, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Download, 
  Loader2, 
  Sparkles,
  FileText,
  Mail,
  Phone,
  MapPin,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { auth } from "@/src/lib/firebase";
import { cn } from "@/src/lib/utils";

type Education = { institution: string; degree: string; period: string; achievements: string[] };
type Experience = { company: string; role: string; period: string; responsibilities: string[] };
type Reference = { name: string; contact: string; relation: string };

type CVData = {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  education: Education[];
  experience: Experience[];
  skills: string[];
  references: Reference[];
};

const STEPS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Award },
  { id: "references", label: "References", icon: Users },
  { id: "preview", label: "Generate", icon: Sparkles }
];

export default function CVBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [cvData, setCVData] = useState<CVData>({
    personalInfo: { name: "", email: "", phone: "", location: "", summary: "" },
    education: [{ institution: "", degree: "", period: "", achievements: [""] }],
    experience: [{ company: "", role: "", period: "", responsibilities: [""] }],
    skills: [""],
    references: [{ name: "", contact: "", relation: "" }]
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOptimized, setAiOptimized] = useState<CVData | null>(null);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const updatePersonal = (field: keyof CVData["personalInfo"], value: string) => {
    setCVData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  };

  const addItem = (type: "education" | "experience" | "references") => {
    setCVData(prev => ({
      ...prev,
      [type]: [...prev[type], 
        type === "education" ? { institution: "", degree: "", period: "", achievements: [""] } :
        type === "experience" ? { company: "", role: "", period: "", responsibilities: [""] } :
        { name: "", contact: "", relation: "" }
      ]
    }));
  };

  const removeItem = (type: "education" | "experience" | "references", index: number) => {
    setCVData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
  };

  const handleAiOptimize = async () => {
    setIsGenerating(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/writing/cv-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ userData: cvData })
      });
      const data = await res.json();
      setAiOptimized(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = (data: CVData) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 0;

    // Background Header
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 50, "F");

    y = 20;
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(data.personalInfo.name.toUpperCase(), margin, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(251, 191, 36); // Amber 400
    doc.setFont("helvetica", "bold");
    doc.text(`${data.personalInfo.email}  |  ${data.personalInfo.phone}  |  ${data.personalInfo.location}`, margin, y);

    y = 65;
    doc.setTextColor(15, 23, 42);

    // Summary
    if (data.personalInfo.summary) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("PROFESSIONAL SUMMARY", margin, y);
      doc.setDrawColor(251, 191, 36);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 2, 190, y + 2);
      
      y += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const splitSummary = doc.splitTextToSize(data.personalInfo.summary, 170);
      doc.text(splitSummary, margin, y);
      y += (splitSummary.length * 6) + 12;
    }

    // Experience
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PROFESSIONAL EXPERIENCE", margin, y);
    doc.line(margin, y + 2, 190, y + 2);
    
    y += 12;
    data.experience.forEach(exp => {
      if (!exp.company) return;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(exp.role, margin, y);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(75, 85, 99);
      doc.text(exp.company, margin, y + 5);
      
      doc.setFont("helvetica", "italic");
      doc.setTextColor(156, 163, 175);
      doc.text(exp.period, 190, y, { align: "right" });
      
      y += 12;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");
      exp.responsibilities.forEach(resp => {
        if (!resp) return;
        const splitResp = doc.splitTextToSize(`• ${resp}`, 165);
        doc.text(splitResp, margin + 5, y);
        y += (splitResp.length * 5);
      });
      y += 8;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Education
    if (y > 240) { doc.addPage(); y = 20; }
    y += 5;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("EDUCATION", margin, y);
    doc.line(margin, y + 2, 190, y + 2);
    
    y += 12;
    data.education.forEach(edu => {
      if (!edu.institution) return;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(edu.degree, margin, y);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(156, 163, 175);
      doc.text(edu.period, 190, y, { align: "right" });
      
      y += 6;
      doc.setTextColor(75, 85, 99);
      doc.setFont("helvetica", "bold");
      doc.text(edu.institution, margin, y);
      y += 12;
    });

    // Skills
    if (y > 250) { doc.addPage(); y = 20; }
    y += 5;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("SKILLS & COMPETENCIES", margin, y);
    doc.line(margin, y + 2, 190, y + 2);
    
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const skillText = data.skills.filter(s => s.trim()).join("  •  ");
    const splitSkills = doc.splitTextToSize(skillText, 170);
    doc.text(splitSkills, margin, y);
    y += (splitSkills.length * 6) + 12;

    // References
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("REFERENCES", margin, y);
    doc.line(margin, y + 2, 190, y + 2);
    
    y += 12;
    data.references.forEach(ref => {
      if (!ref.name) return;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(ref.name, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99);
      doc.text(`${ref.relation} | ${ref.contact}`, margin + 50, y);
      y += 8;
    });

    doc.save(`${data.personalInfo.name.replace(/\s+/g, "_")}_CV_GradeMaster.pdf`);
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <FileText className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-amber-400" />
            AI CV Builder
          </h1>
          <p className="text-slate-400 font-medium max-w-xl">
            Build a professional, industry-standard CV in minutes. Let our AI optimize your descriptions for maximum impact.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-12 flex items-center justify-between gap-4">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex-1 flex flex-col items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2",
                currentStep === idx ? "bg-amber-400 border-amber-400 text-slate-900 shadow-lg shadow-amber-400/20" : 
                currentStep > idx ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-800 border-slate-700 text-slate-500"
              )}>
                {currentStep > idx ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest hidden md:block",
                currentStep >= idx ? "text-white" : "text-slate-600"
              )}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="flex-1 p-8 lg:p-12">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-2xl font-black text-gray-900 mb-8">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={cvData.personalInfo.name} onChange={(e) => updatePersonal("name", e.target.value)} placeholder="John Doe" className="w-full pl-11 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" value={cvData.personalInfo.email} onChange={(e) => updatePersonal("email", e.target.value)} placeholder="john@example.com" className="w-full pl-11 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={cvData.personalInfo.phone} onChange={(e) => updatePersonal("phone", e.target.value)} placeholder="+27 123 456 789" className="w-full pl-11 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={cvData.personalInfo.location} onChange={(e) => updatePersonal("location", e.target.value)} placeholder="Johannesburg, SA" className="w-full pl-11 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Professional Summary</label>
                  <textarea value={cvData.personalInfo.summary} onChange={(e) => updatePersonal("summary", e.target.value)} placeholder="Tell us about yourself and your career goals..." className="w-full h-32 p-6 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:outline-none resize-none" />
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-black text-gray-900">Education History</h3>
                  <button onClick={() => addItem("education")} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {cvData.education.map((edu, idx) => (
                  <div key={idx} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 relative group">
                    {idx > 0 && (
                      <button onClick={() => removeItem("education", idx)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" value={edu.institution} onChange={(e) => {
                        const newEdu = [...cvData.education];
                        newEdu[idx].institution = e.target.value;
                        setCVData({ ...cvData, education: newEdu });
                      }} placeholder="Institution Name" className="col-span-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none" />
                      <input type="text" value={edu.period} onChange={(e) => {
                        const newEdu = [...cvData.education];
                        newEdu[idx].period = e.target.value;
                        setCVData({ ...cvData, education: newEdu });
                      }} placeholder="e.g., 2018 - 2022" className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none" />
                      <input type="text" value={edu.degree} onChange={(e) => {
                        const newEdu = [...cvData.education];
                        newEdu[idx].degree = e.target.value;
                        setCVData({ ...cvData, education: newEdu });
                      }} placeholder="Degree / Certification" className="col-span-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-black text-gray-900">Work Experience</h3>
                  <button onClick={() => addItem("experience")} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {cvData.experience.map((exp, idx) => (
                  <div key={idx} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 relative group">
                    {idx > 0 && (
                      <button onClick={() => removeItem("experience", idx)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input type="text" value={exp.company} onChange={(e) => {
                        const newExp = [...cvData.experience];
                        newExp[idx].company = e.target.value;
                        setCVData({ ...cvData, experience: newExp });
                      }} placeholder="Company Name" className="col-span-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none" />
                      <input type="text" value={exp.period} onChange={(e) => {
                        const newExp = [...cvData.experience];
                        newExp[idx].period = e.target.value;
                        setCVData({ ...cvData, experience: newExp });
                      }} placeholder="e.g., 2022 - Present" className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none" />
                      <input type="text" value={exp.role} onChange={(e) => {
                        const newExp = [...cvData.experience];
                        newExp[idx].role = e.target.value;
                        setCVData({ ...cvData, experience: newExp });
                      }} placeholder="Job Title" className="col-span-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none" />
                    </div>
                    <textarea 
                      value={exp.responsibilities[0]} 
                      onChange={(e) => {
                        const newExp = [...cvData.experience];
                        newExp[idx].responsibilities = [e.target.value];
                        setCVData({ ...cvData, experience: newExp });
                      }}
                      placeholder="Key responsibilities and achievements..." 
                      className="w-full h-24 p-4 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:outline-none resize-none"
                    />
                  </div>
                ))}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-2xl font-black text-gray-900">Key Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {cvData.skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                      <input 
                        type="text" 
                        value={skill} 
                        onChange={(e) => {
                          const newSkills = [...cvData.skills];
                          newSkills[idx] = e.target.value;
                          setCVData({ ...cvData, skills: newSkills });
                        }}
                        placeholder="Add skill..." 
                        className="bg-transparent text-sm font-bold focus:outline-none w-24"
                      />
                      <button onClick={() => {
                        const newSkills = cvData.skills.filter((_, i) => i !== idx);
                        setCVData({ ...cvData, skills: newSkills.length ? newSkills : [""] });
                      }} className="text-gray-400 hover:text-rose-600">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setCVData({ ...cvData, skills: [...cvData.skills, ""] })} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="step-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-black text-gray-900">References</h3>
                  <button onClick={() => addItem("references")} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {cvData.references.map((ref, idx) => (
                  <div key={idx} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 relative group">
                    {idx > 0 && (
                      <button onClick={() => removeItem("references", idx)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <input type="text" value={ref.name} onChange={(e) => {
                      const newRef = [...cvData.references];
                      newRef[idx].name = e.target.value;
                      setCVData({ ...cvData, references: newRef });
                    }} placeholder="Name" className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none" />
                    <input type="text" value={ref.relation} onChange={(e) => {
                      const newRef = [...cvData.references];
                      newRef[idx].relation = e.target.value;
                      setCVData({ ...cvData, references: newRef });
                    }} placeholder="Relation (e.g., Manager)" className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none" />
                    <input type="text" value={ref.contact} onChange={(e) => {
                      const newRef = [...cvData.references];
                      newRef[idx].contact = e.target.value;
                      setCVData({ ...cvData, references: newRef });
                    }} placeholder="Contact Info" className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none" />
                  </div>
                ))}
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div key="step-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 flex flex-col items-center py-10">
                <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-12 h-12" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black text-gray-900">Ready to Launch!</h3>
                  <p className="text-gray-500 font-medium max-w-sm">We've gathered all your details. Now, you can let the AI optimize your content or jump straight to downloading your PDF.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <button 
                    onClick={handleAiOptimize}
                    disabled={isGenerating}
                    className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
                    AI Optimize Content
                  </button>
                  <button 
                    onClick={() => generatePDF(aiOptimized || cvData)}
                    className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                </div>

                {aiOptimized && (
                  <div className="w-full bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center gap-4 text-emerald-800">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-bold">AI Optimization Ready</h4>
                      <p className="text-xs opacity-80">Your descriptions have been professionally rewritten for better impact.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        {currentStep < 5 && (
          <div className="p-8 border-t border-gray-50 flex justify-between items-center bg-gray-50/30">
            <button 
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-900 disabled:opacity-0 transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={handleNext}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
