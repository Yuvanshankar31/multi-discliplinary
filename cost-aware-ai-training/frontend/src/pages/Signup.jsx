import axios from 'axios';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Server, ShieldCheck, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all registration parameters.');
      return;
    }

    if (!email.includes('@') || email.length < 5) {
      setError('Invalid email address formatting.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Credentials mismatch. Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        email: email.trim(),
        password: password.trim()
      });

      setSuccess('User profile created. Database registered successfully.');
      
      // Delay redirection slightly for premium feedback feel
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Database connection error. Ensure the cluster API is online.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative overflow-hidden py-12">
      {/* Decorative interactive background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-primary to-accent-fuchsia rounded-2xl border border-primary/20 shadow-glow-primary mb-4 animate-float">
            <Server className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">Create <span className="gradient-text font-black">Cluster Account</span></h2>
          <p className="text-dark-400 text-sm mt-2 font-medium">Join the cost-aware training infrastructure platform.</p>
        </div>

        <div className="glass-panel p-8 border border-dark-700/40 relative shadow-2xl overflow-hidden bg-dark-900/40 backdrop-blur-2xl rounded-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <form onSubmit={handleSignup} className="flex flex-col gap-5 relative z-10">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-bold leading-relaxed"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary/10 border border-secondary/20 text-secondary-light px-4 py-3 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 shadow-glow-secondary animate-pulse" />
                {success}
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-700/80 hover:border-dark-600 focus:border-primary rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2">Choose Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-700/80 hover:border-dark-600 focus:border-primary rounded-2xl pl-12 pr-12 py-3.5 text-sm text-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-700/80 hover:border-dark-600 focus:border-primary rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full bg-gradient-to-r from-primary to-accent-fuchsia text-white font-extrabold py-4 px-4 rounded-2xl transition-all shadow-glow-primary flex items-center justify-center gap-2 group border border-primary/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  REGISTER DATABASE PROFILE <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs text-dark-400 mt-6 font-bold">
          Already have a cluster profile?{' '}
          <Link to="/login" className="text-primary hover:text-primary-light transition-colors underline underline-offset-4">
            Log In here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
