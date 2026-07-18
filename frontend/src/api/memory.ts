import { apiClient } from "./client";

export type MemoryKind = "allergy" | "medication" | "condition" | "symptom" | "preference" | "care_plan";
export type MemorySource = "patient_reported" | "health_profile" | "saved_chat" | "clinician_note" | "demo_seed";
export type MemoryConfidence = "confirmed" | "patient_reported" | "needs_review";

export interface PatientMemory {
  id: number;
  kind: MemoryKind;
  title: string;
  content: string;
  source: MemorySource;
  confidence: MemoryConfidence;
  occurred_on: string | null;
  is_pinned: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemoryContext {
  always: PatientMemory[];
  relevant: PatientMemory[];
  note: string;
}

export async function listMemories() {
  const { data } = await apiClient.get<{ results: PatientMemory[] } | PatientMemory[]>("/memory/");
  return Array.isArray(data) ? data : data.results;
}

export async function createMemory(payload: Pick<PatientMemory, "kind" | "title" | "content" | "is_pinned">) {
  const { data } = await apiClient.post<PatientMemory>("/memory/", payload);
  return data;
}

export async function deleteMemory(id: number) {
  await apiClient.delete(`/memory/${id}/`);
}

export async function getMemoryContext(query: string) {
  const { data } = await apiClient.get<MemoryContext>("/memory/context/", { params: { q: query } });
  return data;
}
