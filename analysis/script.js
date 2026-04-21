const analysisFileInput = document.getElementById("analysisFileInput");
const uploadZone = document.getElementById("uploadZone");
const imageStage = document.getElementById("imageStage");
const analysisSurface = document.getElementById("analysisSurface");
const analysisPreview = document.getElementById("analysisPreview");
const emptyState = document.getElementById("emptyState");
const statusHelper = document.getElementById("statusHelper");
const statusNote = document.getElementById("statusNote");
const workspaceHint = document.getElementById("workspaceHint");
const overlayColorControl = document.getElementById("overlayColorControl");
const overlayColorButton = document.getElementById("overlayColorButton");
const overlayColorMenu = document.getElementById("overlayColorMenu");
const overlayColorPreview = document.getElementById("overlayColorPreview");
const overlayColorSwatches = Array.from(document.querySelectorAll("[data-overlay-color]"));
const runAnalysisButton = document.getElementById("runAnalysisButton");
const quickCheckResult = document.getElementById("quickCheckResult");
const quickCheckTopSections = document.getElementById("quickCheckTopSections");
const quickCheckKeyInsightBlock = document.getElementById("quickCheckKeyInsightBlock");
const quickCheckKeyInsightText = document.getElementById("quickCheckKeyInsightText");
const quickCheckStrengthBlock = document.getElementById("quickCheckStrengthBlock");
const quickCheckStrengthText = document.getElementById("quickCheckStrengthText");
const quickCheckWeaknessBlock = document.getElementById("quickCheckWeaknessBlock");
const quickCheckWeaknessText = document.getElementById("quickCheckWeaknessText");
const quickCheckBlocks = document.getElementById("quickCheckBlocks");
const quickCheckScore = document.getElementById("quickCheckScore");
const quickCheckSuggestion = document.getElementById("quickCheckSuggestion");
const quickCheckSuggestionText = document.getElementById("quickCheckSuggestionText");
const quickCheckTags = document.getElementById("quickCheckTags");
const breakdownToggleButton = document.getElementById("breakdownToggleButton");
const quickCheckDetails = document.getElementById("quickCheckDetails");
const freeCheckNote = document.getElementById("freeCheckNote");
const lockedAnalysisState = document.getElementById("lockedAnalysisState");
const unlockFullAccessButton = document.getElementById("unlockFullAccessButton");

const params = new URLSearchParams(window.location.search);
const DEV_MODE = params.get("dev") === "true";
const FULL_ANALYSIS_STORAGE_KEY = "m8_full_analysis_used";
const UNLOCKED_ACCESS_STORAGE_KEY = "m8_unlocked";
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/cNi14n0Nhfj5deH2u8gw001";
const ANALYSIS_SEQUENCE = [
  { className: "stage-grid", helper: "Preparing your quick check", message: "Checking focal placement...", delay: 1100 },
  { className: "stage-grayscale", helper: "Preparing your quick check", message: "Mapping visual weight...", delay: 1500 },
  { className: "stage-contrast", helper: "Preparing your quick check", message: "Reviewing value structure...", delay: 1350 },
  { className: "stage-posterize", helper: "Preparing your quick check", message: "Estimating value range...", delay: 1250 },
  { className: "stage-center", helper: "Preparing your quick check", message: "Checking focal placement...", delay: 1200 }
];
const ANALYSIS_STAGE_CLASSES = ["stage-grid", "stage-grayscale", "stage-contrast", "stage-posterize", "stage-center", "stage-focus-lock", "stage-final"];
const MESSAGE_FADE_DURATION = 220;
const KEY_INSIGHT_INTROS = [
  "At a glance,",
  "Overall,",
  "Looking at the structure,",
  "From a compositional standpoint,"
];
const SECTION_FLOW_VARIANTS = [
  {
    topSectionOrder: ["keyInsight", "strength", "weakness"],
    detailOrder: "blocks-first"
  },
  {
    topSectionOrder: ["keyInsight", "weakness", "strength"],
    detailOrder: "blocks-first"
  },
  {
    topSectionOrder: ["keyInsight", "strength", "weakness"],
    detailOrder: "suggestion-first"
  }
];
const SECTION_BRIDGE_PHRASES = {
  strength: [
    "At the same time,",
    "At the same glance,",
    "Looking further,"
  ],
  weakness: [
    "At the same time,",
    "Looking a bit closer,",
    "This also shows up here:"
  ],
  suggestion: [
    "To address that,",
    "From there,",
    "In practical terms,"
  ]
};

let currentObjectUrl = null;
let hasUploadedImage = false;
let isAnalysisRunning = false;
let analysisTimeoutIds = [];
let latestQuickCheckResult = null;
let isBreakdownExpanded = false;
let selectedOverlayColor = "#1f1c18";
let isOverlayColorMenuOpen = false;
let statusMessageTimeoutId = null;
let justUnlockedFromStripe = false;

handleUnlockReturn();

updateAnalysisAccessUI();
updateOverlayColorUI();

if (justUnlockedFromStripe) {
  updateStatusMessage("Unlimited access unlocked.", true);
  workspaceHint.textContent = "Unlimited access unlocked.";
}

uploadZone.addEventListener("click", () => {
  analysisFileInput.click();
});

uploadZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    analysisFileInput.click();
  }
});

analysisFileInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (file) {
    showPreview(file);
  }
});

overlayColorButton.addEventListener("click", toggleOverlayColorMenu);
overlayColorSwatches.forEach((button) => {
  button.addEventListener("click", () => {
    selectOverlayColor(button.dataset.overlayColor);
  });
});
document.addEventListener("click", handleDocumentClick);

runAnalysisButton.addEventListener("click", () => {
  if (!hasUploadedImage || isAnalysisRunning) {
    return;
  }

  if (!DEV_MODE && !hasUnlockedAccess() && hasUsedFullAnalysis()) {
    showLockedAnalysisState();
    return;
  }

  runQuickCheck();
});

unlockFullAccessButton.addEventListener("click", () => {
  window.location.href = STRIPE_PAYMENT_LINK;
});

breakdownToggleButton.addEventListener("click", () => {
  isBreakdownExpanded = !isBreakdownExpanded;
  updateBreakdownUI();
});

["dragenter", "dragover"].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadZone.classList.add("dragover");
  });
});

["dragleave", "dragend"].forEach((eventName) => {
  uploadZone.addEventListener(eventName, () => {
    uploadZone.classList.remove("dragover");
  });
});

