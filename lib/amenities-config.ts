// lib/amenities-config.ts

export type Amenity = {
  id: string;
  name: string;
  label: string;
};

export type PropertyType = "APARTMENT" | "HOUSE" | "STUDIO";

export const amenitiesByType: Record<PropertyType, Amenity[]> = {
  APARTMENT: [
    { id: "wifi", name: "Wi-Fi", label: "Wi-Fi" },
    { id: "air_conditioning", name: "Кондиционер", label: "Кондиционер" },
    {
      id: "washing_machine",
      name: "Стиральная машина",
      label: "Стиральная машина",
    },
    { id: "tv", name: "Телевизор", label: "Телевизор" },
    { id: "furniture", name: "Мебель", label: "Мебель" },
    { id: "fridge", name: "Холодильник", label: "Холодильник" },
  ],
  HOUSE: [
    { id: "wifi", name: "Wi-Fi", label: "Wi-Fi" },
    { id: "air_conditioning", name: "Кондиционер", label: "Кондиционер" },
    { id: "sauna", name: "Баня/Сауна", label: "Баня/Сауна" },
    { id: "barbecue", name: "Мангал/Гриль", label: "Мангал/Гриль" },
    { id: "sports", name: "Спортплощадка", label: "Спортплощадка" },
    { id: "hot_tub", name: "Банный чан", label: "Банный чан" }, // ЗАМЕНА: Гараж → Банный чан
  ],
  STUDIO: [
    { id: "wifi", name: "Wi-Fi", label: "Wi-Fi" },
    { id: "kitchen", name: "Кухня", label: "Кухня" },
    { id: "tv", name: "TV", label: "TV" },
    { id: "air_conditioning", name: "Кондиционер", label: "Кондиционер" },
    {
      id: "washing_machine",
      name: "Стиральная машина",
      label: "Стиральная машина",
    },
    { id: "parking", name: "Парковка", label: "Парковка" },
    { id: "elevator", name: "Лифт", label: "Лифт" },
    { id: "balcony", name: "Балкон", label: "Балкон" },
  ],
};

// Функция для получения удобств по типу
export function getAmenitiesByType(type: PropertyType): Amenity[] {
  return amenitiesByType[type] || [];
}

// Функция для получения названий удобств (для отправки на сервер)
export function getAmenityNamesByType(type: PropertyType): string[] {
  return amenitiesByType[type]?.map((amenity) => amenity.name) || [];
}

// Функция для преобразования старых удобств в новые (для миграции)
export function mapLegacyAmenities(
  amenities: string[],
  type: PropertyType
): string[] {
  const typeAmenities = getAmenitiesByType(type);
  const mappedAmenities: string[] = [];

  amenities.forEach((legacyAmenity) => {
    // Ищем совпадение по name или label
    const matched = typeAmenities.find(
      (a) => a.name === legacyAmenity || a.label === legacyAmenity
    );
    if (matched) {
      mappedAmenities.push(matched.name);
    }
  });

  return mappedAmenities;
}

// Функция для получения всех удобств (для фильтров)
export function getAllAmenitiesForFilters(): Amenity[] {
  const allAmenities = new Map<string, Amenity>();

  // Собираем все уникальные удобства из всех типов
  Object.values(amenitiesByType).forEach((amenities) => {
    amenities.forEach((amenity) => {
      if (!allAmenities.has(amenity.id)) {
        allAmenities.set(amenity.id, amenity);
      }
    });
  });

  return Array.from(allAmenities.values());
}

// Функция для получения удобств для конкретного типа (для фильтров)
export function getAmenitiesForTypeInFilters(type: PropertyType): Amenity[] {
  return amenitiesByType[type] || [];
}
