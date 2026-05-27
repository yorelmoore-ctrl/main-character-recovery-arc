// ================================
// EVIDENCE I EXIST — SCRIPT.JS
// All features wired to localStorage
// ================================

const STORE_KEY = 'eie_v2';

// ── Storage helpers ──────────────────────────────────────────
function getData() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch { return {}; }
}
function setData(patch) {
  const d = getData();
  localStorage.setItem(STORE_KEY, JSON.stringify({ ...d, ...patch }));
}

// ── Toast ────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Cover ────────────────────────────────────────────────────
document.getElementById('enterBtn').addEventListener('click', () => {
  const cover = document.getElementById('cover');
  cover.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  cover.style.opacity = '0';
  cover.style.transform = 'scale(1.04)';
  setTimeout(() => {
    cover.style.display = 'none';
    document.getElementById('app').classList.add('active');
    loadAll();
    showToast('🌿 Welcome back to your sanctuary.');
    startParticles();
    startFloatingAffirmations();
  }, 800);
});

// ── Navigation ───────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    const page = document.getElementById(btn.dataset.page);
    if (page) page.classList.add('active');
    setData({ lastPage: btn.dataset.page });
  });
});

// ── Theme switcher ───────────────────────────────────────────
document.querySelectorAll('.theme-dot').forEach((dot) => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.theme-dot').forEach((d) => d.classList.remove('active'));
    dot.classList.add('active');
    document.documentElement.setAttribute('data-theme', dot.dataset.theme);
    setData({ theme: dot.dataset.theme });
    showToast('🎨 Theme changed');
  });
});

function loadTheme() {
  const { theme } = getData();
  if (!theme) return;
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-dot').forEach((d) => {
    d.classList.toggle('active', d.dataset.theme === theme);
  });
}

// ── Affirmations ─────────────────────────────────────────────
const affirmations = [
  "Rest is productive.",
  "I survived another chapter.",
  "Existing softly still counts.",
  "Tiny progress is real progress.",
  "My nervous system deserves gentleness.",
  "I am rebuilding myself slowly.",
  "Healing is not linear.",
  "You are allowed to take up space.",
  "Softness is not weakness.",
  "You existed today — that is enough.",
  "Your pace is valid.",
  "Being is enough.",
  "You are not behind in your story.",
  "Every soft day is still a day survived."
];

document.getElementById('affirmationBtn').addEventListener('click', () => {
  const el = document.getElementById('affirmationText');
  el.style.opacity = '0';
  setTimeout(() => {
    const msg = affirmations[Math.floor(Math.random() * affirmations.length)];
    el.textContent = '\u201c' + msg + '\u201d';
    el.style.opacity = '1';
    setData({ lastAffirmation: msg });
  }, 350);
});

document.getElementById('floatAffirmBtn').addEventListener('click', () => {
  const el = document.getElementById('affirmationText');
  const msg = el.textContent.replace(/[""]/g, '').trim();
  if (msg) spawnFloatingAffirmation(msg);
  showToast('🌸 Floating into the atmosphere');
});

// ── Rotating quotes ──────────────────────────────────────────
const quotes = [
  '"This journal is evidence that your story did not end in the hard chapter."',
  '"You are proof that softness survives."',
  '"Your existence leaves fingerprints on the world."',
  '"Healing is still movement."',
  '"You are not behind in your story."',
  '"Every soft day is part of the arc."',
  '"Rest is not failure — it is strategy."',
  '"You do not have to earn the right to exist."'
];
let quoteIndex = 0;
function startQuoteRotation() {
  const el = document.getElementById('rotatingQuote');
  if (!el) return;
  el.textContent = quotes[0];
  el.style.transition = 'opacity 0.5s ease';
  setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      quoteIndex = (quoteIndex + 1) % quotes.length;
      el.textContent = quotes[quoteIndex];
      el.style.opacity = '1';
    }, 500);
  }, 9000);
}

// ── Auto-save text fields ─────────────────────────────────────
function bindAutoSave() {
  document.querySelectorAll('textarea[id], input[type="text"][id], input[type="number"][id]').forEach((el) => {
    el.addEventListener('input', () => setData({ [el.id]: el.value }));
  });
}
function loadTextFields() {
  const d = getData();
  document.querySelectorAll('textarea[id], input[type="text"][id], input[type="number"][id]').forEach((el) => {
    if (d[el.id] !== undefined) el.value = d[el.id];
  });
}

// ── Save buttons ─────────────────────────────────────────────
document.querySelectorAll('.save-btn[data-save]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.save;
    const card = btn.closest('.card');
    const textarea = card ? card.querySelector('textarea') : null;
    if (textarea && textarea.value.trim()) {
      logEntry(key.charAt(0).toUpperCase() + key.slice(1), textarea.value.trim());
    }
    showToast('✨ Saved');
    playSound('chime');
    const statusEl = document.getElementById('status-' + key);
    if (statusEl) {
      statusEl.textContent = 'saved ✨';
      statusEl.classList.add('visible');
      setTimeout(() => { statusEl.textContent = ''; statusEl.classList.remove('visible'); }, 2200);
    }
    checkAchievements();
  });
});

// ── Entry log ────────────────────────────────────────────────
function logEntry(label, text) {
  const d = getData();
  const log = d.entryLog || [];
  log.unshift({
    label, text,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  });
  if (log.length > 80) log.pop();
  setData({ entryLog: log });
  renderEntryLog();
}

function renderEntryLog() {
  const el = document.getElementById('entryLog');
  if (!el) return;
  const log = getData().entryLog || [];
  if (!log.length) {
    el.innerHTML = '<p class="empty-log">Your saved memories will appear here.</p>';
    return;
  }
  el.innerHTML = log.map((e) => `
    <div class="entry-item">
      <div class="entry-meta">
        <span class="entry-label">${e.label}</span>
        <span class="entry-date">${e.date} · ${e.time}</span>
      </div>
      <p class="entry-text">${e.text}</p>
    </div>
  `).join('');
}

// ── Mood ─────────────────────────────────────────────────────
function bindMood() {
  document.querySelectorAll('.mood-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const mood = btn.dataset.mood;
      setData({ mood });
      const display = document.getElementById('moodDisplay');
      if (display) display.textContent = 'Today\'s mood: ' + mood;
      showToast('✨ Mood saved: ' + mood);
      checkAchievements();
    });
  });
}
function loadMood() {
  const { mood } = getData();
  if (!mood) return;
  document.querySelectorAll('.mood-btn').forEach((b) => b.classList.toggle('active', b.dataset.mood === mood));
  const display = document.getElementById('moodDisplay');
  if (display) display.textContent = 'Today\'s mood: ' + mood;
}

// ── Victories ────────────────────────────────────────────────
function bindVictories() {
  document.querySelectorAll('.victory-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('checked');
      const victories = [...document.querySelectorAll('.victory-card.checked')].map((b) => b.dataset.victory);
      setData({ victories });
      if (btn.classList.contains('checked')) {
        showToast('🌸 ' + btn.dataset.victory);
        playSound('chime');
      }
      checkAchievements();
    });
  });
}
function loadVictories() {
  const { victories = [] } = getData();
  document.querySelectorAll('.victory-card').forEach((btn) => {
    btn.classList.toggle('checked', victories.includes(btn.dataset.victory));
  });
}

// ── Recovery stats (ranges) ───────────────────────────────────
function bindRanges() {
  document.querySelectorAll('input[type="range"]').forEach((el) => {
    if (el.id === 'musicVolume') return;
    updateRange(el);
    el.addEventListener('input', () => { updateRange(el); setData({ [el.id]: el.value }); });
  });
}
function updateRange(el) {
  const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
  el.style.background = `linear-gradient(to right, var(--sage) ${pct}%, rgba(255,255,255,0.08) ${pct}%)`;
  const valEl = document.getElementById('val-' + el.id);
  if (valEl) valEl.textContent = el.value;
}
function loadRanges() {
  const d = getData();
  document.querySelectorAll('input[type="range"]').forEach((el) => {
    if (el.id === 'musicVolume') return;
    if (d[el.id] !== undefined) el.value = d[el.id];
    updateRange(el);
  });
}

// ── Progress ─────────────────────────────────────────────────
function bindProgress() {
  document.querySelectorAll('.step-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pct = parseInt(btn.dataset.pct);
      setData({ progress: pct });
      updateProgressUI(pct);
      showToast('🌱 Progress updated — you are doing it.');
      checkAchievements();
    });
  });
}
function updateProgressUI(pct) {
  const fill = document.getElementById('progressFill');
  const label = document.getElementById('progressPercent');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = pct + '%';
  document.querySelectorAll('.step-btn').forEach((btn) => {
    btn.classList.toggle('active', parseInt(btn.dataset.pct) <= pct);
  });
}
function loadProgress() {
  const { progress } = getData();
  if (progress !== undefined) updateProgressUI(progress);
}

// ── Rituals ──────────────────────────────────────────────────
function bindRituals() {
  document.querySelectorAll('.ritual-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('done');
      const rituals = [...document.querySelectorAll('.ritual-card.done')].map((b) => b.dataset.ritual);
      setData({ rituals });
      updateRitualCount();
      if (btn.classList.contains('done')) { showToast('🕯️ Ritual complete.'); playSound('bell'); }
      checkAchievements();
    });
  });
}
function updateRitualCount() {
  const total = document.querySelectorAll('.ritual-card').length;
  const done  = document.querySelectorAll('.ritual-card.done').length;
  const el = document.getElementById('ritualCount');
  if (el) el.textContent = done + ' of ' + total + ' completed today';
}
function loadRituals() {
  const { rituals = [] } = getData();
  document.querySelectorAll('.ritual-card').forEach((btn) => {
    btn.classList.toggle('done', rituals.includes(btn.dataset.ritual));
  });
  updateRitualCount();
}

// ── Breathing exercise ───────────────────────────────────────
let breathTimer = null, breathStep = 0;
const breathSteps = [
  { text: 'Inhale 🌿', cls: 'inhale', ms: 4000 },
  { text: 'Hold 🌙',   cls: 'hold',   ms: 4000 },
  { text: 'Exhale ✨', cls: 'exhale', ms: 6000 },
  { text: 'Rest 🌸',   cls: '',       ms: 2000 }
];
function runBreath() {
  const s = breathSteps[breathStep];
  const circle = document.getElementById('breathingCircle');
  const text   = document.getElementById('breathingText');
  if (circle) circle.className = 'breathing-circle ' + s.cls;
  if (text) text.textContent = s.text;
  breathStep = (breathStep + 1) % breathSteps.length;
  breathTimer = setTimeout(runBreath, s.ms);
}
document.getElementById('breatheStartBtn').addEventListener('click', () => {
  if (breathTimer) clearTimeout(breathTimer);
  breathStep = 0;
  runBreath();
  showToast('🌊 Breathing exercise started');
});
document.getElementById('breatheStopBtn').addEventListener('click', () => {
  if (breathTimer) { clearTimeout(breathTimer); breathTimer = null; }
  const circle = document.getElementById('breathingCircle');
  const text   = document.getElementById('breathingText');
  if (circle) circle.className = 'breathing-circle';
  if (text) text.textContent = 'Press Begin';
  showToast('🌙 Breathing paused');
});

