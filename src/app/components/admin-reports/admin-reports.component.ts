import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserBookingsService } from '../../services/user-bookings.service';
import { BookingRequest } from '../../models/booking-request.model';

export interface ReportStats {
  totalItems: number;
  totalWeightKg: number;
  totalPassengers: number;
  bookingCount: number;
}

@Component({
  selector: 'app-admin-reports',
  standalone: false,
  templateUrl: './admin-reports.component.html',
  styleUrl: './admin-reports.component.css',
})
export class AdminReportsComponent {
  dateFrom = '';
  dateTo = '';
  stats: ReportStats | null = null;
  maxBar = 1;

  constructor(
    private userBookings: UserBookingsService,
    private router: Router
  ) {}

  back(): void {
    this.router.navigate(['/admin']);
  }

  generate(): void {
    const from = this.dateFrom ? new Date(this.dateFrom).getTime() : 0;
    const to = this.dateTo ? new Date(this.dateTo).getTime() + 86400000 : Number.MAX_SAFE_INTEGER;
    const all = this.userBookings.getAllBookingsForAdmin();
    const inRange = all.filter((b) => {
      const t = new Date(b.createdAt).getTime();
      return t >= from && t <= to;
    });

    let totalItems = 0;
    let totalWeightKg = 0;
    let totalPassengers = 0;

    inRange.forEach((b: BookingRequest) => {
      if (b.hasPassenger) {
        totalPassengers += 1;
        totalItems += 1;
      }
      const pieces = b.baggagePieces ?? 0;
      totalItems += pieces;
      totalWeightKg += b.baggageWeightKg ?? 0;
      const vehicles = b.vehicleItems?.length ?? 0;
      totalItems += vehicles;
    });

    this.stats = {
      totalItems,
      totalWeightKg,
      totalPassengers,
      bookingCount: inRange.length,
    };
    this.maxBar = Math.max(totalItems, totalWeightKg, totalPassengers, 1);
  }
}
