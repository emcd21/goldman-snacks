// Goldman Snacks app: the 3D character. Built from simple shapes with three.js (vendor/), dressed from a spec that
// app.js makes (charSpec): skin, hair, face features, outfit, tie, held item and worn extras.
// live() shows him animated (breathing, blinking, looking around, waving; drag to turn him round);
// shot() renders a still for the wardrobe tiles and the top bar.
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const TAU = Math.PI * 2;
const R = 0.52; // head radius
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

let ENV = null, GL = null, SHOT = null;
export function ok() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}
function renderer(canvas, alpha = true) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, preserveDrawingBuffer: false, powerPreference: 'low-power' });
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.08; r.outputColorSpace = THREE.SRGBColorSpace;
  r.setClearColor(0x000000, 0);
  return r;
}
function envFor(r) {
  if (!ENV) { const pm = new THREE.PMREMGenerator(r); ENV = pm.fromScene(new RoomEnvironment(), 0.04).texture; }
  return ENV;
}

/* ---------- materials ---------- */
const col = c => new THREE.Color(c);
const shade = (hex, f) => { const c = col(hex); const h = { h: 0, s: 0, l: 0 }; c.getHSL(h); c.setHSL(h.h, h.s, Math.max(0, Math.min(1, h.l + f))); return '#' + c.getHexString(); };
const cloth = (c, map) => new THREE.MeshStandardMaterial({ color: map ? 0xffffff : c, map: map || null, roughness: 0.78, metalness: 0 });
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

