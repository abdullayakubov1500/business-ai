"use client";

import Reveal from "./Reveal";

const items = [
  {
    title: "Срок на бумаге",
    text: "Дата запуска фиксируется в брифе. Если задерживаем мы — доводим без доплаты за часы.",
  },
  {
    title: "ИИ снимает бриф",
    text: "Помощник спрашивает тип сайта, цель заявок и бюджет. Вам не нужно писать ТЗ с нуля.",
  },
  {
    title: "Смета без сюрпризов",
    text: "Цена за конкретный объём: страницы, форма, тексты, запуск. Допы — отдельной строкой.",
  },
  {
    title: "Две недели после релиза",
    text: "Правки формулировок, формы и мелочей вёрстки входят в сопровождение запуска.",
  },
];

export default function Advantages() {
  return (
    <section id="advantages" className="border-t border-[var(--line)] px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="max-w-2xl font-display text-4xl md:text-5xl">Что отличает работу в «Поле»</h2>
        </Reveal>
        <div className="mt-14 grid gap-px bg-[var(--line)] md:grid-cols-2">
          {items.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.08} className="bg-paper p-8 md:p-10">
              <h3 className="font-display text-3xl">{item.title}</h3>
              <p className="mt-4 max-w-md leading-relaxed text-muted">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
