export interface Apartment {
  id: number;
  lat: number;
  lng: number;
  title: string;
  price: string;
  address: string;
  description: string;
}

export const apartments: Apartment[] = [
  {
    id: 1,
    lat: 56.327,
    lng: 43.854,
    title: "1-комнатная у метро",
    price: "1800₽",
    address: "ул. Коминтерна, 15",
    description: "Уютная квартира в 5 минутах от метро",
  },
  {
    id: 2,
    lat: 56.33,
    lng: 43.86,
    title: "Студия с ремонтом",
    price: "1600₽",
    address: "пр. Кораблестроителей, 25",
    description: "Современный ремонт, вся техника",
  },
  {
    id: 3,
    lat: 56.325,
    lng: 43.85,
    title: "2-комнатная",
    price: "2400₽",
    address: "ул. Ярошенко, 8",
    description: "Просторная для семьи или компании",
  },
  {
    id: 4,
    lat: 56.332,
    lng: 43.845,
    title: "Апартаменты",
    price: "2800₽",
    address: "бульвар Юбилейный, 12",
    description: "Премиум класс с видом на парк",
  },
  {
    id: 5,
    lat: 56.328,
    lng: 43.855,
    title: "Квартира-студия",
    price: "1700₽",
    address: "ул. Энгельса, 35",
    description: "Идеально для одного человека",
  },
  {
    id: 6,
    lat: 56.323,
    lng: 43.848,
    title: "3-комнатная",
    price: "3200₽",
    address: "ул. Свободы, 45",
    description: "Большая квартира в тихом дворе",
  },
  {
    id: 7,
    lat: 56.335,
    lng: 43.858,
    title: "1-комнатная эконом",
    price: "1400₽",
    address: "ул. Зайцева, 10",
    description: "Бюджетный вариант у Сормовского парка",
  },
  {
    id: 8,
    lat: 56.34,
    lng: 43.85,
    title: "Студия на сутки",
    price: "1500₽",
    address: "ул. Мончегорская, 7",
    description: "Чистая и аккуратная в новом доме",
  },
  {
    id: 9,
    lat: 56.322,
    lng: 43.86,
    title: "2-комнатная с балконом",
    price: "2600₽",
    address: "ул. Дмитрия Павлова, 20",
    description: "Свежий ремонт, есть вся техника",
  },
  {
    id: 10,
    lat: 56.33,
    lng: 43.84,
    title: "Апартаменты бизнес-класс",
    price: "3500₽",
    address: "ул. Героя Юрия Смирнова, 15",
    description: "Роскошные апартаменты с дизайнерским ремонтом",
  },
];
