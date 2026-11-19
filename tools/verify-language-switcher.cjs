const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root=path.resolve(__dirname,'..');
const base='https://kcska18051-crypto.github.io/novye-vysoka-design/';
const destinations={en:'https://kcska18051-crypto.github.io/novye-vysoka-en/', 'zh-CN':'https://kcska18051-crypto.github.io/novye-vysoka-zh/'};
const out=path.join(root,'tmp/language-switcher-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  if(!process.env.CHECK_LIVE)await page.route(base+'**',async route=>{
   const relative=new URL(route.request().url()).pathname.slice(new URL(base).pathname.length)||'index.html',file=path.join(root,'dist',relative);
   if(fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({path:file});
   return route.continue();
  });
  await page.goto(base,{waitUntil:'networkidle'});
  assert.equal(await page.locator('.site-header .language-switcher a').count(),2,'Both language links must be in the header');
  for(const [language,url]of Object.entries(destinations)){
   const link=page.locator(`.language-switcher a[hreflang="${language}"]`);
   assert.equal(await link.getAttribute('href'),url);assert.equal(await link.getAttribute('lang'),language);
  }
  for(const width of [320,360,390,430,768,1024,1180,1280,1366,1440,1920]){
   await page.setViewportSize({width,height:900});
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const bounds=await page.evaluate(()=>{
    const header=document.querySelector('.site-header'),items=[...header.children].filter(e=>getComputedStyle(e).display!=='none').map(e=>{const r=e.getBoundingClientRect();return{class:e.className,left:r.left,right:r.right,top:r.top,bottom:r.bottom}});
    const links=[...header.querySelectorAll('.language-switcher a')].map(e=>{const r=e.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}});
    return{viewport:innerWidth,scroll:document.documentElement.scrollWidth,items,links};
   });
   assert.ok(bounds.scroll<=width+1,'Page overflow at '+width);
   for(const b of bounds.links){assert.ok(b.left>=0&&b.right<=width,'Language outside viewport '+width);assert.ok(b.width>=40&&b.height>=40,'Small target at '+width);}
   for(let i=1;i<bounds.items.length;i++)assert.ok(bounds.items[i-1].right<=bounds.items[i].left+1,'Header overlap '+width+' '+JSON.stringify(bounds.items));
   if([320,390,1440].includes(width)){
    await page.evaluate(async()=>{
     const background=getComputedStyle(document.querySelector('.hero-feature-scene')).backgroundImage;
     const url=background.match(/url\(["']?(.*?)["']?\)/)?.[1];
     if(url){const image=new Image();image.src=url;await image.decode();}
    });
    await page.screenshot({path:path.join(out,width+'-header.png')});
   }
   console.log('PASS layout '+width);
  }
  await page.setViewportSize({width:320,height:900});await page.locator('.menu-button').click();assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'),'true');
  assert.equal(await page.locator('.mobile-menu').isVisible(),true);await page.locator('.menu-button').click();
  await page.evaluate(()=>scrollTo(0,600));assert.equal(await page.locator('.language-switcher').isVisible(),true);await page.evaluate(()=>scrollTo(0,0));
  for(const [language,url]of Object.entries(destinations)){
   const link=page.locator(`.language-switcher a[hreflang="${language}"]`);await link.focus();
   await Promise.all([page.waitForURL(url),page.keyboard.press('Enter')]);
   assert.equal(await page.locator('html').getAttribute('lang'),language==='en'?'en':'zh-CN');
   console.log('PASS keyboard navigation '+language);
   await page.goto(base,{waitUntil:'networkidle'});
  }
  assert.deepEqual(errors,[],'JavaScript errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
