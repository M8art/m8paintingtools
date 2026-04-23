const MODES = {
  thirds: {
    title: "Rule of Thirds",
    description: "Check whether the main shapes and accents land in strong compositional zones.",
    tip: "Look for pressure near the intersections and whether the design feels stable or forced."
  },
  grid: {
    title: "Grid",
    description: "Compare shape placement, spacing, and rhythm across the whole design.",
    tip: "Use the grid to judge intervals, alignments, and whether the big masses feel even or crowded."
  },
  center: {
    title: "Center Lines",
    description: "Judge symmetry, balance, and how the subject sits against the middle of the picture.",
    tip: "Check whether the main structure locks into the center or creates a more intentional offset."
  },
  diagonal: {
    title: "Diagonal Flow",
    description: "Study movement, tilt, and the directional pull of the composition.",
    tip: "Look for major edges, gestures, or value paths that echo or resist the diagonals."
  }
};

const ADVANCED_MODES = {
  "golden-ratio": {
    title: "Golden Ratio",
    description: "Uses the golden section (1:1.618) to divide the image into naturally balanced areas.",
    tip: "Check if key elements align with the golden intersections or fall along the main divisions.",
    status: "Upload an image to begin."
  },
  "golden-spiral": {
    title: "Golden Spiral",
    description: "Applies a Fibonacci-based spiral to help visualize how the eye may travel through the composition. The spiral is not a strict rule, but a guide for studying visual flow and focal emphasis.",
    tip: "Try aligning the spiral center with your main focal point. Then observe whether major forms, edges, or transitions follow the curve and support a natural movement through the image.",
    status: "Overlay is active. Use the controls below to rotate, scale, and reposition the spiral."
  },
  "dynamic-symmetry": {
    title: "Dynamic Symmetry",
    description: "Overlays diagonal and reciprocal lines (armature of the rectangle) to reveal structural harmony.",
    tip: "Look for edges, forms, or gestures that align with the main diagonals and reciprocal lines.",
    status: "Upload an image to begin."
  },
  notan: {
    title: "Notan",
    description: "Simplifies the image into 2-4 value groups to reveal the core value design and large shape structure.",
    tip: "Check if the composition still works clearly when reduced to simple value shapes.",
    status: "Notan view is active. Adjust the value groups to simplify the image further."
  },
  "focal-balance": {
    title: "Focal Balance",
    description: "Map your focal hierarchy by placing primary, secondary, and tertiary points directly on the image or by using contrast-based suggestions.",
    tip: "Click to place up to three focal points or use the contrast suggestion to find likely focal areas. Then compare whether the eye lands where you intend.",
    status: "Click on the image to place up to three focal points, or use Suggest by Contrast for an automatic starting point."
  }
};

const fileInput = document.getElementById("fileInput");
const uploadLabels = Array.from(document.querySelectorAll('label[for="fileInput"]'));
const clearNotesButton = document.getElementById("clearNotesButton");
const canvasWrap = document.getElementById("canvasWrap");
const compositionStage = document.getElementById("compositionStage");
const compositionImage = document.getElementById("compositionImage");
const overlayCanvas = document.getElementById("overlayCanvas");
const emptyState = document.getElementById("emptyState");
const emptyStateLabel = emptyState?.querySelector(".upload-empty-label");
const workspaceTitle = document.getElementById("workspaceTitle");
const workspaceHint = document.getElementById("workspaceHint");
const overlayColorControl = document.getElementById("overlayColorControl");
const overlayColorButton = document.getElementById("overlayColorButton");
const overlayColorMenu = document.getElementById("overlayColorMenu");
const overlayColorPreview = document.getElementById("overlayColorPreview");
const overlayColorSwatches = Array.from(document.querySelectorAll("[data-overlay-color]"));
const analysisTitle = document.getElementById("analysisTitle");
const modeDescription = document.getElementById("modeDescription");
const modeTip = document.getElementById("modeTip");
const statusNote = document.getElementById("statusNote");
const modeButtons = Array.from(document.querySelectorAll("[data-mode]"));
const analysisModeButtons = Array.from(document.querySelectorAll("[data-analysis-mode]"));
const advancedModeButtons = Array.from(document.querySelectorAll("[data-advanced-mode]"));
const basicToolSwitcher = document.getElementById("basicToolSwitcher");
const advancedToolSwitcher = document.getElementById("advancedToolSwitcher");
const basicAnalysisPanel = document.getElementById("basicAnalysisPanel");
const advancedAnalysisPanel = document.getElementById("advancedAnalysisPanel");
const advancedModeDescription = document.getElementById("advancedModeDescription");
const advancedModeTip = document.getElementById("advancedModeTip");
const advancedStatusNote = document.getElementById("advancedStatusNote");
const advancedUnlockCard = document.getElementById("advancedUnlockCard");
const advancedUnlockCopy = document.getElementById("advancedUnlockCopy");
const advancedUnlockButton = document.getElementById("advancedUnlockButton");
const premiumToast = document.getElementById("premiumToast");
const spiralControlsCard = document.getElementById("spiralControlsCard");
const notanControlsCard = document.getElementById("notanControlsCard");
const focalControlsCard = document.getElementById("focalControlsCard");
const dynamicSymmetryControlsCard = document.getElementById("dynamicSymmetryControlsCard");
const dynamicSymmetryScore = document.getElementById("dynamicSymmetryScore");
const dynamicSymmetryFeedback = document.getElementById("dynamicSymmetryFeedback");
const dynamicAlignmentOnlyToggle = document.getElementById("dynamicAlignmentOnlyToggle");
const dynamicSymmetryTooltip = document.getElementById("dynamicSymmetryTooltip");
const gridControlsCard = document.getElementById("gridControlsCard");
const gridTransferCard = document.getElementById("gridTransferCard");
const gridSize = document.getElementById("gridSize");
const gridSizeValue = document.getElementById("gridSizeValue");
const gridCanvasWidth = document.getElementById("gridCanvasWidth");
const gridCanvasHeight = document.getElementById("gridCanvasHeight");
const gridTransferResult = document.getElementById("gridTransferResult");
const gridOverlayInfo = document.getElementById("gridOverlayInfo");
const downloadCompositionAnalysisButton = document.getElementById("downloadCompositionAnalysisButton");
const spiralScale = document.getElementById("spiralScale");
const spiralScaleValue = document.getElementById("spiralScaleValue");
const spiralResetButton = document.getElementById("spiralResetButton");
const spiralRotateButton = document.getElementById("spiralRotateButton");
const spiralFlipHorizontalButton = document.getElementById("spiralFlipHorizontalButton");
const spiralFlipVerticalButton = document.getElementById("spiralFlipVerticalButton");
const spiralDisplayButtons = Array.from(document.querySelectorAll("[data-spiral-display]"));
const notanLevels = document.getElementById("notanLevels");
const notanLevelsValue = document.getElementById("notanLevelsValue");
const focalSuggestButton = document.getElementById("focalSuggestButton");

const SPIRAL_DEFAULTS = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  flipX: false,
  flipY: false,
  displayMode: "full",
  selected: false,
  interaction: null,
  activeHandle: null,
  dragStartX: 0,
  dragStartY: 0,
  startOffsetX: 0,
  startOffsetY: 0,
  anchorX: 0,
  anchorY: 0,
  suppressClick: false,
  movedDuringPointer: false,
  animationFrame: 0
};

const GOLDEN_RATIO = 1.61803398875;
const SPIRAL_HANDLE_RADIUS = 8;
const SPIRAL_TEMPLATE_WIDTH = 89;
const SPIRAL_TEMPLATE_HEIGHT = 55;
const SPIRAL_TEMPLATE_RATIO = SPIRAL_TEMPLATE_WIDTH / SPIRAL_TEMPLATE_HEIGHT;
const SPIRAL_TEMPLATE_SQUARES = [
  { x: 0, y: 0, size: 55 },
  { x: 55, y: 0, size: 34 },
  { x: 68, y: 34, size: 21 },
  { x: 55, y: 42, size: 13 },
  { x: 55, y: 34, size: 8 },
  { x: 63, y: 34, size: 5 },
  { x: 65, y: 39, size: 3 },
  { x: 63, y: 40, size: 2 },
  { x: 63, y: 39, size: 1 },
  { x: 64, y: 39, size: 1 }
];
const SPIRAL_TEMPLATE_ARCS = [
  { startX: 0, startY: 55, endX: 55, endY: 0, radius: 55 },
  { startX: 55, startY: 0, endX: 89, endY: 34, radius: 34 },
  { startX: 89, startY: 34, endX: 68, endY: 55, radius: 21 },
  { startX: 68, startY: 55, endX: 55, endY: 42, radius: 13 },
  { startX: 55, startY: 42, endX: 63, endY: 34, radius: 8 },
  { startX: 63, startY: 34, endX: 68, endY: 39, radius: 5 },
  { startX: 68, startY: 39, endX: 65, endY: 42, radius: 3 },
  { startX: 65, startY: 42, endX: 63, endY: 40, radius: 2 },
  { startX: 63, startY: 40, endX: 64, endY: 39, radius: 1 },
  { startX: 64, startY: 39, endX: 65, endY: 40, radius: 1 }
];

const GRID_DIVISION_OPTIONS = [2, 4, 6, 8, 10, 12];
const BASIC_OVERLAY_LINE_WIDTH = 1.75;
const DYNAMIC_SYMMETRY_MAX_POINTS = 42;
const DYNAMIC_SYMMETRY_SAMPLE_SIZE = 180;

const OVERLAY_COLOR_CLASSES = ["overlay-color-black", "overlay-color-white", "overlay-color-red"];
const OVERLAY_COLOR_NAMES = {
  "#1f1c18": "overlay-color-black",
  "#ffffff": "overlay-color-white",
  "#c96a3d": "overlay-color-red"
};
const GLOBAL_UNLOCK_STORAGE_KEY = "m8_unlocked";
const GLOBAL_UNLOCK_PAYMENT_LINK = "https://buy.stripe.com/cNi14n0Nhfj5deH2u8gw001";
const GLOBAL_UNLOCK_BODY = "One payment unlocks all M8 Painting Tools. Includes Quick Check, Advanced Composition, Color Mixer, Mix Trainer, and all premium modules. Personal Feedback is separate.";
const LANDING_HANDOFF_IMAGE_KEY = "m8_landing_handoff_image";
const LANDING_HANDOFF_TARGET_KEY = "m8_landing_handoff_target";
const LANDING_HANDOFF_DB = "m8_landing_handoff_db";
const LANDING_HANDOFF_STORE = "uploads";
const LANDING_HANDOFF_RECORD = "latest";

const state = {
  analysisMode: "basic",
  mode: "thirds",
  advancedMode: "golden-ratio",
  imageLoaded: false,
  imageLoading: false,
  loadErrorMessage: "",
  objectUrl: null,
  noteMarkers: [],
  focalPoints: [],
  focalPointSource: "manual",
  gridDivisionIndex: 2,
  gridCanvasWidth: "",
  gridCanvasHeight: "",
  autoDetectedOverlayColor: "#1f1c18",
  userSelectedOverlayColor: null,
  isOverlayColorMenuOpen: false,
  advancedUnlockVisible: false,
  premiumToastTimeout: null,
  notanLevels: 3,
  notanCache: {
    key: null,
    canvas: null
  },
  dynamicSymmetry: {
    showAlignmentsOnly: false,
    analysisKey: null,
    points: [],
    alignedPoints: [],
    score: null,
    feedback: "Upload an image to detect structural alignment.",
    tooltip: null
  },
  thirdsSelection: null,
  spiral: {
    ...SPIRAL_DEFAULTS
  }
};
let imageLoadRequestId = 0;
let feedbackToastTimeoutId = null;

