import {
  Vector3,
  Quaternion,
  Matrix4,
  Vector2,
  Shape,
  ShapeGeometry,
} from "three";

const Y_AXIS = new Vector3(0, 1, 0);

/**
 * Cross section data store the vertices
 * that can be used to create a CrossSection object
 */
export interface CrossSectionData {
  /** Name of the cross section */
  name?: string;
  /** (x,z) coordinates for vertices */
  vertices: number[];
}

/** Cross-section of a GeometryData object */
export class CrossSection {
  protected _vertices: Vector3[];

  protected _norm: Vector3;

  protected _rotation: Quaternion;

  protected _scale: Vector3;

  protected _translation: Vector3;

  protected _transform: Matrix4;

  constructor(crossSectionData?: CrossSectionData) {
    this._vertices = [];
    this._norm = Y_AXIS.clone();
    this._rotation = new Quaternion();
    this._scale = new Vector3(1, 1, 1);
    this._translation = new Vector3(0, 0, 0);
    this._transform = new Matrix4().compose(
      this._translation,
      this._rotation,
      this._scale
    );

    if (crossSectionData !== undefined) {
      // Check the number of vertices
      if (crossSectionData.vertices.length % 2 !== 0) {
        throw new Error("Invalid number of vertex components in cross section");
      }
      // Add the vertices to the CrossSection
      for (let i = 0; i < crossSectionData.vertices.length - 1; i += 2) {
        this.addVertex(
          new Vector3(
            crossSectionData.vertices[i],
            0,
            crossSectionData.vertices[i + 1]
          )
        );
      }
    }
  }

  /** Get cross-section vertices */
  getVertices(): Vector3[] {
    return this._vertices;
  }

  /** Get cross-section face norm */
  getNorm(): Vector3 {
    return this._norm;
  }

  /** Get cross section translation */
  getTranslation(): Vector3 {
    return this._translation;
  }

  /** Get the positions of the vertices relative to the center of the cross-section */
  getVerticesLocal(): Vector2[] {
    const mInverse = new Matrix4()
      .compose(this._translation, this._rotation, this._scale)
      .invert();
    const verts: Vector2[] = [];

    for (let i = 0; i < this._vertices.length; i++) {
      // Get the position of the vertex in object space
      const objectVert = this._vertices[i];

      // Get position of the vert relative to the cross-section
      const localVert = objectVert.clone().applyMatrix4(mInverse);

      verts.push(new Vector2(localVert.x, localVert.z));
    }

    return verts;
  }

  /** Set the position of a vertex */
  setVertexLocal(index: number, pos: Vector3): void {
    if (index < 0 || index > this._vertices.length) {
      throw new Error("Vertex index out of range");
    }

    // Calculate the transform matrix and its inverse
    const mat = new Matrix4().compose(
      this._translation,
      this._rotation,
      this._scale
    );

    // Get the vertex to modify
    const objectVert = this._vertices[index];

    // Get position of the vert relative to the cross-section
    const localVert = pos;

    localVert.applyMatrix4(mat);

    objectVert.copy(localVert);
  }

  /** Scale the position of an index */
  scaleVertex(index: number, scaleFactor: number): void {
    if (index < 0 || index > this._vertices.length) {
      throw new Error("Vertex index out of range");
    }

    // Calculate the transform matrix and its inverse
    const mat = new Matrix4().compose(
      this._translation,
      this._rotation,
      this._scale
    );
    const matInverse = new Matrix4().copy(mat).invert();

    // Get the vertex to modify
    const objectVert = this._vertices[index];

    // Get position of the vert relative to the cross-section
    const localVert = objectVert.clone().applyMatrix4(matInverse);

    // Scale the vertex
    localVert.multiplyScalar(scaleFactor);

    // Change the local vertex to object coordinates
    localVert.applyMatrix4(mat);

    // Update the vertex coordinates
    objectVert.copy(localVert);
  }

  /** Copy the transformation information of a given cross-section */
  copyTransform(crossSection: CrossSection): void {
    this._norm = crossSection._norm.clone();
    this._rotation = crossSection._rotation.clone();
    this._scale = crossSection._scale.clone();
    this._translation = crossSection._translation.clone();
  }

  /** Set the translation of the cross-section */
  setTranslation(direction: Vector3): void {
    this._translation = direction;
  }

  /** Set the norm of the cross-section */
  setNorm(norm: Vector3): void {
    this._norm = norm;
  }

  /** Add vertex to he cross-section */
  addVertex(vertex: Vector3): void {
    this._vertices.push(vertex);
  }

  /** Create CrossSection from threejs Shape */
  static createFromShape(shape: Shape): CrossSection {
    const crossSection = new CrossSection();

    // Create geometry from shape
    const geometry = new ShapeGeometry(shape);

    const verts = geometry.getAttribute("position");

    // Loop though the shape vertices and add
    // them to the new cross section
    for (let i = 0; i < verts.count; i++) {
      crossSection._vertices.push(new Vector3(verts.getX(i), 0, verts.getY(i)));
    }

    return crossSection;
  }

  /** Rotate cross-section */
  rotate(quaternion: Quaternion): void {
    // Calculate the transform matrix and its inverse
    let mat = new Matrix4().compose(
      this._translation,
      this._rotation,
      this._scale
    );
    const matInverse = new Matrix4().copy(mat).invert();

    this._rotation.multiply(quaternion);
    mat = new Matrix4().compose(this._translation, this._rotation, this._scale);

    for (let i = 0; i < this._vertices.length; i++) {
      // Get the position of the vertex in object space
      const objectVert = this._vertices[i];

      // Get position of the vert relative to the cross-section
      const localVert = objectVert.clone().applyMatrix4(matInverse);

      // Apply the rotation then redo the transformation back
      // to object-space coordinates
      localVert.applyMatrix4(mat);

      // Update the vertex coordinates
      objectVert.copy(localVert);
    }

    this._norm.applyQuaternion(quaternion);
  }

  /** Scale the size of the cross-section */
  scale(scaleFactor: Vector2 | number): void {
    if (typeof scaleFactor === "number") {
      scaleFactor = new Vector2(scaleFactor, scaleFactor);
    }

    // Calculate the transform matrix and its inverse
    const mat = new Matrix4().compose(
      this._translation,
      this._rotation,
      this._scale
    );
    const matInverse = new Matrix4().copy(mat).invert();

    for (let i = 0; i < this._vertices.length; i++) {
      // Get the position of the vertex in object space
      const objectVert = this._vertices[i];

      // Get position of the vert relative to the cross-section
      const localVert = new Vector3().copy(objectVert).applyMatrix4(matInverse);

      // Scale up the x and z components
      localVert.x *= scaleFactor.x;
      localVert.z *= scaleFactor.y;

      // Convert the local vert back to object space
      localVert.applyMatrix4(mat);

      // Set the positions of the objectVert
      objectVert.copy(localVert);
    }

    // Update the scale vector
    this._scale.multiply(new Vector3(scaleFactor.x, 1, scaleFactor.y));
  }

  /** Moves face vertices in the given direction */
  translate(direction: Vector3): void {
    for (let i = 0; i < this._vertices.length; i++) {
      this._vertices[i].add(direction);
    }

    this._translation.add(direction);
  }
}