uploadZone.addEventListener("drop", (event) => {
  event.preventDefault();
  uploadZone.classList.remove("dragover");

  const [file] = event.dataTransfer?.files || [];
  if (file && file.type.startsWith("image/")) {
    showPreview(file);
  }
});

function showPreview(file) {
  resetAnalysisSequence();

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
  }

  currentObjectUrl = URL.createObjectURL(file);
  analysisPreview.src = currentObjectUrl;
  analysisPreview.onload = () => {
    hasUploadedImage = true;
    imageStage.classList.remove("hidden");
    emptyState.classList.add("hidden");
    workspaceHint.textContent = "Image is ready. Run the analysis when you want to continue.";
    statusHelper.classList.add("hidden");
    quickCheckResult.classList.add("hidden");
    lockedAnalysisState.classList.add("hidden");
    isBreakdownExpanded = false;
    updateBreakdownUI();
    updateStatusMessage("Image uploaded. Ready to run check.", true);
    updateAnalysisAccessUI();
  };
}

function toggleOverlayColorMenu(event) {
  event.stopPropagation();
  isOverlayColorMenuOpen = !isOverlayColorMenuOpen;
  updateOverlayColorUI();
}

function closeOverlayColorMenu() {
  isOverlayColorMenuOpen = false;
  updateOverlayColorUI();
}

function selectOverlayColor(color) {
  selectedOverlayColor = color || "#1f1c18";
  applyOverlayColor();
  closeOverlayColorMenu();
}

function handleDocumentClick(event) {
  if (!overlayColorControl.contains(event.target)) {
    closeOverlayColorMenu();
  }
}

function hasUsedFullAnalysis() {
  if (DEV_MODE) {
    return false;
  }

  if (hasUnlockedAccess()) {
    return false;
  }

  const storedValue = localStorage.getItem(FULL_ANALYSIS_STORAGE_KEY);

  if (storedValue === "true") {
    const todayStamp = getTodayAnalysisStamp();
    localStorage.setItem(FULL_ANALYSIS_STORAGE_KEY, todayStamp);
    return true;
  }

  return storedValue === getTodayAnalysisStamp();
}

function hasUnlockedAccess() {
  return localStorage.getItem(UNLOCKED_ACCESS_STORAGE_KEY) === "true";
}

function getTodayAnalysisStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function markFreeAnalysisUsedToday() {
  localStorage.setItem(FULL_ANALYSIS_STORAGE_KEY, getTodayAnalysisStamp());
}

function handleUnlockReturn() {
  if (params.get("unlocked") !== "true") {
    return;
  }

  localStorage.setItem(UNLOCKED_ACCESS_STORAGE_KEY, "true");
  justUnlockedFromStripe = true;

  const cleanedUrl = new URL(window.location.href);
  cleanedUrl.searchParams.delete("unlocked");
  const nextUrl = `${cleanedUrl.pathname}${cleanedUrl.search}${cleanedUrl.hash}`;
  window.history.replaceState({}, "", nextUrl || cleanedUrl.pathname);
}

function updateAnalysisAccessUI() {
  runAnalysisButton.textContent = "Run Analysis";
  runAnalysisButton.disabled = isAnalysisRunning || !hasUploadedImage;
}

function updateOverlayColorUI() {
  overlayColorMenu.classList.toggle("hidden", !isOverlayColorMenuOpen);
  overlayColorButton.setAttribute("aria-expanded", String(isOverlayColorMenuOpen));
  overlayColorPreview.classList.remove("overlay-color-black", "overlay-color-white", "overlay-color-red");
  overlayColorPreview.classList.add(getOverlayColorClass(selectedOverlayColor));
  overlayColorSwatches.forEach((button) => {
    button.classList.toggle("active", button.dataset.overlayColor === selectedOverlayColor);
  });
}

function getOverlayColorClass(color) {
  if (color === "#ffffff") {
    return "overlay-color-white";
  }
  if (color === "#c96a3d") {
    return "overlay-color-red";
  }
  return "overlay-color-black";
}

function applyOverlayColor() {
  document.documentElement.style.setProperty("--analysis-overlay-rgb", hexToRgbTriplet(selectedOverlayColor));
}

function runQuickCheck() {
  isAnalysisRunning = true;
  quickCheckResult.classList.add("hidden");
  lockedAnalysisState.classList.add("hidden");
  freeCheckNote.classList.add("hidden");
  statusHelper.classList.remove("hidden");
  updateStatusMessage("Checking focal placement...");
  workspaceHint.textContent = "Quick check in progress. Reviewing structure and balance.";
  latestQuickCheckResult = buildQuickCheckResult();
  applyFocalPosition(latestQuickCheckResult.metrics);
  updateAnalysisAccessUI();

  let elapsed = 0;
  ANALYSIS_SEQUENCE.forEach((step) => {
    const timeoutId = window.setTimeout(() => {
      setAnalysisStage(step.className);
      statusHelper.textContent = step.helper;
      updateStatusMessage(step.message);
    }, elapsed);
    analysisTimeoutIds.push(timeoutId);
    elapsed += step.delay;
  });

  const focalLockTimeoutId = window.setTimeout(() => {
    setAnalysisStage("stage-focus-lock");
  }, Math.max(elapsed - 260, 0));
  analysisTimeoutIds.push(focalLockTimeoutId);

  const finalTimeoutId = window.setTimeout(() => {
    completeQuickCheck();
  }, elapsed + 760);
  analysisTimeoutIds.push(finalTimeoutId);
}

function completeQuickCheck() {
  const result = latestQuickCheckResult || buildQuickCheckResult();

  setAnalysisStage("stage-final");
  statusHelper.classList.add("hidden");
  updateStatusMessage("Check complete.");
  workspaceHint.textContent = "Quick check complete. Review the composition notes on the right.";
  quickCheckScore.textContent = `${result.score} / 100`;
  quickCheckKeyInsightText.textContent = result.keyInsight;
  quickCheckStrengthText.textContent = result.strength;
  quickCheckWeaknessText.textContent = result.weakness;
  renderResultBlocks(result.blocks);
  quickCheckSuggestionText.textContent = result.suggestion;
  applyResultComposition(result.composition);
  quickCheckTags.innerHTML = "";
  result.tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.className = "result-tag";
    tagElement.textContent = tag;
    quickCheckTags.appendChild(tagElement);
  });
  isBreakdownExpanded = false;
  updateBreakdownUI();
  if (hasUnlockedAccess()) {
    freeCheckNote.textContent = "Unlimited access is now active.";
    freeCheckNote.classList.remove("hidden");
  } else {
    freeCheckNote.textContent = "This was your free full check for today.";
    freeCheckNote.classList.remove("hidden");
  }
  quickCheckResult.classList.remove("hidden");
  lockedAnalysisState.classList.add("hidden");

  if (!DEV_MODE && !hasUnlockedAccess()) {
    markFreeAnalysisUsedToday();
  }
  isAnalysisRunning = false;
  analysisTimeoutIds = [];
  updateAnalysisAccessUI();
}

