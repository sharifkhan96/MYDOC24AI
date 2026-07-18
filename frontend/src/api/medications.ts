import { apiClient } from "./client";

export interface MedicationSearchResult {
  id: number;
  name: string;
  generic_name: string;
  drug_class: string;
}

export interface MedicationDetail {
  id: number;
  name: string;
  generic_name: string;
  drug_class: string;
  adult_dosing: string;
  pediatric_dosing: string;
  how_to_take: string;
  food_alcohol_interactions: string;
  common_side_effects: string;
  serious_side_effects: string;
  missed_dose_guidance: string;
  interaction_warnings: string[];
  is_seeded: boolean;
  is_mock: boolean;
}

export async function searchMedications(query: string) {
  const { data } = await apiClient.get<MedicationSearchResult[]>("/medications/search/", {
    params: { q: query },
  });
  return data;
}

export async function lookupMedication(name: string) {
  const { data } = await apiClient.get<MedicationDetail>("/medications/lookup/", {
    params: { name },
  });
  return data;
}

export async function getMedication(id: number) {
  const { data } = await apiClient.get<MedicationDetail>(`/medications/${id}/`);
  return data;
}
