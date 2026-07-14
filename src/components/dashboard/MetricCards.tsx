import React from 'react';
import { formatCOP } from '../../lib/loanCalculations';

interface MetricCardsProps {
  activeCount: number;
  paidCount: number;
  totalCapital: number;
  totalDebt: number;
  totalCollected: number;
  collectionPct: number;
}

interface CardProps {
  label: string;
  value: string;
  sub?: string;
  color?: 'blue' | 'red' | 'green' | 'gray';
  icon: React.ReactNode;
}

function MetricCard({ label, value, sub, color = 'gray', icon }: CardProps) {
  const colorMap = {
    blue:  'bg-blue-50   text-blue-600',
    red:   'bg-red-50    text-red-600',
    green: 'bg-green-50  text-green-600',
    gray:  'bg-gray-100  text-gray-600',
  };
  const valueColor = {
    blue:  'text-blue-700',
    red:   'text-red-700',
    green: 'text-green-700',
    gray:  'text-gray-900',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {label}
        </span>
        <span className={`p-1.5 rounded-lg ${colorMap[color]}`}>{icon}</span>
      </div>
      <p className={`text-2xl font-semibold ${valueColor[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function MetricCards({
  activeCount, paidCount, totalCapital,
  totalDebt, totalCollected, collectionPct,
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

      <MetricCard
        label="Préstamos activos"
        value={String(activeCount)}
        sub={`${paidCount} pagados`}
        color="blue"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      />

      <MetricCard
        label="Capital colocado"
        value={formatCOP(totalCapital)}
        sub="en préstamos activos"
        color="gray"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        }
      />

      <MetricCard
        label="Saldo por cobrar"
        value={formatCOP(totalDebt)}
        sub="capital + intereses"
        color="red"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />

      <MetricCard
        label="Total recaudado"
        value={formatCOP(totalCollected)}
        sub={`${collectionPct}% del total esperado`}
        color="green"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

    </div>
  );
}
