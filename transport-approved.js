(() => {
 const root=document.querySelector('.transport-section');if(!root)return;
 const data=window.TRIP_PLANNER_DATA,state={city:'moscow',mode:'bus'};
 const panel=root.querySelector('.transport-result'),list=root.querySelector('[data-route-steps]');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');let animations=[];
 function render(animate=true){
  animations.forEach(a=>a.cancel());animations=[];const oldHeight=panel.getBoundingClientRect().height;
  root.querySelectorAll('[data-route-options]').forEach(group=>group.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(state[group.dataset.routeOptions]===b.dataset.value))));
  const route=data.routes[state.city+':'+state.mode];
  root.querySelector('[data-route-heading]').textContent=data.cities[state.city]+' → Новые Высока';
  list.replaceChildren();
  route.steps.forEach(step=>{const li=document.createElement('li'),title=document.createElement('strong'),p=document.createElement('p');title.textContent=step.title;p.textContent=step.text;li.append(title,p);if(step.time){const time=document.createElement('span');time.className='trip-time';time.textContent=step.time;li.append(time)}list.append(li)});
  const total=root.querySelector('[data-route-total]');total.hidden=!Number.isFinite(route.totalMinutes);total.textContent=total.hidden?'':'Общее время: '+route.totalMinutes+' мин';
  root.querySelector('[data-travel-note]').textContent=route.note;root.querySelector('[data-travel-note]').hidden=!route.note;
  const alt=root.querySelector('[data-route-alternative]');alt.hidden=!route.alternative;
  const link=root.querySelector('[data-route-link]');link.href='https://yandex.ru/maps/?'+new URLSearchParams({rtext:data.cities[state.city]+', Россия~'+data.destination.address,rtt:state.mode==='car'?'auto':'mt'});
  if(animate&&!reduced.matches){const newHeight=panel.getBoundingClientRect().height;animations.push(panel.animate([{height:oldHeight+'px'},{height:newHeight+'px'}],{duration:280,easing:'ease-out'}));[...list.children].forEach((li,i)=>animations.push(li.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,delay:i*25,easing:'ease-out',fill:'backwards'})));}
 }
 const icons={car:'M5 16H3V10l2-5h14l2 5v6h-2M5 16h14M5 10h14M6 16v3M18 16v3M6 13h1M17 13h1',bus:'M5 17V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12H5Zm0-7h14M8 3v7M5 17v3M19 17v3M8 14h1M15 14h1',train:'M6 16V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11l-3 3H9l-3-3Zm0-7h12M9 13h.01M15 13h.01M9 19l-3 3M15 19l3 3'};
 function transportIcon(type){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.5');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');path.setAttribute('d',icons[type]);svg.append(path);return svg;}
 for(const [key,options] of Object.entries({city:data.cities,mode:data.modes})){const group=root.querySelector('[data-route-options="'+key+'"]');for(const [value,label] of Object.entries(options)){const button=document.createElement('button');button.type='button';button.dataset.value=value;button.textContent=label;if(key==='mode')button.prepend(transportIcon(value));button.addEventListener('click',()=>{if(state[key]===value)return;state[key]=value;render()});group.append(button)}}
 root.querySelector('[data-route-alternative]').addEventListener('click',()=>{state.mode='bus';render();root.querySelector('[data-value="bus"]').focus({preventScroll:true})});
 render(false);
})();
