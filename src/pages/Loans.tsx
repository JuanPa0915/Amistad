import React from 'react';
import type { Loan, Client, Payment } from '../types/loan.types';
import { calculateLoanSummary, matchDateQuery } from '../lib/loanCalculations';
import LoanCard from '../components/loans/LoanCard';
import LoanDetail from '../components/loans/LoanDetail';

interface LoansProps {
  loans: Loan[];
  payments: Payment[];
  getClient: (id: string) => Client | undefined;
  selectedLoanId: string | null;
  onSelectLoan: (id: string) => void;
  onBack: () => void;
  onAddPayment: () => void;
  onDeletePayment: (paymentId: string) => void;
  onMarkPaid: (loanId: string) => void;
  searchQuery: string;
  searchType: 'name' | 'date';
}

const STATUS_FILTER_LABELS = ['Activos', 'Pagados'] as const;
type FilterLabel = typeof STATUS_FILTER_LABELS[number];

export default function Loans({
  loans, payments, getClient,
  selectedLoanId, onSelectLoan, onBack,
  onAddPayment, onDeletePayment, onMarkPaid,
  searchQuery, searchType,
}: LoansProps) {

  const [filter, setFilter] = React.useState<FilterLabel>('Activos');
  const [dayFilter, setDayFilter] = React.useState<string | null>(null);

  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Si hay un préstamo seleccionado, mostrar detalle
  if (selectedLoanId) {
    const loan    = loans.find((l) => l.id === selectedLoanId);
    if (!loan) return null;
    const client  = getClient(loan.client_id);
    const summary = calculateLoanSummary(loan, payments);
    const pmts    = payments
      .filter((p) => p.loan_id === loan.id)
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

    return (
      <LoanDetail
        loan={loan}
        client={client}
        summary={summary}
        payments={pmts}
        onBack={onBack}
        onAddPayment={onAddPayment}
        onDeletePayment={onDeletePayment}
        onMarkPaid={() => onMarkPaid(loan.id)}
      />
    );
  }

  // Filtrar préstamos según el selector, día y búsqueda
  const filtered = loans.filter((l) => {
    if (filter === 'Activos') { if (l.status !== 'active') return false; }
    if (filter === 'Pagados') { if (l.status !== 'paid') return false; }

    if (dayFilter && l.day_of_week !== dayFilter) return false;
    if (!searchQuery) return true;
    const client = getClient(l.client_id);
    if (searchType === 'name') {
      return client?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return matchDateQuery(l.loan_date!, searchQuery);
  });

  return (
    <div>
      {/* Header de la sección */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Préstamos</h1>
        <p className="text-sm text-gray-400">{loans.length} en total</p>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-lg w-fit">
        {STATUS_FILTER_LABELS.map((label) => (
          <button
            key={label}
            onClick={() => setFilter(label)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors
              ${filter === label
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filtro por día de la semana */}
      <div className="flex items-center gap-1 mb-4">
        <button
          onClick={() => setDayFilter(null)}
          className={`w-6 h-6 text-[11px] font-medium rounded-md transition-colors
            ${!dayFilter
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-400 hover:text-gray-600'}`}
          title="Todos los días"
        >
          T
        </button>
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setDayFilter(d === dayFilter ? null : d)}
            className={`w-6 h-6 text-[11px] font-medium rounded-md transition-colors
              ${dayFilter === d
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-400 hover:text-gray-600'}`}
            title={d}
          >
            {d.charAt(0)}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-sm text-gray-400">
            No hay préstamos en esta categoría.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((loan) => {
            const client  = getClient(loan.client_id);
            const summary = calculateLoanSummary(loan, payments);
            return (
              <LoanCard
                key={loan.id}
                loan={loan}
                client={client}
                summary={summary}
                onClick={() => onSelectLoan(loan.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
