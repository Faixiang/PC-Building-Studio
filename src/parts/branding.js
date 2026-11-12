import * as THREE from 'three';

const placements = {
  motherboard: { position: [1.3, 0.075, 1.85], rotation: [-Math.PI / 2, 0, 0], size: [1.5, 0.34] },
  cpu: { position: [0, 0.127, 0.22], rotation: [-Math.PI / 2, 0, 0], size: [0.5, 0.14] },
  cooler: { position: [0, 1.49, 0.35], rotation: [-Math.PI / 2, 0, 0], size: [0.8, 0.2] },
  ram: { position: [0, 0.85, 0.101], rotation: [0, 0, 0], size: [1.2, 0.25] },
  ssd: { position: [0, 0.102, 0], rotation: [-Math.PI / 2, 0, 0], size: [0.95, 0.3] },
  gpu: { position: [0, 1.75, 0.16], rotation: [-Math.PI / 2, 0, 0], size: [1.5, 0.3] },
  psu: { position: [0, 0.35, 1.177], rotation: [0, 0, 0], size: [1.3, 0.3] },
  case: { position: [0, 5.7, 2.51], rotation: [0, 0, 0], size: [1.8, 0.35] },
};

export function applyBrand(model, category, brand) {
  if (!brand || !placements[category]) return;
  const p = placements[category];
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = brand.color; ctx.globalAlpha = 0.88; ctx.fillRect(0, 0, 512, 128); ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff'; ctx.font = `700 ${brand.name.length > 12 ? 42 : 54}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(brand.name, 256, 65);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(...p.size), new THREE.MeshBasicMaterial({ map: texture, transparent: true, polygonOffset: true, polygonOffsetFactor: -2, side: THREE.DoubleSide }));
  decal.name = 'brand-decal'; decal.position.fromArray(p.position); decal.rotation.set(...p.rotation); model.add(decal);
}
