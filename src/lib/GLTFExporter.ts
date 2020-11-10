/**
 * This is a highly specialized version of the
 * GLTFExporter from ThreeJS r120.
 *
 * At the moment, it only supports exporting
 * models that use vertex colors.
 */

import {
    BufferAttribute,
    BufferGeometry,
    ClampToEdgeWrapping,
    DoubleSide,
    InterpolateDiscrete,
    InterpolateLinear,
    LinearFilter,
    LinearMipmapLinearFilter,
    LinearMipmapNearestFilter,
    MathUtils,
    MirroredRepeatWrapping,
    NearestFilter,
    NearestMipmapLinearFilter,
    NearestMipmapNearestFilter,
    PropertyBinding,
    RGBAFormat,
    RepeatWrapping,
    Scene,
    Vector3,
    Object3D,
    AnimationClip, Material, Texture, Light, DirectionalLight, PointLight, SpotLight, Mesh, Camera, SkinnedMesh, KeyframeTrack, LineSegments, LineLoop, InterleavedBufferAttribute, MeshStandardMaterial, MeshBasicMaterial, ShaderMaterial, Geometry
} from "three";

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------
const WEBGL_CONSTANTS: any = {
    POINTS: 0x0000,
    LINES: 0x0001,
    LINE_LOOP: 0x0002,
    LINE_STRIP: 0x0003,
    TRIANGLES: 0x0004,
    TRIANGLE_STRIP: 0x0005,
    TRIANGLE_FAN: 0x0006,

    UNSIGNED_BYTE: 0x1401,
    UNSIGNED_SHORT: 0x1403,
    FLOAT: 0x1406,
    UNSIGNED_INT: 0x1405,
    ARRAY_BUFFER: 0x8892,
    ELEMENT_ARRAY_BUFFER: 0x8893,

    NEAREST: 0x2600,
    LINEAR: 0x2601,
    NEAREST_MIPMAP_NEAREST: 0x2700,
    LINEAR_MIPMAP_NEAREST: 0x2701,
    NEAREST_MIPMAP_LINEAR: 0x2702,
    LINEAR_MIPMAP_LINEAR: 0x2703,

    CLAMP_TO_EDGE: 33071,
    MIRRORED_REPEAT: 33648,
    REPEAT: 10497
};

var THREE_TO_WEBGL: any = {};

THREE_TO_WEBGL[ NearestFilter ] = WEBGL_CONSTANTS.NEAREST;
THREE_TO_WEBGL[ NearestMipmapNearestFilter ] = WEBGL_CONSTANTS.NEAREST_MIPMAP_NEAREST;
THREE_TO_WEBGL[ NearestMipmapLinearFilter ] = WEBGL_CONSTANTS.NEAREST_MIPMAP_LINEAR;
THREE_TO_WEBGL[ LinearFilter ] = WEBGL_CONSTANTS.LINEAR;
THREE_TO_WEBGL[ LinearMipmapNearestFilter ] = WEBGL_CONSTANTS.LINEAR_MIPMAP_NEAREST;
THREE_TO_WEBGL[ LinearMipmapLinearFilter ] = WEBGL_CONSTANTS.LINEAR_MIPMAP_LINEAR;
THREE_TO_WEBGL[ ClampToEdgeWrapping ] = WEBGL_CONSTANTS.CLAMP_TO_EDGE;
THREE_TO_WEBGL[ RepeatWrapping ] = WEBGL_CONSTANTS.REPEAT;
THREE_TO_WEBGL[ MirroredRepeatWrapping ] = WEBGL_CONSTANTS.MIRRORED_REPEAT;

const PATH_PROPERTIES: any = {
    scale: 'scale',
    position: 'translation',
    quaternion: 'rotation',
    morphTargetInfluences: 'weights'
};

//------------------------------------------------------------------------------
// GLTF Exporter
//------------------------------------------------------------------------------
export interface GLTFExporterOptions {
    binary?: boolean;
    trs?: boolean;
    onlyVisible?: boolean;
    truncateDrawRange?: boolean;
    embedImages?: boolean;
    animations?: AnimationClip[];
    forceIndices?: boolean;
    forcePowerOfTwoTextures?: boolean;
    includeCustomExtensions?: boolean;
    maxTextureSize?: number;
    verbose?: boolean;
}

