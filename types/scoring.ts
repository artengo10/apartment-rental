import { Apartment } from "./apartment";

export interface SearchCriteria {
  propertyType: "apartment" | "house" | "studio" | "all";
  roomCount?: string;
  priceRange: { min: string; max: string };
  district: string;
  amenities: string[];
  duration: string;
  // Поля для домов
  houseArea?: string;
  houseFloors?: string;
  hasGarden?: boolean;
  hasGarage?: boolean;
  hasSauna?: boolean;
  parkingSpaces?: string;
}

export interface ScoredApartment extends Apartment {
  relevanceScore: number;
  isPromoted?: boolean;
}
