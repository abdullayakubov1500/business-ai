import { GoogleGenAI } from "@google/genai";
import { createLead, isValidPhone } from "./leads";
import { extractName, extractPhone, extractSiteType, summarizeQuiz } from "./extractLead";

const MODEL = "gemini-3.5-flash-lite";

const SYSTEM_PROMPT = `Ты консультант ателье сайтов «Поле» в Москве. Говоришь по-русски, коротко, спокойно, без маркетинговой воды и без эмодзи.

Услуги и ориентиры (не выдумывай другие цифры):
- Лендинг под заявки: от 90 000 ₽, 10–14 дней.
- Сайт компании: от 180 000 ₽, 3–5 недель.
- Интернет-магазин: от 250 000 ₽, 5–8 недель.
В работу входят: структура, тексты, дизайн, вёрстка, форма заявок, базовая SEO-разметка, запуск.
Не обещай рекламу, CRM-интеграции и сложную разработку, если об этом не спросили — тогда честно скажи, что это отдельный этап.

Сценарий разговора:
1. Ответь на вопрос, если он есть.
2. Мягко веди квиз: тип сайта → цель заявок → срок → бюджет.
3. Когда картина ясна, попроси имя и телефон, чтобы передать бриф дизайнеру.
Не дави. Один вопрос за раз. Если человек сразу даёт контакт — прими его.
Как только в диалоге есть имя и телефон, поставь readyForLead: true и заполни name и phone.

Всегда верни JSON:
{
  "reply": "текст ответа клиенту",
  "siteType": "лендинг | компания | магазин | пусто",
  "goal": "строка или пусто",
  "deadline": "строка или пусто",
  "budget": "строка или пусто",
  "name": "если назвал имя, иначе пусто",
  "phone": "если назвал телефон, иначе пусто",
  "readyForLead": true/false
}

readyForLead = true только если есть имя и телефон.`;

function parseJson(text) {
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function fallbackReply(messages) {
  const last = messages.filter((m) => m.role === "user").at(-1)?.content || "";
  const userTurns = messages.filter((m) => m.role === "user").length;
  const joined = messages.map((m) => m.content).join("\n");
  const phone = extractPhone(joined);
  const name = extractName(joined);

  if (isValidPhone(phone) && (name || userTurns >= 4)) {
    return {
      reply: "Зафиксировали бриф. Дизайнер напишет в мессенджер в ближайшие рабочие часы.",
      siteType: extractSiteType(joined),
      name: name || "Клиент",
      phone,
      readyForLead: true,
    };
  }

  if (userTurns <= 1) {
    return {
      reply: "Какой сайт нужен: лендинг под заявки, сайт компании или магазин?",
      siteType: "",
      name: "",
      phone: "",
      readyForLead: false,
    };
  }
  if (userTurns === 2) {
    return {
      reply: "Какие заявки должен приносить сайт — звонок, запись или заказ?",
      siteType: last,
      name: "",
      phone: "",
      readyForLead: false,
    };
  }
  if (userTurns === 3) {
    return {
      reply: "К какому сроку хотите выйти в эфир?",
      siteType: "",
      name: "",
      phone: "",
      readyForLead: false,
    };
  }
  if (userTurns === 4) {
    return {
      reply: "Какой бюджет комфортен: до 120 000, 120–250 000 или больше?",
      siteType: "",
      name: "",
      phone: "",
      readyForLead: false,
    };
  }
  return {
    reply: "Чтобы передать бриф в работу, напишите имя и телефон.",
    siteType: "",
    name: "",
    phone: phone,
    readyForLead: false,
  };
}

async function askGemini(messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackReply(messages);
  }

  const ai = new GoogleGenAI({ apiKey });
  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.6,
      responseMimeType: "application/json",
    },
  });

  const parsed = parseJson(response.text);
  if (!parsed?.reply) {
    return fallbackReply(messages);
  }
  return parsed;
}

export async function chatWithStudio(messages) {
  const safeMessages = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-16);

  if (!safeMessages.length) {
    return {
      reply: "Какой сайт собираем — лендинг, сайт компании или магазин?",
      lead: null,
    };
  }

  let result;
  try {
    result = await askGemini(safeMessages);
  } catch (error) {
    console.error("Gemini error:", error);
    result = fallbackReply(safeMessages);
  }

  const transcript = [
    ...safeMessages,
    { role: "assistant", content: result.reply },
  ];
  const joined = transcript.map((m) => m.content).join("\n");
  const quiz = summarizeQuiz(transcript);
  const phone = result.phone || quiz.phone;
  const name = String(result.name || quiz.name || "").trim();
  const userTurns = safeMessages.filter((message) => message.role === "user").length;
  const ready = isValidPhone(phone) && (name || result.readyForLead || userTurns >= 4);

  let lead = null;
  if (ready) {
    const comment = [
      result.goal && `Цель: ${result.goal}`,
      result.deadline && `Срок: ${result.deadline}`,
      result.budget && `Бюджет: ${result.budget}`,
      quiz.comment,
    ]
      .filter(Boolean)
      .join(". ");

    try {
      const saved = await createLead({
        name: name || "Клиент",
        phone,
        siteType: result.siteType || quiz.siteType || "",
        comment,
        source: "quiz",
        conversation: transcript,
      });
      lead = saved.lead;
    } catch (error) {
      console.error("Quiz lead save failed:", error);
    }
  }

  const askContacts =
    !lead &&
    (/телефон|имя|контакт/i.test(result.reply || "") || userTurns >= 3);

  return {
    reply: result.reply,
    leadCaptured: Boolean(lead),
    askContacts,
  };
}
