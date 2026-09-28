# GF27-dashboard

Internt dashboard for aktivitet på [GF27-siden](https://www.dp.dk/fag-og-politik/gf27-generalforsamling/).

## Status

Dashboardet vises på et privat Site. Koden i dette repository beskriver visningen og en serverbaseret Matomo-forbindelse. Uden `MATOMO_TOKEN` vises det verificerede øjebliksbillede fra 26.–28. september 2026. API-adgangen er endnu ikke konfigureret.

## Data og sikkerhed

- Matomo site ID 3; GF27 måles i kategorien `GF27`.
- Token skal oprettes særskilt til denne integration og gemmes som en hemmelig runtime-værdi hos hostingudbyderen. Det må aldrig lægges i dette repository.
- Klik mod tilmelding er ikke en gennemført tilmelding.
- Dashboardet er privat, indtil adgang til projektgruppen er aftalt.

`dashboard.html` er visningen. `worker/index.js` er den serverbaserede Matomo-rapporthentning. `scripts/` bygger og kontrollerer artefaktet.