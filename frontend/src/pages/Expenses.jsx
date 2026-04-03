import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Plus, Receipt, Upload, Search, Trash2, FileText, FileSpreadsheet, X, CheckCircle2, AlertCircle, Pencil, TrendingDown, ArrowDownRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const CATEGORIES = [
  'Groceries', 'Dining & Entertainment', 'Transport', 'Utilities',
  'Healthcare', 'Shopping', 'Education', 'Insurance', 'Other'
];

// ─── Add/Edit Expense Modal ───────────────────────────────────────────────────
const ExpenseFormModal = ({ editItem = null, onClose, onSuccess }) => {
  const isEdit = !!editItem;
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    date: editItem?.date || today,
    description: editItem?.description || '',
    amount: editItem?.amount ?? '',
    category: editItem?.category || 'Groceries',
    account: editItem?.account || '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/expenses/${editItem.id}`, data)).data;
      return (await api.post('/expenses/', data)).data;
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Failed to save.'),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    mutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
        <div className="flex items-center justify-between p-12 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{isEdit ? 'Refine Leak' : 'Manual Flux Exit'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-all"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          {error && <div className="flex items-center gap-3 bg-rose-50 text-rose-600 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100"><AlertCircle size={18}/>{error}</div>}
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Exit Timestamp</label>
                <input required type="date" value={form.date} onChange={e => set('date', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Valuation (Rs)</label>
                <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all italic"/>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Leak Narrative</label>
              <input required value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="e.g. Mandatory Consumption"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"/>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Sector Class</label>
                <select required value={form.category} onChange={e => set('category', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest px-1">Source Node</label>
                <input value={form.account} onChange={e => set('account', e.target.value)}
                  placeholder="e.g. Cash, Card"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"/>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-8 py-5 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all">Abort Sync</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-10 py-5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50">
              {mutation.isPending ? 'Syncing...' : 'Lock Exit Node'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Statement Upload Modal ───────────────────────────────────────────────────
const UploadModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [accountName, setAccountName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [selected, setSelected] = useState({});
  const [editing, setEditing] = useState({});
  const [error, setError] = useState('');

  const parseMutation = useMutation({
    mutationFn: async ({ file, accountName }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('account_name', accountName || file.name.replace(/\.[^.]+$/, ''));
      return (await api.post('/expenses/upload-statement', formData)).data;
    },
    onSuccess: (data) => {
      setParsedData(data);
      const sel = {};
      data.transactions.forEach((_, i) => { sel[i] = true; });
      setSelected(sel); setStep('preview'); setError('');
    },
    onError: (err) => setError(err.response?.data?.detail || 'Could not parse this file.'),
  });

  const importMutation = useMutation({
    mutationFn: async (txns) => (await api.post('/expenses/import', txns)).data,
    onSuccess: () => { setStep('success'); onSuccess(); },
    onError: (err) => setError(err.response?.data?.detail || 'Import failed.'),
  });

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const confirmCount = Object.values(selected).filter(Boolean).length;
  const toggleAll = () => {
    const allOn = Object.values(selected).every(Boolean);
    const next = {};
    parsedData.transactions.forEach((_, i) => { next[i] = !allOn; });
    setSelected(next);
  };

  const handleImport = () => {
    const rows = parsedData.transactions
      .map((t, i) => ({ ...t, ...(editing[i] || {}) }))
      .filter((_, i) => selected[i]);
    importMutation.mutate(rows);
  };

  const FileIcon = file?.name?.endsWith('.pdf') ? FileText : FileSpreadsheet;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
        <div className="p-12 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div>
             <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-2">Automated Flux Sync</h2>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">High-Precision Auditor Mode</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-3 rounded-2xl hover:bg-slate-100 transition-all"><X size={28}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          {step === 'upload' && (
            <div className="space-y-12">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('stmt-file-input').click()}
                className={`border-4 border-dashed rounded-[3rem] p-32 text-center cursor-pointer transition-all duration-500 scale-100 hover:scale-[1.01] ${
                   dragOver 
                     ? 'border-blue-600 bg-blue-50/50' 
                     : 'border-slate-100 bg-slate-50/30 hover:border-blue-400 hover:bg-slate-50'
                }`}
              >
                <input id="stmt-file-input" type="file" accept=".pdf,.csv" className="hidden"
                  onChange={(e) => { const f = e.target.files[0]; if (f) setFile(f); }}/>
                {file ? (
                  <div className="flex flex-col items-center gap-6">
                    <div className="p-8 bg-blue-100 text-blue-600 rounded-3xl animate-bounce-subtle"><FileIcon size={64}/></div>
                    <div>
                      <p className="font-black text-slate-900 text-2xl tracking-tighter uppercase italic">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-3 italic opacity-60">Payload Ready for Execution</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-8 opacity-20 group">
                    <Upload size={80} className="text-slate-400 group-hover:scale-110 transition-transform group-hover:text-blue-600"/>
                    <div>
                      <p className="font-black text-slate-950 text-3xl tracking-tighter uppercase italic">Inject Statement</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-4">PDF / CSV Matrix Accepted</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-2">
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-4 tracking-[0.3em] opacity-80 ml-1">Assign Source Target Identity</label>
                <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)}
                  placeholder="e.g. BOC MAIN DEBIT CORE"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-10 py-6 text-base font-black text-slate-950 outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all uppercase tracking-widest placeholder:opacity-20"/>
              </div>
            </div>
          )}

          {step === 'preview' && parsedData && (
            <div className="space-y-10">
              <div className="flex justify-between items-end px-4">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 opacity-60 leading-none">Detected Cluster</p>
                   <p className="text-2xl font-black text-slate-900 italic tracking-tighter">{parsedData.count} Entities Logged</p>
                </div>
                <button onClick={toggleAll} className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:text-blue-950 transition-colors bg-blue-50 px-4 py-2 rounded-xl">
                  {Object.values(selected).every(Boolean) ? 'Deselect Absolute' : 'Select Complete Node'}
                </button>
              </div>
              
              <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm shadow-inner transition-all hover:bg-white">
                <table className="min-w-full">
                  <thead className="bg-slate-100/50">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
                      <th className="p-8 w-16 text-center">Sel</th>
                      <th className="p-8 text-left">Sync Time</th>
                      <th className="p-8 text-left">Influx Delta Narrative</th>
                      <th className="p-8 text-left">Sector</th>
                      <th className="p-8 text-right">Valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.transactions.map((txn, i) => {
                      const cur = { ...txn, ...(editing[i] || {}) };
                      return (
                        <tr key={i} className={`transition-all ${selected[i] ? 'bg-white group' : 'opacity-20 grayscale scale-[0.98]'}`}>
                          <td className="p-8 text-center cursor-pointer" onClick={() => setSelected(p => ({ ...p, [i]: !p[i] }))}>
                             <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center mx-auto transition-all ${selected[i] ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl rotate-12' : 'bg-white border-slate-200'}`}>
                                {selected[i] && <CheckCircle2 size={16}/>}
                             </div>
                          </td>
                          <td className="p-8 whitespace-nowrap text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] italic">{format(parseISO(cur.date), 'dd MMM yy')}</td>
                          <td className="p-8">
                            <input type="text" value={cur.description}
                              onChange={e => setEditing(p => ({ ...p, [i]: { ...(p[i]||{}), description: e.target.value } }))}
                              className="w-full bg-transparent border-b-2 border-transparent hover:border-slate-100 focus:border-blue-500 focus:outline-none py-2 text-slate-900 font-black text-sm uppercase italic tracking-tight placeholder:opacity-20"/>
                          </td>
                          <td className="p-8">
                            <select value={cur.category}
                              onChange={e => setEditing(p => ({ ...p, [i]: { ...(p[i]||{}), category: e.target.value } }))}
                              className="text-[9px] bg-slate-100 text-slate-500 font-black uppercase tracking-[0.2em] rounded-xl px-4 py-2 hover:bg-slate-200 transition-colors outline-none cursor-pointer">
                              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="p-8 text-right font-black text-slate-900 italic text-xl tracking-tighter">{formatCurrency(cur.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-32 gap-10 text-center">
              <div className="p-12 bg-emerald-50 text-emerald-500 rounded-[3rem] shadow-2xl animate-bounce-subtle"><CheckCircle2 size={80}/></div>
              <div className="max-w-md">
                <h3 className="text-4xl font-black text-slate-950 uppercase tracking-tighter italic mb-4 leading-none">Sync Successful</h3>
                <p className="text-slate-500 font-black text-sm leading-relaxed uppercase tracking-widest opacity-60">Financial flux has been strategically merged into the local matrix ledger.</p>
              </div>
              <button onClick={onClose} className="bg-slate-900 text-white px-16 py-6 rounded-2xl transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:scale-105 active:scale-95">Complete Deployment</button>
            </div>
          )}
        </div>

        {step !== 'success' && (
          <div className="p-10 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            {step === 'preview' ? (
              <>
                <button onClick={() => { setStep('upload'); setFile(null); setParsedData(null); }} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 transition-all italic underline">← Terminate Audit</button>
                <div className="flex items-center gap-10 bg-white p-2 rounded-3xl pr-6 border border-slate-100 shadow-sm">
                   <div className="px-6 border-r border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Entries</p>
                      <p className="text-lg font-black text-slate-900 italic">{confirmCount}</p>
                   </div>
                   <button onClick={handleImport} disabled={confirmCount === 0 || importMutation.isPending}
                    className="bg-emerald-600 text-white px-12 py-5 rounded-2xl transition-all font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-emerald-700 hover:scale-105 disabled:opacity-30">
                    {importMutation.isPending ? 'DEPLOYING...' : 'COMMIT DELTA'}
                   </button>
                </div>
              </>
            ) : (
              <>
                <button onClick={onClose} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 transition-all italic underline">Abort Sync</button>
                <button onClick={() => parseMutation.mutate({ file, accountName })} disabled={!file || parseMutation.isPending}
                  className="bg-blue-600 text-white px-16 py-6 rounded-2xl transition-all font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-30">
                  {parseMutation.isPending ? 'AUDITING...' : 'EXECUTE ENGINE →'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Expenses Page ───────────────────────────────────────────────────────
const Expenses = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [formModal, setFormModal] = useState({ open: false, editItem: null });

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', searchTerm, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      return (await api.get(`/expenses/?${params}`)).data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <span className="text-rose-600 font-extrabold text-[10px] uppercase tracking-[0.4em] bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 italic">Outbound Leak Monitoring</span>
             <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{expenses?.length || 0} Registered Entities Detected</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Expenses Log</h1>
          <p className="text-slate-500 mt-6 font-black italic text-sm uppercase tracking-widest opacity-60 ml-1">Real-time Transaction Auditing & Payload Injections.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-4 px-10 py-6 bg-white text-slate-900 border-2 border-slate-100 rounded-3xl hover:bg-slate-50 transition-all font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:scale-105 active:scale-95">
            <Upload size={22}/> Bulk Audit
          </button>
          <button onClick={() => setFormModal({ open: true, editItem: null })}
            className="flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-3xl hover:bg-black transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:scale-105 active:scale-95">
            <Plus size={24}/> New Entry
          </button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
        <div className="md:col-span-3 relative group">
          <div className="absolute left-10 top-1/2 -translate-y-1/2 p-2 bg-slate-50 text-slate-400 rounded-xl group-focus-within:text-blue-600 transition-colors"><Search size={24}/></div>
          <input type="text" placeholder="Audit Narrative Trail..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-24 pr-10 py-8 w-full bg-white border-2 border-slate-100 rounded-[2.5rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none text-base font-black text-slate-900 placeholder:opacity-20 uppercase tracking-widest transition-all shadow-sm"/>
        </div>
        <div className="relative">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="appearance-none w-full bg-white border-2 border-slate-100 rounded-[2.5rem] px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none text-slate-900 shadow-sm cursor-pointer transition-all italic">
            <option value="">All Sectors</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table Area */}
      {isLoading ? (
        <div className="space-y-6 animate-pulse px-2">{[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-slate-50 rounded-[2rem]"/>)}</div>
      ) : expenses?.length === 0 ? (
        <div className="bg-white rounded-[4rem] border-4 border-dashed border-slate-100 p-32 text-center flex flex-col items-center gap-10 shadow-inner mx-2">
          <div className="p-10 bg-slate-50 text-slate-200 rounded-[3rem] scale-125">
            <Receipt size={80} />
          </div>
          <div className="max-w-md">
             <h2 className="text-4xl font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-4">Zero Exit Detected</h2>
             <p className="text-slate-500 font-black text-sm uppercase tracking-widest opacity-60 leading-relaxed italic">No outbound consumption delta found in the core matrix. Financial integrity remains at absolute maximum.</p>
          </div>
          <div className="flex gap-6 mt-4">
            <button onClick={() => setUploadModalOpen(true)}
              className="px-10 py-5 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 transition-all italic">
              Initialize Bulk Link
            </button>
            <button onClick={() => setFormModal({ open: true, editItem: null })}
              className="bg-rose-600 text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 italic">
              Register New Leak Node
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden mx-2 transition-all hover:shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b border-slate-100 italic">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                  <th className="px-12 py-8 text-left">Audit Stamp</th>
                  <th className="px-12 py-8 text-left">Consumption Narrative</th>
                  <th className="px-12 py-8 text-left">Sector Node</th>
                  <th className="px-12 py-8 text-left">Origin path</th>
                  <th className="px-12 py-8 text-right">Flux Loss</th>
                  <th className="px-12 py-8 w-32"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-slate-50 group transition-all cursor-default">
                    <td className="px-12 py-12 whitespace-nowrap text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{format(parseISO(expense.date), 'dd MMM yyyy')}</td>
                    <td className="px-12 py-12">
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-[1.5rem] transition-transform group-hover:rotate-12 group-hover:scale-110"><ArrowDownRight size={22}/></div>
                        <div>
                           <p className="font-black text-slate-950 text-xl tracking-tighter italic uppercase leading-none">{expense.description}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">{expense.category.toUpperCase()} NODE</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-12">
                       <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-4 py-2 rounded-xl uppercase tracking-[0.2em]">{expense.category}</span>
                    </td>
                    <td className="px-12 py-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic opacity-60 truncate max-w-[120px]">{expense.account || '—'}</td>
                    <td className="px-12 py-12 text-right font-black text-rose-600 text-3xl tracking-tighter italic scale-100 group-hover:scale-105 transition-transform">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-12 py-12 text-right">
                      <div className="flex items-center justify-end gap-5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => setFormModal({ open: true, editItem: expense })} className="p-3 bg-white text-slate-400 hover:text-blue-600 rounded-xl shadow-lg hover:scale-110 transition-all"><Pencil size={18}/></button>
                        <button onClick={() => { if(window.confirm('IRREVERSIBLE: PURGE LOG?')) deleteMutation.mutate(expense.id); }} className="p-3 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-lg hover:scale-110 transition-all"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {formModal.open && (
        <ExpenseFormModal
          editItem={formModal.editItem}
          onClose={() => setFormModal({ open: false, editItem: null })}
          onSuccess={handleSuccess}
        />
      )}
      {uploadModalOpen && <UploadModal onClose={() => setUploadModalOpen(false)} onSuccess={handleSuccess}/>}
    </div>
  );
};

export default Expenses;
