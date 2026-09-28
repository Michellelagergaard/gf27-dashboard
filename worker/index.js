const page = __DASHBOARD_HTML__;

const ORIGIN = 'https://dp.matomo.cloud/index.php';
const CALLBACK = 'https://gf27-aktivitetsdashboard.dansk-psykol-5476.chatgpt.site/oauth/callback';
const SEGMENT = 'pageUrl=@gf27-generalforsamling';
const SLUG = 'gf27-generalforsamling';
const firstDay = '2026-09-26';
const json = (data, status=200) => new Response(JSON.stringify(data), {status, headers:{'content-type':'application/json; charset=utf-8','cache-control':'private, max-age=300'}});
const number = x => Number(x || 0);

async function report(token, method, period, date, extra={}) {
  const body = new URLSearchParams({module:'API',method,idSite:'3',period,date,format:'JSON',segment:SEGMENT,filter_limit:'-1',...extra});
  const result=await fetch(ORIGIN,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded','authorization':'Bearer '+token},body});
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
  const header=request.headers.get('authorization')||'';
  if(!/^Bearer [A-Za-z0-9._~+\/-]{16,}$/.test(header))return json({connected:false,reason:'Log på med Matomo for at hente nye tal'},401);
  const url=new URL(request.url), start=url.searchParams.get('from'),end=url.searchParams.get('to');
  const datePattern=/^\d{4}-\d{2}-\d{2}$/;
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Copenhagen',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if(!datePattern.test(start||'')||!datePattern.test(end||'')||start<firstDay||end>today||start>end||dates(start,end).length>366) return json({error:'Ugyldigt datointerval'},400);
  const range=start+','+end, token=header.slice(7);
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
async function token(request,env){
  if(!env.MATOMO_CLIENT_ID)return json({error:'Matomo-klienten er ikke konfigureret'},503);
  if(request.headers.get('origin')!==new URL(CALLBACK).origin)return json({error:'Ugyldig oprindelse'},403);
  if(!(request.headers.get('content-type')||'').startsWith('application/json'))return json({error:'Ugyldigt format'},415);
  if(Number(request.headers.get('content-length')||0)>4096)return json({error:'For stor forespørgsel'},413);
  let payload;try{payload=await request.json()}catch{return json({error:'Ugyldigt indhold'},400)}
  const fields={client_id:env.MATOMO_CLIENT_ID};
  if(payload?.grant_type==='authorization_code' && /^[A-Za-z0-9._~-]{20,128}$/.test(payload.code_verifier||'') && typeof payload.code==='string' && payload.code.length<2048){
    Object.assign(fields,{grant_type:'authorization_code',code:payload.code,code_verifier:payload.code_verifier,redirect_uri:CALLBACK});
  }else if(payload?.grant_type==='refresh_token' && typeof payload.refresh_token==='string' && payload.refresh_token.length<4096){
    Object.assign(fields,{grant_type:'refresh_token',refresh_token:payload.refresh_token});
  }else return json({error:'Ugyldig OAuth-forespørgsel'},400);
  try{
    const response=await fetch('https://dp.matomo.cloud/index.php?module=OAuth2&action=token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams(fields)});
    const result=await response.json();
    if(!response.ok||!result.access_token)return json({error:'Matomo afviste adgangen. Prøv at logge på igen.'},401);
    return json({access_token:result.access_token,refresh_token:result.refresh_token,expires_in:result.expires_in,token_type:result.token_type});
  }catch{return json({error:'Matomo kunne ikke kontaktes'},502)}
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/api/gf27' && request.method==='GET')return data(request,env);
    if(url.pathname==='/api/oauth/config' && request.method==='GET')return json({client_id:env.MATOMO_CLIENT_ID||null,authorize_url:'https://dp.matomo.cloud/index.php?module=OAuth2&action=authorize',redirect_uri:CALLBACK});
    if(url.pathname==='/api/oauth/token' && request.method==='POST')return token(request,env);
    if((url.pathname==='/'||url.pathname==='/oauth/callback') && request.method==='GET')return new Response(page,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer','content-security-policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'"}});
    return new Response('Not found',{status:404});
  }
};
