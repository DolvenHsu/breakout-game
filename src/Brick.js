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
  }

  draw(ctx) {
    if (this.status === 1) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color.glow;
      ctx.fillStyle = this.color.fill;
      
      ctx.beginPath();
      // 繪製有圓角的磚塊增加精緻感
      ctx.roundRect(this.x, this.y, this.width, this.height, 4);
      ctx.fill();
      ctx.closePath();
      
      ctx.shadowBlur = 0; // 重置
    }
  }
}

export function buildLevel(canvas, rows, cols) {
  const bricks = [];
  const padding = 10;
  // 頂部與兩側邊界偏移
  const offsetTop = 80;
  const offsetLeft = 30;
  
  // 計算一塊磚塊寬度：總寬 - 左右邊界空白 - 所有磚塊間隔，然後除以數量
  const totalPaddingWidth = (cols - 1) * padding;
  const brickWidth = (canvas.width - offsetLeft * 2 - totalPaddingWidth) / cols;
  const brickHeight = 25; // 高度固定

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const brickX = c * (brickWidth + padding) + offsetLeft;
      const brickY = r * (brickHeight + padding) + offsetTop;
      bricks.push(new Brick(brickX, brickY, brickWidth, brickHeight, r));
    }
  }

  return bricks;
}
