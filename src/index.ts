import * as THREE from 'three';
import { 
	generateUniforms, getUniformValue, getFullURL, materialUpdate, 
	GraphLoader,
	initThree,
	deepCopy,
	diff,
} from '@nodetoy/shared-nodetoy';

initThree();

// Create graph loader
const graphLoader = new GraphLoader();

export const CubeUVReflectionMapping = 306;

export enum NodeToyCullMode {
	Front,
	Back,
	None,
}

export enum NodeToyMaterialType {
	Standard = 'standard',
	Physical = 'physical',
	Unlit = 'unlit',
}

export enum NodeToyRenderType {
	Opaque = 'opaque',
	Transparent = 'transparent',
}

export interface NodeToyMaterialOptions {
	url: string;
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
}


class NodeToyMaterial extends THREE.ShaderMaterial {
	
	public verbose = false;

	// ---------------
	// TICK

	// Call this function in your update loop to use time based nodes
	// ex: NodeToyMaterial.tick();

	// Must be called each frame
	public static tick() {
		NodeToyMaterial._time.deltaTime = NodeToyMaterial._clock.getDelta();
		NodeToyMaterial._time.time += NodeToyMaterial._time.deltaTime;
	}



	// ---------------

	constructor(options?: NodeToyMaterialOptions) {
		super();

		(this as any).toneMapped = false;
		(this as any).flatShading = false;
		(this as any).transparent = true;
		(this as any).onBeforeRender = this.onBeforeRender;
		//(this as any).onBuild = this.onBuild;
		// Support normal and ao map
		(this as any).normalMap = new THREE.Texture();
		(this as any).tangentSpaceNormalMap = new THREE.Texture();
		(this as any).aoMap = new THREE.Texture();

		(this as any).polygonOffset = false;
		(this as any).polygonOffsetFactor = 0;
		(this as any).depthTest = true;
		(this as any).depthWrite = true;
		(this as any).envMapIntensity = 1.0;
		(this as any).side = THREE.FrontSide;

		(this as any).vertexShader = THREE.ShaderLib.standard.vertexShader;
		(this as any).fragmentShader = THREE.ShaderLib.standard.fragmentShader;

		if (options) {
			"verbose" in options && (this.verbose = options.verbose!);
			"url" in options && (this.url = options.url);
			"toneMapped" in options && ((this as any).toneMapped = options.toneMapped);
			"flatShading" in options && ((this as any).flatShading = options.flatShading);
			"transparent" in options && ((this as any).transparent = options.transparent);
			"cullMode" in options && (this.cullMode = options.cullMode);
			this._parameters = options.parameters? options.parameters : null;
			"polygonOffset" in options && ((this as any).polygonOffset = options.polygonOffset);
			"polygonOffsetFactor" in options && ((this as any).polygonOffsetFactor = options.polygonOffsetFactor);
			"depthTest" in options && ((this as any).depthTest = options.depthTest);
			"depthWrite" in options && ((this as any).depthWrite = options.depthWrite);
			"envMapIntensity" in options && ((this as any).envMapIntensity = options.envMapIntensity);
			this._options = options;
		}

		(this as any).defines = {
			STANDARD: '',
			USE_NORMALMAP: '',
			USE_TANGENT: '',
			TANGENTSPACE_NORMALMAP: '',
		};

		(this as any).uniforms = deepCopy(THREE.ShaderLib.physical.uniforms);
        (this as any).lights = true;
        (this as any).isShaderMaterial = true;
      	(this as any).isMeshStandardMaterial = false;
        (this as any).type = 'ShaderMaterial';
		(this as any).combine = THREE.MultiplyOperation;

		// Emit load request when graph url changes 
		graphLoader.events.on('load', (obj: any)=>{
			if (obj.url === this._fullURL) {
				this.loadShader(obj.data);
			}
		});
	}


	
	// -------------------------
	// PUBLIC

	public get cullMode() { return this._cullMode; }
    public set cullMode(value: NodeToyCullMode) {
		this._cullMode = value;
        (this as any).side = this.getTHREECullMode(value);
    }

    public refreshShader() {
        (this as any).version++;
        (this as any).dispose();
    }

	public clone(): this {
		return new (this.constructor as any)().copy(this)
	}
	
	public copy(source: NodeToyMaterial): this {
		super.copy(source as any);
		this._url = source._url;
		this.verbose = source.verbose;
		this._parameters && (this._parameters = {...source._parameters});
		
		(this as any).vertexShader = (source as any).vertexShader;
		(this as any).fragmentShader = (source as any).fragmentShader;
		(this as any).uniforms = deepCopy((source as any).uniforms);

		this._data = (source as any)._data;
		this.refreshShader();

		return this;
	}



	// -------------------------
	// LOAD

	// NOTE: previously named 'graph'
	public get url() {
		return this._url;
	} 
	public set url(value) {
		this._url = value;

		if (value) {
			const url = this._fullURL = getFullURL(value);

			if (this.verbose) {
				console.log(`[NodeToy] loading graph... | url: ${url}`);
			}

			// load from cache if available
			if (url in graphLoader.cache) {
				this.loadShader(graphLoader.cache[url]);
			}

			// send load request
			graphLoader.load(url);
		}
		else {
			console.warn(`[NodeToy] Missing material graph URL. Cannot load shader.`)
		}
	}

