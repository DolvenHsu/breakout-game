export default class Brick {
  constructor(x, y, width, height, rowLevel) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.status = 1; // 1: active, 0: broken
    this.rowLevel = rowLevel;

    // 定義不同層級的磚塊顏色
    const colors = [
      { fill: '#ff0055', glow: '#ff0055' },
      { fill: '#ffaa00', glow: '#ffaa00' },
      { fill: '#00ffaa', glow: '#00ffaa' },
      { fill: '#00ccff', glow: '#00ccff' },
      { fill: '#cc00ff', glow: '#cc00ff' }
    ];
    this.color = colors[rowLevel % colors.length];

    // 各類型互斥：先決定型別，避免同一磚塊重複標記
    const roll = Math.random();
    this.hasMissile  = roll < 0.10;                              // 10% 飛彈磚
    this.hasGrow     = !this.hasMissile && roll < 0.20;          // 10% 增大磚
    this.hasMultiball= !this.hasMissile && !this.hasGrow && roll < 0.25; // 5% 分裂磚
  }

  draw(ctx) {
    if (this.status === 1) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color.glow;
      ctx.fillStyle = this.color.fill;

      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height, 4);
      ctx.fill();
      ctx.closePath();

      // 飛彈磚：繪製警告標誌與火箭圖示
      if (this.hasMissile) {
        ctx.shadowBlur = 0;
        // 深色半透明遮罩讓圖示更清晰
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 4);
        ctx.fill();
        ctx.closePath();

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // 火箭本體
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 1, 3, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 火箭頭（朝下）
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.moveTo(cx, cy + 8);
        ctx.lineTo(cx - 3, cy + 4);
        ctx.lineTo(cx + 3, cy + 4);
        ctx.closePath();
        ctx.fill();

        // 火箭尾翼
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy - 4);
        ctx.lineTo(cx - 6, cy - 8);
        ctx.lineTo(cx - 1, cy - 5);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 3, cy - 4);
        ctx.lineTo(cx + 6, cy - 8);
        ctx.lineTo(cx + 1, cy - 5);
        ctx.closePath();
        ctx.fill();

        // 閃爍外框
        ctx.strokeStyle = '#ff4400';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ff4400';
        ctx.beginPath();
        ctx.roundRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2, 4);
        ctx.stroke();
      }

      // 增大磚：繪製綠色「+」圖示
      if (this.hasGrow) {
        ctx.shadowBlur = 0;
        // 半透明深色遮罩
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 4);
        ctx.fill();
        ctx.closePath();

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const arm = 6;
        const thick = 2.5;

        // 「+」符號
        ctx.fillStyle = '#00ff88';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ff88';
        // 橫條
        ctx.fillRect(cx - arm, cy - thick, arm * 2, thick * 2);
        // 直條
        ctx.fillRect(cx - thick, cy - arm, thick * 2, arm * 2);

        // 外框
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2, 4);
        ctx.stroke();
      }

      // 分裂磚：繪製藍色雙球圖示
      if (this.hasMultiball) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 4);
        ctx.fill();
        ctx.closePath();

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        ctx.shadowBlur = 8;
        ctx.shadowColor = '#44aaff';
        ctx.fillStyle = '#44aaff';
        // 左球
        ctx.beginPath();
        ctx.arc(cx - 6, cy, 4, 0, Math.PI * 2);
        ctx.fill();
        // 右球
        ctx.beginPath();
        ctx.arc(cx + 6, cy, 4, 0, Math.PI * 2);
        ctx.fill();
        // 分叉箭頭（小三角示意分裂方向）
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 7);
        ctx.lineTo(cx - 3, cy - 3);
        ctx.lineTo(cx + 3, cy - 3);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#44aaff';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#44aaff';
        ctx.beginPath();
        ctx.roundRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2, 4);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
    }
  }
}

export function buildLevel(canvas, rows, cols) {
  const bricks = [];
  const padding = 10;
  const offsetTop = 80;
  const offsetLeft = 30;

  const totalPaddingWidth = (cols - 1) * padding;
  const brickWidth = (canvas.width - offsetLeft * 2 - totalPaddingWidth) / cols;
  const brickHeight = 25;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const brickX = c * (brickWidth + padding) + offsetLeft;
      const brickY = r * (brickHeight + padding) + offsetTop;
      bricks.push(new Brick(brickX, brickY, brickWidth, brickHeight, r));
    }
  }

  // 確保每關至少各有一個特殊磚，不足時從普通磚中隨機挑一個強制轉換
  const ensure = (prop, setter) => {
    if (!bricks.some(b => b[prop])) {
      // 從普通磚（三種特殊屬性都沒有）裡隨機選一個
      const normals = bricks.filter(b => !b.hasMissile && !b.hasGrow && !b.hasMultiball);
      const target = normals[Math.floor(Math.random() * normals.length)];
      if (target) setter(target);
    }
  };

  ensure('hasMissile',  b => { b.hasMissile = true; });
  ensure('hasGrow',     b => { b.hasGrow    = true; });
  ensure('hasMultiball',b => { b.hasMultiball = true; });

  return bricks;
}
