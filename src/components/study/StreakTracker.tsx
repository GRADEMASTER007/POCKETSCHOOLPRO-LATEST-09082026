import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { Flame, Calendar, Award, Shield, Sparkles, Coins, Zap } from "lucide-react";
import { differenceInDays, format, isToday, isYesterday } from "date-fns";
import { cn } from "@/src/lib/utils";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  totalDaysStudied: number;
  streakShields?: number;
}

export default function StreakTracker() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [userGems, setUserGems] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [buyingShield, setBuyingShield] = useState(false);
  const [showShieldSuccess, setShowShieldSuccess] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    const streakRef = doc(db, "user_streaks", uid);
    const gemsRef = doc(db, "user_gems", uid);

    // Create initial streak data if it doesn't exist
    const initStreak = async () => {
      try {
        const docSnap = await getDoc(streakRef);
        if (!docSnap.exists()) {
          const initialData: StreakData = {
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: new Date(0).toISOString(),
            totalDaysStudied: 0,
            streakShields: 1
          };
          await setDoc(streakRef, initialData);
        }
      } catch (err) {
        console.warn("Failed to init streak data (might be offline):", err);
      }
    };
    initStreak();

    const unsubscribeStreak = onSnapshot(streakRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StreakData;
        const shields = data.streakShields ?? 0;
        
        // Calculate if streak is broken
        const lastDate = new Date(data.lastStudyDate);
        if (!isToday(lastDate) && !isYesterday(lastDate) && data.currentStreak > 0) {
          if (shields > 0) {
            // Protected by shield!
            data.streakShields = shields - 1;
            data.lastStudyDate = new Date(Date.now() - 86400000).toISOString(); // Treat as yesterday
            setDoc(streakRef, { ...data }, { merge: true }).catch(err => {
              handleFirestoreError(err, OperationType.UPDATE, `user_streaks/${uid}`);
            });
          } else {
            // Streak broken
            data.currentStreak = 0;
            setDoc(streakRef, { ...data }, { merge: true }).catch(err => {
              handleFirestoreError(err, OperationType.UPDATE, `user_streaks/${uid}`);
            });
          }
        }
        
        setStreakData(data);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `user_streaks/${uid}`);
      setLoading(false);
    });

    const unsubscribeGems = onSnapshot(gemsRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserGems(docSnap.data().gemsBalance || 0);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `user_gems/${uid}`));

    return () => {
      unsubscribeStreak();
      unsubscribeGems();
    };
  }, []);

  const handleLogStudy = async () => {
    if (!auth.currentUser || !streakData) return;
    const uid = auth.currentUser.uid;
    const streakRef = doc(db, "user_streaks", uid);
    
    let { currentStreak, longestStreak, totalDaysStudied, lastStudyDate, streakShields = 0 } = streakData;
    const lastDate = new Date(lastStudyDate);

    if (isToday(lastDate)) {
      return; // Already logged today
    }

    if (isYesterday(lastDate) || currentStreak === 0) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    totalDaysStudied += 1;

    await setDoc(streakRef, {
      currentStreak,
      longestStreak,
      totalDaysStudied,
      lastStudyDate: new Date().toISOString(),
      streakShields
    }, { merge: true });
  };

  const handleBuyShield = async () => {
    if (!auth.currentUser || !streakData) return;
    if (userGems < 100) {
      alert("You need at least 100 Gems to buy a Streak Freeze Shield! Earn Gems by completing daily goals and quizzes.");
      return;
    }

    setBuyingShield(true);
    const uid = auth.currentUser.uid;
    const streakRef = doc(db, "user_streaks", uid);
    const gemsRef = doc(db, "user_gems", uid);

    try {
      const currentShields = streakData.streakShields ?? 0;
      await setDoc(streakRef, { streakShields: currentShields + 1 }, { merge: true });
      await setDoc(gemsRef, { gemsBalance: userGems - 100 }, { merge: true });
      setShowShieldSuccess(true);
      setTimeout(() => setShowShieldSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to purchase streak shield:", e);
    } finally {
      setBuyingShield(false);
    }
  };

  if (loading || !streakData) return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100/80 shadow-sm animate-pulse h-48"></div>
  );

  const goal = 7;
  const progress = Math.min((streakData.currentStreak / goal) * 100, 100);
  
  // Calculate XP multiplier
  const multiplier = streakData.currentStreak >= 14 ? "2.0x" : streakData.currentStreak >= 7 ? "1.5x" : streakData.currentStreak >= 3 ? "1.2x" : "1.0x";

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100/80 shadow-sm flex flex-col justify-between h-full relative" id="learning-streak-widget">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
              <Zap className="w-3 h-3 text-orange-500 fill-orange-200" /> Multiplier: {multiplier} XP
            </div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500 fill-orange-100" />
              Learning Streak
            </h3>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-orange-500 leading-none">
              {streakData.currentStreak}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-orange-600/70 mt-1">
              Days
            </div>
          </div>
        </div>

        <div className="mb-4 relative">
          <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            <span>Progress to {goal} Day Goal</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-3.5 w-full bg-orange-50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Longest</div>
              <div className="text-sm font-black text-gray-900">{streakData.longestStreak} days</div>
            </div>
          </div>
          
          <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-sky-500 shadow-sm shrink-0">
                <Shield className="w-4 h-4 fill-sky-100" />
              </div>
              <div>
                <div className="text-[9px] font-bold text-sky-600 uppercase tracking-wider">Streak Shield</div>
                <div className="text-sm font-black text-sky-900">{streakData.streakShields ?? 0} active</div>
              </div>
            </div>
            <button
              onClick={handleBuyShield}
              disabled={buyingShield}
              className="p-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-[10px] font-bold transition-all shadow-sm flex items-center gap-1"
              title="Buy Streak Shield for 100 Gems"
            >
              <Coins className="w-3 h-3 text-amber-300" /> +1
            </button>
          </div>
        </div>

        {showShieldSuccess && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-xl mb-3 text-center animate-fade-in">
            🛡️ Streak Freeze Shield equipped! Your streak is protected for 1 missed day.
          </div>
        )}
      </div>

      <button 
        onClick={handleLogStudy}
        disabled={isToday(new Date(streakData.lastStudyDate))}
        className="w-full py-3 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 disabled:hover:bg-orange-50 text-orange-600 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-orange-500" />
        {isToday(new Date(streakData.lastStudyDate)) ? "Completed Today!" : "Log Today's Study (+50 XP)"}
      </button>
    </div>
  );
}

