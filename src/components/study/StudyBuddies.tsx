import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  setDoc,
  doc, 
  updateDoc, 
  arrayUnion, 
  getDocs,
  deleteDoc,
  or
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { useAuth } from "@/src/components/auth/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Plus, 
  Search, 
  UserPlus, 
  Check, 
  X, 
  MessageSquare, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  Loader2, 
  Video, 
  Clock,
  BookOpen,
  Mail,
  School,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudyRoomDoc {
  id: string;
  name: string;
  members: string[];
  createdAt: any;
}

interface BuddyRequestDoc {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  receiverId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: number;
}

interface UserProfileDoc {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  school?: string;
  grade?: string;
  role: string;
}

export default function StudyBuddies() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active rooms & buddies lists
  const [rooms, setRooms] = useState<StudyRoomDoc[]>([]);
  const [buddies, setBuddies] = useState<UserProfileDoc[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<BuddyRequestDoc[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<BuddyRequestDoc[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingBuddies, setLoadingBuddies] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfileDoc[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"buddies" | "find" | "invites">("buddies");

  // Create room modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [selectedBuddiesForNewRoom, setSelectedBuddiesForNewRoom] = useState<string[]>([]);
  const [creatingRoom, setCreatingRoom] = useState(false);

  // Invite buddy to existing room state
  const [showInviteModal, setShowInviteModal] = useState<UserProfileDoc | null>(null);
  const [invitingToRoom, setInvitingToRoom] = useState(false);

  // Subscribe to My Study Rooms
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
      setLoadingRooms(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "study_rooms");
      setLoadingRooms(false);
    });

    return unsubscribe;
  }, [user]);

  // Subscribe to Buddy Requests (accepted, pending incoming, pending outgoing)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "buddy_requests"),
      or(where("senderId", "==", user.uid), where("receiverId", "==", user.uid))
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const incoming: BuddyRequestDoc[] = [];
      const outgoing: BuddyRequestDoc[] = [];
      const acceptedBuddyIds = new Set<string>();

      snapshot.forEach((doc) => {
        const data = doc.data() as BuddyRequestDoc;
        const reqId = doc.id;
        const requestWithId = { ...data, id: reqId };

        if (data.status === "pending") {
          if (data.receiverId === user.uid) {
            incoming.push(requestWithId);
          } else if (data.senderId === user.uid) {
            outgoing.push(requestWithId);
          }
        } else if (data.status === "accepted") {
          if (data.senderId === user.uid) {
            acceptedBuddyIds.add(data.receiverId);
          } else if (data.receiverId === user.uid) {
            acceptedBuddyIds.add(data.senderId);
          }
        }
      });

      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);

      // Fetch user profile info for all accepted buddies
      if (acceptedBuddyIds.size > 0) {
        try {
          const fetchedBuddies: UserProfileDoc[] = [];
          const ids = Array.from(acceptedBuddyIds);
          
          // Firestore 'in' query supports up to 30 elements
          // If more, we should chunk or fetch individually
          for (let i = 0; i < ids.length; i += 30) {
            const chunk = ids.slice(i, i + 30);
            const usersQ = query(collection(db, "users"), where("uid", "in", chunk));
            const usersSnap = await getDocs(usersQ);
            usersSnap.forEach((doc) => {
              fetchedBuddies.push(doc.data() as UserProfileDoc);
            });
          }
          
          setBuddies(fetchedBuddies);
        } catch (e) {
          handleFirestoreError(e, OperationType.LIST, "users");
        }
      } else {
        setBuddies([]);
      }
      setLoadingBuddies(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "buddy_requests");
      setLoadingBuddies(false);
    });

    return unsubscribe;
  }, [user]);

  // Peer directory search
  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !searchQuery.trim()) return;

    setSearching(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list: UserProfileDoc[] = [];
      const lowerQuery = searchQuery.toLowerCase();

      snap.forEach((doc) => {
        const profile = doc.data() as UserProfileDoc;
        if (profile.uid === user.uid) return; // Exclude current user

        const matchesName = profile.displayName?.toLowerCase().includes(lowerQuery);
        const matchesEmail = profile.email?.toLowerCase().includes(lowerQuery);
        const matchesSchool = profile.school?.toLowerCase().includes(lowerQuery);

        if (matchesName || matchesEmail || matchesSchool) {
          list.push(profile);
        }
      });
      setSearchResults(list);
    } catch (err) {
      console.warn("Error searching users:", err);
    } finally {
      setSearching(false);
    }
  };

  // Send a buddy request
  const handleSendBuddyRequest = async (receiver: UserProfileDoc) => {
    if (!user) return;
    try {
      const reqId = `request_${user.uid}_${receiver.uid}`;
      await setDoc(doc(db, "buddy_requests", reqId), {
        id: reqId,
        senderId: user.uid,
        senderName: user.displayName || "Student",
        senderPhoto: user.photoURL || "",
        receiverId: receiver.uid,
        status: "pending",
        createdAt: Date.now()
      });
    } catch (e) {
      console.error("Failed to send buddy request:", e);
    }
  };

  // Accept a buddy request
  const handleAcceptBuddyRequest = async (request: BuddyRequestDoc) => {
    try {
      await updateDoc(doc(db, "buddy_requests", request.id), {
        status: "accepted"
      });
    } catch (e) {
      console.error("Failed to accept buddy request:", e);
    }
  };

  // Decline/Cancel a buddy request
  const handleDeclineBuddyRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, "buddy_requests", requestId));
    } catch (e) {
      console.error("Failed to decline buddy request:", e);
    }
  };

  // Create a new Study Circle (Study Room)
  const handleCreateRoom = async () => {
    if (!user || !newRoomName.trim()) return;
    setCreatingRoom(true);
    try {
      const roomId = `room_${Date.now()}`;
      // Combined members list (current user + selected buddies)
      const members = [user.uid, ...selectedBuddiesForNewRoom];
      
      await setDoc(doc(db, "study_rooms", roomId), {
        id: roomId,
        name: newRoomName.trim(),
        members: members,
        proposals: [],
        linkedDocs: [],
        createdAt: Date.now(),
      });

      // Post welcome message
      await setDoc(doc(db, "room_messages", `msg_welcome_${Date.now()}`), {
        roomId: roomId,
        userId: "system",
        userName: "Pocket School System",
        text: `🎓 Welcome to your new Study Circle: "${newRoomName}"! Collaborate in real-time here.`,
        createdAt: Date.now()
      });

      setNewRoomName("");
      setSelectedBuddiesForNewRoom([]);
      setShowCreateModal(false);
      
      // Navigate straight into the newly created room
      navigate(`/study-room?roomId=${roomId}`);
    } catch (e) {
      console.error("Failed to create study room:", e);
    } finally {
      setCreatingRoom(false);
    }
  };

  // Toggle buddy selection for new room creation
  const handleToggleBuddySelection = (uid: string) => {
    setSelectedBuddiesForNewRoom((prev) => 
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  // Invite buddy to an existing Study Room
  const handleInviteBuddyToRoom = async (roomId: string, buddyUid: string, buddyName: string) => {
    if (!user) return;
    setInvitingToRoom(true);
    try {
      const roomRef = doc(db, "study_rooms", roomId);
      await updateDoc(roomRef, {
        members: arrayUnion(buddyUid)
      });

      // Post invite note in chat
      await addDoc(collection(db, "room_messages"), {
        roomId: roomId,
        userId: user.uid,
        userName: user.displayName || "Student",
        text: `🤝 Added ${buddyName} to the Study Circle! Welcome!`,
        createdAt: Date.now()
      });

      setShowInviteModal(null);
      alert(`🎉 Added ${buddyName} successfully!`);
    } catch (e) {
      console.error("Failed to add buddy to room:", e);
      alert("Failed to invite buddy. Please check room membership.");
    } finally {
      setInvitingToRoom(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Real-time peer network
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Study Buddies Hub
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">Find study groups, connect with peers, and schedule collaborative study rooms.</p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-brand-primary text-white py-3 px-5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-opacity-95 shadow-md shadow-brand-primary/10 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Study Circle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: ACTIVE GROUPS (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-gray-900 text-base">My Active Study Circles</h3>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold">
              {rooms.length} Active
            </span>
          </div>

          {loadingRooms ? (
            <div className="p-8 text-center bg-gray-50/50 rounded-[1.5rem] border border-dashed border-gray-100 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-brand-primary mr-2" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Syncing circles...</span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-100 space-y-3">
              <Users className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-semibold text-gray-600">No active study circles yet</p>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                Create a study circle or invite buddies to start collaborating in real-time.
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider block mx-auto pt-2"
              >
                Create Circle →
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[25rem] overflow-y-auto pr-1">
              {rooms.map((room) => (
                <div 
                  key={room.id}
                  onClick={() => navigate(`/study-room?roomId=${room.id}`)}
                  className="bg-gray-50/40 hover:bg-gray-50 border border-gray-100/50 hover:border-gray-200/80 p-5 rounded-2xl flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-brand-primary transition-colors">
                      {room.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>{room.members.length} members collaborating</span>
                    </div>
                  </div>
                  
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-brand-primary group-hover:text-white group-hover:border-transparent transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PEER DIRECTORY & BUDDIES (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* TAB HEADERS */}
          <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100/80">
            <button
              onClick={() => setActiveTab("buddies")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "buddies" 
                  ? "bg-white text-brand-primary shadow-sm" 
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              My Buddies ({buddies.length})
            </button>
            <button
              onClick={() => setActiveTab("find")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "find" 
                  ? "bg-white text-brand-primary shadow-sm" 
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <Search className="w-4 h-4" />
              Find Peers
            </button>
            <button
              onClick={() => setActiveTab("invites")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 relative ${
                activeTab === "invites" 
                  ? "bg-white text-brand-primary shadow-sm" 
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Invites
              {incomingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white animate-bounce">
                  {incomingRequests.length}
                </span>
              )}
            </button>
          </div>

          <div className="min-h-[20rem]">
            {/* TAB 1: MY BUDDIES LIST */}
            {activeTab === "buddies" && (
              <div className="space-y-3">
                {loadingBuddies ? (
                  <div className="p-12 text-center flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-primary mr-2" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Syncing buddies list...</span>
                  </div>
                ) : buddies.length === 0 ? (
                  <div className="p-12 text-center bg-gray-50/20 rounded-[2rem] border border-dashed border-gray-100 space-y-3">
                    <Users className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-sm font-semibold text-gray-600">Your buddy list is empty</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                      Search the student directory under the "Find Peers" tab to send a buddy request and start studying together!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[22rem] overflow-y-auto pr-1">
                    {buddies.map((buddy) => (
                      <div 
                        key={buddy.uid}
                        className="bg-white p-4 border border-gray-100 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all"
                      >
                        <div className="flex gap-3">
                          {buddy.photoURL ? (
                            <img src={buddy.photoURL} alt={buddy.displayName} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold flex items-center justify-center">
                              {buddy.displayName[0]}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{buddy.displayName}</h4>
                            <div className="flex flex-col mt-0.5 text-xs text-gray-400 font-medium">
                              {buddy.school && (
                                <span className="flex items-center gap-1"><School className="w-3 h-3" /> {buddy.school}</span>
                              )}
                              {buddy.grade && (
                                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Grade {buddy.grade}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 border-t border-gray-50 pt-3 mt-4">
                          <button
                            onClick={() => setShowInviteModal(buddy)}
                            className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all"
                          >
                            Add to Room
                          </button>
                          <button
                            onClick={() => {
                              // Direct to Study Room lobby with chat opened
                              navigate(`/study-room`);
                            }}
                            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-xl transition-all"
                            title="Chat in Room"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FIND PEERS */}
            {activeTab === "find" && (
              <div className="space-y-4">
                <form onSubmit={handleSearchUsers} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search student directory by name or school..."
                      className="w-full p-3 pl-10 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !searchQuery.trim()}
                    className="bg-brand-primary text-white px-5 rounded-xl text-sm font-bold hover:bg-opacity-95 transition-all disabled:opacity-50"
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                  </button>
                </form>

                <div className="space-y-3 max-h-[18rem] overflow-y-auto pr-1">
                  {searchResults.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 text-xs">
                      {searchQuery.trim() ? "No matching peers found." : "Type a name or school above to search."}
                    </div>
                  ) : (
                    searchResults.map((peer) => {
                      // Check relation status
                      const isBuddy = buddies.some(b => b.uid === peer.uid);
                      const isPendingIncoming = incomingRequests.some(r => r.senderId === peer.uid);
                      const isPendingOutgoing = outgoingRequests.some(r => r.receiverId === peer.uid);

                      return (
                        <div 
                          key={peer.uid}
                          className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between hover:border-gray-200 transition-all"
                        >
                          <div className="flex gap-3">
                            {peer.photoURL ? (
                              <img src={peer.photoURL} alt={peer.displayName} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold flex items-center justify-center">
                                {peer.displayName[0]}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">{peer.displayName}</h4>
                              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 font-medium">
                                {peer.school && <span className="flex items-center gap-1"><School className="w-3 h-3" /> {peer.school}</span>}
                                {peer.grade && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Grade {peer.grade}</span>}
                              </div>
                            </div>
                          </div>

                          <div>
                            {isBuddy ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                                <UserCheck className="w-3.5 h-3.5" /> Buddies
                              </span>
                            ) : isPendingIncoming ? (
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                                Sent You Invite
                              </span>
                            ) : isPendingOutgoing ? (
                              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                                Request Pending
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSendBuddyRequest(peer)}
                                className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                              >
                                <UserPlus className="w-3.5 h-3.5" /> Connect
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: INCOMING & OUTGOING INVITES */}
            {activeTab === "invites" && (
              <div className="space-y-6">
                {/* Incoming Section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider px-1">Incoming Requests</h4>
                  
                  {incomingRequests.length === 0 ? (
                    <p className="text-gray-400 text-xs px-1">No pending incoming requests.</p>
                  ) : (
                    <div className="space-y-2">
                      {incomingRequests.map((req) => (
                        <div 
                          key={req.id}
                          className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between bg-gray-50/30"
                        >
                          <div className="flex gap-3 items-center">
                            {req.senderPhoto ? (
                              <img src={req.senderPhoto} alt={req.senderName} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center">
                                {req.senderName[0]}
                              </div>
                            )}
                            <div>
                              <h5 className="font-bold text-gray-900 text-sm">{req.senderName}</h5>
                              <span className="text-[10px] text-gray-400">wants to study with you</span>
                            </div>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleAcceptBuddyRequest(req)}
                              className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-sm"
                              title="Accept"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeclineBuddyRequest(req.id)}
                              className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all"
                              title="Decline"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Outgoing Section */}
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider px-1">Sent Requests</h4>
                  
                  {outgoingRequests.length === 0 ? (
                    <p className="text-gray-400 text-xs px-1">No sent requests pending response.</p>
                  ) : (
                    <div className="space-y-2">
                      {outgoingRequests.map((req) => (
                        <div 
                          key={req.id}
                          className="p-3 border border-gray-50 rounded-xl flex items-center justify-between text-xs text-gray-500 bg-white"
                        >
                          <span>Request sent to receiver</span>
                          <button
                            onClick={() => handleDeclineBuddyRequest(req.id)}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE ROOM MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl w-full max-w-lg p-6 relative z-10 space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-brand-primary" /> Create New Study Circle
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">Start a real-time group chat and collaborative session with your study buddies.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Circle Name</label>
                  <input
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g., Mathematics Study Group"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Add Buddies (Optional)</label>
                  
                  {buddies.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-xl text-xs text-gray-400">
                      You don't have any buddies connected yet. You can add members inside the circle later.
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-2.5">
                      {buddies.map((buddy) => {
                        const isSelected = selectedBuddiesForNewRoom.includes(buddy.uid);
                        return (
                          <div 
                            key={buddy.uid}
                            onClick={() => handleToggleBuddySelection(buddy.uid)}
                            className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                              isSelected 
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                                : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <span>{buddy.displayName}</span>
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                              isSelected ? "bg-indigo-600 border-transparent text-white" : "border-gray-300"
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="py-3 px-5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={creatingRoom || !newRoomName.trim()}
                  className="bg-brand-primary text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-opacity-95 shadow-md disabled:opacity-50 flex items-center gap-1.5 transition-all"
                >
                  {creatingRoom && <Loader2 className="w-4 h-4 animate-spin" />}
                  Launch Circle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INVITE TO EXISTING ROOM MODAL */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl w-full max-w-md p-6 relative z-10 space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Invite {showInviteModal.displayName} to Study Circle
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">Select a circle below to instantly add them as a member.</p>
              </div>

              <div className="space-y-3">
                {rooms.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-2xl text-xs text-gray-400">
                    You aren't a member of any study circles yet. Create one first!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {rooms.map((room) => {
                      const isAlreadyMember = room.members.includes(showInviteModal.uid);
                      return (
                        <div 
                          key={room.id}
                          className="p-3.5 border border-gray-100 rounded-xl flex items-center justify-between text-sm hover:bg-gray-50 transition-all"
                        >
                          <span className="font-bold text-gray-800">{room.name}</span>
                          {isAlreadyMember ? (
                            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Already In
                            </span>
                          ) : (
                            <button
                              onClick={() => handleInviteBuddyToRoom(room.id, showInviteModal.uid, showInviteModal.displayName)}
                              disabled={invitingToRoom}
                              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end border-t border-gray-50 pt-4">
                <button
                  onClick={() => setShowInviteModal(null)}
                  className="py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
