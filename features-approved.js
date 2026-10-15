(() => {
 const help=document.querySelector('.feature-help');
 if(!help)return;
 const button=help.querySelector('button');
 const tip=help.querySelector('[role="tooltip"]');
 const hover=matchMedia('(hover:hover) and (pointer:fine)');
 let pinned=false, timer;
 const show=()=>{clearTimeout(timer);tip.hidden=false;button.setAttribute('aria-expanded','true');button.setAttribute('aria-describedby',tip.id)};
 const hide=()=>{clearTimeout(timer);pinned=false;tip.hidden=true;button.setAttribute('aria-expanded','false');button.removeAttribute('aria-describedby')};
 help.addEventListener('pointerenter',()=>{if(hover.matches)show()});
 help.addEventListener('pointerleave',()=>{if(hover.matches&&!pinned)timer=setTimeout(hide,180)});
 button.addEventListener('click',()=>{if(pinned){hide()}else{pinned=true;show()}});
 button.addEventListener('focus',show);
 help.addEventListener('focusout',e=>{if(!help.contains(e.relatedTarget)&&!pinned)hide()});
 document.addEventListener('pointerdown',e=>{if(!help.contains(e.target))hide()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
})();