const uploadLoadingOverlay = createUploadLoadingOverlay();
const statusToast = createStatusToast();

resetWorkspaceEmptyState();

const resizeObserver = new ResizeObserver(() => {
  requestOverlayDraw();
});

resizeObserver.observe(canvasWrap);
resizeObserver.observe(compositionStage);
resizeObserver.observe(compositionImage);

fileInput.addEventListener("change", handleUpload);
uploadLabels.forEach((label) => {
  label.addEventListener("click", (event) => {
    if (!requireUnlock("advanced image uploads")) {
      event.preventDefault();
    }
  });
});
clearNotesButton.addEventListener("click", clearNoteMarkers);
canvasWrap.addEventListener("click", handleWorkspaceClick);
canvasWrap.addEventListener("keydown", handleWorkspaceKeydown);
overlayCanvas.addEventListener("click", handleOverlayClick);
window.addEventListener("resize", requestOverlayDraw);
window.addEventListener("orientationchange", requestOverlayDraw);

analysisModeButtons.forEach((button) => {
  button.addEventListener("click", () => setAnalysisMode(button.dataset.analysisMode));
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

advancedModeButtons.forEach((button) => {
  button.addEventListener("click", () => setAdvancedMode(button.dataset.advancedMode));
});

spiralScale.addEventListener("input", handleSpiralScaleInput);
spiralResetButton.addEventListener("click", resetGoldenSpiral);
spiralRotateButton.addEventListener("click", rotateGoldenSpiral);
spiralFlipHorizontalButton.addEventListener("click", toggleSpiralFlipX);
spiralFlipVerticalButton.addEventListener("click", toggleSpiralFlipY);
downloadCompositionAnalysisButton.addEventListener("click", downloadCompositionAnalysis);
spiralDisplayButtons.forEach((button) => {
  button.addEventListener("click", () => setSpiralDisplayMode(button.dataset.spiralDisplay));
});
notanLevels.addEventListener("input", handleNotanLevelsInput);
focalSuggestButton.addEventListener("click", suggestFocalPointsFromContrast);
dynamicAlignmentOnlyToggle.addEventListener("change", handleDynamicAlignmentToggle);
gridSize.addEventListener("input", handleGridSizeInput);
gridCanvasWidth.addEventListener("input", handleGridCanvasInput);
gridCanvasHeight.addEventListener("input", handleGridCanvasInput);
overlayCanvas.addEventListener("pointerdown", handleOverlayPointerDown);
window.addEventListener("pointermove", handleOverlayPointerMove);
window.addEventListener("pointerup", handleOverlayPointerUp);
window.addEventListener("pointercancel", handleOverlayPointerUp);
overlayColorButton.addEventListener("click", toggleOverlayColorMenu);
overlayColorSwatches.forEach((button) => {
  button.addEventListener("click", () => selectOverlayColor(button.dataset.overlayColor));
});
document.addEventListener("click", handleDocumentClick);
advancedUnlockButton?.addEventListener("click", () => {
  window.location.href = GLOBAL_UNLOCK_PAYMENT_LINK;
});

updateModeUI();

function isUnlocked() {
  return localStorage.getItem(GLOBAL_UNLOCK_STORAGE_KEY) === "true";
}

function isAdvancedLocked() {
  return state.analysisMode === "advanced" && !isUnlocked();
}

function hideUnlockPaywall() {
  state.advancedUnlockVisible = false;
  advancedUnlockCard?.classList.add("hidden");
}

function showUnlockPaywall(actionName = "advanced composition tools") {
  state.advancedUnlockVisible = true;
  if (advancedUnlockCopy) {
    advancedUnlockCopy.textContent = GLOBAL_UNLOCK_BODY;
  }
  advancedUnlockCard?.classList.remove("hidden");
  advancedStatusNote.textContent = `Unlock full access to use ${actionName}.`;
  workspaceHint.textContent = "Advanced tools are visible for preview. Real advanced actions unlock with one full-app payment.";
  showPremiumLimitToast(`Advanced action locked. Tap Unlock All Tools to use ${actionName}.`);
}

function requireUnlock(actionName = "advanced composition tools") {
  if (!isAdvancedLocked()) {
    return true;
  }

  showUnlockPaywall(actionName);
  return false;
}

function showPremiumLimitToast(message) {
  if (!premiumToast) {
    return;
  }

  if (state.premiumToastTimeout) {
    window.clearTimeout(state.premiumToastTimeout);
    state.premiumToastTimeout = null;
  }

  premiumToast.textContent = message;
  premiumToast.classList.remove("hidden");

  window.requestAnimationFrame(() => {
    premiumToast.classList.add("is-visible");
  });

  state.premiumToastTimeout = window.setTimeout(() => {
    premiumToast.classList.remove("is-visible");
    state.premiumToastTimeout = window.setTimeout(() => {
      premiumToast.classList.add("hidden");
      state.premiumToastTimeout = null;
    }, 180);
  }, 2000);
}

function handleUpload(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  if (!requireUnlock("advanced image uploads")) {
    event.target.value = "";
    return;
  }

  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
  }

  imageLoadRequestId += 1;
  const requestId = imageLoadRequestId;
  state.objectUrl = URL.createObjectURL(file);
  beginImageLoad();
  compositionImage.onload = null;
  compositionImage.onerror = null;
  compositionImage.onload = () => {
    if (requestId !== imageLoadRequestId) {
      return;
    }

    state.imageLoaded = true;
    state.focalPoints = [];
    state.focalPointSource = "manual";
    state.thirdsSelection = null;
    state.userSelectedOverlayColor = null;
    state.autoDetectedOverlayColor = detectOverlayColor();
    invalidateNotanCache();
    Object.assign(state.spiral, SPIRAL_DEFAULTS);
    closeOverlayColorMenu();
    emptyState.style.display = "none";
    compositionImage.style.display = "block";
    overlayCanvas.style.display = "block";
    setWorkspaceLoadingState(false);
    window.requestAnimationFrame(() => {
      compositionImage.classList.add("is-loaded");
    });
    updateModeUI();
    requestOverlayDraw();
    showStatusToast("Image loaded");
  };
  compositionImage.onerror = () => {
    if (requestId !== imageLoadRequestId) {
      return;
    }
    showWorkspaceLoadError("Couldn't load image. Please try another file.");
  };
  compositionImage.src = state.objectUrl;
}

function loadCompositionFromDataUrl(dataUrl) {
  if (!dataUrl) {
    return;
  }

  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = null;
  }

  setAnalysisMode("basic");
  imageLoadRequestId += 1;
  const requestId = imageLoadRequestId;
  beginImageLoad();
  compositionImage.onload = null;
  compositionImage.onerror = null;
  compositionImage.onload = () => {
    if (requestId !== imageLoadRequestId) {
      return;
    }

    state.imageLoaded = true;
    state.focalPoints = [];
    state.focalPointSource = "manual";
    state.thirdsSelection = null;
    state.userSelectedOverlayColor = null;
    state.autoDetectedOverlayColor = detectOverlayColor();
    invalidateNotanCache();
    Object.assign(state.spiral, SPIRAL_DEFAULTS);
    closeOverlayColorMenu();
    emptyState.style.display = "none";
    compositionImage.style.display = "block";
    overlayCanvas.style.display = "block";
    setWorkspaceLoadingState(false);
    window.requestAnimationFrame(() => {
      compositionImage.classList.add("is-loaded");
    });
    updateModeUI();
    requestOverlayDraw();
    showStatusToast("Image loaded");
  };
  compositionImage.onerror = () => {
    if (requestId !== imageLoadRequestId) {
      return;
    }
    showWorkspaceLoadError("Couldn't load image. Please try another file.");
  };
  compositionImage.src = dataUrl;
}

function openLandingHandoffDb() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(LANDING_HANDOFF_DB, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(LANDING_HANDOFF_STORE)) {
        db.createObjectStore(LANDING_HANDOFF_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open handoff database."));
  });
}

async function consumeIndexedLandingHandoff() {
  const db = await openLandingHandoffDb();

  const record = await new Promise((resolve, reject) => {
    const transaction = db.transaction(LANDING_HANDOFF_STORE, "readonly");
    const store = transaction.objectStore(LANDING_HANDOFF_STORE);
    const request = store.get(LANDING_HANDOFF_RECORD);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("Failed to read handoff record."));
  });

  if (!record || record.target !== "composition" || !record.file) {
    db.close();
    return false;
  }

  await new Promise((resolve, reject) => {
    const transaction = db.transaction(LANDING_HANDOFF_STORE, "readwrite");
    const store = transaction.objectStore(LANDING_HANDOFF_STORE);
    store.delete(LANDING_HANDOFF_RECORD);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Failed to clear handoff record."));
  });

  db.close();
  loadCompositionFromObjectFile(record.file);
  return true;
}

function loadCompositionFromObjectFile(file) {
  if (!file) {
    return;
  }

  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
  }

  setAnalysisMode("basic");
  imageLoadRequestId += 1;
  const requestId = imageLoadRequestId;
  state.objectUrl = URL.createObjectURL(file);
  beginImageLoad();
  compositionImage.onload = null;
  compositionImage.onerror = null;
  compositionImage.onload = () => {
    if (requestId !== imageLoadRequestId) {
      return;
    }

    state.imageLoaded = true;
    state.focalPoints = [];
    state.focalPointSource = "manual";
    state.thirdsSelection = null;
    state.userSelectedOverlayColor = null;
    state.autoDetectedOverlayColor = detectOverlayColor();
    invalidateNotanCache();
    Object.assign(state.spiral, SPIRAL_DEFAULTS);
    closeOverlayColorMenu();
    emptyState.style.display = "none";
    compositionImage.style.display = "block";
    overlayCanvas.style.display = "block";
    setWorkspaceLoadingState(false);
    window.requestAnimationFrame(() => {
      compositionImage.classList.add("is-loaded");
    });
    updateModeUI();
    requestOverlayDraw();
    showStatusToast("Image loaded");
  };
  compositionImage.onerror = () => {
    if (requestId !== imageLoadRequestId) {
      return;
    }
    showWorkspaceLoadError("Couldn't load image. Please try another file.");
  };
  compositionImage.src = state.objectUrl;
}

async function consumeLandingHandoff() {
  try {
    const consumedIndexed = await consumeIndexedLandingHandoff();
    if (consumedIndexed) {
      return;
    }
  } catch (error) {
    // Fall back to session storage below if IndexedDB is unavailable.
  }

  try {
    const target = window.sessionStorage.getItem(LANDING_HANDOFF_TARGET_KEY);
    const imageData = window.sessionStorage.getItem(LANDING_HANDOFF_IMAGE_KEY);

    if (target !== "composition" || !imageData) {
      return;
    }

    window.sessionStorage.removeItem(LANDING_HANDOFF_TARGET_KEY);
    window.sessionStorage.removeItem(LANDING_HANDOFF_IMAGE_KEY);
    loadCompositionFromDataUrl(imageData);
  } catch (error) {
    // Ignore session storage failures and keep the normal upload flow.
  }
}

