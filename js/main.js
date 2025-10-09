const STAGES = { TASK1:1, TASK2:2, TASK3:3, END:4 };
let stage;
let typed = "";
let currentLang = "ru";

const screenText   = document.getElementById('screenText');
const screenFx     = document.getElementById('screenFx');
const ghostWord    = document.getElementById('ghostWord');

const hintCard     = document.getElementById('hint');
const hintBody     = document.getElementById('hintBody');
const stepBadge    = document.getElementById('stepBadge');

const okBtn        = document.getElementById('okBtn');
const restartBtn   = document.getElementById('restartBtn');
const langBtn      = document.getElementById('langBtn');

const screenModal  = document.getElementById('screenModal');
const screenRestart= document.getElementById('screenRestart');

document.addEventListener('DOMContentLoaded', init);

/* === Простые звуки === */
const AC = new (window.AudioContext || window.webkitAudioContext)();
function ensureAudio(){ if (AC.state !== 'running') AC.resume(); }
window.addEventListener('pointerdown', ensureAudio);
window.addEventListener('keydown',    ensureAudio);

function beep({freq=880, dur=0.06, type='square', vol=0.08}) {
  ensureAudio();
  const o = AC.createOscillator();
  const g = AC.createGain();
  o.type = type; o.frequency.value = freq; g.gain.value = vol;
  o.connect(g); g.connect(AC.destination);
  o.start(); o.stop(AC.currentTime + dur);
}
function tickSound(){ beep({freq:1100, dur:0.035, type:'square', vol:0.06}); }
function wrongSound(){beep({freq:220, dur:0.20, type:'sawtooth', vol:0.10}); }

/* === Инициализация === */
function init(){
  stage = STAGES.TASK1;
  typed = "";
  screenModal.classList.add('hidden');

  renderKeyboard(currentLang);
  initSlots();
  updateTexts();
  updateGhostWord();
  updateScreenWord();

  okBtn.addEventListener('click', onOk);
  restartBtn.addEventListener('click', restartGame);
  langBtn.addEventListener('click', toggleLang);
  screenRestart.addEventListener('click', restartGame);

  document.addEventListener('keydown', onKeydown);
}

/* === Тексты и кнопки === */
function updateTexts(){
  // подсказка под текущее состояние
  const key =
    stage===STAGES.TASK1 ? 'task1' :
    stage===STAGES.TASK2 ? 'task2' :
    stage===STAGES.TASK3 ? 'task3' : 'end';

  hintBody.innerHTML = TEXTS[currentLang][key];
  document.getElementById('hintTitle').textContent = TEXTS[currentLang].hintTitle;

  // бейдж шага
  stepBadge.textContent =
    stage===STAGES.TASK1 ? '1 / 3' :
    stage===STAGES.TASK2 ? '2 / 3' :
    stage===STAGES.TASK3 ? '3 / 3' : '✔';

  okBtn.textContent         = TEXTS[currentLang].check;
  restartBtn.textContent    = TEXTS[currentLang].restart;
  screenRestart.textContent = TEXTS[currentLang].restart;
  langBtn.textContent       = currentLang === "ru" ? "🇷🇺 Русская" : "🇬🇧 English";
}


/* === Переключение языка только вручную === */
function toggleLang(){
  currentLang = currentLang === 'ru' ? 'en' : 'ru';
  renderKeyboard(currentLang);
  updateTexts();
  updateGhostWord();
  updateScreenWord();

  // Визуальный отклик кнопки
  langBtn.classList.add("pressed");
  setTimeout(() => langBtn.classList.remove("pressed"), 150);
}

/* === Эффект клика === */
function pop(){
  screenFx.classList.remove('pop');
  void screenFx.offsetWidth;
  screenFx.classList.add('pop');
}

/* === Кнопка Проверить === */
function onOk(){
  if(stage===STAGES.TASK1){
    if(typed.length>0){
      stage = STAGES.TASK2;
      typed = "";
      updateTexts();
      updateGhostWord();
      updateScreenWord();
      launchFireworks();
    } else shakeHint();
  }
  else if(stage===STAGES.TASK2){
    const w = typed.toUpperCase();
    const correct = (w==="КОТ" || w==="CAT");
    if(correct){
      stage = STAGES.TASK3;
      typed="";
      updateTexts();
      ghostWord.innerHTML = "";
      updateScreenWord();
      createSlots();
      spawnActiveCat();
      launchFireworks();
    } else {
      wrongWordFlash();
      wrongSound();
      shakeHint();
    }
  }
  else if(stage===STAGES.TASK3){
    finishIfDoneOrShowWindow();
  }
}

