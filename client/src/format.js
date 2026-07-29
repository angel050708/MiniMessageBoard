const longDate = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "long",
  timeStyle: "short",
});

const shortDate = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value, { long = false } = {}) {
  const date = new Date(value);
  return long ? longDate.format(date) : shortDate.format(date);
}

export function toIsoString(value) {
  return new Date(value).toISOString();
}
