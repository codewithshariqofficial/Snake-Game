const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const gameOverScreen = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const resumeBtn = document.getElementById('resume-btn');
const pauseBtn = document.getElementById('pause-btn');
const soundBtn = document.getElementById('sound-btn');
const activePowerUpElement = document.getElementById('active-power-up');

// Game Constants
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// Colors
const COLORS = {
    snake: '#5bbcff',
    snakeHead: '#ffffff',
    food: '#ffffff',
    speedPowerUp: '#ffe600',
    slowPowerUp: '#6bff9e',
    multiplierPowerUp: '#ff9f43',
    grid: '#1a2230'
};

// Base speeds per difficulty
const BASE_SPEEDS = { easy: 280, normal: 220, hard: 170 };

// Game State
let snake = [];
let food = {};
let powerUp = null;
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('neonSnakeHighScore') || 0;
let level = 1;
let gameSpeed = 150;
let lastRenderTime = 0;
let gameRunning = false;
let paused = false;
let scoreMultiplier = 1;
let difficulty = localStorage.getItem('neonSnakeDifficulty') || 'normal';
let soundEnabled = localStorage.getItem('neonSnakeSound') !== 'false';

// Initialize displays
highScoreElement.textContent = String(highScore).padStart(3, '0');
soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
updateDifficultyUI();

// Event Listeners
window.addEventListener('keydown', handleKeyPress);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
resumeBtn.addEventListener('click', resumeGame);
pauseBtn.addEventListener('click', togglePause);
soundBtn.addEventListener('click', toggleSound);

document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        difficulty = btn.dataset.diff;
        localStorage.setItem('neonSnakeDifficulty', difficulty);
        updateDifficultyUI();
    });
});

document.querySelectorAll('.dpad-btn').forEach(btn => {
    btn.addEventListener('click', () => setDirection(btn.dataset.dir));
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); setDirection(btn.dataset.dir); }, { passive: false });
});

function updateDifficultyUI() {
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.diff === difficulty);
    });
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('neonSnakeSound', soundEnabled);
    soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled) beep(660, 0.06);
}

let audioCtx = null;
function beep(freq, duration = 0.06, type = 'square', volume = 0.05) {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = volume;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) { /* ignore */ }
}

function handleKeyPress(e) {
    const key = e.key;
    if (key === 'p' || key === 'P') { togglePause(); return; }
    if ((key === 'ArrowUp' || key === 'w' || key === 'W') && direction !== 'down') nextDirection = 'up';
    else if ((key === 'ArrowDown' || key === 's' || key === 'S') && direction !== 'up') nextDirection = 'down';
    else if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && direction !== 'right') nextDirection = 'left';
    else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && direction !== 'left') nextDirection = 'right';
}

function setDirection(dir) {
    if (dir === 'up' && direction !== 'down') nextDirection = 'up';
    else if (dir === 'down' && direction !== 'up') nextDirection = 'down';
    else if (dir === 'left' && direction !== 'right') nextDirection = 'left';
    else if (dir === 'right' && direction !== 'left') nextDirection = 'right';
}

function togglePause() {
    if (!gameRunning) return;
    if (paused) resumeGame();
    else pauseGame();
}

function pauseGame() {
    paused = true;
    pauseScreen.classList.remove('hidden');
}

function resumeGame() {
    paused = false;
    pauseScreen.classList.add('hidden');
    lastRenderTime = 0;
}

function startGame() {
    snake = [
        { x: 6, y: 10 },
        { x: 5, y: 10 },
        { x: 4, y: 10 }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    level = 1;
    gameSpeed = BASE_SPEEDS[difficulty] || 150;
    scoreMultiplier = 1;
    powerUp = null;
    paused = false;
    activePowerUpElement.textContent = '';

    updateScore();
    updateLevel();
    spawnFood();

    startScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameRunning = true;
    lastRenderTime = 0;
    requestAnimationFrame(gameLoop);
    beep(520, 0.08);
}

function gameLoop(currentTime) {
    if (!gameRunning) return;
    requestAnimationFrame(gameLoop);
    if (paused) return;
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < (gameSpeed / 1000)) return;
    lastRenderTime = currentTime;
    update();
    draw();
}

function update() {
    direction = nextDirection;
    const head = { ...snake[0] };

    if (direction === 'up') head.y--;
    else if (direction === 'down') head.y++;
    else if (direction === 'left') head.x--;
    else if (direction === 'right') head.x++;

    // Collision Detection (Walls)
    if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
        return gameOver();
    }

    // Collision Detection (Self)
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return gameOver();
    }

    snake.unshift(head);

    // Collision Detection (Food)
    if (head.x === food.x && head.y === food.y) {
        score += 10 * scoreMultiplier;
        updateScore();
        checkLevelUp();
        spawnFood();
        beep(720, 0.05);
        // Chance to spawn power-up
        if (Math.random() < 0.2 && !powerUp) spawnPowerUp();
    } else if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
        applyPowerUp(powerUp.type);
        powerUp = null;
        beep(440, 0.08);
    } else {
        snake.pop();
    }
}

