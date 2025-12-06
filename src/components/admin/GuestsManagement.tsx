import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { guestsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, Eye, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const GuestsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch guests
  const { data: guests, isLoading } = useQuery({
    queryKey: ['admin-guests'],
    queryFn: async () => {
      return await guestsApi.getAll();
    },
  });

  // Filter guests
  const filteredGuests = guests?.filter((guest: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      guest.first_name?.toLowerCase().includes(searchLower) ||
      guest.last_name?.toLowerCase().includes(searchLower) ||
      guest.email?.toLowerCase().includes(searchLower) ||
      guest.phone?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Guests Management</CardTitle>
          <CardDescription>
            View and manage all registered guests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-guests'] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Guests Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading guests...
                    </TableCell>
                  </TableRow>
                ) : filteredGuests?.length ? (
                  filteredGuests.map((guest: any) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">
                        {guest.first_name} {guest.last_name}
                      </TableCell>
                      <TableCell>{guest.email}</TableCell>
                      <TableCell>{guest.phone}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {guest.address}
                      </TableCell>
                      <TableCell>
                        {new Date(guest.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedGuest(guest)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No guests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Guest Details Dialog */}
      <Dialog open={!!selectedGuest} onOpenChange={() => setSelectedGuest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Guest Details</DialogTitle>
            <DialogDescription>
              Complete information about this guest
            </DialogDescription>
          </DialogHeader>
          {selectedGuest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Personal Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">First Name:</span> {selectedGuest.first_name}</p>
                    <p><span className="font-medium">Last Name:</span> {selectedGuest.last_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedGuest.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedGuest.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Additional Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Address:</span> {selectedGuest.address}</p>
                    <p><span className="font-medium">Registered:</span> {new Date(selectedGuest.created_at).toLocaleString()}</p>
                    <p><span className="font-medium">Last Updated:</span> {new Date(selectedGuest.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuestsManagement;
