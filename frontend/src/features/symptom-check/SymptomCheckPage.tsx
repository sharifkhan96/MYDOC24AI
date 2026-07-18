import { AlertOctagon, CircleCheck, Stethoscope, TriangleAlert } from "lucide-react";
import { useState, type FormEvent } from "react";

import { createTriageSession, type TriageSession, type UrgencyLevel } from "@/api/triage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";

const URGENCY_META: Record<UrgencyLevel, { label: string; tone: "emergency" | "soon" | "home"; icon: typeof AlertOctagon; message: string }> = {
  emergency: {
    label: "Seek emergency care now",
    tone: "emergency",
    icon: AlertOctagon,
    message: "Based on what you've described, this could be serious. Contact emergency services or go to the nearest emergency department.",
  },
  see_doctor_soon: {
    label: "See a doctor soon",
    tone: "soon",
    icon: TriangleAlert,
    message: "This is worth having a clinician look at in the next day or so, rather than waiting it out.",
  },
  home_care: {
    label: "Likely manageable at home",
    tone: "home",
    icon: CircleCheck,
    message: "This looks like something you can likely manage at home for now, with the steps below.",
  },
};

const initialForm = { main_symptom: "", onset: "", duration: "", severity: "", associated_symptoms: "" };

export function SymptomCheckPage() {
  const [form, setForm] = useState(initialForm);
  const [session, setSession] = useState<TriageSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.main_symptom.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await createTriageSession(form);
      setSession(created);
    } finally {
      setIsSubmitting(false);
    }
  }

  function startOver() {
    setSession(null);
    setForm(initialForm);
  }

  if (session?.result) {
    const meta = URGENCY_META[session.result.urgency_level];
    const Icon = meta.icon;
    return (
      <div className="max-w-2xl">
        <Card>
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Icon className={`h-6 w-6 shrink-0 ${meta.tone === "emergency" ? "text-urgent-emergency" : meta.tone === "soon" ? "text-urgent-soon" : "text-urgent-home"}`} />
              <div>
                <CardTitle>{meta.label}</CardTitle>
                <CardDescription>{meta.message}</CardDescription>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-navy-700">Possible causes</h4>
              <div className="mt-2 space-y-2">
                {session.result.likely_causes.map((cause, i) => (
                  <div key={i} className="rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-navy-700">{cause.condition}</span>
                      <Badge tone="neutral">{cause.probability} likelihood</Badge>
                    </div>
                    <p className="mt-1 text-sm text-navy-600">{cause.explanation}</p>
                  </div>
                ))}
                {session.result.likely_causes.length === 0 && (
                  <p className="text-sm text-navy-400">No specific causes were identified from what you described.</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-navy-700">Next steps</h4>
              <p className="mt-1 whitespace-pre-line text-sm text-navy-600">{session.result.next_steps}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Disclaimer compact />
          </div>
        </Card>
        <Button variant="secondary" className="mt-4" onClick={startOver}>
          Start a new check
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <Stethoscope className="h-6 w-6 text-sage-600" />
        <div>
          <h1 className="text-2xl font-semibold">Symptom check</h1>
          <p className="text-navy-400">Describe what's going on and we'll help you figure out the next step.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl2 border border-navy-100 bg-cream-100 text-navy-700 p-6 shadow-card">
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-600">What's going on?</label>
          <textarea
            required
            rows={3}
            value={form.main_symptom}
            onChange={(e) => setForm({ ...form, main_symptom: e.target.value })}
            placeholder="e.g. Sharp pain in my lower right abdomen"
            className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-600">When did it start?</label>
            <input
              value={form.onset}
              onChange={(e) => setForm({ ...form, onset: e.target.value })}
              placeholder="e.g. Yesterday evening"
              className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-600">How long has it lasted?</label>
            <input
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="e.g. About 12 hours"
              className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-600">How severe is it?</label>
          <select
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
            className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
          >
            <option value="">Select one</option>
            <option value="mild">Mild, noticeable but not limiting</option>
            <option value="moderate">Moderate, hard to ignore</option>
            <option value="severe">Severe, hard to function</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-600">Anything else alongside it?</label>
          <textarea
            rows={2}
            value={form.associated_symptoms}
            onChange={(e) => setForm({ ...form, associated_symptoms: e.target.value })}
            placeholder="e.g. Mild fever, nausea"
            className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Assessing…" : "Get my assessment"}
        </Button>
      </form>
    </div>
  );
}
