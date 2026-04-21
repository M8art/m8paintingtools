const fileInput = document.getElementById("fileInput");
const imageWrap = document.getElementById("imageWrap");
const previewImage = document.getElementById("previewImage");
const emptyState = document.getElementById("emptyState");
const swatchGrid = document.getElementById("swatchGrid");
const statusNote = document.getElementById("statusNote");
const workspaceHint = document.getElementById("workspaceHint");
const selectedColorCard = document.getElementById("selectedColorCard");
const legacySwatchGridCard = swatchGrid.closest(".detail-card");
const paletteSummary = document.getElementById("paletteSummary");
const panelTitle = document.getElementById("panelTitle");
const panelDescription = document.getElementById("panelDescription");
const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));

selectedColorCard.innerHTML = `
  <p class="section-label">Selected Color</p>
  <div class="selected-color-layout">
    <div id="selectedColorPreview" class="selected-color-preview" aria-hidden="true"></div>
    <div class="selected-color-meta">
      <div class="selected-color-row">
        <span class="meta-label">Name</span>
        <span id="selectedName" class="meta-value">--</span>
      </div>
      <div class="selected-color-row">
        <span class="meta-label">Role</span>
        <span id="selectedRole" class="meta-value">--</span>
      </div>
      <div class="selected-color-row">
        <span class="meta-label">Temperature</span>
        <span id="selectedTemperature" class="meta-value">--</span>
      </div>
      <div class="selected-color-row">
        <span class="meta-label">Value</span>
        <span id="selectedValueBand" class="meta-value">--</span>
      </div>
      <div class="selected-color-row">
        <span class="meta-label">Chroma</span>
        <span id="selectedChroma" class="meta-value">--</span>
      </div>
      <div class="selected-color-row">
        <span class="meta-label">Presence</span>
        <span id="selectedCoverage" class="meta-value">--</span>
      </div>
      <button id="selectedTechnicalToggle" class="button-secondary technical-toggle" type="button">Show technical data</button>
      <div id="selectedTechnicalData" class="technical-data hidden">
        <div class="selected-color-row">
          <span class="meta-label">HEX</span>
          <span id="selectedHex" class="meta-value">--</span>
        </div>
        <div class="selected-color-row">
          <span class="meta-label">RGB</span>
          <span id="selectedRgb" class="meta-value">--</span>
        </div>
        <div class="selected-color-row">
          <span class="meta-label">HSL</span>
          <span id="selectedHsl" class="meta-value">--</span>
        </div>
      </div>
    </div>
  </div>
  <p class="detail-copy">Look for whether this color works as a shadow, midtone, or accent.</p>
`;

selectedColorCard.style.display = "none";
if (legacySwatchGridCard) {
  legacySwatchGridCard.style.display = "none";
}

const selectedColorPreview = document.getElementById("selectedColorPreview");
const selectedName = document.getElementById("selectedName");
const selectedRole = document.getElementById("selectedRole");
const selectedTemperature = document.getElementById("selectedTemperature");
const selectedValueBand = document.getElementById("selectedValueBand");
const selectedChroma = document.getElementById("selectedChroma");
const selectedCoverage = document.getElementById("selectedCoverage");
const selectedHex = document.getElementById("selectedHex");
const selectedRgb = document.getElementById("selectedRgb");
const selectedHsl = document.getElementById("selectedHsl");
const selectedTechnicalToggle = document.getElementById("selectedTechnicalToggle");
const selectedTechnicalData = document.getElementById("selectedTechnicalData");
const harmonySummary = document.getElementById("harmonySummary");
const harmonyPrimary = document.getElementById("harmonyPrimary");
const harmonySecondary = document.getElementById("harmonySecondary");
const harmonyConfidence = document.getElementById("harmonyConfidence");
const harmonyConfidenceFill = document.getElementById("harmonyConfidenceFill");
const harmonySwatches = document.getElementById("harmonySwatches");
const harmonyExplanation = document.getElementById("harmonyExplanation");
const harmonyHint = document.getElementById("harmonyHint");
const harmonySchemeVisual = document.getElementById("harmonySchemeVisual");
const harmonySchemeCard = document.getElementById("harmonySchemeCard");
const harmonySchemeTitle = document.getElementById("harmonySchemeTitle");
const harmonySchemeVisualWrap = document.getElementById("harmonySchemeVisualWrap");
const harmonySchemeName = document.getElementById("harmonySchemeName");
const harmonySchemeSecondary = document.getElementById("harmonySchemeSecondary");
const harmonySchemeConfidence = document.getElementById("harmonySchemeConfidence");
const harmonySchemeConfidenceFill = document.getElementById("harmonySchemeConfidenceFill");
const harmonySchemeMeaningSection = document.getElementById("harmonySchemeMeaningSection");
const harmonySchemeMeaningLabel = document.getElementById("harmonySchemeMeaningLabel");
const harmonySchemeMeaning = document.getElementById("harmonySchemeMeaning");
const harmonySchemeUseSection = document.getElementById("harmonySchemeUseSection");
const harmonySchemeUseLabel = document.getElementById("harmonySchemeUseLabel");
const harmonySchemeUse = document.getElementById("harmonySchemeUse");
const harmonySchemeSuggestionsSection = document.getElementById("harmonySchemeSuggestionsSection");
const harmonySchemeSuggestionsLabel = document.getElementById("harmonySchemeSuggestionsLabel");
const harmonySchemeSuggestions = document.getElementById("harmonySchemeSuggestions");
const harmonySchemeDoDontSection = document.getElementById("harmonySchemeDoDontSection");
const harmonySchemeDo = document.getElementById("harmonySchemeDo");
const harmonySchemeDont = document.getElementById("harmonySchemeDont");
const breakdownToggle = document.getElementById("breakdownToggle");
const breakdownContent = document.getElementById("breakdownContent");
const sampleMarker = document.getElementById("sampleMarker");
const colorHarmonyCard = document.getElementById("colorHarmonyCard");
const mixerCard = document.getElementById("mixerCard");
const mixerIntro = document.getElementById("mixerIntro");
const mixerSwatch = document.getElementById("mixerSwatch");
const mixerValue = document.getElementById("mixerValue");
const mixerTemperature = document.getElementById("mixerTemperature");
const mixerChroma = document.getElementById("mixerChroma");
const mixerRole = document.getElementById("mixerRole");
const mixerFamily = document.getElementById("mixerFamily");
const mixerHex = document.getElementById("mixerHex");
const mixerMixList = document.getElementById("mixerMixList");
const mixerNotes = document.getElementById("mixerNotes");
const mixerNotesSection = document.getElementById("mixerNotesSection");
const mixerAltSection = document.getElementById("mixerAltSection");
const mixerAltList = document.getElementById("mixerAltList");
const mixerTags = document.getElementById("mixerTags");
const mixerTagsSection = document.getElementById("mixerTagsSection");
const mixerLogicToggle = document.getElementById("mixerLogicToggle");
const mixerLogicToggleLabel = document.getElementById("mixerLogicToggleLabel");
const mixerLogicContent = document.getElementById("mixerLogicContent");
const mixerLogicIntro = document.getElementById("mixerLogicIntro");
const mixerPaletteList = document.getElementById("mixerPaletteList");
const mixerLogicRules = document.getElementById("mixerLogicRules");
const trainerCard = document.getElementById("trainerCard");
const trainerIntro = document.getElementById("trainerIntro");
const trainerSwatch = document.getElementById("trainerSwatch");
const trainerValue = document.getElementById("trainerValue");
const trainerTemperature = document.getElementById("trainerTemperature");
const trainerChroma = document.getElementById("trainerChroma");
const trainerRole = document.getElementById("trainerRole");
const trainerFamily = document.getElementById("trainerFamily");
const trainerPigmentGrid = document.getElementById("trainerPigmentGrid");
const trainerSelectedList = document.getElementById("trainerSelectedList");
const trainerCheckButton = document.getElementById("trainerCheckButton");
const trainerResultBlock = document.getElementById("trainerResultBlock");
const trainerScoreLabel = document.getElementById("trainerScoreLabel");
const trainerScoreValue = document.getElementById("trainerScoreValue");
const trainerScoreFill = document.getElementById("trainerScoreFill");
const trainerYourMix = document.getElementById("trainerYourMix");
const trainerM8Mix = document.getElementById("trainerM8Mix");
const trainerFeedback = document.getElementById("trainerFeedback");
const trainerImprove = document.getElementById("trainerImprove");
const premiumUnlockCard = document.getElementById("premiumUnlockCard");
const premiumUnlockTitle = document.getElementById("premiumUnlockTitle");
const premiumUnlockText = document.getElementById("premiumUnlockText");
const premiumUnlockNote = document.getElementById("premiumUnlockNote");
const premiumUnlockButton = document.getElementById("premiumUnlockButton");
const premiumToast = document.getElementById("premiumToast");
const painterInterpretation = document.getElementById("painterInterpretation");
const howToPaint = document.getElementById("howToPaint");
const valueStructure = document.getElementById("valueStructure");
const focalColor = document.getElementById("focalColor");

const SAMPLE_SIZE = 60;
const PALETTE_SIZE = 8;
const HARMONY_SAMPLE_SIZE = 84;
const HARMONY_CLUSTER_COUNT = 8;
const GLOBAL_UNLOCK_STORAGE_KEY = "m8_unlocked";
const COLOR_MIXER_USES_STORAGE_KEY = "m8_color_mixer_uses";
const FREE_COLOR_MIXER_LIMIT = 3;
const GLOBAL_UNLOCK_PAYMENT_LINK = "https://buy.stripe.com/cNi14n0Nhfj5deH2u8gw001";
const GLOBAL_UNLOCK_BODY = "One payment unlocks all M8 Painting Tools. Includes Quick Check, Advanced Composition, Color Mixer, Mix Trainer, and all premium modules. Personal Feedback is separate.";
const M8_PALETTE = {
  whites: ["Titanium White", "Lead White"],
  yellows: ["Cadmium Yellow Deep", "Cadmium Yellow Medium", "Yellow Ochre", "Raw Sienna", "Naples Yellow Light"],
  reds: ["Cadmium Red Deep", "Cadmium Red Medium", "Alizarin Crimson", "Transparent Oxide Red"],
  blues: ["Ultramarine Blue", "Prussian Blue", "King's Blue"],
  greens: ["Viridian"],
  earths: ["Burnt Umber", "Ivory Black"]
};

const MIXER_LOGIC_INTRO_LINES = [
  "This mixer is built around a limited practical oil palette that keeps mixtures cleaner and more believable in paint.",
  "It favors transparent shadows, warm lights, cooler halftones, warmer shadows, and mixtures capped at four pigments, with two or three preferred."
];

const MIXER_LOGIC_RULES = [
  "Shadows are kept mostly transparent.",
  "Warm lights, cooler halftones, warmer shadows.",
  "Burnt Umber plus Ultramarine is the main shadow and gray engine.",
  "Naples Yellow Light lifts value without cooling the mixture.",
  "Alizarin Crimson cools and deepens reds and dark mixtures.",
  "Mixtures should stay simple.",
  "Maximum four pigments, ideally two to three."
];

const MIXER_PALETTE_REFERENCE = [
  { name: "Titanium White", swatch: "#f3f0e8", role: "Default working white for most lights and general mixing." },
  { name: "Lead White", swatch: "#e4ddd0", role: "Reserved for traditional lead-white behavior and quieter opacity when needed." },
  { name: "Naples Yellow Light", swatch: "#e6cf8f", role: "Warm lightener for lifting value without making the color go cold." },
  { name: "Cadmium Yellow Deep", swatch: "#d89b1f", role: "Main warm yellow for sunlit notes and warm high-chroma lights." },
  { name: "Cadmium Yellow Medium", swatch: "#efb41e", role: "Cleaner, brighter yellow for more chromatic and slightly cooler yellow passages." },
  { name: "Yellow Ochre", swatch: "#b78a34", role: "Natural earth yellow for muted, painterly yellow families." },
  { name: "Raw Sienna", swatch: "#a9712d", role: "Darker earth yellow when the passage needs warmth at a lower value." },
  { name: "Cadmium Red Deep", swatch: "#9f3325", role: "Warm red for warm accents and light-side warmth." },
  { name: "Cadmium Red Medium", swatch: "#bf3e2c", role: "Cleaner red when higher chroma is needed without leaning too warm." },
  { name: "Alizarin Crimson", swatch: "#68283a", role: "Cool dark red for cooling, deepening, and shadow-side red shifts." },
  { name: "Transparent Oxide Red", swatch: "#8d4425", role: "Warm transparent red for pushing dark mixtures toward warm shadow reds." },
  { name: "Ultramarine Blue", swatch: "#40507f", role: "Default working blue and the main partner for shadow neutrals and grays." },
  { name: "Prussian Blue", swatch: "#274a6b", role: "Higher-chroma cooler blue when the note needs more intensity." },
  { name: "King's Blue", swatch: "#95b7d7", role: "Light cooling blue for subdued highlights and cooled midtones." },
  { name: "Viridian", swatch: "#3d826c", role: "Special-use cool green when a distinctly cooler green family is needed." },
  { name: "Burnt Umber", swatch: "#5d3a22", role: "Core earth for understructure, warm neutralizing, and shadow construction." },
  { name: "Ivory Black", swatch: "#2b2723", role: "Used sparingly for the deepest darks or especially dark green mixtures." }
];

const TRAINER_PIGMENT_OPTIONS = MIXER_PALETTE_REFERENCE.filter((item) => item.name !== "Lead White");

const state = {
  objectUrl: null,
  palette: [],
  selectedIndex: -1,
  activeTab: "palette",
  selectedTechnicalOpen: false,
  technicalOpenByIndex: {},
  harmony: null,
  analysisResult: null,
  breakdownExpanded: false,
  mixerLogicExpanded: false,
  premiumUnlockVisible: false,
  premiumToastTimeout: null,
  sampledPoint: null,
  sampledColor: null,
  mixerResult: null,
  trainerSelection: [],
  trainerEvaluation: null
};

fileInput.addEventListener("change", handleUpload);
imageWrap.addEventListener("click", handleImageWrapClick);
imageWrap.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tab));
});

selectedTechnicalToggle.addEventListener("click", () => {
  state.selectedTechnicalOpen = !state.selectedTechnicalOpen;
});

if (breakdownToggle) {
  breakdownToggle.addEventListener("click", () => {
    setBreakdownExpanded(!state.breakdownExpanded);
  });
}

if (mixerLogicToggle) {
  mixerLogicToggle.addEventListener("click", () => {
    setMixerLogicExpanded(!state.mixerLogicExpanded);
  });
}

if (trainerCheckButton) {
  trainerCheckButton.addEventListener("click", checkTrainerMix);
}

premiumUnlockButton?.addEventListener("click", () => {
  window.location.href = GLOBAL_UNLOCK_PAYMENT_LINK;
});

setBreakdownExpanded(false);
setMixerLogicExpanded(false);
renderMixerLogicReference();
setTab("palette");

function isUnlocked() {
  return localStorage.getItem(GLOBAL_UNLOCK_STORAGE_KEY) === "true";
}

function getColorMixerUses() {
  return Number(localStorage.getItem(COLOR_MIXER_USES_STORAGE_KEY) || "0");
}

function incrementColorMixerUses() {
  if (isUnlocked()) {
    return getColorMixerUses();
  }

  const nextValue = getColorMixerUses() + 1;
  localStorage.setItem(COLOR_MIXER_USES_STORAGE_KEY, String(nextValue));
  return nextValue;
}

function getRemainingColorMixerUses() {
  return Math.max(0, FREE_COLOR_MIXER_LIMIT - getColorMixerUses());
}

function canUseColorMixer() {
  return isUnlocked() || getColorMixerUses() < FREE_COLOR_MIXER_LIMIT;
}

function hidePremiumUnlockCard() {
  state.premiumUnlockVisible = false;
  premiumUnlockCard?.classList.add("hidden");
}

