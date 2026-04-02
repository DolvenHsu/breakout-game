import Paddle from './Paddle.js';
import Ball from './Ball.js';
import Brick, { buildLevel } from './Brick.js';

export default class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // 遊戲狀態與數值
    this.initialLives = 3;
    this.lives = this.initialLives;
    this.score = 0;
    
    this.paddle = new Paddle(this.canvas);
    this.ball = new Ball(this.canvas);
    this.bricks = [];
    
    // 0: init, 1: playing, 2: over, 3: victory
    this.state = 0; 
    
    // 動畫相關
    this.lastTime = 0;
    this.requestID = null;
    
    // UI 回呼函式
    this.onScoreUpdate = () => {};
    this.onLivesUpdate = () => {};
    this.onGameOver = () => {};
    this.onVictory = () => {};
    
    // 關卡難度參數
    this.baseRows = 4;
    this.baseCols = 6;
    this.rows = this.baseRows;
    this.cols = this.baseCols;
    
    this.setupLevel();
    this.loop = this.loop.bind(this);
  }

  setupLevel() {
    this.bricks = buildLevel(this.canvas, this.rows, this.cols);
  }

  resize(w, h) {
    if (this.paddle) this.paddle.resize();
    if (this.state === 0) {
        this.setupLevel();
        this.ball.reset();
    }
  }

  reset() {
    this.lives = this.initialLives;
    this.score = 0;
    this.rows = this.baseRows;
    this.cols = this.baseCols;
    this.setupLevel();
    this.ball.reset();
    
    this.onScoreUpdate(this.score);
    this.onLivesUpdate(this.lives);
  }

  nextLevel() {
    // 增加難度：增加行數或攔列數
    this.rows = Math.min(this.rows + 1, 8);
    this.cols = Math.min(this.cols + 1, 10);
    this.setupLevel();
    
    this.ball.reset();
    // 進入下一關，保留剩餘生命值與分數
    this.start();
  }

  start() {
    this.state = 1;
    this.onScoreUpdate(this.score);
    this.onLivesUpdate(this.lives);
    this.lastTime = performance.now();
    cancelAnimationFrame(this.requestID);
    this.requestID = requestAnimationFrame(this.loop);
  }

  loop(timestamp) {
    if (this.state !== 1) return;

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.draw();

    if (this.state === 1) {
      this.requestID = requestAnimationFrame(this.loop);
    }
  }

  update(deltaTime) {
    // 1. 更新玩家擋板
    this.paddle.update(deltaTime);
    
    // 2. 更新球
    const hitBottom = this.ball.update(deltaTime);
    
    // 3. 碰撞偵測
    this.checkCollisions();
    
    // 4. 生命與遊戲結束判斷
    if (hitBottom) {
      this.lives--;
      this.onLivesUpdate(this.lives);
      
      if (this.lives === 0) {
        this.state = 2; // Game Over
        this.onGameOver();
      } else {
        // 重置球的位置
        this.ball.reset();
      }
    }
    
    // 5. 勝利判斷 (檢查是否所有磚塊都被擊破)
    const allBroken = this.bricks.every(b => b.status === 0);
    if (allBroken && this.bricks.length > 0) {
      this.state = 3; // Victory
      this.onVictory();
    }
  }

  checkCollisions() {
    // 球與擋板碰撞
    const b = this.ball;
    const p = this.paddle;
    
    // 簡單的矩形碰圓形邏輯：
    if (b.x + b.radius > p.x && b.x - b.radius < p.x + p.width && 
        b.y + b.radius > p.y && b.y - b.radius < p.y + p.height) {
        
        // 確保球只在向下落時反彈，避免卡在板子裡
        if (b.dy > 0) {
            b.dy = -b.dy;
            
            // 根據擊中板子的位置調整 x 軸反彈方向的變化
            const hitPoint = b.x - (p.x + p.width / 2);
            const normalizedHitPoint = hitPoint / (p.width / 2); // 範圍 -1 到 1
            b.dx = normalizedHitPoint * b.speed;
            
            // 每次擊球增加極小的高速，讓難度動態增加
            b.increaseSpeed();
        }
    }

    // 球與磚塊碰撞
    for (let i = 0; i < this.bricks.length; i++) {
        const brick = this.bricks[i];
        if (brick.status === 1) {
            if (b.x + b.radius > brick.x && b.x - b.radius < brick.x + brick.width &&
                b.y + b.radius > brick.y && b.y - b.radius < brick.y + brick.height) {
                
                b.dy = -b.dy; // 簡單的反彈 (可以再細分為上下左右打到磚塊不同邊界，但先用簡易版)
                brick.status = 0;
                
                // 加分並更新
                this.score += 10;
                this.onScoreUpdate(this.score);
                
                // 如果打破磚塊，增加球速，提高動態難度
                b.increaseSpeed();
            }
        }
    }
  }

  draw() {
    // 清空背景
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 繪製順序
    this.bricks.forEach(b => b.draw(this.ctx));
    this.paddle.draw(this.ctx);
    this.ball.draw(this.ctx);
  }
}
