import { Compass, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";

import {
  createRoleModelQuery,
  createWellbeingRecommendationQuery,
  type RoleModelQuery,
  type WellbeingRecommendationQuery,
} from "@/api/encyclopedia";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DiseaseEntryBrowser } from "@/features/encyclopedia/DiseaseEntryBrowser";

type Tab = "explore" | "role-model" | "for-you";

const TABS: { value: Tab; label: string; icon: typeof Compass }[] = [
  { value: "explore", label: "Explore", icon: Compass },
  { value: "role-model", label: "Role model", icon: UserRound },
  { value: "for-you", label: "For you", icon: Sparkles },
];

function RoleModelTab() {
  const [name, setName] = useState("");
  const [result, setResult] = useState<RoleModelQuery | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const query = await createRoleModelQuery(name.trim());
      setResult(query);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Who inspires you?</CardTitle>
          <CardDescription>Name anyone, real or well known, and get an illustrative look at their routine and habits.</CardDescription>
        </CardHeader>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. a favorite athlete, author, or public figure"
            className="flex-1 rounded-lg border border-navy-100 bg-cream-100 px-3 py-2 text-sm text-navy-700 focus:border-navy-400 focus:outline-none"
          />
          <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? "Thinking…" : "Get inspired"}
          </Button>
        </div>
      </Card>

      {result && (
        <Card>
          <div className="mb-3 flex items-start justify-between">
            <CardTitle className="text-xl">{result.name}</CardTitle>
            {result.is_mock && <Badge tone="demo">Demo mode</Badge>}
          </div>
          <div className="mb-4 rounded-lg border border-navy-100 bg-navy-50/60 px-3 py-2 text-xs text-navy-400">
            AI-generated, illustrative overview inspired by public perception of {result.name}. Not verified biographical
            fact.
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-navy-700">A day in their world</h4>
              <p className="mt-1 text-sm leading-relaxed text-navy-600">{result.content.routine}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-navy-700">Habits</h4>
              <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-navy-600">
                {result.content.habits?.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-navy-700">Philosophy</h4>
              <p className="mt-1 text-sm leading-relaxed text-navy-600">{result.content.philosophy}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function ForYouTab() {
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState<WellbeingRecommendationQuery | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!goal.trim()) return;
    setIsSubmitting(true);
    try {
      const query = await createWellbeingRecommendationQuery(goal.trim());
      setResult(query);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What are you hoping to improve?</CardTitle>
          <CardDescription>Popular, evidence-informed approaches tailored to what you're after.</CardDescription>
        </CardHeader>
        <div className="flex gap-2">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. more energy, clearer skin, better sleep"
            className="flex-1 rounded-lg border border-navy-100 bg-cream-100 px-3 py-2 text-sm text-navy-700 focus:border-navy-400 focus:outline-none"
          />
          <Button onClick={handleSubmit} disabled={isSubmitting || !goal.trim()}>
            {isSubmitting ? "Thinking…" : "Get recommendations"}
          </Button>
        </div>
      </Card>

      {result && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>For "{result.goal}"</CardTitle>
            {result.is_mock && <Badge tone="demo">Demo mode</Badge>}
          </div>
          <ul className="space-y-3">
            {result.content.recommendations?.map((r, i) => (
              <li key={i} className="rounded-lg border border-navy-100 bg-cream-100 px-3 py-2.5 text-sm text-navy-600">
                {r}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export function WellbeingPage() {
  const [tab, setTab] = useState<Tab>("explore");

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-semibold">Wellbeing & beauty</h1>
        <p className="text-navy-400">Evidence-based, unhurried guidance on skin, sleep, hair, and everyday wellbeing.</p>
      </div>

      <div className="mb-6 flex gap-1 rounded-lg border border-navy-100 bg-cream-100 p-1">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === value ? "bg-brand text-onbrand" : "text-navy-600 hover:bg-navy-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "explore" && (
        <DiseaseEntryBrowser
          category="wellbeing"
          title="Wellbeing & beauty"
          description="Evidence-based, unhurried guidance on skin, sleep, hair, and everyday wellbeing."
          hideHeader
        />
      )}
      {tab === "role-model" && <RoleModelTab />}
      {tab === "for-you" && <ForYouTab />}
    </div>
  );
}
