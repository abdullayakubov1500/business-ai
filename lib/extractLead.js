import { isValidPhone } from "./leads";

export function extractPhone(text) {
  const match = String(text || "").match(/\+?\d[\d\s()-]{8,18}/);
  if (!match) {
    return "";
  }
  return isValidPhone(match[0]) ? match[0] : "";
}

export function extractName(text) {
  const source = String(text || "");
  const patterns = [
    /меня зовут\s+([A-Za-zА-Яа-яЁё]{2,}(?:\s+[A-Za-zА-Яа-яЁё]{2,})?)/i,
    /имя[:\s]+([A-Za-zА-Яа-яЁё]{2,}(?:\s+[A-Za-zА-Яа-яЁё]{2,})?)/i,
    /я\s+([A-Za-zА-Яа-яЁё]{2,})\b/i,
  ];
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1] && !/лендинг|магазин|сайт|бюджет/i.test(match[1])) {
      return match[1].trim();
    }
  }
  return "";
}

export function extractSiteType(text) {
  const source = String(text || "").toLowerCase();
  if (source.includes("магазин")) {
    return "Магазин";
  }
  if (source.includes("компани") || source.includes("корпоратив")) {
    return "Сайт компании";
  }
  if (source.includes("лендинг") || source.includes("одностранич")) {
    return "Лендинг";
  }
  return "";
}

export function summarizeQuiz(messages) {
  const userText = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");
  return {
    name: extractName(userText),
    phone: extractPhone(userText),
    siteType: extractSiteType(userText),
    comment: userText.slice(0, 500),
  };
}
