import { Bot, Send, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { sendEphemeralMessage, type EphemeralTurn } from "@/api/conversations";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";

const STARTERS = ["Help me understand my symptoms", "Explain my medication", "How can I sleep better?", "What can I do for a headache?"];

export function MyDoc24Assistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<EphemeralTurn[]>([]);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  async function ask(value = question) {
    const message = value.trim();
    if (!message || sending) return;
    const next = [...turns, { role: "user" as const, content: message }];
    setTurns(next);
    setQuestion("");
    setSending(true);
    try {
      const response = await sendEphemeralMessage(turns, message);
      setTurns([...next, { role: "assistant", content: response.reply }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-onbrand shadow-card hover:opacity-90">
        <Sparkles className="h-4 w-4" /> Ask MyDoc24
      </button>
      <Modal open={open} onOpenChange={setOpen} title="Ask MyDoc24">
        <p className="mb-3 text-sm text-navy-600">Ask by typing, speaking, or uploading a photo or document.</p>
        <div className="max-h-72 space-y-3 overflow-y-auto rounded-xl bg-navy-50/70 p-3">
          {turns.length === 0 ? (
            <div className="py-5 text-center text-sm text-navy-600"><Bot className="mx-auto mb-2 h-7 w-7 text-sage-600" />What would you like help with?</div>
          ) : turns.map((turn, index) => <p key={index} className={`rounded-lg p-2.5 text-sm ${turn.role === "user" ? "ml-8 bg-brand text-onbrand" : "mr-4 bg-cream-100 text-navy-700"}`}>{turn.content}</p>)}
        </div>
        {turns.length === 0 && <div className="my-3 flex flex-wrap gap-2">{STARTERS.map((starter) => <button key={starter} onClick={() => ask(starter)} className="rounded-full border border-navy-100 bg-cream-100 px-3 py-1.5 text-xs text-navy-700 hover:bg-navy-50">{starter}</button>)}</div>}
        <button onClick={() => { setOpen(false); navigate("/app/uploads"); }} className="my-3 inline-flex items-center gap-2 text-sm font-medium text-navy-700 underline"><Upload className="h-4 w-4" />Upload a photo or file</button>
        <form onSubmit={(event) => { event.preventDefault(); void ask(); }} className="flex gap-2">
          <VoiceInputButton onTranscript={(text) => setQuestion((current) => `${current} ${text}`.trim())} />
          <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Type your question…" className="min-w-0 flex-1 rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none" />
          <Button type="submit" size="sm" disabled={sending || !question.trim()}><Send className="h-4 w-4" /></Button>
        </form>
      </Modal>
    </>
  );
}
