# Plano de Testes - Postman

Este diretório contém a collection do Postman completa para testar toda a API do sistema Mechanics.

## 📦 Arquivos

- `Mechanics_API.postman_collection.json` - Collection com todos os endpoints
- `Mechanics_API.postman_environment.json` - Variáveis de ambiente
- `README.md` - Este arquivo

## 🚀 Como Importar

### 1. Importar Collection

1. Abra o Postman
2. Clique em **Import** (canto superior esquerdo)
3. Selecione **File** ou **Upload Files**
4. Escolha o arquivo `Mechanics_API.postman_collection.json`
5. Clique em **Import**

### 2. Importar Environment

1. No Postman, clique em **Environments** (canto superior esquerdo)
2. Clique em **Import**
3. Escolha o arquivo `Mechanics_API.postman_environment.json`
4. Clique em **Import**
5. Selecione o environment **"Mechanics API - Development"** no dropdown

### 3. Configurar Base URL

Se sua API estiver rodando em uma porta diferente, edite a variável `base_url` no environment:

- Clique no environment
- Edite `base_url` para sua URL (ex: `http://localhost:3333`)

## 📋 Ordem Recomendada de Testes

### Fase 1: Setup Inicial

1. **Health Check** - Verificar se a API está rodando
   - ✅ Deve retornar `200 OK` com `{"hello": "world"}`

### Fase 2: Autenticação

2. **Register Client** - Criar conta de cliente
   - ✅ Deve retornar `201 Created`
   - ✅ Salva `client_user_id` automaticamente

3. **Register Professional** - Criar conta de profissional
   - ⚠️ **Importante**: Precisa de um `professionId` válido
   - ✅ Deve retornar `201 Created`
   - ✅ Salva `professional_user_id` automaticamente

4. **Login Client** - Fazer login como cliente
   - ✅ Deve retornar `200 OK` com token
   - ✅ Salva `client_token` automaticamente

5. **Login Professional** - Fazer login como profissional
   - ✅ Deve retornar `200 OK` com token
   - ✅ Salva `professional_token` automaticamente

### Fase 3: Professions (Opcional - se precisar criar profissões)

6. **List Professions** - Ver profissões disponíveis
   - ✅ Deve retornar lista de profissões

7. **Create Profession** - Criar nova profissão (se necessário)
   - ✅ Deve retornar `201 Created`
   - ✅ Salva `profession_id` automaticamente

### Fase 4: Fluxo SOS Completo

8. **Find Nearby Mechanics** - Buscar mecânicos próximos
   - ✅ Deve retornar `200 OK` com lista de mecânicos
   - ✅ Salva `professional_profile_id` do primeiro resultado
   - ⚠️ **Importante**: Precisa de profissionais cadastrados com `isVerified: true` e `status: 'free'`

9. **Create SOS Request** - Criar pedido SOS
   - ✅ Deve retornar `201 Created`
   - ✅ Salva `sos_request_id` automaticamente
   - ⚠️ **Requer**: Token de cliente (`client_token`)

10. **Get SOS Request** - Ver status do pedido
    - ✅ Deve retornar `200 OK` com detalhes do pedido
    - ⚠️ **Requer**: Token de cliente (`client_token`)

11. **Confirm SOS Request (Professional)** - Profissional aceita via app
    - ✅ Deve retornar `200 OK`
    - ⚠️ **Requer**: Token de profissional (`professional_token`)

12. **Reject SOS Request (Professional)** - Profissional recusa via app
    - ✅ Deve retornar `200 OK`
    - ⚠️ **Requer**: Token de profissional (`professional_token`)

13. **Cancel SOS Request (Client)** - Cliente cancela pedido
    - ✅ Deve retornar `200 OK`
    - ⚠️ **Requer**: Token de cliente (`client_token`)

### Fase 5: SMS Webhook (Simulação)

14. **SMS Webhook (Accept - Response 1)** - Simula profissional aceitando via SMS
    - ✅ Deve retornar `200 OK` com `action: 'accepted'`
    - ⚠️ **Nota**: Usa o `msisdn` do profissional cadastrado

15. **SMS Webhook (Reject - Response 2)** - Simula profissional recusando via SMS
    - ✅ Deve retornar `200 OK` com `action: 'rejected'`
    - ⚠️ **Nota**: Usa o `msisdn` do profissional cadastrado

## 🔄 Fluxo Completo de Teste

### Cenário 1: Cliente cria pedido SOS e profissional aceita via app

```
1. Health Check
2. Register Client
3. Register Professional
4. Login Client
5. Login Professional
6. Find Nearby Mechanics
7. Create SOS Request (com professional_profile_id do passo 6)
8. Get SOS Request (verificar status: "notifying")
9. Confirm SOS Request (Professional) (status muda para "accepted")
10. Get SOS Request (verificar status: "confirmed")
```

