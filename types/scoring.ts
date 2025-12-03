// types/scoring.ts
export interface SearchCriteria {
  propertyType: "all" | "apartment" | "house" | "studio";
  roomCount: "any" | "1" | "2" | "3" | "4+";
  priceRange: {
    min: string;
    max: string;
  };
  district: string;
  amenities: string[];
  duration: string; // Продолжительность проживания (1-3, 3-7, 7-30, 30+ дней)
}

// Для обратной совместимости оставляем старый интерфейс, но удаляем неиспользуемые поля
export interface ApartmentScore {
  apartmentId: number;
  score: number;
  matchedCriteria: {
    propertyType: boolean;
    roomCount: boolean;
    priceRange: boolean;
    district: boolean;
    amenities: number; // Количество совпавших удобств
    duration: boolean;
  };
}

export interface ScoringAlgorithmResult {
  scores: ApartmentScore[];
  totalApartments: number;
  filteredApartments: number;
}
