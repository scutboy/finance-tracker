import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Download, Database, ShieldAlert, ShieldCheck, Fingerprint, Activity, Trash2, ShieldHalf, LayoutDashboard, Database as DataIcon } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="space-y-12 pb-24 px-2">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-slate-100 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <span className="text-slate-600 font-extrabold text-[10px] uppercase tracking-[0.4em] bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 italic">Vantage Management Console</span>
             <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-60 ml-2">Node Encryption: Persistent</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">System Settings</h1>
          <p className="text-slate-500 mt-6 font-black italic text-sm uppercase tracking-widest opacity-60 ml-1">Configure Identity Protocols & Data Integrity Clusters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
         {/* Left Side: Navigation-style Sections */}
         <div className="lg:col-span-2 space-y-10">
            {/* Profile Section */}
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.01] group">
               <div className="p-12 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-6">
                    <div className="p-5 bg-blue-50 text-blue-600 rounded-[1.5rem] shadow-sm transform group-hover:rotate-12 transition-transform"><User size={28} /></div>
                    <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter italic leading-none">Member Profile</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 opacity-60 italic leading-none">Unique Anchor Identity</p>
                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-900 border-b-2 border-blue-100 pb-1">{user?.id?.slice(0,12) || '0xVANTAGE_NODE'}</span>
                 </div>
               </div>
               <div className="p-12 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                     <label className="block text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest px-1 opacity-80 italic">Identity Handle (Full Name)</label>
                     <input type="text" defaultValue={user?.name || ''} 
                       className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 py-6 text-sm font-black text-slate-950 outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-inner"/>
                   </div>
                   <div className="space-y-4">
                     <label className="block text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest px-1 opacity-80 italic">Communication Vector (Email)</label>
                     <input type="email" disabled defaultValue={user?.email || ''} 
                       className="w-full bg-slate-100 border border-slate-200 rounded-[1.5rem] px-8 py-6 text-sm font-black text-slate-400 outline-none cursor-not-allowed opacity-60 shadow-inner"/>
                   </div>
                 </div>
                 <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2"><LayoutDashboard size={12}/> Profile Metadata Node Persistent</p>
                    <button className="bg-slate-950 text-white px-12 py-5 rounded-[1.5rem] hover:bg-blue-600 transition-all font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 shadow-slate-950/20">
                      Commit Identity Change
                    </button>
                 </div>
               </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.01] group">
               <div className="p-12 border-b border-slate-50 flex items-center gap-6 bg-slate-50/50">
                 <div className="p-5 bg-amber-50 text-amber-600 rounded-[1.5rem] shadow-sm transform group-hover:rotate-12 transition-transform"><Lock size={28} /></div>
                 <div>
                    <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter italic leading-none">Security Cipher</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-60 italic">Multi-Factor Encryption Node Management</p>
                 </div>
               </div>
               <div className="p-12 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                     <label className="block text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest px-1 opacity-80 italic">Initialize New Cipher Rotation</label>
                     <input type="password" placeholder="••••••••" 
                       className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 py-6 text-sm font-black text-slate-950 outline-none focus:ring-8 focus:ring-amber-500/5 focus:border-amber-500 transition-all shadow-inner placeholder:opacity-20"/>
                   </div>
                   <div className="space-y-4">
                     <label className="block text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest px-1 opacity-80 italic">Confirm Access Key Overlay</label>
                     <input type="password" placeholder="••••••••" 
                       className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 py-6 text-sm font-black text-slate-950 outline-none focus:ring-8 focus:ring-amber-500/5 focus:border-amber-500 transition-all shadow-inner placeholder:opacity-20"/>
                   </div>
                 </div>
                 <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest italic flex items-center gap-2"><ShieldHalf size={12}/> SHA-512 Matrix Enabled</p>
                    <button className="bg-white border-2 border-slate-200 text-slate-950 px-12 py-5 rounded-[1.5rem] hover:bg-slate-50 transition-all font-black uppercase tracking-[0.3em] text-[10px] shadow-lg">
                      Rotate Access Keys
                    </button>
                 </div>
               </div>
            </div>
         </div>

         {/* Right Side: Data & Danger Zone */}
         <div className="space-y-10">
            {/* Data Management Section */}
            <div className="bg-slate-950 rounded-[3.5rem] shadow-2xl border border-white/5 overflow-hidden p-12 text-white relative group hover:scale-[1.02] transition-all">
               <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] group-hover:scale-150 transition-all duration-[2000ms] pointer-events-none"></div>
               <div className="flex items-center gap-6 mb-10">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl"><Database className="text-blue-500" size={36} /></div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Vault Matrix</h3>
               </div>
               <p className="text-sm font-black text-slate-400 leading-relaxed mb-12 italic uppercase tracking-widest text-[10px] opacity-60">
                 Execute a tactical data dump of the complete financial flux history in standard Vantage-JSON-Protocol.
               </p>
               <button className="w-full flex items-center justify-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-6 rounded-[2rem] transition-all font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl group/btn overflow-hidden relative">
                  <div className="absolute inset-0 bg-blue-600/0 hover:bg-blue-600/5 transition-all"></div>
                  <Download size={24} className="group-hover/btn:-translate-y-2 transition-transform relative z-10" />
                  <span className="relative z-10">Sync Data Delta</span>
               </button>
            </div>

            {/* Validation Node */}
            <div className="bg-white border-2 border-slate-100 rounded-[3.5rem] p-12 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
               <div className="flex items-center gap-6 mb-10">
                  <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 transition-colors shadow-inner"><Fingerprint className="text-emerald-500" size={36} /></div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 leading-none">Validation</h3>
               </div>
               <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border border-transparent group-hover:border-emerald-500/10 transition-all">
                     <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">Sync Integrity</span>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">Global Node Cluster</span>
                     </div>
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-50">
                        <ShieldCheck size={14}/> ONLINE
                     </span>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border border-transparent group-hover:border-emerald-500/10 transition-all">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">Flux Resilience</span>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">Persistent State Trace</span>
                     </div>
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-50">
                        <Activity size={14}/> VERIFIED
                     </span>
                  </div>
               </div>
            </div>

            {/* Destruction Zone */}
            <div className="bg-rose-50/50 rounded-[3.5rem] border-2 border-rose-100 p-12 transition-all hover:bg-rose-100 group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[50px] pointer-events-none"></div>
               <div className="flex items-center gap-6 mb-8">
                  <div className="p-4 bg-white text-rose-600 rounded-2xl shadow-sm group-hover:rotate-12 transition-transform"><ShieldAlert size={36} /></div>
                  <h3 className="text-2xl font-black text-rose-600 uppercase tracking-tighter italic leading-none">Purge Core</h3>
               </div>
               <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest leading-relaxed mb-10 italic">
                 Irreversible protocol: Complete termination of anchor identity node and all associated flux traces in the global matrix.
               </p>
               <button onClick={() => {if(window.confirm('IRREVERSIBLE ACTION: TERMINATE NODE?')){logout()}}} 
                 className="w-full flex items-center justify-center gap-4 bg-rose-600 text-white px-8 py-6 rounded-[1.5rem] transition-all font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-rose-700 active:scale-95 shadow-rose-600/30">
                 <Trash2 size={24} /> Terminate Link
               </button>
            </div>
         </div>
      </div>
      
      <div className="text-center mt-12 bg-white/50 backdrop-blur-md py-12 rounded-[3.5rem] border border-slate-100 mx-2 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-emerald-600 opacity-10"></div>
         <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.6em] italic px-10 leading-relaxed mb-4">Vantage Management Architecture v2.5.1-Stable Core Process</p>
         <div className="flex justify-center items-center gap-6 text-slate-300 opacity-40">
            <DataIcon size={20}/> <ShieldHalf size={20}/> <Fingerprint size={20}/>
         </div>
      </div>
    </div>
  );
};

export default Settings;
