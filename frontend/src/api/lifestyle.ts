import { apiClient } from "./client";

export interface LifestyleAnswers {
  diet: string;
  sleep: string;
  activity: string;
  stress: string;
  smoking: string;
  alcohol: string;
}

export interface LifestyleReport {
  id: number;
  summary: string;
  strengths: string[];
  improvement_areas: string[];
  suggestions: string[];
  ai_provider_used: string;
  is_mock: boolean;
}

export interface LifestyleAssessment {
  id: number;
  answers: LifestyleAnswers;
  report: LifestyleReport | null;
  created_at: string;
}

export async function createLifestyleAssessment(answers: LifestyleAnswers) {
  const { data } = await apiClient.post<LifestyleAssessment>("/lifestyle/assessments/", { answers });
  return data;
}

export type CheckInScale = 1 | 2 | 3 | 4 | 5;

export interface DailyCheckIn {
  id: number;
  date: string;
  mood: CheckInScale;
  energy: CheckInScale;
  sleep_quality: CheckInScale;
  stress: CheckInScale;
}

export type CheckInPeriod = "week" | "month" | "year";

export interface CheckInDataPoint {
  label: string;
  mood: number | null;
  energy: number | null;
  sleep_quality: number | null;
  stress: number | null;
}

export interface CheckInAverages {
  mood: number | null;
  energy: number | null;
  sleep_quality: number | null;
  stress: number | null;
}

export interface CheckInReport {
  period: CheckInPeriod;
  data_points: CheckInDataPoint[];
  averages: CheckInAverages;
  comparison: string | null;
  entry_count: number;
}

export async function getTodayCheckIn() {
  const { data } = await apiClient.get<DailyCheckIn | null>("/lifestyle/checkins/today/");
  return data;
}

export async function submitCheckIn(payload: {
  mood: CheckInScale;
  energy: CheckInScale;
  sleep_quality: CheckInScale;
  stress: CheckInScale;
}) {
  const { data } = await apiClient.post<DailyCheckIn>("/lifestyle/checkins/today/", payload);
  return data;
}

export async function getCheckInReport(period: CheckInPeriod) {
  const { data } = await apiClient.get<CheckInReport>("/lifestyle/checkins/report/", { params: { period } });
  return data;
}

export interface NotificationPreference {
  daily_checkin_enabled: boolean;
  reminder_hour: number;
}

export async function getNotificationPreference() {
  const { data } = await apiClient.get<NotificationPreference>("/lifestyle/notification-preference/");
  return data;
}

export async function updateNotificationPreference(payload: Partial<NotificationPreference>) {
  const { data } = await apiClient.patch<NotificationPreference>("/lifestyle/notification-preference/", payload);
  return data;
}

export async function getVapidPublicKey() {
  const { data } = await apiClient.get<{ public_key: string }>("/lifestyle/vapid-public-key/");
  return data;
}

export async function submitPushSubscription(payload: { endpoint: string; p256dh: string; auth: string }) {
  await apiClient.post("/lifestyle/push-subscription/", payload);
}

export async function deletePushSubscription(endpoint: string) {
  await apiClient.delete("/lifestyle/push-subscription/", { data: { endpoint } });
}