function handleWorkspaceClick() {
  if (!state.imageLoaded) {
    if (!requireUnlock("advanced image uploads")) {
      return;
    }
    fileInput.click();
  }
}

function handleWorkspaceKeydown(event) {
  if (state.imageLoaded) {
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (!requireUnlock("advanced image uploads")) {
      return;
    }
    fileInput.click();
  }
}

function handleOverlayClick(event) {
  if (isAdvancedLocked()) {
    showUnlockPaywall("advanced overlays");
    return;
  }

  if (state.spiral.suppressClick) {
    state.spiral.suppressClick = false;
    return;
  }

  if (canAnalyzeThirds()) {
    const point = getOverlayPoint(event);
    if (!point) {
      return;
    }

    updateThirdsSelection(point);
    return;
  }

  if (canSnapGoldenSpiral()) {
    const point = getOverlayPoint(event);
    if (!point) {
      return;
    }

    snapGoldenSpiralToPoint(point);
    return;
  }

  if (canInspectDynamicSymmetry()) {
    const point = getOverlayPoint(event);
    if (!point) {
      return;
    }

    inspectDynamicSymmetryPoint(point);
    return;
  }

  if (!canEditFocalBalance()) {
    return;
  }

  const point = getOverlayPoint(event);
  if (!point) {
    return;
  }

  const existingIndex = getFocalPointAtPosition(point);
  if (existingIndex >= 0) {
    state.focalPoints.splice(existingIndex, 1);
    state.focalPointSource = "manual";
  } else if (state.focalPoints.length < 3) {
    const width = Math.max(1, Math.round(compositionImage.clientWidth));
    const height = Math.max(1, Math.round(compositionImage.clientHeight));
    state.focalPoints.push({
      x: point.x / width,
      y: point.y / height
    });
    state.focalPointSource = "manual";
  } else {
    state.focalPoints[state.focalPoints.length - 1] = {
      x: point.x / Math.max(1, Math.round(compositionImage.clientWidth)),
      y: point.y / Math.max(1, Math.round(compositionImage.clientHeight))
    };
    state.focalPointSource = "manual";
  }

  updateModeUI();
  requestOverlayDraw();
}

function toggleOverlayColorMenu(event) {
  if (!requireUnlock("advanced overlay controls")) {
    return;
  }
  event.stopPropagation();
  state.isOverlayColorMenuOpen = !state.isOverlayColorMenuOpen;
  updateOverlayColorUI();
}

function closeOverlayColorMenu() {
  state.isOverlayColorMenuOpen = false;
  updateOverlayColorUI();
}

function selectOverlayColor(color) {
  if (!requireUnlock("advanced overlay controls")) {
    return;
  }
  state.userSelectedOverlayColor = color;
  closeOverlayColorMenu();
  updateModeUI();
  requestOverlayDraw();
}

function handleDocumentClick(event) {
  if (!overlayColorControl.contains(event.target)) {
    closeOverlayColorMenu();
  }
}

function handleOverlayPointerDown(event) {
  if (isAdvancedLocked()) {
    showUnlockPaywall("advanced overlay controls");
    return;
  }
  if (!canDragGoldenSpiral() || !state.imageLoaded) {
    return;
  }

  cancelGoldenSpiralAnimation();

  const point = getOverlayPoint(event);
  if (!point) {
    return;
  }
  const bounds = getGoldenSpiralBounds();
  const handle = getGoldenSpiralHandleAtPoint(point, bounds);

  state.spiral.selected = true;
  state.spiral.movedDuringPointer = false;
  state.spiral.suppressClick = false;

  if (handle) {
    const opposite = getOppositeCornerPoint(handle, bounds);
    state.spiral.interaction = "resize";
    state.spiral.activeHandle = handle;
    state.spiral.anchorX = opposite.x;
    state.spiral.anchorY = opposite.y;
  } else if (isPointInsideBounds(point, bounds)) {
    state.spiral.interaction = "move";
    state.spiral.dragStartX = point.x;
    state.spiral.dragStartY = point.y;
    state.spiral.startOffsetX = state.spiral.offsetX;
    state.spiral.startOffsetY = state.spiral.offsetY;
  } else {
    state.spiral.selected = false;
    state.spiral.interaction = null;
    state.spiral.activeHandle = null;
  }

  if (overlayCanvas.setPointerCapture) {
    overlayCanvas.setPointerCapture(event.pointerId);
  }

  updateModeUI();
}

function handleOverlayPointerMove(event) {
  if (!canDragGoldenSpiral() || !state.imageLoaded) {
    return;
  }

  const point = getOverlayPoint(event);
  if (!point) {
    return;
  }

  if (state.spiral.interaction === "move") {
    const width = Math.max(1, Math.round(compositionImage.clientWidth));
    const height = Math.max(1, Math.round(compositionImage.clientHeight));
    const maxOffsetX = width * 0.45;
    const maxOffsetY = height * 0.45;

    state.spiral.offsetX = clamp(
      state.spiral.startOffsetX + (point.x - state.spiral.dragStartX),
      -maxOffsetX,
      maxOffsetX
    );
    state.spiral.offsetY = clamp(
      state.spiral.startOffsetY + (point.y - state.spiral.dragStartY),
      -maxOffsetY,
      maxOffsetY
    );
    state.spiral.movedDuringPointer = state.spiral.movedDuringPointer
      || Math.hypot(point.x - state.spiral.dragStartX, point.y - state.spiral.dragStartY) > 3;
    requestOverlayDraw();
    return;
  }

  if (state.spiral.interaction === "resize") {
    resizeGoldenSpiralFromHandle(point);
    state.spiral.movedDuringPointer = state.spiral.movedDuringPointer
      || Math.hypot(point.x - state.spiral.dragStartX, point.y - state.spiral.dragStartY) > 3;
    requestOverlayDraw();
    return;
  }

  updateGoldenSpiralCursor(point);
}

function handleOverlayPointerUp(event) {
  if (!state.spiral.interaction) {
    return;
  }

  state.spiral.suppressClick = state.spiral.movedDuringPointer;

  state.spiral.interaction = null;
  state.spiral.activeHandle = null;
  state.spiral.movedDuringPointer = false;

  if (overlayCanvas.releasePointerCapture) {
    try {
      overlayCanvas.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Ignore pointer capture release failures.
    }
  }

  updateModeUI();
}

function clearNoteMarkers() {
  if (canEditFocalBalance()) {
    state.focalPoints = [];
    state.focalPointSource = "manual";
  } else {
    state.noteMarkers = [];
  }
  clearNotesButton.disabled = true;
  updateModeUI();
  requestOverlayDraw();
}

function toggleSpiralFlipX() {
  if (!requireUnlock("advanced spiral controls")) {
    return;
  }
  cancelGoldenSpiralAnimation();
  state.spiral.flipX = !state.spiral.flipX;
  updateModeUI();
  requestOverlayDraw();
}

function rotateGoldenSpiral() {
  if (!requireUnlock("advanced spiral controls")) {
    return;
  }
  cancelGoldenSpiralAnimation();
  state.spiral.rotation = (state.spiral.rotation + 90) % 360;
  state.spiral.selected = true;
  updateModeUI();
  requestOverlayDraw();
}

function toggleSpiralFlipY() {
  if (!requireUnlock("advanced spiral controls")) {
    return;
  }
  cancelGoldenSpiralAnimation();
  state.spiral.flipY = !state.spiral.flipY;
  updateModeUI();
  requestOverlayDraw();
}

function setSpiralDisplayMode(displayMode) {
  if (!requireUnlock("advanced spiral controls")) {
    return;
  }
  cancelGoldenSpiralAnimation();
  state.spiral.displayMode = displayMode;
  updateModeUI();
  requestOverlayDraw();
}

function handleSpiralScaleInput(event) {
  if (!requireUnlock("advanced spiral controls")) {
    event.target.value = String(Math.round(state.spiral.scale * 100));
    return;
  }
  cancelGoldenSpiralAnimation();
  state.spiral.scale = Number(event.target.value) / 100;
  state.spiral.selected = true;
  updateModeUI();
  requestOverlayDraw();
}

function resetGoldenSpiral() {
  if (!requireUnlock("advanced spiral controls")) {
    return;
  }
  cancelGoldenSpiralAnimation();
  Object.assign(state.spiral, SPIRAL_DEFAULTS);
  state.spiral.selected = true;
  updateModeUI();
  requestOverlayDraw();
}

function setAnalysisMode(mode) {
  state.analysisMode = mode;
  if (mode === "basic" || isUnlocked()) {
    hideUnlockPaywall();
  }
  updateModeUI();
  requestOverlayDraw();
}

function setMode(mode) {
  state.mode = mode;
  updateModeUI();
  requestOverlayDraw();
}

function setAdvancedMode(mode) {
  if (mode !== "golden-spiral") {
    cancelGoldenSpiralAnimation();
  }

  state.advancedMode = mode;
  if (mode !== "golden-spiral") {
    state.spiral.interaction = null;
    state.spiral.activeHandle = null;
    state.spiral.selected = false;
  } else if (state.imageLoaded) {
    state.spiral.selected = true;
  }
  if (isUnlocked()) {
    hideUnlockPaywall();
  }
  updateModeUI();
  requestOverlayDraw();
}

function getGridDivisions() {
  return GRID_DIVISION_OPTIONS[state.gridDivisionIndex] ?? 6;
}

function getThirdsPowerPoints() {
  return [
    { x: 1 / 3, y: 1 / 3 },
    { x: 2 / 3, y: 1 / 3 },
    { x: 1 / 3, y: 2 / 3 },
    { x: 2 / 3, y: 2 / 3 }
  ];
}

function canAnalyzeThirds() {
  return state.imageLoaded && state.analysisMode === "basic" && state.mode === "thirds";
}

function updateThirdsSelection(point) {
  const width = Math.max(1, Math.round(compositionImage.clientWidth));
  const height = Math.max(1, Math.round(compositionImage.clientHeight));
  const normalizedPoint = {
    x: clamp(point.x / width, 0, 1),
    y: clamp(point.y / height, 0, 1)
  };
  const nearestPowerPoint = getNearestThirdsPowerPoint(normalizedPoint);
  const distance = Math.hypot(
    normalizedPoint.x - nearestPowerPoint.x,
    normalizedPoint.y - nearestPowerPoint.y
  );
  const centerDistance = Math.hypot(normalizedPoint.x - 0.5, normalizedPoint.y - 0.5);

  state.thirdsSelection = {
    point: normalizedPoint,
    nearestPowerPoint,
    distance,
    centerDistance
  };

  updateModeUI();
  requestOverlayDraw();
}

function getNearestThirdsPowerPoint(point) {
  const points = getThirdsPowerPoints();
  let nearestPoint = points[0];
  let nearestDistance = Number.POSITIVE_INFINITY;

  points.forEach((candidate) => {
    const distance = Math.hypot(point.x - candidate.x, point.y - candidate.y);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestPoint = candidate;
    }
  });

  return nearestPoint;
}

