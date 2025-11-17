import { Apartment } from "@/types/apartment";
import { SearchCriteria, ScoredApartment } from "@/types/scoring";

export const calculateRelevanceScore = (
  apartment: Apartment,
  criteria: SearchCriteria
): ScoredApartment => {
  let score = 0;
  const maxScore = 10;

  // 1. ТИП ЖИЛЬЯ (3 балла) - жесткий критерий
  if (
    criteria.propertyType === "all" ||
    apartment.type === criteria.propertyType
  ) {
    score += 3;
  } else {
    // Если тип не совпадает - сразу 0 баллов
    return { ...apartment, relevanceScore: 0 };
  }

  // 2. ЦЕНА (3 балла) - очень важно
  const price = parseInt(apartment.price.replace(/[^\d]/g, ""));
  const minPrice = parseInt(criteria.priceRange.min) || 0;
  const maxPrice = parseInt(criteria.priceRange.max) || 10000;

  if (minPrice > 0 && maxPrice > 0) {
    if (price >= minPrice && price <= maxPrice) {
      score += 3;
    } else if (price >= minPrice * 0.8 && price <= maxPrice * 1.2) {
      score += 1; // Частичное совпадение
    }
  }

  // 3. РАЙОН (2 балла)
  if (
    apartment.district.toLowerCase().includes(criteria.district.toLowerCase())
  ) {
    score += 2;
  }

  // 4. КОМНАТЫ/ПЛОЩАДЬ (2 балла) - только если тип конкретный и указаны предпочтения
  if (apartment.type === "house" && criteria.houseArea && apartment.area) {
    const desiredArea = parseInt(criteria.houseArea);
    const areaDiff = Math.abs(apartment.area - desiredArea) / desiredArea;
    if (areaDiff <= 0.2) score += 2;
    else if (areaDiff <= 0.4) score += 1;
  } else if (
    (apartment.type === "apartment" || apartment.type === "studio") &&
    criteria.roomCount &&
    criteria.roomCount !== "any"
  ) {
    const desiredRooms =
      criteria.roomCount === "4+" ? 4 : parseInt(criteria.roomCount);
    const actualRooms = apartment.rooms || 1;
    if (actualRooms === desiredRooms) score += 2;
  }

  return {
    ...apartment,
    relevanceScore: Math.min(maxScore, score),
    isPromoted: score >= 7 && Math.random() > 0.7,
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
