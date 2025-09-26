import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    envDir: ".",
    base: "/",
    define: {
        // Make environment variables available at build time
        'process.env': process.env
    },
    server: {
        // Increase max listeners to prevent memory leak warnings
        hmr: {
            overlay: false
        },
        proxy: {
            '/uploads': {
                target: process.env.VITE_API_URL || 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        assetsDir: "assets",
        rollupOptions: {
            output: {
                assetFileNames: "assets/[name]-[hash][extname]",
            },
        },
    },
    plugins: [
        react(),
        VitePWA({
            registerType: "prompt",
            includeAssets: [
                "favicon.ico",
                "apple-touch-icon.png",
                "masked-icon.svg",
            ],
            manifest: {
                name: "Crewvar: Connect with Crew Members",
                short_name: "Crewvar",
                description: "Connect with crew members from cruise ships worldwide",
                theme_color: "#fff",
                start_url: "/",
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                ],
            },
        }),
    ],
});