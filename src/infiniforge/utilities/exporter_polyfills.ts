/* eslint-disable no-var */

// polyfills.ts
import * as THREE from "three";
import { Canvas } from "canvas";
import { Blob as mockBlob, FileReader as mockFR } from "vblob";

declare global {
  var Blob: typeof mockBlob;
  var FileReader: typeof mockFR;
  var document: {
    createElement(nodeName: string): Canvas;
  };
}

// Patch global scope to imitate browser environment.
globalThis.Blob = mockBlob;
globalThis.FileReader = mockFR;
globalThis.THREE = THREE;
globalThis.document = {
  createElement: (nodeName: string): Canvas => {
    if (nodeName !== "canvas")
      throw new Error(`Cannot create node ${nodeName}`);
    const canvas = new Canvas(256, 256);
    // This isn't working — currently need to avoid toBlob(), so export to embedded .gltf not .glb.
    // canvas.toBlob = function () {
    //   return new Blob([this.toBuffer()]);
    // };
    return canvas;
  },
};

export {};
