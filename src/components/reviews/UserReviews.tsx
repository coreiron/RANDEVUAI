import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Star, Edit, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/lib/authContext';
import { reviewApi } from '@/lib/api/reviewApi';
import ReviewForm from './ReviewForm';

const UserReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewApi.getUserReviews();

      if (response.success) {
        setReviews(response.data || []);
      } else {
        console.error("Error loading reviews:", response.error);
        toast.error(response.error || "Değerlendirmeler yüklenemedi");
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("Değerlendirmeler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${index <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    try {
      let parsedDate: Date;

      if (date?.toDate) {
        parsedDate = date.toDate();
      } else if (date?.seconds) {
        parsedDate = new Date(date.seconds * 1000);
      } else if (date instanceof Date) {
        parsedDate = date;
      } else {
        parsedDate = new Date(date);
      }

      return format(parsedDate, 'dd MMM yyyy', { locale: tr });
    } catch (error) {
      console.error("Date formatting error:", error);
      return '';
    }
  };

  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setShowEditForm(true);
  };

  const handleDeleteReview = async () => {
    if (!deletingReviewId) return;

    try {
      // API'de review silme endpoint'i henüz yok
      // await deleteReview(deletingReviewId);
      toast.error("Değerlendirme silme henüz API üzerinden desteklenmiyor");
      setDeletingReviewId(null);
      // loadReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Değerlendirme silinirken bir hata oluştu");
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingReview(null);
    loadReviews();
  };

  const confirmDeleteReview = (reviewId: string) => {
    setDeletingReviewId(reviewId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Henüz değerlendirme yapmadınız</h3>
        <p className="text-gray-600 mb-6">
          Geçmiş randevularınız için değerlendirme yapabilirsiniz.
        </p>
        <Button asChild>
          <Link to="/appointments">Randevularım</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Değerlendirmelerim</h2>
        <Badge variant="secondary">
          {reviews.length} değerlendirme
        </Badge>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {review.shopName || "İşletme Adı"}
                  </CardTitle>
                  <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                </div>
                {renderStars(review.rating)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3">{review.comment}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link to={`/shop/${review.shopId}`}>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      İşletmeyi Görüntüle
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditReview(review)}
                    className="text-gray-600"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Düzenle
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmDeleteReview(review.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Sil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Review Form Dialog */}
      {showEditForm && editingReview && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Değerlendirmeyi Düzenle</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm
              shopId={editingReview.shopId}
              appointmentId={editingReview.appointmentId}
              initialRating={editingReview.rating}
              initialComment={editingReview.comment}
              isEditing={true}
              reviewId={editingReview.id}
              onSuccess={handleEditSuccess}
            />
            <Button
              variant="outline"
              onClick={() => setShowEditForm(false)}
              className="mt-4"
            >
              İptal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingReviewId} onOpenChange={() => setDeletingReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Değerlendirmeyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu değerlendirmeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserReviews;
