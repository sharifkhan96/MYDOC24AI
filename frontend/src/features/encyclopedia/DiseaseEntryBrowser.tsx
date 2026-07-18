import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

import {
  getEncyclopediaEntry,
  listEncyclopediaEntries,
  type DiseaseEntryDetail,
  type EntryCategory,
} from "@/api/encyclopedia";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";

function Section({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-navy-700">{title}</h4>
      <p className="mt-1 text-sm leading-relaxed text-navy-600">{body}</p>
    </div>
  );
}

export function DiseaseEntryBrowser({
  category,
  title,
  description,
  hideHeader = false,
}: {
  category: EntryCategory;
  title: string;
  description: string;
  hideHeader?: boolean;
}) {
  const { data: entries = [] } = useQuery({
    queryKey: ["encyclopedia", category],
    queryFn: () => listEncyclopediaEntries(category),
  });
  const [detail, setDetail] = useState<DiseaseEntryDetail | null>(null);

  async function openEntry(slug: string) {
    const d = await getEncyclopediaEntry(slug);
    setDetail(d);
  }

  if (detail) {
    return (
      <div className="max-w-2xl">
        <button onClick={() => setDetail(null)} className="mb-4 flex items-center gap-1 text-sm text-navy-400 hover:text-navy-700">
          <ChevronLeft className="h-4 w-4" /> Back to {title.toLowerCase()}
        </button>
        <Card>
          <CardTitle className="text-xl">{detail.name}</CardTitle>
          <p className="mb-4 mt-2 text-sm text-navy-600">{detail.overview}</p>
          <Section title="History" body={detail.history} />
          <Section title="How serious is it" body={detail.severity_mortality_context} />
          <Section title="How treatment has evolved" body={detail.treatment_evolution} />
          <Section title="Current outlook" body={detail.current_outlook} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      {!hideHeader && (
        <>
          <h1 className="mb-1 text-2xl font-semibold">{title}</h1>
          <p className="mb-6 text-navy-400">{description}</p>
        </>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {entries.map((e) => (
          <button key={e.id} onClick={() => openEntry(e.slug)} className="text-left">
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardTitle>{e.name}</CardTitle>
              <CardDescription className="line-clamp-3">{e.overview}</CardDescription>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
