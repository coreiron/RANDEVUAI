import React, { useState, useEffect } from 'react';
import { User, Save, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/lib/authContext';
import { profileApi } from '@/lib/api/profileApi';
import ImageUploader from './ImageUploader';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UserProfile {
  displayName?: string;
  phone?: string;
  photoURL?: string;
  address?: {
    title?: string;
    street?: string;
    district?: string;
    city?: string;
    zipCode?: string;
  };
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: {
      title: '',
      street: '',
      district: '',
      city: '',
      zipCode: ''
    }
  });
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadUserProfile();
    }
  }, [isOpen, currentUser]);

  const loadUserProfile = async () => {
    try {
      const response = await profileApi.getProfile();

      if (response.success && response.data) {
        const profile = response.data as UserProfile;
        setFormData({
          displayName: profile.displayName || currentUser?.displayName || '',
          phone: profile.phone || '',
          address: {
            title: profile.address?.title || '',
            street: profile.address?.street || '',
            district: profile.address?.district || '',
            city: profile.address?.city || '',
            zipCode: profile.address?.zipCode || ''
          }
        });
        setPhotoURL(profile.photoURL || null);
      } else {
        // Profil bulunamadıysa default değerler
        setFormData({
          displayName: currentUser?.displayName || '',
          phone: '',
          address: {
            title: '',
            street: '',
            district: '',
            city: '',
            zipCode: ''
          }
        });
        setPhotoURL(null);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Profil bilgileri yüklenirken hata oluştu");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);

      const updateData: any = {
        displayName: formData.displayName,
        phone: formData.phone,
        address: formData.address,
      };

      if (photoURL) {
        updateData.photoURL = photoURL;
      }

      const response = await profileApi.updateProfile(updateData);

      if (response.success) {
        toast.success("Profil bilgileriniz başarıyla güncellendi");
        onSuccess();
        onClose();
      } else {
        toast.error(response.error || "Profil güncellenirken hata oluştu");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Profil güncellenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil Bilgilerini Güncelle
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-2 mb-4">
            <ImageUploader onUpload={setPhotoURL} />
            {photoURL && <img src={photoURL} alt="Profil" className="w-20 h-20 rounded-full object-cover border" />}
          </div>

          <div>
            <Label htmlFor="displayName">Ad Soyad</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Adınız ve soyadınız"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="05XX XXX XX XX"
              type="tel"
            />
          </div>

          <div className="space-y-3">
            <Label>Adres Bilgileri</Label>

            <Input
              value={formData.address.title}
              onChange={(e) => handleInputChange('address.title', e.target.value)}
              placeholder="Adres başlığı (Ev, İş vb.)"
            />

            <Input
              value={formData.address.street}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              placeholder="Sokak / Cadde"
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                value={formData.address.district}
                onChange={(e) => handleInputChange('address.district', e.target.value)}
                placeholder="İlçe"
              />
              <Input
                value={formData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                placeholder="İl"
              />
            </div>

            <Input
              value={formData.address.zipCode}
              onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
              placeholder="Posta Kodu"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Vazgeç
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;
