// Default players list
let players = [
    "Kywal Gyi",
    "Bo Chan",
    "Soe Moe",
    "Hein Htet",
    "Naing Win",
    "Taryar"
];

// DOM Elements
const playersListEl = document.getElementById('players-list');
const playerCountEl = document.getElementById('player-count');
const addPlayerForm = document.getElementById('add-player-form');
const newPlayerInput = document.getElementById('new-player-input');
const generateBtn = document.getElementById('generate-btn');
const matchesSection = document.getElementById('matches-section');
const matchesContainer = document.getElementById('matches-container');
const waitingSection = document.getElementById('waiting-section');
const waitingPlayersEl = document.getElementById('waiting-players');

// Initialize app
function init() {
    renderPlayers();
    
    // Event Listeners
    addPlayerForm.addEventListener('submit', handleAddPlayer);
    generateBtn.addEventListener('click', generateMatches);
}

// Render the players list tags
function renderPlayers() {
    playersListEl.innerHTML = '';
    playerCountEl.textContent = players.length;
    
    players.forEach((player, index) => {
        const li = document.createElement('li');
        li.className = 'player-tag';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = player;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.setAttribute('aria-label', `Remove ${player}`);
        removeBtn.onclick = () => removePlayer(index);
        
        li.appendChild(nameSpan);
        li.appendChild(removeBtn);
        playersListEl.appendChild(li);
    });
}

function handleAddPlayer(e) {
    e.preventDefault();
    const name = newPlayerInput.value.trim();
    
    if (name && !players.includes(name)) {
        players.push(name);
        newPlayerInput.value = '';
        renderPlayers();
        
        // Hide matches section if it was shown (since players changed)
        matchesSection.classList.add('hidden');
    } else if (players.includes(name)) {
        alert('Player already exists in the list!');
    }
}

function removePlayer(index) {
    players.splice(index, 1);
    renderPlayers();
    matchesSection.classList.add('hidden');
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Check if a team combination is allowed based on custom rules
function isValidTeam(p1, p2) {
    const teamHas = (name1, name2) => 
        (p1 === name1 && p2 === name2) || (p1 === name2 && p2 === name1);
        
    // Rule: Kywal Gyi and Hein Htet must not be teammates
    if (teamHas("Kywal Gyi", "Hein Htet")) return false;
    
    // Rule: Hein Htet and Soe Moe must not be teammates
    if (teamHas("Hein Htet", "Soe Moe")) return false;
    
    return true;
}

function generateMatches() {
    if (players.length < 4) {
        alert("You need at least 4 players to make a duel match!");
        return;
    }

    let shuffled;
    let validLayoutFound = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 1000;
    
    const totalMatches = Math.floor(players.length / 4);
    let matches = [];
    let waiting = [];

    // Keep shuffling until we find a combination that satisfies all rules
    while (!validLayoutFound && attempts < MAX_ATTEMPTS) {
        shuffled = shuffleArray(players);
        matches = [];
        let isValid = true;
        
        for (let i = 0; i < totalMatches; i++) {
            const baseIndex = i * 4;
            const tA_p1 = shuffled[baseIndex];
            const tA_p2 = shuffled[baseIndex + 1];
            const tB_p1 = shuffled[baseIndex + 2];
            const tB_p2 = shuffled[baseIndex + 3];
            
            // Check if any generated team violates our rules
            if (!isValidTeam(tA_p1, tA_p2) || !isValidTeam(tB_p1, tB_p2)) {
                isValid = false;
                break;
            }
            
            matches.push({
                teamA: [tA_p1, tA_p2],
                teamB: [tB_p1, tB_p2]
            });
        }
        
        if (isValid) {
            validLayoutFound = true;
            // Remaining unmatched players go to waiting lounge
            const remainder = shuffled.length % 4;
            if (remainder > 0) {
                waiting = shuffled.slice(totalMatches * 4);
            }
        }
        
        attempts++;
    }

    if (!validLayoutFound) {
        alert("Could not generate valid teams because of the player rules constraints!");
        return;
    }
    
    renderMatches(matches, waiting);
}

function renderMatches(matches, waiting) {
    matchesContainer.innerHTML = '';
    
    matches.forEach((match, index) => {
        const delay = index * 0.15; // stagger animation
        const matchHTML = `
            <div class="match-box" style="animation-delay: ${delay}s">
                <div class="match-title">Match ${index + 1}</div>
                <div class="teams-wrapper">
                    <div class="team team-a">
                        <div class="team-player">${match.teamA[0]}</div>
                        <div class="team-player">${match.teamA[1]}</div>
                    </div>
                    <div class="vs-badge">VS</div>
                    <div class="team team-b">
                        <div class="team-player">${match.teamB[0]}</div>
                        <div class="team-player">${match.teamB[1]}</div>
                    </div>
                </div>
            </div>
        `;
        matchesContainer.insertAdjacentHTML('beforeend', matchHTML);
    });
    
    if (waiting.length > 0) {
        waitingSection.classList.remove('hidden');
        waitingPlayersEl.innerHTML = '';
        waiting.forEach((player, i) => {
            const delay = (matches.length * 0.15) + (i * 0.1);
            const span = document.createElement('span');
            span.className = 'waiting-player';
            span.textContent = player;
            span.style.animationDelay = `${delay}s`;
            waitingPlayersEl.appendChild(span);
        });
    } else {
        waitingSection.classList.add('hidden');
    }
    
    // Ensure section is visible
    matchesSection.classList.remove('hidden');
    
    // Smooth scroll to results
    setTimeout(() => {
        matchesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
