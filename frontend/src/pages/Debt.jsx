import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  Plus, CreditCard, X, Trash2, AlertCircle,
  DollarSign, ChevronDown, ChevronUp, Pencil, History
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const DEBT_TYPES = ['Credit Card', 'Personal Loan', 'Mortgage', 'Vehicle Loan', 'Other'];
const PAID_OFF_STATUS = 'Paid Off';

// ─── Reusable Debt Form Modal (Add + Edit) ────────────────────────────────────
const DebtFormModal = ({ editItem = null, onClose, onSuccess }) => {
  const isEdit = !!editItem;
  const [form, setForm] = useState({
    name: editItem?.name || '',
    type: editItem?.type || 'Credit Card',
    balance: editItem?.balance ?? '',
    credit_limit: editItem?.credit_limit ?? '',
    interest_rate: editItem?.interest_rate ?? '',
    min_payment: editItem?.min_payment ?? '',
    due_date: editItem?.due_date ?? '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/debts/${editItem.id}`, data)).data;
      return (await api.post('/debts/', data)).data;
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Failed to save.'),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    mutation.mutate({
      name: form.name, type: form.type,
      balance: parseFloat(form.balance),
      credit_limit: form.credit_limit !== '' ? parseFloat(form.credit_limit) : null,
      interest_rate: parseFloat(form.interest_rate),
      min_payment: parseFloat(form.min_payment),
      due_date: form.due_date !== '' ? parseInt(form.due_date) : null,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Account' : 'Add Credit / Loan Account'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm"><AlertCircle size={16}/>{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Account / Card Name *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. BOC Credit Card"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type *</label>
              <select required value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                {DEBT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance (Rs) *</label>
              <input required type="number" min="0" step="0.01" value={form.balance} onChange={e => set('balance', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (Rs)</label>
              <input type="number" min="0" step="0.01" value={form.credit_limit} onChange={e => set('credit_limit', e.target.value)}
                placeholder="Cards only"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (% / yr) *</label>
              <input required type="number" min="0" step="0.01" value={form.interest_rate} onChange={e => set('interest_rate', e.target.value)}
                placeholder="e.g. 24"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min. Payment (Rs) *</label>
              <input required type="number" min="0" step="0.01" value={form.min_payment} onChange={e => set('min_payment', e.target.value)}
                placeholder="e.g. 5000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (day of month)</label>
              <input type="number" min="1" max="31" value={form.due_date} onChange={e => set('due_date', e.target.value)}
                placeholder="e.g. 15"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50">
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Make Payment Modal ───────────────────────────────────────────────────────
const MakePaymentModal = ({ debt, onClose, onSuccess }) => {
  const today = new Date().toISOString().split('T')[0];
  const [amount, setAmount] = useState(String(debt.min_payment));
  const [paymentDate, setPaymentDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => (await api.post(`/debts/${debt.id}/payment`, data)).data,
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.response?.data?.detail || 'Failed to record payment.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    mutation.mutate({ amount: parseFloat(amount), payment_date: paymentDate, notes: notes || null });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Make Payment</h2>
            <p className="text-sm text-gray-500 mt-0.5">{debt.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm"><AlertCircle size={16}/>{error}</div>}
          <div className="bg-blue-50 rounded-xl p-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Balance</span>
            <span className="font-extrabold text-gray-900 text-lg">{formatCurrency(debt.balance)}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (Rs) *</label>
            <input required type="number" min="0.01" step="0.01" value={amount}
              onChange={e => setAmount(e.target.value)} autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"/>
            <p className="text-xs text-gray-400 mt-1">Min payment: {formatCurrency(debt.min_payment)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
            <input required type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Full payment, Partial, Statement payment"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
            <button type="submit" disabled={mutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50">
              {mutation.isPending ? 'Recording…' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Debt Card ────────────────────────────────────────────────────────────────
const DebtCard = ({ debt, onEdit, onDelete, onPay }) => {
  const [showHistory, setShowHistory] = useState(false);
  const utilisation = debt.credit_limit ? (debt.balance / debt.credit_limit) * 100 : 0;
  let barColor = 'bg-green-500';
  if (utilisation > 40) barColor = 'bg-amber-500';
  if (utilisation > 75) barColor = 'bg-red-500';

  const payments = debt.payments ?? [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><CreditCard size={22}/></div>
            <div>
              <h3 className="font-bold text-gray-900">{debt.name}</h3>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{debt.type}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">{formatCurrency(debt.balance)}</p>
              <p className="text-xs text-gray-400">{debt.interest_rate}% APR</p>
            </div>
            <div className="flex flex-col gap-1 ml-1">
              <button onClick={onEdit} className="text-gray-400 hover:text-blue-600 transition p-0.5"><Pencil size={14}/></button>
              <button onClick={onDelete} className="text-gray-400 hover:text-red-500 transition p-0.5"><Trash2 size={14}/></button>
            </div>
          </div>
        </div>

        {debt.credit_limit > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1 text-gray-500">
              <span>Credit Utilisation</span>
              <span className="font-bold text-gray-700">{utilisation.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`${barColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${Math.min(utilisation, 100)}%` }}/>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>Min: {formatCurrency(debt.min_payment)}</span>
              {debt.due_date && <span>Due: {debt.due_date}th</span>}
              <span>Limit: {formatCurrency(debt.credit_limit)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onPay}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-600 border border-blue-500 rounded-lg hover:bg-blue-50 transition">
            <DollarSign size={14}/> Make Payment
          </button>
          {payments.length > 0 && (
            <button onClick={() => setShowHistory(h => !h)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <History size={14}/>
              {showHistory ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
            </button>
          )}
        </div>
      </div>

      {/* Payment History Panel */}
      {showHistory && payments.length > 0 && (
        <div className="border-t border-gray-100 px-6 pb-4 pt-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <History size={12}/> Payment History
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[...payments].sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)).map(p => (
              <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    {format(parseISO(p.payment_date), 'dd MMM yyyy')}
                  </p>
                  {p.notes && <p className="text-xs text-gray-400">{p.notes}</p>}
                </div>
                <span className="text-sm font-bold text-green-600">- {formatCurrency(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Debt Page ────────────────────────────────────────────────────────────────
const Debt = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editDebt, setEditDebt] = useState(null);
  const [paymentDebt, setPaymentDebt] = useState(null);

  const { data: debts, isLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: async () => (await api.get('/debts/')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/debts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['debts'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
  };

  const activeDebts = debts?.filter(d => d.status !== PAID_OFF_STATUS) ?? [];
  const totalDebt = activeDebts.reduce((s, d) => s + d.balance, 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Credit & Debt</h1>
          <p className="text-gray-500 mt-1">Manage your credit cards and loans.</p>
        </div>
        <button onClick={() => { setEditDebt(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium">
          <Plus size={18}/> Add Account
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"/>)}
        </div>
      ) : activeDebts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center flex flex-col items-center gap-3">
          <CreditCard size={40} className="text-gray-300"/>
          <p className="font-medium text-gray-700">No accounts added yet</p>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition mt-1">
            Add your first account
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Outstanding Debt</p>
            <p className="text-3xl font-extrabold text-red-600">{formatCurrency(totalDebt)}</p>
            <p className="text-xs text-gray-400 mt-1">{activeDebts.length} active account{activeDebts.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeDebts.map(debt => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onEdit={() => { setEditDebt(debt); setShowForm(true); }}
                onDelete={() => deleteMutation.mutate(debt.id)}
                onPay={() => setPaymentDebt(debt)}
              />
            ))}
          </div>
        </>
      )}

      {showForm && (
        <DebtFormModal
          editItem={editDebt}
          onClose={() => { setShowForm(false); setEditDebt(null); }}
          onSuccess={invalidate}
        />
      )}
      {paymentDebt && (
        <MakePaymentModal
          debt={paymentDebt}
          onClose={() => setPaymentDebt(null)}
          onSuccess={invalidate}
        />
      )}
    </div>
  );
};

export default Debt;
