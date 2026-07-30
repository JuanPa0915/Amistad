import type { Loan, Client, Payment } from '../../types/loan.types';
import { calculateLoanSummary } from '../../lib/loanCalculations';
import LoanCard from '../loans/LoanCard';

interface ActiveLoansListProps {
  loans: Loan[];
  payments: Payment[];
  getClient: (id: string) => Client | undefined;
  onSelectLoan: (loanId: string) => void;
  onNewLoan: () => void;
}

export default function ActiveLoansList({
  loans, payments, getClient, onSelectLoan, onNewLoan,
}: ActiveLoansListProps) {
  const activeLoans = loans.filter((l) => l.status === 'active');

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">
          Préstamos activos
          <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
            {activeLoans.length}
          </span>
        </h2>
        <button
          onClick={onNewLoan}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          + Nuevo préstamo
        </button>
      </div>

      {activeLoans.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No hay préstamos activos.</p>
          <button
            onClick={onNewLoan}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeLoans.map((loan) => {
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
    </section>
  );
}
