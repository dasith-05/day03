const ideaInput = document.getElementById('ideaInput');
const userNameInput = document.getElementById('userName');
const board = document.getElementById('board');

// Retrieve stored ideas or initialize empty array
let ideas = JSON.parse(localStorage.getItem('hover_ideas')) || [];

function render() {
    board.innerHTML = '';
    
    if (ideas.length === 0) {
        board.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; color:#475569; padding:50px; border:2px dashed var(--border-glass); border-radius:30px;">
                Empty board. Start the conversation.
            </div>`;
    }

    ideas.forEach((idea, index) => {
        const initials = idea.author ? idea.author.charAt(0).toUpperCase() : '?';
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <span class="remove-btn" onclick="event.stopPropagation(); deleteIdea(${index})">&times;</span>
            
            <div class="card-front">
                <div class="big-avatar">${initials}</div>
                <h3>${idea.author}</h3>
                <span style="font-size: 0.8rem; color: var(--primary); font-weight: 600;">VIEW IDEA</span>
            </div>

            <div class="card-back">
                <p>"${idea.text}"</p>
                <span class="date-tag">${idea.date}</span>
            </div>
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
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    // Add new idea to the beginning of the list
    ideas.unshift(newIdea);
    
    // Clear inputs
    ideaInput.value = '';
    userNameInput.value = '';
    
    render();
}

function deleteIdea(index) {
    ideas.splice(index, 1);
    render();
}

// Add idea when pressing 'Enter' in the idea input field
ideaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addIdea();
});

// Initial render call
render();