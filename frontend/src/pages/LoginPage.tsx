import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Sparkles, AlertCircle, ShieldCheck, User, Cpu } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  const handleFastDemoLogin = async (role: 'STUDENT' | 'ADMIN' | 'OPERATOR') => {
    setLoading(true);
    await switchRole(role);
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'OPERATOR') navigate('/operator');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-deep to-brand-purple flex items-center justify-center text-white shadow-soft">
            <span className="font-extrabold text-2xl">Q</span>
            <span className="text-xs text-brand-turquoise font-black -ml-0.5">0</span>
          </div>
          <div className="text-left">
            <div className="font-extrabold text-2xl text-brand-dark tracking-tight">
              Queue<span className="text-brand-purple">Zero</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-mutedText">
              Campus Print Platform
            </span>
          </div>
        </Link>

        <h2 className="text-2xl font-black text-brand-dark tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-1 text-xs text-brand-mutedText">
          Use your university credentials or click a demo profile below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-card rounded-3xl border border-brand-cardBorder space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">University Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-cardBorder text-xs text-brand-dark outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-cardBorder text-xs text-brand-dark outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-brand-purple hover:bg-brand-deep text-white font-bold text-xs sm:text-sm shadow-soft hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Demo Logins for Hackathon Evaluators */}
          <div className="pt-4 border-t border-brand-lavender space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block text-center">
              1-Click Instant Demo Credentials
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFastDemoLogin('STUDENT')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-brand-lavender text-brand-purple text-[11px] font-bold text-center transition-all flex flex-col items-center gap-1"
              >
                <User className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemoLogin('ADMIN')}
                className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold text-center transition-all flex flex-col items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemoLogin('OPERATOR')}
                className="p-2.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold text-center transition-all flex flex-col items-center gap-1"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Operator</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-purple hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