/* ---------- torso: a lathe with a painted texture for the clothes ---------- */
const Y0 = 0.6, Y1 = 1.52, ZS = 0.8;
const PROFILE = [[0, .6], [.31, .6], [.345, .68], [.37, .82], [.39, 1.0], [.40, 1.17], [.388, 1.29], [.345, 1.39], [.26, 1.465], [.15, 1.51], [0, 1.525]];
function torsoGeo() {
  const curve = new THREE.SplineCurve(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)));
  const pts = curve.getPoints(48);
  const g = new THREE.LatheGeometry(pts, 64);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    uv.setXY(i, (Math.atan2(x, z) / TAU + 1.5) % 1, (y - Y0) / (Y1 - Y0));
    p.setZ(i, z * ZS);
  }
  g.computeVertexNormals();
  return g;
}
const rAt = y => { for (let i = 1; i < PROFILE.length; i++) if (y <= PROFILE[i][1]) { const [r0, y0] = PROFILE[i - 1], [r1, y1] = PROFILE[i]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 0; };
const frontZ = y => rAt(y) * ZS;

function paintTorso(spec, O) {
  const W = 1024, H = 512;
  const X = xw => 512 + xw / (TAU * 0.4) * W, Y = yw => (Y1 - yw) / (Y1 - Y0) * H, S = w => w / (TAU * 0.4) * W;
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

/* ---------- the character ---------- */
function headScale(face) { return { round: [1.06, 1.0, 1.02], long: [.95, 1.12, 1.0], square: [1.03, 1.04, 1.0] }[face] || [1, 1.06, 1]; }
function build(spec) {
  const O = OUT[spec.outfit] || OUT.white;
  const root = new THREE.Group(), parts = {};
  const skinM = new THREE.MeshPhysicalMaterial({ color: spec.skin, roughness: 0.52, sheen: 0.4, sheenColor: col('#ffb4a0'), sheenRoughness: 0.6 });
  const skinD = new THREE.MeshPhysicalMaterial({ color: shade(spec.skin, -.06), roughness: 0.5, sheen: 0.4, sheenColor: col('#ffb4a0') });
  const hairM = new THREE.MeshPhysicalMaterial({ color: spec.hairCol, roughness: spec.hair === 'slick' ? 0.28 : spec.hair === 'buzz' ? 0.9 : 0.55, clearcoat: spec.hair === 'slick' ? 0.8 : 0.1, clearcoatRoughness: 0.3 });
  const sleeveC = O.kind === 'suit' || O.kind === 'qzip' || O.kind === 'tee' ? O.body : O.shirt;
  const trouserC = O.trousers || O.body, shoeC = O.shoes || '#1A1412';
  const body = new THREE.Group(); root.add(body); parts.body = body;

  // legs, hips and shoes
  const trM = cloth(trouserC);
  body.add(mesh(new THREE.CylinderGeometry(.3, .29, .14, 32), trM, 0, .58, 0));
  for (const s of [-1, 1]) {
    if (O.shorts) {
      body.add(mesh(new THREE.CapsuleGeometry(.14, .12, 6, 20), trM, s * .145, .47, 0));
      body.add(mesh(new THREE.CapsuleGeometry(.095, .26, 6, 16), skinM, s * .145, .27, 0));
      body.add(mesh(new THREE.CylinderGeometry(.1, .1, .06, 16), cloth('#F4F4F4'), s * .145, .15, 0));
    } else body.add(mesh(new THREE.CapsuleGeometry(.135, .38, 8, 20), trM, s * .145, .36, 0));
    const shoe = mesh(new THREE.SphereGeometry(1, 28, 16), plastic(shoeC, O.sneakers ? 0.6 : 0.22), s * .15, .075, .06); shoe.scale.set(.145, .085, .23); body.add(shoe);
    if (O.sneakers) { const sole = mesh(new THREE.SphereGeometry(1, 28, 12), plastic('#FAFAFA', .7), s * .15, .045, .06); sole.scale.set(.15, .05, .24); body.add(sole); }
  }
  // torso
  const torso = mesh(torsoGeo(), cloth(null, paintTorso(spec, O))); body.add(torso); parts.torso = torso;
  // neck and collar
  body.add(mesh(new THREE.CylinderGeometry(.12, .13, .22, 24), skinM, 0, 1.56, 0));
  if (O.kind === 'qzip') { const c = mesh(new THREE.CylinderGeometry(.16, .19, .14, 32, 1, true), cloth(shade(O.body, -.05)), 0, 1.53, 0); c.material.side = THREE.DoubleSide; body.add(c); }
  if (O.kind === 'tee') body.add(mesh(new THREE.TorusGeometry(.14, .022, 10, 32), cloth(shade(O.body, .1)), 0, 1.5, 0)).children.at(-1).rotation.x = Math.PI / 2;
  if (O.kind === 'shirt' || O.kind === 'suit' || O.kind === 'gilet') {
    const cm = cloth(O.collar || O.shirt);
    for (const s of [-1, 1]) {
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(s * .12, .045); sh.lineTo(s * .085, -.075); sh.closePath();
      const c = mesh(new THREE.ExtrudeGeometry(sh, { depth: .012, bevelEnabled: true, bevelThickness: .006, bevelSize: .006, bevelSegments: 2 }), cm, s * .02, 1.5, frontZ(1.5) + .055);
      c.rotation.set(-.55, s * .25, 0); body.add(c);
    }
    const band = mesh(new THREE.TorusGeometry(.13, .02, 10, 32, Math.PI * 1.2), cm, 0, 1.52, 0); band.rotation.set(Math.PI / 2, 0, -Math.PI * .1 + Math.PI); band.rotation.z = Math.PI * 0.4 - Math.PI; body.add(band);
  }
  // tie
  if (O.tie) {
    const tc = spec.tie, sh = new THREE.Shape();
    sh.moveTo(-.034, 0); sh.lineTo(.034, 0); sh.lineTo(.026, -.065); sh.lineTo(.055, -.42); sh.lineTo(0, -.48); sh.lineTo(-.055, -.42); sh.lineTo(-.026, -.065); sh.closePath();
    const tm = new THREE.MeshPhysicalMaterial({ color: O.pat ? 0xffffff : tc, map: O.pat ? canvasTex(32, 32, (g) => { g.fillStyle = tc; g.fillRect(0, 0, 32, 32); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(16, 16, 4, 0, TAU); g.fill(); }, 1) : null, roughness: O.shine ? 0.3 : 0.5, sheen: 0.6, sheenColor: col(O.shine ? '#FFF1B8' : '#ffffff'), clearcoat: O.shine ? .6 : 0 });
    if (tm.map) tm.map.repeat.set(28, 28);
    const tie = mesh(new THREE.ExtrudeGeometry(sh, { depth: .014, bevelEnabled: true, bevelThickness: .008, bevelSize: .006, bevelSegments: 2 }), tm, 0, 1.475, frontZ(1.45) + .03);
    tie.rotation.x = -.3; body.add(tie); parts.tie = tie;
  }
  // arms: a shoulder group with the upper arm, an elbow group with the forearm and hand
  const arm = (s) => {
    const sh = new THREE.Group(); sh.position.set(s * .37, 1.3, 0);
    const shortSleeve = O.kind === 'tee', rolled = O.rolled;
    const up = mesh(new THREE.CapsuleGeometry(.105, .2, 8, 20), cloth(sleeveC), 0, -.13, 0); sh.add(up);
    const el = new THREE.Group(); el.position.y = -.3; sh.add(el);
    const fa = mesh(new THREE.CapsuleGeometry(.092, .16, 8, 20), shortSleeve || rolled ? skinM : cloth(sleeveC), 0, -.12, 0); el.add(fa);
    if (rolled) el.add(mesh(new THREE.CylinderGeometry(.108, .108, .07, 20), cloth(O.shirt), 0, -.01, 0));
    if (O.kind === 'suit') el.add(mesh(new THREE.CylinderGeometry(.094, .094, .04, 20), cloth(O.shirt), 0, -.235, 0));
    const hand = new THREE.Group(); hand.position.y = -.33; el.add(hand);
    const palm = mesh(new THREE.SphereGeometry(.105, 24, 16), skinM); palm.scale.set(1, 1.05, .82); hand.add(palm);
    const th = mesh(new THREE.CapsuleGeometry(.032, .05, 6, 12), skinM, -s * .07, .02, .05); th.rotation.z = s * .7; hand.add(th);
    body.add(sh);
    return { sh, el, hand };
  };
  parts.waveArm = arm(-1); parts.holdArm = arm(1);
  parts.waveArm.sh.rotation.z = -.12; parts.holdArm.sh.rotation.z = .12;

  // head
  const head = new THREE.Group(); parts.head = head;
  const [sx, sy, sz] = headScale(spec.face);
  const hg = new THREE.SphereGeometry(R, 64, 48);
  if (spec.face === 'square') { const p = hg.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < 0) { const k = 1 + .2 * Math.min(1, -y / R * 1.6); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * (1 + .06 * (k - 1) / .2)); p.setY(i, Math.max(y, -R * .86)); } } hg.computeVertexNormals(); }
  const skull = mesh(hg, skinM); skull.scale.set(sx, sy, sz); head.add(skull);
  // a point on the face: u across (radians, + is the viewer's right), v up
  const sp = (u, v, lift = 0) => new THREE.Vector3(R * sx * Math.sin(u) * Math.cos(v), R * sy * Math.sin(v), R * sz * Math.cos(u) * Math.cos(v)).multiplyScalar(1 + lift);
  const put = (o, u, v, lift = 0) => { const p = sp(u, v, lift); o.position.copy(p); o.lookAt(p.clone().multiplyScalar(2)); head.add(o); return o; };
  for (const s of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(.12, 20, 16), skinM, s * R * sx * .99, -.07, -.02); e.scale.set(.45, 1, .72); head.add(e); }
  // eyes
  const black = new THREE.MeshPhysicalMaterial({ color: '#1E1714', roughness: .15, clearcoat: 1, clearcoatRoughness: .05 });
  const white = new THREE.MeshPhysicalMaterial({ color: '#FBFBFB', roughness: .2, clearcoat: 1, clearcoatRoughness: .05 });
  const disc = (r, c) => mesh(new THREE.CircleGeometry(r, 28), flat(c));
  const highlight = (x, y, z, r = .02) => mesh(new THREE.SphereGeometry(r, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff' }), x, y, z);
  parts.eyes = [];
  for (const s of [-1, 1]) {
    const eg = new THREE.Group(); put(eg, s * .3, -.02, 0);
    const st = spec.eyes;
    if (st === 'round' || st === 'almond' || st === 'wide') {
      const r = st === 'wide' ? .11 : .092, sc = mesh(new THREE.SphereGeometry(r, 24, 16), white); sc.scale.set(st === 'almond' ? 1.25 : 1, st === 'almond' ? .78 : 1.08, .38); eg.add(sc);
      const ir = disc(st === 'wide' ? .066 : st === 'almond' ? .05 : .058, spec.eyeCol); ir.position.set(s * -.004, -.004, r * .39); eg.add(ir);
      const pu = disc(st === 'wide' ? .034 : .03, '#141010'); pu.position.set(s * -.004, -.004, r * .39 + .002); eg.add(pu);
      eg.add(highlight(.022, .024, r * .4 + .006, st === 'wide' ? .022 : .017));
      if (st === 'wide') eg.add(highlight(-.02, -.026, r * .4 + .004, .01));
      if (st === 'almond') { const lid = mesh(new THREE.TorusGeometry(.105, .012, 8, 24, Math.PI * .7), black); lid.rotation.z = Math.PI * .15; lid.position.set(0, -.045, .03); eg.add(lid); }
    } else {
      const e = mesh(new THREE.SphereGeometry(.068, 24, 16), black); e.scale.set(.92, 1.15, .42); eg.add(e);
      eg.add(highlight(.022, .03, .032, .02));
      if (st === 'sleepy') { const lid = mesh(new THREE.SphereGeometry(.082, 24, 12, 0, TAU, 0, Math.PI * .5), skinD); lid.scale.set(1, 1, .55); lid.position.set(0, -.008, .004); lid.rotation.x = .25; eg.add(lid); const ln = mesh(new THREE.CapsuleGeometry(.008, .13, 4, 8), black, 0, -.004, .044); ln.rotation.z = Math.PI / 2; eg.add(ln); }
      if (st === 'lash') for (const k of [0, 1, 2]) { const l = mesh(new THREE.CapsuleGeometry(.008, .035, 4, 6), black, s * (.03 + k * .022), .07 - k * .012, .02); l.rotation.z = s * (-.5 - k * .35); eg.add(l); }
    }
    parts.eyes.push(eg);
  }
  // eyebrows
  const browM = new THREE.MeshStandardMaterial({ color: spec.hair === 'bald' ? shade(spec.skin, -.18) : shade(spec.hairCol, -.04), roughness: .7 });
  const bw = spec.brows === 'thick' ? .032 : .021;
  const tilt = { soft: .12, straight: 0, thick: .08, arched: .3, serious: -.3 }[spec.brows] || .12;
  for (const s of [-1, 1]) { const b = mesh(new THREE.CapsuleGeometry(bw, .1, 6, 10), browM); const g = new THREE.Group(); g.add(b); b.rotation.z = Math.PI / 2 + s * tilt; put(g, s * .31, spec.brows === 'arched' ? .22 : .19, .015); }
  // nose
  const nose = mesh(new THREE.SphereGeometry(.06, 20, 14), skinD); nose.scale.set(...({ button: [1.05, .95, .9], long: [.85, 1.5, 1], broad: [1.5, .95, .9] }[spec.nose] || [.95, 1.15, 1])); put(nose, 0, -.13, -.04);
  // mouth: the usual one and the open smile he makes when he waves
  const lipM = new THREE.MeshStandardMaterial({ color: '#7A3B33', roughness: .5 }), darkM = flat('#5A1E1C');
  const mouthLift = spec.beard === 'beard' ? .07 : .012;
  const mg = new THREE.Group(), mo = new THREE.Group();
  const arcMouth = (r, arc, tube = .016) => { const t = mesh(new THREE.TorusGeometry(r, tube, 8, 28, arc), lipM); t.rotation.z = -Math.PI / 2 - arc / 2; t.position.y = r * .9; return t; };
  if (spec.mouth === 'grin') { const d = mesh(new THREE.CircleGeometry(.1, 28, Math.PI, Math.PI), darkM); d.scale.y = .8; mg.add(d); const te = mesh(new THREE.PlaneGeometry(.17, .028), flat('#ffffff')); te.position.set(0, -.016, .002); mg.add(te); }
  else if (spec.mouth === 'smirk') { const t = arcMouth(.075, 1.5); t.rotation.z += .45; t.position.x = .03; mg.add(t); }
  else if (spec.mouth === 'small') mg.add(arcMouth(.05, 1.9, .014));
  else if (spec.mouth === 'flat') { const c = mesh(new THREE.CapsuleGeometry(.014, .1, 4, 8), lipM); c.rotation.z = Math.PI / 2; mg.add(c); }
  else mg.add(arcMouth(.09, 2.1));
  { const d = mesh(new THREE.CircleGeometry(.115, 28, Math.PI, Math.PI), darkM); d.scale.y = .95; mo.add(d); const tg = mesh(new THREE.CircleGeometry(.06, 20), flat('#E07A7A')); tg.scale.y = .5; tg.position.set(0, -.08, .001); mo.add(tg); const te = mesh(new THREE.PlaneGeometry(.2, .03), flat('#ffffff')); te.position.set(0, -.018, .002); mo.add(te); }
  put(mg, 0, -.33, mouthLift); put(mo, 0, -.31, mouthLift); mo.visible = false; parts.mouth = mg; parts.mouthOpen = mo;
  // cheeks and marks
  for (const s of [-1, 1]) put(mesh(new THREE.CircleGeometry(.075, 24), flat('#F08A8A', spec.marks === 'blush' ? .45 : .2)), s * .5, -.2, .004);
  if (spec.marks === 'freckles') for (const s of [-1, 1]) for (const [du, dv] of [[0, 0], [.07, .04], [.05, -.05], [-.06, .03], [-.03, -.04]]) put(disc(.0085, shade(spec.skin, -.32)), s * (.42 + du), -.15 + dv, .006);
  if (spec.marks === 'mole') put(disc(.013, '#4A3328'), .2, -.4, .006);
  // facial hair
  if (spec.beard === 'beard' || spec.beard === 'stubble') {
    const b = mesh(new THREE.SphereGeometry(R * (spec.beard === 'beard' ? 1.045 : 1.006), 48, 24, Math.PI * .08, Math.PI * .84, Math.PI * .56, Math.PI * .4), spec.beard === 'beard' ? hairM : new THREE.MeshStandardMaterial({ color: spec.hairCol, transparent: true, opacity: .28, roughness: 1, depthWrite: false }));
    b.scale.set(sx, sy, sz); head.add(b);
  }
  if (spec.beard === 'tash' || spec.beard === 'beard') for (const s of [-1, 1]) { const t = mesh(new THREE.CapsuleGeometry(.03, .07, 6, 10), hairM); const g = new THREE.Group(); g.add(t); t.rotation.z = Math.PI / 2 + s * .35; put(g, s * .07, -.24, .03 + (spec.beard === 'beard' ? .04 : 0)); }
  // hair
  const cap = (theta, tilt, rs, extra) => { const m = mesh(new THREE.SphereGeometry(R * rs, 56, 28, 0, TAU, 0, theta), hairM); m.rotation.x = tilt; const g = new THREE.Group(); g.add(m); g.scale.set(sx, sy * (extra || 1), sz); head.add(g); return m; };
  const blob = (r, scale, u, v, lift, rot) => { const b = mesh(new THREE.SphereGeometry(r, 28, 18), hairM); b.scale.set(...scale); if (rot) b.rotation.set(...rot); const p = sp(u, v, lift); b.position.copy(p); head.add(b); return b; };
  switch (spec.hair) {
    case 'short': cap(Math.PI * .5, -.38, 1.07, 1.05); break;
    case 'side': cap(Math.PI * .5, -.38, 1.07, 1.05); blob(.24, [1.5, .42, 1.15], .22, .72, -.02, [-.65, 0, .32]); break;
    case 'slick': cap(Math.PI * .5, -.5, 1.055, 1.07); break;
    case 'buzz': cap(Math.PI * .5, -.42, 1.02); break;
    case 'curly': { cap(Math.PI * .48, -.4, 1.0); const n = 70; for (let i = 0; i < n; i++) { const y = 1 - i / (n - 1) * 1.1, r = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.39996; const d = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r).applyAxisAngle(new THREE.Vector3(1, 0, 0), -.4); if (d.z > .55 && d.y < .5) continue; if (d.y < -.05) continue; const b = mesh(new THREE.SphereGeometry(.125, 14, 10), hairM); b.position.set(d.x * R * sx, d.y * R * sy, d.z * R * sz).multiplyScalar(1.02); head.add(b); } break; }
    case 'messy': { cap(Math.PI * .5, -.4, 1.06); const sp2 = [[0, .95], [.35, .8], [-.35, .8], [.7, .62], [-.7, .62], [0, .7], [.2, 1.2], [-.2, 1.2], [1.1, .6], [-1.1, .6]]; for (const [u, v] of sp2) { const c = mesh(new THREE.ConeGeometry(.1, .24, 12), hairM); const p = sp(u, v, .05); c.position.copy(p); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().normalize().add(new THREE.Vector3(0, .5, 0)).normalize()); head.add(c); } break; }
    case 'quiff': cap(Math.PI * .5, -.42, 1.06, 1.04); blob(.27, [1.25, .7, 1], 0, .78, .06, [-.5, 0, 0]); break;
    case 'long': { cap(Math.PI * .55, -.38, 1.07); const b = mesh(new THREE.SphereGeometry(R * 1.07, 48, 24, Math.PI - .5, Math.PI + 1, Math.PI * .3, Math.PI * .55), hairM); b.material = hairM.clone(); b.material.side = THREE.DoubleSide; b.scale.set(sx * 1.02, sy * 1.35, sz); b.position.y = -.12; head.add(b); break; }
    case 'bun': cap(Math.PI * .5, -.4, 1.06); blob(.2, [1, 1, 1], 0, 1.45, .12); break;
  }
  // glasses
  if (spec.glasses !== 'none' && spec.glasses) {
    const gc = { round: '#2A2A2A', square: '#1C2C4C', big: '#141414' }[spec.glasses], gm = plastic(gc, .3);
    const lens = new THREE.MeshPhysicalMaterial({ color: '#dff0ff', transparent: true, opacity: .16, roughness: .05, depthWrite: false });
    const gl = new THREE.Group();
    const rr = (w, h, r) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; };
    for (const s of [-1, 1]) {
      const f = new THREE.Group(); const p = sp(s * .3, -.02, .12); f.position.copy(p); f.rotation.y = s * .22;
      if (spec.glasses === 'round') { f.add(mesh(new THREE.TorusGeometry(.125, .014, 10, 36), gm)); f.add(mesh(new THREE.CircleGeometry(.125, 28), lens)); }
      else { const big = spec.glasses === 'big', w = big ? .3 : .26, h = big ? .25 : .19, t = big ? .036 : .022; const o = rr(w, h, big ? .06 : .045); o.holes.push(rr(w - 2 * t, h - 2 * t, big ? .04 : .03)); const fr = mesh(new THREE.ExtrudeGeometry(o, { depth: .02, bevelEnabled: true, bevelThickness: .005, bevelSize: .004, bevelSegments: 2 }), gm); fr.position.z = -.01; f.add(fr); f.add(mesh(new THREE.ShapeGeometry(rr(w - 2 * t, h - 2 * t, .03)), lens)); }
      const tm = mesh(new THREE.BoxGeometry(.014, .014, .42), gm, s * (spec.glasses === 'big' ? .15 : .13), .02, -.21); tm.rotation.y = -s * .25; f.add(tm);
      gl.add(f);
    }
    const br = mesh(new THREE.CapsuleGeometry(.011, .06, 4, 8), gm, 0, sp(0, .0, .14).y, sp(0, 0, .14).z); br.rotation.z = Math.PI / 2; gl.add(br);
    head.add(gl);
  }
  head.position.set(0, 2.0, 0); body.add(head);

  // held item
  parts.item = buildItem(spec.hold);
  if (parts.item) body.add(parts.item);
  parts.pose = spec.hold ? (spec.hold === 'case' ? 'down' : spec.hold === 'laptop' ? 'tuck' : 'up') : 'rest';
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
  g.scale.setScalar(1.45);
  return g;
}

