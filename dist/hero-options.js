(() => {
  const root=document.querySelector('.hero-preview');
  if(!root)return;
  const choices=[
    {src:'assets/forest-v2/hero.webp',alt:'Образ загородного дома среди сосен у воды'},
    {src:'assets/client-october/hero-river-sunset.webp',alt:'Реальная панорама леса и Волги. Закатная обработка фотографии клиента.'},
    {src:'assets/client-october/hero-plots-sunset.webp',alt:'Реальные участки, дорога и соседние дома у леса. Закатная обработка фотографии клиента.'}
  ];
  const buttons=[...root.querySelectorAll('[data-hero-option]')];
  let current=0,version=0;
  let visible=root.querySelector('.hero-image');
  visible.classList.add('hero-option-image');
  async function choose(index){
    if(index===current)return;
    const request=++version;
    const next=new Image();
    next.src=choices[index].src;
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
  const requested=Number(new URLSearchParams(location.search).get('hero'));
  if(requested>=1&&requested<=3)choose(requested-1);
})();
