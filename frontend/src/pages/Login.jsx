import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldHalf, Zap, ArrowUpRight, Lock, Key, Fingerprint, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-vantage-50 font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-blue-600/10">
      {/* Background Visual Protocols */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200/50 relative z-10 transition-all">
        
        {/* Branding Side: Deep Technical Clean */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-vantage-950 text-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-emerald-500/5 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-24">
               <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                 <ShieldHalf size={32} />
               </div>
               <div className="flex flex-col">
                 <span className="leading-none tracking-[0.4em] text-[10px] font-black text-vantage-400 mb-1">VANTAGE</span>
                 <span className="leading-none text-white tracking-tighter text-3xl font-bold italic">STRATEGY</span>
               </div>
            </div>
            
            <div className="space-y-10">
               <h2 className="text-6xl font-bold tracking-tight italic leading-none text-white mb-6">
                 Wealth Monitoring
               </h2>
               <p className="text-vantage-400 font-bold text-lg leading-relaxed max-w-xs uppercase tracking-widest opacity-80 border-l border-white/20 pl-6">
                 Precision alignment for your financial growth.
               </p>
            </div>
          </div>
          
          <div className="relative z-10 pt-10 border-t border-white/5 opacity-40">
             <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white italic">Protocol v3.0.0 Stable</p>
          </div>
        </div>

        {/* Login Side: Pristine Light Mode */}
        <div className="p-12 md:p-20 flex flex-col justify-center relative">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-vantage-950 uppercase italic leading-none mb-3">Access Terminal</h1>
            <p className="text-vantage-400 font-bold uppercase tracking-widest text-[9px] opacity-60">Authorize secure node session</p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-4 shadow-sm animate-bounce-subtle">
                <Zap size={16}/>
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div className="group/input">
                <label className="block text-[9px] font-bold text-vantage-400 uppercase tracking-widest mb-3 ml-1 italic group-focus-within/input:text-blue-500 transition-colors">Identity Profile</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-vantage-300 group-focus-within/input:text-blue-500 transition-colors pointer-events-none"><Lock size={18}/></div>
                  <input
                    type="email" required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@vantage.com"
                    className="w-full bg-vantage-50 border border-vantage-100/50 rounded-2xl pl-16 pr-8 py-5 text-sm font-bold text-vantage-950 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all uppercase tracking-wider italic placeholder:opacity-20"/>
                </div>
              </div>

              <div className="group/input">
                <label className="block text-[9px] font-bold text-vantage-400 uppercase tracking-widest mb-3 ml-1 italic group-focus-within/input:text-blue-500 transition-colors">Access Cipher</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-vantage-300 group-focus-within/input:text-blue-500 transition-colors pointer-events-none"><Key size={18}/></div>
                  <input
                    type="password" required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-vantage-50 border border-vantage-100/50 rounded-2xl pl-16 pr-8 py-5 text-sm font-bold text-vantage-950 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all tracking-[0.4em] placeholder:tracking-normal placeholder:opacity-20"/>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="group w-full flex items-center justify-center gap-4 py-5 px-10 bg-vantage-950 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl hover:bg-vantage-800 transition-all relative overflow-hidden"
              >
                <span className="relative z-10 italic">Secure Link</span>
                <ArrowUpRight size={18} className="opacity-40 group-hover:opacity-100 transition-all" />
              </button>
            </div>
          </form>
          
          <div className="mt-12 text-center">
             <Link to="/register" className="text-[9px] font-bold uppercase tracking-widest text-vantage-400 hover:text-blue-600 transition-all py-2.5 px-5 rounded-xl hover:bg-blue-50 underline decoration-blue-200 underline-offset-8 decoration-2">
               Initialize New Node Profile →
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