function getThirdsStatusCopy() {
  if (!state.thirdsSelection) {
    return "Overlay is active. Click the image to test how close a placement sits to a power point.";
  }

  const distanceMessage = getThirdsDistanceMessage(state.thirdsSelection.distance);
  return state.thirdsSelection.centerDistance <= 0.09
    ? `${distanceMessage} Center-dominant placement may feel more static.`
    : distanceMessage;
}

function getThirdsDistanceMessage(distance) {
  if (distance <= 0.075) {
    return "Strong placement near a power point.";
  }

  if (distance <= 0.18) {
    return "Close to a strong compositional zone.";
  }

  return "Far from the nearest power point.";
}

function formatGridMeasurement(value) {
  if (!Number.isFinite(value)) {
    return "";
  }

  return value.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function updateGridOverlayInfo() {
  gridOverlayInfo.textContent = `Grid: ${getGridDivisions()} x ${getGridDivisions()}`;
}

function updateGridTransferUI() {
  updateGridOverlayInfo();

  const width = Number(state.gridCanvasWidth);
  const height = Number(state.gridCanvasHeight);

  if (!(width > 0) || !(height > 0)) {
    gridTransferResult.textContent = "Enter your canvas size to calculate each square.";
    return;
  }

  const divisions = getGridDivisions();
  const cellWidth = width / divisions;
  const cellHeight = height / divisions;
  gridTransferResult.textContent = `Each square: ${formatGridMeasurement(cellWidth)} x ${formatGridMeasurement(cellHeight)} cm`;
}

function handleGridSizeInput(event) {
  state.gridDivisionIndex = Number(event.target.value);
  updateModeUI();
  requestOverlayDraw();
}

function handleGridCanvasInput() {
  state.gridCanvasWidth = gridCanvasWidth.value;
  state.gridCanvasHeight = gridCanvasHeight.value;
  updateGridTransferUI();
}

function updateModeUI() {
  const isBasic = state.analysisMode === "basic";
  const advancedLocked = !isBasic && !isUnlocked();
  const config = MODES[state.mode];
  const advancedConfig = ADVANCED_MODES[state.advancedMode];
  const isThirdsMode = isBasic && state.mode === "thirds";
  const isGridMode = isBasic && state.mode === "grid";
  const isGoldenSpiral = !isBasic && state.advancedMode === "golden-spiral";
  const isNotan = !isBasic && state.advancedMode === "notan";
  const isFocalBalance = !isBasic && state.advancedMode === "focal-balance";
  const isDynamicSymmetry = !isBasic && state.advancedMode === "dynamic-symmetry";

  basicToolSwitcher.classList.toggle("hidden", !isBasic);
  advancedToolSwitcher.classList.toggle("hidden", isBasic);
  basicAnalysisPanel.classList.toggle("hidden", !isBasic);
  advancedAnalysisPanel.classList.toggle("hidden", isBasic);
  spiralControlsCard.classList.toggle("hidden", !isGoldenSpiral);
  notanControlsCard.classList.toggle("hidden", !isNotan);
  focalControlsCard.classList.toggle("hidden", !isFocalBalance);
  dynamicSymmetryControlsCard.classList.toggle("hidden", !isDynamicSymmetry);
  gridControlsCard.classList.toggle("hidden", !isGridMode);
  gridTransferCard.classList.toggle("hidden", !isGridMode);
  gridOverlayInfo.classList.toggle("hidden", !isGridMode || !state.imageLoaded);
  overlayColorControl.classList.toggle("hidden", isNotan);
  overlayCanvas.style.display = state.imageLoaded ? "block" : "none";
  clearNotesButton.classList.toggle("hidden", !isFocalBalance);
  clearNotesButton.disabled = !isFocalBalance || state.focalPoints.length === 0;
  clearNotesButton.textContent = "Reset Focal Points";
  focalSuggestButton.disabled = !isFocalBalance || !state.imageLoaded;
  dynamicAlignmentOnlyToggle.checked = state.dynamicSymmetry.showAlignmentsOnly;
  dynamicAlignmentOnlyToggle.disabled = !isDynamicSymmetry || !state.imageLoaded;
  updateDynamicSymmetryReadout();
  advancedUnlockCard?.classList.toggle("hidden", isBasic || isUnlocked() || !state.advancedUnlockVisible);

  if (isBasic) {
    workspaceTitle.textContent = config.title;
    analysisTitle.textContent = config.title;
    modeDescription.textContent = config.description;
    modeTip.textContent = config.tip;
    workspaceHint.textContent = state.imageLoading
      ? "Preparing analysis..."
      : state.loadErrorMessage || (state.imageLoaded
      ? (isThirdsMode
        ? "Click on the image to compare a placement with the nearest power point."
        : "Use the active overlay to study the structure of the composition.")
      : "Upload an image to begin your composition study.");
    statusNote.textContent = state.imageLoading
      ? "Preparing analysis..."
      : state.loadErrorMessage || (state.imageLoaded
      ? (isThirdsMode
        ? getThirdsStatusCopy()
        : isGridMode
        ? "Grid is active. Adjust the divisions and use the transfer helper below to match your canvas."
        : "Overlay is active. Switch tools to compare different compositional guides.")
      : "Upload an image to start.");
  } else {
    workspaceTitle.textContent = advancedConfig.title;
    analysisTitle.textContent = advancedConfig.title;
    workspaceHint.textContent = state.imageLoading
      ? "Preparing analysis..."
      : state.loadErrorMessage || (advancedLocked
      ? (state.imageLoaded
        ? "Preview the advanced layout here. Unlock full access to use overlays, controls, and export."
        : "Preview the advanced layout here. Unlock full access to upload and use advanced composition tools.")
      : (state.imageLoaded
        ? "Study the image with the selected advanced composition guide."
        : "Upload an image to begin your composition study."));
    advancedModeDescription.textContent = advancedConfig.description;
    advancedModeTip.textContent = advancedConfig.tip;
    advancedStatusNote.textContent = state.imageLoading
      ? "Preparing analysis..."
      : state.loadErrorMessage || (advancedLocked
      ? "Advanced tools are visible for preview. Unlock full access when you're ready to use overlays, controls, and export."
      : (state.imageLoaded
        ? getAdvancedStatusCopy(advancedConfig.status)
        : advancedConfig.status));
  }

  overlayCanvas.classList.toggle("notes-mode", isGoldenSpiral && state.imageLoaded);
  overlayCanvas.style.cursor = getOverlayCursor(isGoldenSpiral, isFocalBalance, isThirdsMode, isDynamicSymmetry);
  downloadCompositionAnalysisButton.disabled = !state.imageLoaded;

  spiralScale.value = String(Math.round(state.spiral.scale * 100));
  spiralScaleValue.textContent = `${Math.round(state.spiral.scale * 100)}%`;
  spiralScale.disabled = !isGoldenSpiral;
  spiralResetButton.disabled = !isGoldenSpiral;
  spiralRotateButton.classList.toggle("active", isGoldenSpiral && state.spiral.rotation !== 0);
  spiralRotateButton.setAttribute("aria-pressed", String(isGoldenSpiral && state.spiral.rotation !== 0));
  spiralRotateButton.textContent = isGoldenSpiral
    ? `Rotate ${state.spiral.rotation}\u00b0`
    : "Rotate 90\u00b0";
  spiralRotateButton.disabled = !isGoldenSpiral;
  spiralFlipHorizontalButton.classList.toggle("active", isGoldenSpiral && state.spiral.flipX);
  spiralFlipVerticalButton.classList.toggle("active", isGoldenSpiral && state.spiral.flipY);
  spiralFlipHorizontalButton.setAttribute("aria-pressed", String(isGoldenSpiral && state.spiral.flipX));
  spiralFlipVerticalButton.setAttribute("aria-pressed", String(isGoldenSpiral && state.spiral.flipY));
  spiralFlipHorizontalButton.disabled = !isGoldenSpiral;
  spiralFlipVerticalButton.disabled = !isGoldenSpiral;
  spiralDisplayButtons.forEach((button) => {
    const isActiveDisplay = isGoldenSpiral && button.dataset.spiralDisplay === state.spiral.displayMode;
    button.classList.toggle("active", isActiveDisplay);
    button.setAttribute("aria-pressed", String(isActiveDisplay));
    button.disabled = !isGoldenSpiral;
  });
  notanLevels.value = String(state.notanLevels);
  notanLevelsValue.textContent = `${state.notanLevels} values`;
  notanLevels.disabled = !isNotan;
  gridSize.value = String(state.gridDivisionIndex);
  gridSize.disabled = !isGridMode;
  gridCanvasWidth.disabled = !isGridMode;
  gridCanvasHeight.disabled = !isGridMode;
  gridCanvasWidth.value = state.gridCanvasWidth;
  gridCanvasHeight.value = state.gridCanvasHeight;
  gridSizeValue.textContent = `Grid: ${getGridDivisions()} x ${getGridDivisions()}`;
  updateGridTransferUI();
  updateOverlayColorUI();

  modeButtons.forEach((button) => {
    button.classList.toggle("active", isBasic && button.dataset.mode === state.mode);
    button.setAttribute("aria-selected", String(button.dataset.mode === state.mode));
  });

  analysisModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.analysisMode === state.analysisMode);
    button.setAttribute("aria-selected", String(button.dataset.analysisMode === state.analysisMode));
  });

  advancedModeButtons.forEach((button) => {
    button.classList.toggle("active", !isBasic && button.dataset.advancedMode === state.advancedMode);
    button.setAttribute("aria-selected", String(button.dataset.advancedMode === state.advancedMode));
  });
}

function beginImageLoad() {
  state.imageLoaded = false;
  state.imageLoading = true;
  state.loadErrorMessage = "";
  state.dynamicSymmetry.analysisKey = null;
  state.dynamicSymmetry.points = [];
  state.dynamicSymmetry.alignedPoints = [];
  state.dynamicSymmetry.score = null;
  state.dynamicSymmetry.feedback = "Upload an image to detect structural alignment.";
  state.dynamicSymmetry.tooltip = null;
  compositionImage.classList.remove("is-loaded");
  compositionImage.style.display = "none";
  overlayCanvas.style.display = "none";
  resetWorkspaceEmptyState();
  emptyState.style.display = "none";
  setWorkspaceLoadingState(true, "Loading image...", "Preparing analysis...");
  workspaceHint.textContent = "Preparing analysis...";
  statusNote.textContent = "Preparing analysis...";
  advancedStatusNote.textContent = "Preparing analysis...";
  updateModeUI();
}

function resetWorkspaceEmptyState() {
  if (emptyStateLabel) {
    emptyStateLabel.textContent = "Click to upload your image";
  }
  emptyState.style.display = "grid";
  canvasWrap.classList.remove("has-load-error");
}

function showWorkspaceLoadError(message) {
  state.imageLoaded = false;
  state.imageLoading = false;
  state.loadErrorMessage = message;
  compositionImage.removeAttribute("src");
  compositionImage.classList.remove("is-loaded");
  compositionImage.style.display = "none";
  overlayCanvas.style.display = "none";
  emptyState.style.display = "grid";
  if (emptyStateLabel) {
    emptyStateLabel.textContent = message;
  }
  setWorkspaceLoadingState(false);
  canvasWrap.classList.add("has-load-error");
  updateModeUI();
}

