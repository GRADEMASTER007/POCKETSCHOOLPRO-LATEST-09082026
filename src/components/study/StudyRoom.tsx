import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  arrayUnion, 
  setDoc,
  getDocs,
  where
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { useAuth } from "@/src/components/auth/AuthContext";
import { 
  Send, 
  Calendar, 
  Users, 
  MessageSquare, 
  Plus, 
  Loader2, 
  Check, 
  AlertCircle, 
  FileText, 
  Link2, 
  Chrome, 
  ExternalLink, 
  Sparkles,
  CheckCircle,
  Clock,
  Trash2,
  FileSpreadsheet,
  Tv,
  Video,
  MessageCircle,
  FileQuestion
} from "lucide-react";

interface StudyRoomDoc {
  id: string;
  name: string;
  members: string[];
  proposals?: Proposal[];
  linkedDocs?: LinkedDoc[];
  createdAt: any;
}

interface Proposal {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  creatorId: string;
  creatorName: string;
  votes: string[]; // member userIds who voted
}

interface LinkedDoc {
  id: string;
  name: string;
  url: string;
  type: "doc" | "sheet" | "slide" | "drive-file" | "form" | "chat";
  addedByName: string;
}

interface Message {
  id: string;
  roomId: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  createdAt: any;
}

export default function StudyRoom() {
  const { user, connectGoogle, googleAccessToken } = useAuth();
  const [searchParams] = useSearchParams();
  const urlRoomId = searchParams.get("roomId");
  
  // Navigation & selection
  const [rooms, setRooms] = useState<StudyRoomDoc[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<StudyRoomDoc | null>(null);

  // Auto-select room from query param
  useEffect(() => {
    if (urlRoomId && rooms.length > 0) {
      const match = rooms.find(r => r.id === urlRoomId);
      if (match && (!selectedRoom || selectedRoom.id !== urlRoomId)) {
        setSelectedRoom(match);
      }
    }
  }, [urlRoomId, rooms, selectedRoom]);
  const [activeTab, setActiveTab] = useState<"chat" | "scheduler" | "docs" | "contacts">("chat");
  const [loading, setLoading] = useState(true);

  // Lobby States
  const [newRoomName, setNewRoomName] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);

  // Room Detail States
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  // Proposal Form States
  const [propTitle, setPropTitle] = useState("");
  const [propDate, setPropDate] = useState("");
  const [propStart, setPropStart] = useState("");
  const [propEnd, setPropEnd] = useState("");
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [calendarCheckStatus, setCalendarCheckStatus] = useState<{
    checked: boolean;
    hasConflict: boolean;
    conflictTitle?: string;
  }>({ checked: false, hasConflict: false });

  // Drive integration states
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [customDocTitle, setCustomDocTitle] = useState("");
  const [customDocUrl, setCustomDocUrl] = useState("");
  const [customDocType, setCustomDocType] = useState<"doc" | "sheet" | "slide" | "form" | "chat">("doc");

  // Contacts integration states
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState("");
  const [contactsSearch, setContactsSearch] = useState("");
  const [invitedContacts, setInvitedContacts] = useState<string[]>([]);

  // Load All Study Rooms where user is a member
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "study_rooms"),
      where("members", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList: StudyRoomDoc[] = [];
      snapshot.forEach((doc) => {
        roomList.push({ id: doc.id, ...doc.data() } as StudyRoomDoc);
      });
      setRooms(roomList);
      setLoading(false);

      // Keep active room selection updated with fresh snapshot
      if (selectedRoom) {
        const updated = roomList.find(r => r.id === selectedRoom.id);
        if (updated) setSelectedRoom(updated);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "study_rooms");
      setLoading(false);
    });

    return unsubscribe;
  }, [user, selectedRoom?.id]);

  // Load Messages for the active room
  useEffect(() => {
    if (!selectedRoom) return;

    const q = query(
      collection(db, "room_messages"),
      where("roomId", "==", selectedRoom.id),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "room_messages");
    });

    return unsubscribe;
  }, [selectedRoom?.id]);

  // Handle room creation
  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || !user) return;
    setCreatingRoom(true);
    try {
      const roomId = `room_${Date.now()}`;
      await setDoc(doc(db, "study_rooms", roomId), {
        name: newRoomName.trim(),
        members: [user.uid],
        proposals: [],
        linkedDocs: [],
        createdAt: serverTimestamp(),
      });
      setNewRoomName("");
    } catch (e) {
      console.error("Failed to create study room:", e);
    } finally {
      setCreatingRoom(false);
    }
  };

  // Send message in chat
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedRoom) return;
    try {
      await addDoc(collection(db, "room_messages"), {
        roomId: selectedRoom.id,
        userId: user.uid,
        userName: user.displayName || "Student",
        userPhoto: user.photoURL || undefined,
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (e) {
      console.error("Failed to send message:", e);
    }
  };

  // Check proposed slot calendar conflicts
  const handleCheckCalendarConflicts = async (date: string, start: string, end: string) => {
    if (!googleAccessToken) {
      // Prompt OAuth link
      const token = await connectGoogle();
      if (!token) return;
    }

    if (!date || !start || !end) return;

    try {
      const startISO = new Date(`${date}T${start}:00`).toISOString();
      const endISO = new Date(`${date}T${end}:00`).toISOString();

      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(startISO)}&timeMax=${encodeURIComponent(endISO)}&singleEvents=true`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        const events = data.items || [];
        if (events.length > 0) {
          setCalendarCheckStatus({
            checked: true,
            hasConflict: true,
            conflictTitle: events[0].summary || "Existing Event"
          });
        } else {
          setCalendarCheckStatus({
            checked: true,
            hasConflict: false
          });
        }
      }
    } catch (e) {
      console.error("Failed to check conflicts:", e);
    }
  };

  // Propose a study time slot
  const handleProposeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRoom || !propTitle || !propDate || !propStart || !propEnd) return;

    setIsSubmittingProposal(true);
    try {
      const startTimeStr = `${propDate}T${propStart}:00`;
      const endTimeStr = `${propDate}T${propEnd}:00`;

      const newProposal: Proposal = {
        id: `prop_${Date.now()}`,
        title: propTitle.trim(),
        startTime: startTimeStr,
        endTime: endTimeStr,
        creatorId: user.uid,
        creatorName: user.displayName || "Student",
        votes: [user.uid] // Creator automatically votes up
      };

      const roomRef = doc(db, "study_rooms", selectedRoom.id);
      await updateDoc(roomRef, {
        proposals: arrayUnion(newProposal)
      });

      // Clear Form
      setPropTitle("");
      setPropDate("");
      setPropStart("");
      setPropEnd("");
      setCalendarCheckStatus({ checked: false, hasConflict: false });
    } catch (err) {
      console.error("Error creating proposal:", err);
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  // Toggle vote on a proposal
  const handleVote = async (proposalId: string) => {
    if (!user || !selectedRoom) return;

    try {
      const roomRef = doc(db, "study_rooms", selectedRoom.id);
      const updatedProposals = (selectedRoom.proposals || []).map((p) => {
        if (p.id === proposalId) {
          const hasVoted = p.votes.includes(user.uid);
          const newVotes = hasVoted 
            ? p.votes.filter(v => v !== user.uid) 
            : [...p.votes, user.uid];
          return { ...p, votes: newVotes };
        }
        return p;
      });

      await updateDoc(roomRef, { proposals: updatedProposals });
    } catch (e) {
      console.error("Failed to register vote:", e);
    }
  };

  // Add the winning slot to Calendar (mutating operation)
  const handleAddProposalToCalendar = async (proposal: Proposal) => {
    if (!googleAccessToken) {
      const token = await connectGoogle();
      if (!token) return;
    }

    // MANDATORY explicit confirmation before modifying calendar
    const confirmed = window.confirm(
      `Do you want to add the study session "${proposal.title}" to your primary Calendar?`
    );
    if (!confirmed) return;

    try {
      const startISO = new Date(proposal.startTime).toISOString();
      const endISO = new Date(proposal.endTime).toISOString();

      const url = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
      const body = {
        summary: `Grade Master: ${proposal.title}`,
        description: `Collaborative study group session. Room: ${selectedRoom?.name}`,
        start: { dateTime: startISO, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        end: { dateTime: endISO, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert(`🎉 Successfully added "${proposal.title}" to your Calendar!`);
      } else {
        throw new Error("Calendar insert failed");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to insert event to Calendar. Please check authorization.");
    }
  };

  // Fetch Cloud Drive Files
  const handleFetchDriveFiles = async () => {
    if (!googleAccessToken) {
      const token = await connectGoogle();
      if (!token) return;
    }

    setLoadingDrive(true);
    try {
      const res = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=8&fields=files(id,name,mimeType,webViewLink)", {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDriveFiles(data.files || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDrive(false);
    }
  };

  // Fetch Cloud Contacts (People API)
  const handleFetchContacts = async () => {
    if (!googleAccessToken) {
      const token = await connectGoogle();
      if (!token) return;
    }

    setLoadingContacts(true);
    setContactsError("");
    try {
      const res = await fetch("https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,photos,phoneNumbers&pageSize=50", {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.connections || []);
      } else {
        const errData = await res.json();
        console.error("Contacts error details:", errData);
        setContactsError("Failed to fetch contacts. Ensure you granted Contacts permissions.");
      }
    } catch (e) {
      console.error(e);
      setContactsError("Network error while fetching Cloud Contacts.");
    } finally {
      setLoadingContacts(false);
    }
  };

  // Invite Contact to Study Room (with user confirmation!)
  const handleInviteContact = async (contactName: string, contactEmail: string) => {
    if (!selectedRoom || !user) return;
    
    // MANDATORY confirmation dialog
    const confirmed = window.confirm(
      `Send an invitation link for "${selectedRoom.name}" to ${contactName} (${contactEmail})?`
    );
    if (!confirmed) return;

    try {
      // 1. Post invitation message in Study Room chat
      await addDoc(collection(db, "room_messages"), {
        roomId: selectedRoom.id,
        userId: user.uid,
        userName: user.displayName || "Student",
        userPhoto: user.photoURL || undefined,
        text: `✉️ Invited peer ${contactName} (${contactEmail}) to join this study room! Link: ${window.location.origin}/study`,
        createdAt: serverTimestamp(),
      });

      // 2. Add to invited local state
      setInvitedContacts(prev => [...prev, contactEmail]);
      alert(`🎉 Successfully sent invitation for "${selectedRoom.name}" to ${contactName}!`);
    } catch (err) {
      console.error("Failed to invite contact:", err);
      alert("Failed to send invite. Please try again.");
    }
  };

  // Link a custom doc link or drive file to study room
  const handleCreateMeet = async () => {
    if (!googleAccessToken) {
      const token = await connectGoogle();
      if (!token) return;
    }
    try {
      const res = await fetch("https://meet.googleapis.com/v2/spaces", {
        method: "POST",
        headers: { Authorization: `Bearer ${googleAccessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        const meetUrl = data.meetingUri;
        await addDoc(collection(db, "room_messages"), {
          roomId: selectedRoom!.id,
          userId: user!.uid,
          userName: user!.displayName || "Student",
          userPhoto: user!.photoURL || undefined,
          text: `🎥 Join my instant Video Meeting video call: ${meetUrl}`,
          createdAt: serverTimestamp(),
        });
      } else {
        alert("Failed to create Video Meeting. Please check your permissions.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateForm = async () => {
    if (!googleAccessToken) {
      const token = await connectGoogle();
      if (!token) return;
    }
    try {
      const res = await fetch("https://forms.googleapis.com/v1/forms", {
        method: "POST",
        headers: { Authorization: `Bearer ${googleAccessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ info: { title: `${selectedRoom?.name || 'Study Room'} - Practice Quiz`, documentTitle: 'Study Room Quiz' } })
      });
      if (res.ok) {
        const data = await res.json();
        await handleLinkDoc(data.info.title, data.responderUri, "form");
      } else {
        alert("Failed to create Google Form.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateChatSpace = async () => {
    if (!googleAccessToken) {
      const token = await connectGoogle();
      if (!token) return;
    }
    try {
      const res = await fetch("https://chat.googleapis.com/v1/spaces", {
        method: "POST",
        headers: { Authorization: `Bearer ${googleAccessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ spaceType: "SPACE", displayName: `${selectedRoom?.name || 'Study Room'} Group` })
      });
      if (res.ok) {
        const data = await res.json();
        const spaceId = data.name.replace('spaces/', '');
        const chatUrl = `https://mail.google.com/chat/u/0/#chat/space/${spaceId}`;
        await handleLinkDoc(`Chat: ${data.displayName}`, chatUrl, "chat");
      } else {
        alert("Failed to create Chat Space.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLinkDoc = async (title: string, url: string, type: "doc" | "sheet" | "slide" | "drive-file" | "form" | "chat") => {
    if (!selectedRoom || !user || !title || !url) return;

    try {
      const newDoc: LinkedDoc = {
        id: `doc_${Date.now()}`,
        name: title,
        url: url,
        type: type,
        addedByName: user.displayName || "Student"
      };

      const roomRef = doc(db, "study_rooms", selectedRoom.id);
      await updateDoc(roomRef, {
        linkedDocs: arrayUnion(newDoc)
      });

      setCustomDocTitle("");
      setCustomDocUrl("");
    } catch (e) {
      console.error("Failed to link document:", e);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* LOBBY VIEW */}
      {!selectedRoom ? (
        <div className="space-y-8">
          <header className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Study Room Hub
              </h1>
              <p className="text-gray-500 text-sm mt-1">Join study circles, coordinate scheduling with Calendar, and collaborate.</p>
            </div>
            
            {/* Create Room form */}
            <div className="flex gap-2 w-full md:w-auto">
              <input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="New Study Room Name..."
                className="p-3 border border-gray-200 rounded-xl text-sm focus:border-brand-primary outline-none"
              />
              <button 
                onClick={handleCreateRoom}
                disabled={creatingRoom || !newRoomName.trim()}
                className="bg-brand-primary text-white py-3 px-5 rounded-xl font-bold text-sm flex items-center gap-1.5 hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                {creatingRoom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length === 0 ? (
              <div className="md:col-span-3 text-center py-12 bg-white rounded-[2rem] border border-dashed border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-700">No active study rooms</h3>
                <p className="text-gray-400 text-sm mt-1">Create your first study circle at the top to start peer scheduling!</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div 
                  key={room.id}
                  onClick={() => {
                    setSelectedRoom(room);
                    setActiveTab("chat");
                  }}
                  className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-52 group"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] bg-gray-50 border border-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold">
                        {room.members.length} Members
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mt-4 group-hover:text-brand-primary transition-colors">
                      {room.name}
                    </h3>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs font-bold text-brand-primary uppercase tracking-wider border-t border-gray-50 pt-3 mt-3">
                    <span>Enter Study Circle</span>
                    <span>→</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        
        /* ROOM DETAIL VIEW */
        <div className="space-y-6">
          
          {/* Header & Tabs */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <button 
                  onClick={() => setSelectedRoom(null)}
                  className="text-xs font-bold text-gray-400 hover:text-gray-900 mb-1 block"
                >
                  ← Back to Study Room Hub
                </button>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRoom.name}</h2>
              </div>

              {/* Connected Google Badge */}
              {googleAccessToken ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-xl text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Workspace Connected
                </div>
              ) : (
                <button
                  onClick={connectGoogle}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <Chrome className="w-4 h-4" />
                  Connect Workspace
                </button>
              )}
            </div>

            {/* Tab Selectors */}
            <div className="flex gap-2 border-b border-gray-100 pb-1">
              <button
                onClick={() => setActiveTab("chat")}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === "chat" 
                    ? "border-brand-primary text-brand-primary" 
                    : "border-transparent text-gray-400 hover:text-gray-900"
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Room Chat
              </button>
              <button
                onClick={() => setActiveTab("scheduler")}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === "scheduler" 
                    ? "border-brand-primary text-brand-primary" 
                    : "border-transparent text-gray-400 hover:text-gray-900"
                }`}
              >
                <Calendar className="w-4 h-4" /> Peer Scheduler
              </button>
              <button
                onClick={() => setActiveTab("docs")}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === "docs" 
                    ? "border-brand-primary text-brand-primary" 
                    : "border-transparent text-gray-400 hover:text-gray-900"
                }`}
              >
                <Link2 className="w-4 h-4" /> Shared Drive & Docs
              </button>
              <button
                onClick={() => setActiveTab("contacts")}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === "contacts" 
                    ? "border-brand-primary text-brand-primary" 
                    : "border-transparent text-gray-400 hover:text-gray-900"
                }`}
              >
                <Users className="w-4 h-4" /> Group Contacts & Invites
              </button>
            </div>
          </div>

          {/* TAB 1: ROOM CHAT */}
          {activeTab === "chat" && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-[32rem] overflow-hidden">
              {/* Message History */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                    <MessageSquare className="w-12 h-12 text-gray-200 mb-2 animate-pulse" />
                    <span>Start the conversation by typing a message below!</span>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 max-w-xl ${
                        msg.userId === user?.uid ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      {msg.userPhoto ? (
                        <img src={msg.userPhoto} alt={msg.userName} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {msg.userName[0]}
                        </div>
                      )}
                      <div>
                        <div className={`flex items-center gap-1.5 mb-1 ${msg.userId === user?.uid ? "justify-end" : ""}`}>
                          <span className="text-[10px] font-bold text-gray-500">{msg.userName}</span>
                        </div>
                        <div className={`p-4 rounded-[1.5rem] text-sm ${
                          msg.userId === user?.uid 
                            ? "bg-brand-primary text-white rounded-tr-none" 
                            : "bg-gray-100 text-gray-800 rounded-tl-none"
                        }`}>
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input Area */}
              <div className="p-4 border-t border-gray-50 bg-gray-50/50 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button 
                    onClick={handleCreateMeet}
                    className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center flex-shrink-0"
                    title="Start Instant Video Meeting"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message to the group..."
                    className="flex-1 p-3 border border-gray-200 bg-white rounded-xl text-sm focus:border-brand-primary outline-none"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="p-3 bg-brand-primary text-white rounded-xl hover:bg-opacity-95 transition-all flex items-center justify-center flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PEER SCHEDULER (Core Calendar logic) */}
          {activeTab === "scheduler" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Proposal Form & Calendar Check */}
              <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm h-fit">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-1.5">
                  <Plus className="w-5 h-5 text-brand-primary" /> Propose a Meeting Time
                </h3>
                
                <form onSubmit={handleProposeSlot} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Proposal Name</label>
                    <input
                      required
                      value={propTitle}
                      onChange={(e) => setPropTitle(e.target.value)}
                      placeholder="e.g., Biology Review Session"
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Date</label>
                    <input
                      required
                      type="date"
                      value={propDate}
                      onChange={(e) => {
                        setPropDate(e.target.value);
                        setCalendarCheckStatus({ checked: false, hasConflict: false });
                      }}
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Start Hour</label>
                      <input
                        required
                        type="time"
                        value={propStart}
                        onChange={(e) => {
                          setPropStart(e.target.value);
                          setCalendarCheckStatus({ checked: false, hasConflict: false });
                        }}
                        className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">End Hour</label>
                      <input
                        required
                        type="time"
                        value={propEnd}
                        onChange={(e) => {
                          setPropEnd(e.target.value);
                          setCalendarCheckStatus({ checked: false, hasConflict: false });
                        }}
                        className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none"
                      />
                    </div>
                  </div>

                  {/* Calendar Conflict Check Action */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={!propDate || !propStart || !propEnd}
                      onClick={() => handleCheckCalendarConflicts(propDate, propStart, propEnd)}
                      className="w-full py-2.5 bg-gray-50 border border-gray-100 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      <Chrome className="w-4 h-4 text-blue-500" />
                      Check Calendar Overlap
                    </button>
                    
                    {/* Conflict feedback */}
                    {calendarCheckStatus.checked && (
                      <div className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 border ${
                        calendarCheckStatus.hasConflict 
                          ? "bg-rose-50 border-rose-100 text-rose-800" 
                          : "bg-emerald-50 border-emerald-100 text-emerald-800"
                      }`}>
                        {calendarCheckStatus.hasConflict ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                            <div>
                              <span className="font-bold">Overlap Found!</span> You already have an event on Calendar: <span className="underline font-medium">"{calendarCheckStatus.conflictTitle}"</span>.
                            </div>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <div>
                              <span className="font-bold">Looks Perfect!</span> No overlapping conflicts found on your primary Calendar.
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingProposal}
                    className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl text-sm hover:opacity-95 shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingProposal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                    Publish Slot Proposal
                  </button>
                </form>
              </div>

              {/* Proposals List & Voting */}
              <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm h-fit space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-lg">
                    <Users className="w-5 h-5 text-indigo-500" /> Member Overlap Proposals
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">Propose, vote, and select matching meeting slots. Add winning slots to your Calendar.</p>
                </div>

                <div className="space-y-4">
                  {(!selectedRoom.proposals || selectedRoom.proposals.length === 0) ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                      <Clock className="w-10 h-10 text-gray-200 mx-auto mb-2 animate-bounce" />
                      <p className="text-sm">No proposed schedules yet</p>
                      <p className="text-xs text-gray-300 mt-0.5">Publish a slot on the left to start the poll.</p>
                    </div>
                  ) : (
                    selectedRoom.proposals.map((prop) => {
                      const hasVoted = prop.votes.includes(user?.uid || "");
                      const formattedDate = new Date(prop.startTime).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      });
                      const formattedStart = new Date(prop.startTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const formattedEnd = new Date(prop.endTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div 
                          key={prop.id}
                          className="p-5 border border-gray-100 hover:border-gray-200 bg-gray-50/40 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
                        >
                          <div className="space-y-2">
                            <span className="text-[10px] bg-brand-primary/5 text-brand-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {formattedDate}
                            </span>
                            <h4 className="font-bold text-gray-900 text-base">{prop.title}</h4>
                            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" /> {formattedStart} - {formattedEnd}</span>
                              <span>Proposer: <span className="font-bold text-gray-700">{prop.creatorName}</span></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                            {/* Vote button */}
                            <button
                              onClick={() => handleVote(prop.id)}
                              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                hasVoted 
                                  ? "bg-green-600 text-white" 
                                  : "bg-white border border-gray-100 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <Check className="w-4 h-4" />
                              <span>{prop.votes.length} Votes</span>
                            </button>

                            {/* Export to Calendar */}
                            <button
                              onClick={() => handleAddProposalToCalendar(prop)}
                              className="py-2.5 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                              title="Sync to Calendar"
                            >
                              <ExternalLink className="w-4 h-4 text-blue-500" />
                              <span>Sync</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SHARED DRIVE & DOCS */}
          {activeTab === "docs" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* File linking panel */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Link custom doc link */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Plus className="w-5 h-5 text-emerald-500" /> Link Collaborate File
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Title</label>
                      <input
                        value={customDocTitle}
                        onChange={(e) => setCustomDocTitle(e.target.value)}
                        placeholder="e.g., Biology Lab Slides"
                        className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">URL (Document / Sheet / Slide)</label>
                      <input
                        value={customDocUrl}
                        onChange={(e) => setCustomDocUrl(e.target.value)}
                        placeholder="https://docs.google.com/..."
                        className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">File Type</label>
                      <select
                        value={customDocType}
                        onChange={(e) => setCustomDocType(e.target.value as any)}
                        className="w-full p-3 border border-gray-200 bg-white rounded-xl text-sm outline-none font-bold text-gray-600"
                      >
                        <option value="doc">✏️ Document</option>
                        <option value="sheet">📈 Spreadsheet</option>
                        <option value="slide">📺 Presentation</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleLinkDoc(customDocTitle, customDocUrl, customDocType)}
                      disabled={!customDocTitle || !customDocUrl}
                      className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all disabled:opacity-50"
                    >
                      Add to Shared Library
                    </button>
                  </div>
                </div>

                {/* Instant Workspace App Generation */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-indigo-500" /> Auto-Generate
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={handleCreateForm}
                      className="w-full py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold uppercase tracking-wider border border-purple-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <FileQuestion className="w-4 h-4" /> Create Study Quiz (Forms)
                    </button>
                    <button
                      onClick={handleCreateChatSpace}
                      className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" /> Create Chat Space
                    </button>
                  </div>
                </div>

                {/* Cloud Drive Explorer (Real Drive Integration) */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Chrome className="w-5 h-5 text-blue-500" /> Live Cloud Drive Files
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    List files from your Cloud Drive and instantly link them into this room's shared library.
                  </p>
                  
                  <button
                    onClick={handleFetchDriveFiles}
                    className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold uppercase tracking-wider border border-blue-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    {loadingDrive ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Plus className="w-4 h-4 text-blue-500" />}
                    Explore My Cloud Drive
                  </button>

                  {driveFiles.length > 0 && (
                    <div className="space-y-2 max-h-56 overflow-y-auto pt-2 custom-scrollbar">
                      {driveFiles.map((file) => (
                        <div 
                          key={file.id}
                          className="p-3 border border-gray-50 bg-gray-50/50 rounded-xl flex justify-between items-center text-xs"
                        >
                          <span className="font-bold text-gray-700 truncate max-w-[12rem]">{file.name}</span>
                          <button
                            onClick={() => handleLinkDoc(file.name, file.webViewLink || "", "drive-file")}
                            className="text-[10px] px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold hover:bg-emerald-200"
                          >
                            + Link
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Shared Files list */}
              <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-lg">
                    <FileText className="w-5 h-5 text-emerald-500" /> Shared Files & Collaboration Links
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">Access collaborate documents, schedules, and presentations in real time.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(!selectedRoom.linkedDocs || selectedRoom.linkedDocs.length === 0) ? (
                    <div className="col-span-2 text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                      <FileText className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm">No linked files yet</p>
                      <p className="text-xs text-gray-300 mt-0.5">Link Documents or Sheets on the left to collaborate.</p>
                    </div>
                  ) : (
                    selectedRoom.linkedDocs.map((docItem) => {
                      let fileIcon = FileText;
                      let iconColor = "text-blue-500 bg-blue-50";
                      
                      if (docItem.type === "sheet") {
                        fileIcon = FileSpreadsheet;
                        iconColor = "text-emerald-500 bg-emerald-50";
                      } else if (docItem.type === "slide") {
                        fileIcon = Tv;
                        iconColor = "text-amber-500 bg-amber-50";
                      } else if (docItem.type === "form") {
                        fileIcon = FileQuestion;
                        iconColor = "text-purple-500 bg-purple-50";
                      } else if (docItem.type === "chat") {
                        fileIcon = MessageCircle;
                        iconColor = "text-emerald-500 bg-emerald-50";
                      }

                      return (
                        <div 
                          key={docItem.id}
                          className="p-5 border border-gray-100 hover:border-gray-200 rounded-2xl bg-gray-50/30 flex flex-col justify-between gap-4 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                              <React.Fragment>
                                {React.createElement(fileIcon, { className: "w-5 h-5" })}
                              </React.Fragment>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-900 text-sm truncate">{docItem.name}</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">Added by: {docItem.addedByName}</p>
                            </div>
                          </div>

                          <a
                            href={docItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 bg-white border border-gray-100 hover:border-gray-300 rounded-xl text-center font-bold text-xs text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1.5 shadow-sm transition-all"
                          >
                            Open Workspace
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: GROUP CONTACTS & INVITES */}
          {activeTab === "contacts" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Cloud Contacts Fetch & Info Side panel */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Users className="w-5 h-5 text-brand-primary" /> Cloud Contacts Sync
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Import your peers and friends directly from your Cloud Contacts directory. You can then invite them to join this collaborative Study Circle.
                  </p>
                  
                  <button
                    onClick={handleFetchContacts}
                    disabled={loadingContacts}
                    className="w-full py-3 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    {loadingContacts ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Users className="w-4 h-4" />}
                    {contacts.length > 0 ? "Re-sync Cloud Contacts" : "Sync My Cloud Contacts"}
                  </button>

                  {contactsError && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-1.5 border border-red-100">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{contactsError}</span>
                    </div>
                  )}

                  {contacts.length > 0 && (
                    <div className="text-xs text-gray-500 font-medium bg-gray-50 p-3 rounded-xl">
                      Synced <span className="font-bold text-gray-800">{contacts.length}</span> contacts from Workspace.
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm">Quick Help</h4>
                  <ul className="text-xs text-gray-500 space-y-2 list-disc list-inside">
                    <li>Grant contacts access when signing in.</li>
                    <li>Clicking <strong>Invite</strong> will post a direct invitation in the Study Room Chat.</li>
                    <li>Invited peers can instantly access room schedules and documents.</li>
                  </ul>
                </div>
              </div>

              {/* Contacts Directory Explorer & Search */}
              <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-lg">
                      <Users className="w-5 h-5 text-brand-primary" /> My Contacts Directory
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">Search, explore, and invite peers to your study session.</p>
                  </div>

                  {contacts.length > 0 && (
                    <input
                      type="text"
                      value={contactsSearch}
                      onChange={(e) => setContactsSearch(e.target.value)}
                      placeholder="Search contacts..."
                      className="w-full sm:w-48 p-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-brand-primary"
                    />
                  )}
                </div>

                {contacts.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                    <Users className="w-12 h-12 text-gray-200 mx-auto mb-3 animate-pulse" />
                    <p className="text-sm font-bold">No contacts synced yet</p>
                    <p className="text-xs text-gray-300 mt-1 max-w-[280px] mx-auto">
                      Click "Sync My Cloud Contacts" on the left to securely retrieve your peer lists from Cloud People API.
                    </p>
                  </div>
                ) : (() => {
                  const filtered = contacts.filter((c) => {
                    const name = c.names?.[0]?.displayName || "";
                    const email = c.emailAddresses?.[0]?.value || "";
                    return name.toLowerCase().includes(contactsSearch.toLowerCase()) || 
                           email.toLowerCase().includes(contactsSearch.toLowerCase());
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 text-gray-400 text-xs">
                        No contacts found matching "{contactsSearch}".
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[30rem] overflow-y-auto pr-1">
                      {filtered.map((contact, index) => {
                        const name = contact.names?.[0]?.displayName || "Unnamed Contact";
                        const email = contact.emailAddresses?.[0]?.value || "";
                        const photoUrl = contact.photos?.[0]?.url;
                        const phone = contact.phoneNumbers?.[0]?.value;
                        const isInvited = email ? invitedContacts.includes(email) : false;

                        return (
                          <div 
                            key={contact.resourceName || index}
                            className="p-4 border border-gray-100 rounded-2xl bg-gray-50/20 hover:bg-gray-50/50 flex items-start gap-3 transition-all"
                          >
                            {photoUrl ? (
                              <img 
                                src={photoUrl} 
                                alt={name} 
                                className="w-10 h-10 rounded-full flex-shrink-0 object-cover border border-gray-100" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                                {name[0]}
                              </div>
                            )}

                            <div className="min-w-0 flex-1 space-y-1">
                              <h4 className="font-bold text-gray-900 text-xs truncate">{name}</h4>
                              {email && (
                                <p className="text-[10px] text-gray-500 truncate" title={email}>{email}</p>
                              )}
                              {phone && (
                                <p className="text-[9px] text-gray-400 font-medium">{phone}</p>
                              )}

                              <div className="pt-2">
                                {email ? (
                                  <button
                                    onClick={() => handleInviteContact(name, email)}
                                    disabled={isInvited}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all ${
                                      isInvited 
                                        ? "bg-green-50 border border-green-200 text-green-700 cursor-not-allowed" 
                                        : "bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white"
                                    }`}
                                  >
                                    {isInvited ? "✓ Invited" : "Invite to Room"}
                                  </button>
                                ) : (
                                  <span className="text-[9px] text-gray-400 italic">No email found</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
