# Mechanics API – Especificação para o Frontend

Este documento descreve a API do backend **Mechanics** para uso na construção do frontend (web ou mobile). Use-o como base para o prompt de desenvolvimento do frontend.

---

## 1. Visão geral

- **Stack backend:** AdonisJS 6 (Node.js), PostgreSQL com PostGIS (geolocalização).
- **Autenticação:** Bearer token (Access Token). Login retorna um token que deve ser enviado no header `Authorization: Bearer <token>` em rotas protegidas.
- **Formato:** JSON em request e response. Content-Type: `application/json`.
- **Base URL:** Definida no ambiente (ex.: `http://localhost:3333`). **Não há prefixo `/api`** nas rotas atuais.

---

## 2. Respostas de erro

- **400 Bad Request** – Regra de negócio (ex.: email em uso, mecânico ocupado).
- **401 Unauthorized** – Não autenticado ou token inválido/expirado.
- **403 Forbidden** – Autenticado mas sem permissão (ex.: só profissional pode confirmar).
- **404 Not Found** – Recurso não encontrado.
- **422 Unprocessable Entity** – Erro de validação (Vine). Corpo típico com `message` e detalhes por campo.
- **500 Internal Server Error** – Erro interno.

Formato padrão de erro (AppException e handler):

```json
{
  "message": "Mensagem legível",
  "code": "OPCIONAL_CODE"
}
```

Em validação (422), a resposta pode incluir lista de erros por campo.

---

## 3. Rotas e contratos

### 3.1 Health check

| Método | Rota   | Auth | Descrição      |
|--------|--------|------|----------------|
| GET    | `/`    | Não  | Health check   |

**Response 200:**

```json
{
  "hello": "world"
}
```

---

### 3.2 Autenticação (prefixo `/auth`)

#### 3.2.1 Registrar cliente

| Método | Rota                    | Auth |
|--------|-------------------------|------|
| POST   | `/auth/register/client` | Não  |

**Body:**

```json
{
  "name": "string (3-255)",
  "email": "string (email)",
  "msisdn": "string (E.164, ex: +258841234567)",
  "password": "string (mín. 8)",
  "gender": "male" | "female",
  "birthdate": "string (ISO date, opcional)"
}
```

**Response 201:**

```json
{
  "message": "Registro realizado com sucesso. Verifique seu email e SMS para confirmar sua conta."
}
```

**Erros:** 400 se email ou msisdn já em uso.

---

#### 3.2.2 Registrar profissional

| Método | Rota                         | Auth |
|--------|------------------------------|------|
| POST   | `/auth/register/professional`| Não  |

**Body:**

```json
{
  "name": "string (3-255)",
  "email": "string (email)",
  "msisdn": "string (E.164)",
  "password": "string (mín. 8)",
  "gender": "male" | "female",
  "birthdate": "string (ISO date, opcional)",
  "professionId": "number (ID da profissão)",
  "education": "none" | "primary" | "secondary" | "university" | "master" | "phd",
  "yearsOfExperience": "number (>= 0)",
  "about": "string (máx. 1000, opcional)",
  "location": {
    "latitude": "number (-90 a 90)",
    "longitude": "number (-180 a 180)"
  }
}
```

**Response 201:**

```json
{
  "user": {
    "id": "number",
    "name": "string",
    "email": "string",
    "msisdn": "string"
  },
  "message": "Registro realizado com sucesso. Verifique seu email e SMS para confirmar sua conta."
}
```

**Erros:** 400 email/msisdn em uso; 404 profissão não encontrada.

---

#### 3.2.3 Login

| Método | Rota           | Auth |
|--------|----------------|------|
| POST   | `/auth/login`  | Não  |

**Body:**

```json
{
  "identifier": "string (email ou msisdn)",
  "password": "string"
}
```

**Response 200:**

```json
{
  "token": "string (Bearer token)",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string",
    "msisdn": "string",
    "emailVerified": "boolean",
    "msisdnVerified": "boolean",
    "roles": ["client"] | ["professional"] | ["client", "professional"]
  }
}
```

**Erros:** 400 credenciais inválidas ou email não verificado.

---

#### 3.2.4 Esqueci a senha

| Método | Rota                   | Auth |
|--------|------------------------|------|
| POST   | `/auth/forgot-password`| Não  |

**Body:**

```json
{
  "identifier": "string (email ou msisdn)"
}
```

**Response 200:** Sempre a mesma mensagem (segurança):

```json
{
  "message": "Se o email/número existir, você receberá instruções para redefinir sua senha."
}
```

---

#### 3.2.5 Redefinir senha

| Método | Rota                  | Auth |
|--------|-----------------------|------|
| POST   | `/auth/reset-password`| Não  |

**Body:**

```json
{
  "token": "string (token recebido por email/SMS)",
  "password": "string (mín. 8)"
}
```

