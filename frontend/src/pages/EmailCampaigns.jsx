// Author: Vineet | Module: Pages | CRM Platform v1.0
import { useState, useEffect } from 'react';
import { Mail, Plus, Send, FileText } from 'lucide-react';
import api from '../services/api.js';
import TemplateEditor from '../components/emails/TemplateEditor.jsx';
import CampaignBuilder from '../components/emails/CampaignBuilder.jsx';
import toast from 'react-hot-toast';

export default function EmailCampaigns() {
  const [tab, setTab] = useState('campaigns');
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    Promise.all([
      api.get('/emails/templates').then(r => setTemplates(r.data.data || [])).catch(() => {}),
      api.get('/emails/campaigns').then(r => setCampaigns(r.data.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const sendCampaign = async (id) => {
    try {
      const res = await api.post(`/emails/campaigns/${id}/send`);
      toast.success(`Sent: ${res.data.data.sent} emails`);
      fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Mail size={24} className="text-primary" /> Email Campaigns</h1>
        <button onClick={() => setShowNew(!showNew)} className="btn-primary flex items-center gap-2"><Plus size={16} /> New</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['campaigns', 'templates'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-white' : 'btn-secondary'}`}>
            {t === 'campaigns' ? 'Campaigns' : 'Templates'}
          </button>
        ))}
      </div>

      {/* New Form */}
      {showNew && (
        <div className="glass-card animate-fade-in">
          <h2 className="font-semibold mb-4">{tab === 'campaigns' ? 'Create Campaign' : 'Create Template'}</h2>
          {tab === 'campaigns' ? <CampaignBuilder onCreated={() => { setShowNew(false); fetch(); }} /> : <TemplateEditor onSave={() => { setShowNew(false); fetch(); }} />}
        </div>
      )}

      {tab === 'campaigns' ? (
        <div className="space-y-4">
          {campaigns.map((c, i) => (
            <div key={c.id} className="glass-card flex items-center justify-between animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-text-secondary text-xs">{c.template?.name} · {c._count?.recipients || c.recipientCount} recipients</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge text-xs ${c.status === 'SENT' ? 'badge-success' : c.status === 'SCHEDULED' ? 'badge-warning' : 'badge-primary'}`}>{c.status}</span>
                {c.status === 'DRAFT' && (
                  <button onClick={() => sendCampaign(c.id)} className="btn-primary text-xs py-1.5 flex items-center gap-1"><Send size={12} /> Send</button>
                )}
              </div>
            </div>
          ))}
          {campaigns.length === 0 && <p className="text-text-secondary text-center py-8">No campaigns yet</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((t, i) => (
            <div key={t.id} className="glass-card animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  <p className="font-medium">{t.name}</p>
                </div>
                <span className="badge-primary text-xs">{t.type}</span>
              </div>
              <p className="text-sm text-text-secondary">{t.subject}</p>
            </div>
          ))}
          {templates.length === 0 && <p className="text-text-secondary text-center py-8">No templates yet</p>}
        </div>
      )}
    </div>
  );
}
