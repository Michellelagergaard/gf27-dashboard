# GF27 · aktivitetsdashboard

Dashboard for aggregeret aktivitet på [GF27-siden](https://www.dp.dk/fag-og-politik/gf27-generalforsamling/): sidevisninger, besøg, klik mod tilmelding, FAQ, sektioner, scroll og periodevalg.

## Se dashboardet

Den delbare GitHub-version ligger i [`docs/index.html`](docs/index.html) og læser [`docs/data.json`](docs/data.json). Repositoryet er privat. GitHub Pages er endnu ikke slået til: GitHub kræver, at dette repository gøres offentligt eller kontoen opgraderes. Et almindeligt GitHub Pages-site er offentligt tilgængeligt på internettet, selv hvis kildekoden ligger i et privat repository. Privat Pages-adgang til udvalgte kollegaer kræver en organisation på GitHub Enterprise Cloud.

`docs/data.json` indeholder et kontrolleret udtræk fra 26.–28. september 2026, tydeligt mærket i dashboardet. Det er ikke et løbende opdateret talgrundlag endnu.

## Daglig opdatering

Workflowet [Update GF27 dashboard data](.github/workflows/update-dashboard.yml) kan hente aggregerede rapporter fra Matomo og opdatere `docs/data.json` dagligt. Det kræver en særskilt Matomo API-token med læseadgang til site 3, gemt som repository secret `MATOMO_TOKEN_AUTH` under GitHub Settings → Secrets and variables → Actions. Tokenet må ikke skrives i filer, issues eller kommentarer. Workflowet kan også startes manuelt efter opsætning. Uden secret bevarer det det daterede udtræk.

Rapporter filtreres til GF27-sidebesøg, og kun sammenfattede tal og hændelsesnavne skrives til datafilen. Klik mod tilmelding betyder ikke gennemført tilmelding. Data fra opsætningstesten 25. september udelades.

## Adgang og offentliggørelse

Det private repository kan deles med navngivne GitHub-kollaboratører. GitHub Pages kan ikke begrænses til disse kollaboratører på denne personlige konto. Beslut derfor, om de aggregerede tal må være offentligt tilgængelige, før Pages aktiveres. Hvis tallene skal være interne, skal de hostes bag adgangskontrol et andet sted eller via en egnet Enterprise Cloud-organisation.

Den tidligere Sites-version findes fortsat i `dashboard.html` og `worker/index.js`, men er ejerprivat og er ikke den delbare GitHub-visning. Ingen Matomo-token eller klienthemmelighed findes i repositoryet.
