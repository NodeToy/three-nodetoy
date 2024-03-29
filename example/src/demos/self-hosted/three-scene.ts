import * as THREE from 'three';
import App from './nodetoy-app';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { NodeToyMaterial } from '@nodetoy/three-nodetoy'

let camera : THREE.PerspectiveCamera, scene : THREE.Scene, renderer : THREE.WebGLRenderer;
let controls : OrbitControls;

export const setupScene = (container : HTMLElement) : ()=>void => {

  const containerBounds = container.getBoundingClientRect();
  const innerWidth = containerBounds.width;
  const innerHeight = containerBounds.height;

  // create renderer
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( innerWidth, innerHeight );
  renderer.outputEncoding = THREE.sRGBEncoding;
  container!.appendChild( renderer.domElement );

  // Create scene
  scene = new THREE.Scene();

  // Add scene
  scene.background = new THREE.Color( 0x333333 );
  // scene.environment = new RGBELoader().load( './venice_sunset_1k.hdr' ,()=>{});
  // scene.environment!.mapping = THREE.EquirectangularReflectionMapping;
  scene.fog = new THREE.Fog( 0x333333, 10, 15 );

  // Create camera
  camera = new THREE.PerspectiveCamera( 40, innerWidth / innerHeight, 1, 100 );
  camera.position.set(0, 0, 4 );

  const light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );

  const dirLight = new THREE.DirectionalLight( 0x404040 ); // soft white light
  scene.add( dirLight );

  // Add App to scene
  scene.add(App);

  // Add OrbitControls to mouse around
  controls = new OrbitControls( camera, renderer.domElement );

  // Resize window
  window.addEventListener( 'resize', onWindowResize );

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
    renderer.dispose();
  }
}

// FUNCTIONS UTILS -------------------------------------------------------------------

// Tick function
let animationframeId = -1;
function animate() {
  animationframeId = requestAnimationFrame( animate );
  App.rotation.x = App.rotation.y += 0.005;
  renderer.render( scene, camera );
  controls.update()

  // Necessary to update uniforms
  NodeToyMaterial.tick();
}

// Change the force shield
function changeForceShieldMode( mode : number) {
  const params = App.material.parameters;
  params.transmissionMode = mode;
  App.material.parameters = params;
}