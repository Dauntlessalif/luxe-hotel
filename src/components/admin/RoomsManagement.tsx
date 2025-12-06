import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const RoomsManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    capacity: '',
    size: '',
    bed_type: '',
    amenities: '',
    image_url: '',
    available: true,
  });

  // Fetch rooms
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: async () => {
      return await roomsApi.getAllRooms();
    },
  });

  // Create/Update room
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const roomData = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        capacity: parseInt(data.capacity),
        size: data.size,
        bed_type: data.bed_type,
        amenities: data.amenities.split(',').map((a: string) => a.trim()),
        image_url: data.image_url,
        available: data.available,
      };

      if (editingRoom) {
        await roomsApi.updateRoom(editingRoom.id, roomData);
      } else {
        await roomsApi.createRoom(roomData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: editingRoom ? 'Room updated successfully' : 'Room created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save room',
        variant: 'destructive',
      });
    },
  });

  // Delete room
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await roomsApi.deleteRoom(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      toast({
        title: 'Success',
        description: 'Room deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete room',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      capacity: '',
      size: '',
      bed_type: '',
      amenities: '',
      image_url: '',
      available: true,
    });
    setEditingRoom(null);
  };

  const handleEdit = (room: any) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description,
      price: room.price.toString(),
      capacity: room.capacity.toString(),
      size: room.size,
      bed_type: room.bed_type,
      amenities: room.amenities.join(', '),
      image_url: room.image_url || '',
      available: room.available,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rooms Management</CardTitle>
              <CardDescription>
                Manage hotel rooms and availability
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-rooms'] })}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Bed Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading rooms...
                    </TableCell>
                  </TableRow>
                ) : rooms?.length ? (
                  rooms.map((room: any) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>${room.price}/night</TableCell>
                      <TableCell>{room.capacity} guests</TableCell>
                      <TableCell>{room.size}</TableCell>
                      <TableCell>{room.bed_type}</TableCell>
                      <TableCell>
                        <Badge variant={room.available ? 'default' : 'secondary'}>
                          {room.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(room)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this room?')) {
                                deleteMutation.mutate(room.id);
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
                      No rooms found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Room Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Update room information' : 'Create a new room listing'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Room Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per Night *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Size *</Label>
                <Input
                  id="size"
                  placeholder="e.g., 300 sq ft"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bed_type">Bed Type *</Label>
                <Input
                  id="bed_type"
                  placeholder="e.g., King Bed"
                  value={formData.bed_type}
                  onChange={(e) => setFormData({ ...formData, bed_type: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma-separated) *</Label>
              <Input
                id="amenities"
                placeholder="e.g., Free Wi-Fi, Coffee Maker, Room Service"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                placeholder="/assets/room-image.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
              />
              <Label htmlFor="available">Room is available for booking</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomsManagement;
