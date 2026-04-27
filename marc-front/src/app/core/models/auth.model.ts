export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
