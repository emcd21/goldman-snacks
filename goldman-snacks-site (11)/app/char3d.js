// Goldman Snacks app: the 3D character. Realistic, motion-captured people from the Microsoft Rocketbox avatar
// library (MIT licence, see avatars/LICENSE), converted to glTF. Each look is a body (the outfit) with a head
// (his face) bound onto the same skeleton, so any face can wear any outfit. live() shows him animated: idle
// motion capture, blinking, a little smile, waving and talking; drag to turn him round. shot() renders stills.
import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from './vendor/jsm/utils/SkeletonUtils.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { EffectComposer } from './vendor/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from './vendor/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from './vendor/jsm/postprocessing/OutputPass.js';

const TAU = Math.PI * 2;
// what he wears: outfit -> body; legends also bring their own face
const BODY = { white: 'Business_Male_06', qzip: 'Male_Adult_02', shirttie: 'Business_Male_07', blazer: 'Male_Adult_07', grey: 'Business_Male_02g', gilet: 'Male_Adult_05', navy: 'Business_Male_02', three: 'Business_Male_04', boss: 'Business_Male_03',
  burry: 'Male_Adult_01', bateman: 'Business_Male_01', wolf: 'Business_Male_05', gekko: 'Male_Adult_08', buffett: 'Male_Adult_03' };
const LEGEND_FACE = { burry: 'Male_Adult_01', bateman: 'Business_Male_01', wolf: 'Business_Male_05', gekko: 'Male_Adult_08', buffett: 'Male_Adult_03' };
export const DEFAULT_FACE = 'Business_Male_06';
// each avatar's skin tone (linear RGB, sampled from its face), used to match the hands to whichever face he has
const SKIN = { Business_Male_01: [.31, .13, .069], Business_Male_02: [.347, .162, .082], Business_Male_02g: [.347, .162, .082], Business_Male_03: [.361, .153, .089], Business_Male_04: [.216, .078, .041], Business_Male_05: [.191, .076, .033], Business_Male_06: [.292, .12, .058], Business_Male_07: [.462, .185, .093],
  Male_Adult_01: [.366, .171, .087], Male_Adult_02: [.361, .181, .095], Male_Adult_03: [.3, .105, .058], Male_Adult_05: [.328, .185, .124], Male_Adult_07: [.22, .084, .038], Male_Adult_08: [.328, .144, .072], Male_Adult_13: [.296, .125, .069], Male_Adult_14: [.381, .141, .074], Male_Adult_20: [.246, .114, .067] };
// a held thing picks the motion that holds it up
const HOLD_CLIP = { mug: 'drink', cola: 'drink', phone: 'phone', calc: 'drink', card: 'drink', laptop: 'drink', sellpen: 'drink', trophy: 'drink', sticks: 'drink', case: 'bag' };
// and for things he shows off, he lifts his forearm so it's in the picture
const LIFT = { mug: 1, cola: 1, calc: 1, card: 1, sellpen: 1, trophy: 1, sticks: 1 };

let ENV = null, SHOT = null;
export function ok() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}
function renderer(canvas, alpha) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !!alpha, powerPreference: 'high-performance', preserveDrawingBuffer: !!alpha });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0; r.outputColorSpace = THREE.SRGBColorSpace;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  if (alpha) r.setClearColor(0x000000, 0);
  return r;
}
function envFor(r) {
  if (!ENV) { const pm = new THREE.PMREMGenerator(r); ENV = pm.fromScene(new RoomEnvironment(), 0.04).texture; }
  return ENV;
}

/* ---------- materials for the small things he holds and wears ---------- */
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); }
  return t;
}
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
const plastic = (c, rough = 0.35) => new THREE.MeshPhysicalMaterial({ color: c, roughness: rough, clearcoat: 0.4, clearcoatRoughness: 0.3 });
const metal = (c, rough = 0.28) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: .85 });
const flat = (c, opacity = 1) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, polygonOffset: true, polygonOffsetFactor: -2 });
const GOLD = '#E2B33E';
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


