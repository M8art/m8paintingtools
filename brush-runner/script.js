const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreValue = document.getElementById("scoreValue");
const bestValue = document.getElementById("bestValue");
const speedValue = document.getElementById("speedValue");
const powerValue = document.getElementById("powerValue");
const overlay = document.getElementById("gameOverlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMessage = document.getElementById("overlayMessage");
const overlayScore = document.getElementById("overlayScore");
const overlayBest = document.getElementById("overlayBest");
const startButton = document.getElementById("startButton");

const BEST_KEY = "m8-flying-brush-best-score";
const PLAYER_X = 220;
const PLAYER_RADIUS = 18;
const BRUSH_RENDER_WIDTH = 108;
const BRUSH_RENDER_HEIGHT = 34;
const BRUSH_PIVOT_X = -12;
const BRUSH_BRISTLE_OFFSET_X = 38;
const BRUSH_BRISTLE_OFFSET_Y = 0;
const BASE_GRAVITY = 1120;
const FLAP_FORCE = -390;
const BASE_SPEED = 220;
const SPEED_GROWTH = 5;
const PIPE_WIDTH = 104;
const BASE_GAP = 160;
const MIN_GAP = 126;
const SPAWN_DELAY = 1.52;
const PIPE_SPACING = BASE_SPEED * SPAWN_DELAY;
const STAR_DURATION = 10;
const STAR_CHANCE = 0.18;
const DOUBLE_SCORE_DURATION = 8;
const BONUS_CHANCE = 0.12;
const PERFECT_WINDOW = 18;
const NEAR_MISS_EDGE = 20;
const PALETTES = [
  ["#b55d4c", "#577a9b", "#b38a4a", "#6c4f3d", "#8a6f53", "#7f5f86"],
  ["#8c5f44", "#4c7386", "#c49a56", "#5b473f", "#9a6b5a", "#6f6f8d"],
  ["#a24d54", "#5b7f72", "#ad8358", "#76523e", "#83645f", "#6a628a"]
];
const RHYTHM_PATTERN = [1.02, 0.94, 1.08, 0.9];
const TUBE_ASSETS = [
  { name: "Blue", src: "../assets/tubes/Blue.png" },
  { name: "Green", src: "../assets/tubes/Green.png" },
  { name: "Orange", src: "../assets/tubes/Orange.png" },
  { name: "Red", src: "../assets/tubes/Red.png" },
  { name: "Yellow", src: "../assets/tubes/Yellow.png" }
];
const brushImage = new Image();
brushImage.src = "../assets/images/game brush.png";
const logoImage = new Image();
logoImage.src = "../assets/images/M8 Logo (2).png";
const tubeImages = TUBE_ASSETS.map((asset) => {
  const image = new Image();
  image.src = asset.src;
  return {
    ...asset,
    image
  };
});

const player = {
  x: PLAYER_X,
  y: canvas.height * 0.5,
  radius: PLAYER_RADIUS,
  velocityY: 0,
  color: PALETTES[0][0],
  lastY: canvas.height * 0.5
};

const state = {
  running: false,
  gameOver: false,
  score: 0,
  best: loadBestScore(),
  speed: BASE_SPEED,
  pipes: [],
  trail: [],
  effects: [],
  feedbacks: [],
  stars: [],
  bonuses: [],
  lastTime: 0,
  spawnTimer: SPAWN_DELAY,
  rhythmIndex: 0,
  streak: 0,
  paletteIndex: 0,
  paletteBlend: 1,
  targetPaletteIndex: 0,
  screenShake: 0,
  invincibleTimer: 0,
  doubleScoreTimer: 0,
  backgroundScroll: 0,
  cycleTime: 0
};

scoreValue.textContent = "0";
bestValue.textContent = String(state.best);
speedValue.textContent = "1.0x";
powerValue.textContent = "—";
overlayScore.textContent = "0";
overlayBest.textContent = String(state.best);

startButton.addEventListener("click", startFlight);
window.addEventListener("keydown", handleKeydown);
canvas.addEventListener("pointerdown", handlePointerFlap);
overlay.addEventListener("pointerdown", handleOverlayPointerDown);

drawScene();

function handleKeydown(event) {
  if (event.code !== "Space" && event.code !== "ArrowUp") {
    return;
  }

  event.preventDefault();

  if (!state.running) {
    startFlight();
    return;
  }

  flap();
}

function startFlight() {
  state.running = true;
  state.gameOver = false;
  state.score = 0;
  state.speed = BASE_SPEED;
  state.pipes = [];
  state.trail = [];
  state.effects = [];
  state.feedbacks = [];
  state.stars = [];
  state.bonuses = [];
  state.lastTime = 0;
  state.spawnTimer = 0.9;
  state.rhythmIndex = 0;
  state.streak = 0;
  state.paletteIndex = 0;
  state.paletteBlend = 1;
  state.targetPaletteIndex = 0;
  state.screenShake = 0;
  state.invincibleTimer = 0;
  state.doubleScoreTimer = 0;
  state.backgroundScroll = 0;
  state.cycleTime = 0;

  player.y = canvas.height * 0.5;
  player.lastY = player.y;
  player.velocityY = 0;
  player.color = PALETTES[0][0];

  scoreValue.textContent = "0";
  speedValue.textContent = "1.0x";
  powerValue.textContent = "—";
  overlayScore.textContent = "0";
  overlayBest.textContent = String(state.best);
  overlay.classList.add("hidden");
  startButton.textContent = "Restart Flight";

  requestAnimationFrame(gameLoop);
}

function flap() {
  player.velocityY = FLAP_FORCE;
  playFlapSound();
}

function handlePointerFlap(event) {
  event.preventDefault();

  if (!state.running) {
    startFlight();
    return;
  }

  flap();
}

function handleOverlayPointerDown(event) {
  if (event.target === startButton) {
    return;
  }

  event.preventDefault();
  startFlight();
}

function gameLoop(timestamp) {
  if (!state.running) {
    return;
  }

  if (!state.lastTime) {
    state.lastTime = timestamp;
  }

  const delta = Math.min((timestamp - state.lastTime) / 1000, 0.032);
  state.lastTime = timestamp;

  update(delta);
  drawScene();

  if (state.running) {
    requestAnimationFrame(gameLoop);
  }
}

function update(delta) {
  state.speed += delta * SPEED_GROWTH;
  state.paletteBlend = Math.min(1, state.paletteBlend + delta * 0.9);
  state.screenShake = Math.max(0, state.screenShake - delta * 6);
  state.invincibleTimer = Math.max(0, state.invincibleTimer - delta);
  state.doubleScoreTimer = Math.max(0, state.doubleScoreTimer - delta);
  state.backgroundScroll += state.speed * delta * 0.16;
  state.cycleTime += delta;
  player.lastY = player.y;
  player.velocityY += BASE_GRAVITY * delta;
  player.y += player.velocityY * delta;

  if (player.y - player.radius <= 0) {
    endFlight("ceiling");
    return;
  }

  if (player.y + player.radius >= canvas.height) {
    endFlight("fall");
    return;
  }

  state.spawnTimer -= delta;
  if (state.spawnTimer <= 0) {
    spawnPipePair();
    const rhythm = RHYTHM_PATTERN[state.rhythmIndex % RHYTHM_PATTERN.length];
    state.rhythmIndex += 1;
    state.spawnTimer = (PIPE_SPACING / state.speed) * rhythm;
  }

  addTrailPoints();

  state.trail.forEach((point) => {
    point.age += delta;
    point.alpha = Math.max(0, point.alpha - delta * 0.42);
    point.width = Math.max(1.5, point.width - delta * 4.8);
    point.length = Math.max(4, point.length - delta * 5.5);
  });
  state.trail = state.trail.filter((point) => point.alpha > 0.01);

  for (const pipe of state.pipes) {
    pipe.x -= state.speed * delta;

    if (!pipe.passed && pipe.x + PIPE_WIDTH < player.x) {
      pipe.passed = true;
      handlePipePass(pipe);
      scoreValue.textContent = String(state.score);
      overlayScore.textContent = String(state.score);
    }

    if (isPipeCollision(pipe) && state.invincibleTimer <= 0) {
      endFlight("pipe");
      return;
    }
  }

  state.pipes = state.pipes.filter((pipe) => pipe.x + PIPE_WIDTH > -40);
  state.stars.forEach((star) => {
    star.x -= state.speed * delta;
    star.spin += delta * 5.4;
  });
  state.stars = state.stars.filter((star) => star.x + star.radius > -30);
  for (let index = state.stars.length - 1; index >= 0; index -= 1) {
    const star = state.stars[index];
    if (isStarCollected(star)) {
      collectStar(star);
      state.stars.splice(index, 1);
    }
  }
  state.bonuses.forEach((bonus) => {
    bonus.x -= state.speed * delta;
    bonus.spin += delta * 3.8;
    bonus.float += delta * 4.4;
  });
  state.bonuses = state.bonuses.filter((bonus) => bonus.x + bonus.radius > -40);
  for (let index = state.bonuses.length - 1; index >= 0; index -= 1) {
    const bonus = state.bonuses[index];
    if (isBonusCollected(bonus)) {
      collectBonus(bonus);
      state.bonuses.splice(index, 1);
    }
  }
  state.effects.forEach((effect) => {
    effect.life = Math.max(0, effect.life - delta);
    effect.particles.forEach((particle) => {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.alpha = Math.max(0, particle.alpha - delta * 1.8);
      particle.radius = Math.max(1, particle.radius - delta * 3.2);
    });
  });
  state.effects = state.effects.filter((effect) => effect.life > 0);
  state.feedbacks.forEach((feedback) => {
    feedback.life = Math.max(0, feedback.life - delta);
    feedback.y -= delta * 24;
    feedback.alpha = Math.max(0, feedback.alpha - delta * 1.2);
  });
  state.feedbacks = state.feedbacks.filter((feedback) => feedback.life > 0);
  speedValue.textContent = `${(state.speed / BASE_SPEED).toFixed(1)}x`;
  powerValue.textContent = getPowerStatusText();
}

function spawnPipePair() {
  const fixedGap = BASE_GAP;
  const topHeight = randomBetween(90, canvas.height - fixedGap - 90);
  const palette = getActivePalette();
  const color = palette[Math.floor(Math.random() * palette.length)];

  state.pipes.push({
    x: canvas.width + 40,
    topHeight,
    gapHeight: fixedGap,
    passed: false,
    color,
    tubeIndex: Math.floor(Math.random() * tubeImages.length)
  });

  if (Math.random() < STAR_CHANCE && state.score >= 2 && !state.stars.length && state.invincibleTimer <= 0) {
    state.stars.push({
      x: canvas.width + 40 + PIPE_WIDTH * 0.5,
      y: topHeight + fixedGap * 0.5,
      radius: 14,
      spin: 0
    });
  }

  if (Math.random() < BONUS_CHANCE && state.score >= 4 && !state.bonuses.length && state.doubleScoreTimer <= 0) {
    state.bonuses.push({
      x: canvas.width + 40 + PIPE_WIDTH * 0.5,
      y: topHeight + fixedGap * 0.5 + randomBetween(-30, 30),
      radius: 15,
      spin: 0,
      float: Math.random() * Math.PI * 2
    });
  }
}

function handlePipePass(pipe) {
  const gapCenter = pipe.topHeight + pipe.gapHeight * 0.5;
  const centerDistance = Math.abs(player.y - gapCenter);
  const topClearance = Math.abs((player.y - player.radius) - pipe.topHeight);
  const bottomClearance = Math.abs((pipe.topHeight + pipe.gapHeight) - (player.y + player.radius));
  const nearMiss = Math.min(topClearance, bottomClearance) <= NEAR_MISS_EDGE;
  const perfectPass = centerDistance <= PERFECT_WINDOW;

  let scoreGain = 1;
  if (perfectPass) {
    scoreGain += 1;
    state.streak += 1;
    addFeedback("Perfect", player.x + 48, player.y - 28, pipe.color);
  } else {
    state.streak = Math.max(0, state.streak - 0.25);
  }

  if (nearMiss && !perfectPass) {
    addFeedback("Close!", player.x + 42, player.y - 20, shadeColor(pipe.color, -18));
  }

  if (state.doubleScoreTimer > 0) {
    scoreGain *= 2;
    addFeedback("2x", player.x + 18, player.y - 52, "#d36d3b");
  }

  state.score += scoreGain;
  player.color = pipe.color;
  spawnPassEffect(pipe.x + PIPE_WIDTH, gapCenter, pipe.color, perfectPass ? 12 : 8);
  playScoreSound(perfectPass ? 1.16 : 1);

  const nextPaletteIndex = Math.min(PALETTES.length - 1, Math.floor(state.score / 4) % PALETTES.length);
  if (nextPaletteIndex !== state.targetPaletteIndex) {
    state.paletteIndex = state.targetPaletteIndex;
    state.targetPaletteIndex = nextPaletteIndex;
    state.paletteBlend = 0;
  }
}

function isPipeCollision(pipe) {
  const forgiveness = 10;
  const playerLeft = player.x - player.radius + forgiveness;
  const playerRight = player.x + player.radius - forgiveness;
  const playerTop = player.y - player.radius + forgiveness;
  const playerBottom = player.y + player.radius - forgiveness;
  const pipeLeft = pipe.x;
  const pipeRight = pipe.x + PIPE_WIDTH;
  const gapTop = pipe.topHeight;
  const gapBottom = pipe.topHeight + pipe.gapHeight;

  if (playerRight < pipeLeft || playerLeft > pipeRight) {
    return false;
  }

  return playerTop < gapTop || playerBottom > gapBottom;
}

function endFlight(reason = "fall") {
  state.running = false;
  state.gameOver = true;
  state.streak = 0;
  state.screenShake = 10;
  spawnCrashEffect(player.x, player.y, player.color);
  playCrashSound(0.94);

  if (state.score > state.best) {
    state.best = state.score;
    bestValue.textContent = String(state.best);
    overlayBest.textContent = String(state.best);
    try {
      localStorage.setItem(BEST_KEY, String(state.best));
    } catch (error) {
      // Ignore local storage issues.
    }
  }

  const gameOverCopy = getGameOverCopy(reason);
  overlayTitle.textContent = gameOverCopy.title;
  overlayMessage.textContent = `${gameOverCopy.message} You reached ${state.score} clean passes. Press Space, Up Arrow, tap, or use the button to fly again.`;
  overlayScore.textContent = String(state.score);
  overlayBest.textContent = String(state.best);
  overlay.classList.remove("hidden");
  drawScene();
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const shakeX = state.screenShake ? (Math.random() - 0.5) * state.screenShake : 0;
  const shakeY = state.screenShake ? (Math.random() - 0.5) * state.screenShake : 0;
  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawBackground();
  drawGuideLines();
  drawTrail();
  state.pipes.forEach(drawPipePair);
  state.stars.forEach(drawStar);
  state.bonuses.forEach(drawBonus);
  drawPassEffects();
  drawFeedbacks();
  drawBrush();
  ctx.restore();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  const palette = getActivePalette();
  const cycleBlend = getCycleBlend();
  const skyTop = blendRgba(hexToRgba(palette[1], 0.2), "rgba(26,38,74,0.88)", cycleBlend);
  const skyMid = blendRgba("rgba(248,243,234,0.72)", "rgba(42,52,96,0.58)", cycleBlend);
  const skyBottom = blendRgba(hexToRgba(palette[2], 0.18), "rgba(16,20,40,0.92)", cycleBlend);
  gradient.addColorStop(0, skyTop);
  gradient.addColorStop(0.5, skyMid);
  gradient.addColorStop(1, skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = blendRgba("rgba(255,255,255,0.12)", "rgba(30,36,60,0.2)", cycleBlend);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawBackgroundLogo();
  drawSkyAccents(cycleBlend);

  ctx.save();
  ctx.globalAlpha = 0.08 + cycleBlend * 0.04;
  ctx.strokeStyle = cycleBlend > 0.5 ? "rgba(181,194,255,0.92)" : "#ffffff";
  ctx.lineWidth = 1;
  for (let x = -canvas.height; x < canvas.width + canvas.height; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + canvas.height * 0.32, canvas.height);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = blendRgba("rgba(255,255,255,0.34)", "rgba(203,214,255,0.18)", cycleBlend);
  ctx.beginPath();
  ctx.ellipse(180, 92, 88, 26, 0, 0, Math.PI * 2);
  ctx.ellipse(790, 122, 128, 32, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBackgroundLogo() {
  if (!logoImage.complete || logoImage.naturalWidth <= 0 || logoImage.naturalHeight <= 0) {
    return;
  }

  const desiredWidth = canvas.width * 0.36;
  const scale = desiredWidth / logoImage.naturalWidth;
  const drawWidth = logoImage.naturalWidth * scale;
  const drawHeight = logoImage.naturalHeight * scale;
  const spacing = drawWidth + canvas.width * 0.22;
  const scrollX = state.backgroundScroll % spacing;
  const baseY = (canvas.height - drawHeight) * 0.5;

  ctx.save();
  ctx.globalAlpha = 0.08;

  for (let index = -1; index <= 1; index += 1) {
    const drawX = canvas.width * 0.5 - drawWidth * 0.5 - scrollX + index * spacing;
    ctx.drawImage(logoImage, drawX, baseY, drawWidth, drawHeight);
  }

  ctx.restore();
}

function drawSkyAccents(cycleBlend) {
  if (cycleBlend > 0.18) {
    ctx.save();
    ctx.globalAlpha = 0.22 * cycleBlend;
    ctx.fillStyle = "#f6f1d3";
    ctx.beginPath();
    ctx.arc(canvas.width - 132, 94, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.78)";
    for (let index = 0; index < 14; index += 1) {
      const x = 70 + (index * 71) % (canvas.width - 120);
      const y = 42 + ((index * 53) % 140);
      const radius = index % 3 === 0 ? 2.2 : 1.4;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.globalAlpha = 0.16 * (1 - cycleBlend);
  ctx.fillStyle = "#fff1d2";
  ctx.beginPath();
  ctx.arc(canvas.width - 128, 88, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGuideLines() {
  ctx.strokeStyle = "rgba(59,57,55,0.1)";
  ctx.lineWidth = 1;
  for (let y = 72; y < canvas.height; y += 84) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawPipePair(pipe) {
  const tube = tubeImages[pipe.tubeIndex]?.image;
  drawTubeObstacle(pipe.x, 0, PIPE_WIDTH, pipe.topHeight, tube, true, pipe.color);
  drawTubeObstacle(
    pipe.x,
    pipe.topHeight + pipe.gapHeight,
    PIPE_WIDTH,
    canvas.height - (pipe.topHeight + pipe.gapHeight),
    tube,
    false,
    pipe.color
  );
}

function drawTubeObstacle(x, y, width, height, tubeImage, flipVertical, fallbackColor) {
  if (!tubeImage || !tubeImage.complete || tubeImage.naturalWidth <= 0 || tubeImage.naturalHeight <= 0) {
    drawPaintStrokeFallback(x, y, width, height, flipVertical, fallbackColor);
    return;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = hexToRgba(fallbackColor, 0.16);
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();

  if (flipVertical) {
    ctx.translate(0, height);
    ctx.scale(1, -1);
  }

  const imageWidth = tubeImage.naturalWidth;
  const imageHeight = tubeImage.naturalHeight;
  const scale = Math.max(width / imageWidth, height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const drawX = (width - drawWidth) * 0.5;
  const drawY = 0;

  ctx.drawImage(tubeImage, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function drawPaintStrokeFallback(x, y, width, height, flipped, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = hexToRgba(color, 0.18);
  ctx.shadowBlur = 10;

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, shadeColor(color, -24));
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, shadeColor(color, -36));
  ctx.fillStyle = gradient;

  ctx.beginPath();
  ctx.moveTo(0, flipped ? 0 : 14);
  ctx.bezierCurveTo(width * 0.24, flipped ? 10 : 0, width * 0.68, flipped ? 0 : 10, width, flipped ? 14 : 0);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = hexToRgba("#ffffff", 0.12);
  ctx.fillRect(width * 0.18, 0, width * 0.12, height);
  ctx.restore();
}

function drawBrush() {
  ctx.save();
  ctx.translate(player.x, player.y);
  const rotation = getBrushRotation();
  ctx.rotate(rotation);
  const glowColor = state.invincibleTimer > 0 ? "rgba(229, 186, 88, 0.46)" : hexToRgba(player.color, 0.3);
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = state.invincibleTimer > 0 ? 24 : 16;

  const activeColor = state.invincibleTimer > 0 ? blendHex(player.color, "#f0c96b", 0.42) : player.color;
  if (brushImage.complete && brushImage.naturalWidth > 0) {
    ctx.drawImage(
      brushImage,
      BRUSH_PIVOT_X,
      -BRUSH_RENDER_HEIGHT * 0.5,
      BRUSH_RENDER_WIDTH,
      BRUSH_RENDER_HEIGHT
    );

    if (state.invincibleTimer > 0) {
      ctx.fillStyle = hexToRgba("#f3d27c", 0.16);
      ctx.beginPath();
      ctx.roundRect(BRUSH_PIVOT_X + 8, -BRUSH_RENDER_HEIGHT * 0.42, BRUSH_RENDER_WIDTH - 20, BRUSH_RENDER_HEIGHT * 0.84, 16);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = shadeColor(activeColor, -34);
    ctx.beginPath();
    ctx.roundRect(-24, -8, 30, 16, 9);
    ctx.fill();

    ctx.fillStyle = activeColor;
    ctx.beginPath();
    ctx.roundRect(-2, -13, 32, 26, 12);
    ctx.fill();

    ctx.fillStyle = shadeColor(activeColor, -56);
    ctx.beginPath();
    ctx.moveTo(22, -13);
    ctx.lineTo(34, -20);
    ctx.lineTo(34, 20);
    ctx.lineTo(22, 13);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawStar(star) {
  ctx.save();
  ctx.translate(star.x, star.y);
  ctx.rotate(star.spin);
  ctx.shadowColor = "rgba(229, 186, 88, 0.34)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#e5ba58";
  ctx.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const angle = (Math.PI / 5) * point - Math.PI / 2;
    const radius = point % 2 === 0 ? star.radius : star.radius * 0.45;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (point === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBonus(bonus) {
  ctx.save();
  ctx.translate(bonus.x, bonus.y + Math.sin(bonus.float) * 6);
  ctx.rotate(bonus.spin);
  ctx.shadowColor = "rgba(211,109,59,0.34)";
  ctx.shadowBlur = 18;

  ctx.fillStyle = "rgba(255, 246, 236, 0.96)";
  ctx.beginPath();
  ctx.roundRect(-16, -16, 32, 32, 10);
  ctx.fill();

  ctx.strokeStyle = "#d36d3b";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "#d36d3b";
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(8, 0);
  ctx.moveTo(0, -8);
  ctx.lineTo(0, 8);
  ctx.stroke();
  ctx.restore();
}

function drawTrail() {
  return;
}

function drawPassEffects() {
  state.effects.forEach((effect) => {
    effect.particles.forEach((particle) => {
      ctx.save();
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = hexToRgba(effect.color, 1);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  });
}

function spawnPassEffect(x, y, color, count = 8) {
  const particles = Array.from({ length: count }, (_, index) => {
    const angle = (-0.7 + index * 0.2) + Math.random() * 0.14;
    const speed = 42 + Math.random() * 44;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 4 + Math.random() * 4,
      alpha: 0.34 + Math.random() * 0.16
    };
  });

  state.effects.push({
    color,
    life: 0.42,
    particles
  });
}

function isStarCollected(star) {
  const dx = player.x - star.x;
  const dy = player.y - star.y;
  const distance = Math.hypot(dx, dy);
  return distance <= player.radius + star.radius + 2;
}

function collectStar(star) {
  state.invincibleTimer = STAR_DURATION;
  addFeedback("Star!", player.x + 44, player.y - 36, "#e5ba58");
  spawnPassEffect(star.x, star.y, "#e5ba58", 14);
  playStarSound();
}

function isBonusCollected(bonus) {
  const dx = player.x - bonus.x;
  const dy = player.y - (bonus.y + Math.sin(bonus.float) * 6);
  const distance = Math.hypot(dx, dy);
  return distance <= player.radius + bonus.radius + 2;
}

function collectBonus(bonus) {
  state.doubleScoreTimer = DOUBLE_SCORE_DURATION;
  addFeedback("Double!", player.x + 56, player.y - 42, "#d36d3b");
  spawnPassEffect(bonus.x, bonus.y, "#d36d3b", 16);
  playStarSound();
}

function spawnCrashEffect(x, y, color) {
  const particles = Array.from({ length: 14 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 14 + Math.random() * 0.2;
    const speed = 58 + Math.random() * 76;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 5 + Math.random() * 6,
      alpha: 0.42 + Math.random() * 0.18
    };
  });

  state.effects.push({
    color,
    life: 0.64,
    particles
  });
}

function addTrailPoints() {
  return;
}

function addFeedback(text, x, y, color) {
  state.feedbacks.push({
    text,
    x,
    y,
    color,
    alpha: 0.9,
    life: 0.8
  });
}

function getPowerStatusText() {
  if (state.invincibleTimer > 0 && state.doubleScoreTimer > 0) {
    return `Star ${state.invincibleTimer.toFixed(1)}s | 2x ${state.doubleScoreTimer.toFixed(1)}s`;
  }

  if (state.invincibleTimer > 0) {
    return `Star ${state.invincibleTimer.toFixed(1)}s`;
  }

  if (state.doubleScoreTimer > 0) {
    return `2x ${state.doubleScoreTimer.toFixed(1)}s`;
  }

  return "â€”";
}

function getCycleBlend() {
  return (Math.sin(state.cycleTime * 0.16) + 1) * 0.5;
}

function getGameOverCopy(reason) {
  if (reason === "pipe") {
    return {
      title: "Brush clipped a paint tube.",
      message: "The passage closed too fast and the brush caught the obstacle."
    };
  }

  if (reason === "ceiling") {
    return {
      title: "Brush flew too high.",
      message: "The stroke jumped past the top edge of the studio run."
    };
  }

  return {
    title: "Brush fell out of line.",
    message: "The brush dropped below the safe passage."
  };
}

function getBrushRotation() {
  return Math.max(-0.58, Math.min(0.42, player.velocityY / 760));
}

function getBrushBristleTip(baseX, baseY, rotation) {
  return {
    x: baseX + Math.cos(rotation) * BRUSH_BRISTLE_OFFSET_X - Math.sin(rotation) * BRUSH_BRISTLE_OFFSET_Y,
    y: baseY + Math.sin(rotation) * BRUSH_BRISTLE_OFFSET_X + Math.cos(rotation) * BRUSH_BRISTLE_OFFSET_Y
  };
}

function drawFeedbacks() {
  state.feedbacks.forEach((feedback) => {
    ctx.save();
    ctx.globalAlpha = feedback.alpha;
    ctx.fillStyle = feedback.color;
    ctx.font = "700 22px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(feedback.text, feedback.x, feedback.y);
    ctx.restore();
  });
}

function getActivePalette() {
  const from = PALETTES[state.paletteIndex];
  const to = PALETTES[state.targetPaletteIndex];

  if (state.paletteBlend >= 1) {
    return to;
  }

  return from.map((color, index) => blendHex(color, to[index], state.paletteBlend));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;
  const int = Number.parseInt(value, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function blendHex(fromHex, toHex, amount) {
  const from = parseHex(fromHex);
  const to = parseHex(toHex);
  const r = Math.round(from.r + (to.r - from.r) * amount);
  const g = Math.round(from.g + (to.g - from.g) * amount);
  const b = Math.round(from.b + (to.b - from.b) * amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function parseHex(hex) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;
  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

function parseRgba(color) {
  const match = color.match(/rgba?\(([^)]+)\)/i);
  if (!match) {
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
  return {
    r: parts[0] ?? 255,
    g: parts[1] ?? 255,
    b: parts[2] ?? 255,
    a: parts[3] ?? 1
  };
}

function blendRgba(fromColor, toColor, amount) {
  const from = parseRgba(fromColor);
  const to = parseRgba(toColor);
  const r = Math.round(from.r + (to.r - from.r) * amount);
  const g = Math.round(from.g + (to.g - from.g) * amount);
  const b = Math.round(from.b + (to.b - from.b) * amount);
  const a = from.a + (to.a - from.a) * amount;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function shadeColor(hex, amount) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;
  const int = Number.parseInt(value, 16);
  const r = clamp(((int >> 16) & 255) + amount, 0, 255);
  const g = clamp(((int >> 8) & 255) + amount, 0, 255);
  const b = clamp((int & 255) + amount, 0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function loadBestScore() {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  } catch (error) {
    return 0;
  }
}

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playFlapSound() {
  const audio = getAudioContext();
  if (!audio) {
    return;
  }

  const now = audio.currentTime;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(310, now);
  oscillator.frequency.exponentialRampToValueAtTime(470, now + 0.08);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.14);
}

function playScoreSound(multiplier = 1) {
  const audio = getAudioContext();
  if (!audio) {
    return;
  }

  const now = audio.currentTime;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = "sine";
  const streakLift = Math.min(1.18, 1 + state.streak * 0.03) * multiplier;
  oscillator.frequency.setValueAtTime(620 * streakLift, now);
  oscillator.frequency.exponentialRampToValueAtTime(760 * streakLift, now + 0.08);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.13);
}

function playCrashSound(multiplier = 1) {
  const audio = getAudioContext();
  if (!audio) {
    return;
  }

  const now = audio.currentTime;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(180 * multiplier, now);
  oscillator.frequency.exponentialRampToValueAtTime(70 * multiplier, now + 0.26);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.28);
}

function playStarSound() {
  const audio = getAudioContext();
  if (!audio) {
    return;
  }

  const now = audio.currentTime;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(520, now);
  oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.14);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.18);
}
