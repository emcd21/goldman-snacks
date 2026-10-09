// Goldman Snacks app: the 3D character. An adult figure: a sculpted head (sculpt.js, meshed in a worker by
// sculptw.js) on a tailored body built from lofted sections, dressed from a spec that app.js makes (charSpec).
// live() shows him animated (breathing, blinking, looking around, waving; drag to turn him round);
// shot() renders a still for the wardrobe tiles and the top bar.
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { sculptHead } from './sculpt.js';
import { EffectComposer } from './vendor/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from './vendor/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from './vendor/jsm/postprocessing/OutputPass.js';

const TAU = Math.PI * 2;
const HEAD_Y = 3.12, HEAD_Z = .02;
// Outfits. kind: shirt, suit, qzip, tee or gilet.
const OUT = {
  white: { kind: 'shirt', shirt: '#F7F9FB', open: true, rolled: true, trousers: '#C9B897', shoes: '#6B4A2E', pocket: true },
  qzip: { kind: 'qzip', body: '#5E6E80', trousers: '#34476A', shoes: '#F2F2F2', sneakers: true },
  shirttie: { kind: 'shirt', shirt: '#BFD8F0', tie: true, trousers: '#3A404B', pocket: true },
  blazer: { kind: 'suit', body: '#22406E', shirt: '#F7F9FB', open: true, trousers: '#C9B897', shoes: '#6B4A2E' },
  grey: { kind: 'suit', body: '#7C858F', shirt: '#F7F9FB', tie: true },
  gilet: { kind: 'gilet', shirt: '#BFD8F0', vest: '#1E2C44', open: true, trousers: '#C9B897', shoes: '#F2F2F2', sneakers: true },
  navy: { kind: 'suit', body: '#1C2C4C', shirt: '#F7F9FB', tie: true },
  three: { kind: 'suit', body: '#3A3F48', shirt: '#F7F9FB', tie: true, waistcoat: true, square: '#F4F6F8' },
  boss: { kind: 'suit', body: '#16181D', shirt: '#F7F9FB', tie: true, pinstripe: true, square: '#E2B33E', shine: true },
  burry: { kind: 'tee', body: '#2A2D33', trousers: '#A99A72', shoes: '#E8E8E8', sneakers: true, shorts: true },
  bateman: { kind: 'suit', body: '#6E685E', shirt: '#F7F9FB', tie: true, pat: true, square: '#F4F6F8' },
  wolf: { kind: 'suit', body: '#252B39', shirt: '#F7F9FB', tie: true },
  gekko: { kind: 'shirt', shirt: '#D3E3F4', stripes: true, collar: '#FFFFFF', tie: true, pat: true, braces: true, trousers: '#2B2F38' },
  buffett: { kind: 'suit', body: '#5F656E', shirt: '#F7F9FB', tie: true, pat: true },
};

let ENV = null, SHOT = null;
export function ok() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}
function renderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0; r.outputColorSpace = THREE.SRGBColorSpace;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.setClearColor(0x000000, 0);
  return r;
}
function envFor(r) {
  if (!ENV) { const pm = new THREE.PMREMGenerator(r); ENV = pm.fromScene(new RoomEnvironment(), 0.04).texture; }
  return ENV;
}

/* ---------- materials ---------- */
const IRIS = {};
function irisTex(c) {
  if (IRIS[c]) return IRIS[c];
  const t = canvasTex(128, 128, (g) => {
    const base = new THREE.Color(c), hsl = {}; base.getHSL(hsl);
    const hx = (l, a = 1) => { const k = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 1.1), Math.max(0, Math.min(1, l))); return `rgba(${k.r * 255 | 0},${k.g * 255 | 0},${k.b * 255 | 0},${a})`; };
    const r0 = g.createRadialGradient(64, 64, 10, 64, 64, 64); r0.addColorStop(0, hx(hsl.l * .55)); r0.addColorStop(.35, hx(hsl.l * 1.05)); r0.addColorStop(.8, hx(hsl.l)); r0.addColorStop(.93, hx(hsl.l * .45)); r0.addColorStop(1, hx(hsl.l * .25));
    g.fillStyle = r0; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 180; i++) { const a = Math.random() * TAU, r1 = 16 + Math.random() * 10, r2 = 40 + Math.random() * 20; g.strokeStyle = Math.random() < .5 ? hx(hsl.l * 1.6, .35) : hx(hsl.l * .5, .35); g.lineWidth = .6 + Math.random(); g.beginPath(); g.moveTo(64 + Math.cos(a) * r1, 64 + Math.sin(a) * r1); g.lineTo(64 + Math.cos(a + .05) * r2, 64 + Math.sin(a + .05) * r2); g.stroke(); }
    g.fillStyle = '#0A0706'; g.beginPath(); g.arc(64, 64, 22, 0, TAU); g.fill();
  });
  t.userData.keep = true; return IRIS[c] = t;
}
const col = c => new THREE.Color(c);
const shade = (hex, f) => { const c = col(hex); const h = { h: 0, s: 0, l: 0 }; c.getHSL(h); c.setHSL(h.h, h.s, Math.max(0, Math.min(1, h.l + f))); return '#' + c.getHexString(); };
// a fine twill weave as a normal map, shared by all the cloth
let WEAVE = null;
function weave() {
  if (WEAVE) return WEAVE;
  const n = 64, c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'), img = g.createImageData(n, n);
  const hgt = (x, y) => .5 + .5 * Math.sin((x + y) / n * TAU * 8) * (.75 + .25 * Math.sin(x / n * TAU * 16)) + .15 * Math.sin(y / n * TAU * 32);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const dx = hgt(x + 1, y) - hgt(x - 1, y), dy = hgt(x, y + 1) - hgt(x, y - 1), l = Math.hypot(dx, dy, 1), i = (y * n + x) * 4; img.data[i] = 128 - dx / l * 127; img.data[i + 1] = 128 - dy / l * 127; img.data[i + 2] = 255 / l * .5 + 127; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0);
  WEAVE = new THREE.CanvasTexture(c); WEAVE.wrapS = WEAVE.wrapT = THREE.RepeatWrapping; WEAVE.anisotropy = 4;
  return WEAVE;
}
const cloth = (c, map, rep = 26) => { const w = weave().clone(); w.repeat.set(rep, rep); w.needsUpdate = true; return new THREE.MeshPhysicalMaterial({ color: map ? 0xffffff : c, map: map || null, normalMap: w, normalScale: new THREE.Vector2(.45, .45), roughness: 0.8, metalness: 0, sheen: .6, sheenRoughness: .65, sheenColor: col(map ? '#8a8a8a' : shade(c, .22)) }); };
const plastic = (c, rough = 0.35) => new THREE.MeshPhysicalMaterial({ color: c, roughness: rough, clearcoat: 0.4, clearcoatRoughness: 0.3 });
const metal = (c, rough = 0.28) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: .85 });
const flat = (c, opacity = 1) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, polygonOffset: true, polygonOffsetFactor: -2 });
const GOLD = '#E2B33E';

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); }
  return t;
}
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };

