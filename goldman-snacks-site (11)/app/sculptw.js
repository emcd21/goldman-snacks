// Goldman Snacks app: sculpts heads off the main thread (see sculpt.js).
import { sculptHead } from './sculpt.js';
onmessage = e => {
  const { id, spec, step } = e.data, r = sculptHead(spec, step);
  const skin = new Uint32Array(r.skinIdx), hair = new Uint32Array(r.hairIdx);
  postMessage({ id, pos: r.pos, nor: r.nor, colr: r.colr, skin, hair }, [r.pos.buffer, r.nor.buffer, r.colr.buffer, skin.buffer, hair.buffer]);
};
