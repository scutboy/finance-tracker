import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Lock, 
  Download, 
  Database,
  Globe,
  RefreshCw,
  Cpu,
  Activity,
  Trash2,
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="space-y-12 pb-32">
      {/* Header Symmetry */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
             <span className="bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full italic">System: Online</span>
             <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">Node ID: {user?.id?.slice(0,8) || 'VANTAGE'}</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Settings</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] opacity-60 leading-none italic ml-1">Configure Identity Protocols & Global Persistence.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Identity Hub */}
         <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-700">
               <div className="p-12 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-6">
                     <div className="p-5 bg-white border border-slate-100 text-blue-600 rounded-[2rem] shadow-xl group-hover:rotate-12 transition-transform duration-500"><User size={28} /></div>
                     <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter italic">Identity</h3>
                  </div>
               </div>
               <div className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="block text-[9px] uppercase font-black text-slate-400 ml-4 tracking-[0.4em] italic opacity-60">Full Name</label>
                      <input type="text" defaultValue={user?.name || ''} 
                        className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 outline-none focus:border-blue-500 transition-all uppercase tracking-widest italic"/>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[9px] uppercase font-black text-slate-400 ml-4 tracking-[0.4em] italic opacity-60">Email Node</label>
                      <input type="email" disabled defaultValue={user?.email || ''} 
                        className="w-full bg-slate-100 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-400 outline-none cursor-not-allowed italic"/>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <button className="bg-slate-950 text-white px-12 py-6 rounded-[1.5rem] hover:bg-blue-600 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-xl italic flex items-center gap-4">
                      Update Node
                      <ChevronRight size={14} />
                    </button>
                  </div>
               </div>
            </div>

            {/* Security Protocol */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-700">
               <div className="p-12 border-b border-slate-50 flex items-center gap-6 bg-slate-50/30">
                  <div className="p-5 bg-white border border-slate-100 text-amber-600 rounded-[2rem] shadow-xl group-hover:-rotate-12 transition-transform duration-500"><Lock size={28} /></div>
                  <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter italic">Security</h3>
               </div>
               <div className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <input type="password" placeholder="New Password" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 outline-none focus:border-amber-500 transition-all italic"/>
                    <input type="password" placeholder="Confirm Password" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-black text-slate-950 outline-none focus:border-amber-500 transition-all italic"/>
                  </div>
                  <div className="flex items-center justify-end">
                    <button className="bg-white border border-slate-200 text-slate-950 px-12 py-6 rounded-[1.5rem] hover:bg-slate-50 transition-all font-black uppercase tracking-[0.4em] text-[10px] shadow-sm italic">
                      Rotate Cipher
                    </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Sidebar Controls */}
         <div className="space-y-10">
            <div className="bg-slate-950 rounded-[3rem] p-12 text-white relative group overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
               <div className="flex items-center gap-6 mb-8">
                  <div className="p-4 bg-white/5 rounded-2xl"><Database className="text-blue-500" size={32} /></div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Export</h3>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 italic leading-relaxed">Extract full transaction flux as encrypted JSON.</p>
               <button className="w-full flex items-center justify-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-6 rounded-[2rem] transition-all font-black uppercase tracking-[0.4em] text-[10px] italic">
                  <Download size={20} />
                  Download Sync
               </button>
            </div>

            <div className="bg-rose-50/30 rounded-[3rem] border border-rose-100 p-12 group transition-all hover:bg-rose-50">
               <div className="flex items-center gap-6 mb-8">
                  <div className="p-4 bg-white text-rose-600 rounded-2xl shadow-sm border border-rose-100"><ShieldAlert size={32} /></div>
                  <h3 className="text-2xl font-black text-rose-600 uppercase tracking-tighter italic">Danger Zone</h3>
               </div>
               <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-10 italic leading-relaxed">Permanent deletion of account node and flux data.</p>
               <button onClick={() => {if(window.confirm('IRREVERSIBLE: PURGE ACCOUNT?')){logout()}}} 
                 className="w-full flex items-center justify-center gap-4 bg-rose-600 text-white px-8 py-6 rounded-[2rem] transition-all font-black uppercase tracking-[0.4em] text-[10px] italic shadow-xl shadow-rose-500/20 hover:bg-slate-950">
                  <Trash2 size={20} />
                  Purge Node
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Settings;
