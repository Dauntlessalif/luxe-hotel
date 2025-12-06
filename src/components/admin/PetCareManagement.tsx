import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petCareApi } from '@/lib/api';
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
import { Search, Eye, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

const PetCareManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch pet care requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-petcare'],
    queryFn: async () => {
      return await petCareApi.getAll();
    },
  });

  // Update request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await petCareApi.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-petcare'] });
      toast({
        title: 'Success',
        description: 'Pet care request status updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update request status',
        variant: 'destructive',
      });
    },
  });

  // Filter requests
  const filteredRequests = requests?.filter((request: any) => {
    const matchesSearch = 
      request.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.pet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.pet_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'default', className: 'bg-yellow-100 text-yellow-700' },
      approved: { variant: 'default', className: 'bg-green-100 text-green-700' },
      in_progress: { variant: 'default', className: 'bg-blue-100 text-blue-700' },
      completed: { variant: 'default', className: 'bg-gray-100 text-gray-700' },
      cancelled: { variant: 'default', className: 'bg-red-100 text-red-700' },
    };

    return variants[status] || variants.pending;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pet Care Requests</CardTitle>
          <CardDescription>
            Manage pet care service requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guest, email, or pet name..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-petcare'] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Requests Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Pet Name</TableHead>
                  <TableHead>Pet Type</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading requests...
                    </TableCell>
                  </TableRow>
                ) : filteredRequests?.length ? (
                  filteredRequests.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.guest_name}</p>
                          <p className="text-sm text-muted-foreground">{request.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{request.pet_name}</TableCell>
                      <TableCell className="capitalize">{request.pet_type}</TableCell>
                      <TableCell className="capitalize">
                        {request.service_type.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(request.start_date).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">
                            to {new Date(request.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.total_price ? formatCurrency(request.total_price) : 'TBD'}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={request.status}
                          onValueChange={(value) =>
                            updateStatusMutation.mutate({ id: request.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <Badge {...getStatusBadge(request.status)}>
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No pet care requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pet Care Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this pet care request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Guest Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedRequest.guest_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedRequest.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedRequest.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Pet Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Pet Name:</span> {selectedRequest.pet_name}</p>
                    <p><span className="font-medium">Type:</span> {selectedRequest.pet_type}</p>
                    {selectedRequest.pet_weight && (
                      <p><span className="font-medium">Weight:</span> {selectedRequest.pet_weight} lbs</p>
                    )}
                    {selectedRequest.pet_age && (
                      <p><span className="font-medium">Age:</span> {selectedRequest.pet_age} years</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Service Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Service Type:</span> {selectedRequest.service_type.replace('_', ' ')}</p>
                    <p><span className="font-medium">Start Date:</span> {new Date(selectedRequest.start_date).toLocaleDateString()}</p>
                    <p><span className="font-medium">End Date:</span> {new Date(selectedRequest.end_date).toLocaleDateString()}</p>
                    <p><span className="font-medium">Price:</span> {selectedRequest.total_price ? formatCurrency(selectedRequest.total_price) : 'TBD'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Current Status:</span> {selectedRequest.status.replace('_', ' ')}</p>
                    <p><span className="font-medium">Created:</span> {new Date(selectedRequest.created_at).toLocaleString()}</p>
                    <p><span className="font-medium">Updated:</span> {new Date(selectedRequest.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              {selectedRequest.special_requirements && (
                <div>
                  <h4 className="font-semibold mb-2">Special Requirements</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedRequest.special_requirements}
                  </p>
                </div>
              )}
              {selectedRequest.vaccination_records_url && (
                <div>
                  <h4 className="font-semibold mb-2">Vaccination Records</h4>
                  <a
                    href={selectedRequest.vaccination_records_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View vaccination records
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PetCareManagement;
