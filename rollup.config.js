import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";
import copy from "rollup-plugin-copy";

export default [
  {
    input: {
      infiniforge: "./src/infiniforge/index.ts",
      exporter_polyfills: "./src/infiniforge/utilities/exporter_polyfills.ts",
    },
    output: [
      {
        entryFileNames: "esm/[name].module.js",
        dir: "./dist",
        format: "esm",
        sourcemap: true,
      },
      {
        entryFileNames: "cjs/[name].js",
        dir: "./dist",
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        moduleDirectories: ["node_modules"],
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser(),
      copy({
        targets: [
          {
            src: "./data/cross_sections/*",
            dest: "./dist/data/cross_sections",
          },
          { src: "./data/templates/*", dest: "./dist/data/templates" },
        ],
      }),
    ],
    external: ["lodash", "three", "seedrandom", "vblob", "canvas"],
  },
  {
    input: {
      infiniforge: "./src/infiniforge/index.ts",
      exporter_polyfills: "./src/infiniforge/utilities/exporter_polyfills.ts",
    },
    output: [
      {
        entryFileNames: "types/[name].d.ts",
        dir: "./dist",
        format: "esm",
      },
    ],
    plugins: [dts.default({ tsconfig: "./tsconfig.json" })],
  },
];
