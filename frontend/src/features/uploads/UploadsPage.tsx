import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, FileText, ScanLine } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { listMedia, uploadMedia, type MediaKind, type UploadedMedia } from "@/api/media";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileDropzone } from "@/components/ui/FileDropzone";

const KIND_OPTIONS: { value: MediaKind; label: string; accept: string }[] = [
  { value: "skin_image", label: "Skin photo", accept: "image/*" },
  { value: "xray", label: "X-ray image", accept: "image/*" },
  { value: "lab_report", label: "Lab report (PDF)", accept: "application/pdf,image/*" },
  { value: "prescription", label: "Prescription (PDF)", accept: "application/pdf,image/*" },
  { value: "discharge_summary", label: "Discharge summary (PDF)", accept: "application/pdf,image/*" },
];

export function UploadsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [kind, setKind] = useState<MediaKind>("skin_image");
  const [isUploading, setIsUploading] = useState(false);
  const [current, setCurrent] = useState<UploadedMedia | null>(null);

  const { data: history = [] } = useQuery({ queryKey: ["media"], queryFn: listMedia });
  const selectedOption = KIND_OPTIONS.find((o) => o.value === kind)!;

  async function handleFile(file: File) {
    setIsUploading(true);
    try {
      const result = await uploadMedia(file, kind);
      setCurrent(result);
      queryClient.invalidateQueries({ queryKey: ["media"] });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <ScanLine className="h-6 w-6 text-sage-600" />
        <div>
          <h1 className="text-2xl font-semibold">Photo & test review</h1>
          <p className="text-navy-400">Upload a photo or a document for a structured read.</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-navy-600">What are you uploading?</label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as MediaKind)}
          className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none sm:w-72"
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <FileDropzone
        accept={selectedOption.accept}
        label={isUploading ? "Analyzing…" : "Drop a file here, or click to browse"}
        onFileSelected={handleFile}
      />

      {current?.analysis && (
        <Card className="mt-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <CardTitle>{KIND_OPTIONS.find((o) => o.value === current.kind)?.label}</CardTitle>
              <CardDescription>Reviewed just now</CardDescription>
            </div>
            <div className="flex gap-2">
              {current.analysis.flagged_for_clinician && (
                <Badge tone="soon">
                  <AlertTriangle className="h-3 w-3" /> Worth a clinician's review
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-navy-600">{current.analysis.summary}</p>
          {current.analysis.structured_findings?.length > 0 && (
            <div className="mt-4 space-y-2">
              {current.analysis.structured_findings.map((f, i) => (
                <div key={i} className="rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2">
                  <p className="text-sm font-medium text-navy-700">{f.label}</p>
                  <p className="text-sm text-navy-600">{f.detail}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6">
            <Disclaimer compact />
          </div>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => navigate(`/app/appointment-prep?${new URLSearchParams({ reason: `I would like to discuss the findings from my ${KIND_OPTIONS.find((option) => option.value === current.kind)?.label.toLowerCase() ?? "recent upload"}.` })}`)}
          >
            Prepare for an appointment
          </Button>
        </Card>
      )}

      {!current && (
        <div className="mt-6">
          <EmptyState icon={FileText} title="Nothing reviewed yet" description="Upload a file above to see a structured read here." />
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-2 text-sm font-semibold text-navy-700">Previous uploads</h3>
          <div className="space-y-2">
            {history.map((m) => (
              <button
                key={m.id}
                onClick={() => setCurrent(m)}
                className="flex w-full items-center justify-between rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-4 py-2.5 text-left text-sm hover:bg-navy-50"
              >
                <span>{KIND_OPTIONS.find((o) => o.value === m.kind)?.label}</span>
                <span className="text-navy-400">{new Date(m.created_at).toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
