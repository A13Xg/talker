import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  root: "./src",
  // base: "/talker/",
  base: process.env.VITE_BASE_URL || "/",
  build: {
    outDir: "../dist",
    assetsDir: "assets",
    minify: false,
    emptyOutDir: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "manifest.json",
          dest: "", // Copies to `dist/manifest.json`
        },
      ],
    }),
  ],
});
