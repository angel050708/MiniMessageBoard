import { Link } from "react-router-dom";

import { fetchMessages } from "../api.js";
import DispatchSkeleton from "../components/DispatchSkeleton.jsx";
import MessageCard from "../components/MessageCard.jsx";
import StatusBlock from "../components/StatusBlock.jsx";
import { formatDate } from "../format.js";
import { useResource } from "../useResource.js";

export default function MessageList() {
  const { status, data, error, reload } = useResource(fetchMessages);

  const messages = data ? [...data].sort((a, b) => new Date(b.added) - new Date(a.added)) : [];

  return (
    <section className="page">
      <header className="page__head page__head--split">
        <div className="page__intro">
          <p className="eyebrow">Edición en vivo</p>
          <h1 className="page__title">Últimos despachos</h1>
          <p className="page__lede">
            Todo lo que se ha clavado en el tablón, lo más reciente arriba. Sin cuentas, sin
            filtros, sin borrado.
          </p>
          <Link className="button button--solid" to="/new">
            Redactar despacho
          </Link>
        </div>

        {messages.length > 0 ? (
          <dl className="tally">
            <div className="tally__item">
              <dt>En el tablón</dt>
              <dd>{String(messages.length).padStart(3, "0")}</dd>
            </div>
            <div className="tally__item">
              <dt>Último despacho</dt>
              <dd>{formatDate(messages[0].added)}</dd>
            </div>
          </dl>
        ) : null}
      </header>

      {status === "loading" ? <DispatchSkeleton count={3} /> : null}

      {status === "error" ? (
        <StatusBlock tone="error" title="No pudimos cargar el tablón" message={error.message}>
          <button className="button button--ghost" type="button" onClick={reload}>
            Reintentar
          </button>
        </StatusBlock>
      ) : null}

      {status === "ready" && messages.length === 0 ? (
        <StatusBlock
          title="El tablón está vacío"
          message="Todavía no hay ningún despacho. Estrénalo tú."
        >
          <Link className="button button--ghost" to="/new">
            Escribir el primero
          </Link>
        </StatusBlock>
      ) : null}

      {status === "ready" && messages.length > 0 ? (
        <div className="dispatch-list">
          {messages.map((message, index) => (
            <MessageCard
              key={message.id}
              message={message}
              number={String(messages.length - index).padStart(3, "0")}
              order={index}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
