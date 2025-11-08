// --- enhancement: only enable touch controls on mobile sizes ---
function isMobileWidth() {
  return window.innerWidth <= 768;
}
// existing code may call showTouchControls(); ensure they check isMobileWidth() before removing 'hidden'

/* Logística Master v2
   - Canvas-based, industrial visuals, sounds via WebAudio
   - Improved movement (acceleration), collisions, box 3D draw, glow area indicators
   - Levels: Iniciante (5), Intermediário (8), Avançado (12), Especialista (15), Mestre (18)
   - Ranking saved in localStorage
   - Tutorial, Touch Controls, Enhanced Audio/Visuals
*/

// -------------------- DOM --------------------
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
const levelSelect = document.getElementById("levelSelect");
const musicToggle = document.getElementById("musicToggle");
const practiceMode = document.getElementById("practiceMode");
const tutorialBtn = document.getElementById("tutorialBtn");
const settingsBtn = document.getElementById("settingsBtn");
const showRankBtn = document.getElementById("showRankBtn");

const tutorialOverlay = document.getElementById("tutorialOverlay");
const tutorialContent = document.getElementById("tutorialContent");
const tutorialPrev = document.getElementById("tutorialPrev");
const tutorialNext = document.getElementById("tutorialNext");
const tutorialClose = document.getElementById("tutorialClose");

const settingsModal = document.getElementById("settingsModal");
const volumeSlider = document.getElementById("volumeSlider");
const customControls = document.getElementById("customControls");
const settingsClose = document.getElementById("settingsClose");

const touchControls = document.getElementById("touchControls");
const touchUp = document.getElementById("touchUp");
const touchDown = document.getElementById("touchDown");
const touchLeft = document.getElementById("touchLeft");
const touchRight = document.getElementById("touchRight");
const touchPick = document.getElementById("touchPick");
const touchReceive = document.getElementById("touchReceive");

const gameUI = document.getElementById("gameUI");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hudLevel = document.getElementById("hudLevel");
const hudPhase = document.getElementById("hudPhase");
const hudTime = document.getElementById("hudTime");
const hudScore = document.getElementById("hudScore");
const hudErrors = document.getElementById("hudErrors");
const hudRemaining = document.getElementById("hudRemaining");

const panelMessages = document.getElementById("panelMessages");
const panelRanking = document.getElementById("panelRanking");

const restartBtn = document.getElementById("restartBtn");
const exitBtn = document.getElementById("exitBtn");
const pauseBtn = document.getElementById("pauseBtn");

const endModal = document.getElementById("endModal");
const finalSummary = document.getElementById("finalSummary");
const expandedStats = document.getElementById("expandedStats");
const avgTimePerBox = document.getElementById("avgTimePerBox");
const storedBoxes = document.getElementById("storedBoxes");
const shippedBoxes = document.getElementById("shippedBoxes");
const efficiency = document.getElementById("efficiency");
const toggleStatsBtn = document.getElementById("toggleStatsBtn");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

let musicOn = true;
let isPracticeMode = false;
let tutorialStep = 0;
let particles = [];
let volume = 0.06;

// -------------------- Particles for visual effects --------------------
function createParticle(x, y, vx, vy, life, color, size = 4) {
  return { x, y, vx, vy, life, maxLife: life, color, size };
}

function addParticles(x, y, count, color, spread = 20) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const life = Math.random() * 30 + 20;
    particles.push(createParticle(x, y, vx, vy, life, color));
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1; // gravity
    p.life--;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  ctx.save();
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// -------------------- Tutorial --------------------
const tutorialSteps = document.querySelectorAll(".tutorialStep");

function showTutorialStep(step) {
  tutorialSteps.forEach(
    (s, i) => (s.style.display = i === step ? "block" : "none")
  );
  tutorialPrev.disabled = step === 0;
  tutorialNext.textContent =
    step === tutorialSteps.length - 1 ? "Finalizar" : "Próximo";
}

tutorialBtn.addEventListener("click", () => {
  tutorialStep = 0;
  showTutorialStep(tutorialStep);
  tutorialOverlay.classList.remove("hidden");
});

tutorialPrev.addEventListener("click", () => {
  if (tutorialStep > 0) {
    tutorialStep--;
    showTutorialStep(tutorialStep);
  }
});

tutorialNext.addEventListener("click", () => {
  if (tutorialStep < tutorialSteps.length - 1) {
    tutorialStep++;
    showTutorialStep(tutorialStep);
  } else {
    tutorialOverlay.classList.add("hidden");
  }
});

