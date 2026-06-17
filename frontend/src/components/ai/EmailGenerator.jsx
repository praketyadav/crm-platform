// Author: Praket | Module: AI Components | CRM Platform v1.0
import { useState } from 'react';
import { Mail, Copy, Send } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function EmailGenerator({ leadId, leadName }) {
  const [emailType, setEmailType] = useState('FOLLOWUP');
  const [context, setContext] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!leadId) { toast.error('Select a lead first'); return; }
    setLoading(true);
    try {
      const res = await api.post('/ai/generate-email', { leadId, emailType, context });
      setResult(res.data.data);
      toast.success('Email generated!');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold flex items-center gap-2"><Mail size={16} /> Email Generator</h2>
      <select value={emailType} onChange={(e) => setEmailType(e.target.value)} className="input-field text-sm">
        <option value="FOLLOWUP">Follow-Up</option><option value="PROPOSAL">Proposal</option><option value="REMINDER">Reminder</option>
      </select>
      <textarea value={context} onChange={(e) => setContext(e.target.value)} className="input-field text-sm" rows={3} placeholder="Additional context (optional)..." />
      <button onClick={generate} disabled={loading || !leadId} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
        {loading ? 'Generating...' : 'Generate Email'}
      </button>
      {result && (
        <div className="bg-surface-elevated rounded-lg p-4 space-y-3 animate-fade-in">
          <div><p className="text-xs text-text-secondary">Subject</p><p className="text-sm font-medium">{result.subject}</p></div>
          <hr className="border-border" />
          <div><p className="text-xs text-text-secondary">Body</p><p className="text-sm whitespace-pre-wrap">{result.body}</p></div>
          <button onClick={() => { navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`); toast.success('Copied!'); }} className="btn-secondary text-xs flex items-center gap-1">
            <Copy size={12} /> Copy Email
          </button>
        </div>
      )}
    </div>
  );
}
