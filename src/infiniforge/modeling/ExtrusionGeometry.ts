import * as THREE from "three";
import GeometryData from "./GeometryData";
import { CrossSection } from "./CrossSection";

/**
 * Swords are the core of this API and manage information about
 * their 3D geometry
 */
export default class ExtrusionGeometry extends GeometryData {

  private readonly _totalLength: number;

  private _currentLength: number;

  private _activeEdgeCurve?: THREE.Curve<THREE.Vector2>;

  private _extrusionCurve?: THREE.Curve<THREE.Vector2>;

  constructor(length: number, extrusionCurve?: THREE.Curve<THREE.Vector2>) {
    super();
    this._totalLength = length;
    this._currentLength = 0;
    this._extrusionCurve = extrusionCurve;
  }

  /** Set the edge curve for extrusion */
  setEdgeCurve(curve: THREE.Curve<THREE.Vector2>): this {
    this._activeEdgeCurve = curve;
    return this;
  }

  /** Extrudes the blade along the extrusion curve */
  extrude(distance: number): this {
    if (!this._activeCrossSection) {
      throw new Error("BladeGeometry does not have an active cross section");
    }

    if (!this._extrusionCurve) {
      super.extrude(distance);
      return this;
    }

    this._currentLength += distance;
    const t = this._currentLength / this._totalLength;

    super.extrude(distance);

    const extrusionPoint2D = this._extrusionCurve
      .getPoint(t)
      .multiplyScalar(this._totalLength);
    const extrusionPoint3D = new THREE.Vector3(
      0,
      extrusionPoint2D.y,
      extrusionPoint2D.x
    );
    const crossSectionPos: THREE.Vector3 =
      this._activeCrossSection.getTranslation();
    const toExtrusionPoint = new THREE.Vector3().subVectors(
      extrusionPoint3D,
      crossSectionPos
    );

    this.translate(toExtrusionPoint);

    const extrusionNorm2D = this._extrusionCurve.getTangent(t);
    const extrusionNorm3D = new THREE.Vector3(
      0,
      extrusionNorm2D.y,
      extrusionNorm2D.x
    );
    const crossSectionNorm = this._activeCrossSection.getNorm().normalize();
    const rotateAngle = new THREE.Quaternion().setFromUnitVectors(
      crossSectionNorm,
      extrusionNorm3D
    );

    this.rotate(rotateAngle);

    return this;
  }

  /**
   * Extrude the active cross-section along a given extrusion curve
   * while also modifying the edge vertices to match the given edge curve.
   */
  extrudeSection(
    edgeCurve: THREE.Curve<THREE.Vector2>,
    nSubdivisions: number,
    length: number,
    taper?: number | THREE.Vector2
  ): this {
    this.setEdgeCurve(edgeCurve);

    // distance of each intermediate extrusion along the curve
    const sampleInterval = length / nSubdivisions;
    let taperInterval: number | THREE.Vector2 = 1;

    if (typeof taper === "number") {
      taperInterval = 1 - taper / nSubdivisions;
    } else if (taper instanceof THREE.Vector2) {
      taperInterval = new THREE.Vector2(1, 1).sub(
        taper?.divideScalar(nSubdivisions)
      );
    }

    for (let i = 1; i <= nSubdivisions; i++) {
      this.extrude(sampleInterval);
      this.modifyEdgeVerts((sampleInterval * i) / length);
      if (taper) this.scale(taperInterval);
    }

    return this;
  }

  /**
   * Samples the active edge curve and sets the edge verts
   * of the active cross section accordingly
   *
   * @param samplePoint Number from [0, 1] used to sample the curve
   */
  modifyEdgeVerts(samplePoint: number): this {
    if (this._activeCrossSection === undefined) {
      throw new Error("BladeGeometry does not have an active cross section");
    }

    if (this._activeEdgeCurve === undefined) {
      throw new Error("BladeGeometry does not have an active edge curve");
    }

    const edgeScaleFactor = this._activeEdgeCurve.getPoint(samplePoint).x + 1;

    this._activeCrossSection.scale(new THREE.Vector2(1, edgeScaleFactor));

    return this;
  }

  /** Set the cross section for the blade */
  setBladeCrossSection(
    crossSection: CrossSection,
    edgeVerts: number[],
    color?: THREE.Color,
    normEdges?: number[],
    duplicateVerts = false
  ): this {
    if (!duplicateVerts) {
      super.setCrossSection(crossSection, color);
      this._bladeEdgeVertices = edgeVerts;
      return this;
    }

    // Array of duplicated vertices
    const dupedVerts: THREE.Vector3[] = [];
    const newEdgeVerts: number[] = [];

    // Loop through vers in original cross-section
    for (let i = 0; i < crossSection.getVertices().length; i++) {
      if (edgeVerts.includes(i)) {
        newEdgeVerts.push(dupedVerts.length);
        newEdgeVerts.push(dupedVerts.length + 1);
        dupedVerts.push(crossSection.getVertices()[i].clone());
      } else if (normEdges?.includes(i)) {
        dupedVerts.push(crossSection.getVertices()[i].clone());
      }
      dupedVerts.push(crossSection.getVertices()[i].clone());
    }

    // Convert the duplicated vertices to an array of numbers
    const verts: number[] = [];
    for (let i = 0; i < dupedVerts.length; i++) {
      verts.push(dupedVerts[i].x);
      verts.push(dupedVerts[i].z);
    }

    const modifiedCrossSection = new CrossSection({
      vertices: verts,
    });

    super.setCrossSection(modifiedCrossSection, color);
    this._bladeEdgeVertices = newEdgeVerts;
    return this;
  }

