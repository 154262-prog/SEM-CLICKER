let lantings = 0;
let basePerClick = 1;
let perClick = 1;
let perSecond = 0;

let gambleUnlocked = false;
let keybind = 'Enter';

let playTime = 0;
let totalEarned = 0;
let totalLost = 0;
let highestEver = 0;

let activeSkin = null;
let skinMultiplier = 1;

let playerName = 'Speler';

// DOM
const lantingsEl = document.getElementById('lantings');
const perClickEl = document.getElementById('perClick');
const perSecondEl = document.getElementById('perSecond');
const shopLantingsEl = document.getElementById('shopLantings');

const clickBtn = document.getElementById('clickBtn');
const gambleMenuBtn = document.getElementById('gambleMenuBtn');

const keybindLabel = document.getElementById('keybindLabel');
const playTimeEl = document.getElementById('playTime');
const totalEarnedEl = document.getElementById('totalEarned');
const totalLostEl = document.getElementById('totalLost');
const highestEverEl = document.getElementById('highestEver');

const activeSkinEl = document.getElementById('activeSkin');

const playerNameInput = document.getElementById('playerName');
const confirmNameBtn = document.getElementById('confirmName');

const gambleAmountInput = document.getElementById('gambleAmount');
const gambleRollBtn = document.getElementById('gambleRollBtn');
const gambleResultEl = document.getElementById('gambleResult');

const leaderboardList = document.getElementById('leaderboardList');
const resetGameBtn = document.getElementById('resetGame');
const rebindKeyBtn = document.getElementById('rebindKey');

let waitingForKey = false;

// ---------- UI UPDATE ----------

function updatePerClick() {
  perClick = Math.round(basePerClick * skinMultiplier);
}

function updateUI() {
  lantingsEl.textContent = lantings;
  shopLantingsEl.textContent = lantings;
  perClickEl.textContent = perClick;
  perSecondEl.textContent = perSecond;

  playTimeEl.textContent = playTime;
  totalEarnedEl.textContent = totalEarned;
  totalLostEl.textContent = totalLost;
  highestEverEl.textContent = highestEver;

  keybindLabel.textContent = keybind.toUpperCase();

  gambleMenuBtn.disabled = !gambleUnlocked;

  activeSkinEl.textContent = activeSkin ? activeSkin : 'Geen';

  renderLeaderboard();
}

function addLantings(amount) {
  lantings += amount;
  totalEarned += amount;
  if (lantings > highestEver) highestEver = lantings;
  updateUI();
}

function spendLantings(amount) {
  lantings -= amount;
  if (lantings < 0) lantings = 0;
  updateUI();
}

// ---------- CLICKER ----------

clickBtn.addEventListener('click', () => {
  addLantings(perClick);
});

// Passive income
setInterval(() => {
  if (perSecond > 0) {
    addLantings(perSecond);
  }
  playTime++;
  updateUI();
}, 1000);

// ---------- MENU / PANELS ----------

document.querySelectorAll('.menu button[data-panel]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-panel');
    document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
    document.getElementById(id).style.display = 'block';
  });
});

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.panel').style.display = 'none';
  });
});

// ---------- SHOP LOGICA ----------

document.querySelectorAll('#shopPanel button[data-cost]').forEach(btn => {
  btn.addEventListener('click', () => {
    const cost = parseInt(btn.getAttribute('data-cost'), 10);
    const upgrade = btn.getAttribute('data-upgrade');
    if (lantings < cost) {
      alert('Niet genoeg Lantings!');
      return;
    }

    spendLantings(cost);

    switch (upgrade) {
      case 'click':
        basePerClick += 1;
        break;
      case 'click5':
        basePerClick += 5;
        break;
      case 'ps1':
        perSecond += 1;
        break;
      case 'ps5':
        perSecond += 5;
        break;
      case 'gamble':
        gambleUnlocked = true;
        break;
    }

    updatePerClick();
    updateUI();
  });
});

// ---------- SKINS ----------