function getWorkspaceHint() {
  return "Use the active overlay to study the structure of the composition.";
}

function getStatusCopy() {
  return "Overlay is active. Switch modes to compare different compositional guides.";
}

function getAdvancedStatusCopy(defaultStatus) {
  if (state.advancedMode !== "focal-balance") {
    return defaultStatus;
  }

  if (!state.focalPoints.length) {
    return "Click on the image to place your primary, secondary, and tertiary focal points, or use Suggest by Contrast to generate a starting hierarchy.";
  }

  const sourceLabel = state.focalPointSource === "auto" ? "Auto suggestion active." : "Focal hierarchy active.";
  return `${sourceLabel} ${state.focalPoints.length}/3 points placed. Click a point to remove it or reset to start again.`;
}

function getOverlayCursor(isGoldenSpiral, isFocalBalance, isThirdsMode, isDynamicSymmetry) {
  if (isAdvancedLocked()) {
    return "default";
  }

  if (isGoldenSpiral && state.imageLoaded) {
    return getGoldenSpiralCursor();
  }

  if (isFocalBalance && state.imageLoaded) {
    return "crosshair";
  }

  if (isThirdsMode && state.imageLoaded) {
    return "crosshair";
  }

  if (isDynamicSymmetry && state.imageLoaded) {
    return "crosshair";
  }

  return "default";
}

function canEditFocalBalance() {
  return state.imageLoaded && state.analysisMode === "advanced" && state.advancedMode === "focal-balance" && !isAdvancedLocked();
}

function getFocalPointAtPosition(point) {
  if (!canEditFocalBalance()) {
    return -1;
  }

  const width = Math.max(1, Math.round(compositionImage.clientWidth));
  const height = Math.max(1, Math.round(compositionImage.clientHeight));

  return state.focalPoints.findIndex((focalPoint, index) => {
    const markerX = focalPoint.x * width;
    const markerY = focalPoint.y * height;
    const hitRadius = [22, 20, 18][index] || 18;
    return Math.hypot(point.x - markerX, point.y - markerY) <= hitRadius;
  });
}

function canSnapGoldenSpiral() {
  return state.imageLoaded
    && state.analysisMode === "advanced"
    && state.advancedMode === "golden-spiral"
    && !state.spiral.interaction
    && !isAdvancedLocked();
}

function cancelGoldenSpiralAnimation() {
  if (state.spiral.animationFrame) {
    window.cancelAnimationFrame(state.spiral.animationFrame);
    state.spiral.animationFrame = 0;
  }
}

