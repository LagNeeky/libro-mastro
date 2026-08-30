import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Se pubblichi su GitHub Pages con l'indirizzo tuoutente.github.io/libro-mastro,
// imposta qui lo stesso nome come "base" (con gli slash iniziale e finale).
const BASE_PATH = "/libro-mastro/";

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "Libro Mastro",
        short_name: "Libro Mastro",
        description: "Compagno di campagna per D&D 5e",
        theme_color: "#1c1712",
        background_color: "#1c1712",
        display: "standalone",
        start_url: BASE_PATH,
        scope: BASE_PATH,
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,webmanifest}"],
      },
    }),
  ],
});
