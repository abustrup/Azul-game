'use strict';

/* ============================================================
   AZUL — Digital Edition  (Azulejo / Moorish theme)
   Human vs 1–3 AI. No boxes. Big hero board.
   ============================================================ */

// ---------------- Constants ----------------
const COLORS = ['sun', 'flower', 'leaf', 'shell', 'gem'];
const COLOR_INDEX = { sun: 0, flower: 1, leaf: 2, shell: 3, gem: 4 };
const TILE_CLASS = { sun: 't-sun', flower: 't-flower', leaf: 't-leaf', shell: 't-shell', gem: 't-gem' };
const JEWEL = { sun: '#e09a1e', flower: '#c6364c', leaf: '#1f9358', shell: '#1f93c4', gem: '#3c4a72' };
const NUM_EACH = 20;
const FLOOR_PENALTIES = [-1, -1, -2, -2, -2, -3, -3];
const FACTORIES_FOR = { 2: 5, 3: 7, 4: 9 };
const BOT_NAMES = ['Sage', 'Lumen', 'Vega'];

const wallColFor = (row, ci) => (row + ci) % 5;
const colorIndexForWall = (row, col) => ((col - row) % 5 + 5) % 5;
const colorForWall = (row, col) => COLORS[colorIndexForWall(row, col)];

// ---------------- SVG tile faces — azulejo enameled ceramic motifs ----------------
// Near-white painted stroke on a colored ceramic body (body color set in CSS).
const STROKE  = 'rgba(255,255,255,0.95)';  // painted motif line
const STROKE2 = 'rgba(255,255,255,0.5)';   // secondary / inner line
const INK     = 'rgba(8,16,30,0.28)';      // etched shadow inside white fills

