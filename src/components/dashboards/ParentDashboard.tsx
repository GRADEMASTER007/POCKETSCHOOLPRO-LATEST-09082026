import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  TrendingUp, 
  Award, 
  Clock, 
  Calendar, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  User,
  Zap,
  Target
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { cn } from "@/src/lib/utils";

export default function ParentDashboard() {
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [upcomingMilestones, setUpcomingMilestones] = useState<any[]>([]);
  const [termProgress, setTermProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchData = async () => {
      try {
        // Fetch a student user to simulate a child linked to the parent
        const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
        let childData = null;
        if (!usersSnap.empty) {
          childData = { id: usersSnap.docs[0].id, ...usersSnap.docs[0].data() };
          setStudentInfo(childData);
        }

        // Fetch their roadmaps for milestones
        if (childData) {
          const roadmapsSnap = await getDocs(query(collection(db, "study_roadmaps"), where("userId", "==", childData.id)));
          const milestones: any[] = [];
          let totalTasks = 0;
          let completedTasks = 0;

          roadmapsSnap.forEach((doc) => {
            const data = doc.data();
            
            // Calculate pseudo term progress
            const tasks = data.subTasks || [];
            totalTasks += tasks.length;
            completedTasks += tasks.filter((t: any) => t.completed).length;

            if (data.status !== "completed") {
              milestones.push({
                id: doc.id,
                title: `${data.subject}: ${data.title}`,
                date: data.dueDate,
                type: "Milestone"
              });
            }
          });
          setUpcomingMilestones(milestones.slice(0, 4));
          if (totalTasks > 0) {
            setTermProgress(Math.round((completedTasks / totalTasks) * 100));
          } else {
            setTermProgress(0);
          }
        }
      } catch (err) {
        console.error("Error fetching parent data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
            Family Learning Monitor
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-brand-primary tracking-tighter leading-none">
            PARENT<br />DASHBOARD
          </h1>
        </div>
        
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Contact Teachers
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-10 rounded-[3rem] border border-gray-100 flex flex-col items-center text-center shadow-xl relative overflow-hidden"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-brand-primary/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                {studentInfo?.photoURL ? (
                  <img src={studentInfo.photoURL} referrerPolicy="no-referrer" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl relative z-10" alt="Student" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-brand-primary/5 border-4 border-white flex items-center justify-center relative z-10 shadow-xl">
                    <User className="w-10 h-10 text-brand-primary" />
                  </div>
                )}
                <div className="absolute bottom-1 right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white shadow-lg z-20" />
              </div>
              <h2 className="text-2xl font-display font-black text-brand-primary mb-2">{studentInfo?.displayName || "My Child"}</h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-10">
                Grade {studentInfo?.grade || "N/A"} • {studentInfo?.school || "CAPS Curriculum"}
              </p>
              
              <div className="w-full space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Term Progress</span>
                    <span className="text-xl font-black text-brand-primary">{termProgress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${termProgress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary" 
                    />
                </div>
              </div>
              <Sparkles className="absolute -top-10 -right-10 w-48 h-48 text-brand-primary/5" />
            </motion.div>

            <div className="md:col-span-2 grid grid-cols-2 gap-6">
              {[
                { label: "Learning Streak", value: "Active", icon: TrendingUp, color: "text-orange-500 bg-orange-50" },
                { label: "Study Velocity", value: `${termProgress > 60 ? "Steady" : "Moderate"}`, icon: Clock, color: "text-blue-500 bg-blue-50" },
                { label: "Achievements", value: "3 New", icon: Award, color: "text-purple-500 bg-purple-50" },
                { label: "Messages", value: "2 Unread", icon: MessageSquare, color: "text-rose-500 bg-rose-50" },
              ].map((stat, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex items-center gap-6 shadow-sm group hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{stat.label}</p>
                    <p className="text-xl font-display font-black text-brand-primary">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="col-span-2 bg-brand-primary p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-brand-primary/20"
              >
                <div className="relative z-10 flex items-center justify-between gap-8">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-display font-black">AI Weekly Analysis</h3>
                        <p className="text-white/70 text-sm font-medium leading-relaxed max-w-lg">
                            Your child is excelling in Agricultural Sciences (+15%) but may need support with Mathematics Unit 4.
                        </p>
                        <button className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all">
                            View Full Analysis
                        </button>
                    </div>
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shrink-0">
                        <Target className="w-12 h-12 text-brand-secondary" />
                    </div>
                </div>
                <Zap className="absolute top-0 right-0 w-64 h-64 text-white/5 -translate-y-1/2 translate-x-1/2" />
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-display font-black flex items-center gap-3 text-brand-primary">
                  <Sparkles className="w-6 h-6 text-brand-secondary" />
                  Holistic Review
                </h2>
              </div>
              <div className="space-y-6">
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 group hover:border-brand-primary/20 transition-all cursor-pointer">
                  <h3 className="text-lg font-black text-brand-primary mb-3">Academic Performance</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Consistent performance across FET subjects. Recent quiz scores show a strong grasp of foundational concepts in Physical Sciences.
                  </p>
                </div>
                {termProgress < 50 && (
                  <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100">
                    <h3 className="text-lg font-black text-amber-900 mb-3">Pacing Advisory</h3>
                    <p className="text-sm text-amber-700 font-medium leading-relaxed">
                      Roadmap progress is currently behind the semester average. We recommend scheduling a dedicated revision session this weekend.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-display font-black text-brand-primary">Upcoming Milestones</h2>
                <button className="text-[10px] font-black uppercase tracking-widest text-brand-secondary hover:underline">Full Schedule</button>
              </div>
              <div className="space-y-4">
                {upcomingMilestones.length > 0 ? (
                  upcomingMilestones.map((m, i) => (
                    <motion.div 
                        key={i} 
                        whileHover={{ x: 10 }}
                        className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-gray-200 group cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <Calendar className="w-6 h-6 text-brand-primary" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-1">{m.title}</h4>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{m.type} • {m.date || "TBA"}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-brand-primary transition-all" />
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No active milestones</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
