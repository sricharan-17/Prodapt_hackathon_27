import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginApi, registerApi } from '../services/api';
import { X, Briefcase, UserCheck, Sparkles, Key, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  initialRole: 'HR' | 'CANDIDATE';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialRole, onClose, onSuccess }) => {
  const { login } = useAuth();
  const [role, setRole] = useState<'HR' | 'CANDIDATE'>(initialRole);
  const [isRegister, setIsRegister] = useState<boolean>(false);
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await registerApi({
          email,
          password,
          full_name: fullName || (role === 'HR' ? 'Sarah Recruiter' : 'Candidate User'),
          role,
          organization: role === 'HR' ? organization || 'TechCorp Inc.' : 'Applicant'
        });
        login(res.access_token, res.user);
      } else {
        const res = await loginApi(email, password);
        login(res.access_token, res.user);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillHR = () => {
    setRole('HR');
    setIsRegister(false);
    setEmail('hr@techcorp.com');
    setPassword('password123');
  };

  const handleQuickFillCandidateAlex = () => {
    setRole('CANDIDATE');
    setIsRegister(false);
    setEmail('alex.rivera@gmail.com');
    setPassword('password123');
  };

  const handleQuickFillCandidateBeatriz = () => {
    setRole('CANDIDATE');
    setIsRegister(false);
    setEmail('beatriz.vance@gmail.com');
    setPassword('password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-2">
            {role === 'HR' ? <Briefcase className="w-6 h-6" /> : <UserCheck className="w-6 h-6 text-emerald-400" />}
          </div>
          <h3 className="text-2xl font-bold text-white">
            {role === 'HR' ? 'HR Recruiter Portal' : 'Candidate Portal'}
          </h3>
          <p className="text-xs text-slate-400">
            {isRegister ? 'Create a new account to continue' : 'Sign in to access AI candidate intelligence'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('HR')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              role === 'HR' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>HR Recruiter</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('CANDIDATE')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              role === 'CANDIDATE' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Candidate</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {isRegister && role === 'HR' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. TechCorp Inc."
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Fill Buttons */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Hackathon Demo Login:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={handleQuickFillHR}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-cyan-500/30 text-left font-medium transition-colors"
            >
              👑 HR Demo (Sarah)
            </button>
            <button
              type="button"
              onClick={handleQuickFillCandidateAlex}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 rounded-lg border border-emerald-500/30 text-left font-medium transition-colors"
            >
              ⚡ Candidate Alex (91%)
            </button>
          </div>
        </div>

        {/* Toggle Login/Register */}
        <div className="text-center text-xs text-slate-400 pt-1">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-cyan-400 hover:underline font-semibold"
          >
            {isRegister ? 'Sign In' : 'Register Now'}
          </button>
        </div>

      </div>
    </div>
  );
};
