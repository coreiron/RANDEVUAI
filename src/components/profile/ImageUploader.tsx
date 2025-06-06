import React, { useState } from 'react';
import { uploadImage } from '../../lib/firebase';
import { toast } from '@/components/ui/sonner';

interface ImageUploaderProps {
    onUpload: (url: string) => void;
    folder?: string;
}

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, folder = 'profile-images' }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error('Sadece JPG veya PNG formatında resim yükleyebilirsiniz.');
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            toast.error('Dosya boyutu en fazla 5MB olmalı.');
            return;
        }

        setPreview(URL.createObjectURL(file));
        setLoading(true);
        try {
            const path = `${folder}/${Date.now()}_${file.name}`;
            const url = await uploadImage(file, path);
            onUpload(url);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input type="file" accept="image/jpeg,image/png" onChange={handleFileChange} />
            {loading && <div>Yükleniyor...</div>}
            {preview && <img src={preview} alt="Önizleme" width={120} style={{ marginTop: 8, borderRadius: 8, maxHeight: 120, objectFit: 'cover' }} />}
        </div>
    );
};

export default ImageUploader; 