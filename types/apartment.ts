// types/apartment.ts
export interface Apartment {
  id: number;
  lat: number;
  lng: number;
  title: string;
  price: string;
  address: string;
  description: string;
  type: "apartment" | "house" | "studio";
  district: string;
  rooms?: number;
  area?: number;
  floor?: number;
  originalPrice?: string;
  images: string[];
  amenities?: string[];
  hostName?: string;
  hostRating?: number;
  hostId: number;
  isFavorite?: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  isPublished?: boolean;
  isEdited?: boolean;
  rejectionReason?: string;
  createdAt?: string;
  publishedAt?: string;
}

// Типы для удобств
export type PropertyType = "apartment" | "house" | "studio";

// Интерфейс для формы
export interface ApartmentFormData {
  title: string;
  description: string;
  price: string;
  type: PropertyType;
  district: string;
  address: string;
  lat: number | null;
  lng: number | null;
  rooms: string;
  area: string;
  floor: string;
  amenities: string[];
}
