const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";
const MAX_IMAGE_DATA_URL_LENGTH = 7_500_000;

const BREAKDOWN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    studioVerdict: { type: "string" },
    valueStructure: { type: "string" },
    composition: { type: "string" },
    colorTemperature: { type: "string" },
    edgesDepth: { type: "string" },
    fixFirst: { type: "string" },
    paintPlan: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" }
    },
    beforeYouContinue: { type: "string" }
  },
  required: [
    "studioVerdict",
    "valueStructure",
    "composition",
    "colorTemperature",
    "edgesDepth",
    "fixFirst",
    "paintPlan",
    "beforeYouContinue"
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
    return jsonResponse(500, { error: "Painting breakdown is not configured yet." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Invalid request body." });
  }

  const image = body.image || body.imageDataUrl;
  if (!isValidImageDataUrl(image)) {
    return jsonResponse(400, { error: "Missing image." });
  }

  if (image.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return jsonResponse(413, { error: "Image is too large for the painting breakdown." });
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

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
                "You are a direct, practical classical oil painting teacher.",
                "Critique the uploaded painting or reference image in painterly terms.",
                "No hype. No generic chatbot language. Do not mention artificial intelligence, models, prompts, or software.",
                "Return only structured JSON matching the provided schema.",
                "Each section except fixFirst must be no more than 3 short sentences.",
                "studioVerdict must be one sharp sentence naming the main weakness.",
                "fixFirst must be one practical oil-painting action the painter should do first.",
                "paintPlan must be exactly 3 ordered practical studio actions, each starting with a verb."
              ].join(" ")
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "Create a full painting breakdown with these sections:",
                "STUDIO VERDICT: one direct sentence naming the main issue.",
                "VALUE STRUCTURE: explain the biggest value issue; mention light, halftone, shadow, or highlight if relevant.",
                "COMPOSITION: explain where the eye goes first; mention focal point, balance, or visual path.",
                "COLOR & TEMPERATURE: comment on warm/cool balance, saturation, and color harmony.",
                "EDGES & DEPTH: mention hard edges, soft edges, focus, or atmospheric depth.",
                "FIX FIRST: give one practical oil-painting action to do first.",
                "3-STEP PAINT PLAN: exactly three practical oil-painting actions in order.",
                "BEFORE YOU CONTINUE: one warning or check the painter should do before adding detail."
              ].join("\n")
            },
            {
              type: "input_image",
              image_url: image,
              detail: "low"
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "full_painting_breakdown",
          schema: BREAKDOWN_SCHEMA,
          strict: true
        }
      },
      max_output_tokens: 900
    });

    return jsonResponse(200, {
      breakdown: normalizeBreakdown(parseModelJson(data))
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(502, {
      error: "The painting breakdown could not be created right now. Try again in a moment."
    });
  }
};

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
    throw new Error("The painting breakdown response was empty.");
  }

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("The painting breakdown response was not valid JSON.");
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

function normalizeBreakdown(raw) {
  return {
    studioVerdict: cleanLine(raw.studioVerdict),
    valueStructure: cleanLine(raw.valueStructure),
    composition: cleanLine(raw.composition),
    colorTemperature: cleanLine(raw.colorTemperature),
    edgesDepth: cleanLine(raw.edgesDepth),
    fixFirst: cleanLine(raw.fixFirst),
    paintPlan: normalizePaintPlan(raw.paintPlan),
    beforeYouContinue: cleanLine(raw.beforeYouContinue)
  };
}

function normalizePaintPlan(value) {
  const lines = Array.isArray(value) ? value : [];
  return lines.map(cleanLine).filter(Boolean).slice(0, 3);
}

function cleanLine(value) {
  return String(value || "").replace(/\bAI\b/gi, "").replace(/\s+/g, " ").trim();
}

function isValidImageDataUrl(value) {
  return typeof value === "string" && /^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(value);
}
