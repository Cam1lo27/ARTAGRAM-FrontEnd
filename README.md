# Artagram — Frontend

Cliente web de **Artagram**: feed de obras con su proceso, comunidades con lienzo
colaborativo en tiempo real, banner mural, "modo fiesta" y chat. SPA de React que habla
con el backend por REST (Axios) y por WebSocket/STOMP para todo lo que es tiempo real.

Este repo se puede levantar solo apuntando a un backend ya corriendo (local o remoto).
Para el sistema completo (frontend + backend + Postgres + Redis + observabilidad), ver
el repo [`ARTAGRAM-Infraestructure`](https://github.com/Cam1lo27/ARTAGRAM-Infraestructure).

## Tecnologías

| Categoría | Tecnología |
|---|---|
| Framework | React 19 + TypeScript, Vite 8 |
| Enrutamiento | React Router 7 |
| Estado global | Zustand (sesión de autenticación) |
| HTTP | Axios (interceptores para JWT y manejo centralizado de 401/403) |
| Tiempo real | `@stomp/stompjs` (una sola conexión STOMP por sesión, reconexión y re-suscripción automática) |
| Estilos | Tailwind CSS 3 (tema oscuro "estudio creativo" + variante clara para landing/login) |
| Animación | Framer Motion (transiciones de página, indicador de pestaña activa, microinteracciones) |
| Fechas | date-fns |
| Servidor de producción | Nginx (imagen Docker, build multi-stage) |

## Arquitectura

### Estructura

```
src/
  App.tsx                  rutas + transición animada entre páginas (AnimatePresence)
  main.tsx                 punto de entrada (StrictMode)
  components/
    layout/                AppShell (header/nav), ProtectedRoute, AdminRoute, fondos decorativos
    ui/                     Button, TextField y demás átomos reutilizables
  features/
    auth/                  landing, login, registro, verificación de correo
    profile/                perfil público del artista
    community/              lista y detalle de comunidades
    canvas/                 estudio de lienzo colaborativo y banner mural (motor de canvas 2D)
    party/                  modo fiesta: lobby, sala con reloj sincronizado
    chat/                   chat personal
    feed/                   feed paginado, publicar obra, likes
    admin/                  panel de administración (KPIs)
  lib/
    api.ts                 cliente Axios (base URL, interceptor de JWT, manejo de 401 → cierre de sesión)
    authStore.ts            store de Zustand: sesión, token, aviso de "sesión expirada"
    stompClient.ts          cliente STOMP compartido (conectar una vez, suscribirse por topic)
    canvasEngine.ts          dibujo por puntos sobre `<canvas>` (pinceles, borrado, opacidad/grosor)
```

### Decisiones de arquitectura clave

- **Canvas 2D nativo, no WebGL**: alcanza de sobra para el trazo por puntos que maneja
  la app, y `globalCompositeOperation` + `filter: blur()` simulan textura de pincel
  (lápiz/marcador/acuarela) sin la complejidad de un motor WebGL.
- **Patrón "suscribirse antes de pedir el snapshot"**: en lienzo colaborativo, banner y
  modo fiesta, el cliente se suscribe al topic STOMP correspondiente *antes* de pedir el
  estado actual por REST, bufferea lo que llegue mientras tanto, y recién después
  reproduce ese buffer filtrando lo que ya vino en el snapshot. Evita perder trazos en la
  ventana de carrera entre "me suscribo" y "pido el estado".
- **El servidor manda en tiempo real**: el reloj del modo fiesta es siempre autoritativo
  del backend (evento `TICK` cada ~500ms); el cliente solo interpola visualmente entre
  ticks para que la cuenta regresiva se vea fluida, nunca decide por sí mismo cuánto
  tiempo queda.
- **Manejo centralizado de sesión vencida**: el interceptor de respuesta de Axios
  detecta un 401 (`NO_AUTENTICADO`) y limpia la sesión desde un único lugar
  (`useAuthStore.expirarSesion()`), lo que dispara la redirección a `/login` a través de
  `ProtectedRoute`/`AdminRoute` (ambos leyendo el mismo store reactivo) y muestra un
  aviso de "tu sesión expiró" — sin esa distinción entre 401/403 el usuario se quedaba
  viendo un error genérico en vez de que lo mandaran a iniciar sesión de nuevo.
- **Seguridad real vs. UX**: `AdminRoute` y el link "Admin" del menú son una comodidad de
  interfaz, no la barrera de seguridad — esa vive en el backend (`SecurityConfig`,
  `.hasRole("ADMIN")`, que además devuelve 403 y lo audita en logs). El frontend nunca es
  el único lugar donde se valida un permiso.
- **Transiciones de página**: `AnimatePresence` + un `motion.div` con `key` igual al
  `pathname` actual envuelve todas las rutas en `App.tsx`, así cualquier navegación
  (incluida la de los guards de sesión) anima entrada/salida sin tener que instrumentar
  cada página una por una.

## Cómo correr el frontend solo

Necesita un backend accesible (local vía `mvn spring-boot:run` en el repo
`ARTAGRAM-BackEnd`, o remoto).

```bash
npm install
npm run dev      # servidor de desarrollo (http://localhost:5173 por defecto)
npm run build    # build de producción: tsc -b && vite build
npm run preview  # sirve el build de producción localmente
npm run lint      # oxlint
```

Variables de entorno (`.env` para el default de desarrollo, `.env.local` para
sobreescribirlo sin tocar el archivo versionado — Vite prioriza `.env.local`):

| Variable | Uso | Default |
|---|---|---|
| `VITE_API_BASE_URL` | base del backend REST | `http://localhost:8080` |
| `VITE_WS_URL` | endpoint del WebSocket STOMP | `ws://localhost:8080/ws` |

> Si el backend corre en un puerto distinto de 8080, creá un `.env.local` con esas dos
> variables apuntando ahí antes de `npm run dev` — si no, el login funciona pero las
> llamadas siguientes a la API fallan por CORS/puerto equivocado.

En Docker, esas mismas variables se hornean en el build de la imagen vía `ARG`/`ENV`
(ver `Dockerfile`) — cambiar el backend de destino después de construida la imagen
requiere reconstruirla, no es una variable de entorno de runtime del contenedor Nginx.

## CI/CD

`.github/workflows/docker-publish.yml`: en cada push a `main`/`master`, construye la
imagen (con `npm run build` dentro del Dockerfile) y la publica en
`ghcr.io/<owner>/artagram-frontend:latest` usando el `GITHUB_TOKEN` que inyecta GitHub
Actions automáticamente.
