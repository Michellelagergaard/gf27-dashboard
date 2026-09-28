# GF27-dashboard

Internt dashboard for aktivitet på [GF27-siden](https://www.dp.dk/fag-og-politik/gf27-generalforsamling/).

## Status

Dashboardet vises på et privat [Site](https://gf27-aktivitetsdashboard.dansk-psykol-5476.chatgpt.site). Det daterede Matomo-udtræk fra 26.–28. september 2026 er synligt, indtil Matomo OAuth-klienten er gemt og dens offentlige klient-id er sat som `MATOMO_CLIENT_ID` i Sites runtime-miljø. Derefter kan en bruger med adgang til Matomo trykke **Forbind Matomo** og give dashboardet læseadgang med sin egen konto.

## Data og sikkerhed

- Matomo site ID 3; GF27 måles i kategorien `GF27`.
- OAuth-klienten skal være **Public**, have authorisation code med PKCE, refresh token og højst `matomo:read`. Registreret redirect URI: `https://gf27-aktivitetsdashboard.dansk-psykol-5476.chatgpt.site/oauth/callback`.
- Ingen klienthemmelighed eller Matomo-token i repository. Browseren holder den enkelte brugers adgang i sessionStorage for den åbne fane. Worker videresender kun læseforespørgsler til Matomo.
- Klik mod tilmelding er ikke en gennemført tilmelding.
- Dashboardet er privat, indtil adgang til projektgruppen er aftalt.

`dashboard.html` er visningen. `worker/index.js` håndterer OAuth-udveksling og rapporthentning. `scripts/` bygger og kontrollerer artefaktet.
