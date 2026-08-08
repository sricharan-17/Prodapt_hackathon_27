import React, { useState, useEffect } from 'react';
import { CandidateIntelligencePayload } from '../types';
import { fetchCandidateIntelligenceApi } from '../services/api';
import { X, Award, CheckCircle2, AlertTriangle, AlertCircle, Quote, Brain, Database, ShieldCheck, Sparkles, FileText, ChevronRight, MinusCircle } from 'lucide-react';

interface CandidateIntelligenceModalProps {
  applicationId: number;
  onClose: () => void;
}

export const CandidateIntelligenceModal: React.FC<CandidateIntelligenceModalProps> = ({ applicationId, onClose }) => {
  const [data, setData] = useState<CandidateIntelligencePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'why_score' | 'rag_evidence' | 'skill_gaps' | 'resume_raw'>('why_score');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const payload = await fetchCandidateIntelligenceApi(applicationId);
        setData(payload);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [applicationId]);

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm font-semibold text-slate-200">Retrieving RAG evidence & score deduction audit...</p>
        </div>
      </div>
    );
  }

  const { candidate, job, overall_score, coverage_ratio, score_breakdown, match_details, gap_analysis, ai_summary, resume } = data;
  const reqMatches = match_details.required_matches || [];
  const prefMatches = match_details.preferred_matches || [];
  const deductions = (score_breakdown as any)?.deductions_audit || [];
  const totalDeductions = (score_breakdown as any)?.total_deductions_pts || (100 - overall_score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header Bar */}
        <div className="bg-[#1E293B]/80 px-6 py-5 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-2xl border shadow-lg ${
              overall_score >= 85
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-emerald-500/20'
                : overall_score >= 70
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-cyan-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-amber-500/20'
            }`}>
              {overall_score}%
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white">{candidate.name}</h2>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                  Skill Coverage: {coverage_ratio}
                </span>
                {totalDeductions > 0 && (
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full">
                    Deduction: -{totalDeductions}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Applied for <span className="text-slate-200 font-semibold">{job.title}</span> • {resume.experience_years} Years Experience
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Intelligence Tab Navigation Bar */}
        <div className="bg-slate-900 px-6 border-b border-slate-800 flex space-x-4 text-xs font-semibold overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('why_score')}
            className={`py-3.5 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'why_score' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Why Score {overall_score}%?</span>
          </button>

          <button
            onClick={() => setActiveTab('rag_evidence')}
            className={`py-3.5 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'rag_evidence' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Quote className="w-4 h-4 text-emerald-400" />
            <span>RAG Resume Evidence ({reqMatches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('skill_gaps')}
            className={`py-3.5 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'skill_gaps' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Skill Gap Analysis ({gap_analysis.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resume_raw')}
            className={`py-3.5 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
              activeTab === 'resume_raw' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Original Resume View</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          
          {/* TAB 1: WHY THIS SCORE? */}
          {activeTab === 'why_score' && (
            <div className="space-y-6">
              
              {/* Evidence-Grounded AI Summary Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-cyan-400 font-extrabold text-sm">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  <span>Why Candidate Scored {overall_score}%?</span>
                  <span className="px-2 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 rounded-md border border-cyan-500/30">
                    Verified Audit
                  </span>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed font-normal">
                  {ai_summary}
                </p>
              </div>

              {/* Requirement 3: Explicit Deduction & Penalty Reason Audit */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-rose-400 font-extrabold text-sm">
                    <MinusCircle className="w-5 h-5" />
                    <span>Reason Why Candidate Lost {totalDeductions}% ({100 - totalDeductions}% ➔ {overall_score}%)</span>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-rose-500/20 text-rose-300 rounded-md border border-rose-500/30">
                    -{totalDeductions}% Total Deductions
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {deductions.length > 0 ? (
                    deductions.map((ded: any, dIdx: number) => (
                      <div key={dIdx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-white text-xs">{ded.category}</div>
                          <div className="text-slate-400 text-[11px]">{ded.reason}</div>
                        </div>
                        <div className="px-2.5 py-1 bg-rose-500/10 text-rose-400 font-mono font-bold text-xs rounded-lg border border-rose-500/20 whitespace-nowrap">
                          -{ded.points_lost}%
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                      Candidate fulfilled preferred skills, experience, and project evidence with near 100% precision (-{totalDeductions}% minor verification margin).
                    </div>
                  )}
                </div>
              </div>

              {/* Score Deterministic Breakdown Formula Cards */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Transparent Score Breakdown Engine</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="text-xs text-slate-400 font-semibold flex justify-between">
                      <span>Required Skills</span>
                      <span className="text-cyan-400 font-mono">Weight: 50%</span>
                    </div>
                    <div className="text-lg font-bold text-white font-mono">
                      {score_breakdown?.breakdown?.required_skills?.score_pct}% Match
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium">
                      + {score_breakdown?.breakdown?.required_skills?.contribution} pts to overall score
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="text-xs text-slate-400 font-semibold flex justify-between">
                      <span>Experience Alignment</span>
                      <span className="text-cyan-400 font-mono">Weight: 20%</span>
                    </div>
                    <div className="text-lg font-bold text-white font-mono">
                      {score_breakdown?.breakdown?.experience?.score_pct}% Match
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium">
                      + {score_breakdown?.breakdown?.experience?.contribution} pts ({resume.experience_years}y / {job.experience_years}y req)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="text-xs text-slate-400 font-semibold flex justify-between">
                      <span>Project Evidence</span>
                      <span className="text-cyan-400 font-mono">Weight: 15%</span>
                    </div>
                    <div className="text-lg font-bold text-white font-mono">
                      {score_breakdown?.breakdown?.projects?.score_pct}% Match
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium">
                      + {score_breakdown?.breakdown?.projects?.contribution} pts (Verified in resume)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="text-xs text-slate-400 font-semibold flex justify-between">
                      <span>Education & Certs</span>
                      <span className="text-cyan-400 font-mono">Weight: 10%</span>
                    </div>
                    <div className="text-lg font-bold text-white font-mono">
                      {score_breakdown?.breakdown?.education_certs?.score_pct}% Match
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium">
                      + {score_breakdown?.breakdown?.education_certs?.contribution} pts
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="text-xs text-slate-400 font-semibold flex justify-between">
                      <span>Preferred Skills</span>
                      <span className="text-cyan-400 font-mono">Weight: 5%</span>
                    </div>
                    <div className="text-lg font-bold text-white font-mono">
                      {score_breakdown?.breakdown?.preferred_skills?.score_pct}% Match
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium">
                      + {score_breakdown?.breakdown?.preferred_skills?.contribution} pts
                    </div>
                  </div>

                </div>
              </div>

              {/* Skill-by-Skill Breakdown Summary */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Skill-by-Skill Match Matrix</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reqMatches.map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border space-y-1.5 ${
                        m.match_type === 'EXACT_MATCH'
                          ? 'bg-emerald-500/5 border-emerald-500/30'
                          : m.match_type === 'RELATED_MATCH' || m.match_type === 'PARTIAL_MATCH'
                          ? 'bg-cyan-500/5 border-cyan-500/30'
                          : 'bg-rose-500/5 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{m.canonical_skill}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${
                          m.match_type === 'EXACT_MATCH'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : m.match_type === 'RELATED_MATCH' || m.match_type === 'PARTIAL_MATCH'
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}>
                          {m.match_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{m.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: RAG RESUME EVIDENCE */}
          {activeTab === 'rag_evidence' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Extracted resume sentence and paragraph citations supporting each job requirement:
              </div>

              {reqMatches.map((match: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-white">{match.canonical_skill}</span>
                      <span className="text-xs text-slate-400">({match.category})</span>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                      match.match_type === 'EXACT_MATCH' ? 'bg-emerald-500/20 text-emerald-400' :
                      match.match_type === 'MISSING' ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {match.match_type} (Mult: {match.score_multiplier})
                    </span>
                  </div>

                  {match.evidence && match.evidence.length > 0 ? (
                    <div className="space-y-2">
                      {match.evidence.map((ev: any, evIdx: number) => (
                        <div key={evIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between text-cyan-400 font-mono text-[10px]">
                            <span>RAG Citation Chunk #{ev.chunk_id}</span>
                            <span>Confidence: {(ev.confidence * 100).toFixed(0)}%</span>
                          </div>
                          <p className="text-slate-200 italic font-serif leading-relaxed">
                            "{ev.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/60 text-xs text-rose-400 italic">
                      No direct evidence quote retrieved from candidate resume chunks for '{match.canonical_skill}'.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SKILL GAP ANALYSIS */}
          {activeTab === 'skill_gaps' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Detailed analysis of unfulfilled JD requirements, severity assessment, and transferable skills:
              </div>

              {gap_analysis.length === 0 ? (
                <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-bold text-white text-sm">No critical skill gaps identified!</p>
                  <p className="text-xs text-slate-400">Candidate demonstrates evidence or related skills for all core job requirements.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {gap_analysis.map((gap, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-sm text-white">{gap.skill}</span>
                          <span className="text-xs text-slate-400">({gap.category} Domain)</span>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                          gap.severity === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          Gap Severity: {gap.severity}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {gap.explanation}
                      </p>

                      {gap.related_candidate_skills && gap.related_candidate_skills.length > 0 && (
                        <div className="pt-2 border-t border-slate-800 text-xs flex items-center space-x-2">
                          <span className="text-slate-400">Transferable skills present in candidate resume:</span>
                          {gap.related_candidate_skills.map((rel: string, rIdx: number) => (
                            <span key={rIdx} className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-semibold text-[10px]">
                              {rel}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ORIGINAL RESUME VIEW */}
          {activeTab === 'resume_raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>File: <strong className="text-white">{resume.filename}</strong></span>
                <span>Extracted Skills: {resume.extracted_skills?.join(', ') || 'None'}</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {resume.raw_text}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer Bar */}
        <div className="bg-[#1E293B]/80 px-6 py-4 border-t border-slate-800 flex items-center justify-between flex-shrink-0 text-xs">
          <div className="text-slate-400">
            Explainable AI decision based on RAG retrieval, normalized ontology rules & score deduction audit.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
          >
            Close Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
