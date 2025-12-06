import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

const BookingsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      return await bookingsApi.getAll();
    },
  });

  // Update booking status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await bookingsApi.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast({
        title: 'Success',
        description: 'Booking status updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive',
      });
    },
  });

  // Delete booking
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await bookingsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast({
        title: 'Success',
        description: 'Booking deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete booking',
        variant: 'destructive',
      });
    },
  });

  // Filter bookings
  const filteredBookings = bookings?.filter((booking: any) => {
    const matchesSearch = 
      booking.guests?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guests?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guests?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.rooms?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'default', className: 'bg-yellow-100 text-yellow-700' },
      confirmed: { variant: 'default', className: 'bg-green-100 text-green-700' },
      checked_in: { variant: 'default', className: 'bg-blue-100 text-blue-700' },
      checked_out: { variant: 'default', className: 'bg-gray-100 text-gray-700' },
      cancelled: { variant: 'default', className: 'bg-red-100 text-red-700' },
    };

    return variants[status] || variants.pending;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Bookings Management</CardTitle>
          <CardDescription>
            View and manage all hotel bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guest name, email, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Bookings Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : filteredBookings?.length ? (
                  filteredBookings.map((booking: any) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {booking.guests?.first_name} {booking.guests?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.guests?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.rooms?.name}</TableCell>
                      <TableCell>
                        {new Date(booking.check_in_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(booking.check_out_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{booking.number_of_guests}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(booking.total_price)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={booking.status}
                          onValueChange={(value) =>
                            updateStatusMutation.mutate({ id: booking.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <Badge {...getStatusBadge(booking.status)}>
                              {booking.status.replace('_', ' ')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="checked_in">Checked In</SelectItem>
                            <SelectItem value="checked_out">Checked Out</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this booking?')) {
                                deleteMutation.mutate(booking.id);
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
                    <TableCell colSpan={8} className="text-center py-8">
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about this booking
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Guest Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedBooking.guests?.first_name} {selectedBooking.guests?.last_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedBooking.guests?.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedBooking.guests?.phone}</p>
                    <p><span className="font-medium">Address:</span> {selectedBooking.guests?.address}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Booking Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Room:</span> {selectedBooking.rooms?.name}</p>
                    <p><span className="font-medium">Check-in:</span> {new Date(selectedBooking.check_in_date).toLocaleDateString()}</p>
                    <p><span className="font-medium">Check-out:</span> {new Date(selectedBooking.check_out_date).toLocaleDateString()}</p>
                    <p><span className="font-medium">Nights:</span> {selectedBooking.total_nights}</p>
                    <p><span className="font-medium">Guests:</span> {selectedBooking.number_of_guests}</p>
                    <p><span className="font-medium">Total:</span> {formatCurrency(selectedBooking.total_price)}</p>
                  </div>
                </div>
              </div>
              {selectedBooking.special_requests && (
                <div>
                  <h4 className="font-semibold mb-2">Special Requests</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.special_requests}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Timestamps</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Created:</span> {new Date(selectedBooking.created_at).toLocaleString()}</p>
                  <p><span className="font-medium">Updated:</span> {new Date(selectedBooking.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsManagement;
