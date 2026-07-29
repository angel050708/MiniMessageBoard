import { Link } from "react-router-dom";

import { formatDate, toIsoString } from "../format.js";

export default function MessageCard({ message, number, order }) {
  return (
    <article className="dispatch" style={{ "--order": order }}>
      <div className="dispatch__rail" aria-hidden="true">
        <span className="dispatch__number">{number}</span>
      </div>

      <div className="dispatch__body">
        <div className="dispatch__meta">
          <h2 className="dispatch__user">{message.user}</h2>
          <time className="dispatch__time" dateTime={toIsoString(message.added)}>
            {formatDate(message.added)}
          </time>
        </div>

        <p className="dispatch__text">{message.text}</p>

        <Link className="button button--ghost" to={`/messages/${message.id}`}>
          Abrir
          <span className="visually-hidden"> el despacho de {message.user}</span>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
            <path
              d="M5 12h13m0 0-5-5m5 5-5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
