import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {default:app}=await import(pathToFileURL(process.cwd()+'/dist/server/index.js'));
const original=globalThis.fetch;
globalThis.fetch=async(_url,options)=>{
  const args=new URLSearchParams(options.body);
  assert.equal(options.headers.authorization,'Bearer synthetic-token-123456789');
  assert.equal(args.has('token_auth'),false);
  let data;
  switch(args.get('method')){
    case 'VisitsSummary.get': data={nb_visits:2,nb_uniq_visitors:2};break;
    case 'Actions.getPageUrls': data=args.get('period')==='day'?{'2026-09-26':[{label:'gf27-generalforsamling',nb_hits:2}]}:[{label:'gf27-generalforsamling',nb_hits:2},{label:'unrelated',nb_hits:70}];break;
    case 'Events.getCategory': data=args.get('period')==='day'?{'2026-09-26':[{label:'GF27',subtable:[{label:'Registration click',nb_events:2}]}]}:[{label:'GF27',nb_events:2,idsubdatatable:12},{label:'Kursus',nb_events:100}];break;
    case 'Events.getActionFromCategoryId': data=[{label:'Registration click',nb_events:2}];break;
    default: throw Error('Unexpected API method: '+args.get('method'));
  }
  return new Response(JSON.stringify(data),{status:200});
};
try{
  const result=await app.fetch(new Request('https://example.com/api/gf27?from=2026-09-26&to=2026-09-26',{headers:{authorization:'Bearer synthetic-token-123456789'}}),{});
  const body=await result.json();
  assert.equal(result.status,200);
  assert.deepEqual([body.visits,body.visitors,body.views,body.clicks,body.daily[0].clicks],[2,2,2,2,2]);
  const noToken=await app.fetch(new Request('https://example.com/api/gf27?from=2026-09-26&to=2026-09-26'),{});
  assert.equal(noToken.status,401);
  console.log('Report parsing and OAuth credential gate verified');
}finally{globalThis.fetch=original}
