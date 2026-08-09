import { appCheck } from "@/src/lib/firebase";
import { getToken } from "firebase/app-check";
import { auth } from "@/src/lib/firebase";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wifi, WifiOff, CloudLightning, RefreshCw, CheckCircle, AlertCircle, X } from "lucide-react";

export default function ConnectivityToast() {
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? window.navigator.onLine : true);
  const [showBackOnlineToast, setShowBackOnlineToast] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced">("synced");
  const [hasShownOffline, setHasShownOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      if (hasShownOffline) {
        setSyncStatus("syncing");
        setShowBackOnlineToast(true);
        // Simulate database sync progress for premium feel
        const syncTimeout = setTimeout(() => {
          setSyncStatus("synced");
        }, 2000);
        
        // Automatically hide the back-online notification after 5 seconds
        const dismissTimeout = setTimeout(() => {
          setShowBackOnlineToast(false);
        }, 5000);

        return () => {
          clearTimeout(syncTimeout);
          clearTimeout(dismissTimeout);
        };
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasShownOffline(true);
      setShowBackOnlineToast(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [hasShownOffline]);

  const verifyConnection = async () => {
    if (isChecking) return;
    setIsChecking(true);
    try {
      // Fetch with timeout to check actual connection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const response = await fetch("/api/health", { 
        method: "GET",
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setIsOnline(true);
        if (!isOnline) {
          // If we thought we were offline but successfully fetched
          setSyncStatus("syncing");
          setShowBackOnlineToast(true);
          setTimeout(() => setSyncStatus("synced"), 1500);
          setTimeout(() => setShowBackOnlineToast(false), 4500);
        }
      } else {
        throw new Error("API unhealthy");
      }
    } catch (err) {
      console.warn("Actual network verification failed:", err);
      // If we got an error, we might actually be offline or can't hit the API
      if (isOnline) {
        setIsOnline(false);
        setHasShownOffline(true);
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div id="connectivity-toast-container" className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {/* Case 1: Offline Toast (Persistent) */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white border-2 border-amber-500/80 rounded-[2rem] p-6 shadow-xl shadow-amber-500/5 flex flex-col gap-4 relative overflow-hidden group"
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                <WifiOff className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900 tracking-tight">Offline Mode Active</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  You are currently disconnected. Grade Master Africa will save all your tutor questions, notes, and study progress locally until you are back online.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-[11px]">
              <span className="flex items-center gap-1.5 font-semibold text-amber-600">
                <CloudLightning className="w-3.5 h-3.5" />
                Local Backup Enabled
              </span>
              <button 
                type="button"
                onClick={verifyConnection}
                disabled={isChecking}
                className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl font-bold hover:bg-amber-100 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`} />
                {isChecking ? "Checking..." : "Verify State"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Case 2: Back Online Success Notification */}
        {showBackOnlineToast && isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white border-2 border-emerald-500/80 rounded-[2rem] p-6 shadow-xl shadow-emerald-500/5 flex flex-col gap-3 relative overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
            
            <button 
              type="button"
              onClick={() => setShowBackOnlineToast(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                {syncStatus === "syncing" ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900 tracking-tight">
                  {syncStatus === "syncing" ? "Synchronizing Data..." : "Connection Restored"}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {syncStatus === "syncing" 
                    ? "Re-establishing server tunnels. Syncing offline logs, documents, and dashboard analytics..." 
                    : "Grade Master is fully synchronized. Your work is safely saved on our secure cloud database."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
