import * as THREE from 'three';

/**
 * @class CrossSection
 *
 * Cross sections are at the core of the modeling
 * procedure.
 */
export class CrossSection {

    public vertices: THREE.Vector3[];
    public norm: THREE.Vector3;

    constructor() {
        this.vertices = [];
        this.norm = new THREE.Vector3();
    }

    /**
     * Fills the Cross section, making it a solid shape
     */
    public fill() {
        // Pick a vertex

        // Connect it to all the others that it can see
    }


}
