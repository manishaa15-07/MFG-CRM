'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  login as loginThunk,
  register as registerThunk,
  logout as logoutThunk,
  updateProfile as updateProfileThunk,
  getMe as getMeThunk,
} from '@/store/slices/authSlice';
import type { LoginCredentials, RegisterData, UpdateProfileData } from '@/types';

/**
 * Convenience hook that exposes auth state and dispatchers.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const login = useCallback(
    (credentials: LoginCredentials) => dispatch(loginThunk(credentials)),
    [dispatch],
  );

  const register = useCallback(
    (data: RegisterData) => dispatch(registerThunk(data)),
    [dispatch],
  );

  const logout = useCallback(() => dispatch(logoutThunk()), [dispatch]);

  const updateProfile = useCallback(
    (data: UpdateProfileData) => dispatch(updateProfileThunk(data)),
    [dispatch],
  );

  const loadUser = useCallback(() => dispatch(getMeThunk()), [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    loadUser,
  };
}

export default useAuth;
