const MAX_GOAL = 5; // нужно собрать 5 котов
let activeCat = null; // единственный «нижний» кот
let collected = 0; // сколько уже в слоте

// === Очистка слотов и котов ===
function initSlots() {
  document.querySelectorAll('#slotBar .slot').forEach((s) => {
    s.classList.remove('filled');
    s.innerHTML = '';
  });

  document
    .querySelectorAll('.cat-sprite:not(#catTemplate)')
    .forEach((n) => n.remove());

  activeCat = null;
  collected = 0;
}

// === Создание активного кота ===
function spawnActiveCat() {
  if (collected >= MAX_GOAL || activeCat) return;

  const tpl = document.getElementById('catTemplate');
  const el = tpl.cloneNode(true);
  el.id = '';
  el.classList.remove('hidden');
  el.style.left = '14px';
  el.style.bottom = '12px';
  el.style.transform = 'none';

  document.getElementById('screen').appendChild(el);
  activeCat = { el, x: 14 }; // x = координата left
}

// === Движение кота вправо ===
function moveActiveCat() {
  if (!activeCat) spawnActiveCat();
  if (!activeCat) return;

  const step = 60;
  const screen = document.getElementById('screen');
  const limit = screen.clientWidth - 140; // граница справа

  activeCat.x += step;
  activeCat.el.style.left = `${activeCat.x}px`;

  // если дошёл до края — собираем
  if (activeCat.x >= limit) {
    collectActiveCat();
  }
}

// === Помещение кота в слот ===
function collectActiveCat() {
  if (!activeCat) return;
  const slots = document.querySelectorAll('#slotBar .slot');
  if (collected >= MAX_GOAL) return;

  const slot = slots[collected];
  slot.classList.add('filled');

  // вставляем кота в слот с авто-масштабом
  const img = activeCat.el;
  img.classList.add('cat-collected');
  img.style.position = 'static';
  img.style.left = '0';
  img.style.bottom = '0';
  img.style.height = 'auto';
  img.style.width = '90%';
  img.style.transform = 'none';

  slot.appendChild(img);

  collected += 1;
  activeCat = null;

  // если ещё не собрали все — спавним нового
  if (collected < MAX_GOAL) {
    spawnActiveCat();
  } else {
    // 🎆 ВСЕ КОТЫ СОБРАНЫ — салют!
    launchFireworks();
  }
}

// === Сброс котов при рестарте ===
function resetCats() {
  initSlots();
}

/* === Салют === */
function launchFireworks() {
  const screen = document.getElementById('screen');

  for (let i = 0; i < 30; i++) {
    const f = document.createElement('div');
    f.className = 'firework';
    const angle = Math.random() * 2 * Math.PI;
    const radius = 80 + Math.random() * 120;
    f.style.setProperty('--x', `${Math.cos(angle) * radius}px`);
    f.style.setProperty('--y', `${Math.sin(angle) * radius}px`);
    f.style.background = `hsl(${Math.random() * 360}, 100%, 70%)`;
    f.style.left = '50%';
    f.style.top = '50%';
    screen.appendChild(f);
    setTimeout(() => f.remove(), 900);
  }
}
