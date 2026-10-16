import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

// Small authored meshes and seeded material painting; no remote art or billboard characters.
export function makeDetail(random) {
  function painted(kind, colors) {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
    const ctx=canvas.getContext('2d');ctx.fillStyle=colors[0];ctx.fillRect(0,0,256,256);
    for(let i=0;i<3200;i++){
      const x=random()*256,y=random()*256;
      ctx.globalAlpha=kind==='fur'?.22:.17;ctx.fillStyle=colors[1+i%(colors.length-1)];
      if(kind==='bark'){ctx.fillRect(x,y,1+random()*3,5+random()*44);}
      else if(kind==='fur'){
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-1-random()*2,y+4+random()*6);ctx.lineTo(x+2,y+3);ctx.fill();
      }else{ctx.beginPath();ctx.ellipse(x,y,1+random()*13,1+random()*8,random()*6,0,Math.PI*2);ctx.fill();}
    }
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({map:tex,roughness:kind==='fur'?.93:1});
  }
  const fur=painted('fur',['#b59a72','#5d4936','#e0c79a','#8e7351']);
  const bark=painted('bark',['#705038','#382e25','#a17b50','#57402e']);
  const stone=painted('stone',['#888a81','#b6b0a0','#535e5b','#6d7268']);
  const cream=painted('fur',['#d9c49c','#ac956f','#f2dfb5','#bca17b']);
  const soft=new THREE.SphereGeometry(1,20,14);
  // Tapered leaf with a raised central vein; readable volume from either side.
  const leaf=new THREE.BufferGeometry();
  leaf.setAttribute('position',new THREE.Float32BufferAttribute([
    0,0,0, -.42,.46,0, 0,.5,.12,
    -.42,.46,0, 0,1,0, 0,.5,.12,
    0,1,0, .42,.46,0, 0,.5,.12,
    .42,.46,0, 0,0,0, 0,.5,.12
  ],3));leaf.computeVertexNormals();
  const grass=new THREE.BufferGeometry(),vertices=[];
  for(let i=0;i<7;i++){
    const a=i*2.399,h=.17+random()*.23,bend=.06+random()*.12;
    const x=Math.cos(a),z=Math.sin(a),w=.025+random()*.015;
    vertices.push(-z*w,0,x*w,z*w,0,-x*w,x*bend*.35+z*w*.6,h*.55,z*bend*.35-x*w*.6);
    vertices.push(-z*w,0,x*w,x*bend*.35+z*w*.6,h*.55,z*bend*.35-x*w*.6,x*bend,h,z*bend);
  }
  grass.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));grass.computeVertexNormals();
  const tuft=new THREE.ConeGeometry(1,1,4);tuft.translate(0,.5,0);
  const dummy=new THREE.Object3D();
  function coatTufts(parent,center,radii,count,material,head=false){
    const mesh=new THREE.InstancedMesh(tuft,material,count),normal=new THREE.Vector3();
    for(let i=0;i<count;i++){
      const y=random()*1.8-.85,a=random()*Math.PI*2,r=Math.sqrt(1-y*y);
      normal.set(Math.cos(a)*r,y,Math.sin(a)*r);
      // Leave the front of the face clear so the eyes and muzzle remain readable.
      if(head&&normal.z>.4)normal.z=-normal.z;
      dummy.position.set(center[0]+normal.x*radii[0],center[1]+normal.y*radii[1],center[2]+normal.z*radii[2]);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);
      const length=.012+random()*.030;dummy.scale.set(.012+random()*.015,length,.006+random()*.009);
      dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
      mesh.setColorAt(i,new THREE.Color().setHSL(.095,.20+random()*.12,.48+random()*.18));
    }
    mesh.castShadow=true;parent.add(mesh);return mesh;
  }
  return {fur,bark,stone,cream,soft,leaf,grass,tuft,coatTufts};
}