tutorialClose.addEventListener("click", () => {
  tutorialOverlay.classList.add("hidden");
});

// -------------------- Settings --------------------
settingsBtn.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
});

settingsClose.addEventListener("click", () => {
  volume = parseFloat(volumeSlider.value);
  settingsModal.classList.add("hidden");
});

// -------------------- Touch Controls --------------------
function isMobile() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768
  );
}
if (isMobile() && "ontouchstart" in window) {
  touchControls.classList.remove("hidden");
}

touchUp.addEventListener("touchstart", () => (keys["w"] = true));
touchUp.addEventListener("touchend", () => (keys["w"] = false));
touchDown.addEventListener("touchstart", () => (keys["s"] = true));
touchDown.addEventListener("touchend", () => (keys["s"] = false));
touchLeft.addEventListener("touchstart", () => (keys["a"] = true));
touchLeft.addEventListener("touchend", () => (keys["a"] = false));
touchRight.addEventListener("touchstart", () => (keys["d"] = true));
touchRight.addEventListener("touchend", () => (keys["d"] = false));

touchPick.addEventListener("touchstart", () => {
  if (Date.now() - (STATE.lastSpace || 0) > 220) {
    tryPickOrDrop();
    STATE.lastSpace = Date.now();
  }
});

touchReceive.addEventListener("touchstart", () => {
  if (Date.now() - (STATE.lastE || 0) > 300) {
    tryReceive();
    STATE.lastE = Date.now();
  }
});

// -------------------- Expanded Stats --------------------
toggleStatsBtn.addEventListener("click", () => {
  expandedStats.classList.toggle("hidden");
});

// -------------------- Audio (WebAudio small engine) --------------------
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

function tone(freq, time = 0.08, type = "sine", gain = 0.06) {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + time);
}

function playSuccess() {
  if (!musicOn) return;
  tone(880, 0.08, "sine", 0.08);
  setTimeout(() => tone(660, 0.06, "sine", 0.06), 80);
}
function playError() {
  if (!musicOn) return;
  tone(160, 0.12, "sawtooth", 0.06);
}
function playPick() {
  if (!musicOn) return;
  tone(520, 0.06, "triangle", 0.04);
}
function playDrop() {
  if (!musicOn) return;
  tone(320, 0.06, "square", 0.05);
}

// optional ambient hum (very subtle)
let ambientOsc = null;
function startAmbient() {
  if (!musicOn || ambientOsc) return;
  ambientOsc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  ambientOsc.type = "sine";
  ambientOsc.frequency.value = 80;
  g.gain.value = 0.01;
  ambientOsc.connect(g);
  g.connect(audioCtx.destination);
  ambientOsc.start();
}
function stopAmbient() {
  if (ambientOsc) {
    ambientOsc.stop();
    ambientOsc = null;
  }
}

// -------------------- Game config & levels --------------------
const LEVELS = [
  {
    name: "Iniciante",
    crates: 5,
    layout: {
      truck: { x: 30, y: 60, w: 160, h: 400 },
      storage: { x: 240, y: 240, w: 240, h: 200 },
      ship: { x: 520, y: 60, w: 340, h: 400 },
    },
  },
  {
    name: "Intermediário",
    crates: 8,
    layout: {
      truck: { x: 30, y: 80, w: 160, h: 360 },
      storage: { x: 220, y: 220, w: 280, h: 220 },
      ship: { x: 540, y: 60, w: 320, h: 420 },
    },
  },
  {
    name: "Avançado",
    crates: 12,
    layout: {
      truck: { x: 30, y: 50, w: 160, h: 420 },
      storage: { x: 220, y: 200, w: 320, h: 260 },
      ship: { x: 560, y: 60, w: 360, h: 420 },
    },
  },
  {
    name: "Especialista",
    crates: 15,
    layout: {
      truck: { x: 20, y: 40, w: 180, h: 440 },
      storage: { x: 210, y: 180, w: 340, h: 280 },
      ship: { x: 570, y: 50, w: 380, h: 440 },
    },
  },
  {
    name: "Mestre",
    crates: 18,
    layout: {
      truck: { x: 20, y: 30, w: 200, h: 460 },
      storage: { x: 200, y: 160, w: 360, h: 300 },
      ship: { x: 580, y: 40, w: 400, h: 460 },
    },
  },
];

let levelIndex = 0;

// -------------------- State --------------------
const STATE = {
  running: false,
  paused: false,
  startTime: 0,
  elapsed: 0,
  score: 0,
  errors: 0,
  cratesToShip: 0,
  player: null,
  crates: [],
  phase: 1, // 1 receive,2 store,3 ship,4 finished
  lastTick: 0,
  storedCount: 0,
};

