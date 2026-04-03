import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  Receipt, 
  Upload, 
  Search, 
  Trash2, 
  FileText, 
  FileSpreadsheet, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Pencil, 
  TrendingDown, 
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Activity,
  History,
  Info
} from 'lucide-react';
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
    onError: (e) => setError(e.response?.data?.detail || 'Handshake Interrupted. Verify Node Connection.'),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    mutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 ring-1 ring-black/5 animate-scale-in">
        <div className="flex items-center justify-between p-14 bg-slate-50/50 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter italic leading-none">{isEdit ? 'Refine Leak' : 'Register Flux Exit'}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Outbound Trace Active</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-950 p-4 rounded-2xl hover:bg-white hover:shadow-xl transition-all active:scale-90"><X size={24}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-14 space-y-10">
          {error && <div className="flex items-center gap-4 bg-rose-50 text-rose-600 p-6 rounded-3xl text-[10px] font-black uppercase tracking-widest border border-rose-100 shadow-xl shadow-rose-950/5"><AlertCircle size={20}/>{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] pl-2 italic">Exit Timestamp</label>
              <input required type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 focus:ring-8 focus:ring-rose-500/5 focus:border-rose-500 outline-none transition-all uppercase tracking-widest"/>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] pl-2 italic">Loss Valuation (Rs)</label>
              <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 focus:ring-8 focus:ring-rose-500/5 focus:border-rose-500 outline-none transition-all italic text-xl tracking-tighter"/>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] pl-2 italic">Leak Narrative</label>
            <input required value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="e.g. Mandatory Consumption Flow"
              className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 focus:ring-8 focus:ring-rose-500/5 focus:border-rose-500 outline-none transition-all uppercase tracking-widest italic"/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] pl-2 italic">Sector Class</label>
              <select required value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 focus:ring-8 focus:ring-rose-500/5 focus:border-rose-500 outline-none transition-all uppercase tracking-widest cursor-pointer appearance-none">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] pl-2 italic">Source Node</label>
              <input value={form.account} onChange={e => set('account', e.target.value)}
                placeholder="e.g. CASH_WALLET"
                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 focus:ring-8 focus:ring-rose-500/5 focus:border-rose-500 outline-none transition-all uppercase tracking-widest italic"/>
            </div>
          </div>

          <div className="flex items-center justify-end gap-6 pt-10 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-all">Abort Log</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-12 py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-4">
              {mutation.isPending ? 'Writing Trace...' : (isEdit ? 'Apply Fix' : 'Lock Exit Node')}
              <ArrowDownRight size={18} className="opacity-50" />
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
    onError: (err) => setError(err.response?.data?.detail || 'Handshake Refused. Verify Statement Integrity.'),
  });

  const importMutation = useMutation({
    mutationFn: async (txns) => (await api.post('/expenses/import', txns)).data,
    onSuccess: () => { setStep('success'); onSuccess(); },
    onError: (err) => setError(err.response?.data?.detail || 'Import Cycle Terminated.'),
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
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 ring-1 ring-black/10 animate-scale-in">
        <div className="p-16 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-8">
             <div className="p-5 bg-slate-950 text-white rounded-[2rem] shadow-xl shadow-blue-900/40">
                <ShieldCheck size={32} />
             </div>
             <div>
                <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter italic leading-none mb-3">Bulk Audit Protocol</h2>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none opacity-60">Automated High-Fidelity Sync Engine</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-950 p-4 rounded-3xl hover:bg-white hover:shadow-xl transition-all active:scale-95"><X size={32}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-16 custom-scrollbar bg-white">
          {step === 'upload' && (
            <div className="space-y-16">
              {error && <div className="flex items-center gap-4 bg-rose-50 text-rose-600 p-8 rounded-3xl text-[12px] font-black uppercase tracking-widest border border-rose-100">
                <AlertCircle size={24}/>{error}</div>}

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('stmt-file-input').click()}
                className={`group border-8 border-dashed rounded-[4rem] p-40 text-center cursor-pointer transition-all duration-700 ${
                   dragOver 
                     ? 'border-blue-600 bg-blue-50/50 scale-[0.98]' 
                     : 'border-slate-50 bg-slate-50/30 hover:border-blue-200 hover:bg-slate-50/60'
                }`}
              >
                <input id="stmt-file-input" type="file" accept=".pdf,.csv" className="hidden"
                  onChange={(e) => { const f = e.target.files[0]; if (f) setFile(f); }}/>
                {file ? (
                  <div className="flex flex-col items-center gap-8">
                    <div className="relative">
                       <div className="absolute inset-0 bg-blue-400/20 blur-[50px] animate-pulse"></div>
                       <div className="p-10 bg-white border border-slate-100 text-blue-600 rounded-[3rem] shadow-2xl relative z-10 animate-scale-in">
                          <FileIcon size={80}/>
                       </div>
                    </div>
                    <div className="space-y-4">
                      <p className="font-black text-slate-950 text-3xl tracking-tighter uppercase italic leading-none">{file.name}</p>
                      <p className="text-[12px] text-emerald-500 font-black uppercase tracking-[0.5em] italic opacity-80">Payload Analyzed & Ready</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-12 opacity-30 group-hover:opacity-100 transition-all duration-500">
                    <div className="p-10 bg-white rounded-[3rem] shadow-xl border border-slate-100">
                       <Upload size={100} className="text-slate-400 group-hover:text-blue-600 transition-all group-hover:-translate-y-4"/>
                    </div>
                    <div>
                      <p className="font-black text-slate-950 text-4xl tracking-tighter uppercase italic">Inject Statement</p>
                      <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.5em] mt-6">PDF / CSV DATA STREAM ONLY</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="max-w-2xl mx-auto space-y-6">
                <label className="block text-[10px] uppercase font-black text-slate-400 ml-4 tracking-[0.4em] italic opacity-80">Assign Source Identity Target</label>
                <div className="relative group">
                   <div className="absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 group-focus-within:text-blue-600 transition-all">
                      <Zap size={20} />
                   </div>
                   <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)}
                    placeholder="e.g. PRIMARY_CAPITAL_NODE"
                    className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] pl-24 pr-10 py-10 text-lg font-black text-slate-950 outline-none focus:ring-[1rem] focus:ring-blue-500/5 focus:border-blue-500 transition-all uppercase tracking-widest placeholder:opacity-20 italic"/>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && parsedData && (
            <div className="space-y-12 animate-fade-in">
              <div className="flex justify-between items-end px-6">
                <div className="space-y-2">
                   <div className="flex items-center gap-3">
                      <Activity size={18} className="text-blue-600 animate-pulse" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Telemetry Audit Scan</p>
                   </div>
                   <p className="text-4xl font-black text-slate-950 italic tracking-tighter leading-none">{parsedData.count} Delta Elements detected</p>
                </div>
                <button onClick={toggleAll} className="px-8 py-4 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-white hover:bg-blue-600 rounded-[2rem] transition-all border border-blue-100 shadow-xl shadow-blue-500/5">
                  {Object.values(selected).every(Boolean) ? 'Deselect Absolute' : 'Select Complete Node'}
                </button>
              </div>
              
              <div className="bg-white rounded-[4rem] border border-slate-100/80 overflow-hidden shadow-2xl shadow-slate-950/5">
                <table className="min-w-full">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">
                      <th className="p-10 w-24 text-center">SYNK</th>
                      <th className="p-10 text-left">TIMESTAMP</th>
                      <th className="p-10 text-left">LEAK NARRATIVE</th>
                      <th className="p-10 text-left">NODE</th>
                      <th className="p-10 text-right">VALUATION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {parsedData.transactions.map((txn, i) => {
                      const cur = { ...txn, ...(editing[i] || {}) };
                      return (
                        <tr key={i} className={`transition-all duration-500 ${selected[i] ? 'bg-white' : 'opacity-20 grayscale scale-[0.98]'}`}>
                          <td className="p-10 text-center cursor-pointer" onClick={() => setSelected(p => ({ ...p, [i]: !p[i] }))}>
                             <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center mx-auto transition-all ${selected[i] ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/40 rotate-12' : 'bg-white border-slate-100'}`}>
                                {selected[i] && <CheckCircle2 size={18}/>}
                             </div>
                          </td>
                          <td className="p-10 whitespace-nowrap text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] italic font-mono">{format(parseISO(cur.date), 'dd / MM / yy')}</td>
                          <td className="p-10">
                            <input type="text" value={cur.description}
                              onChange={e => setEditing(p => ({ ...p, [i]: { ...(p[i]||{}), description: e.target.value } }))}
                              className="w-full bg-transparent border-b-2 border-transparent hover:border-slate-50 focus:border-blue-500 focus:outline-none py-3 text-slate-950 font-black text-lg uppercase italic tracking-tighter placeholder:opacity-20"/>
                          </td>
                          <td className="p-10">
                            <select value={cur.category}
                              onChange={e => setEditing(p => ({ ...p, [i]: { ...(p[i]||{}), category: e.target.value } }))}
                              className="text-[10px] bg-slate-950 text-white font-black uppercase tracking-[0.3em] rounded-full px-5 py-2.5 hover:scale-105 transition-all outline-none cursor-pointer italic appearance-none shadow-lg">
                              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="p-10 text-right font-black text-rose-600 italic text-2xl tracking-tighter">{formatCurrency(cur.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-40 gap-14 text-center animate-scale-in">
              <div className="relative">
                 <div className="absolute inset-0 bg-emerald-400/20 blur-[100px] animate-pulse"></div>
                 <div className="p-14 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-[4rem] shadow-2xl relative z-10">
                    <CheckCircle2 size={100}/>
                 </div>
              </div>
              <div className="max-w-xl space-y-6">
                <h3 className="text-6xl font-black text-slate-950 uppercase tracking-tighter italic leading-none">Matrix Merged</h3>
                <p className="text-slate-400 font-black text-sm leading-relaxed uppercase tracking-[0.4em] italic opacity-60">Outbound flux stream has been successfully synchronized and archived into the local vault ledger.</p>
              </div>
              <button onClick={onClose} className="bg-slate-950 text-white px-20 py-8 rounded-3xl transition-all font-black uppercase tracking-[0.5em] text-[12px] shadow-2xl hover:scale-105 active:scale-95 shadow-blue-900/40 italic">Complete Deployment</button>
            </div>
          )}
        </div>

        {step !== 'success' && (
          <div className="p-16 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            {step === 'preview' ? (
              <>
                <button onClick={() => { setStep('upload'); setFile(null); setParsedData(null); }} className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-slate-950 transition-all italic underline flex items-center gap-4">
                   <X size={16} /> Terminate Audit
                </button>
                <div className="flex items-center gap-10 bg-white p-3 rounded-[2.5rem] pr-10 border border-slate-200 shadow-2xl shadow-slate-950/5">
                   <div className="px-10 border-r border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic opacity-60 uppercase tracking-[0.4em]">Payload Entities</p>
                      <p className="text-3xl font-black text-slate-950 italic tracking-tighter">{confirmCount}</p>
                   </div>
                   <button onClick={handleImport} disabled={confirmCount === 0 || importMutation.isPending}
                    className="bg-emerald-600 text-white px-14 py-6 rounded-[2rem] transition-all font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-emerald-700 hover:scale-105 disabled:opacity-30 flex items-center gap-4 italic group">
                    {importMutation.isPending ? 'DEPLOYING...' : 'COMMIT DELTA'}
                    <Zap size={18} className="group-hover:animate-pulse" />
                   </button>
                </div>
              </>
            ) : (
              <>
                <button onClick={onClose} className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-slate-950 transition-all italic underline">Terminate Protocol</button>
                <button onClick={() => parseMutation.mutate({ file, accountName })} disabled={!file || parseMutation.isPending}
                  className="bg-slate-950 text-white px-20 py-8 rounded-[2rem] transition-all font-black uppercase tracking-[0.5em] text-[12px] shadow-2xl hover:bg-blue-600 hover:scale-105 active:scale-95 disabled:opacity-30 flex items-center gap-6 italic group">
                  {parseMutation.isPending ? 'AUDITING...' : 'EXECUTE ENGINE'}
                  <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
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
    <div className="space-y-16 pb-40 max-w-7xl mx-auto">
      {/* Dynamic Header Bridge */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 px-6">
        <div className="space-y-6">
          <div className="flex items-center gap-5 mb-4">
             <span className="text-rose-600 font-extrabold text-[9px] uppercase tracking-[0.5em] bg-rose-50 px-4 py-2 rounded-full border border-rose-100 italic shadow-xl shadow-rose-900/5">Outbound Trace Active</span>
             <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-2 italic">{expenses?.length || 0} Registered Exit Nodes Detected</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Expenses Log</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em] opacity-60 leading-[2.5] max-w-2xl italic ml-1">Real-time analytical monitoring of strategic consumption and payload flux leakage. High-fidelity transaction auditing persistent.</p>
        </div>
        <div className="flex gap-6">
          <button onClick={() => setUploadModalOpen(true)}
            className="group flex items-center gap-6 px-12 py-8 bg-white text-slate-950 border-2 border-slate-100 rounded-[2.5rem] hover:bg-slate-50 transition-all font-black uppercase tracking-[0.4em] text-[11px] shadow-xl hover:scale-105 active:scale-95 group">
            <Upload size={22} className="text-blue-600 group-hover:-translate-y-1 transition-transform"/> 
            <span className="italic">Bulk Audit</span>
          </button>
          <button onClick={() => setFormModal({ open: true, editItem: null })}
            className="group flex items-center gap-6 px-14 py-8 bg-slate-950 text-white rounded-[2.5rem] hover:bg-blue-600 transition-all font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:scale-105 active:scale-95">
            <Plus size={26} className="group-hover:rotate-90 transition-transform" />
            <span className="italic">Register Flux</span>
          </button>
        </div>
      </div>

      {/* Analytical Filter Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 px-6">
        <div className="xl:col-span-3 relative group">
          <div className="absolute left-10 top-1/2 -translate-y-1/2 p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 group-focus-within:text-blue-600 transition-all shadow-lg group-focus-within:shadow-blue-500/10">
             <Search size={26}/>
          </div>
          <input type="text" placeholder="Trace Transaction Narrative..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-28 pr-12 py-10 w-full bg-white border-2 border-slate-100 rounded-[3rem] focus:ring-[1.5rem] focus:ring-blue-500/5 focus:border-blue-500 outline-none text-lg font-black text-slate-950 placeholder:opacity-20 uppercase tracking-[0.2em] transition-all shadow-sm italic"/>
        </div>
        <div className="relative group">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="appearance-none w-full bg-white border-2 border-slate-100 rounded-[3rem] px-12 py-10 text-[12px] font-black uppercase tracking-[0.4em] focus:ring-[1.5rem] focus:ring-blue-500/5 focus:border-blue-500 outline-none text-slate-950 shadow-sm cursor-pointer transition-all italic pr-20">
            <option value="">All Sector Clusters</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
             <TrendingDown size={24} />
          </div>
        </div>
      </div>

      {/* Record Trace Terminal */}
      {isLoading ? (
        <div className="space-y-10 animate-pulse px-6">{[1,2,3,4,5].map(i => <div key={i} className="h-28 bg-white border border-slate-100 rounded-[3rem]"/>)}</div>
      ) : expenses?.length === 0 ? (
        <div className="bg-white rounded-[5rem] border-8 border-dotted border-slate-50 p-48 text-center flex flex-col items-center gap-12 shadow-inner mx-6 group transition-all hover:bg-slate-50/10">
          <div className="relative">
             <div className="absolute inset-0 bg-slate-200 blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity"></div>
             <div className="p-16 bg-white shadow-2xl rounded-[4rem] border border-slate-50 relative z-10 scale-110 group-hover:scale-125 transition-all duration-700">
               <History size={120} className="text-slate-100 group-hover:text-blue-600/10 transition-colors" />
             </div>
          </div>
          <div className="max-w-xl space-y-6">
             <h2 className="text-6xl font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-4">Zero Outbound Detected</h2>
             <p className="text-slate-400 font-black text-sm uppercase tracking-[0.5em] opacity-40 leading-[2.5] italic">System liquidity persistent. No detected mandatory consumption exit nodes registered in current epoch.</p>
          </div>
          <div className="flex gap-8 mt-6">
            <button onClick={() => setUploadModalOpen(true)}
              className="px-14 py-7 bg-white border-2 border-slate-100 rounded-3xl text-[11px] font-black uppercase tracking-[0.5em] hover:bg-slate-50 transition-all italic shadow-xl">
              Execute Bulk Audit
            </button>
            <button onClick={() => setFormModal({ open: true, editItem: null })}
              className="bg-slate-950 text-white px-16 py-7 rounded-3xl text-[11px] font-black uppercase tracking-[0.5em] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/20 italic">
              New Flux Registration
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[4rem] shadow-sm border border-slate-200/50 overflow-hidden mx-6 hover:shadow-2xl transition-all duration-700 group/table py-4">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100 italic">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
                  <th className="px-16 py-12 text-left">TIMESTAMP</th>
                  <th className="px-16 py-12 text-left">CONSUMPTION NARRATIVE</th>
                  <th className="px-16 py-12 text-left">SECTOR</th>
                  <th className="px-16 py-12 text-left">SOURCE ORIGIN</th>
                  <th className="px-16 py-12 text-right">FLUX LOSS</th>
                  <th className="px-16 py-12 w-48"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-slate-50/80 group transition-all duration-500 cursor-default">
                    <td className="px-16 py-14 whitespace-nowrap text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] italic font-mono">{format(parseISO(expense.date), 'dd / MM / yy')}</td>
                    <td className="px-16 py-14">
                      <div className="flex items-center gap-10">
                        <div className="p-6 bg-white border border-slate-100 text-rose-600 rounded-[2.5rem] shadow-sm transition-transform group-hover:rotate-[15deg] group-hover:scale-110 group-hover:bg-rose-50 transition-all duration-500"><ArrowDownRight size={28}/></div>
                        <div>
                           <p className="font-black text-slate-950 text-3xl tracking-tighter italic uppercase leading-none mb-3">{expense.description}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic opacity-40">Verified Exit Node: {expense.category.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-16 py-14">
                       <span className="text-[10px] font-black bg-slate-950 text-white px-6 py-2.5 rounded-full uppercase tracking-[0.3em] italic shadow-lg shadow-slate-950/20">{expense.category}</span>
                    </td>
                    <td className="px-16 py-14 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic opacity-60 truncate max-w-[150px] group-hover:opacity-100 transition-opacity">{expense.account || 'DIRECT_LIQUID'}</td>
                    <td className="px-16 py-14 text-right">
                       <p className="font-black text-rose-600 text-4xl italic tracking-tighter scale-100 group-hover:scale-110 transition-all duration-500 origin-right">
                         {formatCurrency(expense.amount)}
                       </p>
                    </td>
                    <td className="px-16 py-14 text-right">
                      <div className="flex items-center justify-end gap-6 opacity-0 group-hover:opacity-100 transition-all translate-x-8 group-hover:translate-x-0">
                        <button onClick={() => setFormModal({ open: true, editItem: expense })} className="p-5 bg-white text-slate-300 hover:text-blue-600 hover:border-blue-100 border border-slate-100 rounded-2xl shadow-xl hover:scale-110 transition-all duration-300"><Pencil size={22}/></button>
                        <button onClick={() => { if(window.confirm('IRREVERSIBLE: TERMINATE EXIT NODE?')) deleteMutation.mutate(expense.id); }} className="p-5 bg-white text-slate-300 hover:text-rose-600 hover:border-rose-100 border border-slate-100 rounded-2xl shadow-xl hover:scale-110 transition-all duration-300"><Trash2 size={22}/></button>
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
