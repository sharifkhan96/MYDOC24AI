import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BrainCircuit, Pin, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { createMemory, deleteMemory, getMemoryContext, listMemories, type MemoryKind, type PatientMemory } from "@/api/memory";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

const KIND_LABELS: Record<MemoryKind, string> = {
  allergy: "Allergy / sensitivity",
  medication: "Medication",
  condition: "Condition",
  symptom: "Symptom / event",
  preference: "Care preference",
  care_plan: "Care plan",
};

const SOURCE_LABELS: Record<PatientMemory["source"], string> = {
  patient_reported: "Patient reported",
  health_profile: "Health profile",
  saved_chat: "Saved chat",
  clinician_note: "Clinician note",
  demo_seed: "Health profile",
};

function MemoryFact({ memory, onDelete }: { memory: PatientMemory; onDelete: (id: number) => void }) {
  return (
    <div className="rounded-lg border border-navy-100 bg-cream-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-navy-700">{memory.title}</h3>
            {memory.is_pinned && <Badge tone="emergency"><Pin className="h-3 w-3" /> Important detail</Badge>}
          </div>
          <p className="mt-2 text-sm leading-6 text-navy-600">{memory.content}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Badge>{KIND_LABELS[memory.kind]}</Badge>
            <Badge>{SOURCE_LABELS[memory.source]}</Badge>
            <Badge tone={memory.confidence === "needs_review" ? "soon" : "neutral"}>
              {memory.confidence === "confirmed" ? "Confirmed" : memory.confidence === "needs_review" ? "Needs review" : "Patient reported"}
            </Badge>
          </div>
        </div>
        <button onClick={() => onDelete(memory.id)} aria-label={`Delete ${memory.title}`} className="shrink-0 text-navy-400 hover:text-urgent-emergency">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ContextFacts({ title, facts }: { title: string; facts: PatientMemory[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-navy-700">{title}</h3>
      {facts.length ? (
        <div className="mt-2 space-y-2">
          {facts.map((fact) => (
            <div key={fact.id} className="rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-600">
              <span className="font-medium text-navy-700">{fact.title}:</span> {fact.content}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-navy-400">No additional facts matched this question.</p>
      )}
    </div>
  );
}

export function MemoryPage() {
  const queryClient = useQueryClient();
  const { data: memories = [], isLoading } = useQuery({ queryKey: ["patient-memory"], queryFn: listMemories });
  const [kind, setKind] = useState<MemoryKind>("symptom");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [question, setQuestion] = useState("Can I take ibuprofen for a headache?");
  const [contextQuery, setContextQuery] = useState(question);
  const { data: context } = useQuery({ queryKey: ["memory-context", contextQuery], queryFn: () => getMemoryContext(contextQuery) });

  async function addMemory(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    await createMemory({ kind, title: title.trim(), content: content.trim(), is_pinned: isPinned });
    setTitle("");
    setContent("");
    setIsPinned(false);
    queryClient.invalidateQueries({ queryKey: ["patient-memory"] });
    queryClient.invalidateQueries({ queryKey: ["memory-context"] });
  }

  async function removeMemory(id: number) {
    await deleteMemory(id);
    queryClient.invalidateQueries({ queryKey: ["patient-memory"] });
    queryClient.invalidateQueries({ queryKey: ["memory-context"] });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-sage-600" />
            <h1 className="text-2xl font-semibold">Your health memory</h1>
          </div>
          <p className="mt-1 max-w-2xl text-navy-400">Your ongoing health record, including the details you have shared across MyDoc24.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your health history</CardTitle>
              <CardDescription>{memories.length} active details from your profile, health updates, and conversations.</CardDescription>
            </CardHeader>
            <div className="space-y-3">
              {isLoading ? <p className="text-sm text-navy-400">Loading memory...</p> : memories.map((memory) => <MemoryFact key={memory.id} memory={memory} onDelete={removeMemory} />)}
              {!isLoading && memories.length === 0 && <EmptyState icon={BrainCircuit} title="No memories yet" description="Add a fact to make future saved chats more personal and safe." />}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add a health detail</CardTitle>
              <CardDescription>Keep a symptom, preference, or care update alongside the rest of your health history.</CardDescription>
            </CardHeader>
            <form onSubmit={addMemory} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select value={kind} onChange={(event) => setKind(event.target.value as MemoryKind)} className="rounded-lg border border-navy-100 bg-cream-100 px-3 py-2 text-sm text-navy-700">
                  {Object.entries(KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Short title, e.g. Migraine triggers" className="rounded-lg border border-navy-100 bg-cream-100 px-3 py-2 text-sm text-navy-700" />
              </div>
              <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="What would you like to keep in your health history?" rows={3} className="w-full rounded-lg border border-navy-100 bg-cream-100 px-3 py-2 text-sm text-navy-700" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-navy-600"><input type="checkbox" checked={isPinned} onChange={(event) => setIsPinned(event.target.checked)} /> Mark as an important health detail</label>
                <Button type="submit" size="sm"><Plus className="h-4 w-4" /> Save detail</Button>
              </div>
            </form>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Relevant to your question</CardTitle>
            <CardDescription>Check the health details MyDoc24 would consider before answering.</CardDescription>
          </CardHeader>
          <form onSubmit={(event) => { event.preventDefault(); setContextQuery(question); }} className="space-y-3">
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={3} className="w-full rounded-lg border border-navy-100 bg-cream-100 px-3 py-2 text-sm text-navy-700" />
            <Button type="submit" variant="secondary" size="sm" className="w-full">Check relevant details</Button>
          </form>
          {context && (
            <div className="mt-5 space-y-5">
              <ContextFacts title="Important health details" facts={context.always} />
              <ContextFacts title="Also relevant to this question" facts={context.relevant} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
