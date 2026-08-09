import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Target, 
  TrendingUp, 
  Plus,
  MoreVertical,
  Timer,
  Zap,
  ArrowRight,
  Mail,
  Send,
  Inbox,
  AlertCircle,
  Loader2,
  CheckSquare,
  Square,
  Trash2,
  FileText,
  User,
  Sparkles
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/components/auth/AuthContext";
import PomodoroTimer from "@/src/components/productivity/PomodoroTimer";

interface TaskItem {
  id: string;
  title: string;
  status: "completed" | "needsAction";
  due?: string;
  notes?: string;
}

interface TaskList {
  id: string;
  title: string;
}

interface CloudEmailMessage {
  id: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
}

export default function Productivity() {
  const { googleAccessToken, connectGoogle: connectCloud } = useAuth();
  
  // Tab control: "tasks" | "gmail" | "pomodoro"
  const [activeSubTab, setActiveSubTab] = useState<"tasks" | "gmail" | "pomodoro">("tasks");
  
  // Cloud Tasks states
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  
  // CloudEmail states
  const [emails, setEmails] = useState<CloudEmailMessage[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<CloudEmailMessage | null>(null);
  
  // Composition state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  
  // Synchronization warning / alerts
  const [errorMsg, setErrorMsg] = useState("");

  // Sync / load trigger
  useEffect(() => {
    if (googleAccessToken) {
      if (activeSubTab === "tasks") {
        fetchTaskLists();
      } else if (activeSubTab === "gmail") {
        fetchCloudEmailMessages();
      }
    } else {
      // Fallback
      if (activeSubTab === "tasks") {
        setTasks([]);
      } else if (activeSubTab === "gmail") {
        setEmails([]);
      }
    }
  }, [googleAccessToken, activeSubTab]);

  // Handle selected task list change
  useEffect(() => {
    if (googleAccessToken && selectedListId) {
      fetchTasksForList(selectedListId);
    }
  }, [selectedListId]);

  // Fetch Cloud Task Lists
  const fetchTaskLists = async () => {
    setLoadingTasks(true);
    setErrorMsg("");
    try {
      const res = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        const lists = data.items || [];
        setTaskLists(lists);
        if (lists.length > 0) {
          setSelectedListId(lists[0].id);
        }
      } else {
        setErrorMsg("Failed to retrieve Task Lists. Make sure Tasks scope is authorized.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Network error retrieving Cloud Tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  // Fetch Tasks inside selected list
  const fetchTasksForList = async (listId: string) => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true`, {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Add Cloud Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (!googleAccessToken) {
      alert("Please connect to Workspace to manage Tasks.");
      return;
    }

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newTaskTitle.trim()
        })
      });
      if (res.ok) {
        setNewTaskTitle("");
        fetchTasksForList(selectedListId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Complete status on Cloud Task
  const handleToggleTask = async (task: TaskItem) => {
    const nextStatus = task.status === "completed" ? "needsAction" : "completed";
    
    if (!googleAccessToken) {
      alert("Please connect to Workspace to manage Tasks.");
      return;
    }

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: task.id,
          title: task.title,
          status: nextStatus
        })
      });
      if (res.ok) {
        fetchTasksForList(selectedListId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch CloudEmail inbox messages
  const fetchCloudEmailMessages = async () => {
    setLoadingEmails(true);
    setErrorMsg("");
    try {
      const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8", {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.messages || [];
        
        // Fetch detailed message headers for each email
        const detailedEmails = await Promise.all(
          list.map(async (msg: { id: string }) => {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
              headers: { Authorization: `Bearer ${googleAccessToken}` }
            });
            if (detailRes.ok) {
              const detail = await detailRes.json();
              const headers = detail.payload?.headers || [];
              const subject = headers.find((h: any) => h.name === "Subject")?.value || "No Subject";
              const from = headers.find((h: any) => h.name === "From")?.value || "Unknown Sender";
              const dateHeader = headers.find((h: any) => h.name === "Date")?.value || "";
              
              return {
                id: msg.id,
                snippet: detail.snippet || "",
                subject,
                from,
                date: new Date(dateHeader).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
            }
            return null;
          })
        );
        setEmails(detailedEmails.filter(Boolean) as CloudEmailMessage[]);
      } else {
        setErrorMsg("Failed to retrieve CloudEmail inbox. Ensure Cloud Email permissions are authorized.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Network error connecting to CloudEmail.");
    } finally {
      setLoadingEmails(false);
    }
  };

  // Send an email message via CloudEmail
  const handleSendCloudEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) return;

    if (!googleAccessToken) {
      alert("Please connect your Workspace Account first to send real emails.");
      return;
    }

    setSendingEmail(true);
    try {
      // Helper to encode to web-safe base64
      const makeEmailStr = (to: string, subject: string, body: string) => {
        const str = [
          "Content-Type: text/plain; charset=\"UTF-8\"\r\n",
          "MIME-Version: 1.0\r\n",
          `To: ${to}\r\n`,
          `Subject: ${subject}\r\n\r\n`,
          body
        ].join("");
        return btoa(unescape(encodeURIComponent(str)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
      };

      const raw = makeEmailStr(composeTo.trim(), composeSubject.trim(), composeBody.trim());
      
      const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw })
      });

      if (res.ok) {
        alert(`✉️ Email successfully sent to ${composeTo}!`);
        setComposeTo("");
        setComposeSubject("");
        setComposeBody("");
        setShowCompose(false);
        fetchCloudEmailMessages();
      } else {
        const err = await res.json();
        console.error("Cloud Email Send Error:", err);
        alert("Failed to send email. Check your scopes or recipient address.");
      }
    } catch (e) {
      console.error(e);
      alert("Error occurred while sending the email.");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header and sync status */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Productivity Center</h1>
          <p className="text-gray-500 text-sm">Optimize your workflow with real Cloud Tasks, live Cloud Email, and Pomodoro timers.</p>
        </div>
        
        {!googleAccessToken ? (
          <button 
            onClick={connectCloud}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-md text-xs uppercase tracking-wider"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Connect Workspace Account</span>
          </button>
        ) : (
          <div className="bg-emerald-50 border border-green-200 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-xs text-green-800 font-semibold">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Workspace Synchronized</span>
          </div>
        )}
      </header>

      {/* Primary Sub-Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab("tasks")}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
              activeSubTab === "tasks" ? "bg-brand-primary text-white" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>My Cloud Tasks</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab("gmail")}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
              activeSubTab === "gmail" ? "bg-brand-primary text-white" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Mail className="w-4 h-4" />
            <span>Cloud Email Assistant</span>
          </button>

          <button
            onClick={() => setActiveSubTab("pomodoro")}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
              activeSubTab === "pomodoro" ? "bg-brand-primary text-white" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Clock className="w-4 h-4" />
            <span>Pomodoro Clock</span>
          </button>
        </div>
      </div>

      {/* Global Error Display */}
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SUB-TAB VIEWS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT/MID TWO-COLUMNS MAIN WORKSPACE */}
        <div className="lg:col-span-2 space-y-6">

          {/* VIEW 1: GOOGLE TASKS */}
          {activeSubTab === "tasks" && (
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Workspace Daily Schedule</h2>
                    <p className="text-gray-400 text-xs">Directly synchronized with Cloud Tasks.</p>
                  </div>
                </div>

                {/* Task List Selector */}
                {googleAccessToken && taskLists.length > 0 && (
                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="p-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-brand-primary"
                  >
                    {taskLists.map(list => (
                      <option key={list.id} value={list.id}>{list.title}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Task Adding Form */}
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter study task, chapter summary goal..."
                  className="flex-1 p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-brand-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-95 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </form>

              {/* Live Tasks Listing */}
              {loadingTasks ? (
                <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                  <span>Fetching lists from Cloud...</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-[24rem] overflow-y-auto pr-1">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs">
                      No active tasks in this schedule. Add one above!
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div 
                        key={task.id}
                        onClick={() => handleToggleTask(task)}
                        className={cn(
                          "flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all",
                          task.status === "completed" 
                            ? "bg-gray-50/75 border-gray-100 opacity-60" 
                            : "bg-white border-gray-100 hover:border-brand-primary/10 hover:shadow-sm"
                        )}
                      >
                        <button className="text-gray-400 hover:text-brand-primary flex-shrink-0 transition-colors">
                          {task.status === "completed" ? (
                            <CheckSquare className="w-5 h-5 text-green-500" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-xs font-bold truncate",
                            task.status === "completed" ? "line-through text-gray-500" : "text-gray-800"
                          )}>
                            {task.title}
                          </p>
                          {task.notes && (
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{task.notes}</p>
                          )}
                        </div>
                        {task.due && (
                          <span className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md font-medium">
                            {task.due}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: GMAIL ASSISTANT & COMMUNICATIONS */}
          {activeSubTab === "gmail" && (
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Academic Email Assistant</h2>
                    <p className="text-gray-400 text-xs">Access real-time student communications.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCompose(!showCompose)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> {showCompose ? "View Inbox" : "Compose Mail"}
                </button>
              </div>

              {showCompose ? (
                /* Composition Form */
                <form onSubmit={handleSendCloudEmail} className="space-y-4 border border-gray-100 p-4 rounded-2xl bg-gray-50/30">
                  <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-2">New Email Message</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Recipient Address</label>
                      <input
                        type="email"
                        required
                        value={composeTo}
                        onChange={(e) => setComposeTo(e.target.value)}
                        placeholder="e.g. professor@college.edu"
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Subject</label>
                      <input
                        type="text"
                        required
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                        placeholder="e.g. Inquiry on Biology Exam Structure"
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Message Body</label>
                    <textarea
                      required
                      value={composeBody}
                      onChange={(e) => setComposeBody(e.target.value)}
                      rows={6}
                      placeholder="Write your email body..."
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-brand-primary font-sans leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCompose(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingEmail}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      {sendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Send className="w-3.5 h-3.5" />}
                      Send Email
                    </button>
                  </div>
                </form>
              ) : (
                /* Inbox Listing */
                <div className="space-y-4">
                  
                  {/* Selected Email Detail Modal */}
                  {selectedEmail && (
                    <div className="p-5 border border-indigo-100 bg-indigo-50/30 rounded-2xl space-y-3 relative">
                      <button 
                        onClick={() => setSelectedEmail(null)}
                        className="absolute top-4 right-4 text-xs font-bold text-gray-400 hover:text-gray-900"
                      >
                        Close
                      </button>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          Selected Message
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm mt-1">{selectedEmail.subject}</h4>
                        <p className="text-[10px] text-gray-500 font-medium">From: {selectedEmail.from}</p>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed bg-white p-3.5 rounded-xl border border-gray-100">
                        {selectedEmail.snippet}
                      </p>
                    </div>
                  )}

                  {loadingEmails ? (
                    <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                      <span>Checking inbox...</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 max-h-[24rem] overflow-y-auto pr-1">
                      {emails.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-xs">
                          Inbox empty or no workspace emails found.
                        </div>
                      ) : (
                        emails.map((email) => (
                          <div
                            key={email.id}
                            onClick={() => setSelectedEmail(email)}
                            className="py-3 px-2 flex items-start gap-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-all"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                              <Inbox className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between items-center mb-0.5">
                                <h4 className="text-xs font-bold text-gray-800 truncate pr-4">{email.from}</h4>
                                <span className="text-[9px] text-gray-400 font-medium">{email.date}</span>
                              </div>
                              <p className="text-xs font-bold text-gray-900 truncate mb-0.5">{email.subject}</p>
                              <p className="text-[10px] text-gray-400 truncate">{email.snippet}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: POMODORO CLOCK */}
          {activeSubTab === "pomodoro" && (
            <PomodoroTimer />
          )}

        </div>

        {/* RIGHT SIDE PANEL: Habit Tracker & AI Planner suggestions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2.5 text-gray-900">
              <TrendingUp className="text-brand-primary w-5 h-5" />
              <span>Habit Tracker</span>
            </h2>
            <div className="space-y-4">
              {["Daily Reading", "Python Coding", "Exercise", "Meditation"].map((habit, i) => (
                <div key={habit} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <span>{habit}</span>
                    <span className="text-brand-primary">85%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                      className="h-full bg-brand-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-primary/20 space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-brand-secondary fill-brand-secondary" />
              <h3 className="text-xl font-bold">Workspace AI Planner</h3>
            </div>
            <p className="text-xs text-white/85 leading-relaxed">
              Use Gemini to synthesize study reminders from your CloudEmail inbox and structure automatic tasks on your Cloud Tasks list!
            </p>
            <button className="w-full bg-white text-brand-primary py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
              <span>Synthesize Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
