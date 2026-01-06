# Arquitetura do Sistema de Autenticação

## Estrutura de Camadas

O sistema segue a arquitetura em camadas: **Controller → UseCase → Repository**

### 1. **Controller** (`app/controllers/`)
- Responsabilidade: Validação de dados de entrada e formatação de resposta
- Não contém lógica de negócio
- Valida dados usando validators
- Chama use cases
- Formata respostas HTTP

**Exemplo:**
```typescript
async registerClient({ request, response }: HttpContext) {
  const data = await request.validateUsing(registerClientValidator)
  const result = await this.registerClientUseCase.execute({ data })
  return response.status(201).json(result)
}
```

### 2. **UseCase** (`app/usecases/`)
- Responsabilidade: Lógica de negócio e orquestração
- Não acessa banco de dados diretamente
- Usa repositories para acesso a dados
- Usa services para operações externas (email, SMS)
- Gerencia transações quando necessário
- Lança exceções de negócio

**Exemplo:**
```typescript
async execute({ data }: { data: any }) {
  const trx = await db.transaction()
  try {
    // Validações de negócio
    const emailExists = await this.userRepository.findByEmail(data.email)
    if (emailExists) {
      throw new BadRequestException('O email já está em uso.')
    }
    
    // Criação usando repository
    const user = await this.userRepository.create({...data}, trx)
    
    // Operações de negócio
    await this.userRoleRepository.create({userId: user.id, role: 'client'}, trx)
    
    await trx.commit()
    return result
  } catch (error) {
    await trx.rollback()
    throw error
  }
}
```

### 3. **Repository** (`app/repositories/`)
- Responsabilidade: Acesso a dados (única camada que acessa o banco)
- Abstrai operações de banco de dados
- Retorna modelos ou null
- Aceita transações quando necessário
- Não contém lógica de negócio

**Exemplo:**
```typescript
async create(data: Partial<User>, trx?: TransactionClientContract): Promise<User> {
  return await User.create(data, { client: trx })
}

async findByEmail(email: string): Promise<User | null> {
  return await User.query().where('email', email).select('id').first()
}
```

## Repositories Criados

1. **UserRepository** - Operações com usuários
   - `create()` - Criar usuário
   - `findByEmail()` - Buscar por email
   - `findByMsisdn()` - Buscar por telefone
   - `findByEmailOrMsisdn()` - Buscar por email ou telefone
   - `findByVerificationToken()` - Buscar por token de verificação
   - `findByResetToken()` - Buscar por token de reset
   - `updatePassword()` - Atualizar senha
   - `updateResetToken()` - Atualizar token de reset
   - `verifyEmail()` - Verificar email
   - `findByIdWithRoles()` - Buscar com roles

2. **UserRoleRepository** - Operações com roles
   - `create()` - Criar role
   - `findByUserId()` - Buscar roles por usuário
   - `hasRole()` - Verificar se usuário tem role

3. **ProfessionRepository** - Operações com profissões
   - `findById()` - Buscar por ID
   - `findByIdOrFail()` - Buscar por ID ou lançar exceção
   - `findAll()` - Buscar todas

4. **ProfessionalProfileRepository** - Operações com perfis profissionais
   - `create()` - Criar perfil
   - `findByUserId()` - Buscar por usuário
   - `update()` - Atualizar perfil

## Use Cases Criados

1. **RegisterClientUseCase** - Registro de cliente
2. **RegisterProfessionalUseCase** - Registro de profissional
3. **LoginUserUseCase** - Login de usuário
4. **ForgotPasswordUseCase** - Recuperação de senha
5. **ResetPasswordUseCase** - Redefinição de senha
6. **ConfirmUserUseCase** - Confirmação de conta

## Services

1. **EmailService** - Envio de emails (estrutura pronta para integração)
2. **SmsService** - Envio de SMS (estrutura pronta para integração)

## Validação

- Validators em `app/validators/auth/`
- Cada endpoint tem seu validator específico
- Validação acontece no controller antes de chamar use case

## Benefícios desta Arquitetura

1. **Separação de Responsabilidades**: Cada camada tem uma responsabilidade clara
2. **Testabilidade**: Fácil de mockar repositories para testar use cases
3. **Manutenibilidade**: Código organizado e fácil de entender
4. **Reutilização**: Repositories podem ser reutilizados em diferentes use cases
5. **Flexibilidade**: Fácil trocar implementação de banco de dados

## Regras de Ouro

✅ **Controller**: Apenas valida e chama use case
✅ **UseCase**: Apenas lógica de negócio, usa repositories
✅ **Repository**: Apenas acesso a dados, sem lógica de negócio
❌ **Nunca**: Use case acessar modelo diretamente (exceto User.verifyCredentials que é do AdonisJS)
❌ **Nunca**: Controller acessar repository diretamente
❌ **Nunca**: Repository conter lógica de negócio

