// Author: Ajar | Module: Layout | CRM Platform v1.0

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, GitBranch, CalendarClock, Mail, BarChart3, Bot, UserCog, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore.js';
import useUiStore from '../../store/uiStore.js';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/pipeline', icon: GitBranch, label: 'Pipeline' },
  { to: '/follow-ups', icon: CalendarClock, label: 'Follow-Ups' },
  { to: '/email-campaigns', icon: Mail, label: 'Email Campaigns', roles: ['ADMIN', 'SALES_MANAGER'] },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
  { to: '/team', icon: UserCog, label: 'Team', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen } = useUiStore();

  return (
    <aside className={`fixed left-0 top-0 h-full bg-surface border-r border-border z-40 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        {sidebarOpen && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold text-text-primary">CRM</h1>
            <p className="text-xs text-text-secondary">Sales Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => !item.roles || item.roles.includes(user?.role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="animate-fade-in">{item.label}</span>}
            </NavLink>
          ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-semibold text-sm">{user?.name?.charAt(0)}</span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
              <p className="text-xs text-text-secondary">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
          )}
          <button onClick={logout} className="text-text-secondary hover:text-danger transition-colors flex-shrink-0" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
