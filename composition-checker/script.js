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
    description: "Simplifies the image into 2-3 value groups (light and dark) to reveal the core design.",
    tip: "Check if the composition still works clearly when reduced to simple value shapes.",
    status: "Upload an image to begin."
  },
  "focal-balance": {
    title: "Focal Balance",
    description: "Analyzes visual weight and contrast to highlight the dominant focal area.",
    tip: "Identify where the eye is naturally drawn and whether it matches your intended focal point.",
    status: "Upload an image to begin."
  }
};

const fileInput = document.getElementById("fileInput");
const clearNotesButton = document.getElementById("clearNotesButton");
const canvasWrap = document.getElementById("canvasWrap");
const compositionStage = document.getElementById("compositionStage");
const compositionImage = document.getElementById("compositionImage");
const overlayCanvas = document.getElementById("overlayCanvas");
const emptyState = document.getElementById("emptyState");
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
const spiralControlsCard = document.getElementById("spiralControlsCard");
const downloadCompositionAnalysisButton = document.getElementById("downloadCompositionAnalysisButton");
const spiralScale = document.getElementById("spiralScale");
const spiralScaleValue = document.getElementById("spiralScaleValue");
const spiralResetButton = document.getElementById("spiralResetButton");
const spiralRotateButton = document.getElementById("spiralRotateButton");
const spiralFlipHorizontalButton = document.getElementById("spiralFlipHorizontalButton");
const spiralFlipVerticalButton = document.getElementById("spiralFlipVerticalButton");
const spiralDisplayButtons = Array.from(document.querySelectorAll("[data-spiral-display]"));

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
  anchorY: 0
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

const OVERLAY_COLOR_CLASSES = ["overlay-color-black", "overlay-color-white", "overlay-color-red"];
const OVERLAY_COLOR_NAMES = {
  "#1f1c18": "overlay-color-black",
  "#ffffff": "overlay-color-white",
  "#c96a3d": "overlay-color-red"
};

const state = {
  analysisMode: "basic",
  mode: "thirds",
  advancedMode: "golden-ratio",
  imageLoaded: false,
  objectUrl: null,
  noteMarkers: [],
  autoDetectedOverlayColor: "#1f1c18",
  userSelectedOverlayColor: null,
  isOverlayColorMenuOpen: false,
  spiral: {
    ...SPIRAL_DEFAULTS
  }
};

const resizeObserver = new ResizeObserver(() => {
  requestOverlayDraw();
});

resizeObserver.observe(canvasWrap);
resizeObserver.observe(compositionStage);
resizeObserver.observe(compositionImage);

fileInput.addEventListener("change", handleUpload);
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
overlayCanvas.addEventListener("pointerdown", handleOverlayPointerDown);
window.addEventListener("pointermove", handleOverlayPointerMove);
window.addEventListener("pointerup", handleOverlayPointerUp);
window.addEventListener("pointercancel", handleOverlayPointerUp);
overlayColorButton.addEventListener("click", toggleOverlayColorMenu);
overlayColorSwatches.forEach((button) => {
  button.addEventListener("click", () => selectOverlayColor(button.dataset.overlayColor));
});
document.addEventListener("click", handleDocumentClick);

updateModeUI();

function handleUpload(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
  }

  state.objectUrl = URL.createObjectURL(file);
  compositionImage.onload = () => {
    state.imageLoaded = true;
    state.userSelectedOverlayColor = null;
    state.autoDetectedOverlayColor = detectOverlayColor();
    Object.assign(state.spiral, SPIRAL_DEFAULTS);
    closeOverlayColorMenu();
    emptyState.style.display = "none";
    compositionImage.style.display = "block";
    overlayCanvas.style.display = "block";
    updateModeUI();
    requestOverlayDraw();
  };
  compositionImage.src = state.objectUrl;
}

function handleWorkspaceClick() {
  if (!state.imageLoaded) {
    fileInput.click();
  }
}

function handleWorkspaceKeydown(event) {
  if (state.imageLoaded) {
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
}

function handleOverlayClick(event) {
  return;
}

function toggleOverlayColorMenu(event) {
  event.stopPropagation();
  state.isOverlayColorMenuOpen = !state.isOverlayColorMenuOpen;
  updateOverlayColorUI();
}

function closeOverlayColorMenu() {
  state.isOverlayColorMenuOpen = false;
  updateOverlayColorUI();
}

function selectOverlayColor(color) {
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
  if (!canDragGoldenSpiral() || !state.imageLoaded) {
    return;
  }

  const point = getOverlayPoint(event);
  if (!point) {
    return;
  }
  const bounds = getGoldenSpiralBounds();
  const handle = getGoldenSpiralHandleAtPoint(point, bounds);

  state.spiral.selected = true;

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
    requestOverlayDraw();
    return;
  }

  if (state.spiral.interaction === "resize") {
    resizeGoldenSpiralFromHandle(point);
    requestOverlayDraw();
    return;
  }

  updateGoldenSpiralCursor(point);
}

