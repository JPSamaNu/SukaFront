import { renderHook, act } from "@testing-library/react";
import { useTheme } from "../useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    // Reset del tema en el document
    document.documentElement.classList.remove("theme-pokedex", "theme-pokedex-dark");
  });

  it("inicializa con tema por defecto light", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("cambia entre light y dark", () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.theme).toBe("dark");
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.theme).toBe("light");
  });

  it("aplica las clases CSS correctas al document", () => {
    const { result } = renderHook(() => useTheme());
    
    // Por defecto debería aplicar tema light
    expect(document.documentElement.classList.contains("theme-pokedex")).toBe(true);
    expect(document.documentElement.classList.contains("theme-pokedex-dark")).toBe(false);
    
    act(() => {
      result.current.toggle();
    });
    
    // Después del toggle debería aplicar tema dark
    expect(document.documentElement.classList.contains("theme-pokedex-dark")).toBe(true);
    expect(document.documentElement.classList.contains("theme-pokedex")).toBe(false);
  });

  it("detecta tema dark existente en el DOM", () => {
    // Simular que ya hay tema dark aplicado
    document.documentElement.classList.add("theme-pokedex-dark");
    
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.theme).toBe("dark");
  });
});