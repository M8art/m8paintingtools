const canvas = document.getElementById("canon3dCanvas");
const fallback = document.getElementById("canon3dFallback");
const appShell = document.querySelector(".app");
const typeButtons = Array.from(document.querySelectorAll("[data-canon3d-type]"));
const viewButtons = Array.from(document.querySelectorAll("[data-canon3d-view]"));
const layerButtons = Array.from(document.querySelectorAll("[data-canon3d-layer]"));
const zoomInput = document.getElementById("canon3dZoom");

const state = {
  type: "head",
  yaw: -0.62,
  pitch: 0.16,
  zoom: 1,
  layers: {
    grid: true,
    planes: true,
    form: true,
  },
};

let renderer = null;
let scene = null;
let camera = null;
let root = null;
let THREE = null;
let fallbackMode = false;
let activePointer = null;
let lastPoint = null;
let rafId = 0;

init();

async function init() {
  THREE = await import("https://unpkg.com/three@0.160.0/build/three.module.js").catch(() => null);
  fallbackMode = !THREE;

  bindControls();
  if (fallbackMode) {
    fallback?.classList.remove("hidden");
    if (fallback) {
      fallback.textContent = "3D fallback view. Drag to rotate the canon.";
    }
  } else {
    setupThree();
  }

  bindPointerControls();
  rebuildCanon();
  requestRender();
}

function bindControls() {
  typeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.type = button.dataset.canon3dType || "head";
      updateButtons();
      rebuildCanon();
    });
  });

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPresetView(button.dataset.canon3dView);
    });
  });

  layerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const layer = button.dataset.canon3dLayer;
      if (!layer) return;
      state.layers[layer] = !state.layers[layer];
      updateButtons();
      rebuildCanon();
    });
  });

  zoomInput?.addEventListener("input", () => {
    state.zoom = Number(zoomInput.value || 100) / 100;
    requestRender();
  });

  window.addEventListener("resize", requestRender);
  window.addEventListener("m8:modechange", requestRender);
  updateButtons();
}

function bindPointerControls() {
  canvas.addEventListener("pointerdown", (event) => {
    if (!isActive()) return;
    activePointer = event.pointerId;
    lastPoint = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (activePointer !== event.pointerId || !lastPoint) return;
    const dx = event.clientX - lastPoint.x;
    const dy = event.clientY - lastPoint.y;
    state.yaw += dx * 0.01;
    state.pitch = clamp(state.pitch + dy * 0.008, -1.1, 1.1);
    lastPoint = { x: event.clientX, y: event.clientY };
    requestRender();
  });

  const endPointer = (event) => {
    if (activePointer !== event.pointerId) return;
    activePointer = null;
    lastPoint = null;
    canvas.releasePointerCapture?.(event.pointerId);
  };
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);

  canvas.addEventListener("wheel", (event) => {
    if (!isActive()) return;
    event.preventDefault();
    state.zoom = clamp(state.zoom - event.deltaY * 0.001, 0.7, 1.5);
    if (zoomInput) {
      zoomInput.value = String(Math.round(state.zoom * 100));
    }
    requestRender();
  }, { passive: false });
}

function setupThree() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  scene.add(new THREE.AmbientLight(0xffffff, 0.78));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.72);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);
  root = new THREE.Group();
  scene.add(root);
}

function rebuildCanon() {
  if (fallbackMode) {
    requestRender();
    return;
  }

  root.clear();
  const dims = state.type === "head"
    ? { w: 2.5, h: 3.5, d: 2.15 }
    : { w: 2.35, h: 8, d: 1.05 };

  if (state.layers.grid) {
    root.add(createGridBox(dims));
  }
  if (state.layers.planes) {
    root.add(createPlanes(dims));
  }
  if (state.layers.form) {
    root.add(state.type === "head" ? createHeadForm(dims) : createBodyForm(dims));
  }
  requestRender();
}

