const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_DATA_URL_LENGTH = 7_100_000;

const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    overallImpression: { type: "string" },
    strongestAreas: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" }
    },
    mainProblems: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" }
    },
    whatToImproveFirst: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" }
    },
    valueAdvice: { type: "string" },
    compositionAdvice: { type: "string" },
    colorAdvice: { type: "string" },
    drawingStructureAdvice: { type: "string" },
    finalStudioNote: { type: "string" }
  },
  required: [
    "overallImpression",
    "strongestAreas",
    "mainProblems",
    "whatToImproveFirst",
    "valueAdvice",
    "compositionAdvice",
    "colorAdvice",
    "drawingStructureAdvice",
    "finalStudioNote"
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
    return response(500, { error: "OpenAI API key is not configured." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return response(400, { error: "Invalid JSON body." });
  }

  const imageDataUrl = body.imageDataUrl;
  const validation = validateImageDataUrl(imageDataUrl);
  if (!validation.ok) {
    return response(validation.statusCode, { error: validation.error });
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const payload = {
    model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: [
              "You are an expert classical oil painting instructor and painting critique mentor.",
              "Analyze the uploaded image as a painting reference or artwork.",
              "Be practical, direct, and painter-friendly.",
              "Do not mention AI, prompts, models, or software.",
              "Do not overpromise and do not claim perfect accuracy.",
              "Return strict JSON only."
            ].join(" ")
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: buildPrompt(body)
          },
          {
            type: "input_image",
            image_url: imageDataUrl,
            detail: "high"
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "google_play_quick_analysis",
        schema: JSON_SCHEMA,
        strict: true
      }
    },
    max_output_tokens: 2200
  };

  try {
    const data = await callOpenAI(apiKey, payload);
    return response(200, {
      analysis: normalizeAnalysis(parseModelJson(data)),
      model
    });
  } catch (error) {
    return response(502, { error: "Quick Analysis failed. Please try another image or try again later." });
  }
};

function buildPrompt(body) {
  const imageName = String(body.imageName || "uploaded image").slice(0, 120);
  return [
    "Analyze this image for a painter.",
    "",
    "The critique must be useful for painting decisions, not generic art feedback.",
    "Look at value design, composition, focal point, color harmony, light, mood, edges, drawing, structure, and paintability.",
    "If the image is a photo reference, explain how it would work as a painting reference.",
    "If the image is already artwork, explain what to keep and what to improve.",
    "",
    "Required sections:",
    "1. Overall impression: a short summary of what is working visually.",
    "2. Strongest areas: what is good in value design, composition, focal point, color harmony, light, mood, edges, or structure.",
    "3. Main problems: what might be weak or confusing.",
    "4. What to improve first: exactly 3 priority fixes in practical painter language.",
    "5. Value advice: lights, halftones, shadows, contrast, grouping, and whether it would work as a painting.",
    "6. Composition advice: balance, focal point, eye movement, cropping, negative space, rule of thirds, diagonals, golden ratio or dynamic structure if relevant.",
    "7. Color advice: temperature, harmony, saturation, warm/cool balance, and possible palette direction.",
    "8. Drawing / structure advice: proportion, perspective, shapes, silhouette, and structural readability.",
    "9. Final studio note: short, honest, motivating conclusion.",
    "",
    "Tone: professional, friendly, clear, direct, written for painters. Use concrete observations and practical advice.",
    `Image name: ${imageName}`
  ].join("\n");
}

function validateImageDataUrl(value) {
  if (typeof value !== "string" || value.length === 0) {
    return { ok: false, statusCode: 400, error: "Image is missing." };
  }

  if (value.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return { ok: false, statusCode: 413, error: "Image is too large. Please upload an image under 5 MB." };
  }

  const match = value.match(/^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) {
    return { ok: false, statusCode: 400, error: "Invalid image. Please upload a JPG, PNG, or WebP image." };
  }

  const base64 = match[2];
  const padding = (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);
  const estimatedBytes = Math.floor((base64.length * 3) / 4) - padding;
  if (estimatedBytes > MAX_IMAGE_BYTES) {
    return { ok: false, statusCode: 413, error: "Image is too large. Please upload an image under 5 MB." };
  }

  return { ok: true };
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
    throw new Error(`OpenAI ${openAiResponse.status}`);
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

function normalizeAnalysis(raw) {
  return {
    overallImpression: cleanText(raw.overallImpression),
    strongestAreas: cleanList(raw.strongestAreas, 5),
    mainProblems: cleanList(raw.mainProblems, 5),
    whatToImproveFirst: cleanList(raw.whatToImproveFirst, 3),
    valueAdvice: cleanText(raw.valueAdvice),
    compositionAdvice: cleanText(raw.compositionAdvice),
    colorAdvice: cleanText(raw.colorAdvice),
    drawingStructureAdvice: cleanText(raw.drawingStructureAdvice),
    finalStudioNote: cleanText(raw.finalStudioNote)
  };
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cleanList(value, maxItems) {
  const list = Array.isArray(value) ? value : [value];
  return list.map(cleanText).filter(Boolean).slice(0, maxItems);
}

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