function handleOverlayPointerUp(event) {
  if (!state.spiral.interaction) {
    return;
  }

  state.spiral.interaction = null;
  state.spiral.activeHandle = null;

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
  state.noteMarkers = [];
  clearNotesButton.disabled = true;
  updateModeUI();
  requestOverlayDraw();
}

function toggleSpiralFlipX() {
  state.spiral.flipX = !state.spiral.flipX;
  updateModeUI();
  requestOverlayDraw();
}

function rotateGoldenSpiral() {
  state.spiral.rotation = (state.spiral.rotation + 90) % 360;
  state.spiral.selected = true;
  updateModeUI();
  requestOverlayDraw();
}

function toggleSpiralFlipY() {
  state.spiral.flipY = !state.spiral.flipY;
  updateModeUI();
  requestOverlayDraw();
}

function setSpiralDisplayMode(displayMode) {
  state.spiral.displayMode = displayMode;
  updateModeUI();
  requestOverlayDraw();
}

function handleSpiralScaleInput(event) {
  state.spiral.scale = Number(event.target.value) / 100;
  state.spiral.selected = true;
  updateModeUI();
  requestOverlayDraw();
}

function resetGoldenSpiral() {
  Object.assign(state.spiral, SPIRAL_DEFAULTS);
  state.spiral.selected = true;
  updateModeUI();
  requestOverlayDraw();
}

function setAnalysisMode(mode) {
  state.analysisMode = mode;
  updateModeUI();
  requestOverlayDraw();
}

function setMode(mode) {
  state.mode = mode;
  updateModeUI();
  requestOverlayDraw();
}

function setAdvancedMode(mode) {
  state.advancedMode = mode;
  if (mode !== "golden-spiral") {
    state.spiral.interaction = null;
    state.spiral.activeHandle = null;
    state.spiral.selected = false;
  } else if (state.imageLoaded) {
    state.spiral.selected = true;
  }
  updateModeUI();
  requestOverlayDraw();
}

