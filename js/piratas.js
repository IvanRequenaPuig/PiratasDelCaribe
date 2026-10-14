(() => {
const $ = s => document.querySelector(s);
const canvas = $('#sea');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x7ec8e3, 40, 260);
const camera = new THREE.PerspectiveCamera(55, 1, .1, 800);

/* Luces */
const hemi = new THREE.HemisphereLight(0xbfe3ff, 0x1a2a3a, .8); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1cc, 1.4); sun.position.set(-40,50,30); sun.castShadow = true;
sun.shadow.camera.left=-20; sun.shadow.camera.right=20; sun.shadow.camera.top=20; sun.shadow.camera.bottom=-20; sun.shadow.mapSize.set(1024,1024);
scene.add(sun);
const lantern = new THREE.PointLight(0xffaa44, 0, 14); lantern.position.set(-4.4,3.4,0); scene.add(lantern);

/* Océano */
const SEG = 110, oceanGeo = new THREE.PlaneGeometry(500,500,SEG,SEG); oceanGeo.rotateX(-Math.PI/2);
const base = oceanGeo.attributes.position.array.slice();
const ocean = new THREE.Mesh(oceanGeo, new THREE.MeshStandardMaterial({color:0x0e5a78, roughness:.28, metalness:.35}));
ocean.receiveShadow = true; scene.add(ocean);
const wave = (x,z,t) => Math.sin(x*.12+t*1.1)*.9 + Math.sin(z*.18+t*1.4)*.6 + Math.sin((x+z)*.35+t*2.2)*.2;

/* Barco */
const ship = new THREE.Group(); scene.add(ship);
const wood = new THREE.MeshStandardMaterial({color:0x2a1a10, roughness:.85});
const woodL = new THREE.MeshStandardMaterial({color:0x5a3b22, roughness:.8});
const cloth = new THREE.MeshStandardMaterial({color:0x2b2623, roughness:1, side:THREE.DoubleSide});
const gold = new THREE.MeshStandardMaterial({color:0xd4a84b, metalness:.9, roughness:.3});
const add = (m,p,par=ship) => { m.position.set(...p); m.castShadow = true; par.add(m); return m; };

