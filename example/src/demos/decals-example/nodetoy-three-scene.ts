import * as THREE from 'three';

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';

import { NodeToyMaterial, NodeToyCullMode } from '@nodetoy/three-nodetoy'

let renderer : THREE.WebGLRenderer, scene : THREE.Scene, camera : THREE.PerspectiveCamera;
let mesh : THREE.Mesh;
let raycaster : THREE.Raycaster;
let line : THREE.Line;
let controls : OrbitControls;

const intersection = {
  intersects: false,
  point: new THREE.Vector3(),
  normal: new THREE.Vector3()
};
const mouse = new THREE.Vector2();
const intersects : any = [];

const textureLoader = new THREE.TextureLoader();

// Add NodeToy material that will be use for the decals: the 'baseColor' uniform will be randomly changed for each decals
let decalMaterial : any =  new NodeToyMaterial({ 
  url: "https://draft.nodetoy.co/gP6Mej2Uukzda5kk",
  verbose: false,
  parameters: { // These have to have the same names given to the properties
      //baseColor: {x: 1.0, y: 0.0, z: 0.0, w: 1}, 
      rimSize: 2.5,
  },
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -4,
  transparent: true,
  cullMode: NodeToyCullMode.Back

});

const decals : any = [];
let mouseHelper : THREE.Mesh;
const position = new THREE.Vector3();
const orientation = new THREE.Euler();
const size = new THREE.Vector3( 10, 10, 10 );

const params = {
  minScale: 10,
  maxScale: 20,
  rotate: true,
  clear: function () {
    removeDecals();
  }
};

export const setupScene = (container : HTMLElement) : ()=>void => {

  const containerBounds = container.getBoundingClientRect();

  const gui = init(container, containerBounds);

  // Add event listeners functions
  const onPointerDown = function () {
    moved = false;
  }
  const onPointerUp = function ( event : any ) {
    if ( moved === false ) {
      // Removing the x-offset due to the sidebar menu
      checkIntersection( event.clientX - containerBounds.x * 0.5, event.clientY );
      if ( intersection.intersects ) shoot();
    }
  }
  const onChange = function () {
    moved = true;
  }

  // Add event listeners
  window.addEventListener( 'resize', onWindowResize );
  let moved = false;
  controls.addEventListener( 'change', onChange );
  window.addEventListener( 'pointerdown', onPointerDown );
  window.addEventListener( 'pointerup', onPointerUp );
  window.addEventListener( 'pointermove', onPointerMove );
  function onPointerMove( event : any ) {
    if ( event.isPrimary ) {
      // Removing the x-offset due to the sidebar menu
      checkIntersection( event.clientX - containerBounds.x * 0.5, event.clientY );
    }
  }

  animate();

  // On resize window
  function onWindowResize() {
    const containerBounds = container.getBoundingClientRect();
    camera.aspect = containerBounds.width / containerBounds.height;
    camera.updateProjectionMatrix();
    renderer.setSize( containerBounds.width, containerBounds.height );
  }

  // Clean up
  return ()=>{
    window.cancelAnimationFrame(animationframeId);
    window.removeEventListener( 'change', onChange );
    window.removeEventListener( 'pointerdown', onPointerDown );
    window.removeEventListener( 'pointerup', onPointerUp );
    window.removeEventListener( 'pointermove', onPointerMove );
    renderer.dispose();
    gui.destroy();
  }
}

// FUNCTIONS -----------------------------------------------------------------------------------------

