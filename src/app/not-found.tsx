import Link from "next/link";
import { EmptyState } from "@/components/States";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      message="The page you're looking for doesn't exist or has moved."
      action={
        <Link href="/" className="btn-primary">
          Browse events
        </Link>
      }
    />
  );
}