/* ---------- posing and animation ---------- */
const V = new THREE.Vector3();
function pose(parts, t, st) {
  const { holdArm: ha, waveArm: wa, head, torso, eyes } = parts;
  const breath = Math.sin(t * 1.7);
  torso.scale.set(1 + breath * .006, 1 + breath * .012, 1 + breath * .006);
  head.position.y = 2.0 + breath * .012;
  head.rotation.set(Math.sin(t * .7) * .04 + st.nod, Math.sin(t * .37) * .16, Math.sin(t * .9) * .045 + st.tilt);
  // holding arm
  if (parts.pose === 'up') { ha.sh.rotation.set(-.45, 0, .16); ha.el.rotation.set(-1.25 + Math.sin(t * 1.7) * .03, 0, 0); }
  else if (parts.pose === 'down') { ha.sh.rotation.set(.0, 0, .14); ha.el.rotation.set(-.08, 0, 0); }
  else if (parts.pose === 'tuck') { ha.sh.rotation.set(-.12, 0, .22); ha.el.rotation.set(-.55, 0, 0); }
  else { ha.sh.rotation.set(Math.sin(t * 1.3) * .05, 0, .12); ha.el.rotation.set(-.1, 0, 0); }
  // waving arm
  const w = st.wave;
  if (w > 0) {
    const up = Math.min(1, w / .18, (1.9 - (1.9 - w)) / .18 < 1 ? 1 : 1) * Math.min(1, (1.9 - w) / .25 + 0);
    const k = Math.min(1, (1.9 - w) / .2) * Math.min(1, w / .25);
    wa.sh.rotation.set(0, 0, -.12 - k * 2.45); wa.el.rotation.set(0, 0, -.25 * k + Math.sin(t * 13) * .45 * k);
    void up;
  } else { wa.sh.rotation.set(Math.sin(t * 1.3 + 1) * .05, 0, -.12); wa.el.rotation.set(-.1, 0, 0); }
  // the item follows the hand
  if (parts.item) {
    ha.hand.updateWorldMatrix(true, false); ha.hand.getWorldPosition(V); parts.body.worldToLocal(V);
    parts.item.position.copy(V);
    if (parts.pose === 'down') parts.item.position.y -= .02, parts.item.rotation.set(0, -.2, 0);
    else if (parts.pose === 'tuck') parts.item.position.add(new THREE.Vector3(.03, .1, -.05)), parts.item.rotation.set(0, 0, -.1);
    else parts.item.position.y += .04, parts.item.position.z += .05, parts.item.rotation.set(0, -.25, 0);
  }
  // blink
  const b = st.blink > 0 ? Math.max(.08, Math.abs(st.blink - .07) / .07) : 1;
  eyes.forEach(e => e.scale.y = b);
  parts.mouth.visible = !(st.wave > 0); parts.mouthOpen.visible = st.wave > 0;
}

