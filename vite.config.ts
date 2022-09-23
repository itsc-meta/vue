import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  server:{
    host: '0.0.0.0',
    port: 9102
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~@": path.resolve(__dirname, "./src"),
      main: path.resolve(__dirname, "./src")
    }
  },
  plugins: [
    vue()
  ]
})
