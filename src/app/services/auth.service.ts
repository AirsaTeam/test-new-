import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  User,
  CreateUserRequest,
  LoginRequest,
  VerifyEmailRequest,
  UpdateUserRequest,
} from '../models/user.model';

const STORAGE_USERS = 'shinas_users';
const STORAGE_CURRENT = 'shinas_current_user';
const STORAGE_PENDING_VERIFY = 'shinas_pending_verify';

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function simpleHash(pwd: string): string {
  return btoa(encodeURIComponent(pwd));
}

function seedAdminIfNeeded(): void {
  const users = loadUsers();
  if (users.length > 0) return;
  const now = new Date().toISOString();
  const admin: User = {
    id: 'admin-1',
    email: 'admin@shinas.local',
    username: 'admin',
    displayName: 'Administrator',
    passwordHash: simpleHash('admin123'),
    role: 'admin',
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  };
  users.push(admin);
  saveUsers(users);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(this.getStoredUser());

  constructor() {
    seedAdminIfNeeded();
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  getCurrentUserValue(): User | null {
    return this.currentUser$.value;
  }

  isLoggedIn(): boolean {
    return this.currentUser$.value != null;
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

  login(req: LoginRequest): Observable<{ success: boolean; user?: User; error?: string }> {
    const users = loadUsers();
    const user = users.find(
      (u) =>
        (u.email === req.username || u.username === req.username) &&
        u.passwordHash === simpleHash(req.password) &&
        u.emailVerified
    );
    if (user) {
      const safeUser = { ...user };
      this.setStoredUser(safeUser);
      return of({ success: true, user: safeUser }).pipe(delay(300));
    }
    return of({ success: false, error: 'Invalid username or password' }).pipe(delay(300));
  }

  register(req: CreateUserRequest): Observable<{ success: boolean; error?: string }> {
    const users = loadUsers();
    if (users.some((u) => u.email === req.email)) {
      return of({ success: false, error: 'Email already registered' }).pipe(delay(300));
    }
    if (users.some((u) => u.username === req.username)) {
      return of({ success: false, error: 'Username already taken' }).pipe(delay(300));
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date().toISOString();
    const newUser: User = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      email: req.email,
      username: req.username,
      displayName: req.displayName || req.username,
      passwordHash: simpleHash(req.password),
      role: 'user',
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    };
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem(
      STORAGE_PENDING_VERIFY,
      JSON.stringify({ email: req.email, code, createdAt: now })
    );
    console.info('[Auth] Verification code for', req.email, ':', code);
    return of({ success: true }).pipe(delay(300));
  }

  verifyEmail(req: VerifyEmailRequest): Observable<{ success: boolean; user?: User; error?: string }> {
    const raw = localStorage.getItem(STORAGE_PENDING_VERIFY);
    if (!raw) {
      return of({ success: false, error: 'No pending verification' }).pipe(delay(300));
    }
    const pending = JSON.parse(raw);
    if (pending.email !== req.email || pending.code !== req.code) {
      return of({ success: false, error: 'Invalid or expired code' }).pipe(delay(300));
    }
    const users = loadUsers();
    const user = users.find((u) => u.email === req.email);
    if (!user) {
      return of({ success: false, error: 'User not found' }).pipe(delay(300));
    }
    user.emailVerified = true;
    user.updatedAt = new Date().toISOString();
    saveUsers(users);
    localStorage.removeItem(STORAGE_PENDING_VERIFY);
    this.setStoredUser(user);
    return of({ success: true, user }).pipe(delay(300));
  }

  logout(): void {
    this.setStoredUser(null);
  }

  listUsers(): Observable<User[]> {
    const users = loadUsers().map((u) => ({ ...u }));
    return of(users).pipe(delay(200));
  }

  updateUser(id: string, req: UpdateUserRequest): Observable<{ success: boolean; user?: User; error?: string }> {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) {
      return of({ success: false, error: 'User not found' }).pipe(delay(200));
    }
    if (req.displayName != null) users[idx].displayName = req.displayName;
    if (req.username != null) users[idx].username = req.username;
    if (req.avatarUrl != null) users[idx].avatarUrl = req.avatarUrl;
    if (req.password != null && req.password.length >= 6) {
      users[idx].passwordHash = simpleHash(req.password);
    }
    users[idx].updatedAt = new Date().toISOString();
    saveUsers(users);
    const current = this.currentUser$.value;
    if (current?.id === id) {
      this.setStoredUser(users[idx]);
    }
    return of({ success: true, user: users[idx] }).pipe(delay(200));
  }

  deleteUser(id: string): Observable<{ success: boolean; error?: string }> {
    const users = loadUsers().filter((u) => u.id !== id);
    if (users.length === loadUsers().length) {
      return of({ success: false, error: 'User not found' }).pipe(delay(200));
    }
    saveUsers(users);
    if (this.currentUser$.value?.id === id) {
      this.logout();
    }
    return of({ success: true }).pipe(delay(200));
  }

  sendVerificationCode(email: string): Observable<{ success: boolean; error?: string }> {
    const users = loadUsers();
    const user = users.find((u) => u.email === email);
    if (!user || user.emailVerified) {
      return of({ success: false, error: 'Email not found or already verified' }).pipe(delay(300));
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(
      STORAGE_PENDING_VERIFY,
      JSON.stringify({ email, code, createdAt: new Date().toISOString() })
    );
    console.info('[Auth] Verification code for', email, ':', code);
    return of({ success: true }).pipe(delay(300));
  }
}