function buildQuickCheckResult() {
  const metrics = analyzeUploadedImage();
  const composition = buildResultComposition();

  return {
    metrics,
    score: metrics.score,
    keyInsight: composeKeyInsightText(getKeyInsightLine(metrics), composition),
    strength: composeSectionText("strength", getStrengthLine(metrics), composition),
    weakness: composeSectionText("weakness", getWeaknessLine(metrics), composition),
    blocks: [
      { title: "Structure", text: getStructureLine(metrics) },
      { title: "Values", text: getValuesLine(metrics) }
    ],
    suggestion: composeSectionText("suggestion", getSuggestionLine(metrics), composition),
    composition,
    tags: buildTags(metrics)
  };
}

function analyzeUploadedImage() {
  if (!analysisPreview.naturalWidth || !analysisPreview.naturalHeight) {
    return getFallbackMetrics();
  }

  const sample = getImageSampleData(analysisPreview, 112);
  if (!sample) {
    return getFallbackMetrics();
  }

  const { width, height, luminance, averageLuminance, spread, stdDeviation } = sample;
  const centerX = 0.5;
  const centerY = 0.5;
  const centerRadius = 0.22;

  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;
  let leftWeight = 0;
  let rightWeight = 0;
  let centerWeight = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const normalizedX = width > 1 ? x / (width - 1) : 0.5;
      const normalizedY = height > 1 ? y / (height - 1) : 0.5;
      const brightness = luminance[index];
      const horizontalGradient = Math.abs(luminance[index + 1] - luminance[index - 1]) / 255;
      const verticalGradient = Math.abs(luminance[index + width] - luminance[index - width]) / 255;
      const gradientStrength = Math.hypot(horizontalGradient, verticalGradient);
      const contrastStrength = Math.abs(brightness - averageLuminance) / 255;
      const darknessBias = Math.max(0, (averageLuminance - brightness) / 255);
      const localWeight = (gradientStrength * 0.64) + (contrastStrength * 0.28) + (darknessBias * 0.18);

      totalWeight += localWeight;
      weightedX += normalizedX * localWeight;
      weightedY += normalizedY * localWeight;

      if (normalizedX < 0.5) {
        leftWeight += localWeight + (darknessBias * 0.08);
      } else {
        rightWeight += localWeight + (darknessBias * 0.08);
      }

      if (Math.hypot(normalizedX - centerX, normalizedY - centerY) <= centerRadius) {
        centerWeight += localWeight;
      }
    }
  }

  const safeTotalWeight = Math.max(totalWeight, 0.0001);
  const focalX = weightedX / safeTotalWeight;
  const focalY = weightedY / safeTotalWeight;
  const centerDistance = Math.hypot(focalX - 0.5, focalY - 0.5);
  const centerWeightShare = centerWeight / safeTotalWeight;
  const centerDominance = clamp(
    (1 - clamp(centerDistance / 0.24, 0, 1)) * 0.68
      + clamp((centerWeightShare - 0.16) / 0.26, 0, 1) * 0.32,
    0,
    1
  );

  const balanceDifference = Math.abs(leftWeight - rightWeight);
  const balanceImbalance = balanceDifference / Math.max(leftWeight + rightWeight, 0.0001);
  const balanceDirection = leftWeight > rightWeight ? "left" : "right";

  const valueSpread = spread;
  const valueStd = stdDeviation / 255;
  const focalRadius = 0.18;
  let focalWeight = 0;
  let topWeight = 0;
  let bottomWeight = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const normalizedX = width > 1 ? x / (width - 1) : 0.5;
      const normalizedY = height > 1 ? y / (height - 1) : 0.5;
      const brightness = luminance[index];
      const horizontalGradient = Math.abs(luminance[index + 1] - luminance[index - 1]) / 255;
      const verticalGradient = Math.abs(luminance[index + width] - luminance[index - width]) / 255;
      const gradientStrength = Math.hypot(horizontalGradient, verticalGradient);
      const contrastStrength = Math.abs(brightness - averageLuminance) / 255;
      const darknessBias = Math.max(0, (averageLuminance - brightness) / 255);
      const localWeight = (gradientStrength * 0.64) + (contrastStrength * 0.28) + (darknessBias * 0.18);

      if (Math.hypot(normalizedX - focalX, normalizedY - focalY) <= focalRadius) {
        focalWeight += localWeight;
      }

      if (normalizedY < 0.5) {
        topWeight += localWeight;
      } else {
        bottomWeight += localWeight;
      }
    }
  }

  const focalClarity = clamp((focalWeight / safeTotalWeight - 0.08) / 0.2, 0, 1);
  const verticalImbalance = Math.abs(topWeight - bottomWeight) / Math.max(topWeight + bottomWeight, 0.0001);
  const flowStrength = clamp((centerDistance * 1.25) + (balanceImbalance * 0.45) + (verticalImbalance * 0.3), 0, 1);
  const depthStrength = clamp((valueSpread * 0.62) + (valueStd * 0.75) + (verticalImbalance * 0.18), 0, 1);

  const centerQuality = clamp((centerDistance - 0.06) / 0.24, 0, 1) * 0.76
    + (1 - clamp((centerWeightShare - 0.14) / 0.36, 0, 1)) * 0.24;
  const balanceQuality = 1 - clamp(balanceImbalance / 0.28, 0, 1);
  const valueQuality = clamp((valueSpread - 0.22) / 0.36, 0, 1) * 0.72
    + clamp((valueStd - 0.11) / 0.18, 0, 1) * 0.28;
  const clarityQuality = focalClarity;
  const flowQuality = flowStrength;
  const depthQuality = depthStrength;
  const weightedQuality = (centerQuality * 0.22)
    + (balanceQuality * 0.18)
    + (valueQuality * 0.18)
    + (clarityQuality * 0.16)
    + (flowQuality * 0.14)
    + (depthQuality * 0.12);
  const score = clamp(Math.round(58 + (weightedQuality * 32)), 58, 90);

  return {
    score,
    centerDominance,
    centerDistance,
    centerWeightShare,
    focalX,
    focalY,
    balanceImbalance,
    balanceDirection,
    valueSpread,
    valueStd,
    focalClarity,
    flowStrength,
    depthStrength
  };
}

