"use client";

import { Fragment, useCallback, useEffect, useState } from "react";

const statusLabel = {
  new: "новая",
  progress: "в работе",
  done: "закрыта",
};

function formatDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  const loadLeads = useCallback(async () => {
    const response = await fetch("/api/admin/leads");
    if (response.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Не удалось загрузить заявки");
    }
    setLeads(data.leads);
    setAuthed(true);
  }, []);

  useEffect(() => {
    loadLeads().catch(() => setAuthed(false));
  }, [loadLeads]);

  useEffect(() => {
    if (!authed) {
      return undefined;
    }
    const timer = setInterval(() => {
      loadLeads().catch(() => {});
    }, 8000);
    return () => clearInterval(timer);
  }, [authed, loadLeads]);

  async function login(event) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Неверный пароль");
      return;
    }
    setPassword("");
    await loadLeads();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setLeads([]);
  }

  async function changeStatus(id, status) {
    const response = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (response.ok) {
      setLeads((current) => current.map((lead) => (lead.id === id ? data.lead : lead)));
    }
  }

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
        <h1 className="font-display text-4xl">Заявки ателье</h1>
        <form onSubmit={login} className="mt-8 grid gap-4">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Пароль"
            className="border border-[var(--line)] bg-transparent px-4 py-3 outline-none focus:border-teal"
          />
          {error ? <p className="text-sm text-ochre">{error}</p> : null}
          <button type="submit" className="rounded-full bg-ink px-5 py-3 text-paper">
            Войти
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl">Заявки</h1>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => loadLeads()} className="text-sm text-muted">
            Обновить
          </button>
          <button type="button" onClick={logout} className="text-sm text-muted">
            Выйти
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">{leads.length} всего</p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-muted">
            <tr className="border-b border-[var(--line)]">
              <th className="py-3 font-normal">Дата</th>
              <th className="py-3 font-normal">Имя</th>
              <th className="py-3 font-normal">Телефон</th>
              <th className="py-3 font-normal">Тип</th>
              <th className="py-3 font-normal">Источник</th>
              <th className="py-3 font-normal">Статус</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <Fragment key={lead.id}>
                <tr
                  className="cursor-pointer border-b border-[var(--line)]"
                  onClick={() => setOpenId(openId === lead.id ? null : lead.id)}
                >
                  <td className="py-3">{formatDate(lead.createdAt)}</td>
                  <td>{lead.name}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.siteType || "—"}</td>
                  <td>{lead.source}</td>
                  <td>
                    <select
                      value={lead.status}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => changeStatus(lead.id, event.target.value)}
                      className="bg-transparent"
                    >
                      {Object.entries(statusLabel).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                {openId === lead.id ? (
                  <tr className="border-b border-[var(--line)]">
                    <td colSpan={6} className="bg-[var(--panel)] px-4 py-4 text-muted">
                      <p>{lead.comment || "Без комментария"}</p>
                      {lead.conversation?.length ? (
                        <div className="mt-4 grid gap-2">
                          {lead.conversation.map((message, index) => (
                            <p key={index}>
                              <span className="text-teal">{message.role === "user" ? "клиент" : "ИИ"}: </span>
                              {message.content}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
        {leads.length === 0 ? <p className="py-12 text-muted">Заявок пока нет.</p> : null}
      </div>
    </main>
  );
}
