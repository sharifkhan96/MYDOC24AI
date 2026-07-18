import { DiseaseEntryBrowser } from "./DiseaseEntryBrowser";

export function EncyclopediaPage() {
  return (
    <DiseaseEntryBrowser
      category="clinical"
      title="Encyclopedia"
      description="The history, severity, and current outlook for common conditions, written in plain language."
      variant="globe"
    />
  );
}
