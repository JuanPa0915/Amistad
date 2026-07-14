import React from 'react';
import type { Loan, Client, Payment } from '../types/loan.types';
import { calculateLoanSummary } from '../lib/loanCalculations';
import LoanCard from '../components/loans/LoanCard';
import LoanDetail from '../components/loans/LoanDetail';

interface LoansProps {
  loans: Loan[];
  payments: Payment[];
  getClient: (id: string) => Client | undefined;
  selectedLoanId: string | null;
  onSelectLoan: (id: string) => void;
  onBack: () => void;
  onNewLoan: () => void;
  onAddPayment: () => void;
  onDeletePayment: (paymentId: string) => void;
  onMarkPaid: (loanId: string) => void;
}

const STATUS_FILTER_LABELS = ['Todos', 'Activos', 'Pagados', 'En mora'] as const;
type FilterLabel = typeof STATUS_FILTER_LABELS[number];

export default function Loans({
  loans, payments, getClient,
  selectedLoanId, onSelectLoan, onBack,
  onNewLoan, onAddPayment, onDeletePayment, onMarkPaid,
}: LoansProps) {

  const [filter, setFilter] = React.useState<FilterLabel>('Todos');

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

  // Filtrar préstamos según el selector
  const filtered = loans.filter((l) => {
    if (filter === 'Activos') return l.status === 'active';
    if (filter === 'Pagados') return l.status === 'paid';
    if (filter === 'En mora') return l.status === 'defaulted';
    return true;
  });

  return (
    <div>
      {/* Header de la sección */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Préstamos</h1>
          <p className="text-sm text-gray-400">{loans.length} en total</p>
        </div>
        <button
          onClick={onNewLoan}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white
                     text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
        </button>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
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
