import React, { useState } from 'react';
import { uploadJDApi } from '../services/api';
import { Job } from '../types';
import { X, Upload, FileText, CheckCircle2, Sparkles, Plus, Trash2 } from 'lucide-react';

interface JobCreationModalProps {
  onClose: () => void;
  onSuccess: (job: Job) => void;
}

export const JobCreationModal: React.FC<JobCreationModalProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState<string>('Python Full Stack Developer');
  const [department, setDepartment] = useState<string>('Engineering');
  const [location, setLocation] = useState<string>('Remote / Hybrid');
  const [descriptionText, setDescriptionText] = useState<string>(`
We are looking for a Python Full Stack Developer to design scalable APIs and modern web UIs.
Required Skills:
- Python (FastAPI or Flask)
- SQL (PostgreSQL or MySQL)
- REST API design
- React (React.js, hooks, component state)
- Git (Version control)

Preferred Skills:
- Docker
- AWS
- MongoDB

Experience: 3+ years in full-stack web development.
  `.trim());

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('department', department);
      formData.append('location', location);

      if (selectedFile) {
        formData.append('file', selectedFile);
      } else if (descriptionText) {
        formData.append('description_text', descriptionText);
      } else {
        throw new Error('Please upload a JD document or enter description text.');
      }

      const createdJob = await uploadJDApi(formData);
      onSuccess(createdJob);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create job posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Post New Job & Extract Requirements</h3>
            <p className="text-xs text-slate-400">Upload JD file or paste text to extract normalized skill ontology requirements</p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* JD File Upload Card */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Upload JD Document (PDF / DOCX / TXT)</label>
            <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-900/60">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="jd-file-upload"
              />
              <label htmlFor="jd-file-upload" className="cursor-pointer space-y-1 block">
                <FileText className="w-6 h-6 text-cyan-400 mx-auto" />
                <span className="text-xs font-semibold text-slate-200 block">
                  {selectedFile ? selectedFile.name : 'Click to select JD document file'}
                </span>
                <span className="text-[10px] text-slate-400 block">PDF, DOCX, or TXT up to 10MB</span>
              </label>
            </div>
          </div>

          {/* Or Paste Plain Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Or Paste Job Description Text</label>
            <textarea
              rows={5}
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Extracting Ontology...' : 'Extract & Post Job'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
