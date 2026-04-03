import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Lock, 
  Download, 
  Database, 
  ShieldAlert, 
  ShieldCheck, 
  Fingerprint, 
  Activity, 
  Trash2, 
  ShieldHalf, 
  LayoutDashboard, 
  Database as DataIcon,
  Zap,
  Globe,
  RefreshCw,
  Cpu,
  Key,
  Shield,
  ChevronRight
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="space-y-20 pb-40 max-w-7xl mx-auto">
      {/* Management Console Header */}
       <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 px-6">
        <div className="space-y-6">
          <div className="flex items-center gap-5 mb-4">
             <span className="bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full shadow-2xl shadow-slate-900/40 italic">System Console: Active</span>
             <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-2 italic">Node Encryption: SHA-512 PERSISTENT</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">System Settings</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em] opacity-60 leading-[2.5] max-w-2xl italic ml-1">Configure Identity Protocols & Global Vault Clusters. Management of core system flux persistence and security matrices.</p>
        </div>
        <div className="flex items-center gap-6 p-4 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl">
           <div className="p-4 bg-emerald-50 text-emerald-500 rounded-3xl animate-pulse"><Globe size={24} /></div>
           <div className="pr-8">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic opacity-60 uppercase tracking-[0.5em]">Global Node Sync</p>
              <p className="text-xl font-black text-slate-950 italic tracking-tighter">VERIFIED_STABLE</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-6">
         {/* Protocol Management (Identity & Security) */}
         <div className="lg:col-span-2 space-y-12">
            {/* Profile Protocol */}
            <div className="bg-white rounded-[4rem] shadow-sm border border-slate-200/50 overflow-hidden transition-all duration-700 hover:shadow-2xl hover:scale-[1.01] group">
               <div className="p-14 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-8">
                    <div className="p-6 bg-white border border-slate-100 text-blue-600 rounded-[2.5rem] shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-blue-500/10"><User size={32} /></div>
                    <div>
                       <h3 className="text-4xl font-black text-slate-950 uppercase tracking-tighter italic leading-none mb-3">Identity Cluster</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic opacity-60">Primary User Profile Management</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 mb-3 opacity-40 italic leading-none uppercase">Anchor Node ID</p>
                    <span className="text-[12px] font-black uppercase tracking-widest text-slate-950 bg-slate-100 px-4 py-2 rounded-xl italic font-mono">{user?.id?.slice(0,12) || 'VANTAGE_ADM_01'}</span>
                 </div>
               </div>
               <div className="p-14 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-4">
                     <label className="block text-[10px] uppercase font-black text-slate-400 ml-4 tracking-[0.5em] opacity-80 italic leading-none">Identity Handle (Full Name)</label>
                     <input type="text" defaultValue={user?.name || ''} 
                       className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] px-10 py-8 text-lg font-black text-slate-950 outline-none focus:ring-[1rem] focus:ring-blue-500/5 focus:border-blue-500 transition-all uppercase tracking-widest italic placeholder:opacity-20"/>
                   </div>
                   <div className="space-y-4">
                     <label className="block text-[10px] uppercase font-black text-slate-400 ml-4 tracking-[0.5em] opacity-80 italic leading-none">Communication Vector (Email)</label>
                     <input type="email" disabled defaultValue={user?.email || ''} 
                       className="w-full bg-slate-100 border border-slate-200 rounded-[2.5rem] px-10 py-8 text-lg font-black text-slate-400 outline-none cursor-not-allowed opacity-60 italic"/>
                   </div>
                 </div>
                 <div className="flex items-center justify-between pt-10 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                       <RefreshCw size={18} className="text-blue-600 opacity-40 group-hover:rotate-180 transition-transform duration-1000" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Node Persistent Since Acquisition</p>
                    </div>
                    <button className="bg-slate-950 text-white px-16 py-8 rounded-[2rem] hover:bg-blue-600 transition-all font-black uppercase tracking-[0.5em] text-[12px] shadow-2xl hover:scale-105 active:scale-95 shadow-slate-900/40 italic flex items-center gap-4">
                      Commit Identity Change
                      <ChevronRight size={18} />
                    </button>
                 </div>
               </div>
            </div>

            {/* Security Cipher Rotation */}
            <div className="bg-white rounded-[4rem] shadow-sm border border-slate-200/50 overflow-hidden transition-all duration-700 hover:shadow-2xl hover:scale-[1.01] group">
               <div className="p-14 border-b border-slate-100 flex items-center gap-10 bg-slate-50/50">
                 <div className="p-6 bg-white border border-slate-100 text-amber-600 rounded-[2.5rem] shadow-2xl transform group-hover:-rotate-12 transition-all duration-500"><Lock size={32} /></div>
                 <div>
                    <h3 className="text-4xl font-black text-slate-950 uppercase tracking-tighter italic leading-none mb-3">Security Cipher</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic opacity-60">Multi-Factor Node Access Management</p>
                 </div>
               </div>
               <div className="p-14 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-4">
                     <label className="block text-[10px] uppercase font-black text-slate-400 ml-4 tracking-[0.5em] opacity-80 italic leading-none">New Cipher Sequence</label>
                     <input type="password" placeholder="••••••••••••" 
                       className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] px-10 py-8 text-lg font-black text-slate-950 outline-none focus:ring-[1rem] focus:ring-amber-500/5 focus:border-amber-500 transition-all placeholder:opacity-20"/>
                   </div>
                   <div className="space-y-4">
                     <label className="block text-[10px] uppercase font-black text-slate-400 ml-4 tracking-[0.5em] opacity-80 italic leading-none">Confirm Overlap Cipher</label>
                     <input type="password" placeholder="••••••••••••" 
                       className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] px-10 py-8 text-lg font-black text-slate-950 outline-none focus:ring-[1rem] focus:ring-amber-500/5 focus:border-amber-500 transition-all placeholder:opacity-20"/>
                   </div>
                 </div>
                 <div className="flex items-center justify-between pt-10 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                       <Key size={18} className="text-amber-500 opacity-40 group-hover:animate-pulse" />
                       <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.5em] italic leading-none">SHA-512 Hardware Key Integration Verified</p>
                    </div>
                    <button className="bg-white border-2 border-slate-200 text-slate-950 px-16 py-8 rounded-[2rem] hover:bg-slate-50 hover:border-slate-300 transition-all font-black uppercase tracking-[0.4em] text-[11px] shadow-xl hover:scale-105 active:scale-95 italic flex items-center gap-4">
                      Rotate Access Keys
                      <Zap size={18} className="opacity-30" />
                    </button>
                 </div>
               </div>
            </div>
         </div>

         {/* Vault & Integrity Matrix */}
         <div className="space-y-12">
            {/* Vault Matrix Section */}
            <div className="bg-slate-950 rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden p-16 text-white relative group hover:scale-[1.02] transition-all duration-700">
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/[0.08] rounded-full blur-[100px] group-hover:scale-125 transition-all duration-[3000ms] pointer-events-none"></div>
               <div className="flex items-center gap-8 mb-12">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl group-hover:bg-blue-600/10 transition-colors duration-500 shadow-2xl"><DataIcon className="text-blue-500" size={40} /></div>
                  <div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none mb-2">Vault Data</h3>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic opacity-60">Delta Recovery Terminal</p>
                  </div>
               </div>
               <p className="text-sm font-black text-slate-400 leading-relaxed mb-16 italic uppercase tracking-[0.4em] text-[10px] opacity-60">
                 Execute a complete tactical data stream dump of all financial flux history in encrypted Vantage-JSON-Node format.
               </p>
               <button className="w-full flex items-center justify-center gap-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-10 py-8 rounded-[3rem] transition-all font-black uppercase tracking-[0.5em] text-[12px] shadow-3xl group/btn overflow-hidden relative italic">
                  <div className="absolute inset-0 bg-blue-600/0 group-hover/btn:bg-blue-600/5 transition-all"></div>
                  <Download size={28} className="group-hover/btn:-translate-y-2 transition-all relative z-10 duration-500" />
                  <span className="relative z-10 transition-transform group-hover/btn:translate-x-2">Sync JSON Stream</span>
               </button>
            </div>

            {/* Validation Node HUD */}
            <div className="bg-white border-2 border-slate-100 rounded-[4rem] p-16 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
               <div className="flex items-center gap-8 mb-14">
                  <div className="p-5 bg-slate-50 rounded-3xl group-hover:bg-emerald-50 transition-all duration-500 shadow-inner group-hover:shadow-emerald-500/10 border border-transparent group-hover:border-emerald-100"><ShieldCheck className="text-emerald-500" size={40} /></div>
                  <div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-950 leading-none mb-2">Validation</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic opacity-60">Integrity Health Monitor</p>
                  </div>
               </div>
               <div className="space-y-8">
                  <div className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[2.5rem] border border-transparent group-hover:border-emerald-500/10 transition-all hover:bg-white hover:shadow-xl group/item">
                     <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 italic leading-none opacity-60">Sync Integrity</span>
                        <span className="text-[12px] font-black text-slate-950 uppercase tracking-widest italic leading-none">Sub-Node Matrix</span>
                     </div>
                     <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-500/5 group-hover/item:scale-110 transition-transform border border-emerald-50">
                        <Cpu size={16} className="animate-spin-slow"/> STABLE
                     </span>
                  </div>
                  <div className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[2.5rem] border border-transparent group-hover:border-emerald-500/10 transition-all hover:bg-white hover:shadow-xl group/item">
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 italic leading-none opacity-60">Flux Resilience</span>
                        <span className="text-[12px] font-black text-slate-950 uppercase tracking-widest italic leading-none">Trace Analysis</span>
                      </div>
                     <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-500/5 group-hover/item:scale-110 transition-transform border border-emerald-50">
                        <Activity size={16} className="animate-pulse"/> PERSISTENT
                     </span>
                  </div>
               </div>
            </div>

            {/* Termination Protocol Zone */}
            <div className="bg-rose-50/50 rounded-[4rem] border-4 border-dotted border-rose-100 p-14 transition-all duration-700 hover:bg-rose-100/50 group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-all duration-1000"></div>
               <div className="flex items-center gap-8 mb-10">
                  <div className="p-6 bg-white text-rose-600 rounded-[2.5rem] shadow-2xl group-hover:rotate-[30deg] transition-all duration-500 border border-rose-50"><ShieldAlert size={40} /></div>
                  <div>
                     <h3 className="text-3xl font-black text-rose-600 uppercase tracking-tighter italic leading-none mb-2">Purge Node</h3>
                     <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] italic opacity-60">Destructive Protocol Core</p>
                  </div>
               </div>
               <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.5em] leading-relaxed mb-12 italic opacity-60 group-hover:opacity-100 transition-opacity">
                 Irreversible System Termination: Complete purging of anchor identity node and all associated flux traces from the global matrix cluster.
               </p>
               <button onClick={() => {if(window.confirm('IRREVERSIBLE ACTION: TERMINATE NODE CLUSTER?')){logout()}}} 
                 className="w-full flex items-center justify-center gap-6 bg-rose-600 text-white px-12 py-8 rounded-[2.5rem] transition-all font-black uppercase tracking-[0.5em] text-[12px] shadow-3xl hover:bg-slate-950 active:scale-[0.98] shadow-rose-600/30 group/kill overflow-hidden relative">
                 <Trash2 size={28} className="group-hover/kill:rotate-[20deg] transition-all duration-500" />
                 <span className="italic relative z-10 transition-transform group-hover/kill:translate-x-3">Terminate Node Link</span>
               </button>
            </div>
         </div>
      </div>
      
      {/* Vantage System Integrity Footer */}
      <div className="text-center mt-20 bg-white/40 backdrop-blur-xl py-16 rounded-[4rem] border border-slate-200/50 mx-6 group hover:shadow-3xl transition-all duration-1000 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-emerald-600 to-rose-600 opacity-20 group-hover:opacity-100 transition-opacity duration-1000"></div>
         <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.8em] italic px-16 leading-[2.5] mb-8 opacity-40 group-hover:opacity-100 transition-opacity duration-1000">Vantage Management Architecture v2.5.1 -- System Identity Node Persistent -- Monitoring Protocol Active.</p>
         <div className="flex justify-center items-center gap-12 text-slate-300 transition-all duration-1000 group-hover:text-blue-600/20">
            <DataIcon size={24} className="hover:scale-125 transition-transform" /> 
            <ShieldHalf size={32} className="text-slate-950/5 group-hover:text-slate-950/20 transition-all duration-1000 rotate-45 group-hover:rotate-0" />
            <Fingerprint size={24} className="hover:scale-125 transition-transform" />
         </div>
         <div className="mt-8">
            <span className="text-[8px] font-black uppercase tracking-[1em] text-blue-600/20 italic">VANTAGE_STABLE_ENVIRONMENT_SEC_LOADED</span>
         </div>
      </div>
    </div>
  );
};

export default Settings;
