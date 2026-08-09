import { useState, useEffect, useRef } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface PwaState {
  isStandalone: boolean;
  serviceWorkerStatus: 'supported' | 'unsupported' | 'controlled' | 'uncontrolled' | 'unknown';
  isOnline: boolean;
  effectiveType: string;
  downlink: number;
  rtt: number;
  isInstallable: boolean;
  installationState: 'unknown' | 'installable' | 'installed' | 'standalone';
}

export interface ModelMetadata {
  id: string;
  name: string;
  description: string;
  contextWindow: string;
  recommendedFor: string;
  tierAccess: string;
  features: string[];
}

const FALLBACK_METADATA: ModelMetadata[] = [
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    description: "Lightweight, ultra-fast model optimized for high-frequency interactive learning, quick definitions, and step-by-step explanations.",
    contextWindow: "1M tokens",
    recommendedFor: "General Q&A, STEM Lab interactions, fast homework checks.",
    tierAccess: "All Tiers (including Free)",
    features: ["Real-time response", "Text explanations", "Image recognition (math/science solving)"]
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    description: "Premium reasoning engine for complex academic exploration, research thesis synthesis, advanced math solving, and full-stack coding modules.",
    contextWindow: "2M tokens",
    recommendedFor: "Advanced STEM simulation, in-depth academic research, writing assistance.",
    tierAccess: "Pro & Enterprise Tiers",
    features: ["High-fidelity complex reasoning", "Multimodal file analysis", "Advanced research synthesis"]
  }
];

