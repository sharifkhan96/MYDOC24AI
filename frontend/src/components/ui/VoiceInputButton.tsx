import { Mic, Square } from "lucide-react";
import { useRef, useState } from "react";

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  }
}

export function VoiceInputButton({ onTranscript }: { onTranscript: (transcript: string) => void }) {
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);

  function toggle() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      window.alert("Voice input is not available in this browser. Try Chrome or type your question instead.");
      return;
    }
    const instance = new SpeechRecognition();
    instance.continuous = false;
    instance.interimResults = false;
    instance.lang = "en-GB";
    instance.onresult = (event) => onTranscript(event.results[0][0].transcript.trim());
    instance.onend = () => setListening(false);
    instance.onerror = () => setListening(false);
    recognition.current = instance;
    setListening(true);
    instance.start();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Stop listening" : "Speak your question"}
      title={listening ? "Stop listening" : "Speak your question"}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${listening ? "border-urgent-emergency bg-urgent-emergency text-onbrand" : "border-navy-100 bg-cream-100 text-navy-600 hover:bg-navy-50"}`}
    >
      {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}
