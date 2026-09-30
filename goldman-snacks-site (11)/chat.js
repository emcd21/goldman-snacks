/* Goldman Snacks: Ask a tutor.
   A chat panel that asks Claude about whatever page you're on. It works when the site is opened
   in Claude (the artifact link), using the viewer's own Claude account. Elsewhere it explains how to use it. */
(function(){
  var page=document.getElementById('page');if(!page)return;
  var here=location.pathname.split('/').pop()||'index.html';
  var KEY='gs-chat';
  var turns=[];try{var sv=JSON.parse(sessionStorage.getItem(KEY)||'[]');if(Array.isArray(sv))turns=sv.filter(function(t){return t&&(t.role==='user'||t.role==='assistant')&&typeof t.content==='string'&&t.content;}).slice(-20);}catch(e){}
  function persist(){try{sessionStorage.setItem(KEY,JSON.stringify(turns.slice(-20)));}catch(e){}}
  var sample=null,ready=false,ctl=null,busy=false,pendingQ=null;

  /* ---------- what's on this page ---------- */
  function pageTitle(){var h=document.querySelector('main h1');return (h?h.textContent:document.title.replace(/\s*·.*$/,'')).trim();}
  function clean(t){return t.replace(/\s+\n/g,'\n').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();}
  function textOf(el){var c=el.cloneNode(true);c.querySelectorAll('script,style,button,select,.tts-go,.tts-start,.xp,.vids,.tt-pop,svg,noscript').forEach(function(x){x.remove();});
    c.querySelectorAll('tr').forEach(function(tr){tr.append(document.createTextNode('\n'));});c.querySelectorAll('td,th').forEach(function(td){td.append(document.createTextNode(' | '));});
    c.querySelectorAll('p,li,h2,h3,h4,dt,dd,div').forEach(function(x){x.append(document.createTextNode('\n'));});return clean(c.textContent);}
  function pageText(){var parts=[],secs=document.querySelectorAll('#basics,#learn,#example');
    if(secs.length)secs.forEach(function(s){parts.push(textOf(s));});
    else{var m=document.querySelector('main .article')||document.querySelector('main');if(m)parts.push(textOf(m));}
    return parts.join('\n\n').slice(0,14000);}
  var RULES=function(){return 'You are the tutor on Goldman Snacks, a revision website for a UK university accounting student in Year 3 of an International Financial Reporting module (ACCA-style content, IFRS). '+
    'Explain things the way a friendly teacher would talk a student through them: warm, conversational, one idea at a time. Your answer may be read aloud, so it should sound natural spoken.\nThe student may have dyslexia or ADHD, so:\n- Keep answers short and focused: 1 to 4 short paragraphs or a short list. Offer to go deeper rather than writing everything.\n- Use plain English, short sentences, and bold the key terms.\n- Use a small worked example with round numbers when it helps. Lay out journals and workings as simple tables (| Account | Dr £ | Cr £ |).\n- Use UK and IFRS terms (receivables, payables, inventory, statement of financial position, profit or loss), £ and UK spelling.\n- Check your arithmetic. If a rule has exceptions, say so briefly. If you are not sure, say so.\n- For practice questions, help the student get there: give a hint or the first step first, unless they ask for the full answer.\n- Stay on accounting, finance, study skills and this website. Politely steer back if asked about something unrelated.\n\n'+
    'The student is on this page: "'+pageTitle()+'" ('+here+'). Here is the page content, which may be used to ground your answer:\n<page>\n'+pageText()+'\n</page>';};

  /* ---------- a tiny, safe Markdown renderer ---------- */
  function esc(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function inline(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g,'$1<em>$2</em>').replace(/`([^`]+)`/g,'<code>$1</code>');}
  function md(src){var L=src.replace(/\r/g,'').split('\n'),out=[],i=0;
    while(i<L.length){var l=L[i];
      if(/^\s*\|.*\|\s*$/.test(l)){var rows=[];while(i<L.length&&/^\s*\|.*\|\s*$/.test(L[i])){rows.push(L[i]);i++;}
        rows=rows.filter(function(r){return !/^\s*\|[\s:|-]+\|\s*$/.test(r);}).map(function(r){return r.trim().replace(/^\||\|$/g,'').split('|').map(function(c){return c.trim();});});
        out.push('<div class="ch-tbl"><table>'+rows.map(function(r,ri){return '<tr>'+r.map(function(c){var num=/^[£$(−-]?[\d,.]+\)?%?$/.test(c);return ri===0?'<th'+(num?' class="n"':'')+'>'+inline(c)+'</th>':'<td'+(num?' class="n"':'')+'>'+inline(c)+'</td>';}).join('')+'</tr>';}).join('')+'</table></div>');continue;}
      if(/^\s*([-*•])\s+/.test(l)){var it=[];while(i<L.length&&/^\s*([-*•])\s+/.test(L[i])){it.push('<li>'+inline(L[i].replace(/^\s*[-*•]\s+/,''))+'</li>');i++;}out.push('<ul>'+it.join('')+'</ul>');continue;}
      if(/^\s*\d+[.)]\s+/.test(l)){var it2=[];while(i<L.length&&/^\s*\d+[.)]\s+/.test(L[i])){it2.push('<li>'+inline(L[i].replace(/^\s*\d+[.)]\s+/,''))+'</li>');i++;}out.push('<ol>'+it2.join('')+'</ol>');continue;}
      var h=/^\s*#{1,4}\s+(.*)$/.exec(l);if(h){out.push('<h4>'+inline(h[1])+'</h4>');i++;continue;}
      if(!l.trim()){i++;continue;}
      var para=[inline(l)];i++;while(i<L.length&&L[i].trim()&&!/^\s*(\||[-*•]\s|\d+[.)]\s|#{1,4}\s)/.test(L[i])){para.push(inline(L[i]));i++;}
      out.push('<p>'+para.join('<br>')+'</p>');}
    return out.join('');}

  /* ---------- the panel ---------- */
  var IC={chat:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
    send:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg>',
    stop:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
    x:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    spk:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>',
    new:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'};
  var fab=document.createElement('button');fab.type='button';fab.className='ch-fab';fab.setAttribute('aria-haspopup','dialog');fab.innerHTML=IC.chat+'<span>Ask a tutor</span>';
  var box=document.createElement('section');box.className='ch-box';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-label','Ask a tutor');
  box.innerHTML='<header class="ch-head"><div><b>Ask a tutor</b><small class="ch-ctx"></small></div>'+
    '<button type="button" class="ch-ib ch-voice" aria-pressed="true" title="Tutor voice" aria-label="Turn the tutor’s voice off"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="sp" d="M4 9v6h4l5 4V5L8 9z"/><path class="w1" d="M16.5 8.5a5 5 0 0 1 0 7"/><path class="w2" d="M19 6a8.5 8.5 0 0 1 0 12"/><path class="off" d="M16 9l5 6M21 9l-5 6"/></svg></button>'+
    '<button type="button" class="ch-ib ch-new" title="New chat" aria-label="Start a new chat">'+IC.new+'</button>'+
    '<button type="button" class="ch-ib ch-close" aria-label="Close">'+IC.x+'</button></header>'+
    '<div class="ch-log" aria-live="polite"></div>'+
    '<div class="ch-sug"></div>'+
    '<form class="ch-form"><label class="ch-sr" for="ch-in">Your question</label><textarea id="ch-in" rows="1" placeholder="Ask anything about this page…"></textarea>'+
    '<button type="submit" class="ch-send" aria-label="Send">'+IC.send+'</button></form>'+
    '<p class="ch-foot">Answers come from Claude and can be wrong. Check them against your notes.</p>';
  function mount(){document.body.append(fab,box);}
  if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount);
  var log=box.querySelector('.ch-log'),inp=box.querySelector('#ch-in'),form=box.querySelector('.ch-form'),sendB=box.querySelector('.ch-send'),sug=box.querySelector('.ch-sug');
  box.querySelector('.ch-ctx').textContent='About: '+pageTitle();

  var isTopic=!!document.getElementById('practice-list');
  var SUGS=isTopic?['Explain this topic simply','Give me a worked example with numbers','Quiz me with 3 quick questions','What mistakes do students make here?']
    :here==='index.html'?['Where should I start revising?','What’s the difference between IAS and IFRS?','Make me a revision plan for this week']
    :['Explain this page simply','Quiz me on this','What should I revise next?'];
  function drawSug(){sug.innerHTML='';if(turns.length)return;SUGS.forEach(function(s){var b=document.createElement('button');b.type='button';b.className='ch-chip';b.textContent=s;b.onclick=function(){ask(s);};sug.append(b);});}

  function bubble(role,html,opts){var d=document.createElement('div');d.className='ch-msg '+(role==='user'?'me':'ai');
    var body=document.createElement('div');body.className='ch-body';if(role==='user')body.textContent=html;else body.innerHTML=html;d.append(body);
    if(role!=='user'&&!(opts&&opts.noTools)){var t=document.createElement('div');t.className='ch-tools';
      if(window.GSTTS){var r=document.createElement('button');r.type='button';r.className='ch-mini';r.innerHTML=IC.spk+'<span>Read aloud</span>';r.onclick=function(){GSTTS.read([].slice.call(body.querySelectorAll('p,li,h4')),'Tutor');};t.append(r);}
      d.append(t);}
    log.append(d);log.scrollTop=log.scrollHeight;return body;}
  function redraw(){log.innerHTML='';
    if(!turns.length){var w=bubble('ai','<p><b>Hi!</b> Ask me anything about <b>'+esc(pageTitle())+'</b>, or anything else from your course. I can explain it another way, give examples, or quiz you.</p>',{noTools:true});}
    turns.forEach(function(t){bubble(t.role,t.role==='user'?t.content:md(t.content));});drawSug();}

  function unavailable(msg){log.innerHTML='';sug.innerHTML='';form.hidden=true;
    bubble('ai',msg,{noTools:true});}
  var COPY={not_granted:'The tutor needs your permission to use Claude, and it was declined for this visit. Reload the page to be asked again.',
    sampling_disabled:'Claude isn’t available for this account, so the tutor can’t answer here.',
    rate_limited:'That’s a lot of questions at once, or today’s free limit has been reached. Wait a minute and try again.',
    session_expired:'You’ve been signed out of Claude. Sign in again, then ask again.',
    refused:'Claude wouldn’t answer that one. Try asking it a different way.',
    empty_completion:'Claude didn’t give an answer. Try asking a shorter or simpler question.',
    prompt_too_large:'This chat has got too long. Start a new chat with the + button.',
    upstream_error:'Something went wrong while answering. Try again.'};

  /* the tutor's voice: speak the answer in sentence-sized pieces while it is being written */
  var vb=box.querySelector('.ch-voice'),voiceOn=!!window.GSTTS;
  try{if(localStorage.getItem('gs-tutor-voice')==='0')voiceOn=false;}catch(e){}
  if(!window.GSTTS)vb.hidden=true;
  function setVoice(on){voiceOn=on&&!!window.GSTTS;vb.setAttribute('aria-pressed',voiceOn?'true':'false');vb.classList.toggle('muted',!voiceOn);
    vb.setAttribute('aria-label',voiceOn?'Turn the tutor’s voice off':'Turn the tutor’s voice on');try{localStorage.setItem('gs-tutor-voice',voiceOn?'1':'0');}catch(e){}
    if(!voiceOn&&window.GSTTS)GSTTS.hush();}
  setVoice(voiceOn);
  vb.addEventListener('click',function(){setVoice(!voiceOn);});
  function speaker(){var spoke=0,tableSaid=false;
    function say(chunk){if(!voiceOn||!window.GSTTS)return;var out=[];
      chunk.split('\n').forEach(function(l){if(/^\s*\|/.test(l)){if(!tableSaid){tableSaid=true;out.push('I’ve set the working out in a table for you.');}return;}out.push(l);});
      var t=out.join(' ').replace(/\s+/g,' ').trim();if(t)GSTTS.talk(t,function(){vb.classList.remove('talking');});vb.classList.add('talking');}
    return function(text,final){var seg=text.slice(spoke);if(!seg)return;var cut=-1;
      if(final)cut=seg.length;else{var re=/(?<!(?:^|\n)\s*\d{1,2})[.!?:](?=\s)|\n\s*\n|\n(?=\s*(?:[-*•]|\d+[.)])\s)/g,m;while((m=re.exec(seg)))cut=m.index+m[0].length;
        /* never cut inside a table row that is still arriving */
        if(cut>0){var ls=seg.lastIndexOf('\n',cut-1)+1;if(/^\s*\|/.test(seg.slice(ls,cut))&&seg[cut-1]!=='\n')cut=ls;}}
      if(cut>0){say(seg.slice(0,cut));spoke+=cut;}};}
  function hush(){if(window.GSTTS)GSTTS.hush();vb.classList.remove('talking');}

  async function ask(q){q=(q||'').trim();if(!q||busy)return;
    if(!sample){return;}
    if(!turns.length)log.innerHTML='';
    sug.innerHTML='';turns.push({role:'user',content:q});persist();bubble('user',q);inp.value='';fit();
    var body=bubble('ai','<p class="ch-wait"><span></span><span></span><span></span> Thinking…</p>');var tools=body.parentNode.querySelector('.ch-tools');if(tools)tools.hidden=true;
    hush();var feed=speaker();
    busy=true;setBusy(true);ctl=new AbortController();
    var history=turns.slice(-12);while(history.length&&history[0].role!=='user')history.shift();
    var input=[{role:'user',content:RULES()}].concat(history);
    try{
      var res=await sample(input,{cache:false,signal:ctl.signal,onText:function(u){body.innerHTML=md(u.text);log.scrollTop=log.scrollHeight;feed(u.text,false);}});
      feed(res.text,true);
      body.innerHTML=md(res.text);turns.push({role:'assistant',content:res.text});persist();
      if(res.truncated){var n=document.createElement('p');n.className='ch-note';n.textContent='That answer was cut short. Ask me to carry on.';body.append(n);}
      if(tools)tools.hidden=false;
    }catch(e){var code=e&&e.code||'upstream_error';
      if(code==='cancelled'){if(e.text){body.innerHTML=md(e.text);turns.push({role:'assistant',content:e.text});persist();}else{body.parentNode.remove();turns.pop();persist();}}
      else if(code==='passcode'){body.parentNode.remove();turns.pop();persist();setCode('');lastQ=q;askCode('That passcode didn’t work. Enter the tutor passcode to carry on.');}
      else if(code==='not_configured'||code==='bad_key'){unavailable('<p>'+(code==='bad_key'?'The tutor’s API key was refused. The site owner needs to check the key in Netlify’s environment variables (<b>GEMINI_API_KEY</b> or ANTHROPIC_API_KEY).':'The tutor isn’t set up yet. The site owner needs to add a free <b>GEMINI_API_KEY</b> in Netlify.')+'</p>');turns.pop();persist();}
      else if(/^(not_granted|sampling_disabled|not_declared|capability_disabled|capability_removed)$/.test(code)){unavailable('<p>'+(COPY[code]||COPY.sampling_disabled)+'</p>');turns.pop();persist();}
      else{if(e.text&&code!=='refused'){body.innerHTML=md(e.text);}else body.innerHTML='';var p=document.createElement('p');p.className='ch-err';p.textContent=COPY[code]||COPY.upstream_error;body.append(p);turns.pop();persist();}
    }finally{busy=false;setBusy(false);ctl=null;inp.focus();}
  }
  function setBusy(b){sendB.innerHTML=b?IC.stop:IC.send;sendB.setAttribute('aria-label',b?'Stop':'Send');sendB.classList.toggle('stop',b);sendB.type=b?'button':'submit';}
  sendB.addEventListener('click',function(e){if(busy){e.preventDefault();ctl&&ctl.abort();hush();}});
  form.addEventListener('submit',function(e){e.preventDefault();ask(inp.value);});
  function fit(){inp.style.height='auto';inp.style.height=Math.min(140,inp.scrollHeight)+'px';}
  inp.addEventListener('input',fit);
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(inp.value);}});
  function open(q){box.hidden=false;fab.classList.add('hide');document.body.classList.add('ch-open');
    if(!ready){log.innerHTML='';bubble('ai','<p class="ch-wait"><span></span><span></span><span></span> Connecting…</p>',{noTools:true});}
    else redraw();
    if(q&&sample)ask(q);else{if(q&&!ready)pendingQ=q;setTimeout(function(){inp.focus();},50);}}
  function close(){box.hidden=true;fab.classList.remove('hide');document.body.classList.remove('ch-open');if(busy&&ctl)ctl.abort();hush();fab.focus();}
  fab.addEventListener('click',function(){open();});
  box.querySelector('.ch-close').addEventListener('click',close);
  box.querySelector('.ch-new').addEventListener('click',function(){if(busy&&ctl)ctl.abort();hush();turns=[];persist();redraw();inp.focus();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!box.hidden)close();});

  /* "Ask" on each practice question */
  function qText(q){var p=q.querySelector('.q-prompt');var lines=[p?textOf(p):''];
    q.querySelectorAll('table.fields tr').forEach(function(tr){var l=tr.querySelector('td');var i=tr.querySelector('input');if(l)lines.push('- '+l.textContent.trim()+(i&&i.value?' (my answer: '+i.value+')':''));});
    q.querySelectorAll('.cls-item, .cls-row').forEach(function(r){lines.push('- '+r.textContent.trim());});
    var opts=[].slice.call(q.querySelectorAll('.mcq label, label.opt')).map(function(l){return '- '+l.textContent.trim();});if(opts.length)lines=lines.concat(opts);
    var fb=q.querySelector('.fb:not([hidden])');if(fb&&fb.textContent.trim())lines.push('\nFeedback shown: '+fb.textContent.trim());
    return lines.join('\n').slice(0,4000);}
  function addAsk(root){root.querySelectorAll('.q').forEach(function(q){var head=q.querySelector('.q-head');if(!head||head.querySelector('.ch-ask'))return;
    var b=document.createElement('button');b.type='button';b.className='ch-ask';b.innerHTML=IC.chat+'<span>Ask</span>';b.title='Ask the tutor about this question';
    b.onclick=function(){open('Help me with this practice question. Start with a hint, not the full answer.\n\n'+qText(q));};
    var ref=head.querySelector('.tts-go');head.insertBefore(b,ref?ref.nextSibling:(head.children[2]||null));});}
  var lists=['practice-list','review-root','written-root'].map(function(id){return document.getElementById(id);}).filter(Boolean);
  lists.forEach(function(pl){addAsk(pl);new MutationObserver(function(){addAsk(pl);}).observe(pl,{childList:true,subtree:true});});

  /* connect: inside Claude use Claude directly; on your own site use the tutor server (/api/tutor) */
  var mode='',needsCode=false,lastQ='';
  function getCode(){try{return localStorage.getItem('gs-tutor-code')||'';}catch(e){return '';}}
  function setCode(c){try{if(c)localStorage.setItem('gs-tutor-code',c);else localStorage.removeItem('gs-tutor-code');}catch(e){}}
  async function serverSample(input,o){o=o||{};var signal=o.signal,onText=o.onText;
    var system=input[0].content,messages=input.slice(1),res;
    try{res=await fetch('/api/tutor',{method:'POST',headers:{'content-type':'application/json','x-tutor-code':getCode()},body:JSON.stringify({system:system,messages:messages}),signal:signal});}
    catch(e){throw {code:signal&&signal.aborted?'cancelled':'upstream_error'};}
    if(!res.ok){var j={};try{j=await res.json();}catch(e){}
      if(res.status===401)throw {code:'passcode'};if(res.status===429)throw {code:'rate_limited'};
      if(res.status===503)throw {code:j.error==='bad_key'?'bad_key':'not_configured'};throw {code:'upstream_error'};}
    var rd=res.body.getReader(),dec=new TextDecoder(),text='',trunc=false,err=false;
    try{for(;;){var r=await rd.read();if(r.done)break;var chunk=dec.decode(r.value,{stream:true});
        if(chunk.indexOf('\u0000')>=0){if(chunk.indexOf('\u0000TRUNCATED')>=0)trunc=true;if(chunk.indexOf('\u0000ERROR')>=0)err=true;chunk=chunk.replace(/\u0000(TRUNCATED|ERROR)/g,'');}
        if(chunk){text+=chunk;onText&&onText({text:text,delta:chunk});}}}
    catch(e){throw {code:signal&&signal.aborted?'cancelled':'upstream_error',text:text||undefined};}
    if(err)throw {code:'upstream_error',text:text||undefined};
    if(!text.trim())throw {code:'empty_completion'};
    return {text:text,truncated:trunc};}
  function connected(s,m){ready=true;sample=s;mode=m||'';document.body.classList.toggle('ch-none',!s);
    if(!box.hidden){if(!s)unavailable(offMsg());else if(mode==='server'&&needsCode&&!getCode())askCode();else{redraw();if(pendingQ){var q=pendingQ;pendingQ=null;ask(q);}}}}
  function tryServer(){if(!/^https?:$/.test(location.protocol)){connected(null);return;}
    fetch('/api/tutor',{method:'GET',headers:{accept:'application/json'}}).then(function(r){return r.ok?r.json():null;}).then(function(j){
      if(!j||typeof j.ok!=='boolean'){connected(null);return;}
      if(!j.ok){notSetUp=true;connected(null);return;}
      needsCode=!!j.needsCode;connected(serverSample,'server');}).catch(function(){connected(null);});}
  var notSetUp=false;
  if(window.claude&&typeof window.claude.use==='function'){
    window.claude.use('sample').then(function(s){if(s)connected(s,'claude');else tryServer();}).catch(tryServer);
  }else tryServer();
  function offMsg(){if(notSetUp)return '<p>The tutor is almost ready. The site owner needs to add a free <b>GEMINI_API_KEY</b> (or an ANTHROPIC_API_KEY) in Netlify’s environment variables, then redeploy.</p>';
    return '<p>The tutor isn’t switched on for this copy of the site.</p><p>It works when you open Goldman Snacks <b>inside Claude</b> (the claude.ai link), or on a copy deployed to Netlify from GitHub with the tutor set up.</p>';}
  /* passcode screen */
  function askCode(msg){log.innerHTML='';sug.innerHTML='';form.hidden=true;
    var b=bubble('ai','<p>'+(msg||'Enter the tutor passcode to start. You only need to do this once on this device.')+'</p>',{noTools:true});
    var f=document.createElement('form');f.className='ch-code';f.innerHTML='<label class="ch-sr" for="ch-code">Passcode</label><input id="ch-code" type="password" autocomplete="current-password" placeholder="Passcode"><button type="submit" class="btn">Unlock</button>';
    b.append(f);var ci=f.querySelector('input');setTimeout(function(){ci.focus();},30);
    f.onsubmit=function(e){e.preventDefault();var v=ci.value.trim();if(!v)return;setCode(v);form.hidden=false;redraw();var q=lastQ||pendingQ;lastQ='';pendingQ=null;if(q)ask(q);else inp.focus();};}
  var _open=open;open=function(q){_open(q);if(ready&&!sample)unavailable(offMsg());else if(ready&&mode==='server'&&needsCode&&!getCode()){if(q)lastQ=q;askCode();}};
  window.GSChat={open:function(q){open(q);}};
})();