// Casco: caja deformada (proa afilada y elevada)
const hg = new THREE.BoxGeometry(11,2.6,3.4,24,4,6), hp = hg.attributes.position;
for (let i=0;i<hp.count;i++){
  let x=hp.getX(i), y=hp.getY(i), z=hp.getZ(i);
  const bow = Math.max(0,(x-1)/4.5); z *= 1 - .88*bow*bow;
  if (y<0) z *= .62 + .38*(1+y/1.3);
  y += bow*bow*1.3 + Math.max(0,(-x-2)/3.5)*.7;
  hp.setXYZ(i,x,y,z);
}
hg.computeVertexNormals(); add(new THREE.Mesh(hg,wood),[0,.4,0]);
add(new THREE.Mesh(new THREE.BoxGeometry(9.6,.15,2.9),woodL),[-.3,1.75,0]);          // cubierta
add(new THREE.Mesh(new THREE.BoxGeometry(3,1.6,3),wood),[-4.4,2.6,0]);                // castillo popa
add(new THREE.Mesh(new THREE.BoxGeometry(3.2,.12,3.2),woodL),[-4.4,3.45,0]);
add(new THREE.Mesh(new THREE.BoxGeometry(11,.12,.12),gold),[0,1.1,1.62]);              // franja dorada
add(new THREE.Mesh(new THREE.BoxGeometry(11,.12,.12),gold),[0,1.1,-1.62]);
const bs = add(new THREE.Mesh(new THREE.CylinderGeometry(.1,.16,5,8),woodL),[6.3,2.9,0]); bs.rotation.z = -1.25; // bauprés
for (let i=0;i<5;i++) for (const s of [1,-1]) {                                           // cañones
  const c = add(new THREE.Mesh(new THREE.CylinderGeometry(.14,.18,.9,10),new THREE.MeshStandardMaterial({color:0x111,metalness:.7,roughness:.4})),[-1+i*1.6-.6,1.1,s*1.55]);
  c.rotation.x = Math.PI/2;
}
// Mástiles y velas
const sails = [];
function mast(x,h,w,sh){
  add(new THREE.Mesh(new THREE.CylinderGeometry(.14,.22,h,10),woodL),[x,1.8+h/2,0]);
  for (const [yy,k] of [[.32,1],[.68,.8],[.92,.55]]) {
    const y = 1.8+h*yy;
    const yd = add(new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,w*k,6),woodL),[x,y+sh*k/2,0]); yd.rotation.x = Math.PI/2;
    const g = new THREE.PlaneGeometry(w*k*.95, sh*k, 14, 10); g.userData = {o: g.attributes.position.array.slice()};
    const m = new THREE.Mesh(g,cloth); m.position.set(x+.06,y-sh*k/2+sh*k/2-.1,0); m.rotation.y = Math.PI/2; m.castShadow = true;
    ship.add(m); sails.push(m);
  }
}
mast(3,11,3.2,2.6); mast(-.8,13.5,3.8,3.2); mast(-4.2,9,3,2.2);
// Bandera pirata
const flagG = new THREE.PlaneGeometry(1.6,1,10,4); flagG.userData={o:flagG.attributes.position.array.slice()};
const fc = document.createElement('canvas'); fc.width=128; fc.height=80; const fx=fc.getContext('2d');
fx.fillStyle='#0a0a0a'; fx.fillRect(0,0,128,80); fx.fillStyle='#eee'; fx.beginPath(); fx.arc(64,34,16,0,7); fx.fill(); fx.fillRect(54,44,20,10);
fx.fillStyle='#0a0a0a'; fx.beginPath(); fx.arc(58,32,4,0,7); fx.arc(70,32,4,0,7); fx.fill();
fx.strokeStyle='#eee'; fx.lineWidth=5; fx.beginPath(); fx.moveTo(30,64); fx.lineTo(98,58); fx.moveTo(30,58); fx.lineTo(98,64); fx.stroke();
const flag = new THREE.Mesh(flagG,new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(fc),side:THREE.DoubleSide}));
flag.position.set(-.8,15.7,.9); flag.rotation.y = Math.PI/2; ship.add(flag);
// Farol
add(new THREE.Mesh(new THREE.SphereGeometry(.2,12,12),new THREE.MeshBasicMaterial({color:0xffbb55})),[-5.6,3.9,0]);
ship.scale.setScalar(1.15);

/* Estrellas */
const sg = new THREE.BufferGeometry(), sp = [];
for (let i=0;i<1500;i++){ const a=Math.random()*6.28, b=Math.random()*1.3+.1, r=400; sp.push(Math.cos(a)*Math.cos(b)*r, Math.sin(b)*r, Math.sin(a)*Math.cos(b)*r); }
sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
const stars = new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.6,transparent:true,opacity:0,fog:false})); scene.add(stars);

/* Islas del mapa: aparecen y pasan según avanzas */
const sandM=new THREE.MeshStandardMaterial({color:0xd8c08a,roughness:1}), rockM=new THREE.MeshStandardMaterial({color:0x3a3a3c,roughness:1,flatShading:true}),
  leafM=new THREE.MeshStandardMaterial({color:0x2e8b3d,side:THREE.DoubleSide,roughness:1}), whiteM=new THREE.MeshStandardMaterial({color:0xeeeeee,roughness:.8}),
  redM=new THREE.MeshStandardMaterial({color:0xa02020,side:THREE.DoubleSide,roughness:.8}), goldM=new THREE.MeshStandardMaterial({color:0xd4a84b,metalness:.8,roughness:.3}),
  torch=new THREE.MeshBasicMaterial({color:0xffaa44}), lava=new THREE.MeshBasicMaterial({color:0xff6a2a});
const mesh=(g,m,x,y,z,par)=>{ const o=new THREE.Mesh(g,m); o.position.set(x,y,z); o.castShadow=true; par.add(o); return o; };
function palm(par,x,z,h){ const tr=mesh(new THREE.CylinderGeometry(.18,.3,h,6),woodL,x,h/2+1,z,par); tr.rotation.z=(Math.random()-.5)*.3;
  for(let i=0;i<6;i++){ const g=new THREE.PlaneGeometry(.9,4,1,3); g.translate(0,2,0); const l=mesh(g,leafM,x,h+1,z,par); l.rotation.set(1.2,i*1.05,0,'YXZ'); } }
