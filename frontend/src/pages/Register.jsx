import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldHalf, Zap, ArrowUpRight, CheckCircle2, User, Key, Lock, Fingerprint } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-600/10">
       {/* Background Visual Protocols */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-400/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100 relative z-10 transition-all hover:shadow-emerald-500/5 hover:scale-[1.005]">
        
        {/* Branding Side: High-Contrast Technical */}
        <div className="hidden lg:flex flex-col justify-between p-20 bg-slate-900 text-white relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-blue-500/5 opacity-50"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-[3000ms] pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 italic group mb-24 transition-transform group-hover:-translate-y-2">
               <div className="bg-gradient-to-br from-emerald-600 to-blue-500 p-5 rounded-3xl shadow-2xl shadow-emerald-500/30 group-hover:rotate-12 transition-transform">
                 <ShieldHalf size={40} />
               </div>
               <div className="flex flex-col">
                 <span className="leading-none tracking-[0.4em] text-[11px] font-black text-slate-400 mb-1">VANTAGE</span>
                 <span className="leading-none text-emerald-400 tracking-tighter text-4xl font-black italic">FINANCE</span>
               </div>
            </div>
            
            <div className="space-y-12">
               <h2 className="text-7xl font-black tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 mb-6 px-1">
                 SECURE YOUR LEGACY.
               </h2>
               <p className="text-slate-400 font-black text-xl leading-relaxed max-w-md uppercase tracking-[0.2em] opacity-80 pl-2 border-l-4 border-emerald-600/30">
                 Deploy Advanced Wealth Monitoring Protocols & Core Matrix Integration.
               </p>
            </div>

            <div className="mt-20 space-y-8">
               {[
                 { text: 'Automated Debt Snowball Engines', icon: <Zap size={20}/> },
                 { text: 'Compound Interest Trajectories', icon: <ArrowUpRight size={20}/> },
                 { text: 'Sovereign Node Encryption', icon: <CheckCircle2 size={20}/> }
               ].map(benefit => (
                 <div key={benefit.text} className="flex items-center gap-5 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400 group/benefit">
                   <div className="p-3 bg-white/5 rounded-2xl group-hover/benefit:bg-emerald-500/20 group-hover/benefit:text-white transition-all shadow-inner">{benefit.icon}</div>
                   <span className="opacity-80 group-hover/benefit:opacity-100 transition-opacity italic">{benefit.text}</span>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-8 border-t border-white/5 pt-10">
             <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                <Fingerprint size={20} className="text-emerald-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white italic">Protocol v2.5.1 Active</p>
             </div>
          </div>
        </div>

        {/* Register Side: Pristine Light Mode */}
        <div className="p-12 md:p-24 flex flex-col justify-center relative">
          <div className="mb-16">
            <h1 className="text-5xl font-black tracking-tighter text-slate-950 uppercase italic leading-none mb-4">Protocol Enrollment</h1>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] px-1 opacity-60">Register New Sovereign Anchor Identity</p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 p-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 shadow-xl shadow-rose-600/5 group animate-bounce-subtle">
                <div className="p-2 bg-rose-600 text-white rounded-xl"><Zap size={20}/></div>
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div className="group/input">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 ml-2 px-1 group-focus-within/input:text-emerald-600 transition-colors italic">Personal Descriptor (Name)</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-emerald-500 transition-colors pointer-events-none"><User size={20}/></div>
                  <input
                    type="text" required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Charith Winston"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] pl-20 pr-10 py-6 text-base font-black text-slate-900 outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all uppercase tracking-widest placeholder:opacity-20 italic"/>
                </div>
              </div>

              <div className="group/input">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 ml-2 px-1 group-focus-within/input:text-emerald-600 transition-colors italic">Identity Vector (Email)</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-emerald-500 transition-colors pointer-events-none"><Lock size={20}/></div>
                  <input
                    type="email" required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. node_id@domain.com"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] pl-20 pr-10 py-6 text-base font-black text-slate-900 outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all uppercase tracking-widest placeholder:opacity-20 italic"/>
                </div>
              </div>

              <div className="group/input">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 ml-2 px-1 group-focus-within/input:text-emerald-600 transition-colors italic">Encryption Key (Cipher)</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-emerald-500 transition-colors pointer-events-none"><Key size={20}/></div>
                  <input
                    type="password" required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] pl-20 pr-10 py-6 text-base font-black text-slate-900 outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all italic tracking-[0.5em] placeholder:tracking-normal placeholder:opacity-20"/>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                className="group w-full flex items-center justify-center gap-6 py-8 px-12 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.5em] text-[11px] shadow-2xl hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden"
              >
                <span className="relative z-10 italic">Deploy Profile Protocol</span>
                <ArrowUpRight size={24} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </button>
            </div>
          </form>
          
          <div className="mt-16 text-center">
             <Link to="/login" className="group text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-emerald-600 transition-all py-3 px-6 rounded-2xl hover:bg-emerald-50">
               Already Enrolled in Vantage? <span className="text-emerald-500 ml-2 italic group-hover:underline decoration-emerald-500/30 decoration-4 underline-offset-8">Activate Link →</span>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
