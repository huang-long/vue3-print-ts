import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import { defineConfig } from 'rollup';

export default defineConfig({
  input: "print/index.ts",
  output: [
    {
      file: "lib/index.esm.js",
      format: "es",
      sourcemap: true,
    },
    {
      file: "lib/index.esm.min.js",
      format: "es",
      sourcemap: true,
      plugins: [terser()],
    },
    {
      file: "lib/index.cjs.js",
      format: "cjs",
      exports: "default",
      sourcemap: true,
    },
    {
      file: "lib/index.cjs.min.js",
      format: "cjs",
      exports: "default",
      sourcemap: true,
      plugins: [terser()],
    },
    {
      file: "lib/index.umd.js",
      format: "umd",
      name: "Print",
      sourcemap: true,
    },
    {
      file: "lib/index.umd.min.js",
      format: "umd",
      name: "Print",
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true,
    }),
  ],
});
