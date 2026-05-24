'use client';

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import leadService from '@/services/leadService';
import type { Lead, LeadFilters } from '@/types';

// ───────────────────────── State ─────────────────────────
interface LeadState {
  leads: Lead[];
  currentLead: Lead | null;
  filters: LeadFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: LeadState = {
  leads: [],
  currentLead: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,
};

// ───────────────────────── Thunks ─────────────────────────

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (filters: LeadFilters | undefined, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { leads: LeadState };
      const appliedFilters = filters ?? state.leads.filters;
      const response = await leadService.getLeads(appliedFilters);
      return response;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads');
    }
  },
);

export const fetchLead = createAsyncThunk(
  'leads/fetchLead',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await leadService.getLead(id);
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead');
    }
  },
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (payload: Partial<Lead>, { rejectWithValue }) => {
    try {
      const response = await leadService.createLead(payload);
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to create lead');
    }
  },
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, data }: { id: string; data: Partial<Lead> }, { rejectWithValue }) => {
    try {
      const response = await leadService.updateLead(id, data);
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to update lead');
    }
  },
);

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id: string, { rejectWithValue }) => {
    try {
      await leadService.deleteLead(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to delete lead');
    }
  },
);

export const updateLeadStatus = createAsyncThunk(
  'leads/updateLeadStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await leadService.updateLeadStatus(id, status);
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  },
);

export const addLeadNote = createAsyncThunk(
  'leads/addLeadNote',
  async ({ id, text }: { id: string; text: string }, { rejectWithValue }) => {
    try {
      const response = await leadService.addLeadNote(id, text);
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to add note');
    }
  },
);

// ───────────────────────── Slice ─────────────────────────

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<LeadFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentLead(state) {
      state.currentLead = null;
    },
    clearLeadError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchLeads ──
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── fetchLead ──
    builder
      .addCase(fetchLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLead = action.payload;
      })
      .addCase(fetchLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── createLead ──
    builder
      .addCase(createLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads.unshift(action.payload);
      })
      .addCase(createLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── updateLead ──
    builder
      .addCase(updateLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.leads.findIndex((l) => l._id === action.payload._id);
        if (index !== -1) state.leads[index] = action.payload;
        if (state.currentLead?._id === action.payload._id) {
          state.currentLead = action.payload;
        }
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── deleteLead ──
    builder
      .addCase(deleteLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads = state.leads.filter((l) => l._id !== action.payload);
        if (state.currentLead?._id === action.payload) {
          state.currentLead = null;
        }
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── updateLeadStatus ──
    builder
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        const index = state.leads.findIndex((l) => l._id === action.payload._id);
        if (index !== -1) state.leads[index] = action.payload;
        if (state.currentLead?._id === action.payload._id) {
          state.currentLead = action.payload;
        }
      })
      .addCase(updateLeadStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // ── addLeadNote ──
    builder
      .addCase(addLeadNote.fulfilled, (state, action) => {
        const index = state.leads.findIndex((l) => l._id === action.payload._id);
        if (index !== -1) state.leads[index] = action.payload;
        if (state.currentLead?._id === action.payload._id) {
          state.currentLead = action.payload;
        }
      })
      .addCase(addLeadNote.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearCurrentLead, clearLeadError } = leadSlice.actions;
export default leadSlice.reducer;
