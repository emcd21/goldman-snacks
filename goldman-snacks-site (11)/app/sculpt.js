// Goldman Snacks app: the character's head, sculpted as a signed distance field (skull, jaw, cheekbones, brow,
// nose, lips, ears, neck, hair, brows, beard) blended with smooth unions, then meshed with surface nets.
// Each vertex is coloured by the part nearest it, and triangles are split into a skin group and a hair group.
// Units: the head is about 0.53 tall, centred near eye level; +z is the face, +y is up.

const sqrt = Math.sqrt, abs = Math.abs, max = Math.max, min = Math.min;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const mix = (p, q, k) => k <= 0 ? p : [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k];
function smin(a, b, k) { const h = max(k - abs(a - b), 0) / k; return min(a, b) - h * h * k * .25; }
const smax = (a, b, k) => -smin(-a, -b, k);
function sdE(x, y, z, cx, cy, cz, rx, ry, rz) {
  const px = (x - cx) / rx, py = (y - cy) / ry, pz = (z - cz) / rz, k0 = sqrt(px * px + py * py + pz * pz);
  const k1 = sqrt(px * px / (rx * rx) + py * py / (ry * ry) + pz * pz / (rz * rz)) || 1e-6;
  return k0 * (k0 - 1) / k1;
}
function sdC(x, y, z, ax, ay, az, bx, by, bz, r) {
  const pax = x - ax, pay = y - ay, paz = z - az, bax = bx - ax, bay = by - ay, baz = bz - az;
  const h = clamp((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz), 0, 1);
  const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h; return sqrt(dx * dx + dy * dy + dz * dz) - r;
}
// a capsule whose radius tapers from ra to rb
function sdCT(x, y, z, ax, ay, az, bx, by, bz, ra, rb) {
  const pax = x - ax, pay = y - ay, paz = z - az, bax = bx - ax, bay = by - ay, baz = bz - az;
  const h = clamp((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz), 0, 1);
  const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h; return sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * h);
}
const sdS = (x, y, z, cx, cy, cz, r) => sqrt((x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2) - r;
function sdRB(x, y, z, cx, cy, cz, bx, by, bz, r) {
  const qx = abs(x - cx) - bx, qy = abs(y - cy) - by, qz = abs(z - cz) - bz;
  return sqrt(max(qx, 0) ** 2 + max(qy, 0) ** 2 + max(qz, 0) ** 2) + min(max(qx, qy, qz), 0) - r;
}

// The fields for one look. Returns { skin, lip, hair, brow, beard } distance functions and the hairline helpers.
export function headFields(spec) {
  const F = spec.face, W = F === 'round' ? 1.06 : F === 'long' ? .95 : 1, H = F === 'long' ? 1.06 : F === 'round' ? .97 : 1, J = F === 'square' ? 1 : 0;
  const mouth = spec.mouth || 'smile';
  const cw = mouth === 'small' ? .04 : .058, up = mouth === 'smile' || mouth === 'grin' ? .009 : mouth === 'small' ? .005 : 0;
  const upR = mouth === 'smirk' ? .016 : up, upL = mouth === 'smirk' ? -.002 : up;
  const nose = spec.nose || 'curve';
  const tipY = nose === 'long' ? -.078 : nose === 'button' ? -.06 : -.068, tipZ = nose === 'long' ? .262 : nose === 'button' ? .24 : .25, tipR = nose === 'button' ? .024 : nose === 'broad' ? .029 : .025, wing = nose === 'broad' ? .033 : .026;
  const skin = (x, y, z) => {
    const ax = abs(x);
    let d = sdE(x, y, z, 0, .065 * H, -.03, .19 * W, .225 * H, .24);
    d = smin(d, sdE(x, y, z, 0, -.1 * H, .025, .158 * W * (1 + J * .08), .172 * H, .185), .09);
    if (J) d = smin(d, sdRB(x, y, z, 0, -.155 * H, .03, .108 * W, .05, .12, .05), .07);
    d = smin(d, sdE(x, y, z, 0, -.235 * H, .112, .062 * (1 + J * .35), .052, .058), .055);
    d = smin(d, sdE(ax, y, z, .103 * W, -.025, .125, .065, .042, .06), .06);
    d = smin(d, sdC(ax, y, z, 0, .066, .207, .1, .07, .183, .024), .05);
    d = smax(d, -sdS(ax, y, z, .071, .004, .222, .041), .03);
    d = smin(d, sdC(x, y, z, 0, .045, .212, 0, tipY + .02, tipZ - .012, .016), .028);
    d = smin(d, sdS(x, y, z, 0, tipY, tipZ, tipR), .022);
    d = smin(d, sdS(ax, y, z, wing, tipY - .012, tipZ - .03, .018), .02);
    d = smax(d, -sdE(ax, y, z, .013, tipY - .036, tipZ - .034, .0055, .003, .0065), .004);
    d = smin(d, sdE(ax, y, z, .196 * W, -.012, -.008, .027, .058, .042), .02);
    d = smax(d, -sdS(ax, y, z, .214 * W, -.01, .006, .019), .01);
    d = smin(d, sdC(x, y, z, 0, -.12, -.035, 0, -.52, -.035, .088), .07);
    d = smin(d, lip(x, y, z) + .0015, .014);
    return d;
  };
  // lips: an upper and a lower lip, corners lifted for a smile
  // each lip is two segments that follow the curve of the muzzle out to the corners
  const mz = (x, y) => .025 + .185 * sqrt(Math.max(0, 1 - (x / (.158 * W)) ** 2 - ((y + .1 * H) / (.172 * H)) ** 2));
  const seg = (x, y, z, y0, k, r0, r1, ups, sgn, back) => { const xe = sgn * cw * k, xm = xe * .5, ye = -.137 + ups, ym = (y0 + ye) / 2 + (y0 > -.137 ? .001 : -.0015);
    return min(sdCT(x, y, z, 0, y0, mz(0, y0) - back, xm, ym, mz(xm, ym) - back - .001, r0, (r0 + r1) / 2), sdCT(x, y, z, xm, ym, mz(xm, ym) - back - .001, xe, ye, mz(xe, ye) - .004, (r0 + r1) / 2, r1)); };
  const lip = (x, y, z) => {
    const upper = min(seg(x, y, z, -.129, 1, .008, .0025, upL, -1, .005), seg(x, y, z, -.129, 1, .008, .0025, upR, 1, .005));
    const lower = min(seg(x, y, z, -.147, .88, .0105, .003, upL, -1, .006), seg(x, y, z, -.147, .88, .0105, .003, upR, 1, .006));
    return min(upper, lower);
  };
  const mouthLine = (x, y, z) => min(sdC(x, y, z, 0, -.1375, mz(0, -.1375) + .004, -cw * .5, -.1375 + upL * .4, mz(cw * .5, -.137) + .004, 0), sdC(x, y, z, 0, -.1375, mz(0, -.1375) + .004, cw * .5, -.1375 + upR * .4, mz(cw * .5, -.137) + .004, 0), sdC(x, y, z, -cw * .5, -.1375 + upL * .4, mz(cw * .5, -.137) + .004, -cw, -.137 + upL, mz(cw, -.137), 0), sdC(x, y, z, cw * .5, -.1375 + upR * .4, mz(cw * .5, -.137) + .004, cw, -.137 + upR, mz(cw, -.137), 0));
  // the hairline: hair is kept where this is positive
  const hl = (x, y, z, off = 0) => (y - .02) * .88 - z * .47 - off + .005 * Math.sin(x * 70) + .003 * Math.sin(x * 160 + 1);
  const hs = spec.hair;
  const CURLS = [];
  if (hs === 'curly') for (let a = 0; a < 6; a++) for (let b = 0; b < 9; b++) { const th = .25 + a * .26, ph = b / 9 * Math.PI * 2 + a * .4; const px = Math.sin(th) * Math.sin(ph) * .21 * W, py = Math.cos(th) * .24 * H + .08, pz = Math.sin(th) * Math.cos(ph) * .25 - .03; if (hl(px, py, pz) >= -.01) CURLS.push([px, py, pz]); }
  const hair = (x, y, z) => {
    if (hs === 'bald') return 1;
    const sc = hs === 'buzz' ? 1.022 : hs === 'long' ? 1.07 : hs === 'curly' ? 1.05 : 1.04;
    let d = sdE(x, y, z, 0, .065 * H, -.03, .19 * W * sc, .225 * H * sc, .24 * sc);
    const ax = abs(x);
    if (hs === 'short' || hs === 'messy' || hs === 'bun' || hs === 'curly') d = smin(d, sdE(x, y, z, 0, .2 * H, .03, .17 * W, .12, .21), .07);
    if (hs === 'side') { d = smin(d, sdE(x, y, z, .03, .21 * H, .05, .175 * W, .11, .2), .07); d = smax(d, -sdC(x, y, z, -.075, .36, .22, -.075, .2, -.25, .009), .012); }
    if (hs === 'slick') { d = smin(d, sdE(x, y, z, 0, .19 * H, -.03, .175 * W, .11, .26), .07); }
    if (hs === 'quiff') { d = smin(d, sdE(x, y, z, 0, .2 * H, .0, .17 * W, .11, .21), .07); d = smin(d, sdE(x, y, z, 0, .26 * H, .12, .13, .1, .12), .07); }
    if (hs === 'bun') d = smin(d, sdS(x, y, z, 0, .25 * H, -.17, .085), .04);
    if (hs === 'messy') for (const [px, py, pz, dx, dy, dz] of [[0, .28, .1, 0, .07, .06], [.08, .28, .05, .05, .07, .03], [-.08, .28, .05, -.05, .07, .03], [.13, .22, .1, .06, .03, .05], [-.13, .22, .1, -.06, .03, .05], [0, .3, -.06, 0, .07, -.02], [.1, .27, -.08, .05, .06, -.02], [-.1, .27, -.08, -.05, .06, -.02], [.05, .2, .19, .02, .02, .07], [-.05, .2, .19, -.02, .02, .07]]) d = smin(d, sdCT(x, y, z, px, py * H, pz, px + dx, py * H + dy, pz + dz, .045, .008), .03);
    if (hs === 'curly') for (const [px, py, pz] of CURLS) { const q = (x - px) ** 2 + (y - py) ** 2 + (z - pz) ** 2; if (q > .0049) continue; d = smin(d, sqrt(q) - .045, .025); }
    if (hs === 'long') { let c = sdE(x, y, z, 0, -.12, -.06, .235 * W, .33, .225); c = smax(c, z - .07, .05); d = smin(d, c, .05); }
    // sideburns, then cut at the hairline
    if (hs !== 'long') d = smin(d, sdC(ax, y, z, .188 * W, .05, .055, .19 * W, -.035, .065, .014), .02);
    const cut = hs === 'long' ? min(hl(x, y, z, .0), .07 - z + (y + .1) * .2) : hl(x, y, z, hs === 'slick' ? .012 : 0);
    if (hs !== 'curly' && hs !== 'buzz') d += .0014 * Math.sin(x * 230 + Math.sin(y * 29 + z * 17) * 1.8) + .0007 * Math.sin(x * 520 + z * 40);
    return smax(d, -max(cut, (hs !== 'long' ? -sdC(ax, y, z, .188 * W, .06, .055, .19 * W, -.045, .065, .02) : -1)), .015);
  };
  const browY = { arched: [.072, .086, .07], serious: [.062, .074, .078], straight: [.074, .074, .072], thick: [.073, .08, .072] }[spec.brows] || [.072, .079, .07];
  const browR = spec.brows === 'thick' ? .012 : .0085;
  const brow = (x, y, z) => {
    const ax = abs(x);
    return min(sdCT(ax, y, z, .026, browY[0], .224, .07, browY[1], .214, browR, browR * .9), sdCT(ax, y, z, .07, browY[1], .214, .115, browY[2], .19, browR * .9, browR * .55));
  };
  const bd = spec.beard;
  const beard = (x, y, z) => {
    if (bd === 'tash' || bd === 'beard') { const t = min(sdCT(x, y, z, 0, -.113, .228, .05, -.124, .205, .013, .008), sdCT(x, y, z, 0, -.113, .228, -.05, -.124, .205, .013, .008)); if (bd === 'tash') return t;
      let b = sdE(x, y, z, 0, -.12 * H, .03, .178 * W * (1 + J * .07), .18 * H, .2);
      b = smin(b, sdE(x, y, z, 0, -.235 * H, .12, .075, .065, .07), .05);
      b = smax(b, y - (-.035 - .065 * clamp(1 - abs(x) / .08, 0, 1)), .02);
      b = smax(b, -(z + .02), .04);
      b = smax(b, -sdE(x, y, z, 0, -.14, .22, .056, .03, .05), .012);
      return min(b, t);
    }
    return 1;
  };
  return { skin, lip, hair, brow, beard, mouthLine, W, H };
}

// Surface nets over the box [b0, b1] at the given step. A coarse pass skips samples far from the surface.
export function surfaceNets(f, b0, b1, step) {
  const nx = Math.ceil((b1[0] - b0[0]) / step) + 1, ny = Math.ceil((b1[1] - b0[1]) / step) + 1, nz = Math.ceil((b1[2] - b0[2]) / step) + 1;
  const C = 4, cs = step * C, cnx = Math.ceil(nx / C) + 1, cny = Math.ceil(ny / C) + 1, cnz = Math.ceil(nz / C) + 1;
  const coarse = new Float32Array(cnx * cny * cnz);
  for (let k = 0; k < cnz; k++) for (let j = 0; j < cny; j++) for (let i = 0; i < cnx; i++) coarse[i + cnx * (j + cny * k)] = f(b0[0] + i * cs, b0[1] + j * cs, b0[2] + k * cs);
  const v = new Float32Array(nx * ny * nz), far = cs * 1.5;
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const c = coarse[Math.round(i / C) + cnx * (Math.round(j / C) + cny * Math.round(k / C))];
    v[i + nx * (j + ny * k)] = abs(c) > far ? c : f(b0[0] + i * step, b0[1] + j * step, b0[2] + k * step);
  }
  const cx = nx - 1, cy = ny - 1, cz = nz - 1, vid = new Int32Array(cx * cy * cz).fill(-1), pos = [];
  const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const co = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const g = new Float32Array(8);
  for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
    let mask = 0;
    for (let c = 0; c < 8; c++) { const val = v[(i + co[c][0]) + nx * ((j + co[c][1]) + ny * (k + co[c][2]))]; g[c] = val; if (val < 0) mask |= 1 << c; }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of E) { const ga = g[a], gb = g[b]; if ((ga < 0) === (gb < 0)) continue; const t = ga / (ga - gb); sx += co[a][0] + (co[b][0] - co[a][0]) * t; sy += co[a][1] + (co[b][1] - co[a][1]) * t; sz += co[a][2] + (co[b][2] - co[a][2]) * t; n++; }
    vid[i + cx * (j + cy * k)] = pos.length / 3;
    pos.push(b0[0] + (i + sx / n) * step, b0[1] + (j + sy / n) * step, b0[2] + (k + sz / n) * step);
  }
  const idx = [], cell = (i, j, k) => vid[i + cx * (j + cy * k)];
  const quad = (a, b, c, d, flip) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; if (flip) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d); };
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v0 = v[i + nx * (j + ny * k)], in0 = v0 < 0;
    if (i < cx && j > 0 && k > 0 && j < ny - 1 && k < nz - 1) { const v1 = v[(i + 1) + nx * (j + ny * k)]; if (in0 !== (v1 < 0)) quad(cell(i, j - 1, k - 1), cell(i, j, k - 1), cell(i, j, k), cell(i, j - 1, k), !in0); }
    if (j < cy && i > 0 && k > 0 && i < nx - 1 && k < nz - 1) { const v1 = v[i + nx * ((j + 1) + ny * k)]; if (in0 !== (v1 < 0)) quad(cell(i - 1, j, k - 1), cell(i - 1, j, k), cell(i, j, k), cell(i, j, k - 1), !in0); }
    if (k < cz && i > 0 && j > 0 && i < nx - 1 && j < ny - 1) { const v1 = v[i + nx * (j + ny * (k + 1))]; if (in0 !== (v1 < 0)) quad(cell(i - 1, j - 1, k), cell(i, j - 1, k), cell(i, j, k), cell(i - 1, j, k), !in0); }
  }
  return { pos: new Float32Array(pos), idx };
}

