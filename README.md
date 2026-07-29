# Despachos

Tablón de mensajes público. API JSON con Express y cliente React.

## Stack

Express 5 · React 19 · React Router 7 · Vite 7

## Desarrollo

```bash
npm run setup
npm run dev
```

## Variables de entorno

| Nombre | Por defecto | Descripción                                               |
| ------ | ----------- | --------------------------------------------------------- |
| `PORT` | `3000`      | Puerto del servidor. En producción lo pone la plataforma.  |

Copia `server/.env.example` a `server/.env` para sobrescribirlas en desarrollo. `.env` está en
`.gitignore` y `npm start` no lo lee.

