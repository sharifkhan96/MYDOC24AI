import { useQuery } from "@tanstack/react-query";
import { Feather, HeartHandshake, PhoneOff, Send, Sparkles, Volume2, VolumeX, Wind } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  continueMeditationSession,
  listMeditationGuides,
  startMeditationSession,
  type MeditationEntry,
  type MeditationGuide,
  type MeditationSession,
  type SessionType,
} from "@/api/meditation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";

import { AmbientTone } from "./ambientTone";
import { MeditationStage } from "./MeditationStage";

const SESSION_TYPES: { value: SessionType; label: string; description: string; icon: typeof Wind }[] = [
  { value: "breathing", label: "Breathing & posture", description: "A short guided breathing exercise.", icon: Wind },
  { value: "poem", label: "A poem", description: "An original poem, read to you.", icon: Feather },
  { value: "motivation", label: "Motivation", description: "A short, real motivational talk.", icon: Sparkles },
  { value: "hardship", label: "Talk it out", description: "Share what's on your mind.", icon: HeartHandshake },
];

function speak(text: string, onStart: () => void, onEnd: () => void) {
  if (!("speechSynthesis" in window)) {
    onStart();
    setTimeout(onEnd, Math.min(8000, text.length * 40));
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function GuidePicker({ guides, onSelect }: { guides: MeditationGuide[]; onSelect: (g: MeditationGuide) => void }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Meditation</h1>
        <p className="text-navy-400">Choose a guide, then how you'd like to spend a few minutes.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {guides.map((g) => (
          <button key={g.id} onClick={() => onSelect(g)} className="text-left">
            <Card className="flex h-full flex-col items-center gap-3 text-center transition-shadow hover:shadow-lg">
              <MeditationStage tone={g.tone} portraitUrl={g.avatar_image_url} />
              <div>
                <CardTitle>{g.name}</CardTitle>
                <Badge tone="neutral" className="my-1 capitalize">
                  {g.tone}
                </Badge>
                <CardDescription>{g.tagline}</CardDescription>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

function SessionTypePicker({
  guide,
  onBack,
  onStart,
}: {
  guide: MeditationGuide;
  onBack: () => void;
  onStart: (sessionType: SessionType, initialText: string) => void;
}) {
  const [hardshipText, setHardshipText] = useState("");

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-navy-400 hover:text-navy-700">
        ← Choose a different guide
      </button>
      <h1 className="mb-1 text-2xl font-semibold">What would help right now?</h1>
      <p className="mb-6 text-navy-400">
        With {guide.name} ({guide.tone})
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SESSION_TYPES.filter((t) => t.value !== "hardship").map(({ value, label, description, icon: Icon }) => (
          <button key={value} onClick={() => onStart(value, "")} className="text-left">
            <Card className="flex h-full items-start gap-3 transition-shadow hover:shadow-lg">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sage-600" />
              <div>
                <CardTitle>{label}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </Card>
          </button>
        ))}
      </div>
      <Card className="mt-4">
        <div className="mb-3 flex items-start gap-3">
          <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-sage-600" />
          <div>
            <CardTitle>Talk it out</CardTitle>
            <CardDescription>Share what's on your mind, and {guide.name} will respond.</CardDescription>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={hardshipText}
            onChange={(e) => setHardshipText(e.target.value)}
            placeholder="What's going on?"
            className="flex-1 rounded-lg border border-navy-100 bg-cream-100 px-3 py-2 text-sm text-navy-700 focus:border-navy-400 focus:outline-none"
          />
          <Button size="sm" disabled={!hardshipText.trim()} onClick={() => onStart("hardship", hardshipText.trim())}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function SessionView({ session, onEnd }: { session: MeditationSession; onEnd: () => void }) {
  const [entries, setEntries] = useState<MeditationEntry[]>(session.entries);
  const [followUpText, setFollowUpText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [ambientOn, setAmbientOn] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const ambientRef = useRef<AmbientTone | null>(null);
  const breathingInterval = useRef<number | null>(null);
  const hasPlayedFirst = useRef(false);

  useEffect(() => {
    ambientRef.current = new AmbientTone();
    breathingInterval.current = window.setInterval(() => setIsBreathing((b) => !b), 4000);
    return () => {
      ambientRef.current?.stop();
      if (breathingInterval.current) window.clearInterval(breathingInterval.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  function playEntry(entry: MeditationEntry) {
    if (entry.audio_url) {
      const audio = new Audio(entry.audio_url);
      setIsNarrating(true);
      audio.onended = () => setIsNarrating(false);
      audio.play().catch(() => setIsNarrating(false));
    } else {
      speak(
        entry.content,
        () => setIsNarrating(true),
        () => setIsNarrating(false),
      );
    }
  }

  useEffect(() => {
    if (!hasPlayedFirst.current && entries.length > 0) {
      hasPlayedFirst.current = true;
      playEntry(entries[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleAmbient() {
    if (ambientOn) {
      ambientRef.current?.stop();
    } else {
      ambientRef.current?.start();
    }
    setAmbientOn(!ambientOn);
  }

  async function handleSendFollowUp() {
    if (!followUpText.trim() || isSending) return;
    const text = followUpText.trim();
    setFollowUpText("");
    setIsSending(true);
    try {
      const entry = await continueMeditationSession(session.id, text);
      setEntries((prev) => [...prev, entry]);
      playEntry(entry);
    } finally {
      setIsSending(false);
    }
  }

  const isHardship = session.session_type === "hardship";
  const latest = entries[entries.length - 1];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{session.guide.name}</h1>
          <p className="capitalize text-navy-400">{session.session_type.replace("_", " ")} session</p>
        </div>
        <Button variant="secondary" onClick={onEnd}>
          <PhoneOff className="h-4 w-4" /> End session
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center gap-3">
          <MeditationStage tone={session.guide.tone} portraitUrl={session.guide.avatar_image_url} isBreathing={isBreathing} />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAmbient}
              className="flex items-center gap-1.5 rounded-lg border border-navy-100 px-3 py-1.5 text-xs font-medium text-navy-600 hover:bg-navy-50"
            >
              {ambientOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              Ambient sound
            </button>
            {isNarrating && <Badge tone="home">Speaking…</Badge>}
          </div>
          {entries.some((e) => e.is_mock) && <Badge tone="demo">Demo mode</Badge>}
        </div>

        <div className="flex flex-col rounded-xl2 border border-navy-100 bg-cream-100 text-navy-700">
          <div className="max-h-[26rem] flex-1 space-y-4 overflow-y-auto p-5">
            {entries.map((e) => (
              <div key={e.id} className="space-y-2">
                {e.user_text && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-xl2 bg-brand px-4 py-2.5 text-sm text-onbrand">{e.user_text}</div>
                  </div>
                )}
                <p className="whitespace-pre-line text-sm leading-relaxed text-navy-700">{e.content}</p>
              </div>
            ))}
          </div>
          {isHardship && (
            <div className="flex gap-2 border-t border-navy-100 p-3">
              <input
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendFollowUp()}
                placeholder="Keep talking, if it helps…"
                className="flex-1 rounded-lg border border-navy-100 bg-cream-100 px-3 py-2 text-sm text-navy-700 focus:border-navy-400 focus:outline-none"
              />
              <Button size="sm" onClick={handleSendFollowUp} disabled={isSending || !followUpText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
          {!isHardship && latest && (
            <div className="border-t border-navy-100 p-3 text-center">
              <button onClick={() => playEntry(latest)} className="text-sm font-medium text-sage-600 hover:underline">
                Play again
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 max-w-2xl">
        <Disclaimer compact />
      </div>
    </div>
  );
}

export function MeditationPage() {
  const { data: guides = [] } = useQuery({ queryKey: ["meditation-guides"], queryFn: listMeditationGuides });
  const [selectedGuide, setSelectedGuide] = useState<MeditationGuide | null>(null);
  const [session, setSession] = useState<MeditationSession | null>(null);

  async function handleStart(sessionType: SessionType, initialText: string) {
    if (!selectedGuide) return;
    const created = await startMeditationSession(selectedGuide.id, sessionType, initialText);
    setSession(created);
  }

  function handleEnd() {
    setSession(null);
    setSelectedGuide(null);
  }

  if (session) {
    return <SessionView session={session} onEnd={handleEnd} />;
  }

  if (selectedGuide) {
    return <SessionTypePicker guide={selectedGuide} onBack={() => setSelectedGuide(null)} onStart={handleStart} />;
  }

  return <GuidePicker guides={guides} onSelect={setSelectedGuide} />;
}
