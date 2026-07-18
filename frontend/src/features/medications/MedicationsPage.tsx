import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Pill, Search } from "lucide-react";
import { useState } from "react";

import { getMedication, lookupMedication, searchMedications, type MedicationDetail } from "@/api/medications";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { EmptyState } from "@/components/ui/EmptyState";

function DetailSection({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold text-navy-700">{title}</h4>
      <p className="mt-1 text-sm text-navy-600">{body}</p>
    </div>
  );
}

export function MedicationsPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MedicationDetail | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const { data: results } = useQuery({
    queryKey: ["medication-search", query],
    queryFn: () => searchMedications(query),
    enabled: query.trim().length > 1,
  });

  async function handleSelectResult(id: number) {
    const detail = await getMedication(id);
    setSelected(detail);
  }

  async function handleLookup() {
    if (!query.trim()) return;
    setIsLookingUp(true);
    try {
      const detail = await lookupMedication(query.trim());
      setSelected(detail);
    } finally {
      setIsLookingUp(false);
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Medications</h1>
      <p className="mb-6 text-navy-400">
        Search a medication for dosing, how to take it, interactions, and what to do about a missed dose.
      </p>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="Search by name, e.g. ibuprofen"
            className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 py-2.5 pl-9 pr-3 text-sm focus:border-navy-400 focus:outline-none"
          />
        </div>
        <Button onClick={handleLookup} disabled={isLookingUp || !query.trim()}>
          {isLookingUp ? "Looking up…" : "Look up"}
        </Button>
      </div>

      {results && results.length > 0 && !selected && (
        <div className="mb-6 space-y-2">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelectResult(r.id)}
              className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-4 py-3 text-left text-sm hover:bg-navy-50"
            >
              <span className="font-medium text-navy-700">{r.name}</span>
              {r.generic_name && <span className="ml-2 text-navy-400">({r.generic_name})</span>}
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <Card>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{selected.name}</CardTitle>
              {selected.generic_name && <CardDescription>{selected.generic_name} · {selected.drug_class}</CardDescription>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelected(null)} className="text-sm text-navy-400 hover:underline">
                Close
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <DetailSection title="Adult dosing" body={selected.adult_dosing} />
            <DetailSection title="Pediatric dosing" body={selected.pediatric_dosing} />
            <DetailSection title="How to take it" body={selected.how_to_take} />
            <DetailSection title="Food and alcohol interactions" body={selected.food_alcohol_interactions} />
            <DetailSection title="Common side effects" body={selected.common_side_effects} />
            <DetailSection title="Serious side effects" body={selected.serious_side_effects} />
            <DetailSection title="Missed a dose?" body={selected.missed_dose_guidance} />
            {selected.interaction_warnings?.length > 0 && (
              <div>
                <h4 className="flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                  <AlertTriangle className="h-3.5 w-3.5 text-urgent-soon" />
                  Watch for interactions with
                </h4>
                <ul className="mt-1 list-inside list-disc text-sm text-navy-600">
                  {selected.interaction_warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Disclaimer compact />
          </div>
        </Card>
      ) : (
        !results?.length && (
          <EmptyState
            icon={Pill}
            title="Search for a medication"
            description="Try a common one like ibuprofen, amoxicillin, or metformin."
          />
        )
      )}
    </div>
  );
}