function snapGoldenSpiralToPoint(point) {
  cancelGoldenSpiralAnimation();

  const width = Math.max(1, Math.round(compositionImage.clientWidth));
  const height = Math.max(1, Math.round(compositionImage.clientHeight));
  const targetOffsets = getGoldenSpiralTargetOffsets(point, width, height);
  const startOffsetX = state.spiral.offsetX;
  const startOffsetY = state.spiral.offsetY;
  const duration = 220;
  const startTime = performance.now();

  state.spiral.selected = true;

  const animate = (timestamp) => {
    const progress = clamp((timestamp - startTime) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    state.spiral.offsetX = startOffsetX + (targetOffsets.offsetX - startOffsetX) * eased;
    state.spiral.offsetY = startOffsetY + (targetOffsets.offsetY - startOffsetY) * eased;
    requestOverlayDraw();

    if (progress < 1) {
      state.spiral.animationFrame = window.requestAnimationFrame(animate);
      return;
    }

    state.spiral.offsetX = targetOffsets.offsetX;
    state.spiral.offsetY = targetOffsets.offsetY;
    state.spiral.animationFrame = 0;
    requestOverlayDraw();
  };

  state.spiral.animationFrame = window.requestAnimationFrame(animate);
}

function getGoldenSpiralTargetOffsets(point, width, height) {
  const bounds = getGoldenSpiralBounds(width, height);
  const centerX = clamp(point.x, bounds.width / 2, width - bounds.width / 2);
  const centerY = clamp(point.y, bounds.height / 2, height - bounds.height / 2);

  return {
    offsetX: centerX - width / 2,
    offsetY: centerY - height / 2
  };
}

function suggestFocalPointsFromContrast() {
  if (!requireUnlock("advanced focal suggestions")) {
    return;
  }
  if (!canEditFocalBalance()) {
    return;
  }

  const suggestedPoints = getContrastBasedFocalPoints();
  if (!suggestedPoints.length) {
    return;
  }

  state.focalPoints = suggestedPoints;
  state.focalPointSource = "auto";
  updateModeUI();
  requestOverlayDraw();
}

function getContrastBasedFocalPoints() {
  const width = compositionImage.naturalWidth;
  const height = compositionImage.naturalHeight;

  if (!width || !height) {
    return [];
  }

  const sampleMax = 120;
  const sampleScale = Math.min(1, sampleMax / Math.max(width, height));
  const sampleWidth = Math.max(48, Math.round(width * sampleScale));
  const sampleHeight = Math.max(48, Math.round(height * sampleScale));
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = sampleWidth;
  sampleCanvas.height = sampleHeight;
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });

  if (!sampleContext) {
    return [];
  }

  sampleContext.drawImage(compositionImage, 0, 0, sampleWidth, sampleHeight);
  const imageData = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight);
  const { data } = imageData;
  const luminance = new Float32Array(sampleWidth * sampleHeight);

  for (let index = 0, pixel = 0; index < data.length; index += 4, pixel += 1) {
    luminance[pixel] = (0.2126 * data[index]) + (0.7152 * data[index + 1]) + (0.0722 * data[index + 2]);
  }

  const scores = [];
  for (let y = 1; y < sampleHeight - 1; y += 1) {
    for (let x = 1; x < sampleWidth - 1; x += 1) {
      const center = y * sampleWidth + x;
      const gx =
        -luminance[center - sampleWidth - 1] + luminance[center - sampleWidth + 1] +
        (-2 * luminance[center - 1]) + (2 * luminance[center + 1]) +
        -luminance[center + sampleWidth - 1] + luminance[center + sampleWidth + 1];
      const gy =
        -luminance[center - sampleWidth - 1] - (2 * luminance[center - sampleWidth]) - luminance[center - sampleWidth + 1] +
        luminance[center + sampleWidth - 1] + (2 * luminance[center + sampleWidth]) + luminance[center + sampleWidth + 1];
      const gradient = Math.hypot(gx, gy);
      const centerWeightX = 1 - Math.abs((x / (sampleWidth - 1)) - 0.5) * 0.55;
      const centerWeightY = 1 - Math.abs((y / (sampleHeight - 1)) - 0.5) * 0.4;

      scores.push({
        x,
        y,
        score: gradient * centerWeightX * centerWeightY
      });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  const chosen = [];
  const minDistance = Math.max(10, Math.round(Math.min(sampleWidth, sampleHeight) * 0.18));

  for (const candidate of scores) {
    const tooClose = chosen.some((point) => Math.hypot(point.x - candidate.x, point.y - candidate.y) < minDistance);
    if (tooClose) {
      continue;
    }

    chosen.push(candidate);
    if (chosen.length === 3) {
      break;
    }
  }

  return chosen.map((point) => ({
    x: point.x / sampleWidth,
    y: point.y / sampleHeight
  }));
}

function drawOverlay() {
  const ctx = overlayCanvas.getContext("2d");

  if (!state.imageLoaded) {
    overlayCanvas.style.display = "none";
    return;
  }

  const width = Math.max(1, Math.round(compositionImage.clientWidth));
  const height = Math.max(1, Math.round(compositionImage.clientHeight));
  const dpr = window.devicePixelRatio || 1;

  overlayCanvas.width = width * dpr;
  overlayCanvas.height = height * dpr;
  overlayCanvas.style.display = "block";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  if (isAdvancedLocked()) {
    return;
  }
  drawCompositionOverlay(ctx, width, height);
  if (canInspectDynamicSymmetry() && state.dynamicSymmetry.alignedPoints.length) {
    window.requestAnimationFrame(drawOverlay);
  }
}

function drawCompositionOverlay(ctx, width, height, options = {}) {
  if (state.analysisMode === "advanced" && state.advancedMode === "notan") {
    drawNotanOverlay(ctx, width, height);
    return;
  }

  const overlayPalette = getOverlayPalette();
  ctx.strokeStyle = overlayPalette.stroke;
  ctx.fillStyle = overlayPalette.fill;
  const drawOptions = {
    includeSelection: options.includeSelection ?? true,
    spiralState: options.spiralState ?? state.spiral,
    basicLineWidth: options.basicLineWidth ?? BASIC_OVERLAY_LINE_WIDTH
  };

  if (state.analysisMode === "basic") {
    if (state.mode === "thirds") {
      drawThirds(ctx, width, height, overlayPalette, drawOptions.basicLineWidth);
    } else if (state.mode === "grid") {
      drawGrid(ctx, width, height, overlayPalette, drawOptions.basicLineWidth);
    } else if (state.mode === "center") {
      drawCenterLines(ctx, width, height, overlayPalette, drawOptions.basicLineWidth);
    } else if (state.mode === "diagonal") {
      drawDiagonals(ctx, width, height, overlayPalette, drawOptions.basicLineWidth);
    }
  } else {
    if (state.advancedMode === "golden-ratio") {
      drawGoldenRatio(ctx, width, height, overlayPalette);
    } else if (state.advancedMode === "golden-spiral") {
      drawGoldenSpiral(ctx, width, height, overlayPalette, drawOptions);
    } else if (state.advancedMode === "dynamic-symmetry") {
      if (!state.dynamicSymmetry.showAlignmentsOnly) {
        drawDynamicSymmetry(ctx, width, height, overlayPalette);
      }
      drawDynamicSymmetryHighlights(ctx, width, height, overlayPalette);
    } else if (state.advancedMode === "focal-balance") {
      drawFocalBalance(ctx, width, height, overlayPalette);
    }
  }
}

function drawThirds(ctx, width, height, overlayPalette, lineWidth = BASIC_OVERLAY_LINE_WIDTH) {
  const firstThirdX = width * 0.33333;
  const secondThirdX = width * 0.66666;
  const firstThirdY = height * 0.33333;
  const secondThirdY = height * 0.66666;

  ctx.strokeStyle = overlayPalette.stroke;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(firstThirdX, 0);
  ctx.lineTo(firstThirdX, height);
  ctx.moveTo(secondThirdX, 0);
  ctx.lineTo(secondThirdX, height);
  ctx.moveTo(0, firstThirdY);
  ctx.lineTo(width, firstThirdY);
  ctx.moveTo(0, secondThirdY);
  ctx.lineTo(width, secondThirdY);
  ctx.stroke();

  drawThirdsPowerPointEmphasis(ctx, width, height, overlayPalette);
  drawThirdsSelection(ctx, width, height, overlayPalette);
}

function drawThirdsPowerPointEmphasis(ctx, width, height, overlayPalette) {
  const glowRadius = Math.max(18, Math.min(width, height) * 0.055);
  const ringRadius = glowRadius * 0.42;

  ctx.save();
  getThirdsPowerPoints().forEach((point) => {
    const x = point.x * width;
    const y = point.y * height;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    gradient.addColorStop(0, overlayPalette.fillSoft);
    gradient.addColorStop(0.55, overlayPalette.fillVerySoft);
    gradient.addColorStop(1, toOverlayAlphaColor(getActiveOverlayColor(), 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = overlayPalette.strokeSoft;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}

function drawThirdsSelection(ctx, width, height, overlayPalette) {
  if (!state.thirdsSelection) {
    return;
  }

  const point = {
    x: state.thirdsSelection.point.x * width,
    y: state.thirdsSelection.point.y * height
  };
  const nearestPowerPoint = {
    x: state.thirdsSelection.nearestPowerPoint.x * width,
    y: state.thirdsSelection.nearestPowerPoint.y * height
  };
  const markerRadius = Math.max(5, Math.min(width, height) * 0.01);
  const targetRadius = markerRadius + 2;

  ctx.save();
  ctx.strokeStyle = overlayPalette.strokeMuted;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(nearestPowerPoint.x, nearestPowerPoint.y);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  ctx.arc(point.x, point.y, markerRadius + 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = overlayPalette.strokeStrong;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(point.x, point.y, markerRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = overlayPalette.fillSoft;
  ctx.beginPath();
  ctx.arc(nearestPowerPoint.x, nearestPowerPoint.y, targetRadius + 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = overlayPalette.strokeStrong;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(nearestPowerPoint.x, nearestPowerPoint.y, targetRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(nearestPowerPoint.x - targetRadius - 3, nearestPowerPoint.y);
  ctx.lineTo(nearestPowerPoint.x + targetRadius + 3, nearestPowerPoint.y);
  ctx.moveTo(nearestPowerPoint.x, nearestPowerPoint.y - targetRadius - 3);
  ctx.lineTo(nearestPowerPoint.x, nearestPowerPoint.y + targetRadius + 3);
  ctx.stroke();
  ctx.restore();
}

function drawGrid(ctx, width, height, overlayPalette, lineWidth = BASIC_OVERLAY_LINE_WIDTH) {
  const columns = getGridDivisions();
  const rows = getGridDivisions();
  ctx.strokeStyle = overlayPalette.stroke;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  for (let index = 1; index < columns; index += 1) {
    const x = (width / columns) * index;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  for (let index = 1; index < rows; index += 1) {
    const y = (height / rows) * index;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  ctx.stroke();
}

function drawCenterLines(ctx, width, height, overlayPalette, lineWidth = BASIC_OVERLAY_LINE_WIDTH) {
  ctx.strokeStyle = overlayPalette.stroke;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
}

function drawDiagonals(ctx, width, height, overlayPalette, lineWidth = BASIC_OVERLAY_LINE_WIDTH) {
  ctx.strokeStyle = overlayPalette.stroke;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, height);
  ctx.moveTo(width, 0);
  ctx.lineTo(0, height);
  ctx.stroke();
}

function drawGoldenRatio(ctx, width, height, overlayPalette) {
  const goldenMinor = 0.38196601125;
  const goldenMajor = 0.61803398875;
  const verticalA = width * goldenMinor;
  const verticalB = width * goldenMajor;
  const horizontalA = height * goldenMinor;
  const horizontalB = height * goldenMajor;

  ctx.save();
  ctx.strokeStyle = overlayPalette.strokeStrong;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(verticalA, 0);
  ctx.lineTo(verticalA, height);
  ctx.moveTo(verticalB, 0);
  ctx.lineTo(verticalB, height);
  ctx.moveTo(0, horizontalA);
  ctx.lineTo(width, horizontalA);
  ctx.moveTo(0, horizontalB);
  ctx.lineTo(width, horizontalB);
  ctx.stroke();

  const points = [
    [verticalA, horizontalA],
    [verticalA, horizontalB],
    [verticalB, horizontalA],
    [verticalB, horizontalB]
  ];
  ctx.fillStyle = overlayPalette.fillSoft;
  points.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawGoldenSpiral(ctx, width, height, overlayPalette, options = {}) {
  const spiralState = options.spiralState ?? state.spiral;
  const includeSelection = options.includeSelection ?? true;
  const bounds = getGoldenSpiralBounds(width, height, spiralState);
  const spiralTemplate = getGoldenSpiralTemplate(bounds.drawWidth, bounds.drawHeight);
  const showSpiral = state.spiral.displayMode !== "rectangles";
  const showRectangles = state.spiral.displayMode !== "spiral";

  ctx.save();
  ctx.translate(bounds.centerX, bounds.centerY);
  ctx.rotate((spiralState.rotation * Math.PI) / 180);
  ctx.scale(spiralState.flipX ? -1 : 1, spiralState.flipY ? -1 : 1);
  ctx.translate(-bounds.drawWidth / 2, -bounds.drawHeight / 2);

  if (showRectangles) {
    drawGoldenConstruction(ctx, bounds.drawWidth, bounds.drawHeight, spiralTemplate.squares, overlayPalette);
  }

  if (showSpiral) {
    drawGoldenSpiralCurve(ctx, spiralTemplate.arcs, overlayPalette);
  }
  ctx.restore();

  if (includeSelection && spiralState.selected) {
    drawGoldenSpiralSelection(ctx, bounds, overlayPalette);
  }
}

function drawDynamicSymmetry(ctx, width, height, overlayPalette) {
  const reciprocalA = {
    x1: 0,
    y1: height,
    x2: width,
    y2: 0
  };
  const reciprocalB = {
    x1: 0,
    y1: 0,
    x2: width,
    y2: height
  };
  const quarterX = width * 0.25;
  const threeQuarterX = width * 0.75;

  ctx.save();
  ctx.strokeStyle = overlayPalette.stroke;
  ctx.lineWidth = 1.35;
  ctx.beginPath();
  ctx.moveTo(reciprocalA.x1, reciprocalA.y1);
  ctx.lineTo(reciprocalA.x2, reciprocalA.y2);
  ctx.moveTo(reciprocalB.x1, reciprocalB.y1);
  ctx.lineTo(reciprocalB.x2, reciprocalB.y2);
  ctx.moveTo(0, height);
  ctx.lineTo(quarterX, 0);
  ctx.moveTo(width, height);
  ctx.lineTo(threeQuarterX, 0);
  ctx.moveTo(0, 0);
  ctx.lineTo(quarterX, height);
  ctx.moveTo(width, 0);
  ctx.lineTo(threeQuarterX, height);
  ctx.stroke();
  ctx.restore();
}

function drawDynamicSymmetryHighlights(ctx, width, height, overlayPalette) {
  const analysis = getDynamicSymmetryAnalysis(width, height);
  const pulse = 0.72 + Math.sin(Date.now() / 360) * 0.18;

  ctx.save();
  analysis.alignedPoints.forEach((point) => {
    const x = point.x * width;
    const y = point.y * height;
    const glowRadius = Math.max(12, Math.min(width, height) * 0.025) * pulse;
    const coreRadius = Math.max(3.5, Math.min(width, height) * 0.006);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    gradient.addColorStop(0, overlayPalette.fillSoft);
    gradient.addColorStop(0.55, overlayPalette.fillVerySoft);
    gradient.addColorStop(1, toOverlayAlphaColor(getActiveOverlayColor(), 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.arc(x, y, coreRadius + 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = overlayPalette.strokeStrong;
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.arc(x, y, coreRadius, 0, Math.PI * 2);
    ctx.stroke();
  });

  if (state.dynamicSymmetry.tooltip) {
    drawDynamicSymmetryTooltip(ctx, width, height, overlayPalette);
  }
  ctx.restore();
}

function drawDynamicSymmetryTooltip(ctx, width, height, overlayPalette) {
  const tooltip = state.dynamicSymmetry.tooltip;
  const x = tooltip.x * width;
  const y = tooltip.y * height;
  const text = tooltip.message;
  const paddingX = 10;
  const boxHeight = 34;
  ctx.font = "700 12px Segoe UI";
  const boxWidth = Math.min(width - 24, ctx.measureText(text).width + paddingX * 2);
  const boxX = clamp(x + 12, 12, width - boxWidth - 12);
  const boxY = clamp(y - boxHeight - 12, 12, height - boxHeight - 12);

  ctx.fillStyle = "rgba(252,250,246,0.9)";
  drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 13);
  ctx.fill();
  ctx.strokeStyle = overlayPalette.strokeSoft;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#1f1c18";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, boxX + paddingX, boxY + boxHeight / 2);
}

function drawNotanOverlay(ctx, width, height) {
  const notanCanvas = getNotanCanvas(width, height, state.notanLevels);

  if (!notanCanvas) {
    return;
  }

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(notanCanvas, 0, 0, width, height);
  ctx.restore();
}

function drawFocalBalance(ctx, width, height, overlayPalette) {
  const sizes = [56, 42, 30];
  const alphas = [0.2, 0.14, 0.1];
  const points = state.focalPoints.map((point, index) => ({
    x: point.x * width,
    y: point.y * height,
    radius: sizes[index] || sizes[sizes.length - 1],
    alpha: alphas[index] || alphas[alphas.length - 1],
    label: String(index + 1)
  }));

  ctx.save();
  points.forEach((point) => {
    const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius);
    gradient.addColorStop(0, toOverlayAlphaColor(getActiveOverlayColor(), point.alpha));
    gradient.addColorStop(1, toOverlayAlphaColor(getActiveOverlayColor(), 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  points.forEach((point) => {
    ctx.strokeStyle = overlayPalette.strokeMuted;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = overlayPalette.strokeStrong;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = overlayPalette.strokeStrong;
    ctx.font = "700 12px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(point.label, point.x, point.y);
  });
  ctx.restore();
}

function drawGoldenConstruction(ctx, width, height, squares, overlayPalette) {
  ctx.save();
  ctx.strokeStyle = overlayPalette.strokeSoft;
  ctx.lineWidth = 1.35;
  ctx.strokeRect(0, 0, width, height);

  squares.forEach((square) => {
    ctx.strokeRect(square.x, square.y, square.size, square.size);
  });
  ctx.restore();
}

function drawGoldenSpiralCurve(ctx, arcs, overlayPalette) {
  ctx.save();
  ctx.strokeStyle = overlayPalette.strokeStrong;
  ctx.lineWidth = 1.9;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke(getGoldenSpiralPath(arcs));
  ctx.restore();
}

function drawGoldenSpiralSelection(ctx, bounds, overlayPalette) {
  ctx.save();
  ctx.strokeStyle = overlayPalette.strokeMuted;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([7, 6]);
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.setLineDash([]);

  getGoldenSpiralHandlePoints(bounds).forEach((handle) => {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = overlayPalette.strokeStrong;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(handle.x, handle.y, SPIRAL_HANDLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}

function requestOverlayDraw() {
  window.requestAnimationFrame(drawOverlay);
}

function getGoldenSpiralBounds(
  width = Math.max(1, Math.round(compositionImage.clientWidth)),
  height = Math.max(1, Math.round(compositionImage.clientHeight)),
  spiralState = state.spiral
) {
  const rotationQuarterTurns = Math.round(spiralState.rotation / 90) % 2;
  const visibleRatio = rotationQuarterTurns === 0
    ? SPIRAL_TEMPLATE_RATIO
    : 1 / SPIRAL_TEMPLATE_RATIO;
  const baseWidth = Math.min(width * 0.78, height * 0.78 * visibleRatio);
  const overlayWidth = baseWidth * spiralState.scale;
  const overlayHeight = overlayWidth / visibleRatio;
  const unitScale = rotationQuarterTurns === 0
    ? overlayWidth / SPIRAL_TEMPLATE_WIDTH
    : overlayWidth / SPIRAL_TEMPLATE_HEIGHT;
  const drawWidth = SPIRAL_TEMPLATE_WIDTH * unitScale;
  const drawHeight = SPIRAL_TEMPLATE_HEIGHT * unitScale;
  const centerX = clamp(width * 0.5 + spiralState.offsetX, overlayWidth * 0.5, width - overlayWidth * 0.5);
  const centerY = clamp(height * 0.5 + spiralState.offsetY, overlayHeight * 0.5, height - overlayHeight * 0.5);

  return {
    x: centerX - overlayWidth / 2,
    y: centerY - overlayHeight / 2,
    width: overlayWidth,
    height: overlayHeight,
    drawWidth,
    drawHeight,
    visibleRatio,
    centerX,
    centerY,
    baseWidth
  };
}

function getGoldenSpiralTemplate(width, height) {
  const scale = width / SPIRAL_TEMPLATE_WIDTH;
  return {
    squares: SPIRAL_TEMPLATE_SQUARES
      .map((square) => ({
        x: square.x * scale,
        y: square.y * scale,
        size: square.size * scale
      }))
      .filter((square) => square.size >= 1.5),
    arcs: SPIRAL_TEMPLATE_ARCS
      .map((arc) => ({
        startX: arc.startX * scale,
        startY: arc.startY * scale,
        endX: arc.endX * scale,
        endY: arc.endY * scale,
        radius: arc.radius * scale
      }))
      .filter((arc) => arc.radius >= 1.5)
  };
}

function getScaledSpiralState(targetWidth, targetHeight) {
  const sourceWidth = Math.max(1, Math.round(compositionImage.clientWidth));
  const sourceHeight = Math.max(1, Math.round(compositionImage.clientHeight));
  const scaleX = targetWidth / sourceWidth;
  const scaleY = targetHeight / sourceHeight;

  return {
    ...state.spiral,
    offsetX: state.spiral.offsetX * scaleX,
    offsetY: state.spiral.offsetY * scaleY,
    selected: false,
    interaction: null,
    activeHandle: null
  };
}

function downloadCompositionAnalysis() {
  if (!requireUnlock("advanced exports")) {
    return;
  }
  if (!state.imageLoaded || !compositionImage.naturalWidth || !compositionImage.naturalHeight) {
    return;
  }

  const imageWidth = compositionImage.naturalWidth;
  const imageHeight = compositionImage.naturalHeight;
  const footerHeight = Math.max(56, Math.round(imageHeight * 0.08));
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = imageWidth;
  exportCanvas.height = imageHeight + footerHeight;
  const exportCtx = exportCanvas.getContext("2d");

  exportCtx.fillStyle = "#f4efe6";
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  exportCtx.drawImage(compositionImage, 0, 0, imageWidth, imageHeight);

  drawCompositionOverlay(exportCtx, imageWidth, imageHeight, {
    includeSelection: false,
    spiralState: getScaledSpiralState(imageWidth, imageHeight)
  });

  exportCtx.strokeStyle = "rgba(50, 44, 38, 0.12)";
  exportCtx.lineWidth = 1;
  exportCtx.beginPath();
  exportCtx.moveTo(0, imageHeight + 0.5);
  exportCtx.lineTo(exportCanvas.width, imageHeight + 0.5);
  exportCtx.stroke();

  const paddingX = Math.max(18, Math.round(exportCanvas.width * 0.035));
  const footerBaseY = imageHeight + Math.round(footerHeight * 0.48);
  exportCtx.fillStyle = "rgba(31, 28, 24, 0.78)";
  exportCtx.textAlign = "left";
  exportCtx.textBaseline = "alphabetic";
  exportCtx.font = `600 ${Math.max(14, Math.round(exportCanvas.width * 0.018))}px Segoe UI`;
  exportCtx.fillText("www.mateartwork.com", paddingX, footerBaseY);
  exportCtx.font = `500 ${Math.max(12, Math.round(exportCanvas.width * 0.014))}px Segoe UI`;
  exportCtx.fillStyle = "rgba(31, 28, 24, 0.62)";
  exportCtx.fillText("Created with M8 Composition Studio", paddingX, footerBaseY + Math.max(18, Math.round(footerHeight * 0.28)));

  const link = document.createElement("a");
  link.href = exportCanvas.toDataURL("image/png");
  link.download = "m8-composition-analysis.png";
  link.click();
  showStatusToast("Analysis downloaded");
}

function createUploadLoadingOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "image-loading-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="image-loading-copy">
      <p class="image-loading-title">Loading image...</p>
      <p class="image-loading-subcopy">Preparing analysis...</p>
    </div>
  `;
  canvasWrap.appendChild(overlay);
  return overlay;
}

function createStatusToast() {
  const toast = document.createElement("div");
  toast.className = "status-toast";
  toast.setAttribute("aria-live", "polite");
  toast.setAttribute("aria-atomic", "true");
  document.body.appendChild(toast);
  return toast;
}

function setWorkspaceLoadingState(isLoading, title = "Loading image...", subcopy = "Preparing analysis...") {
  canvasWrap.classList.toggle("is-loading", isLoading);
  canvasWrap.classList.remove("has-load-error");
  const titleNode = uploadLoadingOverlay.querySelector(".image-loading-title");
  const subcopyNode = uploadLoadingOverlay.querySelector(".image-loading-subcopy");
  if (titleNode) {
    titleNode.textContent = title;
  }
  if (subcopyNode) {
    subcopyNode.textContent = subcopy;
  }
}

function showStatusToast(message) {
  if (!statusToast) {
    return;
  }

  if (feedbackToastTimeoutId) {
    window.clearTimeout(feedbackToastTimeoutId);
    feedbackToastTimeoutId = null;
  }

  statusToast.textContent = message;
  window.requestAnimationFrame(() => {
    statusToast.classList.add("is-visible");
  });

  feedbackToastTimeoutId = window.setTimeout(() => {
    statusToast.classList.remove("is-visible");
    feedbackToastTimeoutId = null;
  }, 1800);
}

function handleNotanLevelsInput(event) {
  if (!requireUnlock("advanced Notan controls")) {
    event.target.value = String(state.notanLevels);
    return;
  }
  state.notanLevels = Number(event.target.value);
  invalidateNotanCache();
  notanLevelsValue.textContent = `${state.notanLevels} values`;
  requestOverlayDraw();
}

function invalidateNotanCache() {
  state.notanCache.key = null;
  state.notanCache.canvas = null;
}

function handleDynamicAlignmentToggle(event) {
  state.dynamicSymmetry.showAlignmentsOnly = event.target.checked;
  requestOverlayDraw();
}

function canInspectDynamicSymmetry() {
  return state.imageLoaded
    && state.analysisMode === "advanced"
    && state.advancedMode === "dynamic-symmetry"
    && !isAdvancedLocked();
}

function inspectDynamicSymmetryPoint(point) {
  const width = Math.max(1, Math.round(compositionImage.clientWidth));
  const height = Math.max(1, Math.round(compositionImage.clientHeight));
  const nearest = getNearestDynamicLineDistance(point.x, point.y, width, height);
  const isClose = nearest.distance <= getDynamicAlignmentThreshold(width, height);
  const message = isClose
    ? "This point is close to a major diagonal"
    : "This point is outside main structural lines";

  state.dynamicSymmetry.tooltip = {
    x: point.x / width,
    y: point.y / height,
    message
  };
  dynamicSymmetryTooltip.textContent = message;
  dynamicSymmetryTooltip.classList.remove("hidden");
  requestOverlayDraw();
}

function getDynamicSymmetryAnalysis(width, height) {
  const key = `${compositionImage.currentSrc || compositionImage.src}|${compositionImage.naturalWidth}x${compositionImage.naturalHeight}`;
  if (state.dynamicSymmetry.analysisKey !== key) {
    state.dynamicSymmetry.analysisKey = key;
    state.dynamicSymmetry.points = detectDynamicSymmetryKeyPoints();
    state.dynamicSymmetry.tooltip = null;
    dynamicSymmetryTooltip.classList.add("hidden");
  }

  const threshold = getDynamicAlignmentThreshold(width, height);
  const alignedPoints = state.dynamicSymmetry.points
    .map((point) => {
      const nearest = getNearestDynamicLineDistance(point.x * width, point.y * height, width, height);
      return { ...point, distance: nearest.distance, aligned: nearest.distance <= threshold };
    })
    .filter((point) => point.aligned);
  const score = state.dynamicSymmetry.points.length
    ? Math.round((alignedPoints.length / state.dynamicSymmetry.points.length) * 100)
    : 0;

  state.dynamicSymmetry.alignedPoints = alignedPoints;
  state.dynamicSymmetry.score = score;
  state.dynamicSymmetry.feedback = getDynamicSymmetryFeedback(score);
  updateDynamicSymmetryReadout();
  return state.dynamicSymmetry;
}

function detectDynamicSymmetryKeyPoints() {
  const width = compositionImage.naturalWidth;
  const height = compositionImage.naturalHeight;
  if (!width || !height) {
    return [];
  }

  const scale = Math.min(1, DYNAMIC_SYMMETRY_SAMPLE_SIZE / Math.max(width, height));
  const sampleWidth = Math.max(48, Math.round(width * scale));
  const sampleHeight = Math.max(48, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return [];
  }

  canvas.width = sampleWidth;
  canvas.height = sampleHeight;
  context.drawImage(compositionImage, 0, 0, sampleWidth, sampleHeight);
  const imageData = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
  const candidates = [];
  const step = Math.max(3, Math.floor(Math.min(sampleWidth, sampleHeight) / 54));

  for (let y = step; y < sampleHeight - step; y += step) {
    for (let x = step; x < sampleWidth - step; x += step) {
      const center = getLuminanceAt(imageData, sampleWidth, x, y);
      const right = getLuminanceAt(imageData, sampleWidth, x + step, y);
      const left = getLuminanceAt(imageData, sampleWidth, x - step, y);
      const down = getLuminanceAt(imageData, sampleWidth, x, y + step);
      const up = getLuminanceAt(imageData, sampleWidth, x, y - step);
      const gradient = Math.abs(right - left) + Math.abs(down - up);
      const contrast = Math.max(Math.abs(center - right), Math.abs(center - left), Math.abs(center - down), Math.abs(center - up));
      const centerPull = 1 - Math.min(1, Math.hypot((x / sampleWidth) - 0.5, (y / sampleHeight) - 0.5) / 0.72);
      const score = gradient * 0.7 + contrast * 0.45 + centerPull * 24;

      if (score > 34) {
        candidates.push({ x: x / sampleWidth, y: y / sampleHeight, score });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return chooseSeparatedDynamicPoints(candidates, DYNAMIC_SYMMETRY_MAX_POINTS);
}

function chooseSeparatedDynamicPoints(candidates, maxPoints) {
  const chosen = [];
  const minDistance = 0.055;

  for (const candidate of candidates) {
    if (chosen.some((point) => Math.hypot(point.x - candidate.x, point.y - candidate.y) < minDistance)) {
      continue;
    }

    chosen.push(candidate);
    if (chosen.length >= maxPoints) {
      break;
    }
  }

  return chosen;
}

function getLuminanceAt(data, width, x, y) {
  const index = (y * width + x) * 4;
  return (data[index] * 0.299) + (data[index + 1] * 0.587) + (data[index + 2] * 0.114);
}

function getDynamicSymmetryFeedback(score) {
  if (score >= 62) {
    return "Major forms align well with primary diagonals.";
  }
  if (score >= 34) {
    return "Some alignment is present, but could be stronger.";
  }
  return "The composition does not strongly follow dynamic symmetry lines.";
}

function updateDynamicSymmetryReadout() {
  const score = state.dynamicSymmetry.score;
  dynamicSymmetryScore.textContent = `Dynamic Symmetry Score: ${Number.isFinite(score) ? score : "--"}`;
  dynamicSymmetryFeedback.textContent = state.dynamicSymmetry.feedback;
}

function getDynamicAlignmentThreshold(width, height) {
  return Math.max(10, Math.min(width, height) * 0.038);
}

function getNearestDynamicLineDistance(x, y, width, height) {
  return getDynamicSymmetryLines(width, height).reduce((nearest, line) => {
    const distance = getPointLineDistance(x, y, line.x1, line.y1, line.x2, line.y2);
    return distance < nearest.distance ? { distance, line } : nearest;
  }, { distance: Infinity, line: null });
}

function getDynamicSymmetryLines(width, height) {
  const quarterX = width * 0.25;
  const threeQuarterX = width * 0.75;
  return [
    { x1: 0, y1: height, x2: width, y2: 0 },
    { x1: 0, y1: 0, x2: width, y2: height },
    { x1: 0, y1: height, x2: quarterX, y2: 0 },
    { x1: width, y1: height, x2: threeQuarterX, y2: 0 },
    { x1: 0, y1: 0, x2: quarterX, y2: height },
    { x1: width, y1: 0, x2: threeQuarterX, y2: height }
  ];
}

function getPointLineDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  if (!lengthSquared) {
    return Math.hypot(px - x1, py - y1);
  }

  const t = clamp(((px - x1) * dx + (py - y1) * dy) / lengthSquared, 0, 1);
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function getNotanCanvas(width, height, levels) {
  if (!compositionImage.naturalWidth || !compositionImage.naturalHeight) {
    return null;
  }

  const cacheKey = [state.objectUrl, width, height, levels].join("|");
  if (state.notanCache.key === cacheKey && state.notanCache.canvas) {
    return state.notanCache.canvas;
  }

  const sampleScale = Math.min(1, 240 / Math.max(width, height));
  const sampleWidth = Math.max(48, Math.round(width * sampleScale));
  const sampleHeight = Math.max(48, Math.round(height * sampleScale));
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = sampleWidth;
  sampleCanvas.height = sampleHeight;
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });

  if (!sampleContext) {
    return null;
  }

  sampleContext.drawImage(compositionImage, 0, 0, sampleWidth, sampleHeight);
  const imageData = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight);
  const { data } = imageData;
  const maxIndex = Math.max(1, levels - 1);

  for (let index = 0; index < data.length; index += 4) {
    const luminance = (0.2126 * data[index]) + (0.7152 * data[index + 1]) + (0.0722 * data[index + 2]);
    const normalized = luminance / 255;
    const groupIndex = Math.min(maxIndex, Math.floor(normalized * levels));
    const quantized = Math.round((groupIndex / maxIndex) * 255);

    data[index] = quantized;
    data[index + 1] = quantized;
    data[index + 2] = quantized;
  }

  sampleContext.putImageData(imageData, 0, 0);
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outputContext = outputCanvas.getContext("2d");

  if (!outputContext) {
    return null;
  }

  outputContext.imageSmoothingEnabled = true;
  outputContext.drawImage(sampleCanvas, 0, 0, width, height);
  state.notanCache.key = cacheKey;
  state.notanCache.canvas = outputCanvas;
  return outputCanvas;
}

function getGoldenSpiralPath(arcs) {
  if (!arcs.length) {
    return new Path2D();
  }

  const commands = [`M ${arcs[0].startX} ${arcs[0].startY}`];

  arcs.forEach((arc) => {
    commands.push(`A ${arc.radius} ${arc.radius} 0 0 1 ${arc.endX} ${arc.endY}`);
  });

  return new Path2D(commands.join(" "));
}

function getGoldenSpiralHandlePoints(bounds) {
  return [
    { name: "nw", x: bounds.x, y: bounds.y },
    { name: "ne", x: bounds.x + bounds.width, y: bounds.y },
    { name: "se", x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { name: "sw", x: bounds.x, y: bounds.y + bounds.height }
  ];
}

function getGoldenSpiralHandleAtPoint(point, bounds) {
  return getGoldenSpiralHandlePoints(bounds).find((handle) => {
    return Math.hypot(point.x - handle.x, point.y - handle.y) <= SPIRAL_HANDLE_RADIUS * 1.8;
  })?.name || null;
}

function getOppositeCornerPoint(handle, bounds) {
  const oppositeMap = {
    nw: { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    ne: { x: bounds.x, y: bounds.y + bounds.height },
    se: { x: bounds.x, y: bounds.y },
    sw: { x: bounds.x + bounds.width, y: bounds.y }
  };

  return oppositeMap[handle];
}

function getResizeDirection(handle) {
  const directions = {
    nw: { x: -1, y: -1 },
    ne: { x: 1, y: -1 },
    se: { x: 1, y: 1 },
    sw: { x: -1, y: 1 }
  };

  return directions[handle];
}

function resizeGoldenSpiralFromHandle(point) {
  const bounds = getGoldenSpiralBounds();
  const direction = getResizeDirection(state.spiral.activeHandle);
  const horizontalDistance = Math.abs(point.x - state.spiral.anchorX);
  const verticalDistance = Math.abs(point.y - state.spiral.anchorY);
  const proportionalWidth = Math.max(horizontalDistance, verticalDistance * bounds.visibleRatio, 48);
  const maxWidth = bounds.baseWidth * 1.75;
  const minWidth = bounds.baseWidth * 0.35;
  const clampedWidth = clamp(proportionalWidth, minWidth, maxWidth);
  const clampedHeight = clampedWidth / bounds.visibleRatio;
  const centerX = state.spiral.anchorX + direction.x * clampedWidth / 2;
  const centerY = state.spiral.anchorY + direction.y * clampedHeight / 2;
  const canvasWidth = Math.max(1, Math.round(compositionImage.clientWidth));
  const canvasHeight = Math.max(1, Math.round(compositionImage.clientHeight));

  state.spiral.scale = clampedWidth / bounds.baseWidth;
  state.spiral.offsetX = centerX - canvasWidth / 2;
  state.spiral.offsetY = centerY - canvasHeight / 2;
  state.spiral.selected = true;
}

function isPointInsideBounds(point, bounds) {
  return point.x >= bounds.x
    && point.x <= bounds.x + bounds.width
    && point.y >= bounds.y
    && point.y <= bounds.y + bounds.height;
}

function updateGoldenSpiralCursor(point) {
  const bounds = getGoldenSpiralBounds();
  const handle = getGoldenSpiralHandleAtPoint(point, bounds);

  if (handle && state.spiral.selected) {
    overlayCanvas.style.cursor = handle === "nw" || handle === "se" ? "nwse-resize" : "nesw-resize";
    return;
  }

  if (isPointInsideBounds(point, bounds)) {
    overlayCanvas.style.cursor = "grab";
    return;
  }

  overlayCanvas.style.cursor = "default";
}

function getGoldenSpiralCursor() {
  if (state.spiral.interaction === "move") {
    return "grabbing";
  }

  if (state.spiral.interaction === "resize") {
    return state.spiral.activeHandle === "nw" || state.spiral.activeHandle === "se"
      ? "nwse-resize"
      : "nesw-resize";
  }

  if (state.spiral.selected) {
    return "grab";
  }

  return "default";
}

function detectOverlayColor() {
  const sampleCanvas = document.createElement("canvas");
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
  const sampleWidth = 48;
  const sampleHeight = 48;

  if (!sampleContext || !compositionImage.naturalWidth || !compositionImage.naturalHeight) {
    return "#1f1c18";
  }

  sampleCanvas.width = sampleWidth;
  sampleCanvas.height = sampleHeight;
  sampleContext.drawImage(compositionImage, 0, 0, sampleWidth, sampleHeight);

  const { data } = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight);
  let totalLuminance = 0;
  const pixelCount = data.length / 4;

  for (let index = 0; index < data.length; index += 4) {
    totalLuminance += (0.2126 * data[index]) + (0.7152 * data[index + 1]) + (0.0722 * data[index + 2]);
  }

  const averageLuminance = totalLuminance / pixelCount;
  return averageLuminance < 128 ? "#ffffff" : "#1f1c18";
}

function updateOverlayColorUI() {
  const activeColor = getActiveOverlayColor();
  overlayColorMenu.classList.toggle("hidden", !state.isOverlayColorMenuOpen);
  overlayColorButton.setAttribute("aria-expanded", String(state.isOverlayColorMenuOpen));

  overlayColorPreview.classList.remove(...OVERLAY_COLOR_CLASSES);
  overlayColorPreview.classList.add(getOverlayColorClass(activeColor));

  overlayColorSwatches.forEach((button) => {
    button.classList.toggle("active", button.dataset.overlayColor === activeColor);
  });
}

function getOverlayColorClass(color) {
  return OVERLAY_COLOR_NAMES[color] || "overlay-color-black";
}

function getActiveOverlayColor() {
  return state.userSelectedOverlayColor || state.autoDetectedOverlayColor;
}

function getOverlayPalette() {
  const activeColor = getActiveOverlayColor();
  return {
    stroke: toOverlayAlphaColor(activeColor, 0.8),
    strokeStrong: toOverlayAlphaColor(activeColor, 0.88),
    strokeSoft: toOverlayAlphaColor(activeColor, 0.42),
    strokeMuted: toOverlayAlphaColor(activeColor, 0.58),
    fill: toOverlayAlphaColor(activeColor, 0.78),
    fillSoft: toOverlayAlphaColor(activeColor, 0.26),
    fillVerySoft: toOverlayAlphaColor(activeColor, 0.1)
  };
}

function toOverlayAlphaColor(hexColor, alpha) {
  const normalized = hexColor.replace("#", "");
  const expanded = normalized.length === 3
    ? normalized.split("").map((char) => `${char}${char}`).join("")
    : normalized;
  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function canDragGoldenSpiral() {
  return state.analysisMode === "advanced" && state.advancedMode === "golden-spiral" && !isAdvancedLocked();
}

function getOverlayPoint(event) {
  const rect = overlayCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return null;
  }

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

void consumeLandingHandoff();
