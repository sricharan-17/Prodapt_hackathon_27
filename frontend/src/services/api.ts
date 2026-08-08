import { User, Job, LeaderboardItem, CandidateIntelligencePayload } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function registerApi(data: { email: string; password: string; full_name: string; role: 'HR' | 'CANDIDATE'; organization?: string }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

export async function fetchMeApi(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function fetchJobsApi(): Promise<Job[]> {
  const res = await fetch(`${API_BASE}/jobs`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function uploadJDApi(formData: FormData): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs/upload-jd`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload Job Description');
  }
  return res.json();
}

export async function uploadResumeApi(formData: FormData) {
  const res = await fetch(`${API_BASE}/resumes/upload`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload Resume');
  }
  return res.json();
}

export async function fetchLeaderboardApi(
  jobId: number,
  params?: { search?: string; min_score?: number; missing_skill?: string }
): Promise<{ job_id: number; job_title: string; total_applicants: number; leaderboard: LeaderboardItem[] }> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.min_score) query.set('min_score', params.min_score.toString());
  if (params?.missing_skill) query.set('missing_skill', params.missing_skill);

  const res = await fetch(`${API_BASE}/leaderboard/jobs/${jobId}?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function fetchCandidateIntelligenceApi(applicationId: number): Promise<CandidateIntelligencePayload> {
  const res = await fetch(`${API_BASE}/leaderboard/candidate-intelligence/${applicationId}`);
  if (!res.ok) throw new Error('Failed to fetch candidate intelligence');
  return res.json();
}

export async function compareCandidatesApi(applicationIds: number[]) {
  const res = await fetch(`${API_BASE}/leaderboard/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(applicationIds),
  });
  if (!res.ok) throw new Error('Failed to compare candidates');
  return res.json();
}
