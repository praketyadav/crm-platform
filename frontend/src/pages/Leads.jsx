// Author: Ajar | Module: Leads | CRM Platform v1.0

import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import api from '../services/api.js';
import useAuthStore from '../store/authStore.js';
import toast from 'react-hot-toast';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '', source: 'WEBSITE', estimatedValue: '' });
  const { user } = useAuthStore();

  const fetchLeads = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/leads', { params: { search, ...params } });
      setLeads(res.data.data.leads);
      setPagination(res.data.data.pagination);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeads({ search });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leads', { ...formData, estimatedValue: parseFloat(formData.estimatedValue) || 0 });
      toast.success('Lead created');
      setShowForm(false);
      setFormData({ name: '', company: '', email: '', phone: '', source: 'WEBSITE', estimatedValue: '' });
      fetchLeads();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const stageBadge = (stage) => {
    const colors = { NEW_LEAD: 'badge-primary', QUALIFIED: 'badge-warning', PROPOSAL: 'bg-blue-500/20 text-blue-400', NEGOTIATION: 'bg-purple-500/20 text-purple-400', WON: 'badge-success', LOST: 'badge-danger' };
    return <span className={`badge text-xs ${colors[stage] || 'badge-primary'}`}>{stage?.replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="glass-card grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="Name *" required />
          <input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="input-field" placeholder="Company *" required />
          <input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-field" placeholder="Email *" type="email" required />
          <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input-field" placeholder="Phone" />
          <select value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} className="input-field">
            <option value="WEBSITE">Website</option><option value="REFERRAL">Referral</option><option value="COLD_CALL">Cold Call</option><option value="EMAIL">Email</option><option value="SOCIAL">Social</option>
          </select>
          <input value={formData.estimatedValue} onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})} className="input-field" placeholder="Estimated Value ($)" type="number" />
          <div className="md:col-span-3 flex gap-2">
            <button type="submit" className="btn-primary">Create Lead</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search by name, company, or email..." />
        </div>
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      {/* Table */}
      <div className="glass-card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-text-secondary text-xs uppercase tracking-wider">
              <th className="text-left p-4">Lead</th><th className="text-left p-4">Source</th><th className="text-left p-4">Stage</th><th className="text-left p-4">Score</th><th className="text-left p-4">Assigned To</th><th className="text-right p-4">Value</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1,2,3,4,5].map(i => <tr key={i}><td colSpan={6} className="p-4"><div className="h-8 bg-surface-elevated rounded animate-pulse" /></td></tr>)
            ) : leads.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-text-secondary">No leads found</td></tr>
            ) : (
              leads.map((lead, idx) => (
                <tr key={lead.id} className="border-b border-border hover:bg-surface-elevated/50 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                  <td className="p-4">
                    <p className="font-medium text-sm">{lead.name}</p>
                    <p className="text-text-secondary text-xs">{lead.company} · {lead.email}</p>
                  </td>
                  <td className="p-4"><span className="text-xs text-text-secondary">{lead.source}</span></td>
                  <td className="p-4">{stageBadge(lead.pipelineStage)}</td>
                  <td className="p-4">{lead.score != null ? <span className="font-mono text-sm font-bold text-primary">{lead.score}</span> : <span className="text-text-secondary text-xs">—</span>}</td>
                  <td className="p-4"><span className="text-sm">{lead.assignedTo?.name || 'Unassigned'}</span></td>
                  <td className="p-4 text-right font-mono text-sm">${(lead.estimatedValue || 0).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-sm">Showing {leads.length} of {pagination.total} leads</p>
          <div className="flex gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button key={i} onClick={() => fetchLeads({ page: i + 1 })} className={`w-8 h-8 rounded-lg text-sm ${pagination.page === i + 1 ? 'bg-primary text-white' : 'btn-secondary'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
