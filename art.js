import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import { makeDetail } from './art-detail.js?v=reference-004';

// All decoration is visual only: Foundation 001 owns the navigation cells.
export function buildArt(scene, renderer, world, trees, rocks, nibbitCell) {
  let seed = 1357;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const mat = color => new THREE.MeshStandardMaterial({color, roughness: 1, flatShading: true});
  const palette = {bark: mat('#79513b'), leaf: mat('#527643'), light: mat('#80964c'), dark: mat('#365d42'), stone: mat('#889087'), moss: mat('#657b48'), fur: mat('#aa7951'), cream: mat('#ead4a3'), pink: mat('#c38b79'), ink: mat('#282c2c')};
  const detail=makeDetail(random);
  Object.assign(palette,{fur:detail.fur,cream:detail.cream,bark:detail.bark,stone:detail.stone});
  palette.pink=mat('#96735f');palette.ink=new THREE.MeshStandardMaterial({color:'#160f0c',roughness:.22});
  const sphere=detail.soft;
  function blob(parent, material, position, scale, geometry = sphere) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position); mesh.scale.set(...scale);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  scene.background = new THREE.Color('#aebfc0');
  scene.fog = new THREE.Fog('#aebfc0', 27, 58);
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  scene.add(new THREE.HemisphereLight('#e0eddf', '#493f30', 1.45));
  const sun = new THREE.DirectionalLight('#ffdfab', 2.8);
  sun.position.set(-10, 18, 8); sun.castShadow = true;
  Object.assign(sun.shadow.camera, {left:-15,right:15,top:15,bottom:-15,near:1,far:45});
  sun.shadow.mapSize.set(2048,2048); sun.shadow.normalBias=.035; sun.shadow.bias=-.0002;
  scene.add(sun);

  // A seeded painted texture keeps the walkable surface level and the grid invisible.
  const canvas = document.createElement('canvas'); canvas.width=canvas.height=1024;
  const ctx=canvas.getContext('2d'); ctx.fillStyle='#60783a';ctx.fillRect(0,0,1024,1024);
  for(let i=0;i<5000;i++) {
    const x=random()*1024,y=random()*1024,r=8+random()*70;
    ctx.fillStyle=['#7b9145','#4c6a36','#a1a85b','#657b3e'][i%4];ctx.globalAlpha=.10;
    ctx.beginPath();ctx.ellipse(x,y,r,r*.6,random()*6,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  const trail = z => 1.8*Math.sin(z*.39)+.6;
  for(let i=0;i<2600;i++) {
    const z=random()*20-10, x=trail(z)+(random()+random()+random()-1.5)*1.6;
    ctx.globalAlpha=.09;ctx.fillStyle=['#ab8859','#b2986a','#c6ab7a'][i%3];
    ctx.beginPath();ctx.ellipse((x+10)*51.2,(z+10)*51.2,12+random()*24,9+random()*18,0,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=.13;
  for(let i=0;i<24000;i++){ctx.fillStyle=i%2?'#edf0bc':'#425b38';ctx.fillRect(random()*1024,random()*1024,1+random()*3,1+random()*2);}
  // Leaf litter and inset chips give the path the broken, earthy surface of the reference.
  for(let i=0;i<4200;i++){
    const z=random()*20-10,x=random()*20-10,onPath=Math.abs(x-trail(z))<.95;
    ctx.globalAlpha=onPath?.30:.2;ctx.fillStyle=onPath?['#806443','#d4bc8c','#967b53'][i%3]:['#394b28','#b1a65e','#77844a'][i%3];
    const px=(x+10)*51.2,py=(z+10)*51.2,r=onPath?2+random()*5:1+random()*3;
    ctx.beginPath();ctx.moveTo(px-r,py);ctx.lineTo(px-r*.4,py-r*.7);ctx.lineTo(px+r,py-r*.4);ctx.lineTo(px+r*.7,py+r*.7);ctx.lineTo(px-r*.5,py+r);ctx.closePath();ctx.fill();
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({map:texture,roughness:1}));
  ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.name='ground';scene.add(ground);
  blob(scene,mat('#6f674b'),[0,-.48,0],[10,.47,10],new THREE.BoxGeometry(2,2,2));
  blob(scene,mat('#87935c'),[0,-.08,0],[10,.07,10],new THREE.BoxGeometry(2,2,2));

  const leafMaterial=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1,side:THREE.DoubleSide});
  const leafCount=6600,leaves=new THREE.InstancedMesh(detail.leaf,leafMaterial,leafCount);
  const transform=new THREE.Object3D(),color=new THREE.Color();let leafIndex=0;
  function branch(parent,start,end,radius){
    const from=new THREE.Vector3(...start),to=new THREE.Vector3(...end),delta=to.clone().sub(from);
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius*.55,radius,delta.length(),8),palette.bark);
    mesh.position.copy(from).add(to).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
    mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);
  }
  trees.forEach(([x,z],index)=>{
    const g=new THREE.Group();g.position.copy(world(x,z));scene.add(g);
    branch(g,[0,0,0],[.08,1.25,.03],.23);branch(g,[.08,1.25,.03],[-.07,2.3,0],.14);
    for(let i=0;i<6;i++){
      const angle=i*2.399;
      branch(g,[0,.16,0],[Math.sin(angle)*.43,.025,Math.cos(angle)*.43],.10);
      branch(g,[.04,.9+i*.14,0],[Math.cos(angle)*.92,2+i*.13,Math.sin(angle)*.8],.075);
    }
    // Thousands of small cupped leaves, clustered around irregular branch tips.
    for(let i=0;i<2200;i++){
      const cluster=i%11,angle=cluster*2.399+index,ring=cluster<8?.78:.26;
      const cy=2.25+(cluster%3)*.25,theta=random()*Math.PI*2,v=random()*2-1,r=Math.cbrt(random());
      const radial=Math.sqrt(1-v*v)*r;
      transform.position.set(g.position.x+Math.cos(angle)*ring+Math.cos(theta)*radial*.78,cy+v*r*.65,g.position.z+Math.sin(angle)*ring+Math.sin(theta)*radial*.74);
      transform.rotation.set(random()*2.5-.6,random()*Math.PI*2,random()*Math.PI*2);
      const size=.12+random()*.17;transform.scale.set(size*.8,size,size);transform.updateMatrix();
      leaves.setMatrixAt(leafIndex,transform.matrix);
      color.setHSL(.20+random()*.045,.43+random()*.2,.19+random()*.17+(transform.position.y-1.7)*.035);
      leaves.setColorAt(leafIndex++,color);
    }
  });
  leaves.castShadow=leaves.receiveShadow=true;scene.add(leaves);
  rocks.forEach(([x,z],i)=>{
    const g=new THREE.Group();g.position.copy(world(x,z));scene.add(g);
    const rock=blob(g,palette.stone,[0,.33,0],[.47,.44,.42],new THREE.IcosahedronGeometry(1,1));rock.rotation.set(.15,i*.8,.2);
    for(let j=0;j<18;j++){
      const angle=random()*6.28,r=random()*.34;
      blob(g,palette.moss,[Math.cos(angle)*r,.61-r*.3,Math.sin(angle)*r],[.07+random()*.06,.025,.06],new THREE.IcosahedronGeometry(1,0));
    }
    blob(g,palette.stone,[.30,.09,.22],[.14,.11,.16],new THREE.IcosahedronGeometry(1,0));
  });
  // Bent blades and proper petalled flowers, distributed in patches rather than a uniform lawn.
  const meadowMaterial=new THREE.MeshStandardMaterial({color:'#ffffff',side:THREE.DoubleSide,roughness:1});
  const grass=new THREE.InstancedMesh(detail.grass,meadowMaterial,3200);
  const petalGeometry=new THREE.BufferGeometry(),petalVertices=[];
  for(let p=0;p<5;p++){
    const angle=p*Math.PI*2/5,x=Math.cos(angle),z=Math.sin(angle),w=.022;
    petalVertices.push(0,0,0,x*.065-z*w,.015,z*.065+x*w,x*.085,0,z*.085);
    petalVertices.push(0,0,0,x*.085,0,z*.085,x*.065+z*w,.015,z*.065-x*w);
  }
  petalGeometry.setAttribute('position',new THREE.Float32BufferAttribute(petalVertices,3));petalGeometry.computeVertexNormals();
  const flowers=new THREE.InstancedMesh(petalGeometry,meadowMaterial,420),centers=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.018,0),mat('#d7a638'),420);
  const dummy=new THREE.Object3D();let gi=0,fi=0;
  while(gi<3200){
    const x=random()*19.7-9.85,z=random()*19.7-9.85;
    if(Math.abs(x-trail(z))<.9+random()*.5)continue;
    if(Math.sin(x*1.4)+Math.cos(z*1.8)<-.15&&random()<.94)continue;
    if([...trees,...rocks,nibbitCell,[9,16]].some(c=>world(...c).distanceTo(new THREE.Vector3(x,0,z))<.50))continue;
    dummy.position.set(x,.005,z);dummy.rotation.set(0,random()*6.28,0);const scale=.28+random()*.80;dummy.scale.setScalar(scale);dummy.updateMatrix();grass.setMatrixAt(gi,dummy.matrix);
    grass.setColorAt(gi++,color.setHSL(.19+random()*.05,.48,.22+random()*.16));
    if(fi<420&&random()<.14){
      dummy.position.y=.15*scale;dummy.scale.setScalar(.65+random()*.6);dummy.updateMatrix();flowers.setMatrixAt(fi,dummy.matrix);centers.setMatrixAt(fi,dummy.matrix);
      flowers.setColorAt(fi++,new THREE.Color(['#f0e8c5','#e5d9b4','#b9a6ca','#d8bc79'][Math.floor(random()*4)]));
    }
  }
  flowers.count=centers.count=fi;grass.receiveShadow=true;scene.add(grass,flowers,centers);
  // Flat gravel stays decorative and cannot create unexpected collision obstacles.
  const gravel=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),palette.stone,350);
  for(let i=0;i<350;i++){
    const z=random()*19.6-9.8,x=trail(z)+(random()-.5)*2;
    dummy.position.set(x,.01,z);dummy.rotation.set(0,random()*6.28,0);const r=.025+random()*.065;dummy.scale.set(r,.012+random()*.013,r*.7);dummy.updateMatrix();gravel.setMatrixAt(i,dummy.matrix);
  }
  gravel.receiveShadow=true;scene.add(gravel);

  const player=new THREE.Group();const coat=mat('#4c6540'), leather=mat('#674936'), skin=mat('#e7b889'), scarf=mat('#92764a');
  const torso=new THREE.Group();player.add(torso);
  const legs=[-1,1].map(side=>{
    const thigh=blob(player,coat,[0,0,0],[.09,.1,.09]);
    const shin=blob(player,leather,[0,0,0],[.085,.1,.085]);
    const boot=blob(player,leather,[side*.14,.085,0],[.115,.085,.17]);
    return {side,thigh,shin,boot};
  });
  blob(torso,coat,[0,.69,0],[.27,.29,.21]);
  const arms=[-1,1].map(side=>{
    const arm=new THREE.Group();arm.position.set(side*.28,.85,0);torso.add(arm);
    blob(arm,coat,[0,-.12,0],[.095,.19,.11]);
    blob(arm,skin,[0,-.32,.015],[.085,.09,.08]);return arm;
  });
  blob(torso,skin,[0,1.14,.01],[.23,.25,.21]);
  const hair=mat('#513322');
  blob(torso,hair,[0,1.30,-.025],[.25,.18,.23]);
  for(let i=0;i<18;i++){
    const a=i*2.399,r=.16+random()*.04;
    const lock=blob(torso,hair,[Math.cos(a)*r,1.31+random()*.12,Math.sin(a)*r],[.085,.11,.085],new THREE.IcosahedronGeometry(1,1));lock.rotation.z=Math.cos(a)*.5;
  }
  for(const side of [-1,1]){
    blob(torso,hair,[side*.21,1.18,-.025],[.05,.13,.14]);
    blob(torso,skin,[side*.24,1.12,.015],[.045,.07,.055]);
    blob(torso,leather,[side*.16,.72,.20],[.026,.23,.025]);
  }
  blob(torso,leather,[0,.51,0],[.28,.045,.22]);
  blob(torso,mat('#b49a5c'),[.02,.51,.225],[.045,.032,.015]);
  blob(torso,skin,[0,1.10,.225],[.045,.055,.045]);
  blob(torso,scarf,[0,.94,0],[.24,.045,.20]);
  const scarfTail=blob(torso,scarf,[.21,.77,-.24],[.09,.25,.045]);scarfTail.rotation.z=-.25;
  blob(torso,leather,[0,.68,-.24],[.22,.26,.12]);
  blob(torso,palette.cream,[0,.81,-.35],[.21,.075,.065]);
  for(const s of [-1,1])blob(torso,palette.ink,[s*.085,1.15,.202],[.025,.035,.018]);
  scene.add(player);

  const nibbit=new THREE.Group(), nibbitPose=new THREE.Group();nibbit.add(nibbitPose);
  const faceParts=[],eyes=[],paws=[];
  const faceBlob=(...args)=>{const mesh=blob(nibbitPose,...args);faceParts.push(mesh);return mesh;};
  blob(nibbitPose,palette.fur,[0,.40,0],[.43,.41,.39]);
  detail.coatTufts(nibbitPose,[0,.40,0],[.415,.395,.375],320,palette.fur);
  blob(nibbitPose,palette.cream,[0,.40,.315],[.27,.28,.10]);
  faceBlob(palette.fur,[0,.72,.12],[.355,.315,.305]);
  faceParts.push(detail.coatTufts(nibbitPose,[0,.72,.12],[.345,.305,.295],180,palette.fur,true));
  const ears=[];
  for(const s of [-1,1]){
    const ear=new THREE.Group();ear.position.set(s*.19,.91,.04);ear.rotation.z=-s*.23;if(s>0)ear.scale.set(.95,.83,.95);
    const outline=new THREE.LatheGeometry([new THREE.Vector2(0,0),new THREE.Vector2(.08,.06),new THREE.Vector2(.13,.23),new THREE.Vector2(.115,.43),new THREE.Vector2(.07,.61),new THREE.Vector2(0,.74)],14);
    const shell=new THREE.Mesh(outline,palette.fur);shell.scale.z=.65;shell.castShadow=true;ear.add(shell);
    blob(ear,palette.pink,[0,.36,.073],[.077,.27,.023]);nibbitPose.add(ear);faceParts.push(ear);ears.push(ear);
    faceBlob(mat('#806649'),[s*.17,.77,.383],[.117,.137,.042]);
    eyes.push(faceBlob(palette.ink,[s*.17,.77,.407],[.093,.114,.041]));
    eyes.push(faceBlob(new THREE.MeshBasicMaterial({color:'#fff2d6'}),[s*.17-.025,.812,.444],[.027,.033,.012]));
    faceBlob(palette.cream,[s*.07,.625,.405],[.09,.065,.055]);
    const paw=new THREE.Group();nibbitPose.add(paw);paws.push(paw);
    blob(paw,mat('#65513c'),[s*.32,.24,.24],[.13,.11,.18]);
    for(let j=0;j<3;j++)blob(paw,palette.cream,[s*.32+(j-1)*.045,.21,.395],[.021,.027,.05]);
    blob(nibbitPose,palette.fur,[s*.25,.12,-.16],[.18,.13,.22]);
  }
  const nose=faceBlob(palette.ink,[0,.665,.465],[.041,.028,.022]);
  const mouthMaterial=mat('#493727');
  faceBlob(mouthMaterial,[0,.615,.46],[.008,.025,.008]);
  for(const side of [-1,1]){
    const smile=faceBlob(mouthMaterial,[side*.019,.596,.45],[.025,.007,.007]);smile.rotation.z=side*.25;
  }
  blob(nibbitPose,palette.cream,[0,.36,-.43],[.16,.16,.14]);
  const nibbitHead=new THREE.Group();nibbitHead.position.set(0,.72,.14);nibbitPose.add(nibbitHead);
  nibbitPose.updateMatrixWorld(true);faceParts.forEach(part=>nibbitHead.attach(part));
  const eyeHeights=eyes.map(eye=>eye.scale.y);
  nibbit.position.copy(world(...nibbitCell));nibbit.rotation.y=.35;
  nibbit.traverse(o=>{if(o.isMesh)o.userData.nibbit=true});scene.add(nibbit);
  const marker=new THREE.Mesh(new THREE.RingGeometry(.20,.26,32),new THREE.MeshBasicMaterial({color:'#f4dd9c',transparent:true,opacity:.8,side:THREE.DoubleSide}));
  marker.rotation.x=-Math.PI/2;marker.position.y=.025;marker.visible=false;scene.add(marker);
  let phase=0,walkBlend=0,previousPosition=null,lastTime=null,nearLastFrame=false,greeting=0;
  const up=new THREE.Vector3(0,1,0),segment=new THREE.Vector3();
  function limb(mesh,from,to){
    segment.subVectors(to,from);mesh.position.copy(from).add(to).multiplyScalar(.5);
    mesh.scale.y=segment.length()/2;mesh.quaternion.setFromUnitVectors(up,segment.normalize());
  }
  const hip=new THREE.Vector3(),knee=new THREE.Vector3(),ankle=new THREE.Vector3();
  return {player,nibbit,marker,animateArt(time,moving){
    const dt=lastTime===null?0:Math.min(time-lastTime,.04);lastTime=time;
    const travelled=previousPosition?player.position.distanceTo(previousPosition):0;
    if(!previousPosition)previousPosition=player.position.clone();previousPosition.copy(player.position);
    // Advance by distance, not wall time: planted feet match the navigation speed.
    if(travelled<.3)phase+=travelled/1.12*Math.PI*2;
    walkBlend=THREE.MathUtils.damp(walkBlend,moving?1:0,18,dt);
    const bounce=(1-Math.cos(phase*2))*.018*walkBlend;
    torso.position.y=bounce;torso.rotation.z=Math.sin(phase)*.035*walkBlend;
    torso.rotation.x=.035*walkBlend;
    legs.forEach((leg,i)=>{
      const u=((phase/(Math.PI*2)+i*.5)%1+1)%1;
      const swing=(u-.5)*2;
      const z=(u<.5?.28-u*1.12:-.28+.56*(swing*swing*(3-2*swing)))*walkBlend;
      const lift=u<.5?0:Math.sin(swing*Math.PI)*.15*walkBlend;
      leg.boot.position.set(leg.side*.14,.085+lift,z);
      hip.set(leg.side*.14,.48+bounce,0);ankle.set(leg.side*.14,.14+lift,z);
      knee.copy(hip).lerp(ankle,.5);knee.z+=.07+lift*.5;
      limb(leg.thigh,hip,knee);limb(leg.shin,knee,ankle);
      arms[i].rotation.x=Math.sin(phase+i*Math.PI)*.55*walkBlend;
    });
    scarfTail.rotation.x=Math.sin(phase-.5)*.13*walkBlend+Math.sin(time*3)*.025;

    const proximity=player.position.distanceTo(nibbit.position),near=proximity<2.6;
    if(near&&!nearLastFrame)greeting=1;nearLastFrame=near;
    greeting=Math.max(0,greeting-dt*.85);
    const cycle=time%12,sniff=cycle>2&&cycle<4,dig=!near&&!nibbit.userData.roaming&&cycle>6&&cycle<8;
    const desiredYaw=nibbit.userData.roaming?nibbit.userData.roamHeading:near?Math.atan2(player.position.x-nibbit.position.x,player.position.z-nibbit.position.z):.35+Math.sin(time*.45)*.35;
    const turn=Math.atan2(Math.sin(desiredYaw-nibbit.rotation.y),Math.cos(desiredYaw-nibbit.rotation.y));
    nibbit.rotation.y+=turn*(1-Math.exp(-dt*4));
    const hop=greeting>0&&!nibbit.userData.roaming?Math.max(0,Math.sin((1-greeting)*Math.PI*2))*.16:0;
    nibbitPose.position.y=hop;
    nibbitPose.scale.set(1+Math.sin(time*2)*.012,1+Math.sin(time*2+.5)*.018,1);
    nibbitPose.rotation.x=THREE.MathUtils.damp(nibbitPose.rotation.x,dig?.22:0,8,dt);
    nibbitHead.rotation.z=THREE.MathUtils.damp(nibbitHead.rotation.z,near?Math.sin(time*.8)*.12:Math.sin(time*.7)*.04,5,dt);
    nibbitHead.rotation.x=sniff?Math.sin(time*16)*.045:Math.sin(time*1.5)*.025;
    nose.scale.y=.028*(sniff?1+Math.sin(time*20)*.2:1);
    const blinkTime=time%4.7,blink=blinkTime<.16?Math.max(.08,Math.abs(blinkTime-.08)/.08):1;
    eyes.forEach((eye,i)=>eye.scale.y=eyeHeights[i]*blink);
    ears[0].rotation.z=-.23+Math.sin(time*1.7)*.06+(greeting>0?-.14*greeting:0);
    ears[1].rotation.z=.23+Math.sin(time*1.5)*.06;
    ears[1].rotation.x=cycle>9&&cycle<9.6?Math.sin((cycle-9)*Math.PI/.6)*.35:0;
    paws.forEach((paw,i)=>{paw.position.y=dig?Math.max(0,Math.sin(time*18+i*Math.PI))*.1:0;paw.position.z=dig?Math.sin(time*18+i*Math.PI)*.06:0;});
    marker.scale.setScalar(1+Math.sin(time*4)*.08);
  }};
}
