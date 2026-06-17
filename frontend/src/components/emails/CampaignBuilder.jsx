// Author: Vineet | Module: Email Components | CRM Platform v1.0
import { useState, useEffect } from 'react';
import { Send, Calendar } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function CampaignBuilder({ onCreated }) {
  const [templates, setTemplates] = useState([]);
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({ name: '', templateId: '', leadIds: [], scheduledAt: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/emails/templates').then(r => setTemplates(r.data.data || [])).catch(() => {});
    api.get('/leads', { params: { limit: 100 } }).then(r => setLeads(r.data.data.leads || [])).catch(() => {});
  }, []);

  const toggleLead = (id) => {
    setForm(prev => ({
      ...prev,
      leadIds: prev.leadIds.includes(id) ? prev.leadIds.filter(l => l !== id) : [...prev.leadIds, id],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.leadIds.length) { toast.error('Select at least one lead'); return; }
    setCreating(true);
    try {
      await api.post('/emails/campaigns', form);
      toast.success('Campaign created');
      onCreated?.();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setCreating(false); }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-4">
      <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" placeholder="Campaign Name *" required />
      <select value={form.templateId} onChange={(e) => setForm({...form, templateId: e.target.value})} className="input-field" required>
        <option value="">Select Template *</option>
        {templates.map(t => <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>)}
      </select>
      <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({...form, scheduledAt: e.target.value})} className="input-field" placeholder="Schedule (optional)" />

      <div>
        <p className="text-sm text-text-secondary mb-2">Select Recipients ({form.leadIds.length} selected)</p>
        <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
          {leads.map(l => (
            <label key={l.id} className="flex items-center gap-2 p-2 rounded hover:bg-surface-elevated cursor-pointer text-sm">
              <input type="checkbox" checked={form.leadIds.includes(l.id)} onChange={() => toggleLead(l.id)} className="rounded border-border" />
              <span>{l.name}</span><span className="text-text-secondary text-xs">— {l.company}</span>
            </label>
          ))}
        </div>
      </div>

      <button type="submit" disabled={creating} className="btn-primary w-full flex items-center justify-center gap-2">
        <Send size={14} /> {creating ? 'Creating...' : 'Create Campaign'}
      </button>
    </form>
  );
}
