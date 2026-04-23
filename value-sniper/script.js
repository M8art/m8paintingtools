const GRID_WIDTH = 10;
const GRID_HEIGHT = 18;
const MAX_FEEDBACK_ITEMS = 5;

const PIECES = [
  {
    name: "I",
    rotations: [
      [[0, 1], [1, 1], [2, 1], [3, 1]],
      [[2, 0], [2, 1], [2, 2], [2, 3]]
    ]
  },
  {
    name: "O",
    rotations: [
      [[1, 0], [2, 0], [1, 1], [2, 1]]
    ]
  },
  {
    name: "T",
    rotations: [
      [[1, 0], [0, 1], [1, 1], [2, 1]],
      [[1, 0], [1, 1], [2, 1], [1, 2]],
      [[0, 1], [1, 1], [2, 1], [1, 2]],
      [[1, 0], [0, 1], [1, 1], [1, 2]]
    ]
  },
  {
    name: "L",
    rotations: [
      [[0, 0], [0, 1], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [1, 1], [1, 2]],
      [[0, 1], [1, 1], [2, 1], [2, 2]],
      [[1, 0], [1, 1], [0, 2], [1, 2]]
    ]
  },
  {
    name: "J",
    rotations: [
      [[2, 0], [0, 1], [1, 1], [2, 1]],
      [[1, 0], [1, 1], [1, 2], [2, 2]],
      [[0, 1], [1, 1], [2, 1], [0, 2]],
      [[0, 0], [1, 0], [1, 1], [1, 2]]
    ]
  },
  {
    name: "S",
    rotations: [
      [[1, 0], [2, 0], [0, 1], [1, 1]],
      [[1, 0], [1, 1], [2, 1], [2, 2]]
    ]
  },
  {
    name: "Z",
    rotations: [
      [[0, 0], [1, 0], [1, 1], [2, 1]],
      [[2, 0], [1, 1], [2, 1], [1, 2]]
    ]
  }
];

const MODES = {
  classic: { label: "Classic", gravity: 720, timed: false, lightAxis: null },
  light_top: { label: "Light Top", gravity: 700, timed: false, lightAxis: "top" },
  light_side: { label: "Light Side", gravity: 700, timed: false, lightAxis: "side" },
  timed: { label: "Timed", gravity: 620, timed: true, seconds: 120, lightAxis: null }
};

class ScoringEngine {
  constructor(modeId) {
    this.modeId = modeId;
  }

  setMode(modeId) {
    this.modeId = modeId;
  }

  evaluateRow(rowValues, rowIndex, board) {
    const sortedAscending = rowValues.every((value, index, arr) => index === 0 || value >= arr[index - 1]);
    const sortedDescending = rowValues.every((value, index, arr) => index === 0 || value <= arr[index - 1]);
    const uniqueValues = new Set(rowValues);
    const adjacentDiffs = rowValues.slice(1).map((value, index) => Math.abs(value - rowValues[index]));
    const averageDiff = adjacentDiffs.reduce((sum, value) => sum + value, 0) / Math.max(1, adjacentDiffs.length);
    const valueRange = Math.max(...rowValues) - Math.min(...rowValues);

    let score = 0;
    let label = "Chaotic Placement";
    let detail = "The row reads muddy and inconsistent.";

    if (uniqueValues.size === 1) {
      score += 60;
      label = "Matching Values +60";
      detail = "A clean tonal band clicked into place.";
    } else if ((sortedAscending || sortedDescending) && averageDiff <= 2.5) {
      score += 50;
      label = "Smooth Gradient +50";
      detail = "The row steps through values with painterly control.";
    } else if ((sortedAscending || sortedDescending) && valueRange >= 8) {
      score += 30;
      label = "Strong Contrast +30";
      detail = "Big value separation, still readable as a deliberate ramp.";
    } else {
      score -= 20;
      label = "Chaotic Placement -20";
      detail = "Values collide without a clear relationship.";
    }

    const mode = MODES[this.modeId];
    if (mode.lightAxis === "top") {
      const lowerRow = board[rowIndex + 1];
      if (lowerRow && lowerRow.every(Boolean)) {
        const rowAvg = average(rowValues);
        const lowerAvg = average(lowerRow.map((cell) => cell.value));
        if (rowAvg <= lowerAvg) {
          score += 40;
          label = "Light Logic +40";
          detail = "Lighter values stay above darker structure.";
        } else {
          score -= 20;
          label = "Broken Light Logic -20";
          detail = "The row flips the top-light read.";
        }
      }
    }

    if (mode.lightAxis === "side") {
      const leftAvg = average(rowValues.slice(0, 5));
      const rightAvg = average(rowValues.slice(5));
      if (leftAvg <= rightAvg) {
        score += 35;
        label = "Side Light +35";
        detail = "The row reads brighter toward the light source.";
      } else {
        score -= 20;
        label = "Broken Light Logic -20";
        detail = "Values break the side-lit flow.";
      }
    }

    return { score, label, detail };
  }
}

