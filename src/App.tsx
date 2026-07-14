import React, { useState } from 'react';
import { useLoans }    from './hooks/useLoans';
import { usePayments } from './hooks/usePayments';
import Header          from './components/layout/Header';
import Layout          from './components/layout/Layout';
import Dashboard       from './pages/Dashboard';
import Loans           from './pages/Loans';
import NewLoanModal    from './components/modals/NewLoanModal';
import AddPaymentModal from './components/modals/AddPaymentModal';
import { calculateLoanSummary } from './lib/loanCalculations';

type View = 'dashboard' | 'loans' | 'clients';

export default function App() {
  const { clients, loans, getClient, addLoan, updateLoanStatus } = useLoans();
  const { payments, getPaymentsForLoan, addPayment, deletePayment } = usePayments();

  // Navegación
  const [view, setView]               = useState<View>('dashboard');
  const [selectedLoanId, setSelected] = useState<string | null>(null);

  // Modales
  const [showNewLoan, setShowNewLoan]     = useState(false);
  const [showPayment, setShowPayment]     = useState(false);

  function handleSelectLoan(id: string) {
    setSelected(id);
    setView('loans');
  }

  function handleBack() {
    setSelected(null);
  }

  function handleViewChange(v: View) {
    setView(v);
    setSelected(null);
  }

  // Para el modal de pago necesitamos el resumen del préstamo activo
  const activeLoan    = selectedLoanId ? loans.find((l) => l.id === selectedLoanId) : null;
  const activeClient  = activeLoan ? getClient(activeLoan.client_id) : undefined;
  const activeSummary = activeLoan
    ? calculateLoanSummary(activeLoan, payments)
    : null;

  return (
    <>
      <Header
        currentView={view}
        onViewChange={handleViewChange}
        onNewLoan={() => setShowNewLoan(true)}
      />

      <Layout>
        {view === 'dashboard' && (
          <Dashboard
            loans={loans}
            payments={payments}
            getClient={getClient}
            onSelectLoan={handleSelectLoan}
            onNewLoan={() => setShowNewLoan(true)}
          />
        )}

        {view === 'loans' && (
          <Loans
            loans={loans}
            payments={payments}
            getClient={getClient}
            selectedLoanId={selectedLoanId}
            onSelectLoan={handleSelectLoan}
            onBack={handleBack}
            onNewLoan={() => setShowNewLoan(true)}
            onAddPayment={() => setShowPayment(true)}
            onDeletePayment={deletePayment}
            onMarkPaid={(id) => updateLoanStatus(id, 'paid')}
          />
        )}

        {view === 'clients' && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">
              Módulo de clientes — próximamente. 
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Aquí podrás registrar, editar y buscar clientes.
            </p>
          </div>
        )}
      </Layout>

      {/* Modales */}
      {showNewLoan && (
        <NewLoanModal
          clients={clients}
          onSave={addLoan}
          onClose={() => setShowNewLoan(false)}
        />
      )}

      {showPayment && activeLoan && activeSummary && (
        <AddPaymentModal
          clientName={activeClient?.name ?? '—'}
          summary={activeSummary}
          onSave={(form) => addPayment(activeLoan.id, form)}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}