function showUnlockPaywall(context = {}) {
  state.premiumUnlockVisible = true;
  if (premiumUnlockTitle) {
    premiumUnlockTitle.textContent = context.title || "Unlock full access";
  }
  if (premiumUnlockText) {
    premiumUnlockText.textContent = GLOBAL_UNLOCK_BODY;
  }
  if (premiumUnlockNote) {
    premiumUnlockNote.textContent = context.note || "This payment unlocks the full app, not just this section.";
  }
  premiumUnlockCard?.classList.remove("hidden");
  if (context.status) {
    statusNote.textContent = context.status;
  }
  showPremiumLimitToast(context.toast || "Free limit reached. Tap Unlock All Tools to continue.");
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

  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
  }

  state.objectUrl = URL.createObjectURL(file);
  previewImage.onload = () => {
    previewImage.style.display = "block";
    emptyState.style.display = "none";
    workspaceHint.textContent = "Color families sampled from the uploaded image.";
    statusNote.textContent = ["mixer", "trainer"].includes(state.activeTab) ? "Click a point in the image to begin." : "Palette analysis ready.";
    hidePremiumUnlockCard();
    resetMixerSampling();
    imageWrap.classList.toggle("sampling-enabled", ["mixer", "trainer"].includes(state.activeTab));
    extractPalette(previewImage);
  };
  previewImage.src = state.objectUrl;
}

function handleImageWrapClick(event) {
  const hasImage = previewImage.src && previewImage.style.display === "block" && previewImage.naturalWidth;
  if (["mixer", "trainer"].includes(state.activeTab) && hasImage && event.target === previewImage) {
    sampleMixerPoint(event);
    return;
  }
  fileInput.click();
}

function setTab(tab) {
  state.activeTab = tab;

  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });

  imageWrap.classList.toggle("sampling-enabled", ["mixer", "trainer"].includes(tab) && !!previewImage.src);
  if (sampleMarker) {
    sampleMarker.classList.toggle("hidden", !((tab === "mixer" || tab === "trainer") && state.sampledPoint));
  }

  if (tab === "palette") {
    hidePremiumUnlockCard();
    panelTitle.textContent = "Palette Analysis";
    panelDescription.textContent = "Sample the main color families in your image and see which hues dominate the overall painting.";
    statusNote.textContent = state.palette.length ? "Palette analysis ready." : "Upload an image to start.";
    if (colorHarmonyCard) {
      colorHarmonyCard.classList.remove("hidden");
    }
    if (breakdownToggle) {
      breakdownToggle.parentElement?.classList.remove("hidden");
    }
    if (breakdownContent) {
      breakdownContent.classList.remove("hidden");
      breakdownContent.classList.toggle("is-expanded", state.breakdownExpanded);
    }
    if (mixerCard) {
      mixerCard.classList.add("hidden");
    }
    if (trainerCard) {
      trainerCard.classList.add("hidden");
    }
    setMixerSupportMode(false);
    setTrainerSupportMode(false);
    renderPaletteSummary();
    renderHarmonyAnalysis(state.harmony);
    return;
  }

  panelTitle.textContent = tab === "trainer" ? "M8 Mix Trainer" : "M8 Color Mixer";
  panelDescription.textContent = tab === "trainer"
    ? "Click a passage in the image, choose your pigments, then compare your choice with M8 mixing logic."
    : "Click a passage in the image to see the most likely way M8 would mix that note in oil.";
  if (paletteSummary) {
    paletteSummary.textContent = tab === "mixer"
      ? "Sample one passage and read it as a practical oil mixture, not as a digital color match."
      : tab === "trainer"
        ? "Train your eye by choosing a simple paint mixture before the M8 answer is revealed."
        : "This mode is not active yet.";
  }
  if (tab === "mixer") {
    if (colorHarmonyCard) {
      colorHarmonyCard.classList.add("hidden");
    }
    if (breakdownToggle) {
      breakdownToggle.parentElement?.classList.add("hidden");
    }
    if (breakdownContent) {
      breakdownContent.classList.add("hidden");
    }
    if (mixerCard) {
      mixerCard.classList.remove("hidden");
    }
    if (trainerCard) {
      trainerCard.classList.add("hidden");
    }
    premiumUnlockCard?.classList.toggle("hidden", !state.premiumUnlockVisible);
    setMixerSupportMode(true);
    setTrainerSupportMode(false);
    renderM8ColorMixer(state.mixerResult);
    statusNote.textContent = state.mixerResult
      ? "Mixer suggestion ready."
      : (isUnlocked()
        ? "Click a point in the image to build a mix."
        : `Click a point in the image to build a mix. ${getRemainingColorMixerUses()} free uses remaining.`);
    return;
  }

  if (tab === "trainer") {
    if (colorHarmonyCard) {
      colorHarmonyCard.classList.add("hidden");
    }
    if (breakdownToggle) {
      breakdownToggle.parentElement?.classList.add("hidden");
    }
    if (breakdownContent) {
      breakdownContent.classList.add("hidden");
    }
    if (mixerCard) {
      mixerCard.classList.add("hidden");
    }
    if (trainerCard) {
      trainerCard.classList.remove("hidden");
    }
    premiumUnlockCard?.classList.toggle("hidden", !state.premiumUnlockVisible);
    setMixerSupportMode(false);
    setTrainerSupportMode(true);
    renderMixTrainer();
    statusNote.textContent = isUnlocked()
      ? (state.sampledColor ? "Choose your pigments, then check your mix." : "Click a point in the image to begin training.")
      : "Mix Trainer is part of full premium access. Open a point to unlock the full app.";
    return;
  }

  hidePremiumUnlockCard();
  if (colorHarmonyCard) {
    colorHarmonyCard.classList.add("hidden");
  }
  if (breakdownToggle) {
    breakdownToggle.parentElement?.classList.add("hidden");
  }
  if (breakdownContent) {
    breakdownContent.classList.add("hidden");
  }
  if (mixerCard) {
    mixerCard.classList.add("hidden");
  }
  if (trainerCard) {
    trainerCard.classList.add("hidden");
  }
  setMixerSupportMode(false);
  setTrainerSupportMode(false);
  statusNote.textContent = "This mode is not active yet.";
}

