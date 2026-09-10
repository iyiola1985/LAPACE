const CONTACT_MESSAGE =
  "Phone numbers and emails are not allowed. Keep the conversation in Lapace chat.";

const WORD_DIGITS: Record<string, string> = {
  zero: "0",
  oh: "0",
  o: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};

function collapseObfuscation(value: string) {
  let text = value.toLowerCase();
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
  text = text.replace(/[[({]\s*(?:at|@)\s*[\])}]/g, "@");
  text = text.replace(/[[({]\s*(?:dot|dt)\s*[\])}]/g, ".");
  text = text.replace(/(^|[^a-z0-9])at(?=$|[^a-z0-9])/g, "$1@");
  text = text.replace(/(^|[^a-z0-9])dot(?=$|[^a-z0-9])/g, "$1.");
  text = text.replace(/[^a-z0-9@.]+/g, "");
  text = text.replace(/\.{2,}/g, ".");
  text = text.replace(/@{2,}/g, "@");
  return text;
}

function looksLikeEmail(value: string) {
  const normalized = collapseObfuscation(value);
  if (!normalized.includes("@")) return false;
  return /[a-z0-9][a-z0-9._%+-]{0,64}@[a-z0-9][a-z0-9.-]{1,64}\.[a-z]{2,24}/.test(
    normalized,
  );
}

function digitClusters(value: string) {
  const spaced = value
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, " ")
    .replace(
      /\b(zero|oh|one|two|three|four|five|six|seven|eight|nine)\b/g,
      (word) => WORD_DIGITS[word] ?? word,
    );
  return spaced.match(/(?:\+?\d[\d\s().-]{5,}\d)/g) ?? [];
}

function looksLikePhone(value: string) {
  const clusters = digitClusters(value);
  for (const cluster of clusters) {
    const digits = cluster.replace(/\D/g, "");
    if (digits.length >= 8 && digits.length <= 15) return true;
  }

  const spelled = value
    .toLowerCase()
    .replace(
      /\b(zero|oh|one|two|three|four|five|six|seven|eight|nine)\b/g,
      (word) => WORD_DIGITS[word] ?? word,
    );
  const compact = spelled.replace(/[^\d]/g, "");
  return compact.length >= 10 && compact.length <= 15;
}

export function findContactLeak(value: string) {
  const text = value.trim();
  if (!text) return null;
  if (looksLikeEmail(text) || text.includes("@")) {
    return "email" as const;
  }
  if (looksLikePhone(text)) return "phone" as const;
  return null;
}

export function assertNoContactDetails(value: string) {
  const leak = findContactLeak(value);
  if (leak) {
    throw new Error(CONTACT_MESSAGE);
  }
}

export function redactContactDetails(value: string) {
  if (!findContactLeak(value)) return value;
  return "[contact details removed]";
}