// ── Oracle card ──────────────────────────────────────────────
const oracleDecks = [
  { symbol: '🌙', title: 'The Moon',       cat: 'shadow',        prompt: 'What are you hiding from yourself that the dark already knows?' },
  { symbol: '🌿', title: 'The Healer',     cat: 'healing',       prompt: 'What part of you is asking to be tended to right now?' },
  { symbol: '⚔️', title: 'The Warrior',   cat: 'shadow',        prompt: 'What battle have you been fighting alone that you can finally lay down?' },
  { symbol: '🔥', title: 'The Phoenix',    cat: 'shadow',        prompt: 'What version of you had to die so this one could be born?' },
  { symbol: '🌸', title: 'The Bloom',      cat: 'healing',       prompt: 'What has quietly grown in you during your hardest season?' },
  { symbol: '✨', title: 'The Star',        cat: 'encouragement', prompt: 'If your light could not go out, what would you do first?' },
  { symbol: '🌊', title: 'The Deep',       cat: 'shadow',        prompt: 'What emotion are you afraid to feel all the way to the bottom?' },
  { symbol: '☁️', title: 'The Rest',       cat: 'healing',       prompt: 'What would you do differently if rest were not earned — just given?' },
  { symbol: '🕯️', title: 'The Keeper',    cat: 'shadow',        prompt: 'What truth have you been carrying that deserves to be witnessed?' },
  { symbol: '🦋', title: 'The Becoming',   cat: 'encouragement', prompt: 'Who are you becoming when no one is watching?' },
  { symbol: '🌑', title: 'The Shadow',     cat: 'shadow',        prompt: 'What part of your story are you still ashamed of that deserves mercy?' },
  { symbol: '🌻', title: 'The Turning',    cat: 'healing',       prompt: 'What are you finally ready to let go of today?' },
  { symbol: '🌍', title: 'The Ground',     cat: 'grounding',     prompt: 'Place both feet on the floor. What do you feel beneath you right now?' },
  { symbol: '🌬️', title: 'The Breath',    cat: 'grounding',     prompt: 'Take three slow breaths. What shifts in your body when you stop and breathe?' },
  { symbol: '🧭', title: 'The Compass',    cat: 'grounding',     prompt: 'Name 5 things you can see right now. You are here. You are present. You are safe.' },
  { symbol: '🪨',  title: 'The Anchor',    cat: 'grounding',     prompt: 'What is one thing that has always held you steady, even when everything else moved?' },
  { symbol: '🌟', title: 'The Champion',   cat: 'encouragement', prompt: 'You have survived 100% of your hard days so far. What does that tell you about yourself?' },
  { symbol: '💐', title: 'The Offering',   cat: 'encouragement', prompt: 'What would you say to a friend going through exactly what you are going through?' },
  { symbol: '🌈', title: 'The After',      cat: 'encouragement', prompt: 'What is something you are quietly looking forward to that you have not let yourself fully feel yet?' },
  { symbol: '💜', title: 'The Tender',     cat: 'healing',       prompt: 'What would it feel like to be truly gentle with yourself today — not as a reward, but as a right?' }
];
let currentCard = null;

function getFilteredDeck() {
  const cat = getData().oracleCategory || 'all';
  if (cat === 'all') return oracleDecks;
  return oracleDecks.filter((c) => c.cat === cat);
}

function drawOracleCard() {
  const deck = getFilteredDeck();
  const card = deck[Math.floor(Math.random() * deck.length)];
  currentCard = card;
  document.getElementById('oracleSymbol').textContent = card.symbol;
  document.getElementById('oracleTitle').textContent  = card.title;
  document.getElementById('oraclePrompt').textContent = card.prompt;
  const oCard = document.getElementById('oracleCard');
  oCard.classList.remove('flipped');
  void oCard.offsetWidth;
  setTimeout(() => oCard.classList.add('flipped'), 80);
  setData({ lastOracleCard: card });
  checkAchievements();
}

document.getElementById('oracleCard').addEventListener('click', drawOracleCard);
document.getElementById('drawCardBtn').addEventListener('click', () => {
  drawOracleCard();
  showToast('🔮 A new message awaits you');
});

function loadOracleCard() {
  const { lastOracleCard } = getData();
  if (!lastOracleCard) return;
  currentCard = lastOracleCard;
  document.getElementById('oracleSymbol').textContent = lastOracleCard.symbol;
  document.getElementById('oracleTitle').textContent  = lastOracleCard.title;
  document.getElementById('oraclePrompt').textContent = lastOracleCard.prompt;
  document.getElementById('oracleCard').classList.add('flipped');
}

// ── Photo memories ───────────────────────────────────────────
document.getElementById('photoUpload').addEventListener('change', (e) => {
  const files = [...e.target.files];
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const d = getData();
      const photos = d.photos || [];
      photos.push({ src: ev.target.result, date: new Date().toLocaleDateString() });
      if (photos.length > 40) photos.shift();
      setData({ photos });
      renderPhotos();
      showToast('📷 Memory saved');
      checkAchievements();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
});

function renderPhotos() {
  const grid = document.getElementById('photoGrid');
  if (!grid) return;
  const photos = getData().photos || [];
  if (!photos.length) { grid.innerHTML = ''; return; }
  grid.innerHTML = photos.map((p, i) => `
    <div class="photo-thumb">
      <img src="${p.src}" alt="memory ${i + 1}" loading="lazy">
      <button class="photo-thumb-del" data-idx="${i}" title="Remove">✕</button>
    </div>
  `).join('');
  grid.querySelectorAll('.photo-thumb-del').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const d = getData();
      const photos = d.photos || [];
      photos.splice(parseInt(btn.dataset.idx), 1);
      setData({ photos });
      renderPhotos();
    });
  });
}

// ── Future-me letters ────────────────────────────────────────
document.getElementById('saveLetterBtn').addEventListener('click', () => {
  const subject = document.getElementById('letterSubject').value.trim();
  const body    = document.getElementById('letterBody').value.trim();
  const date    = document.getElementById('letterDate').value;
  if (!body) { showToast('Write something first 💌'); return; }
  const d = getData();
  const letters = d.letters || [];
  letters.unshift({ id: Date.now(), subject: subject || 'Dear Future Me', body, openAfter: date, sealed: !!date, created: new Date().toLocaleDateString() });
  setData({ letters });
  document.getElementById('letterSubject').value = '';
  document.getElementById('letterBody').value    = '';
  document.getElementById('letterDate').value    = '';
  renderLetters();
  showToast('💌 Letter sealed');
  playSound('chime');
  checkAchievements();
});

function renderLetters() {
  const el = document.getElementById('lettersList');
  if (!el) return;
  const letters = getData().letters || [];
  if (!letters.length) { el.innerHTML = ''; return; }
  const today = new Date();
  el.innerHTML = letters.map((l) => {
    const unlocked = !l.openAfter || new Date(l.openAfter) <= today;
    return `
      <div class="letter-item ${unlocked ? '' : 'sealed'}">
        <div class="letter-item-top">
          <span class="letter-subject">${l.subject}</span>
          <span class="letter-until">${l.openAfter ? (unlocked ? 'Opened ✓' : 'Opens ' + new Date(l.openAfter).toLocaleDateString()) : l.created}</span>
        </div>
        ${unlocked
          ? `<p class="letter-body">${l.body.replace(/\n/g, '<br>')}</p>`
          : `<p class="letter-locked">🔒 Sealed until ${new Date(l.openAfter).toLocaleDateString()}</p>`}
        <button class="letter-del" data-id="${l.id}">✕</button>
      </div>
    `;
  }).join('');
  el.querySelectorAll('.letter-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      const d = getData();
      d.letters = (d.letters || []).filter((l) => l.id !== parseInt(btn.dataset.id));
      setData({ letters: d.letters });
      renderLetters();
    });
  });
}

// ── Sticky notes ──────────────────────────────────────────────
document.getElementById('stickyBtn').addEventListener('click', () => {
  document.getElementById('stickyPanel').classList.toggle('open');
});
document.getElementById('closeStickyPanel').addEventListener('click', () => {
  document.getElementById('stickyPanel').classList.remove('open');
});
document.getElementById('addStickyBtn').addEventListener('click', addStickyNote);

function addStickyNote(text) {
  const d = getData();
  const notes = d.stickyNotes || [];
  const note = { id: Date.now(), text: typeof text === 'string' ? text : '', created: new Date().toLocaleDateString() };
  notes.unshift(note);
  setData({ stickyNotes: notes });
  renderStickyNotes();
  const firstTextarea = document.querySelector('.sticky-note-text');
  if (firstTextarea) firstTextarea.focus();
}

function renderStickyNotes() {
  const container = document.getElementById('stickyContainer');
  if (!container) return;
  const notes = getData().stickyNotes || [];
  if (!notes.length) {
    container.innerHTML = '<p style="font-size:0.8rem;color:var(--ink-soft);opacity:0.45;text-align:center;padding:1rem">No notes yet.<br>Add one above.</p>';
    return;
  }
  container.innerHTML = notes.map((n) => `
    <div class="sticky-note" data-id="${n.id}">
      <textarea class="sticky-note-text" placeholder="write here...">${n.text}</textarea>
      <div class="sticky-note-date">${n.created}</div>
      <button class="sticky-note-del" title="Delete">✕</button>
    </div>
  `).join('');
  container.querySelectorAll('.sticky-note-text').forEach((ta) => {
    ta.addEventListener('input', () => {
      const id = parseInt(ta.closest('.sticky-note').dataset.id);
      const d = getData();
      const notes = d.stickyNotes || [];
      const note = notes.find((n) => n.id === id);
      if (note) { note.text = ta.value; setData({ stickyNotes: notes }); }
    });
  });
  container.querySelectorAll('.sticky-note-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.closest('.sticky-note').dataset.id);
      const d = getData();
      d.stickyNotes = (d.stickyNotes || []).filter((n) => n.id !== id);
      setData({ stickyNotes: d.stickyNotes });
      renderStickyNotes();
    });
  });
}

// ── Achievements ─────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'first_save',      icon: '📖', title: 'First Words',        desc: 'Saved your first journal entry.',           check: (d) => (d.entryLog || []).length >= 1 },
  { id: 'ten_entries',     icon: '🌿', title: 'Consistent Soul',    desc: 'Saved 10 journal entries.',                 check: (d) => (d.entryLog || []).length >= 10 },
  { id: 'first_mood',      icon: '🌙', title: 'Feeling Witnessed',  desc: 'Logged your first mood check-in.',          check: (d) => !!d.mood },
  { id: 'victory_3',       icon: '🌸', title: 'Soft Warrior',       desc: 'Checked off 3 soft victories.',             check: (d) => (d.victories || []).length >= 3 },
  { id: 'all_victories',   icon: '🏆', title: 'Full Bloom',         desc: 'Completed all soft victories today.',       check: (d) => (d.victories || []).length >= 8 },
  { id: 'first_oracle',    icon: '🔮', title: 'Card Reader',        desc: 'Drew your first oracle card.',              check: (d) => !!d.lastOracleCard },
  { id: 'first_letter',    icon: '💌', title: 'Letter to Future',   desc: 'Sealed your first future-me letter.',       check: (d) => (d.letters || []).length >= 1 },
  { id: 'all_rituals',     icon: '🕯️', title: 'Sacred Keeper',     desc: 'Completed all 8 daily rituals.',            check: (d) => (d.rituals || []).length >= 8 },
  { id: 'first_photo',     icon: '📷', title: 'Memory Keeper',      desc: 'Added your first photo memory.',            check: (d) => (d.photos || []).length >= 1 },
  { id: 'progress_100',    icon: '✨', title: 'Thriving',            desc: 'Set healing progress to 100%.',            check: (d) => d.progress === 100 },
  { id: 'five_notes',      icon: '📝', title: 'Note Hoarder',        desc: 'Created 5 sticky notes.',                  check: (d) => (d.stickyNotes || []).length >= 5 },
  { id: 'theme_changer',   icon: '🎨', title: 'Sacred Aesthetic',   desc: 'Changed your sanctuary theme.',            check: (d) => !!d.theme && d.theme !== 'sage' }
];

