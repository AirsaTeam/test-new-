import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  BookingRequest,
  BaggageItem,
  BaggagePiece,
  BaggageType,
  VehicleItem,
} from '../../models/booking-request.model';
import { BookingService } from '../../services/booking.service';
import { UserBookingsService } from '../../services/user-bookings.service';

export const BAGGAGE_TYPE_OPTIONS: { value: BaggageType; label: string }[] = [
  { value: 'cabin', label: 'Cabin' },
  { value: 'checked', label: 'Checked luggage' },
  { value: 'oversized', label: 'Oversized' },
  { value: 'sports', label: 'Sports equipment' },
  { value: 'fragile', label: 'Fragile' },
  { value: 'other', label: 'Other' },
];

function generateBarcodeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `BR-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

@Component({
  selector: 'app-booking-form',
  standalone: false,
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.css',
})
export class BookingFormComponent implements OnInit {
  @Output() bookingCreated = new EventEmitter<BookingRequest>();

  form!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private userBookings: UserBookingsService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      hasPassenger: [true],
      hasBaggage: [false],
      hasVehicle: [false],

      passengerName: ['', []],
      passengerIdNumber: ['', []],
      phoneNumber: ['', []],

      baggageItems: this.fb.array([]),
      vehicleItems: this.fb.array([]),

      originPort: ['', Validators.required],
      destinationPort: ['', Validators.required],
      departureDate: ['', Validators.required],
    });

    this.setupConditionalValidators();
    this.syncBaggageVehicleArrays();
    if (this.hasBaggage && this.baggageItems.length === 0) this.addBaggage();
    if (this.hasVehicle && this.vehicleItems.length === 0) this.addVehicle();
  }

  get hasPassenger() {
    return this.form.get('hasPassenger')?.value;
  }

  get hasBaggage() {
    return this.form.get('hasBaggage')?.value;
  }

  get hasVehicle() {
    return this.form.get('hasVehicle')?.value;
  }

  get baggageItems(): FormArray {
    return this.form.get('baggageItems') as FormArray;
  }

  get vehicleItems(): FormArray {
    return this.form.get('vehicleItems') as FormArray;
  }

  private syncBaggageVehicleArrays(): void {
    this.form.get('hasBaggage')?.valueChanges.subscribe((v) => {
      if (v && this.baggageItems.length === 0) this.addBaggage();
      if (!v) while (this.baggageItems.length) this.baggageItems.removeAt(0);
    });
    this.form.get('hasVehicle')?.valueChanges.subscribe((v) => {
      if (v && this.vehicleItems.length === 0) this.addVehicle();
      if (!v) while (this.vehicleItems.length) this.vehicleItems.removeAt(0);
    });
  }

  private setupConditionalValidators() {
    this.form.get('hasPassenger')?.valueChanges.subscribe(() => {
      const controls = ['passengerName', 'passengerIdNumber', 'phoneNumber'];
      controls.forEach((name) => {
        const control = this.form.get(name);
        if (!control) return;
        if (this.hasPassenger) {
          control.addValidators(Validators.required);
        } else {
          control.clearValidators();
        }
        control.updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  addBaggage(): void {
    const group = this.fb.group({
      baggageType: ['checked' as BaggageType, Validators.required],
      pieces: [1, [Validators.required, Validators.min(1)]],
      weights: this.fb.array([this.fb.control(0, [Validators.required, Validators.min(0)])]),
    });
    group.get('pieces')?.valueChanges.subscribe((p) => this.adjustWeights(group, p ?? 0));
    this.baggageItems.push(group);
  }

  removeBaggage(index: number): void {
    this.baggageItems.removeAt(index);
  }

  private adjustWeights(baggageGroup: FormGroup, pieces: number): void {
    const arr = baggageGroup.get('weights') as FormArray;
    const n = Math.max(0, Number(pieces) || 0);
    while (arr.length > n) arr.removeAt(arr.length - 1);
    while (arr.length < n) arr.push(this.fb.control(0, [Validators.required, Validators.min(0)]));
  }

  getBaggageWeights(baggageGroup: any): FormArray {
    return baggageGroup.get('weights') as FormArray;
  }

  /** Total weight (kg) across all baggage pieces – updates as weights are entered (e.g. from scale). */
  get totalBaggageWeightKg(): number {
    const items = this.form.get('baggageItems') as FormArray;
    if (!items?.length) return 0;
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      const weights = items.at(i).get('weights') as FormArray;
      if (!weights?.controls?.length) continue;
      for (const c of weights.controls) {
        const v = c.value;
        total += Number(v) || 0;
      }
    }
    return Math.round(total * 100) / 100;
  }

  readonly baggageTypeOptions = BAGGAGE_TYPE_OPTIONS;

  addVehicle(): void {
    this.vehicleItems.push(
      this.fb.group({
        plateNumber: ['', this.hasVehicle ? Validators.required : []],
        type: ['', this.hasVehicle ? Validators.required : []],
        lengthM: [0 as number | null],
      })
    );
  }

  removeVehicle(index: number): void {
    this.vehicleItems.removeAt(index);
  }

  submit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.hasPassenger && !this.hasBaggage && !this.hasVehicle) {
      alert('Select at least one cargo type (passenger, baggage, or vehicle).');
      return;
    }

    const raw = this.form.value;

    const baggageItems: BaggageItem[] = (raw.baggageItems || []).map(
      (b: { baggageType?: BaggageType; pieces: number; weights: number[] }) => {
        const pieces = Math.max(0, Number(b.pieces) || 0);
        const weights = (b.weights || []).slice(0, pieces);
        return {
          baggageType: b.baggageType || 'checked',
          pieceDetails: weights.map((w: number) => ({
            weightKg: Number(w) || 0,
            barcodeId: generateBarcodeId(),
          })),
        };
      }
    );

    const vehicleItems: VehicleItem[] = (raw.vehicleItems || []).map(
      (v: { plateNumber: string; type: string; lengthM?: number }) => ({
        plateNumber: v.plateNumber || '',
        type: v.type || '',
        lengthM: v.lengthM != null ? Number(v.lengthM) : undefined,
        barcodeId: generateBarcodeId(),
      })
    );

    const totalPieces = baggageItems.reduce((sum, b) => sum + b.pieceDetails.length, 0);
    const totalWeight = baggageItems.reduce(
      (sum, b) => sum + b.pieceDetails.reduce((s, p) => s + p.weightKg, 0),
      0
    );

    const documentType =
      raw.hasPassenger && !raw.hasVehicle && baggageItems.length === 0 && totalPieces === 0
        ? 'PASSENGER_TICKET'
        : 'CARGO_BOARDING_CARD';

    const payload: BookingRequest = {
      reference: '',
      createdAt: '',
      hasPassenger: raw.hasPassenger,
      hasBaggage: raw.hasBaggage,
      hasVehicle: raw.hasVehicle,
      passengerName: raw.passengerName || undefined,
      passengerIdNumber: raw.passengerIdNumber || undefined,
      phoneNumber: raw.phoneNumber || undefined,
      baggageItems: baggageItems.length ? baggageItems : undefined,
      baggagePieces: totalPieces || undefined,
      baggageWeightKg: totalWeight || undefined,
      vehicleItems: vehicleItems.length ? vehicleItems : undefined,
      vehiclePlateNumber: vehicleItems[0]?.plateNumber,
      vehicleType: vehicleItems[0]?.type,
      vehicleLengthM: vehicleItems[0]?.lengthM,
      originPort: raw.originPort,
      destinationPort: raw.destinationPort,
      departureDate: raw.departureDate,
      documentType,
    };

    this.isSubmitting = true;
    this.bookingService.createBooking(payload).subscribe({
      next: (booking) => {
        this.isSubmitting = false;
        this.userBookings.addBooking(booking);
        this.bookingCreated.emit(booking);
      },
      error: (err) => {
        (() => {
          fetch('http://127.0.0.1:7242/ingest/39075f21-e0ea-43a8-8cf8-4467f228683d', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              hypothesisId: 'E',
              location: 'booking-form.component.ts:submit',
              message: 'subscribe error',
              data: { name: err?.name, status: err?.status, message: err?.message },
              timestamp: Date.now(),
              sessionId: 'debug-session',
            }),
          }).catch(() => {});
        })();
        this.isSubmitting = false;
        alert('Failed to create booking. Please try again.');
      },
    });
  }
}
