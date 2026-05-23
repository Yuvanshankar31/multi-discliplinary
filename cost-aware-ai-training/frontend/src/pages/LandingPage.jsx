import { motion } from 'framer-motion';
import { ArrowRight, IndianRupee, Server, ShieldCheck, Zap, Cpu, Network } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const features = [
    { 
      title: 'Live Spot Pricing Engine', 
      description: 'Integrates raw EC2 instance pricing APIs to fetch instantaneous spot market fluctuations for maximum scheduling precision.', 
      icon: IndianRupee,
      color: 'text-secondary' 
    },
    { 
      title: 'Multimodal Hardware Router', 
      description: 'Heuristically shifts pipelines between Nvidia A100s and T4 Tensor cores to balance latency requirements against strict budgets.', 
      icon: Server,
      color: 'text-primary' 
    },
    { 
      title: 'ML Cost Predictor', 
      description: 'Dual Random Forest models evaluate batch parameters, model architectures, and cloud types to forecast compute billing.', 
      icon: Zap,
      color: 'text-accent-fuchsia' 
    },
    { 
      title: 'Dynamic Stopping Guard', 
      description: 'Simulates automatic early-stopping when learning curves flatten, halting execution to prevent wasted cloud spending.', 
      icon: ShieldCheck,
      color: 'text-accent-violet' 
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative overflow-hidden py-12">
      {/* Decorative Interactive Background Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-4xl"
      >
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-dark-900/60 backdrop-blur-xl text-sm font-semibold text-primary shadow-[0_0_20px_rgba(59,130,246,0.15)] animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-glow-secondary" />
          SYSTEM LIVE • AUTOMATED ROUTING ENGINE ACTIVE
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Smarter AI Infrastructure, <br className="hidden md:block"/>
          <span className="gradient-text font-black">
            Fraction of the Cost.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          The ultimate intelligent training orchestrator. Deploy pipelines across **IaaS, PaaS, or SaaS**, forecast spot billing with scikit-learn regressor telemetry, and let AI automatically swap instances to fit your target budget.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link to="/new-job">
            <motion.button 
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-primary to-accent-violet text-white px-10 py-4.5 rounded-2xl font-bold flex items-center gap-2.5 shadow-glow-primary transition-all border border-primary/30"
            >
              Start Optimization <ArrowRight className="w-5 h-5 animate-pulse" />
            </motion.button>
          </Link>
          <Link to="/dashboard">
            <motion.button 
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-dark-900/80 hover:bg-dark-800 border border-dark-700/80 hover:border-dark-600 text-white px-10 py-4.5 rounded-2xl font-semibold transition-all backdrop-blur-md shadow-lg"
            >
              View Telemetry Feed
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Cluster Overview Widget Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-panel w-full max-w-5xl mt-16 p-6 flex flex-wrap items-center justify-around gap-6 text-left border border-dark-700/40 relative"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-primary">
            <Cpu className="w-6 h-6 shadow-glow-primary" />
          </div>
          <div>
            <p className="text-xs text-dark-400 font-bold uppercase tracking-wider">Cluster Capacity</p>
            <p className="text-lg font-extrabold text-white">48x NVIDIA H100/A100</p>
          </div>
        </div>
        
        <div className="h-10 w-[1px] bg-dark-700/50 hidden md:block" />

        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary/10 rounded-xl border border-secondary/20 text-secondary">
            <Network className="w-6 h-6 shadow-glow-secondary" />
          </div>
          <div>
            <p className="text-xs text-dark-400 font-bold uppercase tracking-wider">Global Nodes Speed</p>
            <p className="text-lg font-extrabold text-secondary-light">99.98% High-Throughput</p>
          </div>
        </div>

        <div className="h-10 w-[1px] bg-dark-700/50 hidden md:block" />

        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent-violet/10 rounded-xl border border-accent-violet/20 text-accent-violet">
            <ShieldCheck className="w-6 h-6 shadow-glow-fuchsia" />
          </div>
          <div>
            <p className="text-xs text-dark-400 font-bold uppercase tracking-wider">Optimization Heuristics</p>
            <p className="text-lg font-extrabold text-accent-fuchsia">Dynamic Slack Routing</p>
          </div>
        </div>
      </motion.div>

      {/* Futuristic Feature Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 w-full max-w-5xl relative z-10"
      >
        {features.map((opt, idx) => (
          <div 
            key={idx} 
            className="glass-panel p-6 text-left hover:-translate-y-2.5 transition-all duration-300 shadow-xl border border-dark-700/30 group relative hover:border-primary/20 overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-xl bg-dark-800/80 border border-dark-700/60 flex items-center justify-center mb-5 group-hover:border-primary/30 transition-colors shadow-inner">
              <opt.icon className={`${opt.color} w-5 h-5`} />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2 group-hover:text-primary transition-colors">{opt.title}</h3>
            <p className="text-dark-400 text-sm leading-relaxed">{opt.description}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

 

