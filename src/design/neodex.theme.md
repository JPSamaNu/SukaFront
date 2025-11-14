# NeoDex Design System

**Terminal digital + Pokédex moderna** design system para SukaDex.

## 🎨 Paleta de Colores

### Core (pokedex.*)
- **red** `#E63946` - Accent primario, botones CTA
- **graphite** `#1E1E1E` - Background principal
- **steel** `#3A3A3A` - Superficies elevadas
- **neon** `#00B4D8` - Acentos tecnológicos, LED, focus
- **amber** `#FFD60A` - Warnings, highlights

### Tipos Pokémon (types.*)
Todos los 18 tipos oficiales con colores de PokéAPI.

## 🧩 Componentes Base

### LedDot
LED animado con pulsación.
```tsx
<LedDot className="w-4 h-4" />
```

### Panel
Contenedor con bisel y efecto metálico.
```tsx
<Panel className="p-4">Content</Panel>
```

### Screen
Pantalla de vidrio con scanline opcional.
```tsx
<Screen scanline>Content</Screen>
```

### TypeBadge
Badge de tipo Pokémon con colores oficiales.
```tsx
<TypeBadge type="fire" size="md" />
```

## ♿ Accesibilidad

- **Contraste**: WCAG AA compliant
- **Focus**: Ring visible con `--ring` token
- **Motion**: Respeta `prefers-reduced-motion`
- **Semántica**: Roles ARIA en tabs, menús, tablas

## 🎭 Dark Mode

Activo por defecto. Toggle con clase `dark` en `<html>`.

## 📐 Espaciado

- `--panel-gap`: 12px (gap entre paneles)
- Padding: `p-3` mobile, `md:p-4` desktop
- Gaps: `gap-3`, `gap-4`

## 🎬 Animaciones

- `animate-led`: Pulsación LED (1.6s)
- `animate-scan`: Scanline vertical (2.2s)
- `animate-boot`: Fade in con blur (0.45s)

## 🔧 Utilidades Custom

- `.led` - LED con glow interno
- `.terminal-glass` - Vidrio con blur
- `.bezel` - Bisel metálico
- `.pokedex-panel` - Panel completo
- `.pokedex-screen` - Pantalla con vidrio
- `.scanline` - Agrega efecto scanline

## 📱 Responsive

- Mobile-first
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid adaptativo: 2 → 3 → 4 columnas
