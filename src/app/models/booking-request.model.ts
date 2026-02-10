export type CargoType = 'PASSENGER' | 'BAGGAGE' | 'VEHICLE';

/** Single baggage piece: one label with barcode per piece */
export interface BaggagePiece {
  weightKg: number;
  barcodeId: string;
}

/** Baggage type for dropdown (cabin, checked, etc.) */
export type BaggageType = 'cabin' | 'checked' | 'oversized' | 'sports' | 'fragile' | 'other';

/** One baggage group: can have multiple pieces, each with weight and barcode */
export interface BaggageItem {
  baggageType?: BaggageType;
  pieceDetails: BaggagePiece[];
}

/** One vehicle with its own barcode for DB */
export interface VehicleItem {
  plateNumber: string;
  type: string;
  lengthM?: number;
  barcodeId: string;
  make?: string;
  model?: string;
  year?: number;
  engineNumber?: string;
  chassisNumber?: string;
  ownerName?: string;
  ownerContact?: string;
  senderCompany?: string;
  receiverCompany?: string;
}

export interface BookingRequest {
  reference: string;
  createdAt: string;

  hasPassenger: boolean;
  hasBaggage: boolean;
  hasVehicle: boolean;

  passengerName?: string;
  passengerIdNumber?: string;
  passportNumber?: string;
  phoneNumber?: string;

  /** Legacy: total pieces (derived from baggageItems) */
  baggagePieces?: number;
  /** Legacy: total weight (derived from baggageItems) */
  baggageWeightKg?: number;

  /** Per-piece baggage: each piece has weight and barcodeId for DB */
  baggageItems?: BaggageItem[];

  /** Multiple vehicles, each with barcodeId for DB */
  vehicleItems?: VehicleItem[];

  vehiclePlateNumber?: string;
  vehicleType?: string;
  vehicleLengthM?: number;

  originPort: string;
  destinationPort: string;
  departureDate: string;

  /** Optional print fields */
  departureGate?: string;
  seatNumber?: string;
  seatingArea?: string;
  arrivalDate?: string;
  carrierName?: string;
  ticketNumber?: string;
  sequenceNumber?: string;
  boardingTime?: string;

  documentType: 'PASSENGER_TICKET' | 'CARGO_BOARDING_CARD';
}
