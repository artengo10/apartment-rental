'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
    onImagesChange: (imageUrls: string[]) => void;
    existingImages?: string[];
}

export default function ImageUploader({ onImagesChange, existingImages = [] }: ImageUploaderProps) {
    const [images, setImages] = useState<string[]>(existingImages);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        setIsUploading(true);

        try {
            const newImageUrls: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    alert(`Файл ${file.name} слишком большой. Максимальный размер: 5MB`);
                    continue;
                }

                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    newImageUrls.push(data.imageUrl);
                } else {
                    console.error('Upload failed for file:', file.name);
                }
            }

            const updatedImages = [...images, ...newImageUrls];
            setImages(updatedImages);
            onImagesChange(updatedImages);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Ошибка при загрузке изображений');
        } finally {
            setIsUploading(false);
            // Сбрасываем input
            event.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        onImagesChange(updatedImages);
    };

    return (
        <div className="space-y-4">
            {/* Превью изображений */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={imageUrl}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Кнопка загрузки */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    className="hidden"
                />
                <label
                    htmlFor="image-upload"
                    className={`cursor-pointer flex flex-col items-center justify-center space-y-2 ${isUploading ? 'opacity-50' : 'hover:bg-gray-50'
                        } transition-colors p-4 rounded-lg`}
                >
                    {isUploading ? (
                        <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-600">Загрузка...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Нажмите для загрузки изображений
                                </p>
                                <p className="text-xs text-gray-500">
                                    PNG, JPG, JPEG до 5MB
                                </p>
                            </div>
                        </>
                    )}
                </label>
            </div>

            {/* Информация */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Изображения автоматически загружаются на imgBB и прикрепляются к объявлению
                </p>
            </div>
        </div>
    );
}