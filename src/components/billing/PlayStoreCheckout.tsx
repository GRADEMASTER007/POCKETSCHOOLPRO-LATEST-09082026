import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/components/auth/AuthContext";
import { auth, appCheck } from "@/src/lib/firebase";
import { getToken } from "firebase/app-check";
import { Smartphone, ShieldCheck, Loader2, PlayCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

declare global {
  interface Window {
    getDigitalGoodsService: (id: string) => Promise<any>;
    PaymentRequest: any;
  }
}

interface PlayStoreCheckoutProps {
  skuId: string; // The SKU from Google Play Console
  planName: string;
}

export default function PlayStoreCheckout({ skuId, planName }: PlayStoreCheckoutProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<{ price: string; currency: string } | null>(null);

  useEffect(() => {
    async function initDigitalGoods() {
      if ("getDigitalGoodsService" in window) {
        try {
          const service = await window.getDigitalGoodsService("https://play.google.com/billing");
          const details = await service.getDetails([skuId]);
          if (details && details[0]) {
            setDetails({
              price: details[0].price.value,
              currency: details[0].price.currency,
            });
          }
        } catch (e) {
          console.warn("Digital Goods API not available or error:", e);
        }
      }
    }
    initDigitalGoods();
  }, [skuId]);

  const startPurchase = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const paymentMethods = [
      {
        supportedMethods: "https://play.google.com/billing",
        data: {
          sku: skuId,
        },
      },
    ];

    const paymentDetails = {
      total: {
        label: "Total",
        amount: { currency: details?.currency || "ZAR", value: details?.price || "0" },
      },
    };

    try {
      const request = new window.PaymentRequest(paymentMethods, paymentDetails);
      const response = await request.show();
      
      const { purchaseToken } = response.details;

      if (purchaseToken) {
        // Acknowledge the payment
        // In production, you would send this token to your backend to verify and acknowledge via Play Developer API
        // For simple acknowledgment in TWA:
        if (response.complete) {
          await response.complete("success");
        }
        
        console.log("Purchase successful, token:", purchaseToken);
        
        // Verify via backend
        const verifyResponse = await fetch("/api/verify-play-purchase", {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`},
           body: JSON.stringify({ purchaseToken, subscriptionId: skuId })
        });
        
        if (!verifyResponse.ok) {
           throw new Error("Failed to verify purchase on server");
        }

        alert("Purchase successful! Your account has been upgraded.");
        window.location.reload();
      } else {
        throw new Error("No purchase token received");
      }
    } catch (err: any) {
      console.error("Play Store Billing Error:", err);
      setError("Payment failed or cancelled. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800">
        <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-700 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-green-100 text-xs font-bold uppercase tracking-wider mb-1">Android App Exclusive</p>
              <h3 className="text-2xl font-bold">{planName}</h3>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium">{details?.currency || "ZAR"}</span>
            <span className="text-4xl font-bold">{details?.price || "---"}</span>
            <span className="text-green-100 text-sm">/mo</span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl mb-6">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Google Play Billing</p>
              <p className="text-[10px] text-slate-400">One-tap purchase with your Play Store account</p>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-red-900/20 text-red-400 rounded-xl text-sm border border-red-900/50">
              {error}
            </div>
          )}

          <button
            onClick={startPurchase}
            disabled={loading || !details}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
              loading || !details ? "bg-slate-700 cursor-not-allowed text-slate-500" : "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting to Google Play...
              </>
            ) : (
              "Upgrade on Play Store"
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px]">Managed by Google Play • Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
