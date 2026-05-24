import api from '@/lib/axios';
import type { Task, TaskFilters, ApiResponse, PaginatedResponse } from '@/types';

export const taskService = {
  /**
   * Fetch tasks, optionally filtered.
   */
  async getTasks(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();

    (Object.keys(filters) as (keyof TaskFilters)[]).forEach((key) => {
      const value = filters[key];
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, String(value));
      }
    });

    const { data } = await api.get<PaginatedResponse<Task>>(`/tasks?${params.toString()}`);
    return data;
  },

  /**
   * Create a new task.
   */
  async createTask(payload: Partial<Task>): Promise<ApiResponse<Task>> {
    const { data } = await api.post<ApiResponse<Task>>('/tasks', payload);
    return data;
  },

  /**
   * Update an existing task.
   */
  async updateTask(id: string, payload: Partial<Task>): Promise<ApiResponse<Task>> {
    const { data } = await api.put<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return data;
  },

  /**
   * Delete a task.
   */
  async deleteTask(id: string): Promise<ApiResponse<null>> {
    const { data } = await api.delete<ApiResponse<null>>(`/tasks/${id}`);
    return data;
  },

  /**
   * Mark a task as completed.
   */
  async completeTask(id: string): Promise<ApiResponse<Task>> {
    const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}/complete`);
    return data;
  },
};

export default taskService;
