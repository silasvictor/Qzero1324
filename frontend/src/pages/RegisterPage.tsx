import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Sparkles, AlertCircle, ArrowRight, BookOpen, CreditCard } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !rollNumber) return;

    setLoading(true);
    setError(null);

    const res = await register({
      name,
      email,
      password,
      rollNumber,
      department
    });

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Registration failed');
    }
    setLoading(false);
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
          Create Student Account
        </h2>
        <p className="mt-1 text-xs text-brand-mutedText">
          Enroll with your university registration details to receive ₹250 free printing credits.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-card rounded-3xl border border-brand-cardBorder space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl flex items-center gap-3 text-xs text-brand-purple font-semibold">
            <CreditCard className="w-5 h-5 flex-shrink-0 text-brand-purple" />
            <span>Bonus: ₹250 free printing balance automatically credited upon signup!</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nischal Chowdary"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-cardBorder text-xs text-brand-dark outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Roll / Admission Number</label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 26BES7079"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-cardBorder font-mono font-bold text-xs text-brand-dark outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">University Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rollno@campus.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-cardBorder text-xs text-brand-dark outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Department</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
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
              <span>{loading ? 'Creating account...' : 'Create Account & Claim ₹250'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-brand-lavender">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-purple hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
