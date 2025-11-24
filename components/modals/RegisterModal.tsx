'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'TENANT' as 'TENANT' | 'LANDLORD',
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, verifyCode } = useAuth();

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const success = await register(formData);
        if (success) {
            setStep(2);
        } else {
            setError('Ошибка при регистрации. Возможно, email уже используется.');
        }
        setIsLoading(false);
    };

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const success = await verifyCode(formData.email, verificationCode);
        if (success) {
            handleClose();
        } else {
            setError('Неверный код подтверждения');
        }
        setIsLoading(false);
    };

    const handleClose = () => {
        setFormData({ name: '', email: '', phone: '', password: '', role: 'TENANT' });
        setVerificationCode('');
        setError('');
        setStep(1);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-bold">
                        {step === 1 ? 'Регистрация' : 'Подтверждение email'}
                    </h3>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ФИО
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Телефон
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Пароль
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                       
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                            >
                                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                            </button>
                        </div>
                        <div className="text-center pt-4">
                            <button
                                type="button"
                                onClick={onSwitchToLogin}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                Уже есть аккаунт? Войти
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifySubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-600 mb-4">
                                На email <strong>{formData.email}</strong> отправлен код подтверждения.
                                Введите его ниже.
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                                💡 Для разработки: код выводится в консоль браузера
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Код подтверждения
                            </label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="Введите 6-значный код"
                                required
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
                            >
                                Назад
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                            >
                                {isLoading ? 'Проверка...' : 'Подтвердить'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}