function checkAchievements() {
  const d = getData();
  const unlocked = d.unlockedAchievements || [];
  ACHIEVEMENTS.forEach((ach) => {
    if (!unlocked.includes(ach.id) && ach.check(d)) {
      unlocked.push(ach.id);
      setData({ unlockedAchievements: unlocked });
      showAchievementPopup(ach);
      renderAchievements();
    }
  });
}

function showAchievementPopup(ach) {
  const popup = document.getElementById('achievementPopup');
  document.getElementById('achievementPopupIcon').textContent  = ach.icon;
  document.getElementById('achievementPopupTitle').textContent = ach.title;
  document.getElementById('achievementPopupDesc').textContent  = ach.desc;
  popup.classList.add('show');
  playSound('sparkle');
  setTimeout(() => popup.classList.remove('show'), 4500);
}

function renderAchievements() {
  const el = document.getElementById('achievementsList');
  if (!el) return;
  const unlocked = getData().unlockedAchievements || [];
  el.innerHTML = ACHIEVEMENTS.map((a) => {
    const done = unlocked.includes(a.id);
    return `
      <div class="achievement-item ${done ? 'unlocked' : ''}">
        <span class="ach-icon">${a.icon}</span>
        <div class="ach-info">
          <strong>${a.title}</strong>
          <p>${a.desc}</p>
          ${done ? '<span class="ach-unlocked-tag">✓ Unlocked</span>' : ''}
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('achievementsBtn').addEventListener('click', () => {
  renderAchievements();
  document.getElementById('achievementsModal').classList.add('open');
});
document.getElementById('closeAchievements').addEventListener('click', () => {
  document.getElementById('achievementsModal').classList.remove('open');
});
document.getElementById('achievementsModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('achievementsModal'))
    document.getElementById('achievementsModal').classList.remove('open');
});

// ── Music player (Web Audio API + MP3 tracks) ─────────────────
const freqs = [
  { hz: 174, label: '174 Hz · Pain Relief' },
  { hz: 285, label: '285 Hz · Tissue Healing' },
  { hz: 396, label: '396 Hz · Liberating Guilt' },
  { hz: 528, label: '528 Hz · Love Frequency' }
];
let audioCtx = null, gainNode = null, oscillator = null;
let isPlaying = false, currentFreqIdx = 0;
let trackAudio = null, activeTrack = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 0.06;
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function stopAll() {
  if (oscillator) {
    const oldOsc = oscillator;
    const oldGain = gainNode;
    oscillator = null;
    try {
      oldGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
      setTimeout(() => { try { oldOsc.stop(); oldOsc.disconnect(); } catch (_) {} }, 400);
    } catch (_) {}
  }
  if (trackAudio) {
    trackAudio.pause();
    trackAudio.currentTime = 0;
  }
  isPlaying = false;
  activeTrack = null;
  document.querySelectorAll('.music-track-btn').forEach((b) => b.classList.remove('active'));
  document.getElementById('musicToggle').textContent = '▶';
}

function startTone(hz) {
  stopAll();
  getAudioCtx();
  gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
  gainNode.gain.setValueAtTime(currentVolume(), audioCtx.currentTime);
  oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(hz, audioCtx.currentTime);
  oscillator.connect(gainNode);
  oscillator.start();
  isPlaying = true;
  document.getElementById('musicToggle').textContent = '⏸';
}

function startTrack(src, trackId) {
  stopAll();
  if (!trackAudio) trackAudio = new Audio();
  trackAudio.src = src;
  trackAudio.loop = true;
  trackAudio.volume = currentVolume() * 6.5;
  trackAudio.play().catch(() => {});
  isPlaying = true;
  activeTrack = trackId;
  document.getElementById('musicToggle').textContent = '⏸';
  document.querySelectorAll('.music-track-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.track === trackId);
  });
}

function currentVolume() {
  return parseInt(document.getElementById('musicVolume').value) / 100 * 0.15;
}

// Play / pause toggle
document.getElementById('musicToggle').addEventListener('click', () => {
  if (isPlaying) {
    if (activeTrack && trackAudio) {
      trackAudio.pause();
    } else if (oscillator) {
      try { gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3); } catch (_) {}
    }
    isPlaying = false;
    document.getElementById('musicToggle').textContent = '▶';
    showToast('🎵 Music paused');
  } else {
    if (activeTrack && trackAudio) {
      getAudioCtx();
      trackAudio.volume = currentVolume() * 6.5;
      trackAudio.play().catch(() => {});
      isPlaying = true;
      document.getElementById('musicToggle').textContent = '⏸';
      showToast('🎵 Resuming');
    } else if (oscillator) {
      getAudioCtx();
      try { gainNode.gain.cancelScheduledValues(audioCtx.currentTime); gainNode.gain.setValueAtTime(currentVolume(), audioCtx.currentTime); } catch (_) {}
      isPlaying = true;
      document.getElementById('musicToggle').textContent = '⏸';
      showToast('🎵 Resuming');
    } else {
      startTone(freqs[currentFreqIdx].hz);
      showToast('🎵 Playing ' + freqs[currentFreqIdx].label);
    }
  }
  setData({ musicPlaying: isPlaying, musicFreq: currentFreqIdx, activeTrack });
});

// Frequency buttons — tones
document.querySelectorAll('.music-freq-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.music-freq-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFreqIdx = parseInt(btn.dataset.freq);
    activeTrack = null;
    document.querySelectorAll('.music-track-btn').forEach((b) => b.classList.remove('active'));
    document.getElementById('musicFreqLabel').textContent = freqs[currentFreqIdx].label;
    startTone(freqs[currentFreqIdx].hz);
    showToast('🎵 Playing ' + freqs[currentFreqIdx].label);
    setData({ musicFreq: currentFreqIdx, activeTrack: null });
  });
});

// Track buttons — MP3 files
document.querySelectorAll('.music-track-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (activeTrack === btn.dataset.track && isPlaying) {
      stopAll();
      document.getElementById('musicFreqLabel').textContent = freqs[currentFreqIdx].label;
      showToast('🎵 Track stopped');
    } else {
      document.querySelectorAll('.music-freq-btn').forEach((b) => b.classList.remove('active'));
      document.getElementById('musicFreqLabel').textContent = btn.textContent.replace('🎵 ', '').trim();
      startTrack(btn.dataset.src, btn.dataset.track);
      showToast('🎵 Now playing: ' + btn.textContent.replace('🎵 ', '').trim());
      setData({ activeTrack: btn.dataset.track });
    }
  });
});

// Volume
document.getElementById('musicVolume').addEventListener('input', (e) => {
  const vol = parseInt(e.target.value) / 100 * 0.15;
  if (gainNode) gainNode.gain.value = vol;
  if (trackAudio) trackAudio.volume = vol * 6.5;
  const pct = ((e.target.value - e.target.min) / (e.target.max - e.target.min)) * 100;
  e.target.style.background = `linear-gradient(to right, var(--sage) ${pct}%, rgba(255,255,255,0.08) ${pct}%)`;
  setData({ musicVolume: e.target.value });
});

function loadMusic() {
  const { musicFreq, musicVolume, activeTrack: savedTrack } = getData();
  if (musicFreq !== undefined) {
    currentFreqIdx = musicFreq;
    document.querySelectorAll('.music-freq-btn').forEach((b) => {
      b.classList.toggle('active', parseInt(b.dataset.freq) === musicFreq);
    });
    document.getElementById('musicFreqLabel').textContent = freqs[musicFreq].label;
  }
  if (musicVolume !== undefined) {
    const volEl = document.getElementById('musicVolume');
    volEl.value = musicVolume;
    const pct = ((musicVolume - volEl.min) / (volEl.max - volEl.min)) * 100;
    volEl.style.background = `linear-gradient(to right, var(--sage) ${pct}%, rgba(255,255,255,0.08) ${pct}%)`;
  }
  if (savedTrack) {
    const btn = document.querySelector(`.music-track-btn[data-track="${savedTrack}"]`);
    if (btn) btn.classList.add('active');
  }
}

// ── Sound effects ─────────────────────────────────────────────
function playSound(type) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    if (type === 'chime') {
      osc.frequency.value = 880;
      osc.type = 'sine';
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(); osc.stop(ctx.currentTime + 0.8);
    } else if (type === 'bell') {
      osc.frequency.value = 528;
      osc.type = 'sine';
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.start(); osc.stop(ctx.currentTime + 1.2);
    } else if (type === 'sparkle') {
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.15);
      osc.type = 'sine';
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    }
  } catch (_) {}
}

// ── Floating affirmations ────────────────────────────────────
function spawnFloatingAffirmation(text) {
  const container = document.getElementById('floatingAffirmations');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'float-aff';
  el.textContent = '\u201c' + text + '\u201d';
  el.style.left   = Math.random() * 70 + 10 + '%';
  el.style.bottom = Math.random() * 30 + 10 + '%';
  container.appendChild(el);
  setTimeout(() => el.remove(), 9500);
}

const floatPool = affirmations.slice();
function startFloatingAffirmations() {
  setInterval(() => {
    if (Math.random() < 0.4) {
      const msg = floatPool[Math.floor(Math.random() * floatPool.length)];
      spawnFloatingAffirmation(msg);
    }
  }, 14000);
}

// ── Particle canvas ──────────────────────────────────────────
function startParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  particles = Array.from({ length: 55 }, () => ({
    x: Math.random() * (W || 1000),
    y: Math.random() * (H || 700),
    r: Math.random() * 1.4 + 0.3,
    dx: (Math.random() - 0.5) * 0.25,
    dy: -Math.random() * 0.3 - 0.08,
    o: Math.random() * 0.4 + 0.1
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(166,136,212,${p.o})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
      if (p.x < -4) p.x = W + 4;
      if (p.x > W + 4) p.x = -4;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── Export ───────────────────────────────────────────────────
document.getElementById('exportBtn').addEventListener('click', () => {
  const d = getData();
  const log = d.entryLog || [];
  if (!log.length) { showToast('Nothing to export yet.'); return; }
  let out = 'EVIDENCE I EXIST — JOURNAL EXPORT\n===================================\n\n';
  log.forEach((e) => { out += `[${e.label}] ${e.date} at ${e.time}\n${e.text}\n\n`; });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([out], { type: 'text/plain' }));
  a.download = 'evidence-i-exist.txt';
  a.click();
  showToast('📖 Journal exported');
});

// ── Reset ────────────────────────────────────────────────────
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('This will clear all your journal data. Are you sure?')) return;
  localStorage.removeItem(STORE_KEY);
  document.querySelectorAll('textarea[id], input[type="text"][id]').forEach((el) => { el.value = ''; });
  document.querySelectorAll('.mood-btn').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.victory-card').forEach((b) => b.classList.remove('checked'));
  document.querySelectorAll('.ritual-card').forEach((b) => b.classList.remove('done'));
  document.getElementById('moodDisplay').textContent = '';
  updateProgressUI(0);
  updateRitualCount();
  renderEntryLog();
  renderPhotos();
  renderLetters();
  renderStickyNotes();
  loadRanges();
  showToast('🕯️ Journal cleared. A fresh start.');
});

// ── Load all ─────────────────────────────────────────────────
function loadAll() {
  loadTheme();
  loadTextFields();
  loadMood();
  loadVictories();
  loadProgress();
  loadRituals();
  loadRanges();
  loadMusic();
  loadOracleCard();
  renderEntryLog();
  renderPhotos();
  renderLetters();
  renderStickyNotes();
  renderVault();
  renderQuests();
  renderMoodPalette();
  renderSoundtrack();
  startQuoteRotation();
  initEmotionWheel();
  initOracleCategories();
  initVoiceRecorder();
  initVaultUpload();
  initDreamscape();
  initArcStages();
  initMoodColor();
  initSoundtrack();
  initWaterTracker();
  initMovementLibrary();
  initNSToolbox();
  initLore();
  initAmbientRoom();
  initVirtualRoom();
  const d = getData();
  if (d.lastAffirmation) {
    const el = document.getElementById('affirmationText');
    if (el) el.textContent = '\u201c' + d.lastAffirmation + '\u201d';
  }
  if (d.lastPage) {
    const navBtn = document.querySelector(`.nav-item[data-page="${d.lastPage}"]`);
    if (navBtn) navBtn.click();
  }
  if (d.oracleCategory) {
    document.querySelectorAll('.oracle-cat-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.cat === d.oracleCategory);
    });
  }
}

// ── Init ─────────────────────────────────────────────────────
bindAutoSave();
bindMood();
bindVictories();
bindProgress();
bindRituals();
bindRanges();

// ═══════════════════════════════════════════════════
// NEW FEATURES
// ═══════════════════════════════════════════════════

// ── Emotional Wheel ──────────────────────────────────────────
const EMOTIONS = {
  '😔 Sad':          { color: '#6b8cba', subs: ['grieving', 'lonely', 'hopeless', 'hurt', 'numb', 'disappointed'] },
  '😰 Anxious':      { color: '#9b8ec4', subs: ['overwhelmed', 'worried', 'tense', 'panicked', 'restless', 'unsafe'] },
  '😤 Angry':        { color: '#c47878', subs: ['frustrated', 'irritated', 'resentful', 'powerless', 'betrayed', 'bitter'] },
  '💚 Okay':         { color: '#7aaa82', subs: ['stable', 'calm', 'content', 'neutral', 'safe', 'steady'] },
  '🌟 Good':         { color: '#d4c47a', subs: ['hopeful', 'grateful', 'proud', 'joyful', 'peaceful', 'inspired'] },
  '💜 Tender':       { color: '#c494c4', subs: ['vulnerable', 'soft', 'nostalgic', 'loving', 'moved', 'touched'] },
  '😶 Disconnected': { color: '#8a9090', subs: ['empty', 'foggy', 'dissociated', 'flat', 'distant', 'hollow'] },
  '🤍 Raw':          { color: '#b8988a', subs: ['exposed', 'fragile', 'shaky', 'exhausted', 'tender', 'open'] }
};

function initEmotionWheel() {
  const container = document.getElementById('emotionWheel');
  if (!container) return;
  container.innerHTML = Object.entries(EMOTIONS).map(([label, data]) =>
    `<button class="emotion-petal" data-emotion="${label}" style="--petal-color:${data.color}">${label}</button>`
  ).join('');
  container.querySelectorAll('.emotion-petal').forEach((btn) => {
    btn.addEventListener('click', () => {
      const label = btn.dataset.emotion;
      const data = EMOTIONS[label];
      const expanded = document.getElementById('emotionExpanded');
      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        expanded.classList.remove('visible');
        expanded.innerHTML = '';
        return;
      }
      container.querySelectorAll('.emotion-petal').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      expanded.classList.add('visible');
      expanded.innerHTML = `
        <p class="emotion-label-main">${label} — what flavor?</p>
        <div class="emotion-subs">${data.subs.map((s) =>
          `<button class="emotion-sub-btn" data-sub="${s}">${s}</button>`
        ).join('')}</div>
        <div id="emotionNote"></div>
      `;
      expanded.querySelectorAll('.emotion-sub-btn').forEach((sub) => {
        sub.addEventListener('click', () => {
          expanded.querySelectorAll('.emotion-sub-btn').forEach((b) => b.classList.remove('active'));
          sub.classList.add('active');
          document.getElementById('emotionNote').innerHTML = `
            <textarea id="emotionJournalText" placeholder="What does '${sub.dataset.sub}' feel like in your body right now?"></textarea>
            <button class="save-btn" id="saveEmotionBtn" style="margin-top:0.5rem">Save Feeling</button>
          `;
          document.getElementById('saveEmotionBtn').addEventListener('click', () => {
            const text = document.getElementById('emotionJournalText').value.trim();
            if (!text) return;
            logEntry('Emotion · ' + sub.dataset.sub, text);
            setData({ lastEmotion: { label, sub: sub.dataset.sub } });
            showToast('💜 Feeling witnessed');
            playSound('chime');
            checkAchievements();
          });
        });
      });
    });
  });
}

// ── Recovery Quest System ─────────────────────────────────────
const QUESTS = [
  { id: 'q-water',    icon: '💧', text: 'Drink a full glass of water',         xp: 15 },
  { id: 'q-stretch',  icon: '🤸', text: 'Stretch or move your body',            xp: 20 },
  { id: 'q-text',     icon: '💬', text: 'Text a safe person',                   xp: 25 },
  { id: 'q-teeth',    icon: '🦷', text: 'Brush your teeth',                     xp: 10 },
  { id: 'q-outside',  icon: '🌿', text: 'Step outside for a moment',            xp: 20 },
  { id: 'q-eat',      icon: '🍽️', text: 'Eat something nourishing',            xp: 20 },
  { id: 'q-journal',  icon: '📖', text: 'Write one journal entry',              xp: 30 },
  { id: 'q-breathe',  icon: '🌊', text: 'Complete a breathing exercise',        xp: 20 },
  { id: 'q-rest',     icon: '☁️', text: 'Rest without guilt for 10 minutes',   xp: 15 },
  { id: 'q-kind',     icon: '🌸', text: 'Do one kind thing for yourself',       xp: 25 }
];
const XP_PER_LEVEL = 200;

function getTodayKey() { return new Date().toISOString().slice(0, 10); }

function getQuestState() {
  const d = getData();
  const today = getTodayKey();
  if (d.questDate !== today) return { done: [], xp: d.questXP || 0 };
  return { done: d.questDone || [], xp: d.questXP || 0 };
}

function renderQuests() {
  const list = document.getElementById('questList');
  if (!list) return;
  const { done, xp } = getQuestState();
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;
  const pct = (xpInLevel / XP_PER_LEVEL) * 100;
  const fill   = document.getElementById('xpFill');
  const xpLbl  = document.getElementById('xpLabel');
  const xpLvl  = document.getElementById('xpLevel');
  if (fill)  { fill.style.width = pct + '%'; }
  if (xpLbl) xpLbl.textContent = xpInLevel + ' / ' + XP_PER_LEVEL + ' XP';
  if (xpLvl) xpLvl.textContent = 'Level ' + level;
  list.innerHTML = QUESTS.map((q) => {
    const isDone = done.includes(q.id);
    return `<div class="quest-item${isDone ? ' done' : ''}" data-quest="${q.id}" data-xp="${q.xp}">
      <span class="quest-icon">${q.icon}</span>
      <span class="quest-text">${q.text}</span>
      <span class="quest-xp">+${q.xp} XP</span>
      <span class="quest-check">${isDone ? '✓' : ''}</span>
    </div>`;
  }).join('');
  list.querySelectorAll('.quest-item:not(.done)').forEach((item) => {
    item.addEventListener('click', () => {
      const d = getData();
      const today = getTodayKey();
      const questDone = d.questDate === today ? (d.questDone || []) : [];
      if (questDone.includes(item.dataset.quest)) return;
      questDone.push(item.dataset.quest);
      const newXP = (d.questXP || 0) + parseInt(item.dataset.xp);
      setData({ questDone, questXP: newXP, questDate: today });
      showToast('⚔️ +' + item.dataset.xp + ' XP! Quest complete');
      playSound('sparkle');
      renderQuests();
      checkAchievements();
    });
  });
}

// ── Evidence Vault ────────────────────────────────────────────
let mediaRecorder = null, audioChunks = [];

function initVoiceRecorder() {
  const startBtn = document.getElementById('voiceStartBtn');
  const stopBtn  = document.getElementById('voiceStopBtn');
  const status   = document.getElementById('voiceStatus');
  if (!startBtn) return;
  startBtn.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (ev) => {
          const d = getData();
          const vault = d.vault || [];
          vault.unshift({ id: Date.now(), type: 'voice', src: ev.target.result, date: new Date().toLocaleDateString(), label: 'Voice Note' });
          if (vault.length > 30) vault.pop();
          setData({ vault });
          renderVault();
          showToast('🎙️ Voice note saved');
          playSound('chime');
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      startBtn.disabled = true;
      stopBtn.disabled  = false;
      if (status) status.textContent = '🔴 Recording...';
    } catch (_) { showToast('🎙️ Microphone access needed'); }
  });
  stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled  = true;
    if (status) status.textContent = '';
  });
}

function initVaultUpload() {
  const input = document.getElementById('vaultUpload');
  if (!input) return;
  input.addEventListener('change', (e) => {
    [...e.target.files].forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const d = getData();
        const vault = d.vault || [];
        const type = file.type.startsWith('image/') ? 'image' : 'file';
        vault.unshift({ id: Date.now(), type, src: ev.target.result, date: new Date().toLocaleDateString(), label: file.name.replace(/\.[^.]+$/, '') });
        if (vault.length > 50) vault.pop();
        setData({ vault });
        renderVault();
        showToast('📦 Added to vault');
        checkAchievements();
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  });
}

function renderVault() {
  const grid = document.getElementById('vaultGrid');
  if (!grid) return;
  const vault = getData().vault || [];
  if (!vault.length) { grid.innerHTML = '<p class="empty-log" style="padding:0.8rem 0">Your vault is empty. Add files or record a voice note above.</p>'; return; }
  grid.innerHTML = vault.map((item, i) => {
    if (item.type === 'image') return `
      <div class="vault-item vault-image">
        <img src="${item.src}" alt="${item.label}" loading="lazy">
        <span class="vault-label">${item.label}</span>
        <button class="vault-del" data-idx="${i}">✕</button>
      </div>`;
    if (item.type === 'voice') return `
      <div class="vault-item vault-voice">
        <span class="vault-type-icon">🎙️</span>
        <span class="vault-label">${item.label}</span>
        <audio controls src="${item.src}" style="width:100%;height:28px;margin-top:0.35rem"></audio>
        <span class="vault-date">${item.date}</span>
        <button class="vault-del" data-idx="${i}">✕</button>
      </div>`;
    return `
      <div class="vault-item vault-file">
        <span class="vault-type-icon">📄</span>
        <span class="vault-label">${item.label}</span>
        <span class="vault-date">${item.date}</span>
        <button class="vault-del" data-idx="${i}">✕</button>
      </div>`;
  }).join('');
  grid.querySelectorAll('.vault-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      const d = getData();
      d.vault.splice(parseInt(btn.dataset.idx), 1);
      setData({ vault: d.vault });
      renderVault();
    });
  });
}

// ── Dreamscape Mode ───────────────────────────────────────────
let dreamscapeOn = false;
let rainNodes = null;

function initDreamscape() {
  const btn = document.getElementById('dreamscapeToggle');
  if (!btn) return;
  if (getData().dreamscape) enableDreamscape(false);
  btn.addEventListener('click', () => {
    if (dreamscapeOn) disableDreamscape();
    else enableDreamscape(true);
  });
}

function enableDreamscape(save) {
  dreamscapeOn = true;
  document.documentElement.setAttribute('data-dreamscape', '1');
  document.getElementById('dreamscapeToggle').textContent = '☀️';
  spawnDreamscapeStars();
  startRainSound();
  showToast('🌙 Dreamscape mode on');
  if (save) setData({ dreamscape: true });
}

function disableDreamscape() {
  dreamscapeOn = false;
  document.documentElement.removeAttribute('data-dreamscape');
  document.getElementById('dreamscapeToggle').textContent = '🌙';
  stopRainSound();
  const el = document.getElementById('dreamscapeStars');
  if (el) el.remove();
  showToast('☀️ Dreamscape off');
  setData({ dreamscape: false });
}

function spawnDreamscapeStars() {
  let el = document.getElementById('dreamscapeStars');
  if (!el) { el = document.createElement('div'); el.id = 'dreamscapeStars'; document.body.appendChild(el); }
  el.innerHTML = Array.from({ length: 90 }, () => {
    const s = Math.random() * 2.2 + 0.4;
    return `<span class="dstar" style="left:${Math.random()*100}%;top:${Math.random()*90}%;width:${s}px;height:${s}px;animation-delay:${(Math.random()*8).toFixed(2)}s;animation-duration:${(Math.random()*4+2).toFixed(2)}s"></span>`;
  }).join('');
}

function startRainSound() {
  try {
    const ctx = getAudioCtx();
    const bufSize = 4096;
    const noise = ctx.createScriptProcessor(bufSize, 1, 1);
    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.05;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.5;
    noise.onaudioprocess = (e) => {
      const out = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) out[i] = Math.random() * 2 - 1;
    };
    noise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(ctx.destination);
    rainNodes = { noise, filter, rainGain };
  } catch (_) {}
}

function stopRainSound() {
  if (!rainNodes) return;
  try {
    rainNodes.rainGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
    setTimeout(() => {
      try { rainNodes.noise.disconnect(); rainNodes.filter.disconnect(); rainNodes.rainGain.disconnect(); } catch (_) {}
      rainNodes = null;
    }, 700);
  } catch (_) { rainNodes = null; }
}

// ── Oracle Categories ─────────────────────────────────────────
function initOracleCategories() {
  document.querySelectorAll('.oracle-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.oracle-cat-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      setData({ oracleCategory: btn.dataset.cat });
      showToast('🔮 ' + btn.textContent.trim() + ' cards selected');
    });
  });
}

// ── Extra achievement checks ──────────────────────────────────
const _origCheckAchievements = checkAchievements;
ACHIEVEMENTS.push(
  { id: 'quest_5',       icon: '⚔️', title: 'Quest Runner',     desc: 'Completed 5 quests total.',             check: (d) => (d.questXP || 0) >= 100 },
  { id: 'quest_level2',  icon: '🌟', title: 'Level Up',          desc: 'Reached Level 2 on Recovery Quests.',   check: (d) => (d.questXP || 0) >= XP_PER_LEVEL },
  { id: 'emotion_felt',  icon: '💜', title: 'Feeling Seen',      desc: 'Explored the Emotional Wheel.',         check: (d) => !!d.lastEmotion },
  { id: 'vault_item',    icon: '📦', title: 'Vault Keeper',      desc: 'Added something to your Evidence Vault.', check: (d) => (d.vault || []).length >= 1 },
  { id: 'dreamscape',    icon: '🌙', title: 'Night Wanderer',    desc: 'Activated Dreamscape mode.',            check: (d) => d.dreamscape === true }
);

// ══════════════════════════════════════════════
// CLEANUP ADDITIONS — Arc, Mood Colors, Soundtrack
// ══════════════════════════════════════════════

// ── Recovery Arc ──────────────────────────────
const ARC_MESSAGES = {
  surviving:     'You are still here. That alone is everything.',
  rebuilding:    'Brick by brick, you are building something real.',
  rediscovering: 'You are remembering who you were before the pain.',
  becoming:      'You are not who you were. You are who you chose to be.'
};

function initArcStages() {
  const stages = document.querySelectorAll('.arc-stage');
  if (!stages.length) return;
  const saved = getData().arcStage || null;
  if (saved) renderArcStage(saved);
  stages.forEach((btn) => {
    btn.addEventListener('click', () => {
      const arc = btn.dataset.arc;
      setData({ arcStage: arc });
      renderArcStage(arc);
      showToast('🌟 Arc: ' + btn.querySelector('span').textContent);
      checkAchievements();
    });
  });
}

function renderArcStage(arc) {
  const stages = document.querySelectorAll('.arc-stage');
  const lines  = document.querySelectorAll('.arc-line');
  const msg    = document.getElementById('arcMessage');
  const order  = ['surviving', 'rebuilding', 'rediscovering', 'becoming'];
  const idx    = order.indexOf(arc);
  stages.forEach((s, i) => s.classList.toggle('active', s.dataset.arc === arc));
  lines.forEach((l, i) => l.classList.toggle('lit', i < idx));
  if (msg) msg.textContent = ARC_MESSAGES[arc] || '';
}

// ── Mood Color Palette ────────────────────────
function initMoodColor() {
  const picker  = document.getElementById('moodColorPicker');
  const saveBtn = document.getElementById('saveMoodColorBtn');
  const label   = document.getElementById('moodColorLabel');
  if (!picker) return;

  // update label text as color changes
  const describe = (hex) => {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    if (r > 180 && g < 120 && b < 120) return 'fierce & burning';
    if (r > 160 && g > 100 && b < 100) return 'warm & golden';
    if (b > 160 && r < 130 && g < 130) return 'still & deep';
    if (r > 140 && b > 140 && g < 120) return 'tender & soft';
    if (g > 150 && r < 130 && b < 130) return 'calm & rooted';
    if (r > 180 && g > 150 && b > 150) return 'gentle & open';
    if (r < 80 && g < 80 && b < 80)   return 'quiet & contained';
    return 'complex & real';
  };

  picker.addEventListener('input', () => {
    if (label) label.textContent = describe(picker.value);
  });

  saveBtn.addEventListener('click', () => {
    const d = getData();
    const palette = d.moodPalette || [];
    palette.unshift({ hex: picker.value, date: new Date().toLocaleDateString() });
    if (palette.length > 20) palette.pop();
    setData({ moodPalette: palette });
    renderMoodPalette();
    showToast('🎨 Color saved to your palette');
    playSound('chime');
  });

  if (label) label.textContent = describe(picker.value);
}

function renderMoodPalette() {
  const wrap = document.getElementById('moodColorPalette');
  if (!wrap) return;
  const palette = getData().moodPalette || [];
  if (!palette.length) {
    wrap.innerHTML = '<p style="font-size:0.74rem;color:var(--ink-soft);opacity:0.5;font-style:italic">Your saved mood colors will appear here.</p>';
    return;
  }
  wrap.innerHTML = palette.map((item, i) =>
    `<div class="mood-swatch" style="background:${item.hex}" title="${item.hex} · ${item.date}">
      <button class="swatch-del" data-idx="${i}" title="Remove">✕</button>
    </div>`
  ).join('');
  wrap.querySelectorAll('.swatch-del').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const d = getData();
      d.moodPalette.splice(parseInt(btn.dataset.idx), 1);
      setData({ moodPalette: d.moodPalette });
      renderMoodPalette();
    });
  });
}

// ── Soundtrack of My Life ─────────────────────
function initSoundtrack() {
  const input  = document.getElementById('soundtrackInput');
  const addBtn = document.getElementById('addSoundtrackBtn');
  if (!input || !addBtn) return;

  const add = () => {
    const val = input.value.trim();
    if (!val) return;
    const d = getData();
    const tracks = d.soundtrack || [];
    tracks.unshift({ text: val, date: new Date().toLocaleDateString() });
    if (tracks.length > 40) tracks.pop();
    setData({ soundtrack: tracks });
    renderSoundtrack();
    input.value = '';
    showToast('🎵 Added to your soundtrack');
  };

  addBtn.addEventListener('click', add);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
}

function renderSoundtrack() {
  const list = document.getElementById('soundtrackList');
  if (!list) return;
  const tracks = getData().soundtrack || [];
  if (!tracks.length) {
    list.innerHTML = '<li style="font-size:0.76rem;color:var(--ink-soft);opacity:0.5;font-style:italic;padding:0.4rem 0">Your chapter\'s songs will appear here.</li>';
    return;
  }
  list.innerHTML = tracks.map((t, i) =>
    `<li class="soundtrack-item">
      <span class="s-icon">🎵</span>
      <span style="flex:1">${t.text}</span>
      <span style="font-size:0.65rem;color:var(--ink-soft);opacity:0.4">${t.date}</span>
      <button class="s-del" data-idx="${i}" title="Remove">✕</button>
    </li>`
  ).join('');
  list.querySelectorAll('.s-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      const d = getData();
      d.soundtrack.splice(parseInt(btn.dataset.idx), 1);
      setData({ soundtrack: d.soundtrack });
      renderSoundtrack();
    });
  });
}

// ══════════════════════════════════════════════════════
// BODY & CALM PAGE — Water Tracker · Movement · NS Toolbox
// ══════════════════════════════════════════════════════

// ── Water Tracker ─────────────────────────────────────
const WATER_GOAL = 8;
const WATER_MESSAGES = [
  'Start with one. Just one. 💧',
  'Good start — keep going! 🌊',
  'Halfway there. You\'re doing great. 💜',
  'More than halfway — your body thanks you. 🌿',
  'Almost there! One more sip. ✨',
  'You did it! Full hydration today. 🎉'
];

function initWaterTracker() {
  const container = document.getElementById('waterGlasses');
  if (!container) return;
  renderWaterTracker();
  container.addEventListener('click', (e) => {
    const glass = e.target.closest('.water-glass');
    if (!glass) return;
    const idx = parseInt(glass.dataset.idx);
    const d = getData();
    const today = getTodayKey();
    let count = (d.waterDate === today) ? (d.waterCount || 0) : 0;
    count = (idx < count) ? idx : idx + 1;
    setData({ waterCount: count, waterDate: today });
    renderWaterTracker();
    if (count === WATER_GOAL) { showToast('💧 8 glasses! Your body is grateful.'); playSound('sparkle'); checkAchievements(); }
    else if (count > 0) showToast('💧 ' + count + ' of 8 glasses');
  });
}

function renderWaterTracker() {
  const container = document.getElementById('waterGlasses');
  const msg = document.getElementById('waterMessage');
  if (!container) return;
  const d = getData();
  const today = getTodayKey();
  const count = (d.waterDate === today) ? (d.waterCount || 0) : 0;
  container.innerHTML = Array.from({ length: WATER_GOAL }, (_, i) =>
    `<div class="water-glass${i < count ? ' filled' : ''}" data-idx="${i}" title="Glass ${i + 1}">
      <div class="water-glass-fill"></div>
      <span class="water-glass-emoji">💧</span>
    </div>`
  ).join('');
  if (msg) {
    const oz = count * 8;
    const msgIdx = Math.min(Math.floor(count / (WATER_GOAL / (WATER_MESSAGES.length - 1))), WATER_MESSAGES.length - 1);
    msg.textContent = count + ' / ' + WATER_GOAL + ' glasses · ' + oz + ' oz · ' + WATER_MESSAGES[msgIdx];
  }
}

// ── Movement Library ──────────────────────────────────
function initMovementLibrary() {
  const tabs = document.querySelectorAll('.move-tab');
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.move-panel').forEach((p) => p.classList.remove('active'));
      const panel = document.querySelector(`.move-panel[data-panel="${tab.dataset.tab}"]`);
      if (panel) panel.classList.add('active');
    });
  });
  document.querySelectorAll('.move-card').forEach((card) => {
    const header = card.querySelector('.move-header');
    if (header) header.addEventListener('click', () => card.classList.toggle('open'));
  });
}

// ── NS Toolbox — panel toggle ─────────────────────────
let activeNsPanel = null;

function initNSToolbox() {
  document.querySelectorAll('.ns-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool;
      const panel = document.getElementById('nsp-' + tool);
      if (!panel) return;
      const isOpen = panel.classList.contains('active');
      document.querySelectorAll('.ns-panel').forEach((p) => p.classList.remove('active'));
      document.querySelectorAll('.ns-btn').forEach((b) => b.classList.remove('active'));
      if (!isOpen) {
        panel.classList.add('active');
        btn.classList.add('active');
        activeNsPanel = tool;
        if (tool === 'soothe') renderSoothePrompt();
        if (tool === 'emergency') renderComfortList();
        if (tool === 'grounding') renderGrounding();
        if (tool === 'sounds') renderCalmSounds();
      } else {
        activeNsPanel = null;
      }
    });
  });
  initBreathTimer();
  initComfortList();
}

// ── Grounding 5-4-3-2-1 ───────────────────────────────
const GROUNDING_STEPS = [
  { count: 5, sense: 'SEE',   prompt: 'Look around slowly. Name 5 things you can see right now.', icon: '👁️' },
  { count: 4, sense: 'TOUCH', prompt: 'Feel 4 things you can physically touch. Notice the texture, temperature, weight.', icon: '🤲' },
  { count: 3, sense: 'HEAR',  prompt: 'Listen carefully. What are 3 things you can hear in this moment?', icon: '👂' },
  { count: 2, sense: 'SMELL', prompt: 'Breathe in gently. Can you notice 2 smells? Even faint ones.', icon: '👃' },
  { count: 1, sense: 'TASTE', prompt: 'What is 1 taste in your mouth right now? Take a breath here.', icon: '💜' }
];

let groundingStep = -1;
let groundingTimer = null;

function renderGrounding() {
  const stepsEl = document.getElementById('groundingSteps');
  const btn = document.getElementById('groundingStartBtn');
  if (!stepsEl) return;
  stepsEl.innerHTML = GROUNDING_STEPS.map((s, i) =>
    `<div class="grounding-step" data-step="${i}">
      <strong>${s.icon} ${s.count} things you can ${s.sense}</strong>
      <p>${s.prompt}</p>
    </div>`
  ).join('');
  groundingStep = -1;
  if (btn) {
    btn.textContent = 'Begin Grounding';
    btn.onclick = advanceGrounding;
  }
}

function advanceGrounding() {
  const btn = document.getElementById('groundingStartBtn');
  const steps = document.querySelectorAll('.grounding-step');
  if (groundingStep >= 0 && groundingStep < steps.length) steps[groundingStep].classList.remove('active');
  groundingStep++;
  if (groundingStep < steps.length) {
    steps[groundingStep].classList.add('active');
    if (groundingStep > 0) steps[groundingStep - 1].classList.add('done');
    if (btn) btn.textContent = groundingStep < steps.length - 1 ? 'Next →' : 'Finish';
    steps[groundingStep].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    steps.forEach((s) => { s.classList.remove('active'); s.classList.add('done'); });
    if (btn) {
      btn.textContent = '✓ You are here. You are safe.';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = 'Begin Again'; btn.disabled = false; groundingStep = -1; steps.forEach((s) => s.classList.remove('done')); }, 3500);
    }
    showToast('🌍 Grounding complete. You did it.');
    playSound('chime');
  }
}

// ── Breathing Timer ───────────────────────────────────
let breathTimerInterval = null;
let breathPhase = 0;
let breathCount = 0;
let breathPattern = [4, 4, 4, 4];
const BREATH_PHASES = ['Inhale', 'Hold', 'Exhale', 'Hold'];

function initBreathTimer() {
  document.querySelectorAll('.breath-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.breath-preset-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      breathPattern = btn.dataset.counts.split(',').map(Number);
      stopBreathTimer();
    });
  });
  const startBtn = document.getElementById('breathTimerStart');
  const stopBtn  = document.getElementById('breathTimerStop');
  if (startBtn) startBtn.addEventListener('click', startBreathTimer);
  if (stopBtn)  stopBtn.addEventListener('click', stopBreathTimer);
}

function startBreathTimer() {
  stopBreathTimer();
  breathPhase = 0;
  runBreathPhase();
}

function runBreathPhase() {
  const ring  = document.getElementById('breathRing');
  const label = document.getElementById('breathRingLabel');
  const count = document.getElementById('breathRingCount');
  if (!ring) return;
  const duration = breathPattern[breathPhase];
  const phaseName = BREATH_PHASES[breathPhase];
  if (duration === 0) { breathPhase = (breathPhase + 1) % 4; runBreathPhase(); return; }
  ring.className = 'breath-ring ' + (breathPhase === 0 ? 'expanding' : breathPhase === 2 ? 'shrinking' : 'holding');
  if (label) label.textContent = phaseName;
  let sec = duration;
  if (count) count.textContent = sec;
  breathTimerInterval = setInterval(() => {
    sec--;
    if (count) count.textContent = sec > 0 ? sec : '';
    if (sec <= 0) {
      clearInterval(breathTimerInterval);
      breathPhase = (breathPhase + 1) % 4;
      runBreathPhase();
    }
  }, 1000);
}

function stopBreathTimer() {
  clearInterval(breathTimerInterval);
  breathTimerInterval = null;
  const ring  = document.getElementById('breathRing');
  const label = document.getElementById('breathRingLabel');
  const count = document.getElementById('breathRingCount');
  if (ring)  { ring.className = 'breath-ring'; }
  if (label) label.textContent = 'Ready';
  if (count) count.textContent = '';
}

// ── Calming Sounds ─────────────────────────────────────
let calmNodes = null;
let calmType  = null;

function renderCalmSounds() {
  document.querySelectorAll('.calm-sound-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.sound;
      if (calmType === type) {
        stopCalmSound();
        document.querySelectorAll('.calm-sound-btn').forEach((b) => b.classList.remove('active'));
        calmType = null;
      } else {
        stopCalmSound();
        document.querySelectorAll('.calm-sound-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        startCalmSound(type);
        calmType = type;
      }
    });
  });
}

function startCalmSound(type) {
  try {
    const ctx = getAudioCtx();
    const bufSize = 4096;
    const noiseNode = ctx.createScriptProcessor(bufSize, 1, 1);
    const gainN = ctx.createGain();
    gainN.gain.value = 0.07;
    const filter = ctx.createBiquadFilter();

    if (type === 'pink') {
      filter.type = 'lowpass'; filter.frequency.value = 800;
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      noiseNode.onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i=0;i<bufSize;i++){const w=Math.random()*2-1;b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.96900*b2+w*.1538520;b3=.86650*b3+w*.3104856;b4=.55000*b4+w*.5329522;b5=-.7616*b5-w*.0168980;out[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*0.11;b6=w*.115926;}
      };
      gainN.gain.value = 0.09;
    } else if (type === 'brown') {
      filter.type = 'lowpass'; filter.frequency.value = 300;
      let last = 0;
      noiseNode.onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i=0;i<bufSize;i++){const w=Math.random()*2-1;out[i]=(last+.02*w)/1.02;last=out[i];out[i]*=3.5;}
      };
      gainN.gain.value = 0.12;
    } else if (type === 'hum') {
      filter.type = 'bandpass'; filter.frequency.value = 180; filter.Q.value = 8;
      noiseNode.onaudioprocess = (e) => { const o=e.outputBuffer.getChannelData(0); for(let i=0;i<bufSize;i++) o[i]=Math.random()*2-1; };
    } else if (type === 'forest') {
      filter.type = 'bandpass'; filter.frequency.value = 1200; filter.Q.value = 0.4;
      noiseNode.onaudioprocess = (e) => { const o=e.outputBuffer.getChannelData(0); for(let i=0;i<bufSize;i++) o[i]=Math.random()*2-1; };
      gainN.gain.value = 0.05;
    }
    noiseNode.connect(filter); filter.connect(gainN); gainN.connect(ctx.destination);
    calmNodes = { noiseNode, filter, gainN };
    const status = document.getElementById('calmSoundStatus');
    const names = { pink: '🌧️ Rain', brown: '🌊 Ocean', hum: '🎵 Soft Hum', forest: '🌿 Forest' };
    if (status) status.textContent = names[type] + ' is playing...';
  } catch(_) { showToast('🔊 Sound needs a browser interaction first'); }
}

function stopCalmSound() {
  if (!calmNodes) return;
  try {
    calmNodes.gainN.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
    setTimeout(() => {
      try { calmNodes.noiseNode.disconnect(); calmNodes.filter.disconnect(); calmNodes.gainN.disconnect(); } catch(_) {}
      calmNodes = null;
    }, 400);
  } catch(_) { calmNodes = null; }
  const status = document.getElementById('calmSoundStatus');
  if (status) status.textContent = 'No sound playing';
}

// ── Self-Soothing Prompts ─────────────────────────────
const SOOTHE_PROMPTS = [
  'Place both hands on your heart. Feel it beating. You are alive.',
  'Wrap your arms around yourself and give a gentle squeeze. You deserve comfort.',
  'Take three slow breaths. With each one, imagine releasing something heavy.',
  'Name three things in this room that are safe. You are in a safe place right now.',
  'Speak to yourself as you would to someone you love dearly.',
  'You are allowed to feel this. You don\'t have to fix it right now.',
  'Run cold water over your wrists. Let the sensation bring you back to your body.',
  'Find something soft nearby. Hold it. Let it ground you.',
  'Your nervous system is doing its best. Thank it gently.',
  'This feeling will pass. It always has. You have proof — you\'re still here.',
  'Put your feet flat on the floor. Feel the earth holding you up.',
  'It\'s okay to rest. Rest is not giving up. Rest is how you survive.',
  'You don\'t have to be okay right now. Just be here.',
  'Your body is trying to protect you. It loves you in its clumsy way.',
  'Look for one small beautiful thing. It is permission to exist alongside the pain.',
  'You have made it through every hard day so far. Your survival rate is 100%.',
  'Breathe in for 4, out for 8. The longer exhale activates your calm response.',
  'Hum softly to yourself. Even one note. Vibration soothes the vagus nerve.',
  'Text someone you trust: "Thinking of you." Connection is medicine.',
  'You are not a burden. You are a person in pain. That is different.'
];

let sootheIdx = Math.floor(Math.random() * SOOTHE_PROMPTS.length);

function renderSoothePrompt() {
  const display = document.getElementById('sootheDisplay');
  const btn = document.getElementById('sootheNextBtn');
  if (!display) return;
  display.style.opacity = '0';
  setTimeout(() => {
    display.textContent = '\u201c' + SOOTHE_PROMPTS[sootheIdx] + '\u201d';
    display.style.opacity = '1';
  }, 300);
  if (btn) btn.onclick = () => { sootheIdx = (sootheIdx + 1) % SOOTHE_PROMPTS.length; renderSoothePrompt(); };
}

// ── Emergency Comfort List ────────────────────────────
function initComfortList() {
  const input = document.getElementById('comfortInput');
  const btn   = document.getElementById('addComfortBtn');
  if (!input || !btn) return;
  const add = () => {
    const val = input.value.trim();
    if (!val) return;
    const d = getData();
    const list = d.comfortList || [];
    list.push({ text: val, checked: false });
    setData({ comfortList: list });
    renderComfortList();
    input.value = '';
    showToast('🤍 Added to your comfort list');
  };
  btn.addEventListener('click', add);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
}

function renderComfortList() {
  const el = document.getElementById('comfortList');
  if (!el) return;
  const list = getData().comfortList || [];
  if (!list.length) {
    el.innerHTML = '<li style="font-size:0.76rem;color:var(--ink-soft);opacity:0.5;font-style:italic;padding:0.3rem 0">Add things that have helped you in hard moments.</li>';
    return;
  }
  el.innerHTML = list.map((item, i) =>
    `<li class="comfort-item${item.checked ? ' checked' : ''}" data-idx="${i}">
      <span class="comfort-check">${item.checked ? '✓' : '○'}</span>
      <span class="comfort-text">${item.text}</span>
      <button class="comfort-del" data-del="${i}" title="Remove">✕</button>
    </li>`
  ).join('');
  el.querySelectorAll('.comfort-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('comfort-del')) return;
      const d = getData();
      d.comfortList[parseInt(item.dataset.idx)].checked ^= 1;
      setData({ comfortList: d.comfortList });
      renderComfortList();
    });
  });
  el.querySelectorAll('.comfort-del').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const d = getData();
      d.comfortList.splice(parseInt(btn.dataset.del), 1);
      setData({ comfortList: d.comfortList });
      renderComfortList();
    });
  });
}

// ── Water achievement ─────────────────────────────────
ACHIEVEMENTS.push(
  { id: 'water_full',  icon: '💧', title: 'Hydration Hero',  desc: 'Drank all 8 glasses in a day.',     check: (d) => d.waterDate === getTodayKey() && (d.waterCount || 0) >= 8 },
  { id: 'comfort_5',   icon: '🤍', title: 'Safety Net Built', desc: 'Added 5+ items to comfort list.',   check: (d) => (d.comfortList || []).length >= 5 }
);

// ══════════════════════════════════════════════════════
// XP TITLES + EXPANDED QUESTS
// ══════════════════════════════════════════════════════

const XP_TITLES = [
  { xp:    0, title: 'The Beginning',      icon: '🌑' },
  { xp:   50, title: 'The Survivor',       icon: '🌙' },
  { xp:  150, title: 'Soft Rebuilder',     icon: '🌿' },
  { xp:  350, title: 'Chaos Alchemist',    icon: '⚗️' },
  { xp:  600, title: 'Moonhearted Healer', icon: '💜' },
  { xp:  900, title: 'Earth Goddess',      icon: '🌍' },
  { xp: 1300, title: 'The Becoming',       icon: '✨' },
];

function getCurrentTitle(xp) {
  let current = XP_TITLES[0];
  for (const t of XP_TITLES) { if (xp >= t.xp) current = t; }
  return current;
}

function getNextTitle(xp) {
  for (const t of XP_TITLES) { if (xp < t.xp) return t; }
  return null;
}

function awardXP(amount, label) {
  const d = getData();
  const prev = d.questXP || 0;
  const next = prev + amount;
  const prevTitle = getCurrentTitle(prev);
  const nextTitle = getCurrentTitle(next);
  setData({ questXP: next });
  showToast('✨ +' + amount + ' XP — ' + label);
  if (nextTitle.title !== prevTitle.title) {
    setTimeout(() => { showToast('🎉 Title Unlocked: ' + nextTitle.icon + ' ' + nextTitle.title); playSound('sparkle'); }, 1200);
  }
  renderQuests();
  checkAchievements();
}

// Extra quests added to pool
const EXTRA_QUESTS = [
  { id: 'q-curtains', icon: '🪟',  text: 'Open the curtains or a window',          xp: 8  },
  { id: 'q-boundary', icon: '🛡️', text: 'Honor a boundary today',                 xp: 22 },
  { id: 'q-survive',  icon: '💜',  text: 'Acknowledge you survived something hard', xp: 25 },
  { id: 'q-meds',     icon: '💊',  text: 'Take your medication or vitamins',        xp: 10 },
  { id: 'q-affirm',   icon: '🌸',  text: 'Say one kind thing to yourself out loud', xp: 12 },
  { id: 'q-ground',   icon: '🌍',  text: 'Complete the 5-4-3-2-1 grounding',        xp: 15 },
  { id: 'q-clothes',  icon: '👕',  text: 'Change clothes or wash your face',        xp: 8  },
  { id: 'q-sun',      icon: '🌞',  text: 'Sit in sunlight for a few minutes',       xp: 10 },
  { id: 'q-laugh',    icon: '😊',  text: 'Watch or read something that made you smile', xp: 12 },
  { id: 'q-warmdrink',icon: '🫖',  text: 'Make a warm drink and really savour it',  xp: 10 },
  { id: 'q-nap',      icon: '☁️',  text: 'Rest without guilt — any amount of time', xp: 15 },
  { id: 'q-water8',   icon: '💧',  text: 'Drink 8 full glasses of water today',     xp: 20 },
];
QUESTS.push(...EXTRA_QUESTS);

function seededRand(n) { const x = Math.sin(n) * 10000; return x - Math.floor(x); }

function getDailyQuests() {
  const s = getTodayKey().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const sh = [...QUESTS];
  for (let i = sh.length - 1; i > 0; i--) {
    const j = Math.floor(seededRand(s + i) * (i + 1));
    [sh[i], sh[j]] = [sh[j], sh[i]];
  }
  return sh.slice(0, 9);
}

// Override renderQuests to support titles + rotation
const _origRenderQuests = renderQuests;
renderQuests = function() {
  const list = document.getElementById('questList');
  if (!list) return;
  const d = getData();
  const today = getTodayKey();
  const totalXP = d.questXP || 0;
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXP % XP_PER_LEVEL;
  const pct = (xpInLevel / XP_PER_LEVEL) * 100;
  const fill  = document.getElementById('xpFill');
  const xpLbl = document.getElementById('xpLabel');
  const xpLvl = document.getElementById('xpLevel');
  const badge = document.getElementById('xpTitleBadge');
  const nxt   = document.getElementById('xpTitleNext');
  const note  = document.getElementById('questResetNote');
  const loreTitle = document.getElementById('loreTitleDisplay');
  if (fill)  fill.style.width = pct + '%';
  if (xpLbl) xpLbl.textContent = xpInLevel + ' / ' + XP_PER_LEVEL + ' XP (total: ' + totalXP + ')';
  if (xpLvl) xpLvl.textContent = 'Level ' + level;
  const curT = getCurrentTitle(totalXP);
  const nxtT = getNextTitle(totalXP);
  if (badge) badge.textContent = curT.icon + ' ' + curT.title;
  if (nxt)   nxt.textContent   = nxtT ? 'Next: ' + nxtT.icon + ' ' + nxtT.title + ' at ' + nxtT.xp + ' XP' : '✨ All titles unlocked!';
  if (loreTitle) loreTitle.textContent = curT.icon + ' ' + curT.title;

  const daily = getDailyQuests();
  const done  = d.questDate === today ? (d.questDone || []) : [];
  list.innerHTML = daily.map((q) => {
    const isDone = done.includes(q.id);
    return `<div class="quest-item${isDone ? ' done' : ''}" data-quest="${q.id}" data-xp="${q.xp}">
      <span class="quest-icon">${q.icon}</span>
      <span class="quest-text">${q.text}</span>
      <span class="quest-xp">+${q.xp} XP</span>
      <span class="quest-check">${isDone ? '✓' : ''}</span>
    </div>`;
  }).join('');
  if (note) note.textContent = daily.filter(q => done.includes(q.id)).length + ' / ' + daily.length + ' quests done today · refreshes at midnight';
  list.querySelectorAll('.quest-item:not(.done)').forEach((item) => {
    item.addEventListener('click', () => {
      const d2 = getData();
      const today2 = getTodayKey();
      const qd = d2.questDate === today2 ? (d2.questDone || []) : [];
      if (qd.includes(item.dataset.quest)) return;
      qd.push(item.dataset.quest);
      const newXP = (d2.questXP || 0) + parseInt(item.dataset.xp);
      setData({ questDone: qd, questXP: newXP, questDate: today2 });
      showToast('⚔️ +' + item.dataset.xp + ' XP! Quest complete');
      playSound('sparkle');
      renderQuests();
      checkAchievements();
    });
  });
};

// ══════════════════════════════════════════════════════
// CHARACTER LORE PAGE
// ══════════════════════════════════════════════════════

function initLore() {
  const nameInput = document.getElementById('loreCharName');
  if (!nameInput) return;
  const d = getData();
  if (d.loreCharName) nameInput.value = d.loreCharName;
  nameInput.addEventListener('input', () => setData({ loreCharName: nameInput.value }));

  // avatar
  const avatar = document.getElementById('loreAvatar');
  const picker = document.getElementById('loreAvatarPicker');
  if (avatar && d.loreAvatar) avatar.textContent = d.loreAvatar;
  if (picker) {
    picker.querySelectorAll('span').forEach((s) => {
      if (s.dataset.av === (d.loreAvatar || '🌙')) s.classList.add('active');
      s.addEventListener('click', () => {
        picker.querySelectorAll('span').forEach((x) => x.classList.remove('active'));
        s.classList.add('active');
        if (avatar) avatar.textContent = s.dataset.av;
        setData({ loreAvatar: s.dataset.av });
      });
    });
  }
  if (avatar) avatar.addEventListener('click', () => picker && picker.querySelectorAll('span')[0].focus());

  // archetypes
  const archGrid = document.getElementById('archetypeGrid');
  if (archGrid) {
    const selected = d.archetypes || [];
    archGrid.querySelectorAll('.archetype-chip').forEach((chip) => {
      if (selected.includes(chip.dataset.arch)) chip.classList.add('active');
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
        const now = archGrid.querySelectorAll('.archetype-chip.active');
        setData({ archetypes: Array.from(now).map((c) => c.dataset.arch) });
      });
    });
  }

  // arc line
  const arcLine = document.getElementById('loreArcLine');
  if (arcLine) {
    const da = getData();
    arcLine.textContent = 'Arc stage: ' + (da.arcStage || '—');
  }

  // tag systems
  initLoreTagSystem('strengthInput',    'addStrengthBtn',    'strengthTags',    'strengths');
  initLoreTagSystem('comfortThingInput','addComfortThingBtn','comfortThingTags','comfortThings');
  initLoreTagSystem('aestheticInput',   'addAestheticBtn',   'aestheticTags',   'aestheticTags');

  // textareas
  ['loreFears','loreDreams','charLearning'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (d[id]) el.value = d[id];
  });

  // save buttons within lore
  document.querySelectorAll('[data-save="loreFears"],[data-save="loreDreams"],[data-save="charLearning"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.save;
      const el = document.getElementById(key);
      if (!el) return;
      setData({ [key]: el.value });
      const st = document.getElementById('status-' + key);
      if (st) { st.textContent = 'saved ✓'; setTimeout(() => st.textContent='', 2000); }
    });
  });

  renderQuests();
}

function initLoreTagSystem(inputId, btnId, tagsId, storeKey) {
  const input = document.getElementById(inputId);
  const btn   = document.getElementById(btnId);
  const wrap  = document.getElementById(tagsId);
  if (!input || !btn || !wrap) return;
  renderLoreTags(wrap, storeKey);
  const add = () => {
    const val = input.value.trim();
    if (!val) return;
    const d = getData();
    const arr = d[storeKey] || [];
    arr.push(val);
    setData({ [storeKey]: arr });
    renderLoreTags(wrap, storeKey);
    input.value = '';
  };
  btn.addEventListener('click', add);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
}

function renderLoreTags(wrap, storeKey) {
  const arr = getData()[storeKey] || [];
  wrap.innerHTML = arr.map((tag, i) =>
    `<span class="lore-tag">${tag}<button class="lore-tag-del" data-i="${i}" data-key="${storeKey}">✕</button></span>`
  ).join('');
  wrap.querySelectorAll('.lore-tag-del').forEach((del) => {
    del.addEventListener('click', () => {
      const d = getData();
      d[del.dataset.key].splice(parseInt(del.dataset.i), 1);
      setData({ [del.dataset.key]: d[del.dataset.key] });
      renderLoreTags(wrap, del.dataset.key);
    });
  });
}

// ══════════════════════════════════════════════════════
// SANCTUARY PAGE — Ambient Sounds + Virtual Room
// ══════════════════════════════════════════════════════

let ambientNodes = null;
let ambientType  = null;
let pianoInterval = null;

const PENTATONIC = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

function initAmbientRoom() {
  const grid = document.getElementById('ambientGrid');
  if (!grid) return;
  grid.querySelectorAll('.ambient-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.sound;
      if (ambientType === type) {
        stopAmbientSound();
        btn.classList.remove('active');
        ambientType = null;
      } else {
        stopAmbientSound();
        grid.querySelectorAll('.ambient-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        startAmbientSound(type);
        ambientType = type;
      }
    });
  });
}

function startAmbientSound(type) {
  try {
    const ctx = getAudioCtx();
    const gainN = ctx.createGain();
    gainN.gain.value = 0;
    gainN.connect(ctx.destination);
    gainN.gain.setTargetAtTime(0.09, ctx.currentTime, 1.5);
    const bufSize = 4096;
    let extraNodes = [];

    if (type === 'amb-rain') {
      const noise = ctx.createScriptProcessor(bufSize, 1, 1);
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      noise.onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i=0;i<bufSize;i++){const w=Math.random()*2-1;b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.96900*b2+w*.1538520;b3=.86650*b3+w*.3104856;b4=.55000*b4+w*.5329522;b5=-.7616*b5-w*.0168980;out[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*0.11;b6=w*.115926;}
      };
      const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=900;
      noise.connect(f); f.connect(gainN); gainN.gain.value=0.1;
      extraNodes = [noise, f];
    } else if (type === 'amb-ocean') {
      const noise = ctx.createScriptProcessor(bufSize, 1, 1);
      let last=0;
      noise.onaudioprocess = (e) => { const o=e.outputBuffer.getChannelData(0); for(let i=0;i<bufSize;i++){const w=Math.random()*2-1;o[i]=(last+.02*w)/1.02;last=o[i];o[i]*=3.5;} };
      const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=350;
      const lfo = ctx.createOscillator(); lfo.frequency.value=0.07;
      const lfoG = ctx.createGain(); lfoG.gain.value=0.04;
      lfo.connect(lfoG); lfoG.connect(gainN.gain); lfo.start();
      noise.connect(f); f.connect(gainN); gainN.gain.value=0.11;
      extraNodes = [noise, f, lfo, lfoG];
    } else if (type === 'amb-forest') {
      const noise = ctx.createScriptProcessor(bufSize, 1, 1);
      noise.onaudioprocess = (e) => { const o=e.outputBuffer.getChannelData(0); for(let i=0;i<bufSize;i++) o[i]=Math.random()*2-1; };
      const f = ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1400; f.Q.value=0.5;
      noise.connect(f); f.connect(gainN); gainN.gain.value=0.05;
      extraNodes = [noise, f];
    } else if (type === 'amb-cafe') {
      const noise = ctx.createScriptProcessor(bufSize, 1, 1);
      let b0=0,b1=0,b2=0,b3=0;
      noise.onaudioprocess = (e) => {
        const o=e.outputBuffer.getChannelData(0);
        for(let i=0;i<bufSize;i++){const w=Math.random()*2-1;b0=.99*b0+w*.08;b1=.97*b1+w*.11;b2=.90*b2+w*.18;b3=.70*b3+w*.28;o[i]=(b0+b1+b2+b3)*0.18;}
      };
      const f = ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=600; f.Q.value=0.8;
      noise.connect(f); f.connect(gainN); gainN.gain.value=0.07;
      extraNodes = [noise, f];
    } else if (type === 'amb-tavern') {
      const noise = ctx.createScriptProcessor(bufSize, 1, 1);
      let last=0;
      noise.onaudioprocess = (e) => { const o=e.outputBuffer.getChannelData(0); for(let i=0;i<bufSize;i++){const w=Math.random()*2-1;o[i]=(last+.04*w)/1.04;last=o[i];o[i]*=2.5;} };
      const f  = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=500;
      const f2 = ctx.createBiquadFilter(); f2.type='bandpass'; f2.frequency.value=220; f2.Q.value=2;
      noise.connect(f); f.connect(f2); f2.connect(gainN); gainN.gain.value=0.1;
      extraNodes = [noise, f, f2];
    } else if (type === 'amb-piano') {
      // Soft generative piano: random pentatonic notes with attack/decay
      const playNote = () => {
        try {
          const freq = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)] * (Math.random() < 0.3 ? 2 : 1);
          const osc  = ctx.createOscillator();
          const env  = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          env.gain.value = 0;
          osc.connect(env); env.connect(gainN);
          osc.start();
          env.gain.setTargetAtTime(0.18, ctx.currentTime, 0.04);
          env.gain.setTargetAtTime(0, ctx.currentTime + 0.12, 0.35);
          osc.stop(ctx.currentTime + 2.5);
        } catch(_) {}
      };
      gainN.gain.value = 0.2;
      playNote();
      pianoInterval = setInterval(playNote, 900 + Math.random() * 1400);
      extraNodes = [];
    }

    ambientNodes = { gainN, extraNodes };
    const status = document.getElementById('ambientStatus');
    const labels = { 'amb-rain':'🌧️ Rain', 'amb-forest':'🌿 Forest', 'amb-ocean':'🌊 Ocean', 'amb-cafe':'☕ Café', 'amb-tavern':'🍂 Tavern', 'amb-piano':'🎹 Piano' };
    if (status) status.textContent = labels[type] + ' is playing — close your eyes for a moment.';
  } catch(_) { showToast('Sound requires a quick interaction first'); }
}

function stopAmbientSound() {
  clearInterval(pianoInterval); pianoInterval = null;
  if (!ambientNodes) return;
  try {
    ambientNodes.gainN.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
    setTimeout(() => {
      try {
        ambientNodes.extraNodes.forEach((n) => n.disconnect());
        ambientNodes.gainN.disconnect();
      } catch(_) {}
      ambientNodes = null;
    }, 600);
  } catch(_) { ambientNodes = null; }
  const s = document.getElementById('ambientStatus');
  if (s) s.textContent = 'Your sanctuary is quiet — choose a sound to fill the space.';
}

// ── Virtual Room ──────────────────────────────────────
const ROOM_LIGHTING = {
  day:       { overlay: 'rgba(255,220,180,0)',       bg: 'linear-gradient(to bottom,#c8d8e8 0%,#d8e5f0 44%,#b8a898 44%,#b8a898 100%)' },
  golden:    { overlay: 'rgba(255,160,60,0.22)',      bg: 'linear-gradient(to bottom,#f4a65a 0%,#e8c090 44%,#c89858 44%,#b08040 100%)' },
  candlelit: { overlay: 'rgba(80,30,10,0.48)',        bg: 'linear-gradient(to bottom,#3d2b1f 0%,#4a3520 44%,#2a1a0e 44%,#1e1208 100%)' },
  night:     { overlay: 'rgba(10,10,35,0.55)',        bg: 'linear-gradient(to bottom,#1a1a2e 0%,#16213e 44%,#0f1325 44%,#080c1a 100%)' },
  stars:     { overlay: 'rgba(5,5,25,0.6)',           bg: 'linear-gradient(to bottom,#0d0b14 0%,#1a1035 44%,#0a0820 44%,#050310 100%)' },
  moonlit:   { overlay: 'rgba(20,40,80,0.5)',         bg: 'linear-gradient(to bottom,#1e2a4a 0%,#253358 44%,#141e35 44%,#0d1525 100%)' },
};

function initVirtualRoom() {
  const lightRow = document.getElementById('roomLightingRow');
  const palette  = document.getElementById('roomPalette');
  if (!lightRow || !palette) return;

  const d = getData();
  const lighting = d.roomLighting || 'day';
  applyRoomLighting(lighting);
  lightRow.querySelectorAll('.room-light-btn').forEach((btn) => {
    if (btn.dataset.light === lighting) btn.classList.add('active');
    else btn.classList.remove('active');
    btn.addEventListener('click', () => {
      lightRow.querySelectorAll('.room-light-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      applyRoomLighting(btn.dataset.light);
      setData({ roomLighting: btn.dataset.light });
    });
  });

  const placed = d.roomItems || [];
  palette.querySelectorAll('.pi').forEach((btn) => {
    if (placed.includes(btn.dataset.item)) btn.classList.add('active');
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const d2 = getData();
      const items = d2.roomItems || [];
      const id = btn.dataset.item;
      const idx = items.indexOf(id);
      if (idx >= 0) items.splice(idx, 1); else items.push(id);
      setData({ roomItems: items });
      renderRoomItems();
    });
  });
  renderRoomItems();
}

function applyRoomLighting(key) {
  const l = ROOM_LIGHTING[key] || ROOM_LIGHTING.day;
  const scene = document.getElementById('roomScene');
  const overlay = document.getElementById('roomOverlay');
  if (scene) scene.style.background = l.bg;
  if (overlay) overlay.style.background = l.overlay;
}

function renderRoomItems() {
  const layer = document.getElementById('roomItemsLayer');
  const palette = document.getElementById('roomPalette');
  if (!layer || !palette) return;
  const placed = getData().roomItems || [];
  layer.innerHTML = '';
  palette.querySelectorAll('.pi').forEach((btn) => {
    if (!placed.includes(btn.dataset.item)) return;
    const el = document.createElement('div');
    el.className = 'room-emoji-item';
    el.textContent = btn.dataset.icon;
    el.title = btn.dataset.label;
    el.style.left = btn.dataset.x + '%';
    el.style.top  = btn.dataset.y + '%';
    layer.appendChild(el);
  });
}

// ── Wire XP into other actions ────────────────────────
// Patch advanceGrounding to award XP on completion
const _origAdvGround = advanceGrounding;
advanceGrounding = function() {
  _origAdvGround();
  const stepsEl = document.querySelectorAll('.grounding-step');
  const allDone = Array.from(stepsEl).every((s) => s.classList.contains('done'));
  if (allDone) awardXP(12, 'Grounding complete');
};

