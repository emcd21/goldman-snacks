
/* ---------------- utilities ---------------- */
const KEY='ledgerlab-progress-v1';
const store={get(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}},set(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}};
function record(topic,ok){const p=store.get();const t=p[topic]||{a:0,c:0};if(ok==='attempt')t.a++;else if(ok===true)t.c++;p[topic]=t;store.set(p);}
let _id=0;const uid=()=>'f'+(++_id);
function el(tag,props,...kids){const e=document.createElement(tag);for(const [k,v] of Object.entries(props||{})){if(v==null||v===false)continue;if(k==='class')e.className=v;else if(k==='html')e.innerHTML=v;else if(k==='text')e.textContent=v;else if(k.startsWith('on')&&typeof v==='function')e.addEventListener(k.slice(2),v);else e.setAttribute(k,v===true?'':v);}for(const c of kids.flat(Infinity)){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(String(c)));}return e;}
function parseNum(v){if(v==null)return null;let s=String(v).trim();if(!s)return null;let neg=false;if(/^\(.*\)$/.test(s)){neg=true;s=s.slice(1,-1);}s=s.replace(/[£,%\s:]/g,'').replace(/days?$/i,'');if(s.startsWith('−')||s.startsWith('-')){neg=!neg;s=s.slice(1);}if(s.startsWith('+'))s=s.slice(1);if(s===''||isNaN(+s))return null;const n=+s;return neg?-n:n;}
function fmt(n,dp){if(n==null)return '';const a=Math.abs(n).toLocaleString('en-GB',{minimumFractionDigits:dp||0,maximumFractionDigits:dp==null?2:dp});return n<0?'('+a+')':a;}
const money=n=>'£'+fmt(n);
function rint(min,max,step=1){const lo=Math.ceil(min/step),hi=Math.floor(max/step);return (lo+Math.floor(Math.random()*(hi-lo+1)))*step;}
const pick=a=>a[Math.floor(Math.random()*a.length)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const pickN=(a,n)=>shuffle(a).slice(0,n);
function mark(x,ok){x.classList.toggle('ok',ok===true);x.classList.toggle('bad',ok===false);}
const r1=n=>Math.round(n*10)/10, r2=n=>Math.round(n*100)/100;
const signed=n=>n>0?'+'+fmt(n):n<0?'−'+fmt(Math.abs(n)):'0';

/* ---------------- static renderers (lessons/examples) ---------------- */
function sTable(headers,rows,amtCols=[]){return `<div class="scroll"><table class="ledger simple"><thead><tr>${headers.map((h,i)=>`<th class="${amtCols.includes(i)?'amt':''}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${amtCols.includes(i)?'amt':''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
function sJournal(entries){return `<div class="scroll"><table class="ledger"><thead><tr><th>Account</th><th class="amt">Dr £</th><th class="amt">Cr £</th></tr></thead><tbody>${entries.map(e=>e.lines.map(([a,d,c])=>`<tr><td class="${c?'cr-line':''}">${a}</td><td class="amt">${d?fmt(d):''}</td><td class="amt">${c?fmt(c):''}</td></tr>`).join('')+`<tr class="narr"><td colspan="3">(${e.narr})</td></tr>`).join('')}</tbody></table></div>`;}
function sT(name,dr,cr,total,bd){const n=Math.max(dr.length,cr.length);const side=(arr,h,isDr)=>{let s=`<div class="tacc-side"><div class="tacc-h">${h}</div>`;for(let i=0;i<n;i++){const r=arr[i];s+=r?`<div class="trow"><span>${r[0]}</span><span class="amt">${fmt(r[1])}</span></div>`:`<div class="trow"></div>`;}s+=`<div class="trow tot"><span></span><span class="amt">${fmt(total)}</span></div>`;if(bd&&bd.side===(isDr?'dr':'cr'))s+=`<div class="trow bd"><span>Balance b/d</span><span class="amt">${fmt(bd.amt)}</span></div>`;return s+'</div>';};return `<div class="scroll"><div class="tacc" style="min-width:420px"><div class="tacc-name">${name}</div><div class="tacc-cols">${side(dr,'Dr',true)}${side(cr,'Cr',false)}</div></div></div>`;}

/* statement: rows {l,i,o,b,ind,head,ti,t} where i/o are numbers or {a:number} for inputs */
const CO_NAMES=['Marsh Lane Cycles Ltd','Oakfield Trading Ltd','Kestrel Home Supplies Ltd','Fenland Foods Ltd','Wrenbury Print Ltd','Harbour & Hale Coffee Roasters Ltd'];
const ST_NAMES=['Sam Carter, trading as Carter Plumbing','Amira Khan, trading as Khan’s Deli','Tom Reid, trading as Reid Bikes','Priya Shah, trading as Shah Florists'];
function stmtTable(title,rows,inputs,company,unit){
  const sole=rows.some(r=>r.head==='Capital'||/Opening capital|Drawings|Net profit for the year/.test(r.l||''))||/^Income Statement/.test(title||'');
  const co=company||(inputs?pick(sole?ST_NAMES:CO_NAMES):(sole?ST_NAMES[0]:CO_NAMES[0]));
  let name=title||'',period='';const m=/^(.*?)\s+(for the year ended .*|as at .*)$/i.exec(name);if(m){name=m[1];period=m[2];if(/31 December$|31 March$/.test(period))period+=/March/.test(period)?' 2026':' 2025';}
  const cell=(c,cls,label)=>{const td=el('td',{class:'amt '+(cls||'')});if(c==null)return td;if(typeof c==='object'){const inp=el('input',{class:'num fs-in',type:'text',inputmode:'decimal',autocomplete:'off','aria-label':label||'Amount',id:uid()});inputs&&inputs.push({inp,answer:c.a,signed:c.s});td.className='amt fs-blank '+(cls||'');td.append(inp);return td;}td.textContent=fmt(c);return td;};
  const body=el('tbody',{});
  body.append(el('tr',{class:'fs-hd'},el('td',{}),el('td',{class:'amt',text:unit||'£'}),el('td',{class:'amt',text:unit||'£'})));
  rows.forEach(r=>{
    if(r.head){body.append(el('tr',{class:'fs-sec'},el('td',{colspan:'3',text:r.head})));return;}
    body.append(el('tr',{class:r.b?'fs-b':''},el('td',{class:'fs-label '+(r.ind?'fs-ind':''),text:r.l}),cell(r.i,r.ti?'tl':'',r.l),cell(r.o,r.t==='tot'?'tl':r.t==='dbl'?'dbl':'',r.l)));
  });
  const head=el('div',{class:'fs-head'},el('div',{class:'fs-co',text:co}),name?el('div',{class:'fs-title',text:name}):null,period?el('div',{class:'fs-period',text:period}):null);
  return el('div',{class:'fs-sheet'},head,el('div',{class:'scroll'},el('table',{class:'fs'},body)));
}
const sStmt=(title,rows,co)=>stmtTable(title,rows,null,co).outerHTML;

/* ---------------- widgets ---------------- */
const W={};
function seg(options,onChange){const wrap=el('div',{class:'seg',role:'group'});let val=null;const btns=options.map(o=>el('button',{type:'button','aria-pressed':'false',text:o}));btns.forEach((b,i)=>b.addEventListener('click',()=>set(options[i])));function set(v){val=v;btns.forEach((b,i)=>b.setAttribute('aria-pressed',options[i]===v?'true':'false'));wrap.classList.remove('ok','bad');onChange&&onChange(v);}wrap.append(...btns);return {el:wrap,get:()=>val,set,mark(ok){wrap.classList.toggle('ok',ok===true);wrap.classList.toggle('bad',ok===false);}};}
function numOk(val,f){let v=parseNum(val);if(v==null)return false;let a=f.answer;if(f.abs){v=Math.abs(v);a=Math.abs(a);}return Math.abs(v-a)<=(f.tol??0.5)+1e-9;}

W.fields=q=>{
  const rows=q.fields.map(f=>{const id=uid();const inp=el('input',{id,class:'num',type:'text',inputmode:'decimal',autocomplete:'off'});return {f,inp,tr:el('tr',{},el('td',{},el('label',{for:id,html:f.label})),el('td',{class:'amt-in'},inp),el('td',{class:'hint',text:f.unit||''}))};});
  return {el:el('div',{class:'scroll'},el('table',{class:'ledger fields'},el('tbody',{},rows.map(r=>r.tr)))),
    check(){let n=0;rows.forEach(r=>{const ok=numOk(r.inp.value,r.f);mark(r.inp,ok);if(ok)n++;});return {n,of:rows.length};},
    reveal(){rows.forEach(r=>{r.inp.value=r.f.display??fmt(r.f.answer,r.f.dp);mark(r.inp,true);});}};
};
W.statement=q=>{
  const inputs=[];const node=stmtTable(q.title,q.rows,inputs,q.company,q.unit);
  return {el:node,
    check(){let n=0;inputs.forEach(x=>{const ok=numOk(x.inp.value,{answer:x.answer,abs:!x.signed,tol:q.tol??0.5});mark(x.inp,ok);if(ok)n++;});return {n,of:inputs.length};},
    reveal(){inputs.forEach(x=>{x.inp.value=fmt(x.answer);mark(x.inp,true);});}};
};
/* terms this page hasn't taught yet: glossary terms whose home topic comes later in the course */
const GS_LATER=(function(){try{
  if(!window.GS_DECK)return null;const here=location.pathname.split('/').pop()||'index.html';const order=[];
  document.querySelectorAll('.site-foot h4').forEach((h,i)=>{if(i>4)return;const ul=h.nextElementSibling;if(ul)ul.querySelectorAll('a').forEach(a=>order.push(a.getAttribute('href')));});
  const ti=order.indexOf(here);if(ti<0)return null;
  const body=[...document.querySelectorAll('#basics,#learn,#example')].map(e=>e.textContent).join(' ');
  const esc=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return GS_DECK.filter(d=>order.indexOf(d.f)>ti).map(d=>{const t=d.t.replace(/<[^>]+>/g,'').replace(/\s*\(.*?\)\s*/g,' ').trim();
      const stem=t.replace(/s$/i,'');return {d,t,stem,re:new RegExp('\\b'+esc(stem)+'s?\\b','i')};})
    .filter(x=>x.t.length>=4&&!x.re.test(body));
}catch(e){return null;}})();
W.journal=q=>{
  let accs=q.accounts;if(GS_LATER&&GS_LATER.length){const need=new Set(q.answer.map(a=>a[0]));accs=accs.filter(a=>need.has(a)||!GS_LATER.some(x=>x.re.test(a)));}
  const accounts=[...new Set(accs)].sort();
  const body=el('tbody',{});const rows=[];
  function add(acc='',dr='',cr=''){
    const sel=el('select',{'aria-label':'Account',id:uid()},el('option',{value:'',text:'Choose account…'}),accounts.map(a=>el('option',{value:a,text:a})));sel.value=acc;
    const d=el('input',{class:'num',type:'text',inputmode:'decimal',autocomplete:'off','aria-label':'Debit £',id:uid()});d.value=dr;
    const c=el('input',{class:'num',type:'text',inputmode:'decimal',autocomplete:'off','aria-label':'Credit £',id:uid()});c.value=cr;
    const rm=el('button',{class:'icon-btn',type:'button','aria-label':'Remove line',text:'×'});
    const tr=el('tr',{},el('td',{},sel),el('td',{class:'amt-in'},d),el('td',{class:'amt-in'},c),el('td',{style:'width:2.5rem'},rm));
    const r={tr,sel,d,c};rm.addEventListener('click',()=>{if(rows.length>1){tr.remove();rows.splice(rows.indexOf(r),1);}});
    rows.push(r);body.append(tr);
  }
  q.answer.forEach(()=>add());
  const table=el('table',{class:'ledger'},el('thead',{},el('tr',{},el('th',{text:'Account'}),el('th',{class:'amt',text:'Dr £'}),el('th',{class:'amt',text:'Cr £'}),el('th',{}))),body);
  const node=el('div',{},el('div',{class:'scroll'},table),el('button',{class:'ghost',type:'button',text:'+ Add a line',onclick:()=>add()}));
  return {el:node,
    check(){
      const ans={};q.answer.forEach(([a,dr,cr])=>{ans[a]=(ans[a]||0)+dr-cr;});
      const usr={};let tdr=0,tcr=0;
      rows.forEach(r=>{const a=r.sel.value;const dr=parseNum(r.d.value)||0,cr=parseNum(r.c.value)||0;tdr+=dr;tcr+=cr;
        if(!a&&!dr&&!cr){[r.sel,r.d,r.c].forEach(x=>mark(x,null));return;}
        if(a)usr[a]=(usr[a]||0)+dr-cr;
        const exp=ans[a];mark(r.sel,!!(a&&exp!=null));const ok=!!a&&exp!=null&&Math.abs((dr-cr)-exp)<0.5;mark(r.d,ok);mark(r.c,ok);});
      const keys=new Set([...Object.keys(ans),...Object.keys(usr)]);let n=0,all=true;
      keys.forEach(k=>{if(Math.abs((ans[k]||0)-(usr[k]||0))>=0.5)all=false;else if(ans[k]!=null)n++;});
      const of=Object.keys(ans).length;
      const msg=Math.abs(tdr-tcr)>=0.5?`Your debits total ${money(tdr)} and your credits total ${money(tcr)}. In a journal they must be equal.`:'';
      return {n:all?of:Math.min(n,of-1),of,ok:all,msg};
    },
    reveal(){body.innerHTML='';rows.length=0;q.answer.forEach(([a,dr,cr])=>add(a,dr?fmt(dr):'',cr?fmt(cr):''));rows.forEach(r=>[r.sel,r.d,r.c].forEach(x=>mark(x,true)));}};
};
W.tacct=q=>{
  let dS=0,cS=0;if(q.opening){if(q.opening.side==='dr')dS+=q.opening.amt;else cS+=q.opening.amt;}
  q.items.forEach(it=>{if(it.side==='dr')dS+=it.amt;else cS+=it.amt;});
  const A=dS>=cS?{bal:dS-cS,cd:'cr',bd:'dr',total:dS}:{bal:cS-dS,cd:'dr',bd:'cr',total:cS};
  const sides=q.items.map(()=>null);let shown=false;
  const tview=el('div',{class:'tacc'});
  const segs=q.items.map((it,i)=>seg(['Dr','Cr'],v=>{sides[i]=v.toLowerCase();draw();}));
  const list=el('ol',{class:'tx-list'},q.items.map((it,i)=>el('li',{},el('span',{text:it.text}),el('span',{class:'amt',text:money(it.amt)}),segs[i].el)));
  function draw(){
    const dr=[],cr=[];if(q.opening)(q.opening.side==='dr'?dr:cr).push(['Balance b/d',q.opening.amt]);
    q.items.forEach((it,i)=>{const s=shown?it.side:sides[i];if(s==='dr')dr.push([it.detail,it.amt]);else if(s==='cr')cr.push([it.detail,it.amt]);});
    if(shown)(A.cd==='dr'?dr:cr).push(['Balance c/d',A.bal]);
    const n=Math.max(dr.length,cr.length,3);
    const side=(arr,h,key)=>{const s=el('div',{class:'tacc-side'},el('div',{class:'tacc-h',text:h}));for(let i=0;i<n;i++){const r=arr[i];s.append(r?el('div',{class:'trow'},el('span',{text:r[0]}),el('span',{class:'amt',text:fmt(r[1])})):el('div',{class:'trow'}));}
      if(shown){s.append(el('div',{class:'trow tot'},el('span'),el('span',{class:'amt',text:fmt(A.total)})));s.append(A.bd===key?el('div',{class:'trow bd'},el('span',{text:'Balance b/d'}),el('span',{class:'amt',text:fmt(A.bal)})):el('div',{class:'trow'}));}
      else{const sum=arr.reduce((t,r)=>t+r[1],0);s.append(el('div',{class:'trow run'},el('span',{text:'Running total'}),el('span',{class:'amt',text:fmt(sum)})));}
      return s;};
    tview.innerHTML='';tview.append(el('div',{class:'tacc-name',text:q.name}),el('div',{class:'tacc-cols'},side(dr,'Dr','dr'),side(cr,'Cr','cr')));
  }
  draw();
  const fBal=el('input',{class:'num',type:'text',inputmode:'decimal',autocomplete:'off',id:uid()});
  const fTot=el('input',{class:'num',type:'text',inputmode:'decimal',autocomplete:'off',id:uid()});
  const sCd=el('select',{id:uid()},el('option',{value:'',text:'Choose…'}),el('option',{value:'dr',text:'Debit side'}),el('option',{value:'cr',text:'Credit side'}));
  const sBd=el('select',{id:uid()},el('option',{value:'',text:'Choose…'}),el('option',{value:'dr',text:'Debit side'}),el('option',{value:'cr',text:'Credit side'}));
  const lab=(t,x)=>el('div',{},el('label',{for:x.id,text:t}),x);
  const fields=el('div',{class:'t-fields'},lab('Balance c/d amount (£)',fBal),lab('Balance c/d goes on the',sCd),lab('Total of each side (£)',fTot),lab('Balance b/d next period goes on the',sBd));
  const node=el('div',{},el('div',{class:'t-wrap'},el('div',{},el('p',{class:'hint',text:'Choose the side for each transaction. The account fills in as you go.'}),list),el('div',{class:'scroll',style:'margin:0'},tview)),fields);
  return {el:node,
    check(){let n=0;segs.forEach((s,i)=>{const ok=sides[i]===q.items[i].side;s.mark(ok);if(ok)n++;});
      const c=[[numOk(fBal.value,{answer:A.bal}),fBal],[sCd.value===A.cd,sCd],[numOk(fTot.value,{answer:A.total}),fTot],[sBd.value===A.bd,sBd]];
      c.forEach(([ok,x])=>{mark(x,ok);if(ok)n++;});return {n,of:q.items.length+4};},
    reveal(){shown=true;segs.forEach((s,i)=>{s.set(q.items[i].side==='dr'?'Dr':'Cr');s.mark(true);});shown=true;draw();fBal.value=fmt(A.bal);sCd.value=A.cd;fTot.value=fmt(A.total);sBd.value=A.bd;[fBal,sCd,fTot,sBd].forEach(x=>mark(x,true));}};
};
W.tb=q=>{
  const sides=q.items.map(()=>null);const body=el('tbody',{});
  const drT=el('td',{class:'amt dbl'}),crT=el('td',{class:'amt dbl'}),status=el('p',{class:'hint'});
  const cells=[];
  const segs=q.items.map((it,i)=>{const drC=el('td',{class:'amt'}),crC=el('td',{class:'amt'});cells.push([drC,crC]);const s=seg(['Dr','Cr'],v=>{sides[i]=v.toLowerCase();upd();});body.append(el('tr',{},el('td',{text:it.acc}),el('td',{},s.el),drC,crC));return s;});
  function upd(){let d=0,c=0;q.items.forEach((it,i)=>{cells[i][0].textContent=sides[i]==='dr'?fmt(it.amt):'';cells[i][1].textContent=sides[i]==='cr'?fmt(it.amt):'';if(sides[i]==='dr')d+=it.amt;if(sides[i]==='cr')c+=it.amt;});drT.textContent=fmt(d);crT.textContent=fmt(c);const done=sides.every(s=>s);status.textContent=!done?'Place every balance to see whether the totals agree.':(Math.abs(d-c)<0.5?'The totals agree.':`The totals differ by ${money(Math.abs(d-c))}.`);}
  body.append(el('tr',{class:'bold'},el('td',{text:'Totals'}),el('td'),drT,crT));upd();
  const table=el('table',{class:'ledger'},el('thead',{},el('tr',{class:'title'},el('td',{colspan:'4',text:q.title||'Trial Balance as at 31 December'})),el('tr',{},el('th',{text:'Account'}),el('th',{text:'Side'}),el('th',{class:'amt',text:'Dr £'}),el('th',{class:'amt',text:'Cr £'}))),body);
  return {el:el('div',{},el('div',{class:'scroll'},table),status),
    check(){let n=0;segs.forEach((s,i)=>{const ok=sides[i]===q.items[i].side;s.mark(ok);if(ok)n++;});return {n,of:q.items.length};},
    reveal(){segs.forEach((s,i)=>{s.set(q.items[i].side==='dr'?'Dr':'Cr');s.mark(true);});}};
};
W.classify=q=>{
  const segs=q.items.map(it=>seg(q.options));
  return {el:el('div',{class:'cls'},q.items.map((it,i)=>el('div',{class:'cls-row'},el('span',{html:it.label}),segs[i].el))),
    check(){let n=0;segs.forEach((s,i)=>{const ok=s.get()===q.items[i].answer;s.mark(ok);if(ok)n++;});return {n,of:q.items.length};},
    reveal(){segs.forEach((s,i)=>{s.set(q.items[i].answer);s.mark(true);});}};
};
W.mcq=q=>{
  const name=uid();const labels=[];
  const node=el('div',{class:'mcq',role:'radiogroup'},q.options.map((o,i)=>{const l=el('label',{},el('input',{type:'radio',name,value:String(i)}),el('span',{html:o}));labels.push(l);return l;}));
  const sel=()=>{const x=node.querySelector('input:checked');return x?+x.value:null;};
  return {el:node,
    check(){labels.forEach(l=>mark(l,null));const s=sel();if(s==null)return {n:0,of:1,msg:'Choose an answer first.'};mark(labels[s],s===q.answer);return {n:s===q.answer?1:0,of:1};},
    reveal(){labels.forEach(l=>mark(l,null));labels[q.answer].querySelector('input').checked=true;mark(labels[q.answer],true);}};
};
W.written=q=>{
  const ta=el('textarea',{id:uid(),'aria-label':'Your answer',placeholder:'Write your answer here, then compare it with the model answer.'});
  const out=el('div',{hidden:true});const res=el('p',{class:'hint'});
  const boxes=q.points.map(p=>el('input',{type:'checkbox'}));
  const upd=()=>{const n=boxes.filter(b=>b.checked).length;res.textContent=`You covered ${n} of ${q.points.length} key points.`;};
  boxes.forEach(b=>b.addEventListener('change',upd));
  out.append(el('div',{class:'model'},el('b',{text:'Model answer'}),el('p',{html:q.model})),el('p',{html:'<b>Tick the key points your answer included:</b>'}),el('div',{class:'points'},q.points.map((p,i)=>el('label',{},boxes[i],el('span',{html:p})))),res);
  return {el:el('div',{},ta,out),selfMark:true,
    check(){out.hidden=false;upd();return {self:true};},reveal(){out.hidden=false;upd();}};
};

/* ---------------- question card ---------------- */
const KIND={fields:'Calculation',statement:'Statement',journal:'Journal',tacct:'T-account',tb:'Trial balance',classify:'Sort',mcq:'Multiple choice',written:'Written'};
/* ---------- review list: questions got wrong or revealed ---------- */
const REVIEW_KEY='ledgerlab-review';
function revLoad(){try{return JSON.parse(localStorage.getItem(REVIEW_KEY))||{};}catch(e){return {};}}
function revSave(o){try{localStorage.setItem(REVIEW_KEY,JSON.stringify(o));}catch(e){}}
function revKey(tid,f){const t=TOPICS.find(x=>x.id===tid);const i=t?t.practice.indexOf(f):-1;return i<0?null:tid+':'+i;}
function revMark(tid,f,miss){const k=revKey(tid,f);if(!k)return;const o=revLoad();if(miss){o[k]={t:Date.now(),n:((o[k]&&o[k].n)||0)+1};}else if(o[k]){delete o[k];}else return;revSave(o);}
function card(topicId,factory,label,onResult){
  const wrap=el('article',{class:'q'});
  function render(){
    const q=factory.make();const w=W[q.type](q);
    const state={attempted:false,solved:false,revealed:false};wrap.classList.remove('solved');
    const fb=el('div',{class:'fb',hidden:true});
    const head=el('div',{class:'q-head'},el('h3',{text:label}),el('span',{class:'tag',text:q.kind||KIND[q.type]}));
    if(factory.gen)head.append(el('button',{class:'ghost',type:'button',text:q.type==='mcq'||q.type==='written'?'Another question':'New numbers',onclick:render}));
    const checkBtn=el('button',{class:'btn',type:'button',text:q.type==='written'?'Compare with model answer':'Check answer'});
    const showBtn=el('button',{class:'ghost',type:'button',text:'Show answer'});
    const explain=q.explain?`<p>${q.explain}</p>`:'';
    checkBtn.addEventListener('click',()=>{
      const r=w.check();fb.hidden=false;
      if(r.self){fb.className='fb shown';fb.innerHTML=explain||'<p>Compare your answer with the model answer above.</p>';return;}
      if(r.msg&&r.n===0&&r.of===1&&q.type==='mcq'&&r.msg.startsWith('Choose')){fb.className='fb part';fb.innerHTML=`<p>${r.msg}</p>`;return;}
      const ok=r.ok??(r.n===r.of);
      if(!state.attempted){state.attempted=true;record(topicId,'attempt');onResult&&onResult('attempt');}
      if(ok&&!state.solved&&!state.revealed){state.solved=true;record(topicId,true);onResult&&onResult(true);}
      if(ok&&!state.revealed)revMark(topicId,factory,false);else if(!ok&&!state.missed){state.missed=true;revMark(topicId,factory,true);}
      if(ok){wrap.classList.add('solved');fb.className='fb good';fb.innerHTML=`<p class="fb-title"><svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5"/><path d="M7 12.5l3.2 3.2L17 9"/></svg><b>Correct.</b></p>${explain}`;}
      else{fb.className='fb part';fb.innerHTML=`<p><b>${r.n} of ${r.of} correct.</b> Answers marked in red need another look. Try again, or show the answer.</p>${r.msg?`<p>${r.msg}</p>`:''}`;}
    });
    showBtn.addEventListener('click',()=>{w.reveal();state.revealed=true;if(!state.missed){state.missed=true;revMark(topicId,factory,true);}if(!state.attempted){state.attempted=true;record(topicId,'attempt');onResult&&onResult('attempt');}fb.hidden=false;fb.className='fb shown';fb.innerHTML=`<p><b>Answer shown.</b></p>${explain}`;});
    wrap.innerHTML='';
    wrap.append(head,el('div',{class:'q-prompt',html:q.prompt}),w.el,el('div',{class:'q-actions'},checkBtn,q.type==='written'?null:showBtn),fb);
  }
  render();return wrap;
}
const fixed=(q)=>({gen:false,make:()=>q});
const gen=(fn)=>({gen:true,make:fn});
const mcqPool=(pool)=>gen(()=>{const q=pick(pool);const order=shuffle(q.options.map((o,i)=>i));return {type:'mcq',prompt:`<p>${q.q}</p>`,options:order.map(i=>q.options[i]),answer:order.indexOf(0),explain:q.why};});

/* ---------------- shared account lists ---------------- */
const ACCTS=['Cash','Sales','Trade receivables','Purchases','Trade payables','Rent','Wages','Drawings','Capital','Bank loan','Equipment','Inventory','Cost of sales','Electricity','Insurance','Prepayments','Accruals','Deferred income','Rent received','Depreciation expense','Accumulated depreciation','Motor vehicles'];

/* ================= TOPICS ================= */
const TOPICS=[];

/* ---------- 1. Accounting equation ---------- */
const EQ_T=[
 ()=>{const x=rint(5,40)*500;return {t:`The owner puts ${money(x)} of their own money into the business bank account.`,a:x,l:0,e:x,why:'Cash (an asset) rises, and so does capital (equity), because the money belongs to the owner.'};},
 ()=>{const x=rint(4,30)*250;return {t:`Buys equipment for ${money(x)}, paying from the bank.`,a:0,l:0,e:0,why:'One asset (equipment) replaces another (cash), so total assets don’t change.'};},
 ()=>{const x=rint(4,24)*250;return {t:`Buys inventory for ${money(x)} on credit.`,a:x,l:x,e:0,why:'Inventory (an asset) rises and the business now owes the supplier (a liability).'};},
 ()=>{const x=rint(4,30)*500;return {t:`Receives a bank loan of ${money(x)}.`,a:x,l:x,e:0,why:'Cash rises, and the loan is a liability because it must be repaid.'};},
 ()=>{const x=rint(2,12)*250;return {t:`Pays a supplier ${money(x)} that was owed.`,a:-x,l:-x,e:0,why:'Cash falls and the amount owed to the supplier falls by the same amount.'};},
 ()=>{const x=rint(2,12)*100;return {t:`The owner takes ${money(x)} from the business for personal use.`,a:-x,l:0,e:-x,why:'Drawings take value out of the business: cash falls and equity falls. Drawings are not a business expense.'};},
 ()=>{const x=rint(3,15)*100;return {t:`Pays rent of ${money(x)} from the bank.`,a:-x,l:0,e:-x,why:'Rent is an expense. Expenses reduce profit, and profit belongs to the owner, so equity falls along with cash.'};},
 ()=>{const x=rint(4,20)*150;return {t:`Provides a service to a customer for ${money(x)} cash.`,a:x,l:0,e:x,why:'Cash rises. The income increases profit, which increases equity.'};},
 ()=>{const x=rint(3,16)*125;return {t:`A customer pays ${money(x)} they owed.`,a:0,l:0,e:0,why:'Cash rises and trade receivables fall by the same amount, so total assets don’t change.'};},
];
TOPICS.push({id:'equation',level:'f',title:'The accounting equation',blurb:'Why every transaction has two effects, and how assets, liabilities and equity stay in balance.',
lesson:`<p>Every transaction changes at least two things. After every transaction, this equation is still true:</p>
<div class="formula">Assets = Liabilities + Equity</div>
<ul>
<li><b>Assets</b> are things the business owns or is owed. Examples: cash, inventory (goods to sell), equipment, money customers owe.</li>
<li><b>Liabilities</b> are amounts the business owes to other people. Examples: unpaid suppliers, bank loans, tax.</li>
<li><b>Equity</b> is the owner’s share. It is the money the owner put in, plus profit kept in the business, minus money the owner took out (drawings).</li>
</ul>
<p>Most transactions follow one of these four patterns:</p>
${sTable(['Pattern','Example','What happens to the equation'],[
['An asset goes up, and a liability or equity goes up by the same amount','The owner puts in £5,000 cash','Assets +£5,000. Equity +£5,000.'],
['One asset goes up and another asset goes down','Buy equipment for £2,000 cash','Equipment +£2,000. Cash −£2,000. Totals do not change.'],
['An asset goes down, and a liability or equity goes down by the same amount','Pay a supplier £800','Cash −£800. Liabilities −£800.'],
['Income or an expense','Pay rent of £500','Cash −£500. Equity −£500, because an expense reduces profit.']])}
<div class="note"><b>Why income and expenses change equity.</b> Profit belongs to the owner. Income increases profit, so it increases equity. Expenses reduce profit, so they reduce equity.</div>`,
example:`<p>A new business has four transactions. Track the totals after each one.</p>
${sTable(['Transaction','Assets £','Liabilities £','Equity £'],[
['1. Owner invests £10,000 cash','10,000','0','10,000'],
['2. Buys a van for £6,000 cash','10,000','0','10,000'],
['3. Buys inventory for £2,000 on credit','12,000','2,000','10,000'],
['4. Pays rent of £500','11,500','2,000','9,500']],[1,2,3])}
<p>After every line, assets equal liabilities plus equity. Transaction 2 changes the mix of assets (£6,000 van, £4,000 cash) but not the total. Transaction 4 reduces equity because rent is an expense.</p>`,
practice:[
 gen(()=>{const ts=pickN(EQ_T,4).map(f=>f());return {type:'fields',kind:'Calculation',prompt:`<p>Enter the net change to each element for every transaction. Use + or − (or brackets for a decrease), and 0 for no change.</p><ol>${ts.map(t=>`<li>${t.t}</li>`).join('')}</ol>`,
  fields:ts.flatMap((t,i)=>[{label:`${i+1}. Assets`,answer:t.a,display:signed(t.a)},{label:`${i+1}. Liabilities`,answer:t.l,display:signed(t.l)},{label:`${i+1}. Equity`,answer:t.e,display:signed(t.e)}]),
  explain:ts.map((t,i)=>`<b>${i+1}.</b> ${t.why}`).join('<br>')};}),
 gen(()=>{const a=rint(20,120)*1000,l=rint(5,Math.floor(a/1000)-5)*1000;return {type:'fields',prompt:`<p>A business has assets of ${money(a)} and liabilities of ${money(l)}.</p>`,fields:[{label:'Equity (£)',answer:a-l}],explain:`Equity = Assets − Liabilities = ${money(a)} − ${money(l)} = ${money(a-l)}.`};}),
 mcqPool([
  {q:'Which transaction leaves total assets unchanged?',options:['Buying equipment for cash','Taking out a bank loan','Paying a supplier','The owner investing more cash'],why:'Buying equipment for cash swaps one asset for another. The others change total assets.'},
  {q:'The owner takes £500 cash for personal use. What is the effect?',options:['Assets −£500, equity −£500','Assets −£500, liabilities −£500','Expenses +£500 only','No effect, because it is the owner’s money'],why:'Drawings reduce cash and reduce the owner’s stake. They are not an expense.'},
  {q:'A business buys inventory on credit. What happens?',options:['Assets and liabilities both rise','Assets rise and equity rises','Assets rise and fall by the same amount','Liabilities rise and equity falls'],why:'Inventory is an asset, and the amount owed to the supplier is a liability.'},
  {q:'Which of these increases equity?',options:['Making a profit','Repaying a loan','Buying a van on credit','Paying a supplier'],why:'Profit belongs to the owner, so it increases equity. The others don’t affect equity.'}])
]});

/* ---------- 2. Debit and credit rules ---------- */
/* only accounts a beginner meets in the first topics: nothing that is taught later (accruals, depreciation, share capital…) */
const ACC_POOL=[['Cash at bank','Asset'],['Inventory (goods for resale)','Asset'],['Trade receivables','Asset'],['Equipment','Asset'],['Motor vehicles','Asset'],['Office furniture','Asset'],['Land and buildings','Asset'],['Trade payables','Liability'],['Bank loan','Liability'],['Bank overdraft','Liability'],['Loan from a friend','Liability'],['Capital','Equity'],['Sales','Income'],['Rent received','Income'],['Interest received','Income'],['Commission received','Income'],['Rent','Expense'],['Wages','Expense'],['Electricity','Expense'],['Purchases','Expense'],['Insurance','Expense'],['Telephone','Expense'],['Advertising','Expense'],['Bank charges','Expense']];
const NORMAL={Asset:'Debit',Expense:'Debit',Liability:'Credit',Equity:'Credit',Income:'Credit'};
TOPICS.push({id:'dcrules',level:'f',title:'Debits, credits and account types',blurb:'The five account types and the DEAD CLIC rule for which side an entry goes on.',
lesson:`<p>There are five types of account. The type tells you which side to use when the account goes <b>up</b>.</p>
${sTable(['Type','What it is','Examples','To increase it','Its balance is usually'],[
['Asset','Something owned or owed to the business','Cash, inventory, equipment, trade receivables','Debit','Debit'],
['Liability','Something the business owes','Trade payables, bank loan, accruals','Credit','Credit'],
['Equity (capital)','The owner’s share','Capital, retained earnings','Credit','Credit'],
['Income','Money the business earns','Sales, rent received, interest received','Credit','Credit'],
['Expense','A cost of running the business','Rent, wages, purchases, depreciation','Debit','Debit']])}
<h3>A way to remember it: DEAD CLIC</h3>
<div class="formula">DEAD = Debit: Drawings, Expenses, Assets &nbsp;·&nbsp; CLIC = Credit: Liabilities, Income, Capital</div>
<p>This tells you the side that makes each account go <b>up</b>. To make an account go <b>down</b>, use the other side.</p>
<p><b>Example:</b> The business pays £300 of wages in cash. Wages is an expense and it goes up, so <b>debit</b> Wages £300. Cash is an asset and it goes down, so <b>credit</b> Cash £300.</p>
<h3>Why the rule works</h3>
<p>In Assets = Liabilities + Equity, assets are on the left. So assets go up on the left side of an account (debit). Liabilities and equity are on the right. So they go up on the right side (credit). Income increases equity, so it also goes up on the credit side. Expenses and drawings reduce equity, so they go up on the debit side.</p>
<div class="note"><b>Remember.</b> Debit only means left. Credit only means right. They do not mean good or bad.</div>`,
example:`<p><b>The business pays £300 of wages from the bank.</b></p>
${sTable(['Account','Type','Increase or decrease?','Side'],[['Wages','Expense','Increase','Debit'],['Cash at bank','Asset','Decrease','Credit']])}
<p>One debit and one credit for the same amount, so the double entry balances.</p>`,
practice:[
 gen(()=>({type:'classify',prompt:'<p>Classify each account.</p>',options:['Asset','Liability','Equity','Income','Expense'],items:pickN(ACC_POOL,8).map(([l,a])=>({label:l,answer:a})),explain:'Assets are owned or owed to you, liabilities are owed by you, equity is the owner’s stake, income is earned, and expenses are costs of running the business.'})),
 gen(()=>({type:'classify',prompt:'<p>Which side records each change?</p>',options:['Debit','Credit'],items:pickN(ACC_POOL,8).map(([l,t])=>{const inc=Math.random()<0.6;const n=NORMAL[t];return {label:`${inc?'Increase':'Decrease'} in <b>${l}</b>`,answer:inc?n:(n==='Debit'?'Credit':'Debit')};}),explain:'Use DEAD CLIC for increases (Drawings, Expenses, Assets are debited; Liabilities, Income, Capital are credited). A decrease goes on the opposite side.'})),
 mcqPool([
  {q:'Which account normally has a debit balance?',options:['Trade receivables','Trade payables','Sales revenue','Capital'],why:'Trade receivables are an asset (customers owe you), and assets have debit balances.'},
  {q:'The business pays a supplier £400 from the bank. The entry is:',options:['Dr Trade payables, Cr Cash','Dr Cash, Cr Trade payables','Dr Purchases, Cr Cash','Dr Trade payables, Cr Purchases'],why:'The liability falls (debit) and cash falls (credit).'},
  {q:'Why are expenses debited?',options:['They reduce equity, and decreases in equity are debits','Because they are assets','Because cash always goes on the credit side','Because they are bad for the business'],why:'Expenses reduce profit and therefore equity, so they sit on the opposite side to equity.'},
  {q:'Which of these is increased by a credit?',options:['Rent received','Drawings','Inventory','Electricity'],why:'Rent received is income. Income is increased by a credit (the I in CLIC).'}])
]});

/* ---------- 3. Journal entries ---------- */
const J_T=[
 x=>({t:`Sold goods for ${money(x)} cash.`,a:[['Cash',x,0],['Sales',0,x]],why:'Cash (asset) increases, so it is debited. Sales (income) increases, so it is credited.'}),
 x=>({t:`Sold goods on credit for ${money(x)}.`,a:[['Trade receivables',x,0],['Sales',0,x]],why:'The customer now owes you (an asset increasing, debit). Sales income increases (credit).'}),
 x=>({t:`Bought goods for resale on credit, ${money(x)}.`,a:[['Purchases',x,0],['Trade payables',0,x]],why:'Purchases is an expense (debit). You owe the supplier, so the liability increases (credit).'}),
 x=>({t:`Bought goods for resale, paying ${money(x)} cash.`,a:[['Purchases',x,0],['Cash',0,x]],why:'Purchases (expense) is debited. Cash falls, so it is credited.'}),
 x=>({t:`Paid a supplier ${money(x)} from the bank.`,a:[['Trade payables',x,0],['Cash',0,x]],why:'The amount owed falls (debit the liability). Cash falls (credit).'}),
 x=>({t:`A credit customer paid ${money(x)} into the bank.`,a:[['Cash',x,0],['Trade receivables',0,x]],why:'Cash rises (debit). The customer owes less, so receivables fall (credit).'}),
 x=>({t:`Paid rent of ${money(x)} from the bank.`,a:[['Rent',x,0],['Cash',0,x]],why:'Rent is an expense (debit). Cash falls (credit).'}),
 x=>({t:`Paid wages of ${money(x)} from the bank.`,a:[['Wages',x,0],['Cash',0,x]],why:'Wages are an expense (debit). Cash falls (credit).'}),
 x=>({t:`The owner took ${money(x)} cash for personal use.`,a:[['Drawings',x,0],['Cash',0,x]],why:'Drawings are debited (the D in DEAD). Cash falls (credit).'}),
 x=>({t:`The owner paid ${money(x)} into the business bank account as capital.`,a:[['Cash',x,0],['Capital',0,x]],why:'Cash rises (debit). Capital (equity) rises (credit).'}),
 x=>({t:`Received a bank loan of ${money(x)}.`,a:[['Cash',x,0],['Bank loan',0,x]],why:'Cash rises (debit). The loan is a liability that increases (credit).'}),
 x=>({t:`Bought equipment for ${money(x)}, paying from the bank.`,a:[['Equipment',x,0],['Cash',0,x]],why:'Equipment (asset) increases (debit). Cash falls (credit).'}),
 x=>({t:`Paid the electricity bill of ${money(x)} from the bank.`,a:[['Electricity',x,0],['Cash',0,x]],why:'Electricity is an expense (debit). Cash falls (credit).'}),
];
function jq(tpl){const x=rint(4,80)*25;const t=tpl(x);return {type:'journal',prompt:`<p>Record this transaction in the journal.</p><p><b>${t.t}</b></p>`,accounts:ACCTS,answer:t.a,explain:t.why};}
TOPICS.push({id:'journals',level:'f',title:'Journal entries',blurb:'Turning transactions into balanced debits and credits, set out in the standard journal format.',
lesson:`<p>A journal entry is the first place a transaction is written down. It says which account to debit, which account to credit, and how much. Later, each line is copied into the accounts. This copying is called <b>posting</b>.</p>
<h3>How to lay it out</h3>
<ul><li>Write the debit line first.</li><li>Write the credit line underneath, moved slightly to the right.</li><li>Under both lines, write a short note in brackets that says what happened. This is called the <b>narration</b>.</li><li>The total of the debits must equal the total of the credits.</li></ul>
<h3>Steps for every transaction</h3>
<ol><li>Write down the accounts that change. There are always at least two.</li><li>For each account, write its type (asset, liability, equity, income or expense). Then write whether it goes up or down.</li><li>Use DEAD CLIC to choose debit or credit.</li><li>Check that the debits equal the credits.</li><li>Write the narration.</li></ol>
<p><b>Example:</b> A customer buys goods for £400 and will pay next month. Step 1: Trade receivables and Sales. Step 2: Trade receivables is an asset and goes up. Sales is income and goes up. Step 3: Debit Trade receivables £400. Credit Sales £400. Step 4: £400 = £400. Step 5: (Goods sold on credit to a customer.)</p>
<h3>Common entries</h3>
${sTable(['Transaction','Debit','Credit'],[
['Cash sale','Cash','Sales'],['Credit sale (customer pays later)','Trade receivables','Sales'],['Buy goods on credit (pay the supplier later)','Purchases','Trade payables'],['A customer pays what they owe','Cash','Trade receivables'],['Pay a supplier what you owe','Trade payables','Cash'],['Pay an expense','The expense account','Cash'],['The owner puts money in','Cash','Capital'],['The owner takes money out','Drawings','Cash'],['Receive a loan','Cash','Bank loan'],['Buy a long-term asset, such as a van','The asset account','Cash, or Trade payables if paid later']])}
<div class="note"><b>“On credit”</b> means paid later. When you sell on credit, the customer owes you (trade receivables). When you buy on credit, you owe the supplier (trade payables). It does not mean a credit entry to Cash.</div>
<div class="note warn"><b>Year 3 (perpetual inventory).</b> Some businesses update their inventory record every time goods come in or go out. Then a sale needs two entries. First, record the sale at the selling price: debit Cash or Trade receivables, credit Sales. Second, remove the goods at what they cost: debit Cost of sales, credit Inventory. Goods bought are debited to Inventory, not Purchases.</div>`,
example:`<p><b>(1)</b> Goods costing £700 are sold on credit for £1,200 (perpetual inventory). <b>(2)</b> Wages of £400 are paid from the bank.</p>
${sJournal([{lines:[['Trade receivables',1200,0],['Sales',0,1200],['Cost of sales',700,0],['Inventory',0,700]],narr:'Credit sale and cost of goods sold'},{lines:[['Wages',400,0],['Cash',0,400]],narr:'Wages paid'}])}`,
practice:[
 gen(()=>jq(pick(J_T.slice(0,5)))),
 gen(()=>jq(pick(J_T.slice(5,9)))),
 gen(()=>jq(pick(J_T.slice(9)))),
 gen(()=>{const tot=rint(20,80)*100,cash=rint(5,Math.floor(tot/100)-5)*100;return {type:'journal',prompt:`<p>Bought equipment for ${money(tot)}. Paid ${money(cash)} from the bank and owe the supplier the rest.</p>`,accounts:ACCTS,answer:[['Equipment',tot,0],['Cash',0,cash],['Trade payables',0,tot-cash]],explain:`The equipment is debited at its full cost of ${money(tot)}. The credit is split between cash paid (${money(cash)}) and the amount still owed (${money(tot-cash)}). One debit equals the two credits.`};}),
 gen(()=>{const cost=rint(8,60)*50,sale=cost+rint(4,40)*50;const credit=Math.random()<0.5;return {type:'journal',kind:'Journal · Year 3',prompt:`<p>The business uses perpetual inventory. It sells goods that cost ${money(cost)} for ${money(sale)} ${credit?'on credit':'cash'}.</p>`,accounts:ACCTS,answer:[[credit?'Trade receivables':'Cash',sale,0],['Sales',0,sale],['Cost of sales',cost,0],['Inventory',0,cost]],explain:`Two parts: record the revenue at selling price (Dr ${credit?'Trade receivables':'Cash'}, Cr Sales ${money(sale)}), then remove the goods from inventory at cost (Dr Cost of sales, Cr Inventory ${money(cost)}).`};})
]});

/* ---------- 4. T-accounts ---------- */
function cashAcct(){for(;;){const open=rint(20,80)*50;const R=[['Cash sales','Sales'],['Received from a credit customer','Trade receivables'],['Loan received','Bank loan'],['Commission received','Commission received']];const P=[['Paid rent','Rent'],['Paid wages','Wages'],['Paid a supplier','Trade payables'],['Owner took cash for personal use','Drawings'],['Paid electricity','Electricity']];
  const items=shuffle([...pickN(R,2).map(([t,d])=>({t,d,side:'dr'})),...pickN(P,3).map(([t,d])=>({t,d,side:'cr'}))]).map(o=>({text:o.t,detail:o.d,side:o.side,amt:rint(2,40)*25}));
  let bal=open;items.forEach(i=>bal+=i.side==='dr'?i.amt:-i.amt);if(bal>0)return {name:'Cash Account',opening:{side:'dr',amt:open},items};}}
function payAcct(){for(;;){const open=rint(20,90)*50;const items=shuffle([{text:'Bought goods on credit',detail:'Purchases',side:'cr'},{text:'Bought more goods on credit',detail:'Purchases',side:'cr'},{text:'Paid the supplier from the bank',detail:'Cash',side:'dr'},{text:'Paid the supplier again',detail:'Cash',side:'dr'},{text:'Returned faulty goods to the supplier',detail:'Purchases returns',side:'dr'}]).map(o=>({...o,amt:rint(4,60)*25}));
  let bal=open;items.forEach(i=>bal+=i.side==='cr'?i.amt:-i.amt);if(bal>0)return {name:'Trade Payables Account',opening:{side:'cr',amt:open},items};}}
TOPICS.push({id:'taccounts',level:'f',title:'T-accounts and balancing off',blurb:'Posting to ledger accounts and working out closing balances with c/d and b/d.',
lesson:`<p>Each account is drawn as a letter T. Debits go on the left. Credits go on the right. Each line shows three things: the date, the name of the <b>other</b> account in the entry, and the amount.</p>
<h3>How to post a journal entry</h3>
<p>The journal says: debit Cash £500, credit Sales £500.</p>
<ul><li>In the <b>Cash</b> account, write £500 on the <b>left</b>. In the details, write “Sales”.</li><li>In the <b>Sales</b> account, write £500 on the <b>right</b>. In the details, write “Cash”.</li></ul>
<h3>How to balance an account (find what is left)</h3>
<ol><li>Add up the left side. Add up the right side.</li><li>Take the bigger total. Write it at the bottom of <b>both</b> sides, on the same line.</li><li>On the smaller side, write the difference above the total. Label it <b>Balance c/d</b> (“carried down”). Now both sides add up to the same total.</li><li>Below the totals, write the same amount on the <b>other</b> side. Label it <b>Balance b/d</b> (“brought down”). This is the starting balance for the next period.</li></ol>
<p><b>Example:</b> Cash has £900 on the left and £650 on the right. The bigger total is £900. The difference is £900 − £650 = £250. Write “Balance c/d £250” on the right, so the right side totals £900. Below the totals, write “Balance b/d £250” on the left.</p>
<div class="note"><b>What the balance tells you.</b> If the balance b/d is on the <b>debit</b> side, the account is an asset or an expense, for example cash you hold. If it is on the <b>credit</b> side, the account is a liability, income or capital, for example money you owe.</div>`,
example:`<p>Bank: opening balance £1,000 debit. Received £600 from a customer. Paid £250 for electricity and £900 to a supplier.</p>
${sT('Cash Account',[['Balance b/d',1000],['Trade receivables',600]],[['Electricity',250],['Trade payables',900],['Balance c/d',450]],1600,{side:'dr',amt:450})}
<p>Debits total £1,600 and credits total £1,150. The £450 difference is carried down on the credit side so both sides total £1,600, then brought down on the debit side as the opening balance.</p>`,
practice:[
 gen(()=>{const a=cashAcct();return {type:'tacct',prompt:`<p>Post these transactions to the Cash account, then balance it off. The opening balance is ${money(a.opening.amt)} debit.</p>`,...a,explain:'Money in is debited to Cash and money out is credited. The difference between the two sides is carried down on the smaller side (credit) and brought down on the debit side, showing cash still held.'};}),
 gen(()=>{const a=payAcct();return {type:'tacct',prompt:`<p>Post these transactions to the Trade Payables account (a liability), then balance it off. The opening balance is ${money(a.opening.amt)} credit.</p>`,...a,explain:'Trade payables is a liability, so buying on credit increases it (credit) and paying or returning goods reduces it (debit). The credit side is larger, so the balance c/d goes on the debit side and the balance b/d comes down on the credit side: the amount still owed.'};}),
 mcqPool([
  {q:'An account has debits of £5,200 and credits of £3,900. Where does the balance c/d go?',options:['£1,300 on the credit side','£1,300 on the debit side','£9,100 on the credit side','£5,200 on both sides'],why:'The c/d figure goes on the smaller (credit) side to make both sides total £5,200. It is then brought down on the debit side.'},
  {q:'A credit balance brought down on the Trade Payables account means:',options:['The business still owes suppliers that amount','Suppliers owe the business that amount','The account has been posted wrongly','The business has overpaid its suppliers'],why:'Trade payables is a liability, and liabilities have credit balances.'},
  {q:'In the Cash account, what goes in the details column for a cash sale?',options:['Sales','Cash','The customer’s name','Receivables'],why:'The details column names the other account in the double entry, which is Sales.'}])
]});

/* ---------- 5. Trial balance ---------- */
function tbGen(){for(;;){const drPool=[['Cash',500,8000],['Equipment',3000,20000],['Inventory',1000,8000],['Trade receivables',500,6000],['Motor vehicles',4000,15000],['Purchases',5000,30000],['Rent',1000,8000],['Wages',2000,15000],['Electricity',200,2000],['Drawings',1000,6000],['Insurance',200,1500]];
 const dr=pickN(drPool,6).map(([a,lo,hi])=>({acc:a,amt:rint(lo,hi,50),side:'dr'}));
 const cr=[{acc:'Sales',amt:rint(15000,50000,50),side:'cr'},...pickN([['Trade payables',500,6000],['Bank loan',2000,15000],['Rent received',300,3000]],2).map(([a,lo,hi])=>({acc:a,amt:rint(lo,hi,50),side:'cr'}))];
 const cap=dr.reduce((t,x)=>t+x.amt,0)-cr.reduce((t,x)=>t+x.amt,0);if(cap<2000)continue;
 return shuffle([...dr,...cr,{acc:'Capital',amt:cap,side:'cr'}]);}}
TOPICS.push({id:'tb',level:'f',title:'Trial balance',blurb:'Listing every balance on the right side, and what a trial balance can and can’t prove.',
lesson:`<p>A trial balance is a list of every account’s balance on one date. Each balance goes in either the debit column or the credit column. Every entry was made with an equal debit and credit, so the two column totals should be the same.</p>
<h3>Which column does each balance go in?</h3>
<p><b>Debit column:</b> assets, expenses, purchases, drawings. <b>Credit column:</b> liabilities, income, capital. This is the same DEAD CLIC rule.</p>
<p><b>Example:</b> Cash £2,000 goes in the debit column (asset). A bank loan of £5,000 goes in the credit column (liability).</p>
<h3>Mistakes a trial balance does not find</h3>
<p>These mistakes still give equal totals, so the trial balance will not show them:</p>
${sTable(['Name of the error','What happened','Example'],[['Omission','The transaction was not recorded at all','A £200 sale was never entered'],['Commission','The right type of account, but the wrong one','Posted to J Smith instead of J Smyth'],['Principle','The wrong type of account','A new van (asset) debited to Motor expenses'],['Original entry','The wrong amount was used on both sides','£540 recorded as £450 in both accounts'],['Complete reversal','The right accounts, but debit and credit swapped','Debit Sales, credit Cash for a cash sale'],['Compensating','Two mistakes of the same size cancel out','Rent £100 too high and Sales £100 too high']])}
<h3>How to find a difference</h3>
<ol><li>Add up both columns again.</li><li>Divide the difference by 2. Look for a balance of that amount. It may be in the wrong column.</li><li>If the difference divides exactly by 9, look for two digits swapped round. Example: £1,260 written as £1,620. The difference is £360, and £360 ÷ 9 = £40.</li><li>Look for a balance that has been left off the list.</li></ol>
<div class="note"><b>Remember.</b> Equal totals only show that the debits and credits are equal. They do not prove every entry is correct.</div>`,
example:sTable(['Account','Dr £','Cr £'],[['Cash','450',''],['Equipment','5,000',''],['Wages','400',''],['Capital','','4,000'],['Bank loan','','1,000'],['Sales','','850'],['<b>Totals</b>','<b>5,850</b>','<b>5,850</b>']],[1,2]),
practice:[
 gen(()=>({type:'tb',prompt:'<p>Place each balance in the debit or credit column. The totals update as you go.</p>',items:tbGen(),explain:'Assets, expenses, purchases and drawings are debit balances. Capital, liabilities, sales and other income are credit balances.'})),
 gen(()=>{const d=rint(4,90)*10,big=rint(20000,40000,10);return {type:'fields',prompt:`<p>A trial balance shows debits of ${money(big+2*d)} and credits of ${money(big)}. You suspect one balance has been put on the wrong side.</p>`,fields:[{label:'Difference (£)',answer:2*d},{label:'Size of the balance to look for (£)',answer:d}],explain:`Putting a balance on the wrong side moves it from one column to the other, so the difference is twice the balance. Halve ${money(2*d)} to get ${money(d)}.`};}),
 mcqPool([
  {q:'A £200 rent payment was not recorded at all. Will the trial balance still agree?',options:['Yes, it is an error of omission','No, the debits will be £200 short','No, the credits will be £200 short','Yes, it is an error of principle'],why:'Nothing was posted to either side, so both totals are equally wrong and still agree.'},
  {q:'The purchase of a delivery van was debited to Motor expenses. Which error is this?',options:['Error of principle','Error of commission','Error of original entry','Compensating error'],why:'An asset was posted to an expense account, which is the wrong type of account.'},
  {q:'A sale to J Smith was posted to J Smyth’s account. Which error is this?',options:['Error of commission','Error of principle','Complete reversal','Error of omission'],why:'The right type of account (a receivable) but the wrong one.'},
  {q:'An invoice for £540 was entered as £450 in both accounts. Which error is this?',options:['Error of original entry','Transposition error that the trial balance will show','Error of commission','Compensating error'],why:'The wrong amount was used on both sides, so the trial balance still agrees.'}])
]});

/* ---------- 6. Adjustments ---------- */
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
TOPICS.push({id:'adjustments',level:'f',title:'Accruals and prepayments',blurb:'Year-end adjustments that match income and expenses to the period they belong to.',
lesson:`<p><b>The accruals concept:</b> income and expenses go in the year they belong to. The date the cash was paid or received does not decide this. At the year end, you make adjustments where the two dates are different.</p>
${sTable(['Situation','Name','Journal','Shown on the balance sheet as'],[
['A cost used this year but not paid yet','Accrued expense (accrual)','Debit the expense. Credit Accruals.','Current liability'],
['A cost paid this year for next year','Prepayment','Debit Prepayments. Credit the expense.','Current asset'],
['Income earned this year but not received yet','Accrued income','Debit Accrued income. Credit the income.','Current asset'],
['Income received this year for next year','Deferred income','Debit the income. Credit Deferred income.','Current liability']])}
<h3>Steps</h3>
<ol><li>Draw a timeline. Mark the date the cash moved, the months the payment covers, and the year end.</li><li>Count the months that are inside this financial year. That fraction is this year’s expense or income.</li><li>The rest is the adjustment. If it was paid early, it is a prepayment (or deferred income). If it is not paid yet, it is an accrual (or accrued income).</li></ol>
<p><b>Example (accrual):</b> The year ends 31 December. The December electricity bill of £300 arrives in January. December’s electricity was used this year. So debit Electricity £300 and credit Accruals £300.</p>
<h3>When there are adjustments at the start and the end of the year</h3>
<div class="formula">Expense for the year = Cash paid − Opening accrual + Closing accrual + Opening prepayment − Closing prepayment</div>
<p><b>Example:</b> Cash paid for rent £5,000. Opening accrual £400. Closing accrual £600. Expense = £5,000 − £400 + £600 = £5,200.</p>`,
example:`<p>Year end 31 December. Rent of £2,400 was paid on 1 April for 12 months. A £150 telephone bill for December hasn’t arrived.</p>
<p>April to December is 9 months, so this year’s rent is 9/12 × £2,400 = £1,800. The other 3/12, £600, is paid in advance. The telephone cost belongs to this year, so it is accrued.</p>
${sJournal([{lines:[['Prepayments',600,0],['Rent',0,600]],narr:'Rent prepaid for January to March'},{lines:[['Telephone',150,0],['Accruals',0,150]],narr:'December telephone accrued'}])}`,
practice:[
 gen(()=>{const m=rint(1,10);const amt=rint(8,40)*120;const n=12-m;const exp=amt*n/12;return {type:'fields',prompt:`<p>The year end is 31 December. On 1 ${MONTHS[m]}, the business paid ${money(amt)} for 12 months’ insurance.</p>`,fields:[{label:'Insurance expense for this year (£)',answer:exp},{label:'Prepayment at 31 December (£)',answer:amt-exp}],explain:`${MONTHS[m]} to December is ${n} months. Expense = ${n}/12 × ${money(amt)} = ${money(exp)}. The remaining ${12-n} months (${money(amt-exp)}) relate to next year, so they are a prepayment (a current asset).`};}),
 gen(()=>{const x=rint(4,40)*25;const kind=pick(['Electricity','Wages']);return {type:'journal',prompt:`<p>The year end is 31 December. ${kind==='Wages'?`Wages of ${money(x)} for the last week of December will be paid in January.`:`Electricity of ${money(x)} used in December will be billed in January.`} Record the year-end adjustment.</p>`,accounts:ACCTS,answer:[[kind,x,0],['Accruals',0,x]],explain:`The cost belongs to this year, so the expense is increased (debit). The amount owed is an accrual, a current liability (credit).`};}),
 gen(()=>{const m=rint(2,10);const amt=rint(5,30)*120;const n=12-m;const inc=amt*n/12;return {type:'fields',prompt:`<p>The year end is 31 December. The business rents out a storage unit. On 1 ${MONTHS[m]} it received ${money(amt)} rent for the next 12 months.</p>`,fields:[{label:'Rent received to include in this year’s income (£)',answer:inc},{label:'Deferred income at 31 December (£)',answer:amt-inc}],explain:`Only ${n} months (${MONTHS[m]} to December) have been earned: ${n}/12 × ${money(amt)} = ${money(inc)}. The rest, ${money(amt-inc)}, hasn’t been earned yet, so it is deferred income (a current liability).`};}),
 gen(()=>{const paid=rint(40,120)*50,oa=rint(2,12)*25,ca=rint(2,12)*25;return {type:'fields',kind:'Calculation · Year 2',prompt:`<p>During the year the business paid ${money(paid)} for electricity. At the start of the year ${money(oa)} was owed (an opening accrual). At the year end ${money(ca)} is owed.</p>`,fields:[{label:'Electricity charge for the year (£)',answer:paid-oa+ca}],explain:`Charge = Paid − Opening accrual + Closing accrual = ${money(paid)} − ${money(oa)} + ${money(ca)} = ${money(paid-oa+ca)}. The opening accrual was last year’s cost paid this year, so it is removed. The closing accrual is this year’s cost not yet paid, so it is added.`};}),
 mcqPool([
  {q:'Insurance paid in advance at the year end is shown in the statement of financial position as:',options:['A current asset','A current liability','A non-current asset','Part of equity'],why:'The business is owed future cover, which is a resource, so it is an asset.'},
  {q:'Rent received in advance at the year end is:',options:['A current liability (deferred income)','A current asset','Income for this year','An expense'],why:'The business owes the tenant the use of the property, so it is a liability until earned.'},
  {q:'Failing to accrue an unpaid December bill will:',options:['Overstate profit','Understate profit','Have no effect on profit','Overstate liabilities'],why:'An expense that belongs to this year is left out, so profit is too high.'}])
]});

/* ---------- 7. Depreciation ---------- */
TOPICS.push({id:'depreciation',level:'f',title:'Depreciation and disposals',blurb:'Straight-line and reducing balance methods, the journal, and profit or loss on disposal.',
lesson:`<p>Depreciation spreads the cost of a long-term asset (a non-current asset) over the years the business uses it. Each year gets a share of the cost as an expense.</p>
<h3>Method 1: Straight-line</h3>
<div class="formula">Depreciation each year = (Cost − Residual value) ÷ Useful life</div>
<p>The residual value is what the asset will be worth at the end. The useful life is the number of years it will be used. The expense is the same every year.</p>
<p><b>Example:</b> A machine costs £12,000. It will be used for 5 years and sold for £2,000. Depreciation = (£12,000 − £2,000) ÷ 5 = £2,000 each year.</p>
<h3>Method 2: Reducing balance</h3>
<div class="formula">Depreciation each year = Rate % × Net book value at the start of the year</div>
<p>Do not use the residual value. The expense gets smaller every year. It is used for assets that lose most of their value early, such as cars.</p>
<p><b>Example:</b> A car costs £20,000. The rate is 25%. Year 1: 25% × £20,000 = £5,000. The net book value is now £15,000. Year 2: 25% × £15,000 = £3,750.</p>
<h3>How to record it</h3>
<p>Debit Depreciation expense. Credit Accumulated depreciation. The asset account stays at its original cost. <b>Accumulated depreciation</b> is the total depreciation charged so far.</p>
<div class="formula">Net book value (NBV) = Cost − Accumulated depreciation</div>
<h3>Selling the asset (disposal)</h3>
<div class="formula">Profit or (loss) on disposal = Money received − NBV on the date of sale</div>
<p><b>Example:</b> The NBV is £4,000. The asset is sold for £3,000. £3,000 − £4,000 = a loss of £1,000.</p>
<div class="note"><b>Remember.</b> Depreciation is not money put aside. No cash moves. It is an expense that spreads the cost.</div>`,
example:`<p>A van costs £12,000, has a residual value of £2,000 and a useful life of 4 years.</p>
<p><b>Straight-line:</b> (£12,000 − £2,000) ÷ 4 = <b>£2,500</b> a year.</p>
<p><b>Reducing balance at 25%:</b></p>
${sTable(['Year','Opening NBV £','Charge £','Closing NBV £'],[['1','12,000','3,000','9,000'],['2','9,000','2,250','6,750'],['3','6,750','1,688','5,062']],[1,2,3])}
${sJournal([{lines:[['Depreciation expense',2500,0],['Accumulated depreciation',0,2500]],narr:'Year 1 straight-line depreciation on the van'}])}`,
practice:[
 gen(()=>{const life=pick([4,5,8,10]),ann=rint(10,50)*100,res=rint(0,10)*500,cost=ann*life+res;return {type:'fields',prompt:`<p>Machinery costs ${money(cost)}. Its residual value is ${money(res)} and its useful life is ${life} years. Use straight-line depreciation.</p>`,fields:[{label:'Annual depreciation (£)',answer:ann},{label:'Accumulated depreciation after 3 years (£)',answer:ann*3},{label:'Net book value after 3 years (£)',answer:cost-ann*3}],explain:`(${money(cost)} − ${money(res)}) ÷ ${life} = ${money(ann)} a year. After 3 years, accumulated depreciation is ${money(ann*3)} and NBV is ${money(cost)} − ${money(ann*3)} = ${money(cost-ann*3)}.`};}),
 gen(()=>{const cost=rint(10,40)*1000,rate=pick([20,25,30,40]);const c1=cost*rate/100,n1=cost-c1,c2=n1*rate/100,n2=n1-c2,c3=n2*rate/100;return {type:'fields',prompt:`<p>A vehicle costs ${money(cost)}. It is depreciated at ${rate}% a year using the reducing balance method. Round to the nearest £.</p>`,fields:[{label:'Year 1 charge (£)',answer:c1,tol:1,display:fmt(Math.round(c1))},{label:'Year 1 closing NBV (£)',answer:n1,tol:1,display:fmt(Math.round(n1))},{label:'Year 2 charge (£)',answer:c2,tol:1,display:fmt(Math.round(c2))},{label:'Year 2 closing NBV (£)',answer:n2,tol:1,display:fmt(Math.round(n2))},{label:'Year 3 charge (£)',answer:c3,tol:1,display:fmt(Math.round(c3))}],explain:`Each year’s charge is ${rate}% of that year’s opening NBV: ${money(cost)} → ${fmt(Math.round(n1))} → ${fmt(Math.round(n2))}. The charge falls each year because it is applied to a smaller balance.`};}),
 gen(()=>{const x=rint(10,80)*50;return {type:'journal',prompt:`<p>Record the year’s depreciation charge of ${money(x)} on equipment.</p>`,accounts:ACCTS,answer:[['Depreciation expense',x,0],['Accumulated depreciation',0,x]],explain:'The expense reduces profit (debit). Accumulated depreciation is credited so the equipment account stays at cost.'};}),
 gen(()=>{const cost=rint(10,40)*1000,acc=rint(2,Math.floor(cost/1000)-2)*1000,nbv=cost-acc,proc=Math.max(0,nbv+rint(-6,6)*250);const pl=proc-nbv;return {type:'fields',kind:'Calculation · Year 2',prompt:`<p>An asset that cost ${money(cost)}, with accumulated depreciation of ${money(acc)}, is sold for ${money(proc)}. Enter a loss as a negative number or in brackets.</p>`,fields:[{label:'NBV at disposal (£)',answer:nbv},{label:'Profit or (loss) on disposal (£)',answer:pl,display:fmt(pl)}],explain:`NBV = ${money(cost)} − ${money(acc)} = ${money(nbv)}. Proceeds ${money(proc)} − NBV ${money(nbv)} = ${pl>=0?'a profit of '+money(pl):'a loss of '+money(-pl)}.`};}),
 mcqPool([
  {q:'Which method gives the largest charge in an asset’s first year, for typical rates?',options:['Reducing balance','Straight-line','Both give the same charge','Neither, as the first year is never depreciated'],why:'Reducing balance applies the rate to the full cost in year 1, and the charge falls after that.'},
  {q:'Where does accumulated depreciation appear?',options:['Deducted from cost in the statement of financial position','As an expense in the income statement','As a current liability','As part of equity'],why:'It reduces the asset to its net book value. The annual charge is the expense.'},
  {q:'An asset with NBV £3,000 is sold for £2,400. The result is:',options:['A £600 loss on disposal','A £600 profit on disposal','A £2,400 profit on disposal','No profit or loss'],why:'Proceeds are £600 below NBV, so the asset was over-valued in the books.'}])
]});

/* ---------- 8. Income statement ---------- */
function soleIS(){for(;;){const rev=rint(40,150)*1000,oi=rint(4,24)*500,pur=rint(Math.round(rev*.4/500),Math.round(rev*.6/500))*500,ci=rint(4,28)*500;const av=oi+pur,cos=av-ci,gp=rev-cos;const rent=rint(30,120)*100,wages=rint(50,250)*100,other=rint(5,40)*100,exp=rent+wages+other,np=gp-exp;if(np<=0)continue;
 return {rev,oi,pur,ci,rent,wages,other,rows:[{l:'Revenue',o:rev},{l:'Cost of sales',b:1},{l:'Opening inventory',i:oi,ind:1},{l:'Add: Purchases',i:pur,ind:1},{l:'Cost of goods available for sale',i:{a:av},ind:1,ti:1},{l:'Less: Closing inventory',i:-ci,ind:1},{l:'Cost of sales',o:{a:-cos},ind:1,ti:1},{l:'Gross profit',o:{a:gp},b:1,t:'tot'},{l:'Less: Expenses',b:1},{l:'Rent',i:rent,ind:1},{l:'Wages',i:wages,ind:1},{l:'Other expenses',i:other,ind:1},{l:'Total expenses',o:{a:-exp},ind:1,ti:1},{l:'Net profit for the year',o:{a:np},b:1,t:'dbl'}],cos,gp,exp,np};}}
function coSOPL(){for(;;){const rev=rint(100,600)*1000,cos=Math.round(rev*rint(45,70)/100/1000)*1000,dist=rint(5,60)*1000,admin=rint(10,80)*1000,fin=rint(1,20)*500;const gp=rev-cos,op=gp-dist-admin,pbt=op-fin;if(pbt<=5000)continue;const tax=Math.round(pbt*.25/100)*100,pat=pbt-tax;
 return {rev,cos,dist,admin,fin,tax,rows:[{l:'Revenue',o:rev},{l:'Cost of sales',o:-cos},{l:'Gross profit',o:{a:gp},b:1,t:'tot'},{l:'Distribution costs',o:-dist},{l:'Administrative expenses',o:-admin},{l:'Operating profit',o:{a:op},b:1,t:'tot'},{l:'Finance costs',o:-fin},{l:'Profit before tax',o:{a:pbt},b:1,t:'tot'},{l:'Income tax expense',o:-tax},{l:'Profit for the year',o:{a:pat},b:1,t:'dbl'}],gp,op,pbt,pat};}}
TOPICS.push({id:'income',level:'f',title:'Income statement',blurb:'Cost of sales, gross profit and net profit in the vertical format, for sole traders and companies.',
lesson:`<p>The income statement shows the profit made over a period of time. Its heading always says <i>for the year ended</i> (a period). Under IAS 1, a company calls it the <b>statement of profit or loss</b>.</p>
<h3>Layout, from top to bottom</h3>
<ol><li><b>Revenue</b>: sales, minus any goods customers returned.</li><li><b>Cost of sales</b>: what the goods that were sold cost the business. If you are given inventory figures, work it out like this:</li></ol>
<div class="formula">Cost of sales = Opening inventory + Purchases − Closing inventory</div>
<p><b>Example:</b> Opening inventory £4,000 + Purchases £30,000 − Closing inventory £5,000 = Cost of sales £29,000.</p>
<ol start="3"><li><b>Gross profit</b> = Revenue − Cost of sales. This is the profit from buying and selling goods.</li><li>Take away the <b>expenses</b>: rent, wages, depreciation, delivery costs, office costs.</li><li>For a sole trader, the answer is <b>net profit</b>. For a company, the lines are: operating profit, then take away finance costs (interest), profit before tax, then take away tax, <b>profit for the year</b>.</li></ol>
<h3>How to set it out</h3>
<ul><li>Use two money columns. Put the workings in the left column and the totals in the right column.</li><li>Put amounts you take away in brackets, for example (5,000).</li><li>Draw a single line above each subtotal. Draw a double line under the final profit.</li></ul>
<div class="note warn"><b>Never include these:</b> drawings, money the owner puts in, loan repayments, or the price paid for long-term assets. They are not income or expenses. The depreciation on long-term assets <b>is</b> included.</div>`,
example:sStmt('Statement of Profit or Loss for the year ended 31 December',[{l:'Revenue',o:80000},{l:'Cost of sales',b:1},{l:'Opening inventory',i:5000,ind:1},{l:'Add: Purchases',i:42000,ind:1},{l:'',i:47000,ind:1,ti:1},{l:'Less: Closing inventory',i:-7000,ind:1},{l:'Cost of sales',o:-40000,ind:1,ti:1},{l:'Gross profit',o:40000,b:1,t:'tot'},{l:'Distribution costs',o:-9000},{l:'Administrative expenses',o:-15000},{l:'Operating profit',o:16000,b:1,t:'tot'},{l:'Finance costs',o:-1000},{l:'Profit before tax',o:15000,b:1,t:'tot'},{l:'Income tax expense',o:-3000},{l:'Profit for the year',o:12000,b:1,t:'dbl'}]),
practice:[
 gen(()=>{const s=soleIS();return {type:'statement',prompt:'<p>Complete the income statement for this sole trader by filling in each blank line. You can enter deductions with or without brackets.</p>',title:'Income Statement for the year ended 31 December',rows:s.rows,explain:`Goods available = ${money(s.oi)} + ${money(s.pur)} = ${money(s.oi+s.pur)}. Cost of sales = that − closing inventory ${money(s.ci)} = ${money(s.cos)}. Gross profit = ${money(s.rev)} − ${money(s.cos)} = ${money(s.gp)}. Expenses total ${money(s.exp)}, so net profit is ${money(s.np)}.`};}),
 gen(()=>{const s=coSOPL();return {type:'statement',kind:'Statement · Year 3',prompt:'<p>Complete the statement of profit or loss for this company in the IAS 1 format.</p>',title:'Statement of Profit or Loss for the year ended 31 December',rows:s.rows,explain:`Gross profit ${money(s.gp)}; operating profit = gross profit − distribution − admin = ${money(s.op)}; profit before tax = operating profit − finance costs = ${money(s.pbt)}; profit for the year = ${money(s.pbt)} − tax ${money(s.tax)} = ${money(s.pat)}.`};}),
 gen(()=>{const pool=[['Rent expense','Income statement'],['Sales revenue','Income statement'],['Depreciation expense','Income statement'],['Interest paid on a loan','Income statement'],['Trade payables','Statement of financial position'],['Drawings','Statement of financial position'],['Equipment at cost','Statement of financial position'],['Accumulated depreciation','Statement of financial position'],['Bank loan','Statement of financial position'],['Closing inventory','Both'],['Profit for the year','Both']];return {type:'classify',prompt:'<p>Where does each item appear?</p>',options:['Income statement','Statement of financial position','Both'],items:pickN(pool,7).map(([l,a])=>({label:l,answer:a})),explain:'Income and expenses go in the income statement. Assets, liabilities and capital (including drawings) go in the SOFP. Closing inventory is deducted in cost of sales and shown as a current asset. Profit is calculated in the income statement and added to capital in the SOFP.'};}),
 mcqPool([
  {q:'The owner took £5,000 for personal use. How does this affect the income statement?',options:['It doesn’t appear there','It is an expense of £5,000','It reduces revenue by £5,000','It is added to cost of sales'],why:'Drawings are a withdrawal of capital and go in the capital section of the SOFP.'},
  {q:'Closing inventory is deducted in cost of sales because:',options:['Those goods haven’t been sold yet','It has been sold at a loss','It is a liability','It was bought last year'],why:'Cost of sales should only include the cost of goods actually sold in the period.'},
  {q:'Carriage inwards (delivery costs on purchases) is added to:',options:['Cost of sales','Distribution costs','Administrative expenses','Revenue'],why:'It is part of the cost of getting goods ready for sale, so it goes in cost of sales.'}])
]});

/* ---------- 9. SOFP ---------- */
function soleSOFP(){for(;;){const eq=rint(5,30)*1000,veh=rint(4,20)*1000,inv=rint(2,12)*500,rec=rint(2,12)*500,cash=rint(2,16)*250,pay=rint(2,16)*500,loan=Math.random()<.6?rint(5,20)*1000:0,profit=rint(80,300)*100,draw=rint(30,Math.floor(profit/100)-10)*100;
 const nca=eq+veh,ca=inv+rec+cash,ta=nca+ca,tl=pay+loan,na=ta-tl,oc=na-profit+draw;if(na<=0||oc<=2000)continue;
 const rows=[{head:'Non-current assets'},{l:'Equipment',i:eq,ind:1},{l:'Motor vehicles',i:veh,ind:1},{l:'Total non-current assets',o:{a:nca},ti:1},{head:'Current assets'},{l:'Inventory',i:inv,ind:1},{l:'Trade receivables',i:rec,ind:1},{l:'Cash',i:cash,ind:1},{l:'Total current assets',o:{a:ca},ti:1},{l:'Total assets',o:{a:ta},b:1,t:'tot'},{head:'Liabilities'}];
 if(loan)rows.push({l:'Bank loan (non-current)',i:loan,ind:1});rows.push({l:'Trade payables (current)',i:pay,ind:1},{l:'Total liabilities',o:{a:-tl},ti:1},{l:'Net assets',o:{a:na},b:1,t:'dbl'},{head:'Capital'},{l:'Opening capital',i:oc,ind:1},{l:'Add: Profit for the year',i:profit,ind:1},{l:'Less: Drawings',i:-draw,ind:1},{l:'Closing capital',o:{a:na},b:1,t:'dbl',ti:1});
 return {rows,nca,ca,ta,tl,na,oc,profit,draw};}}
function coSOFP(){for(;;){const ppe=rint(40,200)*1000,inv=rint(5,40)*1000,rec=rint(5,40)*1000,cash=rint(1,20)*1000,sc=rint(20,100)*1000,loan=rint(10,60)*1000,pay=rint(5,30)*1000,tax=rint(2,15)*1000;
 const ca=inv+rec+cash,ta=ppe+ca,cl=pay+tax,re=ta-loan-cl-sc;if(re<5000)continue;
 return {rows:[{head:'Assets'},{l:'Non-current assets',b:1},{l:'Property, plant and equipment',o:ppe,ind:1},{l:'Current assets',b:1},{l:'Inventories',i:inv,ind:1},{l:'Trade receivables',i:rec,ind:1},{l:'Cash and cash equivalents',i:cash,ind:1},{l:'Total current assets',o:{a:ca},ti:1},{l:'Total assets',o:{a:ta},b:1,t:'dbl'},{head:'Equity and liabilities'},{l:'Equity',b:1},{l:'Share capital',i:sc,ind:1},{l:'Retained earnings (balancing figure)',i:{a:re},ind:1},{l:'Total equity',o:{a:sc+re},b:1,ti:1},{l:'Non-current liabilities',b:1},{l:'Bank loan',o:loan,ind:1},{l:'Current liabilities',b:1},{l:'Trade payables',i:pay,ind:1},{l:'Tax payable',i:tax,ind:1},{l:'Total current liabilities',o:{a:cl},ti:1},{l:'Total equity and liabilities',o:{a:ta},b:1,t:'dbl'}],ta,cl,re,sc,loan};}}
TOPICS.push({id:'sofp',level:'f',title:'Statement of financial position',blurb:'Assets, liabilities and capital at a date, laid out so the two halves agree.',
lesson:`<p>The statement of financial position (also called the balance sheet) shows what the business owns and owes on <b>one date</b>. Its heading says <i>as at</i>, for example “as at 31 December 2025”.</p>
<h3>Current or non-current?</h3>
<p><b>Current</b> means it will be turned into cash, or paid, within 12 months of the balance sheet date. Everything else is <b>non-current</b>.</p>
<p><b>Example:</b> A loan repayable in 3 years is non-current. A supplier bill due next month is current.</p>
${sTable(['Section','Examples'],[['Non-current assets','Land and buildings, equipment, vehicles (shown at net book value)'],['Current assets','Inventory, trade receivables, prepayments, cash'],['Current liabilities','Trade payables, accruals, overdraft, tax to pay'],['Non-current liabilities','Loans repayable after more than 12 months']])}
<h3>Sole trader layout</h3>
<div class="formula">Net assets = Total assets − Total liabilities</div>
<div class="formula">Closing capital = Opening capital + Profit − Drawings</div>
<p>These two figures must be the same. <b>Example:</b> Opening capital £20,000 + Profit £9,000 − Drawings £6,000 = £23,000. Net assets must also be £23,000.</p>
<h3>Company layout (IAS 1)</h3>
<p>List the assets first: non-current, then current, then total assets. Then list equity and liabilities: share capital, retained earnings, non-current liabilities, current liabilities. The final total must equal total assets.</p>
<div class="note"><b>Missing figure.</b> If one figure is missing, such as opening capital, the statement must still balance. Work it out by subtraction.</div>`,
example:sStmt('Statement of Financial Position as at 31 December',[{head:'Assets'},{l:'Non-current assets',b:1},{l:'Property, plant and equipment',o:30000,ind:1},{l:'Current assets',b:1},{l:'Inventories',i:7000,ind:1},{l:'Trade receivables',i:4000,ind:1},{l:'Cash and cash equivalents',i:2000,ind:1},{l:'',o:13000,ti:1},{l:'Total assets',o:43000,b:1,t:'dbl'},{head:'Equity and liabilities'},{l:'Equity',b:1},{l:'Share capital',i:20000,ind:1},{l:'Retained earnings',i:9000,ind:1},{l:'Total equity',o:29000,b:1,ti:1},{l:'Non-current liabilities',b:1},{l:'Bank loan',o:10000,ind:1},{l:'Current liabilities',b:1},{l:'Trade payables',o:4000,ind:1},{l:'Total equity and liabilities',o:43000,b:1,t:'dbl'}]),
practice:[
 gen(()=>{const s=soleSOFP();return {type:'statement',prompt:'<p>Complete the statement of financial position for this sole trader.</p>',title:'Statement of Financial Position as at 31 December',rows:s.rows,explain:`Total assets ${money(s.ta)} − total liabilities ${money(s.tl)} = net assets ${money(s.na)}. Closing capital = ${money(s.oc)} + ${money(s.profit)} − ${money(s.draw)} = ${money(s.na)}, so the two halves agree.`};}),
 gen(()=>{const s=coSOFP();return {type:'statement',kind:'Statement · Year 3',prompt:'<p>Complete the statement of financial position for this company. Retained earnings is the balancing figure.</p>',title:'Statement of Financial Position as at 31 December',rows:s.rows,explain:`Total assets are ${money(s.ta)}. Liabilities are ${money(s.loan)} + ${money(s.cl)}. Equity must be ${money(s.ta-s.loan-s.cl)}, so retained earnings = that − share capital ${money(s.sc)} = ${money(s.re)}.`};}),
 gen(()=>{const pool=[['Bank loan repayable in 5 years','Non-current liability'],['Bank overdraft','Current liability'],['Inventory','Current asset'],['Delivery van','Non-current asset'],['Insurance paid in advance','Current asset'],['Wages owed at the year end','Current liability'],['Trade receivables','Current asset'],['Land and buildings','Non-current asset'],['Tax payable in 9 months','Current liability'],['Office furniture','Non-current asset'],['Rent received in advance','Current liability']];return {type:'classify',prompt:'<p>Classify each item.</p>',options:['Non-current asset','Current asset','Current liability','Non-current liability'],items:pickN(pool,7).map(([l,a])=>({label:l,answer:a})),explain:'Current means within 12 months. Assets held for long-term use are non-current. Prepayments are current assets; accruals, overdrafts and income received in advance are current liabilities.'};})
]});

/* ---------- Statement of cash flows ---------- */
function cfOperating(){for(;;){const pbt=rint(20,120)*1000,dep=rint(4,30)*1000,fin=rint(1,8)*500,tax=Math.round(pbt*.22/500)*500;
 const io=rint(10,40)*500,ic=rint(10,40)*500,ro=rint(10,40)*500,rc=rint(10,40)*500,po=rint(8,30)*500,pc=rint(8,30)*500;
 const di=io-ic,dr=ro-rc,dp=pc-po;if(!di||!dr||!dp)continue;const cgo=pbt+dep+fin+di+dr+dp,net=cgo-fin-tax;if(net<=0)continue;
 return {pbt,dep,fin,tax,io,ic,ro,rc,po,pc,di,dr,dp,cgo,net};}}
function cfBottom(){for(;;){const op=rint(10,90)*1000,ppe=rint(5,60)*1000,sale=rint(0,15)*500,shares=Math.random()<.5?rint(5,40)*1000:0,loanNew=Math.random()<.4?rint(5,30)*1000:0,loanRep=loanNew?0:rint(2,20)*1000,div=rint(2,20)*1000,open=rint(-10,30)*500;
 const inv=sale-ppe,finc=shares+loanNew-loanRep-div,chg=op+inv+finc,close=open+chg;if(close<0)continue;return {op,ppe,sale,shares,loanNew,loanRep,div,open,inv,finc,chg,close};}}
TOPICS.push({id:'cashflow',level:'y3',title:'Statement of cash flows',blurb:'Why profit isn’t cash, and how to prepare the IAS 7 statement using the indirect method.',
lesson:`<p>The statement of cash flows (IAS 7) shows where a company’s cash came from and where it went during the year.</p>
<p>It is needed because <b>profit is not the same as cash</b>. Three examples:</p>
<ul><li>A sale on credit counts as profit now, but the cash comes later.</li><li>Depreciation reduces profit, but no cash is paid.</li><li>Buying a machine uses cash, but it is not an expense.</li></ul>
<h3>The three sections</h3>
${sTable(['Section','What goes in it','Examples'],[
['Operating activities','Cash from day-to-day trading','Cash from customers, payments to suppliers and staff, tax paid'],
['Investing activities','Cash spent on, or received from, long-term assets','Buying machinery, money received from selling a van'],
['Financing activities','Cash from or to lenders and shareholders','Issuing shares, taking out or repaying loans, dividends paid']])}
<h3>Operating activities: the indirect method</h3>
<p>Start with profit before tax. Then change it, step by step, into cash:</p>
<ol><li><b>Add back expenses that used no cash.</b> Add depreciation and any loss on selling an asset. Take away any profit on selling an asset (the cash from the sale goes in investing).</li><li><b>Add back finance costs</b> (interest). The interest actually paid is shown on its own line further down.</li><li><b>Adjust for working capital</b> (inventory, receivables and payables), using the table below.</li><li>The answer is <b>cash generated from operations</b>. Then take away interest paid and tax paid.</li></ol>
${sTable(['Change during the year','What to do','Why'],[
['Inventory goes up','Take it away','Cash was spent on stock that is not sold yet'],
['Trade receivables go up','Take it away','Sales were made, but customers have not paid yet'],
['Trade payables go up','Add it','Costs were counted, but the cash has not been paid yet'],
['Any of these goes down','Do the opposite','The effect is reversed']])}
<p><b>Example:</b> Profit before tax £50,000. Depreciation £8,000. Receivables went up by £3,000. Payables went up by £1,000. Cash generated from operations = £50,000 + £8,000 − £3,000 + £1,000 = £56,000.</p>
<div class="formula">Opening cash + Net change in cash = Closing cash</div>
<div class="note"><b>Tip.</b> Put cash going out in brackets. Give each section its own subtotal. The final figure must equal the cash on the balance sheet.</div>
<div class="note warn"><b>Watch out.</b> IAS 7 lets a company put interest paid and dividends paid in either operating or financing activities, as long as it does the same every year. On this site, interest paid is in operating activities and dividends paid are in financing activities.</div>`,
example:`<p>Profit before tax £50,000; depreciation £12,000; finance costs £3,000 (all paid); inventories rose by £4,000; receivables fell by £2,000; payables rose by £1,500; tax paid £9,000. Bought equipment for £30,000 and sold old equipment for £5,000. Issued shares for £10,000, repaid £8,000 of a loan and paid dividends of £6,000. Opening cash was £7,000.</p>
${sStmt('Statement of Cash Flows for the year ended 31 December',[
{head:'Cash flows from operating activities'},{l:'Profit before tax',i:50000,ind:1},{l:'Add: Depreciation',i:12000,ind:1},{l:'Add: Finance costs',i:3000,ind:1},{l:'Increase in inventories',i:-4000,ind:1},{l:'Decrease in trade receivables',i:2000,ind:1},{l:'Increase in trade payables',i:1500,ind:1},{l:'Cash generated from operations',i:64500,ind:1,ti:1},{l:'Interest paid',i:-3000,ind:1},{l:'Tax paid',i:-9000,ind:1},{l:'Net cash from operating activities',o:52500,b:1,ti:1},
{head:'Cash flows from investing activities'},{l:'Purchase of property, plant and equipment',i:-30000,ind:1},{l:'Proceeds from sale of equipment',i:5000,ind:1},{l:'Net cash used in investing activities',o:-25000,b:1,ti:1},
{head:'Cash flows from financing activities'},{l:'Proceeds from issue of shares',i:10000,ind:1},{l:'Repayment of loan',i:-8000,ind:1},{l:'Dividends paid',i:-6000,ind:1},{l:'Net cash used in financing activities',o:-4000,b:1,ti:1},
{l:'Net increase in cash and cash equivalents',o:23500,b:1,t:'tot'},{l:'Cash and cash equivalents at 1 January',o:7000},{l:'Cash and cash equivalents at 31 December',o:30500,b:1,t:'dbl'}])}
<p>The company made £50,000 of profit, but its cash only rose by £23,500, mainly because it spent £30,000 on new equipment.</p>`,
practice:[
 gen(()=>{const pool=[['Cash received from customers','Operating'],['Wages paid to staff','Operating'],['Payments to suppliers','Operating'],['Tax paid','Operating'],['Purchase of new machinery','Investing'],['Proceeds from selling a delivery van','Investing'],['Purchase of shares in another company','Investing'],['Issue of new shares','Financing'],['New long-term bank loan received','Financing'],['Repayment of a bank loan','Financing'],['Dividends paid to shareholders','Financing']];return {type:'classify',prompt:'<p>Which section of the statement of cash flows does each item belong in?</p>',options:['Operating','Investing','Financing'],items:pickN(pool,7).map(([l,a])=>({label:l,answer:a})),explain:'Operating is day-to-day trading. Investing is buying and selling long-term assets. Financing is cash from or to owners and lenders.'};}),
 gen(()=>{const pool=[['Inventories increased','Subtract'],['Inventories decreased','Add'],['Trade receivables increased','Subtract'],['Trade receivables decreased','Add'],['Trade payables increased','Add'],['Trade payables decreased','Subtract'],['Depreciation was charged','Add'],['A profit was made on selling equipment','Subtract'],['A loss was made on selling equipment','Add']];return {type:'classify',prompt:'<p>Starting from profit before tax, do you add or subtract each item to get to operating cash flow?</p>',options:['Add','Subtract'],items:pickN(pool,7).map(([l,a])=>({label:l,answer:a})),explain:'More stock or receivables means cash is tied up, so subtract. More payables means cash hasn’t left yet, so add. Depreciation and losses on disposal reduced profit without using cash, so add them back. A profit on disposal is removed because the sale proceeds belong in investing.'};}),
 gen(()=>{const c=cfOperating();const lab=(d,inc,dec)=>(d>0?dec:inc);return {type:'statement',prompt:`<p>Prepare the operating activities section. Profit before tax ${money(c.pbt)}; depreciation ${money(c.dep)}; finance costs ${money(c.fin)} (all paid in the year); tax paid ${money(c.tax)}.</p>${sTable(['Balance','Start of year £','End of year £'],[['Inventories',fmt(c.io),fmt(c.ic)],['Trade receivables',fmt(c.ro),fmt(c.rc)],['Trade payables',fmt(c.po),fmt(c.pc)]],[1,2])}<p class="hint">Enter cash outflows as negative numbers or in brackets.</p>`,title:'Cash flows from operating activities',rows:[{l:'Profit before tax',i:c.pbt},{l:'Add: Depreciation',i:{a:c.dep,s:1},ind:1},{l:'Add: Finance costs',i:{a:c.fin,s:1},ind:1},{l:lab(c.di,'Increase in inventories','Decrease in inventories'),i:{a:c.di,s:1},ind:1},{l:lab(c.dr,'Increase in trade receivables','Decrease in trade receivables'),i:{a:c.dr,s:1},ind:1},{l:c.dp>0?'Increase in trade payables':'Decrease in trade payables',i:{a:c.dp,s:1},ind:1},{l:'Cash generated from operations',i:{a:c.cgo,s:1},ti:1},{l:'Interest paid',i:{a:-c.fin,s:1},ind:1},{l:'Tax paid',i:{a:-c.tax,s:1},ind:1},{l:'Net cash from operating activities',o:{a:c.net,s:1},b:1,ti:1}],explain:`Inventories ${c.di<0?'rose, so subtract':'fell, so add'} ${money(Math.abs(c.di))}. Receivables ${c.dr<0?'rose, so subtract':'fell, so add'} ${money(Math.abs(c.dr))}. Payables ${c.dp>0?'rose, so add':'fell, so subtract'} ${money(Math.abs(c.dp))}. Cash generated from operations is ${money(c.cgo)}. After interest ${money(c.fin)} and tax ${money(c.tax)}, net cash from operating activities is ${money(c.net)}.`};}),
 gen(()=>{const c=cfBottom();const fl=[];if(c.shares)fl.push(`issued shares for ${money(c.shares)}`);if(c.loanNew)fl.push(`took out a new loan of ${money(c.loanNew)}`);if(c.loanRep)fl.push(`repaid ${money(c.loanRep)} of a loan`);fl.push(`paid dividends of ${money(c.div)}`);
  const rows=[{l:'Net cash from operating activities',o:c.op},{head:'Cash flows from investing activities'},{l:'Purchase of property, plant and equipment',i:-c.ppe,ind:1}];if(c.sale)rows.push({l:'Proceeds from sale of equipment',i:c.sale,ind:1});rows.push({l:'Net cash from investing activities',o:{a:c.inv,s:1},b:1,ti:1},{head:'Cash flows from financing activities'});if(c.shares)rows.push({l:'Proceeds from issue of shares',i:c.shares,ind:1});if(c.loanNew)rows.push({l:'New loan received',i:c.loanNew,ind:1});if(c.loanRep)rows.push({l:'Repayment of loan',i:-c.loanRep,ind:1});rows.push({l:'Dividends paid',i:-c.div,ind:1},{l:'Net cash from financing activities',o:{a:c.finc,s:1},b:1,ti:1},{l:'Net increase/(decrease) in cash',o:{a:c.chg,s:1},b:1,t:'tot'},{l:'Cash at start of year',o:c.open},{l:'Cash at end of year',o:{a:c.close,s:1},b:1,t:'dbl'});
  return {type:'statement',prompt:`<p>Net cash from operating activities was ${money(c.op)}. The company bought equipment for ${money(c.ppe)}${c.sale?` and sold old equipment for ${money(c.sale)}`:''}. It ${fl.join(', ')}. Cash at the start of the year was ${money(c.open)}.</p><p class="hint">Enter outflows and decreases as negative numbers or in brackets.</p>`,title:'Statement of Cash Flows (extract)',rows,explain:`Investing: ${money(c.sale)} − ${money(c.ppe)} = ${fmt(c.inv)}. Financing: ${fmt(c.finc)}. Net change = ${money(c.op)} + (${fmt(c.inv)}) + (${fmt(c.finc)}) = ${fmt(c.chg)}. Closing cash = ${money(c.open)} + (${fmt(c.chg)}) = ${money(c.close)}.`};}),
 mcqPool([
  {q:'Why is depreciation added back in the indirect method?',options:['It reduced profit but no cash was paid','It is a source of cash','It is paid at the year end','It is a financing cash flow'],why:'Depreciation spreads the cost of an asset. The cash left when the asset was bought, which is shown in investing activities.'},
  {q:'A company made a large profit, but its cash from operations was negative. The most likely reason is:',options:['Receivables and inventories grew a lot','It paid a large dividend','It bought new machinery','It issued new shares'],why:'Cash tied up in unpaid customer balances and extra stock reduces operating cash. Dividends and machinery are in other sections.'},
  {q:'Trade receivables rose from £20,000 to £26,000. In the indirect method you:',options:['Subtract £6,000','Add £6,000','Subtract £26,000','Ignore it, as it is not cash'],why:'Customers owe £6,000 more, so that much of the profit hasn’t been received as cash.'},
  {q:'Where does the purchase of a new building go?',options:['Investing activities','Operating activities','Financing activities','It isn’t a cash flow'],why:'Buying long-term assets is an investing activity.'}])
]});

/* ---------- 10. Ratios ---------- */
TOPICS.push({id:'ratios',level:'y3',title:'Ratio analysis',blurb:'Profitability, liquidity, efficiency and gearing ratios, and how to interpret them.',
lesson:`<p>A ratio compares one figure in the accounts with another. For every ratio, write four things: the formula, the workings, the answer with its unit, and what it means.</p>
${sTable(['Group','Ratio','Formula','Unit'],[
['Profitability (how much profit)','Gross profit margin','Gross profit ÷ Revenue × 100','%'],
['','Operating profit margin','Operating profit ÷ Revenue × 100','%'],
['','ROCE (return on capital employed)','Operating profit ÷ Capital employed × 100','%'],
['Liquidity (can it pay its bills)','Current ratio','Current assets ÷ Current liabilities',': 1'],
['','Quick (acid test) ratio','(Current assets − Inventory) ÷ Current liabilities',': 1'],
['Efficiency (how fast cash moves)','Receivables days','Trade receivables ÷ Revenue × 365','days'],
['','Payables days','Trade payables ÷ Cost of sales × 365','days'],
['','Inventory days','Inventory ÷ Cost of sales × 365','days'],
['Gearing (how much is borrowed)','Gearing','Non-current liabilities ÷ (Equity + Non-current liabilities) × 100','%'],
['','Interest cover','Operating profit ÷ Finance costs','times']])}
<div class="formula">Capital employed = Equity + Non-current liabilities</div>
<p><b>Example:</b> Current assets £60,000. Current liabilities £40,000. Current ratio = £60,000 ÷ £40,000 = 1.5 : 1. The business has £1.50 of current assets for every £1 it must pay within 12 months.</p>
<h3>Explaining a ratio</h3>
<p>One ratio on its own tells you very little. Do these three things:</p>
<ol><li><b>Compare it</b> with last year, a competitor or the industry average.</li><li><b>Give a likely reason</b> for the change, using the figures.</li><li><b>Say what it leads to.</b></li></ol>
<p><b>Example:</b> “Receivables days went up from 35 to 52. Customers are taking longer to pay, which may mean weaker credit control. Cash is coming in more slowly, so the business may find it harder to pay its bills.”</p>
<div class="note"><b>Watch out.</b> A very high current ratio is not always good. It can mean too much cash or inventory is sitting unused.</div>`,
example:`<p>Using revenue £80,000, gross profit £40,000, operating profit £16,000, current assets £13,000, current liabilities £4,000, equity £29,000 and a £10,000 long-term loan:</p>
${sTable(['Ratio','Workings','Result','Interpretation'],[['Current ratio','13,000 ÷ 4,000','3.25 : 1','Very liquid, possibly holding too much idle cash or inventory.'],['Gross profit margin','40,000 ÷ 80,000 × 100','50.0%','Half of each £1 of sales is left after direct costs.'],['ROCE','16,000 ÷ (29,000 + 10,000) × 100','41.0%','A strong return on the long-term capital invested.']])}`,
practice:[
 gen(()=>{const rev=rint(50,300)*1000,cos=Math.round(rev*rint(45,75)/100/100)*100,gp=rev-cos,opex=Math.round(gp*rint(30,75)/100/100)*100,op=gp-opex,eq=rint(50,200)*1000,ncl=rint(0,80)*1000;return {type:'fields',prompt:`<p>Revenue ${money(rev)}; cost of sales ${money(cos)}; operating expenses ${money(opex)}; equity ${money(eq)}; non-current liabilities ${money(ncl)}. Give percentages to 1 decimal place.</p>`,fields:[{label:'Gross profit margin',answer:r1(gp/rev*100),tol:0.1,unit:'%',display:(gp/rev*100).toFixed(1)},{label:'Operating profit margin',answer:r1(op/rev*100),tol:0.1,unit:'%',display:(op/rev*100).toFixed(1)},{label:'ROCE',answer:r1(op/(eq+ncl)*100),tol:0.1,unit:'%',display:(op/(eq+ncl)*100).toFixed(1)}],explain:`Gross profit = ${money(gp)}; operating profit = ${money(gp)} − ${money(opex)} = ${money(op)}. Capital employed = ${money(eq)} + ${money(ncl)} = ${money(eq+ncl)}.`};}),
 gen(()=>{const inv=rint(5,40)*500,rec=rint(5,40)*500,cash=rint(1,30)*250,pay=rint(8,50)*500,acc=rint(1,10)*250;const ca=inv+rec+cash,cl=pay+acc;return {type:'fields',prompt:`<p>Inventory ${money(inv)}; trade receivables ${money(rec)}; cash ${money(cash)}; trade payables ${money(pay)}; accruals ${money(acc)}. Give ratios to 2 decimal places.</p>`,fields:[{label:'Current ratio',answer:r2(ca/cl),tol:0.011,unit:': 1',display:(ca/cl).toFixed(2)},{label:'Quick ratio',answer:r2((ca-inv)/cl),tol:0.011,unit:': 1',display:((ca-inv)/cl).toFixed(2)}],explain:`Current assets = ${money(ca)}; current liabilities = ${money(cl)}. Quick ratio removes inventory, the least liquid current asset: ${money(ca-inv)} ÷ ${money(cl)}.`};}),
 gen(()=>{const rev=rint(100,500)*1000,cos=Math.round(rev*rint(50,70)/100/1000)*1000,rec=rint(8,60)*1000,pay=rint(5,40)*1000,inv=rint(5,40)*1000;const f=(a,b)=>Math.round(a/b*365);return {type:'fields',prompt:`<p>Revenue ${money(rev)}; cost of sales ${money(cos)}; trade receivables ${money(rec)}; trade payables ${money(pay)}; inventory ${money(inv)}. Round to the nearest day.</p>`,fields:[{label:'Receivables days',answer:f(rec,rev),tol:1,unit:'days'},{label:'Payables days',answer:f(pay,cos),tol:1,unit:'days'},{label:'Inventory days',answer:f(inv,cos),tol:1,unit:'days'}],explain:'Receivables are compared with revenue (sales). Payables and inventory are compared with cost of sales, because they are measured at cost.'};}),
 gen(()=>{const eq=rint(50,300)*1000,ncl=rint(10,200)*1000,op=rint(10,80)*1000,fin=rint(2,20)*500;return {type:'fields',prompt:`<p>Equity ${money(eq)}; non-current liabilities ${money(ncl)}; operating profit ${money(op)}; finance costs ${money(fin)}. Give answers to 1 decimal place.</p>`,fields:[{label:'Gearing',answer:r1(ncl/(eq+ncl)*100),tol:0.1,unit:'%',display:(ncl/(eq+ncl)*100).toFixed(1)},{label:'Interest cover',answer:r1(op/fin),tol:0.1,unit:'times',display:(op/fin).toFixed(1)}],explain:`Gearing = ${money(ncl)} ÷ ${money(eq+ncl)} × 100. Interest cover = ${money(op)} ÷ ${money(fin)}. High gearing means more reliance on debt and more risk if profits fall.`};}),
 mcqPool([
  {q:'Receivables days rose from 35 to 60. The most likely explanation is:',options:['Customers are taking longer to pay','Sales have been made mainly for cash','Suppliers are being paid faster','Inventory is selling more quickly'],why:'Higher receivables days mean cash is collected more slowly, often a sign of weaker credit control.'},
  {q:'A current ratio of 0.7 : 1 suggests:',options:['The business may struggle to pay its short-term debts','The business is highly profitable','The business holds too much cash','Gearing is too high'],why:'Current liabilities exceed current assets, which is a liquidity warning.'},
  {q:'Revenue rose but gross profit margin fell. A likely cause is:',options:['Prices were cut or purchase costs rose','Administrative expenses rose','Interest rates increased','More shares were issued'],why:'Gross margin only reflects revenue and cost of sales, so the cause is in pricing or the cost of goods.'},
  {q:'Capital employed for ROCE is:',options:['Equity plus non-current liabilities','Share capital only','Total assets','Current assets minus current liabilities'],why:'It is the long-term funding used to generate operating profit.'}])
]});

/* ---------- 11. IFRS ---------- */
const WRITTEN=[
 {q:'Under IAS 16, when may a non-current asset be revalued instead of held at cost?',model:'IAS 16 <i>Property, Plant and Equipment</i> allows a choice of the cost model or the revaluation model. The revaluation model can be used when fair value can be measured reliably. If it is chosen, it must be applied to the entire class of assets, and revaluations must be made regularly enough that the carrying amount doesn’t differ materially from fair value. A revaluation gain goes to other comprehensive income and a revaluation surplus in equity, and depreciation is then based on the revalued amount.',points:['Names IAS 16 and the cost model as the alternative','Fair value must be measurable reliably','Applies to the whole class of assets','Revaluations kept up to date','Gain goes to OCI / revaluation surplus']},
 {q:'Explain the difference between steps 3 and 4 of the IFRS 15 five-step model.',model:'IFRS 15 <i>Revenue from Contracts with Customers</i> uses five steps. Step 3 determines the transaction price: the total consideration the entity expects to be entitled to, adjusted for items such as discounts or variable consideration. Step 4 allocates that price to each separate performance obligation identified in step 2, in proportion to their standalone selling prices. For example, a phone sold with a service contract has one transaction price split between the phone and the service.',points:['Step 3 = determine the total transaction price','Mentions adjustments such as discounts or variable consideration','Step 4 = allocate the price to performance obligations','Allocation uses relative standalone selling prices','Gives an example of a bundled contract']},
 {q:'Under IFRS 16, how does a lessee account for a lease that used to be an off-balance-sheet operating lease?',model:'Under IFRS 16 <i>Leases</i>, the lessee recognises a right-of-use asset and a lease liability at the start of the lease, measured at the present value of the lease payments. The asset is depreciated and interest is charged on the liability, so the profit or loss shows depreciation and finance costs instead of a rent expense. The exemptions are short-term leases (12 months or less) and leases of low-value assets. The change was made so that lease obligations, which are similar to borrowing, appear on the statement of financial position.',points:['Right-of-use asset recognised','Lease liability at present value of payments','Depreciation plus interest replaces rent expense','Short-term and low-value exemptions','Explains the purpose: debt-like obligations become visible']},
 {q:'Under IAS 2, how is inventory measured, and what is the difference between FIFO and weighted average cost?',model:'IAS 2 <i>Inventories</i> requires inventory to be measured at the lower of cost and net realisable value (estimated selling price less costs to complete and sell). Where identical items are bought at different prices, a cost formula is used. FIFO assumes the oldest items are sold first, so closing inventory is valued at the most recent prices. Weighted average values all units at the average cost of the goods available. LIFO is not permitted. When prices are rising, FIFO gives a higher closing inventory and higher profit.',points:['Lower of cost and NRV','Defines NRV','FIFO: oldest sold first, closing inventory at latest prices','Weighted average: average cost per unit','LIFO not permitted / effect of rising prices']}];
TOPICS.push({id:'ifrs',level:'y3',title:'IFRS standards',blurb:'The key rules in IAS 1, IAS 2, IAS 16, IAS 37, IAS 38, IFRS 15 and IFRS 16, with calculations.',
lesson:`<p>For a written question about a standard, do four things: (1) name the standard, (2) state the rule exactly, (3) apply it to the facts in the question, (4) explain the effect on the accounts.</p>
<div class="std"><span class="code">CONCEPTUAL FRAMEWORK</span><h3>What makes information useful</h3><p>There are two <b>fundamental</b> qualities. <b>Relevance</b>: it could change a user’s decision. <b>Faithful representation</b>: it is complete, neutral and free from error. There are four <b>enhancing</b> qualities: comparability, verifiability, timeliness and understandability.</p></div>
<div class="std"><span class="code">IAS 1</span><h3>Presentation of financial statements</h3><p>A complete set has five parts: the statement of financial position, the statement of profit or loss and other comprehensive income, the statement of changes in equity, the statement of cash flows, and the notes. Assets and liabilities are split into current (within 12 months) and non-current.</p></div>
<div class="std"><span class="code">IAS 2</span><h3>Inventories</h3><p>Show inventory at the <b>lower of cost and net realisable value (NRV)</b>. NRV = expected selling price − costs to finish the item − costs to sell it. Allowed cost methods: FIFO (first in, first out) and weighted average. Unique items use their actual cost. LIFO (last in, first out) is not allowed.</p><p><b>Example:</b> Cost £500. Selling price £450. Selling costs £30. NRV = £420. Show it at £420.</p></div>
<div class="std"><span class="code">IAS 16</span><h3>Property, plant and equipment</h3><p>Cost includes the purchase price and the costs needed to get the asset working. After that, choose the cost model or the revaluation model for each whole class of assets. A revaluation gain goes to other comprehensive income (the revaluation surplus), not profit. Depreciate the asset over its useful life.</p></div>
<div class="std"><span class="code">IAS 37</span><h3>Provisions</h3><p>Include a provision only if all three are true: there is an obligation now from a past event, a payment is probable (more likely than not), and the amount can be estimated reliably. If a payment is only possible, it is a contingent liability. Describe it in the notes. Do not include it in the figures.</p></div>
<div class="std"><span class="code">IAS 38</span><h3>Intangible assets</h3><p>Research costs are always an expense. Development costs become an asset only when all the conditions are met: it is technically possible, the company intends and is able to finish it and use or sell it, it will probably bring money in, the resources to finish it are available, and the costs can be measured.</p></div>
<div class="std"><span class="code">IFRS 15</span><h3>Revenue from contracts with customers</h3><ol><li>Find the contract.</li><li>List the separate promises (performance obligations).</li><li>Find the total price (transaction price).</li><li>Share the price between the promises, using the price each would sell for on its own.</li><li>Count revenue when (or as) each promise is delivered.</li></ol></div>
<div class="std"><span class="code">IFRS 16</span><h3>Leases</h3><p>The company using the asset (the lessee) records a right-of-use asset and a lease liability. The liability is the present value of the lease payments. Depreciate the asset. Add interest to the liability. Two exemptions: leases of 12 months or less, and low-value assets. These can be treated as a simple expense.</p></div>`,
example:`<p><b>IFRS 15 allocation.</b> A phone and a 12-month airtime contract are sold together for £600. Sold separately, the phone would be £400 and the airtime £300 (£700 in total).</p>
${sTable(['Obligation','Standalone price £','Allocation','Revenue £'],[['Phone','400','600 × 400/700','342.86'],['Airtime','300','600 × 300/700','257.14'],['<b>Total</b>','700','','<b>600.00</b>']],[1,3])}
<p>The phone revenue is recognised when it is handed over. The airtime revenue is recognised month by month over the 12 months, as that obligation is satisfied.</p>`,
practice:[
 mcqPool([
  {q:'Under IAS 2, inventory is measured at:',options:['The lower of cost and net realisable value','The higher of cost and net realisable value','Fair value','Replacement cost'],why:'This prevents inventory being shown at more than the business expects to recover.'},
  {q:'Which cost formula is NOT permitted by IAS 2?',options:['LIFO','FIFO','Weighted average','Specific identification'],why:'LIFO is prohibited under IFRS.'},
  {q:'Under IAS 16, a revaluation increase is normally recognised in:',options:['Other comprehensive income (revaluation surplus)','Profit or loss as income','Share capital','A provision'],why:'The gain is unrealised, so it goes to OCI and the revaluation surplus in equity.'},
  {q:'If one building is revalued under IAS 16, then:',options:['All assets in the same class must be revalued','Only that building is revalued','All property, plant and equipment must be revalued','The building must be sold'],why:'Revaluing a whole class stops cherry-picking assets that have risen in value.'},
  {q:'Step 1 of the IFRS 15 model is:',options:['Identify the contract with the customer','Determine the transaction price','Recognise revenue','Allocate the transaction price'],why:'The five steps start by identifying the contract.'}]),
 mcqPool([
  {q:'Which leases are exempt from recognition under IFRS 16?',options:['Short-term leases (12 months or less) and low-value assets','All property leases','Leases longer than five years','All operating leases'],why:'Only these two exemptions are allowed. Other leases go on the balance sheet.'},
  {q:'Under IAS 37, a provision is recognised when:',options:['There is a present obligation, a probable outflow and a reliable estimate','Management intends to spend money next year','An outflow is possible but not probable','Future operating losses are expected'],why:'All three conditions must be met. A possible outflow is only a contingent liability.'},
  {q:'Under IAS 38, research costs are:',options:['Always expensed','Always capitalised','Capitalised when the project is feasible','Treated as inventory'],why:'Only development costs can be capitalised, and only when strict criteria are met.'},
  {q:'The fundamental qualitative characteristics in the Conceptual Framework are:',options:['Relevance and faithful representation','Comparability and verifiability','Timeliness and understandability','Prudence and consistency'],why:'The other characteristics are enhancing ones.'},
  {q:'Under IAS 1, a liability is current if it is:',options:['Due to be settled within 12 months of the reporting date','Due within 5 years','Owed to a bank','Larger than the business’s cash balance'],why:'The 12-month test decides current or non-current.'},
  {q:'Under IFRS 16, a lease liability is first measured at:',options:['The present value of the lease payments','The total undiscounted payments','The fair value of the leased asset','Zero, until payments are made'],why:'The payments are discounted, because a lease is effectively financing.'}]),
 gen(()=>{const u=rint(10,200)*10,c=rint(8,60),sp=c+rint(-12,12),k=rint(1,6);const nrv=sp-k;return {type:'fields',prompt:`<p>A business holds ${fmt(u)} units that cost ${money(c)} each. They are expected to sell for ${money(sp)} each, with selling costs of ${money(k)} per unit.</p>`,fields:[{label:'NRV per unit (£)',answer:nrv},{label:'Inventory value under IAS 2 (£)',answer:u*Math.min(c,nrv)}],explain:`NRV = ${money(sp)} − ${money(k)} = ${money(nrv)}. IAS 2 uses the lower of cost (${money(c)}) and NRV, so ${money(Math.min(c,nrv))} per unit × ${fmt(u)} units = ${money(u*Math.min(c,nrv))}.`};}),
 gen(()=>{const q1=rint(10,60)*10,p1=rint(5,20),q2=rint(10,60)*10,p2=p1+rint(1,6),s=rint(Math.round((q1+q2)*.3/10),Math.round((q1+q2)*.8/10))*10;const r=q1+q2-s;const fifo=r<=q2?r*p2:q2*p2+(r-q2)*p1;const avg=(q1*p1+q2*p2)/(q1+q2),avco=r*avg;return {type:'fields',prompt:`<p>Opening inventory is nil. The business buys ${fmt(q1)} units at ${money(p1)}, then ${fmt(q2)} units at ${money(p2)}. It then sells ${fmt(s)} units. Value the closing inventory (nearest £; weighted average over all purchases).</p>`,fields:[{label:'Units in closing inventory',answer:r},{label:'Closing inventory — FIFO (£)',answer:fifo,tol:1},{label:'Closing inventory — weighted average (£)',answer:avco,tol:1,display:fmt(Math.round(avco))}],explain:`${fmt(r)} units remain. FIFO assumes the oldest units were sold first, so the remaining units are valued at the latest price${r>q2?'s':''}: ${money(fifo)}. Weighted average cost = ${money(q1*p1+q2*p2)} ÷ ${fmt(q1+q2)} = £${avg.toFixed(2)} a unit, × ${fmt(r)} = ${money(Math.round(avco))}. Prices rose, so FIFO gives the higher value.`};}),
 gen(()=>{const a=rint(20,80)*10,b=rint(10,60)*10,p=Math.round((a+b)*rint(70,90)/100/10)*10;const aa=p*a/(a+b),bb=p*b/(a+b);return {type:'fields',prompt:`<p>A customer buys a machine and a two-year maintenance plan together for ${money(p)}. Sold separately, the machine is ${money(a)} and the plan is ${money(b)}. Allocate the transaction price under IFRS 15 (nearest £).</p>`,fields:[{label:'Revenue allocated to the machine (£)',answer:aa,tol:1,display:fmt(Math.round(aa))},{label:'Revenue allocated to the maintenance plan (£)',answer:bb,tol:1,display:fmt(Math.round(bb))}],explain:`Allocate in proportion to standalone prices: machine ${money(p)} × ${fmt(a)}/${fmt(a+b)}; plan ${money(p)} × ${fmt(b)}/${fmt(a+b)}. The machine revenue is recognised on delivery and the plan revenue over the two years.`};}),
 gen(()=>{const cost=rint(20,100)*10000,dep=rint(2,8)*10000,v=cost-dep+rint(1,20)*10000;return {type:'fields',prompt:`<p>A building cost ${money(cost)} and has accumulated depreciation of ${money(dep)}. It is revalued to ${money(v)} under IAS 16.</p>`,fields:[{label:'Carrying amount before revaluation (£)',answer:cost-dep},{label:'Revaluation surplus (£)',answer:v-(cost-dep)}],explain:`Carrying amount = ${money(cost)} − ${money(dep)} = ${money(cost-dep)}. Surplus = ${money(v)} − ${money(cost-dep)} = ${money(v-cost+dep)}, recognised in other comprehensive income and the revaluation surplus in equity.`};}),
 gen(()=>({type:'classify',prompt:'<p>Put the IFRS 15 steps in order.</p>',options:['1','2','3','4','5'],items:shuffle([['Identify the contract with the customer','1'],['Identify the performance obligations','2'],['Determine the transaction price','3'],['Allocate the transaction price to the obligations','4'],['Recognise revenue when each obligation is satisfied','5']]).map(([l,a])=>({label:l,answer:a})),explain:'Contract → obligations → price → allocate → recognise. You need the total price before you can split it between obligations.'})),
 gen(()=>{const w=pick(WRITTEN);return {type:'written',prompt:`<p><b>${w.q}</b></p><p class="hint">Aim for 5–8 sentences: name the standard, state the rule, apply it, and explain why.</p>`,model:w.model,points:w.points};})
]});

/* ================= INDUSTRY READY ================= */
const BK_ACCTS=ACCTS.concat(['VAT control','Suspense','Bank charges','Sales ledger control','Purchases ledger control','Irrecoverable debts','Discounts allowed']);

/* ---------- Audit basics ---------- */
TOPICS.push({id:'audit',level:'ind',title:'Audit basics',blurb:'How an external audit works, and the tasks a first-year audit associate actually does.',
lesson:`<p>An external audit is an independent check of a company’s financial statements. The auditor gives an opinion on whether they show a <b>true and fair view</b> and are free from <b>material misstatement</b>, whether that comes from error or fraud. The directors prepare the accounts. The auditor checks them.</p>
<p>Auditors give <b>reasonable assurance</b>: a high level of confidence, but not a guarantee, because they test samples rather than every transaction.</p>
<h3>The audit cycle</h3>
<ol><li><b>Acceptance</b>: ethics and independence checks before taking on the client.</li><li><b>Planning</b>: understand the business, assess the risks of misstatement and set materiality.</li><li><b>Fieldwork</b>: tests of controls and substantive procedures (tests of detail and analytical review).</li><li><b>Completion</b>: review going concern and events after the year end, get written representations from management, and weigh up any uncorrected errors.</li><li><b>Reporting</b>: issue the audit opinion.</li></ol>
<h3>Materiality</h3>
<p>A misstatement is material if it could change the decisions of someone reading the accounts. Auditors set a materiality figure using a benchmark:</p>
${sTable(['Benchmark','Typical percentage'],[['Profit before tax','5%'],['Revenue','0.5% to 1%'],['Total assets','1% to 2%']])}
<p><b>Performance materiality</b> is set lower, often 50% to 75% of materiality, so that lots of small errors that add up are still caught.</p>
<h3>Audit risk</h3>
<div class="formula">Audit risk = Inherent risk × Control risk × Detection risk</div>
<p>The auditor can’t change inherent risk or control risk. Where those are high, they do more testing to bring detection risk down.</p>
<h3>Assertions: what the auditor is testing</h3>
${sTable(['Assertion','The question it answers'],[['Existence / occurrence','Is it real? Did it happen?'],['Completeness','Is everything included?'],['Accuracy and valuation','Is the amount right?'],['Cut-off','Is it in the right period?'],['Rights and obligations','Does the company own it, or owe it?'],['Classification and presentation','Is it in the right account and properly disclosed?']])}
<div class="note"><b>Direction of testing.</b> To test <b>existence</b>, start from the accounts and find the evidence (vouching). To test <b>completeness</b>, start from the evidence and check it is in the accounts (tracing).</div>
<h3>Evidence</h3>
<p>The main types are inspection, observation, external confirmation, recalculation, reperformance, analytical procedures and enquiry. Evidence from an independent third party, such as a bank confirmation, is more reliable than evidence produced by the client. Evidence the auditor gathers directly is the most reliable of all.</p>
<h3>Audit opinions</h3>
${sTable(['Problem','Material but not pervasive','Material and pervasive'],[['Misstatement found','Qualified (“except for”)','Adverse'],['Not enough evidence','Qualified (“except for”)','Disclaimer of opinion']])}
<p>If there is no material problem, the opinion is <b>unmodified</b>, often called a clean opinion.</p>
<h3>What you’ll do in your first year</h3>
<ul><li>Vouch samples of transactions to invoices, contracts and bank statements.</li><li>Send and chase bank and customer confirmations.</li><li>Attend inventory counts.</li><li>Test cut-off around the year end.</li><li>Recalculate depreciation, accruals and payroll.</li><li>Record your work in the audit file clearly enough that a reviewer can follow it without asking you.</li></ul>`,
example:`<p><b>Setting materiality.</b> A client has profit before tax of £2,400,000, revenue of £30,000,000 and total assets of £18,000,000.</p>
${sTable(['Benchmark','Workings','Result £'],[['5% of profit before tax','2,400,000 × 5%','120,000'],['1% of revenue','30,000,000 × 1%','300,000'],['2% of total assets','18,000,000 × 2%','360,000']],[2])}
<p>For a stable, profit-making company, profit before tax is the usual benchmark, so materiality is <b>£120,000</b>. Performance materiality at 75% is <b>£90,000</b>.</p>
<p><b>Testing cut-off.</b> Goods were delivered on 30 December but invoiced on 3 January and recorded in next year’s sales. The sale belongs to this year, so revenue is understated. The auditor records the error on a schedule of misstatements. If the errors on that schedule add up to more than materiality, the client is asked to correct them.</p>`,
practice:[
 gen(()=>{const pbt=rint(5,80)*100000,rev=pbt*rint(8,20),ta=Math.round(rev*rint(5,9)/10/100000)*100000;const m=pbt*.05;return {type:'fields',prompt:`<p>A client has profit before tax of ${money(pbt)}, revenue of ${money(rev)} and total assets of ${money(ta)}.</p>`,fields:[{label:'5% of profit before tax (£)',answer:m},{label:'1% of revenue (£)',answer:rev*.01},{label:'2% of total assets (£)',answer:ta*.02},{label:'Performance materiality: 75% of the profit-based figure (£)',answer:m*.75}],explain:`For a profit-making company the profit benchmark is normally used, giving materiality of ${money(m)} and performance materiality of ${money(m*.75)}.`};}),
 gen(()=>{const pool=[['Select items from the inventory records and find them in the warehouse','Existence'],['Select items in the warehouse and trace them to the inventory records','Completeness'],['Check that goods received just before and after the year end are recorded in the right period','Cut-off'],['Compare the cost of inventory with its selling price after the year end','Valuation'],['Inspect the title deeds for the company’s buildings','Rights and obligations'],['Send confirmation letters to a sample of customers','Existence'],['Review supplier statements for invoices missing from payables','Completeness'],['Review the aged receivables list for balances unlikely to be paid','Valuation'],['Check that sales invoices dated around the year end are recorded in the right year','Cut-off']];return {type:'classify',prompt:'<p>Which assertion does each audit procedure mainly test?</p>',options:['Existence','Completeness','Cut-off','Valuation','Rights and obligations'],items:pickN(pool,6).map(([l,a])=>({label:l,answer:a})),explain:'Records → real world tests existence. Real world → records tests completeness. Transactions around the year end test cut-off. Comparing cost with recoverable amounts tests valuation. Legal documents test rights.'};}),
 gen(()=>{const pool=[['The financial statements are free from material misstatement','Unmodified'],['Inventory is materially misstated, but the rest of the accounts are fine','Qualified'],['There are material misstatements in almost every area of the accounts','Adverse'],['The auditor couldn’t get enough evidence for almost every area','Disclaimer'],['The auditor couldn’t attend the stock count. Inventory is material but not pervasive','Qualified'],['There is a small, immaterial error the client refused to correct','Unmodified']];return {type:'classify',prompt:'<p>Which audit opinion fits each situation?</p>',options:['Unmodified','Qualified','Adverse','Disclaimer'],items:pickN(pool,5).map(([l,a])=>({label:l,answer:a})),explain:'Ask two questions: is the problem material, and is it pervasive? Material only → qualified. Material and pervasive → adverse (for misstatements) or disclaimer (for missing evidence). Nothing material → unmodified.'};}),
 gen(()=>{const S=rint(10,50)*10000,m=rint(2,40)*250,P=S*rint(5,20),pm=rint(4,20)*5000;const proj=m*P/S;return {type:'fields',prompt:`<p>You test a sample of sales invoices worth ${money(S)} and find overstatements totalling ${money(m)}. The whole population of sales invoices is ${money(P)}. Performance materiality is ${money(pm)}.</p>`,fields:[{label:'Projected misstatement in the population (£)',answer:proj,tol:1}],explain:`Projected misstatement = ${money(m)} ÷ ${money(S)} × ${money(P)} = ${money(Math.round(proj))}. This is ${proj>pm?'above':'below'} performance materiality of ${money(pm)}, so ${proj>pm?'the auditor would do more testing or ask the client to investigate and correct the errors.':'it is unlikely to be material on its own, though it still goes on the schedule of misstatements.'}`};}),
 mcqPool([
  {q:'Who is responsible for preparing a company’s financial statements?',options:['The directors','The auditors','The shareholders','The Financial Reporting Council'],why:'Management prepares the accounts. The auditor gives an independent opinion on them.'},
  {q:'Which evidence is the most reliable?',options:['A bank confirmation sent directly to the auditor','A schedule prepared by the client','A verbal explanation from the finance director','A photocopied invoice supplied by the client'],why:'Evidence from an independent third party, sent straight to the auditor, is hardest to tamper with.'},
  {q:'“Reasonable assurance” means:',options:['A high, but not absolute, level of assurance','A guarantee that the accounts are correct','That every transaction has been checked','That fraud has been ruled out'],why:'Auditors test samples and use judgement, so they can’t guarantee the accounts are error-free.'},
  {q:'Which procedure best tests the completeness of trade payables?',options:['Review payments made after the year end for liabilities that existed at the year end','Select balances from the payables ledger and agree them to invoices','Recalculate the total of the payables ledger','Ask the finance director whether payables are complete'],why:'Completeness means looking for liabilities that are missing, so start outside the ledger with later payments and supplier statements.'},
  {q:'Professional scepticism means:',options:['Having a questioning mind and staying alert to signs of misstatement','Assuming management is dishonest','Refusing to accept any client explanations','Testing every transaction'],why:'It means critically assessing evidence, neither trusting nor distrusting management by default.'}])
]});

/* ---------- Practical bookkeeping ---------- */
TOPICS.push({id:'bookkeeping',level:'ind',title:'Practical bookkeeping',blurb:'Bank reconciliations, VAT, control accounts and suspense accounts: the day-to-day work of a finance team.',
lesson:`<h3>Bank reconciliations</h3>
<p>The cash book and the bank statement rarely agree on the same day. A bank reconciliation explains the difference, in two stages.</p>
<ol><li><b>Update the cash book</b> for items on the bank statement that haven’t been recorded yet: bank charges, interest, direct debits, standing orders, BACS receipts and dishonoured cheques.</li><li><b>Reconcile</b> the updated cash book to the bank statement. The remaining differences are timing: cheques sent out that haven’t cleared (unpresented cheques) and money paid in that the bank hasn’t processed yet (outstanding lodgements).</li></ol>
<div class="formula">Bank statement balance + Outstanding lodgements − Unpresented cheques = Updated cash book balance</div>
<h3>VAT (UK standard rate 20%)</h3>
<p>A VAT-registered business charges <b>output VAT</b> on its sales and pays <b>input VAT</b> on its purchases. It pays HMRC the difference.</p>
<div class="formula">VAT payable = Output VAT − Input VAT</div>
<p>From a net amount, VAT = net × 20%. From a gross (VAT-inclusive) amount, VAT = gross × 1/6.</p>
<p>A credit sale with VAT is recorded as Dr Trade receivables (gross), Cr Sales (net), Cr VAT control (the VAT).</p>
<h3>Control accounts</h3>
<p>A sales ledger control account summarises every customer account in one total, so it can be checked against the list of individual balances.</p>
${sTable(['Debit side (increases)','Credit side (decreases)'],[['Opening balance','Cash and cheques received'],['Credit sales','Discounts allowed'],['Dishonoured cheques','Sales returns'],['','Irrecoverable debts written off'],['','Contra with the purchases ledger']])}
<p>Cash sales never go in a sales ledger control account, because no customer owes anything.</p>
<h3>Suspense accounts</h3>
<p>If a trial balance doesn’t agree, the difference is put into a temporary suspense account so the draft accounts can be prepared. Each error is then found and corrected with a journal, and the suspense account is cleared to nil.</p>
<h3>A month-end close checklist</h3>
<ul><li>Post all sales and purchase invoices for the month.</li><li>Reconcile every bank account.</li><li>Reconcile the sales and purchases ledger control accounts.</li><li>Post accruals, prepayments and depreciation.</li><li>Clear the suspense account.</li><li>Review the management accounts for anything unusual before sending them on.</li></ul>`,
example:`<p>The cash book shows £4,200. The bank statement shows £5,030. It also shows bank charges of £45, a £300 insurance direct debit and a £650 BACS receipt from a customer, none of which are in the cash book yet. Cheques of £1,625 haven’t cleared, and £1,100 paid in on the last day isn’t on the statement.</p>
${sTable(['Updated cash book','£'],[['Balance per cash book','4,200'],['Less: Bank charges','(45)'],['Less: Direct debit (insurance)','(300)'],['Add: BACS receipt','650'],['<b>Updated cash book balance</b>','<b>4,505</b>']],[1])}
${sTable(['Bank reconciliation','£'],[['Balance per bank statement','5,030'],['Add: Outstanding lodgement','1,100'],['Less: Unpresented cheques','(1,625)'],['<b>Balance per updated cash book</b>','<b>4,505</b>']],[1])}`,
practice:[
 gen(()=>{const cb=rint(20,160)*50,b=rint(2,12)*5,d=rint(4,40)*10,r=rint(4,60)*10,u=rint(4,60)*25,l=rint(4,50)*25;const upd=cb-b-d+r,st=upd+u-l;return {type:'fields',prompt:`<p>The cash book shows a debit balance of ${money(cb)}. The bank statement includes bank charges of ${money(b)}, a direct debit of ${money(d)} and a BACS receipt of ${money(r)}, none of which are in the cash book. Unpresented cheques total ${money(u)} and there is an outstanding lodgement of ${money(l)}.</p>`,fields:[{label:'Updated cash book balance (£)',answer:upd},{label:'Balance the bank statement should show (£)',answer:st}],explain:`Updated cash book = ${money(cb)} − ${money(b)} − ${money(d)} + ${money(r)} = ${money(upd)}. The bank statement hasn’t yet deducted the unpresented cheques or added the lodgement, so it shows ${money(upd)} + ${money(u)} − ${money(l)} = ${money(st)}.`};}),
 gen(()=>{const N=rint(10,200)*100,G=rint(6,150)*120;return {type:'fields',prompt:`<p>In the quarter, a VAT-registered business made sales of ${money(N)} <b>excluding</b> VAT and purchases of ${money(G)} <b>including</b> VAT at 20%.</p>`,fields:[{label:'Output VAT (£)',answer:N*.2},{label:'Input VAT (£)',answer:G/6},{label:'VAT payable to HMRC (£)',answer:N*.2-G/6,display:fmt(N*.2-G/6)}],explain:`Output VAT = ${money(N)} × 20% = ${money(N*.2)}. Input VAT on a gross figure = ${money(G)} × 1/6 = ${money(G/6)}. Payable = ${money(N*.2)} − ${money(G/6)} = ${fmt(N*.2-G/6)}${N*.2-G/6<0?' (a repayment is due from HMRC)':''}.`};}),
 gen(()=>{const x=rint(4,80)*50,v=x*.2;return {type:'journal',prompt:`<p>Record a credit sale of goods for ${money(x)} plus VAT at 20%.</p>`,accounts:BK_ACCTS,answer:[['Trade receivables',x+v,0],['Sales',0,x],['VAT control',0,v]],explain:`The customer owes the gross amount of ${money(x+v)}. Sales is credited with the net ${money(x)}, and the ${money(v)} VAT is owed to HMRC, so it is credited to VAT control.`};}),
 gen(()=>{const o=rint(20,80)*250,s=rint(80,300)*250,cs=rint(20,100)*100,c=rint(Math.floor(s*.6/250),Math.floor(s*.95/250))*250,da=rint(2,20)*25,ret=rint(2,30)*25,bd=rint(0,20)*25;const cl=o+s-c-da-ret-bd;return {type:'fields',prompt:`<p>Prepare the sales ledger control account. Opening balance ${money(o)}; credit sales ${money(s)}; cash sales ${money(cs)}; receipts from credit customers ${money(c)}; discounts allowed ${money(da)}; sales returns ${money(ret)}; irrecoverable debts written off ${money(bd)}.</p>`,fields:[{label:'Closing balance (£)',answer:cl}],explain:`${money(o)} + ${money(s)} − ${money(c)} − ${money(da)} − ${money(ret)} − ${money(bd)} = ${money(cl)}. Cash sales of ${money(cs)} are left out, because no customer owes anything for them.`};}),
 gen(()=>{const x=rint(4,60)*25;return Math.random()<.5?{type:'journal',prompt:`<p>Rent of ${money(x)} was paid from the bank. It was debited to Rent, but no credit entry was made, so the difference went to the suspense account. Write the correcting journal.</p>`,accounts:BK_ACCTS,answer:[['Suspense',x,0],['Cash',0,x]],explain:`The missing credit to Cash is made now. The debit goes to Suspense, which clears the balance created by the error.`}:{type:'journal',prompt:`<p>A credit sale of ${money(x)} was credited to Sales, but the debit to Trade receivables was missed, so the difference went to the suspense account. Write the correcting journal.</p>`,accounts:BK_ACCTS,answer:[['Trade receivables',x,0],['Suspense',0,x]],explain:`The missing debit to Trade receivables is made now. The credit goes to Suspense, which clears it.`};}),
 mcqPool([
  {q:'An unpresented cheque should be dealt with by:',options:['Adjusting the bank statement balance in the reconciliation','Adjusting the cash book','Writing it off as an expense','Ignoring it'],why:'The cash book is already correct. The bank simply hasn’t processed the cheque yet.'},
  {q:'A gross invoice of £600 includes VAT at 20%. The VAT is:',options:['£100','£120','£500','£150'],why:'VAT in a gross figure is 1/6 of the total: £600 ÷ 6 = £100.'},
  {q:'A direct debit appears on the bank statement but not in the cash book. You should:',options:['Enter it in the cash book','Add it back in the bank reconciliation','Ignore it until next month','Put it in the suspense account'],why:'It is a real payment the business hasn’t recorded, so the cash book needs updating.'},
  {q:'Which item does NOT belong in the sales ledger control account?',options:['Cash sales','Discounts allowed','Irrecoverable debts','Sales returns'],why:'The control account only tracks what credit customers owe.'}])
]});

/* ---------- Group accounts ---------- */
TOPICS.push({id:'groups',level:'ind',title:'Group accounts',blurb:'Consolidation under IFRS 10 and IFRS 3: goodwill, non-controlling interest and intra-group trading.',
lesson:`<p>A parent that <b>controls</b> another company (a subsidiary) must prepare consolidated accounts that show the group as a single business (IFRS 10). Control usually comes from owning more than 50% of the voting shares.</p>
<h3>How consolidation works</h3>
<ol><li>Add together 100% of the parent’s and subsidiary’s assets, liabilities, income and expenses, line by line, even if the parent owns less than 100%.</li><li>Replace the parent’s “investment in subsidiary” with goodwill.</li><li>Show the share of the subsidiary owned by other shareholders as <b>non-controlling interest (NCI)</b>, within equity.</li><li>Cancel anything between group companies: intra-group balances, sales and unrealised profit.</li></ol>
<h3>Goodwill (IFRS 3)</h3>
<div class="formula">Goodwill = Consideration paid + Fair value of NCI − Fair value of net assets at acquisition</div>
<p>Goodwill is not amortised. It is tested for impairment every year (IAS 36).</p>
<h3>Group retained earnings and NCI</h3>
<p>Only profits the subsidiary makes <b>after</b> the acquisition belong to the group.</p>
<div class="formula">Group retained earnings = Parent’s retained earnings + Parent % × Subsidiary’s post-acquisition profits</div>
<div class="formula">NCI at year end = NCI at acquisition + NCI % × Subsidiary’s post-acquisition profits</div>
<h3>Unrealised profit (PURP)</h3>
<p>If one group company sells goods to another at a profit and some are still in stock at the year end, the group hasn’t made that profit yet. Remove it from inventory and from profit.</p>
<p>With a <b>mark-up</b> on cost of m%, profit = selling price × m / (100 + m). With a <b>margin</b> of g%, profit = selling price × g%.</p>
<h3>Associates (IAS 28)</h3>
<p>If the investor has <b>significant influence</b> but not control, usually 20% to 50% of the voting shares, the investment is an associate. It isn’t consolidated line by line. It is shown as one line using the equity method: cost plus the investor’s share of profits since acquisition.</p>`,
example:`<p>P buys 80% of S for £500,000. The fair value of the NCI at acquisition is £110,000. At acquisition S had share capital of £200,000 and retained earnings of £300,000 (fair value = book value). At the year end S’s retained earnings are £380,000, and P’s are £900,000.</p>
${sTable(['Working','£'],[['Consideration','500,000'],['Add: Fair value of NCI','110,000'],['Less: Net assets at acquisition (200,000 + 300,000)','(500,000)'],['<b>Goodwill</b>','<b>110,000</b>']],[1])}
<p>Post-acquisition profit in S = 380,000 − 300,000 = £80,000.</p>
${sTable(['Working','£'],[['P’s retained earnings','900,000'],['Add: 80% × 80,000','64,000'],['<b>Group retained earnings</b>','<b>964,000</b>'],['NCI at acquisition','110,000'],['Add: 20% × 80,000','16,000'],['<b>NCI at year end</b>','<b>126,000</b>']],[1])}`,
practice:[
 gen(()=>{for(;;){const sc=rint(5,40)*10000,re=rint(5,60)*10000,f=rint(0,10)*10000,na=sc+re+f,p=pick([60,70,75,80,90]),C=Math.round(na*p/100*rint(105,140)/100/10000)*10000,n=Math.round(na*(100-p)/100*rint(100,125)/100/5000)*5000,gw=C+n-na;if(gw<=0)continue;
  return {type:'fields',prompt:`<p>A parent buys ${p}% of a subsidiary for ${money(C)}. The fair value of the NCI at acquisition is ${money(n)}. At acquisition the subsidiary had share capital of ${money(sc)} and retained earnings of ${money(re)}${f?`, and its land was worth ${money(f)} more than its book value`:''}.</p>`,fields:[{label:'Fair value of net assets at acquisition (£)',answer:na},{label:'Goodwill (£)',answer:gw}],explain:`Net assets = ${money(sc)} + ${money(re)}${f?` + ${money(f)} fair value uplift`:''} = ${money(na)}. Goodwill = ${money(C)} + ${money(n)} − ${money(na)} = ${money(gw)}.`};}}),
 gen(()=>{const p=pick([60,70,75,80,90]),pr=rint(20,200)*10000,ra=rint(5,60)*10000,rn=ra+rint(1,40)*5000,n=rint(4,40)*5000;const post=rn-ra,g=pr+post*p/100,nci=n+post*(100-p)/100;return {type:'fields',prompt:`<p>The parent owns ${p}% of its subsidiary. At the year end the parent’s retained earnings are ${money(pr)}. The subsidiary’s retained earnings were ${money(ra)} at acquisition and are ${money(rn)} now. NCI at acquisition was ${money(n)}.</p>`,fields:[{label:'Subsidiary’s post-acquisition profit (£)',answer:post},{label:'Group retained earnings (£)',answer:g},{label:'NCI at the year end (£)',answer:nci}],explain:`Post-acquisition profit = ${money(rn)} − ${money(ra)} = ${money(post)}. Group retained earnings = ${money(pr)} + ${p}% × ${money(post)} = ${money(g)}. NCI = ${money(n)} + ${100-p}% × ${money(post)} = ${money(nci)}.`};}),
 gen(()=>{const V=rint(8,80)*1000,useMark=Math.random()<.5,rate=useMark?pick([20,25,50]):pick([20,25,30,40]),un=pick([25,40,50,60]);const prof=useMark?V*rate/(100+rate):V*rate/100,purp=prof*un/100;return {type:'fields',prompt:`<p>The parent sold goods to its subsidiary for ${money(V)} at a ${useMark?`mark-up of ${rate}% on cost`:`margin of ${rate}%`}. At the year end, ${un}% of the goods are still in the subsidiary’s inventory. Round to the nearest £.</p>`,fields:[{label:'Profit on the intra-group sale (£)',answer:prof,tol:1,display:fmt(Math.round(prof))},{label:'Unrealised profit to remove (£)',answer:purp,tol:1,display:fmt(Math.round(purp))}],explain:`${useMark?`With a ${rate}% mark-up, profit = ${money(V)} × ${rate}/${100+rate}`:`With a ${rate}% margin, profit = ${money(V)} × ${rate}%`} = ${money(Math.round(prof))}. Only the ${un}% still in stock is unrealised: ${money(Math.round(purp))}. Reduce group inventory and group profit by this amount.`};}),
 gen(()=>{const pool=[['Owns 80% of the voting shares','Subsidiary'],['Owns 30% and has a seat on the board','Associate'],['Owns 5% with no influence','Simple investment'],['Owns 45%, but controls the board through an agreement with other shareholders','Subsidiary'],['Owns 25% of the voting shares','Associate'],['Owns 100% of the voting shares','Subsidiary'],['Owns 12% and has no board seat','Simple investment']];return {type:'classify',prompt:'<p>How should each investment be treated in the investor’s group accounts?</p>',options:['Subsidiary','Associate','Simple investment'],items:pickN(pool,5).map(([l,a])=>({label:l,answer:a})),explain:'Control (usually over 50%, or control by agreement) makes a subsidiary. Significant influence (usually 20% to 50%) makes an associate. Anything less is a simple investment.'};}),
 mcqPool([
  {q:'Under IFRS 3, goodwill is:',options:['Tested for impairment every year and not amortised','Amortised over 10 years','Written off immediately','Revalued to fair value every year'],why:'IFRS 3 and IAS 36 require an annual impairment test instead of amortisation.'},
  {q:'The parent owes its subsidiary £20,000 at the year end. In the group accounts:',options:['Both the receivable and the payable are cancelled','Both are shown in full','Only the payable is shown','It is disclosed as a contingent liability'],why:'A group can’t owe money to itself, so intra-group balances are removed.'},
  {q:'Where is non-controlling interest shown in the group statement of financial position?',options:['Within equity','As a non-current liability','As a current liability','Deducted from goodwill'],why:'NCI is the other shareholders’ share of the group’s net assets, so it is part of equity.'},
  {q:'A parent owns 60% of a subsidiary. How much of the subsidiary’s inventory goes into the group accounts?',options:['100%','60%','40%','None, only the investment is shown'],why:'Consolidation adds 100% of the subsidiary’s assets and liabilities, then shows the 40% owned by others as NCI.'}])
]});

/* ---------- Interview prep ---------- */
const INT_WRITTEN=[
 {q:'Walk me through how the three financial statements link together.',model:'Profit for the year from the income statement is added to retained earnings in the statement of financial position. The statement of cash flows starts from profit, adjusts for non-cash items such as depreciation and for changes in working capital, then adds investing and financing cash flows. Its closing cash figure must agree with cash in the statement of financial position. For example, if depreciation rises, profit falls, but cash only changes by the tax effect, and the fall in the asset’s value balances the fall in retained earnings.',points:['Profit flows into retained earnings','Cash flow starts from profit and adjusts for non-cash items and working capital','Closing cash agrees to the balance sheet','Gives a short worked example']},
 {q:'What is materiality, and why does it matter to an auditor?',model:'Materiality is the size of misstatement that could change the decisions of someone relying on the accounts. Auditors set it at the planning stage, often around 5% of profit before tax, and set a lower performance materiality so that smaller errors that add up are caught. It matters because it decides how much testing is done and whether errors found need correcting before a clean opinion can be given.',points:['Defines it in terms of users’ decisions','Gives a benchmark such as 5% of profit before tax','Mentions performance materiality','Explains how it drives the amount of testing and the opinion']},
 {q:'What does “going concern” mean?',model:'Going concern means the company is expected to keep operating for the foreseeable future, which is at least 12 months, without needing to close or being forced to sell off its assets. Accounts are normally prepared on this basis. Management must assess it, and the auditor reviews that assessment, for example by looking at cash flow forecasts, loan covenants and financing. If there is significant doubt, the accounts must disclose it and the audit report highlights it.',points:['Business continues for the foreseeable future (at least 12 months)','Basis for preparing the accounts','Evidence the auditor looks at, such as forecasts and covenants','What happens if there is doubt']},
 {q:'Why do you want to work in audit?',model:'A strong answer links three things. First, what audit actually involves: understanding how different businesses work and testing whether their numbers can be trusted. Second, a real example from your own experience, such as a finance role where you enjoyed checking and reconciling figures. Third, why it suits your plans: the breadth of clients and the professional qualification. Keep it specific to the firm by mentioning something concrete you learned from its people or events.',points:['Shows understanding of what auditors do','Uses a real personal example','Links to long-term goals and the qualification','Makes it specific to the firm']}];
TOPICS.push({id:'interview',level:'ind',title:'Interview prep',blurb:'How to answer technical, competency and commercial awareness questions for graduate finance roles.',
lesson:`<p>Large firms usually recruit graduates in stages: an online application, online tests, a video interview, then an assessment centre or final interview, which may include a case study, a written exercise or a presentation. The details differ from firm to firm, so check each firm’s careers site.</p>
<h3>Answering a technical question</h3>
<ol><li><b>Define</b> it in one sentence.</li><li>Give a short <b>example</b>, ideally with numbers.</li><li>Say <b>why it matters</b>, to the client or to the audit.</li></ol>
<div class="note"><b>If you don’t know.</b> Say what you do know and reason through it out loud. Interviewers want to see how you think, not a memorised answer.</div>
<h3>Competency and strengths questions: STAR</h3>
${sTable(['Step','What to say','Share of the answer'],[['Situation','The context, in one or two sentences','Small'],['Task','What you had to do','Small'],['Action','What <b>you</b> did, step by step. Say “I”, not “we”','Most'],['Result','What happened, with a number if possible, and what you learned','Medium']])}
<p>Use examples from work, study, sport and part-time jobs. A finance or admin job, however junior, is a strong source of examples about accuracy, deadlines and dealing with clients.</p>
<h3>Commercial awareness</h3>
<p>Pick two or three business stories and follow them for a few weeks. For each one, be ready to say what happened, who it affects, and what it means for the firm’s clients and for the firm itself. For audit firms, themes that come up often are audit quality and regulation, technology and AI in audit, sustainability reporting, and how interest rates and inflation affect clients, including going concern.</p>
<h3>Common technical questions</h3>
<details class="qa"><summary>What is the difference between profit and cash?</summary><p>Profit is income minus expenses when they are earned or incurred. Cash is money actually received or paid. They differ because of credit sales and purchases, non-cash items like depreciation, and spending on assets that isn’t an expense.</p></details>
<details class="qa"><summary>What is depreciation, and why do we charge it?</summary><p>It spreads the cost of a non-current asset over its useful life, so the cost is matched to the years that benefit. Example: a £10,000 van used for 5 years costs £2,000 a year on a straight-line basis.</p></details>
<details class="qa"><summary>If depreciation rises by £100 and tax is 25%, what happens to the three statements?</summary><p>Profit after tax falls by £75. In the cash flow the £100 is added back, so cash rises by £25 because of the tax saving. On the balance sheet, assets fall by £100 and rise by £25 of cash (net −£75), and retained earnings fall by £75, so it balances.</p></details>
<details class="qa"><summary>What is working capital?</summary><p>Current assets minus current liabilities. It shows whether a business can fund its day-to-day operations. Too little risks not paying bills; too much means cash is tied up in stock or receivables.</p></details>
<details class="qa"><summary>What is goodwill?</summary><p>The amount paid for a business above the fair value of its net assets. It reflects things like reputation, customers and staff. It is tested for impairment every year.</p></details>
<details class="qa"><summary>What is the difference between audit and advisory work?</summary><p>Audit gives an independent opinion on financial statements for shareholders. Advisory helps a client improve or change something. Firms can’t provide many advisory services to their audit clients because it would threaten independence.</p></details>
<details class="qa"><summary>What is professional scepticism?</summary><p>Keeping a questioning mind: not simply accepting explanations, and looking for evidence that confirms or contradicts what management says.</p></details>
<h3>Good questions to ask at the end</h3>
<ul><li>What do the most successful people in your first year do differently?</li><li>What kind of clients would I work with in my first year?</li><li>How does the team support people studying for professional exams?</li></ul>`,
example:`<p><b>Question:</b> “Tell me about a time you found a mistake.”</p>
${sTable(['STAR','Example answer'],[['Situation','In my finance job, the monthly supplier payment run was due that afternoon.'],['Task','I was checking the payment list against the purchase ledger before it went for approval.'],['Action','I noticed one supplier appeared twice with the same invoice number. I checked the invoice, found it had been entered twice, removed the duplicate and told my manager. I then suggested we run a duplicate-invoice check before every payment run.'],['Result','We avoided paying £2,300 twice, and the check became part of the monthly process. I learned to check for patterns, not just individual lines.']])}
<p>Notice that most of the answer is the Action, it uses “I”, and the result has a number and a lesson.</p>`,
practice:[
 gen(()=>{if(Math.random()<.5){const x=rint(1,20)*100;return {type:'fields',prompt:`<p>Depreciation increases by ${money(x)}. The tax rate is 25% and tax is paid in cash. Enter the change in each figure, using a minus sign or brackets for a decrease.</p>`,fields:[{label:'Profit after tax',answer:-x*.75,display:fmt(-x*.75)},{label:'Cash',answer:x*.25,display:fmt(x*.25)},{label:'Property, plant and equipment',answer:-x,display:fmt(-x)},{label:'Retained earnings',answer:-x*.75,display:fmt(-x*.75)}],explain:`Profit before tax falls by ${money(x)}, and tax falls by ${money(x*.25)}, so profit after tax falls by ${money(x*.75)}. Depreciation isn’t cash, so the only cash effect is the tax saving of ${money(x*.25)}. Assets: PPE −${fmt(x)}, cash +${fmt(x*.25)}. Equity: retained earnings −${fmt(x*.75)}. Both sides fall by ${money(x*.75)}.`};}
  const x=rint(1,20)*100;return {type:'fields',prompt:`<p>A company buys ${money(x)} of inventory, paying cash. None of it is sold this year. Enter the change in each figure, using a minus sign or brackets for a decrease.</p>`,fields:[{label:'Profit after tax',answer:0,display:'0'},{label:'Cash',answer:-x,display:fmt(-x)},{label:'Inventory',answer:x,display:fmt(x)},{label:'Retained earnings',answer:0,display:'0'}],explain:`Buying stock isn’t an expense until it is sold, so profit doesn’t change. Cash falls by ${money(x)} and inventory rises by ${money(x)}, so total assets stay the same.`};}),
 gen(()=>{const pool=[['During a work placement, the month-end accounts were two days late.','Situation'],['I was asked to find out why the bank reconciliation kept failing.','Task'],['I compared the bank feed with the cash book line by line and built a checklist of recurring items.','Action'],['The next month the reconciliation was finished on the first day, and the team still uses the checklist.','Result'],['Our group had a week to submit a report and one member had stopped replying.','Situation'],['I needed to make sure the missing section was covered without missing the deadline.','Task'],['I split the section between the three of us and set up a ten-minute check-in each day.','Action'],['We submitted a day early and got a first.','Result']];return {type:'classify',prompt:'<p>Which part of a STAR answer is each sentence?</p>',options:['Situation','Task','Action','Result'],items:pickN(pool,6).map(([l,a])=>({label:l,answer:a})),explain:'Situation sets the scene, Task is what you had to achieve, Action is what you did, and Result is what happened. In a strong answer, the Action is the longest part.'};}),
 gen(()=>{const w=pick(INT_WRITTEN);return {type:'written',prompt:`<p><b>${w.q}</b></p><p class="hint">Write your answer as you would say it, in about a minute’s worth of speech. Then compare it with the model answer.</p>`,model:w.model,points:w.points};}),
 mcqPool([
  {q:'In a STAR answer, which part should take up the most time?',options:['Action','Situation','Task','Result'],why:'Interviewers score what you personally did, so that should be the biggest part.'},
  {q:'Depreciation rises by £100 and tax is 25%. What happens to cash?',options:['It rises by £25','It falls by £100','It falls by £75','It doesn’t change'],why:'Depreciation isn’t cash, but it reduces the tax bill by £25, so cash is £25 higher.'},
  {q:'What is the best way to show commercial awareness?',options:['Explain what a news story means for the firm’s clients and for the firm','List as many recent headlines as possible','Give your opinion on the share price','Say you read the news every day'],why:'Interviewers want to hear you connect events to their impact on businesses.'},
  {q:'You’re asked a technical question you don’t know the answer to. What should you do?',options:['Say what you do know and reason through it out loud','Make up a confident answer','Say “I don’t know” and move on','Ask to skip the question'],why:'Showing how you think is valued more than a perfect answer.'}])
]});

/* ================= ON THE JOB ================= */
const emailBox=(from,to,subj,body)=>`<div class="email"><div class="email-h"><div><b>From:</b> ${from}</div><div><b>To:</b> ${to}</div><div><b>Subject:</b> ${subj}</div></div><div class="email-b">${body}</div></div>`;
const docH=t=>`<h3 class="doc-h">${t}</h3>`;
const mcqFixed=(prompt,options,answer,explain)=>fixed({type:'mcq',prompt:`<p>${prompt}</p>`,options,answer,explain});

/* ---------- Simulation 1: receivables ---------- */
TOPICS.push({id:'jobrec',level:'job',title:'Audit: testing receivables',blurb:'Your first audit section: pick the balances to test, check after-date cash, test sales cut-off and report back.',
lesson:`<p>You are a first-year audit associate. The client is <b>Harbour &amp; Hale Coffee Roasters Ltd</b>, a wholesale coffee supplier (a fictional company). The year end is <b>31 March 2026</b>, and fieldwork is in May.</p>
${emailBox('Sam (Audit Senior)','You','Harbour & Hale: receivables section',`<p>Hi,</p><p>Welcome to the team. Please can you take the trade receivables section? The balance at 31 March is <b>£412,600</b>.</p><p>Materiality is £24,000 and performance materiality is <b>£18,000</b>. Please test every balance over <b>£15,000</b> in full; I’ll give you a sample of the rest later.</p><ol><li>Pick out the balances to test.</li><li>Check them against cash received after the year end.</li><li>Do the sales cut-off test on the despatch notes I’ve attached.</li><li>Send me a short summary of what you found.</li></ol><p>Shout if anything looks odd. Thanks, Sam</p>`)}
${docH('Document 1: Aged receivables listing at 31 March 2026')}
${sTable(['Customer','Balance £','Current £','31–90 days £','Over 90 days £'],[['Brewline Cafés Ltd','48,200','48,200','–','–'],['Northgate Hotels plc','36,750','30,000','6,750','–'],['Olive &amp; Oak Deli','3,900','3,900','–','–'],['Station Kiosk Co','12,480','12,480','–','–'],['Greenleaf Grocers','22,300','22,300','–','–'],['Parkside University Catering','61,400','61,400','–','–'],['The Daily Grind','8,150','–','–','8,150'],['Cornerstone Offices','17,900','17,900','–','–'],['Harbour Market Stalls','2,640','2,640','–','–'],['52 other customers','198,880','181,300','17,580','–'],['<b>Total</b>','<b>412,600</b>','','','']],[1,2,3,4])}
${docH('Document 2: Cash received after the year end (from bank statements, April–May 2026)')}
${sTable(['Customer','Date received','Amount £','Notes'],[['Brewline Cafés Ltd','18 April','48,200','Remittance lists all March invoices'],['Northgate Hotels plc','22 April','30,000','Customer email: remaining £6,750 on hold, goods arrived damaged'],['Greenleaf Grocers','9 April','22,300','Full balance'],['Parkside University Catering','30 April','41,400','Remittance excludes invoice INV-2291 (£20,000)'],['Cornerstone Offices','12 May','17,900','Full balance']],[2])}
${docH('Document 3: Sales cut-off, despatch notes either side of the year end')}
${sTable(['Despatch note','Goods sent','Invoice','Invoice date','Amount £','Recorded in'],[['DN-4410','29 March','INV-2288','29 March','5,600','Year to 31 March 2026'],['DN-4411','30 March','INV-2289','31 March','3,250','Year to 31 March 2026'],['DN-4412','31 March','INV-2290','2 April','7,400','Year to 31 March 2027'],['DN-4413','2 April','INV-2291','28 March','20,000','Year to 31 March 2026'],['DN-4414','3 April','INV-2292','3 April','4,100','Year to 31 March 2027']],[4])}`,
example:`<ul>
<li><b>Read the brief twice.</b> Note the thresholds (test over £15,000; performance materiality £18,000) before touching the documents.</li>
<li><b>Work from the listing.</b> Highlight the balances you will test and work out how much of the total they cover. Seniors like to see coverage as a percentage.</li>
<li><b>After-date cash is strong evidence of existence.</b> If a customer paid after the year end, the debt was real. Anything unpaid needs another test, such as checking the invoice and the signed delivery note.</li>
<li><b>For cut-off, the despatch date decides the period.</b> Revenue belongs in the year the goods were sent, not the year the invoice was dated.</li>
<li><b>Flag, don’t fix.</b> The client corrects its own accounts. Your job is to quantify each error, record it and propose an adjustment.</li>
<li><b>Look beyond the task.</b> The aged listing shows other risks, such as old balances that may never be paid. Mention them even if nobody asked.</li>
</ul>
<div class="note"><b>How your working paper should read.</b> Objective, what you did, what you found, conclusion. For example: “Objective: to confirm the existence of trade receivables. Work done: agreed balances over £15,000 to cash received after the year end. Findings: … Conclusion: …”</div>`,
practice:[
 fixed({type:'classify',prompt:'<p>Using Document 1 and Sam’s £15,000 threshold, which balances do you test in full?</p>',options:['Test in full','Leave for the sample'],items:[['Brewline Cafés Ltd (£48,200)','Test in full'],['Northgate Hotels plc (£36,750)','Test in full'],['Olive &amp; Oak Deli (£3,900)','Leave for the sample'],['Station Kiosk Co (£12,480)','Leave for the sample'],['Greenleaf Grocers (£22,300)','Test in full'],['Parkside University Catering (£61,400)','Test in full'],['The Daily Grind (£8,150)','Leave for the sample'],['Cornerstone Offices (£17,900)','Test in full']].map(([l,a])=>({label:l,answer:a})),explain:'Five balances are over £15,000: Brewline, Northgate, Greenleaf, Parkside and Cornerstone.'}),
 fixed({type:'fields',prompt:'<p>Work out how much of the receivables balance your testing covers.</p>',fields:[{label:'Total of the five balances tested in full (£)',answer:186550},{label:'Coverage of the £412,600 total (%, 1 decimal place)',answer:45.2,tol:0.1,unit:'%',display:'45.2'}],explain:'48,200 + 36,750 + 22,300 + 61,400 + 17,900 = £186,550. Coverage = 186,550 ÷ 412,600 × 100 = 45.2%.'}),
 fixed({type:'classify',prompt:'<p>Compare each balance tested with the cash received after the year end (Document 2).</p>',options:['Cleared by after-date cash','Exception: follow up'],items:[['Brewline Cafés Ltd','Cleared by after-date cash'],['Northgate Hotels plc','Exception: follow up'],['Greenleaf Grocers','Cleared by after-date cash'],['Parkside University Catering','Exception: follow up'],['Cornerstone Offices','Cleared by after-date cash']].map(([l,a])=>({label:l,answer:a})),explain:'Northgate has paid only £30,000, with £6,750 disputed over damaged goods. Parkside has paid everything except INV-2291 (£20,000). Both need more work.'}),
 fixed({type:'classify',prompt:'<p>Look at Document 3. Was each invoice recorded in the right period? The year end is 31 March.</p>',options:['Correct period','Recorded too early','Recorded too late'],items:[['INV-2288: goods sent 29 March, recorded in the year to March 2026','Correct period'],['INV-2289: goods sent 30 March, recorded in the year to March 2026','Correct period'],['INV-2290: goods sent 31 March, recorded in the year to March 2027','Recorded too late'],['INV-2291: goods sent 2 April, recorded in the year to March 2026','Recorded too early'],['INV-2292: goods sent 3 April, recorded in the year to March 2027','Correct period']].map(([l,a])=>({label:l,answer:a})),explain:'The despatch date decides the period. INV-2290’s goods left before the year end but were recorded next year. INV-2291 was invoiced on 28 March for goods that didn’t leave until 2 April, so it was recorded too early. It is also the Parkside invoice that hasn’t been paid.'}),
 fixed({type:'fields',prompt:'<p>Quantify the cut-off errors in this year’s revenue.</p>',fields:[{label:'Revenue overstated by INV-2291 (£)',answer:20000},{label:'Revenue understated by INV-2290 (£)',answer:7400},{label:'Net overstatement of revenue (£)',answer:12600}],explain:'INV-2291 adds £20,000 that belongs to next year. INV-2290 leaves out £7,400 that belongs to this year. Net, this year’s revenue is overstated by £12,600. Auditors still record each error separately, because the £20,000 on its own is above performance materiality.'}),
 mcqFixed('The INV-2291 error is £20,000 and performance materiality is £18,000. What should you recommend to Sam?',['Propose that the client corrects both cut-off errors, because INV-2291 alone is above performance materiality','Ignore it, because the net error is only £12,600','Correct the client’s ledger yourself','Wait until next year, because it will reverse on its own'],0,'Errors are judged individually and in total. An error above performance materiality should be corrected. The auditor proposes the adjustment and the client makes it.'),
 fixed({type:'journal',prompt:'<p>Write the journal you would propose to reverse INV-2291 from this year. Ignore VAT and inventory.</p>',accounts:ACCTS,answer:[['Sales',20000,0],['Trade receivables',0,20000]],explain:'The sale and the amount owed were both recorded a period early, so both are reversed: debit Sales, credit Trade receivables.'}),
 mcqFixed('The Daily Grind owes £8,150, all over 90 days old. What should you do?',['Ask management whether it will be paid, look for any payments or letters after the year end, and check whether an allowance is needed','Nothing, because it is below the £15,000 threshold','Write it off in the client’s ledger','Send the customer a letter asking for payment'],0,'This is a valuation risk, not existence. A small balance can still matter if it is unlikely to be paid, and several like it could add up.'),
 fixed({type:'written',prompt:'<p><b>Write your summary email to Sam.</b></p><p class="hint">Keep it short and factual: what you tested, what you found, the amounts, and what you need next.</p>',model:`Hi Sam,<br><br>I’ve finished the first pass on receivables. I tested the five balances over £15,000, which total £186,550 (45.2% of the £412,600 balance). Brewline, Greenleaf and Cornerstone were cleared in full by cash received after the year end.<br><br><b>Exceptions:</b><br>1. <b>Parkside, INV-2291, £20,000.</b> Invoiced on 28 March, but the despatch note shows the goods left on 2 April, and it hasn’t been paid. Revenue and receivables are overstated by £20,000, which is above performance materiality. Proposed adjustment: Dr Sales £20,000, Cr Trade receivables £20,000.<br>2. <b>INV-2290, £7,400.</b> Goods sent on 31 March but recorded next year, so revenue is understated by £7,400. Net effect of the cut-off errors: revenue overstated by £12,600.<br>3. <b>Northgate, £6,750.</b> Held back because of damaged goods. I’d like to see the correspondence and ask whether a credit note or allowance is needed.<br>4. <b>The Daily Grind, £8,150.</b> All over 90 days. I’ll ask management about recoverability.<br><br>Next steps: discuss items 1 and 2 with the finance manager, and pick up the sample of smaller balances. Let me know if you’d like me to do anything differently.<br><br>Thanks`,points:['States what was tested and the coverage (£186,550, 45.2%)','Explains the INV-2291 overstatement of £20,000 and that it is above performance materiality','Includes the proposed adjustment','Mentions the INV-2290 understatement of £7,400','Raises the Northgate dispute and The Daily Grind recoverability','Gives clear next steps']})
]});

/* ---------- Simulation 2: inventory count ---------- */
TOPICS.push({id:'jobcount',level:'job',title:'Audit: inventory count',blurb:'Attend the year-end stock count: test counts both ways, check goods coming in, and review slow-moving stock.',
lesson:`<p>Same client, <b>Harbour &amp; Hale Coffee Roasters Ltd</b>. It is <b>31 March 2026</b>, and you are at the client’s warehouse to attend the year-end stock count.</p>
${emailBox('Sam (Audit Senior)','You','Stock count tomorrow',`<p>Hi,</p><p>You’re at the Harbour &amp; Hale count tomorrow at 2pm. Please:</p><ol><li>Watch how the count is run and note anything that isn’t controlled properly.</li><li>Do test counts both ways: from the count sheets to the floor, and from the floor to the sheets.</li><li>Note the last goods received before the count, so we can check cut-off.</li><li>Look out for damaged or slow-moving stock.</li></ol><p>Take photos of the final count sheets before you leave. Thanks, Sam</p>`)}
${docH('Document 1: Your test counts')}
${sTable(['Direction','Item','Description','Count sheet','Your count','Cost per unit £'],[['Sheet → floor','C-101','Colombian beans 1kg','420','420','10.20'],['Sheet → floor','C-114','Ethiopian beans 1kg','260','236','11.50'],['Sheet → floor','E-220','Espresso blend 500g','900','900','5.20'],['Sheet → floor','M-305','Paper cups, box of 1,000','75','75','24.00'],['Floor → sheet','G-410','Grinder spare blades','not listed','40','9.00'],['Floor → sheet','D-512','Decaf beans 1kg','150','150','10.80']],[3,4,5])}
${docH('Document 2: Your notes from the count')}
<ul><li>Counters worked in pairs and wrote on pre-numbered count sheets.</li><li>The warehouse supervisor, who is responsible for the stock, counted aisle 4 alone, and nobody checked her count.</li><li>At 5:30pm a delivery of <b>200 bags of C-101</b> (goods received note GRN-889) arrived and was left in the loading bay. It wasn’t counted. The finance team says the supplier’s invoice has been recorded in March’s payables.</li><li>There are <b>1,200 seasonal gift tins</b> on a back shelf. They cost £6.00 each. The sales team says they now sell for £4.50, with £0.50 of selling costs per tin.</li></ul>`,
example:`<ul>
<li><b>Two directions, two assertions.</b> Sheet to floor tests existence: is the stock on the sheets really there? Floor to sheet tests completeness: is everything on the floor on the sheets?</li>
<li><b>Value every difference.</b> A difference in units means little to a reviewer. Quantity × cost does.</li>
<li><b>Cut-off at a count</b> means the stock and the paperwork must match. If an invoice is recorded as a liability, the goods must be in the count, and the other way round.</li>
<li><b>Controls matter as well as numbers.</b> If the count isn’t well controlled, the auditor can’t rely on it and has to do more work. Watch for people counting their own stock without checks, sheets that aren’t numbered, and goods moving during the count.</li>
<li><b>Slow-moving stock:</b> compare cost with net realisable value (selling price minus selling costs) and write down to whichever is lower (IAS 2).</li>
</ul>`,
practice:[
 fixed({type:'classify',prompt:'<p>For each test count in Document 1, does the count sheet agree with your count?</p>',options:['Agrees','Difference'],items:[['C-101 Colombian beans (sheet → floor)','Agrees'],['C-114 Ethiopian beans (sheet → floor)','Difference'],['E-220 Espresso blend (sheet → floor)','Agrees'],['M-305 Paper cups (sheet → floor)','Agrees'],['G-410 Grinder blades (floor → sheet)','Difference'],['D-512 Decaf beans (floor → sheet)','Agrees']].map(([l,a])=>({label:l,answer:a})),explain:'C-114 has 24 fewer bags on the floor than on the sheet, an existence problem. G-410 is on the floor but missing from the sheets, a completeness problem.'}),
 fixed({type:'fields',prompt:'<p>Value the two differences at cost.</p>',fields:[{label:'C-114: inventory overstated by (£)',answer:276},{label:'G-410: inventory understated by (£)',answer:360}],explain:'C-114: (260 − 236) × £11.50 = £276 too much on the sheets. G-410: 40 × £9.00 = £360 missing from the sheets. Both are small, but differences in a sample can point to wider problems, so they are recorded and discussed with the client.'}),
 mcqFixed('Which of your notes is a weakness in how the count was controlled?',['The warehouse supervisor counted aisle 4 alone, with no independent check','Counters worked in pairs','The count sheets were pre-numbered','Damaged stock was set aside'],0,'The person responsible for the stock shouldn’t count it without an independent check, because a shortage could be hidden. The auditor would do extra test counts in aisle 4.'),
 mcqFixed('The 200 bags from GRN-889 weren’t counted, but their invoice is in March’s payables. What is the problem?',['Inventory is understated, because the liability is recorded but the stock isn’t','Payables are overstated, so the invoice should be removed','There is no problem, because the goods arrived after 5pm','Revenue is overstated'],0,'The goods arrived on 31 March and the business owes for them, so they belong in this year’s inventory. Leaving them out understates inventory, and therefore profit.'),
 fixed({type:'fields',prompt:'<p>Value the goods from GRN-889 that were left out of the count.</p>',fields:[{label:'Inventory understated by (£)',answer:2040}],explain:'200 bags × £10.20 = £2,040. Propose adding them to inventory.'}),
 fixed({type:'fields',prompt:'<p>Apply IAS 2 to the 1,200 gift tins.</p>',fields:[{label:'Net realisable value per tin (£)',answer:4,display:'4.00'},{label:'Write-down needed (£)',answer:2400}],explain:'NRV = £4.50 − £0.50 = £4.00, which is below the £6.00 cost. Write down by £2.00 × 1,200 = £2,400, so the tins are valued at £4,800 instead of £7,200.'}),
 fixed({type:'written',prompt:'<p><b>Write the key findings section of your count memo for the audit file.</b></p>',model:`<b>Stock count attendance, Harbour &amp; Hale, 31 March 2026.</b><br><br><b>Controls:</b> The count was generally well organised: counters worked in pairs on pre-numbered sheets. However, the warehouse supervisor counted aisle 4 alone with no independent check. Extra test counts should be done on aisle 4.<br><br><b>Test counts:</b> 6 items tested. C-114 was 24 units short of the sheet (£276 overstated). G-410 blades (40 units, £360) were on the floor but missing from the sheets.<br><br><b>Cut-off:</b> GRN-889 (200 bags of C-101, £2,040) was received at 5:30pm on 31 March and not counted, although the invoice is recorded in March payables. Inventory is understated by £2,040.<br><br><b>Valuation:</b> 1,200 gift tins cost £6.00 but have an NRV of £4.00. A write-down of £2,400 is needed.<br><br><b>Conclusion:</b> Subject to the matters above, the count can be relied on. All the errors will go on the schedule of misstatements.`,points:['Comments on the count controls, including the aisle 4 weakness','Reports both test count differences with values','Explains the GRN-889 cut-off issue and the £2,040','Includes the £2,400 NRV write-down','Gives an overall conclusion on whether the count can be relied on']})
]});

/* ---------- Simulation 3: month-end close ---------- */
const CLOSE_ACCTS=ACCTS.concat(['Software subscriptions','Staff costs','Marketing']);
TOPICS.push({id:'jobclose',level:'job',title:'Finance team: month-end close',blurb:'Close the October books at a gym chain: accruals, prepayments, the bank rec and budget variance commentary.',
lesson:`<p>You are a trainee in the finance team at <b>Northwell Fitness Ltd</b>, a small chain of gyms (a fictional company). It is the first working day of November and you are closing the <b>October</b> management accounts.</p>
${emailBox('Jordan (Finance Manager)','You','October close',`<p>Morning,</p><p>Can you take the October close this month? I need:</p><ol><li>The month-end accruals and prepayments posted.</li><li>The main bank account reconciled.</li><li>Variances against budget, with a short commentary I can send to the finance director.</li></ol><p>The FD wants the pack by Wednesday. Thanks, Jordan</p>`)}
${docH('Document 1: Items to review for October')}
${sTable(['Item','Detail'],[['Software subscription','£3,600 paid on 1 October for 12 months. The whole amount was posted to Software subscriptions.'],['Electricity','October bill not yet received. The supplier estimates £1,450.'],['Cleaning','October invoice for £820 received and posted in October.'],['Trade show','£2,400 paid in October for a stand at an event next April. Posted to Marketing.'],['Staff overtime','£1,900 of overtime worked in the last week of October, to be paid in November’s payroll.'],['Stationery','£140 bought and paid for in October.']])}
${docH('Document 2: Bank, 31 October')}
${sTable(['Item','£'],[['Cash book balance (before adjustments)','22,480'],['Bank charges on the statement, not in the cash book','35'],['Card processing fees taken by direct debit, not in the cash book','410'],['BACS receipt from a corporate client, not in the cash book','1,200'],['Supplier payments made on 31 October, not yet on the statement','2,850'],['Cash paid in on 31 October, not yet on the statement','1,300'],['Balance per bank statement','24,785']],[1])}
${docH('Document 3: October actual against budget (after your adjustments)')}
${sTable(['Line','Budget £','Actual £'],[['Membership income','84,000','79,200'],['Personal training income','12,000','14,600'],['Staff costs','41,000','43,900'],['Rent','15,000','15,000'],['Utilities','4,500','6,050'],['Marketing','3,000','1,200']],[1,2])}`,
example:`<ul>
<li><b>For each item, ask: which month does this cost belong to?</b> If it belongs to October but hasn’t been posted, accrue it. If it has been posted but belongs to later months, move it to prepayments.</li>
<li><b>Accruals are often estimates.</b> Use the best information you have, such as a supplier estimate or last month’s bill, and note what you based it on.</li>
<li><b>Bank rec first, then the rest.</b> Items on the statement but not in the cash book are posted. Timing differences are only listed on the reconciliation.</li>
<li><b>Variance commentary explains, it doesn’t just repeat.</b> “Staff costs are £2,900 over budget” repeats the table. “Staff costs are £2,900 over budget, mainly because of £1,900 of overtime covering staff absence” explains it. If you don’t know the reason yet, say what you will check.</li>
<li><b>Favourable or adverse?</b> Income above budget or costs below budget is favourable. Income below budget or costs above budget is adverse.</li>
</ul>`,
practice:[
 fixed({type:'classify',prompt:'<p>Decide the month-end treatment for each item in Document 1.</p>',options:['Accrual','Prepayment','No adjustment'],items:[['Software subscription, £3,600 for 12 months','Prepayment'],['October electricity, estimated £1,450','Accrual'],['October cleaning, £820 already posted','No adjustment'],['Trade show stand next April, £2,400','Prepayment'],['October overtime paid in November, £1,900','Accrual'],['Stationery, £140 bought and paid in October','No adjustment']].map(([l,a])=>({label:l,answer:a})),explain:'Costs that belong to October but haven’t been posted are accrued (electricity, overtime). Costs that have been posted but belong to later months are prepaid (software, trade show). Everything else is already right.'}),
 fixed({type:'journal',prompt:'<p>Post the prepayment for the software subscription. One month of the £3,600 annual cost belongs to October.</p>',accounts:CLOSE_ACCTS,answer:[['Prepayments',3300,0],['Software subscriptions',0,3300]],explain:'October’s share is £3,600 ÷ 12 = £300. The other 11 months, £3,300, are moved out of the expense and into prepayments.'}),
 fixed({type:'journal',prompt:'<p>Post the accrual for October’s estimated electricity.</p>',accounts:CLOSE_ACCTS,answer:[['Electricity',1450,0],['Accruals',0,1450]],explain:'The cost belongs to October, so it is charged now, and the amount owed is shown as an accrual. When the real bill arrives, any difference goes into November.'}),
 fixed({type:'journal',prompt:'<p>Post the accrual for the October overtime.</p>',accounts:CLOSE_ACCTS,answer:[['Staff costs',1900,0],['Accruals',0,1900]],explain:'The overtime was worked in October, so it is October’s cost even though it is paid in November.'}),
 fixed({type:'fields',prompt:'<p>Reconcile the bank using Document 2.</p>',fields:[{label:'Updated cash book balance (£)',answer:23235},{label:'Statement balance + lodgement − unpresented payments (£)',answer:23235}],explain:'Cash book: 22,480 − 35 − 410 + 1,200 = £23,235. Bank: 24,785 + 1,300 − 2,850 = £23,235. The two agree, so the bank is reconciled.'}),
 fixed({type:'classify',prompt:'<p>Is each variance in Document 3 favourable or adverse?</p>',options:['Favourable','Adverse','No variance'],items:[['Membership income (£79,200 against £84,000)','Adverse'],['Personal training income (£14,600 against £12,000)','Favourable'],['Staff costs (£43,900 against £41,000)','Adverse'],['Rent (£15,000 against £15,000)','No variance'],['Utilities (£6,050 against £4,500)','Adverse'],['Marketing (£1,200 against £3,000)','Favourable']].map(([l,a])=>({label:l,answer:a})),explain:'Income above budget and costs below budget are favourable. Income below budget and costs above budget are adverse.'}),
 fixed({type:'fields',prompt:'<p>Work out October’s profit against budget. Enter the variance as a negative number or in brackets if it is adverse.</p>',fields:[{label:'Budgeted profit (£)',answer:32500},{label:'Actual profit (£)',answer:27650},{label:'Profit variance (£)',answer:-4850,display:'(4,850)'}],explain:'Budget: 96,000 income − 63,500 costs = £32,500. Actual: 93,800 − 66,150 = £27,650. That is £4,850 adverse: membership −4,800, personal training +2,600, staff −2,900, utilities −1,550, marketing +1,800.'}),
 fixed({type:'written',prompt:'<p><b>Write the variance commentary for the finance director.</b></p><p class="hint">Lead with the headline number, explain the biggest variances, and say what you are checking where you don’t know the cause yet.</p>',model:`<b>October results.</b> Profit was <b>£27,650</b> against a budget of £32,500, <b>£4,850 adverse</b>.<br><br><b>Income:</b> Membership income was £4,800 below budget. I’m checking member numbers and cancellations for October to see whether this is fewer joiners or more leavers. Personal training was £2,600 ahead of budget, which partly offsets this.<br><br><b>Costs:</b> Staff costs were £2,900 over budget, of which £1,900 is overtime worked in the last week of October. Utilities were £1,550 over. This includes an estimated £1,450 electricity accrual, which I’ll update when the bill arrives. Marketing was £1,800 under budget; I’m checking whether this is a timing difference, such as a campaign moved to November.<br><br><b>Adjustments made:</b> prepayments of £3,300 (software) and £2,400 (trade show), and accruals of £1,450 (electricity) and £1,900 (overtime). The bank is reconciled to £23,235.`,points:['Opens with actual profit, budget and the £4,850 adverse variance','Explains the membership shortfall and says what is being checked','Links the staff cost overrun to the overtime accrual','Notes that the electricity figure is an estimate','Asks whether the marketing underspend is timing','Lists the adjustments and the bank reconciliation']})
]});

/* ---------- Simulation 4: tax ---------- */
const TAX_ACCTS=ACCTS.concat(['Income tax expense','Corporation tax payable','VAT control']);
TOPICS.push({id:'jobtax',level:'job',title:'Tax: VAT return and corporation tax',blurb:'Prepare a client’s quarterly VAT return and draft its corporation tax computation.',
lesson:`<p>You are a trainee in a tax team. The client is <b>Brightwater Joinery Ltd</b>, a company that makes and fits kitchens (a fictional company). It is VAT-registered and its accounting year ends on <b>31 March 2026</b>.</p>
${emailBox('Priya (Tax Senior)','You','Brightwater: VAT return and CT computation',`<p>Hi,</p><p>Two jobs for Brightwater, please:</p><ol><li>Prepare the VAT return for the quarter to 30 June 2026 from the summary the client sent (Document 1).</li><li>Draft the corporation tax computation for the year to 31 March 2026 (Document 2). Profits are well above £250,000, so use the 25% main rate.</li></ol><p>Please send me a short note for the client once you’re done. Thanks, Priya</p>`)}
${docH('Document 1: Client’s VAT summary, quarter to 30 June 2026 (all figures exclude VAT)')}
${sTable(['Item','Net £','VAT treatment'],[['Kitchen sales to UK customers','186,400','Standard rate (20%)'],['Kitchens exported to a customer outside the UK','22,000','Zero rate (0%)'],['Timber, fittings and tools bought from UK suppliers','74,500','Standard rate (20%)'],['Business insurance','3,200','Exempt (no VAT charged)'],['Entertaining UK clients at a restaurant','1,800','Standard rate, but input VAT can’t be reclaimed']],[1])}
${docH('Document 2: Extracts from the accounts, year to 31 March 2026')}
${sTable(['Item','£'],[['Profit before tax','412,000'],['Depreciation charged','38,000'],['Entertaining UK clients','6,500'],['Staff Christmas party (all staff invited)','2,400'],['Parking fine for a company van','400'],['New machinery bought (qualifies for the annual investment allowance)','55,000']],[1])}
<div class="note"><b>Rates used.</b> This simulation uses UK rates as they stood in 2025/26: a 20% standard VAT rate and a 25% corporation tax main rate. Rates and allowances can change in each Budget, so always check the current figures on GOV.UK.</div>`,
example:`<ul>
<li><b>VAT: sort every item first.</b> Standard-rated, zero-rated, exempt, or blocked (VAT paid that can’t be reclaimed). Zero-rated and exempt items both have no VAT, but they still go in the sales or purchases totals (boxes 6 and 7).</li>
<li><b>The VAT return boxes you’ll use most:</b> Box 1 VAT due on sales, Box 3 total VAT due, Box 4 VAT reclaimed on purchases, Box 5 net VAT to pay (or reclaim), Box 6 total sales excluding VAT, Box 7 total purchases excluding VAT.</li>
<li><b>Corporation tax starts from accounting profit</b>, then adjusts it to taxable profit. Add back costs the tax rules don’t allow (depreciation, client entertaining, fines). Deduct the tax version of depreciation instead: capital allowances.</li>
<li><b>Staff entertaining is usually allowable</b>, but client entertaining isn’t. This catches a lot of people out.</li>
<li><b>Show your workings line by line</b>, so your senior can review the computation quickly.</li>
</ul>`,
practice:[
 fixed({type:'classify',prompt:'<p>Sort each item in Document 1 by its VAT treatment.</p>',options:['Standard rate','Zero rate','Exempt','Can’t reclaim'],items:[['Kitchen sales to UK customers','Standard rate'],['Kitchens exported outside the UK','Zero rate'],['Timber, fittings and tools','Standard rate'],['Business insurance','Exempt'],['Entertaining UK clients','Can’t reclaim']].map(([l,a])=>({label:l,answer:a})),explain:'Exports of goods outside the UK are zero-rated. Insurance is exempt. VAT on entertaining UK clients is blocked, so it can’t be reclaimed even though VAT was charged.'}),
 fixed({type:'fields',prompt:'<p>Complete the VAT return for the quarter to 30 June 2026.</p>',fields:[{label:'Box 1: VAT due on sales (£)',answer:37280},{label:'Box 3: Total VAT due (£)',answer:37280},{label:'Box 4: VAT reclaimed on purchases (£)',answer:14900},{label:'Box 5: Net VAT to pay HMRC (£)',answer:22380},{label:'Box 6: Total sales excluding VAT (£)',answer:208400},{label:'Box 7: Total purchases excluding VAT (£)',answer:79500}],explain:'Box 1: 186,400 × 20% = 37,280 (exports are zero-rated). Box 3 is the same, as there is nothing in Box 2. Box 4: 74,500 × 20% = 14,900. The entertaining VAT is blocked and insurance has none. Box 5: 37,280 − 14,900 = 22,380. Box 6: 186,400 + 22,000 = 208,400. Box 7 includes every purchase excluding VAT: 74,500 + 3,200 + 1,800 = 79,500.'}),
 fixed({type:'classify',prompt:'<p>For the corporation tax computation, how is each item in Document 2 treated?</p>',options:['Add back','No adjustment','Deduct'],items:[['Depreciation, £38,000','Add back'],['Entertaining UK clients, £6,500','Add back'],['Staff Christmas party, £2,400','No adjustment'],['Parking fine, £400','Add back'],['Annual investment allowance on new machinery, £55,000','Deduct']].map(([l,a])=>({label:l,answer:a})),explain:'Depreciation isn’t allowed for tax, so it is replaced by capital allowances. Client entertaining and fines are disallowed, so they are added back. A staff party open to all staff is allowable, so it needs no adjustment.'}),
 fixed({type:'fields',prompt:'<p>Complete the corporation tax computation for the year to 31 March 2026.</p>',fields:[{label:'Total additions to profit (£)',answer:44900},{label:'Taxable total profits (£)',answer:401900},{label:'Corporation tax at 25% (£)',answer:100475}],explain:'Additions: 38,000 + 6,500 + 400 = 44,900. Taxable profits: 412,000 + 44,900 − 55,000 = 401,900. Tax: 401,900 × 25% = 100,475.'}),
 fixed({type:'journal',prompt:'<p>Write the journal to record the corporation tax charge in the accounts.</p>',accounts:TAX_ACCTS,answer:[['Income tax expense',100475,0],['Corporation tax payable',0,100475]],explain:'The tax is an expense in the statement of profit or loss. It hasn’t been paid yet, so it is a current liability.'}),
 mcqFixed('Why is depreciation added back in a corporation tax computation?',['The tax rules don’t allow depreciation, and give capital allowances instead','Because depreciation is always wrong','Because it is a cash payment','Because it is paid to HMRC'],0,'Each company chooses its own depreciation policy, so the tax system uses its own standard rules (capital allowances).'),
 fixed({type:'written',prompt:'<p><b>Write a short note to the client explaining the results.</b></p><p class="hint">The client isn’t an accountant, so keep it plain. Include the amounts and anything they should know.</p>',model:`Dear Brightwater,<br><br><b>VAT return, quarter to 30 June 2026.</b> The amount to pay HMRC is <b>£22,380</b>. This is the £37,280 VAT on your UK sales, less the £14,900 VAT you paid on materials and tools. The kitchen you exported has no VAT because exports are zero-rated. Please note that VAT on entertaining clients can’t be reclaimed, so we have left it out.<br><br><b>Corporation tax, year to 31 March 2026.</b> Your taxable profit is <b>£401,900</b> and the tax due is <b>£100,475</b>. Your accounting profit was £412,000. We added back depreciation, client entertaining and a parking fine, which tax rules don’t allow, and deducted £55,000 for the new machinery, which qualifies for the annual investment allowance.<br><br>We’ll confirm the payment deadlines separately. Please let us know if you have any questions.`,points:['States the VAT payable of £22,380 and how it is made up','Explains that exports are zero-rated','Explains that VAT on client entertaining can’t be reclaimed','States taxable profit of £401,900 and tax of £100,475','Explains the add-backs and the machinery allowance in plain English','Uses language a non-accountant would understand']})
]});

/* ---------- Simulation 5: going concern ---------- */
TOPICS.push({id:'jobgc',level:'job',title:'Audit: going concern review',blurb:'Review a client’s cash flow forecast and loan covenant, spot the warning signs, and brief your manager.',
lesson:`<p>You are on the audit of <b>Tidewell Events Ltd</b>, a company that runs conferences and exhibitions (a fictional company). The year end is <b>30 September 2026</b>. The directors must assess whether the company can keep trading for at least the next 12 months, and the auditor reviews that assessment.</p>
${emailBox('Alex (Audit Manager)','You','Tidewell: going concern',`<p>Hi,</p><p>Management has sent its cash flow forecast and says there is no going concern problem. Can you review it before I speak to the finance director on Friday?</p><ol><li>Check the forecast against the overdraft limit.</li><li>Recalculate the loan covenant.</li><li>List any warning signs you see.</li><li>Send me a short summary.</li></ol><p>Thanks, Alex</p>`)}
${docH('Document 1: Management’s monthly cash flow forecast (£000)')}
${sTable(['Month','Oct','Nov','Dec','Jan','Feb','Mar'],[['Net cash flow','(30)','(45)','(20)','(55)','10','35']],[1,2,3,4,5,6])}
<p>Opening balance at 1 October: <b>£40,000 overdrawn</b>. The bank overdraft limit is <b>£150,000</b>.</p>
${docH('Document 2: Other information')}
<ul><li>The company has a bank loan. Its terms require <b>interest cover of at least 3 times</b> (operating profit ÷ interest).</li><li>The forecast for next year shows operating profit of <b>£420,000</b> and interest of <b>£160,000</b>.</li><li>The overdraft facility is due for renewal in June 2027. The bank hasn’t confirmed it will renew.</li><li>The company’s largest customer, which provides 30% of revenue, has said it will not renew its contract when it ends in March 2027.</li><li>The company bought £12,000 of new office furniture in September.</li><li>The budget includes a 3% pay rise for staff from January.</li></ul>`,
example:`<ul>
<li><b>Don’t accept the forecast at face value.</b> Build the running cash balance month by month yourself, and compare it with the facility available.</li>
<li><b>Covenants matter as much as cash.</b> If a covenant is breached, the bank may be able to demand repayment of the loan, even if the company still has cash.</li>
<li><b>Look for events, not just numbers:</b> losing a major customer, facilities up for renewal, legal claims, key staff leaving.</li>
<li><b>Challenge the assumptions.</b> Is the recovery in February and March realistic? Does the forecast already assume the lost contract’s income?</li>
<li><b>The outcome is about disclosure.</b> If there is a material uncertainty, the directors must disclose it clearly. The auditor then includes a “Material uncertainty related to going concern” section in the report. If the directors won’t disclose it, the opinion is modified.</li>
</ul>`,
practice:[
 fixed({type:'fields',prompt:'<p>Build the running cash balance from Document 1. Enter overdrawn balances as negative numbers or in brackets (in £).</p>',fields:[{label:'Balance at the end of October',answer:-70000,display:'(70,000)'},{label:'Balance at the end of December',answer:-135000,display:'(135,000)'},{label:'Lowest balance in the six months',answer:-190000,display:'(190,000)'},{label:'Amount by which the lowest balance exceeds the £150,000 limit',answer:40000}],explain:'−40 − 30 = −70 (Oct); −115 (Nov); −135 (Dec); −190 (Jan); −180 (Feb); −145 (Mar). The lowest point is £190,000 overdrawn in January, which is £40,000 over the £150,000 limit.'}),
 fixed({type:'fields',prompt:'<p>Recalculate the loan covenant using Document 2.</p>',fields:[{label:'Forecast interest cover (times, 2 decimal places)',answer:2.63,tol:0.011,display:'2.63'}],explain:'420,000 ÷ 160,000 = 2.63 times, which is below the required 3 times. The covenant is forecast to be breached.'}),
 fixed({type:'classify',prompt:'<p>Which items are warning signs for going concern?</p>',options:['Warning sign','Not a warning sign'],items:[['The forecast goes £40,000 over the overdraft limit in January','Warning sign'],['Interest cover is forecast below the 3 times covenant','Warning sign'],['The overdraft is up for renewal and the bank hasn’t confirmed','Warning sign'],['The largest customer (30% of revenue) is leaving in March 2027','Warning sign'],['£12,000 of new office furniture was bought','Not a warning sign'],['A 3% staff pay rise is budgeted','Not a warning sign']].map(([l,a])=>({label:l,answer:a})),explain:'The first four each threaten the company’s ability to pay its debts over the next 12 months. The furniture and the pay rise are normal business costs that are already in the forecast.'}),
 mcqFixed('Management agrees there is a material uncertainty and discloses it fully in the accounts. What does the audit report include?',['An unmodified opinion with a “Material uncertainty related to going concern” section','An adverse opinion','A disclaimer of opinion','Nothing extra, because the accounts are correct'],0,'Adequate disclosure means the accounts aren’t misstated, so the opinion is unmodified. The separate section draws readers’ attention to the uncertainty.'),
 mcqFixed('Which of these is the best evidence to ask for next?',['Written confirmation from the bank about renewing the overdraft and any covenant waiver','A letter from the directors saying they are confident','Last year’s audited accounts','The staff rota for January'],0,'The bank’s position is the key uncertainty, and evidence from a third party is stronger than management’s own view.'),
 fixed({type:'written',prompt:'<p><b>Write your summary to Alex.</b></p>',model:`Hi Alex,<br><br>I’ve reviewed Tidewell’s going concern forecast. I don’t think we can accept management’s view that there is no issue yet.<br><br>1. <b>Overdraft limit:</b> Starting £40,000 overdrawn, the forecast reaches £190,000 overdrawn in January, which is £40,000 over the £150,000 limit.<br>2. <b>Covenant:</b> Forecast interest cover is 2.63 times (£420,000 ÷ £160,000), below the 3 times required, so the bank could demand repayment.<br>3. <b>Facility renewal:</b> The overdraft is due for renewal in June 2027 and the bank hasn’t confirmed.<br>4. <b>Customer loss:</b> The largest customer, 30% of revenue, leaves in March 2027. I need to check whether the forecast already reflects this.<br><br><b>Suggested next steps:</b> ask for the bank’s written position on renewal and a covenant waiver, see management’s plans for covering the January shortfall, and test the forecast assumptions. If the uncertainty remains, the accounts will need clear disclosure, and our report would include a material uncertainty section.<br><br>Thanks`,points:['Gives the lowest balance (£190,000 overdrawn) and the £40,000 shortfall','Shows the covenant calculation of 2.63 times against the 3 times required','Mentions the unconfirmed facility renewal','Mentions the loss of the 30% customer and questions the forecast','Suggests evidence to get next, especially from the bank','Explains the possible effect on disclosure and the audit report']})
]});

/* ---------- Excel skills ---------- */
function xlGrid(headers,rows){const L='ABCDEFG';return `<div class="scroll"><table class="xl"><thead><tr><th class="rn"></th>${headers.map((h,i)=>`<th>${L[i]}</th>`).join('')}</tr></thead><tbody><tr><td class="rn">1</td>${headers.map(h=>`<td><b>${h}</b></td>`).join('')}</tr>${rows.map((r,k)=>`<tr><td class="rn">${k+2}</td>${r.map(c=>`<td class="${typeof c==='number'?'n':''}">${typeof c==='number'?fmt(c):c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
const XL_CUST=['Brewline','Northgate','Greenleaf','Parkside','Cornerstone','Olive &amp; Oak'];
function xlData(n){const out=[];for(let i=0;i<n;i++)out.push(['INV-'+(1001+i),pick(XL_CUST),pick(['North','South','East']),rint(4,160)*50,pick(['Paid','Unpaid'])]);return out;}
TOPICS.push({id:'excel',level:'ind',title:'Excel skills',blurb:'The formulas and habits finance teams use every day: SUMIFS, lookups, IF, pivot tables and checks.',
lesson:`<div class="note" id="xl-note"><b>Practice workbook.</b> This page comes with an Excel file, <b>Ledger-Lab-Excel-Practice.xlsx</b>, with six sheets of tasks that check your formulas as you type them. <a id="xl-dl" href="Ledger-Lab-Excel-Practice.xlsx" hidden>Download the workbook</a></div>
<p>Almost every finance job, from audit and tax to finance teams, is done in Excel. You don’t need to be an expert on day one, but you should be able to total, look up and flag data with formulas, and check your own work.</p>
<h3>The functions you’ll use most</h3>
${sTable(['Function','What it does','Finance example'],[
['<code>SUM</code>, <code>ROUND</code>','Adds a range; rounds to a set number of decimal places','<code>=ROUND(SUM(E2:E50),2)</code> totals invoices to the penny'],
['<code>IF</code>','Returns one result if a test is true, another if not','<code>=IF(E2&gt;5000,"Review","OK")</code> flags large invoices'],
['<code>SUMIFS</code>','Adds values that meet one or more conditions','<code>=SUMIFS(E:E,C:C,"North",F:F,"Unpaid")</code> gives unpaid North sales'],
['<code>COUNTIFS</code>','Counts rows that meet conditions','<code>=COUNTIFS(F:F,"Unpaid")</code> gives the number of unpaid invoices'],
['<code>AVERAGEIFS</code>','Averages values that meet conditions','Average invoice value for one region'],
['<code>XLOOKUP</code>','Finds a value in one column and returns the matching value from another','<code>=XLOOKUP("INV-1006",A:A,E:E)</code> gives that invoice’s amount'],
['<code>INDEX</code> + <code>MATCH</code>','The older lookup that works in every version of Excel','<code>=INDEX(E:E,MATCH("INV-1006",A:A,0))</code>'],
['<code>IFERROR</code>','Shows something tidy instead of an error','<code>=IFERROR(XLOOKUP(…),"Not found")</code>'],
['<code>EOMONTH</code>','Gives the last day of a month','<code>=EOMONTH(B2,0)</code> gives the month end for a date']])}
<div class="note"><b>XLOOKUP or VLOOKUP?</b> XLOOKUP is in Excel 365 and 2021 and is easier to use. Many firms still have older files full of VLOOKUP and INDEX/MATCH, so learn to read them too.</div>
<h3>Absolute references</h3>
<p>When you copy a formula down, its cell references move with it. Put a <code>$</code> in front of the column or row to stop it moving. <code>=E2*$H$1</code> copied down becomes <code>=E3*$H$1</code>, so every row uses the VAT rate in H1. Press <b>F4</b> to add the <code>$</code> signs.</p>
<h3>Pivot tables</h3>
<ol><li>Click anywhere in your data and choose <b>Insert → PivotTable</b>.</li><li>Drag a field into <b>Rows</b> (for example Region), and one into <b>Columns</b> if you want (Status).</li><li>Drag the numbers into <b>Values</b> (Sum of Amount).</li><li>Right-click and choose <b>Refresh</b> when the data changes.</li></ol>
<h3>Habits reviewers look for</h3>
<ul><li><b>No hardcoded numbers inside formulas.</b> Put the VAT rate or the threshold in its own labelled cell and refer to it.</li><li><b>Cross-cast.</b> Check that row totals and column totals agree.</li><li><b>Tie out</b> to the source, such as the trial balance or bank statement, and note where each number came from.</li><li><b>Keep formulas the same all the way down a column.</b> One edited cell in the middle is a common hidden error.</li></ul>
<h3>Shortcuts worth learning</h3>
${sTable(['Shortcut','What it does'],[['Ctrl + Arrow key','Jump to the end of the data'],['Ctrl + Shift + Arrow key','Select to the end of the data'],['Alt + =','AutoSum'],['F4','Add or change $ signs in a reference'],['Ctrl + Shift + L','Turn filters on or off'],['Ctrl + T','Turn a range into a table']])}`,
example:`<p>An invoice listing, with some formulas you might write next to it:</p>
${xlGrid(['Invoice','Customer','Region','Amount £','Status'],[['INV-1001','Brewline','North',4200,'Paid'],['INV-1002','Parkside','South',7800,'Unpaid'],['INV-1003','Brewline','North',6100,'Unpaid'],['INV-1004','Greenleaf','East',2350,'Paid'],['INV-1005','Parkside','South',3900,'Unpaid']])}
${sTable(['Formula','Result','What it tells you'],[['<code>=SUMIFS(D2:D6,C2:C6,"North")</code>','10,300','Total sales in the North'],['<code>=COUNTIFS(E2:E6,"Unpaid")</code>','3','Number of unpaid invoices'],['<code>=SUMIFS(D2:D6,B2:B6,"Parkside",E2:E6,"Unpaid")</code>','11,700','What Parkside still owes'],['<code>=XLOOKUP("INV-1003",A2:A6,D2:D6)</code>','6,100','The amount of one invoice'],['<code>=IF(AND(D3&gt;5000,E3="Unpaid"),"Review","OK")</code>','Review','Flags large unpaid invoices']])}`,
practice:[
 gen(()=>{const d=xlData(6);const s=(f)=>d.filter(f).reduce((t,r)=>t+r[3],0);const reg=pick(['North','South','East']),reg2=pick(['North','South','East']);return {type:'fields',prompt:`<p>Work out what each formula returns for this data.</p>${xlGrid(['Invoice','Customer','Region','Amount £','Status'],d)}`,fields:[{label:`<code>=SUMIFS(D2:D7,C2:C7,"${reg}")</code>`,answer:s(r=>r[2]===reg)},{label:'<code>=COUNTIFS(E2:E7,"Unpaid")</code>',answer:d.filter(r=>r[4]==='Unpaid').length},{label:`<code>=SUMIFS(D2:D7,C2:C7,"${reg2}",E2:E7,"Unpaid")</code>`,answer:s(r=>r[2]===reg2&&r[4]==='Unpaid')}],explain:'SUMIFS adds the amounts in D only for rows where every condition is true. COUNTIFS counts those rows instead of adding them. If no rows match, the answer is 0.'};}),
 gen(()=>{const d=xlData(6);const k=rint(0,5);const inv=d[k][0];return {type:'fields',prompt:`<p>Work out what each lookup returns.</p>${xlGrid(['Invoice','Customer','Region','Amount £','Status'],d)}`,fields:[{label:`<code>=XLOOKUP("${inv}",A2:A7,D2:D7)</code>`,answer:d[k][3]},{label:`<code>=INDEX(D2:D7,MATCH("${inv}",A2:A7,0))</code>`,answer:d[k][3]},{label:`<code>=MATCH("${inv}",A2:A7,0)</code> (the position in the list)`,answer:k+1}],explain:`${inv} is item ${k+1} in A2:A7, so both lookups return the amount on that row, £${fmt(d[k][3])}. MATCH gives the position, and INDEX uses the position to pick the value.`};}),
 gen(()=>{const rows=Array.from({length:6},()=>{const a=rint(10,200)*50,st=pick(['Paid','Unpaid']);return {label:`Amount £${fmt(a)}, status ${st}`,answer:a>5000&&st==='Unpaid'?'Review':'OK'};});return {type:'classify',prompt:'<p>What does <code>=IF(AND(D2&gt;5000,E2="Unpaid"),"Review","OK")</code> return for each row?</p>',options:['Review','OK'],items:rows,explain:'AND is only true when both tests are true: the amount is over £5,000 and the invoice is unpaid. Exactly £5,000 isn’t over £5,000.'};}),
 gen(()=>{const rows=Array.from({length:6},()=>{const d=rint(-20,110);return {label:`Days overdue: ${d}`,answer:d<=0?'Current':d<=30?'1–30':d<=60?'31–60':'Over 60'};});return {type:'classify',prompt:'<p>This formula puts invoices into ageing buckets. Which bucket does each row go in?</p><p><code>=IF(D2&lt;=0,"Current",IF(D2&lt;=30,"1–30",IF(D2&lt;=60,"31–60","Over 60")))</code></p>',options:['Current','1–30','31–60','Over 60'],items:rows,explain:'Excel checks each test in order and stops at the first true one. Zero or negative days means not yet due.'};}),
 mcqPool([
  {q:'In row 2, <code>=E2*$H$1</code> is copied down to row 3. What does it become?',options:['<code>=E3*$H$1</code>','<code>=E3*$H$2</code>','<code>=E2*$H$1</code>','<code>=F3*$I$1</code>'],why:'The $ signs fix H1. E2 has no $ signs, so it moves down one row.'},
  {q:'A lookup returns <code>#N/A</code>. What is the most likely cause?',options:['The value being looked up isn’t in the lookup column','The column is formatted as currency','The file needs saving','The formula has too many brackets'],why:'Common causes are a typo, extra spaces (TRIM helps) or a number stored as text.'},
  {q:'Which formula totals the unpaid invoices for Brewline?',options:['<code>=SUMIFS(D:D,B:B,"Brewline",E:E,"Unpaid")</code>','<code>=SUMIF(D:D,"Brewline")</code>','<code>=COUNTIFS(B:B,"Brewline",E:E,"Unpaid")</code>','<code>=SUM(D:D)</code>'],why:'SUMIFS takes the range to add first, then pairs of criteria range and criteria.'},
  {q:'Why should the VAT rate go in its own cell and not be typed into each formula?',options:['So it can be changed in one place and seen by a reviewer','Because Excel can’t multiply by 0.2','To make the file smaller','Because formulas can’t contain numbers'],why:'Hardcoded numbers are hard to spot and easy to miss when they need changing.'},
  {q:'What is the quickest way to summarise 5,000 invoices by region and status?',options:['A pivot table','Typing out a SUMIFS for every combination','Sorting and adding by hand','A chart'],why:'A pivot table groups and totals the data in seconds, and refreshes when the data changes.'}])
]});
/* ---------- Reading an annual report ---------- */
const AR_CHECK=[
 ['Start with the auditor’s report','Is the opinion unmodified? Is there a material uncertainty related to going concern, or an emphasis of matter?'],
 ['Read the key audit matters','Which areas did the auditor think were riskiest? Note what they did and what they concluded.'],
 ['Note the auditor’s materiality','What benchmark and amount did they use? It shows how big an error has to be to matter.'],
 ['Read the going concern statement','Does management expect to keep trading? Does it mention facilities, covenants or scenarios?'],
 ['Read the principal risks','Which risks does management rank highest, and do they match the key audit matters?'],
 ['Check the accounting policies and judgements note','What are the critical judgements and key sources of estimation uncertainty?'],
 ['Compare adjusted and statutory profit','How big is the gap, and are the same items adjusted for every year?'],
 ['Read the segment note','Which parts of the business earn the revenue and profit?'],
 ['Read the goodwill impairment note','How much headroom is there, and how sensitive is it to the assumptions?'],
 ['Read the borrowings and leases notes','How much debt is there, when is it due, and are there covenants?'],
 ['Read provisions and contingent liabilities','Are there legal claims, restructuring costs or guarantees?'],
 ['Check events after the reporting period','Has anything significant happened since the year end?'],
 ['Scan related party transactions','Are there dealings with directors or connected companies?'],
 ['Work out three or four key ratios','For example margin, current ratio, gearing and cash conversion, compared with last year.']];
TOPICS.push({id:'annualreport',level:'ind',title:'Reading an annual report',blurb:'What is in a listed company’s annual report, where auditors and analysts look first, and a checklist to use on any report.',
lesson:`<p>A listed company’s annual report is often more than 200 pages long. Few people read it front to back. Auditors, analysts and investors go straight to a few sections, then use the notes to dig into the numbers.</p>
<h3>What is in it</h3>
${sTable(['Section','What you’ll find'],[
['Strategic report','The business model, strategy, key performance indicators (KPIs), the financial review, and the principal risks and uncertainties'],
['Governance','The directors’ report, corporate governance report, audit committee report and directors’ remuneration report'],
['Financial statements','The independent auditor’s report, the primary statements (group and parent company) and the notes'],
['Other information','Shareholder information, glossaries, and definitions of alternative performance measures (APMs)']])}
<h3>Where to look first</h3>
${sTable(['An auditor looks at…','An analyst or investor looks at…'],[
['The auditor’s report and key audit matters','Headline KPIs and the financial review'],
['Accounting policies, judgements and estimates','Adjusted profit and how it reconciles to statutory profit'],
['Going concern and events after the year end','Segment results: which parts are growing'],
['Provisions, contingent liabilities, related parties','Cash flow, net debt and dividends'],
['The audit committee report','The outlook and the principal risks']])}
<h3>The auditor’s report</h3>
<p>For a UK listed company it normally contains:</p>
<ul><li><b>Opinion</b>: whether the accounts give a true and fair view. Unmodified is the normal result.</li><li><b>Basis for opinion</b>: confirmation that the audit followed International Standards on Auditing (UK) and that the auditor is independent.</li><li><b>Conclusions on going concern</b>, and a separate <b>material uncertainty</b> section if there is significant doubt.</li><li><b>Key audit matters (KAMs)</b>: the areas the auditor considered most significant.</li><li><b>Materiality</b>: the level used and how it was worked out.</li><li><b>Scope</b>: which parts of the group were audited in full.</li><li>Other information, and the responsibilities of the directors and the auditor.</li></ul>
<h3>Key audit matters</h3>
<p>Each KAM explains three things: <b>what the risk is</b>, <b>how the auditor responded</b> and, often, <b>what they found</b>. Common KAMs include revenue recognition, goodwill impairment, inventory valuation, provisions and going concern. KAMs are not problems in themselves. They show you where the judgement in the accounts is.</p>
<h3>The accounting policies note</h3>
<p>Usually note 1 or 2. Look for two headings required by IAS 1: <b>critical accounting judgements</b> (choices management made) and <b>key sources of estimation uncertainty</b> (numbers that could change materially next year). These often match the KAMs.</p>
<h3>Adjusted profit and APMs</h3>
<p>Many companies show an “adjusted” or “underlying” profit that leaves out items such as restructuring costs, impairments or amortisation of acquired intangibles. These are alternative performance measures. They must be reconciled to the statutory IFRS figure. Check the size of the gap and whether “one-off” items come back every year.</p>
<h3>Warning signs</h3>
<ul><li>A modified audit opinion or a material uncertainty about going concern.</li><li>A change of auditor, or a qualified opinion last year.</li><li>Adjusted profit far above statutory profit, year after year.</li><li>Profit rising while operating cash flow falls.</li><li>Receivables or inventory growing much faster than revenue.</li><li>Small goodwill headroom that disappears with a small change in assumptions.</li><li>Debt due soon, or covenants close to being breached.</li><li>Changes in accounting policies or estimates that increase profit.</li></ul>
<h3>Where to find reports</h3>
<p>On the company’s investor relations website, on the FCA’s National Storage Mechanism for UK listed companies, and on Companies House for any UK company.</p>
<h3 id="checklist-h">Checklist for any listed company’s report</h3>
<p>Tick items off as you go. Your ticks are saved in this browser. <b><span id="cl-count">0</span> of ${AR_CHECK.length}</b> done. <button class="ghost" type="button" id="cl-clear">Clear ticks</button></p>
<div class="checklist">${AR_CHECK.map(([t,d],i)=>`<label><input type="checkbox" id="cl${i+1}"><span><b>${t}.</b> ${d}</span></label>`).join('')}</div>`,
example:`<p>Here is a key audit matter from the report on <b>Marlow Retail Group plc</b>, a fictional company, with notes on how to read it.</p>
<div class="email"><div class="email-h"><div><b>Key audit matter: Carrying value of goodwill in the Homeware division (£84.0m)</b></div></div><div class="email-b">
<p><b>The risk.</b> The Homeware division has had falling sales for two years. Its goodwill is tested for impairment using forecast cash flows discounted at 11.5%. The test is sensitive to the forecast sales growth and the discount rate. The directors have concluded that no impairment is needed, with headroom of £6.2m.</p>
<p><b>Our response.</b> We compared the forecasts with board-approved budgets and past accuracy. We used our valuation specialists to assess the discount rate. We ran sensitivity analysis on the key assumptions and reviewed the disclosures in note 14.</p>
<p><b>Our observations.</b> The assumptions are within an acceptable range. A fall of 1.5 percentage points in forecast growth, or a rise of 0.9 points in the discount rate, would remove the headroom. This is disclosed in note 14.</p>
</div></div>
${sTable(['What it says','What it tells you'],[
['Falling sales for two years','The division is under pressure, so the forecasts may be optimistic.'],
['Headroom of £6.2m on £84.0m','Only about 7% headroom. That is small.'],
['1.5 points of growth removes the headroom','A modest miss in the forecast would mean an impairment charge.'],
['Assumptions “within an acceptable range”','The auditor accepted the numbers, but the judgement is close.'],
['Disclosed in note 14','Read note 14 next for the full sensitivity figures.']])}
<p>A reader would conclude that the accounts are fine for now, but an impairment of the Homeware goodwill next year is a real possibility.</p>`,
practice:[
 gen(()=>{const pool=[['Principal risks and uncertainties','Strategic report'],['Key performance indicators','Strategic report'],['Business model','Strategic report'],['Audit committee report','Governance'],['Directors’ remuneration report','Governance'],['Corporate governance statement','Governance'],['Independent auditor’s report','Financial statements'],['Consolidated statement of cash flows','Financial statements'],['Notes on accounting policies','Financial statements']];return {type:'classify',prompt:'<p>Which part of the annual report is each item in?</p>',options:['Strategic report','Governance','Financial statements'],items:pickN(pool,6).map(([l,a])=>({label:l,answer:a})),explain:'The strategic report explains the business, its performance and its risks. Governance covers how the company is run and how directors are paid. The financial statements section holds the auditor’s report, the primary statements and the notes.'};}),
 gen(()=>{const pool=[['Did the auditor give a clean opinion?','Auditor’s report'],['Which areas did the auditor think were riskiest?','Auditor’s report'],['Which numbers involve the most estimation?','Accounting policies note'],['Which division earns the most profit?','Segment note'],['When does the company’s debt have to be repaid?','Borrowings note'],['Is the company being sued?','Provisions and contingent liabilities note'],['Did anything significant happen after the year end?','Events after the reporting period note']];return {type:'classify',prompt:'<p>Where would you look first to answer each question?</p>',options:['Auditor’s report','Accounting policies note','Segment note','Borrowings note','Provisions and contingent liabilities note','Events after the reporting period note'],items:pickN(pool,5).map(([l,a])=>({label:l,answer:a})),explain:'Knowing where to look saves a lot of time in a long report. The auditor’s report and the accounting policies note point you to the areas of judgement, and the notes give the detail.'};}),
 gen(()=>{const op=rint(20,200)*1000000,ex=rint(2,30)*1000000,am=rint(1,20)*1000000;const adj=op+ex+am;return {type:'fields',prompt:`<p>A company reports statutory operating profit of ${money(op)}. It adds back exceptional restructuring costs of ${money(ex)} and amortisation of acquired intangibles of ${money(am)} to get “adjusted operating profit”.</p>`,fields:[{label:'Adjusted operating profit (£)',answer:adj},{label:'Adjusted profit is higher than statutory profit by (%, 1 decimal place)',answer:r1((adj-op)/op*100),tol:0.1,unit:'%',display:((adj-op)/op*100).toFixed(1)}],explain:`Adjusted = ${money(op)} + ${money(ex)} + ${money(am)} = ${money(adj)}. That is ${((adj-op)/op*100).toFixed(1)}% above statutory profit. A big gap every year is worth questioning: are the “exceptional” costs really one-off?`};}),
 gen(()=>{const ca=rint(40,200)*1000000,ra=ca+rint(1,30)*1000000;const h=ra-ca;return {type:'fields',prompt:`<p>A goodwill impairment note shows a cash-generating unit with a carrying amount of ${money(ca)} and a recoverable amount of ${money(ra)}.</p>`,fields:[{label:'Headroom (£)',answer:h},{label:'Headroom as a % of the carrying amount (1 decimal place)',answer:r1(h/ca*100),tol:0.1,unit:'%',display:(h/ca*100).toFixed(1)},{label:'Fall in recoverable amount (%) that would cause an impairment (1 decimal place)',answer:r1(h/ra*100),tol:0.1,unit:'%',display:(h/ra*100).toFixed(1)}],explain:`Headroom = ${money(ra)} − ${money(ca)} = ${money(h)}, or ${(h/ca*100).toFixed(1)}% of the carrying amount. The recoverable amount only has to fall by ${(h/ra*100).toFixed(1)}% for the headroom to disappear. The smaller that number, the more likely an impairment is.`};}),
 mcqPool([
  {q:'What is a key audit matter?',options:['An area the auditor judged most significant in the audit','An error the auditor found and the company refused to correct','A reason the auditor modified the opinion','A matter the directors asked the auditor to look at'],why:'KAMs show where the auditor focused. They don’t mean the accounts are wrong.'},
  {q:'An auditor’s report includes a “Material uncertainty related to going concern” section. This means:',options:['There is significant doubt about the company continuing, and it is disclosed in the accounts','The auditor refused to give an opinion','The accounts are materially misstated','The company has already stopped trading'],why:'The opinion can still be unmodified. The section draws attention to a disclosed uncertainty.'},
  {q:'Why do investors compare adjusted profit with statutory profit?',options:['Adjusted measures are chosen by management and can leave out real, recurring costs','Statutory profit is always wrong','Adjusted profit is audited more closely','Tax is based on adjusted profit'],why:'APMs can be useful, but a large or growing gap may flatter the results.'},
  {q:'Where do you find the “key sources of estimation uncertainty”?',options:['In the accounting policies and judgements note','In the remuneration report','In the chair’s statement','In the shareholder information section'],why:'IAS 1 requires them to be disclosed in the notes, usually near the start.'},
  {q:'Profit rose by 12%, but cash generated from operations fell by 20%. The best next step is to:',options:['Look at the changes in receivables, inventory and payables','Assume the cash will catch up next year','Ignore it, because profit matters more','Check the remuneration report'],why:'Working capital growing faster than sales is a common reason profit doesn’t turn into cash, and can be a warning sign.'}]),
 fixed({type:'written',prompt:'<p><b>Read the Marlow Retail KAM in the worked example. Explain it in plain English to someone who isn’t an accountant.</b></p>',model:'The auditor’s biggest worry was whether the Homeware division is still worth what the accounts say. Its goodwill is £84 million, and the test only passes by £6.2 million, about 7%. That is a small margin for a division whose sales have fallen for two years. The auditor checked the forecasts and the discount rate and accepted them, but pointed out that slightly weaker growth or slightly higher interest rates would mean writing the value down. So the accounts are acceptable today, but there is a real chance of an impairment charge next year.',points:['Explains what goodwill impairment means in simple words','Says the headroom is small (£6.2m, about 7%)','Links the risk to falling sales','Explains that small changes in assumptions would cause an impairment','Concludes that the accounts are acceptable now but there is a risk of a write-down']})
]});
/* ================= IFRS DEPTH ================= */
const IFRS_ACCTS=ACCTS.concat(['Income tax expense','Deferred tax liability','Deferred tax asset','Impairment loss','Revaluation surplus','Goodwill','Contract liability','Contract asset','Finance costs','Loan','Expected credit loss allowance']);

/* ---------- IAS 36 ---------- */
TOPICS.push({id:'ias36',level:'y3',title:'IAS 36: Impairment of assets',blurb:'Recoverable amount, value in use, impairment losses and how they are spread across a cash-generating unit.',
lesson:`<p>An asset is <b>impaired</b> when the figure in the accounts (its carrying amount) is more than the business could get back from it. IAS 36 makes sure assets are not shown at more than they are worth.</p>
<h3>When to test</h3>
<ul><li>At every year end, look for <b>signs</b> (indicators) that an asset may be impaired. Signs from outside the business: its market value has fallen, interest rates have gone up, or the company’s shares are worth less than its net assets. Signs from inside: damage, the asset is out of date, a plan to close part of the business, or worse results than expected.</li><li>If there is a sign, do the test.</li><li><b>Goodwill</b>, and intangible assets with no end date, are tested <b>every year</b>, even with no signs.</li></ul>
<h3>The test</h3>
<div class="formula">Recoverable amount = the higher of (fair value − costs to sell) and value in use</div>
<div class="formula">Impairment loss = Carrying amount − Recoverable amount</div>
<p><b>Value in use</b> is the present value of the cash the asset will produce in future. Divide each year’s cash by (1 + r)<sup>n</sup>, where r is the interest rate and n is the year number.</p>
<p><b>Example:</b> Carrying amount £100,000. Fair value − costs to sell = £70,000. Value in use = £85,000. Recoverable amount = the higher = £85,000. Impairment loss = £100,000 − £85,000 = £15,000.</p>
<h3>Recording the loss</h3>
<p>Debit Impairment loss (an expense in profit or loss). Credit the asset. If the asset was revalued before, first take the loss off its revaluation surplus. Only the amount left over goes to profit or loss.</p>
<h3>Cash-generating units (CGUs)</h3>
<p>Many assets do not produce cash on their own. They are tested together as a group, called a cash-generating unit, such as a factory or a shop. Goodwill is shared out between CGUs. If a CGU is impaired, the loss is taken off:</p>
<ol><li><b>Goodwill</b> first.</li><li>Then the other assets, <b>in proportion to their carrying amounts</b>. No asset can go below the highest of: its fair value − costs to sell, its value in use, and zero.</li></ol>
<h3>Reversals</h3>
<p>If things get better later, an impairment on most assets can be reversed. The asset can go back up to the figure it would have had with no impairment. An impairment of <b>goodwill is never reversed</b>.</p>`,
example:`<p><b>A single asset.</b> A machine has a carrying amount of £120,000. It could be sold for £92,000 with £2,000 of selling costs. It will produce cash flows of £40,000, £35,000 and £30,000 over the next three years. The discount rate is 10%.</p>
${sTable(['Year','Cash flow £','Discount factor at 10%','Present value £'],[['1','40,000','1 ÷ 1.10','36,364'],['2','35,000','1 ÷ 1.10²','28,926'],['3','30,000','1 ÷ 1.10³','22,539'],['<b>Value in use</b>','','','<b>87,829</b>']],[1,3])}
<p>Fair value less costs of disposal = £92,000 − £2,000 = £90,000. That is higher than value in use, so the recoverable amount is £90,000. <b>Impairment loss = £120,000 − £90,000 = £30,000.</b></p>
<p><b>A CGU.</b> A division has goodwill of £50,000, property, plant and equipment of £300,000 and other intangibles of £150,000 (£500,000 in total). Its recoverable amount is £380,000, so the loss is £120,000.</p>
${sTable(['Asset','Carrying amount £','Loss allocated £','After impairment £'],[['Goodwill','50,000','50,000','0'],['Property, plant and equipment','300,000','46,667','253,333'],['Other intangibles','150,000','23,333','126,667'],['<b>Total</b>','<b>500,000</b>','<b>120,000</b>','<b>380,000</b>']],[1,2,3])}
<p>Goodwill takes the first £50,000. The remaining £70,000 is split 300:150 between the other assets.</p>`,
practice:[
 gen(()=>{const ca=rint(40,200)*1000,fv=rint(20,Math.floor(ca/1000)+20)*1000,viu=rint(20,Math.floor(ca/1000)+20)*1000;const ra=Math.max(fv,viu),loss=Math.max(0,ca-ra);return {type:'fields',prompt:`<p>An asset has a carrying amount of ${money(ca)}. Its fair value less costs of disposal is ${money(fv)} and its value in use is ${money(viu)}. Enter 0 if there is no impairment.</p>`,fields:[{label:'Recoverable amount (£)',answer:ra},{label:'Impairment loss (£)',answer:loss}],explain:`Recoverable amount is the higher of ${money(fv)} and ${money(viu)}: ${money(ra)}. ${loss?`The carrying amount is higher, so the loss is ${money(ca)} − ${money(ra)} = ${money(loss)}.`:'It is at least the carrying amount, so there is no impairment.'}`};}),
 gen(()=>{const r=pick([8,10,12]),c=[rint(10,60),rint(10,60),rint(10,60)].map(x=>x*1000);const viu=c.reduce((t,x,i)=>t+x/Math.pow(1+r/100,i+1),0);const ca=Math.round(viu*rint(95,130)/100/1000)*1000,fv=Math.round(viu*rint(80,105)/100/1000)*1000;const ra=Math.max(viu,fv),loss=Math.max(0,ca-ra);return {type:'fields',prompt:`<p>An asset will produce cash flows of ${c.map(money).join(', ')} over the next three years. The discount rate is ${r}%. Its carrying amount is ${money(ca)} and its fair value less costs of disposal is ${money(fv)}. Round to the nearest £ and enter 0 if there is no impairment.</p>`,fields:[{label:'Value in use (£)',answer:viu,tol:1,display:fmt(Math.round(viu))},{label:'Recoverable amount (£)',answer:ra,tol:1,display:fmt(Math.round(ra))},{label:'Impairment loss (£)',answer:loss,tol:1,display:fmt(Math.round(loss))}],explain:`Value in use = ${c.map((x,i)=>`${fmt(x)} ÷ ${(1+r/100).toFixed(2)}${i?'^'+(i+1):''}`).join(' + ')} = ${money(Math.round(viu))}. Recoverable amount is the higher of that and ${money(fv)}.`};}),
 gen(()=>{const g=rint(2,10)*10000,p=rint(20,60)*10000,o=rint(5,30)*10000,ca=g+p+o,loss=g+rint(1,Math.floor((p+o)*.4/10000))*10000,rest=loss-g;return {type:'fields',prompt:`<p>A cash-generating unit has goodwill of ${money(g)}, property, plant and equipment of ${money(p)} and other intangible assets of ${money(o)}. Its recoverable amount is ${money(ca-loss)}. Round to the nearest £.</p>`,fields:[{label:'Total impairment loss (£)',answer:loss},{label:'Loss allocated to goodwill (£)',answer:g},{label:'Loss allocated to property, plant and equipment (£)',answer:rest*p/(p+o),tol:1,display:fmt(Math.round(rest*p/(p+o)))},{label:'Loss allocated to other intangibles (£)',answer:rest*o/(p+o),tol:1,display:fmt(Math.round(rest*o/(p+o)))}],explain:`Total loss = ${money(ca)} − ${money(ca-loss)} = ${money(loss)}. Goodwill absorbs ${money(g)} first. The remaining ${money(rest)} is split in the ratio ${fmt(p)} : ${fmt(o)}.`};}),
 gen(()=>{const pool=[['Market interest rates have risen sharply','Indicator'],['A machine was damaged in a flood','Indicator'],['The company’s market value has fallen below its net assets','Indicator'],['Sales of a product line fell 40% and are expected to stay low','Indicator'],['A competitor launched a cheaper, better product','Indicator'],['The company hired a new marketing manager','Not an indicator'],['An asset has been fully written off for tax purposes','Not an indicator'],['The company moved its head office to a new building it owns','Not an indicator']];return {type:'classify',prompt:'<p>Which of these are indicators of impairment?</p>',options:['Indicator','Not an indicator'],items:pickN(pool,6).map(([l,a])=>({label:l,answer:a})),explain:'Indicators suggest an asset may be worth less than its carrying amount, from outside the business (markets, rates, competitors) or inside it (damage, poor performance). Tax treatment and routine changes aren’t indicators.'};}),
 mcqPool([
  {q:'Recoverable amount is:',options:['The higher of fair value less costs of disposal and value in use','The lower of fair value and value in use','Original cost less depreciation','Fair value only'],why:'An asset is worth whichever is better: selling it or using it.'},
  {q:'An impairment of goodwill recognised last year:',options:['Can never be reversed','Can be reversed if the CGU recovers','Is reversed automatically after 5 years','Must be reversed through OCI'],why:'IAS 36 prohibits reversing goodwill impairments, because any recovery could be internally generated goodwill.'},
  {q:'An impaired building was previously revalued, with a £40,000 surplus. The impairment is £55,000. How is it recorded?',options:['£40,000 against the revaluation surplus (OCI) and £15,000 in profit or loss','£55,000 in profit or loss','£55,000 against the revaluation surplus','£15,000 in OCI and £40,000 in profit or loss'],why:'The loss uses up the surplus for that asset first. Only the excess is an expense.'},
  {q:'How often must goodwill be tested for impairment?',options:['At least every year','Only when there is an indicator','Every three years','Only when the subsidiary is sold'],why:'Goodwill and indefinite-life intangibles are tested annually, whether or not there are indicators.'}])
]});

/* ---------- IAS 12 ---------- */
TOPICS.push({id:'ias12',level:'y3',title:'IAS 12: Deferred tax',blurb:'Why accounting profit and taxable profit differ, and how temporary differences create deferred tax assets and liabilities.',
lesson:`<p>The tax expense in the accounts has two parts:</p>
<ul><li><b>Current tax</b>: the tax to pay on this year’s taxable profit.</li><li><b>Deferred tax</b>: tax that will be paid (or saved) in future years. It happens because the accounts and the tax rules put some items in different years.</li></ul>
<h3>Temporary differences</h3>
<div class="formula">Temporary difference = Carrying amount − Tax base</div>
<p>The <b>tax base</b> is the value the tax rules give an item. A common cause of a difference: the tax rules give tax relief on a machine faster than the accounts depreciate it. The company pays less tax now, so it will pay more tax later.</p>
${sTable(['Situation','Type of difference','Result'],[
['An asset’s carrying amount is higher than its tax base','Taxable temporary difference','Deferred tax liability'],
['A liability’s carrying amount is higher than its tax base (for example, a provision that gets tax relief only when paid)','Deductible temporary difference','Deferred tax asset'],
['Tax losses not used yet, which are expected to be used','Deductible','Deferred tax asset'],
['Items that are never taxed or never get tax relief (for example, fines)','Permanent difference','No deferred tax']])}
<div class="formula">Deferred tax balance = Temporary difference × Tax rate</div>
<p><b>Example:</b> Carrying amount £60,000. Tax base £40,000. Difference £20,000. Tax rate 25%. Deferred tax liability = £20,000 × 25% = £5,000. Last year it was £4,000. So the tax expense goes up by £1,000.</p>
<h3>Rules for measuring it</h3>
<ul><li>Use the tax rate expected when the difference reverses. Only use rates already set in law (enacted, or substantively enacted) at the year end.</li><li>Only include a deferred tax asset if future taxable profits are probable.</li><li>Deferred tax is never discounted.</li><li>The <b>change</b> in the balance goes to profit or loss. The exception: if the item itself went to other comprehensive income (OCI), such as a revaluation, the deferred tax goes to OCI too.</li></ul>
<h3>Journal</h3>
<p>If a deferred tax liability goes up: debit Income tax expense, credit Deferred tax liability. If it goes down, do the opposite.</p>`,
example:`<p>A company buys machinery for £100,000. It depreciates it over 5 years (£20,000 a year). For tax, it claims the annual investment allowance of 100% in year 1. The tax rate is 25%.</p>
${sTable(['End of year 1','£'],[['Carrying amount (100,000 − 20,000)','80,000'],['Tax base (100,000 − 100,000 allowance)','0'],['Taxable temporary difference','80,000'],['<b>Deferred tax liability at 25%</b>','<b>20,000</b>']],[1])}
<p>Journal: Dr Income tax expense £20,000, Cr Deferred tax liability £20,000. The company paid less tax this year because of the allowance. The liability shows that tax will be higher in later years, when depreciation continues but no more allowances are available.</p>`,
practice:[
 gen(()=>{const ca=rint(20,200)*1000,tb=rint(0,Math.floor(ca/1000)-5)*1000,r=25;return {type:'fields',prompt:`<p>At the year end, plant has a carrying amount of ${money(ca)} and a tax base of ${money(tb)}. The tax rate is ${r}%.</p>`,fields:[{label:'Temporary difference (£)',answer:ca-tb},{label:'Deferred tax liability (£)',answer:(ca-tb)*r/100}],explain:`${money(ca)} − ${money(tb)} = ${money(ca-tb)} taxable temporary difference. × ${r}% = ${money((ca-tb)*r/100)} deferred tax liability.`};}),
 gen(()=>{const l=rint(4,80)*1000;return {type:'fields',prompt:`<p>A company has a warranty provision of ${money(l)}. Warranty costs are only deductible for tax when they are paid, so the provision’s tax base is £0. Future taxable profits are expected. The tax rate is 25%.</p>`,fields:[{label:'Deductible temporary difference (£)',answer:l},{label:'Deferred tax asset (£)',answer:l*.25}],explain:`The company will get tax relief of 25% × ${money(l)} = ${money(l*.25)} when the warranty costs are paid, so it recognises a deferred tax asset.`};}),
 gen(()=>{const o=rint(10,80)*1000,c=o+rint(2,30)*1000;return {type:'journal',prompt:`<p>The deferred tax liability was ${money(o)} at the start of the year and is ${money(c)} at the end. Record the movement.</p>`,accounts:IFRS_ACCTS,answer:[['Income tax expense',c-o,0],['Deferred tax liability',0,c-o]],explain:`Only the movement is posted: ${money(c)} − ${money(o)} = ${money(c-o)}. It increases the tax charge in profit or loss.`};}),
 gen(()=>{const pool=[['Capital allowances faster than depreciation','Deferred tax liability'],['An upward revaluation of land','Deferred tax liability'],['A warranty provision deductible when paid','Deferred tax asset'],['Unused tax losses expected to be used','Deferred tax asset'],['A parking fine, never deductible','No deferred tax'],['Client entertaining, never deductible','No deferred tax']];return {type:'classify',prompt:'<p>What does each item create?</p>',options:['Deferred tax liability','Deferred tax asset','No deferred tax'],items:pickN(pool,5).map(([l,a])=>({label:l,answer:a})),explain:'Tax paid later creates a liability; tax saved later creates an asset. Items that are never taxable or deductible are permanent differences, with no deferred tax.'};}),
 mcqPool([
  {q:'Which tax rate is used to measure deferred tax?',options:['The rate expected when the difference reverses, as enacted or substantively enacted at the reporting date','This year’s rate, always','The average rate over the past five years','The rate the company thinks is most likely in future'],why:'It must be based on enacted or substantively enacted law, not guesses.'},
  {q:'A company has tax losses but expects to make losses for the next few years. What should it do?',options:['Not recognise a deferred tax asset for the losses','Recognise the full deferred tax asset','Recognise a deferred tax liability','Discount the asset'],why:'A deferred tax asset needs probable future taxable profits to use it against.'},
  {q:'Deferred tax on a revaluation surplus is recognised:',options:['In other comprehensive income','In profit or loss','Directly in share capital','Nowhere, because revaluations aren’t taxed'],why:'Deferred tax follows the item it relates to. The revaluation went to OCI, so its deferred tax does too.'}])
]});

/* ---------- IFRS 9 ---------- */
TOPICS.push({id:'ifrs9',level:'y3',title:'IFRS 9: Financial instruments',blurb:'Classifying financial assets, the amortised cost method, and expected credit losses on receivables.',
lesson:`<p>IFRS 9 covers financial instruments: contracts about money, such as loans, bonds, shares held in other companies, and receivables.</p>
<h3>Which group does a financial asset go in?</h3>
<p>Two tests decide:</p>
<ol><li><b>The business model</b>: why the company holds the asset. Is it to collect the payments, to sell it, or both?</li><li><b>The cash flow test (SPPI)</b>: are the payments <b>solely payments of principal and interest</b>? In other words, is it a simple loan, where you get back the amount lent plus interest?</li></ol>
${sTable(['Group','When','Where gains and losses go'],[
['Amortised cost','Held to collect the payments, and passes SPPI','Interest goes to profit or loss, using the effective interest rate'],
['Fair value through OCI (debt)','Held to collect <b>and</b> to sell, and passes SPPI','Value changes go to OCI. When sold, they are moved to profit or loss.'],
['Fair value through OCI (shares, by choice)','Shares not held for trading, if the company chooses this at the start. It cannot change later.','Value changes go to OCI. They are never moved to profit or loss.'],
['Fair value through profit or loss','Everything else, including items held for trading and derivatives','Value changes go to profit or loss']])}
<h3>Amortised cost and the effective interest rate (EIR)</h3>
<p>Most loans are measured at amortised cost. The interest charged each year is the <b>effective interest rate × the opening balance</b>. This is not always the same as the cash interest paid (the coupon).</p>
<div class="formula">Closing balance = Opening balance + Interest at the EIR − Cash paid</div>
<p><b>Example:</b> A company borrows £10,000. The EIR is 8%. It pays £500 cash interest each year. Year 1: £10,000 + £800 − £500 = £10,300.</p>
<h3>Expected credit losses (ECL)</h3>
<p>IFRS 9 says you must set aside an allowance for losses you <b>expect</b>, before they happen.</p>
<ul><li><b>Stage 1</b>: the risk has not gone up much since the start. Allow for losses expected in the next 12 months.</li><li><b>Stage 2</b>: the risk has gone up a lot. Allow for losses over the whole life of the asset.</li><li><b>Stage 3</b>: the borrower is already in trouble (credit-impaired). Allow for lifetime losses, and work out interest on the amount after the allowance.</li></ul>
<p>For <b>trade receivables</b> there is a simpler method. Always allow for lifetime losses. Usually you use a <b>provision matrix</b>: a table of loss rates for how long each debt has been unpaid.</p>
<p><b>Example:</b> £40,000 not yet due × 1% = £400. £10,000 over 90 days late × 20% = £2,000. Allowance = £2,400.</p>`,
example:`<p><b>A loan at amortised cost.</b> A company issues a bond with a nominal value of £10,000 and receives £9,500 after costs. It pays a 4% coupon (£400 a year). The effective interest rate is 5.4%.</p>
${sTable(['Year','Opening £','Interest at 5.4% £','Cash paid £','Closing £'],[['1','9,500','513','(400)','9,613'],['2','9,613','519','(400)','9,732']],[1,2,3,4])}
<p>The finance cost in profit or loss is £513 in year 1, not the £400 paid. The balance grows towards £10,000, which is repaid at the end.</p>
<p><b>A provision matrix.</b></p>
${sTable(['Ageing band','Balance £','Expected loss rate','Allowance £'],[['Current','200,000','0.5%','1,000'],['1–30 days overdue','60,000','2%','1,200'],['31–60 days overdue','25,000','8%','2,000'],['Over 60 days overdue','10,000','30%','3,000'],['<b>Total</b>','<b>295,000</b>','','<b>7,200</b>']],[1,3])}`,
practice:[
 gen(()=>{const N=rint(10,100)*10000,A=N*rint(92,98)/100,cr=pick([3,4,5]),r=cr+rint(8,20)/10;const c=N*cr/100,i1=A*r/100,c1=A+i1-c,i2=c1*r/100,c2=c1+i2-c;return {type:'fields',prompt:`<p>A company issues a bond with a nominal value of ${money(N)} and receives ${money(A)}. It pays a coupon of ${cr}% of nominal each year. The effective interest rate is ${r.toFixed(1)}%. Round to the nearest £.</p>`,fields:[{label:'Year 1 finance cost (£)',answer:i1,tol:1,display:fmt(Math.round(i1))},{label:'Year 1 closing balance (£)',answer:c1,tol:1,display:fmt(Math.round(c1))},{label:'Year 2 finance cost (£)',answer:i2,tol:1.5,display:fmt(Math.round(i2))},{label:'Year 2 closing balance (£)',answer:c2,tol:2,display:fmt(Math.round(c2))}],explain:`Year 1: ${money(A)} × ${r.toFixed(1)}% = ${money(Math.round(i1))}, less the ${money(c)} coupon, gives ${money(Math.round(c1))}. Year 2 repeats this on the new opening balance.`};}),
 gen(()=>{const b=[rint(50,300),rint(10,80),rint(5,40),rint(2,20)].map(x=>x*1000),r=[pick([0.5,1]),pick([2,3]),pick([5,8,10]),pick([25,30,40])];const e=b.reduce((t,x,i)=>t+x*r[i]/100,0);return {type:'fields',prompt:`<p>Calculate the expected credit loss allowance using this provision matrix.</p>${sTable(['Ageing band','Balance £','Loss rate'],[['Current',fmt(b[0]),r[0]+'%'],['1–30 days overdue',fmt(b[1]),r[1]+'%'],['31–60 days overdue',fmt(b[2]),r[2]+'%'],['Over 60 days overdue',fmt(b[3]),r[3]+'%']],[1,2])}`,fields:[{label:'Total expected credit loss allowance (£)',answer:e,tol:1}],explain:`Multiply each band by its rate and add them up: ${b.map((x,i)=>`${fmt(x)} × ${r[i]}%`).join(' + ')} = ${money(Math.round(e))}.`};}),
 gen(()=>{const pool=[['A government bond held to collect its interest and repayment','Amortised cost'],['Trade receivables','Amortised cost'],['Shares bought to sell within weeks for a profit','Fair value through profit or loss'],['An interest rate swap not used for hedging','Fair value through profit or loss'],['Shares in a key supplier held long term, with the OCI election made','Fair value through OCI'],['A bond portfolio managed both to collect interest and to sell','Fair value through OCI']];return {type:'classify',prompt:'<p>How is each financial asset classified under IFRS 9?</p>',options:['Amortised cost','Fair value through OCI','Fair value through profit or loss'],items:pickN(pool,5).map(([l,a])=>({label:l,answer:a})),explain:'Held to collect with simple interest → amortised cost. Held to collect and sell → FVOCI. Equity not held for trading can be elected to FVOCI. Trading assets and derivatives → FVTPL.'};}),
 mcqPool([
  {q:'For trade receivables, IFRS 9 allows a simplified approach that recognises:',options:['Lifetime expected credit losses from the start','Only losses that have already happened','12-month expected losses only','No allowance until a customer fails'],why:'The simplified approach skips the staging and always uses lifetime losses, often through a provision matrix.'},
  {q:'A loan’s finance cost under amortised cost is calculated using:',options:['The effective interest rate × the opening balance','The coupon rate × nominal value','The cash paid in the year','The market interest rate at the year end'],why:'The EIR spreads the total cost of borrowing, including any discount and issue costs, over the life of the loan.'},
  {q:'Gains on equity shares measured at FVOCI (election) are:',options:['Never recycled to profit or loss, even on sale','Recycled to profit or loss on sale','Always recognised in profit or loss','Not recognised at all'],why:'The election is irrevocable, and the gains stay in OCI.'},
  {q:'A loan moves from stage 1 to stage 2. What changes?',options:['The allowance changes from 12-month to lifetime expected losses','Nothing, because the loan hasn’t defaulted','The loan is written off','Interest stops being recognised'],why:'A significant increase in credit risk moves the allowance to lifetime losses.'}])
]});

/* ---------- IFRS 15 in depth ---------- */
TOPICS.push({id:'ifrs15',level:'y3',title:'IFRS 15: Revenue in depth',blurb:'The five-step model in detail: performance obligations, variable consideration, allocation and revenue over time.',
lesson:`<p>IFRS 15 uses 5 steps to decide when to count revenue and how much.</p>
<h3>Step 1: Find the contract</h3>
<p>A contract exists if all of these are true: both sides have agreed to it, each side’s rights and the payment terms are clear, it has a real business purpose (commercial substance), and the customer will probably pay.</p>
<h3>Step 2: List the separate promises (performance obligations)</h3>
<p>Each <b>distinct</b> good or service is a separate promise. It is distinct if both are true: (1) the customer can benefit from it on its own, or with things they can easily get, and (2) it is separate from the other promises in the contract. <b>Example:</b> An installation that changes the product a lot may not be separate from the product.</p>
<p><b>Warranties.</b> An <b>assurance-type</b> warranty only promises the product works. It is not a separate promise. A <b>service-type</b> warranty is extra cover the customer can buy. It is a separate promise.</p>
<h3>Step 3: Find the price (transaction price)</h3>
<ul><li>Some of the price may change, for example a bonus, a penalty or a discount. This is <b>variable consideration</b>. Estimate it using either the <b>expected value</b> (each possible amount × its probability, added up) or the <b>most likely amount</b>. Use whichever gives the better estimate.</li><li>Only include it if it is <b>highly unlikely</b> that a large amount will have to be reversed later. This is called the <b>constraint</b>.</li><li>If the customer pays a long time after delivery, adjust the price for the interest included (a <b>financing component</b>).</li></ul>
<h3>Step 4: Share the price between the promises</h3>
<p>Share it in proportion to each promise’s <b>standalone selling price</b>: the price it would sell for on its own.</p>
<p><b>Example:</b> A phone and a 12-month plan are sold together for £640. On their own, the phone sells for £500 and the plan for £300 (£800 in total). Phone = £640 × 500/800 = £400. Plan = £640 × 300/800 = £240, which is £20 a month.</p>
<p>If an item is never sold on its own, estimate its price. Methods: look at what the market pays, or use expected cost plus a profit margin. In limited cases, use what is left over (the residual approach).</p>
<h3>Step 5: Count the revenue</h3>
<p>Count revenue <b>over time</b> if any one of these is true:</p>
<ul><li>The customer gets the benefit while the work is being done (for example, cleaning or payroll services).</li><li>The work creates or improves an asset the customer controls (for example, building on the customer’s land).</li><li>The seller cannot use the asset for anyone else, and has a right to be paid for the work done so far.</li></ul>
<p>If none is true, count the revenue at <b>one point in time</b>: when the customer gets control. For work done over time, progress is often measured as costs so far ÷ total expected costs.</p>
<h3>Contract balances</h3>
<p>Cash received <b>before</b> the work is done is a <b>contract liability</b>. Work done <b>before</b> the customer is billed is a <b>contract asset</b>.</p>`,
example:`<p>A software company sells a licence, installation and two years of support together for £90,000. Sold separately, they would cost £60,000, £10,000 and £30,000.</p>
${sTable(['Obligation','Standalone price £','Allocation','Revenue £','When recognised'],[['Licence','60,000','90,000 × 60/100','54,000','On delivery'],['Installation','10,000','90,000 × 10/100','9,000','When installation is complete'],['Support','30,000','90,000 × 30/100','27,000','Evenly over 2 years (£13,500 a year)'],['<b>Total</b>','<b>100,000</b>','','<b>90,000</b>','']],[1,3])}
<p>If the customer pays the full £90,000 on day one, the support revenue not yet earned is shown as a contract liability and released as the support is provided.</p>`,
practice:[
 gen(()=>{const s=[rint(20,80),rint(5,20),rint(10,40)].map(x=>x*1000),tot=s[0]+s[1]+s[2],P=Math.round(tot*rint(80,95)/100/1000)*1000;const al=s.map(x=>P*x/tot);return {type:'fields',prompt:`<p>A contract for equipment, installation and a one-year service plan has a price of ${money(P)}. Standalone selling prices are ${money(s[0])}, ${money(s[1])} and ${money(s[2])}. Round to the nearest £.</p>`,fields:[{label:'Revenue allocated to the equipment (£)',answer:al[0],tol:1,display:fmt(Math.round(al[0]))},{label:'Revenue allocated to installation (£)',answer:al[1],tol:1,display:fmt(Math.round(al[1]))},{label:'Revenue allocated to the service plan (£)',answer:al[2],tol:1,display:fmt(Math.round(al[2]))}],explain:`Total standalone price = ${money(tot)}. Each obligation gets ${money(P)} × its standalone price ÷ ${money(tot)}. The discount is spread across all three.`};}),
 gen(()=>{const P=rint(50,200)*10000,C=Math.round(P*rint(60,85)/100/1000)*1000,c=Math.round(C*rint(20,80)/100/1000)*1000;const pc=c/C,rev=P*pc;return {type:'fields',prompt:`<p>A construction contract has a price of ${money(P)} and total expected costs of ${money(C)}. Costs incurred to date are ${money(c)}. Revenue is recognised over time based on costs incurred. Round to the nearest £ (percentage to 1 decimal place).</p>`,fields:[{label:'Progress to date (%)',answer:r1(pc*100),tol:0.1,unit:'%',display:(pc*100).toFixed(1)},{label:'Revenue to date (£)',answer:rev,tol:P*0.0006+1,display:fmt(Math.round(rev))},{label:'Profit to date (£)',answer:rev-c,tol:P*0.0006+1,display:fmt(Math.round(rev-c))}],explain:`Progress = ${money(c)} ÷ ${money(C)} = ${(pc*100).toFixed(1)}%. Revenue = ${money(P)} × that = ${money(Math.round(rev))}. Profit = revenue − costs to date.`};}),
 gen(()=>{const F=rint(20,100)*10000,B=rint(2,20)*5000,p=pick([60,70,75,80,90]);const ev=F+B*p/100;return {type:'fields',prompt:`<p>A contract pays a fixed fee of ${money(F)}, plus a bonus of ${money(B)} if the project finishes early. The company estimates a ${p}% chance of finishing early. Use the expected value method.</p>`,fields:[{label:'Transaction price (£)',answer:ev}],explain:`Expected value = ${money(F)} + ${p}% × ${money(B)} = ${money(ev)}. The company must also apply the constraint: only include the bonus to the extent that a significant reversal is highly unlikely.`};}),
 gen(()=>{const pool=[['Building a factory on the customer’s own land','Over time'],['Selling a television in a shop','Point in time'],['A 12-month gym membership','Over time'],['Delivering a standard machine','Point in time'],['Weekly office cleaning services','Over time'],['Selling a software licence the customer downloads and uses as it is','Point in time'],['Making a bespoke product with no other use, with a right to payment for work done','Over time']];return {type:'classify',prompt:'<p>Is revenue recognised over time or at a point in time?</p>',options:['Over time','Point in time'],items:pickN(pool,5).map(([l,a])=>({label:l,answer:a})),explain:'Over time applies if the customer benefits as the work is done, controls the asset as it is created, or the asset has no other use and the seller has a right to payment. Otherwise revenue is recognised when control passes.'};}),
 mcqPool([
  {q:'A customer pays £12,000 in advance for a year of services. After one month, the company shows:',options:['Revenue of £1,000 and a contract liability of £11,000','Revenue of £12,000','A contract asset of £11,000','Revenue of £1,000 and a receivable of £11,000'],why:'Cash received before the work is done is a contract liability until it is earned.'},
  {q:'A standard one-year warranty that the product will work as described is:',options:['An assurance-type warranty, not a separate performance obligation','A separate performance obligation','Variable consideration','A contract asset'],why:'It is accounted for as a provision under IAS 37. Only warranties that provide an extra service are separate obligations.'},
  {q:'Which method is used to estimate variable consideration?',options:['Expected value or most likely amount, whichever predicts better','Always the maximum possible amount','Always the minimum possible amount','The amount the customer suggests'],why:'The method should best predict the consideration, and the constraint then limits it.'}])
]});
/* ---------- Partnerships ---------- */
function partGen(){const cA=rint(20,100)*1000,cB=rint(20,100)*1000,rate=pick([5,6,8,10]),sal=rint(5,20)*1000,ratio=pick([[1,1],[2,1],[3,2],[3,1]]),profit=rint(50,150)*1000;const iA=cA*rate/100,iB=cB*rate/100,res=profit-sal-iA-iB,sh=ratio[0]+ratio[1];return {cA,cB,rate,sal,ratio,profit,iA,iB,res,shA:res*ratio[0]/sh,shB:res*ratio[1]/sh};}
TOPICS.push({id:'partnerships',level:'f',title:'Partnerships',blurb:'Sharing profit between partners: salaries, interest on capital, the appropriation account and current accounts.',
lesson:`<p>A partnership is a business owned by two or more people (partners). You work out the profit in the same way as for a sole trader. The extra step is <b>sharing the profit</b> between the partners. The partnership agreement says how.</p>
<h3>What the agreement usually says</h3>
<ul><li><b>Profit-sharing ratio</b>: how the profit is split, for example 3:2.</li><li><b>Partners’ salaries</b>: a fixed amount given to a partner, usually one who does more of the work.</li><li><b>Interest on capital</b>: an amount given to each partner based on the money they put into the business.</li><li><b>Interest on drawings</b>: an amount charged to a partner for taking money out. It stops partners taking money out too early.</li></ul>
<div class="note"><b>No agreement?</b> In the UK, the Partnership Act 1890 applies. Profits are split equally. There are no salaries, no interest on capital and no interest on drawings. A partner who lends money to the firm gets 5% interest on the loan.</div>
<h3>The appropriation account</h3>
<p>This statement shows how the profit is shared. Salaries and interest to partners are <b>not</b> business expenses. They are part of sharing out the profit.</p>
<div class="formula">Profit left to share = Profit + Interest on drawings − Salaries − Interest on capital</div>
<p>Split what is left using the profit-sharing ratio.</p>
<p><b>Example:</b> Profit £50,000. Salary to A £10,000. Interest on capital £4,000 in total. Profit left to share = £50,000 − £10,000 − £4,000 = £36,000. With a 2:1 ratio, A gets £24,000 and B gets £12,000.</p>
<h3>Capital accounts and current accounts</h3>
<p>Each partner usually has two accounts. The <b>capital account</b> holds the money they put in, and it rarely changes. The <b>current account</b> records everything else:</p>
${sTable(['Debit side (reduces what the firm owes the partner)','Credit side (increases it)'],[['Drawings','Salary'],['Interest on drawings','Interest on capital'],['Share of a loss','Share of profit']])}
<p>Changes such as a new partner joining use these same accounts.</p>`,
example:`<p>Ash and Blake share profits 3:2. Profit for the year is £80,000. Blake gets a salary of £12,000. Interest on capital is 5%: Ash has £60,000 of capital and Blake £40,000.</p>
${sTable(['Appropriation account','Ash £','Blake £','Total £'],[['Profit for the year','','','80,000'],['Salary','–','12,000','(12,000)'],['Interest on capital at 5%','3,000','2,000','(5,000)'],['Residual profit shared 3:2','37,800','25,200','(63,000)'],['<b>Total to each partner</b>','<b>40,800</b>','<b>39,200</b>','<b>0</b>']],[1,2,3])}
<p>Ash’s current account started at £2,000 credit, and Ash drew £30,000 in the year. Closing balance = £2,000 + £40,800 − £30,000 = <b>£12,800 credit</b>.</p>`,
practice:[
 gen(()=>{const g=partGen();return {type:'fields',prompt:`<p>Partners A and B share profits ${g.ratio[0]}:${g.ratio[1]}. Profit for the year is ${money(g.profit)}. B receives a salary of ${money(g.sal)}. Interest on capital is ${g.rate}%, and capital is ${money(g.cA)} for A and ${money(g.cB)} for B.</p>`,fields:[{label:'Total interest on capital (£)',answer:g.iA+g.iB},{label:'Residual profit to share (£)',answer:g.res},{label:'A’s share of the residual profit (£)',answer:g.shA,tol:1,display:fmt(Math.round(g.shA))},{label:'Total allocated to B (salary + interest + share) (£)',answer:g.sal+g.iB+g.shB,tol:1,display:fmt(Math.round(g.sal+g.iB+g.shB))}],explain:`Interest: ${money(g.iA)} + ${money(g.iB)}. Residual = ${money(g.profit)} − ${money(g.sal)} − ${money(g.iA+g.iB)} = ${money(g.res)}. A gets ${g.ratio[0]}/${g.ratio[0]+g.ratio[1]}; B gets the salary, B’s interest and ${g.ratio[1]}/${g.ratio[0]+g.ratio[1]} of the residual.`};}),
 gen(()=>{const o=rint(-10,20)*500,s=rint(0,15)*1000,i=rint(1,8)*500,p=rint(20,60)*1000,d=rint(15,60)*1000;const c=o+s+i+p-d;return {type:'fields',prompt:`<p>A partner’s current account had an opening balance of ${o>=0?money(o)+' credit':money(-o)+' debit'}. During the year: salary ${money(s)}, interest on capital ${money(i)}, share of residual profit ${money(p)}, drawings ${money(d)}. Enter a debit balance as a negative number or in brackets.</p>`,fields:[{label:'Closing balance (£, credit positive)',answer:c,display:fmt(c)}],explain:`${fmt(o)} + ${fmt(s)} + ${fmt(i)} + ${fmt(p)} − ${fmt(d)} = ${fmt(c)}. ${c<0?'A debit balance means the partner has taken out more than their share, so they owe the firm.':'A credit balance is owed by the firm to the partner.'}`};}),
 gen(()=>{const pool=[['Partner’s salary','Credit'],['Interest on capital','Credit'],['Share of residual profit','Credit'],['Drawings','Debit'],['Interest on drawings','Debit'],['Share of a loss','Debit']];return {type:'classify',prompt:'<p>Which side of the partner’s current account does each item go on?</p>',options:['Debit','Credit'],items:shuffle(pool).map(([l,a])=>({label:l,answer:a})),explain:'Anything the partner earns from the firm is a credit. Anything taken out or charged to the partner is a debit.'};}),
 mcqPool([
  {q:'There is no partnership agreement. How are profits shared under the Partnership Act 1890?',options:['Equally, with no salaries or interest on capital','In the ratio of capital put in','In the ratio of hours worked','Equally, but with 5% interest on capital'],why:'Without an agreement, partners share equally. The only interest is 5% on loans partners make to the firm.'},
  {q:'A partner’s salary is recorded as:',options:['An appropriation of profit, credited to the current account','An expense in the income statement','A liability in the statement of financial position','A debit to the partner’s capital account'],why:'Partners aren’t employees, so their salaries are a way of sharing profit, not an expense.'},
  {q:'Why do partners often keep fixed capital accounts plus current accounts?',options:['So the agreed capital stays the same and day-to-day items go through the current account','Because the law requires three accounts per partner','To avoid paying tax','So that drawings don’t need recording'],why:'It separates long-term investment from profit shares and drawings, which makes interest on capital easy to calculate.'}])
]});

/* ---------- Incomplete records ---------- */
TOPICS.push({id:'incomplete',level:'f',title:'Incomplete records',blurb:'Preparing accounts when a business hasn’t kept full books: net assets, control accounts, cash and mark-ups.',
lesson:`<p>Many small businesses do not keep full double-entry records. They may only have bank statements, invoices and a count of their stock. The accountant works out the missing figures. Each method uses something that must balance, and the one missing number is the amount that makes it balance.</p>
<h3>Method 1: Profit from net assets</h3>
<p>Use this when you know the net assets (assets minus liabilities) at the start and end of the year.</p>
<div class="formula">Profit = Closing net assets − Opening net assets + Drawings − New capital put in</div>
<p><b>Example:</b> Closing net assets £30,000 − Opening net assets £25,000 + Drawings £12,000 − New capital £0 = Profit £17,000.</p>
<h3>Method 2: Missing credit sales or purchases</h3>
<p>For money customers owe: Opening receivables + Credit sales − Cash received − Discounts − Irrecoverable debts = Closing receivables. Move the figures round to find credit sales:</p>
<div class="formula">Credit sales = Closing receivables + Cash received + Discounts + Irrecoverable debts − Opening receivables</div>
<p><b>Example:</b> Closing £3,000 + Cash received £40,000 − Opening £2,500 = Credit sales £40,500.</p>
<p>Purchases work the same way, using money owed to suppliers (payables).</p>
<h3>Method 3: Missing figures in the cash account</h3>
<p>Opening cash + Cash in − Cash out = Closing cash. If drawings or cash sales were not recorded, they are the missing figure.</p>
<h3>Method 4: Mark-up and margin</h3>
<ul><li><b>Mark-up</b> is profit as a percentage of <b>cost</b>. A 25% mark-up means Sales = Cost × 1.25. <b>Example:</b> Cost £800 → Sales £1,000.</li><li><b>Margin</b> is profit as a percentage of <b>sales</b>. A 20% margin means Cost = Sales × 0.80. <b>Example:</b> Sales £1,000 → Cost £800.</li></ul>
<div class="formula">A mark-up of m% on cost = a margin of m ÷ (100 + m) on sales</div>
<p>This lets you work out cost of sales from sales. Then you can work out how much inventory there should be. Compare it with the real count to find the value of stock lost in a fire or theft.</p>`,
example:`<p><b>Profit from net assets.</b> Opening net assets £42,000; closing net assets £55,000; drawings £18,000; capital introduced £5,000.</p>
<p>Profit = 55,000 − 42,000 + 18,000 − 5,000 = <b>£26,000</b>.</p>
<p><b>Stock lost in a fire.</b> Sales £120,000 at a 25% mark-up. Opening inventory £14,000, purchases £98,000. After the fire, £6,000 of stock was saved.</p>
${sTable(['Working','£'],[['Cost of sales = 120,000 × 100/125','96,000'],['Expected closing inventory = 14,000 + 98,000 − 96,000','16,000'],['Less: Stock saved','(6,000)'],['<b>Stock lost in the fire</b>','<b>10,000</b>']],[1])}`,
practice:[
 gen(()=>{const o=rint(20,80)*1000,p=rint(10,50)*1000,d=rint(8,40)*1000,ci=Math.random()<.5?rint(1,10)*1000:0;const c=o+p-d+ci;return {type:'fields',prompt:`<p>A trader’s net assets were ${money(o)} at the start of the year and ${money(c)} at the end. Drawings were ${money(d)}${ci?`, and they paid in extra capital of ${money(ci)}`:''}.</p>`,fields:[{label:'Profit for the year (£)',answer:p}],explain:`Profit = ${money(c)} − ${money(o)} + ${money(d)}${ci?` − ${money(ci)}`:''} = ${money(p)}. Drawings are added back because they reduced net assets without being a cost. New capital is taken off because it increased net assets without being profit.`};}),
 gen(()=>{const o=rint(5,30)*500,cl=rint(5,30)*500,r=rint(80,300)*500,da=rint(0,10)*50,bd=rint(0,10)*100;const s=cl+r+da+bd-o;return {type:'fields',prompt:`<p>Receivables were ${money(o)} at the start of the year and ${money(cl)} at the end. Cash received from customers was ${money(r)}, discounts allowed ${money(da)} and irrecoverable debts written off ${money(bd)}.</p>`,fields:[{label:'Credit sales for the year (£)',answer:s}],explain:`Credit sales = ${money(cl)} + ${money(r)} + ${money(da)} + ${money(bd)} − ${money(o)} = ${money(s)}.`};}),
 gen(()=>{const m=pick([20,25,33.33,50]),mk=m===33.33?100/3:m,cos=rint(40,200)*1000,sales=Math.round(cos*(1+mk/100)),oi=rint(5,30)*1000,pur=cos+rint(1-Math.floor(oi/1000),10)*1000,ci=oi+pur-cos,saved=rint(0,Math.floor(Math.max(ci,1000)*.5/500))*500;return {type:'fields',prompt:`<p>A shop sells at a mark-up of ${m===33.33?'33⅓':m}% on cost. Sales were ${money(sales)}. Opening inventory was ${money(oi)} and purchases ${money(pur)}. A fire destroyed the stock, except ${money(saved)} that was saved.</p>`,fields:[{label:'Cost of sales (£)',answer:cos,tol:1},{label:'Closing inventory that should have been held (£)',answer:ci,tol:1},{label:'Stock lost in the fire (£)',answer:ci-saved,tol:1}],explain:`Cost of sales = ${money(sales)} × 100/${m===33.33?'133⅓':100+m} = ${money(cos)}. Expected inventory = ${money(oi)} + ${money(pur)} − ${money(cos)} = ${money(ci)}. Less the ${money(saved)} saved = ${money(ci-saved)} lost.`};}),
 gen(()=>{const o=rint(1,10)*100,t=rint(200,600)*100,e=rint(20,80)*100,bk=rint(100,Math.floor((t-e)/100)-10)*100,cl=rint(1,10)*100;const d=o+t-e-bk-cl;return {type:'fields',prompt:`<p>A café owner starts the year with ${money(o)} in the till. Cash takings for the year were ${money(t)}. Cash paid for expenses was ${money(e)}, and ${money(bk)} was paid into the bank. ${money(cl)} is in the till at the year end. The rest was taken as drawings.</p>`,fields:[{label:'Cash drawings (£)',answer:d}],explain:`Drawings are the balancing figure: ${money(o)} + ${money(t)} − ${money(e)} − ${money(bk)} − ${money(cl)} = ${money(d)}.`};}),
 mcqPool([
  {q:'A mark-up of 25% on cost is the same as a margin on sales of:',options:['20%','25%','33⅓%','15%'],why:'Profit of 25 on a cost of 100 gives sales of 125, and 25 ÷ 125 = 20%.'},
  {q:'Why are drawings added back when working out profit from net assets?',options:['They reduced net assets but aren’t a business cost','They are a business expense','They increase net assets','Because the tax rules say so'],why:'Without drawings, closing net assets would have been higher by that amount, so they are added back.'},
  {q:'Receipts from customers and receivables balances are known. What can you work out?',options:['Credit sales','Purchases','Drawings','Depreciation'],why:'A receivables control account links opening balance, credit sales, receipts and closing balance, so the one unknown can be found.'}])
]});
/* ================= IFRS DEPTH (2) ================= */
const IFRS2_ACCTS=IFRS_ACCTS.concat(['Provisions','Warranty expense','Legal costs','Property','Retained earnings','Intangible assets','Development costs','Research expense','Amortisation expense','Accumulated amortisation']);

/* ---------- IAS 37 ---------- */
TOPICS.push({id:'ias37',level:'y3',title:'IAS 37: Provisions and contingencies',blurb:'When to recognise a provision, how to measure it, and when to disclose a contingent liability instead.',
lesson:`<p>A <b>provision</b> is a liability where the amount or the timing is not certain. Examples: warranty repairs, a court case, cleaning up a site.</p>
<h3>When to include a provision</h3>
<p>All three must be true:</p>
<ol><li>There is an <b>obligation now</b> (legal or constructive) because of something that has <b>already happened</b>.</li><li>It is <b>probable</b> (more likely than not) that money will be paid.</li><li>The amount can be <b>estimated reliably</b>.</li></ol>
<p>A <b>legal</b> obligation comes from a contract or the law. A <b>constructive</b> obligation comes from the company’s own behaviour. <b>Example:</b> A shop has a published policy of refunding goods for any reason. It does not have to by law, but customers expect it. So it has a constructive obligation.</p>
<h3>Provision, a note, or nothing?</h3>
${sTable(['How likely is a payment?','What to do'],[['Probable (over 50%) and can be estimated','Include a provision in the figures'],['Possible, but not probable','Describe it in the notes as a contingent liability'],['Remote (very unlikely)','Nothing'],['Money coming in (contingent asset): virtually certain','Include the asset'],['Money coming in (contingent asset): probable','Describe it in the notes only']])}
<h3>How much to provide</h3>
<ul><li>Use the <b>best estimate</b> of the cost to settle it.</li><li>For many similar items, such as warranties, use the <b>expected value</b>: each outcome × its probability, added up.</li><li>For one single obligation, use the <b>most likely outcome</b>.</li><li>If it will be paid a long time in the future, <b>discount</b> it to present value. Each year, the discount unwinds, and this is a finance cost.</li></ul>
<p><b>Example (expected value):</b> 1,000 items sold. 80% will have no fault. 15% will need a £50 repair. 5% will need a £200 repair. Per item: (15% × £50) + (5% × £200) = £7.50 + £10 = £17.50. Provision = 1,000 × £17.50 = £17,500.</p>
<h3>Special cases</h3>
<ul><li><b>Future operating losses:</b> no provision. Nothing has happened yet, so there is no past event.</li><li><b>Onerous contracts</b> (the costs you cannot avoid are more than the benefit): provide for the loss.</li><li><b>Restructuring:</b> provide only when there is a detailed formal plan <b>and</b> it has been announced to the people affected. A board decision on its own is not enough.</li></ul>`,
example:`<p>A company sold 1,000 appliances with a one-year warranty. Past experience shows that 80% will need no repairs, 15% will need minor repairs costing £50, and 5% will need major repairs costing £300.</p>
${sTable(['Outcome','Units','Cost each £','Expected cost £'],[['No repairs (80%)','800','0','0'],['Minor repairs (15%)','150','50','7,500'],['Major repairs (5%)','50','300','15,000'],['<b>Warranty provision</b>','','','<b>22,500</b>']],[1,2,3])}
${sJournal([{lines:[['Warranty expense',22500,0],['Provisions',0,22500]],narr:'Warranty provision for appliances sold in the year'}])}`,
practice:[
 gen(()=>{const n=rint(5,50)*100,pM=pick([10,15,20]),pX=pick([2,4,5]),cM=rint(2,10)*10,cX=rint(15,50)*20;const e=n*(pM/100*cM+pX/100*cX);return {type:'fields',prompt:`<p>A company sold ${fmt(n)} products with a warranty. It expects ${pM}% to need minor repairs at ${money(cM)} each and ${pX}% to need major repairs at ${money(cX)} each. The rest need no repairs.</p>`,fields:[{label:'Warranty provision (£)',answer:e,tol:1}],explain:`Expected value = ${fmt(n)} × (${pM}% × ${money(cM)} + ${pX}% × ${money(cX)}) = ${money(Math.round(e))}.`};}),
 gen(()=>{const pool=[['Lawyers say the company will probably lose a court case and pay about £200,000','Provision'],['Lawyers say a claim against the company is possible, but unlikely to succeed','Disclose'],['A claim is threatened, but lawyers say the chance of losing is remote','Nothing'],['The board has decided to close a factory next year, but has told no one','Nothing'],['Losses are expected from a division next year','Nothing'],['The law requires the company to clean up pollution it has already caused','Provision'],['The company has always refunded unhappy customers, although the law doesn’t require it','Provision'],['A restructuring plan has been approved in detail and announced to staff','Provision']];return {type:'classify',prompt:'<p>How should each situation be treated at the year end?</p>',options:['Provision','Disclose','Nothing'],items:pickN(pool,6).map(([l,a])=>({label:l,answer:a})),explain:'A provision needs a present obligation from a past event, a probable outflow and a reliable estimate. If the outflow is only possible, disclose a contingent liability. If it is remote, do nothing. Future losses and restructuring plans nobody has been told about are not obligations.'};}),
 gen(()=>{const C=rint(20,200)*10000,n=pick([3,5,8,10]),r=pick([5,6,8]);const pv=C/Math.pow(1+r/100,n);return {type:'fields',prompt:`<p>A company must dismantle a facility in ${n} years at an estimated cost of ${money(C)}. The discount rate is ${r}%. Round to the nearest £.</p>`,fields:[{label:'Provision today, at present value (£)',answer:pv,tol:1,display:fmt(Math.round(pv))},{label:'Finance cost from unwinding the discount in year 1 (£)',answer:pv*r/100,tol:1,display:fmt(Math.round(pv*r/100))}],explain:`PV = ${money(C)} ÷ ${(1+r/100).toFixed(2)}^${n} = ${money(Math.round(pv))}. Each year the provision grows by ${r}% (the unwinding), which is charged as a finance cost. By year ${n} the provision reaches ${money(C)}.`};}),
 gen(()=>{const x=rint(10,200)*1000;return {type:'journal',prompt:`<p>Lawyers advise that the company will probably have to pay ${money(x)} to settle a claim from a former supplier. Record the provision.</p>`,accounts:IFRS2_ACCTS,answer:[['Legal costs',x,0],['Provisions',0,x]],explain:'The expense goes to profit or loss, and the provision is a liability until the claim is settled.'};}),
 mcqPool([
  {q:'When is a contingent asset recognised in the statement of financial position?',options:['Only when it is virtually certain','When it is probable','When it is possible','Never'],why:'Recognition needs near-certainty, so a probable asset is only disclosed. When it becomes virtually certain, it is no longer contingent.'},
  {q:'A constructive obligation arises from:',options:['The company’s published policies or past practice creating a valid expectation','A signed contract only','A board decision that hasn’t been announced','Future plans to spend money'],why:'The company’s own conduct can create an obligation that customers or others expect it to meet.'},
  {q:'Why can’t a company provide for next year’s expected operating losses?',options:['There is no present obligation from a past event','Because they can’t be estimated','Because they are too small','Because they are tax deductible'],why:'The losses depend on future trading. No past event has created an obligation.'}])
]});

/* ---------- IAS 16 ---------- */
TOPICS.push({id:'ias16',level:'y3',title:'IAS 16: Property, plant and equipment',blurb:'What goes into cost, depreciation by component, and the revaluation model step by step.',
lesson:`<p>IAS 16 covers property, plant and equipment: physical assets kept and used for more than one year.</p>
<h3>What goes into cost</h3>
${sTable(['Include in cost','Do not include (treat as an expense)'],[['Purchase price, including import duties, minus discounts','Staff training'],['Delivery and handling','General office costs and overheads'],['Preparing the site and installing the asset','Advertising a new product'],['Testing that the asset works','Costs of opening a new site'],['Professional fees, such as architects','Maintenance contracts'],['Estimated cost of taking the asset down at the end (as a provision)','Losses while the business waits for customers to build up']])}
<h3>Depreciation</h3>
<ul><li>Depreciate over the useful life, down to the residual value. Check both at least once a year.</li><li>If a large part has a different life, depreciate it separately. This is called a <b>component</b>. <b>Example:</b> an aircraft’s engines and its body.</li><li>Land is usually not depreciated.</li></ul>
<h3>The revaluation model</h3>
<p>A company can choose to show a whole class of assets (for example, all its buildings) at fair value. The values must be kept up to date.</p>
<ol><li><b>Value goes up:</b> the gain goes to other comprehensive income, into the revaluation surplus. If it reverses an earlier loss that went to profit, that part goes to profit.</li><li><b>Depreciation after revaluing</b> is based on the new value over the remaining life.</li><li><b>Excess depreciation</b> is the new depreciation minus the depreciation based on the original cost. Each year, the company may move this amount from the revaluation surplus to retained earnings. It does not go through profit or loss.</li><li><b>Value goes down:</b> take the loss off any surplus for that asset first. Any amount left over goes to profit or loss.</li><li><b>Selling the asset:</b> profit or loss = money received − carrying amount. Move any surplus left to retained earnings.</li></ol>
<p><b>Example:</b> A building cost £100,000 with a 20-year life, so depreciation is £5,000 a year. After 10 years its carrying amount is £50,000. It is revalued to £80,000. Revaluation surplus = £80,000 − £50,000 = £30,000. New depreciation = £80,000 ÷ 10 years left = £8,000. Excess depreciation = £8,000 − £5,000 = £3,000 a year, moved from the surplus to retained earnings.</p>`,
example:`<p>A building cost £500,000 ten years ago and has a 50-year life (£10,000 a year). Its carrying amount is now £400,000. It is revalued to £600,000. The remaining life is still 40 years.</p>
${sTable(['Working','£'],[['Carrying amount (500,000 − 100,000)','400,000'],['Fair value','600,000'],['<b>Revaluation surplus (to OCI)</b>','<b>200,000</b>'],['New annual depreciation (600,000 ÷ 40)','15,000'],['Depreciation based on cost','10,000'],['<b>Excess depreciation transferred to retained earnings each year</b>','<b>5,000</b>']],[1])}
${sJournal([{lines:[['Accumulated depreciation',100000,0],['Property',100000,0],['Revaluation surplus',0,200000]],narr:'Revaluation of building to fair value of £600,000'}])}`,
practice:[
 gen(()=>{const items=[['Purchase price',rint(20,120)*1000,1],['Delivery',rint(5,40)*100,1],['Installation',rint(10,60)*100,1],['Testing before use',rint(5,30)*100,1],['Staff training on the new machine',rint(5,30)*100,0],['Three-year maintenance contract',rint(10,50)*100,0],['Share of general admin costs',rint(5,30)*100,0]];const pick6=pickN(items,6);if(!pick6.some(x=>x[0]==='Purchase price'))pick6[0]=items[0];const tot=pick6.filter(x=>x[2]).reduce((t,x)=>t+x[1],0);return {type:'fields',prompt:`<p>A company buys a machine. Which costs can be capitalised?</p>${sTable(['Cost','£'],pick6.map(x=>[x[0],fmt(x[1])]),[1])}`,fields:[{label:'Cost of the machine to capitalise (£)',answer:tot}],explain:`Only costs needed to get the asset ready for use are capitalised: ${pick6.filter(x=>x[2]).map(x=>x[0].toLowerCase()).join(', ')}. Training, maintenance and general overheads are expenses.`};}),
 gen(()=>{const cost=rint(20,100)*10000,life=pick([20,25,40,50]),yrs=rint(3,10),dep=cost/life,ca=cost-dep*yrs,fv=Math.round(ca*rint(115,160)/100/10000)*10000,rem=life-yrs;const nd=fv/rem;return {type:'fields',prompt:`<p>A building cost ${money(cost)} and is depreciated over ${life} years on a straight-line basis. After ${yrs} years it is revalued to ${money(fv)}. The remaining life is unchanged. Round to the nearest £.</p>`,fields:[{label:'Carrying amount before revaluation (£)',answer:ca},{label:'Revaluation surplus (£)',answer:fv-ca},{label:'New annual depreciation (£)',answer:nd,tol:1,display:fmt(Math.round(nd))},{label:'Excess depreciation transferred each year (£)',answer:nd-dep,tol:1,display:fmt(Math.round(nd-dep))}],explain:`Carrying amount = ${money(cost)} − ${yrs} × ${money(dep)} = ${money(ca)}. Surplus = ${money(fv)} − ${money(ca)}. New depreciation = ${money(fv)} ÷ ${rem} years = ${money(Math.round(nd))}. Excess over the ${money(dep)} based on cost = ${money(Math.round(nd-dep))}.`};}),
 gen(()=>{const S=rint(2,20)*5000,L=rint(1,Math.floor(S/5000)*2+4)*5000;const oci=Math.min(S,L),pl=Math.max(0,L-S);return {type:'fields',prompt:`<p>A property has a revaluation surplus of ${money(S)}. This year its value falls by ${money(L)}.</p>`,fields:[{label:'Loss charged against the revaluation surplus (OCI) (£)',answer:oci},{label:'Loss charged to profit or loss (£)',answer:pl}],explain:`The fall uses up the surplus first (${money(oci)}). ${pl?`The remaining ${money(pl)} is an expense in profit or loss.`:'The surplus covers all of it, so nothing goes to profit or loss.'}`};}),
 gen(()=>{const cost=rint(20,80)*10000,ad=rint(2,10)*10000,fv=cost+rint(1,20)*10000;return {type:'journal',prompt:`<p>A building cost ${money(cost)} and has accumulated depreciation of ${money(ad)}. It is revalued to ${money(fv)}. Record the revaluation by removing the accumulated depreciation and restating the asset.</p>`,accounts:IFRS2_ACCTS,answer:[['Accumulated depreciation',ad,0],['Property',fv-cost,0],['Revaluation surplus',0,fv-cost+ad]],explain:`The accumulated depreciation of ${money(ad)} is removed, and the property account rises from ${money(cost)} to ${money(fv)}. The surplus is fair value minus carrying amount: ${money(fv)} − ${money(cost-ad)} = ${money(fv-cost+ad)}.`};}),
 mcqPool([
  {q:'Excess depreciation transferred from the revaluation surplus to retained earnings:',options:['Goes directly between reserves, not through profit or loss','Is income in profit or loss','Reduces the depreciation charge','Is recorded in OCI'],why:'It moves realised surplus into retained earnings. Profit or loss still carries the full depreciation on the revalued amount.'},
  {q:'Which cost should NOT be capitalised as part of a new machine?',options:['Training staff to use it','Delivery','Installation','Testing'],why:'Training benefits the staff, not the asset, so it is an expense.'},
  {q:'An aircraft’s engines need replacing every 8 years, and the body lasts 25 years. How should it be depreciated?',options:['Separately, as components with different useful lives','Over 25 years as one asset','Over 8 years as one asset','Not at all'],why:'IAS 16 requires significant parts with different lives to be depreciated separately.'}])
]});

/* ---------- IAS 38 ---------- */
TOPICS.push({id:'ias38',level:'y3',title:'IAS 38: Intangible assets',blurb:'Recognising intangibles, research versus development, and amortisation.',
lesson:`<p>An <b>intangible asset</b> has no physical form but can be identified separately. It is not money. Examples: software, patents, licences, customer lists.</p>
<h3>When to include one</h3>
<p>Include it when it will probably bring money in and its cost can be measured reliably.</p>
<ul><li><b>Bought on its own, or as part of buying a business:</b> usually included.</li><li><b>Brands, customer lists and goodwill the company built itself:</b> never included. Their cost cannot be separated from the cost of running the business as a whole.</li></ul>
<h3>Research and development</h3>
<ul><li><b>Research</b> (looking for new knowledge): always an expense.</li><li><b>Development</b> (using that knowledge to make a specific product or process): becomes an asset from the date <b>all six</b> conditions below are met. Before that date, it is an expense.</li></ul>
${sTable(['Condition (PIRATE)','What it means'],[['Probable future benefits','There is a market for it, or it will be useful inside the business'],['Intention to complete','The company plans to finish it and use or sell it'],['Resources available','There is enough money and staff to finish it'],['Ability to use or sell','The company is able to use or sell the result'],['Technically feasible','It can be made to work'],['Expenditure measurable','The costs can be measured reliably']])}
<p><b>Example:</b> A company spends £30,000 from January to March. All six conditions are met on 1 April. It then spends £90,000 from April to December. Expense = £30,000. Asset = £90,000.</p>
<h3>After it is included</h3>
<ul><li><b>Finite life</b> (it has an end date): amortise it (spread the cost) over its useful life, starting when it is ready to use. <b>Example:</b> £90,000 over 5 years = £18,000 a year.</li><li><b>Indefinite life</b> (no end date): do not amortise it, but test it for impairment every year.</li><li>The revaluation model is only allowed if there is an <b>active market</b> with published prices. This is rare for intangible assets.</li></ul>`,
example:`<p>A company spends £40,000 on research into new materials from January to March. From April it spends £120,000 developing a product. All the PIRATE criteria are met from 1 July. Development costs were spread evenly (£20,000 a month).</p>
${sTable(['Cost','£','Treatment'],[['Research, January to March','40,000','Expense'],['Development, April to June','60,000','Expense (criteria not yet met)'],['Development, July to September','60,000','Capitalise'],['<b>Total expensed</b>','<b>100,000</b>',''],['<b>Total capitalised</b>','<b>60,000</b>','Amortise once the product is available for use']],[1])}`,
practice:[
 gen(()=>{const R=rint(10,80)*1000,m=rint(2,20)*1000,before=rint(1,5),after=rint(2,8);const D1=m*before,D2=m*after;return {type:'fields',prompt:`<p>A company spends ${money(R)} on research. It then spends ${money(m)} a month on development for ${before+after} months. All the capitalisation criteria were met after the first ${before} month${before>1?'s':''} of development.</p>`,fields:[{label:'Total expensed (£)',answer:R+D1},{label:'Total capitalised (£)',answer:D2}],explain:`Research (${money(R)}) is always an expense. Development before the criteria are met (${before} × ${money(m)} = ${money(D1)}) is also an expense. The remaining ${after} months (${money(D2)}) are capitalised.`};}),
 gen(()=>{const C=rint(12,120)*1000,n=pick([3,4,5,8]),mth=rint(1,12);const am=C/n*(13-mth)/12;return {type:'fields',prompt:`<p>Capitalised development costs of ${money(C)} relate to a product that became available for use on 1 ${MONTHS[mth-1]}. The useful life is ${n} years and the year end is 31 December. Round to the nearest £.</p>`,fields:[{label:'Amortisation this year (£)',answer:am,tol:1,display:fmt(Math.round(am))},{label:'Carrying amount at 31 December (£)',answer:C-am,tol:1,display:fmt(Math.round(C-am))}],explain:`Annual amortisation = ${money(C)} ÷ ${n} = ${money(C/n)}. It starts when the product is available for use, so this year gets ${13-mth}/12 of it: ${money(Math.round(am))}.`};}),
 gen(()=>{const pool=[['A patent bought from another company','Recognise'],['A brand the company built up itself over 20 years','Expense'],['A customer list bought from a competitor','Recognise'],['Training staff on new systems','Expense'],['Development costs after all the criteria are met','Recognise'],['Research into new materials','Expense'],['An advertising campaign','Expense'],['A software licence bought for the finance team','Recognise']];return {type:'classify',prompt:'<p>Recognise as an intangible asset, or expense?</p>',options:['Recognise','Expense'],items:pickN(pool,6).map(([l,a])=>({label:l,answer:a})),explain:'Purchased intangibles and development costs that meet the criteria are recognised. Research, training, advertising and internally built brands are expenses.'};}),
 mcqPool([
  {q:'An intangible asset with an indefinite useful life is:',options:['Not amortised, but tested for impairment every year','Amortised over 20 years','Amortised over 5 years','Written off immediately'],why:'Without a foreseeable end to its life there is nothing to amortise over, so an annual impairment test protects its carrying amount.'},
  {q:'When can intangible assets be revalued under IAS 38?',options:['Only if there is an active market for them','Whenever the directors choose','Every three years','Never'],why:'An active market with similar items and available prices is rare for intangibles, so revaluation is uncommon.'},
  {q:'Which is NOT one of the criteria for capitalising development costs?',options:['The project has already made a profit','It is technically feasible','The company intends to complete it','The costs can be measured reliably'],why:'The criteria look forward to probable benefits. Past profits aren’t required.'}])
]});
/* ================= IFRS DEPTH (3) ================= */
const IFRS3_ACCTS=IFRS2_ACCTS.concat(['Right-of-use asset','Lease liability']);
const annuity=(r,n)=>(1-Math.pow(1+r,-n))/r;

/* ---------- IFRS 16 ---------- */
TOPICS.push({id:'ifrs16',level:'y3',title:'IFRS 16: Lease calculations',blurb:'Measuring the lease liability and right-of-use asset, and building the liability table year by year.',
lesson:`<p>Under IFRS 16, the company using a leased asset (the <b>lessee</b>) puts almost every lease on its balance sheet. It records a <b>right-of-use asset</b> and a <b>lease liability</b>.</p>
<h3>Exemptions</h3>
<p>The lessee can choose not to do this for two types of lease: <b>short-term leases</b> (12 months or less, with no option to buy) and <b>low-value assets</b> (such as laptops or phones). For these, the payments are an expense, spread evenly over the lease.</p>
<h3>At the start of the lease</h3>
<div class="formula">Lease liability = Present value of the lease payments not yet paid</div>
<p>Use the interest rate in the lease. If that is not known, use the rate the lessee would pay to borrow the money. For equal payments made at the end of each year: present value = payment × annuity factor. The annuity factor = (1 − (1 + r)<sup>−n</sup>) ÷ r, where r is the interest rate and n is the number of payments.</p>
<div class="formula">Right-of-use asset = Lease liability + Payments made at or before the start + Direct costs of setting up the lease + Cost of removing the asset at the end − Incentives received</div>
<h3>After the start</h3>
<ul><li><b>Liability:</b> add interest and take off the payments.
<ul><li>Payments at the end of the year (in arrears): closing = opening + interest − payment.</li><li>Payments at the start of the year (in advance): take off the payment first, then add interest on what is left.</li></ul></li>
<li><b>Right-of-use asset:</b> depreciate it over the lease term or the useful life, whichever is shorter. If the lessee will own the asset at the end, use the useful life.</li>
<li><b>Profit or loss</b> shows depreciation and interest. It does not show rent.</li></ul>
<p><b>Example:</b> 3 payments of £10,000 at the end of each year. Rate 5%. Annuity factor = 2.7232. Liability at the start = £10,000 × 2.7232 = £27,232. Year 1: £27,232 + interest £1,362 − £10,000 = £18,594. Year 2: £18,594 + £930 − £10,000 = £9,524.</p>
<h3>Current and non-current</h3>
<p>The part of the liability paid off in the next 12 months is current. A quick way to find it: this year’s closing balance − next year’s closing balance. <b>Example:</b> £18,594 − £9,524 = £9,070 current. The other £9,524 is non-current.</p>`,
example:`<p>A company leases a machine for 5 years. It pays £10,000 a year in arrears. The interest rate implicit in the lease is 6%. It paid £1,000 of legal fees to set up the lease. The machine’s useful life is 7 years.</p>
${sTable(['Working','£'],[['Annuity factor, 5 years at 6%','4.2124'],['Lease liability (10,000 × 4.2124)','42,124'],['Add: Initial direct costs','1,000'],['<b>Right-of-use asset</b>','<b>43,124</b>'],['Depreciation over the 5-year lease term','8,625 a year']],[1])}
${sTable(['Year','Opening £','Interest at 6% £','Payment £','Closing £'],[['1','42,124','2,527','(10,000)','34,651'],['2','34,651','2,079','(10,000)','26,730']],[1,2,3,4])}
<p>At the end of year 1: non-current liability £26,730, current liability £34,651 − £26,730 = £7,921.</p>
${sJournal([{lines:[['Right-of-use asset',43124,0],['Lease liability',0,42124],['Cash',0,1000]],narr:'Recognition of the machine lease at commencement'}])}`,
practice:[
 gen(()=>{const P=rint(5,50)*1000,n=pick([3,4,5,6,8]),r=pick([4,5,6,7,8]);const pv=P*annuity(r/100,n);return {type:'fields',prompt:`<p>A lease requires ${n} annual payments of ${money(P)} in arrears. The interest rate implicit in the lease is ${r}%. Round to the nearest £.</p>`,fields:[{label:'Annuity factor (4 decimal places)',answer:annuity(r/100,n),tol:0.0006,display:annuity(r/100,n).toFixed(4)},{label:'Initial lease liability (£)',answer:pv,tol:3,display:fmt(Math.round(pv))}],explain:`Annuity factor = (1 − 1.${String(r).padStart(2,'0')}^−${n}) ÷ 0.${String(r).padStart(2,'0')} = ${annuity(r/100,n).toFixed(4)}. Liability = ${money(P)} × ${annuity(r/100,n).toFixed(4)} = ${money(Math.round(pv))}.`};}),
 gen(()=>{const L=rint(30,200)*1000,idc=rint(0,10)*500,adv=Math.random()<.4?rint(5,20)*1000:0,inc=Math.random()<.4?rint(1,10)*500:0,n=pick([4,5,8,10]),life=n+rint(-2,5);const rou=L+idc+adv-inc,term=Math.min(n,life);return {type:'fields',prompt:`<p>A lease liability is ${money(L)}. The lessee paid initial direct costs of ${money(idc)}${adv?`, made a payment of ${money(adv)} on the first day`:''}${inc?`, and received a lease incentive of ${money(inc)} from the lessor`:''}. The lease term is ${n} years and the asset’s useful life is ${life} years. Ownership doesn’t pass to the lessee.</p>`,fields:[{label:'Right-of-use asset (£)',answer:rou},{label:'Annual depreciation (£)',answer:rou/term,tol:1,display:fmt(Math.round(rou/term))}],explain:`ROU asset = ${money(L)} + ${money(idc)}${adv?` + ${money(adv)}`:''}${inc?` − ${money(inc)}`:''} = ${money(rou)}. Depreciate over the shorter of the lease term (${n}) and useful life (${life}): ${term} years.`};}),
 gen(()=>{const L=rint(30,150)*1000,r=pick([5,6,7,8]),P=Math.round(L/rint(3,6)/100)*100+rint(1,20)*100;const i1=L*r/100,c1=L+i1-P,i2=c1*r/100,c2=c1+i2-P;return {type:'fields',prompt:`<p>A lease liability starts at ${money(L)}. Payments of ${money(P)} are made at the end of each year, and the interest rate is ${r}%. Round to the nearest £.</p>`,fields:[{label:'Year 1 interest (£)',answer:i1,tol:1,display:fmt(Math.round(i1))},{label:'Year 1 closing liability (£)',answer:c1,tol:1,display:fmt(Math.round(c1))},{label:'Year 2 closing liability (£)',answer:c2,tol:2,display:fmt(Math.round(c2))},{label:'Current liability at the end of year 1 (£)',answer:c1-c2,tol:2,display:fmt(Math.round(c1-c2))}],explain:`Year 1: ${money(L)} + ${money(Math.round(i1))} − ${money(P)} = ${money(Math.round(c1))}. Year 2 repeats on that balance, giving ${money(Math.round(c2))}. The current part is what will be paid off in year 2: ${money(Math.round(c1))} − ${money(Math.round(c2))}.`};}),
 gen(()=>{const L=rint(20,150)*1000,idc=rint(1,8)*500;return {type:'journal',prompt:`<p>At the start of a lease, the lease liability is ${money(L)}. The lessee also paid ${money(idc)} of initial direct costs in cash. Record the lease.</p>`,accounts:IFRS3_ACCTS,answer:[['Right-of-use asset',L+idc,0],['Lease liability',0,L],['Cash',0,idc]],explain:`The right-of-use asset includes the liability and the direct costs: ${money(L+idc)}.`};}),
 gen(()=>{const pool=[['Hiring a van for 6 months, with no option to buy','Exempt'],['Leasing a laptop for a new employee','Exempt'],['A 10-year lease of office space','Recognise'],['A 3-year lease of factory machinery','Recognise'],['An 11-month lease of a storage unit, with no option to extend','Exempt'],['A 5-year lease of a company car','Recognise']];return {type:'classify',prompt:'<p>Should the lessee recognise each lease on its balance sheet, or can it use an exemption?</p>',options:['Recognise','Exempt'],items:pickN(pool,5).map(([l,a])=>({label:l,answer:a})),explain:'Only leases of 12 months or less, or leases of low-value assets, can be exempted. Everything else is recognised.'};}),
 mcqPool([
  {q:'A right-of-use asset is depreciated over:',options:['The shorter of the lease term and useful life, unless ownership passes to the lessee','Always the useful life','Always the lease term','50 years'],why:'The lessee only benefits for the lease term, unless it will own the asset at the end.'},
  {q:'For a lease accounted for under IFRS 16, the lessee’s profit or loss shows:',options:['Depreciation and interest','A straight-line rent expense','Only interest','Only depreciation'],why:'Recognising the asset and liability replaces the rent expense with depreciation and interest.'},
  {q:'Which rate discounts the lease payments if the rate implicit in the lease can’t be found?',options:['The lessee’s incremental borrowing rate','The Bank of England base rate','The lessor’s cost of capital','No discounting is done'],why:'The incremental borrowing rate is what the lessee would pay to borrow a similar amount over a similar term.'}])
]});

/* ---------- Consolidated statement of profit or loss ---------- */
function cplGen(){for(;;){const pR=rint(300,900)*1000,sR=rint(100,400)*1000,pC=Math.round(pR*rint(55,70)/100/1000)*1000,sC=Math.round(sR*rint(55,70)/100/1000)*1000,ig=rint(10,Math.floor(sR/4000))*1000,mu=pick([20,25,50]),un=pick([25,40,50]),pE=rint(40,120)*1000,sE=rint(10,50)*1000,pT=rint(10,40)*1000,sT=rint(5,20)*1000,nci=pick([10,20,25,30,40]);const purp=Math.round(ig*mu/(100+mu)*un/100);const rev=pR+sR-ig,cos=pC+sC-ig+purp,gp=rev-cos,pat=gp-pE-sE-pT-sT;const sp=sR-sC-sE-sT;if(sp<=0||pat<=0)continue;return {pR,sR,pC,sC,ig,mu,un,pE,sE,pT,sT,nci,purp,rev,cos,gp,pat,sp,nciShare:sp*nci/100};}}
TOPICS.push({id:'consolpl',level:'y3',title:'Consolidated statement of profit or loss',blurb:'Adding parent and subsidiary together, removing intra-group trading and unrealised profit, and splitting profit with the NCI.',
lesson:`<p>The consolidated statement of profit or loss shows the group’s results as if the parent and its subsidiaries were one business.</p>
<h3>Steps</h3>
<ol><li><b>Add together</b> 100% of each line for the parent and the subsidiary. If the subsidiary was bought during the year, only include its results <b>after</b> the date it was bought. Split the year by months if needed.</li><li><b>Remove sales inside the group.</b> Take the amount out of both revenue and cost of sales.</li><li><b>Remove unrealised profit.</b> This is profit on goods sold inside the group that are still in stock at the year end. Add it to cost of sales.</li><li><b>Add other group adjustments</b>, such as goodwill impairment, or extra depreciation because assets were revalued when the subsidiary was bought.</li><li><b>Remove dividends and interest paid inside the group</b>, such as a dividend the subsidiary paid to the parent.</li><li><b>Split the profit</b> between the owners of the parent and the non-controlling interest (NCI).</li></ol>
<div class="formula">NCI share = NCI % × Subsidiary’s profit after tax (after any adjustments that affect the subsidiary)</div>
<h3>Who made the sale matters</h3>
<p>If the <b>parent</b> sold the goods, the unrealised profit belongs to the parent. The NCI share does not change. If the <b>subsidiary</b> sold the goods, take the unrealised profit off the subsidiary’s profit first, then work out the NCI share.</p>
<h3>Working out unrealised profit</h3>
<p>If goods are sold at a mark-up of m% on cost: profit = sales × m ÷ (100 + m). Only the part still in stock is unrealised.</p>
<p><b>Example:</b> The parent sells goods to its subsidiary for £20,000 at a 25% mark-up. Total profit = £20,000 × 25 ÷ 125 = £4,000. One quarter of the goods are still in stock. Unrealised profit = £4,000 × ¼ = £1,000. Remove £20,000 from revenue and cost of sales, then add £1,000 to cost of sales.</p>`,
example:`<p>P owns 80% of S. During the year P sold goods to S for £40,000 at a 25% mark-up, and a quarter of them are still in S’s inventory. Unrealised profit = 40,000 × 25/125 × ¼ = £2,000.</p>
${sTable(['','P £000','S £000','Adjustments £000','Group £000'],[['Revenue','500','200','(40)','660'],['Cost of sales','(300)','(120)','40 − 2','(382)'],['<b>Gross profit</b>','','','','<b>278</b>'],['Operating expenses','(80)','(30)','','(110)'],['Tax','(25)','(12)','','(37)'],['<b>Profit for the year</b>','','','','<b>131</b>']],[1,2,3,4])}
${sTable(['Profit attributable to','£000'],[['NCI: 20% × S’s profit of 38 (200 − 120 − 30 − 12)','7.6'],['Owners of the parent (131 − 7.6)','123.4']],[1])}
<p>P made the sale, so the unrealised profit doesn’t affect the NCI.</p>`,
practice:[
 gen(()=>{const g=cplGen();return {type:'fields',prompt:`<p>P owns ${100-g.nci}% of S. During the year P sold goods to S for ${money(g.ig)} at a ${g.mu}% mark-up on cost. ${g.un}% of these goods are still in S’s inventory.</p>${sTable(['','P £','S £'],[['Revenue',fmt(g.pR),fmt(g.sR)],['Cost of sales',fmt(-g.pC),fmt(-g.sC)]],[1,2])}<p class="hint">Round to the nearest £.</p>`,fields:[{label:'Unrealised profit (£)',answer:g.purp,tol:1},{label:'Consolidated revenue (£)',answer:g.rev},{label:'Consolidated cost of sales (£)',answer:g.cos,tol:1},{label:'Consolidated gross profit (£)',answer:g.gp,tol:1}],explain:`Unrealised profit = ${money(g.ig)} × ${g.mu}/${100+g.mu} × ${g.un}% = ${money(g.purp)}. Revenue = ${money(g.pR)} + ${money(g.sR)} − ${money(g.ig)}. Cost of sales = ${money(g.pC)} + ${money(g.sC)} − ${money(g.ig)} + ${money(g.purp)}.`};}),
 gen(()=>{const sp=rint(20,200)*1000,nci=pick([10,20,25,30,40]),byS=Math.random()<.5,purp=rint(1,10)*500;const adj=byS?sp-purp:sp;return {type:'fields',prompt:`<p>A subsidiary’s profit after tax is ${money(sp)}. The NCI owns ${nci}%. Goods sold ${byS?'by the subsidiary to the parent':'by the parent to the subsidiary'} include unrealised profit of ${money(purp)} at the year end.</p>`,fields:[{label:'Profit attributable to the NCI (£)',answer:adj*nci/100}],explain:byS?`The subsidiary made the sale, so its profit is reduced by the unrealised profit first: ${money(sp)} − ${money(purp)} = ${money(adj)}. NCI share = ${nci}% × ${money(adj)} = ${money(adj*nci/100)}.`:`The parent made the sale, so the subsidiary’s profit is unaffected. NCI share = ${nci}% × ${money(sp)} = ${money(sp*nci/100)}.`};}),
 gen(()=>{const R=rint(12,120)*10000,C=Math.round(R*rint(55,70)/100/10000)*10000,m=rint(2,10);return {type:'fields',prompt:`<p>P bought its subsidiary on 1 ${MONTHS[m]}. The year end is 31 December. For the whole year, the subsidiary’s revenue was ${money(R)} and its cost of sales ${money(C)}, earned evenly across the year.</p>`,fields:[{label:'Subsidiary revenue included in the group (£)',answer:R*(12-m)/12,tol:1,display:fmt(Math.round(R*(12-m)/12))},{label:'Subsidiary cost of sales included (£)',answer:C*(12-m)/12,tol:1,display:fmt(Math.round(C*(12-m)/12))}],explain:`Only the ${12-m} months after acquisition count, so include ${12-m}/12 of each figure.`};}),
 gen(()=>{const pool=[['Sales from the parent to the subsidiary','Remove from revenue and cost of sales'],['Unrealised profit on goods still in group inventory','Add to cost of sales'],['Goodwill impairment for the year','Add to operating expenses'],['Dividend received by the parent from the subsidiary','Remove from investment income'],['Interest the subsidiary paid on a loan from the parent','Remove from investment income']];return {type:'classify',prompt:'<p>How is each item dealt with in the consolidated statement of profit or loss?</p>',options:['Remove from revenue and cost of sales','Add to cost of sales','Add to operating expenses','Remove from investment income'],items:shuffle(pool).map(([l,a])=>({label:l,answer:a})),explain:'Trading, dividends and interest within the group cancel out. Unrealised profit increases cost of sales, and goodwill impairment is an expense. (Intra-group interest is also removed from the payer’s finance costs.)'};}),
 mcqPool([
  {q:'A subsidiary sold goods to its parent, and unrealised profit remains at the year end. How does this affect the NCI?',options:['The NCI share is based on the subsidiary’s profit after deducting the unrealised profit','The NCI share isn’t affected','The NCI bears all of the unrealised profit','The unrealised profit is added to the NCI share'],why:'The subsidiary made the profit, so the NCI shares in the adjustment.'},
  {q:'A subsidiary was bought halfway through the year. How much of its annual profit is consolidated?',options:['Only the half after acquisition','All of it','None of it','The parent’s share of all of it'],why:'The group only includes results earned while it controlled the subsidiary.'},
  {q:'Why is intra-group revenue removed from consolidated revenue?',options:['A group can’t earn revenue by selling to itself','Because it is taxed twice','Because it is always at a loss','Because the NCI owns it'],why:'From the group’s point of view, goods moving between group companies is just a transfer, not a sale.'}])
]});
/* ---------- Simulation 6: payroll ---------- */
TOPICS.push({id:'jobpay',level:'job',title:'Audit: payroll',blurb:'Test a client’s wages: analytical review, a sample of employees, leavers, and the year-end PAYE liability.',
lesson:`<p>Back on the audit of <b>Harbour &amp; Hale Coffee Roasters Ltd</b> (a fictional company), year end <b>31 March 2026</b>. Wages are one of the client’s biggest costs.</p>
${emailBox('Sam (Audit Senior)','You','Harbour & Hale: payroll',`<p>Hi,</p><p>Can you do payroll next? Please:</p><ol><li>Do an analytical review of total wages. Investigate any difference over <b>£25,000</b>.</li><li>Test the March payroll sample against contracts and HR records.</li><li>Check that the year-end PAYE/NIC liability is complete.</li><li>Send me a summary.</li></ol><p>Thanks, Sam</p>`)}
${docH('Document 1: Wages information')}
${sTable(['Item','Last year','This year'],[['Total gross wages per payroll','£1,260,000','£1,452,600'],['Average number of employees','42','45'],['Pay rise from 1 April 2025','–','4% for all staff']])}
${docH('Document 2: March 2026 payroll sample')}
${sTable(['Employee','Gross pay in March £','Annual salary per contract £','HR record'],[['E101 A. Patel','3,250','39,000','Active'],['E117 J. Moore','2,900','33,600','Active; no pay rise approval on file'],['E124 S. Okafor','3,600','43,200','Active'],['E131 L. Grant','2,700','32,400','Left the company on 31 January 2026'],['E140 R. Dunn','3,100','37,200','Active']],[1,2])}
<p>Payroll records show L. Grant was also paid £2,700 in February.</p>
${docH('Document 3: March payroll deductions (paid to HMRC on 22 April)')}
${sTable(['Item','£'],[['PAYE income tax deducted','21,400'],['Employees’ National Insurance','7,800'],['Employer’s National Insurance','13,900'],['Balance on the client’s “PAYE/NIC payable” account at 31 March','29,200']],[1])}`,
example:`<ul>
<li><b>Build an expectation before you look at the actual figure.</b> Last year’s cost, adjusted for changes in headcount and pay rates, gives a figure you can compare with. The difference is what needs explaining.</li>
<li><b>A sample tests two things:</b> that each employee is real (HR records, contracts) and that they are paid the right amount (salary ÷ 12).</li>
<li><b>Leavers are a classic risk.</b> Someone who has left but is still on the payroll could be an error, or a “ghost employee” fraud.</li>
<li><b>The year-end liability</b> for PAYE and National Insurance should include employees’ deductions <b>and</b> the employer’s own National Insurance.</li>
</ul>`,
practice:[
 fixed({type:'fields',prompt:'<p>Build an expectation for this year’s wages from Document 1.</p>',fields:[{label:'Average cost per employee last year (£)',answer:30000},{label:'Expected total wages this year (£)',answer:1404000},{label:'Difference: actual minus expected (£)',answer:48600}],explain:'£1,260,000 ÷ 42 = £30,000 per employee. × 45 employees × 1.04 = £1,404,000. Actual £1,452,600 is £48,600 higher, which is above Sam’s £25,000 threshold, so it needs explaining.'}),
 fixed({type:'classify',prompt:'<p>Compare each employee in Document 2 with their contract and HR record.</p>',options:['Agrees','Exception'],items:[['E101 A. Patel','Agrees'],['E117 J. Moore','Exception'],['E124 S. Okafor','Agrees'],['E131 L. Grant','Exception'],['E140 R. Dunn','Agrees']].map(([l,a])=>({label:l,answer:a})),explain:'Monthly pay should be annual salary ÷ 12. J. Moore should get £2,800 but got £2,900, with no approval on file. L. Grant left on 31 January but was still paid in February and March.'}),
 fixed({type:'fields',prompt:'<p>Quantify the two exceptions.</p>',fields:[{label:'J. Moore: overpayment per month (£)',answer:100},{label:'L. Grant: total paid after leaving (£)',answer:5400}],explain:'J. Moore: £2,900 − (£33,600 ÷ 12 = £2,800) = £100 a month. L. Grant: two months × £2,700 = £5,400 paid to someone who had already left.'}),
 mcqFixed('L. Grant left in January but is still being paid. What should you do next?',['Find out where the payments went, check they were stopped, and tell Sam, as it could be an error or a fraud','Ignore it, because £5,400 is below performance materiality','Ask L. Grant to pay it back','Correct the payroll yourself'],0,'Payments to leavers can signal a control failure or a “ghost employee” fraud. Fraud matters whatever the amount, so it is reported to the senior straight away.'),
 fixed({type:'fields',prompt:'<p>Check the PAYE/NIC liability in Document 3.</p>',fields:[{label:'Liability owed to HMRC at 31 March (£)',answer:43100},{label:'Amount by which the client’s balance is understated (£)',answer:13900}],explain:'The business owes HMRC the PAYE and employees’ NIC it deducted, plus its own employer’s NIC: 21,400 + 7,800 + 13,900 = £43,100. The client recorded £29,200, which leaves out employer’s NIC of £13,900.'}),
 fixed({type:'written',prompt:'<p><b>Write your summary to Sam.</b></p>',model:`Hi Sam,<br><br>Payroll is done. The main points:<br><br>1. <b>Analytical review:</b> I expected wages of £1,404,000 (£30,000 per head × 45 staff × 1.04). Actual wages are £1,452,600, which is £48,600 more and above the £25,000 threshold. The exceptions below explain only part of it, so I’d like to ask management about overtime, bonuses and agency staff.<br>2. <b>Leaver still paid:</b> L. Grant left on 31 January but was paid £2,700 in both February and March (£5,400). I need to see which bank account received the payments and confirm she has been removed from the payroll. This could be a fraud risk.<br>3. <b>Unapproved pay rise:</b> J. Moore is paid £100 a month more than his contract, with no approval on file.<br>4. <b>PAYE/NIC liability understated:</b> the balance should be £43,100, but the client recorded £29,200. Employer’s NIC of £13,900 is missing, which understates liabilities and wages.<br><br>Can we raise points 2 and 3 as control weaknesses in the management letter?<br><br>Thanks`,points:['Gives the expectation, the actual and the £48,600 difference','Says the exceptions don’t fully explain the difference and suggests enquiries','Flags the leaver payments (£5,400) as a possible fraud risk','Mentions J. Moore’s unapproved £100 a month','Reports the £13,900 understatement of the PAYE/NIC liability','Suggests raising the control weaknesses with the client']})
]});

/* ---------- Simulation 7: fixed asset additions ---------- */
const FA_ACCTS=ACCTS.concat(['Repairs and maintenance','Plant and machinery','Property','VAT control']);
TOPICS.push({id:'jobfa',level:'job',title:'Audit: fixed asset additions',blurb:'Vouch additions to invoices and decide what is really capital, what belongs to the right year, and what’s been overstated.',
lesson:`<p>Harbour &amp; Hale again, year end <b>31 March 2026</b>. Performance materiality is <b>£18,000</b>.</p>
${emailBox('Sam (Audit Senior)','You','Harbour & Hale: PPE additions',`<p>Hi,</p><p>Additions to property, plant and equipment this year total <b>£392,500</b>. Please vouch every addition to its invoice and check it is capital in nature, recorded at the right amount, and in the right year. The client charges a full year’s depreciation at 10% straight-line in the year of purchase.</p><p>Thanks, Sam</p>`)}
${docH('Document 1: Additions listing, year to 31 March 2026')}
${sTable(['#','Description','Amount recorded £'],[['1','Roasting machine R-2','148,000'],['2','Delivery van','39,000'],['3','Warehouse roof','64,000'],['4','Packing line upgrade','78,500'],['5','12 office laptops','14,400'],['6','Industrial coffee grinder','48,600'],['','<b>Total</b>','<b>392,500</b>']],[2])}
${docH('Document 2: What the invoices show')}
${sTable(['#','Invoice details'],[['1','Roasting machine £142,000 plus installation £6,000. Dated 12 August 2025.'],['2','Van £32,500 plus VAT £6,500 = £39,000. The client is VAT-registered and can reclaim the VAT on the van.'],['3','“Repair of storm-damaged roof tiles, restoring the roof to its original condition.” Dated 20 November 2025.'],['4','New automated packing module, increasing capacity by 40%. Dated 3 February 2026.'],['5','12 laptops at £1,200 each. The client capitalises IT equipment over £500.'],['6','Grinder ordered in March, but delivered and invoiced on 4 April 2026.']])}`,
example:`<ul>
<li><b>Capital or revenue?</b> Spending that creates a new asset or <b>improves</b> an existing one (more capacity, longer life) is capital. Spending that <b>restores</b> an asset to its original condition is a repair, which is an expense.</li>
<li><b>Right amount:</b> cost excludes VAT the business can reclaim, but includes costs of getting the asset ready for use, such as installation.</li>
<li><b>Right year:</b> an asset is only an addition once the business controls it, normally on delivery.</li>
<li><b>Follow the knock-on effects.</b> If an addition is wrong, the depreciation charged on it is wrong too.</li>
</ul>`,
practice:[
 fixed({type:'classify',prompt:'<p>Compare each addition with its invoice. What is the finding?</p>',options:['Correct','Not capital: repair','Wrong amount','Wrong year'],items:[['1. Roasting machine £148,000','Correct'],['2. Delivery van £39,000','Wrong amount'],['3. Warehouse roof £64,000','Not capital: repair'],['4. Packing line upgrade £78,500','Correct'],['5. 12 office laptops £14,400','Correct'],['6. Coffee grinder £48,600','Wrong year']].map(([l,a])=>({label:l,answer:a})),explain:'Installation is part of the machine’s cost. The van should be recorded net of reclaimable VAT. The roof work restores the original condition, so it is a repair. The packing upgrade increases capacity, so it is capital. The grinder arrived after the year end.'}),
 fixed({type:'fields',prompt:'<p>Quantify the errors in additions.</p>',fields:[{label:'Van: overstated by (£)',answer:6500},{label:'Total overstatement of additions (£)',answer:119100},{label:'Correct additions for the year (£)',answer:273400}],explain:'VAT £6,500 + roof £64,000 + grinder £48,600 = £119,100. Correct additions = £392,500 − £119,100 = £273,400. The roof and the grinder are each above performance materiality on their own.'}),
 fixed({type:'fields',prompt:'<p>The client charged a full year’s depreciation at 10% on every addition. How much of that should be reversed?</p>',fields:[{label:'Depreciation overcharged (£)',answer:11910}],explain:'Depreciation was charged on the £119,100 that shouldn’t be in additions: 10% × £119,100 = £11,910.'}),
 fixed({type:'journal',prompt:'<p>Propose the journal to move the roof repair out of additions. It was posted to Property. Ignore depreciation.</p>',accounts:FA_ACCTS,answer:[['Repairs and maintenance',64000,0],['Property',0,64000]],explain:'The repair is an expense of the year, so profit falls by £64,000, and property, plant and equipment falls by the same amount.'}),
 fixed({type:'journal',prompt:'<p>Propose the journal to correct the van. The VAT was included in Plant and machinery.</p>',accounts:FA_ACCTS,answer:[['VAT control',6500,0],['Plant and machinery',0,6500]],explain:'Reclaimable VAT is owed back by HMRC, so it belongs in the VAT account, not in the cost of the van.'}),
 mcqFixed('Why is the packing line upgrade capital but the roof work isn’t?',['The upgrade improves the asset (40% more capacity), while the roof work only restores it','The upgrade cost more','The roof is a building, and buildings can’t be improved','The upgrade was paid in cash'],0,'Improvement adds new benefits and is capitalised. Restoring the original condition is a repair and is expensed.'),
 fixed({type:'written',prompt:'<p><b>Write your findings for the audit file.</b></p>',model:`<b>PPE additions: Harbour &amp; Hale, year to 31 March 2026.</b><br><br><b>Work done:</b> vouched all six additions (£392,500) to invoices and checked capital nature, amount and period.<br><br><b>Findings:</b><br>1. Warehouse roof, £64,000: repair of storm damage restoring the original condition. This is revenue expenditure. Proposed adjustment: Dr Repairs and maintenance, Cr Property £64,000.<br>2. Coffee grinder, £48,600: delivered and invoiced on 4 April 2026, after the year end. Remove from additions (and from payables or accruals, if recorded there).<br>3. Delivery van: recorded at £39,000 including reclaimable VAT of £6,500. Proposed adjustment: Dr VAT control, Cr Plant and machinery £6,500.<br><br>Total overstatement of additions: £119,100 (correct additions £273,400). Depreciation is overcharged by £11,910 as a result.<br><br><b>Conclusion:</b> subject to the adjustments above, additions are fairly stated. Items 1 and 2 are each above performance materiality.`,points:['States the work done and the population tested','Explains the roof as a repair, with the proposed adjustment','Explains the grinder as a cut-off error after the year end','Explains the VAT on the van, with the adjustment','Gives the total overstatement (£119,100) and the depreciation effect (£11,910)','Gives a conclusion and notes which items exceed performance materiality']})
]});

/* ---------- Simulation 8: lease for a client ---------- */
TOPICS.push({id:'joblease',level:'job',title:'Finance team: accounting for a new lease',blurb:'Decide which contracts are leases, then set up a new equipment lease under IFRS 16 and explain the effect to the finance director.',
lesson:`<p>You are back in the finance team at <b>Northwell Fitness Ltd</b> (a fictional gym chain). The year end is 31 December. The company has just signed several new contracts.</p>
${emailBox('Jordan (Finance Manager)','You','New contracts: IFRS 16',`<p>Hi,</p><p>We’ve signed a few new contracts this month. Can you check which ones are leases we need to put on the balance sheet under IFRS 16? Then please set up the new gym equipment lease, and draft a short note for the FD on how it will affect our numbers. She is used to seeing a simple rent expense.</p><p>Thanks, Jordan</p>`)}
${docH('Document 1: New contracts signed on 1 January')}
${sTable(['Contract','Details'],[['Gym equipment','5-year lease of specific, named machines. Payments of £24,000 a year, paid at the end of each year.'],['New gym premises','10-year lease of a building.'],['Cleaning','3-year contract for a cleaning company to clean all sites. They choose the staff and equipment.'],['Booking software','3-year subscription to cloud booking software run on the supplier’s servers.'],['Pop-up studio','6-month rental of a unit for a summer promotion, with no option to extend.'],['Reception tablets','Lease of 4 tablets for the front desks.']])}
${docH('Document 2: Gym equipment lease details')}
${sTable(['Item','Detail'],[['Annual payment (in arrears)','£24,000 for 5 years'],['Rate implicit in the lease','Not known'],['Northwell’s incremental borrowing rate','7%'],['Legal fees paid to set up the lease','£2,000'],['Cash incentive received from the lessor on signing','£3,000'],['Useful life of the machines','8 years; ownership doesn’t transfer']])}`,
example:`<ul>
<li><b>Is it a lease?</b> A contract contains a lease if there is an <b>identified asset</b> and the customer has the <b>right to control its use</b> for a period. A service where the supplier chooses which assets to use isn’t a lease.</li>
<li><b>Exemptions:</b> leases of 12 months or less and low-value assets can simply be expensed.</li>
<li><b>Discount rate:</b> if the rate implicit in the lease isn’t known, use the incremental borrowing rate.</li>
<li><b>Right-of-use asset:</b> the lease liability, plus initial direct costs, minus incentives received.</li>
<li><b>Explaining it:</b> the finance director cares about the effect on profit, EBITDA and debt, not the technical wording. Lead with those.</li>
</ul>`,
practice:[
 fixed({type:'classify',prompt:'<p>How should each contract in Document 1 be treated?</p>',options:['Recognise a lease','Exempt: expense it','Not a lease'],items:[['Gym equipment, 5 years','Recognise a lease'],['Gym premises, 10 years','Recognise a lease'],['Cleaning contract','Not a lease'],['Booking software subscription','Not a lease'],['Pop-up studio, 6 months','Exempt: expense it'],['Reception tablets','Exempt: expense it']].map(([l,a])=>({label:l,answer:a})),explain:'The equipment and premises are identified assets that Northwell controls. The cleaning and software contracts are services: the supplier controls the assets used. The pop-up studio is short-term and the tablets are low-value, so they can be expensed.'}),
 fixed({type:'fields',prompt:'<p>Measure the gym equipment lease at the start. Round to the nearest £ (the annuity factor to 4 decimal places).</p>',fields:[{label:'Annuity factor, 5 years at 7%',answer:4.1002,tol:0.0006,display:'4.1002'},{label:'Lease liability (£)',answer:98404.7,tol:3,display:'98,405'},{label:'Right-of-use asset (£)',answer:97404.7,tol:3,display:'97,405'},{label:'Annual depreciation (£)',answer:19480.9,tol:2,display:'19,481'}],explain:'Liability = £24,000 × 4.1002 = £98,405. ROU asset = £98,405 + £2,000 legal fees − £3,000 incentive = £97,405. Depreciate over the 5-year lease term, which is shorter than the 8-year life: £19,481 a year.'}),
 fixed({type:'journal',prompt:'<p>Record the lease at the start. The legal fees were paid in cash and the incentive was received in cash.</p>',accounts:IFRS3_ACCTS,answer:[['Right-of-use asset',97405,0],['Cash',1000,0],['Lease liability',0,98405]],explain:'Dr Right-of-use asset £97,405, Cr Lease liability £98,405. Cash went out £2,000 and came in £3,000, a net £1,000 debit to cash.'}),
 fixed({type:'fields',prompt:'<p>Work out the figures for the first year. Round to the nearest £.</p>',fields:[{label:'Year 1 interest (£)',answer:6888.3,tol:2,display:'6,888'},{label:'Lease liability at the end of year 1 (£)',answer:81293,tol:3,display:'81,293'},{label:'Of which current (paid off in year 2) (£)',answer:18309.5,tol:3,display:'18,310'},{label:'Total charge to profit in year 1: depreciation + interest (£)',answer:26369.2,tol:3,display:'26,369'}],explain:'Interest = 7% × £98,405 = £6,888. Closing = £98,405 + £6,888 − £24,000 = £81,293. Year 2 closing = £81,293 × 1.07 − £24,000 = £62,983, so £18,310 is current. Year 1 charge = £19,481 + £6,888 = £26,369, compared with £24,000 of rent under the old treatment.'}),
 fixed({type:'written',prompt:'<p><b>Draft the note to the finance director.</b></p><p class="hint">Keep it non-technical: what changes on the balance sheet, in profit, and in EBITDA.</p>',model:`<b>Gym equipment lease: effect on our accounts</b><br><br>Under IFRS 16, the new equipment lease goes on the balance sheet instead of being shown as rent.<br><br><b>Balance sheet:</b> we recognise an asset of £97,405 and a lease liability of £98,405, which is treated like debt. At the end of year 1 the liability will be £81,293, of which £18,310 is due within a year.<br><br><b>Profit:</b> instead of £24,000 of rent, we show depreciation of £19,481 and interest of £6,888, a total of £26,369 in year 1. The charge is higher in the early years and lower later, as the interest falls. Over the 5 years the total cost is the same.<br><br><b>EBITDA:</b> it improves by £24,000 a year, because depreciation and interest sit below EBITDA. If the bank’s covenants use EBITDA or net debt, we should check how the lease is treated in them.<br><br>The cleaning and software contracts are services, and the pop-up studio and tablets are exempt, so those stay as normal expenses.`,points:['Explains that the lease goes on the balance sheet as an asset and a debt-like liability','Gives the asset and liability amounts','Compares the year 1 charge (£26,369) with the old rent (£24,000)','Explains that the total cost is the same over the lease, but front-loaded','Notes that EBITDA improves and flags bank covenants','Confirms how the other contracts are treated']})
]});
/* ================= FINANCIAL STATEMENTS SECTION ================= */
// Annotated two-year statement renderer
function fsAnnot(spec){
  const yrs=spec.years||['2025','2024'];
  const cell=(v,cls)=>`<td class="amt ${cls||''}">${v==null?'':v===0?'–':fmt(v)}</td>`;
  const U=spec.unit||'£';let rows=`<tr class="fs-hd"><td></td>${yrs.map(y=>`<td class="amt">${y}<br>${U}</td>`).join('')}</tr>`;
  spec.rows.forEach(r=>{
    const mk=r.n?` <span class="mk" title="See note ${r.n}">${r.n}</span>`:'';
    if(r.head){rows+=`<tr class="fs-sec"><td colspan="${yrs.length+1}">${r.head}${mk}</td></tr>`;return;}
    const lc=r.t==='tot'?'tl':r.t==='dbl'?'dbl':r.t==='sub'?'tl':'';
    rows+=`<tr class="${r.b?'fs-b':''}"><td class="fs-label ${r.ind?'fs-ind':''}">${r.l}${mk}</td>${yrs.map((_,k)=>cell(r.c?r.c[k]:null,lc)).join('')}</tr>`;
  });
  const hmk=spec.headNote?` <span class="mk">${spec.headNote}</span>`:'';
  const sheet=`<div class="fs-sheet"><div class="fs-head"><div class="fs-co">${spec.co}${hmk}</div><div class="fs-title">${spec.title}</div><div class="fs-period">${spec.period}</div></div><div class="scroll"><table class="fs fs2">${rows}</table></div></div>`;
  const notes=`<ol class="fs-notes">${spec.notes.map(([n,h,t])=>`<li value="${n}"><span><b>${h}.</b> ${t}</span></li>`).join('')}</ol>`;
  return `<div class="fs-annot">${sheet}<div><h3 class="fs-nh">What each numbered line means</h3>${notes}</div></div>`;
}

/* Khan's Deli: one consistent data set */
const KD_TB=[['Shop equipment at cost','32,000',''],['Accumulated depreciation at 1 January 2025','','12,800'],['Inventory at 1 January 2025','6,200',''],['Purchases','98,300',''],['Sales','','186,400'],['Wages','32,500',''],['Rent and rates','14,400',''],['Electricity','4,200',''],['Insurance','2,000',''],['Advertising','1,200',''],['Sundry expenses','1,050',''],['Trade receivables','1,300',''],['Cash at bank','10,500',''],['Trade payables','','5,600'],['Bank loan (repayable 2029)','','8,000'],['Capital at 1 January 2025','','17,350'],['Drawings','26,500',''],['<b>Totals</b>','<b>230,150</b>','<b>230,150</b>']];
const KD_ADJ='<ul><li>Closing inventory at 31 December 2025 was counted and valued at <b>£7,100</b>.</li><li>Electricity of <b>£450</b> for December has not been billed yet (an accrual).</li><li>Insurance of <b>£150</b> has been paid for January 2026 (a prepayment).</li><li>Depreciate shop equipment at <b>10% of cost</b> per year.</li></ul>';
const kdTB=()=>sTable(['Account','Dr £','Cr £'],KD_TB,[1,2]);

/* random sole trader for fill-in practice */
function traderGen(){for(;;){
  const R=rint(80,300)*1000,oi=rint(20,120)*100,pur=Math.round(R*rint(45,60)/100/100)*100,ci=rint(20,120)*100,wa=rint(150,600)*100,re=rint(60,200)*100,el_=rint(15,60)*100,ac=rint(2,9)*50,ins=rint(10,30)*100,pp=rint(1,6)*50,ot=rint(5,30)*100,C=rint(10,60)*1000,rate=pick([10,20]),AD=Math.round(C*rate/100*rint(1,3)),rec=rint(5,40)*100,cash=rint(20,150)*100,pay=rint(20,80)*100,loan=pick([0,rint(2,15)*1000]),dr=rint(100,300)*100;
  const dep=C*rate/100,cos=oi+pur-ci,gp=R-cos,ex=wa+re+el_+ac+ins-pp+dep+ot,np=gp-ex;
  const drTot=C+oi+pur+wa+re+el_+ins+ot+rec+cash+dr,cap=drTot-(R+AD+pay+loan);
  if(np<=2000||cap<=5000||AD+dep>=C)continue;
  const nbv=C-AD-dep,ca=ci+rec+pp+cash,cl=pay+ac,nca=ca-cl,na=nbv+nca-loan,close=cap+np-dr;
  if(na!==close)continue;
  const names=['Tom Reid, trading as Reid Bikes','Priya Shah, trading as Shah Florists','Sam Carter, trading as Carter Hardware','Ellie Grant, trading as Grant Books'];
  const tb=[['Equipment at cost',fmt(C),''],['Accumulated depreciation at start of year','',fmt(AD)],['Inventory at start of year',fmt(oi),''],['Purchases',fmt(pur),''],['Sales','',fmt(R)],['Wages',fmt(wa),''],['Rent and rates',fmt(re),''],['Electricity',fmt(el_),''],['Insurance',fmt(ins),''],['Other expenses',fmt(ot),''],['Trade receivables',fmt(rec),''],['Cash at bank',fmt(cash),''],['Trade payables','',fmt(pay)]];
  if(loan)tb.push(['Bank loan (long term)','',fmt(loan)]);
  tb.push(['Capital at start of year','',fmt(cap)],['Drawings',fmt(dr),''],['<b>Totals</b>','<b>'+fmt(drTot)+'</b>','<b>'+fmt(drTot)+'</b>']);
  const adj=`<ul><li>Closing inventory: <b>${money(ci)}</b>.</li><li>Electricity accrued: <b>${money(ac)}</b>.</li><li>Insurance prepaid: <b>${money(pp)}</b>.</li><li>Depreciation: <b>${rate}% of cost</b>.</li></ul>`;
  return {co:pick(names),R,oi,pur,ci,wa,re,el_,ac,ins,pp,ot,C,rate,AD,rec,cash,pay,loan,dr,dep,cos,gp,ex,np,cap,nbv,ca,cl,nca,na,close,tbHtml:sTable(['Account','Dr £','Cr £'],tb,[1,2]),adj};}}

/* ---------- Sole trader income statement ---------- */
TOPICS.push({id:'fs-is',level:'fs',title:'Sole trader income statement',blurb:'The income statement of a small business owned by one person, explained line by line, with how to build it and how to read it.',
lesson:`${fsAnnot({co:'Amira Khan, trading as Khan’s Deli',title:'Income Statement',period:'for the year ended 31 December 2025',headNote:1,rows:[
{l:'Revenue',c:[186400,171200],n:2},
{head:'Cost of sales',n:6},
{l:'Opening inventory',c:[6200,5400],ind:1,n:3},
{l:'Add: Purchases',c:[98300,91000],ind:1,n:4},
{l:'',c:[104500,96400],ind:1,t:'sub'},
{l:'Less: Closing inventory',c:[-7100,-6200],ind:1,n:5},
{l:'Cost of sales',c:[-97400,-90200],t:'sub'},
{l:'Gross profit',c:[89000,81000],b:1,t:'tot',n:7},
{head:'Less: Expenses',n:8},
{l:'Wages',c:[32500,30100],ind:1},
{l:'Rent and rates',c:[14400,14400],ind:1},
{l:'Electricity',c:[4650,3900],ind:1,n:9},
{l:'Insurance',c:[1850,1700],ind:1,n:9},
{l:'Depreciation of shop equipment',c:[3200,3200],ind:1,n:10},
{l:'Advertising',c:[1200,800],ind:1},
{l:'Sundry expenses',c:[1050,900],ind:1},
{l:'Total expenses',c:[-58850,-55000],t:'sub'},
{l:'Net profit for the year',c:[30150,26000],b:1,t:'dbl',n:11}],
notes:[[1,'Heading','It says whose accounts these are (Amira Khan, who owns the deli), which statement it is, and the period. “For the year ended” means the figures cover a whole year, from 1 January to 31 December 2025.'],
[2,'Revenue','The value of all sales in the year, not including VAT. The second column shows last year’s figure (the comparative), so you can see sales rose from £171,200 to £186,400.'],
[3,'Opening inventory','The stock held on 1 January 2025. It is always the same as last year’s closing inventory: £6,200 in the 2024 column appears again here.'],
[4,'Purchases','The cost of goods bought to sell during the year.'],
[5,'Closing inventory','The stock still held on 31 December 2025, counted and valued at cost (or less if it will sell for less). It is taken off because it has not been sold yet. It also appears as a current asset in the statement of financial position.'],
[6,'Cost of sales','The cost of the goods that were actually sold: opening inventory + purchases − closing inventory = £97,400.'],
[7,'Gross profit','Revenue minus cost of sales. It is the profit from buying and selling, before running costs. £89,000 ÷ £186,400 = a gross margin of 47.7%.'],
[8,'Expenses','The costs of running the business. They are the amounts that belong to this year, after adjusting for accruals and prepayments.'],
[9,'Adjusted expenses','Electricity includes £450 owed at the year end (an accrual). Insurance excludes £150 paid in advance for next year (a prepayment). So these figures are different from the amounts paid.'],
[10,'Depreciation','The part of the shop equipment’s cost charged for this year (10% of £32,000). No cash is paid for depreciation.'],
[11,'Net profit','Gross profit minus all the expenses. It belongs to the owner and is added to her capital in the statement of financial position. The money she took out for herself (drawings) is not an expense, so it does not appear here.']]})}
<h3>How to read it</h3>
<ol class="steps-list">
<li><b>Compare the two columns.</b> Revenue rose by £15,200, which is 8.9%. Net profit rose by £4,150, which is 16.0%.</li>
<li><b>Work out the gross margin.</b> This year £89,000 ÷ £186,400 = 47.7%. Last year £81,000 ÷ £171,200 = 47.3%. The deli is keeping a similar share of each sale after the cost of the food.</li>
<li><b>Look for expenses that changed a lot.</b> Electricity rose from £3,900 to £4,650, which is 19%. That is faster than sales, so it is worth asking why.</li>
<li><b>Work out the net margin.</b> £30,150 ÷ £186,400 = 16.2%, up from 15.2%. The business keeps more of each £1 of sales as profit.</li>
<li><b>Compare net profit with drawings</b> (from the statement of financial position). Amira took out £26,500 of the £30,150 profit, so £3,650 stayed in the business.</li></ol>`,
example:`<p>This is how the statement above was built from the trial balance.</p>
<h3>Start with the trial balance at 31 December 2025</h3>${kdTB()}
<h3>And the year-end adjustments</h3>${KD_ADJ}
<h3>Steps</h3>
<ol class="steps-list">
<li><b>Write the heading:</b> the owner’s name and trading name, “Income Statement”, and “for the year ended 31 December 2025”.</li>
<li><b>Revenue:</b> copy Sales from the trial balance: £186,400.</li>
<li><b>Cost of sales:</b> opening inventory £6,200 (from the trial balance) + purchases £98,300 − closing inventory £7,100 (from the adjustments) = £97,400.</li>
<li><b>Gross profit:</b> £186,400 − £97,400 = £89,000.</li>
<li><b>Expenses:</b> copy each expense from the trial balance, then adjust:
<ul><li>Electricity: £4,200 + £450 accrued = £4,650.</li><li>Insurance: £2,000 − £150 prepaid = £1,850.</li><li>Depreciation: 10% × £32,000 = £3,200 (a new line, not in the trial balance).</li><li>Wages, rent and rates, advertising and sundry expenses are copied as they are.</li></ul></li>
<li><b>Total the expenses:</b> £58,850.</li>
<li><b>Net profit:</b> £89,000 − £58,850 = £30,150. Double-underline it.</li>
<li><b>Check what you have not used.</b> Equipment, accumulated depreciation, receivables, cash, payables, the loan, capital and drawings are not income or expenses. They go in the statement of financial position.</li></ol>`,
practice:[
 gen(()=>{const g=traderGen();return {type:'statement',company:g.co,prompt:`<p>Prepare the income statement from this trial balance and the adjustments below. Fill in every blank line.</p>${g.tbHtml}<p><b>Adjustments at the year end:</b></p>${g.adj}<p class="hint">You can type deductions with or without brackets.</p>`,title:'Income Statement for the year ended 31 December',rows:[{l:'Revenue',o:{a:g.R}},{l:'Cost of sales',b:1},{l:'Opening inventory',i:{a:g.oi},ind:1},{l:'Add: Purchases',i:{a:g.pur},ind:1},{l:'Less: Closing inventory',i:{a:-g.ci},ind:1},{l:'Cost of sales',o:{a:-g.cos},ti:1},{l:'Gross profit',o:{a:g.gp},b:1,t:'tot'},{l:'Less: Expenses',b:1},{l:'Wages',i:{a:g.wa},ind:1},{l:'Rent and rates',i:{a:g.re},ind:1},{l:'Electricity',i:{a:g.el_+g.ac},ind:1},{l:'Insurance',i:{a:g.ins-g.pp},ind:1},{l:'Depreciation',i:{a:g.dep},ind:1},{l:'Other expenses',i:{a:g.ot},ind:1},{l:'Total expenses',o:{a:-g.ex},ti:1},{l:'Net profit for the year',o:{a:g.np},b:1,t:'dbl'}],explain:`Cost of sales = ${money(g.oi)} + ${money(g.pur)} − ${money(g.ci)} = ${money(g.cos)}. Electricity = ${money(g.el_)} + ${money(g.ac)} accrued. Insurance = ${money(g.ins)} − ${money(g.pp)} prepaid. Depreciation = ${g.rate}% × ${money(g.C)} = ${money(g.dep)}. Net profit = ${money(g.gp)} − ${money(g.ex)} = ${money(g.np)}.`};}),
 fixed({type:'fields',prompt:'<p>Use the Khan’s Deli income statement at the top of this page. Give percentages to 1 decimal place.</p>',fields:[{label:'Growth in revenue from 2024 to 2025 (%)',answer:8.9,tol:0.1,unit:'%',display:'8.9'},{label:'Gross margin in 2025 (%)',answer:47.7,tol:0.1,unit:'%',display:'47.7'},{label:'Net margin in 2025 (%)',answer:16.2,tol:0.1,unit:'%',display:'16.2'}],explain:'Growth = (186,400 − 171,200) ÷ 171,200 × 100 = 8.9%. Gross margin = 89,000 ÷ 186,400 × 100 = 47.7%. Net margin = 30,150 ÷ 186,400 × 100 = 16.2%.'}),
 fixed({type:'classify',prompt:'<p>Where does each item from the Khan’s Deli trial balance go?</p>',options:['Income statement','Statement of financial position'],items:[['Sales','Income statement'],['Wages','Income statement'],['Drawings','Statement of financial position'],['Trade receivables','Statement of financial position'],['Purchases','Income statement'],['Bank loan','Statement of financial position'],['Rent and rates','Income statement'],['Capital at 1 January','Statement of financial position']].map(([l,a])=>({label:l,answer:a})),explain:'Income and expenses go in the income statement. Assets, liabilities, capital and drawings go in the statement of financial position.'})
]});

/* ---------- Sole trader SOFP ---------- */
TOPICS.push({id:'fs-sofp',level:'fs',title:'Sole trader statement of financial position',blurb:'The balance sheet of a small business owned by one person, explained line by line, with how to build it and how to read it.',
lesson:`${fsAnnot({co:'Amira Khan, trading as Khan’s Deli',title:'Statement of Financial Position',period:'as at 31 December 2025',headNote:1,rows:[
{head:'Non-current assets',n:2},
{l:'Shop equipment at cost',c:[32000,32000],ind:1},
{l:'Less: Accumulated depreciation',c:[-16000,-12800],ind:1,n:3},
{l:'Net book value',c:[16000,19200],t:'sub',b:1},
{head:'Current assets',n:4},
{l:'Inventory',c:[7100,6200],ind:1,n:5},
{l:'Trade receivables',c:[1300,900],ind:1},
{l:'Prepayments',c:[150,120],ind:1,n:6},
{l:'Cash at bank',c:[10500,6410],ind:1},
{l:'Total current assets',c:[19050,13630],t:'sub'},
{head:'Current liabilities',n:7},
{l:'Trade payables',c:[5600,5100],ind:1},
{l:'Accruals',c:[450,380],ind:1,n:6},
{l:'Total current liabilities',c:[-6050,-5480],t:'sub'},
{l:'Net current assets',c:[13000,8150],b:1,t:'tot',n:8},
{head:'Non-current liabilities',n:9},
{l:'Bank loan (repayable 2029)',c:[-8000,-10000],ind:1},
{l:'Net assets',c:[21000,17350],b:1,t:'dbl',n:10},
{head:'Capital',n:11},
{l:'Opening capital',c:[17350,15350],ind:1,n:12},
{l:'Add: Net profit for the year',c:[30150,26000],ind:1,n:13},
{l:'Less: Drawings',c:[-26500,-24000],ind:1,n:14},
{l:'Closing capital',c:[21000,17350],b:1,t:'dbl',n:15}],
notes:[[1,'Heading','“As at 31 December 2025” means the figures show the position on that one day. This is different from the income statement, which covers a whole year.'],
[2,'Non-current assets','Things the business owns and will use for more than a year. Here it is the shop equipment.'],
[3,'Accumulated depreciation','All the depreciation charged since the equipment was bought: £12,800 at the start of the year + £3,200 this year = £16,000. Cost minus accumulated depreciation is the net book value, £16,000.'],
[4,'Current assets','Things the business owns that will be turned into cash, or used, within 12 months. They are listed from least to most like cash.'],
[5,'Inventory','The same closing inventory figure (£7,100) that was deducted in the income statement.'],
[6,'Prepayments and accruals','These come from the year-end adjustments: insurance paid in advance (£150, an asset) and electricity owed (£450, a liability).'],
[7,'Current liabilities','Amounts the business must pay within 12 months.'],
[8,'Net current assets','Current assets minus current liabilities, also called working capital. £13,000 means the deli could pay all its short-term bills from its short-term assets.'],
[9,'Non-current liabilities','Amounts owed that are due after more than 12 months, here a bank loan. It fell by £2,000 because some was repaid.'],
[10,'Net assets','Non-current assets + net current assets − non-current liabilities: £16,000 + £13,000 − £8,000 = £21,000. This is what the business is worth to the owner, based on the accounts.'],
[11,'Capital','The owner’s stake in the business. This section shows how it changed during the year.'],
[12,'Opening capital','Last year’s closing capital (£17,350 in the 2024 column).'],
[13,'Net profit','Taken from the income statement. Profit belongs to the owner, so it increases capital.'],
[14,'Drawings','Money Amira took out for herself. It reduces capital. It is not an expense.'],
[15,'Closing capital','£17,350 + £30,150 − £26,500 = £21,000. It must equal net assets. If the two figures are different, there is a mistake somewhere.']]})}
<h3>How to read it</h3>
<ol class="steps-list">
<li><b>Check it balances:</b> net assets (£21,000) = closing capital (£21,000).</li>
<li><b>Look at liquidity.</b> Current ratio = £19,050 ÷ £6,050 = 3.15 : 1, up from 2.49 : 1. The deli can easily pay its short-term bills.</li>
<li><b>Look at cash.</b> Cash rose from £6,410 to £10,500, even after repaying £2,000 of the loan.</li>
<li><b>Look at the non-current assets.</b> Half of the equipment’s cost has been depreciated (£16,000 of £32,000). At 10% a year, it is about 5 years from being fully written off, so new equipment may be needed.</li>
<li><b>Look at the capital.</b> It grew by £3,650 (profit £30,150 − drawings £26,500). The owner is taking out most of the profit.</li></ol>`,
example:`<p>This uses the same trial balance and adjustments as the income statement page. Net profit for the year, from the income statement, is <b>£30,150</b>.</p>
<h3>Trial balance at 31 December 2025</h3>${kdTB()}
<h3>Year-end adjustments</h3>${KD_ADJ}
<h3>Steps</h3>
<ol class="steps-list">
<li><b>Write the heading</b> with “as at 31 December 2025”.</li>
<li><b>Non-current assets:</b> equipment at cost £32,000, less accumulated depreciation of £12,800 + this year’s £3,200 = £16,000, which gives a net book value of £16,000.</li>
<li><b>Current assets:</b> closing inventory £7,100 (adjustment), trade receivables £1,300, the prepayment £150 (adjustment), and cash at bank £10,500. Total £19,050.</li>
<li><b>Current liabilities:</b> trade payables £5,600 and the electricity accrual £450 (adjustment). Total £6,050.</li>
<li><b>Net current assets:</b> £19,050 − £6,050 = £13,000.</li>
<li><b>Non-current liabilities:</b> the bank loan of £8,000, which is due after more than a year.</li>
<li><b>Net assets:</b> £16,000 + £13,000 − £8,000 = £21,000. Double-underline it.</li>
<li><b>Capital:</b> opening capital £17,350 (trial balance) + net profit £30,150 − drawings £26,500 = £21,000.</li>
<li><b>Check:</b> closing capital equals net assets. If the two figures don’t agree, check each adjustment has been used twice, once in each statement.</li></ol>`,
practice:[
 gen(()=>{const g=traderGen();const rows=[{head:'Non-current assets'},{l:'Equipment at cost',i:{a:g.C},ind:1},{l:'Less: Accumulated depreciation',i:{a:-(g.AD+g.dep)},ind:1},{l:'Net book value',o:{a:g.nbv},ti:1},{head:'Current assets'},{l:'Inventory',i:{a:g.ci},ind:1},{l:'Trade receivables',i:{a:g.rec},ind:1},{l:'Prepayments',i:{a:g.pp},ind:1},{l:'Cash at bank',i:{a:g.cash},ind:1},{l:'Total current assets',i:{a:g.ca},ti:1},{head:'Current liabilities'},{l:'Trade payables',i:{a:g.pay},ind:1},{l:'Accruals',i:{a:g.ac},ind:1},{l:'Total current liabilities',i:{a:-g.cl},ti:1},{l:'Net current assets',o:{a:g.nca},b:1}];if(g.loan)rows.push({head:'Non-current liabilities'},{l:'Bank loan',o:{a:-g.loan},ind:1});rows.push({l:'Net assets',o:{a:g.na},b:1,t:'dbl'},{head:'Capital'},{l:'Opening capital',i:{a:g.cap},ind:1},{l:'Add: Net profit for the year',i:{a:g.np},ind:1},{l:'Less: Drawings',i:{a:-g.dr},ind:1},{l:'Closing capital',o:{a:g.close},b:1,t:'dbl',ti:1});
  return {type:'statement',company:g.co,prompt:`<p>Prepare the statement of financial position from this trial balance and the adjustments below. Net profit for the year is <b>${money(g.np)}</b>.</p>${g.tbHtml}<p><b>Adjustments at the year end:</b></p>${g.adj}`,title:'Statement of Financial Position as at 31 December',rows,explain:`Accumulated depreciation = ${money(g.AD)} + ${money(g.dep)} = ${money(g.AD+g.dep)}, so NBV = ${money(g.nbv)}. Current assets ${money(g.ca)} − current liabilities ${money(g.cl)} = ${money(g.nca)}. Net assets = ${money(g.na)}. Capital = ${money(g.cap)} + ${money(g.np)} − ${money(g.dr)} = ${money(g.close)}, which agrees.`};}),
 fixed({type:'fields',prompt:'<p>Use the Khan’s Deli statement at the top of this page. Give ratios to 2 decimal places.</p>',fields:[{label:'Current ratio in 2025 (: 1)',answer:3.15,tol:0.011,display:'3.15'},{label:'Current ratio in 2024 (: 1)',answer:2.49,tol:0.011,display:'2.49'},{label:'Increase in capital during 2025 (£)',answer:3650}],explain:'2025: 19,050 ÷ 6,050 = 3.15. 2024: 13,630 ÷ 5,480 = 2.49. Capital rose from £17,350 to £21,000, an increase of £3,650 (profit £30,150 − drawings £26,500).'}),
 fixed({type:'classify',prompt:'<p>Which heading does each item go under?</p>',options:['Non-current assets','Current assets','Current liabilities','Non-current liabilities','Capital'],items:[['Shop equipment','Non-current assets'],['Inventory','Current assets'],['Accruals','Current liabilities'],['Bank loan repayable in 2029','Non-current liabilities'],['Drawings','Capital'],['Prepayments','Current assets'],['Trade payables','Current liabilities'],['Net profit for the year','Capital']].map(([l,a])=>({label:l,answer:a})),explain:'Long-term assets and debts are non-current. Items that will turn into cash or be paid within 12 months are current. Profit and drawings change the owner’s capital.'})
]});
/* ---------- Company statements: Marsh Lane Cycles Ltd (£000) ---------- */
const ML_TB=[['Property, plant and equipment: carrying amount at 1 January 2025','2,900',''],['Property, plant and equipment: additions in the year','300',''],['Intangible assets: carrying amount at 1 January 2025','240',''],['Inventory at 1 January 2025','540',''],['Purchases','2,860',''],['Revenue','','4,820'],['Distribution costs','520',''],['Administrative expenses','560',''],['Finance costs (interest paid)','30',''],['Trade receivables','720',''],['Cash and cash equivalents','290',''],['Trade and other payables','','540'],['Bank loan','','1,000'],['Deferred tax at 1 January 2025','','100'],['Share capital (£1 shares)','','1,000'],['Retained earnings at 1 January 2025','','1,650'],['Dividends paid','150',''],['<b>Totals</b>','<b>9,110</b>','<b>9,110</b>']];
const ML_ADJ='<ul><li>Closing inventory at 31 December 2025: <b>£610,000</b>.</li><li>Depreciation for the year: <b>£200,000</b>, charged to cost of sales.</li><li>Amortisation of intangible assets: <b>£20,000</b>, charged to administrative expenses.</li><li>The property was revalued upwards by <b>£150,000</b> at the year end.</li><li>The audit fee of <b>£30,000</b> has not been paid (an accrual in administrative expenses).</li><li>Loan interest of <b>£30,000</b> for the second half of the year is owed (an accrual).</li><li>Current tax for the year is estimated at <b>£140,000</b>. Deferred tax should be increased to <b>£120,000</b>.</li><li><b>£100,000</b> of the bank loan is repayable within 12 months.</li><li>For simplicity, ignore deferred tax on the revaluation.</li></ul>';
const mlTB=()=>sTable(['Account (£000)','Dr','Cr'],ML_TB,[1,2]);

function coGen(){for(;;){
  const R=rint(20,80)*100,oi=rint(20,80)*10,pur=Math.round(R*rint(50,62)/100/10)*10,ci=rint(20,90)*10,dep=rint(5,30)*10,dist=Math.round(R*rint(8,14)/100/10)*10,admTB=Math.round(R*rint(9,14)/100/10)*10,amort=rint(1,4)*10,audit=rint(1,5)*10,intP=rint(1,6)*10,intA=rint(1,6)*10,ctax=rint(5,25)*10,dtO=rint(5,20)*10,dtI=rint(1,5)*10,reval=pick([0,rint(5,30)*10]),ppeO=rint(100,400)*10,add=rint(10,60)*10,intO=rint(5,40)*10,rec=Math.round(R*rint(10,18)/100/10)*10,cash=rint(10,60)*10,sc=rint(3,15)*100,loan=rint(3,15)*100,loanC=rint(1,3)*50,pay=rint(20,80)*10,div=rint(5,25)*10;
  const drT=ppeO+add+intO+oi+pur+rec+cash+dist+admTB+intP+div,reO=drT-(R+sc+loan+dtO+pay);
  const cos=oi+pur-ci+dep,gp=R-cos,adm=admTB+amort+audit,op=gp-dist-adm,fin=intP+intA,pbt=op-fin,tax=ctax+dtI,pat=pbt-tax,tci=pat+reval;
  if(reO<100||pat<=20||intO<=amort)continue;
  const ppe=ppeO+add-dep+reval,intg=intO-amort,nca=ppe+intg,ca=ci+rec+cash,ta=nca+ca,re=reO+pat-div,eq=sc+reval+re,dt=dtO+dtI,ncl=(loan-loanC)+dt,cl=pay+audit+intA+ctax+loanC,tl=ncl+cl;
  if(re<=0||ta!==eq+tl)continue;
  const tb=[['Property, plant and equipment: carrying amount at start of year',fmt(ppeO),''],['Property, plant and equipment: additions',fmt(add),''],['Intangible assets: carrying amount at start of year',fmt(intO),''],['Inventory at start of year',fmt(oi),''],['Purchases',fmt(pur),''],['Revenue','',fmt(R)],['Distribution costs',fmt(dist),''],['Administrative expenses',fmt(admTB),''],['Finance costs (interest paid)',fmt(intP),''],['Trade receivables',fmt(rec),''],['Cash and cash equivalents',fmt(cash),''],['Trade and other payables','',fmt(pay)],['Bank loan','',fmt(loan)],['Deferred tax at start of year','',fmt(dtO)],['Share capital','',fmt(sc)],['Retained earnings at start of year','',fmt(reO)],['Dividends paid',fmt(div),''],['<b>Totals</b>','<b>'+fmt(drT)+'</b>','<b>'+fmt(drT)+'</b>']];
  const adj=`<ul><li>Closing inventory: <b>${fmt(ci)}</b>.</li><li>Depreciation: <b>${fmt(dep)}</b>, charged to cost of sales.</li><li>Amortisation: <b>${fmt(amort)}</b>, charged to administrative expenses.</li>${reval?`<li>Property revalued upwards by <b>${fmt(reval)}</b> (ignore deferred tax on it).</li>`:''}<li>Audit fee accrued: <b>${fmt(audit)}</b> (administrative expenses).</li><li>Interest accrued: <b>${fmt(intA)}</b>.</li><li>Current tax: <b>${fmt(ctax)}</b>. Increase deferred tax by <b>${fmt(dtI)}</b>.</li><li><b>${fmt(loanC)}</b> of the loan is repayable within 12 months.</li></ul>`;
  return {co:pick(CO_NAMES),R,oi,pur,ci,dep,dist,admTB,amort,audit,intP,intA,ctax,dtO,dtI,reval,ppeO,add,intO,rec,cash,sc,loan,loanC,pay,div,reO,cos,gp,adm,op,fin,pbt,tax,pat,tci,ppe,intg,nca,ca,ta,re,eq,dt,ncl,cl,tl,tbHtml:sTable(['Account (£000)','Dr','Cr'],tb,[1,2]),adj};}}

/* ---------- Company SOPL and OCI ---------- */
TOPICS.push({id:'fs-sopl',level:'fs',title:'Company statement of profit or loss and OCI',blurb:'A limited company’s statement of profit or loss and other comprehensive income in the IAS 1 layout, explained line by line.',
lesson:`${fsAnnot({co:'Marsh Lane Cycles Ltd',title:'Statement of Profit or Loss and Other Comprehensive Income',period:'for the year ended 31 December 2025',unit:'£000',headNote:1,rows:[
{l:'Revenue',c:[4820,4350],n:2},
{l:'Cost of sales',c:[-2990,-2650],n:3},
{l:'Gross profit',c:[1830,1700],b:1,t:'tot',n:4},
{l:'Distribution costs',c:[-520,-480],n:5},
{l:'Administrative expenses',c:[-610,-590],n:6},
{l:'Operating profit',c:[700,630],b:1,t:'tot',n:7},
{l:'Finance costs',c:[-60,-70],n:8},
{l:'Profit before tax',c:[640,560],b:1,t:'tot',n:9},
{l:'Income tax expense',c:[-160,-140],n:10},
{l:'Profit for the year',c:[480,420],b:1,t:'tot',n:11},
{head:'Other comprehensive income',n:12},
{l:'Gain on revaluation of property',c:[150,0],ind:1},
{l:'Total comprehensive income for the year',c:[630,420],b:1,t:'dbl',n:13}],
notes:[[1,'Heading','The company’s name (“Ltd” means a private limited company), the statement’s full name, and the period. “£000” means every figure is in thousands of pounds, so 4,820 means £4,820,000.'],
[2,'Revenue','Income from selling bikes and repairs in the year, recognised under IFRS 15, excluding VAT.'],
[3,'Cost of sales','The direct cost of the goods sold: opening inventory + purchases − closing inventory, plus the depreciation of equipment used to make or prepare the goods.'],
[4,'Gross profit','Revenue minus cost of sales. £1,830 ÷ £4,820 = a gross margin of 38.0%, down from 39.1% last year.'],
[5,'Distribution costs','Costs of getting goods to customers: delivery, warehouse staff and selling costs.'],
[6,'Administrative expenses','Costs of running the company: office staff, directors, the audit fee, and amortisation of software.'],
[7,'Operating profit','Profit from the company’s normal trading, before financing and tax. It is used to compare companies funded in different ways.'],
[8,'Finance costs','Interest on the bank loan, including interest owed at the year end but not yet paid.'],
[9,'Profit before tax','Operating profit minus finance costs.'],
[10,'Income tax expense','Corporation tax for the year (current tax, £140) plus the increase in deferred tax (£20). £160 ÷ £640 = 25% of profit before tax.'],
[11,'Profit for the year','The profit that belongs to the shareholders. It is added to retained earnings. Dividends paid do not appear in this statement.'],
[12,'Other comprehensive income (OCI)','Gains and losses that are not part of profit for the year. Here the property was revalued up by £150. This goes to the revaluation surplus in equity, not to retained earnings.'],
[13,'Total comprehensive income','Profit for the year plus other comprehensive income: £480 + £150 = £630.']]})}
<h3>How to read it</h3>
<ol class="steps-list">
<li><b>Revenue growth:</b> (£4,820 − £4,350) ÷ £4,350 = 10.8%.</li>
<li><b>Gross margin fell</b> from 39.1% to 38.0%. Cost of sales rose by 12.8%, faster than revenue. Ask whether purchase prices rose or selling prices were cut.</li>
<li><b>Operating margin stayed about the same:</b> £700 ÷ £4,820 = 14.5% (last year 14.5%). The company controlled its running costs well.</li>
<li><b>Interest cover:</b> operating profit £700 ÷ finance costs £60 = 11.7 times. The company can easily afford its interest.</li>
<li><b>Tax rate:</b> £160 ÷ £640 = 25%, in line with the UK main rate of corporation tax.</li>
<li><b>Separate the OCI.</b> The £150 revaluation gain makes total comprehensive income look bigger, but it is not trading profit and no cash was received.</li></ol>`,
example:`<p>All figures are in £000.</p>
<h3>Trial balance at 31 December 2025</h3>${mlTB()}
<h3>Year-end adjustments</h3>${ML_ADJ}
<h3>Steps</h3>
<ol class="steps-list">
<li><b>Heading:</b> company name, “Statement of Profit or Loss and Other Comprehensive Income”, “for the year ended 31 December 2025”, and “£000”.</li>
<li><b>Revenue:</b> £4,820 from the trial balance.</li>
<li><b>Cost of sales:</b> opening inventory 540 + purchases 2,860 − closing inventory 610 + depreciation 200 = <b>2,990</b>.</li>
<li><b>Gross profit:</b> 4,820 − 2,990 = 1,830.</li>
<li><b>Distribution costs:</b> 520, copied as it is.</li>
<li><b>Administrative expenses:</b> 560 + amortisation 20 + audit fee accrued 30 = <b>610</b>.</li>
<li><b>Operating profit:</b> 1,830 − 520 − 610 = 700.</li>
<li><b>Finance costs:</b> interest paid 30 + interest accrued 30 = <b>60</b>.</li>
<li><b>Profit before tax:</b> 700 − 60 = 640.</li>
<li><b>Income tax expense:</b> current tax 140 + increase in deferred tax (120 − 100 = 20) = <b>160</b>.</li>
<li><b>Profit for the year:</b> 640 − 160 = 480.</li>
<li><b>Other comprehensive income:</b> the revaluation gain of 150. <b>Total comprehensive income</b> = 480 + 150 = 630.</li>
<li><b>Leave out the dividends paid (150).</b> They are a payment to shareholders, not an expense, and they appear in the statement of changes in equity.</li></ol>`,
practice:[
 gen(()=>{const g=coGen();const rows=[{l:'Revenue',o:{a:g.R}},{l:'Cost of sales',o:{a:-g.cos}},{l:'Gross profit',o:{a:g.gp},b:1,t:'tot'},{l:'Distribution costs',o:{a:-g.dist}},{l:'Administrative expenses',o:{a:-g.adm}},{l:'Operating profit',o:{a:g.op},b:1,t:'tot'},{l:'Finance costs',o:{a:-g.fin}},{l:'Profit before tax',o:{a:g.pbt},b:1,t:'tot'},{l:'Income tax expense',o:{a:-g.tax}},{l:'Profit for the year',o:{a:g.pat},b:1,t:g.reval?'tot':'dbl'}];if(g.reval)rows.push({head:'Other comprehensive income'},{l:'Gain on revaluation of property',o:{a:g.reval},ind:1},{l:'Total comprehensive income for the year',o:{a:g.tci},b:1,t:'dbl'});
  return {type:'statement',company:g.co,unit:'£000',prompt:`<p>Prepare the statement of profit or loss${g.reval?' and other comprehensive income':''} from this trial balance and the adjustments. All figures are in £000.</p>${g.tbHtml}<p><b>Adjustments:</b></p>${g.adj}`,title:g.reval?'Statement of Profit or Loss and Other Comprehensive Income for the year ended 31 December':'Statement of Profit or Loss for the year ended 31 December',rows,explain:`Cost of sales = ${fmt(g.oi)} + ${fmt(g.pur)} − ${fmt(g.ci)} + ${fmt(g.dep)} = ${fmt(g.cos)}. Admin = ${fmt(g.admTB)} + ${fmt(g.amort)} + ${fmt(g.audit)} = ${fmt(g.adm)}. Finance costs = ${fmt(g.intP)} + ${fmt(g.intA)} = ${fmt(g.fin)}. Tax = ${fmt(g.ctax)} + ${fmt(g.dtI)} = ${fmt(g.tax)}. Dividends are left out.`};}),
 fixed({type:'fields',prompt:'<p>Use the Marsh Lane Cycles statement at the top of this page. Give answers to 1 decimal place.</p>',fields:[{label:'Operating margin in 2025 (%)',answer:14.5,tol:0.1,unit:'%',display:'14.5'},{label:'Interest cover in 2025 (times)',answer:11.7,tol:0.1,unit:'times',display:'11.7'},{label:'Growth in cost of sales from 2024 to 2025 (%)',answer:12.8,tol:0.1,unit:'%',display:'12.8'}],explain:'Operating margin = 700 ÷ 4,820 × 100 = 14.5%. Interest cover = 700 ÷ 60 = 11.7 times. Cost of sales growth = (2,990 − 2,650) ÷ 2,650 × 100 = 12.8%.'}),
 fixed({type:'classify',prompt:'<p>Where does each item go?</p>',options:['Profit or loss','Other comprehensive income','Not in this statement'],items:[['Interest on the bank loan','Profit or loss'],['Gain on revaluing the company’s building','Other comprehensive income'],['Dividends paid to shareholders','Not in this statement'],['Audit fee','Profit or loss'],['Amortisation of software','Profit or loss'],['Issue of new shares','Not in this statement']].map(([l,a])=>({label:l,answer:a})),explain:'Income and expenses go in profit or loss. Revaluation gains go in OCI. Transactions with shareholders, such as dividends and share issues, go in the statement of changes in equity.'})
]});

/* ---------- Company SOFP ---------- */
TOPICS.push({id:'fs-cosofp',level:'fs',title:'Company statement of financial position',blurb:'A limited company’s statement of financial position in the IAS 1 layout, explained line by line.',
lesson:`${fsAnnot({co:'Marsh Lane Cycles Ltd',title:'Statement of Financial Position',period:'as at 31 December 2025',unit:'£000',headNote:1,rows:[
{head:'Assets'},
{head:'Non-current assets',n:2},
{l:'Property, plant and equipment',c:[3150,2900],ind:1,n:3},
{l:'Intangible assets',c:[220,240],ind:1},
{l:'',c:[3370,3140],t:'sub'},
{head:'Current assets',n:4},
{l:'Inventories',c:[610,540],ind:1},
{l:'Trade receivables',c:[720,650],ind:1},
{l:'Cash and cash equivalents',c:[290,180],ind:1},
{l:'',c:[1620,1370],t:'sub'},
{l:'Total assets',c:[4990,4510],b:1,t:'dbl',n:5},
{head:'Equity and liabilities'},
{head:'Equity',n:6},
{l:'Share capital',c:[1000,1000],ind:1,n:7},
{l:'Revaluation surplus',c:[150,0],ind:1,n:8},
{l:'Retained earnings',c:[1980,1650],ind:1,n:9},
{l:'Total equity',c:[3130,2650],b:1,t:'sub'},
{head:'Non-current liabilities',n:10},
{l:'Bank loan',c:[900,1000],ind:1},
{l:'Deferred tax',c:[120,100],ind:1},
{l:'',c:[1020,1100],t:'sub'},
{head:'Current liabilities',n:11},
{l:'Trade and other payables',c:[600,520],ind:1},
{l:'Current tax payable',c:[140,140],ind:1},
{l:'Bank loan (due within one year)',c:[100,100],ind:1},
{l:'',c:[840,760],t:'sub'},
{l:'Total liabilities',c:[1860,1860],b:1},
{l:'Total equity and liabilities',c:[4990,4510],b:1,t:'dbl',n:12}],
notes:[[1,'Heading','“As at” means the position on one day. The IAS 1 layout lists assets first, then equity and liabilities. Figures are in £000.'],
[2,'Non-current assets','Assets the company will use for more than a year.'],
[3,'Property, plant and equipment','Carrying amount after depreciation. It rose because of £300 of additions and a £150 revaluation, partly offset by £200 of depreciation: 2,900 + 300 − 200 + 150 = 3,150.'],
[4,'Current assets','Assets expected to be turned into cash within 12 months, listed with the least liquid first.'],
[5,'Total assets','Everything the company owns: £4,990.'],
[6,'Equity','The shareholders’ stake: what they paid for their shares plus profits and gains kept in the company.'],
[7,'Share capital','1,000,000 shares of £1 each. It only changes when new shares are issued.'],
[8,'Revaluation surplus','The £150 gain from other comprehensive income. It is kept separate from retained earnings because it is not realised profit.'],
[9,'Retained earnings','Profits kept in the business: opening £1,650 + profit for the year £480 − dividends £150 = £1,980.'],
[10,'Non-current liabilities','Amounts due after more than 12 months: most of the bank loan, and deferred tax.'],
[11,'Current liabilities','Amounts due within 12 months, including accruals (inside “trade and other payables”), this year’s tax bill, and the £100 of the loan due next year.'],
[12,'Total equity and liabilities','Equity £3,130 + liabilities £1,860 = £4,990, the same as total assets. It must always balance.']]})}
<h3>How to read it</h3>
<ol class="steps-list">
<li><b>Check it balances:</b> total assets £4,990 = total equity and liabilities £4,990.</li>
<li><b>Liquidity:</b> current ratio = 1,620 ÷ 840 = 1.93 : 1, up from 1.80 : 1.</li>
<li><b>Gearing:</b> non-current liabilities ÷ (equity + non-current liabilities) = 1,020 ÷ 4,150 = 24.6%, down from 29.3%. The company relies less on borrowing.</li>
<li><b>Equity grew by £480:</b> total comprehensive income £630 − dividends £150.</li>
<li><b>Look at working capital:</b> receivables rose by 10.8%, in line with revenue growth. Inventory rose by 13.0%, a little faster than sales.</li></ol>`,
example:`<p>This uses the same trial balance and adjustments as the statement of profit or loss page. Profit for the year is <b>480</b> and the revaluation gain is <b>150</b> (all £000).</p>
<h3>Trial balance at 31 December 2025</h3>${mlTB()}
<h3>Year-end adjustments</h3>${ML_ADJ}
<h3>Steps</h3>
<ol class="steps-list">
<li><b>Property, plant and equipment:</b> 2,900 + additions 300 − depreciation 200 + revaluation 150 = <b>3,150</b>.</li>
<li><b>Intangible assets:</b> 240 − amortisation 20 = <b>220</b>.</li>
<li><b>Current assets:</b> closing inventory 610, trade receivables 720, cash 290. Total 1,620. <b>Total assets</b> = 3,370 + 1,620 = 4,990.</li>
<li><b>Share capital:</b> 1,000, from the trial balance.</li>
<li><b>Revaluation surplus:</b> 150, from other comprehensive income.</li>
<li><b>Retained earnings:</b> 1,650 + profit 480 − dividends 150 = <b>1,980</b>.</li>
<li><b>Non-current liabilities:</b> bank loan 1,000 − 100 due within a year = 900. Deferred tax 120. Total 1,020.</li>
<li><b>Current liabilities:</b> trade and other payables 540 + audit accrual 30 + interest accrual 30 = <b>600</b>. Current tax 140. Current part of the loan 100. Total 840.</li>
<li><b>Check:</b> 3,130 + 1,020 + 840 = 4,990, the same as total assets. Every adjustment affects both statements, and that is why they balance.</li></ol>`,
practice:[
 gen(()=>{const g=coGen();const rows=[{head:'Assets'},{l:'Non-current assets',b:1},{l:'Property, plant and equipment',i:{a:g.ppe},ind:1},{l:'Intangible assets',i:{a:g.intg},ind:1},{l:'Total non-current assets',o:{a:g.nca},ti:1},{l:'Current assets',b:1},{l:'Inventories',i:{a:g.ci},ind:1},{l:'Trade receivables',i:{a:g.rec},ind:1},{l:'Cash and cash equivalents',i:{a:g.cash},ind:1},{l:'Total current assets',o:{a:g.ca},ti:1},{l:'Total assets',o:{a:g.ta},b:1,t:'dbl'},{head:'Equity and liabilities'},{l:'Equity',b:1},{l:'Share capital',i:{a:g.sc},ind:1}];if(g.reval)rows.push({l:'Revaluation surplus',i:{a:g.reval},ind:1});rows.push({l:'Retained earnings',i:{a:g.re},ind:1},{l:'Total equity',o:{a:g.eq},ti:1,b:1},{l:'Non-current liabilities',b:1},{l:'Bank loan',i:{a:g.loan-g.loanC},ind:1},{l:'Deferred tax',i:{a:g.dt},ind:1},{l:'Total non-current liabilities',o:{a:g.ncl},ti:1},{l:'Current liabilities',b:1},{l:'Trade and other payables',i:{a:g.pay+g.audit+g.intA},ind:1},{l:'Current tax payable',i:{a:g.ctax},ind:1},{l:'Bank loan (due within one year)',i:{a:g.loanC},ind:1},{l:'Total current liabilities',o:{a:g.cl},ti:1},{l:'Total equity and liabilities',o:{a:g.ta},b:1,t:'dbl'});
  return {type:'statement',company:g.co,unit:'£000',prompt:`<p>Prepare the statement of financial position. Profit for the year is <b>${fmt(g.pat)}</b>${g.reval?` and the revaluation gain is <b>${fmt(g.reval)}</b>`:''}. All figures are in £000.</p>${g.tbHtml}<p><b>Adjustments:</b></p>${g.adj}`,title:'Statement of Financial Position as at 31 December',rows,explain:`PPE = ${fmt(g.ppeO)} + ${fmt(g.add)} − ${fmt(g.dep)}${g.reval?` + ${fmt(g.reval)}`:''} = ${fmt(g.ppe)}. Retained earnings = ${fmt(g.reO)} + ${fmt(g.pat)} − ${fmt(g.div)} = ${fmt(g.re)}. Payables include both accruals: ${fmt(g.pay)} + ${fmt(g.audit)} + ${fmt(g.intA)}. The loan is split ${fmt(g.loan-g.loanC)} non-current and ${fmt(g.loanC)} current. Total ${fmt(g.ta)} on both sides.`};}),
 fixed({type:'fields',prompt:'<p>Use the Marsh Lane Cycles statement at the top of this page.</p>',fields:[{label:'Current ratio in 2025 (: 1, 2 decimal places)',answer:1.93,tol:0.011,display:'1.93'},{label:'Gearing in 2025 (%, 1 decimal place)',answer:24.6,tol:0.1,unit:'%',display:'24.6'},{label:'Increase in total equity during 2025 (£000)',answer:480}],explain:'Current ratio = 1,620 ÷ 840 = 1.93. Gearing = 1,020 ÷ (3,130 + 1,020) × 100 = 24.6%. Equity rose from 2,650 to 3,130, an increase of 480 (total comprehensive income 630 − dividends 150).'}),
 fixed({type:'classify',prompt:'<p>Which heading does each item go under in a company’s statement of financial position?</p>',options:['Non-current assets','Current assets','Equity','Non-current liabilities','Current liabilities'],items:[['Software licences','Non-current assets'],['Inventories','Current assets'],['Revaluation surplus','Equity'],['Deferred tax','Non-current liabilities'],['Corporation tax due in 9 months','Current liabilities'],['Retained earnings','Equity'],['Loan repayable in 2030','Non-current liabilities'],['Accrued audit fee','Current liabilities']].map(([l,a])=>({label:l,answer:a})),explain:'Long-term items are non-current. Items that turn into cash or are due within 12 months are current. Share capital, reserves and retained earnings are equity.'})
]});
/* ---------- multi-column statement (SOCIE) ---------- */
function multiStmt(spec,inputs){
  const cols=spec.cols,n=cols.length;
  const head=el('div',{class:'fs-head'},el('div',{class:'fs-co'},spec.co,spec.headNote?el('span',{class:'mk',text:String(spec.headNote)}):null),el('div',{class:'fs-title',text:spec.title}),spec.period?el('div',{class:'fs-period',text:spec.period}):null);
  const body=el('tbody',{});
  body.append(el('tr',{class:'fs-hd'},el('td',{}),cols.map(c=>el('td',{class:'amt',html:c+'<br>'+(spec.unit||'£')}))));
  spec.rows.forEach(r=>{
    const mk=r.n?el('span',{class:'mk',text:String(r.n)}):null;
    if(r.head){body.append(el('tr',{class:'fs-sec'},el('td',{colspan:String(n+1)},r.head,mk)));return;}
    const lc=r.t==='tot'||r.t==='sub'?'tl':r.t==='dbl'?'dbl':'';
    body.append(el('tr',{class:r.b?'fs-b':''},el('td',{class:'fs-label'},r.l,mk),(r.c||[]).map((v,k)=>{const td=el('td',{class:'amt '+lc});if(v==null)return td;if(typeof v==='object'){const inp=el('input',{class:'num fs-in',type:'text',inputmode:'decimal',autocomplete:'off','aria-label':r.l+', '+cols[k],id:uid()});inputs&&inputs.push({inp,answer:v.a,signed:v.s});td.className='amt fs-blank '+lc;td.append(inp);return td;}td.textContent=v===0?'–':fmt(v);return td;})));
  });
  return el('div',{class:'fs-sheet fs-wide'},head,el('div',{class:'scroll'},el('table',{class:'fs fs2 fs-multi'},body)));
}
W.multistmt=q=>{const inputs=[];const node=multiStmt(q.spec,inputs);return {el:node,
  check(){let n=0;inputs.forEach(x=>{const ok=numOk(x.inp.value,{answer:x.answer,abs:!x.signed,tol:0.5});mark(x.inp,ok);if(ok)n++;});return {n,of:inputs.length};},
  reveal(){inputs.forEach(x=>{x.inp.value=x.answer===0?'0':fmt(x.answer);mark(x.inp,true);});}};};
KIND.multistmt='Statement';
const notesList=notes=>`<h3 class="fs-nh">What each numbered line means</h3><ol class="fs-notes">${notes.map(([n,h,t])=>`<li value="${n}"><span><b>${h}.</b> ${t}</span></li>`).join('')}</ol>`;

/* ---------- SOCIE ---------- */
function socieGen(){for(;;){const sc=rint(5,30)*100,rv=pick([0,rint(5,30)*10]),re=rint(50,300)*10,iss=pick([0,0,rint(1,5)*100]),p=rint(20,90)*10,oci=pick([0,rint(2,15)*10]),d=rint(5,40)*10;const reC=re+p-d;if(reC<=0)continue;
 return {co:pick(CO_NAMES),sc,rv,re,iss,p,oci,d,scC:sc+iss,rvC:rv+oci,reC,tO:sc+rv+re,tC:sc+iss+rv+oci+reC};}}
TOPICS.push({id:'fs-socie',level:'fs',title:'Statement of changes in equity',blurb:'How each part of shareholders’ equity moved during the year: profit, other gains, dividends and share issues.',
lesson:`${multiStmt({co:'Marsh Lane Cycles Ltd',headNote:1,title:'Statement of Changes in Equity',period:'for the year ended 31 December 2025',unit:'£000',cols:['Share capital','Revaluation surplus','Retained earnings','Total'],rows:[
{l:'Balance at 1 January 2024',c:[1000,0,1350,2350],b:1,n:2},
{l:'Profit for the year',c:[0,0,420,420]},
{l:'Dividends paid',c:[0,0,-120,-120]},
{l:'Balance at 31 December 2024',c:[1000,0,1650,2650],b:1,t:'tot',n:3},
{l:'Profit for the year',c:[0,0,480,480],n:4},
{l:'Other comprehensive income: revaluation gain',c:[0,150,0,150],n:5},
{l:'Total comprehensive income for the year',c:[0,150,480,630],t:'sub',n:6},
{l:'Dividends paid',c:[0,0,-150,-150],n:7},
{l:'Balance at 31 December 2025',c:[1000,150,1980,3130],b:1,t:'dbl',n:8}]}).outerHTML}
${notesList([[1,'Heading','This is the third main statement for a company. It explains why each part of equity is different at the end of the year from the start. Figures are in £000.'],
[2,'Columns and opening balance','Each column is one part of equity, and the Total column adds them. Real statements show last year too, so the table starts at 1 January 2024.'],
[3,'Last year’s closing balance','These figures must match equity in last year’s statement of financial position (the 2024 column): share capital 1,000, retained earnings 1,650, total 2,650.'],
[4,'Profit for the year','Taken from the statement of profit or loss. Profit belongs to the shareholders, so it increases retained earnings.'],
[5,'Other comprehensive income','The £150 revaluation gain from the second part of the statement of profit or loss and OCI. It goes into the revaluation surplus column, not retained earnings.'],
[6,'Total comprehensive income','Profit plus OCI, 630. It matches the last line of the statement of profit or loss and OCI.'],
[7,'Dividends paid','Profit paid out to shareholders. This is the only statement where dividends appear as a line in equity. They are never an expense.'],
[8,'Closing balance','These must match equity in this year’s statement of financial position: 1,000 + 150 + 1,980 = 3,130.']])}
<h3>How to read it</h3>
<ol class="steps-list">
<li><b>Did the shareholders put in new money?</b> Share capital is unchanged at 1,000, so no new shares were issued.</li>
<li><b>How much profit was kept?</b> Profit 480 − dividends 150 = 330 kept, which is 69% of the year’s profit.</li>
<li><b>Dividend cover:</b> profit 480 ÷ dividends 150 = 3.2 times. The dividend is well covered by profit.</li>
<li><b>Why equity rose:</b> total equity went from 2,650 to 3,130. That is 480 of profit plus a 150 revaluation gain, minus 150 of dividends.</li></ol>`,
example:`<p>Every figure comes from statements you already have. No new calculations are needed.</p>
<ol class="steps-list">
<li><b>Set up the columns:</b> one for each part of equity in the statement of financial position (share capital, revaluation surplus, retained earnings), plus a Total column.</li>
<li><b>Opening balances:</b> copy equity from last year’s statement of financial position.</li>
<li><b>Profit for the year:</b> from the statement of profit or loss, in retained earnings.</li>
<li><b>Other comprehensive income:</b> from the OCI section, in the reserve it relates to (here, the revaluation surplus).</li>
<li><b>Dividends paid:</b> from the trial balance, deducted from retained earnings.</li>
<li><b>Share issues:</b> if new shares were issued, add the nominal value to share capital (and any premium to a share premium column).</li>
<li><b>Add down each column</b> to get the closing balances, then add across to check the Total column.</li>
<li><b>Check:</b> the closing balances must match equity in this year’s statement of financial position.</li></ol>`,
practice:[
 gen(()=>{const g=socieGen();const has=g.rv||g.oci;const cols=has?['Share capital','Revaluation surplus','Retained earnings','Total']:['Share capital','Retained earnings','Total'];const row=(a,b,c)=>has?[{a},{a:b},{a:c},{a:a+b+c}]:[{a},{a:c},{a:a+c}];
  const rows=[{l:'Balance at 1 January',c:row(g.sc,g.rv,g.re),b:1}];if(g.iss)rows.push({l:'Issue of shares',c:row(g.iss,0,0)});rows.push({l:'Profit for the year',c:row(0,0,g.p)});if(g.oci)rows.push({l:'Other comprehensive income: revaluation gain',c:row(0,g.oci,0)});rows.push({l:'Dividends paid',c:row(0,0,-g.d)},{l:'Balance at 31 December',c:row(g.scC,g.rvC,g.reC),b:1,t:'dbl'});
  return {type:'multistmt',prompt:`<p>Complete the statement of changes in equity (£000). At 1 January: share capital ${fmt(g.sc)}${g.rv?`, revaluation surplus ${fmt(g.rv)}`:''}, retained earnings ${fmt(g.re)}. During the year: ${g.iss?`shares issued at nominal value for ${fmt(g.iss)}, `:''}profit for the year ${fmt(g.p)}, ${g.oci?`revaluation gain ${fmt(g.oci)}, `:''}dividends paid ${fmt(g.d)}.</p><p class="hint">Enter 0 where a line doesn’t affect a column. You can type deductions with or without brackets.</p>`,spec:{co:g.co,title:'Statement of Changes in Equity',period:'for the year ended 31 December 2025',unit:'£000',cols,rows},explain:`Retained earnings: ${fmt(g.re)} + ${fmt(g.p)} − ${fmt(g.d)} = ${fmt(g.reC)}. Total equity goes from ${fmt(g.tO)} to ${fmt(g.tC)}.`};}),
 fixed({type:'fields',prompt:'<p>Use the Marsh Lane Cycles statement at the top of this page.</p>',fields:[{label:'Profit kept in the business in 2025 (£000)',answer:330},{label:'Dividend cover in 2025 (times, 1 decimal place)',answer:3.2,tol:0.05,unit:'times',display:'3.2'}],explain:'Kept: 480 − 150 = 330. Dividend cover = 480 ÷ 150 = 3.2 times.'}),
 fixed({type:'classify',prompt:'<p>Which column of the statement of changes in equity does each item affect?</p>',options:['Share capital','Revaluation surplus','Retained earnings'],items:[['Profit for the year','Retained earnings'],['Dividends paid','Retained earnings'],['Gain on revaluing a building','Revaluation surplus'],['Issue of new £1 shares at £1 each','Share capital']].map(([l,a])=>({label:l,answer:a})),explain:'Profit and dividends go through retained earnings. Revaluation gains go to the revaluation surplus. New shares increase share capital.'})
]});

/* ---------- Statement of cash flows (full) ---------- */
function cfFullGen(){for(;;){const pbt=rint(20,120)*10,dep=rint(5,30)*10,amort=pick([0,rint(1,4)*10]),fin=rint(2,10)*10,iAccO=0,iAccC=pick([0,rint(1,3)*10]),invO=rint(20,80)*10,invC=invO+rint(-15,20)*10,recO=rint(20,80)*10,recC=recO+rint(-15,20)*10,payO=rint(20,70)*10,payC=payO+rint(-10,15)*10,ctax=rint(5,25)*10,taxO=rint(5,25)*10,taxC=ctax,ppe=rint(10,60)*10,sale=pick([0,rint(1,8)*10]),loanChg=pick([-rint(1,4)*50,rint(1,4)*50,0]),iss=pick([0,0,rint(1,5)*50]),div=rint(3,20)*10,cashO=rint(-5,40)*10;
 if(invC<=0||recC<=0||payC<=0)continue;
 const adj=pbt+dep+amort+fin,dInv=invO-invC,dRec=recO-recC,dPay=payC-payO,cgo=adj+dInv+dRec+dPay,intPaid=fin-(iAccC-iAccO),taxPaid=taxO+ctax-taxC,op=cgo-intPaid-taxPaid,inv=sale-ppe,finA=loanChg+iss-div,chg=op+inv+finA,cashC=cashO+chg;
 if(op<=0||cashC<0||intPaid<0)continue;
 return {co:pick(CO_NAMES),pbt,dep,amort,fin,iAccC,invO,invC,recO,recC,payO,payC,ctax,taxO,taxC,ppe,sale,loanChg,iss,div,cashO,adj,dInv,dRec,dPay,cgo,intPaid,taxPaid,op,inv,finA,chg,cashC};}}
TOPICS.push({id:'fs-socf',level:'fs',title:'Statement of cash flows',blurb:'Where a company’s cash came from and went, built from the other statements, explained line by line.',
lesson:`${fsAnnot({co:'Marsh Lane Cycles Ltd',title:'Statement of Cash Flows',period:'for the year ended 31 December 2025',unit:'£000',headNote:1,rows:[
{head:'Cash flows from operating activities',n:2},
{l:'Profit before tax',c:[640,560],ind:1,n:3},
{l:'Adjustments for:',c:null,ind:1},
{l:'Depreciation',c:[200,190],ind:1,n:4},
{l:'Amortisation',c:[20,20],ind:1,n:4},
{l:'Finance costs',c:[60,70],ind:1,n:5},
{l:'',c:[920,840],t:'sub'},
{l:'Increase in inventories',c:[-70,-40],ind:1,n:6},
{l:'Increase in trade receivables',c:[-70,-50],ind:1,n:6},
{l:'Increase in trade and other payables',c:[50,30],ind:1,n:6},
{l:'Cash generated from operations',c:[830,780],t:'sub',b:1,n:7},
{l:'Interest paid',c:[-30,-70],ind:1,n:8},
{l:'Income tax paid',c:[-140,-120],ind:1,n:9},
{l:'Net cash from operating activities',c:[660,590],t:'sub',b:1},
{head:'Cash flows from investing activities',n:10},
{l:'Purchase of property, plant and equipment',c:[-300,-250],ind:1},
{l:'Net cash used in investing activities',c:[-300,-250],t:'sub',b:1},
{head:'Cash flows from financing activities',n:11},
{l:'Repayment of bank loan',c:[-100,-100],ind:1},
{l:'Dividends paid',c:[-150,-120],ind:1},
{l:'Net cash used in financing activities',c:[-250,-220],t:'sub',b:1},
{l:'Net increase in cash and cash equivalents',c:[110,120],t:'tot',b:1,n:12},
{l:'Cash and cash equivalents at 1 January',c:[180,60]},
{l:'Cash and cash equivalents at 31 December',c:[290,180],t:'dbl',b:1,n:13}],
notes:[[1,'Heading','The fourth main statement. It covers a period (“for the year ended”) and shows only real cash movements. Figures are in £000.'],
[2,'Operating activities','Cash from the company’s normal trading. This statement uses the indirect method: start with profit and adjust it to cash.'],
[3,'Profit before tax','Taken from the statement of profit or loss (640).'],
[4,'Depreciation and amortisation','Expenses that did not use any cash this year, so they are added back.'],
[5,'Finance costs','Added back here because the interest actually paid is shown further down as a separate line.'],
[6,'Working capital changes','Found by comparing this year’s and last year’s statement of financial position. Inventory rose from 540 to 610, which used 70 of cash. Receivables rose from 650 to 720, which used 70. Payables (not counting the interest accrual) rose from 520 to 570, which kept 50 of cash in the business.'],
[7,'Cash generated from operations','The cash the trading made before interest and tax: 830. Compare it with operating profit of 700.'],
[8,'Interest paid','The interest expense (60) minus the amount still owed at the year end (30) = 30 actually paid.'],
[9,'Income tax paid','Tax owed at the start (140) + this year’s current tax charge (140) − tax owed at the end (140) = 140 paid. The deferred tax part of the expense is not cash.'],
[10,'Investing activities','Cash spent on long-term assets: PPE additions of 300. The 150 revaluation is not here because no cash moved.'],
[11,'Financing activities','Cash to and from lenders and shareholders: the loan fell from 1,100 to 1,000 (100 repaid), and dividends of 150 were paid.'],
[12,'Net increase in cash','660 − 300 − 250 = 110.'],
[13,'Closing cash','180 + 110 = 290. This must match cash in the statement of financial position.']]})}
<h3>How to read it</h3>
<ol class="steps-list">
<li><b>Is profit turning into cash?</b> Cash generated from operations (830) is more than operating profit (700): 119%. That is a healthy sign.</li>
<li><b>Free cash flow:</b> net cash from operating activities 660 − spending on assets 300 = 360.</li>
<li><b>What was the free cash used for?</b> Repaying 100 of the loan and paying 150 of dividends, with 110 left over, which increased the cash balance.</li>
<li><b>Is the company investing?</b> It spent 300 on assets, more than the 200 depreciation, so it is growing its asset base, not just replacing it.</li>
<li><b>Warning signs to look for in any company:</b> operating cash well below profit, working capital using more and more cash, or dividends paid from borrowing.</li></ol>`,
example:`<p>You need the statement of profit or loss, both years of the statement of financial position, and some extra information. All figures are in £000.</p>
${sTable(['From the statements of financial position','2025','2024','Change'],[['Inventories','610','540','+70 (uses cash)'],['Trade receivables','720','650','+70 (uses cash)'],['Trade and other payables (excluding interest accrual)','570','520','+50 (keeps cash)'],['Interest accrual (inside payables)','30','0',''],['Current tax payable','140','140',''],['Bank loan (total)','1,000','1,100','−100 (repaid)'],['Cash and cash equivalents','290','180','+110']],[1,2])}
<p>Other information: depreciation 200, amortisation 20, PPE additions 300 (all paid in cash), dividends paid 150.</p>
<ol class="steps-list">
<li><b>Start with profit before tax:</b> 640.</li>
<li><b>Add back non-cash items:</b> depreciation 200, amortisation 20, and finance costs 60. Subtotal 920.</li>
<li><b>Working capital:</b> an increase in an asset uses cash, so subtract (inventories 70, receivables 70). An increase in a liability keeps cash, so add (payables 50). Cash generated from operations: 830.</li>
<li><b>Interest paid:</b> 60 − 30 still owed = 30.</li>
<li><b>Tax paid:</b> 140 owed at the start + 140 charge − 140 owed at the end = 140.</li>
<li><b>Net cash from operating activities:</b> 830 − 30 − 140 = 660.</li>
<li><b>Investing:</b> PPE bought (300). Ignore the revaluation, as it is not cash.</li>
<li><b>Financing:</b> loan repaid (100), dividends paid (150).</li>
<li><b>Net change:</b> 660 − 300 − 250 = 110.</li>
<li><b>Check:</b> opening cash 180 + 110 = 290, which matches the statement of financial position.</li></ol>`,
practice:[
 gen(()=>{const g=cfFullGen();const rows=[{head:'Cash flows from operating activities'},{l:'Profit before tax',o:{a:g.pbt,s:1}},{l:'Depreciation',o:{a:g.dep,s:1}}];if(g.amort)rows.push({l:'Amortisation',o:{a:g.amort,s:1}});rows.push({l:'Finance costs',o:{a:g.fin,s:1}},{l:(g.dInv<=0?'Increase':'Decrease')+' in inventories',o:{a:g.dInv,s:1}},{l:(g.dRec<=0?'Increase':'Decrease')+' in trade receivables',o:{a:g.dRec,s:1}},{l:(g.dPay>=0?'Increase':'Decrease')+' in trade payables',o:{a:g.dPay,s:1}},{l:'Cash generated from operations',o:{a:g.cgo,s:1},t:'tot',b:1},{l:'Interest paid',o:{a:-g.intPaid,s:1}},{l:'Income tax paid',o:{a:-g.taxPaid,s:1}},{l:'Net cash from operating activities',o:{a:g.op,s:1},t:'tot',b:1},{head:'Cash flows from investing activities'},{l:'Purchase of property, plant and equipment',o:{a:-g.ppe,s:1}});if(g.sale)rows.push({l:'Proceeds from sale of equipment',o:{a:g.sale,s:1}});rows.push({l:'Net cash from investing activities',o:{a:g.inv,s:1},t:'tot',b:1},{head:'Cash flows from financing activities'});if(g.loanChg)rows.push({l:g.loanChg>0?'New bank loan':'Repayment of bank loan',o:{a:g.loanChg,s:1}});if(g.iss)rows.push({l:'Proceeds from issue of shares',o:{a:g.iss,s:1}});rows.push({l:'Dividends paid',o:{a:-g.div,s:1}},{l:'Net cash from financing activities',o:{a:g.finA,s:1},t:'tot',b:1},{l:'Net increase/(decrease) in cash',o:{a:g.chg,s:1},t:'tot',b:1},{l:'Cash and cash equivalents at 1 January',o:{a:g.cashO,s:1}},{l:'Cash and cash equivalents at 31 December',o:{a:g.cashC,s:1},t:'dbl',b:1});
  const info=sTable(['Item (£000)','Start of year','End of year'],[['Inventories',fmt(g.invO),fmt(g.invC)],['Trade receivables',fmt(g.recO),fmt(g.recC)],['Trade payables (excluding interest accrual)',fmt(g.payO),fmt(g.payC)],['Interest accrual','0',fmt(g.iAccC)],['Current tax payable',fmt(g.taxO),fmt(g.taxC)],['Cash and cash equivalents',fmt(g.cashO),'?']],[1,2]);
  return {type:'statement',company:g.co,unit:'£000',prompt:`<p>Prepare the statement of cash flows (£000). Profit before tax was ${fmt(g.pbt)}, after depreciation of ${fmt(g.dep)}${g.amort?`, amortisation of ${fmt(g.amort)}`:''} and finance costs of ${fmt(g.fin)}. The current tax charge for the year was ${fmt(g.ctax)}. PPE bought for cash: ${fmt(g.ppe)}${g.sale?`; old equipment sold for ${fmt(g.sale)} (at its carrying amount, so no profit or loss)`:''}. ${g.loanChg>0?`A new loan of ${fmt(g.loanChg)} was taken out. `:g.loanChg<0?`${fmt(-g.loanChg)} of the loan was repaid. `:''}${g.iss?`Shares were issued for ${fmt(g.iss)} in cash. `:''}Dividends paid: ${fmt(g.div)}.</p>${info}<p class="hint">Enter cash outflows as negative numbers or in brackets.</p>`,title:'Statement of Cash Flows for the year ended 31 December',rows,explain:`Cash generated from operations = ${fmt(g.adj)} ${g.dInv<0?'−':'+'} ${fmt(Math.abs(g.dInv))} ${g.dRec<0?'−':'+'} ${fmt(Math.abs(g.dRec))} ${g.dPay<0?'−':'+'} ${fmt(Math.abs(g.dPay))} = ${fmt(g.cgo)}. Interest paid = ${fmt(g.fin)} − ${fmt(g.iAccC)} owed = ${fmt(g.intPaid)}. Tax paid = ${fmt(g.taxO)} + ${fmt(g.ctax)} − ${fmt(g.taxC)} = ${fmt(g.taxPaid)}. Closing cash = ${fmt(g.cashO)} + (${fmt(g.chg)}) = ${fmt(g.cashC)}.`};}),
 fixed({type:'fields',prompt:'<p>Use the Marsh Lane Cycles statement at the top of this page.</p>',fields:[{label:'Free cash flow in 2025 (£000)',answer:360},{label:'Cash generated from operations as a % of operating profit (whole number)',answer:119,tol:1,unit:'%'}],explain:'Free cash flow = 660 − 300 = 360. Cash conversion = 830 ÷ 700 × 100 = 119%.'}),
 fixed({type:'classify',prompt:'<p>Does each change add to or take away from operating cash flow?</p>',options:['Add','Subtract','Not in operating activities'],items:[['Depreciation charged','Add'],['Inventories increased','Subtract'],['Trade payables increased','Add'],['Trade receivables increased','Subtract'],['Dividends paid','Not in operating activities'],['Revaluation gain on property','Not in operating activities']].map(([l,a])=>({label:l,answer:a})),explain:'Non-cash expenses are added back. More stock or receivables uses cash; more payables keeps cash. Dividends are financing, and revaluations don’t involve cash at all.'})
]});

/* ---------- Page 7: consolidated statement of financial position ---------- */
const HF_IND=sTable(['Statements of financial position at 31 December 2025 (£000)','Harbour Foods plc','Quay Bakery Ltd'],[
['Property, plant and equipment','5,000','2,200'],['Investment in Quay Bakery Ltd (at cost)','2,400','–'],['Inventories','900','400'],['Trade receivables','800','500'],['Cash and cash equivalents','300','100'],['<b>Total assets</b>','<b>9,400</b>','<b>3,200</b>'],
['Share capital (£1 shares)','3,000','1,000'],['Retained earnings','4,200','1,500'],['Non-current liabilities: bank loans','1,200','300'],['Trade payables','1,000','400'],['<b>Total equity and liabilities</b>','<b>9,400</b>','<b>3,200</b>']],[1,2]);
const HF_INFO='<ul><li>Harbour Foods bought <b>80%</b> of Quay Bakery’s shares on 1 January 2023 for <b>£2,400,000</b> cash.</li><li>On that date Quay’s retained earnings were <b>£700,000</b>. Its assets were worth what the books said (no fair value changes).</li><li>The non-controlling interest (the other 20%) was valued at <b>£550,000</b> on that date.</li><li>At 31 December 2025, Quay owes Harbour <b>£120,000</b> for goods. This is in Harbour’s receivables and Quay’s payables.</li><li>Goodwill has not been impaired.</li></ul>';
const GRP_NAMES=[['Harbour Foods plc','Quay Bakery Ltd'],['Northgate Tools plc','Rivet Supplies Ltd'],['Elmwood Homes plc','Brick & Beam Ltd'],['Castle Print plc','Inkwell Ltd'],['Saltmarsh Leisure plc','Tidewater Hotels Ltd']];
function consGen(){for(;;){
  const [P,S]=pick(GRP_NAMES),pct=pick([60,70,75,80,90]),yr=pick([2021,2022,2023]);
  const scS=rint(5,20)*100,reA=rint(3,15)*100,post=rint(2,12)*100,reS=reA+post,na=scS+reA;
  const nclS=rint(0,6)*100,payS=rint(2,8)*100,invS=rint(2,6)*100,recS=rint(2,6)*100,cashS=rint(1,3)*100;
  const ppeS=scS+reS+nclS+payS-invS-recS-cashS;
  const cost=Math.round((na*pct/100+rint(2,10)*100)/100)*100,nciA=Math.round((na*(100-pct)/100+rint(1,4)*50)/50)*50,gw=cost+nciA-na;
  const scP=rint(20,50)*100,reP=rint(20,60)*100,nclP=rint(5,20)*100,payP=rint(5,15)*100,invP=rint(5,12)*100,recP=rint(5,12)*100,cashP=rint(1,5)*100;
  const ppeP=scP+reP+nclP+payP-cost-invP-recP-cashP,ig=rint(1,3)*50;
  if(ppeS<300||ppeP<800||gw<=0||ig>payS)continue;
  const grpPost=post*pct/100,nciPost=post-grpPost,nci=nciA+nciPost,re=reP+grpPost;
  const g={P,S,pct,yr,scS,reA,reS,post,na,cost,nciA,gw,ig,grpPost,nciPost,nci,re,sc:scP,
    ppe:ppeP+ppeS,inv:invP+invS,rec:recP+recS-ig,cash:cashP+cashS,ncl:nclP+nclS,pay:payP+payS-ig};
  g.nca=g.gw+g.ppe;g.ca=g.inv+g.rec+g.cash;g.ta=g.nca+g.ca;g.eqP=g.sc+g.re;g.eq=g.eqP+g.nci;
  if(g.eq+g.ncl+g.pay!==g.ta)continue;
  g.ind=sTable([`Statements of financial position at 31 December 2025 (£000)`,P,S],[
    ['Property, plant and equipment',fmt(ppeP),fmt(ppeS)],[`Investment in ${S} (at cost)`,fmt(cost),'–'],['Inventories',fmt(invP),fmt(invS)],['Trade receivables',fmt(recP),fmt(recS)],['Cash and cash equivalents',fmt(cashP),fmt(cashS)],
    ['<b>Total assets</b>',`<b>${fmt(ppeP+cost+invP+recP+cashP)}</b>`,`<b>${fmt(ppeS+invS+recS+cashS)}</b>`],
    ['Share capital (£1 shares)',fmt(scP),fmt(scS)],['Retained earnings',fmt(reP),fmt(reS)],['Non-current liabilities: bank loans',fmt(nclP),nclS?fmt(nclS):'–'],['Trade payables',fmt(payP),fmt(payS)],
    ['<b>Total equity and liabilities</b>',`<b>${fmt(scP+reP+nclP+payP)}</b>`,`<b>${fmt(scS+reS+nclS+payS)}</b>`]],[1,2]);
  g.info=`<ul><li>${P} bought <b>${pct}%</b> of ${S}’s shares on 1 January ${yr} for <b>${fmt(cost)}</b>.</li><li>On that date ${S}’s retained earnings were <b>${fmt(reA)}</b>. Its assets were worth what the books said.</li><li>The non-controlling interest was valued at <b>${fmt(nciA)}</b> on that date.</li><li>At 31 December 2025, ${S} owes ${P} <b>${fmt(ig)}</b>.</li><li>Goodwill has not been impaired.</li></ul>`;
  return g;}}

TOPICS.push({id:'fs-consol',level:'fs',title:'Consolidated statement of financial position',blurb:'A group’s balance sheet: a parent and the company it controls, shown as one business. Explained line by line.',
lesson:`${fsAnnot({co:'Harbour Foods plc',title:'Consolidated Statement of Financial Position',period:'as at 31 December 2025',unit:'£000',years:['2025'],headNote:1,rows:[
{head:'Assets'},
{head:'Non-current assets'},
{l:'Goodwill',c:[1250],ind:1,n:2},
{l:'Property, plant and equipment',c:[7200],ind:1,n:3},
{l:'',c:[8450],t:'sub'},
{head:'Current assets'},
{l:'Inventories',c:[1300],ind:1},
{l:'Trade receivables',c:[1180],ind:1,n:4},
{l:'Cash and cash equivalents',c:[400],ind:1},
{l:'',c:[2880],t:'sub'},
{l:'Total assets',c:[11330],b:1,t:'dbl'},
{head:'Equity and liabilities'},
{head:'Equity attributable to owners of the parent',n:7},
{l:'Share capital',c:[3000],ind:1,n:5},
{l:'Retained earnings',c:[4840],ind:1,n:6},
{l:'',c:[7840],t:'sub'},
{l:'Non-controlling interest',c:[710],ind:1,n:8},
{l:'Total equity',c:[8550],b:1,t:'sub'},
{head:'Non-current liabilities'},
{l:'Bank loans',c:[1500],ind:1},
{head:'Current liabilities'},
{l:'Trade payables',c:[1280],ind:1,n:9},
{l:'Total equity and liabilities',c:[11330],b:1,t:'dbl',n:10}],
notes:[[1,'Heading','“Consolidated” means the parent (Harbour Foods) and the company it controls (Quay Bakery, 80% owned) are shown as if they were one business. Figures are in £000. Real reports also show last year; this one shows one year to keep it simple.'],
[2,'Goodwill','The extra paid for Quay above the value of its net assets, for things like its name and customers. Price 2,400 + non-controlling interest 550 − Quay’s net assets on the day 1,700 = 1,250. Harbour’s “Investment in Quay 2,400” is not on this statement. It has been replaced by Quay’s assets, liabilities and this goodwill.'],
[3,'Property, plant and equipment','Add 100% of both companies: 5,000 + 2,200 = 7,200. This is 100%, not 80%, because Harbour controls all of Quay’s assets. Every asset and liability line works the same way.'],
[4,'Trade receivables','800 + 500 − 120 = 1,180. The 120 Quay owes Harbour is removed. A group cannot owe money to itself.'],
[5,'Share capital','Harbour’s shares only: 3,000. Quay’s 1,000 of share capital is cancelled when goodwill is worked out.'],
[6,'Retained earnings','Harbour’s 4,200 + 80% of the profit Quay has kept since it was bought. Quay’s profit since then = 1,500 − 700 = 800. 80% × 800 = 640. Total 4,200 + 640 = 4,840. Quay’s profit from before the purchase is not group profit.'],
[7,'Equity attributable to owners of the parent','3,000 + 4,840 = 7,840. This is the part of the group that belongs to Harbour’s own shareholders.'],
[8,'Non-controlling interest','The 20% of Quay owned by other shareholders. Value on the purchase date 550 + 20% of profit since then (20% × 800 = 160) = 710.'],
[9,'Trade payables','1,000 + 400 − 120 = 1,280. The same 120 is removed on this side, so both sides go down by the same amount.'],
[10,'Total equity and liabilities','8,550 + 1,500 + 1,280 = 11,330, the same as total assets.']]})}
<h3>How to read it</h3>
<ol class="steps-list">
<li><b>Check it balances:</b> total assets £11,330 = total equity and liabilities £11,330.</li>
<li><b>Remember the lines are 100%:</b> each asset and liability includes all of the subsidiary, even though Harbour owns 80%. The outside owners’ 20% is shown in one line: non-controlling interest (£710).</li>
<li><b>Look at goodwill:</b> 1,250 ÷ 11,330 = 11.0% of total assets. If the subsidiary does badly, goodwill may be written down (impaired), and that reduces profit.</li>
<li><b>See who owns the equity:</b> £7,840 belongs to Harbour’s shareholders and £710 to the non-controlling interest. 710 ÷ 8,550 = 8.3%.</li>
<li><b>Compare with the parent alone:</b> Harbour’s own balance sheet shows total assets of £9,400. The group shows £11,330, because Quay’s assets are brought in line by line.</li></ol>
<p>For more practice with goodwill and group workings, see the Group accounts topic.</p>`,
example:`<p>Start with each company’s own balance sheet and the extra information.</p>
${HF_IND}
${HF_INFO}
<h3>Steps</h3>
<ol class="steps-list">
<li><b>Group structure:</b> Harbour owns 80%. The non-controlling interest owns 20%.</li>
<li><b>Quay’s net assets:</b> on the purchase date, share capital 1,000 + retained earnings 700 = <b>1,700</b>. Now: 1,000 + 1,500 = 2,500. Profit since the purchase = 2,500 − 1,700 = <b>800</b>.</li>
<li><b>Goodwill:</b> price paid 2,400 + non-controlling interest 550 − net assets on the purchase date 1,700 = <b>1,250</b>.</li>
<li><b>Non-controlling interest:</b> 550 + 20% × 800 = <b>710</b>.</li>
<li><b>Group retained earnings:</b> Harbour 4,200 + 80% × 800 = <b>4,840</b>.</li>
<li><b>Remove the amount the two companies owe each other:</b> take 120 off receivables and 120 off payables.</li>
<li><b>Add the rest line by line</b> and take out the investment and Quay’s share capital. The table below shows every line.</li></ol>
${sTable(['£000','Harbour','Quay','Adjustment','Group'],[
['Goodwill','–','–','+1,250 (step 3)','1,250'],['Investment in Quay','2,400','–','(2,400)','–'],['Property, plant and equipment','5,000','2,200','','7,200'],['Inventories','900','400','','1,300'],['Trade receivables','800','500','(120)','1,180'],['Cash and cash equivalents','300','100','','400'],
['Share capital','3,000','1,000','(1,000)','3,000'],['Retained earnings','4,200','1,500','(860)','4,840'],['Non-controlling interest','–','–','+710 (step 4)','710'],['Bank loans','1,200','300','','1,500'],['Trade payables','1,000','400','(120)','1,280']],[1,2,3,4])}
<p>The (860) on retained earnings is Quay’s profit from before the purchase (700, used in goodwill) plus the non-controlling interest’s 20% share of later profit (160). 1,500 − 860 = 640, which is Harbour’s share.</p>`,
practice:[
 gen(()=>{const g=consGen();return {type:'fields',prompt:`<p>${g.P} bought ${g.pct}% of ${g.S} on 1 January ${g.yr} for <b>${fmt(g.cost)}</b>. On that date ${g.S} had share capital of <b>${fmt(g.scS)}</b> and retained earnings of <b>${fmt(g.reA)}</b>. The non-controlling interest was valued at <b>${fmt(g.nciA)}</b>. ${g.S}’s retained earnings are now <b>${fmt(g.reS)}</b>. ${g.P}’s own retained earnings are <b>${fmt(g.re-g.grpPost)}</b>. All figures are in £000.</p>`,fields:[{label:'Goodwill (£000)',answer:g.gw},{label:'Non-controlling interest now (£000)',answer:g.nci},{label:'Group retained earnings (£000)',answer:g.re}],explain:`Goodwill = ${fmt(g.cost)} + ${fmt(g.nciA)} − (${fmt(g.scS)} + ${fmt(g.reA)}) = ${fmt(g.gw)}. Profit since purchase = ${fmt(g.reS)} − ${fmt(g.reA)} = ${fmt(g.post)}. NCI = ${fmt(g.nciA)} + ${100-g.pct}% × ${fmt(g.post)} = ${fmt(g.nci)}. Group retained earnings = ${fmt(g.re-g.grpPost)} + ${g.pct}% × ${fmt(g.post)} = ${fmt(g.re)}.`};}),
 gen(()=>{const g=consGen();const rows=[{head:'Assets'},{l:'Non-current assets',b:1},{l:'Goodwill',i:{a:g.gw},ind:1},{l:'Property, plant and equipment',i:{a:g.ppe},ind:1},{l:'Total non-current assets',o:{a:g.nca},ti:1},{l:'Current assets',b:1},{l:'Inventories',i:{a:g.inv},ind:1},{l:'Trade receivables',i:{a:g.rec},ind:1},{l:'Cash and cash equivalents',i:{a:g.cash},ind:1},{l:'Total current assets',o:{a:g.ca},ti:1},{l:'Total assets',o:{a:g.ta},b:1,t:'dbl'},{head:'Equity and liabilities'},{l:'Equity attributable to owners of the parent',b:1},{l:'Share capital',i:{a:g.sc},ind:1},{l:'Retained earnings',i:{a:g.re},ind:1},{l:'Total attributable to owners of the parent',o:{a:g.eqP},ti:1},{l:'Non-controlling interest',i:{a:g.nci},ind:1},{l:'Total equity',o:{a:g.eq},ti:1,b:1},{l:'Non-current liabilities: bank loans',o:{a:g.ncl}},{l:'Current liabilities: trade payables',o:{a:g.pay}},{l:'Total equity and liabilities',o:{a:g.ta},b:1,t:'dbl'}];
  return {type:'statement',company:g.P,unit:'£000',prompt:`<p>Prepare the consolidated statement of financial position. All figures are in £000.</p>${g.ind}${g.info}`,title:'Consolidated Statement of Financial Position as at 31 December',rows,explain:`Goodwill = ${fmt(g.cost)} + ${fmt(g.nciA)} − ${fmt(g.na)} = ${fmt(g.gw)}. Assets and liabilities are added in full. Receivables and payables are both reduced by ${fmt(g.ig)}. Share capital is ${g.P}’s only. Retained earnings = ${fmt(g.re-g.grpPost)} + ${g.pct}% × ${fmt(g.post)} = ${fmt(g.re)}. NCI = ${fmt(g.nciA)} + ${100-g.pct}% × ${fmt(g.post)} = ${fmt(g.nci)}. Total ${fmt(g.ta)} on both sides.`};}),
 fixed({type:'classify',prompt:'<p>How does each item get into the consolidated statement of financial position?</p>',options:['Add parent + subsidiary in full','Parent only','Remove (cancel out)','Worked out separately'],items:[['Property, plant and equipment','Add parent + subsidiary in full'],['Inventories','Add parent + subsidiary in full'],['Bank loans owed to an outside bank','Add parent + subsidiary in full'],['Share capital','Parent only'],['Investment in the subsidiary','Remove (cancel out)'],['Money the subsidiary owes the parent','Remove (cancel out)'],['Goodwill','Worked out separately'],['Non-controlling interest','Worked out separately']].map(([l,a])=>({label:l,answer:a})),explain:'Assets and liabilities are added in full because the parent controls them. Only the parent’s share capital appears. The investment and any amounts owed inside the group cancel out. Goodwill, non-controlling interest and group retained earnings come from workings.'})
]});


/* ================= SITE ================= */
const IFRS4_ACCTS=IFRS2_ACCTS.concat(['Deferred income','Other income','Investment property','Gain on investment property','Exchange gain','Exchange loss']);
TOPICS.push({id:'ias8',level:'y3',title:'IAS 8: Policies, estimates and errors',blurb:'Telling a change of policy from a change of estimate or an error, and whether to fix it looking back or looking forward.',
lesson:`<p>IAS 8 covers three kinds of change. The treatment depends on which one it is.</p>
<div class="scroll"><table class="ledger simple"><thead><tr><th class="">What changed</th><th class="">Examples</th><th class="">Treatment</th></tr></thead><tbody><tr><td class=""><b>Accounting policy</b></td><td class="">Change of inventory cost formula; a new IFRS applied for the first time</td><td class=""><b>Retrospective</b>: restate comparatives and opening retained earnings</td></tr><tr><td class=""><b>Accounting estimate</b></td><td class="">Useful life, residual value, depreciation method, bad debt allowance</td><td class=""><b>Prospective</b>: this year and future years only</td></tr><tr><td class=""><b>Prior period error</b></td><td class="">Arithmetic mistakes, misapplied policies, oversights, fraud</td><td class=""><b>Retrospective</b>: restate as if the error had never happened</td></tr></tbody></table></div>
<h3>When can a company change a policy?</h3>
<p>Only if a new or amended standard requires it, or if the new policy gives <b>more reliable and relevant</b> information. Companies can’t switch policies just to improve their profit.</p>
<h3>Policy or estimate?</h3>
<p>If you can’t tell, treat it as a change in estimate. A change in <b>depreciation method</b> (for example straight line to reducing balance) is a change in estimate, because it reflects a new view of how the asset is used up.</p>
<h3>How to correct a prior period error</h3>
<ol><li>Restate the comparative figures for the earlier year as if the error had never happened.</li><li>If the error is from before the earliest year shown, adjust opening retained earnings.</li><li>Disclose the nature of the error and the amount of each correction.</li></ol>
<div class="note"><b>Name change.</b> From 1 January 2027, IFRS 18 renames IAS 8 “Basis of Preparation of Financial Statements”. The rules on policies, estimates and errors stay the same.</div>`,
example:`<p>A machine cost £100,000 and was depreciated straight line over 10 years with no residual value. At the start of year 5, the company decides its total useful life will be 8 years, not 10.</p><div class="scroll"><table class="ledger simple"><thead><tr><th class="">Working</th><th class="amt">£</th></tr></thead><tbody><tr><td class="">Cost</td><td class="amt">100,000</td></tr><tr><td class="">Depreciation for years 1–4 (4 × 10,000)</td><td class="amt">(40,000)</td></tr><tr><td class=""><b>Carrying amount at the start of year 5</b></td><td class="amt"><b>60,000</b></td></tr><tr><td class="">Remaining life: 8 − 4 = 4 years</td><td class="amt"></td></tr><tr><td class=""><b>New annual depreciation: 60,000 ÷ 4</b></td><td class="amt"><b>15,000</b></td></tr></tbody></table></div><p>This is a change in estimate, so it is <b>prospective</b>: years 5 to 8 are charged £15,000 each. Years 1 to 4 are not restated.</p>`,
practice:[
 gen(()=>{const pool=[['Changing the inventory cost formula from FIFO to weighted average','Policy'],['Changing the useful life of vans from 5 to 4 years','Estimate'],['Raising the bad debt allowance from 2% to 3% of receivables','Estimate'],['Finding that last year’s closing inventory was counted twice','Error'],['Changing depreciation from straight line to reducing balance','Estimate'],['Finding a mistake in last year’s depreciation calculation','Error'],['Applying a new IFRS for the first time, as it requires','Policy'],['Revising the residual value of a building','Estimate']];return {type:'classify',prompt:'<p>Is each item a change in accounting policy, a change in estimate, or a prior period error?</p>',options:['Policy','Estimate','Error'],items:pickN(pool,6).map(([l,a])=>({label:l,answer:a})),explain:'Policies and errors are corrected retrospectively (restate). Estimates are changed prospectively (from now on).'};}),
 gen(()=>{for(;;){const c=rint(1,6)*120000,n=pick([8,10,12]),y=rint(2,4),m=n-pick([2,3]);if(m<=y+1)continue;const ca=c-c/n*y,rem=m-y,d=ca/rem;return {type:'fields',prompt:`<p>An asset cost ${money(c)} and is depreciated straight line over ${n} years with no residual value. At the start of year ${y+1}, its total useful life is revised to ${m} years.</p>`,fields:[{label:'Carrying amount at the start of year '+(y+1)+' (£)',answer:ca,tol:1,display:fmt(Math.round(ca))},{label:'New annual depreciation (£)',answer:d,tol:1,display:fmt(Math.round(d))}],explain:`Carrying amount = ${money(c)} − ${y} × ${money(c/n)} = ${money(Math.round(ca))}. Remaining life = ${m} − ${y} = ${rem} years. New depreciation = ${money(Math.round(ca))} ÷ ${rem} = ${money(Math.round(d))}. It’s a change in estimate, so earlier years aren’t restated.`};}}),
 gen(()=>{const x=rint(4,40)*1000,p=rint(60,200)*1000;return {type:'fields',prompt:`<p>This year, a company finds that last year’s closing inventory was overstated by ${money(x)}. Last year’s reported profit was ${money(p)}. Ignore tax.</p>`,fields:[{label:'Restated profit for last year (£)',answer:p-x},{label:'Amount this year’s opening retained earnings must be reduced by (£)',answer:x}],explain:`Overstated closing inventory means cost of sales was too low, so last year’s profit falls by ${money(x)} to ${money(p-x)}. It’s a prior period error, so the comparatives are restated and opening retained earnings fall by ${money(x)}.`};}),
 mcqPool([
  {q:'A company changes how it estimates its warranty provision. How is this treated?',options:['Prospectively, from this year on','Retrospectively, restating last year','As a prior period error','It isn’t allowed'],why:'A new way of estimating is a change in accounting estimate, applied prospectively.'},
  {q:'When may a company voluntarily change an accounting policy?',options:['When the new policy gives more reliable and relevant information','Whenever the directors want a higher profit','Only when the auditor asks','Never'],why:'IAS 8 allows a voluntary change only if it makes the information more reliable and relevant.'},
  {q:'If it is unclear whether a change is a policy or an estimate, IAS 8 says to treat it as:',options:['A change in estimate','A change in policy','A prior period error','Nothing, until it becomes clear'],why:'When in doubt, it is a change in estimate and is applied prospectively.'}])]});
TOPICS.push({id:'ias10',level:'y3',title:'IAS 10: Events after the reporting period',blurb:'Which events after the year end change the figures, which only need a note, and the going concern exception.',
lesson:`<p>IAS 10 covers events between the <b>end of the reporting period</b> and the date the accounts are <b>authorised for issue</b>.</p>
<div class="scroll"><table class="ledger simple"><thead><tr><th class="">Type</th><th class="">Test</th><th class="">Treatment</th><th class="">Examples</th></tr></thead><tbody><tr><td class=""><b>Adjusting</b></td><td class="">Gives evidence about conditions that existed at the year end</td><td class="">Change the figures</td><td class="">Customer insolvency relating to a year-end debt; inventory sold below cost after the year end; settlement of a court case open at the year end; discovery of fraud or errors</td></tr><tr><td class=""><b>Non-adjusting</b></td><td class="">About conditions that arose after the year end</td><td class="">Disclose the nature and financial effect, if material</td><td class="">Fire or flood; a major acquisition; a fall in the market value of investments; announcing a restructuring; share issues</td></tr></tbody></table></div>
<h3>Dividends</h3>
<p>Dividends declared <b>after</b> the year end are not a liability at the year end, because there was no obligation then. They are disclosed in the notes.</p>
<h3>Going concern: the big exception</h3>
<p>If, after the year end, management decides to close the business, or has no realistic alternative, the accounts must <b>not</b> be prepared on a going concern basis, even though the problem arose after the year end.</p>`,
example:`<p>A company’s year end is 31 December 20X5. The accounts are approved on 15 March 20X6. Three things happen in between:</p><div class="scroll"><table class="ledger simple"><thead><tr><th class="">Event</th><th class="">Type</th><th class="">Effect on the 20X5 accounts</th></tr></thead><tbody><tr><td class="">20 Jan: a customer owing £40,000 goes into liquidation. The liquidator expects to pay 25p in the £</td><td class="">Adjusting</td><td class="">Write down the receivable by £40,000 × 75% = <b>£30,000</b></td></tr><tr><td class="">8 Feb: a fire destroys inventory costing £90,000</td><td class="">Non-adjusting</td><td class="">Disclose in the notes: what happened and the £90,000 loss</td></tr><tr><td class="">1 Mar: the directors declare a dividend of £50,000</td><td class="">Non-adjusting</td><td class="">Not a liability. Disclose it in the notes</td></tr></tbody></table></div><div class="scroll"><table class="ledger"><thead><tr><th>Account</th><th class="amt">Dr £</th><th class="amt">Cr £</th></tr></thead><tbody><tr><td class="">Irrecoverable debts expense</td><td class="amt">30,000</td><td class="amt"></td></tr><tr><td class="cr-line">Trade receivables</td><td class="amt"></td><td class="amt">30,000</td></tr><tr class="narr"><td colspan="3">(Write-down of debt from customer in liquidation at the year end)</td></tr></tbody></table></div>`,
practice:[
 gen(()=>{const pool=[['A customer who owed money at the year end goes into liquidation in January','Adjusting'],['Inventory held at the year end is sold in February for less than cost','Adjusting'],['A fire destroys a warehouse in February','Non-adjusting'],['A court case open at the year end is settled in February for more than was provided','Adjusting'],['Dividends are declared after the year end','Non-adjusting'],['The company buys another business in March','Non-adjusting'],['A fraud discovered in February shows that sales last year were overstated','Adjusting'],['The market value of the company’s investments falls sharply in January','Non-adjusting']];return {type:'classify',prompt:'<p>The year end is 31 December and the accounts are approved in March. Is each event adjusting or non-adjusting?</p>',options:['Adjusting','Non-adjusting'],items:pickN(pool,6).map(([l,a])=>({label:l,answer:a})),explain:'Adjusting events tell you more about conditions at the year end. Non-adjusting events are about new conditions after it.'};}),
 gen(()=>{const r=rint(10,80)*1000,p=pick([0,10,20,25,40]);const w=r*(100-p)/100;return {type:'fields',prompt:`<p>At the year end a customer owed ${money(r)}. In January the customer went into liquidation, and the liquidator expects to pay ${p}p in the £.</p>`,fields:[{label:'Amount to write off in this year’s accounts (£)',answer:w}],explain:`This is an adjusting event: the customer was already in trouble at the year end. Write off ${money(r)} × ${100-p}% = ${money(w)}.`};}),
 gen(()=>{const p=rint(20,120)*1000,s=p+rint(2,30)*1000;return {type:'fields',prompt:`<p>At the year end a company provided ${money(p)} for a court case. In February, before the accounts were approved, the case was settled for ${money(s)}.</p>`,fields:[{label:'Provision to show at the year end (£)',answer:s},{label:'Extra expense to recognise (£)',answer:s-p}],explain:`The settlement confirms the obligation that existed at the year end, so it’s adjusting. Increase the provision to ${money(s)}: an extra expense of ${money(s-p)}.`};}),
 mcqPool([
  {q:'After the year end, the directors decide to liquidate the company. What does IAS 10 require?',options:['The accounts are not prepared on a going concern basis','Disclose it in the notes only','Ignore it until next year','Create a provision for closure costs only'],why:'Going concern is the exception: a decision after the year end to liquidate means the going concern basis can’t be used.'},
  {q:'Up to what date must events be considered under IAS 10?',options:['The date the accounts are authorised for issue','The year end','The date of the AGM','The date the tax return is filed'],why:'IAS 10 covers events up to the date the accounts are authorised for issue.'},
  {q:'A dividend declared after the year end is shown as:',options:['A note, not a liability','A liability at the year end','An expense in profit or loss','A reduction in revenue'],why:'There was no obligation at the year end, so it isn’t a liability. It is disclosed.'}])]});
TOPICS.push({id:'ias20',level:'y3',title:'IAS 20: Government grants',blurb:'When to recognise a grant, spreading capital grants over the asset’s life, and what happens if a grant must be repaid.',
lesson:`<h3>When to recognise a grant</h3>
<p>Only when there is <b>reasonable assurance</b> that the business will meet the conditions <b>and</b> that the grant will be received.</p>
<h3>Capital grants: two allowed methods</h3>
<div class="scroll"><table class="ledger simple"><thead><tr><th class="">Method</th><th class="">How it works</th><th class="">Effect each year</th></tr></thead><tbody><tr><td class=""><b>Deferred income</b></td><td class="">Show the grant as a liability, and release it to profit over the asset’s life</td><td class="">Other income = grant ÷ life</td></tr><tr><td class=""><b>Deduct from cost</b></td><td class="">Reduce the asset’s cost by the grant</td><td class="">Lower depreciation = (cost − grant) ÷ life</td></tr></tbody></table></div>
<p>Both give the same profit each year. They just present it differently.</p>
<h3>Revenue grants</h3>
<p>Recognise in profit in the same periods as the costs they cover, either as other income or by reducing the related expense.</p>
<h3>Repaying a grant</h3>
<p>If conditions are broken and the grant must be repaid, first use any deferred income still held. Any excess is an expense straight away.</p>`,
example:`<p>A company buys a machine for £100,000 with a 5-year life and receives a government grant of £20,000 towards it. It uses the deferred income method.</p><div class="scroll"><table class="ledger simple"><thead><tr><th class="">Working</th><th class="amt">£</th></tr></thead><tbody><tr><td class="">Grant received</td><td class="amt">20,000</td></tr><tr><td class="">Released to profit each year: 20,000 ÷ 5</td><td class="amt">4,000</td></tr><tr><td class=""><b>Deferred income at the end of year 1</b></td><td class="amt"><b>16,000</b></td></tr><tr><td class="">of which current (released next year)</td><td class="amt">4,000</td></tr><tr><td class="">of which non-current</td><td class="amt">12,000</td></tr></tbody></table></div><div class="scroll"><table class="ledger"><thead><tr><th>Account</th><th class="amt">Dr £</th><th class="amt">Cr £</th></tr></thead><tbody><tr><td class="">Cash</td><td class="amt">20,000</td><td class="amt"></td></tr><tr><td class="cr-line">Deferred income</td><td class="amt"></td><td class="amt">20,000</td></tr><tr class="narr"><td colspan="3">(Grant received)</td></tr></tbody></table></div><div class="scroll"><table class="ledger"><thead><tr><th>Account</th><th class="amt">Dr £</th><th class="amt">Cr £</th></tr></thead><tbody><tr><td class="">Deferred income</td><td class="amt">4,000</td><td class="amt"></td></tr><tr><td class="cr-line">Other income</td><td class="amt"></td><td class="amt">4,000</td></tr><tr class="narr"><td colspan="3">(Year 1 release of the grant)</td></tr></tbody></table></div>`,
practice:[
 gen(()=>{const g=rint(2,20)*5000,n=pick([4,5,8,10]);const r=g/n;return {type:'fields',prompt:`<p>A company receives a grant of ${money(g)} towards a machine with a ${n}-year life. It uses the deferred income method.</p>`,fields:[{label:'Grant released to profit each year (£)',answer:r},{label:'Deferred income at the end of year 1 (£)',answer:g-r},{label:'Of which non-current (£)',answer:g-2*r}],explain:`Release = ${money(g)} ÷ ${n} = ${money(r)} a year. After year 1, ${money(g-r)} is left. Next year’s ${money(r)} is current, so ${money(g-2*r)} is non-current.`};}),
 gen(()=>{const c=rint(10,50)*10000,g=rint(1,4)*c/10,n=pick([4,5,10]);return {type:'fields',prompt:`<p>An asset costs ${money(c)} and a grant of ${money(g)} is received towards it. The company deducts the grant from the asset’s cost. The asset lasts ${n} years with no residual value.</p>`,fields:[{label:'Annual depreciation (£)',answer:(c-g)/n}],explain:`Depreciable amount = ${money(c)} − ${money(g)} = ${money(c-g)}. ÷ ${n} = ${money((c-g)/n)} a year.`};}),
 gen(()=>{const n=pick([5,8,10]),g=n*rint(2,10)*1000,y=rint(1,3);const released=g/n*y;return {type:'fields',prompt:`<p>${y} year${y>1?'s':''} ago a company received a grant of ${money(g)} for an asset with a ${n}-year life, using the deferred income method. It has now broken the grant’s conditions and must repay the full ${money(g)}.</p>`,fields:[{label:'Deferred income still held (£)',answer:g-released},{label:'Expense to charge straight away (£)',answer:released}],explain:`${money(released)} has already been released (${y} × ${money(g/n)}), leaving ${money(g-released)} deferred. The repayment first uses the deferred income; the other ${money(released)} is an immediate expense.`};}),
 gen(()=>{const g=rint(2,30)*1000;return {type:'journal',prompt:`<p>A company receives a government grant of ${money(g)} in cash towards a new machine. It uses the deferred income method. Record the receipt.</p>`,accounts:IFRS4_ACCTS,answer:[['Cash',g,0],['Deferred income',0,g]],explain:'The grant isn’t income yet. It is held as deferred income (a liability) and released over the asset’s life.'};}),
 mcqPool([
  {q:'When should a government grant be recognised?',options:['When there is reasonable assurance the conditions will be met and the grant received','When the application is sent','Only when the conditions are met in full','When the cash is spent'],why:'IAS 20 needs reasonable assurance on both the conditions and receipt.'},
  {q:'Under the deferred income method, where is the unreleased grant shown?',options:['As a liability','As equity','Deducted from revenue','As a current asset'],why:'The unreleased amount is deferred income, a liability, split into current and non-current parts.'}])]});
TOPICS.push({id:'ias23',level:'y3',title:'IAS 23: Borrowing costs',blurb:'Adding interest to the cost of an asset while it is being built: specific loans, general borrowings and when to start and stop.',
lesson:`<h3>What must be capitalised</h3>
<p>Borrowing costs <b>directly attributable</b> to building a <b>qualifying asset</b> must be capitalised as part of its cost. Other borrowing costs are expensed.</p>
<h3>Specific loans</h3>
<p>Capitalise the actual interest on the loan during construction, <b>less</b> any investment income earned by temporarily investing the loan money before it is spent.</p>
<h3>General borrowings</h3>
<p>If the asset is funded from general borrowings, use the <b>weighted average rate</b> on those loans and apply it to the amount spent on the asset.</p>
<div class="formula">Capitalisation rate = total interest on general borrowings ÷ total general borrowings</div>
<h3>Start, pause, stop</h3>
<div class="scroll"><table class="ledger simple"><thead><tr><th class=""></th><th class="">When</th></tr></thead><tbody><tr><td class=""><b>Start</b></td><td class="">Spending on the asset has begun, borrowing costs are being incurred and work to prepare the asset is in progress (all three)</td></tr><tr><td class=""><b>Suspend</b></td><td class="">During long periods when active work stops</td></tr><tr><td class=""><b>Stop</b></td><td class="">When the asset is substantially complete and ready for use or sale</td></tr></tbody></table></div>`,
example:`<p>On 1 April a company borrows £2,000,000 at 8% a year specifically to build a warehouse. Building starts on 1 April and finishes on 31 December. Before it was spent, some of the loan was invested and earned £10,000.</p><div class="scroll"><table class="ledger simple"><thead><tr><th class="">Working</th><th class="amt">£</th></tr></thead><tbody><tr><td class="">Interest during construction: 2,000,000 × 8% × 9/12</td><td class="amt">120,000</td></tr><tr><td class="">Less: investment income on unspent funds</td><td class="amt">(10,000)</td></tr><tr><td class=""><b>Borrowing costs capitalised</b></td><td class="amt"><b>110,000</b></td></tr></tbody></table></div><p>Interest after 31 December is an expense, because the warehouse is complete.</p>`,
practice:[
 gen(()=>{const l=rint(5,40)*100000,r=pick([5,6,7,8,10]),m=rint(4,12),inc=rint(0,20)*1000;const i=l*r/100*m/12;return {type:'fields',prompt:`<p>A company borrows ${money(l)} at ${r}% a year to build a factory. Construction takes ${m} months of the year. Before being spent, part of the loan earned investment income of ${money(inc)}.</p>`,fields:[{label:'Interest during construction (£)',answer:i,tol:1},{label:'Borrowing costs capitalised (£)',answer:i-inc,tol:1}],explain:`Interest = ${money(l)} × ${r}% × ${m}/12 = ${money(i)}. Less investment income ${money(inc)} = ${money(i-inc)} capitalised.`};}),
 gen(()=>{const a=rint(2,10)*100000,b=rint(2,10)*100000,ra=pick([5,6,8]),rb=pick([7,9,10]),e=rint(2,20)*50000,m=pick([6,9,12]);const rate=(a*ra+b*rb)/(a+b);const cap=e*rate/100*m/12;return {type:'fields',prompt:`<p>A company has general borrowings of ${money(a)} at ${ra}% and ${money(b)} at ${rb}%. It spends ${money(e)} of them on a qualifying asset, which is under construction for ${m} months of the year.</p>`,fields:[{label:'Capitalisation rate (%)',answer:rate,tol:.05,display:rate.toFixed(2)},{label:'Borrowing costs capitalised (£)',answer:cap,tol:Math.max(5,e*0.00006),display:fmt(Math.round(cap))}],explain:`Rate = (${money(a)} × ${ra}% + ${money(b)} × ${rb}%) ÷ ${money(a+b)} = ${rate.toFixed(2)}%. Capitalised = ${money(e)} × ${rate.toFixed(2)}% × ${m}/12 = ${money(Math.round(cap))}.`};}),
 gen(()=>{const pool=[['A factory that takes two years to build','Qualifying'],['A ship under construction for 18 months','Qualifying'],['Whisky that must mature for 12 years before sale','Qualifying'],['Machinery bought ready to use','Not qualifying'],['Inventory made in large quantities every week','Not qualifying'],['Office furniture delivered and installed in a day','Not qualifying']];return {type:'classify',prompt:'<p>Is each a qualifying asset under IAS 23?</p>',options:['Qualifying','Not qualifying'],items:shuffle(pool).map(([l,a])=>({label:l,answer:a})),explain:'A qualifying asset takes a substantial period of time to get ready for use or sale.'};}),
 mcqPool([
  {q:'When must capitalisation of borrowing costs stop?',options:['When the asset is substantially complete and ready for use','When the loan is repaid','At the year end','When the first payment to the builder is made'],why:'Capitalisation stops when substantially all the work to get the asset ready is complete.'},
  {q:'Work on a building stops for four months because of a planning dispute. What happens to the interest for those months?',options:['It is expensed, because capitalisation is suspended','It is still capitalised','It is deducted from the loan','It is added to equity'],why:'Capitalisation is suspended during extended periods when active development stops.'}])]});
TOPICS.push({id:'ias33',level:'y3',title:'IAS 33: Earnings per share',blurb:'Basic EPS, weighting shares issued during the year, bonus issues, and what diluted EPS means.',
lesson:`<div class="formula">Basic EPS = profit after tax attributable to ordinary shareholders ÷ weighted average number of ordinary shares</div>
<h3>Earnings</h3>
<p>Use profit after tax, less any <b>preference dividends</b> on irredeemable preference shares (those shareholders come first).</p>
<h3>Shares</h3>
<div class="scroll"><table class="ledger simple"><thead><tr><th class="">Event in the year</th><th class="">How to treat it</th></tr></thead><tbody><tr><td class=""><b>Issue at full market price</b></td><td class="">Weight by the fraction of the year the shares were in issue</td></tr><tr><td class=""><b>Bonus issue</b></td><td class="">Treat as if it happened at the start of the year. Restate last year’s EPS too, so the two are comparable</td></tr><tr><td class=""><b>Rights issue</b> (below market price)</td><td class="">Part full price, part bonus: use the bonus fraction from the theoretical ex-rights price (covered in ACCA FR)</td></tr></tbody></table></div>
<h3>Diluted EPS</h3>
<p>Shows the <b>worst case</b>: what EPS would be if every convertible loan, option and warrant turned into shares. Add back any interest saved (after tax) to earnings, and add the extra shares.</p>`,
example:`<p>A company’s profit after tax is £1,200,000. It had 4,000,000 ordinary shares on 1 January and issued 1,000,000 more at full market price on 1 October. The year end is 31 December.</p><div class="scroll"><table class="ledger simple"><thead><tr><th class="">Working</th><th class="amt">Shares</th></tr></thead><tbody><tr><td class="">4,000,000 × 12/12</td><td class="amt">4,000,000</td></tr><tr><td class="">1,000,000 × 3/12</td><td class="amt">250,000</td></tr><tr><td class=""><b>Weighted average shares</b></td><td class="amt"><b>4,250,000</b></td></tr></tbody></table></div><p><b>Basic EPS</b> = £1,200,000 ÷ 4,250,000 = <b>28.2p</b>.</p>`,
practice:[
 gen(()=>{for(;;){const n=rint(2,10)*1000000,x=rint(1,4)*500000,m=pick([3,6,9]),e=rint(40,300)*10000;const w=n+x*(12-m)/12;const eps=e/w*100;return {type:'fields',prompt:`<p>Profit after tax is ${money(e)}. On 1 January there were ${fmt(n)} ordinary shares. A further ${fmt(x)} were issued at full market price at the end of month ${m} (so they were in issue for ${12-m} months).</p>`,fields:[{label:'Weighted average number of shares',answer:w},{label:'Basic EPS (pence, 1 decimal place)',answer:eps,tol:.06,display:eps.toFixed(1)}],explain:`Weighted shares = ${fmt(n)} + ${fmt(x)} × ${12-m}/12 = ${fmt(w)}. EPS = ${money(e)} ÷ ${fmt(w)} = ${eps.toFixed(1)}p.`};}}),
 gen(()=>{const n=rint(2,8)*1000000,k=pick([2,4,5]),e=rint(40,300)*10000,prev=rint(100,400)/10;const w=n*(1+1/k);const eps=e/w*100,rest=prev*k/(k+1);return {type:'fields',prompt:`<p>Profit after tax is ${money(e)}. The company had ${fmt(n)} shares and made a 1 for ${k} bonus issue during the year. Last year’s reported EPS was ${prev.toFixed(1)}p.</p>`,fields:[{label:'Shares for the EPS calculation',answer:w},{label:'Basic EPS this year (pence, 1 dp)',answer:eps,tol:.06,display:eps.toFixed(1)},{label:'Restated EPS for last year (pence, 1 dp)',answer:rest,tol:.06,display:rest.toFixed(1)}],explain:`A bonus issue is treated as if it happened at the start of the year: ${fmt(n)} × ${k+1}/${k} = ${fmt(w)} shares. EPS = ${eps.toFixed(1)}p. Last year’s EPS is restated × ${k}/${k+1} = ${rest.toFixed(1)}p.`};}),
 gen(()=>{const p=rint(50,300)*10000,pd=rint(1,10)*10000,n=rint(2,10)*1000000;const eps=(p-pd)/n*100;return {type:'fields',prompt:`<p>Profit after tax is ${money(p)}. Dividends on irredeemable preference shares are ${money(pd)}. There were ${fmt(n)} ordinary shares all year.</p>`,fields:[{label:'Earnings for EPS (£)',answer:p-pd},{label:'Basic EPS (pence, 1 dp)',answer:eps,tol:.06,display:eps.toFixed(1)}],explain:`Preference dividends are taken off first: ${money(p)} − ${money(pd)} = ${money(p-pd)}. ÷ ${fmt(n)} = ${eps.toFixed(1)}p.`};}),
 mcqPool([
  {q:'Why is a bonus issue treated as if it happened at the start of the year?',options:['No cash comes in, so earnings capacity doesn’t change','Because it is always made on 1 January','Because the shares are free','To increase EPS'],why:'A bonus issue just splits the same company into more shares, so it’s applied to the whole year and to the comparative.'},
  {q:'Diluted EPS is:',options:['Lower than or equal to basic EPS','Always higher than basic EPS','Only for companies making losses','The same as basic EPS'],why:'Diluted EPS shows the effect of potential new shares, so it is never higher than basic EPS.'}])]});
TOPICS.push({id:'ias40',level:'y3',title:'IAS 40: Investment property',blurb:'Property held to earn rent or grow in value: the fair value and cost models, and moving property in and out of the category.',
lesson:`<h3>Is it investment property?</h3>
<div class="scroll"><table class="ledger simple"><thead><tr><th class="">Property</th><th class="">Standard</th></tr></thead><tbody><tr><td class="">Held to earn rent or for capital appreciation</td><td class=""><b>IAS 40</b> investment property</td></tr><tr><td class="">Land held for an undecided future use</td><td class=""><b>IAS 40</b></td></tr><tr><td class="">Used by the company itself (offices, factories)</td><td class="">IAS 16 property, plant and equipment</td></tr><tr><td class="">Built or bought to sell in the ordinary course of business</td><td class="">IAS 2 inventory</td></tr></tbody></table></div>
<h3>Measurement</h3>
<p>Initially at <b>cost</b>, including transaction costs such as legal fees. After that, choose one model for <b>all</b> investment property:</p>
<div class="scroll"><table class="ledger simple"><thead><tr><th class=""></th><th class="">Fair value model</th><th class="">Cost model</th></tr></thead><tbody><tr><td class="">Carried at</td><td class="">Fair value at each year end</td><td class="">Cost less depreciation</td></tr><tr><td class="">Depreciation</td><td class="">None</td><td class="">Yes</td></tr><tr><td class="">Gains and losses</td><td class="">Profit or loss</td><td class="">Only impairment losses</td></tr><tr><td class="">Disclose fair value?</td><td class="">—</td><td class="">Yes</td></tr></tbody></table></div>
<h3>Changes of use</h3>
<p>When owner-occupied property becomes investment property under the fair value model, first revalue it under <b>IAS 16</b>: the gain goes to <b>other comprehensive income</b> (revaluation surplus). After that, changes in value go to profit or loss.</p>`,
example:`<p>On 1 January a company buys an office block for £1,000,000 to lease to tenants. It uses the fair value model. At 31 December the fair value is £1,080,000.</p><div class="scroll"><table class="ledger simple"><thead><tr><th class="">Working</th><th class="amt">£</th></tr></thead><tbody><tr><td class="">Fair value at 31 December</td><td class="amt">1,080,000</td></tr><tr><td class="">Carrying amount before remeasurement</td><td class="amt">(1,000,000)</td></tr><tr><td class=""><b>Gain in profit or loss</b></td><td class="amt"><b>80,000</b></td></tr></tbody></table></div><div class="scroll"><table class="ledger"><thead><tr><th>Account</th><th class="amt">Dr £</th><th class="amt">Cr £</th></tr></thead><tbody><tr><td class="">Investment property</td><td class="amt">80,000</td><td class="amt"></td></tr><tr><td class="cr-line">Gain on investment property (P/L)</td><td class="amt"></td><td class="amt">80,000</td></tr><tr class="narr"><td colspan="3">(Remeasurement to fair value)</td></tr></tbody></table></div><p>No depreciation is charged. Compare IAS 16: a revaluation gain on a building the company uses goes to <b>OCI</b>, not profit.</p>`,
practice:[
 gen(()=>{const pool=[['An office block leased to other businesses','Investment property'],['The company’s own head office','PPE (IAS 16)'],['Land held for a use not yet decided','Investment property'],['Houses a builder has built to sell','Inventory (IAS 2)'],['A warehouse let to a third party','Investment property'],['A factory the company uses to make its products','PPE (IAS 16)']];return {type:'classify',prompt:'<p>Which standard covers each property?</p>',options:['Investment property','PPE (IAS 16)','Inventory (IAS 2)'],items:shuffle(pool).map(([l,a])=>({label:l,answer:a})),explain:'Investment property earns rent or capital growth. Property used by the business is IAS 16, and property built to sell is inventory.'};}),
 gen(()=>{const c=rint(50,300)*10000,f=c+rint(-10,20)*10000;return {type:'fields',prompt:`<p>An investment property is carried at ${money(c)} under the fair value model. At the year end its fair value is ${money(f)}.</p>`,fields:[{label:'Gain (positive) or loss (negative) in profit or loss (£)',answer:f-c},{label:'Depreciation charge for the year (£)',answer:0}],explain:`The change in fair value, ${money(f-c)}, goes to profit or loss. There is no depreciation under the fair value model.`};}),
 gen(()=>{const ca=rint(40,200)*10000,fv=ca+rint(5,40)*10000;return {type:'fields',prompt:`<p>A company moves out of a building it used as offices and starts renting it to tenants. The building’s carrying amount is ${money(ca)} and its fair value is ${money(fv)}. The company uses the fair value model for investment property.</p>`,fields:[{label:'Gain to other comprehensive income (£)',answer:fv-ca}],explain:`On transfer, first revalue under IAS 16. The ${money(fv-ca)} gain goes to OCI (revaluation surplus). Later changes go to profit or loss.`};}),
 gen(()=>{const g=rint(1,30)*5000;return {type:'journal',prompt:`<p>An investment property measured under the fair value model rises in value by ${money(g)} this year. Record the change.</p>`,accounts:IFRS4_ACCTS,answer:[['Investment property',g,0],['Gain on investment property',0,g]],explain:'Under the fair value model the gain goes to profit or loss, and the property is carried at its new fair value.'};}),
 mcqPool([
  {q:'Under the fair value model, how are changes in the value of investment property shown?',options:['In profit or loss','In other comprehensive income','Only in the notes','As a change in depreciation'],why:'Unlike IAS 16 revaluations, IAS 40 fair value changes go straight to profit or loss.'},
  {q:'A company using the cost model for investment property must also:',options:['Disclose the fair value','Revalue every year','Stop depreciating','Put gains in OCI'],why:'Under the cost model, fair value must still be disclosed in the notes.'}])]});
TOPICS.push({id:'ias21',level:'y3',title:'IAS 21: Foreign currency transactions',blurb:'Recording deals in other currencies, retranslating balances at the year end, and where exchange gains and losses go.',
lesson:`<h3>Step 1: record the transaction</h3>
<p>Translate at the <b>spot rate</b> on the transaction date (an average rate for the period can be used if rates don’t change much).</p>
<h3>Step 2: at the year end</h3>
<div class="scroll"><table class="ledger simple"><thead><tr><th class="">Item</th><th class="">Rate to use</th></tr></thead><tbody><tr><td class=""><b>Monetary</b>: cash, receivables, payables, loans</td><td class=""><b>Closing rate</b>. Retranslate, and put the difference in profit or loss</td></tr><tr><td class=""><b>Non-monetary</b> at historical cost: machinery, inventory</td><td class=""><b>Historical rate</b>. Don’t retranslate</td></tr><tr><td class="">Non-monetary at fair value</td><td class="">Rate on the date fair value was measured</td></tr></tbody></table></div>
<h3>Step 3: on settlement</h3>
<p>When the invoice is paid, any difference between the amount paid and the recorded amount is an exchange gain or loss in profit or loss.</p>
<div class="note"><b>Reading the rate.</b> “£1 = $1.30” means divide dollars by 1.30 to get pounds. A stronger pound (a higher number) makes dollar debts cheaper in pounds.</div>`,
example:`<p>On 1 November a UK company buys goods from a US supplier for $50,000, when £1 = $1.25. At the year end, 31 December, the invoice is unpaid and £1 = $1.30.</p><div class="scroll"><table class="ledger simple"><thead><tr><th class="">Working</th><th class="amt">£</th></tr></thead><tbody><tr><td class="">Purchase and payable recorded: 50,000 ÷ 1.25</td><td class="amt">40,000</td></tr><tr><td class="">Payable retranslated at closing rate: 50,000 ÷ 1.30</td><td class="amt">38,462</td></tr><tr><td class=""><b>Exchange gain in profit or loss</b></td><td class="amt"><b>1,538</b></td></tr></tbody></table></div><div class="scroll"><table class="ledger"><thead><tr><th>Account</th><th class="amt">Dr £</th><th class="amt">Cr £</th></tr></thead><tbody><tr><td class="">Trade payables</td><td class="amt">1,538</td><td class="amt"></td></tr><tr><td class="cr-line">Exchange gain (P/L)</td><td class="amt"></td><td class="amt">1,538</td></tr><tr class="narr"><td colspan="3">(Retranslation of dollar payable at the closing rate)</td></tr></tbody></table></div><p>The inventory stays at £40,000: it is non-monetary, so it isn’t retranslated.</p>`,
practice:[
 gen(()=>{for(;;){const d=rint(10,100)*1000,r1=pick([1.20,1.25,1.28,1.30]),r2=pick([1.18,1.22,1.26,1.32,1.35]);if(r1===r2)continue;const a=d/r1,b=d/r2;return {type:'fields',prompt:`<p>A UK company buys goods on credit for $${fmt(d)} when £1 = $${r1.toFixed(2)}. At the year end the invoice is unpaid and £1 = $${r2.toFixed(2)}. Round to the nearest £.</p>`,fields:[{label:'Payable when first recorded (£)',answer:a,tol:1,display:fmt(Math.round(a))},{label:'Payable at the year end (£)',answer:b,tol:1,display:fmt(Math.round(b))},{label:'Exchange gain (positive) or loss (negative) (£)',answer:a-b,tol:2,display:fmt(Math.round(a-b))}],explain:`$${fmt(d)} ÷ ${r1.toFixed(2)} = ${money(Math.round(a))}. At the year end, ÷ ${r2.toFixed(2)} = ${money(Math.round(b))}. The payable ${b<a?'fell, a gain':'rose, a loss'} of ${money(Math.round(Math.abs(a-b)))} in profit or loss.`};}}),
 gen(()=>{const pool=[['Trade payables owed in dollars','Monetary'],['A bank loan in euros','Monetary'],['Cash in a US dollar account','Monetary'],['Machinery bought from Germany','Non-monetary'],['Inventory bought from the US','Non-monetary'],['A prepayment for services, in dollars','Non-monetary'],['Trade receivables due in euros','Monetary']];return {type:'classify',prompt:'<p>At the year end, which items are retranslated at the closing rate (monetary) and which stay at the historical rate (non-monetary)?</p>',options:['Monetary','Non-monetary'],items:pickN(pool,6).map(([l,a])=>({label:l,answer:a})),explain:'Monetary items are money or fixed amounts of money to be received or paid. They are retranslated at the closing rate.'};}),
 gen(()=>{const g=rint(2,40)*50;return {type:'journal',prompt:`<p>At the year end, retranslating a US dollar trade payable at the closing rate reduces it by ${money(g)}. Record the adjustment.</p>`,accounts:IFRS4_ACCTS,answer:[['Trade payables',g,0],['Exchange gain',0,g]],explain:'The payable is smaller in pounds, so it is debited, and the gain goes to profit or loss.'};}),
 mcqPool([
  {q:'Where do exchange differences on retranslating a foreign currency payable go?',options:['Profit or loss','Other comprehensive income','Equity directly','The cost of the inventory bought'],why:'Exchange differences on monetary items in an individual company’s accounts go to profit or loss.'},
  {q:'A machine was bought for €100,000 when £1 = €1.15. At the year end £1 = €1.10. At what rate is the machine carried?',options:['The historical rate, €1.15','The closing rate, €1.10','The average rate','It must be revalued'],why:'Machinery is non-monetary, carried at historical cost, so it stays at the rate on the purchase date.'},
  {q:'A company’s functional currency is:',options:['The currency of the main economic environment it operates in','Always the currency it reports in','The strongest currency it deals in','The currency of its largest supplier'],why:'Functional currency reflects where the business mainly earns and spends its cash.'}])]});
TOPICS.push({id:'ifrs13',level:'y3',title:'IFRS 13: Fair value measurement',blurb:'What fair value means, the principal and most advantageous markets, and the three-level fair value hierarchy.',
lesson:`<h3>Which market?</h3>
<ol><li>If there is a <b>principal market</b>, use its price, even if another market is better.</li><li>If not, use the <b>most advantageous market</b>: the one with the highest price after transaction costs <b>and</b> transport costs.</li></ol>
<p>Then measure fair value as that market’s price <b>less transport costs</b> only. Transaction costs help you choose the market, but aren’t deducted from fair value.</p>
<h3>The fair value hierarchy</h3>
<div class="scroll"><table class="ledger simple"><thead><tr><th class="">Level</th><th class="">Inputs</th><th class="">Example</th></tr></thead><tbody><tr><td class=""><b>Level 1</b></td><td class="">Quoted prices for identical assets in active markets</td><td class="">Listed shares on a stock exchange</td></tr><tr><td class=""><b>Level 2</b></td><td class="">Other observable inputs, directly or indirectly</td><td class="">Prices for similar buildings, interest rate yield curves</td></tr><tr><td class=""><b>Level 3</b></td><td class="">Unobservable inputs, such as the company’s own data</td><td class="">Unlisted shares valued with management’s forecasts</td></tr></tbody></table></div>
<h3>Non-financial assets: highest and best use</h3>
<p>Value a non-financial asset (such as land) at its <b>highest and best use</b> by market participants, even if the company uses it differently. It must be physically possible, legally allowed and financially feasible.</p>`,
example:`<p>An asset is sold in two markets. Neither is the principal market.</p><div class="scroll"><table class="ledger simple"><thead><tr><th class=""></th><th class="amt">Market A £</th><th class="amt">Market B £</th></tr></thead><tbody><tr><td class="">Price</td><td class="amt">26</td><td class="amt">25</td></tr><tr><td class="">Transaction costs</td><td class="amt">(3)</td><td class="amt">(1)</td></tr><tr><td class="">Transport costs</td><td class="amt">(2)</td><td class="amt">(2)</td></tr><tr><td class=""><b>Net amount received</b></td><td class="amt"><b>21</b></td><td class="amt"><b>22</b></td></tr></tbody></table></div><p>Market B is the <b>most advantageous</b> market because it nets £22. Fair value = Market B’s price less transport costs only: £25 − £2 = <b>£23</b>.</p>`,
practice:[
 gen(()=>{for(;;){const pa=rint(20,60),pb=rint(20,60),ta=rint(1,6),tb=rint(1,6),tr=rint(1,4);const na=pa-ta-tr,nb=pb-tb-tr;if(na===nb)continue;const best=na>nb?'A':'B',fv=(na>nb?pa:pb)-tr;return {type:'fields',prompt:`<p>An asset trades in two markets, neither of which is the principal market. Market A: price £${pa}, transaction costs £${ta}. Market B: price £${pb}, transaction costs £${tb}. Transport costs to either market are £${tr}.</p>`,fields:[{label:'Net amount from market A (£)',answer:na},{label:'Net amount from market B (£)',answer:nb},{label:'Fair value (£)',answer:fv}],explain:`A nets ${pa} − ${ta} − ${tr} = £${na}. B nets ${pb} − ${tb} − ${tr} = £${nb}. Market ${best} is most advantageous. Fair value = its price less transport only = £${fv}.`};}}),
 gen(()=>{const pool=[['Quoted price for identical shares on the London Stock Exchange','Level 1'],['Price of identical bonds on an active exchange','Level 1'],['Price per square metre of similar buildings nearby, adjusted for condition','Level 2'],['An interest rate swap valued using observable market yield curves','Level 2'],['Unlisted shares valued using the company’s own cash flow forecasts','Level 3'],['A brand valued using management’s own projections','Level 3']];return {type:'classify',prompt:'<p>Which level of the fair value hierarchy is each input?</p>',options:['Level 1','Level 2','Level 3'],items:shuffle(pool).map(([l,a])=>({label:l,answer:a})),explain:'Level 1: quoted prices for identical assets. Level 2: other observable inputs. Level 3: unobservable inputs.'};}),
 mcqPool([
  {q:'Fair value under IFRS 13 is:',options:['An exit price: what you would receive to sell the asset','What the company paid for the asset','An entry price including transaction costs','The value in use to the company'],why:'Fair value is the price to sell the asset (or transfer a liability) between market participants.'},
  {q:'Are transaction costs deducted when measuring fair value?',options:['No, but they are used to find the most advantageous market','Yes, always','Only for Level 3 assets','Only for liabilities'],why:'Transaction costs belong to the deal, not the asset. Transport costs are deducted.'},
  {q:'There is a principal market for an asset, but another market gives a better price. Which price is used?',options:['The principal market’s price','The better price','An average of the two','The lower of the two'],why:'If a principal market exists, its price is used even if another market would be better.'}])]});
const SLUG={"equation":"accounting-equation.html","dcrules":"debits-and-credits.html","journals":"journal-entries.html","taccounts":"t-accounts.html","tb":"trial-balance.html","adjustments":"accruals-and-prepayments.html","depreciation":"depreciation.html","income":"income-statement.html","sofp":"statement-of-financial-position.html","cashflow":"statement-of-cash-flows.html","audit":"audit-basics.html","bookkeeping":"practical-bookkeeping.html","groups":"group-accounts.html","interview":"interview-prep.html","jobrec":"job-audit-receivables.html","jobcount":"job-inventory-count.html","jobclose":"job-month-end-close.html","jobtax":"job-tax-vat-corporation-tax.html","excel":"excel-skills.html","annualreport":"reading-an-annual-report.html","ias36":"ias-36-impairment.html","partnerships":"partnerships.html","ias37":"ias-37-provisions.html","ifrs16":"ifrs-16-leases.html","jobpay":"job-audit-payroll.html","fs-is":"income-statement-explained.html","fs-sofp":"balance-sheet-explained.html","fs-sopl":"company-profit-or-loss-explained.html","fs-cosofp":"company-balance-sheet-explained.html","fs-socie":"statement-of-changes-in-equity-explained.html","fs-socf":"cash-flow-statement-explained.html","fs-consol":"consolidated-balance-sheet-explained.html","jobfa":"job-audit-fixed-asset-additions.html","joblease":"job-new-lease-ifrs16.html","consolpl":"consolidated-profit-or-loss.html","ias16":"ias-16-property-plant-equipment.html","ias38":"ias-38-intangible-assets.html","incomplete":"incomplete-records.html","ias12":"ias-12-deferred-tax.html","ifrs9":"ifrs-9-financial-instruments.html","ifrs15":"ifrs-15-revenue.html","jobgc":"job-going-concern.html","ratios":"ratio-analysis.html","ifrs":"ifrs-standards.html","ias8":"ias-8-policies-estimates-errors.html","ias10":"ias-10-events-after-reporting-period.html","ias20":"ias-20-government-grants.html","ias23":"ias-23-borrowing-costs.html","ias33":"ias-33-earnings-per-share.html","ias40":"ias-40-investment-property.html","ias21":"ias-21-foreign-currency.html","ifrs13":"ifrs-13-fair-value.html"};
(function(){
  const page=document.getElementById('page');const id=page&&page.dataset.page;
  const mb=document.getElementById('menuBtn'),nav=document.getElementById('siteNav');
  if(mb&&nav)mb.addEventListener('click',()=>{const o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o?'true':'false');});
  const dl=document.getElementById('xl-dl');if(dl&&(/netlify\.app$/.test(location.hostname)||location.protocol==='file:'||location.hostname==='localhost'))dl.hidden=false;
  const t=TOPICS.find(x=>x.id===id);
  if(t){const list=document.getElementById('practice-list');list.innerHTML='';t.practice.forEach((f,k)=>list.append(card(t.id,f,(t.level==='job'?'Task ':'Question ')+(k+1))));}
  if(id==='test'){
    const root=document.getElementById('test-root');
    let timer=null;
    function setup(){
      if(timer){clearInterval(timer);timer=null;}
      root.innerHTML='';root.classList.remove('exam');
      const lvSel=el('select',{id:'ex-lv'},el('option',{value:'all',text:'All topics'}),el('option',{value:'f',text:'Foundations (Year 1 & 2)'}),el('option',{value:'y3',text:'Year 3'}),el('option',{value:'ind',text:'Industry ready'}));
      const nSel=el('select',{id:'ex-n'},el('option',{value:'10',text:'10 questions'}),el('option',{value:'20',text:'20 questions'}),el('option',{value:'30',text:'30 questions'}));
      const tSel=el('select',{id:'ex-t'},el('option',{value:'0',text:'No time limit (practice)'}),el('option',{value:'15',text:'15 minutes'}),el('option',{value:'30',text:'30 minutes'}),el('option',{value:'45',text:'45 minutes'}),el('option',{value:'60',text:'60 minutes'}));
      tSel.value='30';
      const lab=(t,x)=>el('div',{},el('label',{for:x.id,text:t}),x);
      root.append(el('div',{class:'exam-setup'},el('h2',{text:'Set up your test'}),el('div',{class:'t-fields'},lab('Topics',lvSel),lab('Length',nSel),lab('Time limit',tSel)),el('p',{class:'hint',text:'In a timed test, Show answer and New numbers are hidden until you finish. The test ends when the timer runs out or you press Finish.'}),el('button',{class:'btn',type:'button',text:'Start test',onclick:()=>start(lvSel.value,+nSel.value,+tSel.value)})));
    }
    function start(lv,n,mins){
      root.innerHTML='';
      const pool=[];
      TOPICS.filter(tp=>tp.level!=='job'&&(lv==='all'||tp.level===lv)).forEach(tp=>tp.practice.forEach(f=>{if(f.make().type!=='written')pool.push([tp,f]);}));
      const picked=[];while(picked.length<n&&pool.length){picked.push(...shuffle(pool).slice(0,n-picked.length));}
      const st=picked.map(([tp])=>({tp,att:false,ok:false}));
      const timed=mins>0;if(timed)root.classList.add('exam');
      let left=mins*60,done=false;
      const clock=el('b',{class:'clock'});const sc=el('div',{class:'score'});const summary=el('div',{});
      const upd=()=>{const a=st.filter(s=>s.att).length,c=st.filter(s=>s.ok).length;sc.innerHTML='';
        if(timed&&!done){const m=Math.floor(left/60),s=left%60;clock.textContent=m+':'+String(s).padStart(2,'0');clock.classList.toggle('low',left<=60);sc.append(el('span',{},'Time left ',clock));}
        sc.append(el('span',{},'Answered ',el('b',{text:a+' / '+st.length})),el('span',{},'Correct ',el('b',{text:String(c)})));
        if(!done)sc.append(el('button',{class:'btn',type:'button',text:'Finish',onclick:finish}));
        sc.append(el('button',{class:'ghost',type:'button',text:'New test',onclick:()=>{setup();root.scrollIntoView();}}));};
      function finish(){
        if(done)return;done=true;if(timer){clearInterval(timer);timer=null;}
        root.classList.remove('exam');
        const c=st.filter(s=>s.ok).length,pct=Math.round(c/st.length*100);
        const by={};st.forEach(s=>{const k=s.tp.id;by[k]=by[k]||{tp:s.tp,n:0,c:0};by[k].n++;if(s.ok)by[k].c++;});
        const weak=Object.values(by).filter(x=>x.c<x.n).sort((a,b)=>(a.c/a.n)-(b.c/b.n));
        summary.innerHTML='';
        summary.append(el('div',{class:'exam-result'},el('h2',{text:'Your result: '+c+' out of '+st.length+' ('+pct+'%)'}),
          el('p',{text:pct>=70?'A strong result. Review any questions you missed below.':pct>=50?'A pass, with some topics to tighten up.':'Worth revising the topics below before trying again.'}),
          weak.length?el('div',{},el('h3',{text:'Topics to revise'}),el('ul',{},weak.map(x=>el('li',{},el('a',{href:SLUG[x.tp.id],text:x.tp.title}),' ('+x.c+' of '+x.n+' correct)')))):el('p',{},el('b',{text:'You got every question right.'})),
          el('p',{class:'hint',text:'Show answer is now available on every question, so you can check the ones you missed.'})));
        upd();window.scrollTo(0,summary.getBoundingClientRect().top+window.scrollY-160);
      }
      upd();root.append(sc,summary);
      picked.forEach(([tp,f],k)=>{const s=st[k];const c=card(tp.id,f,(k+1)+'. '+tp.title,r=>{if(done)return;if(r==='attempt')s.att=true;else if(r===true)s.ok=true;upd();});c.querySelector('.q-head').append(el('a',{href:SLUG[tp.id]+'#learn',class:'hint',text:'Revise this topic'}));root.append(c);});
      root.append(el('div',{class:'exam-foot'},el('button',{class:'btn',type:'button',text:'Finish test',onclick:finish})));
      if(timed){timer=setInterval(()=>{left--;if(left<=0){left=0;finish();}else upd();},1000);}
      root.scrollIntoView();
    }
    setup();
  }
  var DONEKEY='ledgerlab-done-v1',CLKEY='ledgerlab-ar-checklist';
  function jget(k){try{return JSON.parse(localStorage.getItem(k))||{}}catch(e){return {}}}
  function jset(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  if(t){var prs=document.getElementById('practice');if(prs){var dcb=el('input',{type:'checkbox',id:'done-cb'});dcb.checked=!!jget(DONEKEY)[t.id];dcb.addEventListener('change',function(){var d=jget(DONEKEY);if(dcb.checked)d[t.id]=Date.now();else delete d[t.id];jset(DONEKEY,d);});prs.append(el('div',{class:'done-row'},dcb,el('label',{for:'done-cb',text:'Mark this topic as done'}),el('a',{href:'progress.html',text:'See my progress'})));}}
  var cls=document.querySelectorAll('.checklist input[type=checkbox]');
  function clCount(){var c=document.getElementById('cl-count');if(c)c.textContent=document.querySelectorAll('.checklist input:checked').length;}
  cls.forEach(function(cb){cb.checked=!!jget(CLKEY)[cb.id];cb.addEventListener('change',function(){var s=jget(CLKEY);s[cb.id]=cb.checked;jset(CLKEY,s);clCount();});});
  clCount();
  var clr=document.getElementById('cl-clear');if(clr)clr.addEventListener('click',function(){cls.forEach(function(cb){cb.checked=false;});jset(CLKEY,{});clCount();});
  if(id==='progress'){
    var root=document.getElementById('progress-root');
    var LVN={f:'Foundations · Year 1 & 2',fs:'Financial statements',y3:'Year 3',ind:'Industry ready',job:'On the job'};
    var draw=function(){
      var p=store.get(),d=jget(DONEKEY);root.innerHTML='';
      var total=TOPICS.length,done=TOPICS.filter(function(x){return d[x.id];}).length,att=0,cor=0;
      TOPICS.forEach(function(x){var s=p[x.id]||{a:0,c:0};att+=s.a||0;cor+=s.c||0;});
      root.append(el('div',{class:'summary'},el('div',{},el('b',{text:done+' of '+total}),el('span',{text:'topics marked done'})),el('div',{},el('b',{text:String(att)}),el('span',{text:'questions attempted'})),el('div',{},el('b',{text:String(cor)}),el('span',{text:'answered correctly'}))));
      ['f','fs','y3','ind','job'].forEach(function(lv){
        var list=TOPICS.filter(function(x){return x.level===lv;});if(!list.length)return;
        var tb=el('tbody',{});
        list.forEach(function(x){var s=p[x.id]||{a:0,c:0};var cb=el('input',{type:'checkbox','aria-label':'Done: '+x.title});cb.checked=!!d[x.id];
          cb.addEventListener('change',function(){var dd=jget(DONEKEY);if(cb.checked)dd[x.id]=Date.now();else delete dd[x.id];jset(DONEKEY,dd);draw();});
          var st=d[x.id]?'Done':(s.a?'In progress':'Not started'),pc=d[x.id]?'p-done':(s.a?'p-prog':'p-none');
          tb.append(el('tr',{},el('td',{},el('a',{href:SLUG[x.id],text:x.title})),el('td',{class:'amt',text:String(s.a||0)}),el('td',{class:'amt',text:String(s.c||0)}),el('td',{},el('span',{class:'pill '+pc,text:st})),el('td',{},cb)));});
        root.append(el('section',{class:'block'},el('h2',{text:LVN[lv]}),el('div',{class:'scroll'},el('table',{class:'ledger'},el('thead',{},el('tr',{},el('th',{text:'Topic'}),el('th',{class:'amt',text:'Attempted'}),el('th',{class:'amt',text:'Correct'}),el('th',{text:'Status'}),el('th',{text:'Done'}))),tb))));
      });
      var box=el('div',{class:'note warn',hidden:true},el('p',{text:'This clears every score and tick saved in this browser, including the annual report checklist. It can’t be undone.'}),el('button',{class:'btn',type:'button',text:'Yes, reset everything',onclick:function(){try{localStorage.removeItem(KEY);localStorage.removeItem(DONEKEY);localStorage.removeItem(CLKEY);}catch(e){}draw();}}),' ',el('button',{class:'ghost',type:'button',text:'Cancel',onclick:function(){box.hidden=true;}}));
      root.append(el('section',{class:'block'},el('h2',{text:'Start again'}),el('p',{text:'Progress is saved in this browser only. It won’t appear on another device, and clearing your browser data removes it.'}),el('button',{class:'ghost',type:'button',text:'Reset all progress',onclick:function(){box.hidden=false;}}),box));
    };
    draw();
  }
  if(id==='glossary'){var gi=document.getElementById('gl-search'),gitems=[].slice.call(document.querySelectorAll('.gl-item')),ggroups=[].slice.call(document.querySelectorAll('.gl-group')),gnone=document.getElementById('gl-none');
    if(gi)gi.addEventListener('input',function(){var q=gi.value.trim().toLowerCase(),shown=0;gitems.forEach(function(it){var ok=!q||it.getAttribute('data-k').indexOf(q)>-1;it.hidden=!ok;if(ok)shown++;});ggroups.forEach(function(g){g.hidden=!g.querySelector('.gl-item:not([hidden])');});gnone.hidden=shown>0;});}
})();

/* ================= site chrome: header menus, search, sidebar, animations ================= */
(function(){
  var page=document.getElementById('page');if(!page)return;
  var pid=page.dataset.page,here=(location.pathname.split('/').pop()||'index.html');
  var ICON={search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    chev:'<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4"/></svg>',
    moon:'<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',
    sun:'<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    chart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    up:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    menu:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
    close:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* sections, in site order, read from the footer */
  var BLURB={};TOPICS.forEach(function(t){BLURB[SLUG[t.id]]=t.blurb;});
  var INTRO={'Foundations · Year 1 & 2':['01','Foundations','Year 1 and 2: double entry, the ledger and year-end adjustments.','index.html#foundations'],
    'Financial statements':['02','Statements','Every main financial statement, shown as a real example with each line explained.','index.html#statements'],
    'Year 3':['03','Year 3','IFRS standards and techniques for a final-year financial reporting module.','index.html#year3'],
    'Industry ready':['04','Industry ready','What you will actually do in a graduate finance job, and how to get one.','index.html#industry'],
    'On the job':['05','On the job','Realistic work simulations that start with an email from your manager.','index.html#onthejob'],
    'Practice':['06','Practice','Exam questions, flashcards, written answers, summary sheets and a list of the questions you got wrong.','index.html#practice']};
  Object.assign(BLURB,{'start-here.html':'How the site works and where to begin.','exam.html':'Multi-part exam questions with a timer and a mark scheme.','mixed-test.html':'A random test across the topics you choose.','flashcards.html':'Spaced-repetition flashcards for every glossary term.','written-practice.html':'Practise written answers against model answers and checklists.','review.html':'Every question you got wrong or revealed, ready to try again.','summaries.html':'One-page summary sheets for each section, with PDFs.','glossary.html':'Every key term, with a meaning and an example.','acca-map.html':'Which topics help with which ACCA exams.','progress.html':'Your scores and the topics you’ve finished.','index.html#technique':'How to answer exam questions well.'});
  /* the Cheat sheets page sits in Practice on every page, without editing each page's footer */
  document.querySelectorAll('.site-foot h4').forEach(function(h){if(h.textContent.trim()!=='Practice')return;var ul=h.nextElementSibling;if(!ul||ul.querySelector('a[href="cheat-sheets.html"]'))return;var s=ul.querySelector('a[href="summaries.html"]'),li=document.createElement('li');li.innerHTML='<a href="cheat-sheets.html">Cheat sheets</a>';if(s)s.parentNode.after(li);else ul.append(li);});
  BLURB['cheat-sheets.html']='Visual one-page sheets from the lectures, explained in plain English.';
  var SECS=[],EXTRA=[];
  document.querySelectorAll('.site-foot h4').forEach(function(h){var ul=h.nextElementSibling;if(!ul)return;var name=h.textContent.trim();
    var items=[].map.call(ul.querySelectorAll('a'),function(a){return {href:a.getAttribute('href'),title:a.textContent.trim()};});
    if(INTRO[name])SECS.push({key:name,num:INTRO[name][0],short:INTRO[name][1],desc:INTRO[name][2],hub:INTRO[name][3],items:items});else EXTRA=EXTRA.concat(items);});
  var cur=null;SECS.forEach(function(s){s.items.forEach(function(it){if(it.href===here)cur=s;});});
  var done={};try{done=JSON.parse(localStorage.getItem('ledgerlab-done-v1'))||{};}catch(e){}
  var DONEHREF={};Object.keys(done).forEach(function(k){if(SLUG[k])DONEHREF[SLUG[k]]=1;});

  /* ---- header ---- */
  var head=document.querySelector('.site-head');
  if(head){
    var navHTML=SECS.map(function(s,i){return '<div class="mi"><button class="mt'+(cur===s?' here':'')+'" type="button" aria-expanded="false" aria-controls="mp'+i+'">'+s.short+ICON.chev+'</button>'+
      '<div class="mp" id="mp'+i+'"><div class="wrap mp-in"><div class="mp-intro"><div class="num">'+s.num+'</div><b>'+s.short+'</b><p>'+s.desc+'</p><a class="ghost" href="'+s.hub+'">'+(s.num==='06'?'See all practice tools':'See all '+s.items.length+' topics')+' <span class="arr">→</span></a></div>'+
      '<ul class="mp-list">'+s.items.map(function(it,k){return '<li style="--i:'+k+'"><a href="'+it.href+'"><b>'+it.title+'</b><span>'+(BLURB[it.href]||'')+'</span></a></li>';}).join('')+'</ul></div></div></div>';}).join('');
    head.innerHTML='<div class="wrap hdr"><a class="brand" href="index.html" aria-label="Goldman Snacks home"><svg class="gs-logo" width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><defs><linearGradient id="gs-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF4F8B"/><stop offset=".55" stop-color="#FF8A3D"/><stop offset="1" stop-color="#8A4DFF"/></linearGradient><mask id="gs-bite"><rect width="34" height="34" fill="#fff"/><circle cx="28.5" cy="4" r="6.2" fill="#000"/><circle cx="33.5" cy="12.5" r="4.6" fill="#000"/><circle cx="21" cy="0" r="4.6" fill="#000"/></mask></defs><g mask="url(#gs-bite)"><circle class="gs-disc" cx="17" cy="17" r="16"/><circle class="gs-ring" cx="17" cy="17" r="14"/><text class="gs-mark" x="16.6" y="21.6" text-anchor="middle">GS</text></g></svg><b>Goldman Snacks</b></a>'+
      '<nav class="mnav" aria-label="Main">'+navHTML+'<a class="ml'+(here==='glossary.html'?' here':'')+'" href="glossary.html">Glossary</a></nav>'+
      '<div class="tools"><button class="srch" type="button" aria-label="Search the site">'+ICON.search+'<span>Search topics</span><kbd>/</kbd></button>'+
      '<a class="icon-b" href="progress.html" title="My progress" aria-label="My progress">'+ICON.chart+'</a>'+
      '<button class="icon-b theme-b" type="button" title="Switch light or dark" aria-label="Switch light or dark">'+ICON.moon+ICON.sun+'</button>'+
      '<button class="icon-b burger" type="button" aria-expanded="false" aria-label="Open menu">'+ICON.menu+'</button></div></div>';
    /* mega menus */
    var openMi=null,tmr=0;
    function closeAll(){head.querySelectorAll('.mt').forEach(function(b){b.setAttribute('aria-expanded','false');});head.querySelectorAll('.mp').forEach(function(p){p.classList.remove('open');});openMi=null;}
    function openOne(mi){if(openMi===mi)return;closeAll();openMi=mi;mi.querySelector('.mt').setAttribute('aria-expanded','true');mi.querySelector('.mp').classList.add('open');}
    head.querySelectorAll('.mi').forEach(function(mi){var b=mi.querySelector('.mt');
      b.addEventListener('click',function(){if(openMi===mi)closeAll();else openOne(mi);});
      mi.addEventListener('mouseenter',function(){if(!matchMedia('(hover:hover)').matches)return;clearTimeout(tmr);tmr=setTimeout(function(){openOne(mi);},openMi?0:120);});
      mi.addEventListener('mouseleave',function(){clearTimeout(tmr);tmr=setTimeout(function(){if(openMi===mi)closeAll();},220);});});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeAll();closeDrawer();closePal();}});
    document.addEventListener('click',function(e){if(openMi&&!head.contains(e.target))closeAll();});
    /* theme */
    head.querySelector('.theme-b').addEventListener('click',function(){var r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;var nt=dark?'light':'dark';window.__gsTheme=nt;r.dataset.theme=nt;try{localStorage.setItem('ledgerlab-theme',nt);}catch(e){}try{window.name=(window.name||'').replace(/;?gs-theme=(light|dark)/,'')+';gs-theme='+nt;}catch(e){}});
    /* mobile drawer */
    var dr=el('div',{class:'drawer',id:'drawer'});
    dr.innerHTML=SECS.map(function(s){return '<details'+(cur===s?' open':'')+'><summary>'+s.short+'<small>'+s.items.length+(s.num==='06'?' TOOLS':' TOPICS')+'</small></summary><ul>'+s.items.map(function(it){return '<li><a href="'+it.href+'"'+(it.href===here?' class="here"':'')+'>'+it.title+'</a></li>';}).join('')+'</ul></details>';}).join('')+
      '';
    document.body.append(dr);
    var bg=head.querySelector('.burger');
    function closeDrawer(){dr.classList.remove('open');document.body.classList.remove('lock');bg.setAttribute('aria-expanded','false');bg.innerHTML=ICON.menu;}
    bg.addEventListener('click',function(){var o=!dr.classList.contains('open');if(!o)return closeDrawer();dr.classList.add('open');document.body.classList.add('lock');bg.setAttribute('aria-expanded','true');bg.innerHTML=ICON.close;});
    /* search palette */
    var ALL=[];SECS.forEach(function(s){s.items.forEach(function(it){ALL.push({href:it.href,title:it.title,sub:BLURB[it.href]||'',sec:s.short});});});
    EXTRA.forEach(function(it){if(!ALL.some(function(a){return a.href===it.href;}))ALL.push({href:it.href,title:it.title,sub:'',sec:'Page'});});
    var pal=null,pin,pres,sel=0,hits=[];
    function closePal(){if(!pal)return;pal.classList.remove('open');var p=pal;pal=null;document.body.classList.remove('lock');setTimeout(function(){p.remove();},200);}
    function drawRes(){var q=pin.value.trim().toLowerCase(),words=q.split(/\s+/).filter(Boolean);
      hits=ALL.map(function(a){var t=(a.title+' '+a.sub+' '+a.sec).toLowerCase(),sc=0;if(!words.length)return [a,1];for(var i=0;i<words.length;i++){var k=t.indexOf(words[i]);if(k<0)return null;sc+=a.title.toLowerCase().indexOf(words[i])>-1?3:1;}return [a,sc];}).filter(Boolean).sort(function(x,y){return y[1]-x[1];}).slice(0,12).map(function(x){return x[0];});
      sel=Math.min(sel,Math.max(0,hits.length-1));
      pres.innerHTML=hits.length?hits.map(function(a,i){return '<a href="'+a.href+'"'+(i===sel?' class="sel"':'')+'><span>'+a.title+'</span><small>'+(a.sub||'&nbsp;')+'</small><em>'+a.sec+'</em></a>';}).join(''):'<p>No topics match “'+pin.value.replace(/</g,'&lt;')+'”. Try the <a href="glossary.html">glossary</a>.</p>';}
    function openPal(){if(pal)return;closeAll();pal=el('div',{class:'pal',role:'dialog','aria-modal':'true','aria-label':'Search topics'});
      pal.innerHTML='<div class="pal-box"><div class="pal-in">'+ICON.search+'<input id="pal-q" type="text" placeholder="Search 52 topics, e.g. leases, VAT, goodwill" autocomplete="off"><kbd class="srch-k" style="font:500 .72rem var(--mono);color:var(--muted)">Esc</kbd></div><div class="pal-res"></div></div>';
      document.body.append(pal);document.body.classList.add('lock');pin=pal.querySelector('input');pres=pal.querySelector('.pal-res');sel=0;drawRes();
      pin.focus();requestAnimationFrame(function(){if(pal)pal.classList.add('open');});
      pin.addEventListener('input',function(){sel=0;drawRes();});
      pin.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){sel=Math.min(hits.length-1,sel+1);drawRes();e.preventDefault();}else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);drawRes();e.preventDefault();}else if(e.key==='Enter'&&hits[sel]){location.href=hits[sel].href;}});
      pal.addEventListener('click',function(e){if(e.target===pal)closePal();});}
    head.querySelector('.srch').addEventListener('click',openPal);
    document.addEventListener('keydown',function(e){var tg=e.target.tagName;if((e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(tg))||((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k')){e.preventDefault();openPal();}});
    /* shadow when scrolled */
    var onS=function(){head.classList.toggle('scrolled',scrollY>4);};addEventListener('scroll',onS,{passive:true});onS();
  }
  

  /* ---- lesson sidebar + scrollspy ---- */
  var main=document.querySelector('main'),art=document.querySelector('main > .article');
  if(cur&&main&&art){
    var side=el('aside',{class:'lside','aria-label':'Section contents'});
    side.innerHTML='<h4>'+cur.short+'</h4><ol>'+cur.items.map(function(it){return '<li><a href="'+it.href+'" class="'+(it.href===here?'here':'')+(DONEHREF[it.href]?' done':'')+'"'+(it.href===here?' aria-current="page"':'')+'><span>'+it.title+'</span></a></li>';}).join('')+'</ol>';
    var tocLinks=[].slice.call(art.querySelectorAll('.toc a'));
    if(tocLinks.length){side.innerHTML+='<h4>On this page</h4><ul>'+tocLinks.map(function(a){return '<li><a href="'+a.getAttribute('href')+'">'+a.textContent+'</a></li>';}).join('')+'</ul>';}
    main.classList.add('with-side');main.insertBefore(side,art);
    var spy=[].slice.call(side.querySelectorAll('ul a')),targets=spy.map(function(a){return document.querySelector(a.getAttribute('href'));});
    var onSpy=function(){var y=scrollY+140,k=0;targets.forEach(function(t,i){if(t&&t.offsetTop<=y)k=i;});spy.forEach(function(a,i){a.classList.toggle('on',i===k);});};
    if(spy.length){addEventListener('scroll',onSpy,{passive:true});onSpy();}
  }

  /* ---- home: done marks ---- */
  if(pid==='home'){document.querySelectorAll('a.topic-row').forEach(function(a){if(DONEHREF[a.getAttribute('href')])a.append(el('span',{class:'done-mark',text:'✓ Done'}));});
    /* replay the journal animation when it scrolls back into view */
    var jc=document.querySelector('.jcard');
    if(jc&&'IntersectionObserver' in window&&!reduce){var seen=false;new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&seen){jc.classList.add('cycle');void jc.offsetWidth;jc.classList.remove('cycle');}if(!e.isIntersecting)seen=true;});},{threshold:.4}).observe(jc);}
  }

  /* ---- reading bar + back to top ---- */
  var rb=el('div',{class:'readbar','aria-hidden':'true'}),tt=el('button',{class:'totop',type:'button','aria-label':'Back to top',html:ICON.up});
  document.body.append(rb,tt);tt.addEventListener('click',function(){scrollTo({top:0,behavior:reduce?'auto':'smooth'});});
  var onR=function(){var h=document.documentElement.scrollHeight-innerHeight;rb.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')';tt.classList.toggle('show',scrollY>900);};
  addEventListener('scroll',onR,{passive:true});onR();

  /* ---- scroll reveal (only for things below the first screen) ---- */
  if(!reduce&&'IntersectionObserver' in window){
    var els=[].slice.call(document.querySelectorAll('main section.block, main .chapter .chap-h, main .topic-row, main .q, main .steps > div, .duo > div, .pager a, .site-foot .foot-in > div'));
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(n){var r=n.getBoundingClientRect();if(r.top<innerHeight*.95||(n.parentElement&&n.parentElement.closest('.rv')))return;
      var sib=n.parentElement?[].indexOf.call(n.parentElement.children,n):0;
      if(n.classList.contains('topic-row')||n.parentElement.classList.contains('steps')||n.parentElement.classList.contains('duo'))n.style.setProperty('--d',(Math.min(sib,5)%3*0.07)+'s');
      n.classList.add('rv');io.observe(n);});
  }
})();

/* ================= artwork layout: chapter bands and lesson title cards ================= */
(function(){
  var page=document.getElementById('page');if(!page)return;
  var here=(location.pathname.split('/').pop()||'index.html');
  var PAL=['warm','cool','violet','sea','sunset','warm'];
  var idx=-1;document.querySelectorAll('.site-foot h4').forEach(function(h,i){var ul=h.nextElementSibling;if(ul&&i<6&&[].some.call(ul.querySelectorAll('a'),function(a){return a.getAttribute('href')===here;}))idx=i;});
  function seeded(n){var s=n*9301+49297;return function(){s=(s*9301+49297)%233280;return s/233280;};}
  /* home: chapter bands */
  var CH={foundations:0,statements:1,year3:2,industry:3,onthejob:4,practice:5};
  document.querySelectorAll('.chapter .chap-h').forEach(function(h){var sec=h.closest('.chapter'),k=CH[sec.id];if(k==null)return;
    var band=el('div',{class:'ch-band'});var cv=el('canvas',{'data-art':PAL[k],'data-mode':'smooth','data-seed':String(20+k*7),'aria-hidden':'true'});
    var word=(h.querySelector('h2').textContent.split(/[·&]/)[0]).replace(/\s+/g,'').slice(0,14),L=el('div',{class:'ch-letters','aria-hidden':'true'}),R=seeded(k+3);
    for(var i=0;i<90;i++){var sp=el('span',{text:word[i%word.length]});sp.style.left=(R()*96)+'%';sp.style.top=(R()*94)+'%';sp.style.opacity=(.25+R()*.55).toFixed(2);L.append(sp);}
    h.parentNode.insertBefore(band,h);band.append(cv,L,h);});
  /* topic and other pages: halftone title card */
  var art=document.querySelector('main .article');
  if(art&&page.dataset.page!=='home'){var h1=art.querySelector(':scope > h1');
    if(h1){var eb=art.querySelector(':scope > .eyebrow'),ld=art.querySelector(':scope > .lede');
      var box=el('div',{class:'lhero'}),cv2=el('canvas',{'data-art':PAL[idx<0?0:idx],'data-seed':String(5+here.length*3),'aria-hidden':'true'}),card=el('div',{class:'lh-card'});
      art.insertBefore(box,eb||h1);if(eb)card.append(eb);card.append(h1);if(ld)card.append(ld);box.append(cv2,card);}}
})();

/* remove the journal's reveal mask once each line has been written */
document.querySelectorAll('.jcard .w').forEach(function(w){w.addEventListener('animationend',function(){w.classList.add('done');});});


/* ---------- term tips: explain words that a later topic teaches ---------- */
(function(){
  if(!GS_LATER||!GS_LATER.length)return;
  const list=GS_LATER.slice().sort((a,b)=>b.stem.length-a.stem.length);
  const esc=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const big=new RegExp('\\b(?:'+list.map(x=>esc(x.stem)).join('|')+')s?\\b','gi');
  const find=m=>list.find(x=>x.re.test(m)&&new RegExp('^'+esc(x.stem)+'s?$','i').test(m));
  const SKIP='select,option,button,a,h1,h2,h3,h4,input,textarea,label.tt-no,.tts-skip,.xp,.expl,.vids,.tt-term,td.amt,code,dt,.kw-eg b,.tt-pop,script,style';
  function process(root){
    const seen=new Set([...root.querySelectorAll('.tt-term')].map(e=>e.dataset.k));
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest(SKIP)?2:(n.nodeValue.trim()?1:2)});
    const nodes=[];let n;while((n=w.nextNode()))nodes.push(n);
    nodes.forEach(node=>{let txt=node.nodeValue;big.lastIndex=0;let m,parts=[],last=0;
      while((m=big.exec(txt))){const e=find(m[0]);if(!e||seen.has(e.t))continue;seen.add(e.t);parts.push([m.index,m.index+m[0].length,e]);}
      if(!parts.length)return;const frag=document.createDocumentFragment();
      parts.forEach(([a,b,e])=>{if(a>last)frag.append(txt.slice(last,a));const sp=document.createElement('span');sp.className='tt-term';sp.tabIndex=0;sp.dataset.k=e.t;sp.setAttribute('role','button');sp.setAttribute('aria-label',txt.slice(a,b)+': not covered yet, show meaning');sp.textContent=txt.slice(a,b);frag.append(sp);last=b;});
      if(last<txt.length)frag.append(txt.slice(last));node.parentNode.replaceChild(frag,node);});
  }
  document.querySelectorAll('#basics,#learn,#example').forEach(process);
  const pl=document.getElementById('practice-list');
  if(pl){pl.querySelectorAll('.q').forEach(process);let pend=new Set(),t=0;
    new MutationObserver(ms=>{ms.forEach(m=>{const q=(m.target.closest&&m.target.closest('.q'))||(m.target.classList&&m.target.classList.contains('q')&&m.target);if(q)pend.add(q);});
      clearTimeout(t);t=setTimeout(()=>{pend.forEach(q=>{if(!q.querySelector('.tt-term'))process(q);});pend=new Set();},30);}).observe(pl,{childList:true,subtree:true});}
  /* the popup */
  const pop=el('div',{class:'tt-pop',role:'tooltip',hidden:true});document.body.append(pop);let cur=null,ht=0;
  function show(sp){const e=list.find(x=>x.t===sp.dataset.k);if(!e)return;cur=sp;clearTimeout(ht);
    const d=e.d;pop.innerHTML=`<b>${d.t}</b><p>${d.m}</p><a href="${d.f}">Covered later in: ${d.n}</a>`;pop.hidden=false;
    const r=sp.getBoundingClientRect(),pw=Math.min(340,innerWidth-24);pop.style.width=pw+'px';
    let x=Math.max(12,Math.min(innerWidth-pw-12,r.left+r.width/2-pw/2)),y=r.bottom+8;
    pop.style.left=x+'px';pop.style.top=(y+scrollY)+'px';const ph=pop.offsetHeight;if(y+ph>innerHeight-12&&r.top-ph-8>12)pop.style.top=(r.top-ph-8+scrollY)+'px';}
  function hide(){ht=setTimeout(()=>{pop.hidden=true;cur=null;},160);}
  document.addEventListener('mouseover',e=>{const sp=e.target.closest&&e.target.closest('.tt-term');if(sp&&matchMedia('(hover:hover)').matches)show(sp);else if(e.target.closest&&e.target.closest('.tt-pop'))clearTimeout(ht);});
  document.addEventListener('mouseout',e=>{if(e.target.closest&&(e.target.closest('.tt-term')||e.target.closest('.tt-pop')))hide();});
  document.addEventListener('click',e=>{const sp=e.target.closest&&e.target.closest('.tt-term');if(sp){e.preventDefault();cur===sp&&!pop.hidden?(pop.hidden=true,cur=null):show(sp);}else if(!pop.contains(e.target)){pop.hidden=true;cur=null;}});
  document.addEventListener('focusin',e=>{const sp=e.target.closest&&e.target.closest('.tt-term');if(sp)show(sp);});
  document.addEventListener('focusout',e=>{if(e.target.closest&&e.target.closest('.tt-term'))hide();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')pop.hidden=true;if((e.key==='Enter'||e.key===' ')&&document.activeElement&&document.activeElement.classList.contains('tt-term')){e.preventDefault();show(document.activeElement);}});
  addEventListener('scroll',()=>{if(!pop.hidden&&cur&&!matchMedia('(hover:hover)').matches){}},{passive:true});
})();
