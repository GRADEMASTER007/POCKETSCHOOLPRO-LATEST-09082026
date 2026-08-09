import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  BookOpen, 
  TrendingUp, 
  CheckCircle,
  X,
  Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

// Strict Firebase Integration Skill Compliance
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleLocalFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.warn('Firestore Error in ExamCountdown: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface Exam {
  id: string;
  userId: string;
  title: string;
  subject: string;
  examDate: number; // UTC millisecond timestamp
}

export default function ExamCountdown() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [examDateStr, setExamDateStr] = useState("");
  const [examTimeStr, setExamTimeStr] = useState("09:00");
  const [timeTick, setTimeTick] = useState(Date.now());

  // Real-time ticking for precision countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time listener for exams
  useEffect(() => {
    if (!auth.currentUser) return;

    const path = "exams";
    const q = query(
      collection(db, path),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        } as Exam));
        // Sort exams by date ascending
        list.sort((a, b) => a.examDate - b.examDate);
        setExams(list);
        setLoading(false);
      },
      (error) => {
        handleLocalFirestoreError(error, OperationType.GET, path);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !title.trim() || !subject.trim() || !examDateStr) return;

    // Combine date and time strings into a timestamp
    const datetimeStr = `${examDateStr}T${examTimeStr || "09:00"}`;
    const timestamp = new Date(datetimeStr).getTime();

    if (isNaN(timestamp)) {
      alert("Please select a valid date and time.");
      return;
    }

    const path = "exams";
    const newExamPayload = {
      userId: auth.currentUser.uid,
      title: title.trim(),
      subject: subject.trim(),
      examDate: timestamp,
    };

    try {
      await addDoc(collection(db, path), newExamPayload);
      // Reset form
      setTitle("");
      setSubject("");
      setExamDateStr("");
      setExamTimeStr("09:00");
      setShowAddForm(false);
    } catch (err) {
      handleLocalFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    const path = `exams/${examId}`;
    try {
      await deleteDoc(doc(db, "exams", examId));
    } catch (err) {
      handleLocalFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Pre-configured list of sample exams if database is empty
  const getDisplayExams = (): { examsList: Exam[]; isSample: boolean } => {
    if (exams.length > 0) {
      return { examsList: exams, isSample: false };
    }
    
    // Sample high-fidelity fallback data
    const futureDate1 = Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000 + 12 * 60 * 1000;
    const futureDate2 = Date.now() + 14 * 24 * 60 * 60 * 1000;
    const futureDate3 = Date.now() + 28 * 24 * 60 * 60 * 1000;

    return {
      examsList: [
        {
          id: "sample-1",
          userId: "sample",
          title: "Midterm Examination",
          subject: "Mathematics",
          examDate: futureDate1
        },
        {
          id: "sample-2",
          userId: "sample",
          title: "Organic Chemistry Quiz",
          subject: "Science",
          examDate: futureDate2
        },
        {
          id: "sample-3",
          userId: "sample",
          title: "World War II Thesis Defense",
          subject: "History",
          examDate: futureDate3
        }
      ],
      isSample: true
    };
  };

  const { examsList, isSample } = getDisplayExams();

  // Find the nearest upcoming exam
  const nearestExam = examsList.find(e => e.examDate > timeTick);

  // Helper to calculate exact countdown
  const getCountdown = (targetTime: number) => {
    const diff = targetTime - timeTick;
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, passed: false };
  };

  // Helper to get motivation text
  const getMotivation = (days: number, passed: boolean) => {
    if (passed) return { text: "Exam concluded! Review your grades.", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    if (days === 0) return { text: "Today is the day! Deep breaths, you are ready.", color: "text-red-600 bg-red-50 border-red-100 animate-pulse" };
    if (days === 1) return { text: "Tomorrow! Review key terms and sleep early.", color: "text-amber-600 bg-amber-50 border-amber-100" };
    if (days <= 3) return { text: "Final stretch! Focus on your weakest topics.", color: "text-amber-600 bg-amber-50 border-amber-100" };
    if (days <= 7) return { text: "Keep practicing daily quizzes and flashcards.", color: "text-blue-600 bg-blue-50 border-blue-100" };
    return { text: "Plenty of prep time. Keep a steady review routine.", color: "text-slate-600 bg-slate-50 border-gray-100" };
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100/80 shadow-sm flex flex-col h-full min-h-[400px] justify-between relative overflow-hidden">
      
      {/* Header section */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-500 fill-indigo-50" />
              Exam Countdown
            </h3>
            <p className="text-sm text-gray-500 mt-1">Countdown to major test dates</p>
          </div>
          
          <div className="flex items-center gap-2">
            {isSample && (
              <span className="flex items-center gap-1 bg-amber-50 border border-amber-200/50 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-700">
                <Sparkles className="w-3 h-3" />
                Sample
              </span>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={cn(
                "p-2 rounded-xl transition-all border shadow-sm flex items-center justify-center",
                showAddForm 
                  ? "bg-red-50 border-red-100 text-red-500 hover:bg-red-100" 
                  : "bg-slate-900 border-slate-950 text-white hover:bg-slate-800"
              )}
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Info Tip about live data */}
        {isSample && !showAddForm && (
          <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 p-3 rounded-2xl text-[11px] text-gray-500 leading-relaxed mb-4">
            <Lightbulb className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <span>
              Click the <strong>+</strong> button to add your actual exam dates!
            </span>
          </div>
        )}
      </div>

      {/* Main interactive area */}
      <div className="flex-1 flex flex-col justify-center my-2">
        <AnimatePresence mode="wait">
          {showAddForm ? (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleAddExam}
              className="space-y-3.5 bg-slate-50/50 p-4 rounded-2xl border border-gray-100"
            >
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add New Exam
              </h4>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Exam Title / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AP Calculus Final Exam"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Subject / Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Exam Time
                  </label>
                  <input
                    type="time"
                    required
                    value={examTimeStr}
                    onChange={(e) => setExamTimeStr(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  required
                  value={examDateStr}
                  onChange={(e) => setExamDateStr(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors mt-2"
              >
                Add Upcoming Exam
              </button>
            </motion.form>
          ) : nearestExam ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Highlight Spotlight Card for nearest exam */}
              <div className="bg-indigo-50/40 border border-indigo-100/70 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <span className="bg-indigo-600/10 text-indigo-600 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Next Up
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-indigo-600 bg-white border border-indigo-100 px-2 py-0.5 rounded-full">
                    {nearestExam.subject}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-800 mb-3 truncate pr-16">
                  {nearestExam.title}
                </h4>

                {/* Big Ticking Numbers */}
                {(() => {
                  const cd = getCountdown(nearestExam.examDate);
                  const motiv = getMotivation(cd.days, cd.passed);
                  return (
                    <>
                      <div className="grid grid-cols-4 gap-2 mb-3.5">
                        <div className="bg-white rounded-xl p-2.5 text-center border border-indigo-100/50 shadow-sm">
                          <div className="text-xl font-black text-indigo-600 tabular-nums leading-none">
                            {cd.days}
                          </div>
                          <div className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Days</div>
                        </div>
                        <div className="bg-white rounded-xl p-2.5 text-center border border-indigo-100/50 shadow-sm">
                          <div className="text-xl font-black text-indigo-600 tabular-nums leading-none">
                            {cd.hours}
                          </div>
                          <div className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Hrs</div>
                        </div>
                        <div className="bg-white rounded-xl p-2.5 text-center border border-indigo-100/50 shadow-sm">
                          <div className="text-xl font-black text-indigo-600 tabular-nums leading-none">
                            {cd.minutes}
                          </div>
                          <div className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Mins</div>
                        </div>
                        <div className="bg-white rounded-xl p-2.5 text-center border border-indigo-100/50 shadow-sm">
                          <div className="text-xl font-black text-indigo-600 tabular-nums leading-none">
                            {cd.seconds}
                          </div>
                          <div className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Secs</div>
                        </div>
                      </div>

                      <div className={cn("text-[10px] font-bold border rounded-xl px-3 py-2 flex items-center gap-1.5", motiv.color)}>
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{motiv.text}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Smaller List for other exams */}
              {examsList.length > 1 && (
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-1">Other Upcoming Tests</div>
                  {examsList.map((exam) => {
                    if (exam.id === nearestExam.id) return null;
                    const cd = getCountdown(exam.examDate);
                    const isPassed = cd.passed;
                    return (
                      <div
                        key={exam.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-gray-400 uppercase truncate max-w-[80px]">
                              {exam.subject}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-[9px] text-gray-400 font-medium">
                              {new Date(exam.examDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-gray-800 truncate mt-0.5">
                            {exam.title}
                          </h5>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              isPassed 
                                ? "bg-slate-50 text-gray-400" 
                                : cd.days <= 3 
                                  ? "bg-amber-50 text-amber-600 font-extrabold" 
                                  : "bg-indigo-50 text-indigo-600"
                            )}>
                              {isPassed ? "Ended" : `In ${cd.days}d`}
                            </span>
                          </div>

                          {!isSample && (
                            <button
                              onClick={() => handleDeleteExam(exam.id)}
                              className="p-1 rounded bg-transparent hover:bg-red-50 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete Exam"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200"
            >
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">No exams scheduled</p>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[180px] mx-auto">
                Add dates to keep track and stay motivated!
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white font-bold text-[10px] rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-3 h-3" /> Add Exam
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer controls (e.g. Delete nearest exam if live) */}
      {!showAddForm && nearestExam && !isSample && (
        <div className="flex justify-end border-t border-gray-100 pt-3 mt-2">
          <button
            onClick={() => handleDeleteExam(nearestExam.id)}
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-500 font-bold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Nearest Exam
          </button>
        </div>
      )}

      {/* Spacer when no operations needed */}
      {!showAddForm && (isSample || !nearestExam) && (
        <div className="h-4"></div>
      )}

    </div>
  );
}
