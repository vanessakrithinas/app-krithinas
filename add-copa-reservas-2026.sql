-- Adicionar reservas Copa 2026 com datas corretas
-- Executar DEPOIS de adicionar as colunas entrada/saida

-- JANEIRO 2026
-- Check-out dia 2 (ocupado até dia 2, assumindo entrada anterior)
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-01', '2026-01-01', '2026-01-02', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- Check-in 9 / Check-out 14
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-01', '2026-01-09', '2026-01-14', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- Check-in 23 / Check-out 29
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-01', '2026-01-23', '2026-01-29', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- FEVEREIRO 2026
-- Dias 19 a 22
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-02', '2026-02-19', '2026-02-22', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- MARÇO 2026
-- Dias 11 a 15
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-03', '2026-03-11', '2026-03-15', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- Dias 17 a 20
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-03', '2026-03-17', '2026-03-20', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- Dias 22 a 31
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-03', '2026-03-22', '2026-03-31', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- ABRIL 2026
-- Dia 1
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-04', '2026-04-01', '2026-04-01', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- Dias 8 a 17
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-04', '2026-04-08', '2026-04-17', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- Dias 18 a 22
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-04', '2026-04-18', '2026-04-22', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- Dias 28 a 30
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-04', '2026-04-28', '2026-04-30', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- MAIO 2026
-- Dias 1 a 4
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-05', '2026-05-01', '2026-05-04', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- JUNHO 2026
-- Dias 1 a 10
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-06', '2026-06-01', '2026-06-10', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- Dias 20 a 30
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-06', '2026-06-20', '2026-06-30', 'Aluguel AP 812', 'RioHost', 0, 0.18);

-- JULHO 2026
-- Dias 1 a 12
INSERT INTO copa_receitas (mes, entrada, saida, descricao, canal, valor_brl, taxa)
VALUES ('2026-07', '2026-07-01', '2026-07-12', 'Aluguel AP 812', 'RioHost', 0, 0.18);
