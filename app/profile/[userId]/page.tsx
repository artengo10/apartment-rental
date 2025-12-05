// app/profile/[userId]/page.tsx - ИСПРАВЛЕННЫЙ И АДАПТИВНЫЙ
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import ReviewList from '@/components/ReviewList';
import CreateReviewModal from '@/components/modals/CreateReviewModal';
import ApartmentList from '@/components/ApartmentList';
import { Apartment } from '@/types/apartment';
import { MessageCircle, Star, MapPin, Calendar, Phone, Mail } from 'lucide-react';

interface PublicUser {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    isVerified: boolean;
    createdAt: string;
}

export default function PublicProfilePage() {
    const params = useParams();
    const { user: currentUser } = useAuth();
    const userId = params.userId as string;

    const [user, setUser] = useState<PublicUser | null>(null);
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [apartmentsLoading, setApartmentsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [hasActiveChat, setHasActiveChat] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (userId) {
            fetchUserProfile();
            fetchUserApartments();
            checkActiveChat();
        }
    }, [userId, currentUser]);

    const fetchUserProfile = async () => {
        try {
            setError(null);
            setLoading(true);

            const response = await fetch(`/api/user-profile?userId=${userId}`);

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Пользователь не найден');
            }
        } catch (error) {
            console.error('❌ Network error loading profile:', error);
            setError('Ошибка загрузки профиля');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserApartments = async () => {
        try {
            setApartmentsLoading(true);
            const response = await fetch(`/api/apartments/host/${userId}`);

            if (response.ok) {
                const apartmentsData = await response.json();
                setApartments(apartmentsData);
            }
        } catch (error) {
            console.error('Error fetching user apartments:', error);
        } finally {
            setApartmentsLoading(false);
        }
    };

    const checkActiveChat = async () => {
        if (!currentUser || !userId) return;

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/chats/check?otherUserId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setHasActiveChat(data.hasChat);
            }
        } catch (error) {
            console.error('Error checking chat:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-16 flex items-center justify-center min-h-[80vh]">
                    <div className="text-lg">Загрузка профиля...</div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-16 flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <div className="text-lg text-red-600 mb-4">{error || 'Пользователь не найден'}</div>
                        <button
                            onClick={fetchUserProfile}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                            Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === user.id;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="pt-16">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {/* Мобильная версия - вертикальный layout */}
                    <div className="lg:hidden space-y-6">
                        {/* Карточка пользователя */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <h1 className="text-xl font-bold text-gray-900 mb-2">{user.name}</h1>
                                {user.isVerified && (
                                    <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                        ✅ Проверенный
                                    </div>
                                )}
                            </div>

                            {/* Контактная информация */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Телефон</p>
                                        <p className="font-medium">{user.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium truncate">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">На платформе с</p>
                                        <p className="font-medium">
                                            {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Кнопки действий */}
                            <div className="space-y-3">
                                {/* Если это не свой профиль, показываем кнопку написать */}
                                {!isOwnProfile && currentUser && (
                                    <Link
                                        href={`/chats?userId=${user.id}`}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg inline-flex items-center justify-center transition-colors gap-2"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        Написать сообщение
                                    </Link>
                                )}

                                {/* Кнопка оставить отзыв - показываем только если есть активный чат */}
                                {!isOwnProfile && currentUser && hasActiveChat && (
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg inline-flex items-center justify-center transition-colors gap-2"
                                    >
                                        <Star className="w-5 h-5" />
                                        Оставить отзыв
                                    </button>
                                )}

                                {/* Если это свой профиль, показываем кнопку редактирования */}
                                {isOwnProfile && (
                                    <Link
                                        href="/profile"
                                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg inline-flex items-center justify-center transition-colors gap-2"
                                    >
                                        ✏️ Редактировать профиль
                                    </Link>
                                )}

                                {/* Подсказка про отзывы */}
                                {!isOwnProfile && currentUser && !hasActiveChat && (
                                    <div className="text-center pt-2">
                                        <p className="text-xs text-gray-500">
                                            Чтобы оставить отзыв, нужно начать общение с пользователем
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Блок отзывов */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-4">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-500" />
                                    Отзывы
                                </h2>
                                <div className="max-h-[300px] overflow-y-auto">
                                    <ReviewList hostId={user.id} />
                                </div>
                            </div>
                        </div>

                        {/* Блок с объявлениями пользователя */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-500" />
                                        Объявления пользователя
                                    </h2>
                                    <span className="bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded">
                                        {apartments.length}
                                    </span>
                                </div>

                                {apartmentsLoading ? (
                                    <div className="text-center py-6">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-gray-500 mt-2 text-sm">Загрузка объявлений...</p>
                                    </div>
                                ) : apartments.length === 0 ? (
                                    <div className="text-center py-6">
                                        <div className="text-4xl mb-2">🏠</div>
                                        <p className="text-gray-500">Пользователь еще не разместил объявления</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {apartments.slice(0, 3).map((apartment) => (
                                            <Link
                                                key={apartment.id}
                                                href={`/apartment/${apartment.id}`}
                                                className="block border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                                                        {apartment.images && apartment.images.length > 0 ? (
                                                            <img
                                                                src={apartment.images[0]}
                                                                alt={apartment.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                                <MapPin className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-gray-900 truncate text-sm">
                                                            {apartment.title}
                                                        </h3>
                                                        <p className="text-green-600 font-bold text-sm mt-1">
                                                            {apartment.price}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                                            {apartment.address}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}

                                        {apartments.length > 3 && (
                                            <div className="text-center pt-2">
                                                <Link
                                                    href="#"
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    Показать все {apartments.length} объявлений →
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Десктопная версия - двухколоночный layout */}
                    <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Левая колонка - информация о пользователе */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border">
                                <div className="p-8">
                                    {/* Заголовок */}
                                    <div className="text-center mb-8">
                                        <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                        {user.isVerified && (
                                            <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mt-2">
                                                ✅ Проверенный пользователь
                                            </div>
                                        )}
                                    </div>

                                    {/* Информация */}
                                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-semibold text-gray-900 mb-3">Контактная информация</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Телефон</p>
                                                        <p className="font-medium">{user.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Email</p>
                                                        <p className="font-medium">{user.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-semibold text-gray-900 mb-3">О пользователе</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">На платформе с</p>
                                                        <p className="font-medium">
                                                            {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Кнопки действий */}
                                    <div className="flex justify-center gap-4 mt-8">
                                        {/* Если это не свой профиль, показываем кнопку написать */}
                                        {!isOwnProfile && currentUser && (
                                            <Link
                                                href={`/chats?userId=${user.id}`}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center transition-colors gap-2"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                Написать сообщение
                                            </Link>
                                        )}

                                        {/* Кнопка оставить отзыв - показываем только если есть активный чат */}
                                        {!isOwnProfile && currentUser && hasActiveChat && (
                                            <button
                                                onClick={() => setShowReviewModal(true)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center transition-colors gap-2"
                                            >
                                                <Star className="w-5 h-5" />
                                                Оставить отзыв
                                            </button>
                                        )}

                                        {/* Если это свой профиль, показываем кнопку редактирования */}
                                        {isOwnProfile && (
                                            <Link
                                                href="/profile"
                                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center transition-colors gap-2"
                                            >
                                                ✏️ Редактировать профиль
                                            </Link>
                                        )}
                                    </div>

                                    {/* Подсказка про отзывы */}
                                    {!isOwnProfile && currentUser && !hasActiveChat && (
                                        <div className="text-center mt-4">
                                            <p className="text-sm text-gray-500">
                                                Чтобы оставить отзыв, нужно начать общение с пользователем
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Правая колонка - отзывы */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border sticky top-24">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-500" />
                                        Отзывы
                                    </h2>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        <ReviewList hostId={user.id} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Блок с объявлениями пользователя (десктоп) */}
                    <div className="hidden lg:block bg-white rounded-xl shadow-sm border">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-500" />
                                    Объявления пользователя ({apartments.length})
                                </h2>
                            </div>

                            {apartmentsLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-gray-500 mt-4">Загрузка объявлений...</p>
                                </div>
                            ) : apartments.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">🏠</div>
                                    <p className="text-gray-500">Пользователь еще не разместил объявления</p>
                                </div>
                            ) : (
                                <ApartmentList
                                    apartments={apartments}
                                    showFavoriteHeart={!isOwnProfile}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно создания отзыва */}
            {!isOwnProfile && user && (
                <CreateReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    onSuccess={() => {
                        window.location.reload();
                    }}
                    hostId={user.id}
                    hostName={user.name}
                />
            )}
        </div>
    );
}