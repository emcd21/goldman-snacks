// Goldman Snacks app: the Iqraʾ app's design and engine (lessons, XP, streaks, review, garden, profile),
// filled with the Goldman Snacks site's topics. Content comes from the site itself, so the two stay in step:
//   ../site.js      TOPICS (every topic's practice questions, with fresh numbers each time) and W (the answer widgets)
//   ../flashdata.js GS_DECK (the glossary)
//   notes.js        GS_NOTES and GS_SHEETS (each topic page's notes and the cheat sheets, built by build_notes.py)
// Everything sits in one function, so its names never collide with site.js's globals (KEY, pick, shuffle…).
(() => {
'use strict';
/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const uniq = a => [...new Set(a)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = h => { const d = document.createElement('div'); d.innerHTML = h; return (d.textContent || '').replace(/\s+/g, ' ').trim(); };
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);
const CODE = (t, cls = '') => `<span class="code ${cls}">${esc(t)}</span>`;

const ICON = {
  flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3.5 5 5.6 5 10.4A5 5 0 0 1 12 22a5 5 0 0 1-5-5c0-2.4 1.3-3.6 2.2-4.8.3 1.6 1.1 2.6 2.3 2.8-.7-3.1.3-6.3.5-13z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.6 2 4.8 13.4h6.1L9.9 22l8.8-11.6h-6.1z"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5zM12 6v14"/></svg>',
  ledger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 5h16M12 5v15M4 9.5h5M15 9.5h5M4 13.5h4M15 13.5h4"/></svg>',
  path: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V8a3 3 0 0 0-6 0z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  chevR: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
  chevL: '<svg class="chev l" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>',
  chevD: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 9.5 12 16l6.5-6.5"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.3-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6H4.8a2.6 2.6 0 0 0 3.1 4.3M16.5 6h2.7a2.6 2.6 0 0 1-3.1 4.3M12 14v3.5M8.5 20.5h7M9.8 17.5h4.4"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  sprout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-8.5"/><path d="M12 12.5c0-4.2 3-6.8 7.5-6.8 0 4.6-3 6.8-7.5 6.8z"/><path d="M12 15c0-3.2-2.6-5.3-6.8-5.3 0 3.7 2.6 5.3 6.8 5.3z"/></svg>',
};

/* ---------- content from the site ---------- */
const N = window.GS_NOTES || {}, SHEETS = window.GS_SHEETS || [], DECK = window.GS_DECK || [];
const T = Object.fromEntries((typeof TOPICS !== 'undefined' ? TOPICS : []).map(t => [t.id, t]));
const has = id => !!(T[id] && N[id] && T[id].practice.length);
const UNIT_DEFS = [
  ['double', 'Double entry', 'Year 1', 'The accounting equation, debits and credits, journals, T-accounts and the trial balance.', 'Every transaction has two sides. Get this right and everything after it is easier: say the debit and the credit out loud before you answer.', ['equation', 'dcrules', 'journals', 'taccounts', 'tb']],
  ['yearend', 'Year-end adjustments', 'Year 1', 'Accruals, prepayments, depreciation and the first statements.', 'Adjustments move income and costs into the year they belong to. Ask “which year does this belong to?” every time.', ['adjustments', 'depreciation', 'income', 'sofp', 'incomplete', 'partnerships']],
  ['fs', 'Financial statements', 'Year 2', 'Every main statement, line by line, for sole traders and companies.', 'Learn the order of the lines. In an exam the layout earns marks even before the numbers do.', ['fs-is', 'fs-sofp', 'fs-sopl', 'fs-cosofp', 'fs-socie', 'fs-socf', 'cashflow']],
  ['frame', 'Framework and presentation', 'Year 3', 'The Conceptual Framework, IAS 1 and IFRS 18, policies, events and disclosures.', 'The Conceptual Framework is the reason behind every standard. When a question asks “why”, start there.', ['ifrs', 'cf', 'ias1', 'ias8', 'ias10', 'ias33', 'ias24', 'ifrs8', 'ias34']],
  ['assets', 'Assets', 'Year 3', 'PPE, intangibles, investment property, impairment, inventory and fair value.', 'For each asset standard, learn three things: initial measurement, the measurement model after that, and where gains and losses go.', ['ias16', 'ias38', 'ias40', 'ias41', 'ias36', 'ias23', 'ias20', 'ias2', 'ifrs5', 'ifrs13', 'ifrs6']],
  ['liab', 'Liabilities, revenue and tax', 'Year 3', 'Provisions, revenue, leases, deferred tax, pensions and share-based payment.', 'Many of these are about timing: when to recognise, and how much. Draw a timeline before you calculate.', ['ias37', 'ifrs15', 'ifrs16', 'ias12', 'ias19', 'ias26', 'ifrs2', 'ias21', 'ias29']],
  ['fin', 'Financial instruments and special topics', 'Year 3', 'IFRS 9, IAS 32, insurance, rate regulation and first-time adoption.', 'Classify first, then measure. Most marks in financial instruments come from putting the item in the right category.', ['ifrs9', 'ias32', 'ifrs17', 'ifrs20', 'ifrs1', 'ifrs19']],
  ['groups', 'Group accounts', 'Year 3', 'Subsidiaries, goodwill, NCI, associates and joint arrangements.', 'Lay out your workings the same way every time: group structure, net assets, goodwill, NCI, then group reserves.', ['groups', 'consol', 'fs-consol', 'consolpl', 'ias28', 'ifrs11', 'ias27', 'ifrs12']],
  ['analysis', 'Analysis', 'Year 3', 'Ratios and reading a real annual report.', 'A ratio on its own says little. Compare it with last year or a competitor, and give a reason for the change.', ['ratios', 'annualreport']],
  ['work', 'Ready for work', 'Industry', 'Bookkeeping, Excel, audit basics and interviews.', 'Employers look for accuracy and clear explanations. Check your totals before you hand anything in.', ['bookkeeping', 'excel', 'audit', 'interview']],
  ['jobs', 'On the job', 'Industry', 'Real tasks from audit and finance teams.', 'Each task is what a first-year trainee is actually asked to do. Work through it like a real file.', ['jobrec', 'jobcount', 'jobclose', 'jobtax', 'jobgc', 'jobpay', 'jobfa', 'joblease']],
];
const CODES = { equation: 'A=L+E', dcrules: 'Dr Cr', journals: 'Jnl', taccounts: 'T a/c', tb: 'TB', adjustments: 'Accr', depreciation: 'Dep', income: 'IS', sofp: 'SOFP', incomplete: 'Recs', partnerships: 'Ptnr', 'fs-is': 'IS', 'fs-sofp': 'SOFP', 'fs-sopl': 'SOPL', 'fs-cosofp': 'SOFP', 'fs-socie': 'SOCIE', 'fs-socf': 'SOCF', cashflow: 'IAS 7', ifrs: 'IFRS', cf: 'CF', groups: 'Grp', consol: 'IFRS 3', 'fs-consol': 'CSOFP', consolpl: 'CSOPL', ratios: '%', annualreport: 'AR', bookkeeping: 'Bk', excel: 'fx', audit: 'Audit', interview: 'Q&A', ifrs20: 'IFRS 20' };
const codeOf = id => CODES[id] || (/^(ias|ifrs)(\d+)$/.exec(id) || []).slice(1).map((x, i) => i ? x : x.toUpperCase()).join(' ') || (id.startsWith('job') ? 'Job' : id.toUpperCase());
const U = [];
UNIT_DEFS.forEach(([id, title, tag, desc, note, ids]) => {
  const lessons = ids.filter(has).map(tid => ({ id: tid, tid, title: N[tid].title, glyph: codeOf(tid), build: () => topicLesson(tid, !S.done[tid]) }));
  if (lessons.length) U.push({ id, title, tag, desc, note, lessons });
});
const NOTES = {
  welcome: 'Little and often beats cramming. One lesson a day, and a review whenever items are due, keeps every topic fresh for the exam.',
};
const QUOTES = [
  'Every debit has a credit. If yours don’t match, the mistake is in the entry, not the maths.',
  'In an exam, write the standard’s name and number. It is often a mark on its own.',
  'Show your workings. Method marks count even when the final figure is wrong.',
  'Read the date in the question twice. Most timing mistakes start there.',
  'If a number looks too big or too small, check the units: £ or £000.',
  'Substance over form: account for what a transaction really is.',
  'When you are stuck, go back to the definitions in the Conceptual Framework.',
];

/* ---------- state ---------- */
const KEY = 'gs-app-progress-v1';
const EXAM_DEFAULT = ['cf', 'ias1', 'ias8', 'ias10', 'ias2', 'ias16', 'ias36', 'ias38', 'ias40', 'ias41'];
const freshExam = () => ({ name: 'Element 010 in-class test', date: '2026-10-28', topics: EXAM_DEFAULT.filter(has), started: false, n: 10, mins: 0, mocks: [], days: {} });
const fresh = () => ({
  v: 1, xp: 0, daily: {}, streak: 0, best: 0, last: null, shields: 0, goal: 50,
  done: {}, unlockedTo: -1, srs: {}, ach: {}, readLog: {}, tstats: {},
  stats: { lessons: 0, correct: 0, answered: 0, reviews: 0, perfect: 0, maxCombo: 0, mocks: 0, bestMock: 0 },
  settings: { sound: true }, onboarded: false, updatedAt: 0, exam: freshExam(),
});
let S = fresh();
const mergeState = d => { S = Object.assign(fresh(), d); S.settings = Object.assign(fresh().settings, S.settings); S.stats = Object.assign(fresh().stats, S.stats); S.exam = Object.assign(freshExam(), S.exam); };
try { const raw = localStorage.getItem(KEY); if (raw) mergeState(JSON.parse(raw)); } catch (e) { }
function save() { S.updatedAt = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

/* ---------- moving progress between devices ---------- */
const CODE_PREFIX = 'GSAPP1:';
function progressCode() {
  const u = new TextEncoder().encode(JSON.stringify(S)); let bin = '';
  for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return CODE_PREFIX + btoa(bin);
}
function readProgressCode(text) {
  const t = (text || '').replace(/\s+/g, '');
  if (!t.startsWith(CODE_PREFIX)) return null;
  try {
    const d = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(t.slice(CODE_PREFIX.length)), c => c.charCodeAt(0))));
    return d && typeof d === 'object' && typeof d.xp === 'number' ? d : null;
  } catch (e) { return null; }
}

/* ---------- levels, streak, xp ---------- */
const levelStart = n => 50 * n * (n - 1);
const levelOf = xp => { let n = 1; while (xp >= levelStart(n + 1)) n++; return n; };
const TITLES = [[1, 'Trainee', 'Just starting'], [3, 'Bookkeeper', 'Double entry'], [6, 'Accounts assistant', 'Statements'], [10, 'Accountant', 'IFRS in hand'], [15, 'Senior accountant', 'Groups and judgement'], [20, 'Finance director', 'Proficient']];
const titleOf = lvl => TITLES.filter(t => lvl >= t[0]).pop();
function liveStreak() {
  if (!S.last) return 0;
  const gap = dayDiff(S.last, dayKey());
  if (gap <= 1) return S.streak;
  if (gap === 2 && S.shields > 0) return S.streak;
  return 0;
}
function addXP(n) {
  const today = dayKey();
  if (S.last !== today) {
    const gap = S.last ? dayDiff(S.last, today) : 99;
    if (gap === 1) S.streak++;
    else if (gap === 2 && S.shields > 0) { S.shields--; S.streak++; toast('A streak shield kept your streak alive'); }
    else S.streak = 1;
    S.last = today;
    if (S.streak % 7 === 0 && S.shields < 2) S.shields++;
    S.best = Math.max(S.best, S.streak);
  }
  S.xp += n; S.daily[today] = (S.daily[today] || 0) + n;
}

/* ---------- sound ---------- */
let AC = null;
function tone(freqs, dur = 0.12, type = 'sine', gap = 0.09, vol = 0.12) {
  if (!S.settings.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + i * gap;
      o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + 0.02);
    });
  } catch (e) { }
}
const sfx = { right: () => tone([660, 880], 0.14, 'triangle'), wrong: () => tone([220, 180], 0.18, 'sine', 0.1, 0.1), done: () => tone([523, 659, 784, 1047], 0.22, 'triangle', 0.11), tap: () => tone([520], 0.05, 'sine', 0, 0.05) };