function mkIsland(t){ const g=new THREE.Group(), o={g};
  mesh(new THREE.CylinderGeometry(t==='fort'?20:15,t==='fort'?26:23,5,28),t==='volcan'?rockM:sandM,0,0,0,g);
  if(t==='tortuga'){ for(let i=0;i<7;i++) palm(g,(Math.random()-.5)*20,(Math.random()-.5)*20,6+Math.random()*4);
    for(let i=0;i<3;i++){ const x=-6+i*6; mesh(new THREE.BoxGeometry(3,2,3),woodL,x,3.5,6,g); mesh(new THREE.ConeGeometry(2.8,1.8,4),wood,x,5.4,6,g).rotation.y=.78; } }
  if(t==='fort'){ mesh(new THREE.BoxGeometry(20,5,14),rockM,0,4.8,0,g);
    for(const [x,z] of [[-10,-7],[10,-7],[-10,7],[10,7]]){ mesh(new THREE.CylinderGeometry(2.4,2.8,9,10),rockM,x,6,z,g); mesh(new THREE.SphereGeometry(.4,8,8),torch,x,11,z,g); }
    mesh(new THREE.BoxGeometry(.2,6,.2),woodL,0,10,0,g); mesh(new THREE.PlaneGeometry(2.4,1.4),redM,1.3,12,0,g); }
  if(t==='faro'){ mesh(new THREE.ConeGeometry(14,16,8),rockM,0,8,0,g); mesh(new THREE.CylinderGeometry(1.8,2.6,16,12),whiteM,0,22,0,g); mesh(new THREE.CylinderGeometry(2.6,2.8,3,12),redM,0,17,0,g); mesh(new THREE.SphereGeometry(1.5,12,12),torch,0,31,0,g);
    o.beam=new THREE.Group(); o.beam.position.y=31; const bg=new THREE.ConeGeometry(5,45,16,1,true); bg.translate(0,-22.5,0); bg.rotateZ(Math.PI/2);
    o.bm=new THREE.MeshBasicMaterial({color:0xfff2b0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
    o.beam.add(new THREE.Mesh(bg,o.bm)); g.add(o.beam); o.light=new THREE.PointLight(0xffd080,0,60); o.light.position.y=31; g.add(o.light); }
  if(t==='volcan'){ mesh(new THREE.ConeGeometry(15,34,9),rockM,0,17,0,g); mesh(new THREE.CylinderGeometry(3,4.2,2,10),lava,0,34,0,g);
    o.light=new THREE.PointLight(0xff5a1f,3,90); o.light.position.y=38; g.add(o.light); }
  if(t==='wreck'){ o.wrecks=[]; for(let i=0;i<2;i++){ const w=ship.clone(); w.traverse(q=>{ if(q.isMesh&&q.geometry.type==='PlaneGeometry') q.visible=false; });
      w.scale.setScalar(.85); w.position.set(i?-12:6,-.5,i?10:-6); w.rotation.set(i?.3:-.2,i*2+.7,i?.5:.4); g.add(w); o.wrecks.push(w); }
    for(let i=0;i<4;i++) palm(g,(Math.random()-.5)*14,(Math.random()-.5)*14,5+Math.random()*3); }
  if(t==='tesoro'){ for(let i=0;i<6;i++) palm(g,(Math.random()-.5)*20,(Math.random()-.5)*20,6+Math.random()*4);
    mesh(new THREE.BoxGeometry(2.2,1.3,1.4),woodL,0,3.1,0,g); mesh(new THREE.CylinderGeometry(.7,.7,2.2,12,1,false,0,Math.PI),goldM,0,3.75,0,g).rotation.z=Math.PI/2;
    o.tb=new THREE.MeshBasicMaterial({color:0xffd24a,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
    mesh(new THREE.CylinderGeometry(.8,1.6,90,16,1,true),o.tb,0,48,0,g).userData.keep=true; o.light=new THREE.PointLight(0xffc040,2.5,50); o.light.position.y=5; g.add(o.light); }
  return o; }
const ISL=[{n:'Tortuga',p:.1,z:-70,t:'tortuga'},{n:'Port Royal',p:.24,z:-78,t:'fort'},{n:'Isla del Faro',p:.45,z:-68,t:'faro'},
  {n:'Isla de Muerta',p:.58,z:85,t:'volcan'},{n:'Cementerio de Barcos',p:.8,z:72,t:'wreck'},{n:'Isla del Tesoro',p:1,z:62,t:'tesoro'}];
ISL.forEach(s=>{ Object.assign(s,mkIsland(s.t)); scene.add(s.g); });

/* Mapa de ruta (HUD) y avisos */
const dots=[], found=new Set(), route=$('#route'), toastEl=$('#toast'); let toastT;
ISL.forEach(s=>{ const d=document.createElement('div'); d.className='dot'; d.innerHTML='<i></i><span>'+s.n+'</span>'; route.appendChild(d); dots.push(d); });
function toast(m){ toastEl.textContent=m; toastEl.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>toastEl.classList.remove('show'),3200); }

/* Kraken: tentáculos que emergen en la tormenta */
const tent=[], tm=new THREE.MeshStandardMaterial({color:0x3d4a3a,roughness:.6});
function tentacle(x,z,s){ const root=new THREE.Group(); root.position.set(x,-26,z); let par=root; const segs=[];
  for(let i=0;i<10;i++){ const L=3, seg=new THREE.Group(); seg.position.y=i?L:0; const m=new THREE.Mesh(new THREE.CylinderGeometry(.9-i*.07,1-i*.07,L,8),tm); m.position.y=L/2; seg.add(m); par.add(seg); segs.push(seg); par=seg; }
  root.scale.setScalar(s); scene.add(root); tent.push({root,segs}); }
tentacle(28,22,1.3); tentacle(44,6,1.6); tentacle(18,42,1.1);

/* Gaviotas de día */
const gulls=[], gm=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,transparent:true,fog:false});
for(let i=0;i<9;i++){ const g=new THREE.Group(), wg=new THREE.PlaneGeometry(1.2,.35); wg.translate(.6,0,0);
  const w1=new THREE.Mesh(wg,gm), w2=new THREE.Mesh(wg,gm); w2.scale.x=-1; g.add(w1,w2); scene.add(g);
  gulls.push({g,w1,w2,r:22+Math.random()*30,h:12+Math.random()*10,s:.15+Math.random()*.15,o:Math.random()*6.28}); }

function updateWorld(p,t,k){
  const st=Math.max(0,1-Math.abs(p-.72)*5);
  ISL.forEach((s,i)=>{ const x=(s.p-p)*320; s.g.position.set(x,0,s.z); s.g.visible=Math.abs(x)<300;
    if(s.beam){ s.beam.rotation.y=t*1.1; s.bm.opacity=k.star*.4; s.light.intensity=k.star*3; }
    if(s.t==='volcan') s.light.intensity=2.5+Math.sin(t*7)*.8;
    if(s.tb){ s.tb.opacity=.22+Math.sin(t*2)*.08; s.light.intensity=2+Math.sin(t*3); }
    if(Math.abs(s.p-p)<.03&&!found.has(i)){ found.add(i); dots[i].classList.add('on'); toast('🏝️ Isla descubierta: '+s.n); } });
  tent.forEach((q,j)=>{ q.root.visible=st>.05; q.root.position.y=-26+st*28+Math.sin(t+j)*.6;
    q.segs.forEach((s,i)=>{ s.rotation.z=.14*Math.sin(t*1.3+i*.55+j*2)+.05; s.rotation.x=.12*Math.cos(t*1.1+i*.5+j); }); });
  gm.opacity=THREE.MathUtils.clamp((k.sun-.6)*2,0,1)*(1-st);
  gulls.forEach(q=>{ const a=t*q.s+q.o; q.g.position.set(Math.cos(a)*q.r,q.h+Math.sin(t+q.o)*1.2,Math.sin(a)*q.r); q.g.rotation.y=-a;
    q.w1.rotation.z=Math.sin(t*8+q.o)*.5; q.w2.rotation.z=-q.w1.rotation.z; });
}

/* Lluvia */
const RN=2500, rg=new THREE.BufferGeometry(), rp=new Float32Array(RN*3);
for(let i=0;i<RN;i++){rp[i*3]=(Math.random()-.5)*70;rp[i*3+1]=Math.random()*40;rp[i*3+2]=(Math.random()-.5)*70;}
rg.setAttribute('position',new THREE.BufferAttribute(rp,3));
const rain=new THREE.Points(rg,new THREE.PointsMaterial({color:0xaac4dd,size:.12,transparent:true,opacity:0,fog:false})); scene.add(rain);

/* Holandés Errante (barco fantasma entre la niebla) */
const ghostMat=new THREE.MeshStandardMaterial({color:0x6fffd0,emissive:0x1a8a6a,transparent:true,opacity:0,roughness:1,side:THREE.DoubleSide,fog:false});
const dutch=ship.clone(); dutch.traverse(o=>{if(o.isMesh)o.material=ghostMat}); dutch.scale.setScalar(1.7); dutch.position.set(95,0,40); dutch.rotation.y=2.5; scene.add(dutch);
const dLight=new THREE.PointLight(0x40ffc0,0,80); dLight.position.set(92,8,38); scene.add(dLight);

/* Modelos 3D externos (Sketchfab, etc.) → se configuran en js/modelos.js. Si falta un archivo se usa el de código */
const CFG=window.MODELOS||{};
function fit(obj,size,rotY,yOff){ obj.rotation.y=THREE.MathUtils.degToRad(rotY||0); obj.updateMatrixWorld(true);
  const b=new THREE.Box3().setFromObject(obj), sz=b.getSize(new THREE.Vector3()), c=b.getCenter(new THREE.Vector3()), k=size/Math.max(sz.x,sz.z);
  obj.scale.setScalar(k); obj.position.set(-c.x*k,-b.min.y*k+(yOff||0),-c.z*k); const g=new THREE.Group(); g.add(obj); return g; }
function loadGLB(cfg,ok){ if(!cfg||!cfg.url||!THREE.GLTFLoader) return;
  new THREE.GLTFLoader().load(cfg.url,gl=>{ gl.scene.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); ok(fit(gl.scene,cfg.size||20,cfg.rotY,cfg.y)); console.info('Modelo cargado:',cfg.url); },
    undefined,()=>console.warn('No se pudo cargar '+cfg.url+' → uso el modelo de código (si abres con doble clic hace falta un servidor local).')); }
