import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadResumeApi } from '../services/api';
import { UserCheck, Upload, FileText, CheckCircle2, Sparkles, Shield, Lock, Briefcase } from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { user, jobs } = useAuth();
  
  const [uploadType, setUploadType] = useState<'GENERAL' | 'JOB_SPECIFIC'>('GENERAL');
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(jobs[0]?.id);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  
  const [processingStage, setProcessingStage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [extractedProfile, setExtractedProfile] = useState<any | null>(null);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessingStage('Uploading resume...');

    try {
      const formData = new FormData();
      formData.append('file_type', uploadType);
      if (uploadType === 'JOB_SPECIFIC' && selectedJobId) {
        formData.append('associated_job_id', selectedJobId.toString());
      } else if (jobs.length > 0) {
        formData.append('associated_job_id', jobs[0].id.toString());
      }

      if (selectedFile) {
        formData.append('file', selectedFile);
      } else if (pastedText) {
        formData.append('raw_text', pastedText);
      } else {
        throw new Error('Please select a file or paste plain text resume.');
      }

      // Live processing stage simulation
      setTimeout(() => setProcessingStage('Parsing text & sentence chunking...'), 500);
      setTimeout(() => setProcessingStage('Extracting normalized ontology skills...'), 1000);
      setTimeout(() => setProcessingStage('Submitting candidate profile to HR...'), 1500);

      const res = await uploadResumeApi(formData);
      
      setExtractedProfile(res);
      setProcessingStage('Completed!');
    } catch (err: any) {
      setError(err.message || 'Upload processing failed');
      setProcessingStage('');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <span>Candidate Resume Portal</span>
          <span className="px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
            Candidate Mode
          </span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Upload your general resume or a job-specific resume to apply for open job postings.
        </p>
      </div>

      {/* Dual Upload Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Option 1: General Resume */}
        <div
          onClick={() => setUploadType('GENERAL')}
          className={`p-5 rounded-3xl border cursor-pointer transition-all ${
            uploadType === 'GENERAL'
              ? 'bg-slate-900 border-emerald-500/60 shadow-xl shadow-emerald-500/10 scale-[1.01]'
              : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-300 rounded-md">
              Option 1
            </span>
          </div>

          <h3 className="text-base font-bold text-white">General Resume</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Upload your standard resume to be considered across all open positions.
          </p>
        </div>

        {/* Option 2: Job-Specific Resume */}
        <div
          onClick={() => setUploadType('JOB_SPECIFIC')}
          className={`p-5 rounded-3xl border cursor-pointer transition-all ${
            uploadType === 'JOB_SPECIFIC'
              ? 'bg-slate-900 border-cyan-500/60 shadow-xl shadow-cyan-500/10 scale-[1.01]'
              : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-300 rounded-md">
              Option 2
            </span>
          </div>

          <h3 className="text-base font-bold text-white">Job-Specific Resume</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Upload a customized resume specifically for a targeted job role.
          </p>
        </div>

      </div>

      {/* Upload Form Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800 space-y-6">
        
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Upload className="w-5 h-5 text-cyan-400" />
          <span>{uploadType === 'GENERAL' ? 'General Resume Submission' : 'Job-Specific Submission'}</span>
        </h3>

        {error && (
          <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          
          {uploadType === 'JOB_SPECIFIC' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Job Role</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(Number(e.target.value))}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Resume Document (PDF, DOCX, TXT)</label>
            <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-900/60">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                id="resume-file-input"
              />
              <label htmlFor="resume-file-input" className="cursor-pointer space-y-2 block">
                <FileText className="w-8 h-8 text-cyan-400 mx-auto" />
                <span className="text-sm font-semibold text-slate-200 block">
                  {selectedFile ? selectedFile.name : 'Click to select your resume document'}
                </span>
                <span className="text-xs text-slate-400 block">PDF, DOCX, or TXT up to 10MB</span>
              </label>
            </div>
          </div>

          {/* Or Paste Plain Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Or Paste Resume Text</label>
            <textarea
              rows={4}
              placeholder="Paste text resume content here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={!!processingStage && processingStage !== 'Completed!'}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upload & Submit Resume to HR</span>
          </button>

        </form>

        {/* Live Processing Pipeline Bar */}
        {processingStage && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-400 flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                <span>Status: {processingStage}</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px]">Processing</span>
            </div>
            
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full w-full animate-pulse"></div>
            </div>
          </div>
        )}

      </div>

      {/* Confirmation & Extracted Skills Preview (No Scores Visible to Candidates) */}
      {extractedProfile && (
        <div className="glass-panel p-6 rounded-3xl space-y-4 border-emerald-500/30 animate-fadeIn">
          <div className="flex items-center space-x-3 text-emerald-400 font-bold text-base">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span>Resume Successfully Submitted to HR!</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-300 font-semibold">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Confidential HR Evaluation Notice:</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Your resume has been indexed and submitted to the HR recruiting team. Match scores, leaderboard rankings, and deep intelligence assessments are strictly confidential and visible to HR recruiters only.
            </p>
          </div>

          {/* Extracted Skills Preview */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-300 block">Extracted Skills From Your Resume:</span>
            <div className="flex flex-wrap gap-1.5">
              {extractedProfile.extracted_skills?.map((skill: string, idx: number) => (
                <span key={idx} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
