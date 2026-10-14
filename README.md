# Feria del Caballo · Casetas (MVP)

Frontend MVP for submitting and reviewing the documentation required by the Ayuntamiento de Jerez to set up a caseta at the Feria del Caballo.

- **`/` Solicitud** – form with name, CIF (checksum-validated), description, traditional/non-traditional type and PDF uploads for *Estatutos* and *Memoria*.
- **`/gestion` Gestión documental** – the fairground map with all 175 casetas coloured by documentation status (grey = libre, red = incidencias, orange = pendiente de revisión, green = validada), search by name / number / CIF, status filters and a detail panel.

## Stack
Vite · React 19 · TypeScript · Tailwind CSS v4 · react-router · react-hook-form + zod · lucide-react · sonner

## Development
```bash
npm install
npm run dev
```

## Data
- `src/services/casetaService.ts` defines the `CasetaRepository` interface. The current `MockCasetaRepository` reads `src/data/casetas.mock.json` and keeps new submissions in `localStorage`; replace it with an HTTP implementation when the backend exists.
- `src/services/storageService.ts` mocks the S3 upload (returns a fake `s3://` key).
- Regenerate mock data with `node scripts/generate-mock.mjs`.

## Map
Caseta positions live in `src/data/mapLayout.ts` in the pixel space of `public/feria-map.webp` (1168×806). Open `/gestion?debug=1` to show outlines when adjusting them.

## Deployment
Every push to `main` builds and publishes the site to GitHub Pages via `.github/workflows/deploy-pages.yml` (https://chillaso.github.io/laferia/).

- One-time setup: in the repository go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
- The workflow builds with the Pages base path (`/laferia/`) and copies `index.html` to `404.html` so deep links such as `/laferia/gestion?caseta=87` work.
- Local development is unaffected and still runs at `/`.
