'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchLeads, setFilters, deleteLead } from '@/store/slices/leadSlice';
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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { LeadStatus, Priority } from '@/types';
import AddLeadDialog from '@/components/shared/AddLeadDialog';

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

// Helper for status badge color
const getStatusColor = (status: LeadStatus) => {
  switch (status) {
    case 'New': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    case 'Contacted': return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
    case 'Qualified': return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20';
    case 'Negotiation': return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
    case 'Won': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
    case 'Lost': return 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20';
    default: return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
  }
};

// Helper for priority badge
const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'High': return 'text-rose-500 bg-rose-500/10';
    case 'Medium': return 'text-amber-500 bg-amber-500/10';
    case 'Low': return 'text-blue-500 bg-blue-500/10';
    default: return 'text-gray-500 bg-gray-500/10';
  }
};

export default function LeadsPage() {
  const dispatch = useAppDispatch();
  const { leads, isLoading, filters } = useAppSelector((state) => state.leads);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch leads on mount
  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  // Handle search (debounced ideally, but simple for now)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm, page: 1 }));
    dispatch(fetchLeads());
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await dispatch(deleteLead(id)).unwrap();
        toast.success('Lead deleted successfully');
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Leads</h2>
          <p className="text-muted-foreground">Manage and track your manufacturing prospects.</p>
        </div>
        <AddLeadDialog />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-lg border border-border">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search company or contact..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[60px] rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell className="font-medium">
                    {lead.companyName}
                    <div className="text-xs text-muted-foreground font-normal mt-0.5">{lead.industry}</div>
                  </TableCell>
                  <TableCell>
                    {lead.contactPerson}
                    <div className="text-xs text-muted-foreground mt-0.5">{lead.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 ${getPriorityColor(lead.priority)}`}>
                      {lead.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(lead.expectedRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(lead._id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
