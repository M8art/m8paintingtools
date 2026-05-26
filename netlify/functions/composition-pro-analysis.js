const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini";
const MAX_IMAGE_DATA_URL_LENGTH = 7_500_000;

const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    overlayRead: { type: "string" },
    whatWorks: { type: "string" },
    problemAreas: { type: "string" },
    whatToAdjust: { type: "string" },
    watchFor: { type: "string" },
    practicalFixes: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" }
    },
    verdict: { type: "string" }
  },
  required: [
    "overlayRead",
    "whatWorks",
    "problemAreas",
    "whatToAdjust",
    "watchFor",
    "practicalFixes",
    "verdict"
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

  if (!["golden-ratio", "notan", "golden-spiral", "dynamic-symmetry", "rule-of-thirds", "center-lines", "diagonal-flow"].includes(body.mode)) {
    return response(400, { error: "Unsupported composition analysis mode." });
  }

  const imageDataUrl = body.imageDataUrl;
  if (!isValidImageDataUrl(imageDataUrl)) {
    return response(400, { error: "A JPG, PNG, or WebP data URL is required." });
  }

  if (imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return response(413, { error: "Image is too large for composition analysis." });
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const prompt = buildPrompt(body);

  const payload = {
    model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: "You are a serious classical painting mentor. Return strict JSON only."
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
        name: "composition_pro_analysis",
        schema: JSON_SCHEMA,
        strict: true
      }
    },
    max_output_tokens: 1500
  };

  try {
    const data = await callOpenAI(apiKey, payload);
    return response(200, {
      analysis: normalizeAnalysis(parseModelJson(data)),
      model
    });
  } catch (error) {
    console.error(error);
    return response(502, { error: getAnalysisErrorLabel(body.mode) });
  }
};

