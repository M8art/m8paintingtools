const crypto = require("crypto");

const DEFAULT_ACCESS_TTL_SECONDS = 60 * 60 * 24 * 365 * 5;
const rateBuckets = new Map();

function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-M8-Access-Token, X-M8-Google-Play-Build, X-M8-Play-Access-Token",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...extraHeaders
    },
    body: typeof body === "string" ? body : JSON.stringify(body)
  };
}

function getAccessSecret() {
  return process.env.M8_ACCESS_TOKEN_SECRET ||
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "";
}

function base64UrlEncode(value) {
  return Buffer
    .from(typeof value === "string" ? value : JSON.stringify(value))
    .toString("base64url");
}

function signTokenInput(input, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(input)
    .digest("base64url");
}

function createAccessToken(claims = {}) {
  const secret = getAccessSecret();
  if (!secret) {
    throw new Error("Access token signing is not configured.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    scope: "premium",
    source: "access",
    iat: now,
    exp: now + DEFAULT_ACCESS_TTL_SECONDS,
    ...claims
  };
  const input = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}`;
  return `${input}.${signTokenInput(input, secret)}`;
}

function getHeader(event, name) {
  const headers = event?.headers || {};
  const lowerName = name.toLowerCase();
  return Object.entries(headers).find(([key]) => key.toLowerCase() === lowerName)?.[1] || "";
}

function getBearerToken(event) {
  const authorization = String(getHeader(event, "authorization") || "");
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (match) {
    return match[1].trim();
  }
  return String(getHeader(event, "x-m8-access-token") || "").trim();
}

function verifyAccessToken(token) {
  const secret = getAccessSecret();
  if (!secret) {
    return { ok: false, error: "Access verification is not configured." };
  }

  const value = String(token || "").trim();
  const parts = value.split(".");
  if (parts.length !== 3) {
    return { ok: false, error: "Access token is missing or invalid." };
  }

  const input = `${parts[0]}.${parts[1]}`;
  const expected = signTokenInput(input, secret);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(parts[2]);
  if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    return { ok: false, error: "Access token is invalid." };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch (error) {
    return { ok: false, error: "Access token payload is invalid." };
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload || payload.scope !== "premium" || Number(payload.exp || 0) <= now) {
    return { ok: false, error: "Access token has expired." };
  }

  return { ok: true, payload };
}

function isGooglePlayIncludedAccess(event) {
  const configuredToken = String(process.env.M8_GOOGLE_PLAY_ACCESS_TOKEN || "");
  const suppliedToken = String(getHeader(event, "x-m8-play-access-token") || "");
  if (!configuredToken || !suppliedToken) {
    return false;
  }
  const configuredBuffer = Buffer.from(configuredToken);
  const suppliedBuffer = Buffer.from(suppliedToken);
  return configuredBuffer.length === suppliedBuffer.length &&
    crypto.timingSafeEqual(configuredBuffer, suppliedBuffer);
}

function requirePremiumAccess(event, options = {}) {
  if (options.allowGooglePlay && isGooglePlayIncludedAccess(event)) {
    return {
      ok: true,
      payload: {
        scope: "premium",
        source: "google_play_build"
      }
    };
  }

  const token = getBearerToken(event);
  const result = verifyAccessToken(token);
  if (result.ok) {
    return result;
  }
  return {
    ok: false,
    response: jsonResponse(401, {
      error: "Premium access needs to be restored. Open Access and restore your purchase email."
    })
  };
}

function getClientIp(event) {
  const forwarded = getHeader(event, "x-forwarded-for");
  const firstForwarded = String(forwarded || "").split(",")[0].trim();
  return firstForwarded || getHeader(event, "client-ip") || "unknown";
}

function checkRateLimit(event, options = {}) {
  const limit = Number(options.limit || 20);
  const windowMs = Number(options.windowMs || 60 * 60 * 1000);
  const bucket = options.bucket || "default";
  const identity = options.identity || getClientIp(event);
  const key = `${bucket}:${identity}`;
  const now = Date.now();
  const current = rateBuckets.get(key) || [];
  const fresh = current.filter((timestamp) => now - timestamp < windowMs);

  if (fresh.length >= limit) {
    rateBuckets.set(key, fresh);
    const retryAfterMs = windowMs - (now - fresh[0]);
    return {
      ok: false,
      response: jsonResponse(429, {
        error: "Too many analysis requests. Please wait a bit and try again."
      }, {
        "Retry-After": String(Math.max(1, Math.ceil(retryAfterMs / 1000)))
      })
    };
  }

  fresh.push(now);
  rateBuckets.set(key, fresh);
  return { ok: true };
}

module.exports = {
  checkRateLimit,
  createAccessToken,
  getBearerToken,
  getClientIp,
  jsonResponse,
  requirePremiumAccess,
  verifyAccessToken
};
