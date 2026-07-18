import { apiClient } from "./client";

export interface AppointmentBriefItem {
  title: string;
  detail: string;
  source: string;
}

export interface AppointmentBriefSource {
  label: string;
  count: number;
}

export interface AppointmentBrief {
  main_concern: string;
  health_details: AppointmentBriefItem[];
  recent_updates: AppointmentBriefItem[];
  questions: string[];
  sources: AppointmentBriefSource[];
  summary_text: string;
}

export async function createAppointmentBrief(reason: string) {
  const { data } = await apiClient.post<AppointmentBrief>("/appointment-prep/brief/", { reason });
  return data;
}
