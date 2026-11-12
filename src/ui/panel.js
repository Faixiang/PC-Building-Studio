import { steps } from '../tutorial/steps.js';

export function createAssemblyUI() {
  document.querySelector('.intro').hidden = true;
  document.querySelector('.stage-card').hidden = true;
  document.querySelector('.status').innerHTML = '<i></i> 教學模式 · 不用怕裝錯';
  const ui = document.createElement('div'); ui.id = 'assembly-ui';
  ui.innerHTML = `<div class="progress-bar"><div class="progress-track"><i id="progress-fill"></i></div><span id="progress-label">0% 完成</span></div><div id="drawer-mount"></div><aside class="step-sidebar"><div class="side-title"><small>YOUR BUILD</small><strong>組裝進度</strong></div><div class="step-list">${steps.map((s, i) => `<div class="step-item" data-step="${i}"><span>${String(i + 1).padStart(2, '0')}</span><div><strong>${s.title}</strong><small>${s.short}</small></div><i>✓</i></div>`).join('')}</div></aside>
    <section class="instruction-panel"><div class="instruction-top"><div><p class="eyebrow" id="step-count"></p><h2 id="step-title"></h2></div><button id="spec-open" class="outline-button">零件規格 ⓘ</button></div><p id="step-description"></p><div class="tip-box"><span>新手小叮嚀</span><p id="step-tip"></p></div><div id="step-actions"></div><div class="instruction-actions"><button id="demo-button" class="text-button">▷ 演示給我看</button><button id="glossary-button" class="text-button">? 術語詞典</button><span id="drag-hint">拖曳綠色零件到發光位置</span></div></section>
    <div class="view-controls"><button id="reset-view">↻ 重置視角</button><button id="help-button">? 操作說明</button></div>
    <div id="toast" role="status"></div>`;
  document.querySelector('#app').append(ui);
  return ui;
}

