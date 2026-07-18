import { useQuery } from "@tanstack/react-query";
import { Plane } from "lucide-react";
import { useState } from "react";

import { createTravelAdvisory, listBulletins, type Bulletin, type DestinationType, type TravelAdvisoryQuery } from "@/api/publicHealth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";

const SEVERITY_TONE = { low: "home", moderate: "soon", high: "emergency" } as const;

const DESTINATION_OPTIONS: { value: DestinationType; label: string }[] = [
  { value: "cold", label: "Cold or snowy" },
  { value: "hot_desert", label: "Hot or desert" },
  { value: "beach_tropical", label: "Beach or tropical" },
  { value: "cruise", label: "Cruise" },
  { value: "forest_jungle", label: "Forest or jungle" },
  { value: "high_altitude", label: "Mountain or high-altitude" },
  { value: "urban_city", label: "Urban or city" },
];

function TravelAdvisor() {
  const [destinationType, setDestinationType] = useState<DestinationType>("beach_tropical");
  const [destinationName, setDestinationName] = useState("");
  const [result, setResult] = useState<TravelAdvisoryQuery | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const query = await createTravelAdvisory({ destination_type: destinationType, destination_name: destinationName });
      setResult(query);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-sage-600" />
          <CardTitle>Planning a trip?</CardTitle>
        </div>
        <CardDescription>Tell us where you're headed, and we'll flag what to watch for and how to stay safe.</CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={destinationType}
          onChange={(e) => setDestinationType(e.target.value as DestinationType)}
          className="rounded-lg border border-navy-100 bg-cream-100 px-3 py-2 text-sm text-navy-700 focus:border-navy-400 focus:outline-none sm:w-56"
        >
          {DESTINATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          value={destinationName}
          onChange={(e) => setDestinationName(e.target.value)}
          placeholder="Place name (optional), e.g. Bali"
          className="flex-1 rounded-lg border border-navy-100 bg-cream-100 px-3 py-2 text-sm text-navy-700 focus:border-navy-400 focus:outline-none"
        />
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Thinking…" : "Get safety guidance"}
        </Button>
      </div>

      {result && (
        <div className="mt-5 border-t border-navy-100 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-navy-700">
              {result.destination_name || DESTINATION_OPTIONS.find((o) => o.value === result.destination_type)?.label}
            </p>
            {result.is_mock && <Badge tone="demo">Demo mode</Badge>}
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-navy-600">{result.advice}</p>
          <div className="mt-4">
            <Disclaimer compact />
          </div>
        </div>
      )}
    </Card>
  );
}

export function PublicHealthPage() {
  const { data: bulletins = [] } = useQuery({ queryKey: ["bulletins"], queryFn: listBulletins });
  const [selected, setSelected] = useState<Bulletin | null>(null);

  if (selected) {
    return (
      <div className="max-w-2xl">
        <button onClick={() => setSelected(null)} className="mb-4 text-sm text-navy-400 hover:text-navy-700">
          ← Back to trending health topics
        </button>
        <Card>
          <div className="mb-3 flex items-start justify-between">
            <CardTitle className="text-xl">{selected.title}</CardTitle>
            <Badge tone={SEVERITY_TONE[selected.severity_level]}>{selected.severity_level}</Badge>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-navy-600">{selected.body}</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Trending health topics</h1>
      <p className="mb-6 text-navy-400">What's active right now, seasonal risks worth knowing about, and how to stay safe.</p>

      <TravelAdvisor />

      <div className="space-y-3">
        {bulletins.map((b) => (
          <button key={b.id} onClick={() => setSelected(b)} className="block w-full text-left">
            <Card className="transition-shadow hover:shadow-lg">
              <div className="mb-1 flex items-start justify-between">
                <CardTitle>{b.title}</CardTitle>
                <Badge tone={SEVERITY_TONE[b.severity_level]}>{b.severity_level}</Badge>
              </div>
              <CardDescription>{b.summary}</CardDescription>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
