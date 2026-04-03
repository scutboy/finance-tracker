import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Plus, Receipt, Upload, Search, Trash2, FileText, FileSpreadsheet, X, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';
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
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm"><AlertCircle size={16}/>{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input required type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs) *</label>
              <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input required value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="e.g. Keells Super, Uber ride"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select required value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 bg-white">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account / Card</label>
              <input value={form.account} onChange={e => set('account', e.target.value)}
                placeholder="e.g. BOC Card, Cash"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"/>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50">
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Expense'}
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
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Import Bank Statement</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {step === 'upload' && 'Upload a PDF or CSV statement'}
              {step === 'preview' && `${parsedData?.count || 0} transactions found — review before saving`}
              {step === 'success' && 'All done!'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div className="space-y-5">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('stmt-file-input').click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
              >
                <input id="stmt-file-input" type="file" accept=".pdf,.csv" className="hidden"
                  onChange={(e) => { const f = e.target.files[0]; if (f) setFile(f); }}/>
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileIcon size={40} className="text-blue-500"/>
                    <p className="font-semibold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-xs text-red-500 hover:underline mt-1">Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 pointer-events-none">
                    <Upload size={40} className="text-gray-300"/>
                    <div>
                      <p className="font-semibold text-gray-700">Drag & drop your statement here</p>
                      <p className="text-sm text-gray-400 mt-1">PDF or CSV — max 20 MB</p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account / Card Name (optional)</label>
                <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)}
                  placeholder="e.g. BOC Credit Card, Sampath Savings"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"/>
              </div>
              {error && <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600"><AlertCircle size={16} className="shrink-0 mt-0.5"/>{error}</div>}
            </div>
          )}

          {step === 'preview' && parsedData && (
            <div className="space-y-4">
              {parsedData.count === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle size={40} className="mx-auto text-gray-300 mb-3"/>
                  <p className="font-medium text-gray-700">No transactions could be extracted</p>
                  <button onClick={() => { setStep('upload'); setFile(null); }} className="mt-4 text-blue-600 text-sm underline">Try another file</button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500"><span className="font-bold text-gray-900">{confirmCount}</span> of {parsedData.count} selected</p>
                    <button onClick={toggleAll} className="text-sm text-blue-600 hover:underline font-medium">
                      {Object.values(selected).every(Boolean) ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 w-8"/>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                          <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {parsedData.transactions.map((txn, i) => {
                          const cur = { ...txn, ...(editing[i] || {}) };
                          return (
                            <tr key={i} className={`transition-colors ${selected[i] ? 'bg-white' : 'bg-gray-50 opacity-50'}`}>
                              <td className="px-3 py-2.5"><input type="checkbox" checked={!!selected[i]} onChange={() => setSelected(p => ({ ...p, [i]: !p[i] }))} className="rounded text-blue-500"/></td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-gray-500 text-xs">{format(parseISO(cur.date), 'dd MMM yyyy')}</td>
                              <td className="px-3 py-2.5 max-w-xs">
                                <input type="text" value={cur.description}
                                  onChange={e => setEditing(p => ({ ...p, [i]: { ...(p[i]||{}), description: e.target.value } }))}
                                  className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none py-0.5 text-gray-900"/>
                              </td>
                              <td className="px-3 py-2.5">
                                <select value={cur.category}
                                  onChange={e => setEditing(p => ({ ...p, [i]: { ...(p[i]||{}), category: e.target.value } }))}
                                  className="text-xs bg-gray-100 border-0 rounded-full px-2 py-1 focus:ring-1 focus:ring-blue-500 cursor-pointer">
                                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                              </td>
                              <td className="px-3 py-2.5 text-right font-bold text-gray-900 whitespace-nowrap">{formatCurrency(cur.amount)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {error && <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600"><AlertCircle size={16} className="shrink-0 mt-0.5"/>{error}</div>}
                </>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <CheckCircle2 size={56} className="text-green-500"/>
              <h3 className="text-xl font-bold text-gray-900">Import Complete!</h3>
              <p className="text-gray-500 text-sm">Your transactions have been saved.</p>
              <button onClick={onClose} className="mt-3 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition font-medium">Done</button>
            </div>
          )}
        </div>

        {step !== 'success' && (
          <div className="p-5 border-t border-gray-100 flex justify-between bg-gray-50">
            {step === 'preview' ? (
              <>
                <button onClick={() => { setStep('upload'); setFile(null); setParsedData(null); }} className="text-sm text-gray-500 hover:text-gray-700 font-medium">← Different file</button>
                <button onClick={handleImport} disabled={confirmCount === 0 || importMutation.isPending}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition font-medium shadow-sm disabled:opacity-50 text-sm">
                  {importMutation.isPending ? 'Importing…' : `Import ${confirmCount} transaction${confirmCount !== 1 ? 's' : ''}`}
                </button>
              </>
            ) : (
              <>
                <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
                <button onClick={() => parseMutation.mutate({ file, accountName })} disabled={!file || parseMutation.isPending}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 text-sm">
                  {parseMutation.isPending ? 'Parsing…' : 'Parse Statement →'}
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
    queryClient.invalidateQueries({ queryKey: ['expensesThisMonth'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Expenses Log</h1>
          <p className="text-gray-500 mt-1">Track and search your transaction history.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium text-sm">
            <Upload size={16}/> Import Statement
          </button>
          <button onClick={() => setFormModal({ open: true, editItem: null })}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition shadow-sm font-medium text-sm">
            <Plus size={16}/> Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={17}/>
          <input type="text" placeholder="Search descriptions…" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"/>
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 bg-white">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : expenses?.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-3">
            <Receipt size={48} className="text-gray-200"/>
            <p className="font-medium text-gray-700">No expenses found</p>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setUploadModalOpen(true)}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                <Upload size={15}/> Import Statement
              </button>
              <button onClick={() => setFormModal({ open: true, editItem: null })}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                <Plus size={15}/> Add Manually
              </button>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Account</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 w-20"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-3.5 text-sm text-gray-400">{format(parseISO(expense.date), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{expense.description}</td>
                  <td className="px-6 py-3.5"><span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{expense.category}</span></td>
                  <td className="px-6 py-3.5 text-sm text-gray-400">{expense.account || '—'}</td>
                  <td className="px-6 py-3.5 text-sm font-bold text-gray-900 text-right">{formatCurrency(expense.amount)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => setFormModal({ open: true, editItem: expense })} className="text-gray-400 hover:text-blue-600"><Pencil size={14}/></button>
                      <button onClick={() => deleteMutation.mutate(expense.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
