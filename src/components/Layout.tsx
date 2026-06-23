import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav.tsx';
import Header from './Header.tsx';
import Sidebar from './Sidebar.tsx';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell bg-background text-foreground">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-shell">
        <Header onMenuClick={() => setMenuOpen(true)} />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="page-shell"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}
