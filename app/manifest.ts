import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyMap",
    short_name: "MyMap",
    start_url: "/maps",
    display: "standalone",
    orientation: "portrait",
    icons: [
      {
        src: "/logo.png",
        sizes: "421x421",
        type: "image/png",
      },
    ],
  };
}
