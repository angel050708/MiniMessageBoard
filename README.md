# Despachos — Mini Messageboard

Tablón de mensajes full-stack. El backend es una API JSON con Express; el frontend es una SPA de
React (Vite). **No hay plantillas EJS**: el servidor nunca genera HTML, solo datos.

```
ejerprueb/
├── package.json          scripts raíz (concurrently levanta api + web)
├── server/
│   ├── package.json
│   └── src/
│       ├── app.js               middlewares, montaje del router, 404, error handler, listen
│       └── routes/messages.js   array en memoria + GET / GET :id / POST
└── client/
    ├── index.html               único HTML de toda la app
    ├── vite.config.js           proxy /api -> localhost:3000
    └── src/
        ├── main.jsx             monta React en #root dentro de BrowserRouter
        ├── App.jsx              layout (masthead, main, footer) + tabla de rutas
        ├── api.js               las 3 llamadas HTTP a /api/messages
        ├── useResource.js       hook de carga: loading / ready / error + reload
        ├── format.js            fechas con Intl.DateTimeFormat
        ├── styles.css           tokens y sistema de diseño
        ├── components/          MessageCard, StatusBlock, DispatchSkeleton
        └── pages/               MessageList, NewMessage, MessageDetail, NotFound
```

## Arrancar

```bash
npm run setup   # instala raíz, server y client
npm run dev     # API en :3000, web en :5173
```

Abre <http://localhost:5173>. El puerto de la API se cambia con la variable `PORT`.

## API

| Método | Ruta                | Respuesta                                        |
| ------ | ------------------- | ------------------------------------------------ |
| GET    | `/api/messages`     | `200` array de mensajes                          |
| GET    | `/api/messages/:id` | `200` mensaje · `404` si el id no existe         |
| POST   | `/api/messages`     | `201` mensaje creado · `400` `{ error, fields }` |

Un mensaje es `{ id, user, text, added }`. El `id` es un `randomUUID()`: la lista se ordena por
fecha en el cliente, y un índice de array dejaría de apuntar al mismo mensaje en cuanto cambiara el
orden.

Los mensajes viven en un array en memoria (`server/src/routes/messages.js`). Al reiniciar el
servidor vuelven los dos de ejemplo.

---

## Cómo funciona React contra un backend

### Qué es un componente

Un componente es una función que recibe datos (`props`) y devuelve la descripción de un trozo de
interfaz. No devuelve una cadena de HTML: devuelve JSX, que Vite compila a llamadas de JavaScript, y
React usa el resultado para decidir qué nodos del DOM tocar.

`client/src/components/MessageCard.jsx` es el caso más puro: recibe `message`, `number` y `order`, y
solo pinta. No sabe de dónde salió el mensaje ni si hay uno o cuarenta. Por eso `MessageList.jsx`
puede reutilizarlo dentro de un `.map()` sin duplicar markup — el equivalente al
`<% messages.forEach %>` de EJS, pero con una unidad que además se puede probar y mover de sitio.

### Dónde vive cada cosa

Hay dos estados y no se mezclan:

- **El estado del servidor** son los mensajes. Viven en `server/src/routes/messages.js` y son la
  fuente de verdad. React nunca los inventa: los pide.
- **El estado de React** es lo que la interfaz necesita para pintarse ahora mismo: lo que el usuario
  lleva escrito en el formulario, si la petición está en curso, qué error hay que mostrar. Es
  efímero y muere al recargar la página.

En `NewMessage.jsx` se ve la separación. `values` es estado de React: cada tecla dispara
`handleChange`, que actualiza el estado, y React vuelve a pintar el input con el valor nuevo (eso es
un *controlled input*: el DOM no guarda el valor, lo guarda React). Solo al hacer submit ese estado
local se convierte en estado de servidor mediante un `POST`.

### fetch + hook en lugar de render en el servidor

Con EJS el ciclo era: el navegador pide `/`, Express lee el array, `res.render("index", { messages })`
mete los datos en la plantilla y devuelve HTML ya montado. Una petición, una página, y para ver algo
nuevo hay que recargar.

Aquí el ciclo es otro:

1. El navegador pide `/` y recibe siempre el mismo `index.html` casi vacío.
2. React monta `App` y el router decide qué página toca.
3. `MessageList` llama a `useResource(fetchMessages)`. Dentro del hook, un `useEffect` lanza el
   `fetch` **después** de que el componente ya está en pantalla.
4. Mientras la petición viaja, `status` vale `"loading"` y se pintan esqueletos. Cuando llega la
   respuesta, `setState` la guarda, React vuelve a renderizar y aparecen las tarjetas.

