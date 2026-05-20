import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav.jsx';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-shell">
        <Header onMenuClick={() => setMenuOpen(true)} />
        <main className="page-shell">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
