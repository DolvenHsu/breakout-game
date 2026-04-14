export default class Paddle {
  constructor(canvas) {
    this.canvas = canvas;
    this.originalWidth = 120;
    this.width = this.originalWidth;
    this.height = 15;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 30; // 距離底部 30px
    this.speed = 8;
    this.dx = 0;

    // 鍵盤狀態
    this.rightPressed = false;
    this.leftPressed = false;

    // 觸控與滑鼠處理
    this.bindEvents();
  }

  resize() {
    // 當視窗縮放時，確保寬度不變，y軸相對底部
    this.y = this.canvas.height - this.height - 30;
    this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.width));
  }

  bindEvents() {
    // 鍵盤事件
    document.addEventListener("keydown", (e) => {
      if (e.key === "Right" || e.key === "ArrowRight") this.rightPressed = true;
      else if (e.key === "Left" || e.key === "ArrowLeft") this.leftPressed = true;
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "Right" || e.key === "ArrowRight") this.rightPressed = false;
      else if (e.key === "Left" || e.key === "ArrowLeft") this.leftPressed = false;
    });

    // 滑鼠與觸控事件 (結合視窗縮放比率)
    const updatePosition = (clientX) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const x = (clientX - rect.left) * scaleX;
      // 確保滑鼠或手指在板子中間
      this.x = x - this.width / 2;
    };

    document.addEventListener("mousemove", (e) => {
      updatePosition(e.clientX);
    });

    // 支援觸控
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault(); // 防止滾動
      updatePosition(e.touches[0].clientX);
    }, { passive: false });
  }

  resetSize() {
    this.width = this.originalWidth;
    this.x = this.canvas.width / 2 - this.width / 2;
    this._hitFlash = 0;
    this._growFlash = 0;
  }

  grow() {
    const maxWidth = this.canvas.width * 0.6;
    const newWidth = Math.min(maxWidth, this.width * 1.25);
    const cx = this.x + this.width / 2;
    this.width = newWidth;
    this.x = cx - this.width / 2;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvas.width) this.x = this.canvas.width - this.width;

    // 閃爍綠色效果
    this._growFlash = 300; // ms
  }

  shrink() {
    const minWidth = 40;
    const newWidth = Math.max(minWidth, this.width * 0.5);
    // 保持中心點不變
    const cx = this.x + this.width / 2;
    this.width = newWidth;
    this.x = cx - this.width / 2;
    // 邊界修正
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvas.width) this.x = this.canvas.width - this.width;

    // 閃爍警告效果
    this._hitFlash = 300; // ms
  }

  update(deltaTime) {
    if (this.rightPressed) {
      this.x += this.speed * (deltaTime / 16); // 標準化速度
    } else if (this.leftPressed) {
      this.x -= this.speed * (deltaTime / 16);
    }

    // 邊界檢查
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvas.width) {
      this.x = this.canvas.width - this.width;
    }

    if (this._hitFlash > 0) this._hitFlash -= deltaTime;
    if (this._growFlash > 0) this._growFlash -= deltaTime;
  }

  draw(ctx) {
    const isHitFlash  = this._hitFlash  > 0 && Math.floor(this._hitFlash  / 60) % 2 === 0;
    const isGrowFlash = this._growFlash > 0 && Math.floor(this._growFlash / 60) % 2 === 0;
    const color = isHitFlash ? '#ff4400' : isGrowFlash ? '#00ff88' : '#0ff';

    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 5);
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
  }
}