// canvas size
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// -------------------- Player with accel/inertia --------------------
function createPlayer() {
  const x =
    LEVELS[levelIndex].layout.truck.x + LEVELS[levelIndex].layout.truck.w / 2;
  const y = LEVELS[levelIndex].layout.truck.y + 30;
  return {
    x,
    y,
    w: 28,
    h: 36,
    vx: 0,
    vy: 0,
    speed: 0.14, // acceleration
    maxSpeed: 2.8,
    friction: 0.9,
    carrying: null,
    animPhase: 0,
    // smooth animation
    prevX: x,
    prevY: y,
    lerpFactor: 0.1,
  };
}

// crate (3D-look)
function createCrate(x, y) {
  return {
    id: "c" + Math.random().toString(36).slice(2, 9),
    x,
    y,
    w: 34,
    h: 24,
    picked: false,
    stored: false,
    shipped: false,
    color: "#d2b48c",
  };
}

// -------------------- Helpers --------------------
function rnd(min, max) {
  return min + Math.random() * (max - min);
}
function rectIntersect(a, b) {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}
function pointDist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function logPanel(text, cls = "") {
  const el = document.createElement("div");
  el.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  if (cls) el.classList.add(cls);
  panelMessages.prepend(el);
  if (panelMessages.children.length > 40)
    panelMessages.removeChild(panelMessages.lastChild);
}

// -------------------- Init level --------------------
function setupLevel() {
  const lvl = LEVELS[levelIndex];
  // setup areas from layout
  AREAS.truck = { ...lvl.layout.truck, color: "#2b9cff", label: "Recebimento" };
  AREAS.storage = { ...lvl.layout.storage, color: "#16202b", label: "Estoque" };
  AREAS.shipping = { ...lvl.layout.ship, color: "#ff8a00", label: "Expedição" };

  STATE.crates = [];
  for (let i = 0; i < lvl.crates; i++) {
    // random positions inside truck area
    const x = clamp(
      lvl.layout.truck.x + 20 + rnd(0, lvl.layout.truck.w - 60),
      lvl.layout.truck.x + 10,
      lvl.layout.truck.x + lvl.layout.truck.w - 40
    );
    const y = clamp(
      lvl.layout.truck.y + 20 + rnd(0, lvl.layout.truck.h - 60),
      lvl.layout.truck.y + 10,
      lvl.layout.truck.y + lvl.layout.truck.h - 40
    );
    const c = createCrate(x, y);
    STATE.crates.push(c);
  }
  STATE.cratesToShip = lvl.crates;
  STATE.player = createPlayer();
  STATE.score = 0;
  STATE.errors = 0;
  STATE.phase = 1;
  STATE.elapsed = 0;
  STATE.storedCount = 0; // Inicializado corretamente
  hudLevel.textContent = LEVELS[levelIndex].name;
  hudPhase.textContent = "Receber";
  hudRemaining.textContent =
    STATE.cratesToShip - STATE.crates.filter((x) => x.shipped).length;
  hudScore.textContent = STATE.score;
  hudErrors.textContent = STATE.errors;
  hudTime.textContent = "0s";
  panelMessages.innerHTML = "";
  panelRanking.innerHTML = "";
  renderRankingPanel();
  logPanel(
    "Nível carregado. Pressione E na área de caminhão para iniciar o recebimento."
  );
}

// areas object (updated by setupLevel)
const AREAS = {
  truck: {
    x: 30,
    y: 60,
    w: 160,
    h: 400,
    color: "#2b9cff",
    label: "Recebimento",
  },
  storage: {
    x: 220,
    y: 250,
    w: 240,
    h: 200,
    color: "#16202b",
    label: "Estoque",
  },
  shipping: {
    x: 500,
    y: 60,
    w: 340,
    h: 390,
    color: "#ff8a00",
    label: "Expedição",
  },
};

// -------------------- Input --------------------
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  // prevent arrow scrolling
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key))
    e.preventDefault();
});
window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// -------------------- Actions --------------------
function withinArea(rect, area) {
  return rectIntersect(rect, area);
}

