import { apiClient } from "./client";

export type UrgencyLevel = "home_care" | "see_doctor_soon" | "emergency";

export interface LikelyCause {
  condition: string;
  probability: "low" | "medium" | "high";
  explanation: string;
}

export interface TriageResult {
  id: number;
  likely_causes: LikelyCause[];
  urgency_level: UrgencyLevel;
  next_steps: string;
  ai_provider_used: string;
  is_mock: boolean;
  created_at: string;
}

export interface TriageIntake {
  main_symptom: string;
  onset: string;
  duration: string;
  severity: string;
  associated_symptoms: string;
}

export interface TriageSession {
  id: number;
  intake_data: TriageIntake;
  result: TriageResult | null;
  created_at: string;
}

export async function createTriageSession(intake_data: TriageIntake) {
  const { data } = await apiClient.post<TriageSession>("/triage/sessions/", { intake_data });
  return data;
}

export async function listTriageSessions() {
  const { data } = await apiClient.get<{ results: TriageSession[] } | TriageSession[]>("/triage/sessions/");
  return Array.isArray(data) ? data : data.results;
}
