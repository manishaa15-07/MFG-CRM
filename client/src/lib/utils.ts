import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';

/**
 * Merge Tailwind CSS classes without conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupees (₹).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format an ISO date string to a human-readable format.
 * Returns the original string if parsing fails.
 */
export function formatDate(date: string | Date, fmt: string = 'dd MMM yyyy'): string {
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return String(date);
    return format(parsed, fmt);
  } catch {
    return String(date);
  }
}

/**
 * Extract initials from a full name (up to 2 characters).
 */
export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Return a Tailwind color class based on lead status.
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    New: 'bg-blue-100 text-blue-800',
    Contacted: 'bg-yellow-100 text-yellow-800',
    Qualified: 'bg-purple-100 text-purple-800',
    Negotiation: 'bg-orange-100 text-orange-800',
    Won: 'bg-green-100 text-green-800',
    Lost: 'bg-red-100 text-red-800',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-800';
}

/**
 * Return a Tailwind color class based on priority level.
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    Low: 'bg-slate-100 text-slate-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    High: 'bg-orange-100 text-orange-700',
    Urgent: 'bg-red-100 text-red-700',
  };
  return colors[priority] ?? 'bg-gray-100 text-gray-700';
}