### Cenário 2: Cliente cria pedido SOS e profissional aceita via SMS

```
1. Health Check
2. Register Client
3. Register Professional
4. Login Client
5. Login Professional
6. Find Nearby Mechanics
7. Create SOS Request
8. Get SOS Request (verificar status: "notifying")
9. SMS Webhook (Accept - Response 1) (usar msisdn do profissional)
10. Get SOS Request (verificar status: "confirmed")
```

### Cenário 3: Cliente cria pedido SOS e profissional recusa

```
1. Health Check
2. Register Client
3. Register Professional
4. Login Client
5. Login Professional
6. Find Nearby Mechanics
7. Create SOS Request
8. Reject SOS Request (Professional)
9. Get SOS Request (verificar status: "canceled")
```

## 📝 Variáveis Automáticas

A collection salva automaticamente as seguintes variáveis após cada requisição:

- `client_token` - Token JWT do cliente (após login)
- `professional_token` - Token JWT do profissional (após login)
- `client_user_id` - ID do usuário cliente
- `professional_user_id` - ID do usuário profissional
- `professional_profile_id` - ID do perfil profissional (do primeiro resultado de "Find Nearby")
- `sos_request_id` - ID do pedido SOS criado
- `profession_id` - ID da profissão criada

## ⚠️ Pré-requisitos

### 1. API Rodando

Certifique-se de que a API está rodando:

```bash
npm run dev
# ou
docker compose -f docker-compose.dev.yml up
```

### 2. Banco de Dados

- Postgres deve estar rodando
- Migrations executadas: `node ace migration:run`
- Seeders executados (opcional): `node ace db:seed`

### 3. Dados de Teste

Para testar "Find Nearby Mechanics", você precisa de:

- Pelo menos 1 profissão cadastrada (ex: "Mecânico")
- Pelo menos 1 profissional cadastrado com:
  - `isVerified: true`
  - `status: 'free'`
  - `location` válida (PostGIS POINT)

## 🧪 Testes Automatizados

A collection inclui scripts de teste automáticos que verificam:

- Status codes corretos
- Estrutura das respostas
- Salvamento automático de variáveis

Para ver os resultados dos testes, abra a aba **Test Results** no Postman após cada requisição.

## 🔍 Troubleshooting

### Erro 401 (Unauthorized)

- Verifique se fez login e o token foi salvo
- Verifique se o token está sendo enviado no header `Authorization: Bearer {{token}}`

### Erro 404 (Not Found)

- Verifique se a API está rodando na porta correta
- Verifique se o `base_url` está correto no environment

### Erro 422 (Validation Error)

- Verifique os dados enviados no body
- Consulte os validators no código para ver os campos obrigatórios

### "Find Nearby Mechanics" retorna vazio

- Verifique se há profissionais cadastrados
- Verifique se os profissionais têm `isVerified: true` e `status: 'free'`
- Verifique se a localização está correta (PostGIS POINT)

### "Create SOS Request" falha

- Verifique se o `professional_profile_id` está correto
- Verifique se o profissional está com `status: 'free'`
- Verifique se o token de cliente está válido

## 📚 Endpoints Disponíveis

### Auth

- `POST /api/auth/register/client`
- `POST /api/auth/register/professional`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/confirm`

### Professions

- `GET /api/professions`
- `GET /api/professions/:id`
- `GET /api/professions/:id/expertises`
- `POST /api/professions`
- `PUT /api/professions/:id`
- `PATCH /api/professions/:id/suspend`
- `DELETE /api/professions/:id`

### SOS

- `GET /api/sos/nearby` (público)
- `POST /api/sos/request` (autenticado)
- `GET /api/sos/request/:id` (autenticado)
- `POST /api/sos/request/:id/confirm` (autenticado - profissional)
- `POST /api/sos/request/:id/reject` (autenticado - profissional)
- `POST /api/sos/request/:id/cancel` (autenticado - cliente)
- `POST /api/sos/sms/webhook` (público)

## 💡 Dicas

1. **Use o Collection Runner**: Execute toda a collection de uma vez
   - Clique com botão direito na collection → **Run collection**
   - Configure a ordem de execução
   - Veja os resultados de todos os testes

2. **Monitore as Variáveis**:
   - Clique em **Environment** → **View** para ver todas as variáveis
   - Verifique se os tokens estão sendo salvos corretamente

3. **Use Pre-request Scripts**:
   - Alguns requests já têm scripts que verificam pré-requisitos
   - Você pode adicionar mais validações se necessário

4. **Exportar Resultados**:
   - Use o Collection Runner para exportar resultados
   - Útil para documentação e relatórios

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs da API
2. Verifique o console do Postman (View → Show Postman Console)
3. Verifique se todas as migrations foram executadas
4. Verifique se o banco de dados está acessível
