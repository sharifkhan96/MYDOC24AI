import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Bell, CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  createLifestyleAssessment,
  getNotificationPreference,
  getTodayCheckIn,
  submitCheckIn,
  updateNotificationPreference,
  type CheckInScale,
  type LifestyleAnswers,
  type LifestyleAssessment,
} from "@/api/lifestyle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { disablePushReminders, enablePushReminders, isPushSupported } from "@/pushNotifications";

import { CheckInChart } from "./CheckInChart";

const FIELDS: { key: keyof LifestyleAnswers; label: string; placeholder: string }[] = [
  { key: "diet", label: "How would you describe your diet?", placeholder: "e.g. Mostly home-cooked, occasional takeout" },
  { key: "sleep", label: "How's your sleep?", placeholder: "e.g. About 6 hours, often interrupted" },
  { key: "activity", label: "How active are you?", placeholder: "e.g. Walk daily, gym twice a week" },
  { key: "stress", label: "How would you rate your stress levels?", placeholder: "e.g. Moderate, mostly from work" },
  { key: "smoking", label: "Do you smoke?", placeholder: "e.g. No / Socially / Daily" },
  { key: "alcohol", label: "How much alcohol do you drink?", placeholder: "e.g. A couple of drinks on weekends" },
];

const initial: LifestyleAnswers = { diet: "", sleep: "", activity: "", stress: "", smoking: "", alcohol: "" };

const CHECKIN_QUESTIONS: { key: "mood" | "energy" | "sleep_quality" | "stress"; label: string }[] = [
  { key: "mood", label: "Mood" },
  { key: "energy", label: "Energy" },
  { key: "sleep_quality", label: "Sleep quality" },
  { key: "stress", label: "Stress" },
];

function ReminderToggle() {
  const queryClient = useQueryClient();
  const { data: preference } = useQuery({ queryKey: ["notification-preference"], queryFn: getNotificationPreference });
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supported = isPushSupported();

  async function handleToggle(checked: boolean) {
    setError(null);
    setIsToggling(true);
    try {
      if (checked) {
        const result = await enablePushReminders();
        if (!result.ok) {
          setError(result.reason ?? "Couldn't enable reminders.");
          return;
        }
      } else {
        await disablePushReminders();
      }
      await updateNotificationPreference({ daily_checkin_enabled: checked });
      queryClient.invalidateQueries({ queryKey: ["notification-preference"] });
    } catch {
      setError("Something went wrong enabling reminders. Please try again.");
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <div className="mt-4 border-t border-navy-100 pt-4">
      <label className="flex items-center gap-2 text-sm text-navy-600">
        <input
          type="checkbox"
          checked={!!preference?.daily_checkin_enabled}
          disabled={!supported || isToggling}
          onChange={(e) => handleToggle(e.target.checked)}
          className="h-4 w-4 rounded border-navy-100"
        />
        <Bell className="h-3.5 w-3.5" />
        Remind me every day
      </label>
      {!supported && <p className="mt-1 text-xs text-navy-400">Notifications aren't supported in this browser.</p>}
      {error && <p className="mt-1 text-xs text-urgent-emergency">{error}</p>}
    </div>
  );
}

function DailyCheckInWidget() {
  const queryClient = useQueryClient();
  const { data: today } = useQuery({ queryKey: ["today-checkin"], queryFn: getTodayCheckIn });
  const [values, setValues] = useState<Record<string, CheckInScale>>({ mood: 3, energy: 3, sleep_quality: 3, stress: 3 });
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await submitCheckIn(values as { mood: CheckInScale; energy: CheckInScale; sleep_quality: CheckInScale; stress: CheckInScale });
      queryClient.invalidateQueries({ queryKey: ["today-checkin"] });
      queryClient.invalidateQueries({ queryKey: ["checkin-report"] });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Today's check-in</CardTitle>
        <CardDescription>A few quick taps, so your trend chart below has something to show.</CardDescription>
      </CardHeader>
      {today ? (
        <p className="text-sm text-sage-600">Done for today. Come back tomorrow.</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CHECKIN_QUESTIONS.map((q) => (
              <div key={q.key}>
                <label className="mb-1 block text-xs font-medium text-navy-600">{q.label}</label>
                <select
                  value={values[q.key]}
                  onChange={(e) => setValues({ ...values, [q.key]: Number(e.target.value) as CheckInScale })}
                  className="w-full rounded-lg border border-navy-100 bg-cream-100 px-2 py-2 text-sm text-navy-700 focus:border-navy-400 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? "Saving…" : "Save today's check-in"}
          </Button>
        </div>
      )}
      <ReminderToggle />
    </Card>
  );
}

export function LifestylePage() {
  const [answers, setAnswers] = useState<LifestyleAnswers>(initial);
  const [assessment, setAssessment] = useState<LifestyleAssessment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createLifestyleAssessment(answers);
      setAssessment(result);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Activity className="h-6 w-6 text-sage-600" />
        <div>
          <h1 className="text-2xl font-semibold">Lifestyle</h1>
          <p className="text-navy-400">Track how you're doing day to day, and get a deeper read whenever you want one.</p>
        </div>
      </div>

      <DailyCheckInWidget />

      <Card className="mb-6">
        <CheckInChart variant="full" />
      </Card>

      {assessment?.report ? (
        <Card>
          <div className="mb-4 flex items-start justify-between">
            <CardTitle className="text-xl">Your lifestyle assessment</CardTitle>
            {assessment.report.is_mock && <Badge tone="demo">Demo mode</Badge>}
          </div>
          <p className="mb-5 text-sm text-navy-600">{assessment.report.summary}</p>

          <div className="space-y-5">
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                <CheckCircle2 className="h-4 w-4 text-sage-600" /> What's working
              </h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-navy-600">
                {assessment.report.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                <TrendingUp className="h-4 w-4 text-urgent-soon" /> Worth improving
              </h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-navy-600">
                {assessment.report.improvement_areas.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                <Lightbulb className="h-4 w-4 text-navy-600" /> Suggestions
              </h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-navy-600">
                {assessment.report.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
          <Button variant="secondary" className="mt-4" onClick={() => setAssessment(null)}>
            Take it again
          </Button>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Full lifestyle assessment</CardTitle>
            <CardDescription>A few honest answers gets you a realistic read on your habits.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-sm font-medium text-navy-600">{f.label}</label>
                <input
                  value={answers[f.key]}
                  onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-navy-100 bg-cream-100 px-3 py-2 text-sm text-navy-700 focus:border-navy-400 focus:outline-none"
                />
              </div>
            ))}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Assessing…" : "Get my assessment"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
