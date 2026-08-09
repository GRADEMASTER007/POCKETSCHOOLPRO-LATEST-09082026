import React, { useState, useEffect } from "react";
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDoc, 
  setDoc, 
  addDoc 
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { 
  Award, 
  Star, 
  Zap, 
  Trophy, 
  Shield, 
  Crown, 
  Flame, 
  BookOpen, 
  Users, 
  Check, 
  Share2, 
  Sparkles, 
  X, 
  Lock, 
  CheckCircle, 
  TrendingUp, 
  Coins, 
  Loader2,
  GraduationCap
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDaysStudied: number;
}

interface GradeData {
  subject: string;
  score: number;
}

interface UserStats {
  xp: number;
  claimedBadges?: string[];
}

interface StudyRoomDoc {
  id: string;
  name: string;
}

export default function Badges() {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalDaysStudied: 0
  });
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [rooms, setRooms] = useState<StudyRoomDoc[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ xp: 0, claimedBadges: [] });
  const [loading, setLoading] = useState(true);

  // Tab & selection state
  const [activeTab, setActiveTab] = useState<"all" | "unlocked" | "progress">("all");
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [sharingRoomId, setSharingRoomId] = useState<string>("");
  const [shareSuccess, setShareSuccess] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showCelebration, setShowCelebration] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const uid = auth.currentUser.uid;

    // 1. Listen to Streaks
    const streakRef = doc(db, "user_streaks", uid);
    const unsubStreaks = onSnapshot(streakRef, (docSnap) => {
      if (docSnap.exists()) {
        setStreakData(docSnap.data() as StreakData);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, "user_streaks"));

    // 2. Listen to Grades
    const gradesQuery = query(collection(db, "grades"), where("userId", "==", uid));
    const unsubGrades = onSnapshot(gradesQuery, (snap) => {
      const list: GradeData[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.subject && typeof data.score === "number") {
          list.push({ subject: data.subject.trim(), score: data.score });
        }
      });
      setGrades(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, "grades"));

    // 3. Listen to Study Circles
    const roomsQuery = query(collection(db, "study_rooms"), where("members", "array-contains", uid));
    const unsubRooms = onSnapshot(roomsQuery, (snap) => {
      const list: StudyRoomDoc[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, name: d.data().name || "Study Circle" });
      });
      setRooms(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, "study_rooms"));

    // 4. Listen to User Stats (XP & claimed badges)
    const statsRef = doc(db, "user_stats", uid);
    const unsubStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserStats(docSnap.data() as UserStats);
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "user_stats");
      setLoading(false);
    });

    return () => {
      unsubStreaks();
      unsubGrades();
      unsubRooms();
      unsubStats();
    };
  }, []);

  // Set default sharing room
  useEffect(() => {
    if (rooms.length > 0 && !sharingRoomId) {
      setSharingRoomId(rooms[0].id);
    }
  }, [rooms, sharingRoomId]);

  // Derived grades stats
  const gradesCount = grades.length;
  const maxGrade = gradesCount > 0 ? Math.max(...grades.map(g => g.score)) : 0;
  const avgGrade = gradesCount > 0 ? Math.round(grades.reduce((acc, g) => acc + g.score, 0) / gradesCount) : 0;
  
  const distinctSubjects = Array.from(new Set(
    grades.map(g => g.subject.toLowerCase().charAt(0).toUpperCase() + g.subject.slice(1).toLowerCase())
  )).length;

  // List of Milestones and Badges definition
  const milestones = [
    {
      id: "first-study",
      title: "First Steps",
      description: "Logged your first study day and initiated your academic path.",
      icon: Star,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      progress: streakData.totalDaysStudied >= 1 ? 1 : 0,
      target: 1,
      metricLabel: "Total days studied",
      earned: streakData.totalDaysStudied >= 1,
      xpReward: 100,
      badgeType: "Bronze"
    },
    {
      id: "streak-3",
      title: "Getting Warmer",
      description: "Achieved a 3-day learning streak. Momentum is building!",
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      progress: streakData.longestStreak,
      target: 3,
      metricLabel: "Longest learning streak",
      earned: streakData.longestStreak >= 3,
      xpReward: 200,
      badgeType: "Bronze"
    },
    {
      id: "streak-7",
      title: "7-Day Streak",
      description: "Consistently studied for a full week. Exceptional study habit!",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      progress: streakData.longestStreak,
      target: 7,
      metricLabel: "Longest learning streak",
      earned: streakData.longestStreak >= 7,
      xpReward: 350,
      badgeType: "Silver"
    },
    {
      id: "polymath",
      title: "Polymath Scholar",
      description: "Registered grades across 3 or more distinct learning modules.",
      icon: BookOpen,
      color: "text-teal-500",
      bgColor: "bg-teal-50",
      progress: distinctSubjects,
      target: 3,
      metricLabel: "Distinct subjects logged",
      earned: distinctSubjects >= 3,
      xpReward: 300,
      badgeType: "Silver"
    },
    {
      id: "top-performer",
      title: "Top Performer",
      description: "Achieved academic excellence with an average score of 90% or above.",
      icon: Crown,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      progress: gradesCount >= 3 ? avgGrade : 0,
      target: 90,
      metricLabel: "Average grade (Requires 3+ records)",
      requirementText: "Requires an average grade of 90%+ across 3 or more logged grades.",
      earned: gradesCount >= 3 && avgGrade >= 90,
      xpReward: 500,
      badgeType: "Gold"
    },
    {
      id: "pioneer",
      title: "Circle Pioneer",
      description: "Joined or created an active Study Circle to collaborate with peers.",
      icon: Users,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      progress: rooms.length,
      target: 1,
      metricLabel: "Study Circles active",
      earned: rooms.length >= 1,
      xpReward: 250,
      badgeType: "Bronze"
    },
    {
      id: "perfect-score",
      title: "Honor Roll Ace",
      description: "Achieved a flawless 100% score on any assignment or test.",
      icon: Trophy,
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      progress: maxGrade,
      target: 100,
      metricLabel: "Highest individual score",
      earned: maxGrade >= 100,
      xpReward: 400,
      badgeType: "Gold"
    },
    {
      id: "academic-diligence",
      title: "Academic Diligence",
      description: "Deep engagement with the system. Studied for 15+ total days.",
      icon: Shield,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      progress: streakData.totalDaysStudied,
      target: 15,
      metricLabel: "Total days studied",
      earned: streakData.totalDaysStudied >= 15,
      xpReward: 450,
      badgeType: "Silver"
    }
  ];

  // Filtering badges based on tabs
  const filteredBadges = milestones.filter(badge => {
    if (activeTab === "unlocked") return badge.earned;
    if (activeTab === "progress") return !badge.earned;
    return true; // "all"
  });

  const unlockedCount = milestones.filter(b => b.earned).length;

  // Handle claiming XP
  const handleClaimXP = async (badgeId: string, xpReward: number) => {
    if (!auth.currentUser) return;
    setClaiming(true);
    const uid = auth.currentUser.uid;
    const statsRef = doc(db, "user_stats", uid);

    try {
      const docSnap = await getDoc(statsRef);
      let currentXp = 0;
      let claimed: string[] = [];

      if (docSnap.exists()) {
        const data = docSnap.data();
        currentXp = data.xp || 0;
        claimed = data.claimedBadges || [];
      }

      if (claimed.includes(badgeId)) {
        setClaiming(false);
        return;
      }

      const updatedClaimed = [...claimed, badgeId];
      const updatedXp = currentXp + xpReward;

      await setDoc(statsRef, {
        xp: updatedXp,
        claimedBadges: updatedClaimed
      }, { merge: true });

      // Trigger standard local state animations
      setUserStats({ xp: updatedXp, claimedBadges: updatedClaimed });
      setShowCelebration(badgeId);
      
      // Update selected badge ref
      if (selectedBadge && selectedBadge.id === badgeId) {
        setSelectedBadge({
          ...selectedBadge,
          claimed: true
        });
      }

      setTimeout(() => {
        setShowCelebration(null);
      }, 4000);

    } catch (e) {
      console.error("Error claiming badge XP:", e);
    } finally {
      setClaiming(false);
    }
  };

  // Announce/Share badge achievement in Study Circle
  const handleShareAchievement = async (badgeTitle: string) => {
    if (!auth.currentUser || !sharingRoomId) return;
    setSharing(true);
    try {
      const roomName = rooms.find(r => r.id === sharingRoomId)?.name || "Study Circle";
      await addDoc(collection(db, "room_messages"), {
        roomId: sharingRoomId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Scholar",
        userPhoto: auth.currentUser.photoURL || "",
        text: `🏆 I've just unlocked the "${badgeTitle}" milestone on Grade Master Africa! 🌟 Consistently building focus and scoring top marks. Join me in our active sessions!`,
        createdAt: Date.now()
      });

      setShareSuccess(true);
      setTimeout(() => {
        setShareSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to share achievement:", err);
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-[450px]">
        <div className="flex justify-between items-start animate-pulse">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-100 rounded"></div>
            <div className="h-4 w-48 bg-gray-50 rounded"></div>
          </div>
          <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 flex-1 mt-6">
          <div className="h-28 bg-gray-50 rounded-2xl animate-pulse"></div>
          <div className="h-28 bg-gray-50 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100/80 shadow-sm flex flex-col h-full relative" id="badge-system-widget">
      {/* Sparkle Floating Celebration Banner */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-4 left-4 right-4 z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-60 pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-5 h-5 text-yellow-200 fill-yellow-200" />
              </div>
              <div>
                <h4 className="font-black text-sm">Reward Claimed!</h4>
                <p className="text-xs text-amber-50">XP points successfully added to your level profile.</p>
              </div>
            </div>
            <div className="text-xl font-black bg-white/20 px-3 py-1.5 rounded-xl border border-white/30 text-yellow-100">
              +{milestones.find(m => m.id === showCelebration)?.xpReward || 200} XP
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-brand-primary fill-indigo-50" />
            Milestones & Badges
          </h3>
          <p className="text-xs text-gray-400 mt-1">Unlock certificates, earn massive XP, and announce progress.</p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100/60 px-4 py-2 rounded-2xl">
          <div className="text-left">
            <div className="text-xl font-black text-indigo-600 leading-none">
              {unlockedCount} <span className="text-xs text-gray-400 font-medium">/ {milestones.length}</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mt-0.5">Unlocked</div>
          </div>
          <div className="w-px h-8 bg-indigo-100 mx-1" />
          <div className="text-right">
            <div className="text-sm font-black text-amber-600 flex items-center gap-0.5 justify-end">
              <Coins className="w-4 h-4 text-amber-500 fill-amber-100" />
              {userStats.xp}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mt-0.5">Total XP</div>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-1.5 bg-gray-50 p-1 rounded-2xl border border-gray-100 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
            activeTab === "all" 
              ? "bg-white text-gray-800 shadow-sm border border-gray-100" 
              : "text-gray-400 hover:text-gray-600"
          )}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("unlocked")}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
            activeTab === "unlocked" 
              ? "bg-white text-emerald-600 shadow-sm border border-gray-100" 
              : "text-gray-400 hover:text-gray-600"
          )}
        >
          <Check className="w-3.5 h-3.5" /> Unlocked ({unlockedCount})
        </button>
        <button
          onClick={() => setActiveTab("progress")}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
            activeTab === "progress" 
              ? "bg-white text-indigo-600 shadow-sm border border-gray-100" 
              : "text-gray-400 hover:text-gray-600"
          )}
        >
          <Lock className="w-3.5 h-3.5" /> In Progress ({milestones.length - unlockedCount})
        </button>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
        {filteredBadges.map((badge) => {
          const isClaimed = userStats.claimedBadges?.includes(badge.id);
          const rawPercentage = (badge.progress / badge.target) * 100;
          const percentage = Math.min(rawPercentage, 100);

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge({ ...badge, claimed: isClaimed })}
              className={cn(
                "p-4 rounded-2xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer group relative overflow-hidden",
                badge.earned
                  ? "bg-white border-indigo-100 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5"
                  : "bg-gray-50/40 border-gray-100 opacity-75 hover:opacity-100"
              )}
            >
              {/* Badge visual type pill */}
              <span className={cn(
                "absolute top-2 right-2 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border",
                badge.badgeType === "Gold" && "bg-amber-50 text-amber-600 border-amber-200",
                badge.badgeType === "Silver" && "bg-slate-50 text-slate-500 border-slate-200",
                badge.badgeType === "Bronze" && "bg-orange-50 text-orange-600 border-orange-200"
              )}>
                {badge.badgeType}
              </span>

              <div className="flex flex-col items-center flex-1 w-full">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 duration-300 relative",
                  badge.bgColor
                )}>
                  {badge.earned ? (
                    <badge.icon className={cn("w-6 h-6", badge.color)} />
                  ) : (
                    <div className="relative">
                      <badge.icon className="w-6 h-6 text-gray-300 grayscale" />
                      <Lock className="w-3.5 h-3.5 text-gray-400 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border shadow-sm" />
                    </div>
                  )}
                  {badge.earned && !isClaimed && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-extrabold text-gray-900 leading-tight mb-1 group-hover:text-brand-primary transition-colors">
                  {badge.title}
                </h4>
                
                <p className="text-[10px] text-gray-400 line-clamp-2 px-1 mb-3">
                  {badge.description}
                </p>
              </div>

              {/* Progress Display */}
              <div className="w-full mt-auto">
                <div className="flex justify-between items-center text-[9px] font-semibold text-gray-400 mb-1">
                  <span>Progress</span>
                  <span className={cn(badge.earned ? "text-emerald-500 font-extrabold" : "text-indigo-500")}>
                    {badge.earned ? "Completed" : `${Math.round(badge.progress)} / ${badge.target}`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      badge.earned ? "bg-emerald-500" : "bg-indigo-500"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL DRAWER / MODAL */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedBadge(null);
                setShareSuccess(false);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl w-full max-w-md p-6 relative z-10 space-y-6"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setSelectedBadge(null);
                  setShareSuccess(false);
                }}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon & Title */}
              <div className="flex flex-col items-center text-center mt-3">
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mb-4 border relative",
                  selectedBadge.bgColor,
                  selectedBadge.earned ? "border-indigo-100" : "border-dashed border-gray-200"
                )}>
                  {selectedBadge.earned ? (
                    <selectedBadge.icon className={cn("w-10 h-10", selectedBadge.color)} />
                  ) : (
                    <div className="relative">
                      <selectedBadge.icon className="w-10 h-10 text-gray-300 grayscale" />
                      <Lock className="w-5 h-5 text-gray-400 absolute -bottom-1 -right-1 bg-white rounded-full p-1 border shadow-sm" />
                    </div>
                  )}
                </div>

                <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                  {selectedBadge.badgeType} Medal
                </div>

                <h3 className="text-xl font-bold text-gray-900 tracking-tight">{selectedBadge.title}</h3>
                <p className="text-gray-500 text-xs mt-1.5 px-4 leading-relaxed">{selectedBadge.description}</p>
              </div>

              {/* Progress Detail */}
              <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-100">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  <span>{selectedBadge.metricLabel || "Metric progress"}</span>
                  <span className={cn(selectedBadge.earned ? "text-emerald-500" : "text-indigo-600")}>
                    {Math.round(selectedBadge.progress)} / {selectedBadge.target}
                  </span>
                </div>
                
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      selectedBadge.earned ? "bg-emerald-500" : "bg-indigo-500"
                    )}
                    style={{ width: `${Math.min((selectedBadge.progress / selectedBadge.target) * 100, 100)}%` }}
                  />
                </div>

                {selectedBadge.requirementText && (
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic mt-1">
                    ⚠️ {selectedBadge.requirementText}
                  </p>
                )}

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 text-xs">
                  <span className="text-gray-400 font-bold">Unlocks Reward:</span>
                  <span className="font-extrabold text-amber-600 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-100" />
                    +{selectedBadge.xpReward} XP
                  </span>
                </div>
              </div>

              {/* Actions Section */}
              <div className="space-y-3">
                {selectedBadge.earned ? (
                  <>
                    {/* XP claim button */}
                    {!selectedBadge.claimed ? (
                      <button
                        onClick={() => handleClaimXP(selectedBadge.id, selectedBadge.xpReward)}
                        disabled={claiming}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all"
                      >
                        {claiming ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Coins className="w-4 h-4 text-yellow-100 animate-pulse" />
                            Claim +{selectedBadge.xpReward} XP Reward
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Reward Claimed successfully
                      </div>
                    )}

                    {/* Social Circle Share */}
                    {rooms.length > 0 ? (
                      <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Share with Study Circle</label>
                          {shareSuccess && (
                            <span className="text-[10px] font-bold text-emerald-600">🎉 Broadcast shared!</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <select
                            value={sharingRoomId}
                            onChange={(e) => setSharingRoomId(e.target.value)}
                            className="flex-1 p-2.5 border border-gray-200 rounded-xl text-xs bg-white text-gray-700 font-medium outline-none"
                          >
                            {rooms.map(room => (
                              <option key={room.id} value={room.id}>
                                {room.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleShareAchievement(selectedBadge.title)}
                            disabled={sharing || !sharingRoomId}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                          >
                            {sharing ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5" /> Share
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 text-center leading-relaxed italic">
                        💡 Create or join a **Study Circle** on the dashboard to announce achievements and earn study praise from your peers!
                      </p>
                    )}
                  </>
                ) : (
                  <div className="bg-gray-50 border border-gray-200/50 p-4 rounded-2xl text-center space-y-2">
                    <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5 justify-center">
                      <Lock className="w-3.5 h-3.5 text-gray-400" /> Keep learning to unlock
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed px-4">
                      {selectedBadge.id === "streak-7" || selectedBadge.id === "streak-3"
                        ? "Log your learning sessions daily in the Streak Tracker to secure your streak."
                        : selectedBadge.id === "top-performer" || selectedBadge.id === "perfect-score" || selectedBadge.id === "polymath"
                        ? "Record higher scores and more modules in the Grade Tracker to unlock this milestone."
                        : selectedBadge.id === "pioneer"
                        ? "Join or launch a new Study Circle inside the Study Buddies section to build peer synergy."
                        : "Consistently interact with the study room timers and grade logs."}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
