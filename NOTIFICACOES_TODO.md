# Sistema de Notificações - TODO

## ✅ Concluído
- Tabelas criadas no Supabase (`notificacoes` e `notificacoes_historico`)
- RLS desativado
- Notificação exemplo criada: Garagem 33 Mãezona (123€ trimestral, início 01/07/2026)
- Tabelas adicionadas ao TABLES array
- State `notificacoesOpen` criado

## 📋 Próximos passos

### 1. Calcular notificações pendentes
Adicionar função que calcula quais notificações estão ativas para o mês atual:
```javascript
const getNotificacoesPendentes = (notificacoes, historico, mes) => {
  // Para cada notificação ativa
  // Verificar se está no período (trimestral = a cada 3 meses)
  // Verificar se já foi paga (check historico)
  // Retornar lista de pendentes
}
```

### 2. Badge no Topbar
Adicionar ao lado do botão de ocultar valores:
```jsx
<button onClick={() => setNotificacoesOpen(true)} style={{...}}>
  <i className="ti ti-bell" />
  {pendentes.length > 0 && <span className="badge-count">{pendentes.length}</span>}
</button>
```

### 3. Painel Lateral
Criar componente similar ao drawer:
- Lista de notificações pendentes
- Info: título, descrição, valor, vencimento
- Botão "Marcar como pago" que:
  - Insere em `notificacoes_historico`
  - Reload dos dados

### 4. CSS do Badge
```css
.badge-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #EF4444;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 700;
}
```

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
