'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  MoreVertical,
  Edit,
  Trash,
  Filter
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchTasks, completeTask, deleteTask } from '@/store/slices/taskSlice';
import { Task, TaskPriority, TaskStatus } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AddTaskDialog from '@/components/shared/AddTaskDialog';

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'Urgent': return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'Low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  }
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'Completed': return 'text-green-500';
    case 'InProgress': return 'text-blue-500';
    case 'Cancelled': return 'text-gray-500';
    default: return 'text-muted-foreground';
  }
};

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const { tasks, isLoading } = useAppSelector((state) => state.tasks);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleComplete = async (id: string) => {
    try {
      await dispatch(completeTask(id)).unwrap();
      toast.success('Task marked as completed');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(id)).unwrap();
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return task.status === 'Pending' || task.status === 'InProgress';
    if (activeTab === 'completed') return task.status === 'Completed';
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Tasks</h2>
          <p className="text-muted-foreground">Manage your follow-ups and daily activities.</p>
        </div>
        <AddTaskDialog />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-6 w-[80px] rounded-full" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </CardContent>
            </Card>
          ))
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg bg-card/50">
            <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No tasks found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;re all caught up! Enjoy your day or create a new task.
            </p>
            <AddTaskDialog />
          </div>
        ) : (
          filteredTasks.map((task) => (
            <Card
              key={task._id}
              className={`transition-colors hover:bg-accent/50 ${task.status === 'Completed' ? 'opacity-70 bg-muted/30' : ''
                }`}
            >
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  onClick={() => handleComplete(task._id)}
                  className="mt-1 sm:mt-0 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                  disabled={task.status === 'Completed'}
                >
                  {task.status === 'Completed' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-base font-medium truncate ${task.status === 'Completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </h4>
                    {task.status !== 'Completed' && (
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-4">
                    {task.dueDate && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(task.dueDate), 'MMM d, yyyy h:mm a')}
                      </span>
                    )}
                    {task.relatedLead && typeof task.relatedLead !== 'string' && (
                      <span className="truncate">
                        Lead: <span className="font-medium text-primary hover:underline cursor-pointer">{task.relatedLead.companyName}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  <span className={`text-xs font-medium ${getStatusColor(task.status)} hidden sm:inline-block`}>
                    {task.status}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {task.status !== 'Completed' && (
                        <DropdownMenuItem onClick={() => handleComplete(task._id)}>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                          Mark Completed
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(task._id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
}
