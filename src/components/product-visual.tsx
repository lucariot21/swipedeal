"use client";

import Image from "next/image";
import { useState } from "react";

type ProductVisualProps = {
  alt: string;
  image: string | null;
  artwork: string;
  priority?: boolean;
  sizes: string;
  className?: string;
};

export function ProductVisual({
  alt,
  image,
  artwork,
  priority,
  sizes,
  className,
}: ProductVisualProps) {
  const [hasError, setHasError] = useState(false);
  const src = hasError ? artwork : image ?? artwork;

  return (
    <Image
      fill
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      priority={priority}
      sizes={sizes}
      src={src}
      unoptimized={src.startsWith("data:image")}
    />
  );
}