`useEffect` es el sitio donde se ponen los efectos que no son pintar: pedir datos, suscribirse,
temporizadores. Se ejecuta después del render, con un array de dependencias que decide cuándo
repetirlo — en `MessageDetail.jsx` el loader depende de `id`, así que navegar a otro mensaje relanza
la petición solo. Y devuelve una función de limpieza que aborta el `fetch` si el componente se
desmonta antes de que llegue la respuesta, para no hacer `setState` sobre algo que ya no existe.

El precio de este modelo es que hay que representar estados que con EJS no existían: **cargando**,
**error** y **vacío**. Con render en el servidor, si el HTML llegaba, los datos ya estaban. Aquí la
página existe antes que los datos, y cada uno de esos tres casos tiene su UI: `DispatchSkeleton`,
`StatusBlock` con `role="alert"` y botón de reintentar, y el bloque de tablón vacío.

### El formulario, antes y ahora

La versión con plantillas usaba `<form method="POST" action="/new">`. El navegador serializaba los
campos, Express los leía con `express.urlencoded()` en `req.body`, hacía `messages.push(...)` y
terminaba con `res.redirect("/")`: recarga completa.

Aquí `onSubmit` hace `event.preventDefault()` para que el navegador no navegue, y `createMessage()`
manda el mismo contenido como JSON. La navegación a `/` la hace `navigate("/")` de React Router: no
hay recarga, se cambia la URL y se monta otro componente. Al montarse, `MessageList` vuelve a pedir
la lista, que ya incluye el mensaje nuevo.

`express.urlencoded()` sigue montado en `app.js` a propósito: la API acepta el mismo payload venga
como JSON o como formulario clásico, así que un `<form action="/api/messages" method="POST">` sin
JavaScript también crea el mensaje. La diferencia es la respuesta: en lugar de redirigir devuelve el
JSON del recurso creado, porque el servidor ya no sabe nada de páginas.

### Validación en un solo sitio

Los inputs no llevan el atributo `required`. Es deliberado: si el navegador bloqueara el submit,
nunca se vería la respuesta `400` del servidor. La validación vive en el backend —el único sitio
donde no se puede saltar— y el cliente pinta lo que le devuelve: `fields.user` y `fields.text` se
muestran bajo su input, con `aria-invalid`, `role="alert"` y el foco movido al primer campo
inválido. Para los lectores de pantalla los campos siguen marcados con `aria-required`.

### Por qué el proxy

El navegador solo habla con `localhost:5173`. Vite reenvía todo lo que empiece por `/api` a
`localhost:3000` (`vite.config.js`), así que para el navegador es el mismo origen y no hay CORS que
configurar.

En producción no hay dos servidores: Vite es solo una herramienta de desarrollo. `npm run build`
compila el cliente a `client/dist` y Express sirve esa carpeta además de la API, en un único puerto
(`server/src/app.js`). Como el origen es el mismo, el proxy deja de hacer falta.

---

## Desplegar

El repositorio se despliega como **un solo servicio**. Cualquier plataforma que ejecute Node
(Railway, Render, Fly) necesita estos dos comandos, ya definidos en el `package.json` de la raíz:

| Fase  | Comando         | Qué hace                                                        |
| ----- | --------------- | --------------------------------------------------------------- |
| Build | `npm run build` | instala las dependencias de `server/` y `client/` y compila la SPA |
| Start | `npm start`     | arranca Express, que sirve `client/dist` y `/api` a la vez        |

No hay que configurar el puerto: el servidor lee `process.env.PORT`, que es justo lo que inyecta la
plataforma.

Detalles que importan al desplegar:

- `client/dist` está en `.gitignore` a propósito. Se genera en el build de cada despliegue, no se
  sube al repositorio.
- El build del cliente instala sus devDependencies con `--include=dev` porque Vite es una de ellas y
  las plataformas suelen omitir las de desarrollo cuando `NODE_ENV=production`.
- Cualquier URL que no sea un fichero real ni empiece por `/api` devuelve `index.html`, para que
  React Router resuelva los enlaces profundos (entrar directo a `/messages/<id>` funciona).
- Los mensajes siguen viviendo en memoria: cada reinicio o redespliegue del servicio los devuelve a
  los dos de ejemplo. Eso se arregla con una base de datos, no con el despliegue.

---

## Diseño

Dirección: **teletipo / tablón de despachos**. Tinta cálida (`#14110f`), ámbar de fósforo
(`#e8a33d`) y crema, serif editorial (Instrument Serif) sobre monoespaciada técnica (IBM Plex Mono).
Las tarjetas imitan tiras de teletipo: número correlativo en el raíl izquierdo y troquelado vertical
punteado.

Todo sale de tokens CSS en `styles.css` (color, tipografía, escala de espaciado 4/8, duraciones).
Contraste AA verificado en los pares que se usan, foco visible de 2px en todo lo interactivo, áreas
táctiles de 44px mínimo, `prefers-reduced-motion` respetado y sin scroll horizontal a 375px.
