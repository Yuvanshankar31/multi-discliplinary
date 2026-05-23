import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, Server, Zap, Globe, Layers, Cpu, Compass } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { formatInr, formatInrPerHour } from '../utils/currency';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function NewJob() {
  const [formData, setFormData] = useState({
    model_name: 'ResNet50',
    dataset: 'CIFAR-10',
    epochs: 50,
    gpu_type: 'A100',
    batch_size: 32,
    cloud_model: 'IaaS', // Default selection
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
        cloud_model: formData.cloud_model, // Pass cloud model
      });
      const res = await axios.get(`${API_BASE_URL}/estimate?${params}`);
      setEstimatePreview(res.data.by_gpu);
    } catch {
      setEstimatePreview(null);
    }
  }, [formData]);

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

  const selectCloudModel = (model) => {
    setFormData(prev => ({
      ...prev,
      cloud_model: model
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

  // Cloud Service Model Cards data
  const cloudModels = [
    {
      id: 'IaaS',
      name: 'IaaS (Infrastructure)',
      desc: 'Bare-metal VM / EC2. Full cluster control. Lowest base compute billing.',
      overhead: '1.0x price',
      icon: Cpu,
      color: 'text-primary border-primary/20 hover:border-primary/50'
    },
    {
      id: 'PaaS',
      name: 'PaaS (Platform)',
      desc: 'Managed ML platform (SageMaker/Vertex). Automates image setup & containers.',
      overhead: '1.35x price',
      icon: Layers,
      color: 'text-secondary border-secondary/20 hover:border-secondary/50'
    },
    {
      id: 'SaaS',
      name: 'SaaS (Serverless API)',
      desc: 'Hosted fine-tuning API (Hugging Face / OpenAI). 15% faster warmup.',
      overhead: '2.20x price',
      icon: Globe,
      color: 'text-accent-fuchsia border-accent-fuchsia/20 hover:border-accent-fuchsia/50'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8 max-w-5xl mx-auto py-4"
    >
      <header className="mb-2 text-center md:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight">Submit <span className="gradient-text font-black">Training Job</span></h1>
        <p className="text-dark-400 mt-2">Scale pipelines intelligently by matching machine metrics to hardware and cloud layers.</p>
      </header>

      <section className="glass-panel p-8 border border-dark-700/30 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
          
          {/* Cloud Service Model Selection Section */}
          <div className="mb-4">
            <label className="block text-sm font-bold uppercase tracking-wider text-dark-300 mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary" />
              1. Cloud Service Architecture
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {cloudModels.map((model) => {
                const IconComp = model.icon;
                const isSelected = formData.cloud_model === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => selectCloudModel(model.id)}
                    className={`text-left p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-dark-800/80 text-white border-primary shadow-glow-primary scale-[1.01]' 
                        : 'bg-dark-900/30 text-dark-400 hover:text-white border-dark-700/50 hover:bg-dark-900/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-primary/10 text-primary' : 'bg-dark-800 text-dark-400'} border border-dark-700`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-extrabold uppercase border ${
                          isSelected 
                            ? 'bg-primary/10 border-primary/30 text-primary' 
                            : 'bg-dark-800 border-dark-700 text-dark-400'
                        }`}>
                          {model.overhead}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-[15px] mb-1.5 text-white">{model.name}</h4>
                      <p className="text-xs text-dark-400 leading-relaxed">{model.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-dark-300 mb-2">2. Model Topology</label>
              <select 
                name="model_name" 
                value={formData.model_name}
                onChange={handleInputChange}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              >
                <option value="ResNet50">ResNet-50 (CV Baseline)</option>
                <option value="BERT">BERT-Base (Transformer NLP)</option>
                <option value="YOLOv8">YOLOv8 (Real-Time Object Detection)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-dark-300 mb-2">3. Mapped Dataset</label>
              <select 
                name="dataset" 
                value={formData.dataset}
                onChange={handleInputChange}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              >
                <option value="CIFAR-10">CIFAR-10 (Small Dataset)</option>
                <option value="ImageNet">ImageNet 1k (Large Image Corpus)</option>
                <option value="WikiText">WikiText-103 (Medium Text Library)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-dark-300">4. Epochs</label>
                <span className="text-sm font-mono text-primary font-bold">{formData.epochs} Epochs</span>
              </div>
              <input 
                type="range" 
                name="epochs"
                min="10"
                max="100"
                step="5"
                value={formData.epochs}
                onChange={handleInputChange}
                className="w-full h-2 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-primary border border-dark-700/50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-dark-300 mb-2">5. Batch Size</label>
              <div className="grid grid-cols-4 gap-2">
                {[16, 32, 64, 128].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFormData({...formData, batch_size: size})}
                    className={`py-3.5 rounded-xl border text-sm font-bold font-mono transition-all ${
                      formData.batch_size === size 
                        ? 'bg-primary/10 border-primary text-primary shadow-[0_0_12px_rgba(59,130,246,0.2)]' 
                        : 'bg-dark-950 border-dark-700 text-dark-400 hover:border-dark-600 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time comparison preview */}
          {estimatePreview && (
            <div className="rounded-2xl border border-dark-700/60 bg-dark-950/70 p-5 mt-2 flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-dark-400">Live Architecture Mappings & Cost Estimates:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['T4', 'A100'].map((gpu) => {
                  const isActive = formData.gpu_type === gpu;
                  return (
                    <div 
                      key={gpu} 
                      className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                        isActive 
                          ? 'bg-primary/5 border-primary/30' 
                          : 'bg-dark-900/40 border-dark-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'bg-dark-800 text-dark-400'}`}>
                          <Server className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-extrabold text-[15px] text-white block">NVIDIA {gpu}</span>
                          <span className="text-xs text-dark-400">({formData.cloud_model} Cloud)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-secondary font-mono font-bold text-base block">
                          {estimatePreview[gpu]?.cost_usd == null ? '—' : formatInr(estimatePreview[gpu]?.cost_usd)}
                        </span>
                        <span className="text-dark-400 text-xs font-medium">({estimatePreview[gpu]?.time_hours ?? '—'} hrs predicted)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-dark-300 mb-3 flex justify-between items-center">
              <span>6. Target Machine Bind</span>
              <span className="text-xs font-bold text-secondary animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Live AWS Pricing Integrated
              </span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {['T4', 'A100'].map(gpu => (
                <button
                  key={gpu}
                  type="button"
                  onClick={() => setFormData({...formData, gpu_type: gpu})}
                  className={`py-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    formData.gpu_type === gpu 
                      ? 'bg-primary/10 border-primary text-primary shadow-glow-primary scale-[1.01]' 
                      : 'bg-dark-950 border-dark-700 text-dark-400 hover:border-dark-600 hover:text-white'
                  }`}
                >
                  <Server className="w-6 h-6 mb-2" />
                  <span className="font-extrabold text-sm">NVIDIA {gpu}</span>
                  {livePrices[gpu] !== null ? (
                    <span className="text-xs font-mono mt-1 font-semibold opacity-90 text-secondary-light">{formatInrPerHour(livePrices[gpu])}</span>
                  ) : (
                    <span className="text-xs mt-1 opacity-50 font-medium">Synchronizing AWS...</span>
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
            className="mt-4 w-full bg-gradient-to-r from-primary via-accent-violet to-accent-fuchsia text-white font-extrabold py-4.5 px-4 rounded-xl transition-all shadow-glow-primary flex items-center justify-center gap-2 group border border-primary/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                SIMULATE & ROUTE INFRASTRUCTURE
              </>
            )}
          </motion.button>
        </form>
      </section>

      {/* AI Cost Optimization Result Panel */}
      {jobStatus && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 border-l-4 border-l-secondary relative overflow-hidden bg-dark-900/60"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
            <div>
              <h3 className="text-xl font-extrabold flex items-center gap-2 text-white">
                <Activity className="text-secondary w-5.5 h-5.5 shadow-glow-secondary animate-pulse" />
                AI Cost Router Optimization Result
              </h3>
              <p className="text-dark-400 text-xs mt-1">
                Allocated Reference ID: <span className="font-mono text-dark-300 font-bold bg-dark-950 px-2 py-0.5 rounded border border-dark-700">{jobStatus.job_id}</span>
              </p>
            </div>
            <div className="text-right flex flex-col">
              <p className="text-xs font-bold uppercase tracking-wider text-dark-400">Optimized Compute Cost</p>
              <p className="text-3xl font-black text-secondary-light">
                {formatInr(jobStatus.optimization.estimated_cost_usd)}
              </p>
              <span className="text-[10px] font-mono text-dark-400">({jobStatus.optimization.estimated_time_hours ?? '—'} Hours Run)</span>
            </div>
          </div>
          
          <div className="mt-6 bg-dark-950 rounded-2xl p-5 border border-dark-700/50 flex gap-4 items-center relative z-10">
            <div className="p-3 bg-secondary/10 border border-secondary/20 text-secondary rounded-xl shadow-glow-secondary">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-extrabold text-[15px]">{jobStatus.optimization.reason}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs text-dark-400">Binding optimized route:</span>
                <span className="text-xs font-extrabold text-white px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-md">
                  {jobStatus.optimization.suggested_cloud} Cloud
                </span>
                <span className="text-xs text-dark-400">on</span>
                <span className="text-xs font-extrabold text-white px-2.5 py-1 bg-secondary/10 border border-secondary/20 rounded-md">
                  NVIDIA {jobStatus.optimization.suggested_gpu} GPU
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
