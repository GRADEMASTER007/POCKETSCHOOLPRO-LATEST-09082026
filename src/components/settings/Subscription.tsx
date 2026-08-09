import { appCheck } from "@/src/lib/firebase";
import { getToken } from "firebase/app-check";
import { auth } from "@/src/lib/firebase";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Check, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Star,
  Layers,
  ArrowRight,
  ChevronLeft,
  CreditCard,
  Lock,
  RefreshCw,
  Info,
  DollarSign
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/components/auth/AuthContext";

const PRICING_SCHEMES: Record<string, { name: string; price: number }> = {
  free: { name: "Free Tier", price: 0 },
  basic_49: { name: "Basic Student Starter Pass", price: 49 },
  plus_69: { name: "Student Plus Pass", price: 69 },
  standard_99: { name: "Standard Student Pass", price: 99 },
  gold_199: { name: "Pocket School Pro Gold VIP Pass (3-Day Trial)", price: 199 },
  school_25: { name: "School Base Pass 25 (Up to 25 Seats)", price: 499 },
  school_100: { name: "School Base Pass 100 (Up to 100 Seats)", price: 1899 },
  school_300: { name: "School Base Pass 300 (Up to 300 Seats)", price: 4999 },
  school_1000: { name: "School Base Pass 1000 (Up to 1,000 Seats)", price: 14999 },
  // Backwards compatibility aliases
  basic: { name: "Basic Student Starter Pass", price: 49 },
  standard: { name: "Standard Student Pass", price: 99 },
  premium: { name: "Pocket School Pro Gold VIP Pass (3-Day Trial)", price: 199 },
  school: { name: "School Base Pass 25 (Up to 25 Seats)", price: 499 }
};

interface TierCardProps {
  id: string;
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  highlight?: boolean;
  buttonText: string;
  onUpgrade: (id: string) => void;
  currentTier?: string;
}

const TierCard = ({ id, title, price, subtitle, features, highlight, buttonText, onUpgrade, currentTier }: TierCardProps) => {
  const isCurrent = currentTier?.toLowerCase() === id.toLowerCase();
  
  return (
    <div className={cn(
      "p-6 md:p-8 rounded-[2.5rem] border flex flex-col h-full transition-all duration-300 relative overflow-hidden backdrop-blur-2xl",
      highlight 
        ? "bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-white" 
        : "bg-slate-900/90 border-slate-800 text-slate-100 hover:border-slate-700 shadow-xl"
    )}>
      {highlight && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-slate-950" /> MOST POPULAR
        </div>
      )}

      <div className="mb-6">
        <h3 className={cn("text-2xl font-display font-black mb-1 tracking-tight", highlight ? "text-amber-300" : "text-white")}>{title}</h3>
        <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
      </div>

      <div className="mb-6 flex items-baseline gap-1">
        <span className="text-4xl md:text-5xl font-display font-black tracking-tight text-white">{price}</span>
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">/month</span>
      </div>

      <div className="flex-1 space-y-3 mb-8">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-start gap-3">
            <div className={cn("mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", highlight ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-emerald-400")}>
              <Check className="w-3 h-3" />
            </div>
            <span className="text-xs font-medium text-slate-300 leading-relaxed">{f}</span>
          </div>
        ))}
      </div>

      <button 
        type="button"
        disabled={isCurrent}
        onClick={() => onUpgrade(id)}
        className={cn(
          "w-full py-4 rounded-2xl font-black transition-all shadow-xl active:scale-[0.98] cursor-pointer text-xs uppercase tracking-widest",
          isCurrent 
            ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 cursor-not-allowed" 
            : highlight 
              ? "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-amber-500/20" 
              : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
        )}
      >
        {isCurrent ? "Active Plan" : buttonText}
      </button>
    </div>
  );
};

