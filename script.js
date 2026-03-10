// ══════════════════════════════════════════
//  SECTION NAVIGATION
// ══════════════════════════════════════════
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const target = document.getElementById(`section-${name}`);
  if (target) target.classList.add('active');

  const links = document.querySelectorAll('.nav-link');
  links.forEach(l => {
    const text = l.textContent.toLowerCase();
    if (
      (name === 'welcome' && text.includes('home')) ||
      (name === 'gpa'     && text.includes('gpa')) ||
      (name === 'timer'   && text.includes('timer')) ||
      (name === 'ideas'   && text.includes('idea'))
    ) l.classList.add('active');
  });
}

// ══════════════════════════════════════════
//  DARK / LIGHT MODE
// ══════════════════════════════════════════
function toggleDark(cb) {
  document.body.classList.toggle('light', !cb.checked);
}

// ══════════════════════════════════════════
//  GPA CALCULATOR
// ══════════════════════════════════════════
const gradeOptions = `
  <option value="">Grade</option>
  <option value="4.0">A+ (4.0)</option>
  <option value="4.0">A  (4.0)</option>
  <option value="3.7">A- (3.7)</option>
  <option value="3.3">B+ (3.3)</option>
  <option value="3.0">B  (3.0)</option>
  <option value="2.7">B- (2.7)</option>
  <option value="2.3">C+ (2.3)</option>
  <option value="2.0">C  (2.0)</option>
  <option value="1.7">C- (1.7)</option>
  <option value="1.3">D+ (1.3)</option>
  <option value="1.0">D  (1.0)</option>
  <option value="0.0">F  (0.0)</option>`;

function addCourse() {
  const list = document.getElementById('courseList');
  const row = document.createElement('div');
  row.className = 'course-row';
  row.innerHTML = `
    <input type="text" placeholder="e.g. AMS 147" />
    <input type="number" placeholder="Credits" min="1" max="6" />
    <select>${gradeOptions}</select>
    <button class="btn btn-danger" onclick="this.parentElement.remove()">✕</button>`;
  list.appendChild(row);
  row.querySelector('input').focus();
}

function calculateGPA() {
  const rows = document.querySelectorAll('#courseList .course-row');
  let totalPoints = 0, totalCredits = 0;

  rows.forEach(row => {
    const inputs  = row.querySelectorAll('input');
    const credits = parseFloat(inputs[1].value);
    const grade   = parseFloat(row.querySelector('select').value);
    if (!isNaN(credits) && !isNaN(grade) && credits > 0) {
      totalPoints  += credits * grade;
      totalCredits += credits;
    }
  });

  if (totalCredits === 0) {
    alert('Please enter at least one course with credits and a grade.');
    return;
  }

  const gpa = (totalPoints / totalCredits).toFixed(2);
  document.getElementById('gpaNumber').textContent = gpa;

  const tiers = [
    [3.9, "A — Dean's List! 🎉"],
    [3.5, 'A- — Excellent Work 🌟'],
    [3.0, 'B — Good Standing 👍'],
    [2.5, 'B- — Above Average'],
    [2.0, 'C — Satisfactory'],
    [0,   'D/F — Seek Academic Support'],
  ];
  const tier = tiers.find(([t]) => gpa >= t) || tiers[tiers.length - 1];
  document.getElementById('gpaGrade').textContent = tier[1];

  const result = document.getElementById('gpaResult');
  result.classList.remove('show');
  void result.offsetWidth; // force reflow for re-animation
  result.classList.add('show');
}

function resetGPA() {
  document.getElementById('courseList').innerHTML = `
    <div class="course-row first-row">
      <input type="text" placeholder="e.g. CMPS 101" />
      <input type="number" placeholder="Credits" min="1" max="6" />
      <select>${gradeOptions}</select>
    </div>`;
  document.getElementById('gpaResult').classList.remove('show');
}

// ══════════════════════════════════════════
//  POMODORO TIMER
// ══════════════════════════════════════════
const WORK_TIME    = 25 * 60;
const CIRCUMFERENCE = 2 * Math.PI * 110; // r=110

