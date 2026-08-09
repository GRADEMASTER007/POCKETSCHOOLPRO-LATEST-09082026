import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { Target, Plus, Check, Trash2 } from "lucide-react";
import { isToday } from "date-fns";
import { cn } from "@/src/lib/utils";

interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

interface GoalsData {
  goals: Goal[];
  lastUpdated: string;
}

export default function DailyGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const goalsRef = doc(db, "user_goals", auth.currentUser.uid);
    
    const unsubscribe = onSnapshot(goalsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as GoalsData;
        
        // Reset goals if they are from a previous day
        if (data.lastUpdated && !isToday(new Date(data.lastUpdated))) {
          const resetGoals = data.goals.map(g => ({ ...g, completed: false }));
          setDoc(goalsRef, { goals: resetGoals, lastUpdated: new Date().toISOString() }, { merge: true }).catch(err => {
            handleFirestoreError(err, OperationType.UPDATE, `user_goals/${auth.currentUser?.uid}`);
          });
          setGoals(resetGoals);
        } else {
          setGoals(data.goals || []);
        }
      } else {
        setDoc(goalsRef, { goals: [], lastUpdated: new Date().toISOString() }).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, `user_goals/${auth.currentUser?.uid}`);
        });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `user_goals/${auth.currentUser?.uid}`);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim() || !auth.currentUser) return;

    const goal: Goal = {
      id: Date.now().toString(),
      text: newGoal.trim(),
      completed: false,
    };

    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals); // Optimistic update
    setNewGoal("");

    await setDoc(doc(db, "user_goals", auth.currentUser.uid), {
      goals: updatedGoals,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  };

  const toggleGoal = async (id: string) => {
    if (!auth.currentUser) return;
    const updatedGoals = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    setGoals(updatedGoals);

    await setDoc(doc(db, "user_goals", auth.currentUser.uid), {
      goals: updatedGoals,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  };

  const removeGoal = async (id: string) => {
    if (!auth.currentUser) return;
    const updatedGoals = goals.filter(g => g.id !== id);
    setGoals(updatedGoals);

    await setDoc(doc(db, "user_goals", auth.currentUser.uid), {
      goals: updatedGoals,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  };

  if (loading) {
    return <div className="bg-white p-6 rounded-[2rem] border border-gray-100/80 shadow-sm animate-pulse h-full min-h-[300px]"></div>;
  }

  const completedCount = goals.filter(g => g.completed).length;

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100/80 shadow-sm flex flex-col h-full min-h-[300px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-500 fill-emerald-100" />
            Daily Goals
          </h3>
          <p className="text-sm text-gray-500 mt-1">Set your study targets</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-emerald-500 leading-none">
            {completedCount}/{goals.length}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600/70 mt-1">
            Done
          </div>
        </div>
      </div>

      <form onSubmit={addGoal} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="E.g., Read 10 pages..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
        />
        <button 
          type="submit"
          disabled={!newGoal.trim()}
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-50 p-3 rounded-xl transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm font-medium">
            No goals set for today.
          </div>
        ) : (
          goals.map(goal => (
            <div 
              key={goal.id} 
              className={cn(
                "group flex items-center gap-3 p-3 rounded-xl border transition-all",
                goal.completed ? "bg-emerald-50/30 border-emerald-100" : "bg-white border-gray-100 hover:border-gray-200"
              )}
            >
              <button
                onClick={() => toggleGoal(goal.id)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                  goal.completed 
                    ? "bg-emerald-500 border-emerald-500 text-white" 
                    : "border-gray-300 text-transparent hover:border-emerald-500"
                )}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <span className={cn(
                "flex-1 text-sm font-medium transition-all",
                goal.completed ? "text-gray-400 line-through" : "text-gray-700"
              )}>
                {goal.text}
              </span>
              <button
                onClick={() => removeGoal(goal.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
