import React, { useState } from "react";
import { 
  Heart, HeartHandshake, ShieldCheck, Sparkles, UserCheck, 
  CreditCard, Check, ArrowRight, Award, HelpCircle, Users, CheckCircle2, Loader2, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/src/components/auth/AuthContext";

interface PlanOption {
  id: string;
  name: string;
  price: number;
  tokens: string;
  queries: string;
  description: string;
}

const SPONSOR_PLANS: PlanOption[] = [
  { id: "basic_49", name: "Basic Starter", price: 49, tokens: "150k Tokens/mo", queries: "30 AI Queries/day", description: "Essential AI tutoring & homework help for 1 student" },
  { id: "plus_69", name: "Student Plus", price: 69, tokens: "350k Tokens/mo", queries: "75 AI Queries/day", description: "Includes CAPS/IEB exam bank & past paper solver" },
  { id: "standard_99", name: "Standard Pass", price: 99, tokens: "750k Tokens/mo", queries: "150 AI Queries/day", description: "Includes Feynman whiteboard lab & STEM simulations" },
  { id: "gold_199", name: "Gold VIP Pass", price: 199, tokens: "2.5M Tokens/mo", queries: "300 AI Queries/day", description: "Full 11-language spoken AI tutor & priority support" }
];

const PRESET_DONATIONS = [50, 100, 250, 500, 1000];

export default function SponsorAndDonate() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"sponsor" | "donate">("sponsor");

  // Sponsorship State
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>(SPONSOR_PLANS[2]); // Default Standard R99
  const [studentCount, setStudentCount] = useState<number>(5);
  const [customStudentCount, setCustomStudentCount] = useState<string>("");
  const [sponsorName, setSponsorName] = useState<string>("");
  const [sponsorEmail, setSponsorEmail] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Donation State
  const [donationAmount, setDonationAmount] = useState<number>(250);
  const [customDonation, setCustomDonation] = useState<string>("");
  const [donationCycle, setDonationCycle] = useState<"once-off" | "monthly">("once-off");
  const [donorMessage, setDonorMessage] = useState<string>("");

  // Payment State
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const effectiveStudents = customStudentCount ? Math.max(1, parseInt(customStudentCount) || 1) : studentCount;
  const totalSponsorshipCost = selectedPlan.price * effectiveStudents;
  const effectiveDonation = customDonation ? Math.max(10, parseInt(customDonation) || 10) : donationAmount;

  const handleCheckout = async (type: "sponsor" | "donate") => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const planId = type === "sponsor" 
        ? `sponsor_${selectedPlan.id}_x${effectiveStudents}` 
        : `donation_${effectiveDonation}_${donationCycle}`;

      const amount = type === "sponsor" ? totalSponsorshipCost : effectiveDonation;
      const email = sponsorEmail || user?.email || "supporter@grademasterafrica.com";

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": user ? `Bearer ${await user.getIdToken()}` : ""
        },
        body: JSON.stringify({
          planId,
          amount,
          email,
          cycle: type === "sponsor" ? "monthly" : donationCycle,
          sponsorshipContact: isAnonymous ? "Anonymous Sponsor" : (sponsorName || email)
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to initialize payment checkout");
      }

      if (json.paymentUrl) {
        window.location.href = json.paymentUrl;
      } else {
        setSuccessMessage("Thank you! Your contribution has been registered successfully.");
      }
    } catch (err: any) {
      console.error("Checkout Error:", err);
      setErrorMessage(err.message || "An error occurred during checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Top Hero Banner */}
      <div className="relative p-8 lg:p-10 rounded-3xl bg-gradient-to-r from-amber-950/60 via-indigo-950/60 to-slate-950 border border-amber-500/30 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest mb-4">
              <HeartHandshake className="w-4 h-4 text-amber-400" /> Educational Equity & Empowerment
            </div>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Sponsor a Child or Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">App Development</span>
            </h1>
            <p className="mt-3 text-sm lg:text-base text-slate-300 leading-relaxed">
              Empower underprivileged African learners with enterprise 4K AI tutoring. 100% of sponsored funds directly fund AI tokens, Cloud Run hosting, and digital study passes for students across South Africa, SADC, and broader Africa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-center">
              <div className="text-2xl font-black text-amber-400">100% Guaranteed</div>
              <div className="text-[11px] text-slate-400 mt-1">Direct Token Allocation</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-center">
              <div className="text-2xl font-black text-emerald-400">53%+ Margin</div>
              <div className="text-[11px] text-slate-400 mt-1">Sustainable Social Impact</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Toggle */}
      <div className="flex justify-center">
        <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 flex gap-2 shadow-xl">
          <button
            onClick={() => setActiveTab("sponsor")}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === "sponsor"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" /> Sponsor a Learner
          </button>
          <button
            onClick={() => setActiveTab("donate")}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === "donate"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Heart className="w-4 h-4" /> Donate to App Development
          </button>
        </div>
      </div>

      {/* TAB 1: SPONSOR A LEARNER */}
      {activeTab === "sponsor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Configuration (Left 7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-2xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">1</span>
                  Select Student Subscription Pass Tier
                </h2>
                <p className="text-xs text-slate-400 mt-1">Choose the academic pass tier you would like to sponsor for underprivileged learners.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SPONSOR_PLANS.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-400/60 shadow-lg shadow-amber-500/10"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-sm text-white">{plan.name}</div>
                        <div className="text-amber-400 font-black text-sm">R{plan.price}<span className="text-[10px] text-slate-400">/mo</span></div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal mb-2">{plan.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-semibold">
                        <Check className="w-3 h-3" /> {plan.tokens}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">2</span>
                  Number of Students to Sponsor
                </h2>

                <div className="grid grid-cols-5 gap-2 mb-3">
                  {[1, 3, 5, 10, 25].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => {
                        setStudentCount(cnt);
                        setCustomStudentCount("");
                      }}
                      className={`py-3 rounded-xl font-bold text-xs border transition-all ${
                        studentCount === cnt && !customStudentCount
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      {cnt} {cnt === 1 ? "Student" : "Students"}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">Or enter custom learner seats:</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={customStudentCount}
                    onChange={(e) => setCustomStudentCount(e.target.value)}
                    className="w-28 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Sponsor Identification */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">3</span>
                  Sponsor Details & Certificate
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Sponsor / Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Foundation / John Doe"
                      disabled={isAnonymous}
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Receipt & Update Email</label>
                    <input
                      type="email"
                      placeholder="e.g. sponsor@domain.com"
                      value={sponsorEmail}
                      onChange={(e) => setSponsorEmail(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-800"
                  />
                  <span className="text-xs text-slate-300">Keep my sponsorship anonymous on the public impact board</span>
                </label>
              </div>
            </div>
          </div>

          {/* Checkout Summary Card (Right 5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 shadow-2xl space-y-6 sticky top-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Sponsorship Summary</span>
                  <h3 className="text-xl font-black text-white">Impact Order</h3>
                </div>
                <Award className="w-8 h-8 text-amber-400" />
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Selected Tier:</span>
                  <span className="font-bold text-white">{selectedPlan.name} (R{selectedPlan.price}/student)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Learner Seats:</span>
                  <span className="font-bold text-white">{effectiveStudents} {effectiveStudents === 1 ? "Learner" : "Learners"}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Tokens Funded:</span>
                  <span className="font-bold text-emerald-400">{effectiveStudents * parseInt(selectedPlan.tokens)} Tokens/mo</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Allocation Method:</span>
                  <span className="font-bold text-indigo-300">Direct Student Wallet Credit</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sponsorship</div>
                  <div className="text-3xl font-black text-amber-400">R{totalSponsorshipCost}<span className="text-xs font-normal text-slate-400"> / month</span></div>
                </div>
                <div className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                  Yoco Secure SDK
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                  {successMessage}
                </div>
              )}

              <button
                onClick={() => handleCheckout("sponsor")}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                {loading ? "Initializing Yoco Checkout..." : `Proceed to Sponsor (R${totalSponsorshipCost})`}
              </button>

              <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Processed via Yoco South Africa. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DONATE TO APP DEVELOPMENT */}
      {activeTab === "donate" && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Heart className="w-6 h-6 text-amber-400" /> Support Grade Master Africa Open AI Infrastructure
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Your donations directly fund server hosting on Google Cloud Run, high-speed Gemini 1.5 Pro & Flash model API tokens, multi-language speech synthesizers, and accessibility feature expansion for visually impaired and dyslexic African students.
              </p>
            </div>

            {/* Donation Frequency */}
            <div className="flex gap-3">
              {(["once-off", "monthly"] as const).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setDonationCycle(cycle)}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider border transition-all ${
                    donationCycle === cycle
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {cycle === "once-off" ? "One-Off Gift" : "Monthly Supporter"}
                </button>
              ))}
            </div>

            {/* Donation Preset Amounts */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white">Select Donation Amount (ZAR):</label>
              <div className="grid grid-cols-5 gap-3">
                {PRESET_DONATIONS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setDonationAmount(amt);
                      setCustomDonation("");
                    }}
                    className={`py-3 rounded-2xl font-black text-sm border transition-all ${
                      donationAmount === amt && !customDonation
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg"
                        : "bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    R{amt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-slate-400 font-medium">Or enter custom donation amount (ZAR):</span>
                <input
                  type="number"
                  min="10"
                  placeholder="e.g. 1500"
                  value={customDonation}
                  onChange={(e) => setCustomDonation(e.target.value)}
                  className="w-32 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Message/Supporter Recognition */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" /> Optional Supporter Note / Encouragement Message:
              </label>
              <textarea
                rows={3}
                placeholder="Write a message for the developers or African students..."
                value={donorMessage}
                onChange={(e) => setDonorMessage(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Donation Action Button */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Donation Gift</span>
                  <div className="text-3xl font-black text-amber-400">R{effectiveDonation} <span className="text-xs font-normal text-slate-400">({donationCycle})</span></div>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Yoco Gateway Secured
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                  {successMessage}
                </div>
              )}

              <button
                onClick={() => handleCheckout("donate")}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
                {loading ? "Initializing Payment..." : `Donate R${effectiveDonation} ${donationCycle === "monthly" ? "Monthly" : "Now"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
