# Despachos

Tablón de mensajes público. API JSON con Express y cliente React.

## Stack

Express 5 · React 19 · React Router 7 · Vite 7

## Desarrollo

```bash
npm run setup
npm run dev
```

Cliente en `localhost:5173`, API en `localhost:3000`. Vite reenvía `/api` al backend.

## API

| Método | Ruta                | Respuesta                                        |
| ------ | ------------------- | ------------------------------------------------ |
| GET    | `/api/messages`     | `200` array de mensajes                          |
| GET    | `/api/messages/:id` | `200` mensaje · `404` si el id no existe         |
| POST   | `/api/messages`     | `201` mensaje creado · `400` `{ error, fields }` |

```json
{
  "id": "8f14e45f-ceea-467a-9b2c-3e1a5d7b0c42",
  "user": "Amando",
  "text": "Hi there!",
  "added": "2026-07-28T19:34:52.638Z"
}
```

`POST` exige `user` y `text` no vacíos y responde `400` con los errores por campo:

```json
{
  "error": "Revisa los campos marcados y vuelve a publicar.",
  "fields": { "user": "Escribe tu nombre para firmar el despacho." }
}
```

## Almacenamiento

Los mensajes viven en memoria. Cada reinicio del servidor los devuelve a los dos de ejemplo.

## Producción

`npm run build` compila el cliente y `npm start` levanta Express, que sirve la SPA y la API en el
puerto de `process.env.PORT`.
