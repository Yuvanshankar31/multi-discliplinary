import { motion } from 'framer-motion';
import { Activity, ChevronRight, Cloud, LayoutDashboard, PlusCircle, Server } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Cloud },
    { path: '/dashboard', label: 'Monitor', icon: LayoutDashboard },
    { path: '/new-job', label: 'Submit Job', icon: PlusCircle },
    { path: '/history', label: 'History & Logs', icon: Activity }
  ];

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-64 min-h-screen bg-dark-900/80 border-r border-dark-800 backdrop-blur-xl flex flex-col hidden lg:flex fixed left-0 top-0 z-40"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 text-white mb-8">
          <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">Cost-Aware</h1>
            <p className="text-xs text-primary font-medium tracking-wide uppercase">AI Optimizer</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2 mt-4">Menu</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/');
            return (
              <Link key={item.path} to={item.path}>
                <motion.div 
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                      : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-dark-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6">
        <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl group-hover:blur-2xl transition-all"></div>
          <p className="text-xs text-dark-400 font-medium relative z-10">Status</p>
          <div className="flex items-center gap-2 mt-1 relative z-10">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-sm text-white font-medium">Nodes Online</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
