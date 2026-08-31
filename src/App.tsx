import { useEffect, useState } from 'react';
import { useLoans }    from './hooks/useLoans';
import { usePayments } from './hooks/usePayments';
import Header          from './components/layout/Header';
import Layout          from './components/layout/Layout';
import Dashboard       from './pages/Dashboard';
import Loans           from './pages/Loans';
import NewLoanModal    from './components/modals/NewLoanModal';
import AddPaymentModal from './components/modals/AddPaymentModal';
import EditClientModal from './components/modals/EditClientModal';
import Login from './components/auth/Login';
import { supabase } from './lib/supabase';
import type { Client, Loan } from './types/loan.types';
import { calculateLoanSummary, simulatePayment } from './lib/loanCalculations';

type View = 'dashboard' | 'loans';
type SearchType = 'name' | 'date';

export default function App() {
  const [sessionReady, setSessionReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setAuthenticated(Boolean(session));
      setSessionReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session));
      setSessionReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!sessionReady) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  if (!authenticated) {
    return <Login />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const { loans, getClient, addLoan, updateLoanStatus, updateClient } = useLoans();
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
  const [editingLoan, setEditingLoan] = useState<{ loan: Loan; client: Client } | null>(null);

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
            onEditClient={(loanId) => {
              const loan = loans.find((item) => item.id === loanId);
              const client = loan ? getClient(loan.client_id) : undefined;
              if (loan && client) setEditingLoan({ loan, client });
            }}
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
            onEditClient={(loanId) => {
              const loan = loans.find((item) => item.id === loanId);
              const client = loan ? getClient(loan.client_id) : undefined;
              if (loan && client) setEditingLoan({ loan, client });
            }}
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

      {editingLoan && (
        <EditClientModal
          client={editingLoan.client}
          loan={editingLoan.loan}
          onSave={updateClient}
          onClose={() => setEditingLoan(null)}
        />
      )}
    </>
  );
}
