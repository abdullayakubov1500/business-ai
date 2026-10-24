"use client";

import Reveal from "./Reveal";

const cases = [
  {
    name: "Марина, школа йоги",
    metric: "47 заявок",
    text: "Лендинг на 12 дней. В первый месяц — 47 записей на пробный урок с той же рекламы, что раньше вела на Instagram.",
  },
  {
    name: "Артём, поставка света",
    metric: "с 3 до 19",
    text: "Сайт компании вместо PDF-каталога. Запросы с поиска выросли с 3 до 19 в неделю без увеличения бюджета на Директ.",
  },
  {
    name: "Елена, семейная клиника",
    metric: "14 дней",
    text: "Форма записи и понятный прайс. Врачи перестали отвечать на «сколько стоит приём» в мессенджере вручную.",
  },
];

export default function Reviews() {
  return (
    <section id="reviews" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-display text-4xl md:text-5xl">Не отзывы, а что изменилось</h2>
        </Reveal>
        <div className="mt-14 space-y-0">
          {cases.map((item, index) => (
            <Reveal key={item.name}>
              <article className="grid gap-6 border-t border-[var(--line)] py-10 md:grid-cols-12">
                <p className="font-display text-4xl text-teal md:col-span-3">{item.metric}</p>
                <div className="md:col-span-9">
                  <p className="max-w-2xl text-lg leading-relaxed">{item.text}</p>
                  <p className="mt-4 text-sm text-muted">{item.name}</p>
                </div>
                <span className="sr-only">{index + 1}</span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
