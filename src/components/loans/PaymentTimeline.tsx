import type { Payment, Loan, Client, LoanSummary } from '../../types/loan.types';
import { formatCOP, formatDate } from '../../lib/loanCalculations';
import { buildWhatsAppReceiptUrl } from '../../lib/whatsapp';

interface PaymentTimelineProps {
  payments: Payment[];
  summary: LoanSummary;
  loan: Loan;
  client?: Client;
  onAddPayment: () => void;
  onDeletePayment: (paymentId: string) => void;
}

export default function PaymentTimeline({
  payments, summary, loan, client, onAddPayment, onDeletePayment,
}: PaymentTimelineProps) {

  /** Abre la URL de WhatsApp en una nueva pestaña. */
  function handleWhatsApp(payment: Payment) {
    if (!client?.phone) return;
    const url = buildWhatsAppReceiptUrl({
      clientName: client.name,
      clientPhone: client.phone,
      loan,
      currentPayment: payment,
      allPayments: payments,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            Historial de abonos
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Los abonos cubren primero los intereses, luego el capital.
          </p>
        </div>
        <button
          onClick={onAddPayment}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700
                     text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Registrar abono
        </button>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-green-50 rounded-lg p-2.5 text-center">
          <p className="text-xs text-green-600 mb-0.5">Total abonado</p>
          <p className="text-sm font-bold text-green-700">{formatCOP(summary.totalPaid)}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-2.5 text-center">
          <p className="text-xs text-red-500 mb-0.5">Saldo pendiente</p>
          <p className="text-sm font-bold text-red-700">{formatCOP(summary.totalDebt)}</p>
        </div>
      </div>

      {/* Lista de abonos */}
      {payments.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-400">Aún no hay abonos registrados.</p>
          <button
            onClick={onAddPayment}
            className="mt-2 text-sm text-blue-500 hover:underline"
          >
            Registrar primer abono
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Línea vertical de timeline */}
          <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-100" />

          <div className="flex flex-col gap-0">
            {payments.map((payment) => (
              <div key={payment.id} className="relative flex gap-3 pb-4">
                {/* Punto de la timeline */}
                <div className="shrink-0 w-7 h-7 rounded-full bg-green-100 border-2 border-green-400
                                flex items-center justify-center z-10">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* Contenido */}
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCOP(payment.amount)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(payment.payment_date)}
                        {payment.notes && ` · ${payment.notes}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Botón de WhatsApp */}
                      {client?.phone && (
                        <button
                          onClick={() => handleWhatsApp(payment)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg
                                     bg-green-50 hover:bg-green-100 text-green-600
                                     transition-colors group"
                          title="Enviar comprobante por WhatsApp"
                        >
                          <svg
                            className="w-4 h-4 group-hover:scale-110 transition-transform"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </button>
                      )}
                      {/* Botón de eliminar */}
                      <button
                        onClick={() => onDeletePayment(payment.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg
                                   text-gray-300 hover:text-red-500 hover:bg-red-50
                                   transition-colors"
                        title="Eliminar abono"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
