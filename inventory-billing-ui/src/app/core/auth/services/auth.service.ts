import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { ApiClientService } from '../../http/services/api-client.service';
import { StorageService } from '../../services/storage.service';
import { TokenService } from './token.service';

import { AuthUser } from '../models/auth-user';
import {
  BackendAuthUser,
  LoginResponse
} from '../models/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly currentUserKey = 'stockly_current_user';

  private readonly currentUserSubject =
    new BehaviorSubject<AuthUser | null>(null);

  readonly currentUser$ =
    this.currentUserSubject.asObservable();

  constructor(
    private readonly apiClient: ApiClientService,
    private readonly tokenService: TokenService,
    private readonly storageService: StorageService
  ) {
    this.loadStoredUser();
  }

  login(request: {
    username: string;
    password: string;
  }): Observable<LoginResponse> {

    return this.apiClient
      .post<LoginResponse>('/auth/login', request)
      .pipe(
        tap(response => {

          const token = response.data.token;

          const user = this.mapBackendUser(
            response.data.user
          );

          this.tokenService.setAccessToken(token);

          this.setCurrentUser(user);
        })
      );
  }

  logout(): void {

    this.tokenService.clearTokens();

    this.storageService.removeItem(
      this.currentUserKey
    );

    this.currentUserSubject.next(null);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasAccessToken();
  }

  hasRole(role: string): boolean {

    const user = this.getCurrentUser();

    if (!user) {
      return false;
    }

    return user.roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {

    const user = this.getCurrentUser();

    if (!user) {
      return false;
    }

    return roles.some(role =>
      user.roles.includes(role)
    );
  }

  hasPermission(permission: string): boolean {

    const user = this.getCurrentUser();

    if (!user) {
      return false;
    }

    return user.permissions.includes(permission);
  }

  private setCurrentUser(user: AuthUser): void {

    this.storageService.setItem(
      this.currentUserKey,
      user
    );

    this.currentUserSubject.next(user);
  }

  private loadStoredUser(): void {

    const storedUser =
      this.storageService.getItem<AuthUser>(
        this.currentUserKey
      );

    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  private mapBackendUser(
    user: BackendAuthUser
  ): AuthUser {

    const nameParts =
      user.full_name?.trim().split(/\s+/) || [];

    const firstName =
      nameParts.length > 0
        ? nameParts[0]
        : '';

    const lastName =
      nameParts.length > 1
        ? nameParts.slice(1).join(' ')
        : '';

    return {
      id: user.id,
      username: user.username,
      email: user.email || '',
      firstName,
      lastName,
      fullName: user.full_name,
      roles: user.roles?.name
        ? [user.roles.name]
        : [],
      permissions: []
    };
  }
}