# Migração Copa - Adicionar campos entrada/saida

## Problema
O calendário Copa precisa dos campos `entrada` e `saida` para mostrar intervalos de datas ocupadas.

## Solução

### 1. Aceder ao Supabase SQL Editor
https://supabase.com/dashboard/project/dmyaaxvlcmjplyymzrjl/sql/new

### 2. Executar este SQL:

```sql
-- Adicionar colunas entrada e saida
ALTER TABLE copa_receitas
ADD COLUMN IF NOT EXISTS entrada DATE,
ADD COLUMN IF NOT EXISTS saida DATE;
```

### 3. Verificar
Executa no terminal:
```bash
node check-and-migrate-copa.js
```

Deves ver: "✅ Campos entrada/saida já existem!"

### 4. Adicionar dados de exemplo (Janeiro 2026)

Depois de adicionar as colunas, podes adicionar as reservas manualmente na aplicação ou executar este SQL para Janeiro:

```sql
-- Janeiro: dia 1
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-01', '2026-01-01', '2026-01-01', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- Janeiro: dias 9 a 14
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-01', '2026-01-09', '2026-01-14', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- Janeiro: dias 23 a 29
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-01', '2026-01-23', '2026-01-29', 'Aluguel AP 812', 'RioHost', 0, 0.18);
```

## Notas
- As receitas antigas (sem entrada/saida) continuam a funcionar
- O código suporta 3 formatos:
  - **entrada/saida** - intervalos (novo)
  - **data** - dia específico (compatibilidade)
  - **mes** - mês completo (fallback)
