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
    onError: (e) => setError(e.response?.data?.detail || 'Sync Error.'),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between p-8 bg-slate-50/50 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic">{isEdit ? 'Refine Leak' : 'Register Flux Exit'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-950 transition-all"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input required type="date" value={form.date} onChange={e => set('date', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none"/>
            <input required type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="Amount" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none font-mono"/>
          </div>
          <input required value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none italic"/>
          <div className="grid grid-cols-2 gap-4">
            <select required value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black uppercase outline-none">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input value={form.account} onChange={e => set('account', e.target.value)} placeholder="Source" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none uppercase italic tracking-widest"/>
          </div>
          <button type="submit" className="w-full py-4 bg-slate-950 text-white rounded-xl font-black uppercase tracking-widest text-[10px] italic hover:bg-rose-600 transition-all">
            {mutation.isPending ? 'Syncing...' : 'Lock Exit Node'}
          </button>
        </form>
      </div>
    </div>
  );
};

const UploadModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [accountName, setAccountName] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [selected, setSelected] = useState({});
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
    onError: () => setError('Handshake Refused. Verify Statement.'),
  });

  const importMutation = useMutation({
    mutationFn: async (txns) => (await api.post('/expenses/import', txns)).data,
    onSuccess: () => { setStep('success'); onSuccess(); },
  });

  const handleImport = () => {
    const rows = parsedData.transactions.filter((_, i) => selected[i]);
    importMutation.mutate(rows);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-100">
        <div className="p-10 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter italic">Bulk Audit Protocol</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-950 transition-all"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-10 bg-white">
          {step === 'upload' && (
            <div className="space-y-12">
              <div onClick={() => document.getElementById('stmt-file-input').click()}
                className="border-4 border-dashed rounded-[2rem] p-20 text-center cursor-pointer bg-slate-50/50 hover:border-blue-500 transition-all">
                <input id="stmt-file-input" type="file" accept=".pdf,.csv" className="hidden"
                  onChange={(e) => { const f = e.target.files[0]; if (f) setFile(f); }}/>
                {file ? <div className="font-bold text-slate-950">{file.name}</div> : <div className="text-slate-400 font-black uppercase tracking-widest italic">Inject Data Stream</div>}
              </div>
              <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Source Node Identity"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-black outline-none uppercase italic tracking-widest"/>
              <button onClick={() => parseMutation.mutate({ file, accountName })} disabled={!file || parseMutation.isPending}
                className="w-full py-5 bg-slate-950 text-white rounded-xl font-black uppercase tracking-widest text-[10px] italic shadow-xl">
                {parseMutation.isPending ? 'Syncing...' : 'Execute Audit'}
              </button>
            </div>
          )}
          {step === 'preview' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <p className="text-xl font-black italic">{parsedData.transactions.length} Elements Detected</p>
                   <button onClick={handleImport} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] italic">Commit Delta</button>
                </div>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                   <table className="w-full text-xs">
                      <thead className="bg-slate-50 font-black uppercase italic">
                         <tr><th className="p-4 text-left">Date</th><th className="p-4 text-left">Description</th><th className="p-4 text-right">Amount</th></tr>
                      </thead>
                      <tbody>
                         {parsedData.transactions.map((t, i) => (
                           <tr key={i} className="border-t border-slate-50"><td className="p-4 uppercase font-mono">{t.date}</td><td className="p-4 font-bold truncate max-w-[200px]">{t.description}</td><td className="p-4 text-right font-black text-rose-600">{formatCurrency(t.amount)}</td></tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}
          {step === 'success' && (
             <div className="py-20 text-center space-y-8">
                <div className="p-8 bg-emerald-50 text-emerald-500 rounded-full inline-block"><CheckCircle2 size={64}/></div>
                <h3 className="text-3xl font-black italic">Matrix Merged</h3>
                <button onClick={onClose} className="bg-slate-950 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] italic">Complete</button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
      queryClient.invalidateQueries({ queryKey:['expenses'] });
      queryClient.invalidateQueries({ queryKey:['dashboardSummary'] });
    },
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey:['expenses'] });
    queryClient.invalidateQueries({ queryKey:['dashboardSummary'] });
  };

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 px-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
             <span className="text-rose-600 font-black text-[8px] uppercase tracking-[0.4em] bg-rose-50 px-3 py-1.5 rounded-full italic">Outbound Trace Active</span>
             <span className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] opacity-40 ml-2 italic">{expenses?.length || 0} Registered Nodes</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Expenses Log</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 italic ml-1">Real-time analytical monitoring of consumption flux.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-4 px-8 py-5 bg-white text-slate-950 border border-slate-100 rounded-[1.5rem] hover:bg-slate-50 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-sm italic">
            <Upload size={18} className="text-blue-600"/> Bulk Audit
          </button>
          <button onClick={() => setFormModal({ open: true, editItem: null })}
            className="flex items-center gap-4 px-8 py-5 bg-slate-950 text-white rounded-[1.5rem] hover:bg-rose-600 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-xl italic">
            <Plus size={22} /> Register Flux
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 px-6">
        <div className="xl:col-span-3">
          <input type="text" placeholder="Trace Transaction..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-8 py-5 w-full bg-white border border-slate-100 rounded-[2rem] outline-none text-base font-bold text-slate-950 placeholder:opacity-20 uppercase tracking-[0.1em] italic shadow-sm"/>
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="w-full bg-white border border-slate-100 rounded-[2rem] px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] outline-none text-slate-950 italic cursor-pointer shadow-sm">
          <option value="">All Sectors</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mx-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic">
                <th className="px-8 py-6 text-left">Timestamp</th>
                <th className="px-8 py-6 text-left">Narrative</th>
                <th className="px-8 py-6 text-left">Sector</th>
                <th className="px-8 py-6 text-right">Flux Loss</th>
                <th className="px-8 py-6 w-32"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="px-8 py-6"><div className="h-8 bg-slate-50 rounded-xl"></div></td></tr>)
              ) : (
                expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-slate-50 group transition-all">
                    <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono italic">{format(parseISO(expense.date), 'dd/MM/yy')}</td>
                    <td className="px-8 py-6">
                       <p className="font-black text-slate-950 text-xl tracking-tighter uppercase italic leading-none group-hover:text-blue-600 transition-colors">{expense.description}</p>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[8px] font-black bg-slate-950 text-white px-3 py-1 rounded-full uppercase tracking-[0.2em] italic">{expense.category}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <p className="font-black text-rose-600 text-2xl italic tracking-tighter">{formatCurrency(expense.amount)}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => setFormModal({ open: true, editItem: expense })} className="text-slate-300 hover:text-blue-600"><Pencil size={16}/></button>
                        <button onClick={() => { if(window.confirm('Delete?')) deleteMutation.mutate(expense.id); }} className="text-slate-300 hover:text-rose-600"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {formModal.open && <ExpenseFormModal editItem={formModal.editItem} onClose={() => setFormModal({ open: false, editItem: null })} onSuccess={handleSuccess} />}
      {uploadModalOpen && <UploadModal onClose={() => setUploadModalOpen(false)} onSuccess={handleSuccess}/>}
    </div>
  );
};

export default Expenses;