class BoardRenderer {
  constructor(boardElement, nextPieceElement) {
    this.boardElement = boardElement;
    this.nextPieceElement = nextPieceElement;
    this.boardCells = [];
    this.nextCells = [];
    this.createBoard();
    this.createNextPreview();
  }

  createBoard() {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < GRID_WIDTH * GRID_HEIGHT; index += 1) {
      const cell = document.createElement("div");
      cell.className = "board-cell";
      fragment.append(cell);
      this.boardCells.push(cell);
    }
    this.boardElement.append(fragment);
  }

  createNextPreview() {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 16; index += 1) {
      const cell = document.createElement("div");
      cell.className = "next-cell";
      fragment.append(cell);
      this.nextCells.push(cell);
    }
    this.nextPieceElement.append(fragment);
  }

  render(board, activePiece, ghostY) {
    const activeMap = new Map();
    const ghostMap = new Map();

    if (activePiece) {
      getPieceCells(activePiece, ghostY).forEach((cell) => {
        ghostMap.set(cell.y * GRID_WIDTH + cell.x, cell.value);
      });

      getPieceCells(activePiece).forEach((cell) => {
        activeMap.set(cell.y * GRID_WIDTH + cell.x, cell.value);
      });
    }

    this.boardCells.forEach((cellElement, index) => {
      const x = index % GRID_WIDTH;
      const y = Math.floor(index / GRID_WIDTH);
      const settled = board[y][x];
      const activeValue = activeMap.get(index);
      const ghostValue = ghostMap.get(index);

      cellElement.className = "board-cell";
      cellElement.style.background = "";
      cellElement.style.color = "";
      cellElement.textContent = "";

      if (settled) {
        paintCell(cellElement, settled.value, true);
      } else if (activeValue !== undefined) {
        paintCell(cellElement, activeValue, true);
      } else if (ghostValue !== undefined) {
        paintCell(cellElement, ghostValue, false);
        cellElement.classList.add("ghost");
      }
    });
  }

  renderNext(piece) {
    this.nextCells.forEach((cell) => {
      cell.style.background = "";
      cell.style.color = "";
      cell.textContent = "";
    });

    if (!piece) {
      return;
    }

    getPieceCells({ ...piece, x: 0, y: 0 }, 0).forEach((cell) => {
      const index = (cell.y * 4) + cell.x;
      const nextCell = this.nextCells[index];
      if (!nextCell) {
        return;
      }
      paintCell(nextCell, cell.value, true);
    });
  }
}

class ValueStackerGame {
  constructor() {
    this.boardElement = document.getElementById("gameBoard");
    this.nextPieceElement = document.getElementById("nextPiece");
    this.scoreValue = document.getElementById("scoreValue");
    this.comboValue = document.getElementById("comboValue");
    this.modeValue = document.getElementById("modeValue");
    this.timeValue = document.getElementById("timeValue");
    this.timerFill = document.getElementById("timerFill");
    this.statusText = document.getElementById("statusText");
    this.feedbackFloat = document.getElementById("feedbackFloat");
    this.feedbackLog = document.getElementById("feedbackLog");
    this.pauseOverlay = document.getElementById("pauseOverlay");
    this.pauseButton = document.getElementById("pauseButton");
    this.restartButton = document.getElementById("restartButton");
    this.modeButtons = Array.from(document.querySelectorAll("[data-mode]"));

    this.renderer = new BoardRenderer(this.boardElement, this.nextPieceElement);
    this.scoring = new ScoringEngine("classic");
    this.audioContext = null;

    this.loopHandle = 0;
    this.lastTick = 0;
    this.accumulator = 0;
    this.feedbackTimeout = 0;

    this.bindEvents();
    this.startNewGame("classic");
  }

