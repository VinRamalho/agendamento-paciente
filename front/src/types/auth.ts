export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};
