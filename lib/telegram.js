export async function sendTelegramLead(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return false;
  }

  const sourceLabel = {
    form: "форма на сайте",
    chat: "чат с ИИ",
    quiz: "квиз ИИ",
  }[lead.source] || lead.source;

  const text = [
    "Новая заявка — ателье «Поле»",
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Тип сайта: ${lead.siteType || "не указан"}`,
    `Источник: ${sourceLabel}`,
    lead.comment ? `Комментарий: ${lead.comment}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API ${response.status}: ${body}`);
  }

  return true;
}
