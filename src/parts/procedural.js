import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const materials = {
  metal: new THREE.MeshStandardMaterial({ color: '#7b8792', metalness: 0.88, roughness: 0.27 }),
  dark: new THREE.MeshStandardMaterial({ color: '#202a35', metalness: 0.7, roughness: 0.35 }),
  black: new THREE.MeshStandardMaterial({ color: '#10151c', metalness: 0.25, roughness: 0.55 }),
  pcb: new THREE.MeshStandardMaterial({ color: '#173c35', metalness: 0.25, roughness: 0.65 }),
  gold: new THREE.MeshStandardMaterial({ color: '#d9ac45', metalness: 0.85, roughness: 0.25 }),
  chip: new THREE.MeshStandardMaterial({ color: '#171b20', metalness: 0.35, roughness: 0.5 }),
  white: new THREE.MeshStandardMaterial({ color: '#bac6cf', metalness: 0.4, roughness: 0.4 }),
  accent: new THREE.MeshStandardMaterial({ color: '#77e8ba', emissive: '#38b584', emissiveIntensity: 0.45, metalness: 0.3, roughness: 0.3 }),
};

export function box(w, h, d, material = materials.dark, radius = 0.04) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, w / 4, h / 4, d / 4)), material);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}
function cylinder(radius, depth, material = materials.dark, segments = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, segments), material);
  mesh.castShadow = true; return mesh;
}
function add(parent, child, x = 0, y = 0, z = 0) { child.position.set(x, y, z); parent.add(child); return child; }
function textPlate(text, color = '#dce8ee', bg = '#1a2530', w = 1.6, h = 0.45) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 144;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 144);
  ctx.fillStyle = color; ctx.font = 'bold 54px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 75);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
}

