const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const activePowerUpElement = document.getElementById('active-power-up');

// Game Constants
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// Colors
const COLORS = {
    snake: '#00ffff',
    snakeHead: '#fff',
    food: '#ff00ff',
    speedPowerUp: '#ffff00',
    slowPowerUp: '#00ff00',
    multiplierPowerUp: '#ff8000',
    grid: '#111'
};

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
let scoreMultiplier = 1;

// Initialize High Score Display
highScoreElement.textContent = String(highScore).padStart(3, '0');

// Event Listeners
window.addEventListener('keydown', handleKeyPress);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function handleKeyPress(e) {
    const key = e.key;
    if ((key === 'ArrowUp' || key === 'w') && direction !== 'down') nextDirection = 'up';
    else if ((key === 'ArrowDown' || key === 's') && direction !== 'up') nextDirection = 'down';
    else if ((key === 'ArrowLeft' || key === 'a') && direction !== 'right') nextDirection = 'left';
    else if ((key === 'ArrowRight' || key === 'd') && direction !== 'left') nextDirection = 'right';
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
    gameSpeed = 150;
    scoreMultiplier = 1;
    powerUp = null;
    activePowerUpElement.textContent = '';
    
    updateScore();
    updateLevel();
    spawnFood();
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
    if (!gameRunning) return;

    requestAnimationFrame(gameLoop);
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
        // Chance to spawn power-up
        if (Math.random() < 0.2 && !powerUp) spawnPowerUp();
    } else if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
        applyPowerUp(powerUp.type);
        powerUp = null;
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear Canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw Grid
    ctx.strokeStyle = COLORS.grid;
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

    // Draw Food
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.food;
    ctx.fillStyle = COLORS.food;
    ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);

    // Draw Power-up
    if (powerUp) {
        ctx.shadowColor = COLORS[`${powerUp.type}PowerUp`];
        ctx.fillStyle = COLORS[`${powerUp.type}PowerUp`];
        ctx.beginPath();
        ctx.arc(powerUp.x * GRID_SIZE + GRID_SIZE / 2, powerUp.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw Snake
    snake.forEach((segment, index) => {
        ctx.shadowBlur = index === 0 ? 20 : 10;
        ctx.shadowColor = COLORS.snake;
        ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snake;
        ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
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
        gameSpeed -= 40;
        activePowerUpElement.textContent = 'SPEED BOOST!';
    } else if (type === 'slow') {
        gameSpeed += 40;
        activePowerUpElement.textContent = 'TIME SLOWED!';
    } else if (type === 'multiplier') {
        scoreMultiplier = 2;
        activePowerUpElement.textContent = '2X SCORE!';
    }

    setTimeout(() => {
        if (type === 'speed') gameSpeed += 40;
        else if (type === 'slow') gameSpeed -= 40;
        else if (type === 'multiplier') scoreMultiplier = 1;
        activePowerUpElement.textContent = '';
    }, 7000);
}

function updateScore() {
    scoreElement.textContent = String(score).padStart(3, '0');
}

function updateLevel() {
    levelElement.textContent = String(level).padStart(2, '0');
}

function checkLevelUp() {
    const newLevel = Math.floor(score / 50) + 1;
    if (newLevel > level) {
        level = newLevel;
        gameSpeed = Math.max(50, gameSpeed - 10);
        updateLevel();
    }
}

function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neonSnakeHighScore', highScore);
        highScoreElement.textContent = String(highScore).padStart(3, '0');
    }
}
