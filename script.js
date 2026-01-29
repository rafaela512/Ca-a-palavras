const DIFFICULTY_CONFIG = {
    easy: {
        gridSize: 10,
        words: ['WEB', 'HTML', 'CSS', 'DOM', 'API', 'JAVA', 'CODE'],
        directions: [
            { x: 1, y: 0 },   // Horizontal
            { x: 0, y: 1 }    // Vertical
        ]
    },
    medium: {
        gridSize: 14,
        words: ['JAVASCRIPT', 'FRONTEND', 'BACKEND', 'DATABASE', 'SERVIDOR', 'BROWSER', 'MOBILE', 'DEBUG'],
        directions: [
            { x: 1, y: 0 },   // Horizontal
            { x: 0, y: 1 },   // Vertical
            { x: 1, y: 1 }    // Diagonal Down
        ]
    },
    hard: {
        gridSize: 18,
        words: ['ASSINCRONISMO', 'COMPLEXIDADE', 'POLIMORFISMO', 'ABSTRACAO', 'FRAMEWORK', 'TYPESCRIPT', 'DEPLOYMENT', 'RESPONSIVIDADE', 'FULLSTACK'],
        directions: [
            { x: 1, y: 0 },   // Horizontal
            { x: 0, y: 1 },   // Vertical
            { x: 1, y: 1 },   // Diagonal Down
            { x: 1, y: -1 },  // Diagonal Up
            { x: -1, y: 1 },  // Diagonal Down Back
            { x: -1, y: -1 }  // Diagonal Up Back
        ]
    }
};

let currentConfig = DIFFICULTY_CONFIG.medium;

let gameState = {
    grid: [],
    foundWords: [],
    selecting: false,
    selectionStart: null,
    currentSelection: [],
    score: 0,
    timer: 0,
    timerInterval: null
};

// UI Elements
const gridContainer = document.getElementById('grid-container');
const wordListElement = document.getElementById('word-list');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const newGameBtn = document.getElementById('new-game-btn');
const difficultySelect = document.getElementById('difficulty-select');
// Modal Elements
const victoryModal = document.getElementById('victory-modal');
const modalDifficulty = document.getElementById('modal-difficulty');
const modalTime = document.getElementById('modal-time');
const modalScore = document.getElementById('modal-score');
const nicknameInput = document.getElementById('nickname-input');
const passwordInput = document.getElementById('password-input');
const playerNicknameDisplay = document.getElementById('player-nickname-display');
const saveScoreBtn = document.getElementById('save-score-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const modalBackBtn = document.getElementById('modal-back-btn');
const headerBackBtn = document.getElementById('header-back-btn');
const headerLogoutBtn = document.getElementById('header-logout-btn');
const introLogoutBtn = document.getElementById('intro-logout-btn');
const exitGameBtn = document.getElementById('exit-game-btn');
const gameFooter = document.querySelector('.game-footer');
// Ranking Elements
const rankingBtn = document.getElementById('ranking-btn');
const rankingModal = document.getElementById('ranking-modal');
const rankingList = document.getElementById('ranking-list');
const closeRankingBtn = document.getElementById('close-ranking-btn');

let playerNickname = '';

// Nickname Input Validation
// Nickname and Password Input Validation
function validateLogin() {
    const nick = nicknameInput.value.trim();
    const pass = passwordInput.value.trim();
    startBtn.disabled = nick.length === 0 || pass.length < 3;
}

nicknameInput.addEventListener('input', validateLogin);
passwordInput.addEventListener('input', validateLogin);

function checkLoginState() {
    if (playerNickname) {
        if (introLogoutBtn) introLogoutBtn.style.display = 'block';
    } else {
        if (introLogoutBtn) introLogoutBtn.style.display = 'none';
    }
}

// Initialization
function initGame() {
    playerNickname = nicknameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!playerNickname || password.length < 3) return;

    // Set configuration based on selection
    const selectedDifficulty = difficultySelect ? difficultySelect.value : 'medium';
    currentConfig = DIFFICULTY_CONFIG[selectedDifficulty];

    // Apply Difficulty Theme
    document.body.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');
    document.body.classList.add(`difficulty-${selectedDifficulty}`);

    gameState.foundWords = [];
    gameState.score = 0;
    gameState.timer = 0;
    updateScore();
    renderWordList();
    generateGrid();
    renderGrid();
    startTimer();

    document.querySelector('.intro-screen').style.display = 'none';
    victoryModal.style.display = 'none';

    // Show game elements
    newGameBtn.style.display = 'block';
    if (gameFooter) gameFooter.style.display = 'flex';
    if (headerBackBtn) headerBackBtn.style.display = 'flex';
    if (headerLogoutBtn) headerLogoutBtn.style.display = 'flex';
    checkLoginState();
}

