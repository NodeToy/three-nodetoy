import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { NodeToyMaterial, NodeToyCullMode } from '@nodetoy/three-nodetoy'

let camera : THREE.PerspectiveCamera, scene : THREE.Scene, renderer : THREE.WebGLRenderer;
let grid : any;
let controls : any;
let bodyMaterial : NodeToyMaterial, detailsMaterial : NodeToyMaterial;

const wheels : THREE.Object3D[] = [];

export const setupScene = (container: HTMLElement) : ()=>void => {

  init(container);
  animate();

  // Clean up
  return ()=>{
    window.cancelAnimationFrame(animationframeId);
    renderer.dispose();
  }
}

// On change handlers used in './index.tsx'
export const onChangeBodyColor = (event: any) => {
  const rgba = hexToRgba(event.target.value);
  const params = bodyMaterial.parameters;
  bodyMaterial.parameters.baseColor = {x: rgba[0], y: rgba[1], z: rgba[2], w: rgba[3]};
  bodyMaterial.parameters = params;
}
export const onChangeRimColor = (event: any) => {
  const rgba = hexToRgba(event.target.value);
  const params = bodyMaterial.parameters;
  bodyMaterial.parameters.rimColor = {x: rgba[0], y: rgba[1], z: rgba[2], w: rgba[3]};
  bodyMaterial.parameters = params;
}
export const onChangeDetailsColor = (event: any) => {
  const rgba = hexToRgba(event.target.value);
  const params = detailsMaterial.parameters;
  detailsMaterial.parameters.detailsColor = {x: rgba[0], y: rgba[1], z: rgba[2], w: rgba[3]};
  detailsMaterial.parameters = params;
}

// FUNCTIONS UTILS -------------------------------------------------------------------
function init(container: HTMLElement) {
  const containerBounds = container.getBoundingClientRect();
  const innerWidth = containerBounds.width;
  const innerHeight = containerBounds.height;

  // create renderer
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( innerWidth, innerHeight );
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  container!.appendChild( renderer.domElement );

  // Resize window
  window.addEventListener( 'resize', onWindowResize );

  // Add camera
  camera = new THREE.PerspectiveCamera( 40, innerWidth / innerHeight, 0.1, 100 );
  camera.position.set( 3.25, 2.5, - 3.5 );

  // Add orbit controls
  controls = new OrbitControls( camera, container );
  controls.enableDamping = true;
  controls.maxDistance = 9;
  controls.target.set( 0, 0.5, 0 );
  controls.update();

  // Add scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x333333 );
  scene.environment = new RGBELoader().load( '/venice_sunset_1k.hdr' ,()=>{});
  scene.environment.mapping = THREE.EquirectangularReflectionMapping;
  scene.fog = new THREE.Fog( 0x333333, 10, 15 );

  // Add grid
  grid = new THREE.GridHelper( 20, 40, 0xffffff, 0xffffff );
  grid.material.opacity = 0.2;
  grid.material.depthWrite = false;
  grid.material.transparent = true;
  scene.add( grid );

  // NodeToy materials
  if (!bodyMaterial) {
    bodyMaterial = new NodeToyMaterial({ 
      url: "https://draft.nodetoy.co/o3RIGCgaSSl86jip",
      verbose: false,
      parameters: { // These have to have the same names given to the properties
        baseColor: {x: 1.0, y: 0.0, z: 0.05, w: 1},
        rimColor: {x: 0.6, y: 0.0, z: 1.0, w: 1},
        clearcloatCar: 1.0,
        clearcloatRoughCar: 1.0,
        rimPower: 4,
      },
      // flatShading: true,
      transparent: true,
      cullMode: NodeToyCullMode.Back,
      envMapIntensity: 1, // Environment map's intensity (no effect if there is no envMap)
    });
  }
 
  if (!detailsMaterial) {
    detailsMaterial = new NodeToyMaterial({ 
      url: "https://draft.nodetoy.co/MzaTafU49CCpaBNs",
      verbose: false,
      parameters: { // These have to have the same names given to the properties
        detailsColor: {x: 0.016, y: 1.0, z: 0.0, w: 1},
        stripesDetails: 1.0,
      },
      // flatShading: true,
      transparent: true,
      cullMode: NodeToyCullMode.Back,
      envMapIntensity: 1, // Environment map's intensity (no effect if there is no envMap)
    });
  }

  // Glass material
  const glassMaterial = new THREE.MeshPhysicalMaterial( {
    color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1.0
  } );

  // Add car
  const shadow = new THREE.TextureLoader().load( '/ferrari/ferrari_ao.png' );

  const dracoLoader = new DRACOLoader();
  // Paths relative to example/public
  dracoLoader.setDecoderPath( '/draco/' );
  const loader = new GLTFLoader();
  loader.setDRACOLoader( dracoLoader );

  loader.load( '/ferrari/ferrari.glb', function ( gltf ) {

    const carModel : any = gltf.scene.children[ 0 ];

    carModel.getObjectByName( 'body' ).material = bodyMaterial;
  
    carModel.getObjectByName( 'rim_fl' ).material = detailsMaterial;
    carModel.getObjectByName( 'rim_fr' ).material = detailsMaterial;
    carModel.getObjectByName( 'rim_rr' ).material = detailsMaterial;
    carModel.getObjectByName( 'rim_rl' ).material = detailsMaterial;
    carModel.getObjectByName( 'trim' ).material = detailsMaterial;
    carModel.getObjectByName( 'steering_leather' ).material = detailsMaterial;
    carModel.getObjectByName( 'carbon_fibre_trim' ).material = detailsMaterial;

    carModel.getObjectByName( 'glass' ).material = glassMaterial;

    wheels.push(
      carModel.getObjectByName( 'wheel_fl' ),
      carModel.getObjectByName( 'wheel_fr' ),
      carModel.getObjectByName( 'wheel_rl' ),
      carModel.getObjectByName( 'wheel_rr' )
    );

    // shadow
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry( 0.655 * 4, 1.3 * 4 ),
      new THREE.MeshBasicMaterial( {
        map: shadow, blending: THREE.MultiplyBlending, toneMapped: false, transparent: true
      } )
    );
    
    mesh.rotation.x = - Math.PI / 2;
    mesh.renderOrder = 2;
    carModel.add( mesh );

    scene.add( carModel );
  });

  // Resize window
  function onWindowResize() {
    const containerBounds = container.getBoundingClientRect();
    camera.aspect = containerBounds.width / containerBounds.height;
    camera.updateProjectionMatrix();
    renderer.setSize( containerBounds.width, containerBounds.height );
  }
}

// Convert hex color to rgba
function hexToRgba(hex: any, opacity = 1) {
  const array = (hex = hex.replace('#', '')).match(new RegExp('(.{' + hex.length/3 + '})', 'g')).map(function(l:any) { return parseInt(hex.length%2 ? l+l : l, 16) }).concat(isFinite(opacity) ? opacity : 1);
  return [array[0]/255, array[1]/255, array[2]/255, array[3]]
}

  // Tick function
let animationframeId = -1;
function animate() {
  animationframeId = requestAnimationFrame( animate );
  renderer.render( scene, camera );
  controls.update()

  // Scene animation
  const time = - performance.now() / 1000;
  for ( let i = 0; i < wheels.length; i ++ ) {
    wheels[ i ].rotation.x = time * Math.PI * 2;
  }
  grid.position.z = - ( time ) % 1;

  // Necessary to update uniforms
  NodeToyMaterial.tick();
}