function getImageSampleData(image, maxDimension) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  if (!width || !height) {
    return null;
  }

  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const sampleWidth = Math.max(48, Math.round(width * scale));
  const sampleHeight = Math.max(48, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return null;
  }

  canvas.width = sampleWidth;
  canvas.height = sampleHeight;
  context.drawImage(image, 0, 0, sampleWidth, sampleHeight);

  const { data } = context.getImageData(0, 0, sampleWidth, sampleHeight);
  const luminance = new Float32Array(sampleWidth * sampleHeight);
  const luminanceValues = new Array(sampleWidth * sampleHeight);
  let total = 0;

  for (let index = 0, pixel = 0; index < data.length; index += 4, pixel += 1) {
    const alpha = data[index + 3] / 255;
    const luminanceValue = ((0.2126 * data[index]) + (0.7152 * data[index + 1]) + (0.0722 * data[index + 2])) * alpha
      + (255 * (1 - alpha));
    luminance[pixel] = luminanceValue;
    luminanceValues[pixel] = luminanceValue;
    total += luminanceValue;
  }

  const averageLuminance = total / luminance.length;
  let variance = 0;
  for (let index = 0; index < luminance.length; index += 1) {
    variance += (luminance[index] - averageLuminance) ** 2;
  }

  luminanceValues.sort((a, b) => a - b);
  const lower = luminanceValues[Math.floor(luminanceValues.length * 0.1)];
  const upper = luminanceValues[Math.floor(luminanceValues.length * 0.9)];

  return {
    width: sampleWidth,
    height: sampleHeight,
    luminance,
    averageLuminance,
    stdDeviation: Math.sqrt(variance / luminance.length),
    spread: (upper - lower) / 255
  };
}

function getFocalLine(metrics) {
  if (metrics.centerDominance > 0.68) {
    return pickVariant([
      "Main attention sits slightly too close to the center.",
      "The main emphasis stays slightly too near the middle.",
      "Attention gathers a little too close to center.",
      "The focal placement remains slightly too centered.",
      "The main pull stays a bit too close to the middle.",
      "The image holds its emphasis slightly too near center."
    ]);
  }

  if (metrics.centerDominance > 0.42) {
    return pickVariant([
      "The main emphasis feels reasonably offset from the center.",
      "The focal area sits a moderate distance away from the middle.",
      "Attention is placed reasonably away from center.",
      "The emphasis feels moderately offset from the center.",
      "The main pull sits reasonably outside the middle zone.",
      "The focal placement is moderately removed from center."
    ]);
  }

  return pickVariant([
    "Focal placement feels more comfortably outside the middle zone.",
    "The main emphasis sits comfortably away from the center.",
    "Attention lands well outside the middle area.",
    "The focal point feels clearly removed from the center.",
    "The main pull sits comfortably beyond the center zone.",
    "The emphasis is placed well away from the middle."
  ]);
}

function getBalanceLine(metrics) {
  if (metrics.balanceImbalance > 0.14) {
    return metrics.balanceDirection === "left"
      ? pickVariant([
        "Visual weight leans toward the left side.",
        "The left side carries more visual pull.",
        "The image feels weighted toward the left.",
        "Visual emphasis leans more strongly to the left.",
        "The left half carries more of the image's weight.",
        "The composition tips visually toward the left side."
      ])
      : pickVariant([
        "The right side carries more visual pull.",
        "Visual weight leans toward the right side.",
        "The image feels weighted toward the right.",
        "Visual emphasis leans more strongly to the right.",
        "The right half carries more of the image's weight.",
        "The composition tips visually toward the right side."
      ]);
  }

  return pickVariant([
    "The image feels fairly balanced from left to right.",
    "Visual weight feels fairly even across the frame.",
    "The composition reads as fairly balanced side to side.",
    "Left and right weight feel fairly well matched.",
    "The frame feels reasonably even from one side to the other.",
    "Visual pull stays fairly balanced across the image."
  ]);
}

function getValueLine(metrics) {
  if (metrics.valueSpread < 0.34 || metrics.valueStd < 0.16) {
    return pickVariant([
      "Value range is somewhat compressed.",
      "The value spread feels somewhat tight.",
      "Values stay somewhat close together.",
      "The image shows a somewhat compressed value range.",
      "The value range feels a bit narrow overall.",
      "The light and dark range stays somewhat compressed."
    ]);
  }

  if (metrics.valueSpread < 0.56 || metrics.valueStd < 0.23) {
    return pickVariant([
      "The image shows a moderate value spread.",
      "Value range feels moderate across the image.",
      "The values separate to a moderate degree.",
      "The image holds a moderate spread of values.",
      "The value range sits at a fairly moderate level.",
      "The light and dark groups separate moderately."
    ]);
  }

  return pickVariant([
    "Strong value separation helps the structure read clearly.",
    "The values separate strongly enough to clarify the structure.",
    "Clear value separation helps the image read more clearly.",
    "Strong value contrast supports a clear structural read.",
    "The value range separates clearly enough to strengthen the read.",
    "Strong light-dark separation helps the structure stay clear."
  ]);
}

function getFocalClarityLine(metrics) {
  if (metrics.focalClarity < 0.34) {
    return pickVariant([
      "The focal emphasis feels a little dispersed across the image.",
      "The main emphasis feels a bit spread out.",
      "Focal attention is a little too dispersed across the frame.",
      "The focal area reads as slightly diffused.",
      "The point of emphasis feels a bit too scattered.",
      "The focal read is slightly dispersed rather than concentrated."
    ]);
  }

  if (metrics.focalClarity < 0.64) {
    return pickVariant([
      "There is a readable focal area, though it could separate more clearly.",
      "The focal area is readable, but it could stand apart more clearly.",
      "There is a recognizable focal point, though its separation is only moderate.",
      "The focal emphasis reads clearly enough, but it could be more distinct.",
      "The focal point is readable, though it could separate more strongly.",
      "There is a clear enough focal stop, though it could stand out more."
    ]);
  }

  return pickVariant([
    "A clearer focal concentration helps the eye settle quickly.",
    "The focal concentration is clear enough for the eye to settle quickly.",
    "The eye finds a clearly concentrated focal area quickly.",
    "A clear focal concentration gives the eye a quick landing point.",
    "The focal area is concentrated clearly enough for a quick read.",
    "The eye settles quickly because the focal emphasis is clearly grouped."
  ]);
}

