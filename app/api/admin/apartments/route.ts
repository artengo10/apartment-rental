import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/admin-auth-utils";

export const dynamic = "force-dynamic";


// GET - получить объявления на модерации
export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию админа
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    try {
      verifyAdminToken(token);
    } catch (error) {
      return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    // Получаем квартиры с указанным статусом
    const apartments = await prisma.apartment.findMany({
      where: {
        status: status,
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
    // Проверяем авторизацию админа
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    try {
      verifyAdminToken(token);
    } catch (error) {
      return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
    }

    const { apartmentId, action, rejectionReason } = await request.json();

    if (!apartmentId || !action) {
      return NextResponse.json(
        { error: "Неверные параметры" },
        { status: 400 }
      );
    }

    let updateData: any = {};

    if (action === "approve") {
      updateData.status = "APPROVED";
      updateData.isPublished = true;
      updateData.publishedAt = new Date();
    } else if (action === "reject") {
      updateData.status = "REJECTED";
      updateData.isPublished = false;
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
    } else {
      return NextResponse.json({ error: "Неверный action" }, { status: 400 });
    }

    const apartment = await prisma.apartment.update({
      where: { id: apartmentId },
      data: updateData,
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
