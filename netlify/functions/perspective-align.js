const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini";
const MAX_IMAGE_DATA_URL_LENGTH = 7_500_000;

const PERSPECTIVE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    mode: { type: "string", enum: ["one", "two"] },
    horizon: { type: "number", minimum: 0, maximum: 100 },
    left: { type: "number", minimum: -220, maximum: 45 },
    right: { type: "number", minimum: 55, maximum: 260 },
    center: { type: "number", minimum: 0, maximum: 100 },
    leftSpread: { type: "number", minimum: 20, maximum: 100 },
    rightSpread: { type: "number", minimum: 20, maximum: 100 },
    rayCount: { type: "number", minimum: 2, maximum: 12 },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    note: { type: "string" }
  },
  required: ["mode", "horizon", "left", "right", "center", "leftSpread", "rightSpread", "rayCount", "confidence", "note"]
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
    return jsonResponse(500, { error: "Perspective alignment is not configured yet." });
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
    return jsonResponse(413, { error: "Image is too large for perspective alignment." });
  }

  const localEstimate = body.localEstimate && typeof body.localEstimate === "object"
    ? body.localEstimate
    : null;
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
                "You are a perspective drawing assistant for architectural sketches.",
                "Find the practical two-point perspective setup for overlay guide lines.",
                "Return only JSON matching the schema.",
                "Coordinates are percentages of the image preview: x can be outside the image for vanishing points.",
                "horizon is y percent from top to bottom.",
                "left is the left vanishing point x percent and should usually be outside the image on the left for two-point architecture.",
                "right is the right vanishing point x percent and should usually be outside the image on the right.",
                "leftSpread and rightSpread control how wide guide rays fan out from each vanishing point.",
                "Prefer a stable teaching overlay that matches the main roof, balcony, facade, floor, and window edge families.",
                "Do not place a two-point vanishing point inside the building unless visual evidence is overwhelming.",
                "If the image is not architectural perspective, return a low confidence but still useful estimate."
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
                "Estimate the perspective overlay controls for this image.",
                "Use the visible drawing edges first.",
                "Return mode two for normal two-point perspective.",
                "The app sliders accept left between -220 and 45, right between 55 and 260, horizon 0-100, spread 20-100.",
                localEstimate ? `Offline estimate to cross-check, not blindly copy: ${JSON.stringify(localEstimate)}` : ""
              ].filter(Boolean).join("\n")
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
          name: "perspective_alignment",
          schema: PERSPECTIVE_SCHEMA,
          strict: true
        }
      },
      max_output_tokens: 650
    });

    return jsonResponse(200, {
      alignment: normalizeAlignment(parseModelJson(data))
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(502, { error: "Perspective alignment failed. Manual controls are still available." });
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
    throw new Error("Perspective alignment response was empty.");
  }

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Perspective alignment response was not valid JSON.");
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

function normalizeAlignment(raw) {
  return {
    mode: raw.mode === "one" ? "one" : "two",
    horizon: clampNumber(raw.horizon, 8, 92, 50),
    left: clampNumber(raw.left, -220, 45, -34),
    right: clampNumber(raw.right, 55, 260, 145),
    center: clampNumber(raw.center, 0, 100, 50),
    leftSpread: clampNumber(raw.leftSpread, 20, 100, 58),
    rightSpread: clampNumber(raw.rightSpread, 20, 100, 54),
    rayCount: Math.round(clampNumber(raw.rayCount, 2, 12, 8)),
    confidence: clampNumber(raw.confidence, 0, 1, 0.45),
    note: cleanLine(raw.note)
  };
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, number));
}

function cleanLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isValidImageDataUrl(value) {
  return typeof value === "string" && /^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(value);
}
