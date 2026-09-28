# GF27 · aktivitetsdashboard

[Åbn dashboardet](https://michellelagergaard.github.io/gf27-dashboard/) · [Se GF27-siden](https://www.dp.dk/fag-og-politik/gf27-generalforsamling/)

Dashboardet viser aggregeret aktivitet: sidevisninger, besøg, klik mod tilmelding, FAQ, sektioner, scroll og periodevalg. GitHub Pages udgiver indholdet i [`docs/`](docs/). Repository og dashboard er offentligt tilgængelige; del dashboardlinket med kollegaer. Datafilen [`docs/data.json`](docs/data.json) indeholder kun aggregerede tal og hændelsesnavne.

## Datastatus

Det nuværende datagrundlag er et kontrolleret udtræk fra 26.–28. september 2026, tydeligt dateret på dashboardet. Det opdateres endnu ikke automatisk. Klik mod tilmelding betyder ikke gennemført tilmelding. Opsætningstesten 25. september er udeladt.

## Daglig opdatering fra Matomo

Workflowet [Update GF27 dashboard data](.github/workflows/update-dashboard.yml) er klar til at opdatere `docs/data.json` dagligt og kan også startes manuelt. For at aktivere det skal en separat Matomo API-token med læseadgang til site 3 gemmes som repository secret `MATOMO_TOKEN_AUTH` under GitHub Settings → Secrets and variables → Actions. Tokenet må aldrig skrives i filer, issues eller kommentarer. Uden secret bevarer workflowet det daterede udtræk.

`dashboard.html` og `worker/index.js` er kildekode til en tidligere, ejerprivat Sites-version. Den delbare GitHub-visning er `docs/index.html` med `docs/app.js` og `docs/data.json`.
