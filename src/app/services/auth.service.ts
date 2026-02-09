import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  User,
  CreateUserRequest,
  LoginRequest,
  UpdateUserRequest,
} from '../models/user.model';
import { environment } from '../../environments/environment';

const STORAGE_CURRENT = 'shinas_current_user';
const STORAGE_ACCESS = 'shinas_access_token';
const STORAGE_REFRESH = 'shinas_refresh_token';

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(this.getStoredUser());

  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  // ---------- وضعیت کاربر در فرانت ----------

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  getCurrentUserValue(): User | null {
    return this.currentUser$.value;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  isAdmin(): boolean {
    const u = this.currentUser$.value;
    return u?.role === 'admin';
  }

  private getStoredUser(): User | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_CURRENT);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private setStoredUser(user: User | null): void {
    if (user) {
      sessionStorage.setItem(STORAGE_CURRENT, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_CURRENT);
    }
    this.currentUser$.next(user);
  }

  private setTokens(access: string | null, refresh: string | null): void {
    if (access) {
      localStorage.setItem(STORAGE_ACCESS, access);
    } else {
      localStorage.removeItem(STORAGE_ACCESS);
    }
    if (refresh) {
      localStorage.setItem(STORAGE_REFRESH, refresh);
    } else {
      localStorage.removeItem(STORAGE_REFRESH);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_ACCESS);
  }

  /**
   * اگر توکن داریم ولی کاربر در session نیست (مثلاً بعد از رفرش)،
   * از بک /me می‌گیریم و کاربر را ذخیره می‌کنیم تا گاردها و نقش درست کار کنند.
   */
  restoreUser(): Observable<User | null> {
    const token = this.getAccessToken();
    if (!token) return of(null);
    return this.http.get<User>(`${this.apiUrl}/me/`).pipe(
      map((user) => ({ ...user, role: this.normalizeRole(user.role) as 'admin' | 'user' })),
      tap((user) => this.setStoredUser(user)),
      catchError(() => of(null))
    );
  }

  /** نقش را برای مقایسه یکدست می‌کند (بک ممکن است با حروف مختلف برگرداند). */
  private normalizeRole(role: unknown): string {
    if (typeof role !== 'string') return 'user';
    return role.toLowerCase();
  }

  // ---------- تماس با بک‌اند ----------

  register(req: CreateUserRequest): Observable<{ success: boolean; error?: string }> {
    return this.http.post<User>(`${this.apiUrl}/register/`, {
      email: req.email,
      username: req.username,
      displayName: req.displayName,
      password: req.password,
    }).pipe(
      map(() => ({ success: true })),
      catchError((err) => {
        const error = err?.error;
        const msg =
          error?.email?.[0] ||
          error?.username?.[0] ||
          error?.detail ||
          'Registration failed';
        return of({ success: false, error: msg });
      })
    );
  }

  login(req: LoginRequest): Observable<{ success: boolean; user?: User; error?: string }> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, {
      username: req.username,
      password: req.password,
    }).pipe(
      tap((res) => {
        this.setTokens(res.access, res.refresh);
        const user = { ...res.user, role: this.normalizeRole(res.user.role) as 'admin' | 'user' };
        this.setStoredUser(user);
      }),
      map((res) => {
        const user = { ...res.user, role: this.normalizeRole(res.user.role) as 'admin' | 'user' };
        return { success: true, user };
      }),
      catchError((err) => {
        const msg = err?.error?.detail || 'Invalid username or password';
        return of({ success: false, error: msg });
      })
    );
  }

  logout(): void {
    this.setTokens(null, null);
    this.setStoredUser(null);
  }

  listUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/`);
  }

  updateUser(id: string | number, req: UpdateUserRequest): Observable<{ success: boolean; user?: User; error?: string }> {
    const idStr = String(id);
    return this.http.patch<User>(`${this.apiUrl}/users/${idStr}/`, {
      displayName: req.displayName,
      username: req.username,
    }).pipe(
      tap((user) => {
        const currentId = this.currentUser$.value?.id;
        if (currentId != null && String(currentId) === String(user.id)) {
          this.setStoredUser(user);
        }
      }),
      map((user) => ({ success: true, user })),
      catchError((err) => {
        const msg = err?.error?.detail || 'Update failed';
        return of({ success: false, error: msg });
      })
    );
  }

  deleteUser(id: string | number): Observable<{ success: boolean; error?: string }> {
    const idStr = String(id);
    return this.http.delete(`${this.apiUrl}/users/${idStr}/`).pipe(
      tap(() => {
        const currentId = this.currentUser$.value?.id;
        if (currentId != null && String(currentId) === idStr) {
          this.logout();
        }
      }),
      map(() => ({ success: true })),
      catchError((err) => {
        const msg = err?.error?.detail || 'Delete failed';
        return of({ success: false, error: msg });
      })
    );
  }
}
