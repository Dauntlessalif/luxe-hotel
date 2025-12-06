import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MyReviewsProps {
  customerEmail: string;
}

const MyReviews = ({ customerEmail }: MyReviewsProps) => {
  const queryClient = useQueryClient();
  const [editingReview, setEditingReview] = useState<any>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['customer-reviews', customerEmail],
    queryFn: async () => {
      return await reviewsApi.getAll();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      await reviewsApi.update(id, { comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-reviews'] });
      setEditingReview(null);
      setEditContent('');
      toast({
        title: "Review Updated",
        description: "Your review has been updated successfully",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await reviewsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-reviews'] });
      setDeleteReviewId(null);
      toast({
        title: "Review Deleted",
        description: "Your review has been deleted successfully",
      });
    },
  });

  const handleEdit = (review: any) => {
    setEditingReview(review);
    setEditContent(review.comment);
  };

  const handleUpdate = () => {
    if (editingReview && editContent.trim()) {
      updateMutation.mutate({ id: editingReview.id, comment: editContent });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading your reviews...</p>
        </CardContent>
      </Card>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            My Reviews
          </CardTitle>
          <CardDescription>You haven't written any reviews yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            Share your experience with other guests by writing a review after your stay!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            My Reviews
          </CardTitle>
          <CardDescription>
            You've written {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
      </Card>

      {reviews.map((review: any) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{review.rooms?.name || 'Room'}</CardTitle>
                <CardDescription>
                  {new Date(review.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(review)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteReviewId(review.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 mb-3">
              {renderStars(review.rating)}
            </div>
            
            {editingReview?.id === review.id ? (
              <div className="space-y-3">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  placeholder="Write your review..."
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    disabled={updateMutation.isPending}
                    size="sm"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingReview(null)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">{review.comment}</p>
            )}

            {review.admin_response && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Response from Swift Room Haven:
                </p>
                <p className="text-sm text-blue-700">{review.admin_response}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteReviewId} onOpenChange={() => setDeleteReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteReviewId && deleteMutation.mutate(deleteReviewId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyReviews;
