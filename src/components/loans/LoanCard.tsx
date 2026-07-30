import React from 'react';
import type { Loan, Client, LoanSummary } from '../../types/loan.types';
import { formatCOP, formatDate } from '../../lib/loanCalculations';
import { buildDebtReportUrl } from '../../lib/whatsapp';

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
  function handleWhatsApp(e: React.MouseEvent) {
    e.stopPropagation();
    if (!client?.phone) return;
    const url = buildDebtReportUrl({
      clientName: client.name,
      clientPhone: client.phone,
      loan,
      currentBalances: {
        interestPending: summary.interestPending,
        capitalPending: summary.capitalPending,
      },
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-gray-100
                 hover:border-blue-200 hover:shadow-sm transition-all p-4 group cursor-pointer"
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
          {client?.phone && (
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center w-7 h-7 rounded-lg
                         bg-green-50 hover:bg-green-100 text-green-600
                         transition-colors"
              title="Enviar estado de cuenta por WhatsApp"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>
          )}
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
    </div>
  );
}
