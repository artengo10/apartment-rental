import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Хеширование пароля
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Проверка пароля
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Генерация 6-значного кода подтверждения
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Генерация JWT токена
export function generateToken(userId: number): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ userId }, jwtSecret, { expiresIn: "30d" });
}

// Верификация JWT токена
export function verifyToken(token: string): { userId: number } {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.verify(token, jwtSecret) as { userId: number };
}

// Заглушка для отправки email (в разработке)
export async function sendVerificationCode(
  email: string,
  code: string
): Promise<void> {
  // В реальном приложении здесь будет интеграция с email сервисом
  console.log(`📧 Verification code for ${email}: ${code}`);
  // Для разработки просто выводим код в консоль
}