// Build the head: positions, normals (from the field's gradient), colours, and index groups [skin, hair].
export function sculptHead(spec, step = .0075) {
  const P = headFields(spec);
  const total = (x, y, z) => min(P.skin(x, y, z), P.hair(x, y, z), P.brow(x, y, z), P.beard(x, y, z));
  const long = spec.hair === 'long';
  const { pos, idx } = surfaceNets(total, [-.27, long ? -.56 : -.53, -.31], [.27, .4, .34], step);
  const n = pos.length / 3, nor = new Float32Array(pos.length), colr = new Float32Array(pos.length), isHair = new Uint8Array(n);
  const hex = h => { const v = parseInt(h.slice(1), 16); return [(v >> 16) / 255, (v >> 8 & 255) / 255, (v & 255) / 255].map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4); };
  const skinC = hex(spec.skin), hairC = hex(spec.hairCol), browC = spec.hair === 'bald' ? skinC.map(c => c * .5) : hairC.map(c => c * .7), lipC = skinC.map((c, i) => c * [.8, .55, .52][i]);
  const FADE = ['short', 'quiff', 'slick', 'side', 'messy', 'buzz'].includes(spec.hair);
  const fr = spec.marks === 'freckles' ? [[.07, -.04], [.09, -.02], [.11, -.05], [.06, -.06], [.1, -.075], [.125, -.03], [.08, -.085]] : [];
  const e = step * .5, tipYc = { long: -.078, button: -.06 }[spec.nose] ?? -.068;
  for (let i = 0; i < n; i++) {
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
    const a = total(x + e, y - e, z - e), b = total(x - e, y - e, z + e), c4 = total(x - e, y + e, z - e), d4 = total(x + e, y + e, z + e);
    const gx = a - b - c4 + d4, gy = -a - b + c4 + d4, gz = -a + b - c4 + d4, l = Math.hypot(gx, gy, gz) || 1;
    nor[i * 3] = gx / l; nor[i * 3 + 1] = gy / l; nor[i * 3 + 2] = gz / l;
    const ds = P.skin(x, y, z), dh = P.hair(x, y, z), db = P.brow(x, y, z), dd = P.beard(x, y, z), dl = P.lip(x, y, z);
    // blend colours smoothly across boundaries, so edges are soft rather than stepped
    const wh = ss(.003, -.002, min(dh, dd) - ds), wb = ss(.011, .002, db) * (1 - wh), wl = z > .17 ? ss(.0045, 0, dl) * (1 - wh) : 0;
    let c = skinC;
    if (spec.beard === 'stubble' && y < -.04 && z > -.02 && abs(x) < .2) { const k = clamp((-.04 - y) / .03, 0, 1) * .5 * (1 - ss(.008, .002, dl)); c = mix(c, hairC, k); }
    if (spec.marks === 'blush') c = mix(c, c.map((v, j) => v * [1.08, .86, .86][j]), ss(.05, 0, sdS(abs(x), y, z, .1, -.04, .17, .0)));
    if (spec.marks === 'mole') c = mix(c, c.map(v => v * .3), ss(.002, -.001, sdS(x, y, z, .07, -.15, .19, .006)));
    for (const [fx, fy] of fr) if (z > .12) c = mix(c, c.map(v => v * .7), ss(.003, -.001, sdS(abs(x), y, z, fx, fy, .2, .0065)));
    // living skin: warmer nose, cheeks and ears, a shade under the brows and in the eye sockets, a cooler jaw
    const warm = c.map((v, j) => v * [1.06, .9, .88][j]);
    c = mix(c, warm, .55 * ss(.06, 0, sdS(abs(x), y, z, .09, -.045, .17, 0)));
    c = mix(c, warm, .6 * ss(.035, 0, sdS(x, y, z, 0, tipYc, .24, 0)));
    c = mix(c, warm, .5 * ss(.03, 0, sdS(abs(x), y, z, .2, -.01, 0, 0)));
    c = mix(c, c.map((v, j) => v * [.88, .83, .84][j]), .4 * ss(.03, .004, sdE(abs(x), y, z, .07, .02, .2, .045, .026, .03)));
    if (!spec.beard || spec.beard === 'none') c = mix(c, c.map((v, j) => v * [.94, .95, 1][j]), .5 * ss(-.12, -.2, y) * ss(.05, .15, z));
    c = mix(c, lipC, wl);
    c = mix(c, lipC.map(v => v * .45), z > .17 ? ss(.004, .001, P.mouthLine(x, y, z)) : 0);
    c = mix(c, browC, wb);
    const strand = .84 + .26 * (.5 + .5 * Math.sin(x * 260 + Math.sin(y * 31 + z * 23) * 1.6 + (spec.hair === 'curly' ? Math.sin(y * 200) * 2 : 0)));
    const fade = FADE ? (1 - ss(-.05, .09, y + (z > .1 ? .1 : 0))) * .65 : 0;
    c = mix(c, mix(hairC.map(v => v * strand), skinC.map(v => v * .8), fade), wh);
    const h = wh > .5 ? 1 : 0;
    colr[i * 3] = c[0]; colr[i * 3 + 1] = c[1]; colr[i * 3 + 2] = c[2]; isHair[i] = h;
  }
  const skinIdx = [], hairIdx = [];
  for (let t = 0; t < idx.length; t += 3) { const a = idx[t], b = idx[t + 1], c = idx[t + 2]; (isHair[a] + isHair[b] + isHair[c] >= 2 ? hairIdx : skinIdx).push(a, b, c); }
  return { pos, nor, colr, skinIdx, hairIdx, fields: P };
}
