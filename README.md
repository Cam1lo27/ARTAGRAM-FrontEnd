# Artagram — frontend

React 18 + TypeScript + Vite. Ver el [README raíz](../README.md) para arquitectura,
cómo levantar el stack completo y cómo probar los flujos de tiempo real a mano.

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción (tsc -b && vite build)
```

`VITE_API_BASE_URL` y `VITE_WS_URL` (en `.env` / `.env.local`) apuntan al backend REST y
al endpoint WebSocket respectivamente.