loadGLB(CFG.barco,m=>{ ship.children.slice().forEach(c=>ship.remove(c)); ship.add(m);
  const ghost=()=>{ const c=m.clone(true); c.traverse(o=>{ if(o.isMesh) o.material=ghostMat; }); return c; };
  dutch.clear(); dutch.add(ghost());
  ISL.forEach(s=>(s.wrecks||[]).forEach(w=>{ w.clear(); w.add(m.clone(true)); })); });
ISL.forEach(s=>{ const c=(CFG.islas||{})[s.t];
  loadGLB(c,m=>{ s.g.children.slice().forEach(ch=>{ if(!ch.isLight&&!ch.userData.keep&&ch!==s.beam) s.g.remove(ch); }); s.g.add(m);
    if(c.lampY!==undefined){ if(s.beam) s.beam.position.y=c.lampY; if(s.light&&s.t!=='tesoro') s.light.position.y=c.lampY+(s.t==='volcan'?4:0); } }); });
if(CFG.aguaTextura) new THREE.TextureLoader().load(CFG.aguaTextura,tx=>{ tx.wrapS=tx.wrapT=THREE.RepeatWrapping; const r=CFG.aguaRepeticion||60; tx.repeat.set(r,r);
  ocean.material.map=tx; ocean.material.needsUpdate=true; },undefined,()=>console.warn('No se encontró '+CFG.aguaTextura+' → agua sin textura'));

