import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { MessageSquare, ArrowDownRight, ArrowUpRight, RefreshCw, CheckCircle2, AlertTriangle, ChevronRight, X } from 'lucide-react';

const TYPE_STYLES = {
  expense:  { bg: 'bg-rose-50',   text: 'text-rose-600',   label: 'Expense',  icon: ArrowDownRight },
  income:   { bg: 'bg-emerald-50',text: 'text-emerald-600',label: 'Income',   icon: ArrowUpRight },
  transfer: { bg: 'bg-blue-50',   text: 'text-blue-600',   label: 'Transfer', icon: RefreshCw },
};

export default function SMSInbox() {
  const [raw, setRaw]           = useState('');
  const [parsed, setParsed]     = useState(null);
  const [selected, setSelected] = useState([]);
  const [saved, setSaved]       = useState(null);

  const parseMutation = useMutation({
    mutationFn: (text) => api.post('/sms/parse', { raw_text: text }).then(r => r.data),
    onSuccess: (data) => {
      setParsed(data.parsed);
      setSelected(data.parsed.map((_, i) => i));   // all ticked by default
      setSaved(null);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (txns) => api.post('/sms/confirm', { transactions: txns }).then(r => r.data),
    onSuccess: (data) => {
      setSaved(data.saved);
      setParsed(null);
      setRaw('');
    },
  });

  const toggle = (i) =>
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const handleConfirm = () => {
    const toSave = parsed.filter((_, i) => selected.includes(i));
    confirmMutation.mutate(toSave);
  };

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto px-6 italic">

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 text-white rounded-[2rem] shadow-2xl">
            <MessageSquare size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase leading-none italic">SMS Inbox</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 opacity-60">
              Paste bank notifications · Any bank · Any format
            </p>
          </div>
        </div>
      </div>

      {/* Success banner */}
      {saved !== null && (
        <div className="flex items-center justify-between p-8 bg-emerald-600 rounded-[2.5rem] shadow-xl text-white animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-white/20 rounded-2xl"><CheckCircle2 size={24} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Import Successful</p>
              <h3 className="text-2xl font-black tracking-tighter uppercase">{saved} Transactions Written to Disk</h3>
            </div>
          </div>
          <button onClick={() => setSaved(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
        </div>
      )}

      {/* Input Stage */}
      {!parsed && (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none"/>
            <div className="p-10 relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter">Raw Data Input</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Paste your copy-pasted SMS cluster here</p>
                    </div>
                </div>

                <textarea
                    className="w-full h-64 p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] text-sm font-mono text-slate-700 resize-none focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-300 italic"
                    placeholder={`Paste bank messages here...\n\nExample:\nRs.5,230.00 has been debited from your BOC account ending 8214 on 18/04/2026 at KEELLS SUPER.`}
                    value={raw}
                    onChange={e => setRaw(e.target.value)}
                />

                <div className="flex items-center justify-between pt-4">
                    <div className="flex gap-4">
                        {['BOC', 'ComBank', 'Sampath', 'NDB', 'AMEX'].map(bank => (
                            <span key={bank} className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100 px-3 py-1.5 rounded-full bg-white">{bank}</span>
                        ))}
                    </div>
                    <button
                        onClick={() => parseMutation.mutate(raw)}
                        disabled={!raw.trim() || parseMutation.isPending}
                        className="group flex items-center gap-4 px-10 py-5 bg-slate-950 hover:bg-blue-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-30 active:scale-95"
                    >
                        {parseMutation.isPending ? 'Intercepting...' : 'Process Cluster'}
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Results Stage */}
      {parsed && (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 bg-slate-50/30">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">Audit Preview</p>
              <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">
                {parsed.length} Transactions <span className="text-blue-600">Detected</span>
              </h2>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => { setParsed(null); setSaved(null); }}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors"
              >
                Abort
              </button>
              <button
                onClick={handleConfirm}
                disabled={selected.length === 0 || confirmMutation.isPending}
                className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 disabled:opacity-30"
              >
                {confirmMutation.isPending ? 'Writing to DB...' : `Confirm ${selected.length} Entries`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                  <th className="px-10 py-6 text-left">Select</th>
                  <th className="px-10 py-6 text-left">Classification</th>
                  <th className="px-10 py-6 text-left">Entity & Account</th>
                  <th className="px-10 py-6 text-right">Magnitude (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {parsed.map((txn, i) => {
                  const style = TYPE_STYLES[txn.type] || TYPE_STYLES.expense;
                  const Icon  = style.icon;
                  const isOn  = selected.includes(i);
                  return (
                    <tr
                      key={i}
                      onClick={() => toggle(i)}
                      className={`group cursor-pointer transition-all ${isOn ? 'bg-white' : 'bg-slate-50/50 grayscale opacity-40'}`}
                    >
                      <td className="px-10 py-6">
                        <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${isOn ? 'bg-slate-900 border-slate-900 shadow-md scale-110' : 'border-slate-200 bg-white'}`}>
                          {isOn && <CheckCircle2 className="text-white" size={12} strokeWidth={4} />}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                         <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${style.bg} ${style.text} shadow-sm group-hover:scale-110 transition-transform`}>
                                <Icon size={16} strokeWidth={3} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${style.text}`}>
                                {style.label}
                            </span>
                         </div>
                      </td>
                      <td className="px-10 py-6">
                        <p className="font-black text-slate-950 text-sm tracking-tight uppercase group-hover:text-blue-600 transition-colors uppercase">{txn.description}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">{txn.date} · {txn.account}</p>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <p className={`text-lg font-black tracking-tighter ${style.text}`}>
                          {txn.type === 'income' ? '+' : '-'} {formatCurrency(txn.amount)}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {parsed.length === 0 && (
            <div className="py-24 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <AlertTriangle size={32} />
                </div>
                <p className="font-black text-slate-300 uppercase tracking-widest text-[11px]">No viable patterns detected in terminal cluster.</p>
            </div>
          )}
        </div>
      )}

      {/* Pro Hint */}
      <div className="text-center py-12 bg-white/40 backdrop-blur-md rounded-[3rem] border border-slate-200/50">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] px-16 opacity-50 leading-loose">
           Vantage Pro Ingestion Engine · Optimized for Sri Lankan Private Banking SMS notification schemas
        </p>
      </div>
    </div>
  );
}
