import { steps } from '../tutorial/steps.js';

export function createDrawer(onDragStart) {
  const drawer = document.createElement('aside');
  drawer.id = 'part-drawer';
  drawer.innerHTML = `<div class="drawer-head"><small>PARTS DRAWER</small><strong id="drawer-title">取出零件</strong></div><div id="drawer-slot" class="drawer-slot"></div><p class="drawer-hint">按住卡片拖到場景中發光的位置</p>`;
  document.querySelector('#assembly-ui').append(drawer);
  return { update: (index, brandName) => renderSlot(drawer, index, brandName, onDragStart) };
}

function renderSlot(drawer, index, brandName, onDragStart) {
  const step = steps[index]; if (!step) return;
  const slot = drawer.querySelector('#drawer-slot');
  drawer.querySelector('#drawer-title').textContent = step.title;
  slot.innerHTML = `<div class="part-card" data-step="${index}" draggable="false">
    <span class="card-brand" style="--brand:${getBrandColor(brandName)}">${brandName || step.part.toUpperCase()}</span>
    <strong>${step.title}</strong>
    <small>${step.short}</small>
    <span class="card-cta">↗ 拖我到正確位置</span>
  </div>`;
  const card = slot.querySelector('.part-card');
  card.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    onDragStart(e, step.part, card);
  });
}

function getBrandColor(name) {
  const map = { 'AMD':'#e84a3c','Intel':'#3b82c4','ASUS':'#4f80aa','MSI':'#e34b50','GIGABYTE':'#4d94c7','Kingston':'#d94c50','Samsung':'#497bb2','Noctua':'#b28c63','Fractal Design':'#6e8fa8','Seasonic':'#527fb0' };
  return map[name] || '#9df5d1';
}
