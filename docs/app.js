const launch='2026-09-26';
const fmt=new Intl.DateTimeFormat('da-DK',{day:'numeric',month:'short'});
const datefmt=new Intl.DateTimeFormat('da-DK',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Copenhagen'});
const from=document.getElementById('from'),to=document.getElementById('to');
const source=document.getElementById('source');
let report=null,mode='7';
const datePlus=(date,offset)=>new Date(Date.parse(date+'T12:00:00Z')+offset*86400000).toISOString().slice(0,10);
const number=value=>Number(value||0);
const format=value=>value.toLocaleString('da-DK');
function list(id,items,message){
  const target=document.getElementById(id);
  if(!items.length){target.className='empty';target.textContent=message;return}
  target.className='';
  target.replaceChildren(...items.sort((a,b)=>b.count-a.count).slice(0,5).map(item=>{
    const row=document.createElement('div'),label=document.createElement('span'),count=document.createElement('strong');
    row.className='row';label.textContent=item.label;count.textContent=format(item.count);row.append(label,count);return row;
  }));
}
function combined(days,key){
  const sums=new Map();for(const day of days)for(const item of day[key]||[])sums.set(item.label,(sums.get(item.label)||0)+number(item.count));
  return [...sums].map(([label,count])=>({label,count}));
}
function render(){
  if(!report)return;
  const days=report.days,last=days.at(-1).date;
  let start=mode==='7'?datePlus(last,-6):mode==='30'?datePlus(last,-29):launch,end=last;
  if(start<launch)start=launch;
  document.getElementById('range').classList.toggle('visible',mode==='custom');
  if(mode==='custom'){start=from.value;end=to.value}
  if(start>end){document.getElementById('dates').textContent='Vælg en slutdato efter startdato';return}
  const selected=days.filter(day=>day.date>=start&&day.date<=end);
  const totalDays=days.length;
  document.getElementById('period-note').textContent=
    mode==='custom'?'Valgt periode: '+selected.length+' dage med målinger.':
    totalDays<7?`Der er kun ${totalDays} dage med målinger. Derfor viser 7 dage, 30 dage og siden start de samme tal endnu.`:
    mode==='30'&&totalDays<30?`Der er kun ${totalDays} dage med målinger; 30 dage omfatter derfor hele måleperioden.`:'';
  const sum=key=>selected.reduce((total,day)=>total+number(day[key]),0);
  const views=sum('views'),clicks=sum('clicks'),visits=selected.every(day=>day.visits!==null)?sum('visits'):null;
  document.getElementById('dates').textContent=datefmt.format(new Date(start+'T12:00:00Z'))+' – '+datefmt.format(new Date(end+'T12:00:00Z'));
  document.getElementById('views').textContent=format(views);
  document.getElementById('clicks').textContent=format(clicks);
  document.getElementById('visits').textContent=visits===null?'—':format(visits);
  document.getElementById('visit-detail').textContent=visits===null?'Kan ikke opgøres sikkert fra dette udtræk':'Besøg på GF27 i den valgte periode';
  document.getElementById('rate').textContent=visits?Math.round(clicks/visits*100)+' %':'—';
  const max=Math.max(1,...selected.map(day=>day.views));
  const trend=document.getElementById('trend');trend.replaceChildren(...selected.map(day=>{
    const col=document.createElement('div'),bars=document.createElement('div'),view=document.createElement('span'),click=document.createElement('span'),label=document.createElement('span');
    col.className='barcol';bars.className='bars';view.className='bar'+(day.views?'':' zero');click.className='bar clicks'+(day.clicks?'':' zero');
    view.style.setProperty('--h',day.views?Math.max(9,day.views/max*100)+'%':'0%');click.style.setProperty('--h',day.clicks?Math.max(9,day.clicks/max*100)+'%':'0%');
    view.title=day.views+' sidevisninger';click.title=day.clicks+' klik';label.className='day';label.textContent=fmt.format(new Date(day.date+'T12:00:00Z'));
    bars.append(view,click);col.append(bars,label);return col;
  }));
  trend.setAttribute('aria-label',selected.map(day=>`${day.date}: ${day.views} sidevisninger, ${day.clicks} klik`).join('; '));
  list('sections',combined(selected,'section'),'Ingen sektionsklik registreret i den valgte periode.');
  list('faq',combined(selected,'faq'),'Ingen FAQ-åbninger registreret i den valgte periode.');
  list('scroll',combined(selected,'scroll'),'Ingen scrollhændelser registreret i den valgte periode.');
  const span=selected.length,priorEnd=datePlus(start,-1),priorStart=datePlus(start,-span);
  const previous=days.filter(day=>day.date>=priorStart&&day.date<=priorEnd);
  const comparison=document.getElementById('comparison');
  if(!span||previous.length!==span){comparison.textContent='Der er endnu ikke en fuld forrige periode at sammenligne med.'}
  else{
    const prev=previous.reduce((total,day)=>total+number(day.views),0),delta=views-prev;
    comparison.textContent=`${format(views)} sidevisninger mod ${format(prev)} i den foregående periode (${delta>=0?'+':''}${format(delta)}).`;
  }
  source.href='https://dp.matomo.cloud/index.php?idSite=3&period=day&date=today&action=index&module=CoreHome#?period=range&date='+start+','+end+'&segment=pageUrl%3D%40gf27-generalforsamling&idSite=3&category=Dashboard_Dashboard&subcategory=2';
}
async function init(){
  try{
    let data=window.GF27_DATA;
    if(!data){const response=await fetch('data.json',{cache:'no-store'});if(!response.ok)throw Error();data=await response.json()}if(!Array.isArray(data.days)||!data.days.length)throw Error();
    report=data;report.days.sort((a,b)=>a.date.localeCompare(b.date));
    const last=report.days.at(-1).date;
    from.min=to.min=launch;from.max=to.max=last;from.value=launch;to.value=last;
    const snapshot=data.source!=='matomo';
    document.getElementById('status').textContent=(snapshot?'Kontrolleret udtræk · ':'Matomo · opdateret ')+datefmt.format(new Date(data.updatedAt));
    document.getElementById('notice').textContent=snapshot?'Tallene er et kontrolleret udtræk fra 26.–28. september 2026. Automatisk opdatering afventer Matomo-adgang til GitHub.':'Aggregerede Matomo-tal opdateres via GitHub. Klikrate er antal klik pr. besøg; flere klik i samme besøg kan give over 100 %. En gennemført tilmelding måles ikke her.';
    render();
  }catch{document.getElementById('notice').textContent='Data kan ikke hentes. Prøv at genindlæse siden.'}
}
document.querySelectorAll('[data-period]').forEach(button=>button.addEventListener('click',()=>{
  mode=button.dataset.period;document.querySelectorAll('[data-period]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));render();
}));
[from,to].forEach(input=>input.addEventListener('change',render));
init();
