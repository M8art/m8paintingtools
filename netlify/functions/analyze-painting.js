const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini";
const MAX_IMAGE_DATA_URL_LENGTH = 7_500_000;

const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    strengths: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: { type: "string" }
    },
    weaknesses: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: { type: "string" }
    },
    mainPriority: { type: "string" },
    nextSteps: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" }
    },
    valueStructure: { type: "string" },
    composition: { type: "string" },
    focalPoint: { type: "string" },
    colorHarmony: { type: "string" },
    edgeControl: { type: "string" },
    readability: { type: "string" }
  },
  required: [
    "summary",
    "strengths",
    "weaknesses",
    "mainPriority",
    "nextSteps",
    "valueStructure",
    "composition",
    "focalPoint",
    "colorHarmony",
    "edgeControl",
    "readability"
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
  const computedAnalysis = body.computedAnalysis;

  if (!isValidImageDataUrl(imageDataUrl)) {
    return response(400, { error: "A JPG, PNG, or WebP data URL is required." });
  }

  if (imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return response(413, { error: "Image is too large for AI analysis." });
  }

  if (!computedAnalysis || typeof computedAnalysis !== "object") {
    return response(400, { error: "Computed Quick Check analysis is required." });
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const prompt = buildUserPrompt(computedAnalysis);
  const basePayload = {
    model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: buildSystemPrompt()
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: prompt
          },
          {
            type: "input_image",
            image_url: imageDataUrl,
            detail: "low"
          }
        ]
      }
    ],
    max_output_tokens: 1400
  };

  try {
    const data = await callOpenAI(apiKey, {
      ...basePayload,
      text: {
        format: {
          type: "json_schema",
          name: "painting_mentor_feedback",
          schema: JSON_SCHEMA,
          strict: true
        }
      }
    });

    return response(200, {
      analysis: normalizeAnalysis(parseModelJson(data)),
      model
    });
  } catch (error) {
    if (!String(error.message || "").includes("OpenAI 400")) {
      console.error(error);
      return response(502, { error: "AI analysis failed. The normal Quick Check result is still available." });
    }

    try {
      const data = await callOpenAI(apiKey, {
        ...basePayload,
        input: [
          basePayload.input[0],
          {
            ...basePayload.input[1],
            content: [
              {
                type: "input_text",
                text: `${prompt}\n\nReturn valid JSON only, matching this shape: ${JSON.stringify(JSON_SCHEMA.properties)}`
              },
              basePayload.input[1].content[1]
            ]
          }
        ]
      });

      return response(200, {
        analysis: normalizeAnalysis(parseModelJson(data)),
        model
      });
    } catch (fallbackError) {
      console.error(fallbackError);
      return response(502, { error: "AI analysis failed. The normal Quick Check result is still available." });
    }
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

function normalizeAnalysis(raw) {
  return {
    summary: cleanText(raw.summary),
    strengths: cleanList(raw.strengths, 3),
    weaknesses: cleanList(raw.weaknesses, 3),
    mainPriority: cleanText(raw.mainPriority),
    nextSteps: cleanList(raw.nextSteps, 3),
    valueStructure: cleanText(raw.valueStructure),
    composition: cleanText(raw.composition),
    focalPoint: cleanText(raw.focalPoint),
    colorHarmony: cleanText(raw.colorHarmony),
    edgeControl: cleanText(raw.edgeControl),
    readability: cleanText(raw.readability)
  };
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cleanList(value, maxItems) {
  return (Array.isArray(value) ? value : [])
    .map(cleanText)
    .filter(Boolean)
    .slice(0, maxItems);
}

function isValidImageDataUrl(value) {
  return typeof value === "string"
    && /^data:image\/(jpeg|jpg|png|webp);base64,[a-z0-9+/=]+$/i.test(value);
}

function buildSystemPrompt() {
  return [
    "You are a serious classical oil painting mentor and studio teacher.",
    "Critique the uploaded painting using visible evidence and the supplied objective Quick Check measurements.",
    "Do not flatter. Do not invent subject details that are not visible. Do not overstate certainty.",
    "If the image looks like a screenshot, app UI, graphic panel, cropped fragment, or weak reference, say so directly and keep the score implications strict.",
    "Keep the language specific, practical, objective, encouraging but honest.",
    "Focus on painting improvement: value structure, composition, focal point, color harmony, edge control, readability, and next actions.",
    "Avoid generic phrases such as beautiful colors, nice work, strong composition, or painterly feel unless supported by visible evidence.",
    "Write concise studio notes, not a long essay."
  ].join(" ");
}

function buildUserPrompt(computedAnalysis) {
  return [
    "Analyze this uploaded painting/reference.",
    "Use the image first, then cross-check your interpretation against these computed Quick Check measurements.",
    "If the computed metrics and the visible image disagree, explain the visible evidence and stay conservative.",
    "Return JSON only.",
    "",
    "Computed Quick Check data:",
    JSON.stringify(computedAnalysis, null, 2)
  ].join("\n");
}
