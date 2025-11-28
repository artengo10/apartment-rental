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
  images: string[]; 
  amenities?: string[];
  hostName?: string;
  hostRating?: number;
  hostId: number;
  isFavorite?: boolean;
}

