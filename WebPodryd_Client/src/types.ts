// src/types.ts
export interface User {
  id: number;
  username: string;
  first_login: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
}

export interface LoginResponse extends AuthResponse {
  first_login: boolean;
  user_id: string;
}

export interface LocationState {
  selectedDepartment?: string;
}
