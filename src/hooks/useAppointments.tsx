import { useState, useEffect, useCallback } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/lib/authContext';
import { getUserAppointmentsViaApi } from '@/lib/services/appointment/appointmentApiService';
import { shopApi } from '@/lib/api/shopApi';

export interface FormattedAppointment {
  id: string;
  userId: string;
  shopId: string;
  shopName: string;
  shopImage?: string;
  serviceName: string;
  date: Date;
  time: string;
  duration: string | number;
  price: number;
  address: string;
  status: string;
  notes?: string;
  staffName?: string;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<FormattedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  const fetchAppointments = useCallback(async () => {
    if (!currentUser) {
      setAppointments([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching appointments via API for user:', currentUser.uid);

      const appointmentsData = await getUserAppointmentsViaApi();
      console.log('📅 Raw appointments data:', appointmentsData);

      if (!appointmentsData || appointmentsData.length === 0) {
        console.log('📋 No appointments found');
        setAppointments([]);
        return;
      }

      // Formatlı randevuları oluştur
      const formattedAppointments: FormattedAppointment[] = await Promise.all(
        appointmentsData.map(async (appointment: any) => {
          try {
            console.log(`🔍 Processing appointment ${appointment.id}:`, {
              date: appointment.date,
              time: appointment.time,
              dateType: typeof appointment.date,
              timeType: typeof appointment.time,
              hasShopImage: !!appointment.shopImage
            });

            // Eğer işletme resmi yoksa API'den al
            let shopImage = appointment.shopImage;
            let shopName = appointment.shopName || 'Bilinmeyen İşletme';
            let shopAddress = appointment.address || appointment.shopAddress || 'Adres bilgisi bulunamadı';

            if (!shopImage || shopImage === "/placeholder.svg") {
              try {
                console.log(`🖼️ Fetching shop details for ${appointment.shopId}`);
                const shopResponse = await shopApi.getDetails(appointment.shopId);
                if (shopResponse.success && shopResponse.data) {
                  const shopData = shopResponse.data;

                  // Farklı resim field'larını dene
                  const possibleImages = [
                    shopData.images?.main,
                    shopData.images?.logo,
                    shopData.image,
                    shopData.imageUrl,
                    shopData.logo,
                    shopData.avatar,
                    shopData.photo
                  ].filter(Boolean);

                  shopImage = possibleImages[0] || "/placeholder.svg";
                  shopName = shopData.name || shopName;
                  shopAddress = shopData.location?.address || shopData.address || shopAddress;

                  console.log(`✅ Shop details fetched for ${appointment.shopId}:`, {
                    name: shopData.name,
                    image: shopImage,
                    possibleImages,
                    shopData: Object.keys(shopData)
                  });
                } else {
                  console.warn(`⚠️ Failed to fetch shop details for ${appointment.shopId}:`, shopResponse.error);
                }
              } catch (error) {
                console.warn(`⚠️ Error fetching shop details for ${appointment.shopId}:`, error);
                shopImage = "/placeholder.svg";
              }
            } else {
              console.log(`✅ Shop image already available for ${appointment.shopId}: ${shopImage}`);
            }

            // Tarih formatlaması - daha güvenli yaklaşım
            let appointmentDate: Date;

            console.log(`🔍 Processing date for ${appointment.id}:`, {
              date: appointment.date,
              dateType: typeof appointment.date,
              time: appointment.time,
              timeType: typeof appointment.time,
              hasSeconds: appointment.date?.seconds,
              hasToDate: appointment.date?.toDate
            });

            // Firestore timestamp object (API'den gelirken)
            if (appointment.date && typeof appointment.date === 'object' && appointment.date._seconds) {
              console.log(`🔥 Firestore timestamp object for ${appointment.id}`);
              appointmentDate = new Date(appointment.date._seconds * 1000);
            }
            // Firestore timestamp (backend'den gelirken)
            else if (appointment.date?.toDate) {
              console.log(`🔥 Firestore timestamp with toDate for ${appointment.id}`);
              appointmentDate = appointment.date.toDate();
            }
            // Timestamp object ise
            else if (appointment.date?.seconds) {
              console.log(`⏰ Timestamp object for ${appointment.id}`);
              appointmentDate = new Date(appointment.date.seconds * 1000);
            }
            // API'den gelen tarih string ise
            else if (typeof appointment.date === 'string') {
              console.log(`📅 Date is string for ${appointment.id}: ${appointment.date}`);

              // ISO formatında ise
              if (appointment.date.includes('T') || appointment.date.includes('Z')) {
                appointmentDate = parseISO(appointment.date);
              } else {
                // Sadece tarih varsa ve time alanı da varsa, birleştir
                if (appointment.time && typeof appointment.time === 'string') {
                  const dateTimeString = `${appointment.date}T${appointment.time}:00`;
                  console.log(`🕐 Combined datetime for ${appointment.id}: ${dateTimeString}`);
                  appointmentDate = parseISO(dateTimeString);
                } else {
                  appointmentDate = new Date(appointment.date);
                }
              }
            }
            // Date object ise
            else if (appointment.date instanceof Date) {
              console.log(`📆 Date object for ${appointment.id}`);
              appointmentDate = appointment.date;
            }
            // Hiçbiri değilse bugünün tarihi (bu durumda hata var)
            else {
              console.warn(`⚠️ Unknown date format for ${appointment.id}:`, appointment.date);
              appointmentDate = new Date(); // Fallback olarak bugünün tarihi
            }

            // Tarih geçerli mi kontrol et
            if (!isValid(appointmentDate)) {
              console.error(`❌ Invalid date for appointment ${appointment.id}:`, appointment.date);
              appointmentDate = new Date(); // Fallback olarak bugünün tarihi
            }

            console.log(`✅ Final date for ${appointment.id}:`, {
              originalDate: appointment.date,
              parsedDate: appointmentDate,
              formattedDate: format(appointmentDate, 'yyyy-MM-dd HH:mm')
            });

            // Saat formatlaması - daha güvenli
            let timeString: string;

            // Eğer backend'den ayrı time alanı geliyorsa önce onu kullan
            if (appointment.time && typeof appointment.time === 'string') {
              // Eğer time alanı zaten HH:mm formatında ise
              if (appointment.time.match(/^\d{2}:\d{2}$/)) {
                timeString = appointment.time;
                console.log(`⏰ Using separate time field for ${appointment.id}: ${timeString}`);
              } else {
                timeString = format(appointmentDate, 'HH:mm', { locale: tr });
                console.log(`⏰ Invalid time format, extracted from date for ${appointment.id}: ${timeString}`);
              }
            } else {
              // Tarihten saat çıkar
              timeString = format(appointmentDate, 'HH:mm', { locale: tr });
              console.log(`⏰ Extracted time from date for ${appointment.id}: ${timeString}`);
            }

            const formattedAppointment = {
              id: appointment.id,
              userId: appointment.userId,
              shopId: appointment.shopId,
              shopName,
              shopImage,
              serviceName: appointment.serviceName || 'Bilinmeyen Servis',
              date: appointmentDate,
              time: timeString,
              duration: appointment.duration || appointment.serviceDuration || '60',
              price: appointment.price || 0,
              address: shopAddress,
              status: appointment.status || 'pending',
              notes: appointment.notes || '',
              staffName: appointment.staffName || undefined
            };

            console.log(`✅ Formatted appointment ${appointment.id} with image:`, {
              id: formattedAppointment.id,
              shopName: formattedAppointment.shopName,
              shopImage: formattedAppointment.shopImage
            });
            return formattedAppointment;

          } catch (error) {
            console.error('❌ Error formatting appointment:', appointment.id, error);
            console.error('Raw appointment data:', appointment);
            return null;
          }
        })
      );

      const validAppointments = formattedAppointments.filter(Boolean) as FormattedAppointment[];

      console.log('✅ All formatted appointments with images:', validAppointments.length);
      setAppointments(validAppointments);
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      setError(error as Error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Refresh fonksiyonu
  const refreshAppointments = useCallback(() => {
    console.log('🔄 Manually refreshing appointments...');
    return fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refetch: refreshAppointments,
    refresh: refreshAppointments
  };
};
