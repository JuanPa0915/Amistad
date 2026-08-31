import { useState } from 'react';
import type { Client, Loan } from '../../types/loan.types';

interface EditClientModalProps {
  client: Client;
  loan: Loan;
  onSave: (clientId: string, loanId: string, changes: {
    name: string;
    phone: string;
    capital: number;
    interest_rate: number;
    months: number;
    loan_date: string;
  }) => Promise<boolean>;
  onClose: () => void;
}

export default function EditClientModal({ client, loan, onSave, onClose }: EditClientModalProps) {
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone ?? '');
  const [capital, setCapital] = useState(String(loan.capital));
  const [interestRate, setInterestRate] = useState(String(loan.interest_rate));
  const [months, setMonths] = useState(String(loan.months));
  const [loanDate, setLoanDate] = useState(loan.loan_date.slice(0, 16));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const capitalValue = Number(capital);
    const rateValue = Number(interestRate);
    const monthsValue = Number(months);
    if (!name.trim() || !phone.trim() || capitalValue <= 0 || rateValue <= 0 || monthsValue < 1 || !loanDate) {
      setError('Completa todos los campos.');
      return;
    }

    setSaving(true);
    setError('');
    const saved = await onSave(client.id, loan.id, {
      name: name.trim(),
      phone: phone.trim(),
      capital: capitalValue,
      interest_rate: rateValue,
      months: monthsValue,
      loan_date: loanDate,
    });
    setSaving(false);

    if (saved) {
      onClose();
    } else {
      setError('No se pudo actualizar el cliente.');
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Editar cliente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 flex flex-col gap-4">
            <label className="block text-xs font-medium text-gray-600">
              Nombre completo
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none"
                autoFocus
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-gray-600">
                Préstamo ($)
                <input type="number" min="1" value={capital} onChange={(event) => setCapital(event.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none" />
              </label>
              <label className="block text-xs font-medium text-gray-600">
                Tasa mensual (%)
                <input type="number" min="0" step="0.5" value={interestRate} onChange={(event) => setInterestRate(event.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none" />
              </label>
            </div>
            <label className="block text-xs font-medium text-gray-600">
              Fecha y hora del préstamo
              <input type="datetime-local" value={loanDate} onChange={(event) => setLoanDate(event.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none" />
            </label>
            <label className="block text-xs font-medium text-gray-600">
              Tiempo del préstamo (meses)
              <input type="number" min="1" value={months} onChange={(event) => setMonths(event.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none" />
            </label>
            <label className="block text-xs font-medium text-gray-600">
              Teléfono
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </label>
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-lg">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