/* ---------- lofted shapes: rows of superellipse sections ---------- */
// secs: [y, w, d, zc?, xc?]. u runs round the body with the front at 0.5; v runs bottom to top.
function loft(secs, { seg = 64, e = 2.4, top = true, bottom = true, axis = 'y' } = {}) {
  const pos = [], uv = [], idx = [], y0 = secs[0][0], y1 = secs[secs.length - 1][0];
  secs.forEach(([y, w, d, zc = 0, xc = 0]) => {
    for (let s = 0; s <= seg; s++) {
      const t = -Math.PI + s / seg * TAU, sn = Math.sin(t), cs = Math.cos(t);
      const x = xc + w * Math.sign(sn) * Math.abs(sn) ** (2 / e), z = zc + d * Math.sign(cs) * Math.abs(cs) ** (2 / e);
      pos.push(x, y, z); uv.push(s / seg, (y - y0) / (y1 - y0 || 1));
    }
  });
  const row = seg + 1;
  for (let r = 0; r < secs.length - 1; r++) for (let s = 0; s < seg; s++) { const a = r * row + s, b = a + 1, c = a + row, d = c + 1; idx.push(a, b, c, b, d, c); }
  const cap = (r, upward) => { const [y, , , zc = 0, xc = 0] = secs[r], ci = pos.length / 3; pos.push(xc, y, zc); uv.push(.5, upward ? 1 : 0); for (let s = 0; s < seg; s++) { const a = r * row + s; if (upward) idx.push(ci, a, a + 1); else idx.push(ci, a + 1, a); } };
  if (bottom) cap(0, false); if (top) cap(secs.length - 1, true);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  if (axis === '-y') g.rotateX(Math.PI);
  g.computeVertexNormals();
  return g;
}
const lerpSecs = (secs, y) => { for (let i = 1; i < secs.length; i++) if (y <= secs[i][0]) { const a = secs[i - 1], b = secs[i], k = (y - a[0]) / (b[0] - a[0]); return a.map((v, j) => v + ((b[j] || 0) - (v || 0)) * k); } return secs[secs.length - 1]; };

// Jacket and shirt bodies, hem to neck: [y, half width, half depth, z centre]
const JACKET = [[1.42, .37, .225, 0], [1.6, .35, .215, 0], [1.85, .335, .21, 0], [2.1, .365, .225, .01], [2.35, .405, .245, .02], [2.52, .435, .24, .01], [2.65, .46, .205, 0], [2.75, .41, .17, -.01], [2.82, .26, .14, -.02], [2.865, .13, .11, -.03]];
const SHIRT = [[1.52, .335, .205, 0], [1.85, .325, .2, 0], [2.1, .35, .215, .01], [2.35, .385, .235, .02], [2.52, .415, .23, .01], [2.65, .44, .2, 0], [2.75, .395, .165, -.01], [2.82, .25, .135, -.02], [2.865, .125, .105, -.03]];
let BODY = JACKET;
const frontZ = y => { const s = lerpSecs(BODY, y); return s[3] + s[2]; };

