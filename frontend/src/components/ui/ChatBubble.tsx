import { clsx } from "clsx";
import type { ReactNode } from "react";

export function ChatBubble({ role, children }: { role: "user" | "assistant"; children: ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[75%] rounded-xl2 px-4 py-2.5 text-sm leading-relaxed",
          isUser ? "bg-brand text-onbrand" : "border border-navy-100 bg-cream-100 text-navy-700",
        )}
      >
        {children}
      </div>
    </div>
  );
}
