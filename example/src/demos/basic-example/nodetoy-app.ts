import * as THREE from "three";
import { NodeToyMaterial, NodeToyCullMode } from '@nodetoy/three-nodetoy'

const geometry = new THREE.SphereGeometry(1, 128, 128);
geometry.computeTangents(); // NEEDED if there is a normal map otherwise the normals will not be affected

// Load NodeToy materials
const material : any = new NodeToyMaterial({
    url: "https://draft.nodetoy.co/nFvoIaHuvkvm3uMa",
    verbose: false,
    parameters: { // These have to have the same names given to the properties
        transmissionCoeff: 1.3,
        clearcoathVar: 1.0,
        clearcoatRoughVar: 0.3,
        transmissionMode: 0,
    },
    // flatShading: true,
    transparent: true,
});
    
const mesh = new THREE.Mesh(geometry, material);

export default mesh;