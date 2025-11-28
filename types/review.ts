// types/review.ts
export interface Review {
  id: number;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  authorId: number;
  hostId: number;
  apartmentId?: number;
  chatId?: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    name: string;
    avatar?: string;
  };
  host?: {
    // ДОБАВИТЬ ЭТО ПОЛЕ
    id: number;
    name: string;
    avatar?: string;
  };
  apartment?: {
    id: number;
    title: string;
  };
}

export interface CreateReviewData {
  rating: number;
  comment: string;
  hostId: number;
  apartmentId?: number;
  chatId?: number;
}
