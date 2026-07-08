# Demo readiness

## Objetivo

Este backend está preparado para uma prova de conceito controlada com tráfego moderado.

## Dependências mocked por desenho

- `SmsService` não envia SMS real; escreve códigos e mensagens no log para reduzir custo, dependência externa e risco operacional durante a POC.
- `EmailService` não envia email real; escreve URLs e mensagens no log pelo mesmo motivo.
- `responseRate` e `acceptanceRate` são valores estáticos até existir histórico suficiente para cálculo real.

## Dados de demonstração

O seeder `04_demo_professionals_seeder.ts` cria mecânicos verificados e livres para que `/sos/nearby` retorne resultados imediatamente após migrations e seeders.

## Limites aplicados

- Auth geral: 20 requisições por minuto por IP.
- Login: 50 requisições por minuto por IP.
- Reset de senha: 5 requisições por minuto por IP.
- Busca SOS pública: 60 requisições por minuto por IP.
- Webhook SMS: 30 requisições por minuto por IP.
- Rotas SOS autenticadas: 120 requisições por minuto por IP.
- O limiter usa o pacote oficial `@adonisjs/limiter` com store em banco de dados.

## Pré-demo

1. Subir Postgres/PostGIS.
2. Executar migrations.
3. Executar seeders.
4. Confirmar que `/sos/nearby` retorna mecânicos.
5. Manter logs visíveis se a demo usar confirmação por código SMS mockado.
