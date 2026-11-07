const CONFIG = {
  name: "Ryn ♡",
  from: "with love, always the Haechan to your Mark ♡",
  message: "I miss u so much. I miss talking, hugging, laughing and enjoying everything with u.. Other things may have changed now, but I always love u so much.. so glad to have met u and to have u throughout the journey of knowing nct, especially with Mahae ♡",
  // one wish = one page in the card
  wishes: [
    "Love u and love u pretty!!!",
    "Hope u had the happiest day ever today cause u deserved it!",
    "I hope I really get to see u soon, ’cause I miss my girl. Missin my baby Ryn real bad..",
    "Thank u for all these years of being the best friend a girl can have..",
    "All my wishes for u: to alwayssmile and enjoy anything u like in life..",
    "Stay healthy and take care always."
  ],
  closing: "Happiest birthday, my dearest Ryn ♡",
  candles: 5,
  
  song: "",
  photos: ["img/love.jpg", "img/love.jpg", "img/sample3.svg"]
};
// ============================

const $ = (id) => document.getElementById(id);
const candlesEl = $("candles");
let remaining = 0;

$("name").textContent = CONFIG.name;
$("message").textContent = CONFIG.message;

function lightCandles() {
  candlesEl.innerHTML = "";
  remaining = CONFIG.candles;
  for (let i = 0; i < CONFIG.candles; i++) {
    const c = document.createElement("button");
    c.className = "candle";
    c.type = "button";
    c.setAttribute("aria-label", `Blow out candle ${i + 1}`);
    c.innerHTML = '<span class="flame"></span>';
    c.addEventListener("click", () => blowOut(c));
    candlesEl.appendChild(c);
  }
  $("reveal").hidden = true;
  stopRain();
  if (leaves.length) goTo(0);
  $("hint").textContent = "Tap each candle to blow it out";
}

function blowOut(c) {
  if (c.classList.contains("out")) return;
  c.classList.add("out");
  music.start();
  remaining--;
  if (remaining === 0) {
    $("hint").textContent = "Yay! Hope your wish comes true";
    $("reveal").hidden = false;
    startRain();
    $("reveal").scrollIntoView({ behavior: "smooth", block: "center" });
    burst();
  } else {
    $("hint").textContent = `${remaining} more to go`;
  }
}

$("again").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  lightCandles();
});

/* confetti */
const canvas = $("confetti");
const ctx = canvas.getContext("2d");
let pieces = [];
const colors = ["#ffb3d1", "#d4c1ff", "#b8e1ff", "#ffe9a8", "#c8f2e0", "#ffffff"];

function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", resize);
resize();

function burst() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < 160; i++) {
    pieces.push({
      x: innerWidth / 2, y: innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 16, vy: Math.random() * -14 - 4,
      s: Math.random() * 7 + 4, r: Math.random() * 6,
      c: colors[(Math.random() * colors.length) | 0], life: 160
    });
  }
  if (pieces.length === 160) tick();
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces = pieces.filter((p) => p.life > 0);
  for (const p of pieces) {
    p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.r += 0.2; p.life--;
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.r);
    ctx.globalAlpha = Math.min(1, p.life / 40);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
    ctx.restore();
  }
  if (pieces.length) requestAnimationFrame(tick);
}

/* ---------- music ---------- */
const music = (() => {
  const F = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
  const tune = [
    ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
    ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
    ["G4", .75], ["G4", .25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 1],
    ["F5", .75], ["F5", .25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2]
  ];
  const beat = 0.85; // seconds per beat (bigger = slower)
  const btn = $("music");
  let ctx, master, timer, idx = 0, next = 0, started = false, playing = false, audio = null;

  function setup() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.9;
    const delay = ctx.createDelay(); delay.delayTime.value = 0.33;
    const fb = ctx.createGain(); fb.gain.value = 0.3;
    master.connect(ctx.destination);
    master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(ctx.destination);
  }
  function ring(freq, t) {
    [[1, .16], [2, .05], [3, .02]].forEach(([m, v]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq * m;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0005, t + 2);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 2.1);
    });
  }
  function pump() {
    while (next < ctx.currentTime + 0.4) {
      const [n, b] = tune[idx];
      ring(F[n], next);
      next += b * beat; idx++;
      if (idx >= tune.length) { idx = 0; next += beat * 3; }
    }
  }
  function label() {
    btn.textContent = playing ? "\u266A Music on" : "\u266A Music off";
    btn.setAttribute("aria-pressed", playing);
  }
  function play() {
    if (CONFIG.song) {
      audio = audio || Object.assign(new Audio(CONFIG.song), { loop: true, volume: 0.5 });
      audio.play().catch(() => {});
    } else {
      if (!ctx) setup();
      ctx.resume();
      if (!timer) { next = ctx.currentTime + 0.1; timer = setInterval(pump, 100); }
    }
    playing = true; label();
  }
  function pause() {
    if (audio) audio.pause();
    if (ctx) ctx.suspend();
    playing = false; label();
  }
  btn.addEventListener("click", () => { started = true; playing ? pause() : play(); });
  return { start() { if (!started) { started = true; play(); } } };
})();