// SUN — radiant compass sunburst (16 alternating rays, ringed white boss)
function sunFace() {
  let rays = '';
  for (let i = 0; i < 16; i++) {
    const a = (i * 22.5) * Math.PI / 180;
    const r1 = 17, r2 = i % 2 === 0 ? 42 : 32;
    rays += `<line x1="${(50 + Math.cos(a) * r1).toFixed(1)}" y1="${(50 + Math.sin(a) * r1).toFixed(1)}" x2="${(50 + Math.cos(a) * r2).toFixed(1)}" y2="${(50 + Math.sin(a) * r2).toFixed(1)}"/>`;
  }
  return `<svg viewBox="0 0 100 100" class="face"><circle cx="50" cy="50" r="45" fill="none" stroke="${STROKE2}" stroke-width="1.4"/><g fill="none" stroke="${STROKE}" stroke-width="3" stroke-linecap="round">${rays}</g><circle cx="50" cy="50" r="15" fill="${STROKE}"/><circle cx="50" cy="50" r="10" fill="none" stroke="${INK}" stroke-width="1.3"/><circle cx="50" cy="50" r="4.5" fill="${INK}"/></svg>`;
}
// FLOWER — eight-petal azulejo rosette
function flowerFace() {
  let outer = '', inner = '', dots = '';
  for (let i = 0; i < 8; i++) outer += `<ellipse cx="50" cy="27" rx="7" ry="19" transform="rotate(${i * 45} 50 50)"/>`;
  for (let i = 0; i < 8; i++) inner += `<ellipse cx="50" cy="37" rx="4" ry="11" transform="rotate(${i * 45 + 22.5} 50 50)"/>`;
  for (let i = 0; i < 8; i++) { const a = (i * 45) * Math.PI / 180; dots += `<circle cx="${(50 + Math.cos(a) * 14).toFixed(1)}" cy="${(50 + Math.sin(a) * 14).toFixed(1)}" r="1.4"/>`; }
  return `<svg viewBox="0 0 100 100" class="face"><g fill="none" stroke="${STROKE}" stroke-width="2.4">${outer}</g><g fill="none" stroke="${STROKE2}" stroke-width="1.8">${inner}</g><g fill="${STROKE}">${dots}</g><circle cx="50" cy="50" r="8.5" fill="${STROKE}"/><circle cx="50" cy="50" r="3.2" fill="${INK}"/></svg>`;
}
// LEAF — four-fold palmette cross with diagonal buds
function leafFace() {
  let leaves = '', buds = '';
  for (let i = 0; i < 4; i++) leaves += `<g transform="rotate(${i * 90} 50 50)"><path d="M50 49 C41 33 44 18 50 11 C56 18 59 33 50 49 Z"/><path d="M50 16 L50 45"/></g>`;
  for (let i = 0; i < 4; i++) { const a = (i * 90 + 45) * Math.PI / 180; buds += `<circle cx="${(50 + Math.cos(a) * 23).toFixed(1)}" cy="${(50 + Math.sin(a) * 23).toFixed(1)}" r="3"/>`; }
  return `<svg viewBox="0 0 100 100" class="face"><g fill="none" stroke="${STROKE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${leaves}</g><g fill="${STROKE2}">${buds}</g><circle cx="50" cy="50" r="6" fill="${STROKE}"/><circle cx="50" cy="50" r="2.2" fill="${INK}"/></svg>`;
}
// SHELL — the iconic Azul eight-point snowflake star
function shellFace() {
  let pts = '', inner = '';
  for (let i = 0; i < 16; i++) { const a = (-90 + i * 22.5) * Math.PI / 180, r = i % 2 === 0 ? 40 : 16;
    pts += `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)} `; }
  for (let i = 0; i < 16; i++) { const a = (-90 + i * 22.5) * Math.PI / 180, r = i % 2 === 0 ? 27 : 11;
    inner += `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)} `; }
  return `<svg viewBox="0 0 100 100" class="face"><circle cx="50" cy="50" r="45" fill="none" stroke="${STROKE2}" stroke-width="1.2"/><polygon points="${pts.trim()}" fill="${STROKE}"/><polygon points="${inner.trim()}" fill="none" stroke="${INK}" stroke-width="1.2"/><circle cx="50" cy="50" r="4" fill="${INK}"/></svg>`;
}
// GEM — Moorish khatim eight-point star (obsidian sapphire, no purple)
function gemFace() {
  let oct = '';
  for (let i = 0; i < 8; i++) { const a = i * 45 * Math.PI / 180; oct += `${(50 + Math.cos(a) * 16).toFixed(1)},${(50 + Math.sin(a) * 16).toFixed(1)} `; }
  return `<svg viewBox="0 0 100 100" class="face"><g fill="none" stroke="${STROKE}" stroke-width="2.6" stroke-linejoin="round"><polygon points="50,11 89,50 50,89 11,50"/><polygon points="22,22 78,22 78,78 22,78"/></g><polygon points="${oct.trim()}" fill="none" stroke="${STROKE2}" stroke-width="1.6"/><g fill="none" stroke="${STROKE}" stroke-width="2"><polygon points="50,40 60,50 50,60 40,50"/></g><circle cx="50" cy="50" r="2.6" fill="${INK}"/></svg>`;
}
const FACE = { sun: sunFace, flower: flowerFace, leaf: leafFace, shell: shellFace, gem: gemFace };
// First-player marker — gilt heraldic star on obsidian (color via currentColor)
const starFace = () => `<svg viewBox="0 0 100 100" class="face"><path d="M50 13 L58.5 39.5 L86 40.5 L63.5 57 L72 84 L50 67.5 L28 84 L36.5 57 L14 40.5 L41.5 39.5 Z" fill="currentColor"/><circle cx="50" cy="50" r="5.5" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.6"/></svg>`;

// ---------------- Icon glyphs (no emoji) ----------------
const ICONS = {
  soundOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  soundOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>',
  log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg>'
};