function tryReceive() {
  if (STATE.phase !== 1) return;
  const pRect = {
    x: STATE.player.x - STATE.player.w / 2,
    y: STATE.player.y - STATE.player.h / 2,
    w: STATE.player.w,
    h: STATE.player.h,
  };
  if (!withinArea(pRect, AREAS.truck)) {
    logPanel("Você precisa estar na área de Recebimento para receber.");
    playError();
    return;
  }
  // mark all crates as available in truck (they already are). Show message
  logPanel(
    `Recebimento iniciado: ${STATE.crates.length} caixas disponíveis. Pegue-as (Espaço) e leve ao estoque.`
  );
  playSuccess();
  // phase remains 1 until player stores crates; but set hud to 'Recebimento' (already)
}

function tryPickOrDrop() {
  const p = STATE.player;
  // if carrying -> drop attempt
  if (p.carrying) {
    const crate = STATE.crates.find((c) => c.id === p.carrying);
    if (!crate) {
      p.carrying = null;
      return;
    }
    // compute drop pos
    const dropX = p.x,
      dropY = p.y;
    const dropRect = {
      x: dropX - crate.w / 2,
      y: dropY - crate.h / 2,
      w: crate.w,
      h: crate.h,
    };

    // If in storage area and phase 1 or 2 => store
    if (
      withinArea(dropRect, AREAS.storage) &&
      (STATE.phase === 1 || STATE.phase === 2)
    ) {
      crate.x = clamp(
        dropRect.x,
        AREAS.storage.x + 8,
        AREAS.storage.x + AREAS.storage.w - crate.w - 8
      );
      crate.y = clamp(
        dropRect.y,
        AREAS.storage.y + 8,
        AREAS.storage.y + AREAS.storage.h - crate.h - 8
      );
      crate.stored = true;
      crate.picked = false;
      p.carrying = null;
      if (!isPracticeMode) STATE.score += 30;
      STATE.storedCount = (STATE.storedCount || 0) + 1;
      playDrop();
      playSuccess();
      addParticles(dropX, dropY, 8, "#00ff00"); // green particles for success
      logPanel("Caixa armazenada.");
      // if all stored, advance to shipping
      const storedCount = STATE.crates.filter((c) => c.stored).length;
      if (storedCount >= STATE.cratesToShip) {
        STATE.phase = 3;
        hudPhase.textContent = "Expedir";
        logPanel("Todas as caixas armazenadas. Agora expedir.");
      } else {
        STATE.phase = 2;
        hudPhase.textContent = "Armazenar";
      }
      updateHUD();
      return;
    }

    // If in shipping area and phase 3 => ship
    if (withinArea(dropRect, AREAS.shipping) && STATE.phase === 3) {
      crate.x = clamp(
        dropRect.x,
        AREAS.shipping.x + 8,
        AREAS.shipping.x + AREAS.shipping.w - crate.w - 8
      );
      crate.y = clamp(
        dropRect.y,
        AREAS.shipping.y + 8,
        AREAS.shipping.y + AREAS.shipping.h - crate.h - 8
      );
      crate.shipped = true;
      crate.picked = false;
      p.carrying = null;
      if (!isPracticeMode) STATE.score += 50;
      playDrop();
      playSuccess();
      addParticles(dropX, dropY, 8, "#00ff00"); // green particles for success
      logPanel("Caixa expedida.");
      updateHUD();
      // check finish
      const shipped = STATE.crates.filter((c) => c.shipped).length;
      if (shipped >= STATE.cratesToShip) {
        finishLevel();
      }
      return;
    }

    // else drop on floor (penalty)
    crate.x = dropRect.x;
    crate.y = dropRect.y;
    crate.picked = false;
    p.carrying = null;
    if (!isPracticeMode) {
      STATE.errors += 1;
      STATE.score -= 10;
    }
    updateHUD();
    addParticles(dropX, dropY, 8, "#ff0000"); // red particles for error
    logPanel(
      "Caixa solta em local incorreto." +
        (isPracticeMode ? "" : " Penalidade aplicada."),
      isPracticeMode ? "" : "danger"
    );
    if (!isPracticeMode) playError();
    return;
  } else {
    // not carrying -> try pick nearest crate
    const px = STATE.player.x,
      py = STATE.player.y;
    let nearest = null,
      nd = 9999;
    for (const c of STATE.crates) {
      if (c.picked || c.shipped) continue;
      const d = pointDist(px, py, c.x + c.w / 2, c.y + c.h / 2);
      if (d < nd) {
        nd = d;
        nearest = c;
      }
    }
    if (nearest && nd <= 34) {
      nearest.picked = true;
      STATE.player.carrying = nearest.id;
      playPick();
      addParticles(px, py, 5, "#ffff00"); // yellow particles for pick
      logPanel("Você pegou uma caixa.");
      return;
    } else {
      logPanel("Nenhuma caixa próxima para pegar.");
      return;
    }
  }
}

