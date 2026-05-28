(function(){
var DM=new URLSearchParams(window.location.search).get('demo')==='1'||localStorage.getItem('fin_demo_mode')==='1';
window.DEMO_MODE = DM;
if(!DM)return;
function ms(date,ti,st,a,r,au,op,la,nn,op2,tu,note){var ln=a+r+au,lu=op,ne=ti+st-ln-lu;var d=new Date(date),df=d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear();return{date:date,dateFi:df,stocks:[],accounts:[],totals:{tilit:ti,stocks:st,lainat:ln,luotot:lu,lapset:la,netto:ne,tulotili:tu,opvisa:op,tili2:ti-tu,nordnet:nn,op:op2,ssij:st-nn-op2,asunto:a,remontti:r,auto:au},note:note||''};}
var S=[
ms('2025-01-31',3240,18400,9800,4200,5100,1200,3800,14200,2800,2100,'Tammikuu'),
ms('2025-06-30',4100,22800,9010,3900,4700,760,3920,17500,3600,2900,'Lomaraha'),
ms('2025-12-31',5200,26100,8050,3540,4220,2100,4050,20000,4200,4000,'Joulu'),
ms('2026-03-31',4020,27200,7570,3360,3980,1150,4110,20800,4400,2800,'Veronpalautus'),
ms('2026-05-27',3420,27500,7250,3240,3820,1879,4150,21100,4400,2200,'Tama kk')
];
var A={tulotili:2200,elatustili:450,tavoite:620,spankki:150,opvisa:1879,asunto:7250,remontti:3240,autolaina:3820,lapset:4150};
var SH={'AMZN':8,'AAPL':15,'LLY':3,'FORTUM.HE':200,'SXR8.DE':12,'MANDA.HE':150,'NDA-FI.HE':180,'NVO':6,'OUT1V.HE':400};
function inject(){if(typeof snaps!='undefined')window.snaps=S.slice();if(typeof accs!='undefined')Object.assign(window.accs,A);if(typeof shares!='undefined')Object.assign(window.shares,SH);}
function badge(){if(document.getElementById('demo-badge'))return;var b=document.createElement('div');b.id='demo-badge';b.textContent='DEMO';b.style.cssText='position:fixed;bottom:16px;right:16px;background:rgba(255,193,0,.15);border:1px solid rgba(255,193,0,.4);color:#ffc300;font-family:monospace;font-size:11px;font-weight:700;padding:5px 10px;border-radius:6px;z-index:9999';document.body.appendChild(b);}
function init(){badge();inject();if(typeof supaWrite!='undefined')window.supaWrite=function(){return Promise.resolve(true);};if(typeof saveState!='undefined')window.saveState=function(){return Promise.resolve();};if(typeof loadState!='undefined')window.loadState=async function(){window.stateLoaded=true;inject();};}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
window.enableDemoMode=function(){localStorage.setItem('fin_demo_mode','1');location.reload();};
window.disableDemoMode=function(){localStorage.removeItem('fin_demo_mode');location.reload();};
})();
