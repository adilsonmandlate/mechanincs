# Plano de Testes Detalhado - Mechanics API

## 📋 Objetivo

Este documento descreve um plano completo de testes para validar todos os endpoints da API Mechanics usando Postman.

## 🎯 Escopo

### Endpoints a Testar

1. **Health Check** (1 endpoint)
2. **Autenticação** (7 endpoints)
3. **Profissões** (6 endpoints)
4. **SOS** (7 endpoints)

**Total: 21 endpoints**

## 📊 Matriz de Testes

### 1. Health Check

| Teste        | Método | Endpoint | Status Esperado | Validações                     |
| ------------ | ------ | -------- | --------------- | ------------------------------ |
| Health Check | GET    | `/`      | 200 OK          | Resposta: `{"hello": "world"}` |

### 2. Autenticação

| Teste                                      | Método | Endpoint                          | Status Esperado | Validações                         |
| ------------------------------------------ | ------ | --------------------------------- | --------------- | ---------------------------------- |
| Register Client - Sucesso                  | POST   | `/api/auth/register/client`       | 201 Created     | User criado, email/msisdn únicos   |
| Register Client - Email duplicado          | POST   | `/api/auth/register/client`       | 400 Bad Request | Mensagem de erro apropriada        |
| Register Professional - Sucesso            | POST   | `/api/auth/register/professional` | 201 Created     | User + ProfessionalProfile criados |
| Register Professional - Profissão inválida | POST   | `/api/auth/register/professional` | 404 Not Found   | Profissão não existe               |
| Login - Sucesso                            | POST   | `/api/auth/login`                 | 200 OK          | Token retornado, user data         |
| Login - Credenciais inválidas              | POST   | `/api/auth/login`                 | 400 Bad Request | Mensagem de erro                   |
| Forgot Password - Sucesso                  | POST   | `/api/auth/forgot-password`       | 200 OK          | Mensagem genérica (segurança)      |
| Reset Password - Token inválido            | POST   | `/api/auth/reset-password`        | 400 Bad Request | Token inválido/expirado            |
| Confirm User - Token inválido              | POST   | `/api/auth/confirm`               | 400 Bad Request | Token inválido                     |

### 3. Profissões

| Teste                                  | Método | Endpoint                          | Status Esperado | Validações               |
| -------------------------------------- | ------ | --------------------------------- | --------------- | ------------------------ |
| List Professions                       | GET    | `/api/professions`                | 200 OK          | Lista de profissões      |
| Get Profession                         | GET    | `/api/professions/:id`            | 200 OK          | Dados da profissão       |
| Get Profession - Não existe            | GET    | `/api/professions/999`            | 404 Not Found   | Mensagem de erro         |
| Get Profession Expertises              | GET    | `/api/professions/:id/expertises` | 200 OK          | Lista de expertises      |
| Get Profession Expertises - Não existe | GET    | `/api/professions/999/expertises` | 404 Not Found   | Profissão não encontrada |
| Create Profession - Sucesso            | POST   | `/api/professions`                | 201 Created     | Profissão criada         |
| Create Profession - Nome duplicado     | POST   | `/api/professions`                | 400 Bad Request | Nome já existe           |
| Update Profession                      | PUT    | `/api/professions/:id`            | 200 OK          | Profissão atualizada     |
| Suspend Profession                     | PATCH  | `/api/professions/:id/suspend`    | 200 OK          | Status: suspended        |
| Delete Profession                      | DELETE | `/api/professions/:id`            | 200 OK          | Soft delete              |

### 4. SOS

| Teste                                    | Método | Endpoint                       | Status Esperado  | Validações                      |
| ---------------------------------------- | ------ | ------------------------------ | ---------------- | ------------------------------- |
| Find Nearby - Sucesso                    | GET    | `/api/sos/nearby`              | 200 OK           | Lista de mecânicos próximos     |
| Find Nearby - Sem resultados             | GET    | `/api/sos/nearby`              | 200 OK           | Array vazio                     |
| Create SOS Request - Sucesso             | POST   | `/api/sos/request`             | 201 Created      | Job criado, status: "notifying" |
| Create SOS Request - Sem auth            | POST   | `/api/sos/request`             | 401 Unauthorized | Token necessário                |
| Create SOS Request - Mecânico não existe | POST   | `/api/sos/request`             | 404 Not Found    | Mecânico não encontrado         |
| Create SOS Request - Mecânico ocupado    | POST   | `/api/sos/request`             | 400 Bad Request  | Status não é "free"             |
| Get SOS Request - Sucesso                | GET    | `/api/sos/request/:id`         | 200 OK           | Dados do pedido                 |
| Get SOS Request - Não existe             | GET    | `/api/sos/request/999`         | 404 Not Found    | Pedido não encontrado           |
| Confirm SOS Request - Sucesso            | POST   | `/api/sos/request/:id/confirm` | 200 OK           | Status: "accepted"              |
| Confirm SOS Request - Não é profissional | POST   | `/api/sos/request/:id/confirm` | 403 Forbidden    | Apenas profissionais            |
| Reject SOS Request - Sucesso             | POST   | `/api/sos/request/:id/reject`  | 200 OK           | Status: "canceled"              |
| Cancel SOS Request - Sucesso             | POST   | `/api/sos/request/:id/cancel`  | 200 OK           | Status: "canceled"              |
| SMS Webhook - Aceitar (1)                | POST   | `/api/sos/sms/webhook`         | 200 OK           | Action: "accepted"              |
| SMS Webhook - Recusar (2)                | POST   | `/api/sos/sms/webhook`         | 200 OK           | Action: "rejected"              |
| SMS Webhook - Resposta inválida          | POST   | `/api/sos/sms/webhook`         | 400 Bad Request  | Resposta inválida               |

