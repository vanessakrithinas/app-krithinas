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

### 4. Adicionar todas as reservas 2026

Depois de adicionar as colunas, executa o ficheiro SQL completo:

```bash
# No Supabase SQL Editor, copia e cola o conteúdo do ficheiro:
cat add-copa-reservas-2026.sql
```

Ou adiciona manualmente via aplicação (botão "Nova receita" na aba Copa > Receitas).

**Reservas incluídas:**
- **Janeiro**: Check-out 2, Check-in 9/Check-out 14, Check-in 23/Check-out 29
- **Fevereiro**: 19-22
- **Março**: 11-15, 17-20, 22-31
- **Abril**: 1, 8-17, 18-22, 28-30
- **Maio**: 1-4
- **Junho**: 1-10, 20-30
- **Julho**: 1-12

## Notas
- As receitas antigas (sem entrada/saida) continuam a funcionar
- O código suporta 3 formatos:
  - **entrada/saida** - intervalos (novo)
  - **data** - dia específico (compatibilidade)
  - **mes** - mês completo (fallback)
