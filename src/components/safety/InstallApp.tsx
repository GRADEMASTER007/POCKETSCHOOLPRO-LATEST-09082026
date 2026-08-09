import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Download, 
  Sparkles, 
  X, 
  Smartphone, 
  Monitor, 
  Clock,
  QrCode, 
  CheckCircle,
  Share,
  PlusSquare,
  Compass,
  HelpCircle,
  Copy,
  Check,
  History,
  Settings,
  Camera,
  RefreshCw,
  AlertCircle,
  Languages,
  Globe,
  Info,
  Sun,
  PartyPopper,
  Save,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  MessageCircle,
  ArrowRightLeft,
  Battery,
  BatteryCharging,
  Eye,
  EyeOff,
  Wifi,
  Gauge,
  Zap,
  Volume2,
  VolumeX,
  Play,
  Square,
  Plus,
  Trash2,
  Sliders,
  RotateCcw,
  Vibrate,
  Radio,
  Activity
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/src/lib/utils";
import confetti from "canvas-confetti";
import { createKeepNote } from "@/src/lib/google-keep";
import { UnitConverter } from "@/src/components/tools/UnitConverter";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { useBatterySaver } from "@/src/hooks/useBatterySaver";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const translations = {
  en: {
    title: "Install Grade Master",
    descAndroid: "Add Grade Master Africa to your device for rapid offline loading, streamlined focus notifications, and a full-screen workspace.",
    descIos: "Add Grade Master Africa directly to your iPhone or iPad home screen for premium voice features and full-screen workspace.",
    iosSafariGuide: "Safari iOS uses a manual setup guide.",
    shareLink: "Share Link",
    copied: "Copied!",
    copyLink: "Copy Link",
    stopScan: "Stop Scan",
    quickScan: "Quick Scan",
    installNow: "Install Now",
    howToInstall: "How to Install",
    usingIosGuide: "Using iOS? Open Safari Setup Guide",
    installedSuccess: "Installed Successfully!",
    installedSuccessDesc: "Grade Master Africa is now running natively on your device. Enjoy the full-screen desktop/mobile environment!",
    scanToOpen: "Scan to Open on Phone",
    quickScanViewer: "Quick Scan Viewer",
    aimCamera: "Aim camera at PWA QR code on another screen.",
    simulateAutoDetect: "Simulate Auto-Detect",
    scanningFeed: "Scanning Feed...",
    cameraBlocked: "Camera Blocked",
    couldNotAccessCamera: "Could not access camera. Please check camera permissions in your browser settings.",
    qrTheme: "QR Theme",
    autoRefresh: "Auto-refresh (30s)",
    linkHistory: "Link History",
    hapticStrength: "Haptic Vibe Strength",
    hapticsTitle: "Haptic Feedback & Custom Vibration",
    hapticsToggle: "Enable Haptic Vibrations",
    hapticsEnabledLabel: "Vibrations On",
    hapticsDisabledLabel: "Vibrations Off",
    hapticsOffDesc: "Haptic feedback is turned off completely. Enable to customize presets or design your own pattern.",
    hapticModeLabel: "Vibration Mode",
    presetMode: "Strength Presets",
    customMode: "Visual Pattern Builder",
    testVibe: "Test Pattern",
    savePattern: "Save Pattern",
    patternSaved: "Saved!",
    resetPattern: "Reset Default",
    tapToRecord: "Tap / Hold to Record Rhythm",
    recordingActive: "Recording Pulse...",
    recordingFinished: "Recorded Taps Applied!",
    timelineTitle: "Visual Vibration Timeline",
    addPulse: "+ Pulse",
    addPause: "+ Pause",
    presetTemplates: "Quick Patterns",
    totalDuration: "Total",
    stepPulse: "Pulse",
    stepPause: "Pause",
    low: "low",
    medium: "medium",
    high: "high",
    iosSetupTitle: "iOS Safari Setup",
    iosSetupHeading: "Add to Home Screen",
    iosSetupDesc: "Apple iOS requires a brief 10-second manual addition since Safari does not permit automatic one-click web installations.",
    step1Title: "1. Open in Safari browser",
    step1Desc: "Make sure you are browsing in Safari. Other iOS browsers (like Chrome or Firefox) cannot register home screen applications.",
    step2Title: "2. Tap the Share icon",
    step2Desc: "Look for the Share icon on Safari's toolbar at the bottom of the screen (a square with an upward pointing arrow).",
    step3Title: "3. Tap 'Add to Home Screen'",
    step3Desc: "Scroll down the menu list and select 'Add to Home Screen'. If you don't see it, tap 'Edit Actions' at the bottom.",
    step4Title: "4. Confirm Name & Add",
    step4Desc: "Tap the 'Add' button in the top-right corner. The Grade Master applet is now ready directly on your home screen!",
    gotIt: "Got It, Thanks!",
    saveQrAsImage: "Save QR as Image",
    quickHelpTitle: "Quick Scan Tips",
    quickHelpTip1: "Position the QR code inside the green viewport guidelines.",
    quickHelpTip2: "Check your lighting! Avoid deep shadows, glare, or extremely dim environments.",
    quickHelpTipLight: "Best scan in bright ambient light",
    quickHelpGotIt: "Got It",
    saveToKeep: "Save to Keep",
    savingToKeep: "Saving...",
    savedToKeep: "Saved!",
    shareWhatsApp: "Share via WhatsApp",
    whatsappMessage: "Check out Grade Master Africa! It's a powerful tool for tracking your grades and academic progress. Install it here: ",
    autoStartScanner: "Auto-Start Scanner",
    torch: "Torch",
    torchOn: "Torch On",
    torchOff: "Torch Off",
    toggleQrLogo: "Toggle QR Logo",
    speedTestTitle: "Real-time Network Speed Test",
    runSpeedTestBtn: "Test Connection Speed",
    testingSpeedProgress: "Testing Network (1MB payload)...",
    speedTestedAtValue: "Actual Speed: ",
    networkQualityLabel: "Network Quality: ",
    qualityExcellent: "Excellent (Super-fast)",
    qualityGood: "Good (Stable)",
    qualityFair: "Fair (Decent)",
    qualityPoor: "Poor (Slow connection)",
    speedTestErrorMsg: "Speed test failed. Try again.",
    speedTestCompleted: "Speed test completed!",
    offlineReady: "Offline Ready",
    offlineCaching: "Caching assets...",
    offlineNotReady: "Online Only",
    swStateLabel: "Service Worker: ",
    swActive: "Active",
    swRegistering: "Registering...",
    swNotRegistered: "Not Registered",
    swUnsupported: "Unsupported"
  },
  fr: {
    title: "Installer Grade Master",
    descAndroid: "Ajoutez Grade Master Africa à votre appareil pour un chargement hors ligne rapide, des notifications de concentration simplifiées et un espace de travail en plein écran.",
    descIos: "Ajoutez Grade Master Africa directement à l'écran d'accueil de votre iPhone ou iPad pour des fonctionnalités vocales premium et un espace de travail en plein écran.",
    iosSafariGuide: "Safari iOS utilise un guide de configuration manuel.",
    shareLink: "Partager le lien",
    copied: "Copié !",
    copyLink: "Copier le lien",
    stopScan: "Arrêter le scan",
    quickScan: "Scan rapide",
    installNow: "Installer",
    howToInstall: "Comment installer",
    usingIosGuide: "Sur iOS ? Ouvrir le guide Safari",
    installedSuccess: "Installé avec succès !",
    installedSuccessDesc: "Grade Master Africa fonctionne maintenant nativement sur votre appareil. Profitez de l'environnement plein écran !",
    scanToOpen: "Scanner pour ouvrir sur mobile",
    quickScanViewer: "Visionneuse de scan rapide",
    aimCamera: "Pointez l'appareil photo vers le code QR d'installation PWA sur un autre écran.",
    simulateAutoDetect: "Simuler la détection",
    scanningFeed: "Analyse du flux...",
    cameraBlocked: "Caméra bloquée",
    couldNotAccessCamera: "Impossible d'accéder à la caméra. Veuillez vérifier les autorisations dans vos paramètres.",
    qrTheme: "Thème QR",
    autoRefresh: "Auto-actualisation (30s)",
    linkHistory: "Historique des liens",
    hapticStrength: "Intensité des vibrations",
    hapticsTitle: "Retour Haptique & Vibration Personnalisée",
    hapticsToggle: "Activer les Vibrations Haptiques",
    hapticsEnabledLabel: "Vibrations Activées",
    hapticsDisabledLabel: "Vibrations Désactivées",
    hapticsOffDesc: "Le retour haptique est désactivé. Activez-le pour personnaliser les réglages ou créer votre propre motif.",
    hapticModeLabel: "Mode de Vibration",
    presetMode: "Préréglages",
    customMode: "Créateur de Motifs",
    testVibe: "Tester le Motif",
    savePattern: "Sauvegarder",
    patternSaved: "Enregistré !",
    resetPattern: "Réinitialiser",
    tapToRecord: "Appuyez pour Enregistrer le Rythme",
    recordingActive: "Enregistrement de la Pulsation...",
    recordingFinished: "Rythme Enregistré Appliqué !",
    timelineTitle: "Chronologie Visuelle des Vibrations",
    addPulse: "+ Pulsation",
    addPause: "+ Pause",
    presetTemplates: "Motifs Rapides",
    totalDuration: "Total",
    stepPulse: "Pulsation",
    stepPause: "Pause",
    low: "faible",
    medium: "moyen",
    high: "élevé",
    iosSetupTitle: "Configuration iOS Safari",
    iosSetupHeading: "Ajouter à l'écran d'accueil",
    iosSetupDesc: "Apple iOS nécessite un ajout manuel de 10 secondes car Safari ne permet pas d'installation automatique en un clic.",
    step1Title: "1. Ouvrir dans Safari",
    step1Desc: "Assurez-vous de naviguer dans Safari. Les autres navigateurs (Chrome/Firefox) ne peuvent pas ajouter à l'écran d'accueil.",
    step2Title: "2. Appuyez sur Partager",
    step2Desc: "Recherchez l'icône Partager en bas de votre écran (un carré avec une flèche pointant vers le haut).",
    step3Title: "3. Ajouter à l'écran d'accueil",
    step3Desc: "Faites défiler et sélectionnez 'Sur l'écran d'accueil'. Si absent, appuyez sur 'Modifier les actions' en bas.",
    step4Title: "4. Valider et Ajouter",
    step4Desc: "Appuyez sur 'Ajouter' dans le coin supérieur droit. Grade Master est maintenant prêt sur votre écran d'accueil !",
    gotIt: "Compris, merci !",
    saveQrAsImage: "Enregistrer le QR Code",
    quickHelpTitle: "Conseils Scan Rapide",
    quickHelpTip1: "Positionnez le code QR dans le repère de cadrage vert.",
    quickHelpTip2: "Vérifiez l'éclairage ! Évitez les ombres portées, les reflets et l'obscurité.",
    quickHelpTipLight: "Idéal sous un éclairage lumineux",
    quickHelpGotIt: "Compris",
    saveToKeep: "Sauver dans Keep",
    savingToKeep: "Sauvegarde...",
    savedToKeep: "Sauvé !",
    shareWhatsApp: "Partager via WhatsApp",
    whatsappMessage: "Découvrez Grade Master Africa ! C'est un outil puissant pour suivre vos notes et vos progrès académiques. Installez-le ici : ",
    autoStartScanner: "Démarrage Auto Scanner",
    torch: "Lampe",
    torchOn: "Lampe Allumée",
    torchOff: "Lampe Éteinte",
    toggleQrLogo: "Activer/Désactiver le Logo",
    speedTestTitle: "Test de débit réseau en temps réel",
    runSpeedTestBtn: "Tester la vitesse de connexion",
    testingSpeedProgress: "Test du réseau (charge de 1 Mo)...",
    speedTestedAtValue: "Vitesse réelle : ",
    networkQualityLabel: "Qualité du réseau : ",
    qualityExcellent: "Excellente (Très rapide)",
    qualityGood: "Bonne (Stable)",
    qualityFair: "Moyenne (Acceptable)",
    qualityPoor: "Faible (Connexion lente)",
    speedTestErrorMsg: "Le test a échoué. Réessayez.",
    speedTestCompleted: "Test de débit terminé !",
    offlineReady: "Prêt Hors Ligne",
    offlineCaching: "Mise en cache...",
    offlineNotReady: "En Ligne Seulement",
    swStateLabel: "Service Worker : ",
    swActive: "Actif",
    swRegistering: "Enregistrement...",
    swNotRegistered: "Non Enregistré",
    swUnsupported: "Non Supporté"
  },
  sw: {
    title: "Sakinisha Grade Master",
    descAndroid: "Ongeza Grade Master Africa kwenye kifaa chako kwa upakiaji wa haraka bila mtandao, arifa rahisi za umakini, na nafasi ya kazi ya skrini nzima.",
    descIos: "Ongeza Grade Master Africa moja kwa moja kwenye skrini ya kwanza ya iPhone au iPad yako kwa vipengele vya sauti vya premium na nafasi ya kazi ya skrini nzima.",
    iosSafariGuide: "Safari iOS inatumia usanidi wa mwongozo.",
    shareLink: "Shiriki Kiungo",
    copied: "Imenakiliwa!",
    copyLink: "Nakili Kiungo",
    stopScan: "Acha Kuskani",
    quickScan: "Skani Haraka",
    installNow: "Sakinisha Sasa",
    howToInstall: "Jinsi ya Kusakinisha",
    usingIosGuide: "Unatumia iOS? Fungua Mwongozo wa Safari",
    installedSuccess: "Imesakinishwa kikamilifu!",
    installedSuccessDesc: "Grade Master Africa sasa inaendeshwa asili kwenye kifaa chako. Furahia mazingira ya skrini nzima ya kompyuta/simu!",
    scanToOpen: "Skani ili Kufungua kwenye Simu",
    quickScanViewer: "Kuangalia Skani Haraka",
    aimCamera: "Elekeza kamera kwenye msimbo wa QR wa usakinishaji wa PWA kwenye skrini nyingine.",
    simulateAutoDetect: "Iga Ugunduzi Moja kwa Moja",
    scanningFeed: "Inasoma Kulisha...",
    cameraBlocked: "Kamera Imezuiwa",
    couldNotAccessCamera: "Imeshindwa kufikia kamera. Tafadhali angalia ruhusa za kamera kwenye mipangilio yako.",
    qrTheme: "Mandhari ya QR",
    autoRefresh: "Sasisha kiotomatiki (30s)",
    linkHistory: "Historia ya Viungo",
    hapticStrength: "Nguvu ya Mtetemo",
    hapticsTitle: "Mrejesho wa Mtetemo na Mitindo Yako",
    hapticsToggle: "Washa Mtetemo wa Haptic",
    hapticsEnabledLabel: "Mtetemo Umewashwa",
    hapticsDisabledLabel: "Mtetemo Umezimwa",
    hapticsOffDesc: "Mrejesho wa mtetemo umezimwa. Washa ili kurekebisha au kuunda mtindo wako mwenewe.",
    hapticModeLabel: "Njia ya Mtetemo",
    presetMode: "Viwango",
    customMode: "Muundaji wa Mtindo",
    testVibe: "Jaribu Mtindo",
    savePattern: "Hifadhi Mtindo",
    patternSaved: "Imehifadhiwa!",
    resetPattern: "Weka Upya",
    tapToRecord: "Gusa na Ushikilie Kurekodi Mdundo",
    recordingActive: "Inarekodi Mtetemo...",
    recordingFinished: "Mdundo Uliorekodiwa Umetumika!",
    timelineTitle: "Ratiba ya Picha ya Mtetemo",
    addPulse: "+ Mtetemo",
    addPause: "+ Pumziko",
    presetTemplates: "Mitindo ya Haraka",
    totalDuration: "Jumla",
    stepPulse: "Mtetemo",
    stepPause: "Pumziko",
    low: "duni",
    medium: "wastani",
    high: "juu",
    iosSetupTitle: "Usanidi wa Safari ya iOS",
    iosSetupHeading: "Ongeza kwenye Skrini ya Kwanza",
    iosSetupDesc: "Apple iOS inahitaji nyongeza fupi ya sekunde 10 kwa sababu Safari hairuhusu usakinishaji wa kiotomatiki wa kubofya mara moja.",
    step1Title: "1. Fungua katika Safari",
    step1Desc: "Hakikisha unavinjari kwenye Safari. Vivinjari vingine vya iOS (Chrome au Firefox) haviwezi kusajira programu ya skrini ya kwanza.",
    step2Title: "2. Gonga ikoni ya Shiriki",
    step2Desc: "Tafuta ikoni ya Shiriki kwenye upau wa zana chini ya skrini ya Safari (mraba wenye mshale unaoelekeza juu).",
    step3Title: "3. 'Ongeza kwenye Skrini ya Kwanza'",
    step3Desc: "Sogeza chini na uchague 'Ongeza kwenye Skrini ya Kwanza'. Kama huioni, gonga 'Hariri Vitendo' chini.",
    step4Title: "4. Thibitisha Jina na Uongeze",
    step4Desc: "Gonga kitufe cha 'Ongeza' kwenye kona ya juu kulia. Programu ya Grade Master sasa ipo tayari kwenye skrini yako!",
    gotIt: "Nimeelewa, Asante!",
    saveQrAsImage: "Hifadhi QR kama Picha",
    quickHelpTitle: "Vidokezo vya Skani Haraka",
    quickHelpTip1: "Weka msimbo wa QR ndani ya miongozo ya kijani ya kupimia.",
    quickHelpTip2: "Angalia mwanga! Epuka vivuli virefu, mng'ao, au mazingira meusi sana.",
    quickHelpTipLight: "Skani vyema chini ya mwanga mkali",
    quickHelpGotIt: "Nimeelewa",
    saveToKeep: "Hifadhi kwenye Keep",
    savingToKeep: "Inahifadhi...",
    savedToKeep: "Imehifadhiwa!",
    shareWhatsApp: "Shiriki kupitia WhatsApp",
    whatsappMessage: "Angalia Grade Master Africa! Ni zana nzuri ya kufuatilia alama zako na maendeleo ya kitaaluma. Isakinishe hapa: ",
    autoStartScanner: "Anza Kichanganuzi Kiotomatiki",
    torch: "Tochi",
    torchOn: "Tochi Imewashwa",
    torchOff: "Tochi Imezimwa",
    toggleQrLogo: "Badilisha Nembo ya QR",
    speedTestTitle: "Kipimo cha Kasi ya Mtandao",
    runSpeedTestBtn: "Pima Kasi ya Mtandao",
    testingSpeedProgress: "Inapima mtandao (mzigo wa 1MB)...",
    speedTestedAtValue: "Kasi Halisi: ",
    networkQualityLabel: "Ubora wa Mtandao: ",
    qualityExcellent: "Safi Sana (Haraka sana)",
    qualityGood: "Nzuri (Imara)",
    qualityFair: "Wastani (Inaridhisha)",
    qualityPoor: "Duni (Mtandao wa polepole)",
    speedTestErrorMsg: "Jaribio limeshindwa. Jaribu tena.",
    speedTestCompleted: "Kipimo kimekamilika!",
    offlineReady: "Tayari Bila Mtandao",
    offlineCaching: "Inahifadhi sasa...",
    offlineNotReady: "Mtandaoni Tu",
    swStateLabel: "Service Worker: ",
    swActive: "Imewezeshwa",
    swRegistering: "Inasajili...",
    swNotRegistered: "Haijasajiliwa",
    swUnsupported: "Haitumiki"
  }
};

