import api from '@/lib/axios';
import type { ApiResponse, Notification } from '@/types';

export const notificationService = {
  /**
   * Fetch all notifications for the current user.
   */
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    const { data } = await api.get<ApiResponse<Notification[]>>('/notifications');
    return data;
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    const { data } = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return data;
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<ApiResponse<null>> {
    const { data } = await api.patch<ApiResponse<null>>('/notifications/read-all');
    return data;
  },
};

export default notificationService;
