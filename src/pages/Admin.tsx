import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardOverview from '@/components/admin/DashboardOverview.tsx';
import BookingsManagement from '@/components/admin/BookingsManagement.tsx';
import RoomsManagement from '@/components/admin/RoomsManagement.tsx';
import GuestsManagement from '@/components/admin/GuestsManagement.tsx';
import ContactMessagesManagement from '@/components/admin/ContactMessagesManagement.tsx';
import PetCareManagement from '@/components/admin/PetCareManagement.tsx';
import ReviewsManagement from '@/components/admin/ReviewsManagement.tsx';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Admin = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your hotel operations from one central location
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="guests">Guests</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="petcare">Pet Care</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsManagement />
          </TabsContent>

          <TabsContent value="rooms">
            <RoomsManagement />
          </TabsContent>

          <TabsContent value="guests">
            <GuestsManagement />
          </TabsContent>

          <TabsContent value="messages">
            <ContactMessagesManagement />
          </TabsContent>

          <TabsContent value="petcare">
            <PetCareManagement />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
