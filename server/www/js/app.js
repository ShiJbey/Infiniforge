import * as dat from 'three/examples/jsm/libs/dat.gui.module';
import * as THREE from 'three/build/three.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { randomSeed } from './utils';

let canvas;
let scene, camera, renderer;
let gui;
let seedController;
let wireFrameEnabled = false;
let orbitControl, transformControl;

let swordglTF, swordModel, importedMaterial;
let wireframeMaterial = new THREE.MeshBasicMaterial({
  color: 0x050505,
  wireframe: true,
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();

init();
animate();

function forgeSword() {
  let data = JSON.stringify(forgeParams);

  let xhr = new XMLHttpRequest();
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
  let loader = new GLTFLoader();
  loader.parse(
    json,
    '',
    (gltf) => {
      scene.remove(swordModel);
      swordModel = gltf.scene.children[0];
      // swordModel.rotation.y += Math.PI / 2;
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
  canvas = document.getElementById('threejs-canvas');

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  let renderer_rect = renderer.domElement.getBoundingClientRect();
  renderer.setSize(renderer_rect.width, renderer_rect.height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Camera
  let aspect = renderer_rect.width / renderer_rect.height;
  camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
  camera.position.z = 2;
  camera.position.y = 1;
  camera.updateProjectionMatrix();
  scene.add(camera);

  // Floor Plane
  const planeGeometry = new THREE.PlaneBufferGeometry(200, 200);
  planeGeometry.rotateX(-Math.PI / 2);
  const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.y = -10;
  plane.receiveShadow = true;
  scene.add(plane);

  const helper = new THREE.GridHelper(200, 100);
  helper.position.y = -9.9;
  helper.material.opacity = 0.25;
  helper.material.transparent = true;
  scene.add(helper);

  // Lights
  let light;

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);

  light = new THREE.DirectionalLight(0xcccccc);
  light.position.set(-1, -1, -1);
  scene.add(light);

  scene.add(new THREE.AmbientLight(0x222222));

  // controls
  orbitControl = new OrbitControls(camera, canvas);
  orbitControl.damping = 0.3;
  orbitControl.enableDamping = true;
  orbitControl.dampingFactor = 0.05;
  // orbitControl.screenSpacePanning = false;
  orbitControl.minDistance = 0.5;
  // orbitControl.maxDistance = 3;
  orbitControl.enableZoom = true;
  // orbitControl.autoRotate = true;
  // orbitControl.autoRotateSpeed = 1.0;
  orbitControl.enableRotate = true;
  orbitControl.enableKeys = true;
  orbitControl.addEventListener('change', render);

  transformControl = new TransformControls(camera, canvas);
  transformControl.addEventListener('change', render);
  transformControl.addEventListener('dragging-changed', (event) => {
    orbitControl.enabled = !event.value;
  });
  scene.add(transformControl);

  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('pointerdown', onPointerDown, false);
  document.addEventListener('pointerup', onPointerUp, false);
}

function onPointerDown(event) {
  onDownPosition.x = event.offsetX;
  onDownPosition.y = event.offsetY;
}

function onPointerUp(event) {
  onUpPosition.x = event.offsetX;
  onUpPosition.y = event.offsetY;

  if (onDownPosition.distanceTo(onUpPosition) === 0) transformControl.detach();

  if (!swordModel) {
    return;
  }

  pointer.x = (event.offsetX / canvas.offsetWidth) * 2 - 1;
  pointer.y = -(event.offsetY / canvas.offsetHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects([swordModel]);

  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (obj !== transformControl.object) {
      transformControl.attach(obj);
    }
  }
}

function onWindowResize() {
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  camera.aspect = canvas.width / canvas.height;
  camera.updateProjectionMatrix();

  renderer.setSize(canvas.width, canvas.height);
}

function animate() {
  requestAnimationFrame(animate);
  orbitControl.update();
  if (swordModel) {
    swordModel.rotation.y += Math.PI / 60.0 / 3;
  }
  render();
}

function render() {
  renderer.render(scene, camera);
}

function setGlTFDownload(enable) {
  let downloadButton = document.getElementById('download-button');
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

const forgeParams = {
  output: 'gltf',
  seed: 'Enter a seed value',
  template: 'random',
  bladeParams: {
    color: '#7f7f7f',
    crossSection: 'random',
    tip: 'random',
    edgeScaleTolerance: 0.5,
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
  'Doule Fuller': 'double_fuller',
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
bladeOptions.add(forgeParams.bladeParams, 'edgeScaleTolerance', 0, 1);
bladeOptions.addColor(forgeParams.bladeParams, 'color');

let guardOptions = gui.addFolder('Guard Options');
guardOptions.addColor(forgeParams.guardParams, 'color');

let handleOptions = gui.addFolder('Handle Options');
handleOptions.addColor(forgeParams.handleParams, 'color');

let pommelOptions = gui.addFolder('Pommel Options');
pommelOptions.addColor(forgeParams.pommelParams, 'color');

gui.add(guiFunctions, 'Toggle Wireframe');

document.getElementById('container').appendChild(gui.domElement);
