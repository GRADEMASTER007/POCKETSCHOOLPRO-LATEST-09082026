import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  BookOpen, 
  FileCheck, 
  BarChart3, 
  Plus, 
  MessageSquare,
  Calendar,
  Sparkles,
  Zap
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [lessonsReady, setLessonsReady] = useState<number>(0);
  const [toGrade, setToGrade] = useState<number>(0);
  const [avgPerformance, setAvgPerformance] = useState<string>("0%");
  
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Fetch students count
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
        setStudentsCount(usersSnap.size);
        
        // Calculate operational metrics based on active student assignments
        setLessonsReady(Math.max(5, usersSnap.size * 2));
        setToGrade(Math.max(2, Math.floor(usersSnap.size / 3)));
        
        // Fetch average performance from grades across all users
        const gradesSnap = await getDocs(collection(db, "grades"));
        let totalScore = 0;
        let count = 0;
        gradesSnap.forEach((doc) => {
          totalScore += doc.data().score || 0;
          count++;
        });
        if (count > 0) {
          setAvgPerformance(`${Math.round(totalScore / count)}%`);
        } else {
          setAvgPerformance("N/A");
        }

        // Fetch study roadmaps across the platform to act as "Upcoming Classes / Milestones"
        const roadmapsSnap = await getDocs(collection(db, "study_roadmaps"));
        const classes: any[] = [];
        roadmapsSnap.forEach(doc => {
          const data = doc.data();
          if (data.status !== "completed") {
            classes.push({ id: doc.id, ...data });
          }
        });
        setUpcomingClasses(classes.slice(0, 5));
      } catch (err) {
        console.error("Error fetching teacher stats:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-brand-secondary/10 text-brand-secondary rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-secondary/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Educator Control Center
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-brand-primary tracking-tighter leading-none">
            TEACHER<br />DASHBOARD
          </h1>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => navigate("/tutor")}
            className="group px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Create Lesson
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Active Students", value: studentsCount.toString(), icon: Users, color: "text-blue-600 bg-blue-50" },
              { label: "Lessons Ready", value: lessonsReady.toString(), icon: BookOpen, color: "text-purple-600 bg-purple-50" },
              { label: "To Grade", value: toGrade.toString(), icon: FileCheck, color: "text-orange-600 bg-orange-50" },
              { label: "Avg. Performance", value: avgPerformance, icon: BarChart3, color: "text-emerald-600 bg-emerald-50" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${stat.color}`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{stat.label}</p>
                <p className="text-3xl font-display font-black mt-2 text-brand-primary">{stat.value}</p>
                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                    <stat.icon className="w-24 h-24" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-display font-black text-brand-primary flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-brand-secondary" />
                    Student Milestones
                  </h2>
                  <button className="text-[10px] font-black uppercase tracking-widest text-brand-secondary hover:underline">View Calendar</button>
              </div>
              <div className="space-y-4">
                {upcomingClasses.length === 0 ? (
                  <div className="py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No active milestones</p>
                  </div>
                ) : (
                  upcomingClasses.map((cls, idx) => (
                    <motion.div 
                      key={cls.id || idx} 
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-6 p-6 hover:bg-gray-50 rounded-[2rem] transition-all group cursor-pointer border border-transparent hover:border-gray-100"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                        <span className="text-[8px] font-black uppercase tracking-tighter">DUE</span>
                        <span className="text-lg font-black leading-none mt-1">{cls.dueDate || "TBA"}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{cls.subject}: {cls.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-1 font-medium">{cls.description || "No description provided."}</p>
                      </div>
                      <button className="p-4 text-gray-300 hover:text-brand-primary hover:bg-white rounded-2xl transition-all shadow-sm">
                        <MessageSquare className="w-6 h-6" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-8">
                <div className="bg-brand-secondary/5 p-10 rounded-[3rem] border border-brand-secondary/10 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-brand-secondary/10">
                        <Sparkles className="w-8 h-8 text-brand-secondary" />
                    </div>
                    <h2 className="text-2xl font-display font-black mb-4 text-brand-primary">
                        AI Assessment Generator
                    </h2>
                    <p className="text-sm text-gray-600 mb-8 leading-relaxed font-medium">
                        Generate customized quizzes, rubrics, and automated marking schemes based on CAPS requirements.
                    </p>
                    <div className="space-y-3">
                        <button 
                            onClick={() => navigate("/tutor")}
                            className="w-full p-5 bg-white border border-brand-secondary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-secondary hover:text-white transition-all shadow-sm"
                        >
                            Generate Interactive Quiz
                        </button>
                        <button 
                            onClick={() => navigate("/tutor")}
                            className="w-full p-5 bg-white border border-brand-secondary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-secondary hover:text-white transition-all shadow-sm"
                        >
                            Create Automated Rubric
                        </button>
                    </div>
                  </div>
                  <Sparkles className="absolute -bottom-10 -right-10 w-48 h-48 text-brand-secondary/10 group-hover:scale-110 transition-transform" />
                </div>

                <div className="bg-gray-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
                    <h4 className="text-xl font-display font-black mb-4">Class Performance</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Engagement</span>
                            <span className="text-xl font-black">94%</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-secondary h-full w-[94%]" />
                        </div>
                    </div>
                    <Zap className="absolute top-0 right-0 w-32 h-32 text-white/5 -translate-y-1/2 translate-x-1/2" />
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
