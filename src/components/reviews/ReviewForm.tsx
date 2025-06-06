import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { reviewApi } from '@/lib/api/reviewApi';
import { toast } from '@/components/ui/sonner';

interface ReviewFormProps {
  shopId: string;
  appointmentId?: string;
  initialRating?: number;
  initialComment?: string;
  isEditing?: boolean;
  reviewId?: string;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  shopId, 
  appointmentId, 
  initialRating = 0, 
  initialComment = '', 
  isEditing = false,
  reviewId,
  onSuccess 
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && initialRating) {
      setRating(initialRating);
    }
    
    if (isEditing && initialComment) {
      setComment(initialComment);
    }
  }, [isEditing, initialRating, initialComment]);

  const handleMouseOver = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleSetRating = (index: number) => {
    setRating(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Lütfen bir değerlendirme puanı seçin');
      return;
    }
    
    if (comment.trim().length < 10) {
      toast.error('Lütfen en az 10 karakter içeren bir yorum yazın');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isEditing && reviewId) {
        // Değerlendirme güncelle - Not: API'de update endpoint'i henüz yok
        // await updateReview(reviewId, { rating, comment });
        toast.error('Değerlendirme düzenleme henüz API üzerinden desteklenmiyor');
        return;
      } else {
        // Yeni değerlendirme gönder
        const response = await reviewApi.create({
          shopId,
          appointmentId,
          rating,
          comment
        });

        if (response.success) {
          // Form temizle
          setRating(0);
          setComment('');
          
          if (onSuccess) {
            onSuccess();
          }

          toast.success('Değerlendirme gönderildi');
        } else {
          toast.error(response.error || 'Değerlendirme gönderilemedi');
        }
      }
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Değerlendirme gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Değerlendirme</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((index) => (
            <Star
              key={index}
              className={`cursor-pointer w-6 h-6 ${
                (hoverRating || rating) >= index ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
              onMouseOver={() => handleMouseOver(index)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleSetRating(index)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="block text-sm font-medium">Yorumunuz</label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="İşletme hakkındaki görüşlerinizi paylaşın..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Gönderiliyor...' : isEditing ? 'Değerlendirmeyi Güncelle' : 'Değerlendirme Gönder'}
      </Button>
    </form>
  );
};

export default ReviewForm;
