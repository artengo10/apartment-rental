import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - получить объявления на модерации
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const apartments = await prisma.apartment.findMany({
      where: {
        isPublished: status === "published" ? true : false,
      },
      include: {
        host: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(apartments);
  } catch (error) {
    console.error("Error fetching apartments for moderation:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке объявлений" },
      { status: 500 }
    );
  }
}

// PATCH - изменить статус объявления
export async function PATCH(request: NextRequest) {
  try {
    const { apartmentId, action } = await request.json();

    if (!apartmentId || !action) {
      return NextResponse.json(
        { error: "Неверные параметры" },
        { status: 400 }
      );
    }

    const apartment = await prisma.apartment.update({
      where: { id: apartmentId },
      data: {
        isPublished: action === "approve" ? true : false,
      },
      include: {
        host: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Отправляем уведомление в Telegram о результате модерации
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const message =
        action === "approve"
          ? `✅ Объявление одобрено!\n\n"${apartment.title}"\nТеперь видно в поиске.`
          : `❌ Объявление отклонено\n\n"${apartment.title}"\nТребует правок.`;

      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
          }),
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? "Объявление опубликовано"
          : "Объявление отклонено",
      apartment,
    });
  } catch (error) {
    console.error("Error updating apartment status:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении статуса" },
      { status: 500 }
    );
  }
}
