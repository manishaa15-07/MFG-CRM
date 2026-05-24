// ============================================================
// Manufacturing CRM – Core Type Definitions
// ============================================================

// ---------------------- User ----------------------
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'bda';
  phone?: string;
  avatar?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------- Lead ----------------------
export interface LeadNote {
  _id: string;
  text: string;
  createdBy: User | string;
  createdAt: string;
}

export type LeadSource =
  | 'Website'
  | 'Referral'
  | 'TradeShow'
  | 'ColdCall'
  | 'LinkedIn'
  | 'Advertisement'
  | 'Other';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type Priority = 'Low' | 'Medium' | 'High';

export interface Lead {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  leadSource: LeadSource;
  status: LeadStatus;
  expectedRevenue: number;
  assignedTo: User | string;
  notes: LeadNote[];
  followUpDate?: string;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

// ---------------------- Task ----------------------
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  assignedTo: User | string;
  relatedLead?: Lead | string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------- Activity ----------------------
export interface Activity {
  _id: string;
  user: User | string;
  type: string;
  description: string;
  relatedLead?: Lead | string;
  relatedTask?: Task | string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ---------------------- Notification ----------------------
export type NotificationType =
  | 'lead_assigned'
  | 'task_assigned'
  | 'follow_up_reminder'
  | 'deal_won'
  | 'deal_lost'
  | 'system';

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedEntity?: string;
  relatedEntityType?: 'Lead' | 'Task' | 'User';
  createdAt: string;
}

// ---------------------- Dashboard / Analytics ----------------------
export interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  wonDeals: number;
  lostDeals: number;
  totalRevenue: number;
  conversionRate: number;
  monthlyConversions: { month: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  recentActivities: Activity[];
  upcomingFollowUps: Lead[];
  salesGrowth: number;
}

export interface TeamMember {
  user: User;
  totalLeads: number;
  wonDeals: number;
  lostDeals: number;
  conversionRate: number;
  revenue: number;
  activeTasks: number;
}

// ---------------------- API Wrappers ----------------------
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ---------------------- Filters ----------------------
export interface LeadFilters {
  status?: string;
  industry?: string;
  leadSource?: string;
  assignedTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  relatedLead?: string;
  dueDate?: string;
  page?: number;
  limit?: number;
}

// ---------------------- Auth ----------------------
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'bda';
  phone?: string;
  department?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    token: string;
  };
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