// Scene, geometries, raycaster, and GUI initialization function 
function init(container : HTMLElement, containerBounds : any ) {

  const innerWidth = containerBounds.width;
  const innerHeight = containerBounds.height;

  // Add renderer
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( innerWidth, innerHeight );

  container!.appendChild( renderer.domElement );

  // Add scene
  scene = new THREE.Scene();

  // Add the camera
  camera = new THREE.PerspectiveCamera( 45, innerWidth / innerHeight, 1, 1000 );
  camera.position.z = 120;

  // Add orbit control to navigate the scene
  controls = new OrbitControls( camera, renderer.domElement );
  controls.minDistance = 50;
  controls.maxDistance = 200;

  // Add lights
  scene.add( new THREE.AmbientLight( 0x443333 ) );
  const dirLight1 = new THREE.DirectionalLight( 0xffddcc, 1 );
  dirLight1.position.set( 1, 0.75, 0.5 );
  scene.add( dirLight1 );
  const dirLight2 = new THREE.DirectionalLight( 0xccccff, 1 );
  dirLight2.position.set( - 1, 0.75, - 0.5 );
  scene.add( dirLight2 );

  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints( [ new THREE.Vector3(), new THREE.Vector3() ] );

  line = new THREE.Line( geometry, new THREE.LineBasicMaterial() );
  scene.add( line );

  // Load the glb model
  loadLeePerrySmith();

  // Add the raycaster and raycaster functions
  raycaster = new THREE.Raycaster();

  mouseHelper = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 10 ), new THREE.MeshNormalMaterial() );
  mouseHelper.visible = false;
  scene.add( mouseHelper );

  // Add GUI
  const gui = new GUI();
  gui.add( params, 'minScale', 1, 30 );
  gui.add( params, 'maxScale', 1, 30 );
  gui.add( params, 'rotate' );
  gui.add( params, 'clear' );
  gui.open();

  return gui;
}

// Loading the glb model
function loadLeePerrySmith() {

  const loader = new GLTFLoader();

  loader.load( '/LeePerrySmith/LeePerrySmith.glb', function ( gltf ) {

    mesh = gltf.scene.children[ 0 ] as any;
    mesh.material = new THREE.MeshPhongMaterial( {
      specular: 0x111111,
      map: textureLoader.load( '/LeePerrySmith/Map-COL.jpg' ),
      specularMap: textureLoader.load( '/LeePerrySmith/Map-SPEC.jpg' ),
      normalMap: textureLoader.load( '/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg' ),
      shininess: 25
    } );

    scene.add( mesh );
    mesh.scale.set( 10, 10, 10 );

  } );

}

// raycaster intersection function
function checkIntersection( x : any, y : any ) {

  if ( mesh === undefined ) return;

  mouse.x = ( x / innerWidth ) * 2 - 1;
  mouse.y = - ( y / innerHeight ) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );
  raycaster.intersectObject( mesh, false, intersects );

  if ( intersects.length > 0 ) {
    const p = intersects[ 0 ].point;
    mouseHelper.position.copy( p );
    intersection.point.copy( p );

    const n = intersects[ 0 ].face.normal.clone();
    n.transformDirection( mesh.matrixWorld );
    n.multiplyScalar( 10 );
    n.add( intersects[ 0 ].point );

    intersection.normal.copy( intersects[ 0 ].face.normal );
    mouseHelper.lookAt( n );

    const positions = line.geometry.attributes.position;
    positions.setXYZ( 0, p.x, p.y, p.z );
    positions.setXYZ( 1, n.x, n.y, n.z );
    positions.needsUpdate = true;

    intersection.intersects = true;
    intersects.length = 0;
  } else {
    intersection.intersects = false;
  }
}

// Function to add the decals
function shoot() {

  position.copy( intersection.point );
  orientation.copy( mouseHelper.rotation );

  if ( params.rotate ) orientation.z = Math.random() * 2 * Math.PI;

  const scale = params.minScale + Math.random() * ( params.maxScale - params.minScale );
  size.set( scale, scale, scale );

  // Clone the material and choose a random baseColor
  const material = decalMaterial.clone();
  const color = new THREE.Color().setHSL( Math.random(), 1.0, 0.5 );
  const ntParams = material.parameters;
  ntParams.baseColor = {x: color.r, y: color.g, z: color.b, w: 1};
  material.parameters = ntParams;
  
  // Adding decal's geometry
  const decalGeom = new DecalGeometry( mesh, position, orientation, size );

  const m = new THREE.Mesh( decalGeom, material );

  decals.push( m );
  scene.add( m );

}

// Remove decals from the scene (done through GUI button)
function removeDecals() {
  decals.forEach( function ( d : any ) {
    scene.remove( d );
  } );
  decals.length = 0;
}

// Tick function
let animationframeId = -1;
function animate() {
  animationframeId = requestAnimationFrame( animate );
  renderer.render( scene, camera );
}