import { useState, useEffect, useCallback } from 'react';
import type { Payment, NewPaymentForm } from '../types/loan.types';
import { supabase } from '../lib/supabase';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return;
    }

    setPayments(data ?? []);
    setLoading(false);
  }

  const getPaymentsForLoan = useCallback(
    (loanId: string) =>
      payments
        .filter((p) => p.loan_id === loanId)
        .sort(
          (a, b) =>
            new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
        ),
    [payments],
  );

  const addPayment = useCallback(async (loanId: string, form: NewPaymentForm) => {
    const newPayment = {
      loan_id:      loanId,
      amount:       parseFloat(form.amount),
      payment_date: form.payment_date,
      notes:        form.notes || null,
    };

    const { data, error } = await supabase
      .from('payments')
      .insert(newPayment)
      .select()
      .single();

    if (error) {
      console.error('Error adding payment:', error);
      return;
    }

    setPayments((prev) => [data, ...prev]);
    return data;
  }, []);

  const deletePayment = useCallback(async (paymentId: string) => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (error) {
      console.error('Error deleting payment:', error);
      return;
    }

    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
  }, []);

  return { payments, loading, getPaymentsForLoan, addPayment, deletePayment };
}
