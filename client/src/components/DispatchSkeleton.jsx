export default function DispatchSkeleton({ count = 3 }) {
  return (
    <div className="skeleton-list" role="status" aria-busy="true">
      <span className="visually-hidden">Cargando despachos…</span>
      {Array.from({ length: count }, (unused, index) => (
        <div className="skeleton" key={index} aria-hidden="true">
          <span className="skeleton__rail" />
          <div className="skeleton__body">
            <span className="skeleton__line skeleton__line--meta" />
            <span className="skeleton__line" />
            <span className="skeleton__line skeleton__line--short" />
          </div>
        </div>
      ))}
    </div>
  );
}