## 🔄 Cenários de Teste End-to-End

### Cenário 1: Fluxo Completo - Cliente cria pedido, profissional aceita via app

**Passos:**

1. ✅ Health Check
2. ✅ Register Client
3. ✅ Register Professional (com profissão válida)
4. ✅ Login Client → Salva `client_token`
5. ✅ Login Professional → Salva `professional_token`
6. ✅ Find Nearby Mechanics → Salva `professional_profile_id`
7. ✅ Create SOS Request → Salva `sos_request_id`
8. ✅ Get SOS Request → Verifica status: "notifying"
9. ✅ Confirm SOS Request (Professional)
10. ✅ Get SOS Request → Verifica status: "accepted"

**Resultado Esperado:**

- Pedido criado com sucesso
- Status muda de "notifying" para "accepted"
- Profissional pode ver o pedido confirmado

### Cenário 2: Fluxo Completo - Cliente cria pedido, profissional aceita via SMS

**Passos:**

1. ✅ Health Check
2. ✅ Register Client
3. ✅ Register Professional (com msisdn válido)
4. ✅ Login Client → Salva `client_token`
5. ✅ Find Nearby Mechanics → Salva `professional_profile_id`
6. ✅ Create SOS Request → Salva `sos_request_id`
7. ✅ Get SOS Request → Verifica status: "notifying"
8. ✅ SMS Webhook (Accept - Response 1) → Usa msisdn do profissional
9. ✅ Get SOS Request → Verifica status: "accepted"

**Resultado Esperado:**

- Pedido criado com sucesso
- SMS enviado (simulado via log)
- Status muda de "notifying" para "accepted" após resposta SMS

### Cenário 3: Fluxo Completo - Cliente cria pedido, profissional recusa

**Passos:**

1. ✅ Health Check
2. ✅ Register Client
3. ✅ Register Professional
4. ✅ Login Client → Salva `client_token`
5. ✅ Login Professional → Salva `professional_token`
6. ✅ Find Nearby Mechanics → Salva `professional_profile_id`
7. ✅ Create SOS Request → Salva `sos_request_id`
8. ✅ Reject SOS Request (Professional)
9. ✅ Get SOS Request → Verifica status: "canceled"

**Resultado Esperado:**

- Pedido criado com sucesso
- Status muda para "canceled" após rejeição
- Cliente pode ver que o pedido foi recusado

### Cenário 4: Fluxo Completo - Cliente cancela pedido

**Passos:**

1. ✅ Health Check
2. ✅ Register Client
3. ✅ Register Professional
4. ✅ Login Client → Salva `client_token`
5. ✅ Find Nearby Mechanics → Salva `professional_profile_id`
6. ✅ Create SOS Request → Salva `sos_request_id`
7. ✅ Cancel SOS Request (Client)
8. ✅ Get SOS Request → Verifica status: "canceled"

**Resultado Esperado:**

- Pedido criado com sucesso
- Status muda para "canceled" após cancelamento
- Cliente pode cancelar seu próprio pedido

## 📝 Checklist de Validação

### Autenticação

- [ ] Cliente pode se registrar
- [ ] Profissional pode se registrar
- [ ] Login retorna token válido
- [ ] Token é aceito em endpoints protegidos
- [ ] Token inválido retorna 401

### Profissões

- [ ] Listar profissões retorna array
- [ ] Criar profissão funciona
- [ ] Nome duplicado é rejeitado
- [ ] Atualizar profissão funciona
- [ ] Suspender profissão funciona
- [ ] Deletar profissão (soft delete) funciona

### SOS

- [ ] Buscar mecânicos próximos retorna resultados
- [ ] Criar pedido SOS funciona
- [ ] Apenas clientes autenticados podem criar pedidos
- [ ] Profissional pode confirmar pedido
- [ ] Profissional pode recusar pedido
- [ ] Cliente pode cancelar pedido
- [ ] SMS webhook aceita resposta "1" (aceitar)
- [ ] SMS webhook aceita resposta "2" (recusar)
- [ ] Status do pedido muda corretamente

## 🐛 Casos de Erro a Testar

### Autenticação

- [ ] Email duplicado no registro
- [ ] MSISDN duplicado no registro
- [ ] Credenciais inválidas no login
- [ ] Token expirado/inválido

### Profissões

- [ ] Profissão não existe (404)
- [ ] Nome duplicado (400)
- [ ] Dados inválidos (422)

### SOS

- [ ] Mecânico não existe (404)
- [ ] Mecânico ocupado (400)
- [ ] Sem autenticação (401)
- [ ] Não é profissional tentando confirmar (403)
- [ ] Pedido já processado (400)
- [ ] Resposta SMS inválida (400)

## 📈 Métricas de Sucesso

- ✅ **100% dos endpoints testados**
- ✅ **Todos os cenários end-to-end funcionando**
- ✅ **Todos os casos de erro cobertos**
- ✅ **Variáveis automáticas funcionando**
- ✅ **Testes automatizados passando**

## 🚀 Como Executar

1. Importe a collection no Postman
2. Importe o environment
3. Execute os testes na ordem recomendada
4. Use o Collection Runner para executar todos de uma vez
5. Verifique os resultados na aba "Test Results"

## 📚 Documentação Adicional

- Veja `README.md` para instruções detalhadas de importação
- Veja os comentários em cada request na collection
- Consulte a documentação da API no código-fonte
