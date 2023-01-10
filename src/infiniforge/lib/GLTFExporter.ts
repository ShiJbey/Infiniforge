/**
 * This is a polyfilled version of the GLTFExporter from
 */
import "./polyfills";

export type GLTFData =
  | ArrayBuffer
  | {
      [key: string]: unknown;
    };

export { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
