import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Plus, 
  Check, 
  Trash2, 
  Calendar, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  CheckCircle2, 
  Circle, 
  Flame, 
  BookOpen, 
  AlertCircle,
  HelpCircle,
  Clock,
  CheckSquare
} from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

interface Milestone {
  id: string;
  userId: string;
  subject: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "not_started";
  dueDate: string;
  order: number;
  subTasks: SubTask[];
}

const DEFAULT_SUBJECTS = ["Cambridge Physics", "Sustainable Agriculture", "Solar PV Engineering", "Inclusive Learning Aids"];

const INITIAL_ROADMAPS: Omit<Milestone, "userId">[] = [
  {
    id: "cambridge_1",
    subject: "Cambridge Physics",
    title: "Unit 1: Newtonian Mechanics",
    description: "Kinematics, dynamic friction, and drag resistance in multiple dimensions.",
    status: "in_progress",
    dueDate: "Jul 28",
    order: 0,
    subTasks: [
      { id: "cambridge_1_t1", text: "Derive 3D kinematics equations for projectile paths", completed: true },
      { id: "cambridge_1_t2", text: "Solve advanced friction vectors with incline angles", completed: false },
      { id: "cambridge_1_t3", text: "Review OpenStax University Physics Chapter 3", completed: false }
    ]
  },
  {
    id: "agri_1",
    subject: "Sustainable Agriculture",
    title: "Unit 1: Soil Remediation & Nutrients",
    description: "Regenerating degraded arable lands through organic compost mixes, crop rotations, and nitrogen-fixation.",
    status: "in_progress",
    dueDate: "Jul 30",
    order: 1,
    subTasks: [
      { id: "agri_1_t1", text: "Test soil nitrogen-phosphorus-potassium (NPK) baseline values", completed: true },
      { id: "agri_1_t2", text: "Draft 4-year crop rotation schedule for mixed crop systems", completed: false },
      { id: "agri_1_t3", text: "Review FAO Regenerative Crop Rotation handbook guidelines", completed: false }
    ]
  },
  {
    id: "solar_1",
    subject: "Solar PV Engineering",
    title: "Unit 1: Array Mounting & Geometry",
    description: "Installing structural mounting brackets with proper tilt angles matching regional solar insulation peaks.",
    status: "not_started",
    dueDate: "Aug 02",
    order: 2,
    subTasks: [
      { id: "solar_1_t1", text: "Calculate optimal latitude-dependent tilt angles for mounting racks", completed: false },
      { id: "solar_1_t2", text: "Bolt solar rail channels onto load-bearing roof structures", completed: false }
    ]
  },
  {
    id: "inclusive_1",
    subject: "Inclusive Learning Aids",
    title: "Unit 1: Braille Cell Mechanics",
    description: "Mastering the standard six-dot Braille configuration for basic letters, numbers, and arithmetic symbols.",
    status: "not_started",
    dueDate: "Jul 25",
    order: 3,
    subTasks: [
      { id: "inclusive_1_t1", text: "Memorize cell dot structures for alphabets a through j", completed: false },
      { id: "inclusive_1_t2", text: "Practice embossing simple sentences using a mechanical slate & stylus", completed: false }
    ]
  }
];

