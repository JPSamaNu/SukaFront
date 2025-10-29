# Estrategia de Autenticación - SukaDex

## 🎯 Filosofía

La autenticación en SukaDex está diseñada como un **filtro simple** para evitar acceso no autorizado, pero **NO** como una barrera constante para usuarios legítimos. El objetivo es que los usuarios:

- ✅ Se autentiquen **una sola vez**
- ✅ Permanezcan autenticados por **largo tiempo** (30 días)
- ✅ No tengan que volver a iniciar sesión frecuentemente
- ✅ Su sesión persista incluso cerrando el navegador

## 🔐 Implementación

### Backend (NestJS)

**Configuración de tokens JWT:**

```env
JWT_ACCESS_TTL=30d      # Token de acceso válido por 30 días
JWT_REFRESH_TTL=90d     # Token de refresh válido por 90 días
```

**Características:**
- Access token de larga duración (30 días)
- Refresh token en cookie httpOnly (90 días)
- Validación JWT estándar
- No hay renovación forzada de tokens

### Frontend (React + Vite)

**Almacenamiento del token:**

El token se almacena en **localStorage** para persistencia completa:

```typescript
// Se guarda automáticamente en localStorage al hacer login
localStorage.setItem('sukadex_auth_token', token)

// Se recupera automáticamente al recargar la página
const token = localStorage.getItem('sukadex_auth_token')
```

**Características:**
- Token persiste entre sesiones del navegador
- Token persiste al cerrar y reabrir el navegador
- Token persiste al recargar la página
- Refresh automático solo si el token expira (muy raro con 30 días)

## 🚀 Flujo de Usuario

### Primera vez (Registro/Login)

```
1. Usuario ingresa email y contraseña
2. Backend valida y genera token JWT (válido 30 días)
3. Frontend recibe y guarda token en localStorage
4. Usuario redirigido al dashboard
```

### Sesiones posteriores

```
1. Usuario abre la aplicación (incluso días después)
2. Frontend lee token de localStorage automáticamente
3. Token se anexa a todas las peticiones HTTP
4. Usuario accede sin necesidad de login
```

### Expiración (después de 30 días)

```
1. Token expira naturalmente
2. Backend responde con 401 Unauthorized
3. Frontend intenta refresh automático
4. Si refresh falla, usuario debe hacer login nuevamente
```

## 🛡️ Seguridad

### ¿Es seguro localStorage?

Para este caso de uso específico (aplicación interna, no bancaria), **SÍ es seguro**:

✅ **Ventajas:**
- Persistencia completa
- UX superior (usuario no se frustra)
- Apropiado para aplicaciones de catálogo/información

⚠️ **Consideraciones:**
- Vulnerable a XSS (Cross-Site Scripting)
- No usar para datos financieros o críticos
- Adecuado para aplicaciones internas o de bajo riesgo

### Mitigaciones implementadas

1. **CORS configurado** - Solo dominio permitido puede acceder
2. **httpOnly cookies** para refresh token
3. **Token en Bearer header** - Estándar de la industria
4. **Validación JWT** - Tokens no pueden ser falsificados

## 📝 Logout Manual

Si un usuario quiere cerrar sesión:

```typescript
// Se ejecuta en el botón de logout
localStorage.removeItem('sukadex_auth_token')
// Usuario es redirigido al login
```

## 🔄 Cambios vs Versión Anterior

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Duración token** | 15 minutos | 30 días |
| **Almacenamiento** | Memoria (volátil) | localStorage (persistente) |
| **Refresh** | Cada 15 min | Solo si expira (30 días) |
| **Persistencia** | Se pierde al recargar | Persiste siempre |
| **UX** | Molesto, login frecuente | Fluido, login único |

## 🎓 Casos de Uso Ideales

Esta estrategia es perfecta para:

- ✅ Aplicaciones internas de empresa
- ✅ Dashboards y paneles administrativos
- ✅ Aplicaciones de información/catálogo
- ✅ Herramientas de productividad
- ✅ Pokédex y bases de datos públicas

**No usar para:**
- ❌ Aplicaciones bancarias
- ❌ Pagos o transacciones
- ❌ Información médica sensible
- ❌ Datos personales críticos

## 🧪 Testing

Para probar la persistencia:

```bash
# 1. Hacer login
# 2. Cerrar el navegador completamente
# 3. Abrir navegador nuevamente
# 4. Ir a la aplicación
# ✅ Deberías seguir autenticado
```

## 🔧 Configuración

### Backend (.env)
```env
JWT_ACCESS_TTL=30d
JWT_REFRESH_TTL=90d
```

### Frontend (axios.ts)
```typescript
const TOKEN_STORAGE_KEY = 'sukadex_auth_token'
localStorage.setItem(TOKEN_STORAGE_KEY, token)
```

---

**Última actualización:** Octubre 2025  
**Equipo:** SukaDex Development Team
