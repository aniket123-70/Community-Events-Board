"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api-client";

type State<T> = { key: string | null; data?: T; error?: ApiError };

/**
 * GETs a URL from our API. `loading` is derived by comparing the settled request
 * with the current one, so the previous data stays visible while new data loads.
 */
export function useApi<T>(url: string) {
  const [attempt, setAttempt] = useState(0);
  const key = `${url}#${attempt}`;
  const [state, setState] = useState<State<T>>({ key: null });

  useEffect(() => {
    let cancelled = false;
    api<T>(url)
      .then((data) => !cancelled && setState({ key, data }))
      .catch((error: ApiError) => !cancelled && setState((s) => ({ key, data: s.data, error })));
    return () => {
      cancelled = true;
    };
  }, [url, key]);

  const settled = state.key === key;
  const reload = useCallback(() => setAttempt((a) => a + 1), []);

  return {
    data: state.data,
    error: settled ? state.error : undefined,
    loading: !settled,
    reload,
  };
}
