declare global {
  interface Window {
    ymaps: any;
    ymapsPromise: Promise<void> | null;
  }
}

class YandexMapsLoader {
  private static instance: YandexMapsLoader;
  private loadPromise: Promise<void> | null = null;
  private isLoaded = false;

  private constructor() {}

  public static getInstance(): YandexMapsLoader {
    if (!YandexMapsLoader.instance) {
      YandexMapsLoader.instance = new YandexMapsLoader();
    }
    return YandexMapsLoader.instance;
  }

  public load(apiKey: string): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      if (window.ymaps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      script.onload = () => {
        window.ymaps.ready(() => {
          this.isLoaded = true;
          resolve();
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  public destroy() {
    // Очищаем состояние, но не удаляем скрипт
    this.loadPromise = null;
    this.isLoaded = false;
  }
}

export const yandexMapsLoader = YandexMapsLoader.getInstance();
