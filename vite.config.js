import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

// Add PWA configuration
const pwaConfig = {
  registerType: "autoUpdate",
  includeAssets: ["logo-color.svg"],
  workbox: {
    globPatterns: ["**/*.{js,css,html,png,jpg,gif,svg}"],
    navigateFallback: "/",
    navigateFallbackAllowlist: [/^(?!\/__).*/],
    runtimeCaching: [
      {
        urlPattern: /\.(png|jpg|gif|svg)$/,
        handler: "StaleWhileRevalidate",
      },
      // Cache GET API responses briefly to reduce Railway egress on repeat visits
      {
        urlPattern: /^https?:\/\/[^/]+\/api\/v1\//,
        handler: "NetworkFirst",
        options: {
          networkTimeoutSeconds: 8,
          cacheName: "api-cache",
          expiration: { maxEntries: 64, maxAgeSeconds: 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
  manifest: {
    name: "Bankco admin Dashboard",
    short_name: "Bankco",
    description: "bankco Admin Dashboard",
    start_url: "/",
    display: "standalone",
    background_color: "#23262B",
    theme_color: "#16A34A",
    icons: [
      {
        src: "pwa-64x64.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@config": path.resolve(__dirname, "./config.js"),
    },
  },
  plugins: [react(), VitePWA(pwaConfig)],
  optimizeDeps: {
    include: ['jwt-decode']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router-dom")) return "vendor";
            if (id.includes("react/")) return "vendor";
            if (id.includes("chart.js") || id.includes("react-chartjs-2")) return "charts";
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("date-fns")) return "date-fns";
            if (id.includes("@sentry")) return "sentry";
            if (id.includes("quill")) return "quill";
            if (id.includes("swiper")) return "swiper";
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      }
    },
    chunkSizeWarningLimit: 600,
  }
});
