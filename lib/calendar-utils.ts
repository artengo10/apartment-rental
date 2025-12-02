import { CalendarAvailability, DailyPrice } from "@/types/calendar";

/**
 * Генерация календаря на месяц
 */
export function generateMonthCalendar(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const calendar: Date[] = [];

  // Добавляем дни предыдущего месяца для заполнения первой недели
  const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = firstDayOfWeek; i > 0; i--) {
    const date = new Date(year, month, 1 - i);
    calendar.push(date);
  }

  // Добавляем дни текущего месяца
  for (let day = 1; day <= lastDay.getDate(); day++) {
    calendar.push(new Date(year, month, day));
  }

  // Добавляем дни следующего месяца для заполнения последней недели
  const lastDayOfWeek = lastDay.getDay() === 0 ? 7 : lastDay.getDay();
  for (let i = 1; i <= 7 - lastDayOfWeek; i++) {
    calendar.push(new Date(year, month + 1, i));
  }

  return calendar;
}

/**
 * Проверка доступности дат
 */
export function checkDateAvailability(
  checkIn: Date,
  checkOut: Date,
  availability: CalendarAvailability[],
  apartmentMinStay: number = 1
): { available: boolean; totalPrice: number; message?: string } {
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (nights < apartmentMinStay) {
    return {
      available: false,
      totalPrice: 0,
      message: `Минимальное количество ночей: ${apartmentMinStay}`,
    };
  }

  let totalPrice = 0;
  const currentDate = new Date(checkIn);

  while (currentDate < checkOut) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayAvailability = availability.find((a) => a.date === dateStr);

    if (
      !dayAvailability ||
      dayAvailability.isBlocked ||
      dayAvailability.isBooked
    ) {
      return {
        available: false,
        totalPrice: 0,
        message: `Дата ${currentDate.toLocaleDateString("ru-RU")} недоступна`,
      };
    }

    totalPrice += dayAvailability.price;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { available: true, totalPrice };
}

/**
 * Форматирование даты для отображения
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Форматирование периода
 */
export function formatDateRange(start: Date, end: Date): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

/**
 * Получение цены за день
 */
export function getDayPrice(
  date: Date,
  basePrice: number,
  dailyPrices: DailyPrice[]
): { price: number; isBlocked: boolean } {
  const dateStr = date.toISOString().split("T")[0];
  const dailyPrice = dailyPrices.find(
    (dp) => new Date(dp.date).toISOString().split("T")[0] === dateStr
  );

  return {
    price: dailyPrice?.price ?? basePrice,
    isBlocked: dailyPrice?.isBlocked ?? false,
  };
}
