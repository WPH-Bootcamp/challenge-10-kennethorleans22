import api from './axios';
import { ProfileResponse } from '@/types/profile';

export async function getProfile(): Promise<ProfileResponse> {
  const response = await api.get<ProfileResponse>('/api/auth/profile');
  return response.data;
}