export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Doctor {
  _id: string;
  name: string;
  login: string;
  medicalSpecialty: string;
  medicalRegistration: string;
  email: string;
  phone: string;
  createdAt?: string;
}

export interface Pacient {
  _id: string;
  name: string;
  login: string;
  email: string;
  phone: string;
  createdAt?: string;
}

export interface Appointment {
  _id: string;
  date: string;
  doctorId: string;
  pacientId: string;
  createdAt?: string;
}

export interface Prescription {
  _id: string;
  date?: string;
  appointmentId: string;
  medicine: string;
  dosage: string;
  instructions?: string;
  file?: string;
  createdAt?: string;
}

export interface LoggedDoctor {
  _id?: string;
  name: string;
  login: string;
  medicalSpecialty?: string;
  email?: string;
}

export function getToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("token") || "";
}

export function getAuthHeaders(includeJson = true): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = token;
  }
  return headers;
}

export function getLoggedDoctor(): LoggedDoctor | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("doctor");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoggedDoctor;
  } catch {
    return null;
  }
}

export function setSession(token: string, doctor?: LoggedDoctor | null) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("token", token);
  if (doctor) {
    sessionStorage.setItem("doctor", JSON.stringify(doctor));
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("doctor");
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...getAuthHeaders(!isFormData),
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    logout();
    window.location.replace("/");
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const errObj = data as { error?: string; message?: string } | null;
    const message =
      errObj?.error ||
      errObj?.message ||
      (typeof data === "string" && data) ||
      `Erro HTTP ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatDateTimePtBr(dateStr?: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDatePtBr(dateStr?: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function toDateTimeLocalValue(isoStr?: string): string {
  if (!isoStr) return "";
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function toDateInputValue(isoStr?: string): string {
  if (!isoStr) return new Date().toISOString().slice(0, 10);
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
