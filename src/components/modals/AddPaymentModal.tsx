import { useState } from 'react';
import type { NewPaymentForm, LoanSummary } from '../../types/loan.types';
import { formatCOP, simulatePayment } from '../../lib/loanCalculations';

interface AddPaymentModalProps {
  clientName: string;
  summary: LoanSummary;
  onSave: (form: NewPaymentForm) => void | Promise<void>;
  onClose: () => void;
}

const EMPTY_FORM: NewPaymentForm = {
  amount:       '',
  payment_date: new Date().toISOString().slice(0, 10),
  notes:        '',
};

export default function AddPaymentModal({
  clientName, summary, onSave, onClose,
}: AddPaymentModalProps) {
  const [form, setForm]     = useState<NewPaymentForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<NewPaymentForm>>({});

  const amount   = parseFloat(form.amount) || 0;
  const sim      = amount > 0 ? simulatePayment(summary, amount) : null;
  const isExcess = amount > summary.totalDebt;

  function set(field: keyof NewPaymentForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validate(): boolean {
    const errs: Partial<NewPaymentForm> = {};
    if (!form.amount || amount <= 0) errs.amount = 'Ingresa un monto válido';
    if (!form.payment_date)          errs.payment_date = 'Selecciona una fecha';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    await onSave(form);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Registrar abono</h2>
            <p className="text-xs text-gray-400 mt-0.5">{clientName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Resumen de deuda actual */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="bg-amber-50 rounded-lg p-2">
              <p className="text-xs text-amber-500">Interés pend.</p>
              <p className="text-xs font-bold text-amber-700">{formatCOP(summary.interestPending)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2">
              <p className="text-xs text-red-400">Capital pend.</p>
              <p className="text-xs font-bold text-red-700">{formatCOP(summary.capitalPending)}</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-2">
              <p className="text-xs text-gray-500">Deuda total</p>
              <p className="text-xs font-bold text-gray-800">{formatCOP(summary.totalDebt)}</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="px-5 pb-4 flex flex-col gap-3">

          {/* Monto */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Monto del abono ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={form.amount.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              onChange={(e) => set('amount', e.target.value.replace(/\D/g, ''))}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none
                ${errors.amount ? 'border-red-400' : 'border-gray-200'}`}
              autoFocus
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            {isExcess && amount > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ El abono supera la deuda. Solo se aplicarán {formatCOP(summary.totalDebt)}.
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.payment_date}
              onChange={(e) => set('payment_date', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none
                ${errors.payment_date ? 'border-red-400' : 'border-gray-200'}`}
            />
          </div>

          {/* Nota */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nota (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Semana 1, efectivo"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                         focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>

          {/* Simulación de distribución en cascada */}
          {sim && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-700 mb-2">
                Distribución en cascada
              </p>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">→ Cubre intereses primero</span>
                  <span className="font-semibold text-amber-700">{formatCOP(sim.toInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">→ Descuenta capital</span>
                  <span className="font-semibold text-red-700">{formatCOP(sim.toCapital)}</span>
                </div>
                <div className="border-t border-blue-200 pt-1.5 flex justify-between font-medium">
                  <span className="text-gray-600">Saldo tras abono</span>
                  <span className={sim.newDebt === 0 ? 'text-green-700' : 'text-gray-800'}>
                    {sim.newDebt === 0 ? '✅ Pagado' : formatCOP(sim.newDebt)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50
                       rounded-lg border border-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700
                       text-white rounded-lg transition-colors"
          >
            Guardar abono
          </button>
        </div>
      </div>
    </div>
  );
}
