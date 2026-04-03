import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  User, 
  Lock, 
  Download, 
  Database,
  Trash2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateUser = async () => {
    try {
      setIsUpdating(true);
      await api.put('/auth/me', { name });
      alert('IDENTITY_NODE_UPDATED_SUCCESS');
    } catch (err) {
      alert('ERROR: IDENTITY_SYNC_FAILURE');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('ERROR: CIPHER_MISMATCH');
      return;
    }
    try {
      setIsUpdating(true);
      await api.put('/auth/me/password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      alert('CIPHER_ROTATION_COMPLETE');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert('ERROR: SECURITY_PROTOCOL_DENIED');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-10 pb-32 max-w-5xl">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
           <span className="bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full italic">System: Online</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Settings</h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 leading-none italic ml-1">Configure Identity Protocols.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            {/* Identity Card */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-700">
               <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
                  <User className="text-blue-600" size={24} />
                  <h3 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic">Identity</h3>
               </div>
               <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[9px] uppercase font-black text-slate-400 ml-2 tracking-[0.3em] italic">Full Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-100 rounded-[1rem] px-6 py-4 text-sm font-bold text-slate-950 outline-none focus:border-blue-500 transition-all uppercase italic"/>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[9px] uppercase font-black text-slate-400 ml-2 tracking-[0.3em] italic">Email Node</label>
                      <input type="email" disabled defaultValue={user?.email || ''} 
                        className="w-full bg-slate-100 border border-slate-100 rounded-[1rem] px-6 py-4 text-sm font-bold text-slate-400 outline-none cursor-not-allowed italic"/>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleUpdateUser} disabled={isUpdating}
                      className="bg-slate-950 text-white px-8 py-4 rounded-[1rem] hover:bg-blue-600 transition-all font-black uppercase tracking-[0.3em] text-[9px] italic flex items-center gap-3 disabled:opacity-50">
                      {isUpdating ? 'SYNCING...' : 'Update Node'}
                      <ChevronRight size={14} />
                    </button>
                  </div>
               </div>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-700">
               <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
                  <Lock className="text-amber-600" size={24} />
                  <h3 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic">Security</h3>
               </div>
               <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Old Cipher" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1rem] px-6 py-4 text-sm font-bold text-slate-950 outline-none focus:border-amber-500 transition-all italic"/>
                    <div className="hidden md:block"></div>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Cipher" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1rem] px-6 py-4 text-sm font-bold text-slate-950 outline-none focus:border-amber-500 transition-all italic"/>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Cipher" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1rem] px-6 py-4 text-sm font-bold text-slate-950 outline-none focus:border-amber-500 transition-all italic"/>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleUpdatePassword} disabled={isUpdating}
                      className="bg-white border border-slate-200 text-slate-950 px-8 py-4 rounded-[1rem] hover:bg-slate-50 transition-all font-black uppercase tracking-[0.3em] text-[9px] italic disabled:opacity-50">
                      {isUpdating ? 'ROTATING...' : 'Rotate Cipher'}
                    </button>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-slate-950 rounded-[1.5rem] p-8 text-white shadow-xl">
               <div className="flex items-center gap-4 mb-6">
                  <Database className="text-blue-500" size={24} />
                  <h3 className="text-lg font-black uppercase tracking-tighter italic">Export</h3>
               </div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 italic">Extract data as JSON.</p>
               <button className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-6 py-4 rounded-[1rem] font-black uppercase tracking-[0.3em] text-[9px] italic hover:bg-white/10">
                  <Download size={16} /> Download
               </button>
            </div>

            <div className="bg-rose-50/30 rounded-[1.5rem] border border-rose-100 p-8">
               <div className="flex items-center gap-4 mb-6">
                  <ShieldAlert className="text-rose-600" size={24} />
                  <h3 className="text-lg font-black text-rose-600 uppercase tracking-tighter italic">Danger</h3>
               </div>
               <p className="text-[9px] font-black text-rose-400 uppercase tracking-[0.3em] mb-8 italic">Delete account node.</p>
               <button onClick={() => {if(window.confirm('PURGE?')){logout()}}} 
                 className="w-full bg-rose-600 text-white px-6 py-4 rounded-[1rem] font-black uppercase tracking-[0.3em] text-[9px] italic shadow-lg shadow-rose-500/20 hover:bg-slate-950">
                  Purge Node
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Settings;
