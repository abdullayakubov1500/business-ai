"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("pole-theme", next ? "dark" : "light");
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm text-ink transition hover:border-teal"
      aria-label="Переключить тему"
    >
      {dark ? "Светлая" : "Тёмная"}
    </button>
  );
}
