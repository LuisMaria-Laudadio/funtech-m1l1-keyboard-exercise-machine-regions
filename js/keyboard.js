const KB_ROWS = {
  ru: [
    "Ё 1 2 3 4 5 6 7 8 9 0 - = ⌫",
    "Й Ц У К Е Н Г Ш Щ З Х Ъ",
    "Ф Ы В А П Р О Л Д Ж Э",
    "Я Ч С М И Т Ь Б Ю",
    "Пробел"
  ],
  en: [
    "` 1 2 3 4 5 6 7 8 9 0 - = ⌫",
    "Q W E R T Y U I O P [ ]",
    "A S D F G H J K L ; '",
    "Z X C V B N M , . /",
    "Space"
  ]
};

function renderKeyboard(lang){
  const root = document.getElementById('keyboard');
  root.innerHTML = "";
  KB_ROWS[lang].forEach(row=>{
    const rowEl = document.createElement('div');
    rowEl.className = 'kb-row';
    row.split(' ').forEach(label=>{
      const key = document.createElement('div');
      key.className = 'key';
      key.dataset.label = label;
      if(label==="⌫") key.classList.add('back');
      if(label==="Пробел" || label==="Space") key.classList.add('space');
      if(label.length>1 && label!=="⌫") key.classList.add('small');
      key.textContent = label;
      rowEl.appendChild(key);
    });
    root.appendChild(rowEl);
  });
}

function pressVisual(key) {
  const keys = document.querySelectorAll(".key");
  keys.forEach((k) => {
    if (
      k.textContent.toUpperCase() === key ||
      (key === " " && k.classList.contains("space")) ||
      (key === "BACKSPACE" && k.classList.contains("back"))
    ) {
      k.classList.add("pressed");
      setTimeout(() => k.classList.remove("pressed"), 150);
    }
  });
}

let audioCtx;
function tickSound(){
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type='square'; o.frequency.value=880;
  g.gain.setValueAtTime(0.1,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+0.07);
  o.connect(g).connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime+0.08);
}
