# Demo readiness

## Objetivo

Este backend está preparado para uma prova de conceito controlada com tráfego moderado.

## Dependências mocked por desenho

- `SmsService` não envia SMS real; escreve códigos e mensagens no log para reduzir custo, dependência externa e risco operacional durante a POC.
- `EmailService` não envia email real; escreve URLs e mensagens no log pelo mesmo motivo.
- `responseRate` e `acceptanceRate` são valores estáticos até existir histórico suficiente para cálculo real.
- A resposta do mecânico pode ser simulada automaticamente com `DEMO_PROFESSIONAL_RESPONSE_SIMULATION=true`. Em cada bloco de cinco pedidos, três são aceites e dois recusados, usando os mesmos estados e eventos do fluxo real.
- A aplicação SMS independente pode ser activada com `DEMO_SMS_SIMULATOR_ENABLED=true`. Esta opção exige um utilizador administrador e reutiliza exactamente o processador de SMS real.
- Para uma demonstração interactiva em `/demo/sms`, usar `DEMO_PROFESSIONAL_RESPONSE_SIMULATION=false` para evitar que a resposta automática antecipe o operador.

## Dados de demonstração

O seeder `04_demo_professionals_seeder.ts` cria mecânicos verificados e livres para que `/sos/nearby` retorne resultados imediatamente após migrations e seeders.

## Limites aplicados

- Auth geral: 20 requisições por minuto por IP.
- Login: 50 requisições por minuto por IP.
- Reset de senha: 5 requisições por minuto por IP.
- Busca SOS pública: 60 requisições por minuto por IP.
- Webhook SMS: 30 requisições por minuto por IP.
- Rotas SOS autenticadas: 120 requisições por minuto por IP.
- O limiter usa o pacote oficial `@adonisjs/limiter` com store no Redis.

## Pré-demo

1. Subir Postgres/PostGIS.
2. Executar migrations.
3. Executar seeders.
4. Confirmar que `/sos/nearby` retorna mecânicos.
5. Escolher apenas um modo de resposta: automático ou simulador SMS interactivo.
6. Para o simulador, definir `DEMO_PROFESSIONAL_RESPONSE_SIMULATION=false` e `DEMO_SMS_SIMULATOR_ENABLED=true`.
7. Entrar como administrador e abrir `/demo/sms`; consultar `docs/SMS_SIMULATOR.md` para o roteiro completo.