function generateGrid() {
    // Initialize empty grid
    gameState.grid = Array(currentConfig.gridSize).fill().map(() => Array(currentConfig.gridSize).fill(''));

    // Place words
    currentConfig.words.forEach(word => {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
            const direction = currentConfig.directions[Math.floor(Math.random() * currentConfig.directions.length)];
            const startX = Math.floor(Math.random() * currentConfig.gridSize);
            const startY = Math.floor(Math.random() * currentConfig.gridSize);

            if (canPlaceWord(word, startX, startY, direction)) {
                placeWord(word, startX, startY, direction);
                placed = true;
            }
            attempts++;
        }
    });

    // Fill empty cells
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let y = 0; y < currentConfig.gridSize; y++) {
        for (let x = 0; x < currentConfig.gridSize; x++) {
            if (gameState.grid[y][x] === '') {
                gameState.grid[y][x] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }
}

function canPlaceWord(word, startX, startY, dir) {
    if (startX + dir.x * (word.length - 1) < 0 ||
        startX + dir.x * (word.length - 1) >= currentConfig.gridSize ||
        startY + dir.y * (word.length - 1) < 0 ||
        startY + dir.y * (word.length - 1) >= currentConfig.gridSize) {
        return false;
    }

    for (let i = 0; i < word.length; i++) {
        const x = startX + dir.x * i;
        const y = startY + dir.y * i;
        if (gameState.grid[y][x] !== '' && gameState.grid[y][x] !== word[i]) {
            return false;
        }
    }
    return true;
}

function placeWord(word, startX, startY, dir) {
    for (let i = 0; i < word.length; i++) {
        const x = startX + dir.x * i;
        const y = startY + dir.y * i;
        gameState.grid[y][x] = word[i];
    }
}

function renderGrid() {
    gridContainer.style.gridTemplateColumns = `repeat(${currentConfig.gridSize}, 1fr)`;
    gridContainer.innerHTML = '';

    for (let y = 0; y < currentConfig.gridSize; y++) {
        for (let x = 0; x < currentConfig.gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = gameState.grid[y][x];
            cell.dataset.x = x;
            cell.dataset.y = y;

            cell.addEventListener('mousedown', handleMouseDown);
            cell.addEventListener('mouseover', handleMouseOver);
            gridContainer.appendChild(cell);
        }
    }
    window.addEventListener('mouseup', handleMouseUp);
}

function renderWordList() {
    wordListElement.innerHTML = '';
    currentConfig.words.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        li.id = `word-${word}`;
        if (gameState.foundWords.includes(word)) {
            li.classList.add('found');
        }
        wordListElement.appendChild(li);
    });
}

// Interaction Handlers
function handleMouseDown(e) {
    if (!e.target.classList.contains('cell')) return;
    gameState.selecting = true;
    gameState.selectionStart = {
        x: parseInt(e.target.dataset.x),
        y: parseInt(e.target.dataset.y)
    };
    gameState.currentSelection = [gameState.selectionStart];
    clearSelection();
    e.target.classList.add('selected');
}