/* Mar como modelo 3D (opcional): se repite en mosaico y se desplaza al avanzar */
const seaTiles=[]; let seaS=300, seaV=1;
loadGLB(CFG.mar,m=>{ seaS=CFG.mar.size||300; seaV=CFG.mar.velocidad||1; ocean.visible=false;
  const n=CFG.mar.repetir===false?1:3;
  for(let a=0;a<n;a++) for(let b=0;b<n;b++){ const g=(a+b===0)?m:m.clone(true); g.userData.ix=a-(n-1)/2; g.userData.iz=b-(n-1)/2; scene.add(g); seaTiles.push(g); } });

/* Cielo por escenas: día → atardecer → noche → tormenta → amanecer */
const K = [
  {p:0,   sky:0x7ec8e3, sea:0x0e5a78, sun:1.5, hemi:.9, star:0, fog:260},
  {p:.28, sky:0xff8a3d, sea:0x6a3a3a, sun:1.1, hemi:.6, star:0, fog:220},
  {p:.5,  sky:0x070b1a, sea:0x07213a, sun:.15,hemi:.25,star:1, fog:200},
  {p:.72, sky:0x1b222d, sea:0x13222e, sun:.1, hemi:.35,star:.2,fog:90},
  {p:1,   sky:0xf2b27a, sea:0x2a6a7c, sun:1.2, hemi:.7, star:0, fog:240}
];
const c1=new THREE.Color(), c2=new THREE.Color();
function mixK(p){
  let i=0; while(i<K.length-2 && p>K[i+1].p) i++;
  const a=K[i], b=K[i+1], t=Math.min(1,Math.max(0,(p-a.p)/(b.p-a.p))), e=t*t*(3-2*t);
  c1.set(a.sky).lerp(c2.set(b.sky),e); const sky=c1.clone();
  c1.set(a.sea).lerp(c2.set(b.sea),e); const sea=c1.clone();
  const L=(x,y)=>x+(y-x)*e; return {sky,sea,sun:L(a.sun,b.sun),hemi:L(a.hemi,b.hemi),star:L(a.star,b.star),fog:L(a.fog,b.fog)};
}

