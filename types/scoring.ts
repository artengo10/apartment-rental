import { Apartment } from "./apartment";

export interface SearchCriteria {
  propertyType: "apartment" | "house" | "studio" | "all";
  houseFloors?: string;
  parkingSpaces?: string;
  houseArea?: string;
  hasGarden?: boolean;
  hasGarage?: boolean;
  hasSauna?: boolean;
  roomCount?: string;
  priceRange: { min: string; max: string };
  amenities: string[];
}

export interface ScoredApartment extends Apartment {
  relevanceScore: number;
  isPromoted?: boolean;
}
