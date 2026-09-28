# GF27 · aktivitetsdashboard

[Åbn dashboardet](https://michellelagergaard.github.io/gf27-dashboard/) · [Se GF27-siden](https://www.dp.dk/fag-og-politik/gf27-generalforsamling/)

Dashboardet viser aggregeret aktivitet: sidevisninger, besøg, klik mod tilmelding, FAQ, sektioner, scroll og periodevalg. GitHub Pages udgiver indholdet i [`docs/`](docs/). Repository og dashboard er offentligt tilgængelige. Datafilen [`docs/data.json`](docs/data.json) indeholder kun aggregerede tal og hændelsesnavne.

## Datastatus

Data hentes nu automatisk fra Matomo. Første vellykkede opdatering blev kørt 28. september 2026, og dashboardet viser opdateringstidspunktet. Måleperioden begynder 26. september 2026; opsætningstesten dagen før er udeladt. Med kun tre dages data viser 7 dage, 30 dage og siden start endnu de samme tal. Vælg datoer for at sammenligne delperioder. Klik mod tilmelding betyder ikke gennemført tilmelding.

## Daglig opdatering fra Matomo

Workflowet [Update GF27 dashboard data](.github/workflows/update-dashboard.yml) kører dagligt kl. 06:17 UTC (08:17 dansk sommertid, 07:17 dansk vintertid). Det henter aggregerede tal fra Matomo og opdaterer `docs/data.json`; GitHub Pages udgiver derefter den nye datafil. Det kan også [startes manuelt](https://github.com/Michellelagergaard/gf27-dashboard/actions/workflows/update-dashboard.yml) med **Run workflow**. Adgangen bruger en særskilt fortrolig OAuth-klient med kun `matomo:read`; klient-id ligger som Actions variable `MATOMO_CLIENT_ID`, og klienthemmeligheden som Actions secret `MATOMO_CLIENT_SECRET`. Hemmeligheden må ikke skrives i filer, issues eller kommentarer. Tallene opdateres én gang om dagen, ikke løbende i realtid.

`dashboard.html` og `worker/index.js` er kildekode til en tidligere, ejerprivat Sites-version. Den delbare GitHub-visning er `docs/index.html` med `docs/app.js` og `docs/data.json`.
