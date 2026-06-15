# valpeca-web

Sitio estático con una animación de shader en **WebGL puro** (sin dependencias),
construido con **Vite** + **Tailwind CSS v4** y desplegado en **GitHub Pages**.

## Desarrollo

```bash
npm install
npm run dev      # servidor local con HMR
npm run build    # build de producción en dist/
npm run preview  # sirve dist/ localmente para comprobar el build
```

## Build y caché

`npm run build` genera en `dist/` activos con **hash de contenido**
(`assets/index-<hash>.js`, `assets/index-<hash>.css`).
El nombre solo cambia si cambia el contenido, así que pueden servirse con
`Cache-Control: immutable` y se reinvalidan solos.

## Despliegue

El push a `master` dispara `.github/workflows/deploy.yml`, que hace el build y
publica `dist/` en GitHub Pages.

**Requisito único** (una sola vez): en el repo, _Settings → Pages → Build and
deployment → Source_ = **GitHub Actions**.

Las rutas son relativas (`base: "./"` en `vite.config.js`), así que funciona
tanto en `vpedrosa.github.io/valpeca-web/` como en un dominio propio.