/* ---- Detail helpers: procedural textures and micro-geometry ---- */
const textureCache = new Map();
function cacheTexture(key, make) {
  if (!textureCache.has(key)) textureCache.set(key, make());
  return textureCache.get(key);
}
function pcbTexture() {
  return cacheTexture('pcb', () => {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#14352f'; ctx.fillRect(0, 0, 512, 512);
    // Copper traces with varied routing and 45-degree bends.
    for (let i = 0; i < 90; i++) {
      ctx.strokeStyle = `rgba(${70 + i % 30}, ${150 + i % 40}, ${120 + i % 30}, 0.34)`;
      ctx.lineWidth = i % 7 === 0 ? 2.2 : 0.9;
      ctx.beginPath();
      let x = (i * 71) % 512, y = (i * 129) % 512;
      ctx.moveTo(x, y);
      for (let s = 0; s < 4; s++) {
        x += ((i + s) % 2 ? 1 : -1) * (22 + (i * s) % 40);
        y += ((i + s) % 3 ? 1 : -1) * (18 + (i * s) % 34);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Solder pads and vias.
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = i % 5 ? 'rgba(200,170,90,0.5)' : 'rgba(230,240,235,0.35)';
      ctx.beginPath(); ctx.arc((i * 97) % 512, (i * 191) % 512, i % 9 ? 1.4 : 2.6, 0, Math.PI * 2); ctx.fill();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); t.anisotropy = 4;
    return t;
  });
}
function brushedTexture(base = '#8d99a4') {
  return cacheTexture('brush' + base, () => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d'); ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 1) {
      ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.07})`;
      ctx.beginPath(); ctx.moveTo(0, y + Math.random()); ctx.lineTo(256, y + Math.random()); ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4);
    return t;
  });
}
const fineMaterials = {
  pcbTraced: new THREE.MeshStandardMaterial({ map: null, color: '#ffffff', metalness: 0.28, roughness: 0.62 }),
  brushed: new THREE.MeshStandardMaterial({ color: '#8d99a4', metalness: 0.9, roughness: 0.34 }),
  rubber: new THREE.MeshStandardMaterial({ color: '#0b0e12', metalness: 0.05, roughness: 0.95 }),
  screw: new THREE.MeshStandardMaterial({ color: '#aab5bf', metalness: 0.95, roughness: 0.2 }),
  solder: new THREE.MeshStandardMaterial({ color: '#c9b483', metalness: 0.8, roughness: 0.32 }),
};
function screw(radius = 0.045, depth = 0.05) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, 14), fineMaterials.screw);
  body.rotation.x = Math.PI / 2; g.add(body);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(radius * 1.5, radius * 0.24, depth * 0.35), materials.black);
  slot.position.z = depth / 2; g.add(slot);
  return g;
}
function heatsink(width, height, depth, count = 14, mat = materials.metal) {
  const g = new THREE.Group();
  const pitch = height / count;
  for (let i = 0; i < count; i++) {
    const fin = box(width, pitch * 0.42, depth, mat, 0.004);
    fin.position.y = -height / 2 + pitch * (i + 0.5);
    g.add(fin);
  }
  return g;
}
function padRing(parent, count, radius, y, material = fineMaterials.solder, size = 0.035) {
  for (let i = 0; i < count; i++) {
    const a = i / count * Math.PI * 2;
    const pad = box(size, 0.012, size, material, 0.004);
    pad.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
    parent.add(pad);
  }
}
function fan(radius = 0.6, vertical = true) {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.07, 10, 40), materials.accent); group.add(ring);
  const hub = cylinder(radius * 0.22, 0.12, materials.dark); hub.rotation.x = Math.PI / 2; group.add(hub);
  const blades = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const pivot = new THREE.Group(); pivot.rotation.z = i * Math.PI * 2 / 7;
    const blade = box(radius * 0.27, radius * 0.64, 0.06, materials.white, 0.05);
    blade.position.y = radius * 0.46; blade.rotation.z = -0.32; pivot.add(blade); blades.add(pivot);
  }
  group.add(blades); group.userData.blades = blades;
  if (!vertical) group.rotation.x = -Math.PI / 2;
  return group;
}

export function createCase() {
  const g = new THREE.Group(); g.name = 'case';
  // Frame panels with slightly bevelled edges.
  add(g, box(0.16, 6.2, 5.1, materials.dark), -2.25, 3.15, 0);
  add(g, box(4.7, 0.18, 5.1, materials.dark), 0, 0.12, 0);
  add(g, box(4.7, 0.16, 5.1, materials.dark), 0, 6.15, 0);
  add(g, box(0.18, 6.2, 5.1, materials.dark), 2.25, 3.15, 0);
  for (const x of [-2.23, 2.23]) for (const z of [-2.5, 2.5]) add(g, box(0.15, 6.25, 0.15, fineMaterials.brushed), x, 3.15, z);
  // Rubber feet.
  for (const x of [-1.75, 1.75]) for (const z of [-1.9, 1.9]) add(g, cylinder(0.13, 0.1, fineMaterials.rubber, 16), x, -0.02, z);
  // Tempered glass side panel with corner thumbscrews.
  const glass = new THREE.MeshPhysicalMaterial({ color: '#80a5b5', transparent: true, opacity: 0.055, roughness: 0.12, side: THREE.DoubleSide, depthWrite: false });
  add(g, box(4.35, 5.8, 0.025, glass, 0.01), 0, 3.2, 2.48);
  for (const x of [-2.02, 2.02]) for (const y of [0.45, 5.95]) add(g, screw(0.055, 0.09), x, y, 2.5);
  // ARGB strip and PSU shroud with cut-out.
  add(g, box(4.25, 0.06, 0.08, materials.accent), 0, 0.25, 2.53);
  add(g, box(4.3, 1.15, 0.06, materials.dark), 0, 0.75, -1.4);
  // Cable management grommets.
  for (const y of [1.4, 3.1, 4.6]) {
    const grommet = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.045, 8, 24), fineMaterials.rubber);
    grommet.rotation.y = Math.PI / 2; add(g, grommet, -2.14, y, 0.9);
  }
  // Motherboard standoffs.
  for (const x of [-1.65, 0, 1.65]) for (const y of [1.5, 3.15, 4.8]) add(g, cylinder(0.075, 0.16, fineMaterials.screw, 10), -2.12, y, x);
  // Front panel I/O and power button.
  add(g, box(0.06, 0.26, 1.0, fineMaterials.brushed), 2.3, 5.55, 0);
  add(g, cylinder(0.09, 0.07, fineMaterials.screw, 18), 2.34, 5.72, -0.75);
  // Front fans with hub screws.
  const fans = [];
  for (let i = 0; i < 3; i++) {
    const f = fan(0.68); f.rotation.y = Math.PI / 2; add(g, f, 2.1, 1.35 + i * 1.8, 0);
    for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) add(g, screw(0.035, 0.06), 2.16, 1.35 + i * 1.8 + Math.cos(a) * 0.7, Math.sin(a) * 0.7);
    fans.push(f.userData.blades);
  }
  // Top dust filter mesh hint.
  for (let i = 0; i < 14; i++) add(g, box(4.2, 0.012, 0.02, materials.black, 0.003), 0, 6.24, -2.1 + i * 0.32);
  g.userData.fans = fans;
  return g;
}

export function createMotherboard() {
  const g = new THREE.Group(); g.name = 'motherboard';
  const boardMat = new THREE.MeshStandardMaterial({ map: pcbTexture(), color: '#ffffff', metalness: 0.28, roughness: 0.62 });
  add(g, box(4.8, 0.12, 4.8, boardMat), 0, 0, 0);
  // Mounting holes with brass standoff rings.
  for (const x of [-2.12, -0.35, 1.55]) for (const z of [-2.12, -0.2, 1.7]) {
    const hole = new THREE.Mesh(new THREE.RingGeometry(0.055, 0.11, 16), fineMaterials.solder);
    hole.rotation.x = -Math.PI / 2; add(g, hole, x, 0.065, z);
  }
  // CPU socket: metal frame, contact grid, retention arm and hook.
  add(g, box(1.2, 0.09, 1.2, fineMaterials.brushed), -0.8, 0.12, -0.65);
  add(g, box(1.02, 0.06, 1.02, materials.black), -0.8, 0.19, -0.65);
  for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
    add(g, box(0.035, 0.01, 0.035, fineMaterials.solder, 0.002), -1.25 + i * 0.1, 0.225, -1.1 + j * 0.1);
  }
  const lever = add(g, box(0.05, 0.08, 1.4, fineMaterials.brushed, 0.01), -0.12, 0.22, -0.65); g.userData.lever = lever;
  add(g, cylinder(0.05, 0.3, fineMaterials.screw, 10), -0.12, 0.26, 0.05);
  // VRM heatsinks flanking the socket.
  const vrmA = heatsink(0.95, 0.75, 0.42, 9, fineMaterials.brushed); add(g, vrmA, -1.62, 0.5, -0.65);
  const vrmB = heatsink(0.45, 0.9, 0.42, 9, fineMaterials.brushed); vrmB.rotation.y = Math.PI / 2; add(g, vrmB, -0.8, 0.5, -1.5);
  for (const [x, z] of [[-1.62, -0.44], [-1.62, -0.86], [-0.8, -1.7]]) add(g, screw(0.038, 0.06), x, 0.75, z);
  // RAM slots with latches and contact teeth.
  for (let i = 0; i < 4; i++) {
    const z = -1.45 + i * 0.25;
    add(g, box(2.75, 0.16, 0.12, i % 2 ? materials.black : materials.white, 0.015), 0.7, 0.15, z);
    for (let t = 0; t < 26; t++) add(g, box(0.05, 0.045, 0.09, fineMaterials.solder, 0.002), -0.45 + t * 0.088, 0.235, z);
    for (const x of [-0.75, 2.15]) add(g, box(0.14, 0.25, 0.18, materials.white, 0.015), x, 0.2, z);
  }
  // M.2 slot with mounting screw and standoff.
  add(g, box(2.5, 0.06, 0.75, materials.dark), 0.15, 0.12, 0.72);
  add(g, cylinder(0.055, 0.1, fineMaterials.solder, 10), 1.3, 0.16, 0.72);
  add(g, screw(0.04, 0.06), 1.3, 0.22, 0.72);
  // PCIe slots with metal shielding on the primary slot.
  for (let i = 0; i < 3; i++) {
    add(g, box(3.4, 0.18, 0.14, i === 0 ? fineMaterials.brushed : materials.black), 0, 0.17, 1.35 + i * 0.34);
    for (let t = 0; t < 30; t++) add(g, box(0.045, 0.05, 0.1, fineMaterials.solder, 0.002), -0.8 + t * 0.055, 0.265, 1.35 + i * 0.34);
  }
  // Chipset heatsink with screw detail.
  add(g, box(1.4, 0.38, 1.2, materials.dark), -1.5, 0.28, 1.25);
  for (let i = 0; i < 8; i++) add(g, box(1.2, 0.04, 0.08, fineMaterials.brushed, 0.004), -1.5, 0.48, 0.75 + i * 0.13);
  for (const [x, z] of [[-2.1, 0.72], [-2.1, 1.78], [-0.9, 0.72], [-0.9, 1.78]]) add(g, screw(0.04, 0.06), x, 0.5, z);
  // Chokes / capacitors / small ICs.
  for (let i = 0; i < 9; i++) add(g, box(0.3 + (i % 2) * 0.18, 0.25, 0.34, materials.chip), -1.65 + (i % 3) * 0.48, 0.2, -1.85 + Math.floor(i / 3) * 0.34);
  for (let i = 0; i < 12; i++) add(g, cylinder(0.065, 0.18, fineMaterials.brushed, 12), -2.12 + (i % 6) * 0.33, 0.15, 2.1 - Math.floor(i / 6) * 0.3);
  for (let i = 0; i < 18; i++) add(g, box(0.1, 0.06, 0.06, materials.chip, 0.01), -1.9 + (i % 9) * 0.42, 0.1, 2.05 - Math.floor(i / 9) * 0.16);
  // Rear I/O shroud with port cut-outs.
  add(g, box(0.75, 0.22, 1.25, materials.dark), 1.85, 0.18, 1.9);
  for (let i = 0; i < 5; i++) add(g, box(0.5, 0.09, 0.13, materials.black, 0.01), 1.85, 0.13, 1.4 + i * 0.2);
  // 24-pin ATX socket, CPU fan header, SATA ports, debug LEDs.
  add(g, box(0.3, 0.22, 0.8, materials.white), -2.08, 0.17, 0.65);
  for (let i = 0; i < 12; i++) for (let j = 0; j < 2; j++) add(g, box(0.035, 0.04, 0.035, fineMaterials.solder, 0.002), -2.14, 0.29, 0.32 + i * 0.055, j);
  add(g, box(0.22, 0.16, 0.42, materials.white, 0.01), 0.05, 0.14, 2.2);
  for (let i = 0; i < 4; i++) add(g, box(0.55, 0.16, 0.12, i % 2 ? materials.black : materials.white, 0.01), 1.35, 0.14, -0.6 + i * 0.18);
  for (let i = 0; i < 4; i++) add(g, box(0.05, 0.05, 0.05, i === 0 ? materials.accent : materials.chip, 0.008), -1.6 + i * 0.09, 0.09, 2.28);
  // Audio section isolation line.
  add(g, box(1.1, 0.012, 0.025, fineMaterials.solder, 0.002), 1.55, 0.075, 0.95);
  return g;
}

export function createCPU() {
  const g = new THREE.Group(); g.name = 'cpu';
  add(g, box(1.0, 0.07, 1.0, materials.pcb, 0.02), 0, 0, 0);
  // Gold contact pads on the underside.
  for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) {
    add(g, box(0.05, 0.008, 0.05, fineMaterials.solder, 0.002), -0.38 + i * 0.07, -0.04, -0.38 + j * 0.07);
  }
  // Bevel-edged integrated heat spreader.
  add(g, box(0.84, 0.09, 0.84, fineMaterials.brushed, 0.07), 0, 0.075, 0);
  add(g, box(0.62, 0.02, 0.62, materials.metal, 0.05), 0, 0.115, 0);
  // Alignment triangle and notch.
  const tri = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.02, 3), materials.gold); add(g, tri, -0.385, 0.055, -0.385);
  add(g, box(0.05, 0.03, 0.12, materials.black, 0.008), 0.44, 0.05, 0);
  const label = textPlate('CPU', '#27333d', '#a4afb7', 0.52, 0.2); label.rotation.x = -Math.PI / 2; add(g, label, 0, 0.128, 0);
  return g;
}

export function createCooler() {
  const g = new THREE.Group(); g.name = 'cooler';
  // Nickel-plated cold plate and mounting bar.
  add(g, box(1.0, 0.14, 1.0, fineMaterials.brushed), 0, 0.07, 0);
  add(g, box(1.3, 0.06, 0.16, fineMaterials.brushed), 0, 0.16, 0);
  for (const x of [-0.62, 0.62]) for (const z of [-0.42, 0.42]) add(g, screw(0.045, 0.08), x, 0.18, z);
  // Dense aluminium fin stack.
  for (let i = 0; i < 34; i++) add(g, box(1.6, 0.026, 1.3, fineMaterials.brushed, 0.003), 0, 0.2 + i * 0.037, 0);
  // Heat pipes running through the stack.
  for (const z of [-0.42, -0.14, 0.14, 0.42]) { const pipe = cylinder(0.055, 1.5, fineMaterials.solder); add(g, pipe, 0, 0.8, z); }
  // Fin edge crimps.
  for (let i = 0; i < 34; i += 2) for (const z of [-0.65, 0.65]) add(g, box(1.6, 0.018, 0.03, materials.metal, 0.002), 0, 0.2 + i * 0.037, z);
  const f = fan(0.62, false); add(g, f, 0, 1.43, 0); g.userData.fan = f.userData.blades;
  // Fan wire clips.
  for (const x of [-0.66, 0.66]) add(g, box(0.05, 0.06, 1.2, fineMaterials.screw, 0.01), x, 1.47, 0);
  const label = textPlate('COOLER', '#a8b5c0', '#1b2530', 0.7, 0.18); label.rotation.x = -Math.PI / 2; add(g, label, 0, 1.49, 0.4);
  return g;
}

export function createRAM() {
  const g = new THREE.Group(); g.name = 'ram';
  const ramPcb = new THREE.MeshStandardMaterial({ map: pcbTexture(), color: '#ffffff', metalness: 0.25, roughness: 0.66 });
  add(g, box(2.7, 1.1, 0.09, ramPcb, 0.025), 0, 0.66, 0);
  // Heat spreader with fin detail and edge highlight.
  add(g, box(2.74, 0.82, 0.18, materials.dark, 0.04), 0, 0.81, 0);
  for (let i = 0; i < 22; i++) add(g, box(0.05, 0.7, 0.2, fineMaterials.brushed, 0.004), -1.25 + i * 0.12, 0.81, 0);
  add(g, box(2.76, 0.06, 0.2, materials.accent, 0.015), 0, 1.24, 0);
  // DRAM packages on both sides.
  for (let i = 0; i < 8; i++) add(g, box(0.23, 0.27, 0.195, materials.chip, 0.015), -1.04 + i * 0.3, 0.75, 0);
  for (let i = 0; i < 8; i++) add(g, box(0.23, 0.27, 0.08, materials.chip, 0.012), -1.04 + i * 0.3, 0.75, -0.07);
  // Gold fingers with the DDR keying notch.
  for (let i = 0; i < 28; i++) {
    if (i === 13 || i === 14) continue;
    add(g, box(0.065, 0.14, 0.1, materials.gold, 0.003), -1.28 + i * 0.094, 0.12, 0);
  }
  add(g, box(0.14, 0.15, 0.12, materials.black, 0.006), -0.05, 0.12, 0);
  // SPD EEPROM and small passives.
  add(g, box(0.1, 0.06, 0.06, materials.chip, 0.01), 1.15, 0.72, 0.06);
  for (let i = 0; i < 10; i++) add(g, box(0.05, 0.04, 0.04, fineMaterials.solder, 0.008), -0.9 + i * 0.22, 0.4, 0.05);
  return g;
}

export function createSSD() {
  const g = new THREE.Group(); g.name = 'ssd';
  const ssdPcb = new THREE.MeshStandardMaterial({ map: pcbTexture(), color: '#ffffff', metalness: 0.22, roughness: 0.68 });
  add(g, box(2.2, 0.055, 0.72, ssdPcb, 0.02), 0, 0, 0);
  // Controller, DRAM cache and NAND packages.
  add(g, box(0.3, 0.08, 0.3, materials.chip, 0.015), -0.86, 0.06, 0);
  add(g, box(0.26, 0.06, 0.26, materials.chip, 0.012), -0.45, 0.055, 0.12);
  for (const x of [-0.05, 0.62]) add(g, box(0.48, 0.07, 0.46, materials.chip, 0.015), x, 0.06, 0);
  // Heatsink label sticker.
  const label = textPlate('NVMe SSD', '#dfe8ee', '#1c2731', 0.85, 0.24); label.rotation.x = -Math.PI / 2; add(g, label, 0.28, 0.102, 0.0);
  // M.2 connector with keying notch and pin detail.
  for (let i = 0; i < 12; i++) add(g, box(0.045, 0.035, 0.18, materials.gold, 0.002), -1.08, 0, -0.28 + i * 0.05);
  add(g, box(0.06, 0.06, 0.1, materials.black, 0.005), -1.08, 0, 0.22);
  // Mounting notch and screw ring.
  add(g, box(0.16, 0.02, 0.16, materials.black, 0.01), 1.0, 0.03, 0);
  const screwRing = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.14, 20), fineMaterials.screw); screwRing.rotation.x = -Math.PI / 2; add(g, screwRing, 1.04, 0.035, 0);
  // Passives.
  for (let i = 0; i < 8; i++) add(g, box(0.05, 0.03, 0.04, fineMaterials.solder, 0.006), -0.2 + i * 0.1, 0.04, 0.26);
  return g;
}

export function createGPU() {
  const g = new THREE.Group(); g.name = 'gpu';
  const gpuPcb = new THREE.MeshStandardMaterial({ map: pcbTexture(), color: '#ffffff', metalness: 0.25, roughness: 0.64 });
  add(g, box(3.8, 1.65, 0.22, gpuPcb), 0, 0.9, 0);
  // Shroud with angular vents and metal backplate.
  add(g, box(3.9, 1.7, 0.48, materials.dark, 0.1), 0, 0.95, 0.15);
  add(g, box(3.86, 1.66, 0.05, fineMaterials.brushed, 0.02), 0, 0.95, -0.1);
  for (let i = 0; i < 12; i++) add(g, box(3.5, 0.03, 0.06, materials.black, 0.004), 0, 0.25 + i * 0.12, -0.14);
  // Triple fans with hub screws and ring accents.
  const fans = [];
  for (const x of [-1.25, 0, 1.25]) {
    const f = fan(0.54); add(g, f, x, 0.92, 0.42); fans.push(f.userData.blades);
    for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) add(g, screw(0.03, 0.05), x + Math.cos(a) * 0.56, 0.92 + Math.sin(a) * 0.56, 0.4);
  }
  // Dense fin stack behind the shroud.
  for (let i = 0; i < 26; i++) add(g, box(0.06, 1.3, 0.3, fineMaterials.brushed, 0.004), -1.78 + i * 0.14, 0.95, 0.1);
  // Rear I/O bracket with display outputs.
  add(g, box(0.1, 1.95, 0.8, fineMaterials.brushed), -1.97, 0.95, 0.08);
  for (let i = 0; i < 4; i++) add(g, box(0.06, 0.22, 0.26, materials.black, 0.01), -2.03, 0.42 + i * 0.3, 0.08);
  for (let i = 0; i < 14; i++) add(g, box(0.08, 0.035, 0.6, materials.black, 0.004), -1.9, 1.5 + i * 0.03, 0.1);
  // PCIe gold fingers with keying notch.
  add(g, box(3.1, 0.12, 0.12, materials.gold, 0.01), 0.15, 0.05, -0.02);
  add(g, box(0.12, 0.14, 0.14, materials.black, 0.006), 0.35, 0.05, -0.02);
  // 8-pin power connectors on top.
  for (let c = 0; c < 2; c++) {
    add(g, box(0.75, 0.25, 0.4, materials.black), 1.05 + c * 0.85, 1.88, 0.1);
    for (let i = 0; i < 8; i++) add(g, box(0.06, 0.1, 0.06, fineMaterials.solder, 0.005), 0.75 + c * 0.85 + (i % 4) * 0.15, 1.95, -0.02 + Math.floor(i / 4) * 0.14);
  }
  // Brand accent light bar.
  add(g, box(1.2, 0.05, 0.06, materials.accent, 0.01), 1.1, 0.2, 0.42);
  g.userData.fans = fans;
  return g;
}

export function createPSU() {
  const g = new THREE.Group(); g.name = 'psu';
  add(g, box(2.6, 1.65, 2.3, materials.dark, 0.09), 0, 0.85, 0);
  // Honeycomb fan grille and fan.
  const f = fan(0.65, false); add(g, f, 0, 1.69, 0); g.userData.fan = f.userData.blades;
  for (let i = 0; i < 8; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16 + i * 0.07, 0.018, 6, 30), fineMaterials.screw);
    ring.rotation.x = -Math.PI / 2; add(g, ring, 0, 1.71, 0);
  }
  for (let i = 0; i < 12; i++) add(g, box(0.02, 0.02, 1.2, fineMaterials.screw, 0.004), -0.6 + i * 0.11, 1.71, 0);
  // Modular connector panel with individual port outlines.
  for (let i = 0; i < 8; i++) add(g, box(0.18, 0.22, 0.04, materials.black, 0.01), -0.85 + (i % 4) * 0.55, 0.65 + Math.floor(i / 4) * 0.4, 1.17);
  for (let i = 0; i < 12; i++) add(g, box(0.03, 0.05, 0.02, fineMaterials.solder, 0.003), -0.94 + (i % 6) * 0.1, 0.6 + Math.floor(i / 6) * 0.4, 1.19);
  // Spec label sticker.
  const label = textPlate('750W · GOLD', '#e4d8a7', '#202b36', 1.5, 0.42); add(g, label, 0, 0.9, 1.175);
  // Rear panel: IEC socket, switch, ventilation slots.
  add(g, box(0.4, 0.3, 0.06, materials.black, 0.01), 0.75, 1.2, -1.16);
  add(g, box(0.22, 0.14, 0.06, materials.black, 0.01), 0.25, 1.2, -1.16);
  for (let i = 0; i < 10; i++) add(g, box(0.05, 0.5, 0.04, materials.black, 0.004), -0.9 + i * 0.1, 0.9, -1.16);
  // Rubber feet.
  for (const x of [-0.9, 0.9]) for (const z of [-0.9, 0.9]) add(g, cylinder(0.1, 0.06, fineMaterials.rubber, 12), x, 0.02, z);
  return g;
}

export function createCable(kind = '24pin') {
  const g = new THREE.Group(); g.name = kind;
  const wide = kind === '24pin';
  const isPcie = kind === 'pcie';
  const isCpu = kind === 'cpu8pin';
  // Connector housing with latch tab.
  add(g, box(wide ? 1.2 : 0.62, 0.38, 0.48, materials.black, 0.035), 0, 0.2, 0);
  add(g, box(wide ? 0.5 : 0.24, 0.1, 0.1, materials.black, 0.02), 0, 0.42, 0.15);
  // Pin contacts.
  const count = wide ? 12 : 8;
  for (let i = 0; i < count; i++) add(g, box(0.045, 0.16, 0.22, fineMaterials.solder, 0.004), (i - (count - 1) / 2) * (wide ? 0.09 : 0.07), 0.08, 0.05);
  // Individual sleeved wires leaving the connector.
  const wires = wide ? 6 : 4;
  for (let i = 0; i < wires; i++) {
    const x = (i - (wires - 1) / 2) * (wide ? 0.16 : 0.12);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 0.3, -0.15),
      new THREE.Vector3(x * 1.2, 0.62, -0.6),
      new THREE.Vector3(x * 1.5 + 0.2, 0.4, -1.05),
      new THREE.Vector3(x * 1.6 + 0.35, 0.08, -1.2),
    ]);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, wide ? 0.045 : 0.038, 8, false), fineMaterials.rubber);
    tube.castShadow = true; g.add(tube);
  }
  // Cable comb and label tag.
  add(g, box(wide ? 1.0 : 0.5, 0.05, 0.1, materials.dark, 0.01), 0, 0.36, -0.55);
  const tagText = isPcie ? 'PCIe' : isCpu ? 'CPU' : 'ATX 24';
  const tag = textPlate(tagText, '#dfe9ef', '#151d26', 0.34, 0.1); tag.rotation.x = -Math.PI / 2; add(g, tag, 0, 0.46, -0.1);
  return g;
}

export function createPart(category) {
  return ({ cpu: createCPU, motherboard: createMotherboard, ram: createRAM, ssd: createSSD, gpu: createGPU, psu: createPSU, cooler: createCooler, case: createCase })[category]?.() || createCable(category);
}
