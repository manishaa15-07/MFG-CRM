import api from '@/lib/axios';
import type {
  AuthResponse,
  ApiResponse,
  User,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
} from '@/types';

export const authService = {
  /**
   * Authenticate a user and receive a JWT token.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  /**
   * Register a new user account.
   */
  async register(payload: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  /**
   * Retrieve the currently authenticated user's profile.
   */
  async getMe(): Promise<ApiResponse<User>> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data;
  },

  /**
   * Update the authenticated user's profile fields.
   */
  async updateProfile(payload: UpdateProfileData): Promise<ApiResponse<User>> {
    const { data } = await api.put<ApiResponse<User>>('/auth/profile', payload);
    return data;
  },

  /**
   * Change the authenticated user's password.
   */
  async changePassword(payload: ChangePasswordData): Promise<ApiResponse<null>> {
    const { data } = await api.put<ApiResponse<null>>('/auth/change-password', payload);
    return data;
  },
};

export default authService;