// -------------------- Finish and ranking --------------------
function finishLevel() {
  STATE.phase = 4;
  STATE.running = false;
  const totalTime = Math.round(STATE.elapsed);
  const finalScore =
    STATE.score - STATE.errors * 20 - Math.round(totalTime * 0.2);
  logPanel(
    `Nível concluído! Tempo: ${totalTime}s — Score: ${finalScore}`,
    "success"
  );
  finalSummary.textContent = `Tempo: ${totalTime}s — Pontos: ${finalScore} — Erros: ${STATE.errors}`;
  endModal.classList.remove("hidden");
  // save last result in memory to allow saving to ranking
  STATE.finalResult = {
    time: totalTime,
    score: finalScore,
    errors: STATE.errors,
    level: LEVELS[levelIndex].name,
    date: new Date().toISOString(),
  };
}

// ranking functions (localStorage)
const RANK_KEY = "logistica_master_rank";
function loadRanking() {
  try {
    return JSON.parse(localStorage.getItem(RANK_KEY) || "[]");
  } catch (e) {
    return [];
  }
}
function saveRankingEntry(entry) {
  const arr = loadRanking();
  arr.push(entry);
  arr.sort((a, b) => b.score - a.score);
  localStorage.setItem(RANK_KEY, JSON.stringify(arr.slice(0, 20)));
  renderRankingPanel();
}
function renderRankingPanel() {
  const arr = loadRanking();
  panelRanking.innerHTML = arr.length
    ? arr
        .slice(0, 8)
        .map(
          (r, i) =>
            `<div>#${i + 1} ${r.level} — ${r.score} pts — ${r.time}s</div>`
        )
        .join("")
    : '<div class="muted">Nenhum resultado ainda</div>';
}

// -------------------- HUD update --------------------
function updateHUD() {
  hudScore.textContent = STATE.score;
  hudErrors.textContent = STATE.errors;
  hudRemaining.textContent = Math.max(
    0,
    STATE.cratesToShip - STATE.crates.filter((c) => c.shipped).length
  );
}

// -------------------- Movement & collisions --------------------
function updatePlayer(dt) {
  const p = STATE.player;
  let ax = 0,
    ay = 0;
  if (keys["arrowup"] || keys["w"]) ay -= 1;
  if (keys["arrowdown"] || keys["s"]) ay += 1;
  if (keys["arrowleft"] || keys["a"]) ax -= 1;
  if (keys["arrowright"] || keys["d"]) ax += 1;
  // normalize
  if (ax !== 0 && ay !== 0) {
    ax *= Math.SQRT1_2;
    ay *= Math.SQRT1_2;
  }

  // acceleration
  p.vx += ax * p.speed * dt;
  p.vy += ay * p.speed * dt;

  // friction
  p.vx *= p.friction;
  p.vy *= p.friction;

  // clamp
  p.vx = clamp(p.vx, -p.maxSpeed, p.maxSpeed);
  p.vy = clamp(p.vy, -p.maxSpeed, p.maxSpeed);

  // smooth animation: interpolate position
  p.prevX = p.x;
  p.prevY = p.y;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.x = p.prevX + (p.x - p.prevX) * p.lerpFactor;
  p.y = p.prevY + (p.y - p.prevY) * p.lerpFactor;

  // collision with canvas bounds
  p.x = clamp(p.x, 12, WIDTH - 12);
  p.y = clamp(p.y, 12, HEIGHT - 12);

  // if carrying, follow player
  if (p.carrying) {
    const crate = STATE.crates.find((c) => c.id === p.carrying);
    if (crate) {
      crate.x = p.x - crate.w / 2;
      crate.y = p.y - crate.h / 2 - 6;
    } else p.carrying = null;
  }
}

