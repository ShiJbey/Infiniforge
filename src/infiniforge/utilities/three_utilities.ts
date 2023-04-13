/** This file contains utility classes for using Infiniforge with ThreeJS */
import { Material, BufferGeometry, BufferAttribute, Mesh, Group } from "three";
import { GeometryData } from "../modeling/GeometryData";
import { Weapon } from "../Weapon";

export type MaterialFactoryFn = (options: {
  [key: string]: unknown;
}) => Material;

/** Keeps track of factory functions that create new THREE.Materials */
export class MaterialFactory {
  private static _registry: Map<string, MaterialFactoryFn> = new Map();

  public static register(name: string, factory: MaterialFactoryFn) {
    MaterialFactory._registry.set(name, factory);
  }

  public static instantiate(
    name: string,
    options: {
      [key: string]: unknown;
    }
  ): THREE.Material {
    const factoryFn = MaterialFactory._registry.get(name);

    if (factoryFn === undefined) {
      throw new Error(`Material factory not found for type, ${name}`);
    }

    return factoryFn(options);
  }
}

/** Struct used to represent instantiation parameters for a Material */
export interface MaterialData {
  name: string;
  options: { [key: string]: unknown };
}

/** Creates a map of materials from a map of material data */
export function createMaterialMap(
  materialData: Record<string, MaterialData>
): Record<string, THREE.Material> {
  const materialMap: Record<string, THREE.Material> = {};

  for (const [partName, data] of Object.entries(materialData)) {
    materialMap[partName] = MaterialFactory.instantiate(
      data.name,
      data.options
    );
  }

  return materialMap;
}

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

    const geometry = new BufferGeometry();
    geometry.setIndex(triangles);
    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setAttribute(
      "normal",
      new BufferAttribute(new Float32Array(normals), 3)
    );

    geometry.computeVertexNormals();

    const mesh = new Mesh(geometry, material);

    return mesh;
  }

  /**
   * Converts weapon data into a group of ThreeJS Mesh instances
   * @param weapon The weapon data
   * @returns A ThreeJS Group object containing the mesh of the weapon parts
   */
  public to_mesh(
    weapon: Weapon,
    materials: Record<string, Material>
  ): THREE.Group {
    const group: Group = new Group();

    for (const [name, part] of weapon.parts) {
      const mesh = this.convertGeometryToMesh(part, materials[name]);
      mesh.name = name;
      group.add(mesh);
    }

    return group;
  }
}
