import type { Loan, Client, Payment, LoanSummary } from '../../types/loan.types';
import { formatCOP, formatDate } from '../../lib/loanCalculations';
import PaymentTimeline from './PaymentTimeline';

interface LoanDetailProps {
  loan: Loan;
  client?: Client;
  summary: LoanSummary;
  payments: Payment[];
  onBack: () => void;
  onAddPayment: () => void;
  onDeletePayment: (paymentId: string) => void;
  onMarkPaid: () => void;
}

export default function LoanDetail({
  loan, client, summary, payments,
  onBack, onAddPayment, onDeletePayment, onMarkPaid,
}: LoanDetailProps) {
  return (
    <div className="flex flex-col gap-4">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-800 font-medium">{client?.name}</span>
      </div>

      {/* Encabezado */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{client?.name}</h1>
            <p className="text-sm text-gray-400">
              C.C. {client?.cedula} · {client?.phone ?? '—'}
            </p>
            <p className="text-sm text-gray-400 mt-0.5">
              {loan.day_of_week}, {formatDate(loan.loan_date)} · Tasa {loan.interest_rate}%/mes · 2 meses
            </p>
          </div>
          {loan.status === 'active' && (
            <button
              onClick={onMarkPaid}
              className="shrink-0 text-xs bg-green-50 text-green-700 border border-green-200
                         hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Marcar como pagado
            </button>
          )}
        </div>

        {/* Condiciones del préstamo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Capital solicitado',    value: formatCOP(loan.capital),           color: 'text-gray-900' },
            { label: 'Monto entregado (−4%)', value: formatCOP(summary.deliveryAmount), color: 'text-gray-900' },
            { label: `Interés total (${loan.interest_rate}%×2m)`, value: formatCOP(summary.totalInterest), color: 'text-amber-700' },
            { label: 'Total a pagar',         value: formatCOP(loan.capital + summary.totalInterest), color: 'text-gray-900' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Panel de saldos pendientes */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-3">
            Saldos pendientes
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Interés pendiente</p>
              <p className="text-lg font-bold text-amber-600">{formatCOP(summary.interestPending)}</p>
              <p className="text-xs text-gray-400">
                de {formatCOP(summary.totalInterest)}
              </p>
            </div>
            <div className="text-center border-x border-red-200">
              <p className="text-xs text-gray-500 mb-1">Capital pendiente</p>
              <p className="text-lg font-bold text-red-600">{formatCOP(summary.capitalPending)}</p>
              <p className="text-xs text-gray-400">
                de {formatCOP(loan.capital)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Deuda total</p>
              <p className="text-lg font-bold text-red-800">{formatCOP(summary.totalDebt)}</p>
              <p className="text-xs text-gray-400">{summary.progressPct}% pagado</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progreso de pago</span>
              <span>{formatCOP(summary.totalPaid)} pagados</span>
            </div>
            <div className="h-2 bg-red-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${summary.progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Historial de abonos */}
      <PaymentTimeline
        payments={payments}
        summary={summary}
        loan={loan}
        client={client}
        onAddPayment={onAddPayment}
        onDeletePayment={onDeletePayment}
      />
    </div>
  );
}
