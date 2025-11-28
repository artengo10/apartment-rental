// app/api/admin/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth-utils"; // Теперь этот импорт будет работать

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Неверный статус" }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id: parseInt(params.id) },
      data: { status },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        // ИСПРАВИТЬ: использовать правильное имя отношения из Prisma схемы
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        apartment: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении отзыва" },
      { status: 500 }
    );
  }
}
