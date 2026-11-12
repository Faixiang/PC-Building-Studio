import './style.css';
import * as THREE from 'three';
import { createStudio } from './scene/setup.js';
import { createCase, createCable, createPart, materials, box } from './parts/procedural.js';
import { addAnchor } from './parts/loader.js';
import { applyBrand } from './parts/branding.js';
import { createPicker, categoryMeta } from './ui/picker.js';
import { createAssemblyUI, updateStepUI, showPrep, showGlossary, showCompletion, toast } from './ui/panel.js';
import { createDrawer } from './ui/drawer.js';
import { openSpecs } from './ui/specsPanel.js';
import { steps } from './tutorial/steps.js';
import { CameraDirector } from './tutorial/camera.js';
import { DragInstaller } from './interaction/drag.js';

const studio = createStudio();
const { scene, camera, controls } = studio;
const director = new CameraDirector(camera, controls);
const previewCase = createCase(); previewCase.position.set(2.2, 0.12, 0); previewCase.rotation.y = -0.22; scene.add(previewCase);
const workMat = box(10.5, 0.04, 7.5, new THREE.MeshStandardMaterial({ color: '#1d2b35', roughness: 0.88 }), 0.12);
workMat.position.set(2, 0.015, 0); scene.add(workMat);
studio.onTick(delta => { previewCase.userData.fans.forEach(f => f.rotation.z += delta * 0.65); director.update(); });
requestAnimationFrame(() => document.querySelector('#loading').classList.add('done'));

const openPicker = () => createPicker(selections => startAssembly(selections));
document.querySelector('#next-step').addEventListener('click', openPicker);

