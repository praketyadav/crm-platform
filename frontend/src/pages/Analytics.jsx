// Author: Namami | Module: Pages | CRM Platform v1.0
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import api from '../services/api.js';
import SalesChart from '../components/analytics/SalesChart.jsx';
import ConversionFunnel from '../components/analytics/ConversionFunnel.jsx';

export default function Analytics() {
  const [funnel, setFunnel] = useState([]);
  const [sources, setSources] = useState([]);
  const [team, setTeam] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/pipeline-funnel').then(r => setFunnel(r.data.data)).catch(() => {}),
      api.get('/analytics/lead-sources').then(r => setSources(r.data.data)).catch(() => {}),
      api.get('/analytics/team-performance').then(r => setTeam(r.data.data)).catch(() => {}),
      api.get('/analytics/revenue-forecast').then(r => setForecast(r.data.data)).catch(() => {}),
      api.get('/analytics/activity-timeline').then(r => setTimeline(r.data.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><h1 className="text-2xl font-bold">Analytics</h1>{[1,2,3].map(i => <div key={i} className="glass-card h-64 animate-pulse" />)}</div>;

  const sourceColors = ['#6C63FF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 size={24} className="text-primary" /> Analytics</h1>

      {/* Revenue Forecast */}
      {forecast && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
          <div className="glass-card"><p className="text-text-secondary text-sm">In Negotiation</p><p className="stat-number text-xl text-primary">{forecast.negotiationLeads} leads</p><p className="text-text-secondary text-xs mt-1">${(forecast.totalPotentialRevenue || 0).toLocaleString()} potential</p></div>
          <div className="glass-card"><p className="text-text-secondary text-sm">Weighted Forecast</p><p className="stat-number text-xl text-success">${(forecast.weightedForecast || 0).toLocaleString()}</p><p className="text-text-secondary text-xs mt-1">Based on AI scores</p></div>
          <div className="glass-card"><p className="text-text-secondary text-sm">Avg Deal Size</p><p className="stat-number text-xl text-warning">${(forecast.avgDealSize || 0).toLocaleString()}</p><p className="text-text-secondary text-xs mt-1">{forecast.historicalWonDeals} won deals total</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <div className="glass-card">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Activity Timeline (30 days)</h2>
          <SalesChart data={timeline} />
        </div>

        {/* Pipeline Funnel */}
        <div className="glass-card">
          <h2 className="font-semibold mb-4">Conversion Funnel</h2>
          <ConversionFunnel data={funnel} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources */}
        <div className="glass-card">
          <h2 className="font-semibold mb-4">Lead Sources</h2>
          <div className="space-y-3">
            {sources.map((s, i) => (
              <div key={s.source} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.source}</span>
                  <span className="font-mono text-text-secondary">{s.count} ({s.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-surface-dark rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.percentage}%`, backgroundColor: sourceColors[i % sourceColors.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Performance */}
        <div className="glass-card">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Users size={16} className="text-primary" /> Team Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-text-secondary text-xs border-b border-border"><th className="text-left pb-2">Name</th><th className="text-center pb-2">Leads</th><th className="text-center pb-2">Won</th><th className="text-center pb-2">Rate</th><th className="text-right pb-2">Revenue</th></tr></thead>
              <tbody>
                {team.map((u, i) => (
                  <tr key={u.id} className="border-b border-border/50 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="py-2 font-medium">{u.name}</td>
                    <td className="py-2 text-center font-mono">{u.totalLeads}</td>
                    <td className="py-2 text-center font-mono text-success">{u.wonLeads}</td>
                    <td className="py-2 text-center font-mono">{u.conversionRate}%</td>
                    <td className="py-2 text-right font-mono">${u.totalRevenue?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
