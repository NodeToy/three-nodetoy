import * as THREE from "three";
import { NodeToyMaterial, NodeToyCullMode } from '@nodetoy/three-nodetoy';
import { data } from './shaderData';

const geometry = new THREE.SphereGeometry(1, 128, 128);
geometry.computeTangents(); // NEEDED if there is a normal map otherwise the normals will not be affected

// Load NodeToy materials
const material : any = new NodeToyMaterial({
    data,
    verbose: true,
    parameters: { // These have to have the same names given to the properties
        TimeScale: 29,
    },
    // flatShading: true,
    // transparent: true,
});

const mesh = new THREE.Mesh(geometry, material);

export default mesh;