/* ---------- loading ---------- */
const LOADER = new GLTFLoader(), FILES = new Map();
const glb = n => { if (!FILES.has(n)) FILES.set(n, LOADER.loadAsync('avatars/' + n + '.glb').catch(e => { FILES.delete(n); throw e; })); return FILES.get(n); };
let CLIPS = null;
function clips() {
  if (!CLIPS) CLIPS = glb('anims').then(g => {
    const o = {};
    // drop tracks for bones our avatars don't have, and the root's travel so he stays on his spot
    for (const c of g.animations) { c.tracks.forEach(t => t.name = t.name.replace(/_\d+(?=\.)/, '')); c.tracks = c.tracks.filter(t => !/^Bip01_Footsteps|^Bip01\.position|^RootNode/.test(t.name)); o[c.name] = c; }
    return o;
  });
  return CLIPS;
}
// materials: skin, cloth with a soft sheen, hair cards with alpha to coverage
function skinMat(m) {
  const s = new THREE.MeshPhysicalMaterial({ map: m.map, normalMap: m.normalMap, roughnessMap: m.roughnessMap, roughness: .92, metalness: 0, sheen: .25, sheenRoughness: .55, sheenColor: new THREE.Color('#e9d2c8'), specularIntensity: .55 });
  s.normalScale.set(1, 1);
  // a touch of subsurface warmth: light wraps a little further round the face and shadows stay warm
  s.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\n reflectedLight.indirectDiffuse += diffuseColor.rgb * vec3(.05, .018, .01);'); };
  return s;
}
function clothMat(m, tint) {
  const c = new THREE.MeshPhysicalMaterial({ map: m.map, normalMap: m.normalMap, roughnessMap: m.roughnessMap, roughness: 1, metalness: 0, sheen: .55, sheenRoughness: .6, sheenColor: new THREE.Color('#5d6470') });
  // the hands are on the body's texture: shift their tone to match his face
  c.userData.tint = { value: new THREE.Vector3(tint[0], tint[1], tint[2]) };
  c.onBeforeCompile = sh => {
    sh.uniforms.handTint = c.userData.tint;
    sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'uniform vec3 handTint;\nvoid main() {').replace('#include <map_fragment>', `#include <map_fragment>
      { vec3 cc = diffuseColor.rgb; float sk = smoothstep(.02, .0, abs(cc.g / max(cc.r, .001) - .5) - .17) * step(cc.b * 1.15, cc.g) * step(.06, cc.r) * smoothstep(.8, .86, vMapUv.y);
        diffuseColor.rgb = mix(cc, cc * handTint, sk); }`);
  };
  c.customProgramCacheKey = () => 'cloth-hand';
  return c;
}
function hairMat(m) { return new THREE.MeshPhysicalMaterial({ map: m.map, alphaTest: .4, alphaToCoverage: true, side: THREE.DoubleSide, roughness: .55, sheen: .5, sheenRoughness: .35, sheenColor: new THREE.Color('#ffffff'), specularIntensity: .6 }); }