function sceneFor() {
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight('#E4F5FF', '#7BC06A', .6));
  const key = new THREE.DirectionalLight('#FFF4E6', 2.2); key.position.set(2.5, 4, 5); sc.add(key);
  const rim = new THREE.DirectionalLight('#BFE6FF', 1.6); rim.position.set(-3, 3, -4); sc.add(rim);
  return sc;
}
function ground() {
  const t = canvasTex(256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 10, 128, 128, 128); g.addColorStop(0, 'rgba(120,196,92,1)'); g.addColorStop(.7, 'rgba(142,211,106,.85)'); g.addColorStop(1, 'rgba(142,211,106,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    const s = c.createRadialGradient(128, 128, 0, 128, 128, 44); s.addColorStop(0, 'rgba(20,60,20,.55)'); s.addColorStop(1, 'rgba(20,60,20,0)'); c.fillStyle = s; c.fillRect(0, 0, 256, 256);
  });
  const m = mesh(new THREE.CircleGeometry(1.7, 48), new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 1 }));
  m.rotation.x = -Math.PI / 2; m.position.y = .002; return m;
}
function dispose(o) { o.traverse(n => { if (n.geometry) n.geometry.dispose(); const ms = Array.isArray(n.material) ? n.material : n.material ? [n.material] : []; ms.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); }); }

