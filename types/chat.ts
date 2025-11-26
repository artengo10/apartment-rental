// types/chat.ts
export interface ChatUser {
  id: number;
  email: string;
  name: string;
  phone: string;
  isVerified: boolean;
}

export interface ChatApartment {
  id: number;
  title: string;
  price: number;
  images: string[];
}

export interface Chat {
  id: number;
  apartmentId: number;
  tenantId: number;
  hostId: number;
  createdAt: string;
  updatedAt: string;

  apartment?: ChatApartment;
  tenant?: ChatUser;
  host?: ChatUser;
  messages?: Message[];
  unreadCount?: number;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  chatId: number;
  isRead: boolean;
  createdAt: string;

  sender?: ChatUser;
}

export interface CreateChatData {
  apartmentId: number;
  tenantId: number;
  hostId: number;
}
