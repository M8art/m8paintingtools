const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";
const MAX_IMAGE_DATA_URL_LENGTH = 4_500_000;

const PALETTE_COACH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: { type: "string" },
    biggestColorProblem: { type: "string" },
    harmonyRead: { type: "string" },
    fixThisFirst: { type: "string" },
    palettePlan: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" }
    },
    avoid: { type: "string" },
    studioNote: { type: "string" }
  },
  required: [
    "verdict",
    "biggestColorProblem",
    "harmonyRead",
    "fixThisFirst",
    "palettePlan",
    "avoid",
    "studioNote"
  ]
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
    return jsonResponse(500, { error: "Color Palette Coach is not configured yet." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Invalid request body." });
  }

  const analysis = normalizeAnalysis(body.analysis);
  const palette = normalizePalette(body.palette);
  if (!analysis || !palette.length) {
    return jsonResponse(400, { error: "Missing palette analysis." });
  }

  const imageDataUrl = isValidImageDataUrl(body.imageDataUrl) ? body.imageDataUrl : "";
  if (imageDataUrl && imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return jsonResponse(413, { error: "Image is too large for Color Palette Coach." });
  }

  const rules = normalizeStringArray(body.rules).slice(0, 12);
  const m8Palette = normalizeNamedLines(body.m8Palette, "name", "role").slice(0, 20);
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const userContent = [
    {
      type: "input_text",
      text: buildPromptText({ analysis, palette, rules, m8Palette })
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
                "You are Mate Art's practical classical oil-painting palette coach.",
                "Use the supplied M8 measurements as the source of truth.",
                "Do not invent exact colors that are not supported by the palette data.",
                "Write for a painter deciding how to organize color before painting.",
                "Focus on harmony, temperature, chroma hierarchy, focal color, and paint order.",
                "Be direct, concrete, concise, and premium.",
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
          name: "m8_color_palette_coach",
          schema: PALETTE_COACH_SCHEMA,
          strict: true
        }
      },
      max_output_tokens: 1000
    });

    return jsonResponse(200, {
      paletteCoach: normalizePaletteCoach(parseModelJson(data))
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(502, { error: "Color Palette Coach failed. Try again in a moment." });
  }
};

function buildPromptText({ analysis, palette, rules, m8Palette }) {
  return [
    "Create a painter-friendly palette plan from this M8 color analysis.",
    "",
    "M8 PALETTE ANALYSIS:",
    JSON.stringify(analysis),
    "",
    "DOMINANT PALETTE:",
    JSON.stringify(palette),
    "",
    "MATE/M8 MIXING RULES:",
    JSON.stringify(rules),
    "",
    "AVAILABLE PAINTER PALETTE:",
    JSON.stringify(m8Palette),
    "",
    "Return:",
    "verdict: one sentence naming how the palette should be organized.",
    "biggestColorProblem: the most important color risk or weakness.",
    "harmonyRead: how the harmony is working in painter terms.",
    "fixThisFirst: the first practical color decision before details.",
    "palettePlan: 3 to 5 short ordered actions, each starting with a verb.",
    "avoid: one specific color mistake to avoid.",
    "studioNote: one final painter note about how to keep the palette controlled."
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
    throw new Error("Color Palette Coach response was empty.");
  }

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Color Palette Coach response was not valid JSON.");
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

function normalizePaletteCoach(raw) {
  return {
    verdict: cleanLine(raw.verdict),
    biggestColorProblem: cleanLine(raw.biggestColorProblem),
    harmonyRead: cleanLine(raw.harmonyRead),
    fixThisFirst: cleanLine(raw.fixThisFirst),
    palettePlan: normalizeStringArray(raw.palettePlan).slice(0, 5),
    avoid: cleanLine(raw.avoid),
    studioNote: cleanLine(raw.studioNote)
  };
}

function normalizeAnalysis(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  return {
    summary: cleanLine(value.summary),
    primary: cleanLine(value.primary),
    secondary: cleanLine(value.secondary),
    confidence: clampNumber(value.confidence, 0, 100),
    explanation: cleanLine(value.explanation),
    hint: cleanLine(value.hint),
    valueStructure: normalizePlainObject(value.valueStructure),
    focalColor: normalizePlainObject(value.focalColor),
    painterInterpretation: normalizeStringArray(value.painterInterpretation).slice(0, 6),
    howToPaint: normalizeStringArray(value.howToPaint).slice(0, 6),
    dominantColors: normalizePalette(value.dominantColors).slice(0, 8)
  };
}

function normalizePalette(value) {
  return (Array.isArray(value) ? value : [])
    .map((item) => ({
      hex: cleanLine(item?.hex),
      rgb: cleanLine(item?.rgb),
      painterHueName: cleanLine(item?.painterHueName),
      painterName: cleanLine(item?.painterName),
      role: cleanLine(item?.role),
      temperature: cleanLine(item?.temperature),
      valueLabel: cleanLine(item?.valueLabel),
      chroma: cleanLine(item?.chroma),
      coverage: clampNumber(item?.coverage, 0, 100),
      saturation: clampNumber(item?.saturation, 0, 100),
      brightness: clampNumber(item?.brightness, 0, 255)
    }))
    .filter((item) => item.hex || item.rgb || item.painterHueName || item.painterName);
}

function normalizePlainObject(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const output = {};
  Object.entries(value).slice(0, 12).forEach(([key, item]) => {
    if (Array.isArray(item)) {
      output[key] = normalizeStringArray(item).slice(0, 6);
    } else if (typeof item === "object" && item !== null) {
      output[key] = normalizePlainObject(item);
    } else {
      output[key] = cleanLine(item);
    }
  });
  return output;
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
