import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Rutas relativas: el sitio funciona igual en vpedrosa.github.io/valpeca-web/
  // que en un dominio propio en la raíz, sin tocar nada.
  base: "./",
  plugins: [tailwindcss()],
  build: {
    // Activos con hash de contenido -> cacheables como `immutable`.
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
