import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createPart } from './procedural.js';

const loader = new GLTFLoader();
let manifestPromise;

export async function loadPart(category, { preferExternal = false } = {}) {
  manifestPromise ||= fetch('/assets/manifest.json').then(r => r.json());
  const manifest = await manifestPromise;
  const source = manifest[category]?.model;
  if (preferExternal && source) {
    try {
      const gltf = await loader.loadAsync(`/${source}`);
      gltf.scene.name = category;
      gltf.scene.traverse(node => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; } });
      return gltf.scene;
    } catch (error) {
      console.info(`[素材] ${category} 外部模型不可用，使用內建通用模型。`, error.message);
    }
  }
  const model = createPart(category);
  model.userData.isProcedural = true;
  return model;
}

export function addAnchor(parent, name, position, rotation = [0, 0, 0]) {
  const anchor = new THREE.Object3D();
  anchor.name = name;
  anchor.position.fromArray(position);
  anchor.rotation.set(...rotation);
  parent.add(anchor);
  return anchor;
}

export function setShadows(object) {
  object.traverse(node => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; } });
  return object;
}

export function makeGhost(source) {
  const ghost = source.clone(true);
  ghost.traverse(node => {
    if (node.isMesh) {
      node.material = new THREE.MeshBasicMaterial({ color: '#7ff5c2', transparent: true, opacity: 0.22, depthWrite: false, wireframe: false });
      node.castShadow = false; node.receiveShadow = false;
    }
  });
  ghost.visible = false;
  return ghost;
}

export function worldTransform(anchor) {
  return { position: anchor.getWorldPosition(new THREE.Vector3()), quaternion: anchor.getWorldQuaternion(new THREE.Quaternion()) };
}
