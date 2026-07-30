export type LoanStatus = 'active' | 'paid' | 'defaulted';

export interface Client {
  id: string;
  name: string;
  cedula: string;
  phone?: string;
  created_at?: string;
}

export interface Loan {
  id: string;
  client_id: string;
  capital: number;
  delivery_amount: number;     // capital * 0.96
  interest_rate: number;       // % mensual
  months: number;              // siempre 2
  total_interest: number;      // capital * rate * months
  loan_date: string;           // ISO datetime
  day_of_week?: string;        // calculado automáticamente
  status: LoanStatus;
  created_at?: string;
}

export interface Payment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;        // ISO date
  notes?: string;
  created_at?: string;
}

export interface LoanSummary {
  totalInterest: number;
  deliveryAmount: number;
  interestPaid: number;
  interestPending: number;
  capitalPaid: number;
  capitalPending: number;
  totalPaid: number;
  totalDebt: number;
  progressPct: number;         // 0-100
}

export interface NewLoanForm {
  client_name: string;
  client_phone: string;
  capital: string;
  interest_rate: string;
  months: string;
  loan_date: string;
}

export interface NewPaymentForm {
  amount: string;
  payment_date: string;
  notes: string;
}