export default function Subscription() {
  const { user, profile } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  // Checkout Dialog States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"details" | "processing" | "success" | "confirm">("details");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Simulated Card Info Input
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [currentTransactionId, setCurrentTransactionId] = useState("");

  // Custom Donation States
  const [donationAmount, setDonationAmount] = useState<number>(100);
  const [donationCycle, setDonationCycle] = useState<'once-off' | 'monthly'>('once-off');
  const [customDonationInput, setCustomDonationInput] = useState<string>("");

  // Custom Sponsorship States
  const [sponsorAmount, setSponsorAmount] = useState<number>(199);
  const [sponsorCycle, setSponsorCycle] = useState<'once-off' | 'monthly'>('monthly');
  const [sponsorshipContact, setSponsorshipContact] = useState<string>("");
  const [customSponsorInput, setCustomSponsorInput] = useState<string>("");
  const [allocatedSchool, setAllocatedSchool] = useState<string>("");

  useEffect(() => {
    const schools = [
      "Soweto High School (Gauteng)",
      "Khayelitsha Secondary School (Western Cape)",
      "Mitchells Plain Academy (Western Cape)",
      "Alexandria High School (Gauteng)",
      "Thembisa High School (Gauteng)",
      "Umlazi Secondary School (KwaZulu-Natal)",
      "Mamelodi Academic Hub (Gauteng)"
    ];
    setAllocatedSchool(schools[Math.floor(Math.random() * schools.length)]);
  }, [selectedPlanId]);
  
  const [usage, setUsage] = useState<any>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return;
      setUsageLoading(true);
      try {
        const response = await fetch("/api/subscription/usage", {
          headers: { "Authorization": `Bearer ${await user.getIdToken()}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUsage(data.usage);
        }
      } catch (err) {
        console.error("Failed to fetch usage:", err);
      } finally {
        setUsageLoading(false);
      }
    };
    fetchUsage();
  }, [user]);

  const currentTier = (profile as any)?.subscriptionTier || "free";

  const handleOpenCheckout = (planId: string) => {
    const planLower = planId.toLowerCase();
    setSelectedPlanId(planLower);
    
    if (planLower.startsWith("donation") || planLower.startsWith("sponsor")) {
      setCheckoutStep("confirm");
    } else {
      setCheckoutStep("details");
    }
    
    setIsCheckoutOpen(true);
    setCardName(user?.displayName || "");
    setCardNumber("4000 1234 5678 9010");
    setCardExpiry("12/28");
    setCardCvv("123");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setIsCheckoutOpen(true);
      setCheckoutStep("success");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else if (params.get("canceled") === "true") {
      alert("Payment was canceled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || !user) return;

    setIsProcessing(true);
    setCheckoutStep("processing");

    try {
      const isDon = selectedPlanId.startsWith("donation");
      const isSpon = selectedPlanId.startsWith("sponsor");

      const reqBody: any = {
        planId: selectedPlanId,
        userId: user.uid,
        email: user.email
      };

      if (isDon) {
        reqBody.amount = donationAmount;
        reqBody.cycle = donationCycle;
      } else if (isSpon) {
        reqBody.amount = sponsorAmount;
        reqBody.cycle = sponsorCycle;
        reqBody.sponsorshipContact = sponsorshipContact;
      }

      // 1. Request real Firebase-backed transaction initialization from the express server
      const initResponse = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`},
        body: JSON.stringify(reqBody)
      });

      if (!initResponse.ok) {
        throw new Error("Failed to initialize billing session on server");
      }

      const initData = await initResponse.json();
      const txId = initData.transaction.id;
      setCurrentTransactionId(txId);

      // Redirect to Yoco Checkout Gateway
      if (initData.paymentUrl) {
        window.location.href = initData.paymentUrl;
        return; // Halt execution while redirecting
      } else {
        // Fallback for some reason
        setCheckoutStep("success");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }

    } catch (err: any) {
      console.error("Payment Flow Error: ", err);
      alert("Error processing payment gateway: " + err.message);
      setCheckoutStep("details");
    } finally {
      setIsProcessing(false);
    }
  };

  const getActiveScheme = () => {
    if (!selectedPlanId) return null;
    const lower = selectedPlanId.toLowerCase();
    
    if (lower.startsWith("donation")) {
      return {
        name: `Donation (${donationCycle === 'monthly' ? 'Monthly' : 'Once-off'})`,
        price: donationAmount
      };
    }
    
    if (lower.startsWith("sponsor")) {
      return {
        name: `Sponsor (${sponsorCycle === 'monthly' ? 'Monthly' : 'Once-off'})`,
        price: sponsorAmount
      };
    }
    
    return PRICING_SCHEMES[lower];
  };

  const activeScheme = getActiveScheme();

  return (
    <div id="subscription-container" className="max-w-6xl mx-auto pb-24 text-white">
      <header className="px-6 pt-6 pb-12 flex flex-col items-center text-center">
        <Link to="/" className="self-start mb-8 text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
          Pocket School Pro Gold Subscription
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-black mb-4 tracking-tight text-white">
          Invest in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">Academic Future</span>
        </h1>
        <p className="text-slate-300 max-w-lg leading-relaxed mb-8 text-sm md:text-base font-medium">
          Unlock 4K realistic learning experiences, multilingual AI tutors, CAPS/IEB past exam analysis, and instant step-by-step homework help.
        </p>

        {usage && (
          <div className="w-full max-w-4xl mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              {usage?.isSchoolPooled && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-sky-500 text-[8px] font-black uppercase tracking-tighter rounded-bl-xl shadow-lg">
                  School Pooled
                </div>
              )}
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Tokens Remaining</div>
              <div className="text-3xl font-black text-white">{usage.tokensRemaining.toLocaleString()}</div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div 
                  className={cn("h-full", usage?.isSchoolPooled ? "bg-sky-500" : "bg-amber-500")}
                  style={{ width: `${Math.min(100, (usage.tokensRemaining / (usage.tokensRemaining + usage.totalTokensUsed)) * 100)}%` }}
                />
              </div>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Daily AI Queries</div>
              <div className="text-3xl font-black text-white">{usage.dailyRequestsRemaining} / {usage.dailyRequestsRemaining + usage.dailyRequestsUsed}</div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-cyan-500" 
                  style={{ width: `${(usage.dailyRequestsRemaining / (usage.dailyRequestsRemaining + usage.dailyRequestsUsed)) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Next Token Reset</div>
              <div className="text-xl font-black text-white">
                {(profile as any)?.nextBillingDate ? new Date((profile as any).nextBillingDate).toLocaleDateString("en-ZA") : "1st of Month"}
              </div>
              <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">
                {usage?.isSchoolPooled ? "School Institutional Cycle" : "Strict Monthly Usage Cap"}
              </p>
            </div>
          </div>
        )}

        <div className="bg-slate-900/90 p-1.5 rounded-full border border-slate-800 shadow-2xl flex items-center gap-2">
          {['monthly', 'yearly'].map((cycle) => (
            <button
              key={cycle}
              type="button"
              onClick={() => setBillingCycle(cycle)}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                billingCycle === cycle ? "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "text-slate-400 hover:text-white"
              )}
            >
              {cycle === 'yearly' ? 'Yearly (20% Off)' : 'Monthly'}
            </button>
          ))}
        </div>
      </header>

      {/* Student Individual Tiers */}
      <div className="mb-12">
        <h2 className="text-xl font-display font-black text-amber-300 uppercase tracking-widest text-center mb-6">
          Individual Student Learning Passes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          <TierCard 
            id="basic_49"
            title="Basic Starter"
            subtitle="Essential daily practice & homework helper."
            price="R49"
            buttonText="Get R49 Starter"
            features={[
              "150,000 AI Tokens / month cap",
              "30 AI Tutor queries / day",
              "10 Homework Vision Scans / day",
              "15 Mins Voice AI Tutor / day",
              "Smart Notebook & Offline Saver"
            ]}
            currentTier={currentTier}
            onUpgrade={handleOpenCheckout}
          />
          <TierCard 
            id="plus_69"
            title="Student Plus"
            subtitle="Higher query allowance & exam help."
            price="R69"
            buttonText="Get R69 Plus"
            features={[
              "350,000 AI Tokens / month cap",
              "75 AI Tutor queries / day",
              "25 Homework Vision Scans / day",
              "30 Mins Voice AI Tutor / day",
              "CAPS & IEB Past Exam Solution Engine"
            ]}
            currentTier={currentTier}
            onUpgrade={handleOpenCheckout}
          />
          <TierCard 
            id="standard_99"
            title="Standard Pass"
            subtitle="Power student toolkit for high achievers."
            price="R99"
            buttonText="Get R99 Standard"
            features={[
              "750,000 AI Tokens / month cap",
              "150 AI Tutor queries / day",
              "50 Homework Vision Scans / day",
              "45 Mins Voice AI Tutor / day",
              "Feynman Cognitive Lab & AI Whiteboard"
            ]}
            currentTier={currentTier}
            onUpgrade={handleOpenCheckout}
          />
          <TierCard 
            id="gold_199"
            title="Gold VIP Pass"
            subtitle="Complete 4K Cinematic AI Supercharged School."
            price="R199"
            buttonText="Start 3-Day Free Trial"
            highlight={true}
            features={[
              "2,500,000 AI Tokens / month cap",
              "300 AI Tutor queries / day",
              "100 Homework Vision Scans / day",
              "90 Mins Spoken AI Tutor (11 SA Languages)",
              "3-Day Free Trial (Protected Quota) - Cancel Anytime"
            ]}
            currentTier={currentTier}
            onUpgrade={handleOpenCheckout}
          />
        </div>
      </div>

      {/* School / Institutional Base Passes */}
      <div className="mb-16">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-display font-black text-white tracking-tight">
            Institutional & School Base Passes <span className="text-amber-400 font-extrabold">(Multi-Learner Seats)</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Strict registered email domain caps and pooled token quotas protecting institutional budgets while delivering guaranteed educational value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          <TierCard 
            id="school_25"
            title="School Base 25"
            subtitle="Small classroom / tutorship (up to 25 learners)."
            price="R499"
            buttonText="Subscribe Base 25"
            features={[
              "Max 25 Registered Learner Emails",
              "10,000,000 Pooled Tokens / month",
              "Teacher & Parent Oversight Portal",
              "R19.96 / learner seat equivalent",
              "Token Quota Safeguard against overspend"
            ]}
            currentTier={currentTier}
            onUpgrade={handleOpenCheckout}
          />
          <TierCard 
            id="school_100"
            title="School Base 100"
            subtitle="Medium school / grade block (up to 100 learners)."
            price="R1,899"
            buttonText="Subscribe Base 100"
            features={[
              "Max 100 Registered Learner Emails",
              "35,000,000 Pooled Tokens / month",
              "R18.99 / learner seat equivalent",
              "Admin Seat Allocation & License Management",
              "Priority AI Processing Speed"
            ]}
            currentTier={currentTier}
            onUpgrade={handleOpenCheckout}
          />
          <TierCard 
            id="school_300"
            title="School Base 300"
            subtitle="Large academy / school (up to 300 learners)."
            price="R4,999"
            buttonText="Subscribe Base 300"
            features={[
              "Max 300 Registered Learner Emails",
              "90,000,000 Pooled Tokens / month",
              "R16.66 / learner seat equivalent",
              "Dedicated School Branded Dashboard",
              "Enterprise Grade Security & Compliance"
            ]}
            currentTier={currentTier}
            onUpgrade={handleOpenCheckout}
          />
          <TierCard 
            id="school_1000"
            title="School Base 1000"
            subtitle="Mega campus / district (up to 1,000 learners)."
            price="R14,999"
            buttonText="Subscribe Base 1000"
            highlight={true}
            features={[
              "Max 1,000 Registered Learner Emails",
              "250,000,000 Pooled Tokens / month",
              "R14.99 / learner seat equivalent",
              "Dedicated 24/7 Account Manager & Setup",
              "Zero-latency Cloud Infrastructure"
            ]}
            currentTier={currentTier}
            onUpgrade={handleOpenCheckout}
          />
        </div>
      </div>

      {/* Checkout Gateway Dialog / Modal Overlay */}
      <AnimatePresence>
        {isCheckoutOpen && activeScheme && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 border border-gray-100 shadow-2xl relative overflow-hidden"
            >
              {checkoutStep === "confirm" && (
                <div className="space-y-6">
                  {/* Top Bar / Header */}
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-950">Thank You for Your Support!</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Your contribution has a profound impact on the future of under-resourced learners in Africa.
                    </p>
                  </div>

                  {/* Contribution Details Summary */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-150/60 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contribution Type</span>
                      <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase">
                        {selectedPlanId?.startsWith("sponsor") ? "Student Sponsorship" : "Development Donation"}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contribution Amount</span>
                      <span className="text-2xl font-black text-gray-900">R {activeScheme.price}.00</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span className="font-medium text-gray-500">Payment Frequency</span>
                      <span className="font-bold capitalize">{selectedPlanId?.startsWith("sponsor") ? sponsorCycle : donationCycle}</span>
                    </div>

                    {selectedPlanId?.startsWith("sponsor") && (
                      <div className="pt-3 border-t border-gray-250/50 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-500">Target Student Contact</span>
                          <span className="font-bold text-gray-900">
                            {sponsorshipContact && sponsorshipContact.trim() !== "" 
                              ? sponsorshipContact 
                              : "Automated Allocation"}
                          </span>
                        </div>
                        {(!sponsorshipContact || sponsorshipContact.trim() === "") && (
                          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-[11px] text-indigo-800 leading-relaxed">
                            <span className="font-bold">🏫 Assigned School:</span> {allocatedSchool || "Random South African School"}. A learner from this school will be randomly selected to receive Grade Master Africa Premium access funded by your contribution.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep("details")}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md text-sm"
                    >
                      <Lock className="w-4 h-4 text-indigo-200" />
                      Proceed to Secure Yoco Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-700 font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      Cancel and Edit Contribution
                    </button>
                  </div>
                </div>
              )}

              {checkoutStep === "details" && (
                <form onSubmit={handleProcessCheckout} className="space-y-6">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[#E0E7FF] text-[#4338CA] flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-sm">AfricaPay Secure Gate</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Checkout Session</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="text-gray-400 hover:text-gray-600 text-sm font-bold bg-gray-50 hover:bg-gray-100 p-2 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Plan Price Sheet */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150/60">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-500">Selected Product</span>
                      <span className="text-xs font-black text-gray-900 bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full uppercase">
                        {activeScheme.name} Tier
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-gray-400">Total Subscription Price (ZAR)</span>
                      <span className="text-2xl font-black text-gray-900">R{activeScheme.price}.00</span>
                    </div>
                  </div>

                  {/* Payment Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Card Holder Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Credit/Debit Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4000 1234 5678 9010"
                        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Expiry Date</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">CVV Security Code</label>
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          maxLength={3}
                          placeholder="***"
                          className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms & Submit button */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                      By submitting, you authorize the secure payment of R{activeScheme.price}.00 to Grade Master Africa. Your connection is fully encrypted under TLS 1.3 standards.
                    </p>
                    <button
                      type="submit"
                      className="w-full py-4 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md text-sm"
                    >
                      <Lock className="w-4 h-4 text-brand-primary" />
                      Authorize Payment
                    </button>
                  </div>
                </form>
              )}

              {checkoutStep === "processing" && (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                  <RefreshCw className="w-12 h-12 text-brand-primary animate-spin" />
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">Processing Authorization...</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mt-1 max-w-xs mx-auto">
                      Connecting with South African credit networks and completing your transaction securely. Please do not close or refresh this tab.
                    </p>
                  </div>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="py-8 flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-xl">Payment Settlement Successful</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-2 max-w-sm">
                      Your subscription is upgraded to the **{activeScheme.name}** level! The transaction record ({currentTransactionId}) is saved securely to the Firestore database. Welcome to Grade Master premium hub!
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-mono font-bold max-w-xs">
                    🔒 Subscription Active immediately. Reloading context...
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sponsorship & Donate blocks */}
      <div className="mt-12 px-4 space-y-12">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Support Our Mission</h2>
          <p className="text-sm text-gray-500 mt-2">
            Make a direct impact. Help us keep Grade Master Africa Africa accessible to millions of learners, or sponsor a specific student to unlock their potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Sponsor a Student */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-950 mb-2">Sponsor a Student</h3>
              <p className="text-sm text-gray-500 mb-6">
                Directly fund a student's Grade Master Africa Premium access to help them excel in their exams.
              </p>

              {/* Once-off vs Monthly Switch */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Frequency</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSponsorCycle('once-off')}
                    className={cn(
                      "py-2 text-xs font-semibold rounded-lg transition-all",
                      sponsorCycle === 'once-off' ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    Once-off
                  </button>
                  <button
                    type="button"
                    onClick={() => setSponsorCycle('monthly')}
                    className={cn(
                      "py-2 text-xs font-semibold rounded-lg transition-all",
                      sponsorCycle === 'monthly' ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    Monthly Recurring
                  </button>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Select Sponsorship Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Basic Starter", val: 49 },
                    { label: "Student Plus", val: 69 },
                    { label: "Standard Pass", val: 99 },
                    { label: "Gold VIP Pass", val: 199 },
                    { label: "School Base 25", val: 499 }
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => {
                        setSponsorAmount(p.val);
                        setCustomSponsorInput("");
                      }}
                      className={cn(
                        "p-3 rounded-2xl border text-left transition-all relative overflow-hidden",
                        sponsorAmount === p.val && !customSponsorInput
                          ? "border-brand-secondary bg-brand-secondary/5 text-brand-secondary ring-2 ring-brand-secondary/10"
                          : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{p.label}</span>
                      <span className="text-base font-extrabold">R {p.val}</span>
                      <span className="text-[10px] text-gray-400 font-medium">/{sponsorCycle === 'monthly' ? 'mo' : 'once'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Or Custom Sponsor Amount (ZAR)</label>
                <input
                  type="number"
                  placeholder="Enter custom amount (e.g. 250)"
                  value={customSponsorInput}
                  onChange={(e) => {
                    setCustomSponsorInput(e.target.value);
                    setSponsorAmount(Number(e.target.value) || 199);
                  }}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-secondary"
                />
              </div>

              {/* Student Target Field */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Target Student Contact (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Student Email or Phone Number (e.g. learner@school.za)"
                  value={sponsorshipContact}
                  onChange={(e) => setSponsorshipContact(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                />
                
                {/* Visual Explanation Banner */}
                <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-[11px] text-indigo-800 leading-relaxed">
                  <span className="font-bold">💡 How this works:</span> If you leave this blank, Grade Master Africa will automatically select a random under-resourced South African school and look for learners who would benefit most from using the app.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenCheckout("sponsor")}
              className="w-full py-4 bg-brand-secondary text-white font-bold rounded-2xl hover:bg-brand-secondary/95 transition-all text-xs uppercase tracking-wider shadow-md"
            >
              Confirm Sponsor (R{sponsorAmount})
            </button>
          </div>

          {/* Card 2: Donate to Development */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-950 mb-2">Donate to Development</h3>
              <p className="text-sm text-gray-500 mb-6">
                Support the development of Aristotle AI and public school education initiatives across Africa.
              </p>

              {/* Once-off vs Monthly Switch */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Donation Frequency</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  <button
                    type="button"
                    onClick={() => setDonationCycle('once-off')}
                    className={cn(
                      "py-2 text-xs font-semibold rounded-lg transition-all",
                      donationCycle === 'once-off' ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    Once-off
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonationCycle('monthly')}
                    className={cn(
                      "py-2 text-xs font-semibold rounded-lg transition-all",
                      donationCycle === 'monthly' ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    Monthly Support
                  </button>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Select Preset Amount</label>
                <div className="grid grid-cols-2 gap-3">
                  {[50, 100, 250, 500].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setDonationAmount(amount);
                        setCustomDonationInput("");
                      }}
                      className={cn(
                        "p-3 rounded-2xl border text-left transition-all",
                        donationAmount === amount && !customDonationInput
                          ? "border-slate-900 bg-slate-50 text-slate-900 ring-2 ring-slate-900/10"
                          : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Contribution</span>
                      <span className="text-base font-extrabold">R {amount}</span>
                      <span className="text-[10px] text-gray-400 font-medium">/{donationCycle === 'monthly' ? 'mo' : 'once'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Or Custom Donation Amount (ZAR)</label>
                <input
                  type="number"
                  placeholder="Enter custom amount (e.g. 150)"
                  value={customDonationInput}
                  onChange={(e) => {
                    setCustomDonationInput(e.target.value);
                    setDonationAmount(Number(e.target.value) || 100);
                  }}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Secure Transaction Pledge */}
              <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-600 leading-relaxed">
                <div className="flex gap-1.5 items-center font-bold mb-1 text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Secure Local Contribution</span>
                </div>
                Your generous contribution directly funds free access, educational content, and digital infrastructure initiatives for students and schools in under-resourced areas.
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenCheckout("donation")}
              className="w-full py-4 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-2xl transition-all text-xs uppercase tracking-wider shadow-md"
            >
              Authorize Donation (R{donationAmount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
