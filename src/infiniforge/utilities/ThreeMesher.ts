import * as THREE from "three";
import GeometryData from "../modeling/GeometryData";
import Weapon from "../Weapon";

interface MaterialData {
  [key: string]: THREE.Material;
}

export const DEFAULT_STEEL_MATERIAL = new THREE.MeshStandardMaterial({
  vertexColors: true,
  side: THREE.DoubleSide,
  metalness: 1.0,
  roughness: 0.0,
});

/**
 * This class converts a Weapon instance into a ThreeJS
 * 3DObject group instance for use with ThreeJS.
 */
export class ThreeMesher {
  private convertGeometryToMesh(
    geometryData: GeometryData,
    material: THREE.Material
  ): THREE.Mesh {
    const vertices: number[] = [];
    for (const vertex of geometryData.vertices) {
      vertices.push(vertex.x);
      vertices.push(vertex.y);
      vertices.push(vertex.z);
    }

    const colors: number[] = [];
    for (const color of geometryData.colors) {
      colors.push(color.r);
      colors.push(color.g);
      colors.push(color.b);
    }

    const normals: number[] = [];
    for (const normal of geometryData.normals) {
      normals.push(normal.x);
      normals.push(normal.y);
      normals.push(normal.z);
    }

    const triangles: number[] = [];
    for (const triangle of geometryData.triangles) {
      triangles.push(triangle.x);
      triangles.push(triangle.y);
      triangles.push(triangle.z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(triangles);
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(new Float32Array(normals), 3)
    );
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(colors), 3)
    );

    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }

  /**
   * Converts weapon data into a group of ThreeJS Mesh instances
   * @param weapon The weapon data
   * @returns A ThreeJS Group object containing the mesh of the weapon parts
   */
  public to_mesh(weapon: Weapon, materials: MaterialData): THREE.Group {
    const group: THREE.Group = new THREE.Group();

    for (const [name, part] of weapon.parts) {
      const mesh = this.convertGeometryToMesh(part, materials[name]);
      mesh.name = name;
      group.add(mesh);
    }

    return group;
  }
}
