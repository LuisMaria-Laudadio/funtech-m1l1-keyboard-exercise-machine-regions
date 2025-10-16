const STAGES = { TASK1: 1, TASK2: 2, TASK3: 3, END: 4 };
let stage;
let typed = "";

const screenText = document.getElementById('screenText');
const screenFx = document.getElementById('screenFx');
const ghostWord = document.getElementById('ghostWord');

const hintCard = document.getElementById('hint');
const hintBody = document.getElementById('hintBody');
const stepBadge = document.getElementById('stepBadge');

const okBtn = document.getElementById('okBtn');
const restartBtn = document.getElementById('restartBtn');

const screenModal = document.getElementById('screenModal');
const screenRestart = document.getElementById('screenRestart');

/* === Простые звуки === */
const AC = new (window.AudioContext || window.webkitAudioContext)();
function ensureAudio() { if (AC.state !== 'running') AC.resume(); }
window.addEventListener('pointerdown', ensureAudio);
window.addEventListener('keydown', ensureAudio);

function beep({ freq = 880, dur = 0.06, type = 'square', vol = 0.08 }) {
  ensureAudio();
  const o = AC.createOscillator();
  const g = AC.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g);
  g.connect(AC.destination);
  o.start();
  o.stop(AC.currentTime + dur);
}
function tickSound() { beep({ freq: 1100, dur: 0.035, type: 'square', vol: 0.06 }); }
function wrongSound() { beep({ freq: 220, dur: 0.20, type: 'sawtooth', vol: 0.10 }); }

/* === Инициализация === */
document.addEventListener('DOMContentLoaded', init);

function init() {
  stage = STAGES.TASK1;
  typed = "";
  screenModal.classList.add('hidden');

  renderKeyboard("base");
  initSlots();
  updateTexts();
  updateGhostWord();
  updateScreenWord();

  okBtn.addEventListener('click', onOk);
  restartBtn.addEventListener('click', restartGame);
  screenRestart.addEventListener('click', restartGame);
  document.addEventListener('keydown', onKeydown);
}

/* === Тексты и кнопки === */
function updateTexts() {
  const t = TEXTS.base;

  document.querySelector('.hint-title').textContent = t.hintTitle;

  const taskText = t[
    stage === STAGES.TASK1 ? 'task1' :
    stage === STAGES.TASK2 ? 'task2' :
    stage === STAGES.TASK3 ? 'task3' :
    'finishHint'
  ].replace('{CAT}', t.catName);

  hintBody.innerHTML = taskText;

  stepBadge.textContent =
    stage === STAGES.TASK1 ? '1 / 3' :
    stage === STAGES.TASK2 ? '2 / 3' :
    stage === STAGES.TASK3 ? '3 / 3' : '—';

  okBtn.textContent = t.check;
  restartBtn.textContent = t.restart;
  screenModal.querySelector('.screen-modal-title').textContent = t.finishTitle;

  updateGhostWord();
  updateScreenWord();
}

/* === Эффект клика === */
function pop(){
  screenFx.classList.remove('pop');
  void screenFx.offsetWidth; // перезапуск анимации
  screenFx.classList.add('pop');
}


/* === Кнопка Проверить === */
function onOk() {
  const t = TEXTS.base;

  if (stage === STAGES.TASK1) {
    if (typed.length > 0) {
      stage = STAGES.TASK2;
      typed = "";
      updateTexts();
      updateGhostWord();
      updateScreenWord();
      launchFireworks();
    } else shakeHint();
  }
  else if (stage === STAGES.TASK2) {
    const w = typed.toUpperCase();
    const correct = (w === t.targetWord.toUpperCase());
    if (correct) {
      stage = STAGES.TASK3;
      typed = "";
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
  else if (stage === STAGES.TASK3) {
    finishIfDoneOrShowWindow();
  }
}

/* === Клавиатура === */
function onKeydown(e) {
  if (stage === STAGES.END) return;
  if (e.code === 'Space') e.preventDefault();

  if (e.key === 'Enter') {
    e.preventDefault();
    if (!e.repeat) onOk();
    return;
  }

  tickSound();
  const key = e.key.toUpperCase();
  pressVisual(key);

  if (stage === STAGES.TASK1) {
    if (key.length === 1) {
      typed = key;
      updateScreenWord();
      pop();
    }
  }
    else if (stage === STAGES.TASK2) {
      if (e.key === 'Backspace') {
        typed = typed.slice(0, -1);
        updateGhostWord();
        return;
      }

      const keyUpper = e.key.toUpperCase();
      const enLetters = /^[A-Z]$/;

      if (enLetters.test(keyUpper) && typed.length < 3) {
        typed += keyUpper;
        pop();
        updateGhostWord();
      } else if (keyUpper.length === 1 && !enLetters.test(keyUpper)) {
        // неверная клавиша → звук ошибки
        wrongSound();
      }
    }
  else if (stage === STAGES.TASK3) {
    if (e.code === 'Space' && !e.repeat) {
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
    screenText.innerHTML = letter ? `<span>${letter}</span>${cursor}` : cursor;
    screenText.style.opacity = 1;
  } else {
    screenText.innerHTML = "";
    screenText.style.opacity = 0;
  }
}

/* === Ошибка === */
function wrongWordFlash() {
  ghostWord.classList.add("wrong");
  setTimeout(() => ghostWord.classList.remove("wrong"), 800);
}

/* === Финальное окно === */
function finishIfDoneOrShowWindow() {
  const t = TEXTS.base;

  if (collected >= MAX_GOAL) {
    stage = STAGES.END;

    hintBody.innerHTML = t.end;
    stepBadge.textContent = '✔';

    okBtn.classList.add('hidden');
    restartBtn.classList.remove('hidden');

    screenModal.querySelector('.screen-modal-title').textContent = t.finishTitle;
    screenRestart.textContent = t.restart;
    screenModal.classList.remove('hidden');

    updateTexts();
    launchFireworks();
  }
}

/* === Подсказка трясётся === */
function shakeHint() {
  hintCard.classList.remove('shake');
  void hintCard.offsetWidth;
  hintCard.classList.add('shake');
}

/* === Перезапуск === */
function restartGame() {
  ensureAudio();
  stage = STAGES.TASK1;
  typed = "";
  okBtn.classList.remove('hidden');
  restartBtn.classList.add('hidden');
  screenModal.classList.add('hidden');
  screenText.textContent = "";
  ghostWord.innerHTML = "";

  initSlots();
  renderKeyboard("base");
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
  if (stage !== STAGES.TASK2) {
    ghostWord.innerHTML = "";
    return;
  }

  const target = TEXTS.base.targetWord.toUpperCase().split("");
  const entered = typed.toUpperCase().split("");

  const out = target.map((letter, i) => {
    const ch = entered[i];
    if (!ch) return `<span class="ghost">${letter}</span>`;
    const ok = ch === letter;
    const color = ok ? "#0b2a6e" : "#ff4d4d";
    return `<span style="color:${color}">${ch}</span>`;
  }).join("");

  ghostWord.innerHTML = out;
}

/* === Масштаб сцены === */
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
