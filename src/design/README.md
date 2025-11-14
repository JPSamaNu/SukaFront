# NeoDex Design System - Implementación

## ✅ Implementado

### 1. Configuración Base
- ✅ `tailwind.config.ts` extendido con NeoDex tokens
- ✅ `src/styles/tokens.css` con variables CSS
- ✅ `src/design/neodex.tokens.ts` helpers TypeScript
- ✅ `src/design/neodex.theme.md` documentación

### 2. Componentes Base
- ✅ `LedDot` - LED animado con aria-live
- ✅ `Panel` - Contenedor con bisel metálico
- ✅ `Screen` - Pantalla de vidrio con scanline
- ✅ `TypeBadge` - Badge de tipos Pokémon

## 🚀 Cómo usar

### Importar componentes
```tsx
import { LedDot, Panel, Screen, TypeBadge } from '@/shared/components/neodex';
import { typeColor, typeBadgeClasses } from '@/design/neodex.tokens';
```

### Ejemplos

#### LED Indicator
```tsx
<LedDot className="w-4 h-4" on={isConnected} />
```

#### Panel con contenido
```tsx
<Panel className="flex items-center gap-3">
  <LedDot className="w-3 h-3" />
  <span>System Online</span>
</Panel>
```

#### Screen con scanline
```tsx
<Screen scanline className="p-4">
  <img src={pokemonSprite} className="animate-boot" />
</Screen>
```

#### Type Badge
```tsx
<TypeBadge type="fire" size="md" />
<TypeBadge type="water" size="sm" />
```

### Utilidades Tailwind Custom

#### Classes disponibles:
- `.led` - LED con glow
- `.terminal-glass` - Vidrio con sombra
- `.bezel` - Bisel metálico
- `.pokedex-panel` - Panel completo
- `.pokedex-screen` - Pantalla completa
- `.scanline::after` - Efecto scanline

```tsx
<div className="pokedex-panel">
  <div className="pokedex-screen scanline">
    {/* content */}
  </div>
</div>
```

## 📋 Siguientes Pasos

### Fase 2: Componentes Avanzados
- [ ] `PokedexHeader` - Header con logo y LED
- [ ] `SidebarMenu` - Menú lateral con items
- [ ] `PokemonCard` - Card con hover glow
- [ ] `TabView` - Tabs accesibles

### Fase 3: Aplicar a Páginas Existentes
- [ ] Actualizar `TeamBuilderPage` con Panel y Screen
- [ ] Aplicar TypeBadge en lugar de spans manuales
- [ ] Migrar búsqueda de Pokémon a diseño NeoDex
- [ ] Dashboard con paneles NeoDex

### Fase 4: Optimizaciones
- [ ] Lazy loading de componentes
- [ ] Reducir animaciones en `prefers-reduced-motion`
- [ ] Lighthouse audit (target: 90+)

## 🎨 Paleta Rápida

```tsx
// Colores principales
bg-pokedex-red      // #E63946
bg-pokedex-graphite // #1E1E1E
bg-pokedex-steel    // #3A3A3A
bg-pokedex-neon     // #00B4D8
bg-pokedex-amber    // #FFD60A

// Tipos Pokémon
bg-types-fire       // #EE8130
bg-types-water      // #6390F0
bg-types-grass      // #7AC74C
// ... 18 tipos disponibles
```

## 🔧 Helpers TypeScript

```tsx
import { typeColor, typeBadgeClasses, typeBackground } from '@/design/neodex.tokens';

// Get hex color
const fireColor = typeColor('fire'); // "#EE8130"

// Get Tailwind classes
const classes = typeBadgeClasses('fire', 'md');
// "px-3 py-1 text-sm rounded bg-types-fire/20 text-types-fire ring-1 ring-types-fire/40"

// Get background class
const bg = typeBackground('water'); // "bg-types-water"
```

## ♿ Accesibilidad

Todos los componentes incluyen:
- ✅ Roles ARIA apropiados
- ✅ aria-label dinámicos
- ✅ Focus visible (ring con token --ring)
- ✅ Soporte para `prefers-reduced-motion`
- ✅ Alto contraste (WCAG AA)

## 🎬 Animaciones

```tsx
// Aplicar animaciones
<div className="animate-led">LED</div>
<div className="animate-scan">Scanline</div>
<img className="animate-boot" /> // Fade in con blur
```

Auto-desactivadas con `prefers-reduced-motion: reduce`.

## 📱 Responsive

Mobile-first con breakpoints:
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* responsive grid */}
</div>
```

---

## 🐛 Troubleshooting

### Error: "Unknown at rule @theme"
- Es un warning de CSS, se puede ignorar
- No afecta la funcionalidad

### Componentes no se ven con estilo
1. Verificar que `tokens.css` esté importado en `index.css`
2. Verificar que Tailwind config tenga el plugin
3. Reiniciar dev server

### Animaciones no funcionan
- Verificar que `prefers-reduced-motion` no esté activo
- Revisar que las clases `animate-*` estén aplicadas

---

**Próximo comando**: Aplicar componentes a TeamBuilderPage
