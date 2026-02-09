import { Component, Input } from '@angular/core';
import { BookingRequest, BaggagePiece, VehicleItem } from '../../models/booking-request.model';

@Component({
  selector: 'app-booking-summary',
  standalone: false,
  templateUrl: './booking-summary.component.html',
  styleUrl: './booking-summary.component.css',
})
export class BookingSummaryComponent {
  @Input() booking!: BookingRequest;

  print() {
    window.print();
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

  /** Barcode value for boarding pass (reference + passenger) */
  get boardingPassBarcode(): string {
    return [this.booking.reference, this.booking.passengerIdNumber || ''].filter(Boolean).join('-') || this.booking.reference;
  }

  isCabinBaggage(item: { type: string }): boolean {
    return item?.type?.toLowerCase() === 'cabin';
  }
}
