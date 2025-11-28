// app/api/reviews/host/[hostId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { hostId: string } }
) {
  try {
    const hostId = parseInt(params.hostId);

    const reviews = await prisma.review.findMany({
      where: {
        hostId: hostId,
        status: "APPROVED", // Только одобренные отзывы
      },
      include: {
        author: {
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
    console.error("Error fetching host reviews:", error);
    return NextResponse.json(
      { error: "Ошибка при получении отзывов" },
      { status: 500 }
    );
  }
}
