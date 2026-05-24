import api from '@/lib/axios';
import type {
  Lead,
  LeadFilters,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const leadService = {
  /**
   * Fetch paginated & filtered list of leads.
   */
  async getLeads(filters: LeadFilters = {}): Promise<PaginatedResponse<Lead>> {
    const params = new URLSearchParams();

    (Object.keys(filters) as (keyof LeadFilters)[]).forEach((key) => {
      const value = filters[key];
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, String(value));
      }
    });

    const { data } = await api.get<PaginatedResponse<Lead>>(`/leads?${params.toString()}`);
    return data;
  },

  /**
   * Fetch a single lead by ID.
   */
  async getLead(id: string): Promise<ApiResponse<Lead>> {
    const { data } = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    return data;
  },

  /**
   * Create a new lead.
   */
  async createLead(payload: Partial<Lead>): Promise<ApiResponse<Lead>> {
    const { data } = await api.post<ApiResponse<Lead>>('/leads', payload);
    return data;
  },

  /**
   * Update an existing lead.
   */
  async updateLead(id: string, payload: Partial<Lead>): Promise<ApiResponse<Lead>> {
    const { data } = await api.put<ApiResponse<Lead>>(`/leads/${id}`, payload);
    return data;
  },

  /**
   * Delete a lead.
   */
  async deleteLead(id: string): Promise<ApiResponse<null>> {
    const { data } = await api.delete<ApiResponse<null>>(`/leads/${id}`);
    return data;
  },

  /**
   * Update only the status of a lead (quick-action shortcut).
   */
  async updateLeadStatus(id: string, status: string): Promise<ApiResponse<Lead>> {
    const { data } = await api.patch<ApiResponse<Lead>>(`/leads/${id}/status`, { status });
    return data;
  },

  /**
   * Add a note to a lead.
   */
  async addLeadNote(id: string, text: string): Promise<ApiResponse<Lead>> {
    const { data } = await api.post<ApiResponse<Lead>>(`/leads/${id}/notes`, { text });
    return data;
  },

  /**
   * Export leads as a CSV file download.
   */
  async exportLeadsCsv(): Promise<Blob> {
    const { data } = await api.get('/leads/export/csv', { responseType: 'blob' });
    return data as Blob;
  },
};

export default leadService;
