import * as dat from 'three/examples/jsm/libs/dat.gui.module.js';
import * as THREE from 'three/build/three.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { getRandomInt, randomSeed } from './utils.js';

let ThreeJSCanvas;
let scene, camera, renderer, controls;
let swordModel, material, importedMaterial;
let useWireFrame;
let generationParams;
let gui;
let seedController, baseWidthController;
let swordglTF;

let wireFrameEnabled = false;
let wireframeMaterial = new THREE.MeshBasicMaterial({
  color: 0x050505,
  wireframe: true,
});

init();
animate();

function forgeSword() {
  var data = JSON.stringify(forgeParams);

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === 4) {
      loadModel(this.response);
    }
  });

  xhr.open('POST', '/api/forge/sword');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(data);
}

function loadModel(json) {
  var loader = new GLTFLoader();
  loader.parse(
    json,
    '',
    (gltf) => {
      scene.remove(swordModel);
      swordModel = gltf.scene.children[0];
      swordModel.rotation.y += Math.PI / 2;
      importedMaterial = swordModel.material;
      scene.add(swordModel);
      // Save the json
      swordglTF = json;
      // Toggle the download
      setGlTFDownload(true);
    },
    (err) => {
      alert(err);
    }
  );
}

function init() {
  ThreeJSCanvas = document.getElementById('threejs-canvas');

  renderer = new THREE.WebGLRenderer({
    canvas: ThreeJSCanvas,
    antialias: true,
  });
  var renderer_rect = renderer.domElement.getBoundingClientRect();
  renderer.setSize(renderer_rect.width, renderer_rect.height);
  renderer.setPixelRatio(window.devicePixelRatio);

  var aspect = renderer_rect.width / renderer_rect.height;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.z = 2;
  camera.position.y = 1;
  camera.updateProjectionMatrix();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x53698a);

  // controls

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 0.5;
  controls.maxDistance = 3;
  controls.enableZoom = true;
  controls.autoRotate = true;
  controls.enableRotate = true;
  controls.enableKeys = false;

  // Lights

  var light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);

  var light = new THREE.DirectionalLight(0xcccccc);
  light.position.set(-1, -1, -1);
  scene.add(light);

  var light = new THREE.AmbientLight(0x222222);
  scene.add(light);

  window.addEventListener('resize', onWindowResize, false);
  ThreeJSCanvas.addEventListener('keydown', onKeyDown, false);
}

function onKeyDown(e) {
  if (e.key === 'ArrowUp' && swordModel) {
    swordModel.position.y += 0.015;
  }

  if (e.key === 'ArrowDown' && swordModel) {
    swordModel.position.y -= 0.015;
  }
}

function onWindowResize() {
  ThreeJSCanvas.style.width = '100%';
  ThreeJSCanvas.style.height = '100%';
  ThreeJSCanvas.width = ThreeJSCanvas.offsetWidth;
  ThreeJSCanvas.height = ThreeJSCanvas.offsetHeight;

  camera.aspect = ThreeJSCanvas.width / ThreeJSCanvas.height;
  camera.updateProjectionMatrix();

  renderer.setSize(ThreeJSCanvas.width, ThreeJSCanvas.height);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
}

function render() {
  renderer.render(scene, camera);
}

function setGlTFDownload(enable) {
  var downloadButton = document.getElementById('download-button');
  if (enable) {
    downloadButton.disabled = false;
    downloadButton.parentElement.href = URL.createObjectURL(
      new Blob([swordglTF], { type: 'application/gltf;charset=utf-8' })
    );
  } else {
    downloadButton.parentElement.href = 'javascript: void(0)';
  }
}

///////////////////////////////////////////////////////////
//                    GUI CONTROLS                       //
///////////////////////////////////////////////////////////

export var forgeParams = {
  output: 'gltf',
  seed: 'Enter a seed value',
  template: 'random',
  bladeParams: {
    color: '#7f7f7f',
    crossSection: 'random',
    tip: 'random',
    edgeScaleTolerance: 0.1,
  },
  guardParams: {
    color: '#7f5100',
  },
  handleParams: {
    color: '#cc5100',
  },
  pommelParams: {
    color: '#e5cc59',
  },
};

let guiFunctions = {
  'Random Seed': () => {},
  Forge: forgeSword,
  'Random Forge': () => {
    seedController.setValue(randomSeed());
    forgeSword();
  },
  'Toggle Wireframe': () => {
    wireFrameEnabled = !wireFrameEnabled;
    if (swordModel) {
      if (wireFrameEnabled) {
        swordModel.material = wireframeMaterial;
      } else {
        swordModel.material = importedMaterial;
      }
    }
  },
};

const supportedCrossSections = {
  Random: 'random',
  Diamond: 'diamond',
  'Hallow Ground': 'hallow_ground',
  Hexagonal: 'hexagonal',
  'Thickened Diamond': 'thickened_diamond',
  Lenticular: 'lenticular',
  Fuller: 'fuller',
  'Doule Fuller': 'doule_fuller',
  'Broad Fuller': 'broad_fuller',
  'Single edge': 'single_edge',
};

const supportedTemplates = {
  Random: 'random',
  Short: 'short',
  Long: 'long',
  Great: 'great',
  Katana: 'katana',
};

const supportedBladeTips = {
  Random: 'random',
  Standard: 'standard',
  Square: 'square',
  Rounded: 'rounded',
  Clip: 'clip',
};

gui = new dat.GUI({
  name: 'Infiniforge Playground',
  closeOnTop: 'true',
});

gui.domElement.id = 'gui';
gui.domElement.class = 'w3-card gui';

gui.add(guiFunctions, 'Random Forge');
gui.add(guiFunctions, 'Forge');

gui.add(guiFunctions, 'Random Seed').setValue(() => {
  seedController.setValue(randomSeed());
});

seedController = gui.add(forgeParams, 'seed');

gui.add(forgeParams, 'template', supportedTemplates);

let bladeOptions = gui.addFolder('Blade Options');
bladeOptions.add(
  forgeParams.bladeParams,
  'crossSection',
  supportedCrossSections
);
bladeOptions.add(forgeParams.bladeParams, 'tip', supportedBladeTips);
bladeOptions.add(forgeParams.bladeParams, 'edgeScaleTolerance', 0, 0.5);
bladeOptions.addColor(forgeParams.bladeParams, 'color');

let guardOptions = gui.addFolder('Guard Options');
guardOptions.addColor(forgeParams.guardParams, 'color');

let handleOptions = gui.addFolder('Handle Options');
handleOptions.addColor(forgeParams.handleParams, 'color');

let pommelOptions = gui.addFolder('Pommel Options');
pommelOptions.addColor(forgeParams.pommelParams, 'color');

gui.add(guiFunctions, 'Toggle Wireframe');

document.getElementById('container').appendChild(gui.domElement);
