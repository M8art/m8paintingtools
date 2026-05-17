const drawingFileInput = document.getElementById("drawingFileInput");
const referenceFileInput = document.getElementById("referenceFileInput");
const compareDrawingFileInput = document.getElementById("compareDrawingFileInput");
const drawingStage = document.getElementById("drawingStage");
const drawingPreview = document.getElementById("drawingPreview");
const drawingOverlay = document.getElementById("drawingOverlay");
const perspectiveSystem = document.getElementById("perspectiveSystem");
const perspectiveHorizon = document.getElementById("perspectiveHorizon");
const vpCenterMarker = document.getElementById("vpCenterMarker");
const vpLeftMarker = document.getElementById("vpLeftMarker");
const vpRightMarker = document.getElementById("vpRightMarker");
const canonSystem = document.getElementById("canonSystem");
const canonBoard = document.getElementById("canonBoard");
const bodyCanonSystem = document.getElementById("bodyCanonSystem");
const bodyCanonBoard = document.getElementById("bodyCanonBoard");
const compareStage = document.getElementById("compareStage");
const referencePreview = document.getElementById("referencePreview");
const compareDrawingPreview = document.getElementById("compareDrawingPreview");
const workspaceTitle = document.getElementById("workspaceTitle");
const workspaceHint = document.getElementById("workspaceHint");
const panelTitle = document.getElementById("panelTitle");
const readinessBadge = document.getElementById("readinessBadge");
const structureScore = document.getElementById("structureScore");
const structureVerdict = document.getElementById("structureVerdict");
const scoreFill = document.getElementById("scoreFill");
const envelopeMetric = document.getElementById("envelopeMetric");
const axisMetric = document.getElementById("axisMetric");
const angleMetric = document.getElementById("angleMetric");
const proportionRead = document.getElementById("proportionRead");
const angleRead = document.getElementById("angleRead");
const alignmentRead = document.getElementById("alignmentRead");
const fixRead = document.getElementById("fixRead");
const proportionLabel = document.getElementById("proportionLabel");
const angleLabel = document.getElementById("angleLabel");
const alignmentLabel = document.getElementById("alignmentLabel");
const proportionRatioBadge = document.getElementById("proportionRatioBadge");
const proportionEnvelopeBox = document.getElementById("proportionEnvelopeBox");
const proportionEnvelopeStat = document.getElementById("proportionEnvelopeStat");
const proportionCenterStat = document.getElementById("proportionCenterStat");
const proportionMassStat = document.getElementById("proportionMassStat");
const runButton = document.getElementById("runButton");
const clearButton = document.getElementById("clearButton");
const resetButton = document.getElementById("resetButton");
const compareButton = document.getElementById("compareButton");
const overlayToggleButton = document.getElementById("overlayToggleButton");
const overlayToolControl = document.querySelector(".overlay-tool-control");
const overlaySelectedDot = document.getElementById("overlaySelectedDot");
const compareStatus = document.getElementById("compareStatus");
const tabButtons = Array.from(document.querySelectorAll("[data-mode]"));
const compareControls = Array.from(document.querySelectorAll("[data-compare-control]"));
const compareActions = Array.from(document.querySelectorAll("[data-compare-action]"));
const workspaceActionButtons = Array.from(document.querySelectorAll("[data-workspace-action]"));
const compareBlendButtons = Array.from(document.querySelectorAll("[data-compare-blend]"));
const nudgeButtons = Array.from(document.querySelectorAll("[data-nudge]"));
const overlayColorButtons = Array.from(document.querySelectorAll("[data-overlay-color]"));
const perspectiveControls = Array.from(document.querySelectorAll("[data-perspective-control]"));
const perspectiveModeButtons = Array.from(document.querySelectorAll("[data-perspective-mode]"));
const perspectiveRayButtons = Array.from(document.querySelectorAll("[data-perspective-rays]"));
const perspectiveBeamButtons = Array.from(document.querySelectorAll("[data-perspective-beam]"));
const perspectiveAutoButtons = Array.from(document.querySelectorAll("[data-perspective-auto]"));
const perspectiveRayCountStat = document.getElementById("perspectiveRayCountStat");
const perspectiveRayCountStats = [
  perspectiveRayCountStat,
  ...Array.from(document.querySelectorAll("[data-perspective-ray-count-stat]"))
].filter(Boolean);
const perspectiveRays = Array.from(document.querySelectorAll("[data-perspective-ray]"));
const perspectiveModeBadge = document.getElementById("perspectiveModeBadge");
const perspectiveModeStat = document.getElementById("perspectiveModeStat");
const perspectiveHorizonStat = document.getElementById("perspectiveHorizonStat");
const perspectiveCheckStat = document.getElementById("perspectiveCheckStat");
const canonControls = Array.from(document.querySelectorAll("[data-canon-control]"));
const canonViewButtons = Array.from(document.querySelectorAll("[data-canon-view]"));
const canonGuideButtons = Array.from(document.querySelectorAll("[data-canon-guide]"));
const canonActions = Array.from(document.querySelectorAll("[data-canon-action]"));
const canonViewBadge = document.getElementById("canonViewBadge");
const bodyControls = Array.from(document.querySelectorAll("[data-body-control]"));
const bodyViewButtons = Array.from(document.querySelectorAll("[data-body-view]"));
const bodyActions = Array.from(document.querySelectorAll("[data-body-action]"));
const bodyCanonViewBadge = document.getElementById("bodyCanonViewBadge");
const appShell = document.querySelector(".app");

const DRAWING_PREVIEW_MODES = new Set(["perspective", "canon", "body"]);
const PERSPECTIVE_ALIGN_ENDPOINT = window.M8_PERSPECTIVE_ALIGN_ENDPOINT || (
  window.location.protocol === "file:"
    ? "http://localhost:8888/.netlify/functions/perspective-align"
    : "/.netlify/functions/perspective-align"
);
const AI_PERSPECTIVE_IMAGE_MAX_DIMENSION = 1024;
const AI_PERSPECTIVE_IMAGE_QUALITY = 0.82;

const MODE_COPY = {
  proportion: {
    title: "Proportion Check",
    panel: "Proportion",
    hint: "Check the full envelope, center split, and big mass divisions before details.",
    score: 72,
    verdict: "Big shapes read clearly enough for a first pass.",
    proportion: "The checker is set up to compare head-to-body, object width, and large mass divisions.",
    angle: "Angle read stays secondary here. Use it after the big proportions feel stable.",
    alignment: "Center landmarks and quarter divisions help catch drift early.",
    fix: "First fix: correct the biggest envelope shape before working on small features."
  },
  angles: {
    title: "Angle Checker",
    panel: "Angles",
    hint: "Use the diagonal guides to compare the main tilts and directional lines.",
    score: 68,
    verdict: "Main tilts need one clean pass before detail.",
    proportion: "Keep the envelope visible while checking each sloping line.",
    angle: "Compare the strongest diagonals first: shoulders, horizon, table edges, nose bridge, or object axes.",
    alignment: "If one angle is off, nearby landmarks often drift with it.",
    fix: "First fix: choose one anchor angle and adjust all related edges against it."
  },
  alignment: {
    title: "Alignment Study",
    panel: "Alignment",
    hint: "Use center axes and landmarks to see if the drawing is drifting.",
    score: 76,
    verdict: "The structure is readable; check landmark placement.",
    proportion: "Proportion is checked through repeated horizontal landmarks.",
    angle: "Angles matter where they cross the center axis.",
    alignment: "Look for eyes, corners, shoulders, vertical object sides, or symmetry points that miss the axis.",
    fix: "First fix: mark the centerline and re-place the most important landmark."
  },
  perspective: {
    title: "Perspective Lines",
    panel: "Perspective",
    hint: "Check whether major edges belong to the same spatial system.",
    score: 64,
    verdict: "Perspective guides are ready for vanishing-point checks.",
    proportion: "Proportions should compress as forms move back in space.",
    angle: "Edges should converge consistently instead of each choosing a different direction.",
    alignment: "Verticals and horizon alignment are the first things to test.",
    fix: "First fix: establish the horizon, then correct the strongest receding edge."
  },
  canon: {
    title: "Head Canon",
    panel: "Head Canon",
    hint: "Fit the basic frame first, then add the optional eye line, mouth base, and eye/nose width layer only when needed.",
    score: 0,
    verdict: "Head canon overlay is ready.",
    proportion: "Scale the canon to the full head height before judging features.",
    angle: "Use Front for symmetry and Side for profile placement.",
    alignment: "Move the overlay until the centerline or profile edge sits on the drawing.",
    fix: "First fix: match skull-to-chin height, then check the three equal face thirds."
  },
  body: {
    title: "Body Canon",
    panel: "Body Canon",
    hint: "Fit the 8-head body canon over the figure, then compare shoulders, chest, pelvis, knees, and feet.",
    score: 0,
    verdict: "Body canon overlay is ready.",
    proportion: "Scale the canon to the full figure height before judging anatomy.",
    angle: "Use Front for standing symmetry and Side for profile posture.",
    alignment: "Move the overlay until the centerline or profile silhouette matches the figure.",
    fix: "First fix: match full figure height, then check pelvis, knees, and shoulder width."
  },
  canon3d: {
    title: "3D Canon",
    panel: "3D Canon",
    hint: "Rotate the 3D canon to study front, side, and three-quarter structure.",
    score: 0,
    verdict: "3D canon viewport is ready.",
    proportion: "Use the 3D grid to understand depth before flattening the canon into a drawing.",
    angle: "Rotate the frame to compare front, side, and three-quarter turns.",
    alignment: "Keep the major planes and center axes clear before judging smaller landmarks.",
    fix: "First fix: choose Head or Body, then set the view that matches your drawing."
  },
  compare: {
    title: "Trace Compare",
    panel: "Compare",
    hint: "Upload a reference and your photographed drawing, then align the drawing layer over the reference.",
    score: 0,
    verdict: "Compare mode uses manual overlay controls.",
    proportion: "Use scale to match the full envelope before judging small features.",
    angle: "Rotate the drawing layer until the strongest shared axis agrees with the reference.",
    alignment: "Use X and Y to line up one anchor point, then check where the rest drifts.",
    fix: "First fix: align the largest envelope, then correct only the landmark with the biggest visible offset."
  }
};

let activeMode = "canon";
let lastPreviewMode = "canon";
let currentObjectUrl = null;
let referenceObjectUrl = null;
let compareDrawingObjectUrl = null;
let hasImage = false;
let hasReferenceImage = false;
let hasCompareDrawing = false;
let overlayVisible = true;
let overlayColor = "amber";
let currentDrawingRead = null;
let toolHistory = [];
let perspectiveAutoRequestId = 0;
let isPerspectiveAutoLoading = false;
let compareState = {
  opacity: 58,
  scale: 100,
  x: 0,
  y: 0,
  rotate: 0,
  blend: "multiply"
};
let perspectiveState = {
  mode: "one",
  horizon: 48,
  center: 50,
  left: 18,
  right: 82,
  rayCount: 4,
  leftSpread: 54,
  rightSpread: 54,
  showLeft: true,
  showRight: true,
  opacity: 68
};
let canonState = {
  view: "front",
  scale: 100,
  x: 0,
  y: 0,
  opacity: 72,
  eyes: false,
  mouth: false,
  widths: false,
  scaleTouched: false
};
let bodyState = {
  view: "front",
  scale: 100,
  x: 0,
  y: 0,
  opacity: 70
};
const activeComparePointers = new Map();
let compareGesture = null;
const activeCanonPointers = new Map();
let canonGesture = null;
let activeCanonTarget = null;

drawingStage.addEventListener("click", (event) => {
  if (event.target.closest(".mobile-compare-controls, .compare-empty-state, button, label, input")) {
    return;
  }

  if (activeMode === "compare") {
    if (!hasReferenceImage) {
      openFilePicker(referenceFileInput);
    } else if (!hasCompareDrawing) {
      openFilePicker(compareDrawingFileInput);
    }
    return;
  }

  if (activeMode === "canon3d") {
    if (!hasImage) {
      openFilePicker(drawingFileInput);
    }
    return;
  }

  if (!hasImage) {
    openFilePicker(drawingFileInput);
  }
});

drawingStage.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  if (activeMode === "compare") {
    if (!hasReferenceImage) {
      openFilePicker(referenceFileInput);
    } else if (!hasCompareDrawing) {
      openFilePicker(compareDrawingFileInput);
    }
    return;
  }

  if (activeMode === "canon3d") {
    if (!hasImage) {
      openFilePicker(drawingFileInput);
    }
    return;
  }

  if (!hasImage) {
    openFilePicker(drawingFileInput);
  }
});

drawingFileInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (file) {
    showDrawing(file);
    event.target.value = "";
  }
});

referenceFileInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (file) {
    showCompareImage("reference", file);
    event.target.value = "";
  }
});

compareDrawingFileInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (file) {
    showCompareImage("drawing", file);
    event.target.value = "";
  }
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
  });
});

runButton.addEventListener("click", () => {
  if (!hasImage || activeMode === "compare") return;
  applyModeResult(true);
});

clearButton.addEventListener("click", resetActiveWorkspace);
resetButton.addEventListener("click", resetActiveWorkspace);

workspaceActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.workspaceAction;
    if (action === "undo") {
      undoToolChange();
      return;
    }
    if (action === "center") {
      centerActiveTool();
      return;
    }
    if (action === "reset") {
      resetActiveToolSettings();
      return;
    }
    if (action === "export") {
      exportCurrentWorkspace();
    }
  });
});

compareButton.addEventListener("click", () => {
  setMode("compare");
  document.getElementById("comparePanel")?.scrollIntoView({ behavior: "smooth", block: "center" });
});

