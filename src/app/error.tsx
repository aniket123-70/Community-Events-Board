"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/States";

// Last-resort boundary so an unexpected crash shows a friendly message, not a blank page
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorState message="Something unexpected happened on this page." onRetry={retry} />;
}
