# Despachos — Mini Messageboard

Tablón de mensajes. API JSON con Express y SPA de React, sin plantillas: el servidor nunca genera
HTML.

```bash
npm run setup
npm run dev     # http://localhost:5173
```

Los mensajes viven en un array en memoria (`server/src/routes/messages.js`), así que cada reinicio
del servidor los devuelve a los dos de ejemplo.

## API

| Método | Ruta                | Respuesta                                        |
| ------ | ------------------- | ------------------------------------------------ |
| GET    | `/api/messages`     | `200` array de mensajes                          |
| GET    | `/api/messages/:id` | `200` mensaje · `404` si el id no existe         |
| POST   | `/api/messages`     | `201` mensaje creado · `400` `{ error, fields }` |

El `id` es un `randomUUID()`: la lista se ordena por fecha en el cliente, y un índice de array
dejaría de apuntar al mismo mensaje en cuanto cambiara el orden.

---

## Cómo funciona React contra un backend

### Qué es un componente

Una función que recibe datos (`props`) y devuelve la descripción de un trozo de interfaz. No
devuelve una cadena de HTML: devuelve JSX, y React usa el resultado para decidir qué nodos del DOM
tocar.

`MessageCard.jsx` es el caso más puro: recibe un mensaje y solo pinta. No sabe de dónde salió ni si
hay uno o cuarenta. Por eso `MessageList` lo reutiliza dentro de un `.map()` sin duplicar markup —
el equivalente al `<% messages.forEach %>` de EJS, pero como unidad que se puede probar y mover.

### Dónde vive cada cosa

Hay dos estados y no se mezclan:

- **El del servidor** son los mensajes. Son la fuente de verdad; React nunca los inventa, los pide.
- **El de React** es lo que la interfaz necesita para pintarse ahora mismo: lo que llevas escrito en
  el formulario, si la petición está en curso, qué error mostrar. Muere al recargar la página.

En `NewMessage.jsx` se ve la separación. `values` es estado de React: cada tecla dispara
`handleChange` y React repinta el input con el valor nuevo — eso es un *controlled input*, el DOM no
guarda el valor, lo guarda React. Solo al hacer submit ese estado local se convierte en estado de
servidor.

### fetch + useEffect en lugar de render en el servidor

Con EJS: el navegador pide `/`, Express lee el array, `res.render()` mete los datos en la plantilla
y devuelve HTML montado. Una petición, una página, y para ver algo nuevo hay que recargar.

Aquí llega un `index.html` casi vacío, React monta, y `useEffect` lanza el `fetch` **después** de que
el componente ya está en pantalla. `useEffect` es donde van los efectos que no son pintar, con un
array de dependencias que decide cuándo repetirlos: en `MessageDetail.jsx` el loader depende de `id`,
así que navegar a otro mensaje relanza la petición solo. Y devuelve una limpieza que aborta el
`fetch` si el componente se desmonta antes de que llegue la respuesta.

El precio es tener que representar estados que con plantillas no existían: **cargando**, **error** y
**vacío**. Con render en el servidor, si el HTML llegaba los datos ya estaban. Aquí la página existe
antes que los datos.

### El formulario, antes y ahora

`<form method="POST" action="/new">` hacía que el navegador serializara los campos, Express los leía
en `req.body`, hacía `push` y respondía `res.redirect("/")`: recarga completa.

Ahora `onSubmit` corta esa navegación con `preventDefault()` y manda el contenido como JSON.
`navigate("/")` de React Router sustituye al redirect: cambia la URL y monta otro componente, sin
recarga.

`express.urlencoded()` sigue montado a propósito, así que un `<form>` clásico contra
`/api/messages` también crea el mensaje. Lo que cambia es la respuesta: devuelve el JSON del recurso
creado en vez de redirigir, porque el servidor ya no sabe nada de páginas.

### Validación en un solo sitio

Los inputs no llevan `required`. Es deliberado: si el navegador bloqueara el submit, nunca se vería
la respuesta `400`. La validación vive en el backend —el único sitio donde no se puede saltar— y el
cliente pinta lo que le devuelve, con `aria-invalid`, `role="alert"` y el foco en el primer campo
inválido.

---

## Diseño

Dirección: **teletipo**. Tinta cálida, ámbar de fósforo y crema; serif editorial (Instrument Serif)
sobre monoespaciada técnica (IBM Plex Mono). Las tarjetas imitan tiras de papel con número
correlativo y troquelado en el raíl izquierdo.

Todo sale de tokens en `styles.css`. Contraste AA, foco visible, áreas táctiles de 44px,
`prefers-reduced-motion` respetado y sin scroll horizontal a 375px.