function extractPalette(image) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  ctx.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const buckets = new Map();
  let totalSamples = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha < 120) {
      continue;
    }

    const r = quantizeChannel(data[index]);
    const g = quantizeChannel(data[index + 1]);
    const b = quantizeChannel(data[index + 2]);
    const key = `${r},${g},${b}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
    totalSamples += 1;
  }

  state.palette = Array.from(buckets.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, PALETTE_SIZE)
    .map(([key, count]) => {
      const [r, g, b] = key.split(",").map(Number);
      const coverage = totalSamples ? (count / totalSamples) * 100 : 0;
      const hsl = rgbToHslData(r, g, b);
      return {
        r,
        g,
        b,
        hex: rgbToHex(r, g, b),
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: formatHsl(hsl),
        coverage,
        brightness: getBrightness(r, g, b),
        hue: hsl.hue,
        saturation: hsl.saturation,
        lightness: hsl.lightness
      };
    });

  state.palette = buildPaletteInterpretation(state.palette);
  state.selectedIndex = state.palette.length ? 0 : -1;
  state.selectedTechnicalOpen = false;
  state.technicalOpenByIndex = {};

  renderPaletteSummary();
  analyzeHarmony();
}

function renderPaletteSummary() {
  if (!paletteSummary) {
    return;
  }

  if (!state.palette.length) {
    paletteSummary.textContent = "Upload an image to see a painter-friendly summary of the main color roles.";
    return;
  }

  paletteSummary.textContent = getPaletteSummary(state.palette);
}

function analyzeHarmony() {
  if (!previewImage.src || !previewImage.complete || !previewImage.naturalWidth) {
    state.harmony = null;
    state.analysisResult = null;
    renderHarmonyAnalysis(null);
    return;
  }

  const colors = extractDominantColors(previewImage);
  const groups = groupHueFamilies(colors);
  const harmony = detectHarmony(groups, colors);
  const valueAnalysis = analyzeValueStructure(previewImage);
  const focalResult = detectFocalColor({ harmony, dominantColors: colors, valueStructure: valueAnalysis });
  const analysisResult = {
    ...harmony,
    dominantColors: colors,
    valueStructure: valueAnalysis,
    painterInterpretation: generatePainterInterpretation({
      harmony,
      dominantColors: colors,
      valueStructure: valueAnalysis,
      focalColor: focalResult
    }),
    howToPaint: generateHowToPaint({
      harmony,
      dominantColors: colors,
      valueStructure: valueAnalysis,
      focalColor: focalResult
    }),
    focalColor: focalResult
  };

  state.harmony = analysisResult;
  state.analysisResult = analysisResult;
  renderHarmonyAnalysis(analysisResult);
}

function renderHarmonyAnalysis(result) {
  if (!result) {
    harmonySummary.textContent = "Upload an image to analyze the harmony structure of the palette.";
    harmonyPrimary.textContent = "--";
    harmonySecondary.textContent = "--";
    harmonyConfidence.textContent = "--";
    harmonyConfidenceFill.style.width = "0%";
    harmonySwatches.innerHTML = '<p class="swatch-empty">Dominant harmony swatches will appear here.</p>';
    harmonyExplanation.textContent = "The harmony reading will describe how the main hue families relate across the painting.";
    harmonyHint.textContent = "Painter hint: look for whether contrast comes from hue shifts or mostly from value and chroma.";
    renderPainterInterpretation(null);
    renderHowToPaint(null);
    renderValueStructure(null);
    renderFocalColor(null);
    renderHarmonySchemePanel(null);
    return;
  }

  harmonySummary.textContent = result.summary;
  harmonyPrimary.textContent = result.primary;
  harmonySecondary.textContent = result.secondary || "None";
  harmonyConfidence.textContent = `${Math.round(result.confidence * 100)}%`;
  harmonyConfidenceFill.style.width = `${Math.round(result.confidence * 100)}%`;
  harmonyExplanation.textContent = result.explanation;
  harmonyHint.textContent = `Painter hint: ${result.hint}`;
  harmonySwatches.innerHTML = "";

  result.swatches.forEach((color) => {
    const item = document.createElement("div");
    item.className = "harmony-swatch";

    const chip = document.createElement("div");
    chip.className = "harmony-swatch-chip";
    chip.style.background = color.rgb;

    const meta = document.createElement("div");
    meta.className = "harmony-swatch-meta";

    const name = document.createElement("span");
    name.className = "harmony-swatch-name";
    name.textContent = color.painterHueName;

    const note = document.createElement("span");
    note.className = "harmony-swatch-note";
    note.textContent = `${color.coverage.toFixed(1)}% - ${color.temperature} - ${color.valueLabel}`;

    meta.append(name, note);
    item.append(chip, meta);
    harmonySwatches.appendChild(item);
  });

  renderPainterInterpretation(result);
  renderHowToPaint(result);
  renderValueStructure(result.valueStructure);
  renderFocalColor(result.focalColor);
  renderHarmonySchemePanel(result);
}

function resetMixerSampling() {
  state.sampledPoint = null;
  state.sampledColor = null;
  state.mixerResult = null;
  state.trainerSelection = [];
  state.trainerEvaluation = null;
  if (sampleMarker) {
    sampleMarker.classList.add("hidden");
  }
  renderM8ColorMixer(null);
  renderMixTrainer();
  if (state.activeTab === "trainer") {
    renderTrainerSupportPanel();
  }
}

function sampleMixerPoint(event) {
  if (!previewImage.naturalWidth) {
    return;
  }

  if (state.activeTab === "trainer" && !isUnlocked()) {
    showUnlockPaywall({
      title: "Unlock full access",
      note: "Mix Trainer is part of the full-app premium unlock. Personal Feedback is separate.",
      status: "Unlock full access to train against M8 mixing logic.",
      toast: "Mix Trainer is premium. Tap Unlock All Tools to continue."
    });
    return;
  }

  if (state.activeTab === "mixer" && !canUseColorMixer()) {
    showUnlockPaywall({
      title: "Free Color Mixer limit reached",
      note: "Your 3 free Color Mixer uses are finished. One payment unlocks the full app, not just this section.",
      status: "Unlock full access to keep using Color Mixer without limits.",
      toast: "Your free Color Mixer limit is reached. Tap Unlock All Tools to continue."
    });
    return;
  }

  const rect = previewImage.getBoundingClientRect();
  const wrapRect = imageWrap.getBoundingClientRect();
  const relativeX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  const relativeY = clamp((event.clientY - rect.top) / rect.height, 0, 1);

  state.sampledPoint = { x: relativeX, y: relativeY };
  if (sampleMarker) {
    sampleMarker.classList.remove("hidden");
    sampleMarker.style.left = `${event.clientX - wrapRect.left}px`;
    sampleMarker.style.top = `${event.clientY - wrapRect.top}px`;
  }

  state.sampledColor = sampleTargetColor(previewImage, relativeX, relativeY);
  state.mixerResult = buildM8MixerResult(state.sampledColor);
  state.trainerSelection = [];
  state.trainerEvaluation = null;
  hidePremiumUnlockCard();
  if (state.activeTab === "mixer") {
    incrementColorMixerUses();
  }
  if (state.activeTab === "trainer") {
    renderMixTrainer();
    renderTrainerSupportPanel();
    statusNote.textContent = "Choose up to 4 pigments, then check your mix.";
  } else {
    renderM8ColorMixer(state.mixerResult);
    if (isUnlocked()) {
      statusNote.textContent = "Mixer suggestion ready.";
    } else {
      const remainingUses = getRemainingColorMixerUses();
      statusNote.textContent = remainingUses > 0
        ? `Mixer suggestion ready. ${remainingUses} free ${remainingUses === 1 ? "use" : "uses"} remaining.`
        : "Mixer suggestion ready. Your free Color Mixer uses are finished after this result.";
    }
  }
}

function sampleTargetColor(image, relativeX, relativeY) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  ctx.drawImage(image, 0, 0);

  const targetX = Math.round(relativeX * (canvas.width - 1));
  const targetY = Math.round(relativeY * (canvas.height - 1));
  const sampleRadius = Math.max(2, Math.round(Math.min(canvas.width, canvas.height) * 0.006));
  const x = clamp(targetX - sampleRadius, 0, canvas.width - 1);
  const y = clamp(targetY - sampleRadius, 0, canvas.height - 1);
  const width = Math.min(sampleRadius * 2 + 1, canvas.width - x);
  const height = Math.min(sampleRadius * 2 + 1, canvas.height - y);
  const { data } = ctx.getImageData(x, y, width, height);

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] < 120) {
      continue;
    }
    r += data[index];
    g += data[index + 1];
    b += data[index + 2];
    count += 1;
  }

  const avgR = Math.round(r / Math.max(count, 1));
  const avgG = Math.round(g / Math.max(count, 1));
  const avgB = Math.round(b / Math.max(count, 1));
  const brightness = getBrightness(avgR, avgG, avgB);
  const hsl = rgbToHslData(avgR, avgG, avgB);
  const valueStep = brightnessToPainterStep(brightness);
  const temperature = getTemperatureLabel(avgR, avgB);
  const chromaLevel = getMixerChromaLevel(hsl.saturation);
  const family = getMixerFamily({ r: avgR, g: avgG, b: avgB, hue: hsl.hue, saturation: hsl.saturation, temperature, valueStep });
  const formRole = inferFormRole({
    x: targetX,
    y: targetY,
    brightness,
    valueStep,
    saturation: hsl.saturation,
    imageData: ctx.getImageData(Math.max(targetX - 10, 0), Math.max(targetY - 10, 0), Math.min(21, canvas.width - Math.max(targetX - 10, 0)), Math.min(21, canvas.height - Math.max(targetY - 10, 0)))
  });

  return {
    x: relativeX,
    y: relativeY,
    r: avgR,
    g: avgG,
    b: avgB,
    hex: rgbToHex(avgR, avgG, avgB),
    rgb: `rgb(${avgR}, ${avgG}, ${avgB})`,
    hue: hsl.hue,
    saturation: hsl.saturation,
    brightness,
    valueStep,
    temperature,
    chromaLevel,
    formRole,
    family
  };
}

function inferFormRole({ brightness, valueStep, saturation, imageData }) {
  const localContrast = getLocalBrightnessSpread(imageData);
  if (valueStep <= 3) {
    return localContrast > 20 ? "Highlight" : "Light";
  }
  if (valueStep <= 7) {
    return "Light";
  }
  if (valueStep <= 12) {
    return saturation > 48 ? "Light" : "Halftone";
  }
  if (valueStep <= 17) {
    return "Shadow";
  }
  return brightness < 22 || localContrast > 36 ? "Deep Accent" : "Shadow";
}

function getMixerChromaLevel(saturation) {
  if (saturation < 18) {
    return "Low";
  }
  if (saturation < 48) {
    return "Medium";
  }
  return "High";
}

function getMixerFamily({ hue, saturation, temperature, valueStep }) {
  if (saturation < 10) {
    return valueStep <= 7 ? "soft neutral light" : valueStep >= 16 ? "transparent shadow neutral" : "cool neutral gray";
  }
  if (temperature === "Warm" && saturation < 34 && hue >= 45 && hue < 96) {
    return "muted earth yellow";
  }
  if (hue < 24 || hue >= 340) {
    return valueStep >= 14 ? "warm red shadow" : "warm red accent";
  }
  if (hue < 58) {
    return "warm red-orange";
  }
  if (hue < 90) {
    return "muted earth yellow";
  }
  if (hue < 160) {
    return saturation >= 42 ? "muted natural green" : "earth green";
  }
  if (hue < 250) {
    return "cool gray-blue";
  }
  return "muted violet neutral";
}

function getLocalBrightnessSpread(imageData) {
  let min = 255;
  let max = 0;
  const data = imageData.data || [];
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] < 120) {
      continue;
    }
    const brightness = getBrightness(data[index], data[index + 1], data[index + 2]);
    min = Math.min(min, brightness);
    max = Math.max(max, brightness);
  }
  return max - min;
}

function buildM8MixerResult(sample) {
  if (!sample) {
    return null;
  }

  const mix = buildMixFromM8Rules(sample);
  const altMix = generateAlternateMix(sample, mix);
  return {
    sample,
    mix: normalizePercentages(mix),
    notes: generatePainterNotes(sample, mix),
    alternateMix: altMix ? normalizePercentages(altMix.mix) : null,
    alternateLabel: altMix ? altMix.label : "",
    tags: generateMixerTags(sample)
  };
}

function buildMixFromM8Rules(sample) {
  if (sample.formRole === "Highlight") {
    return chooseHighlightMix(sample);
  }
  if (sample.formRole === "Light") {
    return chooseLightMix(sample);
  }
  if (sample.formRole === "Halftone") {
    return chooseHalftoneMix(sample);
  }
  return chooseShadowMix(sample);
}

function chooseHighlightMix(sample) {
  if (sample.temperature === "Cool") {
    return [
      { pigment: "Titanium White", percent: 78 },
      { pigment: "King's Blue", percent: 10 },
      { pigment: "Naples Yellow Light", percent: 12 }
    ];
  }
  if (sample.chromaLevel === "Low") {
    return [
      { pigment: "Titanium White", percent: 66 },
      { pigment: "Naples Yellow Light", percent: 18 },
      { pigment: "Cadmium Yellow Deep", percent: 10 },
      { pigment: "Burnt Umber", percent: 6 }
    ];
  }
  return [
    { pigment: "Titanium White", percent: 72 },
    { pigment: "Cadmium Yellow Deep", percent: 16 },
    { pigment: "Cadmium Red Deep", percent: 12 }
  ];
}

function chooseLightMix(sample) {
  if (sample.family.includes("yellow")) {
    return [
      { pigment: sample.valueStep <= 8 ? "Yellow Ochre" : "Raw Sienna", percent: 48 },
      { pigment: "Naples Yellow Light", percent: 22 },
      { pigment: "Titanium White", percent: 30 }
    ];
  }
  if (sample.family.includes("green")) {
    return [
      { pigment: sample.chromaLevel === "High" ? "Cadmium Yellow Medium" : "Cadmium Yellow Deep", percent: 34 },
      { pigment: "Ultramarine Blue", percent: 28 },
      { pigment: "Titanium White", percent: 28 },
      { pigment: sample.chromaLevel === "Low" ? "Burnt Umber" : "Viridian", percent: 10 }
    ];
  }
  if (sample.temperature === "Cool") {
    return [
      { pigment: "Titanium White", percent: 42 },
      { pigment: "Ultramarine Blue", percent: 30 },
      { pigment: "Burnt Umber", percent: 18 },
      { pigment: "King's Blue", percent: 10 }
    ];
  }
  return [
    { pigment: "Titanium White", percent: 38 },
    { pigment: "Cadmium Yellow Deep", percent: 24 },
    { pigment: sample.chromaLevel === "High" ? "Cadmium Red Medium" : "Cadmium Red Deep", percent: 16 },
    { pigment: sample.chromaLevel === "Low" ? "Burnt Umber" : "Naples Yellow Light", percent: 22 }
  ];
}

function chooseHalftoneMix(sample) {
  if (sample.family.includes("green")) {
    return [
      { pigment: sample.chromaLevel === "High" ? "Cadmium Yellow Medium" : "Cadmium Yellow Deep", percent: 34 },
      { pigment: "Ultramarine Blue", percent: 30 },
      { pigment: sample.chromaLevel === "Low" ? "Alizarin Crimson" : "Burnt Umber", percent: 16 },
      { pigment: "Titanium White", percent: 20 }
    ];
  }
  if (sample.family.includes("red")) {
    return [
      { pigment: "Ultramarine Blue", percent: 28 },
      { pigment: "Burnt Umber", percent: 28 },
      { pigment: sample.temperature === "Cool" ? "Alizarin Crimson" : "Cadmium Red Deep", percent: 20 },
      { pigment: "Titanium White", percent: 24 }
    ];
  }
  return [
    { pigment: "Ultramarine Blue", percent: 32 },
    { pigment: "Burnt Umber", percent: 30 },
    { pigment: "Titanium White", percent: 26 },
    { pigment: sample.temperature === "Cool" ? "King's Blue" : "Naples Yellow Light", percent: 12 }
  ];
}

function chooseShadowMix(sample) {
  if (sample.family.includes("green")) {
    return [
      { pigment: "Ultramarine Blue", percent: 34 },
      { pigment: "Cadmium Yellow Deep", percent: 24 },
      { pigment: sample.temperature === "Cool" ? "Alizarin Crimson" : "Burnt Umber", percent: 26 },
      { pigment: sample.valueStep >= 18 ? "Ivory Black" : "Transparent Oxide Red", percent: 16 }
    ];
  }
  if (sample.family.includes("red") || sample.temperature === "Warm") {
    return [
      { pigment: "Burnt Umber", percent: 42 },
      { pigment: "Ultramarine Blue", percent: 30 },
      { pigment: sample.temperature === "Cool" ? "Alizarin Crimson" : "Transparent Oxide Red", percent: 28 }
    ];
  }
  return [
    { pigment: "Burnt Umber", percent: 46 },
    { pigment: "Ultramarine Blue", percent: 36 },
    { pigment: sample.temperature === "Cool" ? "Alizarin Crimson" : "Transparent Oxide Red", percent: 18 }
  ];
}

function normalizePercentages(mix) {
  const filtered = simplifyMix(mix);
  const total = filtered.reduce((sum, item) => sum + item.percent, 0) || 1;
  let running = 0;
  return filtered.map((item, index) => {
    let percent = Math.round((item.percent / total) * 100);
    running += percent;
    if (index === filtered.length - 1 && running !== 100) {
      percent += 100 - running;
    }
    return { ...item, percent };
  });
}

function simplifyMix(mix) {
  return mix
    .filter((item) => item.percent > 0)
    .sort((left, right) => right.percent - left.percent)
    .slice(0, 4);
}

function generatePainterNotes(sample, mix) {
  const notes = [];
  if (sample.formRole === "Shadow" || sample.formRole === "Deep Accent") {
    notes.push("Keep this mixture transparent and avoid chalkiness.");
    notes.push("Do not rescue the shadow with too much white.");
  } else if (sample.formRole === "Highlight") {
    notes.push("Build this from white and add color sparingly.");
    notes.push(sample.temperature === "Warm"
      ? "Use Naples Yellow or a warm yellow lift if the light must stay warm."
      : "Use King's Blue sparingly if the highlight needs a cooler lift.");
  } else if (sample.formRole === "Halftone") {
    notes.push("Keep the halftone slightly cooler and quieter than the light.");
    notes.push("Let value carry the turn before pushing chroma.");
  } else {
    notes.push("Keep the light mixture warm enough to stay alive.");
  }
  if (mix.some((item) => item.pigment === "Burnt Umber") && mix.some((item) => item.pigment === "Ultramarine Blue")) {
    notes.push("This gray engine should stay alive, not dead-neutral.");
  }
  if (sample.family.includes("green")) {
    notes.push("Mute the green before it becomes decorative.");
  }
  return notes.slice(0, 4);
}

function generateAlternateMix(sample, mix) {
  if (sample.formRole === "Shadow") {
    return {
      label: sample.temperature === "Cool" ? "Warmer option" : "Cooler option",
      mix: [
        { pigment: "Burnt Umber", percent: 40 },
        { pigment: "Ultramarine Blue", percent: 30 },
        { pigment: sample.temperature === "Cool" ? "Transparent Oxide Red" : "Alizarin Crimson", percent: 30 }
      ]
    };
  }
  if (sample.formRole === "Highlight" || sample.formRole === "Light") {
    return {
      label: sample.temperature === "Warm" ? "Cooler option" : "Warmer option",
      mix: sample.temperature === "Warm"
        ? [
            { pigment: "Titanium White", percent: 74 },
            { pigment: "King's Blue", percent: 12 },
            { pigment: "Naples Yellow Light", percent: 14 }
          ]
        : [
            { pigment: "Titanium White", percent: 68 },
            { pigment: "Cadmium Yellow Deep", percent: 18 },
            { pigment: "Cadmium Red Deep", percent: 14 }
          ]
    };
  }
  return null;
}

function generateMixerTags(sample) {
  const tags = [];
  if (sample.formRole === "Shadow" || sample.formRole === "Deep Accent") {
    tags.push("Transparent Shadow");
  }
  if (sample.formRole === "Highlight" || sample.formRole === "Light") {
    tags.push(sample.temperature === "Warm" ? "Warm Highlight" : "Cool Light");
  }
  if (sample.formRole === "Halftone") {
    tags.push("Cool Halftone");
  }
  if (sample.chromaLevel === "Low") {
    tags.push("Muted Earth Tone");
  }
  if (sample.chromaLevel === "High") {
    tags.push("High Chroma Accent");
  }
  return tags.slice(0, 4);
}

function renderM8ColorMixer(result) {
  if (!mixerCard) {
    return;
  }

  if (!result) {
    if (state.activeTab === "mixer" && !isUnlocked()) {
      const remainingUses = getRemainingColorMixerUses();
      mixerIntro.textContent = remainingUses > 0
        ? `Upload an image, then click the exact passage you want to mix. ${remainingUses} free ${remainingUses === 1 ? "use" : "uses"} remaining.`
        : "Your 3 free Color Mixer uses have been used. Unlock full access to keep mixing.";
    } else {
      mixerIntro.textContent = state.activeTab === "mixer"
        ? "Upload an image, then click the exact passage you want to mix."
        : "Upload an image, switch to Color Mixer, then click the exact passage you want to mix.";
    }
    mixerSwatch.style.background = "linear-gradient(180deg, rgba(255,255,255,0.42), rgba(220,214,203,0.8))";
    mixerValue.textContent = "--";
    mixerTemperature.textContent = "--";
    mixerChroma.textContent = "--";
    mixerRole.textContent = "--";
    mixerFamily.textContent = "--";
    mixerHex.textContent = "--";
    mixerMixList.innerHTML = '<p class="detail-copy">No mixture yet.</p>';
    mixerNotes.innerHTML = '<p class="detail-copy">Painter notes will appear here after sampling.</p>';
    mixerAltSection.classList.add("hidden");
    mixerAltList.innerHTML = "";
    mixerTags.innerHTML = '<span class="detail-copy">No behavior tags yet.</span>';
    renderMixerSupportPanel(null);
    return;
  }

  mixerIntro.textContent = "This read favors a believable painterly mixture over a mathematically exact screen match.";
  mixerSwatch.style.background = result.sample.rgb;
  mixerValue.textContent = `${result.sample.valueStep} / 20`;
  mixerTemperature.textContent = result.sample.temperature;
  mixerChroma.textContent = result.sample.chromaLevel;
  mixerRole.textContent = result.sample.formRole;
  mixerFamily.textContent = result.sample.family;
  mixerHex.textContent = result.sample.hex;

  mixerMixList.innerHTML = "";
  result.mix.forEach((item) => {
    mixerMixList.appendChild(buildMixRow(item));
  });

  mixerNotes.innerHTML = "";
  result.notes.forEach((note) => {
    const item = document.createElement("p");
    item.className = "scheme-item";
    item.textContent = note;
    mixerNotes.appendChild(item);
  });

  if (result.alternateMix && result.alternateMix.length) {
    mixerAltSection.classList.remove("hidden");
    mixerAltList.innerHTML = "";
    const title = document.createElement("p");
    title.className = "detail-copy";
    title.textContent = result.alternateLabel;
    mixerAltList.appendChild(title);
    result.alternateMix.forEach((item) => {
      mixerAltList.appendChild(buildMixRow(item));
    });
  } else {
    mixerAltSection.classList.add("hidden");
    mixerAltList.innerHTML = "";
  }

  mixerTags.innerHTML = "";
  result.tags.forEach((tag) => {
    const item = document.createElement("span");
    item.className = "mixer-tag";
    item.textContent = tag;
    mixerTags.appendChild(item);
  });

  renderMixerSupportPanel(result);
}

function renderMixTrainer() {
  if (!trainerCard) {
    return;
  }

  const hasSample = !!state.sampledColor;
  trainerIntro.textContent = isUnlocked()
    ? (hasSample
      ? "Choose the simplest believable mixture first, then compare it with the M8 answer."
      : state.activeTab === "trainer"
        ? "Upload an image, then click the exact passage you want to train on."
        : "Switch to Mix Trainer and click a passage in the image to begin.")
    : "Mix Trainer is part of the full premium unlock. Open a passage when you're ready to unlock the full app.";

  trainerSwatch.style.background = hasSample ? state.sampledColor.rgb : "linear-gradient(180deg, rgba(255,255,255,0.42), rgba(220,214,203,0.8))";
  trainerValue.textContent = hasSample ? `${state.sampledColor.valueStep} / 20` : "--";
  trainerTemperature.textContent = hasSample ? state.sampledColor.temperature : "--";
  trainerChroma.textContent = hasSample ? state.sampledColor.chromaLevel : "--";
  trainerRole.textContent = hasSample ? state.sampledColor.formRole : "--";
  trainerFamily.textContent = hasSample ? state.sampledColor.family : "--";

  renderTrainerPigments();
  renderTrainerSelectedList();

  trainerCheckButton.disabled = !hasSample || !state.trainerSelection.length || !isUnlocked();
  trainerCheckButton.classList.toggle("is-disabled", trainerCheckButton.disabled);

  if (!state.trainerEvaluation) {
    trainerResultBlock.classList.add("hidden");
    trainerScoreLabel.textContent = "--";
    trainerScoreValue.textContent = "--";
    trainerScoreFill.style.width = "0%";
    trainerYourMix.innerHTML = "";
    trainerM8Mix.innerHTML = "";
    trainerFeedback.innerHTML = "";
    trainerImprove.innerHTML = "";
    return;
  }

  const result = state.trainerEvaluation;
  trainerResultBlock.classList.remove("hidden");
  trainerScoreLabel.textContent = result.label;
  trainerScoreValue.textContent = `${result.score} / 100`;
  trainerScoreFill.style.width = `${result.score}%`;

  trainerYourMix.innerHTML = "";
  result.userMix.forEach((item) => {
    trainerYourMix.appendChild(buildMixRow(item));
  });

  trainerM8Mix.innerHTML = "";
  result.m8Mix.forEach((item) => {
    trainerM8Mix.appendChild(buildMixRow(item));
  });

  renderSchemeList(trainerFeedback, result.feedback, true);
  renderSchemeList(trainerImprove, result.improve, true);
}

function renderTrainerPigments() {
  if (!trainerPigmentGrid) {
    return;
  }

  trainerPigmentGrid.innerHTML = "";
  TRAINER_PIGMENT_OPTIONS.forEach((pigment) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "trainer-pigment-button";
    const isSelected = state.trainerSelection.includes(pigment.name);
    const limitReached = state.trainerSelection.length >= 4 && !isSelected;
    button.classList.toggle("is-selected", isSelected);
    button.classList.toggle("is-disabled", limitReached);
    button.disabled = !state.sampledColor || limitReached;
    button.addEventListener("click", () => toggleTrainerPigment(pigment.name));

    const swatch = document.createElement("span");
    swatch.className = "trainer-pigment-swatch";
    swatch.style.background = pigment.swatch;

    const label = document.createElement("span");
    label.textContent = pigment.name;

    button.append(swatch, label);
    trainerPigmentGrid.appendChild(button);
  });
}

function renderTrainerSelectedList() {
  if (!trainerSelectedList) {
    return;
  }

  trainerSelectedList.innerHTML = "";
  if (!state.trainerSelection.length) {
    trainerSelectedList.innerHTML = '<span class="detail-copy">No pigments selected yet.</span>';
    return;
  }

  state.trainerSelection.forEach((name) => {
    const item = document.createElement("span");
    item.className = "mixer-tag";
    item.textContent = name;
    trainerSelectedList.appendChild(item);
  });
}

function toggleTrainerPigment(name) {
  if (!state.sampledColor) {
    return;
  }

  if (state.trainerSelection.includes(name)) {
    state.trainerSelection = state.trainerSelection.filter((item) => item !== name);
  } else if (state.trainerSelection.length < 4) {
    state.trainerSelection = [...state.trainerSelection, name];
  }

  state.trainerEvaluation = null;
  renderMixTrainer();
  renderTrainerSupportPanel();
}

function checkTrainerMix() {
  if (!isUnlocked()) {
    showUnlockPaywall({
      title: "Unlock full access",
      note: "Mix Trainer is included in the full-app unlock. Personal Feedback is separate.",
      status: "Unlock full access to compare your mix with M8 logic.",
      toast: "Mix Trainer is premium. Tap Unlock All Tools to continue."
    });
    return;
  }

  if (!state.sampledColor || !state.trainerSelection.length) {
    return;
  }

  state.trainerEvaluation = evaluateTrainerMix(state.sampledColor, state.trainerSelection, state.mixerResult);
  renderMixTrainer();
  renderTrainerSupportPanel();
  statusNote.textContent = "Mix trainer feedback ready.";
}

function evaluateTrainerMix(sample, selectedPigments, mixerResult) {
  const correctMix = mixerResult || buildM8MixerResult(sample);
  const expected = correctMix.mix.map((item) => item.pigment);
  const selectedSet = new Set(selectedPigments);
  const expectedSet = new Set(expected);
  const matched = expected.filter((pigment) => selectedSet.has(pigment));
  const extras = selectedPigments.filter((pigment) => !expectedSet.has(pigment));
  let score = 0;

  score += matched.length / Math.max(expected.length, 1) * 58;
  score -= extras.length * 8;

  if (selectedPigments.length <= 3) {
    score += 12;
  } else if (selectedPigments.length === 4) {
    score += 6;
  }

  score += getTrainerLogicBonus(sample, selectedSet);
  score = clamp(Math.round(score), 0, 100);

  const label = score >= 88 ? "Excellent" : score >= 72 ? "Good" : score >= 55 ? "Close" : "Needs adjustment";
  const feedback = buildTrainerFeedback(sample, selectedPigments, matched, extras, correctMix.mix, score);
  const improve = buildTrainerImproveTips(sample, selectedSet, correctMix.mix);

  return {
    score,
    label,
    userMix: selectedPigments.map((pigment) => ({ pigment, percent: Math.round(100 / selectedPigments.length) })),
    m8Mix: correctMix.mix,
    feedback,
    improve
  };
}

function getTrainerLogicBonus(sample, selectedSet) {
  let bonus = 0;
  const hasWhite = selectedSet.has("Titanium White") || selectedSet.has("Lead White");

  if ((sample.formRole === "Shadow" || sample.formRole === "Deep Accent") && selectedSet.has("Burnt Umber") && selectedSet.has("Ultramarine Blue")) {
    bonus += 18;
  }
  if ((sample.formRole === "Shadow" || sample.formRole === "Deep Accent") && hasWhite) {
    bonus -= 20;
  }
  if ((sample.formRole === "Highlight" || sample.formRole === "Light") && sample.temperature === "Warm" && selectedSet.has("Naples Yellow Light")) {
    bonus += 10;
  }
  if (sample.formRole === "Halftone" && (selectedSet.has("King's Blue") || selectedSet.has("Ultramarine Blue"))) {
    bonus += 8;
  }
  if (sample.family.includes("red") && sample.temperature === "Cool" && selectedSet.has("Alizarin Crimson")) {
    bonus += 8;
  }
  if (sample.family.includes("green") && selectedSet.has("Burnt Umber")) {
    bonus += 6;
  }
  if (sample.chromaLevel === "High" && selectedSet.has("Burnt Umber") && selectedSet.size >= 3) {
    bonus -= 6;
  }

  return bonus;
}

function buildTrainerFeedback(sample, selectedPigments, matched, extras, correctMix, score) {
  const feedback = [];
  if (matched.length) {
    feedback.push(`Good call on ${matched.join(", ")}${matched.length > 1 ? " as core pigments" : " as a core pigment"}.`);
  }
  if ((sample.formRole === "Shadow" || sample.formRole === "Deep Accent") && matched.includes("Burnt Umber") && matched.includes("Ultramarine Blue")) {
    feedback.push("Good shadow base using Burnt Umber plus Ultramarine.");
  }
  if ((sample.formRole === "Shadow" || sample.formRole === "Deep Accent") && selectedPigments.some((pigment) => pigment.includes("White"))) {
    feedback.push("This mix is too opaque for a deep shadow. Avoid adding white there.");
  }
  if ((sample.formRole === "Highlight" || sample.formRole === "Light") && sample.temperature === "Warm" && selectedPigments.includes("Naples Yellow Light")) {
    feedback.push("Naples Yellow Light helps lift the value without cooling the note.");
  }
  if (!matched.length) {
    feedback.push("You missed the main engine of this mixture, so the structure of the note shifts away from the M8 logic.");
  }
  if (extras.length) {
    feedback.push(`The mix can be cleaner without ${extras.join(", ")}.`);
  }
  if (selectedPigments.length > 3) {
    feedback.push("This could be simplified to fewer pigments.");
  }
  if (score >= 88) {
    feedback.push("This reads very close to the way M8 would likely mix it.");
  }
  return feedback.slice(0, 4);
}

function buildTrainerImproveTips(sample, selectedSet, correctMix) {
  const improve = [];
  const correctPigments = correctMix.map((item) => item.pigment);

  if (sample.temperature === "Warm" && !selectedSet.has("Naples Yellow Light") && (sample.formRole === "Highlight" || sample.formRole === "Light")) {
    improve.push("Warmer: use Naples Yellow Light or a warmer yellow lift instead of relying only on white.");
  }
  if (sample.temperature === "Cool" && !selectedSet.has("Ultramarine Blue") && !selectedSet.has("King's Blue")) {
    improve.push("Cooler: lean more on Ultramarine or King's Blue.");
  }
  if (sample.formRole === "Shadow" && !selectedSet.has("Burnt Umber")) {
    improve.push("More grounded: start the shadow from Burnt Umber.");
  }
  if (sample.formRole === "Shadow" && !selectedSet.has("Ultramarine Blue")) {
    improve.push("Deeper and cooler: add Ultramarine to the shadow engine.");
  }
  if (sample.chromaLevel === "Low" && !selectedSet.has("Burnt Umber") && !selectedSet.has("Alizarin Crimson")) {
    improve.push("More muted: use Umber or Crimson to quiet the color.");
  }
  if (sample.chromaLevel === "High" && selectedSet.has("Burnt Umber") && !correctPigments.includes("Burnt Umber")) {
    improve.push("More chroma: reduce the earth component and keep the cleaner pigments doing the work.");
  }
  if (!improve.length) {
    improve.push("Try simplifying the mixture and let value plus temperature carry more of the note.");
  }
  return improve.slice(0, 4);
}

function setMixerLogicExpanded(expanded) {
  state.mixerLogicExpanded = expanded;
  if (mixerLogicContent) {
    mixerLogicContent.classList.toggle("hidden", !expanded);
  }
  if (mixerLogicToggle) {
    mixerLogicToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  }
  if (mixerLogicToggleLabel) {
    mixerLogicToggleLabel.textContent = expanded ? "Hide" : "Show";
  }
}

function renderMixerLogicReference() {
  if (mixerLogicIntro) {
    renderSchemeCopy(mixerLogicIntro, MIXER_LOGIC_INTRO_LINES);
  }

  if (mixerPaletteList) {
    mixerPaletteList.innerHTML = "";
    MIXER_PALETTE_REFERENCE.forEach((item) => {
      const row = document.createElement("div");
      row.className = "mixer-palette-item";

      const swatch = document.createElement("span");
      swatch.className = "mixer-palette-swatch";
      swatch.style.background = item.swatch;

      const meta = document.createElement("div");
      meta.className = "mixer-palette-meta";

      const name = document.createElement("span");
      name.className = "mixer-palette-name";
      name.textContent = item.name;

      const role = document.createElement("span");
      role.className = "mixer-palette-role";
      role.textContent = item.role;

      meta.append(name, role);
      row.append(swatch, meta);
      mixerPaletteList.appendChild(row);
    });
  }

  if (mixerLogicRules) {
    renderSchemeList(mixerLogicRules, MIXER_LOGIC_RULES, true);
  }
}

function setMixerSupportMode(isMixer) {
  if (!harmonySchemeCard) {
    return;
  }

  harmonySchemeTitle.textContent = isMixer ? "M8 Mixing Guide" : "Color Harmony Scheme";
  harmonySchemeVisualWrap.classList.toggle("hidden", isMixer);
  harmonySchemeDoDontSection.classList.toggle("hidden", isMixer);
  harmonySchemeMeaningLabel.textContent = isMixer ? "How This Color Reads" : "What This Scheme Means";
  harmonySchemeUseLabel.textContent = isMixer ? "Painter Notes" : "How This Painting Uses It";
  harmonySchemeSuggestionsLabel.textContent = isMixer ? "Mixing Behavior" : "Painter Suggestions";

  if (mixerNotesSection) {
    mixerNotesSection.classList.toggle("hidden", isMixer);
  }
  if (mixerTagsSection) {
    mixerTagsSection.classList.toggle("hidden", isMixer);
  }

  if (isMixer) {
    renderMixerSupportPanel(state.mixerResult);
  } else {
    renderHarmonySchemePanel(state.harmony);
  }
}

function setTrainerSupportMode(isTrainer) {
  if (!harmonySchemeCard) {
    return;
  }

  if (!isTrainer) {
    if (state.activeTab === "palette") {
      renderHarmonySchemePanel(state.harmony);
    }
    return;
  }

  harmonySchemeTitle.textContent = "Mix Trainer Guide";
  harmonySchemeVisualWrap.classList.add("hidden");
  harmonySchemeDoDontSection.classList.add("hidden");
  harmonySchemeMeaningLabel.textContent = "How To Use It";
  harmonySchemeUseLabel.textContent = "What M8 Looks For";
  harmonySchemeSuggestionsLabel.textContent = "After You Check";
  renderTrainerSupportPanel();
}

function renderMixerSupportPanel(result) {
  if (!harmonySchemeVisual) {
    return;
  }

  if (!result) {
    harmonySchemeName.textContent = "No mix sampled yet";
    harmonySchemeSecondary.textContent = "Click a passage in the image to read the color and build a likely oil mixture.";
    harmonySchemeConfidence.textContent = "--";
    harmonySchemeConfidenceFill.style.width = "0%";
    renderSchemeCopy(harmonySchemeMeaning, [
      "The sampled note will be translated into value, temperature, chroma, and likely form role."
    ]);
    renderSchemeCopy(harmonySchemeUse, [
      "Painter notes will appear here after you sample a point."
    ]);
    renderSchemeList(harmonySchemeSuggestions, [
      "Behavior tags will appear here after sampling."
    ]);
    return;
  }

  harmonySchemeName.textContent = result.sample.family;
  harmonySchemeSecondary.textContent = `Role: ${result.sample.formRole}`;
  harmonySchemeConfidence.textContent = `${Math.round(getMixerConfidence(result) * 100)}%`;
  harmonySchemeConfidenceFill.style.width = `${Math.round(getMixerConfidence(result) * 100)}%`;

  renderSchemeCopy(harmonySchemeMeaning, [
    `${result.sample.temperature} ${result.sample.chromaLevel.toLowerCase()} color sitting around value ${result.sample.valueStep} on the M8 scale.`,
    getMixerReadLine(result.sample)
  ]);
  renderSchemeList(harmonySchemeUse, result.notes, true);
  renderSchemeList(harmonySchemeSuggestions, result.tags.map((tag) => `${tag}.`), true);
}

function renderTrainerSupportPanel() {
  if (!harmonySchemeVisual) {
    return;
  }

  const checked = !!state.trainerEvaluation;
  const hasSample = !!state.sampledColor;
  harmonySchemeName.textContent = hasSample ? "Practice before the reveal" : "No target sampled yet";
  harmonySchemeSecondary.textContent = hasSample
    ? "Choose up to four pigments, then compare your thinking with the M8 answer."
    : "Click a passage in the image to begin.";
  harmonySchemeConfidence.textContent = checked ? `${state.trainerEvaluation.score}%` : "--";
  harmonySchemeConfidenceFill.style.width = checked ? `${state.trainerEvaluation.score}%` : "0%";

  renderSchemeCopy(harmonySchemeMeaning, [
    "Sample one passage from the painting.",
    "Choose the simplest believable mixture you would actually put on the palette.",
    "Think in value, temperature, chroma, and form role before chasing exact color."
  ]);

  renderSchemeCopy(harmonySchemeUse, checked
    ? [
        `Your result reads as ${state.trainerEvaluation.label.toLowerCase()} against the current M8 logic.`,
        "Use the feedback to see whether your pigments are doing the right structural job."
      ]
    : [
        "M8 rewards pigment economy, transparent shadows, warm lights, and cooler halftones.",
        "The goal is not a digital match. It is a believable painterly decision."
      ]);

  renderSchemeList(harmonySchemeSuggestions, checked
    ? state.trainerEvaluation.improve
    : [
        "Start from the role of the passage before picking pigments.",
        "Keep the mixture to two or three pigments whenever possible.",
        "Reserve white for passages that truly belong to the light family."
      ], true);
}

function getMixerReadLine(sample) {
  if (sample.formRole === "Shadow" || sample.formRole === "Deep Accent") {
    return "This note should read more through transparent depth and temperature bias than through added white.";
  }
  if (sample.formRole === "Halftone") {
    return "This passage should turn quietly, with value doing more work than raw chroma.";
  }
  if (sample.formRole === "Highlight") {
    return "This note sits in the light family, so the mixture should stay simple and clean.";
  }
  return "This sits in the light side of form, so warmth and value control matter more than complicated mixing.";
}

function getMixerConfidence(result) {
  let confidence = 0.72;
  if (result.sample.formRole === "Shadow" || result.sample.formRole === "Highlight") {
    confidence += 0.1;
  }
  if (result.mix.length <= 3) {
    confidence += 0.08;
  }
  if (result.sample.chromaLevel === "Low") {
    confidence += 0.04;
  }
  return clamp(confidence, 0.58, 0.92);
}

function buildMixRow(item) {
  const row = document.createElement("div");
  row.className = "mixer-mix-row";

  const head = document.createElement("div");
  head.className = "mixer-mix-head";

  const name = document.createElement("span");
  name.className = "mixer-mix-name";
  name.textContent = item.pigment;

  const percent = document.createElement("span");
  percent.className = "mixer-mix-percent";
  percent.textContent = `${item.percent}%`;

  const track = document.createElement("div");
  track.className = "palette-weight-track";
  const fill = document.createElement("span");
  fill.className = "palette-weight-fill";
  fill.style.width = `${item.percent}%`;
  track.appendChild(fill);

  head.append(name, percent);
  row.append(head, track);
  return row;
}

function setBreakdownExpanded(expanded) {
  state.breakdownExpanded = expanded;

  if (breakdownContent) {
    breakdownContent.classList.toggle("is-expanded", expanded);
  }

  if (breakdownToggle) {
    breakdownToggle.textContent = expanded ? "Hide full breakdown" : "Show full breakdown";
  }
}

function renderHarmonySchemePanel(result) {
  if (!harmonySchemeVisual) {
    return;
  }

  if (!result) {
    harmonySchemeVisual.innerHTML = '<p class="swatch-empty">Upload an image to see the detected harmony scheme.</p>';
    harmonySchemeName.textContent = "No scheme yet";
    harmonySchemeSecondary.textContent = "Upload an image to analyze the harmony structure.";
    harmonySchemeConfidence.textContent = "--";
    harmonySchemeConfidenceFill.style.width = "0%";
    harmonySchemeMeaning.innerHTML = '<p class="detail-copy">The detected harmony will be explained here after upload.</p>';
    harmonySchemeUse.innerHTML = '<p class="detail-copy">A painting-specific summary will appear here after analysis.</p>';
    harmonySchemeSuggestions.innerHTML = '<p class="detail-copy">Practical painter guidance will appear here after analysis.</p>';
    harmonySchemeDo.innerHTML = '<p class="detail-copy">Keep one hue family dominant.</p>';
    harmonySchemeDont.innerHTML = '<p class="detail-copy">Avoid splitting every hue equally.</p>';
    return;
  }

  harmonySchemeVisual.innerHTML = renderHarmonyScheme(result.primary, result.confidence, result.secondary, result);
  harmonySchemeName.textContent = result.primary;
  harmonySchemeSecondary.textContent = result.secondary
    ? `Secondary tendency: ${result.secondary}`
    : "No strong secondary tendency.";
  harmonySchemeConfidence.textContent = `${Math.round(result.confidence * 100)}%`;
  harmonySchemeConfidenceFill.style.width = `${Math.round(result.confidence * 100)}%`;

  renderSchemeCopy(harmonySchemeMeaning, generateSchemeExplanation(result));
  renderSchemeCopy(harmonySchemeUse, generatePaintingUseSummary(result));
  renderSchemeList(harmonySchemeSuggestions, generateSchemeSuggestions(result));

  const doDont = generateDoDont(result);
  renderSchemeList(harmonySchemeDo, doDont.doItems, true);
  renderSchemeList(harmonySchemeDont, doDont.dontItems, true);
}

function renderSchemeCopy(target, lines) {
  target.innerHTML = "";
  lines.forEach((line) => {
    const item = document.createElement("p");
    item.className = "detail-copy";
    item.textContent = line;
    target.appendChild(item);
  });
}

function renderSchemeList(target, lines, compact = false) {
  target.innerHTML = "";
  target.classList.toggle("compact", compact);
  lines.forEach((line) => {
    const item = document.createElement("p");
    item.className = "scheme-item";
    item.textContent = line;
    target.appendChild(item);
  });
}

function renderHarmonyScheme(type, confidence, secondaryType, analysis) {
  const anchorHue = getSchemeAnchorHue(analysis);
  const opacity = 0.42 + (confidence * 0.42);
  let overlay = "";

  switch (type) {
    case "Monochromatic":
      overlay = renderMonochromaticScheme(anchorHue, opacity);
      break;
    case "Analogous":
      overlay = renderAnalogousScheme(anchorHue, opacity);
      break;
    case "Complementary":
      overlay = renderComplementaryScheme(anchorHue, opacity);
      break;
    case "Split-Complementary":
      overlay = renderSplitComplementaryScheme(anchorHue, opacity);
      break;
    case "Triadic":
      overlay = renderTriadicScheme(anchorHue, opacity);
      break;
    case "Tetradic":
      overlay = renderTetradicScheme(anchorHue, opacity);
      break;
    case "Square":
      overlay = renderSquareScheme(anchorHue, opacity);
      break;
    case "Accent-based Analogous":
      overlay = renderAccentBasedAnalogousScheme(anchorHue, opacity);
      break;
    case "Neutral / Near Monochrome":
      overlay = renderNeutralScheme(opacity);
      break;
    default:
      overlay = renderMixedScheme(anchorHue, opacity);
      break;
  }

  const secondaryLabel = secondaryType
    ? `<text x="120" y="218" text-anchor="middle" fill="rgba(59,52,45,0.6)" font-size="10.5" font-family="Segoe UI, Aptos, sans-serif">Secondary tendency: ${escapeSvgText(secondaryType)}</text>`
    : "";

  return `
    <svg class="harmony-scheme-svg" viewBox="0 0 240 240" role="img" aria-label="${escapeSvgText(type)} harmony scheme">
      <defs>
        <filter id="schemeGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(80,64,46,0.18)"/>
        </filter>
      </defs>
      ${buildWheelBase()}
      ${overlay}
      <circle cx="120" cy="120" r="23" fill="rgba(243,239,230,0.95)" stroke="rgba(59,52,45,0.08)" />
      <text x="120" y="206" text-anchor="middle" fill="rgba(59,52,45,0.75)" font-size="12" font-family="Georgia, Times New Roman, serif">${escapeSvgText(type)}</text>
      ${secondaryLabel}
    </svg>
  `;
}

function buildWheelBase() {
  const segments = [];
  for (let index = 0; index < 12; index += 1) {
    const start = (index * 30) - 90 + 2;
    const end = start + 26;
    const hue = wrapHue(index * 30);
    segments.push(`
      <path d="${describeArc(120, 120, 78, start, end)}"
        fill="none"
        stroke="${wheelHueColor(hue)}"
        stroke-width="26"
        stroke-linecap="round"
        opacity="0.38" />
    `);
  }

  return `
    <circle cx="120" cy="120" r="78" fill="none" stroke="rgba(59,52,45,0.06)" stroke-width="30"/>
    ${segments.join("")}
    <circle cx="120" cy="120" r="78" fill="none" stroke="rgba(59,52,45,0.08)" stroke-width="1.5"/>
    <circle cx="120" cy="120" r="53" fill="none" stroke="rgba(59,52,45,0.05)" stroke-width="1.5"/>
  `;
}

function renderMonochromaticScheme(anchorHue, opacity) {
  return `
    ${buildSectorArc(anchorHue - 18, anchorHue + 18, opacity, 18)}
    ${buildAnchorDot(anchorHue, 78, 10)}
    <text x="120" y="34" text-anchor="middle" fill="rgba(59,52,45,0.72)" font-size="10.5" font-family="Segoe UI, Aptos, sans-serif">single hue family</text>
  `;
}

function renderAnalogousScheme(anchorHue, opacity) {
  return `
    ${buildSectorArc(anchorHue - 42, anchorHue + 42, opacity, 18)}
    ${buildAnchorDot(anchorHue - 24, 78, 7)}
    ${buildAnchorDot(anchorHue, 78, 10)}
    ${buildAnchorDot(anchorHue + 24, 78, 7)}
  `;
}

function renderComplementaryScheme(anchorHue, opacity) {
  const opposite = wrapHue(anchorHue + 180);
  return `
    ${buildSectorArc(anchorHue - 16, anchorHue + 16, opacity, 16)}
    ${buildSectorArc(opposite - 16, opposite + 16, opacity, 16)}
    ${buildAxis(anchorHue)}
    ${buildAnchorDot(anchorHue, 78, 9)}
    ${buildAnchorDot(opposite, 78, 9)}
  `;
}

function renderSplitComplementaryScheme(anchorHue, opacity) {
  const left = wrapHue(anchorHue + 150);
  const right = wrapHue(anchorHue + 210);
  return `
    ${buildSectorArc(anchorHue - 18, anchorHue + 18, opacity, 18)}
    ${buildSectorArc(left - 14, left + 14, opacity * 0.92, 14)}
    ${buildSectorArc(right - 14, right + 14, opacity * 0.92, 14)}
    ${buildGuideLines([anchorHue, left, right])}
    ${buildAnchorDot(anchorHue, 78, 10)}
    ${buildAnchorDot(left, 78, 7)}
    ${buildAnchorDot(right, 78, 7)}
  `;
}

function renderTriadicScheme(anchorHue, opacity) {
  const anchors = [anchorHue, wrapHue(anchorHue + 120), wrapHue(anchorHue + 240)];
  return `
    ${buildPolygon(anchors, 78, opacity)}
    ${anchors.map((angle) => buildSectorArc(angle - 10, angle + 10, opacity * 0.92, 12)).join("")}
    ${anchors.map((angle, index) => buildAnchorDot(angle, 78, index === 0 ? 10 : 8)).join("")}
  `;
}

function renderTetradicScheme(anchorHue, opacity) {
  const anchors = [anchorHue, wrapHue(anchorHue + 60), wrapHue(anchorHue + 180), wrapHue(anchorHue + 240)];
  return `
    ${buildPolygon(anchors, 78, opacity)}
    ${buildAxis(anchorHue)}
    ${buildAxis(wrapHue(anchorHue + 60))}
    ${anchors.map((angle, index) => buildAnchorDot(angle, 78, index === 0 ? 10 : 8)).join("")}
  `;
}

function renderSquareScheme(anchorHue, opacity) {
  const anchors = [anchorHue, wrapHue(anchorHue + 90), wrapHue(anchorHue + 180), wrapHue(anchorHue + 270)];
  return `
    ${buildPolygon(anchors, 78, opacity)}
    ${anchors.map((angle, index) => buildSectorArc(angle - 10, angle + 10, opacity * 0.9, 11)).join("")}
    ${anchors.map((angle, index) => buildAnchorDot(angle, 78, index === 0 ? 10 : 8)).join("")}
  `;
}

function renderAccentBasedAnalogousScheme(anchorHue, opacity) {
  const accent = wrapHue(anchorHue + 180);
  return `
    ${buildSectorArc(anchorHue - 38, anchorHue + 38, opacity, 18)}
    ${buildSectorArc(accent - 10, accent + 10, opacity * 0.86, 10)}
    ${buildAxis(anchorHue, 0.5)}
    ${buildAnchorDot(anchorHue, 78, 10)}
    ${buildAnchorDot(accent, 78, 6)}
  `;
}

function renderNeutralScheme(opacity) {
  return `
    <circle cx="120" cy="120" r="78" fill="none" stroke="rgba(115,109,103,0.18)" stroke-width="22"/>
    <circle cx="120" cy="120" r="54" fill="none" stroke="rgba(115,109,103,0.12)" stroke-width="18"/>
    <circle cx="120" cy="120" r="31" fill="rgba(243,239,230,0.9)" stroke="rgba(115,109,103,${opacity.toFixed(2)})" stroke-width="8"/>
  `;
}

function renderMixedScheme(anchorHue, opacity) {
  return `
    ${buildSectorArc(anchorHue - 24, anchorHue + 24, opacity * 0.82, 14)}
    ${buildSectorArc(anchorHue + 78, anchorHue + 122, opacity * 0.62, 12)}
    ${buildSectorArc(anchorHue + 182, anchorHue + 216, opacity * 0.52, 10)}
    ${buildSectorArc(anchorHue + 262, anchorHue + 296, opacity * 0.44, 9)}
    ${buildAnchorDot(anchorHue, 78, 9)}
    ${buildAnchorDot(wrapHue(anchorHue + 98), 78, 7)}
    ${buildAnchorDot(wrapHue(anchorHue + 198), 78, 6)}
  `;
}

function buildSectorArc(startHue, endHue, opacity, width = 16) {
  const midHue = wrapHue((startHue + endHue) / 2);
  return `
    <path d="${describeArc(120, 120, 78, startHue - 90, endHue - 90)}"
      fill="none"
      stroke="${wheelHueColor(midHue)}"
      stroke-width="${width}"
      stroke-linecap="round"
      opacity="${opacity.toFixed(2)}"
      filter="url(#schemeGlow)" />
  `;
}

function buildAnchorDot(hue, radius, size) {
  const point = polarPoint(120, 120, radius, hue - 90);
  return `<circle cx="${point.x}" cy="${point.y}" r="${size}" fill="${wheelHueColor(wrapHue(hue))}" stroke="rgba(252,250,246,0.94)" stroke-width="3" filter="url(#schemeGlow)" />`;
}

function buildAxis(hue, opacity = 0.72) {
  const pointA = polarPoint(120, 120, 78, hue - 90);
  const pointB = polarPoint(120, 120, 78, hue + 90);
  return `<line x1="${pointA.x}" y1="${pointA.y}" x2="${pointB.x}" y2="${pointB.y}" stroke="rgba(74,66,58,${opacity.toFixed(2)})" stroke-width="1.75" />`;
}

function buildGuideLines(anchors) {
  return anchors.map((hue) => {
    const point = polarPoint(120, 120, 78, hue - 90);
    return `<line x1="120" y1="120" x2="${point.x}" y2="${point.y}" stroke="rgba(74,66,58,0.46)" stroke-width="1.25" />`;
  }).join("");
}

function buildPolygon(anchors, radius, opacity) {
  const points = anchors.map((hue) => {
    const point = polarPoint(120, 120, radius, hue - 90);
    return `${point.x},${point.y}`;
  }).join(" ");
  return `<polygon points="${points}" fill="rgba(201,106,61,0.05)" stroke="rgba(74,66,58,${Math.max(opacity - 0.08, 0.34).toFixed(2)})" stroke-width="1.8" />`;
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarPoint(cx, cy, radius, endAngle);
  const end = polarPoint(cx, cy, radius, startAngle);
  const arcSweep = wrapHue(endAngle - startAngle) <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${arcSweep} 0 ${end.x} ${end.y}`;
}