function buildPrompt(body) {
  const mode = body.mode;
  const imageName = String(body.imageName || "uploaded image").slice(0, 120);

  if (mode === "rule-of-thirds") {
    const measuredRead = body.overlay?.measuredRead
      ? JSON.stringify(body.overlay.measuredRead).slice(0, 1600)
      : "No measured thirds read supplied.";
    return [
      "You are an expert classical oil painting instructor and composition critic.",
      "",
      "Analyze the uploaded image only from the perspective of COMPOSITION and the Rule of Thirds.",
      "Do not give generic art feedback.",
      "Do not discuss color or brushwork unless it affects focal placement, value contrast, edge pressure, or compositional readability.",
      "Do not praise randomly.",
      "Do not mention AI, models, prompts, APIs, or software.",
      "",
      "The Rule of Thirds overlay divides the image into thirds horizontally and vertically.",
      "The four intersections are power areas, but they are teaching guides, not strict rules.",
      "Judge whether the main focal area, strongest value contrast, major shape mass, horizon/eye line, and edge pressure support a strong off-center design.",
      "Also judge whether the image feels too centered, too edge-heavy, split in half, or unclear about where the viewer should look first.",
      "",
      "Evaluate:",
      "1. What the painter is looking at when the thirds overlay is on the image.",
      "2. Whether the main focal point lands near a useful thirds zone or fights it.",
      "3. Whether the large value masses and negative spaces support the focal placement.",
      "4. Whether the composition feels balanced, too centered, too symmetrical, or pulled toward an edge.",
      "5. What the painter should crop, move, simplify, lighten, darken, or emphasize before painting.",
      "",
      "Use clear, direct, painterly language for a serious student.",
      "Avoid vague phrases like 'nice composition' or 'good balance'.",
      "Always explain what the painter should actually do first.",
      "Return JSON only, following the required schema.",
      "",
      `Measured thirds read from the app: ${measuredRead}`,
      `Image name: ${imageName}`
    ].join("\n");
  }

  if (mode === "center-lines") {
    const measuredRead = body.overlay?.measuredRead
      ? JSON.stringify(body.overlay.measuredRead).slice(0, 1800)
      : "No measured center read supplied.";
    return [
      "You are an expert classical oil painting instructor and composition critic.",
      "",
      "Analyze the uploaded image only from the perspective of COMPOSITION and CENTER LINES.",
      "Do not give generic art feedback.",
      "Do not discuss color or brushwork unless it affects center lock, symmetry, value weight, or focal readability.",
      "Do not praise randomly.",
      "Do not mention AI, models, prompts, APIs, or software.",
      "",
      "The center-line overlay shows the vertical and horizontal center axes.",
      "Judge whether the painting is intentionally centered, accidentally locked in the middle, too symmetrical, or successfully offset.",
      "Explain how visual weight sits left/right and top/bottom, whether the first read returns to the center, and whether the center structure helps the idea.",
      "",
      "Evaluate:",
      "1. What the painter is looking at when the center lines are on the image.",
      "2. Whether the main focal mass locks to the center or escapes it.",
      "3. Whether symmetry helps the image or makes it static.",
      "4. Whether the large value masses create enough directional pull away from the center.",
      "5. What the painter should move, crop, simplify, lighten, darken, or offset before painting.",
      "",
      "Use clear, direct, painterly language for a serious student.",
      "Avoid vague phrases like 'balanced composition'.",
      "Always explain what the painter should actually do first.",
      "Return JSON only, following the required schema.",
      "",
      `Measured center read from the app: ${measuredRead}`,
      `Image name: ${imageName}`
    ].join("\n");
  }

  if (mode === "diagonal-flow") {
    const measuredRead = body.overlay?.measuredRead
      ? JSON.stringify(body.overlay.measuredRead).slice(0, 1800)
      : "No measured diagonal read supplied.";
    return [
      "You are an expert classical oil painting instructor and composition critic.",
      "",
      "Analyze the uploaded image only from the perspective of COMPOSITION and DIAGONAL FLOW.",
      "Do not give generic art feedback.",
      "Do not discuss color or brushwork unless it affects directional movement, focal pull, edge pressure, or value-path readability.",
      "Do not praise randomly.",
      "Do not mention AI, models, prompts, APIs, or software.",
      "",
      "The diagonal-flow overlay uses the two main diagonals as guides for movement, counter movement, rhythm, and visual tension.",
      "Judge whether the image has a clear eye path, whether one diagonal dominates, whether the counter diagonal supports or fights it, and whether the large value masses create movement.",
      "",
      "Evaluate:",
      "1. What the painter is looking at when the diagonal overlay is on the image.",
      "2. Whether the main directional pull is clear or weak.",
      "3. Whether the counter diagonal supports the eye path or creates confusion.",
      "4. Whether focal accents, edges, value masses, and negative shapes create rhythm.",
      "5. What the painter should simplify, rotate, crop, darken, lighten, connect, or quiet before painting.",
      "",
      "Use clear, direct, painterly language for a serious student.",
      "Avoid vague phrases like 'nice movement'.",
      "Always explain what the painter should actually do first.",
      "Return JSON only, following the required schema.",
      "",
      `Measured diagonal read from the app: ${measuredRead}`,
      `Image name: ${imageName}`
    ].join("\n");
  }

  if (mode === "notan") {
    const rawGroups = Number(body.overlay?.valueGroups);
    const valueGroups = Number.isFinite(rawGroups) ? Math.min(4, Math.max(2, Math.round(rawGroups))) : 3;
    return [
      "You are an expert classical oil painting instructor and composition critic.",
      "",
      "Analyze the uploaded image only from the perspective of COMPOSITION and NOTAN value design.",
      "Do not give generic art feedback.",
      "Do not discuss color or brushwork unless it affects value grouping and composition readability.",
      "Do not praise randomly.",
      "Do not mention AI, models, prompts, APIs, or software.",
      "",
      `The Notan overlay simplifies the image into ${valueGroups} value groups.`,
      "Read the image as large light and dark masses, not as details.",
      "The goal is to judge whether the image remains strong when simplified.",
      "",
      "Evaluate:",
      "1. What the painter is looking at in the Notan view.",
      "2. Whether the large light and dark masses read clearly when squinting.",
      "3. Whether the focal area is supported by value grouping or lost in small value noise.",
      "4. Whether shadow shapes are grouped together or broken into too many pieces.",
      "5. Whether background values compete with the foreground.",
      "6. What should be simplified, joined, lightened, darkened, or redesigned before painting.",
      "",
      "Use clear, direct, painterly language for a serious student.",
      "Avoid vague phrases like 'nice contrast' or 'interesting balance'.",
      "Always explain what the painter should actually do.",
      "Return JSON only, following the required schema.",
      "",
      `Image name: ${imageName}`
    ].join("\n");
  }

  if (mode === "golden-spiral") {
    const placement = body.overlay?.placement
      ? JSON.stringify(body.overlay.placement).slice(0, 1200)
      : "No placement metadata supplied.";
    return [
      "You are an expert classical oil painting instructor and composition critic.",
      "",
      "Analyze the uploaded image only from the perspective of COMPOSITION and the Golden Spiral overlay.",
      "Do not give generic art feedback.",
      "Do not discuss color or brushwork unless it affects compositional readability.",
      "Do not praise randomly.",
      "Do not mention AI, models, prompts, APIs, or software.",
      "",
      "The uploaded image includes the user's confirmed Golden Spiral overlay drawn on top of the picture.",
      "Treat the spiral as a teaching guide for eye movement, focal hierarchy, large masses, and visual rhythm. Do not treat it as a strict rule.",
      "Use the overlay to judge whether the main focal point, strongest value contrast, important edges, and major shape movement support the spiral path.",
      "Also judge whether the spiral feels forced, misses the subject, cuts through the wrong masses, or needs to be moved, rotated, scaled, or flipped.",
      "",
      "Evaluate:",
      "1. What the painter is looking at when this spiral placement is on the image.",
      "2. Whether the spiral eye path supports the intended focal area.",
      "3. Whether major shapes, edges, value masses, and empty space help or fight the spiral movement.",
      "4. Whether the placement should be adjusted before painting.",
      "5. What the painter should simplify, crop, move, lighten, darken, or emphasize.",
      "",
      "Use clear, direct, painterly language for a serious student.",
      "Avoid vague phrases like 'nice flow' or 'interesting composition'.",
      "Always explain what the painter should actually do.",
      "Return JSON only, following the required schema.",
      "",
      `Spiral placement metadata: ${placement}`,
      `Image name: ${imageName}`
    ].join("\n");
  }

  if (mode === "dynamic-symmetry") {
    const metadata = body.overlay?.metadata
      ? JSON.stringify(body.overlay.metadata).slice(0, 1800)
      : "No dynamic symmetry metadata supplied.";
    return [
      "You are an expert classical oil painting instructor and composition critic.",
      "",
      "Analyze the uploaded image only from the perspective of COMPOSITION and DYNAMIC SYMMETRY armature structure.",
      "Do not give generic art feedback.",
      "Do not discuss color or brushwork unless it affects compositional structure, value contrast, edge pull, or focal readability.",
      "Do not praise randomly.",
      "Do not mention AI, models, prompts, APIs, or software.",
      "",
      "The uploaded image includes dynamic symmetry armature lines and highlighted detected points.",
      "The highlighted points were selected from strong local value/edge contrast and then checked against the nearest armature line.",
      "Explain why those points were selected in painter language: they are likely focal accents, edge intersections, value contrast knots, or visual weight anchors.",
      "Dynamic symmetry is a guide, not a rule. Judge whether the detected points and major masses actually support the armature or whether the structure feels accidental.",
      "",
      "Evaluate:",
      "1. What the painter is looking at when the armature overlay is on the image.",
      "2. Why the highlighted points were chosen and what visual role they probably play.",
      "3. Whether those points sit on useful dynamic lines or distract from the intended structure.",
      "4. Whether the large masses, focal accents, diagonals, edge pressure, and negative space support dynamic symmetry.",
      "5. What should be moved, simplified, strengthened, cropped, lightened, darkened, or de-emphasized before painting.",
      "",
      "Use clear, direct, painterly language for a serious student.",
      "Avoid vague phrases like 'nice movement' or 'good structure'.",
      "Always explain what the painter should actually do.",
      "Return JSON only, following the required schema.",
      "",
      `Dynamic symmetry metadata: ${metadata}`,
      `Image name: ${imageName}`
    ].join("\n");
  }

  return [
    "You are an expert classical oil painting instructor and composition critic.",
    "",
    "Analyze the uploaded image only from the perspective of COMPOSITION and the Golden Ratio overlay.",
    "Do not give generic art feedback.",
    "Do not discuss color or brushwork unless it affects compositional readability.",
    "Do not praise randomly.",
    "Do not mention AI, models, prompts, APIs, or software.",
    "",
    "The Golden Ratio overlay divides the image at 38.2% and 61.8% horizontally and vertically.",
    "The four golden intersections are the main power areas. The vertical and horizontal golden divisions are structural guides, not strict rules.",
    "",
    "Evaluate:",
    "1. What the painter is looking at when this overlay is on the image.",
    "2. Whether the main focal area, strongest value contrast, important edges, or major masses sit near golden lines or intersections.",
    "3. Whether the composition feels intentionally weighted or accidentally off-balance.",
    "4. Whether empty space, subject placement, horizon/eye line, large value masses, and edge pressure support the golden ratio structure.",
    "5. What is working, what is weakening the design, and what the painter should adjust before painting.",
    "",
    "Use clear, direct, painterly language for a serious student.",
    "Avoid vague phrases like 'nice composition' or 'interesting balance'.",
    "Always explain what the painter should actually do.",
    "Return JSON only, following the required schema.",
    "",
    `Image name: ${imageName}`
  ].join("\n");
}

function getAnalysisErrorLabel(mode) {
  if (mode === "notan") {
    return "Notan analysis failed.";
  }
  if (mode === "golden-spiral") {
    return "Golden Spiral analysis failed.";
  }
  if (mode === "dynamic-symmetry") {
    return "Dynamic Symmetry analysis failed.";
  }
  if (mode === "rule-of-thirds") {
    return "Rule of Thirds analysis failed.";
  }
  if (mode === "center-lines") {
    return "Center Lines analysis failed.";
  }
  if (mode === "diagonal-flow") {
    return "Diagonal Flow analysis failed.";
  }
  return "Golden Ratio analysis failed.";
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
    overlayRead: clean(value.overlayRead),
    whatWorks: clean(value.whatWorks),
    problemAreas: clean(value.problemAreas),
    whatToAdjust: clean(value.whatToAdjust),
    watchFor: clean(value.watchFor),
    practicalFixes: Array.isArray(value.practicalFixes) ? value.practicalFixes.slice(0, 3).map(clean).filter(Boolean) : [],
    verdict: clean(value.verdict)
  };
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}
