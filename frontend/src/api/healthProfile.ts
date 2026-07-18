import { apiClient } from "./client";

export interface Condition {
  id: number;
  name: string;
  status: "past" | "ongoing";
  diagnosed_date: string | null;
  notes: string;
}

export interface Allergy {
  id: number;
  allergen: string;
  reaction: string;
  severity: "mild" | "moderate" | "severe";
}

export interface PersonalMedication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  is_active: boolean;
}

export interface FamilyHistoryEntry {
  id: number;
  relation: string;
  condition: string;
}

async function listOf<T>(path: string) {
  const { data } = await apiClient.get<{ results: T[] } | T[]>(path);
  return Array.isArray(data) ? data : data.results;
}

export const conditionsApi = {
  list: () => listOf<Condition>("/health-profile/conditions/"),
  create: (payload: Partial<Condition>) => apiClient.post<Condition>("/health-profile/conditions/", payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`/health-profile/conditions/${id}/`),
};

export const allergiesApi = {
  list: () => listOf<Allergy>("/health-profile/allergies/"),
  create: (payload: Partial<Allergy>) => apiClient.post<Allergy>("/health-profile/allergies/", payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`/health-profile/allergies/${id}/`),
};

export const personalMedicationsApi = {
  list: () => listOf<PersonalMedication>("/health-profile/medications/"),
  create: (payload: Partial<PersonalMedication>) =>
    apiClient.post<PersonalMedication>("/health-profile/medications/", payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`/health-profile/medications/${id}/`),
};

export const familyHistoryApi = {
  list: () => listOf<FamilyHistoryEntry>("/health-profile/family-history/"),
  create: (payload: Partial<FamilyHistoryEntry>) =>
    apiClient.post<FamilyHistoryEntry>("/health-profile/family-history/", payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`/health-profile/family-history/${id}/`),
};
