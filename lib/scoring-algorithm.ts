import { Apartment } from "@/types/apartment";
import { SearchCriteria, ScoredApartment } from "@/types/scoring";

export const calculateRelevanceScore = (
  apartment: Apartment,
  criteria: SearchCriteria
): ScoredApartment => {
  let score = 0;

  // 1. ЖЕСТКИЙ КРИТЕРИЙ: тип жилья (4 балла)
  if (
    criteria.propertyType === "all" ||
    apartment.type === criteria.propertyType
  ) {
    score += 4;
  } else {
    // Если тип не совпадает - сразу 0 баллов
    return { ...apartment, relevanceScore: 0 };
  }

  // 2. КРИТЕРИЙ: комнатность/этажность (3 балла)
  if (apartment.type === "house" && criteria.houseFloors) {
    const desiredFloors = parseInt(criteria.houseFloors);
    const actualFloors = apartment.floor || 1;

    if (actualFloors === desiredFloors) {
      score += 3;
    } else if (Math.abs(actualFloors - desiredFloors) === 1) {
      score += 1;
    }
  } else if (
    (apartment.type === "apartment" || apartment.type === "studio") &&
    criteria.roomCount &&
    criteria.roomCount !== "any"
  ) {
    const desiredRooms =
      criteria.roomCount === "4+" ? 4 : parseInt(criteria.roomCount);
    const actualRooms = apartment.rooms || 1;

    if (actualRooms === desiredRooms) {
      score += 3;
    }
  }

  // 3. Площадь (2 балла)
  if (criteria.houseArea && apartment.area) {
    const desiredArea = parseInt(criteria.houseArea);
    const areaDiff = Math.abs(apartment.area - desiredArea) / desiredArea;

    if (areaDiff <= 0.1) {
      score += 2;
    } else if (areaDiff <= 0.2) {
      score += 1;
    }
  }

  // 4. Удобства (1 балл)
  if (criteria.amenities.length > 0 && apartment.amenities) {
    const matchedAmenities = criteria.amenities.filter((amenity) =>
      apartment.amenities!.includes(amenity)
    ).length;

    const amenityRatio = matchedAmenities / criteria.amenities.length;
    score += amenityRatio;
  }

  return {
    ...apartment,
    relevanceScore: Math.min(10, score),
    isPromoted: Math.random() > 0.8,
  };
};

export const sortApartmentsByRelevance = (
  apartments: Apartment[],
  criteria: SearchCriteria
): ScoredApartment[] => {
  const scored = apartments
    .map((apartment) => calculateRelevanceScore(apartment, criteria))
    .filter((apartment) => apartment.relevanceScore > 0) // ФИЛЬТРУЕМ ТОЛЬКО С БАЛЛАМИ > 0
    .sort((a, b) => {
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;
      return b.relevanceScore - a.relevanceScore;
    });

  return scored;
};