function getVisualFlowLine(metrics) {
  if (metrics.flowStrength < 0.34) {
    return pickVariant([
      "Movement feels fairly calm, with less directional pull through the frame.",
      "The image feels fairly calm, with limited directional movement.",
      "Directional pull through the frame feels fairly gentle.",
      "Visual movement stays fairly calm and restrained.",
      "The eye path feels fairly quiet across the image.",
      "The frame moves in a calm way, with limited directional push."
    ]);
  }

  if (metrics.flowStrength < 0.64) {
    return pickVariant([
      "There is some visual movement, though the flow could connect more strongly.",
      "The image has some movement, though the eye path could link more clearly.",
      "Visual flow is present, but it could connect more strongly.",
      "There is moderate movement through the frame, though it could feel more connected.",
      "The eye path has some movement, though it could join up more clearly.",
      "There is a moderate sense of flow, though the movement could connect better."
    ]);
  }

  return pickVariant([
    "Visual movement carries the eye through the image more confidently.",
    "The eye moves through the image with a stronger sense of direction.",
    "Visual flow guides attention through the frame more confidently.",
    "Movement through the image feels more clearly directed.",
    "The eye path moves through the frame with stronger direction.",
    "Flow through the image feels more confidently linked."
  ]);
}

function getDepthLine(metrics) {
  if (metrics.depthStrength < 0.34) {
    return pickVariant([
      "Depth reads a bit shallow, with less separation between spatial layers.",
      "The depth feels a bit shallow because the layers stay close together.",
      "Spatial layers separate only a little, so the depth reads as shallow.",
      "The image feels somewhat shallow in depth.",
      "The space reads a bit flat because the layers stay close.",
      "Depth feels limited where the planes separate only slightly."
    ]);
  }

  if (metrics.depthStrength < 0.64) {
    return pickVariant([
      "There is a moderate sense of depth across the value structure.",
      "Depth reads at a moderate level across the image.",
      "The value structure creates a moderate sense of depth.",
      "The image holds a moderate sense of spatial depth.",
      "The space feels moderately developed across the image.",
      "There is a fair sense of depth through the value pattern."
    ]);
  }

  return pickVariant([
    "Value separation gives the image a stronger sense of depth.",
    "The value structure creates a stronger feeling of depth.",
    "Clearer value separation gives the image stronger depth.",
    "Depth reads more strongly because the values separate well.",
    "The space feels deeper because the value layers separate clearly.",
    "Strong value separation helps the image hold more depth."
  ]);
}

function pickVariant(variants) {
  return variants[Math.floor(Math.random() * variants.length)];
}

function buildResultComposition() {
  const variant = pickVariant(SECTION_FLOW_VARIANTS);
  const bridgeKeys = Object.keys(SECTION_BRIDGE_PHRASES).filter(() => Math.random() < 0.28);

  return {
    intro: pickVariant(KEY_INSIGHT_INTROS),
    topSectionOrder: [...variant.topSectionOrder],
    detailOrder: variant.detailOrder,
    bridgeKeys
  };
}

function composeKeyInsightText(text, composition) {
  return `${composition.intro} ${lowercaseFirstCharacter(text)}`;
}

function composeSectionText(sectionKey, text, composition) {
  if (!composition.bridgeKeys.includes(sectionKey)) {
    return text;
  }

  return `${pickVariant(SECTION_BRIDGE_PHRASES[sectionKey])} ${lowercaseFirstCharacter(text)}`;
}

