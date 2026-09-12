import { AuthUser } from './auth-user';

export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    user: AuthUser;
}