export interface GLTFJSON {
    asset: {"version":string, "generator": string};
    scenes?: GLTFScene[];
    scene?: number;
    nodes?: GLTFNode[];
    extensionsUsed?: string[];
    buffers?: {
        byteLength:number;
        uri: string
    }[];
    bufferViews?: {
        buffer: number;
        byteOffset: number;
        target: number;
        byteStride: number;

    }[];
    accessors?: {
        bufferView: number;
        componentType: number;
        count: number;
        max: number[];
        min: number[];
        type: string;
    }[];
    materials?: {
        pbrMetallicRoughness? :{
            metallicFactor?: number;
            roughnessFactor?: number;
        }
        doubleSided: boolean;
    }[];
    meshes?: {
        primitives?: {
            mode?: number;
            attributes?: {
                POSITION?: number;
                COLOR_0?: number;
                NORMAL?: number
            };
            indices: number;
            material: number;
        }[];
    }[];
}

export interface GLTFScene {
    name?: string;
    nodes?: number[];
    extras?: any;
    extensions?: any;
}

export interface GLTFMesh {

}



export interface GLTFNode {
    name?: string;
    rotation?: [number, number, number, number];
    translation?: [number, number, number];
    scale?: [number, number, number];
    matrx?:  [ number, number, number, number,
               number, number, number, number,
               number, number, number, number,
               number, number, number, number ];
    mesh?: number;
    children?: number[];
}

export class GLTFExporter {

    constructor() { }

