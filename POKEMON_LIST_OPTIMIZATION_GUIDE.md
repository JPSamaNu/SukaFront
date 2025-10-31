# ⚡️ Pokémon List Optimization Guide
## Objetivo
Optimizar el rendimiento de la lista de Pokémon sin alterar la API existente.

---

## 🧩 Problemas actuales
1. 21 peticiones paralelas saturan red y CPU.
2. Duplicado de `page=1`.
3. `useEffect` y callbacks redundantes.
4. `hasMore` se desincroniza.
5. Sin virtualización (el DOM crece demasiado).
6. Imágenes sin lazy-loading.

---

## ✅ Solución general
Migrar la lista a un flujo de carga optimizado con:
- **Concurrencia limitada** (`CONCURRENCY = 5`)
- **Paginación + prefetch**
- **Virtualización (TanStack Virtual)**
- **`startTransition` para renders suaves**
- **Imágenes lazy + memoización**

---

## 🏗️ Pasos de implementación

### 1. `lib/pokemonApi.ts`
```ts
const pageCache = new Map<number, Promise<PokemonItem[]>>();

export function fetchPage(page: number, limit = 50, signal?: AbortSignal) {
  return fetch(`${API_URL}/pokemon?page=${page}&limit=${limit}`, { signal })
    .then(res => res.json());
}

export function getPage(page: number, limit = 50) {
  if (!pageCache.has(page)) pageCache.set(page, fetchPage(page, limit));
  return pageCache.get(page)!;
}
```

---

### 2. Carga progresiva por lotes
```ts
const CONCURRENCY = 5;

async function fillBuffer(start = 2, end = 21) {
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  for (let i = 0; i < pages.length; i += CONCURRENCY) {
    const chunk = pages.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map(p => getPage(p, 50)));
    pokemonBufferRef.current.push(...results.flat());
    setBufferReady(true);
  }
}
```

---

### 3. `flushFromBuffer` con `startTransition`
```ts
import { startTransition } from 'react';

function flushFromBuffer(batchSize = 40) {
  const batch = pokemonBufferRef.current.splice(0, batchSize);
  if (batch.length === 0) return;
  startTransition(() => {
    setPokemon(prev => {
      const seen = new Set(prev.map(p => p.id));
      const unique = batch.filter(p => !seen.has(p.id));
      return [...prev, ...unique];
    });
  });
}
```

---

### 4. IntersectionObserver optimizado
```ts
observerRef.current = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && pokemonBufferRef.current.length > 0) {
    flushFromBuffer(40);
  }
}, { rootMargin: '800px', threshold: 0.1 });
```

---

### 5. Paginación con prefetch y cancelación
```ts
let inFlight: AbortController | null = null;

async function showPage(page: number) {
  inFlight?.abort();
  inFlight = new AbortController();

  const data = await getPage(page, 50);
  startTransition(() => setPokemon(prev => [...prev, ...data]));
  void getPage(page + 1);
  void getPage(page + 2);
}
```

---

### 6. Virtualización (TanStack Virtual)
```ts
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);
const rowVirtualizer = useVirtualizer({
  count: pokemon.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 280,
  overscan: 8,
});

<div ref={parentRef} style={{ height: '100vh', overflow: 'auto' }}>
  <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
    {rowVirtualizer.getVirtualItems().map(vi => {
      const p = pokemon[vi.index];
      return (
        <div key={p.id} ref={vi.measureElement}
             style={{ position:'absolute', transform:`translateY(${vi.start}px)`, width:'100%' }}>
          <PokemonCard data={p}/>
        </div>
      );
    })}
  </div>
</div>
```

---

### 7. Imágenes y memo
```tsx
<img src={p.image} loading="lazy" decoding="async"
     width={128} height={128} alt={p.name}/>
```
```ts
export default React.memo(PokemonCard);
```

---

## 🧾 Checklist final
- [ ] Máximo 5 requests simultáneas.  
- [ ] Sin duplicado de `page=1`.  
- [ ] Scroll fluido con virtualización.  
- [ ] `startTransition` aplicado.  
- [ ] Lazy loading activo.  
- [ ] Sin race conditions ni efectos duplicados.  

---

## 💡 Cómo usar este documento
Pega este archivo completo en tu proyecto y dile a **Copilot Claude Sonnet 4.5**:

> “Analiza `POKEMON_LIST_OPTIMIZATION_GUIDE.md` y refactoriza el componente de lista para aplicar todos los pasos descritos. Mantén la estructura y tipado actual.”

Así entenderá contexto, objetivos y pasos técnicos sin que tengas que explicárselo cada vez.
