import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserBookingsService, StoredBooking } from '../../services/user-bookings.service';
import { AuthService } from '../../services/auth.service';
import { BookingRequest } from '../../models/booking-request.model';

@Component({
  selector: 'app-admin-cargo',
  standalone: false,
  templateUrl: './admin-cargo.component.html',
  styleUrl: './admin-cargo.component.css',
})
export class AdminCargoComponent implements OnInit {
  storedBookings: StoredBooking[] = [];
  userNames: Record<string, string> = {};
  selectedBooking: BookingRequest | null = null;

  constructor(
    private userBookings: UserBookingsService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.storedBookings = this.userBookings.getStoredBookingsForAdmin();
    this.auth.listUsers().subscribe((users) => {
      const map: Record<string, string> = {};
      users.forEach((u) => (map[String(u.id)] = u.displayName || u.username || u.email));
      this.userNames = map;
    });
  }

  back(): void {
    this.router.navigate(['/admin']);
  }

  selectBooking(booking: BookingRequest): void {
    this.selectedBooking = booking;
  }

  getCargoSummary(b: BookingRequest): string {
    const parts: string[] = [];
    if (b.hasPassenger) parts.push('Passenger');
    if (b.hasBaggage) parts.push(`Baggage (${b.baggagePieces ?? 0} pcs)`);
    if (b.hasVehicle) parts.push(`Vehicle (${b.vehicleItems?.length ?? 1})`);
    return parts.length ? parts.join(' · ') : '—';
  }

  getUserName(userId: string): string {
    return this.userNames[userId] || userId;
  }
}