  bindEvents() {
    window.addEventListener("keydown", (event) => {
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(event.key)) {
        event.preventDefault();
      }

      if (event.key.toLowerCase() === "p") {
        this.togglePause();
        return;
      }

      if (this.isPaused || this.isGameOver) {
        return;
      }

      if (event.key === "ArrowLeft") {
        this.tryMove(-1, 0);
      } else if (event.key === "ArrowRight") {
        this.tryMove(1, 0);
      } else if (event.key === "ArrowDown") {
        if (this.tryMove(0, 1)) {
          this.score += 2;
          this.updateHud();
        }
      } else if (event.key === "ArrowUp") {
        this.tryRotate();
      } else if (event.key === " ") {
        this.hardDrop();
      }
    });

    this.pauseButton.addEventListener("click", () => this.togglePause());
    this.restartButton.addEventListener("click", () => this.startNewGame(this.modeId));

    this.modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.startNewGame(button.dataset.mode);
      });
    });
  }

  startNewGame(modeId) {
    this.modeId = modeId;
    this.mode = MODES[modeId];
    this.scoring.setMode(modeId);
    this.board = createEmptyBoard();
    this.score = 0;
    this.combo = 0;
    this.multiplier = 1;
    this.isPaused = false;
    this.isGameOver = false;
    this.timeRemaining = this.mode.timed ? this.mode.seconds : 0;
    this.dropInterval = this.mode.gravity;
    this.accumulator = 0;
    this.lastTick = 0;
    this.feedbackItems = [];

    this.activePiece = null;
    this.nextPiece = createPiece();
    this.spawnPiece();
    this.updateModeButtons();
    this.updateFeedbackLog();
    this.updateHud();
    this.statusText.textContent = getModeStatus(modeId);
    this.pauseOverlay.classList.add("hidden");
    this.pauseButton.textContent = "Pause";
    cancelAnimationFrame(this.loopHandle);
    this.loopHandle = requestAnimationFrame((time) => this.gameLoop(time));
  }

  spawnPiece() {
    this.activePiece = this.nextPiece;
    this.nextPiece = createPiece();
    this.activePiece.x = 3;
    this.activePiece.y = 0;
    this.activePiece.rotation = 0;
    this.renderer.renderNext(this.nextPiece);

    if (hasCollision(this.board, this.activePiece)) {
      this.endGame("Grid locked up. Restart and restack with cleaner value spacing.");
    }
  }

  gameLoop(timestamp) {
    if (this.isPaused || this.isGameOver) {
      this.loopHandle = requestAnimationFrame((time) => this.gameLoop(time));
      return;
    }

    if (!this.lastTick) {
      this.lastTick = timestamp;
    }

    const delta = timestamp - this.lastTick;
    this.lastTick = timestamp;
    this.accumulator += delta;

    if (this.mode.timed) {
      this.timeRemaining = Math.max(0, this.timeRemaining - (delta / 1000));
      if (this.timeRemaining <= 0) {
        this.endGame("Time is up. Bank the read, then go again.");
      }
    }

    while (this.accumulator >= this.dropInterval) {
      this.accumulator -= this.dropInterval;
      this.step();
    }

    this.render();
    this.loopHandle = requestAnimationFrame((time) => this.gameLoop(time));
  }

  step() {
    if (!this.tryMove(0, 1)) {
      this.lockPiece();
    }
  }

  tryMove(dx, dy) {
    const candidate = { ...this.activePiece, x: this.activePiece.x + dx, y: this.activePiece.y + dy };
    if (hasCollision(this.board, candidate)) {
      return false;
    }

    this.activePiece = candidate;
    this.render();
    return true;
  }

  tryRotate() {
    const nextRotation = (this.activePiece.rotation + 1) % this.activePiece.shape.rotations.length;
    const kicks = [0, -1, 1, -2, 2];

    for (const kick of kicks) {
      const candidate = {
        ...this.activePiece,
        rotation: nextRotation,
        x: this.activePiece.x + kick
      };

      if (!hasCollision(this.board, candidate)) {
        this.activePiece = candidate;
        this.playTone("move");
        this.render();
        return;
      }
    }
  }

  hardDrop() {
    let dropDistance = 0;
    while (this.tryMove(0, 1)) {
      dropDistance += 1;
    }
    this.score += dropDistance * 4;
    this.lockPiece();
  }

  lockPiece() {
    getPieceCells(this.activePiece).forEach((cell) => {
      this.board[cell.y][cell.x] = { value: cell.value };
    });

    this.playTone("lock");
    this.clearCompletedRows();
    this.spawnPiece();
    this.render();
  }

  clearCompletedRows() {
    const clearedRows = [];

    for (let y = this.board.length - 1; y >= 0; y -= 1) {
      if (this.board[y].every(Boolean)) {
        clearedRows.push(y);
      }
    }

    if (!clearedRows.length) {
      this.combo = 0;
      this.multiplier = 1;
      this.updateHud();
      return;
    }

    let roundScore = 0;
    let mainFeedback = null;

    clearedRows.forEach((rowIndex) => {
      const rowValues = this.board[rowIndex].map((cell) => cell.value);
      const evaluation = this.scoring.evaluateRow(rowValues, rowIndex, this.board);
      roundScore += evaluation.score;
      mainFeedback = evaluation;
      this.feedbackItems.unshift(evaluation);
    });

    this.feedbackItems = this.feedbackItems.slice(0, MAX_FEEDBACK_ITEMS);
    this.combo += 1;
    this.multiplier = Math.min(5, 1 + this.combo);
    const lineBonus = clearedRows.length * 80;
    this.score += (lineBonus + roundScore) * this.multiplier;
    this.statusText.textContent = mainFeedback ? mainFeedback.detail : "Row cleared.";
    if (mainFeedback) {
      this.showFeedback(mainFeedback.label);
      this.playTone(mainFeedback.score >= 0 ? "good" : "bad");
    }

    clearedRows.sort((a, b) => a - b).forEach((rowIndex, clearedCount) => {
      this.board.splice(rowIndex - clearedCount, 1);
      this.board.unshift(Array.from({ length: GRID_WIDTH }, () => null));
    });

    this.updateFeedbackLog();
    this.updateHud();
  }

  showFeedback(label) {
    clearTimeout(this.feedbackTimeout);
    this.feedbackFloat.hidden = false;
    this.feedbackFloat.textContent = label;
    this.feedbackFloat.className = "feedback-float is-visible";
    this.feedbackTimeout = window.setTimeout(() => {
      this.feedbackFloat.hidden = true;
      this.feedbackFloat.className = "feedback-float";
    }, 900);
  }

  updateFeedbackLog() {
    this.feedbackLog.innerHTML = "";

    if (!this.feedbackItems.length) {
      const empty = document.createElement("p");
      empty.className = "feedback-log-empty";
      empty.textContent = "No row feedback yet. Clear a line to see the read.";
      this.feedbackLog.append(empty);
      return;
    }

    this.feedbackItems.forEach((item) => {
      const row = document.createElement("div");
      row.className = "feedback-log-item";

      const title = document.createElement("div");
      title.className = "feedback-label";
      title.textContent = item.label;

      const meta = document.createElement("div");
      meta.className = "feedback-meta";
      meta.textContent = item.detail;

      row.append(title, meta);
      this.feedbackLog.append(row);
    });
  }

  updateHud() {
    this.scoreValue.textContent = String(Math.max(0, Math.round(this.score)));
    this.comboValue.textContent = `x${this.multiplier}`;
    this.modeValue.textContent = this.mode.label;

    if (this.mode.timed) {
      this.timeValue.textContent = `${Math.ceil(this.timeRemaining)}s`;
      this.timerFill.style.transform = `scaleX(${Math.max(0, this.timeRemaining / this.mode.seconds)})`;
    } else {
      this.timeValue.textContent = "--";
      this.timerFill.style.transform = "scaleX(1)";
    }
  }

  updateModeButtons() {
    this.modeButtons.forEach((button) => {
      const isActive = button.dataset.mode === this.modeId;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });
  }

  render() {
    const ghostY = getGhostY(this.board, this.activePiece);
    this.renderer.render(this.board, this.activePiece, ghostY);
    this.updateHud();
  }

  togglePause() {
    if (this.isGameOver) {
      return;
    }

    this.isPaused = !this.isPaused;
    this.pauseOverlay.classList.toggle("hidden", !this.isPaused);
    this.pauseButton.textContent = this.isPaused ? "Resume" : "Pause";
    this.statusText.textContent = this.isPaused
      ? "Paused. The values hold position until you resume."
      : getModeStatus(this.modeId);
  }

  endGame(message) {
    this.isGameOver = true;
    this.pauseOverlay.classList.remove("hidden");
    this.pauseOverlay.querySelector(".pause-title").textContent = message;
    this.pauseButton.textContent = "Pause";
    this.statusText.textContent = message;
    this.playTone("bad");
  }

  playTone(type) {
    const AudioContextRef = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextRef) {
      return;
    }

    if (!this.audioContext) {
      this.audioContext = new AudioContextRef();
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    const configMap = {
      move: { frequency: 300, duration: 0.04, gain: 0.016, type: "triangle" },
      lock: { frequency: 180, duration: 0.06, gain: 0.024, type: "square" },
      good: { frequency: 540, duration: 0.12, gain: 0.03, type: "sine" },
      bad: { frequency: 140, duration: 0.16, gain: 0.032, type: "sawtooth" }
    };

    const config = configMap[type];
    if (!config) {
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const startAt = this.audioContext.currentTime;

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, startAt);
    gainNode.gain.setValueAtTime(config.gain, startAt);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + config.duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + config.duration);
  }
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function createEmptyBoard() {
  return Array.from({ length: GRID_HEIGHT }, () => Array.from({ length: GRID_WIDTH }, () => null));
}

