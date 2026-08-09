import React from "react";

import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

import { motion } from "motion/react";
import { 
  User, 
  Mail, 
  School, 
  GraduationCap, 
  Languages, 
  Lock, 
  Bell, 
  Cloud,
  Edit2,
  Camera,
  Settings,
  BatteryCharging,
  BatteryMedium,
  Trash2,
  Palette,
  Volume2
} from "lucide-react";
import { useAuth } from "@/src/components/auth/AuthContext";
import { cn } from "@/src/lib/utils";
import { useBatterySaver } from "@/src/hooks/useBatterySaver";
import { auth } from "@/src/lib/firebase";
import { useTheme } from "@/src/components/layout/ThemeContext";
import Badges from "@/src/components/study/Badges";
import SubjectPerformance from "@/src/components/study/SubjectPerformance";
import GlobalCurriculumSelector from "@/src/components/study/GlobalCurriculumSelector";
import { Link } from "react-router-dom";


export default function Profile() {
  const { user, profile, logout } = useAuth();
  const { batterySaverEnabled, setBatterySaverEnabled } = useBatterySaver();
  const { theme, setTheme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    school: "",
    grade: "",
    preferredLanguage: "English"
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        school: profile.school || "",
        grade: profile.grade || "",
        preferredLanguage: profile.preferredLanguage || "English"
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), formData);
      setIsEditing(false);
      // Give time for user to see success, ideally update context but reloading works too
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const [isDeleting, setIsDeleting] = React.useState(false);
  const [voice, setVoice] = React.useState("female-young");

  const deleteAccount = async () => {
    if (!confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) return;
    try {
      setIsDeleting(true);
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`,
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete account");
      
      alert("Account deleted successfully.");
      await logout();
      window.location.href = "/";
    } catch (e: any) {
      alert("Error deleting account: " + e.message);
      setIsDeleting(false);
    }
  };

  const themes = [
    { id: "light", label: "Light", color: "bg-[#F8F9FA]" },
    { id: "dark", label: "Dark", color: "bg-[#0F172A]" },
    { id: "google", label: "Google", color: "bg-[#4285F4]" },
    { id: "galaxy", label: "Galaxy", color: "bg-[#E879F9]" },
    { id: "nature", label: "Nature", color: "bg-[#22C55E]" },
    { id: "ocean", label: "Ocean", color: "bg-[#0EA5E9]" },
    { id: "sunrise", label: "Sunrise", color: "bg-[#F97316]" },
    { id: "sunset", label: "Sunset", color: "bg-[#8B5CF6]" },
    { id: "neon", label: "Neon", color: "bg-[#D946EF]" },
    { id: "minimal", label: "Minimal", color: "bg-[#18181B]" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-500">Manage your academic profile, preferences, and security settings.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 text-center shadow-sm">
            <div className="relative inline-block mb-6">
              <img 
                src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName}`} 
                className="w-32 h-32 rounded-full border-4 border-gray-50 shadow-md"
                alt="Profile" 
                referrerPolicy="no-referrer"
              />
              <button className="absolute bottom-1 right-1 p-2 bg-brand-primary text-white rounded-full border-4 border-white hover:scale-110 transition-all shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-2xl font-bold mb-1">{profile?.displayName}</h2>
            <p className="text-sm text-gray-500 mb-6">{profile?.email}</p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/5 text-brand-primary rounded-full text-xs font-bold uppercase tracking-widest">
              {profile?.role}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
              <Cloud className="text-brand-primary" />
              Cloud Storage
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>Storage Used</span>
                <span className="text-brand-primary">45%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary w-[45%]" />
              </div>
              <p className="text-[10px] text-gray-400">2.25 GB of 5 GB used</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          
          {/* Global Curriculum & International Education System Settings */}
          <GlobalCurriculumSelector />

          {/* Academic Progress & Achievements Section */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8 space-y-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Academic Progress & Achievements</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SubjectPerformance />
              <Badges />
            </div>
            <div className="pt-6 border-t border-gray-100">
               <h4 className="text-lg font-bold text-gray-900 mb-4">Saved Work</h4>
               <div className="flex gap-4">
                 <Link to="/documents" className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary/10 text-brand-primary rounded-xl font-bold text-sm hover:bg-brand-primary hover:text-white transition-all">
                   View Documents
                 </Link>
                 <Link to="/notebook" className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all">
                   Smart Notebooks
                 </Link>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Lock className="text-brand-primary" />
                Security & Privacy
              </h3>
            </div>
            <div className="p-8 space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-brand-primary/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-primary transition-all shadow-sm">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold">Notifications</h4>
                    <p className="text-xs text-gray-400">Manage push & email alerts</p>
                  </div>
                </div>
                <Edit2 className="w-4 h-4 text-gray-300 group-hover:text-brand-primary transition-all" />
              </button>
              
              <button onClick={deleteAccount} disabled={isDeleting} className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl group hover:bg-red-100 transition-all border border-red-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-400 group-hover:text-red-500 transition-all shadow-sm">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-red-600">Delete Account</h4>
                    <p className="text-xs text-red-400">Permanently remove all your data</p>
                  </div>
                </div>
                <Trash2 className="w-4 h-4 text-red-300 group-hover:text-red-500 transition-all" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Settings className="text-brand-primary" />
                App Preferences
              </h3>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-brand-primary" />
                  <h4 className="text-sm font-bold">Visual Theme</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                        theme === t.id 
                          ? "border-brand-primary bg-brand-primary/5 shadow-md" 
                          : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <div className={cn("w-full h-8 rounded-lg shadow-inner", t.color)} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-brand-primary" />
                  <h4 className="text-sm font-bold">AI Tutor Voice</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "female-young", label: "Female (Young)" },
                    { id: "male-adult", label: "Male (Adult)" },
                    { id: "female-senior", label: "Female (Senior)" },
                    { id: "male-young", label: "Male (Young)" },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVoice(v.id)}
                      className={cn(
                        "p-4 rounded-2xl border-2 text-xs font-bold uppercase tracking-widest transition-all",
                        voice === v.id
                          ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                          : "border-gray-100 text-gray-400 hover:border-gray-200"
                      )}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm", batterySaverEnabled ? "bg-amber-50 text-amber-500" : "bg-white text-gray-400")}>
                    {batterySaverEnabled ? <BatteryMedium className="w-5 h-5" /> : <BatteryCharging className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold">Battery Saver</h4>
                    <p className="text-xs text-gray-400 max-w-[200px]">Reduces scan frequency and disables live camera preview on low battery.</p>
                  </div>
                </div>
                <button
                  onClick={() => setBatterySaverEnabled(!batterySaverEnabled)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2",
                    batterySaverEnabled ? "bg-amber-500" : "bg-gray-200"
                  )}
                >
                  <span className="sr-only">Enable Battery Saver</span>
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      batterySaverEnabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
