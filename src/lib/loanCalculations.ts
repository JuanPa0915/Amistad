import type { Loan, Payment, LoanSummary } from '../types/loan.types';

const DAYS_ES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles',
  'Jueves', 'Viernes', 'Sábado',
];

/**
 * Calcula el resumen de saldos de un préstamo aplicando
 * la lógica de distribución en cascada:
 *   1° → Abonos cubren el interés pendiente.
 *   2° → Solo cuando interés = 0, el excedente descuenta capital.
 */
export function calculateLoanSummary(
  loan: Loan,
  payments: Payment[],
): LoanSummary {
  const totalInterest = loan.capital * (loan.interest_rate / 100) * loan.months;
  const deliveryAmount = loan.capital * 0.96;

  let interestPending = totalInterest;
  let capitalPending = loan.capital;

  // Ordenar por fecha ascendente antes de procesar
  const sorted = [...payments]
    .filter((p) => p.loan_id === loan.id)
    .sort(
      (a, b) =>
        new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime(),
    );

  for (const pmt of sorted) {
    let remaining = pmt.amount;

    // Paso 1: cubrir interés primero
    if (interestPending > 0) {
      const toInterest = Math.min(remaining, interestPending);
      interestPending -= toInterest;
      remaining -= toInterest;
    }

    // Paso 2: con el excedente, descontar capital
    if (remaining > 0 && capitalPending > 0) {
      const toCapital = Math.min(remaining, capitalPending);
      capitalPending -= toCapital;
    }
  }

  interestPending = Math.max(0, interestPending);
  capitalPending = Math.max(0, capitalPending);

  const interestPaid = totalInterest - interestPending;
  const capitalPaid = loan.capital - capitalPending;
  const totalPaid = interestPaid + capitalPaid;
  const totalDebt = interestPending + capitalPending;
  const totalExpected = loan.capital + totalInterest;
  const progressPct =
    totalExpected > 0 ? Math.min(100, Math.round((totalPaid / totalExpected) * 100)) : 0;

  return {
    totalInterest,
    deliveryAmount,
    interestPaid,
    interestPending,
    capitalPaid,
    capitalPending,
    totalPaid,
    totalDebt: Math.max(0, totalDebt),
    progressPct,
  };
}

/**
 * Simula cómo se distribuirá un nuevo abono ANTES de guardarlo.
 * Útil para el preview en tiempo real del modal de pago.
 */
export function simulatePayment(
  summary: LoanSummary,
  amount: number,
): { toInterest: number; toCapital: number; newDebt: number } {
  const toInterest = Math.min(amount, summary.interestPending);
  const remaining = amount - toInterest;
  const toCapital = Math.min(remaining, summary.capitalPending);
  const newDebt = Math.max(0, summary.totalDebt - amount);
  return { toInterest, toCapital, newDebt };
}

/** Retorna el día de la semana en español para una fecha ISO. */
export function getDayOfWeek(isoDate: string): string {
  return DAYS_ES[new Date(isoDate).getDay()];
}

/** Formatea un número como moneda COP sin decimales. */
export function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formatea una fecha ISO como dd/mm/yyyy en español. */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Compara una fecha ISO (YYYY-MM-DDTHH:mm:ss) contra una consulta
 * escrita en formato DD/MM o DD/MM/AAAA, soportando búsqueda parcial:
 *   - "15"        → coincide cualquier día 15
 *   - "15/03"     → coincide 15 de marzo de cualquier año
 *   - "15/03/2024"→ coincide exactamente
 */
export function matchDateQuery(isoDate: string, query: string): boolean {
  const datePart = isoDate?.slice(0, 10);
  if (!datePart) return false;
  const [year, month, day] = datePart.split('-');
  const parts = query.split('/');
  if (parts.length === 1 && parts[0]) return day === parts[0];
  if (parts.length === 2) return day === parts[0] && month === parts[1];
  if (parts.length === 3) return day === parts[0] && month === parts[1] && year === parts[2];
  return false;
}
