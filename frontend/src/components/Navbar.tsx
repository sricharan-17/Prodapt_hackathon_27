import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Brain, UserCheck, Briefcase, LogOut, Sparkles, LogIn, ChevronRight } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (role: 'HR' | 'CANDIDATE') => void;
  activeView: 'landing' | 'hr_dashboard' | 'candidate_dashboard';
  setActiveView: (view: 'landing' | 'hr_dashboard' | 'candidate_dashboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, activeView, setActiveView }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveView('landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                RESUME<span className="text-cyan-400 font-black">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                RAG + Ontology
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">Explainable Candidate Intelligence</p>
          </div>
        </div>

        {/* Portal Switcher & User Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {user ? (
            <>
              <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveView(user.role === 'HR' ? 'hr_dashboard' : 'candidate_dashboard')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 ${
                    activeView !== 'landing'
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {user.role === 'HR' ? <Briefcase className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                  <span>{user.role === 'HR' ? 'HR Dashboard' : 'Candidate Portal'}</span>
                </button>
                <button
                  onClick={() => setActiveView('landing')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'landing' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Overview
                </button>
              </div>

              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-semibold text-white">{user.full_name}</div>
                  <div className="text-[11px] text-cyan-400 font-medium">{user.role} Account</div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => onOpenAuth('CANDIDATE')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex items-center space-x-1.5"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Candidate Portal</span>
              </button>

              <button
                onClick={() => onOpenAuth('HR')}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-1.5"
              >
                <Briefcase className="w-4 h-4" />
                <span>HR Recruiter Login</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5 opacity-80" />
              </button>
            </div>
          )}

        </div>

      </div>
    </nav>
  );
};
