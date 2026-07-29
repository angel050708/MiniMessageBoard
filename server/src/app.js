import express from "express";

import messagesRouter from "./routes/messages.js";

const app = express();

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
