// Author: Ajar | Module: Store | CRM Platform v1.0

import { create } from 'zustand';

const useUiStore = create((set) => ({
  sidebarOpen: true,
  aiDrawerOpen: false,
  aiDrawerLeadId: null,
  modalOpen: null,
  modalData: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openAiDrawer: (leadId = null) => set({ aiDrawerOpen: true, aiDrawerLeadId: leadId }),
  closeAiDrawer: () => set({ aiDrawerOpen: false, aiDrawerLeadId: null }),
  openModal: (name, data = null) => set({ modalOpen: name, modalData: data }),
  closeModal: () => set({ modalOpen: null, modalData: null }),
}));

export default useUiStore;
