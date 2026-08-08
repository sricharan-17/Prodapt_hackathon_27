import React, { useState, useEffect } from 'react';
import { compareCandidatesApi } from '../services/api';
import { X, Scale, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface CandidateComparisonModalProps {
  applicationIds: number[];
  onClose: () => void;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({ applicationIds, onClose }) => {
  const [comparison, setComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadComparison() {
      setLoading(true);
      try {
        const res = await compareCandidatesApi(applicationIds);
        setComparison(res.candidates);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadComparison();
  }, [applicationIds]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Side-by-Side Candidate Comparison</h3>
            <p className="text-xs text-slate-400">Comparative analysis of scores, matched ontology skills, and gap severities</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading comparative intelligence matrix...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparison.map((cand, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 relative flex flex-col justify-between">
                
                {idx === 0 && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] rounded-full shadow-md flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>HIGHEST RANKED</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="font-extrabold text-base text-white">{cand.candidate_name}</div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl font-mono font-extrabold text-lg">
                      {cand.score}% Match
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Coverage: {cand.coverage_ratio}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Exact Matched Skills ({cand.exact_matches?.length || 0}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cand.exact_matches?.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 text-[10px] rounded border border-emerald-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="text-xs font-semibold text-rose-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Missing Skill Gaps ({cand.missing_skills?.length || 0}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cand.missing_skills?.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-rose-500/10 text-rose-300 text-[10px] rounded border border-rose-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-normal italic font-sans">
                  "{cand.summary}"
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
