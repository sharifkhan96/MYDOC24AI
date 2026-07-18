import { apiClient } from "./client";

export type Region = "UK" | "US" | "OTHER";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  region: Region;
  full_name: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  region?: Region;
}

export async function registerUser(payload: RegisterPayload) {
  const { data } = await apiClient.post<{ user: User; access: string; refresh: string }>(
    "/auth/register/",
    payload,
  );
  return data;
}

export async function loginUser(email: string, password: string) {
  const { data } = await apiClient.post<{ access: string; refresh: string }>("/auth/token/", {
    email,
    password,
  });
  return data;
}

export async function fetchMe() {
  const { data } = await apiClient.get<User>("/auth/me/");
  return data;
}

export async function updateMe(payload: Partial<User>) {
  const { data } = await apiClient.patch<User>("/auth/me/", payload);
  return data;
}
