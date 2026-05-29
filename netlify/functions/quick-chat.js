const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";
const MAX_MESSAGE_LENGTH = 520;
const MAX_HISTORY_ITEMS = 6;
const FREE_RATE_LIMIT = 8;
const UNLOCKED_RATE_LIMIT = 48;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const rateBuckets = new Map();

const CHAT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    answer: { type: "string" },
    offTopic: { type: "boolean" },
    unlockSuggested: { type: "boolean" }
  },
  required: ["answer", "offTopic", "unlockSuggested"]
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(204, "");
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body." });
  }

  const message = cleanLine(body.message).slice(0, MAX_MESSAGE_LENGTH);
  if (message.length < 2) {
    return jsonResponse(400, { error: "Ask a short question about the painting first." });
  }

  const unlocked = Boolean(body.unlocked);
  const rate = checkRateLimit(getClientKey(event, unlocked), unlocked);
  if (!rate.ok) {
    return jsonResponse(429, {
      error: unlocked
        ? "Chat limit reached for now. Try again later."
        : "Free chat limit reached. Unlock the full painter fix plan or try again later.",
      unlockSuggested: !unlocked
    });
  }

  if (isClearlyOffTopic(message)) {
    return jsonResponse(200, {
      answer: "I can only help with this painting analysis: values, composition, color, drawing structure, edges, focal point, and practical painting next steps.",
      offTopic: true,
      unlockSuggested: false
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, { error: "Painter chat is not configured yet." });
  }

  const quickCheck = sanitizeQuickCheck(body.quickCheck);
  if (!quickCheck.verdict && !quickCheck.biggestIssue) {
    return jsonResponse(400, { error: "Run Quick Check before opening the painting chat." });
  }

  const history = sanitizeHistory(body.history);
  const model = process.env.OPENAI_CHAT_MODEL || process.env.OPENAI_MODEL || DEFAULT_MODEL;

  try {
    const data = await callOpenAI(apiKey, {
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: buildSystemPrompt(unlocked)
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildUserPrompt(message, quickCheck, history, unlocked)
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "quick_painter_chat",
          schema: CHAT_SCHEMA,
          strict: true
        }
      },
      max_output_tokens: unlocked ? 420 : 260
    });

    const chat = normalizeChat(parseModelJson(data), unlocked);
    return jsonResponse(200, chat);
  } catch (error) {
    console.error(error);
    return jsonResponse(502, { error: "Painter chat failed. Try again in a moment." });
  }
};

function buildSystemPrompt(unlocked) {
  return [
    "You are M8 Painter Chat, a practical classical painting critique assistant.",
    "You only answer questions about the current Quick Check painting analysis, painting process, values, composition, color, drawing structure, focal point, edges, light, shadow, and practical studio decisions.",
    "If the user asks about anything outside painting or this image critique, politely refuse in one sentence and set offTopic true.",
    "Do not mention AI, prompts, policies, models, tokens, or software.",
    "Do not invent details that are not supported by the Quick Check context.",
    unlocked
      ? "The user has full access. You may give concrete first-fix guidance and short ordered painting steps."
      : "The user does not have full access. You may explain the diagnosis and why it matters, but do not reveal exact repair steps, exact first-fix instructions, or a full 3-step paint plan. Suggest unlocking the full painter fix plan when they ask what to do next.",
    "Keep the answer short, warm, and painter-friendly. Maximum 160 words."
  ].join(" ");
}

function buildUserPrompt(message, quickCheck, history, unlocked) {
  const lines = [
    `Access: ${unlocked ? "full unlock" : "free preview"}`,
    "",
    "Quick Check context:",
    `Score: ${quickCheck.score || "unknown"}`,
    `Verdict: ${quickCheck.verdict || "unknown"}`,
    `Biggest issue: ${quickCheck.biggestIssue || quickCheck.weakness || "unknown"}`,
    `Key insight: ${quickCheck.keyInsight || "unknown"}`,
    `Strength: ${quickCheck.strength || "unknown"}`,
    `Weakness: ${quickCheck.weakness || "unknown"}`,
    `Tags: ${(quickCheck.tags || []).join(", ") || "none"}`,
    `Score limiting factor: ${quickCheck.whyLimiting || "unknown"}`,
    `Score positive factor: ${quickCheck.whyPositive || "unknown"}`,
    "",
    "Recent chat:",
    history.length ? history.map((item) => `${item.role}: ${item.content}`).join("\n") : "none",
    "",
    `User question: ${message}`,
    "",
    "Return JSON only."
  ];
  return lines.join("\n");
}

