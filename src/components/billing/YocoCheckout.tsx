import React, { useState, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from "@/src/components/auth/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

declare global {
  interface Window {
    YocoSDK: any;
  }
}

interface YocoCheckoutProps {
  amount: number;
  planName: string;
  onSuccess?: () => void;
}

export default function YocoCheckout({ amount, planName, onSuccess }: YocoCheckoutProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const startPayment = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const functions = getFunctions();
      const createYocoPaymentIntent = httpsCallable(functions, "createYocoPaymentIntent");
      
      const result = await createYocoPaymentIntent({ amount, currency: "ZAR" });
      const { clientSecret, id } = result.data as { clientSecret: string; id: string };

      const yoco = new window.YocoSDK({
        publicKey: import.meta.env.VITE_YOCO_PUBLIC_KEY,
      });

      yoco.showPopup({
        amountInCents: amount * 100,
        currency: "ZAR",
        name: "Grade Master Africa Premium",
        description: planName,
        callback: async (result: any) => {
          if (result.error) {
            setError(result.error.message);
            setLoading(false);
          } else {
            // Payment processed, webhook will update Firestore
            // But we can verify or wait for a moment
            setIsSuccess(true);
            setLoading(false);
            if (onSuccess) onSuccess();
          }
        },
      });
    } catch (err: any) {
      console.warn("Cloud Functions Yoco intent unavailable, falling back to Server REST API...", err);
      try {
        const resp = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            userEmail: user.email,
            amount,
            type: "subscription",
            planName
          })
        });

        const data = await resp.json();
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          setError(data.error || "Failed to initialize payment. Please try again.");
          setLoading(false);
        }
      } catch (fallbackErr: any) {
        console.error("Yoco Payment Error:", fallbackErr);
        setError("Failed to initialize payment. Please check network connection.");
        setLoading(false);
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl shadow-xl border border-indigo-50">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
        <p className="text-slate-500 mb-6">
          Thank you for upgrading to Premium. Your account is being updated.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          Continue to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-800 text-white">
        <div className="p-6 bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border-b border-amber-400/30">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1">Pocket School Pro</p>
              <h3 className="text-2xl font-display font-black text-white">{planName}</h3>
            </div>
            <div className="p-3 bg-amber-400/10 rounded-2xl border border-amber-400/30">
              <CreditCard className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-300">R</span>
            <span className="text-4xl font-display font-black text-white">{amount}</span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">/month</span>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-slate-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-medium">Secure 256-bit encrypted Yoco payment</span>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-rose-500/10 text-rose-300 rounded-2xl text-xs border border-rose-500/30">
              {error}
            </div>
          )}

          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl",
              loading ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-amber-500/20"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay with Yoco Gateway"
            )}
          </button>
          
          <p className="mt-4 text-center text-[10px] text-slate-400">
            By clicking "Pay with Yoco Gateway", you agree to our Terms of Service.
            Processed by Yoco Technologies (Pty) Ltd.
          </p>
        </div>
      </div>

      {/* Confirmation Dialog Overlay */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl border border-slate-800 text-white flex flex-col relative text-left"
            >
              <div className="w-12 h-12 bg-amber-400/20 text-amber-400 rounded-2xl border border-amber-400/30 flex items-center justify-center mb-4 text-xl">
                💝
              </div>
              
              <h3 className="text-xl font-display font-black text-white mb-2">Confirm Subscription</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
                Your subscription directly funds educational software, offline learning kits, and AI tutoring for students across Africa.
              </p>

              {/* Selection Summary */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3 mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Selection Summary</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Selected Plan:</span>
                  <span className="font-extrabold text-white">{planName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Payment Channel:</span>
                  <span className="font-extrabold text-amber-300">Yoco Gateway</span>
                </div>
                <div className="h-px bg-slate-800" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300 font-bold">Total Amount Due:</span>
                  <span className="text-xl font-display font-black text-amber-400">R {amount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    startPayment();
                  }}
                  className="flex-1 py-3.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Confirm & Pay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
