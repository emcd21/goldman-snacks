#!/usr/bin/env python3
"""Builds app/notes.js from the site's topic pages and cheat sheets, so the app's lessons and notes
match the website. Run it from anywhere after changing a topic page:  python3 app/build_notes.py"""
import html, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)

def section(s, sid):
    m = re.search(r'<section class="block" id="%s">(.*?)</section>' % sid, s, re.S)
    if not m:
        return ''
    return re.sub(r'^\s*<h2>.*?</h2>', '', m.group(1), flags=re.S).strip()

def unwrap(t):
    t = t.strip()
    m = re.fullmatch(r'<div class="(?:prose|plain)">(.*)</div>', t, re.S)
    return m.group(1).strip() if m else t

def text(t):
    return html.unescape(re.sub(r'<[^>]+>', '', t)).strip()

notes = {}
for f in sorted(os.listdir(SITE)):
    if not f.endswith('.html'):
        continue
    s = open(os.path.join(SITE, f), encoding='utf-8').read()
    m = re.search(r'data-page="([^"]+)"', s)
    if not m or not re.search(r'id="practice"', s):
        continue
    tid = m.group(1)
    if tid == 'home':
        continue
    basics = section(s, 'basics')
    words = []
    dl = re.search(r'<h3>Key words</h3>\s*<dl class="words">(.*?)</dl>', basics, re.S)
    if dl:
        for dt, dd in re.findall(r'<dt>(.*?)</dt>\s*<dd>(.*?)</dd>', dl.group(1), re.S):
            eg = re.search(r'<span class="kw-eg">(.*?)</span>', dd, re.S)
            dd_main = re.sub(r'<span class="kw-eg">.*?</span>', '', dd, flags=re.S).strip()
            words.append([text(dt), dd_main, re.sub(r'^<b>Example:</b>\s*', '', eg.group(1)).strip() if eg else ''])
        basics = basics[:dl.start()]
    basics = re.sub(r'<h3>Key words</h3>\s*$', '', basics.strip()).strip()
    learn = unwrap(section(s, 'learn'))
    parts = re.split(r'<h3[^>]*>(.*?)</h3>', learn)
    cards = []
    if parts[0].strip():
        cards.append(['', parts[0].strip()])
    for i in range(1, len(parts), 2):
        cards.append([text(parts[i]), parts[i + 1].strip()])
    eyebrow = re.search(r'class="eyebrow">([^<]*)', s)
    lede = re.search(r'class="lede">(.*?)</p>', s, re.S)
    h1 = re.search(r'<h1>(.*?)</h1>', s, re.S)
    notes[tid] = {
        'file': f,
        'title': text(h1.group(1)) if h1 else tid,
        'where': html.unescape(eyebrow.group(1)).strip() if eyebrow else '',
        'lede': text(lede.group(1)) if lede else '',
        'basics': unwrap(basics),
        'words': words,
        'learn': cards,
        'example': unwrap(section(s, 'example')),
    }

sheets = []
cs = open(os.path.join(SITE, 'cheat-sheets.html'), encoding='utf-8').read()
for sid, body in re.findall(r'<section class="cs-sheet" id="([^"]*)"[^>]*>(.*?)</section>', cs, re.S):
    h = re.search(r'<h2[^>]*>(.*?)</h2>', body, re.S)
    title = text(re.sub(r'<span>.*?</span>', '', h.group(1))) if h else sid
    sheets.append({'id': sid, 'title': title, 'html': body[h.end():].strip() if h else body})

out = '/* Built by app/build_notes.py from the topic pages and cheat sheets. Do not edit by hand. */\n'
out += 'window.GS_NOTES=' + json.dumps(notes, ensure_ascii=False, separators=(',', ':')) + ';\n'
out += 'window.GS_SHEETS=' + json.dumps(sheets, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(os.path.join(HERE, 'notes.js'), 'w', encoding='utf-8').write(out)
print(f'{len(notes)} topics, {len(sheets)} cheat sheets, {len(out) // 1024} KB')
