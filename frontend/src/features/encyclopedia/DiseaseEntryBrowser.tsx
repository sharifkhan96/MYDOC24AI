import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ChevronLeft, Globe2, Search, Sparkles } from "lucide-react";
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
  variant = "standard",
}: {
  category: EntryCategory;
  title: string;
  description: string;
  hideHeader?: boolean;
  variant?: "standard" | "globe";
}) {
  const { data: entries = [] } = useQuery({
    queryKey: ["encyclopedia", category],
    queryFn: () => listEncyclopediaEntries(category),
  });
  const [detail, setDetail] = useState<DiseaseEntryDetail | null>(null);
  const [search, setSearch] = useState("");
  const filteredEntries = entries.filter((entry) => entry.name.toLowerCase().includes(search.trim().toLowerCase()));

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
      {variant === "globe" && (
        <>
          <section className="relative mb-10 overflow-hidden rounded-xl2 border border-navy-100 bg-gradient-to-br from-navy-800 via-navy-700 to-sage-800 px-6 py-8 text-onbrand shadow-card sm:px-10 sm:py-10">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-cream-100/10" />
            <div className="absolute -right-5 top-12 h-52 w-52 rounded-full border border-cream-100/10" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream-100/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sage-100"><Sparkles className="h-3.5 w-3.5" /> MyDoc24 knowledge</div>
                <h1 className="max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">Explore health topics with clarity.</h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-navy-100 sm:text-base">Plain-language guides to common conditions, from background and symptoms to treatment and outlook.</p>
                <div className="relative mt-6 max-w-xl"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search health topics" className="w-full rounded-xl border border-cream-100/20 bg-cream-100 px-10 py-3 text-sm text-navy-700 shadow-sm outline-none placeholder:text-navy-400" /></div>
              </div>
              <div className="relative mx-auto hidden h-72 w-72 lg:block">
                <div className="absolute inset-0 animate-[spin_40s_linear_infinite] rounded-full border border-sage-200/40" />
                <div className="absolute inset-4 rounded-full border border-sage-100/30" />
                <div className="absolute inset-9 rounded-full bg-gradient-to-br from-sage-300 via-sage-500 to-navy-600 shadow-[0_0_60px_rgba(155,199,174,0.4)]" />
                <div className="absolute left-14 top-16 h-20 w-28 rounded-[50%] bg-sage-100/20 blur-md" />
                <Globe2 className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-cream-100/90" />
                {entries.slice(0, 5).map((entry, index) => {
                  const positions = ["-left-8 top-8", "right-[-2rem] top-14", "-right-9 bottom-14", "left-0 bottom-0", "left-1/2 -top-3 -translate-x-1/2"];
                  return <button key={entry.id} onClick={() => openEntry(entry.slug)} className={`absolute whitespace-nowrap rounded-full border border-cream-100/25 bg-navy-900/35 px-2.5 py-1 text-xs font-medium text-cream-100 backdrop-blur ${positions[index]}`}>{entry.name}</button>;
                })}
              </div>
            </div>
          </section>
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage-700">Browse topics</p><h2 className="mt-1 text-2xl font-semibold text-navy-700">Popular health guides</h2></div><p className="text-sm text-navy-400">{filteredEntries.length} topics</p></div>
        </>
      )}
      {!hideHeader && (
        variant !== "globe" && <>
          <h1 className="mb-1 text-2xl font-semibold">{title}</h1>
          <p className="mb-6 text-navy-400">{description}</p>
        </>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filteredEntries.map((e) => (
          <button key={e.id} onClick={() => openEntry(e.slug)} className="text-left">
            <Card className="group h-full transition-all hover:-translate-y-0.5 hover:border-sage-200 hover:shadow-lg">
              <div className="flex items-start justify-between gap-3"><CardTitle>{e.name}</CardTitle><ArrowUpRight className="h-4 w-4 shrink-0 text-sage-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div>
              <CardDescription className="line-clamp-3">{e.overview}</CardDescription>
            </Card>
          </button>
        ))}
        {filteredEntries.length === 0 && <div className="rounded-xl border border-dashed border-navy-200 p-8 text-center text-sm text-navy-400 sm:col-span-2">No topics match that search yet.</div>}
      </div>
    </div>
  );
}
