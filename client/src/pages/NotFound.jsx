import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="page page--narrow">
      <header className="page__head">
        <p className="eyebrow">Error 404</p>
        <h1 className="page__title">Esta página no existe</h1>
        <p className="page__lede">
          El enlace que has seguido no lleva a ninguna parte del tablón.
        </p>
        <Link className="button button--solid" to="/">
          Volver al tablón
        </Link>
      </header>
    </section>
  );
}
