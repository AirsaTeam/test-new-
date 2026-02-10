import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BookingRequest, BaggagePiece, VehicleItem } from '../../models/booking-request.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-booking-summary',
  standalone: false,
  templateUrl: './booking-summary.component.html',
  styleUrl: './booking-summary.component.css',
})
export class BookingSummaryComponent {
  @Input() booking!: BookingRequest;

  constructor(private http: HttpClient) {}

  print() {
    window.print();
  }

  downloadReceiptPdf(): void {
    const ref = this.booking?.reference;
    if (!ref) return;
    const url = `${environment.apiBaseUrl}/bookings/${encodeURIComponent(ref)}/receipt/pdf/`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `receipt-${ref}.pdf`;
        a.click();
        URL.revokeObjectURL(a.href);
      },
      error: () => alert('دانلود PDF ممکن نشد. دوباره تلاش کنید.'),
    });
  }

  get documentTitle(): string {
    return this.booking.documentType === 'PASSENGER_TICKET'
      ? 'PASSENGER TICKET'
      : 'CARGO BOARDING CARD';
  }

  get hasBaggageAndPassenger(): boolean {
    return !!(this.booking.hasPassenger && this.booking.hasBaggage);
  }

  get cargoTypesLabel(): string {
    const types: string[] = [];
    if (this.booking.hasPassenger) types.push('PASSENGER');
    if (this.booking.hasBaggage) types.push('BAGGAGE');
    if (this.booking.hasVehicle) types.push('VEHICLE');
    return types.join(' + ');
  }

  /** All baggage pieces (one label per piece) with their baggage type for labels */
  get baggagePiecesWithType(): { piece: BaggagePiece; type: string }[] {
    if (!this.booking.baggageItems?.length) return [];
    const typeLabels: Record<string, string> = {
      cabin: 'Cabin',
      checked: 'Checked luggage',
      oversized: 'Oversized',
      sports: 'Sports equipment',
      fragile: 'Fragile',
      other: 'Other',
    };
    return this.booking.baggageItems.flatMap((b) =>
      (b.pieceDetails || []).map((piece) => ({
        piece,
        type: typeLabels[b.baggageType || 'checked'] || b.baggageType || 'Other',
      }))
    );
  }

  /** All baggage pieces (one label per piece) from baggageItems */
  get allBaggagePieces(): BaggagePiece[] {
    return this.baggagePiecesWithType.map((x) => x.piece);
  }

  /** All vehicles for labels */
  get allVehicles(): VehicleItem[] {
    return this.booking.vehicleItems || [];
  }

  get carrierName(): string {
    return this.booking.carrierName || 'Shinas Port International Terminal';
  }

  get shippingCompanyName(): string {
    return this.booking.carrierName || 'World Modern Lights LLC';
  }

  /** Build barcode payload per business doc §4: Passenger Name | Passport NO | ID NO | DATE | ORIGIN | DESTINATION | BAGGAGE TYPE | PIECE & WEIGHT */
  private static barcodePayload(
    passengerName: string,
    passportNo: string,
    idNo: string,
    date: string,
    origin: string,
    destination: string,
    baggageType: string,
    pieceAndWeight: string
  ): string {
    const parts = [
      passengerName || '',
      passportNo || '',
      idNo || '',
      date || '',
      origin || '',
      destination || '',
      baggageType || '',
      pieceAndWeight || '',
    ];
    return parts.join('|');
  }

  /** Barcode value for boarding pass (standard payload; piece/weight = total) */
  get boardingPassBarcode(): string {
    const date = this.booking.departureDate ? new Date(this.booking.departureDate).toISOString().slice(0, 10) : '';
    const pieceWeight = `${this.booking.baggagePieces ?? 0}&${this.booking.baggageWeightKg ?? 0}kg`;
    return BookingSummaryComponent.barcodePayload(
      this.booking.passengerName || '',
      this.booking.passportNumber || '',
      this.booking.passengerIdNumber || '',
      date,
      this.booking.originPort || '',
      this.booking.destinationPort || '',
      'BOARDING',
      pieceWeight
    ) || this.booking.reference;
  }

  isCabinBaggage(item: { type: string }): boolean {
    return item?.type?.toLowerCase() === 'cabin';
  }

  /** Barcode payload for a single baggage piece (per business §4) */
  getBarcodeForBaggagePiece(item: { piece: BaggagePiece; type: string }): string {
    const date = this.booking.departureDate ? new Date(this.booking.departureDate).toISOString().slice(0, 10) : '';
    const pieceWeight = `1&${item.piece?.weightKg ?? 0}kg`;
    return BookingSummaryComponent.barcodePayload(
      this.booking.passengerName || '',
      this.booking.passportNumber || '',
      this.booking.passengerIdNumber || '',
      date,
      this.booking.originPort || '',
      this.booking.destinationPort || '',
      item?.type || 'BAGGAGE',
      pieceWeight
    ) || item.piece?.barcodeId || '';
  }

  /** Barcode payload for vehicle label (per business §4; vehicle uses type VEHICLE) */
  getBarcodeForVehicle(veh: VehicleItem): string {
    const date = this.booking.departureDate ? new Date(this.booking.departureDate).toISOString().slice(0, 10) : '';
    const pieceWeight = `1&0kg`;
    return BookingSummaryComponent.barcodePayload(
      this.booking.passengerName || veh.ownerName || '',
      this.booking.passportNumber || '',
      this.booking.passengerIdNumber || '',
      date,
      this.booking.originPort || '',
      this.booking.destinationPort || '',
      'VEHICLE',
      pieceWeight
    ) || veh.barcodeId || '';
  }
}
