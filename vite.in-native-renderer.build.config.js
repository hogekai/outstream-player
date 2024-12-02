import { defineConfig } from "vite";
import { resolve } from "path";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import autoprefixer from "autoprefixer";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import postcssNesting from "postcss-nesting";
import dtsPlugin from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    libInjectCss(),
    dtsPlugin({
      outputDir: "dist",
      tsconfigPath: resolve(__dirname, "tsconfig.build.json"),
    }),
  ],
  build: {
    emptyOutDir: false,
    lib: {
      entry: "./lib/in-native-renderer",
      name: "InNativeRenderer",
      fileName: "in-native-renderer",
    },
    rollupOptions: {
      output: {
        preserveModules: false,
        plugins: {
          output: {
            plugins: [
              getBabelOutputPlugin({
                allowAllFormats: true,
                presets: [
                  [
                    "@babel/preset-env",
                    {
                      targets: "> 0.25%, not dead, IE 11",
                      useBuiltIns: "usage",
                      modules: false,
                      corejs: true,
                    },
                  ],
                ],
              }),
            ],
          },
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [autoprefixer(), postcssNesting],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