// ---------------- Sound engine (Web Audio, no files) ----------------
const Sound = (() => {
  let ctx = null, master = null, enabled = true;
  const ac = () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    return ctx;
  };
  function tone(freq, dur, type = 'sine', vol = 0.2, when = 0) {
    if (!enabled) return;
    try {
      const c = ac(), t = c.currentTime + when;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(master);
      o.start(t); o.stop(t + dur + 0.03);
    } catch (e) { /* ignore */ }
  }
  // soft bell with a shimmer overtone
  function bell(freq, vol = 0.16, when = 0) {
    tone(freq, 0.5, 'sine', vol, when);
    tone(freq * 2, 0.4, 'sine', vol * 0.4, when);
    tone(freq * 3, 0.3, 'triangle', vol * 0.15, when);
  }
  return {
    resume() { try { ac().resume(); } catch (e) { } },
    pickup() { tone(587, 0.12, 'triangle', 0.14); tone(880, 0.1, 'triangle', 0.08, 0.03); tone(1175, 0.08, 'sine', 0.05, 0.05); },
    place()  { bell(523, 0.14); tone(392, 0.16, 'sine', 0.1, 0.02); },
    floor()  { tone(150, 0.22, 'sawtooth', 0.13); tone(98, 0.2, 'sine', 0.1, 0.02); },
    score()  { [523, 659, 784, 1047].forEach((f, i) => bell(f, 0.13, i * 0.09)); },
    round()  { bell(392, 0.08, 0); bell(587, 0.07, 0.04); bell(784, 0.06, 0.09); },
    win()    { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => { bell(f, 0.15, i * 0.13); }); tone(1047, 1.4, 'sine', 0.07, 0.9); },
    set(v) { enabled = v; }, enabled: () => enabled, toggle() { enabled = !enabled; return enabled; }
  };
})();

// ---------------- State ----------------
let state = null;
let pending = null;
let aiTimerId = null;        // pending AI setTimeout, so we never double-schedule and can cancel on new game
let wallTilingAt = 0;        // timestamp the wall-tiling phase began (for the watchdog)
let watchdogId = null;

const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
const colorWord = (c) => c.charAt(0).toUpperCase() + c.slice(1);

function log(msg) {
  const list = $('#logList');
  list.prepend(el('li', '', msg));
  while (list.children.length > 80) list.lastChild.remove();
}
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------- Setup ----------------
function newGame(numPlayers) {
  const n = numPlayers || 2;
  state = {
    bag: buildBag(),
    boxLid: [],
    factories: Array.from({ length: FACTORIES_FOR[n] }, () => []),
    center: [],
    markerInCenter: true,
    players: [makePlayer('You', true)].concat(
      BOT_NAMES.slice(0, n - 1).map((nm) => makePlayer(nm + ' Bot', false))
    ),
    currentPlayer: 0,
    round: 1,
    phase: 'drafting',
    firstPlayerNext: 0,
    gameOver: false,
    lastPlace: null,
  };
  pending = null;
  if (aiTimerId) { clearTimeout(aiTimerId); aiTimerId = null; }
  wallTilingAt = 0;
  $('#logList').innerHTML = '';
  $('#modalOverlay').classList.add('hidden');
  fillFactories();
  log(`A new game begins — ${n} players. You play first.`);
  render();
  Sound.round();
}

function buildBag() {
  const bag = [];
  for (const c of COLORS) for (let i = 0; i < NUM_EACH; i++) bag.push(c);
  return shuffle(bag);
}
function makePlayer(name, isHuman) {
  return {
    name, isHuman, score: 0,
    patternLines: [0, 1, 2, 3, 4].map((i) => ({ color: null, count: 0, capacity: i + 1 })),
    wall: Array.from({ length: 5 }, () => [false, false, false, false, false]),
    floor: [],
  };
}
function drawFromBag(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    if (state.bag.length === 0) {
      if (state.boxLid.length === 0) break;
      state.bag = shuffle(state.boxLid.splice(0));
    }
    out.push(state.bag.pop());
  }
  return out;
}
function fillFactories() {
  for (let f = 0; f < state.factories.length; f++) {
    if (state.factories[f].length === 0) state.factories[f] = drawFromBag(4);
  }
}

// ---------------- Rules helpers ----------------
function colorOnWallRow(player, row, color) { return player.wall[row][wallColFor(row, COLOR_INDEX[color])]; }
function validLines(player, color) {
  const res = [];
  for (let i = 0; i < 5; i++) {
    const line = player.patternLines[i];
    if (line.color && line.color !== color) continue;
    if (line.count >= line.capacity) continue;          // line already full — cannot accept this color
    if (colorOnWallRow(player, i, color)) continue;     // color already tiled on this wall row
    res.push(i);
  }
  return res;
}
function colorCountInSource(sourceType, idx, color) {
  const src = sourceType === 'factory' ? state.factories[idx] : state.center;
  return src.filter((c) => c === color).length;
}
function scorePlacement(wall, row, col) {
  let h = 1, v = 1;
  for (let c = col - 1; c >= 0 && wall[row][c]; c--) h++;
  for (let c = col + 1; c < 5 && wall[row][c]; c++) h++;
  for (let r = row - 1; r >= 0 && wall[r][col]; r++) v++;
  for (let r = row + 1; r < 5 && wall[r][col]; r++) v++;
  let pts = 0;
  if (h > 1) pts += h;
  if (v > 1) pts += v;
  return pts === 0 ? 1 : pts;
}

