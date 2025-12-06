import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { bookingsApi } from '@/lib/api';
import { 
  Users, 
  DoorOpen, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  PawPrint,
  Star,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const DashboardOverview = () => {
  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const statsData = await response.json();
      
      return {
        totalBookings: statsData.totalBookings || 0,
        activeBookings: statsData.activeBookings || 0,
        totalGuests: statsData.totalGuests || 0,
        totalRooms: statsData.totalRooms || 0,
        availableRooms: statsData.availableRooms || 0,
        totalRevenue: statsData.totalRevenue || 0,
        totalMessages: statsData.totalMessages || 0,
        pendingMessages: statsData.pendingMessages || 0,
        totalPetCare: statsData.totalPetCare || 0,
        totalReviews: statsData.totalReviews || 0,
        averageRating: statsData.averageRating || 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent bookings
  const { data: recentBookings } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: async () => {
      return await bookingsApi.getAll();
    },
  });

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      description: 'Total earnings',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Bookings',
      value: stats?.activeBookings || 0,
      icon: Calendar,
      description: `${stats?.totalBookings || 0} total bookings`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Guests',
      value: stats?.totalGuests || 0,
      icon: Users,
      description: 'Registered guests',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Available Rooms',
      value: `${stats?.availableRooms || 0}/${stats?.totalRooms || 0}`,
      icon: DoorOpen,
      description: 'Rooms ready',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Messages',
      value: stats?.pendingMessages || 0,
      icon: MessageSquare,
      description: `${stats?.totalMessages || 0} total messages`,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      title: 'Pet Care Requests',
      value: stats?.totalPetCare || 0,
      icon: PawPrint,
      description: 'Service requests',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
    {
      title: 'Average Rating',
      value: stats?.averageRating?.toFixed(1) || '0.0',
      icon: Star,
      description: `${stats?.totalReviews || 0} reviews`,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Performance',
      value: '98%',
      icon: TrendingUp,
      description: 'System uptime',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings?.length ? (
              recentBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {booking.guests?.first_name} {booking.guests?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.rooms?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.check_in_date).toLocaleDateString()} -{' '}
                      {new Date(booking.check_out_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(booking.total_price)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No recent bookings
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
