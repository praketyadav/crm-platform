// Author: Vineet | Module: Pages | CRM Platform v1.0
import { useState, useEffect } from 'react';
import { CalendarClock, Plus } from 'lucide-react';
import api from '../services/api.js';
import ReminderList from '../components/followups/ReminderList.jsx';
import toast from 'react-hot-toast';

export default function FollowUps() {
  const [leads, setLeads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leadId: '', scheduledAt: '', notes: '' });
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    api.get('/leads', { params: { limit: 100 } }).then(r => setLeads(r.data.data.leads || [])).catch(() => {});
    api.get('/followups/calendar').then(r => setCalendarEvents(r.data.data || [])).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/followups', form);
      toast.success('Follow-up scheduled');
      setShowForm(false);
      setForm({ leadId: '', scheduledAt: '', notes: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarClock size={24} className="text-primary" /> Follow-Ups</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Schedule Follow-Up</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <select value={form.leadId} onChange={(e) => setForm({...form, leadId: e.target.value})} className="input-field" required>
            <option value="">Select Lead *</option>
            {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.company}</option>)}
          </select>
          <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({...form, scheduledAt: e.target.value})} className="input-field" required />
          <input value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="input-field" placeholder="Notes (optional)" />
          <div className="md:col-span-3 flex gap-2">
            <button type="submit" className="btn-primary">Schedule</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass-card">
          <h2 className="font-semibold mb-4">Calendar View</h2>
          <div className="space-y-2">
            {calendarEvents.map((e, i) => {
              const statusColors = { PENDING: 'border-l-primary bg-primary/5', DONE: 'border-l-success bg-success/5', MISSED: 'border-l-danger bg-danger/5' };
              return (
                <div key={e.id} className={`p-3 rounded-lg border-l-4 ${statusColors[e.status] || 'border-l-primary'} animate-fade-in`} style={{ animationDelay: `${i * 30}ms` }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-text-secondary">{new Date(e.start).toLocaleString()}</p>
                    </div>
                    <span className={`badge text-xs ${e.status === 'PENDING' ? 'badge-primary' : e.status === 'DONE' ? 'badge-success' : 'badge-danger'}`}>{e.status}</span>
                  </div>
                </div>
              );
            })}
            {calendarEvents.length === 0 && <p className="text-text-secondary text-sm text-center py-8">No events</p>}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="glass-card">
          <h2 className="font-semibold mb-4">Pending Follow-Ups</h2>
          <ReminderList />
        </div>
      </div>
    </div>
  );
}