// ---------------- Drafting actions ----------------
function selectDraft(sourceType, sourceIndex, color) {
  if (!state || state.gameOver || state.phase !== 'drafting') return;
  const me = state.players[state.currentPlayer];
  if (!me.isHuman) return;
  if (colorCountInSource(sourceType, sourceIndex, color) === 0) return;
  pending = { sourceType, sourceIndex, color };
  pending.count = colorCountInSource(sourceType, sourceIndex, color);
  Sound.pickup();
  render();
}
function resolveToLine(lineIndex) {
  if (!pending) return;
  const me = state.players[state.currentPlayer];
  if (!validLines(me, pending.color).includes(lineIndex)) return;
  doPlace(me, pending, lineIndex);
  pending = null;
  afterMove();
}
function resolveToFloor() {
  if (!pending) return;
  const me = state.players[state.currentPlayer];
  doPlace(me, pending, -1);
  pending = null;
  afterMove();
}
function doPlace(player, draft, lineIndex) {
  const taken = removeColorFromSource(draft.sourceType, draft.sourceIndex, draft.color);
  let takeMarker = false;
  if (draft.sourceType === 'center' && state.markerInCenter) { state.markerInCenter = false; takeMarker = true; }
  if (draft.sourceType === 'factory') {
    for (const c of state.factories[draft.sourceIndex]) state.center.push(c);
    state.factories[draft.sourceIndex] = [];
  }
  if (lineIndex === -1) {
    addToFloor(player, Array(taken).fill(draft.color), takeMarker);
  } else {
    const line = player.patternLines[lineIndex];
    const space = line.capacity - line.count;
    const fit = Math.min(taken, space);
    line.color = draft.color; line.count += fit;
    const overflow = taken - fit;
    if (overflow > 0) addToFloor(player, Array(overflow).fill(draft.color), takeMarker);
    else if (takeMarker) addToFloor(player, [], true);
    state.lastPlace = { player: state.players.indexOf(player), line: lineIndex };
  }
  Sound[lineIndex === -1 ? 'floor' : 'place']();
  const dest = lineIndex === -1 ? 'the floor' : `line ${lineIndex + 1}`;
  const src = draft.sourceType === 'center' ? 'the center' : `factory ${draft.sourceIndex + 1}`;
  log(`${player.name} took ${taken} ${colorWord(draft.color)} from ${src} &rarr; ${dest}.`);
}
function removeColorFromSource(sourceType, idx, color) {
  let removed = 0; const keep = [];
  const src = sourceType === 'factory' ? state.factories[idx] : state.center;
  for (const c of src) { if (c === color) removed++; else keep.push(c); }
  if (sourceType === 'factory') state.factories[idx] = keep; else state.center = keep;
  return removed;
}
function addToFloor(player, tiles, takeMarker) {
  if (takeMarker) player.floor.push('first');
  for (const c of tiles) { if (player.floor.length < 7) player.floor.push(c); else state.boxLid.push(c); }
}

// ---------------- Turn & round flow ----------------
function afterMove() {
  if (roundComplete()) { endRound(); return; }
  nextPlayer(); render(); maybeAITurn();
}
function roundComplete() { return state.factories.every((f) => f.length === 0) && state.center.length === 0; }
function nextPlayer() { state.currentPlayer = (state.currentPlayer + 1) % state.players.length; }

function scheduleAI() {
  // schedule (or reschedule) the current AI player's move; never stack two timers
  if (aiTimerId) clearTimeout(aiTimerId);
  aiTimerId = setTimeout(() => { aiTimerId = null; aiMove(); }, 650 + Math.random() * 400);
}
function maybeAITurn() {
  if (!state || state.gameOver || state.phase !== 'drafting') return;
  const me = state.players[state.currentPlayer];
  if (me && !me.isHuman) scheduleAI();
}

