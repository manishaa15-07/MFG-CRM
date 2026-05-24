'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchLeads, updateLeadStatus } from '@/store/slices/leadSlice';
import { Lead, LeadStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { GripVertical } from 'lucide-react';

const COLUMNS: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

// Sortable Item Component
function SortableLeadCard({ lead }: { lead: Lead }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead._id,
    data: {
      type: 'Lead',
      lead,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`mb-3 bg-card border border-border rounded-md shadow-sm p-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${
        isDragging ? 'opacity-50 border-primary' : 'opacity-100'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="font-medium text-sm line-clamp-1">{lead.companyName}</div>
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
      <div className="text-xs text-muted-foreground mb-3">{lead.contactPerson}</div>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
        <Badge variant="outline" className="bg-background text-[10px] font-normal border-border px-1.5 py-0">
          {lead.priority}
        </Badge>
        <div className="text-xs font-semibold text-primary">
          {formatCurrency(lead.expectedRevenue)}
        </div>
      </div>
    </div>
  );
}

// Column Component
function BoardColumn({ status, leads }: { status: LeadStatus; leads: Lead[] }) {
  const { setNodeRef } = useSortable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  });

  const totalValue = leads.reduce((acc, lead) => acc + lead.expectedRevenue, 0);

  return (
    <div className="flex flex-col h-full bg-muted/30 rounded-lg border border-border/50 overflow-hidden w-[280px] min-w-[280px]">
      <div className="p-3 border-b border-border/50 bg-muted/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm text-foreground">{status}</h3>
          <Badge variant="secondary" className="bg-background h-5 px-1.5 text-xs font-normal">
            {leads.length}
          </Badge>
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          {formatCurrency(totalValue)}
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto custom-scrollbar"
      >
        <SortableContext items={leads.map(l => l._id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <SortableLeadCard key={lead._id} lead={lead} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const dispatch = useAppDispatch();
  const { leads, isLoading } = useAppSelector((state) => state.leads);
  
  // Local state for optimistic updates during drag
  const [localLeads, setLocalLeads] = useState<Lead[]>([]);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'Lead') {
      setActiveLead(active.data.current.lead);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveALead = active.data.current?.type === 'Lead';
    const isOverALead = over.data.current?.type === 'Lead';
    const isOverAColumn = over.data.current?.type === 'Column';

    if (!isActiveALead) return;

    // Dropping a lead over another lead
    if (isActiveALead && isOverALead) {
      setLocalLeads((leads) => {
        const activeIndex = leads.findIndex((l) => l._id === activeId);
        const overIndex = leads.findIndex((l) => l._id === overId);
        
        if (leads[activeIndex].status !== leads[overIndex].status) {
          // Changed columns
          const newLeads = [...leads];
          newLeads[activeIndex] = { ...newLeads[activeIndex], status: leads[overIndex].status };
          return arrayMove(newLeads, activeIndex, overIndex);
        }
        
        return arrayMove(leads, activeIndex, overIndex);
      });
    }

    // Dropping a lead over an empty column area
    if (isActiveALead && isOverAColumn) {
      setLocalLeads((leads) => {
        const activeIndex = leads.findIndex((l) => l._id === activeId);
        const newLeads = [...leads];
        newLeads[activeIndex] = { ...newLeads[activeIndex], status: over.id as LeadStatus };
        return arrayMove(newLeads, activeIndex, activeIndex);
      });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const activeLead = localLeads.find(l => l._id === activeId);
    
    // Find original status from Redux state to check if it actually changed
    const originalLead = leads.find(l => l._id === activeId);
    
    if (activeLead && originalLead && activeLead.status !== originalLead.status) {
      try {
        await dispatch(updateLeadStatus({ id: activeId, status: activeLead.status })).unwrap();
        toast.success(`Lead moved to ${activeLead.status}`);
      } catch (error) {
        toast.error('Failed to update lead status');
        // Revert local state on failure
        setLocalLeads(leads);
      }
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  // Group leads by status
  const columns = useMemo(() => {
    const cols: Record<LeadStatus, Lead[]> = {
      New: [], Contacted: [], Qualified: [], Negotiation: [], Won: [], Lost: []
    };
    localLeads.forEach(lead => {
      if (cols[lead.status]) {
        cols[lead.status].push(lead);
      }
    });
    return cols;
  }, [localLeads]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Sales Pipeline</h2>
        <p className="text-muted-foreground">Drag and drop leads to update their status.</p>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {isLoading && leads.length === 0 ? (
          <div className="flex h-full gap-4 min-w-max">
            {COLUMNS.map((status) => (
              <div key={status} className="w-[280px] h-full bg-muted/20 rounded-lg p-3 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="flex h-[calc(100vh-180px)] gap-4 min-w-max">
              <SortableContext items={COLUMNS} strategy={() => null}>
                {COLUMNS.map((status) => (
                  <BoardColumn 
                    key={status} 
                    status={status} 
                    leads={columns[status]} 
                  />
                ))}
              </SortableContext>
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
              {activeLead ? (
                <div className="bg-card border border-primary rounded-md shadow-lg p-3 opacity-90 scale-105 rotate-2 cursor-grabbing w-[256px]">
                  <div className="font-medium text-sm line-clamp-1 mb-2">{activeLead.companyName}</div>
                  <div className="text-xs text-muted-foreground mb-3">{activeLead.contactPerson}</div>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                    <Badge variant="outline" className="bg-background text-[10px] font-normal border-border px-1.5 py-0">
                      {activeLead.priority}
                    </Badge>
                    <div className="text-xs font-semibold text-primary">
                      {formatCurrency(activeLead.expectedRevenue)}
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </motion.div>
  );
}
