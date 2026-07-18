import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-navy-100 bg-cream-100/60 px-6 py-16 text-center">
      <Icon className="mb-4 h-8 w-8 text-navy-400" />
      <h3 className="font-serif text-lg font-medium text-navy-700">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-navy-400">{description}</p>
    </div>
  );
}