overlayToggleButton.addEventListener("click", () => {
  overlayToolControl?.classList.toggle("is-open");
  overlayToggleButton.setAttribute("aria-expanded", String(overlayToolControl?.classList.contains("is-open")));
});

overlayColorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    overlayColor = button.dataset.overlayColor || "amber";
    overlayVisible = true;
    overlayToolControl?.classList.remove("is-open");
    overlayToggleButton.setAttribute("aria-expanded", "false");
    updateOverlayVisibility();
    updateOverlayColor();
  });
});

document.addEventListener("click", (event) => {
  if (!overlayToolControl?.contains(event.target)) {
    overlayToolControl?.classList.remove("is-open");
    overlayToggleButton.setAttribute("aria-expanded", "false");
  }
});

compareControls.forEach((control) => {
  control.addEventListener("input", () => {
    const key = control.dataset.compareControl;
    pushToolHistory();
    compareState[key] = Number(control.value);
    syncCompareControls(key);
    applyCompareTransform();
  });
});

compareActions.forEach((button) => {
  button.addEventListener("click", () => {
    pushToolHistory();
    if (button.dataset.compareAction === "fit") {
      fitCompareDrawing();
      return;
    }
    if (button.dataset.compareAction === "center") {
      centerCompareDrawing();
      return;
    }
    if (button.dataset.compareAction === "swap") {
      swapCompareLayers();
      return;
    }
    resetCompareTransform();
  });
});

compareBlendButtons.forEach((button) => {
  button.addEventListener("click", () => {
    pushToolHistory();
    compareState.blend = button.dataset.compareBlend || "multiply";
    updateBlendButtons();
    applyCompareTransform();
  });
});

nudgeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    pushToolHistory();
    nudgeCompareDrawing(button.dataset.nudge);
  });
});

perspectiveControls.forEach((control) => {
  control.addEventListener("input", () => {
    const key = control.dataset.perspectiveControl;
    pushToolHistory();
    perspectiveState[key] = Number(control.value);
    updatePerspectiveUI();
  });
});

perspectiveModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    pushToolHistory();
    perspectiveState.mode = button.dataset.perspectiveMode || "one";
    if (perspectiveState.mode === "two" && (perspectiveState.left < 0 || perspectiveState.right > 100)) {
      perspectiveState.left = 18;
      perspectiveState.right = 82;
    }
    updatePerspectiveUI();
  });
});

perspectiveRayButtons.forEach((button) => {
  button.addEventListener("click", () => {
    pushToolHistory();
    const direction = button.dataset.perspectiveRays;
    const delta = direction === "increase" ? 2 : -2;
    perspectiveState.rayCount = clamp(perspectiveState.rayCount + delta, 2, 12);
    updatePerspectiveUI();
  });
});

perspectiveBeamButtons.forEach((button) => {
  button.addEventListener("click", () => {
    pushToolHistory();
    const key = button.dataset.perspectiveBeam === "right" ? "showRight" : "showLeft";
    perspectiveState[key] = !perspectiveState[key];
    updatePerspectiveUI();
  });
});

perspectiveAutoButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (!hasImage || isPerspectiveAutoLoading) return;
    pushToolHistory();
    await autoAlignPerspective();
  });
});

[perspectiveHorizon, vpCenterMarker, vpLeftMarker, vpRightMarker].filter(Boolean).forEach((handle) => {
  handle.addEventListener("pointerdown", startPerspectiveHorizonDrag);
});

canonControls.forEach((control) => {
  control.addEventListener("input", () => {
    const key = control.dataset.canonControl;
    pushToolHistory();
    canonState[key] = Number(control.value);
    if (key === "scale") {
      canonState.scaleTouched = true;
    }
    updateCanonUI();
  });
});

canonViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    pushToolHistory();
    canonState.view = button.dataset.canonView || "front";
    updateCanonUI();
  });
});

canonGuideButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.canonGuide;
    if (!key) {
      return;
    }
    pushToolHistory();
    canonState[key] = !canonState[key];
    updateCanonUI();
  });
});

canonActions.forEach((button) => {
  button.addEventListener("click", () => {
    pushToolHistory();
    if (button.dataset.canonAction === "center") {
      canonState.x = 0;
      canonState.y = 0;
    } else {
      canonState = { view: canonState.view, scale: 100, x: 0, y: 0, opacity: 72, eyes: false, mouth: false, widths: false, scaleTouched: false };
    }
    updateCanonUI();
  });
});

bodyControls.forEach((control) => {
  control.addEventListener("input", () => {
    const key = control.dataset.bodyControl;
    pushToolHistory();
    bodyState[key] = Number(control.value);
    updateBodyCanonUI();
  });
});

bodyViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    pushToolHistory();
    bodyState.view = button.dataset.bodyView || "front";
    updateBodyCanonUI();
  });
});

bodyActions.forEach((button) => {
  button.addEventListener("click", () => {
    pushToolHistory();
    if (button.dataset.bodyAction === "center") {
      bodyState.x = 0;
      bodyState.y = 0;
    } else {
      bodyState = { view: bodyState.view, scale: 100, x: 0, y: 0, opacity: 70 };
    }
    updateBodyCanonUI();
  });
});

compareStage.addEventListener("pointerdown", handleComparePointerDown);
compareStage.addEventListener("pointermove", handleComparePointerMove);
compareStage.addEventListener("pointerup", handleComparePointerEnd);
compareStage.addEventListener("pointercancel", handleComparePointerEnd);
canonSystem?.addEventListener("pointerdown", handleCanonPointerDown);
canonSystem?.addEventListener("pointermove", handleCanonPointerMove);
canonSystem?.addEventListener("pointerup", handleCanonPointerEnd);
canonSystem?.addEventListener("pointercancel", handleCanonPointerEnd);
bodyCanonSystem?.addEventListener("pointerdown", handleCanonPointerDown);
bodyCanonSystem?.addEventListener("pointermove", handleCanonPointerMove);
bodyCanonSystem?.addEventListener("pointerup", handleCanonPointerEnd);
bodyCanonSystem?.addEventListener("pointercancel", handleCanonPointerEnd);
window.addEventListener("resize", () => {
  updatePerspectiveRays();
  updateCanonUI();
  updateBodyCanonUI();
});

function openFilePicker(input) {
  input.value = "";
  input.click();
}

function showDrawing(file) {
  if (activeMode === "compare") {
    setMode(lastPreviewMode);
  }

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
  }

  currentObjectUrl = URL.createObjectURL(file);
  drawingPreview.onload = () => {
    hasImage = true;
    drawingStage.classList.add("has-image");
    runButton.disabled = activeMode === "canon3d";
    clearButton.disabled = false;
    resetButton.disabled = false;
    readinessBadge.textContent = "Ready";
    currentDrawingRead = analyzeDrawingImage();
    workspaceHint.textContent = currentDrawingRead.confidence === "low"
      ? "Drawing loaded, but the read is low-confidence. Use a clearer photo or darker sketch lines if needed."
      : "Drawing loaded. Switch modes or run the structure check.";
    updateOverlayVisibility();
    updatePerspectiveRays();
    applyModeResult(false);
    updateWorkspaceToolButtons();
  };
  drawingPreview.onerror = () => {
    resetDrawing();
    workspaceHint.textContent = "Could not load that image. Try another JPG, PNG, or WebP.";
  };
  drawingPreview.src = currentObjectUrl;
}

function showCompareImage(kind, file) {
  const image = kind === "reference" ? referencePreview : compareDrawingPreview;

  if (kind === "reference" && referenceObjectUrl) {
    URL.revokeObjectURL(referenceObjectUrl);
  }
  if (kind === "drawing" && compareDrawingObjectUrl) {
    URL.revokeObjectURL(compareDrawingObjectUrl);
  }

  const objectUrl = URL.createObjectURL(file);
  if (kind === "reference") {
    referenceObjectUrl = objectUrl;
  } else {
    compareDrawingObjectUrl = objectUrl;
  }

  image.onload = () => {
    image.classList.add("is-loaded");
    if (kind === "reference") {
      hasReferenceImage = true;
    } else {
      hasCompareDrawing = true;
    }
    clearButton.disabled = false;
    resetButton.disabled = false;
    runButton.disabled = true;
    updateCompareUI();
  };
  image.onerror = () => {
    image.classList.remove("is-loaded");
    image.removeAttribute("src");
    if (kind === "reference") {
      hasReferenceImage = false;
      referenceObjectUrl = null;
    } else {
      hasCompareDrawing = false;
      compareDrawingObjectUrl = null;
    }
    updateCompareUI();
  };
  image.src = objectUrl;
  setMode("compare");
}

function resetActiveWorkspace() {
  if (activeMode === "compare") {
    resetCompareMode();
    return;
  }
  resetDrawing();
}

function resetDrawing() {
  drawingFileInput.value = "";
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }

  hasImage = false;
  currentDrawingRead = null;
  drawingPreview.onload = null;
  drawingPreview.onerror = null;
  drawingPreview.removeAttribute("src");
  drawingStage.classList.remove("has-image");
  runButton.disabled = true;
  clearButton.disabled = true;
  resetButton.disabled = true;
  readinessBadge.textContent = "Waiting";
  structureScore.textContent = "--";
  structureVerdict.textContent = "Upload a drawing to start.";
  scoreFill.style.width = "0%";
  envelopeMetric.textContent = "--";
  axisMetric.textContent = "--";
  angleMetric.textContent = "--";
  workspaceHint.textContent = "Upload a sketch, study, or reference to inspect the drawing structure.";
  applyModeResult(false);
  updateOverlayVisibility();
  toolHistory = [];
  updateWorkspaceToolButtons();
}

