import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, Phone, Mail, User, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Room } from "@/data/rooms";
import { bookingsApi, guestsApi, roomsApi, calculateNights, calculateTotalPrice } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Guest, Booking } from "@/lib/database.types";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
}

const ReservationModal = ({ isOpen, onClose, room }: ReservationModalProps) => {
  const { user } = useAuth();
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [guestDetails, setGuestDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const { toast } = useToast();

  // Auto-populate user data when logged in
  useEffect(() => {
    if (user) {
      setGuestDetails({
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        address: user.user_metadata?.address || "",
      });
    } else {
      // Reset to empty if logged out
      setGuestDetails({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Missing Dates",
        description: "Please select both check-in and check-out dates.",
        variant: "destructive",
      });
      return;
    }

    if (checkInDate >= checkOutDate) {
      toast({
        title: "Invalid Dates",
        description: "Check-out date must be after check-in date.",
        variant: "destructive",
      });
      return;
    }

    if (checkInDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      toast({
        title: "Invalid Check-in Date",
        description: "Check-in date cannot be in the past.",
        variant: "destructive",
      });
      return;
    }

    if (!room) {
      toast({
        title: "Error",
        description: "Room information is missing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Format dates for database
      const checkInStr = format(checkInDate, "yyyy-MM-dd");
      const checkOutStr = format(checkOutDate, "yyyy-MM-dd");

      // Check room availability
      const isAvailable = await roomsApi.checkAvailability(room.id, checkInStr, checkOutStr);
      
      if (!isAvailable) {
        toast({
          title: "Room Unavailable",
          description: "This room is not available for the selected dates. Please choose different dates.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create or get guest
      const guest = await guestsApi.createOrGetGuest({
        id: user?.id, // Use authenticated user's ID
        first_name: guestDetails.firstName,
        last_name: guestDetails.lastName,
        email: guestDetails.email,
        phone: guestDetails.phone,
        address: guestDetails.address,
      }) as Guest;

      if (!guest) {
        throw new Error('Failed to create or retrieve guest information');
      }

      // Calculate nights and total price
      const nights = calculateNights(checkInStr, checkOutStr);
      const totalPrice = calculateTotalPrice(room.price, nights);

      // Create booking
      const booking = await bookingsApi.createBooking({
        room_id: room.id,
        guest_id: guest.id,
        check_in_date: checkInStr,
        check_out_date: checkOutStr,
        number_of_guests: numberOfGuests,
        total_nights: nights,
        total_price: totalPrice,
        status: 'confirmed',
      }) as Booking;

      if (!booking) {
        throw new Error('Failed to create booking');
      }

      toast({
        title: "Reservation Confirmed!",
        description: `Your reservation for ${nights} night(s) has been confirmed. Booking ID: ${booking.id.slice(0, 8)}. Total: $${totalPrice}`,
      });

      // Reset form and close modal
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
      setNumberOfGuests(1);
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Booking Failed",
        description: `There was an error processing your reservation: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalNights = checkInDate && checkOutDate 
    ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = room && totalNights > 0 ? totalNights * room.price : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-navy">
            Reserve {room?.name}
          </DialogTitle>
          <DialogDescription>
            Complete the form below to book your stay
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Details */}
          {room && (
            <div className="bg-secondary/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{room.name}</h3>
                  <p className="text-muted-foreground">{room.size} • Up to {room.capacity} guests</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-navy">${room.price}</div>
                  <div className="text-sm text-muted-foreground">per night</div>
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin">Check-in Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={setCheckInDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkout">Check-out Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={setCheckOutDate}
                    disabled={(date) => date <= (checkInDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Number of Guests */}
          <div className="space-y-2">
            <Label htmlFor="guests">Number of Guests</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="guests"
                type="number"
                min="1"
                max={room?.capacity || 4}
                className="pl-10"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 1)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Maximum capacity: {room?.capacity || 4} guests
            </p>
          </div>

          {/* Guest Information - Only show if NOT logged in */}
          {!user && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="mr-2 h-5 w-5" />
                Guest Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    required
                    value={guestDetails.firstName}
                    onChange={(e) => setGuestDetails({ ...guestDetails, firstName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    required
                    value={guestDetails.lastName}
                    onChange={(e) => setGuestDetails({ ...guestDetails, lastName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      required
                      value={guestDetails.email}
                      onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-10"
                      required
                      value={guestDetails.phone}
                      onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      className="pl-10"
                      required
                      value={guestDetails.address}
                      onChange={(e) => setGuestDetails({ ...guestDetails, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Logged-in User Info Display */}
          {user && (
            <div className="bg-secondary/30 p-4 rounded-lg border border-secondary">
              <h3 className="text-lg font-semibold flex items-center mb-3">
                <User className="mr-2 h-5 w-5" />
                Guest Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{guestDetails.firstName} {guestDetails.lastName}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{guestDetails.email}</span>
                </div>
                {guestDetails.phone && (
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{guestDetails.phone}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  ℹ️ Update your information in your profile settings
                </p>
              </div>
            </div>
          )}

          {/* Price Summary */}
          {totalNights > 0 && (
            <div className="bg-gold/10 p-4 rounded-lg border border-gold/20">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Room Rate ({totalNights} night{totalNights > 1 ? 's' : ''})</span>
                  <span>${room?.price} × {totalNights}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gold/20 pt-2">
                  <span>Total</span>
                  <span className="text-navy">${totalPrice}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-navy hover:bg-navy-light text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Reservation'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationModal;