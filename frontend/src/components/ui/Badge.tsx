import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type Tone = "neutral" | "emergency" | "soon" | "home" | "demo";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-navy-50 text-navy-600",
  emergency: "bg-urgent-emergency/10 text-urgent-emergency",
  soon: "bg-urgent-soon/10 text-urgent-soon",
  home: "bg-urgent-home/10 text-urgent-home",
  demo: "bg-sage-100 text-sage-600 dark:text-emerald-300",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
