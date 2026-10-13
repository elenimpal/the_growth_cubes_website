const fs = require('node:fs');
const path = require('node:path');
const rgb = hex => hex.match(/\w\w/g).map(v => parseInt(v,16));
const mix=(fg,bg,a)=>fg.map((v,i)=>v*a+bg[i]*(1-a));
const lum=c=>c.map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
const ink=rgb('35111b'),cream=rgb('f4f0ea'),white=rgb('ffffff'),glass=mix(cream,ink,.05);
const checks=[
 ['Hero subtitle over white video plus original tint and text scrim',cream,mix(ink,mix(ink,white,.35),.5),4.5],
 ['Header over white video or cream section',white,mix(ink,white,.75),4.5],
 ['Unrevealed words',rgb('b8a5ac'),ink,4.5],
 ['Revealed words',cream,ink,4.5],
 ['Timeline description without opacity dimming',mix(cream,glass,.9),glass,4.5],
 ['Timeline step numbers',rgb('dfb8c1'),glass,4.5],
 ['Services text at original 85% opacity',mix(cream,ink,.85),ink,4.5],
 ['Services text over brightest hover spotlight',mix(cream,mix(cream,ink,.12),.85),mix(cream,ink,.12),4.5],
 ['Pause control text',cream,ink,4.5],
 ['Burgundy focus outline on cream gallery',ink,cream,3]
].map(([name,foreground,background,minimum])=>({name,ratio:ratio(foreground,background),minimum,pass:ratio(foreground,background)>=minimum}));
fs.writeFileSync(path.resolve(__dirname,'../../docs/design-review/contrast.json'),JSON.stringify({method:'WCAG sRGB relative luminance with conservative white video frame and layered alpha compositing. Validates color bounds, not every rendered/masked animation frame.',checks},null,2));
console.log(checks.map(c=>`${c.name}: ${c.ratio.toFixed(2)} ${c.pass?'PASS':'FAIL'}`).join('\n'));
if(checks.some(c=>!c.pass))process.exitCode=1;
