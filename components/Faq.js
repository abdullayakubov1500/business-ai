"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const questions = [
  {
    q: "Сколько стоит сайт?",
    a: "Лендинг — от 90 000 ₽, сайт компании — от 180 000 ₽, магазин — от 250 000 ₽. Точную цифру считаем после брифа: страницы, тексты, интеграции.",
  },
  {
    q: "Можно без готового ТЗ?",
    a: "Да. ИИ-помощник на сайте задаёт 4 вопроса и собирает бриф. Потом созваниваемся только если остались дыры в задаче.",
  },
  {
    q: "Что входит в 14 дней?",
    a: "Структура, тексты, макет, вёрстка, форма заявок, базовая SEO-разметка, публикация. Реклама и сложные личные кабинеты — отдельным этапом.",
  },
  {
    q: "Кто пишет тексты?",
    a: "Мы. Вы подтверждаете факты: цены, услуги, ограничения. Слоганы «из ниоткуда» не ставим.",
  },
  {
    q: "Где хранятся заявки?",
    a: "В админке сайта и дублем в Telegram — в чат или группу, куда подключен бот.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="border-t border-[var(--line)] px-5 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-4">
          <h2 className="font-display text-4xl md:text-5xl">Частые вопросы</h2>
        </Reveal>
        <div className="md:col-span-8">
          {questions.map((item, index) => {
            const active = open === index;
            return (
              <Reveal key={item.q} delay={index * 0.04}>
                <button
                  type="button"
                  onClick={() => setOpen(active ? -1 : index)}
                  className="w-full border-b border-[var(--line)] py-5 text-left"
                  aria-expanded={active}
                >
                  <span className="flex items-baseline justify-between gap-6">
                    <span className="font-display text-2xl">{item.q}</span>
                    <span className="text-teal">{active ? "–" : "+"}</span>
                  </span>
                  {active ? <p className="mt-3 max-w-xl leading-relaxed text-muted">{item.a}</p> : null}
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
