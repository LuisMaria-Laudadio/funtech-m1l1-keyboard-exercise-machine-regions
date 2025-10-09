const MAX_GOAL = 2;
let activeCat = null;
let collected = 0;

function initSlots() {
  document.querySelectorAll('#slotBar .slot').forEach(s => s.remove());
  document.querySelectorAll('.cat-sprite:not(#catTemplate)').forEach(n => n.remove());
  activeCat = null;
  collected = 0;
}

function createSlots() {
  const slotBar = document.getElementById('slotBar');
  slotBar.innerHTML = "";
  for (let i = 0; i < MAX_GOAL; i++) {
    const s = document.createElement('div');
    s.className = 'slot';
    slotBar.appendChild(s);
  }
}

function spawnActiveCat() {
  if (collected >= MAX_GOAL || activeCat) return;

  const tpl = document.getElementById('catTemplate');
  const el = tpl.cloneNode(true);
  el.id = "";
  el.classList.remove('hidden');
  el.style.left = '14px';
  el.style.bottom = '12px';
  el.style.transition = 'left 0.35s ease, bottom 0.35s ease, transform 0.25s ease';
  el.style.height = '90px';
  el.style.width = 'auto';
  el.style.objectFit = 'contain';
  document.getElementById('screen').appendChild(el);

  const screen = document.getElementById('screen');
  const limit = screen.clientWidth - 160;
  const totalSteps = 5;
  const stepSize = (limit - 14) / (totalSteps - 1);

  activeCat = {
    el,
    stepSize,
    stepCount: 0,
    totalSteps,
    x: 14
  };
}

function moveActiveCat() {
  if (!activeCat) spawnActiveCat();
  if (!activeCat) return;

  activeCat.stepCount++;

  if (activeCat.stepCount < activeCat.totalSteps) {
    activeCat.x += activeCat.stepSize;
    activeCat.el.style.left = `${activeCat.x}px`;
    activeCat.el.style.transform = 'translateY(-14px) rotate(2deg)';
    setTimeout(() => activeCat.el.style.transform = 'translateY(0) rotate(0deg)', 200);
  } else if (activeCat.stepCount === activeCat.totalSteps) {
    jumpToSlot();
  }
}

function jumpToSlot() {
  const slots = document.querySelectorAll('#slotBar .slot');
  if (collected >= MAX_GOAL) return;

  const slot = slots[collected];
  const rectSlot = slot.getBoundingClientRect();
  const rectScreen = document.getElementById('screen').getBoundingClientRect();

  const targetX = rectSlot.left - rectScreen.left + rectSlot.width / 2 - 40;
  const targetY = rectScreen.height - (rectSlot.top - rectScreen.top) - 100;

  const cat = activeCat.el;
  cat.style.transition = 'left 0.6s ease, bottom 0.6s ease, transform 0.6s ease';
  cat.style.left = `${targetX}px`;
  cat.style.bottom = `${targetY}px`;
  cat.style.transform = 'translateY(-20px) scale(1.1) rotate(-3deg)';

  setTimeout(() => {
    slot.classList.add('filled');
    cat.style.transition = 'transform 0.3s ease';
    cat.style.transform = 'scale(1) rotate(0deg)';
    cat.style.position = 'static';
    cat.style.height = '100%';
    cat.style.width = 'auto';
    cat.style.objectFit = 'contain';
    cat.style.display = 'block';
    slot.appendChild(cat);

    collected++;
    activeCat = null;

    if (collected < MAX_GOAL) {
      setTimeout(spawnActiveCat, 400);
    } else {
      finishIfDoneOrShowWindow();
    }
  }, 600);
}

function resetCats() {
  initSlots();
}
