export const steps = [
  {
    id: 'cpu', part: 'cpu', title: '安裝 CPU', short: '電腦的大腦',
    description: '把 CPU 輕輕放進主機板的插座。看到金屬蓋上的三角形了嗎？讓它對準插座角落的標記。',
    tip: '不要碰 CPU 底部的接點，也不要用力壓。方向正確時，它會自然放平。',
    error: '還沒對準 CPU 插座喔。找主機板上的方形金屬框，讓兩個三角形標記對齊。',
    actions: [{ id: 'open-lever', label: '① 先打開插座壓桿', done: '壓桿已打開，可以放入 CPU' }],
    after: { id: 'close-lever', label: '② 壓回固定桿', done: 'CPU 已穩穩固定！' },
  },
  {
    id: 'cooler', part: 'cooler', title: '安裝 CPU 散熱器', short: '幫大腦降溫',
    description: 'CPU 工作會發熱。塗好散熱膏後，把散熱器放到 CPU 正上方，讓熱量順利帶走。',
    tip: '先確認散熱器底部的保護膜已撕掉。真實裝機時，扣具要對角分次鎖緊。',
    error: '散熱器要放在剛才的 CPU 正上方，讓底部完整貼合 CPU。',
    actions: [{ id: 'paste', label: '① 塗上散熱膏', done: '散熱膏已完成，接著放上散熱器' }],
  },
  {
    id: 'ram', part: 'ram', title: '安裝記憶體', short: '電腦的臨時工作桌',
    description: '把記憶體插進主機板建議的 A2 插槽。金手指上的缺口，要對準插槽中的凸起。',
    tip: '真實安裝時，先打開插槽卡榫，垂直壓下直到兩側發出「喀」聲。',
    error: '請找有綠色提示的記憶體插槽。記憶體缺口與插槽凸起也要在同一側。',
  },
  {
    id: 'ssd', part: 'ssd', title: '安裝 M.2 SSD', short: '系統與檔案的家',
    description: '把薄薄的 SSD 斜插入 M.2 插槽，再輕輕壓平。這裡會保存你的 Windows、遊戲和照片。',
    tip: 'M.2 2280 的「2280」代表寬 22 mm、長 80 mm。別忘了最後的固定螺絲。',
    error: 'SSD 要放在主機板中間的長方形 M.2 區域，不是記憶體插槽。',
    after: { id: 'ssd-screw', label: '鎖上 SSD 固定螺絲', done: 'SSD 已固定完成！' },
  },
  {
    id: 'motherboard', part: 'motherboard', title: '主機板裝入機殼', short: '把核心平台放進家裡',
    description: '現在把已裝好核心零件的主機板，一起放進機殼。鎖螺絲前，先確認銅柱位置與孔位一致。',
    tip: '多餘的銅柱可能碰到主機板背面造成短路；真實裝機務必依板型調整。',
    error: '主機板要放進右側機殼的綠色位置，背板接孔朝向機殼後方。',
    actions: [{ id: 'standoffs', label: '① 檢查機殼銅柱', done: '9 個銅柱位置已確認' }],
    after: { id: 'mb-screws', label: '② 鎖上主機板螺絲', done: '主機板已固定！' },
  },
  {
    id: 'gpu', part: 'gpu', title: '安裝顯示卡', short: '讓畫面活起來',
    description: '將顯卡底部的金色接點，對準主機板最靠近 CPU 的 PCIe x16 長插槽。',
    tip: '先確認機殼後方擋板已取下。真實安裝時壓到卡榫扣住，再鎖上擋板螺絲。',
    error: '顯卡要對準主機板下方的 PCIe x16 長插槽，不是上方的小插槽。',
  },
  {
    id: 'psu', part: 'psu', title: '安裝電源供應器', short: '整台電腦的心臟',
    description: '把電源供應器放入機殼底部獨立倉。它會把家用插座的電，轉成零件能使用的電力。',
    tip: '模組線只能使用這顆電源原廠指定的線材，不同型號不要混插。',
    error: '電源供應器要放進機殼最下方的獨立空間，風扇朝向通風孔。',
  },
  {
    id: '24pin', part: '24pin', title: '連接主機板 24pin', short: '主機板的主要電力',
    description: '找到最寬的 24pin 接頭，插到主機板側邊的長插座。卡扣方向要與插座對應。',
    tip: '24pin 通常需要一點力道，但要平均施力，不要只壓單邊。',
    error: '這是最寬的供電接頭，請找主機板側邊同樣寬的 24pin 插座。',
  },
  {
    id: 'cpu8pin', part: 'cpu8pin', title: '連接 CPU 8pin', short: '處理器的專屬供電',
    description: '把標示 CPU 的 8pin 線接到主機板左上方。它和顯卡 PCIe 接頭長得像，但不能混用。',
    tip: 'CPU 用 EPS 接頭；顯卡用 PCIe 接頭。看不懂時，以線材文字為準。',
    error: '請找主機板左上方的 CPU 供電插座，不要接在顯卡上。',
  },
  {
    id: 'pcie', part: 'pcie', title: '連接顯卡供電', short: '高效能顯卡吃飽電力',
    description: '最後把 PCIe 供電接頭插進顯卡頂部。確認插到底，沒有露出明顯縫隙。',
    tip: '不要讓接頭在靠近插座處大幅彎折，也不要使用來路不明的轉接線。',
    error: '這條 PCIe 供電線要接在顯卡頂部的接頭。',
  },
];

export const prepCards = [
  { icon: '✋', title: '保持雙手乾淨乾燥', text: '先洗手並擦乾。接觸金屬機殼釋放靜電，避免在地毯上組裝。' },
  { icon: '◇', title: '拿邊緣，不碰接點', text: '金色接點、CPU 底部和電子元件都很脆弱，拿零件的邊緣或金屬外殼。' },
  { icon: '↻', title: '先觀察，再行動', text: '滑鼠拖曳空白處旋轉、滾輪縮放。裝錯不會壞，也沒有時間限制。' },
];
