// Author: Ajar | Module: Layout | CRM Platform v1.0

import { Menu, Bell, Bot } from 'lucide-react';
import useUiStore from '../../store/uiStore.js';

export default function Header() {
  const { toggleSidebar, openAiDrawer } = useUiStore();

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <button onClick={toggleSidebar} className="text-text-secondary hover:text-text-primary transition-colors">
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-4">
        <button
          onClick={() => openAiDrawer()}
          className="btn-primary flex items-center gap-2 text-sm py-2"
        >
          <Bot size={16} />
          AI Assistant
        </button>
        <button className="relative text-text-secondary hover:text-text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-white text-[10px] flex items-center justify-center">3</span>
        </button>
      </div>
    </header>
  );
}
