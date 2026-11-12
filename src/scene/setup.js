import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createStudio() {
  const canvas = document.querySelector('#scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a101b');
  scene.fog = new THREE.FogExp2('#0a101b', 0.018);
  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(11, 8, 14);
  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.06, minDistance: 5, maxDistance: 28, maxPolarAngle: Math.PI / 2.03, minPolarAngle: Math.PI / 9, enablePan: false });
  controls.target.set(1.7, 2.8, 0);

  scene.add(new THREE.HemisphereLight('#c2ddff', '#17251d', 1.8));
  const key = new THREE.DirectionalLight('#e9f7ff', 4.1);
  key.position.set(2, 12, 8); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 });
  scene.add(key);
  const rim = new THREE.PointLight('#54ffc4', 40, 25, 2); rim.position.set(4, 5, -5); scene.add(rim);
  const fill = new THREE.PointLight('#6a8dff', 25, 22, 2); fill.position.set(-6, 4, 4); scene.add(fill);

  const grid = new THREE.GridHelper(50, 50, '#29404c', '#142530');
  grid.position.y = -0.48; scene.add(grid);
  const table = new THREE.Mesh(new THREE.BoxGeometry(24, 0.45, 14), new THREE.MeshStandardMaterial({ color: '#182230', metalness: 0.4, roughness: 0.65 }));
  table.position.set(1, -0.25, 0); table.receiveShadow = true; scene.add(table);

  const listeners = new Set();
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const delta = Math.min(clock.getDelta(), 0.05);
    listeners.forEach(fn => fn(delta));
    controls.update();
    renderer.render(scene, camera);
  });
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  return { scene, camera, renderer, controls, onTick: fn => listeners.add(fn) };
}
