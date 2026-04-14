import Paddle from './Paddle.js';
import Ball from './Ball.js';
import Brick, { buildLevel } from './Brick.js';
import Missile from './Missile.js';

export default class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // 遊戲狀態與數值
    this.initialLives = 3;
    this.lives = this.initialLives;
    this.score = 0;
    
    this.paddle = new Paddle(this.canvas);
    this.balls = [new Ball(this.canvas)];
    this.bricks = [];
    this.missiles = [];
    
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
        this.balls = [new Ball(this.canvas)];
    }
  }

  reset() {
    this.lives = this.initialLives;
    this.score = 0;
    this.rows = this.baseRows;
    this.cols = this.baseCols;
    this.missiles = [];
    this.setupLevel();
    this.balls = [new Ball(this.canvas)];
    
    this.onScoreUpdate(this.score);
    this.onLivesUpdate(this.lives);
  }

  nextLevel() {
    // 增加難度：增加行數或攔列數
    this.rows = Math.min(this.rows + 1, 8);
    this.cols = Math.min(this.cols + 1, 10);
    this.missiles = [];
    this.setupLevel();
    this.balls = [new Ball(this.canvas)];
    this.paddle.resetSize(); // 每關開始板子回到原始大小
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

    // 2. 更新所有球，移除落底的球
    for (const b of this.balls) b.update(deltaTime);
    this.balls = this.balls.filter(b => !(b.y + b.radius > this.canvas.height));

    // 3. 更新飛彈
    this.updateMissiles(deltaTime);

    // 4. 碰撞偵測
    this.checkCollisions();

    // 5. 所有球都落底 → 扣命
    if (this.balls.length === 0) {
      this.lives--;
      this.onLivesUpdate(this.lives);

      if (this.lives === 0) {
        this.state = 2; // Game Over
        this.onGameOver();
      } else {
        this.balls = [new Ball(this.canvas)];
      }
    }

    // 6. 勝利判斷 (檢查是否所有磚塊都被擊破)
    const allBroken = this.bricks.every(b => b.status === 0);
    if (allBroken && this.bricks.length > 0) {
      this.state = 3; // Victory
      this.onVictory();
    }
  }

  updateMissiles(deltaTime) {
    for (const m of this.missiles) {
      if (!m.active) continue;
      m.update(deltaTime);
      // 飛出畫面底部則移除
      if (m.y > this.canvas.height) m.active = false;
    }
    // 清除已失效的飛彈
    this.missiles = this.missiles.filter(m => m.active);
  }

  checkCollisions() {
    const p = this.paddle;
    const ballsToAdd = []; // 分裂磚產生的新球，等迴圈結束後統一加入

    for (const b of this.balls) {
      // 球與擋板碰撞
      if (b.x + b.radius > p.x && b.x - b.radius < p.x + p.width &&
          b.y + b.radius > p.y && b.y - b.radius < p.y + p.height) {

          if (b.dy > 0) {
              b.dy = -b.dy;
              const hitPoint = b.x - (p.x + p.width / 2);
              const normalizedHitPoint = hitPoint / (p.width / 2);
              b.dx = normalizedHitPoint * b.speed;
              b.increaseSpeed();
          }
      }

      // 球與磚塊碰撞
      for (const brick of this.bricks) {
          if (brick.status === 1 &&
              b.x + b.radius > brick.x && b.x - b.radius < brick.x + brick.width &&
              b.y + b.radius > brick.y && b.y - b.radius < brick.y + brick.height) {

              b.dy = -b.dy;
              brick.status = 0;

              if (brick.hasMissile) {
                  this.missiles.push(
                      new Missile(brick.x + brick.width / 2, brick.y + brick.height)
                  );
              }
              if (brick.hasGrow) {
                  p.grow();
              }
              // 分裂磚：複製當前所有球（本幀結束後加入）
              if (brick.hasMultiball) {
                  for (const ball of this.balls) {
                      ballsToAdd.push(ball.clone());
                  }
              }

              this.score += 10;
              this.onScoreUpdate(this.score);
              b.increaseSpeed();
          }
      }
    }

    // 加入分裂產生的新球
    this.balls.push(...ballsToAdd);

    // 飛彈與擋板碰撞
    for (const m of this.missiles) {
        if (!m.active) continue;
        const mLeft  = m.x - m.width / 2;
        const mRight = m.x + m.width / 2;
        const mBottom = m.y + m.height;
        if (mRight > p.x && mLeft < p.x + p.width &&
            mBottom > p.y && m.y < p.y + p.height) {
            m.active = false;
            p.shrink();
        }
    }
  }

  draw() {
    // 清空背景
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 繪製順序
    this.bricks.forEach(b => b.draw(this.ctx));
    this.missiles.forEach(m => m.draw(this.ctx));
    this.paddle.draw(this.ctx);
    this.balls.forEach(b => b.draw(this.ctx));
  }
}