function createGridBox({ w, h, d }) {
  const group = new THREE.Group();
  const points = [];
  const addLine = (a, b) => points.push(a.x, a.y, a.z, b.x, b.y, b.z);
  const xVals = [-w / 2, 0, w / 2];
  const yVals = [];
  const divisions = state.type === "head" ? 7 : 8;
  for (let i = 0; i <= divisions; i += 1) {
    yVals.push(-h / 2 + (h * i / divisions));
  }
  const zVals = [-d / 2, 0, d / 2];

  xVals.forEach((x) => zVals.forEach((z) => addLine({ x, y: -h / 2, z }, { x, y: h / 2, z })));
  yVals.forEach((y) => {
    zVals.forEach((z) => addLine({ x: -w / 2, y, z }, { x: w / 2, y, z }));
    xVals.forEach((x) => addLine({ x, y, z: -d / 2 }, { x, y, z: d / 2 }));
  });
  xVals.forEach((x) => yVals.forEach((y) => addLine({ x, y, z: -d / 2 }, { x, y, z: d / 2 })));

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  group.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
    color: 0xd79a45,
    transparent: true,
    opacity: 0.78,
  })));
  return group;
}

function createPlanes({ w, h, d }) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    color: 0x3d8ea6,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  plane.position.z = 0;
  group.add(plane);

  const side = new THREE.Mesh(new THREE.PlaneGeometry(d, h), material.clone());
  side.rotation.y = Math.PI / 2;
  side.position.x = 0;
  group.add(side);
  return group;
}

function createHeadForm({ w, h, d }) {
  const group = new THREE.Group();
  const skull = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 20),
    new THREE.MeshPhongMaterial({ color: 0xffe0bd, transparent: true, opacity: 0.22, shininess: 8 })
  );
  skull.scale.set(w * 0.38, h * 0.33, d * 0.42);
  skull.position.y = h * 0.12;
  group.add(skull);

  const jaw = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.56, h * 0.35, d * 0.54),
    new THREE.MeshPhongMaterial({ color: 0xffe0bd, transparent: true, opacity: 0.14 })
  );
  jaw.position.y = -h * 0.24;
  group.add(jaw);
  return group;
}

function createBodyForm({ w, h, d }) {
  const group = new THREE.Group();
  const material = new THREE.MeshPhongMaterial({ color: 0xffe0bd, transparent: true, opacity: 0.16 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, h * 0.34, d * 0.6), material);
  torso.position.y = h * 0.08;
  group.add(torso);
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(w * 0.48, h * 0.14, d * 0.56), material.clone());
  pelvis.position.y = -h * 0.18;
  group.add(pelvis);
  return group;
}

function setPresetView(view) {
  if (view === "front") {
    state.yaw = 0;
    state.pitch = 0;
  } else if (view === "side") {
    state.yaw = Math.PI / 2;
    state.pitch = 0;
  } else {
    state.yaw = -0.72;
    state.pitch = 0.18;
  }
  requestRender();
}

function render() {
  rafId = 0;
  if (!isActive()) return;
  if (fallbackMode) {
    renderFallback();
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.position.z = (state.type === "head" ? 8 : 13) / state.zoom;
  camera.updateProjectionMatrix();
  root.rotation.set(state.pitch, state.yaw, 0);
  renderer.render(scene, camera);
}

function renderFallback() {
  const context = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, rect.width, rect.height);
  context.strokeStyle = "rgba(215, 154, 69, 0.86)";
  context.lineWidth = 1.5;
  const size = Math.min(rect.width, rect.height) * 0.54 * state.zoom;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const w = state.type === "head" ? size * 0.72 : size * 0.34;
  const h = state.type === "head" ? size : size * 1.35;
  context.strokeRect(cx - w / 2, cy - h / 2, w, h);
  const rows = state.type === "head" ? 4 : 8;
  for (let i = 1; i < rows; i += 1) {
    const y = cy - h / 2 + h * i / rows;
    context.beginPath();
    context.moveTo(cx - w / 2, y);
    context.lineTo(cx + w / 2, y);
    context.stroke();
  }
  context.fillStyle = "rgba(255, 250, 245, 0.78)";
  context.fillText("3D canon fallback", 16, 24);
}

function requestRender() {
  if (rafId) return;
  rafId = requestAnimationFrame(render);
}

function updateButtons() {
  typeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.canon3dType === state.type);
  });
  layerButtons.forEach((button) => {
    const layer = button.dataset.canon3dLayer;
    button.classList.toggle("is-active", Boolean(state.layers[layer]));
  });
}

function isActive() {
  return appShell?.dataset.mode === "canon3d";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
