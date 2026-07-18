import { apiClient } from "./client";

export type MediaKind = "skin_image" | "xray" | "lab_report" | "prescription" | "discharge_summary";

export interface AnalysisResult {
  id: number;
  summary: string;
  structured_findings: { label: string; detail: string }[];
  confidence: string;
  flagged_for_clinician: boolean;
  ai_provider_used: string;
  is_mock: boolean;
}

export interface UploadedMedia {
  id: number;
  kind: MediaKind;
  file_url: string;
  content_type: string;
  analysis: AnalysisResult | null;
  created_at: string;
}

export async function uploadMedia(file: File, kind: MediaKind) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);
  const { data } = await apiClient.post<UploadedMedia>("/media/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function listMedia() {
  const { data } = await apiClient.get<{ results: UploadedMedia[] } | UploadedMedia[]>("/media/");
  return Array.isArray(data) ? data : data.results;
}
