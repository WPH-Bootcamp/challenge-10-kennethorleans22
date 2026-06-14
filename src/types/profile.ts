export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}