    /**
     * Parse scenes and generate GLTF output
     * @param  {Scene or [THREE.Scenes]} input   Scene or Array of THREE.Scenes
     * @param  {Function} onDone  Callback on completed
     * @param  {Object} options options
     */
    parse( input: Object3D, onDone: ( gltf: object ) => void, options: GLTFExporterOptions ): void {

        var DEFAULT_OPTIONS: GLTFExporterOptions = {
            binary: false,
            trs: false,
            onlyVisible: true,
            truncateDrawRange: true,
            embedImages: true,
            maxTextureSize: Infinity,
            animations: [],
            forcePowerOfTwoTextures: false,
            includeCustomExtensions: false,
            verbose: false
        };

        options = Object.assign( {}, DEFAULT_OPTIONS, options );

        if ( options.animations && options.animations.length > 0 ) {

            // Only TRS properties, and not matrices, may be targeted by animation.
            options.trs = true;

        }

        var outputJSON: GLTFJSON = {

            asset: {

                version: "2.0",
                generator: "GLTFExporter"

            }

        };

        var byteOffset: number = 0;
        var buffers: Buffer[] = [];
        var pending: Promise<any>[] = [];
        var nodeMap = new Map<Object3D, number>();
        var extensionsUsed: any = {};
        var cachedData: any = {

            meshes: new Map<string, number>(),
            attributes: new Map(),
            attributesNormalized: new Map<BufferAttribute | InterleavedBufferAttribute, BufferAttribute>(),
            materials: new Map(),
            textures: new Map(),
            images: new Map<ImageData, any>()

        };

        var cachedCanvas: any;

        var uids = new Map<object, number>();
        var uid = 0;

        /**
         * Assign and return a temporal unique id for an object
         * especially which doesn't have .uuid
         * @param  {Object} object
         * @return {Integer}
         */
        function getUID( object: object ) {

            if ( ! uids.has( object ) ) uids.set( object, uid ++ );

            return uids.get( object );

        }

        /**
         * Compare two arrays
         * @param  {Array} array1 Array 1 to compare
         * @param  {Array} array2 Array 2 to compare
         * @return {Boolean}        Returns true if both arrays are equal
         */
        function equalArray( array1: any[], array2: any[] ) {

            return ( array1.length === array2.length ) && array1.every( function ( element, index ) {

                return element === array2[ index ];

            } );

        }

        /**
         * Converts a string to an ArrayBuffer.
         * @param  {string} text
         * @return {ArrayBuffer}
         */
        function stringToArrayBuffer( text: string ): ArrayBuffer {

            return Buffer.from( text );

        }

        /**
         * Get the min and max vectors from the given attribute
         * @param  {BufferAttribute} attribute Attribute to find the min/max in range from start to start + count
         * @param  {Integer} start
         * @param  {Integer} count
         * @return {Object} Object containing the `min` and `max` values (As an array of attribute.itemSize components)
         */
        function getMinMax( attribute: BufferAttribute | InterleavedBufferAttribute, start: number, count: number ) {

            var output = {

                min: new Array( attribute.itemSize ).fill( Number.POSITIVE_INFINITY ),
                max: new Array( attribute.itemSize ).fill( Number.NEGATIVE_INFINITY )

            };

            for ( var i = start; i < start + count; i ++ ) {

                for ( var a = 0; a < attribute.itemSize; a ++ ) {

                    var value = attribute.array[ i * attribute.itemSize + a ];
                    output.min[ a ] = Math.min( output.min[ a ], value );
                    output.max[ a ] = Math.max( output.max[ a ], value );

                }

            }

            return output;

        }

        /**
         * Checks if image size is POT.
         *
         * @param {Image} image The image to be checked.
         * @returns {Boolean} Returns true if image size is POT.
         *
         */
        function isPowerOfTwo( image: ImageData ) {

            return MathUtils.isPowerOfTwo( image.width ) && MathUtils.isPowerOfTwo( image.height );

        }

        /**
         * Checks if normal attribute values are normalized.
         *
         * @param {BufferAttribute} normal
         * @returns {Boolean}
         *
         */
        function isNormalizedNormalAttribute( normal: BufferAttribute | InterleavedBufferAttribute ) {

            if ( cachedData.attributesNormalized.has( normal ) ) {

                return false;

            }

            var v = new Vector3();

            for ( var i = 0, il = normal.count; i < il; i ++ ) {

                // 0.0005 is from glTF-validator
                if ( Math.abs( v.fromArray( normal.array, i * 3 ).length() - 1.0 ) > 0.0005 ) return false;

            }

            return true;

        }

        /**
         * Creates normalized normal buffer attribute.
         *
         * @param {BufferAttribute} normal
         * @returns {BufferAttribute}
         *
         */
        function createNormalizedNormalAttribute( normal: BufferAttribute | InterleavedBufferAttribute ): BufferAttribute {

            if ( cachedData.attributesNormalized.has( normal ) ) {

                return cachedData.attributesNormalized.get( normal );

            }

            var attribute = normal.clone();

            var v = new Vector3();

            for ( var i = 0, il = attribute.count; i < il; i ++ ) {

                v.fromArray( attribute.array, i * 3 );

                if ( v.x === 0 && v.y === 0 && v.z === 0 ) {

                    // if values can't be normalized set (1, 0, 0)
                    v.setX( 1.0 );

                } else {

                    v.normalize();

                }

                v.toArray( attribute.array, i * 3 );

            }

            cachedData.attributesNormalized.set( normal, attribute );

            return attribute;

        }

        /**
         * Get the required size + padding for a buffer, rounded to the next 4-byte boundary.
         * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#data-alignment
         *
         * @param {Integer} bufferSize The size the original buffer.
         * @returns {Integer} new buffer size with required padding.
         *
         */
        function getPaddedBufferSize( bufferSize: number ): number {

            return Math.ceil( bufferSize / 4 ) * 4;

        }

        /**
         * Returns a buffer aligned to 4-byte boundary.
         *
         * @param {ArrayBuffer} arrayBuffer Buffer to pad
         * @param {Integer} paddingByte (Optional)
         * @returns {ArrayBuffer} The same buffer if it's already aligned to 4-byte boundary or a new buffer
         */
        function getPaddedArrayBuffer( arrayBuffer: ArrayBuffer, paddingByte?: number ): ArrayBuffer {

            paddingByte = paddingByte || 0;

            var paddedLength = getPaddedBufferSize( arrayBuffer.byteLength );

            if ( paddedLength !== arrayBuffer.byteLength ) {

                var array = new Uint8Array( paddedLength );
                array.set( new Uint8Array( arrayBuffer ) );

                if ( paddingByte !== 0 ) {

                    for ( var i = arrayBuffer.byteLength; i < paddedLength; i ++ ) {

                        array[ i ] = paddingByte;

                    }

                }

                return array.buffer;

            }

            return arrayBuffer;

        }

        /**
         * Serializes a userData.
         *
         * @param {THREE.Object3D|THREE.Material} object
         * @param {Object} gltfProperty
         */
        function serializeUserData( object: Object3D | Material | BufferGeometry, gltfProperty: any ) {

            if ( Object.keys( object.userData ).length === 0 ) {

                return;

            }

            try {

                var json = JSON.parse( JSON.stringify( object.userData ) );

                if ( options.includeCustomExtensions && json.gltfExtensions ) {

                    if ( gltfProperty.extensions === undefined ) {

                        gltfProperty.extensions = {};

                    }

                    for ( var extensionName in json.gltfExtensions ) {

                        gltfProperty.extensions[ extensionName ] = json.gltfExtensions[ extensionName ];
                        extensionsUsed[ extensionName ] = true;

                    }

                    delete json.gltfExtensions;

                }

                if ( Object.keys( json ).length > 0 ) {

                    gltfProperty.extras = json;

                }

            } catch ( error ) {
                if (options.verbose)
                    console.warn( 'THREE.GLTFExporter: userData of \'' + object.name + '\' ' +
                        'won\'t be serialized because of JSON.stringify error - ' + error.message );

            }

        }

        /**
         * Process a buffer to append to the default one.
         * @param  {ArrayBuffer} buffer
         * @return {Integer}
         */
        function processBuffer( buffer: ArrayBuffer ) {

            if ( ! outputJSON.buffers ) {

                outputJSON.buffers = [ { byteLength: 0, uri: "" } ];

            }

            // All buffers are merged before export.
            buffers.push( Buffer.from(buffer) );

            return 0;

        }

        /**
         * Process and generate a BufferView
         * @param  {BufferAttribute} attribute
         * @param  {number} componentType
         * @param  {number} start
         * @param  {number} count
         * @param  {number} target (Optional) Target usage of the BufferView
         * @return {Object}
         */
        function processBufferView( attribute: BufferAttribute | InterleavedBufferAttribute, componentType: number, start: number, count: number, target: number ): any {

            if ( ! outputJSON.bufferViews ) {

                outputJSON.bufferViews = [];

            }

            // Create a new dataview and dump the attribute's array into it

            var componentSize;

            if ( componentType === WEBGL_CONSTANTS.UNSIGNED_BYTE ) {

                componentSize = 1;

            } else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT ) {

                componentSize = 2;

            } else {

                componentSize = 4;

            }

            var byteLength = getPaddedBufferSize( count * attribute.itemSize * componentSize );
            var dataView = new DataView( new ArrayBuffer( byteLength ) );
            var offset = 0;

            for ( var i = start; i < start + count; i ++ ) {

                for ( var a = 0; a < attribute.itemSize; a ++ ) {

                    var value = 0;

                    if ( attribute.itemSize > 4 ) {

                         // no support for interleaved data for itemSize > 4

                        value = attribute.array[ i * attribute.itemSize + a ];

                    } else {

                        if ( a === 0 ) value = attribute.getX( i );
                        else if ( a === 1 ) value = attribute.getY( i );
                        else if ( a === 2 ) value = attribute.getZ( i );
                        else if ( a === 3 ) value = attribute.getW( i );

                    }

                    if ( componentType === WEBGL_CONSTANTS.FLOAT ) {

                        dataView.setFloat32( offset, value, true );

                    } else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_INT ) {

                        dataView.setUint32( offset, value, true );

                    } else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT ) {

                        dataView.setUint16( offset, value, true );

                    } else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_BYTE ) {

                        dataView.setUint8( offset, value );

                    }

