import * as THREE from 'three';
import App from './nodetoy-app';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { NodeToyMaterial } from '@nodetoy/three-nodetoy'

// Some definitions
let renderer : THREE.WebGLRenderer;
let renderTarget : THREE.WebGLRenderTarget, writeTarget : THREE.WebGLRenderTarget;
let scene : THREE.Scene;
let bloom : UnrealBloomPass;

let lightBounds : any;

const lights : any = [];
const RADIUS = 105;

let State : any;

export const setupScene = (container: HTMLElement) : ()=>void => {

  const containerBounds = container.getBoundingClientRect();
  const innerWidth = containerBounds.width;
  const innerHeight = containerBounds.height;

  // Simple form of tiled forward lighting
  // using texels as bitmasks of 32 lights
  THREE.ShaderChunk[ 'lights_pars_begin' ] += [
    '',
    '#if defined TILED_FORWARD',
    'uniform vec4 tileData;',
    'uniform sampler2D tileTexture;',
    'uniform sampler2D lightTexture;',
    '#endif'
  ].join( '\n' );

  THREE.ShaderChunk[ 'lights_fragment_end' ] += [
    '',
    '#if defined TILED_FORWARD',
    'vec2 tUv = floor(gl_FragCoord.xy / tileData.xy * 32.) / 32. + tileData.zw;',
    'vec4 tile = texture2D(tileTexture, tUv);',
    'for (int i=0; i < 4; i++) {',
    '	float tileVal = tile.x * 255.;',
    '  	tile.xyzw = tile.yzwx;',
    '	if(tileVal == 0.){ continue; }',
    '  	float tileDiv = 128.;',
    '	for (int j=0; j < 8; j++) {',
    '  		if (tileVal < tileDiv) {  tileDiv *= 0.5; continue; }',
    '		tileVal -= tileDiv;',
    '		tileDiv *= 0.5;',
    '  		PointLight pointlight;',
    '		float uvx = (float(8 * i + j) + 0.5) / 32.;',
    '  		vec4 lightData = texture2D(lightTexture, vec2(uvx, 0.));',
    '  		vec4 lightColor = texture2D(lightTexture, vec2(uvx, 1.));',
    '  		pointlight.position = lightData.xyz;',
    '  		pointlight.distance = lightData.w;',
    '  		pointlight.color = lightColor.rgb;',
    '  		pointlight.decay = lightColor.a;',
    '  		getPointLightInfo( pointlight, geometry, directLight );',
    '		RE_Direct( directLight, geometry, material, reflectedLight );',
    '	}',
    '}',
    '#endif'
  ].join( '\n' );

  State = {
    rows: 0,
    cols: 0,
    width: 0,
    height: 0,
    tileData: { value: null as any },
    tileTexture: { value: null as any },
    lightTexture: {
      value: new THREE.DataTexture( new Float32Array( 32 * 2 * 4 ), 32, 2, THREE.RGBAFormat, THREE.FloatType )
    },
  };

  // Screen rectangle bounds from light sphere's world AABB
  lightBounds = lightBoundsCompute();

  // Create renderer
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderTarget = new THREE.WebGLRenderTarget(innerWidth, innerHeight);
  writeTarget = new THREE.WebGLRenderTarget(innerWidth, innerHeight);
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( innerWidth, innerHeight );
  container!.appendChild( renderer.domElement );

  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x111111 );

  // Create camera
  const camera = new THREE.PerspectiveCamera( 40, innerWidth / innerHeight, 1, 2000 );
  camera.position.set( 0.0, 135.0, 400.0 );
  //camera.position.set(0, 2, 9 );

  scene.add( new THREE.AmbientLight( 0xffffff, 0.33 ) );

  // At least one regular Pointlight is needed to activate light support
  scene.add( new THREE.PointLight( 0xff0000, 0.1, 0.1 ) );

  bloom = new UnrealBloomPass( new THREE.Vector2( innerWidth, innerHeight ), 0.8, 0.6, 0.8 );
  bloom.renderToScreen = true;

  // Add OrbitControls to mouse around
  const controls = new OrbitControls( camera, renderer.domElement );


  function update( now : any ) {

    lights.forEach( function ( l : any ) {

      const ld = l._light;
      const radius = 0.8 + 0.2 * Math.sin( ld.pr + ( 0.6 + 0.3 * ld.sr ) * now );
      l.position.x = ( Math.sin( ld.pc + ( 0.8 + 0.2 * ld.sc ) * now * ld.dir ) ) * radius * RADIUS;
      l.position.z = ( Math.cos( ld.pc + ( 0.8 + 0.2 * ld.sc ) * now * ld.dir ) ) * radius * RADIUS;
      l.position.y = Math.sin( ld.py + ( 0.8 + 0.2 * ld.sy ) * now ) * radius * 32;

    } );

  }

  scene.onBeforeRender = tileLights;
  scene.onAfterRender = postEffect;

  // Resize window
  window.addEventListener( 'resize', onWindowResize );

  initLight();
  onWindowResize();

  // Add App to scene
  scene.add(App);
  App.position.y = -0.5

  renderer.setAnimationLoop( function ( time ) {

    update( time / 1000 );
    renderer.setRenderTarget( renderTarget );
    renderer.render( scene, camera );
    App.children[0].rotation.x = App.children[0].rotation.y += 0.02;

    // Necessary to update uniforms
    NodeToyMaterial.tick();

  } );

  // On resize window
  function onWindowResize() {
    const containerBounds = container.getBoundingClientRect();
    const innerWidth = containerBounds.width;
    const innerHeight = containerBounds.height;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( innerWidth, innerHeight );
    renderTarget.setSize( innerWidth, innerHeight );
    bloom.setSize( innerWidth, innerHeight );
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    resizeTiles(innerWidth, innerHeight);
  }
  // Clean up
  return ()=>{
    renderer.setAnimationLoop(null);
    renderer.dispose();
  }
}

