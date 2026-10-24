"use client";

import { useEffect, useRef, useState } from "react";

const START = {
  role: "assistant",
  content: "Какой сайт нужен: лендинг под заявки, сайт компании или магазин?",
};

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([START]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [askContacts, setAskContacts] = useState(false);
  const [contactError, setContactError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    function openWidget() {
      setOpen(true);
    }
    window.addEventListener("open-ai-assistant", openWidget);
    return () => window.removeEventListener("open-ai-assistant", openWidget);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, askContacts]);

  async function send(event) {
    event.preventDefault();
    const content = text.trim();
    if (!content || pending) {
      return;
    }
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setText("");
    setPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      setMessages([...next, { role: "assistant", content: data.reply }]);
      if (data.leadCaptured) {
        setCaptured(true);
        setAskContacts(false);
      } else if (data.askContacts) {
        setAskContacts(true);
      }
    } catch {
      setAskContacts(true);
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Оставьте имя и телефон здесь в чате — заявку сохраним без созвона.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  async function submitContacts(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("clientName") || "").trim();
    const phone = String(form.get("clientPhone") || "").trim();
    setContactError("");
    setPending(true);

    try {
      const conversation = [
        ...messages,
        { role: "user", content: `Имя: ${name}. Телефон: ${phone}` },
      ];
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          siteType: "",
          comment: messages
            .filter((message) => message.role === "user")
            .map((message) => message.content)
            .join(" | "),
          source: "quiz",
          conversation,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Не удалось сохранить заявку");
      }
      setCaptured(true);
      setAskContacts(false);
      setMessages([
        ...conversation,
        { role: "assistant", content: "Бриф в админке. Напишем вам в рабочие часы." },
      ]);
    } catch (error) {
      setContactError(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 w-[min(100%-2rem,24rem)]">
      {open ? (
        <div className="overflow-hidden border border-[var(--line)] bg-paper shadow-[var(--shadow)]">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
            <p className="font-display text-xl">Помощник «Поле»</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть">
              ×
            </button>
          </div>
          <div ref={listRef} className="grid max-h-80 gap-3 overflow-y-auto px-4 py-4 text-sm">
            {messages.map((message, index) => (
              <p
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "justify-self-end bg-ink px-3 py-2 text-paper"
                    : "max-w-[90%] text-muted"
                }
              >
                {message.content}
              </p>
            ))}
            {pending ? <p className="text-teal">Печатаю бриф…</p> : null}
            {captured ? (
              <p className="border border-teal/40 px-3 py-2 text-teal">
                Заявка сохранена в админке.
              </p>
            ) : null}
          </div>
          {askContacts && !captured ? (
            <form onSubmit={submitContacts} className="grid gap-2 border-t border-[var(--line)] px-4 py-3">
              <p className="text-sm text-muted">Чтобы передать бриф, нужны имя и телефон</p>
              <input
                name="clientName"
                required
                placeholder="Имя"
                className="border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none"
              />
              <input
                name="clientPhone"
                required
                inputMode="tel"
                placeholder="+998 90 123-45-67"
                className="border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none"
              />
              {contactError ? <p className="text-sm text-ochre">{contactError}</p> : null}
              <button type="submit" className="bg-teal px-4 py-2 text-sm text-ink" disabled={pending}>
                Отправить заявку
              </button>
            </form>
          ) : (
            <form onSubmit={send} className="flex border-t border-[var(--line)]">
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Напишите вопрос или ответ"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
                disabled={captured}
              />
              <button type="submit" className="px-4 text-sm text-teal" disabled={pending || captured}>
                Отправить
              </button>
            </form>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto block rounded-full bg-teal px-5 py-3 text-ink shadow-[var(--shadow)]"
        >
          Спросить про сайт
        </button>
      )}
    </div>
  );
}
