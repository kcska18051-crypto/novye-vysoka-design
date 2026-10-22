(() => {
  const root=document.querySelector('.hero-preview');
  if(!root)return;
  const choices=[
    {src:'assets/forest-v2/hero.webp',alt:'Образ загородного дома среди сосен у воды'},
    {src:'assets/client-october/hero-river-natural-v2.webp',alt:'Панорама леса и Волги на фотографии клиента с лёгкой цветокоррекцией.'},
    {src:'assets/client-october/hero-plots-natural-v2.webp',alt:'Участки, дорога и соседние дома у леса. Фотография клиента с ретушью строительного мусора.'},
    {src:'assets/client-october/hero-autumn-road-v4.webp',desktop:'assets/client-october/hero-autumn-road-desktop-fast.webp',alt:'Осенняя дорога среди сосен с солнечным лучом. Фотография клиента с тёплой цветокоррекцией.'}
  ];
  const buttons=[...root.querySelectorAll('[data-hero-option]')];
  let current=0,version=0;
  let visible=root.querySelector('.hero-image');
  visible.classList.add('hero-option-image');
  async function choose(index,force=false){
    if(index===current&&!force)return;
    const request=++version;
    const next=new Image();
    next.src=choices[index].desktop&&matchMedia('(min-width:761px)').matches?choices[index].desktop:choices[index].src;
    next.alt=choices[index].alt;
    next.className='hero-image hero-option-image';
    next.style.opacity='0';
    try{await next.decode();}catch{return;}
    if(request!==version)return;
    const previous=visible;
    root.insertBefore(next,root.querySelector('.hero-shade'));
    void next.offsetWidth;
    next.style.opacity='1';previous.style.opacity='0';
    visible=next;current=index;root.dataset.heroChoice=String(index);
    buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    setTimeout(()=>previous.remove(),matchMedia('(prefers-reduced-motion:reduce)').matches?0:450);
  }
  buttons.forEach((b,i)=>b.addEventListener('click',()=>choose(i)));
  matchMedia('(min-width:761px)').addEventListener('change',()=>{if(choices[current].desktop)choose(current,true)});
  const requested=Number(new URLSearchParams(location.search).get('hero'));
  if(requested>=1&&requested<=choices.length)choose(requested-1);
})();