  /** Get the cross section used during transformations */
  clearActiveCrossSection(): this {
    this._activeCrossSection = undefined;
    return this;
  }

  /** Set the current cross section of the geometry */
  setCrossSection(crossSection: CrossSection): this {
    this._activeCrossSection = crossSection;
    this.vertices.push(...crossSection.getVertices());
    for (let i = 0; i < crossSection.getVertices().length; i++) {
      this.colors[i] = this._activeColor.clone();
    }
    return this;
  }

  /** Construct GeometryData object from threejs Geometry */
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

  /** Fill the active cross-section */
  fill(): this {
    if (!this._activeCrossSection) {
      throw new Error(
        "GeometryData does not have an active cross section to translate."
      );
    }

    // Construct a THREE.ShapeGeometry from the
    // points of the active cross-section
    const csShape = new THREE.Shape(
      this._activeCrossSection.getVerticesLocal()
    );
    const geometry = new THREE.ShapeGeometry(csShape);

    // Create copies of vertices for sharp edges
    const verts = this._activeCrossSection.getVertices();

    const vertIdxs: number[] = _.range(
      this.vertices.length - verts.length,
      this.vertices.length
    );

    const newCrossSection = new CrossSection();

    // Push vertices into the _vertices array prior to the
    // current cross section
    for (let i = 0; i < verts.length; i++) {
      const v = verts[i].clone();
      newCrossSection.addVertex(v);
      this.vertices.push(v);
      this.colors.push(this.colors[vertIdxs[i]].clone());
    }

    newCrossSection.copyTransform(this._activeCrossSection);
    this._activeCrossSection = newCrossSection;

    const faces = geometry.getIndex();
    if (faces) {
      // Copy the triangles data to this GeometryData object
      for (let i = 0; i < faces.count; i++) {
        this.triangles.push(
          new THREE.Vector3(faces.getX(i), faces.getY(i), faces.getZ(i))
        );
      }
    }

    return this;
  }

  /** Translate the active cross-section */
  translate(distance: THREE.Vector3 | number): this {
    if (!this._activeCrossSection) {
      throw new Error(
        "GeometryData does not have an active cross section to translate."
      );
    }

    const translationVector: THREE.Vector3 = new THREE.Vector3();

    if (typeof distance === "number") {
      translationVector.copy(this._activeCrossSection.getNorm().normalize());
      translationVector.multiplyScalar(distance);
    } else {
      translationVector.copy(distance);
    }

    this._activeCrossSection.translate(translationVector);

    return this;
  }

  /** Scale the active cross-section */
  scale(scaleFactor: THREE.Vector2 | number): this {
    if (!this._activeCrossSection) {
      throw new Error(
        "GeometryData does not have an active cross section to scale"
      );
    }
    this._activeCrossSection.scale(scaleFactor);
    return this;
  }

  /** Rotate the active cross-section */
  rotate(quaternion: THREE.Quaternion): this {
    if (!this._activeCrossSection) {
      throw new Error(
        "GeometryData does not have an active cross section to rotate"
      );
    }
    this._activeCrossSection.rotate(quaternion);
    return this;
  }

  /** Extrude the active cross section of a GeometryData object */
  extrude(direction: THREE.Vector3 | number): this {
    // Check that there is a cross section to extrude
    if (!this._activeCrossSection) {
      throw new Error(
        "GeometryData does not have an active cross section to extrude"
      );
    }

    const newCrossSection = new CrossSection();
    let translationVector: THREE.Vector3 = new THREE.Vector3();

    // Check the type of the direction variable
    if (typeof direction === "object") {
      if (direction instanceof THREE.Vector3) {
        translationVector = direction;
      }
    } else if (typeof direction === "number") {
      translationVector.copy(this._activeCrossSection.getNorm());
      translationVector.multiplyScalar(direction);
    }

    const previousVertIdxs: number[] = _.range(
      this.vertices.length - this._activeCrossSection.getVertices().length,
      this.vertices.length
    );

    const newVertIdxs: number[] = _.range(
      this.vertices.length,
      this.vertices.length + this._activeCrossSection.getVertices().length
    );

    // Add new set of vertices to the list
    for (let i = 0; i < previousVertIdxs.length; i++) {
      const vert = new THREE.Vector3();
      vert.copy(this.vertices[previousVertIdxs[i]]);
      vert.add(translationVector);
      this.vertices.push(vert);
      newCrossSection.addVertex(vert);
      this.colors.push(this.colors[previousVertIdxs[i]].clone());
    }

    newCrossSection.copyTransform(this._activeCrossSection);
    newCrossSection.setTranslation(
      newCrossSection.getTranslation().add(translationVector)
    );
    this._activeCrossSection = newCrossSection;

    // Create quads
    for (let i = 0; i < previousVertIdxs.length; i++) {
      if (i === previousVertIdxs.length - 1) {
        // Bottom-left triangle
        this.triangles.push(
          new THREE.Vector3(
            previousVertIdxs[i],
            previousVertIdxs[0],
            newVertIdxs[i]
          )
        );
        // Top-right triangle
        this.triangles.push(
          new THREE.Vector3(newVertIdxs[i], previousVertIdxs[0], newVertIdxs[0])
        );
      } else {
        // Bottom-left triangle
        this.triangles.push(
          new THREE.Vector3(
            previousVertIdxs[i],
            previousVertIdxs[i + 1],
            newVertIdxs[i]
          )
        );
        // Top-right triangle
        this.triangles.push(
          new THREE.Vector3(
            newVertIdxs[i],
            previousVertIdxs[i + 1],
            newVertIdxs[i + 1]
          )
        );
      }
    }

    return this;
  }
}
