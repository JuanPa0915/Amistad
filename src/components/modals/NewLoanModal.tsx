import React, { useState } from 'react';
import type { Client, NewLoanForm } from '../../types/loan.types';
import { formatCOP, getDayOfWeek } from '../../lib/loanCalculations';

interface NewLoanModalProps {
  clients: Client[];
  onSave: (form: NewLoanForm) => void | Promise<void>;
  onClose: () => void;
}

const EMPTY_FORM: NewLoanForm = {
  client_id:    '',
  capital:      '',
  interest_rate:'',
  loan_date:    new Date().toISOString().slice(0, 16),
};

export default function NewLoanModal({ clients, onSave, onClose }: NewLoanModalProps) {
  const [form, setForm]     = useState<NewLoanForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<NewLoanForm>>({});

  const capital  = parseFloat(form.capital)       || 0;
  const rate     = parseFloat(form.interest_rate) || 0;
  const delivery = capital * 0.96;
  const interest = capital * (rate / 100) * 2;
  const total    = capital + interest;
  const dayOfWeek = form.loan_date ? getDayOfWeek(form.loan_date) : '';

  function set(field: keyof NewLoanForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validate(): boolean {
    const errs: Partial<NewLoanForm> = {};
    if (!form.client_id)    errs.client_id    = 'Selecciona un cliente';
    if (!form.capital || capital <= 0) errs.capital = 'Ingresa un monto válido';
    if (!form.interest_rate || rate <= 0) errs.interest_rate = 'Ingresa la tasa';
    if (!form.loan_date)    errs.loan_date    = 'Selecciona una fecha';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    await onSave(form);
    onClose();
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Nuevo préstamo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">

          {/* Cliente */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              value={form.client_id}
              onChange={(e) => set('client_id', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none
                ${errors.client_id ? 'border-red-400' : 'border-gray-200'}`}
            >
              <option value="">Seleccionar cliente…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.cedula}</option>
              ))}
            </select>
            {errors.client_id && <p className="text-xs text-red-500 mt-1">{errors.client_id}</p>}
          </div>

          {/* Capital y Tasa */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Capital ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="1000000"
                value={form.capital}
                onChange={(e) => set('capital', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none
                  ${errors.capital ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.capital && <p className="text-xs text-red-500 mt-1">{errors.capital}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tasa mensual (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="10"
                value={form.interest_rate}
                onChange={(e) => set('interest_rate', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none
                  ${errors.interest_rate ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.interest_rate && <p className="text-xs text-red-500 mt-1">{errors.interest_rate}</p>}
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Fecha y hora del préstamo <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={form.loan_date}
              onChange={(e) => set('loan_date', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none
                ${errors.loan_date ? 'border-red-400' : 'border-gray-200'}`}
            />
            {dayOfWeek && (
              <p className="text-xs text-blue-600 mt-1">
                📅 Día: <strong>{dayOfWeek}</strong> (calculado automáticamente)
              </p>
            )}
          </div>

          {/* Tiempo (fijo) */}
          <div className="bg-gray-50 rounded-lg px-3 py-2.5 flex justify-between items-center">
            <span className="text-xs text-gray-500">Tiempo del préstamo</span>
            <span className="text-xs font-semibold text-gray-700">2 meses (fijo)</span>
          </div>

          {/* Vista previa calculada */}
          {capital > 0 && rate > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
                Vista previa del préstamo
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: 'Capital solicitado',   value: formatCOP(capital),   color: 'text-gray-900' },
                  { label: 'Monto a entregar (−4%)',value: formatCOP(delivery),  color: 'text-gray-900' },
                  { label: 'Comisión cobrada',      value: formatCOP(capital * 0.04), color: 'text-green-700' },
                  { label: 'Intereses (2 meses)',   value: formatCOP(interest),  color: 'text-amber-700' },
                  { label: 'Total a recibir',       value: formatCOP(total),     color: 'text-blue-800' },
                  { label: '% interés total',       value: `${(rate * 2).toFixed(0)}%`, color: 'text-blue-800' },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-lg p-2">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
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
            Crear préstamo
          </button>
        </div>
      </div>
    </div>
  );
}
