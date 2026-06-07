const crypto = require("crypto");
const { createAccessToken, checkRateLimit, jsonResponse } = require("./_access");

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function isValidMemberPassword(value) {
  const submitted = String(value || "").trim();
  const configuredHash = String(process.env.M8_MEMBER_PASSWORD_SHA256 || "").trim().toLowerCase();
  if (configuredHash) {
    return safeCompare(sha256(submitted), configuredHash);
  }

  const configuredPassword = String(process.env.M8_MEMBER_PASSWORD || "").trim();
  return Boolean(configuredPassword) && safeCompare(submitted, configuredPassword);
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(204, "");
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed." });
  }

  const rate = checkRateLimit(event, {
    bucket: "member-unlock",
    limit: 8,
    windowMs: 60 * 60 * 1000
  });
  if (!rate.ok) {
    return rate.response;
  }

  if (!process.env.M8_MEMBER_PASSWORD && !process.env.M8_MEMBER_PASSWORD_SHA256) {
    return jsonResponse(500, { ok: false, error: "Member unlock is not configured." });
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return jsonResponse(400, { ok: false, error: "Invalid request." });
  }

  if (!isValidMemberPassword(payload.password)) {
    return jsonResponse(401, { ok: false, error: "Wrong password. Please check your member post." });
  }

  return jsonResponse(200, {
    ok: true,
    unlocked: true,
    accessToken: createAccessToken({
      sub: "member",
      source: "member_password"
    }),
    restoredAt: new Date().toISOString()
  });
};
