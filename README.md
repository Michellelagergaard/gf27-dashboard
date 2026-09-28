# GF27-dashboard

Internt dashboard for aktivitet på [GF27-siden](https://www.dp.dk/fag-og-politik/gf27-generalforsamling/).

## Status

Dashboardet vises på et privat [Site](https://gf27-aktivitetsdashboard.dansk-psykol-5476.chatgpt.site). Matomo OAuth-klienten er oprettet med læseadgang, og klient-id er sat i Sites som `MATOMO_CLIENT_ID`. En bruger med adgang til både det private Site og Matomo kan trykke **Forbind Matomo** og godkende dashboardet med sin egen Matomo-konto. Før første godkendelse viser dashboardet et dateret udtræk fra 26.–28. september 2026. Liveforløbet skal afprøves i en adgangsgodkendt browsersession.

## Data og sikkerhed

- Matomo site ID 3; GF27 måles i kategorien `GF27`.
- OAuth-klienten er **Public** med authorisation code/PKCE, refresh token og `matomo:read`. Registreret redirect URI: `https://gf27-aktivitetsdashboard.dansk-psykol-5476.chatgpt.site/oauth/callback`.
- Ingen klienthemmelighed eller Matomo-token i repository. Browseren holder den enkelte brugers adgang i sessionStorage for den åbne fane. Worker videresender kun læseforespørgsler til Matomo.
- Klik mod tilmelding er ikke en gennemført tilmelding.
- Dashboardet er privat, indtil adgang til projektgruppen er aftalt.

`dashboard.html` er visningen. `worker/index.js` håndterer OAuth-udveksling og rapporthentning. `scripts/` bygger og kontrollerer artefaktet.
