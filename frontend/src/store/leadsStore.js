// Author: Ajar | Module: Store | CRM Platform v1.0

import { create } from 'zustand';
import api from '../services/api.js';

const useLeadsStore = create((set) => ({
  leads: [],
  currentLead: null,
  pagination: null,
  isLoading: false,

  fetchLeads: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await api.get('/leads', { params });
      set({ leads: res.data.data.leads, pagination: res.data.data.pagination, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchLead: async (id) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/leads/${id}`);
      set({ currentLead: res.data.data, isLoading: false });
      return res.data.data;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },

  createLead: async (data) => {
    const res = await api.post('/leads', data);
    return res.data.data;
  },

  updateLead: async (id, data) => {
    const res = await api.put(`/leads/${id}`, data);
    return res.data.data;
  },

  deleteLead: async (id) => {
    await api.delete(`/leads/${id}`);
  },

  assignLead: async (id, assignedToId) => {
    const res = await api.post(`/leads/${id}/assign`, { assignedToId });
    return res.data.data;
  },

  addNote: async (id, note) => {
    const res = await api.post(`/leads/${id}/notes`, { note });
    return res.data.data;
  },
}));

export default useLeadsStore;
