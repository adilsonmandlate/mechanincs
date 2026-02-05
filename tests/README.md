# Guia de Testes

Este projeto usa [Japa](https://japa.dev/) como framework de testes, que é o framework oficial do AdonisJS.

## Estrutura de Testes

```
tests/
├── unit/              # Testes unitários (use cases, repositories)
│   ├── usecases/
│   └── repositories/
└── functional/        # Testes funcionais (controllers, endpoints HTTP)
    └── sos_controller.spec.ts
```

## Tipos de Testes

### 1. Testes Unitários (`tests/unit/`)

Testam componentes isolados:

- **Use Cases**: Testam lógica de negócio com mocks dos repositories e services
- **Repositories**: Testam acesso ao banco de dados (usando transações)

**Exemplo - Use Case:**

```typescript
test('should create SOS request successfully', async ({ assert }) => {
  // Mock dos dependencies
  const mockJobRepository = { create: async () => ({ id: 1 }) }

  const useCase = new CreateSosRequestUseCase(
    mockJobRepository as any
    // ... outros mocks
  )

  const result = await useCase.execute({ userId: 1, data })

  assert.exists(result.requestId)
})
```

**Exemplo - Repository:**

```typescript
test.group('UserRepository', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.teardown(() => testUtils.db().rollbackGlobalTransaction())

  test('should find user by email', async ({ assert }) => {
    const repository = new UserRepository()
    const user = await User.create({ email: 'test@example.com' })

    const found = await repository.findByEmail('test@example.com')

    assert.exists(found)
  })
})
```

### 2. Testes Funcionais (`tests/functional/`)

Testam endpoints HTTP completos:

- Criam dados reais no banco
- Fazem requisições HTTP
- Verificam respostas

**Exemplo:**

```typescript
test('should create SOS request', async ({ client, assert }) => {
  // Criar dados de teste
  const user = await User.create({ email: 'test@example.com' })

  // Fazer requisição
  const response = await client
    .post('/api/sos/request')
    .bearerToken(token)
    .json({ professionalId: 1, ... })

  // Verificar resposta
  response.assertStatus(201)
  assert.exists(response.body().requestId)
})
```

## Executando Testes

### Todos os testes

```bash
npm test
```

### Apenas testes unitários

```bash
npm test -- --suite=unit
```

### Apenas testes funcionais

```bash
npm test -- --suite=functional
```

### Um arquivo específico

```bash
npm test -- tests/unit/usecases/create_sos_request_usecase.spec.ts
```

### Com watch mode

```bash
npm test -- --watch
```

## Configuração do Banco de Dados de Teste

Os testes usam transações para isolar dados:

- Cada grupo de testes usa `withGlobalTransaction()` no setup
- Cada teste faz rollback no teardown
- Dados não persistem entre testes

**Variável de ambiente:**
Certifique-se de ter `DB_DATABASE` configurado no `.env` para um banco de teste separado.

## Boas Práticas

1. **Use Cases**: Sempre mocke repositories e services
2. **Repositories**: Use transações para isolar dados
3. **Controllers**: Use `client` do Japa para requisições HTTP
4. **Assertions**: Use `assert` do Japa para verificações
5. **Setup/Teardown**: Limpe dados após cada teste

## Exemplos de Testes

### Testando Exceções

```typescript
await assert.rejects(
  () => useCase.execute({ userId: 1, data }),
  NotFoundException,
  'Mecânico não encontrado.'
)
```

### Testando Autenticação

```typescript
const loginResponse = await client.post('/api/auth/login').json({
  identifier: 'user@example.com',
  password: 'password123',
})

const token = loginResponse.body().token

const response = await client
  .post('/api/sos/request')
  .bearerToken(token)
  .json({ ... })
```

### Testando Validação

```typescript
const response = await client.post('/api/sos/request').json({}) // Dados inválidos

response.assertStatus(422) // Unprocessable Entity
```

## Cobertura de Testes

Aim for:

- ✅ 80%+ cobertura em use cases (lógica de negócio)
- ✅ 70%+ cobertura em repositories (operações críticas)
- ✅ 60%+ cobertura em controllers (endpoints principais)

## Troubleshooting

### Erro: "Database connection failed"

- Verifique se o banco de teste está configurado no `.env`
- Certifique-se de que o Postgres está rodando

### Erro: "Transaction already started"

- Verifique se está usando `withGlobalTransaction()` corretamente
- Não misture transações manuais com `testUtils.db()`

### Erro: "Model not found"

- Certifique-se de que as migrations foram executadas
- Use `testUtils.db().migrate()` no setup se necessário