**Response 200:**

```json
{
  "message": "Senha redefinida com sucesso. Faça login com sua nova senha."
}
```

**Erros:** 400 token inválido ou expirado.

---

#### 3.2.6 Confirmar conta (email/SMS)

| Método | Rota             | Auth |
|--------|------------------|------|
| POST   | `/auth/confirm`  | Não  |

**Body:**

```json
{
  "token": "string (token de verificação)"
}
```

**Response 200:**

```json
{
  "message": "Email verificado com sucesso!"
}
```

**Erros:** 400 token inválido ou email já verificado.

---

### 3.3 Profissões (prefixo `/professions`)

Todas as rotas abaixo são **sem autenticação** no código atual (nenhum `.use(middleware.auth())` no grupo).

#### 3.3.1 Listar profissões

| Método | Rota               | Auth |
|--------|--------------------|------|
| GET    | `/professions`     | Não  |

**Response 200:**

```json
[
  {
    "id": "number",
    "code": "string | null",
    "name": "string"
  }
]
```

---

#### 3.3.2 Obter profissão por ID

| Método | Rota                | Auth |
|--------|---------------------|------|
| GET    | `/professions/:id`  | Não  |

**Response 200:**

```json
{
  "id": "number",
  "code": "string | null",
  "name": "string"
}
```

**Erros:** 404 se não existir.

---

#### 3.3.3 Expertises da profissão

| Método | Rota                          | Auth |
|--------|-------------------------------|------|
| GET    | `/professions/:id/expertises` | Não  |

**Response 200:**

```json
[
  {
    "id": "number",
    "name": "string",
    "description": "string | null",
    "icon": "string | null"
  }
]
```

**Erros:** 404 se profissão não existir.

---

#### 3.3.4 Criar profissão

| Método | Rota               | Auth |
|--------|--------------------|------|
| POST   | `/professions`     | Não  |

**Body:**

```json
{
  "name": "string (2-255)"
}
```

**Response 201:**

```json
{
  "id": "number",
  "name": "string",
  "suspended": "boolean"
}
```

**Erros:** 400 se já existir profissão com o mesmo nome.

---

#### 3.3.5 Atualizar profissão

| Método | Rota                | Auth |
|--------|---------------------|------|
| PUT    | `/professions/:id`  | Não  |

**Body:**

```json
{
  "name": "string (2-255, opcional)"
}
```

**Response 200:** Mesmo formato do create (id, name, suspended).

**Erros:** 404 não encontrada; 400 nome duplicado.

---

#### 3.3.6 Suspender profissão

| Método | Rota                        | Auth |
|--------|-----------------------------|------|
| PATCH  | `/professions/:id/suspend`  | Não  |

**Response 200:**

```json
{
  "id": "number",
  "name": "string",
  "suspended": "boolean"
}
```

---

#### 3.3.7 Remover profissão

| Método | Rota                | Auth |
|--------|---------------------|------|
| DELETE | `/professions/:id`  | Não  |

**Response 200:**

```json
{
  "message": "Profissão removida com sucesso."
}
```

---

### 3.4 SOS (prefixo `/sos`)

#### 3.4.1 Buscar mecânicos próximos (público)

| Método | Rota           | Auth |
|--------|----------------|------|
| GET    | `/sos/nearby`  | Não  |

**Query params:**

- `latitude` (number, -90 a 90) – obrigatório
- `longitude` (number, -180 a 180) – obrigatório
- `radius` (number, 1 a 100, opcional) – raio em km (default 10)

**Response 200:** Array de profissionais ordenados por distância (mais próximo primeiro).

```json
[
  {
    "id": "number (professional profile id)",
    "userId": "number",
    "name": "string",
    "profilePhoto": "string | null",
    "isVerified": "boolean",
    "rating": "number",
    "ratingCount": "number",
    "distance": "string (ex: \"1.85 km\")",
    "profession": "string",
    "status": "free | busy | pending",
    "yearsOfExperience": "number",
    "responseRate": "number (ex: 95)",
    "expertises": [
      { "id": "number", "name": "string" }
    ]
  }
]
```

Só retorna profissionais com `status: 'free'` e `isVerified: true`.

---

#### 3.4.2 Criar pedido SOS (autenticado – cliente)

| Método | Rota             | Auth        |
|--------|------------------|-------------|
| POST   | `/sos/request`   | Bearer token|

