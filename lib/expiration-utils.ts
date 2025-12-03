// lib/expiration-utils.ts

/**
 * Утилиты для управления сроками публикации объявлений
 */

// Вычисляем дату истечения (30 дней от текущей даты)
export function calculateExpirationDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
}

// Вычисляем оставшиеся дни
export function getDaysRemaining(expiresAt: Date | string | null): number {
  if (!expiresAt) return 0;

  const now = new Date();
  const expirationDate = new Date(expiresAt);
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays); // Не возвращаем отрицательные значения
}

// Проверяем, истек ли срок
export function isExpired(expiresAt: Date | string | null): boolean {
  if (!expiresAt) return false;

  const now = new Date();
  const expirationDate = new Date(expiresAt);
  return expirationDate < now;
}

// Получаем статус публикации
export function getPublicationStatus(
  isPublished: boolean,
  expiresAt: Date | string | null
): "active" | "expired" | "archived" | "draft" {
  if (!isPublished) return "draft";
  if (isExpired(expiresAt)) return "expired";
  return "active";
}

// Форматируем оставшееся время для отображения
export function formatTimeRemaining(expiresAt: Date | string | null): string {
  if (!expiresAt) return "Не установлен";

  const daysRemaining = getDaysRemaining(expiresAt);

  if (daysRemaining === 0) return "Сегодня истекает";
  if (daysRemaining === 1) return "Завтра истекает";
  if (daysRemaining < 7) return `Осталось ${daysRemaining} дней`;
  if (daysRemaining < 30)
    return `Осталось ${Math.floor(daysRemaining / 7)} недель`;

  const months = Math.floor(daysRemaining / 30);
  const remainingDays = daysRemaining % 30;

  if (remainingDays === 0) {
    return `Осталось ${months} ${
      months === 1 ? "месяц" : months < 5 ? "месяца" : "месяцев"
    }`;
  }

  return `Осталось ${months} мес. ${remainingDays} дн.`;
}

// Генерируем сообщение о статусе
export function getStatusMessage(
  expiresAt: Date | string | null,
  isPublished: boolean
): string {
  const status = getPublicationStatus(isPublished, expiresAt);
  const daysRemaining = getDaysRemaining(expiresAt);

  switch (status) {
    case "active":
      return formatTimeRemaining(expiresAt);
    case "expired":
      return "Срок истёк";
    case "archived":
      return "В архиве";
    case "draft":
      return "Черновик";
    default:
      return "Неизвестный статус";
  }
}

// Возвращает цветовую схему в зависимости от оставшегося времени
export function getStatusColor(
  daysRemaining: number,
  isPublished: boolean
): {
  bg: string;
  text: string;
  border: string;
} {
  if (!isPublished) {
    return {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
    };
  }

  if (daysRemaining > 7) {
    return {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
    };
  }

  if (daysRemaining > 3) {
    return {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
    };
  }

  if (daysRemaining > 0) {
    return {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
    };
  }

  return {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
  };
}
