// ── SECTION NAVIGATION ──
const sections = { gpa: 'gpa-card', timer: 'timer-card' };

function showSection(name) {
  document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const card = document.getElementById(sections[name]);
  if (card) card.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => {
    if (l.textContent.toLowerCase().includes(name === 'gpa' ? 'gpa' : 'timer')) l.classList.add('active');
  });
  document.getElementById('welcomeCard').style.display = 'none';
}

// ── DARK MODE ──
function toggleDark(cb) {
  document.body.classList.toggle('dark', cb.checked);
}

// ── GPA CALCULATOR ──
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
    const credits = parseFloat(row.querySelectorAll('input')[1].value);
    const grade = parseFloat(row.querySelector('select').value);
    if (!isNaN(credits) && !isNaN(grade) && credits > 0) {
      totalPoints += credits * grade;
      totalCredits += credits;
    }
  });
  if (totalCredits === 0) {
    alert('Please enter at least one course with credits and a grade.');
    return;
  }
  const gpa = (totalPoints / totalCredits).toFixed(2);
  const result = document.getElementById('gpaResult');
  document.getElementById('gpaNumber').textContent = gpa;
  const grades = [
    [3.9, "A — Dean's List! 🎉"],
    [3.5, 'A- — Excellent Work 🌟'],
    [3.0, 'B — Good Standing 👍'],
    [2.5, 'B- — Above Average'],
    [2.0, 'C — Satisfactory'],
    [0,   'D/F — Seek Academic Support']
  ];
  const g = grades.find(([t]) => gpa >= t) || grades[grades.length - 1];
  document.getElementById('gpaGrade').textContent = g[1];
  result.classList.remove('show');
  void result.offsetWidth; // force reflow to re-trigger animation
  result.classList.add('show');
}

function resetGPA() {
  const list = document.getElementById('courseList');
  list.innerHTML = `
    <div class="course-row">
      <input type="text" placeholder="e.g. CMPS 101" />
      <input type="number" placeholder="Credits" min="1" max="6" />
      <select>${gradeOptions}</select>
    </div>`;
  document.getElementById('gpaResult').classList.remove('show');
}

// ── POMODORO TIMER ──
const WORK_TIME = 25 * 60;
let timeLeft = WORK_TIME;
let timerInterval = null;
let running = false;
let sessions = 0;
const CIRCUMFERENCE = 2 * Math.PI * 110;

function updateDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  document.getElementById('timerDisplay').textContent =
    `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const progress = timeLeft / WORK_TIME;
  const offset = CIRCUMFERENCE * (1 - progress);
  document.getElementById('timerProgress').style.strokeDashoffset = offset;
  document.getElementById('timerProgress').style.strokeDasharray = CIRCUMFERENCE;
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
      updateDisplay();
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
  const dots = document.querySelectorAll('.session-dot');
  dots.forEach((d, i) => d.classList.toggle('done', i < sessions));
  const notif = document.getElementById('timerNotif');
  notif.classList.remove('show');
  void notif.offsetWidth; // force reflow
  notif.classList.add('show');

  // Bell sound via Web Audio API
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.25);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.25 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.8);
      osc.start(ctx.currentTime + i * 0.25);
      osc.stop(ctx.currentTime + i * 0.25 + 0.8);
    });
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  running = false;
  timeLeft = WORK_TIME;
  document.getElementById('startBtn').textContent = '▶ Start';
  document.getElementById('timerDisplay').classList.remove('pulse');
  document.getElementById('timerNotif').classList.remove('show');
  updateDisplay();
}

// Initialize timer display on page load
updateDisplay();