                    offset += componentSize;

                }

            }

            var gltfBufferView: any = {

                buffer: processBuffer( dataView.buffer ),
                byteOffset: byteOffset,
                byteLength: byteLength

            };

            if ( target !== undefined ) gltfBufferView.target = target;

            if ( target === WEBGL_CONSTANTS.ARRAY_BUFFER ) {

                // Only define byteStride for vertex attributes.
                gltfBufferView.byteStride = attribute.itemSize * componentSize;

            }

            byteOffset += byteLength;

            outputJSON.bufferViews.push( gltfBufferView );

            // @TODO Merge bufferViews where possible.
            var output: any = {

                id: outputJSON.bufferViews.length - 1,
                byteLength: 0

            };

            return output;

        }


        /**
         * Process attribute to generate an accessor
         * @param  {BufferAttribute} attribute Attribute to process
         * @param  {BufferGeometry} geometry (Optional) Geometry used for truncated draw range
         * @param  {Integer} start (Optional)
         * @param  {Integer} count (Optional)
         * @return {Integer}           Index of the processed accessor on the "accessors" array
         */
        function processAccessor( attribute: BufferAttribute | InterleavedBufferAttribute, geometry?: BufferGeometry, start?: number, count?: number ) {

            var types: any = {

                1: 'SCALAR',
                2: 'VEC2',
                3: 'VEC3',
                4: 'VEC4',
                16: 'MAT4'

            };

            var componentType;

            // Detect the component type of the attribute array (float, uint or ushort)
            if ( attribute.array.constructor === Float32Array ) {

                componentType = WEBGL_CONSTANTS.FLOAT;

            } else if ( attribute.array.constructor === Uint32Array ) {

                componentType = WEBGL_CONSTANTS.UNSIGNED_INT;

            } else if ( attribute.array.constructor === Uint16Array ) {

                componentType = WEBGL_CONSTANTS.UNSIGNED_SHORT;

            } else if ( attribute.array.constructor === Uint8Array ) {

                componentType = WEBGL_CONSTANTS.UNSIGNED_BYTE;

            } else {

                throw new Error( 'THREE.GLTFExporter: Unsupported bufferAttribute component type.' );

            }

            if ( start === undefined ) start = 0;
            if ( count === undefined ) count = attribute.count;

            // @TODO Indexed buffer geometry with drawRange not supported yet
            if ( options.truncateDrawRange && geometry !== undefined && geometry.index === null ) {

                var end = start + count;
                var end2 = geometry.drawRange.count === Infinity
                    ? attribute.count
                    : geometry.drawRange.start + geometry.drawRange.count;

                start = Math.max( start, geometry.drawRange.start );
                count = Math.min( end, end2 ) - start;

                if ( count < 0 ) count = 0;

            }

            // Skip creating an accessor if the attribute doesn't have data to export
            if ( count === 0 ) {

                return null;

            }

            var minMax = getMinMax( attribute, start, count );

            var bufferViewTarget: number = 0;

            // If geometry isn't provided, don't infer the target usage of the bufferView. For
            // animation samplers, target must not be set.
            if ( geometry !== undefined ) {

                bufferViewTarget = attribute === geometry.index ? WEBGL_CONSTANTS.ELEMENT_ARRAY_BUFFER : WEBGL_CONSTANTS.ARRAY_BUFFER;

            }

            var bufferView = processBufferView( attribute, componentType, start, count, bufferViewTarget );

            var gltfAccessor: any = {

                bufferView: bufferView.id,
                byteOffset: bufferView.byteOffset,
                componentType: componentType,
                count: count,
                max: minMax.max,
                min: minMax.min,
                type: types[ attribute.itemSize ]

            };

            if ( attribute.normalized === true ) {

                gltfAccessor.normalized = true;

            }

            if ( ! outputJSON.accessors ) {

                outputJSON.accessors = [];

            }

            outputJSON.accessors.push( gltfAccessor );

            return outputJSON.accessors.length - 1;

        }

        /**
         * Process material
         * @param  {THREE.Material} material Material to process
         * @return {Integer}      Index of the processed material in the "materials" array
         */
        function processMaterial( material: Material ){

            if ( cachedData.materials.has( material ) ) {

                return cachedData.materials.get( material );

            }

            if ( material instanceof ShaderMaterial ) {
                if (options.verbose)
                    console.warn( 'GLTFExporter: THREE.ShaderMaterial not supported.' );
                return null;

            }

            if ( ! outputJSON.materials ) {

                outputJSON.materials = [];

            }

            // @QUESTION Should we avoid including any attribute that has the default value?
            var gltfMaterial: any = {

                pbrMetallicRoughness: {}

            };

            if ( material instanceof MeshBasicMaterial) {

                gltfMaterial.extensions = { KHR_materials_unlit: {} };

                extensionsUsed[ 'KHR_materials_unlit' ] = true;

            } else if ( !(material instanceof MeshStandardMaterial) ) {
                if (options.verbose)
                    console.warn( 'GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.' );

            }

            // pbrMetallicRoughness.baseColorFactor
            var color: number[] = []
            if (material instanceof MeshStandardMaterial)
                color = material.color.toArray().concat( [ material.opacity ] );

            if ( ! equalArray( color, [ 1, 1, 1, 1 ] ) ) {

                gltfMaterial.pbrMetallicRoughness.baseColorFactor = color;

            }

            if ( material instanceof MeshStandardMaterial ) {

                gltfMaterial.pbrMetallicRoughness.metallicFactor = material.metalness;
                gltfMaterial.pbrMetallicRoughness.roughnessFactor = material.roughness;

            } else if ( material instanceof MeshBasicMaterial ) {

                gltfMaterial.pbrMetallicRoughness.metallicFactor = 0.0;
                gltfMaterial.pbrMetallicRoughness.roughnessFactor = 0.9;

            } else {

                gltfMaterial.pbrMetallicRoughness.metallicFactor = 0.5;
                gltfMaterial.pbrMetallicRoughness.roughnessFactor = 0.5;

            }

            // doubleSided
            if ( material.side === DoubleSide ) {

                gltfMaterial.doubleSided = true;

            }

            if ( material.name !== '' ) {

                gltfMaterial.name = material.name;

            }

            serializeUserData( material, gltfMaterial );

            outputJSON.materials.push( gltfMaterial );

            var index = outputJSON.materials.length - 1;
            cachedData.materials.set( material, index );

            return index;

        }

        /**
         * Process mesh
         * @param  {THREE.Mesh} mesh Mesh to process
         * @return {Integer}      Index of the processed mesh in the "meshes" array
         */
        function processMesh( mesh: Mesh ) {

            var meshCacheKeyParts = [ mesh.geometry.uuid ];
            if ( Array.isArray( mesh.material ) ) {

                for ( var i = 0, l = mesh.material.length; i < l; i ++ ) {

                    meshCacheKeyParts.push( mesh.material[ i ].uuid	);

                }

            } else {

                meshCacheKeyParts.push( mesh.material.uuid );

            }

            var meshCacheKey = meshCacheKeyParts.join( ':' );
            if ( cachedData.meshes.has( meshCacheKey ) ) {

                return cachedData.meshes.get( meshCacheKey );

            }

            var geometry = mesh.geometry;

            var mode = WEBGL_CONSTANTS.TRIANGLES;


            if ( !(geometry instanceof BufferGeometry ) ) {
                if (options.verbose)
                    console.warn( 'GLTFExporter: Exporting THREE.Geometry will increase file size. Use BufferGeometry instead.' );
                geometry = new BufferGeometry().setFromObject( mesh );

            }

            var gltfMesh: any = {};

            var attributes: any = {};
            var primitives: any[] = [];
            var targets: any[] = [];

            // Conversion between attributes names in threejs and gltf spec
            var nameConversion: any = {

                uv: 'TEXCOORD_0',
                uv2: 'TEXCOORD_1',
                color: 'COLOR_0',
                skinWeight: 'WEIGHTS_0',
                skinIndex: 'JOINTS_0'

            };

            var originalNormal = geometry.getAttribute( 'normal' );

            if ( originalNormal !== undefined && ! isNormalizedNormalAttribute( originalNormal ) ) {

                if (options.verbose)
                    console.warn( 'THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one.' );

                geometry.setAttribute( 'normal', createNormalizedNormalAttribute( originalNormal ) );

            }

            // @QUESTION Detect if .vertexColors = true?
            // For every attribute create an accessor
            var modifiedAttribute: BufferAttribute | null;

            for ( var attributeName in geometry.attributes ) {

                // Ignore morph target attributes, which are exported later.
                if ( attributeName.substr( 0, 5 ) === 'morph' ) continue;

                var attribute = geometry.attributes[ attributeName ];
                attributeName = nameConversion[ attributeName ] || attributeName.toUpperCase();

                // Prefix all geometry attributes except the ones specifically
                // listed in the spec; non-spec attributes are considered custom.
                var validVertexAttributes =
                        /^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/;
                if ( ! validVertexAttributes.test( attributeName ) ) {

                    attributeName = '_' + attributeName;

                }

                if ( cachedData.attributes.has( getUID( attribute ) ) ) {

                    attributes[ attributeName ] = cachedData.attributes.get( getUID( attribute ) );
                    continue;

                }

                // JOINTS_0 must be UNSIGNED_BYTE or UNSIGNED_SHORT.
                modifiedAttribute = null;
                var array = attribute.array;
                if ( attributeName === 'JOINTS_0' &&
                    ! ( array instanceof Uint16Array ) &&
                    ! ( array instanceof Uint8Array ) ) {

                    if (options.verbose)
                        console.warn( 'GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.' );
                    modifiedAttribute = new BufferAttribute( new Uint16Array( array ), attribute.itemSize, attribute.normalized );

                }

                var accessor = processAccessor( modifiedAttribute || attribute, geometry );
                if ( accessor !== null ) {

                    attributes[ attributeName ] = accessor;
                    cachedData.attributes.set( getUID( attribute ), accessor );

                }

            }

            if ( originalNormal !== undefined ) geometry.setAttribute( 'normal', originalNormal );

            // Skip if no exportable attributes found
            if ( Object.keys( attributes ).length === 0 ) {

                return null;

            }

            // Morph targets
            if ( mesh.morphTargetInfluences !== undefined && mesh.morphTargetInfluences.length > 0 ) {

                var weights = [];
                var targetNames = [];
                var reverseDictionary: any = {};

                if ( mesh.morphTargetDictionary !== undefined ) {

                    for ( var key in mesh.morphTargetDictionary ) {

                        reverseDictionary[ mesh.morphTargetDictionary[ key ] ] = key;

                    }

                }

                for ( var i = 0; i < mesh.morphTargetInfluences.length; ++ i ) {

                    var target: any = {};

                    var warned = false;

                    for ( var attributeName in geometry.morphAttributes ) {

                        // glTF 2.0 morph supports only POSITION/NORMAL/TANGENT.
                        // Three.js doesn't support TANGENT yet.

                        if ( attributeName !== 'position' && attributeName !== 'normal' ) {

                            if ( ! warned ) {
                                if (options.verbose)
                                    console.warn( 'GLTFExporter: Only POSITION and NORMAL morph are supported.' );
                                warned = true;

                            }

                            continue;

                        }

                        var attribute = geometry.morphAttributes[ attributeName ][ i ];
                        var gltfAttributeName = attributeName.toUpperCase();

                        // Three.js morph attribute has absolute values while the one of glTF has relative values.
                        //
                        // glTF 2.0 Specification:
                        // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#morph-targets

                        var baseAttribute = geometry.attributes[ attributeName ];

                        if ( cachedData.attributes.has( getUID( attribute ) ) ) {

                            target[ gltfAttributeName ] = cachedData.attributes.get( getUID( attribute ) );
                            continue;

                        }

                        // Clones attribute not to override
                        var relativeAttribute = attribute.clone();

                        if ( ! geometry.morphTargetsRelative ) {

                            for ( var j = 0, jl = attribute.count; j < jl; j ++ ) {

                                relativeAttribute.setXYZ(
                                    j,
                                    attribute.getX( j ) - baseAttribute.getX( j ),
                                    attribute.getY( j ) - baseAttribute.getY( j ),
                                    attribute.getZ( j ) - baseAttribute.getZ( j )
                                );

                            }

                        }

                        target[ gltfAttributeName ] = processAccessor( relativeAttribute, geometry );
                        cachedData.attributes.set( getUID( baseAttribute ), target[ gltfAttributeName ] );

                    }

                    targets.push( target );

                    weights.push( mesh.morphTargetInfluences[ i ] );
                    if ( mesh.morphTargetDictionary !== undefined ) targetNames.push( reverseDictionary[ i ] );

                }

                gltfMesh.weights = weights;

                if ( targetNames.length > 0 ) {

                    gltfMesh.extras = {};
                    gltfMesh.extras.targetNames = targetNames;

                }

            }

            var isMultiMaterial = Array.isArray( mesh.material );

            if ( isMultiMaterial && geometry.groups.length === 0 ) return null;

            var materials = isMultiMaterial ? mesh.material as Material[] : [ mesh.material as Material ];
            var groups = isMultiMaterial ? geometry.groups : [ { materialIndex: 0, start: undefined, count: undefined } ];

            for ( var i = 0, il = groups.length; i < il; i ++ ) {

                var primitive: any = {
                    mode: mode,
                    attributes: attributes,
                };

                serializeUserData( geometry, primitive );

                if ( targets.length > 0 ) primitive.targets = targets;

                if ( geometry.index !== null ) {

                    var cacheKey = getUID( geometry.index );
                    var cacheKeyStr = ""
                    if (cacheKey) {cacheKeyStr = cacheKey.toString()}

                    if ( groups[ i ].start !== undefined || groups[ i ].count !== undefined ) {

                        cacheKeyStr += ':' + groups[ i ].start + ':' + groups[ i ].count;

                    }

                    if ( cachedData.attributes.has( cacheKey ) ) {

                        primitive.indices = cachedData.attributes.get( cacheKey );

                    } else {

                        primitive.indices = processAccessor( geometry.index, geometry, groups[ i ].start, groups[ i ].count );
                        cachedData.attributes.set( cacheKey, primitive.indices );

                    }

                    if ( primitive.indices === null ) delete primitive.indices;

                }

                if (groups[ i ].materialIndex !== undefined) {
                    if (Array.isArray( materials )) {
                        var material = processMaterial( materials[groups[ i ].materialIndex ?? 0] );
                    }

                } else {
                    var material = processMaterial( materials[ 0 ] );
                }


                if ( material !== null ) {

                    primitive.material = material;

                }

                primitives.push( primitive );

            }

            gltfMesh.primitives = primitives;

            if ( ! outputJSON.meshes ) {

                outputJSON.meshes = [];

            }

            outputJSON.meshes.push( gltfMesh );

            var index = outputJSON.meshes.length - 1;
            cachedData.meshes.set( meshCacheKey, index );

            return index;

        }


        /**
         * Process Object3D node
         * @param  {THREE.Object3D} node Object3D to processNode
         * @return {Integer}      Index of the node in the nodes list
         */
        function processNode( object: Object3D ) {

            if ( ! outputJSON.nodes ) {

                outputJSON.nodes = [];

            }

            var gltfNode: any = {};

            if ( options.trs ) {

                var rotation = object.quaternion.toArray();
                var position = object.position.toArray();
                var scale = object.scale.toArray();

                if ( ! equalArray( rotation, [ 0, 0, 0, 1 ] ) ) {

                    gltfNode.rotation = rotation;

                }

                if ( ! equalArray( position, [ 0, 0, 0 ] ) ) {

                    gltfNode.translation = position;

                }

                if ( ! equalArray( scale, [ 1, 1, 1 ] ) ) {

                    gltfNode.scale = scale;

                }

            } else {

                if ( object.matrixAutoUpdate ) {

                    object.updateMatrix();

                }

                if ( ! equalArray( object.matrix.elements, [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] ) ) {

                    gltfNode.matrix = object.matrix.elements;

                }

            }

            // We don't export empty strings name because it represents no-name in Three.js.
            if ( object.name !== '' ) {

                gltfNode.name = String( object.name );

            }

            serializeUserData( object, gltfNode );

            if ( object instanceof Mesh ) {

                var mesh = processMesh( object as Mesh );

                if ( mesh !== null ) {

                    gltfNode.mesh = mesh;

                }

            }


            if ( object.children.length > 0 ) {

                var children = [];

                for ( var i = 0, l = object.children.length; i < l; i ++ ) {

                    var child = object.children[ i ];

                    if ( child.visible || options.onlyVisible === false ) {

                        var node = processNode( child );

                        if ( node !== null ) {

                            children.push( node );

                        }

                    }

                }

                if ( children.length > 0 ) {

                    gltfNode.children = children;

                }


            }

            outputJSON.nodes.push( gltfNode );

            var nodeIndex = outputJSON.nodes.length - 1;
            nodeMap.set( object, nodeIndex );

            return nodeIndex;

        }

        /**
         * Process Scene
         * @param node Scene to process
         */
        function processScene( scene: Scene ) {

            if ( ! outputJSON.scenes ) {

                outputJSON.scenes = [];
                outputJSON.scene = 0;

            }

            var gltfScene: any = {};

            if ( scene.name !== '' ) {

                gltfScene.name = scene.name;

            }

            outputJSON.scenes.push( gltfScene );

            var nodes = [];

            for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

                var child = scene.children[ i ];

                if ( child.visible || options.onlyVisible === false ) {

                    var node = processNode( child );

                    if ( node !== null ) {

                        nodes.push( node );

                    }

                }

            }

            if ( nodes.length > 0 ) {

                gltfScene.nodes = nodes;

            }

            serializeUserData( scene, gltfScene );

        }

        /**
         * Creates a Scene to hold the object and parses it
         * @param object object to process
         */
        function processObject( object: Object3D ) {

            var scene = new Scene();
            scene.name = 'AuxScene';

            scene.children.push( object );

            processScene( scene );

        }

        function processInput( input: Object3D ) {

            processObject( input );

        }

        processInput( input );

        Promise.all( pending ).then( function () {

            // Merge buffers.
            var data: Buffer = Buffer.concat( buffers );

            // Declare extensions.
            var extensionsUsedList = Object.keys( extensionsUsed );
            if ( extensionsUsedList.length > 0 ) outputJSON.extensionsUsed = extensionsUsedList;

            // Update bytelength of the single buffer.
            if ( outputJSON.buffers && outputJSON.buffers.length > 0 ) outputJSON.buffers[ 0 ].byteLength = data.length;

            if ( options.binary === true ) {

                // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification

                var GLB_HEADER_BYTES = 12;
                var GLB_HEADER_MAGIC = 0x46546C67;
                var GLB_VERSION = 2;

                var GLB_CHUNK_PREFIX_BYTES = 8;
                var GLB_CHUNK_TYPE_JSON = 0x4E4F534A;
                var GLB_CHUNK_TYPE_BIN = 0x004E4942;


                // Binary chunk.
                var binaryChunk = getPaddedArrayBuffer( data );
                var binaryChunkPrefix = new DataView( new ArrayBuffer( GLB_CHUNK_PREFIX_BYTES ) );
                binaryChunkPrefix.setUint32( 0, binaryChunk.byteLength, true );
                binaryChunkPrefix.setUint32( 4, GLB_CHUNK_TYPE_BIN, true );

                // JSON chunk.
                var jsonChunk = getPaddedArrayBuffer( stringToArrayBuffer( JSON.stringify( outputJSON ) ), 0x20 );
                var jsonChunkPrefix = new DataView( new ArrayBuffer( GLB_CHUNK_PREFIX_BYTES ) );
                jsonChunkPrefix.setUint32( 0, jsonChunk.byteLength, true );
                jsonChunkPrefix.setUint32( 4, GLB_CHUNK_TYPE_JSON, true );

                // GLB header.
                var header = new ArrayBuffer( GLB_HEADER_BYTES );
                var headerView = new DataView( header );
                headerView.setUint32( 0, GLB_HEADER_MAGIC, true );
                headerView.setUint32( 4, GLB_VERSION, true );
                var totalByteLength = GLB_HEADER_BYTES
                    + jsonChunkPrefix.byteLength + jsonChunk.byteLength
                    + binaryChunkPrefix.byteLength + binaryChunk.byteLength;
                headerView.setUint32( 8, totalByteLength, true );

                var glbData = Buffer.concat( [
                    Buffer.from(header),
                    Buffer.from([jsonChunkPrefix]),
                    Buffer.from(jsonChunk),
                    Buffer.from([binaryChunkPrefix]),
                    Buffer.from(binaryChunk)
                ]);

                onDone( glbData );

            } else {

                if ( outputJSON.buffers && outputJSON.buffers.length > 0 ) {

                    var base64data = data.toString("base64");
                    outputJSON.buffers[ 0 ].uri = "data:application/octet-stream;base64,"+base64data;
                    onDone( outputJSON );

                } else {

                    onDone( outputJSON );

                }

            }

        } );

    }

};
