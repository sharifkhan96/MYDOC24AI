import { useQuery } from "@tanstack/react-query";
import { Mic, PhoneOff, Send, Stethoscope } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createAvatarSession,
  endAvatarSession,
  listPersonas,
  pollAvatarTurn,
  sendAvatarTurn,
  type AvatarSession,
  type AvatarTurn,
  type Persona,
} from "@/api/avatar";
import { AvatarStage } from "@/components/ui/AvatarStage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";

function speak(text: string, onStart: () => void, onEnd: () => void) {
  if (!("speechSynthesis" in window)) {
    onStart();
    setTimeout(onEnd, Math.min(6000, text.length * 40));
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function PersonaPicker({ personas, onSelect }: { personas: Persona[]; onSelect: (p: Persona) => void }) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Stethoscope className="h-6 w-6 text-sage-600" />
        <div>
          <h1 className="text-2xl font-semibold">Live doctor</h1>
          <p className="text-navy-400">Choose who you'd like to talk to.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {personas.map((p) => (
          <button key={p.id} onClick={() => onSelect(p)} className="text-left">
            <Card className="flex h-full items-center gap-4 transition-shadow hover:shadow-lg">
              <AvatarStage gender={p.gender} portraitUrl={p.avatar_image_url} />
              <div className="min-w-0">
                <CardTitle>{p.name}</CardTitle>
                <CardDescription className="capitalize">{p.role}</CardDescription>
                <p className="mt-1 text-sm text-navy-400">{p.tagline}</p>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

function ActiveSession({ session, onEnd }: { session: AvatarSession; onEnd: () => void }) {
  const navigate = useNavigate();
  const [turns, setTurns] = useState<AvatarTurn[]>(session.turns);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const pollTimeouts = useRef<number[]>([]);

  useEffect(() => () => pollTimeouts.current.forEach((t) => window.clearTimeout(t)), []);

  function pollForVideo(turnId: number, attempt = 0) {
    if (attempt > 15) return;
    const timeout = window.setTimeout(async () => {
      const updated = await pollAvatarTurn(session.id, turnId);
      setTurns((prev) => prev.map((t) => (t.id === turnId ? updated : t)));
      if (updated.video_status === "processing") pollForVideo(turnId, attempt + 1);
    }, 1500);
    pollTimeouts.current.push(timeout);
  }

  async function handleSend() {
    if (!text.trim() || isSending) return;
    const messageText = text.trim();
    setText("");
    setIsSending(true);
    try {
      const turn = await sendAvatarTurn(session.id, messageText);
      setTurns((prev) => [...prev, turn]);

      if (turn.tts_audio_url) {
        const audio = new Audio(turn.tts_audio_url);
        setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.play().catch(() => setIsSpeaking(false));
      } else {
        speak(
          turn.assistant_text,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false),
        );
      }

      if (turn.video_status === "processing") pollForVideo(turn.id);
    } finally {
      setIsSending(false);
    }
  }

  const latestVideoUrl = [...turns].reverse().find((t) => t.video_url)?.video_url ?? null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{session.persona.name}</h1>
          <p className="text-navy-400 capitalize">{session.persona.role} · live session</p>
        </div>
        <Button variant="secondary" onClick={onEnd}>
          <PhoneOff className="h-4 w-4" /> End session
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center gap-3">
          <AvatarStage
            gender={session.persona.gender}
            videoUrl={latestVideoUrl}
            portraitUrl={session.persona.avatar_image_url}
            isSpeaking={isSpeaking}
          />
          {turns.some((t) => t.is_mock) && <Badge tone="demo">Demo mode</Badge>}
        </div>

        <div className="flex flex-col rounded-xl2 border border-navy-100 bg-cream-100 text-navy-700">
          <div className="max-h-[26rem] flex-1 space-y-3 overflow-y-auto p-4">
            {turns.length === 0 && (
              <p className="text-sm text-navy-400">Say hello, or describe what's on your mind.</p>
            )}
            {turns.map((t) => (
              <div key={t.id} className="space-y-2">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-xl2 bg-brand px-4 py-2.5 text-sm text-onbrand">{t.user_text}</div>
                </div>
                {t.assistant_text && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-xl2 border border-navy-100 bg-cream-100 text-navy-700 px-4 py-2.5 text-sm text-navy-700">
                      {t.assistant_text}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-navy-100 p-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type what you'd like to say…"
              className="flex-1 rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
            />
            <Button
              size="sm"
              variant="secondary"
              aria-label="Voice input"
              title="Voice input is available in supported browsers via your keyboard's dictation key"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleSend} disabled={isSending || !text.trim()} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 max-w-2xl">
        <Disclaimer compact />
      </div>
      {turns.length > 0 && (
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate(`/app/appointment-prep?${new URLSearchParams({ reason: `I would like to discuss: ${turns[turns.length - 1].user_text}` })}`)}
        >
          Prepare for an appointment
        </Button>
      )}
    </div>
  );
}

export function LiveDoctorPage() {
  const { data: personas = [] } = useQuery({ queryKey: ["personas"], queryFn: listPersonas });
  const [session, setSession] = useState<AvatarSession | null>(null);

  async function handleSelect(persona: Persona) {
    const created = await createAvatarSession(persona.id);
    setSession(created);
  }

  async function handleEnd() {
    if (!session) return;
    await endAvatarSession(session.id);
    window.speechSynthesis?.cancel();
    setSession(null);
  }

  if (!session) {
    return <PersonaPicker personas={personas} onSelect={handleSelect} />;
  }

  return <ActiveSession session={session} onEnd={handleEnd} />;
}
