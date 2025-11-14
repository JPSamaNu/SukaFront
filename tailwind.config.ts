// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        // NeoDex core colors
        pokedex: {
          red: '#E63946',
          graphite: '#1E1E1E',
          steel: '#3A3A3A',
          neon: '#00B4D8',
          amber: '#FFD60A'
        },
        // Pokémon types
        types: {
          normal: '#A8A77A',
          fire: '#EE8130',
          water: '#6390F0',
          grass: '#7AC74C',
          electric: '#F7D02C',
          ice: '#96D9D6',
          fighting: '#C22E28',
          poison: '#A33EA1',
          ground: '#E2BF65',
          flying: '#A98FF3',
          psychic: '#F95587',
          bug: '#A6B91A',
          rock: '#B6A136',
          ghost: '#735797',
          dragon: '#6F35FC',
          dark: '#705746',
          steel: '#B7B7CE',
          fairy: '#D685AD'
        },
        // Legacy theme vars (mantener compatibilidad)
        brand:   "var(--brand)",
        primary: "var(--primary)",
        accent:  "var(--accent)",
        text:    "var(--text)",
        muted:   "var(--muted)",
        surface: "var(--surface)",
        surface2:"var(--surface-2)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger:  "var(--danger)"
      },
      boxShadow: {
        'inner-led': 'inset 0 0 8px 2px rgba(0,180,216,.7)',
        'panel': '0 10px 30px rgba(0,0,0,.35)',
        'bezel': 'inset 0 1px 0 rgba(255,255,255,.08), inset 0 -1px 0 rgba(0,0,0,.6)',
        smsoft: "var(--shadow-sm)",
        soft:   "var(--shadow)"
      },
      dropShadow: {
        glow: ['0 0 6px rgba(0,180,216,.9)', '0 0 16px rgba(0,180,216,.6)']
      },
      backdropBlur: {
        xs: '2px'
      },
      keyframes: {
        led: { 
          '0%, 100%': { opacity: '0.9' }, 
          '50%': { opacity: '0.4' } 
        },
        scan: { 
          '0%': { transform: 'translateY(-100%)' }, 
          '100%': { transform: 'translateY(100%)' } 
        },
        boot: { 
          '0%': { filter: 'blur(4px)', opacity: '0' }, 
          '100%': { filter: 'blur(0)', opacity: '1' } 
        }
      },
      animation: {
        led: 'led 1.6s ease-in-out infinite',
        scan: 'scan 2.2s linear infinite',
        boot: 'boot .45s ease-out'
      },
      borderRadius: {
        xl: "var(--radius)",
        xl2: '1.25rem'
      },
      backgroundImage: {
        hex: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.06) 1px, transparent 1px)',
        grid: 'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)'
      }
    }
  },
  plugins: [
    function({ addUtilities, addComponents, theme }: any) {
      // LED utilities
      addUtilities({
        '.led': {
          boxShadow: theme('boxShadow.inner-led'),
          borderRadius: '9999px',
          background: 'radial-gradient(circle at 30% 30%, #3ff 0%, #0af 40%, #006 70%)'
        },
        '.terminal-glass': {
          background: 'linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))',
          boxShadow: theme('boxShadow.panel'),
          border: '1px solid rgba(255,255,255,.06)'
        },
        '.bezel': {
          background: 'linear-gradient(180deg, #2a2a2a, #1b1b1b)',
          boxShadow: theme('boxShadow.bezel')
        }
      })
      // Panel components
      addComponents({
        '.pokedex-panel': {
          '@apply bezel rounded-xl2 p-3 md:p-4 border border-neutral-800': {}
        },
        '.pokedex-screen': {
          '@apply terminal-glass rounded-xl2 overflow-hidden relative': {}
        },
        '.scanline::after': {
          content: '""',
          position: 'absolute',
          inset: '0',
          background: 'linear-gradient(0deg, rgba(0,180,216,.05), rgba(0,180,216,0))',
          mixBlendMode: 'screen',
          pointerEvents: 'none'
        }
      })
    }
  ]
} satisfies Config;