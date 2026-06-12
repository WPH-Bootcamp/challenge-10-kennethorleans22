import api from "./axios";
import { AuthResponse, LoginPayload, RegisterPayload, User } from "@/types/auth";

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post("/api/auth/login", payload);
  return response.data.data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await api.post("/api/auth/register", payload);
  return response.data.data;
}

export async function getProfile(): Promise<User> {
  const response = await api.get("/api/auth/profile");
  return response.data.data;
}