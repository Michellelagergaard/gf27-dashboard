const page = __DASHBOARD_HTML__;

const ORIGIN = 'https://dp.matomo.cloud/index.php';
const SEGMENT = 'pageUrl=@gf27-generalforsamling';
const SLUG = 'gf27-generalforsamling';
const firstDay = '2026-09-26';
const json = (data, status=200) => new Response(JSON.stringify(data), {status, headers:{'content-type':'application/json; charset=utf-8','cache-control':'private, max-age=300'}});
const number = x => Number(x || 0);

async function report(token, method, period, date, extra={}) {
  const body = new URLSearchParams({module:'API',method,idSite:'3',period,date,format:'JSON',segment:SEGMENT,filter_limit:'-1',...extra,token_auth:token});
  const result=await fetch(ORIGIN,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  if(!result.ok) throw new Error('Matomo returnerede HTTP '+result.status);
  const data=await result.json();
  if(data?.result==='error') throw new Error('Matomo kunne ikke hente rapporten');
  return data;
}
function rows(value){return Array.isArray(value)?value:[]}
function pageViews(value){return rows(value).filter(r=>String(r.label||'').toLowerCase().includes(SLUG)).reduce((n,r)=>n+number(r.nb_hits),0)}
function gfCategory(value){return rows(value).find(r=>r.label==='GF27')}
function dayMap(value,start,end){
  if(value && !Array.isArray(value) && Object.hasOwn(value,start))return value;
  return start===end ? {[start]:value} : value && !Array.isArray(value) ? value : {};
}
function dates(start,end){
  const list=[];let d=new Date(start+'T12:00:00Z');const last=new Date(end+'T12:00:00Z');
  while(d<=last && list.length<366){list.push(d.toISOString().slice(0,10));d.setUTCDate(d.getUTCDate()+1)}
  return list;
}
async function data(request,env){
  if(!env.MATOMO_TOKEN) return json({connected:false,reason:'Matomo-adgangen mangler'},503);
  const url=new URL(request.url), start=url.searchParams.get('from'),end=url.searchParams.get('to');
  const datePattern=/^\d{4}-\d{2}-\d{2}$/;
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Copenhagen',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if(!datePattern.test(start||'')||!datePattern.test(end||'')||start<firstDay||end>today||start>end||dates(start,end).length>366) return json({error:'Ugyldigt datointerval'},400);
  const range=start+','+end, token=env.MATOMO_TOKEN;
  try{
    const [visits,pages,categories,dayPages,dayCategories]=await Promise.all([
      report(token,'VisitsSummary.get','range',range),
      report(token,'Actions.getPageUrls','range',range,{flat:'1',filter_pattern:SLUG}),
      report(token,'Events.getCategory','range',range),
      report(token,'Actions.getPageUrls','day',range,{flat:'1',filter_pattern:SLUG}),
      report(token,'Events.getCategory','day',range,{expanded:'1',secondaryDimension:'eventAction'})
    ]);
    const category=gfCategory(categories);
    const actions=category?.idsubdatatable ? await report(token,'Events.getActionFromCategoryId','range',range,{idSubtable:String(category.idsubdatatable)}):[];
    const actionNames={};
    await Promise.all(rows(actions).filter(a=>['FAQ open','Section navigation','Scroll depth'].includes(a.label)).map(async action=>{
      if(action.idsubdatatable)actionNames[action.label]=rows(await report(token,'Events.getNameFromActionId','range',range,{idSubtable:String(action.idsubdatatable)}));
    }));
    const pageDays=dayMap(dayPages,start,end),eventDays=dayMap(dayCategories,start,end);
    const daily=dates(start,end).map(d=>{
      const gf=gfCategory(eventDays[d]);
      const actionRows=gf?.subtable;
      return {date:d,views:pageViews(pageDays[d]),clicks:Array.isArray(actionRows)?rows(actionRows).filter(a=>a.label==='Registration click').reduce((n,a)=>n+number(a.nb_events),0):null};
    });
    const clicks=rows(actions).filter(a=>a.label==='Registration click').reduce((n,a)=>n+number(a.nb_events),0);
    const items=name=>rows(actionNames[name]).map(x=>({label:String(x.label||''),count:number(x.nb_events)}));
    return json({connected:true,from:start,to:end,updatedAt:new Date().toISOString(),visits:number(visits.nb_visits),visitors:number(visits.nb_uniq_visitors),views:pageViews(pages),clicks,daily,section:items('Section navigation'),faq:items('FAQ open'),scroll:items('Scroll depth')});
  }catch(e){return json({connected:false,reason:e.message||'Matomo kunne ikke hentes'},502)}
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/api/gf27' && request.method==='GET')return data(request,env);
    if(url.pathname==='/' && request.method==='GET')return new Response(page,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
    return new Response('Not found',{status:404});
  }
};