function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function draw() {
    // Clear Canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw Grid
    ctx.strokeStyle = 'rgba(91,188,255,0.10)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
        ctx.stroke();
    }

    // Draw Food (pulsing)
    const pulse = 1 + 0.18 * Math.sin(Date.now() / 180);
    const fx = food.x * GRID_SIZE + GRID_SIZE / 2;
    const fy = food.y * GRID_SIZE + GRID_SIZE / 2;
    const fr = (GRID_SIZE / 2 - 3) * pulse;
    ctx.shadowBlur = 18;
    ctx.shadowColor = COLORS.food;
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Power-up (pulsing)
    if (powerUp) {
        const pc = COLORS[`${powerUp.type}PowerUp`];
        const pp = 1 + 0.2 * Math.sin(Date.now() / 150);
        const px = powerUp.x * GRID_SIZE + GRID_SIZE / 2;
        const py = powerUp.y * GRID_SIZE + GRID_SIZE / 2;
        ctx.shadowBlur = 16;
        ctx.shadowColor = pc;
        ctx.fillStyle = pc;
        ctx.beginPath();
        ctx.arc(px, py, (GRID_SIZE / 3) * pp, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Draw Snake
    snake.forEach((segment, index) => {
        const x = segment.x * GRID_SIZE + 1;
        const y = segment.y * GRID_SIZE + 1;
        const size = GRID_SIZE - 2;
        const isHead = index === 0;
        ctx.shadowBlur = isHead ? 22 : 10;
        ctx.shadowColor = COLORS.snake;
        // gradient-ish: head white, body cyan with fading alpha
        if (isHead) ctx.fillStyle = COLORS.snakeHead;
        else {
            const alpha = Math.max(0.35, 1 - index / (snake.length + 4));
            ctx.fillStyle = `rgba(0, 245, 255, ${alpha})`;
        }
        roundRect(x, y, size, size, 6);
        ctx.fill();

        // Eyes on head
        if (isHead) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#03060d';
            let e1, e2;
            if (direction === 'right') { e1 = {x: x+size-5, y: y+4}; e2 = {x: x+size-5, y: y+size-7}; }
            else if (direction === 'left') { e1 = {x: x+2, y: y+4}; e2 = {x: x+2, y: y+size-7}; }
            else if (direction === 'up') { e1 = {x: x+4, y: y+2}; e2 = {x: x+size-7, y: y+2}; }
            else { e1 = {x: x+4, y: y+size-5}; e2 = {x: x+size-7, y: y+size-5}; }
            ctx.beginPath(); ctx.arc(e1.x, e1.y, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(e2.x, e2.y, 2, 0, Math.PI*2); ctx.fill();
        }
    });

    ctx.shadowBlur = 0;
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
    };
    // Ensure food doesn't spawn on snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        spawnFood();
    }
}

function spawnPowerUp() {
    const types = ['speed', 'slow', 'multiplier'];
    powerUp = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        type: types[Math.floor(Math.random() * types.length)]
    };
    // Ensure power-up doesn't spawn on snake or food
    if (snake.some(segment => segment.x === powerUp.x && segment.y === powerUp.y) || (powerUp.x === food.x && powerUp.y === food.y)) {
        spawnPowerUp();
    }
    // Power-up expires after 5 seconds
    setTimeout(() => {
        if (powerUp) powerUp = null;
    }, 5000);
}

function applyPowerUp(type) {
    if (type === 'speed') {
        gameSpeed = Math.max(80, gameSpeed - 30);
        activePowerUpElement.textContent = 'SPEED BOOST!';
    } else if (type === 'slow') {
        gameSpeed += 40;
        activePowerUpElement.textContent = 'TIME SLOWED!';
    } else if (type === 'multiplier') {
        scoreMultiplier = 2;
        activePowerUpElement.textContent = '2X SCORE!';
    }

    setTimeout(() => {
        if (type === 'speed') gameSpeed += 30;
        else if (type === 'slow') gameSpeed -= 40;
        else if (type === 'multiplier') scoreMultiplier = 1;
        activePowerUpElement.textContent = '';
    }, 7000);
}

function updateScore() {
    scoreElement.textContent = String(score).padStart(3, '0');
    scoreElement.classList.remove('pop');
    void scoreElement.offsetWidth;
    scoreElement.classList.add('pop');
}

function updateLevel() {
    levelElement.textContent = String(level).padStart(2, '0');
}

function checkLevelUp() {
    const newLevel = Math.floor(score / 50) + 1;
    if (newLevel > level) {
        level = newLevel;
        gameSpeed = Math.max(80, gameSpeed - 8);
        updateLevel();
        beep(880, 0.08);
        setTimeout(() => beep(1100, 0.1), 90);
    }
}

function gameOver() {
    gameRunning = false;
    paused = false;
    pauseScreen.classList.add('hidden');
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
    beep(180, 0.35, 'sawtooth', 0.08);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neonSnakeHighScore', highScore);
        highScoreElement.textContent = String(highScore).padStart(3, '0');
    }
}