/* Scroll */
let target=0, prog=0;
const onScroll=()=>{ target = scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight); };
addEventListener('scroll',onScroll); onScroll();
const resize=()=>{ renderer.setSize(innerWidth,innerHeight,false); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); };
addEventListener('resize',resize); resize();

/* Bucle */
const flash=$('#flash'); let nextBolt=0, boltT=0;
const clock=new THREE.Clock();
function frame(){
  const t=clock.getElapsedTime(); prog += (target-prog)*.05;
  const k=mixK(prog);
  scene.background=k.sky; scene.fog.color.copy(k.sky); scene.fog.far=k.fog;
  ocean.material.color.copy(k.sea); sun.intensity=k.sun; hemi.intensity=k.hemi; stars.material.opacity=k.star;
  lantern.intensity = THREE.MathUtils.clamp(1.6 - k.sun*1.2, 0, 1.6);
  sun.position.set(-40, 50-prog*45, 30);

  // olas (el avance del barco = fase de olas desplazándose)
  const pos=oceanGeo.attributes.position.array, tt=t*.8, travel=prog*260, amp=1+Math.max(0,1-Math.abs(prog-.72)*5)*1.8;
  if(ocean.visible) for(let i=0;i<pos.length;i+=3){ pos[i+1]=wave(base[i]+travel,base[i+2],tt)*amp; }
  if(ocean.visible){ oceanGeo.attributes.position.needsUpdate=true; oceanGeo.computeVertexNormals(); }

  if(seaTiles.length){ const sh=seaTiles.length>1?-((travel*seaV)%seaS):0;
    seaTiles.forEach(g=>g.position.set(sh+g.userData.ix*seaS,Math.sin(t*.8)*.25,g.userData.iz*seaS)); }
  // barco flotando
  const h=wave(travel,0,tt)*amp, hF=wave(travel+4,0,tt)*amp, hB=wave(travel-4,0,tt)*amp, hS=wave(travel,3,tt)*amp;
  ship.position.y=h*.9-.3; ship.rotation.z=Math.atan2(hF-hB,8)*.9; ship.rotation.x=Math.atan2(hS-h,3)*.5+Math.sin(t*.9)*.02;

  // velas y bandera ondulando
  sails.forEach((m,i)=>{ const p=m.geometry.attributes.position, o=m.geometry.userData.o;
    for(let j=0;j<p.count;j++){ const x=o[j*3],y=o[j*3+1]; p.setZ(j, Math.sin(Math.PI*(x/ (m.geometry.parameters.width)+.5))*.9*(.6+.4*Math.sin(t+i)) + Math.sin(y*2+t*2+i)*.06); }
    p.needsUpdate=true; m.geometry.computeVertexNormals(); });
  const fp=flagG.attributes.position, fo=flagG.userData.o;
  for(let j=0;j<fp.count;j++) fp.setZ(j, Math.sin(fo[j*3]*4-t*6)*.12*(fo[j*3]+.8));
  fp.needsUpdate=true;

  // cámara orbital cinematográfica
  const a=.9+prog*3.9, r=26-Math.sin(prog*Math.PI)*5, hh=6+Math.sin(prog*6.28)*3;
  camera.position.set(Math.cos(a)*r, hh+ship.position.y*.5, Math.sin(a)*r);
  camera.lookAt(0,5+ship.position.y,0);
  updateWorld(prog,t,k);

  // relámpagos en la tormenta
  if(prog>.6&&prog<.85&&t>nextBolt){ boltT=t; nextBolt=t+2+Math.random()*4; }
  const f=Math.max(0,1-(t-boltT)*5); flash.style.opacity = (prog>.6&&prog<.85) ? f*(.5+Math.sin(t*60)*.2) : 0;

  const storm=Math.max(0,1-Math.abs(prog-.72)*5);
  scene.fog.near=40-storm*32; rain.material.opacity=storm*.7;
  if(storm>0){ const r=rg.attributes.position.array; for(let i=0;i<RN;i++){ r[i*3+1]-=.9; r[i*3]-=.12; if(r[i*3+1]<0) r[i*3+1]=40; } rg.attributes.position.needsUpdate=true; }
  rain.position.set(camera.position.x*.5,0,camera.position.z*.5);
  ghostMat.opacity=Math.min(.55,storm*.8); dLight.intensity=storm*2.5; dutch.visible=storm>.02;
  dutch.position.y=wave(travel+95,40,tt)*amp*.9-.3; dutch.rotation.z=Math.sin(t*.7)*.05;

  // HUD
  $('#pbar').style.height=(prog*100)+'%';
  $('#needle').style.transform=`rotate(${prog*540+Math.sin(t)*4}deg)`;
  $('#lat').textContent=(18-prog*6).toFixed(0)+'°N';
  renderer.render(scene,camera); requestAnimationFrame(frame);
}
frame();

