import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BrainCircuit, Clock, MessageCircle, Plus, ShieldOff, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  sendEphemeralMessage,
  sendMessage,
  type ConversationDetail,
  type EphemeralTurn,
} from "@/api/conversations";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { EmptyState } from "@/components/ui/EmptyState";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";
import type { PatientMemory } from "@/api/memory";

type Mode = "permanent" | "temporary";

function ChatInput({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
      }}
      className="flex gap-2 border-t border-navy-100 p-3"
    >
      <VoiceInputButton onTranscript={(transcript) => setText((current) => `${current} ${transcript}`.trim())} />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message…"
        className="flex-1 rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
      />
      <Button type="submit" size="sm" disabled={disabled || !text.trim()}>
        Send
      </Button>
    </form>
  );
}

function useAutoScroll(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [dep]);
  return ref;
}

function PermanentChat() {
  const queryClient = useQueryClient();
  const { data: conversations = [] } = useQuery({ queryKey: ["conversations"], queryFn: listConversations });
  const [activeId, setActiveId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [lastMemoryUsed, setLastMemoryUsed] = useState<PatientMemory[]>([]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useAutoScroll(detail?.messages.length);

  async function openConversation(id: number) {
    setActiveId(id);
    setLastMemoryUsed([]);
    const d = await getConversation(id);
    setDetail(d);
  }

  async function handleNewChat() {
    const created = await createConversation();
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    await openConversation(created.id);
  }

  async function handleDelete(id: number) {
    await deleteConversation(id);
    if (activeId === id) {
    setActiveId(null);
    setDetail(null);
    setLastMemoryUsed([]);
    }
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }

  async function handleSend(text: string) {
    if (!activeId) return;
    setIsSending(true);
    setDetail((prev) =>
      prev ? { ...prev, messages: [...prev.messages, { id: Date.now(), role: "user", content: text, ai_provider_used: "", is_mock: false, created_at: "" }] } : prev,
    );
    try {
      const { assistant_message, memory_used } = await sendMessage(activeId, text);
      setLastMemoryUsed(memory_used);
      const fresh = await getConversation(activeId);
      setDetail(fresh);
      void assistant_message;
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-14rem)] gap-4">
      <div className="w-64 shrink-0 overflow-y-auto rounded-xl2 border border-navy-100 bg-cream-100 text-navy-700 p-3">
        <Button size="sm" className="mb-3 w-full" onClick={handleNewChat}>
          <Plus className="h-4 w-4" /> New chat
        </Button>
        <div className="space-y-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-sm ${
                activeId === c.id ? "bg-brand text-onbrand" : "text-navy-600 hover:bg-navy-50"
              }`}
            >
              <button onClick={() => openConversation(c.id)} className="flex-1 truncate text-left">
                {c.title || "Untitled chat"}
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                aria-label="Delete chat"
                className="opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {conversations.length === 0 && <p className="px-2.5 py-2 text-sm text-navy-400">No saved chats yet.</p>}
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-xl2 border border-navy-100 bg-cream-100 text-navy-700">
        {detail ? (
          <>
            <div className="border-b border-sage-100 bg-sage-100/40 px-4 py-2.5 text-xs text-navy-600">
              <div className="flex flex-wrap items-center gap-2">
                <BrainCircuit className="h-3.5 w-3.5 text-sage-600" />
                <span className="font-medium">Memory-aware chat</span>
                <span>Saved health facts are retrieved only when relevant.</span>
                <Link to="/app/memory" className="font-medium underline">Inspect memory</Link>
              </div>
              {lastMemoryUsed.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{lastMemoryUsed.map((memory) => <Badge key={memory.id} tone="demo">Used: {memory.title}</Badge>)}</div>}
            </div>
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {detail.messages.map((m) => (
                <ChatBubble key={m.id} role={m.role}>
                  {m.content}
                </ChatBubble>
              ))}
            </div>
            <ChatInput onSend={handleSend} disabled={isSending} />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState icon={MessageCircle} title="No chat selected" description="Start a new chat or pick one from the list." />
          </div>
        )}
      </div>
    </div>
  );
}

function TemporaryChat() {
  const [messages, setMessages] = useState<EphemeralTurn[]>([]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useAutoScroll(messages.length);

  async function handleSend(text: string) {
    setIsSending(true);
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages(history);
    try {
      const { reply, is_mock } = await sendEphemeralMessage(messages, text);
      setMessages([...history, { role: "assistant", content: is_mock ? `${reply}` : reply }]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col rounded-xl2 border border-navy-100 bg-cream-100 text-navy-700">
      <div className="flex items-center gap-2 border-b border-navy-100 px-4 py-2.5 text-xs text-navy-400">
        <ShieldOff className="h-3.5 w-3.5" />
        This chat is not saved and disappears when you leave or reload the page.
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <EmptyState icon={Clock} title="Private, one-off chat" description="Ask anything. Nothing here is saved to your account." />
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role}>
            {m.content}
          </ChatBubble>
        ))}
      </div>
      <ChatInput onSend={handleSend} disabled={isSending} />
    </div>
  );
}

export function ChatsPage() {
  const [mode, setMode] = useState<Mode>("permanent");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chats</h1>
        <div className="flex rounded-lg border border-navy-100 bg-cream-100 text-navy-700 p-1">
          <button
            onClick={() => setMode("permanent")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${mode === "permanent" ? "bg-brand text-onbrand" : "text-navy-600"}`}
          >
            Saved
          </button>
          <button
            onClick={() => setMode("temporary")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${mode === "temporary" ? "bg-brand text-onbrand" : "text-navy-600"}`}
          >
            Temporary
          </button>
        </div>
      </div>
      {mode === "permanent" ? <PermanentChat /> : <TemporaryChat />}
      <div className="mt-4 max-w-2xl">
        <Disclaimer compact />
      </div>
    </div>
  );
}
