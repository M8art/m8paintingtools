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

const fileInput = document.getElementById("fileInput");
const clearNotesButton = document.getElementById("clearNotesButton");
const canvasWrap = document.getElementById("canvasWrap");
const compositionStage = document.getElementById("compositionStage");
const compositionImage = document.getElementById("compositionImage");
const overlayCanvas = document.getElementById("overlayCanvas");
const emptyState = document.getElementById("emptyState");
const workspaceTitle = document.getElementById("workspaceTitle");
const workspaceHint = document.getElementById("workspaceHint");
const analysisTitle = document.getElementById("analysisTitle");
const modeDescription = document.getElementById("modeDescription");
const modeTip = document.getElementById("modeTip");
const statusNote = document.getElementById("statusNote");
const modeButtons = Array.from(document.querySelectorAll("[data-mode]"));
const analysisModeButtons = Array.from(document.querySelectorAll("[data-analysis-mode]"));
const basicToolSwitcher = document.getElementById("basicToolSwitcher");
const basicAnalysisPanel = document.getElementById("basicAnalysisPanel");
const advancedAnalysisPanel = document.getElementById("advancedAnalysisPanel");

const state = {
  analysisMode: "basic",
  mode: "thirds",
  imageLoaded: false,
  objectUrl: null,
  noteMarkers: []
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
    emptyState.style.display = "none";
    compositionImage.style.display = "block";
    overlayCanvas.style.display = "block";
    statusNote.textContent = "Overlay is active. Switch tools to compare different compositional guides.";
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

function clearNoteMarkers() {
  state.noteMarkers = [];
  clearNotesButton.disabled = true;
  statusNote.textContent = state.imageLoaded
    ? "Overlay is active. Switch tools to compare different compositional guides."
    : "Upload an image to start.";
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

function updateModeUI() {
  const isBasic = state.analysisMode === "basic";
  const config = MODES[state.mode];

  basicToolSwitcher.classList.toggle("hidden", !isBasic);
  basicAnalysisPanel.classList.toggle("hidden", !isBasic);
  advancedAnalysisPanel.classList.toggle("hidden", isBasic);
  overlayCanvas.style.display = state.imageLoaded && isBasic ? "block" : "none";
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
    workspaceTitle.textContent = "Advanced Analysis";
    analysisTitle.textContent = "Advanced Analysis";
    workspaceHint.textContent = state.imageLoaded
      ? "Advanced tools are on the way."
      : "Upload an image to begin your composition study.";
  }

  modeButtons.forEach((button) => {
    button.classList.toggle("active", isBasic && button.dataset.mode === state.mode);
    button.setAttribute("aria-selected", String(button.dataset.mode === state.mode));
  });

  analysisModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.analysisMode === state.analysisMode);
    button.setAttribute("aria-selected", String(button.dataset.analysisMode === state.analysisMode));
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

  if (!state.imageLoaded || state.analysisMode !== "basic") {
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

  ctx.strokeStyle = "rgba(31, 28, 24, 0.72)";
  ctx.fillStyle = "rgba(31, 28, 24, 0.78)";
  ctx.lineWidth = 1.4;

  if (state.mode === "thirds") {
    drawThirds(ctx, width, height);
  } else if (state.mode === "grid") {
    drawGrid(ctx, width, height);
  } else if (state.mode === "center") {
    drawCenterLines(ctx, width, height);
  } else if (state.mode === "diagonal") {
    drawDiagonals(ctx, width, height);
  }
}

function drawThirds(ctx, width, height) {
  const firstThirdX = width * 0.33333;
  const secondThirdX = width * 0.66666;
  const firstThirdY = height * 0.33333;
  const secondThirdY = height * 0.66666;

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

function drawGrid(ctx, width, height) {
  const columns = 6;
  const rows = 6;
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

function drawCenterLines(ctx, width, height) {
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
}

function drawDiagonals(ctx, width, height) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, height);
  ctx.moveTo(width, 0);
  ctx.lineTo(0, height);
  ctx.stroke();
}

function requestOverlayDraw() {
  window.requestAnimationFrame(drawOverlay);
}