function endRound() {
  state.phase = 'wallTiling';
  wallTilingAt = Date.now();
  if (aiTimerId) { clearTimeout(aiTimerId); aiTimerId = null; }
  log(`&mdash; Round ${state.round}: Wall Tiling &mdash;`);
  try { Sound.score(); } catch (e) { /* audio must never break the turn engine */ }
  render();
  setTimeout(doWallTiling, 700);
}

// Idempotent wall-tiling + round advance. Guarded by phase so the setTimeout
// and the watchdog can never double-run it. Wrapped so any error still advances.
function doWallTiling() {
  if (!state || state.phase !== 'wallTiling') return;
  try {
    for (const p of state.players) {
      let placedPts = 0, placedCount = 0;
      for (let i = 0; i < 5; i++) {
        const line = p.patternLines[i];
        if (line.count === line.capacity && line.color) {
          const col = wallColFor(i, COLOR_INDEX[line.color]);
          p.wall[i][col] = true;
          const pts = scorePlacement(p.wall, i, col);
          p.score += pts; placedPts += pts; placedCount++;
          for (let k = 0; k < line.capacity - 1; k++) state.boxLid.push(line.color);
          line.count = 0; line.color = null;
        }
      }
      let pen = 0;
      for (let i = 0; i < Math.min(p.floor.length, 7); i++) pen += FLOOR_PENALTIES[i];
      if (pen) p.score = Math.max(0, p.score + pen);
      let hadMarker = false;
      for (const f of p.floor) { if (f === 'first') hadMarker = true; else state.boxLid.push(f); }
      if (hadMarker) state.firstPlayerNext = state.players.indexOf(p);
      p.floor = [];
      if (placedCount) log(`${p.name} tiled ${placedCount} tile(s), +${placedPts}${pen ? ` (floor ${pen})` : ''}.`);
      else if (pen) log(`${p.name}: no tiling; floor ${pen}.`);
    }
    state.markerInCenter = true;
    const ended = state.players.some((p) => p.wall.some((row) => row.every(Boolean)));
    if (ended) { finalScoring(); state.gameOver = true; state.phase = 'gameOver'; render(); showGameOver(); return; }
    state.round++;
    state.currentPlayer = state.firstPlayerNext;
    state.phase = 'drafting';
    fillFactories();
    log(`&mdash; Round ${state.round} begins; ${state.players[state.currentPlayer].name} starts. &mdash;`);
    try { Sound.round(); } catch (e) { }
    render();
    maybeAITurn();
  } catch (err) {
    // Last-resort recovery: never strand the game on "Tiling the wall…".
    console.error('Wall-tiling error, forcing recovery:', err);
    try {
      state.phase = 'drafting';
      if (state.round == null) state.round = 1;
      if (!Number.isInteger(state.currentPlayer) || state.currentPlayer < 0 || state.currentPlayer >= state.players.length) state.currentPlayer = 0;
      fillFactories();
      render();
      maybeAITurn();
    } catch (e2) { console.error('Recovery failed:', e2); }
  }
}
function finalScoring() {
  for (const p of state.players) {
    let bonus = 0;
    for (let r = 0; r < 5; r++) if (p.wall[r].every(Boolean)) bonus += 2;
    for (let c = 0; c < 5; c++) { let full = true; for (let r = 0; r < 5; r++) if (!p.wall[r][c]) { full = false; break; } if (full) bonus += 7; }
    for (const col of COLORS) { let n = 0; for (let r = 0; r < 5; r++) if (p.wall[r][wallColFor(r, COLOR_INDEX[col])]) n++; if (n === 5) bonus += 10; }
    p.score += bonus;
    if (bonus) log(`${p.name} final bonuses: +${bonus}.`);
  }
}

