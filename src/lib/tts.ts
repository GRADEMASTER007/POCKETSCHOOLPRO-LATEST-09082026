export const LANGUAGE_TAG_MAP: Record<string, string> = {
  isizulu: "zu-ZA",
  zu: "zu-ZA",
  sesotho: "st-ZA",
  st: "st-ZA",
  swahili: "sw-KE",
  kiswahili: "sw-KE",
  sw: "sw-KE",
  yoruba: "yo-NG",
  yo: "yo-NG",
  isixhosa: "xh-ZA",
  xh: "xh-ZA",
  afrikaans: "af-ZA",
  af: "af-ZA",
  sepedi: "nso-ZA",
  setswana: "tn-ZA",
  hausa: "ha-NG",
  igbo: "ig-NG",
  amharic: "am-ET",
  french: "fr-FR",
  fr: "fr-FR",
  spanish: "es-ES",
  es: "es-ES",
  portuguese: "pt-PT",
  pt: "pt-PT",
  arabic: "ar-SA",
  ar: "ar-SA",
  english: "en-US",
  en: "en-US"
};

export const speak = (text: string, langCodeOrName: string = "en") => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    // Clean up markdown/emojis for better speech
    const cleanText = text
      .replace(/[\*\#\_\[\]]/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/```[\s\S]*?```/g, 'code block')
      .replace(/`[^`]*`/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const targetLangKey = (langCodeOrName || "en").toLowerCase();
    const bcpTag = LANGUAGE_TAG_MAP[targetLangKey] || "en-US";
    const langPrefix = bcpTag.split("-")[0];

    utterance.lang = bcpTag;

    // Attempt to find a matching voice for the target language
    const voices = window.speechSynthesis.getVoices();
    
    const matchedVoices = voices.filter(voice => 
      voice.lang.toLowerCase().startsWith(langPrefix) || 
      voice.name.toLowerCase().includes(targetLangKey)
    );
    
    if (matchedVoices.length > 0) {
      const expressiveVoice = matchedVoices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium')) || matchedVoices[0];
      utterance.voice = expressiveVoice;
    } else if (voices.length > 0) {
      // Fallback to any available voice
      const anyEnglish = voices.find(v => v.lang.startsWith('en'));
      if (anyEnglish) utterance.voice = anyEnglish;
    }

    // Enhance expression
    utterance.rate = 1.05;
    utterance.pitch = 1.1;

    window.speechSynthesis.speak(utterance);
  }
};

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Ensure voices are loaded (they sometimes load asynchronously)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
