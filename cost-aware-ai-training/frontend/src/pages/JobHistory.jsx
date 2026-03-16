import axios from 'axios';
import { motion } from 'framer-motion';
import { HardDrive, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { formatInr } from '../utils/currency';

const API_BASE_URL = 'http://localhost:8000';

const statusColors = {
  queued: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  running: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  failed: 'bg-red-500/20 text-red-400 border-red-500/40',
  cancelled: 'bg-dark-600 text-dark-400 border-dark-500',
};

export default function JobHistory() {
  const [jobHistory, setJobHistory] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/jobs`);
      setJobHistory(res.data.jobs);
    } catch (err) { }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDelete = async (jobId) => {
    if (!confirm('Remove this job from history?')) return;
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
      className="flex flex-col gap-6"
    >
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Job <span className="gradient-text">History</span></h1>
        <p className="text-dark-400 mt-2">Historical training job executions and cost logs.</p>
      </header>

      <div className="glass-panel p-6 overflow-hidden flex flex-col">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
          <HardDrive className="text-primary w-5 h-5" />
          Database Records
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-dark-700 text-sm text-dark-400 bg-dark-900/50">
                <th className="py-4 px-4 font-medium rounded-tl-lg">Model Topology</th>
                <th className="py-4 px-4 font-medium">Dataset</th>
                <th className="py-4 px-4 font-medium">Mapped GPU</th>
                <th className="py-4 px-4 font-medium">Batch</th>
                <th className="py-4 px-4 font-medium">Status</th>
                <th className="py-4 px-4 font-medium">Est. Cost (₹)</th>
                <th className="py-4 px-4 font-medium text-right rounded-tr-lg">Timestamp</th>
                <th className="py-4 px-4 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {jobHistory.length > 0 ? jobHistory.map((job) => (
                <tr key={job.job_id} className="border-b border-dark-800/50 hover:bg-dark-800/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-white tracking-wide">{job.model_name}</td>
                  <td className="py-4 px-4 text-dark-300 font-medium">{job.dataset}</td>
                  <td className="py-4 px-4">
                    <span className="bg-gradient-to-r from-dark-800 to-dark-900 border border-dark-600 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">
                      {job.suggested_gpu}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-dark-400">{job.batch_size}</td>
                  <td className="py-4 px-4">
                    <select
                      value={job.status || 'queued'}
                      onChange={(e) => handleStatusChange(job.job_id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded border capitalize bg-dark-900 cursor-pointer ${statusColors[job.status] || statusColors.queued}`}
                    >
                      {['queued', 'running', 'completed', 'failed', 'cancelled'].map((s) => (
                        <option key={s} value={s} className="bg-dark-900 text-white">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-4 font-mono text-secondary font-bold text-[15px]">{formatInr(job.estimated_cost)}</td>
                  <td className="py-4 px-4 text-right text-dark-400">
                    {new Date(job.submitted_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleDelete(job.job_id)}
                      disabled={deletingId === job.job_id}
                      className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title="Delete job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-dark-400 text-base">
                    No training jobs found in the database.
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
