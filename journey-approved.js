(() => {
 const row=document.querySelector('#life .journey-tabs');
 if(!row)return;
 const mobile=matchMedia('(max-width:760px)');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const sync=()=>{
   if(!mobile.matches)return;
   const tab=row.querySelector('[aria-selected="true"]');
   if(!tab)return;
   const left=tab.offsetLeft-row.offsetLeft;
   if(left<row.scrollLeft||left+tab.offsetWidth>row.scrollLeft+row.clientWidth)
     row.scrollTo({left:Math.max(0,left-(row.clientWidth-tab.offsetWidth)/2),behavior:reduced.matches?'auto':'smooth'});
 };
 new MutationObserver(sync).observe(row,{subtree:true,attributes:true,attributeFilter:['aria-selected']});
 mobile.addEventListener('change',sync);
})();
