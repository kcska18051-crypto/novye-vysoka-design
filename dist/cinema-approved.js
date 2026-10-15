(() => {
 const track=document.querySelector('.cinema-track');
 if(!track)return;
 const cards=[...track.querySelectorAll('.cinema-card')];
 const prev=document.querySelector('[data-cinema-prev]'),next=document.querySelector('[data-cinema-next]');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let selected=0,scrollTimer,programmatic=false;
 const select=(index,scroll=true)=>{
   selected=Math.max(0,Math.min(index,cards.length-1));
   cards.forEach((card,i)=>{card.classList.toggle('is-selected',i===selected);if(i===selected)card.setAttribute('aria-current','true');else card.removeAttribute('aria-current')});
   prev.disabled=selected===0;next.disabled=selected===cards.length-1;
   if(scroll){programmatic=true;track.scrollTo({left:cards[selected].offsetLeft-cards[0].offsetLeft,behavior:reduced.matches?'auto':'smooth'});clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{programmatic=false},900);}
 };
 cards.forEach((card,i)=>card.addEventListener('click',e=>{
   if(!e.target.closest('.cinema-play') && !(e.detail===0 && i===selected)){e.preventDefault();e.stopImmediatePropagation();select(i)}
   else select(i,false);
 },true));
 prev.addEventListener('click',()=>select(selected-1));
 next.addEventListener('click',()=>select(selected+1));
 track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(selected+(e.key==='ArrowRight'?1:-1));cards[selected].focus({preventScroll:true})}});
 track.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{
   if(programmatic){programmatic=false;return;}
   const max=track.scrollWidth-track.clientWidth;
   const index=cards.reduce((best,card,i)=>Math.abs(Math.min(max,card.offsetLeft-cards[0].offsetLeft)-track.scrollLeft)<Math.abs(Math.min(max,cards[best].offsetLeft-cards[0].offsetLeft)-track.scrollLeft)?i:best,0);
   select(index,false);
 },180)},{passive:true});
 select(0,false);
})();
