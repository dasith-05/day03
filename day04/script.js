// Section Switching
function showSection(sectionId) {
    const sections = document.querySelectorAll('.tab-content');
    sections.forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('fade-in');
    });
    
    const activeSection = document.getElementById(sectionId);
    activeSection.style.display = 'block';
    // Re-trigger animation
    void activeSection.offsetWidth; 
    activeSection.classList.add('fade-in');
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    }
});

// GPA Calculator Logic
function addCourseRow() {
    const courseList = document.getElementById('course-list');
    const newRow = document.createElement('div');
    newRow.className = 'course-row';
    newRow.innerHTML = `
        <input type="number" placeholder="Credits (e.g. 3)" class="credits">
        <input type="text" placeholder="Grade (e.g. A, B+)" class="grade">
        <button class="btn-remove" onclick="removeCourseRow(this)">&times;</button>
    `;
    courseList.appendChild(newRow);
}

function removeCourseRow(button) {
    const courseList = document.getElementById('course-list');
    if (courseList.children.length > 1) {
        button.parentElement.remove();
        calculateGPA(); // Recalculate GPA automatically after removal
    } else {
        alert("At least one course is required.");
    }
}

const gradePoints = {
    'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
};

function calculateGPA() {
    const creditsInputs = document.querySelectorAll('.credits');
    const gradeInputs = document.querySelectorAll('.grade');
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    for (let i = 0; i < creditsInputs.length; i++) {
        const credits = parseFloat(creditsInputs[i].value);
        const grade = gradeInputs[i].value.toUpperCase().trim();
        
        if (!isNaN(credits) && gradePoints[grade] !== undefined) {
            totalPoints += credits * gradePoints[grade];
            totalCredits += credits;
        }
    }
    
    const gpaValue = document.getElementById('gpa-value');
    if (totalCredits > 0) {
        const gpa = totalPoints / totalCredits;
        gpaValue.innerText = gpa.toFixed(2);
    } else {
        gpaValue.innerText = "0.00";
        alert("Please enter valid credits and grades (e.g., A, B+, C).");
    }
}

// Pomodoro Timer Logic
let timerInterval;
let defaultTime = 25 * 60;
let timeLeft = defaultTime;
let isRunning = false;

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer-display').innerText = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function setCustomTime() {
    const mins = parseInt(document.getElementById('custom-minutes').value);
    if (!isNaN(mins) && mins > 0 && mins <= 120) {
        if (isRunning) stopTimer();
        defaultTime = mins * 60;
        timeLeft = defaultTime;
        updateTimerDisplay();
    } else {
        alert("Please enter a valid number of minutes (1-120).");
    }
}

function toggleTimer() {
    const btn = document.getElementById('toggle-btn');
    if (!isRunning) {
        startTimer();
        btn.innerText = "Stop";
        btn.classList.replace('btn-primary', 'btn-warning');
    } else {
        stopTimer();
        btn.innerText = "Start";
        btn.classList.replace('btn-warning', 'btn-primary');
    }
}

function startTimer() {
    isRunning = true;
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            isRunning = false;
            const btn = document.getElementById('toggle-btn');
            btn.innerText = "Start";
            btn.classList.replace('btn-warning', 'btn-primary');
            
            const bell = document.getElementById('bell-sound');
            bell.play();
            alert("Time's up! Take a break.");
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
}

function resetTimer() {
    if (isRunning) stopTimer();
    timeLeft = defaultTime;
    updateTimerDisplay();
    const btn = document.getElementById('toggle-btn');
    btn.innerText = "Start";
    btn.classList.replace('btn-warning', 'btn-primary');
}

// Idea Board Logic (Ported from Day 03)
const ideaInput = document.getElementById('ideaInput');
const userNameInput = document.getElementById('userName');
const board = document.getElementById('board');

let ideas = JSON.parse(localStorage.getItem('hover_ideas')) || [];

function renderIdeas() {
    board.innerHTML = '';
    
    if (ideas.length === 0) {
        board.innerHTML = `<p style="grid-column: 1/-1; text-align:center; opacity:0.6;">No ideas yet. Be the first!</p>`;
    }

    ideas.forEach((idea, index) => {
        const card = document.createElement('div');
        card.className = 'idea-card';
        card.innerHTML = `
            <span style="position:absolute; top:5px; right:10px; cursor:pointer;" onclick="deleteIdea(${index})">&times;</span>
            <strong style="color:var(--ucsc-maroon);">${idea.author}</strong>
            <p>${idea.text}</p>
            <small style="opacity:0.6;">${idea.date}</small>
        `;
        board.appendChild(card);
    });

    localStorage.setItem('hover_ideas', JSON.stringify(ideas));
}

function addIdea() {
    const text = ideaInput.value.trim();
    const author = userNameInput.value.trim();

    if (!text || !author) {
        alert("Please fill in both name and idea.");
        return;
    }

    const newIdea = {
        text: text,
        author: author,
        date: new Date().toLocaleDateString()
    };

    ideas.unshift(newIdea);
    ideaInput.value = '';
    userNameInput.value = '';
    renderIdeas();
}

function deleteIdea(index) {
    ideas.splice(index, 1);
    renderIdeas();
}

// Initial Calls
updateTimerDisplay();
renderIdeas();