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

  // Create renderer
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( innerWidth, innerHeight );
  container!.appendChild( renderer.domElement );

  // Add scene
  scene = new THREE.Scene();

  // Add camera
  camera = new THREE.PerspectiveCamera( 40, innerWidth / innerHeight, 0.1, 1000 );
  camera.position.set(5, 5, 11 );
  camera.lookAt(0,0,0);

  // Add some lights
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
  scene.add( directionalLight );
  const directionalLigh2 = new THREE.DirectionalLight( 0xffffff, 0.7 );
  directionalLigh2.position.y = -6;
  scene.add( directionalLigh2 );
  const directionalLigh3 = new THREE.DirectionalLight( 0xffffff, 0.5 );
  directionalLigh3.position.z = 3;
  directionalLigh3.position.x = 3;
  scene.add( directionalLigh3 );

  const light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );

  // Create gradient background
  const vertexShader = `
  varying vec3 vWorldPosition;
    void main() {
        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`;
  const fragmentShader = `
  uniform vec3 topColor;
    uniform vec3 bottomColor;
    varying vec3 vWorldPosition;
    void main() {
        float h = normalize( vWorldPosition).y + 0.65;
        gl_FragColor = vec4( mix( bottomColor, topColor, max( h * 1.5, 0.0 ) ), 1.0 );
    }`;

  const SKY_SIZE = 300;

    const uniforms = {
      bottomColor: { value: new THREE.Color(0.75, 0.95, 0.97) },
      topColor: { value: new THREE.Color(0.51, 0.85, 0.97) }
  }
  const skyGeo = new THREE.SphereGeometry(SKY_SIZE, 32, 15)
  const skyMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
  })
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  // Add NodeToy App to scene: this contains the model and the materials
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
  renderer.render( scene, camera );
  controls.update()
  // Necessary to update uniforms
  NodeToyMaterial.tick();
}