// app/api/geocode/coordinates/route.ts
import { NextRequest, NextResponse } from "next/server";

const coordinatesCache = new Map();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
      { status: 400 }
    );
  }

  // Проверяем кэш
  const cacheKey = address.toLowerCase();
  if (coordinatesCache.has(cacheKey)) {
    console.log("📦 Serving coordinates from cache:", cacheKey);
    return NextResponse.json(coordinatesCache.get(cacheKey));
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    const geocodeUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${encodeURIComponent(
      address
    )}&format=json`;

    console.log("🔍 Fetching coordinates for:", address);

    const response = await fetch(geocodeUrl);

    if (response.ok) {
      const geocodeData = await response.json();
      const featureMember =
        geocodeData.response.GeoObjectCollection.featureMember;

      if (featureMember.length > 0) {
        const geoObject = featureMember[0].GeoObject;
        const [lng, lat] = geoObject.Point.pos.split(" ").map(parseFloat);

        const result = {
          response: {
            GeoObjectCollection: {
              featureMember: [
                {
                  GeoObject: {
                    Point: { pos: geoObject.Point.pos },
                    name: geoObject.name,
                    description: geoObject.description,
                  },
                },
              ],
            },
          },
        };

        // Сохраняем в кэш на 1 час
        coordinatesCache.set(cacheKey, result);
        setTimeout(() => coordinatesCache.delete(cacheKey), 60 * 60 * 1000);

        return NextResponse.json(result);
      } else {
        throw new Error("Address not found");
      }
    } else {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Coordinates error:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}
