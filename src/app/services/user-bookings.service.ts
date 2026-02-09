import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BookingRequest } from '../models/booking-request.model';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'shinas_user_bookings';

export interface StoredBooking {
  userId: string;
  booking: BookingRequest;
}

function loadAll(): StoredBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(list: StoredBooking[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

@Injectable({ providedIn: 'root' })
export class UserBookingsService {
  private list$ = new BehaviorSubject<BookingRequest[]>([]);

  constructor(private auth: AuthService) {
    this.auth.getCurrentUser().subscribe((user) => {
      this.refresh(user?.id);
    });
  }

  getBookings(): BehaviorSubject<BookingRequest[]> {
    return this.list$;
  }

  refresh(userId: string | number | undefined): void {
    const all = loadAll();
    const idStr = userId != null ? String(userId) : undefined;
    const forUser = idStr
      ? all.filter((x) => x.userId === idStr).map((x) => x.booking)
      : [];
    forUser.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.list$.next(forUser);
  }

  addBooking(booking: BookingRequest): void {
    const user = this.auth.getCurrentUserValue();
    if (!user) return;
    const all = loadAll();
    all.unshift({ userId: String(user.id), booking });
    saveAll(all);
    this.refresh(user.id);
  }

  getAllBookingsForAdmin(): BookingRequest[] {
    const all = loadAll();
    const bookings = all.map((x) => x.booking);
    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return bookings;
  }

  getStoredBookingsForAdmin(): StoredBooking[] {
    const all = loadAll();
    return [...all].sort(
      (a, b) => new Date(b.booking.createdAt).getTime() - new Date(a.booking.createdAt).getTime()
    );
  }
}