export function usePwaAudit() {
  const [pwaState, setPwaState] = useState<PwaState>(() => {
    const conn = typeof navigator !== 'undefined' ? ((navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection) : null;
    const isStandaloneMedia = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
    const isStandaloneSafari = typeof navigator !== 'undefined' && (navigator as any).standalone === true;
    const isStandalone = !!(isStandaloneMedia || isStandaloneSafari);
    
    return {
      isStandalone,
      serviceWorkerStatus: typeof navigator !== 'undefined' && navigator.serviceWorker ? (navigator.serviceWorker.controller ? 'controlled' : 'supported') : 'unsupported',
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      effectiveType: conn?.effectiveType || 'unknown',
      downlink: conn?.downlink || 0,
      rtt: conn?.rtt || 0,
      isInstallable: false,
      installationState: isStandalone ? 'standalone' : 'unknown',
    };
  });

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [modelMetadata, setModelMetadata] = useState<ModelMetadata[]>(FALLBACK_METADATA);
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);
  const hasLoggedInitial = useRef(false);
  const lastStateLogged = useRef<string>('');

  const loadMetadata = async () => {
    const cacheName = 'ai-metadata-cache-v1';
    const requestUrl = '/api/model-metadata';
    
    // 1. Try to load from Cache first (Cache-First Strategy)
    let cachedData: ModelMetadata[] | null = null;
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(requestUrl);
        if (cachedResponse) {
          const raw = await cachedResponse.json();
          // Deep sanitize to prevent any property leakage
          cachedData = raw.map((item: any) => ({
            id: String(item.id || ''),
            name: String(item.name || ''),
            description: String(item.description || ''),
            contextWindow: String(item.contextWindow || ''),
            recommendedFor: String(item.recommendedFor || ''),
            tierAccess: String(item.tierAccess || ''),
            features: Array.isArray(item.features) ? item.features.map(String) : []
          }));
          setModelMetadata(cachedData!);
          setIsMetadataLoading(false);
        }
      } catch (err) {
        console.warn('[PwaAudit] Cache read failed:', err);
      }
    }

    // 2. Fetch from network and update cache in the background (Stale-While-Revalidate Strategy)
    try {
      const res = await fetch(requestUrl);
      if (res.ok) {
        const rawList = await res.json();
        
        // Strictly sanitize and strip out any financial or internal leakage keys
        const sanitizedList: ModelMetadata[] = rawList.map((item: any) => ({
          id: String(item.id || ''),
          name: String(item.name || ''),
          description: String(item.description || ''),
          contextWindow: String(item.contextWindow || ''),
          recommendedFor: String(item.recommendedFor || ''),
          tierAccess: String(item.tierAccess || ''),
          features: Array.isArray(item.features) ? item.features.map(String) : []
        }));

        // Put sanitized version back into Cache
        if (typeof window !== 'undefined' && 'caches' in window) {
          try {
            const cache = await caches.open(cacheName);
            await cache.put(requestUrl, new Response(JSON.stringify(sanitizedList), {
              headers: { 'Content-Type': 'application/json' }
            }));
          } catch (cacheErr) {
            console.warn('[PwaAudit] Cache write failed:', cacheErr);
          }
        }

        setModelMetadata(sanitizedList);
      } else if (!cachedData) {
        // Fallback to static defaults if network failed and no cache
        setModelMetadata(FALLBACK_METADATA);
      }
    } catch (networkErr) {
      console.warn('[PwaAudit] Network fetch for metadata failed:', networkErr);
      if (!cachedData) {
        setModelMetadata(FALLBACK_METADATA);
      }
    } finally {
      setIsMetadataLoading(false);
    }
  };

  // Run metadata loader and bind service worker messages
  useEffect(() => {
    loadMetadata();

    if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'SYNC_MODEL_METADATA') {
          console.log('[PwaAudit] Service worker requested metadata resync.');
          loadMetadata();
        }
      };
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnlineStatus = () => {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      setPwaState(prev => ({
        ...prev,
        isOnline: true,
        effectiveType: conn?.effectiveType || 'unknown',
        downlink: conn?.downlink || 0,
        rtt: conn?.rtt || 0,
      }));
    };

    const handleOfflineStatus = () => {
      setPwaState(prev => ({
        ...prev,
        isOnline: false,
        effectiveType: 'none',
        downlink: 0,
        rtt: 0,
      }));
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        installationState: 'installable',
      }));
    };

    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstallable: false,
        installationState: 'installed',
      }));
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const handleConnectionChange = () => {
      setPwaState(prev => ({
        ...prev,
        effectiveType: conn?.effectiveType || 'unknown',
        downlink: conn?.downlink || 0,
        rtt: conn?.rtt || 0,
      }));
    };

    if (conn && typeof conn.addEventListener === 'function') {
      conn.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (conn && typeof conn.removeEventListener === 'function') {
        conn.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;

    const handleControllerChange = () => {
      setPwaState(prev => ({
        ...prev,
        serviceWorkerStatus: navigator.serviceWorker.controller ? 'controlled' : 'supported',
      }));
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  useEffect(() => {
    const logPwaAudit = async (userId: string, isInitialLoad: boolean) => {
      try {
        const perfTiming = {
          loadTimeMs: 0,
          domInteractiveMs: 0,
          dnsLookupMs: 0,
          tcpConnectMs: 0,
          requestResponseMs: 0,
          deviceMemory: (navigator as any).deviceMemory || 0,
          hardwareConcurrency: navigator.hardwareConcurrency || 0,
        };

        if (typeof window !== 'undefined' && window.performance) {
          const navEntries = performance.getEntriesByType('navigation');
          if (navEntries && navEntries.length > 0) {
            const nav = navEntries[0] as PerformanceNavigationTiming;
            perfTiming.loadTimeMs = Math.round(nav.duration || 0);
            perfTiming.domInteractiveMs = Math.round(nav.domInteractive || 0);
            perfTiming.dnsLookupMs = Math.max(0, Math.round(nav.domainLookupEnd - nav.domainLookupStart));
            perfTiming.tcpConnectMs = Math.max(0, Math.round(nav.connectEnd - nav.connectStart));
            perfTiming.requestResponseMs = Math.max(0, Math.round(nav.responseEnd - nav.requestStart));
          } else if (performance.timing) {
            const t = performance.timing;
            const start = t.navigationStart || t.fetchStart;
            perfTiming.loadTimeMs = Math.max(0, Math.round((t.loadEventEnd || Date.now()) - start));
            perfTiming.domInteractiveMs = Math.max(0, Math.round((t.domInteractive || Date.now()) - start));
            perfTiming.dnsLookupMs = Math.max(0, Math.round(t.domainLookupEnd - t.domainLookupStart));
            perfTiming.tcpConnectMs = Math.max(0, Math.round(t.connectEnd - t.connectStart));
            perfTiming.requestResponseMs = Math.max(0, Math.round(t.responseEnd - t.requestStart));
          }
        }

        const docRef = doc(collection(db, 'pwa_audits'));
        const payload = {
          userId,
          isStandalone: pwaState.isStandalone,
          serviceWorkerStatus: pwaState.serviceWorkerStatus,
          isOnline: pwaState.isOnline,
          effectiveType: pwaState.effectiveType,
          downlink: pwaState.downlink,
          rtt: pwaState.rtt,
          isInstallable: pwaState.isInstallable,
          installationState: pwaState.installationState,
          loadTimeMs: isInitialLoad ? perfTiming.loadTimeMs : 0,
          domInteractiveMs: isInitialLoad ? perfTiming.domInteractiveMs : 0,
          dnsLookupMs: isInitialLoad ? perfTiming.dnsLookupMs : 0,
          tcpConnectMs: isInitialLoad ? perfTiming.tcpConnectMs : 0,
          requestResponseMs: isInitialLoad ? perfTiming.requestResponseMs : 0,
          deviceMemory: perfTiming.deviceMemory,
          hardwareConcurrency: perfTiming.hardwareConcurrency,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        };

        await setDoc(docRef, payload);
        
        setAuditLogs(prev => [payload, ...prev].slice(0, 50));
        console.log('[PwaAudit] Diagnostic audit logged successfully:', payload);
      } catch (err) {
        console.error('[PwaAudit] Failed to write audit to Firestore:', err);
        try {
          handleFirestoreError(err, OperationType.CREATE, 'pwa_audits');
        } catch (_) {}
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const isStand = pwaState.isStandalone;
      const isOn = pwaState.isOnline;
      const swStatus = pwaState.serviceWorkerStatus;
      const connType = pwaState.effectiveType;
      const isInstall = pwaState.isInstallable;
      const instState = pwaState.installationState;
      
      const sessionKey = `pwa_load_logged_${user.uid}`;
      const sessionLogged = sessionStorage.getItem(sessionKey);

      if (!sessionLogged && !hasLoggedInitial.current) {
        hasLoggedInitial.current = true;
        sessionStorage.setItem(sessionKey, 'true');
        
        if (typeof document !== 'undefined' && document.readyState !== 'complete') {
          const loadHandler = () => {
            setTimeout(() => logPwaAudit(user.uid, true), 2000);
          };
          window.addEventListener('load', loadHandler, { once: true });
        } else {
          setTimeout(() => logPwaAudit(user.uid, true), 2000);
        }
      }

      const currentStateString = `${isOn}_${isStand}_${swStatus}_${connType}_${isInstall}_${instState}`;
      if (lastStateLogged.current && lastStateLogged.current !== currentStateString) {
        lastStateLogged.current = currentStateString;
        logPwaAudit(user.uid, false);
      } else if (!lastStateLogged.current) {
        lastStateLogged.current = currentStateString;
      }
    });

    return () => unsubscribe();
  }, [pwaState]);

  return {
    ...pwaState,
    auditLogs,
    modelMetadata,
    isMetadataLoading,
    refetchMetadata: loadMetadata,
  };
}
