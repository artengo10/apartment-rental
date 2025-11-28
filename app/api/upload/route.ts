import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Конвертируем File в base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Загружаем на imgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append("image", base64Image);

    const imgbbResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: "POST",
        body: imgbbFormData,
      }
    );

    const imgbbData = await imgbbResponse.json();

    if (!imgbbData.success) {
      throw new Error("ImgBB upload failed");
    }

    return NextResponse.json({
      success: true,
      imageUrl: imgbbData.data.url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке изображения" },
      { status: 500 }
    );
  }
}
