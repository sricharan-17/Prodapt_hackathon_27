import React from 'react';
import { Brain, Search, Database, Layers, ShieldCheck, Award, ArrowRight, CheckCircle2, AlertCircle, Sparkles, FileText, Zap, BarChart3 } from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (role: 'HR' | 'CANDIDATE') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 px-4 max-w-7xl mx-auto text-center space-y-8">
        
        {/* Top Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span>RAG Vector Retrieval + Hierarchical Skill Ontology Engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          From Resume Keyword Matching to{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Explainable Candidate Intelligence
          </span>
        </h1>

        <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
          Stop trusting black-box AI scores. Extract verified resume evidence, normalize skill synonyms, 
          calculate deterministic weighted scores, and rank applicants on a transparent HR leaderboard.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onOpenAuth('HR')}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center space-x-3 group"
          >
            <Brain className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Launch HR Recruiter Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onOpenAuth('CANDIDATE')}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-semibold text-base rounded-2xl transition-all flex items-center justify-center space-x-3"
          >
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>Candidate Resume Portal</span>
          </button>
        </div>

        {/* Sub-hero Metric Pill Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
          <div className="glass-panel p-4 rounded-2xl text-center space-y-1">
            <div className="text-2xl font-bold text-cyan-400">100%</div>
            <div className="text-xs text-slate-400 font-medium">Explainable Audit Trail</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl text-center space-y-1">
            <div className="text-2xl font-bold text-indigo-400">RAG</div>
            <div className="text-xs text-slate-400 font-medium">Evidence Chunk Retrieval</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl text-center space-y-1">
            <div className="text-2xl font-bold text-emerald-400">Ontology</div>
            <div className="text-xs text-slate-400 font-medium">Hierarchical Skill Graph</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl text-center space-y-1">
            <div className="text-2xl font-bold text-amber-400">Weighted</div>
            <div className="text-xs text-slate-400 font-medium">Deterministic Scoring</div>
          </div>
        </div>

      </section>

      {/* RAG + Ontology Pipeline Showcase */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Core Differentiator: RAG-Based JD → Resume Pipeline
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Instead of asking an LLM to blindly guess candidate fit, our system executes an architectural intelligence pipeline:
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-10 rounded-3xl space-y-8 border-cyan-500/20">
          
          {/* Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-center">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center mx-auto text-xs">1</div>
              <h4 className="font-bold text-sm text-white">Job Description</h4>
              <p className="text-[11px] text-slate-400">Upload JD & extract required & preferred skills automatically</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center mx-auto text-xs">2</div>
              <h4 className="font-bold text-sm text-white">Skill Ontology</h4>
              <p className="text-[11px] text-slate-400">Normalize terms (e.g. Flask → REST API, React.js → React)</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center mx-auto text-xs">3</div>
              <h4 className="font-bold text-sm text-white">RAG Evidence Retrieval</h4>
              <p className="text-[11px] text-slate-400">Vector search extracts exact resume sentence citations</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-center">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center mx-auto text-xs">4</div>
              <h4 className="font-bold text-sm text-white">Deterministic Scoring</h4>
              <p className="text-[11px] text-slate-400">Weighted formula (50% Required, 20% Exp, 15% Projects, etc.)</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-center">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center mx-auto text-xs">5</div>
              <h4 className="font-bold text-sm text-white">Why 91% Dashboard</h4>
              <p className="text-[11px] text-slate-400">Recruiter inspects exact evidence quotes and gap severities</p>
            </div>

          </div>

          {/* Ontology Visual Example Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-cyan-400 flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Skill Ontology Mapping Example</span>
              </h4>
              <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-2 border border-slate-800">
                <div className="text-slate-500">// JD Requirement: "REST API development"</div>
                <div className="text-slate-500">// Resume: "Developed Flask backend microservices for Voting App."</div>
                <div className="text-emerald-400">Flask ➔ Python Web Framework ➔ Backend ➔ REST API</div>
                <div className="text-amber-400">Match Type: PARTIAL / RELATED (Score Multiplier: 0.7)</div>
                <div className="text-slate-400">Confidence: 0.85</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-indigo-400 flex items-center space-x-2">
                <Layers className="w-4 h-4" />
                <span>Classification Multipliers</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                  <span className="font-semibold text-emerald-400">EXACT MATCH</span>
                  <span className="font-mono text-white">1.0</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-cyan-500/30 flex items-center justify-between">
                  <span className="font-semibold text-cyan-400">PARTIAL MATCH</span>
                  <span className="font-mono text-white">0.7</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-indigo-500/30 flex items-center justify-between">
                  <span className="font-semibold text-indigo-400">RELATED SKILL</span>
                  <span className="font-mono text-white">0.5</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-rose-500/30 flex items-center justify-between">
                  <span className="font-semibold text-rose-400">MISSING / GAP</span>
                  <span className="font-mono text-white">0.0</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Demo Story Hackathon Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 p-8 rounded-3xl border border-indigo-500/20 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest">3-Minute Hackathon Demo Story</span>
              <h3 className="text-2xl font-bold text-white">"Our AI doesn't just tell HR who matches. It explains why."</h3>
            </div>
            <button
              onClick={() => onOpenAuth('HR')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start md:self-auto"
            >
              Explore HR Demo Data
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="font-bold text-cyan-400">0:00–1:00</span> HR uploads JD ➔ Auto-extracts Python, SQL, REST APIs, React & Git skills.
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="font-bold text-indigo-400">1:00–2:00</span> Candidates upload resumes ➔ RAG vector search pulls evidence.
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-400">2:00–3:00</span> HR inspects Leaderboard & clicks "Why 91%" Candidate Intelligence.
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
