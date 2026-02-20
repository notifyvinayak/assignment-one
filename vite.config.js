import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0', // Essential: Instructs Vite to listen on all interfaces
        port: 5173,
        hmr: {
            host: 'localhost' // Allows HMR routing back to your browser correctly
        }
    }
});
