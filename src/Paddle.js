export default class Paddle {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = 120;
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
  }

  draw(ctx) {
    // 發光效果與漸層
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#0ff";
    ctx.fillStyle = "#0ff";
    ctx.beginPath();
    // 繪製圓角矩形
    ctx.roundRect(this.x, this.y, this.width, this.height, 5);
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0; // 重置發光
  }
}
