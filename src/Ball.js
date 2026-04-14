export default class Ball {
  constructor(canvas) {
    this.canvas = canvas;
    this.radius = 8;
    this.reset();
  }

  reset() {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2 + 100;
    
    // 初始速度
    this.baseSpeed = 6;
    this.speed = this.baseSpeed;
    
    // 隨機角度 (-45度到45度) 加上一點往上，所以是 (-Math.PI/4 到 Math.PI/4) - Math.PI/2
    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
    this.dx = this.speed * Math.sin(angle);
    this.dy = -this.speed * Math.cos(angle);
  }

  clone() {
    const b = new Ball(this.canvas);
    b.x = this.x;
    b.y = this.y;
    b.speed = this.speed;
    b.baseSpeed = this.baseSpeed;
    // 鏡射 dx，讓兩球往不同方向散開
    b.dx = -this.dx;
    b.dy = this.dy;
    return b;
  }

  increaseSpeed() {
    // 每次增加一點速度，最多到一個上限
    if (this.speed < 12) {
      this.speed += 0.2;
      // 根據當前向性調整 dx, dy 以符合新速度
      const currentSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      if (currentSpeed > 0) {
        this.dx = (this.dx / currentSpeed) * this.speed;
        this.dy = (this.dy / currentSpeed) * this.speed;
      }
    }
  }

  update(deltaTime) {
    const factor = deltaTime / 16.67; // 以 60FPS (~16.67ms) 為基準計算比例

    this.x += this.dx * factor;
    this.y += this.dy * factor;

    let hitBottom = false;

    // 碰撞牆壁 (左右)
    if (this.x + this.radius > this.canvas.width) {
      this.x = this.canvas.width - this.radius;
      this.dx = -this.dx;
    } else if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.dx = -this.dx;
    }

    // 碰撞牆壁 (上)
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.dy = -this.dy;
    }

    // 碰撞底部 (Game Over 條件)
    if (this.y + this.radius > this.canvas.height) {
      hitBottom = true;
    }

    return hitBottom;
  }

  draw(ctx) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#f0f"; // neon-magenta
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0; // 重置
  }
}
