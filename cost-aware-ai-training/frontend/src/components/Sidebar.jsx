import { motion } from 'framer-motion';
import { Activity, ChevronRight, Cloud, LayoutDashboard, PlusCircle, Server, LogOut, User, LogIn } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

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
      className="w-64 min-h-screen bg-dark-900/60 border-r border-dark-800 backdrop-blur-xl flex flex-col hidden lg:flex fixed left-0 top-0 z-40"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 text-white mb-8">
          <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-glow-primary">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white">Cost-Aware</h1>
            <p className="text-xs text-primary font-bold tracking-wide uppercase">AI Optimizer</p>
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
        {user ? (
          <div className="p-4 bg-dark-950 border border-dark-700/60 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2.5 mb-3.5 relative z-10">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                <User className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">Cluster User</p>
                <p className="text-xs text-white font-extrabold truncate" title={user.email}>{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-dark-900 hover:bg-red-500/10 border border-dark-800 hover:border-red-500/30 text-xs font-bold text-dark-300 hover:text-red-400 transition-all cursor-pointer relative z-10"
            >
              <LogOut className="w-3.5 h-3.5" />
              LOG OUT PROFILE
            </button>
          </div>
        ) : (
          <Link to="/login">
            <div className="p-4 bg-dark-950 border border-primary/20 shadow-glow-primary rounded-xl relative overflow-hidden group text-center hover:border-primary/40 transition-colors">
              <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none"></div>
              <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-2.5">System Offline</p>
              <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary hover:bg-primary-dark text-xs font-bold text-white transition-all cursor-pointer">
                <LogIn className="w-3.5 h-3.5" />
                ACCESS PORTAL
              </button>
            </div>
          </Link>
        )}
      </div>
    </motion.aside>
  );
}