// Build him: the body's skeleton and clothes, the head (skin, eyes, hair) bound to the same bones, extras on the bones.
async function build(spec) {
  const bodyN = BODY[spec.outfit] || BODY.white, headN = LEGEND_FACE[spec.outfit] || (SKIN[spec.head] ? spec.head : DEFAULT_FACE);
  const [bg, hg, cl] = await Promise.all([glb(bodyN + '.body'), glb(headN + '.head'), clips()]);
  const root = new THREE.Group(), fig = cloneSkinned(bg.scene); root.add(fig);
  const bones = {}; fig.traverse(o => { if (o.isBone) bones[o.name] = o; });
  const own = SKIN[bodyN], face = SKIN[headN], tint = own.map((v, i) => Math.min(1.6, face[i] / v));
  const mats = [];
  fig.traverse(o => { if (o.isSkinnedMesh) { o.material = clothMat(o.material, tint); mats.push(o.material); o.castShadow = o.receiveShadow = true; o.frustumCulled = false; } });
  const morphs = [];
  hg.scene.traverse(o => {
    if (!o.isSkinnedMesh) return;
    const m = new THREE.SkinnedMesh(o.geometry, o.material.alphaTest > 0 || o.material.name === 'hair' ? hairMat(o.material) : skinMat(o.material));
    mats.push(m.material);
    m.morphTargetDictionary = o.morphTargetDictionary; m.morphTargetInfluences = (o.morphTargetInfluences || []).map(() => 0);
    m.matrix.copy(o.matrixWorld); m.matrix.decompose(m.position, m.quaternion, m.scale);
    m.bind(new THREE.Skeleton(o.skeleton.bones.map(b => bones[b.name] || b), o.skeleton.boneInverses), o.bindMatrix);
    m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
    if (m.material.alphaTest) m.castShadow = false;
    fig.add(m); if (m.morphTargetDictionary) morphs.push(m);
  });
  const mixer = new THREE.AnimationMixer(fig), act = {};
  for (const k in cl) act[k] = mixer.clipAction(cl[k]);
  const base = HOLD_CLIP[spec.hold] || 'idle';
  act[base].play();
  for (const k of ['wave', 'look']) { act[k].setLoop(THREE.LoopOnce, 1); act[k].clampWhenFinished = true; }
  const parts = { lift: LIFT[spec.hold] ? 1 : 0, fig, bones, mixer, act, base, morphs, mats, head: bones.Bip01_Head, glasses: null, item: null, extras: [] };
  root.userData = parts;
  mixer.addEventListener('finished', e => finished(parts, e));
  mixer.update(.01); lift(parts); fig.updateMatrixWorld(true);
  addGlasses(parts, spec.glasses);
  addItem(parts, spec.hold);
  addOn(parts, spec.on || {});
  root.traverse(o => { if (o.isMesh && !o.isSkinnedMesh && !(o.material && o.material.transparent)) o.castShadow = true; });
  return root;
}
const V = new THREE.Vector3(), V2 = new THREE.Vector3(), Q = new THREE.Quaternion();
const FWD = new THREE.Vector3(0, 0, 1);
// glasses sit on the head bone, centred between his eyes
function addGlasses(p, kind) {
  if (!kind || kind === 'none') return;
  const re = p.bones.Bip01_REye, le = p.bones.Bip01_LEye; if (!re || !le) return;
  re.getWorldPosition(V); le.getWorldPosition(V2);
  const gc = { round: '#2A2A2A', square: '#1C2C4C', big: '#141414' }[kind], gm = plastic(gc, .25);
  const lens = new THREE.MeshPhysicalMaterial({ color: '#dff0ff', transparent: true, opacity: .12, roughness: .02, clearcoat: 1, depthWrite: false });
  const rr = (w, h, r) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; };
  const g = new THREE.Group(), half = V.distanceTo(V2) / 2;
  for (const s of [-1, 1]) {
    const f = new THREE.Group(); f.position.set(s * half, 0, 0); f.rotation.y = s * .1;
    if (kind === 'round') { f.add(mesh(new THREE.TorusGeometry(.0215, .0016, 10, 40), gm)); f.add(mesh(new THREE.CircleGeometry(.0215, 32), lens)); }
    else { const big = kind === 'big', w = big ? .054 : .05, h = big ? .042 : .032, t = big ? .0045 : .003; const o = rr(w, h, big ? .01 : .007); o.holes.push(rr(w - 2 * t, h - 2 * t, big ? .007 : .005)); const fr = mesh(new THREE.ExtrudeGeometry(o, { depth: .003, bevelEnabled: true, bevelThickness: .0008, bevelSize: .0006, bevelSegments: 2 }), gm); fr.position.z = -.0015; f.add(fr); f.add(mesh(new THREE.ShapeGeometry(rr(w - 2 * t, h - 2 * t, .005)), lens)); }
    const tm = mesh(new THREE.BoxGeometry(.0025, .003, .11), gm, s * (kind === 'big' ? .028 : .025), .004, -.058); tm.rotation.y = -s * .12; f.add(tm);
    g.add(f);
  }
  const br = mesh(new THREE.CapsuleGeometry(.0018, .012, 4, 8), gm, 0, .005, .002); br.rotation.z = Math.PI / 2; g.add(br);
  // place in world space in front of the eyes, facing the way he faces, then hand it to the head bone
  g.position.copy(V).add(V2).multiplyScalar(.5); g.position.z += .028; g.position.y += .002;
  p.fig.updateMatrixWorld(true); p.head.attach(g); p.glasses = g;
}
// a held thing goes in his right hand
const HOLD_AT = { mug: [0, -.045, 0, 0, 0, 0], cola: [0, -.05, 0, 0, 0, 0], phone: [0, -.07, 0, 0, 0, 0], calc: [0, -.06, .01, 0, 0, 0], card: [0, -.03, .01, 0, 0, 0], laptop: [0, -.02, 0, 0, 0, 0], sellpen: [0, -.07, 0, 0, 0, 0], trophy: [0, -.03, 0, 0, 0, 0], sticks: [0, -.1, 0, 0, 0, 0], case: [0, .03, 0, 0, 0, 0] };
function addItem(p, h) {
  const it = buildItem(h); if (!it) return;
  const hand = p.bones.Bip01_R_Hand; if (!hand) return;
  const at = HOLD_AT[h] || [0, 0, 0, 0, 0, 0];
  it.scale.multiplyScalar(.5);
  // the palm: between the wrist and the middle knuckle, on the palm side
  const f2 = p.bones.Bip01_R_Finger2;
  hand.getWorldPosition(V); if (f2) { f2.getWorldPosition(V2); V.lerp(V2, .7); }
  V.x += .03; V.z += .015; // palm side: his palm faces his body
  it.position.set(V.x + at[0], V.y + at[1], V.z + at[2]); it.rotation.set(at[3], at[4], at[5]);
  p.fig.updateMatrixWorld(true); hand.attach(it); p.item = it;
}
// pass, pen and pin on his chest
function addOn(p, on) {
  const sp = p.bones.Bip01_Spine2 || p.bones.Bip01_Spine1; if (!sp) return;
  const body = []; p.fig.traverse(o => { if (o.isSkinnedMesh && o.material === p.mats[0]) body.push(o); });
  const ray = new THREE.Raycaster();
  const front = (x, y) => { ray.set(new THREE.Vector3(x, y, 1), new THREE.Vector3(0, 0, -1)); const h = ray.intersectObjects(body, false)[0]; return h ? h.point : null; };
  const put = (o, pt) => { o.position.copy(pt); p.fig.updateMatrixWorld(true); sp.attach(o); p.extras.push(o); };
  const neck = p.bones.Bip01_Neck; neck.getWorldPosition(V); const ny = V.y;
  if (on.pin) { const pt = front(.085, ny - .17); if (pt) put(mesh(new THREE.SphereGeometry(.0065, 16, 12), metal(GOLD, .2)), pt.add(V2.set(0, 0, .003))); }
  if (on.pen) { const pt = front(.1, ny - .22); if (pt) { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(.0045, .0045, .06, 12), plastic('#1C2C4C', .2), 0, 0, 0)); g.add(mesh(new THREE.BoxGeometry(.002, .03, .004), metal(GOLD), 0, .012, .005)); put(g, pt.add(V2.set(0, .01, .004))); } }
  if (on.lanyard) {
    const pt = front(0, ny - .33); if (pt) {
      const g = new THREE.Group();
      const card = canvasTex(160, 240, (c) => { c.fillStyle = '#fff'; c.fillRect(0, 0, 160, 240); c.fillStyle = '#1A96E4'; c.fillRect(0, 0, 160, 54); c.fillStyle = '#fff'; c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.fillText('GOLDMAN', 80, 34); c.fillStyle = '#C9D6E2'; c.fillRect(46, 72, 68, 80); c.fillStyle = '#26323F'; c.font = 'bold 18px sans-serif'; c.fillText('STAFF', 80, 186); c.fillStyle = '#1A96E4'; c.fillRect(30, 204, 100, 8); });
      g.add(mesh(new THREE.BoxGeometry(.055, .08, .002), [flat('#eee'), flat('#eee'), flat('#eee'), flat('#eee'), new THREE.MeshStandardMaterial({ map: card, roughness: .4 }), flat('#eee')]));
      put(g, pt.add(V2.set(0, 0, .006)));
      const strap = new THREE.MeshStandardMaterial({ color: '#1A96E4', roughness: .6 });
      for (const s of [-1, 1]) { const a = front(s * .055, ny - .03) || new THREE.Vector3(s * .055, ny - .03, .08), b = g.getWorldPosition(new THREE.Vector3()).add(V2.set(s * .012, .04, 0)); const len = a.distanceTo(b); const c = mesh(new THREE.BoxGeometry(.008, len, .0015), strap); c.position.copy(a).add(b).multiplyScalar(.5); c.position.z += .004; c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), V.copy(a).sub(b).normalize()); p.fig.updateMatrixWorld(true); sp.attach(c); p.extras.push(c); }
    }
  }
}

