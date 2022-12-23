[<img src="./public/hero.png" width="128"/>](image.png)
# three-nodetoy

three-nodetoy allows you to export and use NodeToy graphs directly in your threejs websites.

🌈 [Nodetoy](https://nodetoy.co) is the shader tool for the web. NodeToy provides creators a powerful editor to create incredible new shaders and visual effects.

[Website](https://nodetoy.co/) &mdash;
[Twitter](https://twitter.com/nodetoy) &mdash;
[Discord](https://discord.gg/9ZbGRgZWeV) &mdash;

⚛️ Using React-Three-Fiber instead? Use [React-NodeToy](https://github.com/NodeToy/react-nodetoy).

## Demos

[https://three-nodetoy.vercel.app/](https://three-nodetoy.vercel.app/)


## Compatibility

Requires `threejs >= 0.143.0`

Older threejs versions might be supported but are untested.

## Install

With npm:
```sh
npm i @nodetoy/three-nodetoy
```

With yarn:
```sh
yarm add @nodetoy/three-nodetoy
```

Import `three-nodetoy` in your project:
```tsx
import { NodeToyMaterial } from '@nodetoy/three-nodetoy';
```

Declare your material:
```tsx
let material =  new NodeToyMaterial({ url: "https://draft.nodetoy.co/nFvoIaHuvkvm3uMa" });
```

If your materials are dynamic (use of Time, CosTime, SinTime, ...) add `NodeToyMaterial.tick()` to your render loop. See section `"Update Time / Dynamic uniforms"` for more information.

```tsx
NodeToyMaterial.tick();
```

## Example

Simple example:
```tsx

import * as THREE from "three";
import { NodeToyMaterial } from '@nodetoy/three-nodetoy';

let geometry = new THREE.PlaneGeometry(1, 1);
let material =  new NodeToyMaterial({ url: "https://draft.nodetoy.co/nFvoIaHuvkvm3uMa" });

let mesh = new THREE.Mesh(geometry, material);
mesh.position.x = 2;
scene.add(mesh);
```

# Update Time / Dynamic uniforms

Some nodes require uniforms to be updated every frame.
For this reason you should call `NodeToyMaterial.tick()` in your render loop.

```tsx
// Animate
function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.01;
  renderer.render(scene, camera);

  // Necessary to update dynamic uniforms such as time
  NodeToyMaterial.tick();
}
animate();
```

## Server-hosted VS. Self-hosted

NodeToy gives you the choice between either hosting the shader data for you or loading it your way.
You can choose the type of exporting in the exporter window (`Editor > Main menu > Export...`).

To load a `server-hosted` shader use the `url` parameter.
```tsx
let material =  new NodeToyMaterial({ url: "https://draft.nodetoy.co/nFvoIaHuvkvm3uMa" });
```

To load a `self-hosted` shader use the `data` parameter.
```tsx
import { data } from './shaderData'
let material =  new NodeToyMaterial({ data });
```

## API

```ts
enum NodeToyCullMode {
  Front,
  Back,
  None,
};

export interface NodeToyMaterialData {
	version: number;
  uniforms: any[];
  vertex: string;
  fragment: string;
  cullMode: NodeToyCullMode;
  lightModel: NodeToyMaterialType;
  renderType: NodeToyRenderType;
};

interface NodeToyMaterialOptions {
  url?: string;
  data?: NodeToyMaterialData;
  parameters?: any;
  toneMapped?: boolean;
  flatShading?: boolean;
  transparent?: boolean;
  cullMode?: NodeToyCullMode;
  verbose?: boolean;
  polygonOffset?: boolean;
  polygonOffsetFactor?: number;
  depthTest?: boolean;
  depthWrite?: boolean;
  envMapIntensity?: number;
};

const material = new NodeToyMaterial(options: NodeToyMaterialOptions);
```

#### url? : `string`

Define the NodeToy material to load. To export a material, open up the NodeToy material, click on the menu icon (top left corner) and select `Export...`. You can then generate a draft for your material, the URL will be generated for you.

#### data? : `NodeToyMaterialData`

Define the NodeToy material data to load from a self hosted source. To export a material, open up the NodeToy material, click on the menu icon (top left corner) and select `Export...`. Select `Self Hosted` and `Copy Shader Data`. Use the copied data to set this field.

#### parameters? : `Object`

Specifying the uniforms to be passed to the shader code. Those can be defined within the NodeToy editor by swiching inputs from `constants` to `parameters`.

#### toneMapped? : `Boolean`

Defines whether this material is tone mapped according to the renderer's toneMapping setting. Default is true.

#### flatShading?: `boolean`

Define whether the material is rendered with flat shading. Default is false.

#### cullMode?: `NodeToyCullMode`

Defines which side of faces won't be rendered - NodeToyCullMode.front, back or none. Default is NodeToyCullMode.Back.

#### verbose?: `boolean`

Whether to print the full log of the material. Only useful for development. Default is false. 

#### polygonOffset?: `boolean`

Whether to use polygon offset. Default is false. This corresponds to the GL_POLYGON_OFFSET_FILL WebGL feature.

#### polygonOffsetFactor?: `Integer`

Sets the polygon offset factor. Default is 0.

#### depthTest?: `boolean`

Whether to have depth test enabled when rendering this material. Default is true.

#### depthWrite? : `Boolean`

Whether rendering this material has any effect on the depth buffer. Default is true.

When drawing 2D overlays it can be useful to disable the depth writing in order to layer several things together without creating z-index artifacts.


#### envMapIntensity?: `number`

Set the intensity of the environment map. Default is 1.0.

---

## Contributing

We use [yarn](https://yarnpkg.com/), install the dependencies like this:

```bash
yarn
```

### Development

Run to build `three-nodetoy`

```bash
yarn dev
```

Then install the examples and run the local server

```bash
cd example
yarn install
cd ..
yarn demo
```

and visit `localhost:3001/demo/Basic` to browse the examples in `./example` folder.

### Build Library

```bash
yarn build
```

### Publish on npm

```bash
yarn deploy
```
