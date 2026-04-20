const fileInput = document.getElementById("fileInput");
const imageWrap = document.getElementById("imageWrap");
const previewImage = document.getElementById("previewImage");
const emptyState = document.getElementById("emptyState");
const swatchGrid = document.getElementById("swatchGrid");
const statusNote = document.getElementById("statusNote");
const workspaceHint = document.getElementById("workspaceHint");
const selectedColorCard = document.getElementById("selectedColorCard");
const selectedColorPreview = document.getElementById("selectedColorPreview");
const selectedHex = document.getElementById("selectedHex");
const selectedRgb = document.getElementById("selectedRgb");
const selectedHsl = document.getElementById("selectedHsl");
const selectedCoverage = document.getElementById("selectedCoverage");
const panelTitle = document.getElementById("panelTitle");
const panelDescription = document.getElementById("panelDescription");
const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));

const SAMPLE_SIZE = 60;
const PALETTE_SIZE = 8;

const state = {
  objectUrl: null,
  palette: [],
  selectedIndex: -1,
  activeTab: "palette"
};

fileInput.addEventListener("change", handleUpload);
imageWrap.addEventListener("click", () => fileInput.click());
imageWrap.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tab));
});

setTab("palette");

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
    statusNote.textContent = "Palette analysis ready.";
    extractPalette(previewImage);
  };
  previewImage.src = state.objectUrl;
}

function setTab(tab) {
  state.activeTab = tab;

  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });

  if (tab === "palette") {
    panelTitle.textContent = "Palette Analysis";
    panelDescription.textContent = "Sample the main color families in your image and see which hues dominate the overall painting.";
    statusNote.textContent = state.palette.length ? "Palette analysis ready." : "Upload an image to start.";
    renderPalette();
    renderSelectedColor();
    return;
  }

  panelTitle.textContent = tab === "temperature" ? "Temperature Map" : "Color Mixer";
  panelDescription.textContent = tab === "temperature"
    ? "This mode will later simplify the image into warm and cool relationships."
    : "This mode will later help you study mixture families and bridge colors.";
  swatchGrid.innerHTML = '<p class="swatch-empty">This mode is coming soon.</p>';
  selectedColorCard.classList.add("hidden");
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
      return {
        r,
        g,
        b,
        hex: rgbToHex(r, g, b),
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: rgbToHslString(r, g, b),
        coverage
      };
    });

  state.selectedIndex = state.palette.length ? 0 : -1;

  if (state.activeTab === "palette") {
    renderPalette();
    renderSelectedColor();
  }
}

function renderPalette() {
  if (state.activeTab !== "palette") {
    return;
  }

  swatchGrid.innerHTML = "";

  if (!state.palette.length) {
    swatchGrid.innerHTML = '<p class="swatch-empty">No palette breakdown yet.</p>';
    return;
  }

  state.palette.forEach((color, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "swatch-card";
    card.classList.toggle("active", index === state.selectedIndex);
    card.addEventListener("click", () => {
      state.selectedIndex = index;
      renderPalette();
      renderSelectedColor();
    });

    const preview = document.createElement("div");
    preview.className = "swatch-preview";
    preview.style.background = color.rgb;

    const meta = document.createElement("div");
    meta.className = "swatch-meta";
    meta.append(
      buildMetaRow("HEX", color.hex),
      buildMetaRow("RGB", color.rgb),
      buildMetaRow("Presence", `${color.coverage.toFixed(1)}%`)
    );

    card.append(preview, meta);
    swatchGrid.appendChild(card);
  });
}

function renderSelectedColor() {
  if (state.activeTab !== "palette" || state.selectedIndex < 0 || !state.palette[state.selectedIndex]) {
    selectedColorCard.classList.add("hidden");
    return;
  }

  const color = state.palette[state.selectedIndex];
  selectedColorCard.classList.remove("hidden");
  selectedColorPreview.style.background = color.rgb;
  selectedHex.textContent = color.hex;
  selectedRgb.textContent = color.rgb;
  selectedHsl.textContent = color.hsl;
  selectedCoverage.textContent = `${color.coverage.toFixed(1)}%`;
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

function rgbToHslString(r, g, b) {
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

  return `hsl(${hue}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
