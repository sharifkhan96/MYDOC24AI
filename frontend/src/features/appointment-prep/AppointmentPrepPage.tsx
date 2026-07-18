import { Check, ClipboardPlus, Copy, FileText, MessageCircle, ScanLine } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

import { createAppointmentBrief, type AppointmentBrief, type AppointmentBriefItem } from "@/api/appointmentPrep";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { EmptyState } from "@/components/ui/EmptyState";

function BriefItems({ title, items, emptyMessage }: { title: string; items: AppointmentBriefItem[]; emptyMessage: string }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-navy-700">{title}</h3>
      <div className="mt-2 space-y-2">
        {items.length ? items.map((item, index) => (
          <div key={`${item.source}-${item.title}-${index}`} className="rounded-lg border border-navy-100 bg-cream-100 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-navy-700">{item.title}</p>
              <Badge>{item.source}</Badge>
            </div>
            <p className="mt-1 text-sm leading-6 text-navy-600">{item.detail}</p>
          </div>
        )) : <p className="rounded-lg bg-navy-50 px-3 py-2.5 text-sm text-navy-400">{emptyMessage}</p>}
      </div>
    </section>
  );
}

export function AppointmentPrepPage() {
  const [searchParams] = useSearchParams();
  const reasonFromRoute = searchParams.get("reason") ?? "";
  const [reason, setReason] = useState("");
  const [brief, setBrief] = useState<AppointmentBrief | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const prepareBrief = useCallback(async (reasonToUse: string) => {
    setError(null);
    setIsPreparing(true);
    try {
      setBrief(await createAppointmentBrief(reasonToUse));
      setCopied(false);
    } catch {
      setError("We could not prepare your appointment brief. Please try again.");
    } finally {
      setIsPreparing(false);
    }
  }, []);

  useEffect(() => {
    if (!reasonFromRoute) return;
    setReason(reasonFromRoute);
    void prepareBrief(reasonFromRoute);
  }, [prepareBrief, reasonFromRoute]);

  async function handlePrepareBrief(event: FormEvent) {
    event.preventDefault();
    await prepareBrief(reason);
  }

  async function copyBrief() {
    if (!brief) return;
    await navigator.clipboard.writeText(brief.summary_text);
    setCopied(true);
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <ClipboardPlus className="h-6 w-6 text-sage-600" />
        <div>
          <h1 className="text-2xl font-semibold">Appointment prep</h1>
          <p className="text-navy-400">Bring your recent health details together before you speak with a doctor.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What would you like to discuss?</CardTitle>
          <CardDescription>Add the main reason for your appointment and we will prepare a summary from your existing health record.</CardDescription>
        </CardHeader>
        <form onSubmit={handlePrepareBrief} className="space-y-3">
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            placeholder="For example: I have had recurring headaches and want to discuss safe pain relief."
            className="w-full rounded-lg border border-navy-100 bg-cream-100 px-3 py-2 text-sm text-navy-700 focus:border-navy-400 focus:outline-none"
          />
          {error && <p className="text-sm text-urgent-emergency">{error}</p>}
          <Button type="submit" disabled={isPreparing}>
            <FileText className="h-4 w-4" /> {isPreparing ? "Preparing..." : "Prepare my brief"}
          </Button>
        </form>
      </Card>

      {!brief && (
        <div className="mt-6">
          <EmptyState icon={ClipboardPlus} title="Your appointment brief will appear here" description="It will include the health details and recent updates that may be useful to discuss with a clinician." />
        </div>
      )}

      {brief && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Your appointment brief</CardTitle>
                  <CardDescription>Review this with your doctor or copy it into your appointment notes.</CardDescription>
                </div>
                <Button variant="secondary" size="sm" onClick={copyBrief}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy brief"}
                </Button>
              </div>

              <div className="rounded-lg bg-sage-100/50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">Main concern</p>
                <p className="mt-1 text-sm leading-6 text-navy-700">{brief.main_concern}</p>
              </div>

              <div className="mt-6 space-y-6">
                <BriefItems title="Health details to share" items={brief.health_details} emptyMessage="No health details have been added yet." />
                <BriefItems title="Recent updates" items={brief.recent_updates} emptyMessage="No recent symptom checks, uploads, or health conversations to include." />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Questions to discuss</CardTitle>
                <CardDescription>Use these to guide the conversation with your clinician.</CardDescription>
              </CardHeader>
              <ol className="space-y-3">
                {brief.questions.map((question, index) => (
                  <li key={question} className="flex gap-3 text-sm leading-6 text-navy-600">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-50 text-xs font-medium text-navy-700">{index + 1}</span>
                    {question}
                  </li>
                ))}
              </ol>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Information included</CardTitle>
                <CardDescription>This brief uses only information already in your MyDoc24 account.</CardDescription>
              </CardHeader>
              <div className="space-y-3 text-sm text-navy-600">
                {brief.sources.map((source) => (
                  <div key={source.label} className="flex items-center justify-between">
                    <span>{source.label}</span>
                    <Badge>{source.count} {source.count === 1 ? "item" : "items"}</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-2 text-xs text-navy-400">
                <ScanLine className="h-3.5 w-3.5 shrink-0" />
                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Photo reviews and saved discussions are included when available.</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      <div className="mt-6 max-w-3xl">
        <Disclaimer compact />
      </div>
    </div>
  );
}
