import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { BookingRequest } from '../../models/booking-request.model';

@Component({
  selector: 'app-admin-search',
  standalone: false,
  templateUrl: './admin-search.component.html',
  styleUrl: './admin-search.component.css',
})
export class AdminSearchComponent {
  reference = '';
  passport = '';
  idNumber = '';
  results: BookingRequest[] = [];
  loading = false;
  error = '';

  constructor(
    private bookingService: BookingService,
    private router: Router
  ) {}

  back(): void {
    this.router.navigate(['/admin']);
  }

  search(): void {
    const ref = this.reference.trim();
    const pass = this.passport.trim();
    const id = this.idNumber.trim();
    if (!ref && !pass && !id) {
      this.error = 'حداقل یکی از فیلدها را پر کنید (PNR، پاسپورت یا شماره شناسایی).';
      return;
    }
    this.error = '';
    this.loading = true;
    this.results = [];
    this.bookingService.search({ reference: ref || undefined, passport: pass || undefined, id_number: id || undefined }).subscribe({
      next: (list) => {
        this.results = list;
        this.loading = false;
      },
      error: () => {
        this.error = 'خطا در جستجو. دوباره تلاش کنید.';
        this.loading = false;
      },
    });
  }

  getCargoSummary(b: BookingRequest): string {
    const parts: string[] = [];
    if (b.hasPassenger) parts.push('مسافر');
    if (b.hasBaggage) parts.push(`بار (${b.baggagePieces ?? 0} قطعه)`);
    if (b.hasVehicle) parts.push(`خودرو (${b.vehicleItems?.length ?? 1})`);
    return parts.length ? parts.join(' · ') : '—';
  }

  selectBooking(b: BookingRequest): void {
    this.router.navigate(['/dashboard/cargo-list'], { state: { highlightReference: b.reference } });
  }
}
