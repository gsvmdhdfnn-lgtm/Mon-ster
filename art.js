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

  const player=new THREE.Group();player.scale.setScalar(1.1);
  const coat=mat('#4c6540'),leather=mat('#58402c'),skin=new THREE.MeshStandardMaterial({color:'#d8a578',roughness:.9}),pants=new THREE.MeshStandardMaterial({color:'#424a43',roughness:1}),hair=mat('#4b3021');
  coat.flatShading=false;
  function box(parent,material,position,size,radius=.025){
    const geo=new THREE.BoxGeometry(...size,5,5,5),pos=geo.attributes.position,v=new THREE.Vector3(),core=new THREE.Vector3();
    for(let i=0;i<pos.count;i++){
      v.fromBufferAttribute(pos,i);core.set(THREE.MathUtils.clamp(v.x,-size[0]/2+radius,size[0]/2-radius),THREE.MathUtils.clamp(v.y,-size[1]/2+radius,size[1]/2-radius),THREE.MathUtils.clamp(v.z,-size[2]/2+radius,size[2]/2-radius));
      v.sub(core).normalize().multiplyScalar(radius).add(core);pos.setXYZ(i,v.x,v.y,v.z);
    }
    geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,material);mesh.position.set(...position);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function cord(parent,points,radius,material){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,16,radius,6,false),material);parent.add(mesh);mesh.castShadow=true;return mesh;
  }
  const torso=new THREE.Group();player.add(torso);
  const legs=[-1,1].map(side=>{
    const thigh=blob(player,pants,[0,0,0],[1,1,1],new THREE.CylinderGeometry(.097,.085,2,12));
    const shin=blob(player,pants,[0,0,0],[1,1,1],new THREE.CylinderGeometry(.085,.065,2,12));
    const joint=blob(player,pants,[0,0,0],[.086,.09,.086]);
    const boot=box(player,leather,[side*.12,.085,.035],[.16,.17,.27],.035);
    const sole=box(boot,mat('#302a25'),[0,-.065,0],[.165,.035,.275],.01);
    return {side,thigh,shin,joint,boot};
  });
  box(torso,pants,[0,.74,0],[.39,.18,.24],.045);
  const jacketGeo=new THREE.LatheGeometry([new THREE.Vector2(0,.79),new THREE.Vector2(.21,.79),new THREE.Vector2(.20,.94),new THREE.Vector2(.23,1.16),new THREE.Vector2(.25,1.25),new THREE.Vector2(.17,1.33),new THREE.Vector2(.085,1.36),new THREE.Vector2(0,1.36)],20);
  blob(torso,coat,[0,0,0],[1,1,.62],jacketGeo);
  blob(torso,skin,[0,1.39,0],[.073,.09,.07]);
  box(torso,leather,[0,.83,0],[.43,.055,.28],.015);
  box(torso,mat('#aa9462'),[0,.83,.149],[.058,.045,.015],.006);
  cord(torso,[[0,.88,.135],[0,1.1,.149],[0,1.29,.13]],.008,mat('#344b32'));
  for(const side of [-1,1])box(torso,coat,[side*.12,.98,.145],[.10,.11,.015],.006);
  const arms=[-1,1].map(side=>{
    const arm=new THREE.Group();arm.position.set(side*.245,1.26,0);torso.add(arm);
    const upper=blob(arm,coat,[side*.025,-.13,0],[.079,.17,.082]);upper.rotation.z=side*.12;
    blob(arm,coat,[side*.04,-.31,.025],[.067,.13,.069]);
    box(arm,leather,[side*.04,-.40,.03],[.13,.045,.135],.01);
    blob(arm,skin,[side*.04,-.46,.04],[.052,.075,.042]);
    blob(arm,skin,[side*.005,-.445,.075],[.026,.044,.025]);return arm;
  });
  // Shaped jaw and smaller head; subtle facial features instead of bead eyes and a button nose.
  const headGeo=new THREE.SphereGeometry(1,24,18),headPos=headGeo.attributes.position;
  for(let i=0;i<headPos.count;i++){
    const y=headPos.getY(i),taper=y<-.15?1+(y+.15)*.23:1;
    headPos.setXYZ(i,headPos.getX(i)*taper, y,headPos.getZ(i)*(y<0?.92:1));
  }
  headGeo.computeVertexNormals();blob(torso,skin,[0,1.62,.015],[.163,.215,.145],headGeo);
  for(const side of [-1,1]){
    blob(torso,skin,[side*.163,1.61,.012],[.027,.049,.03]);
    blob(torso,mat('#c08a66'),[side*.17,1.61,.032],[.01,.024,.008]);
    blob(torso,mat('#e9dfca'),[side*.063,1.653,.149],[.039,.018,.012]);
    blob(torso,mat('#473c2c'),[side*.061,1.654,.159],[.014,.016,.006]);
    blob(torso,mat('#171714'),[side*.061,1.654,.164],[.007,.011,.003]);
    const brow=box(torso,hair,[side*.063,1.691,.149],[.067,.012,.011],.003);brow.rotation.z=side*-.08;
  }
  blob(torso,skin,[0,1.61,.159],[.024,.047,.025]);
  blob(torso,skin,[0,1.582,.177],[.026,.018,.020]);
  cord(torso,[[-.038,1.535,.143],[0,1.529,.15],[.038,1.535,.143]],.005,mat('#93654e'));
  blob(torso,hair,[0,1.68,-.008],[.171,.169,.152],new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,1.65));
  const spikeGeo=new THREE.ConeGeometry(1,1,4);spikeGeo.translate(0,.5,0);
  for(let i=0;i<26;i++){
    const a=i*2.399,r=.04+random()*.115,x=Math.cos(a)*r,z=Math.sin(a)*r;
    const spike=blob(torso,hair,[x,1.77+(.15-r)*.28,z-.01],[.035+random()*.018,.035+random()*.03,.035],spikeGeo);
    spike.rotation.set(z*3+.15,random()*6,x*-3);
  }
  for(const side of [-1,1])blob(torso,hair,[side*.146,1.68,-.018],[.025,.064,.095]);
  // Canvas pack: a structured bag, top flap, front pocket, side pockets and real shoulder straps.
  const canvasMaterial=mat('#857048'),seam=mat('#b09a6e'),metal=mat('#ad9b70');
  box(torso,canvasMaterial,[0,1.075,-.235],[.37,.46,.21],.045);
  box(torso,canvasMaterial,[0,1.055,-.36],[.28,.20,.07],.025);
  box(torso,leather,[0,1.285,-.255],[.39,.085,.24],.025);
  box(torso,canvasMaterial,[0,1.145,-.398],[.29,.05,.018],.008);
  for(const side of [-1,1]){
    box(torso,canvasMaterial,[side*.213,1.05,-.235],[.075,.18,.16],.02);
    box(torso,leather,[side*.11,1.19,-.358],[.035,.19,.018],.006);
    box(torso,metal,[side*.11,1.135,-.374],[.047,.04,.012],.004);
    cord(torso,[[side*.12,1.28,-.23],[side*.20,1.34,-.04],[side*.17,1.26,.15],[side*.16,.98,.165],[side*.20,.91,-.16]],.022,leather);
    cord(torso,[[side*.145,.98,-.401],[side*.145,1.12,-.401]],.004,seam);
  }
  cord(torso,[[-.065,1.32,-.245],[-.06,1.38,-.24],[.06,1.38,-.24],[.065,1.32,-.245]],.014,leather);
  const scarfTail=new THREE.Group();torso.add(scarfTail);
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
  nibbit.scale.setScalar(1.12);
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
    if(travelled<.3)phase+=travelled/(1.12*1.1)*Math.PI*2;
    walkBlend=THREE.MathUtils.damp(walkBlend,moving?1:0,18,dt);
    const bounce=(1-Math.cos(phase*2))*.018*walkBlend;
    torso.position.y=bounce;torso.rotation.z=Math.sin(phase)*.035*walkBlend;
    torso.rotation.x=.035*walkBlend;
    legs.forEach((leg,i)=>{
      const u=((phase/(Math.PI*2)+i*.5)%1+1)%1;
      const swing=(u-.5)*2;
      const z=(u<.5?.28-u*1.12:-.28+.56*(swing*swing*(3-2*swing)))*walkBlend;
      const lift=u<.5?0:Math.sin(swing*Math.PI)*.15*walkBlend;
      leg.boot.position.set(leg.side*.12,.085+lift,z+.035);
      hip.set(leg.side*.12,.76+bounce,0);ankle.set(leg.side*.12,.17+lift,z);
      knee.copy(hip).lerp(ankle,.5);knee.z+=.035+lift*.65;leg.joint.position.copy(knee);
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
