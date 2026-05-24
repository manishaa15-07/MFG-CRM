'use client';

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// ───────────────────────── State ─────────────────────────
interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  globalSearchOpen: boolean;
}

const initialState: UiState = {
  sidebarOpen: true,
  theme: 'light',
  globalSearchOpen: false,
};

// ───────────────────────── Slice ─────────────────────────

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleGlobalSearch(state) {
      state.globalSearchOpen = !state.globalSearchOpen;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  toggleGlobalSearch,
} = uiSlice.actions;

export default uiSlice.reducer;
