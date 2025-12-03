// lib/filter-apartments.ts
import { SearchCriteria } from "@/types/scoring";
import { Apartment } from "@/types/apartment";

export function filterApartments(
  apartments: Apartment[],
  criteria: SearchCriteria
): Apartment[] {
  return apartments.filter((apartment) => {
    // Фильтр по типу жилья
    if (
      criteria.propertyType !== "all" &&
      apartment.type !== criteria.propertyType
    ) {
      return false;
    }

    // Фильтр по количеству комнат (только для квартир и студий)
    if (
      (apartment.type === "apartment" || apartment.type === "studio") &&
      criteria.roomCount !== "any"
    ) {
      const roomCount =
        criteria.roomCount === "4+" ? 4 : parseInt(criteria.roomCount);
      if (apartment.rooms === undefined || apartment.rooms < roomCount) {
        return false;
      }
    }

    // Фильтр по цене
    const price = parseInt(apartment.price.replace("₽", "").trim());
    if (criteria.priceRange.min && price < parseInt(criteria.priceRange.min)) {
      return false;
    }
    if (criteria.priceRange.max && price > parseInt(criteria.priceRange.max)) {
      return false;
    }

    // Фильтр по району
    if (
      criteria.district !== "all" &&
      apartment.district !== criteria.district
    ) {
      return false;
    }

    // Фильтр по удобствам
    if (criteria.amenities.length > 0) {
      const apartmentAmenities = apartment.amenities || [];
      // Проверяем, что все выбранные удобства есть в квартире
      const hasAllAmenities = criteria.amenities.every((amenity) =>
        apartmentAmenities.includes(amenity)
      );
      if (!hasAllAmenities) {
        return false;
      }
    }

    return true;
  });
}
