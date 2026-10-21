(() => {
  const root = document.querySelector('.quarter-explorer');
  if (!root) return;
  const $ = s => root.querySelector(s);
  const quarters = {degtyaritsy:'Дегтярицы',nikolo:'Николо-Корма',vysoka:'Новые Высока',chernaya:'Чёрная речка'};
  const overview=$('#qe-overview'),detail=$('#qe-detail'),viewer=$('.qe-viewer'),plan=$('#qe-plan');
  let scale=1,x=0,y=0;
  const pointers=new Map(); let gesture=null;
  function paint(){
    if(!plan.naturalWidth || !plan.naturalHeight)return;
    const w=viewer.clientWidth,h=viewer.clientHeight;
    const ratio=plan.naturalWidth/plan.naturalHeight;
    const iw=Math.min(w,h*ratio),ih=iw/ratio;
    x=Math.max(-Math.max(0,(iw*scale-w)/2),Math.min(Math.max(0,(iw*scale-w)/2),x));
    y=Math.max(-Math.max(0,(ih*scale-h)/2),Math.min(Math.max(0,(ih*scale-h)/2),y));
    plan.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
    viewer.classList.toggle('is-zoomed',scale>1);
    $('#qe-reset').textContent=`${Math.round(scale*100)}%`;
    $('#qe-minus').disabled=scale<=1;$('#qe-plus').disabled=scale>=4;
  }
  function zoom(v){scale=Math.max(1,Math.min(4,v));paint();}
  let activeTrigger=null, busy=false;
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const priceData={degtyaritsy:70000,nikolo:45000,vysoka:70000,chernaya:100000};
  async function openQuarter(trigger){
    if(busy)return;busy=true;activeTrigger=trigger;
    const id=trigger.dataset.quarter,name=quarters[id];
    $('#qe-detail-title').textContent=name;
    plan.loading='eager';plan.src=`assets/quarter-overview/${id}-plan.png`;plan.alt=`Исходный генплан квартала «${name}»`;
    viewer.setAttribute('aria-label',`Генплан квартала «${name}». Масштаб: плюс и минус. Перемещение: стрелки или перетаскивание.`);
    const price=priceData[id];$('.qe-price').hidden=!price;
    if(price)$('.qe-price').innerHTML=`от ${price.toLocaleString('ru-RU')} ₽<span>за сотку</span>`;
    $('.qe-key').hidden=!['degtyaritsy','nikolo'].includes(id);
    if(price)$('.qe-key p').lastChild.textContent=`от ${price.toLocaleString('ru-RU')} ₽/сотка`;
    $('.qe-key p:last-child').hidden=id!=='degtyaritsy';
    $('[data-plan-quarter]').dataset.planQuarter=name;
    $('#qe-pdf').href=`assets/quarter-overview/${id}-plan.pdf`;$('#qe-pdf').download=`${name} — генплан.pdf`;
    detail.hidden=false;detail.showModal();
    document.body.style.overflow='hidden';
    scale=1;x=y=0;paint();
    $('#qe-detail-title').focus({preventScroll:true});busy=false;
  }
  root.addEventListener('quarter:open',e=>openQuarter(e.detail.trigger));
  $('#qe-open-selected').addEventListener('click',()=>openQuarter($('#qe-open-selected')));
  const closeQuarter=()=>detail.close();
  $('#qe-back').addEventListener('click',closeQuarter);
  detail.addEventListener('close',()=>{detail.hidden=true;document.body.style.overflow='';pointers.clear();gesture=null;$('.qe-map-viewport').focus({preventScroll:true});});
  detail.addEventListener('click',e=>{if(e.target!==detail)return;const r=detail.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeQuarter();});
  const wrap=$('.qe-viewer-wrap');
  function exitFullscreen(){if(document.fullscreenElement)document.exitFullscreen();wrap.classList.remove('qe-expanded');$('#qe-exit-fullscreen').hidden=true;paint();$('#qe-fullscreen').focus();}
  detail.addEventListener('keydown',e=>{if(e.key==='Escape'&&wrap.classList.contains('qe-expanded')){e.preventDefault();e.stopPropagation();exitFullscreen();}});
  $('#qe-fullscreen').addEventListener('click',async()=>{
    $('#qe-exit-fullscreen').hidden=false;
    try{if(!wrap.requestFullscreen)throw new Error('unsupported');await wrap.requestFullscreen();}catch{wrap.classList.add('qe-expanded');}
    $('#qe-exit-fullscreen').focus();paint();
  });
  $('#qe-exit-fullscreen').addEventListener('click',exitFullscreen);
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){$('#qe-exit-fullscreen').hidden=true;paint()}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&wrap.classList.contains('qe-expanded'))exitFullscreen()});
  $('#qe-plus').addEventListener('click',()=>zoom(scale+.5));$('#qe-minus').addEventListener('click',()=>zoom(scale-.5));$('#qe-reset').addEventListener('click',()=>{x=y=0;zoom(1)});
  viewer.addEventListener('dblclick',()=>zoom(scale===1?2:1));
  viewer.addEventListener('keydown',e=>{if(['+','=','-','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','0'].includes(e.key)){e.preventDefault();if(e.key==='+'||e.key==='=')zoom(scale+.5);if(e.key==='-')zoom(scale-.5);if(e.key==='0')zoom(1);if(e.key==='ArrowLeft')x+=40;if(e.key==='ArrowRight')x-=40;if(e.key==='ArrowUp')y+=40;if(e.key==='ArrowDown')y-=40;paint();}});
  function measure(){const p=[...pointers.values()];return p.length>1?{cx:(p[0].x+p[1].x)/2,cy:(p[0].y+p[1].y)/2,d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}:{cx:p[0]?.x||0,cy:p[0]?.y||0,d:0};}
  viewer.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});viewer.setPointerCapture(e.pointerId);gesture={...measure(),scale,x,y};viewer.classList.add('is-dragging');});
  viewer.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const m=measure();if(m.d&&gesture.d)scale=Math.max(1,Math.min(4,gesture.scale*m.d/gesture.d));x=gesture.x+m.cx-gesture.cx;y=gesture.y+m.cy-gesture.cy;paint();});
  const release=e=>{pointers.delete(e.pointerId);gesture=pointers.size?{...measure(),scale,x,y}:null;viewer.classList.remove('is-dragging');};
  viewer.addEventListener('pointerup',release);viewer.addEventListener('pointercancel',release);
  new ResizeObserver(()=>{if(!detail.hidden)paint()}).observe(viewer);
  plan.addEventListener('load',paint);
  document.addEventListener('click',e=>{
    const trigger=e.target.closest('[data-lead-intent]');if(!trigger)return;
    const form=document.querySelector('[data-lead-form]');if(!form)return;
    form.querySelector('[data-selected-quarter]')?.remove();
    if(trigger.dataset.planQuarter){const field=document.createElement('input');field.type='hidden';field.name='quarter';field.value=trigger.dataset.planQuarter;field.dataset.selectedQuarter='';form.append(field);document.querySelector('#lead-dialog-title').textContent=`Подобрать участок — ${field.value}`;}
  });
})();
