import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldHalf, Zap, ArrowUpRight, Lock, Key, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('test1234');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-blue-600/10">
      {/* Background Matrix Flux */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-400/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[4rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-slate-100 relative z-10 transition-all">
        
        {/* Branding Side: Deep Technical Clean */}
        <div className="hidden lg:flex flex-col justify-between p-24 bg-slate-950 text-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-400/5 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-24 transition-transform group">
               <div className="bg-white/5 p-5 rounded-[2rem] border border-white/10 backdrop-blur-3xl shadow-2xl group-hover:rotate-12 transition-transform">
                 <ShieldHalf size={48} className="text-blue-500" />
               </div>
               <div className="flex flex-col">
                 <span className="leading-none tracking-[0.4em] text-[11px] font-black text-slate-500 mb-1">VANTAGE</span>
                 <span className="leading-none text-white tracking-tighter text-5xl font-black italic">STRATEGY</span>
               </div>
            </div>
            
            <div className="space-y-12">
               <h2 className="text-7xl font-black tracking-tighter italic leading-none text-white mb-6">
                 Precision Wealth Engine.
               </h2>
               <p className="text-slate-500 font-bold text-xl leading-relaxed max-w-sm uppercase tracking-[0.2em] border-l-4 border-blue-600/30 pl-8 italic">
                 Strategic Debt Neutralization & High Fidelity Growth Matrix.
               </p>
            </div>
          </div>
          
          <div className="relative z-10 pt-10 border-t border-white/5 opacity-40">
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white italic">Protocol v3.1.0 Stable // secure_channel_v4</p>
          </div>
        </div>

        {/* Login Side: Pristine Light Mode */}
        <div className="p-16 md:p-24 flex flex-col justify-center relative bg-white">
          <div className="mb-16">
            <h1 className="text-5xl font-black tracking-tighter text-slate-950 uppercase italic leading-none mb-4">Access Terminal</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] opacity-60">Authorize secure node session to grid</p>
          </div>

          <form className="space-y-10" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-6 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 shadow-xl shadow-rose-600/5 animate-bounce-subtle">
                <Zap size={20}/>
                {error}
              </div>
            )}
            
            <div className="space-y-8">
              <div className="group/input">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2 italic group-focus-within/input:text-blue-600 transition-colors">Identity Profile</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-600 transition-colors pointer-events-none"><Lock size={20}/></div>
                  <input
                    type="email" required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@vantage.strategy"
                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] pl-20 pr-10 py-7 text-base font-black text-slate-950 outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all uppercase tracking-widest placeholder:opacity-20 italic"/>
                </div>
              </div>

              <div className="group/input">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2 italic group-focus-within/input:text-blue-600 transition-colors">Access Cipher</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-600 transition-colors pointer-events-none"><Key size={20}/></div>
                  <input
                    type="password" required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] pl-20 pr-10 py-7 text-base font-black text-slate-950 outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all tracking-[0.4em] placeholder:tracking-normal placeholder:opacity-20"/>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                className="group w-full flex items-center justify-center gap-6 py-8 px-12 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden"
              >
                <span className="relative z-10 italic">Initialize Secure Link</span>
                <ArrowRight size={20} className="relative z-10 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </form>
          
          <div className="mt-20 text-center">
             <Link to="/register" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all py-3 px-6 rounded-2xl hover:bg-slate-50 underline decoration-blue-100 underline-offset-8 decoration-4">
               Initialize New Node Profile →
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