function polarPoint(cx, cy, radius, angleDegrees) {
  const radians = degreesToRadians(angleDegrees);
  return {
    x: +(cx + (Math.cos(radians) * radius)).toFixed(2),
    y: +(cy + (Math.sin(radians) * radius)).toFixed(2)
  };
}

function wheelHueColor(hue) {
  return `hsl(${Math.round(wrapHue(hue))} 58% 58%)`;
}

function getSchemeAnchorHue(analysis) {
  if (analysis?.dominantColors?.length) {
    return wrapHue(analysis.dominantColors[0].hue);
  }
  if (analysis?.groups?.length) {
    return wrapHue(analysis.groups[0].centerHue);
  }
  return 24;
}

function generateSchemeExplanation(analysis) {
  switch (analysis.primary) {
    case "Monochromatic":
      return [
        "Built from one hue family with shifts in value and saturation.",
        "This creates strong unity and asks value structure to do most of the work."
      ];
    case "Analogous":
      return [
        "Built on neighboring hues that stay close together on the wheel.",
        "This creates cohesion, so contrast usually comes more from value, temperature, or chroma than from sharp hue opposition."
      ];
    case "Complementary":
      return [
        "Built on opposing hue families across the wheel.",
        "This creates tension and contrast, so one side usually needs to dominate while the opposite acts as support or accent."
      ];
    case "Split-Complementary":
      return [
        "Built on one dominant hue family plus two accents flanking its opposite.",
        "This keeps some complementary tension while feeling more controlled than a direct opposition."
      ];
    case "Triadic":
      return [
        "Built on three hue anchors spaced across the wheel.",
        "This gives a broad color range, so value control keeps the scheme from feeling scattered."
      ];
    case "Tetradic":
      return [
        "Built on two complementary pairs working together.",
        "This can feel rich and complex, but it needs hierarchy so every family does not shout at once."
      ];
    case "Square":
      return [
        "Built on four evenly spaced hue territories.",
        "This is the most evenly distributed scheme here, so dominance and restraint matter more than equal saturation."
      ];
    case "Accent-based Analogous":
      return [
        "Built mainly on a narrow analogous band, then broken by one opposite accent.",
        "That gives unity first, with contrast arriving through a smaller complementary push."
      ];
    case "Neutral / Near Monochrome":
      return [
        "Built mostly from neutrals with very little hue separation.",
        "The image reads more through value structure, temperature bias, and chroma restraint than strong hue geometry."
      ];
    default:
      return [
        "The palette does not commit strongly to one clean harmony geometry.",
        "That means the image reads as mixed, with several hue families contributing without one strict scheme taking over."
      ];
  }
}

