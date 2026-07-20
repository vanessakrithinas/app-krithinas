# Sistema de Notificações - TODO

## ✅ Concluído
- Tabelas criadas no Supabase (`notificacoes` e `notificacoes_historico`)
- RLS desativado
- Notificação exemplo criada: Garagem 33 Mãezona (123€ trimestral, início 01/07/2026)
- Tabelas adicionadas ao TABLES array
- State `notificacoesOpen` criado
- ✅ Função `getNotificacoesPendentes()` implementada
  - Calcula quais notificações estão ativas para o mês atual
  - Suporta todos os tipos de recorrência (único, mensal, trimestral, anual)
  - Verifica se já foi paga no histórico
- ✅ Badge com contador no topbar
  - Botão com ícone de sino
  - Badge vermelho com número de pendentes
  - Aparece só quando há notificações
- ✅ Painel lateral de notificações
  - Lista todas as notificações pendentes do mês
  - Mostra título, descrição, valor, data início e recorrência
  - Mensagem "Tudo pago!" quando não há pendentes
- ✅ Botão "Marcar como pago"
  - Insere registo em `notificacoes_historico`
  - Recarrega dados automaticamente
  - Notificação desaparece da lista

## 📋 Melhorias futuras (opcionais)

### 1. Gestão de notificações
- Adicionar página para criar/editar/apagar notificações
- Permitir activar/desactivar notificações
- Adicionar campo "categoria" (maezona, vanessa, milton, etc.)

### 2. Histórico e relatórios
- Ver histórico de pagamentos por notificação
- Relatório anual de despesas recorrentes
- Exportar histórico para CSV

### 3. Lembretes
- Notificar X dias antes do vencimento
- Enviar email/SMS (integração externa)

### 4. Dashboard
- Card na Visão Geral com resumo de notificações
- Gráfico de despesas recorrentes vs pontuais

## 🎯 Lógica de Recorrência

- **mensal**: todo dia X de cada mês
- **trimestral**: a cada 3 meses (Jul, Out, Jan, Abr...)
- **anual**: uma vez por ano
- **unico**: apenas uma vez

Para trimestral começando em Julho:
- Jul 2026 ✓
- Out 2026 ✓
- Jan 2027 ✓
- Abr 2027 ✓
- etc...
