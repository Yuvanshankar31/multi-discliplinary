import axios from 'axios';
import { motion } from 'framer-motion';
import { HardDrive, Trash2, Cpu, Cloud, Layers, Globe } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { formatInr } from '../utils/currency';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const statusColors = {
  queued: 'bg-accent-amber/15 text-accent-amber border-accent-amber/35',
  running: 'bg-primary/15 text-primary-light border-primary/35 shadow-glow-primary',
  completed: 'bg-secondary/15 text-secondary-light border-secondary/35 shadow-glow-secondary',
  failed: 'bg-red-500/15 text-red-400 border-red-500/35',
  cancelled: 'bg-dark-700/45 text-dark-400 border-dark-600',
};

const cloudBadges = {
  IaaS: {
    bg: 'bg-primary/10 text-primary-light border-primary/20',
    icon: Cpu
  },
  PaaS: {
    bg: 'bg-accent-violet/10 text-accent-violet border-accent-violet/20',
    icon: Layers
  },
  SaaS: {
    bg: 'bg-accent-fuchsia/10 text-accent-fuchsia border-accent-fuchsia/20',
    icon: Globe
  }
};

export default function JobHistory() {
  const [jobHistory, setJobHistory] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/jobs`);
      setJobHistory(res.data.jobs);
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDelete = async (jobId) => {
    if (!confirm('Remove this training job from database history?')) return;
    setDeletingId(jobId);
    try {
      await axios.delete(`${API_BASE_URL}/jobs/${jobId}`);
      await fetchJobs();
    } catch (err) {
      alert('Failed to delete job.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/jobs/${jobId}`, { status: newStatus });
      await fetchJobs();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8 py-4"
    >
      <header className="mb-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Job <span className="gradient-text font-black">History</span></h1>
        <p className="text-dark-400 mt-2">Log records of historical optimization runs, hardware bindings, and training outcomes.</p>
      </header>

      <div className="glass-panel p-8 border border-dark-700/30 shadow-2xl overflow-hidden flex flex-col relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <h3 className="text-lg font-bold flex items-center gap-2.5 mb-6 text-white relative z-10">
          <HardDrive className="text-primary w-5.5 h-5.5 shadow-glow-primary" />
          Cluster Training Log Base
        </h3>
        
        <div className="overflow-x-auto relative z-10 rounded-xl border border-dark-800/80">
          <table className="w-full text-left border-collapse min-w-[900px] overflow-hidden">
            <thead>
              <tr className="border-b border-dark-800 text-xs font-bold uppercase tracking-widest text-dark-400 bg-dark-950/70">
                <th className="py-4.5 px-5 rounded-tl-xl">Model Topology</th>
                <th className="py-4.5 px-5">Dataset</th>
                <th className="py-4.5 px-5">Cloud Layer</th>
                <th className="py-4.5 px-5">Target GPU</th>
                <th className="py-4.5 px-5">Batch</th>
                <th className="py-4.5 px-5">Status</th>
                <th className="py-4.5 px-5">Est. Cost (₹)</th>
                <th className="py-4.5 px-5 text-right">Timestamp</th>
                <th className="py-4.5 px-5 w-20 rounded-tr-xl"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {jobHistory.length > 0 ? jobHistory.map((job) => {
                const cModel = job.cloud_model || 'IaaS';
                const BadgeStyle = cloudBadges[cModel] || cloudBadges.IaaS;
                const IconComp = BadgeStyle.icon;
                
                return (
                  <tr key={job.job_id} className="border-b border-dark-800/40 hover:bg-dark-900/30 transition-all">
                    <td className="py-5 px-5 font-black text-white tracking-wide">{job.model_name}</td>
                    <td className="py-5 px-5 text-dark-300 font-semibold">{job.dataset}</td>
                    <td className="py-5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold uppercase ${BadgeStyle.bg}`}>
                        <IconComp className="w-3.5 h-3.5" />
                        {cModel}
                      </span>
                    </td>
                    <td className="py-5 px-5">
                      <span className="bg-dark-950 border border-dark-700/80 px-3 py-1.5 rounded-lg text-xs font-extrabold text-white font-mono">
                        {job.suggested_gpu}
                      </span>
                    </td>
                    <td className="py-5 px-5 text-dark-400 font-mono font-bold">{job.batch_size}</td>
                    <td className="py-5 px-5">
                      <select
                        value={job.status || 'queued'}
                        onChange={(e) => handleStatusChange(job.job_id, e.target.value)}
                        className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border capitalize bg-dark-950 cursor-pointer outline-none transition-all ${statusColors[job.status] || statusColors.queued}`}
                      >
                        {['queued', 'running', 'completed', 'failed', 'cancelled'].map((s) => (
                          <option key={s} value={s} className="bg-dark-950 text-white font-bold">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-5 px-5 font-mono text-secondary-light font-black text-[15px]">{formatInr(job.estimated_cost)}</td>
                    <td className="py-5 px-5 text-right text-dark-400 font-medium">
                      {new Date(job.submitted_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-5 px-5">
                      <button
                        onClick={() => handleDelete(job.job_id)}
                        disabled={deletingId === job.job_id}
                        className="p-2 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-dark-400 text-base font-semibold">
                    No infrastructure optimization records present in cluster database history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
