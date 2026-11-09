import * as THREE from './three.module.js';

const canvas = document.querySelector('#game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#122c25');
scene.fog = new THREE.FogExp2('#122c25', .011);
const camera = new THREE.PerspectiveCamera(43, 1, .1, 180);
camera.position.set(0, 5.2, 13.8);
camera.lookAt(0, 2.3, -17);
const clock = new THREE.Clock();
const mat = (color, roughness=.8, extra={}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const grassMats = [mat('#1b6943'), mat('#1b603e'), mat('#205f3e'), mat('#18573a')];
const white = mat('#e8e9dc', .58), dark = mat('#15201c'), red = mat('#d7333b', .46), keeperBlue = mat('#27a6bc', .52), lime = mat('#d8ff52', .5);
const sphereGeo = new THREE.SphereGeometry(1, 22, 16);
const cylinderGeo = (r1,r2,h,segments=12) => new THREE.CylinderGeometry(r1,r2,h,segments);
function addMesh(geo, material, parent=scene, x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function box(parent,x,y,z,w,h,d,material){return addMesh(new THREE.BoxGeometry(w,h,d),material,parent,x,y,z)}
function ballPart(parent,x,y,z,r,material){return addMesh(sphereGeo,material,parent,x,y,z).scale.setScalar(r)}

// Stadium lighting and the striped pitch.
scene.add(new THREE.HemisphereLight('#b8dbd2','#193b2d',2.05));
const keyLight = new THREE.DirectionalLight('#fff0ce',3.3); keyLight.position.set(-8,18,8); keyLight.castShadow=true; keyLight.shadow.mapSize.set(2048,2048); keyLight.shadow.camera.left=-30; keyLight.shadow.camera.right=30; keyLight.shadow.camera.top=30; keyLight.shadow.camera.bottom=-40; keyLight.shadow.bias=-.0002; scene.add(keyLight);
for(const [x,z] of [[-18,-20],[18,-20],[-14,12],[14,12]]){const lamp=new THREE.PointLight('#d8ffec',170,38,1.8);lamp.position.set(x,14,z);scene.add(lamp)}
const field=addMesh(new THREE.PlaneGeometry(90,110),grassMats[0],scene,0,-.08,-25);field.rotation.x=-Math.PI/2;field.receiveShadow=true;
for(let i=0;i<11;i++){const stripe=addMesh(new THREE.PlaneGeometry(90,10),grassMats[i%2?1:0],scene,0,-.07,-70+i*9);stripe.rotation.x=-Math.PI/2;stripe.receiveShadow=true}
const lineMat=mat('#d7e3c9',.9,{transparent:true,opacity:.63,emissive:'#69826b',emissiveIntensity:.13});
function groundLine(x,z,w,d){const o=addMesh(new THREE.PlaneGeometry(w,d),lineMat,scene,x,-.025,z);o.rotation.x=-Math.PI/2;return o}
// Penalty area, spot and pitch markings.
groundLine(0,-25,54,.09);groundLine(-27,-36, .09,22);groundLine(27,-36,.09,22);groundLine(0,-47,54,.09);groundLine(0,-37,22,.09);groundLine(-11,-31,.09,12);groundLine(11,-31,.09,12);groundLine(0,-40,.09,7);
const spot=addMesh(new THREE.CircleGeometry(.17,24),lineMat,scene,0,-.015,-33);spot.rotation.x=-Math.PI/2;
const arc=addMesh(new THREE.RingGeometry(5.8,5.9,64,1,Math.PI*.13,Math.PI*.74),lineMat,scene,0,-.02,-33);arc.rotation.x=-Math.PI/2;
// Endline advertisement boards and abstract crowd tiers.
const boardMat=mat('#10251d',.5,{emissive:'#163b2b',emissiveIntensity:.65});
for(const side of [-1,1]){const board=box(scene,side*13,.72,-25, .16,1.35,50,boardMat);board.rotation.y=side*.035;
  for(let tier=0;tier<3;tier++){const stand=box(scene,side*25,3.8+tier*2.35,-25,13,4.4,57,mat(tier===1?'#253c34':'#182e27'));stand.position.x=side*25;stand.position.z=-25-tier*.9;}
}
function crowd(){const colors=['#d9b979','#c94b42','#d8ddd1','#378f78','#4566aa','#d6d0bc','#d5d848'];const groups=colors.map(()=>[]);for(let row=0;row<8;row++){for(let i=0;i<105;i++){const x=-24+i*.46+(Math.random()-.5)*.24,z=-47+row*2.1+(Math.random()-.5)*.6,y=4+row*.43+Math.random()*.55;groups[(Math.random()*groups.length)|0].push([x,y,z]);}}const geo=new THREE.BoxGeometry(.22,.35,.18),dummy=new THREE.Object3D();groups.forEach((people,index)=>{const instances=new THREE.InstancedMesh(geo,mat(colors[index],.95),people.length);people.forEach(([x,y,z],i)=>{dummy.position.set(x,y,z);dummy.rotation.y=(Math.random()-.5)*.24;dummy.scale.set(1,.8+Math.random()*.45,1);dummy.updateMatrix();instances.setMatrixAt(i,dummy.matrix)});instances.instanceMatrix.needsUpdate=true;instances.castShadow=false;instances.receiveShadow=false;scene.add(instances)})}
crowd();
const goalZ=-25.3, goalW=8.2, goalH=3.15;
const postMat=mat('#f3f1e7',.3,{metalness:.18});
// Goal frame, net grid and crossbar details.
box(scene,-goalW/2,goalH/2,goalZ,.16,goalH,.18,postMat);box(scene,goalW/2,goalH/2,goalZ,.16,goalH,.18,postMat);box(scene,0,goalH,goalZ,goalW+.16,.17,.18,postMat);
const netMat=new THREE.LineBasicMaterial({color:'#e4e9d8',transparent:true,opacity:.29});
for(let x=-goalW/2;x<=goalW/2+.01;x+=.42){const a=new THREE.Vector3(x,0,goalZ+.02),b=new THREE.Vector3(x,goalH,goalZ+.02);scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),netMat));}
for(let y=.15;y<goalH;y+=.42){const a=new THREE.Vector3(-goalW/2,y,goalZ+.02),b=new THREE.Vector3(goalW/2,y,goalZ+.02);scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),netMat));}
// Net depth to rear stanchions.
for(const side of [-1,1]){const strut=addMesh(cylinderGeo(.035,.035,3.4),postMat,scene,side*goalW/2,1.4,goalZ-1.6);strut.rotation.x=Math.PI/2;}
// Keeper assembled as a small articulated figure.
const keeper=new THREE.Group();keeper.position.set(.2,0,goalZ+.45);scene.add(keeper);
const torso=addMesh(new THREE.CapsuleGeometry(.34,.8,5,10),keeperBlue,keeper,0,1.38,0);torso.scale.set(1,.95,.58);
const head=ballPart(keeper,0,2.13,0,.24,mat('#bd886c'));
const shorts=box(keeper,0,.87,0,.58,.34,.43,dark);
const keeperLimbs=[];
function makeLimb(parent,a,b,radius,material){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),mid=va.clone().add(vb).multiplyScalar(.5),v=vb.clone().sub(va);const limb=addMesh(cylinderGeo(radius*.75,radius,v.length(),10),material,parent,mid.x,mid.y,mid.z);limb.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return limb}
const armL=makeLimb(keeper,[-.27,1.67,0],[-.78,1.52,0],.14,keeperBlue),armR=makeLimb(keeper,[.27,1.67,0],[.78,1.52,0],.14,keeperBlue);
const gloveL=ballPart(keeper,-.82,1.52,0,.17,mat('#f0d95b')),gloveR=ballPart(keeper,.82,1.52,0,.17,mat('#f0d95b'));
const legL=makeLimb(keeper,[-.16,.83,0],[-.3,.12,.02],.16,dark),legR=makeLimb(keeper,[.16,.83,0],[.3,.12,.02],.16,dark);
for(const footX of [-.3,.3]){const foot=box(keeper,footX,.08,-.13,.37,.16,.48,mat('#f2f0e5'));}
keeper.userData.parts={torso,head,armL,armR,gloveL,gloveR,legL,legR};
// Ball with a clean pentagon pattern generated as a canvas texture.
function makeBallTexture(){const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#eeeae0';ctx.fillRect(0,0,512,256);ctx.fillStyle='#171d1b';const polygons=[[80,70],[256,55],[425,80],[150,202],[350,200]];for(const [x,y] of polygons){ctx.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;ctx.lineTo(x+Math.cos(a)*25,y+Math.sin(a)*25)}ctx.closePath();ctx.fill()}ctx.strokeStyle='#363a35';ctx.lineWidth=5;for(let i=0;i<5;i++){const x=i*102;ctx.beginPath();ctx.moveTo(x,0);ctx.quadraticCurveTo(x+50,128,x,256);ctx.stroke()}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const ballMat=new THREE.MeshStandardMaterial({map:makeBallTexture(),roughness:.48});
const ball=addMesh(sphereGeo,ballMat,scene,0,.24,7.2);ball.scale.setScalar(.235);ball.castShadow=true;
const shadow=addMesh(new THREE.CircleGeometry(.31,24),new THREE.MeshBasicMaterial({color:'#07150d',transparent:true,opacity:.32,depthWrite:false}),scene,0,.012,7.2);shadow.rotation.x=-Math.PI/2;
// Shooter silhouette, just behind the ball.
const player=new THREE.Group();player.position.set(0,0,9.3);scene.add(player);
const kit=mat('#e2e8de',.65), skin=mat('#b98263'), shoe=mat('#101714');
ballPart(player,0,2.17,0,.28,skin);const jersey=addMesh(new THREE.CapsuleGeometry(.36,.79,5,10),kit,player,0,1.43,0);jersey.scale.set(1,.93,.62);
box(player,0,.85,0,.59,.35,.45,dark);
makeLimb(player,[-.29,1.66,0],[-.58,1.25,0],.13,kit);makeLimb(player,[.29,1.66,0],[.59,1.25,0],.13,kit);
const shootLeg=makeLimb(player,[-.15,.82,0],[-.39,.14,-.12],.16,dark), plantLeg=makeLimb(player,[.15,.82,0],[.24,.12,.04],.16,dark);
box(player,-.4,.11,-.23,.37,.17,.5,shoe);box(player,.24,.1,-.03,.38,.16,.48,shoe);
// Target reticle projected from the selected position on the goal plane.
const targetRing=addMesh(new THREE.RingGeometry(.19,.235,32),lime,scene,0,1.5,goalZ-.15);targetRing.rotation.y=0;
const targetDot=addMesh(new THREE.SphereGeometry(.055,12,8),lime,scene,0,1.5,goalZ-.13);const targetGlow=new THREE.PointLight('#d8ff52',2.5,3);targetGlow.position.copy(targetRing.position);scene.add(targetGlow);
const aim={x:0,y:1.55};let power=0,charging=false,shot=null,keeperState='ready',keeperTimer=0,score=0,attempt=0,awayScore=0,phase='ready',roundTimer=0,toastTimer=0,matchFinished=false;
const ui={cross:document.querySelector('#crosshair'),hint:document.querySelector('#aimHint'),powerFill:document.querySelector('#powerFill'),powerText:document.querySelector('#powerText'),actionText:document.querySelector('#actionText'),actionKey:document.querySelector('#actionKey'),scoreHome:document.querySelector('#scoreHome'),scoreAway:document.querySelector('#scoreAway'),kick:document.querySelector('#kickNumber'),clock:document.querySelector('#matchClock'),toast:document.querySelector('#toast'),toastText:document.querySelector('#toastText'),phase:document.querySelector('#phaseLabel'),result:document.querySelector('#resultScreen')};
function showToast(text){ui.toastText.textContent=text;ui.toast.classList.remove('show');void ui.toast.offsetWidth;ui.toast.classList.add('show');toastTimer=1.5}
function screenAim(){const p=new THREE.Vector3(aim.x,aim.y,goalZ).project(camera);ui.cross.style.left=`${(p.x*.5+.5)*innerWidth}px`;ui.cross.style.top=`${(-p.y*.5+.5)*innerHeight}px`;ui.hint.style.left=ui.cross.style.left;ui.hint.style.top=`calc(${(-p.y*.5+.5)*100}% + 28px)`}
function updateAim(dx,dy){if(phase!=='ready'||matchFinished)return;aim.x=THREE.MathUtils.clamp(aim.x+dx,-3.65,3.65);aim.y=THREE.MathUtils.clamp(aim.y+dy,.48,2.78);targetRing.position.set(aim.x,aim.y,goalZ-.15);targetDot.position.set(aim.x,aim.y,goalZ-.13);targetGlow.position.set(aim.x,aim.y,goalZ-.1);screenAim()}
function beginCharge(){if(phase!=='ready'||matchFinished||charging)return;charging=true;power=0;ui.powerText.textContent='CHARGING';ui.actionText.innerHTML='RELEASE TO SHOOT <b>·</b> PICK YOUR SPOT';ui.actionKey.textContent='RELEASE';ui.hint.style.opacity='.45'}
function shoot(){if(!charging||phase!=='ready')return;charging=false;phase='flight';keeperState='waiting';keeperTimer=.38;ui.phase.textContent='SHOT INCOMING';ui.powerText.textContent='SHOT AWAY';ui.actionText.textContent='';ui.actionKey.style.display='none';ui.hint.style.opacity='0';const p=.28+power*.72;const start=ball.position.clone();const target=new THREE.Vector3(aim.x,aim.y,goalZ-.35);const distance=start.distanceTo(target);const duration=THREE.MathUtils.lerp(1.05,.72,p);shot={start,target,elapsed:0,duration,power:p,curve:THREE.MathUtils.clamp((target.x-start.x)*.045,-.32,.32),spin:0};player.userData.kick=0;}
function resetKick(){phase='ready';opponentDone=false;power=0;charging=false;shot=null;keeperState='ready';keeper.position.set(.2,0,goalZ+.45);keeper.rotation.set(0,0,0);ball.position.set(0,.24,7.2);ball.rotation.set(0,0,0);targetRing.visible=true;targetDot.visible=true;ui.powerFill.style.width='4%';ui.powerText.textContent='READY';ui.actionKey.style.display='';ui.actionKey.textContent='SPACE';ui.actionText.innerHTML='HOLD TO CHARGE <b>·</b> RELEASE TO SHOOT';ui.phase.textContent='YOUR KICK';ui.hint.style.opacity='1';screenAim();}
function endMatch(){matchFinished=true;ui.result.classList.add('open');ui.result.setAttribute('aria-hidden','false');const total=score-awayScore;document.querySelector('#resultTitle').textContent=total>0?'CHAMPIONS!':total===0?'ALL SQUARE.':'NICE TRY.';document.querySelector('#resultSummary').textContent=total>0?'A perfect finish. Seoul belongs to you.':total===0?'Dead even. Ready for the rematch?':'The stadium is yours. One more?';document.querySelector('#finalScore').textContent=`${score} — ${awayScore}`}
function finishShot(outcome){if(phase!=='flight')return;phase='result';roundTimer=1.65;attempt++;if(outcome==='GOAL'){score++;ui.scoreHome.textContent=score;showToast('GOAL!')}else if(outcome==='SAVED'){showToast('SAVED!')}else{showToast(outcome==='WIDE'?'WIDE!':'OFF THE BAR!')}ui.kick.textContent=String(Math.min(attempt+1,5)).padStart(2,'0');ui.clock.innerHTML=`PENALTY ${String(Math.min(attempt+1,5)).padStart(2,'0')} <i>•</i> 5 KICKS`;ui.phase.textContent=outcome==='GOAL'?'GOAL!':outcome==='SAVED'?'SAVED':'NO GOAL';}
function restart(){score=0;attempt=0;awayScore=0;matchFinished=false;ui.scoreHome.textContent='0';ui.scoreAway.textContent='0';ui.kick.textContent='01';ui.clock.innerHTML='PENALTY 01 <i>•</i> 5 KICKS';ui.result.classList.remove('open');ui.result.setAttribute('aria-hidden','true');aim.x=0;aim.y=1.55;resetKick()}

let opponentDone=false;
function moveKeeper(dt){
  const p=keeper.userData.parts;
  if(keeperState==='waiting'&&keeperTimer<=0){
    const guess=THREE.MathUtils.clamp(aim.x+(Math.random()-.5)*2.3,-2.8,2.8);
    keeper.userData.diveX=guess;
    keeper.userData.diveY=aim.y>2.05?1:0;
    keeperState='dive';
    keeper.userData.save= Math.abs(aim.x-guess)<1.12 && aim.y<2.66 && aim.y>.38;
  }
  if(keeperState==='waiting')keeperTimer-=dt;
  if(keeperState==='dive'){
    const dest=keeper.userData.diveX;
    keeper.position.x=THREE.MathUtils.damp(keeper.position.x,dest,5,dt);
    keeper.position.y=THREE.MathUtils.damp(keeper.position.y,keeper.userData.diveY?.12:0,5,dt);
    const side=Math.sign(dest-.2)||1;
    keeper.rotation.z=THREE.MathUtils.damp(keeper.rotation.z,-side*.82,5,dt);
    p.armL.rotation.z=-side*.42;p.armR.rotation.z=-side*.42;
    p.legL.rotation.z=side*.24;p.legR.rotation.z=side*.24;
  }else if(keeperState==='ready'){
    keeper.position.x=THREE.MathUtils.damp(keeper.position.x,.2,3,dt);
    keeper.position.y=0;keeper.rotation.z=THREE.MathUtils.damp(keeper.rotation.z,0,4,dt);
    p.armL.rotation.z=THREE.MathUtils.damp(p.armL.rotation.z,0,4,dt);p.armR.rotation.z=THREE.MathUtils.damp(p.armR.rotation.z,0,4,dt);
    p.legL.rotation.z=THREE.MathUtils.damp(p.legL.rotation.z,0,4,dt);p.legR.rotation.z=THREE.MathUtils.damp(p.legR.rotation.z,0,4,dt);
  }
}
function onResize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?48:43;camera.updateProjectionMatrix();screenAim()}
window.addEventListener('resize',onResize);onResize();
function onKeyDown(e){if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();if(e.repeat)return;if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')updateAim(-.3,0);if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')updateAim(.3,0);if(e.key==='ArrowUp'||e.key.toLowerCase()==='w')updateAim(0,.22);if(e.key==='ArrowDown'||e.key.toLowerCase()==='s')updateAim(0,-.22);if(e.code==='Space')beginCharge()}
function onKeyUp(e){if(e.code==='Space')shoot()}
window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||phase!=='ready'||charging)return;aim.x=THREE.MathUtils.clamp((e.clientX/innerWidth-.5)*8.2,-3.65,3.65);aim.y=THREE.MathUtils.clamp(2.82-(e.clientY/innerHeight)*3.2,.48,2.78);targetRing.position.set(aim.x,aim.y,goalZ-.15);targetDot.position.set(aim.x,aim.y,goalZ-.13);targetGlow.position.copy(targetRing.position);screenAim()});
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&phase==='ready')beginCharge()});window.addEventListener('pointerup',e=>{if(e.pointerType==='mouse')shoot()});
document.querySelectorAll('[data-aim]').forEach(button=>{const dir=button.dataset.aim;const step=()=>{if(dir==='left')updateAim(-.28,0);if(dir==='right')updateAim(.28,0);if(dir==='up')updateAim(0,.2);if(dir==='down')updateAim(0,-.2)};button.addEventListener('pointerdown',e=>{e.preventDefault();step();button.setPointerCapture?.(e.pointerId)});});
const shootButton=document.querySelector('#shootButton');shootButton.addEventListener('pointerdown',e=>{e.preventDefault();beginCharge()});shootButton.addEventListener('pointerup',e=>{e.preventDefault();shoot()});shootButton.addEventListener('pointercancel',shoot);shootButton.addEventListener('contextmenu',e=>e.preventDefault());
document.querySelector('#rematchButton').addEventListener('click',restart);
let audio=null,soundOn=false;
document.querySelector('#soundButton').addEventListener('click',()=>{soundOn=!soundOn;document.querySelector('#soundIcon').textContent=soundOn?'♫':'♩';if(soundOn){audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume()}});
function sound(frequency=420,duration=.12,type='sine'){if(!soundOn||!audio)return;const osc=audio.createOscillator(),gain=audio.createGain();osc.type=type;osc.frequency.value=frequency;gain.gain.setValueAtTime(.07,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration)}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.035),time=clock.elapsedTime;
  moveKeeper(dt);
  if(charging){power=Math.min(1,power+dt*.43);ui.powerFill.style.width=`${4+power*96}%`;ui.powerText.textContent=`${Math.round(power*100)}%`}
  // Subtle stadium movement, goalkeeper idle, player anticipation.
  if(phase==='ready'){keeper.position.x=.2+Math.sin(time*1.35)*.12;keeper.position.y=Math.sin(time*2.2)*.025;ball.rotation.y+=dt*.15;player.rotation.y=Math.sin(time*.7)*.018;}
  if(phase==='flight'&&shot){shot.elapsed+=dt;const t=Math.min(1,shot.elapsed/shot.duration),ease=t*t*(3-2*t);const pos=shot.start.clone().lerp(shot.target,ease);pos.y+=Math.sin(t*Math.PI)*(.24+shot.power*.48);pos.x+=Math.sin(t*Math.PI)*shot.curve;ball.position.copy(pos);ball.rotation.x+=dt*8;ball.rotation.z+=dt*4;shadow.position.set(pos.x,.012,pos.z);const shadowScale=THREE.MathUtils.clamp(1.15-pos.y*.07,.62,1);shadow.scale.setScalar(shadowScale);ball.scale.setScalar(.235);player.userData.kick=Math.min(1,(player.userData.kick||0)+dt*5);shootLeg.rotation.z=-Math.sin(player.userData.kick*Math.PI)*.82;
    if(t>.36&&keeperState==='waiting'&&keeperTimer<=0){keeperState='dive';const guess=THREE.MathUtils.clamp(aim.x+(Math.random()-.5)*2.3,-2.8,2.8);keeper.userData.diveX=guess;keeper.userData.diveY=aim.y>2.05?1:0;keeper.userData.save=Math.abs(aim.x-guess)<1.12&&aim.y<2.66&&aim.y>.38}
    if(t>=1){ball.position.copy(shot.target);let outcome;if(Math.abs(aim.x)>goalW/2-.28||aim.y>goalH-.12||aim.y<.2)outcome=aim.y>goalH-.12?'BAR':'WIDE';else if(keeper.userData.save)outcome='SAVED';else outcome='GOAL';if(outcome==='SAVED'){ball.position.x=THREE.MathUtils.clamp(keeper.position.x,-3.5,3.5);ball.position.y=1.5;ball.position.z=goalZ+.6;keeper.position.x=ball.position.x;keeper.rotation.z=Math.sign(keeper.position.x-.2)*-.75;}else if(outcome==='GOAL'){ball.position.z=goalZ-1.6;ball.position.y=Math.max(.35,aim.y);keeper.position.x=THREE.MathUtils.damp(keeper.position.x,aim.x,4,dt);}else{ball.position.z=goalZ-1;ball.position.y=aim.y>goalH?goalH+.4:.15;}finishShot(outcome);sound(outcome==='GOAL'?650:outcome==='SAVED'?180:260,.18,outcome==='GOAL'?'triangle':'sine');}}
  if(phase==='result'){roundTimer-=dt;if(roundTimer<.72&&!opponentDone){opponentDone=true;if(Math.random()<.57){awayScore++;ui.scoreAway.textContent=awayScore;showToast('WORLD XI SCORES')}else showToast('SAVED!');}if(roundTimer<=0){if(attempt>=5){endMatch()}else{aim.x=0;aim.y=1.55;resetKick();}}}
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui.toast.classList.remove('show')}
  const goalView= new THREE.Vector3(0,1.4,-20).project(camera);targetRing.visible=phase==='ready';targetDot.visible=phase==='ready';
  // The target stays gently alive while waiting for the shot.
  if(phase==='ready'){targetRing.scale.setScalar(1+Math.sin(time*2.4)*.08);targetGlow.intensity=2.2+Math.sin(time*3)*.35;screenAim()}
  renderer.render(scene,camera);
}
animate();

