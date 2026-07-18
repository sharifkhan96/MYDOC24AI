import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getCheckInReport, type CheckInPeriod } from "@/api/lifestyle";
import { useTheme } from "@/features/theme/ThemeContext";

// Categorical palette validated with the dataviz skill's validate_palette.js
// against this app's cream/dark surfaces (both modes pass lightness band,
// chroma floor, CVD separation >=12, and contrast >=3:1).
const METRIC_COLORS = {
  light: { mood: "#2F6FA8", energy: "#1F9E5C", sleep_quality: "#8A5FA6", stress: "#B08A3D" },
  dark: { mood: "#4A8BC7", energy: "#2FA968", sleep_quality: "#A672C9", stress: "#B8862E" },
};

const METRIC_LABELS: Record<string, string> = {
  mood: "Mood",
  energy: "Energy",
  sleep_quality: "Sleep",
  stress: "Stress",
};

const PERIODS: { value: CheckInPeriod; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

function FullChart() {
  const [period, setPeriod] = useState<CheckInPeriod>("week");
  const { resolvedTheme } = useTheme();
  const colors = METRIC_COLORS[resolvedTheme];
  const { data } = useQuery({ queryKey: ["checkin-report", period], queryFn: () => getCheckInReport(period) });

  const gridColor = resolvedTheme === "dark" ? "#2d3c4a" : "#e5ded2";
  const tickColor = resolvedTheme === "dark" ? "#8c9ba8" : "#8a9199";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-medium text-navy-700">Your check-ins</h3>
          {data?.comparison && <p className="text-sm text-navy-400">{data.comparison}</p>}
        </div>
        <div className="flex rounded-lg border border-navy-100 bg-cream-100 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                period === p.value ? "bg-brand text-onbrand" : "text-navy-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {data && data.entry_count > 0 ? (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data.data_points} barGap={2} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: tickColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ backgroundColor: resolvedTheme === "dark" ? "#16232f" : "#ffffff", border: "1px solid " + gridColor, borderRadius: 8, fontSize: 13 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value) => METRIC_LABELS[value] ?? value} />
              {(Object.keys(METRIC_LABELS) as (keyof typeof colors)[]).map((metric) => (
                <Bar key={metric} dataKey={metric} name={metric} fill={colors[metric]} radius={[3, 3, 0, 0]} maxBarSize={18} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-navy-400">No check-ins yet for this period.</p>
      )}
    </div>
  );
}

export function CheckInChart({ variant = "full" }: { variant?: "full" | "compact" }) {
  const { resolvedTheme } = useTheme();
  const { data } = useQuery({
    queryKey: ["checkin-report", "week"],
    queryFn: () => getCheckInReport("week"),
    enabled: variant === "compact",
  });

  if (variant === "full") return <FullChart />;

  if (!data || data.entry_count === 0) {
    return <p className="text-sm text-navy-400">Complete a daily check-in to start seeing your trend here.</p>;
  }

  const scorePoints = data.data_points.map((p) => ({
    label: p.label,
    score:
      p.mood !== null && p.energy !== null && p.sleep_quality !== null && p.stress !== null
        ? Math.round(((p.mood + p.energy + p.sleep_quality + (6 - p.stress)) / 4) * 10) / 10
        : null,
  }));
  const barColor = resolvedTheme === "dark" ? "#6FA383" : "#456B58";

  return (
    <div style={{ width: "100%", height: 120 }}>
      <ResponsiveContainer>
        <BarChart data={scorePoints} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} stroke="currentColor" className="text-navy-400" />
          <YAxis domain={[0, 5]} hide />
          <Tooltip
            contentStyle={{ backgroundColor: resolvedTheme === "dark" ? "#16232f" : "#ffffff", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: resolvedTheme === "dark" ? "#e6ecf0" : "#12293D" }}
          />
          <Bar dataKey="score" name="Wellbeing score" fill={barColor} radius={[3, 3, 0, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