function sanitizeQuickCheck(value) {
  const source = value && typeof value === "object" ? value : {};
  const metrics = source.metrics && typeof source.metrics === "object" ? source.metrics : {};
  return {
    score: clampNumber(source.score, 0, 100),
    verdict: cleanLine(source.verdict),
    biggestIssue: cleanLine(source.biggestIssue || source.weakness || source.keyInsight),
    keyInsight: cleanLine(source.keyInsight),
    strength: cleanLine(source.strength),
    weakness: cleanLine(source.weakness),
    whyPositive: cleanLine(source.whyPositive || source.whyThisScore?.positive),
    whyLimiting: cleanLine(source.whyLimiting || source.whyThisScore?.limiting),
    tags: cleanList(source.tags, 6),
    metrics: {
      valueSpread: clampNumber(metrics.valueSpread, 0, 100),
      focalClarity: clampNumber(metrics.focalClarity, 0, 100),
      flowStrength: clampNumber(metrics.flowStrength, 0, 100),
      balanceQuality: clampNumber(metrics.balanceQuality, 0, 100),
      centerQuality: clampNumber(metrics.centerQuality, 0, 100)
    }
  };
}

function sanitizeHistory(value) {
  const list = Array.isArray(value) ? value : [];
  return list
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({
      role: item?.role === "assistant" ? "assistant" : "user",
      content: cleanLine(item?.content).slice(0, 360)
    }))
    .filter((item) => item.content);
}

function isClearlyOffTopic(message) {
  const lower = message.toLowerCase();
  const paintingWords = /\b(paint|painting|value|values|composition|color|colour|palette|draw|drawing|sketch|canvas|focal|edge|light|shadow|midtone|contrast|brush|oil|acrylic|watercolor|watercolour|portrait|landscape|reference|image|picture|art|artist)\b/i;
  if (paintingWords.test(lower)) {
    return false;
  }
  const offTopicWords = /\b(crypto|bitcoin|stock|stocks|sports|football|hockey|recipe|cook|dating|politics|election|president|javascript|python|code|programming|homework|essay|legal|lawyer|medical|diagnosis|travel|hotel|weather)\b/i;
  return offTopicWords.test(lower);
}

function checkRateLimit(key, unlocked) {
  const now = Date.now();
  const limit = unlocked ? UNLOCKED_RATE_LIMIT : FREE_RATE_LIMIT;
  const current = rateBuckets.get(key) || [];
  const fresh = current.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  if (fresh.length >= limit) {
    rateBuckets.set(key, fresh);
    return { ok: false };
  }
  fresh.push(now);
  rateBuckets.set(key, fresh);
  return { ok: true };
}

function getClientKey(event, unlocked) {
  const headers = event.headers || {};
  const forwarded = headers["x-forwarded-for"] || headers["X-Forwarded-For"] || "";
  const ip = String(forwarded).split(",")[0].trim() || headers["client-ip"] || "unknown";
  return `${unlocked ? "full" : "free"}:${ip}`;
}

async function callOpenAI(apiKey, payload) {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`OpenAI API error ${response.status}: ${text}`);
  }

  return data;
}

function parseModelJson(data) {
  const text = extractOutputText(data);
  if (!text) {
    throw new Error("Painter chat response was empty.");
  }

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Painter chat response was not valid JSON.");
    }
    return JSON.parse(match[0]);
  }
}

function extractOutputText(data) {
  if (typeof data?.output_text === "string") {
    return data.output_text;
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  return output
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .map((content) => content.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function normalizeChat(raw, unlocked) {
  const answer = cleanLine(raw?.answer).slice(0, unlocked ? 900 : 560);
  return {
    answer: answer || "I can help with values, composition, color, drawing structure, and what this Quick Check is seeing.",
    offTopic: Boolean(raw?.offTopic),
    unlockSuggested: !unlocked && Boolean(raw?.unlockSuggested)
  };
}

function cleanLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cleanList(value, maxItems) {
  return (Array.isArray(value) ? value : [])
    .map(cleanLine)
    .filter(Boolean)
    .slice(0, maxItems);
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return null;
  }
  return Math.min(max, Math.max(min, Math.round(number)));
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json"
    },
    body: typeof body === "string" ? body : JSON.stringify(body)
  };
}
