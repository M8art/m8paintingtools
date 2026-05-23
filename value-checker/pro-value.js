(function () {
  const tierButtons = Array.from(document.querySelectorAll("[data-value-tier]"));
  const basicModeSwitcher = document.getElementById("valueBasicModeSwitcher");
  const basicLayout = document.getElementById("valueBasicLayout");
  const proLayout = document.getElementById("valueProLayout");
  const proInput = document.getElementById("aiValueFileInput");
  const proUploadZone = document.getElementById("aiValueUploadZone");
  const proPreview = document.getElementById("aiValuePreview");
  const proImageStage = document.getElementById("aiValueImageStage");
  const proEmptyState = document.getElementById("aiValueEmptyState");
  const proAnalyzeButton = document.getElementById("runAiValueAnalysisButton");
  const proMobileAnalyzeButton = document.getElementById("mobileRunAiValueAnalysisButton");
  const proResetButton = document.getElementById("resetAiValueButton");
  const proMobileResetButton = document.getElementById("mobileResetAiValueButton");
  const proStatusLine = document.getElementById("aiValueStatusLine");
  const proStatusDetail = document.getElementById("aiValueStatusDetail");
  const proResults = document.getElementById("aiValueResults");
  const proSurface = document.getElementById("aiValueSurface");
  const proLockPanel = document.getElementById("aiValueLockPanel");
  const proUnlockButton = document.getElementById("aiValueUnlockButton");
  const proUploadButtons = Array.from(document.querySelectorAll('label[for="aiValueFileInput"]'));
  const proAnalyzeButtons = [proAnalyzeButton, proMobileAnalyzeButton].filter(Boolean);
  const proResultLinks = Array.from(document.querySelectorAll('a[href="#aiValueResultPanel"]'));

  const params = new URLSearchParams(window.location.search);
  const DEV_MODE = params.get("dev") === "true";
  const LAST_FREE_CHECK_STORAGE_KEY = "m8_last_free_check";
  const UNLOCKED_ACCESS_STORAGE_KEY = "m8_unlocked";
  const UNLOCKED_ACCESS_COOKIE_NAME = "m8_unlocked";
  const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/4gMfZh9jNb2P2A32u8gw002";
  const VALUE_ANALYSIS_ENDPOINT = window.M8_VALUE_ANALYSIS_ENDPOINT || (
    window.M8_GOOGLE_PLAY_BUILD || window.location.protocol === "file:"
      ? "https://m8paintingtools.com/.netlify/functions/value-analysis"
      : "/.netlify/functions/value-analysis"
  );
  const AI_VALUE_IMAGE_MAX_DIMENSION = 1280;
  const AI_VALUE_IMAGE_QUALITY = 0.82;
  const MOBILE_AI_VALUE_IMAGE_MAX_DIMENSION = 896;
  const MOBILE_AI_VALUE_IMAGE_QUALITY = 0.68;
  const MOBILE_AI_VALUE_FALLBACK_MAX_DIMENSION = 720;
  const MOBILE_AI_VALUE_FALLBACK_QUALITY = 0.6;
  const MOBILE_AI_VALUE_TARGET_LENGTH = 1600000;

  let imageDataUrl = "";
  let imageName = "";
  let isRunning = false;
  let currentAnalysisUsesFreeSlot = false;
  let animationTimers = [];
  let uploadAnimationTimer = null;
  let analyzeCueTimer = null;
  let resultCueTimer = null;
  const VALUE_SCAN_STAGES = [
    { className: "stage-grid", line: "Preparing value scan...", detail: "Building a tonal read of the uploaded image.", delay: 420 },
    { className: "stage-values", line: "Grouping values...", detail: "Separating lights, halftones, and shadows.", delay: 640 },
    { className: "stage-structure", line: "Reading structure...", detail: "Checking whether the big value masses support the image.", delay: 720 }
  ];

  proUploadButtons.forEach((button) => button.classList.add("value-pro-upload-button"));
  proAnalyzeButtons.forEach((button) => button.classList.add("value-pro-analyze-button"));
  proResultLinks.forEach((link) => link.classList.add("value-pro-result-link"));

  function setTier(tier) {
    const isPro = tier === "pro";
    document.body.dataset.valueTier = tier;
    tierButtons.forEach((button) => {
      const active = button.dataset.valueTier === tier;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    basicModeSwitcher?.classList.toggle("hidden", isPro);
    basicLayout?.classList.toggle("hidden", isPro);
    proLayout?.classList.toggle("hidden", !isPro);
  }

  function setStatus(line, detail) {
    if (proStatusLine) proStatusLine.textContent = line;
    if (proStatusDetail) proStatusDetail.textContent = detail;
  }

  function setAnalyzeEnabled(enabled) {
    proAnalyzeButtons.forEach((button) => {
      if (button) button.disabled = !enabled || isRunning;
    });
  }

  function clearAnimationTimers() {
    animationTimers.forEach((timer) => window.clearTimeout(timer));
    animationTimers = [];
  }

  function clearSurfaceStages() {
    proSurface?.classList.remove("stage-upload", "stage-grid", "stage-values", "stage-structure", "stage-final");
  }

  function setAnalyzeButtonState(state) {
    if (state === "running" || state === "") {
      if (analyzeCueTimer) {
        window.clearTimeout(analyzeCueTimer);
        analyzeCueTimer = null;
      }
    }

    proAnalyzeButtons.forEach((button) => {
      button.classList.toggle("is-cue", state === "cue");
      button.classList.toggle("is-running", state === "running");
      if (state === "running") {
        button.textContent = "Analyzing...";
      } else if (!button.classList.contains("is-unlock-cta")) {
        button.textContent = "Analyze";
      }
    });
  }

  function setResultButtonState(state) {
    proResultLinks.forEach((link) => {
      link.classList.toggle("is-result-ready", state === "ready" || state === "cue");
      link.classList.toggle("is-result-cue", state === "cue");
    });

    if (resultCueTimer) {
      window.clearTimeout(resultCueTimer);
      resultCueTimer = null;
    }

    if (state === "cue") {
      resultCueTimer = window.setTimeout(() => {
        proResultLinks.forEach((link) => link.classList.remove("is-result-cue"));
        resultCueTimer = null;
      }, 900);
    }
  }

  function cueAnalyzeButtons() {
    if (analyzeCueTimer) {
      window.clearTimeout(analyzeCueTimer);
      analyzeCueTimer = null;
    }

    setAnalyzeButtonState("cue");
    analyzeCueTimer = window.setTimeout(() => {
      setAnalyzeButtonState("");
      analyzeCueTimer = null;
    }, 950);
  }

  function pulseUploadButtons() {
    proUploadButtons.forEach((button) => {
      button.classList.remove("is-upload-complete");
      void button.offsetWidth;
      button.classList.add("is-upload-complete");
    });

    if (uploadAnimationTimer) {
      window.clearTimeout(uploadAnimationTimer);
    }
    uploadAnimationTimer = window.setTimeout(() => {
      proUploadButtons.forEach((button) => button.classList.remove("is-upload-complete"));
      uploadAnimationTimer = null;
    }, 900);
  }

  function runScanAnimation() {
    clearAnimationTimers();
    clearSurfaceStages();
    proSurface?.classList.add("stage-upload");

    let elapsed = 0;
    VALUE_SCAN_STAGES.forEach((stage) => {
      elapsed += stage.delay;
      const timer = window.setTimeout(() => {
        clearSurfaceStages();
        proSurface?.classList.add(stage.className);
        setStatus(stage.line, stage.detail);
      }, elapsed);
      animationTimers.push(timer);
    });
  }

  function finishScanAnimation() {
    clearAnimationTimers();
    clearSurfaceStages();
    proSurface?.classList.add("stage-final");
    const timer = window.setTimeout(() => {
      proSurface?.classList.remove("stage-final");
    }, 900);
    animationTimers.push(timer);
  }

  function hasUnlockedAccess() {
    return window.localStorage.getItem(UNLOCKED_ACCESS_STORAGE_KEY) === "true" ||
      document.cookie.split(";").some((item) => item.trim() === `${UNLOCKED_ACCESS_COOKIE_NAME}=true`);
  }

  function persistUnlockedAccess() {
    window.localStorage.setItem(UNLOCKED_ACCESS_STORAGE_KEY, "true");
    document.cookie = `${UNLOCKED_ACCESS_COOKIE_NAME}=true; Max-Age=31536000; Path=/; SameSite=Lax`;
  }

  function getTodayAnalysisStamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getLastFreeCheckDay() {
    const storedValue = window.localStorage.getItem(LAST_FREE_CHECK_STORAGE_KEY) || "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(storedValue)) {
      return storedValue;
    }

    const timestamp = Number(storedValue);
    if (!Number.isFinite(timestamp) || timestamp <= 0) {
      return "";
    }

    const previousDate = new Date(timestamp);
    if (Number.isNaN(previousDate.getTime())) {
      return "";
    }

    const year = previousDate.getFullYear();
    const month = String(previousDate.getMonth() + 1).padStart(2, "0");
    const day = String(previousDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function hasUsedFreeAnalysisToday() {
    if (DEV_MODE || hasUnlockedAccess()) {
      return false;
    }
    return getLastFreeCheckDay() === getTodayAnalysisStamp();
  }

  function markFreeAnalysisUsedToday() {
    window.localStorage.setItem(LAST_FREE_CHECK_STORAGE_KEY, getTodayAnalysisStamp());
  }

  function handleUnlockReturn() {
    if (params.get("unlocked") !== "true") {
      return;
    }

    persistUnlockedAccess();
    const cleanedUrl = new URL(window.location.href);
    cleanedUrl.searchParams.delete("unlocked");
    window.history.replaceState({}, "", `${cleanedUrl.pathname}${cleanedUrl.search}${cleanedUrl.hash}`);
    setStatus("Unlocked forever.", "AI Value Analysis is now available without the daily free limit.");
  }

  function openFullUnlock() {
    window.location.href = STRIPE_PAYMENT_LINK;
  }

  function isLockedByLimit() {
    return !DEV_MODE && !hasUnlockedAccess() && hasUsedFreeAnalysisToday();
  }

  function updateAccessUI() {
    const locked = isLockedByLimit();
    proLockPanel?.classList.toggle("hidden", !locked);

    proAnalyzeButtons.forEach((button) => {
      if (!button) return;
      button.classList.toggle("is-unlock-cta", locked);
      button.textContent = locked ? "Unlock All Tools" : "Analyze";
      button.disabled = locked ? false : (!imageDataUrl || isRunning);
    });

    if (locked && !isRunning) {
      setAnalyzeButtonState("");
      setStatus("Daily free AI analysis used.", "Unlock all tools for $5 to keep using AI Value Analysis today.");
    }
  }

  function resetProValue() {
    imageDataUrl = "";
    imageName = "";
    isRunning = false;
    if (proInput) proInput.value = "";
    if (proPreview) proPreview.removeAttribute("src");
    proImageStage?.classList.add("hidden");
    proEmptyState?.classList.remove("hidden");
    proSurface?.classList.remove("is-running");
    clearAnimationTimers();
    clearSurfaceStages();
    setAnalyzeButtonState("");
    setResultButtonState("");
    if (uploadAnimationTimer) {
      window.clearTimeout(uploadAnimationTimer);
      uploadAnimationTimer = null;
    }
    if (analyzeCueTimer) {
      window.clearTimeout(analyzeCueTimer);
      analyzeCueTimer = null;
    }
    proUploadButtons.forEach((button) => button.classList.remove("is-upload-complete"));
    setAnalyzeEnabled(false);
    if (proResults) {
      proResults.innerHTML = "";
      proResults.classList.add("hidden");
      proResults.classList.remove("is-visible");
    }
    setStatus("Waiting for image upload.", "Upload a painting or reference image, then run AI Value Analysis.");
    updateAccessUI();
  }

  async function loadProImage(file) {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      setStatus("Upload an image file.", "Use JPG, PNG, or WebP.");
      return;
    }

    setAnalyzeEnabled(false);
    setStatus("Loading image...", "Preparing a mobile-safe image for AI Value Analysis.");

    try {
      const sourceDataUrl = await readFileAsDataUrl(file);
      imageDataUrl = await resizeImageDataUrl(sourceDataUrl, AI_VALUE_IMAGE_MAX_DIMENSION, AI_VALUE_IMAGE_QUALITY);
      imageName = file.name || "uploaded image";
      if (proPreview) proPreview.src = imageDataUrl;
      proImageStage?.classList.remove("hidden");
      proEmptyState?.classList.add("hidden");
      setAnalyzeEnabled(true);
      clearSurfaceStages();
      proSurface?.classList.add("stage-upload");
      pulseUploadButtons();
      setResultButtonState("");
      cueAnalyzeButtons();
      setStatus("Image loaded.", "Ready for AI Value Analysis.");
      if (proResults) {
        proResults.innerHTML = "";
        proResults.classList.add("hidden");
        proResults.classList.remove("is-visible");
      }
      updateAccessUI();
    } catch (error) {
      setAnalyzeEnabled(false);
      setStatus("Could not read image.", "Try another JPG, PNG, or WebP file.");
    }
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function loadImageFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = dataUrl;
    });
  }

  async function resizeImageDataUrl(dataUrl, maxDimension, quality) {
    const image = await loadImageFromDataUrl(dataUrl);
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    if (!sourceWidth || !sourceHeight) {
      return dataUrl;
    }

    const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  }

  function isMobileAiValueRun(event) {
    return event?.currentTarget === proMobileAnalyzeButton ||
      Boolean(window.matchMedia?.("(max-width: 720px)").matches);
  }

  async function createMobileAnalysisDataUrl(dataUrl) {
    try {
      const mobileDataUrl = await resizeImageDataUrl(
        dataUrl,
        MOBILE_AI_VALUE_IMAGE_MAX_DIMENSION,
        MOBILE_AI_VALUE_IMAGE_QUALITY
      );

      if (mobileDataUrl.length <= MOBILE_AI_VALUE_TARGET_LENGTH) {
        return mobileDataUrl;
      }

      return await resizeImageDataUrl(
        mobileDataUrl,
        MOBILE_AI_VALUE_FALLBACK_MAX_DIMENSION,
        MOBILE_AI_VALUE_FALLBACK_QUALITY
      );
    } catch {
      return dataUrl;
    }
  }

  function renderResults(data) {
    const analysis = data?.analysis || {};
    const valueScaleHtml = renderValueScale(analysis.valueScale);
    const blocks = [
      ["VALUE KEY", analysis.valueKey],
      ["VALUE RANGE", analysis.valueRange],
      ["LIGHT / SHADOW STRUCTURE", analysis.lightShadowStructure],
      ["FOCAL CONTRAST", analysis.focalContrast],
      ["SQUINT READABILITY", analysis.squintReadability],
      ["VALUE GROUPING", analysis.valueGrouping],
      ["DEPTH", analysis.depth],
      ["PAINTABILITY", analysis.paintability]
    ];

    const fixes = Array.isArray(analysis.practicalFixes) ? analysis.practicalFixes : [];
    const html = blocks
      .filter(([, value]) => value)
      .map(([title, value]) => `<div class="value-pro-result-block"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(value)}</p></div>`)
      .join("");
    const fixesHtml = fixes.length
      ? `<div class="value-pro-result-block"><h3>3 PRACTICAL FIXES</h3><ol>${fixes.map((fix) => `<li>${escapeHtml(fix)}</li>`).join("")}</ol></div>`
      : "";
    const verdictHtml = analysis.painterValueVerdict
      ? `<div class="value-pro-result-block value-pro-verdict"><h3>PAINTER'S VALUE VERDICT</h3><p>${escapeHtml(analysis.painterValueVerdict)}</p></div>`
      : "";

    if (proResults) {
      proResults.innerHTML = valueScaleHtml + html + fixesHtml + verdictHtml;
      proResults.classList.toggle("hidden", !proResults.innerHTML);
      proResults.classList.remove("is-visible");
      window.requestAnimationFrame(() => {
        proResults.classList.add("is-visible");
      });
      setResultButtonState("cue");
      window.setTimeout(() => {
        setResultButtonState("ready");
        scrollResultsIntoView();
      }, 920);
    }
  }

  function renderValueScale(scale) {
    if (!scale || typeof scale !== "object") {
      return "";
    }

    const minValue = clampScaleValue(scale.minValue, 1);
    const maxValue = clampScaleValue(scale.maxValue, 20);
    const start = Math.min(minValue, maxValue);
    const end = Math.max(minValue, maxValue);
    const rangeLeft = ((start - 1) / 19) * 100;
    const rangeWidth = Math.max(3, ((end - start) / 19) * 100);
    const ticks = Array.from({ length: 20 }, (_, index) => {
      const value = index + 1;
      const active = value >= start && value <= end;
      return `<span class="value-pro-scale-tick${active ? " active" : ""}" aria-hidden="true">${value}</span>`;
    }).join("");

    return [
      `<div class="value-pro-result-block value-pro-scale-card">`,
      `<div class="value-pro-scale-head">`,
      `<h3>M8 VALUE SCALE RANGE</h3>`,
      `<span>${escapeHtml(scale.keyLabel || "value key")}</span>`,
      `</div>`,
      `<div class="value-pro-scale" style="--range-left: ${rangeLeft.toFixed(2)}%; --range-width: ${rangeWidth.toFixed(2)}%;">`,
      `<div class="value-pro-scale-range" aria-hidden="true"></div>`,
      `<div class="value-pro-scale-ticks">${ticks}</div>`,
      `</div>`,
      `<div class="value-pro-scale-foot">`,
      `<span>1 lightest</span>`,
      `<strong>${start}-${end}</strong>`,
      `<span>20 darkest</span>`,
      `</div>`,
      scale.note ? `<p>${escapeHtml(scale.note)}</p>` : "",
      `</div>`
    ].join("");
  }

  function clampScaleValue(value, fallback) {
    const number = Math.round(Number(value));
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.min(20, Math.max(1, number));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function runAiValueAnalysis(event) {
    if (isLockedByLimit()) {
      openFullUnlock();
      return;
    }

    if (!imageDataUrl || isRunning) return;

    const isMobileRun = isMobileAiValueRun(event);
    isRunning = true;
    currentAnalysisUsesFreeSlot = !DEV_MODE && !hasUnlockedAccess();
    if (currentAnalysisUsesFreeSlot && !isMobileRun) {
      markFreeAnalysisUsedToday();
    }
    proSurface?.classList.add("is-running");
    if (uploadAnimationTimer) {
      window.clearTimeout(uploadAnimationTimer);
      uploadAnimationTimer = null;
      proUploadButtons.forEach((button) => button.classList.remove("is-upload-complete"));
    }
    setAnalyzeButtonState("running");
    setAnalyzeEnabled(false);
    runScanAnimation();
    setStatus("Analyzing values...", "Reading the image through value structure, light mass, shadow mass, and painterly clarity.");

    try {
      const requestImageDataUrl = isMobileRun
        ? await createMobileAnalysisDataUrl(imageDataUrl)
        : imageDataUrl;
      const response = await fetch(VALUE_ANALYSIS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: requestImageDataUrl, imageName })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "AI Value Analysis failed.");
      }
      if (currentAnalysisUsesFreeSlot && isMobileRun) {
        markFreeAnalysisUsedToday();
      }
      renderResults(data);
      finishScanAnimation();
      setStatus("AI Value Analysis ready.", "Review the value key, grouping, light/shadow structure, and practical fixes before painting.");
    } catch (error) {
      clearAnimationTimers();
      clearSurfaceStages();
      setStatus("AI Value Analysis failed.", error.message || "Try again in a moment.");
    } finally {
      isRunning = false;
      currentAnalysisUsesFreeSlot = false;
      proSurface?.classList.remove("is-running");
      setAnalyzeButtonState("");
      updateAccessUI();
    }
  }

  function scrollToResults(event) {
    event.preventDefault();
    scrollResultsIntoView();
  }

  function scrollResultsIntoView() {
    const target = proResults && !proResults.classList.contains("hidden") ? proResults : document.getElementById("aiValueResultPanel");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  tierButtons.forEach((button) => {
    button.addEventListener("click", () => setTier(button.dataset.valueTier));
  });

  proInput?.addEventListener("change", () => loadProImage(proInput.files?.[0]));
  proUploadZone?.addEventListener("click", () => {
    if (!imageDataUrl) proInput?.click();
  });
  proUploadZone?.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && !imageDataUrl) {
      event.preventDefault();
      proInput?.click();
    }
  });

  [proAnalyzeButton, proMobileAnalyzeButton].forEach((button) => {
    button?.addEventListener("click", runAiValueAnalysis);
  });
  [proResetButton, proMobileResetButton].forEach((button) => {
    button?.addEventListener("click", resetProValue);
  });
  proResultLinks.forEach((link) => {
    link.addEventListener("click", scrollToResults);
  });
  proUnlockButton?.addEventListener("click", openFullUnlock);

  handleUnlockReturn();
  resetProValue();
  setTier("basic");
})();
