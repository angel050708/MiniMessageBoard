import { useCallback, useEffect, useState } from "react";

const LOADING = { status: "loading", data: null, error: null };

// El loader recibe un AbortSignal y debe ser estable entre renders.
export function useResource(loader) {
  const [state, setState] = useState(LOADING);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState(LOADING);

    loader(controller.signal)
      .then((data) => setState({ status: "ready", data, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        setState({ status: "error", data: null, error });
      });

    return () => controller.abort();
  }, [loader, attempt]);

  const reload = useCallback(() => setAttempt((current) => current + 1), []);

  return { ...state, reload };
}
