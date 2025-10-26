import { useCallback, useEffect, useState } from "react";

const LIGHT = "theme-pokedex";
const DARK  = "theme-pokedex-dark";

export function useTheme() {
  const [theme, setTheme] = useState<string>(() =>
    document.documentElement.classList.contains(DARK) ? "dark" : "light"
  );

  useEffect(() => {
    const cls = document.documentElement.classList;
    cls.remove(theme === "light" ? DARK : LIGHT);
    cls.add(theme === "light" ? LIGHT : DARK);
  }, [theme]);

  const toggle = useCallback(() => setTheme(t => (t === "light" ? "dark" : "light")), []);
  return { theme, toggle };
}