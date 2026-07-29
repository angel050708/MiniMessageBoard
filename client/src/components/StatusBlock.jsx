export default function StatusBlock({ tone = "info", title, message, children }) {
  return (
    <div className={`status status--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span className="status__mark" aria-hidden="true" />
      <div className="status__body">
        <p className="status__title">{title}</p>
        {message ? <p className="status__message">{message}</p> : null}
        {children}
      </div>
    </div>
  );
}