import Lottie from "lottie-react";
import loadingLottie from "../../assets/lottie/loading.json";
import successLottie from "../../assets/lottie/success.json";
const logoImage = "/icon-512.png";
const pocketSchoolLogo = "/icon-512.png";

// ... (other imports) ...

export default function InstallApp() {
  // ... (inside the component)
  // Replace this:
  // const logoSvgDataUrl = "data:image/svg+xml;utf8," + encodeURIComponent(`...`);
  // with
  // <img src={logoImage} alt="Grade Master Icon" className="w-16 h-16 rounded-xl" />

  const [lang, setLang] = useState<"en" | "fr" | "sw">("en");
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      const saved = localStorage.getItem("pwa-lang");
      if (saved === "en" || saved === "fr" || saved === "sw") {
        setLang(saved as "en" | "fr" | "sw");
      } else {
        const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || "";
        if (browserLang.toLowerCase().startsWith("fr")) {
          setLang("fr");
        } else if (browserLang.toLowerCase().startsWith("sw") || browserLang.toLowerCase().startsWith("ki")) {
          setLang("sw");
        } else {
          setLang("en");
        }
      }
    }
  }, []);

  const changeLang = (newLang: "en" | "fr" | "sw") => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa-lang", newLang);
    }
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate([30, 30]);
    }
  };

  const t = translations[lang];

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10002 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleSaveToKeep = async () => {
    try {
      setIsSavingToKeep(true);
      const url = window.location.href;
      const title = "Install Grade Master Africa";
      const text = `Application URL: ${url}\n\nInstallation Instructions:\n1. Open the URL in Safari (iOS) or Chrome (Android).\n2. Tap the Share button (iOS) or Menu button (Android).\n3. Select 'Add to Home Screen'.\n4. Confirm and launch the app from your home screen.`;
      
      try {
        await createKeepNote({ title, text });
      } catch (keepErr) {
        console.warn('Google Keep API is restricted for standard consumer accounts, falling back to secure Firestore backup notes:', keepErr);
        const user = auth.currentUser;
        if (user) {
          const notesRef = collection(db, "users", user.uid, "keep_notes");
          await addDoc(notesRef, {
            title,
            text,
            createdAt: serverTimestamp()
          });
        } else {
          throw keepErr;
        }
      }
      
      setKeepSaveSuccess(true);
      triggerConfetti();
      
      setTimeout(() => {
        setKeepSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving to Keep:', error);
      alert('Failed to save. Please make sure you are signed in.');
    } finally {
      setIsSavingToKeep(false);
    }
  };

  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const message = `${t.whatsappMessage}${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showQr, setShowQr] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pwa-wizard-show-qr") === "true";
    }
    return false;
  });
  const [showQrLogo, setShowQrLogo] = useState<boolean>(true);
  const [qrScale, setQrScale] = useState<number>(1.0);
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pwa-wizard-show-guide") === "true";
    }
    return false;
  });
  const [isSavingToKeep, setIsSavingToKeep] = useState(false);
  const [keepSaveSuccess, setKeepSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sessionScanCount, setSessionScanCount] = useState(0);
  const [enableScanSound, setEnableScanSound] = useState(true);

  // Load persistent settings on mount to ensure hydration sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSound = localStorage.getItem("pwa-scan-sound");
      if (savedSound !== null) setEnableScanSound(savedSound === "true");
    }
  }, []);

  // Persist sound preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa-scan-sound", enableScanSound.toString());
    }
  }, [enableScanSound]);
  const [qrRefreshCountdown, setQrRefreshCountdown] = useState<number>(30);
  const [showUnitConverter, setShowUnitConverter] = useState(false);
  const [installEstimate, setInstallEstimate] = useState<string>("~3s");
  const [diskSpaceEstimate, setDiskSpaceEstimate] = useState<string>("~7.4 MB");

  // Speed test states
  const [isTestingSpeed, setIsTestingSpeed] = useState<boolean>(false);
  const [speedTestProgress, setSpeedTestProgress] = useState<number>(0);
  const [speedTestMbps, setSpeedTestMbps] = useState<number | null>(null);
  const [speedTestError, setSpeedTestError] = useState<string | null>(null);
  const [speedTestSuccess, setSpeedTestSuccess] = useState<boolean>(false);

  // Service worker and caching states
  const [swState, setSwState] = useState<"unsupported" | "checking" | "not_registered" | "registering" | "active">("checking");
  const [isOfflineReady, setIsOfflineReady] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleRunSpeedTest = async () => {
    setIsTestingSpeed(true);
    setSpeedTestProgress(0);
    setSpeedTestError(null);
    setSpeedTestSuccess(false);

    try {
      const start = performance.now();
      const sizeBytes = 1024 * 1024; // 1MB payload
      const response = await fetch(`/api/speedtest?size=${sizeBytes}&t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error("Failed to reach speed test server");
      }

      if (!response.body) {
        const blob = await response.blob();
        const end = performance.now();
        const durationSeconds = Math.max(0.1, (end - start) / 1000);
        const speedMbps = (blob.size * 8) / (1024 * 1024 * durationSeconds);
        setSpeedTestMbps(parseFloat(speedMbps.toFixed(2)));
        setSpeedTestProgress(100);
      } else {
        const reader = response.body.getReader();
        let loaded = 0;
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            loaded += value.length;
            setSpeedTestProgress(Math.round((loaded / sizeBytes) * 100));
          }
        }
        
        const end = performance.now();
        const durationSeconds = Math.max(0.1, (end - start) / 1000);
        const speedMbps = (loaded * 8) / (1024 * 1024 * durationSeconds);
        setSpeedTestMbps(parseFloat(speedMbps.toFixed(2)));
      }
      
      setSpeedTestSuccess(true);
      triggerConfetti();
    } catch (err: any) {
      console.error("Speed test error:", err);
      setSpeedTestError(err?.message || "Connection timeout");
    } finally {
      setIsTestingSpeed(false);
    }
  };
  const { batteryLevel, isCharging, shouldConserveBattery } = useBatterySaver();

  // Estimate disk space needed using navigator.storage if available
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        if (estimate.quota) {
          const availableGB = ((estimate.quota - (estimate.usage || 0)) / (1024 * 1024 * 1024)).toFixed(1);
          setDiskSpaceEstimate(`~7.4 MB (Free: ${availableGB} GB)`);
        }
      }).catch(err => {
        console.warn("Storage estimate query warning:", err);
      });
    }
  }, []);

  // Monitor Service Worker and Offline caching status
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("serviceWorker" in navigator)) {
      setSwState("unsupported");
      return;
    }

    const checkServiceWorker = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          const hasActive = registrations.some(reg => reg.active && (reg.active.state === "activated" || reg.active.state === "activating"));
          if (hasActive) {
            setSwState("active");
          } else {
            const reg = registrations[0];
            if (reg.installing) {
              setSwState("registering");
            } else if (reg.waiting) {
              setSwState("registering");
            } else {
              setSwState("not_registered");
            }
          }
        } else {
          setSwState("not_registered");
        }

        // Check if there are items cached in window.caches
        if ("caches" in window) {
          const keys = await caches.keys();
          // Having any cache keys (like workbox-precache or similar) indicates offline ready bundles
          setIsOfflineReady(keys.length > 0);
        }
      } catch (err) {
        console.warn("Error monitoring service worker:", err);
        setSwState("not_registered");
      }
    };

    checkServiceWorker();

    // Set up active listeners
    const handleStateChange = () => {
      checkServiceWorker();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleStateChange);
    
    // Periodically poll for service worker activation and cache registration
    const interval = setInterval(checkServiceWorker, 4000);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleStateChange);
      clearInterval(interval);
    };
  }, []);

  // Calculate estimated install time based on connection speed
  useEffect(() => {
    const updateEstimate = () => {
      if (speedTestMbps !== null) {
        // Assume app bundle + core assets is ~2.5MB (approx 20 Megabits)
        const appSizeBits = 20; 
        const seconds = Math.max(1, Math.ceil(appSizeBits / speedTestMbps));
        setInstallEstimate(`~${seconds}s`);
        return;
      }

      if (typeof navigator === "undefined") return;
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (conn && conn.downlink) {
        // Assume app bundle + core assets is ~2.5MB (approx 20 Megabits)
        const appSizeBits = 20; 
        const seconds = Math.max(1, Math.ceil(appSizeBits / conn.downlink));
        setInstallEstimate(`~${seconds}s`);
      } else {
        // Fallback for browsers that don't support the Network Information API
        setInstallEstimate("~2s");
      }
    };

    updateEstimate();
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn && typeof conn.addEventListener === "function") {
      conn.addEventListener('change', updateEstimate);
      return () => conn.removeEventListener('change', updateEstimate);
    }
  }, [speedTestMbps]);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanShare(true);
    }
  }, []);

  const handleShareOrCopy = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Grade Master Africa",
          text: "Install Grade Master Africa directly to your device for rapid offline loading and a full-screen experience!",
          url: currentUrl,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.warn("Share failed, falling back to clipboard copy", err);
        } else {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if already running in standalone mode (PWA installed)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const isStandaloneMode = checkStandalone();

    // Check if user is on iOS Safari specifically
    const isUserIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isUserIOS && !isStandaloneMode) {
      const dismissedTime = localStorage.getItem("pwa-prompt-dismissed");
      let showIOSPrompt = true;
      if (dismissedTime) {
        const dismissedDate = parseInt(dismissedTime, 10);
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - dismissedDate < oneWeek) {
          showIOSPrompt = false;
        }
      }
      if (showIOSPrompt) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }

    // 2. Listen for the native install prompt trigger (Android / Chrome Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser mini-infobar prompt from overlaying on mobile
      e.preventDefault();
      
      // Save the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user has previously dismissed the prompt (persists across sessions)
      const dismissedTime = localStorage.getItem("pwa-prompt-dismissed");
      if (dismissedTime) {
        const dismissedDate = parseInt(dismissedTime, 10);
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        // Let's show it again after 7 days to keep it humble but discoverable
        if (Date.now() - dismissedDate < oneWeek) {
          return;
        }
      }

      // Check if user has snoozed the prompt
      const snoozedUntil = localStorage.getItem("pwa-prompt-snoozed");
      if (snoozedUntil) {
        if (Date.now() < parseInt(snoozedUntil, 10)) {
          return;
        }
      }

      // Smooth delay after landing on the app before presenting PWA install
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    };

    // 3. Listen for completion of installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      setShowSuccessToast(true);
      triggerConfetti();
      console.log("Grade Master Africa app installed successfully.");

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // Provide visual/tactile haptic vibration confirmation if supported by the browser/device
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      let pattern = [40, 40, 40];
      if (vibeIntensity === "low") {
        pattern = [15];
      } else if (vibeIntensity === "high") {
        pattern = [80, 40, 80];
      }
      navigator.vibrate(pattern);
    }

    if (isIOS) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      setIsInstalling(true);
      
      // Artificial short delay so the user gets clear feedback from the Lottie loading state
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show the native browser installation modal/dialog
      await deferredPrompt.prompt();

      // Catch user's choice outcome
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install choice resolved: ${outcome}`);

      if (outcome === "accepted") {
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
        }, 5000);
      }
    } catch (err) {
      console.error("Installation process error:", err);
    } finally {
      setIsInstalling(false);
      // Reset prompt event
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Record current dismissal timestamp to respect user's peace for a week
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  const handleSnooze = () => {
    setIsVisible(false);
    // Snooze for 24 hours
    localStorage.setItem("pwa-prompt-snoozed", (Date.now() + 24 * 60 * 60 * 1000).toString());
    setDeferredPrompt(null);
  };

  const isMobileDevice = typeof navigator !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const [qrTimestamp, setQrTimestamp] = useState<number>(Date.now());
  const [manualRefreshKey, setManualRefreshKey] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pwa-qr-auto-refresh");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [qrTheme, setQrTheme] = useState<"classic" | "brand" | "gold">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pwa-qr-theme");
      if (saved === "classic" || saved === "brand" || saved === "gold") return saved;
    }
    return "classic";
  });
  const [autoStartScanner, setAutoStartScanner] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pwa-auto-start-scanner") === "true";
    }
    return false;
  });

  // Persist QR and Guide preferences for progress tracking
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa-qr-auto-refresh", autoRefresh.toString());
      localStorage.setItem("pwa-qr-theme", qrTheme);
      localStorage.setItem("pwa-auto-start-scanner", autoStartScanner.toString());
      localStorage.setItem("pwa-wizard-show-qr", showQr.toString());
      localStorage.setItem("pwa-wizard-show-guide", showIosGuide.toString());
    }
  }, [autoRefresh, qrTheme, autoStartScanner, showQr, showIosGuide]);
  const [showVibeSettings, setShowVibeSettings] = useState(false);
  
  // Master Enable/Disable for Haptics
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pwa-haptics-enabled");
      if (saved !== null) return saved === "true";
    }
    return true;
  });

  // Mode: preset strengths vs custom pattern builder
  const [hapticMode, setHapticMode] = useState<"preset" | "custom">((): "preset" | "custom" => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pwa-haptic-mode");
      if (saved === "custom" || saved === "preset") return saved;
    }
    return "preset";
  });

  // Preset strength
  const [vibeIntensity, setVibeIntensity] = useState<"low" | "medium" | "high">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pwa-vibe-intensity");
      if (saved === "low" || saved === "medium" || saved === "high") {
        return saved;
      }
    }
    return "medium";
  });

  // Custom vibration pattern: array of [pulse_ms, pause_ms, pulse_ms, pause_ms...]
  const [customVibePattern, setCustomVibePattern] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pwa-custom-vibe-pattern");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // ignore
        }
      }
    }
    return [50, 40, 100, 40, 50];
  });

  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(0);
  const [isPlayingPattern, setIsPlayingPattern] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Live Tap Recorder refs and states
  const [isRecordingRhythm, setIsRecordingRhythm] = useState(false);
  const [tapRecordBuffer, setTapRecordBuffer] = useState<number[]>([]);
  const tapLastTimeRef = useRef<number | null>(null);
  const pressStartTimeRef = useRef<number | null>(null);

  // Trigger haptic vibration respecting master toggle and current mode
  const triggerHaptic = (overridePattern?: number[]) => {
    if (!hapticsEnabled) return;
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;

    if (overridePattern && overridePattern.length > 0) {
      navigator.vibrate(overridePattern);
      return;
    }

    if (hapticMode === "custom" && customVibePattern && customVibePattern.length > 0) {
      navigator.vibrate(customVibePattern);
    } else {
      let pattern = [40, 40, 40];
      if (vibeIntensity === "low") {
        pattern = [15];
      } else if (vibeIntensity === "high") {
        pattern = [80, 40, 80];
      }
      navigator.vibrate(pattern);
    }
  };

  const toggleHapticsEnabled = (enabled: boolean) => {
    setHapticsEnabled(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa-haptics-enabled", enabled.toString());
    }
    if (enabled && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate([30, 30]);
    }
  };

  const changeHapticMode = (mode: "preset" | "custom") => {
    setHapticMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa-haptic-mode", mode);
    }
    if (hapticsEnabled && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      const pattern = mode === "custom" ? customVibePattern : (vibeIntensity === "low" ? [15] : vibeIntensity === "high" ? [80, 40, 80] : [40, 40, 40]);
      navigator.vibrate(pattern);
    }
  };

  const changeVibeIntensity = (intensity: "low" | "medium" | "high") => {
    setVibeIntensity(intensity);
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa-vibe-intensity", intensity);
    }
    if (hapticsEnabled && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      let pattern = [40, 40, 40];
      if (intensity === "low") {
        pattern = [15];
      } else if (intensity === "high") {
        pattern = [80, 40, 80];
      }
      navigator.vibrate(pattern);
    }
  };

  const saveCustomPattern = (pattern: number[]) => {
    setCustomVibePattern(pattern);
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa-custom-vibe-pattern", JSON.stringify(pattern));
    }
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
    triggerHaptic(pattern);
  };

  const handleTestPlayback = () => {
    const patternToTest = hapticMode === "custom" ? customVibePattern : (vibeIntensity === "low" ? [15] : vibeIntensity === "high" ? [80, 40, 80] : [40, 40, 40]);
    const totalMs = patternToTest.reduce((a, b) => a + b, 0);
    
    setIsPlayingPattern(true);
    setPlaybackProgress(0);
    triggerHaptic(patternToTest);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / (totalMs || 100));
      setPlaybackProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
        setIsPlayingPattern(false);
        setPlaybackProgress(0);
      }
    }, 16);
  };

  const updateStepValue = (index: number, val: number) => {
    const clamped = Math.max(10, Math.min(600, val));
    const next = [...customVibePattern];
    next[index] = clamped;
    setCustomVibePattern(next);
  };

  const deleteStep = (index: number) => {
    if (customVibePattern.length <= 1) return;
    const next = customVibePattern.filter((_, idx) => idx !== index);
    setCustomVibePattern(next);
    setSelectedStepIndex(Math.max(0, index - 1));
  };

  const addPulseStep = () => {
    const next = [...customVibePattern];
    if (next.length % 2 === 1) {
      next.push(40);
    }
    next.push(60);
    setCustomVibePattern(next);
    setSelectedStepIndex(next.length - 1);
  };

  const addPauseStep = () => {
    const next = [...customVibePattern];
    if (next.length % 2 === 0) {
      next.push(60);
    }
    next.push(40);
    setCustomVibePattern(next);
    setSelectedStepIndex(next.length - 1);
  };

  const resetCustomPattern = () => {
    const def = [50, 40, 100, 40, 50];
    saveCustomPattern(def);
    setSelectedStepIndex(0);
  };

  const handleTapDown = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const now = Date.now();
    pressStartTimeRef.current = now;

    if (hapticsEnabled && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(1000);
    }

    if (!isRecordingRhythm) {
      setIsRecordingRhythm(true);
      setTapRecordBuffer([]);
      tapLastTimeRef.current = now;
      return;
    }

    if (tapLastTimeRef.current) {
      const gap = Math.min(600, Math.max(10, now - tapLastTimeRef.current));
      setTapRecordBuffer(prev => [...prev, gap]);
    }
  };

  const handleTapUp = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(0);
    }

    if (!pressStartTimeRef.current) return;
    const now = Date.now();
    const pulseDuration = Math.min(600, Math.max(15, now - pressStartTimeRef.current));
    setTapRecordBuffer(prev => [...prev, pulseDuration]);
    tapLastTimeRef.current = now;
    pressStartTimeRef.current = null;
  };

  const finishRecordingRhythm = () => {
    if (tapRecordBuffer.length > 0) {
      saveCustomPattern(tapRecordBuffer);
    }
    setIsRecordingRhythm(false);
    setTapRecordBuffer([]);
    tapLastTimeRef.current = null;
    pressStartTimeRef.current = null;
  };

  const CUSTOM_PATTERN_PRESETS = [
    { name: "Double Pulse", pattern: [50, 40, 50] },
    { name: "Heartbeat", pattern: [80, 60, 160, 100, 80] },
    { name: "Staccato", pattern: [20, 30, 20, 30, 20] },
    { name: "SOS Morse", pattern: [60, 40, 60, 40, 60, 120, 120, 40, 120, 40, 120, 120, 60, 40, 60, 40, 60] },
    { name: "Heavy Buzz", pattern: [120, 50, 180] },
    { name: "Crescendo", pattern: [20, 30, 40, 30, 70, 30, 120, 30, 180] },
  ];

  const qrFgColor = qrTheme === "classic" ? "#0F172A" : qrTheme === "brand" ? "#3B82F6" : "#D97706";

  const goldLogoSvgDataUrl = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="8" fill="#D97706"/>
  <path d="M16 6 L18.5 13.5 L26 16 L18.5 18.5 L16 26 L13.5 18.5 L6 16 L13.5 13.5 Z" fill="#FFFFFF"/>
</svg>
`);

  useEffect(() => {
    if (!showQr || !isVisible || !autoRefresh) {
      setQrRefreshCountdown(0);
      return;
    }

    const intervalId = setInterval(() => {
      const secondsSinceLastRefresh = Math.floor((Date.now() - qrTimestamp) / 1000);
      const remaining = Math.max(0, 30 - secondsSinceLastRefresh);
      
      if (remaining === 0) {
        setQrTimestamp(Date.now());
        setQrRefreshCountdown(30);
      } else {
        setQrRefreshCountdown(remaining);
      }
    }, 1000);

    // Initialize
    const secondsSinceLastRefresh = Math.floor((Date.now() - qrTimestamp) / 1000);
    setQrRefreshCountdown(Math.max(0, 30 - secondsSinceLastRefresh));

    return () => clearInterval(intervalId);
  }, [showQr, isVisible, autoRefresh, qrTimestamp]);

  const getDynamicUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.href : "https://grademaster.africa";
    if (!autoRefresh && !manualRefreshKey) {
      return baseUrl;
    }
    const timestampToUse = manualRefreshKey || qrTimestamp;
    try {
      const url = new URL(baseUrl);
      url.searchParams.set("t", timestampToUse.toString());
      return url.toString();
    } catch (e) {
      return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}t=${timestampToUse}`;
    }
  };

  const currentUrl = getDynamicUrl();

  const [urlHistory, setUrlHistory] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pwa-url-history");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [scanHistory, setScanHistory] = useState<{url: string, timestamp: number}[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pwa-scan-history");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Persist histories
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa-url-history", JSON.stringify(urlHistory));
      localStorage.setItem("pwa-scan-history", JSON.stringify(scanHistory));
    }
  }, [urlHistory, scanHistory]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyCopiedIdx, setHistoryCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUrl) return;
    setUrlHistory(prev => {
      if (prev[0] === currentUrl) return prev;
      const filtered = prev.filter(url => url !== currentUrl);
      return [currentUrl, ...filtered].slice(0, 5);
    });
  }, [currentUrl]);

  const handleCopyHistoryUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url).then(() => {
      setHistoryCopiedIdx(index);
      setTimeout(() => {
        setHistoryCopiedIdx(null);
      }, 1500);
    });
  };

  const [isScanning, setIsScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pwa-torch-preferred") === "true";
    }
    return false;
  });
  const [hasTorch, setHasTorch] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [hasZoom, setHasZoom] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isApiSupported, setIsApiSupported] = useState(false);
  const [simulatingScan, setSimulatingScan] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsApiSupported(typeof window !== "undefined" && "BarcodeDetector" in window);
  }, []);

  useEffect(() => {
    if (!isScanning && autoStartScanner && isVisible && !isStandalone) {
      startCamera();
    }
  }, [isVisible, isScanning, autoStartScanner, isStandalone]);

  const startCamera = async () => {
    if (shouldConserveBattery) {
      setScanError("Camera preview disabled to conserve battery.");
      return;
    }
    setScanError(null);
    setScanResult(null);
    setIsScanning(true);
    setSimulatingScan(false);
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } }
        });
        setCameraStream(stream);

        // Check for capabilities
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = (track as any).getCapabilities?.();
          
          // Torch
          if (capabilities && capabilities.torch) {
            setHasTorch(true);
            const preferredTorch = localStorage.getItem("pwa-torch-preferred") === "true";
            if (preferredTorch) {
              try {
                await (track as any).applyConstraints({
                  advanced: [{ torch: true }]
                });
                setIsTorchOn(true);
              } catch (e) {
                console.warn("Failed to apply preferred torch state:", e);
              }
            }
          }

          // Zoom
          if (capabilities && capabilities.zoom) {
            setHasZoom(true);
            setMinZoom(capabilities.zoom.min || 1);
            setMaxZoom(capabilities.zoom.max || 1);
            setZoom(capabilities.zoom.min || 1);
          }
        }

        // Use a short timeout to ensure the video ref element is rendered and bound
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 100);
      } else {
        setScanError("Camera API is not supported on this device/browser.");
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setScanError(err?.message || "Could not access camera. Please check camera permissions in your browser settings.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScanning(false);
    setIsTorchOn(false);
    setHasTorch(false);
    setZoom(1);
    setMinZoom(1);
    setMaxZoom(1);
    setHasZoom(false);
    setScanError(null);
    setScanResult(null);
    setSimulatingScan(false);
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const downloadQrCode = () => {
    const wrapper = document.getElementById("pwa-install-qr-svg-wrapper");
    if (!wrapper) return;
    const svgEl = wrapper.querySelector("svg");
    if (!svgEl) return;

    try {
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgEl);
      
      if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const canvasSize = 512;
      const canvas = document.createElement("canvas");
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) return;

      const img = new Image();
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
      
      img.onload = () => {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
        
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `grade_master_pwa_qr_${Date.now()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
    } catch (error) {
      console.error("Error downloading QR Code:", error);
    }
  };

  const playPingSound = () => {
    if (!enableScanSound) return;
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      // High-pitched sine wave for a clean "ping"
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio feedback failed:", e);
    }
  };

  useEffect(() => {
    localStorage.setItem("pwa-scan-history", JSON.stringify(scanHistory));
  }, [scanHistory]);

  const handleExportStats = () => {
    if (scanHistory.length === 0) {
      alert(lang === "en" ? "No scan history to export." : "Aucun historique de scan à exporter.");
      return;
    }
    
    const counts: Record<string, number> = {};
    scanHistory.forEach(scan => {
      counts[scan.url] = (counts[scan.url] || 0) + 1;
    });
    
    const csvRows = ["URL,Frequency,Last Scanned"];
    Object.entries(counts).forEach(([url, count]) => {
      const lastScan = scanHistory.find(s => s.url === url)?.timestamp;
      const dateStr = lastScan ? new Date(lastScan).toISOString() : "N/A";
      csvRows.push(`"${url.replace(/"/g, '""')}",${count},${dateStr}`);
    });
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `qr_scan_stats_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSuccessfulScan = (value: string) => {
    setScanResult(value);
    setScanHistory(prev => [{ url: value, timestamp: Date.now() }, ...prev]);
    setSessionScanCount(prev => prev + 1);
    triggerConfetti();
    playPingSound();
    
    // Play subtle haptic confirmation pulse
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      let pattern = [80, 50, 80];
      if (vibeIntensity === "low") {
        pattern = [25];
      } else if (vibeIntensity === "high") {
        pattern = [150, 75, 150];
      }
      navigator.vibrate(pattern);
    }
  };

  const triggerSimulatedScan = () => {
    if (simulatingScan || scanResult) return;
    setSimulatingScan(true);
    setScanError(null);
    
    setTimeout(() => {
      setSimulatingScan(false);
      handleSuccessfulScan(currentUrl);
    }, 1500);
  };

  const handleZoomChange = async (newZoom: number) => {
    if (!cameraStream || !hasZoom) return;
    const track = cameraStream.getVideoTracks()[0];
    if (track) {
      try {
        await (track as any).applyConstraints({
          advanced: [{ zoom: newZoom }]
        });
        setZoom(newZoom);
      } catch (err) {
        console.warn("Failed to apply zoom:", err);
      }
    }
  };

  const toggleTorch = async () => {
    if (!cameraStream || !hasTorch) return;
    const track = cameraStream.getVideoTracks()[0];
    if (track) {
      try {
        const newState = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: newState }]
        });
        setIsTorchOn(newState);
        if (typeof window !== "undefined") {
          localStorage.setItem("pwa-torch-preferred", newState.toString());
        }
      } catch (err) {
        console.warn("Failed to toggle torch:", err);
      }
    }
  };

  useEffect(() => {
    if (shouldConserveBattery && isScanning) {
      stopCamera();
      setScanError("Camera preview disabled to conserve battery.");
    }
  }, [shouldConserveBattery, isScanning]);

  useEffect(() => {
    if (!isScanning || !cameraStream || scanResult) return;
    
    let active = true;
    let intervalId: any;

    const runDetector = async () => {
      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        try {
          const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
          const scanInterval = shouldConserveBattery ? 1500 : 450;
          intervalId = setInterval(async () => {
            if (videoRef.current && active && !scanResult) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const rawValue = barcodes[0].rawValue;
                  handleSuccessfulScan(rawValue);
                }
              } catch (e) {
                // Ignore detection interval errors
              }
            }
          }, scanInterval);
        } catch (err) {
          console.warn("Could not start BarcodeDetector:", err);
        }
      }
    };

    runDetector();

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [isScanning, cameraStream, scanResult, currentUrl, vibeIntensity, shouldConserveBattery]);

  return (
    <>
      <style>
        {`
          @media print {
            body > *:not(#pwa-install-app-container):not(.ios-guide-container) {
              display: none !important;
            }
            #pwa-install-app-container, .ios-guide-container {
              position: static !important;
              width: 100% !important;
              max-width: none !important;
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              color: black !important;
              display: block !important;
              visibility: visible !important;
            }
            #pwa-install-app-container button,
            .ios-guide-container button,
            .no-print {
              display: none !important;
            }
            #pwa-install-app-container .bg-gray-50,
            .ios-guide-container .bg-brand-primary\/5 {
              background: white !important;
              border: 1px solid #eee !important;
            }
            #pwa-install-app-container h4, 
            #pwa-install-app-container p,
            .ios-guide-container h3,
            .ios-guide-container p,
            .ios-guide-container h4 {
              color: black !important;
            }
            .qr-print-container {
              display: block !important;
              height: auto !important;
              opacity: 1 !important;
            }
          }
        `}
      </style>
      {/* 1. Main Install Prompt Modal / Card */}
      <AnimatePresence>
        {!isStandalone && isVisible && (deferredPrompt || isIOS) && (
          <div id="pwa-install-app-container" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] max-w-md w-[calc(100%-2rem)] sm:w-[480px] mx-auto pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.92 }}
              whileHover={{ scale: 1.008 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="bg-slate-950/85 backdrop-blur-2xl border border-amber-500/30 rounded-[2.2rem] p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/10 text-white flex flex-col gap-3.5 relative overflow-hidden"
            >
              {/* 4K Cinematic Ambient Glow Highlights */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

              {/* Top Left Badges: Scan Counter & Battery */}
              <div className="absolute -top-1 -left-1 flex items-center gap-1.5 z-[10005]">
                <AnimatePresence>
                  {sessionScanCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      key="scan-badge"
                      className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 border border-emerald-500/40 uppercase tracking-tighter backdrop-blur-md"
                    >
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span>{sessionScanCount} Scans</span>
                    </motion.div>
                  )}
                  {batteryLevel !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      key="battery-badge"
                      className="bg-slate-900/90 text-amber-300 text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-amber-500/30 uppercase tracking-tighter backdrop-blur-md"
                    >
                      {isCharging ? <BatteryCharging className="w-3 h-3 text-emerald-400" /> : <Battery className="w-3 h-3 text-amber-400" />}
                      <span>{batteryLevel}%</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Language Selector Dropdown */}
              <div className="absolute top-4 right-12 z-[10001] flex items-center">
                <button
                  type="button"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="p-1.5 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-slate-800/80 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border border-slate-700/60"
                  title="Change Language / Changer de langue / Badilisha Lugha"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold text-slate-300">{lang}</span>
                </button>
                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-8 w-28 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-1 flex flex-col gap-0.5 backdrop-blur-xl"
                    >
                      {[
                        { code: "en", label: "English", flag: "🇬🇧" },
                        { code: "fr", label: "Français", flag: "🇫🇷" },
                        { code: "sw", label: "Kiswahili", flag: "🌍" }
                      ].map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            changeLang(item.code as "en" | "fr" | "sw");
                            setShowLangMenu(false);
                          }}
                          className={cn(
                            "w-full text-left px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-between",
                            lang === item.code
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          )}
                        >
                          <span>{item.label}</span>
                          <span className="text-xs">{item.flag}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
                aria-label="Dismiss app install option"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Body Info */}
              <div className="flex items-start gap-3.5 pr-6">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-amber-500/30 flex items-center justify-center bg-slate-900 ring-2 ring-white/10">
                  <img src={logoImage} alt="Grade Master Africa Icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-white tracking-tight">{t.title}</h4>
                        <span className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-md text-[8px] font-bold text-amber-300 uppercase tracking-widest no-print">
                          <Sparkles className="w-2.2 h-2.2" />
                          PWA
                        </span>
                        <span className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-md text-[8px] font-bold text-blue-300 uppercase tracking-widest no-print" title="Estimated time to complete install based on connection speed">
                          <Clock className="w-2.2 h-2.2" />
                          {installEstimate}
                        </span>
                      </div>
                      
                      {/* Progress Tracker Dots */}
                      <div className="flex items-center gap-1 no-print">
                        <div className={cn("w-1.5 h-1.5 rounded-full transition-all", !showQr && !showIosGuide ? "bg-amber-400 scale-125 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-slate-700")} title="Overview" />
                        <div className={cn("w-1.5 h-1.5 rounded-full transition-all", showQr ? "bg-amber-400 scale-125 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-slate-700")} title="QR Connect" />
                        <div className={cn("w-1.5 h-1.5 rounded-full transition-all", showIosGuide ? "bg-amber-400 scale-125 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-slate-700")} title="Setup Guide" />
                      </div>
                    </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isIOS ? t.descIos : t.descAndroid}
                  </p>
                  
                  {/* Critically Low Battery Alert */}
                  <AnimatePresence>
                    {batteryLevel !== null && batteryLevel < 15 && !isCharging && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, height: 0 }}
                        animate={{ opacity: 1, scale: 1, height: "auto" }}
                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                        className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 my-2 relative overflow-hidden group shadow-lg shadow-rose-500/10"
                      >
                        <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none" />
                        <div className="flex items-start gap-3 relative z-10">
                          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0 shadow-sm border border-rose-200">
                            <Zap className="w-5 h-5 animate-pulse" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-[13px] font-black text-rose-950 uppercase tracking-tight flex items-center gap-2">
                              {lang === "en" ? "Power Critical" : lang === "fr" ? "Énergie Critique" : "Nguvu Muhimu"}
                              <span className="flex h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                            </h4>
                            <p className="text-[11px] text-rose-800 font-bold leading-snug mt-0.5">
                              {lang === "en" 
                                ? "Battery is under 15%. Please plug in your device before proceeding with the PWA installation to ensure a stable setup."
                                : lang === "fr"
                                  ? "La batterie est inférieure à 15%. Veuillez brancher votre appareil avant de procéder à l'installation de la PWA."
                                  : "Betri iko chini ya 15%. Tafadhali unganisha kifaa chako kwenye chaji kabla ya kuendelea na usakinishaji wa PWA."}
                            </p>
                            
                            {/* Battery Progress Bar */}
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-[8px] font-black uppercase text-rose-900/50 tracking-widest">
                                <span>{lang === "en" ? "System Energy" : lang === "fr" ? "Énergie Système" : "Nguvu ya Mfumo"}</span>
                                <span>{batteryLevel}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-rose-200/50 rounded-full overflow-hidden border border-rose-200/50">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ 
                                    width: `${batteryLevel}%`,
                                    backgroundColor: batteryLevel < 7 ? "#b91c1c" : batteryLevel < 12 ? "#ef4444" : "#f59e0b"
                                  }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className="h-full rounded-full shadow-[0_0_8px_rgba(225,29,72,0.4)]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isIOS && (
                    <p className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1 pt-1">
                      <HelpCircle className="w-3 h-3" /> {t.iosSafariGuide}
                    </p>
                  )}

                  {/* System Requirements / Status Indicators */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/80 no-print">
                    {/* Disk Space Estimate Badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900/80 border border-slate-800 rounded-lg text-[9px] font-bold text-emerald-400" title="Estimated disk space required for offline usage">
                      <Save className="w-2.5 h-2.5 text-emerald-400" />
                      <span>Space: {diskSpaceEstimate}</span>
                    </span>

                    {/* Battery Level Badge */}
                    {batteryLevel !== null && (
                      <div className="flex flex-col gap-1 min-w-[120px] no-print">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold w-fit border",
                          isCharging 
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-300" 
                            : batteryLevel < 20 
                              ? "bg-rose-500/20 text-rose-300 animate-pulse border-rose-500/40" 
                              : "bg-teal-500/10 border-teal-500/30 text-teal-300"
                        )} title={isCharging ? "Device is charging" : batteryLevel < 20 ? "Battery is low! Please plug in your charger." : "Battery status ok"}>
                          {isCharging ? (
                            <BatteryCharging className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                          ) : (
                            <Battery className="w-2.5 h-2.5 text-teal-400" />
                          )}
                          <span>Battery: {batteryLevel}% {isCharging ? "(Charging)" : batteryLevel < 20 ? "(Low)" : ""}</span>
                        </span>
                        {/* Battery Level Visual Progress Indicator Bar */}
                        <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden relative border border-slate-700/50" title={`Battery level is ${batteryLevel}%`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${batteryLevel}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={cn(
                              "h-full rounded-full transition-colors",
                              isCharging 
                                ? "bg-amber-400" 
                                : batteryLevel < 20 
                                  ? "bg-rose-500" 
                                  : batteryLevel < 50 
                                    ? "bg-amber-500" 
                                    : "bg-emerald-400"
                            )}
                          />
                          {batteryLevel < 20 && !isCharging && (
                            <div className="absolute inset-0 bg-rose-500/30 animate-pulse rounded-full" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Service Worker Status Badge */}
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border",
                      swState === "active" 
                        ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" 
                        : swState === "registering" 
                          ? "bg-sky-500/10 text-sky-300 border-sky-500/30 animate-pulse" 
                          : "bg-slate-900/80 text-slate-400 border-slate-800"
                    )} title="Service Worker installation and activation status">
                      <Wifi className="w-2.5 h-2.5 text-amber-400" />
                      <span>
                        {t.swStateLabel}
                        {swState === "active" 
                          ? t.swActive 
                          : swState === "registering" 
                            ? t.swRegistering 
                            : swState === "unsupported" 
                              ? t.swUnsupported 
                              : t.swNotRegistered}
                      </span>
                    </span>

                    {/* Offline Ready Badge */}
                    {isOfflineReady && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-[9px] font-black uppercase tracking-wider animate-bounce" title="Application bundle has been cached successfully and is ready to run offline without internet connection">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
                        <span>{t.offlineReady}</span>
                      </span>
                    )}
                  </div>

                  {/* Real-time Network Speed Test Section */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 no-print">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        <Gauge className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t.speedTestTitle}</span>
                      </span>
                    </div>

                    <div className="mt-2 space-y-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-2xl p-3 transition-colors">
                      {/* Speed indicator & Status */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                          <Wifi className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>
                            {speedTestMbps !== null ? (
                              <>
                                {t.speedTestedAtValue}
                                <span className="text-amber-400 text-sm font-black">{speedTestMbps} Mbps</span>
                              </>
                            ) : isTestingSpeed ? (
                              <span className="animate-pulse text-amber-300">{t.testingSpeedProgress}</span>
                            ) : (
                              <span className="text-slate-400 font-medium">Not tested yet</span>
                            )}
                          </span>
                        </div>
                        {/* Speed Quality Indicator Badges */}
                        {speedTestMbps !== null && (
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border",
                            speedTestMbps >= 15 
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                              : speedTestMbps >= 5 
                                ? "bg-teal-500/20 text-teal-300 border-teal-500/40" 
                                : speedTestMbps >= 2 
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                                  : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          )}>
                            {speedTestMbps >= 15 
                              ? t.qualityExcellent 
                              : speedTestMbps >= 5 
                                ? t.qualityGood 
                                : speedTestMbps >= 2 
                                  ? t.qualityFair 
                                  : t.qualityPoor}
                          </span>
                        )}
                      </div>

                      {/* Error or Success notification */}
                      {speedTestError && (
                        <div className="flex items-center gap-1.5 p-1.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-[10px] text-rose-300 font-semibold leading-tight animate-fade-in">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>{t.speedTestErrorMsg} ({speedTestError})</span>
                        </div>
                      )}

                      {/* Progress bar (during active speed test) */}
                      {isTestingSpeed && (
                        <div className="space-y-1">
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative border border-slate-700/50">
                            <motion.div 
                              className="h-full bg-amber-400 rounded-full animate-pulse"
                              animate={{ width: `${speedTestProgress}%` }}
                              transition={{ duration: 0.1, ease: "easeOut" }}
                            />
                          </div>
                          <div className="flex justify-between text-[8px] font-black text-amber-300 uppercase tracking-widest">
                            <span>Downloading payload</span>
                            <span>{speedTestProgress}%</span>
                          </div>
                        </div>
                      )}

                      {/* Run Speed Test Button */}
                      {!isTestingSpeed && (
                        <button
                          type="button"
                          onClick={handleRunSpeedTest}
                          className="w-full py-1.5 px-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-200 hover:text-amber-300 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className={cn("w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400", isTestingSpeed && "animate-spin")} />
                          <span>{t.runSpeedTestBtn}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <AnimatePresence>
                {showQr && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="relative overflow-hidden flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-4 border border-gray-100 w-full qr-print-container"
                  >
                    {/* Floating Quick Help / Info Trigger button */}
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      <button
                        type="button"
                        onClick={handleExportStats}
                        className="p-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-400 hover:text-emerald-600 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
                        title="Export Scan Stats (CSV)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowQuickHelp(!showQuickHelp)}
                        className="p-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-400 hover:text-brand-primary border border-gray-200 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
                        title="Quick Help / Camera Scanning Tips"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick Help Overlay */}
                    <AnimatePresence>
                      {showQuickHelp && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-4 bg-white/98 backdrop-blur-sm rounded-2xl p-4 flex flex-col justify-between border border-gray-200 shadow-xl z-20"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
                              <Info className="w-4 h-4 text-brand-primary shrink-0" />
                              <h5 className="text-[11px] font-black uppercase tracking-wider text-gray-800">
                                {t.quickHelpTitle}
                              </h5>
                            </div>
                            <div className="space-y-2.5 text-[10px] text-gray-600 leading-normal">
                              <div className="flex items-start gap-2">
                                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-brand-primary/10 text-brand-primary font-bold shrink-0 text-[9px] border border-brand-primary/20">
                                  1
                                </span>
                                <p className="pt-0.5">{t.quickHelpTip1}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-50 text-amber-600 font-bold shrink-0 text-[9px] border border-amber-100">
                                  2
                                </span>
                                <div className="space-y-1 pt-0.5">
                                  <p>{t.quickHelpTip2}</p>
                                  <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold text-amber-700 uppercase tracking-wider bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-200/60 shadow-sm mt-1">
                                    <Sun className="w-3 h-3 text-amber-500 animate-pulse animate-duration-1000" /> {t.quickHelpTipLight}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setShowQuickHelp(false)}
                            className="w-full py-2 bg-brand-primary hover:bg-brand-primary/95 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand-primary/10 cursor-pointer text-center active:scale-95"
                          >
                            {t.quickHelpGotIt}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isScanning ? (
                      <div className="relative w-[156px] h-[156px] bg-slate-950 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center overflow-hidden">
                        {cameraStream ? (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center text-[10px] text-slate-400">
                            {scanError ? (
                              <div className="flex flex-col items-center gap-1.5 p-1.5">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <span className="text-red-400 font-bold">{t.cameraBlocked}</span>
                                <span className="text-[8px] text-slate-500 leading-tight">{t.couldNotAccessCamera}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1.5">
                                <RefreshCw className="w-5 h-5 animate-spin text-brand-primary" />
                                <span className="text-slate-400 text-[9px] font-semibold">Initializing Camera...</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Camera viewfinder guide lines */}
                        {cameraStream && !scanResult && (
                          <>
                            <div className="absolute inset-3 border border-dashed border-white/20 rounded-lg pointer-events-none animate-pulse" />
                            {/* Animated green laser line overlay */}
                            <motion.div
                              className="absolute left-3 right-3 h-[1.5px] bg-emerald-400 pointer-events-none shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                              animate={{
                                top: ["12px", "144px", "12px"],
                              }}
                              transition={{
                                duration: 2.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />

                            {/* Torch Toggle Button */}
                            {hasTorch && (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                type="button"
                                onClick={toggleTorch}
                                className={cn(
                                  "absolute bottom-3 right-3 p-2 rounded-xl transition-all cursor-pointer z-10 shadow-lg backdrop-blur-md border",
                                  isTorchOn 
                                    ? "bg-amber-400 border-amber-500 text-slate-900" 
                                    : "bg-slate-900/60 border-slate-700/50 text-slate-400 hover:text-white"
                                )}
                                title={isTorchOn ? t.torchOn : t.torchOff}
                              >
                                {isTorchOn ? (
                                  <Sun className="w-4 h-4 animate-pulse" />
                                ) : (
                                  <Sun className="w-4 h-4 opacity-50" />
                                )}
                              </motion.button>
                            )}

                            {/* Zoom Slider */}
                            {hasZoom && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-3 left-3 right-14 flex items-center gap-2 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl px-2 py-1 z-10"
                              >
                                <ZoomOut className="w-3 h-3 text-slate-400" />
                                <input
                                  type="range"
                                  min={minZoom}
                                  max={maxZoom}
                                  step={0.1}
                                  value={zoom}
                                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                                  className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                />
                                <ZoomIn className="w-3 h-3 text-slate-400" />
                              </motion.div>
                            )}
                          </>
                        )}

                        {/* Scanner result detection overlay with subtle fade/scale animation */}
                        <AnimatePresence mode="wait">
                          {scanResult && (
                            <motion.div
                              key={scanResult}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="absolute inset-0 bg-emerald-950/95 text-white p-2 flex flex-col items-center justify-center text-center"
                            >
                              <CheckCircle className="w-6 h-6 text-emerald-400 mb-1 animate-bounce" />
                              <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest leading-none">
                                {lang === "en" ? "Scanned!" : lang === "fr" ? "Scanné !" : "Imeskaniwa!"}
                              </span>
                              <span className="text-[8px] font-mono text-emerald-200 truncate max-w-full mt-1.5 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">{scanResult}</span>
                              <div className="flex items-center gap-1 mt-2.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(scanResult);
                                  }}
                                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 rounded text-[8px] font-bold uppercase transition-all cursor-pointer"
                                >
                                  {lang === "en" ? "Copy" : lang === "fr" ? "Copier" : "Nakili"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setScanResult(null);
                                    setScanError(null);
                                  }}
                                  className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[8px] font-bold uppercase transition-all cursor-pointer"
                                >
                                  {lang === "en" ? "Retry" : lang === "fr" ? "Réessayer" : "Jaribu Tena"}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Simulated scan spinner */}
                        {simulatingScan && (
                          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-center p-2">
                            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400 mb-1" />
                            <span className="text-[9px] text-emerald-400 font-bold animate-pulse uppercase tracking-wider">{t.scanningFeed}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2.5 w-full">
                        <div 
                          id="pwa-install-qr-svg-wrapper" 
                          className="group relative bg-white p-3 rounded-xl border border-gray-150/60 shadow-sm flex items-center justify-center overflow-hidden cursor-pointer"
                          title="Click to download QR code as image"
                          onClick={downloadQrCode}
                        >
                                                  <QRCodeSVG 
                            value={currentUrl} 
                            size={Math.round(132 * qrScale)} 
                            bgColor={"#FFFFFF"}
                            fgColor={qrFgColor}
                            level={"H"}
                            includeMargin={false}
                            imageSettings={showQrLogo ? {
                              src: logoImage,
                              x: undefined,
                              y: undefined,
                              height: Math.round(28 * qrScale),
                              width: Math.round(28 * qrScale),
                              excavate: true,
                            } : undefined}
                          />
                          {/* Subtle, animated scanning line overlay with symmetrical glow */}
                          <motion.div
                            className="absolute left-3 right-3 h-[2px] pointer-events-none transition-colors duration-300"
                            style={{ backgroundColor: qrFgColor }}
                            animate={{
                              top: ["12px", `${12 + Math.round(132 * qrScale)}px`, "12px"],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            <div 
                              className="absolute -inset-y-2 left-0 right-0 blur-sm rounded-full transition-colors duration-300" 
                              style={{ 
                                backgroundColor: qrTheme === "classic" 
                                   ? "rgba(15, 23, 42, 0.25)" 
                                   : qrTheme === "brand"
                                     ? "rgba(59, 130, 246, 0.25)"
                                     : "rgba(217, 119, 6, 0.25)"
                              }} 
                            />
                          </motion.div>

                          {/* Interactive Hover Download Overlay */}
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 text-white select-none">
                            <div className="p-2 bg-white/25 rounded-full backdrop-blur-sm shadow-md transition-all group-hover:scale-105 active:scale-95">
                              <Download className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                              Download QR
                            </span>
                          </div>

                          {/* Zoom In and Zoom Out button pair (Scale Controls) */}
                          <div 
                            className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-xl border border-gray-150 shadow-lg z-30 no-print"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQrScale(prev => Math.max(0.6, prev - 0.15));
                              }}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-brand-primary rounded-lg transition-all cursor-pointer flex items-center justify-center active:scale-90"
                              title="Zoom Out QR Code"
                              aria-label="Zoom Out QR Code"
                            >
                              <ZoomOut className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-black text-gray-700 select-none min-w-[32px] text-center font-mono">
                              {Math.round(qrScale * 100)}%
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQrScale(prev => Math.min(2.0, prev + 0.15));
                              }}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-brand-primary rounded-lg transition-all cursor-pointer flex items-center justify-center active:scale-90"
                              title="Zoom In QR Code"
                              aria-label="Zoom In QR Code"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Automatic Refresh Countdown Timer */}
                        <div className="w-full max-w-[200px] flex flex-col items-center gap-1.5 opacity-90 transition-opacity hover:opacity-100">
                          <div className="w-full h-1.5 bg-gray-150/50 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              className="h-full bg-brand-primary"
                              initial={{ width: "100%" }}
                              animate={{ width: `${(qrRefreshCountdown / 30) * 100}%` }}
                              transition={{ duration: 1, ease: "linear" }}
                            />
                          </div>
                          <div className="flex w-full justify-between items-center text-[8px] font-bold uppercase tracking-wider text-gray-400">
                            <span>Auto Refresh</span>
                            <span className={qrRefreshCountdown <= 5 ? "text-amber-500 font-black animate-pulse" : ""}>
                              {qrRefreshCountdown}s
                            </span>
                          </div>
                        </div>

                        {/* QR Code Action Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {/* Save QR as Image button */}
                          <button
                            type="button"
                            onClick={downloadQrCode}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-150/80 hover:border-gray-200 text-gray-700 hover:text-brand-primary rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Download high-quality PNG of this QR code"
                          >
                            <Download className="w-3.5 h-3.5 text-brand-primary" />
                            <span>{t.saveQrAsImage}</span>
                          </button>

                          {/* Toggle QR Logo button */}
                          <button
                            type="button"
                            id="pwa-install-toggle-qr-logo-btn"
                            onClick={() => setShowQrLogo(!showQrLogo)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95",
                              showQrLogo 
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" 
                                : "bg-white border-gray-150/80 text-gray-700 hover:bg-gray-50 hover:text-brand-primary"
                            )}
                            title="Toggle Grade Master logo visibility in the center of the QR code"
                          >
                            {showQrLogo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{t.toggleQrLogo}</span>
                          </button>

                          {/* Force Refresh QR Code button */}
                          <button
                            type="button"
                            onClick={() => {
                              const now = Date.now();
                              setQrTimestamp(now);
                              setManualRefreshKey(now);
                              setQrRefreshCountdown(30);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-150/80 hover:border-gray-200 text-gray-700 hover:text-brand-primary rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Force Refresh QR Code"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-brand-primary" />
                            <span>{lang === "en" ? "Refresh" : lang === "fr" ? "Actualiser" : "Sasisha"}</span>
                          </button>
                          
                          {/* Toggle Sound Settings button */}
                          <button
                            type="button"
                            onClick={() => setEnableScanSound(!enableScanSound)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95",
                              enableScanSound 
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                                : "bg-white border-gray-150/80 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            )}
                            title="Toggle success ping sound for QR scan"
                          >
                            {enableScanSound ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-gray-400" />}
                            <span>Sound</span>
                          </button>
                        </div>

                        {/* Save to Keep Button */}
                        <button
                          type="button"
                          onClick={handleSaveToKeep}
                          disabled={isSavingToKeep}
                          className={cn(
                            "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 border",
                            keepSaveSuccess 
                              ? "bg-emerald-500 border-emerald-600 text-white shadow-emerald-200"
                              : isSavingToKeep
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-white border-gray-150/80 hover:border-gray-200 text-gray-700 hover:text-brand-primary shadow-gray-50"
                          )}
                        >
                          {keepSaveSuccess ? (
                            <CheckCircle2 className="w-3.5 h-3.5 animate-in zoom-in duration-300" />
                          ) : isSavingToKeep ? (
                            <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-brand-primary rounded-full animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5 text-brand-primary" />
                          )}
                          <span>{keepSaveSuccess ? t.savedToKeep : isSavingToKeep ? t.savingToKeep : t.saveToKeep}</span>
                        </button>

                        {/* WhatsApp Share Button */}
                        <button
                          type="button"
                          onClick={handleShareWhatsApp}
                          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 border bg-white border-gray-150/80 hover:border-emerald-200 text-gray-700 hover:text-emerald-600 shadow-gray-50"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{t.shareWhatsApp}</span>
                        </button>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-1 mt-2.5">
                      <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-wider">
                        {isScanning ? t.quickScanViewer : t.scanToOpen}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowVibeSettings(!showVibeSettings)}
                        className={cn(
                          "text-gray-300 hover:text-gray-500 p-0.5 rounded transition-all cursor-pointer",
                          showVibeSettings && "text-brand-primary hover:text-brand-primary/80"
                        )}
                        title="Haptic Settings"
                      >
                        <Settings className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Hidden Vibration Intensity Configurator */}
                    <AnimatePresence>
                      {showVibeSettings && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-full mt-2 overflow-hidden"
                        >
                          <div className="flex flex-col gap-2.5 p-3 bg-slate-900/90 text-white rounded-2xl border border-slate-800 text-[11px] shadow-xl">
                            {/* 1. Header & Master Enable/Disable Toggle */}
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                                <Zap className={cn("w-3.5 h-3.5", hapticsEnabled ? "text-amber-400" : "text-slate-500")} />
                                <span>{t.hapticsTitle || "Haptic Vibration Settings"}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleHapticsEnabled(!hapticsEnabled)}
                                className={cn(
                                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer border",
                                  hapticsEnabled 
                                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" 
                                    : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                                )}
                              >
                                <div className={cn("w-2 h-2 rounded-full", hapticsEnabled ? "bg-emerald-400 animate-pulse" : "bg-slate-500")} />
                                <span>{hapticsEnabled ? (t.hapticsEnabledLabel || "Enabled") : (t.hapticsDisabledLabel || "Disabled")}</span>
                              </button>
                            </div>

                            {!hapticsEnabled ? (
                              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center text-slate-400 text-[10px] leading-relaxed">
                                {t.hapticsOffDesc || "Haptic feedback is turned off completely. Toggle switch above to re-enable vibrations or design custom patterns."}
                              </div>
                            ) : (
                              <>
                                {/* 2. Feedback Mode Selector (Presets vs Custom Builder) */}
                                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                  <button
                                    type="button"
                                    onClick={() => changeHapticMode("preset")}
                                    className={cn(
                                      "flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                                      hapticMode === "preset"
                                        ? "bg-amber-500 text-black shadow-sm"
                                        : "text-slate-400 hover:text-slate-200"
                                    )}
                                  >
                                    <Sliders className="w-3 h-3" />
                                    <span>{t.presetMode || "Presets"}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => changeHapticMode("custom")}
                                    className={cn(
                                      "flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                                      hapticMode === "custom"
                                        ? "bg-amber-500 text-black shadow-sm"
                                        : "text-slate-400 hover:text-slate-200"
                                    )}
                                  >
                                    <Activity className="w-3 h-3" />
                                    <span>{t.customMode || "Custom Builder"}</span>
                                  </button>
                                </div>

                                {/* 3. Presets View */}
                                {hapticMode === "preset" && (
                                  <div className="flex flex-col gap-2">
                                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                      {(["low", "medium", "high"] as const).map((strength) => (
                                        <button
                                          key={strength}
                                          type="button"
                                          onClick={() => changeVibeIntensity(strength)}
                                          className={cn(
                                            "py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer capitalize flex flex-col items-center justify-center gap-0.5",
                                            vibeIntensity === strength
                                              ? "bg-amber-500/20 border border-amber-500/50 text-amber-300"
                                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                                          )}
                                        >
                                          <span>{strength === "low" ? t.low : strength === "medium" ? t.medium : t.high}</span>
                                          <span className="text-[8px] opacity-60 font-mono">
                                            {strength === "low" ? "15ms" : strength === "medium" ? "40ms×3" : "80ms×3"}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 4. Custom Visual Pattern Builder */}
                                {hapticMode === "custom" && (
                                  <div className="flex flex-col gap-3 pt-1">
                                    {/* Visual Timeline Header */}
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-bold text-slate-300 flex items-center gap-1">
                                        <Activity className="w-3 h-3 text-amber-400" />
                                        {t.timelineTitle || "Visual Timeline"}
                                      </span>
                                      <span className="font-mono text-[9px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-amber-400">
                                        {t.totalDuration || "Total"}: {customVibePattern.reduce((a, b) => a + b, 0)}ms
                                      </span>
                                    </div>

                                    {/* Visual Timeline Canvas */}
                                    <div className="relative w-full bg-slate-950 p-2 rounded-xl border border-slate-800 overflow-hidden min-h-[52px]">
                                      {/* Playback Sweep Indicator */}
                                      {isPlayingPattern && (
                                        <motion.div 
                                          className="absolute top-0 bottom-0 w-1 bg-amber-400 z-20 shadow-[0_0_12px_#f59e0b]"
                                          style={{ left: `${playbackProgress * 100}%` }}
                                        />
                                      )}

                                      <div className="flex items-center gap-1 w-full overflow-x-auto pb-1 scrollbar-thin">
                                        {customVibePattern.map((dur, idx) => {
                                          const isPulse = idx % 2 === 0;
                                          const totalMs = customVibePattern.reduce((a, b) => a + b, 0) || 1;
                                          const pct = Math.max(8, (dur / totalMs) * 100);
                                          const isSelected = selectedStepIndex === idx;

                                          return (
                                            <button
                                              key={idx}
                                              type="button"
                                              onClick={() => setSelectedStepIndex(idx)}
                                              style={{ width: `${pct}%`, minWidth: "32px" }}
                                              className={cn(
                                                "h-8 rounded-lg text-[9px] font-mono font-bold flex flex-col items-center justify-center transition-all cursor-pointer relative shrink-0 border",
                                                isPulse 
                                                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30" 
                                                  : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850",
                                                isSelected && "ring-2 ring-amber-400 border-amber-400 shadow-md"
                                              )}
                                            >
                                              <div className="flex items-center gap-0.5">
                                                {isPulse ? <Zap className="w-2.5 h-2.5 text-amber-400" /> : <Clock className="w-2.5 h-2.5 text-slate-500" />}
                                              </div>
                                              <span>{dur}m</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Selected Step Editor Panel */}
                                    {selectedStepIndex !== null && customVibePattern[selectedStepIndex] !== undefined && (
                                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-[10px]">
                                          <span className="font-bold text-amber-300">
                                            Step #{selectedStepIndex + 1}: {selectedStepIndex % 2 === 0 ? (t.stepPulse || "Pulse") : (t.stepPause || "Pause")} ({customVibePattern[selectedStepIndex]}ms)
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => deleteStep(selectedStepIndex)}
                                            disabled={customVibePattern.length <= 1}
                                            className="text-rose-400 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed p-1 rounded transition-all cursor-pointer"
                                            title="Delete step"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => updateStepValue(selectedStepIndex, customVibePattern[selectedStepIndex] - 10)}
                                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-md text-[10px] font-mono cursor-pointer"
                                          >
                                            -10ms
                                          </button>
                                          <input
                                            type="range"
                                            min="10"
                                            max="500"
                                            step="5"
                                            value={customVibePattern[selectedStepIndex]}
                                            onChange={(e) => updateStepValue(selectedStepIndex, parseInt(e.target.value, 10))}
                                            className="flex-1 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => updateStepValue(selectedStepIndex, customVibePattern[selectedStepIndex] + 10)}
                                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-md text-[10px] font-mono cursor-pointer"
                                          >
                                            +10ms
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Add Step Controls */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={addPulseStep}
                                        className="flex-1 py-1.5 px-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-amber-400 flex items-center justify-center gap-1 transition-all cursor-pointer"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>{t.addPulse || "+ Pulse"}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={addPauseStep}
                                        className="flex-1 py-1.5 px-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1 transition-all cursor-pointer"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>{t.addPause || "+ Pause"}</span>
                                      </button>
                                    </div>

                                    {/* Pattern Templates Quick Picks */}
                                    <div className="flex flex-col gap-1.5 pt-1">
                                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold">
                                        {t.presetTemplates || "Quick Pattern Presets"}
                                      </span>
                                      <div className="flex flex-wrap gap-1">
                                        {CUSTOM_PATTERN_PRESETS.map((p) => (
                                          <button
                                            key={p.name}
                                            type="button"
                                            onClick={() => saveCustomPattern(p.pattern)}
                                            className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 rounded-md text-[9px] font-semibold text-slate-300 hover:text-amber-400 transition-all cursor-pointer"
                                          >
                                            {p.name}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Live Rhythm Tap Recorder Pad */}
                                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/90 flex flex-col items-center gap-2 text-center">
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
                                        <Radio className={cn("w-3 h-3", isRecordingRhythm ? "text-rose-500 animate-ping" : "text-amber-400")} />
                                        <span>{isRecordingRhythm ? (t.recordingActive || "Recording Rhythm...") : (t.tapToRecord || "Tap / Hold Pad to Record")}</span>
                                      </div>

                                      <button
                                        type="button"
                                        onPointerDown={handleTapDown}
                                        onPointerUp={handleTapUp}
                                        className={cn(
                                          "w-full py-3 px-4 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all select-none touch-none cursor-pointer flex items-center justify-center gap-2",
                                          isRecordingRhythm 
                                            ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse" 
                                            : "bg-slate-900 hover:bg-slate-850 border-slate-700 text-slate-200"
                                        )}
                                      >
                                        <Vibrate className="w-4 h-4 text-amber-400" />
                                        <span>{isRecordingRhythm ? "Hold for pulse / Release for gap" : "Tap or Hold Here to Start Recording"}</span>
                                      </button>

                                      {isRecordingRhythm && (
                                        <button
                                          type="button"
                                          onClick={finishRecordingRhythm}
                                          className="px-3 py-1 bg-emerald-500 text-black font-bold rounded-lg text-[9px] uppercase tracking-wider hover:bg-emerald-400 transition-all cursor-pointer"
                                        >
                                          {t.recordingFinished || "Finish & Save Rhythm"} ({tapRecordBuffer.length} steps)
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Bottom Test, Save, Reset Actions */}
                                <div className="flex items-center justify-between border-t border-slate-800 pt-2.5 mt-1">
                                  <button
                                    type="button"
                                    onClick={handleTestPlayback}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>{t.testVibe || "Test Pattern"}</span>
                                  </button>

                                  <div className="flex items-center gap-1.5">
                                    {showSavedToast && (
                                      <span className="text-[9px] text-emerald-400 font-bold animate-in fade-in">
                                        {t.patternSaved || "Saved!"}
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => saveCustomPattern(customVibePattern)}
                                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                                    >
                                      <Save className="w-3 h-3 text-emerald-400" />
                                      <span>{t.savePattern || "Save"}</span>
                                    </button>

                                    {hapticMode === "custom" && (
                                      <button
                                        type="button"
                                        onClick={resetCustomPattern}
                                        className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl transition-all cursor-pointer"
                                        title={t.resetPattern || "Reset Default"}
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* QR Code Theme Selector */}
                    <div className="flex items-center justify-between w-full mt-3 px-3 py-2 bg-white rounded-xl border border-gray-150/50 text-[11px] text-gray-500">
                      <span className="font-semibold text-gray-600">{t.qrTheme}</span>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                        <button
                          type="button"
                          onClick={() => setQrTheme("classic")}
                          className={cn(
                            "px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                            qrTheme === "classic"
                              ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                              : "text-gray-500 hover:text-gray-900"
                          )}
                        >
                          Classic
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrTheme("brand")}
                          className={cn(
                            "px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                            qrTheme === "brand"
                              ? "bg-brand-secondary text-white shadow-sm"
                              : "text-gray-500 hover:text-gray-900"
                          )}
                        >
                          Brand
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrTheme("gold")}
                          className={cn(
                            "px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                            qrTheme === "gold"
                              ? "bg-amber-600 text-white shadow-sm"
                              : "text-gray-500 hover:text-gray-900"
                          )}
                        >
                          Gold
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Auto-refresh Toggle Switch */}
                    <div className="flex items-center justify-between w-full mt-2 px-3 py-2 bg-white rounded-xl border border-gray-150/50 text-[11px] text-gray-500">
                      <span className="font-semibold text-gray-600">{t.autoRefresh}</span>
                      <button
                        type="button"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-brand-primary/20",
                          autoRefresh ? "bg-brand-primary" : "bg-gray-200"
                        )}
                        role="switch"
                        aria-checked={autoRefresh}
                        aria-label="Toggle QR code auto refresh"
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                            autoRefresh ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>

                    {/* Auto-Start Scanner Toggle Switch */}
                    <div className="flex items-center justify-between w-full mt-2 px-3 py-2 bg-white rounded-xl border border-gray-150/50 text-[11px] text-gray-500">
                      <span className="font-semibold text-gray-600">{t.autoStartScanner}</span>
                      <button
                        type="button"
                        onClick={() => setAutoStartScanner(!autoStartScanner)}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-brand-primary/20",
                          autoStartScanner ? "bg-brand-primary" : "bg-gray-200"
                        )}
                        role="switch"
                        aria-checked={autoStartScanner}
                        aria-label="Toggle Auto-Start Scanner"
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                            autoStartScanner ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>

                    {/* Success Ping Sound Toggle Switch */}
                    <div className="flex items-center justify-between w-full mt-2 px-3 py-2 bg-white rounded-xl border border-gray-150/50 text-[11px] text-gray-500 shadow-sm transition-all hover:border-emerald-200/50 group">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1 rounded-md transition-colors",
                          enableScanSound ? "bg-emerald-50" : "bg-gray-50"
                        )}>
                          <Volume2 className={cn("w-3.5 h-3.5", enableScanSound ? "text-emerald-500" : "text-gray-400")} />
                        </div>
                        <span className="font-semibold text-gray-600">Success Ping Sound</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEnableScanSound(!enableScanSound)}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                          enableScanSound ? "bg-emerald-500" : "bg-gray-200"
                        )}
                        role="switch"
                        aria-checked={enableScanSound}
                        aria-label="Toggle Success Ping Sound"
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                            enableScanSound ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>

                    {/* Link History Toggle and Panel */}
                    <div className="w-full mt-2">
                      <button
                        type="button"
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center justify-between w-full px-3 py-2 bg-white rounded-xl border border-gray-150/50 text-[11px] text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-gray-600 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-gray-400" />
                          {t.linkHistory}
                        </span>
                        <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-full font-bold text-gray-600">
                          {urlHistory.length}
                        </span>
                      </button>

                      <AnimatePresence>
                        {showHistory && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden mt-1 bg-white rounded-xl border border-gray-150/50 p-2 flex flex-col gap-1"
                          >
                            {urlHistory.length === 0 ? (
                              <p className="text-[10px] text-gray-400 text-center py-1">
                                {lang === "en" ? "No history yet" : lang === "fr" ? "Aucun historique" : "Hakuna historia bado"}
                              </p>
                            ) : (
                              urlHistory.map((url, idx) => {
                                let timeLabel = "Current";
                                try {
                                  const parsed = new URL(url);
                                  const tVal = parsed.searchParams.get("t");
                                  if (tVal) {
                                    const date = new Date(parseInt(tVal));
                                    timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                  }
                                } catch (e) {
                                  // ignore
                                }

                                const isCopied = historyCopiedIdx === idx;

                                return (
                                  <button
                                    key={url}
                                    type="button"
                                    onClick={() => handleCopyHistoryUrl(url, idx)}
                                    className="text-left p-1.5 hover:bg-gray-50 rounded-lg text-[10px] text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-between group cursor-pointer gap-2"
                                  >
                                    <span className="truncate max-w-[170px] font-mono text-[9px] text-gray-400 group-hover:text-gray-700">{url}</span>
                                    <span className={cn(
                                      "text-[8px] px-1 py-0.5 rounded font-semibold shrink-0 flex items-center gap-1 transition-all border",
                                      isCopied 
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                        : "bg-gray-50 text-gray-500 border-gray-100 group-hover:bg-brand-primary/5 group-hover:text-brand-primary group-hover:border-brand-primary/10"
                                    )}>
                                      {isCopied ? (
                                        <>
                                          <Check className="w-2.5 h-2.5 text-emerald-500" />
                                          {lang === "en" ? "Copied" : lang === "fr" ? "Copié" : "Imenakiliwa"}
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-2.5 h-2.5 text-gray-400 group-hover:text-brand-primary" />
                                          {timeLabel}
                                        </>
                                      )}
                                    </span>
                                  </button>
                                );
                              })
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Scan Statistics & CSV Export Button */}
                    <div className="flex items-center justify-between w-full mt-2 px-3 py-2 bg-white rounded-xl border border-gray-150/50 text-[11px] text-gray-500 no-print">
                      <span className="font-semibold text-gray-600 flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-emerald-500" />
                        <span>
                          {lang === "en" ? "Scan Stats" : lang === "fr" ? "Stats de scan" : "Takwimu za Skani"}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={handleExportStats}
                        disabled={scanHistory.length === 0}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 border",
                          scanHistory.length === 0
                            ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                            : "bg-emerald-50 hover:bg-emerald-100 border-emerald-150 text-emerald-700 active:scale-95 shadow-sm"
                        )}
                        title={scanHistory.length === 0 ? "No scan history to export yet" : "Export formatted CSV file of scan history and statistics"}
                      >
                        <span>
                          {lang === "en" ? "Export CSV" : lang === "fr" ? "Exporter CSV" : "Hamisha CSV"}
                        </span>
                        <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold ml-1 min-w-[14px] text-center">
                          {scanHistory.length}
                        </span>
                      </button>
                    </div>

                    {/* Camera Scanner Instruction & Simulation Trigger */}
                    {isScanning && cameraStream && !scanResult && (
                      <div className="w-full mt-2.5 text-center bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 flex flex-col items-center gap-1.5 shadow-sm animate-fade-in">
                        <p className="text-[9px] text-emerald-600 font-bold leading-tight">
                          {t.aimCamera}
                        </p>
                        <button
                          type="button"
                          onClick={triggerSimulatedScan}
                          disabled={simulatingScan}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-emerald-200 flex items-center gap-1"
                        >
                          {simulatingScan ? (
                            <>
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                              <span>{t.scanningFeed}</span>
                            </>
                          ) : (
                            <>
                              <QrCode className="w-2.5 h-2.5" />
                              <span>{t.simulateAutoDetect}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3.5 w-full justify-center">
                      <button
                        type="button"
                        onClick={handleShareOrCopy}
                        className="flex-1 max-w-[130px] py-1.5 px-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-600 hover:text-gray-900 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        {canShare ? (
                          <>
                            <Share className="w-3 h-3 text-brand-primary" />
                            <span>{t.shareLink}</span>
                          </>
                        ) : copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500 animate-pulse" />
                            <span>{t.copied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-gray-400" />
                            <span>{t.copyLink}</span>
                          </>
                        )}
                      </button>

                      {isScanning ? (
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="flex-1 max-w-[130px] py-1.5 px-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-[10px] font-bold text-red-600 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <X className="w-3 h-3 text-red-500" />
                          <span>{t.stopScan}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex-1 max-w-[130px] py-1.5 px-2 bg-brand-primary/5 hover:bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-[10px] font-bold text-brand-primary hover:text-brand-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Camera className="w-3 h-3 text-brand-primary" />
                          <span>{t.quickScan}</span>
                        </button>
                      )}
                    </div>

                    {/* Scan History Table (Visible when printing) */}
                    {scanHistory.length > 0 && (
                      <div className="w-full mt-4 border-t border-gray-100 pt-4 overflow-x-auto">
                        <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1 text-center">
                          {lang === "en" ? "Scan History & Frequency Stats" : lang === "fr" ? "Historique des scans et statistiques" : "Historia ya Skani na Takwimu"}
                        </h5>
                        <table className="w-full text-left border-collapse min-w-[280px]">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="py-1.5 px-1 text-[8px] font-black text-gray-400 uppercase">URL</th>
                              <th className="py-1.5 px-1 text-[8px] font-black text-gray-400 uppercase text-center">Freq</th>
                              <th className="py-1.5 px-1 text-[8px] font-black text-gray-400 uppercase text-right">Last Scan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const counts: Record<string, { count: number, lastScanned: number }> = {};
                              scanHistory.forEach(scan => {
                                if (!counts[scan.url]) {
                                  counts[scan.url] = { count: 0, lastScanned: scan.timestamp };
                                }
                                counts[scan.url].count += 1;
                                if (scan.timestamp > counts[scan.url].lastScanned) {
                                  counts[scan.url].lastScanned = scan.timestamp;
                                }
                              });
                              return Object.entries(counts)
                                .map(([url, data]) => ({ url, ...data }))
                                .sort((a, b) => b.lastScanned - a.lastScanned)
                                .slice(0, 15) // Show top 15 for clean print
                                .map(({ url, count, lastScanned }) => (
                                  <tr key={url} className="border-b border-gray-50/50">
                                    <td className="py-1.5 px-1 text-[8px] font-mono text-gray-600 truncate max-w-[140px]">{url}</td>
                                    <td className="py-1.5 px-1 text-[8px] font-bold text-gray-500 text-center">{count}</td>
                                    <td className="py-1.5 px-1 text-[8px] text-gray-400 text-right">
                                      {new Date(lastScanned).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })}
                                    </td>
                                  </tr>
                                ));
                            })()}
                          </tbody>
                        </table>
                        {scanHistory.length > 15 && (
                          <p className="text-[7px] text-gray-300 text-center mt-2 italic">
                            + {scanHistory.length - 15} {lang === "en" ? "more records in local storage" : lang === "fr" ? "autres enregistrements" : "rekodi zaidi"}
                          </p>
                        )}

                        {/* Export Scan History CSV button */}
                        <div className="flex justify-center mt-3 no-print">
                          <button
                            type="button"
                            onClick={handleExportStats}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold text-white rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                            title="Export all scan history records to CSV"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>
                              {lang === "en" 
                                ? "Export History as CSV" 
                                : lang === "fr" 
                                  ? "Exporter l'historique en CSV" 
                                  : "Hamisha Historia kama CSV"}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Unit Converter Section */}
              <AnimatePresence>
                {showUnitConverter && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="relative overflow-hidden mb-2"
                  >
                    <UnitConverter />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions - Centered Floating Action Triggers */}
              <div className="flex flex-col gap-2.5 border-t border-slate-800/80 pt-3.5">
                <div className="flex items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="flex-[2] px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer text-center disabled:opacity-80 disabled:cursor-not-allowed min-h-[42px] border border-amber-300/50"
                  >
                    {isInstalling ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <Lottie 
                            animationData={loadingLottie} 
                            loop={true} 
                            autoplay={true}
                            style={{ width: "100%", height: "100%" }}
                          />
                        </div>
                        <span>Installing...</span>
                      </div>
                    ) : isIOS ? (
                      <>
                        <HelpCircle className="w-4 h-4 text-slate-950" />
                        {t.howToInstall}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-slate-950" />
                        {t.installNow}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSnooze}
                    className="flex-1 px-3 py-2.5 bg-slate-900/90 text-slate-300 border border-slate-700/80 text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all cursor-pointer text-center min-h-[42px]"
                  >
                    Install Later
                  </button>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUnitConverter(!showUnitConverter);
                        if (showQr) setShowQr(false);
                      }}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center",
                        showUnitConverter 
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md" 
                          : "bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-400 hover:text-white"
                      )}
                      title="Quick Tools: Unit Converter"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowQr(!showQr);
                        if (showUnitConverter) setShowUnitConverter(false);
                      }}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center",
                        showQr 
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md" 
                          : "bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-400 hover:text-white"
                      )}
                      title="Show QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!isIOS && (
                  <button
                    type="button"
                    onClick={() => setShowIosGuide(true)}
                    className="text-[10px] text-slate-400 hover:text-amber-300 font-extrabold uppercase tracking-widest transition-all text-center pt-0.5"
                  >
                    {t.usingIosGuide}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. iOS Safari Setup Guide Modal */}
      <AnimatePresence>
        {showIosGuide && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md p-8 border border-gray-100 shadow-2xl relative overflow-hidden ios-guide-container"
            >
              {/* Close guide button */}
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="absolute top-6 right-6 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                aria-label="Close setup guide"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest no-print">
                    <Smartphone className="w-3.5 h-3.5" />
                    {t.iosSetupTitle}
                  </div>
                  
                  {/* Progress Tracker Dots for iOS Guide */}
                  <div className="flex items-center gap-1.5 no-print mr-2">
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                    <div className={cn("w-2 h-2 rounded-full", showQr ? "bg-brand-primary" : "bg-gray-200")} />
                    <div className="w-2 h-2 rounded-full bg-brand-primary scale-125 shadow-sm shadow-brand-primary/20" />
                  </div>
                </div>
                  <h3 className="text-xl font-bold text-gray-900">{t.iosSetupHeading}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {t.iosSetupDesc}
                  </p>

                <div className="space-y-4">
                  {[
                    {
                      icon: <Compass className="w-5 h-5 text-brand-primary" />,
                      title: t.step1Title,
                      desc: t.step1Desc
                    },
                    {
                      icon: <Share className="w-5 h-5 text-brand-primary" />,
                      title: t.step2Title,
                      desc: t.step2Desc
                    },
                    {
                      icon: <PlusSquare className="w-5 h-5 text-brand-primary" />,
                      title: t.step3Title,
                      desc: t.step3Desc
                    },
                    {
                      icon: <CheckCircle className="w-5 h-5 text-brand-primary" />,
                      title: t.step4Title,
                      desc: t.step4Desc
                    }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center shrink-0 border border-brand-primary/10">
                        {step.icon}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">{step.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowIosGuide(false)}
                  className="w-full py-4 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl cursor-pointer transition-all shadow-md mt-2"
                >
                  {t.gotIt}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Installation Success Toast Notification */}
      <AnimatePresence>
        {showSuccessToast && (
          <div id="pwa-install-success-toast" className="fixed bottom-6 left-6 z-[9999] max-w-sm w-full px-4 sm:px-0">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-emerald-900 border border-emerald-800 text-white rounded-[2rem] p-5 shadow-2xl flex items-center gap-4 relative overflow-hidden"
            >
              {/* Ambient success color accent blur */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />

              {/* Success icon with Lottie success animation */}
              <motion.div 
                initial={{ rotate: -15, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                className="w-12 h-12 rounded-2xl bg-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0 overflow-hidden"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <Lottie 
                    animationData={successLottie} 
                    loop={false} 
                    autoplay={true}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              </motion.div>

              <div className="space-y-0.5 pr-4 flex-1">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 fill-current" /> {t.installedSuccess}
                </h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  {t.installedSuccessDesc}
                </p>
              </div>

              {/* Close success toast */}
              <button
                type="button"
                onClick={() => setShowSuccessToast(false)}
                className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/40 transition-all cursor-pointer"
                aria-label="Dismiss success toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Static UI Assets Reference */}
      <div className="hidden" aria-hidden="true" id="static-assets-pwa-preloader">
        <img src={logoImage} alt="PWA Icon" referrerPolicy="no-referrer" />
        <img src={pocketSchoolLogo} alt="Pocket School Logo" referrerPolicy="no-referrer" />
      </div>
    </>
  );
}
