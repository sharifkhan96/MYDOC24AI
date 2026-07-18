import { clsx } from "clsx";

import type { PersonaGender } from "@/api/avatar";

interface AvatarStageProps {
  gender: PersonaGender;
  videoUrl?: string | null;
  portraitUrl?: string | null;
  isSpeaking?: boolean;
}

export function AvatarStage({ gender, videoUrl, portraitUrl, isSpeaking }: AvatarStageProps) {
  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        autoPlay
        playsInline
        className="aspect-square w-full max-w-xs rounded-xl2 border border-navy-100 object-cover shadow-card"
      />
    );
  }

  if (portraitUrl) {
    return (
      <div className="relative aspect-square w-full max-w-xs">
        <span
          className={clsx(
            "absolute inset-0 -m-2 rounded-xl2 bg-sage-600/20 transition-transform duration-500",
            isSpeaking ? "scale-105 animate-pulse" : "scale-100",
          )}
        />
        <img
          src={portraitUrl}
          alt=""
          className="relative aspect-square w-full rounded-xl2 border border-navy-100 object-cover shadow-card"
        />
      </div>
    );
  }

  const skin = gender === "female" ? "#E8C9A8" : "#D9B48F";
  const hair = gender === "female" ? "#2E2320" : "#3A2A1F";

  return (
    <div className="flex aspect-square w-full max-w-xs items-center justify-center rounded-xl2 border border-navy-100 bg-gradient-to-b from-navy-50 to-cream-100 shadow-card">
      <div className="relative">
        <span
          className={clsx(
            "absolute inset-0 -m-4 rounded-full bg-sage-600/20 transition-transform duration-500",
            isSpeaking ? "scale-110 animate-pulse" : "scale-100",
          )}
        />
        <svg width="160" height="160" viewBox="0 0 160 160" className="relative">
          <circle cx="80" cy="80" r="70" className="fill-cream-100 stroke-navy-100" strokeWidth="2" />
          {gender === "female" ? (
            <path d="M40 60 Q80 20 120 60 L120 90 Q80 70 40 90 Z" fill={hair} />
          ) : (
            <path d="M42 58 Q80 32 118 58 L118 72 Q80 58 42 72 Z" fill={hair} />
          )}
          <ellipse cx="80" cy="92" rx="34" ry="38" fill={skin} />
          <circle cx="67" cy="88" r="3.2" fill="#2E2320" />
          <circle cx="93" cy="88" r="3.2" fill="#2E2320" />
          <path
            d={isSpeaking ? "M68 106 Q80 118 92 106" : "M68 108 Q80 114 92 108"}
            stroke="#8A5A45"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M30 150 Q80 118 130 150 L130 160 L30 160 Z" fill="#12293D" />
        </svg>
      </div>
    </div>
  );
}
