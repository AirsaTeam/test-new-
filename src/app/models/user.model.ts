export interface User {
  id: string | number;
  email: string;
  username: string;
  displayName: string;
  passwordHash?: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface UpdateUserRequest {
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  password?: string;
}
