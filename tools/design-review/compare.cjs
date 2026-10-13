const {chromium}=require('playwright');
const axe=require('axe-core');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const root=path.resolve(__dirname,'../..');
const out=path.join(root,'docs/design-review');
const checks=[]; const scans=[]; const measurements=[]; const errors=[];
const assert=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
const original=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'growth-original-'));
for(const name of ['index.html','styles.css','script.js']) fs.writeFileSync(path.join(original,name),require('node:child_process').execFileSync('git',['show',`a37e645:${name}`],{cwd:root}));
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'); const baseline=url.pathname.startsWith('/original/');
 const name=url.pathname.replace(/^\/original\//,'/').replace(/^\/$/,'/index.html');
 const file=path.resolve(baseline && ['index.html','styles.css','script.js'].includes(name.slice(1))?original:root,'.'+name);
 if(!file.startsWith(root+path.sep)&&!file.startsWith(original+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.webm':'video/webm','.png':'image/png','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 async function scroll(selector,progress=0){await page.evaluate(({selector,progress})=>{const e=document.querySelector(selector);window.scrollTo({top:scrollY+e.getBoundingClientRect().top+progress*Math.max(1,e.offsetHeight-innerHeight),behavior:'instant'});},{selector,progress});await page.waitForTimeout(700);}
 async function scan(name){console.log('scan',name);await page.addScriptTag({content:axe.source});const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));scans.push({name,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:result.incomplete.map(v=>({id:v.id,count:v.nodes.length}))});}
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  await page.setViewportSize({width,height});
  for(const version of ['original','updated']){
   console.log(name,version);
   await page.goto(version==='original'?base+'/original/index.html':base,{waitUntil:'networkidle'});
   await page.waitForTimeout(800);
   await scroll('#hero-shell');
   measurements.push({name,version,stage:'hero',...await page.evaluate(()=>({scrollY,heroHeight:document.querySelector('.hero').clientHeight,heroContent:document.querySelector('.hero-content').getBoundingClientRect().toJSON(),classes:document.documentElement.className}))});
   if(version==='updated'){
    const video=await page.locator('.hero-video').evaluate(v=>({paused:v.paused,time:v.currentTime,ready:v.readyState,fit:getComputedStyle(v).objectFit}));
    assert(name+': visible video plays',!video.paused&&video.time>0&&video.fit==='cover',video);
    await page.waitForTimeout(400);assert(name+': video time advances',await page.locator('.hero-video').evaluate((v,t)=>v.currentTime>t,video.time));
   }
   // Freeze at a common frame solely for reproducible visual comparison.
   await page.locator('.hero-video').evaluate(async v=>{v.pause();v.currentTime=1;await Promise.race([new Promise(r=>v.addEventListener('seeked',r,{once:true})),new Promise(r=>setTimeout(r,2000))]);});
   if(name==='desktop'&&version==='original'&&process.env.EXTRACT_POSTER){
    const poster=await page.locator('.hero-video').evaluate(v=>{const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);return c.toDataURL('image/jpeg',.85).split(',')[1];});
    fs.writeFileSync(path.join(root,'growth_cubes_poster.jpg'),Buffer.from(poster,'base64'));
   }
   await page.screenshot({path:path.join(out,`${name}-${version}-hero.png`)});
   for(const [stage,selector,p] of [['reveal','#reveal-section',.2],['services-start','#h-scroll-shell',0],['services-middle','#h-scroll-shell',.5],['services-end','#h-scroll-shell',1],['timeline','#hww-timeline',.45]]){
    await scroll(selector,p);
    const values=await page.evaluate(()=>({scrollY,heroHeight:document.querySelector('#hero-shell').offsetHeight,revealHeight:document.querySelector('#reveal-section').offsetHeight,mask:document.querySelector('#hero-mask-wrapper').style.maskImage,words:[...document.querySelectorAll('.reveal-word')].map(e=>e.style.getPropertyValue('--p')),servicesHeight:document.querySelector('#h-scroll-shell').offsetHeight,trackTransform:getComputedStyle(document.querySelector('#h-scroll-track')).transform,cardSizes:[...document.querySelectorAll('.h-card')].map(e=>({width:e.offsetWidth,height:e.offsetHeight})),progress:document.querySelector('#hww-progress-bar').style.height,timeline:[...document.querySelectorAll('.hww-step-wrapper')].map(e=>({active:e.classList.contains('is-illuminated'),transform:getComputedStyle(e).transform,opacity:getComputedStyle(e).opacity})),classes:document.documentElement.className,overflow:document.documentElement.scrollWidth>innerWidth}));
    measurements.push({name,version,stage,...values});
    await page.screenshot({path:path.join(out,`${name}-${version}-${stage}.png`)});
    if(version==='updated'){
     assert(name+' '+stage+': no document overflow',!values.overflow);
     assert(name+' '+stage+': default remains animated',!values.classes.includes('motion-paused')&&!values.classes.includes('services-list')&&!values.classes.includes('services-reflow'),values.classes);
     if(stage==='services-middle') assert(name+': horizontal progression',values.trackTransform!=='none'&&values.trackTransform!=='matrix(1, 0, 0, 1, 0, 0)',values.trackTransform);
     if(stage==='timeline') assert(name+': timeline progresses and slides',parseFloat(values.progress)>0&&values.timeline.some(s=>s.active)&&values.timeline.some(s=>!s.active&&s.transform!=='none'),values.timeline);
     if(stage==='reveal') assert(name+': word reveal runs',values.words.some(p=>p!=='0%'),values.words);
    }
   }
   if(version==='updated'){
    await scan(name+'-timeline'); await scroll('#h-scroll-shell');await scan(name+'-services');
    await page.locator('#h-scroll-track').focus();await page.keyboard.press('End');await page.waitForTimeout(300);
    const last=await page.locator('.h-card').last().boundingBox();assert(name+': keyboard reaches last card',last.x>=-1&&last.x+last.width<=width+1,last);
    await page.keyboard.press('Home');await page.waitForTimeout(300);const first=await page.locator('.h-card').first().boundingBox();assert(name+': keyboard returns to first card',first.x>=-1&&first.x+first.width<=width+1,first);
    await page.locator('#services-toggle').click();assert(name+': optional list works',await page.locator('#h-scroll-track').evaluate(e=>getComputedStyle(e).display==='grid'));
    await scan(name+'-list');await page.locator('#services-toggle').click();assert(name+': scrolling view restored',await page.locator('#h-scroll-track').evaluate(e=>getComputedStyle(e).display==='flex'));
    await page.locator('#motion-toggle').focus();await page.keyboard.press('Enter');assert(name+': pause stops all videos',await page.locator('video').evaluateAll(v=>v.every(e=>e.paused)));
    assert(name+': pause disables transitions',await page.locator('.hww-step-wrapper').first().evaluate(e=>getComputedStyle(e).transform==='none'&&getComputedStyle(e).transitionDuration==='0s'));
    await scan(name+'-paused');await page.reload();assert(name+': pause survives reload',await page.locator('html').evaluate(e=>e.classList.contains('motion-paused')));
    await page.locator('#motion-toggle').click();await scroll('#hero-shell');await page.waitForTimeout(600);assert(name+': resume restores playback',await page.locator('.hero-video').evaluate(v=>!v.paused));
    if(width<900){await page.locator('#mobile-menu-toggle').click();await page.locator('#main-nav a').first().focus();await page.keyboard.press('Escape');assert('Mobile menu Escape and focus',await page.locator('#mobile-menu-toggle').evaluate(e=>document.activeElement===e&&e.getAttribute('aria-expanded')==='false'));assert('Closed mobile menu inert',await page.locator('#main-nav').evaluate(e=>e.inert));}
   }
  }
 }
 for(const [name,width,height] of [['narrow',320,800],['landscape',844,390],['reflow',320,256],['tablet',768,1024],['breakpoint-mobile',900,900],['breakpoint-desktop',901,900]]){
  await page.setViewportSize({width,height});await page.goto(base,{waitUntil:'networkidle'});await scroll('#h-scroll-shell');await scan(name);
  const layout=await page.evaluate(()=>({classes:document.documentElement.className,overflow:document.documentElement.scrollWidth>innerWidth,cards:[...document.querySelectorAll('.h-card')].map(e=>({height:e.offsetHeight,width:e.offsetWidth,scroll:e.scrollHeight}))}));assert(name+': no overflow',!layout.overflow,layout);
  assert(name+': reveal fits viewport or normal flow',await page.evaluate(()=>document.documentElement.classList.contains('reveal-reflow')||document.querySelector('#reveal-text').scrollHeight+48<=document.querySelector('.reveal-sticky').clientHeight));measurements.push({name,...layout});
 }
 await page.setViewportSize({width:1440,height:900});await page.goto(base,{waitUntil:'networkidle'});await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);assert('Live reduced motion pauses videos',await page.locator('video').evaluateAll(v=>v.every(e=>e.paused)));await scan('reduced-motion');await page.screenshot({path:path.join(out,'reduced-motion.png')});await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(300);assert('Live no-preference restores motion',await page.locator('html').evaluate(e=>!e.classList.contains('motion-paused')));
 await page.emulateMedia({forcedColors:'active'});assert('Forced colors reveal remains visible',await page.locator('.reveal-word').first().evaluate(e=>getComputedStyle(e).color!=='rgba(0, 0, 0, 0)'));await page.emulateMedia({forcedColors:'none'});
 await page.setViewportSize({width:390,height:844});await page.goto(base,{waitUntil:'networkidle'});await page.addStyleTag({content:'* {line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important;} p {margin-bottom:2em !important;}'});await scroll('#h-scroll-shell');await scan('text-spacing');assert('Text spacing services fit or reflow',await page.evaluate(()=>document.documentElement.classList.contains('services-reflow')||document.querySelector('#h-scroll-track').offsetTop+Math.max(...[...document.querySelectorAll('.h-card')].map(e=>e.offsetHeight))<=document.querySelector('.h-scroll-sticky').clientHeight));
 await page.goto(base,{waitUntil:'networkidle'});await page.setViewportSize({width:1440,height:900});await page.evaluate(()=>{const all=[...document.querySelectorAll('body *')];const sizes=all.map(e=>getComputedStyle(e).fontSize);all.forEach((e,i)=>e.style.fontSize=parseFloat(sizes[i])*2+'px');});await scroll('#h-scroll-shell');await scan('text-200-percent');await page.screenshot({path:path.join(out,'text-200-percent.png')});assert('Enlarged text has fitting services fallback',await page.locator('html').evaluate(e=>e.classList.contains('services-reflow')));
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const fallback=await nojs.newPage();await fallback.goto(base);assert('No JS: static services',await fallback.locator('#h-scroll-track').evaluate(e=>getComputedStyle(e).display==='grid'));assert('No JS: navigation visible',await fallback.locator('#main-nav').isVisible());await nojs.close();
 await page.setViewportSize({width:1440,height:900});await page.goto(base,{waitUntil:'networkidle'});await scroll('#hero-shell');await page.keyboard.press('Tab');assert('First Tab reaches skip link',await page.locator('.skip-link').evaluate(e=>e===document.activeElement));await page.keyboard.press('Enter');assert('Skip link focuses main',await page.locator('main').evaluate(e=>e===document.activeElement));
 await page.locator('#contact-form button').click();assert('Contact errors and focus preserved',await page.locator('#contact-name').evaluate(e=>e===document.activeElement&&e.getAttribute('aria-invalid')==='true'));
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();assert('Reduced motion on first load never starts video',await page.locator('video').evaluateAll(v=>v.every(e=>e.paused)));await page.emulateMedia({reducedMotion:'no-preference'});
 assert('No JavaScript errors',!errors.length,errors);
 const summary={timestamp:new Date().toISOString(),sourceHashes:Object.fromEntries(['index.html','styles.css','script.js'].map(name=>[name,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex')])),reference:'a37e645',browser:browser.version(),checks,scans,measurements};fs.writeFileSync(path.join(out,'comparison.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify({checks:checks.length,failed:checks.filter(c=>!c.pass),violations:scans.filter(s=>s.violations.length)},null,2));
 await browser.close();server.close();if(checks.some(c=>!c.pass)||scans.some(s=>s.violations.length))process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
