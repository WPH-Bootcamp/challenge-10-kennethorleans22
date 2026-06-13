export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}