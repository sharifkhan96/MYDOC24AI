import { clsx } from "clsx";
import { Leaf } from "lucide-react";

import type { GuideTone } from "@/api/meditation";

const TONE_GRADIENT: Record<GuideTone, string> = {
  funny: "from-amber-100/60 to-sage-100",
  moderate: "from-navy-50 to-sage-100",
  serious: "from-navy-100 to-navy-50",
};

export function MeditationStage({
  tone,
  portraitUrl,
  isBreathing,
}: {
  tone: GuideTone;
  portraitUrl?: string | null;
  isBreathing?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex aspect-square w-full max-w-xs items-center justify-center rounded-xl2 border border-navy-100 bg-gradient-to-b shadow-card",
        TONE_GRADIENT[tone],
      )}
    >
      <div className="relative flex h-40 w-40 items-center justify-center">
        <span
          className={clsx(
            "absolute inset-0 rounded-full bg-sage-600/25 transition-transform ease-in-out",
            isBreathing ? "scale-125 duration-[4000ms]" : "scale-100 duration-[4000ms]",
          )}
        />
        <span
          className={clsx(
            "absolute inset-3 rounded-full bg-sage-600/20 transition-transform ease-in-out",
            isBreathing ? "scale-110 duration-[4000ms]" : "scale-100 duration-[4000ms]",
          )}
        />
        {portraitUrl ? (
          <img src={portraitUrl} alt="" className="relative h-28 w-28 rounded-full object-cover shadow-card" />
        ) : (
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-navy-100 bg-cream-100">
            <Leaf className="h-9 w-9 text-sage-600" />
          </div>
        )}
      </div>
    </div>
  );
}
