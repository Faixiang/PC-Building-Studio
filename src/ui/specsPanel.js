let specData;
export async function getSpecs() {
  specData ||= await fetch('/assets/specs.json').then(r => r.json());
  return specData;
}

export function openSpecs(category, mode = 'beginner') {
  getSpecs().then(specs => {
    const data = specs[category]; if (!data) return;
    const modal = document.querySelector('#spec-modal');
    modal.innerHTML = `<div class="modal-card spec-card">
      <button class="modal-close" aria-label="關閉">×</button>
      <div class="spec-head"><div><p class="eyebrow">COMPONENT SPECIFICATION</p><h2>${data.title}</h2><p>${data.summary}</p></div>
      <div class="segmented"><button data-mode="beginner" class="${mode === 'beginner' ? 'active' : ''}">新手模式</button><button data-mode="pro" class="${mode === 'pro' ? 'active' : ''}">專業模式</button></div></div>
      <div class="example-notice">ⓘ 以下為通用教學示例，非特定品牌型號的真實規格</div>
      <div class="spec-list">${data.parameters.map((p, i) => `<article class="spec-row">
        <div class="spec-label"><strong>${p.label}</strong><button class="info-button" data-index="${i}" aria-label="查看 ${p.label} 說明">i</button></div>
        <div class="spec-value">${p.value}</div>
        <p class="spec-explanation">${mode === 'beginner' ? p.beginner : p.pro}</p>
        <div class="spec-detail" data-detail="${i}" hidden><p><b>專業補充</b>${p.pro}</p><p><b>安裝提醒</b>${p.install}</p></div>
      </article>`).join('')}</div>
    </div>`;
    modal.showModal();
    modal.querySelector('.modal-close').onclick = () => modal.close();
    modal.querySelectorAll('[data-mode]').forEach(btn => btn.onclick = () => { modal.close(); openSpecs(category, btn.dataset.mode); });
    modal.querySelectorAll('.info-button').forEach(btn => btn.onclick = () => {
      const detail = modal.querySelector(`[data-detail="${btn.dataset.index}"]`);
      detail.hidden = !detail.hidden; btn.classList.toggle('active', !detail.hidden);
    });
  });
}
