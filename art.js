import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

// All decoration is visual only: Foundation 001 owns the navigation cells.
export function buildArt(scene, renderer, world, trees, rocks, nibbitCell) {
  let seed = 1357;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const mat = color => new THREE.MeshStandardMaterial({color, roughness: 1, flatShading: true});
  const palette = {bark: mat('#79513b'), leaf: mat('#527643'), light: mat('#80964c'), dark: mat('#365d42'), stone: mat('#889087'), moss: mat('#657b48'), fur: mat('#aa7951'), cream: mat('#ead4a3'), pink: mat('#c38b79'), ink: mat('#282c2c')};
  const sphere = new THREE.IcosahedronGeometry(1, 1);
  function blob(parent, material, position, scale, geometry = sphere) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position); mesh.scale.set(...scale);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  scene.background = new THREE.Color('#b9c9b9');
  scene.fog = new THREE.Fog('#b9c9b9', 27, 58);
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  scene.add(new THREE.HemisphereLight('#e0eddf', '#61583f', 2));
  const sun = new THREE.DirectionalLight('#ffe0a1', 3.1);
  sun.position.set(-10, 18, 8); sun.castShadow = true;
  Object.assign(sun.shadow.camera, {left:-15,right:15,top:15,bottom:-15,near:1,far:45});
  sun.shadow.mapSize.set(2048,2048); sun.shadow.normalBias=.035; sun.shadow.bias=-.0002;
  scene.add(sun);

  // A seeded painted texture keeps the walkable surface level and the grid invisible.
  const canvas = document.createElement('canvas'); canvas.width=canvas.height=1024;
  const ctx=canvas.getContext('2d'); ctx.fillStyle='#7f9656';ctx.fillRect(0,0,1024,1024);
  for(let i=0;i<5000;i++) {
    const x=random()*1024,y=random()*1024,r=8+random()*70;
    ctx.fillStyle=['#91a363','#6e884e','#a6ae70','#819956'][i%4];ctx.globalAlpha=.10;
    ctx.beginPath();ctx.ellipse(x,y,r,r*.6,random()*6,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  const trail = z => 1.8*Math.sin(z*.39)+.6;
  for(let i=0;i<2600;i++) {
    const z=random()*20-10, x=trail(z)+(random()+random()+random()-1.5)*1.6;
    ctx.globalAlpha=.09;ctx.fillStyle=['#c3b17b','#b6a274','#dbca95'][i%3];
    ctx.beginPath();ctx.ellipse((x+10)*51.2,(z+10)*51.2,12+random()*24,9+random()*18,0,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=.13;
  for(let i=0;i<24000;i++){ctx.fillStyle=i%2?'#edf0bc':'#425b38';ctx.fillRect(random()*1024,random()*1024,1+random()*3,1+random()*2);}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({map:texture,roughness:1}));
  ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.name='ground';scene.add(ground);
  blob(scene,mat('#6f674b'),[0,-.48,0],[10,.47,10],new THREE.BoxGeometry(2,2,2));
  blob(scene,mat('#87935c'),[0,-.08,0],[10,.07,10],new THREE.BoxGeometry(2,2,2));

  trees.forEach(([x,z],index)=>{
    const g=new THREE.Group();g.position.copy(world(x,z));scene.add(g);
    blob(g,palette.bark,[0,.8,0],[.21,.8,.21],new THREE.CylinderGeometry(.7,1,2,7));
    for(let i=0;i<5;i++){
      const angle=i*Math.PI*2/5;
      const root=blob(g,palette.bark,[Math.sin(angle)*.23,.09,Math.cos(angle)*.23],[.13,.1,.36]);root.rotation.y=angle;
    }
    for(let i=0;i<9;i++) {
      const a=i*2.4+index,r=i===8?0:.65;
      blob(g,[palette.leaf,palette.light,palette.dark][i%3],[Math.cos(a)*r,1.9+(i%3)*.39,Math.sin(a)*r],[.87,.73,.82]);
    }
  });
  rocks.forEach(([x,z],i)=>{
    const g=new THREE.Group();g.position.copy(world(x,z));scene.add(g);
    const rock=blob(g,palette.stone,[0,.34,0],[.48,.43,.4],new THREE.DodecahedronGeometry(1));rock.rotation.set(.1,i*.7,.2);
    blob(g,palette.moss,[-.08,.62,.02],[.32,.1,.28]);
    blob(g,palette.stone,[.3,.1,.22],[.14,.14,.19]);
  });
  // One draw call for meadow tufts, one for tiny flowers. No new obstacles.
  const grassGeo=new THREE.ConeGeometry(.085,.25,3);
  const grass=new THREE.InstancedMesh(grassGeo,mat('#678344'),1000);
  const flowers=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.045,0),mat('#f2d99a'),140);
  const dummy=new THREE.Object3D();let gi=0,fi=0;
  while(gi<1000){
    const x=random()*19.6-9.8,z=random()*19.6-9.8;
    if(Math.abs(x-trail(z))<1.3)continue;
    if([...trees,...rocks,nibbitCell,[9,16]].some(c=>world(...c).distanceTo(new THREE.Vector3(x,0,z))<.65))continue;
    dummy.position.set(x,.07,z);dummy.rotation.set(0,random()*6.28,.15);dummy.scale.setScalar(.6+random()*.8);dummy.updateMatrix();grass.setMatrixAt(gi++,dummy.matrix);
    if(fi<140&&random()<.2){dummy.position.y=.18;dummy.scale.setScalar(1);dummy.updateMatrix();flowers.setMatrixAt(fi++,dummy.matrix);}
  }
  flowers.count=fi;grass.receiveShadow=true;scene.add(grass,flowers);

  const player=new THREE.Group();const coat=mat('#386c6c'), leather=mat('#674936'), skin=mat('#e7b889'), scarf=mat('#d47a49');
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
  blob(torso,leather,[0,1.28,-.035],[.25,.16,.22]);
  blob(torso,mat('#c7b980'),[0,1.38,0],[.36,.045,.31]);
  blob(torso,mat('#a49c68'),[0,1.46,-.02],[.25,.14,.23]);
  blob(torso,scarf,[0,.94,0],[.29,.09,.25]);
  const scarfTail=blob(torso,scarf,[.21,.77,-.24],[.09,.25,.045]);scarfTail.rotation.z=-.25;
  blob(torso,leather,[0,.68,-.24],[.22,.26,.12]);
  blob(torso,palette.cream,[0,.81,-.35],[.21,.075,.065]);
  for(const s of [-1,1])blob(torso,palette.ink,[s*.085,1.15,.202],[.025,.035,.018]);
  scene.add(player);

  const nibbit=new THREE.Group(), nibbitPose=new THREE.Group();nibbit.add(nibbitPose);
  const faceParts=[],eyes=[],paws=[];
  const faceBlob=(...args)=>{const mesh=blob(nibbitPose,...args);faceParts.push(mesh);return mesh;};
  blob(nibbitPose,palette.fur,[0,.40,0],[.43,.38,.43]);
  blob(nibbitPose,palette.cream,[0,.4,.33],[.30,.27,.12]);
  faceBlob(palette.fur,[0,.72,.14],[.35,.29,.30]);
  const ears=[];
  for(const s of [-1,1]){
    const ear=new THREE.Group();ear.position.set(s*.19,.89,.08);ear.rotation.z=-s*.23;
    blob(ear,palette.fur,[0,.23,0],[.115,.34,.105]);
    blob(ear,palette.pink,[0,.25,.085],[.058,.24,.025]);nibbitPose.add(ear);faceParts.push(ear);ears.push(ear);
    eyes.push(faceBlob(palette.ink,[s*.16,.77,.39],[.057,.065,.032]));
    eyes.push(faceBlob(palette.cream,[s*.15-.012,.79,.419],[.017,.018,.009]));
    faceBlob(palette.cream,[s*.1,.62,.41],[.12,.085,.07]);
    const paw=new THREE.Group();nibbitPose.add(paw);paws.push(paw);
    blob(paw,palette.fur,[s*.34,.24,.24],[.17,.12,.2]);
    for(let j=0;j<3;j++)blob(paw,palette.cream,[s*.34+(j-1)*.055,.21,.405],[.026,.035,.065]);
    blob(nibbitPose,palette.fur,[s*.25,.12,-.16],[.18,.13,.22]);
  }
  const nose=faceBlob(palette.pink,[0,.68,.48],[.065,.045,.035]);
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
    nose.scale.y=.045*(sniff?1+Math.sin(time*20)*.2:1);
    const blinkTime=time%4.7,blink=blinkTime<.16?Math.max(.08,Math.abs(blinkTime-.08)/.08):1;
    eyes.forEach((eye,i)=>eye.scale.y=eyeHeights[i]*blink);
    ears[0].rotation.z=-.23+Math.sin(time*1.7)*.06+(greeting>0?-.14*greeting:0);
    ears[1].rotation.z=.23+Math.sin(time*1.5)*.06;
    ears[1].rotation.x=cycle>9&&cycle<9.6?Math.sin((cycle-9)*Math.PI/.6)*.35:0;
    paws.forEach((paw,i)=>{paw.position.y=dig?Math.max(0,Math.sin(time*18+i*Math.PI))*.1:0;paw.position.z=dig?Math.sin(time*18+i*Math.PI)*.06:0;});
    marker.scale.setScalar(1+Math.sin(time*4)*.08);
  }};
}
