import api from '@/lib/axios';
import type { ApiResponse, User } from '@/types';

export const userService = {
  /**
   * Fetch all users (admin/manager only).
   */
  async getUsers(): Promise<ApiResponse<User[]>> {
    const { data } = await api.get<ApiResponse<User[]>>('/users');
    return data;
  },

  /**
   * Update a user by ID (admin only).
   */
  async updateUser(id: string, payload: Partial<User>): Promise<ApiResponse<User>> {
    const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, payload);
    return data;
  },

  /**
   * Delete a user by ID (admin only).
   */
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    const { data } = await api.delete<ApiResponse<null>>(`/users/${id}`);
    return data;
  },
};

export default userService;
