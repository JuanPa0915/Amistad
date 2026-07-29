import { useState, useEffect, useCallback } from 'react';
import type { Client, Loan, NewLoanForm } from '../types/loan.types';
import { getDayOfWeek } from '../lib/loanCalculations';
import { supabase } from '../lib/supabase';

export function useLoans() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loans, setLoans]     = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
    fetchLoans();
  }, []);

  async function fetchClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching clients:', error);
      return;
    }
    setClients(data ?? []);
  }

  async function fetchLoans() {
    setLoading(true);
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching loans:', error);
      return;
    }
    setLoans(data ?? []);
    setLoading(false);
  }

  const getClient = useCallback(
    (clientId: string) => clients.find((c) => c.id === clientId),
    [clients],
  );

  const addLoan = useCallback(async (form: NewLoanForm) => {
    const capital     = parseFloat(form.capital);
    const rate        = parseFloat(form.interest_rate);
    const monthsNum   = parseInt(form.months) || 2;
    const clientName  = form.client_name.trim();

    let clientId: string;

    try {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('name', clientName)
        .maybeSingle();

      if (existing) {
        clientId = existing.id;
      } else {
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({ name: clientName, cedula: `TEMP-${Date.now()}` })
          .select()
          .single();

        if (createError) {
          console.error('Error creating client:', createError);
          throw new Error(createError.message);
        }
        clientId = newClient.id;
        setClients((prev) => [...prev, newClient as Client]);
      }
    } catch (e) {
      console.error('Error in client lookup/creation:', e);
      throw e;
    }

    const newLoan = {
      client_id:       clientId,
      capital,
      delivery_amount: capital * 0.96,
      interest_rate:   rate,
      months:          monthsNum,
      total_interest:  capital * (rate / 100) * monthsNum,
      loan_date:       form.loan_date,
      day_of_week:     getDayOfWeek(form.loan_date),
      status:          'active' as const,
    };

    try {
      const { data, error } = await supabase
        .from('loans')
        .insert(newLoan)
        .select()
        .single();

      if (error) {
        console.error('Error adding loan:', error);
        throw new Error(error.message);
      }

      setLoans((prev) => [data, ...prev]);
      return data;
    } catch (e) {
      console.error('Error adding loan:', e);
      throw e;
    }
  }, []);

  const updateLoanStatus = useCallback(
    async (loanId: string, status: Loan['status']) => {
      const { error } = await supabase
        .from('loans')
        .update({ status })
        .eq('id', loanId);

      if (error) {
        console.error('Error updating loan status:', error);
        return;
      }

      setLoans((prev) =>
        prev.map((l) => (l.id === loanId ? { ...l, status } : l)),
      );
    },
    [],
  );

  const addClient = useCallback(async (client: Omit<Client, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();

    if (error) {
      console.error('Error adding client:', error);
      return;
    }

    setClients((prev) => [...prev, data]);
    return data;
  }, []);

  return { clients, loans, loading, getClient, addLoan, updateLoanStatus, addClient };
}
