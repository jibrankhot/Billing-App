import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { ApiClientService } from '../../http/api-client.service';
import { StorageService } from '../../services/storage.service';
import { TokenService } from './token.service';

import { AuthUser } from '../models/auth-user';
import { LoginRequest } from '../models/login-request';
import { LoginResponse } from '../models/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly currentUserKey = 'stockly_current_user';

  private readonly currentUserSubject =
    new BehaviorSubject<AuthUser | null>(null);

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly apiClient: ApiClientService,
    private readonly tokenService: TokenService,
    private readonly storageService: StorageService
  ) {
    this.loadStoredUser();
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.apiClient
      .post<LoginResponse>('/auth/login', request)
      .pipe(
        tap(response => {
          this.tokenService.setAccessToken(response.accessToken);

          if (response.refreshToken) {
            this.tokenService.setRefreshToken(response.refreshToken);
          }

          this.setCurrentUser(response.user);
        })
      );
  }

  logout(): void {
    this.tokenService.clearTokens();

    this.storageService.removeItem(this.currentUserKey);

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

    return roles.some(role => user.roles.includes(role));
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
}