**Header:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "professionalId": "number (ID do perfil profissional, não userId)",
  "problemDescription": "string (10-1000)",
  "location": {
    "latitude": "number (-90 a 90)",
    "longitude": "number (-180 a 180)"
  }
}
```

**Response 201:**

```json
{
  "requestId": "number",
  "status": "notifying",
  "professional": {
    "id": "number",
    "name": "string"
  },
  "message": "string",
  "createdAt": "string (ISO datetime)"
}
```

**Erros:** 401 sem token; 404 mecânico não encontrado; 400 mecânico não disponível (não está `free`).

---

#### 3.4.3 Obter pedido SOS (autenticado – dono do pedido)

| Método | Rota                  | Auth        |
|--------|-----------------------|-------------|
| GET    | `/sos/request/:id`    | Bearer token|

**Response 200:** Estrutura varia conforme `status`.

- **Enquanto notifying/notified (não confirmado):**

```json
{
  "requestId": "number",
  "status": "notifying" | "notified",
  "professional": { "id": "number", "name": "string" } | null,
  "message": "string",
  "smsSentAt": "string | null (ISO)",
  "confirmedAt": "null",
  "createdAt": "string (ISO)"
}
```

- **Quando confirmado (`status: "confirmed"`):**

Inclui também `problemDescription` e `professional` completo, por exemplo:

- `professional.profilePhoto`, `msisdn`, `phoneFormatted`, `isVerified`, `rating`, `ratingCount`, `profession`, `yearsOfExperience`, `about`, `location`, `distance`, `distanceFormatted`, `responseRate`, `acceptanceRate`

**Erros:** 401 sem token; 404 pedido não encontrado ou não pertence ao usuário.

---

#### 3.4.4 Confirmar pedido SOS (autenticado – profissional)

| Método | Rota                        | Auth        |
|--------|-----------------------------|-------------|
| POST   | `/sos/request/:id/confirm`  | Bearer token|

**Response 200:**

```json
{
  "message": "Pedido SOS confirmado com sucesso.",
  "requestId": "number"
}
```

**Erros:** 401 sem token; 403 usuário não é profissional; 404 pedido não encontrado; 400 pedido não é do profissional ou já processado.

---

#### 3.4.5 Recusar pedido SOS (autenticado – profissional)

| Método | Rota                       | Auth        |
|--------|----------------------------|-------------|
| POST   | `/sos/request/:id/reject`   | Bearer token|

**Response 200:**

```json
{
  "message": "Pedido SOS recusado.",
  "requestId": "number"
}
```

**Erros:** 401; 403 não profissional; 404; 400 já processado ou não é do profissional.

---

#### 3.4.6 Cancelar pedido SOS (autenticado – cliente)

| Método | Rota                       | Auth        |
|--------|----------------------------|-------------|
| POST   | `/sos/request/:id/cancel`  | Bearer token|

**Response 200:**

```json
{
  "message": "Pedido cancelado com sucesso.",
  "requestId": "number"
}
```

**Erros:** 401; 404; 400 não é dono do pedido, já cancelado ou já completado.

---

#### 3.4.7 Webhook SMS (público – uso do provedor de SMS)

| Método | Rota                 | Auth |
|--------|----------------------|------|
| POST   | `/sos/sms/webhook`   | Não  |

Recebe resposta do profissional por SMS (1 = aceitar, 2 = recusar). Body depende do provedor; a API espera campos como `From`/`from`/`msisdn` e `Body`/`body`/`message`.

**Response 200 (aceitar):**

```json
{
  "message": "Pedido SOS aceito com sucesso.",
  "requestId": "number",
  "action": "accepted"
}
```

**Response 200 (recusar):**

```json
{
  "message": "Pedido SOS recusado.",
  "requestId": "number",
  "action": "rejected"
}
```

**Erros:** 400 msisdn/mensagem ausentes, resposta inválida ou pedido já processado; 404 usuário ou pedido não encontrado.

---

## 4. Fluxos de uso no frontend

### 4.1 Registro e login

1. **Cliente:** POST `/auth/register/client` → usuário deve confirmar email/SMS → POST `/auth/confirm` com token → POST `/auth/login` com `identifier` + `password` → guardar `token` e `user`.
2. **Profissional:** GET `/professions` para listar profissões → POST `/auth/register/professional` (com `professionId` e `location`) → confirmar conta → login → guardar token e user.

### 4.2 Fluxo SOS (cliente)

1. GET `/sos/nearby?latitude=&longitude=&radius=` → listar mecânicos.
2. Usuário escolhe um profissional (usar `id` do item da lista = `professionalId`).
3. POST `/sos/request` (autenticado) com `professionalId`, `problemDescription`, `location` → recebe `requestId`.
4. GET `/sos/request/:id` para polling do status (`notifying` → `notified` → `confirmed` ou `canceled`).
5. Se confirmado, exibir dados completos do profissional (incluindo contato).
6. Cliente pode cancelar com POST `/sos/request/:id/cancel`.

### 4.3 Fluxo SOS (profissional)

1. Login como profissional.
2. Para aceitar/recusar pelo app: GET do pedido (se houver endpoint listando pedidos do profissional – hoje não documentado) ou receber `requestId` por outro canal → POST `/sos/request/:id/confirm` ou POST `/sos/request/:id/reject`.

---

## 5. Dados úteis para o frontend

- **Roles:** `client`, `professional`. Um usuário pode ter ambos.
- **Status do perfil profissional:** `free`, `busy`, `pending` (só `free` aparece em “mecânicos próximos”).
- **Status do pedido SOS:** `notifying`, `notified`, `confirmed`, `canceled`.
- **MSISDN:** sempre em formato E.164 (ex.: `+258841234567`).
- **Datas:** ISO 8601 (ex.: `createdAt`, `smsSentAt`, `confirmedAt`).
- **Localização:** latitude/longitude em números; no backend a coluna `location` é armazenada como PostGIS POINT (o front envia apenas `{ latitude, longitude }` onde a API pede).

---

## 6. Checklist para o prompt do frontend

Ao montar o prompt para o frontend, incluir:

1. **Base URL** da API e que não há prefixo `/api`.
2. **Autenticação:** header `Authorization: Bearer <token>`; token obtido em POST `/auth/login`; tratar 401 (renovar login ou redirecionar).
3. **Rotas públicas vs protegidas:** lista das que exigem auth (todas as que alteram ou leem pedido SOS, exceto `/sos/nearby` e `/sos/sms/webhook`).
4. **Contratos de request/response** deste documento (copiar os JSONs relevantes para o fluxo que o front vai implementar).
5. **Tratamento de erros:** 400, 401, 403, 404, 422, 500 e formato `{ message, code? }`.
6. **Fluxos principais:** registro cliente/profissional, login, “mecânicos próximos”, criar pedido SOS, polling do pedido, confirmar/recusar (profissional), cancelar (cliente).
7. **Tipos/entidades:** User (com roles), Profession, Expertise, NearbyProfessional, SOS Request (e estados), Professional (detalhe quando confirmado).

Com isso, o prompt do frontend pode referenciar este arquivo como "especificação da API" e implementar chamadas e estados de tela de forma alinhada ao backend.

---

## 7. Modelo de prompt para o frontend

Use o texto abaixo como base para criar o prompt (para um dev ou para uma IA) que vai implementar o frontend. Ajuste o escopo (ex.: só app cliente, só app profissional, ou ambos).

```markdown
Construa o frontend da aplicação Mechanics usando a API REST documentada em docs/FRONTEND_API_SPEC.md.

