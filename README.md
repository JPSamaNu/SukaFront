# SukaFront# React + TypeScript + Vite



SPA mobile-first desarrollada con React + TypeScript que consume una API de Pokédex. Implementa autenticación segura con access tokens en memoria y refresh tokens en cookies httpOnly.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## ✨ CaracterísticasCurrently, two official plugins are available:



- 🔐 **Autenticación segura**: Access token en memoria + refresh automático con cookies httpOnly- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- 📱 **Mobile-first**: Diseño responsive optimizado para móviles- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- 🎨 **UI moderna**: Componentes con Tailwind CSS y diseño inspirado en Pokédex

- 🔍 **Búsqueda reactiva**: Filtrado en tiempo real de Pokémon## React Compiler

- ⚡ **Performance**: Imágenes lazy loading y skeletons durante carga

- 🧪 **Testing**: Tests unitarios con Vitest + Testing LibraryThe React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

- 🔧 **DX optimizado**: TypeScript estricto, ESLint, Prettier y alias de rutas

## Expanding the ESLint configuration

## 🛠️ Stack Técnico

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

### Frontend

- **React 19** + **TypeScript 5** (modo estricto)```js

- **Vite** con SWC para build ultra-rápidoexport default defineConfig([

- **React Router v7** para enrutado  globalIgnores(['dist']),

- **Tailwind CSS** para estilos + componentes personalizados tipo shadcn/ui  {

    files: ['**/*.{ts,tsx}'],

### Formularios & Validación    extends: [

- **react-hook-form** para manejo de formularios      // Other configs...

- **Zod** para validación de esquemas

      // Remove tseslint.configs.recommended and replace with this

### HTTP & Estado      tseslint.configs.recommendedTypeChecked,

- **Axios** con interceptores para auth automático      // Alternatively, use this for stricter rules

- **useState/useContext** para estado de autenticación      tseslint.configs.strictTypeChecked,

- Access token en memoria (+ sessionStorage opcional con feature flag)      // Optionally, add this for stylistic rules

      tseslint.configs.stylisticTypeChecked,

### Calidad de Código

- **ESLint** + **@typescript-eslint** para linting      // Other configs...

- **Prettier** para formateo automático    ],

- **Vitest** + **@testing-library/react** para testing    languageOptions: {

      parserOptions: {

## 🚀 Inicio Rápido        project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

### Prerrequisitos      },

- Node.js 18+       // other options...

- pnpm (recomendado) o npm    },

  },

### Instalación])

```

```bash

# Instalar dependenciasYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

pnpm i

```js

# Configurar variables de entorno// eslint.config.js

cp .env.example .envimport reactX from 'eslint-plugin-react-x'

import reactDom from 'eslint-plugin-react-dom'

# Iniciar servidor de desarrollo