/* ---------- motion and face ---------- */
function lift(p, w = 1) {
  if (!p.lift) return;
  const k = p.lift * w, fa = p.bones.Bip01_R_Forearm, ua = p.bones.Bip01_R_UpperArm;
  if (fa) fa.rotateZ(-1.1 * k); if (ua) ua.rotateY(-.3 * k);
}

function setMorph(p, name, v) { for (const m of p.morphs) { const i = m.morphTargetDictionary[name]; if (i !== undefined) m.morphTargetInfluences[i] = v; } }
function animate(p, dt, t, st) {
  p.mixer.update(dt); const wv = p.act.wave.isRunning() ? p.act.wave.getEffectiveWeight() : 0; lift(p, 1 - wv);
  // blinking, a relaxed half smile, and talking while he says something
  const b = st.blink > 0 ? 1 - Math.abs(st.blink - .075) / .075 : 0;
  setMorph(p, 'AK_09_EyeBlinkLeft', b); setMorph(p, 'AK_10_EyeBlinkRight', b);
  const smile = .28 + (st.talk > 0 ? .25 : 0) + Math.sin(t * .4) * .05;
  setMorph(p, 'AK_44_MouthSmileLeft', smile); setMorph(p, 'AK_45_MouthSmileRight', smile * .9);
  setMorph(p, 'AK_07_CheekSquintLeft', smile * .4); setMorph(p, 'AK_08_CheekSquintRight', smile * .35);
  setMorph(p, 'AK_03_BrowInnerUp', st.talk > 0 ? .25 + Math.sin(t * 5) * .1 : 0);
  if (st.talk > 0) { const s = t * 9; setMorph(p, 'AA_VI_10_aa', Math.max(0, Math.sin(s)) * .55); setMorph(p, 'AA_VI_13_O', Math.max(0, Math.sin(s * .7 + 2)) * .35); setMorph(p, 'AA_VI_11_E', Math.max(0, Math.sin(s * 1.3 + 1)) * .3); }
  else { setMorph(p, 'AA_VI_10_aa', 0); setMorph(p, 'AA_VI_13_O', 0); setMorph(p, 'AA_VI_11_E', 0); }
}
function play(p, name) {
  const a = p.act[name], base = p.act[p.base]; if (!a) return;
  for (const k of ['wave', 'look']) if (p.act[k] !== a && p.act[k].isRunning()) p.act[k].fadeOut(.3);
  a.reset(); a.enabled = true; a.setEffectiveTimeScale(1); a.fadeIn(.35); a.play();
  base.fadeOut(.35);
}
// when a one-off finishes, fade back into his usual motion
function finished(p, e) { const base = p.act[p.base]; if (e.action === base) return; base.enabled = true; base.fadeIn(.5); e.action.fadeOut(.5); }

