// app/api/admin/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth-utils";

export const dynamic = "force-dynamic";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    // Создаем правильный where объект с типизацией
    let where: { status?: ReviewStatus } = {};

    if (statusParam && statusParam !== "ALL") {
      // Проверяем, что статус является допустимым значением
      const validStatuses: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED"];
      if (validStatuses.includes(statusParam as ReviewStatus)) {
        where.status = statusParam as ReviewStatus;
      }
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Ошибка при получении отзывов" },
      { status: 500 }
    );
  }
}