// ---------------- AI ----------------
function aiMove() {
  if (!state || state.gameOver || state.phase !== 'drafting') return;
  const me = state.players[state.currentPlayer];
  if (!me || me.isHuman) return;          // never auto-play the human (stale-timer safety)
  const moves = enumerateMoves(me);
  if (moves.length === 0) { afterMove(); return; }   // safety net (round end should already be handled)
  let best = moves[0], bestScore = -Infinity;
  for (const m of moves) {
    const s = evalMove(me, m) + Math.random() * 0.5;
    if (s > bestScore) { bestScore = s; best = m; }
  }
  doPlace(me, best, best.lineIndex);
  pending = null;
  afterMove();
}
function enumerateMoves(player) {
  const moves = [];
  for (let f = 0; f < state.factories.length; f++)
    for (const c of [...new Set(state.factories[f])]) addMovesForSource(moves, 'factory', f, c, player);
  if (state.center.length > 0) for (const c of [...new Set(state.center)]) addMovesForSource(moves, 'center', 0, c, player);
  return moves;
}
function addMovesForSource(moves, sourceType, sourceIndex, color, player) {
  for (const l of validLines(player, color)) moves.push({ sourceType, sourceIndex, color, lineIndex: l });
  moves.push({ sourceType, sourceIndex, color, lineIndex: -1 });
}
function evalMove(player, m) {
  let s = 0;
  if (m.lineIndex === -1) { s -= 4; if (m.sourceType === 'center' && state.markerInCenter) s -= 1; return s; }
  const line = player.patternLines[m.lineIndex];
  const count = colorCountInSource(m.sourceType, m.sourceIndex, m.color);
  const space = line.capacity - line.count;
  const fit = Math.min(count, space);
  const overflow = count - fit;
  const wouldComplete = line.count + fit === line.capacity;
  if (wouldComplete) {
    s += 14;
    s += scorePlacement(player.wall, m.lineIndex, wallColFor(m.lineIndex, COLOR_INDEX[m.color]));
    if (player.wall[m.lineIndex].filter(Boolean).length === 4) s += 5;
  } else { s += fit * 3; s += (line.count + fit); }
  s -= overflow * 5;
  if (m.sourceType === 'center' && state.markerInCenter) s -= 2;
  s += count * 0.6;
  return s;
}

// ---------------- Rendering ----------------
function tileEl(color, extra) {
  const t = el('div', 'tile ' + TILE_CLASS[color] + (extra ? ' ' + extra : ''));
  t.innerHTML = FACE[color]();
  return t;
}

function render() {
  if (!state) return;
  renderMarket();
  renderOpponents();
  renderSelf();
  renderStatus();
}

function renderMarket() {
  const area = $('#market');
  area.innerHTML = '';
  area.appendChild(el('div', 'market-label', 'The Market'));
  const humanTurn = !state.gameOver && state.phase === 'drafting' && state.players[state.currentPlayer].isHuman;

  for (let f = 0; f < state.factories.length; f++) {
    const fac = el('div', 'factory');
    if (humanTurn) fac.classList.add('selectable');
    const tiles = state.factories[f];
    if (tiles.length === 0) { fac.classList.add('empty-factory'); fac.appendChild(el('div', 'factory-empty', '&bull;&bull;&bull;')); }
    else for (const c of tiles) {
      const t = tileEl(c);
      t.dataset.source = 'factory'; t.dataset.sourceIndex = f; t.dataset.color = c;
      if (pending && pending.sourceType === 'factory' && pending.sourceIndex === f && pending.color === c) t.classList.add('selected');
      fac.appendChild(t);
    }
    area.appendChild(fac);
  }

  const center = el('div', 'factory center');
  if (humanTurn) center.classList.add('selectable');
  if (state.markerInCenter) {
    const mk = el('div', 'tile first-token'); mk.innerHTML = starFace(); mk.title = 'Starting player marker';
    center.appendChild(mk);
  }
  if (state.center.length === 0 && !state.markerInCenter) center.appendChild(el('div', 'factory-empty', 'center'));
  else for (const c of state.center) {
    const t = tileEl(c);
    t.dataset.source = 'center'; t.dataset.sourceIndex = 0; t.dataset.color = c;
    if (pending && pending.sourceType === 'center' && pending.color === c) t.classList.add('selected');
    center.appendChild(t);
  }
  area.appendChild(center);
}