function sceneFor(bg) {
  const sc = new THREE.Scene();
  if (bg) { const t = canvasTex(64, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#FFFFFF'); g.addColorStop(.5, '#D4EBFA'); g.addColorStop(1, '#8CC4EC'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); }); sc.background = t; sc.backgroundIntensity = 1.2; }
  // a portrait setup: warm key from the front right, cool rim lights behind, soft fill from the sky and the room
  sc.add(new THREE.HemisphereLight('#EAF6FF', '#7D8C70', .55));
  const key = new THREE.DirectionalLight('#FFF6EE', 2.5); key.position.set(1.4, 2.6, 2.4); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -.7, right: .7, top: 2.1, bottom: .6, near: .5, far: 8 }); key.shadow.bias = -.0002; key.shadow.normalBias = .012; key.shadow.radius = 3;
  sc.add(key); sc.add(key.target); key.target.position.set(0, 1.45, 0);
  const fill = new THREE.DirectionalLight('#DDEBFF', .6); fill.position.set(-2, 1.6, 2); sc.add(fill);
  const rim = new THREE.DirectionalLight('#BFE3FF', 2.6); rim.position.set(-1.6, 2.2, -2); sc.add(rim);
  const rim2 = new THREE.DirectionalLight('#FFE6CC', 1.6); rim2.position.set(1.8, 2.0, -1.8); sc.add(rim2);
  return sc;
}
function dispose(o) { const p = o.userData; if (p.mats) p.mats.forEach(m => m.dispose()); [p.glasses, p.item, ...(p.extras || [])].forEach(x => x && x.traverse(n => { if (n.geometry) n.geometry.dispose(); })); if (p.mixer) p.mixer.stopAllAction(); }
const headY = p => { p.fig.updateMatrixWorld(true); return p.head.getWorldPosition(V).y; };

