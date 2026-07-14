import React from 'react';
import type { Loan, Client, LoanSummary } from '../../types/loan.types';
import { formatCOP, formatDate } from '../../lib/loanCalculations';

interface LoanCardProps {
  loan: Loan;
  client?: Client;
  summary: LoanSummary;
  onClick: () => void;
}

const STATUS_STYLES = {
  active:   'bg-green-50  text-green-700  border-green-200',
  paid:     'bg-blue-50   text-blue-700   border-blue-200',
  defaulted:'bg-red-50    text-red-700    border-red-200',
};
const STATUS_LABEL = {
  active:   'Activo',
  paid:     'Pagado',
  defaulted:'En mora',
};

export default function LoanCard({ loan, client, summary, onClick }: LoanCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-gray-100
                 hover:border-blue-200 hover:shadow-sm transition-all p-4 group"
    >
      {/* Fila superior */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-medium text-gray-900 text-sm">
            {client?.name ?? 'Cliente desconocido'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {client?.cedula} · {client?.phone ?? '—'}
          </p>
          <p className="text-xs text-gray-400">
            {loan.day_of_week} {formatDate(loan.loan_date)} · {loan.interest_rate}% mensual
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[loan.status]}`}>
            {STATUS_LABEL[loan.status]}
          </span>
          <p className="text-base font-semibold text-red-600">
            {formatCOP(summary.totalDebt)}
          </p>
          <p className="text-xs text-gray-400">deuda total</p>
        </div>
      </div>

      {/* Saldos desglosados */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-400 mb-0.5">Capital</p>
          <p className="text-xs font-semibold text-gray-800">{formatCOP(loan.capital)}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2 text-center">
          <p className="text-xs text-amber-500 mb-0.5">Interés pend.</p>
          <p className="text-xs font-semibold text-amber-700">{formatCOP(summary.interestPending)}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-2 text-center">
          <p className="text-xs text-red-400 mb-0.5">Capital pend.</p>
          <p className="text-xs font-semibold text-red-700">{formatCOP(summary.capitalPending)}</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progreso de pago</span>
          <span>{summary.progressPct}% · {formatCOP(summary.totalPaid)} pagado</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${summary.progressPct}%` }}
          />
        </div>
      </div>

      {/* Flecha de navegación */}
      <div className="flex justify-end mt-2">
        <span className="text-xs text-blue-500 group-hover:text-blue-700 flex items-center gap-1">
          Ver detalle
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </button>
  );
}