function renderOpponents() {
  const area = $('#opponents');
  area.innerHTML = '';
  state.players.slice(1).forEach((p, i) => {
    const idx = i + 1;
    const card = el('div', 'opp-card');
    if (idx === state.currentPlayer && !state.gameOver) card.classList.add('active');

    const head = el('div', 'opp-head');
    head.appendChild(el('div', 'opp-name', p.name));
    head.appendChild(el('div', 'opp-score', String(p.score)));
    card.appendChild(head);

    const wall = el('div', 'opp-wall');
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      const color = colorForWall(r, c);
      const cell = el('div', 'wcell');
      if (p.wall[r][c]) { cell.classList.add('filled'); cell.style.background = JEWEL[color]; }
      else { cell.style.background = 'rgba(255,255,255,0.04)'; }
      wall.appendChild(cell);
    }
    card.appendChild(wall);

    if (p.floor.length) {
      const fl = el('div', 'opp-floor');
      for (const e of p.floor) {
        const d = el('div', 'fdot');
        d.style.background = e === 'first' ? '#e8c659' : JEWEL[e];
        fl.appendChild(d);
      }
      card.appendChild(fl);
    }
    area.appendChild(card);
  });
}

function renderSelf() {
  const area = $('#selfBoard');
  area.innerHTML = '';
  const p = state.players[0];
  const lp = state.lastPlace; state.lastPlace = null;

  const head = el('div', 'board-head');
  const left = el('div');
  left.appendChild(el('div', 'who', 'Your Wall'));
  left.appendChild(el('div', 'round-tag', `Round ${state.round}`));
  head.appendChild(left);
  head.appendChild(el('div', 'score-big', String(p.score)));
  area.appendChild(head);

  const body = el('div', 'board-body');
  const humanTurn = state.players[state.currentPlayer].isHuman && state.phase === 'drafting' && !state.gameOver;
  const valid = pending && p.isHuman ? validLines(p, pending.color) : [];

  const linesWrap = el('div', 'pattern-lines');
  for (let i = 0; i < 5; i++) {
    const line = p.patternLines[i];
    const lineEl = el('div', 'pline');
    if (humanTurn && valid.includes(i)) { lineEl.classList.add('targetable'); lineEl.dataset.line = i; }
    for (let s = 0; s < line.capacity; s++) {
      const filled = s >= line.capacity - line.count;
      const slot = el('div', 'pslot');
      let t;
      if (filled) {
        t = tileEl(line.color, 'lg');
        if (lp && lp.player === 0 && lp.line === i && s === line.capacity - 1) t.classList.add('placed');
      } else if (line.color) t = tileEl(line.color, 'lg ghost');
      if (t) slot.appendChild(t);
      lineEl.appendChild(slot);
    }
    linesWrap.appendChild(lineEl);
  }
  body.appendChild(linesWrap);

  const wall = el('div', 'wall');
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const color = colorForWall(r, c);
    const filled = p.wall[r][c];
    const cell = el('div', 'wcell' + (filled ? ' filled' : ''));
    cell.appendChild(tileEl(color, 'lg' + (filled ? '' : ' ghost')));
    wall.appendChild(cell);
  }
  body.appendChild(wall);
  area.appendChild(body);

  const floor = el('div', 'floor');
  floor.appendChild(el('div', 'floor-label', 'Floor line'));
  for (let i = 0; i < 7; i++) {
    const slot = el('div', 'fslot');
    const pen = el('span', 'pen', String(FLOOR_PENALTIES[i]));
    slot.appendChild(pen);
    const entry = p.floor[i];
    if (entry === 'first') { const mk = el('div', 'tile first-token mini'); mk.innerHTML = starFace(); slot.appendChild(mk); }
    else if (entry) slot.appendChild(tileEl(entry, 'mini'));
    floor.appendChild(slot);
  }
  if (humanTurn && pending) { floor.dataset.floor = '1'; floor.classList.add('targetable'); }
  area.appendChild(floor);
}

function renderStatus() {
  const bar = $('#statusBar');
  if (!state) { bar.textContent = ''; return; }
  if (state.gameOver) {
    const winner = [...state.players].sort((a, b) => b.score - a.score)[0];
    bar.textContent = `${winner.name} wins with ${winner.score} points!`;
    return;
  }
  const me = state.players[state.currentPlayer];
  if (state.phase === 'wallTiling') { bar.textContent = 'Tiling the wall…'; return; }
  if (!me.isHuman) { bar.textContent = `${me.name} is choosing…`; return; }
  if (pending) {
    const lines = validLines(me, pending.color);
    bar.textContent = lines.length
      ? `Placing ${pending.count} ${colorWord(pending.color)} — choose a glowing line or the floor.`
      : `No valid line for ${colorWord(pending.color)} — tiles must go to the floor.`;
    return;
  }
  bar.textContent = `Round ${state.round} — your turn: choose tiles from a factory or the center.`;
}