function updateModeUI() {
  const isBasic = state.analysisMode === "basic";
  const config = MODES[state.mode];
  const advancedConfig = ADVANCED_MODES[state.advancedMode];
  const isGoldenSpiral = !isBasic && state.advancedMode === "golden-spiral";

  basicToolSwitcher.classList.toggle("hidden", !isBasic);
  advancedToolSwitcher.classList.toggle("hidden", isBasic);
  basicAnalysisPanel.classList.toggle("hidden", !isBasic);
  advancedAnalysisPanel.classList.toggle("hidden", isBasic);
  spiralControlsCard.classList.toggle("hidden", !isGoldenSpiral);
  overlayCanvas.style.display = state.imageLoaded ? "block" : "none";
  clearNotesButton.classList.add("hidden");
  clearNotesButton.disabled = true;

  if (isBasic) {
    workspaceTitle.textContent = config.title;
    analysisTitle.textContent = config.title;
    modeDescription.textContent = config.description;
    modeTip.textContent = config.tip;
    workspaceHint.textContent = state.imageLoaded
      ? "Use the active overlay to study the structure of the composition."
      : "Upload an image to begin your composition study.";
    statusNote.textContent = state.imageLoaded
      ? "Overlay is active. Switch tools to compare different compositional guides."
      : "Upload an image to start.";
  } else {
    workspaceTitle.textContent = advancedConfig.title;
    analysisTitle.textContent = advancedConfig.title;
    workspaceHint.textContent = state.imageLoaded
      ? "Study the image with the selected advanced composition guide."
      : "Upload an image to begin your composition study.";
    advancedModeDescription.textContent = advancedConfig.description;
    advancedModeTip.textContent = advancedConfig.tip;
    advancedStatusNote.textContent = state.imageLoaded
      ? advancedConfig.status
      : advancedConfig.status;
  }

  overlayCanvas.classList.toggle("notes-mode", isGoldenSpiral && state.imageLoaded);
  overlayCanvas.style.cursor = isGoldenSpiral && state.imageLoaded
    ? getGoldenSpiralCursor()
    : "default";
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

function getWorkspaceHint() {
  return "Use the active overlay to study the structure of the composition.";
}

function getStatusCopy() {
  return "Overlay is active. Switch modes to compare different compositional guides.";
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
  drawCompositionOverlay(ctx, width, height);
}

function drawCompositionOverlay(ctx, width, height, options = {}) {
  const overlayPalette = getOverlayPalette();
  ctx.strokeStyle = overlayPalette.stroke;
  ctx.fillStyle = overlayPalette.fill;
  ctx.lineWidth = 1.4;
  const drawOptions = {
    includeSelection: options.includeSelection ?? true,
    spiralState: options.spiralState ?? state.spiral
  };

  if (state.analysisMode === "basic") {
    if (state.mode === "thirds") {
      drawThirds(ctx, width, height, overlayPalette);
    } else if (state.mode === "grid") {
      drawGrid(ctx, width, height, overlayPalette);
    } else if (state.mode === "center") {
      drawCenterLines(ctx, width, height, overlayPalette);
    } else if (state.mode === "diagonal") {
      drawDiagonals(ctx, width, height, overlayPalette);
    }
  } else {
    if (state.advancedMode === "golden-ratio") {
      drawGoldenRatio(ctx, width, height, overlayPalette);
    } else if (state.advancedMode === "golden-spiral") {
      drawGoldenSpiral(ctx, width, height, overlayPalette, drawOptions);
    } else if (state.advancedMode === "dynamic-symmetry") {
      drawDynamicSymmetry(ctx, width, height, overlayPalette);
    } else if (state.advancedMode === "notan") {
      drawNotanOverlay(ctx, width, height, overlayPalette);
    } else if (state.advancedMode === "focal-balance") {
      drawFocalBalance(ctx, width, height, overlayPalette);
    }
  }
}

function drawThirds(ctx, width, height, overlayPalette) {
  const firstThirdX = width * 0.33333;
  const secondThirdX = width * 0.66666;
  const firstThirdY = height * 0.33333;
  const secondThirdY = height * 0.66666;

  ctx.strokeStyle = overlayPalette.stroke;
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
}

function drawGrid(ctx, width, height, overlayPalette) {
  const columns = 6;
  const rows = 6;
  ctx.strokeStyle = overlayPalette.stroke;
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

function drawCenterLines(ctx, width, height, overlayPalette) {
  ctx.strokeStyle = overlayPalette.stroke;
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
}

function drawDiagonals(ctx, width, height, overlayPalette) {
  ctx.strokeStyle = overlayPalette.stroke;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, height);
  ctx.moveTo(width, 0);
  ctx.lineTo(0, height);
  ctx.stroke();
}

function drawGoldenRatio(ctx, width, height, overlayPalette) {
  const phi = 1.61803398875;
  const verticalA = width / phi;
  const verticalB = width - verticalA;
  const horizontalA = height / phi;
  const horizontalB = height - horizontalA;

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

function drawNotanOverlay(ctx, width, height, overlayPalette) {
  ctx.save();
  ctx.fillStyle = overlayPalette.fillVerySoft;
  ctx.fillRect(0, 0, width * 0.42, height);
  ctx.fillRect(width * 0.68, 0, width * 0.32, height);
  ctx.fillRect(width * 0.22, height * 0.56, width * 0.26, height * 0.44);

  ctx.strokeStyle = overlayPalette.stroke;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(width * 0.42, 0);
  ctx.lineTo(width * 0.42, height);
  ctx.moveTo(width * 0.68, 0);
  ctx.lineTo(width * 0.68, height);
  ctx.moveTo(width * 0.22, height * 0.56);
  ctx.lineTo(width * 0.48, height * 0.56);
  ctx.stroke();
  ctx.restore();
}

function drawFocalBalance(ctx, width, height, overlayPalette) {
  const zones = [
    { x: width * 0.56, y: height * 0.36, rx: width * 0.16, ry: height * 0.14, alpha: 0.16 },
    { x: width * 0.3, y: height * 0.6, rx: width * 0.14, ry: height * 0.12, alpha: 0.09 },
    { x: width * 0.78, y: height * 0.68, rx: width * 0.12, ry: height * 0.1, alpha: 0.07 }
  ];

  ctx.save();
  zones.forEach((zone) => {
    const gradient = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, Math.max(zone.rx, zone.ry));
    gradient.addColorStop(0, toOverlayAlphaColor(getActiveOverlayColor(), zone.alpha));
    gradient.addColorStop(1, toOverlayAlphaColor(getActiveOverlayColor(), 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(zone.x, zone.y, zone.rx, zone.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = overlayPalette.strokeMuted;
  ctx.lineWidth = 1.1;
  zones.forEach((zone, index) => {
    ctx.beginPath();
    ctx.ellipse(zone.x, zone.y, zone.rx, zone.ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = overlayPalette.fill;
    ctx.font = "700 12px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(index + 1), zone.x, zone.y);
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
  return state.analysisMode === "advanced" && state.advancedMode === "golden-spiral";
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
