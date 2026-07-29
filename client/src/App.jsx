import { NavLink, Route, Routes } from "react-router-dom";

import MessageDetail from "./pages/MessageDetail.jsx";
import MessageList from "./pages/MessageList.jsx";
import NewMessage from "./pages/NewMessage.jsx";
import NotFound from "./pages/NotFound.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Tablón", end: true },
  { to: "/new", label: "Redactar", end: false },
];

export default function App() {
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>

      <header className="masthead">
        <div className="masthead__brand">
          <span className="masthead__kicker">Tablón público · desde 2026</span>
          <p className="masthead__title">
            Despachos<span className="masthead__caret" aria-hidden="true" />
          </p>
        </div>

        <nav className="masthead__nav" aria-label="Principal">
          {NAV_ITEMS.map((item) => (
            <NavLink className="masthead__link" key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="main" id="main">
        <Routes>
          <Route path="/" element={<MessageList />} />
          <Route path="/new" element={<NewMessage />} />
          <Route path="/messages/:id" element={<MessageDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>Mini messageboard · Express + React · los mensajes viven en la memoria del servidor.</p>
      </footer>
    </div>
  );
}