pnpm devexport default defineConfig([

  globalIgnores(['dist']),

# Ejecutar tests  {

pnpm test    files: ['**/*.{ts,tsx}'],

    extends: [

# Build y preview      // Other configs...

pnpm build && pnpm preview      // Enable lint rules for React

```      reactX.configs['recommended-typescript'],

      // Enable lint rules for React DOM

### Scripts Disponibles      reactDom.configs.recommended,

    ],

```bash    languageOptions: {

# Desarrollo      parserOptions: {

pnpm dev                 # Servidor de desarrollo        project: ['./tsconfig.node.json', './tsconfig.app.json'],

pnpm build              # Build de producción        tsconfigRootDir: import.meta.dirname,

pnpm preview            # Preview del build      },

      // other options...

# Calidad de código    },

pnpm lint               # Ejecutar ESLint  },

pnpm lint:fix           # Arreglar problemas de ESLint automáticamente])

pnpm format             # Formatear código con Prettier```


# Testing
pnpm test               # Ejecutar tests
pnpm test:ui            # Tests con interfaz visual
pnpm test:coverage      # Tests con reporte de cobertura
```

## 🔐 Flujo de Autenticación

### Configuración de Seguridad

El sistema implementa una estrategia de autenticación segura:

1. **Access Token**: Se almacena **solo en memoria** (variable JavaScript)
2. **Refresh Token**: Cookie httpOnly enviada automáticamente por el navegador
3. **Intercepción Automática**: Ante 401, intenta refresh y reintenta la request original

### Feature Flag: SessionStorage Fallback

Por defecto **deshabilitado** por seguridad. Para habilitar:

```bash
# En .env
VITE_ENABLE_SESSION_FALLBACK=true
```

⚠️ **Solo para desarrollo**: SessionStorage es menos seguro que memoria pura.

### Endpoints Esperados

```typescript
// Login
POST /auth/login
Body: { email: string, password: string }
Response: { accessToken: string }
// Cookie httpOnly 'refreshToken' se setea automáticamente

// Refresh (automático)
POST /auth/refresh  
// Cookie httpOnly se envía automáticamente
Response: { accessToken: string }

// Logout (opcional)
POST /auth/logout
```

## 📱 Funcionalidades

### 🔑 Autenticación
- Formulario de login con validación Zod
- Redirección automática tras autenticación
- Logout con limpieza de tokens
- Rutas protegidas con `ProtectedRoute`

### 🔍 Pokédex
- Lista de Pokémon con grid responsive (2/4/6 columnas)
- Búsqueda por nombre o número en tiempo real
- Vista de detalles con estadísticas
- Imágenes de alta calidad desde PokeAPI
- Navegación fluida entre páginas

### 🎨 UI/UX
- Diseño inspirado en Pokédex clásica (rojo/amarillo/azul)
- Skeletons durante cargas
- Estados de error amigables
- Accesibilidad con ARIA labels
- Hover effects y transiciones suaves

## 🧪 Testing

### Cobertura de Tests

- ✅ **LoginPage**: Validación de formularios, manejo de errores, envío de datos
- ✅ **ProtectedRoute**: Redirección, estados de loading, renderizado condicional

### Ejecutar Tests

```bash
# Tests en watch mode
pnpm test

# Tests con UI visual
pnpm test:ui

# Cobertura de código
pnpm test:coverage
```

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   └── routes.tsx              # Configuración de React Router
├── features/
│   ├── auth/
│   │   ├── AuthContext.tsx     # Contexto de autenticación
│   │   ├── LoginPage.tsx       # Página de login con formulario
│   │   ├── ProtectedRoute.tsx  # Wrapper para rutas protegidas
│   │   └── tests/              # Tests unitarios
│   ├── layout/
│   │   └── MainLayout.tsx      # Layout principal con header
│   └── pokedex/
│       ├── PokedexPage.tsx     # Lista principal de Pokémon
│       ├── PokemonCard.tsx     # Tarjeta individual de Pokémon
│       └── PokemonDetailsPage.tsx  # Vista de detalles
├── shared/
│   ├── api/
│   │   └── axios.ts            # Cliente HTTP con interceptores
│   ├── components/ui/          # Componentes reutilizables (Button, Card, etc.)
│   ├── lib/
│   │   └── utils.ts            # Utilidades (cn para clases CSS)
│   └── types/
│       └── pokemon.ts          # Tipos TypeScript para Pokémon
└── test/
    └── setup.ts                # Configuración global de tests
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# URL base del backend
VITE_API_URL=http://localhost:3000/api/v1

# Feature flag para sessionStorage fallback (development only)
VITE_ENABLE_SESSION_FALLBACK=false
```

### TypeScript

Configuración estricta habilitada:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- Alias `@/*` para rutas absolutas desde `src/`

### Tailwind CSS

Tema personalizado con colores Pokédex:
- `pokedex-red`: #EE1515
- `pokedex-yellow`: #FFCC00  
- `pokedex-black`: #1F2937
- `pokedex-gray`: #F5F5F5

---

**Desarrollado con ❤️ usando React + TypeScript + Vite**