import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, HardDrive, IndianRupee } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { formatInr } from '../utils/currency';

const API_BASE_URL = 'http://localhost:8000';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ gpu: [], cpu: [], time: [] });
  const [jobHistory, setJobHistory] = useState([]);

  useEffect(() => {
    // Start metrics polling
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/metrics`);
        const now = new Date(res.data.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
        
        setMetrics(prev => {
          const newTime = [...prev.time, now].slice(-10);
          const newGpu = [...prev.gpu, res.data.gpu_utilization].slice(-10);
          const newCpu = [...prev.cpu, res.data.cpu_utilization].slice(-10);
          return { time: newTime, gpu: newGpu, cpu: newCpu };
        });
      } catch (e) {
        // Ignore silent fails
      }
    }, 2000);

    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/jobs`);
        setJobHistory(res.data.jobs);
      } catch (err) { }
    };
    fetchJobs();
    
    return () => clearInterval(interval);
  }, []);

  const currentJob = jobHistory.length > 0 ? jobHistory[0] : null;

  const gpuUsageData = {
    labels: metrics.time.length ? metrics.time : ['Loading...'],
    datasets: [
      {
        label: 'GPU Utilization (%)',
        data: metrics.gpu.length ? metrics.gpu : [0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'CPU Utilization (%)',
        data: metrics.cpu.length ? metrics.cpu : [0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const costBreakdownData = {
    labels: ['Compute (GPU)', 'Storage', 'Network'],
    datasets: [
      {
        data: [85, 10, 5],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        borderWidth: 0,
      }
    ]
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Active <span className="gradient-text">Telemetry</span></h1>
        <p className="text-dark-400 mt-2">Live hardware monitoring and cluster status.</p>
      </header>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-primary" />
          </div>
          <p className="text-dark-400 text-sm font-medium mb-1 relative z-10">Total History</p>
          <p className="text-3xl font-bold relative z-10">{jobHistory.length} Jobs</p>
        </div>
        
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IndianRupee className="w-16 h-16 text-secondary" />
          </div>
          <p className="text-dark-400 text-sm font-medium mb-1 relative z-10">Latest Est. Cost</p>
          <p className="text-3xl font-bold text-secondary relative z-10">
            {currentJob ? formatInr(currentJob.estimated_cost) : formatInr(0)}
          </p>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <HardDrive className="w-16 h-16 text-fuchsia-500" />
          </div>
          <p className="text-dark-400 text-sm font-medium mb-1 relative z-10">Live GPU Util</p>
          <p className="text-3xl font-bold relative z-10">{metrics.gpu.length ? metrics.gpu[metrics.gpu.length - 1] : 0}%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <div className="glass-panel p-5 flex flex-col">
          <h3 className="text-sm font-medium text-dark-300 mb-4">Simulated Telemetry Feed</h3>
          <div className="flex-1 relative min-h-[300px]">
            <Line 
              data={gpuUsageData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)' } } },
                scales: { 
                  y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
                  x: { grid: { display: false }, ticks: { color: '#888' } }
                }
              }} 
            />
          </div>
        </div>

        <div className="glass-panel p-5 flex flex-col">
          <h3 className="text-sm font-medium text-dark-300 mb-4">Cost Distribution</h3>
          <div className="flex-1 relative min-h-[300px] flex items-center justify-center">
            <div className="w-64 h-64">
              <Doughnut 
                data={costBreakdownData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)' } } },
                  cutout: '75%'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
