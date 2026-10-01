/* Goldman Snacks: read aloud.
   Uses the voices built into the device (Web Speech API), picks the most natural British voice available,
   reads sentence by sentence with the current sentence highlighted, and narrates the animated explainers. */
(function(){
  var synth=window.speechSynthesis;
  if(!synth||typeof SpeechSynthesisUtterance==='undefined'){window.GSTTS=null;return;}
  var KEY='gs-tts';
  var prefs={voice:'',rate:1};
  try{var sp=JSON.parse(localStorage.getItem(KEY)||'{}');if(sp&&typeof sp==='object'){prefs.voice=sp.voice||'';prefs.rate=+sp.rate||1;}}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch(e){}}

  /* ---------- choosing a voice ---------- */
  var NOVELTY=/^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Ralph|Kathy|Princess|Rocko|Grandma|Grandpa|Eddy|Flo|Reed|Sandy|Shelley)\b/i;
  function score(v){var n=v.name,l=(v.lang||'').replace('_','-'),s=0;
    if(!/^en/i.test(l))return -100;
    if(NOVELTY.test(n))return -50;
    if(/en-GB/i.test(l))s+=50;else if(/en-(IE|AU|NZ)/i.test(l))s+=22;else if(/en-US/i.test(l))s+=15;else s+=8;
    if(/premium/i.test(n))s+=45;else if(/enhanced/i.test(n))s+=35;
    if(/natural|neural|online/i.test(n))s+=40;
    if(/^Google/i.test(n))s+=28;
    if(/Siri/i.test(n))s+=20;
    if(v.localService===false&&!/^Google/i.test(n))s+=5;
    return s;}
  function english(){return synth.getVoices().filter(function(v){return score(v)>0;}).sort(function(a,b){return score(b)-score(a)||a.name.localeCompare(b.name);});}
  function voice(){var vs=synth.getVoices();var v=null;if(prefs.voice)v=vs.filter(function(x){return x.name===prefs.voice;})[0];return v||english()[0]||null;}
  function quality(v){if(!v)return '';var n=v.name;if(/premium|natural|neural/i.test(n))return 'Most natural';if(/enhanced|^Google|online/i.test(n))return 'Good';return 'Basic';}

  /* ---------- turning page text into speech-friendly text ---------- */
  var SAY=[
    [/\bIFRS\b/g,'I F R S'],[/\bIAS\b/g,'I A S'],[/\bISA\b/g,'I S A'],[/\bACCA\b/g,'A C C A'],[/\bNCI\b/g,'N C I'],[/\bEPS\b/g,'E P S'],
    [/\bPPE\b/g,'P P E'],[/\bOCI\b/g,'O C I'],[/\bCGU\b/g,'C G U'],[/\bNRV\b/g,'N R V'],[/\bURP\b/g,'U R P'],[/\bROCE\b/g,'Rocky'],[/\bFVOCI\b/g,'F V O C I'],[/\bFVTPL\b/g,'F V T P L'],
    [/\bECL\b/g,'E C L'],[/\bVAT\b/g,'V A T'],[/\bHMRC\b/g,'H M R C'],[/\bPAYE\b/g,'P A Y E'],[/\bP\/L\b/g,'profit or loss'],[/\bP&L\b/g,'P and L'],[/\bSOFP\b/g,'statement of financial position'],
    [/\bDr\b\.?/g,'Debit'],[/\bCr\b\.?/g,'Credit'],[/\bc\/d\b/g,'carried down'],[/\bb\/d\b/g,'brought down'],[/\be\.g\./g,'for example'],[/\bi\.e\./g,'that is'],[/\betc\./g,'and so on'],
    [/(\d)\s*\/\s*(\d+)\b/g,'$1 over $2'],[/÷/g,' divided by '],[/×/g,' times '],[/(\s)[−–-](\s)/g,'$1minus$2'],[/−(?=\d)/g,'minus '],[/=/g,' equals '],[/→/g,', then '],[/≥/g,' at least '],[/≤/g,' at most '],
    [/\((\d[\d,.]*)\)/g,'minus $1'],[/\b20X(\d)\b/g,'20 X $1'],[/\b(\d+)p\b/g,'$1 pence'],[/£(\d[\d,.]*)m\b/g,'£$1 million'],[/£(\d[\d,.]*)bn\b/g,'£$1 billion'],[/\s{2,}/g,' ']];
  function speakable(t){SAY.forEach(function(r){t=t.replace(r[0],r[1]);});return t.trim();}

  /* split a block of text into sentences, keeping offsets so each can be highlighted */
  function sentences(text){var out=[],start=0,L=text.length,ABBR=/(?:\be\.g|\bi\.e|\betc|\bvs|\bNo|\bDr|\bCr|\bapprox)\.$/i;
    function push(e){var st=start;while(st<e&&/\s/.test(text[st]))st++;if(st<e)out.push({start:st,end:e});start=e;}
    for(var i=0;i<L;i++){var c=text[i];
      if(c==='.'||c==='!'||c==='?'){var j=i;while(j+1<L&&/[.!?)"”’]/.test(text[j+1]))j++;var nx=text[j+1],pv=text[i-1]||'';
        var brk=nx===undefined||/\s/.test(nx)||(/[A-Z£(]/.test(nx)&&/[a-z)%’"”]/.test(pv));
        if(brk&&!ABBR.test(text.slice(Math.max(start,i-7),i+1))){push(j+1);i=j;}}
      else if((c===';'||c===':')&&/\s/.test(text[i+1]||'')){push(i+1);}}
    push(L);
    /* keep very short fragments with the next sentence so the voice doesn't stop and start */
    var merged=[];out.forEach(function(o){var prev=merged[merged.length-1];if(prev&&text.slice(prev.start,prev.end).trim().length<18)prev.end=o.end;else merged.push(o);});
    return merged;}

  /* map text offsets back to DOM ranges (for the sentence highlight) */
  function textNodes(el){var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return n.parentElement.closest('.tts-skip,button,script,style,svg')?2:1;}}),a=[],n,pos=0;
    while((n=w.nextNode())){a.push({n:n,s:pos,e:pos+n.nodeValue.length});pos+=n.nodeValue.length;}return {list:a,text:a.map(function(x){return x.n.nodeValue;}).join('')};}
  function rangeFor(tn,s,e){var r=document.createRange(),ok=0;
    for(var i=0;i<tn.list.length;i++){var x=tn.list[i];
      if(!ok&&s>=x.s&&s<=x.e){r.setStart(x.n,s-x.s);ok=1;}
      if(ok&&e>=x.s&&e<=x.e){r.setEnd(x.n,e-x.s);return r;}}
    return null;}
  var HL=window.CSS&&CSS.highlights&&typeof Highlight!=='undefined';
  function mark(r){if(!HL)return;if(r)CSS.highlights.set('gs-tts',new Highlight(r));else CSS.highlights.delete('gs-tts');}

  /* ---------- the reading queue ---------- */
  var Q=[],qi=0,state='idle',curBlock=null,onDone=null,label='',gen=0;
  function blocksIn(root){
    var sel='h2,h3,h4,p,li,dt,dd,.formula,.note,.eg,.q-prompt > p,.lede,.fc-face > b,.fc-face > p';
    var all=[].slice.call(root.querySelectorAll(sel)).filter(function(b){
      if(b.closest('.tts-skip,.xp,.vids,table,.jcard,nav,.q .fb,.q-actions,.expl,.lside,.toc,.pager,.site-foot,.hint.tts-skip'))return false;
      if(b.closest('li,dd,.note,.eg,.formula')&&b.closest('li,dd,.note,.eg,.formula')!==b)return false;
      if(!b.offsetParent&&b.getClientRects().length===0)return false;
      return b.textContent.trim().length>1;});
    if(root.matches&&root.matches(sel)&&!all.length)all=[root];
    return all;}
  function build(blocks){var items=[];blocks.forEach(function(b){var tn=textNodes(b);if(!tn.text.trim())return;
      sentences(tn.text).forEach(function(s){var raw=tn.text.slice(s.start,s.end);var say=speakable(raw);if(say.replace(/[^A-Za-z0-9£]/g,'').length)items.push({b:b,tn:tn,s:s.start,e:s.end,t:say,h:/^H[1-6]$/.test(b.tagName)});});});
    return items;}
  function speakItem(){var my=gen;
    if(qi>=Q.length){finish();return;}
    var it=Q[qi];
    if(curBlock!==it.b){if(curBlock)curBlock.classList.remove('tts-on');curBlock=it.b;curBlock.classList.add('tts-on');
      var r=curBlock.getBoundingClientRect();if(r.top<90||r.bottom>innerHeight-110)curBlock.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});}
    mark(rangeFor(it.tn,it.s,it.e));
    var u=new SpeechSynthesisUtterance(it.t);var v=voice();if(v){u.voice=v;u.lang=v.lang;}else u.lang='en-GB';
    u.rate=prefs.rate;u.pitch=1;
    u.onend=function(){if(my!==gen||state!=='playing')return;qi++;setTimeout(function(){if(my===gen&&state==='playing')speakItem();},it.h?260:90);};
    u.onerror=function(ev){if(my!==gen)return;if(ev&&(ev.error==='interrupted'||ev.error==='canceled'))return;qi++;speakItem();};
    synth.speak(u);keepAlive();ui();}
  /* Chrome stops long speech after ~15 s unless nudged */
  var ka=0;function keepAlive(){clearInterval(ka);ka=setInterval(function(){if(state!=='playing'){clearInterval(ka);return;}if(synth.speaking&&!synth.paused){synth.pause();synth.resume();}},10000);}
  function start(items,lbl,done){stopAll(true);if(!items.length)return;gen++;Q=items;qi=0;label=lbl||'';onDone=done||null;state='playing';
    synth.cancel();setTimeout(speakItem,60);ui();}
  function pause(){if(state!=='playing')return;state='paused';gen++;synth.cancel();ui();}
  function resume(){if(state!=='paused')return;state='playing';gen++;synth.cancel();setTimeout(speakItem,60);ui();}
  function skip(d){if(state==='idle')return;var b=Q[qi]&&Q[qi].b,j=qi;
    if(d>0){while(j<Q.length&&Q[j].b===b)j++;}
    else{while(j>0&&Q[j-1].b===b)j--;if(j===qi&&j>0){var pb=Q[j-1].b;j--;while(j>0&&Q[j-1].b===pb)j--;}}
    qi=Math.min(j,Q.length);gen++;synth.cancel();state='playing';setTimeout(speakItem,60);ui();}
  function finish(){var cb=onDone;stopAll(true);if(cb)cb();}
  function stopAll(quiet){gen++;state='idle';clearInterval(ka);try{synth.cancel();}catch(e){}if(curBlock)curBlock.classList.remove('tts-on');curBlock=null;mark(null);Q=[];qi=0;onDone=null;ui();}

  /* ---------- player bar ---------- */
  var IC={play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    prev:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6v12M18 6l-9 6 9 6z"/></svg>',next:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6v12M6 6l9 6-9 6z"/></svg>',
    stop:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',spk:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
    gear:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>'};
  var bar=document.createElement('div');bar.className='tts-bar';bar.hidden=true;bar.setAttribute('role','region');bar.setAttribute('aria-label','Read aloud controls');
  bar.innerHTML='<button type="button" class="tts-b" data-a="prev" aria-label="Previous paragraph">'+IC.prev+'</button>'+
    '<button type="button" class="tts-b tts-main" data-a="toggle" aria-label="Pause">'+IC.pause+'</button>'+
    '<button type="button" class="tts-b" data-a="next" aria-label="Next paragraph">'+IC.next+'</button>'+
    '<span class="tts-lab"><b>Reading aloud</b><small></small></span>'+
    '<select class="tts-rate" aria-label="Reading speed"><option value="0.8">0.8×</option><option value="0.9">0.9×</option><option value="1">1×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option><option value="1.5">1.5×</option></select>'+
    '<button type="button" class="tts-b" data-a="settings" aria-label="Voice settings">'+IC.gear+'</button>'+
    '<button type="button" class="tts-b" data-a="stop" aria-label="Stop reading">'+IC.stop+'</button>';
  var panel=document.createElement('div');panel.className='tts-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Voice settings');
  function mount(){document.body.append(bar,panel);}
  if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount);
  var rateSel=bar.querySelector('.tts-rate');rateSel.value=String(prefs.rate);if(!rateSel.value)rateSel.value='1';
  rateSel.addEventListener('change',function(){prefs.rate=+rateSel.value;save();if(state==='playing'){gen++;synth.cancel();setTimeout(speakItem,60);}});
  bar.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var a=b.dataset.a;
    if(a==='toggle'){state==='playing'?pause():resume();}else if(a==='next')skip(1);else if(a==='prev')skip(-1);else if(a==='stop'){stopAll();}else if(a==='settings')openPanel();});
  function ui(){var on=state!=='idle'&&!narrating;bar.hidden=!on;document.body&&document.body.classList.toggle('tts-playing',on);
    var m=bar.querySelector('.tts-main');m.innerHTML=state==='playing'?IC.pause:IC.play;m.setAttribute('aria-label',state==='playing'?'Pause':'Resume');
    var v=voice();bar.querySelector('.tts-lab small').textContent=(label?label+' · ':'')+(v?v.name.replace(/\s*\(.*\)$/,''):'');
    document.querySelectorAll('.tts-go').forEach(function(b){var mine=b._items&&Q.length&&b._label===label;b.classList.toggle('active',!!mine&&state!=='idle');});}
  function openPanel(){var vs=english(),cur=voice();
    var opts=vs.map(function(v){return '<option value="'+v.name.replace(/"/g,'&quot;')+'"'+(cur&&v.name===cur.name?' selected':'')+'>'+v.name+' · '+v.lang+' · '+quality(v)+'</option>';}).join('');
    var mac=/Mac/.test(navigator.platform||navigator.userAgent),best=cur&&/premium|natural|neural/i.test(cur.name);
    panel.innerHTML='<div class="tts-ph"><b>Voice settings</b><button type="button" class="tts-b" data-x aria-label="Close">'+IC.stop+'</button></div>'+
      '<label for="tts-voice">Voice</label><select id="tts-voice">'+(opts||'<option>No English voices found</option>')+'</select>'+
      '<div class="tts-row"><button type="button" class="btn" data-test>Hear this voice</button><button type="button" class="ghost" data-auto>Pick the best one for me</button></div>'+
      (best?'<p class="tts-tip">You’re using one of the most natural voices on this device.</p>':
       (mac?'<div class="tts-tip"><b>Get a more natural voice on your Mac (free):</b><ol><li>Open <b>System Settings → Accessibility → Spoken Content</b>.</li><li>Next to <b>System voice</b>, click the <b>ⓘ</b> button (or choose <b>Manage Voices…</b>).</li><li>Under <b>English (United Kingdom)</b>, download a <b>Premium</b> or <b>Enhanced</b> voice, such as Jamie, Serena or Daniel.</li><li>Quit Chrome completely (<b>⌘Q</b>), reopen it, and choose the new voice here.</li></ol></div>':
        '<p class="tts-tip">For the most natural free voices, try this site in Microsoft Edge (Sonia or Ryan), or download a Premium voice on a Mac or iPhone.</p>'));
    panel.hidden=false;var s=panel.querySelector('#tts-voice');s.focus();
    s.addEventListener('change',function(){prefs.voice=s.value;save();ui();});
    panel.querySelector('[data-x]').onclick=function(){panel.hidden=true;};
    panel.querySelector('[data-auto]').onclick=function(){prefs.voice='';save();openPanel();ui();};
    panel.querySelector('[data-test]').onclick=function(){var was=state;if(was==='playing')pause();synth.cancel();var u=new SpeechSynthesisUtterance('Debit the asset, credit the liability. Profit for the year is £42,000.');var v=voice();if(v){u.voice=v;u.lang=v.lang;}u.rate=prefs.rate;synth.speak(u);};}
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(!panel.hidden)panel.hidden=true;}});
  document.addEventListener('click',function(e){if(!panel.hidden&&!panel.contains(e.target)&&!e.target.closest('[data-a="settings"],.tts-set'))panel.hidden=true;});
  if(synth.onvoiceschanged!==undefined)synth.addEventListener?synth.addEventListener('voiceschanged',ui):(synth.onvoiceschanged=ui);
  window.addEventListener('pagehide',function(){try{synth.cancel();}catch(e){}});

  /* ---------- listen buttons ---------- */
  function goBtn(text,cls,getItems,lbl){var b=document.createElement('button');b.type='button';b.className='tts-go '+(cls||'');b.innerHTML=IC.spk+'<span>'+text+'</span>';b._label=lbl;
    b.addEventListener('click',function(e){e.stopPropagation();if(b.classList.contains('active')&&state!=='idle'){state==='playing'?pause():resume();return;}
      var it=getItems();b._items=it;start(it,lbl);});return b;}
  function wire(){
    var page=document.getElementById('page'),art=document.querySelector('main .article');if(!art)return;
    var secs=[].slice.call(art.querySelectorAll(':scope > section.block')).filter(function(s){return /^(basics|learn|example)$/.test(s.id)||(!s.id&&!s.querySelector('#practice-list'));});
    var isTopic=!!document.getElementById('practice-list')||secs.length>1;
    if(isTopic&&secs.length){
      var row=document.createElement('div');row.className='tts-start tts-skip';
      row.append(goBtn('Listen to this page','big',function(){return build(secs.reduce(function(a,x){return a.concat(blocksIn(x));},[]));},'Whole page'));
      var set=document.createElement('button');set.type='button';set.className='ghost tts-set';set.innerHTML=IC.gear+'<span>Voice</span>';set.onclick=function(e){e.stopPropagation();openPanel();};row.append(set);
      var hint=document.createElement('span');hint.className='tts-hint';hint.textContent='Reads the lesson aloud and highlights each sentence as it goes.';row.append(hint);
      secs[0].parentNode.insertBefore(row,secs[0]);
      secs.forEach(function(s){var h=s.querySelector(':scope > h2');if(!h)return;var lbl=h.textContent.trim();
        var idx=secs.indexOf(s);h.append(goBtn('Listen','small',function(){return build(secs.slice(idx).reduce(function(a,x){return a.concat(blocksIn(x));},[]));},lbl));});
    }
    /* practice questions: read the question */
    var pl=document.getElementById('practice-list')||document.getElementById('review-root')||document.getElementById('written-root');
    if(pl){var addQ=function(){pl.querySelectorAll('.q').forEach(function(q){var head=q.querySelector('.q-head');if(!head||head.querySelector('.tts-go'))return;
        head.insertBefore(goBtn('Read','small tts-q',function(){return build([].slice.call(q.querySelectorAll('.q-prompt p, .q-prompt li')).filter(function(p){return !p.classList.contains('hint');}).concat([].slice.call(q.querySelectorAll('table.fields td:first-child'))));},(q.querySelector('.q-head h3')||{}).textContent||'Question'),head.children[2]||null);});};
      addQ();new MutationObserver(function(){addQ();}).observe(pl,{childList:true,subtree:true});}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();

  /* ---------- API for explainers and flashcards ---------- */
  var narrating=false,talkN=0;
  window.GSTTS={
    /* speak a short text (caption); calls done when finished or cancelled */
    say:function(text,done){stopAll(true);narrating=true;gen++;var my=gen;var parts=sentences(text).map(function(s){return speakable(text.slice(s.start,s.end));}).filter(Boolean);var i=0;
      state='playing';
      (function next(){if(my!==gen){return;}if(i>=parts.length){narrating=false;state='idle';done&&done(true);return;}
        var u=new SpeechSynthesisUtterance(parts[i++]);var v=voice();if(v){u.voice=v;u.lang=v.lang;}u.rate=prefs.rate;
        u.onend=function(){if(my===gen)setTimeout(next,60);};u.onerror=function(ev){if(my!==gen)return;if(ev&&(ev.error==='interrupted'||ev.error==='canceled'))return;next();};synth.speak(u);keepAlive();})();},
    hush:function(){if(narrating){narrating=false;talkN=0;gen++;state='idle';try{synth.cancel();}catch(e){}}},
    /* talk: queue one piece of a spoken answer (the tutor); keeps speaking pieces in order as they arrive */
    talk:function(text,onIdle){var t=speakable(String(text||'').replace(/\*\*|__|`|^#+\s*/gm,'').replace(/^\s*[-*•]\s+/gm,'').replace(/^\s*\d+[.)]\s+/gm,''));if(!t||!/[A-Za-z0-9]/.test(t))return;
      if(!narrating||state!=='playing'){stopAll(true);narrating=true;state='playing';gen++;}var my=gen;talkN++;
      var u=new SpeechSynthesisUtterance(t);var v=voice();if(v){u.voice=v;u.lang=v.lang;}else u.lang='en-GB';u.rate=prefs.rate;
      var done=function(){if(my!==gen)return;talkN--;if(talkN<=0){talkN=0;narrating=false;state='idle';onIdle&&onIdle();}};
      u.onend=done;u.onerror=function(ev){if(ev&&(ev.error==='interrupted'||ev.error==='canceled'))return;done();};synth.speak(u);keepAlive();},
    talking:function(){return narrating&&state==='playing'&&talkN>0;},
    read:function(els,lbl){start(build(els),lbl);},
    stop:function(){stopAll();},
    settings:openPanel,
    voice:voice,best:english
  };
  /* ---------- the tutor's voice: Gemini's natural speech, with this device's voice as the backup ---------- */
  (function(){
    var api=window.GSTTS,local={talk:api.talk,hush:api.hush,talking:api.talking};
    var on=/^https?:$/.test(location.protocol)&&!(window.claude&&window.claude.use),down=false;
    var cg=0,buf='',bufT=null,chain=Promise.resolve(),pend=0,cur=null,idleCb=null;
    if(on)fetch('/api/voice',{headers:{accept:'application/json'}}).then(function(r){return r.ok?r.json():null;}).then(function(j){if(!j||!j.ok)on=false;}).catch(function(){on=false;});
    function code(){try{return localStorage.getItem('gs-tutor-code')||'';}catch(e){return '';}}
    function get(text){return fetch('/api/voice',{method:'POST',headers:{'content-type':'application/json','x-tutor-code':code()},body:JSON.stringify({text:text})})
      .then(function(r){if(!r.ok){if(r.status===429||r.status===401||r.status===503)down=true;return null;}return r.blob();}).catch(function(){return null;});}
    function play(blob,my){return new Promise(function(res){if(my!==cg)return res();var url=URL.createObjectURL(blob),a=new Audio(url);cur=a;
      a.onended=a.onerror=function(){URL.revokeObjectURL(url);if(cur===a)cur=null;res();};a.play().catch(function(){cur=null;res(false);});});}
    function flush(){clearTimeout(bufT);bufT=null;var t=buf.trim();buf='';if(!t)return;var my=cg;pend++;
      var p=get(t);   /* start making the audio straight away, while earlier pieces are still playing */
      chain=chain.then(function(){return p;}).then(function(blob){if(my!==cg)return;
        if(blob)return play(blob,my).then(function(ok){if(ok===false&&my===cg)return new Promise(function(res){local.talk(t,res);});});
        return new Promise(function(res){local.talk(t,res);});   /* free allowance used up: use this device's voice */
      }).then(function(){if(my!==cg)return;pend--;if(pend<=0&&!buf){pend=0;var cb=idleCb;idleCb=null;cb&&cb();}});}
    api.talk=function(text,onIdle){
      if(!on||down)return local.talk(text,onIdle);
      var t=speakable(String(text||'').replace(/\*\*|__|`|^#+\s*/gm,'').replace(/^\s*[-*•]\s+/gm,'').replace(/^\s*\d+[.)]\s+/gm,''));
      if(!t||!/[A-Za-z0-9]/.test(t))return;
      idleCb=onIdle||idleCb;var fresh=pend===0&&!buf;buf+=(buf?' ':'')+t;
      /* the first sentence goes at once so speech starts quickly; the rest is gathered into bigger pieces to save the free allowance */
      if(fresh||buf.length>600)flush();else{clearTimeout(bufT);bufT=setTimeout(flush,700);}};
    api.hush=function(){cg++;clearTimeout(bufT);bufT=null;buf='';pend=0;idleCb=null;chain=Promise.resolve();if(cur){try{cur.pause();}catch(e){}cur=null;}local.hush();};
    api.talking=function(){return pend>0||!!buf||local.talking();};
    api.cloud=function(){return on&&!down;};
  })();

})();
