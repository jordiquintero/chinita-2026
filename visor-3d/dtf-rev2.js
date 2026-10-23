/* Artes originales rev2 sobre el patrón de referencia. Las UV conservan la escala uniforme. */
(async function () {
  while (!window.__visor?.listo) await new Promise(r => setTimeout(r, 100));
  const v = window.__visor, {THREE: T, S, scene, renderer, capasObj} = v;
  const root = new T.Group(); root.name = 'DTF rev2'; root.visible = false; scene.add(root);
  const meshes = [], entries = new Map(), textures = new Map();
  const hash = new URLSearchParams(location.hash.slice(1));
  let enabled = hash.get('acabado') !== 'tecnico', active = false, ready = false, solo = hash.get('dtfSolo');
  const hidden = new Set((hash.get('dtfOcultar') || '').split(',').filter(Boolean));
  const panel = document.createElement('section'); panel.className = 'seccion rev2-panel';
  panel.innerHTML = `<h2>El manto con DTF rev2 <small>Montaje de los artes actuales</small></h2>
    <p class="nota">Agua ampliada recortada al contorno, dos filas de olas y ancla en raso champán. Colocación aproximada sobre H=200 × W=150 cm.</p>
    <label for="rev2-pieza">Explorar un arte</label><select id="rev2-pieza"></select>
    <div class="fila"><button class="mini" id="rev2-focus">Acercar arte</button><button class="mini" id="rev2-solo" aria-pressed="false">Aislar arte</button><button class="mini" id="rev2-todos">Ver conjunto</button></div>
    <div class="rev2-checks"><label><input id="rev2-agua" type="checkbox" checked> Mostrar agua ampliada</label><label><input id="rev2-olas" type="checkbox" checked> Mostrar las dos filas de olas</label></div>
    <p class="nota" id="rev2-status" role="status" aria-live="polite">Cargando los artes…</p>`;
  document.querySelector('#panel-capas').prepend(panel);
  const switcher = document.createElement('div'); switcher.className = 'rev2-switch';
  switcher.innerHTML = `<button class="mini" id="rev2-on" aria-pressed="false" disabled>Cargando DTF rev2…</button><button class="mini" id="rev2-off" aria-pressed="false" disabled>Esquema de taller</button>`;
  document.querySelector('#tabs').before(switcher);
  const legacyNote=document.createElement('p');legacyNote.className='rev2-legacy nota';legacyNote.textContent='Esquema de taller anterior: piezas, materiales y fases de referencia. Para ver los artes actuales, pulsa Manto DTF rev2.';document.querySelector('#tabs').after(legacyNote);
  const $ = id => document.getElementById(id), status = $('rev2-status'), select = $('rev2-pieza');
  const manifest = await fetch('texturas-rev2/manifest.json').then(r => { if (!r.ok) throw Error('No se encontró el catálogo de texturas'); return r.json(); });
  await Promise.all(manifest.map(async d => {
    const im = await new Promise((ok, fail) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => fail(Error('No se pudo cargar '+d.id)); im.src = d.src; });
    const tex = v.texDe(im); textures.set(d.id, {...d, im, tex, alfa:v.mapaAlfa(im, im.width / 8, im.height / 8, 1)});
  }));
  const texture = prefix => [...textures.values()].find(t => t.id.startsWith(prefix));
  // Convex polygon clipping in garment coordinates. UVs are interpolated, never stretched.
  const planes = [p => p.y, p => 200-p.y, p => 33.75+.20625*p.y-p.x, p => 33.75+.20625*p.y+p.x];
  function clip(poly) {
    for (const distance of planes) {
      const next=[];
      for(let i=0;i<poly.length;i++) {
        const a=poly[i], b=poly[(i+1)%poly.length], da=distance(a), db=distance(b);
        if(da>=0) next.push(a);
        if((da>=0)!==(db>=0)) { const t=da/(da-db); next.push(Object.fromEntries(['x','y','u','v'].map(k=>[k,a[k]+t*(b[k]-a[k])]))); }
      } poly=next;
    } return poly;
  }
  function add(id, name, prefix, cx, top, w, {angle=0,height=null,uv=null,n=8,level=0}={}) {
    const t=texture(prefix), h=height || w*t.px[1]/t.px[0], cy=top+h/2;
    const U=uv || [0,0,1,1], cs=Math.cos(angle), sn=Math.sin(angle);
    const corners=[[-w/2,-h/2,U[0],U[3]],[w/2,-h/2,U[2],U[3]],[w/2,h/2,U[2],U[1]],[-w/2,h/2,U[0],U[1]]];
    const poly=clip(corners.map(([x,y,u,vv])=>({x:cx+x*cs-y*sn,y:cy+x*sn+y*cs,u,v:vv})));
    if(poly.length<3)return;
    // Clockwise in image coordinates becomes counterclockwise in world coordinates.
    const pos=[],uvs=[],indices=[];poly.forEach(p=>{pos.push(p.x,100-p.y,0);uvs.push(p.u,p.v);});
    for(let i=1;i<poly.length-1;i++)indices.push(0,i+1,i);
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
    const mat=new T.MeshBasicMaterial({map:t.tex,transparent:true,alphaTest:.025,depthWrite:true,toneMapped:false,side:T.FrontSide});
    const mesh=new T.Mesh(geo,mat);mesh.name=name;mesh.userData={tipo:'rev2',rev2:id,capa:'apliques',alfa:t.alfa,n,level};
    root.add(mesh);meshes.push(mesh);v.pickables.push(mesh);
    if(!entries.has(id))entries.set(id,{id,name,t,meshes:[]});entries.get(id).meshes.push(mesh);
    return mesh;
  }
  // The water is 170 cm wide. Its 72.96 cm proportional height extends past the hem and is cropped.
  add('agua','Agua ampliada · reflejo central','AGUA-GRANDE',0,140,170,{n:6,level:.1});
  add('horizonte','Ávila, sol y Basílica','HOR-',0,140-113/texture('HOR-').px[0]*texture('HOR-').px[1],113,{n:7});
  add('olas','Olas · dos filas','OLA-',0,151,132,{n:8,level:.2});
  add('emblema','Cruz, resplandor y ancla champán','EMB-',0,25,70*texture('EMB-').px[0]/texture('EMB-').px[1],{n:9});
  for(const [id,side,x] of [['ramo-izq','izquierdo',-32],['ramo-der','derecho',32]])
    add(id,'Ramo '+side,'LIR-ramo-'+side,x,51,70*texture('LIR-ramo-'+side).px[0]/texture('LIR-ramo-'+side).px[1],{n:8});
  add('amarra','Amarra de oro','AMR-',0,94.8,25*texture('AMR-').px[0]/texture('AMR-').px[1],{n:9,level:.1});
  for(const [side,sign] of [['izq',-1],['der',1]]) {
    const w=7,t=texture('ORL-lateral-'+side), h=w*t.px[1]/t.px[0], angle=-sign*Math.atan(.20625);
    for(let y=66;y<200;y+=h*Math.cos(angle)) {
      const cy=y+h/2;
      add('orla-'+side,'Orla lateral '+(sign<0?'izquierda':'derecha'),'ORL-lateral-'+side,sign*(33.75+.20625*cy-4),y,w,{angle,n:11});
    }
  }
  const bottomWidth=7*texture('ORL-pie').px[0]/texture('ORL-pie').px[1];
  for(let x=-2*bottomWidth;x<=2.1*bottomWidth;x+=bottomWidth)
    add('orla-pie','Orla del pie','ORL-pie',x,193,bottomWidth,{n:11,level:.2});
  // Atlas: use the 12 separate glints of the delivered sheet, without a printed backing.
  const starTex=texture('DST-'), cw=starTex.im.width, ch=starTex.im.height;
  const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(starTex.im,0,0);
  const a=ctx.getImageData(0,0,cw,ch).data, visited=new Uint8Array(cw*ch), components=[];
  for(let start=0;start<visited.length;start++)if(!visited[start]&&a[start*4+3]>40){
    const stack=[start];visited[start]=1;let x0=cw,y0=ch,x1=0,y1=0,count=0;
    while(stack.length){const p=stack.pop(),x=p%cw,y=Math.floor(p/cw);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);count++;
      for(const q of [x>0?p-1:-1,x<cw-1?p+1:-1,y>0?p-cw:-1,y<ch-1?p+cw:-1])if(q>=0&&!visited[q]&&a[q*4+3]>40){visited[q]=1;stack.push(q);}}
    if(count>100)components.push([x0,y0,x1+1,y1+1]);
  }
  const stars=components.sort((a,b)=>(b[2]-b[0])*(b[3]-b[1])-(a[2]-a[0])*(a[3]-a[1])).slice(0,12);
  const sites=[[-49,100],[49,100],[-43,111],[43,111],[-50,122],[50,122],[-21,118],[21,118],[-14,105],[14,105],[-8,113],[8,113],[-37,128],[39,126],[-28,135],[27,133],[-17,127],[17,127],[-48,134],[50,135]];
  sites.forEach(([x,y],i)=>{const b=stars[i%stars.length],w=1.4+(i%3)*.25;add('destellos','Destellos de oro','DST-',x,y,w,{height:w*(b[3]-b[1])/(b[2]-b[0]),uv:[b[0]/cw,1-b[3]/ch,b[2]/cw,1-b[1]/ch],n:10});});
  for(const e of entries.values())select.add(new Option(e.name,e.id));
  select.value=hash.get('dtf') && entries.has(hash.get('dtf'))?hash.get('dtf'):'olas';
  $('rev2-agua').checked=!hidden.has('agua');$('rev2-olas').checked=!hidden.has('olas');
  function selectArt(id){if(!entries.has(id))return;select.value=id;v.elegirDesdeLista({rev2:id,capa:'apliques'});status.textContent=entries.get(id).name;v.pedir();}
  function all(){solo=null;hidden.clear();$('rev2-agua').checked=$('rev2-olas').checked=true;v.alElegir(null);v.fijarExplode(0);v.irAVistaUI('frente');v.pedir();}
  function setEnabled(on){enabled=on;v.alElegir(null);S.solo=null;S.lado=null;v.irAModo('capas');v.fijarExplode(0);v.irAVistaUI('frente');v.aplicarEstado();v.pedir();}
  $('rev2-on').onclick=()=>setEnabled(true);$('rev2-off').onclick=()=>setEnabled(false);
  select.onchange=()=>selectArt(select.value);
  $('rev2-focus').onclick=()=>{selectArt(select.value);window.__explorar?.focus();};
  $('rev2-solo').onclick=()=>{solo=solo===select.value?null:select.value;selectArt(select.value);v.pedir();};
  $('rev2-todos').onclick=all;
  for(const id of ['agua','olas'])$('rev2-'+id).onchange=e=>{if(e.target.checked)hidden.delete(id);else hidden.add(id);v.pedir();};
  function sync(){
    const next=ready&&enabled&&S.modo==='capas'&&!S.despiece;
    if(next!==active){active=next;document.body.classList.toggle('rev2-activo',active);if(!active){Object.values(capasObj).forEach(o=>o.gx.visible=true);v.aplicarEstado();$('esquema').textContent='Esquema: espesores exagerados';}}
    root.visible=active;$('rev2-on').setAttribute('aria-pressed',String(active));$('rev2-off').setAttribute('aria-pressed',String(!active));
    if(!active)return;
    $('esquema').textContent='DTF rev2 · montaje aproximado';
    for(const [id,o] of Object.entries(capasObj)) {
      if(o.def.n>=7){o.g.visible=false;o.gx.visible=false;}
      else if(id==='cuerpo'){o.g.visible=true;o.cuerpos.forEach(m=>m.visible=true);o.planos.forEach(m=>m.visible=false);}
    }
    v.gPiezas.visible=false;
    for(const m of meshes){const d=m.userData;m.visible=!hidden.has(d.rev2)&&(!solo||solo===d.rev2);m.position.z=1.1+(d.n-6)*.3+d.level+S.explode*30*(d.n-6);
      m.material.color.setScalar(S.sel?.rev2&&S.sel.rev2!==d.rev2 ? .65 : 1);
      m.material.clippingPlanes=S.corte?[v.planoCorte]:null;
    }
    if(S.sel?.rev2 && entries.has(S.sel.rev2))select.value=S.sel.rev2;
    $('rev2-solo').setAttribute('aria-pressed',String(solo===select.value));
  }
  function card(id){const e=entries.get(id);if(!e)return null;const el=document.createElement('div');
    const title=document.createElement('h2');title.textContent=e.name;el.append(title);
    const p=document.createElement('p');p.textContent=id==='agua'?'Panel de 11171 × 4794 px. Escala uniforme a 170 cm de ancho; el excedente se recorta en los cantos y el pie.':id==='olas'?'El arte seleccionado incluye las crestas grandes y la segunda fila de crestas pequeñas. Conserva sus proporciones.':'Arte DTF rev2 colocado con escala uniforme. El relieve visual está en la propia imagen.';el.append(p);
    const a=document.createElement('a');a.href=e.t.original;a.textContent='Abrir PNG original';a.target='_blank';a.rel='noopener';el.append(a);return el;
  }
  function share(p){p.set('acabado',enabled?'rev2':'tecnico');if(active){p.set('dtf',select.value);if(solo)p.set('dtfSolo',solo);if(hidden.size)p.set('dtfOcultar',[...hidden].join(','));p.delete('tarjeta');}}
  ready=true;window.__dtfRev2={sync,card,select:selectArt,all,share,meshes,entries,root,get active(){return active;},setEnabled};
  document.querySelector('#panel-capas').prepend(panel);
  $('rev2-on').disabled=$('rev2-off').disabled=false;$('rev2-on').textContent='Manto DTF rev2';
  status.textContent='11 artes cargados. Arrastra el manto para girarlo o elige una pieza para verla de cerca.';
  if(hash.get('dtf'))selectArt(select.value);v.pedir();
})().catch(e=>{console.error(e);const el=document.getElementById('rev2-status');if(el)el.textContent='No se pudieron cargar los artes. Recarga la página para reintentar. '+e.message;const banner=document.querySelector('.rev2-switch');if(banner)banner.textContent='No se cargó DTF rev2. Recarga la página para reintentar; el esquema de taller sigue disponible.';});
