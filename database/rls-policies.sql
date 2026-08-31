-- Habilitar RLS (ya debería estar activo por defecto)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on clients" ON clients;
DROP POLICY IF EXISTS "Allow all on loans" ON loans;
DROP POLICY IF EXISTS "Allow all on payments" ON payments;

-- Políticas para clients
CREATE POLICY "Allow all on clients" ON clients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para loans
CREATE POLICY "Allow all on loans" ON loans
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para payments
CREATE POLICY "Allow all on payments" ON payments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
