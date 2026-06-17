// Author: Namami | Module: Pages | CRM Platform v1.0
import { useState, useEffect } from 'react';
import { UserCog, Plus, Shield } from 'lucide-react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export default function TeamManagement() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SALES_EXECUTIVE' });
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    api.get('/auth/users').then(r => setUsers(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      toast.success('User created');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'SALES_EXECUTIVE' });
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const roleBadge = (role) => {
    const styles = { ADMIN: 'badge-danger', SALES_MANAGER: 'badge-warning', SALES_EXECUTIVE: 'badge-primary' };
    return <span className={`badge text-xs ${styles[role]}`}>{role?.replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><UserCog size={24} className="text-primary" /> Team Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add User</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" placeholder="Full Name *" required />
          <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input-field" placeholder="Email *" type="email" required />
          <input value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="input-field" placeholder="Password *" type="password" required />
          <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="input-field">
            <option value="SALES_EXECUTIVE">Sales Executive</option><option value="SALES_MANAGER">Sales Manager</option><option value="ADMIN">Admin</option>
          </select>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="btn-primary">Create User</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="glass-card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-text-secondary text-xs uppercase tracking-wider">
              <th className="text-left p-4">User</th><th className="text-left p-4">Role</th><th className="text-left p-4">Team</th><th className="text-left p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [1,2,3].map(i => <tr key={i}><td colSpan={4} className="p-4"><div className="h-8 bg-surface-elevated rounded animate-pulse" /></td></tr>) :
            users.map((u, i) => (
              <tr key={u.id} className="border-b border-border hover:bg-surface-elevated/50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center"><span className="text-primary font-semibold text-sm">{u.name?.charAt(0)}</span></div>
                    <div><p className="font-medium text-sm">{u.name}</p><p className="text-text-secondary text-xs">{u.email}</p></div>
                  </div>
                </td>
                <td className="p-4">{roleBadge(u.role)}</td>
                <td className="p-4 text-sm text-text-secondary">{u.team?.name || '—'}</td>
                <td className="p-4 text-sm text-text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
