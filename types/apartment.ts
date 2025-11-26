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
  photos?: string[];
  amenities?: string[];
  hostName?: string;
  hostRating?: number;
  hostId: number; // ДОБАВЛЕНО
}



// Центры районов Нижнего Новгорода
const districtCenters = {
  Сормовский: { lat: 56.3287, lng: 43.8547 },
  Нижегородский: { lat: 56.2964, lng: 43.9361 },
  Советский: { lat: 56.29, lng: 43.99 },
  Приокский: { lat: 56.27, lng: 43.96 },
  Ленинский: { lat: 56.32, lng: 43.87 },
  Канавинский: { lat: 56.26, lng: 43.9 },
  Московский: { lat: 56.31, lng: 43.92 },
  Автозаводский: { lat: 56.25, lng: 43.86 },
};

// Функция для генерации случайных координат в районе
const generateCoordinates = (center: { lat: number; lng: number }) => {
  const randomOffset = () => (Math.random() - 0.5) * 0.03;
  return {
    lat: center.lat + randomOffset(),
    lng: center.lng + randomOffset(),
  };
};

// Генерация жилищ с hostId
export const apartments: Apartment[] = [
  // Сормовский район
  {
    id: 1,
    ...generateCoordinates(districtCenters["Сормовский"]),
    title: "1-комнатная у метро",
    price: "1800₽",
    address: "ул. Коминтерна, 15",
    description: "Уютная квартира в 5 минутах от метро",
    type: "apartment",
    district: "Сормовский",
    rooms: 1,
    area: 35,
    floor: 5,
    hostId: 1, // ДОБАВЬТЕ ЭТО
  },
  {
    id: 2,
    ...generateCoordinates(districtCenters["Сормовский"]),
    title: "2-комнатная",
    price: "2400₽",
    address: "ул. Ярошенко, 8",
    description: "Просторная для семьи или компании",
    type: "apartment",
    district: "Сормовский",
    rooms: 2,
    area: 48,
    floor: 7,
    amenities: ["Wi-Fi", "Кондиционер", "Телевизор"],
    hostId: 2, // ДОБАВЬТЕ ЭТО
  },
  {
    id: 3,
    ...generateCoordinates(districtCenters["Сормовский"]),
    title: "3-комнатная",
    price: "3200₽",
    address: "ул. Свободы, 45",
    description: "Большая квартира в тихом дворе",
    type: "apartment",
    district: "Сормовский",
    rooms: 3,
    area: 65,
    floor: 4,
    hostId: 3, // ДОБАВЬТЕ ЭТО
  },
  {
    id: 4,
    ...generateCoordinates(districtCenters["Сормовский"]),
    title: "1-комнатная эконом",
    price: "1400₽",
    address: "ул. Зайцева, 10",
    description: "Бюджетный вариант у Сормовского парка",
    type: "apartment",
    district: "Сормовский",
    rooms: 1,
    area: 32,
    floor: 1,
    amenities: ["Wi-Fi", "Кондиционер", "Телевизор"],
    hostId: 4, // ДОБАВЬТЕ ЭТО
  },
  {
    id: 5,
    ...generateCoordinates(districtCenters["Сормовский"]),
    title: "2-комнатная с балконом",
    price: "2600₽",
    address: "ул. Дмитрия Павлова, 20",
    description: "Свежий ремонт, есть вся техника",
    type: "apartment",
    district: "Сормовский",
    rooms: 2,
    area: 50,
    floor: 6,
    hostId: 5, // ДОБАВЬТЕ ЭТО
  },

  // Нижегородский район (5 квартир)
  {
    id: 6,
    ...generateCoordinates(districtCenters["Нижегородский"]),
    title: "1-комнатная с видом на Кремль",
    price: "2800₽",
    address: "ул. Ильинская, 10",
    description: "Панорамный вид на исторический центр",
    type: "apartment",
    district: "Нижегородский",
    rooms: 1,
    area: 40,
    floor: 7,
    amenities: ["Wi-Fi", "Кондиционер", "Телевизор"],
    hostId: 6, // ДОБАВЬТЕ ЭТО
  },
  // Советский район (5 квартир)
  {
    id: 15,
    ...generateCoordinates(districtCenters["Советский"]),
    title: "1-комнатная в новостройке",
    price: "2500₽",
    address: "пр. Гагарина, 100",
    description: "Современный жилой комплекс",
    type: "apartment",
    district: "Советский",
    rooms: 1,
    area: 38,
    floor: 12,
    hostId: 1, // ДОБАВЬТЕ ЭТО
  },
  {
    id: 8,
    ...generateCoordinates(districtCenters["Советский"]),
    title: "2-комнатная с гардеробной",
    price: "3300₽",
    address: "ул. Ашхабадская, 24",
    description: "Просторная гардеробная комната",
    type: "apartment",
    district: "Советский",
    rooms: 2,
    area: 53,
    floor: 7,
    hostId: 8, // ДОБАВЬТЕ ЭТО
  },

  // ДОМА (30)
  // Сормовский район (4 дома)
  {
    id: 9,
    ...generateCoordinates(districtCenters["Сормовский"]),
    title: "Частный дом с садом",
    price: "4500₽",
    address: "ул. Мончегорская, 7",
    description: "Уютный дом с большим участком",
    type: "house",
    district: "Сормовский",
    rooms: 3,
    area: 85,
    photos: [
      "/apartments/41/main.jpg", // ГЛАВНАЯ фотография для превью
    ],
    amenities: ["Баня/Сауна", "Мангал/Гриль", "Гараж"],
    hostId: 9, // ДОБАВЬТЕ ЭТО
  },
  {
    id: 7, // Должен совпадать с ID в базе данных
    ...generateCoordinates(districtCenters["Сормовский"]),
    title: "Дом с бассейном",
    price: "6800₽",
    address: "ул. Коминтерна, 25",
    description: "Роскошный дом с частным бассейном",
    type: "house",
    district: "Сормовский",
    rooms: 4,
    area: 120,
    photos: ["/apartments/42/main.jpg"],
    amenities: ["Баня/Сауна", "Мангал/Гриль", "Гараж"],
    hostId: 13, // ID арендодателя artemklimanov200@gmail.com
    hostName: "Климанов Артем Алексееевич",
  },
  {
    id: 11,
    ...generateCoordinates(districtCenters["Сормовский"]),
    title: "Коттедж у парка",
    price: "5200₽",
    address: "ул. Зайцева, 15",
    description: "Современный коттедж рядом с парком",
    type: "house",
    district: "Сормовский",
    rooms: 3,
    area: 95,
    photos: [
      "/apartments/43/main.jpg", // ГЛАВНАЯ фотография для превью
    ],
    hostId: 11, // ДОБАВЬТЕ ЭТО
  },
  // СТУДИИ (30)
  // Сормовский район (4 студии)
  {
    id: 12,
    ...generateCoordinates(districtCenters["Сормовский"]),
    title: "Студия с ремонтом",
    price: "1600₽",
    address: "пр. Кораблестроителей, 25",
    description: "Современный ремонт, вся техника",
    type: "studio",
    district: "Сормовский",
    area: 28,
    floor: 3,
    hostId: 12, // ДОБАВЬТЕ ЭТО
  },
  {
    id: 18,
    ...generateCoordinates(districtCenters["Сормовский"]),
    title: "Студия у парка",
    price: "1550₽",
    address: "ул. Буревестника, 22",
    description: "Тихая студия рядом с парком",
    type: "studio",
    district: "Сормовский",
    area: 26,
    floor: 3,
    hostId: 17, // ДОБАВЬТЕ ЭТО
  },
  {
    id: 14,
    ...generateCoordinates(districtCenters["Сормовский"]),
    title: "Студия для студентов",
    price: "1450₽",
    address: "ул. Коминтерна, 18",
    description: "Идеальный вариант для студентов",
    type: "studio",
    district: "Сормовский",
    area: 25,
    floor: 2,
    hostId: 14, // ДОБАВЬТЕ ЭТО
  },
];