/* === Клавиатура === */
function onKeydown(e){
  if(stage===STAGES.END) return;
  if(e.code==='Space') e.preventDefault();

  if(e.key==='Enter'){
    e.preventDefault();
    if(!e.repeat) onOk();
    return;
  }

  tickSound();
  const key = e.key.toUpperCase();
  pressVisual(key);

  if(stage===STAGES.TASK1){
    if(key.length===1){
      typed = key;
      updateScreenWord();
      pop();
    }
  }
  else if(stage===STAGES.TASK2){
    const ruLetters = /^[А-ЯЁ]$/;
    const enLetters = /^[A-Z]$/;

    if(e.key === 'Backspace'){
      typed = typed.slice(0,-1);
      updateGhostWord();
      return;
    }

    let allow = false;
    if(currentLang === 'ru' && ruLetters.test(key)) allow = true;
    if(currentLang === 'en' && enLetters.test(key)) allow = true;

    if(allow && typed.length < 3){
      typed += key;
      pop();
      updateGhostWord();
    } else if (!allow && key.length===1) {
      wrongSound();
    }
  }
  else if(stage===STAGES.TASK3){
    if(e.code === 'Space' && !e.repeat){
      moveActiveCat();
      finishIfDoneOrShowWindow();
    }
  }
}

/* === Отображение текста === */
function updateScreenWord() {
  const cursor = '<div class="cursor-line"></div>';

  if (stage === STAGES.TASK1) {
    const letter = typed.toUpperCase();
    // буква + линия под ней
    screenText.innerHTML = letter ? `<span>${letter}</span>${cursor}` : cursor;
    screenText.style.opacity = 1;
  } else {
    screenText.innerHTML = "";
    screenText.style.opacity = 0;
  }
}


/* === Ошибка === */
function wrongWordFlash(){
  ghostWord.classList.add("wrong");
  setTimeout(()=>ghostWord.classList.remove("wrong"), 800);
}

/* === Финальное окно === */
function finishIfDoneOrShowWindow(){
  if(collected >= MAX_GOAL){
    stage = STAGES.END;

    // показать финальный текст в подсказке
    hintBody.innerHTML = TEXTS[currentLang].end;
    stepBadge.textContent = '✔';

    okBtn.classList.add('hidden');
    restartBtn.classList.remove('hidden');

    // модалка
    screenModal.querySelector('.screen-modal-title').textContent =
      TEXTS[currentLang].finishTitle;
    screenRestart.textContent = TEXTS[currentLang].restart; // ← текст кнопки в модалке
    screenModal.classList.remove('hidden');

    updateTexts();       // синхронизация языков
    launchFireworks();   // салют 🎉
  }
}


/* === Подсказка трясётся === */
function shakeHint(){
  hintCard.classList.remove('shake');
  void hintCard.offsetWidth;
  hintCard.classList.add('shake');
}

/* === Перезапуск === */
function restartGame(){
  ensureAudio();
  stage = STAGES.TASK1;
  typed = "";
  okBtn.classList.remove('hidden');
  restartBtn.classList.add('hidden');
  screenModal.classList.add('hidden');
  screenText.textContent = "";
  ghostWord.innerHTML = "";

  initSlots();
  renderKeyboard(currentLang);
  updateTexts();
  updateGhostWord();
  updateScreenWord();
}

/* === Салют === */
function launchFireworks() {
  const screen = document.getElementById("screen");
  for (let i = 0; i < 25; i++) {
    const f = document.createElement("div");
    f.className = "firework";
    const angle = Math.random() * 2 * Math.PI;
    const radius = 80 + Math.random() * 120;
    f.style.setProperty("--x", `${Math.cos(angle) * radius}px`);
    f.style.setProperty("--y", `${Math.sin(angle) * radius}px`);
    f.style.background = `hsl(${Math.random() * 360}, 100%, 70%)`;
    f.style.left = "50%";
    f.style.top = "50%";
    screen.appendChild(f);
    setTimeout(() => f.remove(), 900);
  }
}

/* === Серое слово === */
function updateGhostWord() {
  if(stage !== STAGES.TASK2){ ghostWord.innerHTML = ""; return; }

  const target = currentLang === "ru" ? ["К","О","Т"] : ["C","A","T"];
  const entered = typed.toUpperCase().split("");

  const out = target.map((letter, i) => {
    const ch = entered[i];
    if(!ch) return `<span class="ghost">${letter}</span>`;
    const ok = ch === letter;
    const color = ok ? "#0b2a6e" : "#ff4d4d";
    return `<span style="color:${color}">${ch}</span>`;
  }).join("");

  ghostWord.innerHTML = out;
}

window.addEventListener("resize", scaleScene);
window.addEventListener("DOMContentLoaded", scaleScene);

function scaleScene() {
  const scene = document.querySelector(".scene");
  if (!scene) return;

  const baseWidth = 1280;
  const baseHeight = 800;
  const scale = Math.min(
    window.innerWidth / baseWidth,
    window.innerHeight / baseHeight
  );

  const offsetY = (window.innerHeight - baseHeight * scale) / 2;
  scene.style.transform = `translateY(${offsetY}px) scale(${scale})`;
}