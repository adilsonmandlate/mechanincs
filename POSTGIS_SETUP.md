# PostGIS Setup e Uso

## O que foi implementado

1. **Extensão PostGIS habilitada** no PostgreSQL
2. **Campos de location** convertidos de `VARCHAR` para `geography(POINT, 4326)`
3. **Campo `address`** adicionado para endereços legíveis
4. **LocationService** criado para trabalhar com PostGIS
5. **Modelos atualizados** para trabalhar com coordenadas

## Estrutura

### Migrations

1. **`1767738830927_create_enable_postgis_extensions_table.ts`**
   - Habilita a extensão PostGIS no banco de dados

2. **`1767738853595_create_update_location_fields_to_postgis_table.ts`**
   - Converte campos `location` de `VARCHAR` para `geography(POINT, 4326)`
   - Adiciona campo `address` para endereços legíveis
   - Aplica em `professional_profiles` e `jobs`

### Docker

O `docker-compose.dev.yml` foi atualizado para usar a imagem `postgis/postgis:17-3.4` que já inclui PostGIS.

### Modelos

Os modelos `ProfessionalProfile` e `Job` agora suportam:

```typescript
location: string | { latitude: number; longitude: number } | null
address: string | null
```

O campo `location` aceita:
- Objeto com `{ latitude, longitude }` - será convertido para PostGIS POINT
- String PostGIS POINT - será parseada para objeto
- `null` - para valores opcionais

### LocationService

Serviço criado em `app/services/location_service.ts` com métodos úteis:

- `calculateDistance()` - Calcula distância entre dois pontos
- `getWithinRadiusQuery()` - Retorna SQL para buscar pontos dentro de um raio
- `getDistanceQuery()` - Retorna SQL para calcular distância
- `toPostGISPoint()` - Converte objeto para formato PostGIS

## Como usar

### Criar um registro com location

```typescript
// No use case ou repository
await professionalProfileRepository.create({
  userId: 1,
  professionId: 1,
  education: 'university',
  yearsOfExperience: 5,
  location: { latitude: -25.4284, longitude: 28.0424 },
  address: 'Rua das Flores, 123, Maputo',
  // ... outros campos
})
```

### Buscar profissionais próximos

```typescript
import { LocationService } from '#services/location_service'

const locationService = new LocationService()
const centerPoint = { latitude: -25.4284, longitude: 28.0424 }
const radiusKm = 10

// Usar em query
const professionals = await ProfessionalProfile.query()
  .whereRaw(locationService.getWithinRadiusQuery(centerPoint, radiusKm))
  .select('*', db.rawQuery(locationService.getDistanceQuery(centerPoint)))
  .orderBy('distance_km', 'asc')
```

### Calcular distância

```typescript
const distance = await locationService.calculateDistance(
  { latitude: -25.4284, longitude: 28.0424 },
  { latitude: -25.4500, longitude: 28.0500 }
)
// Retorna distância em quilômetros
```

## Formato PostGIS

O PostGIS usa o formato `POINT(longitude latitude)` (note a ordem: longitude primeiro).

- **SRID 4326**: Sistema de coordenadas WGS84 (usado por GPS)
- **geography**: Tipo que calcula distâncias em metros/quilômetros (melhor para coordenadas geográficas)
- **geometry**: Tipo que calcula distâncias em graus (melhor para projeções planas)

## Exemplo de Query SQL

```sql
-- Buscar profissionais dentro de 10km
SELECT 
  *,
  ST_Distance(
    location::geography,
    ST_GeogFromText('POINT(28.0424 -25.4284)')
  ) / 1000 as distance_km
FROM professional_profiles
WHERE ST_DWithin(
  location::geography,
  ST_GeogFromText('POINT(28.0424 -25.4284)'),
  10000  -- 10km em metros
)
ORDER BY distance_km ASC;
```

## Próximos passos

1. Criar índices espaciais para melhor performance:
   ```sql
   CREATE INDEX idx_professional_profiles_location ON professional_profiles USING GIST (location);
   CREATE INDEX idx_jobs_location ON jobs USING GIST (location);
   ```

2. Implementar busca de mecânicos próximos no use case de SOS

3. Adicionar validação de coordenadas (latitude: -90 a 90, longitude: -180 a 180)

