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

// Реальная отправка verification code
export async function sendVerificationCode(
  email: string,
  code: string
): Promise<void> {
  try {
    console.log(`📧 Sending verification code to: ${email}`);

    const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Код подтверждения для регистрации',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Подтверждение регистрации</h2>
            <p>Ваш код подтверждения для завершения регистрации:</p>
            <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #666; font-size: 14px;">
              Код действителен в течение 10 минут.<br>
              Если вы не регистрировались на нашем сайте, проигнорируйте это письмо.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Email sending failed: ${errorData.error}`);
    }

    console.log(`✅ Verification code sent to: ${email}`);

  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Не удалось отправить код подтверждения');
  }
}