/* Reveal + contadores */
const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in');
  e.target.querySelectorAll('[data-n]').forEach(n=>{ const T=+n.dataset.n; let c=0; const id=setInterval(()=>{ c+=Math.ceil(T/40); if(c>=T){c=T;clearInterval(id);} n.textContent=c; },35); }); io.unobserve(e.target);} }),{threshold:.25});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* Formulario */
$('#crew').addEventListener('submit',e=>{ e.preventDefault(); $('#msg').textContent='⚓ ¡Bienvenido a bordo, '+e.target[0].value+'! Tu nombre ya está en el libro.'; e.target.reset(); });

/* Música (pon tu archivo en audio/piratas-del-caribe.mp3; si no existe suena un ambiente de mar) */
const bso=$('#bso'), sbtn=$('#sound'); let muted=false, started=false, ac=null;
if(CFG.musica) bso.src=CFG.musica;
if(CFG.iconoSonido){ const im=new Image(); im.alt='Sonido'; im.onload=()=>{ sbtn.innerHTML=''; sbtn.appendChild(im); sbtn.classList.add('img'); apply(); }; im.src=CFG.iconoSonido; }
try{ muted=localStorage.getItem('muted')==='1'; }catch(e){}
function ambient(){
  ac=new (window.AudioContext||window.webkitAudioContext)();
  const b=ac.createBuffer(1,ac.sampleRate*4,ac.sampleRate), d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  const s=ac.createBufferSource(); s.buffer=b; s.loop=true;
  const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=500;
  const g=ac.createGain(); g.gain.value=.15; const o=ac.createOscillator(); o.frequency.value=.12; const og=ac.createGain(); og.gain.value=.1;
  o.connect(og); og.connect(g.gain); s.connect(f); f.connect(g); g.connect(ac.destination); s.start(); o.start(); apply();
}
function apply(){ bso.muted=muted; if(ac) muted?ac.suspend():ac.resume(); if(!sbtn.classList.contains('img')) sbtn.textContent=muted?'🔇':'🔊'; sbtn.classList.toggle('off',muted); }
function startAudio(){ if(started) return; started=true; bso.volume=(CFG.volumen!==undefined?CFG.volumen:.5); bso.muted=muted; bso.play().catch(()=>ambient()); apply(); }
sbtn.addEventListener('click',()=>{ muted=!muted; try{localStorage.setItem('muted',muted?'1':'0')}catch(e){} if(!started) startAudio(); apply(); });
apply();