function generatePaintingUseSummary(analysis) {
  const dominant = analysis.dominantColors?.[0];
  const support = getFirstDistinctColor(analysis.dominantColors, dominant);
  const accent = analysis.focalColor;
  const lines = [];

  if (dominant && accent) {
    const accentLabel = getContrastingColorLabel(accent, dominant);
    lines.push(`${capitalize(getColorFamilyLabel(dominant))} carry most of the painting, while ${accentLabel} acts as the main accent family.`);
  } else if (dominant) {
    lines.push(`Most of the image stays inside the ${getColorFamilyLabel(dominant)}, so the harmony remains narrow and controlled.`);
  }

  if (analysis.primary === "Neutral / Near Monochrome") {
    lines.push("Hue contrast stays subdued here, so the painting depends more on value grouping than on color opposition.");
  } else if (support) {
    lines.push(`The scheme is supported by ${getColorFamilyLabel(support)}, while most of the variation still comes through value and chroma shifts.`);
  }

  if (analysis.secondary) {
    lines.push(`There is also a mild ${analysis.secondary.toLowerCase()} tendency, but it stays secondary to the main read.`);
  }

  return lines.slice(0, 3);
}

function generateSchemeSuggestions(analysis) {
  const dominant = analysis.dominantColors?.[0];
  const accent = analysis.focalColor;
  const suggestions = [];

  if (dominant) {
    suggestions.push(`Let ${getColorFamilyLabel(dominant)} dominate the large masses instead of competing hue families.`);
  }

  if (accent) {
    suggestions.push(`Reserve ${getContrastingColorLabel(accent, dominant)} for selective focal use rather than spreading it evenly.`);
  }

  if (analysis.valueStructure?.contrastLevel === "Low Contrast") {
    suggestions.push("Lean on subtle value steps and edge control instead of trying to force the scheme with saturation.");
  } else if (analysis.valueStructure?.contrastLevel === "High Contrast") {
    suggestions.push("Keep the strongest value jumps attached to the key color relationships so the harmony still reads clearly.");
  }

  if (analysis.primary === "Complementary" || analysis.primary === "Split-Complementary") {
    suggestions.push("Keep one side dominant and let the opposite side act as support or accent.");
    suggestions.push("Do not saturate both opposing families equally.");
  } else if (analysis.primary === "Analogous" || analysis.primary === "Accent-based Analogous") {
    suggestions.push("Keep the neighboring hues unified and let contrast come from value, temperature, and one controlled accent.");
  } else if (analysis.primary === "Monochromatic" || analysis.primary === "Neutral / Near Monochrome") {
    suggestions.push("Build the painting through value structure first, then use chroma shifts sparingly.");
  } else if (analysis.primary === "Triadic" || analysis.primary === "Tetradic" || analysis.primary === "Square") {
    suggestions.push("Choose a clear dominant family so the broader scheme still feels organized.");
  } else {
    suggestions.push("Simplify toward one dominant family and one supporting contrast if you want the harmony to read more clearly.");
  }

  return suggestions.slice(0, 5);
}

