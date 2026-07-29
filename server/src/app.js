import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";

import messagesRouter from "./routes/messages.js";

const CLIENT_DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "client", "dist");

const app = express();

// Traza cada petición al terminar la respuesta, cuando ya se conoce el status.
app.use((req, res, next) => {
  const startedAt = performance.now();

  res.on("finish", () => {
    const ms = (performance.now() - startedAt).toFixed(1);
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms} ms)`);
  });

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/messages", messagesRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
});

// En producción este mismo proceso sirve la SPA compilada: un solo puerto y
// mismo origen, así que no hace falta ni proxy ni CORS. En desarrollo la
// carpeta no existe y de esto se encarga Vite.
if (existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));

  // Las rutas del router viven solo en el cliente: cualquier URL que no sea un
  // fichero real devuelve el index para que React Router la resuelva.
  app.use((req, res) => {
    res.sendFile(join(CLIENT_DIST, "index.html"));
  });
}

// El body parser lanza errores con `status` (JSON malformado, payload gigante).
// Sin este handler Express respondería HTML y el cliente fallaría al parsearlo.
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({
    error: status >= 500 ? "Error interno del servidor" : err.message,
  });
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