	public get parameters() { return this._parameters; }
	public set parameters(value) {
		this._parameters = value;

		if (this._data) {
			const uniforms = this._data.uniforms;

			const current = deepCopy((this as any).uniforms);
			const updated = generateUniforms( this.url, (this as any).uniforms, uniforms, value );
			const updatedKeys = Object.keys(diff(current, updated));

			for (let i = 0; i < updatedKeys.length; i++) {
				const key = updatedKeys[i];
				(this as any).uniforms[key] = updated[key];
			}
		}
	}




	// ---------------
	// PRIVATE

	private fromStringToEnumCullMode(mode : string){
		if (mode === "back"){
			return NodeToyCullMode.Back;
		}else if(mode === "front"){
			return NodeToyCullMode.Front;
		}
		return NodeToyCullMode.None;
	}

	private updateUniforms(dataUniforms: any) {
		let uniforms : any = [] // Changes to array will not change dataUniforms
		Object.assign(uniforms, dataUniforms) // Object.assign(target, source)

		if(this._parameters !== null){			
			for (const key in this._parameters) {
				for (let i = 0; i < uniforms.length; i++) {
					if(key === uniforms[i].name)
						uniforms[i].value = this._parameters[key];
				}
			}
		}

		return uniforms;
	}

	// load the shader from the network data received
	private loadShader(data: any) {
		if (this.verbose) {
			console.log(`[NodeToy] graph loaded.`, data, generateUniforms(this.url, (this as any).uniforms, data.uniforms));
		}
		
		// save original data
		this._data = data;

		(this as any).vertexShader = data.vertex;
		(this as any).fragmentShader = data.fragment;

		// Get the updated uniforms if any
		const updatedUniforms = this.updateUniforms(data.uniforms);
		(this as any).uniforms = generateUniforms(this.url, (this as any).uniforms, updatedUniforms);
		(this as any).refreshShader();

		if ("cullMode" in data && !("cullMode" in this._options)) {
			this.cullMode = this.fromStringToEnumCullMode(data.cullMode);
		}
		if ("lightModel" in data) {
			this._type = data.lightModel;
		}
		if ("renderType" in data) {
			this.transparent = data.renderType === NodeToyRenderType.Transparent;
		}
	}

	// ---------------
	// NODES UNIFORM UPDATE

	private onBeforeRender( renderer: any, scene: any, camera: any, _geometry: any, object: any ) {
		const frame = { 
			camera,
			object,
			renderer,
			scene,
			light: null as any,
			time: NodeToyMaterial._time.time,
			deltaTime: NodeToyMaterial._time.deltaTime,
		};
		if ((this as any).uniforms) {
			materialUpdate(frame, (this as any).uniforms);
		}

		//const env = new THREE.DataTexture();
		if (scene.environment && this._type !== NodeToyMaterialType.Unlit) {

			// environment has changed
			if (this._envUUID != scene.environment.uuid) {
				this._envUUID = scene.environment.uuid;
					
				const env = scene.environment.clone();
				env.mapping = THREE.CubeUVReflectionMapping;
				(this as any).envMap = env;
				(this as any).envMap.mapping = THREE.CubeUVReflectionMapping; // Forcing this type to be able to work with ShaderMaterial
				(this as any).envMapMode = CubeUVReflectionMapping;
				(this as any).uniforms.envMap.value = env;
				(this as any).uniforms.envMapIntensity.value = (this as any).envMapIntensity;
			}

			(this as any).defines = {
				STANDARD: '',
				USE_NORMALMAP: '',
				USE_ENVMAP: '',
				ENVMAP_TYPE_CUBE_UV: '',
				//ENVMAP_MODE_REFLECTION: '',
				//ENVMAP_BLENDING_NONE: '',
				// ENVMAP_BLENDING_MULTIPLY: '',
				USE_TANGENT: '',
				TANGENTSPACE_NORMALMAP: '',
			};
		}
		else {
			(this as any).envMap = null;
			
			if ('envMap' in (this as any).uniforms) {
				(this as any).uniforms.envMap.value = null;
			}

			(this as any).defines = {
				STANDARD: '',
				USE_NORMALMAP: '',
				USE_TANGENT: '',
				TANGENTSPACE_NORMALMAP: '',
			};
		}

		if(scene.fog){
			(this as any).defines.USE_FOG = ''
		}
	};


	// ---------------
	// RESET UNIFORMS

	public resetUniformByName = (name: string)=>{
		this.resetUniformsByName([name]);
	}

	public resetUniformsByName = (names: string[])=>{
		for (let i = 0; i < names.length; i++) {
			const key = names[i];
			for (let j = 0; j < this._data.uniforms.length; j++) {
				const uniform = this._data.uniforms[j] as any;
				if (uniform.name === key) {
					(this as any).uniforms[uniform.name] = { 
						value: getUniformValue(this._url, uniform.type, uniform.value), 
						type: uniform.type 
					};
					break;
				}
			}
		}
	}

	// ---------------
	// PRIVATE
	
	private getTHREECullMode(cullMode: NodeToyCullMode) {
		if (cullMode === NodeToyCullMode.None) {
			return THREE.DoubleSide;
		}
		if (cullMode === NodeToyCullMode.Front) {
			return THREE.BackSide;
		}
		return THREE.FrontSide;
	}

	// ---------------
	// INTERNAL DATA

	private _fullURL: any = null;
	private _url: any = null;
	private _data: any = null;
	private _parameters: Record<string, any> = {};
	private _cullMode: NodeToyCullMode = NodeToyCullMode.Back;
	private _type: NodeToyMaterialType = NodeToyMaterialType.Unlit;

	private _options: any = {};
	private _envUUID = null;

	private static _time = { time: 0, deltaTime: 0};
	private static _clock = new THREE.Clock();
}

export { 
	NodeToyMaterial
};
