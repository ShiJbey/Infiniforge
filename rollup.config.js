import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "./src/infiniforge/index.ts",
    output: [
      {
        file: "./dist/esm/infiniforge.module.js",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "./dist/cjs/infiniforge.js",
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
    ],
    external: ["lodash", "three", "seedrandom", "vblob", "canvas"],
  },
  {
    input: "./src/infiniforge/index.ts",
    output: [{ file: "dist/types.d.ts", format: "esm" }],
    plugins: [dts.default({ tsconfig: "./tsconfig.json" })],
  },
];
