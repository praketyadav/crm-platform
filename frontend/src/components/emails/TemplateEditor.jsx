// Author: Vineet | Module: Email Components | CRM Platform v1.0
import { useState } from 'react';
import { Save } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function TemplateEditor({ template, onSave }) {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');
  const [type, setType] = useState(template?.type || 'CUSTOM');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (template?.id) {
        await api.put(`/emails/templates/${template.id}`, { name, subject, body, type });
      } else {
        await api.post('/emails/templates', { name, subject, body, type });
      }
      toast.success('Template saved');
      onSave?.();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Template Name *" required />
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
          <option value="FOLLOWUP">Follow-Up</option><option value="PROPOSAL">Proposal</option><option value="REMINDER">Reminder</option><option value="CUSTOM">Custom</option>
        </select>
      </div>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" placeholder="Subject (use {{lead_name}}, {{company}}, {{sales_rep}}) *" required />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} className="input-field font-mono text-sm" rows={10} placeholder="Email body (HTML supported, use {{lead_name}}, {{company}}, {{sales_rep}}) *" required />
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">Variables: {'{{lead_name}}'}, {'{{company}}'}, {'{{sales_rep}}'}, {'{{email}}'}</p>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2"><Save size={14} /> {saving ? 'Saving...' : 'Save Template'}</button>
      </div>
    </form>
  );
}
