import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Volt Deals Prototype",
    short_name: "Volt Deals",
    description:
      "Premium mobile-first deal feed prototype with gamification, analytics and installable PWA support.",
    start_url: "/",
    display: "standalone",
    background_color: "#07070A",
    theme_color: "#07070A",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
