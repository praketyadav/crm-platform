// Author: Vineet | Module: Follow-Up Components | CRM Platform v1.0
import { useState, useEffect } from 'react';
import { Clock, Check, AlertTriangle } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function ReminderList() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/followups', { params: { status: 'PENDING', limit: 10 } })
      .then(res => setFollowUps(res.data.data.followUps || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markDone = async (id) => {
    try {
      await api.put(`/followups/${id}`, { status: 'DONE' });
      setFollowUps(prev => prev.filter(f => f.id !== id));
      toast.success('Follow-up completed');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-surface-elevated rounded-lg animate-pulse" />)}</div>;

  return (
    <div className="space-y-3">
      {followUps.length === 0 && <p className="text-text-secondary text-sm text-center py-6">No pending follow-ups 🎉</p>}
      {followUps.map((f, i) => {
        const isOverdue = new Date(f.scheduledAt) < new Date();
        return (
          <div key={f.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors animate-fade-in ${isOverdue ? 'bg-danger/5 border-danger/20' : 'bg-surface-elevated border-border'}`} style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-center gap-3 min-w-0">
              {isOverdue ? <AlertTriangle size={16} className="text-danger flex-shrink-0" /> : <Clock size={16} className="text-primary flex-shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{f.lead?.name} — {f.lead?.company}</p>
                <p className="text-xs text-text-secondary">{new Date(f.scheduledAt).toLocaleString()}</p>
                {f.notes && <p className="text-xs text-text-secondary mt-0.5 truncate">{f.notes}</p>}
              </div>
            </div>
            <button onClick={() => markDone(f.id)} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1 flex-shrink-0">
              <Check size={12} /> Done
            </button>
          </div>
        );
      })}
    </div>
  );
}
