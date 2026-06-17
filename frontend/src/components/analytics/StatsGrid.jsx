// Author: Namami | Module: Analytics Components | CRM Platform v1.0
export default function StatsGrid({ stats }) {
  if (!stats) return null;
  const cards = [
    { label: 'Total Leads', value: stats.totalLeads, color: 'text-primary' },
    { label: 'Active Leads', value: stats.totalActiveLeads, color: 'text-warning' },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%`, color: 'text-success' },
    { label: 'Pipeline Value', value: `$${(stats.pipelineValue || 0).toLocaleString()}`, color: 'text-primary' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
      {cards.map((c) => (
        <div key={c.label} className="glass-card">
          <p className="text-text-secondary text-sm mb-1">{c.label}</p>
          <p className={`stat-number text-2xl ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
