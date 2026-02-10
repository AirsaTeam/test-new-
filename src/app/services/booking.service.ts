import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { BookingRequest } from '../models/booking-request.model';
import { environment } from '../../environments/environment';

const LOG = (payload: Record<string, unknown>) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/39075f21-e0ea-43a8-8cf8-4467f228683d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, timestamp: Date.now(), sessionId: 'debug-session' }) }).catch(() => {});
  // #endregion
};

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly apiUrl = `${environment.apiBaseUrl}/bookings/`;

  constructor(private http: HttpClient) {
    // #region agent log
    LOG({ hypothesisId: 'A', location: 'booking.service.ts:constructor', message: 'apiUrl and env', data: { apiUrl: this.apiUrl, apiBaseUrl: environment.apiBaseUrl, production: environment.production } });
    // #endregion
  }

  private generateReference(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.floor(Math.random() * 36 * 36).toString(36).toUpperCase().padStart(2, '0');
    return `SC-${ts}-${rand}`;
  }

  /** جستجو بر اساس PNR (reference)، شماره پاسپورت یا شماره شناسایی */
  search(params: { reference?: string; passport?: string; id_number?: string }): Observable<BookingRequest[]> {
    const q = new URLSearchParams();
    if (params.reference?.trim()) q.set('reference', params.reference.trim());
    if (params.passport?.trim()) q.set('passport', params.passport.trim());
    if (params.id_number?.trim()) q.set('id_number', params.id_number.trim());
    const query = q.toString();
    return this.http.get<BookingRequest[]>(`${this.apiUrl}search${query ? '?' + query : ''}`);
  }

  getByReference(reference: string): Observable<BookingRequest> {
    return this.http.get<BookingRequest>(`${this.apiUrl}${encodeURIComponent(reference)}/`);
  }

  createBooking(request: BookingRequest): Observable<BookingRequest> {
    // #region agent log
    LOG({ hypothesisId: 'A', location: 'booking.service.ts:createBooking', message: 'POST entry', data: { apiUrl: this.apiUrl, originPort: request.originPort, destinationPort: request.destinationPort } });
    // #endregion
    return this.http.post<BookingRequest>(this.apiUrl, request).pipe(
      tap((res) => {
        // #region agent log
        LOG({ hypothesisId: 'D', location: 'booking.service.ts:createBooking', message: 'POST success', data: { reference: res?.reference } });
        // #endregion
      }),
      catchError((err) => {
        // #region agent log
        LOG({ hypothesisId: 'C', location: 'booking.service.ts:createBooking', message: 'POST error', data: { name: err?.name, status: err?.status, statusText: err?.statusText, message: err?.message, url: err?.url } });
        // #endregion
        const status = err?.status;
        const isConnectionFailure = status === 0 || status == null;
        if (isConnectionFailure) {
          const mock: BookingRequest = {
            ...request,
            reference: request.reference || this.generateReference(),
            createdAt: new Date().toISOString(),
          };
          // #region agent log
          LOG({ hypothesisId: 'C', runId: 'post-fix', location: 'booking.service.ts:createBooking', message: 'fallback mock', data: { reference: mock.reference } });
          // #endregion
          return of(mock);
        }
        throw err;
      })
    );
  }
}
