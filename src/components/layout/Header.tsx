import React from 'react';

type View = 'dashboard' | 'loans' | 'clients';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onNewLoan: () => void;
}

const NAV_ITEMS: { id: View; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard',   icon: 'layout-dashboard' },
  { id: 'loans',     label: 'Préstamos',   icon: 'file-invoice'     },
  { id: 'clients',   label: 'Clientes',    icon: 'users'            },
];

export default function Header({ currentView, onViewChange, onNewLoan }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm hidden sm:block">
            Cobranzas Pro
          </span>
        </div>

        {/* Nav tabs */}
        <nav className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${currentView === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}
              `}
            >
              <span className="hidden sm:inline">{item.label}</span>
              {/* Ícono en mobile */}
              <span className="sm:hidden">{item.label.charAt(0)}</span>
            </button>
          ))}
        </nav>

        {/* CTA */}
        <button
          onClick={onNewLoan}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white
                     text-sm font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nuevo préstamo</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>
    </header>
  );
}
