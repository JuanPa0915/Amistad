import { useState } from 'react';
import { useLoans }    from './hooks/useLoans';
import { usePayments } from './hooks/usePayments';
import Header          from './components/layout/Header';
import Layout          from './components/layout/Layout';
import Dashboard       from './pages/Dashboard';
import Loans           from './pages/Loans';
import NewLoanModal    from './components/modals/NewLoanModal';
import AddPaymentModal from './components/modals/AddPaymentModal';
import { calculateLoanSummary, simulatePayment } from './lib/loanCalculations';

type View = 'dashboard' | 'loans';
type SearchType = 'name' | 'date';

export default function App() {
  const { loans, getClient, addLoan, updateLoanStatus } = useLoans();
  const { payments, addPayment, deletePayment } = usePayments();

  // Navegación
  const [view, setView]               = useState<View>('dashboard');
  const [selectedLoanId, setSelected] = useState<string | null>(null);

  // Búsqueda
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchType, setSearchType]       = useState<SearchType>('name');

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
        searchQuery={searchQuery}
        searchType={searchType}
        onSearchChange={setSearchQuery}
        onSearchTypeChange={setSearchType}
        loans={loans}
        getClient={getClient}
        onSelectLoan={handleSelectLoan}
      />

      <Layout>
        {view === 'dashboard' && (
          <Dashboard
            loans={loans}
            payments={payments}
            getClient={getClient}
            onSelectLoan={handleSelectLoan}
            onNewLoan={() => setShowNewLoan(true)}
            searchQuery={searchQuery}
            searchType={searchType}
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
            onAddPayment={() => setShowPayment(true)}
            onDeletePayment={deletePayment}
            onMarkPaid={(id) => updateLoanStatus(id, 'paid')}
            searchQuery={searchQuery}
            searchType={searchType}
          />
        )}
      </Layout>

      {/* Modales */}
      {showNewLoan && (
        <NewLoanModal
          onSave={addLoan}
          onClose={() => setShowNewLoan(false)}
        />
      )}

      {showPayment && activeLoan && activeSummary && (
        <AddPaymentModal
          clientName={activeClient?.name ?? '—'}
          summary={activeSummary}
          onSave={async (form) => {
            const sim = simulatePayment(activeSummary, parseFloat(form.amount));
            const result = await addPayment(activeLoan.id, form);
            if (!result) return;
            if (sim.newDebt === 0) {
              await updateLoanStatus(activeLoan.id, 'paid');
            }
          }}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}
