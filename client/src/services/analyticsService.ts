import api from '@/lib/axios';
import type { ApiResponse, DashboardStats, TeamMember } from '@/types';

export interface TrendData {
  period: string;
  leads: number;
  conversions: number;
  revenue: number;
}

export const analyticsService = {
  /**
   * Fetch high-level dashboard statistics.
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/analytics/dashboard');
    return data;
  },

  /**
   * Fetch per-member team performance breakdown.
   */
  async getTeamPerformance(): Promise<ApiResponse<TeamMember[]>> {
    const { data } = await api.get<ApiResponse<TeamMember[]>>('/analytics/team-performance');
    return data;
  },

  /**
   * Fetch the sales leaderboard.
   */
  async getLeaderboard(): Promise<ApiResponse<TeamMember[]>> {
    const { data } = await api.get<ApiResponse<TeamMember[]>>('/analytics/leaderboard');
    return data;
  },

  /**
   * Fetch trend data (leads, conversions, revenue over time).
   */
  async getTrends(): Promise<ApiResponse<TrendData[]>> {
    const { data } = await api.get<ApiResponse<TrendData[]>>('/analytics/trends');
    return data;
  },
};

export default analyticsService;
