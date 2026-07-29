import React, { useRef, useEffect } from 'react';
import type { Loan, Client } from '../../types/loan.types';
import { formatCOP, formatDate } from '../../lib/loanCalculations';

type View = 'dashboard' | 'loans';
type SearchType = 'name' | 'date';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onNewLoan: () => void;
  searchQuery: string;
  searchType: SearchType;
  onSearchChange: (query: string) => void;
  onSearchTypeChange: (type: SearchType) => void;
  loans: Loan[];
  getClient: (id: string) => Client | undefined;
  onSelectLoan: (id: string) => void;
}

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'loans',     label: 'Préstamos' },
];

const STATUS_LABEL: Record<string, string> = {
  active: 'Activo', paid: 'Pagado', defaulted: 'En mora',
};
const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  paid: 'bg-blue-50 text-blue-700',
  defaulted: 'bg-red-50 text-red-700',
};

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function matchDateQuery(isoDate: string, query: string): boolean {
  const datePart = isoDate?.slice(0, 10);
  if (!datePart) return false;
  const [year, month, day] = datePart.split('-');
  const parts = query.split('/');
  if (parts.length === 1 && parts[0]) return day === parts[0];
  if (parts.length === 2) return day === parts[0] && month === parts[1];
  if (parts.length === 3) return day === parts[0] && month === parts[1] && year === parts[2];
  return false;
}

export default function Header({
  currentView, onViewChange, onNewLoan,
  searchQuery, searchType, onSearchChange, onSearchTypeChange,
  loans, getClient, onSelectLoan,
}: HeaderProps) {
  const [focused, setFocused] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const results = searchQuery
    ? loans.filter((l) => {
        if (searchType === 'name') {
          const client = getClient(l.client_id);
          return client?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return matchDateQuery(l.loan_date!, searchQuery);
      })
    : [];

  function handleDateChange(raw: string) {
    onSearchChange(formatDateInput(raw));
  }

  function handleSelect(loanId: string) {
    onSelectLoan(loanId);
    onSearchChange('');
    setFocused(false);
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

        {/* Logo */}
        <div className="shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
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
              {item.label}
            </button>
          ))}
        </nav>

        {/* Search */}
        <div ref={ref} className="relative flex items-center gap-1.5 flex-1 max-w-sm">
          <div className="relative flex-1">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchType === 'name' ? (
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onFocus={() => setFocused(true)}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg
                           focus:ring-2 focus:ring-blue-200 focus:outline-none focus:border-blue-300
                           bg-gray-50 focus:bg-white transition-colors"
              />
            ) : (
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/AAAA"
                value={searchQuery}
                onFocus={() => setFocused(true)}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg
                           focus:ring-2 focus:ring-blue-200 focus:outline-none focus:border-blue-300
                           bg-gray-50 focus:bg-white transition-colors"
              />
            )}
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => onSearchTypeChange('name')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors
                ${searchType === 'name'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              Nombre
            </button>
            <button
              onClick={() => onSearchTypeChange('date')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors
                ${searchType === 'date'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              Fecha
            </button>
          </div>

          {/* Dropdown results */}
          {focused && searchQuery && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50">
              <p className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </p>
              <div className="max-h-72 overflow-y-auto">
                {results.map((loan) => {
                  const client = getClient(loan.client_id);
                  return (
                    <button
                      key={loan.id}
                      onClick={() => handleSelect(loan.id)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center justify-between gap-3 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {client?.name ?? '—'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatCOP(loan.capital)} · {formatDate(loan.loan_date)}
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[loan.status]}`}>
                        {STATUS_LABEL[loan.status]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {focused && searchQuery && results.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
              <p className="px-3 py-4 text-sm text-gray-400 text-center">
                No se encontraron resultados
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onNewLoan}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white
                     text-sm font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>
    </header>
  );
}