export function updateStepUI(index, state = {}) {
  const step = steps[index]; if (!step) return;
  document.querySelectorAll('.step-item').forEach((el, i) => {
    el.classList.toggle('active', i === index); el.classList.toggle('done', i < index);
  });
  document.querySelector('#step-count').textContent = `STEP ${String(index + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
  updateProgress(index, state);
  document.querySelector('#step-title').textContent = step.title;
  document.querySelector('#step-description').textContent = step.description;
  document.querySelector('#step-tip').textContent = step.tip;
  const actions = document.querySelector('#step-actions'); actions.innerHTML = '';
  if (step.actions && !state.actionDone) actions.insertAdjacentHTML('beforeend', `<button id="required-action" class="action-button">${step.actions[0].label}</button>`);
  if (state.installed && step.after && !state.afterDone) actions.insertAdjacentHTML('beforeend', `<button id="after-action" class="action-button">${step.after.label}</button>`);
  document.querySelector('#drag-hint').textContent = state.actionDone || !step.actions ? (state.installed ? '零件安裝完成' : '拖曳綠色零件到發光位置') : '先完成上方的準備動作';
}

export function updateProgress(index, state = {}) {
  const fill = document.querySelector('#progress-fill');
  const label = document.querySelector('#progress-label');
  if (!fill || !label) return;
  let done = index;
  if (state.installed && (!state.after || state.afterDone)) done = index + 1;
  else if (state.installed) done = index + 0.5;
  const percent = Math.round(done / steps.length * 100);
  fill.style.width = `${percent}%`;
  label.textContent = `${percent}% 完成`;
}

let toastTimer;
export function toast(message, type = 'info') {
  const el = document.querySelector('#toast'); if (!el) return;
  el.innerHTML = message; el.className = `show ${type}`;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.className = '', 5000);
}

export function showPrep(onDone) {
  const modal = document.querySelector('#prep-modal');
  modal.innerHTML = `<div class="modal-card prep-card"><p class="eyebrow">開始之前 · 只要 30 秒</p><h2>第一次組裝，也不用緊張。</h2><p class="modal-intro">記住三件小事，就能放心探索。這裡裝錯可以重來，不會弄壞任何東西。</p><div class="prep-grid"><article><b>✋</b><h3>保持雙手乾淨乾燥</h3><p>先洗手擦乾、觸碰金屬機殼釋放靜電，避免在地毯上組裝。</p></article><article><b>◇</b><h3>拿邊緣，不碰接點</h3><p>金色接點、CPU 底部與電子元件很脆弱，請拿零件邊緣。</p></article><article><b>↻</b><h3>先觀察，再行動</h3><p>拖曳空白處旋轉、滾輪縮放。看到綠色提示，就是下一步。</p></article></div><button class="primary-button" id="prep-done">我準備好了，開始組裝 →</button></div>`;
  modal.showModal(); modal.querySelector('#prep-done').onclick = () => { modal.close(); onDone(); };
}

export function showCompletion(selections = {}, installedParts = []) {
  const brandList = Object.entries(selections).map(([cat, brand]) => `<li><span class="chip" style="--brand:${brand?.color || '#9df5d1'}"></span><strong>${brand?.name || '—'}</strong><small>${categoryLabel(cat)}</small></li>`).join('');
  const partList = installedParts.map(p => `<span class="installed-chip">✓ ${p}</span>`).join('');
  const modal = document.querySelector('#complete-modal');
  modal.innerHTML = `<div class="modal-card complete-card"><div class="success-icon">✓</div><p class="eyebrow">BUILD COMPLETE</p><h2>你的電腦，組裝完成！</h2><p>從一個個陌生的零件，到一台完整的電腦。<br>你已經走過最重要的 8 個裝機階段。</p><div class="installed-review"><h3>本次安裝的零件</h3><div class="installed-list">${partList}</div></div><div class="build-recap"><h3>你的選配清單</h3><ul class="brand-recap">${brandList}</ul></div><div class="learned"><span>認識核心零件</span><span>看懂防呆方向</span><span>了解供電接頭</span><span>掌握裝機順序</span></div><div class="complete-actions"><button class="primary-button" onclick="location.reload()">再組一台 →</button><button class="outline-button" id="admire">再看看我的電腦</button></div></div>`;
  modal.showModal(); modal.querySelector('#admire').onclick = () => modal.close();
}

function categoryLabel(cat) {
  return { cpu: '處理器', motherboard: '主機板', ram: '記憶體', ssd: '固態硬碟', gpu: '顯示卡', psu: '電源供應器', cooler: 'CPU 散熱器', case: '機殼' }[cat] || cat;
}

export function showGlossary() {
  const terms = [
    ['CPU 中央處理器', '電腦的大腦', '方形金屬蓋的小零件，負責執行程式與計算。'],
    ['主機板 Motherboard', '所有零件的橋樑', '佈滿插槽與晶片的大板子，所有零件透過它連接。'],
    ['RAM 記憶體', '暫時的工作桌', '有金手指的長條零件，存放正在使用的資料，關機後清空。'],
    ['M.2 SSD', '長期保存檔案', '像口香糖般的薄片硬碟，用來保存系統與檔案。'],
    ['PCIe', '高速擴充通道', '主機板上的長插槽，主要用於顯示卡。'],
    ['24pin / 8pin', '不同用途的電源接頭', '數字代表接點數；24pin 給主機板，CPU 8pin 給處理器。'],
    ['防呆缺口', '防止裝錯方向的設計', '零件與插槽形狀不對稱，方向錯誤時不要硬壓。'],
    ['TDP / 功耗', '發熱與用電參考', '幫助選擇散熱器與電源，但不等於所有情況下的實際耗電。'],
  ];
  const modal = document.querySelector('#glossary-modal');
  modal.innerHTML = `<div class="modal-card glossary-card"><button class="modal-close">×</button><p class="eyebrow">NO JARGON LEFT BEHIND</p><h2>看不懂的詞，在這裡變簡單。</h2><div class="glossary-grid">${terms.map(t => `<article><small>${t[1]}</small><h3>${t[0]}</h3><p>${t[2]}</p></article>`).join('')}</div></div>`;
  modal.showModal(); modal.querySelector('.modal-close').onclick = () => modal.close();
}
