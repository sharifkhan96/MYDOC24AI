import { ShieldAlert } from "lucide-react";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="flex items-start gap-2 rounded-lg border border-navy-100 bg-navy-50/60 px-3 py-2 text-xs text-navy-400"
      role="note"
    >
      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p>
        {compact
          ? "Informational guidance, not a diagnosis. In an emergency, contact emergency services immediately."
          : "MyDoc24 provides informational guidance and does not replace care from a licensed clinician. If this may be an emergency, contact emergency services immediately."}
      </p>
    </div>
  );
}
