"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): Theme {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const [userPreference, setUserPreference] = useState<Theme | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as Theme | null;
      if (saved && (saved === "light" || saved === "dark")) {
        setUserPreference(saved);
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
        document.documentElement.classList.toggle("dark", saved === "dark");
      } else {
        const system = getSystemTheme();
        setTheme(system);
        document.documentElement.setAttribute("data-theme", system);
        document.documentElement.classList.toggle("dark", system === "dark");
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted || userPreference !== null) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handle = (e: MediaQueryListEvent) => {
      const next = e.matches ? "dark" : "light";
      setTheme(next);
      document.documentElement.setAttribute("data-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
    };
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, [mounted, userPreference]);

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
      if (userPreference !== null) localStorage.setItem("theme", theme);
    }
  }, [theme, mounted, userPreference]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      setUserPreference(next);
      localStorage.setItem("theme", next);
      document.documentElement.setAttribute("data-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
