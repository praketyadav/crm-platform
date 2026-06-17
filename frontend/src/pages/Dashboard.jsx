// Author: Ajar | Module: Pages | CRM Platform v1.0

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Target, Mail, ArrowRight, Activity } from 'lucide-react';
import api from '../services/api.js';
import StatsGrid from '../components/analytics/StatsGrid.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card animate-pulse h-32" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Leads', value: stats?.totalLeads || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Leads This Week', value: stats?.leadsThisWeek || 0, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Conversion Rate', value: `${stats?.conversionRate || 0}%`, icon: Target, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Active Campaigns', value: stats?.activeCampaigns || 0, icon: Mail, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-text-secondary text-sm">Pipeline Value: <span className="font-mono text-primary font-semibold">${(stats?.pipelineValue || 0).toLocaleString()}</span></p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((card) => (
          <div key={card.label} className="glass-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={card.color} size={22} />
            </div>
            <div>
              <p className="text-text-secondary text-sm">{card.label}</p>
              <p className="stat-number text-xl">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top AI-Scored Leads */}
        <div className="lg:col-span-2 glass-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top AI-Scored Leads</h2>
            <Link to="/leads" className="text-primary text-sm flex items-center gap-1 hover:text-primary-hover">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.topScoredLeads?.map((lead, idx) => (
              <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-mono text-sm font-bold">{lead.score}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{lead.name}</p>
                    <p className="text-text-secondary text-xs">{lead.company}</p>
                  </div>
                </div>
                <span className="badge-primary text-xs">{lead.pipelineStage?.replace(/_/g, ' ')}</span>
              </div>
            )) || <p className="text-text-secondary text-sm">No scored leads yet</p>}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-primary" />
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stats?.recentActivities?.map((activity, idx) => (
              <div key={activity.id} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-text-primary truncate">{activity.description}</p>
                  <p className="text-xs text-text-secondary">{activity.user?.name} · {activity.lead?.name}</p>
                </div>
              </div>
            )) || <p className="text-text-secondary text-sm">No recent activity</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
