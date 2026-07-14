import React from 'react';
import type { Loan, Client, Payment } from '../types/loan.types';
import { calculateLoanSummary } from '../lib/loanCalculations';
import MetricCards from '../components/dashboard/MetricCards';
import ActiveLoansList from '../components/dashboard/ActiveLoansList';

interface DashboardProps {
  loans: Loan[];
  payments: Payment[];
  getClient: (id: string) => Client | undefined;
  onSelectLoan: (loanId: string) => void;
  onNewLoan: () => void;
}

export default function Dashboard({
  loans, payments, getClient, onSelectLoan, onNewLoan,
}: DashboardProps) {
  const activeLoans = loans.filter((l) => l.status === 'active');
  const paidLoans   = loans.filter((l) => l.status === 'paid');

  // Calcular totales para las métricas del header
  let totalCapital    = 0;
  let totalDebt       = 0;
  let totalCollected  = 0;
  let totalExpected   = 0;

  for (const loan of activeLoans) {
    const s = calculateLoanSummary(loan, payments);
    totalCapital   += loan.capital;
    totalDebt      += s.totalDebt;
    totalCollected += s.totalPaid;
    totalExpected  += loan.capital + s.totalInterest;
  }

  const collectionPct =
    totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400">Resumen general de tu cartera de préstamos</p>
      </div>

      <MetricCards
        activeCount={activeLoans.length}
        paidCount={paidLoans.length}
        totalCapital={totalCapital}
        totalDebt={totalDebt}
        totalCollected={totalCollected}
        collectionPct={collectionPct}
      />

      <ActiveLoansList
        loans={loans}
        payments={payments}
        getClient={getClient}
        onSelectLoan={onSelectLoan}
        onNewLoan={onNewLoan}
      />
    </div>
  );
}
