import { Injectable } from '@angular/core';

import { StorageService } from '../../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly tokenKey = 'stockly_access_token';
  private readonly refreshTokenKey = 'stockly_refresh_token';

  constructor(private readonly storageService: StorageService) { }

  setAccessToken(token: string): void {
    this.storageService.setItem(this.tokenKey, token);
  }

  getAccessToken(): string | null {
    return this.storageService.getItem<string>(this.tokenKey);
  }

  removeAccessToken(): void {
    this.storageService.removeItem(this.tokenKey);
  }

  setRefreshToken(token: string): void {
    this.storageService.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken(): string | null {
    return this.storageService.getItem<string>(this.refreshTokenKey);
  }

  removeRefreshToken(): void {
    this.storageService.removeItem(this.refreshTokenKey);
  }

  hasAccessToken(): boolean {
    return this.getAccessToken() !== null;
  }

  clearTokens(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
  }
}