import React, { useState, useEffect } from 'react';
import { LeaderboardItem, Job } from '../types';
import { fetchLeaderboardApi } from '../services/api';
import { Search, Filter, Award, AlertCircle, CheckCircle2, ChevronRight, Scale, SlidersHorizontal, Sparkles } from 'lucide-react';

interface HRLeaderboardProps {
  job: Job;
  onSelectCandidate: (applicationId: number) => void;
  onCompareCandidates: (appIds: number[]) => void;
}

export const HRLeaderboard: React.FC<HRLeaderboardProps> = ({ job, onSelectCandidate, onCompareCandidates }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [search, setSearch] = useState<string>('');
  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [missingSkillFilter, setMissingSkillFilter] = useState<string>('');
  
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);

  // Dynamically generate missing skill options from the selected Job Description!
  const allJobSkills = Array.from(
    new Set([...(job.required_skills || []), ...(job.preferred_skills || [])])
  );

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await fetchLeaderboardApi(job.id, {
        search,
        min_score: minScore,
        missing_skill: missingSkillFilter || undefined
      });
      setLeaderboard(data.leaderboard);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [job.id, search, minScore, missingSkillFilter]);

  const toggleCompare = (appId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedForCompare.includes(appId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== appId));
    } else {
      if (selectedForCompare.length >= 3) {
        alert("You can compare up to 3 candidates at a time.");
        return;
      }
      setSelectedForCompare([...selectedForCompare, appId]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Bar */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">Candidate Leaderboard</h3>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                {leaderboard.length} Applicants Ranked
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              RAG + Skill Ontology explainable score ranking for <span className="text-slate-200 font-semibold">{job.title}</span>
            </p>
          </div>

          {selectedForCompare.length > 0 && (
            <button
              onClick={() => onCompareCandidates(selectedForCompare)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 flex items-center space-x-2 animate-bounce-subtle"
            >
              <Scale className="w-4 h-4" />
              <span>Compare Selected ({selectedForCompare.length})</span>
            </button>
          )}
        </div>

        {/* Dynamic Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          {/* Search Candidate / Skill */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search candidate or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Min Score Filter */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-400 font-medium">Min Score:</span>
            <select
              value={minScore || ''}
              onChange={(e) => setMinScore(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-transparent text-xs text-cyan-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-white">All Scores</option>
              <option value="90" className="bg-slate-900 text-white">90% + (Top Match)</option>
              <option value="80" className="bg-slate-900 text-white">80% + (Strong Match)</option>
              <option value="70" className="bg-slate-900 text-white">70% + (Good Match)</option>
              <option value="50" className="bg-slate-900 text-white">50% + (Moderate)</option>
            </select>
          </div>

          {/* Filter by Missing Skill (Dynamic options based on Job Description skills) */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-slate-400 font-medium">Missing Skill:</span>
            <select
              value={missingSkillFilter}
              onChange={(e) => setMissingSkillFilter(e.target.value)}
              className="bg-transparent text-xs text-rose-400 font-bold focus:outline-none cursor-pointer w-full"
            >
              <option value="" className="bg-slate-900 text-white">All Skills (No Filter)</option>
              {allJobSkills.map((skillName, sIdx) => (
                <option key={sIdx} value={skillName} className="bg-slate-900 text-white">
                  Missing {skillName}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border-slate-800">
        
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading RAG candidate rankings...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="font-semibold text-white">No candidates found matching the selected criteria.</p>
            <p className="text-xs">Try clearing filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Compare</th>
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4 text-center">Match Score</th>
                  <th className="py-3.5 px-4">Skill Coverage</th>
                  <th className="py-3.5 px-4">Matched Skills</th>
                  <th className="py-3.5 px-4">Skill Gaps</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {leaderboard.map((item) => {
                  const isTopRank = item.rank === 1;
                  const isSelected = selectedForCompare.includes(item.application_id);

                  return (
                    <tr
                      key={item.application_id}
                      onClick={() => onSelectCandidate(item.application_id)}
                      className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        isTopRank ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleCompare(item.application_id, e as any)}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500/20 cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-sm">
                        {isTopRank ? (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black flex items-center justify-center mx-auto shadow-md shadow-amber-400/30">
                            1
                          </div>
                        ) : item.rank === 2 ? (
                          <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-black flex items-center justify-center mx-auto">
                            2
                          </div>
                        ) : item.rank === 3 ? (
                          <div className="w-7 h-7 rounded-full bg-amber-700 text-white font-black flex items-center justify-center mx-auto">
                            3
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono">#{item.rank}</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm flex items-center space-x-1.5">
                          <span>{item.candidate_name}</span>
                          {isTopRank && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400">{item.candidate_email}</div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-xl font-mono font-extrabold text-sm border ${
                          item.match_score >= 85
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.match_score >= 70
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : item.match_score >= 50
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {item.match_score}%
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-slate-300">
                        {item.coverage_ratio}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {item.matched_skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md"
                            >
                              🟢 {skill}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {item.missing_skills.length > 0 ? (
                            item.missing_skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md"
                              >
                                🔴 {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">No critical gaps</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => onSelectCandidate(item.application_id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-500 hover:text-white text-slate-300 rounded-lg font-semibold text-[11px] transition-all flex items-center space-x-1 ml-auto"
                        >
                          <span>Why {item.match_score}%?</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
