# GF27 · aktivitetsdashboard

[Åbn dashboardet](https://michellelagergaard.github.io/gf27-dashboard/) · [Se GF27-siden](https://www.dp.dk/fag-og-politik/gf27-generalforsamling/)

Dashboardet viser aggregeret aktivitet: sidevisninger, besøg, klik mod tilmelding, FAQ, sektioner, scroll og periodevalg. GitHub Pages udgiver indholdet i [`docs/`](docs/). Repository og dashboard er offentligt tilgængelige. Datafilerne [`docs/data.json`](docs/data.json) og [`docs/data.js`](docs/data.js) indeholder kun aggregerede tal og hændelsesnavne. Scriptfilen gør, at dashboardets filtre også fungerer, når browseren blokerer direkte hentning af JSON.

## Datastatus

Data hentes nu automatisk fra Matomo. Første vellykkede opdatering blev kørt 28. september 2026, og dashboardet viser opdateringstidspunktet. Sidevisninger og besøg hentes fra GF27-sidens publicering 1. september 2026. Klik, FAQ, sektioner og scroll kan kun vises fra hændelsesmålingen 26. september. Opsætningstesten 25. september er udeladt. Vælg datoer for at sammenligne delperioder; klikrate vises kun, når hændelser blev målt i hele den valgte periode. Klik mod tilmelding betyder ikke gennemført tilmelding.

## Opdatering fra Matomo

Workflowet [Update GF27 dashboard data](.github/workflows/update-dashboard.yml) kører to gange dagligt: kl. 06:17 og 14:17 UTC (08:17 og 16:17 dansk sommertid; 07:17 og 15:17 dansk vintertid). Det henter aggregerede tal fra Matomo og opdaterer `docs/data.json` samt `docs/data.js`; GitHub Pages udgiver derefter begge datafiler. Det kan også [startes manuelt](https://github.com/Michellelagergaard/gf27-dashboard/actions/workflows/update-dashboard.yml) med **Run workflow**. Adgangen bruger en særskilt fortrolig OAuth-klient med kun `matomo:read`; klient-id ligger som Actions variable `MATOMO_CLIENT_ID`, og klienthemmeligheden som Actions secret `MATOMO_CLIENT_SECRET`. Hemmeligheden må ikke skrives i filer, issues eller kommentarer. Tallene opdateres to gange om dagen, ikke løbende i realtid.

`dashboard.html` og `worker/index.js` er kildekode til en tidligere, ejerprivat Sites-version. Den delbare GitHub-visning er `docs/index.html` med `docs/app.js` og `docs/data.json`.
