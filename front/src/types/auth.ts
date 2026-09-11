export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | string;
  status: string;
  mustChangePassword: boolean;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  mustChangePassword: boolean;
};
