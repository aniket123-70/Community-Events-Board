"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

/** Event image with a soft placeholder when the admin-provided URL fails to load. */
export function EventImage({ src, className = "" }: { src: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-coral-100 to-line text-coral-500/60 ${className}`}>
        <ImageOff className="size-8" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- admin-provided URLs can be on any host
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      // catches images that already failed before React hydrated
      ref={(img) => {
        if (img?.complete && img.naturalWidth === 0) setFailed(true);
      }}
      className={`object-cover ${className}`}
    />
  );
}
