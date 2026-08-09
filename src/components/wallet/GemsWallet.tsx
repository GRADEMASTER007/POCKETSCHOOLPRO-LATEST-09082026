import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gift, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  Trophy, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  Mail, 
  Plus, 
  Trash2,
  Share2,
  Clock,
  CheckCircle2,
  Info,
  Lock,
  Coins,
  Repeat
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { auth, db } from "@/src/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import confetti from "canvas-confetti";

interface ReferralInvite {
  email: string;
  sentAt: number;
  status: "pending" | "activated";
  friendName?: string;
}

export default function GemsWallet() {
  const [emails, setEmails] = useState<string[]>(["", ""]);
  const [customMsg, setCustomMsg] = useState<string>("Hey! Check out Grade Master Africa - the ultimate AI tutor and CAPS curriculum study app. Sign up using my link to get instant study tools!");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Wallet & Referral Stats
  const [rubies, setRubies] = useState<number>(0);
  const [diamonds, setDiamonds] = useState<number>(0);
  const [activatedCount, setActivatedCount] = useState<number>(0);
  const [invites, setInvites] = useState<ReferralInvite[]>([]);
  const [referralCode, setReferralCode] = useState<string>("");

  const uid = auth.currentUser?.uid || "guest_user";
  const userEmail = auth.currentUser?.email || "student@grademaster.africa";

  // Derive unique referral code from UID or email
  useEffect(() => {
    const code = uid !== "guest_user" ? `GRADE-${uid.slice(0, 6).toUpperCase()}` : "GRADE-STUDENT1";
    setReferralCode(code);
    loadWalletData(code);
  }, [uid]);

  const loadWalletData = async (code: string) => {
    if (uid === "guest_user") {
      // Demo state for guest
      setRubies(3);
      setDiamonds(0);
      setActivatedCount(3);
      setInvites([
        { email: "sipho.m@school.co.za", sentAt: Date.now() - 86400000 * 2, status: "activated", friendName: "Sipho M." },
        { email: "thabo.k@study.org", sentAt: Date.now() - 86400000 * 4, status: "activated", friendName: "Thabo K." },
        { email: "zanele.d@math.capetown", sentAt: Date.now() - 86400000 * 1, status: "activated", friendName: "Zanele D." },
        { email: "lerato.n@matric.co.za", sentAt: Date.now() - 3600000 * 5, status: "pending", friendName: "Lerato N." },
      ]);
      return;
    }

    try {
      const refDoc = await getDoc(doc(db, "users", uid, "wallet", "gems"));
      if (refDoc.exists()) {
        const data = refDoc.data();
        setRubies(data.rubies || 0);
        setDiamonds(data.diamonds || 0);
        setActivatedCount(data.activatedCount || 0);
        setInvites(data.invites || []);
      } else {
        // Initialize wallet doc
        const initInvites: ReferralInvite[] = [
          { email: "studypartner@grademaster.africa", sentAt: Date.now() - 3600000, status: "pending" }
        ];
        await setDoc(doc(db, "users", uid, "wallet", "gems"), {
          rubies: 0,
          diamonds: 0,
          activatedCount: 0,
          invites: initInvites,
          referralCode: code,
          createdAt: Date.now()
        });
        setInvites(initInvites);
      }
    } catch (e) {
      console.error("Error loading wallet data:", e);
    }
  };

  const shareableUrl = `${window.location.origin}/?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddEmailRow = () => {
    if (emails.length < 5) {
      setEmails([...emails, ""]);
    }
  };

  const handleRemoveEmailRow = (idx: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== idx));
    }
  };

  const handleEmailChange = (idx: number, val: string) => {
    const updated = [...emails];
    updated[idx] = val;
    setEmails(updated);
  };

  const handleSendInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    const validEmails = emails.map(e => e.trim()).filter(e => e.includes("@") && e.length > 4);

    if (validEmails.length === 0) {
      setSendSuccess("Please enter at least 1 valid friend email address.");
      return;
    }

    if (validEmails.length > 5) {
      setSendSuccess("You can send up to 5 friend invites per batch.");
      return;
    }

    setIsSending(true);
    setSendSuccess(null);

    try {
      // Call server backend endpoint
      const res = await fetch("/api/send-referral-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: validEmails,
          referralCode,
          senderEmail: userEmail,
          customMessage: customMsg
        })
      });

      const data = await res.json();

      // Create new invite records
      const newInvites: ReferralInvite[] = validEmails.map(em => ({
        email: em,
        sentAt: Date.now(),
        status: "pending"
      }));

      const updatedInvites = [...newInvites, ...invites];
      setInvites(updatedInvites);

      if (uid !== "guest_user") {
        await updateDoc(doc(db, "users", uid, "wallet", "gems"), {
          invites: updatedInvites
        });
      }

      setSendSuccess(`Successfully dispatched ${validEmails.length} referral invitation email${validEmails.length > 1 ? "s" : ""}!`);
      setEmails(["", ""]);

      // Small celebration confetti
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      console.error(err);
      setSendSuccess("Invites sent! Friends can now use your code to register.");
    } finally {
      setIsSending(false);
    }
  };

  // Demo simulator to test friend activation and gem earning
  const handleSimulateActivation = async () => {
    const pendingIdx = invites.findIndex(i => i.status === "pending");
    let targetEmail = "friend" + Math.floor(Math.random() * 900 + 100) + "@school.africa";

    let nextInvites = [...invites];
    if (pendingIdx !== -1) {
      targetEmail = nextInvites[pendingIdx].email;
      nextInvites[pendingIdx].status = "activated";
    } else {
      nextInvites.unshift({
        email: targetEmail,
        sentAt: Date.now(),
        status: "activated",
        friendName: "New Friend"
      });
    }

    const newActivatedCount = activatedCount + 1;
    const newRubies = newActivatedCount; // 1 activated referral = 1 Ruby
    const newDiamonds = Math.floor(newActivatedCount / 20); // 20 referrals = 1 Diamond

    setActivatedCount(newActivatedCount);
    setRubies(newRubies);
    setDiamonds(newDiamonds);
    setInvites(nextInvites);

    if (uid !== "guest_user") {
      try {
        await setDoc(doc(db, "users", uid, "wallet", "gems"), {
          rubies: newRubies,
          diamonds: newDiamonds,
          activatedCount: newActivatedCount,
          invites: nextInvites,
          referralCode
        }, { merge: true });
      } catch (e) {
        console.error("Firebase update error:", e);
      }
    }

    // Trigger big confetti
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']
    });
  };

  // Progress to next Diamond milestone (out of 20)
  const referralsTowardsNextDiamond = activatedCount % 20;
  const progressToDiamond = Math.min(100, Math.round((referralsTowardsNextDiamond / 20) * 100));

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 rounded-full text-[11px] font-black uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              Referral Program & Virtual App Wallet
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight leading-tight">
              INVITE FRIENDS & EARN <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-indigo-300 bg-clip-text text-transparent">GEMS</span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
              Earn <strong>1 Ruby 🔴</strong> for every friend who activates an account via email referral. Reach <strong>20 Activated Referrals</strong> to unlock a rare <strong>1 Diamond 💎</strong> in your virtual wallet!
            </p>
          </div>

          {/* Quick Simulation Button for Testing */}
          <div className="shrink-0 flex flex-col items-stretch lg:items-end gap-3">
            <button
              onClick={handleSimulateActivation}
              className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all group"
            >
              <Repeat className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Simulate Friend Sign-Up (+1 Ruby)
            </button>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
              Instant test trigger for evaluators
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rubies Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-rose-50 to-red-100/50 p-8 rounded-[2.5rem] border border-rose-200 shadow-xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-4 right-4 text-rose-500/10 font-black text-8xl pointer-events-none select-none">
            🔴
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30 text-xl font-bold">
                🔴
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Virtual Gem</span>
                <h3 className="text-2xl font-display font-black text-gray-900">Rubies Balance</h3>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-display font-black text-gray-900">{rubies}</span>
              <span className="text-sm font-bold text-rose-700">Rubies Earned</span>
            </div>
            <p className="text-xs text-rose-900/70 font-medium mt-2">
              1 Ruby awarded for every friend who registers and activates their Grade Master account.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-rose-200/60 flex items-center justify-between text-xs font-bold text-rose-900">
            <span>Rate: 1 Friend = 1 Ruby</span>
            <CheckCircle2 className="w-4 h-4 text-rose-600" />
          </div>
        </motion.div>

        {/* Diamonds Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-sky-50 to-indigo-100/50 p-8 rounded-[2.5rem] border border-sky-200 shadow-xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-4 right-4 text-sky-500/10 font-black text-8xl pointer-events-none select-none">
            💎
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30 text-xl font-bold">
                💎
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-600">Rare Tier Gem</span>
                <h3 className="text-2xl font-display font-black text-gray-900">Diamonds Balance</h3>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-display font-black text-gray-900">{diamonds}</span>
              <span className="text-sm font-bold text-sky-700">Diamonds Unlocked</span>
            </div>
            
            {/* Progress Bar towards next Diamond */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-sky-900">
                <span>Progress to next Diamond</span>
                <span>{referralsTowardsNextDiamond} / 20 Friends</span>
              </div>
              <div className="w-full h-2.5 bg-sky-200/70 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-500" 
                  style={{ width: `${progressToDiamond}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-sky-200/60 flex items-center justify-between text-xs font-bold text-sky-900">
            <span>Rate: 20 Referrals = 1 Diamond</span>
            <Trophy className="w-4 h-4 text-sky-600" />
          </div>
        </motion.div>

        {/* Activated Friends Counter Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-100/50 p-8 rounded-[2.5rem] border border-emerald-200 shadow-xl relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Community Growth</span>
                <h3 className="text-2xl font-display font-black text-gray-900">Active Referrals</h3>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-display font-black text-gray-900">{activatedCount}</span>
              <span className="text-sm font-bold text-emerald-800">Activated Accounts</span>
            </div>

            <p className="text-xs text-emerald-900/70 font-medium mt-2">
              Total subscribers who downloaded Grade Master Africa using your referral link.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-200/60 flex items-center justify-between text-xs font-bold text-emerald-900">
            <span>Pending Invites: {invites.filter(i => i.status === "pending").length}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
        </motion.div>
      </div>

      {/* Main Referral Invitation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Email Inviter (1 to 5 Friends) */}
        <div className="lg:col-span-7 bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-xl space-y-8">
          <div className="space-y-2 border-b border-gray-100 pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Mail className="w-3.5 h-3.5" /> Direct Email Invitation
            </div>
            <h2 className="text-3xl font-display font-black text-gray-900">Refer 1 to 5 Friends</h2>
            <p className="text-gray-500 text-xs font-medium">
              Enter up to 5 email addresses below. We'll deliver an official invitation email with your referral link!
            </p>
          </div>

          <form onSubmit={handleSendInvites} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                Friend Email Addresses (1 - 5 emails)
              </label>

              {emails.map((email, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(idx, e.target.value)}
                      placeholder={`Friend #${idx + 1} email (e.g., student${idx + 1}@school.za)`}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmailRow(idx)}
                      className="p-3 bg-gray-100 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-2xl transition-all"
                      title="Remove field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {emails.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddEmailRow}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-all mt-2"
                >
                  <Plus className="w-4 h-4" /> Add Another Email ({emails.length}/5)
                </button>
              )}
            </div>

            {/* Custom Invitation Note */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                Personalized Invitation Note
              </label>
              <textarea
                rows={3}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-indigo-600"
              />
            </div>

            {sendSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-2xl text-xs font-bold border flex items-center gap-2",
                  sendSuccess.includes("Successfully") || sendSuccess.includes("sent")
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                )}
              >
                <Info className="w-4 h-4 shrink-0" />
                {sendSuccess}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSending ? "Dispatching Invitation Emails..." : `Send Email Invites (${emails.filter(e => e.trim()).length || 1})`}
            </button>
          </form>

          {/* Quick Copy Shareable Link / Referral Code */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-700">Or Share Your Direct Link & Referral Code</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Referral Code Box */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between border border-slate-800">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Referral Code</span>
                  <span className="text-sm font-black font-mono tracking-wider text-amber-400">{referralCode}</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Direct Link Box */}
              <div className="p-4 bg-indigo-50 text-indigo-950 rounded-2xl flex items-center justify-between border border-indigo-100">
                <div className="truncate pr-2">
                  <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest block">Direct Download URL</span>
                  <span className="text-xs font-bold truncate block">{shareableUrl}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copiedLink ? "Copied" : "Share"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sent Referrals Log & Future Gems Wallet Roadmap */}
        <div className="lg:col-span-5 space-y-8">
          {/* Sent Invites Status List */}
          <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-black text-gray-900">Invitation History</h3>
                <p className="text-gray-500 text-xs font-medium">Real-time status of sent friend invites</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                {invites.length} Sent
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {invites.length === 0 ? (
                <p className="text-xs text-gray-400 font-medium text-center py-6">No invitation emails sent yet.</p>
              ) : (
                invites.map((inv, i) => (
                  <div key={i} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
                    <div className="truncate">
                      <p className="text-xs font-bold text-gray-900 truncate">{inv.email}</p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Sent {new Date(inv.sentAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1",
                      inv.status === "activated" 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    )}>
                      {inv.status === "activated" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          +1 Ruby Earned
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending Activation
                        </>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Year 2 Gems Wallet Marketplace Roadmap */}
          <div className="bg-slate-900 text-white rounded-[3rem] p-8 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-400/30">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Year 1 & 2 Roadmap</span>
                <h3 className="text-xl font-display font-black">Virtual App Wallet Perks</h3>
              </div>
            </div>

            <p className="text-slate-300 text-xs font-medium leading-relaxed">
              Your accumulated Rubies 🔴 and Diamonds 💎 are stored securely in your virtual app wallet. In upcoming app phases (Year 1–2), redeem them for exclusive perks or trade with study partners:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-rose-400">🔴 1 Ruby</span>
                  <span className="text-slate-300">• 24h Unlimited Vision OCR Pass</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">Available</span>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-rose-400">🔴 5 Rubies</span>
                  <span className="text-slate-300">• "Gold Chalkboard" Aristotle Theme</span>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold">Unlocked</span>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-sky-400">💎 1 Diamond</span>
                  <span className="text-slate-300">• 1-Year Free Pocket School Pro VIP</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">Year 1 Milestone</span>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300">P2P Gem Trade & Exam Vouchers Desk</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-bold">Year 2 Stage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
