import * as THREE from "three";
import { NodeToyMaterial, NodeToyCullMode } from '@nodetoy/three-nodetoy'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const group = new THREE.Group();

// NodeToy materials
const body =  new NodeToyMaterial({ 
    url: "https://draft.nodetoy.co/ZP4tI1EuOrUYCgbi",
    verbose: false,
    parameters: { // These have to have the same names given to the properties
        albedoCol: {x: 0.94, y: 0.93, z: 0.95, w: 1},
        rimCol: {x: 0.99, y: 0.46, z: 0.82, w: 1},
        fresnelScale: 1,
        fresnelpow: 1,
    },
    transparent: true,
    cullMode: NodeToyCullMode.Back,
});

const eyesEars = new NodeToyMaterial({ 
    url: "https://draft.nodetoy.co/abNL6AtOvUWiJn2p",
    verbose: false,
    parameters: { // These have to have the same names given to the properties
        color1: {x: 0.96, y: 0.67, z: 0.93, w: 1},
        color2: {x: 1, y: 0.83, z: 0.55, w: 1},
    },
    transparent: true,
    cullMode: NodeToyCullMode.Back,
});

const pupils = new NodeToyMaterial({ 
    url: "https://draft.nodetoy.co/o7LGAuBzxhfl7gna",
    verbose: false,
    parameters: { // These have to have the same names given to the properties
        pupilColor: {x: 0.1, y: 0.1, z: 0.1, w: 1},
    },
    transparent: true,
    cullMode: NodeToyCullMode.Back,
});

const terrain = new NodeToyMaterial({ 
    url: "https://draft.nodetoy.co/WqpZDh2D05F48qlV",
    verbose: false,
    parameters: { // These have to have the same names given to the properties
    },
    transparent: true,
    cullMode: NodeToyCullMode.Back,
});

const path = new NodeToyMaterial({ 
    url: "https://draft.nodetoy.co/uOn53p5aNDVRPXkm",
    verbose: false,
    parameters: { // These have to have the same names given to the properties
    },
    transparent: true,
    cullMode: NodeToyCullMode.Back,
});

const gems = new NodeToyMaterial({ 
    url: "https://draft.nodetoy.co/IHCT8mmkgWwCaVnQ",
    verbose: false,
    parameters: { // These have to have the same names given to the properties
    },
    transparent: true,
    cullMode: NodeToyCullMode.Back,
});

// Load the GLb file
const loader = new GLTFLoader();
// Model from https://spline.design, modified and added materials slots in Blender :)
// Path relative to example/public
loader.load( '/scene.gltf', function ( object ) { 

    const glbMesh : any = object.scene.children[0] as THREE.Mesh;
    glbMesh.scale.x = glbMesh.scale.y = glbMesh.scale.z = 0.0012;
    glbMesh.position.y = 1;
    glbMesh.position.x = -1;
    
    // Assign materials slots
    glbMesh.getObjectByName( 'Body' ).material = body;
    glbMesh.getObjectByName( 'Feet_1' ).material = body;
    glbMesh.getObjectByName( 'Feet_2' ).material = body;
    glbMesh.getObjectByName( 'Ear_Left_Part_1' ).material = body;
    glbMesh.getObjectByName( 'Ear_Right_Part_1' ).material = body;

    glbMesh.getObjectByName( 'Ear_Left_Part_2' ).material = eyesEars;
    glbMesh.getObjectByName( 'Ear_Right_Part_2' ).material = eyesEars;
    glbMesh.getObjectByName( 'Sphere001' ).material = eyesEars;
    glbMesh.getObjectByName( 'Sphere003' ).material = eyesEars;

    glbMesh.getObjectByName( 'Sphere' ).material = pupils;
    glbMesh.getObjectByName( 'Sphere002' ).material = pupils;

    glbMesh.getObjectByName( 'Mouth' ).material = path;

    glbMesh.getObjectByName( 'Cube001' ).material = path;
    glbMesh.getObjectByName( 'Cube003' ).material = path;
    glbMesh.getObjectByName( 'Cube004' ).material = path;
    glbMesh.getObjectByName( 'Cube005' ).material = path;
    glbMesh.getObjectByName( 'Cube008' ).material = path;
    glbMesh.getObjectByName( 'Cube010' ).material = path;
    glbMesh.getObjectByName( 'Cube012' ).material = path;
    glbMesh.getObjectByName( 'Cube013' ).material = path;
    glbMesh.getObjectByName( 'Cube017' ).material = path;
    glbMesh.getObjectByName( 'Cube021' ).material = path;
    glbMesh.getObjectByName( 'Cube022' ).material = path;
    glbMesh.getObjectByName( 'Cube018').material = path;

    glbMesh.getObjectByName( 'Crystal_1' ).material = gems;
    glbMesh.getObjectByName( 'Crystal_2' ).material = gems;
    glbMesh.getObjectByName( 'Crystal_3' ).material = gems;

    glbMesh.getObjectByName( 'Cube_2' ).material = terrain;
    //glbMesh.getObjectByName( 'Cube_2' ).geometry.computeTangents(); // Needed if the material has a normal map
    glbMesh.getObjectByName( 'Cube002' ).material = terrain;
    glbMesh.getObjectByName( 'Cube006').material = terrain;
    glbMesh.getObjectByName( 'Cube007').material = terrain;
    glbMesh.getObjectByName( 'Cube009' ).material = terrain;
    glbMesh.getObjectByName( 'Cube011' ).material = terrain;
    glbMesh.getObjectByName( 'Cube014').material = terrain;
    glbMesh.getObjectByName( 'Cube015').material = terrain;
    glbMesh.getObjectByName( 'Cube016' ).material = terrain;
    glbMesh.getObjectByName( 'Cube019').material = terrain;
    glbMesh.getObjectByName( 'Cube020' ).material = terrain;
    glbMesh.getObjectByName( 'Cube_copy' ).material = terrain;
    glbMesh.getObjectByName( 'Cube_copy001' ).material = terrain;
    glbMesh.getObjectByName( 'Cube_copy002' ).material = terrain;
    glbMesh.getObjectByName( 'Cube_copy003' ).material = terrain;
    glbMesh.getObjectByName( 'Cube_copy005' ).material = terrain;
    glbMesh.getObjectByName( 'Cube_copy008').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy009').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy010').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy012').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy013').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy015').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy016').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy017').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy018').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy019').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy020').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy021').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy022').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy023').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy024').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy025').material = terrain;
    glbMesh.getObjectByName( 'Cube_copy026').material = terrain;

    group.add(glbMesh);
    
} );

export default group;