import DeveloperCard from './DeveloperCard';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const hideHeader = pathname === '/chat';
  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && (
        <header className="w-full px-5 sm:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="hover:opacity-90"><Logo /></Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/safety" className="px-3 py-2 rounded-xl hover:bg-white/5">Safety</Link>
            <Link to="/terms" className="px-3 py-2 rounded-xl hover:bg-white/5 hidden sm:inline">Terms</Link>
            <Link to="/privacy" className="px-3 py-2 rounded-xl hover:bg-white/5 hidden sm:inline">Privacy</Link>
          </nav>
        </header>
      )}
      <main className="flex-1 flex flex-col">{children}</main>
      {!hideHeader && (
               <footer className="text-xs text-slate-400 px-6 py-6 text-center space-y-3">
          <div>IndiaomeTV is intended for adults aged 18 and over.</div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/terms" className="hover:text-slate-200">Terms</Link>
            <Link to="/privacy" className="hover:text-slate-200">Privacy</Link>
            <Link to="/safety" className="hover:text-slate-200">Community Guidelines</Link>
          </div>
          <DeveloperCard compact />
        </footer>
      )}
    </div>
  );
}
