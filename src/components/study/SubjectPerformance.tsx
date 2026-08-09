import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { Brain, Sparkles, TrendingUp, Info } from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from "recharts";

interface Grade {
  id: string;
  subject: string;
  type: string;
  score: number;
  date: number;
}

interface ChartItem {
  subject: string;
  score: number;
}

export default function SubjectPerformance() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "grades"),
      where("userId", "==", auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setGrades(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Grade)));
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "grades");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100/80 shadow-sm animate-pulse h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-10 h-10 text-gray-200 animate-bounce mx-auto mb-3" />
          <div className="h-4 w-32 bg-gray-100 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  // Calculate averages per subject
  const subjectMap: { [key: string]: { total: number; count: number } } = {};
  grades.forEach((g) => {
    const rawSub = g.subject?.trim();
    if (!rawSub) return;
    // Normalize casing for consistent grouping
    const subject = rawSub.charAt(0).toUpperCase() + rawSub.slice(1).toLowerCase();
    if (!subjectMap[subject]) {
      subjectMap[subject] = { total: 0, count: 0 };
    }
    subjectMap[subject].total += g.score;
    subjectMap[subject].count += 1;
  });

  const realSubjectsCount = Object.keys(subjectMap).length;
  const hasRealData = realSubjectsCount > 0;

  // Final list of subjects to display
  let chartData: ChartItem[] = [];

  if (hasRealData) {
    // Convert to array
    const realData = Object.keys(subjectMap).map((subject) => ({
      subject,
      score: Math.round(subjectMap[subject].total / subjectMap[subject].count),
    }));

    if (realData.length >= 3) {
      chartData = realData;
    } else {
      // Radar needs at least 3 points to render a polygon correctly.
      // Fill in with some core default subjects so the radar doesn't look empty or fail to render.
      const defaults = ["Mathematics", "Science", "Literature", "History"];
      const merged = [...realData];
      
      defaults.forEach((defSub) => {
        if (merged.length < 3 && !merged.some((m) => m.subject.toLowerCase() === defSub.toLowerCase())) {
          merged.push({ subject: defSub, score: 0 }); // 0 score as placeholder
        }
      });
      chartData = merged;
    }
  }

  // Find max and average score
  const scores = chartData.map(d => d.score);
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-lg border border-gray-800 text-xs">
          <p className="font-bold mb-1">{payload[0].payload.subject}</p>
          <p className="text-[#10B981] font-semibold flex items-center gap-1">
            Average Score: <span className="text-sm font-black">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100/80 shadow-sm flex flex-col h-full min-h-[400px] justify-between">
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-6 h-6 text-brand-secondary fill-blue-50" />
              Subject Performance
            </h3>
            <p className="text-sm text-gray-500 mt-1">Academic mastery across disciplines</p>
          </div>
        </div>

        {!hasRealData && (
          <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 p-3 rounded-2xl text-[11px] text-gray-500 leading-relaxed mb-4">
            <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <span>
              You haven't logged any grades yet. Add grades in the <strong>Grade Tracker</strong> to see your personalized academic radar!
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 w-full h-[240px] flex items-center justify-center my-2">
        {hasRealData ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: '#94A3B8', fontSize: 9 }}
                axisLine={false}
              />
              <Radar
                name="Mastery"
                dataKey="score"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.15}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-300 text-sm font-medium">No performance data to display.</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Top Area</div>
            <div className="text-sm font-bold text-gray-900 leading-none">
              {maxScore > 0 ? `${chartData.find(d => d.score === maxScore)?.subject} (${maxScore}%)` : "N/A"}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Mean Score</div>
            <div className="text-sm font-bold text-gray-900 leading-none">{avgScore}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
