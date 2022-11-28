import * as THREE from "three";
import { NodeToyMaterial, NodeToyCullMode } from '@nodetoy/three-nodetoy'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const group = new THREE.Group();

let sphereMaterial : any =  new NodeToyMaterial({ 
    url: "https://dev-draft.nodetoy.co/j8p4WJNH6YeZdodG",
    verbose: false,
    parameters: { // These have to have the same names given to the properties
        rimSize: 4.5,
    },
    // flatShading: true,
    transparent: true,
    cullMode: NodeToyCullMode.Back

});

let slinkyMaterial : any =  new NodeToyMaterial({ 
    url: "https://dev-draft.nodetoy.co/XXV9BPx9EeqTmRxn",
    verbose: false,
    parameters: { // These have to have the same names given to the properties
        brightness: 1.0,
    },
    // flatShading: true,
    transparent: true,
    cullMode: NodeToyCullMode.Back

});

// Add the sphere
const sphereGeometry = new THREE.SphereGeometry(85, 128, 128);
sphereGeometry.computeTangents(); // NEEDED if there is a normal map
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.y = 16.5;

// This is needed by ThreeJs to avoid that the object inside will disappear when viewed from a certain angle
sphere.renderOrder = 1;
group.add(sphere);

// Load NodeToy slinky
const loader = new GLTFLoader();
// Path relative to example/public
loader.load( '/slinky.glb', function ( object ) {

    const slinky = object.scene.children[0] as THREE.Mesh;
    const scale: number = 33
    slinky.scale.x = scale;
    slinky.scale.y = scale;
    slinky.scale.z = scale;
    slinky.position.y = -5;
    slinky.position.x = 48;
    slinky.position.z = 10;
    slinky.material = slinkyMaterial;

    group.add(slinky);
    
} );

export default group;