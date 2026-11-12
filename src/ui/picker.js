import { openSpecs } from './specsPanel.js';

export const categoryMeta = [
  { id: 'cpu', name: '處理器', en: 'CPU', icon: '▣' },
  { id: 'motherboard', name: '主機板', en: 'Motherboard', icon: '▦' },
  { id: 'ram', name: '記憶體', en: 'Memory', icon: '▤' },
  { id: 'ssd', name: '固態硬碟', en: 'Storage', icon: '▬' },
  { id: 'gpu', name: '顯示卡', en: 'Graphics', icon: '▰' },
  { id: 'psu', name: '電源供應器', en: 'Power Supply', icon: '◉' },
  { id: 'cooler', name: 'CPU 散熱器', en: 'Cooling', icon: '❉' },
  { id: 'case', name: '機殼', en: 'Case', icon: '▥' },
];

export async function createPicker(onComplete) {
  const brands = await fetch('/assets/brands.json').then(r => r.json());
  const selected = {};
  let current = 'cpu';
  const root = document.querySelector('#picker');
  root.hidden = false;
  root.innerHTML = `<div class="picker-shell">
    <header class="picker-header"><div><p class="eyebrow">STEP 01 · 認識你的零件</p><h2>為你的電腦，挑選品牌。</h2><p>不用煩惱型號與相容性。先選你喜歡的品牌，我們用通用模型帶你學會組裝。</p></div><button class="text-button" id="auto-pick">✦ 幫我決定</button></header>
    <div class="picker-body"><nav class="category-tabs">${categoryMeta.map((c, i) => `<button data-category="${c.id}" class="${i === 0 ? 'active' : ''}"><span>${c.icon}</span><div>${c.name}<small>${c.en}</small></div><b class="picked">✓</b></button>`).join('')}</nav>
    <section class="brand-area"><div class="brand-area-title"><div><small id="category-en">CPU</small><h3 id="category-title">選擇處理器品牌</h3></div><button id="category-spec" class="outline-button">查看規格範例 ⓘ</button></div><div id="brand-grid" class="brand-grid"></div></section></div>
    <footer class="picker-footer"><span id="pick-progress">尚未選擇 · 可使用「幫我決定」</span><button id="start-build" class="primary-button" disabled>確認選配，開始組裝 <b>→</b></button></footer>
  </div>`;

  function refresh() {
    const meta = categoryMeta.find(c => c.id === current);
    root.querySelector('#category-en').textContent = meta.en;
    root.querySelector('#category-title').textContent = `選擇${meta.name}品牌`;
    root.querySelectorAll('[data-category]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === current);
      btn.classList.toggle('has-pick', !!selected[btn.dataset.category]);
    });
    root.querySelector('#brand-grid').innerHTML = brands[current].map(b => `<button class="brand-card ${selected[current]?.id === b.id ? 'selected' : ''}" data-brand="${b.id}" style="--brand:${b.color}"><span class="brand-color"></span><strong>${b.name}</strong><small>${b.nameZh}</small><p>${b.tagline}</p><i>✓</i></button>`).join('');
    root.querySelectorAll('[data-brand]').forEach(btn => btn.onclick = () => {
      selected[current] = brands[current].find(b => b.id === btn.dataset.id || b.id === btn.dataset.brand);
      refresh();
      const next = categoryMeta.find(c => !selected[c.id]);
      if (next) { current = next.id; refresh(); }
    });
    const count = Object.keys(selected).length;
    root.querySelector('#pick-progress').textContent = count === 8 ? '8 項零件已選好，準備開始！' : `已選 ${count} / 8 項 · 每一類選一個喜歡的品牌`;
    root.querySelector('#start-build').disabled = count < 8;
  }
  root.querySelectorAll('[data-category]').forEach(btn => btn.onclick = () => { current = btn.dataset.category; refresh(); });
  root.querySelector('#auto-pick').onclick = () => {
    const suggestions = { cpu: 'amd', motherboard: 'asus', ram: 'kingston', ssd: 'samsung', gpu: 'msi', psu: 'seasonic', cooler: 'noctua', case: 'fractal' };
    categoryMeta.forEach(c => selected[c.id] = brands[c.id].find(b => b.id === suggestions[c.id]));
    current = 'case'; refresh();
  };
  root.querySelector('#category-spec').onclick = () => openSpecs(current);
  root.querySelector('#start-build').onclick = () => { root.hidden = true; onComplete(selected); };
  refresh();
}
