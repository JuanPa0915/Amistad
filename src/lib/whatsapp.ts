import type { Loan, Payment } from '../types/loan.types';
import { formatCOP, formatDate } from './loanCalculations';

/* ─── Tipos ───────────────────────────────────────────────────────────────── */

export interface WhatsAppReceiptData {
  clientName: string;
  clientPhone: string;
  loan: Loan;
  /** El pago específico para el cual se genera el comprobante. */
  currentPayment: Payment;
  /** Todos los pagos del préstamo (incluido el actual), ordenados por fecha ascendente. */
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

/**
 * Calcula los saldos pendientes DESPUÉS de aplicar todos los pagos
 * hasta (e incluyendo) el pago indicado, usando la lógica de cascada:
 *   1° → Los abonos cubren primero el interés pendiente.
 *   2° → El excedente descuenta el capital.
 */
function calculateBalancesAtPayment(
  loan: Loan,
  allPayments: Payment[],
  upToPaymentId: string,
): { interestPending: number; capitalPending: number; totalDebt: number } {
  const totalInterest = loan.capital * (loan.interest_rate / 100) * loan.months;
  let interestPending = totalInterest;
  let capitalPending = loan.capital;

  // Ordenar todos los pagos por fecha ascendente para aplicar la cascada en orden
  const sorted = [...allPayments].sort(
    (a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime(),
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

    // Si ya procesamos el pago actual, detenernos
    if (pmt.id === upToPaymentId) break;
  }

  interestPending = Math.max(0, interestPending);
  capitalPending = Math.max(0, capitalPending);

  return {
    interestPending,
    capitalPending,
    totalDebt: interestPending + capitalPending,
  };
}

/* ─── Generador de URL de WhatsApp ────────────────────────────────────────── */

/**
 * Genera la URL completa de la API de WhatsApp (`https://wa.me/...`)
 * con el comprobante de abono pre-rellenado y codificado.
 */
export function buildWhatsAppReceiptUrl(data: WhatsAppReceiptData): string {
  const { clientName, clientPhone, loan, currentPayment, allPayments } = data;

  const phone = sanitizePhone(clientPhone);
  const totalInterest = loan.capital * (loan.interest_rate / 100) * loan.months;

  // Calcular saldos después de aplicar pagos hasta el pago actual (cascada)
  const balances = calculateBalancesAtPayment(loan, allPayments, currentPayment.id);

  const message = [
    `🧾 *COMPROBANTE DE ABONO - LA AMISTAD* 🧾`,
    ``,
    `👤 *Cliente:* ${clientName}`,
    ``,
    `💵 *Resumen del Préstamo Original:*`,
    `• Capital Prestado: ${formatCOP(loan.capital)}`,
    `• Intereses Totales: ${formatCOP(totalInterest)}`,
    ``,
    `---`,
    `✨ *DETALLE DEL ABONO ACTUAL* ✨`,
    `📅 *Fecha:* ${formatDate(currentPayment.payment_date)}`,
    `💰 *Valor del Abono:* ${formatCOP(currentPayment.amount)}`,
    `---`,
    ``,
    `📊 *ESTADO ACTUALIZADO DE SU DEUDA:*`,
    `📉 Saldo Intereses Pendiente: ${formatCOP(balances.interestPending)}`,
    `📉 Saldo Capital Pendiente: ${formatCOP(balances.capitalPending)}`,
    ``,
    `🔥 *DEUDA TOTAL RESTANTE:* ${formatCOP(balances.totalDebt)}`,
    ``,
    `¡Muchas gracias por su pago!`,
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
