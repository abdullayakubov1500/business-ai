"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const types = ["Лендинг", "Сайт компании", "Магазин"];

export default function LeadForm() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    const formEl = event.currentTarget;
    setError("");
    setStatus("loading");
    const form = new FormData(formEl);
    const payload = {
      name: form.get("name"),
      phone: form.get("phone"),
      siteType: form.get("siteType"),
      comment: form.get("comment"),
      source: "form",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Не удалось отправить");
      }
      setStatus("ok");
      formEl.reset();
    } catch (err) {
      setStatus("idle");
      setError(err.message);
    }
  }

  return (
    <section id="brief" className="px-5 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <h2 className="font-display text-4xl md:text-5xl">Оставьте бриф — ответим в рабочие часы</h2>
          <p className="mt-6 max-w-md leading-relaxed text-muted">
            Имя и телефон обязательны. Остальное можно наговорить помощнику справа внизу.
          </p>
        </Reveal>
        <Reveal className="md:col-span-7" delay={0.1}>
          {status === "ok" ? (
            <p className="border border-[var(--line)] p-8 font-display text-3xl">
              Бриф получен. Напишем вам, не будем звонить без предупреждения.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-5">
              <label className="grid gap-2 text-sm">
                Имя
                <input
                  name="name"
                  required
                  className="border border-[var(--line)] bg-transparent px-4 py-3 text-base outline-none focus:border-teal"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Телефон
                <input
                  name="phone"
                  required
                  inputMode="tel"
                  placeholder="+998 90 123-45-67"
                  className="border border-[var(--line)] bg-transparent px-4 py-3 text-base outline-none focus:border-teal"
                />
              </label>
              <fieldset className="grid gap-3">
                <legend className="text-sm">Тип сайта</legend>
                <div className="flex flex-wrap gap-2">
                  {types.map((type, index) => (
                    <label key={type} className="cursor-pointer">
                      <input
                        type="radio"
                        name="siteType"
                        value={type}
                        defaultChecked={index === 0}
                        className="peer sr-only"
                      />
                      <span className="inline-block border border-[var(--line)] px-4 py-2 text-sm peer-checked:border-teal peer-checked:text-teal">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="grid gap-2 text-sm">
                Комментарий
                <textarea
                  name="comment"
                  rows={4}
                  className="border border-[var(--line)] bg-transparent px-4 py-3 text-base outline-none focus:border-teal"
                />
              </label>
              {error ? <p className="text-sm text-ochre">{error}</p> : null}
              <button
                type="submit"
                disabled={status === "loading"}
                className="justify-self-start rounded-full bg-ink px-6 py-3 text-paper disabled:opacity-60"
              >
                {status === "loading" ? "Отправляем…" : "Отправить бриф"}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
