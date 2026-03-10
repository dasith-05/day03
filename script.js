// SECTION NAVIGATION
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

// DARK / LIGHT MODE
function toggleDark(cb) {
  document.body.classList.toggle('light', !cb.checked);
  document.getElementById('modeLabel').textContent = cb.checked ? '🌙 Dark' : '☀️ Light';
}

// GPA CALCULATOR
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
    <input type="text" placeholder="e.g. SCS 1201" />
    <input type="number" placeholder="Credits" min="1" max="6" />
    <select>${gradeOptions}</select>
    <button class="btn btn-danger" onclick="this.parentElement.remove()">✕</button>`;
  list.appendChild(row);
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
    [3.7, "First Class Honors! 🏆"],
    [3.3, 'Second Upper 🌟'],
    [3.0, 'Second Lower 👍'],
    [2.0, 'General Degree'],
    [0,   'Seek Academic Support'],
  ];
  const tier = tiers.find(([t]) => gpa >= t) || tiers[tiers.length - 1];
  document.getElementById('gpaGrade').textContent = tier[1];

  const result = document.getElementById('gpaResult');
  result.classList.add('show');
}

function resetGPA() {
  location.reload(); // Simplest reset for the GPA UI
}

// POMODORO TIMER
const WORK_TIME = 25 * 60;
const CIRCUMFERENCE = 2 * Math.PI * 110;

let timeLeft = WORK_TIME;
let timerInterval = null;
let running = false;

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  document.getElementById('timerDisplay').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const offset = CIRCUMFERENCE * (1 - timeLeft / WORK_TIME);
  const ring = document.getElementById('timerProgress');
  ring.style.strokeDasharray = CIRCUMFERENCE;
  ring.style.strokeDashoffset = offset;
}

function toggleTimer() {
  if (running) {
    clearInterval(timerInterval);
    running = false;
    document.getElementById('startBtn').textContent = '▶ Resume';
  } else {
    running = true;
    document.getElementById('startBtn').textContent = '⏸ Pause';
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        alert('Time for a break!');
        resetTimer();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  running = false;
  timeLeft = WORK_TIME;
  document.getElementById('startBtn').textContent = '▶ Start';
  updateTimerDisplay();
}

// IDEAHUB
let ideas = JSON.parse(localStorage.getItem('st_ideas')) || [];

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  ideas.forEach((idea, index) => {
    const card = document.createElement('div');
    card.className = 'idea-card';
    card.innerHTML = `
      <div class="big-avatar">${idea.author.charAt(0).toUpperCase()}</div>
      <h3>${idea.author}</h3>
      <p>"${idea.text}"</p>
    `;
    board.appendChild(card);
  });
  localStorage.setItem('st_ideas', JSON.stringify(ideas));
}

function addIdea() {
  const txt = document.getElementById('ideaInput').value;
  const name = document.getElementById('userName').value;
  if (txt && name) {
    ideas.unshift({ text: txt, author: name });
    document.getElementById('ideaInput').value = '';
    renderBoard();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateTimerDisplay();
  renderBoard();
});