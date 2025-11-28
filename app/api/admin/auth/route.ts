import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Находим админа по email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 400 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 400 }
      );
    }

    // Генерируем JWT токен
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Возвращаем токен и данные админа (без пароля)
    const { password: _, ...adminWithoutPassword } = admin;

    return NextResponse.json({
      token,
      admin: adminWithoutPassword,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Ошибка при входе" }, { status: 500 });
  }
}