Requisitos gerais:
- Base URL da API: [definir, ex: http://localhost:3333]. Não há prefixo /api.
- Autenticação: Bearer token no header Authorization. Token obtido em POST /auth/login (identifier + password). Persistir token e user (ex.: localStorage/sessionStorage ou estado global). Em 401, redirecionar para login.
- Todas as requisições e respostas são JSON. Tratar erros 400, 401, 403, 404, 422 e 500 conforme formato da especificação (message, code quando existir).

Escopo do frontend (ajustar conforme necessidade):
1. Telas de autenticação: registro (cliente e profissional), login, esqueci senha, redefinir senha, confirmar conta (com token na URL ou input).
2. Para clientes: listar mecânicos próximos (GET /sos/nearby com latitude, longitude, radius opcional), criar pedido SOS (POST /sos/request com professionalId, problemDescription, location), ver detalhe do pedido (GET /sos/request/:id) com polling até status confirmed ou canceled, cancelar pedido (POST /sos/request/:id/cancel). professionalId é o id do item retornado em /sos/nearby.
3. Para profissionais: confirmar pedido (POST /sos/request/:id/confirm) e recusar (POST /sos/request/:id/reject). Assumir que o profissional recebe o requestId por outro meio (notificação, lista de pedidos, etc.) até que exista endpoint de listagem no backend.
4. Profissões: listar (GET /professions) e, no registro de profissional, listar expertises (GET /professions/:id/expertises) se necessário para UI.

Regras de negócio a refletir na UI:
- Só usuário com role client pode criar/cancelar pedido SOS; só professional pode confirmar/recusar.
- Em /sos/nearby, distance vem como string (ex.: "1.85 km"). Status do profissional: free | busy | pending.
- Status do pedido: notifying → notified → confirmed ou canceled. Quando status for confirmed, a resposta de GET /sos/request/:id inclui dados completos do profissional (telefone, etc.) para o cliente contactar.

Stack e UX (exemplo – ajustar):
- [Ex.: React/Next.js + TypeScript, ou React Native, etc.]
- [Ex.: tratamento de loading, erro e estados vazios em todas as listagens e formulários]
- [Ex.: uso de geolocalização do browser para preencher latitude/longitude em “mecânicos próximos” e ao criar pedido]
```

Referência única da API: docs/FRONTEND_API_SPEC.md (contém todos os endpoints, body, response e códigos de erro).
```
