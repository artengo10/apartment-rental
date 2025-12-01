// app/api/geocode/suggest/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Кэш в памяти (для разработки)
const searchCache = new Map();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  // Проверяем кэш
  const cacheKey = query.toLowerCase();
  if (searchCache.has(cacheKey)) {
    console.log('📦 Serving from cache:', cacheKey);
    return NextResponse.json(searchCache.get(cacheKey));
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    
    // Используем Geocoding API для поиска
    const geocodeUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${encodeURIComponent(query)}&format=json&results=10`;
    
    console.log('🔍 Fetching from Geocoding API:', geocodeUrl);
    
    const response = await fetch(geocodeUrl);
    console.log('📡 Geocoding API response status:', response.status);

    if (response.ok) {
      const geocodeData = await response.json();
      const featureMember = geocodeData.response.GeoObjectCollection.featureMember;
      
      console.log('✅ Geocoding API success, found:', featureMember.length, 'results');
      
      // Преобразуем ответ Geocoding API в формат Suggest API
      const transformedResults = featureMember.map((item: any) => {
        const geoObject = item.GeoObject;
        const [lng, lat] = geoObject.Point.pos.split(' ').map(parseFloat);
        
        return {
          value: geoObject.name + (geoObject.description ? ', ' + geoObject.description : ''),
          data: {
            geo_lat: lat.toString(),
            geo_lon: lng.toString(),
            // Добавляем дополнительные данные для фильтрации
            address: geoObject.metaDataProperty.GeocoderMetaData.Address
          }
        };
      });

      // Фильтруем только Нижегородскую область
      const nizhegorodResults = transformedResults.filter((item: any) => {
        const address = item.value.toLowerCase();
        const components = item.data.address?.Components || [];
        
        return address.includes('нижегород') || 
               address.includes('нижний новгород') ||
               address.includes('дзержинск') ||
               address.includes('арзамас') ||
               address.includes('саров') ||
               address.includes('бор') ||
               address.includes('кстово') ||
               components.some((comp: any) => 
                 comp.name && comp.name.toLowerCase().includes('нижегород')
               );
      });

      const result = {
        results: nizhegorodResults.length > 0 ? nizhegorodResults : transformedResults
      };

      // Сохраняем в кэш на 5 минут
      searchCache.set(cacheKey, result);
      setTimeout(() => searchCache.delete(cacheKey), 5 * 60 * 1000);

      return NextResponse.json(result);
    } else {
      const errorText = await response.text();
      console.error('❌ Geocoding API error:', response.status, errorText);
      throw new Error(`Geocoding API error: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Geocoding error:', error);
    
    // Fallback на локальные данные
    const fallbackData = {
      results: getFallbackSuggestions(query)
    };
    
    return NextResponse.json(fallbackData);
  }
}

// Локальные данные для fallback
function getFallbackSuggestions(query: string) {
  const allAddresses = [
    { value: "ул. Ногина, 22, Нижний Новгород, Нижегородская область", lat: 56.2965, lng: 43.9361 },
    { value: "ул. Ногина, 24, Нижний Новгород, Нижегородская область", lat: 56.2967, lng: 43.9363 },
    { value: "ул. Ногина, 20, Нижний Новгород, Нижегородская область", lat: 56.2963, lng: 43.9359 },
    { value: "ул. Большая Покровская, 1, Нижний Новгород", lat: 56.3175, lng: 43.9975 },
    { value: "ул. Рождественская, 1, Нижний Новгород", lat: 56.3279, lng: 43.9856 },
    { value: "ул. Гастелло, 1, Дзержинск, Нижегородская область", lat: 56.2389, lng: 43.4631 },
    { value: "ул. Карла Маркса, 1, Арзамас, Нижегородская область", lat: 55.3948, lng: 43.8399 },
    { value: "ул. Ленина, 1, Бор, Нижегородская область", lat: 56.3581, lng: 44.0748 },
    { value: "ул. Магистральная, 1, Кстово, Нижегородская область", lat: 56.1473, lng: 44.1975 }
  ];

  const queryLower = query.toLowerCase();
  return allAddresses
    .filter(item => item.value.toLowerCase().includes(queryLower))
    .slice(0, 5)
    .map(item => ({
      value: item.value,
      data: {
        geo_lat: item.lat.toString(),
        geo_lon: item.lng.toString()
      }
    }));
}