/* ---------- live view ---------- */
const L = { r: null, canvas: null, scene: null, cam: null, char: null, key: '', st: { wave: 0, blink: 0, nod: 0, tilt: 0 }, yaw: 0, vyaw: 0, drag: null, dragged: false, raf: 0, last: 0, nextBlink: 2 };
export function live(host, spec) {
  if (!L.r) {
    L.canvas = document.createElement('canvas'); L.canvas.className = 'c3';
    L.r = renderer(L.canvas); L.r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    L.scene = sceneFor(); L.scene.environment = envFor(L.r); L.scene.environmentIntensity = .95; L.scene.add(ground());
    L.cam = new THREE.PerspectiveCamera(26, 1, .1, 50);
    const c = L.canvas;
    c.addEventListener('pointerdown', e => { L.drag = { x: e.clientX, y0: L.yaw, moved: 0, id: e.pointerId }; L.dragged = false; });
    c.addEventListener('pointermove', e => { if (!L.drag) return; const dx = e.clientX - L.drag.x; L.drag.moved = Math.max(L.drag.moved, Math.abs(dx)); if (L.drag.moved > 6) { L.dragged = true; try { c.setPointerCapture(L.drag.id); } catch (er) { } } const ny = L.drag.y0 + dx * .012; L.vyaw = ny - L.yaw; L.yaw = ny; });
    const end = () => { L.drag = null; };
    c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
    c.style.touchAction = 'pan-y';
    new ResizeObserver(() => size()).observe(c);
  }
  const k = JSON.stringify(spec);
  if (k !== L.key) { if (L.char) { L.scene.remove(L.char); dispose(L.char); } L.char = build(spec); L.scene.add(L.char); L.key = k; }
  host.classList.add('has3d'); host.appendChild(L.canvas); size();
  if (!L.raf) { L.last = performance.now(); L.raf = requestAnimationFrame(loop); }
}
function size() {
  const c = L.canvas, w = c.clientWidth || 240, h = c.clientHeight || w;
  if (c.width !== Math.round(w * L.r.getPixelRatio()) || c.height !== Math.round(h * L.r.getPixelRatio())) L.r.setSize(w, h, false);
  L.cam.aspect = w / h; L.cam.position.set(0, 1.5, 6.9); L.cam.lookAt(0, 1.3, 0); L.cam.updateProjectionMatrix();
}
function loop(now) {
  if (!L.canvas.isConnected) { L.raf = 0; return; }
  L.raf = requestAnimationFrame(loop);
  if (document.hidden) return;
  const dt = Math.min(.05, (now - L.last) / 1000); L.last = now; const t = now / 1000, st = L.st;
  if (st.wave > 0) st.wave = Math.max(0, st.wave - dt);
  st.blink = st.blink > 0 ? Math.max(0, st.blink - dt) : 0;
  if ((L.nextBlink -= dt) <= 0) { st.blink = .14; L.nextBlink = 2 + Math.random() * 3.5; }
  const wp = st.wave > 0 ? 1.9 - st.wave : 0;
  st.tilt = st.wave > 0 ? Math.sin(wp * 4) * .08 : 0; st.nod = st.wave > 0 ? -.05 : 0;
  if (!L.drag) { L.yaw += L.vyaw; L.vyaw *= .92; }
  const ch = L.char;
  ch.rotation.y = L.yaw + Math.sin(t * .3) * .28;
  ch.position.y = wp > 0 && wp < .45 ? Math.sin(wp / .45 * Math.PI) * .14 : 0;
  pose(ch.userData, t, st);
  L.r.render(L.scene, L.cam);
}
export function wave() { L.st.wave = 1.9; L.st.blink = 0; }
export function consumeDrag() { const d = L.dragged; L.dragged = false; return d; }

/* ---------- stills ---------- */
export function shot(spec, view, w = 240, h = 300) {
  if (!SHOT) { const c = document.createElement('canvas'); SHOT = { r: renderer(c), cam: new THREE.PerspectiveCamera(26, 1, .1, 50) }; SHOT.r.setPixelRatio(1); SHOT.scene = sceneFor(); SHOT.scene.environment = envFor(SHOT.r); SHOT.scene.environmentIntensity = .95; }
  const { r, cam, scene } = SHOT;
  r.setSize(w, h, false);
  const ch = build(spec); ch.rotation.y = view === 'head' ? -.18 : -.28; scene.add(ch);
  pose(ch.userData, 0, { wave: 0, blink: 0, nod: 0, tilt: 0 }); ch.userData.head.rotation.set(0, .12, 0);
  cam.aspect = w / h;
  if (view === 'head') { cam.position.set(0, 2.05, 3.0); cam.lookAt(0, 2.0, 0); }
  else { cam.position.set(0, 1.85, 4.7); cam.lookAt(0, 1.58, 0); }
  cam.updateProjectionMatrix();
  r.render(scene, cam);
  const url = r.domElement.toDataURL('image/png');
  scene.remove(ch); dispose(ch);
  return url;
}