// -------------------- Rendering visuals --------------------
function draw() {
  // background floor texture (industrial)
  drawFloor();

  // area glows
  drawAreaGlow(AREAS.truck, STATE.phase === 1 ? 0.16 : 0.06);
  drawAreaGlow(
    AREAS.storage,
    STATE.phase === 1 || STATE.phase === 2 ? 0.1 : 0.04
  );
  drawAreaGlow(AREAS.shipping, STATE.phase === 3 ? 0.14 : 0.05);

  // draw areas borders and labels
  drawAreaBorders();

  // crates (non-picked)
  for (const c of STATE.crates) {
    if (c.picked && STATE.player.carrying === c.id) continue;
    drawCrate3D(c);
  }

  // player
  drawPlayer();

  // carried crate on top
  if (STATE.player && STATE.player.carrying) {
    const cc = STATE.crates.find((r) => r.id === STATE.player.carrying);
    if (cc) drawCrate3D(cc, true);
  }

  // helpful indicator: show green overlay if player in valid drop area when carrying
  if (STATE.player && STATE.player.carrying) {
    const pRect = {
      x: STATE.player.x - 12,
      y: STATE.player.y - 18,
      w: 24,
      h: 36,
    };
    // storage valid?
    if (STATE.phase <= 2 && rectIntersect(pRect, AREAS.storage)) {
      drawDropHint(AREAS.storage, true);
    } else if (STATE.phase === 3 && rectIntersect(pRect, AREAS.shipping)) {
      drawDropHint(AREAS.shipping, true);
    } else {
      // show red hint near player
      drawDropHint(null, false);
    }
  }

  // HUD overlay messages (small)
  // TIME and score drawn on DOM, not on canvas
}

