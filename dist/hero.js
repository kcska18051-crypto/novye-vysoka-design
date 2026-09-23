'use strict';
(() => {
  const video = document.getElementById('hero-video');
  const toggle = document.getElementById('hero-video-toggle');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let userPaused = false;
  let resumeOnVisible = false;
  const staticOnly = () => motion.matches || Boolean(connection?.saveData) || ['slow-2g','2g'].includes(connection?.effectiveType);
  function label() {
    toggle.textContent = video.paused ? 'Включить видео ▷' : 'Пауза Ⅱ';
    toggle.setAttribute('aria-label',video.paused ? 'Включить фоновое видео' : 'Приостановить фоновое видео');
  }
  function stopForPreference() {
    if (!staticOnly()) return;
    video.pause(); video.removeAttribute('src'); video.load();
    video.classList.remove('is-playing'); toggle.hidden=true;
  }
  async function start() {
    if(staticOnly() || document.hidden) return;
    video.muted=true;
    video.src=matchMedia('(max-width:760px)').matches ? 'hero-mobile.mp4' : 'hero-desktop.mp4';
    try { await video.play(); toggle.hidden=false; } catch { video.classList.remove('is-playing'); toggle.hidden=false; label(); }
  }
  video.addEventListener('playing',()=>{video.classList.add('is-playing');label();});
  video.addEventListener('pause',label);
  video.addEventListener('error',()=>{video.classList.remove('is-playing');toggle.hidden=true;});
  toggle.addEventListener('click',async()=>{if(video.paused){userPaused=false;try{await video.play();}catch{video.classList.remove('is-playing');}}else{userPaused=true;video.pause();}label();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){resumeOnVisible=!video.paused;video.pause();}else if(!video.getAttribute('src')){start();}else if(resumeOnVisible&&!userPaused&&!staticOnly()){video.play().catch(()=>{});}});
  motion.addEventListener('change',stopForPreference);
  connection?.addEventListener('change',stopForPreference);
  window.addEventListener('load',()=>{if('requestIdleCallback' in window)requestIdleCallback(start,{timeout:1500});else setTimeout(start,250);},{once:true});
  const benefits=document.querySelector('.hero-benefits');
  const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){benefits.classList.add('is-visible');observer.disconnect();}},{threshold:.1});
  observer.observe(benefits);
})();