// The clothes are painted on a texture laid round the torso; positions here are in the painter's own units
// (y from 0.6 at the hem to 1.52 at the neck, x across the chest), scaled onto whichever torso he wears.
const Y0 = 0.6, Y1 = 1.52;
function paintTorso(spec, O) {
  const W = 1024, H = 512;
  const X = xw => 512 + xw * 718, Y = yw => (Y1 - yw) / (Y1 - Y0) * H, S = w => w * 718;
  return canvasTex(W, H, (g) => {
    const poly = (pts, fill) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))); g.closePath(); g.fillStyle = fill; g.fill(); };
    const line = (pts, stroke, w) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))); g.strokeStyle = stroke; g.lineWidth = w; g.lineCap = 'round'; g.stroke(); };
    const dot = (x, y, r, fill) => { g.beginPath(); g.arc(X(x), Y(y), r, 0, TAU); g.fillStyle = fill; g.fill(); };
    const base = O.kind === 'shirt' || O.kind === 'gilet' ? O.shirt : O.body;
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    // soft fabric shading: a little darker at the waist
    const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, 'rgba(255,255,255,.06)'); grd.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
    if (O.stripes) { g.fillStyle = 'rgba(62,111,176,.38)'; for (let x = 0; x < W; x += 9) g.fillRect(x, 0, 2.2, H); }
    if (O.pinstripe) { g.fillStyle = 'rgba(255,255,255,.16)'; for (let x = 0; x < W; x += 14) g.fillRect(x, 0, 1.4, H); }
    if (O.kind === 'shirt') {
      line([[0, 1.46], [0, Y0]], shade(O.shirt, -.1), 2.5);
      [1.32, 1.18, 1.04, .9, .76].forEach(y => dot(0.012, y, 4, shade(O.shirt, -.16)));
      if (O.open) poly([[-.075, 1.53], [.075, 1.53], [0, 1.37]], spec.skin);
      if (O.pocket) { g.strokeStyle = shade(O.shirt, -.12); g.lineWidth = 2.5; g.strokeRect(X(.12), Y(1.22), S(.13), Y(1.08) - Y(1.22)); }
      if (O.braces) [[-1, 1], [1, 1]].forEach(([s]) => { line([[s * .17, 1.53], [s * .15, Y0]], '#B3262E', S(.05)); g.fillStyle = GOLD; g.fillRect(X(s * .15) - S(.03), Y(1.0), S(.06), 14); });
      if (O.braces) { g.strokeStyle = '#B3262E'; g.lineWidth = S(.05); g.beginPath(); g.moveTo(40, 0); g.lineTo(-40, H); g.moveTo(W - 40, 0); g.lineTo(W + 40, H); g.stroke(); }
      g.fillStyle = '#2A2420'; g.fillRect(0, Y(.66), W, Y(.6) - Y(.66)); g.fillStyle = GOLD; g.fillRect(X(-.04), Y(.665), S(.08), Y(.6) - Y(.665));
    } else if (O.kind === 'gilet') {
      line([[0, 1.46], [0, Y0]], shade(O.shirt, -.1), 2.5);
      const v = O.vest; g.fillStyle = v; g.fillRect(0, Y(1.44), W, H);
      // fleece speckle
      for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .07})`; g.fillRect(Math.random() * W, Y(1.44) + Math.random() * (H - Y(1.44)), 2, 2); }
      [-1, 1].forEach(s => { g.beginPath(); g.ellipse(X(s * .43), Y(1.33), S(.11), Y(1.18) - Y(1.33) + 30, 0, 0, TAU); g.fillStyle = O.shirt; g.fill(); });
      poly([[-.11, 1.45], [.11, 1.45], [0, 1.25]], O.shirt); poly([[-.07, 1.53], [.07, 1.53], [0, 1.4]], spec.skin);
      line([[0, 1.25], [0, Y0]], '#9AA9BC', 4); line([[-.11, 1.45], [0, 1.25], [.11, 1.45]], shade(v, .15), 7);
      g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(X(.16), Y(1.24), S(.07), 12);
    } else if (O.kind === 'qzip') {
      g.fillStyle = shade(O.body, -.06); g.fillRect(0, Y(.68), W, Y(.6) - Y(.68));
      for (let x = 0; x < W; x += 8) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x, Y(.68), 3, Y(.6) - Y(.68)); }
      line([[0, 1.53], [0, 1.24]], '#C9D3DD', 4); g.fillStyle = '#E3E9EF'; g.fillRect(X(0) - 6, Y(1.36), 12, 26);
    } else if (O.kind === 'tee') {
      g.fillStyle = shade(O.body, .1); g.fillRect(0, Y(1.53), W, Y(1.47) - Y(1.53));
      const cx = X(0), cy = Y(1.18), r = S(.085);
      g.fillStyle = '#ECECEC'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); g.fillRect(cx - r * .62, cy + r * .4, r * 1.24, r * .8);
      g.fillStyle = O.body; [[-.38, 0], [.38, 0]].forEach(([dx]) => { g.beginPath(); g.arc(cx + dx * r, cy, r * .27, 0, TAU); g.fill(); });
      g.beginPath(); g.moveTo(cx, cy + r * .2); g.lineTo(cx - r * .12, cy + r * .45); g.lineTo(cx + r * .12, cy + r * .45); g.fill();
      for (const dx of [-.3, 0, .3]) g.fillRect(cx + dx * r - 1.5, cy + r * .82, 3, r * .38);
      g.strokeStyle = '#C8343B'; g.lineWidth = 5; g.lineJoin = 'round';
      [-1, 1].forEach(s => { g.beginPath(); g.moveTo(cx + s * r * 1.5, cy - r * .9); g.lineTo(cx + s * r * 1.2, cy - r * .1); g.lineTo(cx + s * r * 1.55, cy); g.lineTo(cx + s * r * 1.25, cy + r * .9); g.stroke(); });
      g.fillStyle = '#C8343B'; g.font = `800 ${Math.round(r * .62)}px sans-serif`; g.textAlign = 'center'; g.fillText('M E T A L', cx, cy + r * 1.95);
    } else { // suit
      const sh = O.shirt, lap = shade(O.body, -.07);
      if (O.waistcoat) { poly([[-.16, 1.5], [.16, 1.5], [0, .98]], shade(O.body, .07)); [1.08, 1.0].forEach(y => dot(0, y, 4, shade(O.body, -.12))); poly([[-.09, 1.5], [.09, 1.5], [0, 1.2]], sh); }
      else poly([[-.15, 1.5], [.15, 1.5], [0, 1.0]], sh);
      if (!O.tie) poly([[-.07, 1.53], [.07, 1.53], [0, 1.38]], spec.skin);
      [-1, 1].forEach(s => {
        poly([[s * .15, 1.5], [0, 1.0], [s * .06, 1.12], [s * .21, 1.29], [s * .17, 1.33], [s * .2, 1.43]], lap);
        line([[s * .15, 1.5], [0, 1.0]], shade(O.body, -.16), 2.4);
        line([[s * .2, .82], [s * .32, .82]], shade(O.body, -.14), 3);
      });
      line([[0, 1.0], [0, .7], [.05, Y0]], shade(O.body, -.16), 2.4);
      [.9, .78].forEach(y => dot(.01, y, 5, shade(O.body, -.18)));
      line([[.15, 1.2], [.28, 1.2]], shade(O.body, -.14), 3);
      if (O.square) { g.fillStyle = O.square; g.beginPath(); g.moveTo(X(.16), Y(1.2)); [[.18, 1.25], [.2, 1.215], [.22, 1.255], [.24, 1.21], [.26, 1.2]].forEach(([x, y]) => g.lineTo(X(x), Y(y))); g.fill(); }
      if (spec.on.pin) dot(.12, 1.31, 7, GOLD);
    }
    if (spec.on.pen) { const px = O.kind === 'suit' ? .2 : .17, py = O.kind === 'suit' ? 1.2 : 1.22; g.fillStyle = '#1C2C4C'; g.fillRect(X(px) - 4, Y(py + .06), 8, Y(py - .02) - Y(py + .06)); g.fillStyle = GOLD; g.fillRect(X(px) - 4, Y(py + .06), 8, 8); }
    if (spec.on.lanyard) {
      line([[-.12, 1.5], [-.035, 1.12]], '#1A96E4', 7); line([[.12, 1.5], [.035, 1.12]], '#1A96E4', 7);
      g.fillStyle = '#fff'; g.fillRect(X(-.06), Y(1.13), S(.12), Y(.95) - Y(1.13)); g.fillStyle = '#1A96E4'; g.fillRect(X(-.06), Y(1.13), S(.12), 14);
      g.fillStyle = '#D6E3EC'; g.beginPath(); g.arc(X(0), Y(1.05), 10, 0, TAU); g.fill();
    }
  });
}


/* ---------- the head: sculpted in a worker, cached by look ---------- */
const HEADS = new Map();
let WORKER = null, WID = 0; const WAIT = new Map();
function worker() {
  if (WORKER === null) { try { WORKER = new Worker(new URL('./sculptw.js', import.meta.url), { type: 'module' }); WORKER.onmessage = e => { const w = WAIT.get(e.data.id); WAIT.delete(e.data.id); if (w) w(e.data); }; WORKER.onerror = () => { WORKER = false; }; } catch (e) { WORKER = false; } }
  return WORKER;
}
const headKey = (spec, step) => step + JSON.stringify([spec.skin, spec.hair, spec.hairCol, spec.face, spec.mouth, spec.nose, spec.brows, spec.beard, spec.marks]);
function headGeo(spec, step) {
  const k = headKey(spec, step);
  if (!HEADS.has(k)) {
    const make = r => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(r.pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(r.nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(r.colr, 3)); const all = new Uint32Array(r.skin.length + r.hair.length); all.set(r.skin); all.set(r.hair, r.skin.length); g.setIndex(new THREE.BufferAttribute(all, 1)); g.addGroup(0, r.skin.length, 0); g.addGroup(r.skin.length, r.hair.length, 1); g.userData.keep = true; return g; };
    const w = worker();
    const p = w ? new Promise(res => { const id = ++WID; WAIT.set(id, res); w.postMessage({ id, spec, step }); setTimeout(() => { if (WAIT.has(id)) { WAIT.delete(id); res(null); } }, 20000); }).then(r => r || inline())
      : Promise.resolve(inline());
    function inline() { const r = sculptHead(spec, step); return { pos: r.pos, nor: r.nor, colr: r.colr, skin: new Uint32Array(r.skinIdx), hair: new Uint32Array(r.hairIdx) }; }
    HEADS.set(k, p.then(make));
    if (HEADS.size > 24) HEADS.delete(HEADS.keys().next().value);
  }
  return HEADS.get(k);
}

/* ---------- the character ---------- */
function build(spec, step) {
  const O = OUT[spec.outfit] || OUT.white;
  const root = new THREE.Group(), parts = {};
  const skinM = new THREE.MeshPhysicalMaterial({ color: spec.skin, roughness: 0.5, sheen: 0.35, sheenColor: col('#ffb4a0'), sheenRoughness: 0.6 });
  const tucked = O.kind === 'shirt' || O.kind === 'gilet';
  BODY = tucked || O.kind === 'tee' ? SHIRT.map((s, i) => i === 0 && O.kind === 'tee' ? [1.44, s[1] + .01, s[2] + .01, s[3]] : s) : JACKET;
  const sleeveC = O.kind === 'suit' || O.kind === 'qzip' || O.kind === 'tee' ? O.body : O.shirt;
  const trouserC = O.trousers || O.body, shoeC = O.shoes || '#16110F';
  const body = new THREE.Group(); root.add(body); parts.body = body;

  // hips, legs and shoes
  const trM = cloth(trouserC);
  body.add(mesh(loft([[1.36, .24, .15], [1.45, .32, .195], [1.62, .325, .195]], { e: 2.2 }), trM));
  const legs = [[-1, -.17, -.215], [1, .165, .175]];
  for (const [s, x0, x1] of legs) {
    const L = (y, r) => { const k = (1.42 - y) / 1.3; return [y, r, r * 1.04, 0, x0 + (x1 - x0) * k]; };
    if (O.shorts) {
      body.add(mesh(loft([L(.9, .14), L(1.15, .15), L(1.42, .158)], { bottom: true }), trM));
      body.add(mesh(loft([L(.14, .064), L(.45, .07), L(.7, .082), L(.95, .09)]), skinM));
      body.add(mesh(loft([L(.12, .07), L(.22, .072)]), cloth('#F4F4F4')));
    } else body.add(mesh(loft([L(.12, .108), L(.45, .114), L(.8, .126), L(1.1, .148), L(1.42, .168)]), trM));
    // shoe: a long rounded last with a sole
    const sx = x1 + s * .005;
    const up = mesh(new THREE.CapsuleGeometry(.082, .2, 8, 20), plastic(shoeC, O.sneakers ? .65 : .18)); up.rotation.x = Math.PI / 2; up.scale.set(1.05, 1, .72); up.position.set(sx, .078, .07); body.add(up);
    const sole = mesh(new THREE.CapsuleGeometry(.086, .21, 6, 20), plastic(O.sneakers ? '#FAFAFA' : '#2A1E17', .6)); sole.rotation.x = Math.PI / 2; sole.scale.set(1.08, 1, .26); sole.position.set(sx, .025, .07); body.add(sole);
  }
  // torso
  const torso = mesh(loft(BODY, { e: 2.5 }), cloth(null, paintTorso(spec, O), 60)); body.add(torso); parts.torso = torso;
  if (tucked) { body.add(mesh(loft([[1.5, .338, .208], [1.57, .338, .208]], { top: false, bottom: false }), plastic('#2A2420', .45))); body.add(mesh(new THREE.BoxGeometry(.07, .055, .02), metal(GOLD), 0, 1.535, frontZ(1.53) + .004)); }
  // collar, tie
  if (O.kind === 'qzip') { const c = mesh(loft([[2.8, .13, .12, -.025], [2.97, .118, .108, -.025]], { top: false, bottom: false, e: 2 }), cloth(shade(O.body, -.04))); c.material.side = THREE.DoubleSide; body.add(c); body.add(mesh(new THREE.BoxGeometry(.012, .16, .01), metal('#C9D3DD'), 0, 2.88, .1)); }
  if (O.kind === 'tee') { const r = mesh(new THREE.TorusGeometry(.105, .014, 10, 36), cloth(shade(O.body, .08)), 0, 2.85, -.02); r.rotation.x = Math.PI / 2 - .25; r.scale.set(1, 1.05, 1); body.add(r); }
  if (O.kind === 'shirt' || O.kind === 'suit' || O.kind === 'gilet') {
    const cm = cloth(O.collar || O.shirt);
    const band = mesh(loft([[2.83, .104, .1, -.03], [2.92, .1, .094, -.03]], { top: false, bottom: false, e: 2 }), cm); band.material.side = THREE.DoubleSide; body.add(band);
    for (const s of [-1, 1]) {
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(s * .13, .03); sh.lineTo(s * .085, -.11); sh.closePath();
      const c = mesh(new THREE.ExtrudeGeometry(sh, { depth: .01, bevelEnabled: true, bevelThickness: .006, bevelSize: .006, bevelSegments: 2 }), cm, s * .012, 2.88, .085);
      c.rotation.set(-.62, s * .5, 0); body.add(c);
    }
  }
  if (O.tie) {
    const tc = spec.tie, sh = new THREE.Shape();
    const TP = [[-.04, 0], [.04, 0], [.03, -.075], [.07, -.62], [0, -.7], [-.07, -.62], [-.03, -.075]];
    // sample the long edges so the tie can bend over the chest
    TP.forEach(([x, y], i) => { if (!i) return sh.moveTo(x, y); const [px, py] = TP[i - 1], n = Math.max(1, Math.round(Math.abs(y - py) / .04)); for (let k = 1; k <= n; k++) sh.lineTo(px + (x - px) * k / n, py + (y - py) * k / n); });
    { const [px, py] = TP[TP.length - 1], n = 2; for (let k = 1; k <= n; k++) sh.lineTo(px + (TP[0][0] - px) * k / n, py + (TP[0][1] - py) * k / n); }
    const tm = new THREE.MeshPhysicalMaterial({ color: O.pat ? 0xffffff : tc, map: O.pat ? canvasTex(32, 32, (g) => { g.fillStyle = tc; g.fillRect(0, 0, 32, 32); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(16, 16, 4, 0, TAU); g.fill(); }, 1) : null, roughness: O.shine ? 0.3 : 0.45, sheen: 0.7, sheenColor: col(O.shine ? '#FFF1B8' : '#ffffff'), clearcoat: O.shine ? .7 : .15 });
    if (tm.map) tm.map.repeat.set(36, 36);
    const tg = new THREE.ExtrudeGeometry(sh, { depth: .012, bevelEnabled: true, bevelThickness: .008, bevelSize: .006, bevelSegments: 2 });
    const top = 2.83, p = tg.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = top + p.getY(i); p.setZ(i, p.getZ(i) + frontZ(Math.min(2.8, y)) + .012); }
    tg.computeVertexNormals();
    const tie = mesh(tg, tm, 0, top, 0); body.add(tie);
  }
  // arms: shoulder group, upper sleeve, elbow group, forearm, hand (an open hand and a fist)
  const arm = (s) => {
    const sh = new THREE.Group(); sh.position.set(s * .43, 2.64, -.01);
    const bare = O.kind === 'tee', rolled = O.rolled;
    const slM = cloth(sleeveC);
    sh.add(mesh(new THREE.SphereGeometry(bare ? .1 : .11, 24, 16), slM));
    sh.add(mesh(loft(bare ? [[-.3, .092, .09], [0, .105, .1]] : [[-.56, .085, .083], [-.28, .097, .094], [0, .108, .104]], { e: 2, top: false }), slM));
    if (bare) sh.add(mesh(loft([[-.58, .064, .062], [-.28, .074, .072]], { e: 2 }), skinM));
    const el = new THREE.Group(); el.position.y = -.54; sh.add(el);
    el.add(mesh(new THREE.SphereGeometry(bare || rolled ? .066 : .078, 20, 14), bare || rolled ? skinM : slM));
    const fa = bare || rolled ? skinM : slM;
    el.add(mesh(loft([[-.45, .062, .06], [-.2, .074, .071], [0, .08, .078]], { e: 2 }), fa));
    if (rolled) el.add(mesh(loft([[-.03, .085, .083], [.06, .088, .086]], { e: 2 }), cloth(O.shirt)));
    if (O.kind === 'suit') el.add(mesh(loft([[-.48, .062, .06], [-.42, .066, .064]], { e: 2 }), cloth(O.shirt)));
    const hand = new THREE.Group(); hand.position.y = -.5; el.add(hand);
    const palm = mesh(new THREE.SphereGeometry(1, 20, 14), skinM, 0, -.03, 0); palm.scale.set(.038, .062, .05); hand.add(palm);
    const open = new THREE.Group(), fist = new THREE.Group(); hand.add(open, fist);
    for (let f = 0; f < 4; f++) { const fg = mesh(new THREE.CapsuleGeometry(.0105, .05 + (f === 1 || f === 2 ? .012 : 0), 4, 8), skinM, 0, -.1 - (f === 1 || f === 2 ? .006 : 0), -.027 + f * .018); fg.rotation.x = (f - 1.5) * .06; open.add(fg); }
    const th = mesh(new THREE.CapsuleGeometry(.012, .04, 4, 8), skinM, -s * .0, -.045, .045); th.rotation.x = .7; open.add(th);
    const fb = mesh(new THREE.SphereGeometry(1, 20, 14), skinM, s * -.004, -.085, 0); fb.scale.set(.042, .044, .056); fist.add(fb);
    const th2 = mesh(new THREE.CapsuleGeometry(.012, .03, 4, 8), skinM, s * -.03, -.06, .03); th2.rotation.z = s * .5; fist.add(th2);
    open.visible = false;
    body.add(sh);
    return { sh, el, hand, open, fist, side: s };
  };
  parts.waveArm = arm(-1); parts.holdArm = arm(1);

  // head: eyes now, the sculpted head when the worker has it
  const head = new THREE.Group(); head.position.set(0, HEAD_Y, HEAD_Z); parts.head = head; body.add(head);
  const hairM = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: spec.hair === 'slick' ? .38 : spec.hair === 'buzz' ? .85 : .6, sheen: .45, sheenRoughness: .4, sheenColor: col(shade(spec.hairCol, .1)), clearcoat: spec.hair === 'slick' ? .25 : 0, clearcoatRoughness: .4, envMapIntensity: .6 });
  const faceM = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .5, sheen: .35, sheenColor: col('#ffb4a0'), sheenRoughness: .6 });
  parts.ready = headGeo(spec, step).then(g => { const m = new THREE.Mesh(g, [faceM, hairM]); m.castShadow = true; m.receiveShadow = false; head.add(m); return root; });
  const eyeC = spec.eyes === 'dot' || spec.eyes === 'lash' || spec.eyes === 'sleepy' ? '#3B2A20' : spec.eyeCol;
  const lidOpen = { round: -.38, wide: -.6, almond: -.22, sleepy: -.02, lash: -.36 }[spec.eyes] ?? -.28;
  parts.eyes = []; parts.lids = [];
  for (const s of [-1, 1]) {
    const eg = new THREE.Group(); eg.position.set(s * .071, .004, .194); head.add(eg);
    const ball = new THREE.Group(); eg.add(ball);
    ball.add(mesh(new THREE.SphereGeometry(.033, 24, 18), new THREE.MeshPhysicalMaterial({ color: '#EAE3DA', roughness: .15, clearcoat: 1, clearcoatRoughness: .05 })));
    // the iris: a painted texture with radial fibres, a darker limbal ring and the pupil, under a glossy cornea
    const ir = mesh(new THREE.CircleGeometry(.0158, 40), new THREE.MeshPhysicalMaterial({ map: irisTex(eyeC), roughness: .4 }), 0, 0, .0318); ball.add(ir);
    const cornea = mesh(new THREE.SphereGeometry(.0185, 24, 10, 0, TAU, 0, .75), new THREE.MeshPhysicalMaterial({ color: '#000000', transparent: true, opacity: .3, roughness: 0, clearcoat: 1, clearcoatRoughness: 0, depthWrite: false, envMapIntensity: .7 }), 0, 0, .021); cornea.rotation.x = Math.PI / 2; ball.add(cornea);
    ball.add(mesh(new THREE.CircleGeometry(.0022, 12), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .9 }), .0052, .0062, .0352));
    parts.eyes.push(ball);
    const lidM = new THREE.MeshPhysicalMaterial({ color: shade(spec.skin, -.03), roughness: .5, sheen: .3, sheenColor: col('#ffb4a0') });
    const lid = mesh(new THREE.SphereGeometry(.0355, 24, 12, 0, TAU, 0, Math.PI / 2), lidM); lid.rotation.x = lidOpen; eg.add(lid);
    const rim = mesh(new THREE.TorusGeometry(.0355, spec.eyes === 'lash' ? .0035 : .0022, 6, 32), new THREE.MeshBasicMaterial({ color: '#1C1410' })); rim.rotation.x = Math.PI / 2; lid.add(rim);
    const low = mesh(new THREE.SphereGeometry(.0352, 24, 8, 0, TAU, Math.PI * .5, Math.PI * .5), lidM); low.rotation.x = spec.eyes === 'almond' ? .45 : .7; eg.add(low);
    parts.lids.push({ lid, open: lidOpen });
  }
  // glasses
  if (spec.glasses && spec.glasses !== 'none') {
    const gc = { round: '#2A2A2A', square: '#1C2C4C', big: '#141414' }[spec.glasses], gm = plastic(gc, .25);
    const lens = new THREE.MeshPhysicalMaterial({ color: '#dff0ff', transparent: true, opacity: .14, roughness: .05, depthWrite: false });
    const rr = (w, h, r) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; };
    for (const s of [-1, 1]) {
      const f = new THREE.Group(); f.position.set(s * .074, .004, .262); f.rotation.y = s * .12;
      if (spec.glasses === 'round') { f.add(mesh(new THREE.TorusGeometry(.046, .0045, 8, 36), gm)); f.add(mesh(new THREE.CircleGeometry(.046, 28), lens)); }
      else { const big = spec.glasses === 'big', w = big ? .112 : .1, h = big ? .088 : .066, t = big ? .011 : .007; const o = rr(w, h, big ? .022 : .016); o.holes.push(rr(w - 2 * t, h - 2 * t, big ? .015 : .011)); const fr = mesh(new THREE.ExtrudeGeometry(o, { depth: .006, bevelEnabled: true, bevelThickness: .002, bevelSize: .0015, bevelSegments: 2 }), gm); fr.position.z = -.003; f.add(fr); f.add(mesh(new THREE.ShapeGeometry(rr(w - 2 * t, h - 2 * t, .011)), lens)); }
      const tm = mesh(new THREE.BoxGeometry(.006, .006, .25), gm, s * (spec.glasses === 'big' ? .056 : .05), .012, -.125); tm.rotation.y = -s * .2; f.add(tm);
      head.add(f);
    }
    const br = mesh(new THREE.CapsuleGeometry(.004, .03, 4, 8), gm, 0, .014, .272); br.rotation.z = Math.PI / 2; head.add(br);
  }
  // held item
  parts.item = buildItem(spec.hold);
  if (parts.item) body.add(parts.item);
  parts.pose = spec.hold ? (spec.hold === 'case' ? 'down' : spec.hold === 'laptop' ? 'tuck' : 'up') : 'rest';
  root.traverse(o => { if (o.isMesh && !(o.material && o.material.transparent)) { o.castShadow = true; o.receiveShadow = !head.children.includes(o) && o.parent !== head; } });
  root.userData = parts;
  return root;
}

function buildItem(h) {
  if (!h) return null;
  const g = new THREE.Group();
  if (h === 'mug') {
    const m = plastic('#FFFFFF', .25); g.add(mesh(new THREE.CylinderGeometry(.085, .08, .19, 32), m, 0, .07, 0));
    g.add(mesh(new THREE.CylinderGeometry(.087, .087, .06, 32), plastic('#1A96E4', .3), 0, .09, 0));
    const hd = mesh(new THREE.TorusGeometry(.05, .016, 10, 24), m, .09, .08, 0); g.add(hd);
    g.add(mesh(new THREE.CylinderGeometry(.075, .075, .005, 32), flat('#4A2C1A'), 0, .16, 0));
  } else if (h === 'calc') {
    const face = canvasTex(128, 192, (c) => { c.fillStyle = '#2E3A48'; c.fillRect(0, 0, 128, 192); c.fillStyle = '#B9E5A0'; c.fillRect(14, 14, 100, 38); c.fillStyle = '#2E3A48'; c.font = 'bold 26px monospace'; c.textAlign = 'right'; c.fillText('1,250', 108, 44); for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { c.fillStyle = r === 3 && k === 3 ? '#F28C28' : '#E2E8EE'; c.beginPath(); c.roundRect(14 + k * 26, 66 + r * 30, 20, 22, 5); c.fill(); } });
    const b = mesh(new THREE.BoxGeometry(.17, .25, .035), [plastic('#2E3A48'), plastic('#2E3A48'), plastic('#2E3A48'), plastic('#2E3A48'), new THREE.MeshStandardMaterial({ map: face, roughness: .4 }), plastic('#2E3A48')], 0, .13, 0); b.rotation.x = -.25; g.add(b);
  } else if (h === 'laptop') {
    const b = mesh(new THREE.BoxGeometry(.035, .3, .4), metal('#C9D0D8', .35), 0, 0, 0); g.add(b);
    g.add(mesh(new THREE.BoxGeometry(.037, .26, .02), metal('#AEB6BF', .4), 0, 0, .19));
  } else if (h === 'case') {
    const lm = new THREE.MeshPhysicalMaterial({ color: '#7A4E2C', roughness: .45, clearcoat: .5 });
    g.add(mesh(new THREE.BoxGeometry(.4, .28, .1), lm, 0, -.2, 0));
    g.add(mesh(new THREE.BoxGeometry(.405, .05, .104), new THREE.MeshPhysicalMaterial({ color: '#5A3A22', roughness: .5 }), 0, -.1, 0));
    const hd = mesh(new THREE.TorusGeometry(.06, .016, 10, 24, Math.PI), lm, 0, -.06, 0); g.add(hd);
    g.add(mesh(new THREE.BoxGeometry(.05, .04, .02), metal(GOLD), 0, -.12, .055));
  } else if (h === 'trophy') {
    const gm = metal(GOLD, .22);
    const pts = [[0, 0], [.06, 0], [.03, .04], [.025, .12], [.06, .15], [.1, .22], [.11, .32], [.0, .32]].map(([x, y]) => new THREE.Vector2(x, y));
    g.add(mesh(new THREE.LatheGeometry(pts, 40), gm, 0, .02, 0));
    for (const s of [-1, 1]) { const t = mesh(new THREE.TorusGeometry(.045, .012, 8, 20), gm, s * .11, .27, 0); g.add(t); }
    g.add(mesh(new THREE.BoxGeometry(.14, .05, .1), plastic('#4A2E1A', .4), 0, 0, 0));
  } else if (h === 'sticks') {
    const wm = new THREE.MeshStandardMaterial({ color: '#D9B27A', roughness: .45 });
    for (const s of [-1, 1]) { const st = mesh(new THREE.CylinderGeometry(.011, .016, .46, 12), wm, s * .05, .18, 0); st.rotation.z = -s * .22; g.add(st); const tip = mesh(new THREE.SphereGeometry(.017, 10, 8), wm, s * .1, .405, 0); g.add(tip); }
  } else if (h === 'card') {
    const face = canvasTex(512, 296, (c) => { c.fillStyle = '#F1EADA'; c.fillRect(0, 0, 512, 296); c.fillStyle = '#3C3A35'; c.textAlign = 'center'; c.font = '600 22px Georgia, serif'; c.fillText('PIERCE  &  PIERCE', 256, 70); c.font = '15px Georgia, serif'; c.fillText('MERGERS AND ACQUISITIONS', 256, 96); c.font = '600 34px Georgia, serif'; c.fillText('PATRICK BATEMAN', 256, 170); c.font = '20px Georgia, serif'; c.fillText('VICE PRESIDENT', 256, 204); c.font = '15px Georgia, serif'; c.fillText('358 EXCHANGE PLACE    NEW YORK, N.Y. 10099', 256, 262); });
    const b = mesh(new THREE.BoxGeometry(.34, .2, .004), [flat('#E6DDCA'), flat('#E6DDCA'), flat('#E6DDCA'), flat('#E6DDCA'), new THREE.MeshStandardMaterial({ map: face, roughness: .7 }), flat('#E6DDCA')], 0, .12, 0); b.rotation.set(-.15, 0, .06); g.add(b);
  } else if (h === 'sellpen') {
    const p = new THREE.Group(); p.add(mesh(new THREE.CylinderGeometry(.02, .02, .3, 20), plastic('#121212', .15), 0, .15, 0)); p.add(mesh(new THREE.CylinderGeometry(.021, .021, .07, 20), metal(GOLD), 0, .27, 0)); p.add(mesh(new THREE.ConeGeometry(.02, .05, 20), metal(GOLD), 0, -.025, 0).rotateX(Math.PI)); p.add(mesh(new THREE.BoxGeometry(.008, .1, .012), metal(GOLD), .022, .25, 0)); p.rotation.z = -.35; g.add(p);
  } else if (h === 'phone') {
    const face = canvasTex(96, 256, (c) => { c.fillStyle = '#3A3D42'; c.fillRect(0, 0, 96, 256); c.fillStyle = '#A9D18E'; c.fillRect(14, 22, 68, 40); for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) { c.fillStyle = '#C9CED6'; c.fillRect(14 + k * 24, 82 + r * 30, 18, 18); } });
    const b = mesh(new THREE.BoxGeometry(.1, .3, .06), [plastic('#3A3D42'), plastic('#3A3D42'), plastic('#3A3D42'), plastic('#3A3D42'), new THREE.MeshStandardMaterial({ map: face, roughness: .5 }), plastic('#3A3D42')], 0, .14, 0); g.add(b);
    g.add(mesh(new THREE.CylinderGeometry(.008, .01, .14, 10), plastic('#222'), .03, .35, 0));
  } else if (h === 'cola') {
    const lab = canvasTex(256, 128, (c) => { c.fillStyle = '#B3122B'; c.fillRect(0, 0, 256, 128); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(0, 86); c.bezierCurveTo(80, 60, 170, 110, 256, 80); c.lineTo(256, 96); c.bezierCurveTo(170, 126, 80, 76, 0, 102); c.fill(); c.font = '800 30px sans-serif'; c.textAlign = 'center'; c.fillText('CHERRY', 64, 56); c.fillText('CHERRY', 192, 56); });
    const can = mesh(new THREE.CylinderGeometry(.068, .068, .22, 36), [new THREE.MeshStandardMaterial({ map: lab, roughness: .3, metalness: .5 }), metal('#C9CED6'), metal('#C9CED6')], 0, .1, 0); can.rotation.y = -Math.PI / 2; g.add(can);
  }
  g.scale.setScalar({ laptop: 1.5, case: 1.5, sticks: 1.6, card: .55, phone: 1.5, cola: 1.1 }[h] || 1);
  return g;
}



/* ---------- posing: two-bone arms aimed at a target ---------- */
const V = new THREE.Vector3(), V2 = new THREE.Vector3(), DOWN = new THREE.Vector3(0, -1, 0), Q = new THREE.Quaternion(), Q2 = new THREE.Quaternion();
const L1 = .54, L2 = .56;
function ik(arm, tx, ty, tz, px, py, pz) {
  const S = arm.sh.position, d = new THREE.Vector3(tx - S.x, ty - S.y, tz - S.z);
  const dist = Math.min(Math.max(d.length(), .2), L1 + L2 - .002); d.normalize();
  const pole = new THREE.Vector3(px - S.x, py - S.y, pz - S.z), n = new THREE.Vector3().crossVectors(d, pole).normalize(), b = new THREE.Vector3().crossVectors(n, d).normalize();
  const a = Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist))));
  const upDir = d.clone().multiplyScalar(Math.cos(a)).add(b.clone().multiplyScalar(Math.sin(a))).normalize();
  const elbow = new THREE.Vector3().copy(S).addScaledVector(upDir, L1);
  const foreDir = new THREE.Vector3(tx, ty, tz).sub(elbow).normalize();
  arm.sh.quaternion.setFromUnitVectors(DOWN, upDir);
  Q.setFromUnitVectors(DOWN, foreDir); Q2.copy(arm.sh.quaternion).invert(); arm.el.quaternion.copy(Q2.multiply(Q));
}
function pose(parts, t, st) {
  const { holdArm: ha, waveArm: wa, head, torso, eyes, lids } = parts;
  const breath = Math.sin(t * 1.6);
  torso.scale.set(1 + breath * .004, 1 + breath * .006, 1 + breath * .006);
  parts.body.rotation.z = Math.sin(t * .55) * .008; parts.body.position.x = Math.sin(t * .55) * .01;
  head.rotation.set(Math.sin(t * .7) * .03 + st.nod, Math.sin(t * .31) * .09 + st.look, Math.sin(t * .9) * .02 + st.tilt);
  head.position.y = HEAD_Y + breath * .004;
  eyes.forEach(e => e.rotation.set(Math.sin(t * .43) * .06, Math.sin(t * .31 + .6) * .12, 0));
  const blink = st.blink > 0 ? 1 - Math.abs(st.blink - .07) / .07 : 0;
  lids.forEach(l => l.lid.rotation.x = l.open + (1.05 - l.open) * Math.max(0, blink));
  // the holding arm
  const sw = Math.sin(t * 1.6) * .01;
  if (parts.pose === 'up') { ik(ha, .3, 2.36 + sw, .4, 1.2, 1.6, -1); ha.open.visible = false; ha.fist.visible = true; }
  else if (parts.pose === 'down') { ik(ha, .52, 1.6 + sw, .06, 1, 2.2, -1.5); ha.fist.visible = true; ha.open.visible = false; }
  else if (parts.pose === 'tuck') { ik(ha, .46, 2.02, .16, 1.2, 1.8, -1.2); ha.fist.visible = false; ha.open.visible = true; }
  else { ik(ha, .55, 1.62 + sw, .02, 1, 2.4, -1.6); ha.fist.visible = false; ha.open.visible = true; }
  // the other hand rests in his trouser pocket, and comes out to wave
  const w = st.wave;
  if (w > 0) {
    const k = Math.min(1, (1.9 - w) / .3, w / .3), wob = Math.sin(t * 11) * .09 * k;
    const tx = -.3 + (-.48 - -.3) * k + wob, ty = 1.6 + (3.18 - 1.6) * k, tz = .12 + (.22 - .12) * k;
    ik(wa, tx, ty, tz, -1.5, 1.6 + k * 1.2, -1.2 + k * .2); wa.open.visible = k > .25; wa.hand.visible = k > .15;
  } else { ik(wa, -.31, 1.6 + sw, .13, -1.4, 2.1, -1.2); wa.open.visible = false; wa.hand.visible = false; }
  wa.fist.visible = false;
  // the item follows the hand
  if (parts.item) {
    ha.hand.updateWorldMatrix(true, false); ha.hand.getWorldPosition(V); parts.body.worldToLocal(V);
    parts.item.position.copy(V);
    if (parts.pose === 'down') parts.item.position.y -= .1, parts.item.rotation.set(0, -.2, 0);
    else if (parts.pose === 'tuck') parts.item.position.add(V2.set(.05, -.02, -.06)), parts.item.rotation.set(0, 0, -.12);
    else parts.item.position.y -= .1, parts.item.position.z += .02, parts.item.rotation.set(0, -.3, 0);
  }
}

function sceneFor(bg) {
  const sc = new THREE.Scene();
  if (bg) { const t = canvasTex(64, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#FFFFFF'); g.addColorStop(.5, '#D4EBFA'); g.addColorStop(1, '#8CC4EC'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); }); sc.background = t; sc.backgroundIntensity = 1.45; }
  sc.add(new THREE.HemisphereLight('#E4F5FF', '#5E7F55', .4));
  const key = new THREE.DirectionalLight('#FFF1E0', 2.4); key.position.set(.7, 6, 5); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -2, right: 2, top: 4.2, bottom: -.5, near: .5, far: 14 }); key.shadow.bias = -.0004; key.shadow.normalBias = .02; key.shadow.radius = 4;
  sc.add(key); sc.add(key.target); key.target.position.set(0, 1.6, 0);
  const rim = new THREE.DirectionalLight('#A9DBFF', 3.0); rim.position.set(-3.5, 4, -4); sc.add(rim);
  const rim2 = new THREE.DirectionalLight('#FFE3C4', 1.0); rim2.position.set(3.5, 2.5, -3); sc.add(rim2);
  const floor = mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: .28 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; sc.add(floor);
  const t = canvasTex(256, 256, (c) => { const s = c.createRadialGradient(128, 128, 0, 128, 128, 128); s.addColorStop(0, 'rgba(10,40,70,.35)'); s.addColorStop(1, 'rgba(10,40,70,0)'); c.fillStyle = s; c.fillRect(0, 0, 256, 256); });
  const ao = mesh(new THREE.PlaneGeometry(1.4, .9), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); ao.rotation.x = -Math.PI / 2; ao.position.y = .003; sc.add(ao);
  return sc;
}
function dispose(o) { o.traverse(n => { if (n.geometry && !n.geometry.userData.keep) n.geometry.dispose(); const ms = Array.isArray(n.material) ? n.material : n.material ? [n.material] : []; ms.forEach(m => { if (m.map && !m.map.userData.keep) m.map.dispose(); if (m.normalMap && m.normalMap !== WEAVE) m.normalMap.dispose(); m.dispose(); }); }); }

/* ---------- live view ---------- */
const L = { r: null, canvas: null, scene: null, cam: null, char: null, key: '', st: { wave: 0, blink: 0, nod: 0, tilt: 0, look: 0 }, yaw: 0, vyaw: 0, drag: null, dragged: false, raf: 0, last: 0, nextBlink: 2, gen: 0 };
export function live(host, spec, placeholder) {
  if (!L.r) {
    L.canvas = document.createElement('canvas'); L.canvas.className = 'c3';
    L.r = renderer(L.canvas); L.r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    L.scene = sceneFor(true); L.scene.environment = envFor(L.r); L.scene.environmentIntensity = .6;
    L.cam = new THREE.PerspectiveCamera(22, .75, .1, 60);
    // post-processing: ambient occlusion for depth in the folds, collar and face, multisampled
    try {
      const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
      L.comp = new EffectComposer(L.r, rt); L.comp.addPass(new RenderPass(L.scene, L.cam));
      const ao = new GTAOPass(L.scene, L.cam, 4, 4); ao.updateGtaoMaterial({ radius: .05, distanceExponent: 1.4, thickness: 1.2, scale: 1.3, samples: 16 }); ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 16 }); ao.blendIntensity = .55; L.comp.addPass(ao);
      L.comp.addPass(new OutputPass());
    } catch (e) { L.comp = null; }
    const c = L.canvas;
    c.addEventListener('pointerdown', e => { L.drag = { x: e.clientX, y0: L.yaw, moved: 0, id: e.pointerId }; L.dragged = false; });
    c.addEventListener('pointermove', e => { if (!L.drag) return; const dx = e.clientX - L.drag.x; L.drag.moved = Math.max(L.drag.moved, Math.abs(dx)); if (L.drag.moved > 6) { L.dragged = true; try { c.setPointerCapture(L.drag.id); } catch (er) { } } const ny = L.drag.y0 + dx * .012; L.vyaw = ny - L.yaw; L.yaw = ny; });
    const end = () => { L.drag = null; };
    c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
    c.style.touchAction = 'pan-y';
    new ResizeObserver(() => size()).observe(c);
  }
  const k = JSON.stringify(spec);
  if (k !== L.key) {
    L.key = k; const gen = ++L.gen, ch = build(spec, .0052);
    L.ready = ch.userData.ready.then(() => { if (gen !== L.gen) return; if (L.char) { L.scene.remove(L.char); dispose(L.char); } L.char = ch; L.scene.add(ch); });
  }
  // show the canvas (in place of the placeholder) once he is ready
  const show = () => { if (placeholder && placeholder.isConnected) placeholder.remove(); host.classList.add('has3d'); host.appendChild(L.canvas); size(); if (!L.raf) { L.last = performance.now(); L.raf = requestAnimationFrame(loop); } };
  if (L.char) { show(); return Promise.resolve(); }
  return L.ready.then(() => { if (host.isConnected) show(); });
}
function size() {
  const c = L.canvas, w = c.clientWidth || 240, h = c.clientHeight || w / .75;
  const pr = L.r.getPixelRatio(); if (c.width !== Math.round(w * pr) || c.height !== Math.round(h * pr)) { L.r.setSize(w, h, false); if (L.comp) { L.comp.setPixelRatio(pr); L.comp.setSize(w, h); } }
  L.cam.aspect = w / h; L.cam.position.set(0, 3.24, 4.3); L.cam.lookAt(0, 2.8, 0); L.cam.updateProjectionMatrix();
}
function loop(now) {
  if (!L.canvas.isConnected) { L.raf = 0; return; }
  L.raf = requestAnimationFrame(loop);
  if (document.hidden || !L.char) return;
  const dt = Math.min(.05, (now - L.last) / 1000); L.last = now; const t = now / 1000, st = L.st;
  if (st.wave > 0) st.wave = Math.max(0, st.wave - dt);
  st.blink = st.blink > 0 ? Math.max(0, st.blink - dt) : 0;
  if ((L.nextBlink -= dt) <= 0) { st.blink = .14; L.nextBlink = 2 + Math.random() * 3.5; }
  const wp = st.wave > 0 ? 1.9 - st.wave : 0;
  st.tilt = st.wave > 0 ? Math.sin(wp * 3) * .05 : 0; st.nod = st.wave > 0 ? -.03 : 0;
  if (!L.drag) { L.yaw += L.vyaw; L.vyaw *= .92; }
  const ch = L.char;
  ch.rotation.y = L.yaw + Math.sin(t * .25) * .16 - .06;
  pose(ch.userData, t, st);
  if (L.comp) L.comp.render(); else L.r.render(L.scene, L.cam);
}
export function wave() { L.st.wave = 1.9; L.st.blink = 0; }
export function consumeDrag() { const d = L.dragged; L.dragged = false; return d; }

/* ---------- stills ---------- */
export async function shot(spec, view, w = 240, h = 300) {
  if (!SHOT) { const c = document.createElement('canvas'); SHOT = { r: renderer(c), cam: new THREE.PerspectiveCamera(22, 1, .1, 60) }; SHOT.r.setPixelRatio(1); SHOT.scene = sceneFor(); SHOT.scene.environment = envFor(SHOT.r); SHOT.scene.environmentIntensity = .6; }
  const ch = build(spec, view === 'head' ? .008 : .0085);
  await ch.userData.ready;
  const { r, cam, scene } = SHOT;
  r.setSize(w, h, false);
  ch.rotation.y = -.32; scene.add(ch);
  pose(ch.userData, 0, { wave: 0, blink: 0, nod: 0, tilt: 0, look: 0 }); ch.userData.head.rotation.set(0, .14, 0);
  cam.aspect = w / h;
  if (view === 'head') { cam.position.set(0, 3.16, 1.9); cam.lookAt(0, 3.08, 0); }
  else if (view === 'full') { cam.position.set(0, 2.2, 10.2); cam.lookAt(0, 1.78, 0); }
  else { cam.position.set(0, 2.95, 4.0); cam.lookAt(0, 2.72, 0); }
  cam.updateProjectionMatrix();
  r.render(scene, cam);
  const url = r.domElement.toDataURL('image/png');
  scene.remove(ch); dispose(ch);
  return url;
}
