import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthUser, LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';

  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly tokenState = signal<string | null>(
    localStorage.getItem(AuthService.TOKEN_KEY),
  );
  private readonly userState = signal<AuthUser | null>(this.readUser());

  readonly token = computed(() => this.tokenState());
  readonly user = computed(() => this.userState());
  readonly authenticated = computed(() => this.isAuthenticated());

  constructor() {
    this.hydrateAuthState();
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(AuthService.TOKEN_KEY);

    if (!token || token.trim().length === 0) {
      this.tokenState.set(null);
      return false;
    }

    if (this.tokenState() !== token) {
      this.tokenState.set(token);
    }

    return true;
  }

  login(email: string, password: string) {
    return this.api.post<LoginResponse>('/auth/login', { email, password }).pipe(
      map((response) => response.data),
      tap((payload) => {
        this.tokenState.set(payload.token);
        this.userState.set(payload.user);
        localStorage.setItem(AuthService.TOKEN_KEY, payload.token);
        localStorage.setItem(AuthService.USER_KEY, JSON.stringify(payload.user));
      }),
    );
  }

  logout(): void {
    this.tokenState.set(null);
    this.userState.set(null);
    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem(AuthService.USER_KEY);
    void this.router.navigateByUrl('/login');
  }

  private hydrateAuthState(): void {
    const token = localStorage.getItem(AuthService.TOKEN_KEY);
    this.tokenState.set(token && token.trim().length > 0 ? token : null);
    this.userState.set(this.readUser());
  }

  private readUser(): AuthUser | null {
    const stored = localStorage.getItem(AuthService.USER_KEY);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  }
}
