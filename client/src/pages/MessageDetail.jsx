import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchMessage } from "../api.js";
import DispatchSkeleton from "../components/DispatchSkeleton.jsx";
import StatusBlock from "../components/StatusBlock.jsx";
import { formatDate, toIsoString } from "../format.js";
import { useResource } from "../useResource.js";

export default function MessageDetail() {
  const { id } = useParams();
  const loader = useCallback((signal) => fetchMessage(id, signal), [id]);
  const { status, data, error, reload } = useResource(loader);

  return (
    <section className="page page--narrow">
      <Link className="backlink" to="/">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
          <path
            d="M19 12H6m0 0 5-5m-5 5 5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Volver al tablón
      </Link>

      {status === "loading" ? <DispatchSkeleton count={1} /> : null}

      {status === "error" ? (
        <StatusBlock
          tone="error"
          title={error.status === 404 ? "Despacho no encontrado" : "No pudimos abrir el despacho"}
          message={error.message}
        >
          {error.status === 404 ? (
            <Link className="button button--ghost" to="/">
              Ver todos los despachos
            </Link>
          ) : (
            <button className="button button--ghost" type="button" onClick={reload}>
              Reintentar
            </button>
          )}
        </StatusBlock>
      ) : null}

      {status === "ready" ? (
        <article className="detail">
          <p className="eyebrow" translate="no">
            Despacho · ref {data.id.slice(0, 8)}
          </p>
          <h1 className="detail__user">{data.user}</h1>
          <time className="detail__time" dateTime={toIsoString(data.added)}>
            {formatDate(data.added, { long: true })}
          </time>
          <p className="detail__text">{data.text}</p>
        </article>
      ) : null}
    </section>
  );
}
