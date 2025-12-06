'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export default function ForgotPasswordModal({
    isOpen,
    onClose,
    onSwitchToLogin
}: ForgotPasswordModalProps) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { forgotPassword, resetPassword } = useAuth();

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        const success = await forgotPassword(email);
        if (success) {
            setSuccess('Код отправлен на ваш email');
            setStep(2);
        } else {
            setError('Ошибка при отправке кода. Проверьте email и попробуйте снова.');
        }
        setIsLoading(false);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        if (newPassword.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        const success = await resetPassword(email, code, newPassword);
        if (success) {
            setSuccess('Пароль успешно изменен! Вы можете войти с новым паролем.');
            setTimeout(() => {
                handleClose();
                onSwitchToLogin();
            }, 2000);
        } else {
            setError('Ошибка при смене пароля. Проверьте код и попробуйте снова.');
        }
        setIsLoading(false);
    };

    const handleClose = () => {
        setEmail('');
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
        setStep(1);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-bold">
                        {step === 1 ? 'Восстановление пароля' : 'Смена пароля'}
                    </h3>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendCode} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-600 mb-4">
                                Введите email, указанный при регистрации. Мы отправим код для сброса пароля.
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                                placeholder="example@mail.com"
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
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                            >
                                {isLoading ? 'Отправка...' : 'Отправить код'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
                                {success}
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-600 mb-4">
                                Код отправлен на email: <strong>{email}</strong>
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Код подтверждения
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="Введите 6-значный код"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Новый пароль
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                                minLength={6}
                                placeholder="Минимум 6 символов"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Подтвердите пароль
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                                minLength={6}
                                placeholder="Повторите пароль"
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
                                {isLoading ? 'Смена...' : 'Сменить пароль'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}