import { memo, useMemo, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, BrainCircuit, Flag, CheckCircle2, GraduationCap, Menu, X } from 'lucide-react';

/**
 * Root layout component. Renders the top navigation bar, page content outlet,
 * and footer. Memoized to avoid re-renders when child routes change.
 */
const Layout = memo(() => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  /** Navigation items — memoized so the array reference is stable */
  const navItems = useMemo(() => [
    { path: '/',            label: 'Home',         icon: Flag },
    { path: '/assistant',   label: 'AI Assistant', icon: BrainCircuit },
    { path: '/timeline',    label: 'Timeline',     icon: GraduationCap },
    { path: '/quiz',        label: 'Quiz Mode',    icon: CheckCircle2 },
    { path: '/eligibility', label: 'Eligibility',  icon: MapPin },
    { path: '/map',         label: 'Local Map',    icon: MapPin },
  ], []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ── Skip-to-content link (Accessibility) ── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* ── Top Navigation Bar ── */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="sticky top-0 z-50 glass border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" aria-label="ElectraGuide — go to homepage" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl shadow-lg" aria-hidden="true">
                  E
                </div>
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                  ElectraGuide
                </span>
              </Link>
            </div>

            {/* Desktop nav links */}
            <div className="hidden sm:flex sm:items-center sm:space-x-1" role="list">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    role="listitem"
                    aria-label={`Navigate to ${item.label}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isActive
                        ? 'text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={isActive ? 'text-primary-600' : ''} aria-hidden="true" />
                      {item.label}
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t-full"
                        initial={false}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile hamburger */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((o) => !o)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div id="mobile-menu" className="sm:hidden border-t border-slate-200 bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobile}
                    aria-label={`Navigate to ${item.label}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={20} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* ── Main Content ── */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
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

      <footer role="contentinfo" className="py-6 text-center text-slate-500 text-sm border-t border-slate-200 mt-auto">
        <p>ElectraGuide — Empowering voters through AI</p>
      </footer>
    </div>
  );
});

Layout.displayName = 'Layout';
export default Layout;
