import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, Server, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { formatInr, formatInrPerHour } from '../utils/currency';

const API_BASE_URL = 'http://localhost:8000';

export default function NewJob() {
  const [formData, setFormData] = useState({
    model_name: 'ResNet50',
    dataset: 'CIFAR-10',
    epochs: 50,
    gpu_type: 'A100',
    batch_size: 32,
  });

  const [jobStatus, setJobStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [livePrices, setLivePrices] = useState({ T4: null, A100: null });
  const [estimatePreview, setEstimatePreview] = useState(null);

  const fetchEstimate = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        model_name: formData.model_name,
        dataset: formData.dataset,
        epochs: String(formData.epochs),
        gpu_type: formData.gpu_type,
        batch_size: String(formData.batch_size),
      });
      const res = await axios.get(`${API_BASE_URL}/estimate?${params}`);
      setEstimatePreview(res.data.by_gpu);
    } catch {
      setEstimatePreview(null);
    }
  }, [formData.model_name, formData.dataset, formData.epochs, formData.gpu_type, formData.batch_size]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/pricing`);
        setLivePrices(res.data.prices);
      } catch (err) { }
    };
    fetchPrices();
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchEstimate, 400);
    return () => clearTimeout(t);
  }, [fetchEstimate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'epochs' || name === 'batch_size' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/jobs/submit`, formData);
      setJobStatus(response.data);
    } catch (error) {
      alert("Failed to submit job. Ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 max-w-4xl mx-auto"
    >
      <header className="mb-4 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Submit <span className="gradient-text">Training Job</span></h1>
        <p className="text-dark-400 mt-2">Configure model parameters and target hardware.</p>
      </header>

      <section className="glass-panel p-6 lg:col-span-1 border border-dark-700/50 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Model Topology</label>
              <select 
                name="model_name" 
                value={formData.model_name}
                onChange={handleInputChange}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              >
                <option value="ResNet50">ResNet-50</option>
                <option value="BERT">BERT-Base</option>
                <option value="YOLOv8">YOLOv8</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Dataset</label>
              <select 
                name="dataset" 
                value={formData.dataset}
                onChange={handleInputChange}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              >
                <option value="CIFAR-10">CIFAR-10</option>
                <option value="ImageNet">ImageNet (1k)</option>
                <option value="WikiText">WikiText-103</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Epochs</label>
              <input 
                type="number" 
                name="epochs"
                value={formData.epochs}
                onChange={handleInputChange}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Batch Size</label>
              <input 
                type="number" 
                name="batch_size"
                value={formData.batch_size}
                onChange={handleInputChange}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          {estimatePreview && (
            <div className="rounded-xl border border-dark-600 bg-dark-800/50 p-4 flex flex-wrap gap-4 items-center">
              <span className="text-sm font-medium text-dark-400">Estimated cost & time:</span>
              {['T4', 'A100'].map((gpu) => (
                <div key={gpu} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${formData.gpu_type === gpu ? 'bg-primary/15 border border-primary/30' : 'bg-dark-900 border border-dark-700'}`}>
                  <Server className="w-4 h-4 text-dark-400" />
                  <span className="font-semibold text-white">{gpu}</span>
                  <span className="text-secondary font-mono font-bold">
                    {estimatePreview[gpu]?.cost_usd == null ? '—' : formatInr(estimatePreview[gpu]?.cost_usd)}
                  </span>
                  <span className="text-dark-400 text-xs">({estimatePreview[gpu]?.time_hours ?? '—'} hrs)</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2">
            <label className="block text-sm font-medium text-dark-300 mb-1.5 flex justify-between">
              <span>Target GPU</span>
              <span className="text-xs text-primary animate-pulse">Live AWS Pricing</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {['T4', 'A100'].map(gpu => (
                <button
                  key={gpu}
                  type="button"
                  onClick={() => setFormData({...formData, gpu_type: gpu})}
                  className={`py-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    formData.gpu_type === gpu 
                      ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                      : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-600'
                  }`}
                >
                  <Server className="w-6 h-6 mb-2" />
                  <span className="font-semibold text-sm">NVIDIA {gpu}</span>
                  {livePrices[gpu] !== null ? (
                    <span className="text-xs font-mono mt-1 opacity-80">{formatInrPerHour(livePrices[gpu])}</span>
                  ) : (
                    <span className="text-xs mt-1 opacity-50">Loading AWS...</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit" 
            disabled={isLoading}
            className="mt-6 w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Simulate & Optimize Infrastructure
              </>
            )}
          </motion.button>
        </form>
      </section>

      {jobStatus && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 border-l-4 border-l-secondary"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity className="text-secondary w-5 h-5" />
                AI Cost Optimization Result
              </h3>
              <p className="text-dark-300 text-sm mt-1">
                Job ID: <span className="font-mono text-dark-400">{jobStatus.job_id}</span>
              </p>
            </div>
            <div className="text-right flex flex-col gap-1">
              <div>
                <p className="text-sm text-dark-400">Predicted AI Cost</p>
                <p className="text-2xl font-bold text-secondary">
                  {formatInr(jobStatus.optimization.estimated_cost_usd)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-5 bg-dark-900 rounded-lg p-4 border border-dark-700/50 flex gap-4 items-center">
            <div className="p-3 bg-secondary/10 border border-secondary/20 text-secondary rounded-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-medium">{jobStatus.optimization.reason}</p>
              <p className="text-sm text-dark-300 mt-1">
                Final hardware binding: <span className="text-white font-bold px-2 py-0.5 bg-dark-800 rounded">{jobStatus.optimization.suggested_gpu}</span>.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
