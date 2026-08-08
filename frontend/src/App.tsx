import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { HRDashboard } from './components/HRDashboard';
import { CandidateDashboard } from './components/CandidateDashboard';
import { CandidateIntelligenceModal } from './components/CandidateIntelligenceModal';
import { CandidateComparisonModal } from './components/CandidateComparisonModal';

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'landing' | 'hr_dashboard' | 'candidate_dashboard'>('landing');
  const [authRole, setAuthRole] = useState<'HR' | 'CANDIDATE' | null>(null);

  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [compareAppIds, setCompareAppIds] = useState<number[] | null>(null);

  const handleOpenAuth = (role: 'HR' | 'CANDIDATE') => {
    if (user) {
      if (role === 'HR') {
        setActiveView('hr_dashboard');
      } else {
        setActiveView('candidate_dashboard');
      }
    } else {
      setAuthRole(role);
    }
  };

  const handleAuthSuccess = () => {
    if (user?.role === 'HR' || authRole === 'HR') {
      setActiveView('hr_dashboard');
    } else {
      setActiveView('candidate_dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 selection:bg-cyan-500 selection:text-white">
      
      {/* Header Navigation */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main View Router */}
      <main className="flex-grow">
        {activeView === 'landing' && (
          <LandingPage onOpenAuth={handleOpenAuth} />
        )}

        {activeView === 'hr_dashboard' && (
          <HRDashboard
            onSelectCandidate={(appId) => setSelectedApplicationId(appId)}
            onCompareCandidates={(appIds) => setCompareAppIds(appIds)}
          />
        )}

        {activeView === 'candidate_dashboard' && (
          <CandidateDashboard
            onViewMatchAnalysis={(appId) => setSelectedApplicationId(appId)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F17] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            AI RESUME SCREENING ASSISTANT — RAG + Skill Ontology + Explainable Candidate Intelligence
          </div>
          <div className="text-slate-400 font-mono">
            Hackathon Production System • FastAPI + React + SQLite
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      {authRole && (
        <AuthModal
          initialRole={authRole}
          onClose={() => setAuthRole(null)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Candidate Intelligence Dashboard Modal ("Why 91%?") */}
      {selectedApplicationId && (
        <CandidateIntelligenceModal
          applicationId={selectedApplicationId}
          onClose={() => setSelectedApplicationId(null)}
        />
      )}

      {/* Candidate Comparison Modal */}
      {compareAppIds && compareAppIds.length > 0 && (
        <CandidateComparisonModal
          applicationIds={compareAppIds}
          onClose={() => setCompareAppIds(null)}
        />
      )}

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