document.querySelectorAll('#skinsPanel button[data-skin]').forEach(btn => {
  btn.addEventListener('click', () => {
    const skin = btn.getAttribute('data-skin');
    const cost = parseInt(btn.getAttribute('data-cost'), 10);

    if (lantings < cost) {
      alert('Niet genoeg Lantings!');
      return;
    }

    spendLantings(cost);

    if (skin === 'blue') {
      activeSkin = 'Blauw';
      skinMultiplier = 1.5;
    } else if (skin === 'gold') {
      activeSkin = 'Goud';
      skinMultiplier = 2;
    }

    updatePerClick();
    updateUI();
  });
});

// ---------- SETTINGS ----------

rebindKeyBtn.addEventListener('click', () => {
  waitingForKey = true;
  rebindKeyBtn.textContent = 'Druk op een toets...';
});

document.addEventListener('keydown', (e) => {
  if (waitingForKey) {
    keybind = e.key;
    waitingForKey = false;
    rebindKeyBtn.textContent = 'Herbind key';
    updateUI();
  } else if (e.key === keybind) {
    addLantings(perClick);
  }
});

resetGameBtn.addEventListener('click', () => {
  if (!confirm('Weet je zeker dat je alles wilt resetten?')) return;
  lantings = 0;
  basePerClick = 1;
  perClick = 1;
  perSecond = 0;
  gambleUnlocked = false;
  keybind = 'Enter';
  playTime = 0;
  totalEarned = 0;
  totalLost = 0;
  highestEver = 0;
  activeSkin = null;
  skinMultiplier = 1;
  saveLeaderboard([]); // leaderboard leegmaken
  updateUI();
});

// ---------- SPELERNAAM ----------

confirmNameBtn.addEventListener('click', () => {
  const val = playerNameInput.value.trim();
  if (val) {
    playerName = val;
    alert(`Naam ingesteld op: ${playerName}`);
    updateUI();
  }
});

// ---------- GAMBLE ----------

gambleRollBtn.addEventListener('click', () => {
  const amount = parseInt(gambleAmountInput.value, 10);
  if (isNaN(amount) || amount <= 0) {
    gambleResultEl.textContent = 'Voer een geldige inzet in.';
    return;
  }
  if (amount > lantings) {
    gambleResultEl.textContent = 'Je hebt niet genoeg Lantings.';
    return;
  }

  // inzet afhalen
  spendLantings(amount);
  totalLost += amount;

  const roll = Math.floor(Math.random() * 10) + 1; // 1-10
  let msg = `Je rolde ${roll}. `;

  if (roll >= 8) {
    const win = amount * 2;
    addLantings(win);
    msg += `Je wint ${win} Lantings!`;
  } else if (roll >= 5) {
    const win = Math.round(amount * 1.2);
    addLantings(win);
    msg += `Je wint ${win} Lantings.`;
  } else {
    msg += 'Je verliest je inzet.';
  }

  gambleResultEl.textContent = msg;
  updateUI();
});

// ---------- LEADERBOARD (LOKAAL) ----------

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem('lantingLeaderboard');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLeaderboard(list) {
  localStorage.setItem('lantingLeaderboard', JSON.stringify(list));
}

function updateLeaderboardEntry() {
  const list = loadLeaderboard();
  const existing = list.find(e => e.name === playerName);
  if (existing) {
    if (highestEver > existing.score) {
      existing.score = highestEver;
    }
  } else {
    list.push({ name: playerName, score: highestEver });
  }
  list.sort((a, b) => b.score - a.score);
  saveLeaderboard(list.slice(0, 10));
}

function renderLeaderboard() {
  updateLeaderboardEntry();
  const list = loadLeaderboard();
  leaderboardList.innerHTML = '';
  list.forEach((entry, idx) => {
    const li = document.createElement('li');
    li.textContent = `#${idx + 1} ${entry.name} — ${entry.score}`;
    leaderboardList.appendChild(li);
  });
}

// ---------- INIT ----------

updatePerClick();
updateUI();
