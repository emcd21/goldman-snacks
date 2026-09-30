/* Goldman Snacks: generative gradient artwork (halftone dots and soft mesh), drawn on canvas */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PAL={
    warm:['#FF4F8B','#FF8A3D','#9B5CFF','#FFD24A','#FF3D6E'],
    cool:['#3D5BFF','#35D0A0','#8A4DFF','#4FA8FF','#6BE07A'],
    violet:['#8A4DFF','#FF4FB8','#4F6BFF','#FF7A59','#C24DFF'],
    sea:['#2FC7B5','#3D7BFF','#7AE582','#6A5CFF','#2FA8E0'],
    sunset:['#FF6A3D','#FF3D8B','#FFB23D','#B04DFF','#FF4F4F']
  };
  function rng(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
  function hex(c){return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}
  var all=[];
  function Art(cv){
    var o=cv.dataset,pal=PAL[o.art]||PAL.warm,mode=o.mode||'halftone',seed=+(o.seed||7),R=rng(seed);
    var blobs=pal.concat(pal).concat(pal.slice(0,2)).map(function(c,i){return {c:hex(c),x:R()*1.1-.05,y:R()*1.1-.05,r:.16+R()*.2,sx:.6+R()*2.4,rot:R()*3.14,ax:.06+R()*.1,ay:.05+R()*.08,sp:.00010+R()*.00016,ph:R()*6.28};});
    var sm=document.createElement('canvas'),sx=sm.getContext('2d',{willReadFrequently:true}),ctx=cv.getContext('2d');
    var W=0,H=0,dpr=1,cell=7,visible=true,last=0,t0=performance.now()-R()*60000;
    function size(){var r=cv.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,2);W=Math.max(1,Math.round(r.width));H=Math.max(1,Math.round(r.height));
      cv.width=W*dpr;cv.height=H*dpr;cell=+(o.cell||(W<500?6:8));sm.width=Math.ceil(W/cell);sm.height=Math.ceil(H/cell);}
    function paintSmall(t){var w=sm.width,h=sm.height;sx.globalCompositeOperation='source-over';sx.fillStyle=o.bg||'#F4F2F8';sx.fillRect(0,0,w,h);
      blobs.forEach(function(b){var x=(b.x+Math.sin(t*b.sp+b.ph)*b.ax)*w,y=(b.y+Math.cos(t*b.sp*1.3+b.ph)*b.ay)*h,r=b.r*Math.max(w,h);
        sx.save();sx.translate(x,y);sx.rotate(b.rot+Math.sin(t*b.sp*.7+b.ph)*.4);sx.scale(b.sx,1);
        var g=sx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'rgba('+b.c+',.95)');g.addColorStop(.5,'rgba('+b.c+',.7)');g.addColorStop(1,'rgba('+b.c+',0)');sx.fillStyle=g;sx.beginPath();sx.arc(0,0,r,0,6.2832);sx.fill();sx.restore();});}
    function draw(t){if(!W)size();paintSmall(t);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
      ctx.imageSmoothingEnabled=true;ctx.globalAlpha=mode==='smooth'?1:.5;ctx.filter=mode==='smooth'?'blur(24px)':'blur(6px)';ctx.drawImage(sm,0,0,W,H);ctx.filter='none';ctx.globalAlpha=1;
      if(mode==='smooth')return;
      var d=sx.getImageData(0,0,sm.width,sm.height).data,bg=hex(o.bg||'#F4F2F8');
      for(var j=0;j<sm.height;j++)for(var i=0;i<sm.width;i++){var k=(j*sm.width+i)*4,r=d[k],g=d[k+1],bl=d[k+2];
        var diff=(Math.abs(r-bg[0])+Math.abs(g-bg[1])+Math.abs(bl-bg[2]))/255/1.6;if(diff<.06)continue;
        var s=cell*(.28+Math.min(.5,diff*.55));ctx.fillStyle='rgb('+r+','+g+','+bl+')';ctx.fillRect(i*cell+(cell-s)/2,j*cell+(cell-s)/2,s,s);}
    }
    this.cv=cv;this.size=size;this.draw=draw;
    this.tick=function(now){if(!visible||reduce||o.still)return;if(now-last<70)return;last=now;draw(now-t0);};
    this.setVisible=function(v){visible=v;};
    size();draw(performance.now()-t0);
  }
  function init(){
    document.querySelectorAll('canvas[data-art]').forEach(function(cv){if(cv._art)return;var a=new Art(cv);cv._art=a;all.push(a);
      if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(e){a.setVisible(e.isIntersecting);});}).observe(cv);});
  }
  window.GSArt={init:init};
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){all.forEach(function(a){a.size();a.draw(performance.now());});},150);});
  (function loop(now){all.forEach(function(a){a.tick(now);});requestAnimationFrame(loop);})(performance.now());
  if(document.readyState!=='loading')init();else document.addEventListener('DOMContentLoaded',init);
})();
