// Author: Praket | Module: Pages | CRM Platform v1.0
import { useState, useEffect } from 'react';
import { Bot, Clock } from 'lucide-react';
import api from '../services/api.js';
import LeadScoreWidget from '../components/ai/LeadScoreWidget.jsx';
import EmailGenerator from '../components/ai/EmailGenerator.jsx';

export default function AIAssistantPage() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/leads', { params: { limit: 50 } }).then(res => setLeads(res.data.data.leads)).catch(() => {});
    api.get('/ai/history').then(res => setHistory(res.data.data.interactions || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"><Bot size={22} className="text-white" /></div>
        <div><h1 className="text-2xl font-bold">AI Assistant</h1><p className="text-text-secondary text-sm">Powered by NVIDIA Nemotron</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Selector + Score */}
        <div className="glass-card space-y-4">
          <h2 className="font-semibold">Select Lead</h2>
          <select value={selectedLead?.id || ''} onChange={(e) => setSelectedLead(leads.find(l => l.id === e.target.value))} className="input-field">
            <option value="">Choose a lead...</option>
            {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.company}</option>)}
          </select>
          {selectedLead && (
            <div className="pt-4 animate-fade-in">
              <LeadScoreWidget leadId={selectedLead.id} initialScore={selectedLead.score || 0} />
            </div>
          )}
        </div>

        {/* Email Generator */}
        <div className="glass-card">
          <EmailGenerator leadId={selectedLead?.id} leadName={selectedLead?.name} />
        </div>

        {/* AI History */}
        <div className="glass-card">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Clock size={16} /> Recent AI Interactions</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((item, i) => (
              <div key={item.id} className="p-3 bg-surface-elevated rounded-lg text-xs animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="flex justify-between mb-1">
                  <span className="badge-primary">{item.type?.replace(/_/g, ' ')}</span>
                  <span className="text-text-secondary">{item.tokensUsed} tokens</span>
                </div>
                <p className="text-text-secondary mt-1">{item.lead?.name} — {item.lead?.company}</p>
              </div>
            ))}
            {history.length === 0 && <p className="text-text-secondary text-sm text-center py-8">No AI interactions yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
