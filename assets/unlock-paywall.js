(function () {
  const PAYMENT_LINK = "https://buy.stripe.com/4gMfZh9jNb2P2A32u8gw002";
  const ACCESS_LINK = "../access/index.html";
  const COPY = {
    title: "Show My Painting Fix Plan",
    button: "Show My Painting Fix Plan - $5",
    shortButton: "Unlock - $5",
    note: "One-time payment. Lifetime access. No subscription.",
    body: "Unlock the exact first fix, 3-step paint plan, and full painter breakdown.",
    lockedList: [
      "Exact first fix",
      "3-step paint plan",
      "Value, composition, color, and drawing breakdown",
      "Unlimited future checks"
    ]
  };

  function open() {
    window.location.href = PAYMENT_LINK;
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
      `<span class="m8-paywall-kicker">Full fix plan locked</span>`,
      `<h3>${escapeHtml(title)}</h3>`,
      issue ? `<p class="m8-paywall-issue"><strong>Biggest issue:</strong> ${escapeHtml(issue)}</p>` : "",
      `<p>${escapeHtml(body)}</p>`,
      `<ul>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`,
      `<div class="m8-paywall-actions">`,
      `<button class="m8-paywall-button" type="button" data-m8-unlock>${escapeHtml(options.button || COPY.button)}</button>`,
      `<a class="m8-paywall-secondary" href="${ACCESS_LINK}">Restore access</a>`,
      `</div>`,
      `<p class="m8-paywall-note">${escapeHtml(options.note || COPY.note)}</p>`,
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
        if (typeof fallback === "function") {
          fallback();
          return;
        }
        open();
      });
    });
  }

  window.M8_UNLOCK = {
    PAYMENT_LINK,
    ACCESS_LINK,
    COPY,
    open,
    renderInlineCard,
    bind
  };
})();
