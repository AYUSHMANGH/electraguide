import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, BrainCircuit, Flag, CheckCircle2, GraduationCap } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Flag },
    { path: '/assistant', label: 'AI Assistant', icon: BrainCircuit },
    { path: '/timeline', label: 'Timeline', icon: GraduationCap },
    { path: '/quiz', label: 'Quiz Mode', icon: CheckCircle2 },
    { path: '/eligibility', label: 'Eligibility', icon: MapPin },
    { path: '/map', label: 'Local Map', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Premium Glassmorphism Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" aria-label="Go to Home" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  E
                </div>
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                  ElectraGuide
                </span>
              </Link>
            </div>
            
            <div className="hidden sm:flex sm:items-center sm:space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-label={`Navigate to ${item.label}`}
                    className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'text-primary-700' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={isActive ? 'text-primary-600' : ''} />
                      {item.label}
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t-full"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="py-6 text-center text-slate-500 text-sm border-t border-slate-200 mt-auto">
        <p>ElectraGuide - Empowering voters through AI</p>
      </footer>
    </div>
  );
};

export default Layout;
