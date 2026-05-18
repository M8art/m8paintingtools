const STRIPE_API_BASE = "https://api.stripe.com/v1";
const MIN_UNLOCK_AMOUNT_USD = 500;
const MAX_SESSION_PAGES = 10;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function getSessionEmail(session) {
  return normalizeEmail(session?.customer_details?.email || session?.customer_email || "");
}

function isUnlockSession(session, email) {
  if (!session || session.payment_status !== "paid") {
    return false;
  }

  if (getSessionEmail(session) !== email) {
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
    const message = data?.error?.message || "Stripe request failed.";
    throw new Error(message);
  }
  return data;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed." });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY;
  if (!secretKey) {
    return json(500, { ok: false, error: "Restore is not configured." });
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { ok: false, error: "Invalid request." });
  }

  const email = normalizeEmail(payload.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { ok: false, error: "Enter the email used for payment." });
  }

  try {
    let startingAfter = "";
    for (let page = 0; page < MAX_SESSION_PAGES; page += 1) {
      const params = new URLSearchParams({ limit: "100" });
      if (startingAfter) {
        params.set("starting_after", startingAfter);
      }

      const result = await fetchStripe(`/checkout/sessions?${params.toString()}`, secretKey);
      const sessions = Array.isArray(result.data) ? result.data : [];
      const match = sessions.find((session) => isUnlockSession(session, email));
      if (match) {
        return json(200, {
          ok: true,
          unlocked: true,
          restoredAt: new Date().toISOString()
        });
      }

      if (!result.has_more || sessions.length === 0) {
        break;
      }
      startingAfter = sessions[sessions.length - 1].id;
    }

    return json(404, {
      ok: false,
      error: "No paid $5 unlock was found for that email. Check the Stripe receipt email or contact support."
    });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error.message || "Could not restore access right now."
    });
  }
};
