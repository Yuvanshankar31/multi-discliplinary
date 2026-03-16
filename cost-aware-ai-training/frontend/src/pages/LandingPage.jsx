import { motion } from 'framer-motion';
import { ArrowRight, IndianRupee, Server, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const features = [
    { title: 'Live AWS Spot Pricing', description: 'Integrate real-time AWS Boto3 APIs to fetch up-to-the-minute market rates for precise cost estimation.', icon: IndianRupee },
    { title: 'Smart Hardware Routing', description: 'Automatically redirect jobs from A100 to T4 GPUs if the workflow meets cost-saving heuristic thresholds.', icon: Server },
    { title: 'ML Prediction Engine', description: 'Dual Random Forest models predict execution time down to the minute based on dataset scale.', icon: Zap },
    { title: 'Early Stopping Guardrails', description: 'Simulates automatic halting of training jobs when loss plateaus to prevent wasted cloud span.', icon: ShieldCheck }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-700 bg-dark-800/50 backdrop-blur-sm text-sm font-medium text-dark-300 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          System Online • v2.0 Ready
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Smarter AI Infrastructure, <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-fuchsia-400">
            Fraction of the Cost.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          The all-in-one AI training orchestrator. Monitor GPU workloads, predict AWS costs instantly with Machine Learning, and automatically switch hardware to maximize your budget.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link to="/new-job">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
            >
              Start Optimization <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <Link to="/dashboard">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white px-8 py-4 rounded-xl font-medium transition-colors"
            >
              View Dashboard
            </motion.button>
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 w-full"
      >
        {features.map((opt, idx) => (
          <div key={idx} className="glass-panel p-6 text-left hover:-translate-y-2 transition-transform duration-300 shadow-xl border border-dark-700/50">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dark-800 to-dark-700 flex items-center justify-center mb-4 border border-dark-600">
              <opt.icon className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">{opt.title}</h3>
            <p className="text-dark-400 text-sm leading-relaxed">{opt.description}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

 