/* ---------- live view ---------- */
const L = { r: null, canvas: null, scene: null, cam: null, char: null, key: '', st: { blink: 0, talk: 0 }, yaw: 0, vyaw: 0, drag: null, dragged: false, raf: 0, last: 0, nextBlink: 2, nextLook: 9, gen: 0, hy: 1.68 };
export function live(host, spec, placeholder) {
  if (!L.r) {
    L.canvas = document.createElement('canvas'); L.canvas.className = 'c3';
    L.r = renderer(L.canvas); L.r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    L.scene = sceneFor(true); L.scene.environment = envFor(L.r); L.scene.environmentIntensity = .45;
    L.cam = new THREE.PerspectiveCamera(24, .75, .05, 30);
    // post-processing: multisampled, with ambient occlusion for depth in the collar, folds and face
    try {
      const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
      L.comp = new EffectComposer(L.r, rt); L.comp.addPass(new RenderPass(L.scene, L.cam));
      const ao = new GTAOPass(L.scene, L.cam, 4, 4); ao.updateGtaoMaterial({ radius: .06, distanceExponent: 1.5, thickness: .5, scale: 1, samples: 16 }); ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 }); ao.blendIntensity = .7; L.comp.addPass(ao);
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
    L.key = k; const gen = ++L.gen;
    L.ready = build(spec).then(ch => { if (gen !== L.gen) { dispose(ch); return; } if (L.char) { L.scene.remove(L.char); dispose(L.char); } L.char = ch; L.scene.add(ch); L.hy = headY(ch.userData); size(); });
  }
  // show the canvas (in place of the placeholder) once he is ready
  const show = () => { if (placeholder && placeholder.isConnected) placeholder.remove(); host.classList.add('has3d'); host.appendChild(L.canvas); size(); if (!L.raf) { L.last = performance.now(); L.raf = requestAnimationFrame(loop); } };
  if (L.char) { show(); return Promise.resolve(); }
  return L.ready.then(() => { if (host.isConnected) show(); });
}
function size() {
  const c = L.canvas, w = c.clientWidth || 240, h = c.clientHeight || w / .75;
  const pr = L.r.getPixelRatio(); if (c.width !== Math.round(w * pr) || c.height !== Math.round(h * pr)) { L.r.setSize(w, h, false); if (L.comp) { L.comp.setPixelRatio(pr); L.comp.setSize(w, h); } }
  L.cam.aspect = w / h; L.cam.position.set(0, L.hy + .02, 1.95); L.cam.lookAt(0, L.hy - .13, 0); L.cam.updateProjectionMatrix();
}
function loop(now) {
  if (!L.canvas.isConnected) { L.raf = 0; return; }
  L.raf = requestAnimationFrame(loop);
  if (document.hidden || !L.char) return;
  const dt = Math.min(.05, (now - L.last) / 1000); L.last = now; const t = now / 1000, st = L.st, p = L.char.userData;
  st.talk = Math.max(0, st.talk - dt);
  st.blink = st.blink > 0 ? Math.max(0, st.blink - dt) : 0;
  if ((L.nextBlink -= dt) <= 0) { st.blink = .15; L.nextBlink = 1.8 + Math.random() * 3.5; }
  if ((L.nextLook -= dt) <= 0) { L.nextLook = 14 + Math.random() * 10; if (p.base === 'idle') play(p, 'look'); }
  if (!L.drag) { L.yaw += L.vyaw; L.vyaw *= .92; }
  L.char.rotation.y = L.yaw + Math.sin(t * .21) * .1 - .12;
  animate(p, dt, t, st);
  if (L.comp) L.comp.render(); else L.r.render(L.scene, L.cam);
}
export function wave() { if (!L.char) return; L.st.talk = 1.6; L.st.blink = 0; play(L.char.userData, 'wave'); }
export function consumeDrag() { const d = L.dragged; L.dragged = false; return d; }

