// Author: Namami | Module: Analytics Components | CRM Platform v1.0
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STAGE_COLORS = {
  'NEW LEAD': '#6C63FF',
  'QUALIFIED': '#F59E0B',
  'PROPOSAL': '#3B82F6',
  'NEGOTIATION': '#8B5CF6',
  'WON': '#22C55E',
  'LOST': '#EF4444',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface-elevated border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-sm font-medium">{d.name}</p>
      <p className="text-xs text-text-secondary">{d.count} leads · ${(d.value || 0).toLocaleString()}</p>
      {d.dropOffPercent && <p className="text-xs text-danger">↓ {d.dropOffPercent}% drop-off</p>}
    </div>
  );
};

export default function ConversionFunnel({ data }) {
  if (!data?.length) return <div className="text-text-secondary text-sm text-center py-12">No funnel data</div>;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: '#8B8B9E' }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#F1F1F5' }} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={32}>
            {data.map((entry) => (
              <Cell key={entry.stage} fill={STAGE_COLORS[entry.name] || '#6C63FF'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
