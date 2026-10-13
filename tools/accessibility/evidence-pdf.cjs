const {chromium}=require('playwright');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  const page=await browser.newPage();
  await page.goto(pathToFileURL(path.resolve('docs/accessibility/DYPA_EVIDENCE_PACKAGE.html')).href);
  await page.pdf({path:'docs/accessibility/DYPA_EVIDENCE_PACKAGE.pdf',format:'A4',preferCSSPageSize:true,printBackground:true,tagged:true,outline:true});
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
