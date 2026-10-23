/* Mejoras del visor: navegación, foco y herramientas. Conserva el esquema técnico. */
(() => {
  function boot() {
    const v = window.__visor;
    if (!v?.listo) { if (!document.querySelector('#cargando')?.textContent.includes('No se pudo')) setTimeout(boot,150); return; }
    const {S,D,THREE,camera,controls,scene}=v;
    const capas=[...D.capas].sort((a,b)=>a.n-b.n);
    const host=document.createElement('section'); host.className='seccion explorar';
    host.innerHTML=`<h2>Explorar el manto <small>Recorrido interactivo</small></h2>
      <label for="buscar-capa">Buscar una capa</label><input id="buscar-capa" type="search" placeholder="Ej.: forro, bordado…">
      <label for="recorrido-capa">Capa del recorrido</label><select id="recorrido-capa"></select>
      <div class="fila"><button class="mini" id="capa-prev">← Anterior</button><button class="mini" id="capa-next">Siguiente →</button><button class="mini" id="capa-solo" aria-pressed="false">Aislar capa</button></div>
      <div class="fila"><button class="mini" id="enfocar">Acercar selección</button><button class="mini" id="girar" aria-pressed="false">Girar 360°</button><button class="mini" id="restablecer">Restablecer</button></div>
      <div class="fila"><button class="mini" id="captura">Guardar imagen</button><button class="mini" id="compartir">Copiar vista</button></div>
      <p class="nota" id="explorar-estado" role="status" aria-live="polite">Elige una capa o toca el modelo. Doble clic para acercar la selección.</p>
      <p class="nota">Teclado sobre la escena: + / − acercar, 0 centrar, Esc cerrar.</p>
      <p class="nota"><a href="../dtf-rev2/">Ver los nuevos artes DTF rev2 →</a><br>Alterna entre el montaje DTF rev2 y el esquema de taller.</p>`;
    document.querySelector('#panel-capas').prepend(host);
    const $=s=>host.querySelector(s), sel=$('#recorrido-capa'), input=$('#buscar-capa'), status=$('#explorar-estado');
    const say=t=>status.textContent=t;
    function options(){const q=input.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const old=sel.value;
      sel.replaceChildren(...capas.filter(c=>(c.n+' '+c.nombre).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q)).map(c=>new Option(c.n+' · '+c.nombre,c.id)));
      if([...sel.options].some(o=>o.value===old))sel.value=old;
      for(const id of ['capa-prev','capa-next','capa-solo'])$('#'+id).disabled=!sel.options.length;
      if(!sel.options.length)say('No se encontraron capas. Prueba otro nombre.');else say(sel.options.length+' capas disponibles. Elige una para explorar.');
    } options();input.addEventListener('input',options);
    let spinning=false,last=0;
    function stop(){spinning=false;$('#girar').setAttribute('aria-pressed','false');}
    function choose(){if(!sel.value)return; stop();v.irAModo('capas');S.lado=null;S.solo=$('#capa-solo').getAttribute('aria-pressed')==='true'?sel.value:null;S.vis[sel.value]=true;v.fijarExplode(55,true);v.aplicarEstado();v.elegirDesdeLista({capa:sel.value});v.irAVistaUI('3q');say(sel.selectedOptions[0].textContent);}
    sel.addEventListener('change',choose);
    $('#capa-prev').onclick=()=>{sel.selectedIndex=(sel.selectedIndex-1+sel.options.length)%sel.options.length;choose();};
    $('#capa-next').onclick=()=>{sel.selectedIndex=(sel.selectedIndex+1)%sel.options.length;choose();};
    $('#capa-solo').onclick=()=>{$('#capa-solo').setAttribute('aria-pressed',String($('#capa-solo').getAttribute('aria-pressed')!=='true'));choose();};
    function focus(){stop();const f=S.sel;if(!f){say('Selecciona primero una pieza o capa.');return;}
      scene.updateMatrixWorld(true);const box=new THREE.Box3();let found=false;
      scene.traverse(o=>{if(!o.isMesh)return;for(let a=o;a;a=a.parent)if(!a.visible)return;
        const d=o.userData||{};if(f.rev2?d.rev2===f.rev2:f.pieza?d.pieza===f.pieza: f.zona?d.zona===f.zona:d.capa===f.capa){box.expandByObject(o);found=true;}});
      if(!found||box.isEmpty()){say('La selección está oculta. Muéstrala para acercarla.');return;}
      const c=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
      v.irAVistaUI('frente');v.irAVista('frente',{caja:{w:Math.max(12,size.x*1.3),h:Math.max(12,size.y*1.3)},centro:c.toArray()});
      v.abrirHoja(false);say('Selección centrada. Arrastra para girar.');
    }
    $('#enfocar').onclick=focus;v.renderer.domElement.addEventListener('dblclick',focus);
    $('#girar').onclick=()=>{spinning=!spinning;$('#girar').setAttribute('aria-pressed',String(spinning));if(spinning){v.irAVistaUI('3q');v.abrirHoja(false);}say(spinning?'Giro activo; toca la escena para detenerlo.':'Giro detenido.');};
    controls.addEventListener('start',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    function tick(t){requestAnimationFrame(tick);if(spinning&&!document.hidden){const dt=Math.min((t-last)/1000,.05);camera.position.sub(controls.target).applyAxisAngle(new THREE.Vector3(0,1,0),dt*.23).add(controls.target);camera.lookAt(controls.target);v.pedir();}last=t;}requestAnimationFrame(tick);
    $('#restablecer').onclick=()=>{stop();if(window.__dtfRev2?.active){window.__dtfRev2.all();return;}input.value='';options();S.solo=null;S.lado=null;S.sel=null;S.fijo=false;S.etiquetas=true;for(const c of capas)S.vis[c.id]=true;v.setFoco(null);v.irAModo('capas');v.alElegir(null);v.fijarExplode(0,true);v.irAVistaUI('frente');$('#capa-solo').setAttribute('aria-pressed','false');v.aplicarEstado();say('Todas las capas visibles. Vista inicial.');};
    $('#captura').onclick=()=>{v.render();v.renderer.domElement.toBlob(b=>{if(!b){say('No se pudo guardar la captura.');return;}const url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='ancla-del-alma-vista.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Imagen de la escena guardada.');},'image/png');};
    $('#compartir').onclick=async()=>{const p=new URLSearchParams({modo:S.modo,vista:S.vista==='libre'?'3q':S.vista,e:Math.round(S.explode*100)});if(S.solo)p.set('solo',S.solo);if(S.lado)p.set('lado',S.lado);if(!S.etiquetas)p.set('etq','0');const hidden=capas.filter(c=>!S.vis[c.id]).map(c=>c.id);if(hidden.length)p.set('ocultar',hidden.join(','));if(S.sel?.pieza)p.set('pieza',S.sel.pieza);else if(S.sel?.capa)p.set('tarjeta',S.sel.capa);if(S.modo==='confeccion')p.set('fase',S.fase+1);window.__dtfRev2?.share(p);const url=location.href.split('#')[0]+'#'+p;history.replaceState(null,'','#'+p);try{await navigator.clipboard.writeText(url);say('Enlace copiado con vista, capas y selección.');}catch{say('Vista guardada en la dirección del navegador. Copia esa dirección para compartirla.');}};
    v.renderer.domElement.addEventListener('keydown',e=>{if(!['+','=','-','0'].includes(e.key))return;e.preventDefault();stop();if(e.key==='0'){v.irAVistaUI('centrar');return;}const offset=camera.position.clone().sub(controls.target);const d=offset.length(),n=Math.max(controls.minDistance||10,Math.min(controls.maxDistance||2000,d*(e.key==='-'?1.15:.87)));camera.position.copy(controls.target).add(offset.multiplyScalar(n/d));v.pedir();});
    window.__explorar={focus,choose,stop};
  } boot();
})();
