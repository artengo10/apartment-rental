import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Конвертируем файл в base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString("base64");

      // Отправляем на ImgBB
      const uploadFormData = new FormData();
      uploadFormData.append("image", base64Image);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      const result = await response.json();

      if (result.success) {
        uploadedUrls.push(result.data.url);
      } else {
        console.error("ImgBB upload failed:", result);
        return NextResponse.json(
          {
            error: `Failed to upload image: ${
              result.error?.message || "Unknown error"
            }`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
