// hooks/useFavorites.ts - УЛУЧШЕННАЯ ОБРАБОТКА ОШИБОК
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export const useFavorites = () => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 useFavorites: начальная загрузка, user:", user);

    const savedFavorites = localStorage.getItem("favorite_ids");
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        console.log(
          "📥 useFavorites: загружено из localStorage:",
          parsedFavorites
        );
        setFavoriteIds(parsedFavorites);
      } catch (error) {
        console.error("Error parsing saved favorites:", error);
      }
    }

    if (user) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      console.log("🔄 useFavorites: загрузка с сервера");
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("❌ useFavorites: нет токена");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const favorites = await response.json();
        const ids = favorites.map((apt: any) => apt.id);
        console.log("✅ useFavorites: получено с сервера:", ids);
        setFavoriteIds(ids);
        localStorage.setItem("favorite_ids", JSON.stringify(ids));
      } else {
        console.error("❌ useFavorites: ошибка сервера:", response.status);
        const errorText = await response.text();
        console.error("❌ useFavorites: текст ошибки:", errorText);
      }
    } catch (error) {
      console.error("❌ useFavorites: ошибка загрузки:", error);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (apartmentId: number): Promise<boolean> => {
    if (!user) {
      console.log("❌ addFavorite: пользователь не авторизован");
      return false;
    }

    try {
      console.log("➕ addFavorite: добавление квартиры", apartmentId);
      const token = localStorage.getItem("auth_token");
      if (!token) return false;

      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apartmentId }),
      });

      if (response.ok) {
        console.log("✅ addFavorite: успешно добавлено", apartmentId);
        setFavoriteIds((prev) => {
          const newFavorites = [...prev, apartmentId];
          localStorage.setItem("favorite_ids", JSON.stringify(newFavorites));
          return newFavorites;
        });
        return true;
      } else {
        console.error("❌ addFavorite: ошибка сервера:", response.status);
        const errorData = await response.json();
        console.error("❌ addFavorite: данные ошибки:", errorData);

        // Если ошибка 400 - "Уже в избранном", считаем это успехом
        if (response.status === 400) {
          console.log("🔄 addFavorite: уже в избранном, обновляем состояние");
          setFavoriteIds((prev) => {
            const newFavorites = [...prev, apartmentId];
            localStorage.setItem("favorite_ids", JSON.stringify(newFavorites));
            return newFavorites;
          });
          return true;
        }

        return false;
      }
    } catch (error) {
      console.error("❌ addFavorite: ошибка:", error);
      return false;
    }
  };

  const removeFavorite = async (apartmentId: number): Promise<boolean> => {
    if (!user) {
      console.log("❌ removeFavorite: пользователь не авторизован");
      return false;
    }

    try {
      console.log("➖ removeFavorite: удаление квартиры", apartmentId);
      const token = localStorage.getItem("auth_token");
      if (!token) return false;

      const response = await fetch(`/api/favorites/${apartmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log("✅ removeFavorite: успешно удалено", apartmentId);
        setFavoriteIds((prev) => {
          const newFavorites = prev.filter((id) => id !== apartmentId);
          localStorage.setItem("favorite_ids", JSON.stringify(newFavorites));
          return newFavorites;
        });
        return true;
      } else {
        console.error("❌ removeFavorite: ошибка сервера:", response.status);
        const errorData = await response.json();
        console.error("❌ removeFavorite: данные ошибки:", errorData);
        return false;
      }
    } catch (error) {
      console.error("❌ removeFavorite: ошибка:", error);
      return false;
    }
  };

  const toggleFavorite = async (apartmentId: number): Promise<boolean> => {
    const isCurrentlyFavorite = favoriteIds.includes(apartmentId);
    console.log(
      "🔄 toggleFavorite: квартира",
      apartmentId,
      "текущее состояние:",
      isCurrentlyFavorite
    );

    let success;
    if (isCurrentlyFavorite) {
      success = await removeFavorite(apartmentId);
    } else {
      success = await addFavorite(apartmentId);
    }

    console.log(
      "✅ toggleFavorite: результат для квартиры",
      apartmentId,
      success
    );
    return success;
  };

  const isFavorite = useCallback(
    (apartmentId: number): boolean => {
      const result = favoriteIds.includes(apartmentId);
      console.log(
        "❓ isFavorite: проверка квартиры",
        apartmentId,
        "результат:",
        result
      );
      return result;
    },
    [favoriteIds]
  );

  return {
    favoriteIds,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refreshFavorites: loadFavorites,
  };
};