/* ---------- question builders ---------- */
function mcq(q, prompt, correct, distractors, extra = {}) {
  const ds = uniq(distractors.filter(d => d !== correct)).slice(0, extra.n ? extra.n - 1 : 3);
  const opts = shuffle([correct, ...ds]);
  return Object.assign({ type: 'mcq', q, prompt, opts, a: opts.indexOf(correct) }, extra);
}
// A definition cut to its first sentence, for options and matching.
const shortDef = h => { const t = strip(h); const m = /^(.{25,}?[.;])\s/.exec(t + ' '); return (m ? m[1] : t).replace(/[.;]$/, ''); };
const clip = (t, n) => t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t;
const unitOfTopic = tid => U.find(u => u.lessons.some(l => l.tid === tid));
// Key words of a topic: [term, definition html, example html]
function wordPool(tid) {
  const u = unitOfTopic(tid);
  return (u ? u.lessons.map(l => l.tid) : [tid]).flatMap(t => N[t].words.map(w => ({ t: w[0], d: shortDef(w[1]) })));
}
function qWord(tid, i, reverse) {
  const w = N[tid].words[i]; if (!w) return null;
  const pool = wordPool(tid).filter(x => x.t !== w[0]), same = N[tid].words.filter(x => x[0] !== w[0]).map(x => ({ t: x[0], d: shortDef(x[1]) }));
  const others = uniq([...shuffle(same), ...shuffle(pool)].map(x => reverse ? x.t : x.d)).filter(x => x !== (reverse ? w[0] : shortDef(w[1])));
  const key = `K:${tid}:${i}`, explain = `${w[0]}: ${strip(w[1])}`, tid_ = tid;
  if (reverse) return mcq('Which key word is this?', { text: shortDef(w[1]) }, w[0], others, { key, explain, tid: tid_ });
  return mcq('What does this mean?', { term: w[0], ctx: N[tid].title }, shortDef(w[1]), others, { key, explain: w[2] ? `Example: ${strip(w[2])}` : '', one: true, tid: tid_ });
}
function qDeck(term, reverse) {
  const d = DECK.find(x => x.t === term); if (!d) return null;
  const pool = DECK.filter(x => x.t !== term && (x.l === d.l || Math.random() < .2));
  const key = 'G:' + term, ex = d.e ? `Example: ${strip(d.e)}` : '';
  if (reverse) return mcq('Which term is this?', { text: shortDef(d.m) }, strip(d.t), pick(pool, 6).map(x => strip(x.t)), { key, explain: `${strip(d.t)}: ${strip(d.m)}` });
  return mcq('What does this mean?', { term: strip(d.t), ctx: d.n }, shortDef(d.m), pick(pool, 6).map(x => shortDef(x.m)), { key, explain: ex, one: true });
}
const qSite = (tid, pi) => ({ type: 'site', tid, pi, key: `Q:${tid}:${pi}` });
function matchWords(tid) {
  const ws = pick(N[tid].words.filter(w => w[0].length <= 34), 4);
  return ws.length >= 3 ? { type: 'match', pairs: ws.map(w => [w[0], clip(shortDef(w[1]), 70)]), tid } : null;
}

/* ---------- lessons ---------- */
const teacher = (text, title = 'Your tutor') => `<div class="teacher"><div class="av">£</div><div><b>${title}</b><p>${text}</p></div></div>`;
const tCard = (title, body, extra = '') => ({ type: 'teach', html: `<div class="teach"><h2>${title}</h2>${body}${extra}</div>` });
function tIntro(tid) {
  const n = N[tid], u = unitOfTopic(tid);
  return { type: 'teach', html: `<div class="teach"><div class="letter-hero"><div class="lh-glyph">${CODE(codeOf(tid), codeOf(tid).length > 4 ? 'long' : '')}</div><div class="lh-info"><span class="pill p-lime">New topic</span><h2>${esc(n.title)}</h2><div class="lh-sound">${esc(n.where)}</div></div></div>
    <div class="gsx">${n.basics}</div>${u && u.lessons[0].tid === tid ? teacher(esc(u.note)) : ''}</div>` };
}
function tWords(tid, ws) {
  return tCard('Key words', `<div class="kw">${ws.map(w => `<div class="kw-i"><b>${esc(w[0])}</b><p>${w[1]}</p>${w[2] ? `<small><b>Example:</b> ${w[2]}</small>` : ''}</div>`).join('')}</div>`);
}
// First time through: the topic's notes, its key words with quick checks, the worked example, then practice.
// After that: key words and practice only, with more questions.
function topicLesson(tid, full) {
  const n = N[tid], t = T[tid], steps = [];
  if (full) steps.push(tIntro(tid));
  const idx = n.words.map((_, i) => i);
  if (full) idx.forEach(i => { if (i % 2 === 0) steps.push(tWords(tid, n.words.slice(i, i + 2))); steps.push(qWord(tid, i, Math.random() < .5)); });
  else pick(idx, 3).forEach(i => steps.push(qWord(tid, i, Math.random() < .5)));
  if (full) {
    n.learn.forEach(([h, html], i) => steps.push(tCard(esc(h || (i ? 'Learn' : n.title)), `<div class="gsx">${html}</div>`)));
    if (n.example) steps.push(tCard('Worked example', `<div class="gsx">${n.example}</div>`));
  }
  shuffle(t.practice.map((_, i) => i)).slice(0, full ? 6 : 8).forEach(i => steps.push(qSite(tid, i)));
  const m = matchWords(tid); if (m) steps.push(m);
  return steps;
}
function practiceOnly(tid, k = 8) {
  const t = T[tid]; const idx = t.practice.map((_, i) => i);
  const qs = []; while (qs.length < k && idx.length) qs.push(...shuffle(idx).slice(0, k - qs.length));
  return [...qs.map(i => qSite(tid, i)), ...pick(N[tid].words.map((_, i) => i), 2).map(i => qWord(tid, i, Math.random() < .5))];
}

const PATH = U.flatMap((u, ui) => u.lessons.map(l => Object.assign(l, { unit: ui })));
const isComplete = l => !!S.done[l.id];
const isUnlocked = i => i === 0 || i <= S.unlockedTo || isComplete(PATH[i - 1]) || isComplete(PATH[i]);
const currentIndex = () => { const i = PATH.findIndex((l, k) => !isComplete(l) && isUnlocked(k)); return i < 0 ? PATH.length - 1 : i; };

/* ---------- SRS ---------- */
const BOX_DAYS = [0, 1, 3, 7, 16, 35, 80];
function srsMark(key, ok) {
  if (!key) return;
  const it = S.srs[key] || { b: 0, due: 0 };
  it.b = ok ? Math.min(it.b + 1, BOX_DAYS.length - 1) : 0;
  it.due = Date.now() + (ok ? BOX_DAYS[it.b] : 0) * 864e5 - 36e5;
  S.srs[key] = it;
}
function fromKey(key) {
  try {
    const [t, a, b] = key.split(':');
    if (t === 'Q' && T[a] && T[a].practice[+b]) return qSite(a, +b);
    if (t === 'K' && N[a]) return qWord(a, +b, Math.random() < .5);
    if (t === 'G') return qDeck(key.slice(2), Math.random() < .4);
  } catch (e) { }
  return null;
}
const dueKeys = () => Object.entries(S.srs).filter(([k, v]) => v.due <= Date.now() && fromKeyOk(k)).sort((a, b) => a[1].b - b[1].b || a[1].due - b[1].due).map(([k]) => k);
const fromKeyOk = k => { const [t, a, b] = k.split(':'); return t === 'G' ? DECK.some(x => x.t === k.slice(2)) : t === 'Q' ? !!(T[a] && T[a].practice[+b]) : !!(N[a] && N[a].words[+b]); };
function reviewSteps(only) {
  let keys = dueKeys();
  if (only) keys = keys.filter(only);
  if (keys.length < 8) keys = keys.concat(Object.entries(S.srs).filter(([k]) => !keys.includes(k) && fromKeyOk(k) && (!only || only(k))).sort((a, b) => a[1].b - b[1].b).map(([k]) => k));
  return shuffle(keys.slice(0, 20)).slice(0, 12).map(fromKey).filter(Boolean);
}

/* ---------- achievements ---------- */
const unitDone = id => () => { const u = U.find(x => x.id === id); return !!u && u.lessons.every(isComplete); };
const ACH = [
  ['first', 'First entry', 'Finish your first lesson', '1', () => S.stats.lessons >= 1],
  ['double', 'Double entry', 'Complete the Double entry unit', 'Dr', unitDone('double')],
  ['streak3', 'Three days', 'Reach a 3-day streak', '3', () => S.best >= 3],
  ['streak7', 'A full week', 'Reach a 7-day streak', '7', () => S.best >= 7],
  ['streak30', 'Steadfast', 'Reach a 30-day streak', '30', () => S.best >= 30],
  ['perfect', 'Flawless', 'Finish a lesson with no mistakes', '✓', () => S.stats.perfect >= 1],
  ['combo10', 'On a roll', 'Answer 10 in a row correctly', '10', () => S.stats.maxCombo >= 10],
  ['fs', 'In good statements', 'Complete the Financial statements unit', 'FS', unitDone('fs')],
  ['assets', 'Asset manager', 'Complete the Assets unit', 'IAS', unitDone('assets')],
  ['groups', 'Group thinker', 'Complete the Group accounts unit', 'Grp', unitDone('groups')],
  ['notes10', 'Bookworm', 'Read the notes for 10 topics', 'N', () => Object.keys(S.readLog).length >= 10],
  ['review5', 'Revision', 'Finish 5 review sessions', 'R', () => S.stats.reviews >= 5],
  ['mock', 'Mock exam', 'Finish a mock test', 'M', () => S.stats.mocks >= 1],
  ['mock80', 'Exam ready', 'Score 80% or more on a mock test', 'A', () => S.stats.bestMock >= 80],
  ['xp1000', 'Rising', 'Earn 1,000 XP', '★', () => S.xp >= 1000],
  ['early', 'Early riser', 'Finish a lesson before 7 am', 'am', () => S.ach.early],
];
function checkAch() {
  const got = [];
  ACH.forEach(([id, name, desc, g, test]) => { if (!S.ach[id] && test()) { S.ach[id] = Date.now(); got.push({ name, desc, g }); } });
  return got;
}

