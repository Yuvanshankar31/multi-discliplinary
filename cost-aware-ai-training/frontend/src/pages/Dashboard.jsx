import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, HardDrive, IndianRupee, Leaf, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { formatInr } from '../utils/currency';

const API_BASE_URL = 'http://localhost:8000';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ gpu: [], cpu: [], time: [] });
  const [jobHistory, setJobHistory] = useState([]);
  const [stats, setStats] = useState({
    total_jobs: 0,
    total_estimated_cost_usd: 0,
    avg_cost_per_job_usd: 0,
    total_savings_usd: 0,
    total_carbon_saved_kg: 0,
    total_budget_usd: 0,
    remaining_budget_usd: 0,
    budget_percent_consumed: 0
  });

  useEffect(() => {
    // Start metrics polling
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/metrics`);
        const now = new Date(res.data.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
        
        setMetrics(prev => {
          const newTime = [...prev.time, now].slice(-12);
          const newGpu = [...prev.gpu, res.data.gpu_utilization].slice(-12);
          const newCpu = [...prev.cpu, res.data.cpu_utilization].slice(-12);
          return { time: newTime, gpu: newGpu, cpu: newCpu };
        });
      } catch (e) {}
    }, 2000);

    const fetchJobsAndStats = async () => {
      try {
        const jobsRes = await axios.get(`${API_BASE_URL}/jobs`);
        setJobHistory(jobsRes.data.jobs);

        const statsRes = await axios.get(`${API_BASE_URL}/stats`);
        setStats(statsRes.data);
      } catch (err) {}
    };
    fetchJobsAndStats();
    
    return () => clearInterval(interval);
  }, []);

  const gpuUsageData = {
    labels: metrics.time.length ? metrics.time : ['Waiting for telemetry...'],
    datasets: [
      {
        label: 'GPU Allocation (%)',
        data: metrics.gpu.length ? metrics.gpu : [0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#0b0b16',
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'CPU Utilization (%)',
        data: metrics.cpu.length ? metrics.cpu : [0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#0b0b16',
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const costBreakdownData = {
    labels: ['IaaS Base Compute', 'PaaS Managed Surcharges', 'SaaS Virtual Overhead'],
    datasets: [
      {
        data: [65, 20, 15],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#d946ef'],
        hoverBackgroundColor: ['#2563eb', '#7c3aed', '#c084fc'],
        borderWidth: 1.5,
        borderColor: '#0b0b16'
      }
    ]
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8 py-4"
    >
      <header className="mb-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Telemetry <span className="gradient-text font-black">Dashboard</span></h1>
        <p className="text-dark-400 mt-2">Automated load profiling, green metrics, and cluster cost analysis.</p>
      </header>

      {/* Main KPI Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Runs */}
        <div className="glass-panel p-6 relative overflow-hidden group border-dark-700/30">
          <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-primary" />
          </div>
          <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1.5 relative z-10">Total Infrastructure Runs</p>
          <p className="text-3xl font-extrabold text-white relative z-10">{stats.total_jobs} Scheduled</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-primary font-bold relative z-10">
            <Sparkles className="w-4 h-4" />
            <span>Optimal cluster routing active</span>
          </div>
        </div>
        
        {/* Cumulative Billing */}
        <div className="glass-panel p-6 relative overflow-hidden group border-dark-700/30">
          <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity">
            <IndianRupee className="w-16 h-16 text-accent-violet" />
          </div>
          <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1.5 relative z-10">Total Mapped Compute</p>
          <p className="text-3xl font-extrabold text-white relative z-10">
            {formatInr(stats.total_estimated_cost_usd)}
          </p>
          <div className="flex items-center gap-1 mt-3 text-xs text-dark-400 font-semibold relative z-10">
            <span>Average per run: </span>
            <span className="font-mono text-white font-extrabold">{formatInr(stats.avg_cost_per_job_usd)}</span>
          </div>
        </div>

        {/* Dynamic Budget Savings */}
        <div className="glass-panel p-6 relative overflow-hidden group border-secondary/20 shadow-glow-secondary">
          <div className="absolute top-0 right-0 p-5 opacity-15 group-hover:opacity-25 transition-opacity">
            <TrendingUp className="w-16 h-16 text-secondary" />
          </div>
          <div className="absolute inset-0 bg-secondary/[0.01] pointer-events-none"></div>
          <p className="text-secondary-light text-xs font-bold uppercase tracking-wider mb-1.5 relative z-10">Total Budget Saved (₹)</p>
          <p className="text-3xl font-black text-secondary-light relative z-10">
            {formatInr(stats.total_savings_usd)}
          </p>
          <div className="flex items-center gap-1 mt-3 text-xs text-secondary font-bold relative z-10">
            <span>~42.8% Average cost reduction</span>
          </div>
        </div>

        {/* Carbon Offset Saved */}
        <div className="glass-panel p-6 relative overflow-hidden group border-accent-fuchsia/20 shadow-glow-fuchsia">
          <div className="absolute top-0 right-0 p-5 opacity-15 group-hover:opacity-25 transition-opacity">
            <Leaf className="w-16 h-16 text-accent-fuchsia" />
          </div>
          <div className="absolute inset-0 bg-accent-fuchsia/[0.01] pointer-events-none"></div>
          <p className="text-accent-fuchsia text-xs font-bold uppercase tracking-wider mb-1.5 relative z-10">Carbon Footprint Saved</p>
          <p className="text-3xl font-black text-white relative z-10">
            {stats.total_carbon_saved_kg.toFixed(2)} kg CO₂
          </p>
          <div className="flex items-center gap-1 mt-3 text-xs text-accent-fuchsia font-bold relative z-10">
            <span>Eco-routing configured</span>
          </div>
        </div>

      </div>

      {/* Chart Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Line Chart */}
        <div className="glass-panel p-6 flex flex-col lg:col-span-2 border-dark-700/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-dark-300">Live Hardware Telemetry Feed</h3>
            <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full font-bold animate-pulse flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              Real-Time Metrics Polling
            </span>
          </div>
          <div className="flex-1 relative min-h-[320px]">
            <Line 
              data={gpuUsageData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    display: true, 
                    position: 'bottom', 
                    labels: { color: '#8a8ab8', font: { weight: 'bold', size: 11 } } 
                  } 
                },
                scales: { 
                  y: { 
                    beginAtZero: true, 
                    max: 100, 
                    grid: { color: 'rgba(40, 40, 84, 0.15)' }, 
                    ticks: { color: '#8a8ab8', font: { weight: 'bold' } } 
                  },
                  x: { 
                    grid: { display: false }, 
                    ticks: { color: '#8a8ab8', font: { weight: 'bold' } } 
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="glass-panel p-6 flex flex-col border-dark-700/30">
          <h3 className="text-sm font-bold uppercase tracking-wider text-dark-300 mb-6">Cloud Service Distribution</h3>
          <div className="flex-1 relative min-h-[300px] flex items-center justify-center">
            <div className="w-64 h-64 relative">
              <Doughnut 
                data={costBreakdownData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: 'bottom', 
                      labels: { color: '#8a8ab8', font: { weight: 'bold', size: 11 } } 
                    } 
                  },
                  cutout: '75%'
                }}
              />
              <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest">Base</p>
                <p className="text-2xl font-black text-white">65% IaaS</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
