// Author: Ajar | Module: Layout | CRM Platform v1.0

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import useUiStore from '../../store/uiStore.js';
import AIAssistant from '../ai/AIAssistant.jsx';

export default function Layout() {
  const { sidebarOpen, aiDrawerOpen } = useUiStore();

  return (
    <div className="min-h-screen bg-surface-dark">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* AI Assistant Drawer */}
      {aiDrawerOpen && <AIAssistant />}
    </div>
  );
}
