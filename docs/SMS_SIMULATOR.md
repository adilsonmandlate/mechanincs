# Simulador SMS e conclusão de assistências

## Configuração

No backend:

```env
DEMO_PROFESSIONAL_RESPONSE_SIMULATION=false
DEMO_SMS_SIMULATOR_ENABLED=true
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_KEY_PREFIX=mechanics:
```

No frontend, configurar `VITE_API_URL` com a origem do backend. O simulador não envia mensagens ao fornecedor real: as mensagens submetidas pela interface ficam marcadas com origem `simulator` e entram no mesmo caso de uso que processa o webhook real.

## Acesso

- A rota visual é `/demo/sms`.
- `/demo/sms?requestId=<id>` abre directamente a conversa do pedido.
- O utilizador deve estar autenticado e possuir o papel `admin`.
- Quando `DEMO_SMS_SIMULATOR_ENABLED=false`, a API responde `404` para não expor a funcionalidade.

O seeder cria o administrador de demonstração:

```text
MSISDN: 840000000
Password: Admin123!
```

## Protocolo SMS preservado

| Mensagem            | Acção                         |
| ------------------- | ----------------------------- |
| `ACEITAR <pedido>`  | Aceitar o pedido              |
| `RECUSAR <pedido>`  | Recusar o pedido              |
| `COMECAR <pedido>`  | Iniciar o trabalho            |
| `TERMINAR <pedido>` | Declarar o trabalho terminado |

As palavras podem ser enviadas sem espaço (`ACEITAR4`), sem acentos e com pequenos erros ortográficos comuns. Quando existe apenas um pedido compatível, a referência pode ser omitida. Os comandos numéricos `1`, `2`, `3` e `4` continuam aceites para preservar compatibilidade com mensagens anteriores.

O comando `TERMINAR` coloca o pedido em `awaiting_customer_confirmation`. Apenas a confirmação do cliente muda o pedido para `completed`. Uma resposta desconhecida fica registada e gera uma SMS com as instruções válidas para o estado actual.

## Endpoints adicionados

### Cliente autenticado

- `POST /sos/request/:id/confirm-completion`
- `POST /sos/request/:id/report-problem`

Corpo do reporte:

```json
{
  "reason": "vehicle_problem_persists",
  "description": "O veículo continua com o mesmo problema."
}
```

Motivos aceites: `work_not_completed`, `vehicle_problem_persists`, `service_not_performed`, `new_problem_after_service`, `professional_behavior`, `other`.

### Operador administrador

- `GET /demo/sms/conversations?filter=all&search=`
- `GET /demo/sms/conversations/:id`
- `POST /demo/sms/conversations/:id/messages`
- `GET /demo/sms/disputes`

O envio recebe, por exemplo, `{ "body": "COMECAR 42" }`. O backend obtém o mecânico da conversa e chama o processador SMS existente; o controlador não altera estados directamente.

## SSE

O backend publica eventos pequenos, sem telefone ou outros dados pessoais, nos canais privados:

- `assistance/requests/:requestId`: cliente do pedido, mecânico atribuído ou administrador.
- `demo/sms/inbox`: apenas administrador, com o simulador activado.
- `demo/sms/requests/:requestId`: apenas administrador, com o simulador activado.

Eventos: `request_created`, `professional_assigned`, `sms_sent`, `sms_received`, `request_accepted`, `request_rejected`, `work_started`, `completion_declared`, `completion_confirmed`, `completion_disputed`, `rating_submitted` e `request_canceled`.

O estado inicial e a recuperação após reconexão usam a API REST. O SSE apenas invalida a cache, evitando aplicar eventos atrasados directamente ao estado visual.

## Roteiro da demonstração

1. Executar migrations e seeders e iniciar PostgreSQL, Redis, backend e frontend.
2. Entrar na aplicação principal como cliente e criar um pedido.
3. Noutra janela, entrar como administrador e abrir `/demo/sms`.
4. Abrir a conversa criada e responder `ACEITAR <id>` para aceitar.
5. Responder `COMECAR <id>` para iniciar.
6. Responder `TERMINAR <id>` para declarar a conclusão.
7. Na janela do cliente, confirmar a conclusão e avaliar o mecânico, ou seleccionar a opção de problema e submeter o reporte.

## Proxy

O endpoint `GET /__transmit/events` precisa de `proxy_buffering off`, `X-Accel-Buffering: no` e timeouts longos no Nginx. A configuração correspondente está em `acd-infra/nginx/conf.d/mechanics.conf`.