function createPiece() {
  const shape = PIECES[Math.floor(Math.random() * PIECES.length)];
  const firstRotation = shape.rotations[0];
  const values = firstRotation.map(() => randomValue());
  return {
    shape,
    values,
    rotation: 0,
    x: 3,
    y: 0
  };
}

function randomValue() {
  return 1 + Math.floor(Math.random() * 20);
}

function getPieceCells(piece, overrideY = piece.y) {
  const rotationCells = piece.shape.rotations[piece.rotation];
  return rotationCells.map((offset, index) => ({
    x: piece.x + offset[0],
    y: overrideY + offset[1],
    value: piece.values[index]
  }));
}

function hasCollision(board, piece) {
  return getPieceCells(piece).some((cell) => {
    if (cell.x < 0 || cell.x >= GRID_WIDTH || cell.y < 0 || cell.y >= GRID_HEIGHT) {
      return true;
    }

    return Boolean(board[cell.y][cell.x]);
  });
}

function getGhostY(board, piece) {
  let ghostY = piece.y;
  while (!hasCollision(board, { ...piece, y: ghostY + 1 })) {
    ghostY += 1;
  }
  return ghostY;
}

function paintCell(element, value, solid) {
  const lightness = valueToLightness(value);
  element.classList.add(solid ? "filled" : "ghost");
  element.style.background = `hsl(0 0% ${lightness}%)`;
  element.style.color = lightness > 52 ? "#1f1c18" : "#f7f4ee";
  element.innerHTML = `<span class="cell-value">${value}</span>`;
}

function valueToLightness(value) {
  return 96 - ((value - 1) / 19) * 82;
}

function getModeStatus(modeId) {
  if (modeId === "light_top") {
    return "Rows read best when lighter values sit above darker structure.";
  }

  if (modeId === "light_side") {
    return "Build rows that read brighter from the left and darker to the right.";
  }

  if (modeId === "timed") {
    return "Timed mode rewards speed, but chaotic value placement still hurts.";
  }

  return "Classic mode rewards readable value relationships without forcing one light direction.";
}

new ValueStackerGame();