// ---------------- Game over ----------------
function showGameOver() {
  Sound.win();
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const rows = sorted.map((p, i) =>
    `<div class="result-row ${p.isHuman ? 'you' : ''}"><span class="rank">${i + 1}.</span> <b>${p.name}</b> &nbsp; ${p.score} pts</div>`
  ).join('');
  $('#modalTitle').textContent = 'Game Over';
  $('#modalBody').innerHTML = `<p>${winner.name} ${winner.isHuman ? '— you win!' : 'wins'}</p>${rows}`;
  $('#modalOverlay').classList.remove('hidden');
}

// ---------------- Particles ----------------
function spawnParticles() {
  const wrap = $('#particles');
  for (let i = 0; i < 26; i++) {
    const m = el('div', 'mote');
    m.style.left = Math.random() * 100 + 'vw';
    m.style.animationDuration = 18 + Math.random() * 22 + 's';
    m.style.animationDelay = -Math.random() * 38 + 's';
    const s = 2 + Math.random() * 4;
    m.style.width = s + 'px'; m.style.height = s + 'px';
    wrap.appendChild(m);
  }
}

// ---------------- Event wiring ----------------
function openSetup() { $('#setupScreen').classList.remove('hidden'); }

document.addEventListener('click', (e) => {
  Sound.resume();
  if (!state) return;
  const sourceTile = e.target.closest('[data-source]');
  if (sourceTile) { selectDraft(sourceTile.dataset.source, parseInt(sourceTile.dataset.sourceIndex, 10), sourceTile.dataset.color); return; }
  const line = e.target.closest('[data-line]');
  if (line && pending) { resolveToLine(parseInt(line.dataset.line, 10)); return; }
  const floor = e.target.closest('[data-floor]');
  if (floor && pending) { resolveToFloor(); return; }
});

// setup choices
document.querySelectorAll('.setup-opt').forEach((b) => {
  b.addEventListener('click', () => {
    Sound.resume();
    $('#setupScreen').classList.add('hidden');
    newGame(parseInt(b.dataset.players, 10));
  });
});

$('#newGameBtn').addEventListener('click', () => { Sound.resume(); openSetup(); });

$('#modalClose').addEventListener('click', () => { $('#modalOverlay').classList.add('hidden'); openSetup(); });

$('#logToggle').addEventListener('click', () => {
  $('#logPanel').classList.toggle('closed');
});
$('#logClose').addEventListener('click', () => $('#logPanel').classList.add('closed'));

const soundBtn = $('#soundBtn');
function refreshSoundIcon() { soundBtn.innerHTML = Sound.enabled() ? ICONS.soundOn : ICONS.soundOff; }
soundBtn.addEventListener('click', () => { Sound.toggle(); refreshSoundIcon(); });

// ---------------- Watchdog (freeze guarantee) ----------------
// The async turn engine uses setTimeouts for pacing. If a timer is ever
// throttled, dropped (background tab), or a callback errors mid-flight, this
// watchdog force-recovers so the game can never get stuck. It is deliberately
// conservative: it only acts when a phase has clearly stalled.
function watchdog() {
  if (!state || state.gameOver) return;
  // (a) wall-tiling phase that has run too long -> force the round advance
  if (state.phase === 'wallTiling' && wallTilingAt && Date.now() - wallTilingAt > 3000) {
    console.warn('Watchdog: wall-tiling stalled, forcing advance.');
    wallTilingAt = 0;
    doWallTiling();
    return;
  }
  // (b) AI turn with no move scheduled -> reschedule
  if (state.phase === 'drafting' && !aiTimerId) {
    const me = state.players[state.currentPlayer];
    if (me && !me.isHuman) {
      console.warn('Watchdog: AI turn had no scheduled move, rescheduling.');
      scheduleAI();
    }
  }
}

// init
$('#logToggle').innerHTML = ICONS.log;
refreshSoundIcon();
spawnParticles();
watchdogId = setInterval(watchdog, 1500);
openSetup();