/* ---------- stills ---------- */
export async function shot(spec, view, w = 240, h = 300) {
  const ch = await build(spec);
  if (!SHOT) { const c = document.createElement('canvas'); SHOT = { r: renderer(c, true), cam: new THREE.PerspectiveCamera(24, 1, .05, 30) }; SHOT.r.setPixelRatio(1); SHOT.scene = sceneFor(); SHOT.scene.environment = envFor(SHOT.r); SHOT.scene.environmentIntensity = .45; }
  const { r, cam, scene } = SHOT, p = ch.userData;
  r.setSize(w * 2, h * 2, false);
  ch.rotation.y = -.28; scene.add(ch);
  p.mixer.update(spec._t ?? (spec.hold === 'phone' ? 8 : 1.2)); lift(p); setMorph(p, 'AK_44_MouthSmileLeft', .32); setMorph(p, 'AK_45_MouthSmileRight', .3);
  const hy = headY(p);
  cam.aspect = w / h;
  if (view === 'head') { cam.position.set(0, hy + .1, .8); cam.lookAt(0, hy + .07, 0); }
  else { cam.position.set(0, hy + .02, 2.1); cam.lookAt(0, hy - .16, 0); }
  cam.updateProjectionMatrix();
  r.render(scene, cam);
  // render at twice the size and scale down, for clean edges
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(r.domElement, 0, 0, w, h);
  scene.remove(ch); dispose(ch);
  return c.toDataURL('image/webp', .9);
}
