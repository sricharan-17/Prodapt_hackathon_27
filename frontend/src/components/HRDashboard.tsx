import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Job, LeaderboardItem } from '../types';
import { fetchLeaderboardApi } from '../services/api';
import { HRLeaderboard } from './HRLeaderboard';
import { JobCreationModal } from './JobCreationModal';
import { Briefcase, Users, Award, Plus, Sparkles, TrendingUp, Building, MapPin, CheckCircle2 } from 'lucide-react';

interface HRDashboardProps {
  onSelectCandidate: (applicationId: number) => void;
  onCompareCandidates: (appIds: number[]) => void;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({ onSelectCandidate, onCompareCandidates }) => {
  const { jobs, activeJob, setActiveJob, refreshJobs } = useAuth();
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [jobLeaderboardData, setJobLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(false);

  // Fetch metrics dynamically whenever activeJob changes
  useEffect(() => {
    async function loadJobMetrics() {
      if (!activeJob) return;
      setLoadingMetrics(true);
      try {
        const res = await fetchLeaderboardApi(activeJob.id);
        setJobLeaderboardData(res.leaderboard);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMetrics(false);
      }
    }
    loadJobMetrics();
  }, [activeJob]);

  // Compute dynamic metrics for the specified active job
  const applicantCount = jobLeaderboardData.length;
  const topScore = applicantCount > 0 ? Math.max(...jobLeaderboardData.map(c => c.match_score)) : 0;
  const topCandidate = jobLeaderboardData.find(c => c.match_score === topScore);
  const avgScore = applicantCount > 0
    ? Math.round(jobLeaderboardData.reduce((sum, c) => sum + c.match_score, 0) / applicantCount)
    : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 lg:px-8 py-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <span>Recruiter Intelligence Dashboard</span>
            <span className="px-3 py-1 text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
              HR Mode
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Displaying live candidates and metrics for specified job: <span className="text-cyan-400 font-bold">{activeJob?.title || 'Selected Job'}</span>
          </p>
        </div>

        <button
          onClick={() => setShowJobModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Job Description</span>
        </button>
      </div>

      {/* Dynamic Metric Cards Row for Specified Job */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1: Selected Job Role */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border-cyan-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Specified Job Role</span>
            <Briefcase className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-extrabold text-white truncate font-sans" title={activeJob?.title}>
            {activeJob?.title || 'None'}
          </div>
          <div className="text-[11px] text-cyan-400 font-medium flex items-center space-x-1">
            <Building className="w-3 h-3" />
            <span>{activeJob?.department || 'Engineering'}</span>
          </div>
        </div>

        {/* Metric 2: Applicants Count for Specified Job */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border-indigo-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Applicants Count</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {loadingMetrics ? '...' : applicantCount}
          </div>
          <div className="text-[11px] text-indigo-400 font-medium">
            Resumes uploaded for this role
          </div>
        </div>

        {/* Metric 3: Top Match Score for Specified Job */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Top Candidate Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {loadingMetrics ? '...' : `${topScore}%`}
          </div>
          <div className="text-[11px] text-slate-300 font-medium truncate" title={topCandidate?.candidate_name}>
            {topCandidate ? `${topCandidate.candidate_name} (${topCandidate.coverage_ratio})` : 'No applicants yet'}
          </div>
        </div>

        {/* Metric 4: Average Score for Specified Job */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Avg Job Score</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {loadingMetrics ? '...' : `${avgScore}%`}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            RAG average for this role
          </div>
        </div>

      </div>

      {/* Active Jobs Tabs Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Select Job Role</h3>
          <span className="text-xs text-slate-400">Click a job role to update top metrics & live candidate leaderboard</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {jobs.map((job) => {
            const isSelected = activeJob?.id === job.id;
            return (
              <div
                key={job.id}
                onClick={() => setActiveJob(job)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-white">{job.title}</span>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  )}
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.department}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.location}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1">
                  {job.required_skills.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded-md">
                      {skill}
                    </span>
                  ))}
                  {job.required_skills.length > 4 && (
                    <span className="text-[10px] text-slate-500 py-0.5">+{job.required_skills.length - 4} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Leaderboard View */}
      {activeJob && (
        <HRLeaderboard
          job={activeJob}
          onSelectCandidate={onSelectCandidate}
          onCompareCandidates={onCompareCandidates}
        />
      )}

      {/* Job Creation Modal */}
      {showJobModal && (
        <JobCreationModal
          onClose={() => setShowJobModal(false)}
          onSuccess={() => refreshJobs()}
        />
      )}

    </div>
  );
};
