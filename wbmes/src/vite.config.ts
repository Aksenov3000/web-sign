import { defineConfig } from "vite";
import dts from 'vite-plugin-dts';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  build: {
    lib: {
      entry: 'src/core/index.ts',
      name: 'web-sign',
      formats: ['cjs'],
      fileName: (format) => `index.js`
    },
    outDir: 'build',
    emptyOutDir: true,
  },
  plugins: [dts({ outputDir: 'bbb' })]
});