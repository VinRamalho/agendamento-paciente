import { PublicUser } from '../../common/types/public-user';

export type AuthUserResponse = PublicUser;

export type LoginResponse = {
  accessToken: string;
  user: AuthUserResponse;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};
