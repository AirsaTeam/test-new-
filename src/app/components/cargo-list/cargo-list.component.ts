import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserBookingsService } from '../../services/user-bookings.service';
import { BookingRequest } from '../../models/booking-request.model';

@Component({
  selector: 'app-cargo-list',
  standalone: false,
  templateUrl: './cargo-list.component.html',
  styleUrl: './cargo-list.component.css',
})
export class CargoListComponent implements OnInit {
  bookings$!: Observable<BookingRequest[]>;
  selectedBooking: BookingRequest | null = null;

  constructor(private userBookings: UserBookingsService) {}

  ngOnInit(): void {
    this.bookings$ = this.userBookings.getBookings().asObservable();
  }

  selectBooking(booking: BookingRequest): void {
    this.selectedBooking = booking;
  }

  getCargoSummary(booking: BookingRequest): string {
    const parts: string[] = [];
    if (booking.hasPassenger) parts.push('Passenger');
    if (booking.hasBaggage) parts.push(`Baggage (${booking.baggagePieces ?? 0} pcs)`);
    if (booking.hasVehicle) parts.push(`Vehicle (${booking.vehicleItems?.length ?? 1})`);
    return parts.length ? parts.join(' · ') : '—';
  }
}
