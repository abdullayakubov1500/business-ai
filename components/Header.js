"use client";

import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#advantages", label: "Как работаем" },
  { href: "#reviews", label: "Кейсы" },
  { href: "#faq", label: "Вопросы" },
  { href: "#brief", label: "Бриф" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <a href="#top" className="font-display text-2xl leading-none">
          Поле
        </a>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-muted hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="#brief"
            className="hidden rounded-full bg-ink px-4 py-2 text-sm text-paper sm:inline-flex"
          >
            Оставить бриф
          </a>
        </div>
      </div>
    </header>
  );
}
