const STRIPE_API_BASE = "https://api.stripe.com/v1";
const MIN_UNLOCK_AMOUNT_USD = 500;
const { createAccessToken, jsonResponse } = require("./_access");

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function getSessionEmail(session) {
  return normalizeEmail(session?.customer_details?.email || session?.customer_email || "");
}

function isPaidUnlockSession(session) {
  if (!session || session.payment_status !== "paid") {
    return false;
  }
  const currency = String(session.currency || "").toLowerCase();
  const amount = Number(session.amount_total || 0);
  return currency === "usd" && amount >= MIN_UNLOCK_AMOUNT_USD;
}

async function fetchStripe(path, secretKey) {
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      "Stripe-Version": "2026-02-25.clover"
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || "Stripe request failed.");
  }
  return data;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(204, "");
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed." });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY;
  if (!secretKey) {
    return jsonResponse(500, { ok: false, error: "Checkout verification is not configured." });
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return jsonResponse(400, { ok: false, error: "Invalid request." });
  }

  const sessionId = String(payload.sessionId || payload.checkoutSessionId || "").trim();
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return jsonResponse(400, { ok: false, error: "Checkout session is missing." });
  }

  try {
    const session = await fetchStripe(`/checkout/sessions/${encodeURIComponent(sessionId)}`, secretKey);
    if (!isPaidUnlockSession(session)) {
      return jsonResponse(402, { ok: false, error: "Checkout payment is not confirmed yet." });
    }

    const email = getSessionEmail(session);
    return jsonResponse(200, {
      ok: true,
      unlocked: true,
      accessToken: createAccessToken({
        sub: email || "stripe_customer",
        source: "stripe_checkout",
        stripeSession: session.id
      }),
      email,
      restoredAt: new Date().toISOString()
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      error: "Could not verify checkout right now. Restore access with your Stripe receipt email."
    });
  }
};
