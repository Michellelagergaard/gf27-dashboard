# GF27 · aktivitetsdashboard

[Åbn dashboardet](https://michellelagergaard.github.io/gf27-dashboard/) · [Se GF27-siden](https://www.dp.dk/fag-og-politik/gf27-generalforsamling/)

Dashboardet viser aggregeret aktivitet: sidevisninger, besøg, klik mod tilmelding, FAQ, sektioner, scroll og periodevalg. GitHub Pages udgiver indholdet i [`docs/`](docs/). Repository og dashboard er offentligt tilgængelige. Datafilen [`docs/data.json`](docs/data.json) indeholder kun aggregerede tal og hændelsesnavne.

## Datastatus

Det nuværende datagrundlag er et kontrolleret udtræk fra 26.–28. september 2026. Kun tre dage er tilgængelige; derfor viser 7 dage, 30 dage og siden start endnu de samme tal. Det står også på dashboardet. Klik mod tilmelding betyder ikke gennemført tilmelding. Opsætningstesten 25. september er udeladt.

## Daglig opdatering fra Matomo

Workflowet [Update GF27 dashboard data](.github/workflows/update-dashboard.yml) er klar til at opdatere `docs/data.json` dagligt. Der er oprettet en særskilt fortrolig OAuth-klient i Matomo med kun `matomo:read` og client credentials. Dens offentlige klient-id er gemt som GitHub Actions variable `MATOMO_CLIENT_ID`. For at aktivere opdateringen mangler dens klienthemmelighed som repository secret `MATOMO_CLIENT_SECRET` under GitHub Settings → Secrets and variables → Actions. Kopiér den direkte fra Matomo til GitHub; den må ikke skrives i filer, issues eller kommentarer. Kør derefter workflowet manuelt første gang for at validere rapporterne. Uden secret bevares det daterede udtræk.

`dashboard.html` og `worker/index.js` er kildekode til en tidligere, ejerprivat Sites-version. Den delbare GitHub-visning er `docs/index.html` med `docs/app.js` og `docs/data.json`.
