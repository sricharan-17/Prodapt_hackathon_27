import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Job } from '../types';
import { fetchMeApi, fetchJobsApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeJob: Job | null;
  jobs: Job[];
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setActiveJob: (job: Job | null) => void;
  refreshJobs: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUserAndJobs = async () => {
    setLoading(true);
    try {
      if (token) {
        const userData = await fetchMeApi();
        setUser(userData);
      }
      const fetchedJobs = await fetchJobsApi();
      setJobs(fetchedJobs);
      if (fetchedJobs.length > 0 && !activeJob) {
        setActiveJob(fetchedJobs[0]);
      }
    } catch (e) {
      console.error(e);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserAndJobs();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshJobs = async () => {
    const fetched = await fetchJobsApi();
    setJobs(fetched);
    if (fetched.length > 0 && !activeJob) {
      setActiveJob(fetched[0]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeJob,
        jobs,
        loading,
        login,
        logout,
        setActiveJob,
        refreshJobs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