function drawFloor() {
  // procedural tiled texture and vignette
  ctx.fillStyle = "#08121a";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // draw subtle grid
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  for (let x = 0; x < WIDTH; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < HEIGHT; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // vignette
  const g = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  g.addColorStop(0, "rgba(0,0,0,0.02)");
  g.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawAreaGlow(area, alpha) {
  ctx.save();
  const grad = ctx.createRadialGradient(
    area.x + area.w / 2,
    area.y + area.h / 2,
    10,
    area.x + area.w / 2,
    area.y + area.h / 2,
    Math.max(area.w, area.h) * 1.1
  );
  grad.addColorStop(0, hexToRgba(area.color, alpha));
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(area.x - 40, area.y - 40, area.w + 80, area.h + 80);
  ctx.restore();
}

function drawAreaBorders() {
  for (const key of ["truck", "storage", "shipping"]) {
    const a = AREAS[key];
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 2;
    ctx.strokeRect(a.x, a.y, a.w, a.h);
    // label
    ctx.fillStyle = "rgba(230,238,246,0.9)";
    ctx.font = "bold 12px Inter, Arial";
    ctx.fillText(a.label, a.x + 8, a.y + 16);
    ctx.restore();
  }
}

function drawCrate3D(c, highlight = false) {
  ctx.save();
  // Enhanced 3D: top, left, right, front faces with gradients
  const topColor = shadeColor(c.color, 12);
  const leftColor = shadeColor(c.color, -12);
  const rightColor = shadeColor(c.color, -6);
  const frontColor = c.color;

  // Create gradients for depth
  const leftGrad = ctx.createLinearGradient(c.x - 6, c.y, c.x, c.y);
  leftGrad.addColorStop(0, leftColor);
  leftGrad.addColorStop(1, shadeColor(leftColor, -5));

  const rightGrad = ctx.createLinearGradient(
    c.x + c.w,
    c.y,
    c.x + c.w + 6,
    c.y
  );
  rightGrad.addColorStop(0, rightColor);
  rightGrad.addColorStop(1, shadeColor(rightColor, -5));

  const topGrad = ctx.createLinearGradient(c.x, c.y - 6, c.x, c.y);
  topGrad.addColorStop(0, topColor);
  topGrad.addColorStop(1, shadeColor(topColor, -5));

  const frontGrad = ctx.createLinearGradient(c.x, c.y, c.x, c.y + c.h);
  frontGrad.addColorStop(0, frontColor);
  frontGrad.addColorStop(1, shadeColor(frontColor, -10));

  // draw left face
  const lx = c.x - 6,
    ly = c.y + 6;
  ctx.fillStyle = leftGrad;
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  ctx.lineTo(lx, ly + c.h);
  ctx.lineTo(lx + 6, ly + c.h - 6);
  ctx.lineTo(lx + 6, ly - 6);
  ctx.closePath();
  ctx.fill();

  // draw right face
  const rx = c.x + c.w,
    ry = c.y - 6;
  ctx.fillStyle = rightGrad;
  ctx.beginPath();
  ctx.moveTo(rx, ry);
  ctx.lineTo(rx, ry + c.h);
  ctx.lineTo(rx + 6, ry + c.h - 6);
  ctx.lineTo(rx + 6, ry - 6);
  ctx.closePath();
  ctx.fill();

  // front face
  ctx.fillStyle = frontGrad;
  ctx.fillRect(c.x, c.y, c.w, c.h);

  // top face
  ctx.fillStyle = topGrad;
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(c.x + 6, c.y - 6);
  ctx.lineTo(c.x + c.w + 6, c.y - 6);
  ctx.lineTo(c.x + c.w, c.y);
  ctx.closePath();
  ctx.fill();

  // dynamic shadow based on "light" position (simulate sun from top-left)
  const shadowOffsetX = 4;
  const shadowOffsetY = 6;
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(
    c.x + c.w / 2 + shadowOffsetX,
    c.y + c.h + shadowOffsetY,
    c.w / 2,
    4,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // label
  ctx.fillStyle = "#08121a";
  ctx.font = "10px Inter, Arial";
  ctx.fillText(
    c.shipped ? "EXP" : c.stored ? "EST" : "BOX",
    c.x + 6,
    c.y + c.h - 6
  );

  if (highlight) {
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x - 1, c.y - 1, c.w + 2, c.h + 2);
  }
  ctx.restore();
}

function drawPlayer() {
  const p = STATE.player;
  ctx.save();

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 18, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs (animated)
  ctx.fillStyle = "#15394b";
  if (Math.abs(p.vx) + Math.abs(p.vy) > 0.2) {
    const legStep = Math.sin(STATE.elapsed * 12) * 4;
    ctx.fillRect(p.x - 6, p.y + 6 + legStep, 4, 12);
    ctx.fillRect(p.x + 2, p.y + 6 - legStep, 4, 12);
  } else {
    ctx.fillRect(p.x - 6, p.y + 6, 4, 12);
    ctx.fillRect(p.x + 2, p.y + 6, 4, 12);
  }

  // body rectangle
  ctx.fillStyle = "#ffdd99";
  ctx.fillRect(p.x - 10, p.y - 18, 20, 24);

  // head/helmet
  ctx.fillStyle = "#15394b";
  ctx.fillRect(p.x - 10, p.y - 28, 20, 10);

  // vest (animated stripe)
  const tilt = Math.sin(STATE.elapsed * 6) * 2;
  ctx.fillStyle = "#ff8a00";
  ctx.fillRect(p.x - 10 + tilt * 0.2, p.y - 10, 20, 6);

  // arms (simulate walking)
  ctx.fillStyle = "#15394b";
  if (Math.abs(p.vx) + Math.abs(p.vy) > 0.2) {
    const armStep = Math.sin(STATE.elapsed * 12) * 3;
    ctx.fillRect(p.x - 14, p.y - 2 + armStep, 4, 10);
    ctx.fillRect(p.x + 10, p.y - 2 - armStep, 4, 10);
  } else {
    ctx.fillRect(p.x - 14, p.y - 2, 4, 10);
    ctx.fillRect(p.x + 10, p.y - 2, 4, 10);
  }

  ctx.restore();
}

function drawDropHint(area, ok) {
  if (ok && area) {
    ctx.save();
    ctx.strokeStyle = "rgba(110,227,162,0.9)";
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 8]);
    ctx.strokeRect(area.x + 6, area.y + 6, area.w - 12, area.h - 12);
    ctx.restore();
  } else {
    // draw small red circle near player
    ctx.save();
    ctx.fillStyle = "rgba(255,100,100,0.6)";
    ctx.beginPath();
    ctx.arc(STATE.player.x, STATE.player.y - 36, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// -------------------- Utility color functions --------------------
function shadeColor(hex, percent) {
  // expects #rrggbb
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
  r = clamp(r, 0, 255);
  g = clamp(g, 0, 255);
  b = clamp(b, 0, 255);
  return `rgb(${r},${g},${b})`;
}
function hexToRgba(hex, a = 0.1) {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  const r = num >> 16;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${a})`;
}

// -------------------- Game loop --------------------
function tick(now) {
  if (!STATE.running || STATE.paused) {
    STATE.lastTick = now;
    requestAnimationFrame(tick);
    return;
  }
  const dt = Math.min(60, now - (STATE.lastTick || now)) / 16.666; // normalized to ~60fps
  STATE.lastTick = now;
  // update elapsed
  STATE.elapsed = (performance.now() - STATE.startTime) / 1000;

  // update time HUD
  hudTime.textContent = `${Math.floor(STATE.elapsed)}s`;

  updatePlayer(dt);
  // update crates auto adjustments (snap)
  // draw
  draw();
  // update HUD values occasionally
  updateHUD();

  // handle interactions (E & space)
  if (keys["e"] && Date.now() - (STATE.lastE || 0) > 300) {
    tryReceive();
    STATE.lastE = Date.now();
  }
  if (keys[" "] && Date.now() - (STATE.lastSpace || 0) > 220) {
    tryPickOrDrop();
    STATE.lastSpace = Date.now();
  }

  requestAnimationFrame(tick);
}

// -------------------- Controls and UI handlers --------------------
startBtn.addEventListener("click", () => {
  // initiate audio resume
  if (audioCtx.state === "suspended") audioCtx.resume();
  musicOn = musicToggle.checked;
  isPracticeMode = practiceMode.checked;
  levelIndex = parseInt(levelSelect.value, 10) || 0;
  overlay.classList.add("hidden");
  gameUI.classList.remove("hidden");
  setupLevel();
  STATE.running = true;
  STATE.startTime = performance.now();
  STATE.lastTick = performance.now();
  startAmbient();
  requestAnimationFrame(tick);
});

restartBtn.addEventListener("click", () => {
  // restart same level
  if (audioCtx.state === "suspended") audioCtx.resume();
  musicOn = musicToggle.checked;
  setupLevel();
  STATE.running = true;
  STATE.startTime = performance.now();
  STATE.lastTick = performance.now();
  endModal.classList.add("hidden");
  startAmbient();
});
exitBtn.addEventListener("click", () => {
  location.reload();
});
pauseBtn.addEventListener("click", () => {
  STATE.paused = !STATE.paused;
  pauseBtn.textContent = STATE.paused ? "Retomar" : "Pausar";
  if (STATE.paused) {
    stopAmbient();
  } else {
    startAmbient();
    STATE.lastTick = performance.now();
  }
});

showRankBtn.addEventListener("click", () => {
  overlay.classList.remove("hidden");
  renderRankingPanel();
});

// end modal actions
saveScoreBtn.addEventListener("click", () => {
  if (STATE.finalResult) saveRankingEntry(STATE.finalResult);
  endModal.classList.add("hidden");
  overlay.classList.remove("hidden");
});
playAgainBtn.addEventListener("click", () => {
  endModal.classList.add("hidden");
  setupLevel();
  STATE.running = true;
  STATE.startTime = performance.now();
  startAmbient();
});

// keyboard shortcut Enter to pick/drop
canvas.setAttribute("tabindex", "0");
canvas.addEventListener("keydown", (e) => {
  if (e.key === "Enter") tryPickOrDrop();
  if (e.key === "e") tryReceive();
});

// -------------------- End level UI --------------------
function finishLevelUI() {
  // show end modal with results
  const time = Math.round(STATE.elapsed);
  const finalScore =
    STATE.score - STATE.errors * 20 - Math.round(STATE.elapsed * 0.2);
  finalSummary.textContent = `Nível: ${LEVELS[levelIndex].name} — Tempo: ${time}s — Pontos: ${finalScore} — Erros: ${STATE.errors}`;
  // populate expanded stats
  const totalCrates = STATE.crates.length;
  const avgTimePerBox = totalCrates > 0 ? (time / totalCrates).toFixed(1) : "0";
  const storedBoxes = STATE.storedCount;
  const shippedBoxes = STATE.crates.filter((c) => c.shipped).length;
  const efficiency =
    totalCrates > 0 ? Math.round((shippedBoxes / totalCrates) * 100) : 0;
  avgTimePerBox.textContent = `${avgTimePerBox}s`;
  storedBoxes.textContent = storedBoxes;
  shippedBoxes.textContent = shippedBoxes;
  efficiency.textContent = `${efficiency}%`;
  endModal.classList.remove("hidden");
  stopAmbient();
}

// wrap finishLevel to call UI and log
function finishLevel() {
  finishLevelUI();
  STATE.running = false;
  playSuccess();
}

// -------------------- Initial rendering helper --------------------
function updateHUD() {
  hudScore.textContent = STATE.score;
  hudErrors.textContent = STATE.errors;
  hudRemaining.textContent = Math.max(
    0,
    STATE.cratesToShip - STATE.crates.filter((c) => c.shipped).length
  );
}

// -------------------- Initial ranking render --------------------
function renderRankingPanel() {
  const arr = loadRanking();
  panelRanking.innerHTML = arr.length
    ? arr
        .slice(0, 8)
        .map(
          (r, i) =>
            `<div>#${i + 1} ${r.level} — ${r.score} pts — ${r.time}s</div>`
        )
        .join("")
    : '<div class="muted">Nenhum resultado ainda</div>';
}

// -------------------- Start with overlay shown --------------------
setupLevel(); // load initial config for preview
renderRankingPanel();
logPanel(
  "Bem-vindo ao Logística Master v2 — ajuste as opções e inicie a simulação."
);
