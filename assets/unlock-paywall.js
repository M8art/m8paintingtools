(function () {
  const PAYMENT_LINK = "https://buy.stripe.com/4gMfZh9jNb2P2A32u8gw002";
  const ACCESS_LINK = "../access/index.html";
  const COPY = {
    title: "Want more checks today?",
    button: "Unlock Lifetime Access - $5",
    shortButton: "Unlock - $5",
    note: "One-time payment. Lifetime access. No subscription.",
    restore: "Already paid? Restore access",
    body: "Your free full check is available once every 24 hours. If you want to keep testing paintings today, unlock lifetime access.",
    limitTitle: "Today's free full check is used",
    limitBody: "Come back tomorrow for another free full check, or unlock lifetime access to keep working today.",
    lockedList: [
      "Unlimited checks",
      "Full painter fix plans",
      "Value, composition, color, and drawing tools",
      "Future updates included"
    ]
  };
  let lastUnlockTrackAt = 0;

  function open() {
    trackUnlockClicked("m8_unlock_open");
    window.location.href = PAYMENT_LINK;
  }

  function trackUnlockClicked(source = "unknown") {
    const now = Date.now();
    if (now - lastUnlockTrackAt < 750) {
      return;
    }
    lastUnlockTrackAt = now;

    const payload = {
      event_category: "monetization",
      event_label: source,
      page_location: window.location.href,
      transport_type: "beacon",
      value: 5
    };

    if (typeof window.gtag === "function") {
      window.gtag("event", "unlock_clicked", payload);
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "unlock_clicked",
      ...payload
    });
  }

  function getUnlockSource(element) {
    return element.id || element.dataset.unlockSource || element.dataset.unlockLink || "unlock_button";
  }

  function isUnlockClickElement(element) {
    if (!element) {
      return false;
    }
    const text = element.textContent || "";
    const href = element.getAttribute("href") || element.dataset.unlockLink || "";
    return element.hasAttribute("data-m8-unlock") ||
      text.includes("$5") ||
      href.includes(PAYMENT_LINK);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderInlineCard(options = {}) {
    const title = options.title || COPY.title;
    const body = options.body || COPY.body;
    const issue = options.issue;
    const list = Array.isArray(options.lockedList) && options.lockedList.length
      ? options.lockedList
      : COPY.lockedList;

    return [
      `<div class="m8-paywall-card">`,
      `<span class="m8-paywall-kicker">Daily free check used</span>`,
      `<h3>${escapeHtml(title)}</h3>`,
      issue ? `<p class="m8-paywall-issue"><strong>Biggest issue:</strong> ${escapeHtml(issue)}</p>` : "",
      `<p>${escapeHtml(body)}</p>`,
      `<ul>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`,
      `<div class="m8-paywall-actions">`,
      `<button class="m8-paywall-button" type="button" data-m8-unlock>${escapeHtml(options.button || COPY.button)}</button>`,
      `</div>`,
      `<p class="m8-paywall-note">${escapeHtml(options.note || COPY.note)}</p>`,
      `<p class="m8-paywall-restore"><a href="${ACCESS_LINK}">${escapeHtml(options.restore || COPY.restore)}</a></p>`,
      `</div>`
    ].join("");
  }

  function bind(root, fallback) {
    const scope = root || document;
    scope.querySelectorAll("[data-m8-unlock]").forEach((button) => {
      if (button.dataset.m8UnlockBound === "true") {
        return;
      }
      button.dataset.m8UnlockBound = "true";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        trackUnlockClicked(getUnlockSource(button));
        if (typeof fallback === "function") {
          fallback();
          return;
        }
        open();
      });
    });
    ensurePaymentNotes(scope);
  }

  function buttonHasNearbyPaymentNote(button) {
    const next = button.nextElementSibling;
    if (next?.classList?.contains("m8-payment-note")) {
      return true;
    }
    const nextText = next?.textContent || "";
    if (/One-time payment\. Lifetime access\. No subscription\./.test(nextText)) {
      return true;
    }
    const parentText = button.parentElement?.nextElementSibling?.textContent || "";
    const parentPreviousText = button.parentElement?.previousElementSibling?.textContent || "";
    return /One-time payment\. Lifetime access\. No subscription\./.test(parentText) ||
      /One-time payment\. Lifetime access\. No subscription\./.test(parentPreviousText);
  }

  function ensurePaymentNotes(root = document) {
    const scope = root || document;
    const buttons = Array.from(scope.querySelectorAll("button, a")).filter((button) => {
      const text = button.textContent || "";
      const href = button.getAttribute("href") || button.dataset.unlockLink || "";
      return text.includes("$5") || href.includes("buy.stripe.com/4gMfZh9jNb2P2A32u8gw002");
    });

    buttons.forEach((button) => {
      if (buttonHasNearbyPaymentNote(button)) {
        return;
      }
      const note = document.createElement("p");
      note.className = "m8-payment-note";
      note.textContent = COPY.note;
      button.insertAdjacentElement("afterend", note);
    });
  }

  document.addEventListener("click", (event) => {
    const element = event.target?.closest?.("button, a");
    if (!isUnlockClickElement(element)) {
      return;
    }
    trackUnlockClicked(getUnlockSource(element));
  }, true);

  window.M8_UNLOCK = {
    PAYMENT_LINK,
    ACCESS_LINK,
    COPY,
    open,
    trackUnlockClicked,
    renderInlineCard,
    bind,
    ensurePaymentNotes
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ensurePaymentNotes(document));
  } else {
    ensurePaymentNotes(document);
  }
})();