let timeLeft      = WORK_TIME;
let timerInterval = null;
let running       = false;
let sessions      = 0;

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  document.getElementById('timerDisplay').textContent =
    `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  const progress = timeLeft / WORK_TIME;
  const offset   = CIRCUMFERENCE * (1 - progress);
  const ring     = document.getElementById('timerProgress');
  ring.style.strokeDasharray  = CIRCUMFERENCE;
  ring.style.strokeDashoffset = offset;
}

function toggleTimer() {
  if (running) {
    clearInterval(timerInterval);
    running = false;
    document.getElementById('startBtn').textContent = '▶ Resume';
    document.getElementById('timerDisplay').classList.remove('pulse');
  } else {
    document.getElementById('timerNotif').classList.remove('show');
    running = true;
    document.getElementById('startBtn').textContent = '⏸ Pause';
    document.getElementById('timerDisplay').classList.add('pulse');

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        running = false;
        document.getElementById('startBtn').textContent = '▶ Start';
        document.getElementById('timerDisplay').classList.remove('pulse');
        onTimerDone();
      }
    }, 1000);
  }
}

function onTimerDone() {
  sessions = Math.min(sessions + 1, 4);
  document.querySelectorAll('.session-dot')
    .forEach((d, i) => d.classList.toggle('done', i < sessions));

  const notif = document.getElementById('timerNotif');
  notif.classList.remove('show');
  void notif.offsetWidth;
  notif.classList.add('show');

  // Three-note chime via Web Audio API
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.28;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
      osc.start(t);
      osc.stop(t + 0.85);
    });
  } catch (e) {
    console.warn('Audio unavailable:', e);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  running   = false;
  timeLeft  = WORK_TIME;
  document.getElementById('startBtn').textContent = '▶ Start';
  document.getElementById('timerDisplay').classList.remove('pulse');
  document.getElementById('timerNotif').classList.remove('show');
  updateTimerDisplay();
}

// ══════════════════════════════════════════
//  IDEAHUB
// ══════════════════════════════════════════
let ideas = JSON.parse(localStorage.getItem('st_ideas')) || [];

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  if (ideas.length === 0) {
    board.innerHTML = `<div class="board-empty">Empty board — add the first spark ✦</div>`;
    return;
  }

  ideas.forEach((idea, index) => {
    const initials = idea.author ? idea.author.charAt(0).toUpperCase() : '?';
    const card = document.createElement('div');
    card.className = 'idea-card';
    card.innerHTML = `
      <button class="remove-btn" onclick="event.stopPropagation(); deleteIdea(${index})">&times;</button>
      <div class="card-front">
        <div class="big-avatar">${initials}</div>
        <h3>${idea.author}</h3>
        <span>VIEW IDEA</span>
      </div>
      <div class="card-back">
        <p>"${idea.text}"</p>
        <span class="date-tag">${idea.date}</span>
      </div>`;
    board.appendChild(card);
  });

  localStorage.setItem('st_ideas', JSON.stringify(ideas));
}

function addIdea() {
  const ideaInput  = document.getElementById('ideaInput');
  const nameInput  = document.getElementById('userName');
  const text       = ideaInput.value.trim();
  const author     = nameInput.value.trim();

  if (!text || !author) {
    alert('Please fill in both your name and your idea.');
    return;
  }

  ideas.unshift({
    text,
    author,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  });

  ideaInput.value = '';
  nameInput.value = '';
  renderBoard();
}

function deleteIdea(index) {
  ideas.splice(index, 1);
  renderBoard();
}

// Allow submitting idea with Enter key
document.addEventListener('DOMContentLoaded', () => {
  const ideaField = document.getElementById('ideaInput');
  if (ideaField) {
    ideaField.addEventListener('keypress', e => {
      if (e.key === 'Enter') addIdea();
    });
  }
  updateTimerDisplay();
  renderBoard();
});
