import type { Loan, Payment } from '../types/loan.types';
import { formatCOP } from './loanCalculations';

/* ─── Tipos ───────────────────────────────────────────────────────────────── */

export interface WhatsAppReceiptData {
  clientName: string;
  clientPhone: string;
  loan: Loan;
  /** Todos los pagos del préstamo, ordenados por fecha ascendente. */
  allPayments: Payment[];
}

/* ─── Utilidades ──────────────────────────────────────────────────────────── */

/**
 * Limpia el número de teléfono de espacios, guiones y paréntesis.
 * Si no comienza con el indicativo 57 (Colombia), lo agrega automáticamente.
 */
export interface DebtReportData {
  clientName: string;
  clientPhone: string;
  loan: Loan;
  currentBalances: {
    interestPending: number;
    capitalPending: number;
  };
}

export function buildDebtReportUrl(data: DebtReportData): string {
  const { clientName, clientPhone, loan, currentBalances } = data;
  const phone = sanitizePhone(clientPhone);
  const totalInterest = loan.capital * (loan.interest_rate / 100) * loan.months;
  const totalDebt = currentBalances.interestPending + currentBalances.capitalPending;

  const message = [
    `📋 *REPORTE DE ESTADO DE CUENTA - LA AMISTAD* 📋`,
    ``,
    `👤 *Cliente:* ${clientName}`,
    ``,
    ` *Información del Préstamo:*`,
    `• Capital Inicial: ${formatCOP(loan.capital)}`,
    `• Intereses Totales Esperados: ${formatCOP(totalInterest)}`,
    ``,
    `---`,
    ` *RESUMEN DE SALDOS ACTUALES* `,
    ` Saldo Intereses Pendiente: ${formatCOP(currentBalances.interestPending)}`,
    ` Saldo Capital Pendiente: ${formatCOP(currentBalances.capitalPending)}`,
    ``,
    ` *TOTAL DEUDA PENDIENTE:* ${formatCOP(totalDebt)}`,
    ``,
    `*Nota:* Este es un reporte general de su deuda a la fecha actual.`,
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function sanitizePhone(raw: string): string {
  // Eliminar todo lo que no sea dígito o el signo +
  let cleaned = raw.replace(/[^\d+]/g, '');

  // Quitar el + inicial si existe, para normalizar
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  // Si no tiene el indicativo 57, agregarlo
  if (!cleaned.startsWith('57')) {
    cleaned = `57${cleaned}`;
  }

  return cleaned;
}

/* ─── Generador de URL de WhatsApp ────────────────────────────────────────── */

/**
 * Calcula los saldos finales aplicando TODOS los pagos del préstamo.
 * A diferencia de calculateBalancesAtPayment, no se detiene en un pago específico.
 */
function calculateFinalBalances(
  loan: Loan,
  allPayments: Payment[],
): { interestPending: number; capitalPending: number; totalDebt: number } {
  const totalInterest = loan.capital * (loan.interest_rate / 100) * loan.months;
  let interestPending = totalInterest;
  let capitalPending = loan.capital;

  const sorted = [...allPayments]
    .filter((p) => p.loan_id === loan.id)
    .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());

  for (const pmt of sorted) {
    let remaining = pmt.amount;

    if (interestPending > 0) {
      const toInterest = Math.min(remaining, interestPending);
      interestPending -= toInterest;
      remaining -= toInterest;
    }

    if (remaining > 0 && capitalPending > 0) {
      const toCapital = Math.min(remaining, capitalPending);
      capitalPending -= toCapital;
    }
  }

  return {
    interestPending: Math.max(0, interestPending),
    capitalPending: Math.max(0, capitalPending),
    totalDebt: Math.max(0, interestPending + capitalPending),
  };
}

function getGreeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? 'BUENOS DIAS' : 'BUENAS TARDES';
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((b.getTime() - a.getTime()) / msPerDay);
}

/**
 * Genera la URL completa de la API de WhatsApp (`https://wa.me/...`)
 * con el comprobante de abono pre-rellenado y codificado.
 */
export function buildWhatsAppReceiptUrl(data: WhatsAppReceiptData): string {
  const { clientName, clientPhone, loan, allPayments } = data;

  const phone = sanitizePhone(clientPhone);

  // Cálculos financieros
  const totalInterest = loan.capital * (loan.interest_rate / 100) * loan.months;
  const valorTotalInicial = loan.capital + totalInterest;

  // Suma de todos los abonos (incluido el actual)
  const totalAbonos = allPayments
    .filter((p) => p.loan_id === loan.id)
    .reduce((sum, p) => sum + p.amount, 0);

  // Saldo actual: aplicar TODOS los pagos del préstamo
  const balances = calculateFinalBalances(loan, allPayments);

  // Fechas
  const fechaInicio = new Date(loan.loan_date);
  const fechaTermina = addMonths(fechaInicio, 2);
  const hoy = new Date();
  const diasFaltantes = daysBetween(hoy, fechaTermina);

  const opcionesFecha: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const fechaInicioStr = fechaInicio.toLocaleDateString('es-CO', opcionesFecha);
  const fechaTerminaStr = fechaTermina.toLocaleDateString('es-CO', opcionesFecha);

  const message = [
    `${getGreeting()}`,
    `*${clientName.toUpperCase()}*`,
    ``,
    `⏱ *Plazo:* 2 MESES`,
    `📅 *INICIO PRESTAMO:* ${fechaInicioStr} | *VALOR:* ${formatCOP(valorTotalInicial)}`,
    `🏁 *TERMINA PRESTAMO:* ${fechaTerminaStr} | *ABONOS:* ${formatCOP(totalAbonos)} | *SALDO:* ${formatCOP(balances.totalDebt)}`,
    ``,
    `⏳ *FALTAN (${diasFaltantes}) DIAS PARA TERMINAR EL CREDITO*`,
    ``,
    `⚠️ CUMPLIDA LA FECHA DE VENCIMIENTO SE DARA INICIO A UNO NUEVO CON SUS INTERESES AL NUEVO SALDO.`,
    `🚫 SIN CANCELAR UN CREDITO NO SE HACE UNO NUEVO.`,
    ``,
    `✅ *POR FAVOR CONFIRMAR.*`,
    `SI NO CONFIRMA SE DA POR ACEPTADA LA INFORMACION.`,
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
