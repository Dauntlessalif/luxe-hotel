import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, DollarSign, Clock, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MyBookingsViewProps {
  customerEmail: string;
}

const MyBookingsView = ({ customerEmail }: MyBookingsViewProps) => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['customer-bookings', customerEmail],
    queryFn: async () => {
      const allBookings = await bookingsApi.getAll();
      // Filter bookings by customer email from guests table
      return allBookings.filter((booking: any) => 
        booking.guests?.email?.toLowerCase() === customerEmail.toLowerCase()
      );
    },
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✅';
      case 'cancelled':
        return '❌';
      case 'completed':
        return '🎉';
      default:
        return '📋';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading your bookings...</p>
        </CardContent>
      </Card>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>You don't have any bookings yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">Start exploring our amazing rooms!</p>
          <Button onClick={() => window.location.href = '/rooms'}>
            Browse Rooms
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Separate bookings into upcoming and past
  const today = new Date().toISOString().split('T')[0];
  const upcomingBookings = bookings.filter((b: any) => b.check_out_date >= today && b.status !== 'cancelled');
  const pastBookings = bookings.filter((b: any) => b.check_out_date < today || b.status === 'cancelled');

  return (
    <div className="space-y-6">
      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Upcoming Stays</h2>
          <div className="grid gap-4">
            {upcomingBookings.map((booking: any) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        {booking.rooms?.name || 'Room'}
                      </CardTitle>
                      <CardDescription>
                        Booking #{booking.id.slice(0, 8)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">Check-in</p>
                          <p className="text-gray-600">{new Date(booking.check_in_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">Check-out</p>
                          <p className="text-gray-600">{new Date(booking.check_out_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">Total Amount</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(booking.total_price)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">Guests</p>
                          <p className="text-gray-600">{booking.number_of_guests} people</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {booking.special_requests && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Special Requests:</p>
                      <p className="text-sm text-blue-700">{booking.special_requests}</p>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                    {booking.status === 'pending' && (
                      <Button variant="destructive" size="sm">
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Past Bookings</h2>
          <div className="grid gap-4">
            {pastBookings.map((booking: any) => (
              <Card key={booking.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.rooms?.name || 'Room'}
                      </CardTitle>
                      <CardDescription>
                        {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Total: {formatCurrency(booking.total_price)}
                    </p>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsView;
