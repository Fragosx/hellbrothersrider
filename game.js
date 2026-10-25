
(()=>{
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cv=$('c');let cx=cv.getContext('2d');
const W=360,RX=45,RW=270,LW=RW/4,PX=10.8;let LEN=4000;
let H=640,S=1,DPR=1,st='menu',G,last=0;
const laneX=i=>RX+LW*(i+.5);
const inp={l:0,r:0,g:0,b:0};
const SONGS=[
 {n:'AC/DC - Highway to Hell',bpm:138,f:82.41,r:[0,-1,0,0,-1,3,-1,5,0,-1,0,0,-1,7,5,3],k:'1001001010010010',s:'0000100000001000',h:'1010101010101010'},
 {n:'Guns N\' Roses - Welcome To The Jungle',bpm:112,f:110,r:[0,-1,-1,0,3,-1,0,-1,5,-1,-1,5,7,-1,5,3],k:'1000001010000010',s:'0000100000001000',h:'1010101010101010'},
 {n:'Metallica - Enter Sandman',bpm:160,f:73.42,r:[0,0,-1,0,0,-1,3,-1,0,0,-1,0,5,-1,7,-1],k:'1010100010101000',s:'0000100000001001',h:'1111111111111111'}
];

/* ---------- Audio (procedural rock, no assets) ---------- */
const A={c:null,run:0,song:0,step:0,next:0,dur:.12,on:1};
A.init=()=>{
 if(A.c){A.c.resume();return}
 const c=A.c=new(window.AudioContext||window.webkitAudioContext)();
 A.m=c.createGain();A.m.gain.value=A.on?.55:0;A.m.connect(c.destination);
 const nb=c.createBuffer(1,c.sampleRate,c.sampleRate),d=nb.getChannelData(0);
 for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;A.nb=nb;
 const ws=c.createWaveShaper(),k=new Float32Array(256);
 for(let i=0;i<256;i++)k[i]=Math.tanh((i/128-1)*18);ws.curve=k;
 const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600;
 const g=c.createGain();g.gain.value=.15;
 A.gb=c.createGain();A.gb.connect(ws);ws.connect(lp);lp.connect(g);g.connect(A.m);
 A.eng=c.createOscillator();A.eng.type='sawtooth';
 const ef=c.createBiquadFilter();ef.frequency.value=380;A.eg=c.createGain();A.eg.gain.value=0;
 A.eng.connect(ef);ef.connect(A.eg);A.eg.connect(A.m);A.eng.start();
 A.sir=c.createOscillator();A.sir.type='triangle';A.sg=c.createGain();A.sg.gain.value=0;
 A.sir.connect(A.sg);A.sg.connect(A.m);A.sir.start();
 setInterval(A.tick,30);
};
A.start=()=>{A.run=1;playTrack()};
A.noise=(t,type,fr,v,dur)=>{const c=A.c,s=c.createBufferSource();s.buffer=A.nb;
 const f=c.createBiquadFilter();f.type=type;f.frequency.value=fr;const e=c.createGain();
 e.gain.setValueAtTime(v,t);e.gain.exponentialRampToValueAtTime(.0001,t+dur);
 s.connect(f);f.connect(e);e.connect(A.m);s.start(t);s.stop(t+dur+.02)};
A.play=(s,i,t)=>{
 const c=A.c,dur=A.dur,n=s.r[i];
 if(n>=0){
  const f=s.f*Math.pow(2,n/12),len=dur*(s.r[(i+1)%16]<0?1.6:.85);
  [f,f*1.5,f*2].forEach((q,j)=>{
   const o=c.createOscillator();o.type='sawtooth';o.frequency.value=q;o.detune.value=(j-1)*6;
   const e=c.createGain();e.gain.setValueAtTime(.0001,t);e.gain.exponentialRampToValueAtTime(.5,t+.008);
   e.gain.exponentialRampToValueAtTime(.0001,t+len);o.connect(e);e.connect(A.gb);o.start(t);o.stop(t+len+.05)});
  const b=c.createOscillator(),bg=c.createGain();b.type='sine';b.frequency.value=f/2;
  bg.gain.setValueAtTime(.35,t);bg.gain.exponentialRampToValueAtTime(.0001,t+len);
  b.connect(bg);bg.connect(A.m);b.start(t);b.stop(t+len+.05);
 }
 if(s.k[i]==='1'){const o=c.createOscillator(),e=c.createGain();o.frequency.setValueAtTime(150,t);
  o.frequency.exponentialRampToValueAtTime(45,t+.12);e.gain.setValueAtTime(.9,t);
  e.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(e);e.connect(A.m);o.start(t);o.stop(t+.25)}
 if(s.s[i]==='1')A.noise(t,'highpass',1100,.5,.15);
 if(s.h[i]==='1')A.noise(t,'highpass',7000,.12,.04);
};
A.tick=()=>{
 const c=A.c;if(!A.run||!A.proc||!c||!G)return;
 const s=SONGS[A.song];
 while(A.next<c.currentTime+.12){
  A.dur=60/(s.bpm*(.9+G.sp/1100))/4;
  A.play(s,A.step%16,A.next);A.next+=A.dur;A.step++;
 }
};
A.update=()=>{
 const c=A.c;if(!c||!G)return;const t=c.currentTime;
 A.eng.frequency.setTargetAtTime(45+G.sp*1.2,t,.05);
 A.eg.gain.setTargetAtTime(st==='play'?.05:0,t,.1);
 A.sir.frequency.value=650+250*Math.sin(G.t*8);
 A.sg.gain.setTargetAtTime(G.chase&&st==='play'?.03:0,t,.1);
};
A.hit=()=>{if(A.c){A.noise(A.c.currentTime,'lowpass',900,.9,.35)}};
/* ---------- Config: motos, niveles, pistas ---------- */
const BIKES=[{n:'Chopper',top:215,acc:62,st:.95,crash:.5,d:'Equilibrada'},{n:'Sport',top:235,acc:80,st:1.15,crash:.28,d:'Rápida, frágil'},{n:'Cruiser',top:205,acc:54,st:.85,crash:.6,d:'Pesada, aguanta'}];
const LVS=[
 {n:'Carretera',desc:'Ruta rural: tráfico moderado y una persecución que puedes dejar atrás.',len:4000,p0:112,pd:10,k:2.0,gap:320,ht:20,h0:1,mc:2,ex:0,lat:50,cool:6,hit:70,tr:1,rv:0},
 {n:'Autopista',desc:'Alta velocidad: patrullas más rápidas que pueden alcanzarte. Turbo: Mayús o X.',len:5000,p0:145,pd:13,k:2.4,gap:280,ht:15,h0:1,mc:3,ex:0,lat:60,cool:5,hit:90,tr:.85,rv:6,turboDuration:2.5,turboRecharge:4.5,turboPower:85},
 {n:'Infierno',desc:'Lava, fuego, rivales más rápidos y demonios que te persiguen. Turbo: Mayús o X.',len:6000,p0:176,pd:13,k:3.2,gap:580,ht:18,h0:2,mc:4,ex:1,lat:75,cool:4,hit:110,tr:.65,rv:8,turboDuration:3,turboRecharge:5,turboPower:100}];
let CFG={name:'',m:0,col:'#d8381f',lv:0};
try{Object.assign(CFG,JSON.parse(localStorage.getItem('hbr_cfg')||'{}'))}catch(e){}
let LV=LVS[CFG.lv]||LVS[0];LEN=LV.len;
const save=()=>{try{localStorage.setItem('hbr_cfg',JSON.stringify(CFG))}catch(e){}};
const aacFiles = ['audiouno.aac', 'audiodos.aac', 'audiotres.aac'];
const TR=SONGS.map((s,i)=>{const t={name:s.n,ok:0,user:0,el:new Audio()};t.el.loop=true;t.el.preload='auto';
 t.el.addEventListener('canplay',()=>{t.ok=1;if(!t.user)t.name=s.n; updateSelectors()});
 t.el.addEventListener('error',()=>{t.ok=0});t.el.src=aacFiles[i];return t});
function playTrack(){
 TR.forEach(t=>t.el.pause());const t=TR[A.song];
 if(t.ok){A.proc=0;t.el.currentTime=0;t.el.muted=!A.on;t.el.play().catch(()=>{})}
 else{A.proc=1;A.step=0;if(A.c)A.next=A.c.currentTime+.08}
 $('song').textContent='♪ '+t.name;
}
const toggleMute=()=>{A.on=!A.on;if(A.m)A.m.gain.value=A.on?.55:0;TR.forEach(t=>t.el.muted=!A.on);$('mute').style.opacity=A.on?1:.45};

/* ---------- UI y Selectores ---------- */
window.changeBike = dir => { CFG.m = (CFG.m + dir + BIKES.length) % BIKES.length; updateSelectors(); save(); };
window.changeLevel = dir => { CFG.lv = (CFG.lv + dir + LVS.length) % LVS.length; updateSelectors(); save(); };
window.changeSong = dir => { A.song = (A.song + dir + TR.length) % TR.length; updateSelectors(); if(st==='play') playTrack(); };

function updateSelectors() {
 $('sel-m').textContent = BIKES[CFG.m].n;
 $('sel-l').textContent = LVS[CFG.lv].n;
 $('level-desc').textContent = LVS[CFG.lv].desc;
 $('sel-a').textContent = TR[A.song].name;
 $('turbo').hidden=CFG.lv===0;
 $('col').value = CFG.col;
 if(st !== 'play') $('song').textContent='♪ '+TR[A.song].name;
 let b=0;try{b=+localStorage.getItem('hbr_best'+CFG.lv)||0}catch(e){}
 $('best').textContent=b?'Récord local: '+b+' pts':'';
}
$('col').oninput = e => { CFG.col = e.target.value; save(); }; // Real time update
$('nm').oninput = e => { CFG.name = e.target.value; save(); };

/* ---------- Game ---------- */
function reset(){
 G={sp:0,dist:0,scroll:0,x:laneX(1.5),t:0,cars:[],cops:[],chase:false,ct:0,cool:0,heat:1,spawn:1,turbo:0,turboCooldown:0,
 shake:0,near:0,bonus:0,lean:0,busted:false,msgT:0,
 riv:CFG.lv===2
  ?[{d:8,x:laneX(0),c:'#ff7b24',b:210,m:1},{d:-14,x:laneX(2),c:'#e8d2b0',b:224,m:2},{d:22,x:laneX(3),c:'#c93333',b:216,m:0}]
  :[{d:8,x:laneX(0),c:'#3aa0ff',b:132,m:1},{d:-14,x:laneX(2),c:'#7bd86a',b:138,m:2},{d:22,x:laneX(3),c:'#b06cff',b:128,m:0}]};
}
function toast(m){const e=$('toast');e.textContent=m;e.classList.add('on');G.msgT=1.6}
function activateTurbo(){
 if(st!=='play'||CFG.lv===0||G.turboCooldown>0)return;
 G.turbo=LV.turboDuration;
 G.turboCooldown=LV.turboDuration+LV.turboRecharge;
 toast(CFG.lv===2?'¡TURBO INFERNAL!':'¡TURBO!');
}
function addCop(gap){const n=G.cops.length;G.cops.push({x:laneX(1.5),gap,dx:n?(n%2?-26:26):0,off:Math.random()*-4,demon:CFG.lv===2})}
const pY=()=>H*.6;

function update(dt){
 const g=G;g.t+=dt;
 const B=BIKES[CFG.m];
 g.turbo=Math.max(0,g.turbo-dt);
 g.turboCooldown=Math.max(0,g.turboCooldown-dt);
 const speedLimit=B.top+(g.turbo>0?LV.turboPower:0);
 let acc=inp.g?B.acc*((1-g.sp/(speedLimit*1.09))+.15)*(g.turbo>0?3:1):inp.b?-170:-14;
 g.sp=clamp(g.sp+acc*dt,0,speedLimit);
 const steer=(inp.r-inp.l);
 g.x=clamp(g.x+steer*B.st*(150+g.sp*.5)*dt,RX+14,RX+RW-14);
 g.lean+=(steer*.2-g.lean)*Math.min(1,dt*10);
 g.scroll+=g.sp*3*dt;g.dist+=g.sp/3.6*dt;
 g.shake=Math.max(0,g.shake-dt);
 if(g.msgT>0){g.msgT-=dt;if(g.msgT<=0)$('toast').classList.remove('on')}

 g.spawn-=dt;
 if(g.spawn<0){
  g.spawn=(.5+Math.random()*.8-g.sp/700)*LV.tr;
  const l=Math.floor(Math.random()*4);
  if(!g.cars.some(c=>c.y<20&&Math.abs(c.x-laneX(l))<5))
   g.cars.push({x:laneX(l),y:-80,v:35+Math.random()*40,c:['#8a3b2a','#3f5d73','#6b6b3a','#5a4a7a','#9a8a6a'][Math.floor(Math.random()*5)]});
 }
 const py=pY();
 for(const c of g.cars){
  c.y+=(g.sp-c.v)*3*dt;
  if(!c.hit&&Math.abs(c.x-g.x)<18&&Math.abs(c.y-py)<42){
   c.hit=1;g.sp*=B.crash;g.shake=.5;A.hit();toast('¡Choque!');
   for(const p of g.cops)p.gap-=LV.hit;
  }
  if(!c.hit&&!c.passed&&c.y>py+32){c.passed=1;if(Math.abs(c.x-g.x)<34){g.near++;g.bonus+=25;toast('Rozón +25')}}
 }
 g.cars=g.cars.filter(c=>c.y<H+120&&c.y>-300);

 if(!g.chase){g.cool=Math.max(0,g.cool-dt);
  if(g.sp>120&&g.cool<=0){g.chase=true;g.ct=0;g.heat=LV.h0;addCop(LV.gap);toast(CFG.lv===2?'¡Los demonios te olieron!':'¡Te vio la policía!')}}
 else{
  g.ct+=dt;g.heat=Math.min(5,LV.h0+Math.floor(g.ct/LV.ht));
  const want=Math.min(LV.mc,1+LV.ex+Math.floor(g.heat/2));
  while(g.cops.length<want)addCop(LV.gap+60+g.cops.length*90);
  const ps=LV.p0+g.heat*LV.pd;
  for(const c of g.cops){
   c.gap+=(g.sp-ps-c.off)*dt*LV.k;
   const d=g.x+c.dx-c.x;c.x+=Math.sign(d)*Math.min(Math.abs(d),(LV.lat+g.heat*14)*dt);
   if(c.gap<6)g.busted=true;
  }
  if(g.cops.every(c=>c.gap>900)){g.cops=[];g.chase=false;g.cool=LV.cool;g.bonus+=200;toast('Los despistaste +200')}
 }
 for(const r of g.riv){
  const i=g.riv.indexOf(r);
  let v=r.b+LV.rv+10*Math.sin(g.t*.3+i)+clamp((g.dist-r.d)*.08,-12,12);
  v*=Math.min(1,g.t/6);r.d+=v/3.6*dt;
 }
 if(g.busted)return finish(false);
 if(g.dist>=LEN)finish(true);
}
const rank=()=>1+G.riv.filter(r=>r.d>G.dist).length;

function finish(win){
 st='over';A.run=0;TR.forEach(t=>t.el.pause());$('alert').classList.remove('on');
 const rk=rank(),score=Math.floor(G.dist)+G.bonus+(win?(4-rk)*500+Math.max(0,Math.floor(2000-G.t*10)):0);
 let best=0;try{best=+localStorage.getItem('hbr_best'+CFG.lv)||0;if(score>best){best=score;localStorage.setItem('hbr_best'+CFG.lv,best)}}catch(e){}
 $('etitle').textContent=win?(rk===1?'¡Ganaste, '+CFG.name+'!':CFG.name+': '+rk+'º lugar'):'Te atraparon, '+CFG.name;
 $('nextl').style.display=win&&CFG.lv<2?'':'none';
 $('emsg').textContent=win
  ?(CFG.lv===2?'Escapaste del infierno con los demonios pisándote los talones.':'Cruzaste la meta con la ley pisándote los talones.')
  :(CFG.lv===2?'Los demonios te alcanzaron y te arrastraron al abismo.':'La policía te cerró el paso. Esta vez no hubo escape.');
 $('stats').innerHTML=`<span>Distancia</span><b>${Math.floor(G.dist)} m</b><span>Rozones</span><b>${G.near}</b><span>Puntos</span><b>${score}</b><span>Récord</span><b>${best}</b>`;
 $('end').classList.remove('hidden');
}

/* ---------- Render ---------- */
const rr=(x,y,w,h,r)=>{cx.beginPath();cx.roundRect(x,y,w,h,r);cx.fill()};
function car(x,y,col,cop,t){
 cx.save();cx.translate(x,y);
 cx.fillStyle='rgba(0,0,0,.35)';rr(-15,-24,30,54,6);
 cx.fillStyle=cop?'#ecebe6':col;rr(-14,-27,28,54,6);
 if(cop){cx.fillStyle='#16130f';rr(-14,-4,28,10,2)}
 cx.fillStyle='#14110f';rr(-10,-16,20,9,3);rr(-10,8,20,8,3);
 cx.fillStyle='#ff3b2e';rr(-13,24,6,3,1);rr(7,24,6,3,1);
 if(cop){const ph=Math.sin(t*14)>0;
  cx.fillStyle=ph?'#ff2a20':'#3b1010';rr(-9,-3,9,4,1);
  cx.fillStyle=ph?'#0d1a44':'#2e6bff';rr(0,-3,9,4,1);
  const gr=cx.createRadialGradient(ph?-5:5,-1,2,ph?-5:5,-1,34);
  gr.addColorStop(0,ph?'rgba(255,40,30,.6)':'rgba(46,107,255,.6)');gr.addColorStop(1,'transparent');
  cx.fillStyle=gr;cx.fillRect(-45,-40,90,80)}
 cx.restore();
}
function demon(x,y,t,heat){
 cx.save();cx.translate(x,y);
 const pulse=1+Math.sin(t*9)*.08;
 cx.scale(pulse,1);
 cx.fillStyle='rgba(0,0,0,.5)';cx.beginPath();cx.ellipse(0,18,19,8,0,0,7);cx.fill();
 cx.fillStyle='#220807';cx.beginPath();cx.moveTo(-15,10);cx.lineTo(-12,-12);cx.lineTo(-7,-22);cx.lineTo(-3,-13);cx.lineTo(4,-15);cx.lineTo(11,-26);cx.lineTo(13,-8);cx.lineTo(16,12);cx.closePath();cx.fill();
 cx.fillStyle='#a51f12';cx.beginPath();cx.ellipse(0,-5,12,16,0,0,7);cx.fill();
 cx.fillStyle='#ffb21e';cx.beginPath();cx.moveTo(-9,-16);cx.lineTo(-15,-32);cx.lineTo(-4,-22);cx.lineTo(1,-22);cx.lineTo(11,-35);cx.lineTo(8,-17);cx.closePath();cx.fill();
 cx.fillStyle='#fff2b0';cx.shadowColor='#ff3b18';cx.shadowBlur=12+heat*2;
 cx.fillRect(-8,-8,5,3);cx.fillRect(3,-8,5,3);cx.shadowBlur=0;
 cx.fillStyle='#ff4a13';cx.beginPath();cx.moveTo(-10,12);cx.lineTo(-15,25+Math.sin(t*17)*5);cx.lineTo(-5,14);cx.moveTo(7,13);cx.lineTo(14,27+Math.sin(t*15+1)*5);cx.lineTo(11,12);cx.fill();
 cx.restore();
}
function bike(x,y,lean,col,fire,m=0){
 cx.save();cx.translate(x,y);cx.rotate(lean);
 cx.fillStyle='rgba(0,0,0,.35)';rr(-6,-20,12,44,5);
 cx.fillStyle='#0c0b0b';rr(-3.5,-24,7,13,3);rr(-3.5,10,7,14,3);
 cx.fillStyle=col;[()=>rr(-4,-18,8,36,4),()=>rr(-6,-12,12,28,6),()=>rr(-8,-14,16,30,6)][m]();
 cx.fillStyle='#262220';const bw=[13,8,12][m];rr(-bw,-12,bw*2,3,1.5);if(m===0)rr(-3.5,-30,7,10,3);
 if(m===1){cx.fillStyle='rgba(255,255,255,.3)';cx.beginPath();cx.moveTo(-6,-12);cx.lineTo(0,-24);cx.lineTo(6,-12);cx.fill()}
 if(m===2){cx.fillStyle='#1a1512';rr(-13,6,5,12,2);rr(8,6,5,12,2)}
 cx.fillStyle='#3a2a20';cx.beginPath();cx.ellipse(0,3,9,7,0,0,7);cx.fill();
 cx.fillStyle='#e8dcc3';cx.beginPath();cx.arc(0,-3,5,0,7);cx.fill();
 if(fire){cx.fillStyle='#ffb21e';cx.beginPath();cx.moveTo(-2,24);cx.lineTo(0,24+8+Math.random()*8);cx.lineTo(2,24);cx.fill()}
 cx.restore();
}

function renderGarage(ts) {
  const gc = $('garage-canvas');
  if(!gc || !gc.width) return;
  const ctx = gc.getContext('2d');
  const w = gc.width, h = gc.height;
  ctx.clearRect(0,0,w,h);
  
  ctx.save();
  // Centrar y bajar un poco (para hacer hueco al título)
  ctx.translate(w/2, h/2 + 20);
  
  // Escala adaptativa basada en la pantalla, super grande
  const scale = Math.min(w, h) / 75;
  ctx.scale(scale, scale);
  
  // Reemplazar context global temporalmente para reusar la función bike
  const oldCx = cx;
  cx = ctx;
  
  // Animación suave de ralentí (bobbing)
  const idleLean = Math.sin(ts / 300) * 0.04;
  bike(0, 0, idleLean, CFG.col, true, CFG.m);
  
  cx = oldCx;
  ctx.restore();

  // Stats text
  ctx.font = `14px ${getComputedStyle(document.body).getPropertyValue('--disp').split(',')[0]}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(240,230,208,0.6)';
  const b = BIKES[CFG.m];
  ctx.fillText(`VEL. MAX: ${b.top} KM/H  •  ${b.d.toUpperCase()}`, w/2, h - 25);
}

function draw(){
 const g=G,t=g.t,py=pY();
 cx.setTransform(DPR*S,0,0,DPR*S,0,0);
 const hell=CFG.lv===2,highway=CFG.lv===1;
 cx.fillStyle=hell?'#3b0908':highway?'#172737':'#3a2a1c';cx.fillRect(0,0,W,H);
 if(g.shake>0)cx.translate((Math.random()-.5)*8*g.shake*2,(Math.random()-.5)*8*g.shake*2);
 // scenery
 const base=Math.floor(g.scroll/90),off=g.scroll%90;
 for(let i=-1;i<H/90+2;i++){
  const id=base-i,y=i*90+off-45,h=(Math.sin(id*12.9898)*43758.5453)%1;
  const hs=Math.abs(h);
  if(hell){
   cx.fillStyle=hs<.5?'#6d170d':'#a52b0b';cx.beginPath();cx.moveTo(hs<.5?18:W-18,y+25);cx.lineTo(hs<.5?12:W-12,y+8);cx.lineTo(hs<.5?20:W-20,y-15-hs*20);cx.lineTo(hs<.5?28:W-28,y+8);cx.closePath();cx.fill();
   cx.fillStyle='#ff6a13';cx.beginPath();cx.ellipse(hs<.5?18+hs*14:W-18-(hs-.5)*28,y+hs*40,4+hs*5,8+hs*7,0,0,7);cx.fill();
   cx.fillStyle='#f23b0b';cx.fillRect(RX-14,y,5,14);cx.fillRect(RX+RW+9,y,5,14);
  }else if(highway){
   cx.fillStyle='#506b7d';cx.fillRect(RX-19,y,4,24);cx.fillRect(RX+RW+15,y,4,24);
   cx.fillStyle='#a8c4d3';cx.fillRect(RX-24,y+4,9,3);cx.fillRect(RX+15+RW,y+4,9,3);
   if(i%3===0){cx.fillStyle='rgba(98,183,255,.45)';cx.beginPath();cx.arc(RX-17,y+4,16,0,7);cx.arc(RX+RW+17,y+4,16,0,7);cx.fill()}
  }else{
   cx.fillStyle='#2a3a1f';cx.beginPath();cx.arc(hs<.5?18+hs*14:W-18-(hs-.5)*28,y+hs*40,9+hs*10,0,7);cx.fill();
   cx.fillStyle='#6a5a48';cx.fillRect(RX-14,y,3,10);cx.fillRect(RX+RW+11,y,3,10);
  }
 }
 // road
 cx.fillStyle=hell?'#8d260d':highway?'#8995a0':'#5a4a3a';cx.fillRect(RX-8,0,RW+16,H);
 cx.fillStyle=hell?'#260d0b':highway?'#303a45':'#1d1b1a';cx.fillRect(RX,0,RW,H);
 if(hell){
  const glow=cx.createLinearGradient(RX-12,0,RX+RW+12,0);
  glow.addColorStop(0,'rgba(255,50,0,.42)');glow.addColorStop(.15,'transparent');glow.addColorStop(.85,'transparent');glow.addColorStop(1,'rgba(255,50,0,.42)');
  cx.fillStyle=glow;cx.fillRect(RX-12,0,RW+24,H);
 }
 cx.lineWidth=6;
 const edge=hell?'#ff6a13':highway?'#d6e2e8':'#d8381f';
 for(const [x,c,o] of [[RX-3,edge,0],[RX+RW+3,edge,0],[RX-3,'#f0e6d0',18],[RX+RW+3,'#f0e6d0',18]]){
  cx.strokeStyle=c;cx.setLineDash([18,18]);cx.lineDashOffset=-g.scroll+o;
  cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke();
 }
 cx.lineWidth=3;cx.strokeStyle=hell?'rgba(255,115,32,.72)':highway?'rgba(200,220,232,.65)':'rgba(240,230,208,.55)';cx.setLineDash([34,34]);cx.lineDashOffset=-g.scroll;
 for(let i=1;i<4;i++){cx.beginPath();cx.moveTo(RX+LW*i,0);cx.lineTo(RX+LW*i,H);cx.stroke()}
 cx.setLineDash([]);
 // finish line
 const fy=py-(LEN-g.dist)*PX;
 if(fy>-30&&fy<H+30){for(let i=0;i<18;i++){for(let j=0;j<2;j++){cx.fillStyle=(i+j)%2?'#f0e6d0':'#15110e';cx.fillRect(RX+i*15,fy+j*12,15,12)}}}
 // rivals
 for(const r of g.riv){const y=py-(r.d-g.dist)*PX;if(y>-50&&y<H+50)bike(r.x,y,0,r.c,0,r.m)}
 for(const c of g.cars)car(c.x,c.y,c.c,0,t);
 for(const c of g.cops){
  const cy=py+49+c.gap;
  if(c.demon)demon(c.x,cy,t,g.heat);else car(c.x,cy,0,1,t);
 }
 bike(g.x,py,g.lean,CFG.col,g.sp>BIKES[CFG.m].top*.68,CFG.m);
 cx.font='bold 9px system-ui,sans-serif';cx.textAlign='center';cx.fillStyle='#f0e6d0';cx.strokeStyle='#000';cx.lineWidth=2.5;
 cx.strokeText(CFG.name,g.x,py-36);cx.fillText(CFG.name,g.x,py-36);
 // speed streaks
 if(g.sp>140){cx.strokeStyle='rgba(240,230,208,.12)';cx.lineWidth=1.5;
  for(let k=0;k<10;k++){const x=(k*37+13)%W,y=((k*97+g.scroll*1.6)%(H+60))-30;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x,y+30+g.sp/6);cx.stroke()}}
 // siren glow on edges
 if(g.chase&&!hell){const ph=Math.sin(t*10)>0,a=.22+.1*g.heat/5;
  const l=cx.createLinearGradient(0,0,110,0);l.addColorStop(0,ph?`rgba(255,40,30,${a})`:`rgba(46,107,255,${a})`);l.addColorStop(1,'transparent');
  cx.fillStyle=l;cx.fillRect(0,0,110,H);
  const r=cx.createLinearGradient(W,0,W-110,0);r.addColorStop(0,ph?`rgba(46,107,255,${a})`:`rgba(255,40,30,${a})`);r.addColorStop(1,'transparent');
  cx.fillStyle=r;cx.fillRect(W-110,0,110,H)}
 // HUD
 $('spd').textContent=Math.round(g.sp);
 $('pf').style.width=Math.min(100,g.dist/LEN*100)+'%';
 $('pos').innerHTML=rank()+'<small>/4</small>';
 const turbo=$('turbo');
 turbo.disabled=g.turboCooldown>0;
 turbo.classList.toggle('d',g.turbo>0);
 turbo.textContent=g.turbo>0?'¡DALE!':g.turboCooldown>0?`${Math.ceil(g.turboCooldown)}s`:'TURBO';
 const al=$('alert');al.classList.toggle('on',g.chase);
 if(g.chase)al.textContent=(hell?'¡DEMONIOS! ':'¡POLICÍA! ')+'★'.repeat(g.heat);
}
function loop(ts){
 const dt=Math.min(.05,(ts-last)/1000||0);last=ts;
 if(st === 'menu'){
   renderGarage(ts); // Render del garaje dinámico
 } else if(G) {
   if(st==='play')update(dt);
   draw();A.update();
 }
 requestAnimationFrame(loop);
}

/* ---------- UI / input ---------- */
function resize(){
 const vw=document.documentElement.clientWidth,vh=window.visualViewport?.height||document.documentElement.clientHeight;
 const w=Math.min(vw,Math.max(280,Math.min(600,Math.max(vh*.72,vw*.68)))),s=$('stage');
 s.style.width=w+'px';s.style.height=vh+'px';DPR=Math.min(devicePixelRatio||1,2);S=w/W;H=vh/S;
 cv.width=Math.round(w*DPR);cv.height=Math.round(vh*DPR);
 // Ajustar garaje
 const gc=$('garage-canvas');
 if(gc) { gc.width = gc.clientWidth * DPR; gc.height = gc.clientHeight * DPR; }
}
function bind(id,key){
 const e=$(id),on=v=>ev=>{ev.preventDefault();inp[key]=v;e.classList.toggle('d',!!v)};
 e.addEventListener('pointerdown',on(1));
 ['pointerup','pointercancel','pointerleave'].forEach(n=>e.addEventListener(n,on(0)));
}
bind('bl','l');bind('br','r');bind('bg','g');bind('bb','b');
const keys={ArrowLeft:'l',a:'l',ArrowRight:'r',d:'r',ArrowUp:'g',w:'g',ArrowDown:'b',s:'b',' ':'b'};
addEventListener('keydown',e=>{const k=keys[e.key.length>1?e.key:e.key.toLowerCase()];
 if(k){inp[k]=1;e.preventDefault()}
 else if((e.key==='Shift'||e.key.toLowerCase()==='x')&&!e.repeat){activateTurbo();e.preventDefault()}
 else if(e.key==='m'||e.key==='M')toggleMute();else if(e.key==='n'||e.key==='N')changeSong(1)});
addEventListener('keyup',e=>{const k=keys[e.key.length>1?e.key:e.key.toLowerCase()];if(k)inp[k]=0});
addEventListener('blur',()=>{inp.l=inp.r=inp.g=inp.b=0});
document.addEventListener('visibilitychange',()=>{if(A.c)document.hidden?A.c.suspend():A.c.resume();
 const t=TR[A.song];if(document.hidden)t.el.pause();else if(st==='play'&&t.ok)t.el.play().catch(()=>{})});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('resize',resize);
if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);
$('prev').onclick=()=>changeSong(-1);$('next').onclick=()=>changeSong(1);$('mute').onclick=toggleMute;
$('turbo').onclick=activateTurbo;
function start(){
 CFG.name=($('nm').value||'Rider').trim().slice(0,12);save();
 LV=LVS[CFG.lv];LEN=LV.len;A.init();reset();st='play';
 $('menu').classList.add('hidden');$('end').classList.add('hidden');A.start();
}
$('go').onclick=start;$('again').onclick=start;
$('nextl').onclick=()=>{CFG.lv=Math.min(2,CFG.lv+1);updateSelectors();start()};
$('menub').onclick=()=>{st='menu';$('end').classList.add('hidden');$('menu').classList.remove('hidden');updateSelectors();};

// Inicialización de la vista
$('nm').value = CFG.name;
updateSelectors();
resize();
reset();
requestAnimationFrame(loop);
})();
