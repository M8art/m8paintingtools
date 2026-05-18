const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini";
const MAX_IMAGE_DATA_URL_LENGTH = 7_500_000;

const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    valueKey: { type: "string" },
    valueRange: { type: "string" },
    valueScale: {
      type: "object",
      additionalProperties: false,
      properties: {
        minValue: { type: "integer", minimum: 1, maximum: 20 },
        maxValue: { type: "integer", minimum: 1, maximum: 20 },
        keyLabel: {
          type: "string",
          enum: ["high key", "mid key", "low key", "full range", "compressed range", "high contrast"]
        },
        note: { type: "string" }
      },
      required: ["minValue", "maxValue", "keyLabel", "note"]
    },
    lightShadowStructure: { type: "string" },
    focalContrast: { type: "string" },
    squintReadability: { type: "string" },
    valueGrouping: { type: "string" },
    depth: { type: "string" },
    paintability: { type: "string" },
    practicalFixes: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" }
    },
    painterValueVerdict: { type: "string" }
  },
  required: [
    "valueKey",
    "valueRange",
    "valueScale",
    "lightShadowStructure",
    "focalContrast",
    "squintReadability",
    "valueGrouping",
    "depth",
    "paintability",
    "practicalFixes",
    "painterValueVerdict"
  ]
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return response(204, "");
  }

  if (event.httpMethod !== "POST") {
    return response(405, { error: "Method not allowed." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return response(500, { error: "Missing OPENAI_API_KEY environment variable." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return response(400, { error: "Invalid JSON body." });
  }

  const imageDataUrl = body.imageDataUrl;
  if (!isValidImageDataUrl(imageDataUrl)) {
    return response(400, { error: "A JPG, PNG, or WebP data URL is required." });
  }

  if (imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return response(413, { error: "Image is too large for AI Value Analysis." });
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const prompt = [
    "You are an expert classical oil painting instructor and value-structure critic.",
    "",
    "Analyze the uploaded image only from the perspective of VALUE, light, shadow, contrast, readability, and paintability.",
    "",
    "Do not give generic art feedback.",
    "Do not talk about color unless it affects value.",
    "Do not praise randomly.",
    "Give practical painter-specific critique.",
    "Use simple language.",
    "Avoid vague phrases like 'nice contrast' or 'interesting composition'.",
    "Always explain what the painter should actually do.",
    "Do not mention AI, models, prompts, or software.",
    "",
    "Analyze these areas:",
    "1. Overall Value Key: identify whether the image is high key, mid key, low key, full range, compressed range, or high contrast. Explain what this means for painting.",
    "2. Value Range: estimate whether the image uses a narrow, moderate, or wide value range. Mention if the darkest darks or lightest lights are missing, overused, or well controlled.",
    "Also estimate the visible range on the M8 value scale where 1 is the lightest possible value and 20 is the darkest possible value. Return minValue as the lightest important value used, maxValue as the darkest important value used, keyLabel as the best key description, and a short note.",
    "3. Light and Shadow Families: check separation between light family, halftones, core shadows, reflected lights, cast shadows, and accents/highlights. Point out if reflected lights are too bright, shadows are too broken, or halftones are confusing.",
    "4. Focal Point by Value Contrast: identify where the strongest value contrast is and whether it supports the main focal point or distracts from it.",
    "5. Big Shape Readability: imagine squinting at the image. Say whether the large light and dark masses read clearly or whether there are too many small value changes/noise.",
    "6. Value Grouping: check whether shadows are grouped together and lights are grouped together. Mention if the image would benefit from simplifying values into 3, 5, or 7 groups.",
    "7. Depth and Atmosphere: analyze whether value contrast decreases correctly into the background. Mention if background values compete with the foreground.",
    "8. Paintability: tell the painter whether this image is easy, intermediate, or difficult to paint from a value perspective. Explain why.",
    "9. Practical Painting Advice: give 3 specific recommendations the artist should follow before or during painting.",
    "10. Final Summary: end with a short Painter's Value Verdict in one or two sentences.",
    "",
    "Return JSON only, following the required schema. Each string should be direct, educational, painterly, and practical.",
    `Image name: ${String(body.imageName || "uploaded image").slice(0, 120)}`
  ].join("\n");

  const payload = {
    model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: [
              "You are a serious classical oil painting mentor.",
              "Analyze only value, light, shadow, contrast, readability, and paintability.",
              "Return strict JSON only."
            ].join(" ")
          }
        ]
      },
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_image", image_url: imageDataUrl, detail: "high" }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "value_analysis",
        schema: JSON_SCHEMA,
        strict: true
      }
    },
    max_output_tokens: 1700
  };

  try {
    const data = await callOpenAI(apiKey, payload);
    return response(200, {
      analysis: normalizeAnalysis(parseModelJson(data)),
      model
    });
  } catch (error) {
    console.error(error);
    return response(502, { error: "AI Value Analysis failed." });
  }
};

function response(statusCode, body) {
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

function isValidImageDataUrl(value) {
  return typeof value === "string" && /^data:image\/(png|jpe?g|webp);base64,/i.test(value);
}

async function callOpenAI(apiKey, payload) {
  const openAiResponse = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await openAiResponse.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!openAiResponse.ok) {
    throw new Error(`OpenAI ${openAiResponse.status}: ${text}`);
  }

  return data;
}

function parseModelJson(data) {
  const text = extractOutputText(data);
  if (!text) {
    throw new Error("OpenAI response did not include output text.");
  }

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("OpenAI response was not valid JSON.");
    }
    return JSON.parse(match[0]);
  }
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  if (!Array.isArray(data.output)) {
    return "";
  }

  return data.output
    .flatMap((item) => Array.isArray(item.content) ? item.content : [])
    .map((content) => content.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function normalizeAnalysis(value) {
  return {
    valueKey: clean(value.valueKey),
    valueRange: clean(value.valueRange),
    valueScale: normalizeValueScale(value.valueScale),
    lightShadowStructure: clean(value.lightShadowStructure),
    focalContrast: clean(value.focalContrast),
    squintReadability: clean(value.squintReadability),
    valueGrouping: clean(value.valueGrouping),
    depth: clean(value.depth),
    paintability: clean(value.paintability),
    practicalFixes: Array.isArray(value.practicalFixes) ? value.practicalFixes.slice(0, 3).map(clean).filter(Boolean) : [],
    painterValueVerdict: clean(value.painterValueVerdict)
  };
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeValueScale(value) {
  const source = value && typeof value === "object" ? value : {};
  const minValue = clampValueScale(source.minValue, 1);
  const maxValue = clampValueScale(source.maxValue, 20);
  return {
    minValue: Math.min(minValue, maxValue),
    maxValue: Math.max(minValue, maxValue),
    keyLabel: clean(source.keyLabel || "mid key"),
    note: clean(source.note)
  };
}

function clampValueScale(value, fallback) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(20, Math.max(1, number));
}
