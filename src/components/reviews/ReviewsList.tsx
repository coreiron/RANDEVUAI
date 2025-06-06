import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { reviewApi } from '@/lib/api/reviewApi';

interface ReviewsListProps {
  shopId: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ shopId }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [shopId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewApi.getShopReviews(shopId);

      if (response.success) {
        setReviews(response.data || []);
      } else {
        console.error("Error fetching reviews:", response.error);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
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

      return formatDistanceToNow(parsedDate, {
        addSuffix: true,
        locale: tr
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Henüz değerlendirme bulunmuyor.</p>
        <p className="text-sm">İlk değerlendirmeyi siz yazın!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {review.userPhoto ? (
                  <img
                    src={review.userPhoto}
                    alt={review.userName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {(review.userName || "A").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium">{review.userName || "Anonim Kullanıcı"}</p>
                  <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>

            <p className="text-gray-700">{review.comment}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ReviewsList;
