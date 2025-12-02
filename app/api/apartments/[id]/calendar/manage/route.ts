import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Получаем токен из заголовков
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Здесь ваша логика проверки токена
    // const user = await verifyToken(token);

    const apartmentId = parseInt(params.id);

    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: {
        pricingRules: {
          orderBy: { date: "asc" },
        },
        bookings: {
          where: {
            status: { in: ["CONFIRMED", "PENDING"] },
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!apartment) {
      return NextResponse.json(
        { error: "Квартира не найдена" },
        { status: 404 }
      );
    }

    // Временно закомментируем проверку владельца
    // if (apartment.hostId !== user.id) {
    //   return NextResponse.json(
    //     { error: 'Только владелец может управлять календарем' },
    //     { status: 403 }
    //   );
    // }

    return NextResponse.json({
      apartment: {
        id: apartment.id,
        title: apartment.title,
        basePrice: apartment.price,
      },
      pricingRules: apartment.pricingRules,
      bookings: apartment.bookings.map((booking) => ({
        id: booking.id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        totalPrice: booking.totalPrice,
        user: booking.user,
        createdAt: booking.createdAt,
      })),
    });
  } catch (error) {
    console.error("Ошибка manage календаря:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
