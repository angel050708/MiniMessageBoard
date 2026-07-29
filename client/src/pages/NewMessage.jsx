import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createMessage } from "../api.js";
import StatusBlock from "../components/StatusBlock.jsx";

const USER_MAX_LENGTH = 32;
const TEXT_MAX_LENGTH = 500;

export default function NewMessage() {
  const [values, setValues] = useState({ user: "", text: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const userRef = useRef(null);
  const textRef = useRef(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleCancel(event) {
    const hasDraft = values.user.trim() !== "" || values.text.trim() !== "";

    if (hasDraft && !window.confirm("Se perderá lo que has escrito. ¿Salir igualmente?")) {
      event.preventDefault();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      await createMessage(values);
      navigate("/");
    } catch (error) {
      const invalid = error.fields ?? {};
      setFormError(error.message);
      setFieldErrors(invalid);
      setIsSubmitting(false);

      if (invalid.user) {
        userRef.current?.focus();
      } else if (invalid.text) {
        textRef.current?.focus();
      }
    }
  }

  return (
    <section className="page page--narrow">
      <header className="page__head">
        <p className="eyebrow">Formulario</p>
        <h1 className="page__title">Redactar despacho</h1>
        <p className="page__lede">
          Firma con el nombre que quieras. Se publica al instante y no se puede editar después.
        </p>
      </header>

      {formError ? (
        <StatusBlock tone="error" title="No se publicó" message={formError} />
      ) : null}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="user">
            Nombre <span className="field__required">obligatorio</span>
          </label>
          <input
            className="field__input"
            id="user"
            name="user"
            ref={userRef}
            type="text"
            maxLength={USER_MAX_LENGTH}
            autoComplete="nickname"
            spellCheck="false"
            value={values.user}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.user)}
            aria-describedby={fieldErrors.user ? "user-error" : undefined}
          />
          {fieldErrors.user ? (
            <p className="field__error" id="user-error" role="alert">
              {fieldErrors.user}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="text">
            Mensaje <span className="field__required">obligatorio</span>
          </label>
          <textarea
            className="field__input field__input--area"
            id="text"
            name="text"
            ref={textRef}
            rows={6}
            maxLength={TEXT_MAX_LENGTH}
            autoComplete="off"
            value={values.text}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.text)}
            aria-describedby={`text-counter${fieldErrors.text ? " text-error" : ""}`}
          />
          <p className="field__counter" id="text-counter">
            {values.text.length} / {TEXT_MAX_LENGTH} caracteres
          </p>
          {fieldErrors.text ? (
            <p className="field__error" id="text-error" role="alert">
              {fieldErrors.text}
            </p>
          ) : null}
        </div>

        <div className="form__actions">
          <button className="button button--solid" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Publicando…" : "Publicar en el tablón"}
          </button>
          <Link className="button button--ghost" to="/" onClick={handleCancel}>
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}
