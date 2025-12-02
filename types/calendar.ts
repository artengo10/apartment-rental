// types/calendar.ts
export interface DailyPrice {
  id: number;
  apartmentId: number;
  date: string; // ISO string YYYY-MM-DD
  price: number;
  isBlocked: boolean;
  minStay?: number;
  maxStay?: number;
}

export interface Booking {
  id: number;
  apartmentId: number;
  userId: number;
  checkIn: string; // ISO string
  checkOut: string; // ISO string
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  guestCount: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarAvailability {
  date: string; // YYYY-MM-DD
  price: number;
  isBlocked: boolean;
  isBooked: boolean;
  minStay?: number;
  maxStay?: number;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface BookingRequest {
  apartmentId: number;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  specialRequests?: string;
}
