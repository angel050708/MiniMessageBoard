import express from "express";

import messagesRouter from "./routes/messages.js";

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

app.use((req, res) => {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
});

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
