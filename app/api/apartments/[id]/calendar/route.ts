import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eachDayOfInterval, format } from "date-fns";

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
        },
        bookings: {
          where: {
            status: { in: ["CONFIRMED", "PENDING"] },
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

    // Формируем карту цен
    const priceMap: Record<string, number> = {};
    apartment.pricingRules.forEach((rule) => {
      const dateStr = format(new Date(rule.date), "yyyy-MM-dd");
      priceMap[dateStr] = rule.price;
    });

    // Формируем забронированные даты
    const bookedDates: string[] = [];
    apartment.bookings.forEach((booking) => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const dates = eachDayOfInterval({
        start,
        end: new Date(end.getTime() - 24 * 60 * 60 * 1000),
      });

      dates.forEach((date) => {
        bookedDates.push(format(date, "yyyy-MM-dd"));
      });
    });

    return NextResponse.json({
      basePrice: apartment.price,
      priceMap,
      bookedDates,
    });
  } catch (error) {
    console.error("Ошибка календаря:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
