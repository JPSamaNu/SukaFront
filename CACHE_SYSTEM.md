# 🗄️ Sistema de Caché - SukaDex Frontend

## ✨ Características

El sistema de caché implementado mejora significativamente el rendimiento de la aplicación:

- ✅ **Cache automático** de generaciones y Pokémon
- ✅ **Persistencia** usando localStorage del navegador
- ✅ **Expiración automática** después de 24 horas
- ✅ **Gestión inteligente** del espacio de almacenamiento
- ✅ **Reducción de peticiones** al backend

## 📦 ¿Qué se guarda en caché?

### 1. Lista de Generaciones
- **Clave**: `sukadex_cache_generations_all`
- **Duración**: 24 horas
- **Tamaño aproximado**: ~2 KB

### 2. Pokémon de cada Generación
- **Clave**: `sukadex_cache_generation_{id}`
- **Duración**: 24 horas
- **Tamaño aproximado**: ~150-300 KB por generación (dependiendo del número de Pokémon)

### 3. Pokémon Individuales
- **Clave**: `sukadex_cache_pokemon_{id}`
- **Duración**: 24 horas
- **Tamaño aproximado**: ~5-10 KB por Pokémon

## 🚀 Beneficios

### Antes del caché:
- ⏱️ Carga de generación 1: **10-30 segundos**
- 📡 Peticiones al backend: **Cada vez que navegas**
- 💾 Datos transferidos: **~300 KB cada vez**

### Con caché:
- ⚡ Carga de generación 1: **Instantánea** (segunda vez)
- 📡 Peticiones al backend: **Solo la primera vez**
- 💾 Datos transferidos: **0 KB** (después de la primera carga)

## 🔧 Uso del Sistema de Caché

### API de Generaciones
```typescript
import { generationsApi } from '@/shared/api/generations.api'

// Automáticamente usa caché si está disponible
const generations = await generationsApi.getAll()
const generation1 = await generationsApi.getById(1)

// Limpiar caché si es necesario
generationsApi.clearCache()
```

### API de Pokémon
```typescript
import { pokemonApi } from '@/shared/api/pokemon.api'

// Automáticamente usa caché si está disponible
const charizard = await pokemonApi.getById(6)

// Limpiar caché de un Pokémon específico
pokemonApi.clearCache(6)

// Limpiar todo el caché
pokemonApi.clearAllCache()
```

### Gestión Manual del Caché
```typescript
import { cache } from '@/shared/lib/cache'

// Guardar datos personalizados
cache.set('mi_clave', { data: 'valor' }, 60 * 60 * 1000) // 1 hora

// Obtener datos
const data = cache.get('mi_clave')

// Eliminar un elemento
cache.remove('mi_clave')

// Limpiar todo el caché de SukaDex
cache.clearAll()

// Ver tamaño del caché
const sizeInKB = cache.getCacheSize()
```

## 📊 Monitoreo del Caché

Puedes usar el componente `CacheManager` para ver y gestionar el caché:

```tsx
import CacheManager from '@/features/cache/CacheManager'

function Settings() {
  return (
    <div>
      <h1>Configuración</h1>
      <CacheManager />
    </div>
  )
}
```

## 🔍 Logs en Consola

El sistema muestra logs útiles para debugging:

```
📦 Generación 1 cargada desde caché (151 Pokémon)  ← Desde caché
🌐 Cargando generación 2 desde API                   ← Desde API
📦 Pokémon #25 cargado desde caché                   ← Desde caché
```

## ⚙️ Configuración

### Cambiar tiempo de expiración

Por defecto, los datos expiran en 24 horas. Para cambiar esto:

```typescript
// En generations.api.ts
cache.set(cacheKey, response.data, 7 * 24 * 60 * 60 * 1000) // 7 días
```

### Límites del localStorage

- **Máximo**: ~5-10 MB (varía por navegador)
- **Limpieza automática**: Si se llena, se eliminan los elementos expirados
- **Estimado**: Puedes cachear ~30-40 generaciones completas

## 🧹 Limpieza Automática

El caché se limpia automáticamente en estos casos:

1. **Al cargar la aplicación**: Elimina elementos expirados
2. **Cuando se llena el localStorage**: Elimina elementos antiguos
3. **Después de 24 horas**: Los datos expiran automáticamente

## 🐛 Troubleshooting

### Los datos no se actualizan
```typescript
// Forzar recarga eliminando el caché
generationsApi.clearCache()
window.location.reload()
```

### Error "QuotaExceededError"
```typescript
// Limpiar todo el caché
cache.clearAll()
```

### Ver qué hay en el caché
```javascript
// En la consola del navegador
Object.keys(localStorage)
  .filter(k => k.startsWith('sukadex_cache_'))
  .forEach(k => console.log(k, localStorage.getItem(k)?.length, 'chars'))
```

## 📝 Notas Importantes

1. **Privacidad**: Los datos se guardan en el navegador del usuario
2. **Sincronización**: El caché es por navegador (no se comparte entre dispositivos)
3. **Incógnito**: El caché se elimina al cerrar el modo incógnito
4. **Actualización de datos**: Si el backend se actualiza, el usuario debe esperar 24h o limpiar el caché manualmente

## 🎯 Mejores Prácticas

✅ **Hacer**: Usar el caché para datos que no cambian frecuentemente
✅ **Hacer**: Dejar expirar el caché automáticamente
✅ **Hacer**: Mostrar indicadores de carga (aunque sea del caché)

❌ **No hacer**: Cachear datos de autenticación sensibles
❌ **No hacer**: Cachear datos que cambian frecuentemente
❌ **No hacer**: Confiar 100% en el caché (siempre tener fallback a la API)
