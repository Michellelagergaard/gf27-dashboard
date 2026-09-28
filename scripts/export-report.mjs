import { readFile, writeFile } from 'node:fs/promises';

const token = process.env.MATOMO_TOKEN_AUTH;
if (!token) {
  console.log('MATOMO_TOKEN_AUTH is not configured; keeping the dated sample.');
  process.exit(0);
}
const file = new URL('../docs/data.json', import.meta.url);
const origin = 'https://dp.matomo.cloud/index.php';
const segment = 'pageUrl=@gf27-generalforsamling';
const launch = '2026-09-26';
const today = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Copenhagen',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const dates = (start,end) => {const result=[]; for(let d=new Date(start+'T12:00:00Z');d<=new Date(end+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1))result.push(d.toISOString().slice(0,10));return result};
const rows = data => Array.isArray(data)?data:[];
const n = value => Number(value||0);

async function report(method,date,extra={}) {
  const body=new URLSearchParams({module:'API',method,idSite:'3',period:'day',date,format:'JSON',segment,filter_limit:'-1',...extra,token_auth:token});
  const response=await fetch(origin,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  if(!response.ok)throw new Error(`${method} returned HTTP ${response.status}`);
  const result=await response.json();
  if(result?.result==='error')throw new Error(`${method}: Matomo API error`);
  return result;
}
async function oneDay(date) {
  const [visits,pages,categories]=await Promise.all([
    report('VisitsSummary.get',date),
    report('Actions.getPageUrls',date,{flat:'1',filter_pattern:'gf27-generalforsamling'}),
    report('Events.getCategory',date)
  ]);
  const gf=rows(categories).find(row=>row.label==='GF27');
  const actions=gf?.idsubdatatable?rows(await report('Events.getActionFromCategoryId',date,{idSubtable:String(gf.idsubdatatable)})):[];
  const detail={};
  for(const name of ['Section navigation','FAQ open','Scroll depth']){
    const action=actions.find(row=>row.label===name);
    detail[name]=action?.idsubdatatable?rows(await report('Events.getNameFromActionId',date,{idSubtable:String(action.idsubdatatable)})).map(row=>({label:String(row.label||''),count:n(row.nb_events)})):[];
  }
  return {
    date,views:rows(pages).filter(row=>String(row.label||'').toLowerCase().includes('gf27-generalforsamling')).reduce((sum,row)=>sum+n(row.nb_hits),0),
    visits:n(visits.nb_visits),visitors:n(visits.nb_uniq_visitors),
    clicks:actions.filter(row=>row.label==='Registration click').reduce((sum,row)=>sum+n(row.nb_events),0),
    section:detail['Section navigation'],faq:detail['FAQ open'],scroll:detail['Scroll depth']
  };
}

let previous={};
try{previous=JSON.parse(await readFile(file,'utf8'))}catch{}
const existing=new Map((previous.source==='matomo'?previous.days:[]).map(day=>[day.date,day]));
const all=dates(launch,today);
const refresh=new Set(all.slice(-2));
for(const date of all){
  if(!existing.has(date)||refresh.has(date)){
    existing.set(date,await oneDay(date));
    console.log(`Updated aggregate Matomo report for ${date}`);
  }
}
const result={source:'matomo',updatedAt:new Date().toISOString(),days:all.map(date=>existing.get(date))};
await writeFile(file,JSON.stringify(result,null,2)+'\n');
