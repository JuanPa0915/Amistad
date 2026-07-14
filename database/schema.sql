-- ============================================================
-- COBRANZAS PRO — Esquema de Base de Datos
-- Compatible con PostgreSQL / Supabase
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. CLIENTS (Clientes)
-- Almacena la información personal de cada cliente
-- que solicita un préstamo: nombre, cédula y teléfono.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE clients (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT        NOT NULL,
    cedula      TEXT        NOT NULL UNIQUE,
    phone       TEXT,
    created_at  TIMESTAMPTZ NOT NULL    DEFAULT now()
);

COMMENT ON TABLE  clients          IS 'Registro de clientes que solicitan préstamos';
COMMENT ON COLUMN clients.name     IS 'Nombre completo del cliente';
COMMENT ON COLUMN clients.cedula   IS 'Número de cédula (único por cliente)';
COMMENT ON COLUMN clients.phone    IS 'Teléfono de contacto (opcional)';


-- ─────────────────────────────────────────────────────────────
-- 2. LOANS (Préstamos)
-- Registra cada préstamo otorgado a un cliente.
-- Guarda el capital, el monto entregado (capital × 0.96),
-- la tasa de interés mensual, el plazo, el interés total
-- calculado, la fecha del préstamo y su estado actual.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE loans (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID        NOT NULL    REFERENCES clients(id) ON DELETE RESTRICT,
    capital         NUMERIC     NOT NULL    CHECK (capital > 0),
    delivery_amount NUMERIC     NOT NULL,
    interest_rate   NUMERIC     NOT NULL    CHECK (interest_rate > 0),
    months          INTEGER     NOT NULL    DEFAULT 2 CHECK (months > 0),
    total_interest  NUMERIC     NOT NULL,
    loan_date       TIMESTAMPTZ NOT NULL,
    day_of_week     TEXT,
    status          TEXT        NOT NULL    DEFAULT 'active'
                                CHECK (status IN ('active', 'paid', 'defaulted')),
    created_at      TIMESTAMPTZ NOT NULL    DEFAULT now()
);

COMMENT ON TABLE  loans                  IS 'Préstamos otorgados a los clientes';
COMMENT ON COLUMN loans.client_id        IS 'FK al cliente dueño del préstamo';
COMMENT ON COLUMN loans.capital          IS 'Monto del capital prestado';
COMMENT ON COLUMN loans.delivery_amount  IS 'Monto realmente entregado al cliente (capital × 0.96)';
COMMENT ON COLUMN loans.interest_rate    IS 'Tasa de interés mensual (%)';
COMMENT ON COLUMN loans.months           IS 'Plazo del préstamo en meses (por defecto 2)';
COMMENT ON COLUMN loans.total_interest   IS 'Interés total calculado (capital × tasa × meses)';
COMMENT ON COLUMN loans.loan_date        IS 'Fecha y hora en que se otorgó el préstamo';
COMMENT ON COLUMN loans.day_of_week      IS 'Día de la semana del préstamo (calculado, ej: "Lunes")';
COMMENT ON COLUMN loans.status           IS 'Estado actual: active, paid o defaulted';

-- Índice para buscar rápidamente los préstamos de un cliente
CREATE INDEX idx_loans_client_id ON loans(client_id);
-- Índice para filtrar por estado
CREATE INDEX idx_loans_status    ON loans(status);


-- ─────────────────────────────────────────────────────────────
-- 3. PAYMENTS (Pagos / Abonos)
-- Registra cada pago o abono que un cliente realiza
-- sobre un préstamo. Los pagos se aplican en cascada:
-- primero cubren el interés pendiente y luego el capital.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE payments (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id      UUID        NOT NULL    REFERENCES loans(id) ON DELETE CASCADE,
    amount       NUMERIC     NOT NULL    CHECK (amount > 0),
    payment_date DATE        NOT NULL,
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL    DEFAULT now()
);

COMMENT ON TABLE  payments              IS 'Pagos o abonos realizados sobre un préstamo';
COMMENT ON COLUMN payments.loan_id      IS 'FK al préstamo al que pertenece este pago';
COMMENT ON COLUMN payments.amount       IS 'Monto del abono';
COMMENT ON COLUMN payments.payment_date IS 'Fecha en que se realizó el pago';
COMMENT ON COLUMN payments.notes        IS 'Notas opcionales sobre el pago';

-- Índice para buscar rápidamente los pagos de un préstamo
CREATE INDEX idx_payments_loan_id ON payments(loan_id);
-- Índice para ordenar y filtrar por fecha de pago
CREATE INDEX idx_payments_date    ON payments(payment_date);
