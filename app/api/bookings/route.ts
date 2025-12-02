import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eachDayOfInterval, format, isWithinInterval } from "date-fns";

// GET: Получить бронирования
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const apartmentId = searchParams.get("apartmentId");

    const where: any = {};
    if (userId) where.userId = parseInt(userId);
    if (apartmentId) where.apartmentId = parseInt(apartmentId);

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        apartment: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Ошибка получения бронирований:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// POST: Создать бронирование
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apartmentId, userId, startDate, endDate, totalPrice, comment } =
      body;

    // Проверяем доступность дат
    const existingBookings = await prisma.booking.findMany({
      where: {
        apartmentId: parseInt(apartmentId),
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    });

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    // Проверяем пересечения
    const hasConflict = existingBookings.some((booking: any) => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      return requestedStart < bookingEnd && requestedEnd > bookingStart;
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: "Выбранные даты уже заняты" },
        { status: 400 }
      );
    }

    // Создаем бронирование
    const booking = await prisma.booking.create({
      data: {
        apartmentId: parseInt(apartmentId),
        userId: parseInt(userId),
        startDate: requestedStart,
        endDate: requestedEnd,
        totalPrice: parseInt(totalPrice),
        comment,
        status: "PENDING",
      },
      include: {
        apartment: true,
        user: true,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Ошибка создания бронирования:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