async function startAssembly(selections) {
  scene.remove(previewCase); scene.remove(workMat);
  document.querySelector('.intro').hidden = true; document.querySelector('.stage-card').hidden = true;

  // Only case and motherboard are placed in the scene initially.
  // All other parts are created but NOT added to scene — they live in the drawer.
  const models = {}; const anchors = {};
  for (const category of categoryMeta.map(c => c.id)) {
    const model = createPart(category); models[category] = model; applyBrand(model, category, selections[category]);
  }
  const pcCase = models.case; pcCase.position.set(5.8, 0.12, 0); scene.add(pcCase);
  const board = models.motherboard; board.position.set(0, 0.65, 0); scene.add(board);

  // Cable models (not in categoryMeta) — also kept off-scene
  for (const id of ['24pin', 'cpu8pin', 'pcie']) {
    models[id] = createCable(id); applyBrand(models[id], id, null);
  }

  anchors.cpu = addAnchor(board, 'cpu-socket', [-0.8, 0.26, -0.65]);
  anchors.cooler = addAnchor(board, 'cooler-mount', [-0.8, 0.36, -0.65]);
  anchors.ram = addAnchor(board, 'ram-a2-slot', [0.7, 0.25, -0.95]);
  anchors.ssd = addAnchor(board, 'm2-slot', [0.15, 0.21, 0.72]);
  anchors.motherboard = addAnchor(pcCase, 'motherboard-tray', [-1.92, 3.55, 0], [0, 0, -Math.PI / 2]);
  anchors.gpu = addAnchor(board, 'pcie-x16', [0, 0.27, 1.35]);
  anchors.psu = addAnchor(pcCase, 'psu-bay', [-0.45, 0.24, 0.25]);
  anchors['24pin'] = addAnchor(board, '24pin-power', [2.02, 0.25, 1.9]);
  anchors.cpu8pin = addAnchor(board, 'cpu-power', [-2.05, 0.25, 0.65]);
  anchors.pcie = addAnchor(board, 'gpu-power', [1.25, 2.18, 1.55]);

  createAssemblyUI();
  const installer = new DragInstaller({ scene, camera, renderer: studio.renderer, controls,
    onInstall: () => handleInstalled(), onError: message => toast(`<b>差一點點！</b>${message}<button id="toast-demo">演示給我看</button>`, 'error') });

  // Drawer: shows current part card, drag starts a 3D follower
  const drawer = createDrawer((event, partCategory, cardEl) => {
    const template = models[partCategory];
    if (!template) return;
    installer.startFromDrawer(event, template);
  });

  let current = 0; let state = {};
  const stepStates = steps.map(() => ({ actionDone: false, installed: false, afterDone: false }));

  function focusCurrent() {
    const target = anchors[steps[current].id].getWorldPosition(new THREE.Vector3());
    director.focus(target, new THREE.Vector3(5.8, 4.8, 7.5));
  }

  function armInstaller() {
    const step = steps[current];
    const part = models[step.part];
    installer.setTask(part, anchors[step.id], step.error);
    // Update drawer to show current part
    const brandName = selections[step.part]?.name || '';
    drawer.update(current, brandName);
  }

  function activateStep(index) {
    current = index; state = stepStates[current];
    updateStepUI(current, state); armInstaller(); focusCurrent();
    const actionButton = document.querySelector('#required-action');
    if (actionButton) actionButton.onclick = () => {
      state.actionDone = true;
      if (steps[current].id === 'cpu' && board.userData.lever) board.userData.lever.rotation.z = -0.8;
      updateStepUI(current, state); toast(steps[current].actions[0].done, 'success');
    };
  }

  function handleInstalled() {
    state.installed = true;
    updateStepUI(current, state);
    const step = steps[current];
    if (step.after && !state.afterDone) {
      const btn = document.querySelector('#after-action');
      if (btn) btn.onclick = () => { state.afterDone = true; toast(step.after.done, 'success'); advance(); };
    } else advance();
  }

  function advance() {
    if (current === steps.length - 1) { installer.clear(); setTimeout(() => showFinale(selections), 650); return; }
    toast(`<b>做得好！</b>${steps[current].title}完成，繼續下一步。`, 'success');
    setTimeout(() => activateStep(current + 1), 700);
  }

  document.querySelector('#spec-open').onclick = () => {
    const id = steps[current].id;
    openSpecs(['24pin', 'cpu8pin'].includes(id) ? 'motherboard' : id === 'pcie' ? 'gpu' : id);
  };
  document.querySelector('#demo-button').onclick = () => installer.demo();
  document.querySelector('#glossary-button').onclick = showGlossary;
  document.querySelector('#reset-view').onclick = () => director.overview();
  document.querySelector('#help-button').onclick = () => showPrep(() => {});
  document.addEventListener('click', e => { if (e.target.id === 'toast-demo') installer.demo(); });

  studio.onTick(delta => {
    installer.update();
    pcCase.userData.fans.forEach(f => f.rotation.z += delta * 0.8);
    if (models.cooler.userData.fan) models.cooler.userData.fan.rotation.y += delta * 0.8;
    if (models.gpu.userData.fans) models.gpu.userData.fans.forEach(f => f.rotation.z += delta * 0.8);
    if (models.psu.userData.fan) models.psu.userData.fan.rotation.y += delta * 0.8;
  });

  window.__pcBuild = { models, anchors, camera, installer, steps, selections, get current() { return current; }, get state() { return state; }, project: (o) => { const v = o.clone().project(camera); return { x: (v.x + 1) * innerWidth / 2, y: (1 - v.y) * innerHeight / 2 }; }, worldPosition: (anchor) => anchor.getWorldPosition(new THREE.Vector3()) };
  director.overview();
  showPrep(() => activateStep(0));
}

function showFinale(selections) {
  document.querySelectorAll('.step-item').forEach(el => { el.classList.remove('active'); el.classList.add('done'); });
  materials.accent.emissiveIntensity = 2.2;
  director.overview();
  showCompletion(selections, steps.map(s => s.title));
  toast('<b>開機成功！</b>風扇轉起來了，這是你親手完成的電腦。', 'success');
}