/* ---------- photo raindrops ---------- */
const rainEl = $("rain");
let rainTimer = null;

function spawnDrop() {
  const src = CONFIG.photos[(Math.random() * CONFIG.photos.length) | 0];
  const d = document.createElement("div");
  d.className = "drop";
  d.style.setProperty("--s", 70 + Math.random() * 50 + "px");
  d.style.setProperty("--fd", 11 + Math.random() * 6 + "s");
  d.style.setProperty("--sd", 3 + Math.random() * 2 + "s");
  d.style.left = Math.random() * 90 + "%";
  d.innerHTML = '<div class="shape"><img alt=""></div>';
  d.querySelector("img").src = src;
  d.addEventListener("animationend", (e) => { if (e.animationName === "fall") d.remove(); });
  rainEl.appendChild(d);
}
function startRain() {
  if (!CONFIG.photos.length || rainTimer) return;
  spawnDrop();
  rainTimer = setInterval(spawnDrop, 2200);
}
function stopRain() {
  clearInterval(rainTimer); rainTimer = null;
  rainEl.innerHTML = "";
}

/* ---------- wish card ---------- */
const stage = $("stage"), pageNo = $("pageNo"), prevBtn = $("prev"), nextBtn = $("next");
let leaves = [], cur = 0;
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function buildCard() {
  const pages = [
    { cls: "cover", html: `<p class="cursive big">For ${esc(CONFIG.name)}</p><p class="tiny">tap or swipe to open</p>` },
    ...CONFIG.wishes.map((w) => ({ html: `<span class="heart">&#9825;</span><p class="cursive">${esc(w)}</p>` })),
    { html: `<p class="cursive">${esc(CONFIG.closing)}</p><p class="cursive sign">${esc(CONFIG.from)}</p><span class="heart">&#9825;</span>` }
  ];
  const n = pages.length;
  stage.innerHTML = "";
  leaves = pages.map((p, i) => {
    const el = document.createElement("div");
    el.className = "leaf" + (p.cls ? " " + p.cls : "");
    el.style.zIndex = n - i;
    el.innerHTML = p.html + (i ? `<span class="pg">${i + 1} / ${n}</span>` : "");
    stage.appendChild(el);
    return el;
  });
  goTo(0);
}

function goTo(i) {
  cur = Math.max(0, Math.min(leaves.length - 1, i));
  leaves.forEach((l, k) => {
    l.classList.toggle("flipped", k < cur);
    l.setAttribute("aria-hidden", k !== cur);
  });
  pageNo.textContent = `${cur + 1} / ${leaves.length}`;
  prevBtn.disabled = cur === 0;
  nextBtn.disabled = cur === leaves.length - 1;
}

prevBtn.addEventListener("click", () => goTo(cur - 1));
nextBtn.addEventListener("click", () => goTo(cur + 1));

let startX = null;
stage.addEventListener("pointerdown", (e) => { startX = e.clientX; });
stage.addEventListener("pointerup", (e) => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  startX = null;
  if (dx < -40) goTo(cur + 1);
  else if (dx > 40) goTo(cur - 1);
  else if (Math.abs(dx) < 8) goTo(cur + 1); // tap = turn page
});
document.addEventListener("keydown", (e) => {
  if ($("reveal").hidden) return;
  if (e.key === "ArrowRight") goTo(cur + 1);
  if (e.key === "ArrowLeft") goTo(cur - 1);
});

buildCard();
lightCandles();