function generateDoDont(analysis) {
  const type = analysis.primary;
  const defaults = {
    doItems: ["Keep one family dominant.", "Let value structure support the hue idea."],
    dontItems: ["Do not give every hue equal emphasis.", "Do not rely on saturation everywhere."]
  };

  switch (type) {
    case "Complementary":
    case "Split-Complementary":
      return {
        doItems: ["Keep one side dominant.", "Use the opposite family selectively."],
        dontItems: ["Do not split both sides 50/50.", "Do not push both poles to full chroma."]
      };
    case "Analogous":
    case "Accent-based Analogous":
      return {
        doItems: ["Keep the main arc unified.", "Let one accent family carry the contrast."],
        dontItems: ["Do not scatter unrelated hues.", "Do not overstate the accent in large areas."]
      };
    case "Monochromatic":
    case "Neutral / Near Monochrome":
      return {
        doItems: ["Separate masses with value.", "Use chroma shifts with restraint."],
        dontItems: ["Do not expect hue contrast to save weak structure.", "Do not flatten the middle values too much."]
      };
    case "Triadic":
    case "Tetradic":
    case "Square":
      return {
        doItems: ["Choose a clear hierarchy.", "Let one family lead and the others support."],
        dontItems: ["Do not saturate every family equally.", "Do not let all anchors fight for attention."]
      };
    default:
      return defaults;
  }
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function escapeSvgText(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderPainterInterpretation(result) {
  painterInterpretation.innerHTML = "";

  if (!result || !result.painterInterpretation || !result.painterInterpretation.length) {
    painterInterpretation.innerHTML = '<p class="detail-copy">Upload an image to translate the palette into painter-friendly notes.</p>';
    return;
  }

  result.painterInterpretation.forEach((line) => {
    const item = document.createElement("p");
    item.className = "insight-item";
    item.textContent = line;
    painterInterpretation.appendChild(item);
  });
}

function renderHowToPaint(result) {
  if (!howToPaint) {
    return;
  }

  howToPaint.innerHTML = "";

  if (!result || !result.howToPaint || !result.howToPaint.length) {
    howToPaint.innerHTML = '<p class="detail-copy">Practical painting guidance will appear here after analysis.</p>';
    return;
  }

  result.howToPaint.forEach((line) => {
    const item = document.createElement("p");
    item.className = "insight-item";
    item.textContent = line;
    howToPaint.appendChild(item);
  });
}

function renderValueStructure(result) {
  valueStructure.innerHTML = "";

  if (!result) {
    valueStructure.innerHTML = '<p class="detail-copy">Upload an image to read the tonal structure.</p>';
    return;
  }

  [
    ["Contrast", result.contrastLevel],
    ["Tonal Key", result.tonalKey],
    ["Dominant Band", result.dominantBand]
  ].forEach(([labelText, valueText]) => {
    const row = document.createElement("div");
    row.className = "value-structure-row";
    row.append(
      buildMetaLabel(labelText),
      buildMetaValue(valueText)
    );
    valueStructure.appendChild(row);
  });

  result.notes.forEach((note) => {
    const item = document.createElement("p");
    item.className = "detail-copy";
    item.textContent = note;
    valueStructure.appendChild(item);
  });
}

function renderFocalColor(result) {
  focalColor.innerHTML = "";

  if (!result) {
    focalColor.innerHTML = '<p class="detail-copy">The likely focal accent will appear here after analysis.</p>';
    return;
  }

  [
    ["Likely focal accent", result.name],
    ["Why it stands out", result.reason],
    ["Distribution", result.distribution],
    ["Advice", result.advice]
  ].forEach(([labelText, valueText]) => {
    const row = document.createElement("div");
    row.className = "focal-color-row";
    row.append(
      buildMetaLabel(labelText),
      buildMetaValue(valueText)
    );
    focalColor.appendChild(row);
  });
}

function buildMetaLabel(text) {
  const label = document.createElement("span");
  label.className = "meta-label";
  label.textContent = text;
  return label;
}

function buildMetaValue(text) {
  const value = document.createElement("span");
  value.className = "meta-value";
  value.textContent = text;
  return value;
}

function getPainterColorMeta(color) {
  const chromaLabel = color.chroma === "Very Muted" || color.chroma === "Muted" ? "Low chroma" : color.chroma === "Moderate" ? "Medium chroma" : "High chroma";
  return `${color.temperature} - ${color.valueLabel} - ${chromaLabel}`;
}

function extractDominantColors(image) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = HARMONY_SAMPLE_SIZE;
  canvas.height = HARMONY_SAMPLE_SIZE;
  ctx.drawImage(image, 0, 0, HARMONY_SAMPLE_SIZE, HARMONY_SAMPLE_SIZE);

  const { data } = ctx.getImageData(0, 0, HARMONY_SAMPLE_SIZE, HARMONY_SAMPLE_SIZE);
  const buckets = new Map();
  let totalSamples = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha < 120) {
      continue;
    }

    const r = quantizeChannelForHarmony(data[index]);
    const g = quantizeChannelForHarmony(data[index + 1]);
    const b = quantizeChannelForHarmony(data[index + 2]);
    const key = `${r},${g},${b}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
    totalSamples += 1;
  }

  const weightedBuckets = Array.from(buckets.entries())
    .map(([key, count]) => {
      const [r, g, b] = key.split(",").map(Number);
      return { r, g, b, count };
    })
    .sort((left, right) => right.count - left.count);

  if (!weightedBuckets.length) {
    return [];
  }

  const centers = initializeHarmonyCenters(weightedBuckets, Math.min(HARMONY_CLUSTER_COUNT, weightedBuckets.length));

  for (let iteration = 0; iteration < 6; iteration += 1) {
    const assignments = centers.map(() => ({ r: 0, g: 0, b: 0, weight: 0 }));

    weightedBuckets.forEach((bucket) => {
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      centers.forEach((center, index) => {
        const distance = colorDistance(bucket, center);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      assignments[bestIndex].r += bucket.r * bucket.count;
      assignments[bestIndex].g += bucket.g * bucket.count;
      assignments[bestIndex].b += bucket.b * bucket.count;
      assignments[bestIndex].weight += bucket.count;
    });

    assignments.forEach((assignment, index) => {
      if (!assignment.weight) {
        return;
      }
      centers[index] = {
        r: Math.round(assignment.r / assignment.weight),
        g: Math.round(assignment.g / assignment.weight),
        b: Math.round(assignment.b / assignment.weight)
      };
    });
  }

  const clustered = centers.map((center) => ({ ...center, count: 0 }));

  weightedBuckets.forEach((bucket) => {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    clustered.forEach((center, index) => {
      const distance = colorDistance(bucket, center);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    clustered[bestIndex].count += bucket.count;
  });

  return clustered
    .filter((cluster) => cluster.count > 0)
    .map((cluster) => normalizeColorForHarmony(cluster, totalSamples))
    .sort((left, right) => right.coverage - left.coverage);
}

function normalizeColorForHarmony(color, totalSamples) {
  const hsl = rgbToHslData(color.r, color.g, color.b);
  const brightness = getBrightness(color.r, color.g, color.b);
  const coverage = totalSamples ? (color.count / totalSamples) * 100 : 0;
  const temperature = getTemperatureLabel(color.r, color.b);
  const valueLabel = getValueLabel(brightness);
  const chroma = getChromaLabel(hsl.saturation);
  const painterHueName = getPainterHueName(hsl.hue, temperature, hsl.saturation);
  const chromaFactor = clamp(hsl.saturation / 55, 0.08, 1);
  const visibilityFactor = brightness < 26 || brightness > 238 ? 0.22 : brightness < 55 || brightness > 225 ? 0.45 : 1;
  const harmonyWeight = (coverage / 100) * chromaFactor * visibilityFactor;

  return {
    ...color,
    hex: rgbToHex(color.r, color.g, color.b),
    rgb: `rgb(${color.r}, ${color.g}, ${color.b})`,
    hsl: formatHsl(hsl),
    hue: hsl.hue,
    saturation: hsl.saturation,
    lightness: hsl.lightness,
    brightness,
    coverage,
    temperature,
    valueLabel,
    chroma,
    painterHueName,
    harmonyWeight
  };
}

function groupHueFamilies(colors) {
  const chromatic = colors
    .filter((color) => color.harmonyWeight > 0.01 && color.saturation >= 8)
    .sort((left, right) => left.hue - right.hue);

  if (!chromatic.length) {
    return {
      groups: [],
      neutrals: colors.filter((color) => color.saturation < 8),
      chromaticWeight: 0,
      neutralWeight: colors.reduce((total, color) => total + (color.coverage / 100), 0),
      spread: 0
    };
  }

  const groups = [];

  chromatic.forEach((color) => {
    const lastGroup = groups[groups.length - 1];

    if (!lastGroup || hueDistance(lastGroup.centerHue, color.hue) > 24) {
      groups.push(createHueGroup(color));
      return;
    }

    addColorToHueGroup(lastGroup, color);
  });

  if (groups.length > 1 && hueDistance(groups[0].centerHue, groups[groups.length - 1].centerHue) <= 24) {
    const merged = mergeHueGroups(groups[groups.length - 1], groups[0]);
    groups.splice(groups.length - 1, 1);
    groups.splice(0, 1, merged);
  }

  const chromaticWeight = groups.reduce((total, group) => total + group.weight, 0);
  const neutralWeight = colors.reduce((total, color) => total + (color.coverage / 100), 0) - chromaticWeight;

  return {
    groups: groups.sort((left, right) => right.weight - left.weight),
    neutrals: colors.filter((color) => color.saturation < 8),
    chromaticWeight,
    neutralWeight,
    spread: getWeightedHueSpread(groups)
  };
}

function scoreMonochromatic(groupData) {
  if (!groupData.groups.length) {
    return 0.94;
  }

  const dominantShare = groupData.groups[0].weight / Math.max(groupData.chromaticWeight, 0.0001);
  const spreadPenalty = clamp(groupData.spread / 70, 0, 1);
  return clamp((dominantShare * 0.72) + ((1 - spreadPenalty) * 0.28), 0, 1);
}

function scoreAnalogous(groupData) {
  if (groupData.groups.length < 2) {
    return groupData.groups.length === 1 ? 0.55 : 0;
  }

  let best = 0;
  groupData.groups.forEach((group) => {
    const arcWeight = groupData.groups
      .filter((candidate) => hueDistance(group.centerHue, candidate.centerHue) <= 45)
      .reduce((total, candidate) => total + candidate.weight, 0);
    best = Math.max(best, arcWeight);
  });

  const spreadFactor = clamp((groupData.spread - 12) / 55, 0.28, 1);
  return clamp((best / Math.max(groupData.chromaticWeight, 0.0001)) * spreadFactor, 0, 1);
}

function scoreComplementary(groupData) {
  if (groupData.groups.length < 2) {
    return 0;
  }

  let best = 0;
  for (let index = 0; index < groupData.groups.length; index += 1) {
    for (let compare = index + 1; compare < groupData.groups.length; compare += 1) {
      const left = groupData.groups[index];
      const right = groupData.groups[compare];
      const closeness = 1 - clamp(Math.abs(hueDistance(left.centerHue, right.centerHue) - 180) / 24, 0, 1);
      const pairWeight = (left.weight + right.weight) / Math.max(groupData.chromaticWeight, 0.0001);
      const balance = Math.min(left.weight, right.weight) / Math.max(left.weight, right.weight);
      best = Math.max(best, closeness * pairWeight * (0.65 + balance * 0.35));
    }
  }

  return clamp(best, 0, 1);
}

function scoreSplitComplementary(groupData) {
  if (groupData.groups.length < 3) {
    return 0;
  }

  let best = 0;
  groupData.groups.forEach((base) => {
    const leftTarget = wrapHue(base.centerHue + 150);
    const rightTarget = wrapHue(base.centerHue + 210);
    const leftMatch = findClosestHueGroup(groupData.groups, leftTarget, base);
    const rightMatch = findClosestHueGroup(groupData.groups, rightTarget, base, leftMatch);

    if (!leftMatch || !rightMatch) {
      return;
    }

    const leftCloseness = 1 - clamp(hueDistance(leftMatch.centerHue, leftTarget) / 22, 0, 1);
    const rightCloseness = 1 - clamp(hueDistance(rightMatch.centerHue, rightTarget) / 22, 0, 1);
    const weight = (base.weight + leftMatch.weight + rightMatch.weight) / Math.max(groupData.chromaticWeight, 0.0001);
    const accentStrength = Math.min(leftMatch.weight, rightMatch.weight) / Math.max(base.weight, 0.0001);

    best = Math.max(best, ((leftCloseness + rightCloseness) / 2) * weight * clamp(accentStrength * 1.6, 0.2, 1));
  });

  return clamp(best, 0, 1);
}

function scoreTriadic(groupData) {
  if (groupData.groups.length < 3) {
    return 0;
  }

  let best = 0;
  for (let a = 0; a < groupData.groups.length; a += 1) {
    for (let b = a + 1; b < groupData.groups.length; b += 1) {
      for (let c = b + 1; c < groupData.groups.length; c += 1) {
        const groups = [groupData.groups[a], groupData.groups[b], groupData.groups[c]].sort((left, right) => left.centerHue - right.centerHue);
        const diffs = [
          hueDistance(groups[0].centerHue, groups[1].centerHue),
          hueDistance(groups[1].centerHue, groups[2].centerHue),
          hueDistance(groups[2].centerHue, groups[0].centerHue)
        ];
        const closeness = diffs.reduce((total, diff) => total + (1 - clamp(Math.abs(diff - 120) / 22, 0, 1)), 0) / 3;
        const weight = groups.reduce((total, group) => total + group.weight, 0) / Math.max(groupData.chromaticWeight, 0.0001);
        const minimumShare = Math.min(...groups.map((group) => group.weight));
        best = Math.max(best, closeness * weight * clamp(minimumShare * 6, 0.2, 1));
      }
    }
  }

  return clamp(best, 0, 1);
}

function scoreTetradic(groupData) {
  if (groupData.groups.length < 4) {
    return 0;
  }

  let best = 0;
  const topGroups = groupData.groups.slice(0, 4);

  for (let a = 0; a < topGroups.length; a += 1) {
    for (let b = a + 1; b < topGroups.length; b += 1) {
      for (let c = b + 1; c < topGroups.length; c += 1) {
        for (let d = c + 1; d < topGroups.length; d += 1) {
          const quartet = [topGroups[a], topGroups[b], topGroups[c], topGroups[d]];
          const pairScores = [];
          for (let i = 0; i < quartet.length; i += 1) {
            for (let j = i + 1; j < quartet.length; j += 1) {
              pairScores.push(1 - clamp(Math.abs(hueDistance(quartet[i].centerHue, quartet[j].centerHue) - 180) / 24, 0, 1));
            }
          }
          pairScores.sort((left, right) => right - left);
          const complementStrength = (pairScores[0] + pairScores[1]) / 2;
          const weight = quartet.reduce((total, group) => total + group.weight, 0) / Math.max(groupData.chromaticWeight, 0.0001);
          best = Math.max(best, complementStrength * weight * 0.9);
        }
      }
    }
  }

  return clamp(best, 0, 1);
}

function scoreSquare(groupData) {
  if (groupData.groups.length < 4) {
    return 0;
  }

  let best = 0;
  const topGroups = groupData.groups.slice(0, 4);

  for (let a = 0; a < topGroups.length; a += 1) {
    for (let b = a + 1; b < topGroups.length; b += 1) {
      for (let c = b + 1; c < topGroups.length; c += 1) {
        for (let d = c + 1; d < topGroups.length; d += 1) {
          const quartet = [topGroups[a], topGroups[b], topGroups[c], topGroups[d]]
            .sort((left, right) => left.centerHue - right.centerHue);
          const diffs = [
            wrapHue(quartet[1].centerHue - quartet[0].centerHue),
            wrapHue(quartet[2].centerHue - quartet[1].centerHue),
            wrapHue(quartet[3].centerHue - quartet[2].centerHue),
            wrapHue((quartet[0].centerHue + 360) - quartet[3].centerHue)
          ];
          const closeness = diffs.reduce((total, diff) => total + (1 - clamp(Math.abs(diff - 90) / 18, 0, 1)), 0) / 4;
          const weight = quartet.reduce((total, group) => total + group.weight, 0) / Math.max(groupData.chromaticWeight, 0.0001);
          const minimumShare = Math.min(...quartet.map((group) => group.weight));
          best = Math.max(best, closeness * weight * clamp(minimumShare * 7, 0.2, 1));
        }
      }
    }
  }

  return clamp(best, 0, 1);
}

function scoreAccentBasedAnalogous(groupData, analogousScore, complementaryScore) {
  if (groupData.groups.length < 2) {
    return 0;
  }

  const dominant = groupData.groups[0];
  const accent = groupData.groups.find((group, index) => index > 0 && hueDistance(group.centerHue, wrapHue(dominant.centerHue + 180)) <= 28 && group.weight >= 0.04 && group.weight <= 0.22);
  if (!accent) {
    return 0;
  }

  return clamp((analogousScore * 0.68) + (complementaryScore * 0.32), 0, 1);
}

function detectHarmony(groupData, colors) {
  const chromaticWeight = groupData.chromaticWeight;
  const nearNeutral = chromaticWeight < 0.16 || colors.every((color) => color.saturation < 12);

  if (nearNeutral) {
    return {
      primary: "Neutral / Near Monochrome",
      secondary: null,
      confidence: 0.9,
      swatches: colors.slice(0, 6),
      summary: "This image is carried mostly by neutrals, with harmony coming more from value structure than from strong hue contrast.",
      explanation: "The palette stays close to monochrome, so the painting reads through shifts in lightness, temperature bias, and chroma restraint rather than a strong hue scheme.",
      hint: "Most variation is in value and chroma, not hue.",
      scores: {},
      groups: groupData.groups
    };
  }

  const scores = {
    Monochromatic: scoreMonochromatic(groupData),
    Analogous: scoreAnalogous(groupData),
    Complementary: scoreComplementary(groupData),
    "Split-Complementary": scoreSplitComplementary(groupData),
    Triadic: scoreTriadic(groupData),
    Tetradic: scoreTetradic(groupData),
    Square: scoreSquare(groupData)
  };
  scores["Accent-based Analogous"] = scoreAccentBasedAnalogous(groupData, scores.Analogous, scores.Complementary);

  const ranked = Object.entries(scores).sort((left, right) => right[1] - left[1]);
  let [primary, topScore] = ranked[0];
  const [secondaryName, secondScore] = ranked[1];

  if (topScore < 0.34) {
    primary = "Mixed / No clear scheme";
    topScore = Math.max(topScore, 0.28);
  }

  let secondary = secondScore >= 0.28 ? secondaryName : null;
  let confidence = topScore;

  if (Math.abs(topScore - secondScore) < 0.08) {
    confidence = clamp(topScore - 0.12, 0.22, 0.95);
    if (primary !== "Mixed / No clear scheme") {
      secondary = secondary || secondaryName;
    }
  }

  return {
    primary,
    secondary,
    confidence: clamp(confidence, 0, 0.98),
    swatches: colors.slice(0, 6),
    summary: getHarmonySummary(primary, secondary, colors),
    explanation: getHarmonyExplanation(primary, secondary, colors),
    hint: getHarmonyHint(primary, colors),
    scores,
    groups: groupData.groups
  };
}

// Build painter-facing notes from the measured harmony, value, and focal relationships.
function generatePainterInterpretation({ harmony, dominantColors, valueStructure, focalColor }) {
  const dominant = dominantColors[0];
  const accent = focalColor;
  const lines = [
    `Dominant family: ${dominant ? dominant.painterHueName : "neutral gray"}.`,
    `Main accent: ${accent ? accent.painterHueName : "no single accent family"}.`,
    `${getContrastDriverLine(dominantColors, valueStructure)}.`,
    `Saturation character: ${getSaturationCharacter(dominantColors)}.`,
    `Color behavior: ${getColorBehaviorLine(dominantColors, accent)}.`,
    `Overall read: ${getOverallReadLine(harmony, dominantColors)}.`
  ];

  return lines;
}

function generateHowToPaint({ harmony, dominantColors, valueStructure, focalColor }) {
  const dominant = dominantColors[0];
  const support = dominantColors[1];
  const lines = [];

  if (dominant) {
    lines.push(`Start with broad ${dominant.painterHueName} masses and establish their value family first.`);
  }

  if (getSaturationCharacter(dominantColors).includes("muted")) {
    lines.push("Keep most of the palette subdued and let restraint carry the unity.");
  }

  if (focalColor) {
    lines.push(`Reserve ${focalColor.painterHueName} for controlled focal accents rather than spreading it everywhere.`);
  }

  if (valueStructure.contrastLevel !== "High Contrast") {
    lines.push("Let subtle value relationships do more of the work than high chroma jumps.");
  } else {
    lines.push("Protect the major light-dark separation before refining the color notes.");
  }

  if (harmony.primary === "Complementary" || harmony.primary === "Split-Complementary" || harmony.secondary === "Complementary") {
    lines.push("Use the opposite-temperature tension carefully so the contrast stays intentional.");
  } else if (support) {
    lines.push(`Keep the ${support.painterHueName} family unified so the harmony stays steady.`);
  }

  if (valueStructure.tonalKey === "Mid Key") {
    lines.push("Build the middle values first and save the extremes for emphasis.");
  }

  return lines.slice(0, 6);
}

function analyzeValueStructure(image) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const sampleSize = 112;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  ctx.drawImage(image, 0, 0, sampleSize, sampleSize);
  const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const brightnessValues = [];
  const histogram = Array(20).fill(0);

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha < 120) {
      continue;
    }

    const brightness = getBrightness(data[index], data[index + 1], data[index + 2]);
    brightnessValues.push(brightness);
    histogram[brightnessToPainterStep(brightness) - 1] += 1;
  }

  if (!brightnessValues.length) {
    return {
      contrastLevel: "--",
      tonalKey: "--",
      dominantBand: "--",
      notes: ["Upload an image to read the tonal structure."]
    };
  }

  const sorted = brightnessValues.slice().sort((left, right) => left - right);
  const meaningfulDark = brightnessToPainterStep(percentile(sorted, 0.08));
  const meaningfulLight = brightnessToPainterStep(percentile(sorted, 0.92));
  const contrastRange = Math.abs(meaningfulDark - meaningfulLight);
  const averageBrightness = brightnessValues.reduce((total, value) => total + value, 0) / brightnessValues.length;
  const contrastLevel = contrastRange >= 12 ? "High Contrast" : contrastRange >= 7 ? "Moderate Contrast" : "Low Contrast";
  const tonalKey = averageBrightness >= 168 ? "High Key" : averageBrightness <= 96 ? "Low Key" : "Mid Key";
  const dominantBand = getDominantValueBand(histogram);
  const notes = generateValueNotes({
    tonalKey,
    contrastLevel,
    dominantBand,
    meaningfulDark,
    meaningfulLight
  });

  return {
    contrastLevel,
    tonalKey,
    dominantBand,
    notes,
    meaningfulDark,
    meaningfulLight
  };
}

function detectFocalColor({ harmony, dominantColors, valueStructure }) {
  const dominant = dominantColors[0];
  if (!dominant) {
    return null;
  }

  const scored = dominantColors.map((color) => {
    const rarity = clamp((14 - color.coverage) / 14, 0, 1);
    const saturationLift = clamp((color.saturation - 18) / 55, 0, 1);
    const temperatureContrast = dominant ? (color.temperature !== dominant.temperature && dominant.temperature !== "Neutral" ? 0.28 : 0) : 0;
    const valueContrast = dominant ? clamp(Math.abs(color.brightness - dominant.brightness) / 140, 0, 0.22) : 0;
    const harmonyBoost = harmony.primary === "Complementary" || harmony.primary === "Split-Complementary" ? 0.08 : 0;
    const score = (saturationLift * 0.42) + (rarity * 0.24) + temperatureContrast + valueContrast + harmonyBoost;
    return { color, score };
  }).sort((left, right) => right.score - left.score);

  const winner = scored[0];
  if (!winner || winner.score < 0.26) {
    return {
      ...dominant,
      name: dominant.painterHueName,
      reason: "The palette is fairly even, so no single accent color dominates strongly.",
      distribution: dominant.coverage > 20 ? "Broadly distributed across the image" : "Spread gently through supporting areas",
      advice: "Keep the color hierarchy subtle and let value structure carry the focus."
    };
  }

  return {
    ...winner.color,
    name: winner.color.painterHueName,
    reason: getFocalReason(winner.color, dominant, valueStructure),
    distribution: winner.color.coverage <= 8 ? "Small area, high visual impact" : winner.color.coverage <= 16 ? "Limited area, clear accent role" : "Present in several key passages",
    advice: `Keep ${winner.color.painterHueName} controlled so it stays a focal note rather than becoming general color noise.`
  };
}

function getContrastDriverLine(colors, valueStructure) {
  const averageSaturation = colors.reduce((total, color) => total + color.saturation, 0) / Math.max(colors.length, 1);
  const weightedHueSpread = colors.length > 1 ? colors.reduce((total, color) => total + color.harmonyWeight, 0) : 0;
  if (averageSaturation < 24 || valueStructure.contrastLevel === "High Contrast") {
    return "Contrast driver: value contrast more than saturation";
  }
  if (weightedHueSpread > 0.18) {
    return "Contrast driver: temperature contrast more than value contrast";
  }
  return "Contrast driver: restrained hue shifts with moderate value separation";
}

function getSaturationCharacter(colors) {
  const average = colors.reduce((total, color) => total + color.saturation, 0) / Math.max(colors.length, 1);
  if (average < 16) {
    return "mostly muted palette";
  }
  if (average < 34) {
    return "quiet palette with selective saturation";
  }
  if (average < 55) {
    return "moderately charged palette";
  }
  return "high-chroma palette with strong color energy";
}

function getColorBehaviorLine(colors, accent) {
  const neutralShare = colors.filter((color) => color.temperature === "Neutral" || color.saturation < 12)
    .reduce((total, color) => total + color.coverage, 0);

  if (neutralShare >= 48) {
    return accent ? "neutrals carry most of the image, accents are sparse" : "neutrals carry most of the image";
  }
  if (accent && accent.coverage <= 10) {
    return "supporting hues stay broad while the accent is kept tight";
  }
  return "the palette spreads across a few active hue families without one tiny accent taking over";
}

function getOverallReadLine(harmony, colors) {
  const dominant = colors[0];
  if (harmony.primary === "Neutral / Near Monochrome") {
    return "neutral-dominant palette with restrained color emphasis";
  }
  if (harmony.primary === "Analogous" || harmony.primary === "Accent-based Analogous") {
    return `restrained palette with selective ${dominant ? dominant.temperature.toLowerCase() : "warm"} emphasis`;
  }
  if (harmony.primary === "Complementary" || harmony.primary === "Split-Complementary") {
    return "controlled complementary tension carried by a limited accent range";
  }
  return "measured palette with several hue families kept under value control";
}

function percentile(sortedValues, amount) {
  const index = Math.round(clamp(amount, 0, 1) * (sortedValues.length - 1));
  return sortedValues[index];
}

function brightnessToPainterStep(brightness) {
  return clamp(21 - Math.ceil(((brightness + 1) / 256) * 20), 1, 20);
}

function getDominantValueBand(histogram) {
  const total = histogram.reduce((sum, value) => sum + value, 0);
  let bestStart = 0;
  let bestEnd = 0;
  let bestWeight = 0;

  for (let start = 0; start < histogram.length; start += 1) {
    let running = 0;
    for (let end = start; end < Math.min(histogram.length, start + 7); end += 1) {
      running += histogram[end];
      if (running > bestWeight) {
        bestWeight = running;
        bestStart = start;
        bestEnd = end;
      }
    }
  }

  const startValue = bestStart + 1;
  const endValue = bestEnd + 1;
  if ((bestWeight / Math.max(total, 1)) < 0.22) {
    const peak = histogram.indexOf(Math.max(...histogram)) + 1;
    return `${Math.max(1, peak - 2)}-${Math.min(20, peak + 2)}`;
  }
  return `${startValue}-${endValue}`;
}

function generateValueNotes({ tonalKey, contrastLevel, dominantBand, meaningfulDark, meaningfulLight }) {
  const notes = [];
  notes.push(`Most of the painting sits around values ${dominantBand} on the 20-step scale.`);

  if (contrastLevel === "Low Contrast") {
    notes.push("The structure relies more on middle values than on extreme contrast.");
  } else if (contrastLevel === "High Contrast") {
    notes.push("The major read depends on a clear light-dark separation between important masses.");
  } else {
    notes.push("Contrast is present, but the image still depends on mid-value organization.");
  }

  if (tonalKey === "High Key") {
    notes.push("Dark accents are sparse but important inside a lighter field.");
  } else if (tonalKey === "Low Key") {
    notes.push("Light passages are limited, so they carry extra emphasis against the darker field.");
  } else {
    notes.push("The painting stays mostly in the middle register with selective pushes toward light and dark.");
  }

  notes.push(`Meaningful value range runs roughly from ${meaningfulLight} to ${meaningfulDark}.`);
  return notes;
}

function getFocalReason(color, dominant, valueStructure) {
  const reasons = [];
  if (color.saturation > dominant.saturation + 14) {
    reasons.push(`highest saturation against a ${dominant.painterHueName} field`);
  }
  if (color.temperature !== dominant.temperature && dominant.temperature !== "Neutral") {
    reasons.push(`${color.temperature.toLowerCase()} notes against a ${dominant.temperature.toLowerCase()} base`);
  }
  if (color.coverage <= 10) {
    reasons.push("small area with concentrated visual pull");
  }
  if (valueStructure.contrastLevel !== "Low Contrast" && Math.abs(color.brightness - dominant.brightness) > 55) {
    reasons.push("clear value separation from the dominant field");
  }
  return reasons.length ? reasons.join(", ") : "it breaks away from the dominant palette more clearly than the supporting colors";
}

function getHarmonySummary(primary, secondary, colors) {
  const familyNames = getDistinctFamilyNames(colors, 3);
  const secondaryText = secondary ? ` with a ${secondary.toLowerCase()} tendency` : "";
  if (!familyNames.length) {
    return `The palette reads primarily as ${primary.toLowerCase()}${secondaryText}.`;
  }
  if (familyNames.length === 1) {
    return `The palette reads primarily as ${primary.toLowerCase()}${secondaryText}, built around a narrow ${familyNames[0]} family.`;
  }
  return `The palette reads primarily as ${primary.toLowerCase()}${secondaryText}, built around ${joinNaturalList(familyNames)}.`;
}

function getHarmonyExplanation(primary, secondary, colors) {
  const lead = colors[0];
  const support = getFirstDistinctColor(colors, lead);
  const accent = getFirstDistinctColor(colors, support || lead, lead);

  if (!support) {
    return `This image stays close to ${getColorFamilyLabel(lead)}, so the effect depends more on value and chroma shifts than on hue contrast.`;
  }

  const secondaryPhrase = secondary ? ` The palette also hints at ${secondary.toLowerCase()}.` : "";
  return `This image is built mainly around ${getColorFamilyLabel(lead)} and ${getColorFamilyLabel(support)}, while ${accent ? getContrastingColorLabel(accent, support, lead) : "a smaller accent family"} helps shape the contrast.${secondaryPhrase}`;
}

function getHarmonyHint(primary, colors) {
  if (primary === "Monochromatic" || primary === "Neutral / Near Monochrome") {
    return "Strong harmony through a narrow hue range.";
  }
  if (primary === "Analogous" || primary === "Accent-based Analogous") {
    return "Contrast comes mainly from a cooler or warmer accent rather than a full hue split.";
  }
  if (primary === "Complementary" || primary === "Split-Complementary") {
    return "The push comes from opposites on the wheel, so keep an eye on which family dominates the contrast.";
  }
  if (primary === "Triadic" || primary === "Tetradic" || primary === "Square") {
    return "Several hue families are active, so value control will keep the color structure from scattering.";
  }
  const dominant = colors[0];
  return `The palette is mixed, but ${dominant ? dominant.painterHueName.toLowerCase() : "one hue family"} still carries most of the painting.`;
}

function getPainterHueName(hue, temperature, saturation) {
  if (saturation < 10) {
    return "neutral gray";
  }
  if (temperature === "Warm" && saturation < 36 && hue >= 48 && hue < 96) {
    return "yellow ochre";
  }
  if (hue < 18 || hue >= 345) {
    return temperature === "Cool" ? "cool red" : "warm red";
  }
  if (hue < 38) {
    return "red-orange";
  }
  if (hue < 58) {
    return "yellow-orange";
  }
  if (hue < 82) {
    return "yellow-green";
  }
  if (hue < 145) {
    return saturation < 24 ? "muted green" : "green";
  }
  if (hue < 190) {
    return "blue-green";
  }
  if (hue < 238) {
    return "blue";
  }
  if (hue < 290) {
    return saturation < 24 ? "muted violet" : "violet";
  }
  if (hue < 345) {
    return "red-violet";
  }
  return "earth neutral";
}

function getPainterWheelHue(color) {
  if (!color) {
    return 0;
  }

  if (color.saturation < 10) {
    if (color.temperature === "Warm") {
      return 42;
    }
    if (color.temperature === "Cool") {
      return 220;
    }
    return 0;
  }

  if (color.temperature === "Warm" && color.saturation < 36 && color.hue >= 48 && color.hue < 96) {
    return 52;
  }

  return color.hue;
}

function initializeHarmonyCenters(buckets, desiredCount) {
  const centers = [];

  for (let index = 0; index < buckets.length && centers.length < desiredCount; index += 1) {
    const candidate = buckets[index];
    if (!centers.length || centers.every((center) => colorDistance(center, candidate) > 38)) {
      centers.push({ r: candidate.r, g: candidate.g, b: candidate.b });
    }
  }

  while (centers.length < desiredCount) {
    const fallback = buckets[centers.length % buckets.length];
    centers.push({ r: fallback.r, g: fallback.g, b: fallback.b });
  }

  return centers;
}

function quantizeChannelForHarmony(value) {
  return clamp(Math.round(value / 24) * 24, 0, 255);
}

function colorDistance(left, right) {
  return Math.sqrt(((left.r - right.r) ** 2) + ((left.g - right.g) ** 2) + ((left.b - right.b) ** 2));
}

function createHueGroup(color) {
  return {
    colors: [color],
    weight: color.harmonyWeight,
    rawWeight: color.coverage / 100,
    centerHue: color.hue
  };
}

function addColorToHueGroup(group, color) {
  group.colors.push(color);
  group.weight += color.harmonyWeight;
  group.rawWeight += color.coverage / 100;
  group.centerHue = getCircularMean(group.colors.map((item) => ({ hue: item.hue, weight: item.harmonyWeight })));
}

function mergeHueGroups(left, right) {
  const merged = {
    colors: [...left.colors, ...right.colors],
    weight: left.weight + right.weight,
    rawWeight: left.rawWeight + right.rawWeight,
    centerHue: 0
  };
  merged.centerHue = getCircularMean(merged.colors.map((item) => ({ hue: item.hue, weight: item.harmonyWeight })));
  return merged;
}

function getWeightedHueSpread(groups) {
  if (!groups.length) {
    return 0;
  }

  const center = getCircularMean(groups.map((group) => ({ hue: group.centerHue, weight: group.weight })));
  return groups.reduce((total, group) => total + (hueDistance(center, group.centerHue) * group.weight), 0) / Math.max(groups.reduce((total, group) => total + group.weight, 0), 0.0001);
}

function findClosestHueGroup(groups, targetHue, excludedA = null, excludedB = null) {
  return groups
    .filter((group) => group !== excludedA && group !== excludedB)
    .sort((left, right) => hueDistance(left.centerHue, targetHue) - hueDistance(right.centerHue, targetHue))[0] || null;
}

function getCircularMean(items) {
  let x = 0;
  let y = 0;

  items.forEach((item) => {
    const radians = degreesToRadians(item.hue);
    x += Math.cos(radians) * item.weight;
    y += Math.sin(radians) * item.weight;
  });

  return wrapHue(radiansToDegrees(Math.atan2(y, x)));
}

function hueDistance(left, right) {
  const delta = Math.abs(wrapHue(left) - wrapHue(right));
  return Math.min(delta, 360 - delta);
}

function wrapHue(hue) {
  const wrapped = hue % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

function degreesToRadians(value) {
  return value * (Math.PI / 180);
}

function radiansToDegrees(value) {
  return value * (180 / Math.PI);
}

function buildPaletteInterpretation(palette) {
  if (!palette.length) {
    return [];
  }

  const enriched = palette.map((color) => {
    const temperature = getTemperatureLabel(color.r, color.b);
    const valueLabel = getValueLabel(color.brightness);
    const chroma = getChromaLabel(color.saturation);
    const name = getPainterColorName({
      r: color.r,
      g: color.g,
      b: color.b,
      hue: color.hue,
      temperature,
      valueLabel,
      chroma
    });

    return {
      ...color,
      temperature,
      valueLabel,
      chroma,
      name
    };
  });

  const highestDark = [...enriched]
    .filter((color) => color.valueLabel === "Dark" || color.valueLabel === "Very Dark")
    .sort((left, right) => right.coverage - left.coverage)[0] || null;
  const highestMid = [...enriched]
    .filter((color) => color.valueLabel === "Mid")
    .sort((left, right) => right.coverage - left.coverage)[0] || null;
  const highestLight = [...enriched]
    .filter((color) => color.valueLabel === "Light" || color.valueLabel === "Very Light")
    .sort((left, right) => right.coverage - left.coverage)[0] || null;
  const dominant = enriched[0];

  return enriched.map((color) => {
    const role = getColorRole({
      color,
      dominant,
      highestDark,
      highestMid,
      highestLight
    });

    return {
      ...color,
      role
    };
  });
}

function getBrightness(r, g, b) {
  return Math.round((0.299 * r) + (0.587 * g) + (0.114 * b));
}

function getValueLabel(brightness) {
  if (brightness > 220) {
    return "Very Light";
  }
  if (brightness >= 180) {
    return "Light";
  }
  if (brightness >= 120) {
    return "Mid";
  }
  if (brightness >= 60) {
    return "Dark";
  }
  return "Very Dark";
}

function getTemperatureLabel(r, b) {
  if (Math.abs(r - b) <= 12) {
    return "Neutral";
  }
  return r > b ? "Warm" : "Cool";
}

function getChromaLabel(saturation) {
  if (saturation > 70) {
    return "Vibrant";
  }
  if (saturation >= 40) {
    return "Moderate";
  }
  if (saturation >= 15) {
    return "Muted";
  }
  return "Very Muted";
}

function getPainterColorName({ r, g, b, hue, temperature, valueLabel, chroma }) {
  if (chroma === "Very Muted" && valueLabel === "Very Dark") {
    return "Deep Neutral Black";
  }
  if (chroma === "Very Muted" && valueLabel === "Very Light") {
    return "Soft Light Gray";
  }
  if (temperature === "Cool" && chroma === "Very Muted" && valueLabel !== "Very Dark") {
    return "Cool Stone Gray";
  }
  if (temperature === "Warm" && valueLabel === "Light" && (chroma === "Muted" || chroma === "Very Muted")) {
    return "Warm Mist Beige";
  }

  const hueFamily = getHueFamilyName(hue, temperature, { r, g, b });
  const tonePrefix = getTonePrefix(valueLabel, chroma, temperature, hueFamily);
  return `${tonePrefix} ${hueFamily}`.replace(/\s+/g, " ").trim();
}

function getHueFamilyName(hue, temperature, { r, g, b }) {
  if (Math.abs(r - g) < 14 && Math.abs(g - b) < 14) {
    return "Gray";
  }
  if (hue < 18 || hue >= 342) {
    return "Red";
  }
  if (hue < 42) {
    return "Ochre";
  }
  if (hue < 70) {
    return "Gold";
  }
  if (hue < 95) {
    return "Olive Green";
  }
  if (hue < 150) {
    return "Green";
  }
  if (hue < 190) {
    return "Teal";
  }
  if (hue < 235) {
    return "Blue";
  }
  if (hue < 280) {
    return "Violet";
  }
  if (hue < 320) {
    return "Rose";
  }
  return temperature === "Warm" ? "Earth Brown" : "Slate Gray";
}

function getTonePrefix(valueLabel, chroma, temperature, hueFamily) {
  if (hueFamily === "Gray") {
    if (valueLabel === "Very Dark") {
      return "Deep Neutral";
    }
    if (valueLabel === "Very Light") {
      return "Soft Light";
    }
    return temperature === "Cool" ? "Cool Stone" : temperature === "Warm" ? "Warm Dusty" : "Soft Neutral";
  }

  if (valueLabel === "Very Dark") {
    return hueFamily.includes("Green") ? "Deep" : "Deep";
  }
  if (valueLabel === "Dark") {
    return hueFamily === "Olive Green" ? "Deep" : hueFamily.includes("Green") ? "Deep Olive" : "Dark";
  }
  if (valueLabel === "Light" || valueLabel === "Very Light") {
    if (temperature === "Warm") {
      return "Warm Mist";
    }
    if (temperature === "Cool") {
      return "Soft Cool";
    }
    return "Soft";
  }
  if (chroma === "Very Muted") {
    return "Soft";
  }
  if (chroma === "Muted") {
    return "Muted";
  }
  return temperature === "Warm" ? "Warm" : temperature === "Cool" ? "Cool" : "Balanced";
}

function getColorRole({ color, dominant, highestDark, highestMid, highestLight }) {
  const isHighestDark = highestDark && color.hex === highestDark.hex;
  const isHighestMid = highestMid && color.hex === highestMid.hex;
  const isHighestLight = highestLight && color.hex === highestLight.hex;
  const contrastFromDominant = dominant ? Math.abs(color.brightness - dominant.brightness) : 0;

  if (isHighestDark && (color.valueLabel === "Dark" || color.valueLabel === "Very Dark")) {
    return "Main shadow mass";
  }
  if (isHighestMid && color.valueLabel === "Mid") {
    return "Main structure color";
  }
  if (isHighestLight && (color.valueLabel === "Light" || color.valueLabel === "Very Light")) {
    return "Light carrier";
  }
  if (color.coverage <= 10 && contrastFromDominant >= 70) {
    return "Accent";
  }
  if (color.temperature === "Neutral" && (color.valueLabel === "Mid" || color.valueLabel === "Dark") && color.coverage <= 18) {
    return "Connector";
  }
  if ((color.valueLabel === "Light" || color.valueLabel === "Very Light") && (color.chroma === "Muted" || color.chroma === "Very Muted")) {
    return "Atmospheric background";
  }
  return "Supporting color family";
}

function getPaletteSummary(palette) {
  const topColors = palette.slice(0, 3);
  const lightCarrier = palette.find((color) => color.role === "Light carrier");
  const shadowMass = palette.find((color) => color.role === "Main shadow mass");
  const dominantTemperature = getDominantPaletteTemperature(palette);
  const dominantChroma = getDominantPaletteChroma(palette);
  const familyNames = getDistinctPaletteSummaryNames(palette, 3);

  const sentenceOne = familyNames.length === 1
    ? `This painting stays mostly within ${describePaletteFamily(familyNames[0])}.`
    : `This painting is built on ${joinNaturalList(familyNames)}.`;
  const sentenceTwo = shadowMass && lightCarrier
    ? `The main contrast sits between ${lightCarrier.name.toLowerCase()} carrying the light and ${shadowMass.name.toLowerCase()} holding the shadow mass.`
    : `The palette leans ${dominantTemperature.toLowerCase()} with mostly ${dominantChroma.toLowerCase()} color families.`;
  const sentenceThree = `Most of the structure is carried by ${topColors[0].role.toLowerCase()} notes rather than high-chroma accents.`;
  return `${sentenceOne} ${sentenceTwo} ${sentenceThree}`;
}

function getDistinctFamilyNames(colors, limit = 3) {
  const totals = new Map();

  colors.forEach((color) => {
    const label = getColorFamilyLabel(color);
    totals.set(label, (totals.get(label) || 0) + (color.coverage || 0));
  });

  return Array.from(totals.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label]) => label);
}

function getDistinctPaletteSummaryNames(palette, limit = 3) {
  const totals = new Map();

  palette.forEach((color) => {
    const label = getPaletteSummaryName(color);
    totals.set(label, (totals.get(label) || 0) + (color.coverage || 0));
  });

  return Array.from(totals.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label]) => label);
}

function getPaletteSummaryName(color) {
  if (!color) {
    return "a restrained palette";
  }

  if (color.temperature === "Neutral" || color.saturation < 12) {
    if (color.valueLabel === "Light" || color.valueLabel === "Very Light") {
      return "soft neutral lights";
    }
    if (color.valueLabel === "Dark" || color.valueLabel === "Very Dark") {
      return "deep neutral darks";
    }
    return "soft neutral notes";
  }

  if (color.painterHueName === "warm red" || color.painterHueName === "cool red") {
    return color.valueLabel === "Dark" || color.valueLabel === "Very Dark" ? "deep red notes" : "red notes";
  }

  if (color.painterHueName === "red-orange") {
    return "red-orange notes";
  }

  if (color.painterHueName === "yellow ochre") {
    return "yellow ochre notes";
  }

  return `${color.painterHueName} notes`;
}

function getColorFamilyLabel(color) {
  if (!color) {
    return "neutral field";
  }

  if (color.temperature === "Neutral" || color.saturation < 12) {
    return "neutral field";
  }

  if (color.painterHueName === "warm red" || color.painterHueName === "cool red") {
    return "red family";
  }

  if (color.painterHueName === "red-orange") {
    return "red-orange family";
  }

  if (color.painterHueName === "yellow ochre" || color.painterHueName === "yellow-orange") {
    return "yellow-ochre family";
  }

  return `${color.painterHueName} family`;
}

function getContrastingColorLabel(color, ...excludeColors) {
  const excluded = excludeColors.filter(Boolean).map((item) => item.hex);
  if (!color || excluded.includes(color.hex)) {
    return "a smaller accent family";
  }
  return `the ${getColorFamilyLabel(color)}`;
}

function getFirstDistinctColor(colors, ...excludeColors) {
  const excluded = excludeColors.filter(Boolean).map((item) => item.hex);
  return colors.find((color) => !excluded.includes(color.hex) && !excludeColors.some((item) => item && getColorFamilyLabel(item) === getColorFamilyLabel(color))) || null;
}

function joinNaturalList(items) {
  if (!items.length) {
    return "";
  }
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function withIndefiniteArticle(text) {
  if (!text) {
    return "";
  }
  const article = /^[aeiou]/i.test(text) ? "an" : "a";
  return `${article} ${text}`;
}

function describePaletteFamily(text) {
  if (!text) {
    return "a restrained palette";
  }
  if (/\b(notes|lights|darks)\b/i.test(text)) {
    return text;
  }
  return withIndefiniteArticle(text);
}

function getDominantPaletteTemperature(palette) {
  const totals = { Warm: 0, Cool: 0, Neutral: 0 };
  palette.forEach((color) => {
    totals[color.temperature] += color.coverage;
  });
  return Object.entries(totals).sort((left, right) => right[1] - left[1])[0][0];
}

function getDominantPaletteChroma(palette) {
  const totals = { Vibrant: 0, Moderate: 0, Muted: 0, "Very Muted": 0 };
  palette.forEach((color) => {
    totals[color.chroma] += color.coverage;
  });
  return Object.entries(totals).sort((left, right) => right[1] - left[1])[0][0];
}

function buildMetaRow(labelText, valueText) {
  const row = document.createElement("div");
  row.className = "swatch-row";

  const label = document.createElement("span");
  label.className = "meta-label";
  label.textContent = labelText;

  const value = document.createElement("span");
  value.className = "meta-value";
  value.textContent = valueText;

  row.append(label, value);
  return row;
}

function quantizeChannel(value) {
  return clamp(Math.round(value / 32) * 32, 0, 255);
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function rgbToHslData(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }
  }

  hue = Math.round(hue * 60);
  if (hue < 0) {
    hue += 360;
  }

  return {
    hue,
    saturation: Math.round(saturation * 100),
    lightness: Math.round(lightness * 100)
  };
}

function formatHsl({ hue, saturation, lightness }) {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
