import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // 'gmail'
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Не указаны обязательные поля: to, subject, html" },
        { status: 400 }
      );
    }

    // Проверяем наличие email настроек
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER, // artemklimanov200@gmail.com
      to,
      subject,
      html,
    };

    console.log(`📧 Attempting to send email to: ${to}`);

    const result = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to: ${to}`);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("❌ Email sending error:", error);

    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
