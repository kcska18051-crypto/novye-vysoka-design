(() => {
 const root=document.querySelector('.quarter-explorer');if(!root)return;
 const $=s=>root.querySelector(s), viewport=$('.qe-map-viewport'),scene=$('.qe-scene');
 // Image-space boundaries follow the client-marked overview supplied on 2026-10-15.
 const targets={degtyaritsy:{x:555,y:190,zoom:2.6},nikolo:{x:1160,y:650,zoom:2.6},vysoka:{x:790,y:520,zoom:2.6},chernaya:{x:510,y:490,zoom:2.4}};
 let scale=1,x=0,y=0,baseW=0,baseH=0,gesture=null,timer;
 const pointers=new Map();let pressedRegion=null,startPoint=null,moved=false;
 const popup=$('#qe-quarter-popup');let popupRegion=null,closeTimer,pinned=false,ignoreOpeningClick=false;
 const names={degtyaritsy:'Дегтярицы',nikolo:'Николо-Корма',vysoka:'Новые Высока',chernaya:'Чёрная речка'};
 function hidePopup(){pinned=false;clearTimeout(closeTimer);popup.hidden=true;popupRegion?.classList.remove('is-active');popupRegion=null}
 function placePopup(){if(!popupRegion||popup.hidden)return;const b=popupRegion.querySelector('path').getBoundingClientRect(),shell=$('.qe-map-shell').getBoundingClientRect();const left=Math.max(12,Math.min(shell.width-popup.offsetWidth-12,b.x+b.width/2-shell.x-popup.offsetWidth/2));let top=b.bottom-shell.y+10;if(top+popup.offsetHeight>viewport.clientHeight-10)top=Math.max(10,b.top-shell.y-popup.offsetHeight-10);popup.style.left=left+'px';popup.style.top=top+'px'}
 function showPopup(region,pin=false){pinned=pin;if(pin)ignoreOpeningClick=true;clearTimeout(closeTimer);popupRegion?.classList.remove('is-active');popupRegion=region;region.classList.add('is-active');const id=region.dataset.mapQuarter;$('#qe-popup-name').textContent=names[id];$('#qe-open-selected').dataset.quarter=id;const price={degtyaritsy:'от 70 000 ₽/сотка',nikolo:'от 45 000 ₽/сотка',vysoka:'от 70 000 ₽/сотка',chernaya:'от 100 000 ₽/сотка'}[id];$('#qe-popup-price').hidden=!price;$('#qe-popup-price').textContent=price||'';popup.hidden=false;placePopup()}
 function scheduleClose(){if(pinned)return;clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(!popup.matches(':hover')&&!popup.contains(document.activeElement)&&!popupRegion?.matches(':hover'))hidePopup()},220)}
 popup.addEventListener('pointerenter',()=>clearTimeout(closeTimer));popup.addEventListener('pointerleave',scheduleClose);popup.addEventListener('focusout',scheduleClose);$('.qe-popup-close').addEventListener('click',()=>{const region=popupRegion;hidePopup();viewport.focus({preventScroll:true})});
 root.querySelectorAll('[data-map-quarter]').forEach(region=>{region.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!pointers.size)showPopup(region)});region.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')scheduleClose()});region.addEventListener('focus',()=>showPopup(region));region.addEventListener('blur',scheduleClose)});
 document.addEventListener('click',e=>{if(ignoreOpeningClick&&popup.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();ignoreOpeningClick=false;}},true);
 document.addEventListener('pointerdown',e=>{if(popup.contains(e.target))ignoreOpeningClick=false;if(!popup.contains(e.target)&&!e.target.closest('[data-map-quarter]'))hidePopup()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hidePopup()});
 function draw(){
  const w=viewport.clientWidth,h=viewport.clientHeight;
  const fit=Math.min(w/1680,h/1187);baseW=1680*fit;baseH=1187*fit;
  const maxX=Math.max(0,(baseW*scale-w)/2),maxY=Math.max(0,(baseH*scale-h)/2);
  x=Math.max(-maxX,Math.min(maxX,x));y=Math.max(-maxY,Math.min(maxY,y));
  scene.style.width=`${baseW}px`;scene.style.height=`${baseH}px`;
  scene.style.transform=`translate(${-baseW*scale/2+x}px,${-baseH*scale/2+y}px) scale(${scale})`;
  $('#qe-map-reset').textContent='Весь генплан';$('#qe-map-reset').setAttribute('aria-label',`Вернуться к общему генплану. Текущий масштаб ${Math.round(scale*100)} процентов`);$('#qe-map-minus').disabled=scale<=1;$('#qe-map-plus').disabled=scale>=5;
 }
 function stop(){clearTimeout(timer);scene.classList.remove('is-focusing')}
 function animate(){scene.classList.add('is-focusing');clearTimeout(timer);timer=setTimeout(()=>scene.classList.remove('is-focusing'),450)}
 function zoom(value){hidePopup();stop();const next=Math.min(5,Math.max(1,value));x*=next/scale;y*=next/scale;scale=next;draw()}
 $('#qe-map-plus').addEventListener('click',()=>zoom(scale+.5));$('#qe-map-minus').addEventListener('click',()=>zoom(scale-.5));
 function resetOverview(){animate();scale=1;x=y=0;draw();hidePopup();}
 $('#qe-map-reset').addEventListener('click',resetOverview);root.addEventListener('quarter:reset',resetOverview);
 function measure(){const p=[...pointers.values()];return p.length>1?{cx:(p[0].x+p[1].x)/2,cy:(p[0].y+p[1].y)/2,d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}:{cx:p[0]?.x||0,cy:p[0]?.y||0,d:0}}
 viewport.addEventListener('pointerdown',e=>{if(e.button!==0)return;pressedRegion=e.target.closest('[data-map-quarter]');startPoint={x:e.clientX,y:e.clientY};moved=false;stop();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});viewport.setPointerCapture(e.pointerId);gesture={...measure(),scale,x,y};});
 viewport.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;if(pointers.size>1||Math.hypot(e.clientX-startPoint.x,e.clientY-startPoint.y)>7){moved=true;hidePopup();}pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const m=measure(),b=viewport.getBoundingClientRect();scale=gesture.d&&m.d?Math.min(5,Math.max(1,gesture.scale*m.d/gesture.d)):gesture.scale;const factor=scale/gesture.scale;
 x=(gesture.x-(gesture.cx-b.x-b.width/2))*factor+(m.cx-b.x-b.width/2);
 y=(gesture.y-(gesture.cy-b.y-b.height/2))*factor+(m.cy-b.y-b.height/2);draw();});
 function release(e){const region=pressedRegion;if(e.type==='pointerup'&&pointers.size===1&&!moved&&region){showPopup(region,e.pointerType==='touch');}pressedRegion=null;pointers.delete(e.pointerId);gesture=pointers.size?{...measure(),scale,x,y}:null}
 viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);
 viewport.addEventListener('keydown',e=>{if(!['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();stop();if(e.key==='+'||e.key==='=')zoom(scale+.5);if(e.key==='-')zoom(scale-.5);if(e.key==='0'){scale=1;x=y=0}if(e.key==='ArrowLeft')x+=45;if(e.key==='ArrowRight')x-=45;if(e.key==='ArrowUp')y+=45;if(e.key==='ArrowDown')y-=45;draw()});
 root.querySelectorAll('[data-map-quarter]').forEach(region=>region.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showPopup(region);}}));
 // Wheel remains page scrolling; zoom uses controls/keyboard/pinch.
 new ResizeObserver(()=>{if(viewport.clientWidth){stop();draw();placePopup()}}).observe(viewport);
 draw();
})();
