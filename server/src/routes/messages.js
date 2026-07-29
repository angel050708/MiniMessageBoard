import { randomUUID } from "node:crypto";

import { Router } from "express";

const USER_MAX_LENGTH = 32;
const TEXT_MAX_LENGTH = 500;

// En memoria: cada reinicio del servidor vuelve a estos dos.
const messages = [
  {
    id: randomUUID(),
    text: "Hi there!",
    user: "Amando",
    added: new Date(),
  },
  {
    id: randomUUID(),
    text: "Hello World!",
    user: "Charles",
    added: new Date(),
  },
];

function readField(body, field) {
  const value = body[field];
  return typeof value === "string" ? value.trim() : "";
}

function validate({ user, text }) {
  const fields = {};

  if (!user) {
    fields.user = "Escribe tu nombre para firmar el despacho.";
  } else if (user.length > USER_MAX_LENGTH) {
    fields.user = `Acorta el nombre a ${USER_MAX_LENGTH} caracteres o menos.`;
  }

  if (!text) {
    fields.text = "Escribe el mensaje antes de publicarlo.";
  } else if (text.length > TEXT_MAX_LENGTH) {
    fields.text = `Acorta el mensaje a ${TEXT_MAX_LENGTH} caracteres o menos.`;
  }

  return fields;
}

const router = Router();

router.get("/", (req, res) => {
  res.json(messages);
});

router.get("/:id", (req, res) => {
  const message = messages.find((candidate) => candidate.id === req.params.id);

  if (!message) {
    res.status(404).json({ error: "Ese mensaje no existe o ya no está en el tablón." });
    return;
  }

  res.json(message);
});

router.post("/", (req, res) => {
  const body = req.body ?? {};
  const user = readField(body, "user");
  const text = readField(body, "text");

  const fields = validate({ user, text });

  if (Object.keys(fields).length > 0) {
    res.status(400).json({ error: "Revisa los campos marcados y vuelve a publicar.", fields });
    return;
  }

  const message = { id: randomUUID(), text, user, added: new Date() };
  messages.push(message);

  res.status(201).json(message);
});

export default router;
