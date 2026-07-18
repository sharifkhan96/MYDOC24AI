import { apiClient } from "./client";

export type ProviderCode = "nhs" | "medicaid";
export type LinkStatus = "not_connected" | "pending_consent" | "connected";

export interface ProviderLinkAccount {
  id: number;
  provider: ProviderCode;
  status: LinkStatus;
  consent_scopes: string[];
  mock_mode: boolean;
  connected_at: string | null;
}

export interface MockAppointment {
  id: number;
  title: string;
  clinician_name: string;
  location: string;
  scheduled_at: string;
  status: "upcoming" | "completed" | "cancelled";
}

export interface MockRecord {
  id: number;
  title: string;
  record_type: string;
  summary: string;
  record_date: string;
}

export async function listProviderLinks() {
  const { data } = await apiClient.get<ProviderLinkAccount[]>("/integrations/providers/");
  return data;
}

export async function connectProvider(provider: ProviderCode) {
  const { data } = await apiClient.post<{ account: ProviderLinkAccount; consent_scopes: string[] }>(
    `/integrations/${provider}/connect/`,
  );
  return data;
}

export async function confirmConsent(provider: ProviderCode) {
  const { data } = await apiClient.post<ProviderLinkAccount>(`/integrations/${provider}/consent/confirm/`);
  return data;
}

export async function disconnectProvider(provider: ProviderCode) {
  const { data } = await apiClient.post<ProviderLinkAccount>(`/integrations/${provider}/disconnect/`);
  return data;
}

export async function getAppointments(provider: ProviderCode) {
  const { data } = await apiClient.get<MockAppointment[]>(`/integrations/${provider}/appointments/`);
  return data;
}

export async function getRecords(provider: ProviderCode) {
  const { data } = await apiClient.get<MockRecord[]>(`/integrations/${provider}/records/`);
  return data;
}
