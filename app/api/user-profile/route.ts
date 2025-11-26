import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    console.log("🔍 User Profile API - userIdParam:", userIdParam);

    if (!userIdParam) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userId = parseInt(userIdParam);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    console.log("🔍 Fetching user profile for ID:", userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log("❌ User not found for ID:", userId);
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    console.log("✅ User profile found:", user.name);
    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ Ошибка при получении пользователя:", error);
    return NextResponse.json(
      { error: "Ошибка при получении пользователя" },
      { status: 500 }
    );
  }
}
