import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, Eye, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ReviewsManagement = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch reviews
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      return await reviewsApi.getAll();
    },
  });

  // Update review status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await reviewsApi.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({
        title: 'Success',
        description: 'Review status updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update review status',
        variant: 'destructive',
      });
    },
  });

  // Delete review
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await reviewsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({
        title: 'Success',
        description: 'Review deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive',
      });
    },
  });

  // Filter reviews
  const filteredReviews = reviews?.filter((review: any) => {
    return statusFilter === 'all' || review.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'default', className: 'bg-yellow-100 text-yellow-700' },
      approved: { variant: 'default', className: 'bg-green-100 text-green-700' },
      rejected: { variant: 'default', className: 'bg-red-100 text-red-700' },
    };

    return variants[status] || variants.pending;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Reviews Management</CardTitle>
          <CardDescription>
            Moderate and manage customer reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex justify-between items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Reviews Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading reviews...
                    </TableCell>
                  </TableRow>
                ) : filteredReviews?.length ? (
                  filteredReviews.map((review: any) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {review.guests?.first_name} {review.guests?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {review.guests?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{review.rooms?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            ({review.rating})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {review.title || 'No title'}
                      </TableCell>
                      <TableCell>
                        {new Date(review.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={review.status}
                          onValueChange={(value) =>
                            updateStatusMutation.mutate({ id: review.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <Badge {...getStatusBadge(review.status)}>
                              {review.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedReview(review)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this review?')) {
                                deleteMutation.mutate(review.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No reviews found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Details Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Complete review information
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Guest Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{' '}
                      {selectedReview.guests?.first_name} {selectedReview.guests?.last_name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedReview.guests?.email}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Review Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Room:</span> {selectedReview.rooms?.name}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(selectedReview.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Rating:</span>
                      {renderStars(selectedReview.rating)}
                    </div>
                  </div>
                </div>
              </div>
              {selectedReview.title && (
                <div>
                  <h4 className="font-semibold mb-2">Title</h4>
                  <p className="text-sm">{selectedReview.title}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Comment</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedReview.comment}
                </p>
              </div>
              {selectedReview.response && (
                <div>
                  <h4 className="font-semibold mb-2">Management Response</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedReview.response}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Status</h4>
                <Badge {...getStatusBadge(selectedReview.status)}>
                  {selectedReview.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsManagement;