function lowercaseFirstCharacter(text) {
  if (!text) {
    return text;
  }

  return `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

function applyResultComposition(composition) {
  const topSectionBlocks = {
    keyInsight: quickCheckKeyInsightBlock,
    strength: quickCheckStrengthBlock,
    weakness: quickCheckWeaknessBlock
  };

  composition.topSectionOrder.forEach((sectionKey) => {
    quickCheckTopSections.appendChild(topSectionBlocks[sectionKey]);
  });

  if (composition.detailOrder === "suggestion-first") {
    quickCheckDetails.insertBefore(quickCheckSuggestion, quickCheckBlocks);
  } else {
    quickCheckDetails.insertBefore(quickCheckBlocks, quickCheckSuggestion);
  }
}

function getSuggestionLine(metrics) {
  const suggestions = [
    {
      score: 1 - clamp(metrics.centerDistance / 0.28, 0, 1),
      variants: [
        "Try shifting the main emphasis farther from the center so the composition feels less fixed.",
        "Move the focal area farther away from the middle so the image gains a little more tension.",
        "Pushing the main emphasis off-center would help the composition feel less anchored.",
        "Try breaking the central placement so the image reads with stronger tension.",
        "An off-center focal point would make the composition feel less static.",
        "Try moving the point of emphasis a bit farther from center.",
        "A less central focal placement would give the image more energy."
      ]
    },
    {
      score: metrics.balanceImbalance,
      variants: metrics.balanceDirection === "left"
        ? [
          "Reduce a little weight on the left or strengthen the right side to stabilize the frame.",
          "The image would feel steadier if some emphasis shifted away from the left side.",
          "Softening the left-side pull would help the frame settle more evenly.",
          "Try reinforcing the right side so the left-heavy read feels less pronounced.",
          "Redistributing some visual weight away from the left would stabilize the composition.",
          "Try easing the pull on the left so the frame feels more even.",
          "A little more support on the right would help balance the left-side weight."
        ]
        : [
          "Reduce a little weight on the right or strengthen the left side to stabilize the frame.",
          "The image would feel steadier if some emphasis shifted away from the right side.",
          "Softening the right-side pull would help the frame settle more evenly.",
          "Try reinforcing the left side so the right-heavy read feels less pronounced.",
          "Redistributing some visual weight away from the right would stabilize the composition.",
          "Try easing the pull on the right so the frame feels more even.",
          "A little more support on the left would help balance the right-side weight."
        ]
    },
    {
      score: 1 - clamp((metrics.valueSpread - 0.22) / 0.38, 0, 1),
      variants: [
        "Push the value separation more clearly so the big shapes read faster.",
        "Clarify the light and dark groups so the major shapes separate more clearly.",
        "A wider value range would help the big masses read more decisively.",
        "Try strengthening the value contrast so the structure becomes clearer faster.",
        "Separating the main value zones more clearly would strengthen the overall read.",
        "Try opening up the value range so the larger forms separate faster.",
        "A clearer split between light and dark masses would improve the read."
      ]
    },
    {
      score: 1 - metrics.focalClarity,
      variants: [
        "Clarify the main focal area by simplifying competing accents around it.",
        "Reducing nearby distractions would help the focal point stand out more clearly.",
        "Try quieting competing accents so the eye settles on the main emphasis faster.",
        "Softening surrounding details would help the focal area read more clearly.",
        "Simplifying the area around the focal point would strengthen the hierarchy.",
        "Try reducing nearby activity so the focal area stands apart more clearly.",
        "A quieter area around the main emphasis would improve focal clarity."
      ]
    },
    {
      score: 1 - metrics.flowStrength,
      variants: [
        "Look for a stronger directional path that guides the eye from one major shape to the next.",
        "A clearer eye path would help the composition move more intentionally across the frame.",
        "Try connecting the major shapes more strongly so the movement feels less interrupted.",
        "Strengthening the directional flow would help the image feel more unified.",
        "The composition would benefit from a clearer path of movement through the main forms.",
        "Try building a clearer route for the eye through the larger shapes.",
        "A stronger sense of movement between the main forms would help the image hold together."
      ]
    },
    {
      score: 1 - metrics.depthStrength,
      variants: [
        "Strengthen foreground and background separation to improve the sense of depth.",
        "Pushing the spatial layers farther apart would improve the depth read.",
        "More separation between front and back planes would strengthen the sense of space.",
        "Try clarifying the layer differences so the image feels less compressed.",
        "Stronger contrast between near and far shapes would improve the sense of depth.",
        "Try separating the planes more clearly so the space reads deeper.",
        "A clearer distinction between spatial layers would strengthen the depth."
      ]
    }
  ];

  suggestions.sort((a, b) => b.score - a.score);
  return pickVariant(suggestions[0].variants);
}

function getKeyInsightLine(metrics) {
  const issueCandidates = [
    {
      score: metrics.centerDominance,
      variants: [
        "The focal point sits too close to the center, reducing visual tension.",
        "The main emphasis remains too centered, which reduces tension.",
        "Attention gathers too strongly near the middle of the frame.",
        "The image stays anchored around the center more than it should.",
        "The focal area sits too near the middle, which makes the composition feel more fixed.",
        "The main pull stays too close to center, limiting tension.",
        "The image reads more centered than ideal, which makes it feel more static."
      ]
    },
    {
      score: metrics.balanceImbalance * 1.12,
      variants: metrics.balanceDirection === "left"
        ? [
          "Visual weight gathers too strongly on the left, pulling the composition off balance.",
          "The left side carries too much emphasis compared with the right.",
          "Attention gathers too heavily on the left side of the frame.",
          "The composition feels left-weighted, which tilts the overall read.",
          "The left side pulls the eye more strongly than the rest of the image.",
          "The left half holds too much of the picture's weight.",
          "The composition leans too strongly to the left overall."
        ]
        : [
          "Visual weight gathers too strongly on the right, pulling the composition off balance.",
          "The right side carries too much emphasis compared with the left.",
          "Attention gathers too heavily on the right side of the frame.",
          "The composition feels right-weighted, which tilts the overall read.",
          "The right side pulls the eye more strongly than the rest of the image.",
          "The right half holds too much of the picture's weight.",
          "The composition leans too strongly to the right overall."
        ]
    },
    {
      score: 1 - metrics.focalClarity,
      variants: [
        "The focal area is too diffused, so the eye does not settle quickly.",
        "The main emphasis feels too dispersed, which weakens the landing point.",
        "Attention spreads too broadly across the image instead of locking into one area.",
        "The focal read is too soft, so the eye keeps drifting.",
        "The image lacks a clearly defined focal stop, which softens the first read.",
        "The focal point is too spread out for the eye to settle firmly.",
        "The main emphasis disperses too widely across the frame."
      ]
    },
    {
      score: 1 - Math.max(
        clamp((metrics.valueSpread - 0.22) / 0.36, 0, 1),
        clamp((metrics.valueStd - 0.11) / 0.18, 0, 1)
      ),
      variants: [
        "Compressed value separation is softening the overall read.",
        "The values stay too close together, which lowers clarity.",
        "The value range is too tight, so the structure reads less decisively.",
        "Limited value separation is softening the image.",
        "The big value shapes do not separate enough, which weakens the hierarchy.",
        "The light-dark spread stays too compressed for a clear read.",
        "The value masses sit too close together, softening the structure."
      ]
    }
  ];
  const strongestIssue = issueCandidates.sort((a, b) => b.score - a.score)[0];

  if (strongestIssue.score > 0.58) {
    return pickVariant(strongestIssue.variants);
  }

  const strengthCandidates = [
    {
      score: 1 - metrics.centerDominance,
      variants: [
        "The focal point sits away from the middle, which gives the composition better tension.",
        "The main emphasis sits away from center, which gives the image better tension.",
        "Attention lands away from the middle, helping the composition feel less fixed.",
        "The focal placement stays outside the center enough to add tension.",
        "The off-center emphasis gives the composition a stronger sense of pull.",
        "The main pull sits away from center in a way that adds tension.",
        "The image gains a better sense of tension from its off-center emphasis."
      ]
    },
    {
      score: 1 - metrics.balanceImbalance,
      variants: [
        "The visual weight feels well distributed, helping the image read as a whole.",
        "Balance is handled well, so the composition feels settled.",
        "The image holds together because the weight distribution stays even.",
        "The overall balance feels stable and coherent.",
        "Visual weight is distributed in a way that keeps the frame unified.",
        "The frame feels well balanced overall, which helps it read clearly.",
        "The image feels evenly held together from side to side."
      ]
    },
    {
      score: Math.max(
        clamp((metrics.valueSpread - 0.22) / 0.36, 0, 1),
        clamp((metrics.valueStd - 0.11) / 0.18, 0, 1)
      ),
      variants: [
        "Clear value separation gives the structure a stronger and more readable hierarchy.",
        "The value pattern separates clearly enough to support a strong read.",
        "Value contrast helps the major forms organize more clearly.",
        "The image gains clarity from a stronger value structure.",
        "The value hierarchy supports the composition well.",
        "The larger value groups separate clearly enough to strengthen the read.",
        "Clear value relationships help the structure hold together."
      ]
    },
    {
      score: metrics.focalClarity,
      variants: [
        "The focal area stands out clearly, so the eye knows where to land.",
        "The main emphasis is clear enough to guide attention quickly.",
        "The eye finds the focal point without hesitation.",
        "There is a clear landing area, which helps the image read faster.",
        "The focal hierarchy is direct and easy to recognize.",
        "The main point of attention reads clearly and quickly.",
        "The eye settles easily because the focal area is clearly defined."
      ]
    }
  ];

  strengthCandidates.sort((a, b) => b.score - a.score);
  return pickVariant(strengthCandidates[0].variants);
}

function getStrengthLine(metrics) {
  const candidates = [
    {
      score: 1 - metrics.balanceImbalance,
      variants: [
        "The overall balance keeps the composition stable and readable.",
        "The image feels fairly even from side to side, which supports a clear read.",
        "Balance is handled well enough to keep the frame settled.",
        "The weight distribution gives the composition a stable structure.",
        "The frame holds together because the balance stays controlled.",
        "The composition feels stable because the side-to-side weight is well handled.",
        "The image stays readable because the balance remains fairly steady."
      ]
    },
    {
      score: 1 - metrics.centerDominance,
      variants: [
        "The focal placement avoids the center enough to create better visual tension.",
        "The main emphasis sits far enough from center to feel more active.",
        "The off-center focus gives the composition a stronger pull.",
        "Attention lands away from the middle, which adds tension.",
        "The focal position helps the image feel less fixed.",
        "The point of emphasis sits far enough from center to feel more alive.",
        "The off-center placement gives the image a more active read."
      ]
    },
    {
      score: metrics.focalClarity,
      variants: [
        "The focal area separates clearly enough for the eye to settle with confidence.",
        "The main emphasis reads distinctly, which helps attention land quickly.",
        "There is a clear focal stop, so the image feels easier to read.",
        "The focal hierarchy is strong enough to guide the eye without confusion.",
        "The point of emphasis stands out clearly and directly.",
        "The focal area is clear enough to give the eye a firm landing point.",
        "The main emphasis separates clearly, so the eye settles quickly."
      ]
    },
    {
      score: Math.max(
        clamp((metrics.valueSpread - 0.22) / 0.36, 0, 1),
        clamp((metrics.valueStd - 0.11) / 0.18, 0, 1)
      ),
      variants: [
        "The value structure holds together well enough to support a clear read.",
        "The values separate clearly enough to keep the structure understandable.",
        "The image benefits from a value pattern that feels organized.",
        "The value grouping supports the composition well.",
        "Light and dark relationships are clear enough to keep the read stable.",
        "The value pattern is organized clearly enough to support the structure.",
        "The larger value groups hold together in a way that reads clearly."
      ]
    },
    {
      score: metrics.flowStrength,
      variants: [
        "The arrangement creates a directional path that helps the eye move through the image.",
        "There is enough visual flow to keep attention moving across the frame.",
        "The shapes connect in a way that gives the image directional movement.",
        "The eye path feels coherent, which helps the composition read as a whole.",
        "Movement through the frame is handled with a clear rhythm.",
        "The image carries the eye through the frame in a coherent way.",
        "There is enough directional movement to keep the composition linked together."
      ]
    },
    {
      score: metrics.depthStrength,
      variants: [
        "The separation between major layers gives the image a believable sense of depth.",
        "The image holds a believable sense of depth because the layers separate well.",
        "Spatial depth comes through clearly enough to support the composition.",
        "There is enough layer separation to keep the space readable.",
        "Foreground and background relationships are distinct enough to create depth.",
        "The spatial layers separate clearly enough to give the image believable depth.",
        "Depth reads convincingly because the planes are clearly separated."
      ]
    }
  ];

  candidates.sort((a, b) => b.score - a.score);
  return pickVariant(candidates[0].variants);
}

function getWeaknessLine(metrics) {
  const candidates = [
    {
      score: metrics.centerDominance,
      variants: [
        "The main emphasis stays too close to center, which makes the structure feel more fixed.",
        "The focal point remains too centered, which reduces tension.",
        "Attention gathers too near the middle, which limits movement.",
        "The composition feels anchored to center, which makes it less active.",
        "The central emphasis is too strong, so the image reads as more static.",
        "The main pull stays too near the middle, which limits tension.",
        "The image feels too centered overall, which makes it feel more fixed."
      ]
    },
    {
      score: metrics.balanceImbalance * 1.12,
      variants: metrics.balanceDirection === "left"
        ? [
          "The left side carries too much visual pull compared with the right.",
          "Weight gathers too strongly on the left side of the frame.",
          "The composition feels left-heavy at the moment.",
          "The left side pulls attention more than the rest of the image.",
          "There is too much emphasis on the left compared with the right.",
          "The left half carries too much of the picture's weight.",
          "The frame leans too far to the left in visual weight."
        ]
        : [
          "The right side carries too much visual pull compared with the left.",
          "Weight gathers too strongly on the right side of the frame.",
          "The composition feels right-heavy at the moment.",
          "The right side pulls attention more than the rest of the image.",
          "There is too much emphasis on the right compared with the left.",
          "The right half carries too much of the picture's weight.",
          "The frame leans too far to the right in visual weight."
        ]
    },
    {
      score: 1 - Math.max(
        clamp((metrics.valueSpread - 0.22) / 0.36, 0, 1),
        clamp((metrics.valueStd - 0.11) / 0.18, 0, 1)
      ),
      variants: [
        "The values sit too close together, so the main shapes do not separate cleanly.",
        "The value range feels compressed, which softens the large forms.",
        "Light and dark groups are too close, so the hierarchy weakens.",
        "The image would read more clearly if the values separated more.",
        "The major value masses blend together more than they should.",
        "The light-dark spread is too compressed for the larger shapes to separate cleanly.",
        "The value groups sit too close together, which softens the structure."
      ]
    },
    {
      score: 1 - metrics.focalClarity,
      variants: [
        "Competing accents around the focal area weaken the image's hierarchy.",
        "There are too many competing points of attention near the focal area.",
        "The focal hierarchy softens because surrounding accents stay too active.",
        "Attention does not settle cleanly because nearby details compete with the focal point.",
        "The main emphasis loses strength when secondary accents remain too noticeable.",
        "Too much nearby activity keeps the focal area from reading clearly.",
        "The focal point weakens when surrounding accents stay too assertive."
      ]
    },
    {
      score: 1 - metrics.flowStrength,
      variants: [
        "The eye path feels a bit static, so the composition does not guide attention strongly.",
        "Movement through the frame feels limited right now.",
        "The composition does not guide the eye clearly enough from one shape to the next.",
        "The directional flow feels weak, which softens the overall rhythm.",
        "There is not enough movement connecting the main parts of the image.",
        "The eye path stays too still to guide attention strongly.",
        "The main shapes do not connect with enough movement through the frame."
      ]
    },
    {
      score: 1 - metrics.depthStrength,
      variants: [
        "The spatial layers stay too close together, which flattens the read.",
        "Depth feels compressed because the layers do not separate enough.",
        "The image reads flatter when the major planes stay too close in value.",
        "Foreground and background are not distinct enough to create stronger space.",
        "The layer relationships need more separation to avoid a flatter read.",
        "The spatial planes sit too close together, which flattens the image.",
        "The space feels too compressed because the layers do not separate clearly enough."
      ]
    }
  ];

  candidates.sort((a, b) => b.score - a.score);
  return pickVariant(candidates[0].variants);
}

function getStructureLine(metrics) {
  const focal = getFocalLine(metrics);
  const balance = getBalanceLine(metrics);
  const flow = getVisualFlowLine(metrics);

  return `${focal} ${balance} ${flow}`;
}

function getValuesLine(metrics) {
  const value = getValueLine(metrics);
  const clarity = getFocalClarityLine(metrics);
  const depth = getDepthLine(metrics);

  return `${value} ${clarity} ${depth}`;
}

function buildTags(metrics) {
  const tags = [];

  if (metrics.centerDominance > 0.68) {
    tags.push("Center Dominant");
  } else if (metrics.centerDominance > 0.42) {
    tags.push("Near Center");
  } else {
    tags.push("Offset Focus");
  }

  if (metrics.balanceImbalance > 0.14) {
    tags.push(metrics.balanceDirection === "left" ? "Left Heavy" : "Right Heavy");
  } else {
    tags.push("Balanced");
  }

  if (metrics.valueSpread < 0.34 || metrics.valueStd < 0.16) {
    tags.push("Compressed Values");
  } else if (metrics.valueSpread < 0.56 || metrics.valueStd < 0.23) {
    tags.push("Moderate Range");
  } else {
    tags.push("Strong Contrast");
  }

  if (metrics.focalClarity < 0.34) {
    tags.push("Diffuse Focus");
  } else if (metrics.focalClarity > 0.64) {
    tags.push("Clear Focus");
  }

  if (metrics.flowStrength < 0.34) {
    tags.push("Static Flow");
  } else if (metrics.flowStrength > 0.64) {
    tags.push("Strong Flow");
  }

  if (metrics.depthStrength < 0.34) {
    tags.push("Shallow Depth");
  } else if (metrics.depthStrength > 0.64) {
    tags.push("Layered Depth");
  }

  return [...new Set(tags)].slice(0, 4);
}

function getFallbackMetrics() {
  return {
    score: 72,
    centerDominance: 0.62,
    centerDistance: 0.12,
    centerWeightShare: 0.28,
    focalX: 0.47,
    focalY: 0.49,
    balanceImbalance: 0.16,
    balanceDirection: "left",
    valueSpread: 0.3,
    valueStd: 0.14,
    focalClarity: 0.38,
    flowStrength: 0.46,
    depthStrength: 0.35
  };
}

function setAnalysisStage(className) {
  ANALYSIS_STAGE_CLASSES.forEach((stageClass) => {
    analysisSurface.classList.remove(stageClass);
  });
  if (className) {
    analysisSurface.classList.add(className);
  }
}

function resetAnalysisSequence() {
  analysisTimeoutIds.forEach((timeoutId) => {
    window.clearTimeout(timeoutId);
  });
  if (statusMessageTimeoutId) {
    window.clearTimeout(statusMessageTimeoutId);
    statusMessageTimeoutId = null;
  }
  statusNote.classList.remove("is-fading");
  analysisTimeoutIds = [];
  isAnalysisRunning = false;
  latestQuickCheckResult = null;
  setAnalysisStage("");
  updateAnalysisAccessUI();
}

function renderResultBlocks(blocks) {
  quickCheckBlocks.innerHTML = "";
  blocks.forEach((block) => {
    const wrapper = document.createElement("div");
    wrapper.className = "result-block";

    const title = document.createElement("p");
    title.className = "result-block-title";
    title.textContent = block.title;

    const copy = document.createElement("p");
    copy.className = "detail-copy";
    copy.textContent = block.text;

    wrapper.appendChild(title);
    wrapper.appendChild(copy);
    quickCheckBlocks.appendChild(wrapper);
  });
}

function showLockedAnalysisState() {
  statusHelper.classList.add("hidden");
  quickCheckResult.classList.add("hidden");
  lockedAnalysisState.classList.remove("hidden");
  freeCheckNote.classList.add("hidden");
  updateStatusMessage("Unlock full access to continue.");
  workspaceHint.textContent = "Today's free full analysis has already been used. One payment unlocks the full app.";
}

function updateBreakdownUI() {
  breakdownToggleButton.textContent = isBreakdownExpanded ? "Hide full breakdown" : "Show full breakdown";
  breakdownToggleButton.setAttribute("aria-expanded", String(isBreakdownExpanded));
  quickCheckDetails.classList.toggle("expanded", isBreakdownExpanded);
  quickCheckDetails.setAttribute("aria-hidden", String(!isBreakdownExpanded));
}

function updateStatusMessage(message, immediate = false) {
  if (statusMessageTimeoutId) {
    window.clearTimeout(statusMessageTimeoutId);
    statusMessageTimeoutId = null;
  }

  if (statusNote.textContent === message) {
    return;
  }

  if (immediate) {
    statusNote.textContent = message;
    statusNote.classList.remove("is-fading");
    return;
  }

  statusNote.classList.add("is-fading");
  statusMessageTimeoutId = window.setTimeout(() => {
    statusNote.textContent = message;
    statusNote.classList.remove("is-fading");
    statusMessageTimeoutId = null;
  }, MESSAGE_FADE_DURATION);
}

function applyFocalPosition(metrics) {
  const focalX = clamp(metrics?.focalX ?? 0.5, 0.12, 0.88);
  const focalY = clamp(metrics?.focalY ?? 0.5, 0.12, 0.88);
  analysisSurface.style.setProperty("--scan-focus-x", `${(focalX * 100).toFixed(2)}%`);
  analysisSurface.style.setProperty("--scan-focus-y", `${(focalY * 100).toFixed(2)}%`);
}

function hexToRgbTriplet(hexColor) {
  const normalized = (hexColor || "#1f1c18").replace("#", "");
  const expanded = normalized.length === 3
    ? normalized.split("").map((char) => `${char}${char}`).join("")
    : normalized;
  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  return `${red} ${green} ${blue}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
