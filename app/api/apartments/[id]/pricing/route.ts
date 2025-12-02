import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Убрали импорт next-auth и PricingType

// GET: Получить цены на даты для квартиры
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apartmentId = parseInt(params.id);

    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: {
        pricingRules: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: { date: "asc" },
        },
        bookings: {
          where: {
            status: { in: ["CONFIRMED", "PENDING"] },
          },
          select: {
            startDate: true,
            endDate: true,
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

    // Формируем забронированные даты
    const bookedDates: string[] = [];
    apartment.bookings.forEach((booking) => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const current = new Date(start);

      // Исправлено: включаем дату окончания как занятую
      while (current <= end) {
        // Используем UTC дату для избежания проблем с часовыми поясами
        const year = current.getUTCFullYear();
        const month = String(current.getUTCMonth() + 1).padStart(2, "0");
        const day = String(current.getUTCDate()).padStart(2, "0");
        bookedDates.push(`${year}-${month}-${day}`);
        current.setUTCDate(current.getUTCDate() + 1);
      }
    });

    return NextResponse.json({
      basePrice: apartment.price,
      pricingRules: apartment.pricingRules,
      bookedDates,
    });
  } catch (error) {
    console.error("Ошибка получения цен:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// POST: Установить/обновить цену
export async function POST(
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
    //     { error: 'Только владелец может менять цены' },
    //     { status: 403 }
    //   );
    // }

    const body = await req.json();
    const { date, price } = body;

    // Проверяем, не забронирована ли дата
    const existingBooking = await prisma.booking.findFirst({
      where: {
        apartmentId: apartment.id,
        OR: [
          {
            startDate: { lte: new Date(date) },
            endDate: { gt: new Date(date) },
          },
        ],
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Нельзя менять цену на забронированные даты" },
        { status: 400 }
      );
    }

    // Определяем тип цены
    const type = parseInt(price) === apartment.price ? "BASE" : "SPECIAL";

    // Создаем или обновляем цену
    const pricingRule = await prisma.pricingRule.upsert({
      where: {
        apartmentId_date: {
          apartmentId: apartment.id,
          date: new Date(date),
        },
      },
      update: {
        price: parseInt(price),
        type: type,
      },
      create: {
        apartmentId: apartment.id,
        date: new Date(date),
        price: parseInt(price),
        type: type,
        userId: 1, // Временно, замените на ID пользователя из токена
      },
    });

    return NextResponse.json(pricingRule);
  } catch (error) {
    console.error("Ошибка обновления цены:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// DELETE: Удалить особую цену
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Получаем токен из заголовков
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const apartmentId = parseInt(params.id);
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      return NextResponse.json(
        { error: "Квартира не найдена" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Дата обязательна" }, { status: 400 });
    }

    await prisma.pricingRule.delete({
      where: {
        apartmentId_date: {
          apartmentId: apartment.id,
          date: new Date(date),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка удаления цены:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
