import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";

import messagesRouter from "./routes/messages.js";

const CLIENT_DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "client", "dist");

const app = express();

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

// Solo existe tras `npm run build`; en desarrollo sirve Vite.
if (existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.use((req, res) => {
    res.sendFile(join(CLIENT_DIST, "index.html"));
  });
}

// Sin esto, un JSON malformado devolvería HTML y el cliente reventaría al parsearlo.
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