function resetCompareMode() {
  referenceFileInput.value = "";
  compareDrawingFileInput.value = "";

  if (referenceObjectUrl) {
    URL.revokeObjectURL(referenceObjectUrl);
    referenceObjectUrl = null;
  }
  if (compareDrawingObjectUrl) {
    URL.revokeObjectURL(compareDrawingObjectUrl);
    compareDrawingObjectUrl = null;
  }

  hasReferenceImage = false;
  hasCompareDrawing = false;
  referencePreview.classList.remove("is-loaded");
  compareDrawingPreview.classList.remove("is-loaded");
  referencePreview.removeAttribute("src");
  compareDrawingPreview.removeAttribute("src");
  resetCompareTransform();
  toolHistory = [];
  updateCompareUI();
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function getToolSnapshot() {
  return {
    mode: activeMode,
    compareState: clonePlain(compareState),
    perspectiveState: clonePlain(perspectiveState),
    canonState: clonePlain(canonState),
    bodyState: clonePlain(bodyState),
    overlayVisible,
    overlayColor
  };
}

function pushToolHistory() {
  const latest = getToolSnapshot();
  const previous = toolHistory[toolHistory.length - 1];
  if (previous && JSON.stringify(previous) === JSON.stringify(latest)) {
    return;
  }
  toolHistory.push(latest);
  if (toolHistory.length > 40) {
    toolHistory.shift();
  }
  updateWorkspaceToolButtons();
}

function restoreToolSnapshot(snapshot) {
  if (!snapshot) return;
  compareState = clonePlain(snapshot.compareState);
  perspectiveState = normalizePerspectiveState(clonePlain(snapshot.perspectiveState));
  canonState = clonePlain(snapshot.canonState);
  bodyState = clonePlain(snapshot.bodyState);
  overlayVisible = snapshot.overlayVisible;
  overlayColor = snapshot.overlayColor;
  setMode(snapshot.mode);
  syncAllCompareControls();
  updateBlendButtons();
  applyCompareTransform();
  updatePerspectiveUI();
  updateCanonUI();
  updateBodyCanonUI();
  updateOverlayVisibility();
  updateOverlayColor();
}

function normalizePerspectiveState(state) {
  const fallbackSpread = Number(state?.spread ?? 54);
  return {
    mode: state?.mode || "one",
    horizon: Number(state?.horizon ?? 48),
    center: Number(state?.center ?? 50),
    left: Number(state?.left ?? 18),
    right: Number(state?.right ?? 82),
    rayCount: Number(state?.rayCount ?? 4),
    leftSpread: Number(state?.leftSpread ?? fallbackSpread),
    rightSpread: Number(state?.rightSpread ?? fallbackSpread),
    showLeft: state?.showLeft !== false,
    showRight: state?.showRight !== false,
    opacity: Number(state?.opacity ?? 68)
  };
}

function undoToolChange() {
  const snapshot = toolHistory.pop();
  restoreToolSnapshot(snapshot);
  updateWorkspaceToolButtons();
}

function currentWorkspaceHasExportableContent() {
  if (activeMode === "compare") {
    return hasReferenceImage || hasCompareDrawing;
  }
  return hasImage;
}

function updateWorkspaceToolButtons() {
  const hasWorkspace = currentWorkspaceHasExportableContent();
  workspaceActionButtons.forEach((button) => {
    const action = button.dataset.workspaceAction;
    if (action === "undo") {
      button.disabled = toolHistory.length === 0;
    } else if (action === "center") {
      button.disabled = !hasWorkspace || activeMode === "perspective" || (activeMode === "compare" && !hasCompareDrawing);
    } else {
      button.disabled = !hasWorkspace;
    }
  });
}

function centerActiveTool() {
  if (!currentWorkspaceHasExportableContent() || activeMode === "perspective") return;
  pushToolHistory();
  if (activeMode === "compare") {
    centerCompareDrawing();
  } else if (activeMode === "canon") {
    canonState.x = 0;
    canonState.y = 0;
    updateCanonUI();
  } else if (activeMode === "body") {
    bodyState.x = 0;
    bodyState.y = 0;
    updateBodyCanonUI();
  }
}

function resetActiveToolSettings() {
  if (!currentWorkspaceHasExportableContent()) return;
  pushToolHistory();
  if (activeMode === "compare") {
    resetCompareTransform();
  } else if (activeMode === "perspective") {
    perspectiveState = { mode: "one", horizon: 48, center: 50, left: 18, right: 82, rayCount: 4, leftSpread: 54, rightSpread: 54, showLeft: true, showRight: true, opacity: 68 };
    updatePerspectiveUI();
  } else if (activeMode === "canon") {
    canonState = { view: canonState.view, scale: 100, x: 0, y: 0, opacity: 72, eyes: false, mouth: false, widths: false, scaleTouched: false };
    updateCanonUI();
  } else if (activeMode === "body") {
    bodyState = { view: bodyState.view, scale: 100, x: 0, y: 0, opacity: 70 };
    updateBodyCanonUI();
  }
  updateWorkspaceToolButtons();
}

function exportCurrentWorkspace() {
  if (!currentWorkspaceHasExportableContent()) return;

  const canvas = createWorkspaceExportCanvas();
  if (!canvas) return;

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `m8-drawing-${activeMode}-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }, "image/png");
}

function createWorkspaceExportCanvas() {
  const stageRect = drawingStage.getBoundingClientRect();
  const ratio = stageRect.width && stageRect.height ? stageRect.height / stageRect.width : 1.18;
  const width = 1600;
  const contentHeight = Math.round(clamp(width * ratio, 1, 2600));
  const footerHeight = Math.max(86, Math.round(width * 0.07));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = contentHeight + footerHeight;
  const context = canvas.getContext("2d");
  const scale = width / Math.max(1, stageRect.width || width);
  context.fillStyle = "#15120f";
  context.fillRect(0, 0, width, contentHeight);

  if (activeMode === "compare") {
    drawCompareExport(context, stageRect, scale);
  } else {
    drawDrawingStageExport(context, stageRect, scale);

    if (activeMode === "perspective") {
      drawPerspectiveExport(context, width, contentHeight);
    } else if (activeMode === "canon") {
      drawHeadCanonExport(context, stageRect, scale);
    } else if (activeMode === "body") {
      drawBodyCanonExport(context, stageRect, scale);
    }
  }

  drawDrawingExportFooter(context, width, contentHeight, footerHeight);
  return canvas;
}

function drawDrawingStageExport(context, stageRect, scale) {
  if (!drawingPreview.naturalWidth || !drawingPreview.naturalHeight) return;
  const rect = getRenderedImageRect(drawingPreview, stageRect, scale);
  context.drawImage(drawingPreview, rect.x, rect.y, rect.width, rect.height);
}

function drawCompareExport(context, stageRect, scale) {
  const width = Math.round(stageRect.width * scale);
  const height = Math.round(stageRect.height * scale);
  context.fillStyle = "#15120f";
  context.fillRect(0, 0, width, height);

  if (hasReferenceImage && referencePreview.naturalWidth && referencePreview.naturalHeight) {
    const rect = getRenderedImageRect(referencePreview, stageRect, scale);
    context.drawImage(referencePreview, rect.x, rect.y, rect.width, rect.height);
  }

  if (!hasCompareDrawing || !compareDrawingPreview.naturalWidth || !compareDrawingPreview.naturalHeight) {
    return;
  }

  const rect = getRenderedImageRect(compareDrawingPreview, stageRect, scale);
  context.save();
  context.globalAlpha = compareState.opacity / 100;
  context.globalCompositeOperation = ["multiply", "difference", "screen"].includes(compareState.blend)
    ? compareState.blend
    : "source-over";
  context.drawImage(compareDrawingPreview, rect.x, rect.y, rect.width, rect.height);
  context.restore();
  context.globalCompositeOperation = "source-over";
}

function drawPerspectiveExport(context, width, height) {
  context.save();
  context.strokeStyle = "rgba(201, 106, 61, 0.92)";
  context.fillStyle = "rgba(255, 250, 245, 0.95)";
  context.lineWidth = 4;
  const horizonY = height * (perspectiveState.horizon / 100);
  line(context, 0, horizonY, width, horizonY);

  const origins = perspectiveState.mode === "one"
    ? [{ x: width * (perspectiveState.center / 100), y: horizonY }]
    : [
        { x: width * (perspectiveState.left / 100), y: horizonY },
        { x: width * (perspectiveState.right / 100), y: horizonY }
      ];
  const rayCount = clamp(perspectiveState.rayCount, 2, 12);
  origins.forEach((origin, originIndex) => {
    if (perspectiveState.mode === "two" && originIndex === 0 && perspectiveState.showLeft === false) return;
    if (perspectiveState.mode === "two" && originIndex === 1 && perspectiveState.showRight === false) return;
    context.beginPath();
    context.arc(origin.x, origin.y, 12, 0, Math.PI * 2);
    context.fill();
    const targets = perspectiveState.mode === "one"
      ? createSplitOnePointTargets(rayCount, width, height, origin)
      : createVanishingTargets(rayCount, width, height, originIndex === 0 ? "right" : "left", originIndex === 0 ? perspectiveState.leftSpread : perspectiveState.rightSpread, origin);
    targets.forEach((target) => line(context, origin.x, origin.y, target.x, target.y));
  });
  context.restore();
}

function drawHeadCanonExport(context, stageRect, scale) {
  const rect = getElementExportRect(canonBoard, stageRect, scale);
  if (!rect.width || !rect.height) return;
  const colors = getOverlayExportColors();
  context.save();
  context.globalAlpha = canonState.opacity / 100;
  context.lineCap = "butt";
  context.strokeStyle = colors.line;
  context.lineWidth = 4 * scale;
  context.strokeRect(rect.x, rect.y, rect.width, rect.height);

  const hardLine = (x1, y1, x2, y2) => {
    context.strokeStyle = colors.accent;
    context.lineWidth = 3 * scale;
    line(context, x1, y1, x2, y2);
  };
  const softLine = (x1, y1, x2, y2) => {
    context.strokeStyle = colors.soft;
    context.lineWidth = 2 * scale;
    line(context, x1, y1, x2, y2);
  };
  const detailLine = (x1, y1, x2, y2) => {
    context.strokeStyle = colors.strong;
    context.lineWidth = 1.5 * scale;
    context.setLineDash([8 * scale, 6 * scale]);
    line(context, x1, y1, x2, y2);
    context.setLineDash([]);
  };

  [0.5, 1.5, 2.5].forEach((unit) => hardLine(rect.x, rect.y + rect.height * (unit / 3.5), rect.x + rect.width, rect.y + rect.height * (unit / 3.5)));
  hardLine(rect.x, rect.y + rect.height, rect.x + rect.width, rect.y + rect.height);

  if (canonState.view === "front") {
    softLine(rect.x + rect.width * 0.2, rect.y, rect.x + rect.width * 0.2, rect.y + rect.height);
    hardLine(rect.x + rect.width * 0.6, rect.y, rect.x + rect.width * 0.6, rect.y + rect.height);
    if (canonState.widths) {
      [0.2, 0.4, 0.6, 0.8].forEach((ratio) => detailLine(rect.x + rect.width * ratio, rect.y, rect.x + rect.width * ratio, rect.y + rect.height));
    }
  } else {
    softLine(rect.x + rect.width * (1 / 3.5), rect.y, rect.x + rect.width * (1 / 3.5), rect.y + rect.height);
    hardLine(rect.x + rect.width * (2 / 3.5), rect.y, rect.x + rect.width * (2 / 3.5), rect.y + rect.height);
    softLine(rect.x + rect.width * (3 / 3.5), rect.y, rect.x + rect.width * (3 / 3.5), rect.y + rect.height);
    if (canonState.widths) {
      [1 / 10.5, 2 / 10.5].forEach((ratio) => detailLine(rect.x + rect.width * ratio, rect.y, rect.x + rect.width * ratio, rect.y + rect.height));
    }
  }

  if (canonState.eyes) detailLine(rect.x, rect.y + rect.height * 0.5, rect.x + rect.width, rect.y + rect.height * 0.5);
  if (canonState.mouth) detailLine(rect.x, rect.y + rect.height * (3 / 3.5), rect.x + rect.width, rect.y + rect.height * (3 / 3.5));
  drawVisibleExportLabels(context, canonBoard, stageRect, scale);
  context.restore();
}

function drawBodyCanonExport(context, stageRect, scale) {
  const rect = getElementExportRect(bodyCanonBoard, stageRect, scale);
  if (!rect.width || !rect.height) return;

  context.save();
  context.globalAlpha = bodyState.opacity / 100;
  context.strokeStyle = "rgba(255, 250, 245, 0.82)";
  context.lineWidth = 4 * scale;
  context.strokeRect(rect.x, rect.y, rect.width, rect.height);
  context.strokeStyle = "rgba(201, 106, 61, 0.84)";
  context.lineWidth = 2.5 * scale;
  for (let index = 1; index < 8; index += 1) {
    const yLine = rect.y + rect.height * (index / 8);
    line(context, rect.x, yLine, rect.x + rect.width, yLine);
  }
  context.strokeStyle = "rgba(255, 250, 245, 0.82)";
  line(context, rect.x + rect.width / 2, rect.y, rect.x + rect.width / 2, rect.y + rect.height);
  context.restore();
}

function getRenderedImageRect(image, stageRect, scale) {
  const elementRect = image.getBoundingClientRect();
  const box = getElementExportRect(image, stageRect, scale);
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const boxRatio = elementRect.width / Math.max(1, elementRect.height);
  const drawWidth = imageRatio > boxRatio ? box.width : box.height * imageRatio;
  const drawHeight = imageRatio > boxRatio ? box.width / imageRatio : box.height;
  return {
    x: box.x + (box.width - drawWidth) / 2,
    y: box.y + (box.height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight
  };
}

function getElementExportRect(element, stageRect, scale) {
  if (!element) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  const rect = element.getBoundingClientRect();
  return {
    x: (rect.left - stageRect.left) * scale,
    y: (rect.top - stageRect.top) * scale,
    width: rect.width * scale,
    height: rect.height * scale
  };
}

function getOverlayExportColors() {
  const style = getComputedStyle(drawingOverlay);
  return {
    line: style.getPropertyValue("--overlay-line").trim() || "rgba(61, 142, 166, 0.92)",
    soft: style.getPropertyValue("--overlay-line-soft").trim() || "rgba(61, 142, 166, 0.66)",
    accent: style.getPropertyValue("--overlay-accent").trim() || "rgba(81, 171, 196, 0.9)",
    strong: style.getPropertyValue("--overlay-accent-strong").trim() || "rgba(43, 119, 146, 0.98)"
  };
}

function drawVisibleExportLabels(context, container, stageRect, scale) {
  const labels = Array.from(container.querySelectorAll(".canon-label, .canon-third-label"))
    .filter((label) => getComputedStyle(label).display !== "none");
  labels.forEach((label) => {
    const rect = getElementExportRect(label, stageRect, scale);
    const text = label.textContent.trim();
    if (!text || !rect.width || !rect.height) return;
    const radius = rect.height / 2;
    context.save();
    context.globalAlpha = canonState.opacity / 100;
    context.fillStyle = "rgba(31, 28, 24, 0.68)";
    roundedRect(context, rect.x, rect.y, rect.width, rect.height, radius);
    context.fill();
    context.strokeStyle = "rgba(61, 142, 166, 0.72)";
    context.lineWidth = Math.max(1, scale);
    context.stroke();
    context.fillStyle = "#fffaf5";
    context.font = `800 ${Math.max(9, rect.height * 0.46)}px Segoe UI`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text.toUpperCase(), rect.x + rect.width / 2, rect.y + rect.height / 2 + rect.height * 0.04, rect.width * 0.88);
    context.restore();
  });
}

function drawDrawingExportFooter(context, width, contentHeight, footerHeight) {
  context.fillStyle = "#f4efe6";
  context.fillRect(0, contentHeight, width, footerHeight);
  context.strokeStyle = "rgba(50, 44, 38, 0.12)";
  context.lineWidth = 1;
  line(context, 0, contentHeight + 0.5, width, contentHeight + 0.5);
  const paddingX = Math.max(28, Math.round(width * 0.035));
  const footerBaseY = contentHeight + Math.round(footerHeight * 0.38);
  context.fillStyle = "rgba(31, 28, 24, 0.78)";
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.font = `600 ${Math.max(20, Math.round(width * 0.018))}px Segoe UI`;
  context.fillText("www.mateartwork.com", paddingX, footerBaseY);
  context.font = `500 ${Math.max(16, Math.round(width * 0.014))}px Segoe UI`;
  context.fillStyle = "rgba(31, 28, 24, 0.62)";
  context.fillText("Created with M8 Drawing Checker", paddingX, footerBaseY + Math.max(24, Math.round(footerHeight * 0.28)));
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function line(context, x1, y1, x2, y2) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function setMode(mode) {
  if (!MODE_COPY[mode]) return;
  activeMode = mode;
  if (DRAWING_PREVIEW_MODES.has(mode)) {
    lastPreviewMode = mode;
  }
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  drawingOverlay.className = `drawing-overlay mode-${mode} perspective-${perspectiveState.mode} canon-${canonState.view} body-${bodyState.view}`;
  drawingStage.classList.toggle("compare-mode", mode === "compare");
  drawingStage.classList.toggle("canon3d-mode", mode === "canon3d");
  appShell?.classList.toggle("compare-active", mode === "compare");
  if (appShell) {
    appShell.dataset.mode = mode;
    appShell.dataset.perspectiveMode = perspectiveState.mode;
    appShell.dataset.canonView = canonState.view;
    appShell.dataset.bodyView = bodyState.view;
  }
  workspaceTitle.textContent = MODE_COPY[mode].title;
  panelTitle.textContent = MODE_COPY[mode].panel;
  workspaceHint.textContent = hasImage || mode === "compare" || mode === "canon3d"
    ? MODE_COPY[mode].hint
    : "Upload a sketch, study, or reference to inspect the drawing structure.";
  updateAnalysisLabels(mode);

  if (mode === "compare") {
    runButton.disabled = true;
    clearButton.disabled = !(hasReferenceImage || hasCompareDrawing);
    resetButton.disabled = !(hasReferenceImage || hasCompareDrawing);
    applyModeResult(false);
    updateCompareUI();
  } else if (mode === "canon3d") {
    runButton.disabled = true;
    clearButton.disabled = true;
    resetButton.disabled = true;
    applyModeResult(false);
  } else {
    runButton.disabled = !hasImage;
    clearButton.disabled = !hasImage;
    resetButton.disabled = !hasImage;
    applyModeResult(false);
  }

  updateOverlayVisibility();
  updatePerspectiveUI();
  updateCanonUI();
  updateBodyCanonUI();
  updateWorkspaceToolButtons();
  window.dispatchEvent(new CustomEvent("m8:modechange", { detail: { mode } }));
}

function updateAnalysisLabels(mode) {
  if (mode === "proportion") {
    proportionLabel.textContent = "Envelope";
    angleLabel.textContent = "Center Split";
    alignmentLabel.textContent = "Big Mass Split";
    return;
  }

  if (mode === "perspective") {
    proportionLabel.textContent = "Horizon";
    angleLabel.textContent = "Edge Families";
    alignmentLabel.textContent = "Vanishing Check";
    return;
  }

  if (mode === "canon") {
    proportionLabel.textContent = "Head Height";
    angleLabel.textContent = "Feature Lines";
    alignmentLabel.textContent = "View Fit";
    return;
  }

  if (mode === "body") {
    proportionLabel.textContent = "Figure Height";
    angleLabel.textContent = "Landmark Lines";
    alignmentLabel.textContent = "Body Fit";
    return;
  }

  if (mode === "canon3d") {
    proportionLabel.textContent = "Depth Grid";
    angleLabel.textContent = "View Turn";
    alignmentLabel.textContent = "Planes";
    return;
  }

  proportionLabel.textContent = "Proportions";
  angleLabel.textContent = "Angles";
  alignmentLabel.textContent = "Alignment";
}

function applyModeResult(markComplete) {
  const copy = MODE_COPY[activeMode];
  if (activeMode === "compare") {
    structureScore.textContent = "--";
    structureVerdict.textContent = "Manual overlay comparison mode.";
    scoreFill.style.width = "0%";
    envelopeMetric.textContent = "--";
    axisMetric.textContent = "--";
    angleMetric.textContent = "--";
    updateProportionToolkit(null);
    proportionRead.textContent = copy.proportion;
    angleRead.textContent = copy.angle;
    alignmentRead.textContent = copy.alignment;
    fixRead.textContent = copy.fix;
    return;
  }

  if (activeMode === "canon3d") {
    structureScore.textContent = "--";
    structureVerdict.textContent = "Interactive 3D canon mode.";
    scoreFill.style.width = "0%";
    envelopeMetric.textContent = "--";
    axisMetric.textContent = "--";
    angleMetric.textContent = "--";
    updateProportionToolkit(null);
    proportionRead.textContent = copy.proportion;
    angleRead.textContent = copy.angle;
    alignmentRead.textContent = copy.alignment;
    fixRead.textContent = copy.fix;
    readinessBadge.textContent = "3D";
    return;
  }

  if (!hasImage) {
    envelopeMetric.textContent = "--";
    axisMetric.textContent = "--";
    angleMetric.textContent = "--";
    updateProportionToolkit(null);
    proportionRead.textContent = "Check the big height-width relationships and major shape divisions.";
    angleRead.textContent = "Compare the main tilts and directional lines before refining details.";
    alignmentRead.textContent = "Use center axes and landmarks to see whether the drawing is drifting.";
    fixRead.textContent = "The first fix will appear here after upload.";
    return;
  }

  const read = currentDrawingRead || analyzeDrawingImage();
  currentDrawingRead = read;
  const modeRead = buildModeRead(activeMode, read);
  structureScore.textContent = String(modeRead.score);
  structureVerdict.textContent = markComplete ? modeRead.verdict : modeRead.preview;
  scoreFill.style.width = `${modeRead.score}%`;
  envelopeMetric.textContent = read.envelopeLabel;
  axisMetric.textContent = read.driftLabel;
  angleMetric.textContent = read.angleLabel;
  updateProportionToolkit(activeMode === "proportion" ? read : null);
  proportionRead.textContent = modeRead.proportion;
  angleRead.textContent = modeRead.angle;
  alignmentRead.textContent = modeRead.alignment;
  fixRead.textContent = modeRead.fix;
  readinessBadge.textContent = markComplete ? "Checked" : "Ready";
}

function updateOverlayVisibility() {
  drawingOverlay.classList.toggle("is-visible", hasImage && overlayVisible && activeMode !== "compare" && activeMode !== "canon3d");
  overlayToggleButton.classList.toggle("is-active", overlayVisible);
  overlayToggleButton.disabled = activeMode === "compare" || activeMode === "canon3d";
  updateOverlayColor();
}

function updateOverlayColor() {
  drawingOverlay.classList.toggle("overlay-dark", overlayColor === "dark");
  drawingOverlay.classList.toggle("overlay-white", overlayColor === "white");
  drawingOverlay.classList.toggle("overlay-blue", overlayColor === "blue");
  overlayColorButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.overlayColor === overlayColor);
  });
  if (overlaySelectedDot) {
    overlaySelectedDot.className = `overlay-selected-dot overlay-color-${overlayColor}`;
  }
}

function updatePerspectiveUI() {
  const isOnePoint = perspectiveState.mode === "one";
  ensurePerspectiveRayPool();
  drawingOverlay.classList.toggle("perspective-one", isOnePoint);
  drawingOverlay.classList.toggle("perspective-two", !isOnePoint);
  drawingOverlay.classList.toggle("hide-left-beams", !perspectiveState.showLeft);
  drawingOverlay.classList.toggle("hide-right-beams", !perspectiveState.showRight);
  drawingOverlay.style.setProperty("--perspective-horizon", `${perspectiveState.horizon}%`);
  drawingOverlay.style.setProperty("--vp-center-x", `${perspectiveState.center}%`);
  drawingOverlay.style.setProperty("--vp-left-x", `${perspectiveState.left}%`);
  drawingOverlay.style.setProperty("--vp-right-x", `${perspectiveState.right}%`);
  drawingOverlay.style.setProperty("--perspective-opacity", String(perspectiveState.opacity / 100));

  if (appShell) {
    appShell.dataset.perspectiveMode = perspectiveState.mode;
  }

  perspectiveModeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.perspectiveMode === perspectiveState.mode);
  });
  perspectiveBeamButtons.forEach((button) => {
    const key = button.dataset.perspectiveBeam === "right" ? "showRight" : "showLeft";
    const isActive = perspectiveState[key] !== false;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  perspectiveControls.forEach((control) => {
    const key = control.dataset.perspectiveControl;
    control.value = String(perspectiveState[key]);
  });
  perspectiveRayCountStats.forEach((stat) => {
    stat.textContent = String(perspectiveState.rayCount);
  });

  perspectiveModeBadge.textContent = isOnePoint ? "1 VP" : "2 VP";
  perspectiveModeStat.textContent = isOnePoint ? "One point" : "Two point";
  perspectiveHorizonStat.textContent = `${perspectiveState.horizon}%`;
  perspectiveCheckStat.textContent = isOnePoint ? "Depth edges" : "Left / right edges";
  if (activeMode === "perspective" && hasImage) {
    applyModeResult(false);
  }
  requestAnimationFrame(updatePerspectiveRays);
}

async function autoAlignPerspective() {
  const localFit = estimatePerspectiveFromImage();
  const requestId = perspectiveAutoRequestId + 1;
  perspectiveAutoRequestId = requestId;
  isPerspectiveAutoLoading = true;
  setPerspectiveAutoLoading(true);
  workspaceHint.textContent = "AI perspective align is reading the main edge families...";

  try {
    const aiFit = await requestAiPerspectiveAlignment(localFit);
    if (requestId !== perspectiveAutoRequestId) {
      return;
    }
    if (aiFit) {
      applyPerspectiveFit(aiFit);
      workspaceHint.textContent = aiFit.confidence >= 0.68
        ? "AI align set the perspective from the visible edge families. Fine tune only if needed."
        : "AI align set a best-read start. Fine tune the left and right beams against the drawing edges.";
      return;
    }
  } catch (error) {
    console.warn(error);
  } finally {
    if (requestId === perspectiveAutoRequestId) {
      isPerspectiveAutoLoading = false;
      setPerspectiveAutoLoading(false);
    }
  }

  if (requestId !== perspectiveAutoRequestId) {
    return;
  }

  const fit = localFit;
  if (!fit) {
    workspaceHint.textContent = "AI align is unavailable and offline auto needs clearer diagonal edges. Use the manual VP controls.";
    updatePerspectiveUI();
    return;
  }

  applyPerspectiveFit(fit);
  workspaceHint.textContent = "AI align is unavailable, so offline auto set a conservative start. Fine tune the beams manually.";
}

function applyPerspectiveFit(fit) {
  perspectiveState = {
    ...perspectiveState,
    mode: fit.mode === "one" ? "one" : "two",
    horizon: clamp(Math.round(Number(fit.horizon)), 8, 92),
    left: clamp(Math.round(Number(fit.left)), -220, 45),
    right: clamp(Math.round(Number(fit.right)), 55, 260),
    center: clamp(Math.round(Number(fit.center)), 0, 100),
    leftSpread: clamp(Math.round(Number(fit.leftSpread)), 20, 100),
    rightSpread: clamp(Math.round(Number(fit.rightSpread)), 20, 100),
    rayCount: clamp(Math.round(Number(fit.rayCount)), 2, 12)
  };
  updatePerspectiveUI();
}

function setPerspectiveAutoLoading(isLoading) {
  perspectiveAutoButtons.forEach((button) => {
    button.disabled = isLoading;
    const isMobileButton = button.classList.contains("mobile-perspective-auto");
    button.textContent = isLoading
      ? (isMobileButton ? "AI..." : "AI aligning...")
      : (isMobileButton ? "Auto" : "Auto align");
  });
}

async function requestAiPerspectiveAlignment(localEstimate) {
  const image = createPerspectiveAlignmentImageDataUrl();
  if (!image) {
    return null;
  }

  const response = await fetch(PERSPECTIVE_ALIGN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ image, localEstimate })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Perspective AI alignment failed.");
  }
  return data.alignment || null;
}

function createPerspectiveAlignmentImageDataUrl() {
  if (!drawingPreview.naturalWidth || !drawingPreview.naturalHeight) {
    return "";
  }

  const scale = Math.min(1, AI_PERSPECTIVE_IMAGE_MAX_DIMENSION / Math.max(drawingPreview.naturalWidth, drawingPreview.naturalHeight));
  const width = Math.max(1, Math.round(drawingPreview.naturalWidth * scale));
  const height = Math.max(1, Math.round(drawingPreview.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(drawingPreview, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", AI_PERSPECTIVE_IMAGE_QUALITY);
}

function estimatePerspectiveFromImage() {
  if (!drawingPreview.naturalWidth || !drawingPreview.naturalHeight) {
    return null;
  }

  const sampleWidth = 220;
  const scale = sampleWidth / drawingPreview.naturalWidth;
  const sampleHeight = Math.max(1, Math.round(drawingPreview.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, sampleWidth, sampleHeight);
  context.drawImage(drawingPreview, 0, 0, sampleWidth, sampleHeight);
  const image = context.getImageData(0, 0, sampleWidth, sampleHeight);
  const luminance = new Float32Array(sampleWidth * sampleHeight);
  for (let index = 0; index < image.data.length; index += 4) {
    const pixel = index / 4;
    luminance[pixel] = 0.2126 * image.data[index] + 0.7152 * image.data[index + 1] + 0.0722 * image.data[index + 2];
  }

  const candidates = [];
  const angleBins = Array.from({ length: 37 }, () => []);
  for (let y = 2; y < sampleHeight - 2; y += 2) {
    for (let x = 2; x < sampleWidth - 2; x += 2) {
      const gx = luminance[y * sampleWidth + x + 1] - luminance[y * sampleWidth + x - 1];
      const gy = luminance[(y + 1) * sampleWidth + x] - luminance[(y - 1) * sampleWidth + x];
      const strength = Math.hypot(gx, gy);
      if (strength < 34) continue;
      const lineAngle = Math.atan2(gy, gx) + Math.PI / 2;
      const degrees = normalizeAngleDegrees(lineAngle * 180 / Math.PI);
      if (degrees < 16 || degrees > 164 || Math.abs(degrees - 90) < 12) continue;
      const point = { x, y, angle: degrees, strength };
      candidates.push(point);
      const bin = clamp(Math.round(degrees / 5), 0, angleBins.length - 1);
      angleBins[bin].push(point);
    }
  }

  if (candidates.length < 80) {
    return null;
  }

  const leftLines = buildDominantPerspectiveLines(angleBins, 20, 78, sampleWidth, sampleHeight);
  const rightLines = buildDominantPerspectiveLines(angleBins, 102, 160, sampleWidth, sampleHeight);
  if (leftLines.length < 2 && rightLines.length < 2) {
    return null;
  }

  const leftVp = estimateVanishingPoint(leftLines, sampleWidth, sampleHeight);
  const rightVp = estimateVanishingPoint(rightLines, sampleWidth, sampleHeight);
  const rawLeftPercent = leftVp ? Math.round((leftVp.x / sampleWidth) * 100) : null;
  const rawRightPercent = rightVp ? Math.round((rightVp.x / sampleWidth) * 100) : null;
  const leftTrusted = rawLeftPercent !== null && rawLeftPercent <= -18;
  const rightTrusted = rawRightPercent !== null && rawRightPercent >= 112;
  const hasLeftFamily = leftLines.length >= 2;
  const hasRightFamily = rightLines.length >= 2;
  if (!hasLeftFamily && !hasRightFamily) return null;

  const fallbackY = clamp(Math.round((median([
    ...(leftVp ? [leftVp.y] : []),
    ...(rightVp ? [rightVp.y] : []),
    sampleHeight * 0.5
  ]) / sampleHeight) * 100), 18, 72);
  const horizon = leftVp && rightVp
    ? clamp(Math.round((((leftVp.y + rightVp.y) / 2 / sampleHeight) * 100)), 18, 72)
    : fallbackY;
  const leftPercent = leftTrusted ? clamp(rawLeftPercent, -120, -18) : -34;
  const rightPercent = rightTrusted ? clamp(rawRightPercent, 112, 220) : 145;
  const centerPercent = hasLeftFamily && hasRightFamily
    ? clamp(Math.round((leftPercent + rightPercent) / 2), 10, 90)
    : perspectiveState.center;
  const leftSpread = leftTrusted ? clamp(estimateSpreadFromAngles(leftLines, 58), 44, 72) : 58;
  const rightSpread = rightTrusted ? estimateSpreadFromAngles(rightLines, 54) : clamp(estimateSpreadFromAngles(rightLines, 54), 42, 68);

  return {
    mode: hasLeftFamily && hasRightFamily ? "two" : "one",
    horizon,
    left: leftPercent,
    right: rightPercent,
    center: centerPercent,
    leftSpread,
    rightSpread,
    rayCount: clamp(Math.max(leftLines.length, rightLines.length, 4), 4, 8)
  };
}

function normalizeAngleDegrees(degrees) {
  let value = degrees % 180;
  if (value < 0) value += 180;
  return value;
}

function buildDominantPerspectiveLines(angleBins, minAngle, maxAngle, width, height) {
  return angleBins
    .map((points, index) => ({ points, angle: index * 5, score: points.reduce((sum, point) => sum + point.strength, 0) }))
    .filter((bin) => bin.angle >= minAngle && bin.angle <= maxAngle && bin.points.length >= 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .map((bin) => fitLineFromPoints(bin.points, width, height))
    .filter(Boolean);
}

function fitLineFromPoints(points, width, height) {
  if (!points.length) return null;
  let sumWeight = 0;
  let meanX = 0;
  let meanY = 0;
  let meanAngle = 0;
  points.forEach((point) => {
    const weight = point.strength;
    sumWeight += weight;
    meanX += point.x * weight;
    meanY += point.y * weight;
    meanAngle += point.angle * weight;
  });
  meanX /= sumWeight;
  meanY /= sumWeight;
  meanAngle /= sumWeight;
  const theta = meanAngle * Math.PI / 180;
  return {
    x: meanX,
    y: meanY,
    angle: meanAngle,
    a: Math.sin(theta),
    b: -Math.cos(theta),
    c: -(Math.sin(theta) * meanX - Math.cos(theta) * meanY),
    weight: sumWeight,
    width,
    height
  };
}

function estimateVanishingPoint(lines, width, height) {
  const intersections = [];
  for (let first = 0; first < lines.length; first += 1) {
    for (let second = first + 1; second < lines.length; second += 1) {
      const point = intersectLines(lines[first], lines[second]);
      if (!point) continue;
      if (point.x < -width * 1.8 || point.x > width * 2.8 || point.y < -height * 0.8 || point.y > height * 1.8) continue;
      intersections.push(point);
    }
  }
  if (!intersections.length) return null;
  return {
    x: median(intersections.map((point) => point.x)),
    y: median(intersections.map((point) => point.y))
  };
}

function intersectLines(first, second) {
  const determinant = first.a * second.b - second.a * first.b;
  if (Math.abs(determinant) < 0.015) return null;
  return {
    x: (first.b * second.c - second.b * first.c) / determinant,
    y: (first.c * second.a - second.c * first.a) / determinant
  };
}

function estimateSpreadFromAngles(lines, fallback) {
  if (lines.length < 2) return fallback;
  const angles = lines.map((line) => line.angle).sort((a, b) => a - b);
  const range = angles[angles.length - 1] - angles[0];
  return clamp(Math.round(34 + range * 2.2), 24, 100);
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function ensurePerspectiveRayPool() {
  if (!perspectiveSystem) {
    return;
  }

  [
    { selector: ".ray-center", className: "ray-center", prefix: "center" },
    { selector: ".ray-left", className: "ray-left", prefix: "left" },
    { selector: ".ray-right", className: "ray-right", prefix: "right" }
  ].forEach(({ selector, className, prefix }) => {
    let group = Array.from(perspectiveSystem.querySelectorAll(selector));
    while (group.length < 12) {
      const ray = document.createElement("span");
      ray.className = `perspective-ray ${className}`;
      ray.dataset.perspectiveRay = `${prefix}-${group.length}`;
      perspectiveSystem.appendChild(ray);
      perspectiveRays.push(ray);
      group.push(ray);
    }
  });
}

function startPerspectiveHorizonDrag(event) {
  if (activeMode !== "perspective") {
    return;
  }

  pushToolHistory();
  event.preventDefault();
  event.stopPropagation();
  const handle = event.currentTarget;
  const pointerId = event.pointerId;
  handle.setPointerCapture?.(pointerId);

  const move = (moveEvent) => {
    const rect = drawingOverlay.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    const x = Math.round(clamp(((moveEvent.clientX - rect.left) / rect.width) * 100, -120, 220));
    const y = Math.round(clamp(((moveEvent.clientY - rect.top) / rect.height) * 100, 15, 85));
    perspectiveState.horizon = y;
    if (handle === vpCenterMarker) {
      perspectiveState.center = clamp(x, 0, 100);
    } else if (handle === vpLeftMarker) {
      perspectiveState.left = clamp(x, -220, 45);
    } else if (handle === vpRightMarker) {
      perspectiveState.right = clamp(x, 55, 260);
    }
    updatePerspectiveUI();
  };

  const stop = (upEvent) => {
    handle.releasePointerCapture?.(pointerId);
    handle.removeEventListener("pointermove", move);
    handle.removeEventListener("pointerup", stop);
    handle.removeEventListener("pointercancel", stop);
    move(upEvent);
  };

  handle.addEventListener("pointermove", move);
  handle.addEventListener("pointerup", stop);
  handle.addEventListener("pointercancel", stop);
  move(event);
}

function updateCanonUI() {
  drawingOverlay.classList.toggle("canon-front", canonState.view === "front");
  drawingOverlay.classList.toggle("canon-side", canonState.view === "side");
  drawingOverlay.classList.toggle("canon-show-eyes", canonState.eyes);
  drawingOverlay.classList.toggle("canon-show-mouth", canonState.mouth);
  drawingOverlay.classList.toggle("canon-show-widths", canonState.widths);
  const maxScale = getMaxCanonScale();
  canonState.scale = canonState.scaleTouched
    ? clamp(canonState.scale, 20, maxScale)
    : getDefaultCanonScaleForView();
  drawingOverlay.style.setProperty("--canon-scale", String(canonState.scale / 100));
  drawingOverlay.style.setProperty("--canon-x", `${canonState.x}px`);
  drawingOverlay.style.setProperty("--canon-y", `${canonState.y}px`);
  drawingOverlay.style.setProperty("--canon-opacity", String(canonState.opacity / 100));

  if (appShell) {
    appShell.dataset.canonView = canonState.view;
  }

  canonViewButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.canonView === canonState.view);
  });
  canonGuideButtons.forEach((button) => {
    const key = button.dataset.canonGuide;
    button.classList.toggle("is-active", Boolean(canonState[key]));
  });
  canonControls.forEach((control) => {
    const key = control.dataset.canonControl;
    if (key === "scale") {
      control.max = String(maxScale);
    }
    control.value = String(canonState[key]);
  });
  canonViewBadge.textContent = canonState.view === "front" ? "Front" : "Side";

  if (activeMode === "canon" && hasImage) {
    applyModeResult(false);
  }
}

function getDefaultCanonScaleForView() {
  const overlayWidth = drawingOverlay.clientWidth || drawingStage.clientWidth;
  const overlayHeight = drawingOverlay.clientHeight || drawingStage.clientHeight;
  if (!overlayWidth || !overlayHeight) {
    return 100;
  }

  const frontBaseHeight = Math.min(overlayWidth * 0.82, 380) * (3.5 / 2.5);
  const sideBaseHeight = Math.min(overlayWidth * 0.92, 532);
  const targetHeight = Math.min(frontBaseHeight, sideBaseHeight, overlayHeight);
  const activeBaseHeight = canonState.view === "side" ? sideBaseHeight : frontBaseHeight;

  if (!activeBaseHeight) {
    return 100;
  }

  return clamp(Math.floor((targetHeight / activeBaseHeight) * 100), 20, getMaxCanonScale());
}

function getMaxCanonScale() {
  if (!canonBoard || !drawingOverlay) {
    return 190;
  }

  const overlayWidth = drawingOverlay.clientWidth || drawingStage.clientWidth;
  const overlayHeight = drawingOverlay.clientHeight || drawingStage.clientHeight;
  const boardWidth = canonBoard.offsetWidth;
  const boardHeight = canonBoard.offsetHeight;

  if (!overlayWidth || !overlayHeight || !boardWidth || !boardHeight) {
    return 190;
  }

  return Math.max(20, Math.min(190, Math.floor(Math.min(overlayWidth / boardWidth, overlayHeight / boardHeight) * 100)));
}

function updateBodyCanonUI() {
  drawingOverlay.classList.toggle("body-front", bodyState.view === "front");
  drawingOverlay.classList.toggle("body-side", bodyState.view === "side");
  const maxScale = getMaxBodyCanonScale();
  bodyState.scale = clamp(bodyState.scale, 20, maxScale);
  drawingOverlay.style.setProperty("--body-scale", String(bodyState.scale / 100));
  drawingOverlay.style.setProperty("--body-x", `${bodyState.x}px`);
  drawingOverlay.style.setProperty("--body-y", `${bodyState.y}px`);
  drawingOverlay.style.setProperty("--body-opacity", String(bodyState.opacity / 100));

  if (appShell) {
    appShell.dataset.bodyView = bodyState.view;
  }

  bodyViewButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.bodyView === bodyState.view);
  });
  bodyControls.forEach((control) => {
    const key = control.dataset.bodyControl;
    if (key === "scale") {
      control.max = String(maxScale);
    }
    control.value = String(bodyState[key]);
  });
  bodyCanonViewBadge.textContent = bodyState.view === "front" ? "Front" : "Side";

  if (activeMode === "body" && hasImage) {
    applyModeResult(false);
  }
}

function getMaxBodyCanonScale() {
  if (!bodyCanonBoard || !drawingOverlay) {
    return 150;
  }

  const overlayWidth = drawingOverlay.clientWidth || drawingStage.clientWidth;
  const overlayHeight = drawingOverlay.clientHeight || drawingStage.clientHeight;
  const boardWidth = bodyCanonBoard.offsetWidth;
  const boardHeight = bodyCanonBoard.offsetHeight;

  if (!overlayWidth || !overlayHeight || !boardWidth || !boardHeight) {
    return 150;
  }

  return Math.max(20, Math.min(150, Math.floor(Math.min(overlayWidth / boardWidth, overlayHeight / boardHeight) * 100)));
}

function updatePerspectiveRays() {
  const rect = drawingOverlay.getBoundingClientRect();
  const width = rect.width || drawingStage.clientWidth;
  const height = rect.height || drawingStage.clientHeight;
  if (!width || !height) {
    return;
  }

  ensurePerspectiveRayPool();
  const onePointOrigin = {
    x: width * (perspectiveState.center / 100),
    y: height * (perspectiveState.horizon / 100)
  };
  const leftOrigin = {
    x: width * (perspectiveState.left / 100),
    y: height * (perspectiveState.horizon / 100)
  };
  const rightOrigin = {
    x: width * (perspectiveState.right / 100),
    y: height * (perspectiveState.horizon / 100)
  };

  const centerRays = Array.from(perspectiveSystem.querySelectorAll(".ray-center"));
  const leftRays = Array.from(perspectiveSystem.querySelectorAll(".ray-left"));
  const rightRays = Array.from(perspectiveSystem.querySelectorAll(".ray-right"));
  const rayCount = clamp(perspectiveState.rayCount, 2, 12);

  if (perspectiveState.mode === "one") {
    renderRayGroup(centerRays, onePointOrigin, createSplitOnePointTargets(rayCount, width, height, onePointOrigin), width, height);
    hideRayGroup(leftRays);
    hideRayGroup(rightRays);
    return;
  }

  hideRayGroup(centerRays);
  if (perspectiveState.showLeft === false) {
    hideRayGroup(leftRays);
  } else {
    renderRayGroup(leftRays, leftOrigin, createVanishingTargets(rayCount, width, height, "right", perspectiveState.leftSpread, leftOrigin), width, height);
  }
  if (perspectiveState.showRight === false) {
    hideRayGroup(rightRays);
  } else {
    renderRayGroup(rightRays, rightOrigin, createVanishingTargets(rayCount, width, height, "left", perspectiveState.rightSpread, rightOrigin), width, height);
  }
}

function createSplitOnePointTargets(count, width, height, origin) {
  const clampedCount = clamp(count, 2, 12);
  const leftCount = Math.floor(clampedCount / 2);
  const rightCount = clampedCount - leftCount;
  const leftTargets = createRayTargets(leftCount, width, height, "left", perspectiveState.leftSpread, origin);
  const rightTargets = createRayTargets(rightCount, width, height, "right", perspectiveState.rightSpread, origin);
  const targets = [];
  const max = Math.max(leftTargets.length, rightTargets.length);
  for (let index = 0; index < max; index += 1) {
    if (leftTargets[index]) targets.push(leftTargets[index]);
    if (rightTargets[index]) targets.push(rightTargets[index]);
  }
  return targets.slice(0, clampedCount);
}

function createRayTargets(count, width, height, side, spread = 72, origin = null) {
  if (count <= 0) {
    return [];
  }
  const clampedCount = clamp(count, 1, 12);
  const baseOrigin = origin || { x: width / 2, y: height / 2 };
  const spreadRatio = (clamp(spread, 20, 100) - 20) / 80;
  const travel = height * (0.18 + spreadRatio * 0.72) + width * (spreadRatio * 0.42);
  const horizonY = clamp(baseOrigin.y, 0, height);

  if (side === "both") {
    const leftCount = Math.floor(clampedCount / 2);
    const rightCount = clampedCount - leftCount;
    const leftTargets = createFrameSideTargets("left", leftCount, width, height, horizonY, travel);
    const rightTargets = createFrameSideTargets("right", rightCount, width, height, horizonY, travel);
    const targets = [];
    const max = Math.max(leftTargets.length, rightTargets.length);
    for (let index = 0; index < max; index += 1) {
      if (leftTargets[index]) {
        targets.push(leftTargets[index]);
      }
      if (rightTargets[index]) {
        targets.push(rightTargets[index]);
      }
    }
    return targets.slice(0, clampedCount);
  }

  return createFrameSideTargets(side, clampedCount, width, height, horizonY, travel);
}

function createVanishingTargets(count, width, height, side, spread = 54, origin = null) {
  const clampedCount = clamp(count, 2, 12);
  const baseOrigin = origin || { x: width / 2, y: height / 2 };
  const spreadRatio = (clamp(spread, 20, 100) - 20) / 80;
  const halfRange = height * (0.18 + spreadRatio * 0.7);
  const centerY = clamp(baseOrigin.y, 0, height);

  return getCenteredOffsets(clampedCount, halfRange).map((offset) => (
    pointOnSideWithTopBottomCap(side, centerY + offset, width, height)
  ));
}

function pointOnSideWithTopBottomCap(side, y, width, height) {
  const topBottomLimit = width / 2;
  if (y >= 0 && y <= height) {
    return { x: side === "left" ? 0 : width, y };
  }

  if (side === "left") {
    if (y < 0) {
      return { x: clamp(-y, 0, topBottomLimit), y: 0 };
    }
    return { x: clamp(y - height, 0, topBottomLimit), y: height };
  }

  if (y < 0) {
    return { x: clamp(width + y, width - topBottomLimit, width), y: 0 };
  }
  return { x: clamp(width - (y - height), width - topBottomLimit, width), y: height };
}

function createFrameSideTargets(side, count, width, height, horizonY, travel) {
  if (count <= 0) {
    return [];
  }
  const offsets = getCenteredOffsets(count, travel);
  const start = side === "left"
    ? perimeterPositionForLeftEdge(width, height, horizonY)
    : perimeterPositionForRightEdge(width, height, horizonY);
  return offsets.map((offset) => pointFromPerimeter(start + offset, width, height));
}

function getCenteredOffsets(count, travel) {
  if (count <= 1) {
    return [0];
  }
  return Array.from({ length: count }, (_, index) => {
    const ratio = count === 1 ? 0 : index / (count - 1);
    return -travel + ratio * travel * 2;
  });
}

function perimeterPositionForRightEdge(width, height, y) {
  return width + clamp(y, 0, height);
}

function perimeterPositionForLeftEdge(width, height, y) {
  return (2 * width) + height + (height - clamp(y, 0, height));
}

function pointFromPerimeter(position, width, height) {
  const perimeter = 2 * (width + height);
  let value = position % perimeter;
  if (value < 0) {
    value += perimeter;
  }

  if (value <= width) {
    return { x: value, y: 0 };
  }
  if (value <= width + height) {
    return { x: width, y: value - width };
  }
  if (value <= (2 * width) + height) {
    return { x: width - (value - width - height), y: height };
  }
  return { x: 0, y: height - (value - (2 * width) - height) };
}

function renderRayGroup(rays, origin, targets, width, height) {
  rays.forEach((ray, index) => {
    const target = targets[index];
    if (!target) {
      hideRay(ray);
      return;
    }
    drawRayToFrame(ray, origin, target, width, height);
  });
}

function hideRayGroup(rays) {
  rays.forEach(hideRay);
}

function hideRay(ray) {
  ray.style.display = "none";
}

function drawRayToFrame(ray, origin, target, width, height) {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    hideRay(ray);
    return;
  }

  const intersections = [];
  const pushPoint = (t) => {
    if (t <= 0) {
      return;
    }
    const x = origin.x + dx * t;
    const y = origin.y + dy * t;
    if (x >= -1 && x <= width + 1 && y >= -1 && y <= height + 1) {
      intersections.push({ x, y, t });
    }
  };

  if (Math.abs(dx) > 0.001) {
    pushPoint((0 - origin.x) / dx);
    pushPoint((width - origin.x) / dx);
  }
  if (Math.abs(dy) > 0.001) {
    pushPoint((0 - origin.y) / dy);
    pushPoint((height - origin.y) / dy);
  }

  if (!intersections.length) {
    hideRay(ray);
    return;
  }

  intersections.sort((a, b) => a.t - b.t);
  const originInsideFrame = origin.x >= 0 && origin.x <= width && origin.y >= 0 && origin.y <= height;
  const start = originInsideFrame ? origin : intersections[0];
  const end = originInsideFrame ? intersections[0] : intersections[1];
  if (!end) {
    hideRay(ray);
    return;
  }
  const rayDx = end.x - start.x;
  const rayDy = end.y - start.y;
  const length = Math.hypot(rayDx, rayDy);
  const angle = Math.atan2(rayDy, rayDx) * 180 / Math.PI;

  ray.style.display = "block";
  ray.style.left = `${start.x}px`;
  ray.style.top = `${start.y}px`;
  ray.style.width = `${length}px`;
  ray.style.transform = `rotate(${angle}deg)`;
}

function updateCompareUI() {
  compareStage.classList.toggle("has-any-image", hasReferenceImage || hasCompareDrawing);
  compareStage.classList.toggle("has-both-images", hasReferenceImage && hasCompareDrawing);
  readinessBadge.textContent = hasReferenceImage && hasCompareDrawing ? "Compare" : "Waiting";

  if (hasReferenceImage && hasCompareDrawing) {
    compareStatus.textContent = "Both images are ready. Use opacity, scale, rotate, and move in the preview.";
    structureVerdict.textContent = "Both images loaded. Align the drawing over the reference.";
  } else if (hasReferenceImage) {
    compareStatus.textContent = "Reference loaded. Add your photographed drawing.";
    structureVerdict.textContent = "Reference ready. Upload your drawing layer.";
  } else if (hasCompareDrawing) {
    compareStatus.textContent = "Drawing loaded. Add the reference image.";
    structureVerdict.textContent = "Drawing ready. Upload the reference layer.";
  } else {
    compareStatus.textContent = "Upload both images, then align the drawing over the reference in the preview.";
    structureVerdict.textContent = "Upload both images to start compare mode.";
  }

  structureScore.textContent = "--";
  scoreFill.style.width = hasReferenceImage && hasCompareDrawing ? "58%" : "0%";
  clearButton.disabled = !(hasReferenceImage || hasCompareDrawing);
  resetButton.disabled = !(hasReferenceImage || hasCompareDrawing);
  applyCompareTransform();
  updateWorkspaceToolButtons();
}

function analyzeDrawingImage() {
  const naturalWidth = drawingPreview.naturalWidth || 0;
  const naturalHeight = drawingPreview.naturalHeight || 0;
  if (!naturalWidth || !naturalHeight) {
    return createEmptyDrawingRead();
  }

  const maxSide = 420;
  const scale = Math.min(1, maxSide / Math.max(naturalWidth, naturalHeight));
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(drawingPreview, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  const luminance = new Float32Array(width * height);
  let sum = 0;

  for (let index = 0; index < data.length; index += 4) {
    const pixel = index / 4;
    const alpha = data[index + 3] / 255;
    const red = data[index] * alpha + 255 * (1 - alpha);
    const green = data[index + 1] * alpha + 255 * (1 - alpha);
    const blue = data[index + 2] * alpha + 255 * (1 - alpha);
    const value = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    luminance[pixel] = value;
    sum += value;
  }

  const mean = sum / luminance.length;
  let variance = 0;
  for (let index = 0; index < luminance.length; index += 1) {
    const delta = luminance[index] - mean;
    variance += delta * delta;
  }
  const deviation = Math.sqrt(variance / luminance.length);
  const darkThreshold = Math.max(45, Math.min(218, mean - Math.max(18, deviation * 0.5)));

  let inkCount = 0;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let centroidX = 0;
  let centroidY = 0;
  let weightSum = 0;
  const quadrants = [0, 0, 0, 0];
  const verticalThirds = [0, 0, 0];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const value = luminance[y * width + x];
      if (value > darkThreshold) {
        continue;
      }

      const weight = Math.max(1, 255 - value);
      inkCount += 1;
      weightSum += weight;
      centroidX += x * weight;
      centroidY += y * weight;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      const quadrant = (x > width / 2 ? 1 : 0) + (y > height / 2 ? 2 : 0);
      quadrants[quadrant] += weight;
      verticalThirds[Math.min(2, Math.floor((y / height) * 3))] += weight;
    }
  }

  if (!inkCount || weightSum <= 0) {
    return createEmptyDrawingRead("No clear drawing lines detected. Try a sharper photo with darker marks.");
  }

  centroidX /= weightSum;
  centroidY /= weightSum;
  const bboxWidth = Math.max(1, maxX - minX + 1);
  const bboxHeight = Math.max(1, maxY - minY + 1);
  const coverageX = bboxWidth / width;
  const coverageY = bboxHeight / height;
  const envelopeRatio = bboxWidth / bboxHeight;
  const imageRatio = width / height;
  const inkDensity = inkCount / (width * height);
  const driftX = (centroidX / width - 0.5) * 100;
  const driftY = (centroidY / height - 0.5) * 100;
  const driftDistance = Math.hypot(driftX, driftY);
  const leftWeight = quadrants[0] + quadrants[2];
  const rightWeight = quadrants[1] + quadrants[3];
  const topWeight = quadrants[0] + quadrants[1];
  const bottomWeight = quadrants[2] + quadrants[3];
  const horizontalImbalance = Math.abs(leftWeight - rightWeight) / weightSum;
  const verticalImbalance = Math.abs(topWeight - bottomWeight) / weightSum;
  const angleRead = analyzeDrawingAngles(luminance, width, height);
  const topMass = verticalThirds[0] / weightSum;
  const middleMass = verticalThirds[1] / weightSum;
  const bottomMass = verticalThirds[2] / weightSum;
  const coverageScore = scoreRange(Math.min(coverageX, coverageY), 0.32, 0.82);
  const densityScore = scoreRange(inkDensity, 0.015, 0.12);
  const driftScore = clamp(Math.round(100 - driftDistance * 3.2), 35, 100);
  const angleScore = clamp(Math.round(55 + angleRead.directionStrength * 45), 45, 96);
  const score = clamp(Math.round(coverageScore * 0.26 + densityScore * 0.2 + driftScore * 0.28 + angleScore * 0.26), 38, 94);
  const confidence = inkDensity < 0.008 || inkDensity > 0.42 ? "low" : "normal";

  return {
    score,
    confidence,
    width,
    height,
    inkDensity,
    coverageX,
    coverageY,
    envelopeRatio,
    imageRatio,
    bounds: {
      x: minX / width,
      y: minY / height,
      width: bboxWidth / width,
      height: bboxHeight / height
    },
    driftX,
    driftY,
    driftDistance,
    horizontalImbalance,
    verticalImbalance,
    topMass,
    middleMass,
    bottomMass,
    mainAngle: angleRead.mainAngle,
    secondaryAngle: angleRead.secondaryAngle,
    directionStrength: angleRead.directionStrength,
    envelopeLabel: `${Math.round(coverageX * 100)} x ${Math.round(coverageY * 100)}%`,
    driftLabel: driftDistance < 4 ? "centered" : `${formatDirection(driftX, driftY)} ${Math.round(driftDistance)}%`,
    angleLabel: Number.isFinite(angleRead.mainAngle) ? `${Math.round(angleRead.mainAngle)} deg` : "--",
    message: ""
  };
}

function analyzeDrawingAngles(luminance, width, height) {
  const bins = new Array(12).fill(0);
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const center = luminance[y * width + x];
      if (center > 238) {
        continue;
      }

      const gx =
        -luminance[(y - 1) * width + (x - 1)] +
        luminance[(y - 1) * width + (x + 1)] -
        2 * luminance[y * width + (x - 1)] +
        2 * luminance[y * width + (x + 1)] -
        luminance[(y + 1) * width + (x - 1)] +
        luminance[(y + 1) * width + (x + 1)];
      const gy =
        -luminance[(y - 1) * width + (x - 1)] -
        2 * luminance[(y - 1) * width + x] -
        luminance[(y - 1) * width + (x + 1)] +
        luminance[(y + 1) * width + (x - 1)] +
        2 * luminance[(y + 1) * width + x] +
        luminance[(y + 1) * width + (x + 1)];
      const magnitude = Math.hypot(gx, gy);
      if (magnitude < 34) {
        continue;
      }

      let lineAngle = (Math.atan2(gy, gx) * 180 / Math.PI + 90) % 180;
      if (lineAngle < 0) {
        lineAngle += 180;
      }
      const bin = Math.min(11, Math.round(lineAngle / 15) % 12);
      bins[bin] += magnitude;
    }
  }

  const total = bins.reduce((sum, value) => sum + value, 0);
  if (!total) {
    return { mainAngle: NaN, secondaryAngle: NaN, directionStrength: 0 };
  }

  const ranked = bins
    .map((value, index) => ({ value, angle: index * 15 }))
    .sort((a, b) => b.value - a.value);
  return {
    mainAngle: ranked[0].angle,
    secondaryAngle: ranked[1]?.angle ?? NaN,
    directionStrength: ranked[0].value / total
  };
}

function buildModeRead(mode, read) {
  if (!read || read.confidence === "empty") {
    return {
      score: 0,
      verdict: read?.message || "Upload a drawing to start.",
      preview: read?.message || "Upload a drawing to start.",
      proportion: "Check the big height-width relationships and major shape divisions.",
      angle: "Compare the main tilts and directional lines before refining details.",
      alignment: "Use center axes and landmarks to see whether the drawing is drifting.",
      fix: "The first fix will appear here after upload."
    };
  }

  const envelopeFit = getEnvelopeCopy(read);
  const angleFit = getAngleCopy(read);
  const alignmentFit = getAlignmentCopy(read);
  const perspectiveFit = getPerspectiveCopy(read);
  const modePenalty = mode === "perspective" ? 4 : 0;
  const score = clamp(read.score - modePenalty, 32, 96);
  const confidencePrefix = read.confidence === "low" ? "Low-confidence read: " : "";
  const fix = getFirstFix(read, mode);

  if (mode === "proportion") {
    const proportion = getProportionRead(read);
    return {
      score,
      verdict: `${confidencePrefix}${proportion.verdict}`,
      preview: `${confidencePrefix}${proportion.preview}`,
      proportion: proportion.envelope,
      angle: proportion.center,
      alignment: proportion.mass,
      fix: proportion.fix
    };
  }

  if (mode === "perspective") {
    const perspective = getPerspectiveModeRead(read);
    return {
      score,
      verdict: `${confidencePrefix}${perspective.verdict}`,
      preview: `${confidencePrefix}${perspective.preview}`,
      proportion: perspective.horizon,
      angle: perspective.edges,
      alignment: perspective.vanishing,
      fix: perspective.fix
    };
  }

  if (mode === "canon") {
    const canon = getCanonModeRead();
    return {
      score: clamp(read.score, 32, 96),
      verdict: `${confidencePrefix}${canon.verdict}`,
      preview: `${confidencePrefix}${canon.preview}`,
      proportion: canon.height,
      angle: canon.features,
      alignment: canon.fit,
      fix: canon.fix
    };
  }

  if (mode === "body") {
    const body = getBodyCanonModeRead();
    return {
      score: clamp(read.score, 32, 96),
      verdict: `${confidencePrefix}${body.verdict}`,
      preview: `${confidencePrefix}${body.preview}`,
      proportion: body.height,
      angle: body.landmarks,
      alignment: body.fit,
      fix: body.fix
    };
  }

  return {
    score,
    verdict: `${confidencePrefix}${getVerdict(score, mode)}`,
    preview: `${confidencePrefix}Draft read ready. Run the check when the big drawing is placed.`,
    proportion: envelopeFit,
    angle: angleFit,
    alignment: mode === "perspective" ? perspectiveFit : alignmentFit,
    fix
  };
}

function updateProportionToolkit(read) {
  if (!read || read.confidence === "empty") {
    proportionRatioBadge.textContent = "--";
    proportionEnvelopeStat.textContent = "--";
    proportionCenterStat.textContent = "--";
    proportionMassStat.textContent = "--";
    proportionEnvelopeBox.style.setProperty("--env-x", "18%");
    proportionEnvelopeBox.style.setProperty("--env-y", "18%");
    proportionEnvelopeBox.style.setProperty("--env-w", "64%");
    proportionEnvelopeBox.style.setProperty("--env-h", "64%");
    return;
  }

  const ratio = read.envelopeRatio || 1;
  const ratioLabel = ratio >= 1
    ? `${ratio.toFixed(2)} : 1`
    : `1 : ${(1 / ratio).toFixed(2)}`;
  const bounds = read.bounds || { x: 0.18, y: 0.18, width: 0.64, height: 0.64 };
  proportionRatioBadge.textContent = ratioLabel;
  proportionEnvelopeStat.textContent = `${Math.round(read.coverageX * 100)} x ${Math.round(read.coverageY * 100)}%`;
  proportionCenterStat.textContent = read.driftDistance < 4
    ? "centered"
    : `${formatDirection(read.driftX, read.driftY)} ${Math.round(read.driftDistance)}%`;
  proportionMassStat.textContent = formatMassSplit(read);
  proportionEnvelopeBox.style.setProperty("--env-x", `${Math.round(bounds.x * 100)}%`);
  proportionEnvelopeBox.style.setProperty("--env-y", `${Math.round(bounds.y * 100)}%`);
  proportionEnvelopeBox.style.setProperty("--env-w", `${Math.round(bounds.width * 100)}%`);
  proportionEnvelopeBox.style.setProperty("--env-h", `${Math.round(bounds.height * 100)}%`);
}

function getProportionRead(read) {
  const widthPercent = Math.round(read.coverageX * 100);
  const heightPercent = Math.round(read.coverageY * 100);
  const ratio = read.envelopeRatio >= 1
    ? `${read.envelopeRatio.toFixed(2)} : 1`
    : `1 : ${(1 / read.envelopeRatio).toFixed(2)}`;
  const mass = formatMassSplit(read);
  const center = read.driftDistance < 4
    ? "The center of the dark mass sits close to the middle. Now compare landmarks against the centerline and half-height."
    : `The mass pulls ${formatDirection(read.driftX, read.driftY)}. Decide whether that placement is intended before correcting details.`;

  return {
    verdict: `Envelope ratio ${ratio}. Check the outside shape before small features.`,
    preview: "Big-shape read ready. Run the check after placing the full envelope.",
    envelope: `The subject uses about ${widthPercent} x ${heightPercent}% of the frame. Compare the full outside box first, then check whether the main shape is too wide or too tall.`,
    center,
    mass: `The vertical mass split reads ${mass}. Use the half and third guides to compare top, middle, and bottom sections before drawing features.`,
    fix: getProportionFirstFix(read)
  };
}

function getProportionFirstFix(read) {
  if (read.coverageX < 0.42 || read.coverageY < 0.42) {
    return "First fix: make the full envelope clear. Place the outside height and width before judging any inner feature.";
  }
  if (read.driftDistance > 9) {
    return `First fix: draw one center axis and check the ${formatDirection(read.driftX, read.driftY)} pull against the reference.`;
  }
  const masses = [
    { name: "top", value: read.topMass },
    { name: "middle", value: read.middleMass },
    { name: "bottom", value: read.bottomMass }
  ].sort((a, b) => b.value - a.value);
  return `First fix: compare the ${masses[0].name} third against the reference, then adjust the biggest landmark before details.`;
}

function formatMassSplit(read) {
  if (!Number.isFinite(read.topMass) || !Number.isFinite(read.middleMass) || !Number.isFinite(read.bottomMass)) {
    return "--";
  }
  return `${Math.round(read.topMass * 100)} / ${Math.round(read.middleMass * 100)} / ${Math.round(read.bottomMass * 100)}%`;
}

function getPerspectiveModeRead(read) {
  const modeLabel = perspectiveState.mode === "one" ? "one-point" : "two-point";
  const edgeCopy = Number.isFinite(read.mainAngle)
    ? `Detected edge family: about ${Math.round(read.mainAngle)} deg. Use the overlay rays to see which real edges follow that family.`
    : "Detected edge families are weak. Use the overlay manually against the strongest object edges.";
  const vanishingCopy = perspectiveState.mode === "one"
    ? "One-point mode: place the horizon through eye level, then slide the center VP until depth edges converge cleanly."
    : "Two-point mode: AI Auto align is the fastest start, then manually fine tune horizon, left VP, right VP, and spread until each side follows its own edge family.";

  return {
    verdict: `${modeLabel} checker ready. Test long edges against the VP rays before details.`,
    preview: `${modeLabel} perspective read ready. Adjust horizon and VP controls against the drawing.`,
    horizon: `Horizon is set at ${perspectiveState.horizon}% of the preview. Match it to the eye-level line before checking vanishing points.`,
    edges: edgeCopy,
    vanishing: vanishingCopy,
    fix: perspectiveState.mode === "one"
      ? "First fix: set the horizon, then align the longest depth edge to the center VP."
      : "First fix: set the horizon, then check left-facing and right-facing edges separately."
  };
}

function getCanonModeRead() {
  const viewLabel = canonState.view === "front" ? "front view" : "side view";
  return {
    verdict: `Head canon ${viewLabel} overlay ready. Fit the grid to the full head before features.`,
    preview: `3.5-unit ${viewLabel} overlay ready. Adjust size and position over the drawing.`,
    height: "Scale the canon to the full top-of-skull to chin height first. The hairline-to-brow, brow-to-nose, and nose-to-chin thirds should match before details.",
    features: canonState.view === "front"
      ? "Front view: start with the strong basic frame. Turn on the thinner eye line, mouth base, or eye/nose widths only after the main canon sits correctly."
      : "Side view: compare brow, eye, nose, mouth, chin, ear placement, and back of skull against the profile canon.",
    fit: canonState.view === "front"
      ? "Move the centerline over the face symmetry line, then check whether both sides sit inside the same head width."
      : "Move the profile guide onto the forehead, nose, lips, and chin line, then check the cranium and neck placement.",
    fix: "First fix: match the full head size, then correct the largest mismatch in the three face thirds."
  };
}

function getBodyCanonModeRead() {
  const viewLabel = bodyState.view === "front" ? "front view" : "side view";
  return {
    verdict: `8-head body canon ${viewLabel} overlay ready. Fit full height before anatomy details.`,
    preview: `8-head ${viewLabel} overlay ready. Adjust size and position over the figure.`,
    height: "Scale the canon to the full top-of-head to foot height first. The head unit drives every other body landmark.",
    landmarks: bodyState.view === "front"
      ? "Front view: compare head, shoulders, chest, navel, pelvis, knees, ankles, and foot line against the 8-head grid."
      : "Side view: compare head, rib cage, pelvis, knee, ankle, posture curve, and foot placement against the side silhouette.",
    fit: bodyState.view === "front"
      ? "Move the centerline through the body weight axis, then check whether shoulders and hips balance around it."
      : "Move the profile guide onto the front silhouette, then check the back curve, pelvis, knee, and ankle stack.",
    fix: "First fix: match total figure height, then correct the biggest landmark drift: shoulders, pelvis, knees, or feet."
  };
}

function getEnvelopeCopy(read) {
  const widthPercent = Math.round(read.coverageX * 100);
  const heightPercent = Math.round(read.coverageY * 100);
  if (read.coverageX < 0.42 || read.coverageY < 0.42) {
    return `The drawing occupies about ${widthPercent} x ${heightPercent}% of the frame. Check the full envelope first; the subject may be cropped small or floating in too much paper.`;
  }
  if (Math.abs(read.envelopeRatio - read.imageRatio) > 0.65) {
    return `The envelope is noticeably ${read.envelopeRatio > read.imageRatio ? "wider" : "taller"} than the photo frame. Before details, verify the big outside shape and negative spaces.`;
  }
  return `The big envelope uses about ${widthPercent} x ${heightPercent}% of the image. That is enough structure to judge proportions before details.`;
}

function getAngleCopy(read) {
  if (!Number.isFinite(read.mainAngle)) {
    return "The angle read is unclear. Use a sharper photo with stronger pencil or ink lines.";
  }
  const angleName = describeAngle(read.mainAngle);
  if (read.directionStrength > 0.22) {
    return `The strongest directional family is around ${Math.round(read.mainAngle)} deg (${angleName}). Use it as your anchor angle and compare nearby tilts against it.`;
  }
  return `No single angle dominates strongly. That can be fine, but check the largest diagonals one by one instead of correcting small details first.`;
}

function getAlignmentCopy(read) {
  if (read.driftDistance < 4) {
    return "The dark-mass center sits close to the middle. Use the centerline to compare landmarks rather than moving the whole drawing.";
  }
  return `The drawing mass pulls ${formatDirection(read.driftX, read.driftY)} by about ${Math.round(read.driftDistance)}% of the frame. Check whether this is intentional placement or accidental drift.`;
}

function getPerspectiveCopy(read) {
  if (!Number.isFinite(read.mainAngle)) {
    return "Perspective read needs clearer edges. Photograph the drawing flatter and with stronger contrast.";
  }
  const angleSpread = Math.abs(read.mainAngle - read.secondaryAngle);
  if (angleSpread > 25 && angleSpread < 145) {
    return `Two visible direction families appear near ${Math.round(read.mainAngle)} deg and ${Math.round(read.secondaryAngle)} deg. Use them to test whether receding edges share the same horizon.`;
  }
  return `Most detected edges lean toward ${Math.round(read.mainAngle)} deg. If this is architecture or still life, add a horizon check before refining objects.`;
}

function getFirstFix(read, mode) {
  if (read.confidence === "low") {
    return "First fix: retake the photo flatter and darker if possible. A clearer drawing photo will make every check more reliable.";
  }
  if (read.coverageX < 0.42 || read.coverageY < 0.42) {
    return "First fix: redraw or crop to the full envelope. Get the biggest outside shape right before measuring features.";
  }
  if (read.driftDistance > 9 && mode !== "angles") {
    return `First fix: mark a center axis, then decide if the ${formatDirection(read.driftX, read.driftY)} drift is intended.`;
  }
  if (mode === "angles" && Number.isFinite(read.mainAngle)) {
    return `First fix: choose the ${Math.round(read.mainAngle)} deg angle as the anchor, then compare the next two biggest tilts against it.`;
  }
  if (mode === "perspective") {
    return "First fix: place the horizon or main vanishing direction, then adjust the longest receding edge.";
  }
  return "First fix: correct the largest envelope and landmark placement before touching small features.";
}

function getVerdict(score, mode) {
  if (score >= 82) {
    return mode === "perspective"
      ? "The drawing has a readable structure. Now test perspective edges before detail."
      : "The big drawing structure reads well enough for a confident next pass.";
  }
  if (score >= 66) {
    return "The drawing is workable, but one structural pass will make it safer before painting.";
  }
  if (score >= 50) {
    return "The drawing needs a clear construction pass before detail or paint.";
  }
  return "The checker sees weak structure. Recheck the envelope, axis, and main angles first.";
}

function createEmptyDrawingRead(message = "Upload a drawing to start.") {
  return {
    score: 0,
    confidence: "empty",
    envelopeLabel: "--",
    driftLabel: "--",
    angleLabel: "--",
    message
  };
}

function scoreRange(value, low, high) {
  if (value <= low) return 35;
  if (value >= high) return 95;
  return Math.round(35 + ((value - low) / (high - low)) * 60);
}

function describeAngle(angle) {
  const normalized = ((angle % 180) + 180) % 180;
  if (normalized < 12 || normalized > 168) return "horizontal";
  if (normalized > 78 && normalized < 102) return "vertical";
  if (normalized < 78) return "rising diagonal";
  return "falling diagonal";
}

function formatDirection(x, y) {
  const horizontal = Math.abs(x) < 3 ? "" : x > 0 ? "right" : "left";
  const vertical = Math.abs(y) < 3 ? "" : y > 0 ? "down" : "up";
  return [vertical, horizontal].filter(Boolean).join("-") || "center";
}

function applyCompareTransform() {
  const opacity = compareState.opacity / 100;
  const scale = compareState.scale / 100;
  compareDrawingPreview.style.setProperty("--compare-opacity", String(opacity));
  compareDrawingPreview.style.setProperty("--compare-scale", String(scale));
  compareDrawingPreview.style.setProperty("--compare-x", `${compareState.x}px`);
  compareDrawingPreview.style.setProperty("--compare-y", `${compareState.y}px`);
  compareDrawingPreview.style.setProperty("--compare-rotate", `${compareState.rotate}deg`);
  compareDrawingPreview.style.mixBlendMode = compareState.blend;
  updateBlendButtons();
}

function syncCompareControls(key) {
  compareControls
    .filter((control) => control.dataset.compareControl === key)
    .forEach((control) => {
      control.value = String(compareState[key]);
    });
}

function syncAllCompareControls() {
  ["opacity", "scale", "x", "y", "rotate"].forEach(syncCompareControls);
}

function fitCompareDrawing() {
  compareState = {
    ...compareState,
    scale: 100,
    x: 0,
    y: 0,
    rotate: 0
  };
  syncAllCompareControls();
  applyCompareTransform();
}

function centerCompareDrawing() {
  compareState = {
    ...compareState,
    x: 0,
    y: 0
  };
  syncAllCompareControls();
  applyCompareTransform();
}

function resetCompareTransform() {
  compareState = {
    opacity: 58,
    scale: 100,
    x: 0,
    y: 0,
    rotate: 0,
    blend: "multiply"
  };
  syncAllCompareControls();
  applyCompareTransform();
}

function nudgeCompareDrawing(direction) {
  const amount = 8;
  if (direction === "left") compareState.x -= amount;
  if (direction === "right") compareState.x += amount;
  if (direction === "up") compareState.y -= amount;
  if (direction === "down") compareState.y += amount;
  syncAllCompareControls();
  applyCompareTransform();
}

function updateBlendButtons() {
  compareBlendButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.compareBlend === compareState.blend);
  });
}

function swapCompareLayers() {
  if (!hasReferenceImage && !hasCompareDrawing) {
    return;
  }

  const previousReferenceUrl = referenceObjectUrl;
  const previousDrawingUrl = compareDrawingObjectUrl;
  const previousHasReference = hasReferenceImage;
  const previousHasDrawing = hasCompareDrawing;
  referenceObjectUrl = previousDrawingUrl;
  compareDrawingObjectUrl = previousReferenceUrl;
  hasReferenceImage = previousHasDrawing;
  hasCompareDrawing = previousHasReference;
  referencePreview.classList.toggle("is-loaded", hasReferenceImage);
  compareDrawingPreview.classList.toggle("is-loaded", hasCompareDrawing);

  if (referenceObjectUrl) {
    referencePreview.src = referenceObjectUrl;
  } else {
    referencePreview.removeAttribute("src");
  }

  if (compareDrawingObjectUrl) {
    compareDrawingPreview.src = compareDrawingObjectUrl;
  } else {
    compareDrawingPreview.removeAttribute("src");
  }

  resetCompareTransform();
  updateCompareUI();
}

function handleCanonPointerDown(event) {
  const target = getActiveCanonPointerTarget(event);
  if (!target || !hasImage || event.target.closest("button, label, input")) {
    return;
  }

  pushToolHistory();
  event.preventDefault();
  event.stopPropagation();
  activeCanonTarget = target;
  target.system?.classList.add("is-dragging");
  activeCanonPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (typeof target.system?.setPointerCapture === "function") {
    target.system.setPointerCapture(event.pointerId);
  }
  startCanonGesture(event.target.closest("[data-canon-resize-handle]"));
}

function handleCanonPointerMove(event) {
  if (!activeCanonPointers.has(event.pointerId)) {
    return;
  }

  event.preventDefault();
  activeCanonPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  updateCanonGesture();
}

function handleCanonPointerEnd(event) {
  activeCanonPointers.delete(event.pointerId);
  if (typeof activeCanonTarget?.system?.releasePointerCapture === "function") {
    try {
      activeCanonTarget.system.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Pointer capture can already be released by the browser.
    }
  }

  if (activeCanonPointers.size === 0) {
    activeCanonTarget?.system?.classList.remove("is-dragging");
    canonGesture = null;
    activeCanonTarget = null;
    return;
  }

  startCanonGesture();
}

function getActiveCanonPointerTarget(event) {
  if (activeMode === "canon" && event.currentTarget === canonSystem) {
    return {
      kind: "head",
      system: canonSystem,
      board: canonBoard,
      state: canonState,
      update: updateCanonUI,
      getMaxScale: getMaxCanonScale,
      moveLimit: 220,
      markScaleTouched: true
    };
  }

  if (activeMode === "body" && event.currentTarget === bodyCanonSystem) {
    return {
      kind: "body",
      system: bodyCanonSystem,
      board: bodyCanonBoard,
      state: bodyState,
      update: updateBodyCanonUI,
      getMaxScale: getMaxBodyCanonScale,
      moveLimit: 140,
      markScaleTouched: false
    };
  }

  return null;
}

function startCanonGesture(resizeHandle = null) {
  if (!activeCanonTarget) {
    return;
  }

  const points = Array.from(activeCanonPointers.values());
  if (resizeHandle && points.length === 1) {
    const [point] = points;
    const rect = activeCanonTarget.board.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    canonGesture = {
      type: "resize",
      startDistance: Math.max(1, getPointDistance(point, center)),
      center,
      originScale: activeCanonTarget.state.scale
    };
    return;
  }

  if (points.length >= 2) {
    const [first, second] = points;
    canonGesture = {
      type: "pinch",
      startDistance: getPointDistance(first, second),
      startCenter: getPointCenter(first, second),
      originScale: activeCanonTarget.state.scale,
      originX: activeCanonTarget.state.x,
      originY: activeCanonTarget.state.y
    };
    return;
  }

  const [point] = points;
  canonGesture = {
    type: "drag",
    startX: point.x,
    startY: point.y,
    originX: activeCanonTarget.state.x,
    originY: activeCanonTarget.state.y
  };
}

function updateCanonGesture() {
  if (!canonGesture || !activeCanonTarget) {
    return;
  }

  const points = Array.from(activeCanonPointers.values());
  const state = activeCanonTarget.state;
  const maxScale = activeCanonTarget.getMaxScale();
  const moveLimit = activeCanonTarget.moveLimit;

  if (canonGesture.type === "resize" && points.length === 1) {
    const [point] = points;
    const nextDistance = getPointDistance(point, canonGesture.center);
    const scaleRatio = canonGesture.startDistance ? nextDistance / canonGesture.startDistance : 1;
    if (activeCanonTarget.markScaleTouched) {
      state.scaleTouched = true;
    }
    state.scale = clamp(Math.round(canonGesture.originScale * scaleRatio), 20, maxScale);
    activeCanonTarget.update();
    return;
  }

  if (canonGesture.type === "pinch" && points.length >= 2) {
    const [first, second] = points;
    const nextDistance = getPointDistance(first, second);
    const nextCenter = getPointCenter(first, second);
    const scaleRatio = canonGesture.startDistance ? nextDistance / canonGesture.startDistance : 1;
    if (activeCanonTarget.markScaleTouched) {
      state.scaleTouched = true;
    }
    state.scale = clamp(Math.round(canonGesture.originScale * scaleRatio), 20, maxScale);
    state.x = clamp(Math.round(canonGesture.originX + nextCenter.x - canonGesture.startCenter.x), -moveLimit, moveLimit);
    state.y = clamp(Math.round(canonGesture.originY + nextCenter.y - canonGesture.startCenter.y), -moveLimit, moveLimit);
    activeCanonTarget.update();
    return;
  }

  if (canonGesture.type === "drag" && points.length === 1) {
    const [point] = points;
    state.x = clamp(Math.round(canonGesture.originX + point.x - canonGesture.startX), -moveLimit, moveLimit);
    state.y = clamp(Math.round(canonGesture.originY + point.y - canonGesture.startY), -moveLimit, moveLimit);
    activeCanonTarget.update();
  }
}

function handleComparePointerDown(event) {
  if (activeMode !== "compare" || !hasCompareDrawing || event.target.closest(".mobile-compare-controls, .compare-empty-state, button, label, input")) {
    return;
  }

  pushToolHistory();
  event.preventDefault();
  compareStage.classList.add("is-dragging");
  activeComparePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (typeof compareStage.setPointerCapture === "function") {
    compareStage.setPointerCapture(event.pointerId);
  }
  startCompareGesture();
}

function handleComparePointerMove(event) {
  if (!activeComparePointers.has(event.pointerId)) {
    return;
  }

  event.preventDefault();
  activeComparePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  updateCompareGesture();
}

function handleComparePointerEnd(event) {
  activeComparePointers.delete(event.pointerId);
  if (typeof compareStage.releasePointerCapture === "function") {
    try {
      compareStage.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Pointer capture can already be released by the browser.
    }
  }

  if (activeComparePointers.size === 0) {
    compareStage.classList.remove("is-dragging");
    compareGesture = null;
    return;
  }

  startCompareGesture();
}

function startCompareGesture() {
  const points = Array.from(activeComparePointers.values());
  if (points.length >= 2) {
    const [first, second] = points;
    compareGesture = {
      type: "pinch",
      startDistance: getPointDistance(first, second),
      startAngle: getPointAngle(first, second),
      originScale: compareState.scale,
      originRotate: compareState.rotate
    };
    return;
  }

  const [point] = points;
  compareGesture = {
    type: "drag",
    startX: point.x,
    startY: point.y,
    originX: compareState.x,
    originY: compareState.y
  };
}

function updateCompareGesture() {
  if (!compareGesture) {
    return;
  }

  const points = Array.from(activeComparePointers.values());
  if (compareGesture.type === "pinch" && points.length >= 2) {
    const [first, second] = points;
    const nextDistance = getPointDistance(first, second);
    const nextAngle = getPointAngle(first, second);
    const scaleRatio = compareGesture.startDistance ? nextDistance / compareGesture.startDistance : 1;
    compareState.scale = clamp(Math.round(compareGesture.originScale * scaleRatio), 45, 180);
    compareState.rotate = clamp(Math.round(compareGesture.originRotate + nextAngle - compareGesture.startAngle), -25, 25);
    syncAllCompareControls();
    applyCompareTransform();
    return;
  }

  if (compareGesture.type === "drag" && points.length === 1) {
    const [point] = points;
    compareState.x = clamp(Math.round(compareGesture.originX + point.x - compareGesture.startX), -180, 180);
    compareState.y = clamp(Math.round(compareGesture.originY + point.y - compareGesture.startY), -180, 180);
    syncAllCompareControls();
    applyCompareTransform();
  }
}

function getPointDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function getPointCenter(first, second) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2
  };
}

function getPointAngle(first, second) {
  return Math.atan2(second.y - first.y, second.x - first.x) * 180 / Math.PI;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

setMode(activeMode);
syncAllCompareControls();
updateBlendButtons();
updateCanonUI();
updateBodyCanonUI();