function handleMouseOver(e) {
    if (!gameState.selecting || !e.target.classList.contains('cell')) return;

    const currentX = parseInt(e.target.dataset.x);
    const currentY = parseInt(e.target.dataset.y);

    const dx = currentX - gameState.selectionStart.x;
    const dy = currentY - gameState.selectionStart.y;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Check if movement is horizontal, vertical or 45-degree diagonal
    if (dx === 0 || dy === 0 || absDx === absDy) {
        clearSelection();
        const steps = Math.max(absDx, absDy);
        const stepX = dx === 0 ? 0 : dx / steps;
        const stepY = dy === 0 ? 0 : dy / steps;

        gameState.currentSelection = [];
        for (let i = 0; i <= steps; i++) {
            const x = gameState.selectionStart.x + Math.round(stepX * i);
            const y = gameState.selectionStart.y + Math.round(stepY * i);
            gameState.currentSelection.push({ x, y });
            const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
            if (cell) cell.classList.add('selected');
        }
    }
}

function handleMouseUp() {
    if (!gameState.selecting) return;
    gameState.selecting = false;

    const selectedText = gameState.currentSelection
        .map(pos => gameState.grid[pos.y][pos.x])
        .join('');

    const reversedText = selectedText.split('').reverse().join('');

    if (currentConfig.words.includes(selectedText) && !gameState.foundWords.includes(selectedText)) {
        foundWord(selectedText);
    } else if (currentConfig.words.includes(reversedText) && !gameState.foundWords.includes(reversedText)) {
        foundWord(reversedText);
    } else {
        clearSelection();
    }
}

function clearSelection() {
    document.querySelectorAll('.cell.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
}

function foundWord(word) {
    gameState.foundWords.push(word);
    gameState.score += 100;
    updateScore();

    gameState.currentSelection.forEach(pos => {
        const cell = document.querySelector(`.cell[data-x="${pos.x}"][data-y="${pos.y}"]`);
        cell.classList.add('found');
    });

    const wordLi = document.getElementById(`word-${word}`);
    wordLi.classList.add('found');

    if (gameState.foundWords.length === currentConfig.words.length) {
        victory();
    }
}

// Helpers
function updateScore() {
    scoreElement.textContent = gameState.score;
}

function startTimer() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        const mins = Math.floor(gameState.timer / 60).toString().padStart(2, '0');
        const secs = (gameState.timer % 60).toString().padStart(2, '0');
        timerElement.textContent = `${mins}:${secs}`;
    }, 1000);
}

function victory() {
    clearInterval(gameState.timerInterval);

    // Show Modal
    modalDifficulty.textContent = difficultySelect.options[difficultySelect.selectedIndex].text;
    modalTime.textContent = timerElement.textContent;
    modalScore.textContent = gameState.score;
    // Update player nickname in modal
    if (playerNicknameDisplay) {
        playerNicknameDisplay.textContent = playerNickname;
    }
    victoryModal.style.display = 'flex';
}

function saveScore() {
    if (!playerNickname) {
        alert('Erro: Jogador não identificado.');
        return;
    }

    const scoreData = {
        name: playerNickname,
        score: gameState.score,
        difficulty: difficultySelect.value,
        date: new Date().toISOString()
    };

    try {
        // Get existing scores
        let scores = JSON.parse(localStorage.getItem('wordSearchScores') || '[]');

        // Add new score
        scores.push(scoreData);

        // Sort by score (descending)
        scores.sort((a, b) => b.score - a.score);

        // Keep top 20 to avoid unlimited growth
        scores = scores.slice(0, 20);

        // Save back to localStorage
        localStorage.setItem('wordSearchScores', JSON.stringify(scores));

        alert('Pontuação salva com sucesso!');
        saveScoreBtn.disabled = true;
        saveScoreBtn.textContent = 'Salvo!';

    } catch (error) {
        console.error('Erro ao salvar localmente:', error);
        alert('Erro ao salvar pontuação.');
    }
}

