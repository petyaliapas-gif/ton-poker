import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      nav(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark grid place-items-center shadow-glow-accent">
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-fg text-lg leading-none tracking-tight">FunPay</div>
              <div className="text-[10px] text-muted leading-none mt-0.5">marketplace</div>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4 sm:mx-8">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск игр, предметов, аккаунтов..."
                className="w-full bg-elevated border border-line rounded-xl pl-10 pr-4 py-2.5 text-sm text-fg placeholder-muted/50 outline-none focus:border-accent transition-colors"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-muted hover:text-fg transition-colors rounded-lg hover:bg-elevated">
              Каталог
            </Link>
            <Link to="/category/cs2" className="px-3 py-2 text-sm font-medium text-muted hover:text-fg transition-colors rounded-lg hover:bg-elevated">
              CS2
            </Link>
            <Link to="/category/dota2" className="px-3 py-2 text-sm font-medium text-muted hover:text-fg transition-colors rounded-lg hover:bg-elevated">
              Dota 2
            </Link>
            <div className="w-px h-6 bg-line mx-1" />
            <button className="btn-primary text-xs px-4 py-2">
              Войти
            </button>
          </nav>

          {/* Mobile menu */}
          <button
            className="md:hidden p-2 text-muted hover:text-fg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-line"
          >
            <div className="px-4 py-3 space-y-1 bg-surface">
              <Link to="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-muted hover:text-fg rounded-lg hover:bg-elevated">
                Каталог
              </Link>
              <Link to="/category/cs2" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-muted hover:text-fg rounded-lg hover:bg-elevated">
                CS2
              </Link>
              <Link to="/category/dota2" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-muted hover:text-fg rounded-lg hover:bg-elevated">
                Dota 2
              </Link>
              <Link to="/category/genshin" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-muted hover:text-fg rounded-lg hover:bg-elevated">
                Genshin Impact
              </Link>
              <Link to="/category/valorant" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-muted hover:text-fg rounded-lg hover:bg-elevated">
                Valorant
              </Link>
              <div className="pt-2">
                <button className="btn-primary w-full text-sm">Войти</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
