"use client";

import Parallax from "./Parallax";

export default function Hero() {
  function openAssistant() {
    window.dispatchEvent(new Event("open-ai-assistant"));
  }

  return (
    <section id="top" className="relative overflow-hidden px-5 pb-24 pt-16 md:pt-24">
      <Parallax speed={0.12} className="pointer-events-none absolute inset-0">
        <div className="grid-paper absolute inset-[-20%] opacity-70" />
      </Parallax>
      <Parallax
        speed={-0.08}
        className="pointer-events-none absolute -right-8 top-8 select-none font-display text-[28vw] leading-none text-ink/8 md:right-10 md:text-[18rem]"
      >
        поле
      </Parallax>

      <div className="relative mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="mb-6 max-w-md text-sm text-muted">
            Ателье сайтов. Москва и удалёнка. Один дизайнер, один разработчик, один срок.
          </p>
          <h1 className="max-w-3xl font-display text-5xl leading-[0.95] md:text-7xl">
            Сайт, который собирает заявки за 14 дней
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
            Собираем лендинг или сайт компании так, чтобы человек понял оффер и оставил контакт.
            Бриф можно наговорить ИИ — без созвона «на час».
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#brief" className="rounded-full bg-teal px-6 py-3 text-ink">
              Оставить бриф
            </a>
            <button
              type="button"
              onClick={openAssistant}
              className="rounded-full border border-[var(--line)] px-6 py-3"
            >
              Спросить ИИ
            </button>
          </div>
        </div>

        <aside className="self-end border-l border-[var(--line)] pl-6 md:col-span-4">
          <p className="font-display text-5xl text-ochre">14</p>
          <p className="mt-2 text-sm text-muted">дней до запуска лендинга, если бриф готов в первый день</p>
          <p className="mt-8 font-display text-5xl">90</p>
          <p className="mt-2 text-sm text-muted">тысяч рублей — нижняя смета одностраничного сайта под заявки</p>
        </aside>
      </div>
    </section>
  );
}
