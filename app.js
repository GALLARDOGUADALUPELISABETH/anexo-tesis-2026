'use strict';
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const pages = $$('.page');
  const sidebar = $('#sidebar');
  const toggle = $('#menu-toggle');
  const scrim = $('#menu-scrim');
  const mobile = matchMedia('(max-width:860px)');
  let currentPage = $('#inicio');
  let firstRoute = true;
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

  function setMenu(open, restoreFocus=false) {
    sidebar.classList.toggle('open',open);
    toggle.setAttribute('aria-expanded',String(open));
    scrim.hidden=!open;
    sidebar.inert=mobile.matches&&!open;
    if (open) $('#close-menu').focus();
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener('click',()=>setMenu(!sidebar.classList.contains('open')));
  $('#close-menu').addEventListener('click',()=>setMenu(false,true));
  scrim.addEventListener('click',()=>setMenu(false,true));
  mobile.addEventListener('change',()=>setMenu(false));
  setMenu(false);
  document.addEventListener('keydown', e => {
    if(e.key==='Escape'&&sidebar.classList.contains('open'))setMenu(false,true);
    if(e.key==='Tab'&&mobile.matches&&sidebar.classList.contains('open')){
      const links=$$('a,button',sidebar).filter(el=>el.offsetParent!==null);
      const first=links[0],last=links.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });

  function route() {
    document.body.classList.remove('print-current');
    pages.forEach(p=>p.classList.remove('print-selected'));
    let id;
    try {id=decodeURIComponent(location.hash.slice(1));} catch {id='inicio';}
    let target=document.getElementById(id||'inicio');
    if(!target||!target.closest('.page'))target=$('#inicio');
    const page=target.closest('.page');
    pages.forEach(p=>{p.classList.toggle('active',p===page);p.setAttribute('aria-hidden',String(p!==page));});
    currentPage=page;
    $('#current-section').textContent=page.dataset.title||'Anexo';
    document.title=(page.dataset.title||'Anexo')+' | Tesina Gallardo 2026';
    $$('.sidebar a').forEach(a=>{
      const active=a.hash==='#'+page.id;
      a.classList.toggle('active',active);
      if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    setMenu(false);
    const heading=$('h1,h2',page);
    heading.setAttribute('tabindex','-1');
    requestAnimationFrame(()=>{
      if(target!==page){target.scrollIntoView({block:'start',behavior:'instant'});}
      else window.scrollTo({top:0,behavior:'instant'});
      if(!firstRoute)heading.focus({preventScroll:true});
      firstRoute=false;
    });
  }
  addEventListener('hashchange',route);
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');
    if(a&&a.hash==='#main'){e.preventDefault();$('#main').focus();window.scrollTo({top:0,behavior:'instant'});return;}
    if(a&&a.hash===location.hash){e.preventDefault();route();}
  });
  route();

  const search=$('#evidence-search'),filter=$('#case-filter');
  function filterEvidence(){
    const q=normalize(search.value.trim());let count=0;
    $$('.gallery-item').forEach(a=>{
      const matches=normalize(a.dataset.search).includes(q)&&(filter.value==='all'||a.dataset.case===filter.value);
      a.hidden=!matches;if(matches)count++;
    });
    $('#evidence-count').textContent=count+' evidencia'+(count!==1?'s':'');
    $('#empty-gallery').hidden=count>0;
  }
  search.addEventListener('input',filterEvidence);filter.addEventListener('change',filterEvidence);

  const docs={
    anexo:{file:'assets/anexo-imprimible.pdf',title:'Anexo completo para impresión',description:'Registros, entrevista, instrumentos y evidencias · 66 páginas · A4'},
    autorizacion:{file:'assets/autorizacion.pdf',title:'Nota de autorización institucional',description:'Documento completo · 2 páginas'},
    portada:{file:'assets/portada-e-informacion.pdf',title:'Portada e información de "El matadero"',description:'Documento completo · 7 páginas'}
  };
  function selectDoc(key){
    const doc=docs[key];if(!doc)return;
    $$('.document-tabs button').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.doc===key));b.tabIndex=b.dataset.doc===key?0:-1;});
    $('#pdf-title').textContent=doc.title;$('#pdf-description').textContent=doc.description;
    $('#pdf-viewer').src=doc.file+'#view=FitH';$('#pdf-viewer').title='Visor PDF: '+doc.title;
    $('#pdf-open').href=doc.file;$('#pdf-download').href=doc.file;
    $('#pdf-download').textContent=key==='anexo'?'Descargar PDF ↓':'Descargar original ↓';
    $('#pdf-download').download=doc.file.split('/').at(-1);
    $('#pdf-panel').setAttribute('aria-labelledby','tab-'+key);
  }
  const tabs=$$('.document-tabs button');
  tabs.forEach((button,index)=>{
    button.addEventListener('click',()=>selectDoc(button.dataset.doc));
    button.addEventListener('keydown',e=>{
      let next=index;
      if(e.key==='ArrowRight')next=(index+1)%tabs.length;
      else if(e.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      else if(e.key==='Home')next=0;
      else if(e.key==='End')next=tabs.length-1;
      else return;
      e.preventDefault();tabs[next].focus();selectDoc(tabs[next].dataset.doc);
    });
  });

  const viewer=$('#viewer'),viewImage=$('#viewer-image'),canvas=$('#viewer-canvas');
  const figures=$$('figure').filter(f=>$('.image-open img',f));
  let selectedIndex=0,scale=1,fit=true,opener=null;
  function fitScale(){return Math.min((canvas.clientWidth-48)/viewImage.naturalWidth,(canvas.clientHeight-48)/viewImage.naturalHeight,1);}
  function applyZoom(){
    if(!viewImage.naturalWidth)return;
    const ratio=fit?Math.max(fitScale(),.05):scale;
    viewImage.style.width=Math.round(viewImage.naturalWidth*ratio)+'px';
    viewImage.style.height='auto';
    $('#zoom-level').textContent=fit?'Ajustar':Math.round(ratio*100)+' %';
  }
  function showFigure(index){
    selectedIndex=(index+figures.length)%figures.length;
    const figure=figures[selectedIndex],source=$('.image-open img',figure);
    const label=$('figcaption',figure)?.innerText.replace(/\n/g,' · ')||source.alt;
    $('#viewer-label').textContent=label;
    $('#viewer-meta').textContent=(figure.dataset.obs?'Observación N° '+figure.dataset.obs+' · ':'')+(figure.dataset.case||'Documentación institucional')+' · Archivo original';
    viewImage.alt=source.alt;viewImage.src=source.src;fit=true;
    $('#download-image').href=source.src;$('#download-image').download=source.src.split('/').at(-1);
    canvas.scrollTop=0;canvas.scrollLeft=0;
    if(viewImage.complete)applyZoom();
  }
  viewImage.addEventListener('load',applyZoom);
  function openFigure(figure,button){
    const index=figures.indexOf(figure);if(index<0)return;
    opener=button;showFigure(index);viewer.showModal();document.body.style.overflow='hidden';
    requestAnimationFrame(applyZoom);
  }
  $$('.image-open').forEach(button=>button.addEventListener('click',()=>openFigure(button.closest('figure'),button)));
  $$('.open-figure').forEach(button=>button.addEventListener('click',()=>openFigure(document.getElementById(button.dataset.figure),button)));
  $('#close-viewer').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close();});
  viewer.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus({preventScroll:true});});
  $('#previous-image').addEventListener('click',()=>showFigure(selectedIndex-1));
  $('#next-image').addEventListener('click',()=>showFigure(selectedIndex+1));
  $('#zoom-in').addEventListener('click',()=>{scale=Math.min((fit?fitScale():scale)*1.35,4);fit=false;applyZoom();});
  $('#zoom-out').addEventListener('click',()=>{scale=Math.max((fit?fitScale():scale)/1.35,.05);fit=false;applyZoom();});
  $('#actual-size').addEventListener('click',()=>{fit=false;scale=1;applyZoom();});
  $('#fit-image').addEventListener('click',()=>{fit=true;applyZoom();});
  addEventListener('resize',()=>{if(viewer.open&&fit)applyZoom();});
  viewer.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){e.preventDefault();showFigure(selectedIndex+1);}
    if(e.key==='ArrowLeft'){e.preventDefault();showFigure(selectedIndex-1);}
  });
  let drag=null;
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,y:e.clientY,left:canvas.scrollLeft,top:canvas.scrollTop};canvas.setPointerCapture(e.pointerId);e.preventDefault();canvas.style.cursor='grabbing';});
  canvas.addEventListener('pointermove',e=>{if(drag){canvas.scrollLeft=drag.left+drag.x-e.clientX;canvas.scrollTop=drag.top+drag.y-e.clientY;}});
  function stopDrag(){drag=null;canvas.style.cursor='grab';}
  canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);

  let detailState=[];
  function beforePrint(){
    detailState=$$('details').map(d=>({d,open:d.open}));
    detailState.forEach(({d})=>d.open=true);
    pages.forEach(p=>p.removeAttribute('aria-hidden'));
  }
  function afterPrint(){
    detailState.forEach(({d,open})=>d.open=open);detailState=[];
    document.body.classList.remove('print-current');
    pages.forEach(p=>{p.classList.remove('print-selected');p.setAttribute('aria-hidden',String(p!==currentPage));});
  }
  addEventListener('beforeprint',beforePrint);addEventListener('afterprint',afterPrint);
  async function printAnexo(all){
    const status=$('#status-message');status.textContent='Preparando las imágenes para imprimir…';status.classList.add('visible');
    document.body.classList.toggle('print-current',!all);currentPage.classList.add('print-selected');
    const images=all?$$('main img'):$$('img',currentPage);
    await Promise.all(images.map(im=>im.decode?im.decode().catch(()=>{}):Promise.resolve()));
    status.classList.remove('visible');window.print();
  }
  $('#print-current').addEventListener('click',()=>printAnexo(false));
  $('#print-all').addEventListener('click',()=>printAnexo(true));
})();