// FUNCTIONS UTILS -------------------------------------------------------------------

function resizeTiles(innerWidth : number, innerHeight : number) {

  const width = innerWidth;
  const height = innerHeight;

  State.width = width;
  State.height = height;
  State.cols = Math.ceil( width / 32 );
  State.rows = Math.ceil( height / 32 );
  State.tileData.value = [ width, height, 0.5 / Math.ceil( width / 32 ), 0.5 / Math.ceil( height / 32 ) ];
  State.tileTexture.value = new THREE.DataTexture( new Uint8Array( State.cols * State.rows * 4 ), State.cols, State.rows );

}

const lightBoundsCompute = () => {

  const v = new THREE.Vector3();
  return function ( camera : any, pos : any, r : any ) {

    let minX = State.width, maxX = 0, minY = State.height, maxY = 0;
    const hw = State.width / 2, hh = State.height / 2;

    for ( let i = 0; i < 8; i ++ ) {

      v.copy( pos );
      v.x += i & 1 ? r : - r;
      v.y += i & 2 ? r : - r;
      v.z += i & 4 ? r : - r;
      const vector = v.project( camera );
      const x = ( vector.x * hw ) + hw;
      const y = ( vector.y * hh ) + hh;
      minX = Math.min( minX, x );
      maxX = Math.max( maxX, x );
      minY = Math.min( minY, y );
      maxY = Math.max( maxY, y );

    }

    return [ minX, maxX, minY, maxY ];

  };

};

// Generate the light bitmasks and store them in the tile texture
function tileLights( renderer : any, scene : any, camera : any ) {

  if ( ! camera.projectionMatrix ) return;

  const d = State.tileTexture.value.image.data;
  const ld = State.lightTexture.value.image.data;

  const viewMatrix = camera.matrixWorldInverse;

  d.fill( 0 );

  const vector = new THREE.Vector3();

  lights.forEach( function ( light : any, index : any ) {

    vector.setFromMatrixPosition( light.matrixWorld );

    const bs : any = lightBounds( camera, vector, light._light.radius );

    vector.applyMatrix4( viewMatrix );
    vector.toArray( ld, 4 * index );
    ld[ 4 * index + 3 ] = light._light.radius;
    light._light.color.toArray( ld, 32 * 4 + 4 * index );
    ld[ 32 * 4 + 4 * index + 3 ] = light._light.decay;

    if ( bs[ 1 ] < 0 || bs[ 0 ] > State.width || bs[ 3 ] < 0 || bs[ 2 ] > State.height ) return;
    if ( bs[ 0 ] < 0 ) bs[ 0 ] = 0;
    if ( bs[ 1 ] > State.width ) bs[ 1 ] = State.width;
    if ( bs[ 2 ] < 0 ) bs[ 2 ] = 0;
    if ( bs[ 3 ] > State.height ) bs[ 3 ] = State.height;

    const i4 = Math.floor( index / 8 ), i8 = 7 - ( index % 8 );

    for ( let i = Math.floor( bs[ 2 ] / 32 ); i <= Math.ceil( bs[ 3 ] / 32 ); i ++ ) {

      for ( let j = Math.floor( bs[ 0 ] / 32 ); j <= Math.ceil( bs[ 1 ] / 32 ); j ++ ) {

        d[ ( State.cols * i + j ) * 4 + i4 ] |= 1 << i8;

      }

    }

  } );

  State.tileTexture.value.needsUpdate = true;
  State.lightTexture.value.needsUpdate = true;

}

function initLight() {

  const sphereGeom = new THREE.SphereGeometry( 0.4, 32, 32 );

 for( let index = 0; index < 10; index++ ) {

    const g = new THREE.Group();

    g.rotation.y = index * Math.PI / 2;
    g.position.x = Math.sin( index * Math.PI / 2 ) * RADIUS;
    g.position.z = Math.cos( index * Math.PI / 2 ) * RADIUS;

    for ( let i = 0; i < 16; i ++ ) {

      const color = new THREE.Color().setHSL( Math.random(), 1.0, 0.5 );
      const l = new THREE.Group();

      l.add( new THREE.Mesh(
        sphereGeom,
        new THREE.MeshBasicMaterial( {
          color: color,
        } )
      ) );

      l.add( new THREE.Mesh(
        sphereGeom,
        new THREE.MeshBasicMaterial( {
          color: color,
          transparent: true,
          opacity: 0.1
        } )
      ) );
      
      l.children[1].renderOrder = 1;

      l.children[ 1 ].scale.set( 6.7, 6.7, 6.7 );

      (l as any)._light = {
        color: color,
        radius: RADIUS,
        decay: 1,
        sy: Math.random(),
        sr: Math.random(),
        sc: Math.random(),
        py: Math.random() * Math.PI,
        pr: Math.random() * Math.PI,
        pc: Math.random() * Math.PI,
        dir: Math.random() > 0.5 ? 1 : - 1
      };

      lights.push( l );
      g.add( l );

    }

    scene.add( g );

  }

}

function postEffect( renderer : any ) {
  bloom.render( renderer, writeTarget, renderTarget, 0.1, true );
}