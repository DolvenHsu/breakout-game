import Game from './Game.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// UI Elements
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const hud = document.getElementById('hud');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const finalScore = document.getElementById('final-score');
const victoryScreen = document.getElementById('victory-screen');
const nextLevelBtn = document.getElementById('next-level-btn');

// Game Initialization
const game = new Game(canvas, ctx);

function resizeCanvas() {
  const container = document.getElementById('game-container');
  // 保持長寬比，或者是全螢幕適應，這裡選擇填滿 container 但限制在其 max-width/height
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  game.resize(canvas.width, canvas.height);
}

// 事件監聽
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // 初始化 Size

startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  game.start();
});

restartBtn.addEventListener('click', () => {
  gameOverScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  game.reset();
  game.start();
});

nextLevelBtn.addEventListener('click', () => {
  victoryScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  game.nextLevel();
});

// UI 回呼更新
game.onScoreUpdate = (score) => {
  scoreDisplay.innerText = score;
};

game.onLivesUpdate = (lives) => {
  livesDisplay.innerText = lives;
};

game.onGameOver = () => {
  hud.classList.add('hidden');
  gameOverScreen.classList.remove('hidden');
  finalScore.innerText = `Score: ${game.score}`;
};

game.onVictory = () => {
  hud.classList.add('hidden');
  victoryScreen.classList.remove('hidden');
};

// 進入主迴圈前渲染一次首圖
game.draw();