/* Imágenes: images/<clave>.jpg o subida propia (se guarda en el navegador) */
document.querySelectorAll('.slot').forEach(s=>{
  const k=s.dataset.key; let saved=null; try{saved=localStorage.getItem('img_'+k)}catch(e){}
  const show=list=>{ const u=list.shift(); if(!u) return; const im=new Image(); im.onload=()=>{ s.style.backgroundImage='url("'+u+'")'; s.classList.add('has'); }; im.onerror=()=>show(list); im.src=u; };
  show(saved?[saved]:[(window.IMAGENES||{})[k],'images/'+k+'.jpg','images/'+k+'.png','images/'+k+'.webp'].filter(Boolean));
  s.addEventListener('contextmenu',e=>{ e.preventDefault(); try{localStorage.removeItem('img_'+k)}catch(x){} location.reload(); });
  s.addEventListener('click',()=>{ const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*';
    inp.onchange=()=>{ const f=inp.files[0]; if(!f) return; const fr=new FileReader();
      fr.onload=()=>{ const im=new Image(); im.onload=()=>{ const sc=Math.min(1,900/im.width), c=document.createElement('canvas'); c.width=im.width*sc; c.height=im.height*sc;
        c.getContext('2d').drawImage(im,0,0,c.width,c.height); const u=c.toDataURL('image/jpeg',.82); try{localStorage.setItem('img_'+k,u)}catch(e){} show([u]); }; im.src=fr.result; };
      fr.readAsDataURL(f); };
    inp.click(); });
});

/* Numeración automática de capítulos */
const rom=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI'];
document.querySelectorAll('.panel .eyebrow').forEach((e,i)=>e.textContent='Capítulo '+rom[i]);

/* Test: ¿qué pirata eres? */
(()=>{ const Q=[['¿Qué haces ante un problema?',['Improviso algo y salgo corriendo','Planifico cada movimiento','Me enfrento a él con valentía','Busco la solución más justa']],
  ['¿Cuál es tu mayor tesoro?',['La libertad (y un buen ron)','El poder','La aventura','Mi familia']],
  ['¿Dónde te colocas a bordo?',['Al timón, claro','En el camarote del capitán','En cubierta, espada en mano','En la fragua del barco']],
  ['¿Cómo te describen tus amigos?',['Impredecible','Calculador','Valiente','Leal']]];
  const R=[['Jack Sparrow','Ingenioso, imprevisible y con una suerte increíble: siempre sales airoso.'],['Hector Barbossa','Astuto y estratega: siempre vas un paso por delante.'],['Elizabeth Swann','Valiente y decidida: naciste para mandar en alta mar.'],['Will Turner','Leal y noble: tu palabra vale más que el oro.']];
  const box=$('#quiz'); let i=0, sc=[0,0,0,0];
  function show(){ if(i>=Q.length){ const m=sc.indexOf(Math.max(...sc)); box.innerHTML='<p class="qn">Resultado</p><h3>Eres '+R[m][0]+'</h3><p>'+R[m][1]+'</p><br><button class="btn" id="qr" type="button">Repetir</button>'; $('#qr').onclick=()=>{i=0;sc=[0,0,0,0];show();}; return; }
    box.innerHTML='<p class="qn">Pregunta '+(i+1)+' de '+Q.length+'</p><h3>'+Q[i][0]+'</h3>'+Q[i][1].map((o,k)=>'<button class="qopt" type="button" data-k="'+k+'">'+o+'</button>').join('');
    box.querySelectorAll('.qopt').forEach(b=>b.onclick=()=>{ sc[+b.dataset.k]++; i++; show(); }); }
  show(); })();

/* Tesoro: lluvia de doblones */
$('#chest').addEventListener('click',()=>{ $('#loot').textContent='💰 ¡Doblones de oro! Ya eres parte de la leyenda.';
  for(let i=0;i<45;i++){ const c=document.createElement('i'); c.className='coin'; c.style.left=Math.random()*100+'vw'; c.style.animationDuration=(1.5+Math.random()*2)+'s'; c.style.animationDelay=Math.random()*.8+'s'; document.body.appendChild(c); setTimeout(()=>c.remove(),4500); } });

/* Loader */
let l=0; const li=setInterval(()=>{ l+=12+Math.random()*18; $('#lbar').style.width=Math.min(l,100)+'%'; if(l>=100){ clearInterval(li); $('#enter').hidden=false; } },180);
$('#enter').addEventListener('click',()=>{ startAudio(); $('#loader').classList.add('off'); });
})();
