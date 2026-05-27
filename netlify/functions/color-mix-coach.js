const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";
const MAX_IMAGE_DATA_URL_LENGTH = 4_500_000;

const MIX_COACH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: { type: "string" },
    startingPile: { type: "string" },
    adjustment: { type: "string" },
    mixingSteps: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" }
    },
    avoid: { type: "string" },
    finishCheck: { type: "string" }
  },
  required: ["verdict", "startingPile", "adjustment", "mixingSteps", "avoid", "finishCheck"]
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(204, "");
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Invalid request method." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, { error: "Color Mix Coach is not configured yet." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Invalid request body." });
  }

  const sample = normalizeSample(body.sample);
  const m8Mix = normalizeMix(body.m8Mix);
  if (!sample || !m8Mix.length) {
    return jsonResponse(400, { error: "Missing sampled color or M8 mix." });
  }

  const imageDataUrl = isValidImageDataUrl(body.imageDataUrl) ? body.imageDataUrl : "";
  if (imageDataUrl && imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return jsonResponse(413, { error: "Image is too large for Color Mix Coach." });
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const palette = normalizeNamedLines(body.palette, "name", "role").slice(0, 20);
  const rules = normalizeStringArray(body.rules).slice(0, 12);
  const notes = normalizeStringArray(body.notes).slice(0, 6);
  const tags = normalizeStringArray(body.tags).slice(0, 6);
  const alternateMix = normalizeMix(body.alternateMix);

  const userContent = [
    {
      type: "input_text",
      text: buildPromptText({ sample, m8Mix, alternateMix, notes, tags, rules, palette })
    }
  ];

  if (imageDataUrl) {
    userContent.push({
      type: "input_image",
      image_url: imageDataUrl,
      detail: "low"
    });
  }

  try {
    const data = await callOpenAI(apiKey, {
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "You are Mate Art's practical classical oil-painting color mixing coach.",
                "Use the supplied M8 palette rules as the source of truth.",
                "Do not invent unavailable pigments.",
                "Do not chase a perfect digital color match; explain a believable oil-paint mixing process.",
                "Write for a painter standing at the palette.",
                "Be direct, concrete, and concise.",
                "Do not mention AI, models, prompts, APIs, or software.",
                "Return only structured JSON matching the schema."
              ].join(" ")
            }
          ]
        },
        {
          role: "user",
          content: userContent
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "m8_color_mix_coach",
          schema: MIX_COACH_SCHEMA,
          strict: true
        }
      },
      max_output_tokens: 800
    });

    return jsonResponse(200, {
      mixCoach: normalizeMixCoach(parseModelJson(data))
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(502, { error: "Color Mix Coach failed. Try again in a moment." });
  }
};

function buildPromptText({ sample, m8Mix, alternateMix, notes, tags, rules, palette }) {
  return [
    "Create a painter-friendly mixing plan for this sampled color passage.",
    "",
    "SAMPLED COLOR:",
    JSON.stringify(sample),
    "",
    "M8 MOST LIKELY MIX:",
    JSON.stringify(m8Mix),
    "",
    "M8 ALTERNATE MIX:",
    JSON.stringify(alternateMix),
    "",
    "M8 PAINTER NOTES:",
    JSON.stringify(notes),
    "",
    "MIXING BEHAVIOR TAGS:",
    JSON.stringify(tags),
    "",
    "MATE/M8 MIXING RULES:",
    JSON.stringify(rules),
    "",
    "AVAILABLE PALETTE:",
    JSON.stringify(palette),
    "",
    "Return:",
    "verdict: one sentence naming what the mixture needs to read correctly.",
    "startingPile: where to start on the palette and why.",
    "adjustment: how to tune value, temperature, and chroma in order.",
    "mixingSteps: 3 to 5 short ordered actions, each starting with a verb.",
    "avoid: one specific mistake to avoid.",
    "finishCheck: one practical check before putting the note into the painting."
  ].join("\n");
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
    throw new Error("Color Mix Coach response was empty.");
  }

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Color Mix Coach response was not valid JSON.");
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

function normalizeMixCoach(raw) {
  return {
    verdict: cleanLine(raw.verdict),
    startingPile: cleanLine(raw.startingPile),
    adjustment: cleanLine(raw.adjustment),
    mixingSteps: normalizeStringArray(raw.mixingSteps).slice(0, 5),
    avoid: cleanLine(raw.avoid),
    finishCheck: cleanLine(raw.finishCheck)
  };
}

function normalizeSample(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  return {
    hex: cleanLine(value.hex),
    rgb: cleanLine(value.rgb),
    valueStep: clampNumber(value.valueStep, 1, 20),
    temperature: cleanLine(value.temperature),
    chromaLevel: cleanLine(value.chromaLevel),
    formRole: cleanLine(value.formRole),
    family: cleanLine(value.family),
    saturation: clampNumber(value.saturation, 0, 100),
    brightness: clampNumber(value.brightness, 0, 255)
  };
}

function normalizeMix(value) {
  return (Array.isArray(value) ? value : [])
    .map((item) => ({
      pigment: cleanLine(item?.pigment),
      percent: clampNumber(item?.percent, 0, 100)
    }))
    .filter((item) => item.pigment)
    .slice(0, 6);
}

function normalizeNamedLines(value, key, detailKey) {
  return (Array.isArray(value) ? value : [])
    .map((item) => ({
      [key]: cleanLine(item?.[key]),
      [detailKey]: cleanLine(item?.[detailKey])
    }))
    .filter((item) => item[key]);
}

function normalizeStringArray(value) {
  return (Array.isArray(value) ? value : [])
    .map(cleanLine)
    .filter(Boolean);
}

function cleanLine(value) {
  return String(value || "").replace(/\bAI\b/gi, "").replace(/\s+/g, " ").trim();
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return min;
  }
  return Math.max(min, Math.min(max, Math.round(number)));
}

function isValidImageDataUrl(value) {
  return typeof value === "string" && /^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(value);
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
