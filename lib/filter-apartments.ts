// lib/filter-apartments.ts - ОБНОВЛЕННЫЙ С ФИЛЬТРАЦИЕЙ УДОБСТВ
import { Apartment } from "@/types/apartment";
import { SearchCriteria } from "@/types/scoring";

export const filterApartments = (
  apartments: Apartment[],
  criteria: SearchCriteria
): Apartment[] => {
  let filtered = apartments;

  // Фильтр по типу жилья
  if (criteria.propertyType !== "all") {
    filtered = filtered.filter(
      (apartment) => apartment.type === criteria.propertyType
    );
  }

  // Фильтр по количеству комнат (только для квартир)
  if (
    criteria.propertyType === "apartment" &&
    criteria.roomCount &&
    criteria.roomCount !== "any"
  ) {
    if (criteria.roomCount === "4+") {
      filtered = filtered.filter((apartment) => (apartment.rooms || 0) >= 4);
    } else {
      const roomCount = parseInt(criteria.roomCount);
      filtered = filtered.filter((apartment) => apartment.rooms === roomCount);
    }
  }

  // Фильтр по цене
  if (criteria.priceRange.min || criteria.priceRange.max) {
    const minPrice = parseInt(criteria.priceRange.min) || 0;
    const maxPrice = parseInt(criteria.priceRange.max) || 100000;

    filtered = filtered.filter((apartment) => {
      const price = parseInt(apartment.price.replace(/[^\d]/g, ""));
      return price >= minPrice && price <= maxPrice;
    });
  }

  // Фильтр по району
  if (criteria.district && criteria.district !== "all") {
    filtered = filtered.filter((apartment) =>
      apartment.district.toLowerCase().includes(criteria.district.toLowerCase())
    );
  }

  // Фильтр по удобствам (если есть выбранные удобства)
  if (criteria.amenities && criteria.amenities.length > 0) {
    filtered = filtered.filter((apartment) => {
      // Если у квартиры нет информации об удобствах, пропускаем
      if (!apartment.amenities) return false;

      // Проверяем, что все выбранные удобства есть у квартиры
      return criteria.amenities.every((amenity) =>
        apartment.amenities!.includes(amenity)
      );
    });
  }

  // Дополнительные фильтры для домов
  if (criteria.propertyType === "house") {
    // Фильтр по площади
    if (criteria.houseArea) {
      const desiredArea = parseInt(criteria.houseArea);
      filtered = filtered.filter(
        (apartment) =>
          apartment.area &&
          apartment.area >= desiredArea * 0.8 &&
          apartment.area <= desiredArea * 1.2
      );
    }

    // Фильтр по этажности
    if (criteria.houseFloors && criteria.houseFloors !== "1") {
      if (criteria.houseFloors === "2") {
        // Для домов поле floor может означать количество этажей
        filtered = filtered.filter((apartment) => apartment.floor === 2);
      } else if (criteria.houseFloors === "3+") {
        filtered = filtered.filter((apartment) => (apartment.floor || 0) >= 3);
      }
    }
  }

  // Сортируем: сначала продвинутые (isPromoted), потом остальные
  return filtered.sort((a, b) => {
    const aPromoted = (a as any).isPromoted ? 1 : 0;
    const bPromoted = (b as any).isPromoted ? 1 : 0;
    return bPromoted - aPromoted;
  });
};
