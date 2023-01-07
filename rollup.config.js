import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: "./src/infiniforge/index.ts",
    output: [
      {
        file: "./dist/esm/infiniforge.js",
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
        // pass custom options to the resolve plugin
        moduleDirectories: ["node_modules"],
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser(),
    ],
    external: ["lodash", "three"],
  },
];