/* ---------- lesson player ---------- */
let LESSON = null;
function startLesson(opts) {
  const old = $('#lesson'); if (old) old.remove();
  const steps = opts.steps.filter(Boolean);
  LESSON = Object.assign({ steps, i: 0, ok: 0, answered: 0, mistakes: 0, combo: 0, maxCombo: 0, xp: 0, first: 0, firstOk: 0 }, opts);
  document.body.style.overflow = 'hidden';
  const el = document.createElement('div'); el.className = 'lesson'; el.id = 'lesson';
  el.innerHTML = `<div class="lesson-top"><button class="x" id="quit" aria-label="Leave lesson">${ICON.x}</button><div class="bar"><i id="pbar"></i></div><div class="combo" id="combo"></div><div class="timer" id="timer" hidden></div></div><div class="stage" id="stage"></div><div id="fb"></div>`;
  document.body.appendChild(el);
  $('#quit').onclick = confirmQuit;
  if (LESSON.mins) {
    LESSON.ends = Date.now() + LESSON.mins * 6e4;
    const tick = () => {
      if (!LESSON || !LESSON.ends) return;
      const left = Math.max(0, LESSON.ends - Date.now()), m = Math.floor(left / 6e4), s = Math.floor(left / 1e3) % 60;
      const t = $('#timer'); if (t) { t.hidden = false; t.innerHTML = `${ICON.clock}${m}:${String(s).padStart(2, '0')}`; t.classList.toggle('low', left < 6e4); }
      if (!left) { clearInterval(LESSON.timer); LESSON.ends = 0; toast('Time is up'); finishLesson(); }
    };
    LESSON.timer = setInterval(tick, 1000); tick();
  }
  renderStep();
}
function confirmQuit() {
  if (LESSON.i === 0 && !LESSON.answered) return closeLesson();
  modal(`<h3>Leave this lesson?</h3><p>You will lose the progress made in this lesson.</p><div class="row"><button class="btn ghost" data-close>Keep going</button><button class="btn" id="leave">Leave</button></div>`, m => { $('#leave', m).onclick = () => { m.remove(); closeLesson(); }; });
}
function closeLesson() { if (LESSON && LESSON.timer) clearInterval(LESSON.timer); const el = $('#lesson'); if (el) el.remove(); document.body.style.overflow = ''; LESSON = null; render(); }
function setProgress() { $('#pbar').style.width = (100 * LESSON.i / LESSON.steps.length) + '%'; $('#combo').innerHTML = LESSON.combo >= 3 ? `${ICON.bolt}${LESSON.combo} in a row` : ''; }
function renderStep() {
  setProgress();
  const st = LESSON.steps[LESSON.i], stage = $('#stage');
  $('#fb').innerHTML = '';
  stage.scrollTop = 0;
  if (!st) return finishLesson();
  delete stage.dataset.locked;
  if (st.type === 'teach') { stage.innerHTML = st.html; footer('Continue', next); }
  else if (st.type === 'mcq') renderMCQ(st, stage);
  else if (st.type === 'match') renderMatch(st, stage);
  else if (st.type === 'site') renderSite(st, stage);
}
function footer(label, fn, cls = '') {
  $('#fb').innerHTML = `<div class="feedback ${cls}"><div class="feedback-in"><div class="msg"></div><button class="btn lg" id="go">${label}</button></div></div>`;
  $('#go').onclick = fn; $('#go').focus({ preventScroll: true });
}
function promptHTML(p) {
  if (!p) return '';
  if (p.html) return `<div class="gsx qp">${p.html}</div>`;
  if (p.term) return `<div class="big"><div class="term">${esc(p.term)}</div>${p.ctx ? `<div class="vref">${esc(p.ctx)}</div>` : ''}</div>`;
  return `<div class="big defn"><p>${esc(p.text)}</p></div>`;
}
function renderMCQ(st, stage) {
  const optHTML = o => st.raw ? o : esc(o);
  const one = st.one || st.opts.some(o => strip(o).length > 26);
  stage.innerHTML = `${st.kind ? `<div class="qhead"><span class="pill p-dark">${esc(st.kind)}</span>${st.topic ? `<span>${esc(st.topic)}</span>` : ''}</div>` : ''}${st.q ? `<p class="prompt">${esc(st.q)}</p>` : ''}${promptHTML(st.prompt)}<div class="opts${one ? ' one' : ''}">${st.opts.map((o, i) => `<button class="opt${one ? ' left' : ''}" data-i="${i}" type="button">${optHTML(o)}</button>`).join('')}</div>`;
  stage.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    if (stage.dataset.locked) return; stage.dataset.locked = 1;
    const i = +b.dataset.i, ok = i === st.a;
    stage.querySelectorAll('.opt').forEach((x, k) => { if (k === st.a) x.classList.add('right'); else if (k === i) x.classList.add('wrong'); else x.classList.add('dim'); });
    answer(ok, st, ok ? '' : `Answer: ${st.raw ? strip(st.opts[st.a]) : st.opts[st.a]}`, false, { chosen: strip(st.opts[i]) });
  });
}
function renderMatch(st, stage) {
  const left = shuffle(st.pairs.map((p, i) => ({ t: p[0], i }))), right = shuffle(st.pairs.map((p, i) => ({ t: p[1], i })));
  stage.innerHTML = `<p class="prompt">Match each key word to its meaning</p><div class="match"><div class="col">${left.map(x => `<button class="opt mterm" data-s="l" data-i="${x.i}" type="button">${esc(x.t)}</button>`).join('')}</div><div class="col">${right.map(x => `<button class="opt mdef" data-s="r" data-i="${x.i}" type="button">${esc(x.t)}</button>`).join('')}</div></div>`;
  let sel = null, left_ = st.pairs.length, errs = 0;
  stage.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    if (b.classList.contains('gone')) return;
    if (!sel || sel.dataset.s === b.dataset.s) { stage.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); sfx.tap(); return; }
    if (sel.dataset.i === b.dataset.i) {
      [sel, b].forEach(x => { x.classList.remove('sel'); x.classList.add('right'); setTimeout(() => x.classList.add('gone'), 260); });
      sfx.right(); left_--; sel = null;
      if (!left_) setTimeout(() => answer(errs <= 1, st, errs ? `${errs} mismatch${errs > 1 ? 'es' : ''}` : ''), 300);
    } else {
      errs++; sfx.wrong(); const a = sel; [a, b].forEach(x => { x.classList.add('wrong'); setTimeout(() => x.classList.remove('wrong', 'sel'), 400); }); sel = null;
    }
  });
}
// A question from the site: multiple choice becomes the app's own buttons; everything else uses the site's
// answer widget (sums, journals, T-accounts, statements, sorting, written answers) with the site's own marking.
function renderSite(st, stage) {
  const q = st.q || (st.q = T[st.tid].practice[st.pi].make());
  const kind = q.kind || (typeof KIND !== 'undefined' && KIND[q.type]) || 'Question';
  if (q.type === 'mcq') {
    const m = { type: 'mcq', raw: true, kind, topic: N[st.tid].title, prompt: { html: q.prompt }, opts: q.options, a: q.answer, xhtml: q.explain, src: st, key: st.key, tid: st.tid };
    return renderMCQ(m, stage);
  }
  const w = W[q.type](q);
  stage.innerHTML = `<div class="qhead"><span class="pill p-dark">${esc(kind)}</span><span>${esc(N[st.tid].title)}</span></div><div class="gsx qp">${q.prompt}</div>`;
  const box = document.createElement('div'); box.className = 'gsx widget'; box.append(w.el); stage.append(box);
  footer(q.type === 'written' ? 'Show the model answer' : 'Check', () => {
    const r = w.check();
    if (r.self) {
      box.querySelector('textarea') && (box.querySelector('textarea').readOnly = true);
      const model = box.querySelector('.model'); if (model) model.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return gradeFooter(g => answer(g === 'good', st, '', true, { self: true }), 'Tick the points you covered, then be honest with yourself.', [['again', 'I missed some'], ['good', 'I covered them']]);
    }
    const empty = ![...box.querySelectorAll('input,select,textarea')].some(x => x.type === 'checkbox' || x.type === 'radio' ? x.checked : x.value.trim()) && !box.querySelector('[aria-pressed="true"]');
    if (empty && r.n === 0) return toast('Fill in your answer first');
    const ok = r.ok ?? r.n === r.of;
    box.querySelectorAll('input,select,button,textarea').forEach(x => { if (x.type !== 'checkbox') x.disabled = true; });
    answer(ok, st, ok ? '' : `${r.n} of ${r.of} right. Red marks need another look.${r.msg ? ' ' + r.msg : ''}`, false, { reveal: ok ? null : () => { w.reveal(); box.querySelectorAll('input,select,button').forEach(x => x.disabled = true); } });
  });
}
function gradeFooter(onGrade, msg, labels) {
  $('#fb').innerHTML = `<div class="feedback"><div class="feedback-in"><div class="msg"><p>${msg}</p></div><div class="row">${labels.map(([g, l]) => `<button class="btn lg ${g === 'good' ? '' : 'dark'}" data-g="${g}">${l}</button>`).join('')}</div></div></div>`;
  $('#fb').querySelectorAll('[data-g]').forEach(b => b.onclick = () => onGrade(b.dataset.g));
}
const PRAISE = ['Excellent!', 'Spot on!', 'Correct!', 'Nicely done!', 'That balances!', 'Great work!'];
function gain(n) { LESSON.xp += n; }
function answer(ok, st, detail = '', raw = false, more = {}) {
  const base = st.src || st;
  LESSON.answered++;
  if (!base.retried) { LESSON.first++; if (ok) LESSON.firstOk++; }
  if (ok) {
    LESSON.ok++; LESSON.combo++; LESSON.maxCombo = Math.max(LESSON.maxCombo, LESSON.combo);
    gain(10 + Math.min(10, Math.max(0, LESSON.combo - 2) * 2)); sfx.right();
  } else {
    LESSON.mistakes++; LESSON.combo = 0; sfx.wrong();
    if (!base.retried && base.type !== 'match' && !LESSON.noRetry) {
      if (base.type === 'site') LESSON.steps.push({ type: 'site', tid: base.tid, pi: base.pi, key: base.key, retried: true });
      else { const o = shuffle(base.opts); LESSON.steps.push(Object.assign({}, base, { retried: true, opts: o, a: o.indexOf(base.opts[base.a]) })); }
    }
  }
  if (base.key) srsMark(base.key, ok);
  const tid = base.tid; if (tid) { const t = S.tstats[tid] || (S.tstats[tid] = { a: 0, c: 0 }); t.a++; if (ok) t.c++; }
  setProgress();
  const head = more.self ? (ok ? 'Good answer' : 'Keep practising') : ok ? PRAISE[rnd(PRAISE.length)] : 'Not quite';
  const ex = st.xhtml || (base.q && base.q.explain) || (st.explain ? esc(st.explain) : '');
  const sub = (ok ? '' : raw ? detail : esc(detail)) + (ex ? `${!ok && detail ? '<br>' : ''}${ex}` : '');
  const tools = !ok ? `<div class="fb-tools">${more.reveal ? '<button class="chip" id="reveal" type="button">Show the answers</button>' : ''}<button class="chip" id="tutor" type="button">${ICON.chat}Ask the tutor why</button></div>` : '';
  $('#fb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}"><div class="feedback-in"><div class="msg"><i class="fb-ic">${ok ? ICON.check : ICON.x}</i><div><b>${head}</b>${sub ? `<p>${sub}</p>` : ''}${tools}</div></div><button class="btn lg" id="go">Continue</button></div></div>`;
  $('#go').onclick = next; $('#go').focus({ preventScroll: true });
  const rv = $('#reveal'); if (rv) rv.onclick = () => { more.reveal(); rv.disabled = true; };
  const tu = $('#tutor'); if (tu) tu.onclick = () => askTutor(st, more.chosen);
}
function next() { LESSON.i++; renderStep(); }
const unlockRow = (icon, name, desc, tag) => `<div class="unlock"><span class="tile">${icon}</span><span class="row-main"><b>${esc(name)}</b><small>${esc(desc)}</small></span>${tag}</div>`;
function finishLesson() {
  if (LESSON.timer) clearInterval(LESSON.timer);
  const Lz = LESSON, acc = Lz.answered ? Lz.ok / Lz.answered : 1, perfect = Lz.answered > 0 && Lz.mistakes === 0;
  if (Lz.onDone) Lz.onDone(acc);
  if (perfect) Lz.xp += 15;
  const lvlBefore = levelOf(S.xp), gBefore = gardenLevel();
  addXP(Lz.xp);
  S.stats.lessons++; S.stats.correct += Lz.ok; S.stats.answered += Lz.answered;
  S.stats.maxCombo = Math.max(S.stats.maxCombo, Lz.maxCombo); if (perfect) S.stats.perfect++;
  if (new Date().getHours() < 7) S.ach.early = S.ach.early || 1;
  const stars = acc >= .95 ? 3 : acc >= .8 ? 2 : 1;
  if (Lz.lesson) {
    const l = Lz.lesson, prev = S.done[l.id] || { stars: 0, times: 0 };
    S.done[l.id] = { stars: Math.max(prev.stars, stars), times: prev.times + 1 };
  }
  if (Lz.review) S.stats.reviews++;
  const ach = checkAch();
  const lvlAfter = levelOf(S.xp);
  save(); sfx.done();
  const goalHit = (S.daily[dayKey()] || 0) >= S.goal && (S.daily[dayKey()] || 0) - Lz.xp < S.goal;
  $('#fb').innerHTML = ''; $('#pbar').style.width = '100%'; $('#timer').hidden = true;
  const starRow = `<div class="stars" aria-label="${stars} of 3 stars">${[1, 2, 3].map(k => ICON.star.replace('<svg', `<svg class="${k <= stars ? '' : 'off'}"`)).join('')}</div>`;
  const unlocks = [
    lvlAfter > lvlBefore ? unlockRow(ICON.trophy, 'Level up', `You are now ${titleOf(lvlAfter)[1]}.`, `<span class="pill solid p-white">Level ${lvlAfter}</span>`) : '',
    goalHit ? unlockRow(ICON.flame, 'Daily goal reached', `Your streak is ${S.streak} day${S.streak === 1 ? '' : 's'}.`, `<span class="pill solid p-green">${ICON.check}Done</span>`) : '',
    ...ach.map(a => unlockRow(CODE(a.g), a.name, a.desc, '<span class="pill solid p-lime">New</span>')),
    ...GARDEN.slice(gBefore, gardenLevel()).map(g => unlockRow(g.pet ? petPic(g.pet) : ICON.sprout, g.name, `${g.desc} Balsam’s Garden is coming back to life.`, '<span class="pill solid p-lime">Garden</span>')),
  ].join('');
  const title = Lz.mock ? `Mock score ${Lz.mockPct}%` : perfect ? 'Flawless!' : acc >= .8 ? 'Lesson complete!' : 'Done, keep going!';
  $('#stage').innerHTML = `<div class="end">
    ${scene('scene-end', `${starRow}<h2 class="display">${title}</h2>`,
      `<div class="end-xp"><b class="num">+${Lz.xp}</b><span>XP earned${perfect ? ', including 15 for no mistakes' : ''}</span></div>`, rnd(80) + 10)}
    <section class="card endcard">
      <div class="srows">
        ${Lz.mock ? `<div class="srow"><span>Right first time</span><b>${Lz.firstOk} of ${Lz.mockN}</b></div>` : ''}
        <div class="srow"><span>Accuracy</span><b>${Math.round(acc * 100)}%</b></div>
        <div class="srow"><span>Best run</span><b>${Lz.maxCombo} in a row</b></div>
        <div class="srow"><span>Today</span><b>${S.daily[dayKey()] || 0} / ${S.goal} XP</b></div>
      </div>
    </section>
    ${unlocks ? `<section class="card"><div class="list-head"><h3>Unlocked</h3></div>${unlocks}</section>` : ''}
    <p class="quote">${esc(QUOTES[rnd(QUOTES.length)])}</p></div>`;
  footer('Continue', closeLesson);
  confetti();
}

/* ---------- the tutor (the site's own AI tutor, /api/tutor) ---------- */
function askTutor(st, chosen) {
  const base = st.src || st, q = base.q;
  let text;
  if (q) text = `Question (${N[base.tid].title}): ${strip(q.prompt)}\n${q.options ? 'Options: ' + q.options.map(strip).join(' | ') + `\nCorrect answer: ${strip(q.options[q.answer])}` : ''}${chosen ? `\nI chose: ${chosen}` : ''}\nThe model explanation: ${strip(q.explain || '')}`;
  else text = `Question: ${st.q || ''} ${st.prompt ? (st.prompt.term || st.prompt.text || '') : ''}\nCorrect answer: ${st.opts ? st.opts[st.a] : ''}${chosen ? `\nI chose: ${chosen}` : ''}\n${st.explain || ''}`;
  const sh = sheet(`<div class="label">Your tutor</div><h3>Why is that the answer?</h3><div class="tutor-out gsx" id="tut"><p class="hint">Thinking…</p></div>`);
  const out = $('#tut', sh);
  const system = 'You are a friendly accounting tutor for a UK university student studying financial reporting under IFRS. The student got a practice question wrong. Explain in plain English, in under 160 words, why the correct answer is right and, if they chose an answer, why theirs is wrong. Show short workings for numbers. Use £. No headings.';
  const go = async () => {
    try {
      const r = await fetch('/api/tutor', { method: 'POST', headers: { 'content-type': 'application/json', 'x-tutor-code': localStorage.getItem('gs-tutor-code') || '' }, body: JSON.stringify({ system, messages: [{ role: 'user', content: text }], fast: true }) });
      if (r.status === 401) {
        out.innerHTML = `<p>The tutor needs your passcode once.</p><div class="row"><input class="pass" id="pass" type="password" autocomplete="off" placeholder="Passcode"><button class="btn sm" id="passgo">Ask</button></div>`;
        $('#passgo', sh).onclick = () => { try { localStorage.setItem('gs-tutor-code', $('#pass', sh).value.trim()); } catch (e) { } out.innerHTML = '<p class="hint">Thinking…</p>'; go(); };
        return;
      }
      if (!r.ok || !r.body) { out.innerHTML = `<p>${r.status === 503 ? 'The tutor is not set up on this site yet.' : r.status === 429 ? 'The tutor is busy. Try again in a minute.' : 'Something went wrong. Try again in a moment.'}</p>`; return; }
      const rd = r.body.getReader(), dec = new TextDecoder(); let s = '';
      for (; ;) { const { done, value } = await rd.read(); if (done) break; s += dec.decode(value, { stream: true }); out.innerHTML = md(s); }
      if (!s.trim()) out.innerHTML = '<p>No answer came back. Try again.</p>';
    } catch (e) { out.innerHTML = '<p>You seem to be offline. The tutor needs a connection.</p>'; }
  };
  go();
}
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').split(/\n{2,}/).map(p => /^\s*[-•] /m.test(p) ? `<ul>${p.split('\n').filter(x => x.trim()).map(x => `<li>${x.replace(/^\s*[-•]\s*/, '')}</li>`).join('')}</ul>` : `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

/* ---------- small UI pieces ---------- */
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); }
function modal(html, init) {
  const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="card">${html}</div>`;
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) m.remove(); });
  document.body.appendChild(m); if (init) init(m); return m;
}
function sheet(html) {
  document.querySelectorAll('.sheet').forEach(s => s.remove());
  const s = document.createElement('div'); s.className = 'sheet'; s.innerHTML = `<div class="sheet-in" role="dialog" aria-modal="true">${html}<button class="btn ghost wide" data-close>Close</button></div>`;
  s.addEventListener('click', e => { if (e.target === s || e.target.closest('[data-close]')) s.remove(); });
  document.body.appendChild(s);
  return s;
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.sheet').forEach(s => s.remove()); });
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
  const W_ = c.width = innerWidth, H = c.height = innerHeight, x = c.getContext('2d');
  const cs = getComputedStyle(document.documentElement), cols = ['--acc', '--acc-700', '--tx', '--tx-2'].map(v => cs.getPropertyValue(v).trim());
  const P = Array.from({ length: 90 }, () => ({ x: W_ / 2 + (Math.random() - .5) * 120, y: H * .35, vx: (Math.random() - .5) * 11, vy: -Math.random() * 11 - 4, r: Math.random() * 6, s: 4 + Math.random() * 5, c: cols[rnd(cols.length)] }));
  let t = 0;
  (function f() {
    x.clearRect(0, 0, W_, H);
    P.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .32; p.vx *= .99; p.r += .1; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); x.rotate(Math.PI / 4); x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); x.restore(); });
    if (++t < 130) requestAnimationFrame(f); else c.remove();
  })();
}

/* ---------- views ---------- */
let TAB = 'learn', READING = null, WLIST = null, ONB_START = 0;
const UNIT_OPEN = {}, MORE = {};
try { const h = location.hash.slice(1); if (['learn', 'read', 'exam', 'review', 'garden', 'me'].includes(h)) TAB = h; } catch (e) { }
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const stars3 = n => `<span class="stars" aria-label="${n} of 3 stars">${[1, 2, 3].map(k => ICON.star.replace('<svg', `<svg class="${k <= n ? '' : 'off'}"`)).join('')}</span>`;
const medal = g => g === '✓' ? ICON.check : g === '★' ? ICON.star : CODE(g);
const lastDays = n => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (n - 1 - i)); return d; });
function topbar() {
  const st = liveStreak(), lvl = levelOf(S.xp);
  return `<div class="topbar-in"><div class="brand"><span class="logo">${ICON.ledger}</span><span class="bname">Goldman Snacks</span></div>
    <div class="stats"><span class="pill p-white ${st ? '' : 'cold'}" title="Day streak">${ICON.flame}<span class="num">${st}</span></span><span class="pill p-lime" title="Total XP">${ICON.bolt}<span class="num">${S.xp}</span></span><span class="pill p-grey" title="Level">Lv ${lvl}</span></div></div>`;
}
function goalCard(cls = '') {
  const today = S.daily[dayKey()] || 0, pct = Math.min(100, Math.round(100 * today / S.goal));
  return `<section class="card stack ${cls}"><div class="split"><span>Daily goal</span><span class="num">${today} / ${S.goal} XP</span></div>
    <div class="prog"><b class="pct">${pct}%</b><div class="track"><i style="width:${pct}%"></i></div></div>
    <p class="hint">${today >= S.goal ? 'Goal reached. Well done.' : `${S.goal - today} XP to go. One lesson keeps your streak alive.`}</p></section>`;
}
// Each main tab opens on a meadow: the page's heading on the sky, and on the grass a line about its work.
const SCENE_LAND = {
  learn: ['Assets = Liabilities + Equity', 'The accounting equation. Every transaction keeps it in balance.'],
  read: ['Substance over form', 'Report what a transaction really is, not only its legal form.'],
  exam: ['Show your workings', 'Method marks count even when the final figure is wrong.'],
  review: ['Every debit has a credit', 'What you practise little and often, you keep.'],
  me: ['Prudence', 'Care and caution when making judgements under uncertainty.'],
};
function scene(cls, sky, land, x = 50) {
  if (Array.isArray(land)) land = `<figure class="scene-ayah"><span class="fq">${esc(land[0])}</span><figcaption>${esc(land[1])}</figcaption></figure>`;
  return `<section class="scene ${cls}" style="--sx:${x}%"><div class="scene-sky"><div class="scene-in">${sky}</div></div><div class="scene-land"><div class="scene-in">${land}</div></div></section>`;
}
function skyBar() {
  const t = $('.topbar'), sc = $('#app > .scene'), m = $('#app > main'); if (!t) return;
  const top = !!sc && scrollY < 4, glass = !!sc && !top && !!m && m.getBoundingClientRect().top > t.offsetHeight;
  t.classList.toggle('sky', top); t.classList.toggle('glass', glass);
}
addEventListener('scroll', skyBar, { passive: true });
function liftScene(app) { const sc = app.querySelector('main .scene'); if (sc) app.querySelector('main').before(sc); skyBar(); }
function sidePanel() {
  const st = liveStreak(), due = dueKeys().length, today = dayKey();
  return `${goalCard()}
    <section class="card glow stack"><div class="list-head"><h3>Streak</h3><span class="pill p-white">${ICON.flame}Best ${S.best}</span></div>
      <div class="inner"><span class="tile">${ICON.flame}</span><b class="bignum">${st}</b><span class="cap">day${st === 1 ? '' : 's'}<br>in a row</span></div>
      <div class="weekdots">${lastDays(7).map(d => { const k = dayKey(d), on = (S.daily[k] || 0) > 0; return `<span class="${on ? 'on' : ''} ${k === today ? 'today' : ''}"><i>${on ? ICON.check : ''}</i>${'SMTWTFS'[d.getDay()]}</span>`; }).join('')}</div>
      <p class="hint">${plural(S.shields, 'streak shield')}. You earn one every 7 days, and it saves a missed day.</p></section>
    ${due ? `<section class="card stack"><div class="split"><span>Review</span><span class="num">${due} due</span></div><p class="hint">Questions and key words you met before are ready to revise.</p><button class="btn dark wide" data-go="review">Review now${ICON.chevR}</button></section>` : ''}
    ${S.exam.started ? examMini() : ''}
    ${teacher(NOTES.welcome, 'Remember')}`;
}
function viewLearn() {
  const cur = currentIndex(), cl = PATH[cur], cu = U[cl.unit], done = isComplete(cl);
  const sub = `${cu.title} · Topic ${cu.lessons.indexOf(cl) + 1} of ${cu.lessons.length}`;
  const due = dueKeys().length;
  let h = scene('scene-learn', `<span class="eyebrow">${esc(sub)}</span>
    <h1 class="display">${esc(cl.title)}</h1>
    <p>${esc(N[cl.tid].lede || cu.desc)}</p>
    <div class="scene-cta"><button class="btn lg ink" data-lesson="${cur}">${ICON.play}${done ? 'Practise again' : 'Start lesson'}</button>${due ? `<button class="btn lg white" data-go="review">Review ${due}</button>` : ''}</div>`, SCENE_LAND.learn)
    + goalCard('only-phone') + (S.exam.started ? examMini('only-phone') : '');
  const later = [];
  U.forEach((u, ui) => {
    const first = PATH.findIndex(l => l.unit === ui), locked = !isUnlocked(first);
    const n = u.lessons.length, nd = u.lessons.filter(isComplete).length, pct = Math.round(100 * nd / n), full = nd === n;
    if (locked) { later.push(`<button class="lbrow" data-unitinfo="${ui}"><span class="hs-n num">${ui + 1}</span><span class="row-main"><span class="lb-name"><b>${esc(u.title)}</b><span class="pill p-dark xs">${esc(u.tag)}</span></span><small>${plural(n, 'topic')}</small></span>${ICON.chevR}</button>`); return; }
    const open = UNIT_OPEN[ui] ?? ui === cl.unit;
    const tag = full ? `<span class="pill p-green">${ICON.check}Complete</span>` : `<span class="num">${nd}/${n} topics</span>`;
    const rows = u.lessons.map(l => {
      const i = PATH.indexOf(l), ok = isUnlocked(i), fin = isComplete(l), now = i === cur && !fin;
      return `<button class="task ${fin ? 'done' : now ? 'cur' : ok ? '' : 'locked'}" data-lesson="${i}" ${ok ? '' : 'disabled'} aria-label="${esc(l.title)}${ok ? '' : ' (locked)'}">
        <span class="check">${fin ? ICON.check : now ? ICON.play : ok ? '' : ICON.lock}</span>
        <span class="row-main"><span class="row-title">${esc(l.title)}</span></span>
        ${S.done[l.id] ? stars3(S.done[l.id].stars) : ''}${now ? '<span class="btn sm">Start</span>' : CODE(l.glyph, 'row-glyph')}</button>`;
    }).join('');
    h += `<section class="card unit ${open ? 'open' : ''}" id="u-${u.id}">
      <div class="unit-head"><div class="split"><span>Unit ${ui + 1}</span>${tag}</div>
        <div class="unit-title"><h3>${esc(u.title)}</h3><span class="pill p-dark">${esc(u.tag)}</span></div>
        ${full ? '' : `<div class="prog"><b class="pct">${pct}%</b><div class="track"><i style="width:${pct}%"></i></div></div>`}</div>
      <div class="unit-body"><div class="tasks">${rows}</div></div>
      <div class="foot"><button class="foot-tog" data-unit="${ui}" aria-expanded="${open}">${ICON.chevD}<span>${open ? 'Hide topics' : 'Show topics'}</span></button></div>
    </section>`;
  });
  if (later.length) h += `<section class="card stack"><div class="list-head"><h3>Coming up</h3><span class="pill p-dark">${ICON.lock}${plural(later.length, 'unit')}</span></div>
    <p class="hint">Each unit opens when you finish the one before it. Already know the material? Open a unit and take its test. Every topic’s notes are open in Read.</p><div class="lb later">${later.join('')}</div></section>`;
  return `<div class="page">${h}</div>`;
}

/* ---------- read: every topic's notes, the cheat sheets and the glossary ---------- */
const GLOSS = (() => {
  const m = new Map();
  DECK.forEach(d => m.set(strip(d.t).toLowerCase(), { t: strip(d.t), m: d.m, e: d.e || '', f: d.f, n: d.n }));
  Object.entries(N).forEach(([tid, n]) => n.words.forEach(w => { const k = w[0].toLowerCase(); if (!m.has(k)) m.set(k, { t: w[0], m: w[1], e: w[2], f: n.file, n: n.title, tid }); }));
  const fileTid = Object.fromEntries(Object.entries(N).map(([tid, n]) => [n.file, tid]));
  return [...m.values()].map(x => Object.assign(x, { tid: x.tid || fileTid[x.f] })).sort((a, b) => a.t.localeCompare(b.t, 'en', { sensitivity: 'base' }));
})();
function viewRead() {
  if (READING) return viewReader(READING);
  if (WLIST) return viewWords();
  const item = (tid) => { const n = N[tid], read = S.readLog[tid]; return `<button class="sitem ${read ? 'read' : ''}" data-read="${tid}"><span class="n code">${esc(codeOf(tid))}</span><span class="s-main"><span class="s-name"><b>${esc(n.title)}</b>${read ? `<span class="tick" title="Read">${ICON.check}</span>` : ''}</span><small>${esc(n.lede)}</small></span></button>`; };
  return `<div class="page">
    ${scene('', `<span class="eyebrow">${PATH.length} topics · ${SHEETS.length} cheat sheets</span><h1 class="display">Read the notes</h1><p>Every topic from Goldman Snacks: the basics, key words, the rules and a worked example.</p>`, SCENE_LAND.read, 22)}
    <section class="card stack words-card"><div class="list-head"><h3>Every key term</h3><span class="pill p-lime">${GLOSS.length}</span></div>
      <p class="hint">Look up any term and what it means, with an example and the topic it comes from.</p>
      <button class="btn wide" data-words>${ICON.search}Open the glossary</button></section>
    <section class="card ${MORE.sheets ? 'more-open' : ''}"><div class="list-head"><h3>Cheat sheets</h3><span class="pill p-lime">${SHEETS.length}</span></div>
      <div class="slist cols">${SHEETS.map((s, i) => `<button class="sitem ${i >= 6 ? 'extra' : ''}" data-sheet="${esc(s.id)}"><span class="n">${ICON.book}</span><span class="s-main"><span class="s-name"><b>${esc(s.title)}</b></span></span></button>`).join('')}</div>
      <div class="foot"><button class="foot-tog" data-more="sheets" data-label="Show all ${SHEETS.length}" aria-expanded="${!!MORE.sheets}">${ICON.chevD}<span>${MORE.sheets ? 'Show less' : `Show all ${SHEETS.length}`}</span></button></div></section>
    ${U.map(u => `<section class="card"><div class="list-head"><h3>${esc(u.title)}</h3><span class="pill p-dark">${esc(u.tag)}</span></div><div class="slist cols">${u.lessons.map(l => item(l.tid)).join('')}</div></section>`).join('')}</div>`;
}
function viewReader(id) {
  if (id.startsWith('sheet:')) {
    const s = SHEETS.find(x => x.id === id.slice(6)) || SHEETS[0];
    return `<div class="page">
      ${scene('scene-reader', `<button class="btn sm back" data-back>${ICON.chevL}All notes</button><span class="eyebrow">Cheat sheet</span><h1 class="display">${esc(s.title)}</h1>`, `<div class="scene-name">${ICON.book}</div>`, 40)}
      <section class="cs-sheet">${s.html.replace(/<a [^>]*>(.*?)<\/a>/g, '$1').replace(/(<svg class="cs-svg"[\s\S]*?<\/svg>)/g, '<div class="cs-scroll">$1</div>')}</section></div>`;
  }
  const n = N[id], read = S.readLog[id] === dayKey(), i = PATH.findIndex(l => l.tid === id);
  return `<div class="page">
    ${scene('scene-reader', `<button class="btn sm back" data-back>${ICON.chevL}${WLIST ? 'Glossary' : 'All notes'}</button>
      <span class="eyebrow">${esc(n.where)}</span><h1 class="display">${esc(n.title)}</h1><p>${esc(n.lede)}</p>`, `<div class="scene-name">${esc(codeOf(id))}</div>`, 30 + (i * 37) % 45)}
    <section class="card gsx notes"><h3>New to this topic?</h3>${n.basics}</section>
    ${n.words.length ? `<section class="card gsx notes"><h3>Key words</h3><div class="kw">${n.words.map(w => `<div class="kw-i"><b>${esc(w[0])}</b><p>${w[1]}</p>${w[2] ? `<small><b>Example:</b> ${w[2]}</small>` : ''}</div>`).join('')}</div></section>` : ''}
    <section class="card gsx notes"><h3>Learn</h3>${n.learn.map(([h, html]) => `${h ? `<h4>${esc(h)}</h4>` : ''}${html}`).join('')}</section>
    ${n.example ? `<section class="card gsx notes"><h3>Worked example</h3>${n.example}</section>` : ''}
    <div class="btn-row"><button class="btn lg dark" data-practise="${id}">Practise</button><button class="btn lg ${read ? 'dark' : ''}" data-markread="${id}">${read ? `${ICON.check}Read today` : 'I read this · +10 XP'}</button></div>
    <p class="fine">From the ${esc(n.title)} page on Goldman Snacks.</p></div>`;
}
const WLIST_PAGE = 100;
const normT = t => t.toLowerCase().replace(/[^a-z0-9% ]/g, ' ').replace(/\s+/g, ' ').trim();
function searchWords(q) {
  q = normT(q); if (!q) return GLOSS;
  const a = [], b = [];
  GLOSS.forEach(g => { const t = normT(g.t); if (t.startsWith(q)) a.push(g); else if (t.includes(q) || normT(strip(g.m)).includes(q)) b.push(g); });
  return a.concat(b);
}
function viewWords() {
  return `<div class="page">
    ${scene('scene-sm', `<button class="btn sm back" data-wordsback>${ICON.chevL}All notes</button><span class="eyebrow">${GLOSS.length} terms</span><h1 class="display">Glossary</h1>`, SCENE_LAND.read, 60)}
    <section class="card stack"><label class="wsearch">${ICON.search}<input id="wq" type="search" placeholder="Search a term or meaning" value="${esc(WLIST.q)}" autocomplete="off"></label><div id="wlist">${wordListHTML()}</div></section></div>`;
}
function wordListHTML() {
  const list = searchWords(WLIST.q), show = list.slice(0, WLIST.n);
  return `<div class="slist">${show.map(g => `<button class="sitem witem" data-term="${esc(g.t)}"><span class="s-main"><span class="s-name"><b>${esc(g.t)}</b></span><small>${esc(shortDef(g.m))}</small></span>${ICON.chevR}</button>`).join('') || '<p class="hint">Nothing matches that. Try a shorter word.</p>'}</div>
    ${list.length > show.length ? `<button class="btn ghost wide" id="wmore">Show more (${list.length - show.length} left)</button>` : ''}`;
}
function wireWords(app) {
  const inp = $('#wq', app); if (!inp) return;
  const draw = () => { $('#wlist', app).innerHTML = wordListHTML(); wireTerms(app); const m = $('#wmore', app); if (m) m.onclick = () => { WLIST.n += WLIST_PAGE; draw(); }; };
  inp.oninput = () => { WLIST.q = inp.value; WLIST.n = WLIST_PAGE; draw(); };
  draw();
}
function wireTerms(root) {
  root.querySelectorAll('[data-term]').forEach(b => b.onclick = () => {
    const g = GLOSS.find(x => x.t === b.dataset.term); if (!g) return;
    const sh = sheet(`<div class="label">${esc(g.n || 'Glossary')}</div><h3>${esc(g.t)}</h3><div class="gsx"><p>${g.m}</p>${g.e ? `<p class="eg-line"><b>Example:</b> ${g.e}</p>` : ''}</div>${g.tid && N[g.tid] ? `<button class="btn wide" data-readtopic="${g.tid}">${ICON.book}Read the notes</button>` : ''}`);
    const r = sh.querySelector('[data-readtopic]'); if (r) r.onclick = () => { sh.remove(); WLIST.y = scrollY; READING = r.dataset.readtopic; render(); scrollTo(0, 0); };
  });
}

/* ---------- exam ---------- */
const EXAM_TIPS = [
  'Read the requirement first, then the scenario. You will know what to look for.',
  'Write the standard’s name and number in your answer. It shows the marker you know where the rule comes from.',
  'Set out workings in a table. A marker can give method marks only for what they can follow.',
  'Spend time in proportion to the marks: about 1.2 minutes a mark in a 2-hour, 100-mark test.',
  'For a discussion question, give both sides and then a conclusion.',
  'If you get stuck on a number, make a sensible assumption, state it, and move on.',
  'Check every journal balances, and every statement adds up, before you move on.',
];
const examTopics = () => S.exam.topics.filter(has);
function mastery(tid) {
  const t = S.tstats[tid];
  if (!t || !t.a) return S.done[tid] ? 25 : 0;
  return Math.round(100 * Math.min(1, (S.done[tid] ? .25 : 0) + .75 * (t.c / t.a) * Math.min(1, t.a / 12)));
}
const readiness = () => { const ts = examTopics(); return ts.length ? Math.round(ts.reduce((s, t) => s + mastery(t), 0) / ts.length) : 0; };
const daysLeft = () => dayDiff(dayKey(), S.exam.date);
const fmtDate = d => new Date(d + 'T12:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const nextExamTopic = () => examTopics().find(t => !S.done[t]) || examTopics().slice().sort((a, b) => mastery(a) - mastery(b))[0];
function examMini(cls = '') {
  const d = daysLeft();
  return `<section class="card stack ${cls}"><div class="split"><span>${esc(S.exam.name)}</span><span class="num">${d > 0 ? `${plural(d, 'day')} to go` : d === 0 ? 'Today' : 'Finished'}</span></div>
    <div class="prog"><b class="pct">${readiness()}%</b><div class="track"><i style="width:${readiness()}%"></i></div></div>
    <p class="hint">How ready you are across the ${plural(examTopics().length, 'exam topic')}.</p><button class="btn dark wide" data-go="exam">Exam plan${ICON.chevR}</button></section>`;
}
function viewExam() {
  const E = S.exam;
  if (!E.started) return `<div class="page">
    ${scene('', `<span class="eyebrow">${ICON.target}Exam</span><h1 class="display">Get ready for your exam</h1><p>Pick the date and the topics. Each day you learn a topic, review what is due, and take a short mock.</p>`, SCENE_LAND.exam, 70)}
    ${teacher('Start early and go steadily. Ten focused minutes a day for a few weeks beats one long night before the test.', 'Your tutor')}
    <section class="card stack"><h3>Your exam</h3>
      <label class="fld"><span>Name</span><input id="exname" type="text" value="${esc(E.name)}" autocomplete="off"></label>
      <label class="fld"><span>Date</span><input id="exdate" type="date" value="${esc(E.date)}"></label></section>
    ${examTopicPicker()}
    <button class="btn lg wide" data-exstart ${examTopics().length ? '' : 'disabled'}>Start preparing${ICON.chevR}</button></div>`;
  const ts = examTopics(), d = daysLeft(), due = dueKeys().length, nt = nextExamTopic(), today = E.days[dayKey()] || {};
  const learned = ts.filter(t => S.done[t]).length, stat = ts.reduce((a, t) => { const x = S.tstats[t]; if (x) { a.a += x.a; a.c += x.c; } return a; }, { a: 0, c: 0 });
  const best = E.mocks.length ? Math.max(...E.mocks.map(m => m.pct)) : null;
  const parts = [!!today.learn, !due, !!today.mock], nDone = parts.filter(Boolean).length;
  const trow = (attr, n, title, sub, done, on) => `<button class="task ${done ? 'done' : ''}" ${attr} ${on ? '' : 'disabled'}><span class="check">${done ? ICON.check : `<span class="code">${n}</span>`}</span><span class="row-main"><span class="row-title">${title}</span><small>${sub}</small></span>${on ? ICON.chevR : ''}</button>`;
  return `<div class="page">
    ${scene('scene-sm', `<span class="eyebrow">${ICON.target}Exam · ${fmtDate(E.date)}</span><h1 class="display">${esc(E.name)}</h1>`, SCENE_LAND.exam, 70)}
    <section class="card stack balance open">
      <div class="bl-head"><div class="bl-main"><span class="label">${d >= 0 ? 'Days to go' : 'Exam date passed'}</span><b class="bignum">${Math.max(d, 0)}<small> ${d === 1 ? 'day' : 'days'}</small></b></div><span class="pill ${readiness() >= 70 ? 'p-lime' : 'p-white'}"><i class="dot"></i>${readiness()}% ready</span></div>
      <div class="track"><i style="width:${Math.max(readiness(), 1)}%"></i></div>
      <div class="srows ruled"><div class="srow"><span>Topics learned</span><b>${learned} of ${ts.length}</b></div><div class="srow"><span>Accuracy on exam topics</span><b>${stat.a ? Math.round(100 * stat.c / stat.a) + '%' : '–'}</b></div><div class="srow"><span>Mock tests taken</span><b>${E.mocks.length}</b></div><div class="srow"><span>Best mock</span><b>${best == null ? '–' : best + '%'}</b></div></div>
      <div class="btn-row"><button class="btn lg dark" data-go="review" ${due ? '' : 'disabled'}>Review${due ? ` ${due}` : ''}</button><button class="btn lg" data-mock>Mock test</button></div>
    </section>
    <section class="card stack"><div class="split"><span>Today</span><span class="num">${nDone}/3 done</span></div>
      <div class="prog"><b class="pct">${Math.round(100 * nDone / 3)}%</b><div class="track"><i style="width:${100 * nDone / 3}%"></i></div></div>
      <div class="tasks ruled">
        ${trow(`data-extopic="${nt || ''}"`, '1', S.done[nt] ? 'Strengthen a topic' : 'Learn a topic', nt ? esc(N[nt].title) : 'Pick some topics below', parts[0], !!nt)}
        ${trow('data-go="review"', '2', 'Review', due ? `${plural(due, 'item')} due` : 'All caught up', parts[1], due > 0)}
        ${trow('data-mock', '3', 'Mock test', `${E.n} questions${E.mins ? `, ${E.mins} minutes` : ''}`, parts[2], true)}
      </div></section>
    ${teacher(EXAM_TIPS[new Date().getDate() % EXAM_TIPS.length], 'Exam tip of the day')}
    <section class="card"><div class="list-head"><h3>Your exam topics</h3><span class="pill p-dark">${learned} of ${ts.length}</span></div>
      <p class="hint" style="margin-top:8px">Each tile fills as you get questions right. Tap one to practise it.</p>
      <div class="juzgrid topics">${ts.map(t => { const v = mastery(t); return `<button class="juz ${v >= 90 ? 'full' : ''}" data-extopic="${t}" style="--p:${v}%" aria-label="${esc(N[t].title)}, ${v}%"><span class="code">${esc(codeOf(t))}</span><small>${v}%</small></button>`; }).join('')}</div></section>
    ${E.mocks.length ? `<section class="card"><div class="list-head"><h3>Mock results</h3><span class="pill p-dark">${E.mocks.length}</span></div><div class="lb">${E.mocks.slice(-5).reverse().map(m => `<div class="lbrow"><span class="hs-n num ${m.pct >= 80 ? 'full' : ''}" style="--p:${m.pct}%">${m.pct}</span><span class="row-main"><b>${m.ok} of ${m.n} right first time</b><small>${fmtDate(m.d)}${m.mins ? ` · ${m.mins} minutes` : ''}</small></span></div>`).join('')}</div></section>` : ''}
    <section class="card"><h3>Mock test settings</h3>
      <div class="set"><span>Questions</span><div class="seg">${[10, 20, 30].map(n => `<button class="tog" aria-pressed="${E.n === n}" data-exn="${n}">${n}</button>`).join('')}</div></div>
      <div class="set"><span>Time limit</span><div class="seg">${[[0, 'None'], [15, '15 min'], [30, '30 min'], [60, '1 hour'], [120, '2 hours']].map(([m, l]) => `<button class="tog" aria-pressed="${E.mins === m}" data-exmins="${m}">${l}</button>`).join('')}</div></div>
      <div class="set"><span>Exam date and topics</span><button class="btn sm ghost" data-exedit>Change</button></div>
    </section></div>`;
}
function examTopicPicker() {
  const sel = new Set(S.exam.topics);
  return `<section class="card stack"><div class="list-head"><h3>Topics in this exam</h3><span class="pill p-lime">${sel.size}</span></div>
    <p class="hint">Tap to add or remove. Start with what your module covers; you can change this later.</p>
    ${U.map((u, ui) => `<div class="pickunit"><div class="split"><span>${esc(u.title)}</span><button class="linkbtn" data-exall="${ui}">${u.lessons.every(l => sel.has(l.tid)) ? 'None' : 'All'}</button></div><div class="seg">${u.lessons.map(l => `<button class="tog" aria-pressed="${sel.has(l.tid)}" data-extog="${l.tid}" title="${esc(l.title)}">${esc(shortTitle(l.title))}</button>`).join('')}</div></div>`).join('')}</section>`;
}
const shortTitle = t => t.replace(/^(IAS|IFRS) ([\d]+)( and IFRS \d+| and IFRS 18)?: .*$/, (m, a, b, c) => `${a} ${b}${c ? c.replace(' and ', ' & ') : ''}`).replace(/^Statement of /, '').replace(/^(Audit|Finance team|Tax): /, '');
function startMock() {
  const E = S.exam, ts = examTopics(); if (!ts.length) return toast('Pick some exam topics first');
  const steps = [], used = new Set();
  for (let k = 0; k < E.n * 4 && steps.length < E.n; k++) {
    const t = ts[k % ts.length === 0 ? rnd(ts.length) : rnd(ts.length)], pi = rnd(T[t].practice.length), id = t + ':' + pi;
    if (used.has(id) && k < E.n * 3) continue; used.add(id); steps.push(qSite(t, pi));
  }
  startLesson({
    steps: [tCard('Mock test', `<div class="row"><span class="pill p-dark">${E.n} questions</span><span class="pill p-dark">${E.mins ? E.mins + ' minutes' : 'No time limit'}</span><span class="pill p-dark">${plural(ts.length, 'topic')}</span></div>`, teacher('Answer each question once, as you would in the exam. Your score is how many you get right first time. You see the answer after each one.', 'How it works'))].concat(shuffle(steps)),
    mock: true, noRetry: true, mins: E.mins, mockN: steps.length,
    onDone: () => {
      const pct = steps.length ? Math.round(100 * LESSON.firstOk / steps.length) : 0;
      LESSON.mockPct = pct; E.mocks.push({ d: dayKey(), n: steps.length, ok: LESSON.firstOk, pct, mins: E.mins });
      S.stats.mocks++; S.stats.bestMock = Math.max(S.stats.bestMock, pct);
      (E.days[dayKey()] = E.days[dayKey()] || {}).mock = 1;
    },
  });
}
function openExamTopic(tid) {
  const i = PATH.findIndex(l => l.tid === tid); if (i < 0) return;
  const l = PATH[i], learning = !S.done[tid];
  startLesson({ steps: learning ? l.build() : practiceOnly(tid), lesson: learning ? l : null, onDone: () => { (S.exam.days[dayKey()] = S.exam.days[dayKey()] || {}).learn = 1; } });
}
function wireExam(app) {
  const E = S.exam;
  const nm = $('#exname', app); if (nm) nm.onchange = () => { E.name = nm.value.trim() || 'My exam'; save(); };
  const dt = $('#exdate', app); if (dt) dt.onchange = () => { if (dt.value) { E.date = dt.value; save(); } };
  app.querySelectorAll('[data-extog]').forEach(b => b.onclick = () => { const t = b.dataset.extog, i = E.topics.indexOf(t); if (i < 0) E.topics.push(t); else E.topics.splice(i, 1); save(); const y = scrollY; render(); scrollTo(0, y); });
  app.querySelectorAll('[data-exall]').forEach(b => b.onclick = () => { const ids = U[+b.dataset.exall].lessons.map(l => l.tid), all = ids.every(t => E.topics.includes(t)); E.topics = all ? E.topics.filter(t => !ids.includes(t)) : uniq([...E.topics, ...ids]); save(); const y = scrollY; render(); scrollTo(0, y); });
  app.querySelectorAll('[data-exstart]').forEach(b => b.onclick = () => { if (nm) E.name = nm.value.trim() || 'My exam'; if (dt && dt.value) E.date = dt.value; E.started = true; save(); render(); scrollTo(0, 0); });
  app.querySelectorAll('[data-exedit]').forEach(b => b.onclick = () => { E.started = false; save(); render(); scrollTo(0, 0); });
  app.querySelectorAll('[data-exn]').forEach(b => b.onclick = () => { E.n = +b.dataset.exn; save(); render(); });
  app.querySelectorAll('[data-exmins]').forEach(b => b.onclick = () => { E.mins = +b.dataset.exmins; save(); render(); });
  app.querySelectorAll('[data-mock]').forEach(b => b.onclick = startMock);
  app.querySelectorAll('[data-extopic]').forEach(b => b.onclick = () => b.dataset.extopic && openExamTopic(b.dataset.extopic));
}

/* ---------- review and profile ---------- */
function viewReview() {
  const due = dueKeys().length, total = Object.keys(S.srs).filter(fromKeyOk).length, weak = Object.entries(S.srs).filter(([k, v]) => v.b <= 1 && fromKeyOk(k)).length;
  const qp = [['terms', 'Aa', 'Key terms', 'Meanings from the glossary'], ['double', 'Dr Cr', 'Double entry', 'Journals, debits and credits, the trial balance'], ['mixed', 'Mix', 'Mixed questions', 'From the topics you have finished']];
  return `<div class="page">
    ${scene('scene-sm', `<span class="eyebrow">Spaced repetition</span><h1 class="display">Review</h1><p>Questions you miss come back sooner; ones you know come back later, with new numbers.</p>`, SCENE_LAND.review, 8)}
    <section class="card stack balance">
      <div class="bl-head"><div class="bl-main"><span class="label">Due now</span><b class="bignum">${due}<small> ${due === 1 ? 'item' : 'items'}</small></b></div><span class="pill ${due ? 'p-white' : 'p-lime'}"><i class="dot"></i>${due ? 'Ready to review' : 'All caught up'}</span></div>
      <div class="srows ruled"><div class="srow"><span>Needs work</span><b>${weak}</b></div><div class="srow"><span>Items learned</span><b>${total}</b></div><div class="srow"><span>Review sessions finished</span><b>${S.stats.reviews}</b></div></div>
      ${total ? `<button class="btn lg wide" data-review>${due ? `Review ${Math.min(12, due)} items` : 'Practise anyway'}${ICON.chevR}</button>` : teacher('Finish a lesson or two and the questions and key words you meet will appear here for review.')}
    </section>
    <section class="card"><h3>Quick practice</h3><div class="tasks">${qp.map(([k, g, t, d]) => `<button class="task" data-quick="${k}"><span class="tile dark">${CODE(g)}</span><span class="row-main"><span class="row-title">${t}</span><small>${d}</small></span>${ICON.chevR}</button>`).join('')}</div></section></div>`;
}
function viewMe() {
  const lvl = levelOf(S.xp), t = titleOf(lvl), a = levelStart(lvl), b = levelStart(lvl + 1), nextT = TITLES.find(x => x[0] > lvl);
  const days = lastDays(7), vals = days.map(d => S.daily[dayKey(d)] || 0), mx = Math.max(S.goal, ...vals) * 1.1;
  const acc = S.stats.answered ? Math.round(100 * S.stats.correct / S.stats.answered) : 0;
  const got = Object.keys(S.ach).filter(k => ACH.some(x => x[0] === k)).length;
  const ach = ACH.map(([id, name, desc, g]) => ({ id, name, desc, g, on: !!S.ach[id] })).sort((x, y) => y.on - x.on);
  const when = v => v > 1e12 ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Earned';
  const nums = [['Current streak', plural(liveStreak(), 'day')], ['Best streak', plural(S.best, 'day')], ['Lessons finished', S.stats.lessons], ['Topics complete', `${PATH.filter(isComplete).length} of ${PATH.length}`], ['Accuracy', acc + '%'], ['Best run', `${S.stats.maxCombo} in a row`], ['Notes read', Object.keys(S.readLog).length]];
  return `<div class="page">
    ${scene('scene-sm', `<span class="eyebrow">Profile</span><h1 class="display">Your progress</h1>`, SCENE_LAND.me, 92)}
    <section class="card glow stack lvlcard">
      <div class="list-head"><h3>Level ${lvl}</h3><span class="pill p-lime">${t[1]}</span></div>
      <div class="inner"><span class="tile">${ICON.trophy}</span><b class="bignum">${S.xp.toLocaleString('en')}</b><span class="cap">XP earned<br>${plural(S.stats.lessons, 'lesson')} finished</span></div>
      <div class="track"><i style="width:${100 * (S.xp - a) / (b - a)}%"></i></div>
      <div class="split"><span>${b - S.xp} XP to level ${lvl + 1}</span>${nextT ? `<span>${nextT[1]} at level ${nextT[0]}</span>` : ''}</div>
    </section>
    <div class="grid2">
      <section class="card"><div class="split"><span>This week</span><span class="num">${vals.reduce((x, y) => x + y, 0)} XP</span></div>
        <div class="week"><div class="goal-line" style="bottom:${24 + 90 * S.goal / mx}px"></div>${days.map((d, i) => `<div class="day ${dayKey(d) === dayKey() ? 'today' : ''} ${vals[i] ? '' : 'zero'}"><span class="v num">${vals[i] || ''}</span><i style="height:${Math.max(4, 90 * vals[i] / mx)}px"></i><span>${'SMTWTFS'[d.getDay()]}</span></div>`).join('')}</div>
        <div class="week-key"><i></i>Daily goal, ${S.goal} XP</div></section>
      <section class="card"><h3>Your numbers</h3><div class="srows">${nums.map(([k, v]) => `<div class="srow"><span>${k}</span><b>${v}</b></div>`).join('')}</div></section>
    </div>
    <section class="card ${MORE.ach ? 'more-open' : ''}"><div class="list-head"><h3>Achievements</h3><span class="pill p-lime">${got} of ${ACH.length}</span></div>
      <div class="lb">${ach.map((a, i) => `<div class="lbrow ${a.on ? '' : 'off'} ${i >= 6 ? 'extra' : ''}"><span class="medal">${medal(a.g)}</span><span class="row-main"><span class="lb-name"><b>${esc(a.name)}</b>${a.on ? `<span class="tick">${ICON.check}</span>` : ''}</span><small>${esc(a.desc)}</small></span><span class="lb-v">${a.on ? when(S.ach[a.id]) : ICON.lock}</span></div>`).join('')}</div>
      <div class="foot"><button class="foot-tog" data-more="ach" data-label="Show all ${ach.length}" aria-expanded="${!!MORE.ach}">${ICON.chevD}<span>${MORE.ach ? 'Show less' : `Show all ${ach.length}`}</span></button></div></section>
    <section class="card"><h3>Settings</h3>
      <div class="set"><span>Daily goal</span><div class="seg">${[20, 50, 100, 150].map(g => `<button class="tog" aria-pressed="${S.goal === g}" data-goal="${g}">${g} XP</button>`).join('')}</div></div>
      <div class="set"><span>Sound effects</span><button class="switch" role="switch" aria-checked="${S.settings.sound}" aria-label="Sound effects" data-set="sound"><i></i></button></div>
      <div class="set"><span>Progress</span><span class="pill p-dark"><i class="dot"></i>Saved on this device</span></div>
      <div class="set"><span>Start over</span><button class="btn sm ghost" data-reset>Reset progress</button></div>
    </section>
    <section class="card stack"><h3>Move your progress</h3>
      <p class="hint">Copy a code here, then paste it into Goldman Snacks on another device, such as the app on your phone’s Home Screen. Your XP, streak, exam plan and garden come with it.</p>
      <div class="btn-row"><button class="btn sm dark" data-xfer="copy">Copy progress code</button><button class="btn sm ghost" data-xfer="paste">Paste a code</button></div></section>
    <section class="card stack"><h3>About</h3><p class="body">Every lesson, question, key word and cheat sheet here comes from the Goldman Snacks website, so the app and the site always teach the same thing. Questions with numbers change every time you see them.</p><p class="fine">Install it on an iPhone: open this page in Safari, tap Share, then Add to Home Screen. After the first launch it works offline, except the tutor.</p><a class="link" href="../index.html">Open the full website${ICON.chevR}</a></section></div>`;
}
function viewOnboard() {
  const starts = [["I’m new to accounting", 'Start from the accounting equation.'], ['I know double entry', 'Take a short test to skip to financial statements.'], ['I’m studying IFRS (Year 3)', 'Take a test to skip to the IFRS standards.']];
  return `<div class="onb">
    ${scene('scene-onb', `<div class="onb-mark">${ICON.ledger}</div><h1 class="display">Welcome. Let’s learn accounting, one short lesson a day.</h1><p>From double entry to group accounts and every IFRS, with an exam plan and a garden that grows as you learn.</p>`, SCENE_LAND.learn)}
    ${teacher(NOTES.welcome, 'Before we begin')}
    <section class="card"><h3>Where are you starting?</h3><div class="choice" id="lvl">${starts.map(([a, b], i) => `<button class="task" aria-pressed="${i === ONB_START}" data-start="${i}"><span class="check">${ICON.check}</span><span class="row-main"><span class="row-title">${a}</span><small>${b}</small></span></button>`).join('')}</div></section>
    <section class="card"><h3>Daily goal</h3><div class="seg">${[20, 50, 100, 150].map(g => `<button class="tog" aria-pressed="${S.goal === g}" data-goal="${g}">${g} XP · ${{ 20: 'Casual', 50: 'Regular', 100: 'Serious', 150: 'Intense' }[g]}</button>`).join('')}</div></section>
    <button class="btn lg wide" id="begin">Let’s begin${ICON.chevR}</button></div>`;
}

function render() {
  const app = $('#app');
  if (!S.onboarded) {
    app.innerHTML = `<header class="topbar">${topbar()}</header><main><div class="col">${viewOnboard()}</div></main>`; liftScene(app);
    app.querySelectorAll('[data-start]').forEach(b => b.onclick = () => { ONB_START = +b.dataset.start; app.querySelectorAll('[data-start]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    $('#begin').onclick = () => {
      S.onboarded = true; save();
      if (ONB_START === 0) { render(); startLesson({ steps: PATH[0].build(), lesson: PATH[0] }); }
      else testOut(U.findIndex(u => u.id === (ONB_START === 1 ? 'fs' : 'frame')));
    };
    wireCommon(app); return;
  }
  const side = TAB === 'learn' && !READING;
  const tabs = [['learn', 'Learn', ICON.path], ['read', 'Read', ICON.book], ['exam', 'Exam', ICON.target], ['review', 'Review', ICON.repeat], ['garden', 'Garden', ICON.sprout], ['me', 'Profile', ICON.user]];
  if ((TAB === 'garden' && (S.gardenSeen || 0) !== gardenLevel()) || (S.gardenSeen || 0) > gardenLevel()) { S.gardenSeen = gardenLevel(); save(); }
  const count = { review: dueKeys().length, garden: Math.max(0, gardenLevel() - (S.gardenSeen || 0)) };
  app.innerHTML = `<header class="topbar">${topbar()}</header><main class="${side ? 'has-side' : ''}"><div class="col ${TAB}${READING ? ' reading' : ''}">${TAB === 'learn' ? viewLearn() : TAB === 'read' ? viewRead() : TAB === 'exam' ? viewExam() : TAB === 'review' ? viewReview() : TAB === 'garden' ? viewGarden() : viewMe()}</div>${side ? `<aside class="side">${sidePanel()}</aside>` : ''}</main>
    <nav class="tabbar"><div class="tabbar-in">${tabs.map(([k, n, ic]) => `<button class="tab" data-tab="${k}" ${TAB === k ? 'aria-current="page"' : ''}><span class="ti">${ic}</span><span class="tn">${n}</span>${count[k] ? `<span class="badge">${count[k] > 99 ? '99+' : count[k]}</span>` : ''}</button>`).join('')}</div></nav>`;
  liftScene(app); wireCommon(app);
  if (TAB === 'read' && WLIST && !READING) wireWords(app);
  if (TAB === 'exam') wireExam(app);
}
function wireCommon(app) {
  app.querySelectorAll('[data-tab],[data-go]').forEach(b => b.onclick = () => { TAB = b.dataset.tab || b.dataset.go; READING = null; WLIST = null; render(); scrollTo(0, 0); });
  app.querySelectorAll('[data-lesson]').forEach(b => b.onclick = () => openLesson(+b.dataset.lesson));
  app.querySelectorAll('[data-testout]').forEach(b => b.onclick = () => testOut(+b.dataset.testout));
  app.querySelectorAll('[data-unitinfo]').forEach(b => b.onclick = () => {
    const ui = +b.dataset.unitinfo, u = U[ui];
    const sh = sheet(`<div class="label">Unit ${ui + 1} · ${plural(u.lessons.length, 'topic')}</div><h3>${esc(u.title)}</h3><p>${esc(u.desc)}</p>
      <button class="btn lg wide" data-testout="${ui}">Test out to unlock${ICON.chevR}</button>
      <div class="label sheet-sub">In this unit</div><div class="tasks">${u.lessons.map(l => `<button class="task locked" data-readtopic="${l.tid}"><span class="check">${ICON.lock}</span><span class="row-main"><span class="row-title">${esc(l.title)}</span><small>Read the notes</small></span>${CODE(l.glyph, 'row-glyph')}</button>`).join('')}</div>`);
    sh.querySelector('[data-testout]').onclick = () => { sh.remove(); testOut(ui); };
    sh.querySelectorAll('[data-readtopic]').forEach(x => x.onclick = () => { sh.remove(); TAB = 'read'; READING = x.dataset.readtopic; render(); scrollTo(0, 0); });
  });
  app.querySelectorAll('[data-unit]').forEach(b => b.onclick = () => {
    const sec = b.closest('.unit'), open = !sec.classList.contains('open');
    UNIT_OPEN[+b.dataset.unit] = open; sec.classList.toggle('open', open); b.setAttribute('aria-expanded', open); b.querySelector('span').textContent = open ? 'Hide topics' : 'Show topics';
  });
  app.querySelectorAll('[data-more]').forEach(b => b.onclick = () => {
    const k = b.dataset.more; MORE[k] = !MORE[k];
    b.closest('.card').classList.toggle('more-open', MORE[k]); b.setAttribute('aria-expanded', MORE[k]); b.querySelector('span').textContent = MORE[k] ? 'Show less' : b.dataset.label;
  });
  app.querySelectorAll('[data-read]').forEach(b => b.onclick = () => { READING = b.dataset.read; render(); scrollTo(0, 0); });
  app.querySelectorAll('[data-sheet]').forEach(b => b.onclick = () => { READING = 'sheet:' + b.dataset.sheet; render(); scrollTo(0, 0); });
  app.querySelectorAll('[data-back]').forEach(b => b.onclick = () => { READING = null; render(); scrollTo(0, WLIST ? WLIST.y || 0 : 0); });
  app.querySelectorAll('[data-words]').forEach(b => b.onclick = () => { WLIST = { q: '', n: WLIST_PAGE }; render(); scrollTo(0, 0); });
  app.querySelectorAll('[data-wordsback]').forEach(b => b.onclick = () => { WLIST = null; render(); scrollTo(0, 0); });
  app.querySelectorAll('[data-set]').forEach(b => b.onclick = () => { const k = b.dataset.set; S.settings[k] = !S.settings[k]; save(); render(); });
  app.querySelectorAll('[data-goal]').forEach(b => b.onclick = () => { S.goal = +b.dataset.goal; save(); render(); });
  app.querySelectorAll('[data-practise]').forEach(b => b.onclick = () => openExamTopic(b.dataset.practise));
  app.querySelectorAll('[data-markread]').forEach(b => b.onclick = () => {
    const id = b.dataset.markread; if (S.readLog[id] === dayKey()) return;
    const g0 = gardenLevel(); S.readLog[id] = dayKey(); addXP(10); checkAch(); save(); sfx.done(); confetti();
    const g1 = gardenLevel(); toast(`+10 XP · ${N[id].title}${g1 > g0 ? ` · Garden: ${GARDEN[g1 - 1].name}` : ''}`); render();
  });
  app.querySelectorAll('[data-review]').forEach(b => b.onclick = () => startLesson({ steps: reviewSteps(), review: true }));
  app.querySelectorAll('[data-quick]').forEach(b => b.onclick = () => {
    const k = b.dataset.quick;
    let steps;
    if (k === 'terms') steps = pick(DECK, 10).map(d => qDeck(d.t, Math.random() < .4));
    else if (k === 'double') steps = pick(['dcrules', 'journals', 'taccounts', 'tb', 'equation'].filter(has).flatMap(t => T[t].practice.map((_, i) => qSite(t, i))), 8);
    else { const done = PATH.filter(isComplete).map(l => l.tid); steps = pick((done.length ? done : [PATH[0].tid]).flatMap(t => T[t].practice.map((_, i) => qSite(t, i))), 10); }
    startLesson({ steps });
  });
  wireTerms(app);
  app.querySelectorAll('[data-xfer="copy"]').forEach(b => b.onclick = () => {
    const code = progressCode();
    const show = () => modal(`<h3>Your progress code</h3><p>Select all of it and copy it, then paste it into Goldman Snacks on your other device.</p><textarea class="code-box" readonly>${esc(code)}</textarea><div class="row"><button class="btn" data-close>Done</button></div>`, m => { const t = $('.code-box', m); t.focus(); t.select(); });
    try { navigator.clipboard.writeText(code).then(() => toast('Progress code copied. Paste it into the app on your other device.'), show); } catch (e) { show(); }
  });
  app.querySelectorAll('[data-xfer="paste"]').forEach(b => b.onclick = () => modal(`<h3>Paste a progress code</h3><p>Paste the code you copied from Goldman Snacks on your other device.</p><textarea class="code-box" id="codein" placeholder="GSAPP1:…" autocapitalize="off" autocomplete="off" spellcheck="false"></textarea><p class="code-err" id="codeerr" hidden></p><div class="row"><button class="btn ghost" data-close>Cancel</button><button class="btn" id="codego">Continue</button></div>`, m => {
    $('#codego', m).onclick = () => {
      const d = readProgressCode($('#codein', m).value), err = $('#codeerr', m);
      if (!d) { err.textContent = 'That isn’t a whole Goldman Snacks progress code. Copy all of it and try again.'; err.hidden = false; return; }
      $('.card', m).innerHTML = `<h3>Replace the progress here?</h3><p>The code has ${d.xp.toLocaleString('en')} XP. This device has ${S.xp.toLocaleString('en')} XP, which will be replaced.</p><div class="row"><button class="btn ghost" data-close>Cancel</button><button class="btn" id="codeok">Replace</button></div>`;
      $('#codeok', m).onclick = () => { mergeState(d); save(); m.remove(); render(); toast(`Progress loaded: ${S.xp.toLocaleString('en')} XP`); };
    };
  }));
  app.querySelectorAll('[data-reset]').forEach(b => b.onclick = () => modal(`<h3>Reset all progress?</h3><p>Your XP, streak, lessons, reviews and exam plan will be erased. This cannot be undone.</p><div class="row"><button class="btn ghost" data-close>Cancel</button><button class="btn danger" id="doreset">Erase progress</button></div>`, m => { $('#doreset', m).onclick = () => { S = fresh(); save(); m.remove(); TAB = 'learn'; render(); }; }));
}
function openLesson(i) {
  const l = PATH[i]; if (!isUnlocked(i)) return;
  startLesson({ steps: l.build(), lesson: l });
}
function testOut(ui) {
  const prior = PATH.filter(l => l.unit < ui);
  const pool = [];
  shuffle(prior).forEach(l => T[l.tid].practice.forEach((f, pi) => { if (pool.length < 40) { const q = f.make(); if (q.type === 'mcq') pool.push(Object.assign(qSite(l.tid, pi), { q })); } }));
  const steps = pick(pool, 12);
  startLesson({ steps: [tCard('Placement test', `<p>Answer at least <b>${Math.min(10, steps.length - 2)} of ${steps.length}</b> correctly to unlock everything up to <b>${esc(U[ui].title)}</b>.</p>`, teacher('There is no shame in starting from the beginning. Strong foundations make the IFRS units much easier.'))].concat(steps), noRetry: true, onDone: () => {
    if (LESSON.firstOk >= Math.min(10, steps.length - 2)) { S.unlockedTo = Math.max(S.unlockedTo, PATH.findIndex(l => l.unit === ui)); toast(`Unlocked: ${U[ui].title}`); }
    else toast('Not this time. The earlier units will build you up.');
  } });
}

/* ================= Balsam’s Garden (from Iqraʾ) ================= */
const GL = {"vb":[400,290],"lawn":[-30,166,460,140],"lmask":[200,238,234,66],"cottage0":[96.09,76.53,207.78,154.44,100.81,161.53,340.0,71.11],"cottage0:d":0.0,"cottage1":[93.59,76.53,211.39,154.44,100.81,161.26,347.22,71.67],"cottage1:d":0.0,"cottage2":[93.59,76.53,211.39,153.06,100.26,161.26,347.78,71.11],"cottage2:d":0.0,"cottage3":[93.59,76.53,211.39,153.06,100.26,161.26,347.78,71.11],"cottage3:d":0.0,"cottage4":[93.59,64.87,211.39,164.72,100.26,161.26,347.78,71.11],"cottage4:d":0.0,"well0":[6.68,148.64,73.33,52.5,3.34,171.97,97.22,30.56],"well0:d":1.421,"well1":[15.57,121.14,62.5,71.67,17.79,164.75,136.67,30.0],"well1:d":1.421,"tree0":[280.84,136.79,99.17,109.44,288.9,216.51,203.33,32.78],"tree0:d":-3.813,"tree1":[284.45,132.62,82.78,109.44,310.01,211.23,198.89,41.11],"tree1:d":-3.813,"fence0":[-50.86,180.88,393.89,94.72,-52.81,201.16,432.22,76.11],"fence0:d":-4.202,"fence1":[-48.92,180.05,392.78,95.56,-52.25,200.88,433.89,76.67],"fence1:d":-4.202,"path":[133.66,213.81,41.94,25.0,131.44,214.09,46.67,25.56],"path:d":0.0,"rubble":[-0.17,189.71,321.39,72.78,-3.51,193.59,340.0,71.11],"rubble:d":0.0,"flowers":[104.65,171.68,141.11,61.67,100.76,198.62,192.22,36.67],"flowers:d":0.0,"lamb":[17.03,205.96,33.87,34.67,15.43,226.36,79.47,19.2],"lamb:d":-3.861,"cat":[145.11,227.54,19.47,33.33,140.21,251.94,75.73,11.73],"cat:d":-5.893,"kitten":[76.64,226.83,14.93,26.67,71.34,244.73,56.53,11.73],"kitten:d":-5.054,"bunny_w":[196.68,248.5,16.0,23.2,190.48,263.1,55.47,12.27],"bunny_w:d":-7.046,"bunny_b":[222.79,249.54,16.53,22.4,215.99,263.34,56.0,12.27],"bunny_b:d":-7.063,"smoke":[146.98,66.44],"sign":[138.1,201.99,15.9,5.47],"bgt":[1,1,3,3,5,6,6,8,9],"bgf":[1,2,2,4,4,4,7,7,9]};
// A cottage and garden that start in ruins. Every stage unlocks at an XP total, so lessons, reviews, notes
// and mocks all restore it; some stages bring a pet, and some plant trees and flowers on the hills behind.
const GARDEN = [
  { id: 'weeds', xp: 100, name: 'Clear the weeds and rubble', desc: 'The ground is clear again.' },
  { id: 'fence', xp: 300, name: 'Mend the fence', desc: 'A new gate under a rose arch, with Balsam’s name on it.' },
  { id: 'lamb', xp: 600, name: 'A lamb comes to graze', desc: 'A lamb has wandered in to stay.', pet: 'lamb' },
  { id: 'saplings', xp: 1000, name: 'Plant saplings on the hill', desc: 'Young trees on the hill behind the cottage.', bg: 1 },
  { id: 'roof', xp: 1500, name: 'Repair the roof', desc: 'Fresh golden thatch keeps the rain out.' },
  { id: 'path', xp: 2000, name: 'Lay the garden path', desc: 'Stepping stones lead to the door.' },
  { id: 'wildflowers', xp: 2600, name: 'Sow wildflowers', desc: 'Drifts of daisies, buttercups and campion on the hills.', bg: 2 },
  { id: 'cat', xp: 3300, name: 'A cat moves in', desc: 'A grey tabby keeps watch by the gate.', pet: 'cat' },
  { id: 'windows', xp: 4000, name: 'Fix the door and windows', desc: 'New glass, green shutters and a light inside.' },
  { id: 'orchard', xp: 5000, name: 'Plant an orchard', desc: 'Rows of apple trees on the far slope.', bg: 3 },
  { id: 'flowers', xp: 6000, name: 'Plant the flower beds', desc: 'Hollyhocks, roses, hydrangeas and window boxes.' },
  { id: 'bunnies', xp: 7500, name: 'Bunnies hop in', desc: 'Two bunnies, one white and one brown, play on the lawn.', pet: 'bunnies' },
  { id: 'poppies', xp: 9000, name: 'Poppy fields', desc: 'Red poppies across the middle hills.', bg: 4 },
  { id: 'well', xp: 10500, name: 'Rebuild the well', desc: 'A thatched well with cool water again.' },
  { id: 'tree', xp: 12500, name: 'The apple tree blooms', desc: 'Leaves, blossom and apples.' },
  { id: 'blossom', xp: 14500, name: 'Blossom trees', desc: 'Pink blossom all along the valley.', bg: 5 },
  { id: 'chimney', xp: 17000, name: 'Light the chimney', desc: 'Smoke rises from the cottage again.' },
  { id: 'kitten', xp: 20000, name: 'A kitten joins the family', desc: 'A ginger kitten, and a ball of yarn.', pet: 'kitten' },
  { id: 'woods', xp: 25000, name: 'Woods on the far hills', desc: 'Every far hill wears a wood.', bg: 6 },
  { id: 'lavender', xp: 31000, name: 'Lavender and sunflowers', desc: 'Purple rows on one hill, sunflowers on another.', bg: 7 },
  { id: 'forest', xp: 40000, name: 'Forest on the mountains', desc: 'The grey mountains turn green.', bg: 8 },
  { id: 'bloom', xp: 50000, name: 'The whole valley in bloom', desc: 'Flowers from the gate to the mountains.', bg: 9 },
];
const gardenLevel = (xp = S.xp) => GARDEN.filter(g => xp >= g.xp).length;
const gardenBg = (lv = gardenLevel()) => GARDEN.slice(0, lv).reduce((m, g) => Math.max(m, g.bg || 0), 0);
const PET_NAME = { lamb: 'Lamb', cat: 'Cat', bunnies: 'Bunnies', kitten: 'Kitten' };
function gardenSVG(lv) {
  const has_ = id => GARDEN.findIndex(g => g.id === id) < lv;
  const box = (k, i = 0) => { const g = GL[k]; return `x="${g[i]}" y="${g[i + 1]}" width="${g[i + 2]}" height="${g[i + 3]}"`; };
  const img = k => `<image href="img/garden/${k}.webp" ${box(k)}/>`;
  const cot = 'cottage' + (has_('chimney') ? 4 : has_('flowers') ? 3 : has_('windows') ? 2 : has_('roof') ? 1 : 0);
  const ground = [has_('well') ? 'well1' : 'well0', cot, ...(has_('path') ? ['path'] : []), ...(has_('weeds') ? [] : ['rubble']), ...(has_('flowers') ? ['flowers'] : [])];
  const pets = [['lamb', 'lamb'], ['cat', 'cat'], ['kitten', 'kitten'], ['bunnies', 'bunny_w'], ['bunnies', 'bunny_b']].filter(([id]) => has_(id));
  const tree = has_('tree') ? 'tree1' : 'tree0', front = pets.map(p => p[1]).sort((a, b) => GL[b + ':d'] - GL[a + ':d']);
  const fence = has_('fence') ? 'fence1' : 'fence0';
  const [vw, vh] = GL.vb, [lx, ly, lw, lh] = GL.lawn, [mx, my, mrx, mry] = GL.lmask;
  let h = `<svg class="garden-art" viewBox="0 0 ${vw} ${vh}" role="img" aria-label="Balsam’s Garden at level ${lv} of ${GARDEN.length}"><defs>
    <radialGradient id="bg-lm" cx=".5" cy=".5" r=".5"><stop offset=".58" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="bg-lmask"><ellipse cx="${mx}" cy="${my}" rx="${mrx}" ry="${mry}" fill="url(#bg-lm)"/></mask>
    <filter id="bg-dry" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".62 .45 .05 0 .06  .40 .55 .05 0 .04  .20 .25 .25 0 .02  0 0 0 1 0"/></filter>
    <radialGradient id="bg-puff"><stop offset="0" stop-color="#FAFAF6" stop-opacity=".95"/><stop offset=".6" stop-color="#F4F4EF" stop-opacity=".6"/><stop offset="1" stop-color="#F4F4EF" stop-opacity="0"/></radialGradient></defs>
    <image href="img/lawn.webp" x="${lx}" y="${ly}" width="${lw}" height="${lh}" preserveAspectRatio="none" mask="url(#bg-lmask)"${has_('weeds') ? '' : ' filter="url(#bg-dry)"'}/>`;
  h += `<g class="g-sh">${[...ground, tree, fence, ...front].filter(k => GL[k].length > 4).map(k => `<image href="img/garden/${k}-sh.webp" ${box(k, 4)}/>`).join('')}</g>`;
  for (const k of ground) {
    h += img(k);
    if (k === cot && has_('chimney') && GL.smoke) { const [x, y] = GL.smoke; h += `<g class="smoke">${[0, 1, 2].map(() => `<circle cx="${x}" cy="${y}" r="5" fill="url(#bg-puff)"/>`).join('')}</g>`; }
  }
  h += img(tree) + img(fence);
  if (has_('fence') && GL.sign) {
    const [x, y, w, hh] = GL.sign;
    h += `<text x="${x}" y="${(y + hh * 0.28).toFixed(2)}" text-anchor="middle" font-size="${(hh * 0.78).toFixed(2)}" fill="#FBF6EA" font-family="Amiri Quran, Scheherazade New, serif" class="sign">بلسم</text>`;
  }
  for (const k of front) h += `<g class="pet" data-pet="${pets.find(p => p[1] === k)[0]}"><g class="idle i-${k}">${img(k)}</g></g>`;
  return h + '</svg>';
}
const petPic = k => `<span class="pet-pic"><i style="background-image:url(img/garden/${k}-p.webp)"></i></span>`;
function viewGarden() {
  const lv = gardenLevel(), n = GARDEN.length, next = GARDEN[lv], prev = lv ? GARDEN[lv - 1].xp : 0;
  const cur = currentIndex(), pct = next ? Math.max(2, Math.round(100 * (S.xp - prev) / (next.xp - prev))) : 100;
  const sub = lv === 0 ? 'It lies in ruins. Every lesson you finish brings it back to life, and new friends come to stay.'
    : next ? `Next: ${next.name.charAt(0).toLowerCase() + next.name.slice(1)}, ${next.xp - S.xp} XP to go.` : 'Fully restored. Keep learning to keep it blooming.';
  const row = (g, i) => {
    const done = i < lv, now = i === lv;
    return `<div class="task ${done ? 'done' : now ? 'cur' : 'locked'}"><span class="check">${done ? ICON.check : now ? ICON.sprout : ICON.lock}</span>
      <span class="row-main"><span class="row-title">${esc(g.name)}</span><small>${done ? esc(g.desc) : now ? `${g.xp - S.xp} XP to go` : `Unlocks at ${g.xp.toLocaleString('en')} XP`}</small></span>${g.pet ? `<span class="pill ${done ? 'p-lime' : 'p-dark'} xs">Pet</span>` : g.bg ? `<span class="pill ${done ? 'p-lime' : 'p-dark'} xs">Hills</span>` : ''}</div>`;
  };
  const pets = GARDEN.filter(g => g.pet);
  return `<div class="page">
    ${scene('scene-garden', `<span class="eyebrow">${ICON.sprout}Level ${lv} of ${n}</span><h1 class="display garden-title">Balsam’s Garden</h1><p>${esc(sub)}</p>
      <div class="scene-cta"><button class="btn lg ink" data-lesson="${cur}">${ICON.play}Keep learning</button></div>`, gardenSVG(lv), 64).replace('style="--sx:64%"', `style="--sx:64%${gardenBg(lv) ? `;--gbt:url(img/garden/bg-${GL.bgt[gardenBg(lv) - 1]}-t.webp);--gbf:url(img/garden/bg-${GL.bgf[gardenBg(lv) - 1]}-f.webp)` : ''}"`)}
    <section class="card stack"><div class="split"><span>Garden level</span><span class="num">${lv} of ${n}</span></div>
      <div class="prog"><b class="pct">${lv}</b><div class="track"><i style="width:${pct}%"></i></div></div>
      <p class="hint">${next ? `${(next.xp - S.xp).toLocaleString('en')} XP until “${esc(next.name)}”. Lessons, reviews, notes and mock tests all count.` : 'Every stage is restored.'}</p></section>
    <section class="card"><div class="list-head"><h3>Friends</h3><span class="pill p-lime">${pets.filter(g => GARDEN.indexOf(g) < lv).length} of ${pets.length}</span></div>
      <div class="pets">${pets.map(g => { const on = GARDEN.indexOf(g) < lv; return `<div class="pet-tile ${on ? '' : 'locked'}">${petPic(g.pet)}<b>${PET_NAME[g.pet]}</b><small>${on ? 'In the garden' : `At ${g.xp.toLocaleString('en')} XP`}</small></div>`; }).join('')}</div></section>
    <section class="card"><div class="list-head"><h3>Restoring the garden</h3><span class="pill p-dark">${lv} of ${n}</span></div><div class="tasks">${GARDEN.map(row).join('')}</div></section></div>`;
}
// Tapping a pet makes it jump, with a heart.
document.addEventListener('click', e => {
  const p = e.target.closest('[data-pet]'); if (!p) return;
  p.classList.remove('pat'); void p.getBBox(); p.classList.add('pat'); setTimeout(() => p.classList.remove('pat'), 700);
  const land = p.closest('.scene-land'); if (!land) return;
  const r = land.getBoundingClientRect(), b = p.getBoundingClientRect(), hrt = document.createElement('span');
  hrt.className = 'heart'; hrt.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.2 0 3.6 1.2 5.3 3 1.7-1.8 3.1-3 5.3-3 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z"/></svg>';
  hrt.style.left = (b.left + b.width / 2 - r.left) + 'px'; hrt.style.top = (b.top - r.top) + 'px';
  land.appendChild(hrt); setTimeout(() => hrt.remove(), 1000);
  if (S.settings.sound) sfx.tap();
});

if (!PATH.length) document.getElementById('app').innerHTML = '<p style="padding:24px">The lessons could not load. Check your connection and refresh.</p>';
else render();
})();
