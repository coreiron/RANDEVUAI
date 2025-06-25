import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    Calendar,
    Clock,
    MapPin,
    Phone,
    Mail,
    User,
    ArrowLeft,
    Star,
    MessageCircle,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { getAppointmentDetails } from '@/lib/services/appointment/appointmentQuery';
import { useAuth } from '@/lib/authContext';
import { toast } from '@/hooks/use-toast';
import CancelAppointmentDialog from '@/components/appointments/CancelAppointmentDialog';

const AppointmentDetail = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    useEffect(() => {
        if (!appointmentId) {
            setError('Geçersiz randevu ID\'si');
            setLoading(false);
            return;
        }

        fetchAppointmentDetails();
    }, [appointmentId]);

    const fetchAppointmentDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const details = await getAppointmentDetails(appointmentId!);

            if (!details) {
                setError('Randevu bulunamadı');
                return;
            }

            // Check if user owns this appointment
            if (details.userId !== currentUser?.uid) {
                setError('Bu randevuyu görüntüleme yetkiniz yok');
                return;
            }

            setAppointment(details);
        } catch (err) {
            console.error('Error fetching appointment details:', err);
            setError('Randevu detayları yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const formatAppointmentDate = (date: any) => {
        if (!date) return '';

        let appointmentDate: Date;

        if (date?.toDate) {
            appointmentDate = date.toDate();
        } else if (date?.seconds) {
            appointmentDate = new Date(date.seconds * 1000);
        } else if (typeof date === 'string') {
            appointmentDate = new Date(date);
        } else if (date instanceof Date) {
            appointmentDate = date;
        } else {
            return 'Geçersiz tarih';
        }

        return format(appointmentDate, 'dd MMMM yyyy, EEEE', { locale: tr });
    };

    const formatAppointmentTime = (date: any, time?: string) => {
        if (time) return time;

        if (!date) return '';

        let appointmentDate: Date;

        if (date?.toDate) {
            appointmentDate = date.toDate();
        } else if (date?.seconds) {
            appointmentDate = new Date(date.seconds * 1000);
        } else if (typeof date === 'string') {
            appointmentDate = new Date(date);
        } else if (date instanceof Date) {
            appointmentDate = date;
        } else {
            return 'Geçersiz saat';
        }

        return format(appointmentDate, 'HH:mm', { locale: tr });
    };

    const getStatusInfo = (status: string) => {
        const statusMap = {
            pending: {
                label: 'Beklemede',
                color: 'bg-yellow-100 text-yellow-800',
                icon: <AlertCircle className="h-4 w-4" />
            },
            pending_user_confirmation: {
                label: 'E-posta Onayı Bekliyor',
                color: 'bg-orange-100 text-orange-800',
                icon: <AlertCircle className="h-4 w-4" />
            },
            pending_business_confirmation: {
                label: 'İşletme Onayında',
                color: 'bg-blue-100 text-blue-800',
                icon: <AlertCircle className="h-4 w-4" />
            },
            confirmed: {
                label: 'Onaylı',
                color: 'bg-green-100 text-green-800',
                icon: <CheckCircle className="h-4 w-4" />
            },
            completed: {
                label: 'Tamamlandı',
                color: 'bg-blue-100 text-blue-800',
                icon: <CheckCircle className="h-4 w-4" />
            },
            canceled: {
                label: 'İptal Edildi',
                color: 'bg-red-100 text-red-800',
                icon: <XCircle className="h-4 w-4" />
            }
        };

        return statusMap[status as keyof typeof statusMap] || {
            label: status,
            color: 'bg-gray-100 text-gray-800',
            icon: <AlertCircle className="h-4 w-4" />
        };
    };

    const handleCancelAppointment = () => {
        setShowCancelDialog(true);
    };

    const handleCancelSuccess = () => {
        setShowCancelDialog(false);
        fetchAppointmentDetails(); // Refresh appointment details
        toast({
            title: "Randevu İptal Edildi",
            description: "Randevunuz başarıyla iptal edildi.",
        });
    };

    const handleShopClick = () => {
        if (appointment?.shopId) {
            navigate(`/shops/${appointment.shopId}`);
        }
    };

    const handleWriteReview = () => {
        if (appointment?.shopId) {
            navigate(`/shops/${appointment.shopId}?tab=reviews&write=true`);
        }
    };

    const handleSendMessage = () => {
        if (appointment?.shopId) {
            navigate(`/messages?shopId=${appointment.shopId}`);
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage text="Randevu detayları yükleniyor..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Hata</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={() => navigate('/appointments')}>
                            Randevulara Dön
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Randevu Bulunamadı</h2>
                        <p className="text-gray-600 mb-4">Aradığınız randevu mevcut değil.</p>
                        <Button onClick={() => navigate('/appointments')}>
                            Randevulara Dön
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const statusInfo = getStatusInfo(appointment.status);
    const canCancel = appointment.status === 'pending' ||
        appointment.status === 'confirmed' ||
        appointment.status === 'pending_user_confirmation' ||
        appointment.status === 'pending_business_confirmation';
    const canReview = appointment.status === 'completed';

    console.log('🔍 Appointment Detail Debug:', {
        appointmentStatus: appointment.status,
        canCancel,
        canReview,
        statusInfo
    });

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/appointments')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Geri Dön
                    </Button>
                    <h1 className="text-2xl font-bold">Randevu Detayları</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Appointment Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shop Info */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                                            <img
                                                src={appointment.shop?.images?.main || appointment.shop?.image || "/placeholder.svg"}
                                                alt={appointment.shop?.name || "İşletme"}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">{appointment.shop?.name || "Bilinmeyen İşletme"}</h2>
                                            <p className="text-sm text-gray-600">{appointment.service?.name || "Bilinmeyen Servis"}</p>
                                        </div>
                                    </CardTitle>
                                    <Badge className={statusInfo.color}>
                                        <span className="flex items-center gap-1">
                                            {statusInfo.icon}
                                            {statusInfo.label}
                                        </span>
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatAppointmentDate(appointment.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatAppointmentTime(appointment.date, appointment.time)} ({appointment.duration || 60} dk)</span>
                                    </div>
                                    {appointment.shop?.location?.address && (
                                        <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{appointment.shop.location.address}</span>
                                        </div>
                                    )}
                                    {appointment.staff && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <User className="h-4 w-4" />
                                            <span>Personel: {appointment.staff.name}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Servis Detayları</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{appointment.service?.name || "Bilinmeyen Servis"}</h3>
                                        {appointment.service?.description && (
                                            <p className="text-gray-600 mt-1">{appointment.service.description}</p>
                                        )}
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Süre:</span>
                                        <span className="font-medium">{appointment.duration || appointment.service?.duration || 60} dakika</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Ücret:</span>
                                        <span className="font-bold text-lg text-blue-600">{appointment.price || appointment.service?.price || 0} TL</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {appointment.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notlar</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700">{appointment.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Actions Sidebar */}
                    <div className="space-y-4">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>İşlemler</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    onClick={handleShopClick}
                                    className="w-full"
                                    variant="outline"
                                >
                                    İşletmeyi Görüntüle
                                </Button>

                                <Button
                                    onClick={handleSendMessage}
                                    className="w-full"
                                    variant="outline"
                                >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Mesaj Gönder
                                </Button>

                                {canReview && (
                                    <Button
                                        onClick={handleWriteReview}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <Star className="h-4 w-4 mr-2" />
                                        Değerlendir
                                    </Button>
                                )}

                                {canCancel && (
                                    <Button
                                        onClick={handleCancelAppointment}
                                        className="w-full"
                                        variant="destructive"
                                    >
                                        Randevuyu İptal Et
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        {(appointment.shop?.phone || appointment.shop?.email) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>İletişim Bilgileri</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {appointment.shop?.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <a
                                                href={`tel:${appointment.shop.phone}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {appointment.shop.phone}
                                            </a>
                                        </div>
                                    )}
                                    {appointment.shop?.email && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <a
                                                href={`mailto:${appointment.shop.email}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {appointment.shop.email}
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Dialog */}
            {showCancelDialog && (
                <CancelAppointmentDialog
                    appointmentId={appointment.id}
                    appointmentDetails={{
                        shopName: appointment.shop?.name || "Bilinmeyen İşletme",
                        serviceName: appointment.service?.name || "Bilinmeyen Servis",
                        date: formatAppointmentDate(appointment.date),
                        time: formatAppointmentTime(appointment.date, appointment.time)
                    }}
                    onSuccess={handleCancelSuccess}
                    onCancel={() => setShowCancelDialog(false)}
                />
            )}
        </div>
    );
};

export default AppointmentDetail; 