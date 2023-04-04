import * as THREE from "three";
import { AbstractAttribute, Attribute } from "./Attribute";

/** Custom class for organizing/modifying 3D mesh information  */
export default class GeometryData {
  /** Vertex data */
  public vertices: THREE.Vector3[] = [];
  /** Vertex color data */
  public colors: THREE.Color[] = [];
  /** Vertex normal data */
  public normals: THREE.Vector3[] = [];
  /** Triangle data */
  public triangles: THREE.Vector3[] = [];
  /** Additional vertex attribute data */
  public attributes: Map<string, AbstractAttribute> = new Map();

  /**
   * Adds a new vertex to the geometry
   * @param position The position data for a vertex
   * @returns The position of the vertex in the vertex buffer
   */
  addVertex(position: THREE.Vector3): number {
    const vertexID = this.vertices.length;
    this.vertices.push(position);
    this.normals.push(new THREE.Vector3(0, 0, 0));
    this.colors.push(new THREE.Color(0, 0, 0));

    for (const [, attribute] of this.attributes) {
      // The attribute data buffers need to be the same length
      // as the vertex buffer
      attribute.addData();
    }

    return vertexID;
  }

  /**
   * Add a new triangle to the geometry
   * @returns The position of the triangle in the triangle buffer
   */
  addTriangle(triangle: THREE.Vector3): number {
    const triangleID = this.triangles.length;
    this.triangles.push(triangle);
    return triangleID;
  }

  /**
   * Adds an empty collection of attribute data to the geometry
   * @param name The name of the attribute
   * @returns A reference to the attribute data
   */
  addAttribute<T>(name: string, defaultValue: T): Attribute<T> {
    const attribute = new Attribute<T>(name, defaultValue);
    this.attributes.set(name, attribute);
    return attribute;
  }

  /**
   * Translate the geometry in 3D space
   * @param translation The direction to translate
   */
  translate(translation: THREE.Vector3): void {
    for (const vertex of this.vertices) {
      vertex.add(translation);
    }
  }

  /**
   * Scale the size of the geometry
   * @param scaleFactor The amount to scale in each direction
   */
  scale(scaleFactor: THREE.Vector3): void {
    for (const vertex of this.vertices) {
      vertex.multiply(scaleFactor);
    }
  }

  /**
   * Rotate the geometry in 3D space
   * @param quaternion The amount to rotate
   */
  rotate(quaternion: THREE.Quaternion): void {
    for (const vertex of this.vertices) {
      vertex.applyQuaternion(quaternion);
    }

    for (const normal of this.normals) {
      normal.applyQuaternion(quaternion);
    }
  }

  /**
   * Construct GeometryData object from threejs Geometry
   * @param threeGeometry An instance of a ThreeJS Geometry
   */
  static fromGeometry(threeGeometry: THREE.BufferGeometry): GeometryData {
    const geometryData = new GeometryData();

    const vertices = threeGeometry.getAttribute("position");
    const triangles = threeGeometry.getIndex();

    // Add vertices and default vertex colors
    for (let i = 0; i < vertices.count; i++) {
      geometryData.addVertex(
        new THREE.Vector3(vertices.getX(i), vertices.getY(i), vertices.getZ(i))
      );
    }

    if (triangles) {
      // Add triangle face information
      for (let i = 0; i < triangles.count; i++) {
        geometryData.addTriangle(
          new THREE.Vector3(
            triangles.getX(i),
            triangles.getY(i),
            triangles.getZ(i)
          )
        );
      }
    }

    return geometryData;
  }
}