function loadRanking() {
    try {
        const scores = JSON.parse(localStorage.getItem('wordSearchScores') || '[]');

        rankingList.innerHTML = '';

        if (scores.length > 0) {
            scores.forEach((score, index) => {
                const li = document.createElement('li');
                li.className = 'ranking-item';
                li.innerHTML = `
                    <span>${index + 1}</span>
                    <span>${score.name}</span>
                    <span style="text-transform: capitalize">${score.difficulty}</span>
                    <span>${score.score}</span>
                `;
                rankingList.appendChild(li);
            });
        } else {
            rankingList.innerHTML = '<li style="padding: 1rem; text-align: center; color: var(--text-dim);">Nenhuma pontuação salva ainda.</li>';
        }

        rankingModal.style.display = 'flex';
        // Add high visibility back button access
        if (headerBackBtn) headerBackBtn.style.display = 'flex';
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        alert('Erro ao carregar ranking.');
    }
}

// Event Listeners
startBtn.addEventListener('click', initGame);
newGameBtn.addEventListener('click', () => {
    document.querySelector('.intro-screen').style.display = 'flex';
    newGameBtn.style.display = 'none';
    document.body.classList.remove('difficulty-hard');
    clearInterval(gameState.timerInterval);
    timerElement.textContent = '00:00';
    scoreElement.textContent = '0';
    gridContainer.innerHTML = '';
    wordListElement.innerHTML = '';

    // Reset inputs
    startBtn.disabled = false;
    // We keep the nickname for convenience or could clear it if preferred
    // nicknameInput.value = ''; 
});

saveScoreBtn.addEventListener('click', saveScore);
playAgainBtn.addEventListener('click', () => {
    victoryModal.style.display = 'none';
    document.querySelector('.intro-screen').style.display = 'flex';
    newGameBtn.style.display = 'none';
    document.body.classList.remove('difficulty-hard');
    clearInterval(gameState.timerInterval);
    timerElement.textContent = '00:00';
    scoreElement.textContent = '0';
    gridContainer.innerHTML = '';
    wordListElement.innerHTML = '';

    // Reset save button state
    saveScoreBtn.disabled = false;
    saveScoreBtn.textContent = 'Salvar Pontuação';
});

// Navigation Handlers
function backToMenu() {
    document.querySelector('.intro-screen').style.display = 'flex';
    if (gameFooter) gameFooter.style.display = 'none';
    if (headerBackBtn) headerBackBtn.style.display = 'none';
    if (headerLogoutBtn) headerLogoutBtn.style.display = 'none';
    victoryModal.style.display = 'none';
    rankingModal.style.display = 'none';
    document.body.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');

    checkLoginState();

    // Cleanup game state
    clearInterval(gameState.timerInterval);
    timerElement.textContent = '00:00';
    scoreElement.textContent = '0';
    gridContainer.innerHTML = '';
    wordListElement.innerHTML = '';
}

function logout() {
    playerNickname = '';
    nicknameInput.value = '';
    passwordInput.value = '';
    startBtn.disabled = true;
    checkLoginState();
    backToMenu();
}

function exitGame() {
    // Try to close the window
    window.close();

    // Fallback if window.close() is blocked (common in modern browsers)
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'var(--background)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.textAlign = 'center';
    overlay.style.padding = '2rem';

    overlay.innerHTML = `
        <h1 style="font-size: 3rem; margin-bottom: 2rem; background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">Obrigado por jogar!</h1>
        <p style="font-size: 1.2rem; color: var(--text-dim); margin-bottom: 3rem;">Você já pode fechar esta aba com segurança.</p>
        <button class="primary-btn" onclick="window.location.reload()" style="width: auto; padding: 1rem 2rem;">Voltar ao Jogo</button>
    `;

    document.body.appendChild(overlay);
}

backToMenuBtn.addEventListener('click', backToMenu);
modalBackBtn.addEventListener('click', backToMenu);
headerBackBtn.addEventListener('click', backToMenu);
headerLogoutBtn.addEventListener('click', logout);
introLogoutBtn.addEventListener('click', logout);
exitGameBtn.addEventListener('click', exitGame);

rankingBtn.addEventListener('click', loadRanking);
closeRankingBtn.addEventListener('click', backToMenu);
