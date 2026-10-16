# SGI Premium 2.0 — vista previa

La rama premium-v2 incorpora la portada y public/sgi-premium-home.css de la carpeta SGI-main proporcionada. main permanece sin cambios.

Vercel publica una vista previa visual mediante scripts/build-vercel-preview.mjs. No promover este despliegue a producción: las rutas API, administración, almacenamiento, cotizaciones, reseñas y chat dependen de Cloudflare D1/R2 y del entorno original y no funcionan en esta vista previa estática. No se copian credenciales ni se conectan los datos de producción.

Compilación del proyecto original: npm ci --ignore-scripts y npm run build.
Compilación visual Vercel: node scripts/build-vercel-preview.mjs.

## Premium v3
Actualizado desde SGI-Nogales-Premium-v3.zip: portada, estilos y navegación accesible. La vista previa conserva las mismas limitaciones de Cloudflare indicadas arriba.