export default function StudyRoadmap() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("Biochemistry");
  const [loading, setLoading] = useState(true);
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);

  const subjectsList = Array.from(
    new Set([
      ...milestones.map((m) => m.subject),
      ...DEFAULT_SUBJECTS
    ])
  );

  useEffect(() => {
    if (milestones.length > 0) {
      const activeSubjects = Array.from(new Set(milestones.map(m => m.subject)));
      if (activeSubjects.length > 0 && !activeSubjects.includes(selectedSubject)) {
        setSelectedSubject(activeSubjects[0]);
      }
    }
  }, [milestones, selectedSubject]);

  // New Milestone Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newTasksString, setNewTasksString] = useState(""); // Comma/newline separated
  const [submitting, setSubmitting] = useState(false);

  // Sync / Realtime Listen
  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }
    const uid = auth.currentUser.uid;

    const q = query(
      collection(db, "study_roadmaps"),
      where("userId", "==", uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items: Milestone[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data(), id: docSnap.id } as Milestone);
      });

      if (items.length === 0) {
        // Automatically initialize default roadmap on demand
        await initializeDefaultRoadmapForUser(uid);
      } else {
        setMilestones(items.sort((a, b) => a.order - b.order));
        setLoading(false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "study_roadmaps");
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Helper: Seed initial default roadmaps to Firestore
  const initializeDefaultRoadmapForUser = async (uid: string) => {
    try {
      const batch = writeBatch(db);
      INITIAL_ROADMAPS.forEach((m) => {
        const customId = `${uid}_${m.id}`;
        const ref = doc(db, "study_roadmaps", customId);
        batch.set(ref, {
          ...m,
          id: customId,
          userId: uid
        });
      });
      await batch.commit();
    } catch (err) {
      console.error("Failed to seed default study roadmap:", err);
    }
  };

  // Switch expanded milestone on active subject change to first matching one
  useEffect(() => {
    const activeList = milestones.filter(m => m.subject === selectedSubject);
    if (activeList.length > 0) {
      // Find the first in-progress or incomplete milestone
      const firstActive = activeList.find(m => m.status === "in_progress") || activeList[0];
      setExpandedMilestoneId(firstActive.id);
    } else {
      setExpandedMilestoneId(null);
    }
  }, [selectedSubject, milestones]);

  // Recalculates and saves milestone state based on current subtasks
  const updateMilestoneInFirestore = async (milestone: Milestone, updatedSubTasks: SubTask[]) => {
    const completedCount = updatedSubTasks.filter(t => t.completed).length;
    let newStatus: "completed" | "in_progress" | "not_started" = "not_started";

    if (updatedSubTasks.length > 0) {
      if (completedCount === updatedSubTasks.length) {
        newStatus = "completed";
      } else if (completedCount > 0) {
        newStatus = "in_progress";
      }
    }

    try {
      const ref = doc(db, "study_roadmaps", milestone.id);
      await setDoc(ref, {
        ...milestone,
        subTasks: updatedSubTasks,
        status: newStatus
      }, { merge: true });
    } catch (err) {
      console.error("Error updating milestone state:", err);
    }
  };

  // Toggle Sub-task Completion
  const handleToggleSubTask = async (milestone: Milestone, subTaskId: string) => {
    const updated = milestone.subTasks.map(t => {
      if (t.id === subTaskId) return { ...t, completed: !t.completed };
      return t;
    });
    await updateMilestoneInFirestore(milestone, updated);
  };

  // Delete Milestone
  const handleDeleteMilestone = async (id: string) => {
    try {
      await deleteDoc(doc(db, "study_roadmaps", id));
      if (expandedMilestoneId === id) setExpandedMilestoneId(null);
    } catch (err) {
      console.error("Error deleting roadmap milestone:", err);
    }
  };

  // Add New Milestone Form Submit
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !auth.currentUser) return;

    setSubmitting(true);
    const uid = auth.currentUser.uid;

    // Build subtasks from string
    const parsedSubTasks: SubTask[] = newTasksString
      .split(/[\n,]/)
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map((text, index) => ({
        id: `custom_${Date.now()}_${index}`,
        text,
        completed: false
      }));

    const subjectMilestones = milestones.filter(m => m.subject === selectedSubject);
    const nextOrder = subjectMilestones.length > 0 
      ? Math.max(...subjectMilestones.map(m => m.order)) + 1 
      : 0;

    const newMilestone: Milestone = {
      id: `m_${Date.now()}`,
      userId: uid,
      subject: selectedSubject,
      title: newTitle.trim(),
      description: newDescription.trim() || "Custom learning target.",
      status: "not_started",
      dueDate: newDueDate.trim() || "Upcoming",
      order: nextOrder,
      subTasks: parsedSubTasks
    };

    try {
      const ref = doc(db, "study_roadmaps", newMilestone.id);
      await setDoc(ref, newMilestone);
      
      // Reset inputs
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
      setNewTasksString("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add custom milestone:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Hard Reset to Standard Templates
  const handleResetTemplates = async () => {
    if (!auth.currentUser) return;
    if (!window.confirm("Are you sure you want to reset your curriculum roadmaps to standard default templates? Custom items will be deleted.")) return;

    setLoading(true);
    const uid = auth.currentUser.uid;

    try {
      const batch = writeBatch(db);
      // Delete existing
      milestones.forEach((m) => {
        batch.delete(doc(db, "study_roadmaps", m.id));
      });
      // Add defaults
      INITIAL_ROADMAPS.forEach((m) => {
        const ref = doc(collection(db, "study_roadmaps"));
        batch.set(ref, {
          ...m,
          userId: uid
        });
      });
      await batch.commit();
    } catch (err) {
      console.error("Failed to reset templates:", err);
      setLoading(false);
    }
  };

  // Filter milestones by active subject
  const activeMilestones = milestones.filter(m => m.subject === selectedSubject);

  // Overall Subject Progress Calculation
  const totalSubTasks = activeMilestones.reduce((acc, curr) => acc + curr.subTasks.length, 0);
  const completedSubTasks = activeMilestones.reduce((acc, curr) => acc + curr.subTasks.filter(t => t.completed).length, 0);
  const subjectProgressPercent = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-full relative" id="study-roadmap-widget">
      <div>
        {/* Widget Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50 flex-wrap gap-2">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5 text-blue-500" /> Milestone Stepper
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Study Roadmap
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(prev => !prev)}
              className={cn(
                "p-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1 border",
                showAddForm 
                  ? "bg-slate-900 text-white border-transparent" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-100"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Unit
            </button>
            <button
              onClick={handleResetTemplates}
              className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-all"
              title="Reset to default roadmaps"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subject Navigation Pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-5 select-none scrollbar-none border-b border-gray-50/50">
          {subjectsList.map((sub) => {
            const count = milestones.filter(m => m.subject === sub).length;
            const subCompleted = count > 0 && milestones.filter(m => m.subject === sub).every(m => m.status === "completed");
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shrink-0 border relative",
                  selectedSubject === sub
                    ? "bg-blue-600 text-white border-transparent shadow-sm font-black"
                    : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                )}
              >
                {sub}
                {count > 0 && (
                  <span className={cn(
                    "ml-1.5 px-1 py-0.5 rounded text-[8px] font-black",
                    selectedSubject === sub ? "bg-blue-800 text-white" : "bg-gray-200 text-gray-600"
                  )}>
                    {count}
                  </span>
                )}
                {subCompleted && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white w-3 h-3 rounded-full flex items-center justify-center text-[7px] border-2 border-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Form to Add Custom Milestone / Unit */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddMilestone}
              className="mb-5 p-4 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden space-y-3"
            >
              <div className="flex justify-between items-center pb-1 border-b border-slate-200/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">New Roadmap Unit</span>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-black"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Unit 4: Fourier Transforms"
                  className="p-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold outline-none focus:border-blue-500 col-span-2"
                />
                <input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Short outline of curriculum focus..."
                  className="p-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold outline-none focus:border-blue-500 col-span-2"
                />
                <input
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  placeholder="Target date (e.g. Aug 10)"
                  className="p-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={submitting || !newTitle.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  Add Milestone
                </button>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Sub-Tasks (comma or line separated):
                </label>
                <textarea
                  value={newTasksString}
                  onChange={(e) => setNewTasksString(e.target.value)}
                  placeholder="e.g. Watch video lectures, Solve Problem Set 1, Read chapter 4"
                  className="w-full p-2 h-14 border border-slate-200 bg-white rounded-xl text-xs font-semibold outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Global Progress Bar for Selected Subject */}
        {activeMilestones.length > 0 && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 mb-5 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">
                  Overall Syllabus Completion
                </span>
                <span className="text-xs font-black text-blue-600">
                  {subjectProgressPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${subjectProgressPercent}%` }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-black text-slate-700">
                {completedSubTasks}/{totalSubTasks}
              </div>
              <span className="text-[8px] font-bold text-gray-400 uppercase">Tasks Done</span>
            </div>
          </div>
        )}

        {/* Vertical Progress-Stepper Path */}
        {loading ? (
          <div className="space-y-4 py-8">
            <div className="h-12 bg-gray-50 rounded-2xl animate-pulse"></div>
            <div className="h-12 bg-gray-50 rounded-2xl animate-pulse"></div>
            <div className="h-12 bg-gray-50 rounded-2xl animate-pulse"></div>
          </div>
        ) : activeMilestones.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-500">No milestones yet for {selectedSubject}.</p>
            <p className="text-[10px] text-gray-400 mt-1">Tap 'Add Unit' above to build a custom study path!</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4">
            
            {/* The Vertical Line / Stepper Track */}
            <div className="absolute left-[9.5px] top-3 bottom-3 w-[3px] bg-slate-100 pointer-events-none rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-b from-blue-500 via-indigo-500 to-emerald-500 w-[3px] transition-all duration-700 origin-top"
                style={{ height: `${subjectProgressPercent}%` }}
              />
            </div>

            {/* Steps Rendering */}
            {activeMilestones.map((m, index) => {
              const isExpanded = expandedMilestoneId === m.id;
              
              // Determine status colors/icons
              let statusStyle = {
                dotClass: "border-gray-300 bg-white text-gray-400",
                icon: Circle,
                cardBorder: "border-gray-100",
                headerBg: "bg-white"
              };

              if (m.status === "completed") {
                statusStyle = {
                  dotClass: "border-emerald-500 bg-emerald-500 text-white shadow-emerald-100 shadow-md",
                  icon: Check,
                  cardBorder: "border-emerald-100 bg-emerald-50/20",
                  headerBg: "bg-emerald-50/30"
                };
              } else if (m.status === "in_progress") {
                statusStyle = {
                  dotClass: "border-blue-600 bg-blue-600 text-white shadow-blue-100 shadow-md animate-pulse",
                  icon: Sparkles,
                  cardBorder: "border-blue-100 shadow-xs",
                  headerBg: "bg-blue-50/10"
                };
              }

              const IconComponent = statusStyle.icon;

              // Calculate individual milestone completion
              const totalMTasks = m.subTasks.length;
              const completedMTasks = m.subTasks.filter(t => t.completed).length;
              const milestonePercent = totalMTasks > 0 ? Math.round((completedMTasks / totalMTasks) * 100) : 0;

              return (
                <div key={m.id} className="relative group/step">
                  
                  {/* Step Dot Connector */}
                  <div className="absolute -left-[22px] top-3 z-10">
                    <div className={cn(
                      "w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all",
                      statusStyle.dotClass
                    )}>
                      <IconComponent className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>

                  {/* Milestone Expandable Card */}
                  <div className={cn(
                    "border rounded-2xl transition-all duration-300 overflow-hidden",
                    statusStyle.cardBorder,
                    isExpanded ? "ring-2 ring-blue-500/10" : "hover:border-gray-200"
                  )}>
                    {/* Header Clickable Row */}
                    <div 
                      onClick={() => setExpandedMilestoneId(isExpanded ? null : m.id)}
                      className={cn(
                        "p-4 flex justify-between items-center cursor-pointer select-none",
                        statusStyle.headerBg
                      )}
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h4 className="text-xs font-black text-slate-800 truncate">
                            {m.title}
                          </h4>
                          {m.dueDate && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase">
                              <Calendar className="w-3 h-3 text-gray-300" />
                              {m.dueDate}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 truncate leading-relaxed">
                          {m.description}
                        </p>
                      </div>

                      {/* Right Status Badge */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                            m.status === "completed" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : m.status === "in_progress" 
                                ? "bg-blue-50 text-blue-700 border-blue-100" 
                                : "bg-gray-50 text-gray-500 border-gray-100"
                          )}>
                            {m.status.replace("_", " ")}
                          </span>
                          {totalMTasks > 0 && (
                            <div className="text-[8.5px] text-gray-400 font-bold mt-1">
                              {completedMTasks}/{totalMTasks} tasks ({milestonePercent}%)
                            </div>
                          )}
                        </div>
                        
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="border-t border-gray-50 bg-gray-50/20"
                        >
                          <div className="p-4 space-y-3">
                            <p className="text-xs text-gray-600 leading-normal font-semibold">
                              {m.description}
                            </p>

                            {/* Checklist */}
                            <div className="space-y-1.5">
                              <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-widest block">
                                Syllabus checklist:
                              </span>

                              {m.subTasks.length === 0 ? (
                                <div className="text-[10px] text-gray-400 italic py-1">
                                  No tasks mapped to this module. Add tasks below to start tracking.
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  {m.subTasks.map((task) => (
                                    <div 
                                      key={task.id}
                                      onClick={() => handleToggleSubTask(m, task.id)}
                                      className={cn(
                                        "flex items-start gap-2.5 p-2 bg-white border rounded-xl cursor-pointer transition-all hover:bg-slate-50",
                                        task.completed ? "border-emerald-100/60 bg-emerald-50/10" : "border-gray-100"
                                      )}
                                    >
                                      <div className="mt-0.5 shrink-0">
                                        {task.completed ? (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-gray-300" />
                                        )}
                                      </div>
                                      <span className={cn(
                                        "text-xs font-semibold leading-relaxed",
                                        task.completed ? "text-gray-400 line-through" : "text-gray-700"
                                      )}>
                                        {task.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Card Footer Actions */}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-50/80">
                              <span className="text-[9px] text-gray-400 font-bold italic">
                                order: {index + 1} of {activeMilestones.length}
                              </span>

                              <button
                                onClick={() => handleDeleteMilestone(m.id)}
                                className="text-gray-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Unit
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}
